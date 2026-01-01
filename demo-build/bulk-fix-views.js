/**
 * Bulk Fix View Tests
 * Systematically fixes common test failures across all view test files
 */

const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'renderer', 'views');

// Common patterns to fix
const fixes = [
  {
    name: 'Fix boolean toBeInTheDocument',
    pattern: /expect\((screen\.queryAllByRole\([^)]+\)\.length > 0 \|\| screen\.query[^)]+\([^)]+\))\)\.toBeInTheDocument\(\);/g,
    replace: (match, condition) => {
      return `expect(${condition}).toBeTruthy();`;
    }
  },
  {
    name: 'Fix data-cy to data-testid',
    pattern: /screen\.getByTestId\('([^']+)-view'\)/g,
    check: (filePath, match, testId) => {
      const viewFileName = path.basename(filePath, '.test.tsx');
      const viewFilePath = filePath.replace('.test.tsx', '.tsx');

      if (fs.existsSync(viewFilePath)) {
        const viewContent = fs.readFileSync(viewFilePath, 'utf8');
        if (!viewContent.includes(`data-testid="${testId}-view"`)) {
          console.log(`  Missing data-testid="${testId}-view" in ${path.basename(viewFilePath)}`);
          return { needsFix: true, viewFilePath, testId };
        }
      }
      return { needsFix: false };
    }
  }
];

function findAllTestFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.lstatSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('View.test.tsx')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Apply regex fixes
  for (const fix of fixes) {
    if (fix.pattern) {
      const newContent = content.replace(fix.pattern, fix.replace);
      if (newContent !== content) {
        console.log(`  Applied: ${fix.name}`);
        content = newContent;
        modified = true;
      }
    }

    // Check-based fixes
    if (fix.check) {
      const matches = [...content.matchAll(fix.pattern)];
      for (const match of matches) {
        const result = fix.check(filePath, ...match);
        if (result.needsFix) {
          // Add data-testid to view file
          const viewContent = fs.readFileSync(result.viewFilePath, 'utf8');

          // Find the main return div and add data-testid
          const returnDivPattern = /return\s*\(\s*<div([^>]*)>/;
          const returnMatch = viewContent.match(returnDivPattern);

          if (returnMatch) {
            const existingAttrs = returnMatch[1];
            if (!existingAttrs.includes('data-testid')) {
              const newViewContent = viewContent.replace(
                returnDivPattern,
                `return (\n    <div${existingAttrs} data-testid="${result.testId}-view">`
              );
              fs.writeFileSync(result.viewFilePath, newViewContent, 'utf8');
              console.log(`  Added data-testid to ${path.basename(result.viewFilePath)}`);
              modified = true;
            }
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function main() {
  console.log('Finding all view test files...\n');
  const testFiles = findAllTestFiles(viewsDir);
  console.log(`Found ${testFiles.length} view test files\n`);

  let fixedCount = 0;

  for (const file of testFiles) {
    const fileName = path.basename(file);
    console.log(`Checking ${fileName}...`);

    if (fixFile(file)) {
      fixedCount++;
      console.log(`  ✓ Fixed\n`);
    } else {
      console.log(`  - No fixes needed\n`);
    }
  }

  console.log(`\nFixed ${fixedCount} / ${testFiles.length} files`);
}

main();
