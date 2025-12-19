const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

const isProd = app.isPackaged;

let mainWindow;

// Custom protocol handler to serve static files
function serveStatic() {
  protocol.handle('app', (request) => {
    const urlPath = request.url.slice('app://'.length);
    let filePath = path.join(__dirname, '..', 'out', urlPath);
    
    // Default to index.html for directory requests
    if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', 'out', 'index.html');
    }
    
    return new Response(fs.readFileSync(filePath), {
      headers: { 'Content-Type': getMimeType(filePath) }
    });
  });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false,
    title: 'Resume Builder',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isProd) {
    // Load from custom protocol in production
    mainWindow.loadURL('app://./index.html');
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, navUrl) => {
    if (navUrl.startsWith('http') && !navUrl.includes('localhost')) {
      event.preventDefault();
      shell.openExternal(navUrl);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (isProd) {
    serveStatic();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});