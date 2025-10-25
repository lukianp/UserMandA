const r = require('./batch4-after-sync.json');
const failedSuites = r.testResults.filter(t => t.status === 'failed');

const byDir = {};
failedSuites.forEach(suite => {
  const path = suite.name.replace(/\/g, '/');
  const match = path.match(/src\/(renderer|main)\/([^/]+)\//);
  if (match) {
    const category = match[1] + '/' + match[2];
    if (!byDir[category]) byDir[category] = { count: 0, failures: 0 };
    byDir[category].count++;
    byDir[category].failures += suite.assertionResults.filter(a => a.status === 'failed').length;
  }
});

console.log('=== FAILURE HOTSPOTS ===\n');
Object.entries(byDir)
  .sort((a,b) => b[1].failures - a[1].failures)
  .slice(0, 15)
  .forEach(([dir, stats]) => {
    console.log(dir.padEnd(30), stats.failures.toString().padStart(4), 'failures in', stats.count, 'suites');
  });
