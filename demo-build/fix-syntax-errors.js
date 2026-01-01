const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.tsx',
  'src/renderer/views/discovery/EnvironmentDetectionView.tsx',
  'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.tsx',
  'src/renderer/views/discovery/HyperVDiscoveryView.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.tsx',
  'src/renderer/views/discovery/LicensingDiscoveryView.tsx',
  'src/renderer/views/discovery/PowerPlatformDiscoveryView.tsx',
];

let fixedCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Fix the syntax error: message ?? '' || 'text'  ->  message || 'text'
  content = content.replace(
    /message\s*\?\?\s*''\s*\|\|\s*'/g,
    "message || '"
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`FIXED: ${filePath}`);
    fixedCount++;
  } else {
    console.log(`NO CHANGE: ${filePath}`);
  }
});

console.log(`\nFixed ${fixedCount} files`);
