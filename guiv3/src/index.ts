import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { registerIpcHandlers, shutdownIpcHandlers } from './main/ipcHandlers';

// Compute paths at runtime based on where the app is actually running
const MAIN_WINDOW_WEBPACK_ENTRY = 'file://' + path.resolve(__dirname, '../renderer/main_window/index.html');
const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = path.resolve(__dirname, '../preload/index.js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async (): Promise<BrowserWindow> => {
  // Debug: Log webpack entry points
  console.log('[MAIN] ========================================');
  console.log('[MAIN] Webpack Entry Points:');
  console.log('[MAIN] MAIN_WINDOW_WEBPACK_ENTRY:', MAIN_WINDOW_WEBPACK_ENTRY);
  console.log('[MAIN] MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY:', MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);
  console.log('[MAIN] ========================================');

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 900,
    width: 1400,
    minHeight: 700,
    minWidth: 1200,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: process.env.NODE_ENV === 'production',
    },
    backgroundColor: '#1a1a1a',
    show: true, // Changed to show immediately for debugging
  });

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Set CSP headers to allow data URIs for images and fonts (Tailwind CSS and AG Grid use them)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "img-src 'self' data: blob:; " +
          "font-src 'self' data: blob:; " +
          "style-src 'self' 'unsafe-inline'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' ws: wss:;"
        ]
      }
    });
  });

  // Note: Permission handler not available in this Electron version, but security is enforced via other means

  // Disable dangerous features
  mainWindow.webContents.session.setPreloads([]);
  mainWindow.webContents.session.setSpellCheckerLanguages([]);
  mainWindow.webContents.session.setSpellCheckerEnabled(false);

  // Add security event handlers
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' }; // Block new windows
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://' && parsedUrl.origin !== 'http://localhost:3000') {
      event.preventDefault(); // Block external navigation except localhost for dev
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development or when explicitly requested
  const shouldOpenDevTools =
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG === 'true' ||
    process.env.OPEN_DEVTOOLS === 'true';

  if (shouldOpenDevTools) {
    console.log('[MAIN] Opening DevTools (debug mode enabled)');
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // Create window first
  const mainWindow = await createWindow();

  // Register IPC handlers with window reference for stream events
  await registerIpcHandlers(mainWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup before quit
app.on('before-quit', async (event) => {
  event.preventDefault();
  await shutdownIpcHandlers();
  app.exit(0);
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
