const fs = require('fs');
const data = JSON.parse(fs.readFileSync('baseline-batch5.json', 'utf8'));

const fileFailures = {};

data.testResults.forEach(suite => {
  const fileName = suite.name.replace(/^.*[\\\/]guiv2[\\\/]/, '');

  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages) {
      test.failureMessages.forEach(msg => {
        if (msg.includes('Unable to find an element by:') && msg.includes('[data-cy=')) {
          const match = msg.match(/\[data-cy="?([^"\]]+)"?\]/);
          if (match) {
            const dataCy = match[1];
            if (!fileFailures[fileName]) {
              fileFailures[fileName] = {};
            }
            fileFailures[fileName][dataCy] = (fileFailures[fileName][dataCy] || 0) + 1;
          }
        }
      });
    }
  });
});

// Sort files by number of data-cy failures
const sortedFiles = Object.entries(fileFailures)
  .map(([file, attrs]) => ({
    file,
    count: Object.values(attrs).reduce((a, b) => a + b, 0),
    attrs: Object.keys(attrs)
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 30);

console.log('Top 30 Files with data-cy Failures:');
sortedFiles.forEach(({ file, count, attrs }) => {
  console.log(`  ${count.toString().padStart(3)}: ${file}`);
  attrs.slice(0, 5).forEach(attr => {
    console.log(`       - ${attr}`);
  });
});
