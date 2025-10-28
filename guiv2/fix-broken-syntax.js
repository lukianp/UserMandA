const fs = require('fs');
const path = require('path');

// Find all TSX and TS files
function findFiles(dir, ext) {
  let results = [];
  try {
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
  } catch (err) {
    // Ignore errors
  }
  return results;
}

const srcDir = path.join(__dirname, 'src');
const tsxFiles = findFiles(srcDir, '.tsx');
const tsFiles = findFiles(srcDir, '.ts');
const allFiles = [...tsxFiles, ...tsFiles];

let totalFixes = 0;

console.log(`Checking ${allFiles.length} files for broken syntax...`);

allFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix pattern: obj.(prop ?? '') -> (obj.prop ?? '')
  // This regex finds patterns like: asset.(name ?? '')
  const brokenPattern = /(\w+)\.\((\w+)\s*\?\?\s*''\)/g;
  if (brokenPattern.test(content)) {
    content = content.replace(brokenPattern, '($1.$2 ?? \'\')');
    modified = true;
    totalFixes++;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${path.relative(__dirname, filePath)}`);
  }
});

console.log(`\n✓ Total files fixed: ${totalFixes}`);
