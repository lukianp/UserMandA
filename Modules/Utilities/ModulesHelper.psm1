﻿# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Helper functions for M&A Discovery Suite modules
.DESCRIPTION
    Provides standardized initialization and path resolution for M&A Discovery Suite modules. This module includes 
    functions for module context management, path resolution, dependency checking, and standardized module 
    initialization patterns. It ensures consistent module behavior across the entire discovery suite and 
    provides common utility functions used by multiple modules.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    return $result
}

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
    try {
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
    } catch {
        Write-MandALog "Error in function 'Initialize-MandAModuleContext': $($_.Exception.Message)" "ERROR"
        throw
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
    try {
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
    } catch {
        Write-MandALog "Error in function 'Get-MandAModulePath': $($_.Exception.Message)" "ERROR"
        throw
    }
}

Export-ModuleMember -Function Initialize-MandAModuleContext, Get-MandAModulePath