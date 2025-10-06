# GUI v2 Build & Debug Testing Guide

## 🚀 **Quick Start - Recommended Approach**

The best way to test and debug GUI v2 is using the automated monitoring script:

```powershell
.\Monitor-GuiV2Build.ps1
```

This script will:
1. ✅ Build the application
2. ✅ Launch it from C:\enterprisediscovery\guiv2
3. ✅ Monitor console output in real-time
4. ✅ Collect all errors automatically
5. ✅ Save everything to ERRORS.md for later fixing

---

## 📋 **Step-by-Step Testing Process**

### **Phase 1: Initial Build & Launch**

#### **Step 1: Run the Monitor Script**
```powershell
# Navigate to project root
cd D:\Scripts\UserMandA

# Run the automated monitoring script
.\Monitor-GuiV2Build.ps1
```

**What it does:**
- Builds GUI v2 using buildguiv2.ps1
- Captures all build output to `build-output.log`
- Detects build errors, TypeScript errors, and warnings
- Launches the Electron app from C:\enterprisediscovery\guiv2
- Monitors console output in real-time
- Saves all errors to `ERRORS.md` in categorized format

#### **Step 2: Watch the Output**

The script will show color-coded output:
- 🟢 **Green** - Success messages, normal operation
- 🟡 **Yellow** - Warnings (non-blocking)
- 🔴 **Red** - Errors (need fixing)
- 🔵 **Cyan** - Info messages, progress updates
- ⚪ **Gray** - Standard output

#### **Step 3: Check the Application Window**

Once launched, verify:
- [ ] Application window opens
- [ ] No white screen / blank page
- [ ] Dashboard loads
- [ ] Navigation sidebar visible
- [ ] No console errors in DevTools (F12)

---

### **Phase 2: Error Analysis**

After the monitoring script completes, you'll have:

1. **`ERRORS.md`** - Categorized error report with:
   - Build Errors (compilation failures)
   - TypeScript Errors (type issues)
   - Runtime Errors (application crashes)
   - Console Errors (logged warnings/errors)
   - Summary table

2. **`build-output.log`** - Complete build process output

3. **`app-stdout.log`** - Application standard output

4. **`app-stderr.log`** - Application error output

#### **Error Categories**

**🔴 Build Errors (CRITICAL)**
- These prevent the app from building
- Must be fixed before anything else
- Usually:
  - Missing dependencies
  - Syntax errors
  - Module resolution issues

**🟠 TypeScript Errors (HIGH PRIORITY)**
- Type safety issues
- Won't prevent build in dev mode
- Should be fixed for production
- Common patterns already documented in:
  - `TypeScript_Error_Analysis_Report.md`

**🔴 Runtime Errors (CRITICAL)**
- Application crashes or malfunctions
- Usually:
  - Uncaught exceptions
  - Missing IPC handlers
  - Undefined variables
  - API call failures

**⚠️ Console Errors (MEDIUM PRIORITY)**
- Logged errors/warnings
- May or may not affect functionality
- Review and fix as needed

---

### **Phase 3: Iterative Fixing**

#### **Fix Cycle:**

1. **Review ERRORS.md**
   ```powershell
   code ERRORS.md
   ```

2. **Fix highest priority errors first:**
   - Build Errors → TypeScript Errors → Runtime Errors → Console Errors

3. **Re-run monitoring script:**
   ```powershell
   .\Monitor-GuiV2Build.ps1
   ```

4. **Compare error counts:**
   - Check if errors decreased
   - Verify no new errors introduced

5. **Repeat until zero errors**

#### **Skip Build (Faster Iteration)**

If you're only changing code and don't need a full rebuild:

```powershell
.\Monitor-GuiV2Build.ps1 -SkipBuild
```

This launches the existing build and monitors for runtime errors only.

---

## 🛠️ **Manual Testing (Alternative Method)**

If you prefer manual control:

### **Step 1: Build**
```powershell
cd D:\Scripts\UserMandA
.\buildguiv2.ps1 -Configuration Development
```

### **Step 2: Navigate to Output**
```powershell
cd C:\enterprisediscovery\guiv2
```

### **Step 3: Launch**
```powershell
# Option 1: Using npm
npm start

# Option 2: Using batch file
.\Launch-MandADiscoverySuiteV2.bat

# Option 3: Using PowerShell launcher
.\Launch-MandADiscoverySuiteV2.ps1
```

### **Step 4: Monitor Console**

Open DevTools in the Electron window:
- Press **F12** or **Ctrl+Shift+I**
- Go to **Console** tab
- Look for errors (red) and warnings (yellow)

### **Step 5: Check Main Process Logs**

The main Electron process logs to console where you ran `npm start`:
- Look for errors in the terminal output
- Check for IPC handler errors
- Verify service initialization

---

## 🔍 **Common Issues & Solutions**

### **Issue: "Cannot find module" errors**

**Solution:**
```powershell
cd guiv2
npm ci
npm start
```

### **Issue: White screen on launch**

**Causes:**
1. Webpack bundle not built correctly
2. React rendering error
3. Missing index.html

**Debug:**
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed loads
4. Review `ERRORS.md` for build errors

**Solution:**
```powershell
# Rebuild from scratch
cd guiv2
Remove-Item .webpack -Recurse -Force
npm run package
npm start
```

### **Issue: TypeScript compilation errors**

**Quick Fix:**
```powershell
cd guiv2
npx tsc --noEmit --skipLibCheck
```

Review output and fix errors using patterns from `TypeScript_Error_Analysis_Report.md`

### **Issue: IPC Handler not found**

**Symptoms:**
- Console shows: `Error invoking remote method 'xxx': Error: No handler registered`

**Solution:**
1. Check `guiv2/src/main/ipcHandlers.ts` for handler registration
2. Verify handler name matches renderer call
3. Ensure handler is imported and registered in `initializeServices()`

**Example Fix:**
```typescript
// In ipcHandlers.ts
ipcMain.handle('dashboard:getStats', async () => {
  // Handler implementation
});

// In preload.ts
dashboard: {
  getStats: () => ipcRenderer.invoke('dashboard:getStats')
}
```

---

## 📊 **Success Criteria**

### **Phase 1: Build Success**
- [ ] buildguiv2.ps1 completes without errors
- [ ] All critical files present in C:\enterprisediscovery\guiv2
- [ ] No TypeScript compilation errors (or <100 errors)

### **Phase 2: Launch Success**
- [ ] Application window opens
- [ ] No white screen
- [ ] Dashboard displays (even if with mock data)
- [ ] Navigation sidebar functional
- [ ] No critical console errors

### **Phase 3: Runtime Success**
- [ ] Can navigate between views
- [ ] No crashes or freezes
- [ ] IPC communication working
- [ ] Error boundaries catch errors gracefully
- [ ] Application logs to console (verbose mode)

---

## 🎯 **Testing Checklist**

### **Core Functionality**
- [ ] Dashboard loads with statistics
- [ ] Users view shows data (from CSV or PowerShell)
- [ ] Groups view shows data
- [ ] Computers view shows data
- [ ] Infrastructure views load
- [ ] Security views load
- [ ] Discovery modules can be executed
- [ ] Migration planning functional
- [ ] Reports can be generated
- [ ] Settings can be saved

### **Navigation**
- [ ] Sidebar navigation works
- [ ] Keyboard shortcuts work (Ctrl+1, Ctrl+2, etc.)
- [ ] Route navigation via URL
- [ ] Back/forward browser buttons work
- [ ] Tab management (if implemented)

### **UI/UX**
- [ ] Dark mode toggles correctly
- [ ] Responsive layout (resize window)
- [ ] Loading states display
- [ ] Error states display
- [ ] Toast notifications appear
- [ ] Modals open/close correctly
- [ ] DataTables render and sort
- [ ] Drag-and-drop works (migration planning)

### **Data Integration**
- [ ] Logic Engine data loads
- [ ] PowerShell modules execute
- [ ] CSV files read correctly
- [ ] Profile switching works
- [ ] Project configuration saves
- [ ] Wave management CRUD operations

---

## 🚨 **Emergency Debugging**

If the application won't start at all:

### **1. Check Node.js**
```powershell
node --version  # Should be v16+ or v18+
npm --version
```

### **2. Reinstall Dependencies**
```powershell
cd guiv2
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

### **3. Check Electron**
```powershell
cd guiv2
npx electron --version
```

### **4. Verify Build Output**
```powershell
cd C:\enterprisediscovery\guiv2
dir .webpack\main\index.js
dir .webpack\renderer\main_window\index.html
```

Both files must exist. If not, rebuild:
```powershell
cd D:\Scripts\UserMandA
.\buildguiv2.ps1 -Configuration Development
```

### **5. Check Logs**
Review these files in order:
1. `D:\Scripts\UserMandA\build-output.log`
2. `D:\Scripts\UserMandA\ERRORS.md`
3. `D:\Scripts\UserMandA\app-stderr.log`
4. Electron DevTools Console (F12 in app window)

---

## 📝 **Logging Levels**

### **Development Mode**
```powershell
$env:DEBUG = "true"
$env:NODE_ENV = "development"
$env:ELECTRON_ENABLE_LOGGING = "1"
npm start
```

**Provides:**
- Verbose console output
- Detailed error stacks
- React DevTools available
- Hot reload (if configured)
- Source maps for debugging

### **Production Mode**
```powershell
$env:NODE_ENV = "production"
npm start
```

**Provides:**
- Minimal console output
- Optimized bundle
- No DevTools
- Better performance

---

## 🔧 **Advanced Debugging**

### **Enable React DevTools**
1. Install extension in Electron
2. Launch with: `$env:ELECTRON_ENABLE_LOGGING = "1"`
3. Open DevTools (F12)
4. React tab appears

### **Enable Redux DevTools** (if using Redux)
Already integrated via Zustand devtools middleware.

### **Network Request Monitoring**
1. Open DevTools (F12)
2. Go to Network tab
3. Monitor IPC calls (if using debugging proxy)

### **Performance Profiling**
```powershell
cd guiv2
npm run performance:measure
```

### **Bundle Analysis**
```powershell
cd guiv2
npm run analyze
```

Opens webpack-bundle-analyzer in browser showing bundle composition.

---

## 📖 **Additional Resources**

### **Documentation**
- `SESSION_COMPLETION_REPORT.md` - Complete implementation summary
- `TypeScript_Error_Analysis_Report.md` - Error fixing guide
- `FINISHED.md` - Completed work catalogue
- `CLAUDE.md` - Original task list and requirements

### **Code Reference**
- **Hooks:** `guiv2/src/renderer/hooks/`
- **Views:** `guiv2/src/renderer/views/`
- **Services:** `guiv2/src/main/services/`
- **IPC Handlers:** `guiv2/src/main/ipcHandlers.ts`
- **Routes:** `guiv2/src/renderer/App.tsx`

### **Patterns**
All views follow this pattern:
1. Create hook: `use[ViewName]Logic.ts`
2. Create view: `[ViewName].tsx`
3. Add route in `App.tsx`
4. Use DataTable for display

---

## 🎓 **Best Practices**

### **Before Each Test Session**
1. Pull latest code
2. Review ERRORS.md from last session
3. Clear old logs: `Remove-Item *.log`
4. Run fresh build: `.\Monitor-GuiV2Build.ps1`

### **During Testing**
1. Keep DevTools open (F12)
2. Monitor console for errors
3. Test one feature at a time
4. Document new issues in ERRORS.md
5. Take screenshots of UI errors

### **After Testing**
1. Review all error logs
2. Categorize errors by priority
3. Fix critical errors first
4. Commit fixes with clear messages
5. Re-test to verify fixes

---

## ✅ **Success = Zero Errors in ERRORS.md**

Your goal is to run `.\Monitor-GuiV2Build.ps1` and see:

```
╔═══════════════════════════════════════════════════════════╗
║                    ERROR SUMMARY                          ║
╠═══════════════════════════════════════════════════════════╣
║  Build Errors:        0                                   ║
║  TypeScript Errors:   0                                   ║
║  Runtime Errors:      0                                   ║
║  Console Errors:      0                                   ║
║  Warnings:            0                                   ║
╠═══════════════════════════════════════════════════════════╣
║  TOTAL ERRORS:        0                                   ║
╚═══════════════════════════════════════════════════════════╝

[✓] No errors detected! Application is running successfully.
```

---

**Now you're ready to test! Run: `.\Monitor-GuiV2Build.ps1`** 🚀
