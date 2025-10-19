/**
 * Fix Element Selector Mismatches
 *
 * Standardizes data-testid → data-cy across all view and component files.
 *
 * Background:
 * - setupTests.ts configures: configure({ testIdAttribute: 'data-cy' })
 * - This makes getByTestId() look for data-cy attributes
 * - But some components still use data-testid, causing 429 "Element Not Found" failures
 *
 * Usage: node fix-element-selectors.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const PATHS_TO_FIX = [
  'src/renderer/views/**/*.tsx',
  'src/renderer/components/**/*.tsx'
];
const DRY_RUN = false;

/**
 * Fix data-testid → data-cy in a single file
 */
function fixSelectorsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changeCount = 0;

  // Pattern: data-testid="..." => data-cy="..."
  // Handles single and double quotes
  const testidPattern = /data-testid=(['"])([^'"]+)\1/g;
  const matches = [];
  let match;

  while ((match = testidPattern.exec(content)) !== null) {
    matches.push({
      full: match[0],
      quote: match[1],
      value: match[2],
      index: match.index
    });
  }

  // Apply fixes in reverse order to maintain positions
  matches.reverse().forEach(m => {
    const before = `data-testid=${m.quote}${m.value}${m.quote}`;
    const after = `data-cy=${m.quote}${m.value}${m.quote}`;
    modified = modified.substring(0, m.index) + after + modified.substring(m.index + before.length);
    changeCount++;
  });

  return { modified, changeCount };
}

/**
 * Process all files matching patterns
 */
async function processAllFiles() {
  console.log('🔧 Fixing element selector mismatches...\n');

  const allFiles = [];
  for (const pattern of PATHS_TO_FIX) {
    const files = await glob(pattern);
    allFiles.push(...files);
  }

  console.log(`Processing ${allFiles.length} files...\n`);

  let totalChanges = 0;
  const modifiedFiles = [];

  for (const file of allFiles) {
    const { modified, changeCount } = fixSelectorsInFile(file);

    if (changeCount > 0) {
      modifiedFiles.push({ path: file, changes: changeCount });

      if (!DRY_RUN) {
        fs.writeFileSync(file, modified, 'utf8');
        console.log(`✅ ${path.basename(file)}: ${changeCount} fix(es) applied`);
      } else {
        console.log(`📝 ${path.basename(file)}: ${changeCount} fix(es) would be applied`);
      }

      totalChanges += changeCount;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Summary: ${modifiedFiles.length} files, ${totalChanges} fixes`);
  console.log(`${'='.repeat(70)}\n`);

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN - No changes applied');
    console.log('Set DRY_RUN = false to apply\n');
  }

  if (modifiedFiles.length > 0 && modifiedFiles.length <= 30) {
    console.log('Modified files:');
    modifiedFiles.forEach(f => console.log(`  - ${f.path} (${f.changes})`));
    console.log('');
  }

  return { modifiedFiles, totalChanges };
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await processAllFiles();

    if (result.totalChanges === 0) {
      console.log('✨ All files already use data-cy!\n');
    } else {
      console.log(`\n✅ Fixed ${result.totalChanges} instances in ${result.modifiedFiles.length} files\n`);
      console.log('Expected impact: +100-200 passing tests (from 429 Element Not Found failures)\n');
      console.log('Next step: Run npm test to verify fixes\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSelectorsInFile };
