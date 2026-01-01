const fs = require('fs');

const fixes = [
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
    from: /const \{ useConditionalAccessPoliciesDiscoveryLogic \} = require\('\.\.\/\.\.\/hooks\/useConditionalAccessPoliciesDiscoveryLogic'\);/g,
    to: "const { useConditionalAccessDiscoveryLogic } = require('../../hooks/useConditionalAccessDiscoveryLogic');",
  },
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
    from: /useConditionalAccessPoliciesDiscoveryLogic\.mockReturnValue/g,
    to: "useConditionalAccessDiscoveryLogic.mockReturnValue",
  },
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
    from: /const \{ useWebServerConfigurationDiscoveryLogic \} = require\('\.\.\/\.\.\/hooks\/useWebServerConfigurationDiscoveryLogic'\);/g,
    to: "const { useWebServerDiscoveryLogic } = require('../../hooks/useWebServerDiscoveryLogic');",
  },
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
    from: /useWebServerConfigurationDiscoveryLogic\.mockReturnValue/g,
    to: "useWebServerDiscoveryLogic.mockReturnValue",
  },
];

console.log('='.repeat(80));
console.log('FIXING REQUIRE STATEMENTS');
console.log('='.repeat(80));
console.log('');

const filesFixes = {};

fixes.forEach(({ file, from, to }) => {
  if (!filesFixes[file]) {
    filesFixes[file] = [];
  }
  filesFixes[file].push({ from, to });
});

let totalFixed = 0;

Object.entries(filesFixes).forEach(([file, replacements]) => {
  console.log(`Processing: ${file.split('/').pop()}`);

  if (!fs.existsSync(file)) {
    console.log('  ⚠ File not found, skipping');
    console.log('');
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let changeCount = 0;

  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      changeCount += matches.length;
      console.log(`  ✓ Fixed ${matches.length} occurrence(s)`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  ✅ Total fixes: ${changeCount}`);
    totalFixed++;
  } else {
    console.log('  ℹ No changes needed');
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`Fixed ${totalFixed} files`);
console.log('='.repeat(80));
