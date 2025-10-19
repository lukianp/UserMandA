const fs = require('fs');
const path = require('path');

const discoveryViewsDir = 'src/renderer/views/discovery';

// Get all discovery view test files
const testFiles = fs.readdirSync(discoveryViewsDir)
  .filter(f => f.endsWith('.test.tsx'));

console.log('='.repeat(80));
console.log('CHECKING HOOK IMPORT/MOCK MISMATCHES IN DISCOVERY VIEW TESTS');
console.log('='.repeat(80));
console.log('');

const mismatches = [];

testFiles.forEach(testFile => {
  const testPath = path.join(discoveryViewsDir, testFile);
  const componentFile = testFile.replace('.test.tsx', '.tsx');
  const componentPath = path.join(discoveryViewsDir, componentFile);

  // Skip if component doesn't exist
  if (!fs.existsSync(componentPath)) {
    return;
  }

  const testContent = fs.readFileSync(testPath, 'utf8');
  const componentContent = fs.readFileSync(componentPath, 'utf8');

  // Extract hook import from component
  const componentHookImport = componentContent.match(/from\s+['"].*\/hooks\/(use\w+)['"]/);
  const componentHookName = componentHookImport ? componentHookImport[1] : null;

  // Extract mock path from test
  const testMockPath = testContent.match(/jest\.mock\(['"]\.\.\/\.\.\/hooks\/(\w+)['"]/);
  const testMockedHook = testMockPath ? testMockPath[1] : null;

  if (componentHookName && testMockedHook && componentHookName !== testMockedHook) {
    mismatches.push({
      file: testFile,
      component: componentFile,
      componentHook: componentHookName,
      testMock: testMockedHook,
    });
    console.log(`❌ MISMATCH: ${testFile}`);
    console.log(`   Component uses: ${componentHookName}`);
    console.log(`   Test mocks:     ${testMockedHook}`);
    console.log('');
  } else if (componentHookName) {
    console.log(`✓ OK: ${testFile} (${componentHookName})`);
  }
});

console.log('='.repeat(80));
console.log(`Total test files checked: ${testFiles.length}`);
console.log(`Hook mismatches found: ${mismatches.length}`);
console.log('='.repeat(80));

if (mismatches.length > 0) {
  console.log('\nSUMMARY OF MISMATCHES:');
  mismatches.forEach(m => {
    console.log(`  ${m.file}: ${m.componentHook} → ${m.testMock}`);
  });
}
