const fs = require('fs');
const results = JSON.parse(fs.readFileSync('test-after-data-cy-fix.json', 'utf8'));

// Find files with data-cy issues
results.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed') {
      const msg = test.failureMessages[0] || '';
      if (msg.includes('data-cy="export-results-btn"') || msg.includes('data-cy="export-btn"')) {
        const parts = suite.name.split(/guiv2[\/\\]/);
        const filename = parts.length > 1 ? parts[1] : suite.name;
        console.log(filename + ': ' + test.title.substring(0, 80));
      }
    }
  });
});
