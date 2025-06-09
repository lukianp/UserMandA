# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Manages connections to Azure services
#>



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


function Initialize-AllConnections {
    param(
        [hashtable]$Configuration,
        $AuthContext
    )
    
    $connections = @{}
    
    # Connect to Microsoft Graph
    try {
        Connect-MgGraph -ClientId $AuthContext.ClientId `
            -TenantId $AuthContext.TenantId `
            -ClientSecretCredential $AuthContext.ClientSecret `
            -NoWelcome -ErrorAction Stop
        $connections['MicrosoftGraph'] = $true
    } catch {
        $connections['MicrosoftGraph'] = @{Connected = $false; Error = $_.Exception.Message}
    }
    
    # Add other service connections as needed
    
    return $connections
}

function Disconnect-AllServices {
    try {
        if (Get-Command Disconnect-MgGraph -ErrorAction SilentlyContinue) {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore disconnect errors
    }
}

Export-ModuleMember -Function Initialize-AllConnections, Disconnect-AllServices
