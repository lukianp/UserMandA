/**
 * Global shim for Electron renderer process
 * Provides global and globalThis references for webpack bundles
 */

// Map global to window for browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  window.globalThis = window;
}

module.exports = window;
