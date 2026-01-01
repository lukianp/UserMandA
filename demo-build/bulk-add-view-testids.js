const fs = require('fs');
const path = require('path');

// Views that need container data-testid added
const viewsToFix = [
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.tsx',
    testid: 'conditional-access-policies-discovery-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.tsx',
    testid: 'google-workspace-discovery-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/discovery/HyperVDiscoveryView.tsx',
    testid: 'hyper-v-discovery-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.tsx',
    testid: 'identity-governance-discovery-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/discovery/EnvironmentDetectionView.tsx',
    testid: 'environment-detection-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/discovery/DataLossPreventionDiscoveryView.tsx',
    testid: 'data-loss-prevention-discovery-view-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  },
  {
    file: 'src/renderer/views/analytics/MigrationReportView.tsx',
    testid: 'migration-report-view',
    pattern: 'className="flex flex-col h-full bg-white dark:bg-gray-800"'
  }
];

console.log('Adding container data-testid to views...\n');

viewsToFix.forEach(({ file, testid, pattern }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already has the testid
  if (content.includes(`data-testid="${testid}"`)) {
    console.log(`✓ Already has testid: ${file}`);
    return;
  }

  // Add data-testid to the main container div
  const replacement = `${pattern} data-testid="${testid}" data-cy="${testid}"`;
  if (content.includes(pattern)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Added testid to: ${file}`);
  } else {
    console.log(`⚠ Pattern not found in: ${file}`);
  }
});

console.log('\nBulk add complete!');
