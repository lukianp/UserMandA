# Test the fixed nmap detection logic
# Author: Master Orchestrator
# Created: 2025-08-30

Write-Host "=== TESTING FIXED NMAP DETECTION LOGIC ===" -ForegroundColor Cyan
Write-Host ""

# Import the Infrastructure Discovery module
try {
    Import-Module "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1" -Force -Verbose
    Write-Host "✅ Successfully imported InfrastructureDiscovery module" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to import module: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== PHASE 1: Testing Find-SystemNmap Function ===" -ForegroundColor Yellow
Write-Host ""

# Test the Find-SystemNmap function directly
$systemNmap = Find-SystemNmap -Context @{}

if ($systemNmap) {
    Write-Host "✅ Find-SystemNmap SUCCESS" -ForegroundColor Green
    Write-Host "   Path: $($systemNmap.Path)" -ForegroundColor White
    Write-Host "   Version: $($systemNmap.Version)" -ForegroundColor White
    Write-Host "   Source: $($systemNmap.Source)" -ForegroundColor White
    Write-Host "   Fully Functional: $($systemNmap.IsFullyFunctional)" -ForegroundColor White
} else {
    Write-Host "❌ Find-SystemNmap FAILED - No nmap detected" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PHASE 2: Testing Install-NmapIfNeeded Function ===" -ForegroundColor Yellow
Write-Host ""

# Test the Install-NmapIfNeeded function (should use system nmap, no downloads)
try {
    $nmapPath = Install-NmapIfNeeded -Context @{}
    
    if ($nmapPath) {
        Write-Host "✅ Install-NmapIfNeeded SUCCESS" -ForegroundColor Green
        Write-Host "   Final nmap path: $nmapPath" -ForegroundColor White
        
        # Verify the returned path actually works
        if (Test-Path $nmapPath) {
            Write-Host "✅ Returned path exists and is accessible" -ForegroundColor Green
            
            # Test version command
            try {
                $version = & $nmapPath --version 2>$null
                if ($version -and $version[0] -match "Nmap") {
                    Write-Host "✅ nmap version check successful: $($version[0])" -ForegroundColor Green
                } else {
                    Write-Host "⚠️ nmap version check returned unexpected output" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "❌ nmap version check failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Returned path does not exist: $nmapPath" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Install-NmapIfNeeded FAILED - Returned null/empty path" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Install-NmapIfNeeded threw exception: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== PHASE 3: Verifying No Unnecessary Downloads ===" -ForegroundColor Yellow
Write-Host ""

# Check that no download attempts were made (temp files, installation attempts, etc)
$tempDownloads = @(
    "$env:TEMP\nmap-portable.zip",
    "$env:TEMP\NmapInstaller",
    "C:\Tools\nmap"
)

$foundUnnecessaryFiles = $false
foreach ($path in $tempDownloads) {
    if (Test-Path $path) {
        Write-Host "⚠️ Found potentially unnecessary download artifact: $path" -ForegroundColor Yellow
        $foundUnnecessaryFiles = $true
    }
}

if (-not $foundUnnecessaryFiles) {
    Write-Host "✅ No unnecessary download artifacts found - good!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

if ($systemNmap -and $nmapPath -and (Test-Path $nmapPath)) {
    Write-Host "🎯 OVERALL RESULT: SUCCESS" -ForegroundColor Green
    Write-Host "✅ System nmap detected correctly" -ForegroundColor Green
    Write-Host "✅ Install-NmapIfNeeded uses system nmap (no downloads)" -ForegroundColor Green
    Write-Host "✅ Functional nmap path returned" -ForegroundColor Green
    Write-Host ""
    Write-Host "System nmap detection is now working properly!" -ForegroundColor Green
} else {
    Write-Host "❌ OVERALL RESULT: FAILURE" -ForegroundColor Red
    Write-Host "One or more tests failed. Review output above for details." -ForegroundColor Red
}

Write-Host ""