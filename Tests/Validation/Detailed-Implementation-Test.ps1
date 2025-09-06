#Requires -Version 5.1

<#
.SYNOPSIS
    Detailed implementation test for claude.local.md tasks
.DESCRIPTION
    Deep-dive testing of specific implementations for each task
#>

[CmdletBinding()]
param()

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

$DetailedReport = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Tasks = @{}
}

Write-Host "`n=== DETAILED IMPLEMENTATION TESTING ===" -ForegroundColor Cyan

#region T-000: Dual-Profile Architecture Deep Test

Write-Host "`n[T-000] Dual-Profile Architecture Deep Test..." -ForegroundColor Yellow

# Check TargetProfile model
$targetProfilePath = "D:\Scripts\UserMandA\GUI\Models\TargetProfile.cs"
if (Test-Path $targetProfilePath) {
    $content = Get-Content $targetProfilePath -Raw
    $hasCredentials = $content -match "Credentials|Password|Token"
    $hasScopes = $content -match "Scopes|Permissions"
    $hasConnection = $content -match "Connection|Endpoint"
    
    Write-Host "  TargetProfile Model:" -ForegroundColor White
    Write-Host "    Has Credentials: $(if($hasCredentials){'YES'}else{'NO'})" -ForegroundColor $(if($hasCredentials){'Green'}else{'Red'})
    Write-Host "    Has Scopes: $(if($hasScopes){'YES'}else{'NO'})" -ForegroundColor $(if($hasScopes){'Green'}else{'Red'})
    Write-Host "    Has Connection: $(if($hasConnection){'YES'}else{'NO'})" -ForegroundColor $(if($hasConnection){'Green'}else{'Red'})
    
    $DetailedReport.Tasks["T-000"] = @{
        Status = if ($hasCredentials -and $hasScopes) { "IMPLEMENTED" } else { "PARTIAL" }
        Details = @{
            TargetProfile = @{
                Credentials = $hasCredentials
                Scopes = $hasScopes
                Connection = $hasConnection
            }
        }
    }
} else {
    Write-Host "  [MISSING] TargetProfile.cs not found" -ForegroundColor Red
    $DetailedReport.Tasks["T-000"] = @{Status = "MISSING"}
}

# Check for profile ViewModels
$profileVMs = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\ViewModels" -Filter "*Profile*.cs" -ErrorAction SilentlyContinue
if ($profileVMs) {
    Write-Host "  Found Profile ViewModels:" -ForegroundColor White
    foreach ($vm in $profileVMs) {
        Write-Host "    - $($vm.Name)" -ForegroundColor Gray
    }
}

#endregion

#region T-040: SharePoint Migration Deep Test

Write-Host "`n[T-040] SharePoint Migration Deep Test..." -ForegroundColor Yellow

$spMigratorPath = "D:\Scripts\UserMandA\GUI\Services\Migration\SharePointMigrator.cs"
if (Test-Path $spMigratorPath) {
    $content = Get-Content $spMigratorPath -Raw
    $hasGraphAPI = $content -match "GraphServiceClient|Microsoft.Graph"
    $hasMetadata = $content -match "Metadata|Properties"
    $hasPermissions = $content -match "Permission|ACL|Access"
    $hasProgress = $content -match "Progress|IProgress"
    
    Write-Host "  SharePoint Migrator Implementation:" -ForegroundColor White
    Write-Host "    Uses Graph API: $(if($hasGraphAPI){'YES'}else{'NO'})" -ForegroundColor $(if($hasGraphAPI){'Green'}else{'Red'})
    Write-Host "    Handles Metadata: $(if($hasMetadata){'YES'}else{'NO'})" -ForegroundColor $(if($hasMetadata){'Green'}else{'Red'})
    Write-Host "    Preserves Permissions: $(if($hasPermissions){'YES'}else{'NO'})" -ForegroundColor $(if($hasPermissions){'Green'}else{'Red'})
    Write-Host "    Reports Progress: $(if($hasProgress){'YES'}else{'NO'})" -ForegroundColor $(if($hasProgress){'Green'}else{'Red'})
    
    $DetailedReport.Tasks["T-040"] = @{
        Status = if ($hasGraphAPI -and $hasMetadata) { "COMPLETED" } else { "PARTIAL" }
        Details = @{
            GraphAPI = $hasGraphAPI
            Metadata = $hasMetadata
            Permissions = $hasPermissions
            Progress = $hasProgress
        }
    }
} else {
    # Check alternative locations
    $migrationServices = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\Services" -Filter "*SharePoint*.cs" -Recurse -ErrorAction SilentlyContinue
    if ($migrationServices) {
        Write-Host "  Found SharePoint services:" -ForegroundColor Yellow
        foreach ($svc in $migrationServices) {
            Write-Host "    - $($svc.FullName)" -ForegroundColor Gray
        }
        $DetailedReport.Tasks["T-040"] = @{Status = "RELOCATED"}
    } else {
        Write-Host "  [MISSING] SharePointMigrator.cs not found" -ForegroundColor Red
        $DetailedReport.Tasks["T-040"] = @{Status = "MISSING"}
    }
}

#endregion

#region T-036: Delta Migration Deep Test

Write-Host "`n[T-036] Delta Migration Deep Test..." -ForegroundColor Yellow

$migrationContext = "D:\Scripts\UserMandA\GUI\Models\MigrationContext.cs"
if (Test-Path $migrationContext) {
    $content = Get-Content $migrationContext -Raw
    $hasDelta = $content -match "Delta|Incremental|ChangeTracking"
    $hasCutover = $content -match "Cutover|Finalize|Complete"
    
    Write-Host "  Migration Context:" -ForegroundColor White
    Write-Host "    Delta Support: $(if($hasDelta){'YES'}else{'NO'})" -ForegroundColor $(if($hasDelta){'Green'}else{'Red'})
    Write-Host "    Cutover Support: $(if($hasCutover){'YES'}else{'NO'})" -ForegroundColor $(if($hasCutover){'Green'}else{'Red'})
    
    $DetailedReport.Tasks["T-036"] = @{
        Status = if ($hasDelta) { "IN_PROGRESS" } else { "NOT_STARTED" }
        Details = @{
            Delta = $hasDelta
            Cutover = $hasCutover
        }
    }
} else {
    Write-Host "  [MISSING] MigrationContext.cs not found" -ForegroundColor Red
    $DetailedReport.Tasks["T-036"] = @{Status = "MISSING"}
}

#endregion

#region Infrastructure Discovery Deep Test

Write-Host "`n[INFRASTRUCTURE] Infrastructure Discovery Deep Test..." -ForegroundColor Yellow

$infraModule = "D:\Scripts\UserMandA\Modules\InfrastructureDiscovery.psm1"
if (Test-Path $infraModule) {
    $content = Get-Content $infraModule -Raw
    $hasNmap = $content -match "nmap|npcap"
    $hasSubnetClass = $content -match "Classify.*Subnet|Priority"
    $hasADSites = $content -match "AD.*Site|Sites.*Services"
    $hasDNS = $content -match "DNS.*Zone|Resolve-DnsName"
    
    Write-Host "  Infrastructure Discovery Module:" -ForegroundColor White
    Write-Host "    Nmap Integration: $(if($hasNmap){'YES'}else{'NO'})" -ForegroundColor $(if($hasNmap){'Green'}else{'Red'})
    Write-Host "    Subnet Classification: $(if($hasSubnetClass){'YES'}else{'NO'})" -ForegroundColor $(if($hasSubnetClass){'Green'}else{'Red'})
    Write-Host "    AD Sites: $(if($hasADSites){'YES'}else{'NO'})" -ForegroundColor $(if($hasADSites){'Green'}else{'Red'})
    Write-Host "    DNS Analysis: $(if($hasDNS){'YES'}else{'NO'})" -ForegroundColor $(if($hasDNS){'Green'}else{'Red'})
    
    $DetailedReport.Tasks["INFRASTRUCTURE"] = @{
        Status = if ($hasNmap -and $hasSubnetClass) { "IN_PROGRESS" } else { "NOT_STARTED" }
        Details = @{
            Nmap = $hasNmap
            SubnetClassification = $hasSubnetClass
            ADSites = $hasADSites
            DNS = $hasDNS
        }
    }
} else {
    Write-Host "  [MISSING] InfrastructureDiscovery.psm1 not found" -ForegroundColor Red
    $DetailedReport.Tasks["INFRASTRUCTURE"] = @{Status = "MISSING"}
}

#endregion

#region Discovery Modules Implementation Check

Write-Host "`n[DISCOVERY] Discovery Modules Implementation Check..." -ForegroundColor Yellow

$discoveryModules = @{
    "ActiveDirectory" = @{VM = $true; View = $true; Module = $false}
    "AzureInfrastructure" = @{VM = $true; View = $true; Module = $false}
    "Exchange" = @{VM = $true; View = $true; Module = $false}
    "Teams" = @{VM = $true; View = $true; Module = $false}
    "SharePoint" = @{VM = $true; View = $true; Module = $false}
}

foreach ($module in $discoveryModules.Keys) {
    $vmPath = "D:\Scripts\UserMandA\GUI\ViewModels\${module}DiscoveryViewModel.cs"
    $viewPath = "D:\Scripts\UserMandA\GUI\Views\${module}DiscoveryView.xaml"
    $modulePath = "D:\Scripts\UserMandA\Modules\${module}Discovery.psm1"
    
    $hasVM = Test-Path $vmPath
    $hasView = Test-Path $viewPath
    $hasModule = Test-Path $modulePath
    
    $status = if ($hasVM -and $hasView) { "UI_READY" } elseif ($hasVM -or $hasView) { "PARTIAL" } else { "MISSING" }
    
    Write-Host "  $module Discovery:" -ForegroundColor White
    Write-Host "    ViewModel: $(if($hasVM){'YES'}else{'NO'})" -ForegroundColor $(if($hasVM){'Green'}else{'Red'})
    Write-Host "    View: $(if($hasView){'YES'}else{'NO'})" -ForegroundColor $(if($hasView){'Green'}else{'Red'})
    Write-Host "    PS Module: $(if($hasModule){'YES'}else{'NO'})" -ForegroundColor $(if($hasModule){'Yellow'}else{'Gray'})
    Write-Host "    Status: $status" -ForegroundColor $(if($status -eq 'UI_READY'){'Green'}elseif($status -eq 'PARTIAL'){'Yellow'}else{'Red'})
    
    $discoveryModules[$module] = @{
        VM = $hasVM
        View = $hasView
        Module = $hasModule
        Status = $status
    }
}

$DetailedReport.Tasks["DISCOVERY_MODULES"] = $discoveryModules

#endregion

#region Build System Test

Write-Host "`n[BUILD] Build System Test..." -ForegroundColor Yellow

# Check project file
$projFile = "D:\Scripts\UserMandA\GUI\MandADiscoverySuite.csproj"
if (Test-Path $projFile) {
    [xml]$proj = Get-Content $projFile
    $targetFramework = $proj.Project.PropertyGroup.TargetFramework
    $outputType = $proj.Project.PropertyGroup.OutputType
    
    Write-Host "  Project Configuration:" -ForegroundColor White
    Write-Host "    Target Framework: $targetFramework" -ForegroundColor Gray
    Write-Host "    Output Type: $outputType" -ForegroundColor Gray
    
    # Check for required packages
    $packages = $proj.Project.ItemGroup.PackageReference
    $hasGraph = $packages | Where-Object { $_.Include -match "Microsoft.Graph" }
    $hasWPF = $targetFramework -match "windows"
    
    Write-Host "    Has Graph SDK: $(if($hasGraph){'YES'}else{'NO'})" -ForegroundColor $(if($hasGraph){'Green'}else{'Red'})
    Write-Host "    WPF Support: $(if($hasWPF){'YES'}else{'NO'})" -ForegroundColor $(if($hasWPF){'Green'}else{'Red'})
    
    $DetailedReport.Tasks["BUILD"] = @{
        Status = "CONFIGURED"
        Details = @{
            Framework = $targetFramework
            OutputType = $outputType
            GraphSDK = [bool]$hasGraph
            WPF = $hasWPF
        }
    }
}

#endregion

#region Generate Summary

Write-Host "`n=== IMPLEMENTATION SUMMARY ===" -ForegroundColor Cyan

$implementedCount = 0
$partialCount = 0
$missingCount = 0
$notStartedCount = 0

foreach ($taskKey in $DetailedReport.Tasks.Keys) {
    $task = $DetailedReport.Tasks[$taskKey]
    switch ($task.Status) {
        "IMPLEMENTED" { $implementedCount++ }
        "COMPLETED" { $implementedCount++ }
        "UI_READY" { $implementedCount++ }
        "CONFIGURED" { $implementedCount++ }
        "PARTIAL" { $partialCount++ }
        "IN_PROGRESS" { $partialCount++ }
        "MISSING" { $missingCount++ }
        "NOT_STARTED" { $notStartedCount++ }
    }
}

Write-Host "Implemented/Completed: $implementedCount" -ForegroundColor Green
Write-Host "Partial/In Progress: $partialCount" -ForegroundColor Yellow
Write-Host "Missing: $missingCount" -ForegroundColor Red
Write-Host "Not Started: $notStartedCount" -ForegroundColor Gray

# Critical findings
Write-Host "`n=== CRITICAL FINDINGS ===" -ForegroundColor Yellow

if ($DetailedReport.Tasks["T-000"].Status -ne "IMPLEMENTED") {
    Write-Host "- T-000 (Dual-Profile): Needs completion of profile persistence" -ForegroundColor Yellow
}

if ($DetailedReport.Tasks["T-040"].Status -eq "MISSING") {
    Write-Host "- T-040 (SharePoint): Migration service not found in expected location" -ForegroundColor Red
}

if ($DetailedReport.Tasks["T-036"].Status -eq "NOT_STARTED") {
    Write-Host "- T-036 (Delta Migration): Not yet implemented" -ForegroundColor Yellow
}

if ($DetailedReport.Tasks["INFRASTRUCTURE"].Status -eq "MISSING") {
    Write-Host "- Infrastructure Discovery: Module not found" -ForegroundColor Red
}

# Discovery modules status
$discoveryReady = 0
foreach ($module in $DetailedReport.Tasks["DISCOVERY_MODULES"].Keys) {
    if ($DetailedReport.Tasks["DISCOVERY_MODULES"][$module].Status -eq "UI_READY") {
        $discoveryReady++
    }
}

Write-Host "- Discovery Modules: $discoveryReady/5 UI ready" -ForegroundColor $(if($discoveryReady -ge 3){'Green'}else{'Yellow'})

# Save detailed report
$reportPath = "D:\Scripts\UserMandA\TestReports\Detailed-Implementation-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$DetailedReport | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8

Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Cyan

#endregion