# Electron API Debug Issue

## Problem

The renderer console shows:
```
renderer.tsx:12 window.electronAPI: undefined
renderer.tsx:13 window.electronAPI keys: UNDEFINED
```

And then fallback mode activates:
```
electron-api-fallback.ts:284 Using fallback Electron API - running in development mode without Electron
```

## Root Cause Analysis

The preload script IS being built correctly:
- ✅ Preload script exists: `.webpack/renderer/main_window/preload.js`
- ✅ `contextBridge.exposeInMainWorld('electronAPI', electronAPI)` is present (line 507)
- ✅ Forge config has preload configured correctly

**But** `window.electronAPI` is `undefined` in the renderer.

## Possible Causes

### 1. Preload Script Not Loading
The `MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY` constant might not be resolving to the correct path.

### 2. Timing Issue
The renderer might be checking `window.electronAPI` before the preload script runs.

### 3. Context Isolation Issue
There might be a mismatch in how the API is being exposed vs how it's being accessed.

## Debug Steps

### Step 1: Check if Preload Script Runs
Add console.log to preload.ts at the very end:

```typescript
// At the end of preload.ts
console.log('✅ Preload script loaded successfully');
console.log('electronAPI keys:', Object.keys(electronAPI));
```

If you see this in the console, the preload IS running.

### Step 2: Check Window Object After Page Load
In renderer.tsx, wrap the check in a setTimeout:

```typescript
setTimeout(() => {
  console.log('window.electronAPI (delayed):', window.electronAPI);
  console.log('window keys:', Object.keys(window));
}, 1000);
```

### Step 3: Check Main Process Logs
Look at the terminal output to see if there are any preload-related errors.

## Quick Fix to Test

Let me add debug logging to both preload and renderer to see what's happening:

1. **Add to end of preload.ts**:
```typescript
console.log('[PRELOAD] Script executed');
console.log('[PRELOAD] electronAPI exposed:', !!electronAPI);
console.log('[PRELOAD] electronAPI keys:', electronAPI ? Object.keys(electronAPI).length : 0);
```

2. **Check in renderer**:
```typescript
// In renderer.tsx or App.tsx
useEffect(() => {
  const checkAPI = () => {
    console.log('[RENDERER] Checking electronAPI...');
    console.log('[RENDERER] window.electronAPI:', typeof window.electronAPI);
    console.log('[RENDERER] window.__electronAPI:', typeof (window as any).__electronAPI);

    // List all window properties that might be electronAPI
    const electronKeys = Object.keys(window).filter(k => k.toLowerCase().includes('electron'));
    console.log('[RENDERER] Electron-related keys:', electronKeys);
  };

  checkAPI();

  // Check again after delay
  setTimeout(checkAPI, 1000);
}, []);
```

## Expected vs Actual

**Expected Flow:**
1. Main process creates BrowserWindow with preload script
2. Preload script runs BEFORE renderer
3. `contextBridge.exposeInMainWorld` adds `electronAPI` to `window`
4. Renderer accesses `window.electronAPI`

**Actual Flow (Based on Logs):**
1. Main process starts ✅
2. Preload script runs (unknown - no logs)
3. Renderer starts ✅
4. `window.electronAPI` is undefined ❌
5. Fallback API activates ⚠️

## Immediate Action

The app is currently running in **fallback mode**, which means:
- Profile operations won't work (no IPC)
- All Electron APIs return mock data
- Discovery modules won't execute
- Configuration can't be saved

**We need to:**
1. Stop the current app
2. Add debug logging to preload.ts
3. Rebuild
4. Restart and check logs

## Files to Modify

1. `guiv2/src/preload.ts` - Add console.logs at the end
2. `guiv2/src/renderer.tsx` - Add API check logging

Let me make these changes now.
