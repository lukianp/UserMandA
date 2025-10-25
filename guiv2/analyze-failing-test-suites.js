const fs = require('fs');
const data = JSON.parse(fs.readFileSync('progress-batch7.json', 'utf8'));

const failingSuites = data.testResults
  .filter(suite => suite.numFailingTests > 0)
  .map(suite => ({
    file: suite.name.replace(/^.*[\\\/]guiv2[\\\/]/, ''),
    failing: suite.numFailingTests,
    passing: suite.numPassingTests,
    total: suite.numFailingTests + suite.numPassingTests + suite.numPendingTests,
    category: suite.name.includes('/hooks/') ? 'hooks' :
             suite.name.includes('/views/') ? 'views' :
             suite.name.includes('/services/') ? 'services' :
             suite.name.includes('/components/') ? 'components' : 'other'
  }))
  .sort((a, b) => b.failing - a.failing);

// Group by category
const byCategory = {};
failingSuites.forEach(suite => {
  if (!byCategory[suite.category]) {
    byCategory[suite.category] = { count: 0, failing: 0, total: 0, files: [] };
  }
  byCategory[suite.category].count++;
  byCategory[suite.category].failing += suite.failing;
  byCategory[suite.category].total += suite.total;
  if (byCategory[suite.category].files.length < 5) {
    byCategory[suite.category].files.push(suite.file);
  }
});

console.log('Failing Test Suites by Category:');
console.log('=================================');
Object.entries(byCategory).forEach(([category, data]) => {
  console.log(`\n${category.toUpperCase()}: ${data.count} suites, ${data.failing} failing tests`);
  console.log(`  Top files:`);
  data.files.forEach(file => console.log(`    - ${file}`));
});

console.log('\n\nTop 20 Failing Test Suites:');
console.log('===========================');
failingSuites.slice(0, 20).forEach(suite => {
  console.log(`${suite.failing.toString().padStart(3)} failing: ${suite.file} (${suite.passing} passing)`);
});
