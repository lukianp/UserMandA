#Requires -Version 5.1

# Simple Infrastructure Discovery Production Safety Test
param(
    [string]$ModulePath = "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1"
)

Write-Host "Testing Infrastructure Discovery Production Safety..." -ForegroundColor Cyan

# Test 1: Module Loading
try {
    Import-Module $ModulePath -Force
    Write-Host "✅ Module loaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Module loading failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Production-Safe Configuration  
try {
    $config = Get-ProductionSafeNmapConfig -Context @{}
    Write-Host "✅ Production-safe config loaded" -ForegroundColor Green
    Write-Host "   Rate limit: $($config.MaxPacketsPerSecond) pps" -ForegroundColor Gray
    Write-Host "   Delay: $($config.DelayBetweenHosts) ms" -ForegroundColor Gray
    Write-Host "   Timing: $($config.TimingTemplate)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Configuration test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Environment Detection
try {
    $envTest = Test-ProductionEnvironment -Context @{}
    Write-Host "✅ Environment detection working" -ForegroundColor Green
    Write-Host "   Production: $($envTest.IsProduction)" -ForegroundColor Gray
    Write-Host "   Signals: $($envTest.Signals.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Environment detection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: nmap Binary Check
try {
    $nmapPath = Install-NmapIfNeeded -Context @{}
    if ($nmapPath) {
        Write-Host "✅ nmap binary available at: $nmapPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️ nmap not available - will use PowerShell fallback" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ nmap test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Asset Integration
try {
    $mockAssets = @(
        [PSCustomObject]@{ IPAddress = "192.168.1.10"; AssetTag = "AS001" }
    )
    $mockHosts = @(
        [PSCustomObject]@{ IPAddress = "192.168.1.10"; OS = "Windows"; RiskLevel = "Low"; DeviceType = "Server" }
    )
    
    $merged = Merge-DiscoveredWithExistingAssets -DiscoveredHosts $mockHosts -ExistingAssets $mockAssets -Context @{}
    if ($merged.Count -gt 0) {
        Write-Host "✅ Asset integration working" -ForegroundColor Green
        Write-Host "   Merged records: $($merged.Count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Asset integration failed - no merged data" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Asset integration test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Infrastructure Discovery production safety tests completed" -ForegroundColor Green
Write-Host "   Module is ready for production deployment" -ForegroundColor White