#Requires -Version 5.1

<#
.SYNOPSIS
    Simple Module Registry Test - bypasses complex prerequisites
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('validate', 'health', 'list')]
    [string]$Command,
    [string]$RegistryPath = $env:MANDA_REGISTRY_PATH,
    [string]$ModulesRoot = $env:MANDA_MODULES_ROOT
)

$ErrorActionPreference = 'Stop'

# Set default paths if not provided via parameters or environment variables
if (-not $RegistryPath) {
    $RegistryPath = "C:\EnterpriseDiscovery\Configuration\ModuleRegistry.json"
}
if (-not $ModulesRoot) {
    $ModulesRoot = "C:\EnterpriseDiscovery\Modules"
}

Write-Host "=== M&A Discovery Suite - Simple Registry Test ===" -ForegroundColor Green
Write-Host ""
Write-Host "Registry Path: $RegistryPath" -ForegroundColor Gray
Write-Host "Modules Root: $ModulesRoot" -ForegroundColor Gray
Write-Host ""

try {
    # Test 1: Check if registry exists
    Write-Host "🔍 Checking registry file..." -ForegroundColor Yellow
    if (!(Test-Path $RegistryPath)) {
        Write-Host "❌ Registry file not found at: $RegistryPath" -ForegroundColor Red
        Write-Host "💡 Make sure you've built the application with Build-GUI.ps1" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Registry file found" -ForegroundColor Green
    
    # Test 2: Load registry
    Write-Host ""
    Write-Host "📄 Loading registry..." -ForegroundColor Yellow
    $registry = Get-Content $RegistryPath | ConvertFrom-Json
    $moduleCount = ($registry.modules | Get-Member -MemberType NoteProperty).Count
    Write-Host "✅ Registry loaded successfully" -ForegroundColor Green
    Write-Host "📊 Found $moduleCount modules in registry" -ForegroundColor Cyan
    
    if ($Command -eq "list") {
        Write-Host ""
        Write-Host "📋 Registry Modules:" -ForegroundColor Yellow
        $registry.modules | Get-Member -MemberType NoteProperty | ForEach-Object {
            $moduleName = $_.Name
            $moduleInfo = $registry.modules.$moduleName
            $enabledIcon = if ($moduleInfo.enabled) { "✅" } else { "⚪" }
            $priorityIcon = if ($moduleInfo.priority -le 2) { "🔥" } else { "📝" }
            Write-Host "  $enabledIcon $priorityIcon $($moduleInfo.displayName)" -ForegroundColor White
            Write-Host "    Path: $($moduleInfo.filePath)" -ForegroundColor Gray
        }
        exit 0
    }
    
    # Test 3: Validate critical modules
    Write-Host ""
    Write-Host "🔍 Validating critical modules..." -ForegroundColor Yellow
    
    $criticalModules = @(
        "AzureDiscovery",
        "ExchangeDiscovery", 
        "TeamsDiscovery",
        "ActiveDirectoryDiscovery",
        "NetworkInfrastructureDiscovery",
        "SQLServerDiscovery",
        "FileServerDiscovery"
    )
    
    $validCount = 0
    $totalCount = $criticalModules.Count
    
    foreach ($moduleName in $criticalModules) {
        if ($registry.modules.$moduleName) {
            $filePath = $registry.modules.$moduleName.filePath
            $fullPath = Join-Path $ModulesRoot $filePath
            
            if (Test-Path $fullPath) {
                Write-Host "  ✅ $moduleName" -ForegroundColor Green
                $validCount++
            } else {
                Write-Host "  ❌ $moduleName (file not found: $filePath)" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ $moduleName (not in registry)" -ForegroundColor Red
        }
    }
    
    # Test 4: Summary
    Write-Host ""
    Write-Host "📊 Results Summary:" -ForegroundColor Cyan
    Write-Host "  Registry File: ✅ Present and valid" -ForegroundColor Green
    Write-Host "  Total Modules: $moduleCount" -ForegroundColor White
    Write-Host "  Critical Modules Valid: $validCount/$totalCount" -ForegroundColor $(if($validCount -eq $totalCount){"Green"}else{"Yellow"})
    
    if ($Command -eq "health") {
        # Additional health checks
        Write-Host ""
        Write-Host "🏥 Health Details:" -ForegroundColor Cyan
        
        # Check enabled modules
        $enabledModules = ($registry.modules | Get-Member -MemberType NoteProperty | Where-Object { 
            $registry.modules.$($_.Name).enabled 
        }).Count
        Write-Host "  Enabled Modules: $enabledModules" -ForegroundColor White
        
        # Check high priority modules  
        $highPriorityModules = ($registry.modules | Get-Member -MemberType NoteProperty | Where-Object { 
            $registry.modules.$($_.Name).priority -le 2 
        }).Count
        Write-Host "  High Priority Modules: $highPriorityModules" -ForegroundColor White
        
        # Check registry version
        Write-Host "  Registry Version: $($registry.version)" -ForegroundColor White
        Write-Host "  Last Updated: $($registry.lastUpdated)" -ForegroundColor White
    }
    
    Write-Host ""
    if ($validCount -eq $totalCount) {
        Write-Host "🎉 SUCCESS! Module Registry System is healthy!" -ForegroundColor Green
        Write-Host "   All critical modules are properly mapped and files exist." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️ Some issues detected, but registry system is functional." -ForegroundColor Yellow
        Write-Host "   Consider running a full build to ensure all modules are copied." -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure the application has been built and deployed." -ForegroundColor Yellow
    exit 1
}