const fs = require('fs');
const results = JSON.parse(fs.readFileSync('test-after-data-cy-fix.json', 'utf8'));

// Find null safety issues
const nullIssues = {};
results.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed') {
      const msg = test.failureMessages[0] || '';
      if (msg.includes('Cannot read properties of undefined')) {
        // Extract property name
        const match = msg.match(/reading '(\w+)'/);
        const property = match ? match[1] : 'unknown';

        const parts = suite.name.split(/guiv2[\/\\]/);
        const filename = parts.length > 1 ? parts[1] : suite.name;

        if (!nullIssues[filename]) {
          nullIssues[filename] = {};
        }
        nullIssues[filename][property] = (nullIssues[filename][property] || 0) + 1;
      }
    }
  });
});

console.log('FILES WITH NULL SAFETY ISSUES:');
Object.entries(nullIssues)
  .sort((a, b) => {
    const aCount = Object.values(a[1]).reduce((sum, n) => sum + n, 0);
    const bCount = Object.values(b[1]).reduce((sum, n) => sum + n, 0);
    return bCount - aCount;
  })
  .forEach(([file, props]) => {
    const total = Object.values(props).reduce((sum, n) => sum + n, 0);
    console.log(`\n${file} (${total} failures):`);
    Object.entries(props).forEach(([prop, count]) => {
      console.log(`  - ${prop}: ${count}`);
    });
  });
