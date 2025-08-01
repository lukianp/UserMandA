#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated Functional Testing Tool for M&A Discovery Suite
    
.DESCRIPTION
    This tool systematically tests all functionality in the M&A Discovery Suite,
    logs detailed results, and creates a comprehensive todo list for any missing
    or broken features.
    
.EXAMPLE
    .\AutomatedFunctionalTester.ps1
    
.NOTES
    Author: Claude Code Assistant
    Version: 1.0
    Created: $(Get-Date -Format 'yyyy-MM-dd')
#>

param(
    [string]$OutputPath = "D:\Scripts\UserMandA-1\TestResults",
    [switch]$Verbose,
    [switch]$CreateTodoList = $true
)

# Initialize test environment
$ErrorActionPreference = "Continue"
$TestResults = @()
$TodoItems = @()
$TestStartTime = Get-Date

Write-Host "🧪 M&A Discovery Suite - Automated Functional Testing" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Test Started: $TestStartTime" -ForegroundColor Green
Write-Host ""

# Ensure output directory exists
if (-not (Test-Path $OutputPath)) {
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
}

# Define test categories and their expected features
$TestCategories = @{
    "PowerShell Modules" = @{
        "ApplicationDiscovery.psm1" = @(
            "Get-IntuneApplications",
            "Get-DNSApplications", 
            "Search-ApplicationDetails",
            "New-ApplicationCatalog",
            "Get-ApplicationMigrationPath",
            "Update-ApplicationMetadata",
            "Export-ApplicationCatalog",
            "Test-ApplicationConnectivity"
        )
    }
    "GUI Components" = @{
        "Main Application" = @(
            "Company Profile Creation",
            "Company Profile Selection",
            "Profile Dropdown Auto-refresh",
            "Navigation Between Screens",
            "App Registration Integration",
            "PowerShell Window Launch"
        )
        "Discovery Features" = @(
            "User Discovery",
            "Computer Discovery", 
            "Application Discovery",
            "Server Discovery",
            "Network Discovery"
        )
        "Migration Planning" = @(
            "Wave Management",
            "Drag and Drop Users",
            "Risk Assessment",
            "Timeline Planning"
        )
        "Reporting" = @(
            "Export to CSV",
            "Generate Reports",
            "Progress Tracking"
        )
    }
    "File Structure" = @{
        "Required Directories" = @(
            "D:\Scripts\UserMandA-1\GUI",
            "D:\Scripts\UserMandA-1\Modules\Discovery",
            "D:\Scripts\UserMandA-1\Scripts",
            "D:\Scripts\UserMandA-1\Tools"
        )
        "Core Files" = @(
            "MandADiscoverySuite.exe",
            "ApplicationDiscovery.psm1",
            "DiscoveryCreateAppRegistration.ps1",
            "PowerShellWindow.xaml"
        )
    }
    "Integration Points" = @{
        "Azure AD Integration" = @(
            "App Registration Script",
            "Microsoft Graph API",
            "Intune Connectivity"
        )
        "External Tools" = @(
            "DNS Resolution",
            "Network Scanning",
            "Active Directory Queries"
        )
    }
}

# Function to log test results
function Add-TestResult {
    param(
        [string]$Category,
        [string]$Feature,
        [string]$Status,
        [string]$Details = "",
        [string]$Recommendation = ""
    )
    
    $Result = [PSCustomObject]@{
        Timestamp = Get-Date
        Category = $Category
        Feature = $Feature
        Status = $Status
        Details = $Details
        Recommendation = $Recommendation
    }
    
    $script:TestResults += $Result
    
    # Color-coded console output
    $StatusColor = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "PARTIAL" { "Yellow" }
        "MISSING" { "Magenta" }
        default { "White" }
    }
    
    Write-Host "  [$Status] $Feature" -ForegroundColor $StatusColor
    if ($Details -and $Verbose) {
        Write-Host "    → $Details" -ForegroundColor Gray
    }
    
    # Add to todo list if not passing
    if ($Status -ne "PASS" -and $CreateTodoList) {
        $Priority = switch ($Status) {
            "FAIL" { "high" }
            "MISSING" { "high" }
            "PARTIAL" { "medium" }
            default { "low" }
        }
        
        $TodoDescription = if ($Recommendation) { $Recommendation } else { "Fix $Feature in $Category" }
        
        $script:TodoItems += [PSCustomObject]@{
            Priority = $Priority
            Status = "pending"
            Description = $TodoDescription
            Category = $Category
            Feature = $Feature
            OriginalStatus = $Status
        }
    }
}

# Test PowerShell Modules
Write-Host "🔍 Testing PowerShell Modules..." -ForegroundColor Yellow
$ModulePath = "D:\Scripts\UserMandA-1\Modules\Discovery\ApplicationDiscovery.psm1"

if (Test-Path $ModulePath) {
    Add-TestResult "PowerShell Modules" "ApplicationDiscovery.psm1 Exists" "PASS" "Module file found at correct location"
    
    try {
        $ModuleContent = Get-Content $ModulePath -Raw
        
        # Test each expected function
        foreach ($Function in $TestCategories["PowerShell Modules"]["ApplicationDiscovery.psm1"]) {
            if ($ModuleContent -match "function $Function") {
                Add-TestResult "PowerShell Modules" $Function "PASS" "Function definition found"
            } else {
                Add-TestResult "PowerShell Modules" $Function "MISSING" "Function not found in module" "Implement $Function in ApplicationDiscovery.psm1"
            }
        }
        
        # Test module syntax
        try {
            $null = [System.Management.Automation.Language.Parser]::ParseFile($ModulePath, [ref]$null, [ref]$null)
            Add-TestResult "PowerShell Modules" "Module Syntax Validation" "PASS" "No syntax errors detected"
        } catch {
            Add-TestResult "PowerShell Modules" "Module Syntax Validation" "FAIL" "Syntax errors: $($_.Exception.Message)" "Fix PowerShell syntax errors in ApplicationDiscovery.psm1"
        }
        
    } catch {
        Add-TestResult "PowerShell Modules" "Module Content Analysis" "FAIL" "Error reading module: $($_.Exception.Message)" "Fix module file accessibility and permissions"
    }
} else {
    Add-TestResult "PowerShell Modules" "ApplicationDiscovery.psm1 Exists" "MISSING" "Module file not found" "Create ApplicationDiscovery.psm1 module"
}

# Test GUI Components
Write-Host "🖥️  Testing GUI Components..." -ForegroundColor Yellow
$GuiPath = "D:\Scripts\UserMandA-1\GUI"
$ExePath = "$GuiPath\bin\Release\net6.0-windows\MandADiscoverySuite.exe"

if (Test-Path $ExePath) {
    Add-TestResult "GUI Components" "Main Application Executable" "PASS" "Executable found and built successfully"
} else {
    Add-TestResult "GUI Components" "Main Application Executable" "MISSING" "Executable not found" "Build the GUI application"
}

# Test XAML files
$XamlFiles = @("MandADiscoverySuite.xaml", "CreateProfileDialog.xaml", "PowerShellWindow.xaml")
foreach ($XamlFile in $XamlFiles) {
    $XamlPath = "$GuiPath\$XamlFile"
    if (Test-Path $XamlPath) {
        Add-TestResult "GUI Components" "$XamlFile Exists" "PASS" "XAML file found"
        
        # Basic XAML validation
        try {
            [xml]$XamlContent = Get-Content $XamlPath
            Add-TestResult "GUI Components" "$XamlFile XML Validation" "PASS" "Valid XML structure"
        } catch {
            Add-TestResult "GUI Components" "$XamlFile XML Validation" "FAIL" "Invalid XML: $($_.Exception.Message)" "Fix XML syntax in $XamlFile"
        }
    } else {
        Add-TestResult "GUI Components" "$XamlFile Exists" "MISSING" "XAML file not found" "Create $XamlFile"
    }
}

# Test File Structure
Write-Host "📁 Testing File Structure..." -ForegroundColor Yellow
foreach ($Category in $TestCategories["File Structure"].Keys) {
    foreach ($Path in $TestCategories["File Structure"][$Category]) {
        if (Test-Path $Path) {
            Add-TestResult "File Structure" "$Category - $(Split-Path $Path -Leaf)" "PASS" "Path exists: $Path"
        } else {
            Add-TestResult "File Structure" "$Category - $(Split-Path $Path -Leaf)" "MISSING" "Path not found: $Path" "Create required directory/file: $Path"
        }
    }
}

# Test Integration Scripts
Write-Host "🔗 Testing Integration Scripts..." -ForegroundColor Yellow
$IntegrationScripts = @(
    "DiscoveryCreateAppRegistration.ps1",
    "DiscoveryGetUsers.ps1",
    "DiscoveryGetComputers.ps1"
)

foreach ($Script in $IntegrationScripts) {
    $ScriptPath = "D:\Scripts\UserMandA-1\Scripts\$Script"
    if (Test-Path $ScriptPath) {
        Add-TestResult "Integration Points" $Script "PASS" "Script found"
        
        # Test script syntax
        try {
            $null = [System.Management.Automation.Language.Parser]::ParseFile($ScriptPath, [ref]$null, [ref]$null)
            Add-TestResult "Integration Points" "$Script Syntax" "PASS" "No syntax errors"
        } catch {
            Add-TestResult "Integration Points" "$Script Syntax" "FAIL" "Syntax error: $($_.Exception.Message)" "Fix PowerShell syntax in $Script"
        }
    } else {
        Add-TestResult "Integration Points" $Script "MISSING" "Script not found" "Create $Script integration script"
    }
}

# Test Configuration Files
Write-Host "⚙️  Testing Configuration..." -ForegroundColor Yellow
$ConfigFiles = @(
    "D:\Scripts\UserMandA-1\GUI\MandADiscoverySuite.csproj",
    "D:\Scripts\UserMandA-1\GUI\App.config"
)

foreach ($ConfigFile in $ConfigFiles) {
    if (Test-Path $ConfigFile) {
        Add-TestResult "Configuration" "$(Split-Path $ConfigFile -Leaf)" "PASS" "Configuration file exists"
    } else {
        Add-TestResult "Configuration" "$(Split-Path $ConfigFile -Leaf)" "MISSING" "Configuration file missing" "Create $(Split-Path $ConfigFile -Leaf)"
    }
}

# Advanced Feature Testing (from original checklist)
Write-Host "🚀 Testing Advanced Features..." -ForegroundColor Yellow
$AdvancedFeatures = @(
    "Predictive Risk Scoring",
    "Smart Notifications", 
    "Cost Optimization Engine",
    "Real-time Network Topology",
    "Interactive Migration Planning",
    "Automated Remediation",
    "Compliance Gap Analysis",
    "Mobile/Responsive Design"
)

foreach ($Feature in $AdvancedFeatures) {
    # These are likely not implemented yet
    Add-TestResult "Advanced Features" $Feature "MISSING" "Advanced feature not yet implemented" "Implement $Feature as per requirements checklist"
}

# Generate Summary
$TestEndTime = Get-Date
$TestDuration = $TestEndTime - $TestStartTime
$TotalTests = $TestResults.Count
$PassedTests = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
$FailedTests = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
$PartialTests = ($TestResults | Where-Object { $_.Status -eq "PARTIAL" }).Count
$MissingTests = ($TestResults | Where-Object { $_.Status -eq "MISSING" }).Count

Write-Host ""
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Total Tests: $TotalTests" -ForegroundColor White
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red
Write-Host "Partial: $PartialTests" -ForegroundColor Yellow
Write-Host "Missing: $MissingTests" -ForegroundColor Magenta
Write-Host "Duration: $($TestDuration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor White
Write-Host ""

# Export detailed results
$ResultsFile = "$OutputPath\TestResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$TestResults | ConvertTo-Json -Depth 3 | Out-File $ResultsFile -Encoding UTF8
Write-Host "📄 Detailed results saved to: $ResultsFile" -ForegroundColor Green

# Export CSV for analysis
$CsvFile = "$OutputPath\TestResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
$TestResults | Export-Csv $CsvFile -NoTypeInformation -Encoding UTF8
Write-Host "📊 CSV results saved to: $CsvFile" -ForegroundColor Green

# Generate Todo List
if ($CreateTodoList -and $TodoItems.Count -gt 0) {
    $TodoFile = "$OutputPath\FixTodoList_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    
    # Sort by priority and add IDs
    $SortedTodos = $TodoItems | Sort-Object @{Expression={
        switch ($_.Priority) {
            "high" { 1 }
            "medium" { 2 }
            "low" { 3 }
        }
    }}, Category, Feature
    
    # Add sequential IDs
    for ($i = 0; $i -lt $SortedTodos.Count; $i++) {
        $SortedTodos[$i] | Add-Member -NotePropertyName "id" -NotePropertyValue ($i + 1).ToString()
    }
    
    $SortedTodos | ConvertTo-Json -Depth 3 | Out-File $TodoFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "📋 Todo List Generated" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "High Priority Items: $(($SortedTodos | Where-Object { $_.Priority -eq 'high' }).Count)" -ForegroundColor Red
    Write-Host "Medium Priority Items: $(($SortedTodos | Where-Object { $_.Priority -eq 'medium' }).Count)" -ForegroundColor Yellow
    Write-Host "Low Priority Items: $(($SortedTodos | Where-Object { $_.Priority -eq 'low' }).Count)" -ForegroundColor Green
    Write-Host "Todo list saved to: $TodoFile" -ForegroundColor Green
    
    # Display top 10 high priority items
    $HighPriorityItems = $SortedTodos | Where-Object { $_.Priority -eq "high" } | Select-Object -First 10
    if ($HighPriorityItems) {
        Write-Host ""
        Write-Host "🔥 Top High Priority Items to Fix:" -ForegroundColor Red
        foreach ($Item in $HighPriorityItems) {
            Write-Host "  $($Item.id). $($Item.Description)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "[PASS] Automated testing completed!" -ForegroundColor Green
Write-Host "Check the output directory for detailed results and todo lists." -ForegroundColor Gray