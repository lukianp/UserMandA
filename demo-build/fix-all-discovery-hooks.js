/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

/**
 * Fix useEffect cleanup bug in discovery logic hooks
 */

const hooksDir = path.join(__dirname, 'src', 'renderer', 'hooks');

// List all discovery logic hooks
const discoveryHooks = [
  'useActiveDirectoryDiscoveryLogic.ts',
  'useApplicationDiscoveryLogic.ts',
  'useAWSCloudInfrastructureDiscoveryLogic.ts',
  'useAWSDiscoveryLogic.ts',
  'useAzureDiscoveryLogic.ts',
  'useConditionalAccessDiscoveryLogic.ts',
  'useDataLossPreventionDiscoveryLogic.ts',
  'useDomainDiscoveryLogic.ts',
  'useExchangeDiscoveryLogic.ts',
  'useFileSystemDiscoveryLogic.ts',
  'useGoogleWorkspaceDiscoveryLogic.ts',
  'useHyperVDiscoveryLogic.ts',
  'useIdentityGovernanceDiscoveryLogic.ts',
  'useIntuneDiscoveryLogic.ts',
  'useLicensingDiscoveryLogic.ts',
  'useNetworkDiscoveryLogic.ts',
  'useOffice365DiscoveryLogic.ts',
  'useOneDriveDiscoveryLogic.ts',
  'usePowerPlatformDiscoveryLogic.ts',
  'useSecurityInfrastructureDiscoveryLogic.ts',
  'useSharePointDiscoveryLogic.ts',
  'useSQLServerDiscoveryLogic.ts',
  'useTeamsDiscoveryLogic.ts',
  'useVMwareDiscoveryLogic.ts',
  'useWebServerDiscoveryLogic.ts',
];

console.log(`Fixing ${discoveryHooks.length} discovery logic hooks...\n`);

let filesFixed = 0;
let issuesFixed = 0;

discoveryHooks.forEach(fileName => {
  const hookPath = path.join(hooksDir, fileName);

  if (!fs.existsSync(hookPath)) {
    console.log(`  ⚠️  ${fileName} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(hookPath, 'utf-8');
  const originalContent = content;
  let fileIssuesFixed = 0;

  // Pattern 1: Fix early returns to explicitly return undefined
  const earlyReturnPattern = /if \(!api \|\| !api\.(onProgress|onOutput)\) return;/g;
  const earlyReturnMatches = content.match(earlyReturnPattern);
  if (earlyReturnMatches) {
    content = content.replace(earlyReturnPattern, 'if (!api || !api.$1) return undefined;');
    fileIssuesFixed += earlyReturnMatches.length;
  }

  // Pattern 2: Fix unsafe cleanup functions
  const unsafeCleanupPattern = /return \(\) => unsubscribe\(\);/g;
  const unsafeCleanupMatches = content.match(unsafeCleanupPattern);
  if (unsafeCleanupMatches) {
    content = content.replace(
      unsafeCleanupPattern,
      `return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };`
    );
    fileIssuesFixed += unsafeCleanupMatches.length;
  }

  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(hookPath, content, 'utf-8');
    filesFixed++;
    issuesFixed += fileIssuesFixed;
    console.log(`  ✅ ${fileName} (${fileIssuesFixed} issues fixed)`);
  } else {
    console.log(`  ✓ ${fileName} (already fixed or no issues)`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files scanned: ${discoveryHooks.length}`);
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total issues fixed: ${issuesFixed}`);
