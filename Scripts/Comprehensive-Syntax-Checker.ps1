<#
.SYNOPSIS
    Comprehensive PowerShell syntax and verb checker for M&A Discovery Suite
.DESCRIPTION
    Performs thorough syntax validation and PowerShell verb compliance checking
.PARAMETER Path
    Root path to scan (defaults to current directory)
.PARAMETER FixIssues
    Automatically fix common issues where possible
.EXAMPLE
    .\Scripts\Comprehensive-Syntax-Checker.ps1
.EXAMPLE
    .\Scripts\Comprehensive-Syntax-Checker.ps1 -Path "." -FixIssues
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Path = ".",
    
    [Parameter(Mandatory=$false)]
    [switch]$FixIssues
)

# Get the script root directory for location-independent paths
$script:SuiteRoot = if ($PSScriptRoot) { Split-Path $PSScriptRoot -Parent } else { Get-Location }

function Write-CheckResult {
    param(
        [string]$File,
        [string]$Issue,
        [string]$Severity = "ERROR",
        [string]$Line = "",
        [string]$Details = ""
    )
    
    $color = switch ($Severity) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    $lineInfo = if ($Line) { " (Line $Line)" } else { "" }
    Write-Host "[$Severity] $File$lineInfo - $Issue" -ForegroundColor $color
    if ($Details) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-PowerShellSyntax {
    param([string]$FilePath)
    
    $issues = @()
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # Test basic PowerShell parsing
        try {
            $tokens = $null
            $errors = $null
            $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$tokens)
            
            if ($errors -and $errors.Count -gt 0) {
                foreach ($error in $errors) {
                    $issues += @{
                        Type = "SyntaxError"
                        Message = $error.Message
                        Line = if ($error.Token) { $error.Token.StartLine } else { "Unknown" }
                        Severity = "ERROR"
                    }
                }
            }
        } catch {
            $issues += @{
                Type = "ParseError"
                Message = $_.Exception.Message
                Line = "Unknown"
                Severity = "ERROR"
            }
        }
        
        # Check for common syntax issues
        $lines = $content -split "`n"
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            $lineNum = $i + 1
            
            # Check for unclosed strings
            if ($line -match '"[^"]*$' -and $line -notmatch '""') {
                $issues += @{
                    Type = "UnclosedString"
                    Message = "Potential unclosed string"
                    Line = $lineNum
                    Severity = "ERROR"
                }
            }
            
            # Check for mismatched quotes in XPath
            if ($line -match "local-name\(\)=.*'.*'" -and $line -match '".*"') {
                $issues += @{
                    Type = "QuoteMismatch"
                    Message = "Mixed quotes in XPath expression"
                    Line = $lineNum
                    Severity = "ERROR"
                }
            }
            
            # Check for emoji characters that might cause encoding issues
            if ($line -match '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]') {
                $issues += @{
                    Type = "EmojiCharacters"
                    Message = "Contains emoji characters that may cause encoding issues"
                    Line = $lineNum
                    Severity = "WARNING"
                }
            }
            
            # Check for BOM or special characters
            if ($line -match '[\x{FEFF}\x{FFEF}]') {
                $issues += @{
                    Type = "BOMCharacters"
                    Message = "Contains BOM or special Unicode characters"
                    Line = $lineNum
                    Severity = "WARNING"
                }
            }
        }
        
    } catch {
        $issues += @{
            Type = "FileReadError"
            Message = "Unable to read file: $($_.Exception.Message)"
            Line = "N/A"
            Severity = "ERROR"
        }
    }
    
    return $issues
}

function Test-PowerShellVerbs {
    param([string]$FilePath)
    
    $issues = @()
    
    try {
        $content = Get-Content $FilePath -Raw -ErrorAction Stop
        
        # Extract function definitions
        $functionPattern = 'function\s+([A-Za-z][A-Za-z0-9]*-[A-Za-z][A-Za-z0-9]*)'
        $functions = [regex]::Matches($content, $functionPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        $approvedVerbs = Get-Verb | ForEach-Object { $_.Verb }
        
        foreach ($match in $functions) {
            $functionName = $match.Groups[1].Value
            $verb = ($functionName -split '-')[0]
            
            if ($verb -notin $approvedVerbs) {
                # Get line number
                $beforeMatch = $content.Substring(0, $match.Index)
                $lineNum = ($beforeMatch -split "`n").Count
                
                $issues += @{
                    Type = "UnapprovedVerb"
                    Message = "Function '$functionName' uses unapproved verb '$verb'"
                    Line = $lineNum
                    Severity = "WARNING"
                    FunctionName = $functionName
                    Verb = $verb
                }
            }
        }
        
    } catch {
        $issues += @{
            Type = "VerbCheckError"
            Message = "Unable to check verbs: $($_.Exception.Message)"
            Line = "N/A"
            Severity = "ERROR"
        }
    }
    
    return $issues
}

function Get-VerbSuggestion {
    param([string]$UnapprovedVerb)
    
    $verbMappings = @{
        "Find" = "Get"
        "Repair" = "Restore"
        "Clear" = "Remove"
        "Move" = "Move"  # Actually approved
        "Build" = "New"
        "Calculate" = "Measure"
        "Generate" = "New"
        "Create" = "New"
        "Delete" = "Remove"
        "Cleanup" = "Clear"
        "Setup" = "Initialize"
        "Check" = "Test"
        "Validate" = "Test"
        "Process" = "Invoke"
        "Execute" = "Invoke"
        "Run" = "Invoke"
        "Launch" = "Start"
        "Kill" = "Stop"
        "Terminate" = "Stop"
    }
    
    if ($verbMappings.ContainsKey($UnapprovedVerb)) {
        return $verbMappings[$UnapprovedVerb]
    }
    
    # Try to find similar approved verbs
    $approvedVerbs = Get-Verb | ForEach-Object { $_.Verb }
    $similar = $approvedVerbs | Where-Object { 
        $_.Length -eq $UnapprovedVerb.Length -and 
        (Compare-Object $_.ToCharArray() $UnapprovedVerb.ToCharArray()).Count -le 2 
    }
    
    if ($similar) {
        return $similar[0]
    }
    
    return "Get"  # Default fallback
}

function Fix-CommonIssues {
    param(
        [string]$FilePath,
        [array]$Issues
    )
    
    if (-not $FixIssues) {
        return
    }
    
    try {
        $content = Get-Content $FilePath -Raw
        $modified = $false
        
        foreach ($issue in $Issues) {
            switch ($issue.Type) {
                "EmojiCharacters" {
                    # Remove or replace emoji characters
                    $originalContent = $content
                    $content = $content -replace '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]', ''
                    if ($content -ne $originalContent) {
                        $modified = $true
                        Write-CheckResult -File $FilePath -Issue "Removed emoji characters" -Severity "INFO"
                    }
                }
                "BOMCharacters" {
                    # Remove BOM characters
                    $originalContent = $content
                    $content = $content -replace '[\x{FEFF}\x{FFEF}]', ''
                    if ($content -ne $originalContent) {
                        $modified = $true
                        Write-CheckResult -File $FilePath -Issue "Removed BOM characters" -Severity "INFO"
                    }
                }
                "QuoteMismatch" {
                    # Fix XPath quote issues
                    $originalContent = $content
                    $content = $content -replace "/\*\[local-name\(\)=""([^""]+)""\]", "//*[local-name()='`$1']"
                    if ($content -ne $originalContent) {
                        $modified = $true
                        Write-CheckResult -File $FilePath -Issue "Fixed XPath quote mismatches" -Severity "INFO"
                    }
                }
            }
        }
        
        if ($modified) {
            # Create backup
            $backupPath = "$FilePath.backup"
            Copy-Item $FilePath $backupPath -Force
            
            # Save fixed content
            $content | Set-Content $FilePath -Encoding UTF8 -NoNewline
            Write-CheckResult -File $FilePath -Issue "File updated (backup created)" -Severity "SUCCESS"
        }
        
    } catch {
        Write-CheckResult -File $FilePath -Issue "Failed to fix issues: $($_.Exception.Message)" -Severity "ERROR"
    }
}

# Main execution
Write-Host "M&A Discovery Suite - Comprehensive Syntax and Verb Checker" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "Scanning path: $Path" -ForegroundColor Yellow
if ($FixIssues) {
    Write-Host "Auto-fix mode: ENABLED" -ForegroundColor Green
} else {
    Write-Host "Auto-fix mode: DISABLED (use -FixIssues to enable)" -ForegroundColor Yellow
}
Write-Host ""

# Find all PowerShell files
$psFiles = Get-ChildItem -Path $Path -Recurse -Include "*.ps1", "*.psm1" | Where-Object { 
    $_.FullName -notlike "*\Dump\*" -and 
    $_.FullName -notlike "*\.backup" 
}

Write-Host "Found $($psFiles.Count) PowerShell files to check" -ForegroundColor Cyan
Write-Host ""

$totalIssues = 0
$fileResults = @{}

foreach ($file in $psFiles) {
    $relativePath = $file.FullName.Replace($script:SuiteRoot, "").TrimStart('\')
    
    Write-Host "Checking: $relativePath" -ForegroundColor White
    
    # Test syntax
    $syntaxIssues = Test-PowerShellSyntax -FilePath $file.FullName
    
    # Test verbs
    $verbIssues = Test-PowerShellVerbs -FilePath $file.FullName
    
    $allIssues = $syntaxIssues + $verbIssues
    $fileResults[$relativePath] = $allIssues
    
    if ($allIssues.Count -eq 0) {
        Write-CheckResult -File $relativePath -Issue "No issues found" -Severity "SUCCESS"
    } else {
        foreach ($issue in $allIssues) {
            Write-CheckResult -File $relativePath -Issue $issue.Message -Severity $issue.Severity -Line $issue.Line
            
            if ($issue.Type -eq "UnapprovedVerb") {
                $suggestion = Get-VerbSuggestion -UnapprovedVerb $issue.Verb
                Write-Host "    Suggested replacement: $($issue.FunctionName.Replace($issue.Verb, $suggestion))" -ForegroundColor Cyan
            }
        }
        
        # Attempt to fix issues
        Fix-CommonIssues -FilePath $file.FullName -Issues $allIssues
    }
    
    $totalIssues += $allIssues.Count
    Write-Host ""
}

# Summary
Write-Host "=============================================================" -ForegroundColor Yellow
Write-Host "                        SUMMARY                            " -ForegroundColor Yellow
Write-Host "=============================================================" -ForegroundColor Yellow

$errorCount = 0
$warningCount = 0
$filesWithIssues = 0

foreach ($fileResult in $fileResults.GetEnumerator()) {
    if ($fileResult.Value.Count -gt 0) {
        $filesWithIssues++
        foreach ($issue in $fileResult.Value) {
            if ($issue.Severity -eq "ERROR") { $errorCount++ }
            elseif ($issue.Severity -eq "WARNING") { $warningCount++ }
        }
    }
}

Write-Host "Files scanned: $($psFiles.Count)" -ForegroundColor White
Write-Host "Files with issues: $filesWithIssues" -ForegroundColor $(if ($filesWithIssues -eq 0) { "Green" } else { "Yellow" })
Write-Host "Total errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host "Total warnings: $warningCount" -ForegroundColor $(if ($warningCount -eq 0) { "Green" } else { "Yellow" })

if ($totalIssues -eq 0) {
    Write-Host "`nAll files passed syntax and verb validation!" -ForegroundColor Green
} else {
    Write-Host "`nRecommendations:" -ForegroundColor Cyan
    Write-Host "1. Fix all syntax errors before proceeding" -ForegroundColor White
    Write-Host "2. Consider updating function names to use approved verbs" -ForegroundColor White
    Write-Host "3. Run with -FixIssues to automatically fix common issues" -ForegroundColor White
    
    if ($errorCount -gt 0) {
        Write-Host "`nCRITICAL: $errorCount syntax errors must be fixed!" -ForegroundColor Red
    }
}

Write-Host ""

# Export detailed results
$reportPath = Join-Path $script:SuiteRoot "Syntax_And_Verb_Report.json"
$fileResults | ConvertTo-Json -Depth 10 | Set-Content $reportPath -Encoding UTF8
Write-Host "Detailed report saved to: $reportPath" -ForegroundColor Cyan