# Archived Duplicate Directories

## Purpose
This archive contains backup copies of nested/duplicate `src` directories that were removed from the codebase during cleanup operations.

## Contents

### `src-nested-backup/`
- **Backed up:** 2025-11-25
- **Original location:** `D:\Scripts\UserMandA\guiv2\src\src`
- **Size:** ~9.7 MB
- **Reason:** Nested directory structure that caused webpack build issues and 404 errors

## Why These Were Removed

During codebase consolidation, a nested `src/src/` directory was created (either incompletely cleaned up or accidentally recreated by bad copy commands). This caused:

1. **Webpack confusion** - Couldn't determine which files to bundle
2. **Stale build artifacts** - Builds pointed to wrong source files
3. **404 errors** - React Router couldn't find discovery views
4. **Apparent data loss** - Weeks of work seemed lost but was just in wrong location

## Recovery Information

If you need to recover files from this archive:

```powershell
# View contents
Get-ChildItem -Path "D:\Scripts\UserMandA\ARCHIVE_src-duplicates\src-nested-backup" -Recurse

# Compare with current src
fc /B "D:\Scripts\UserMandA\ARCHIVE_src-duplicates\src-nested-backup\renderer\views\discovery\FileSystemDiscoveryView.tsx" ^
     "D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\FileSystemDiscoveryView.tsx"
```

## Safe to Delete?

**Yes, after 30 days** - The correct files are in:
- `C:\enterprisediscovery\guiv2\src\` (deployment - canonical working copy)
- `D:\Scripts\UserMandA\guiv2\src\` (workspace - git version control)

Both contain the same files that were in this nested directory, just in the correct location.

## Prevention

Run this script before major file operations:
```powershell
D:\Scripts\UserMandA\scripts\verify-no-nested-dirs.ps1
```

## Related Documentation

See `D:\Scripts\UserMandA\CLAUDE.local.md` version 1.6 for full incident report and recovery procedure.
