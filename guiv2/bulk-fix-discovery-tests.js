const fs = require('fs');
const path = require('path');

const testsDir = path.join(__dirname, 'src/renderer/views/discovery');

const commonFixes = [
  // Fix wrong testId patterns
  { pattern: /-view-view/g, replacement: '-view' },

  // Fix duplicate isDiscovering
  {
    pattern: /isDiscovering: true,\s*\n\s*isDiscovering: true,/g,
    replacement: 'isDiscovering: true,'
  },

  // Fix progress structure for views that use progress.progress
  {
    pattern: /progress: \{\s*progress: (\d+),\s*currentOperation: '([^']+)',\s*estimatedTimeRemaining: (\d+),?\s*\}/g,
    replacement: 'progress: {\n          progress: $1,\n          currentOperation: \'$2\',\n          estimatedTimeRemaining: $3\n        }'
  },

  // Fix errors array to error string
  {
    pattern: /errors: \['([^']+)'\]/g,
    replacement: 'error: \'$1\''
  },

  // Fix text matching that causes multiple elements
  {
    pattern: /expect\(screen\.getByText\(\/Discovery\/i\)\)\.toBeInTheDocument\(\);/g,
    replacement: 'expect(screen.getByTestId(\'discovery-view\')).toBeInTheDocument();'
  },

  // Fix log object format to string format for components that use string logs
  {
    pattern: /logs: \[\s*\{\s*timestamp: '[^']+',\s*level: '[^']+',\s*message: '([^']+)'\s*\},?\s*\]/g,
    replacement: 'logs: [\'$1\']'
  }
];

const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.tsx'));

console.log(`Found ${files.length} test files`);

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  commonFixes.forEach(fix => {
    content = content.replace(fix.pattern, fix.replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalChanges++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`\nTotal files modified: ${totalChanges}`);
