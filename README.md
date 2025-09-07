# Claude Code Web Shell

A web-based terminal interface for Claude Code that allows you to interact with Claude Code through your browser.

## Screenshot

![Claude Code Web Shell Interface](./screenshot-dark-theme.png)

*Modern dark-themed terminal interface with Apple/Google inspired design*

## Features

- **Modern UI**: Beautiful Apple/Google inspired design with glassmorphism effects
- **Dark Theme**: Sleek dark theme optimized for extended coding sessions
- **Light/Dark Toggle**: Easy theme switching with persistent preferences
- **Web Terminal**: Full-featured terminal emulation using xterm.js with theme-aware colors
- **Authentication**: Simple login system to prevent unauthorized access
- **Real-time Communication**: WebSocket-based communication for responsive terminal interaction
- **Claude Code Integration**: Directly spawns and communicates with Claude Code processes
- **Responsive Design**: Mobile-friendly interface that works on all screen sizes
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

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

## Theme System

The application features a modern theme system with:

- **Default Dark Theme**: Optimized for coding with reduced eye strain
- **Light Theme Option**: Clean, bright interface for different preferences  
- **Theme Toggle**: Easy switching via the toggle button in the header
- **Persistent Preferences**: Your theme choice is saved and restored across sessions
- **System Preference Detection**: Automatically detects your OS theme preference as fallback
- **Smooth Transitions**: Elegant animations when switching between themes
- **Terminal Integration**: xterm.js terminal colors automatically adapt to the selected theme

### Theme Features

- **CSS Variables**: Comprehensive design token system for consistent styling
- **Glassmorphism Effects**: Modern translucent elements with blur effects
- **Material Design**: Google's Material Design principles with Apple's attention to detail
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: High contrast ratios and proper focus management

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

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.