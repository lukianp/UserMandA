# Sankey Organization Map - Diagnostic Checklist

## Problem
Sankey chart only shows Azure subscriptions/resources despite 117 CSV files with extensive discovery data existing in `C:\DiscoveryData\ljpops\Raw\`

## Diagnostic Steps

### 1. Check Browser Console

**Action:** Open Organization Map view in app, press F12, check Console tab

**Look for these messages:**

```
[IPC] get-discovery-files: Scanning for CSV files...
[IPC] get-discovery-files: Found X CSV files  <-- Should be ~117
[useOrganisationMapLogic] Starting enhanced LeanIX-style data fetch...
[useOrganisationMapLogic] Found CSV files: X  <-- Should match above
[useOrganisationMapLogic] Processing file: C:\DiscoveryData\ljpops\Raw\ADUsers.csv Key: adusers
[useOrganisationMapLogic] File parsed: {path: "...", key: "adusers", nodes: Y, links: Z}
...
[useOrganisationMapLogic] Total before merge: {nodes: X, links: Y}
```

**Expected behavior:**
- Should see ~117 CSV files found
- Should see processing messages for each file
- Should see thousands of nodes created

**If you see:**
- Only 2-3 files found → IPC handler filtering issue
- 117 files found but only processing a few → parseCSVToNodes issue
- 117 files found, all processed, but 0 nodes → typeMapping issue

### 2. Check File Type Key Matching

**The issue might be:** File names don't match typeMapping keys

**Example mismatch:**
- File: `ADUsers.csv` → Key: `adusers`
- typeMapping has key: `azurediscovery_users` ❌ MISMATCH!
- Should have key: `adusers` ✅ MATCH

**Action:** Check console for these patterns:
```
[useOrganisationMapLogic] Processing file: C:\DiscoveryData\ljpops\Raw\ADUsers.csv Key: adusers
```

Then check if `adusers` exists in typeMapping (line ~100 of useOrganisationMapLogic.ts)

### 3. Check Which Files Have Mappings

**From our earlier scan, we have 117 files. Let me check which ones have typeMapping entries:**

**Files that SHOULD have mappings:**
- `ADUsers.csv` → needs `adusers` or `activedirectory_users` key
- `ADGroups.csv` → needs `adgroups` or `activedirectory_groups` key
- `ADComputers.csv` → needs `adcomputers` or `activedirectory_computers` key
- `ApplicationCatalog.csv` → needs `applicationcatalog` key
- `AzureDiscovery_Users.csv` → has `azurediscovery_users` ✅
- `AzureResourceDiscovery_Subscriptions.csv` → has `azureresourcediscovery_subscriptions` ✅
- `ExchangeMailboxes.csv` → needs `exchangemailboxes` key
- `NetworkInfrastructure_ARPEntry.csv` → has `networkinfrastructure_arpentry` ✅
- `PhysicalServerDiscovery.csv` → has `physicalserverdiscovery` ✅
- etc.

**Hypothesis:** Azure files match because they're in the format `AzureDiscovery_*` and `AzureResourceDiscovery_*` which matches existing typeMapping keys exactly.

**Active Directory files DON'T match** because:
- File: `ADUsers.csv`
- Key extracted: `adusers`
- typeMapping has: `azurediscovery_users` or `activedirectory_users`?

### 4. Check getFileTypeKey Function

**Location:** `useOrganisationMapLogic.ts` (search for `function getFileTypeKey`)

**This function converts file path → key for typeMapping lookup**

Example:
```typescript
// Input: "C:\DiscoveryData\ljpops\Raw\ADUsers.csv"
// Output: "adusers"

// Input: "C:\DiscoveryData\ljpops\Raw\AzureDiscovery_Users.csv"
// Output: "azurediscovery_users"
```

**The function should:**
1. Extract filename without extension
2. Remove directory path
3. Convert to lowercase
4. Replace underscores/hyphens consistently

### 5. Immediate Fixes Needed

**Fix 1: Add AD typeMapping entries**

Current typeMapping has:
- `azurediscovery_users` ✅
- `azurediscovery_groups` ✅

But missing:
- `adusers` ❌
- `adgroups` ❌
- `adcomputers` ❌
- `adorganizationalunits` ❌
- `adfsmoroles` ❌
- `adtrusts` ❌
- `ad_passwordpolicy` ❌
- `ad_serviceaccount` ❌

**Fix 2: Add all other missing mappings**

Missing for:
- `applicationcatalog`
- `exchangemailboxes`
- `exchangedistributiongroups`
- `filesystemservers`
- `filesystemshares`
- `filesystempermissions`
- `filesystemfileanalysis`
- `filesystemlargefiles`
- `graphusers`
- `graphgroups`
- `sharepointsites`
- `sharepointlists`
- `licensingsubscriptions`
- `ca_certificates` (Certificate Authority)
- `certificate_localcertificate`
- `scheduledtask_scheduledtask`
- `dependency_networkconnection`
- `dependency_processdependency`
- `dependency_servicedependency`
- And 40+ more!

## Action Plan

### Phase 1: Diagnostic (5 minutes)
1. Open Organization Map in app
2. Open browser dev tools (F12)
3. Copy ALL console messages
4. Paste into a file for analysis

### Phase 2: Identify Root Cause (5 minutes)
1. Count how many CSV files were found
2. Count how many were processed
3. Count how many created nodes
4. Identify which files were skipped and why

### Phase 3: Fix typeMapping (30 minutes)
1. Read getFileTypeKey function
2. For each of 117 CSV files, determine what key it generates
3. Add missing typeMapping entries for those keys
4. Test with one file (e.g., ADUsers.csv)
5. Once working, add all remaining mappings

### Phase 4: Verify (10 minutes)
1. Rebuild app
2. Open Organization Map
3. Check console shows 117 files processed
4. Check thousands of nodes created
5. Check Sankey diagram shows diverse asset types (not just Azure)

## Expected Final State

**Console should show:**
```
[IPC] get-discovery-files: Found 117 CSV files
[useOrganisationMapLogic] Found CSV files: 117
[useOrganisationMapLogic] Processing file: C:\DiscoveryData\ljpops\Raw\ADUsers.csv Key: adusers
[useOrganisationMapLogic] File parsed: {path: "...", nodes: 50, links: 12}
[useOrganisationMapLogic] Processing file: C:\DiscoveryData\ljpops\Raw\ADGroups.csv Key: adgroups
[useOrganisationMapLogic] File parsed: {path: "...", nodes: 120, links: 45}
[useOrganisationMapLogic] Processing file: C:\DiscoveryData\ljpops\Raw\ApplicationCatalog.csv Key: applicationcatalog
[useOrganisationMapLogic] File parsed: {path: "...", nodes: 250, links: 0}
... (117 files total)
[useOrganisationMapLogic] Total before merge: {nodes: 3500, links: 1200}
[useOrganisationMapLogic] Created indices: {byId: 3200, byName: 3150, ...}
```

**Sankey diagram should show:**
- Thousands of nodes across all layers
- Diverse categories (Infrastructure, Users, Applications, Groups, Security, etc.)
- Rich relationships between entities
- Not just Azure subscriptions!

---

**Created:** 2025-12-30
**Status:** CRITICAL - Data exists but not loading into Sankey
**Root Cause:** Likely typeMapping key mismatch for non-Azure files
