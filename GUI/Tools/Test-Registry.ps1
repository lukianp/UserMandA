param(
    [string]$Command = "validate"
)

Write-Host "=== Module Registry Test ===" -ForegroundColor Green
Write-Host ""

$RegistryPath = "C:\EnterpriseDiscovery\Configuration\ModuleRegistry.json"
$ModulesRoot = "C:\EnterpriseDiscovery\Modules"

# Test 1: Check registry file
Write-Host "Checking registry file..." -ForegroundColor Yellow
if (!(Test-Path $RegistryPath)) {
    Write-Host "ERROR: Registry file not found at $RegistryPath" -ForegroundColor Red
    Write-Host "Run Build-GUI.ps1 first to deploy the application" -ForegroundColor Yellow
    exit 1
}
Write-Host "OK: Registry file found" -ForegroundColor Green

# Test 2: Load registry
Write-Host ""
Write-Host "Loading registry..." -ForegroundColor Yellow
try {
    $registry = Get-Content $RegistryPath | ConvertFrom-Json
    $moduleNames = $registry.modules | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    $moduleCount = $moduleNames.Count
    Write-Host "OK: Registry loaded with $moduleCount modules" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Failed to load registry - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check critical modules
Write-Host ""
Write-Host "Validating critical modules..." -ForegroundColor Yellow

$criticalModules = @(
    "AzureDiscovery",
    "ExchangeDiscovery", 
    "TeamsDiscovery",
    "ActiveDirectoryDiscovery"
)

$validCount = 0
foreach ($moduleName in $criticalModules) {
    if ($registry.modules.$moduleName) {
        $filePath = $registry.modules.$moduleName.filePath
        $fullPath = Join-Path $ModulesRoot $filePath
        
        if (Test-Path $fullPath) {
            Write-Host "  OK: $moduleName -> $filePath" -ForegroundColor Green
            $validCount++
        } else {
            Write-Host "  ERROR: $moduleName file not found at $filePath" -ForegroundColor Red
        }
    } else {
        Write-Host "  ERROR: $moduleName not in registry" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Registry File: OK" -ForegroundColor Green
Write-Host "Total Modules: $moduleCount" -ForegroundColor White
Write-Host "Critical Modules Valid: $validCount/$($criticalModules.Count)" -ForegroundColor Green

if ($validCount -eq $criticalModules.Count) {
    Write-Host ""
    Write-Host "SUCCESS: Module registry system is working!" -ForegroundColor Green
    Write-Host "All critical modules are properly mapped to files." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "WARNING: Some modules have issues." -ForegroundColor Yellow
    Write-Host "The registry system is functional but may need attention." -ForegroundColor Yellow
}

if ($Command -eq "list") {
    Write-Host ""
    Write-Host "=== ALL MODULES ===" -ForegroundColor Cyan
    foreach ($moduleName in $moduleNames) {
        $moduleInfo = $registry.modules.$moduleName
        $enabled = if ($moduleInfo.enabled) { "ENABLED" } else { "DISABLED" }
        Write-Host "$moduleName - $($moduleInfo.displayName) [$enabled]" -ForegroundColor White
    }
}