/* eslint-env node */
                                                                                                                                                                  const fs = require('fs');
const data = JSON.parse(fs.readFileSync('current-progress.json', 'utf8'));

const errorPatterns = {};

data.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages) {
      test.failureMessages.forEach(msg => {
        // Extract key error patterns
        if (msg.includes('Unable to find an element with the text:')) {
          const match = msg.match(/Unable to find an element with the text: (.+?)\./);
          if (match) {
            const key = 'Text not found: ' + match[1].substring(0, 50);
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          }
        } else if (msg.includes('Unable to find an element by:')) {
          errorPatterns['data-cy not found'] = (errorPatterns['data-cy not found'] || 0) + 1;
        } else if (msg.includes('Cannot read properties of undefined')) {
          const match = msg.match(/Cannot read properties of undefined \(reading '(.+?)'\)/);
          if (match) {
            const key = 'Undefined property: ' + match[1];
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          }
        } else if (msg.includes('toHaveBeenCalled')) {
          errorPatterns['Mock not called'] = (errorPatterns['Mock not called'] || 0) + 1;
        } else if (msg.includes('Expected: not')) {
          errorPatterns['Unexpected value'] = (errorPatterns['Unexpected value'] || 0) + 1;
        } else if (msg.includes('Timeout')) {
          errorPatterns['Timeout'] = (errorPatterns['Timeout'] || 0) + 1;
        }
      });
    }
  });
});

const sorted = Object.entries(errorPatterns).sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('Top 20 Error Patterns:');
sorted.forEach(([pattern, count]) => {
  console.log(`  ${count.toString().padStart(4)}: ${pattern}`);
});
