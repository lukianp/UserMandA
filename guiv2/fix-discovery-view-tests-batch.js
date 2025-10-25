const fs = require('fs');
const path = require('path');

// List of discovery view test files that need fixes
const testFiles = [
  'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
  'src/renderer/views/discovery/SharePointDiscoveryView.test.tsx',
  'src/renderer/views/discovery/Office365DiscoveryView.test.tsx',
  'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.test.tsx',
  'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ApplicationDiscoveryView.test.tsx',
  'src/renderer/views/discovery/OneDriveDiscoveryView.test.tsx',
  'src/renderer/views/discovery/SQLServerDiscoveryView.test.tsx',
  'src/renderer/views/discovery/VMwareDiscoveryView.test.tsx',
  'src/renderer/views/discovery/FileSystemDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ActiveDirectoryDiscoveryView.test.tsx',
  'src/renderer/views/discovery/TeamsDiscoveryView.test.tsx',
  'src/renderer/views/discovery/SecurityInfrastructureDiscoveryView.test.tsx',
  'src/renderer/views/discovery/PowerPlatformDiscoveryView.test.tsx',
  'src/renderer/views/discovery/LicensingDiscoveryView.test.tsx',
  'src/renderer/views/discovery/HyperVDiscoveryView.test.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/NetworkDiscoveryView.test.tsx',
];

let totalFixed = 0;

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${filePath} - File not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix 1: Replace cancel-discovery-btn test to use button role/text
  if (content.includes("screen.getByTestId('cancel-discovery-btn')")) {
    content = content.replace(
      /expect\(screen\.getByTestId\('cancel-discovery-btn'\)\)\.toBeInTheDocument\(\);/g,
      'expect(screen.getByRole(\'button\', { name: /Stop|Cancel/i })).toBeInTheDocument();'
    );

    content = content.replace(
      /const button = screen\.getByTestId\('cancel-discovery-btn'\);/g,
      'const button = screen.getByRole(\'button\', { name: /Stop|Cancel/i });'
    );

    modified = true;
  }

  // Fix 2: Replace export-btn test to use existing export buttons or role
  if (content.includes("screen.getByTestId('export-btn')")) {
    content = content.replace(
      /const button = screen\.getByTestId\('export-btn'\);/g,
      'const button = screen.getByRole(\'button\', { name: /Export|CSV/i });'
    );

    content = content.replace(
      /expect\(screen\.getByTestId\('export-btn'\)\.closest\('button'\)\)\.toBeDisabled\(\);/g,
      'expect(screen.getByRole(\'button\', { name: /Export|CSV/i })).toBeDisabled();'
    );

    modified = true;
  }

  // Fix 3: Replace clear-logs-btn test (if it exists)
  if (content.includes("screen.getByTestId('clear-logs-btn')")) {
    content = content.replace(
      /screen\.getByTestId\('clear-logs-btn'\)/g,
      'screen.getByRole(\'button\', { name: /Clear/i })'
    );

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`FIXED: ${filePath}`);
  } else {
    console.log(`NO CHANGE: ${filePath}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}/${testFiles.length}`);
