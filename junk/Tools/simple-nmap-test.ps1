# Simple test of Infrastructure Discovery with embedded nmap
Write-Host "Testing Infrastructure Discovery with embedded nmap..." -ForegroundColor Green

# Test if the deployed nmap.exe works
$nmapPath = 'C:\enterprisediscovery\Tools\nmap\nmap.exe'
Write-Host "Testing nmap at: $nmapPath" -ForegroundColor Yellow

if (Test-Path $nmapPath) {
    Write-Host "✅ nmap.exe found" -ForegroundColor Green
    
    # Get file info
    $fileInfo = Get-Item $nmapPath
    Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Cyan
    
    # Test nmap version
    try {
        Write-Host "Testing nmap --version..." -ForegroundColor Yellow
        $versionOutput = & $nmapPath --version 2>&1
        Write-Host "✅ nmap version test output:" -ForegroundColor Green
        Write-Host $versionOutput -ForegroundColor White
    } catch {
        Write-Host "⚠️ nmap version test error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Test basic nmap help
    try {
        Write-Host "`nTesting nmap --help..." -ForegroundColor Yellow
        $helpOutput = & $nmapPath --help 2>&1 | Select-Object -First 5
        Write-Host "✅ nmap help output (first 5 lines):" -ForegroundColor Green
        $helpOutput | ForEach-Object { Write-Host $_ -ForegroundColor White }
    } catch {
        Write-Host "⚠️ nmap help test error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ nmap.exe not found at: $nmapPath" -ForegroundColor Red
}

# Test Infrastructure Discovery module loading
Write-Host "`nTesting Infrastructure Discovery module..." -ForegroundColor Yellow
$modulePath = 'C:\enterprisediscovery\Modules\Discovery\InfrastructureDiscovery.psm1'

if (Test-Path $modulePath) {
    Write-Host "✅ Infrastructure Discovery module found" -ForegroundColor Green
    
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "✅ Module imported successfully" -ForegroundColor Green
        
        # Test if Install-NmapIfNeeded function works
        if (Get-Command Install-NmapIfNeeded -ErrorAction SilentlyContinue) {
            Write-Host "Testing Install-NmapIfNeeded function..." -ForegroundColor Yellow
            $detectedNmap = Install-NmapIfNeeded
            if ($detectedNmap) {
                Write-Host "✅ Module detected nmap at: $detectedNmap" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Module did not detect nmap" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "⚠️ Module import error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Infrastructure Discovery module not found at: $modulePath" -ForegroundColor Red
}

Write-Host "`n🎯 Simple nmap test complete!" -ForegroundColor Green