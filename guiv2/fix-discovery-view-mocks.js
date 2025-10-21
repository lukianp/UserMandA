#!/usr/bin/env node
/**
 * Automated Fix Script for Discovery View Test Mocks
 * Fixes common mock structure issues in discovery view tests
 */

const fs = require('fs');
const path = require('path');

const discoveryViewsDir = path.join(__dirname, 'src', 'renderer', 'views', 'discovery');

let filesFixed = 0;
let filesSkipped = 0;

/**
 * Fix the mock structure for discovery views
 */
function fixDiscoveryMock(content, fileName) {
  // Pattern 1: Fix old-style mock with isRunning/isCancelling
  if (content.includes('isRunning: false') && content.includes('isCancelling: false')) {
    console.log(`  Fixing ${fileName}...`);

    // Replace the old mock pattern with a minimal correct one
    const pattern = /const mockHookDefaults = \{[^}]*isRunning: false[^}]*\};/s;

    const newMock = `const mockHookDefaults = {
    // State
    config: {
      id: 'test-config',
      name: 'Test Config',
      tenantId: 'test-tenant',
      timeout: 600000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview' as const,
    filter: { searchText: '' },
    error: null,

    // Data
    columns: [],
    filteredData: [],
    stats: {},

    // Actions
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    updateConfig: jest.fn(),
    setActiveTab: jest.fn(),
    updateFilter: jest.fn(),
    clearError: jest.fn(),
    exportToCSV: jest.fn(),
    exportToExcel: jest.fn(),
  };`;

    const fixed = content.replace(pattern, newMock);
    return fixed !== content ? fixed : null;
  }

  return null;
}

// Find all discovery view test files
const files = fs.readdirSync(discoveryViewsDir)
  .filter(f => f.endsWith('DiscoveryView.test.tsx'))
  .map(f => path.join(discoveryViewsDir, f));

console.log(`\n🔧 Fixing Discovery View Test Mocks...\n`);
console.log(`Found ${files.length} discovery view test files\n`);

files.forEach(filePath => {
  const fileName = path.basename(filePath);

  // Skip already fixed files
  if (fileName.includes('Intune') || fileName.includes('PowerPlatform')) {
    console.log(`⏭️  ${fileName} - Already fixed manually`);
    filesSkipped++;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixDiscoveryMock(content, fileName);

  if (fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ ${fileName} - Fixed`);
    filesFixed++;
  } else {
    console.log(`⏭️  ${fileName} - No changes needed`);
    filesSkipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${filesFixed} files`);
console.log(`   ⏭️  Skipped: ${filesSkipped} files`);
console.log(`\n✨ Done! Run tests to verify fixes.\n`);
