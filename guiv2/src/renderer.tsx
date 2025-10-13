/**
 * Renderer Process Entry Point
 * This file initializes the React application and mounts it to the DOM
 */

import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './renderer/App';

console.log('========================================');
console.log('🚀 M&A Discovery Suite - Renderer Process Starting...');
console.log('[RENDERER] window.electronAPI:', typeof window.electronAPI);
console.log('[RENDERER] window.electronAPI exists:', !!window.electronAPI);
console.log('[RENDERER] window.electronAPI keys:', window.electronAPI ? Object.keys(window.electronAPI).slice(0, 10).join(', ') + '...' : 'UNDEFINED');

// Debug: Check all window properties for electron-related keys
const electronKeys = Object.keys(window).filter(k => k.toLowerCase().includes('electron'));
console.log('[RENDERER] All electron-related window keys:', electronKeys);
console.log('========================================');

// Development mode fix: If electronAPI is missing in dev mode, try reloading after a delay
// This helps with HMR/webpack-dev-server timing issues where preload might not load on first render
if (!window.electronAPI && process.env.NODE_ENV === 'development') {
  const reloadAttempts = parseInt(sessionStorage.getItem('electronAPIReloadAttempts') || '0');
  if (reloadAttempts < 2) {
    console.warn('[RENDERER] ⚠️ electronAPI not found in development mode. Attempting reload...');
    sessionStorage.setItem('electronAPIReloadAttempts', String(reloadAttempts + 1));
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } else {
    console.error('[RENDERER] ❌ electronAPI still not available after', reloadAttempts, 'reload attempts.');
    console.error('[RENDERER] This is expected in development mode with webpack-dev-server.');
    console.error('[RENDERER] Solution: Use production build (npm run package) for full functionality.');
    sessionStorage.removeItem('electronAPIReloadAttempts');
  }
} else if (window.electronAPI) {
  // Clear reload attempts counter when electronAPI is available
  sessionStorage.removeItem('electronAPIReloadAttempts');
}

// Wait for DOM to be ready
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. Check index.html');
}

// Create React root and render the app
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ React app mounted successfully');
