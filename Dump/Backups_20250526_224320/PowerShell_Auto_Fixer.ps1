<#
.SYNOPSIS
    Automated PowerShell code fixer for M&A Discovery Suite
.DESCRIPTION
    Automatically applies fixes for syntax errors, unapproved verbs, and encoding issues
.PARAMETER FixSyntax
    Fix critical syntax errors
.PARAMETER FixVerbs
    Fix unapproved PowerShell verbs
.PARAMETER FixEncoding
    Fix character encoding issues
.PARAMETER FixAll
    Apply all available fixes
.PARAMETER BackupFirst
    Create backups before applying fixes (recommended)
#>

[CmdletBinding()]
param(
    [switch]$FixSyntax,
    [switch]$FixVerbs,
    [switch]$FixEncoding,
    [switch]$FixAll,
    [switch]$BackupFirst = $true,
    [string]$Path = "."
)

# Import analysis results
$analysisFile = "PowerShell_Analysis_Results.json"
if (-not (Test-Path $analysisFile)) {
    Write-Host "ERROR: Analysis results not found. Run PowerShell_Syntax_Checker.ps1 first." -ForegroundColor Red
    exit 1
}

$analysisResults = Get-Content $analysisFile | ConvertFrom-Json

function Write-FixerLog {
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
    
    Write-Host "[$timestamp] [FIXER] [$Level] $Message" -ForegroundColor $color
}

function New-FileBackup {
    param([string]$FilePath)
    
    if ($BackupFirst) {
        $backupDir = "Backups_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (-not (Test-Path $backupDir)) {
            New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
        }
        
        $relativePath = $FilePath -replace [regex]::Escape((Get-Location).Path), ""
        $relativePath = $relativePath.TrimStart('\', '/')
        $backupPath = Join-Path $backupDir $relativePath
        $backupParent = Split-Path $backupPath -Parent
        
        if (-not (Test-Path $backupParent)) {
            New-Item -Path $backupParent -ItemType Directory -Force | Out-Null
        }
        
        Copy-Item $FilePath $backupPath -Force
        Write-FixerLog "Backed up: $FilePath -> $backupPath" -Level "INFO"
        return $backupPath
    }
    return $null
}

function Repair-SyntaxErrors {
    Write-FixerLog "Starting syntax error repairs..." -Level "INFO"
    
    $syntaxErrors = $analysisResults.SyntaxErrors
    $fileGroups = $syntaxErrors | Group-Object -Property File
    
    foreach ($fileGroup in $fileGroups) {
        $filePath = $fileGroup.Name
        $fileName = Split-Path $filePath -Leaf
        $errors = $fileGroup.Group
        
        Write-FixerLog "Fixing syntax errors in: $fileName" -Level "INFO"
        New-FileBackup -FilePath $filePath
        
        try {
            $content = Get-Content $filePath -Raw
            $originalContent = $content
            
            # Apply specific fixes based on file and error patterns
            switch ($fileName) {
                "EnhancedConnectionManager.psm1" {
                    $content = Repair-EnhancedConnectionManager -Content $content
                }
                "EnhancedGPODiscovery.psm1" {
                    $content = Repair-EnhancedGPODiscovery -Content $content
                }
                default {
                    $content = Repair-GenericSyntaxErrors -Content $content -Errors $errors
                }
            }
            
            if ($content -ne $originalContent) {
                $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-FixerLog "Applied syntax fixes to: $fileName" -Level "SUCCESS"
            } else {
                Write-FixerLog "No changes needed for: $fileName" -Level "INFO"
            }
            
        } catch {
            Write-FixerLog "Failed to fix syntax in $fileName`: $($_.Exception.Message)" -Level "ERROR"
        }
    }
}

function Repair-EnhancedConnectionManager {
    param([string]$Content)
    
    Write-FixerLog "Applying specific fixes for EnhancedConnectionManager.psm1" -Level "INFO"
    
    # Fix missing try-catch blocks and brace mismatches
    $fixes = @(
        # Fix missing catch block around line 161
        @{
            Pattern = '(\s+)Disconnect-MgGraph -ErrorAction SilentlyContinue\s*}\s*}'
            Replacement = '$1Disconnect-MgGraph -ErrorAction SilentlyContinue
                    } catch {
                        Write-FixerLog "Error disconnecting existing Graph session" -Level "WARN"
                    }
                }'
        },
        # Fix incomplete try blocks
        @{
            Pattern = 'try\s*{\s*([^}]+)\s*}\s*(?!catch|finally)'
            Replacement = 'try {
                    $1
                } catch {
                    Write-FixerLog "Operation failed: $($_.Exception.Message)" -Level "ERROR"
                }'
        }
    )
    
    foreach ($fix in $fixes) {
        if ($Content -match $fix.Pattern) {
            $Content = $Content -replace $fix.Pattern, $fix.Replacement
            Write-FixerLog "Applied fix: $($fix.Pattern.Substring(0, 50))..." -Level "SUCCESS"
        }
    }
    
    return $Content
}

function Repair-EnhancedGPODiscovery {
    param([string]$Content)
    
    Write-FixerLog "Applying specific fixes for EnhancedGPODiscovery.psm1" -Level "INFO"
    
    # Fix common issues in GPO discovery module
    $fixes = @(
        # Fix missing expressions after parentheses
        @{
            Pattern = '\(\s*\)\s*{'
            Replacement = '() {'
        },
        # Fix unterminated strings
        @{
            Pattern = "([`"'])[^`"']*`$"
            Replacement = '`$1`$1'
        },
        # Fix missing closing braces
        @{
            Pattern = 'function\s+[\w-]+\s*\{[^}]*`$'
            Replacement = '`$0
}'
        }
    )
    
    foreach ($fix in $fixes) {
        if ($Content -match $fix.Pattern) {
            $Content = $Content -replace $fix.Pattern, $fix.Replacement
            Write-FixerLog "Applied GPO fix: $($fix.Pattern.Substring(0, 30))..." -Level "SUCCESS"
        }
    }
    
    return $Content
}

function Repair-GenericSyntaxErrors {
    param(
        [string]$Content,
        [array]$Errors
    )
    
    # Apply generic syntax fixes
    $fixes = @(
        # Fix common brace mismatches
        @{
            Pattern = '\}\s*\}\s*\}\s*`$'
            Replacement = '}
}'
        },
        # Fix incomplete try blocks
        @{
            Pattern = 'try\s*\{\s*([^}]+)\s*`$'
            Replacement = 'try {
    `$1
} catch {
    Write-Error "Operation failed: `$(`$_.Exception.Message)"
}'
        }
    )
    
    foreach ($fix in $fixes) {
        $Content = $Content -replace $fix.Pattern, $fix.Replacement
    }
    
    return $Content
}

function Repair-UnapprovedVerbs {
    Write-FixerLog "Starting unapproved verb fixes..." -Level "INFO"
    
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
    
    $unapprovedVerbs = $analysisResults.UnapprovedVerbs
    $fileGroups = $unapprovedVerbs | Group-Object -Property File
    
    foreach ($fileGroup in $fileGroups) {
        $filePath = $fileGroup.Name
        $fileName = Split-Path $filePath -Leaf
        $verbs = $fileGroup.Group
        
        Write-FixerLog "Fixing unapproved verbs in: $fileName" -Level "INFO"
        New-FileBackup -FilePath $filePath
        
        try {
            $content = Get-Content $filePath -Raw
            $originalContent = $content
            
            foreach ($verbIssue in $verbs) {
                $oldFunction = $verbIssue.Function
                $unapprovedVerb = $verbIssue.UnapprovedVerb
                $approvedVerb = $verbMappings[$unapprovedVerb]
                
                if ($approvedVerb) {
                    $newFunction = $oldFunction -replace "^$unapprovedVerb-", "$approvedVerb-"
                    
                    # Replace function definition
                    $content = $content -replace "function\s+$([regex]::Escape($oldFunction))\b", "function $newFunction"
                    
                    # Replace function calls
                    $content = $content -replace "\b$([regex]::Escape($oldFunction))\b", $newFunction
                    
                    # Replace in Export-ModuleMember
                    $content = $content -replace "'$([regex]::Escape($oldFunction))'", "'$newFunction'"
                    
                    Write-FixerLog "Fixed: $oldFunction -> $newFunction" -Level "SUCCESS"
                }
            }
            
            if ($content -ne $originalContent) {
                $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-FixerLog "Applied verb fixes to: $fileName" -Level "SUCCESS"
            }
            
        } catch {
            Write-FixerLog "Failed to fix verbs in $fileName`: $($_.Exception.Message)" -Level "ERROR"
        }
    }
}

function Repair-EncodingIssues {
    Write-FixerLog "Starting encoding issue fixes..." -Level "INFO"
    
    $characterIssues = $analysisResults.CharacterIssues
    
    # Character replacement mappings
    $charMappings = @{
        [char]0x2705 = "[SUCCESS]"  # ✅
        [char]0x274C = "[ERROR]"    # ❌
        [char]0x26A0 = "[WARNING]"  # ⚠️
        [char]0x2139 = "[INFO]"     # ℹ️
        [char]0x1F504 = "[PROGRESS]" # 🔄
        [char]0x1F517 = "[CONNECT]"  # 🔗
        [char]0x1F510 = "[AUTH]"     # 🔐
        [char]0x1F3AF = "[TARGET]"   # 🎯
        [char]0x1F4CA = "[DATA]"     # 📊
        [char]0x1F4C1 = "[FILE]"     # 📁
        [char]0x1F680 = "[START]"    # 🚀
        [char]0x1F527 = "[CONFIG]"   # 🔧
        [char]0x23F3 = "[WAIT]"      # ⏳
        [char]0x2550 = "="           # ═
        [char]0x2551 = "|"           # ║
        [char]0x2554 = "+"           # ╔
        [char]0x2557 = "+"           # ╗
        [char]0x255A = "+"           # ╚
        [char]0x255D = "+"           # ╝
        [char]0x250C = "+"           # ┌
        [char]0x2510 = "+"           # ┐
        [char]0x2514 = "+"           # └
        [char]0x2518 = "+"           # ┘
        [char]0x2500 = "-"           # ─
        [char]0x2502 = "|"           # │
        [char]0x2713 = "OK"          # ✓
        [char]0x2717 = "FAIL"        # ✗
    }
    
    foreach ($issue in $characterIssues) {
        $filePath = $issue.File
        $fileName = Split-Path $filePath -Leaf
        
        Write-FixerLog "Fixing character encoding in: $fileName" -Level "INFO"
        New-FileBackup -FilePath $filePath
        
        try {
            $content = Get-Content $filePath -Raw
            $originalContent = $content
            
            foreach ($char in $charMappings.Keys) {
                $charString = [string]$char
                if ($content.Contains($charString)) {
                    $content = $content.Replace($charString, $charMappings[$char])
                    Write-FixerLog "Replaced character with '$($charMappings[$char])'" -Level "SUCCESS"
                }
            }
            
            if ($content -ne $originalContent) {
                # Save with UTF-8 encoding (no BOM)
                [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
                Write-FixerLog "Applied encoding fixes to: $fileName" -Level "SUCCESS"
            }
            
        } catch {
            Write-FixerLog "Failed to fix encoding in $fileName`: $($_.Exception.Message)" -Level "ERROR"
        }
    }
}

function Test-FixResults {
    Write-FixerLog "Testing fix results..." -Level "INFO"
    
    # Re-run syntax checker to verify fixes
    try {
        & ".\PowerShell_Syntax_Checker.ps1" -GenerateReport
        Write-FixerLog "Re-analysis complete. Check new report for remaining issues." -Level "SUCCESS"
    } catch {
        Write-FixerLog "Failed to run post-fix analysis: $($_.Exception.Message)" -Level "ERROR"
    }
}

# Main execution
Write-FixerLog "Starting PowerShell Auto-Fixer..." -Level "INFO"
Write-FixerLog "Backup enabled: $BackupFirst" -Level "INFO"

if ($FixAll) {
    $FixSyntax = $true
    $FixVerbs = $true
    $FixEncoding = $true
}

if ($FixSyntax) {
    Repair-SyntaxErrors
}

if ($FixVerbs) {
    Repair-UnapprovedVerbs
}

if ($FixEncoding) {
    Repair-EncodingIssues
}

if (-not ($FixSyntax -or $FixVerbs -or $FixEncoding)) {
    Write-FixerLog "No fix options specified. Use -FixAll or specific switches." -Level "WARN"
    Write-FixerLog "Available options: -FixSyntax, -FixVerbs, -FixEncoding, -FixAll" -Level "INFO"
    exit 1
}

# Test results
Test-FixResults

Write-FixerLog "Auto-fixer completed!" -Level "SUCCESS"