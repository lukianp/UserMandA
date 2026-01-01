const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync('quick-results.json', 'utf8'));
const failing = data.testResults.filter(r => r.numFailingTests > 0 && r.numFailingTests <= 5).sort((a, b) => a.numFailingTests - b.numFailingTests);
console.log(`Found ${failing.length} suites with 1-5 failures\n`);
failing.slice(0, 15).forEach(s => {
  const shortName = path.basename(s.name);
  console.log(`${shortName}: ${s.numFailingTests} failures, ${s.numPassedTests} passing`);
});
