# Script to update all discovery modules to use new session-based authentication
Write-Host "Updating all discovery modules to use new session-based authentication..." -ForegroundColor Cyan

$discoveryModules = @(
    "GraphDiscovery.psm1",
    "IntuneDiscovery.psm1", 
    "SharePointDiscovery.psm1",
    "TeamsDiscovery.psm1",
    "LicensingDiscovery.psm1",
    "ExternalIdentityDiscovery.psm1",
    "GPODiscovery.psm1",
    "EnvironmentDetectionDiscovery.psm1",
    "FileServerDiscovery.psm1",
    "NetworkInfrastructureDiscovery.psm1",
    "SQLServerDiscovery.psm1"
)

$updatedCount = 0
$skippedCount = 0

foreach ($module in $discoveryModules) {
    $modulePath = ".\Modules\Discovery\$module"
    
    if (-not (Test-Path $modulePath)) {
        Write-Host "  [SKIP] $module - File not found" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    Write-Host "  [UPDATE] $module" -ForegroundColor Green
    
    try {
        # Read the current content
        $content = Get-Content $modulePath -Raw
        
        # Check if already updated
        if ($content -match 'SessionId.*Parameter.*Mandatory.*true') {
            Write-Host "    Already updated - skipping" -ForegroundColor Gray
            $skippedCount++
            continue
        }
        
        # 1. Add authentication service import after the header
        if ($content -match '#================================================================================') {
            $content = $content -replace '(#================================================================================[^\r\n]*[\r\n]+)', "`$1`r`n# Import authentication service`r`nImport-Module (Join-Path (Split-Path `$PSScriptRoot -Parent) `"Authentication\AuthenticationService.psm1`") -Force`r`n"
        }
        
        # 2. Update function signature to include SessionId parameter
        $functionPattern = '(function Invoke-\w+Discovery\s*\{[^\}]*param\s*\([^)]*\[hashtable\]\$Context[^)]*)\)'
        $replacement = '$1,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )'
        $content = $content -replace $functionPattern, $replacement
        
        # 3. Update the header message to indicate v3.0
        $content = $content -replace '(Write-\w+Log[^"]*"[^"]*Starting Discovery[^"]*)"', '$1 (v3.0 - Session-based)"'
        
        # 4. Add SessionId logging after the header
        $headerPattern = '(Write-\w+Log[^"]*"[^"]*Starting Discovery[^"]*"[^}]*[\r\n]+)'
        $content = $content -replace $headerPattern, '$1    Write-$($module.Replace("Discovery.psm1",""))Log -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context' + "`r`n"
        
        # 5. Replace complex authentication with simple service call
        $authPattern = '# 4\. AUTHENTICATE & CONNECT[\s\S]*?catch \{[\s\S]*?return \$result[\s\S]*?\}'
        $simpleAuth = '# 4. AUTHENTICATE & CONNECT - SIMPLIFIED!
        Write-$($module.Replace("Discovery.psm1",""))Log -Level "INFO" -Message "Getting authentication for services..." -Context $Context
        
        try {
            # Get Graph authentication using the new authentication service
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-$($module.Replace("Discovery.psm1",""))Log -Level "SUCCESS" -Message "Connected to Microsoft Graph via session" -Context $Context
            
        } catch {
            $result.AddError("Failed to authenticate with services: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }'
        $content = $content -replace $authPattern, $simpleAuth
        
        # 6. Add SessionId to metadata
        $metadataPattern = '(\$result\.Metadata\["TotalRecords"\][^}]*)'
        $content = $content -replace $metadataPattern, '$1' + "`r`n        `$result.Metadata[`"SessionId`"] = `$SessionId"
        
        # 7. Add SessionId to CSV exports
        $csvPattern = '(\$_ \| Add-Member[^}]*"_DiscoveryModule"[^}]*)'
        $content = $content -replace $csvPattern, '$1' + "`r`n                    `$_ | Add-Member -MemberType NoteProperty -Name `"_SessionId`" -Value `$SessionId -Force"
        
        # 8. Simplify cleanup section
        $cleanupPattern = '# 8\. CLEANUP & COMPLETE[\s\S]*?Write-\w+Log[^"]*"[^"]*Cleaning up[^"]*"[\s\S]*?# Ignore[^}]*\}'
        $simpleCleanup = '# 8. CLEANUP & COMPLETE
        Write-$($module.Replace("Discovery.psm1",""))Log -Level "INFO" -Message "Discovery completed (connections managed by auth service)" -Context $Context'
        $content = $content -replace $cleanupPattern, $simpleCleanup
        
        # Write the updated content back
        Set-Content -Path $modulePath -Value $content -Encoding UTF8
        
        Write-Host "    Successfully updated" -ForegroundColor Green
        $updatedCount++
        
    } catch {
        Write-Host "    Error updating: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nUpdate Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updatedCount modules" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount modules" -ForegroundColor Yellow
Write-Host "  Total: $($discoveryModules.Count) modules processed" -ForegroundColor White

Write-Host "`nAll discovery modules have been updated to use the new session-based authentication!" -ForegroundColor Green