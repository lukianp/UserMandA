# PowerShell Launcher Design Document

## Overview
Based on analysis of the original C# GUI (`/gui/`), this document describes how PowerShell execution and credential passing should work in the new Electron-based GUI.

## 1. PowerShell Execution Architecture

### From Old GUI (PowerShellExecutionService.cs)

The original GUI uses a sophisticated **Runspace Pooling** system:

```csharp
// Key Features:
- Runspace Pool: Min 2, Max 10 runspaces for concurrent execution
- Session Management: Each execution tracked by unique session ID
- Real-time Streaming: Progress, Output, Error events
- Credential Passing: Via Dictionary<string, object> parameters
- Module Import: Imports module before calling function
```

### Execution Pattern

```csharp
// 1. Import Module
powerShell.AddCommand("Import-Module")
         .AddParameter("Name", modulePath)  // e.g., "Modules/Discovery/AzureDiscovery.psm1"
         .AddParameter("Force", true);
await powerShell.InvokeAsync();

// 2. Call Function with Parameters
powerShell.AddCommand(functionName);  // e.g., "Start-AzureDiscovery"
foreach (var param in parameters) {
    powerShell.AddParameter(param.Key, param.Value);
}

// 3. Execute with Progress Tracking
var results = await powerShell.InvokeAsync<PSObject>();
```

## 2. Credential Passing to Modules

### Current Credential Service (credentialService.ts)

Credentials are loaded in order of precedence:
1. **Environment Variables** (highest priority)
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`

2. **Electron safeStorage** (encrypted, preferred)
   - Stored in: `%APPDATA%\Electron\credentials.enc`

3. **Legacy File** (unencrypted, backward compat)
   - Path: `C:\DiscoveryData\{companyName}\Credentials\discoverycredentials.config`
   - Format: JSON with BOM stripping

### How Credentials Should Be Passed to PowerShell

Discovery modules expect credentials as **parameters**:

```javascript
// Example: Starting Azure Discovery
const parameters = {
    CompanyName: "ljpops",
    TenantId: credentials.tenantId,
    ClientId: credentials.clientId,
    ClientSecret: credentials.clientSecret,
    OutputPath: "C:\\DiscoveryData\\ljpops\\Raw"
};

await executeModule({
    modulePath: "Modules/Discovery/AzureDiscovery.psm1",
    functionName: "Start-AzureDiscovery",
    parameters: parameters
});
```

## 3. Directory Structure Created by CompanyProfileManager.psm1

```
C:\DiscoveryData\
└── {companyName}/
    ├── Discovery/           # Source-organized discovery data
    │   ├── ActiveDirectory/
    │   ├── Azure/
    │   ├── Exchange/
    │   └── ...
    ├── Raw/                 # Raw CSV exports (used by LogicEngine)
    ├── Processed/           # Normalized data
    │   ├── Users/
    │   ├── Groups/
    │   └── Waves/
    ├── Reports/             # Generated reports
    │   ├── Executive/
    │   ├── Technical/
    │   └── Migration/
    ├── Logs/                # Execution logs
    │   ├── Discovery/
    │   ├── Processing/
    │   └── Errors/
    ├── Config/              # Company-specific config
    └── Credentials/         # Credentials (if using legacy)
        └── discoverycredentials.config
```

## 4. PowerShell Window (Interactive Execution)

The old GUI also has `PowerShellWindow.xaml.cs` for **interactive script execution**:

```csharp
// Spawns PowerShell as a Process
var startInfo = new ProcessStartInfo {
    FileName = GetPowerShellPath(),  // powershell.exe or pwsh.exe
    Arguments = $"-ExecutionPolicy Bypass -NoProfile -File \"{scriptPath}\" {args}",
    UseShellExecute = false,
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    CreateNoWindow = true,
    WorkingDirectory = Path.GetDirectoryName(scriptPath)
};

// Captures output in real-time
powerShellProcess.OutputDataReceived += (sender, e) => {
    AppendOutput(e.Data);  // Display in TextBox with timestamp
};
```

## 5. Setup & Prerequisites

### App Registration (SetupAppRegistration)

Not found as a separate module, but likely part of `AuthenticationService.psm1` or run as a prerequisite script.

**What it should do:**
1. Check if Azure app registration exists for the company
2. If not, create one with required Microsoft Graph permissions:
   - `User.Read.All`
   - `Group.Read.All`
   - `Directory.Read.All`
   - `Application.Read.All`
   - etc.
3. Generate client secret
4. Save credentials to `C:\DiscoveryData\{companyName}\Credentials\discoverycredentials.config`

### Prerequisites Check

Before running discovery, check:
1. **PowerShell Modules Installed:**
   - `Microsoft.Graph` (v2.x)
   - `ExchangeOnlineManagement`
   - `Az.Accounts` / `Az.Resources`
   - `ActiveDirectory`

2. **Credentials Configured:**
   - Test connection to Azure using saved credentials
   - Validate permissions

3. **Directory Structure:**
   - Ensure `C:\DiscoveryData\{companyName}` exists
   - Create required subdirectories

## 6. Recommended Implementation for guiv2

### A. Enhance PowerShellExecutionService

Current service at `guiv2/src/main/services/powerShellService.ts`:
- ✅ Already has runspace pooling
- ✅ Already supports module execution
- ❌ Needs credential injection before module execution
- ❌ Needs progress streaming to renderer

**Add:**
```typescript
async executeDiscoveryModule(
  moduleName: string,
  companyName: string,
  options?: DiscoveryOptions
): Promise<PowerShellResult> {
  // 1. Load credentials from CredentialService
  const credentials = await this.credentialService.getCredential(companyName);

  // 2. Prepare parameters
  const parameters = {
    CompanyName: companyName,
    TenantId: credentials.tenantId,
    ClientId: credentials.clientId,
    ClientSecret: credentials.clientSecret,
    OutputPath: `C:\\DiscoveryData\\${companyName}\\Raw`,
    ...options
  };

  // 3. Execute module
  return await this.executeModule({
    modulePath: `Modules/Discovery/${moduleName}Discovery.psm1`,
    functionName: `Start-${moduleName}Discovery`,
    parameters
  });
}
```

### B. Create PowerShell Window Component

Add a new `PowerShellWindow` component for interactive execution:
- Display output in real-time (like old GUI)
- Allow stopping execution
- Copy output to clipboard
- Show progress bar

**Component Structure:**
```
src/renderer/components/PowerShellWindow/
├── PowerShellWindow.tsx      # Main component
├── PowerShellOutput.tsx       # Output display with timestamps
└── PowerShellControls.tsx     # Run, Stop, Copy, Clear buttons
```

### C. Create Prerequisites Checker

```typescript
// src/main/services/prerequisitesService.ts
export class PrerequisitesService {
  async checkPowerShellModules(): Promise<ModuleStatus[]> {
    const requiredModules = [
      'Microsoft.Graph',
      'ExchangeOnlineManagement',
      'Az.Accounts',
      'ActiveDirectory'
    ];

    for (const module of requiredModules) {
      const installed = await this.isModuleInstalled(module);
      const version = await this.getModuleVersion(module);
      // return status
    }
  }

  async checkCredentials(companyName: string): Promise<boolean> {
    const credentials = await this.credentialService.getCredential(companyName);
    if (!credentials) return false;

    // Test connection
    return await this.testAzureConnection(credentials);
  }

  async initializeCompanyProfile(companyName: string): Promise<void> {
    // Call CompanyProfileManager.psm1
    await this.psService.executeModule({
      modulePath: 'Modules/Core/CompanyProfileManager.psm1',
      functionName: 'New-CompanyProfile',
      parameters: { CompanyName: companyName }
    });
  }
}
```

### D. System Status Integration

The "Data Connection" status indicator in the GUI should reflect:
- ✅ **Connected**: Credentials exist and validated
- ⚠️ **Disconnected**: No credentials found
- ❌ **Error**: Credentials found but invalid/expired

Update when:
- App starts (check credentials)
- User clicks "Test" button (validate connection)
- Discovery module completes (revalidate)

## 7. Discovery Module Execution Flow

```
User clicks "Start Discovery"
    ↓
Prerequisites Check
    ├─ Credentials exist?
    ├─ PowerShell modules installed?
    └─ Directory structure ready?
    ↓
Load Credentials
    ↓
Execute Module (with credentials as parameters)
    ├─ Progress updates → Renderer (via IPC)
    ├─ Output lines → Renderer
    └─ Errors → Renderer
    ↓
Module writes to C:\DiscoveryData\{company}\Raw\{Module}*.csv
    ↓
LogicEngine auto-detects new CSVs and parses
    ↓
Dashboard updates with new data
```

## 8. Key Takeaways

1. **Credentials are passed as PowerShell parameters**, not environment variables (though env vars can be a fallback)

2. **Module import happens first**, then function call with parameters

3. **Real-time streaming** is critical for user experience - show progress and output as it happens

4. **Prerequisites checking** should happen before any discovery execution

5. **Directory structure** should be created automatically by CompanyProfileManager module

6. **Legacy credential files** (discoverycredentials.config) must be supported for backward compatibility

## Next Steps

1. ✅ Fix credential path (use companyName not ID) - DONE
2. ✅ Strip BOM from legacy credential files - DONE
3. ⏳ Test connection validation working
4. ⬜ Implement Prerequisites Service
5. ⬜ Add real-time progress streaming from PowerShell to renderer
6. ⬜ Create PowerShellWindow component for interactive execution
7. ⬜ Integrate with discovery module execution
