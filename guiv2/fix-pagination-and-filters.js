const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to fix pagination and filter state issues in test mocks
 * This addresses errors like:
 * - "Cannot read properties of null (reading 'total')"
 * - "Cannot read properties of null (reading 'searchText')"
 */

function fixTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  // Fix pagination: null -> proper object
  const paginationNullPattern = /pagination:\s*null,/g;
  if (paginationNullPattern.test(content)) {
    content = content.replace(paginationNullPattern, 'pagination: { page: 0, pageSize: 50, total: 0 },');
    appliedFixes.push(`  - Fixed pagination: null -> pagination: { page: 0, pageSize: 50, total: 0 }`);
    modified = true;
  }

  // Add missing pagination if it doesn't exist and mockHookDefaults is present
  if (content.includes('mockHookDefaults') && !content.includes('pagination:')) {
    // Find the mockHookDefaults object and add pagination before the closing brace
    const pattern = /(const mockHookDefaults = \{[^}]*)(}\s*;)/s;
    if (pattern.test(content)) {
      content = content.replace(pattern, '$1  pagination: { page: 0, pageSize: 50, total: 0 },\n  $2');
      appliedFixes.push(`  - Added missing pagination property`);
      modified = true;
    }
  }

  // Fix filters that are null instead of objects with searchText
  const filtersNullPattern = /filters:\s*null,/g;
  if (filtersNullPattern.test(content)) {
    content = content.replace(filtersNullPattern, 'filters: { searchText: \'\' },');
    appliedFixes.push(`  - Fixed filters: null -> filters: { searchText: '' }`);
    modified = true;
  }

  // Ensure filters object has searchText property
  const filtersPattern = /filters:\s*\{([^}]*)\}/g;
  let filtersMatches = content.match(filtersPattern);
  if (filtersMatches) {
    filtersMatches.forEach(match => {
      if (!match.includes('searchText')) {
        const newFilters = match.replace('}', ', searchText: \'\' }');
        content = content.replace(match, newFilters);
        appliedFixes.push(`  - Added searchText to filters object`);
        modified = true;
      }
    });
  }

  // Add missing refreshData alias for loadData
  if (content.includes('loadData: jest.fn()') && !content.includes('refreshData:')) {
    content = content.replace(/loadData: jest\.fn\(\),/g, 'loadData: jest.fn(),\n    refreshData: jest.fn(),');
    appliedFixes.push(`  - Added refreshData function (alias for loadData)`);
    modified = true;
  }

  // Fix sortConfig that might be null
  const sortConfigNullPattern = /sortConfig:\s*null,/g;
  if (sortConfigNullPattern.test(content)) {
    content = content.replace(sortConfigNullPattern, 'sortConfig: { key: \'\', direction: \'asc\' },');
    appliedFixes.push(`  - Fixed sortConfig: null -> sortConfig: { key: '', direction: 'asc' }`);
    modified = true;
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
  console.log('Fixing pagination and filter state issues in test mocks');
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
