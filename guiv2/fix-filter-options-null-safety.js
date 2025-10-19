/**
 * Fix Filter Options Null Safety
 *
 * This script adds null safety to filterOptions.*.map() calls across all view files.
 * Pattern: filterOptions.property.map(...) => (filterOptions?.property ?? []).map(...)
 *
 * Usage: node fix-filter-options-null-safety.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const VIEWS_DIR = 'src/renderer/views';
const DRY_RUN = false; // Set to true to see changes without applying them

/**
 * Fix filterOptions null safety in a file
 */
function fixFilterOptionsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changeCount = 0;

  // Pattern 1: Direct .map() on filterOptions.property
  // filterOptions.frameworks.map(...) => (filterOptions?.frameworks ?? []).map(...)
  const directMapPattern = /filterOptions\.(\w+)\.map\(/g;
  let match;
  const matches = [];

  while ((match = directMapPattern.exec(content)) !== null) {
    matches.push({
      full: match[0],
      property: match[1],
      index: match.index
    });
  }

  // Process matches in reverse order to maintain positions
  matches.reverse().forEach(m => {
    const before = `filterOptions.${m.property}.map(`;
    const after = `(filterOptions?.${m.property} ?? []).map(`;
    modified = modified.substring(0, m.index) + after + modified.substring(m.index + before.length);
    changeCount++;
  });

  // Pattern 2: Spread operator with filterOptions
  // ...filterOptions.property.map(...) => ...(filterOptions?.property ?? []).map(...)
  const spreadMapPattern = /\.\.\.filterOptions\.(\w+)\.map\(/g;
  const spreadMatches = [];

  while ((match = spreadMapPattern.exec(content)) !== null) {
    spreadMatches.push({
      full: match[0],
      property: match[1],
      index: match.index
    });
  }

  // Process spread matches in reverse order
  spreadMatches.reverse().forEach(m => {
    const before = `...filterOptions.${m.property}.map(`;
    const after = `...(filterOptions?.${m.property} ?? []).map(`;
    // Find the position in the modified content
    const index = modified.indexOf(before, Math.max(0, m.index - 50));
    if (index !== -1) {
      modified = modified.substring(0, index) + after + modified.substring(index + before.length);
      changeCount++;
    }
  });

  return { modified, changeCount };
}

/**
 * Process all view files
 */
async function processAllFiles() {
  const pattern = path.join(VIEWS_DIR, '**/*.tsx').replace(/\\/g, '/');
  const files = await glob(pattern);

  console.log(`Found ${files.length} view files to process\n`);

  let totalChanges = 0;
  const modifiedFiles = [];

  for (const file of files) {
    const { modified, changeCount } = fixFilterOptionsInFile(file);

    if (changeCount > 0) {
      modifiedFiles.push({
        path: file,
        changes: changeCount
      });

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
  console.log(`Summary: ${modifiedFiles.length} files modified, ${totalChanges} total fixes`);
  console.log(`${'='.repeat(70)}\n`);

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files were actually modified');
    console.log('Set DRY_RUN = false in the script to apply changes\n');
  }

  // Show sample of modified files
  if (modifiedFiles.length > 0) {
    console.log('Modified files:');
    modifiedFiles.forEach(f => {
      console.log(`  - ${f.path} (${f.changes} changes)`);
    });
  }

  return { modifiedFiles, totalChanges };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Fixing filterOptions null safety...\n');

    const result = await processAllFiles();

    if (result.totalChanges === 0) {
      console.log('✨ All files already have proper null safety checks!\n');
    } else {
      console.log(`\n✅ Successfully fixed ${result.totalChanges} instances across ${result.modifiedFiles.length} files\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { fixFilterOptionsInFile };
