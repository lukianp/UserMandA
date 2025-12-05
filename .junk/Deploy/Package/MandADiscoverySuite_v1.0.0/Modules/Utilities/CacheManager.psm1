# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 2.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    In-memory cache management module for M&A Discovery Suite
.DESCRIPTION
    Provides functions to cache frequently accessed data with time-to-live (TTL) and support for cache invalidation. 
    This module implements a thread-safe caching system using ConcurrentDictionary for high-performance data caching 
    across concurrent operations. It includes automatic cache cleanup, TTL management, cache statistics, and 
    comprehensive cache lifecycle management for optimal performance and memory usage.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, .NET Framework 4.7.2+
#>

using namespace System.Collections.Concurrent
using namespace System.Threading

# Internal cache storage
$script:CacheStore = [ConcurrentDictionary[string, object]]::new()
$script:CacheExpiries = [ConcurrentDictionary[string, datetime]]::new()

function Set-CacheItem {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,
        
        [Parameter(Mandatory=$true)]
        [object]$Value,
        
        [Parameter(Mandatory=$false)]
        [int]$TimeToLiveSeconds = 300 # Default 5 minutes
    )
    
    try {
        $script:CacheStore[$Key] = $Value
        $script:CacheExpiries[$Key] = (Get-Date).AddSeconds($TimeToLiveSeconds)
        Write-Verbose "Cached item '$Key' with TTL of $TimeToLiveSeconds seconds."
        return $true
    } catch {
        Write-Warning "Failed to set cache item '$Key': $($_.Exception.Message)"
        return $false
    }
}

function Get-CacheItem {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key
    )
    
    try {
        if ($script:CacheStore.ContainsKey($Key)) {
            if ($script:CacheExpiries.ContainsKey($Key) -and $script:CacheExpiries[$Key] -gt (Get-Date)) {
                Write-Verbose "Retrieved cached item '$Key'."
                return $script:CacheStore[$Key]
            } else {
                Remove-CacheItem -Key $Key # Item expired
                Write-Verbose "Cached item '$Key' expired and was removed."
            }
        }
        Write-Verbose "Cache miss for item '$Key'."
        return $null
    } catch {
        Write-Warning "Failed to get cache item '$Key': $($_.Exception.Message)"
        return $null
    }
}

function Remove-CacheItem {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key
    )
    
    try {
        $valueRemoved = $script:CacheStore.TryRemove($Key, [ref]$null)
        $expiryRemoved = $script:CacheExpiries.TryRemove($Key, [ref]$null)
        
        if ($valueRemoved) {
            Write-Verbose "Removed item '$Key' from cache."
            return $true
        } else {
            Write-Verbose "Item '$Key' not found in cache for removal."
            return $false
        }
    } catch {
        Write-Warning "Failed to remove cache item '$Key': $($_.Exception.Message)"
        return $false
    }
}

function Clear-Cache {
    [CmdletBinding()]
    param()
    
    try {
        $script:CacheStore.Clear()
        $script:CacheExpiries.Clear()
        Write-Verbose "Cache cleared."
        return $true
    } catch {
        Write-Warning "Failed to clear cache: $($_.Exception.Message)"
        return $false
    }
}

function Get-CacheStats {
    [CmdletBinding()]
    param()
    
    try {
        $expiredCount = 0
        foreach ($key in $script:CacheExpiries.Keys) {
            if ($script:CacheExpiries[$key] -le (Get-Date)) {
                $expiredCount++
            }
        }
        
        return [PSCustomObject]@{
            ItemCount = $script:CacheStore.Count
            ExpiredItemCount = $expiredCount
            ActiveItemCount = $script:CacheStore.Count - $expiredCount
        }
    } catch {
        Write-Warning "Failed to get cache stats: $($_.Exception.Message)"
        return $null
    }
}

Export-ModuleMember -Function @(
    'Set-CacheItem',
    'Get-CacheItem',
    'Remove-CacheItem',
    'Clear-Cache',
    'Get-CacheStats'
)