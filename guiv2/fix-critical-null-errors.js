/**
 * Critical Null Error Fixer
 *
 * Surgically fixes the specific null reference errors identified in ERRORS.md
 */

const fs = require('fs');
const path = require('path');

// Specific files and line patterns from ERRORS.md
const fixes = [
  // View files with .total references
  { file: 'src/renderer/views/assets/ServerInventoryView.tsx', pattern: /(\w+)\.total\b(?!\?)/g, replacement: '$1?.total ?? 0' },
  { file: 'src/renderer/views/security/SecurityAuditView.tsx', pattern: /(\w+)\.total\b(?!\?)/g, replacement: '$1?.total ?? 0' },
  { file: 'src/renderer/views/security/PolicyManagementView.tsx', pattern: /(\w+)\.total\b(?!\?)/g, replacement: '$1?.total ?? 0' },
  { file: 'src/renderer/views/security/RiskAssessmentView.tsx', pattern: /(\w+)\.total\b(?!\?)/g, replacement: '$1?.total ?? 0' },
  { file: 'src/renderer/views/compliance/ComplianceReportView.tsx', pattern: /(\w+)\.total\b(?!\?)/g, replacement: '$1?.total ?? 0' },

  // ComplianceDashboardView - resolvedViolations
  { file: 'src/renderer/views/compliance/ComplianceDashboardView.tsx', pattern: /(\w+)\.resolvedViolations\b(?!\?)/g, replacement: '$1?.resolvedViolations ?? 0' },

  // Discovery views with .searchText references
  { file: 'src/renderer/views/discovery/EnvironmentDetectionView.tsx', pattern: /(\w+)\.searchText\b(?!\?)/g, replacement: '$1?.searchText ?? \'\'' },
  { file: 'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.tsx', pattern: /(\w+)\.searchText\b(?!\?)/g, replacement: '$1?.searchText ?? \'\'' },
  { file: 'src/renderer/views/discovery/HyperVDiscoveryView.tsx', pattern: /(\w+)\.searchText\b(?!\?)/g, replacement: '$1?.searchText ?? \'\'' },
  { file: 'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.tsx', pattern: /(\w+)\.searchText\b(?!\?)/g, replacement: '$1?.searchText ?? \'\'' },
  { file: 'src/renderer/views/discovery/DataLossPreventionDiscoveryView.tsx', pattern: /(\w+)\.searchText\b(?!\?)/g, replacement: '$1?.searchText ?? \'\'' },

  // FileSystemDiscoveryView - .length
  { file: 'src/renderer/views/discovery/FileSystemDiscoveryView.tsx', pattern: /(\w+)\.length\b(?!\?)/g, replacement: '$1?.length ?? 0' },

  // AzureDiscoveryView - tenantId
  { file: 'src/renderer/views/discovery/AzureDiscoveryView.tsx', pattern: /(\w+)\.tenantId\b(?!\?)/g, replacement: '$1?.tenantId ?? \'\'' },

  // DomainDiscoveryView - toString
  { file: 'src/renderer/views/discovery/DomainDiscoveryView.tsx', pattern: /(\w+)\.toString\(\)/g, replacement: '$1?.toString?.() ?? \'\''},

  // ReportsView - .map
  { file: 'src/renderer/views/reports/ReportsView.tsx', pattern: /(\w+)\.map\(/g, replacement: '$1?.map(' },
];

let totalFixed = 0;

fixes.forEach(({ file, pattern, replacement }) => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  content = content.replace(pattern, (match, group1) => {
    // Skip if already has optional chaining
    if (match.includes('?')) {
      return match;
    }
    return replacement.replace('$1', group1);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed ${file}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files`);
