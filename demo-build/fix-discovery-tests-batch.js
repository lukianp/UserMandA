/**
 * Batch fix common issues in discovery view tests
 */

const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, 'src', 'renderer', 'views', 'discovery');

// Common fixes
const fixes = [
  {
    name: 'Fix results → result for hooks that use singular',
    pattern: /results:\s*\[([^\]]+)\]/g,
    replace: 'result: { vms: [], virtualSwitches: [], vhds: [], hosts: [], users: [], groups: [], data: [] }'
  }
];

function fixTestFile(filePath) {
  if (!filePath.endsWith('.test.tsx')) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: results → result when mocking hooks
  // Only apply to test files, not views
  const resultsArrayPattern = /useHyperVDiscoveryLogic\.mockReturnValue\(\{[\s\S]*?results:\s*\[/g;
  if (resultsArrayPattern.test(content)) {
    content = content.replace(
      /(useHyperVDiscoveryLogic\.mockReturnValue\(\{[\s\S]*?)results:\s*\[([^\]]*)\]/g,
      '$1result: { vms: [], virtualSwitches: [], vhds: [], hosts: [] }'
    );
    modified = true;
    console.log('  Fixed results → result for HyperV');
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return modified;
}

function processTests() {
  const files = fs.readdirSync(testsDir);
  let fixedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.test.tsx')) continue;

    const fullPath = path.join(testsDir, file);
    console.log(`Checking ${file}...`);

    if (fixTestFile(fullPath)) {
      fixedCount++;
      console.log(`  ✓ Fixed\n`);
    } else {
      console.log(`  - No changes needed\n`);
    }
  }

  console.log(`\nFixed ${fixedCount} test files`);
}

processTests();
