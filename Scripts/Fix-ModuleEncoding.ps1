# Fix-ModuleEncoding.ps1
# Validates and fixes encoding issues in all PowerShell modules
# HARDCODED VERSION - Update the $SuiteRoot path below to match your installation

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Fix = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly = $false
)

$ErrorActionPreference = 'Stop'

# HARDCODED PATH - Update this to match your installation directory
$SuiteRoot = "C:\UserMigration"

# Verify the path exists
if (-not (Test-Path $SuiteRoot)) {
    Write-Host "ERROR: Suite root path not found: $SuiteRoot" -ForegroundColor Red
    Write-Host "Please update the hardcoded path in this script to match your installation directory." -ForegroundColor Yellow
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

# Function to check for non-ASCII characters
function Test-NonASCIICharacters {
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $nonASCII = [regex]::Matches($content, '[^\x00-\x7F]')
        
        $issues = @()
        foreach ($match in $nonASCII) {
            $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
            $issues += [PSCustomObject]@{
                Character = $match.Value
                CharCode = [int][char]$match.Value
                Position = $match.Index
                Line = $lineNumber
            }
        }
        
        return $issues
    } catch {
        return @()
    }
}

# Get all PowerShell files
Write-Host "`nSearching for PowerShell files in: $SuiteRoot" -ForegroundColor Yellow
$psFiles = Get-ChildItem -Path $SuiteRoot -Include "*.ps1", "*.psm1", "*.psd1" -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\\.bak$' }

Write-Host "Found $($psFiles.Count) PowerShell files to check" -ForegroundColor Yellow

$results = @{
    TotalFiles = $psFiles.Count
    ValidFiles = 0
    FilesWithoutBOM = 0
    FilesWithNonASCII = 0
    FilesFixed = 0
    Errors = @()
}

# Define all replacements as strings (not characters)
$stringReplacements = @{
    # Smart quotes and dashes
    ([char]0x201C).ToString() = '"'   # Left double quotation mark
    ([char]0x201D).ToString() = '"'   # Right double quotation mark
    ([char]0x2018).ToString() = "'"   # Left single quotation mark
    ([char]0x2019).ToString() = "'"   # Right single quotation mark
    ([char]0x2013).ToString() = '-'   # En dash
    ([char]0x2014).ToString() = '--'  # Em dash
    ([char]0x2026).ToString() = '...' # Horizontal ellipsis
    
    # Other common non-ASCII
    ([char]0x00A9).ToString() = '(c)'  # Copyright
    ([char]0x00AE).ToString() = '(R)'  # Registered
    ([char]0x2122).ToString() = '(TM)' # Trademark
    ([char]0x00B0).ToString() = 'deg'  # Degree
    ([char]0x00D7).ToString() = 'x'    # Multiplication
    ([char]0x00F7).ToString() = '/'    # Division
    
    # Simple symbols
    ([char]0x2022).ToString() = '*'    # Bullet
    ([char]0x25CF).ToString() = '*'    # Black circle
    ([char]0x25CB).ToString() = 'o'    # White circle
    ([char]0x25A0).ToString() = '#'    # Black square
    ([char]0x25A1).ToString() = '[]'   # White square
    ([char]0x2588).ToString() = '#'    # Full block
    ([char]0x2591).ToString() = '.'    # Light shade
    ([char]0x2592).ToString() = ':'    # Medium shade
    ([char]0x2593).ToString() = '|'    # Dark shade
    
    # Checkmarks and X marks
    ([char]0x2713).ToString() = '[+]'  # Check mark
    ([char]0x2714).ToString() = '[+]'  # Heavy check mark
    ([char]0x2715).ToString() = '[x]'  # Multiplication X
    ([char]0x2716).ToString() = '[X]'  # Heavy multiplication X
    ([char]0x2717).ToString() = '[-]'  # Ballot X
    ([char]0x2718).ToString() = '[X]'  # Heavy ballot X
    ([char]0x274C).ToString() = '[X]'  # Cross mark
    ([char]0x274E).ToString() = '[X]'  # Negative squared cross mark
    ([char]0x2705).ToString() = '[OK]' # White heavy check mark
    ([char]0x2611).ToString() = '[X]'  # Ballot box with check
    ([char]0x2612).ToString() = '[X]'  # Ballot box with X
    
    # Special characters
    ([char]0x23F3).ToString() = '[...]'  # Hourglass
    ([char]0x26A0).ToString() = '[!]'    # Warning sign
    ([char]0x26A1).ToString() = '[!]'    # High voltage
    ([char]0x2B50).ToString() = '[*]'    # Star
    ([char]0x229B).ToString() = '[*]'    # Circled asterisk
    ([char]0xFE0F).ToString() = ''       # Variation selector (remove)
    
    # Box drawing characters
    ([char]0x2588).ToString() = '#'    # Full block (█)
    ([char]0x2591).ToString() = '.'    # Light shade (░)
    
    # Other symbols
    ([char]0x221A).ToString() = 'sqrt' # Square root
    ([char]0x00B1).ToString() = '+/-'  # Plus-minus
    ([char]0x2264).ToString() = '<='   # Less than or equal
    ([char]0x2265).ToString() = '>='   # Greater than or equal
    ([char]0x2260).ToString() = '!='   # Not equal
    ([char]0x2248).ToString() = '~='   # Almost equal
    
    # Common check marks
    ([char]0x2713).ToString() = '[+]'  # Check mark (✓)
    ([char]0x2717).ToString() = '[-]'  # Ballot X (✗)
    ([char]0x2611).ToString() = '[X]'  # Ballot box with check
    
    # Additional emojis
    '✓' = '[+]'
    '✗' = '[-]'
    '✅' = '[OK]'
    '❌' = '[X]'
    '⏳' = '[...]'
    '⚠️' = '[!]'
    '⚠' = '[!]'
    'ℹ️' = '[i]'
    'ℹ' = '[i]'
    '📊' = '[DATA]'
    '🔍' = '[?]'
    '📁' = '[DIR]'
    '📄' = '[FILE]'
    '⚡' = '[!]'
    '●' = '*'
    '○' = 'o'
    '■' = '#'
    '□' = '[]'
    '█' = '#'
    '░' = '.'
    '⏭️' = '>>'
    '⏭' = '>>'
}

foreach ($file in $psFiles) {
    $relativePath = $file.FullName.Replace($SuiteRoot, '').TrimStart('\')
    Write-Host "`nChecking: $relativePath" -ForegroundColor Gray
    
    $hasBOM = Test-UTF8BOM -FilePath $file.FullName
    $nonASCII = Test-NonASCIICharacters -FilePath $file.FullName
    
    $isValid = $true
    
    # Check BOM
    if (-not $hasBOM) {
        Write-Host "  [!] Missing UTF-8 BOM" -ForegroundColor Yellow
        $results.FilesWithoutBOM++
        $isValid = $false
    }
    
    # Check non-ASCII characters
    if ($nonASCII.Count -gt 0) {
        Write-Host "  [!] Found $($nonASCII.Count) non-ASCII characters:" -ForegroundColor Yellow
        $results.FilesWithNonASCII++
        $isValid = $false
        
        # Show first 5 issues
        $nonASCII | Select-Object -First 5 | ForEach-Object {
            Write-Host "      Line $($_.Line): Character '$($_.Character)' (code: $($_.CharCode))" -ForegroundColor Red
        }
        
        if ($nonASCII.Count -gt 5) {
            Write-Host "      ... and $($nonASCII.Count - 5) more" -ForegroundColor Gray
        }
    }
    
    if ($isValid) {
        Write-Host "  [OK] File is valid" -ForegroundColor Green
        $results.ValidFiles++
    } elseif ($Fix -or (-not $ValidateOnly)) {
        # Fix the file
        Write-Host "  [>>] Attempting to fix file..." -ForegroundColor Cyan
        
        try {
            # Read content
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            
            # Apply string replacements
            $changesMade = $false
            foreach ($original in $stringReplacements.Keys) {
                if ($content.Contains($original)) {
                    $content = $content.Replace($original, $stringReplacements[$original])
                    Write-Host "      Replaced '$original' with '$($stringReplacements[$original])'" -ForegroundColor Green
                    $changesMade = $true
                }
            }
            
            # Also check for any remaining non-ASCII and list them
            $remainingNonASCII = [regex]::Matches($content, '[^\x00-\x7F]')
            if ($remainingNonASCII.Count -gt 0) {
                Write-Host "      Found $($remainingNonASCII.Count) remaining non-ASCII characters after replacements" -ForegroundColor Yellow
                
                # Show unique remaining characters
                $uniqueRemaining = $remainingNonASCII | ForEach-Object { $_.Value } | Select-Object -Unique
                foreach ($char in $uniqueRemaining) {
                    $charCode = [int][char]$char
                    Write-Host "        Unmapped character: '$char' (code: $charCode)" -ForegroundColor Yellow
                }
                
                # Replace remaining with '?'
                $content = [regex]::Replace($content, '[^\x00-\x7F]', '?')
                $changesMade = $true
            }
            
            # Only write if BOM is missing or changes were made
            if (-not $hasBOM -or $changesMade) {
                # Create backup
                $backupPath = "$($file.FullName).bak"
                Copy-Item -Path $file.FullName -Destination $backupPath -Force
                
                # Write with UTF-8 BOM
                $utf8WithBom = New-Object System.Text.UTF8Encoding $true
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
                
                Write-Host "  [OK] File fixed and saved with UTF-8 BOM" -ForegroundColor Green
                Write-Host "      Backup saved to: $(Split-Path $backupPath -Leaf)" -ForegroundColor Gray
                $results.FilesFixed++
            }
            
        } catch {
            Write-Host "  [X] Failed to fix file: $_" -ForegroundColor Red
            $results.Errors += [PSCustomObject]@{
                File = $relativePath
                Error = $_.Exception.Message
            }
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total files checked: $($results.TotalFiles)" -ForegroundColor White
Write-Host "Valid files: $($results.ValidFiles)" -ForegroundColor $(if($results.ValidFiles -eq $results.TotalFiles){"Green"}else{"Yellow"})
Write-Host "Files without BOM: $($results.FilesWithoutBOM)" -ForegroundColor $(if($results.FilesWithoutBOM -eq 0){"Green"}else{"Yellow"})
Write-Host "Files with non-ASCII: $($results.FilesWithNonASCII)" -ForegroundColor $(if($results.FilesWithNonASCII -eq 0){"Green"}else{"Yellow"})

if ($Fix -or (-not $ValidateOnly)) {
    Write-Host "Files fixed: $($results.FilesFixed)" -ForegroundColor Green
}

if ($results.Errors.Count -gt 0) {
    Write-Host "`nErrors encountered:" -ForegroundColor Red
    foreach ($error in $results.Errors) {
        Write-Host "  $($error.File): $($error.Error)" -ForegroundColor Red
    }
}

# Recommendations
if ($results.FilesWithoutBOM -gt 0 -or $results.FilesWithNonASCII -gt 0) {
    Write-Host "`nRecommendations:" -ForegroundColor Yellow
    Write-Host "1. Run this script with -Fix switch to automatically fix issues" -ForegroundColor Gray
    Write-Host "2. Review backup files (.bak) before deploying" -ForegroundColor Gray
    Write-Host "3. Update your editor to save files as UTF-8 with BOM" -ForegroundColor Gray
    Write-Host "4. Avoid using emoji or special characters in code" -ForegroundColor Gray
}

# Return exit code
if ($results.ValidFiles -eq $results.TotalFiles) {
    Write-Host "`nAll files are valid!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome files need attention. Run with -Fix to correct them." -ForegroundColor Yellow
    exit 1
}