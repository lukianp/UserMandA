/**
 * Renderer Process Entry Point
 * This file initializes the React application and mounts it to the DOM
 */

import './index.css';
import './renderer/styles/tailwind.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Register AG Grid modules (required for AG Grid v31+)
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

// Register all AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Set AG Grid Enterprise license key (removes trial watermark)
// Note: Replace with actual license key for production use
// LicenseManager.setLicenseKey('your-ag-grid-license-key-here');

import App from './renderer/App';

console.log('🚀 Enterprise Discovery & Migration Suite - Renderer Process Starting...');

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


