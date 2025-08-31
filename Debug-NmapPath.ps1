# Debug nmap path detection issues
# Author: Master Orchestrator

Write-Host "=== DEBUGGING NMAP PATH DETECTION ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if nmap is in PATH
Write-Host "1. Testing Get-Command nmap:" -ForegroundColor Yellow
try {
    $nmapCommand = Get-Command nmap -ErrorAction Stop
    Write-Host "✅ Found nmap in PATH: $($nmapCommand.Source)" -ForegroundColor Green
    
    # Test the version
    Write-Host "   Testing version command:" -ForegroundColor White
    try {
        $versionOutput = & $nmapCommand.Source --version 2>$null
        if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
            Write-Host "   ✅ Version test successful: v$($matches[1])" -ForegroundColor Green
            Write-Host "   Full version output: $($versionOutput[0])" -ForegroundColor White
        } else {
            Write-Host "   ⚠️ Version test failed - unexpected output" -ForegroundColor Yellow
            Write-Host "   Output: $versionOutput" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Version test threw exception: $($_.Exception.Message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ nmap not found in PATH: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check standard installation paths
Write-Host "2. Testing standard installation paths:" -ForegroundColor Yellow

$systemPaths = @(
    "${env:ProgramFiles}\Nmap\nmap.exe",
    "${env:ProgramFiles(x86)}\Nmap\nmap.exe",
    "C:\Program Files\Nmap\nmap.exe", 
    "C:\Program Files (x86)\Nmap\nmap.exe"
)

foreach ($path in $systemPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found nmap at: $path" -ForegroundColor Green
        
        # Test version
        try {
            $versionOutput = & $path --version 2>$null
            if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
                Write-Host "   ✅ Version: v$($matches[1])" -ForegroundColor Green
                Write-Host "   Full output: $($versionOutput[0])" -ForegroundColor White
            } else {
                Write-Host "   ⚠️ Version test failed" -ForegroundColor Yellow
                Write-Host "   Output: $versionOutput" -ForegroundColor White
            }
        } catch {
            Write-Host "   ❌ Version test exception: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Not found: $path" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Check environment variables
Write-Host "3. Environment variable diagnostics:" -ForegroundColor Yellow
Write-Host "   ProgramFiles: $env:ProgramFiles" -ForegroundColor White
Write-Host "   ProgramFiles(x86): ${env:ProgramFiles(x86)}" -ForegroundColor White

Write-Host ""

# Test 4: Direct test of known working path
Write-Host "4. Direct test of known working path:" -ForegroundColor Yellow
$knownPath = "C:\Program Files (x86)\Nmap\nmap.exe"
if (Test-Path $knownPath) {
    Write-Host "✅ Confirmed nmap exists at: $knownPath" -ForegroundColor Green
    
    try {
        $versionOutput = & $knownPath --version 2>$null
        Write-Host "   Version output:" -ForegroundColor White
        $versionOutput | ForEach-Object { Write-Host "     $_" -ForegroundColor White }
        
        if ($versionOutput -and ($versionOutput[0] -match "Nmap version (\d+\.\d+)")) {
            Write-Host "   ✅ Regex match successful: v$($matches[1])" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Regex match failed" -ForegroundColor Red
            Write-Host "   Pattern: 'Nmap version (\d+\.\d+)'" -ForegroundColor White
            Write-Host "   First line: '$($versionOutput[0])'" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Direct test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Known path does not exist: $knownPath" -ForegroundColor Red
}

Write-Host ""