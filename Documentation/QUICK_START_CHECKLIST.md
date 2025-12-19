# Quick Start Checklist - PowerShellExecutionDialog Integration

Print this page and check off each step as you complete it.

---

## 📋 Pre-Integration Checklist

- [ ] Close all VSCode windows
- [ ] Stop all Electron processes: `Get-Process -Name electron | Stop-Process -Force`
- [ ] Review `COPY_PASTE_CODE_CHANGES.md` for code snippets
- [ ] Backup current files (optional but recommended)

---

## 🔧 Hook Integration Checklist

For each hook file, make these 5 changes:

### [ ] 1. useFileSystemDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 2. useNetworkDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 3. useSQLServerDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 4. useVMwareDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 5. useHyperVDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 6. useWebServerConfigDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 7. useDomainDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 8. useDNSDHCPDiscoveryLogic.ts
- [ ] Check if file exists (may need creation)
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 9. useFileServerDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 10. useInfrastructureDiscoveryLogic.ts
- [ ] Check if file exists (may need creation)
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 11. useNetworkInfrastructureDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 12. usePhysicalServerDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 13. usePrinterDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 14. useStorageArrayDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

### [ ] 15. useScheduledTaskDiscoveryLogic.ts
- [ ] Add `isCancelling: boolean;` to interface
- [ ] Add `clearLogs: () => void;` to interface
- [ ] Add `const [isCancelling, setIsCancelling] = useState(false);`
- [ ] Add `clearLogs` function
- [ ] Update `cancelDiscovery` with `setIsCancelling(true/false)`
- [ ] Add `isCancelling,` and `clearLogs,` to return statement

---

## 🎨 View Integration Checklist

For each view file, make these 3 changes:

### [ ] 1. FileSystemDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 2. NetworkDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 3. SQLServerDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 4. VMwareDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 5. HyperVDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 6. WebServerConfigurationDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 7. DomainDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 8. DNSDHCPDiscoveryView.tsx
- [ ] Check if file exists
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 9. FileServerDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 10. InfrastructureDiscoveryView.tsx
- [ ] Check if file exists
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 11. NetworkInfrastructureDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 12. PhysicalServerDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 13. PrinterDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 14. StorageArrayDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

### [ ] 15. ScheduledTaskDiscoveryView.tsx
- [ ] Add `import PowerShellExecutionDialog`
- [ ] Destructure `isCancelling,` and `clearLogs,` from hook
- [ ] Add `<PowerShellExecutionDialog>` component

---

## 🚀 Deployment Checklist

- [ ] Stop Electron processes
- [ ] Copy hook files to deployment: `Copy-Item ... -Destination C:\enterprisediscovery\guiv2\src\renderer\hooks\`
- [ ] Copy view files to deployment: `Copy-Item ... -Destination C:\enterprisediscovery\guiv2\src\renderer\views\discovery\`
- [ ] Build main: `npm run build:main`
- [ ] Build preload: `npx webpack --config webpack.preload.config.js --mode=production`
- [ ] Build renderer: `npm run build:renderer`
- [ ] Launch app: `npm start`

---

## ✅ Testing Checklist

Test each module:

### [ ] 1. FileSystem Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 2. Network Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 3. SQLServer Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 4. VMware Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 5. HyperV Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 6. WebServerConfig Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 7. Domain Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 8. DNSDHCP Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 9. FileServer Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 10. Infrastructure Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 11. NetworkInfrastructure Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 12. PhysicalServer Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 13. Printer Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 14. StorageArray Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

### [ ] 15. ScheduledTask Discovery
- [ ] Opens without errors
- [ ] Dialog opens on start
- [ ] Logs appear
- [ ] Cancel works

---

## 📝 Final Checks

- [ ] All TypeScript errors resolved
- [ ] All webpack bundles built successfully
- [ ] Application launches without errors
- [ ] All 15 modules tested and working
- [ ] Changes committed to git
- [ ] Documentation updated

---

## 🎉 Completion

**Date Completed:** _______________

**Issues Encountered:** _______________

**Notes:** _______________

