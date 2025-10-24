#!/usr/bin/env node
/**
 * Add data-cy attributes to discovery view buttons
 * Targets: start-discovery-btn, cancel-discovery-btn, export-results-btn
 */

const fs = require('fs');
const path = require('path');

// Files that need start-discovery-btn
const needsStartBtn = [
  'ApplicationDependencyMappingDiscoveryView.tsx',
  'ApplicationDiscoveryDiscoveryView.tsx',
  'AWSDiscoveryView.tsx',
  'AzureResourceDiscoveryView.tsx',
  'BackupRecoveryDiscoveryView.tsx',
  'CertificateAuthorityDiscoveryView.tsx',
  'CertificateDiscoveryView.tsx',
  'ConditionalAccessDiscoveryView.tsx',
  'DatabaseSchemaDiscoveryView.tsx',
  'DataLossPreventionDiscoveryView.tsx',
  'DLPDiscoveryView.tsx',
  'DNSDHCPDiscoveryView.tsx',
  'EntraIDAppDiscoveryView.tsx',
  'EnvironmentDetectionDiscoveryView.tsx',
  'ExternalIdentityDiscoveryView.tsx',
  'FileServerDiscoveryView.tsx',
  'GCPDiscoveryView.tsx',
  'GoogleWorkspaceDiscoveryView.tsx',
  'GPODiscoveryView.tsx',
  'GraphDiscoveryView.tsx',
  'InfrastructureDiscoveryView.tsx',
  'MultiDomainForestDiscoveryView.tsx',
  'NetworkInfrastructureDiscoveryView.tsx',
  'PaloAltoDiscoveryView.tsx',
  'PanoramaInterrogationDiscoveryView.tsx',
  'PhysicalServerDiscoveryView.tsx',
  'PowerBIDiscoveryView.tsx',
  'PrinterDiscoveryView.tsx',
  'ScheduledTaskDiscoveryView.tsx',
  'SecurityGroupAnalysisDiscoveryView.tsx',
  'StorageArrayDiscoveryView.tsx',
  'VirtualizationDiscoveryView.tsx',
  'WebServerConfigDiscoveryView.tsx',
];

// Files that need export-results-btn (subset for high-impact)
const needsExportBtn = [
  'ActiveDirectoryDiscoveryView.tsx',
  'ApplicationDiscoveryView.tsx',
  'AWSCloudInfrastructureDiscoveryView.tsx',
  'AWSDiscoveryView.tsx',
  'AzureDiscoveryView.tsx',
  'ConditionalAccessPoliciesDiscoveryView.tsx',
  'DataLossPreventionDiscoveryView.tsx',
  'DomainDiscoveryView.tsx',
  'ExchangeDiscoveryView.tsx',
  'FileSystemDiscoveryView.tsx',
  'GoogleWorkspaceDiscoveryView.tsx',
  'HyperVDiscoveryView.tsx',
  'IdentityGovernanceDiscoveryView.tsx',
  'IntuneDiscoveryView.tsx',
  'LicensingDiscoveryView.tsx',
  'NetworkDiscoveryView.tsx',
  'Office365DiscoveryView.tsx',
  'OneDriveDiscoveryView.tsx',
  'PowerPlatformDiscoveryView.tsx',
  'SecurityInfrastructureDiscoveryView.tsx',
  'SharePointDiscoveryView.tsx',
  'SQLServerDiscoveryView.tsx',
  'TeamsDiscoveryView.tsx',
  'VMwareDiscoveryView.tsx',
  'WebServerConfigurationDiscoveryView.tsx',
];

const baseDir = 'src/renderer/views/discovery';

function addDataCyToButton(content, buttonPattern, dataCyValue) {
  // Skip if already exists
  if (content.includes(`data-cy="${dataCyValue}"`)) {
    return { modified: false, content, reason: 'already-exists' };
  }

  // Pattern 1: Button component with specific onClick handler
  const patterns = [
    // <Button onClick={handleStartDiscovery}>
    new RegExp(`(<Button[^>]*onClick=\\{handle${buttonPattern}\\}[^>]*)>`, 'i'),
    // <button onClick={handleStartDiscovery}>
    new RegExp(`(<button[^>]*onClick=\\{handle${buttonPattern}\\}[^>]*)>`, 'i'),
    // <Button ... > with "Start Discovery" text
    new RegExp(`(<Button[^>]*>)\\s*Start ${buttonPattern}`, 'i'),
    // <button ... > with "Start Discovery" text
    new RegExp(`(<button[^>]*>)\\s*Start ${buttonPattern}`, 'i'),
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      const newContent = content.replace(pattern, (match, opening) => {
        // Don't add if data-cy already exists in this button
        if (opening.includes('data-cy=')) {
          return match;
        }
        // Add data-cy before the closing >
        const newOpening = opening + ` data-cy="${dataCyValue}"`;
        return match.replace(opening, newOpening);
      });

      if (newContent !== content) {
        return { modified: true, content: newContent, reason: 'added' };
      }
    }
  }

  return { modified: false, content, reason: 'no-match' };
}

function addStartDiscoveryBtn(file) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${file}: File not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Try different patterns for start button
  let result = addDataCyToButton(content, 'StartDiscovery', 'start-discovery-btn');

  if (!result.modified) {
    result = addDataCyToButton(content, 'Start', 'start-discovery-btn');
  }

  if (!result.modified) {
    // Try to find button with "Start" text
    const startButtonRegex = /<(Button|button)([^>]*)>\s*{?\s*(?:isLoading\s*\?\s*['"].*?['"]\s*:\s*)?['"]?\s*Start\s+Discovery/i;
    if (startButtonRegex.test(content)) {
      const newContent = content.replace(startButtonRegex, (match, tag, attrs) => {
        if (attrs.includes('data-cy=')) {
          return match;
        }
        return `<${tag}${attrs} data-cy="start-discovery-btn">` + match.substring(match.indexOf('>') + 1);
      });

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${file}: Added start-discovery-btn`);
        return true;
      }
    }
  }

  if (result.modified) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    console.log(`✅ ${file}: Added start-discovery-btn`);
    return true;
  } else {
    console.log(`⚠️  ${file}: Could not add start-discovery-btn (${result.reason})`);
    return false;
  }
}

function addExportResultsBtn(file) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${file}: File not found`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Try to find export button
  const exportPatterns = [
    // <Button onClick={handleExport}
    /<(Button|button)([^>]*)onClick=\{handleExport\}/i,
    // Button with "Export" text
    /<(Button|button)([^>]*)>\s*Export/i,
    // Button with icon and Export text
    /<(Button|button)([^>]*)icon=\{[^}]+\}[^>]*>\s*Export/i,
  ];

  for (const pattern of exportPatterns) {
    if (pattern.test(content)) {
      const newContent = content.replace(pattern, (match, tag, attrs) => {
        if (attrs.includes('data-cy=')) {
          return match;
        }
        // Find where to insert data-cy
        const openTagEnd = match.indexOf('>');
        return match.substring(0, openTagEnd) + ` data-cy="export-results-btn"` + match.substring(openTagEnd);
      });

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ ${file}: Added export-results-btn`);
        return true;
      }
    }
  }

  console.log(`⚠️  ${file}: Could not add export-results-btn`);
  return false;
}

console.log('Adding data-cy attributes to discovery views...\n');
console.log('='.repeat(60));
console.log('ADDING start-discovery-btn');
console.log('='.repeat(60));

let startAdded = 0;
for (const file of needsStartBtn) {
  if (addStartDiscoveryBtn(file)) {
    startAdded++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('ADDING export-results-btn');
console.log('='.repeat(60));

let exportAdded = 0;
for (const file of needsExportBtn) {
  if (addExportResultsBtn(file)) {
    exportAdded++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`start-discovery-btn added: ${startAdded}/${needsStartBtn.length}`);
console.log(`export-results-btn added: ${exportAdded}/${needsExportBtn.length}`);
console.log(`\nTotal modifications: ${startAdded + exportAdded}`);
console.log(`\nNext steps:`);
console.log(`1. Review changes: git diff src/renderer/views/discovery/`);
console.log(`2. Run tests: npm test -- src/renderer/views/discovery/ --no-cache`);
