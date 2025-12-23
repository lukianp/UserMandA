# Verify embedded nmap deployment
Write-Host 'Verifying embedded nmap deployment...' -ForegroundColor Yellow

$nmapPath = 'C:\enterprisediscovery\Tools\nmap\nmap.exe'
if (Test-Path $nmapPath) {
    $nmapInfo = Get-Item $nmapPath
    Write-Host "✅ nmap.exe found: $($nmapInfo.Length) bytes" -ForegroundColor Green
    
    Write-Host "`n📁 nmap directory contents:" -ForegroundColor Cyan
    Get-ChildItem 'C:\enterprisediscovery\Tools\nmap\' | Select-Object Name, Length | Format-Table -AutoSize
    
    Write-Host "🔍 Testing nmap executable..." -ForegroundColor Yellow
    try {
        $nmapExe = Get-Item $nmapPath
        if ($nmapExe.Length -gt 1000) {
            # Real binary - test it
            $output = & $nmapPath --version 2>$null
            if ($output) {
                Write-Host "✅ nmap version test successful:" -ForegroundColor Green
                Write-Host $output -ForegroundColor White
            } else {
                Write-Host "⚠️ nmap executed but no version output" -ForegroundColor Yellow
            }
        } else {
            # Development stub - test differently
            Write-Host "📝 Development stub detected - testing stub functionality..." -ForegroundColor Cyan
            $output = & cmd /c "`"$nmapPath`" --version"
            Write-Host "✅ Stub test output:" -ForegroundColor Green
            Write-Host $output -ForegroundColor White
        }
    } catch {
        Write-Host "⚠️ nmap test error: $_" -ForegroundColor Yellow
    }
    
    # Test the InfrastructureDiscovery module integration
    Write-Host "`n🔧 Testing Infrastructure Discovery module nmap integration..." -ForegroundColor Yellow
    $modulePath = 'C:\enterprisediscovery\Modules\Discovery\InfrastructureDiscovery.psm1'
    if (Test-Path $modulePath) {
        try {
            Import-Module $modulePath -Force -ErrorAction SilentlyContinue
            if (Get-Command Install-NmapIfNeeded -ErrorAction SilentlyContinue) {
                $detectedPath = Install-NmapIfNeeded
                if ($detectedPath) {
                    Write-Host "✅ Infrastructure Discovery successfully detects nmap at: $detectedPath" -ForegroundColor Green
                } else {
                    Write-Host "⚠️ Infrastructure Discovery did not detect nmap" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "⚠️ Module test error: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ InfrastructureDiscovery.psm1 not found" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ nmap.exe not found at expected location: $nmapPath" -ForegroundColor Red
    
    Write-Host "`n🔍 Checking Tools directory structure..." -ForegroundColor Yellow
    if (Test-Path 'C:\enterprisediscovery\Tools\') {
        Write-Host "📁 Tools directory contents:" -ForegroundColor Cyan
        Get-ChildItem 'C:\enterprisediscovery\Tools\' -Recurse | Select-Object Name, FullName, Length | Format-Table -AutoSize
    } else {
        Write-Host "❌ Tools directory not found" -ForegroundColor Red
    }
}

Write-Host "`n🎯 nmap deployment verification complete!" -ForegroundColor Green