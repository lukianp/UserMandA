# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06

<#
.SYNOPSIS
    Authentication Monitoring Module for M&A Discovery Suite
.DESCRIPTION
    Provides comprehensive authentication status monitoring and visibility functions
    for all connected services including Microsoft Graph, Exchange Online, and On-Premises AD.
.NOTES
    Version: 1.0.0
    Created: 2025-06-06
    
    Key Features:
    - Real-time authentication status checking
    - Multi-service connection validation
    - Detailed connection information display
    - Error handling and reporting
#>

#===============================================================================
#                       AUTHENTICATION STATUS FUNCTIONS
#===============================================================================

function Show-AuthenticationStatus {
    <#
    .SYNOPSIS
        Displays comprehensive authentication status for all connected services
    .DESCRIPTION
        Checks and displays the authentication status for Microsoft Graph, Exchange Online,
        and On-Premises Active Directory connections with detailed information.
    .PARAMETER Context
        The M&A Discovery Suite context object containing configuration and connection information
    .EXAMPLE
        Show-AuthenticationStatus -Context $global:MandA
    .EXAMPLE
        Show-AuthenticationStatus -Context $Context
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    Write-Host "`n=== AUTHENTICATION STATUS ===" -ForegroundColor Cyan
    
    try {
        # Check Graph/Azure Authentication
        Test-GraphAuthentication -Context $Context
        
        # Check Exchange Online
        Test-ExchangeOnlineAuthentication -Context $Context
        
        # Check On-Premises AD
        Test-OnPremisesADAuthentication -Context $Context
        
        # Check additional services if available
        Test-AdditionalServiceAuthentication -Context $Context
        
    } catch {
        Write-Host "[!!] Error checking authentication status: $($_.Exception.Message)" -ForegroundColor Red
        Write-MandALog -Message "Authentication status check failed: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
    
    Write-Host "============================`n" -ForegroundColor Cyan
}

function Test-GraphAuthentication {
    <#
    .SYNOPSIS
        Tests Microsoft Graph authentication status
    .PARAMETER Context
        The M&A Discovery Suite context object
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    try {
        # Check if Microsoft Graph PowerShell module is available
        if (Get-Command Get-MgContext -ErrorAction SilentlyContinue) {
            $mgContext = Get-MgContext
            if ($mgContext) {
                Write-Host "[OK] Microsoft Graph Connected" -ForegroundColor Green
                Write-Host "  - Tenant: $($mgContext.TenantId)" -ForegroundColor Gray
                Write-Host "  - Account: $($mgContext.Account)" -ForegroundColor Gray
                Write-Host "  - Scopes: $($mgContext.Scopes -join ', ')" -ForegroundColor Gray
                Write-Host "  - App Name: $($mgContext.AppName)" -ForegroundColor Gray
                Write-Host "  - Auth Type: $($mgContext.AuthType)" -ForegroundColor Gray
                
                # Check token expiration if available
                if ($mgContext.TokenCredential) {
                    Write-Host "  - Token Status: Active" -ForegroundColor Gray
                }
                
                Write-MandALog -Message "Microsoft Graph authentication verified successfully" -Level "SUCCESS" -Component "AuthMonitoring"
            } else {
                Write-Host "[!!] Microsoft Graph NOT Connected" -ForegroundColor Red
                Write-Host "  - Run Connect-MgGraph to authenticate" -ForegroundColor Yellow
                Write-MandALog -Message "Microsoft Graph not connected" -Level "WARN" -Component "AuthMonitoring"
            }
        } else {
            Write-Host "[!!] Microsoft Graph PowerShell Module NOT Available" -ForegroundColor Red
            Write-Host "  - Install with: Install-Module Microsoft.Graph" -ForegroundColor Yellow
            Write-MandALog -Message "Microsoft Graph PowerShell module not available" -Level "WARN" -Component "AuthMonitoring"
        }
    } catch {
        Write-Host "[!!] Error checking Microsoft Graph status: $($_.Exception.Message)" -ForegroundColor Red
        Write-MandALog -Message "Error checking Microsoft Graph authentication: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
}

function Test-ExchangeOnlineAuthentication {
    <#
    .SYNOPSIS
        Tests Exchange Online authentication status
    .PARAMETER Context
        The M&A Discovery Suite context object
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    try {
        # Check Exchange Online PowerShell sessions
        if (Get-Command Get-PSSession -ErrorAction SilentlyContinue) {
            $exoSession = Get-PSSession | Where-Object { 
                $_.ConfigurationName -eq "Microsoft.Exchange" -or 
                $_.ComputerName -like "*outlook.office365.com*" -or
                $_.Name -like "*ExchangeOnline*"
            }
            
            if ($exoSession -and $exoSession.State -eq "Opened") {
                Write-Host "[OK] Exchange Online Connected" -ForegroundColor Green
                Write-Host "  - Computer: $($exoSession.ComputerName)" -ForegroundColor Gray
                Write-Host "  - State: $($exoSession.State)" -ForegroundColor Gray
                Write-Host "  - Session ID: $($exoSession.Id)" -ForegroundColor Gray
                Write-Host "  - Configuration: $($exoSession.ConfigurationName)" -ForegroundColor Gray
                
                # Test a simple Exchange Online command
                try {
                    $orgConfig = Get-OrganizationConfig -ErrorAction SilentlyContinue | Select-Object -First 1
                    if ($orgConfig) {
                        Write-Host "  - Organization: $($orgConfig.DisplayName)" -ForegroundColor Gray
                        Write-Host "  - Commands Available: Yes" -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "  - Commands Available: Limited (Error: $($_.Exception.Message))" -ForegroundColor Yellow
                }
                
                Write-MandALog -Message "Exchange Online authentication verified successfully" -Level "SUCCESS" -Component "AuthMonitoring"
            } else {
                Write-Host "[!!] Exchange Online NOT Connected" -ForegroundColor Red
                Write-Host "  - Run Connect-ExchangeOnline to authenticate" -ForegroundColor Yellow
                Write-MandALog -Message "Exchange Online not connected" -Level "WARN" -Component "AuthMonitoring"
            }
        } else {
            Write-Host "[!!] PowerShell Session Management NOT Available" -ForegroundColor Red
            Write-MandALog -Message "PowerShell session management not available for Exchange Online check" -Level "WARN" -Component "AuthMonitoring"
        }
    } catch {
        Write-Host "[!!] Error checking Exchange Online status: $($_.Exception.Message)" -ForegroundColor Red
        Write-MandALog -Message "Error checking Exchange Online authentication: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
}

function Test-OnPremisesADAuthentication {
    <#
    .SYNOPSIS
        Tests On-Premises Active Directory authentication status
    .PARAMETER Context
        The M&A Discovery Suite context object
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    try {
        # Get domain controller from configuration
        $dc = $null
        if ($Context.Config -and $Context.Config.environment -and $Context.Config.environment.domainController) {
            $dc = $Context.Config.environment.domainController
        } elseif ($Context.Config -and $Context.Config.onPremises -and $Context.Config.onPremises.domainController) {
            $dc = $Context.Config.onPremises.domainController
        }
        
        if ([string]::IsNullOrWhiteSpace($dc)) {
            # Try to discover domain controller
            try {
                $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
                $dc = $domain.PdcRoleOwner.Name
                Write-Host "  - Auto-discovered DC: $dc" -ForegroundColor Gray
            } catch {
                Write-Host "[!!] On-Premises AD: No Domain Controller configured or discoverable" -ForegroundColor Red
                Write-Host "  - Configure domainController in environment settings" -ForegroundColor Yellow
                return
            }
        }
        
        # Test domain controller connectivity
        $testConnection = Test-Connection -ComputerName $dc -Count 1 -Quiet -ErrorAction SilentlyContinue
        if ($testConnection) {
            Write-Host "[OK] Domain Controller Reachable: $dc" -ForegroundColor Green
            
            # Test AD module and commands
            if (Get-Command Get-ADDomain -ErrorAction SilentlyContinue) {
                try {
                    $domain = Get-ADDomain -Server $dc -ErrorAction SilentlyContinue
                    if ($domain) {
                        Write-Host "  - Domain: $($domain.Name)" -ForegroundColor Gray
                        Write-Host "  - Forest: $($domain.Forest)" -ForegroundColor Gray
                        Write-Host "  - Domain Mode: $($domain.DomainMode)" -ForegroundColor Gray
                        Write-Host "  - PDC Emulator: $($domain.PDCEmulator)" -ForegroundColor Gray
                        
                        # Test user query capability
                        try {
                            $userCount = (Get-ADUser -Filter * -Server $dc -ResultSetSize 1 -ErrorAction SilentlyContinue | Measure-Object).Count
                            if ($userCount -ge 0) {
                                Write-Host "  - AD Commands: Functional" -ForegroundColor Gray
                            }
                        } catch {
                            Write-Host "  - AD Commands: Limited (Error: $($_.Exception.Message))" -ForegroundColor Yellow
                        }
                        
                        Write-MandALog -Message "On-Premises AD authentication verified successfully" -Level "SUCCESS" -Component "AuthMonitoring"
                    } else {
                        Write-Host "[!!] AD Domain Query Failed" -ForegroundColor Red
                        Write-MandALog -Message "AD domain query failed despite DC connectivity" -Level "WARN" -Component "AuthMonitoring"
                    }
                } catch {
                    Write-Host "[!!] AD Module Error: $($_.Exception.Message)" -ForegroundColor Red
                    Write-MandALog -Message "AD module error: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
                }
            } else {
                Write-Host "[!!] Active Directory PowerShell Module NOT Available" -ForegroundColor Red
                Write-Host "  - Install RSAT or run on domain-joined machine" -ForegroundColor Yellow
                Write-MandALog -Message "Active Directory PowerShell module not available" -Level "WARN" -Component "AuthMonitoring"
            }
        } else {
            Write-Host "[!!] Domain Controller NOT Reachable: $dc" -ForegroundColor Red
            Write-Host "  - Check network connectivity and firewall" -ForegroundColor Yellow
            Write-MandALog -Message "Domain controller not reachable: $dc" -Level "ERROR" -Component "AuthMonitoring"
        }
    } catch {
        Write-Host "[!!] On-Premises AD Check Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-MandALog -Message "On-Premises AD check failed: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
}

function Test-AdditionalServiceAuthentication {
    <#
    .SYNOPSIS
        Tests additional service authentication status (SharePoint, Teams, etc.)
    .PARAMETER Context
        The M&A Discovery Suite context object
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    try {
        # Check SharePoint Online
        if (Get-Command Get-SPOSite -ErrorAction SilentlyContinue) {
            try {
                $spoSites = Get-SPOSite -Limit 1 -ErrorAction SilentlyContinue
                if ($spoSites) {
                    Write-Host "[OK] SharePoint Online Connected" -ForegroundColor Green
                    Write-Host "  - Commands Available: Yes" -ForegroundColor Gray
                } else {
                    Write-Host "[!!] SharePoint Online NOT Connected" -ForegroundColor Red
                    Write-Host "  - Run Connect-SPOService to authenticate" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "[!!] SharePoint Online Connection Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Check Teams PowerShell
        if (Get-Command Get-Team -ErrorAction SilentlyContinue) {
            try {
                $teams = Get-Team -NumberOfThreads 1 -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($teams) {
                    Write-Host "[OK] Microsoft Teams Connected" -ForegroundColor Green
                    Write-Host "  - Commands Available: Yes" -ForegroundColor Gray
                } else {
                    Write-Host "[!!] Microsoft Teams NOT Connected" -ForegroundColor Red
                    Write-Host "  - Run Connect-MicrosoftTeams to authenticate" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "[!!] Microsoft Teams Connection Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Check Azure AD (if different from Graph)
        if (Get-Command Get-AzureADTenantDetail -ErrorAction SilentlyContinue) {
            try {
                $tenantDetail = Get-AzureADTenantDetail -ErrorAction SilentlyContinue
                if ($tenantDetail) {
                    Write-Host "[OK] Azure AD (AzureAD Module) Connected" -ForegroundColor Green
                    Write-Host "  - Tenant: $($tenantDetail.DisplayName)" -ForegroundColor Gray
                    Write-Host "  - Tenant ID: $($tenantDetail.ObjectId)" -ForegroundColor Gray
                } else {
                    Write-Host "[!!] Azure AD (AzureAD Module) NOT Connected" -ForegroundColor Red
                    Write-Host "  - Run Connect-AzureAD to authenticate" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "[!!] Azure AD Connection Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "[!!] Error checking additional services: $($_.Exception.Message)" -ForegroundColor Red
        Write-MandALog -Message "Error checking additional service authentication: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
}

#===============================================================================
#                       AUTHENTICATION HELPER FUNCTIONS
#===============================================================================

function Get-AuthenticationSummary {
    <#
    .SYNOPSIS
        Returns a structured summary of authentication status
    .DESCRIPTION
        Provides a programmatic way to check authentication status without console output
    .PARAMETER Context
        The M&A Discovery Suite context object
    .OUTPUTS
        Hashtable containing authentication status for all services
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    $summary = @{
        Timestamp = Get-Date
        Services = @{}
    }
    
    try {
        # Microsoft Graph
        $summary.Services.MicrosoftGraph = @{
            Available = $false
            Connected = $false
            Details = @{}
        }
        
        if (Get-Command Get-MgContext -ErrorAction SilentlyContinue) {
            $summary.Services.MicrosoftGraph.Available = $true
            $mgContext = Get-MgContext
            if ($mgContext) {
                $summary.Services.MicrosoftGraph.Connected = $true
                $summary.Services.MicrosoftGraph.Details = @{
                    TenantId = $mgContext.TenantId
                    Account = $mgContext.Account
                    Scopes = $mgContext.Scopes
                    AppName = $mgContext.AppName
                    AuthType = $mgContext.AuthType
                }
            }
        }
        
        # Exchange Online
        $summary.Services.ExchangeOnline = @{
            Available = $false
            Connected = $false
            Details = @{}
        }
        
        if (Get-Command Get-PSSession -ErrorAction SilentlyContinue) {
            $summary.Services.ExchangeOnline.Available = $true
            $exoSession = Get-PSSession | Where-Object { 
                $_.ConfigurationName -eq "Microsoft.Exchange" -or 
                $_.ComputerName -like "*outlook.office365.com*"
            }
            if ($exoSession -and $exoSession.State -eq "Opened") {
                $summary.Services.ExchangeOnline.Connected = $true
                $summary.Services.ExchangeOnline.Details = @{
                    ComputerName = $exoSession.ComputerName
                    State = $exoSession.State
                    SessionId = $exoSession.Id
                }
            }
        }
        
        # On-Premises AD
        $summary.Services.OnPremisesAD = @{
            Available = $false
            Connected = $false
            Details = @{}
        }
        
        if (Get-Command Get-ADDomain -ErrorAction SilentlyContinue) {
            $summary.Services.OnPremisesAD.Available = $true
            
            # Get DC from config
            $dc = $null
            if ($Context.Config -and $Context.Config.environment -and $Context.Config.environment.domainController) {
                $dc = $Context.Config.environment.domainController
            }
            
            if ($dc -and (Test-Connection -ComputerName $dc -Count 1 -Quiet -ErrorAction SilentlyContinue)) {
                try {
                    $domain = Get-ADDomain -Server $dc -ErrorAction SilentlyContinue
                    if ($domain) {
                        $summary.Services.OnPremisesAD.Connected = $true
                        $summary.Services.OnPremisesAD.Details = @{
                            DomainController = $dc
                            DomainName = $domain.Name
                            Forest = $domain.Forest
                            DomainMode = $domain.DomainMode
                        }
                    }
                } catch {
                    # Connection available but commands failed
                    $summary.Services.OnPremisesAD.Details.Error = $_.Exception.Message
                }
            }
        }
        
    } catch {
        $summary.Error = $_.Exception.Message
        Write-MandALog -Message "Error generating authentication summary: $($_.Exception.Message)" -Level "ERROR" -Component "AuthMonitoring"
    }
    
    return $summary
}

function Test-ServiceConnectivity {
    <#
    .SYNOPSIS
        Tests connectivity to all configured services
    .PARAMETER Context
        The M&A Discovery Suite context object
    .PARAMETER ServiceName
        Optional specific service to test
    .OUTPUTS
        Boolean indicating overall connectivity status
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("MicrosoftGraph", "ExchangeOnline", "OnPremisesAD", "All")]
        [string]$ServiceName = "All"
    )
    
    $summary = Get-AuthenticationSummary -Context $Context
    
    if ($ServiceName -eq "All") {
        # Check if at least one critical service is connected
        $criticalServices = @("MicrosoftGraph", "OnPremisesAD")
        $connectedCritical = $criticalServices | Where-Object { 
            $summary.Services[$_].Connected 
        }
        
        return ($connectedCritical.Count -gt 0)
    } else {
        return $summary.Services[$ServiceName].Connected
    }
}

#===============================================================================
#                       MODULE EXPORTS
#===============================================================================

# Export functions
Export-ModuleMember -Function @(
    'Show-AuthenticationStatus',
    'Test-GraphAuthentication',
    'Test-ExchangeOnlineAuthentication', 
    'Test-OnPremisesADAuthentication',
    'Test-AdditionalServiceAuthentication',
    'Get-AuthenticationSummary',
    'Test-ServiceConnectivity'
)

# Module metadata
$ModuleInfo = @{
    Name = "AuthenticationMonitoring"
    Version = "1.0.0"
    Description = "Authentication monitoring and visibility for M&A Discovery Suite"
    Author = "Lukian Poleschtschuk"
    Functions = @(
        'Show-AuthenticationStatus',
        'Get-AuthenticationSummary', 
        'Test-ServiceConnectivity'
    )
}

Write-Host "[AuthMonitoring] Module loaded successfully - Version $($ModuleInfo.Version)" -ForegroundColor Green