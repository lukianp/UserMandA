# Fix-ModuleEncoding-Clean.ps1
# Clean version without any non-ASCII characters in the script itself

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Fix = $false
)

$ErrorActionPreference = 'Stop'
$SuiteRoot = "C:\UserMigration"

if (-not (Test-Path $SuiteRoot)) {
    Write-Host "ERROR: Suite root path not found: $SuiteRoot" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Module Encoding Validator and Fixer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Suite Root: $SuiteRoot" -ForegroundColor Gray

# Function to check if file has UTF-8 BOM
function Test-UTF8BOM {
    param([string]$FilePath)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath) | Select-Object -First 3
        return ($bytes.Count -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    } catch {
        return $false
    }
}

# Get all PowerShell files
Write-Host "`nSearching for PowerShell files..." -ForegroundColor Yellow
$psFiles = Get-ChildItem -Path $SuiteRoot -Include "*.ps1", "*.psm1", "*.psd1" -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\.bak$' }

Write-Host "Found $($psFiles.Count) PowerShell files" -ForegroundColor Yellow

$filesFixed = 0
$filesWithIssues = 0

# Define replacements using character codes to avoid encoding issues
$replacements = @()

# Checkmarks and crosses
$replacements += ,@([char]0x2713, '[+]')     # Check mark
$replacements += ,@([char]0x2717, '[-]')     # Ballot X
$replacements += ,@([char]0x2705, '[OK]')    # White heavy check mark
$replacements += ,@([char]0x274C, '[X]')     # Cross mark
$replacements += ,@([char]0x2611, '[X]')     # Ballot box with check
$replacements += ,@([char]0x2612, '[X]')     # Ballot box with X

# Special characters
$replacements += ,@([char]0x23F3, '[...]')   # Hourglass
$replacements += ,@([char]0x26A0, '[!]')     # Warning sign
$replacements += ,@([char]0x26A1, '[!]')     # High voltage
$replacements += ,@([char]0x2139, '[i]')     # Information source

# Symbols
$replacements += ,@([char]0x2022, '*')       # Bullet
$replacements += ,@([char]0x25CF, '*')       # Black circle
$replacements += ,@([char]0x25CB, 'o')       # White circle
$replacements += ,@([char]0x25A0, '#')       # Black square
$replacements += ,@([char]0x25A1, '[]')      # White square
$replacements += ,@([char]0x2588, '#')       # Full block
$replacements += ,@([char]0x2591, '.')       # Light shade

# Quotes and dashes
$replacements += ,@([char]0x201C, '"')       # Left double quote
$replacements += ,@([char]0x201D, '"')       # Right double quote
$replacements += ,@([char]0x2018, "'")       # Left single quote
$replacements += ,@([char]0x2019, "'")       # Right single quote
$replacements += ,@([char]0x2013, '-')       # En dash
$replacements += ,@([char]0x2014, '--')      # Em dash
$replacements += ,@([char]0x2026, '...')     # Horizontal ellipsis

# Other common characters
$replacements += ,@([char]0x00A9, '(c)')     # Copyright
$replacements += ,@([char]0x00AE, '(R)')     # Registered
$replacements += ,@([char]0x2122, '(TM)')    # Trademark
$replacements += ,@([char]0x00B0, 'deg')     # Degree
$replacements += ,@([char]0x00D7, 'x')       # Multiplication
$replacements += ,@([char]0x00F7, '/')       # Division

foreach ($file in $psFiles) {
    $relativePath = $file.FullName.Replace($SuiteRoot, '').TrimStart('\')
    Write-Host "`nChecking: $relativePath" -ForegroundColor Gray
    
    try {
        # Read content
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Check for BOM
        $hasBOM = Test-UTF8BOM -FilePath $file.FullName
        
        # Check for non-ASCII
        $nonASCII = [regex]::Matches($content, '[^\x00-\x7F]')
        
        if (-not $hasBOM -or $nonASCII.Count -gt 0) {
            $filesWithIssues++
            
            if (-not $hasBOM) {
                Write-Host "  [!] Missing UTF-8 BOM" -ForegroundColor Yellow
            }
            
            if ($nonASCII.Count -gt 0) {
                Write-Host "  [!] Found $($nonASCII.Count) non-ASCII characters" -ForegroundColor Yellow
                
                # Show first 5 non-ASCII characters
                $shown = 0
                foreach ($match in $nonASCII) {
                    if ($shown -ge 5) { break }
                    $lineNum = ($content.Substring(0, $match.Index) -split "`n").Count
                    $charCode = [int][char]($match.Value)
                    Write-Host "      Line $lineNum`: Character code $charCode" -ForegroundColor Red
                    $shown++
                }
                if ($nonASCII.Count -gt 5) {
                    Write-Host "      ... and $($nonASCII.Count - 5) more" -ForegroundColor Gray
                }
            }
            
            if ($Fix) {
                Write-Host "  [>>] Fixing file..." -ForegroundColor Cyan
                
                # Create backup
                $backupPath = "$($file.FullName).bak"
                Copy-Item -Path $file.FullName -Destination $backupPath -Force
                
                # Apply replacements
                $changeCount = 0
                foreach ($replacement in $replacements) {
                    $charToReplace = $replacement[0]
                    $replaceWith = $replacement[1]
                    
                    if ($content.Contains($charToReplace)) {
                        $content = $content.Replace($charToReplace.ToString(), $replaceWith)
                        Write-Host "      Replaced character code $([int]$charToReplace) with '$replaceWith'" -ForegroundColor Green
                        $changeCount++
                    }
                }
                
                # Also handle multi-char emojis by replacing all remaining non-ASCII
                $remaining = [regex]::Matches($content, '[^\x00-\x7F]')
                if ($remaining.Count -gt 0) {
                    Write-Host "      Replacing $($remaining.Count) remaining non-ASCII characters with '?'" -ForegroundColor Yellow
                    $content = [regex]::Replace($content, '[^\x00-\x7F]', '?')
                    $changeCount++
                }
                
                # Only write if changes were made or BOM is missing
                if ($changeCount -gt 0 -or -not $hasBOM) {
                    # Write with UTF-8 BOM
                    $utf8WithBom = New-Object System.Text.UTF8Encoding $true
                    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
                    
                    Write-Host "  [OK] File fixed and saved with UTF-8 BOM" -ForegroundColor Green
                    $filesFixed++
                }
            }
        } else {
            Write-Host "  [OK] File is valid" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  [X] Error processing file: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total files checked: $($psFiles.Count)" -ForegroundColor White
Write-Host "Files with issues: $filesWithIssues" -ForegroundColor $(if($filesWithIssues -eq 0){"Green"}else{"Yellow"})

if ($Fix) {
    Write-Host "Files fixed: $filesFixed" -ForegroundColor Green
    Write-Host "`nBackup files created with .bak extension" -ForegroundColor Gray
} else {
    if ($filesWithIssues -gt 0) {
        Write-Host "`nRun with -Fix switch to fix these issues" -ForegroundColor Yellow
        Write-Host "Example: .\$($MyInvocation.MyCommand.Name) -Fix" -ForegroundColor Gray
    } else {
        Write-Host "`nAll files are clean!" -ForegroundColor Green
    }
}

# Exit with appropriate code
exit $(if($filesWithIssues -eq 0 -and $Fix -eq $false){0}elseif($filesFixed -eq $filesWithIssues -and $Fix){0}else{1})