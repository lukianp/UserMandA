#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Quick Start Menu
.DESCRIPTION
    Provides a user-friendly interface to run the M&A Discovery Suite with improved
    credential management, status indicators, and optimized module checking.
.NOTES
    Version: 5.0.0
    Author: Enhanced Version
    Date: 2025-06-02
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName, # Optional here, can be prompted in menu

    [Parameter(Mandatory=$false)]
    [string]$ConfigFile,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipModuleCheck,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Script-level variables
$script:LastModuleCheck = $null
$script:ModulesVerified = $false
$script:ConnectionStatus = @{
    Credentials = $false
    AzureAD = $false
    Exchange = $false
    SharePoint = $false
    Teams = $false
}

#region Helper Functions

function Write-ColoredLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [switch]$NoNewLine
    )
    
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "White" }
        "DEBUG" { "Gray" }
        "HEADER" { "Cyan" }
        default { "White" }
    }
    
    $params = @{
        Object = $Message
        ForegroundColor = $color
        NoNewline = $NoNewLine
    }
    
    Write-Host @params
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Initialize-Environment {
    # Prompt for CompanyName if not provided
    if ([string]::IsNullOrWhiteSpace($CompanyName)) {
        Write-Host "Please enter the Company Name for this session (e.g., Contoso, Fabrikam):" -ForegroundColor Yellow
        $script:CompanyName = Read-Host
        if ([string]::IsNullOrWhiteSpace($script:CompanyName)) {
            Write-Error "CompanyName cannot be empty. Exiting."
            exit 1
        }
    } else {
        $script:CompanyName = $CompanyName
    }

    # Define suite root
    $suiteRoot = $PSScriptRoot
    
    # Set environment script path
    $envSetupScriptPath = Join-Path $suiteRoot "Scripts\Set-SuiteEnvironment.ps1"

    if (Test-Path $envSetupScriptPath) {
        Write-Host "Sourcing environment for Company: $($script:CompanyName)" -ForegroundColor Cyan
        # Pass the CompanyName to Set-SuiteEnvironment.ps1
        . $envSetupScriptPath -ProvidedSuiteRoot $suiteRoot -CompanyName $script:CompanyName
    } else {
        Write-Error "CRITICAL: Set-SuiteEnvironment.ps1 not found at '$envSetupScriptPath'."
        exit 1
    }
}

function Update-ConnectionStatus {
    # Check credentials file
    $script:ConnectionStatus.Credentials = Test-Path $global:MandA.Paths.CredentialFile
    
    # Check Azure AD / Graph
    $script:ConnectionStatus.AzureAD = $null -ne (Get-MgContext -ErrorAction SilentlyContinue)
    
    # Check Exchange
    $script:ConnectionStatus.Exchange = $null -ne (Get-PSSession | Where-Object {
        $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened"
    })
    
    # Check SharePoint
    $script:ConnectionStatus.SharePoint = $null -ne (Get-Command Get-SPOSite -ErrorAction SilentlyContinue)
    
    # Check Teams
    $script:ConnectionStatus.Teams = $null -ne (Get-Command Get-Team -ErrorAction SilentlyContinue)
}

function Should-CheckModules {
    param([string]$Operation)
    
    # Skip if explicitly requested
    if ($SkipModuleCheck) { return $false }
    
    # Always check for first run
    if (-not $script:ModulesVerified) { return $true }
    
    # Check if it's been more than 1 hour since last check
    if ($script:LastModuleCheck) {
        $timeSinceCheck = (Get-Date) - $script:LastModuleCheck
        if ($timeSinceCheck.TotalHours -gt 1) { return $true }
    }
    
    # For different operations, decide if check is needed
    switch ($Operation) {
        "Full" { return $false }
        "Discovery" { return $false }
        "Processing" { return $false }
        "Export" { return $false }
        "Utilities" { return $true }
        default { return $false }
    }
}

#endregion

#region Menu Display Functions

function Show-MainMenu {
    param(
        [switch]$FirstRun
    )
    
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           M&A DISCOVERY SUITE - MAIN MENU v5.0                       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    # Update and show connection status
    Update-ConnectionStatus
    Show-ConnectionStatus
    
    Write-Host "`n  INITIAL SETUP (Run Once)" -ForegroundColor Yellow
    Write-Host "  ========================" -ForegroundColor Yellow
    Write-Host "  [1] Setup Azure AD App Registration (once only)"
    Write-Host "  [2] Configure Credentials for Authentication"
    
    Write-Host "`n  DISCOVERY OPERATIONS" -ForegroundColor Green
    Write-Host "  ====================" -ForegroundColor Green
    Write-Host "  [3] Run FULL Discovery Suite (Discovery + Processing + Export)"
    Write-Host "  [4] Run Discovery Phase Only"
    Write-Host "  [5] Run Processing Phase Only (requires existing discovery data)"
    Write-Host "  [6] Run Export Phase Only (requires processed data)"
    
    Write-Host "`n  UTILITIES & MAINTENANCE" -ForegroundColor Magenta
    Write-Host "  =======================" -ForegroundColor Magenta
    Write-Host "  [7] Update/Replace Stored Credentials"
    Write-Host "  [8] Verify Module Dependencies"
    Write-Host "  [9] Test Service Connections"
    Write-Host "  [10] View Configuration Settings"
    Write-Host "  [11] Clear Existing Data Files"
    Write-Host "  [12] Generate Sample Report"
    
    Write-Host "`n  [Q] Quit" -ForegroundColor Red
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    if ($FirstRun -or -not $script:ConnectionStatus.Credentials) {
        Write-Host "`n  📌 FIRST TIME?" -ForegroundColor Yellow
        Write-Host "     Start with option [1] to setup your Azure AD App" -ForegroundColor Yellow
        Write-Host "     Then use option [2] to configure credentials" -ForegroundColor Yellow
    }
    
    Write-Host "`n  Enter your selection: " -ForegroundColor White -NoNewline
}

function Show-ConnectionStatus {
    Write-Host "`n  Status: " -NoNewline
    
    # Credentials
    Write-Host "Credentials " -NoNewline
    if ($script:ConnectionStatus.Credentials) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Azure AD
    Write-Host " | Azure AD " -NoNewline
    if ($script:ConnectionStatus.AzureAD) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Exchange
    Write-Host " | Exchange " -NoNewline
    if ($script:ConnectionStatus.Exchange) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # SharePoint
    Write-Host " | SharePoint " -NoNewline
    if ($script:ConnectionStatus.SharePoint) {
        Write-Host "✓" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "✗" -ForegroundColor Red -NoNewline
    }
    
    # Teams
    Write-Host " | Teams " -NoNewline
    if ($script:ConnectionStatus.Teams) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
    }
    
    if ($script:LastModuleCheck) {
        Write-Host "  Last module check: $($script:LastModuleCheck.ToString('HH:mm:ss'))" -ForegroundColor Gray
    }
}

#endregion

#region Credential Management Functions

function Show-CredentialSetupMenu {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              CONFIGURE AUTHENTICATION CREDENTIALS                     ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📋 WHAT YOU'LL NEED:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    
    Write-Host "`n1️⃣  Application (Client) ID" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > App Registrations > Your App > Overview" -ForegroundColor Gray
    Write-Host "   • Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (GUID)" -ForegroundColor Gray
    Write-Host "   • Example: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" -ForegroundColor DarkGray
    
    Write-Host "`n2️⃣  Tenant ID" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > Azure Active Directory > Overview" -ForegroundColor Gray
    Write-Host "   • Format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX (GUID)" -ForegroundColor Gray
    Write-Host "   • Example: 9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k" -ForegroundColor DarkGray
    
    Write-Host "`n3️⃣  Client Secret" -ForegroundColor Green
    Write-Host "   • Found in: Azure Portal > App Registrations > Your App > Certificates & Secrets" -ForegroundColor Gray
    Write-Host "   • ⚠️  Only visible when first created - copy immediately!" -ForegroundColor Yellow
    Write-Host "   • Format: Random string of characters" -ForegroundColor Gray
    Write-Host "   • Example: xWw8Q~1AbCdEfGhIjKlMnOpQrStUvWxYz" -ForegroundColor DarkGray
    
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "`n🔒 Your credentials will be encrypted and stored locally at:" -ForegroundColor Cyan
    Write-Host "   $($global:MandA.Paths.CredentialFile)" -ForegroundColor White
    
    Write-Host "`n⚡ Ready to continue? (Y/N): " -ForegroundColor Green -NoNewline
    $continue = Read-Host
    
    if ($continue -eq 'Y' -or $continue -eq 'y') {
        Set-CredentialConfiguration
    } else {
        Write-Host "`nReturning to main menu..." -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

function Set-CredentialConfiguration {
    Write-Host "`n📝 ENTER YOUR CREDENTIALS" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    # Application ID
    do {
        Write-Host "`n1. Application (Client) ID: " -ForegroundColor Cyan -NoNewline
        $appId = Read-Host
        
        if ($appId -match '^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$') {
            Write-Host "   ✓ Valid GUID format" -ForegroundColor Green
            $validAppId = $true
        } else {
            Write-Host "   ✗ Invalid format. Please enter a valid GUID." -ForegroundColor Red
            Write-Host "   Example: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" -ForegroundColor Yellow
            $validAppId = $false
        }
    } while (-not $validAppId)
    
    # Tenant ID
    do {
        Write-Host "`n2. Tenant ID: " -ForegroundColor Cyan -NoNewline
        $tenantId = Read-Host
        
        if ($tenantId -match '^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$') {
            Write-Host "   ✓ Valid GUID format" -ForegroundColor Green
            $validTenantId = $true
        } else {
            Write-Host "   ✗ Invalid format. Please enter a valid GUID." -ForegroundColor Red
            Write-Host "   Example: 9z8y7x6w-5v4u-3t2s-1r0q-9p8o7n6m5l4k" -ForegroundColor Yellow
            $validTenantId = $false
        }
    } while (-not $validTenantId)
    
    # Client Secret
    Write-Host "`n3. Client Secret: " -ForegroundColor Cyan -NoNewline
    $clientSecret = Read-Host -AsSecureString
    Write-Host "   ✓ Secret captured (hidden for security)" -ForegroundColor Green
    
    # Show summary
    Write-Host "`n📊 SUMMARY" -ForegroundColor Yellow
    Write-Host "==========" -ForegroundColor Yellow
    Write-Host "App ID:    $appId" -ForegroundColor White
    Write-Host "Tenant ID: $tenantId" -ForegroundColor White
    Write-Host "Secret:    ********** (hidden)" -ForegroundColor White
    
    Write-Host "`n💾 Save these credentials? (Y/N): " -ForegroundColor Green -NoNewline
    $save = Read-Host
    
    if ($save -eq 'Y' -or $save -eq 'y') {
        try {
            # Convert secure string to encrypted standard string
            $encryptedSecret = ConvertFrom-SecureString -SecureString $clientSecret
            
            # Create credential object
            $credentialData = @{
                AppId = $appId
                TenantId = $tenantId
                ClientSecret = $encryptedSecret
                CreatedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                CreatedBy = $env:USERNAME
                MachineScope = $env:COMPUTERNAME
            }
            
            # Save to file
            $credPath = $global:MandA.Paths.CredentialFile
            $credentialData | ConvertTo-Json | Set-Content -Path $credPath -Force
            
            Write-Host "`n✅ Credentials saved successfully!" -ForegroundColor Green
            Write-Host "📁 Location: $credPath" -ForegroundColor Gray
            
            # Test the credentials
            Write-Host "`n🔍 Would you like to test these credentials now? (Y/N): " -ForegroundColor Cyan -NoNewline
            $test = Read-Host
            
            if ($test -eq 'Y' -or $test -eq 'y') {
                Test-StoredCredentials -AppId $appId -TenantId $tenantId -ClientSecret $clientSecret
            }
            
        } catch {
            Write-Host "`n❌ Error saving credentials: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Credential setup cancelled." -ForegroundColor Yellow
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Test-StoredCredentials {
    param(
        [string]$AppId,
        [string]$TenantId,
        [SecureString]$ClientSecret
    )
    
    Write-Host "`n🧪 TESTING CREDENTIALS..." -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    
    try {
        # Convert SecureString back to plain text for testing
        $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($ClientSecret)
        $plainSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
        
        # Test Graph connection
        Write-Host "`nTesting Microsoft Graph connection..." -ForegroundColor Cyan
        $body = @{
            grant_type    = "client_credentials"
            scope         = "https://graph.microsoft.com/.default"
            client_id     = $AppId
            client_secret = $plainSecret
        }
        
        $tokenResponse = Invoke-RestMethod -Method Post `
            -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" `
            -ContentType "application/x-www-form-urlencoded" `
            -Body $body
        
        if ($tokenResponse.access_token) {
            Write-Host "✅ Microsoft Graph authentication successful!" -ForegroundColor Green
            
            # Try to get organization info
            $headers = @{ Authorization = "Bearer $($tokenResponse.access_token)" }
            $org = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/organization" `
                -Headers $headers -ErrorAction SilentlyContinue
            
            if ($org.value) {
                Write-Host "✅ Connected to organization: $($org.value[0].displayName)" -ForegroundColor Green
            }
        }
        
    } catch {
        Write-Host "❌ Authentication test failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "`n🔍 Common issues:" -ForegroundColor Yellow
        Write-Host "   • Client secret may have expired" -ForegroundColor Gray
        Write-Host "   • App registration may not have required permissions" -ForegroundColor Gray
        Write-Host "   • Tenant ID or App ID may be incorrect" -ForegroundColor Gray
    }
}

#endregion

#region Operation Functions

function Start-FullDiscovery {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING FULL DISCOVERY SUITE                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    
    # Check credentials
    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }
    
    # Run orchestrator
    try {
        # Load configuration
        if (-not $ConfigFile) {
            $ConfigFile = Join-Path $global:MandA.Paths.Configuration "default-config.json"
        }
        
        # Run orchestrator with CompanyName
        & $global:MandA.Paths.Orchestrator -Mode "Full" -ConfigurationFile $ConfigFile -CompanyName $script:CompanyName
        
        Write-ColoredLog "`n✅ Full discovery suite completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-DiscoveryOnly {
    Write-ColoredLog "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    Write-ColoredLog "                    STARTING DISCOVERY PHASE ONLY                      " -Level "HEADER"
    Write-ColoredLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -Level "HEADER"
    
    if (-not $script:ConnectionStatus.Credentials) {
        Write-ColoredLog "`n⚠️  No credentials configured. Please set up credentials first (Option 2)." -Level "ERROR"
        Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        return
    }
    
    try {
        if (-not $ConfigFile) {
            $ConfigFile = Join-Path $global:MandA.Paths.Configuration "default-config.json"
        }
        
        # Run orchestrator with CompanyName
        & $global:MandA.Paths.Orchestrator -Mode "Discovery" -ConfigurationFile $ConfigFile -CompanyName $script:CompanyName
        
        Write-ColoredLog "`n✅ Discovery phase completed successfully!" -Level "SUCCESS"
    } catch {
        Write-ColoredLog "`n❌ Error during discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-AzureADAppGuide {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          AZURE AD APP REGISTRATION SETUP GUIDE                       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n📋 STEP-BY-STEP GUIDE:" -ForegroundColor Yellow
    Write-Host "=====================" -ForegroundColor Yellow
    
    Write-Host "`n1️⃣  Navigate to Azure Portal" -ForegroundColor Green
    Write-Host "   • Go to: https://portal.azure.com" -ForegroundColor Gray
    Write-Host "   • Sign in with your admin account" -ForegroundColor Gray
    
    Write-Host "`n2️⃣  Create App Registration" -ForegroundColor Green
    Write-Host "   • Navigate to: Azure Active Directory > App registrations" -ForegroundColor Gray
    Write-Host "   • Click: '+ New registration'" -ForegroundColor Gray
    Write-Host "   • Name: 'M&A Discovery Suite' (or your preferred name)" -ForegroundColor Gray
    Write-Host "   • Account types: 'Single tenant' (recommended)" -ForegroundColor Gray
    Write-Host "   • Redirect URI: Leave blank" -ForegroundColor Gray
    Write-Host "   • Click: 'Register'" -ForegroundColor Gray
    
    Write-Host "`n3️⃣  Create Client Secret" -ForegroundColor Green
    Write-Host "   • In your app, go to: 'Certificates & secrets'" -ForegroundColor Gray
    Write-Host "   • Click: '+ New client secret'" -ForegroundColor Gray
    Write-Host "   • Description: 'M&A Discovery Secret'" -ForegroundColor Gray
    Write-Host "   • Expires: Choose appropriate duration" -ForegroundColor Gray
    Write-Host "   • Click: 'Add'" -ForegroundColor Gray
    Write-Host "   • ⚠️  IMPORTANT: Copy the secret value immediately!" -ForegroundColor Yellow
    
    Write-Host "`n4️⃣  Grant API Permissions" -ForegroundColor Green
    Write-Host "   • Go to: 'API permissions'" -ForegroundColor Gray
    Write-Host "   • Click: '+ Add a permission'" -ForegroundColor Gray
    Write-Host "   • Select: 'Microsoft Graph'" -ForegroundColor Gray
    Write-Host "   • Select: 'Application permissions'" -ForegroundColor Gray
    Write-Host "`n   Add these permissions:" -ForegroundColor White
    Write-Host "   • Directory.Read.All" -ForegroundColor DarkGray
    Write-Host "   • User.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Group.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Application.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Policy.Read.All" -ForegroundColor DarkGray
    Write-Host "   • DeviceManagementManagedDevices.Read.All" -ForegroundColor DarkGray
    Write-Host "   • DeviceManagementConfiguration.Read.All" -ForegroundColor DarkGray
    Write-Host "   • Reports.Read.All" -ForegroundColor DarkGray
    
    Write-Host "`n5️⃣  Grant Admin Consent" -ForegroundColor Green
    Write-Host "   • After adding permissions, click: 'Grant admin consent for [Your Tenant]'" -ForegroundColor Gray
    Write-Host "   • Confirm the consent dialog" -ForegroundColor Gray
    Write-Host "   • All permissions should show '✓ Granted' status" -ForegroundColor Gray
    
    Write-Host "`n6️⃣  Note Your Values" -ForegroundColor Green
    Write-Host "   • Application (client) ID: Found in 'Overview' page" -ForegroundColor Gray
    Write-Host "   • Directory (tenant) ID: Found in 'Overview' page" -ForegroundColor Gray
    Write-Host "   • Client secret: The value you copied in step 3" -ForegroundColor Gray
    
    Write-Host "`n═══════════════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "`n📌 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   Return to main menu and select option [2] to configure credentials" -ForegroundColor White
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Invoke-ModuleCheck {
    param([switch]$Verbose)
    
    Write-ColoredLog "`nChecking PowerShell module dependencies..." -Level "INFO"
    
    if (Test-Path $global:MandA.Paths.ModuleCheckScript) {
        if ($Verbose) {
            & $global:MandA.Paths.ModuleCheckScript -Verbose
        } else {
            & $global:MandA.Paths.ModuleCheckScript
        }
        $script:ModulesVerified = $true
        $script:LastModuleCheck = Get-Date
    } else {
        Write-ColoredLog "Module check script not found: $($global:MandA.Paths.ModuleCheckScript)" -Level "ERROR"
    }
    
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Test-ServiceConnections {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                   TEST SERVICE CONNECTIONS                           ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-ColoredLog "`nTesting service connections..." -Level "INFO"
    
    # Test Graph
    Write-Host "`n1. Microsoft Graph:" -ForegroundColor Yellow
    try {
        $context = Get-MgContext
        if ($context) {
            Write-Host "   ✅ Connected" -ForegroundColor Green
            Write-Host "   • Tenant: $($context.TenantId)" -ForegroundColor Gray
            Write-Host "   • Scopes: $($context.Scopes -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Not connected" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Not connected: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Azure
    Write-Host "`n2. Azure Resource Manager:" -ForegroundColor Yellow
    try {
        $azContext = Get-AzContext
        if ($azContext) {
            Write-Host "   ✅ Connected" -ForegroundColor Green
            Write-Host "   • Subscription: $($azContext.Subscription.Name)" -ForegroundColor Gray
            Write-Host "   • Account: $($azContext.Account.Id)" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Not connected" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Module not available" -ForegroundColor Red
    }
    
    # Test Exchange
    Write-Host "`n3. Exchange Online:" -ForegroundColor Yellow
    $exoSession = Get-PSSession | Where-Object {$_.ConfigurationName -eq "Microsoft.Exchange"}
    if ($exoSession -and $exoSession.State -eq "Opened") {
        Write-Host "   ✅ Connected" -ForegroundColor Green
        Write-Host "   • Session: $($exoSession.Name)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Not connected" -ForegroundColor Red
    }
    
    # Test Active Directory
    Write-Host "`n4. Active Directory:" -ForegroundColor Yellow
    try {
        $domain = Get-ADDomain -ErrorAction Stop
        Write-Host "   ✅ Connected" -ForegroundColor Green
        Write-Host "   • Domain: $($domain.DNSRoot)" -ForegroundColor Gray
        Write-Host "   • Forest: $($domain.Forest)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Not available: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Show-Configuration {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    CONFIGURATION SETTINGS                            ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    # Load configuration
    $configFile = if ($ConfigFile) { $ConfigFile } else { Join-Path $global:MandA.Paths.Configuration "default-config.json" }
    
    if (Test-Path $configFile) {
        $config = Get-Content $configFile | ConvertFrom-Json
        
        Write-Host "`n📁 Configuration File: $configFile" -ForegroundColor Yellow
        Write-Host "`n🔧 Environment Settings:" -ForegroundColor Green
        Write-Host "   Output Path: $($config.environment.outputPath)" -ForegroundColor Gray
        Write-Host "   Domain Controller: $($config.environment.domainController)" -ForegroundColor Gray
        Write-Host "   Global Catalog: $($config.environment.globalCatalog)" -ForegroundColor Gray
        
        Write-Host "`n🔍 Discovery Settings:" -ForegroundColor Green
        Write-Host "   Skip Existing Files: $($config.discovery.skipExistingFiles)" -ForegroundColor Gray
        Write-Host "   Enabled Sources: $($config.discovery.enabledSources -join ', ')" -ForegroundColor Gray
        
        Write-Host "`n📊 Processing Settings:" -ForegroundColor Green
        Write-Host "   Batch Size: $($config.processing.batchSize)" -ForegroundColor Gray
        Write-Host "   Parallel Jobs: $($config.processing.parallelJobs)" -ForegroundColor Gray
        
        Write-Host "`n📄 Export Settings:" -ForegroundColor Green
        Write-Host "   Formats: $($config.export.formats -join ', ')" -ForegroundColor Gray
        Write-Host "   Compress Output: $($config.export.compressOutput)" -ForegroundColor Gray
    } else {
        Write-Host "`n❌ Configuration file not found: $configFile" -ForegroundColor Red
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Clear-DataFiles {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                     CLEAR DATA FILES                                 ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n⚠️  WARNING: This will delete all collected data!" -ForegroundColor Yellow
    Write-Host "`nData directories to be cleared:" -ForegroundColor White
    Write-Host "   • $($global:MandA.Paths.RawDataOutput)" -ForegroundColor Gray
    Write-Host "   • $($global:MandA.Paths.ProcessedDataOutput)" -ForegroundColor Gray
    Write-Host "   • $($global:MandA.Paths.Reports)" -ForegroundColor Gray
    
    Write-Host "`n❓ Are you sure you want to delete all data? (YES/NO): " -ForegroundColor Red -NoNewline
    $confirm = Read-Host
    
    if ($confirm -eq "YES") {
        try {
            # Clear directories
            @($global:MandA.Paths.RawDataOutput, $global:MandA.Paths.ProcessedDataOutput, $global:MandA.Paths.Reports) | ForEach-Object {
                if (Test-Path $_) {
                    Get-ChildItem -Path $_ -Recurse | Remove-Item -Force -Recurse
                    Write-Host "   ✅ Cleared: $_" -ForegroundColor Green
                }
            }
            Write-Host "`n✅ All data files have been cleared." -ForegroundColor Green
        } catch {
            Write-Host "`n❌ Error clearing files: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Operation cancelled." -ForegroundColor Yellow
    }
    
    Write-Host "`nPress any key to return to main menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

#endregion

#region Main Program

# Initialize environment
Initialize-Environment

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-ColoredLog "⚠️  WARNING: Not running as Administrator. Some features may not work correctly." -Level "WARN"
    Write-ColoredLog "   Recommended: Run PowerShell as Administrator" -Level "WARN"
    Start-Sleep -Seconds 3
}

# Show welcome message
Clear-Host
Write-Host @"
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                    M&A DISCOVERY SUITE v5.0                          ║
║                                                                      ║
║            Comprehensive Infrastructure Discovery Tool                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`nInitializing..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Main menu loop
$firstRun = -not (Test-Path $global:MandA.Paths.CredentialFile)

do {
    Show-MainMenu -FirstRun:$firstRun
    $selection = Read-Host
    
    switch ($selection) {
        '1' {
            # Setup Azure AD App Registration
            Show-AzureADAppGuide
        }
        '2' {
            # Configure Credentials
            Show-CredentialSetupMenu
            $firstRun = $false
        }
        '3' {
            # Full Discovery
            if (Should-CheckModules -Operation "Full") {
                Write-Host "`nChecking module dependencies..." -ForegroundColor Yellow
                Invoke-ModuleCheck
            }
            Start-FullDiscovery
        }
        '4' {
            # Discovery Only
            if (Should-CheckModules -Operation "Discovery") {
                Write-Host "`nChecking module dependencies..." -ForegroundColor Yellow
                Invoke-ModuleCheck
            }
            Start-DiscoveryOnly
        }
        '5' {
            # Processing Only
            Write-ColoredLog "`n⚠️  Processing phase not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '6' {
            # Export Only
            Write-ColoredLog "`n⚠️  Export phase not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        '7' {
            # Update Credentials
            Show-CredentialSetupMenu
        }
        '8' {
            # Verify Modules
            Invoke-ModuleCheck -Verbose
        }
        '9' {
            # Test Connections
            Test-ServiceConnections
        }
        '10' {
            # View Configuration
            Show-Configuration
        }
        '11' {
            # Clear Data Files
            Clear-DataFiles
        }
        '12' {
            # Generate Sample Report
            Write-ColoredLog "`n⚠️  Report generation not yet implemented" -Level "WARN"
            Start-Sleep -Seconds 2
        }
        'Q' {
            Write-Host "`nExiting M&A Discovery Suite..." -ForegroundColor Yellow
            Write-Host "Thank you for using the discovery tool!" -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
        'q' {
            $selection = 'Q'
        }
        default {
            Write-Host "`n⚠️  Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
    
} while ($selection -ne 'Q')

#endregion
