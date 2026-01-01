const fs = require('fs');
const path = require('path');

// Map of view names to their specific result structures
const viewResultStructures = {
  Office365: {
    users: [],
    guestUsers: [],
    licenses: [],
    services: [],
    tenantInfo: {},
    security: {},
  },
  AWS: {
    instances: [],
    volumes: [],
    vpcs: [],
  },
  ActiveDirectory: {
    users: [],
    groups: [],
    computers: [],
    organizationalUnits: [],
  },
  Azure: {
    subscriptions: [],
    resourceGroups: [],
    resources: [],
  },
  ConditionalAccessPolicies: {
    policies: [],
  },
  DataLossPrevention: {
    policies: [],
    rules: [],
  },
  Domain: {
    domains: [],
    controllers: [],
  },
  EnvironmentDetection: {
    environments: [],
  },
  Exchange: {
    mailboxes: [],
    recipients: [],
  },
  FileSystem: {
    drives: [],
    shares: [],
    files: [],
  },
  GoogleWorkspace: {
    users: [],
    groups: [],
    domains: [],
  },
  HyperV: {
    virtualMachines: [],
    hosts: [],
  },
  IdentityGovernance: {
    accessReviews: [],
    entitlements: [],
  },
  InfrastructureDiscoveryHub: {
    servers: [],
    networks: [],
  },
  Intune: {
    devices: [],
    policies: [],
  },
  Licensing: {
    licenses: [],
    assignments: [],
  },
  Network: {
    devices: [],
    interfaces: [],
  },
  PowerPlatform: {
    environments: [],
    apps: [],
  },
  SQLServer: {
    instances: [],
    databases: [],
  },
  SecurityInfrastructure: {
    policies: [],
    alerts: [],
  },
  VMware: {
    virtualMachines: [],
    hosts: [],
    clusters: [],
  },
  WebServerConfiguration: {
    servers: [],
    sites: [],
  },
  Application: {
    applications: [],
  },
};

const discoveryViews = [
  'Office365DiscoveryView',
  'AWSCloudInfrastructureDiscoveryView',
  'ActiveDirectoryDiscoveryView',
  'ApplicationDiscoveryView',
  'AzureDiscoveryView',
  'ConditionalAccessPoliciesDiscoveryView',
  'DataLossPreventionDiscoveryView',
  'DomainDiscoveryView',
  'EnvironmentDetectionView',
  'ExchangeDiscoveryView',
  'FileSystemDiscoveryView',
  'GoogleWorkspaceDiscoveryView',
  'HyperVDiscoveryView',
  'IdentityGovernanceDiscoveryView',
  'InfrastructureDiscoveryHubView',
  'IntuneDiscoveryView',
  'LicensingDiscoveryView',
  'NetworkDiscoveryView',
  'PowerPlatformDiscoveryView',
  'SQLServerDiscoveryView',
  'SecurityInfrastructureDiscoveryView',
  'VMwareDiscoveryView',
  'WebServerConfigurationDiscoveryView',
];

function getViewKey(viewName) {
  // Remove 'DiscoveryView' or 'View' suffix
  return viewName.replace(/DiscoveryView|View/g, '');
}

function fixDiscoveryTest(viewName) {
  const filePath = path.join(__dirname, `src/renderer/views/discovery/${viewName}.test.tsx`);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${viewName} - file not found`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const viewKey = getViewKey(viewName);
  const resultStructure = viewResultStructures[viewKey] || { items: [] };
  const resultJson = JSON.stringify(resultStructure, null, 6).replace(/^/gm, '      ');

  // Pattern 1: Fix currentResult to be an object with arrays (not null)
  content = content.replace(
    /currentResult: null,/g,
    `currentResult: ${resultJson},`
  );

  // Pattern 2: Fix progress structure (percentComplete/phaseLabel/itemsProcessed)
  content = content.replace(
    /progress: \{\s+progress: (\d+),\s+currentOperation: '([^']+)',\s+estimatedTimeRemaining: \d+,?\s+\}/g,
    `progress: {\n          percentComplete: $1,\n          phaseLabel: '$2',\n          itemsProcessed: 0,\n        }`
  );

  content = content.replace(
    /progress: createUniversalProgress\(\),/g,
    `progress: {\n      percentComplete: 0,\n      phaseLabel: '',\n      itemsProcessed: 0,\n    },`
  );

  // Pattern 3: Fix filters object (not searchText)
  content = content.replace(
    /searchText: '',/g,
    `searchText: '',\n    filters: { searchText: '' },`
  );

  // Pattern 4: Fix error to be string (not null)
  content = content.replace(
    /error: null,/g,
    `error: '',`
  );

  // Pattern 5: Add exportData function (in addition to exportResults)
  if (!content.includes('exportData:')) {
    content = content.replace(
      /exportResults: jest\.fn\(\),/g,
      `exportResults: jest.fn(),\n    exportData: jest.fn(),`
    );
  }

  // Pattern 6: Fix export button test to use exportResults with parameter
  content = content.replace(
    /const exportResults = jest\.fn\(\);[\s\S]*?useOffice365DiscoveryLogic\.mockReturnValue\(\{[\s\S]*?exportResults,[\s\S]*?\}\);[\s\S]*?render\(<Office365DiscoveryView \/>\);[\s\S]*?const button = screen\.getByTestId\('export-btn'\);[\s\S]*?fireEvent\.click\(button\);[\s\S]*?expect\(exportResults\)\.toHaveBeenCalled\(\);/,
    `const exportResults = jest.fn();\n      useOffice365DiscoveryLogic.mockReturnValue({\n        ...mockHookDefaults,\n        selectedTab: 'users',\n        currentResult: {\n          users: [{ id: '1' }],\n          stats: createUniversalStats()\n        },\n        exportResults,\n      });\n\n      render(<Office365DiscoveryView />);\n      const button = screen.getByTestId('export-btn');\n      fireEvent.click(button);\n\n      expect(exportResults).toHaveBeenCalled();`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${viewName}`);
  return true;
}

// Process all discovery views
let fixed = 0;
let failed = 0;

discoveryViews.forEach(viewName => {
  try {
    if (fixDiscoveryTest(viewName)) {
      fixed++;
    }
  } catch (error) {
    console.error(`✗ Error fixing ${viewName}:`, error.message);
    failed++;
  }
});

console.log(`\nSummary: ${fixed} fixed, ${failed} failed`);
