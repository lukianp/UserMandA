/**
 * Batch Null Safety Fix Script
 * Automatically adds null safety to data.filter, data.map, data.length patterns
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files identified with null safety issues
const targetFiles = [
  'src/renderer/views/advanced/BulkOperationsView.tsx',
  'src/renderer/views/advanced/NotificationRulesView.tsx',
  'src/renderer/views/discovery/InfrastructureDiscoveryHubView.tsx',
  'src/renderer/views/migration/MigrationExecutionView.tsx',
  'src/renderer/views/discovery/DomainDiscoveryView.tsx',
  'src/renderer/views/overview/OverviewView.tsx',
  'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.tsx',
  'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.tsx',
  'src/renderer/views/discovery/EnvironmentDetectionView.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.tsx',
  'src/renderer/views/admin/RoleManagementView.tsx',
  'src/renderer/views/admin/UserManagementView.tsx',
  'src/renderer/views/admin/AuditLogView.tsx',
  'src/renderer/views/discovery/Office365DiscoveryView.tsx',
  'src/renderer/views/discovery/ApplicationDiscoveryView.tsx',
  'src/renderer/views/discovery/ActiveDirectoryDiscoveryView.tsx'
];

let fixedCount = 0;
let skippedCount = 0;

targetFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    skippedCount++;
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Pattern 1: data.filter( => (data ?? []).filter(
  const pattern1 = /\bdata\.filter\(/g;
  if (pattern1.test(content)) {
    content = content.replace(/\bdata\.filter\(/g, '(data ?? []).filter(');
    modified = true;
  }

  // Pattern 2: data.map( => (data ?? []).map(
  const pattern2 = /\bdata\.map\(/g;
  if (pattern2.test(content)) {
    content = content.replace(/\bdata\.map\(/g, '(data ?? []).map(');
    modified = true;
  }

  // Pattern 3: data.length => (data ?? []).length
  const pattern3 = /\bdata\.length\b/g;
  if (pattern3.test(content)) {
    content = content.replace(/\bdata\.length\b/g, '(data ?? []).length');
    modified = true;
  }

  // Pattern 4: data.reduce( => (data ?? []).reduce(
  const pattern4 = /\bdata\.reduce\(/g;
  if (pattern4.test(content)) {
    content = content.replace(/\bdata\.reduce\(/g, '(data ?? []).reduce(');
    modified = true;
  }

  // Pattern 5: data.forEach( => (data ?? []).forEach(
  const pattern5 = /\bdata\.forEach\(/g;
  if (pattern5.test(content)) {
    content = content.replace(/\bdata\.forEach\(/g, '(data ?? []).forEach(');
    modified = true;
  }

  // Pattern 6: data.find( => (data ?? []).find(
  const pattern6 = /\bdata\.find\(/g;
  if (pattern6.test(content)) {
    content = content.replace(/\bdata\.find\(/g, '(data ?? []).find(');
    modified = true;
  }

  // Pattern 7: data.some( => (data ?? []).some(
  const pattern7 = /\bdata\.some\(/g;
  if (pattern7.test(content)) {
    content = content.replace(/\bdata\.some\(/g, '(data ?? []).some(');
    modified = true;
  }

  // Pattern 8: data.every( => (data ?? []).every(
  const pattern8 = /\bdata\.every\(/g;
  if (pattern8.test(content)) {
    content = content.replace(/\bdata\.every\(/g, '(data ?? []).every(');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    fixedCount++;
  } else {
    console.log(`ℹ️  No changes needed for ${file}`);
    skippedCount++;
  }
});

console.log(`\n✨ Batch fix complete:`);
console.log(`   Fixed: ${fixedCount} files`);
console.log(`   Skipped: ${skippedCount} files`);
