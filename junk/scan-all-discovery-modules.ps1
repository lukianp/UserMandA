# Scan All Discovery Modules for Credential Handling

Write-Host "=== SCANNING ALL DISCOVERY MODULES FOR CREDENTIAL HANDLING ===" -ForegroundColor Cyan
Write-Host ""

$modulesPath = "D:\Scripts\UserMandA\Modules\Discovery"
$allModules = Get-ChildItem "$modulesPath\*.psm1" | Where-Object {
    $_.Name -notmatch "^(DiscoveryBase|DiscoveryModuleBase|ConcurrentDiscoveryEngine|RealTimeDiscoveryEngine)\.psm1$"
} | Sort-Object Name

$results = @()

foreach ($module in $allModules) {
    $moduleName = $module.Name
    $content = Get-Content $module.FullName -Raw

    $hasConfigParam = $content -match 'param\s*\(\s*.*\[Parameter.*\]\s*\[hashtable\]\s*\$Configuration'
    $extractsTenantId = $content -match '\$TenantId\s*=\s*\$Configuration\.TenantId'
    $extractsClientId = $content -match '\$ClientId\s*=\s*\$Configuration\.ClientId'
    $extractsClientSecret = $content -match '\$ClientSecret\s*=\s*\$Configuration\.ClientSecret'
    $hasCredentialValidation = $content -match '(Missing required credentials|Missing credentials)'
    $hasCredentialLogging = $content -match '(Credential|TenantId|ClientId).*present'
    $connectsToGraph = $content -match '(Connect-MgGraph|Get-MgContext|Connect-Graph)'
    $usesAuthService = $content -match '(Get-AuthenticationForService|AuthenticationService)'

    $needsCredentials = $connectsToGraph -or $usesAuthService

    $status = if (-not $needsCredentials) {
        "N/A (No auth needed)"
    } elseif ($extractsTenantId -and $extractsClientId -and $extractsClientSecret -and $hasCredentialValidation) {
        "OK"
    } elseif ($extractsTenantId -or $extractsClientId -or $extractsClientSecret) {
        "PARTIAL"
    } else {
        "MISSING"
    }

    $results += [PSCustomObject]@{
        Module = $moduleName
        Status = $status
        ExtractsTenantId = $extractsTenantId
        ExtractsClientId = $extractsClientId
        ExtractsClientSecret = $extractsClientSecret
        HasValidation = $hasCredentialValidation
        HasLogging = $hasCredentialLogging
        NeedsAuth = $needsCredentials
    }
}

# Display results by status
Write-Host "=== MODULES WITH PROPER CREDENTIAL HANDLING (OK) ===" -ForegroundColor Green
$okModules = $results | Where-Object { $_.Status -eq "OK" }
foreach ($m in $okModules) {
    Write-Host "  ✓ $($m.Module)" -ForegroundColor Green
}
Write-Host "Count: $($okModules.Count)" -ForegroundColor Green
Write-Host ""

Write-Host "=== MODULES WITH PARTIAL CREDENTIAL HANDLING (PARTIAL) ===" -ForegroundColor Yellow
$partialModules = $results | Where-Object { $_.Status -eq "PARTIAL" }
foreach ($m in $partialModules) {
    $missing = @()
    if (-not $m.ExtractsTenantId) { $missing += "TenantId" }
    if (-not $m.ExtractsClientId) { $missing += "ClientId" }
    if (-not $m.ExtractsClientSecret) { $missing += "ClientSecret" }
    if (-not $m.HasValidation) { $missing += "Validation" }

    Write-Host "  ! $($m.Module) - Missing: $($missing -join ', ')" -ForegroundColor Yellow
}
Write-Host "Count: $($partialModules.Count)" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== MODULES MISSING CREDENTIAL HANDLING (NEEDS FIX) ===" -ForegroundColor Red
$missingModules = $results | Where-Object { $_.Status -eq "MISSING" -and $_.NeedsAuth }
foreach ($m in $missingModules) {
    Write-Host "  ✗ $($m.Module)" -ForegroundColor Red
}
Write-Host "Count: $($missingModules.Count)" -ForegroundColor Red
Write-Host ""

Write-Host "=== MODULES THAT DO NOT NEED CREDENTIALS (N/A) ===" -ForegroundColor Gray
$naModules = $results | Where-Object { $_.Status -eq "N/A (No auth needed)" }
foreach ($m in $naModules) {
    Write-Host "  - $($m.Module)" -ForegroundColor Gray
}
Write-Host "Count: $($naModules.Count)" -ForegroundColor Gray
Write-Host ""

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total modules scanned: $($results.Count)"
Write-Host "  ✓ OK: $($okModules.Count)" -ForegroundColor Green
Write-Host "  ! Partial: $($partialModules.Count)" -ForegroundColor Yellow
Write-Host "  ✗ Missing: $($missingModules.Count)" -ForegroundColor Red
Write-Host "  - N/A: $($naModules.Count)" -ForegroundColor Gray
Write-Host ""

# Export detailed results
$results | Export-Csv "D:\Scripts\UserMandA\module-credential-scan-results.csv" -NoTypeInformation
Write-Host "Detailed results exported to: module-credential-scan-results.csv" -ForegroundColor Cyan

# Return modules that need fixing
return $missingModules + $partialModules
