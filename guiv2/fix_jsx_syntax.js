const fs = require('fs');

// Files with JSX syntax errors from the regex replacement
const files = [
  'src/renderer/views/assets/ComputerInventoryView.tsx',
  'src/renderer/views/assets/NetworkDeviceInventoryView.tsx',
  'src/renderer/views/assets/ServerInventoryView.tsx',
  'src/renderer/views/compliance/ComplianceReportView.tsx',
  'src/renderer/views/groups/GroupsView.tsx',
  'src/renderer/views/security/AccessReviewView.tsx',
  'src/renderer/views/security/ComplianceDashboardView.tsx',
  'src/renderer/views/security/RiskAssessmentView.tsx',
  'src/renderer/views/security/SecurityAuditView.tsx',
  'src/renderer/views/security/SecurityDashboardView.tsx',
  'src/renderer/views/security/ThreatAnalysisView.tsx',
  'src/renderer/views/security/VulnerabilityManagementView.tsx',
  'src/renderer/views/infrastructure/ComputerInventoryView.tsx',
  'src/renderer/views/infrastructure/ServerInventoryView.tsx',
  'src/renderer/views/infrastructure/AssetInventoryView.tsx',
  'src/renderer/views/infrastructure/DeviceManagementView.tsx',
  'src/renderer/views/infrastructure/NetworkInfrastructureView.tsx',
  'src/renderer/views/licensing/LicenseManagementView.tsx',
  'src/renderer/views/migration/MigrationMappingView.tsx',
  'src/renderer/views/migration/MigrationPlanningView.tsx',
  'src/renderer/views/users/UsersView.tsx',
  'src/renderer/views/groups/GroupDetailView.tsx',
  'src/renderer/views/settings/SettingsView.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - does not exist`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Fix broken greater-than comparisons in arrow functions
  // Pattern: onChange={(value) => someFunc(value value)}
  content = content.replace(/onChange=\{\(value\)\s*=>\s*([^\(]+)\(value\s+value\)/g, 'onChange={(value) => $1(value)}');

  // Fix: onChange={value => someFunc(value value)}
  content = content.replace(/onChange=\{value\s*=>\s*([^\(]+)\(value\s+value\)/g, 'onChange={value => $1(value)}');

  // Fix variable shadowing in DataVisualizationView.tsx Y-axis onChange
  content = content.replace(
    /onChange=\{value\s*=>\s*\{\s*const value\s*=\s*value;/g,
    'onChange={val => {\n                const value = val;'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  } else {
    console.log(`- No changes needed for ${file}`);
  }
});

console.log('\nDone!');
