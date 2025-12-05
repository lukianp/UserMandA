# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Interactive Main Menu for M&A Discovery Suite
.DESCRIPTION
    Comprehensive interactive menu system that provides easy access to all M&A Discovery Suite 
    functionality including app registration creation, discovery scope selection, module execution,
    and result management. Designed for both technical and non-technical users.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, M&A Discovery Suite, Microsoft Graph modules
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBanner,
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoMode
)

# Script variables
$script:CurrentCompany = $CompanyName
$script:DiscoveryScope = "Hybrid"
$script:SessionInfo = @{
    StartTime = Get-Date
    LastActivity = Get-Date
    MenuLevel = "Main"
    Context = $null
}

#===============================================================================
#                       HELPER FUNCTIONS
#===============================================================================

function Write-MenuHeader {
    param(
        [string]$Title,
        [string]$SubTitle = "",
        [string]$Version = "1.0.0"
    )
    
    if (-not $SkipBanner) {
        Clear-Host
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║                          M&A DISCOVERY SUITE                                 ║" -ForegroundColor Cyan
        Write-Host "║                         Interactive Control Panel                            ║" -ForegroundColor Cyan
        Write-Host "╠═══════════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
        Write-Host "║  Version: $Version                                                           ║" -ForegroundColor Gray
        Write-Host "║  PowerShell: $($PSVersionTable.PSVersion)                                   ║" -ForegroundColor Gray
        Write-Host "║  User: $([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)   ║" -ForegroundColor Gray
        Write-Host "║  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')                           ║" -ForegroundColor Gray
        Write-Host "╚═══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
        Write-Host ""
        
        if ($Title) {
            Write-Host " $Title" -ForegroundColor Yellow
            if ($SubTitle) {
                Write-Host " $SubTitle" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }
}

function Write-MenuOption {
    param(
        [string]$Key,
        [string]$Description,
        [string]$Status = "",
        [string]$Color = "White"
    )
    
    $statusText = if ($Status) { " [$Status]" } else { "" }
    Write-Host " [$Key] $Description$statusText" -ForegroundColor $Color
}

function Write-MenuSeparator {
    Write-Host " " + ("─" * 75) -ForegroundColor Gray
}

function Read-MenuChoice {
    param(
        [string]$Prompt = "Enter your choice",
        [string[]]$ValidChoices = @()
    )
    
    do {
        Write-Host ""
        $choice = Read-Host "$Prompt"
        $choice = $choice.ToLower().Trim()
        
        if ($ValidChoices.Count -eq 0 -or $choice -in $ValidChoices) {
            return $choice
        }
        
        Write-Host " Invalid choice. Please try again." -ForegroundColor Red
    } while ($true)
}

function Test-Prerequisites {
    $prereqResults = @{
        GlobalContext = $false
        PowerShellVersion = $false
        Modules = @{}
        OverallStatus = $false
    }
    
    # Check PowerShell version
    $prereqResults.PowerShellVersion = $PSVersionTable.PSVersion.Major -ge 5
    
    # Check global context
    if ($global:MandA -and $global:MandA.Initialized) {
        $prereqResults.GlobalContext = $true
        $script:SessionInfo.Context = $global:MandA
    }
    
    # Check critical modules
    $criticalModules = @(
        "Microsoft.Graph.Authentication",
        "Microsoft.Graph.Users",
        "Microsoft.Graph.Groups",
        "Az.Accounts",
        "Az.Profile"
    )
    
    foreach ($module in $criticalModules) {
        $prereqResults.Modules[$module] = $null -ne (Get-Module -ListAvailable -Name $module)
    }
    
    $prereqResults.OverallStatus = $prereqResults.GlobalContext -and $prereqResults.PowerShellVersion -and ($prereqResults.Modules.Values | Where-Object { $_ }).Count -ge 2
    
    return $prereqResults
}

function Show-PrerequisiteStatus {
    $prereqs = Test-Prerequisites
    
    Write-MenuHeader -Title "System Prerequisites Check"
    
    $psStatus = if ($prereqs.PowerShellVersion) { "✓ PASS" } else { "✗ FAIL" }
    $psColor = if ($prereqs.PowerShellVersion) { "Green" } else { "Red" }
    Write-Host " PowerShell Version (5.1+): $psStatus" -ForegroundColor $psColor
    
    $contextStatus = if ($prereqs.GlobalContext) { "✓ PASS" } else { "✗ FAIL" }
    $contextColor = if ($prereqs.GlobalContext) { "Green" } else { "Red" }
    Write-Host " Global Context: $contextStatus" -ForegroundColor $contextColor
    
    Write-Host ""
    Write-Host " Module Availability:" -ForegroundColor Yellow
    foreach ($module in $prereqs.Modules.Keys) {
        $status = if ($prereqs.Modules[$module]) { "✓ Available" } else { "✗ Missing" }
        $color = if ($prereqs.Modules[$module]) { "Green" } else { "Red" }
        Write-Host "   $module : $status" -ForegroundColor $color
    }
    
    Write-Host ""
    $overallStatus = if ($prereqs.OverallStatus) { "✓ READY" } else { "✗ NOT READY" }
    $overallColor = if ($prereqs.OverallStatus) { "Green" } else { "Red" }
    Write-Host " Overall Status: $overallStatus" -ForegroundColor $overallColor
    
    if (-not $prereqs.OverallStatus) {
        Write-Host ""
        Write-Host " ⚠️  Please run QuickStart.ps1 to initialize the environment" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
    
    return $prereqs.OverallStatus
}

function Show-AppRegistrationMenu {
    Write-MenuHeader -Title "App Registration Management" -SubTitle "Create and manage Azure AD app registrations"
    
    Write-MenuOption -Key "1" -Description "Create new app registration (Interactive)" -Color "Green"
    Write-MenuOption -Key "2" -Description "Create new app registration (Automated)" -Color "Green"
    Write-MenuOption -Key "3" -Description "Check existing app registration" -Color "Yellow"
    Write-MenuOption -Key "4" -Description "View app registration permissions" -Color "Yellow"
    Write-MenuOption -Key "5" -Description "Delete app registration" -Color "Red"
    Write-MenuSeparator
    Write-MenuOption -Key "R" -Description "Return to main menu" -Color "Gray"
    
    $choice = Read-MenuChoice -ValidChoices @("1", "2", "3", "4", "5", "r")
    
    switch ($choice) {
        "1" { Invoke-InteractiveAppRegistration }
        "2" { Invoke-AutomatedAppRegistration }
        "3" { Show-ExistingAppRegistration }
        "4" { Show-AppRegistrationPermissions }
        "5" { Remove-AppRegistration }
        "r" { return }
    }
}

function Invoke-InteractiveAppRegistration {
    Write-MenuHeader -Title "Interactive App Registration Creation"
    
    Write-Host " This will guide you through creating a new Azure AD app registration" -ForegroundColor Yellow
    Write-Host " for the M&A Discovery Suite with the required permissions." -ForegroundColor Yellow
    Write-Host ""
    
    # Get app details
    do {
        $appName = Read-Host "Enter app registration name (default: M&A-Discovery-$(Get-Date -Format 'yyyyMMdd'))"
        if (-not $appName) {
            $appName = "M&A-Discovery-$(Get-Date -Format 'yyyyMMdd')"
        }
    } while (-not $appName)
    
    $appDescription = Read-Host "Enter app description (optional)"
    if (-not $appDescription) {
        $appDescription = "M&A Discovery Suite - Automated organizational discovery and analysis"
    }
    
    Write-Host ""
    Write-Host " Creating app registration..." -ForegroundColor Yellow
    
    try {
        # Check if app registration script exists
        $appRegScript = Join-Path $script:SessionInfo.Context.Paths.Scripts "Create-AppRegistration.ps1"
        
        if (Test-Path $appRegScript) {
            $params = @{
                AppName = $appName
                AppDescription = $appDescription
                Interactive = $true
            }
            
            & $appRegScript @params
            
            Write-Host ""
            Write-Host " ✓ App registration created successfully!" -ForegroundColor Green
            Write-Host " Please save the generated credentials securely." -ForegroundColor Yellow
        } else {
            Write-Host " ✗ App registration script not found at: $appRegScript" -ForegroundColor Red
            Write-Host " Please ensure the M&A Discovery Suite is properly installed." -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ✗ Failed to create app registration: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Invoke-AutomatedAppRegistration {
    Write-MenuHeader -Title "Automated App Registration Creation"
    
    Write-Host " This will automatically create an Azure AD app registration" -ForegroundColor Yellow
    Write-Host " with standard permissions for the M&A Discovery Suite." -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Continue with automated creation? (y/N)"
    if ($confirm.ToLower() -ne "y") {
        return
    }
    
    try {
        $appRegScript = Join-Path $script:SessionInfo.Context.Paths.Scripts "Create-AppRegistration.ps1"
        
        if (Test-Path $appRegScript) {
            $params = @{
                AppName = "M&A-Discovery-Auto-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                AppDescription = "M&A Discovery Suite - Automated creation"
                Interactive = $false
                Force = $true
            }
            
            & $appRegScript @params
            
            Write-Host ""
            Write-Host " ✓ App registration created successfully!" -ForegroundColor Green
        } else {
            Write-Host " ✗ App registration script not found" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Failed to create app registration: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-ExistingAppRegistration {
    Write-MenuHeader -Title "Check Existing App Registration"
    
    $appId = Read-Host "Enter Application (Client) ID to check"
    
    if ($appId) {
        try {
            # This would typically use Graph API to check the app registration
            Write-Host ""
            Write-Host " Checking app registration: $appId" -ForegroundColor Yellow
            Write-Host " Feature not yet implemented - would query Graph API" -ForegroundColor Gray
        } catch {
            Write-Host " ✗ Failed to check app registration: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-AppRegistrationPermissions {
    Write-MenuHeader -Title "App Registration Permissions"
    
    Write-Host " Required permissions for M&A Discovery Suite:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host " Microsoft Graph API:" -ForegroundColor Cyan
    Write-Host "   • User.Read.All                 - Read all user profiles" -ForegroundColor White
    Write-Host "   • Group.Read.All                - Read all groups" -ForegroundColor White
    Write-Host "   • Directory.Read.All            - Read directory data" -ForegroundColor White
    Write-Host "   • Organization.Read.All         - Read organization info" -ForegroundColor White
    Write-Host "   • Application.Read.All          - Read applications" -ForegroundColor White
    Write-Host "   • Exchange.ManageAsApp          - Exchange data access" -ForegroundColor White
    Write-Host ""
    
    Write-Host " Azure Service Management API:" -ForegroundColor Cyan
    Write-Host "   • user_impersonation           - Access Azure resources" -ForegroundColor White
    Write-Host ""
    
    Write-Host " Office 365 Management APIs:" -ForegroundColor Cyan
    Write-Host "   • ActivityFeed.Read            - Read activity feeds" -ForegroundColor White
    Write-Host "   • ServiceHealth.Read           - Read service health" -ForegroundColor White
    Write-Host ""
    
    Read-Host "Press Enter to continue"
}

function Remove-AppRegistration {
    Write-MenuHeader -Title "Delete App Registration"
    
    Write-Host " ⚠️  WARNING: This will permanently delete an app registration!" -ForegroundColor Red
    Write-Host ""
    
    $appId = Read-Host "Enter Application (Client) ID to delete"
    
    if ($appId) {
        Write-Host ""
        Write-Host " You are about to delete app registration: $appId" -ForegroundColor Yellow
        $confirm = Read-Host "Are you absolutely sure? Type 'DELETE' to confirm"
        
        if ($confirm -eq "DELETE") {
            Write-Host " Feature not yet implemented - would delete via Graph API" -ForegroundColor Gray
        } else {
            Write-Host " Deletion cancelled" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-DiscoveryScopeMenu {
    Write-MenuHeader -Title "Discovery Scope Selection" -SubTitle "Choose your discovery targets"
    
    Write-Host " Current Scope: $script:DiscoveryScope" -ForegroundColor Yellow
    Write-Host ""
    
    Write-MenuOption -Key "1" -Description "Azure Only" -Status "Cloud-based resources only" -Color "Cyan"
    Write-MenuOption -Key "2" -Description "On-Premises Only" -Status "Local infrastructure only" -Color "Green"
    Write-MenuOption -Key "3" -Description "Hybrid (Recommended)" -Status "Azure + On-Premises" -Color "Yellow"
    Write-MenuOption -Key "4" -Description "Custom Scope" -Status "Select specific modules" -Color "Magenta"
    Write-MenuSeparator
    Write-MenuOption -Key "R" -Description "Return to main menu" -Color "Gray"
    
    $choice = Read-MenuChoice -ValidChoices @("1", "2", "3", "4", "r")
    
    switch ($choice) {
        "1" { 
            $script:DiscoveryScope = "Azure"
            Write-Host " ✓ Discovery scope set to: Azure Only" -ForegroundColor Green
        }
        "2" { 
            $script:DiscoveryScope = "OnPremises"
            Write-Host " ✓ Discovery scope set to: On-Premises Only" -ForegroundColor Green
        }
        "3" { 
            $script:DiscoveryScope = "Hybrid"
            Write-Host " ✓ Discovery scope set to: Hybrid (Recommended)" -ForegroundColor Green
        }
        "4" { 
            Show-CustomScopeMenu
        }
        "r" { return }
    }
    
    if ($choice -in @("1", "2", "3")) {
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
}

function Show-CustomScopeMenu {
    Write-MenuHeader -Title "Custom Discovery Scope" -SubTitle "Select specific discovery modules"
    
    $availableModules = @(
        @{ Name = "Azure"; Description = "Azure Active Directory and resources"; Default = $true },
        @{ Name = "Exchange"; Description = "Exchange Online and on-premises"; Default = $true },
        @{ Name = "VMware"; Description = "VMware vSphere infrastructure"; Default = $false },
        @{ Name = "CertificateAuthority"; Description = "PKI and certificate infrastructure"; Default = $false },
        @{ Name = "DNSDHCP"; Description = "DNS and DHCP services"; Default = $false },
        @{ Name = "PowerPlatform"; Description = "Power BI, Power Apps, Power Automate"; Default = $true },
        @{ Name = "SecurityInfrastructure"; Description = "Security tools and appliances"; Default = $false }
    )
    
    $selectedModules = @()
    
    foreach ($module in $availableModules) {
        $defaultStatus = if ($module.Default) { "Recommended" } else { "Optional" }
        $color = if ($module.Default) { "Yellow" } else { "White" }
        
        Write-Host " $($module.Name): $($module.Description)" -ForegroundColor $color
        Write-Host "   Status: $defaultStatus" -ForegroundColor Gray
        
        $include = Read-Host "   Include this module? (Y/n)"
        if ($include.ToLower() -ne "n") {
            $selectedModules += $module.Name
        }
        Write-Host ""
    }
    
    if ($selectedModules.Count -gt 0) {
        $script:DiscoveryScope = "Custom"
        Write-Host " ✓ Custom scope configured with $($selectedModules.Count) modules:" -ForegroundColor Green
        foreach ($module in $selectedModules) {
            Write-Host "   • $module" -ForegroundColor White
        }
    } else {
        Write-Host " ⚠️  No modules selected. Scope unchanged." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-DiscoveryExecutionMenu {
    Write-MenuHeader -Title "Discovery Execution" -SubTitle "Run discovery modules"
    
    Write-Host " Current Company: $script:CurrentCompany" -ForegroundColor Yellow
    Write-Host " Current Scope: $script:DiscoveryScope" -ForegroundColor Yellow
    Write-Host ""
    
    Write-MenuOption -Key "1" -Description "Quick Discovery" -Status "Essential modules only" -Color "Green"
    Write-MenuOption -Key "2" -Description "Full Discovery" -Status "All configured modules" -Color "Yellow"
    Write-MenuOption -Key "3" -Description "Custom Discovery" -Status "Select specific modules" -Color "Cyan"
    Write-MenuOption -Key "4" -Description "Validate Configuration" -Status "Test without executing" -Color "Gray"
    Write-MenuSeparator
    Write-MenuOption -Key "R" -Description "Return to main menu" -Color "Gray"
    
    $choice = Read-MenuChoice -ValidChoices @("1", "2", "3", "4", "r")
    
    switch ($choice) {
        "1" { Invoke-QuickDiscovery }
        "2" { Invoke-FullDiscovery }
        "3" { Invoke-CustomDiscovery }
        "4" { Invoke-ValidationOnly }
        "r" { return }
    }
}

function Invoke-QuickDiscovery {
    Write-MenuHeader -Title "Quick Discovery Execution"
    
    if (-not $script:CurrentCompany) {
        $script:CurrentCompany = Read-Host "Enter company name for discovery"
    }
    
    Write-Host " Starting quick discovery for: $script:CurrentCompany" -ForegroundColor Yellow
    Write-Host " Scope: $script:DiscoveryScope" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        $orchestratorScript = Join-Path $script:SessionInfo.Context.Paths.Core "MandA-Orchestrator.ps1"
        
        if (Test-Path $orchestratorScript) {
            $params = @{
                CompanyName = $script:CurrentCompany
                Mode = "Discovery"
                Force = $false
            }
            
            Write-Host " Executing orchestrator..." -ForegroundColor Yellow
            & $orchestratorScript @params
            
            Write-Host ""
            Write-Host " ✓ Quick discovery completed!" -ForegroundColor Green
        } else {
            Write-Host " ✗ Orchestrator script not found at: $orchestratorScript" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Discovery failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Invoke-FullDiscovery {
    Write-MenuHeader -Title "Full Discovery Execution"
    
    if (-not $script:CurrentCompany) {
        $script:CurrentCompany = Read-Host "Enter company name for discovery"
    }
    
    Write-Host " Starting full discovery for: $script:CurrentCompany" -ForegroundColor Yellow
    Write-Host " Scope: $script:DiscoveryScope" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Full discovery may take significant time. Continue? (y/N)"
    if ($confirm.ToLower() -ne "y") {
        return
    }
    
    try {
        $orchestratorScript = Join-Path $script:SessionInfo.Context.Paths.Core "MandA-Orchestrator.ps1"
        
        if (Test-Path $orchestratorScript) {
            $params = @{
                CompanyName = $script:CurrentCompany
                Mode = "Full"
                Force = $true
            }
            
            Write-Host " Executing orchestrator..." -ForegroundColor Yellow
            & $orchestratorScript @params
            
            Write-Host ""
            Write-Host " ✓ Full discovery completed!" -ForegroundColor Green
        } else {
            Write-Host " ✗ Orchestrator script not found" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Discovery failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Invoke-CustomDiscovery {
    Write-MenuHeader -Title "Custom Discovery Execution"
    
    Write-Host " Feature not yet implemented" -ForegroundColor Gray
    Write-Host " Would allow selection of specific modules to run" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Invoke-ValidationOnly {
    Write-MenuHeader -Title "Configuration Validation"
    
    if (-not $script:CurrentCompany) {
        $script:CurrentCompany = Read-Host "Enter company name for validation"
    }
    
    Write-Host " Validating configuration for: $script:CurrentCompany" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        $orchestratorScript = Join-Path $script:SessionInfo.Context.Paths.Core "MandA-Orchestrator.ps1"
        
        if (Test-Path $orchestratorScript) {
            $params = @{
                CompanyName = $script:CurrentCompany
                ValidateOnly = $true
            }
            
            Write-Host " Running validation..." -ForegroundColor Yellow
            & $orchestratorScript @params
            
            Write-Host ""
            Write-Host " ✓ Validation completed!" -ForegroundColor Green
        } else {
            Write-Host " ✗ Orchestrator script not found" -ForegroundColor Red
        }
    } catch {
        Write-Host " ✗ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-ResultsMenu {
    Write-MenuHeader -Title "Results and Reports" -SubTitle "View discovery results and generate reports"
    
    Write-MenuOption -Key "1" -Description "View latest discovery results" -Color "Green"
    Write-MenuOption -Key "2" -Description "Generate executive summary" -Color "Yellow"
    Write-MenuOption -Key "3" -Description "Export raw data" -Color "Cyan"
    Write-MenuOption -Key "4" -Description "View discovery logs" -Color "Gray"
    Write-MenuOption -Key "5" -Description "Open results folder" -Color "White"
    Write-MenuSeparator
    Write-MenuOption -Key "R" -Description "Return to main menu" -Color "Gray"
    
    $choice = Read-MenuChoice -ValidChoices @("1", "2", "3", "4", "5", "r")
    
    switch ($choice) {
        "1" { Show-LatestResults }
        "2" { Generate-ExecutiveSummary }
        "3" { Export-RawData }
        "4" { Show-DiscoveryLogs }
        "5" { Open-ResultsFolder }
        "r" { return }
    }
}

function Show-LatestResults {
    Write-MenuHeader -Title "Latest Discovery Results"
    
    Write-Host " Feature not yet implemented" -ForegroundColor Gray
    Write-Host " Would display summary of latest discovery session" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Generate-ExecutiveSummary {
    Write-MenuHeader -Title "Executive Summary Generation"
    
    Write-Host " Feature not yet implemented" -ForegroundColor Gray
    Write-Host " Would generate executive-level summary report" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Export-RawData {
    Write-MenuHeader -Title "Raw Data Export"
    
    Write-Host " Feature not yet implemented" -ForegroundColor Gray
    Write-Host " Would export raw discovery data in various formats" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-DiscoveryLogs {
    Write-MenuHeader -Title "Discovery Logs"
    
    if ($script:SessionInfo.Context -and $script:SessionInfo.Context.Paths.LogOutput) {
        $logPath = $script:SessionInfo.Context.Paths.LogOutput
        
        if (Test-Path $logPath) {
            Write-Host " Log directory: $logPath" -ForegroundColor Yellow
            Write-Host ""
            
            $logFiles = Get-ChildItem -Path $logPath -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 10
            
            if ($logFiles) {
                Write-Host " Recent log files:" -ForegroundColor Green
                foreach ($file in $logFiles) {
                    Write-Host "   $($file.Name) - $($file.LastWriteTime)" -ForegroundColor White
                }
            } else {
                Write-Host " No log files found" -ForegroundColor Gray
            }
        } else {
            Write-Host " Log directory not found: $logPath" -ForegroundColor Red
        }
    } else {
        Write-Host " Log path not configured" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Open-ResultsFolder {
    Write-MenuHeader -Title "Open Results Folder"
    
    if ($script:SessionInfo.Context -and $script:SessionInfo.Context.Paths.CompanyProfileRoot) {
        $resultsPath = $script:SessionInfo.Context.Paths.CompanyProfileRoot
        
        if (Test-Path $resultsPath) {
            Write-Host " Opening results folder: $resultsPath" -ForegroundColor Yellow
            
            try {
                if ($IsWindows -or $env:OS -eq "Windows_NT") {
                    Start-Process explorer.exe -ArgumentList $resultsPath
                } elseif ($IsLinux) {
                    Start-Process xdg-open -ArgumentList $resultsPath
                } elseif ($IsMacOS) {
                    Start-Process open -ArgumentList $resultsPath
                } else {
                    Write-Host " Cannot auto-open folder on this platform" -ForegroundColor Gray
                    Write-Host " Please manually navigate to: $resultsPath" -ForegroundColor Yellow
                }
            } catch {
                Write-Host " Could not open folder automatically" -ForegroundColor Red
                Write-Host " Please manually navigate to: $resultsPath" -ForegroundColor Yellow
            }
        } else {
            Write-Host " Results folder not found: $resultsPath" -ForegroundColor Red
        }
    } else {
        Write-Host " Results path not configured" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Show-MainMenu {
    Write-MenuHeader -Title "Main Menu" -SubTitle "Select an option to continue"
    
    if ($script:CurrentCompany) {
        Write-Host " Company: $script:CurrentCompany" -ForegroundColor Yellow
    }
    Write-Host " Discovery Scope: $script:DiscoveryScope" -ForegroundColor Yellow
    Write-Host ""
    
    Write-MenuOption -Key "1" -Description "App Registration Management" -Color "Cyan"
    Write-MenuOption -Key "2" -Description "Discovery Scope Selection" -Color "Green"
    Write-MenuOption -Key "3" -Description "Execute Discovery" -Color "Yellow"
    Write-MenuOption -Key "4" -Description "View Results & Reports" -Color "Magenta"
    Write-MenuSeparator
    Write-MenuOption -Key "S" -Description "System Prerequisites Check" -Color "Gray"
    Write-MenuOption -Key "H" -Description "Help & Documentation" -Color "Gray"
    Write-MenuOption -Key "Q" -Description "Quit" -Color "Red"
    
    $choice = Read-MenuChoice -ValidChoices @("1", "2", "3", "4", "s", "h", "q")
    
    switch ($choice) {
        "1" { Show-AppRegistrationMenu }
        "2" { Show-DiscoveryScopeMenu }
        "3" { Show-DiscoveryExecutionMenu }
        "4" { Show-ResultsMenu }
        "s" { Show-PrerequisiteStatus }
        "h" { Show-HelpMenu }
        "q" { 
            Write-Host ""
            Write-Host " Thank you for using M&A Discovery Suite!" -ForegroundColor Green
            Write-Host " Session duration: $(([DateTime]::Now - $script:SessionInfo.StartTime).ToString('hh\:mm\:ss'))" -ForegroundColor Gray
            Write-Host ""
            exit 0
        }
    }
}

function Show-HelpMenu {
    Write-MenuHeader -Title "Help & Documentation"
    
    Write-Host " M&A Discovery Suite Interactive Menu System" -ForegroundColor Yellow
    Write-Host ""
    Write-Host " Navigation:" -ForegroundColor Cyan
    Write-Host "   • Use number keys to select menu options" -ForegroundColor White
    Write-Host "   • Use 'R' to return to previous menu" -ForegroundColor White
    Write-Host "   • Use 'Q' to quit the application" -ForegroundColor White
    Write-Host ""
    Write-Host " Key Features:" -ForegroundColor Cyan
    Write-Host "   • App Registration: Create Azure AD applications" -ForegroundColor White
    Write-Host "   • Discovery Scope: Select Azure, On-Premises, or Hybrid" -ForegroundColor White
    Write-Host "   • Execute Discovery: Run discovery modules" -ForegroundColor White
    Write-Host "   • View Results: Access discovery results and reports" -ForegroundColor White
    Write-Host ""
    Write-Host " Discovery Modules:" -ForegroundColor Cyan
    Write-Host "   • Azure Active Directory" -ForegroundColor White
    Write-Host "   • Exchange Online/On-Premises" -ForegroundColor White
    Write-Host "   • VMware vSphere Infrastructure" -ForegroundColor White
    Write-Host "   • Certificate Authority (PKI)" -ForegroundColor White
    Write-Host "   • DNS/DHCP Services" -ForegroundColor White
    Write-Host "   • Power Platform (Power BI, Apps, Automate)" -ForegroundColor White
    Write-Host "   • Security Infrastructure" -ForegroundColor White
    Write-Host ""
    Write-Host " For detailed documentation, see the Documentation folder" -ForegroundColor Gray
    Write-Host ""
    
    Read-Host "Press Enter to continue"
}

#===============================================================================
#                       MAIN EXECUTION
#===============================================================================

try {
    # Initialize session
    $script:SessionInfo.StartTime = Get-Date
    
    # Check if running in auto mode
    if ($AutoMode) {
        Write-Host "M&A Discovery Suite - Auto Mode" -ForegroundColor Cyan
        Write-Host "This would run automated discovery workflow" -ForegroundColor Gray
        exit 0
    }
    
    # Main menu loop
    while ($true) {
        Show-MainMenu
        $script:SessionInfo.LastActivity = Get-Date
    }
    
} catch {
    Write-Host ""
    Write-Host " Fatal Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host " Please check the logs and try again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}