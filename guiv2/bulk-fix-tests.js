const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern replacements for common test patterns
const patterns = [
  {
    // Replace getByText for buttons with getByTestId
    find: /screen\.getByText\(\/Stop Discovery\/i\)/g,
    replace: 'screen.getByTestId(\'cancel-discovery-btn\')'
  },
  {
    find: /screen\.getByText\(\/Start Discovery\/i\)/g,
    replace: 'screen.getByTestId(\'start-discovery-btn\')'
  },
  {
    find: /screen\.getByText\(\/Cancel Discovery\/i\)/g,
    replace: 'screen.getByTestId(\'cancel-discovery-btn\')'
  },
  {
    find: /screen\.getByText\(\/Export Results\/i\)/g,
    replace: 'screen.getByTestId(\'export-btn\')'
  },
  {
    find: /screen\.getByText\(\/Reset Form\/i\)/g,
    replace: 'screen.getByTestId(\'reset-form-btn\')'
  },
  {
    find: /screen\.getByText\(\/View Results\/i\)/g,
    replace: 'screen.getByTestId(\'view-results-btn\')'
  }
];

// Find all test files
const testFiles = glob.sync('src/renderer/views/**/*.test.tsx');

let totalChanges = 0;

testFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;
  
  patterns.forEach(pattern => {
    if (pattern.find.test(content)) {
      content = content.replace(pattern.find, pattern.replace);
      changed = true;
      totalChanges++;
    }
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed: ' + file);
  }
});

console.log('\nTotal changes: ' + totalChanges);
