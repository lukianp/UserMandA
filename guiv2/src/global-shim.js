// Global shim for renderer process
// This provides 'global' as 'window' for npm packages that expect Node.js environment
module.exports = typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this;
