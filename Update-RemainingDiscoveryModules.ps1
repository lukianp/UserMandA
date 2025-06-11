# Update Remaining Discovery Modules Script
# This script updates the remaining discovery modules to use session-based authentication

$modules = @(
    "TeamsDiscovery",
    "LicensingDiscovery", 
    "ExternalIdentityDiscovery",
    "GPODiscovery",
    "EnvironmentDetectionDiscovery",
    "FileServerDiscovery",
    "NetworkInfrastructureDiscovery",
    "SQLServerDiscovery"
)

Write-Host "Updating remaining discovery modules to use new session-based authentication..." -ForegroundColor Green

$updated = 0
$skipped = 0

foreach ($module in $modules) {
    $filePath = "Modules/Discovery/$module.psm1"
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  [SKIP] $module.psm1 - File not found" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    try {
        Write-Host "  [UPDATE] $module.psm1" -ForegroundColor Cyan
        
        # Read the file content
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Check if it already has SessionId parameter
        if ($content -match 'param\([^)]*\[string\]\$SessionId') {
            Write-Host "    Already updated - skipping" -ForegroundColor Yellow
            $skipped++
            continue
        }
        
        # Pattern 1: Remove Get-AuthInfoFromConfiguration function
        $content = $content -replace '(?s)function Get-AuthInfoFromConfiguration \{.*?^}', ''
        
        # Pattern 2: Add SessionId parameter to main function
        $content = $content -replace '(\[hashtable\]\$Context\s*\))', '$1,

        [Parameter(Mandatory=$false)]
        [string]$SessionId
    )'
        
        # Pattern 3: Replace authentication section
        $authPattern = '(?s)# 4\. AUTHENTICATE & CONNECT.*?Write-.*Log.*"Connected to Microsoft Graph".*?Context \$Context.*?\n'
        $authReplacement = @'
        # 4. AUTHENTICATE & CONNECT
        Write-$($module.Replace('Discovery',''))Log -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-$($module.Replace('Discovery',''))Log -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

'@
        
        $content = $content -replace $authPattern, $authReplacement
        
        # Write the updated content back
        $content | Set-Content $filePath -Encoding UTF8 -NoNewline
        
        Write-Host "    Successfully updated" -ForegroundColor Green
        $updated++
        
    } catch {
        Write-Host "    Error updating: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nUpdate Summary:" -ForegroundColor Green
Write-Host "  Updated: $updated modules" -ForegroundColor Green
Write-Host "  Skipped: $skipped modules" -ForegroundColor Yellow
Write-Host "  Total: $($modules.Count) modules processed" -ForegroundColor Cyan

if ($updated -gt 0) {
    Write-Host "`nRemaining discovery modules have been updated to use the new session-based authentication!" -ForegroundColor Green
} else {
    Write-Host "`nNo modules were updated. They may already be using the new authentication pattern." -ForegroundColor Yellow
}