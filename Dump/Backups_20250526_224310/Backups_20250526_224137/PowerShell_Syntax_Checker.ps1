<#
.SYNOPSIS
    Comprehensive PowerShell syntax and quality checker for M&A Discovery Suite
.DESCRIPTION
    Scans all PowerShell files (.ps1, .psm1) for syntax errors, encoding issues, 
    unapproved verbs, and other potential problems
#>

[CmdletBinding()]
param(
    [string]$Path = ".",
    [switch]$FixIssues,
    [switch]$GenerateReport
)

# Initialize results collection
$script:Results = @{
    SyntaxErrors = @()
    EncodingIssues = @()
    UnapprovedVerbs = @()
    CharacterIssues = @()
    BestPracticeViolations = @()
    Summary = @{}
}

function Write-CheckerLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        "INFO" { "White" }
        default { "Gray" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-PowerShellSyntax {
    param([string]$FilePath)
    
    Write-CheckerLog "Checking syntax: $FilePath" -Level "INFO"
    
    try {
        # Method 1: PowerShell AST Parser (most reliable)
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        $tokens = $null
        $errors = $null
        
        $ast = [System.Management.Automation.Language.Parser]::ParseInput(
            $content, 
            [ref]$tokens, 
            [ref]$errors
        )
        
        if ($errors.Count -gt 0) {
            foreach ($error in $errors) {
                $script:Results.SyntaxErrors += @{
                    File = $FilePath
                    Line = $error.Extent.StartLineNumber
                    Column = $error.Extent.StartColumnNumber
                    Message = $error.Message
                    Severity = "Error"
                }
            }
            return $false
        }
        
        # Method 2: Try to tokenize with legacy parser as backup
        try {
            $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$null)
        } catch {
            $script:Results.SyntaxErrors += @{
                File = $FilePath
                Line = 0
                Column = 0
                Message = "Legacy parser error: $($_.Exception.Message)"
                Severity = "Warning"
            }
        }
        
        return $true
        
    } catch {
        $script:Results.SyntaxErrors += @{
            File = $FilePath
            Line = 0
            Column = 0
            Message = "Failed to parse file: $($_.Exception.Message)"
            Severity = "Critical"
        }
        return $false
    }
}

function Test-FileEncoding {
    param([string]$FilePath)
    
    try {
        # Check for BOM and encoding issues
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        
        # Check for UTF-8 BOM
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $script:Results.EncodingIssues += @{
                File = $FilePath
                Issue = "UTF-8 BOM detected"
                Recommendation = "Remove BOM for better PowerShell compatibility"
                Severity = "Warning"
            }
        }
        
        # Check for non-ASCII characters that might cause issues
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        $nonAsciiMatches = [regex]::Matches($content, '[^\x00-\x7F]')
        
        if ($nonAsciiMatches.Count -gt 0) {
            $uniqueChars = $nonAsciiMatches | ForEach-Object { $_.Value } | Sort-Object -Unique
            $script:Results.CharacterIssues += @{
                File = $FilePath
                Issue = "Non-ASCII characters found"
                Characters = $uniqueChars -join ", "
                Count = $nonAsciiMatches.Count
                Recommendation = "Review Unicode characters for compatibility"
                Severity = "Info"
            }
        }
        
        return $true
        
    } catch {
        $script:Results.EncodingIssues += @{
            File = $FilePath
            Issue = "Failed to check encoding: $($_.Exception.Message)"
            Severity = "Error"
        }
        return $false
    }
}

function Test-PowerShellVerbs {
    param([string]$FilePath)
    
    try {
        $content = Get-Content $FilePath -Raw
        $approvedVerbs = (Get-Verb).Verb
        
        # Find function definitions
        $functionMatches = [regex]::Matches($content, '^function\s+(\w+-\w+)', [System.Text.RegularExpressions.RegexOptions]::Multiline)
        
        foreach ($match in $functionMatches) {
            $functionName = $match.Groups[1].Value
            $verb = $functionName.Split('-')[0]
            
            if ($verb -notin $approvedVerbs) {
                # Suggest approved alternative
                $suggestion = Get-VerbSuggestion -UnapprovedVerb $verb
                
                $script:Results.UnapprovedVerbs += @{
                    File = $FilePath
                    Function = $functionName
                    UnapprovedVerb = $verb
                    Suggestion = $suggestion
                    Line = ($content.Substring(0, $match.Index) -split "`n").Count
                }
            }
        }
        
        return $true
        
    } catch {
        Write-CheckerLog "Failed to check verbs in $FilePath`: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-VerbSuggestion {
    param([string]$UnapprovedVerb)
    
    $verbMappings = @{
        "Parse" = "ConvertFrom"
        "Create" = "New"
        "Generate" = "New"
        "Build" = "New"
        "Analyze" = "Test"
        "Assess" = "Test"
        "Calculate" = "Measure"
        "Should" = "Test"
        "Rotate" = "Move"
        "Cleanup" = "Clear"
        "Clean" = "Clear"
        "Secure" = "Protect"
        "Rebalance" = "Update"
        "Refresh" = "Update"
    }
    
    if ($verbMappings.ContainsKey($UnapprovedVerb)) {
        return $verbMappings[$UnapprovedVerb]
    } else {
        return "Review-ManuallyFor-$UnapprovedVerb"
    }
}

function Test-BestPractices {
    param([string]$FilePath)
    
    try {
        $content = Get-Content $FilePath -Raw
        
        # Check for common best practice violations
        $violations = @()
        
        # Check for Write-Host usage (should use Write-Output or Write-Information)
        if ($content -match 'Write-Host(?!\s+-NoNewline)') {
            $violations += "Consider using Write-Output or Write-Information instead of Write-Host for better pipeline compatibility"
        }
        
        # Check for hardcoded paths
        if ($content -match '[A-Z]:\\') {
            $violations += "Hardcoded Windows paths detected - consider using relative paths or Join-Path"
        }
        
        # Check for missing error handling
        if ($content -match 'Invoke-|Import-|Connect-' -and $content -notmatch 'try\s*{|ErrorAction') {
            $violations += "Consider adding error handling for external commands"
        }
        
        # Check for missing parameter validation
        if ($content -match 'param\s*\(' -and $content -notmatch '\[Parameter\(') {
            $violations += "Consider adding parameter validation attributes"
        }
        
        foreach ($violation in $violations) {
            $script:Results.BestPracticeViolations += @{
                File = $FilePath
                Issue = $violation
                Severity = "Info"
            }
        }
        
        return $true
        
    } catch {
        Write-CheckerLog "Failed to check best practices in $FilePath`: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Invoke-FileCheck {
    param([string]$FilePath)
    
    $fileName = Split-Path $FilePath -Leaf
    Write-CheckerLog "Analyzing: $fileName" -Level "INFO"
    
    # Run all checks
    $syntaxOk = Test-PowerShellSyntax -FilePath $FilePath
    $encodingOk = Test-FileEncoding -FilePath $FilePath
    $verbsOk = Test-PowerShellVerbs -FilePath $FilePath
    $practicesOk = Test-BestPractices -FilePath $FilePath
    
    $status = if ($syntaxOk -and $encodingOk) { "✅" } else { "❌" }
    Write-CheckerLog "$status $fileName - Syntax: $syntaxOk, Encoding: $encodingOk" -Level $(if ($syntaxOk -and $encodingOk) { "SUCCESS" } else { "WARN" })
}

function New-RemediationPlan {
    Write-CheckerLog "Generating remediation plan..." -Level "INFO"
    
    $plan = @"
# PowerShell Code Quality Remediation Plan
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary
- **Files Scanned**: $($script:Results.Summary.FilesScanned)
- **Syntax Errors**: $($script:Results.SyntaxErrors.Count)
- **Encoding Issues**: $($script:Results.EncodingIssues.Count)
- **Unapproved Verbs**: $($script:Results.UnapprovedVerbs.Count)
- **Character Issues**: $($script:Results.CharacterIssues.Count)
- **Best Practice Violations**: $($script:Results.BestPracticeViolations.Count)

## Critical Issues (Fix First)

### Syntax Errors
"@

    foreach ($error in $script:Results.SyntaxErrors) {
        $plan += @"

**File**: $($error.File)
**Line**: $($error.Line), **Column**: $($error.Column)
**Error**: $($error.Message)
**Severity**: $($error.Severity)

"@
    }

    $plan += @"

### Encoding Issues
"@

    foreach ($issue in $script:Results.EncodingIssues) {
        $plan += @"

**File**: $($issue.File)
**Issue**: $($issue.Issue)
**Recommendation**: $($issue.Recommendation)

"@
    }

    $plan += @"

## Unapproved Verbs (PowerShell Standards)
"@

    $verbGroups = $script:Results.UnapprovedVerbs | Group-Object -Property UnapprovedVerb
    foreach ($group in $verbGroups) {
        $plan += @"

### Verb: $($group.Name)
**Suggested Replacement**: $($group.Group[0].Suggestion)
**Affected Functions**:
"@
        foreach ($item in $group.Group) {
            $plan += @"
- $($item.Function) in $($item.File) (Line $($item.Line))
"@
        }
    }

    $plan += @"

## Character Issues
"@

    foreach ($issue in $script:Results.CharacterIssues) {
        $plan += @"

**File**: $($issue.File)
**Characters**: $($issue.Characters)
**Count**: $($issue.Count)
**Recommendation**: $($issue.Recommendation)

"@
    }

    $plan += @"

## Best Practice Recommendations
"@

    $practiceGroups = $script:Results.BestPracticeViolations | Group-Object -Property Issue
    foreach ($group in $practiceGroups) {
        $plan += @"

### Issue: $($group.Name)
**Affected Files**:
"@
        foreach ($item in $group.Group) {
            $plan += @"
- $($item.File)
"@
        }
    }

    $plan += @"

## Remediation Priority
1. **Fix Syntax Errors** - Critical for functionality
2. **Resolve Encoding Issues** - Prevents runtime errors
3. **Update Unapproved Verbs** - PowerShell standards compliance
4. **Review Character Issues** - Compatibility concerns
5. **Address Best Practices** - Code quality improvements

## Automated Fix Commands
```powershell
# Run syntax checker with fix mode
.\PowerShell_Syntax_Checker.ps1 -FixIssues

# Fix specific verb issues
# (Manual replacement recommended for accuracy)
```
"@

    return $plan
}

# Main execution
Write-CheckerLog "Starting PowerShell code quality analysis..." -Level "INFO"
Write-CheckerLog "Scanning path: $Path" -Level "INFO"

# Get all PowerShell files
$psFiles = Get-ChildItem -Path $Path -Recurse -Include "*.ps1", "*.psm1" | Where-Object { -not $_.PSIsContainer }
$script:Results.Summary.FilesScanned = $psFiles.Count

Write-CheckerLog "Found $($psFiles.Count) PowerShell files to analyze" -Level "INFO"

# Process each file
foreach ($file in $psFiles) {
    Invoke-FileCheck -FilePath $file.FullName
}

# Generate summary
Write-CheckerLog "`n=== ANALYSIS COMPLETE ===" -Level "SUCCESS"
Write-CheckerLog "Files Scanned: $($script:Results.Summary.FilesScanned)" -Level "INFO"
Write-CheckerLog "Syntax Errors: $($script:Results.SyntaxErrors.Count)" -Level $(if ($script:Results.SyntaxErrors.Count -eq 0) { "SUCCESS" } else { "ERROR" })
Write-CheckerLog "Encoding Issues: $($script:Results.EncodingIssues.Count)" -Level $(if ($script:Results.EncodingIssues.Count -eq 0) { "SUCCESS" } else { "WARN" })
Write-CheckerLog "Unapproved Verbs: $($script:Results.UnapprovedVerbs.Count)" -Level $(if ($script:Results.UnapprovedVerbs.Count -eq 0) { "SUCCESS" } else { "WARN" })
Write-CheckerLog "Character Issues: $($script:Results.CharacterIssues.Count)" -Level "INFO"
Write-CheckerLog "Best Practice Issues: $($script:Results.BestPracticeViolations.Count)" -Level "INFO"

# Generate remediation plan if requested
if ($GenerateReport) {
    $remediationPlan = New-RemediationPlan
    $reportPath = "PowerShell_Quality_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
    $remediationPlan | Out-File -FilePath $reportPath -Encoding UTF8
    Write-CheckerLog "Remediation plan saved to: $reportPath" -Level "SUCCESS"
}

# Export results for programmatic access
$script:Results | ConvertTo-Json -Depth 10 | Out-File -FilePath "PowerShell_Analysis_Results.json" -Encoding UTF8
Write-CheckerLog "Detailed results saved to: PowerShell_Analysis_Results.json" -Level "INFO"