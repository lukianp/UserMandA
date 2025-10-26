const fs = require('fs');
const results = JSON.parse(fs.readFileSync('./test-results-current-session.json', 'utf8'));

const hookTests = results.testResults
  .filter(t => t.name.includes('/hooks/') && t.name.includes('DiscoveryLogic.test.ts'))
  .map(t => ({
    name: t.name.split('/').pop(),
    passed: t.numPassingTests,
    failed: t.numFailingTests,
    total: t.numPassingTests + t.numFailingTests,
    status: t.status
  }))
  .sort((a, b) => b.failed - a.failed);

console.log('Hook Logic Tests Status:\n');
hookTests.forEach(h => {
  const pct = ((h.passed / h.total) * 100).toFixed(0);
  console.log(h.name + ': ' + h.passed + '/' + h.total + ' (' + pct + '%) - ' + h.status);
});

const totals = hookTests.reduce((acc, h) => ({
  passed: acc.passed + h.passed,
  failed: acc.failed + h.failed
}), { passed: 0, failed: 0 });

const totalTests = totals.passed + totals.failed;
const totalPct = ((totals.passed / totalTests) * 100).toFixed(1);
console.log('\nTotal Hook Tests: ' + totals.passed + '/' + totalTests + ' (' + totalPct + '%)');
