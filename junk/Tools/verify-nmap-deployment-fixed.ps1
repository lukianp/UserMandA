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
            Write-Host "📝 Real binary detected - testing functionality..." -ForegroundColor Cyan
            $testOutput = & $nmapPath --version 2>&1
            Write-Host "✅ nmap test output:" -ForegroundColor Green
            Write-Host $testOutput -ForegroundColor White
        } else {
            Write-Host "📝 Development stub detected - testing stub functionality..." -ForegroundColor Cyan
            $testOutput = & cmd /c "`"$nmapPath`" --version" 2>&1
            Write-Host "✅ Stub test output:" -ForegroundColor Green  
            Write-Host $testOutput -ForegroundColor White
        }
    } catch {
        Write-Host "⚠️ nmap test error: $_" -ForegroundColor Yellow
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