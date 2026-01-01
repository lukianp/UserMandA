/**
 * Script to automatically fix test mock structures based on actual component requirements
 */

const fs = require('fs');
const path = require('path');

// Counter for fixes applied
let fixedCount = 0;

// Common mock structures based on patterns
const mockTemplates = {
  arrayProps: `[],`,
  templates: `templates: [],`,
  config: `config: {},`,
  statistics: `statistics: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0 },`,
  selectedProfile: `selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },`,
  complianceData: `complianceData: { totalPolicies: 25, compliantPolicies: 20, violations: 5, resolvedViolations: 15, pendingViolations: 5 },`,
  securityData: `securityData: { criticalVulnerabilities: 0, highVulnerabilities: 0, mediumVulnerabilities: 0, lowVulnerabilities: 0, totalVulnerabilities: 0 },`,
  domain: `domain: 'example.com',`,
  selectedDomain: `selectedDomain: { name: 'example.com', toString: jest.fn() },`,
  searchText: `searchText: '',`,
  setSearchText: `setSearchText: jest.fn(),`,
};

/**
 * Analyze a view component to determine what properties it uses from hooks
 */
function analyzeViewComponent(viewPath) {
  if (!fs.existsSync(viewPath)) {
    return [];
  }

  const content = fs.readFileSync(viewPath, 'utf-8');
  const requiredProps = [];

  // Look for destructured properties from hooks
  const hookMatch = content.match(/const\s+\{([^}]+)\}\s+=\s+use\w+Logic\(\)/);
  if (hookMatch) {
    const props = hookMatch[1]
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return props;
  }

  return requiredProps;
}

/**
 * Fix a single test file by adding missing mock properties
 */
function fixTestFile(testPath) {
  console.log(`\nProcessing: ${path.basename(testPath)}`);

  if (!fs.existsSync(testPath)) {
    console.log(`  ⚠ File not found`);
    return false;
  }

  const testContent = fs.readFileSync(testPath, 'utf-8');

  // Find the corresponding view file
  const viewPath = testPath.replace('.test.tsx', '.tsx').replace('.test.ts', '.ts');

  // Analyze what the view needs
  const requiredProps = analyzeViewComponent(viewPath);

  if (requiredProps.length === 0) {
    console.log(`  ℹ No destructured props found`);
    return false;
  }

  console.log(`  📋 Required props: ${requiredProps.join(', ')}`);

  // Find the mockHookDefaults object
  const mockDefaultsMatch = testContent.match(/(const mockHookDefaults = \{)([^}]*)\}/s);

  if (!mockDefaultsMatch) {
    console.log(`  ⚠ No mockHookDefaults found`);
    return false;
  }

  const existingMockContent = mockDefaultsMatch[2];
  const existingProps = existingMockContent.match(/(\w+):/g)?.map(p => p.slice(0, -1)) || [];

  // Determine what's missing
  const missingProps = requiredProps.filter(prop => !existingProps.includes(prop));

  if (missingProps.length === 0) {
    console.log(`  ✓ All props already present`);
    return false;
  }

  console.log(`  + Adding missing props: ${missingProps.join(', ')}`);

  // Build the additions
  let additions = '\n';
  missingProps.forEach(prop => {
    // Smart defaults based on prop name patterns
    if (prop.includes('Array') || prop === 'items' || prop === 'modules' || prop === 'templates' ||
        prop === 'policies' || prop === 'teams' || prop === 'sites' || prop === 'applications' ||
        prop === 'devices' || prop === 'users' || prop === 'groups' || prop === 'computers' ||
        prop === 'mailboxes' || prop === 'virtualMachines' || prop === 'servers' || prop === 'databases' ||
        prop === 'resources' || prop === 'subscriptions' || prop === 'instances' || prop === 'apps' ||
        prop === 'flows' || prop === 'domains' || prop === 'errors' || prop === 'columnDefs' ||
        prop === 'filteredData' || prop === 'vCenterServers' || prop === 'hostAddresses' ||
        prop === 'selectedServers' || prop === 'availableModules' || prop === 'installedModules') {
      additions += `    ${prop}: [],\n`;
    } else if (prop === 'config') {
      additions += `    ${mockTemplates.config}\n`;
    } else if (prop === 'statistics') {
      additions += `    ${mockTemplates.statistics}\n`;
    } else if (prop === 'selectedProfile') {
      additions += `    ${mockTemplates.selectedProfile}\n`;
    } else if (prop === 'complianceData') {
      additions += `    ${mockTemplates.complianceData}\n`;
    } else if (prop === 'securityData') {
      additions += `    ${mockTemplates.securityData}\n`;
    } else if (prop === 'domain') {
      additions += `    ${mockTemplates.domain}\n`;
    } else if (prop === 'selectedDomain') {
      additions += `    ${mockTemplates.selectedDomain}\n`;
    } else if (prop === 'searchText') {
      additions += `    ${mockTemplates.searchText}\n`;
    } else if (prop.startsWith('set') || prop.startsWith('update') || prop.startsWith('load') ||
               prop.startsWith('save') || prop.startsWith('cancel') || prop.startsWith('start') ||
               prop.startsWith('export') || prop.startsWith('refresh') || prop.startsWith('clear') ||
               prop.startsWith('detect')) {
      additions += `    ${prop}: jest.fn(),\n`;
    } else if (prop.startsWith('is') || prop.startsWith('has')) {
      additions += `    ${prop}: false,\n`;
    } else if (prop.includes('Tab') || prop === 'selectedTab') {
      additions += `    ${prop}: 'overview',\n`;
    } else if (prop === 'currentResult' || prop === 'result' || prop === 'results') {
      additions += `    ${prop}: null,\n`;
    } else if (prop === 'progress') {
      additions += `    ${prop}: null,\n`;
    } else if (prop === 'error') {
      additions += `    ${prop}: null,\n`;
    } else {
      // Default to null for unknown props
      additions += `    ${prop}: null,\n`;
    }
  });

  // Insert the additions before the closing brace
  const updatedContent = testContent.replace(
    mockDefaultsMatch[0],
    mockDefaultsMatch[1] + mockDefaultsMatch[2] + additions + '  }'
  );

  // Write back
  fs.writeFileSync(testPath, updatedContent, 'utf-8');
  console.log(`  ✅ Fixed!`);
  fixedCount++;
  return true;
}

// Main execution
console.log('=== FIXING TEST MOCK STRUCTURES ===\n');

// Get all test files that have undefined property errors
const testFiles = [
  'src/renderer/views/discovery/TeamsDiscoveryView.test.tsx',
  'src/renderer/views/discovery/IntuneDiscoveryView.test.tsx',
  'src/renderer/views/discovery/DomainDiscoveryView.test.tsx',
  'src/renderer/views/discovery/SharePointDiscoveryView.test.tsx',
  'src/renderer/views/discovery/Office365DiscoveryView.test.tsx',
  'src/renderer/views/assets/NetworkDeviceInventoryView.test.tsx',
  'src/renderer/views/assets/ServerInventoryView.test.tsx',
  'src/renderer/views/security/SecurityAuditView.test.tsx',
  'src/renderer/views/security/ThreatAnalysisView.test.tsx',
  'src/renderer/views/discovery/FileSystemDiscoveryView.test.tsx',
  'src/renderer/views/security/RiskAssessmentView.test.tsx',
  'src/renderer/views/discovery/SecurityInfrastructureDiscoveryView.test.tsx',
  'src/renderer/views/security/PolicyManagementView.test.tsx',
  'src/renderer/views/compliance/ComplianceDashboardView.test.tsx',
  'src/renderer/views/discovery/HyperVDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ApplicationDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/VMwareDiscoveryView.test.tsx',
  'src/renderer/views/security/SecurityDashboardView.test.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.test.tsx',
  'src/renderer/views/compliance/ComplianceReportView.test.tsx',
  'src/renderer/views/discovery/ActiveDirectoryDiscoveryView.test.tsx',
  'src/renderer/views/assets/ComputerInventoryView.test.tsx',
  'src/renderer/views/discovery/SQLServerDiscoveryView.test.tsx',
  'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/AzureDiscoveryView.test.tsx',
  'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
  'src/renderer/views/discovery/EnvironmentDetectionView.test.tsx',
  'src/renderer/views/discovery/InfrastructureDiscoveryHubView.test.tsx',
  'src/renderer/views/discovery/NetworkDiscoveryView.test.tsx',
  'src/renderer/views/discovery/PowerPlatformDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
  'src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.test.tsx',
];

testFiles.forEach(fixTestFile);

console.log(`\n=== SUMMARY ===`);
console.log(`✅ Successfully fixed: ${fixedCount} test files`);
console.log(`\nNext: Run 'npm test' to verify fixes`);
