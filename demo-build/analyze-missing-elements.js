const fs = require('fs');

const report = JSON.parse(fs.readFileSync('jest-report-current.json', 'utf8'));

const missingElementsByFile = {};

report.testResults.forEach(suite => {
  if (suite.status === 'failed') {
    const suiteName = suite.name.split('\\').pop();

    suite.assertionResults.forEach(test => {
      if (test.status === 'failed' && test.failureMessages) {
        test.failureMessages.forEach(msg => {
          if (msg.includes('Unable to find an element')) {
            // Extract the element text being searched for
            const textMatch = msg.match(/Unable to find an element.*?text:\s*([^\n]+)/);
            const roleMatch = msg.match(/Unable to find an element.*?role:\s*([^\n]+)/);

            let elementDesc = 'unknown';
            if (textMatch) {
              elementDesc = textMatch[1].trim();
            } else if (roleMatch) {
              elementDesc = `role: ${roleMatch[1].trim()}`;
            }

            if (!missingElementsByFile[suiteName]) {
              missingElementsByFile[suiteName] = {
                total: 0,
                elements: {}
              };
            }

            missingElementsByFile[suiteName].total += 1;
            missingElementsByFile[suiteName].elements[elementDesc] =
              (missingElementsByFile[suiteName].elements[elementDesc] || 0) + 1;
          }
        });
      }
    });
  }
});

// Sort by total count
const sortedFiles = Object.entries(missingElementsByFile)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 20);

console.log('='.repeat(80));
console.log('TOP 20 FILES WITH MISSING UI ELEMENT ERRORS');
console.log('='.repeat(80));
console.log('');

sortedFiles.forEach(([file, info]) => {
  console.log(`\n${file} (${info.total} missing elements):`);
  const sortedElements = Object.entries(info.elements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  sortedElements.forEach(([element, count]) => {
    console.log(`  ${count.toString().padStart(3)}x - ${element}`);
  });
});

console.log('\n' + '='.repeat(80));
console.log(`Total files with missing element errors: ${Object.keys(missingElementsByFile).length}`);
console.log(`Total missing element errors: ${Object.values(missingElementsByFile).reduce((sum, info) => sum + info.total, 0)}`);
console.log('='.repeat(80));
