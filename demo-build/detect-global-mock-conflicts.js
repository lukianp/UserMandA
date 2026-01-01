/**
 * Detect Global Mock Conflicts
 *
 * This script analyzes the test suite to identify potential conflicts between
 * global mocks in setupTests.ts and individual service test files.
 *
 * A conflict occurs when:
 * 1. A service is globally mocked in setupTests.ts
 * 2. The same service has its own .test.ts file attempting to test it directly
 *
 * Usage: node detect-global-mock-conflicts.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const SETUP_TESTS_PATH = 'src/test-utils/setupTests.ts';
const SRC_DIR = 'src';

/**
 * Extract global mocks from setupTests.ts
 */
function extractGlobalMocks(setupTestsPath) {
  const content = fs.readFileSync(setupTestsPath, 'utf8');
  const mocks = [];

  // Match jest.mock('path/to/service', () => ...)
  const mockRegex = /jest\.mock\(['"]([^'"]+)['"]/g;
  let match;

  while ((match = mockRegex.exec(content)) !== null) {
    const mockPath = match[1];
    mocks.push({
      path: mockPath,
      serviceName: extractServiceName(mockPath),
      line: getLineNumber(content, match.index)
    });
  }

  return mocks;
}

/**
 * Extract service name from mock path
 */
function extractServiceName(mockPath) {
  const parts = mockPath.split('/');
  const filename = parts[parts.length - 1];

  // Remove 'Service' suffix if present
  return filename.replace(/Service$/, '');
}

/**
 * Get line number for a character position
 */
function getLineNumber(content, position) {
  return content.substring(0, position).split('\n').length;
}

/**
 * Find all test files
 */
async function findTestFiles(srcDir) {
  const pattern = path.join(srcDir, '**/*.test.ts').replace(/\\/g, '/');
  const files = await glob(pattern);

  return files.map(file => ({
    path: file,
    serviceName: extractServiceNameFromTestFile(file)
  }));
}

/**
 * Extract service name from test file path
 */
function extractServiceNameFromTestFile(filePath) {
  const filename = path.basename(filePath);
  // Remove .test.ts extension and Service suffix
  return filename.replace(/\.test\.ts$/, '').replace(/Service$/, '');
}

/**
 * Detect conflicts
 */
function detectConflicts(globalMocks, testFiles) {
  const conflicts = [];

  for (const mock of globalMocks) {
    for (const testFile of testFiles) {
      // Check if service names match (case-insensitive)
      if (mock.serviceName.toLowerCase() === testFile.serviceName.toLowerCase()) {
        conflicts.push({
          serviceName: mock.serviceName,
          globalMockPath: mock.path,
          globalMockLine: mock.line,
          testFilePath: testFile.path
        });
      }
    }
  }

  return conflicts;
}

/**
 * Check if a test file is actually testing the service
 */
function isActuallyTestingService(testFilePath, serviceName) {
  const content = fs.readFileSync(testFilePath, 'utf8');

  // Look for imports of the service
  const importRegex = new RegExp(`import.*${serviceName}.*from`, 'i');
  return importRegex.test(content);
}

/**
 * Generate report
 */
function generateReport(conflicts) {
  console.log('\n=================================================');
  console.log('   Global Mock Conflict Detection Report');
  console.log('=================================================\n');

  if (conflicts.length === 0) {
    console.log('✅ No conflicts detected!\n');
    console.log('All service tests can access their implementations without');
    console.log('global mock interference.\n');
    return;
  }

  console.log(`⚠️  Found ${conflicts.length} potential conflict(s):\n`);

  conflicts.forEach((conflict, index) => {
    console.log(`${index + 1}. ${conflict.serviceName}Service`);
    console.log(`   Global Mock: ${conflict.globalMockPath} (line ${conflict.globalMockLine})`);
    console.log(`   Test File:   ${conflict.testFilePath}`);

    // Verify if it's actually testing the service
    const isTesting = isActuallyTestingService(
      conflict.testFilePath,
      conflict.serviceName + 'Service'
    );

    if (isTesting) {
      console.log('   Status:      🔴 CONFLICT - Test cannot access real service');
      console.log('   Action:      Remove global mock or move to individual test mock');
    } else {
      console.log('   Status:      ⚪ Possible false positive - Test may not import service');
    }
    console.log('');
  });

  console.log('\n=================================================');
  console.log('Recommendations:');
  console.log('=================================================\n');
  console.log('For services with their own test files:');
  console.log('1. Remove the global mock from setupTests.ts');
  console.log('2. Add service-specific mocks in the test file itself');
  console.log('3. Add __esModule: true to mocks for better compatibility');
  console.log('4. Mock dependencies (like loggingService) in the test file\n');
  console.log('Example pattern (see cacheService.test.ts):');
  console.log('  jest.mock(\'./loggingService\', () => ({');
  console.log('    __esModule: true,');
  console.log('    default: { info: jest.fn(), warn: jest.fn(), ... }');
  console.log('  }));\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Scanning for global mock conflicts...\n');

    // Extract global mocks
    const globalMocks = extractGlobalMocks(SETUP_TESTS_PATH);
    console.log(`Found ${globalMocks.length} global mock(s) in setupTests.ts`);

    // Find test files
    const testFiles = await findTestFiles(SRC_DIR);
    console.log(`Found ${testFiles.length} test file(s)`);

    // Detect conflicts
    const conflicts = detectConflicts(globalMocks, testFiles);

    // Generate report
    generateReport(conflicts);

    // Exit with appropriate code
    process.exit(conflicts.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { detectConflicts, extractGlobalMocks, findTestFiles };
