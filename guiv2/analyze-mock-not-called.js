const fs = require('fs');
const data = JSON.parse(fs.readFileSync('progress-batch6.json', 'utf8'));

const mockNotCalledFiles = {};

data.testResults.forEach(suite => {
  const fileName = suite.name.replace(/^.*[\\\/]guiv2[\\\/]/, '');

  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages) {
      test.failureMessages.forEach(msg => {
        if (msg.includes('toHaveBeenCalled') || msg.includes('Expected number of calls:')) {
          // Extract mock function name
          const match = msg.match(/expect\(([^)]+)\)\.toHaveBeenCalled/) ||
                       msg.match(/mockElectronAPI\.(\w+)/);

          const mockName = match ? match[1] : 'unknown';

          if (!mockNotCalledFiles[fileName]) {
            mockNotCalledFiles[fileName] = {};
          }
          mockNotCalledFiles[fileName][mockName] = (mockNotCalledFiles[fileName][mockName] || 0) + 1;
        }
      });
    }
  });
});

// Sort files by number of mock not called errors
const sortedFiles = Object.entries(mockNotCalledFiles)
  .map(([file, mocks]) => ({
    file,
    count: Object.values(mocks).reduce((a, b) => a + b, 0),
    mocks: Object.entries(mocks).sort((a, b) => b[1] - a[1])
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

console.log('Top 20 Files with Mock Not Called Errors:');
sortedFiles.forEach(({ file, count, mocks }) => {
  console.log(`\n${count.toString().padStart(3)}: ${file}`);
  mocks.slice(0, 5).forEach(([mock, cnt]) => {
    console.log(`       - ${mock} (${cnt}x)`);
  });
});
