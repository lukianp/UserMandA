const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, 'src/renderer/hooks');
const discoveryHookFiles = fs.readdirSync(hooksDir)
  .filter(f => f.includes('Discovery') && f.endsWith('.ts') && !f.endsWith('.test.ts'));

let totalFixed = 0;

discoveryHookFiles.forEach(file => {
  const filePath = path.join(hooksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: const X = state.result.Y; -> const X = state.result.Y ?? [];
  // Common in discovery hooks where result properties might be undefined
  const resultPropertyPattern = /const (\w+) = state\.result\.(\w+);/g;
  const matches = [...content.matchAll(resultPropertyPattern)];

  matches.forEach(match => {
    const [fullMatch, varName, propName] = match;
    // Check if the variable is used with array methods in next few lines
    const index = content.indexOf(fullMatch);
    const nextLines = content.substring(index, index + 500);

    if (nextLines.includes(`${varName}.filter`) ||
        nextLines.includes(`${varName}.map`) ||
        nextLines.includes(`${varName}.reduce`) ||
        nextLines.includes(`${varName}.length`)) {
      // This is likely an array that needs null protection
      content = content.replace(fullMatch, `const ${varName} = state.result.${propName} ?? [];`);
      modified = true;
    }
  });

  // Pattern 2: result?.data?.items used directly
  // result?.items?.filter -> (result?.items ?? []).filter
  const optionalChainingArrayPattern = /(\w+\?\.\w+(?:\?\.\w+)*)\.(filter|map|reduce|find|some|every)\(/g;
  if (optionalChainingArrayPattern.test(content)) {
    content = content.replace(optionalChainingArrayPattern, '($1 ?? []).$2(');
    modified = true;
  }

  // Pattern 3: State result property access in stats calculations
  // state.result.items.length -> (state.result.items ?? []).length
  const stateResultArrayPattern = /state\.result\.(\w+)\.(filter|map|reduce|length|find|some|every)\b/g;
  if (stateResultArrayPattern.test(content)) {
    content = content.replace(stateResultArrayPattern, (match, prop, method) => {
      return `(state.result.${prop} ?? []).${method}`;
    });
    modified = true;
  }

  // Pattern 4: currentResult?.items used directly
  const currentResultPattern = /currentResult\?\.(\w+)\.(filter|map|reduce|length|find|some|every)\b/g;
  if (currentResultPattern.test(content)) {
    content = content.replace(currentResultPattern, '(currentResult?.$1 ?? []).$2');
    modified = true;
  }

  // Pattern 5: Clean up double wrapping
  content = content.replace(/\(\((\w+) \?\? \[\]\) \?\? \[\]\)/g, '($1 ?? [])');
  content = content.replace(/\(\((\w+\.\w+) \?\? \[\]\) \?\? \[\]\)/g, '($1 ?? [])');
  content = content.replace(/\(\((\w+\?\.\w+) \?\? \[\]\) \?\? \[\]\)/g, '($1 ?? [])');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`✅ ${file}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} discovery hook files`);
