/**
 * Fix Discovery View Button Locators
 *
 * Replaces ambiguous text queries with specific data-cy selectors
 * to fix "Found multiple elements" errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all discovery view test files
const testFiles = glob.sync('src/renderer/views/discovery/*DiscoveryView.test.tsx', { cwd: __dirname });

let totalFixed = 0;

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changes = [];

  // Fix "Start Discovery" button queries
  // Replace: screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i)
  // With: screen.getByTestId('start-discovery-btn')
  const startButtonPattern = /screen\.getByText\(\/Start\/i\)\s*\|\|\s*screen\.getByText\(\/Run\/i\)\s*\|\|\s*screen\.getByText\(\/Discover\/i\)/g;
  if (content.match(startButtonPattern)) {
    content = content.replace(startButtonPattern, "screen.getByTestId('start-discovery-btn')");
    changes.push('Fixed Start button selector');
  }

  // Fix individual Start button queries
  const startPattern = /screen\.getByText\(\/Start\/i\)(?!\s*\|\|)/g;
  if (content.match(startPattern)) {
    content = content.replace(startPattern, "screen.getByTestId('start-discovery-btn')");
    changes.push('Fixed individual Start selector');
  }

  // Fix "Stop/Cancel" button queries
  // Replace: screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)
  // With: screen.getByTestId('cancel-discovery-btn')
  const stopButtonPattern = /screen\.getByText\(\/Stop\/i\)\s*\|\|\s*screen\.getByText\(\/Cancel\/i\)/g;
  if (content.match(stopButtonPattern)) {
    content = content.replace(stopButtonPattern, "screen.getByTestId('cancel-discovery-btn')");
    changes.push('Fixed Stop/Cancel button selector');
  }

  // Fix Export button queries
  // Replace: screen.getByText(/Export/i)
  // With: screen.getByTestId('export-btn')
  const exportPattern = /screen\.getByText\(\/Export\/i\)/g;
  if (content.match(exportPattern)) {
    content = content.replace(exportPattern, "screen.getByTestId('export-btn')");
    changes.push('Fixed Export button selector');
  }

  // Fix Clear button queries
  // Replace: screen.getByText(/Clear/i)
  // With: screen.getByTestId('clear-logs-btn')
  const clearPattern = /screen\.getByText\(\/Clear\/i\)/g;
  if (content.match(clearPattern)) {
    content = content.replace(clearPattern, "screen.getByTestId('clear-logs-btn')");
    changes.push('Fixed Clear button selector');
  }

  // Fix Refresh button queries
  // Replace: screen.getByText(/Refresh/i)
  // With: screen.getByTestId('refresh-btn')
  const refreshPattern = /screen\.getByText\(\/Refresh\/i\)/g;
  if (content.match(refreshPattern)) {
    content = content.replace(refreshPattern, "screen.getByTestId('refresh-btn')");
    changes.push('Fixed Refresh button selector');
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed ${filePath}`);
    console.log(`  Changes: ${changes.join(', ')}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} discovery view test files`);
