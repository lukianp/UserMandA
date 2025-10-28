/**
 * Systematic Test Fixes Script
 * Applies high-ROI patterns across the codebase
 */

const fs = require('fs');
// const path = require('path');

// FIX 1: Add notificationService mock to setupTests.ts
const setupTestsPath = 'src/test-utils/setupTests.ts';
let setupTests = fs.readFileSync(setupTestsPath, 'utf8');

if (!setupTests.includes('notificationService')) {
  const errorHandlingMockEnd = setupTests.indexOf('}));\n\n// Note: The following services');
  if (errorHandlingMockEnd > 0) {
    const insertPos = errorHandlingMockEnd + 6;
    const notificationMock = `
jest.mock('src/renderer/services/notificationService', () => {
  const mockNotificationService = {
    show: jest.fn(),
    dismiss: jest.fn(),
    clear: jest.fn(),
    subscribe: jest.fn(() => jest.fn()), // Returns unsubscribe function
    getAll: jest.fn(() => []),
  };
  return {
    getNotificationService: jest.fn(() => mockNotificationService),
    NotificationType: {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
    },
  };
});

`;
    setupTests = setupTests.slice(0, insertPos) + notificationMock + setupTests.slice(insertPos);
    fs.writeFileSync(setupTestsPath, setupTests);
    console.log('✓ Added notificationService mock to setupTests.ts');
  }
}

console.log('Test fixes applied successfully!');
