/**
 * Script to fix remaining null property issues in test mocks
 * Specifically targets properties that were set to null but need to be objects
 */

const fs = require('fs');
const path = require('path');

let fixedCount = 0;

console.log('=== FIXING REMAINING NULL PROPERTY ISSUES ===\n');

/**
 * Fix null properties that should be objects
 */
function fixNullProperties(testPath) {
  const fileName = path.basename(testPath);
  console.log(`Processing: ${fileName}`);

  if (!fs.existsSync(testPath)) {
    console.log(`  ⚠ File not found`);
    return false;
  }

  let content = fs.readFileSync(testPath, 'utf-8');
  let modified = false;

  // Pattern 1: stats: null -> stats: { total: 0, ... }
  if (content.includes('stats: null')) {
    console.log('  + Fixing stats: null -> stats object');
    // Enhanced stats object with more properties
    content = content.replace(
      /stats: null,/g,
      `stats: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0, online: 0, offline: 0, onlinePercentage: 0, warrantyExpiring: 0, warrantyExpired: 0, highUtilization: 0 },`
    );
    modified = true;
  }

  // Pattern 1b: typeDistribution: null -> typeDistribution array
  if (content.includes('typeDistribution: null')) {
    console.log('  + Fixing typeDistribution: null -> array');
    content = content.replace(
      /typeDistribution: null,/g,
      `typeDistribution: [],`
    );
    modified = true;
  }

  // Pattern 2: filter: null -> filter: { searchText: '', ... }
  if (content.includes('filter: null')) {
    console.log('  + Fixing filter: null -> filter object');
    content = content.replace(
      /filter: null,/g,
      `filter: { searchText: '', category: '', status: '', severity: '' },`
    );
    modified = true;
  }

  // Pattern 2b: filters: null -> filters: { searchText: '', ... } (plural)
  if (content.includes('filters: null')) {
    console.log('  + Fixing filters: null -> filters object');
    content = content.replace(
      /filters: null,/g,
      `filters: { searchText: '', deviceType: '', vendor: '', status: '', location: '' },`
    );
    modified = true;
  }

  // Pattern 2c: filterOptions: null -> filterOptions object
  if (content.includes('filterOptions: null')) {
    console.log('  + Fixing filterOptions: null -> filterOptions object');
    content = content.replace(
      /filterOptions: null,/g,
      `filterOptions: { deviceTypes: [], vendors: [], statuses: [], locations: [], categories: [] },`
    );
    modified = true;
  }

  // Pattern 3: selectedProfile: null -> selectedProfile object (for Azure/Cloud views)
  if (content.includes('selectedProfile: null') &&
      (testPath.includes('Azure') || testPath.includes('Cloud') ||
       testPath.includes('IdentityGovernance') || testPath.includes('DataLossPrevention'))) {
    console.log('  + Fixing selectedProfile: null -> profile object');
    content = content.replace(
      /selectedProfile: null,/g,
      `selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },`
    );
    modified = true;
  }

  // Pattern 4: formData: null -> formData object
  if (content.includes('formData: null')) {
    console.log('  + Fixing formData: null -> formData object');
    content = content.replace(
      /formData: null,/g,
      `formData: { domain: '', username: '', password: '', server: '' },`
    );
    modified = true;
  }

  // Pattern 5: dashboardData: null -> dashboardData object
  if (content.includes('dashboardData: null')) {
    console.log('  + Fixing dashboardData: null -> dashboardData object');
    content = content.replace(
      /dashboardData: null,/g,
      `dashboardData: { widgets: [], lastRefresh: new Date(), summary: {} },`
    );
    modified = true;
  }

  // Pattern 6: securityData: null -> securityData object
  if (content.includes('securityData: null')) {
    console.log('  + Fixing securityData: null -> securityData object');
    content = content.replace(
      /securityData: null,/g,
      `securityData: { criticalVulnerabilities: 0, highVulnerabilities: 0, mediumVulnerabilities: 0, lowVulnerabilities: 0, totalVulnerabilities: 0 },`
    );
    modified = true;
  }

  // Pattern 7: complianceData: null -> complianceData object
  if (content.includes('complianceData: null')) {
    console.log('  + Fixing complianceData: null -> complianceData object');
    content = content.replace(
      /complianceData: null,/g,
      `complianceData: { totalPolicies: 25, compliantPolicies: 20, violations: 5, resolvedViolations: 15, pendingViolations: 5 },`
    );
    modified = true;
  }

  // Pattern 8: discoveryModules: null -> discoveryModules array
  if (content.includes('discoveryModules: null')) {
    console.log('  + Fixing discoveryModules: null -> array');
    content = content.replace(
      /discoveryModules: null,/g,
      `discoveryModules: [],`
    );
    modified = true;
  }

  // Pattern 9: recentActivity: null -> recentActivity array
  if (content.includes('recentActivity: null')) {
    console.log('  + Fixing recentActivity: null -> array');
    content = content.replace(
      /recentActivity: null,/g,
      `recentActivity: [],`
    );
    modified = true;
  }

  // Pattern 10: activeDiscoveries: null -> activeDiscoveries array
  if (content.includes('activeDiscoveries: null')) {
    console.log('  + Fixing activeDiscoveries: null -> array');
    content = content.replace(
      /activeDiscoveries: null,/g,
      `activeDiscoveries: [],`
    );
    modified = true;
  }

  // Pattern 11: sortBy: null -> sortBy string
  if (content.includes('sortBy: null')) {
    console.log('  + Fixing sortBy: null -> string');
    content = content.replace(
      /sortBy: null,/g,
      `sortBy: 'name',`
    );
    modified = true;
  }

  // Pattern 12: connectionStatus: null -> connectionStatus object
  if (content.includes('connectionStatus: null')) {
    console.log('  + Fixing connectionStatus: null -> object');
    content = content.replace(
      /connectionStatus: null,/g,
      `connectionStatus: { connected: false, message: '', lastChecked: null },`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(testPath, content, 'utf-8');
    console.log(`  ✅ Fixed!`);
    fixedCount++;
    return true;
  } else {
    console.log(`  ℹ No null properties found`);
    return false;
  }
}

// Get all test files
const testFiles = [
  'src/renderer/views/discovery/InfrastructureDiscoveryHubView.test.tsx',
  'src/renderer/views/assets/NetworkDeviceInventoryView.test.tsx',
  'src/renderer/views/assets/ServerInventoryView.test.tsx',
  'src/renderer/views/security/SecurityAuditView.test.tsx',
  'src/renderer/views/security/ThreatAnalysisView.test.tsx',
  'src/renderer/views/security/RiskAssessmentView.test.tsx',
  'src/renderer/views/security/PolicyManagementView.test.tsx',
  'src/renderer/views/compliance/ComplianceDashboardView.test.tsx',
  'src/renderer/views/security/SecurityDashboardView.test.tsx',
  'src/renderer/views/compliance/ComplianceReportView.test.tsx',
  'src/renderer/views/assets/ComputerInventoryView.test.tsx',
  'src/renderer/views/discovery/EnvironmentDetectionView.test.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/HyperVDiscoveryView.test.tsx',
  'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.test.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.test.tsx',
  'src/renderer/views/discovery/AzureDiscoveryView.test.tsx',
  'src/renderer/views/discovery/PowerPlatformDiscoveryView.test.tsx',
  'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx',
  'src/renderer/views/discovery/IntuneDiscoveryView.test.tsx',
  'src/renderer/views/discovery/FileSystemDiscoveryView.test.tsx',
  'src/renderer/views/discovery/DomainDiscoveryView.test.tsx',
];

testFiles.forEach(fixNullProperties);

console.log(`\n=== SUMMARY ===`);
console.log(`✅ Successfully fixed: ${fixedCount} test files`);
console.log(`\nNext: Run 'npm test' to verify fixes`);
