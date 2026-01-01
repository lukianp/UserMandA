#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all test files with the syntax error pattern
const testFiles = [
  'src/renderer/views/advanced/AssetLifecycleView.test.tsx',
  'src/renderer/views/advanced/BulkOperationsView.test.tsx',
  'src/renderer/views/advanced/CapacityPlanningView.test.tsx',
  'src/renderer/views/advanced/ChangeManagementView.test.tsx',
  'src/renderer/views/advanced/CloudMigrationPlannerView.test.tsx',
  'src/renderer/views/advanced/CustomFieldsView.test.tsx',
];

let fixedCount = 0;

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Fix the malformed object literal pattern
  const originalContent = content;
  content = content.replace(
    /const mockHookDefaults = createUniversalDiscoveryHook\(\); as any,/g,
    'const mockHookDefaults = {\n    ...createUniversalDiscoveryHook() as any,'
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✓ Fixed ${filePath}`);
    fixedCount++;
  } else {
    console.log(`  No changes needed in ${filePath}`);
  }
});

console.log(`\nFixed ${fixedCount} files.`);
