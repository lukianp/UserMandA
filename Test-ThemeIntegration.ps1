# Test-ThemeIntegration.ps1
# Validates comprehensive theme integration implementation

param(
    [switch]$Detailed
)

Write-Host "=== Theme Integration Validation Suite ===" -ForegroundColor Cyan
Write-Host "Validating T-026: Comprehensive Theme Integration Across the UI" -ForegroundColor Yellow
Write-Host ""

$testResults = @()

# Test 1: Theme Dictionary Completeness
Write-Host "1. Testing Theme Dictionary Completeness..." -ForegroundColor White
try {
    $darkThemePath = "GUI\Themes\DarkTheme.xaml"
    $lightThemePath = "GUI\Themes\LightTheme.xaml"
    
    if ((Test-Path $darkThemePath) -and (Test-Path $lightThemePath)) {
        $darkContent = Get-Content $darkThemePath -Raw
        $lightContent = Get-Content $lightThemePath -Raw
        
        # Key theme brushes to verify
        $requiredKeys = @(
            "BackgroundBrush", "SurfaceBrush", "CardBrush", "ForegroundBrush",
            "SecondaryForegroundBrush", "BorderBrush", "AccentBrush", "AccentHoverBrush",
            "SuccessBrush", "WarningBrush", "ErrorBrush", "InfoBrush",
            "PrimaryTextBrush", "SecondaryTextBrush", "ButtonHoverBrush",
            "ValidBorderBrush", "InvalidBorderBrush"
        )
        
        $darkMissingKeys = @()
        $lightMissingKeys = @()
        
        foreach ($key in $requiredKeys) {
            if ($darkContent -notmatch "x:Key=`"$key`"") {
                $darkMissingKeys += $key
            }
            if ($lightContent -notmatch "x:Key=`"$key`"") {
                $lightMissingKeys += $key
            }
        }
        
        if ($darkMissingKeys.Count -eq 0 -and $lightMissingKeys.Count -eq 0) {
            Write-Host "   ✅ All required theme keys present in both themes" -ForegroundColor Green
            $testResults += @{ Test = "Theme Dictionary Completeness"; Status = "PASS"; Details = "$($requiredKeys.Count) keys verified" }
        } else {
            Write-Host "   ❌ Missing keys found" -ForegroundColor Red
            if ($darkMissingKeys.Count -gt 0) { Write-Host "      Dark theme missing: $($darkMissingKeys -join ', ')" }
            if ($lightMissingKeys.Count -gt 0) { Write-Host "      Light theme missing: $($lightMissingKeys -join ', ')" }
            $testResults += @{ Test = "Theme Dictionary Completeness"; Status = "FAIL"; Details = "Missing keys detected" }
        }
    } else {
        Write-Host "   ❌ Theme files not found" -ForegroundColor Red
        $testResults += @{ Test = "Theme Dictionary Completeness"; Status = "FAIL"; Details = "Theme files missing" }
    }
} catch {
    Write-Host "   ❌ Error testing theme dictionaries: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "Theme Dictionary Completeness"; Status = "ERROR"; Details = $_.Exception.Message }
}

# Test 2: StaticResource to DynamicResource Conversion
Write-Host ""
Write-Host "2. Testing StaticResource → DynamicResource Conversion..." -ForegroundColor White
try {
    $themeStylesPath = "GUI\Themes\ThemeStyles.xaml"
    
    if (Test-Path $themeStylesPath) {
        $themeStylesContent = Get-Content $themeStylesPath -Raw
        
        # Check for remaining StaticResource BasedOn references
        $staticBasedOnMatches = [regex]::Matches($themeStylesContent, 'BasedOn="\{StaticResource\s+[\w]+\}"')
        $dynamicBasedOnMatches = [regex]::Matches($themeStylesContent, 'BasedOn="\{DynamicResource\s+[\w]+\}"')
        
        if ($staticBasedOnMatches.Count -eq 0 -and $dynamicBasedOnMatches.Count -gt 0) {
            Write-Host "   ✅ All BasedOn style references converted to DynamicResource" -ForegroundColor Green
            Write-Host "      Found $($dynamicBasedOnMatches.Count) DynamicResource BasedOn references" -ForegroundColor Gray
            $testResults += @{ Test = "StaticResource Conversion"; Status = "PASS"; Details = "$($dynamicBasedOnMatches.Count) DynamicResource references" }
        } else {
            Write-Host "   ⚠️  StaticResource references still found: $($staticBasedOnMatches.Count)" -ForegroundColor Yellow
            if ($Detailed) {
                foreach ($match in $staticBasedOnMatches) {
                    Write-Host "      $($match.Value)" -ForegroundColor Yellow
                }
            }
            $testResults += @{ Test = "StaticResource Conversion"; Status = "PARTIAL"; Details = "$($staticBasedOnMatches.Count) StaticResource remaining" }
        }
    } else {
        Write-Host "   ❌ ThemeStyles.xaml not found" -ForegroundColor Red
        $testResults += @{ Test = "StaticResource Conversion"; Status = "FAIL"; Details = "ThemeStyles.xaml missing" }
    }
} catch {
    Write-Host "   ❌ Error testing StaticResource conversion: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "StaticResource Conversion"; Status = "ERROR"; Details = $_.Exception.Message }
}

# Test 3: Dashboard Theme Integration
Write-Host ""
Write-Host "3. Testing Dashboard Theme Integration..." -ForegroundColor White
try {
    $dashboardPath = "GUI\Views\DashboardView.xaml"
    
    if (Test-Path $dashboardPath) {
        $dashboardContent = Get-Content $dashboardPath -Raw
        
        # Check for hard-coded colors
        $hardCodedColors = [regex]::Matches($dashboardContent, '#FF[0-9A-Fa-f]{6}')
        
        # Check for DynamicResource usage in dashboard styles
        $dynamicResourceMatches = [regex]::Matches($dashboardContent, '\{DynamicResource\s+[\w]+\}')
        
        if ($hardCodedColors.Count -eq 0 -and $dynamicResourceMatches.Count -gt 0) {
            Write-Host "   ✅ Dashboard uses DynamicResource bindings" -ForegroundColor Green
            Write-Host "      Found $($dynamicResourceMatches.Count) DynamicResource references" -ForegroundColor Gray
            $testResults += @{ Test = "Dashboard Theme Integration"; Status = "PASS"; Details = "$($dynamicResourceMatches.Count) theme references" }
        } else {
            Write-Host "   ⚠️  Hard-coded colors found: $($hardCodedColors.Count)" -ForegroundColor Yellow
            Write-Host "      DynamicResource references: $($dynamicResourceMatches.Count)" -ForegroundColor Yellow
            $testResults += @{ Test = "Dashboard Theme Integration"; Status = "PARTIAL"; Details = "$($hardCodedColors.Count) hard-coded colors remaining" }
        }
    } else {
        Write-Host "   ❌ DashboardView.xaml not found" -ForegroundColor Red
        $testResults += @{ Test = "Dashboard Theme Integration"; Status = "FAIL"; Details = "DashboardView.xaml missing" }
    }
} catch {
    Write-Host "   ❌ Error testing dashboard integration: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "Dashboard Theme Integration"; Status = "ERROR"; Details = $_.Exception.Message }
}

# Test 4: ThemeService Functionality
Write-Host ""
Write-Host "4. Testing ThemeService Infrastructure..." -ForegroundColor White
try {
    $themeServicePath = "GUI\Services\ThemeService.cs"
    
    if (Test-Path $themeServicePath) {
        $themeServiceContent = Get-Content $themeServicePath -Raw
        
        # Check for key methods
        $requiredMethods = @("Initialize", "ToggleTheme", "SetTheme", "ApplyTheme")
        $foundMethods = @()
        
        foreach ($method in $requiredMethods) {
            if ($themeServiceContent -match "public.*$method\(") {
                $foundMethods += $method
            }
        }
        
        if ($foundMethods.Count -eq $requiredMethods.Count) {
            Write-Host "   ✅ ThemeService has all required methods" -ForegroundColor Green
            Write-Host "      Methods: $($foundMethods -join ', ')" -ForegroundColor Gray
            $testResults += @{ Test = "ThemeService Infrastructure"; Status = "PASS"; Details = "All methods present" }
        } else {
            $missingMethods = $requiredMethods | Where-Object { $_ -notin $foundMethods }
            Write-Host "   ❌ Missing methods: $($missingMethods -join ', ')" -ForegroundColor Red
            $testResults += @{ Test = "ThemeService Infrastructure"; Status = "FAIL"; Details = "Missing methods: $($missingMethods -join ', ')" }
        }
    } else {
        Write-Host "   ❌ ThemeService.cs not found" -ForegroundColor Red
        $testResults += @{ Test = "ThemeService Infrastructure"; Status = "FAIL"; Details = "ThemeService.cs missing" }
    }
} catch {
    Write-Host "   ❌ Error testing ThemeService: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "ThemeService Infrastructure"; Status = "ERROR"; Details = $_.Exception.Message }
}

# Test 5: Theme Persistence Support
Write-Host ""
Write-Host "5. Testing Theme Persistence Support..." -ForegroundColor White
try {
    $themeServicePath = "GUI\Services\ThemeService.cs"
    
    if (Test-Path $themeServicePath) {
        $themeServiceContent = Get-Content $themeServicePath -Raw
        
        # Check for persistence methods
        if ($themeServiceContent -match "SaveSettings" -and $themeServiceContent -match "LoadSettings") {
            Write-Host "   ✅ Theme persistence methods found" -ForegroundColor Green
            
            # Check for settings path
            if ($themeServiceContent -match "theme-settings\.json") {
                Write-Host "   ✅ Settings file configuration detected" -ForegroundColor Green
                $testResults += @{ Test = "Theme Persistence"; Status = "PASS"; Details = "Save/Load methods and settings file" }
            } else {
                Write-Host "   ⚠️  Settings persistence configured but file path unclear" -ForegroundColor Yellow
                $testResults += @{ Test = "Theme Persistence"; Status = "PARTIAL"; Details = "Methods present, file path unclear" }
            }
        } else {
            Write-Host "   ❌ Theme persistence methods not found" -ForegroundColor Red
            $testResults += @{ Test = "Theme Persistence"; Status = "FAIL"; Details = "Missing SaveSettings/LoadSettings" }
        }
    } else {
        Write-Host "   ❌ ThemeService.cs not found" -ForegroundColor Red
        $testResults += @{ Test = "Theme Persistence"; Status = "FAIL"; Details = "ThemeService.cs missing" }
    }
} catch {
    Write-Host "   ❌ Error testing theme persistence: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Test = "Theme Persistence"; Status = "ERROR"; Details = $_.Exception.Message }
}

# Summary
Write-Host ""
Write-Host "=== Test Results Summary ===" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count  
$partialCount = ($testResults | Where-Object { $_.Status -eq "PARTIAL" }).Count
$errorCount = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count
$totalTests = $testResults.Count

foreach ($result in $testResults) {
    $color = switch ($result.Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "PARTIAL" { "Yellow" }
        "ERROR" { "Magenta" }
    }
    Write-Host "$($result.Status): $($result.Test) - $($result.Details)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Partial: $partialCount" -ForegroundColor Yellow
Write-Host "Errors: $errorCount" -ForegroundColor Magenta

$successRate = [math]::Round(($passCount / $totalTests) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

# Return results for automated processing
return @{
    TotalTests = $totalTests
    PassedTests = $passCount
    FailedTests = $failCount
    PartialTests = $partialCount
    ErrorTests = $errorCount
    SuccessRate = $successRate
    Results = $testResults
}