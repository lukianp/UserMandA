/**
 * Fix Discovered Views - Replace loadCsvData with reload
 *
 * This script updates all discovered view files to use the correct
 * method name from useCsvDataLoader hook.
 */

const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/renderer/views/discovered');

// Get all .tsx files in the discovered views directory
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('DiscoveredView.tsx'));

console.log(`Found ${files.length} discovered view files to process\n`);

let fixedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file needs fixing
  if (!content.includes('loadCsvData')) {
    console.log(`✓ SKIP: ${file} (already correct)`);
    skippedCount++;
    return;
  }

  // Replace loadCsvData with reload in all occurrences
  const originalContent = content;

  // Fix destructuring: loadCsvData, -> reload,
  content = content.replace(/loadCsvData,/g, 'reload,');

  // Fix function call: loadCsvData() -> reload()
  content = content.replace(/loadCsvData\(\)/g, 'reload()');

  // Fix dependency array: [loadCsvData] -> [reload]
  content = content.replace(/\[loadCsvData\]/g, '[reload]');

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ FIXED: ${file}`);
    fixedCount++;
  } else {
    console.log(`✗ ERROR: ${file} (no changes made)`);
  }
});

console.log(`\n========== SUMMARY ==========`);
console.log(`Total files: ${files.length}`);
console.log(`Fixed: ${fixedCount}`);
console.log(`Skipped (already correct): ${skippedCount}`);
console.log(`============================\n`);

