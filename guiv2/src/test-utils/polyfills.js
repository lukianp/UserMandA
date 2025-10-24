/**
 * Polyfills that must load before any test code
 * This file should be in setupFiles, not setupFilesAfterEnv
 */

// TextEncoder/TextDecoder polyfill for Node environment
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}
