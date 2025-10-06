const fs = require('fs');
const { execSync } = require('child_process');

console.log('Finding files with JSX syntax errors...');

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

    // Fix: onSelectionChange={setSelectedComputers}={true}={true}
    content = content.replace(/(\w+)=\{([^}]+)\}={true}={true}/g, '$1={$2}');

    // Fix: onChange={(value) => handleUpdateFilter(filter.id, { field: value value })}
    content = content.replace(/\{ field: value value \}/g, '{ field: value }');
    content = content.replace(/\{ operator: value value \}/g, '{ operator: value }');
    content = content.replace(/\{ value: value value \}/g, '{ value: value }');

    // Fix: onChange={value => { const value = value;
    content = content.replace(/onChange=\{value\s*=>\s*\{\s*const value\s*=\s*value;/g, 'onChange={(val) => {\n                const value = val;');

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
    const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l', {
        encoding: 'utf8',
        cwd: __dirname
    });
    console.log(`Remaining errors: ${result.trim()}`);
} catch (error) {
    console.log('Error count:', error.stdout || 'unknown');
}
