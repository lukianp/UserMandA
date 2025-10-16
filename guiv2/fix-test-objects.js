const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Script to fix object properties in test mock objects
 * This addresses errors like "Cannot read properties of X (reading 'Y')"
 */

function fixTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  // Fix filterOptions to have all necessary properties
  const filterOptionsPattern = /filterOptions:\s*\{[^}]*\}/g;
  const matches = content.match(filterOptionsPattern);
  if (matches) {
    matches.forEach(match => {
      // Ensure all common filter option arrays exist
      let newFilterOptions = match;
      const properties = ['deviceTypes', 'vendors', 'statuses', 'locations', 'categories', 'departments', 'roles', 'types'];

      properties.forEach(prop => {
        if (!newFilterOptions.includes(prop + ':')) {
          // Add missing property before the closing brace
          newFilterOptions = newFilterOptions.replace('}', `, ${prop}: []}`);
        }
      });

      if (newFilterOptions !== match) {
        content = content.replace(match, newFilterOptions);
        appliedFixes.push(`  - Enhanced filterOptions with missing properties`);
        modified = true;
      }
    });
  }

  // Fix stats objects to ensure they have all numeric properties
  const statsPattern = /stats:\s*\{[^}]*\},/g;
  const statsMatches = content.match(statsPattern);
  if (statsMatches) {
    statsMatches.forEach(match => {
      let newStats = match;
      const properties = ['total', 'active', 'inactive', 'critical', 'warning', 'info', 'online', 'offline', 'onlinePercentage', 'warrantyExpiring', 'warrantyExpired', 'highUtilization', 'compliant', 'nonCompliant', 'pending', 'resolved', 'unresolved'];

      properties.forEach(prop => {
        if (!newStats.includes(prop + ':')) {
          // Add missing property before the closing brace
          const value = prop === 'onlinePercentage' ? "'0'" : '0';
          newStats = newStats.replace('},', `, ${prop}: ${value}},`);
        }
      });

      if (newStats !== match) {
        content = content.replace(match, newStats);
        appliedFixes.push(`  - Enhanced stats object with missing properties`);
        modified = true;
      }
    });
  }

  // Fix progress objects - they should be objects with {current, total, message, percentage}
  const progressObjectPattern = /progress:\s*0,/g;
  if (progressObjectPattern.test(content)) {
    content = content.replace(progressObjectPattern, 'progress: { current: 0, total: 100, message: \'\', percentage: 0 },');
    appliedFixes.push(`  - Fixed progress: 0 -> progress: { current: 0, total: 100, message: '', percentage: 0 }`);
    modified = true;
  }

  // Add missing updateFilter if clearFilters exists
  if (content.includes('clearFilters: jest.fn()') && !content.includes('updateFilter:')) {
    content = content.replace(/clearFilters: jest\.fn\(\),/g, 'updateFilter: jest.fn(),\n    clearFilters: jest.fn(),');
    appliedFixes.push(`  - Added missing updateFilter function`);
    modified = true;
  }

  // Add missing setSelectedDevices if selectedDevices exists
  if (content.includes('selectedDevices: []') && !content.includes('setSelectedDevices:')) {
    content = content.replace(/selectedDevices: \[\],/g, 'selectedDevices: [],\n    setSelectedDevices: jest.fn(),');
    appliedFixes.push(`  - Added missing setSelectedDevices function`);
    modified = true;
  }

  // Add missing setSelectedComputers if selectedComputers exists
  if (content.includes('selectedComputers: []') && !content.includes('setSelectedComputers:')) {
    content = content.replace(/selectedComputers: \[\],/g, 'selectedComputers: [],\n    setSelectedComputers: jest.fn(),');
    appliedFixes.push(`  - Added missing setSelectedComputers function`);
    modified = true;
  }

  // Add missing setSelectedUsers if selectedUsers exists
  if (content.includes('selectedUsers: []') && !content.includes('setSelectedUsers:')) {
    content = content.replace(/selectedUsers: \[\],/g, 'selectedUsers: [],\n    setSelectedUsers: jest.fn(),');
    appliedFixes.push(`  - Added missing setSelectedUsers function`);
    modified = true;
  }

  // Add missing setSelectedGroups if selectedGroups exists
  if (content.includes('selectedGroups: []') && !content.includes('setSelectedGroups:')) {
    content = content.replace(/selectedGroups: \[\],/g, 'selectedGroups: [],\n    setSelectedGroups: jest.fn(),');
    appliedFixes.push(`  - Added missing setSelectedGroups function`);
    modified = true;
  }

  // Add missing loadData function
  if (!content.includes('loadData:') && content.includes('mockHookDefaults')) {
    content = content.replace(/exportData: jest\.fn\(\),/g, 'loadData: jest.fn(),\n    exportData: jest.fn(),');
    appliedFixes.push(`  - Added missing loadData function`);
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
  console.log('Fixing object properties in test mock objects');
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
