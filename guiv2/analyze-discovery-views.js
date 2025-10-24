const results = require('./jest-batch-2-final.json');
const failures = {};

results.testResults.forEach(suite => {
  if (suite.name.includes('DiscoveryView.test')) {
    const failCount = suite.assertionResults.filter(t => t.status === 'failed').length;
    if (failCount > 0) {
      // Extract filename from path
      const parts = suite.name.split('\\');
      const name = parts[parts.length - 1];
      failures[name] = failCount;
    }
  }
});

console.log('Discovery Views with Failures:\n');
Object.entries(failures)
  .sort((a,b) => b[1] - a[1])
  .forEach(([name, count]) => {
    console.log(count.toString().padStart(3) + ' - ' + name);
  });

console.log('\nTotal:', Object.keys(failures).length, 'discovery views with failures');
console.log('Total failures:', Object.values(failures).reduce((a,b) => a+b, 0));
