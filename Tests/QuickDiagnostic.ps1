# Quick Diagnostic Test for MandADiscoverySuite
# Purpose: Fast diagnosis of immediate exit issue

Write-Host "=== MandADiscoverySuite Quick Diagnostic ===" -ForegroundColor Yellow

$issues = @()

# 1. Check executable
$exePath = "C:\enterprisediscovery\MandADiscoverySuite.exe"
if (Test-Path $exePath) {
    $size = (Get-Item $exePath).Length / 1KB
    Write-Host "[OK] Executable found (${size}KB)" -ForegroundColor Green
    if ($size -lt 100) {
        $issues += "Executable suspiciously small"
    }
} else {
    Write-Host "[FAIL] Executable missing!" -ForegroundColor Red
    $issues += "Missing executable"
}

# 2. Check main XAML
$mainXaml = "C:\enterprisediscovery\MandADiscoverySuite.xaml"
if (Test-Path $mainXaml) {
    Write-Host "[OK] Main window XAML found" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Main window XAML missing!" -ForegroundColor Red
    $issues += "Missing main XAML - will cause immediate crash"
}

# 3. Check Resources folder
$resourcesFolder = "C:\enterprisediscovery\Resources"
if (Test-Path $resourcesFolder) {
    Write-Host "[OK] Resources folder found" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Resources folder missing!" -ForegroundColor Red
    $issues += "Missing Resources folder - UI will fail to load"
}

# 4. Check critical XAML files
$criticalXaml = @("Resources\Converters.xaml", "Resources\DataGridTheme.xaml")
$missingXaml = @()

foreach ($xaml in $criticalXaml) {
    if (-not (Test-Path "C:\enterprisediscovery\$xaml")) {
        $missingXaml += $xaml
    }
}

if ($missingXaml.Count -eq 0) {
    Write-Host "[OK] Critical XAML resources found" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Missing $($missingXaml.Count) critical XAML files" -ForegroundColor Red
    $issues += "Missing XAML resources will cause UI crash"
}

# 5. Check System.Text.Json.dll
$jsonDll = "C:\enterprisediscovery\System.Text.Json.dll"
if (Test-Path $jsonDll) {
    Write-Host "[OK] System.Text.Json.dll found" -ForegroundColor Green
} else {
    Write-Host "[FAIL] System.Text.Json.dll missing!" -ForegroundColor Red
    $issues += "Missing System.Text.Json.dll dependency"
}

# 6. Quick runtime test
if ((Test-Path $exePath) -and (Test-Path $mainXaml)) {
    Write-Host "`nTesting application startup..." -ForegroundColor Cyan

    try {
        $app = Start-Process -FilePath $exePath -PassThru -WindowStyle Minimized
        Start-Sleep -Seconds 5

        $process = Get-Process -Id $app.Id -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "[OK] Application started and is running" -ForegroundColor Green
            Stop-Process -Id $app.Id -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "[FAIL] Application exited immediately" -ForegroundColor Red
            $issues += "Application exits immediately after start"
        }
    } catch {
        Write-Host "[FAIL] Could not start application: $_" -ForegroundColor Red
        $issues += "Cannot start application"
    }
}

Write-Host "`n=== DIAGNOSIS ===" -ForegroundColor Yellow

if ($issues.Count -eq 0) {
    Write-Host "✓ No critical issues found - application should work" -ForegroundColor Green
} else {
    Write-Host "✗ Found $($issues.Count) critical issues:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }

    Write-Host "`nSOLUTION:" -ForegroundColor Yellow
    Write-Host "Run Build-GUI.ps1 to rebuild with all resources" -ForegroundColor Cyan
}

# Save results
$result = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    status = if ($issues.Count -eq 0) { "PASS" } else { "FAIL" }
    issues = $issues
}

$result | ConvertTo-Json | Out-File "$PSScriptRoot\quick_diagnostic.json"
Write-Host "`nResults saved to: $PSScriptRoot\quick_diagnostic.json" -ForegroundColor Gray