const r = require('./current-test-report.json');
const missing = {};

r.testResults.forEach(s => {
  s.assertionResults?.forEach(t => {
    if (t.status === 'failed') {
      t.failureMessages?.forEach(m => {
        const match = m.match(/Unable to find an element.*data-cy="([^"]+)"/);
        if (match) {
          const file = s.name.replace(/\/g, '/').split('/src/renderer/views/')[1]?.replace('.test.tsx', '');
          if (file) {
            if (!missing[file]) missing[file] = new Set();
            missing[file].add(match[1]);
          }
        }
      });
    }
  });
});

console.log('Components needing data-cy attributes:\n');
Object.entries(missing).slice(0, 20).forEach(([file, attrs]) => {
  console.log(file + ': ' + Array.from(attrs).slice(0, 5).join(', '));
});
console.log('\nTotal components:', Object.keys(missing).length);
