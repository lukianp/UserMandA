const fs = require('fs');
const path = require('path');

const discoveryViewTests = [
  'IntuneDiscoveryView.test.tsx',
  'DomainDiscoveryView.test.tsx',
  'AzureDiscoveryView.test.tsx',
  'AWSCloudInfrastructureDiscoveryView.test.tsx',
  'WebServerConfigurationDiscoveryView.test.tsx',
  'SharePointDiscoveryView.test.tsx',
  'Office365DiscoveryView.test.tsx',
  'ExchangeDiscoveryView.test.tsx',
  'ApplicationDiscoveryView.test.tsx',
  'SQLServerDiscoveryView.test.tsx',
  'OneDriveDiscoveryView.test.tsx',
  'VMwareDiscoveryView.test.tsx',
  'FileSystemDiscoveryView.test.tsx',
  'TeamsDiscoveryView.test.tsx',
  'SecurityInfrastructureDiscoveryView.test.tsx',
  'PowerPlatformDiscoveryView.test.tsx',
  'LicensingDiscoveryView.test.tsx',
  'HyperVDiscoveryView.test.tsx',
  'NetworkDiscoveryView.test.tsx',
  'ConditionalAccessPoliciesDiscoveryView.test.tsx',
  'IdentityGovernanceDiscoveryView.test.tsx',
  'DataLossPreventionDiscoveryView.test.tsx',
  'GoogleWorkspaceDiscoveryView.test.tsx',
];

const baseDir = path.join(__dirname, 'src/renderer/views/discovery');

discoveryViewTests.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: getByTestId for main view container
  const testIdPattern = /screen\.getByTestId\(['"](\w+-discovery-view)['"]\)/g;
  const matches = content.match(testIdPattern);
  if (matches) {
    // Get actual data-cy from component (need to infer from test file name)
    const componentName = file.replace('.test.tsx', '');
    const dataCyName = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .slice(1)
      .replace('-view', '-discovery-view');

    // Common pattern: replace -discovery-view with shorter version
    const shortName = dataCyName.replace('-discovery-view', '-discovery');

    content = content.replace(
      /screen\.getByTestId\(['"]active-directory-discovery-view['"]\)/g,
      `screen.getByTestId('ad-discovery-view')`
    );
  }

  // Fix 2: Replace isRunning with isDiscovering
  if (content.includes('isRunning: true')) {
    content = content.replace(/isRunning: true,/g, 'isDiscovering: true,');
    modified = true;
  }

  // Fix 3: Replace getByRole button with getByTestId for common buttons
  if (content.includes(`screen.getByRole('button', { name: /Stop|Cancel/i })`)) {
    content = content.replace(
      /screen\.getByRole\('button',\s*\{\s*name:\s*\/Stop\|Cancel\/i\s*\}\)/g,
      `screen.getByTestId('cancel-discovery-btn')`
    );
    modified = true;
  }

  if (content.includes(`screen.getByRole('button', { name: /Export|CSV/i })`)) {
    content = content.replace(
      /screen\.getByRole\('button',\s*\{\s*name:\s*\/Export\|CSV\/i\s*\}\)/g,
      `screen.getByTestId('export-btn')`
    );
    modified = true;
  }

  // Fix 4: Replace results with currentResult
  if (content.includes('results: mockDiscoveryData()')) {
    content = content.replace(
      /results: mockDiscoveryData\(\)/g,
      `currentResult: { users: [], groups: [], stats: createUniversalStats() }`
    );
    modified = true;
  }

  if (content.includes('results: null')) {
    content = content.replace(/results: null/g, 'currentResult: null');
    modified = true;
  }

  // Fix 5: Replace error with errors array
  if (content.includes(`error: 'Test error message'`)) {
    content = content.replace(
      /error: 'Test error message'/g,
      `errors: ['Test error message']`
    );
    modified = true;
  }

  // Fix 6: Fix progress structure
  const oldProgress = /progress: \{\s*current: (\d+),\s*total: (\d+),\s*percentage: (\d+)/g;
  if (oldProgress.test(content)) {
    content = content.replace(
      /progress: \{\s*current: (\d+),\s*total: (\d+),\s*percentage: (\d+)[^}]*\}/g,
      (match, current, total, percentage) => {
        return `progress: {\n          progress: ${percentage},\n          currentOperation: 'Processing...',\n          estimatedTimeRemaining: 30,\n        }`;
      }
    );
    modified = true;
  }

  // Fix 7: Replace single text match with getAllByText for duplicate elements
  const duplicateTextPatterns = [
    { pattern: /expect\(screen\.getByText\(\/Users\/i\)\)\.toBeInTheDocument\(\);/, replacement: `const usersElements = screen.getAllByText(/Users/i);\n      expect(usersElements.length).toBeGreaterThan(0);` },
    { pattern: /expect\(screen\.getByText\(\/50%\/i\)\)\.toBeInTheDocument\(\);/, replacement: `const progressElements = screen.getAllByText(/50%/i);\n      expect(progressElements.length).toBeGreaterThan(0);` },
  ];

  duplicateTextPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Fix 8: Add selectedTab for export button tests
  const exportTestPattern = /it\(['"]calls exportResults when export button clicked['"],[\s\S]*?exportResults,\s*\n\s*\}\s*as any\);/g;
  content = content.replace(exportTestPattern, (match) => {
    if (!match.includes('selectedTab:')) {
      return match.replace(
        'exportResults,',
        `exportResults,\n        selectedTab: 'users', // export-btn only shows when not on overview tab`
      );
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  No changes: ${file}`);
  }
});

console.log('\n✅ Bulk fix complete!');
