const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to fix null properties in test mock objects
 * This addresses the common error: "Cannot read properties of null (reading 'X')"
 */

const fixes = [
  // Fix null columns -> []
  {
    pattern: /columns:\s*null,/g,
    replacement: 'columns: [],',
    description: 'columns: null -> columns: []'
  },
  // Fix null selectedDevices -> []
  {
    pattern: /selectedDevices:\s*null,/g,
    replacement: 'selectedDevices: [],',
    description: 'selectedDevices: null -> selectedDevices: []'
  },
  // Fix null selectedItems -> []
  {
    pattern: /selectedItems:\s*null,/g,
    replacement: 'selectedItems: [],',
    description: 'selectedItems: null -> selectedItems: []'
  },
  // Fix null selectedUsers -> []
  {
    pattern: /selectedUsers:\s*null,/g,
    replacement: 'selectedUsers: [],',
    description: 'selectedUsers: null -> selectedUsers: []'
  },
  // Fix null selectedGroups -> []
  {
    pattern: /selectedGroups:\s*null,/g,
    replacement: 'selectedGroups: [],',
    description: 'selectedGroups: null -> selectedGroups: []'
  },
  // Fix null selectedComputers -> []
  {
    pattern: /selectedComputers:\s*null,/g,
    replacement: 'selectedComputers: [],',
    description: 'selectedComputers: null -> selectedComputers: []'
  },
  // Fix null pingTest -> jest.fn()
  {
    pattern: /pingTest:\s*null,/g,
    replacement: 'pingTest: jest.fn(),',
    description: 'pingTest: null -> pingTest: jest.fn()'
  },
  // Fix null viewConfiguration -> jest.fn()
  {
    pattern: /viewConfiguration:\s*null,/g,
    replacement: 'viewConfiguration: jest.fn(),',
    description: 'viewConfiguration: null -> viewConfiguration: jest.fn()'
  },
  // Fix null viewDetails -> jest.fn()
  {
    pattern: /viewDetails:\s*null,/g,
    replacement: 'viewDetails: jest.fn(),',
    description: 'viewDetails: null -> viewDetails: jest.fn()'
  },
  // Fix null handleAction -> jest.fn()
  {
    pattern: /handleAction:\s*null,/g,
    replacement: 'handleAction: jest.fn(),',
    description: 'handleAction: null -> handleAction: jest.fn()'
  },
  // Fix null filters -> proper object
  {
    pattern: /filters:\s*null,/g,
    replacement: 'filters: { searchText: \'\' },',
    description: 'filters: null -> filters: { searchText: \'\' }'
  },
  // Fix null pagination -> proper object
  {
    pattern: /pagination:\s*null,/g,
    replacement: 'pagination: { page: 0, pageSize: 50, total: 0 },',
    description: 'pagination: null -> pagination: { page: 0, pageSize: 50, total: 0 }'
  },
];

function fixTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  for (const fix of fixes) {
    const matches = content.match(fix.pattern);
    if (matches && matches.length > 0) {
      content = content.replace(fix.pattern, fix.replacement);
      appliedFixes.push(`  - ${fix.description} (${matches.length} occurrence(s))`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✓ Fixed: ${filePath}`);
    appliedFixes.forEach(fix => console.log(fix));
    return true;
  }

  return false;
}

function main() {
  console.log('='.repeat(80));
  console.log('Fixing null properties in test mock objects');
  console.log('='.repeat(80));

  // Find all test files
  const testFiles = glob.sync('src/**/*.test.{ts,tsx}', {
    cwd: __dirname,
    absolute: true
  });

  console.log(`\nFound ${testFiles.length} test files\n`);

  let fixedCount = 0;

  for (const testFile of testFiles) {
    if (fixTestFile(testFile)) {
      fixedCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Summary: Fixed ${fixedCount} out of ${testFiles.length} test files`);
  console.log('='.repeat(80));
}

main();
