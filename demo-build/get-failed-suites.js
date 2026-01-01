const fs = require('fs');

const data = JSON.parse(fs.readFileSync('jest-report-session-8-complete.json', 'utf8'));
const failed = data.testResults.filter(t => t.status === 'failed');

console.log(`Total failed suites: ${failed.length}\n`);

const suites = failed.map(f => ({
  name: f.name.replace(/.*guiv2[\\/]/, '').replace(/\\/g, '/'),
  numFailed: f.numFailingTests,
  assertions: f.assertionResults.filter(a => a.status === 'failed').length
}));

const byCategory = {
  views: suites.filter(s => s.name.includes('src/renderer/views/')),
  hooks: suites.filter(s => s.name.includes('src/renderer/hooks/')),
  services: suites.filter(s => s.name.includes('src/renderer/services/')),
  components: suites.filter(s => s.name.includes('src/renderer/components/')),
  main: suites.filter(s => s.name.includes('src/main/')),
  other: suites.filter(s =>
    !s.name.includes('src/renderer/views/') &&
    !s.name.includes('src/renderer/hooks/') &&
    !s.name.includes('src/renderer/services/') &&
    !s.name.includes('src/renderer/components/') &&
    !s.name.includes('src/main/')
  )
};

Object.entries(byCategory).forEach(([cat, items]) => {
  if (items.length > 0) {
    console.log(`\n=== ${cat.toUpperCase()} (${items.length} suites) ===`);
    items.slice(0, 10).forEach(s => {
      console.log(`  ${s.numFailed} failures: ${s.name}`);
    });
    if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
  }
});
