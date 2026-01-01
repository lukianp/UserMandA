/**
 * Automated script to add missing data-cy attributes to discovery views
 * Based on data-cy-fix-list.json analysis
 */

// Map of expected data-cy attributes for discovery views - commented out as unused

// Helper to add data-cy to Button components
function addDataCyToButtons(content, filePath) {
  let modified = content;
  let changeCount = 0;

  // Pattern 1: <Button ... onClick={exportResults}> without data-cy
  const exportPatterns = [
    { regex: /(<Button[^>]*onClick={exportResults}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'export-results-btn' },
    { regex: /(<Button[^>]*onClick={export(?:Data|Results|ToCSV)}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'export-results-btn' },
  ];

  // Pattern 2: <Button ... onClick={cancelDiscovery}> without data-cy
  const cancelPatterns = [
    { regex: /(<Button[^>]*onClick={cancelDiscovery}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'cancel-discovery-btn' },
    { regex: /(<Button[^>]*onClick={cancel(?:Discovery|Scan)}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'cancel-discovery-btn' },
  ];

  // Pattern 3: <Button ... onClick={startDiscovery}> without data-cy
  const startPatterns = [
    { regex: /(<Button[^>]*onClick={startDiscovery}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'start-discovery-btn' },
    { regex: /(<Button[^>]*onClick={(?:start|run)Discovery}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'start-discovery-btn' },
  ];

  // Pattern 4: Clear logs button
  const clearLogsPatterns = [
    { regex: /(<Button[^>]*onClick={clearLogs}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'clear-logs-btn' },
  ];

  // Pattern 5: Refresh button
  const refreshPatterns = [
    { regex: /(<Button[^>]*onClick={(?:refresh|reload)(?:Data)?}(?![^>]*data-cy=)[^>]*)(>)/gi, dataCy: 'refresh-data-btn' },
  ];

  const allPatterns = [
    ...exportPatterns,
    ...cancelPatterns,
    ...startPatterns,
    ...clearLogsPatterns,
    ...refreshPatterns
  ];

  allPatterns.forEach(({ regex, dataCy }) => {
    const matches = content.matchAll(regex);
    for (const match of matches) {
      const original = match[0];
      const buttonTag = match[1];
      const closing = match[2];

      if (!original.includes('data-cy=') && !original.includes('data-testid=')) {
        // Add both data-cy and data-testid for compatibility
        const replacement = `${buttonTag} data-cy="${dataCy}" data-testid="${dataCy}"${closing}`;
        modified = modified.replace(original, replacement);
        changeCount++;
        console.log(`  [+] Added data-cy and data-testid="${dataCy}" to Button in ${path.basename(filePath)}`);
      } else if (!original.includes('data-testid=')) {
        // Has data-cy but not data-testid, add data-testid
        const replacement = `${buttonTag} data-testid="${dataCy}"${closing}`;
        modified = modified.replace(original, replacement);
        changeCount++;
        console.log(`  [+] Added data-testid="${dataCy}" to Button in ${path.basename(filePath)}`);
      }
    }
  });

  return { modified, changeCount };
}

// Helper to fix main view container data-cy
function fixViewContainerDataCy(content, filePath) {
  let modified = content;
  let changed = false;

  const fileName = path.basename(filePath, '.tsx');

  // Map of file names to expected data-cy values
  const viewDataCyMap = {
    'ActiveDirectoryDiscoveryView': 'active-directory-discovery-view',
    'AzureDiscoveryView': 'azure-discovery-view',
    'AWSCloudInfrastructureDiscoveryView': 'aws-discovery-view',
    'ExchangeDiscoveryView': 'exchange-discovery-view',
    'SharePointDiscoveryView': 'share-point-discovery-view',
    'TeamsDiscoveryView': 'teams-discovery-view',
    'OneDriveDiscoveryView': 'one-drive-discovery-view',
    'IntuneDiscoveryView': 'intune-discovery-view',
    'Office365DiscoveryView': 'office365-discovery-view',
    'NetworkDiscoveryView': 'network-discovery-view',
    'SQLServerDiscoveryView': 's-q-l-server-discovery-view',
    'VMwareDiscoveryView': 'v-mware-discovery-view',
    'WebServerConfigurationDiscoveryView': 'web-server-discovery-view',
    'PowerPlatformDiscoveryView': 'power-platform-discovery-view',
    'LicensingDiscoveryView': 'licensing-discovery-view',
    'SecurityInfrastructureDiscoveryView': 'security-infrastructure-discovery-view',
    'DomainDiscoveryView': 'domain-discovery-view',
    'ApplicationDiscoveryView': 'application-discovery-view',
    'FileSystemDiscoveryView': 'file-system-discovery-view',
    'ConditionalAccessPoliciesDiscoveryView': 'conditional-access-discovery-view',
    'DataLossPreventionDiscoveryView': 'data-loss-prevention-discovery-view',
    'IdentityGovernanceDiscoveryView': 'identity-governance-discovery-view',
    'GoogleWorkspaceDiscoveryView': 'google-workspace-discovery-view',
    'HyperVDiscoveryView': 'hyper-v-discovery-view',
  };

  const expectedDataCy = viewDataCyMap[fileName];

  if (expectedDataCy) {
    // Find the main container div (usually the first div in return statement)
    const mainDivRegex = /(<div className="[^"]*")\s+(data-cy="[^"]+")([^>]*>)/;
    const mainDivNoDataCyRegex = /(<div className="h-full[^"]*")([^>]*>)/;

    if (mainDivRegex.test(modified)) {
      // Has data-cy, check if it matches and add data-testid
      modified = modified.replace(mainDivRegex, (match, before, dataCy, after) => {
        if (!dataCy.includes(expectedDataCy)) {
          console.log(`  [~] Updated main container data-cy to "${expectedDataCy}" in ${fileName}`);
          changed = true;
          return `${before} data-cy="${expectedDataCy}" data-testid="${expectedDataCy}"${after}`;
        } else if (!match.includes('data-testid=')) {
          console.log(`  [+] Added data-testid="${expectedDataCy}" to main container in ${fileName}`);
          changed = true;
          return `${before} ${dataCy} data-testid="${expectedDataCy}"${after}`;
        }
        return match;
      });
    } else if (mainDivNoDataCyRegex.test(modified)) {
      // No data-cy, add both data-cy and data-testid
      modified = modified.replace(mainDivNoDataCyRegex, (match, before, after) => {
        console.log(`  [+] Added main container data-cy and data-testid="${expectedDataCy}" to ${fileName}`);
        changed = true;
        return `${before} data-cy="${expectedDataCy}" data-testid="${expectedDataCy}"${after}`;
      });
    }
  }

  return { modified, changed };
}

// Process a single file
function processFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');
  let result = content;
  let totalChanges = 0;

  // Fix main container data-cy
  const containerResult = fixViewContainerDataCy(result, filePath);
  result = containerResult.modified;
  if (containerResult.changed) totalChanges++;

  // Add missing button data-cy attributes
  const buttonResult = addDataCyToButtons(result, filePath);
  result = buttonResult.modified;
  totalChanges += buttonResult.changeCount;

  if (totalChanges > 0) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`  ✓ Saved ${totalChanges} changes to ${path.basename(filePath)}`);
    return totalChanges;
  } else {
    console.log(`  ✓ No changes needed`);
    return 0;
  }
}

// Main execution
function main() {
  const discoveryViewsPath = path.join(__dirname, 'src', 'renderer', 'views', 'discovery');

  console.log('=== Adding Missing data-cy Attributes ===');
  console.log(`Discovery views path: ${discoveryViewsPath}\n`);

  const files = fs.readdirSync(discoveryViewsPath)
    .filter(f => f.endsWith('View.tsx') && !f.includes('.test.'))
    .map(f => path.join(discoveryViewsPath, f));

  console.log(`Found ${files.length} discovery view files\n`);

  let totalFilesModified = 0;
  let totalChanges = 0;

  files.forEach(file => {
    const changes = processFile(file);
    if (changes > 0) {
      totalFilesModified++;
      totalChanges += changes;
    }
  });

  console.log('\n=== Summary ===');
  console.log(`Files processed: ${files.length}`);
  console.log(`Files modified: ${totalFilesModified}`);
  console.log(`Total changes: ${totalChanges}`);
}

main();
