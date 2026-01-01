const fs = require('fs');
const d = JSON.parse(fs.readFileSync('test-results-detailed.json', 'utf8'));
const failing = d.testResults.filter(r => r.numFailingTests > 0);
console.log('Total failing suites:', failing.length);
failing.sort((a, b) => b.numFailingTests - a.numFailingTests).slice(0, 15).forEach(r => {
  const name = r.name.includes('guiv2') ? r.name.split('guiv2')[1] : r.name;
  console.log(name.substring(0, 80) + ': ' + r.numFailingTests + ' failed, ' + r.numPassedTests + ' passed');
});
