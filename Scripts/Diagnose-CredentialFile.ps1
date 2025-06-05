<#
.SYNOPSIS
    Diagnostic script for analyzing credential file format and content
.DESCRIPTION
    Analyzes credential files using different encoding methods and attempts to decrypt them
    to help troubleshoot credential file issues in the M&A Discovery Suite.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
.PARAMETER CredentialFile
    Path to the credential file to analyze
.EXAMPLE
    .\Diagnose-CredentialFile.ps1 -CredentialFile "C:\MandADiscovery\Output\credentials.config"
#>

param(
    [string]$CredentialFile = "C:\MandADiscovery\Output\credentials.config"
)

Write-Host "Analyzing credential file format..." -ForegroundColor Yellow
Write-Host "File: $CredentialFile" -ForegroundColor Cyan

if (-not (Test-Path $CredentialFile)) {
    Write-Host "File not found!" -ForegroundColor Red
    return
}

# Get file info
$fileInfo = Get-Item $CredentialFile
Write-Host "`nFile Information:" -ForegroundColor Yellow
Write-Host "  Size: $($fileInfo.Length) bytes"
Write-Host "  Created: $($fileInfo.CreationTime)"
Write-Host "  Modified: $($fileInfo.LastWriteTime)"

# Try different reading methods
Write-Host "`nTrying different read methods:" -ForegroundColor Yellow

# Method 1: Raw content
try {
    $rawContent = Get-Content $CredentialFile -Raw
    Write-Host "`n1. Raw content (first 100 chars):" -ForegroundColor Cyan
    Write-Host $rawContent.Substring(0, [Math]::Min(100, $rawContent.Length))
    Write-Host "   Total length: $($rawContent.Length)" -ForegroundColor Gray
} catch {
    Write-Host "1. Failed to read raw: $_" -ForegroundColor Red
}

# Method 2: With encoding UTF8
try {
    $utf8Content = Get-Content $CredentialFile -Raw -Encoding UTF8
    Write-Host "`n2. UTF8 content (first 100 chars):" -ForegroundColor Cyan
    Write-Host $utf8Content.Substring(0, [Math]::Min(100, $utf8Content.Length))
    
    # Try to decrypt
    try {
        $secureString = ConvertTo-SecureString -String $utf8Content -ErrorAction Stop
        $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        )
        Write-Host "   [OK] Successfully decrypted with UTF8!" -ForegroundColor Green
        Write-Host "   Decrypted content (first 100 chars): $($plainText.Substring(0, [Math]::Min(100, $plainText.Length)))" -ForegroundColor Green
    } catch {
        Write-Host "   [X] UTF8 decrypt failed: $_" -ForegroundColor Red
    }
} catch {
    Write-Host "2. Failed to read UTF8: $_" -ForegroundColor Red
}

# Method 3: With encoding ASCII
try {
    $asciiContent = Get-Content $CredentialFile -Raw -Encoding ASCII
    Write-Host "`n3. ASCII content (first 100 chars):" -ForegroundColor Cyan
    Write-Host $asciiContent.Substring(0, [Math]::Min(100, $asciiContent.Length))
    
    # Try to decrypt
    try {
        $secureString = ConvertTo-SecureString -String $asciiContent -ErrorAction Stop
        $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
        )
        Write-Host "   [OK] Successfully decrypted with ASCII!" -ForegroundColor Green
        Write-Host "   Decrypted content (first 100 chars): $($plainText.Substring(0, [Math]::Min(100, $plainText.Length)))" -ForegroundColor Green
    } catch {
        Write-Host "   [X] ASCII decrypt failed: $_" -ForegroundColor Red
    }
} catch {
    Write-Host "3. Failed to read ASCII: $_" -ForegroundColor Red
}

# Method 4: Try System.IO.File methods
try {
    Write-Host "`n4. Using System.IO.File:" -ForegroundColor Cyan
    
    # Try UTF8
    $sysContent = [System.IO.File]::ReadAllText($CredentialFile, [System.Text.Encoding]::UTF8)
    Write-Host "   UTF8 length: $($sysContent.Length)" -ForegroundColor Gray
    
    # Try ASCII
    $sysContentAscii = [System.IO.File]::ReadAllText($CredentialFile, [System.Text.Encoding]::ASCII)
    Write-Host "   ASCII length: $($sysContentAscii.Length)" -ForegroundColor Gray
    
    # Try Default
    $sysContentDefault = [System.IO.File]::ReadAllText($CredentialFile)
    Write-Host "   Default encoding length: $($sysContentDefault.Length)" -ForegroundColor Gray
} catch {
    Write-Host "4. System.IO.File failed: $_" -ForegroundColor Red
}