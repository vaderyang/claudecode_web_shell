# Claude Code Web Shell

A web-based terminal interface for Claude Code that allows you to interact with Claude Code through your browser.

## Features

- **Web Terminal**: Full-featured terminal emulation using xterm.js
- **Authentication**: Simple login system to prevent unauthorized access
- **Real-time Communication**: WebSocket-based communication for responsive terminal interaction
- **Claude Code Integration**: Directly spawns and communicates with Claude Code processes

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Access the Web Shell**:
   - Open your browser and go to `http://localhost:3000`
   - Login with default credentials: `admin` / `admin123`

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `USERNAME`: Login username (default: admin)
- `PASSWORD`: Login password (default: admin123)
- `SESSION_SECRET`: Session encryption secret

### Example with custom credentials:
```bash
USERNAME=myuser PASSWORD=mypassword npm start
```

## Security Notes

- Change default credentials in production
- Use HTTPS in production environments
- Set a strong SESSION_SECRET
- Consider implementing rate limiting for login attempts

## Requirements

- Node.js 16+
- Claude Code CLI installed and accessible in PATH

## Architecture

- **Backend**: Express.js server with WebSocket support
- **Terminal**: node-pty for pseudo-terminal management  
- **Frontend**: xterm.js for terminal emulation
- **Authentication**: Express sessions with bcrypt password hashing

## Development

```bash
npm run dev  # Uses nodemon for auto-restart
```