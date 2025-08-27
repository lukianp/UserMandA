Write-Host "Discovery Module Verification" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Read ModuleRegistry.json
$registryPath = "D:\Scripts\UserMandA\GUI\Configuration\ModuleRegistry.json"
if (-not (Test-Path $registryPath)) {
    Write-Host "[ERROR] ModuleRegistry.json not found at: $registryPath" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Reading ModuleRegistry.json..." -ForegroundColor Green

try {
    $registry = Get-Content $registryPath | ConvertFrom-Json
    $modules = $registry.modules.PSObject.Properties
    
    Write-Host "`nTotal modules in registry: $($modules.Count)" -ForegroundColor White
    
    # Filter for Discovery modules (filePath starts with "Discovery/")
    $discoveryModules = $modules | Where-Object { $_.Value.filePath -like "Discovery/*" }
    
    Write-Host "Discovery modules found: $($discoveryModules.Count)" -ForegroundColor Green
    Write-Host ""
    
    $enabledCount = 0
    $disabledCount = 0
    
    foreach ($module in $discoveryModules) {
        $name = $module.Name
        $info = $module.Value
        $enabled = if ($info.enabled) { $enabledCount++; "[ENABLED]" } else { $disabledCount++; "[DISABLED]" }
        $icon = if ($info.icon) { $info.icon } else { "[SEARCH]" }
        
        Write-Host "$icon $name" -ForegroundColor White
        Write-Host "   Display: $($info.displayName)" -ForegroundColor Gray
        Write-Host "   Status: $enabled" -ForegroundColor $(if ($info.enabled) { "Green" } else { "Red" })
        Write-Host "   Category: $($info.category)" -ForegroundColor Gray
        Write-Host "   File: $($info.filePath)" -ForegroundColor Gray
        
        # Check if module file exists
        $modulePath = "D:\Scripts\UserMandA\Modules\$($info.filePath)"
        if (Test-Path $modulePath) {
            Write-Host "   Module File: [EXISTS]" -ForegroundColor Green
        } else {
            Write-Host "   Module File: [MISSING] at $modulePath" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Enabled modules: $enabledCount" -ForegroundColor Green
    Write-Host "  Disabled modules: $disabledCount" -ForegroundColor Yellow
    Write-Host "  Total Discovery modules: $($discoveryModules.Count)" -ForegroundColor White
    
    # Check launcher script
    $launcherPath = "D:\Scripts\UserMandA\Scripts\DiscoveryModuleLauncher.ps1"
    if (Test-Path $launcherPath) {
        Write-Host "  Launcher script: [EXISTS]" -ForegroundColor Green
    } else {
        Write-Host "  Launcher script: [MISSING] at $launcherPath" -ForegroundColor Red
    }
    
} catch {
    Write-Host "[ERROR] Failed to parse ModuleRegistry.json: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nVerification complete!" -ForegroundColor Green