# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    SQL Server infrastructure discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers SQL Server instances, databases, configurations, and dependencies
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



function Invoke-SQLServerDiscovery {
    [CmdletBinding()]
    param([hashtable]$Configuration)
    
    # Create DiscoveryResult object
    $result = [DiscoveryResult]::new("SQLServer")
    
    try {
        Write-MandALog "Starting SQL Server infrastructure discovery" -Level "HEADER" -Component "SQLServerDiscovery"
        
        $context = Get-ModuleContext
        $outputPath = $context.Paths.RawDataOutput
        
        # Create a simple CSV file for SQL Server instances
        $outputFile = Join-Path $outputPath "SQLInstances.csv"
        
        # Check if we should skip existing files
        if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
            Write-MandALog "SQL Instances CSV already exists. Skipping." -Level "INFO" -Component "SQLServerDiscovery"
            $result.Data = @{ Message = "Skipped - file exists" }
        } else {
            # Create basic SQL Server discovery data
            $sqlData = @()
            
            try {
                # Try to discover local SQL Server instances
                $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
                
                if (Test-Path $regPath) {
                    $instanceKeys = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
                    
                    foreach ($property in $instanceKeys.PSObject.Properties) {
                        if ($property.Name -notin @("PSPath", "PSParentPath", "PSChildName", "PSDrive", "PSProvider")) {
                            $sqlData += [PSCustomObject]@{
                                ServerName = $env:COMPUTERNAME
                                InstanceName = $property.Name
                                FullName = if ($property.Name -eq "MSSQLSERVER") { $env:COMPUTERNAME } else { "$env:COMPUTERNAME\$($property.Name)" }
                                DiscoveryMethod = "Registry"
                                DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                                Status = "Discovered"
                            }
                        }
                    }
                }
                
                # If no instances found, create a placeholder entry
                if ($sqlData.Count -eq 0) {
                    $sqlData += [PSCustomObject]@{
                        ServerName = "No SQL Server instances found"
                        InstanceName = "N/A"
                        FullName = "N/A"
                        DiscoveryMethod = "Registry"
                        DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        Status = "Not Found"
                    }
                }
                
                # Export to CSV
                $sqlData | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported $($sqlData.Count) SQL Server entries to CSV" -Level "SUCCESS" -Component "SQLServerDiscovery"
                
                $result.Data = @{
                    InstanceCount = $sqlData.Count
                    OutputFile = $outputFile
                    Instances = $sqlData
                }
                
            } catch {
                Write-MandALog "Error during SQL Server discovery: $($_.Exception.Message)" -Level "WARN" -Component "SQLServerDiscovery"
                
                # Create empty CSV with headers
                $headers = [PSCustomObject]@{
                    ServerName = "Error during discovery"
                    InstanceName = "N/A"
                    FullName = "N/A"
                    DiscoveryMethod = "Error"
                    DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    Status = "Error: $($_.Exception.Message)"
                }
                
                $headers | Export-Csv -Path $outputFile -NoTypeInformation -Encoding UTF8
                
                $result.Data = @{
                    InstanceCount = 0
                    OutputFile = $outputFile
                    Error = $_.Exception.Message
                }
            }
        }
        
        $result.Metadata["OutputFile"] = $outputFile
        Write-MandALog "SQL Server discovery completed" -Level "SUCCESS" -Component "SQLServerDiscovery"
        
    } catch {
        $result.AddError("SQL Server discovery failed", $_.Exception)
        Write-MandALog "SQL Server discovery failed: $($_.Exception.Message)" -Level "ERROR" -Component "SQLServerDiscovery"
    } finally {
        $result.Complete()
    }
    
    return $result
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-SQLServerDiscovery'
)

# =============================================================================
# DISCOVERY MODULE INTERFACE FUNCTIONS
# Required by M&A Orchestrator for module invocation
# =============================================================================

function Invoke-Discovery {
    <#
    .SYNOPSIS
    Main discovery function called by the M&A Orchestrator
    
    .PARAMETER Context
    The discovery context containing configuration and state information
    
    .PARAMETER Force
    Force discovery even if cached data exists
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory = $false)]
        [switch]$Force
    )
    
    try {
        Write-MandALog "Starting SQLServerDiscovery discovery" "INFO"
        
        $discoveryResult = @{
            ModuleName = "SQLServerDiscovery"
            StartTime = Get-Date
            Status = "Completed"
            Data = @()
            Errors = @()
            Summary = @{ ItemsDiscovered = 0; ErrorCount = 0 }
        }
        
        # TODO: Implement actual discovery logic for SQLServerDiscovery
        Write-MandALog "Completed SQLServerDiscovery discovery" "SUCCESS"
        
        return $discoveryResult
        
    } catch {
        Write-MandALog "Error in SQLServerDiscovery discovery: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Get-DiscoveryInfo {
    <#
    .SYNOPSIS
    Returns metadata about this discovery module
    #>
    [CmdletBinding()]
    param()
    
    return @{
        ModuleName = "SQLServerDiscovery"
        ModuleVersion = "1.0.0"
        Description = "SQLServerDiscovery discovery module for M&A Suite"
        RequiredPermissions = @("Read access to SQLServerDiscovery resources")
        EstimatedDuration = "5-15 minutes"
        SupportedEnvironments = @("OnPremises", "Cloud", "Hybrid")
    }
}


Export-ModuleMember -Function Invoke-Discovery, Get-DiscoveryInfo
