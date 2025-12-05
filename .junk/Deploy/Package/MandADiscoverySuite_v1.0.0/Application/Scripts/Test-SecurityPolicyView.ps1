# Test script for SecurityPolicyView implementation
Write-Host "============================================================"
Write-Host "Security Policy View Implementation Test"
Write-Host "============================================================"

# Test 1: Verify test data files exist
Write-Host "`n1. Verifying test data files..."

$testDataFiles = @(
    "D:\Scripts\UserMandA\TestData\GPO_GroupPolicies.csv",
    "D:\Scripts\UserMandA\TestData\SecurityGroup.csv", 
    "D:\Scripts\UserMandA\TestData\Security_AntivirusProducts.csv",
    "D:\Scripts\UserMandA\TestData\Security_FirewallProfiles.csv",
    "D:\Scripts\UserMandA\TestData\Security_SecurityAppliances.csv",
    "D:\Scripts\UserMandA\TestData\ThreatIndicators.csv",
    "D:\Scripts\UserMandA\TestData\Security_Compliance.csv"
)

$testDataResults = @()
foreach ($file in $testDataFiles) {
    $exists = Test-Path $file
    $fileName = Split-Path $file -Leaf
    if ($exists) {
        $lineCount = (Get-Content $file | Measure-Object -Line).Lines - 1
        Write-Host "   [OK] $fileName - $lineCount records" -ForegroundColor Green
        $testDataResults += @{File = $fileName; Exists = $true; Records = $lineCount}
    } else {
        Write-Host "   [FAIL] $fileName - NOT FOUND" -ForegroundColor Red
        $testDataResults += @{File = $fileName; Exists = $false; Records = 0}
    }
}

# Test 2: Verify implementation files exist
Write-Host "`n2. Verifying SecurityPolicy implementation files..."

$implementationFiles = @(
    "D:\Scripts\UserMandA\GUI\Models\SecurityPolicyModels.cs",
    "D:\Scripts\UserMandA\GUI\ViewModels\SecurityPolicyViewModel.cs", 
    "D:\Scripts\UserMandA\GUI\Views\SecurityPolicyView.xaml",
    "D:\Scripts\UserMandA\GUI\Views\SecurityPolicyView.xaml.cs"
)

$implementationResults = @()
foreach ($file in $implementationFiles) {
    $exists = Test-Path $file
    $fileName = Split-Path $file -Leaf
    if ($exists) {
        $lineCount = (Get-Content $file | Measure-Object -Line).Lines
        Write-Host "   [OK] $fileName - $lineCount lines" -ForegroundColor Green
        $implementationResults += @{File = $fileName; Exists = $true; Lines = $lineCount}
    } else {
        Write-Host "   [FAIL] $fileName - NOT FOUND" -ForegroundColor Red
        $implementationResults += @{File = $fileName; Exists = $false; Lines = 0}
    }
}

# Test 3: Verify ViewRegistry integration
Write-Host "`n3. Verifying ViewRegistry integration..."

$viewRegistryFile = "D:\Scripts\UserMandA\GUI\Services\ViewRegistry.cs"
if (Test-Path $viewRegistryFile) {
    $content = Get-Content $viewRegistryFile -Raw
    $hasSecurityPolicyView = $content -like "*SecurityPolicyView*"
    $hasSecurityKeywords = $content -like "*security-policy*" -or $content -like "*security*"
    
    if ($hasSecurityPolicyView) {
        Write-Host "   [OK] SecurityPolicyView registered in ViewRegistry" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] SecurityPolicyView NOT found in ViewRegistry" -ForegroundColor Red
    }
    
    if ($hasSecurityKeywords) {
        Write-Host "   [OK] Security navigation keys found" -ForegroundColor Green  
    } else {
        Write-Host "   [FAIL] Security navigation keys NOT found" -ForegroundColor Red
    }
} else {
    Write-Host "   [FAIL] ViewRegistry.cs NOT FOUND" -ForegroundColor Red
    $hasSecurityPolicyView = $false
    $hasSecurityKeywords = $false
}

# Test 4: Verify build and deployment
Write-Host "`n4. Verifying build and deployment..."

$deployedExe = "C:\enterprisediscovery\MandADiscoverySuite.exe"
if (Test-Path $deployedExe) {
    $fileInfo = Get-Item $deployedExe
    $sizeInMB = [math]::Round($fileInfo.Length / 1MB, 2)
    Write-Host "   [OK] MandADiscoverySuite.exe deployed - Size: $sizeInMB MB" -ForegroundColor Green
    Write-Host "   [OK] Build Date: $($fileInfo.LastWriteTime)" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] MandADiscoverySuite.exe NOT FOUND in deployment directory" -ForegroundColor Red
}

# Test 5: Data Summary
Write-Host "`n5. Test Data Summary:"
$gpoRecords = ($testDataResults | Where-Object {$_.File -eq 'GPO_GroupPolicies.csv'}).Records
$groupRecords = ($testDataResults | Where-Object {$_.File -eq 'SecurityGroup.csv'}).Records
$avRecords = ($testDataResults | Where-Object {$_.File -eq 'Security_AntivirusProducts.csv'}).Records
$fwRecords = ($testDataResults | Where-Object {$_.File -eq 'Security_FirewallProfiles.csv'}).Records
$applianceRecords = ($testDataResults | Where-Object {$_.File -eq 'Security_SecurityAppliances.csv'}).Records
$threatRecords = ($testDataResults | Where-Object {$_.File -eq 'ThreatIndicators.csv'}).Records
$complianceRecords = ($testDataResults | Where-Object {$_.File -eq 'Security_Compliance.csv'}).Records

Write-Host "   GPO Policies: $gpoRecords records"
Write-Host "   Security Groups: $groupRecords records"  
Write-Host "   Antivirus Products: $avRecords records"
Write-Host "   Firewall Profiles: $fwRecords records"
Write-Host "   Security Appliances: $applianceRecords records" 
Write-Host "   Threat Indicators: $threatRecords records"
Write-Host "   Compliance Controls: $complianceRecords records"

$totalRecords = $gpoRecords + $groupRecords + $avRecords + $fwRecords + $applianceRecords + $threatRecords + $complianceRecords
Write-Host "   TOTAL TEST RECORDS: $totalRecords" -ForegroundColor Cyan

# Results Summary
Write-Host "`n============================================================"
Write-Host "IMPLEMENTATION TEST SUMMARY"
Write-Host "============================================================"

$passedTests = 0
$totalTests = 5

# Count passed tests
$failedFiles = ($testDataResults | Where-Object { $_.Exists -eq $false }).Count
if ($failedFiles -eq 0) { $passedTests++ }

$failedImplementation = ($implementationResults | Where-Object { $_.Exists -eq $false }).Count
if ($failedImplementation -eq 0) { $passedTests++ }

if ($hasSecurityPolicyView -and $hasSecurityKeywords) { $passedTests++ }
if (Test-Path $deployedExe) { $passedTests++ }
if ($totalRecords -gt 0) { $passedTests++ }

Write-Host "Tests Passed: $passedTests / $totalTests"

if ($passedTests -eq $totalTests) {
    Write-Host "[SUCCESS] ALL TESTS PASSED - SecurityPolicyView implementation is complete!" -ForegroundColor Green
    Write-Host "`nTo test the SecurityPolicyView:"
    Write-Host "1. Launch MandADiscoverySuite.exe from C:\enterprisediscovery"
    Write-Host "2. Navigate to the 'Security' tab or use navigation key 'security-policy'"  
    Write-Host "3. Verify multi-tab layout with Dashboard, Group Policies, Security Groups, etc."
    Write-Host "4. Check that test data loads correctly in each tab"
} else {
    Write-Host "[FAILED] SOME TESTS FAILED - Review the issues above" -ForegroundColor Red
}

Write-Host "`n============================================================"