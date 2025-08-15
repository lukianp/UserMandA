# Fix-CommentBlock.ps1
# Fixes the multiline comment issue in DiscoveryCreateAppRegistration.ps1

param(
    [string]$ScriptPath = ".\DiscoveryCreateAppRegistration.ps1"
)

if (-not (Test-Path $ScriptPath)) {
    Write-Error "Script not found at: $ScriptPath"
    exit 1
}

Write-Host "Fixing multiline comment in DiscoveryCreateAppRegistration.ps1..." -ForegroundColor Yellow

# Read the script content
$content = Get-Content $ScriptPath -Raw

# Fix the comment block that starts after the first #> and continues with # PARAMETERS
$pattern = @'
#>
# PARAMETERS
#     -LogPath: Path for detailed execution log \(default: \.\\MandADiscovery_Registration_Log\.txt\)
#     -EncryptedOutputPath: Path for encrypted credentials file \(default: C:\\DiscoveryData\\discoverycredentials\.config\)
#     -Force: Force recreation of existing app registration
#     -ValidateOnly: Only validate prerequisites without creating resources
#     -SkipAzureRoles: Skip Azure subscription role assignments
#     -SecretValidityYears: Client secret validity period in years \(default: 2, max: 2\)
#
'@

$replacement = @'
#>
<#
.PARAMETER LogPath
    Path for detailed execution log (default: .\MandADiscovery_Registration_Log.txt)
.PARAMETER EncryptedOutputPath
    Path for encrypted credentials file (default: C:\DiscoveryData\discoverycredentials.config)
.PARAMETER Force
    Force recreation of existing app registration
.PARAMETER ValidateOnly
    Only validate prerequisites without creating resources
.PARAMETER SkipAzureRoles
    Skip Azure subscription role assignments
.PARAMETER SecretValidityYears
    Client secret validity period in years (default: 2, max: 2)
'@

# Try to find and replace the problematic section
if ($content -match '(#>\s*\r?\n)(# PARAMETERS[\s\S]*?)(#\s*\r?\n\s*# EXAMPLES)') {
    Write-Host "Found problematic comment block" -ForegroundColor Yellow
    
    # Replace the section between #> and # EXAMPLES
    $content = $content -replace '(#>\s*\r?\n)(# PARAMETERS[\s\S]*?)(#\s*\r?\n\s*# EXAMPLES)', "`$1<#`n.PARAMETER LogPath`n    Path for detailed execution log (default: .\MandADiscovery_Registration_Log.txt)`n.PARAMETER EncryptedOutputPath`n    Path for encrypted credentials file (default: C:\DiscoveryData\discoverycredentials.config)`n.PARAMETER Force`n    Force recreation of existing app registration`n.PARAMETER ValidateOnly`n    Only validate prerequisites without creating resources`n.PARAMETER SkipAzureRoles`n    Skip Azure subscription role assignments`n.PARAMETER SecretValidityYears`n    Client secret validity period in years (default: 2, max: 2)`n#>`n`$3"
    
    Write-Host "✓ Fixed multiline comment block" -ForegroundColor Green
} else {
    # Alternative approach - look for just the PARAMETERS section
    if ($content -match '#>\s*\r?\n# PARAMETERS') {
        Write-Host "Found PARAMETERS section after #>" -ForegroundColor Yellow
        
        # Find where the next multiline comment or param( starts
        if ($content -match '(#>\s*\r?\n)(# PARAMETERS[\s\S]*?)(\[CmdletBinding|\<#|param\s*\()') {
            $parametersBlock = $matches[2]
            $nextSection = $matches[3]
            
            # Convert the # PARAMETERS block to proper PowerShell comment-based help
            $newBlock = @"
#>
<#
.PARAMETER LogPath
    Path for detailed execution log (default: .\MandADiscovery_Registration_Log.txt)
.PARAMETER EncryptedOutputPath
    Path for encrypted credentials file (default: C:\DiscoveryData\discoverycredentials.config)
.PARAMETER Force
    Force recreation of existing app registration
.PARAMETER ValidateOnly
    Only validate prerequisites without creating resources
.PARAMETER SkipAzureRoles
    Skip Azure subscription role assignments
.PARAMETER SecretValidityYears
    Client secret validity period in years (default: 2, max: 2)
.PARAMETER AutoInstallModules
    Automatically install missing PowerShell modules
#>
"@
            
            $content = $content -replace [regex]::Escape("#>`n$parametersBlock"), "$newBlock"
            Write-Host "✓ Converted PARAMETERS block to proper comment-based help" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ Could not find the problematic comment section" -ForegroundColor Red
        Write-Host "Please check for any unclosed multiline comments in the file" -ForegroundColor Yellow
    }
}

# Save the fixed content
$backupPath = $ScriptPath -replace '\.ps1$', '_comment_backup.ps1'
Copy-Item $ScriptPath $backupPath -Force
Write-Host "✓ Created backup at: $backupPath" -ForegroundColor Green

Set-Content $ScriptPath $content -Force
Write-Host "✓ Saved fixed script" -ForegroundColor Green

Write-Host "`nComment block fixed! Now try running the script again." -ForegroundColor Cyan