const fs = require('fs');
const data = JSON.parse(fs.readFileSync('progress-batch5.json', 'utf8'));

const nullSafetyFiles = {};

data.testResults.forEach(suite => {
  const fileName = suite.name.replace(/^.*[\\\/]guiv2[\\\/]/, '');

  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages) {
      test.failureMessages.forEach(msg => {
        if (msg.includes("Cannot read properties of undefined") ||
            msg.includes("Cannot read property") ||
            msg.includes("undefined is not an object")) {

          // Extract the property being accessed
          const match = msg.match(/Cannot read propert(?:ies|y) of undefined \(reading '(.+?)'\)/);
          const property = match ? match[1] : 'unknown';

          if (!nullSafetyFiles[fileName]) {
            nullSafetyFiles[fileName] = {};
          }
          nullSafetyFiles[fileName][property] = (nullSafetyFiles[fileName][property] || 0) + 1;
        }
      });
    }
  });
});

// Sort files by number of null safety errors
const sortedFiles = Object.entries(nullSafetyFiles)
  .map(([file, props]) => ({
    file,
    count: Object.values(props).reduce((a, b) => a + b, 0),
    props: Object.entries(props).sort((a, b) => b[1] - a[1])
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

console.log('Top 20 Files with Null Safety Issues:');
sortedFiles.forEach(({ file, count, props }) => {
  console.log(`\n${count.toString().padStart(3)}: ${file}`);
  props.slice(0, 5).forEach(([prop, cnt]) => {
    console.log(`       - ${prop} (${cnt}x)`);
  });
});
