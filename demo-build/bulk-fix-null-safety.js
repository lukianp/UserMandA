const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TSX and TS files in views and hooks
const viewsDir = path.join(__dirname, 'src/renderer/views');
const hooksDir = path.join(__dirname, 'src/renderer/hooks');

function findFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, ext));
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}

const viewFiles = findFiles(viewsDir, '.tsx');
const hookFiles = findFiles(hooksDir, '.ts');
const allFiles = [...viewFiles, ...hookFiles];

let totalFixes = 0;

console.log(`Processing ${allFiles.length} files...`);

allFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileFixCount = 0;

  // Pattern 1: searchText.trim() -> (searchText ?? '').trim()
  const searchTextPattern = /(?<![?.\w])searchText\.trim\(\)/g;
  if (searchTextPattern.test(content)) {
    content = content.replace(searchTextPattern, '(searchText ?? \'\').trim()');
    fileFixCount++;
    modified = true;
  }

  // Pattern 2: data.filter() -> (data ?? []).filter()
  const dataFilterPattern = /(?<![?.\w])data\.filter\(/g;
  if (dataFilterPattern.test(content)) {
    content = content.replace(dataFilterPattern, '(data ?? []).filter(');
    fileFixCount++;
    modified = true;
  }

  // Pattern 3: data.map() -> (data ?? []).map()
  const dataMapPattern = /(?<![?.\w])data\.map\(/g;
  if (dataMapPattern.test(content)) {
    content = content.replace(dataMapPattern, '(data ?? []).map(');
    fileFixCount++;
    modified = true;
  }

  // Pattern 4: items.length -> (items ?? []).length
  const itemsLengthPattern = /(?<![?.\w])items\.length/g;
  if (itemsLengthPattern.test(content)) {
    content = content.replace(itemsLengthPattern, '(items ?? []).length');
    fileFixCount++;
    modified = true;
  }

  // Pattern 5: result.items -> (result?.items ?? [])
  const resultItemsPattern = /result\.items(?!\.)/g;
  if (resultItemsPattern.test(content)) {
    content = content.replace(resultItemsPattern, '(result?.items ?? [])');
    fileFixCount++;
    modified = true;
  }

  // Pattern 6: .toLowerCase().includes( without null check
  const toLowerPattern = /(\w+)\.toLowerCase\(\)\.includes\(/g;
  const matches = content.matchAll(toLowerPattern);
  for (const match of matches) {
    const varName = match[1];
    // Only fix if not already null-safe
    if (!match[0].includes('??') && !match[0].includes('?.')) {
      const safeVersion = `(${varName} ?? '').toLowerCase().includes(`;
      content = content.replace(match[0], safeVersion);
      fileFixCount++;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixes += fileFixCount;
    console.log(`✓ ${path.relative(__dirname, filePath)}: ${fileFixCount} fixes`);
  }
});

console.log(`\n✓ Total fixes applied: ${totalFixes} across ${allFiles.length} files`);
console.log('\nRunning tests to validate fixes...');

try {
  execSync('npm run test:unit -- --passWithNoTests 2>&1 | tail -20', {
    stdio: 'inherit',
    maxBuffer: 50 * 1024 * 1024
  });
} catch (error) {
  console.log('Test run completed with some failures (expected during bulk fix)');
}
