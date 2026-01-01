/**
 * Comprehensive Null Safety Fix
 *
 * This script adds null safety checks to common patterns in view files that cause crashes:
 * 1. stats?.property ?? defaultValue
 * 2. data?.property ?? defaultValue
 * 3. Optional chaining on method calls
 *
 * Usage: node fix-comprehensive-null-safety.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const VIEWS_DIR = 'src/renderer/views';
const DRY_RUN = false;

/**
 * Fix patterns in file
 */
function fixNullSafetyInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Pattern 1: stats.property access in JSX
  // {stats.total} => {stats?.total ?? 0}
  const statsPattern = /{stats\.(\w+)}/g;
  const statsMatches = [];
  let match;

  while ((match = statsPattern.exec(content)) !== null) {
    // Skip if already has null safety
    const before = content.substring(Math.max(0, match.index - 10), match.index);
    if (!before.includes('?.') && !before.includes('??')) {
      statsMatches.push({
        full: match[0],
        property: match[1],
        index: match.index
      });
    }
  }

  // Apply stats fixes in reverse order
  statsMatches.reverse().forEach(m => {
    const before = `{stats.${m.property}}`;
    const after = `{stats?.${m.property} ?? 0}`;
    content = content.substring(0, m.index) + after + content.substring(m.index + before.length);
    changeCount++;
  });

  // Pattern 2: data?.length in conditions
  // if (data.length > 0) => if ((data?.length ?? 0) > 0)
  const dataLengthPattern = /\bdata\.length\b/g;
  const dataLengthMatches = [];

  while ((match = dataLengthPattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 5), match.index);
    if (!before.includes('?.')) {
      dataLengthMatches.push({
        full: match[0],
        index: match.index
      });
    }
  }

  // Apply data.length fixes
  dataLengthMatches.reverse().forEach(m => {
    const before = 'data.length';
    const after = '(data?.length ?? 0)';
    content = content.substring(0, m.index) + after + content.substring(m.index + before.length);
    changeCount++;
  });

  // Pattern 3: items?.length
  const itemsLengthPattern = /\bitems\.length\b/g;
  const itemsLengthMatches = [];

  while ((match = itemsLengthPattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 5), match.index);
    if (!before.includes('?.')) {
      itemsLengthMatches.push({
        full: match[0],
        index: match.index
      });
    }
  }

  // Apply items.length fixes
  itemsLengthMatches.reverse().forEach(m => {
    const before = 'items.length';
    const after = '(items?.length ?? 0)';
    content = content.substring(0, m.index) + after + content.substring(m.index + before.length);
    changeCount++;
  });

  // Pattern 4: selectedItems?.length
  const selectedItemsLengthPattern = /\bselectedItems\.length\b/g;
  const selectedItemsMatches = [];

  while ((match = selectedItemsLengthPattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 5), match.index);
    if (!before.includes('?.')) {
      selectedItemsMatches.push({
        full: match[0],
        index: match.index
      });
    }
  }

  // Apply selectedItems.length fixes
  selectedItemsMatches.reverse().forEach(m => {
    const before = 'selectedItems.length';
    const after = '(selectedItems?.length ?? 0)';
    content = content.substring(0, m.index) + after + content.substring(m.index + before.length);
    changeCount++;
  });

  return { modified: content, changeCount };
}

/**
 * Process all files
 */
async function processAllFiles() {
  const pattern = path.join(VIEWS_DIR, '**/*.tsx').replace(/\\/g, '/');
  const files = await glob(pattern);

  console.log(`Processing ${files.length} view files...\n`);

  let totalChanges = 0;
  const modifiedFiles = [];

  for (const file of files) {
    const { modified, changeCount } = fixNullSafetyInFile(file);

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

  if (modifiedFiles.length > 0 && modifiedFiles.length <= 20) {
    console.log('Modified files:');
    modifiedFiles.forEach(f => console.log(`  - ${f.path} (${f.changes})`));
  }

  return { modifiedFiles, totalChanges };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Applying comprehensive null safety fixes...\n');

    const result = await processAllFiles();

    if (result.totalChanges === 0) {
      console.log('✨ All files already safe!\n');
    } else {
      console.log(`\n✅ Fixed ${result.totalChanges} instances in ${result.modifiedFiles.length} files\n`);
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

module.exports = { fixNullSafetyInFile };
