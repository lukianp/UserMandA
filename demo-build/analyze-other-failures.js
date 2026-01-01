/**
 * Deep analysis of "other" failures category
 */

const fs = require('fs');

const baseline = JSON.parse(fs.readFileSync('./baseline-session-start.json', 'utf-8'));

const otherFailures = [];

baseline.testResults.forEach(suite => {
  if (suite.status === 'failed' || suite.assertionResults?.some(t => t.status === 'failed')) {
    suite.assertionResults?.forEach(test => {
      if (test.status === 'failed') {
        const errors = test.failureMessages?.join('\n') || '';
        const filename = suite.name.replace(/\\/g, '/').split('/').pop();

        // Skip known patterns
        if (errors.includes('toBeInTheDocument is not a function') ||
            errors.includes('data-cy') ||
            errors.includes('Unable to find an element with the') ||
            errors.includes('Cannot read propert') ||
            errors.includes('of undefined') ||
            errors.includes('Cannot find module') ||
            errors.includes('Timeout') ||
            errors.includes('exceeded') ||
            errors.includes('mockReturnValue') ||
            errors.includes('mockResolvedValue') ||
            errors.includes('shallow') ||
            errors.includes('mount') ||
            errors.includes('enzyme')) {
          return;
        }

        // This is an "other" failure
        otherFailures.push({
          file: filename,
          suite: suite.name,
          test: test.title,
          fullName: test.fullName,
          error: errors.substring(0, 500)
        });
      }
    });
  }
});

console.log(`\n=== ANALYZING ${otherFailures.length} "OTHER" FAILURES ===\n`);

// Sample the first 20 to identify sub-patterns
const samples = otherFailures.slice(0, 30);

const subPatterns = {};

samples.forEach((failure, i) => {
  console.log(`\n${i + 1}. ${failure.file}`);
  console.log(`   Test: ${failure.test}`);
  console.log(`   Error: ${failure.error.substring(0, 200).replace(/\n/g, ' ')}`);

  // Try to categorize
  if (failure.error.includes('Expected:') && failure.error.includes('Received:')) {
    subPatterns['assertion-mismatch'] = (subPatterns['assertion-mismatch'] || 0) + 1;
  } else if (failure.error.includes('TestingLibraryElementError')) {
    subPatterns['element-not-found'] = (subPatterns['element-not-found'] || 0) + 1;
  } else if (failure.error.includes('drag drop context') || failure.error.includes('DndContext')) {
    subPatterns['react-dnd-context'] = (subPatterns['react-dnd-context'] || 0) + 1;
  } else if (failure.error.includes('TypeError')) {
    subPatterns['type-error'] = (subPatterns['type-error'] || 0) + 1;
  } else if (failure.error.includes('Invariant')) {
    subPatterns['invariant-violation'] = (subPatterns['invariant-violation'] || 0) + 1;
  } else if (failure.error.includes('not a function')) {
    subPatterns['function-undefined'] = (subPatterns['function-undefined'] || 0) + 1;
  } else {
    subPatterns['truly-other'] = (subPatterns['truly-other'] || 0) + 1;
  }
});

console.log('\n\n=== SUB-PATTERNS IN "OTHER" (from sample of 30) ===\n');
Object.entries(subPatterns).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
  const percentage = (count / 30 * 100).toFixed(1);
  const estimated = Math.round(otherFailures.length * count / 30);
  console.log(`${pattern}: ${count}/30 (${percentage}%) → ~${estimated} total estimated`);
});

// Write full list
fs.writeFileSync('./other-failures.json', JSON.stringify(otherFailures, null, 2));
console.log('\n✓ Full list written to other-failures.json\n');
