# Electron Renderer Debug Guide - Blank Screen Issue

## Current Status
- ✅ Window opens successfully
- ✅ DevTools is open
- ❌ Blank/white screen (no React content)
- ❌ Title shows "index.htm" instead of "M&A Discovery Suite"

## Investigation Results

### What Works ✅
1. Webpack build completed successfully (48MB+ of bundles)
2. index.html generated with correct content and title
3. All JavaScript bundles present and non-zero size
4. Main process loads correct webpack entry point
5. Preload script exists and built

### Possible Root Causes

#### 1. JavaScript Console Errors (MOST LIKELY)
**Check DevTools Console NOW:**
- Open the DevTools window (already open)
- Click the "Console" tab
- Look for RED error messages

**Common errors to look for:**
- `Cannot find module 'lucide-react'` → Missing dependency
- `Unexpected token` → Syntax error in bundle
- `Failed to fetch` → Bundle loading failure
- CSP violation errors → Content Security Policy blocking scripts

#### 2. Content Security Policy (CSP) Issues
The generated HTML has extensive CSP nonces. If ANY script tag's nonce doesn't match the CSP header, it won't execute.

**Check for CSP errors:**
```
Look in Console for: "Refused to execute inline script because..."
```

#### 3. CSS Loading Failure
The renderer.tsx imports CSS files that might fail:
```typescript
import './index.css';
import './renderer/styles/tailwind.css';
```

**Check Network tab:**
- Click "Network" tab in DevTools
- Look for failed requests (red items)
- Check if CSS files loaded

## SOLUTION STEPS

### Step 1: Check Console (DO THIS FIRST)
1. In the open Electron window, focus on DevTools
2. Click the "Console" tab
3. Take a screenshot or note any errors
4. Look for the log messages:
   - "🚀 M&A Discovery Suite - Renderer Process Starting..."
   - "window.electronAPI: ..."
   - "✅ React app mounted successfully"

**If you see these messages:** React mounted successfully, issue is with rendering
**If you DON'T see these messages:** JavaScript execution failed

### Step 2: Check Network Tab
1. Click "Network" tab in DevTools
2. Look for failed requests (Status: Failed or 404)
3. Check if all `.js` files loaded successfully

### Step 3: Test with Minimal App
If console shows errors, we'll rebuild with a minimal test app:

```bash
cd D:/Scripts/UserMandA/guiv2

# Copy current renderer.tsx as backup
cp src/renderer.tsx src/renderer.tsx.backup

# Use minimal test version
cp src/renderer.minimal-test.tsx src/renderer.tsx

# Rebuild
npm run build

# Restart app
npm start
```

The minimal app will show a purple gradient screen if React works.

### Step 4: Check Dependencies
If you see "Cannot find module" errors:

```bash
cd D:/Scripts/UserMandA/guiv2
npm install
```

Common missing packages:
- lucide-react
- clsx
- react-router-dom
- zustand

### Step 5: Fix DOCTYPE Issue
The generated HTML has malformed DOCTYPE: `<!DOCTYPE >` instead of `<!DOCTYPE html>`

This shouldn't cause blank screen but fix it:
```bash
cd D:/Scripts/UserMandA/guiv2

# Find and fix HtmlWebpackPlugin config
# Check webpack.plugins.js or forge.config.js
```

## Quick Fix: Force Rebuild

```bash
cd D:/Scripts/UserMandA/guiv2

# Clean build cache
rm -rf .webpack
rm -rf node_modules/.cache

# Rebuild everything
npm run build

# Restart
npm start
```

## Expected Console Output (if working)

```
🚀 M&A Discovery Suite - Renderer Process Starting...
window.electronAPI: [Object object]
window.electronAPI keys: executeScript,executeModule,cancelExecution,discoverModules,...
✅ React app mounted successfully
```

## What to Report Back

Please provide:
1. **Console errors** (exact text of any red errors)
2. **Network failures** (any failed requests in Network tab)
3. **Console log messages** (do you see the "🚀" messages?)
4. **Page source** (Right-click → View Page Source, check if it matches webpack HTML)

## Emergency Fallback

If nothing works, use the ultra-minimal test:

1. Open DevTools Console
2. Paste this JavaScript:

```javascript
document.body.innerHTML = '<div style="background:purple;color:white;padding:40px;font-size:24px;">MANUAL TEST: JavaScript is working!</div>';
console.log('Manual test executed');
```

If you see the purple div:
- ✅ JavaScript execution works
- ✅ Problem is in React/App code
- ❌ Need to debug React mounting

If you DON'T see the purple div:
- ❌ JavaScript execution blocked
- ❌ Check CSP errors in console
- ❌ Check if bundles loaded in Network tab

## Files Created for Testing

1. `src/renderer\App.minimal.test.tsx` - Ultra-simple React component
2. `src/renderer.minimal-test.tsx` - Minimal entry point with extensive logging

Use these to isolate if the issue is:
- Build system (unlikely - bundles exist)
- React mounting (likely)
- Component errors (likely)
- Routing (possible)
- CSS processing (possible)
