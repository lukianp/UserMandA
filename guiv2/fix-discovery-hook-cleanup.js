/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Fix useEffect cleanup bug in discovery logic hooks
 *
 * Pattern 1: Early return without undefined
 * FROM: if (!api || !api.onProgress) return;
 * TO:   if (!api || !api.onProgress) return undefined;
 *
 * Pattern 2: Unsafe cleanup function
 * FROM: return () => unsubscribe();
 * TO:   return () => { if (typeof unsubscribe === 'function') { unsubscribe(); } };
 */

const hooksDir = path.join(__dirname, 'src', 'renderer', 'hooks');
const discoveryHooks = glob.sync(path.join(hooksDir, '*DiscoveryLogic.ts'));

console.log(`Found ${discoveryHooks.length} discovery logic hooks\n`);

let filesFixed = 0;
let issuesFixed = 0;

discoveryHooks.forEach(hookPath => {
  const fileName = path.basename(hookPath);
  let content = fs.readFileSync(hookPath, 'utf-8');
  const originalContent = content;
  let fileIssuesFixed = 0;

  // Pattern 1: Fix early returns to explicitly return undefined
  const earlyReturnPattern = /if \(!api \|\| !api\.(onProgress|onOutput)\) return;/g;
  const earlyReturnMatches = content.match(earlyReturnPattern);
  if (earlyReturnMatches) {
    content = content.replace(earlyReturnPattern, 'if (!api || !api.$1) return undefined;');
    fileIssuesFixed += earlyReturnMatches.length;
    console.log(`  ✓ Fixed ${earlyReturnMatches.length} early return(s) in ${fileName}`);
  }

  // Pattern 2: Fix unsafe cleanup functions
  // Match:  return () => unsubscribe();
  // But not: return () => { ... unsubscribe(); ... }
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
    console.log(`  ✓ Fixed ${unsafeCleanupMatches.length} unsafe cleanup(s) in ${fileName}`);
  }

  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(hookPath, content, 'utf-8');
    filesFixed++;
    issuesFixed += fileIssuesFixed;
    console.log(`  ✅ Saved ${fileName} (${fileIssuesFixed} issues fixed)\n`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files scanned: ${discoveryHooks.length}`);
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total issues fixed: ${issuesFixed}`);
console.log(`\n✅ All discovery hooks have been updated with safe cleanup functions!`);
