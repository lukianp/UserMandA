# Profile Management Architecture Documentation

**Source:** GUI/ C# WPF Application
**Target:** guiv2/ Electron/React/TypeScript Application
**Purpose:** Complete architecture reference for implementing profile management in guiv2/

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [CompanyProfile Architecture](#companyprofile-architecture)
3. [TargetProfile Architecture](#targetprofile-architecture)
4. [ProfileService Patterns](#profileservice-patterns)
5. [TargetProfileService Patterns](#targetprofileservice-patterns)
6. [Azure App Registration Workflow](#azure-app-registration-workflow)
7. [Environment Detection (T-000) Implementation](#environment-detection-t-000-implementation)
8. [Profile Persistence and Session Management](#profile-persistence-and-session-management)
9. [PowerShell Script Execution Patterns](#powershell-script-execution-patterns)
10. [Implementation Roadmap for guiv2/](#implementation-roadmap-for-guiv2)

---

## Executive Summary

The GUI/ application uses a sophisticated profile management system with:

- **CompanyProfile (Source)**: Represents source environment for discovery
- **TargetProfile (Target)**: Represents target environment for migration
- **Windows DPAPI Encryption**: All credentials encrypted with DataProtectionScope.CurrentUser
- **File-Based Persistence**: Profiles stored in JSON at `C:\DiscoveryData\{CompanyName}\Configuration\`
- **Environment Detection**: Automatic detection of On-Premises/Azure/Hybrid environments
- **PowerShell Integration**: Deep integration with PowerShell scripts for discovery and configuration

**Critical Gap**: guiv2/ has basic CompanyProfile management but is completely missing:
1. TargetProfile management (entire feature)
2. Azure App Registration workflow
3. Environment detection service (T-000)
4. Credential encryption
5. Session persistence/restoration

---

## CompanyProfile Architecture

### Model Definition (GUI/Models/DiscoveryModels.cs)

```csharp
public class CompanyProfile : INotifyPropertyChanged
{
    // Core Properties
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CompanyName { get; set; }
    public string Description { get; set; }
    public string DomainController { get; set; }
    public string TenantId { get; set; }
    public bool IsActive { get; set; }
    public DateTime Created { get; set; }
    public DateTime LastModified { get; set; }

    // Statistics
    public int RecordCount { get; set; } = 0;
    public DateTime? LastDiscovery { get; set; }

    // Environment Configuration
    public string Path { get; set; } = "";
    public string Industry { get; set; } = "";
    public bool IsHybrid { get; set; } = false;
    public bool HasDatabases { get; set; } = false;
    public int EstimatedUserCount { get; set; } = 0;
    public int EstimatedDeviceCount { get; set; } = 0;
    public long EstimatedDataSize { get; set; } = 0;
    public List<string> Locations { get; set; } = new List<string>();

    // Flexible Configuration
    public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();

    // Computed Properties
    public bool IsDefault { get; set; } = false;
    public bool CanDelete => !IsDefault;
    public string Name => CompanyName;
    public string DisplayName => CompanyName;
}
```

### TypeScript Equivalent for guiv2/

```typescript
export interface CompanyProfile {
  // Core Properties
  id: string;
  companyName: string;
  description?: string;
  domainController?: string;
  tenantId?: string;
  isActive: boolean;
  created: Date;
  lastModified: Date;

  // Statistics
  recordCount?: number;
  lastDiscovery?: Date;

  // Environment Configuration
  path?: string;
  industry?: string;
  isHybrid?: boolean;
  hasDatabases?: boolean;
  estimatedUserCount?: number;
  estimatedDeviceCount?: number;
  estimatedDataSize?: number;
  locations?: string[];

  // Flexible Configuration
  configuration?: Record<string, any>;

  // Computed Properties
  isDefault?: boolean;
}
```

### Data Path Convention

**GUI/ Pattern:**
```
C:\DiscoveryData\{CompanyName}\
├── Raw\                      # CSV output from discovery modules
├── Logs\                     # Execution logs
├── Credentials\              # Encrypted credentials
├── Configuration\            # Profile JSON files
│   ├── target-profiles.json # Target profiles for this company
│   └── settings.json        # Company-specific settings
├── Discovery\                # Discovery artifacts
├── Reports\                  # Generated reports
└── Backups\                  # Backup files
```

**Implementation:**
- Must maintain this exact structure for compatibility
- guiv2/ should use identical paths
- Electron main process handles directory creation

---

## TargetProfile Architecture

### Model Definition (GUI/Models/TargetProfile.cs)

```csharp
public class TargetProfile
{
    // Core Identity
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;

    // Encrypted Credentials (Windows DPAPI)
    public string ClientSecretEncrypted { get; set; } = string.Empty;
    public string UsernameEncrypted { get; set; } = string.Empty;
    public string PasswordEncrypted { get; set; } = string.Empty;
    public string CertificateThumbprint { get; set; } = string.Empty;

    // Environment Information
    public string Environment { get; set; } = string.Empty; // OnPremises, Azure, Hybrid
    public string Domain { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string SharePointUrl { get; set; } = string.Empty;
    public string SqlConnectionString { get; set; } = string.Empty;

    // Graph API Configuration
    public List<string> Scopes { get; set; } = new List<string>
    {
        "User.Read.All",
        "Group.Read.All",
        "Directory.Read.All",
        "Mail.ReadWrite",
        "Sites.ReadWrite.All",
        "Files.ReadWrite.All"
    };

    // Connection Test Results
    public DateTime? LastConnectionTest { get; set; }
    public bool? LastConnectionTestResult { get; set; }
    public string LastConnectionTestMessage { get; set; } = string.Empty;

    // Timestamps
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastModified { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; }

    // Encryption Methods
    public string EncryptString(string plaintext) { /* DPAPI encryption */ }
    public string DecryptString(string encryptedBase64) { /* DPAPI decryption */ }
    public void SetClientSecret(string plainSecret) { /* Encrypt and store */ }
    public string GetClientSecret() { /* Decrypt and return */ }
    public void SetUsername(string plainUsername) { /* Encrypt and store */ }
    public string GetUsername() { /* Decrypt and return */ }
    public void SetPassword(string plainPassword) { /* Encrypt and store */ }
    public string GetPassword() { /* Decrypt and return */ }

    // Validation
    public bool IsValid() {
        return !string.IsNullOrWhiteSpace(Name) &&
               !string.IsNullOrWhiteSpace(TenantId) &&
               (!string.IsNullOrWhiteSpace(ClientSecretEncrypted) ||
                !string.IsNullOrWhiteSpace(CertificateThumbprint));
    }
}
```

### TypeScript Equivalent for guiv2/

```typescript
export interface TargetProfile {
  // Core Identity
  id: string;
  name: string;
  tenantId: string;
  clientId: string;

  // Encrypted Credentials (stored as Base64)
  clientSecretEncrypted?: string;
  usernameEncrypted?: string;
  passwordEncrypted?: string;
  certificateThumbprint?: string;

  // Environment Information
  environment?: string; // 'OnPremises' | 'Azure' | 'Hybrid'
  domain?: string;
  region?: string;
  tenantName?: string;
  sharePointUrl?: string;
  sqlConnectionString?: string;

  // Graph API Configuration
  scopes?: string[];

  // Connection Test Results
  lastConnectionTest?: Date;
  lastConnectionTestResult?: boolean;
  lastConnectionTestMessage?: string;

  // Timestamps
  created: Date;
  lastModified: Date;
  isActive: boolean;
}

// Credential encryption service for guiv2/
export interface CredentialEncryptionService {
  encryptString(plaintext: string): Promise<string>;
  decryptString(encryptedBase64: string): Promise<string>;
  isAvailable(): boolean;
}
```

### Encryption Strategy for guiv2/

**Challenge**: Windows DPAPI not available in Electron renderer process

**Solutions** (in order of preference):

1. **Electron safeStorage API** (Recommended):
   ```typescript
   import { safeStorage } from 'electron';

   // In main process
   function encryptCredential(plaintext: string): string {
     const buffer = Buffer.from(plaintext, 'utf8');
     const encrypted = safeStorage.encryptString(buffer.toString());
     return encrypted.toString('base64');
   }

   function decryptCredential(encryptedBase64: string): string {
     const buffer = Buffer.from(encryptedBase64, 'base64');
     return safeStorage.decryptString(buffer);
   }
   ```
   - Uses Windows DPAPI on Windows
   - Uses Keychain on macOS
   - Uses libsecret on Linux

2. **Windows DPAPI via PowerShell** (Legacy compatibility):
   ```typescript
   async function encryptWithDPAPI(plaintext: string): Promise<string> {
     const script = `
       $plainBytes = [Text.Encoding]::UTF8.GetBytes('${plaintext}')
       $entropy = [Text.Encoding]::UTF8.GetBytes('MandA-Discovery-Suite-2025')
       $encrypted = [Security.Cryptography.ProtectedData]::Protect(
         $plainBytes, $entropy, 'CurrentUser'
       )
       [Convert]::ToBase64String($encrypted)
     `;
     const result = await executePowerShell(script);
     return result.trim();
   }
   ```

**Recommendation**: Use Electron safeStorage for cross-platform support

---

## ProfileService Patterns

### Core Operations (GUI/Services/ProfileService.cs)

#### 1. Get All Profiles
```csharp
public async Task<IEnumerable<CompanyProfile>> GetProfilesAsync()
{
    // Load from: %AppData%\MandADiscoverySuite\profiles.json
    if (File.Exists(_profilesFile))
    {
        var json = await File.ReadAllTextAsync(_profilesFile);
        _cachedProfiles = JsonSerializer.Deserialize<List<CompanyProfile>>(json);
    }
    else
    {
        // Auto-discover from C:\DiscoveryData\ directories
        _cachedProfiles = CreateDefaultProfiles();
        await SaveProfilesAsync();
    }
    return _cachedProfiles.OrderBy(p => p.CompanyName);
}
```

**guiv2/ Implementation:**
```typescript
// Electron main process (ipcHandlers.ts)
ipcMain.handle('profile:load-source-profiles', async () => {
  const profilesPath = path.join(
    app.getPath('appData'),
    'MandADiscoverySuite',
    'profiles.json'
  );

  if (fs.existsSync(profilesPath)) {
    const json = await fs.promises.readFile(profilesPath, 'utf8');
    return JSON.parse(json);
  }

  // Auto-discover from C:\DiscoveryData
  return await autoDiscoverProfiles();
});
```

#### 2. Create Profile
```csharp
public async Task<CompanyProfile> CreateProfileAsync(CompanyProfile profile)
{
    // Validate unique name
    if (existingProfiles.Any(p => p.CompanyName.Equals(profile.CompanyName,
        StringComparison.OrdinalIgnoreCase)))
    {
        throw new InvalidOperationException("Duplicate profile name");
    }

    // Create directory structure
    var companyPath = $"C:\\DiscoveryData\\{profile.CompanyName}";
    Directory.CreateDirectory(Path.Combine(companyPath, "Raw"));
    Directory.CreateDirectory(Path.Combine(companyPath, "Logs"));
    Directory.CreateDirectory(Path.Combine(companyPath, "Credentials"));
    Directory.CreateDirectory(Path.Combine(companyPath, "Configuration"));

    _cachedProfiles.Add(profile);
    await SaveProfilesAsync();
    return profile;
}
```

**guiv2/ Implementation:**
```typescript
ipcMain.handle('profile:create-source-profile', async (event, profile) => {
  // Validate unique name
  const profiles = await loadProfiles();
  if (profiles.some(p => p.companyName.toLowerCase() === profile.companyName.toLowerCase())) {
    throw new Error('Profile with this name already exists');
  }

  // Create directory structure
  const companyPath = path.join('C:\\DiscoveryData', profile.companyName);
  await fs.promises.mkdir(path.join(companyPath, 'Raw'), { recursive: true });
  await fs.promises.mkdir(path.join(companyPath, 'Logs'), { recursive: true });
  await fs.promises.mkdir(path.join(companyPath, 'Credentials'), { recursive: true });
  await fs.promises.mkdir(path.join(companyPath, 'Configuration'), { recursive: true });

  // Save profile
  profile.id = crypto.randomUUID();
  profile.created = new Date().toISOString();
  profile.lastModified = new Date().toISOString();
  profiles.push(profile);
  await saveProfiles(profiles);

  return profile;
});
```

#### 3. Set Active Profile (with LogicEngine Reload)
```csharp
public async Task<bool> SetCurrentProfileAsync(string profileName)
{
    var targetProfile = profiles.FirstOrDefault(
        p => p.CompanyName == profileName || p.Id == profileName);

    if (targetProfile == null) return false;

    // Set all profiles as inactive
    foreach (var profile in profiles) profile.IsActive = false;

    // Set target profile as active
    targetProfile.IsActive = true;
    await SaveProfilesAsync();

    ProfilesChanged?.Invoke(this, EventArgs.Empty);
    return true;
}
```

**guiv2/ Pattern (from useProfileStore.ts):**
```typescript
setSelectedSourceProfile: async (profile) => {
  // Step 1: Set active profile
  const result = await window.electronAPI.setActiveSourceProfile(profile.id);

  // Step 2: Trigger LogicEngine data reload
  const loadResult = await window.electronAPI.invoke('logic-engine:load-all', {
    profilePath: result.dataPath,
  });

  if (!loadResult.success) {
    throw new Error(`Failed to load data: ${loadResult.error}`);
  }

  // Step 3: Update state (triggers view reloads)
  set({ selectedSourceProfile: profile });
}
```

#### 4. Delete Profile
```csharp
public async Task<bool> DeleteProfileAsync(string profileId)
{
    var profile = _cachedProfiles.FirstOrDefault(p => p.Id == profileId);
    if (profile == null) return false;

    _cachedProfiles.Remove(profile);
    await SaveProfilesAsync();

    // Also delete associated data directory
    var dataPath = Path.Combine("C:\\DiscoveryData", profile.CompanyName);
    if (Directory.Exists(dataPath))
    {
        Directory.Delete(dataPath, true);
    }

    return true;
}
```

---

## TargetProfileService Patterns

### Storage Location
**Path:** `C:\DiscoveryData\{CompanyName}\Configuration\target-profiles.json`

**Key Insight**: Target profiles are stored PER SOURCE COMPANY
- One source company can have multiple target profiles for migration scenarios
- Example: "Acme Corp" (source) → ["Azure Tenant A", "Azure Tenant B"] (targets)

### Core Operations (GUI/Services/TargetProfileService.cs)

#### 1. Get Target Profiles for Company
```csharp
public async Task<IReadOnlyList<TargetProfile>> GetProfilesAsync(string companyName)
{
    // Check cache first
    if (_loadedForCompany.Equals(companyName) && _cache.Any())
    {
        return _cache.ToList();
    }

    var path = GetProfilesPath(companyName); // C:\DiscoveryData\{companyName}\Configuration\target-profiles.json
    if (File.Exists(path))
    {
        var json = await File.ReadAllTextAsync(path);
        _cache = JsonSerializer.Deserialize<List<TargetProfile>>(json);
        _loadedForCompany = companyName;
    }
    else
    {
        _cache = new List<TargetProfile>();
        _loadedForCompany = companyName;
    }

    return _cache.ToList();
}
```

#### 2. Create/Update Target Profile
```csharp
public async Task<TargetProfile> CreateOrUpdateAsync(
    string companyName,
    TargetProfile profile,
    string plainClientSecret)
{
    // Encrypt secret only if provided
    if (!string.IsNullOrEmpty(plainClientSecret))
    {
        profile.ClientSecretEncrypted = DataProtectionService.ProtectToBase64(plainClientSecret);
    }

    profile.LastModified = DateTime.UtcNow;

    var list = (await GetProfilesAsync(companyName)).ToList();
    var existing = list.FirstOrDefault(p => p.Id == profile.Id);

    if (existing == null)
    {
        list.Add(profile);
    }
    else
    {
        // Update properties
        existing.Name = profile.Name;
        existing.TenantId = profile.TenantId;
        existing.ClientId = profile.ClientId;
        // ... etc
        if (!string.IsNullOrEmpty(profile.ClientSecretEncrypted))
        {
            existing.ClientSecretEncrypted = profile.ClientSecretEncrypted;
        }
    }

    await SaveAllAsync(companyName, list);
    return profile;
}
```

#### 3. Auto-Import from App Registration
```csharp
public async Task<bool> AutoImportFromAppRegistrationAsync(string companyName)
{
    // Search for credential files in two locations:
    // 1. Source company's Credentials folder
    var credDir = Path.Combine($"C:\\discoverydata\\{companyName}\\Credentials");

    // 2. Selected target company's Credentials folder (if different)
    var targetCredDir = Path.Combine(
        $"C:\\discoverydata\\{ConfigurationService.Instance.SelectedTargetCompany}\\Credentials"
    );

    // Look for credential_summary.json or discoverycredentials.summary.json
    var summaryPath = Path.Combine(credDir, "credential_summary.json");
    if (!File.Exists(summaryPath))
    {
        summaryPath = Path.Combine(credDir, "discoverycredentials.summary.json");
    }

    if (File.Exists(summaryPath))
    {
        var summaryJson = await File.ReadAllTextAsync(summaryPath);
        var doc = JsonDocument.Parse(summaryJson);
        var root = doc.RootElement;

        var tenantId = root.GetProperty("TenantId").GetString();
        var clientId = root.GetProperty("ClientId").GetString();
        var credFile = root.GetProperty("CredentialFile").GetString();

        // Decrypt credential file using PowerShell
        var clientSecret = await DecryptCredentialFileAsync(credFile);

        // Create or update target profile
        var profile = new TargetProfile
        {
            Name = "AppRegistration",
            TenantId = tenantId,
            ClientId = clientId,
            IsActive = !list.Any()
        };

        await CreateOrUpdateAsync(companyName, profile, clientSecret);
        return true;
    }

    return false;
}

private static async Task<string> DecryptCredentialFileAsync(string credentialFile)
{
    var ps = new PowerShellExecutionService();
    var script = $@"
        $enc = Get-Content -Raw -Path '{credentialFile}'
        $ss = ConvertTo-SecureString -String $enc
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
        $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
        $credData = ConvertFrom-Json $json
        Write-Output $credData.ClientSecret
    ";

    var result = await ps.ExecuteScriptAsync(script);
    return result.Output?.FirstOrDefault() ?? string.Empty;
}
```

**guiv2/ Implementation:**
```typescript
// Electron main process
ipcMain.handle('profile:auto-import-target', async (event, companyName) => {
  const credDir = path.join('C:\\DiscoveryData', companyName, 'Credentials');
  const summaryPath = path.join(credDir, 'credential_summary.json');

  if (!fs.existsSync(summaryPath)) {
    return { success: false, error: 'No app registration found' };
  }

  const summary = JSON.parse(await fs.promises.readFile(summaryPath, 'utf8'));
  const credFile = path.join(credDir, 'discoverycredentials.config');

  // Decrypt credential using PowerShell
  const decryptScript = `
    $enc = Get-Content -Raw -Path '${credFile.replace(/'/g, "''")}'
    $ss = ConvertTo-SecureString -String $enc
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ss)
    $json = [Runtime.InteropServices.Marshal]::PtrToStringUni($bstr)
    $credData = ConvertFrom-Json $json
    Write-Output $credData.ClientSecret
  `;

  const psResult = await executePowerShell(decryptScript);
  const clientSecret = psResult.output.trim();

  // Create target profile
  const targetProfile = {
    id: crypto.randomUUID(),
    name: 'AppRegistration',
    tenantId: summary.TenantId,
    clientId: summary.ClientId,
    clientSecretEncrypted: await encryptCredential(clientSecret),
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isActive: true
  };

  // Save to target-profiles.json
  const targetProfilesPath = path.join(
    'C:\\DiscoveryData',
    companyName,
    'Configuration',
    'target-profiles.json'
  );

  let targetProfiles = [];
  if (fs.existsSync(targetProfilesPath)) {
    targetProfiles = JSON.parse(await fs.promises.readFile(targetProfilesPath, 'utf8'));
  }

  targetProfiles.push(targetProfile);
  await fs.promises.writeFile(
    targetProfilesPath,
    JSON.stringify(targetProfiles, null, 2),
    'utf8'
  );

  return { success: true, profile: targetProfile };
});
```

---

## Azure App Registration Workflow

### PowerShell Script Architecture

**Script Location:** `Scripts/DiscoveryCreateAppRegistration.ps1`

**Purpose:** Creates Azure AD app registration with comprehensive permissions for discovery

### Key Features

#### 1. Company Directory Setup
```powershell
function Initialize-CompanyDirectories {
    param([string]$CompanyName)

    $companyPath = "C:\DiscoveryData\$CompanyName"
    $directories = @(
        $companyPath,
        "$companyPath\Credentials",
        "$companyPath\Discovery",
        "$companyPath\Reports",
        "$companyPath\Logs",
        "$companyPath\Backups"
    )

    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force
            Write-Host "Created: $dir" -ForegroundColor Green
        }
    }

    return @{
        CompanyPath = $companyPath
        CredentialsPath = "$companyPath\Credentials\discoverycredentials.config"
        LogPath = "$companyPath\Logs\MandADiscovery_Registration_Log.txt"
    }
}
```

#### 2. Microsoft Graph Permissions
```powershell
$RequiredGraphPermissions = @{
    # Core directory permissions
    "Application.Read.All" = "Read all applications and service principals"
    "Directory.Read.All" = "Read directory data"
    "Group.Read.All" = "Read all groups"
    "User.Read.All" = "Read all user profiles"
    "Organization.Read.All" = "Read organization information"

    # Device and compliance
    "Device.Read.All" = "Read all device information"
    "DeviceManagementConfiguration.Read.All" = "Read device management configuration"
    "DeviceManagementManagedDevices.Read.All" = "Read managed devices in Intune"

    # Policy and governance
    "Policy.Read.All" = "Read policies including conditional access"
    "Reports.Read.All" = "Read reports for usage and security analytics"
    "RoleManagement.Read.All" = "Read role management data"

    # Exchange Online
    "Exchange.ManageAsApp" = "Manage Exchange Online as application"
    "Mail.Read" = "Read mail in all mailboxes"
    "MailboxSettings.Read" = "Read mailbox settings"

    # SharePoint and Teams
    "Sites.Read.All" = "Read SharePoint sites"
    "Sites.FullControl.All" = "Full control of SharePoint sites (migration)"
    "Files.Read.All" = "Read all files"
    "Team.ReadBasic.All" = "Read basic team information"
}

# Azure Resource Manager permissions
$RequiredAzurePermissions = @{
    "https://management.azure.com/user_impersonation" = "Azure Resource Manager access"
    "https://management.azure.com/.default" = "Default Azure RM scope"
    "https://vault.azure.net/.default" = "Key Vault data plane access"
    "https://storage.azure.com/.default" = "Azure Storage resource management"
}
```

#### 3. Credential Encryption
```powershell
function Save-EncryptedCredentials {
    param(
        [string]$ClientId,
        [string]$ClientSecret,
        [string]$TenantId,
        [string]$OutputPath
    )

    # Create credential object
    $credentialData = @{
        ClientId = $ClientId
        ClientSecret = $ClientSecret
        TenantId = $TenantId
        Created = (Get-Date).ToString('o')
    } | ConvertTo-Json -Compress

    # Encrypt using Windows DPAPI
    $credentialBytes = [Text.Encoding]::UTF8.GetBytes($credentialData)
    $entropy = [Text.Encoding]::UTF8.GetBytes('MandA-Discovery-Suite-2025')

    # Protect with CurrentUser scope
    $secureString = ConvertTo-SecureString -String $credentialData -AsPlainText -Force
    $encrypted = ConvertFrom-SecureString -SecureString $secureString

    # Save to file
    Set-Content -Path $OutputPath -Value $encrypted -Encoding UTF8

    # Also save summary in plain JSON
    $summaryPath = "$OutputPath.summary.json"
    @{
        TenantId = $TenantId
        ClientId = $ClientId
        CredentialFile = $OutputPath
        Created = (Get-Date).ToString('o')
    } | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath
}
```

### Integration with GUI/

**MainViewModel.cs - App Registration Workflow:**
```csharp
private void RunAppRegistrationAsync()
{
    var scriptPath = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory,
        "Scripts",
        "DiscoveryCreateAppRegistration.ps1"
    );

    var companyName = SelectedProfile?.CompanyName ?? "default";

    var startInfo = new ProcessStartInfo
    {
        FileName = "powershell.exe",
        Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" " +
                   $"-CompanyName \"{companyName}\"",
        UseShellExecute = true, // Opens in new window
        WorkingDirectory = Path.GetDirectoryName(scriptPath)
    };

    Process.Start(startInfo);
    MessageBox.Show("App Registration setup script has been launched in a new window.");
}
```

### guiv2/ Implementation

**UI Component:**
```tsx
// ProfileSetupDialog.tsx
const handleSetupAppRegistration = async () => {
  setIsExecuting(true);

  try {
    // Launch PowerShell script in separate window
    const result = await window.electronAPI.executeAppRegistration({
      companyName: selectedProfile.companyName,
      showWindow: true
    });

    if (result.success) {
      showNotification({
        type: 'success',
        message: 'App registration setup launched. Please complete the setup in the PowerShell window.'
      });

      // Poll for credential files
      const pollInterval = setInterval(async () => {
        const importResult = await window.electronAPI.autoImportTargetProfile(
          selectedProfile.companyName
        );

        if (importResult.success) {
          clearInterval(pollInterval);
          showNotification({
            type: 'success',
            message: 'App registration credentials imported successfully!'
          });
          await refreshProfiles();
        }
      }, 5000); // Check every 5 seconds

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 300000);
    }
  } catch (error) {
    showNotification({
      type: 'error',
      message: `Failed to launch app registration: ${error.message}`
    });
  } finally {
    setIsExecuting(false);
  }
};
```

**Electron IPC Handler:**
```typescript
// ipcHandlers.ts
ipcMain.handle('profile:execute-app-registration', async (event, options) => {
  const scriptPath = path.join(
    app.getAppPath(),
    'resources',
    'Scripts',
    'DiscoveryCreateAppRegistration.ps1'
  );

  if (!fs.existsSync(scriptPath)) {
    return {
      success: false,
      error: 'App registration script not found'
    };
  }

  const args = [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', `"${scriptPath}"`,
    '-CompanyName', `"${options.companyName}"`
  ];

  if (options.showWindow) {
    // Launch in new window (user-interactive)
    const { spawn } = require('child_process');
    spawn('powershell.exe', args, {
      detached: true,
      shell: true,
      stdio: 'ignore'
    }).unref();

    return { success: true, message: 'Script launched in separate window' };
  } else {
    // Execute and capture output
    const { execFile } = require('child_process');
    return new Promise((resolve) => {
      execFile('powershell.exe', args, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stderr });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  }
});
```

---

## Environment Detection (T-000) Implementation

### Service Architecture (GUI/Services/EnvironmentDetectionService.cs)

**Purpose:** Automatically detect if an environment is On-Premises, Azure AD, or Hybrid

### Detection Logic

```csharp
public async Task<EnvironmentDetectionResult> DetectEnvironmentAsync(CompanyProfile profile)
{
    var result = new EnvironmentDetectionResult
    {
        DetectionSource = "Discovery Data Analysis",
        PrimaryDomain = profile.CompanyName
    };

    // Analyze CSV files in C:\DiscoveryData\{CompanyName}\Raw\
    var dataPath = $"C:\\DiscoveryData\\{profile.CompanyName}\\Raw";
    if (!Directory.Exists(dataPath))
    {
        result.DisplayStatus = "No Discovery Data";
        result.Notes = "Run discovery first to detect environment";
        return result;
    }

    await AnalyzeDiscoveryFilesAsync(dataPath, result);
    DetermineEnvironmentType(result);

    return result;
}

private async Task AnalyzeDiscoveryFilesAsync(string dataPath, EnvironmentDetectionResult result)
{
    var csvFiles = Directory.GetFiles(dataPath, "*.csv");

    foreach (var csvFile in csvFiles)
    {
        var fileName = Path.GetFileNameWithoutExtension(csvFile).ToLowerInvariant();

        // Detect services based on file names
        if (fileName.Contains("azuread") || fileName.Contains("aad"))
        {
            result.HasAzureAD = true;
            result.CloudServices.Add("Azure AD");
        }
        else if (fileName.Contains("activedirectory") || fileName.Contains("ad"))
        {
            result.HasActiveDirectory = true;
            result.OnPremServices.Add("Active Directory");
        }
        else if (fileName.Contains("exchange") && fileName.Contains("online"))
        {
            result.HasExchangeOnline = true;
            result.CloudServices.Add("Exchange Online");
        }
        else if (fileName.Contains("exchange"))
        {
            result.HasExchangeOnPremises = true;
            result.OnPremServices.Add("Exchange Server");
        }
        else if (fileName.Contains("sharepoint") && fileName.Contains("online"))
        {
            result.HasSharePointOnline = true;
            result.CloudServices.Add("SharePoint Online");
        }
        else if (fileName.Contains("sharepoint"))
        {
            result.HasSharePointOnPremises = true;
            result.OnPremServices.Add("SharePoint Server");
        }
        else if (fileName.Contains("teams"))
        {
            result.HasTeams = true;
            result.CloudServices.Add("Microsoft Teams");
        }
    }
}

private void DetermineEnvironmentType(EnvironmentDetectionResult result)
{
    var hasCloud = result.HasAzureAD || result.HasExchangeOnline ||
                  result.HasSharePointOnline || result.HasTeams;
    var hasOnPrem = result.HasActiveDirectory || result.HasExchangeOnPremises ||
                    result.HasSharePointOnPremises;

    if (hasCloud && hasOnPrem)
    {
        result.EnvironmentType = EnvironmentType.Hybrid;
        result.DisplayStatus = "Hybrid (On-Premises + Cloud)";
    }
    else if (hasCloud)
    {
        result.EnvironmentType = EnvironmentType.Azure;
        result.DisplayStatus = "Azure / Microsoft 365";
    }
    else if (hasOnPrem)
    {
        result.EnvironmentType = EnvironmentType.OnPremises;
        result.DisplayStatus = "On-Premises";
    }
    else
    {
        result.EnvironmentType = EnvironmentType.Unknown;
        result.DisplayStatus = "Environment Unknown";
    }
}
```

### Environment Detection Result Model

```csharp
public class EnvironmentDetectionResult
{
    public EnvironmentType EnvironmentType { get; set; } = EnvironmentType.Unknown;
    public string DisplayStatus { get; set; } = "Unknown";
    public string DetectionSource { get; set; }
    public string PrimaryDomain { get; set; }
    public string Notes { get; set; }

    // Service Detection Flags
    public bool HasAzureAD { get; set; }
    public bool HasActiveDirectory { get; set; }
    public bool HasExchangeOnline { get; set; }
    public bool HasExchangeOnPremises { get; set; }
    public bool HasSharePointOnline { get; set; }
    public bool HasSharePointOnPremises { get; set; }
    public bool HasTeams { get; set; }
    public bool HasOffice365 { get; set; }

    public string[] CloudServices { get; set; } = Array.Empty<string>();
    public string[] OnPremServices { get; set; } = Array.Empty<string>();

    public string GetEnvironmentDescription()
    {
        var services = new List<string>();
        if (CloudServices.Any()) services.Add($"Cloud: {string.Join(", ", CloudServices)}");
        if (OnPremServices.Any()) services.Add($"On-Prem: {string.Join(", ", OnPremServices)}");
        return services.Any() ? string.Join(" | ", services) : "No services detected";
    }
}

public enum EnvironmentType
{
    Unknown,
    OnPremises,
    Azure,
    Hybrid
}
```

### guiv2/ Implementation

**TypeScript Types:**
```typescript
export interface EnvironmentDetectionResult {
  environmentType: 'Unknown' | 'OnPremises' | 'Azure' | 'Hybrid';
  displayStatus: string;
  detectionSource?: string;
  primaryDomain?: string;
  notes?: string;

  // Service Detection Flags
  hasAzureAD?: boolean;
  hasActiveDirectory?: boolean;
  hasExchangeOnline?: boolean;
  hasExchangeOnPremises?: boolean;
  hasSharePointOnline?: boolean;
  hasSharePointOnPremises?: boolean;
  hasTeams?: boolean;
  hasOffice365?: boolean;

  cloudServices?: string[];
  onPremServices?: string[];
}
```

**Electron Service:**
```typescript
// environmentDetectionService.ts (main process)
export async function detectEnvironment(
  companyName: string
): Promise<EnvironmentDetectionResult> {
  const dataPath = path.join('C:\\DiscoveryData', companyName, 'Raw');

  const result: EnvironmentDetectionResult = {
    environmentType: 'Unknown',
    displayStatus: 'Unknown',
    detectionSource: 'Discovery Data Analysis',
    primaryDomain: companyName,
    cloudServices: [],
    onPremServices: []
  };

  if (!fs.existsSync(dataPath)) {
    result.displayStatus = 'No Discovery Data';
    result.notes = 'Run discovery first to detect environment';
    return result;
  }

  const csvFiles = await fs.promises.readdir(dataPath);

  for (const file of csvFiles) {
    if (!file.endsWith('.csv')) continue;

    const fileName = file.toLowerCase();

    if (fileName.includes('azuread') || fileName.includes('aad')) {
      result.hasAzureAD = true;
      result.cloudServices!.push('Azure AD');
    } else if (fileName.includes('activedirectory') || fileName.includes('ad')) {
      result.hasActiveDirectory = true;
      result.onPremServices!.push('Active Directory');
    } else if (fileName.includes('exchange') && fileName.includes('online')) {
      result.hasExchangeOnline = true;
      result.cloudServices!.push('Exchange Online');
    } else if (fileName.includes('exchange')) {
      result.hasExchangeOnPremises = true;
      result.onPremServices!.push('Exchange Server');
    } else if (fileName.includes('sharepoint') && fileName.includes('online')) {
      result.hasSharePointOnline = true;
      result.cloudServices!.push('SharePoint Online');
    } else if (fileName.includes('sharepoint')) {
      result.hasSharePointOnPremises = true;
      result.onPremServices!.push('SharePoint Server');
    } else if (fileName.includes('teams')) {
      result.hasTeams = true;
      result.cloudServices!.push('Microsoft Teams');
    }
  }

  // Determine environment type
  const hasCloud = result.hasAzureAD || result.hasExchangeOnline ||
                  result.hasSharePointOnline || result.hasTeams;
  const hasOnPrem = result.hasActiveDirectory || result.hasExchangeOnPremises ||
                   result.hasSharePointOnPremises;

  if (hasCloud && hasOnPrem) {
    result.environmentType = 'Hybrid';
    result.displayStatus = 'Hybrid (On-Premises + Cloud)';
  } else if (hasCloud) {
    result.environmentType = 'Azure';
    result.displayStatus = 'Azure / Microsoft 365';
  } else if (hasOnPrem) {
    result.environmentType = 'OnPremises';
    result.displayStatus = 'On-Premises';
  } else {
    result.environmentType = 'Unknown';
    result.displayStatus = 'Environment Unknown';
  }

  return result;
}

// IPC Handler
ipcMain.handle('profile:detect-environment', async (event, companyName) => {
  return await detectEnvironment(companyName);
});
```

**React Hook:**
```typescript
// useEnvironmentDetection.ts
export const useEnvironmentDetection = (companyName?: string) => {
  const [result, setResult] = useState<EnvironmentDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const detect = useCallback(async () => {
    if (!companyName) return;

    setIsDetecting(true);
    try {
      const detection = await window.electronAPI.detectEnvironment(companyName);
      setResult(detection);
    } catch (error) {
      console.error('Environment detection failed:', error);
      setResult({
        environmentType: 'Unknown',
        displayStatus: 'Detection Failed',
        notes: error.message
      });
    } finally {
      setIsDetecting(false);
    }
  }, [companyName]);

  useEffect(() => {
    if (companyName) {
      detect();
    }
  }, [companyName, detect]);

  return { result, isDetecting, detect };
};
```

---

## Profile Persistence and Session Management

### Persistence Strategy (GUI/)

#### 1. Application-Level Storage
**Location:** `%AppData%\MandADiscoverySuite\profiles.json`

**Structure:**
```json
[
  {
    "Id": "550e8400-e29b-41d4-a716-446655440000",
    "CompanyName": "Acme Corporation",
    "Description": "Primary source environment",
    "DomainController": "dc.acme.com",
    "TenantId": "12345678-1234-1234-1234-123456789abc",
    "IsActive": true,
    "Created": "2025-01-15T10:30:00Z",
    "LastModified": "2025-01-20T14:22:00Z",
    "RecordCount": 1250,
    "LastDiscovery": "2025-01-20T14:00:00Z",
    "Configuration": {
      "AutoRefresh": true,
      "RefreshInterval": 3600
    }
  }
]
```

#### 2. Company-Level Storage
**Location:** `C:\DiscoveryData\{CompanyName}\Configuration\target-profiles.json`

**Structure:**
```json
[
  {
    "Id": "660e8400-e29b-41d4-a716-446655440111",
    "Name": "Azure Target Tenant",
    "TenantId": "98765432-4321-4321-4321-210987654321",
    "ClientId": "11111111-2222-3333-4444-555555555555",
    "ClientSecretEncrypted": "AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAA...",
    "Environment": "Azure",
    "Domain": "target.onmicrosoft.com",
    "Scopes": ["User.Read.All", "Group.Read.All"],
    "IsActive": true,
    "Created": "2025-01-18T09:15:00Z",
    "LastModified": "2025-01-18T09:15:00Z"
  }
]
```

#### 3. Session Restoration
**Location:** `%AppData%\MandADiscoverySuite\session.json`

**Structure:**
```json
{
  "LastActiveSourceProfileId": "550e8400-e29b-41d4-a716-446655440000",
  "LastActiveTargetProfileId": "660e8400-e29b-41d4-a716-446655440111",
  "LastSelectedView": "UsersView",
  "WindowState": {
    "Width": 1920,
    "Height": 1080,
    "IsMaximized": true
  },
  "SavedFilters": {
    "UsersView": {
      "searchText": "",
      "departmentFilter": "All"
    }
  },
  "LastSaved": "2025-01-20T16:30:00Z"
}
```

### Session Restoration Pattern (GUI/MainViewModel.cs)

```csharp
private async Task RestoreSessionAsync()
{
    var sessionPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "MandADiscoverySuite",
        "session.json"
    );

    if (!File.Exists(sessionPath))
        return;

    try
    {
        var sessionJson = await File.ReadAllTextAsync(sessionPath);
        var session = JsonSerializer.Deserialize<SessionState>(sessionJson);

        // Restore source profile
        if (!string.IsNullOrWhiteSpace(session.LastActiveSourceProfileId))
        {
            var profile = await _profileService.GetProfileAsync(session.LastActiveSourceProfileId);
            if (profile != null)
            {
                SelectedProfile = profile;
                await LoadProfileDataAsync(profile); // Trigger LogicEngine reload
            }
        }

        // Restore target profile
        if (!string.IsNullOrWhiteSpace(session.LastActiveTargetProfileId))
        {
            var targetProfile = await _targetProfileService.GetActiveProfileAsync(
                SelectedProfile?.CompanyName ?? "default"
            );
            if (targetProfile != null)
            {
                SelectedTargetProfile = targetProfile;
            }
        }

        // Restore UI state
        if (session.WindowState != null)
        {
            Application.Current.MainWindow.Width = session.WindowState.Width;
            Application.Current.MainWindow.Height = session.WindowState.Height;
            Application.Current.MainWindow.WindowState = session.WindowState.IsMaximized
                ? WindowState.Maximized
                : WindowState.Normal;
        }
    }
    catch (Exception ex)
    {
        _logger.LogWarning($"Failed to restore session: {ex.Message}");
    }
}

private async Task SaveSessionAsync()
{
    var sessionPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "MandADiscoverySuite",
        "session.json"
    );

    var session = new SessionState
    {
        LastActiveSourceProfileId = SelectedProfile?.Id,
        LastActiveTargetProfileId = SelectedTargetProfile?.Id,
        LastSelectedView = CurrentView?.GetType().Name,
        WindowState = new WindowStateInfo
        {
            Width = (int)Application.Current.MainWindow.Width,
            Height = (int)Application.Current.MainWindow.Height,
            IsMaximized = Application.Current.MainWindow.WindowState == WindowState.Maximized
        },
        LastSaved = DateTime.UtcNow
    };

    var sessionJson = JsonSerializer.Serialize(session, new JsonSerializerOptions
    {
        WriteIndented = true
    });

    await File.WriteAllTextAsync(sessionPath, sessionJson);
}

// Auto-save on window closing
protected override void OnClosing(CancelEventArgs e)
{
    SaveSessionAsync().Wait();
    base.OnClosing(e);
}
```

### guiv2/ Implementation

**Session Store:**
```typescript
// sessionStore.ts
interface SessionState {
  lastActiveSourceProfileId?: string;
  lastActiveTargetProfileId?: string;
  lastSelectedView?: string;
  windowState?: {
    width: number;
    height: number;
    isMaximized: boolean;
  };
  savedFilters?: Record<string, any>;
  lastSaved?: string;
}

export const useSessionStore = create<{
  session: SessionState;
  saveSession: () => Promise<void>;
  restoreSession: () => Promise<void>;
}>((set, get) => ({
  session: {},

  saveSession: async () => {
    const state = get().session;
    await window.electronAPI.saveSession(state);
  },

  restoreSession: async () => {
    const session = await window.electronAPI.loadSession();
    set({ session });

    // Restore profiles
    if (session.lastActiveSourceProfileId) {
      const profileStore = useProfileStore.getState();
      await profileStore.loadSourceProfiles();
      const profile = profileStore.sourceProfiles.find(
        p => p.id === session.lastActiveSourceProfileId
      );
      if (profile) {
        await profileStore.setSelectedSourceProfile(profile);
      }
    }

    // Restore target profile
    if (session.lastActiveTargetProfileId) {
      const profileStore = useProfileStore.getState();
      await profileStore.loadTargetProfiles();
      const targetProfile = profileStore.targetProfiles.find(
        p => p.id === session.lastActiveTargetProfileId
      );
      if (targetProfile) {
        await profileStore.setSelectedTargetProfile(targetProfile);
      }
    }
  }
}));

// App.tsx - Restore on mount
useEffect(() => {
  const sessionStore = useSessionStore.getState();
  sessionStore.restoreSession();
}, []);

// App.tsx - Save on unmount
useEffect(() => {
  return () => {
    const sessionStore = useSessionStore.getState();
    sessionStore.saveSession();
  };
}, []);
```

**Electron IPC Handlers:**
```typescript
// sessionHandlers.ts
const sessionPath = path.join(
  app.getPath('appData'),
  'MandADiscoverySuite',
  'session.json'
);

ipcMain.handle('session:save', async (event, sessionState) => {
  await fs.promises.mkdir(path.dirname(sessionPath), { recursive: true });
  await fs.promises.writeFile(
    sessionPath,
    JSON.stringify(sessionState, null, 2),
    'utf8'
  );
  return { success: true };
});

ipcMain.handle('session:load', async () => {
  if (!fs.existsSync(sessionPath)) {
    return {};
  }

  const json = await fs.promises.readFile(sessionPath, 'utf8');
  return JSON.parse(json);
});
```

---

## PowerShell Script Execution Patterns

### GUI/ Pattern

**PowerShellExecutionService.cs:**
```csharp
public class PowerShellExecutionService
{
    public async Task<PowerShellResult> ExecuteScriptAsync(string script)
    {
        using var powerShell = PowerShell.Create();
        powerShell.AddScript(script);

        var output = new List<string>();
        var errors = new List<string>();

        powerShell.Streams.Information.DataAdded += (sender, args) =>
        {
            var data = ((PSDataCollection<InformationRecord>)sender)[args.Index];
            output.Add(data.MessageData.ToString());
        };

        powerShell.Streams.Error.DataAdded += (sender, args) =>
        {
            var error = ((PSDataCollection<ErrorRecord>)sender)[args.Index];
            errors.Add(error.Exception.Message);
        };

        var results = await powerShell.InvokeAsync();

        return new PowerShellResult
        {
            Output = output,
            Errors = errors,
            Success = !errors.Any(),
            ExitCode = errors.Any() ? 1 : 0
        };
    }
}
```

**Module Execution Pattern (MainViewModel.cs):**
```csharp
private async Task ExecuteDiscoveryModuleAsync(string modulePath, Dictionary<string, object> parameters)
{
    var ps = new PowerShellExecutionService();
    var parameterString = string.Join(" ", parameters.Select(
        kvp => $"-{kvp.Key} '{kvp.Value}'"
    ));

    var script = $@"
        Import-Module '{modulePath}' -Force
        $params = @{{{string.Join("; ", parameters.Select(kvp => $"{kvp.Key}='{kvp.Value}'"))}}}
        & '{Path.GetFileNameWithoutExtension(modulePath)}' @params
    ";

    var result = await ps.ExecuteScriptAsync(script);

    if (result.Success)
    {
        await LoadDiscoveryResultsAsync();
    }
    else
    {
        MessageBox.Show($"Discovery failed: {string.Join(", ", result.Errors)}");
    }
}
```

### guiv2/ Implementation

**PowerShell Service (Electron Main Process):**
```typescript
// powerShellService.ts
import { exec, spawn } from 'child_process';
import * as path from 'path';

export interface PowerShellResult {
  success: boolean;
  output: string[];
  errors: string[];
  exitCode: number;
}

export async function executePowerShellScript(
  script: string,
  options?: {
    captureOutput?: boolean;
    showWindow?: boolean;
  }
): Promise<PowerShellResult> {
  return new Promise((resolve) => {
    const args = [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-Command', script
    ];

    if (options?.showWindow) {
      // Launch in separate window
      spawn('powershell.exe', args, {
        detached: true,
        shell: true,
        stdio: 'ignore'
      }).unref();

      resolve({
        success: true,
        output: ['Script launched in separate window'],
        errors: [],
        exitCode: 0
      });
    } else {
      // Capture output
      exec(`powershell.exe ${args.join(' ')}`, (error, stdout, stderr) => {
        const output = stdout.split('\n').filter(line => line.trim());
        const errors = stderr.split('\n').filter(line => line.trim());

        resolve({
          success: !error,
          output,
          errors,
          exitCode: error ? error.code || 1 : 0
        });
      });
    }
  });
}

export async function executeDiscoveryModule(
  modulePath: string,
  parameters: Record<string, any>
): Promise<PowerShellResult> {
  const paramString = Object.entries(parameters)
    .map(([key, value]) => `-${key} '${value}'`)
    .join(' ');

  const script = `
    Import-Module '${modulePath.replace(/'/g, "''")}' -Force
    & '${path.basename(modulePath, '.psm1')}' ${paramString}
  `;

  return await executePowerShellScript(script, { captureOutput: true });
}
```

**IPC Handler:**
```typescript
ipcMain.handle('powershell:execute-module', async (event, options) => {
  const result = await executeDiscoveryModule(
    options.modulePath,
    options.parameters
  );

  return result;
});
```

---

## Implementation Roadmap for guiv2/

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Credential Encryption Service
- Implement Electron safeStorage wrapper
- Create encryption/decryption utilities
- Add fallback to PowerShell DPAPI for legacy compatibility

**Files to Create:**
- `guiv2/src/main/services/credentialEncryptionService.ts`
- `guiv2/src/renderer/lib/credentialUtils.ts`

#### 1.2 PowerShell Execution Service
- Implement PowerShell script execution from Electron
- Add streaming output support
- Create module execution helpers

**Files to Create:**
- `guiv2/src/main/services/powerShellService.ts`
- `guiv2/src/main/ipc/powerShellHandlers.ts`

#### 1.3 File System Service
- Implement directory creation/validation
- Add file watching for credential imports
- Create session persistence helpers

**Files to Update:**
- `guiv2/src/main/services/fileSystemService.ts` (enhance existing)

### Phase 2: Profile Management (Week 3-4)

#### 2.1 Enhanced CompanyProfile
- Add missing properties (recordCount, locations, etc.)
- Implement profile statistics tracking
- Add validation logic

**Files to Update:**
- `guiv2/src/renderer/store/useProfileStore.ts`
- `guiv2/src/shared/types/profile.ts`

#### 2.2 TargetProfile Implementation
- Create TargetProfile model
- Implement TargetProfileService
- Add CRUD operations for target profiles

**Files to Create:**
- `guiv2/src/main/services/targetProfileService.ts`
- `guiv2/src/main/ipc/targetProfileHandlers.ts`
- `guiv2/src/renderer/hooks/useTargetProfiles.ts`

#### 2.3 Session Management
- Implement session save/restore
- Add profile activation tracking
- Create window state persistence

**Files to Create:**
- `guiv2/src/main/services/sessionService.ts`
- `guiv2/src/renderer/store/useSessionStore.ts`

### Phase 3: Azure Integration (Week 5-6)

#### 3.1 App Registration Workflow
- Integrate DiscoveryCreateAppRegistration.ps1
- Implement credential file polling
- Add auto-import functionality

**Files to Create:**
- `guiv2/src/main/services/appRegistrationService.ts`
- `guiv2/src/renderer/components/dialogs/AppRegistrationDialog.tsx`
- `guiv2/src/renderer/hooks/useAppRegistration.ts`

#### 3.2 Environment Detection (T-000)
- Implement environment detection service
- Add CSV file analysis
- Create detection result UI components

**Files to Create:**
- `guiv2/src/main/services/environmentDetectionService.ts`
- `guiv2/src/renderer/components/molecules/EnvironmentBadge.tsx`
- `guiv2/src/renderer/hooks/useEnvironmentDetection.ts`

### Phase 4: UI Components (Week 7-8)

#### 4.1 Profile Management UI
- Create CreateProfileDialog
- Build ProfileSettingsDialog
- Add TargetProfileManager component

**Files to Create:**
- `guiv2/src/renderer/components/dialogs/CreateProfileDialog.tsx`
- `guiv2/src/renderer/components/dialogs/ProfileSettingsDialog.tsx`
- `guiv2/src/renderer/components/organisms/TargetProfileManager.tsx`

#### 4.2 Migration Planning UI
- Create MigrationMappingView
- Build source-to-target selector
- Add migration wave management

**Files to Update:**
- `guiv2/src/renderer/views/migration/MigrationPlanningView.tsx`
- `guiv2/src/renderer/views/migration/MigrationMappingView.tsx`

### Phase 5: Testing and Validation (Week 9-10)

#### 5.1 Integration Tests
- Test profile CRUD operations
- Validate encryption/decryption
- Test PowerShell execution

**Files to Create:**
- `guiv2/test/integration/profileManagement.test.ts`
- `guiv2/test/integration/credentialEncryption.test.ts`

#### 5.2 End-to-End Tests
- Test complete app registration workflow
- Validate environment detection
- Test session restoration

**Files to Create:**
- `guiv2/test/e2e/appRegistration.spec.ts`
- `guiv2/test/e2e/environmentDetection.spec.ts`

---

## Critical Implementation Notes

### 1. Maintain File Path Compatibility
- **MUST** use `C:\DiscoveryData\{CompanyName}\` structure
- **MUST** maintain exact subdirectory names (Raw, Logs, Credentials, etc.)
- Ensures CSV files can be shared between GUI/ and guiv2/

### 2. Credential Security
- **NEVER** store credentials in plain text
- **ALWAYS** use Electron safeStorage or DPAPI
- **ALWAYS** encrypt before persisting to disk

### 3. Session Persistence
- Save session state on window close
- Restore profiles on application startup
- Handle missing profiles gracefully

### 4. PowerShell Integration
- Use `-NoProfile` to avoid user profile interference
- Use `-ExecutionPolicy Bypass` for script execution
- Always escape single quotes in parameters

### 5. Error Handling
- Validate all file paths before operations
- Handle missing credential files gracefully
- Provide clear error messages to users

---

## Conclusion

This architecture documentation provides a complete reference for implementing profile management in guiv2/. The key differences from the gap analysis:

1. **CompanyProfile**: Mostly implemented, needs statistics and validation
2. **TargetProfile**: Completely missing, requires full implementation
3. **Azure App Registration**: Missing integration with PowerShell scripts
4. **Environment Detection**: Missing service and UI components
5. **Credential Encryption**: Missing secure storage implementation

Follow the implementation roadmap phase-by-phase to achieve full feature parity with GUI/. Each phase builds on the previous one, ensuring a solid foundation before adding complex features.

**Estimated Total Effort:** 10 weeks (400-480 hours) for complete implementation and testing.
