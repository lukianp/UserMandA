/**
 * Extended Null Safety Fix
 *
 * Fixes additional null safety patterns found in views:
 * - timelineData.length, reportData.length, chartData.length, etc.
 * - Any pattern: *Data.length
 *
 * Usage: node fix-extended-null-safety.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const VIEWS_DIR = 'src/renderer/views';
const DRY_RUN = false;

/**
 * Fix patterns in file
 */
function fixNullSafetyInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Pattern 1: *Data.length (timelineData, reportData, chartData, etc.)
  // timelineData.length => (timelineData?.length ?? 0)
  const dataLengthPattern = /\b(\w+Data)\.length\b/g;
  const dataLengthMatches = [];
  let match;

  while ((match = dataLengthPattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 5), match.index);
    // Skip if already has null safety
    if (!before.includes('?.') && !before.includes('(')) {
      dataLengthMatches.push({
        full: match[0],
        varName: match[1],
        index: match.index
      });
    }
  }

  // Apply fixes in reverse order
  dataLengthMatches.reverse().forEach(m => {
    const before = `${m.varName}.length`;
    const after = `(${m.varName}?.length ?? 0)`;
    content = content.substring(0, m.index) + after + content.substring(m.index + before.length);
    changeCount++;
  });

  // Pattern 2: array.map without null safety
  // results.map => (results ?? []).map
  // But ONLY if not already wrapped
  const arrayMapPattern = /\b(\w+Data|results|records|rows)\.map\(/g;
  const arrayMapMatches = [];

  while ((match = arrayMapPattern.exec(content)) !== null) {
    const before = content.substring(Math.max(0, match.index - 5), match.index);
    // Skip if already has null safety
    if (!before.includes('?.') && !before.includes('(') && !before.includes('??')) {
      arrayMapMatches.push({
        full: match[0],
        varName: match[1],
        index: match.index
      });
    }
  }

  // Apply map fixes
  arrayMapMatches.reverse().forEach(m => {
    const before = `${m.varName}.map(`;
    const after = `(${m.varName} ?? []).map(`;
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
    console.log('🔧 Applying extended null safety fixes...\n');

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
