# Comprehensive PowerShell Script Syntax Validation
Write-Host "=== Comprehensive PowerShell Script Syntax Validation ===" -ForegroundColor Cyan
Write-Host ""

# Define script directories to check
$scriptDirectories = @(
    @{Name="Core"; Path="Core"},
    @{Name="Scripts"; Path="Scripts"},
    @{Name="Root"; Path="."}
)

$totalPassed = 0
$totalFailed = 0
$allFailedScripts = @()
$allScripts = @()

foreach ($directory in $scriptDirectories) {
    Write-Host "=== $($directory.Name) Scripts ===" -ForegroundColor Yellow
    
    if (-not (Test-Path $directory.Path)) {
        Write-Host "Directory not found: $($directory.Path)" -ForegroundColor Red
        continue
    }
    
    # Get all .ps1 files in the directory
    $scripts = Get-ChildItem "$($directory.Path)/*.ps1" -ErrorAction SilentlyContinue
    
    if ($scripts.Count -eq 0) {
        Write-Host "No .ps1 files found in $($directory.Path)" -ForegroundColor Yellow
        Write-Host ""
        continue
    }
    
    $passed = 0
    $failed = 0
    $failedScripts = @()
    
    foreach ($script in $scripts) {
        Write-Host "Testing $($script.Name)..." -NoNewline
        
        # Add to all scripts list
        $scriptInfo = [PSCustomObject]@{
            Category = $directory.Name
            Name = $script.BaseName
            FullName = $script.Name
            Path = $script.FullName
            Passed = $false
            Error = ""
        }
        
        try {
            $content = Get-Content $script.FullName -Raw -ErrorAction Stop
            
            # Skip empty files
            if ([string]::IsNullOrWhiteSpace($content)) {
                Write-Host " EMPTY" -ForegroundColor Yellow
                $scriptInfo.Passed = $true
                $scriptInfo.Error = "Empty file"
                $passed++
            } else {
                # Parse the script
                $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$null)
                Write-Host " PASS" -ForegroundColor Green
                $scriptInfo.Passed = $true
                $passed++
            }
        } catch {
            Write-Host " FAIL" -ForegroundColor Red
            $errorMessage = $_.Exception.Message
            Write-Host "  Error: $errorMessage" -ForegroundColor Red
            $scriptInfo.Error = $errorMessage
            $failed++
            $failedScripts += "$($directory.Name)/$($script.Name)"
        }
        
        $allScripts += $scriptInfo
    }
    
    Write-Host "Summary: $passed passed, $failed failed" -ForegroundColor Cyan
    Write-Host ""
    
    $totalPassed += $passed
    $totalFailed += $failed
    $allFailedScripts += $failedScripts
}

# Detailed results by category
Write-Host ""
Write-Host "=== DETAILED RESULTS BY CATEGORY ===" -ForegroundColor Cyan

foreach ($directory in $scriptDirectories) {
    $categoryScripts = $allScripts | Where-Object { $_.Category -eq $directory.Name }
    if ($categoryScripts.Count -eq 0) { continue }
    
    Write-Host ""
    Write-Host "=== $($directory.Name) Scripts ===" -ForegroundColor Yellow
    
    $passed = $categoryScripts | Where-Object { $_.Passed }
    $failed = $categoryScripts | Where-Object { -not $_.Passed }
    
    if ($passed.Count -gt 0) {
        Write-Host "PASSED ($($passed.Count)):" -ForegroundColor Green
        foreach ($script in $passed | Sort-Object Name) {
            $status = if ($script.Error -eq "Empty file") { " (empty)" } else { "" }
            Write-Host "  + $($script.FullName)$status" -ForegroundColor Green
        }
    }
    
    if ($failed.Count -gt 0) {
        Write-Host "FAILED ($($failed.Count)):" -ForegroundColor Red
        foreach ($script in $failed | Sort-Object Name) {
            Write-Host "  - $($script.FullName)" -ForegroundColor Red
            Write-Host "    Error: $($script.Error)" -ForegroundColor DarkRed
        }
    }
}

# Overall summary
Write-Host ""
Write-Host "=== OVERALL SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total scripts: $($allScripts.Count)" -ForegroundColor White
Write-Host "Passed: $totalPassed" -ForegroundColor Green
Write-Host "Failed: $totalFailed" -ForegroundColor $(if ($totalFailed -gt 0) { "Red" } else { "Green" })

if ($allScripts.Count -gt 0) {
    $successRate = [Math]::Round(($totalPassed / $allScripts.Count) * 100, 1)
    Write-Host "Success rate: $successRate%" -ForegroundColor Yellow
}

if ($allFailedScripts.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed scripts:" -ForegroundColor Red
    $allFailedScripts | Sort-Object | ForEach-Object { 
        Write-Host "  $_" -ForegroundColor Red 
    }
}

# Script type analysis
Write-Host ""
Write-Host "=== SCRIPT TYPE ANALYSIS ===" -ForegroundColor Cyan

$testScripts = $allScripts | Where-Object { $_.Name -like "Test-*" -or $_.Name -like "*Test*" }
$fixScripts = $allScripts | Where-Object { $_.Name -like "Fix-*" }
$validateScripts = $allScripts | Where-Object { $_.Name -like "Validate-*" -or $_.Name -like "*Validator*" }
$coreScripts = $allScripts | Where-Object { $_.Category -eq "Core" }
$utilityScripts = $allScripts | Where-Object { $_.Name -like "Simple-*" -or $_.Name -like "Show-*" -or $_.Name -like "Create-*" }

Write-Host "Test scripts: $($testScripts.Count) ($(($testScripts | Where-Object {$_.Passed}).Count) passed)" -ForegroundColor Cyan
Write-Host "Fix scripts: $($fixScripts.Count) ($(($fixScripts | Where-Object {$_.Passed}).Count) passed)" -ForegroundColor Cyan
Write-Host "Validation scripts: $($validateScripts.Count) ($(($validateScripts | Where-Object {$_.Passed}).Count) passed)" -ForegroundColor Cyan
Write-Host "Core scripts: $($coreScripts.Count) ($(($coreScripts | Where-Object {$_.Passed}).Count) passed)" -ForegroundColor Cyan
Write-Host "Utility scripts: $($utilityScripts.Count) ($(($utilityScripts | Where-Object {$_.Passed}).Count) passed)" -ForegroundColor Cyan

Write-Host ""
Write-Host "Script validation complete." -ForegroundColor Cyan