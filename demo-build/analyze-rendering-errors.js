const fs = require('fs');

// Read the test results
const results = JSON.parse(fs.readFileSync('comprehensive-test-analysis.json', 'utf8'));

// Analyze rendering errors in detail
const renderingErrors = {
  forwardRefErrors: [],
  nullPropertyErrors: [],
  hookErrors: [],
  contextErrors: [],
  otherRenderErrors: []
};

let totalRenderingErrors = 0;

results.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0) {
      const message = test.failureMessages[0];
      const filePath = suite.name.split(/[\\/]/).slice(-3).join('/');

      const errorInfo = {
        file: filePath,
        test: test.fullName,
        message: message
      };

      if (message.includes('Function components cannot be given refs') ||
          message.includes('forwardRef')) {
        renderingErrors.forwardRefErrors.push(errorInfo);
        totalRenderingErrors++;
      } else if (message.includes('Cannot read propert') ||
                 message.includes('Cannot access') ||
                 message.toLowerCase().includes('undefined')) {
        renderingErrors.nullPropertyErrors.push(errorInfo);
        totalRenderingErrors++;
      } else if (message.includes('Invalid hook call') ||
                 message.includes('Hooks can only be called')) {
        renderingErrors.hookErrors.push(errorInfo);
        totalRenderingErrors++;
      } else if (message.includes('context') || message.includes('Context')) {
        renderingErrors.contextErrors.push(errorInfo);
        totalRenderingErrors++;
      } else if (message.toLowerCase().includes('render')) {
        renderingErrors.otherRenderErrors.push(errorInfo);
        totalRenderingErrors++;
      }
    }
  });
});

// Extract specific error patterns
const extractErrorPattern = (message) => {
  // Extract TestingLibraryElementError patterns
  if (message.includes('TestingLibraryElementError')) {
    const match = message.match(/TestingLibraryElementError: (.+?)(\n|$)/);
    return match ? match[1] : 'Unknown TestingLibraryElementError';
  }

  // Extract "Cannot read" patterns
  if (message.includes('Cannot read')) {
    const match = message.match(/Cannot read propert[a-z]+ ['"](.*?)['"] of (.*?)(\n|$)/);
    return match ? `Cannot read '${match[1]}' of ${match[2]}` : 'Cannot read property';
  }

  // Extract "Expected" patterns for mock failures
  if (message.includes('Expected')) {
    const match = message.match(/Expected (.+?)(\n|$)/);
    return match ? match[1] : 'Expected assertion failed';
  }

  return 'Other error';
};

// Categorize all failures by error pattern
const patternMap = new Map();

results.testResults.forEach(suite => {
  suite.assertionResults.forEach(test => {
    if (test.status === 'failed' && test.failureMessages && test.failureMessages.length > 0) {
      const message = test.failureMessages[0];
      const pattern = extractErrorPattern(message);

      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, []);
      }

      patternMap.get(pattern).push({
        file: suite.name.split(/[\\/]/).slice(-3).join('/'),
        test: test.fullName
      });
    }
  });
});

// Sort patterns by frequency
const sortedPatterns = Array.from(patternMap.entries())
  .map(([pattern, occurrences]) => ({
    pattern,
    count: occurrences.length,
    examples: occurrences.slice(0, 3)
  }))
  .sort((a, b) => b.count - a.count);

console.log('\n========================================');
console.log('RENDERING ERROR DEEP DIVE');
console.log('========================================\n');

console.log('RENDERING ERROR TYPES:');
console.log(`  Forward Ref Errors: ${renderingErrors.forwardRefErrors.length}`);
console.log(`  Null/Undefined Property: ${renderingErrors.nullPropertyErrors.length}`);
console.log(`  Hook Errors: ${renderingErrors.hookErrors.length}`);
console.log(`  Context Errors: ${renderingErrors.contextErrors.length}`);
console.log(`  Other Render Errors: ${renderingErrors.otherRenderErrors.length}`);
console.log(`  Total: ${totalRenderingErrors}\n`);

console.log('TOP 20 ERROR PATTERNS:');
sortedPatterns.slice(0, 20).forEach((pattern, i) => {
  console.log(`\n${i + 1}. ${pattern.pattern} (${pattern.count} occurrences)`);
  pattern.examples.forEach(ex => {
    console.log(`   - ${ex.file}`);
  });
});

// Save detailed analysis
fs.writeFileSync('rendering-errors-detailed.json', JSON.stringify({
  summary: {
    forwardRef: renderingErrors.forwardRefErrors.length,
    nullProperty: renderingErrors.nullPropertyErrors.length,
    hookErrors: renderingErrors.hookErrors.length,
    contextErrors: renderingErrors.contextErrors.length,
    otherRender: renderingErrors.otherRenderErrors.length,
    total: totalRenderingErrors
  },
  patterns: sortedPatterns,
  details: renderingErrors
}, null, 2));

console.log('\n========================================');
console.log('Detailed report saved: rendering-errors-detailed.json');
console.log('========================================\n');
