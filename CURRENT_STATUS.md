# Current Status - Profile Dropdown Issue

## What's Working ✅
- Application launches and displays
- UI renders correctly (Sidebar, views, components)
- Fallback API is functioning (mock data mode)
- No critical JavaScript errors
- React/Electron infrastructure is solid

## What's NOT Working ❌
1. **Source Profile Dropdown** - Buttons don't work (Create/Refresh/Test/Delete)
2. **Target Profile Section** - Completely missing
3. **Root Cause**: `window.electronAPI` is `undefined`

## Root Cause Analysis

### The Problem
The preload script (`preload.ts`) is NOT running, which means:
- `contextBridge.exposeInMainWorld('electronAPI', electronAPI)` never executes
- `window.electronAPI` remains undefined
- Application falls back to mock API mode
- NO IPC communication with main process
- Profile operations fail silently

### Why Preload Isn't Loading
In development mode (`npm start`), Electron Forge + Webpack uses hot module replacement (HMR) which serves files differently than production. The preload script path might not be resolving correctly.

**Evidence:**
```javascript
// Renderer console shows:
window.electronAPI: undefined

// NO preload logs in console (should see):
[PRELOAD] ✅ Preload script loaded successfully
```

## Immediate Solutions

### Solution 1: Test in Production Build (RECOMMENDED)
Build and run the production version where preload definitely works:

```powershell
# Build production
cd D:\Scripts\UserMandA\guiv2
npm run package

# Run from output
cd out\guiv2-win32-x64
.\guiv2.exe
```

### Solution 2: Fix Development Mode Preload
The issue is likely with how `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` resolves in dev mode.

**Check forge configuration** (`forge.config.ts`):
```typescript
entryPoints: [
  {
    html: './src/index.html',
    js: './src/renderer.tsx',
    name: 'main_window',
    preload: {
      js: './src/preload.ts',  // ✅ This looks correct
    },
  },
],
```

**Debug the preload path** in `src/index.ts`:
```typescript
console.log('[MAIN] Preload path:', MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);

const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    contextIsolation: true,
    nodeIntegration: false,
  },
});
```

### Solution 3: Target Profile Missing
The Sidebar component currently only shows Source Profile. Need to add Target Profile section.

**In `Sidebar.tsx` (around line 155)**:
```typescript
{/* Source Profile Section */}
<div className="p-4 border-b border-gray-800">
  <ProfileSelector
    type="source"
    label="Source Profile"
    showActions={true}
    className="mb-3"
    data-cy="sidebar-source-profile"
  />
</div>

{/* ADD THIS - Target Profile Section */}
<div className="p-4 border-b border-gray-800">
  <ProfileSelector
    type="target"
    label="Target Profile"
    showActions={true}
    className="mb-3"
    data-cy="sidebar-target-profile"
  />
</div>
```

## Quick Test to Verify electronAPI

Open DevTools Console (F12) and run:

```javascript
// Check if electronAPI exists
console.log('electronAPI:', window.electronAPI);

// If undefined, check what IS on window
console.log('Window keys with electron:',
  Object.keys(window).filter(k => k.toLowerCase().includes('electron'))
);

// Try to manually call IPC (won't work without preload)
if (window.electronAPI) {
  window.electronAPI.loadSourceProfiles()
    .then(profiles => console.log('Profiles:', profiles))
    .catch(err => console.error('Error:', err));
}
```

## Workaround for Immediate Testing

If you need to test the profile UI without fixing the preload issue, you can temporarily hardcode mock profiles in the store:

**In `useProfileStore.ts`**:
```typescript
// Add mock data in initial state
sourceProfiles: [
  {
    id: 'ljpops-mock',
    name: 'ljpops',
    companyName: 'ljpops',
    description: 'Mock profile for testing',
    domainController: 'dc.ljpops.com',
    tenantId: 'mock-tenant-id',
    isActive: true,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    environment: 'Production',
    dataPath: 'C:\\DiscoveryData\\ljpops',
  },
],
```

## Next Steps (In Order)

1. **Add debug logging to index.ts** to see what preload path is being used
2. **Add Target Profile section** to Sidebar
3. **Test in production build** to verify preload works there
4. **Fix development mode preload** if it doesn't work in production either

## Files to Modify

1. `guiv2/src/index.ts` - Add preload path logging
2. `guiv2/src/renderer/components/organisms/Sidebar.tsx` - Add target profile section
3. `guiv2/forge.config.ts` - Verify preload configuration (currently correct)

---

**Status**: 🔴 Profile dropdown non-functional due to missing IPC communication
**Priority**: HIGH - Core functionality blocked
**ETA to Fix**: 15-30 minutes once root cause is identified
