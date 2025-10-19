/**
 * Fix Date and Number Formatting Errors
 *
 * Fixes toLocaleString() calls on potentially undefined values
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all view files that use toLocaleString
const viewFiles = glob.sync('src/renderer/views/**/*.tsx', { cwd: __dirname });

let totalFixed = 0;

viewFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changes = [];

  // Pattern 1: Direct number toLocaleString (value.toLocaleString())
  // Replace with: (value ?? 0).toLocaleString()
  const numberPattern = /\{(\w+)\.toLocaleString\(\)\}/g;
  if (content.match(numberPattern)) {
    content = content.replace(numberPattern, '{($1 ?? 0).toLocaleString()}');
    changes.push('Fixed direct number toLocaleString');
  }

  // Pattern 2: Property access toLocaleString (obj.prop.toLocaleString())
  // Replace with: (obj.prop ?? 0).toLocaleString()
  const propPattern = /\{(\w+\.\w+)\.toLocaleString\(\)\}/g;
  if (content.match(propPattern)) {
    content = content.replace(propPattern, '{($1 ?? 0).toLocaleString()}');
    changes.push('Fixed property toLocaleString');
  }

  // Pattern 3: Complex expressions (e.g., stats?.totalAccessReviews || 0).toLocaleString())
  // Already safe with || 0, but check for ones without
  const complexPattern = /\{(\w+\?\.\w+)\.toLocaleString\(\)\}/g;
  if (content.match(complexPattern)) {
    content = content.replace(complexPattern, '{($1 ?? 0).toLocaleString()}');
    changes.push('Fixed complex toLocaleString');
  }

  // Pattern 4: Date toLocaleString (date.toLocaleString())
  // Replace with: date ? new Date(date).toLocaleString() : 'N/A'
  // Look for patterns like {someDate.toLocaleString()}
  const datePattern = /\{(\w+(?:Date|Time|timestamp))\.toLocaleString\(\)\}/gi;
  if (content.match(datePattern)) {
    content = content.replace(datePattern, (match, varName) => {
      return `{${varName} ? new Date(${varName}).toLocaleString() : 'N/A'}`;
    });
    changes.push('Fixed date toLocaleString');
  }

  // Pattern 5: In variable assignments or expressions outside JSX
  // e.g., const formatted = value.toLocaleString();
  const assignmentPattern = /(\s+)const\s+(\w+)\s*=\s*(\w+)\.toLocaleString\(\);/g;
  if (content.match(assignmentPattern)) {
    content = content.replace(assignmentPattern, '$1const $2 = ($3 ?? 0).toLocaleString();');
    changes.push('Fixed assignment toLocaleString');
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed ${filePath}`);
    console.log(`  Changes: ${changes.join(', ')}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} view files`);
