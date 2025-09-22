# Test Domain Discovery Navigation - Real-time Debug Capture
# This script will monitor debug output when navigating to domain discovery

# Function to capture debug output from the running application
function Test-DomainDiscoveryNavigation {
    Write-Host "=== Domain Discovery Navigation Test ===" -ForegroundColor Cyan
    Write-Host "Application Process ID: 4004" -ForegroundColor Green

    # Check if process is running
    $process = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "✅ Application is running (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "   Memory: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
        Write-Host "   Start Time: $($process.StartTime)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Application is not running" -ForegroundColor Red
        return
    }

    # Check ModuleRegistry.json path resolution
    Write-Host "`n=== ModuleRegistry.json Path Analysis ===" -ForegroundColor Cyan

    # Simulate the path resolution logic from ModuleRegistryService
    $assemblyLocation = "C:\enterprisediscovery\MandADiscoverySuite.exe"
    $expectedPath = Join-Path (Split-Path $assemblyLocation) "Configuration\ModuleRegistry.json"

    Write-Host "Expected ModuleRegistry.json path: $expectedPath" -ForegroundColor Yellow

    if (Test-Path $expectedPath) {
        Write-Host "✅ ModuleRegistry.json exists at expected location" -ForegroundColor Green
        $fileInfo = Get-Item $expectedPath
        Write-Host "   Size: $($fileInfo.Length) bytes" -ForegroundColor Gray
        Write-Host "   Last Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    } else {
        Write-Host "❌ ModuleRegistry.json NOT FOUND at expected location" -ForegroundColor Red
    }

    # Check for any ModuleRegistry.json files in the application directory
    Write-Host "`n=== Searching for ModuleRegistry.json files ===" -ForegroundColor Cyan
    $registryFiles = Get-ChildItem -Path "C:\enterprisediscovery" -Name "ModuleRegistry.json" -Recurse -ErrorAction SilentlyContinue

    if ($registryFiles) {
        Write-Host "Found ModuleRegistry.json files:" -ForegroundColor Green
        foreach ($file in $registryFiles) {
            $fullPath = Join-Path "C:\enterprisediscovery" $file
            Write-Host "  📄 $fullPath" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ No ModuleRegistry.json files found in C:\enterprisediscovery" -ForegroundColor Red
    }

    # Check ViewRegistry registration for domaindiscovery
    Write-Host "`n=== ViewRegistry Analysis ===" -ForegroundColor Cyan
    Write-Host "Navigation key: 'domaindiscovery'" -ForegroundColor Yellow
    Write-Host "Expected mapping: () => new DomainDiscoveryView()" -ForegroundColor Yellow
    Write-Host "Location: D:\Scripts\UserMandA\GUI\Services\ViewRegistry.cs line 35" -ForegroundColor Gray

    # Check if DomainDiscoveryView.xaml exists in deployed location
    $domainViewPath = "C:\enterprisediscovery\Views\DomainDiscoveryView.xaml"
    if (Test-Path $domainViewPath) {
        Write-Host "✅ DomainDiscoveryView.xaml exists in deployment" -ForegroundColor Green
    } else {
        Write-Host "❌ DomainDiscoveryView.xaml NOT FOUND in deployment" -ForegroundColor Red
    }

    Write-Host "`n=== Recent Windows Event Log Errors ===" -ForegroundColor Cyan
    try {
        $events = Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2} -MaxEvents 10 -ErrorAction SilentlyContinue |
                  Where-Object { $_.TimeCreated -gt (Get-Date).AddHours(-1) -and $_.Message -like "*MandADiscoverySuite*" }

        if ($events) {
            Write-Host "Found recent application errors:" -ForegroundColor Red
            foreach ($event in $events) {
                Write-Host "  ⚠️  [$($event.TimeCreated)] $($event.Message.Substring(0, [Math]::Min(100, $event.Message.Length)))..." -ForegroundColor Red
            }
        } else {
            Write-Host "✅ No recent application errors found" -ForegroundColor Green
        }
    } catch {
        Write-Host "Could not access Windows Event Log" -ForegroundColor Yellow
    }

    Write-Host "`n=== Debug Output Instructions ===" -ForegroundColor Cyan
    Write-Host "To capture real-time debug output:" -ForegroundColor Yellow
    Write-Host "1. Navigate to Domain Discovery in the application" -ForegroundColor White
    Write-Host "2. Watch for console output from ViewRegistry.cs" -ForegroundColor White
    Write-Host "3. Look for errors in DomainDiscoveryView constructor" -ForegroundColor White
    Write-Host "4. Check if ModuleRegistryService path resolution fails" -ForegroundColor White

    Write-Host "`n=== Expected Debug Messages ===" -ForegroundColor Cyan
    Write-Host "✅ [ViewRegistry] CreateView called with key: 'domaindiscovery'" -ForegroundColor Green
    Write-Host "✅ [ViewRegistry] Creating view for key 'domaindiscovery'" -ForegroundColor Green
    Write-Host "✅ DomainDiscoveryView: Creating CsvDataServiceNew..." -ForegroundColor Green
    Write-Host "✅ DomainDiscoveryView: Creating DomainDiscoveryViewModel..." -ForegroundColor Green
    Write-Host "✅ [ViewRegistry] Successfully created view for key 'domaindiscovery'" -ForegroundColor Green

    Write-Host "`n=== If Domain Discovery is Failing ===" -ForegroundColor Cyan
    Write-Host "Expected error messages:" -ForegroundColor Yellow
    Write-Host "❌ Error creating DomainDiscoveryView: [Exception Details]" -ForegroundColor Red
    Write-Host "❌ [ViewRegistry] Error creating view for key 'domaindiscovery'" -ForegroundColor Red
    Write-Host "❌ [ViewRegistry] No view registered for key 'domaindiscovery' - returning MissingView fallback" -ForegroundColor Red
}

# Execute the test
Test-DomainDiscoveryNavigation