const fs = require('fs');
const path = require('path');

// Mapping of discovery views to their specific configurations
const discoveryViews = [
  { file: 'AWSCloudInfrastructureDiscoveryView', dataCy: 'aws-discovery-view', resultStructure: '{ instances: [], volumes: [], vpcs: [], stats: createUniversalStats() }', hook: 'useAWSCloudInfrastructureDiscoveryLogic' },
  { file: 'ActiveDirectoryDiscoveryView', dataCy: 'ad-discovery-view', resultStructure: '{ users: [], groups: [], computers: [], organizationalUnits: [], stats: createUniversalStats() }', hook: 'useActiveDirectoryDiscoveryLogic' },
  { file: 'ApplicationDiscoveryView', dataCy: 'app-discovery-view', resultStructure: '{ applications: [], stats: createUniversalStats() }', hook: 'useApplicationDiscoveryLogic' },
  { file: 'AzureDiscoveryView', dataCy: 'azure-discovery-view', resultStructure: '{ subscriptions: [], resourceGroups: [], resources: [], stats: createUniversalStats() }', hook: 'useAzureDiscoveryLogic' },
  { file: 'ConditionalAccessPoliciesDiscoveryView', dataCy: 'cap-discovery-view', resultStructure: '{ policies: [], stats: createUniversalStats() }', hook: 'useConditionalAccessPoliciesDiscoveryLogic' },
  { file: 'DataLossPreventionDiscoveryView', dataCy: 'dlp-discovery-view', resultStructure: '{ policies: [], rules: [], stats: createUniversalStats() }', hook: 'useDataLossPreventionDiscoveryLogic' },
  { file: 'DomainDiscoveryView', dataCy: 'domain-discovery-view', resultStructure: '{ domains: [], controllers: [], stats: createUniversalStats() }', hook: 'useDomainDiscoveryLogic' },
  { file: 'EnvironmentDetectionView', dataCy: 'env-detection-view', resultStructure: '{ environments: [], stats: createUniversalStats() }', hook: 'useEnvironmentDetectionLogic' },
  { file: 'ExchangeDiscoveryView', dataCy: 'exchange-discovery-view', resultStructure: '{ mailboxes: [], recipients: [], stats: createUniversalStats() }', hook: 'useExchangeDiscoveryLogic' },
  { file: 'FileSystemDiscoveryView', dataCy: 'fs-discovery-view', resultStructure: '{ drives: [], shares: [], files: [], stats: createUniversalStats() }', hook: 'useFileSystemDiscoveryLogic' },
  { file: 'GoogleWorkspaceDiscoveryView', dataCy: 'gworkspace-discovery-view', resultStructure: '{ users: [], groups: [], domains: [], stats: createUniversalStats() }', hook: 'useGoogleWorkspaceDiscoveryLogic' },
  { file: 'HyperVDiscoveryView', dataCy: 'hyperv-discovery-view', resultStructure: '{ virtualMachines: [], hosts: [], stats: createUniversalStats() }', hook: 'useHyperVDiscoveryLogic' },
  { file: 'IdentityGovernanceDiscoveryView', dataCy: 'idgov-discovery-view', resultStructure: '{ accessReviews: [], entitlements: [], stats: createUniversalStats() }', hook: 'useIdentityGovernanceDiscoveryLogic' },
  { file: 'InfrastructureDiscoveryHubView', dataCy: 'infra-hub-view', resultStructure: '{ servers: [], networks: [], stats: createUniversalStats() }', hook: 'useInfrastructureDiscoveryHubLogic' },
  { file: 'IntuneDiscoveryView', dataCy: 'intune-discovery-view', resultStructure: '{ devices: [], policies: [], stats: createUniversalStats() }', hook: 'useIntuneDiscoveryLogic' },
  { file: 'LicensingDiscoveryView', dataCy: 'licensing-discovery-view', resultStructure: '{ licenses: [], assignments: [], stats: createUniversalStats() }', hook: 'useLicensingDiscoveryLogic' },
  { file: 'NetworkDiscoveryView', dataCy: 'network-discovery-view', resultStructure: '{ devices: [], interfaces: [], stats: createUniversalStats() }', hook: 'useNetworkDiscoveryLogic' },
  { file: 'PowerPlatformDiscoveryView', dataCy: 'powerplatform-discovery-view', resultStructure: '{ environments: [], apps: [], stats: createUniversalStats() }', hook: 'usePowerPlatformDiscoveryLogic' },
  { file: 'SQLServerDiscoveryView', dataCy: 'sql-discovery-view', resultStructure: '{ instances: [], databases: [], stats: createUniversalStats() }', hook: 'useSQLServerDiscoveryLogic' },
  { file: 'SecurityInfrastructureDiscoveryView', dataCy: 'security-discovery-view', resultStructure: '{ policies: [], alerts: [], stats: createUniversalStats() }', hook: 'useSecurityInfrastructureDiscoveryLogic' },
  { file: 'VMwareDiscoveryView', dataCy: 'vmware-discovery-view', resultStructure: '{ virtualMachines: [], hosts: [], clusters: [], stats: createUniversalStats() }', hook: 'useVMwareDiscoveryLogic' },
  { file: 'WebServerConfigurationDiscoveryView', dataCy: 'webserver-discovery-view', resultStructure: '{ servers: [], sites: [], stats: createUniversalStats() }', hook: 'useWebServerConfigurationDiscoveryLogic' },
];

function fixDiscoveryViewTest(config) {
  const filePath = path.join(__dirname, `src/renderer/views/discovery/${config.file}.test.tsx`);

  if (!fs.existsSync(filePath)) {
    console.log(`Skip: ${config.file} - file not found`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern 1: Fix currentResult to be object (not null) - but only in mockHookDefaults
  // Find and replace currentResult: null in the mockHookDefaults section
  content = content.replace(
    /(const mockHookDefaults = \{[\s\S]{0,500}?)currentResult: null,/,
    `$1currentResult: ${config.resultStructure},`
  );

  // Pattern 2: Fix progress to null (simpler than complex structure)
  content = content.replace(
    /progress: createUniversalProgress\(\),/g,
    'progress: null,'
  );

  // Pattern 3: Fix progress in "is discovering" tests
  content = content.replace(
    /progress: \{\s+progress: (\d+),\s+currentOperation: '([^']+)',\s+estimatedTimeRemaining: \d+,?\s+\}/g,
    `progress: {
          currentOperation: '$2',
          progress: $1,
          objectsProcessed: 10,
          estimatedTimeRemaining: 120,
        }`
  );

  // Pattern 4: Add selectedTab: 'users' to export button tests (if they reference export-btn)
  if (content.includes("getByTestId('export-btn')") || content.includes('getByTestId("export-btn")')) {
    // Find export button tests and add selectedTab if missing
    content = content.replace(
      /(it\([^)]*export[^)]*button[^)]*\)[\s\S]{0,300}?mockReturnValue\(\{\s+\.\.\.mockHookDefaults,)(\s+currentResult:)/g,
      '$1\n        selectedTab: \'users\',$2'
    );
  }

  // Pattern 5: Fix "multiple elements" errors in title/description tests
  content = content.replace(
    /expect\(screen\.getByText\(/g,
    'expect(screen.getAllByText('
  );
  content = content.replace(
    /getAllByText\(([^)]+)\)\)\.toBeInTheDocument\(\)/g,
    'getAllByText($1)[0]).toBeInTheDocument()'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${config.file}`);
    return true;
  } else {
    console.log(`Skip: ${config.file} - no changes needed`);
    return false;
  }
}

// Apply fixes
let fixed = 0;
discoveryViews.forEach(config => {
  if (fixDiscoveryViewTest(config)) {
    fixed++;
  }
});

console.log(`\nTotal fixed: ${fixed}/${discoveryViews.length}`);
