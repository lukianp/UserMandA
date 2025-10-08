/**
 * Renderer Process Entry Point
 * This file initializes the React application and mounts it to the DOM
 */

import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './renderer/App';

console.log('🚀 M&A Discovery Suite - Renderer Process Starting...');

// Debug: Check what electronAPI is available
console.log('window.electronAPI:', window.electronAPI);
console.log('window.electronAPI keys:', window.electronAPI ? Object.keys(window.electronAPI) : 'UNDEFINED');

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
