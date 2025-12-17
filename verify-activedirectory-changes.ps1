# Verify ActiveDirectoryDiscovery.psm1 changes

$filePath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
$content = Get-Content -Path $filePath -Raw

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ActiveDirectoryDiscovery.psm1 Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allChecks = @()

# Check 1: Get-AuthInfoFromConfiguration extracts credentials
Write-Host "[CHECK 1] Verifying Get-AuthInfoFromConfiguration extracts credentials..." -ForegroundColor Yellow
$check1 = $content -match '\$TenantId = \$Configuration\.TenantId' -and
          $content -match '\$ClientId = \$Configuration\.ClientId' -and
          $content -match '\$ClientSecret = \$Configuration\.ClientSecret'

if ($check1) {
    Write-Host "  [PASS] Function extracts TenantId, ClientId, ClientSecret from Configuration" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "  [FAIL] Function does NOT extract credentials properly" -ForegroundColor Red
    $allChecks += $false
}

# Check 2: Auth info logging
Write-Host "`n[CHECK 2] Verifying authentication logging..." -ForegroundColor Yellow
$check2 = $content -match 'Auth - Using Graph API credentials\. Tenant: \$TenantId, Client: \$ClientId'

if ($check2) {
    Write-Host "  [PASS] Authentication logging is present" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "  [FAIL] Authentication logging is missing" -ForegroundColor Red
    $allChecks += $false
}

# Check 3: Graph authentication in main function
Write-Host "`n[CHECK 3] Verifying Graph API authentication in Invoke-ActiveDirectoryDiscovery..." -ForegroundColor Yellow
$check3 = $content -match 'Get-AuthInfoFromConfiguration -Configuration \$Configuration' -and
          $content -match 'Connect-MgGraph -ClientSecretCredential \$credential -TenantId \$authInfo\.TenantId'

if ($check3) {
    Write-Host "  [PASS] Graph API authentication is implemented" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "  [FAIL] Graph API authentication is missing" -ForegroundColor Red
    $allChecks += $false
}

# Check 4: Credential conversion
Write-Host "`n[CHECK 4] Verifying credential conversion..." -ForegroundColor Yellow
$check4 = $content -match 'ConvertTo-SecureString \$authInfo\.ClientSecret -AsPlainText -Force' -and
          $content -match 'New-Object System\.Management\.Automation\.PSCredential'

if ($check4) {
    Write-Host "  [PASS] Credential conversion is implemented" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "  [FAIL] Credential conversion is missing" -ForegroundColor Red
    $allChecks += $false
}

# Check 5: Metadata tracking
Write-Host "`n[CHECK 5] Verifying metadata tracking..." -ForegroundColor Yellow
$check5 = $content -match "\`$result\.Metadata\['AuthenticationMethod'\] = 'GraphAPI'" -and
          $content -match "\`$result\.Metadata\['TenantId'\] = \`$authInfo\.TenantId"

if ($check5) {
    Write-Host "  [PASS] Metadata tracking is present" -ForegroundColor Green
    $allChecks += $true
} else {
    Write-Host "  [FAIL] Metadata tracking is missing" -ForegroundColor Red
    $allChecks += $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passedChecks = ($allChecks | Where-Object { $_ -eq $true }).Count
$totalChecks = $allChecks.Count

Write-Host "`nPassed: $passedChecks / $totalChecks checks" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { 'Green' } else { 'Yellow' })

if ($passedChecks -eq $totalChecks) {
    Write-Host "`n[SUCCESS] All changes have been applied correctly!" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Some changes are missing or incomplete" -ForegroundColor Yellow
}

Write-Host "`nFile location: $filePath" -ForegroundColor Cyan
Write-Host "Workspace copy: D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1`n" -ForegroundColor Cyan

# Show key code sections
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KEY CODE SECTIONS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[1] Credential Extraction (lines ~54-57):" -ForegroundColor Yellow
$lines = Get-Content -Path $filePath
for ($i = 53; $i -lt 58; $i++) {
    if ($i -lt $lines.Count) {
        Write-Host "  $($i+1): $($lines[$i])"
    }
}

Write-Host "`n[2] Graph Authentication (lines ~145-167):" -ForegroundColor Yellow
for ($i = 144; $i -lt 168; $i++) {
    if ($i -lt $lines.Count) {
        Write-Host "  $($i+1): $($lines[$i])"
    }
}

Write-Host ""
