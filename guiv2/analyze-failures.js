const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test-results-detailed.json', 'utf8'));

const failed = data.testResults
  .filter(r => r.numFailingTests > 0)
  .sort((a, b) => b.numFailingTests - a.numFailingTests)
  .slice(0, 20)
  .map(r => ({
    file: r.name.split('guiv2')[1] || r.name,
    failed: r.numFailingTests,
    passed: r.numPassedTests
  }));

console.log(JSON.stringify(failed, null, 2));
