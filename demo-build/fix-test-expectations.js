const fs = require('fs');

const fixes = [
  {
    file: 'src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.test.tsx',
    replacements: [
      {
        from: /getByTestId\('a-w-s-cloud-infrastructure-discovery-view'\)/g,
        to: "getByTestId('aws-cloud-infrastructure-discovery-view')",
        description: 'Fix data-cy attribute'
      },
      {
        from: /screen\.getByText\(\/AWS infrastructure discovery\/i\)/g,
        to: "screen.getByText(/Discover and analyze AWS resources/i)",
        description: 'Fix description text matcher'
      },
      {
        from: /const button = screen\.getByText\(\/Start\/i\)/g,
        to: "const button = screen.getByRole('button', { name: /Start Discovery/i })",
        description: 'Fix Start button selector to avoid multiple matches'
      },
      {
        from: /const startButton = screen\.getByText\(\/Start\/i\)/g,
        to: "const startButton = screen.getByRole('button', { name: /Start Discovery/i })",
        description: 'Fix Start button selector in integration test'
      },
      {
        from: /screen\.getByText\(\/Stop\/i\) \|\| screen\.getByText\(\/Cancel\/i\)/g,
        to: "screen.getByRole('button', { name: /Cancel Discovery/i })",
        description: 'Fix Stop button selector'
      },
      {
        from: /const button = screen\.getByText\(\/Stop\/i\) \|\| screen\.getByText\(\/Cancel\/i\)/g,
        to: "const button = screen.getByRole('button', { name: /Cancel Discovery/i })",
        description: 'Fix Stop button selector with const'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
    replacements: [
      {
        from: /getByTestId\('conditional-access-policies-discovery-view'\)/g,
        to: "getByTestId('conditional-access-discovery-view')",
        description: 'Fix data-cy attribute'
      },
      {
        from: /const button = screen\.getByText\(\/Start\/i\)/g,
        to: "const button = screen.getByRole('button', { name: /Start/i })",
        description: 'Fix Start button selector'
      },
      {
        from: /const startButton = screen\.getByText\(\/Start\/i\)/g,
        to: "const startButton = screen.getByRole('button', { name: /Start/i })",
        description: 'Fix Start button selector in integration test'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
    replacements: [
      {
        from: /getByTestId\('web-server-configuration-discovery-view'\)/g,
        to: "getByTestId('web-server-discovery-view')",
        description: 'Fix data-cy attribute'
      },
      {
        from: /const button = screen\.getByText\(\/Start\/i\)/g,
        to: "const button = screen.getByRole('button', { name: /Start/i })",
        description: 'Fix Start button selector'
      },
      {
        from: /const startButton = screen\.getByText\(\/Start\/i\)/g,
        to: "const startButton = screen.getByRole('button', { name: /Start/i })",
        description: 'Fix Start button selector in integration test'
      }
    ]
  }
];

console.log('='.repeat(80));
console.log('FIXING TEST EXPECTATION MISMATCHES');
console.log('='.repeat(80));
console.log('');

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
  console.log(`Processing: ${file.split('/').pop()}`);

  if (!fs.existsSync(file)) {
    console.log('  ⚠ File not found, skipping');
    console.log('');
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  replacements.forEach(({ from, to, description }) => {
    const matches = content.match(from);
    if (matches && matches.length > 0) {
      content = content.replace(from, to);
      console.log(`  ✓ ${description} (${matches.length} replacement${matches.length > 1 ? 's' : ''})`);
      fileChanges += matches.length;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  ✅ Fixed ${fileChanges} issue${fileChanges > 1 ? 's' : ''} in file`);
    totalFixed++;
  } else {
    console.log('  ℹ No changes needed');
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`Fixed ${totalFixed} out of ${fixes.length} files`);
console.log('='.repeat(80));
