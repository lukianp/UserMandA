const fs = require('fs');

// Read the test results
const results = JSON.parse(fs.readFileSync('comprehensive-test-analysis.json', 'utf8'));

// Analyze pending tests
const pendingByFile = new Map();
let totalPending = 0;

results.testResults.forEach(suite => {
  const filePath = suite.name.split(/[\\/]/).slice(-3).join('/');

  const pending = suite.assertionResults.filter(t => t.status === 'pending');

  if (pending.length > 0) {
    pendingByFile.set(filePath, {
      count: pending.length,
      tests: pending.map(t => t.fullName)
    });
    totalPending += pending.length;
  }
});

// Sort by count
const sortedPending = Array.from(pendingByFile.entries())
  .map(([file, data]) => ({ file, ...data }))
  .sort((a, b) => b.count - a.count);

console.log('\n========================================');
console.log('PENDING TESTS ANALYSIS');
console.log('========================================\n');

console.log(`Total Pending Tests: ${totalPending}`);
console.log(`Files with Pending Tests: ${sortedPending.length}\n`);

console.log('TOP 30 FILES WITH PENDING TESTS:\n');
sortedPending.slice(0, 30).forEach((file, i) => {
  console.log(`${i + 1}. ${file.file} (${file.count} pending)`);
  if (file.count <= 5) {
    file.tests.forEach(test => {
      console.log(`   - ${test}`);
    });
  }
});

// Save report
fs.writeFileSync('pending-tests-analysis.json', JSON.stringify({
  total: totalPending,
  fileCount: sortedPending.length,
  files: sortedPending
}, null, 2));

console.log('\n========================================');
console.log('Detailed report saved: pending-tests-analysis.json');
console.log('========================================\n');
