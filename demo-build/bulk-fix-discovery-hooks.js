const fs = require('fs');
const path = require('path');

// Discovery hooks to fix (top priority by failure count)
const hooksToFix = [
  'src/renderer/hooks/useTeamsDiscoveryLogic.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.ts',
  'src/renderer/hooks/useAzureDiscoveryLogic.ts',
  'src/renderer/hooks/useNetworkDiscoveryLogic.ts',
  'src/renderer/hooks/useActiveDirectoryDiscoveryLogic.ts',
  'src/renderer/hooks/useAWSDiscoveryLogic.ts',
  'src/renderer/hooks/useGoogleWorkspaceDiscoveryLogic.ts',
  'src/renderer/hooks/useM365DiscoveryLogic.ts',
];

let totalFixes = 0;

console.log('=== BULK NULL SAFETY FIXER FOR DISCOVERY HOOKS ===\n');

hooksToFix.forEach(hookPath => {
  const fullPath = path.join(__dirname, hookPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${path.basename(hookPath)} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let fileFixCount = 0;

  // Pattern 1: Fix array filter operations (result.items.filter -> (result?.items ?? []).filter)
  const filterMatches = content.match(/result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks)\s*\.filter/g);
  if (filterMatches) {
    content = content.replace(
      /result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks|licenses|policies|rules)\s*\.filter/g,
      (match, prop) => `(result?.${prop} ?? []).filter`
    );
    fileFixCount += filterMatches.length;
  }

  // Pattern 2: Fix array map operations
  const mapMatches = content.match(/result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks)\s*\.map/g);
  if (mapMatches) {
    content = content.replace(
      /result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks|licenses|policies|rules)\s*\.map/g,
      (match, prop) => `(result?.${prop} ?? []).map`
    );
    fileFixCount += mapMatches.length;
  }

  // Pattern 3: Fix array length access (result.items.length -> result?.items?.length ?? 0)
  const lengthMatches = content.match(/result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks)\.length([^>])/g);
  if (lengthMatches) {
    content = content.replace(
      /result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks|licenses|policies|rules)\.length([^>])/g,
      (match, prop, after) => `(result?.${prop}?.length ?? 0)${after}`
    );
    fileFixCount += lengthMatches.length;
  }

  // Pattern 4: Fix statistics access (result.statistics.total -> result?.statistics?.total ?? 0)
  const statsMatches = content.match(/result\.statistics\./g);
  if (statsMatches) {
    content = content.replace(
      /result\.statistics\.(\w+)/g,
      (match, prop) => `(result?.statistics?.${prop} ?? 0)`
    );
    fileFixCount += statsMatches.length;
  }

  // Pattern 5: Fix array iterations without filter/map
  const iterMatches = content.match(/result\.(items|teams|channels|members|users|groups)\s*\.\s*forEach/g);
  if (iterMatches) {
    content = content.replace(
      /result\.(items|teams|channels|members|users|groups|computers|servers|apps|sites|files|devices|networks|licenses|policies|rules)\s*\.\s*forEach/g,
      (match, prop) => `(result?.${prop} ?? []).forEach`
    );
    fileFixCount += iterMatches.length;
  }

  // Pattern 6: Fix assignedLicenses.length (member.assignedLicenses.length -> member.assignedLicenses?.length ?? 0)
  const licenseMatches = content.match(/(\w+)\.assignedLicenses\.length/g);
  if (licenseMatches) {
    content = content.replace(
      /(\w+)\.assignedLicenses\.length/g,
      (match, varName) => `(${varName}.assignedLicenses?.length ?? 0)`
    );
    fileFixCount += licenseMatches.length;
  }

  // Pattern 7: Fix array property access in conditionals (channel.fileCount > 0 -> (channel.fileCount ?? 0) > 0)
  content = content.replace(
    /(\w+)\.(fileCount|messageCount|memberCount|ownerCount|guestCount|channelCount|appCount|siteCount)\s*([<>=!]+)\s*(\d+)/g,
    (match, varName, prop, operator, num) => `(${varName}.${prop} ?? 0) ${operator} ${num}`
  );

  // Pattern 8: Fix optional array access like channel.description?.toLowerCase()
  // This is actually already safe, but we can make it more explicit

  // Pattern 9: Fix percentage calculations
  content = content.replace(
    /result\.(\w+)\s*\/\s*result\.(\w+)\s*\*\s*100/g,
    (match, numerator, denominator) => `((result?.${numerator} ?? 0) / (result?.${denominator} ?? 1)) * 100`
  );

  // Pattern 10: Fix toFixed() calls on potentially undefined values
  content = content.replace(
    /(\w+\.\w+)\.toFixed\(/g,
    (match, expr) => `(${expr} ?? 0).toFixed(`
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`FIXED: ${path.basename(hookPath)} (${fileFixCount} patterns)`);
    totalFixes += fileFixCount;
  } else {
    console.log(`NO CHANGES: ${path.basename(hookPath)}`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total patterns fixed: ${totalFixes}`);
console.log(`\nNext: Run tests to validate fixes`);
console.log(`npm run test:unit -- --no-coverage`);
