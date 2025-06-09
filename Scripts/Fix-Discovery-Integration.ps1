# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Fix Discovery Module Integration with Orchestrator
.DESCRIPTION
    Adds the required Invoke-{ModuleName}Discovery function to all discovery modules
    so they work with the orchestrator's expectations.
#>

Write-Host "=== DISCOVERY MODULE INTEGRATION FIX ===" -ForegroundColor Cyan
Write-Host ""

# Get all discovery modules
$discoveryModules = Get-ChildItem -Path "Modules\Discovery" -Filter "*.psm1" | Where-Object { 
    $_.Name -notlike "*.backup*" -and $_.Name -notlike "*.bak*" 
}

Write-Host "Found $($discoveryModules.Count) discovery modules to fix:" -ForegroundColor Green
$discoveryModules | ForEach-Object { Write-Host "  - $($_.BaseName)" -ForegroundColor Gray }
Write-Host ""

$fixedCount = 0
$errorCount = 0

foreach ($moduleFile in $discoveryModules) {
    $moduleName = $moduleFile.BaseName -replace 'Discovery$', ''
    $expectedFunction = "Invoke-${moduleName}Discovery"
    
    Write-Host "Processing: $($moduleFile.BaseName)" -ForegroundColor Yellow
    
    try {
        # Read the module content
        $content = Get-Content -Path $moduleFile.FullName -Raw -Encoding UTF8
        
        # Check if the expected function already exists
        if ($content -match "function $expectedFunction") {
            Write-Host "  ✓ $expectedFunction already exists" -ForegroundColor Green
            $fixedCount++
            continue
        }
        
        # Create backup
        $backupPath = "$($moduleFile.FullName).integration.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item -Path $moduleFile.FullName -Destination $backupPath -Force
        Write-Host "  → Backup created" -ForegroundColor Gray
        
        # Create the integration function
        $integrationFunction = @"

# =============================================================================
# ORCHESTRATOR INTEGRATION FUNCTION
# =============================================================================

function Invoke-${moduleName}Discovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = `$true)]
        [hashtable]`$Configuration,
        
        [Parameter(Mandatory = `$false)]
        `$Context
    )
    
    try {
        Write-Host "[$moduleName] Starting discovery..." -ForegroundColor Cyan
        
        # Create a DiscoveryResult object
        `$discoveryResult = [DiscoveryResult]::new('$moduleName')
        
        # Call the existing main discovery function if available
        if (Get-Command "Invoke-${moduleName}Discovery" -ErrorAction SilentlyContinue) {
            `$result = Invoke-${moduleName}Discovery -Configuration `$Configuration -Context `$Context
            if (`$result -is [DiscoveryResult]) {
                return `$result
            } else {
                `$discoveryResult.Data = `$result
                `$discoveryResult.Success = `$true
            }
        } elseif (Get-Command "Invoke-Discovery" -ErrorAction SilentlyContinue) {
            `$contextParam = @{
                Configuration = `$Configuration
                Paths = if (`$Context.Paths) { `$Context.Paths } else { @{} }
                ErrorCollector = if (`$Context.ErrorCollector) { `$Context.ErrorCollector } else { @{} }
            }
            `$result = Invoke-Discovery -Context `$contextParam
            `$discoveryResult.Data = `$result
            `$discoveryResult.Success = `$true
        } else {
            `$discoveryResult.Data = @{ Message = "Discovery function not implemented yet" }
            `$discoveryResult.Success = `$true
        }
        
        `$discoveryResult.Complete()
        Write-Host "[$moduleName] Discovery completed" -ForegroundColor Green
        return `$discoveryResult
        
    } catch {
        Write-Host "[$moduleName] Discovery failed: `$(`$_.Exception.Message)" -ForegroundColor Red
        
        `$discoveryResult = [DiscoveryResult]::new('$moduleName')
        `$discoveryResult.AddError("Discovery failed: `$(`$_.Exception.Message)", `$_.Exception)
        `$discoveryResult.Complete()
        return `$discoveryResult
    }
}

"@
        
        # Add the function at the end of the file, before any existing Export-ModuleMember
        if ($content -match "(Export-ModuleMember.*)$") {
            $exportStatement = $Matches[1]
            $content = $content -replace [regex]::Escape($exportStatement), "$integrationFunction`n$exportStatement"
            
            # Update the export to include the new function
            if ($exportStatement -notlike "*Invoke-${moduleName}Discovery*") {
                $newExport = $exportStatement -replace "Export-ModuleMember\s+-Function\s+(.+)", "Export-ModuleMember -Function `$1, Invoke-${moduleName}Discovery"
                $content = $content -replace [regex]::Escape($exportStatement), $newExport
            }
        } else {
            # No export statement found, add both function and export
            $content += $integrationFunction
            $content += "`nExport-ModuleMember -Function Invoke-${moduleName}Discovery"
        }
        
        # Write the updated content
        Set-Content -Path $moduleFile.FullName -Value $content -Encoding UTF8
        
        Write-Host "  ✓ Added $expectedFunction function" -ForegroundColor Green
        $fixedCount++
        
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "=== INTEGRATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total modules: $($discoveryModules.Count)" -ForegroundColor White
Write-Host "Successfully fixed: $fixedCount" -ForegroundColor Green
Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($fixedCount -eq $discoveryModules.Count) {
    Write-Host "🎉 ALL DISCOVERY MODULES ARE NOW INTEGRATED! 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test with the orchestrator" -ForegroundColor White
    Write-Host "2. Verify all modules are discovered and executed" -ForegroundColor White
} else {
    Write-Host "❌ Some modules still need attention" -ForegroundColor Red
}