const fs = require('fs');
const path = require('path');

const mismatches = [
  {
    file: 'src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.test.tsx',
    wrongHook: 'useAWSCloudInfrastructureDiscoveryLogic',
    correctHook: 'useAWSDiscoveryLogic',
  },
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
    wrongHook: 'useConditionalAccessPoliciesDiscoveryLogic',
    correctHook: 'useConditionalAccessDiscoveryLogic',
  },
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
    wrongHook: 'useWebServerConfigurationDiscoveryLogic',
    correctHook: 'useWebServerDiscoveryLogic',
  },
];

console.log('='.repeat(80));
console.log('FIXING HOOK IMPORT/MOCK MISMATCHES');
console.log('='.repeat(80));
console.log('');

let fixedCount = 0;

mismatches.forEach(({ file, wrongHook, correctHook }) => {
  console.log(`Processing: ${path.basename(file)}`);
  console.log(`  Replacing: ${wrongHook} → ${correctHook}`);

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Replace in jest.mock() call
  content = content.replace(
    new RegExp(`jest\\.mock\\(['"]\\.\\.\/\\.\\.\/hooks\/${wrongHook}['"]`, 'g'),
    `jest.mock('../../hooks/${correctHook}'`
  );

  // Replace in the mock object definition
  content = content.replace(
    new RegExp(`${wrongHook}:\\s*jest\\.fn\\(\\)`, 'g'),
    `${correctHook}: jest.fn()`
  );

  // Replace in import statement
  content = content.replace(
    new RegExp(`import\\s+\\{\\s*${wrongHook}\\s*\\}\\s+from\\s+['"]\\.\\.\/\\.\\.\/hooks\/${wrongHook}['"]`, 'g'),
    `import { ${correctHook} } from '../../hooks/${correctHook}'`
  );

  // Replace variable references (e.g., mockUseAWSCloudInfrastructureDiscoveryLogic)
  const wrongVarName = `mockUse${wrongHook.replace('use', '')}`;
  const correctVarName = `mock${correctHook.charAt(0).toUpperCase()}${correctHook.slice(1)}`;

  // Replace in const declaration
  content = content.replace(
    new RegExp(`const\\s+${wrongVarName}\\s*=\\s*${wrongHook}`, 'g'),
    `const ${correctVarName} = ${correctHook}`
  );

  // Replace all usage of the variable
  content = content.replace(
    new RegExp(`\\b${wrongVarName}\\b`, 'g'),
    correctVarName
  );

  // Replace the hook name in type assertion
  content = content.replace(
    new RegExp(`as\\s+jest\\.MockedFunction<typeof\\s+${wrongHook}>`, 'g'),
    `as jest.MockedFunction<typeof ${correctHook}>`
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  ✓ Fixed`);
    fixedCount++;
  } else {
    console.log(`  ⚠ No changes made`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`Fixed ${fixedCount} out of ${mismatches.length} files`);
console.log('='.repeat(80));
