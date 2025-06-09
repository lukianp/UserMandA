# Fix-ModuleEncoding.ps1
# Validates and fixes encoding issues in all PowerShell modules
# Place in Scripts folder and run before deployment

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$SuiteRoot = (Split-Path $PSScriptRoot -Parent),
    
    [Parameter(Mandatory=$false)]
    [switch]$Fix = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly = $false
)

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Module Encoding Validator and Fixer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

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
$psFiles = Get-ChildItem -Path $SuiteRoot -Include "*.ps1", "*.psm1", "*.psd1" -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\\.git\\' }

Write-Host "`nFound $($psFiles.Count) PowerShell files to check" -ForegroundColor Yellow

$results = @{
    TotalFiles = $psFiles.Count
    ValidFiles = 0
    FilesWithoutBOM = 0
    FilesWithNonASCII = 0
    FilesFixed = 0
    Errors = @()
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
            
            # Replace common non-ASCII characters using character codes to avoid encoding issues
            $replacements = @{
                # Smart quotes and dashes
                [char]0x201C = '"'  # Left double quotation mark
                [char]0x201D = '"'  # Right double quotation mark
                [char]0x2018 = "'"  # Left single quotation mark
                [char]0x2019 = "'"  # Right single quotation mark
                [char]0x2013 = '-'  # En dash
                [char]0x2014 = '--' # Em dash
                [char]0x2026 = '...' # Horizontal ellipsis
                
                # Other common non-ASCII
                [char]0x00A9 = '(c)'  # Copyright
                [char]0x00AE = '(R)'  # Registered
                [char]0x2122 = '(TM)' # Trademark
                [char]0x00B0 = 'deg'  # Degree
                [char]0x00D7 = 'x'    # Multiplication
                [char]0x00F7 = '/'    # Division
            }
            
            foreach ($char in $replacements.Keys) {
                if ($content.Contains($char)) {
                    $content = $content.Replace($char, $replacements[$char])
                    Write-Host "      Replaced character (code: $([int]$char)) with '$($replacements[$char])'" -ForegroundColor Green
                }
            }
            
            # Create backup
            $backupPath = "$($file.FullName).bak"
            Copy-Item -Path $file.FullName -Destination $backupPath -Force
            
            # Write with UTF-8 BOM
            $utf8WithBom = New-Object System.Text.UTF8Encoding $true
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8WithBom)
            
            Write-Host "  [OK] File fixed and saved with UTF-8 BOM" -ForegroundColor Green
            Write-Host "      Backup saved to: $(Split-Path $backupPath -Leaf)" -ForegroundColor Gray
            $results.FilesFixed++
            
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
    exit 0
} else {
    exit 1
}