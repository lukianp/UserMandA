# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Helper functions for M&A Discovery Suite modules
.DESCRIPTION
    Provides standardized initialization and path resolution
#>

function Initialize-MandAModuleContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration
    )
    
    # If context provided, validate and return it
    if ($Context) {
        if ($Context.Paths -and $Context.Config) {
            return $Context
        }
    }
    
    # Try to use global context
    if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Config) {
        return [PSCustomObject]@{
            Paths = $global:MandA.Paths
            Config = if ($Configuration) { $Configuration } else { $global:MandA.Config }
            CompanyName = $global:MandA.CompanyName
        }
    }
    
    # Fallback: create minimal context
    $suiteRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    return [PSCustomObject]@{
        Paths = @{
            SuiteRoot = $suiteRoot
            RawDataOutput = "C:\MandADiscovery\Profiles\Unknown\Raw"
            ProcessedDataOutput = "C:\MandADiscovery\Profiles\Unknown\Processed"
            LogOutput = "C:\MandADiscovery\Profiles\Unknown\Logs"
        }
        Config = if ($Configuration) { $Configuration } else { @{} }
        CompanyName = "Unknown"
    }
}

function Get-MandAModulePath {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        [string]$Category = "Utilities"
    )
    
    # Try global paths first
    if ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.$Category) {
        return Join-Path $global:MandA.Paths.$Category "$ModuleName.psm1"
    }
    
    # Try relative to current module
    if ($PSScriptRoot) {
        $suiteRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
        return Join-Path $suiteRoot "Modules\$Category\$ModuleName.psm1"
    }
    
    # Last resort
    return "C:\MandADiscovery\Modules\$Category\$ModuleName.psm1"
}

Export-ModuleMember -Function Initialize-MandAModuleContext, Get-MandAModulePath