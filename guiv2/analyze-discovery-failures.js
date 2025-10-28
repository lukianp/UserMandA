const fs = require('fs');
const path = require('path');

const baseline = JSON.parse(fs.readFileSync('./baseline-start.json', 'utf8'));

const discoveryTests = baseline.testResults.filter(t =>
  t.name.includes('Discovery') && t.status === 'failed'
).slice(0, 20);

console.log('Top 20 Failing Discovery Tests:\n');
discoveryTests.forEach((t, idx) => {
  const fileName = path.basename(t.name);
  console.log(`${idx + 1}. ${fileName}: ${t.numFailingTests} failing / ${t.numPassingTests} passing`);
});

console.log('\n\nTotal Discovery Tests:');
const allDiscovery = baseline.testResults.filter(t => t.name.includes('Discovery'));
const failingDiscovery = allDiscovery.filter(t => t.status === 'failed').length;
console.log(`${failingDiscovery} failing / ${allDiscovery.length} total`);
