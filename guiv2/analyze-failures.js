const fs = require('fs');

const data = JSON.parse(fs.readFileSync('jest-report-session-8-complete.json', 'utf8'));
const failed = data.testResults.filter(t => t.status === 'failed');

const errors = {};
const failedSuites = [];

failed.forEach(f => {
  const suiteName = f.name.replace(/^.*\/src\//, 'src/');
  failedSuites.push(suiteName);

  f.assertionResults.filter(a => a.status === 'failed').forEach(a => {
    const msg = a.failureMessages?.[0]?.split('\n')?.[0] || 'Unknown';
    const shortMsg = msg.substring(0, 120);
    errors[shortMsg] = (errors[shortMsg] || 0) + 1;
  });
});

console.log('=== TOP 20 FAILURE PATTERNS ===\n');
const sorted = Object.entries(errors).sort((a, b) => b[1] - a[1]).slice(0, 20);
sorted.forEach(([msg, count]) => {
  console.log(`${count}x: ${msg}`);
});

console.log('\n=== FAILED SUITES BY CATEGORY ===\n');
const categories = {
  views: failedSuites.filter(s => s.includes('/views/')),
  hooks: failedSuites.filter(s => s.includes('/hooks/')),
  services: failedSuites.filter(s => s.includes('/services/')),
  components: failedSuites.filter(s => s.includes('/components/')),
  main: failedSuites.filter(s => s.includes('/main/'))
};

Object.entries(categories).forEach(([cat, suites]) => {
  console.log(`${cat}: ${suites.length} failed suites`);
  suites.slice(0, 5).forEach(s => console.log(`  - ${s}`));
  if (suites.length > 5) console.log(`  ... and ${suites.length - 5} more`);
});
