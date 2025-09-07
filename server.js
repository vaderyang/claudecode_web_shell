const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DEFAULT_USERNAME = process.env.USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.PASSWORD || 'admin123';

let hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'claude-terminal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const authenticateUser = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  }
  res.redirect('/login');
};

app.get('/', authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terminal.html'));
});

app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === DEFAULT_USERNAME && await bcrypt.compare(password, hashedPassword)) {
    req.session.authenticated = true;
    req.session.userId = uuidv4();
    res.redirect('/');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.post('/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (await bcrypt.compare(currentPassword, hashedPassword)) {
    hashedPassword = bcrypt.hashSync(newPassword, 10);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Current password is incorrect' });
  }
});

app.get('/api/file/*', authenticateUser, async (req, res) => {
  try {
    const filePath = req.params[0];
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content, path: filePath });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Provide minimal environment info to the client for safe path resolution
app.get('/api/info', authenticateUser, (req, res) => {
  res.json({ cwd: process.cwd(), home: process.env.HOME || '' });
});

const terminals = new Map();
const userSessions = new Map();

wss.on('connection', (ws, req) => {
  const sessionCookie = req.headers.cookie;
  if (!sessionCookie) {
    ws.close(1008, 'No session');
    return;
  }

  const terminalId = uuidv4();
  const sessionId = req.headers['sec-websocket-protocol'] || 'default';
  
  if (!userSessions.has(sessionId)) {
    userSessions.set(sessionId, new Map());
  }
  
  const ptyProcess = pty.spawn('claude', [], {
    name: 'xterm-color',
    cols: 120,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });

  terminals.set(terminalId, ptyProcess);
  userSessions.get(sessionId).set(terminalId, ptyProcess);
  
  ws.terminalId = terminalId;
  ws.sessionId = sessionId;

  ptyProcess.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data, terminalId }));
    }
  });

  ptyProcess.on('exit', () => {
    terminals.delete(terminalId);
    if (userSessions.has(sessionId)) {
      userSessions.get(sessionId).delete(terminalId);
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', terminalId }));
    }
  });

  ws.on('message', (message) => {
    try {
      const { type, data, targetTerminal } = JSON.parse(message);
      
      const targetPty = targetTerminal ? terminals.get(targetTerminal) : ptyProcess;
      
      if (type === 'input') {
        targetPty.write(data);
      } else if (type === 'resize') {
        targetPty.resize(data.cols, data.rows);
      } else if (type === 'create_terminal') {
        const newTerminalId = uuidv4();
        const newPtyProcess = pty.spawn('claude', [], {
          name: 'xterm-color',
          cols: data.cols || 120,
          rows: data.rows || 30,
          cwd: process.cwd(),
          env: process.env
        });
        
        terminals.set(newTerminalId, newPtyProcess);
        userSessions.get(sessionId).set(newTerminalId, newPtyProcess);
        
        newPtyProcess.on('data', (data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'output', data, terminalId: newTerminalId }));
          }
        });
        
        newPtyProcess.on('exit', () => {
          terminals.delete(newTerminalId);
          if (userSessions.has(sessionId)) {
            userSessions.get(sessionId).delete(newTerminalId);
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'exit', terminalId: newTerminalId }));
          }
        });
        
        ws.send(JSON.stringify({ type: 'terminal_created', terminalId: newTerminalId }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    if (terminals.has(terminalId)) {
      terminals.get(terminalId).kill();
      terminals.delete(terminalId);
    }
    if (userSessions.has(sessionId)) {
      for (const [tId, pty] of userSessions.get(sessionId)) {
        if (terminals.has(tId)) {
          terminals.get(tId).kill();
          terminals.delete(tId);
        }
      }
      userSessions.delete(sessionId);
    }
  });

  setTimeout(() => {
    ws.send(JSON.stringify({ type: 'ready', terminalId }));
  }, 100);
});

server.listen(PORT, () => {
  console.log(`Claude Code Web Shell running on http://localhost:${PORT}`);
  console.log(`Default login: ${DEFAULT_USERNAME} / ${DEFAULT_PASSWORD}`);
});