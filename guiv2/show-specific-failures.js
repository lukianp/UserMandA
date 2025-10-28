const fs = require('fs');

const categories = JSON.parse(fs.readFileSync('failure-categories-detailed.json', 'utf8'));

console.log('\n========================================');
console.log('SPECIFIC FAILURE EXAMPLES');
console.log('========================================\n');

console.log('1. MISSING DATA-TESTID ATTRIBUTES (32 failures):');
categories.missingDataTestId.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName}`);

  // Extract the missing attribute
  const match = f.message.match(/\[data-testid="([^"]+)"\]/);
  if (match) {
    console.log(`   Missing: data-testid="${match[1]}"`);
  }
});

console.log('\n\n2. TEXT CONTENT MISMATCHES (42 failures):');
categories.textContentMismatch.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName}`);

  // Extract the expected text
  const match = f.message.match(/Unable to find an element with the text: (.+?)(\.|Ignored)/);
  if (match) {
    console.log(`   Expected text: ${match[1]}`);
  }
});

console.log('\n\n3. MOCK DATA MISMATCHES (31 failures):');
categories.mockDataMismatch.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName}`);

  // Extract the expectation
  const match = f.message.match(/Expected (.+?)(\n|$)/);
  if (match) {
    console.log(`   Expected: ${match[1].substring(0, 80)}`);
  }
});

console.log('\n\n4. UNDEFINED PROPERTY ERRORS (15 failures):');
categories.undefinedProperty.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName}`);

  // Extract the property
  const match = f.message.match(/Cannot read propert[a-z]+ ['"](.*?)['"] of (.*?)(\n|at)/);
  if (match) {
    console.log(`   Property: '${match[1]}' of ${match[2]}`);
  }
});

console.log('\n\n5. MISSING ACCESSIBLE ELEMENTS (20 failures):');
categories.missingAccessibleElement.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName}`);

  // Extract the role
  const match = f.message.match(/role "([^"]+)"/);
  if (match) {
    console.log(`   Missing role: "${match[1]}"`);
  }
});

console.log('\n\n6. SERVICE INTEGRATION FAILURES (15 failures):');
categories.serviceIntegration.slice(0, 10).forEach((f, i) => {
  const file = f.file.split(/[\\/]/).slice(-2).join('/');
  console.log(`\n${i + 1}. ${file}`);
  console.log(`   Test: ${f.testName.substring(0, 100)}`);
});

console.log('\n========================================\n');
