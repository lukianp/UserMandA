/**
 * Renderer Process Entry Point - MINIMAL TEST VERSION
 * This file initializes a minimal React app to test if rendering works
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

// Use minimal app for testing
import App from './renderer/App.minimal.test';

console.log('🚀 M&A Discovery Suite - Renderer Process Starting (MINIMAL TEST MODE)...');

// Debug: Check what electronAPI is available
console.log('window.electronAPI:', window.electronAPI);
console.log('window.electronAPI keys:', window.electronAPI ? Object.keys(window.electronAPI) : 'UNDEFINED');

// Wait for DOM to be ready
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ CRITICAL: Failed to find the root element. Check index.html');
  document.body.innerHTML = '<div style="background:red;color:white;padding:20px;font-family:monospace;"><h1>ERROR: Root element not found!</h1><p>The DOM is missing the #root div element.</p></div>';
  throw new Error('Failed to find the root element. Check index.html');
}

console.log('✅ Root element found:', rootElement);

// Create React root and render the app
try {
  const root = createRoot(rootElement);
  console.log('✅ React root created');

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('✅ React app render() called - check for component mount');
} catch (error) {
  console.error('❌ CRITICAL ERROR during React mount:', error);
  document.body.innerHTML = `<div style="background:red;color:white;padding:20px;font-family:monospace;"><h1>ERROR: React failed to mount!</h1><pre>${error instanceof Error ? error.message : String(error)}</pre></div>`;
  throw error;
}

console.log('✅ Renderer setup complete');
