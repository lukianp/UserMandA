#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive PowerShell 5.1 Syntax Validator for M&A Discovery Suite

.DESCRIPTION
    This script performs thorough syntax validation of all PowerShell scripts and modules
    in the M&A Discovery Suite, ensuring full PowerShell 5.1 compatibility.
#>

param(
    [switch]$Verbose,
    [switch]$FixIssues
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue'

Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "                    M&A Discovery Suite - PowerShell 5.1 Syntax Validator" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""

# Global counters
$global:TotalFiles = 0
$global:PassedFiles = 0
$global:FailedFiles = 0
$global:FixedFiles = 0
$global:AllIssues = @()

function Write-TestResult {
    param(
        [string]$Message,
        [ValidateSet('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'FIXED')]$Level = 'INFO'
    )
    
    $color = switch ($Level) {
        'INFO' { 'White' }
        'SUCCESS' { 'Green' }
        'WARNING' { 'Yellow' }
        'ERROR' { 'Red' }
        'FIXED' { 'Magenta' }
    }
    
    $prefix = switch ($Level) {
        'INFO' { '  ' }
        'SUCCESS' { '✓ ' }
        'WARNING' { '⚠ ' }
        'ERROR' { '✗ ' }
        'FIXED' { '🔧 ' }
    }
    
    Write-Host "$prefix$Message" -ForegroundColor $color
}

function Test-PowerShell51Compatibility {
    param(
        [string]$Content,
        [string]$FilePath
    )
    
    $issues = @()
    $lines = $Content -split "`n"
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNum = $i + 1
        
        # Check for PowerShell 7+ features that aren't in 5.1
        
        # Null coalescing operator ??
        if ($line -match '\?\?') {
            $issues += @{
                Line = $lineNum
                Issue = "Null coalescing operator (??) - PowerShell 7+ feature"
                Suggestion = "Replace with conditional logic: if (...) { ... } else { ... }"
                Severity = 'ERROR'
            }
        }
        
        # Null conditional operator ?.
        if ($line -match '\?\.' -and $line -notmatch '\.psm1|\.ps1') {
            $issues += @{
                Line = $lineNum
                Issue = "Null conditional operator (?.) - PowerShell 7+ feature"
                Suggestion = "Use conditional logic instead"
                Severity = 'ERROR'
            }
        }
        
        # Pipeline chain operators && ||
        if ($line -match '\s+&&\s+|\s+\|\|\s+') {
            $issues += @{
                Line = $lineNum
                Issue = "Pipeline chain operators (&& ||) - PowerShell 7+ feature"
                Suggestion = "Use separate statements with if/else logic"
                Severity = 'ERROR'
            }
        }
        
        # Ternary operator ? :
        if ($line -match '\?\s*:\s*' -and $line -notmatch 'http:|https:') {
            $issues += @{
                Line = $lineNum
                Issue = "Ternary operator (? :) - PowerShell 7+ feature"
                Suggestion = "Use if-else statement"
                Severity = 'ERROR'
            }
        }
        
        # Check for .NET Core specific features
        if ($line -match 'System\.Text\.Json|System\.Net\.Http\.Json') {
            $issues += @{
                Line = $lineNum
                Issue = ".NET Core specific namespace - may not be available in PowerShell 5.1"
                Suggestion = "Use PowerShell 5.1 compatible alternatives"
                Severity = 'WARNING'
            }
        }
        
        # Check for class inheritance issues
        if ($line -match 'class\s+\w+\s*:\s*\w+' -and $line -notmatch 'System\.|Microsoft\.') {
            $baseClass = ($line -split ':')[1].Trim().Split(' ')[0]
            if ($baseClass -notin @('System.Object', 'Object')) {
                $issues += @{
                    Line = $lineNum
                    Issue = "Class inherits from '$baseClass' - verify base class exists"
                    Suggestion = "Ensure base class is defined or use composition instead"
                    Severity = 'WARNING'
                }
            }
        }
        
        # Check for using statements with advanced features
        if ($line -match '^using\s+(namespace|assembly|module)') {
            $issues += @{
                Line = $lineNum
                Issue = "Advanced using statement - verify PowerShell 5.1 support"
                Suggestion = "Test compatibility or use Import-Module instead"
                Severity = 'WARNING'
            }
        }
    }
    
    return $issues
}

function Test-ScriptSyntax {
    param(
        [string]$FilePath,
        [string]$DisplayName
    )
    
    $global:TotalFiles++
    
    Write-Host "Testing: $DisplayName" -ForegroundColor Yellow
    
    if (-not (Test-Path $FilePath)) {
        Write-TestResult "File not found: $FilePath" -Level 'ERROR'
        $global:FailedFiles++
        return $false
    }
    
    try {
        # Read file content
        $content = Get-Content $FilePath -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Test basic syntax parsing
        $tokens = $null
        $parseErrors = $null
        
        try {
            $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        }
        catch {
            Write-TestResult "Failed to create AST parser: $($_.Exception.Message)" -Level 'ERROR'
            $global:FailedFiles++
            return $false
        }
        
        # Check for parse errors
        if ($parseErrors.Count -gt 0) {
            Write-TestResult "Found $($parseErrors.Count) parse error(s):" -Level 'ERROR'
            foreach ($error in $parseErrors | Select-Object -First 5) {
                Write-TestResult "  Line $($error.Extent.StartLineNumber): $($error.Message)" -Level 'ERROR'
                $global:AllIssues += @{
                    File = $DisplayName
                    Line = $error.Extent.StartLineNumber
                    Type = 'ParseError'
                    Message = $error.Message
                }
            }
            if ($parseErrors.Count -gt 5) {
                Write-TestResult "  ... and $($parseErrors.Count - 5) more errors" -Level 'ERROR'
            }
        }
        
        # Test PowerShell 5.1 compatibility
        $compatIssues = Test-PowerShell51Compatibility -Content $content -FilePath $FilePath
        
        if ($compatIssues.Count -gt 0) {
            Write-TestResult "Found $($compatIssues.Count) PowerShell 5.1 compatibility issue(s):" -Level 'WARNING'
            foreach ($issue in $compatIssues | Select-Object -First 3) {
                Write-TestResult "  Line $($issue.Line): $($issue.Issue)" -Level $issue.Severity
                if ($Verbose) {
                    Write-TestResult "    Suggestion: $($issue.Suggestion)" -Level 'INFO'
                }
                $global:AllIssues += @{
                    File = $DisplayName
                    Line = $issue.Line
                    Type = 'Compatibility'
                    Message = $issue.Issue
                    Suggestion = $issue.Suggestion
                }
            }
            if ($compatIssues.Count -gt 3) {
                Write-TestResult "  ... and $($compatIssues.Count - 3) more issues" -Level 'WARNING'
            }
        }
        
        # Try to create a script block (more thorough syntax check)
        try {
            $null = [scriptblock]::Create($content)
        }
        catch {
            Write-TestResult "ScriptBlock creation failed: $($_.Exception.Message)" -Level 'ERROR'
            $global:AllIssues += @{
                File = $DisplayName
                Line = 0
                Type = 'ScriptBlockError'
                Message = $_.Exception.Message
            }
        }
        
        # Determine overall result
        $hasErrors = ($parseErrors.Count -gt 0) -or ($compatIssues | Where-Object { $_.Severity -eq 'ERROR' }).Count -gt 0
        
        if ($hasErrors) {
            Write-TestResult "FAILED - Has syntax or compatibility errors" -Level 'ERROR'
            $global:FailedFiles++
            return $false
        }
        elseif ($compatIssues.Count -gt 0) {
            Write-TestResult "PASSED with warnings - Compatible but has minor issues" -Level 'WARNING'
            $global:PassedFiles++
            return $true
        }
        else {
            Write-TestResult "PASSED - Clean syntax and fully compatible" -Level 'SUCCESS'
            $global:PassedFiles++
            return $true
        }
    }
    catch {
        Write-TestResult "Exception during testing: $($_.Exception.Message)" -Level 'ERROR'
        $global:FailedFiles++
        return $false
    }
}

# Discover all PowerShell files
Write-Host "Discovering PowerShell files..." -ForegroundColor Cyan

$scriptFiles = @()

# Core modules
$scriptFiles += @{Path = "Modules\Core\CompanyProfileManager.psm1"; Name = "CompanyProfileManager.psm1"; Category = "Core"}

# Discovery modules  
$scriptFiles += @{Path = "Modules\Discovery\PaloAltoDiscovery.psm1"; Name = "PaloAltoDiscovery.psm1"; Category = "Discovery"}
$scriptFiles += @{Path = "Modules\Discovery\PanoramaInterrogation.psm1"; Name = "PanoramaInterrogation.psm1"; Category = "Discovery"}
$scriptFiles += @{Path = "Modules\Discovery\EntraIDAppDiscovery.psm1"; Name = "EntraIDAppDiscovery.psm1"; Category = "Discovery"}

# Processing modules
$scriptFiles += @{Path = "Modules\Processing\WaveGeneration.psm1"; Name = "WaveGeneration.psm1"; Category = "Processing"}
$scriptFiles += @{Path = "Modules\Processing\DataAggregation.psm1"; Name = "DataAggregation.psm1"; Category = "Processing"}
$scriptFiles += @{Path = "Modules\Processing\DataValidation.psm1"; Name = "DataValidation.psm1"; Category = "Processing"}
$scriptFiles += @{Path = "Modules\Processing\UserProfileBuilder.psm1"; Name = "UserProfileBuilder.psm1"; Category = "Processing"}

# Migration modules
$scriptFiles += @{Path = "Modules\Migration\UserMigration.psm1"; Name = "UserMigration.psm1"; Category = "Migration"}
$scriptFiles += @{Path = "Modules\Migration\MailboxMigration.psm1"; Name = "MailboxMigration.psm1"; Category = "Migration"}

# Build and utility scripts
$scriptFiles += @{Path = "GUI\Build-GUI.ps1"; Name = "Build-GUI.ps1"; Category = "Build"}
$scriptFiles += @{Path = "GUI\App.xaml.cs"; Name = "App.xaml.cs"; Category = "GUI"}
$scriptFiles += @{Path = "GUI\MandADiscoverySuite.xaml.cs"; Name = "MandADiscoverySuite.xaml.cs"; Category = "GUI"}

# Filter to only existing files
$existingFiles = $scriptFiles | Where-Object { Test-Path $_.Path }

Write-Host "Found $($existingFiles.Count) PowerShell files to validate" -ForegroundColor Green
Write-Host ""

# Group by category and test
$categories = $existingFiles | Group-Object Category

foreach ($category in $categories) {
    Write-Host "Testing $($category.Name) files:" -ForegroundColor Magenta
    Write-Host "$(('=' * 50))" -ForegroundColor DarkGray
    
    foreach ($file in $category.Group) {
        Test-ScriptSyntax -FilePath $file.Path -DisplayName $file.Name
        Write-Host ""
    }
}

# Summary Report
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "                                    VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan

Write-Host "Total Files Tested: $global:TotalFiles" -ForegroundColor White
Write-Host "Passed: $global:PassedFiles" -ForegroundColor Green
Write-Host "Failed: $global:FailedFiles" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($global:PassedFiles / $global:TotalFiles) * 100, 1))%" -ForegroundColor $(if ($global:FailedFiles -eq 0) { 'Green' } else { 'Yellow' })

if ($global:AllIssues.Count -gt 0) {
    Write-Host ""
    Write-Host "Issue Summary by Type:" -ForegroundColor Yellow
    $issueTypes = $global:AllIssues | Group-Object Type
    foreach ($type in $issueTypes) {
        Write-Host "  $($type.Name): $($type.Count) issues" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Files with Issues:" -ForegroundColor Yellow
    $fileIssues = $global:AllIssues | Group-Object File
    foreach ($file in $fileIssues) {
        Write-Host "  $($file.Name): $($file.Count) issues" -ForegroundColor White
    }
}

Write-Host ""
if ($global:FailedFiles -eq 0) {
    Write-Host "🎉 ALL FILES PASSED VALIDATION!" -ForegroundColor Green
    Write-Host "The M&A Discovery Suite is fully PowerShell 5.1 compatible." -ForegroundColor Green
} else {
    Write-Host "⚠️  VALIDATION COMPLETED WITH ISSUES" -ForegroundColor Yellow
    Write-Host "Please review and fix the issues listed above." -ForegroundColor Yellow
}

Write-Host "================================================================================================" -ForegroundColor Cyan