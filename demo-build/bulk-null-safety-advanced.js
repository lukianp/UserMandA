const fs = require('fs');
const path = require('path');

const advancedDir = path.join(__dirname, 'src/renderer/views/advanced');
const files = fs.readdirSync(advancedDir).filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(advancedDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: data.length -> (data ?? []).length
  const lengthPattern = /\bdata\.length\b(?!\s*>)/g;
  if (lengthPattern.test(content)) {
    content = content.replace(/\bdata\.length\b/g, '(data ?? []).length');
    modified = true;
  }

  // Pattern 2: data.filter -> (data ?? []).filter
  if (content.includes('data.filter(')) {
    content = content.replace(/\bdata\.filter\(/g, '(data ?? []).filter(');
    modified = true;
  }

  // Pattern 3: data.map -> (data ?? []).map
  if (content.includes('data.map(')) {
    content = content.replace(/\bdata\.map\(/g, '(data ?? []).map(');
    modified = true;
  }

  // Pattern 4: data.reduce -> (data ?? []).reduce
  if (content.includes('data.reduce(')) {
    content = content.replace(/\bdata\.reduce\(/g, '(data ?? []).reduce(');
    modified = true;
  }

  // Pattern 5: data.find -> (data ?? []).find
  if (content.includes('data.find(')) {
    content = content.replace(/\bdata\.find\(/g, '(data ?? []).find(');
    modified = true;
  }

  // Pattern 6: data.some -> (data ?? []).some
  if (content.includes('data.some(')) {
    content = content.replace(/\bdata\.some\(/g, '(data ?? []).some(');
    modified = true;
  }

  // Pattern 7: data.every -> (data ?? []).every
  if (content.includes('data.every(')) {
    content = content.replace(/\bdata\.every\(/g, '(data ?? []).every(');
    modified = true;
  }

  // Pattern 8: items.length -> (items ?? []).length
  if (content.includes('items.length')) {
    content = content.replace(/\bitems\.length\b/g, '(items ?? []).length');
    modified = true;
  }

  // Pattern 9: items.filter -> (items ?? []).filter
  if (content.includes('items.filter(')) {
    content = content.replace(/\bitems\.filter\(/g, '(items ?? []).filter(');
    modified = true;
  }

  // Pattern 10: items.map -> (items ?? []).map
  if (content.includes('items.map(')) {
    content = content.replace(/\bitems\.map\(/g, '(items ?? []).map(');
    modified = true;
  }

  // Pattern 11: list.length -> (list ?? []).length
  if (content.includes('list.length')) {
    content = content.replace(/\blist\.length\b/g, '(list ?? []).length');
    modified = true;
  }

  // Pattern 12: results.length -> (results ?? []).length
  if (content.includes('results.length')) {
    content = content.replace(/\bresults\.length\b/g, '(results ?? []).length');
    modified = true;
  }

  // Pattern 13: apis.length, users.length, etc.
  const arrayVarPattern = /\b(apis|users|groups|logs|rules|policies|configurations|settings|services)\.length\b/g;
  if (arrayVarPattern.test(content)) {
    content = content.replace(arrayVarPattern, '($1 ?? []).length');
    modified = true;
  }

  // Pattern 14: Fix already doubled null coalescing
  content = content.replace(/\(\(data \?\? \[\]\) \?\? \[\]\)/g, '(data ?? [])');
  content = content.replace(/\(\(items \?\? \[\]\) \?\? \[\]\)/g, '(items ?? [])');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} advanced view files`);
