const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Finding files with TypeScript errors...');

// Get all TypeScript files with errors
let tscOutput;
try {
    execSync('npx tsc --noEmit --skipLibCheck', { encoding: 'utf8', cwd: __dirname });
} catch (error) {
    tscOutput = error.stdout || error.stderr || '';
}

const errorLines = tscOutput.split('\n').filter(line => line.includes('error TS'));
const files = new Set();

errorLines.forEach(line => {
    const match = line.match(/^(.+\.tsx?)\(\d+,\d+\):/);
    if (match) {
        const file = match[1];
        if (!file.includes('node_modules') && fs.existsSync(file)) {
            files.add(file);
        }
    }
});

const fileList = Array.from(files).sort();
console.log(`Found ${fileList.length} files with errors\n`);

let totalFixed = 0;

fileList.forEach(file => {
    console.log(`Processing: ${file}`);
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Pattern 1: Fix addNotification calls
    content = content.replace(/addNotification\('(\w+)',\s*'([^']+)'\)/g, "addNotification({ type: '$1', message: '$2' })");
    content = content.replace(/addNotification\("(\w+)",\s*"([^"]+)"\)/g, 'addNotification({ type: "$1", message: "$2" })');
    content = content.replace(/addNotification\('(\w+)',\s*`([^`]+)`\)/g, "addNotification({ type: '$1', message: `$2` })");

    // Pattern 2: Fix Select onChange with e.target.value (simple cases)
    content = content.replace(/onChange=\{e\s*=>\s*([^}]+?)e\.target\.value/g, 'onChange={value => $1value');
    content = content.replace(/onChange=\{\(e\)\s*=>\s*([^}]+?)e\.target\.value/g, 'onChange={(value) => $1value');

    // Pattern 3: Fix Select onChange with as any cast
    content = content.replace(/onChange=\{e\s*=>\s*([^}]+?)e\.target\.value\s+as\s+any\}/g, 'onChange={(value) => $1value}');

    // Pattern 4: Remove enableExport prop from VirtualizedDataGrid
    content = content.replace(/\s+enableExport\b/g, '');

    // Pattern 5: Remove enableGrouping prop
    content = content.replace(/\s+enableGrouping\b/g, '');

    // Pattern 6: Remove enableFiltering prop
    content = content.replace(/\s+enableFiltering\b/g, '');

    // Pattern 7: Remove data-cy from VirtualizedDataGrid (keep only on parent divs)
    content = content.replace(/(<VirtualizedDataGrid[^>]*)\s+data-cy="[^"]+"/g, '$1');

    // Pattern 8: Fix Badge variant="secondary" to variant="default"
    content = content.replace(/<Badge\s+variant="secondary"/g, '<Badge variant="default"');

    // Pattern 9: Fix Badge variant="error" to variant="danger"
    content = content.replace(/<Badge\s+variant="error"/g, '<Badge variant="danger"');

    // Pattern 10: Fix showSuccess, showError, showInfo calls
    content = content.replace(/showSuccess\('([^']+)'\)/g, "showSuccess({ message: '$1' })");
    content = content.replace(/showError\('([^']+)'\)/g, "showError({ message: '$1' })");
    content = content.replace(/showInfo\('([^']+)'\)/g, "showInfo({ message: '$1' })");
    content = content.replace(/showSuccess\(`([^`]+)`\)/g, "showSuccess({ message: `$1` })");
    content = content.replace(/showError\(`([^`]+)`\)/g, "showError({ message: `$1` })");
    content = content.replace(/showInfo\(`([^`]+)`\)/g, "showInfo({ message: `$1` })");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  ✓ Fixed ${file}`);
        totalFixed++;
    } else {
        console.log(`  - No changes needed`);
    }
});

console.log(`\nFixed ${totalFixed} files\n`);
console.log('Running TypeScript check...');

try {
    execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l', {
        encoding: 'utf8',
        cwd: __dirname,
        stdio: 'inherit'
    });
} catch (error) {
    // Error count will be displayed
}
