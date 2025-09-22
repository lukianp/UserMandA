# Simple Domain Discovery Diagnostic Test

Write-Host "=== Domain Discovery Navigation Test ===" -ForegroundColor Cyan

# Test 1: Check if application is running
Write-Host "`n1. Application Status:" -ForegroundColor Green
$process = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "   ✅ Application running (PID: $($process.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Application not running" -ForegroundColor Red
    exit
}

# Test 2: Check ModuleRegistry.json
Write-Host "`n2. ModuleRegistry.json Status:" -ForegroundColor Green
$registryPath = "C:\enterprisediscovery\Configuration\ModuleRegistry.json"
if (Test-Path $registryPath) {
    Write-Host "   ✅ ModuleRegistry.json exists" -ForegroundColor Green
    try {
        $content = Get-Content $registryPath -Raw | ConvertFrom-Json
        Write-Host "   ✅ JSON is valid ($($content.modules.PSObject.Properties.Count) modules)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ JSON parsing failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ ModuleRegistry.json not found" -ForegroundColor Red
}

# Test 3: Check DomainDiscoveryView deployment
Write-Host "`n3. DomainDiscoveryView Deployment:" -ForegroundColor Green
$viewPath = "C:\enterprisediscovery\Views\DomainDiscoveryView.xaml"
if (Test-Path $viewPath) {
    Write-Host "   ✅ DomainDiscoveryView.xaml deployed" -ForegroundColor Green
} else {
    Write-Host "   ❌ DomainDiscoveryView.xaml missing" -ForegroundColor Red
}

# Test 4: Check for recent errors
Write-Host "`n4. Recent Error Check:" -ForegroundColor Green
try {
    $events = Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2} -MaxEvents 5 -ErrorAction SilentlyContinue |
              Where-Object { $_.TimeCreated -gt (Get-Date).AddHours(-1) }

    if ($events) {
        Write-Host "   ⚠️  Found $($events.Count) recent application error(s)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ No recent application errors" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not check event log" -ForegroundColor Yellow
}

Write-Host "`n=== MOST LIKELY ISSUE ===" -ForegroundColor Cyan
Write-Host "Based on the code analysis, the problem is likely:" -ForegroundColor Yellow
Write-Host ""
Write-Host "DomainDiscoveryViewModel constructor is failing when it calls:" -ForegroundColor White
Write-Host "   _moduleRegistryService = ModuleRegistryService.Instance;" -ForegroundColor Red
Write-Host ""
Write-Host "This fails because ModuleRegistryService constructor calls:" -ForegroundColor White
Write-Host "   _rootPath = ConfigurationService.Instance.EnterpriseDiscoveryRootPath;" -ForegroundColor Red
Write-Host ""
Write-Host "ConfigurationService.Instance might not be initialized yet." -ForegroundColor Yellow

Write-Host "`n=== RECOMMENDED FIX ===" -ForegroundColor Cyan
Write-Host "1. Add null checks in ModuleRegistryService constructor" -ForegroundColor Green
Write-Host "2. Use fallback path if ConfigurationService fails" -ForegroundColor Green
Write-Host "3. Add better error handling in DomainDiscoveryViewModel" -ForegroundColor Green

Write-Host "`n=== TO CONFIRM THE ISSUE ===" -ForegroundColor Cyan
Write-Host "1. Navigate to Domain Discovery in the application" -ForegroundColor White
Write-Host "2. Check if it shows MissingViewModel instead of working view" -ForegroundColor White
Write-Host "3. Look for debug output containing 'Failed to initialize ModuleRegistryService'" -ForegroundColor White