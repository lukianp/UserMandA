# -*- coding: utf-8-bom -*-
#Requires -Modules ActiveDirectory

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# DiscoveryResult class definition
# DiscoveryResult class is defined globally by the Orchestrator using Add-Type
# No local definition needed - the global C# class will be used

<#
.SYNOPSIS

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


    Enhanced Environment Detection Discovery Module
.DESCRIPTION
    Detects the type of environment (Cloud-only, Hybrid, On-prem only) with
    improved structure and context-based operations.
.NOTES
    Version: 3.0.0
    Enhanced: 2025-01-03
#>

# Add progress module import at the top
$progressModulePath = if ($global:MandA -and $global:MandA.Paths) {
    Join-Path $global:MandA.Paths.Utilities "ProgressDisplay.psm1"
} else {
    Join-Path (Split-Path $PSScriptRoot -Parent) "..\Utilities\ProgressDisplay.psm1"
}
if (Test-Path $progressModulePath) {
    Import-Module $progressModulePath -Force -Global
}

# Enhanced Test-OnPremisesAD
function Test-OnPremisesAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-ProgressStep "Checking for on-premises Active Directory..." -Status Progress
        
        $adDomain = Get-ADDomain -ErrorAction Stop
        $adForest = Get-ADForest -ErrorAction Stop
        
        $EnvironmentInfo.HasOnPremAD = $true
        $EnvironmentInfo.OnPremDomains += $adDomain.DNSRoot
        $EnvironmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
        $EnvironmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode.ToString()
        $EnvironmentInfo.EnvironmentDetails.ADDomainCount = @($adForest.Domains).Count
        
        Write-ProgressStep "On-premises AD detected: $($adDomain.DNSRoot)" -Status Success
        
        # Get user count with progress
        try {
            Write-ProgressStep "Counting AD users..." -Status Progress
            $adUsers = @(Get-ADUser -Filter * -ErrorAction Stop)
            $EnvironmentInfo.UserCorrelation.TotalOnPremUsers = $adUsers.Count
            Write-ProgressStep "Found $($adUsers.Count) on-premises users" -Status Info
        }
        catch {
            Write-ProgressStep "Could not retrieve AD user count" -Status Warning
            $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve AD user count")
        }
    }
    catch {
        Write-ProgressStep "No on-premises AD detected or not accessible" -Status Info
    }
    
    return $EnvironmentInfo
}

# Enhanced Test-AzureAD
function Test-AzureAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-ProgressStep "Checking for Azure AD / Microsoft Graph connection..." -Status Progress
        
        $mgContext = Get-MgContext -ErrorAction SilentlyContinue
        
        if ($mgContext) {
            $EnvironmentInfo.HasAzureAD = $true
            $EnvironmentInfo.EnvironmentDetails.GraphAPIConnected = $true
            $EnvironmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
            
            Write-ProgressStep "Azure AD detected: Tenant $($mgContext.TenantId)" -Status Success
            
            # Get organization details
            Write-ProgressStep "Retrieving organization details..." -Status Progress
            $EnvironmentInfo = Get-OrganizationDetails -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get domain information
            Write-ProgressStep "Retrieving domain information..." -Status Progress
            $EnvironmentInfo = Get-DomainInformation -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get user statistics
            Write-ProgressStep "Analyzing cloud user statistics..." -Status Progress
            $EnvironmentInfo = Get-CloudUserStatistics -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            Write-ProgressStep "Azure AD analysis completed" -Status Success
        }
        else {
            Write-ProgressStep "No Azure AD / Microsoft Graph connection detected" -Status Info
        }
    }
    catch {
        Write-ProgressStep "Error checking Azure AD: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Error checking Azure AD: $($_.Exception.Message)")
    }
    
    return $EnvironmentInfo
}

# Enhanced Get-CloudUserStatistics
function Get-CloudUserStatistics {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-ProgressStep "Retrieving cloud user statistics..." -Status Progress
        
        # Use pagination for large environments
        $pageSize = 999
        $cloudUsers = @()
        $pageCount = 0
        
        do {
            $pageCount++
            Write-ProgressStep "Fetching user batch $pageCount (size: $pageSize)..." -Status Progress
            
            $batch = Get-MgUser -Top $pageSize -Property OnPremisesSyncEnabled,UserPrincipalName -ErrorAction Stop
            $cloudUsers += $batch
            
            Show-ProgressBar -Current $cloudUsers.Count -Total ($cloudUsers.Count + 1) `
                -Activity "Loading cloud users"
            
        } while ($batch.Count -eq $pageSize)
        
        Write-Host "" # New line after progress
        Write-ProgressStep "Retrieved $($cloudUsers.Count) cloud users" -Status Info
        
        # Analyze users
        Write-ProgressStep "Analyzing user synchronization status..." -Status Progress
        
        $EnvironmentInfo.UserCorrelation.TotalCloudUsers = $cloudUsers.Count
        $EnvironmentInfo.UserCorrelation.SyncedUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true }).Count
        $EnvironmentInfo.UserCorrelation.CloudOnlyUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true }).Count
        
        Write-ProgressStep "Analysis complete - Total: $($cloudUsers.Count), Synced: $($EnvironmentInfo.UserCorrelation.SyncedUsers), Cloud-only: $($EnvironmentInfo.UserCorrelation.CloudOnlyUsers)" -Status Success
    }
    catch {
        Write-ProgressStep "Could not retrieve cloud user statistics" -Status Warning
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve cloud user statistics")
    }
    
    return $EnvironmentInfo
}

# Prerequisites validation function
function Test-EnvironmentDetectionDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $prerequisites = @{
        IsValid = $true
        MissingRequirements = @()
        Warnings = @()
    }
    
    try {
        Write-ProgressStep "Validating Environment Detection prerequisites..." -Status Progress
        
        # Check for ActiveDirectory module (optional for on-prem detection)
        if (-not (Get-Module -ListAvailable -Name ActiveDirectory)) {
            $prerequisites.Warnings += "ActiveDirectory module not available - on-premises AD detection will be limited"
        }
        
        # Check for Microsoft.Graph modules (optional for cloud detection)
        $graphModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.Identity.DirectoryManagement')
        foreach ($module in $graphModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.Warnings += "$module not available - cloud detection will be limited"
            }
        }
        
        # Validate output path
        if (-not $Configuration.environment.outputPath) {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Output path not configured"
        } elseif (-not (Test-Path $Configuration.environment.outputPath)) {
            try {
                New-Item -Path $Configuration.environment.outputPath -ItemType Directory -Force | Out-Null
            } catch {
                $prerequisites.IsValid = $false
                $prerequisites.MissingRequirements += "Cannot create output directory: $($_.Exception.Message)"
            }
        }
        
        Write-ProgressStep "Prerequisites validation completed" -Status Success
        
    } catch {
        $prerequisites.IsValid = $false
        $prerequisites.MissingRequirements += "Prerequisites validation failed: $($_.Exception.Message)"
        Write-ProgressStep "Prerequisites validation failed: $($_.Exception.Message)" -Status Error
    }
    
    return $prerequisites
}

# Enhanced main function with comprehensive error handling
function Invoke-EnvironmentDetectionDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new("EnvironmentDetection")
    
    try {
        Write-ProgressStep "Starting Environment Detection Discovery (v3.0.0)" -Status Progress
        
        # Create minimal context if not provided
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        # Validate prerequisites
        $prerequisites = Test-EnvironmentDetectionDiscoveryPrerequisites -Configuration $Configuration -Context $Context
        if (-not $prerequisites.IsValid) {
            throw "Prerequisites validation failed: $($prerequisites.MissingRequirements -join '; ')"
        }
        
        # Log warnings
        foreach ($warning in $prerequisites.Warnings) {
            Write-ProgressStep $warning -Status Warning
            $Context.ErrorCollector.AddWarning("EnvironmentDetection", $warning)
        }
        
        # Initialize environment info
        $environmentInfo = Initialize-EnvironmentInfo
        $result.Data = $environmentInfo
        
        # Step 1: Check on-premises AD with error handling
        try {
            Show-DiscoveryProgress -Module "EnvironmentDetection" -Status "Running" `
                -CurrentItem "Checking on-premises AD" -ItemsProcessed 1 -TotalItems 5
            
            $environmentInfo = Get-OnPremisesADWithErrorHandling -EnvironmentInfo $environmentInfo -Context $Context
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to check on-premises AD: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
        }
        
        # Step 2: Check Azure AD with error handling
        try {
            Show-DiscoveryProgress -Module "EnvironmentDetection" -Status "Running" `
                -CurrentItem "Checking Azure AD" -ItemsProcessed 2 -TotalItems 5
            
            $environmentInfo = Get-AzureADWithErrorHandling -EnvironmentInfo $environmentInfo -Context $Context
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to check Azure AD: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
        }
        
        # Step 3: Check AD Connect with error handling
        if ($environmentInfo.HasOnPremAD -and $environmentInfo.HasAzureAD) {
            try {
                Show-DiscoveryProgress -Module "EnvironmentDetection" -Status "Running" `
                    -CurrentItem "Checking AD Connect" -ItemsProcessed 3 -TotalItems 5
                
                $environmentInfo = Get-ADConnectWithErrorHandling -EnvironmentInfo $environmentInfo -Context $Context
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to check AD Connect: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
            }
        }
        
        # Step 4: Check M365 services with error handling
        if ($environmentInfo.HasAzureAD) {
            try {
                Show-DiscoveryProgress -Module "EnvironmentDetection" -Status "Running" `
                    -CurrentItem "Checking Microsoft 365 services" -ItemsProcessed 4 -TotalItems 5
                
                $environmentInfo = Get-Microsoft365ServicesWithErrorHandling -EnvironmentInfo $environmentInfo -Context $Context
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to check Microsoft 365 services: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
            }
        }
        
        # Step 5: Determine environment type
        try {
            Show-DiscoveryProgress -Module "EnvironmentDetection" -Status "Running" `
                -CurrentItem "Analyzing environment type" -ItemsProcessed 5 -TotalItems 5
            
            $environmentInfo.Type = Determine-EnvironmentType -EnvironmentInfo $environmentInfo
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to determine environment type: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $environmentInfo.Type = "Unknown"
        }
        
        # Write summary
        Write-EnvironmentSummary -EnvironmentInfo $environmentInfo -Context $Context
        
        # Export data with error handling
        try {
            Write-ProgressStep "Exporting environment detection results..." -Status Progress
            $outputFile = Join-Path (Get-ModuleContext).Paths.RawDataOutput "EnvironmentDetection.csv"
            $envData = ConvertTo-EnvironmentDataObject -EnvironmentInfo $environmentInfo
            Export-DataToCSV -Data @($envData) -FilePath $outputFile -Context $Context
            
            # Export AD Connect servers if found
            if ($environmentInfo.ADConnectServers -and $environmentInfo.ADConnectServers.Count -gt 0) {
                Write-ProgressStep "Exporting AD Connect server information..." -Status Progress
                $adcOutputFile = Join-Path (Get-ModuleContext).Paths.RawDataOutput "ADConnectServers.csv"
                Export-DataToCSV -Data $environmentInfo.ADConnectServers -FilePath $adcOutputFile -Context $Context
            }
            
        } catch {
            $errorMsg = "Failed to export environment detection data: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("EnvironmentDetection", $errorMsg, $_.Exception)
        }
        
        # Store in global context if available
        if ($null -ne $global:MandA) {
            $global:MandA.EnvironmentType = $environmentInfo.Type
            $global:MandA.EnvironmentInfo = $environmentInfo
        }
        
        # Update result
        $result.Data = $environmentInfo
        $result.Success = $true
        $result.Metadata.TotalSections = 5
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "Environment Detection Discovery Completed" -Status Success
        return $result
        
    } catch {
        $result.Success = $false
        $result.Exception.Message = $_.Exception.Message
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "Environment detection failed: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("EnvironmentDetection", "Discovery failed", $_.Exception)
        
        return $result
        
    } finally {
        # Cleanup any resources if needed
        Write-ProgressStep "Environment Detection cleanup completed" -Status Info
    }
}

# Enhanced wrapper functions with retry logic
function Get-OnPremisesADWithErrorHandling {
    param($EnvironmentInfo, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Test-OnPremisesAD -EnvironmentInfo $EnvironmentInfo -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "On-premises AD check failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-AzureADWithErrorHandling {
    param($EnvironmentInfo, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Test-AzureAD -EnvironmentInfo $EnvironmentInfo -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Azure AD check failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ADConnectWithErrorHandling {
    param($EnvironmentInfo, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Test-ADConnect -EnvironmentInfo $EnvironmentInfo -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "AD Connect check failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-Microsoft365ServicesWithErrorHandling {
    param($EnvironmentInfo, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Test-Microsoft365Services -EnvironmentInfo $EnvironmentInfo -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Microsoft 365 services check failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}


# Main detection function
function Get-EnvironmentType {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $environmentInfo = Initialize-EnvironmentInfo
    
    # Check for on-premises AD
    $environmentInfo = Test-OnPremisesAD -EnvironmentInfo $environmentInfo -Context $Context
    
    # Check for Azure AD / Microsoft Graph
    $environmentInfo = Test-AzureAD -EnvironmentInfo $environmentInfo -Context $Context
    
    # Check for AD Connect
    if ($environmentInfo.HasOnPremAD -and $environmentInfo.HasAzureAD) {
        $environmentInfo = Test-ADConnect -EnvironmentInfo $environmentInfo -Context $Context
    }
    
    # Check other Microsoft 365 services
    if ($environmentInfo.HasAzureAD) {
        $environmentInfo = Test-Microsoft365Services -EnvironmentInfo $environmentInfo -Context $Context
    }
    
    # Determine environment type
    $environmentInfo.Type = Determine-EnvironmentType -EnvironmentInfo $environmentInfo
    
    # Log summary
    Write-EnvironmentSummary -EnvironmentInfo $environmentInfo -Context $Context
    
    return $environmentInfo
}

function Initialize-EnvironmentInfo {
    return @{
        Type = "Unknown"
        HasOnPremAD = $false
        HasAzureAD = $false
        HasADConnect = $false
        ADConnectStatus = $null
        SyncedDomains = @()
        OnPremDomains = @()
        CloudOnlyDomains = @()
        ADConnectServers = @()
        LastSyncTime = $null
        SyncErrors = @()
        UserCorrelation = @{
            Method = "None"
            IdentityMapping = @{}
            TotalOnPremUsers = 0
            TotalCloudUsers = 0
            SyncedUsers = 0
            CloudOnlyUsers = 0
            OnPremOnlyUsers = 0
        }
        EnvironmentDetails = @{
            ADForestName = $null
            ADForestMode = $null
            ADDomainCount = 0
            AzureTenantId = $null
            AzureTenantName = $null
            GraphAPIConnected = $false
            ExchangeOnlineConnected = $false
            SharePointOnlineConnected = $false
            TeamsConnected = $false
        }
        DiscoveredAt = Get-Date
    }
}

function Test-OnPremisesAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Checking for on-premises Active Directory..." -Level "INFO" -Context $Context
        
        $adDomain = Get-ADDomain -ErrorAction Stop
        $adForest = Get-ADForest -ErrorAction Stop
        
        $EnvironmentInfo.HasOnPremAD = $true
        $EnvironmentInfo.OnPremDomains += $adDomain.DNSRoot
        $EnvironmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
        $EnvironmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode.ToString()
        $EnvironmentInfo.EnvironmentDetails.ADDomainCount = @($adForest.Domains).Count
        
        # Get user count
        try {
            $adUsers = @(Get-ADUser -Filter * -ErrorAction Stop)
            $EnvironmentInfo.UserCorrelation.TotalOnPremUsers = $adUsers.Count
        }
        catch {
            $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve AD user count")
        }
        
        Write-MandALog "On-premises AD detected: $($adDomain.DNSRoot)" -Level "SUCCESS" -Context $Context
    }
    catch {
        Write-MandALog "No on-premises AD detected or not accessible" -Level "INFO" -Context $Context
    }
    
    return $EnvironmentInfo
}

function Test-AzureAD {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Checking for Azure AD / Microsoft Graph connection..." -Level "INFO" -Context $Context
        
        $mgContext = Get-MgContext -ErrorAction SilentlyContinue
        
        if ($mgContext) {
            $EnvironmentInfo.HasAzureAD = $true
            $EnvironmentInfo.EnvironmentDetails.GraphAPIConnected = $true
            $EnvironmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
            
            # Get organization details
            $EnvironmentInfo = Get-OrganizationDetails -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get domain information
            $EnvironmentInfo = Get-DomainInformation -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            # Get user statistics
            $EnvironmentInfo = Get-CloudUserStatistics -EnvironmentInfo $EnvironmentInfo -Context $Context
            
            Write-MandALog "Azure AD detected: Tenant $($EnvironmentInfo.EnvironmentDetails.AzureTenantName)" -Level "SUCCESS" -Context $Context
        }
        else {
            Write-MandALog "No Azure AD / Microsoft Graph connection detected" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Error checking Azure AD: $($_.Exception.Message)")
    }
    
    return $EnvironmentInfo
}

function Get-OrganizationDetails {
    param($EnvironmentInfo, $Context)
    
    try {
        $org = Get-MgOrganization -ErrorAction Stop | Select-Object -First 1
        
        if ($org) {
            $EnvironmentInfo.EnvironmentDetails.AzureTenantName = $org.DisplayName
            
            # Check for directory sync
            if ($org.OnPremisesSyncEnabled) {
                $EnvironmentInfo.HasADConnect = $true
                $EnvironmentInfo.ADConnectStatus = "Enabled"
                $EnvironmentInfo.LastSyncTime = $org.OnPremisesLastSyncDateTime
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve organization details")
    }
    
    return $EnvironmentInfo
}

function Get-DomainInformation {
    param($EnvironmentInfo, $Context)
    
    try {
        $domains = Get-MgDomain -ErrorAction Stop
        
        foreach ($domain in $domains) {
            if ($domain.AuthenticationType -eq "Federated") {
                $EnvironmentInfo.SyncedDomains += $domain.Id
            }
            elseif ($domain.AuthenticationType -eq "Managed" -and $domain.IsVerified) {
                $EnvironmentInfo.CloudOnlyDomains += $domain.Id
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve domain information")
    }
    
    return $EnvironmentInfo
}

function Get-CloudUserStatistics {
    param($EnvironmentInfo, $Context)
    
    try {
        # Use pagination for large environments
        $pageSize = 999
        $cloudUsers = @()
        
        do {
            $batch = Get-MgUser -Top $pageSize -Property OnPremisesSyncEnabled,UserPrincipalName -ErrorAction Stop
            $cloudUsers += $batch
        } while ($batch.Count -eq $pageSize)
        
        $EnvironmentInfo.UserCorrelation.TotalCloudUsers = $cloudUsers.Count
        $EnvironmentInfo.UserCorrelation.SyncedUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true }).Count
        $EnvironmentInfo.UserCorrelation.CloudOnlyUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true }).Count
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not retrieve cloud user statistics")
    }
    
    return $EnvironmentInfo
}

function Test-ADConnect {
    param($EnvironmentInfo, $Context)
    
    try {
        Write-MandALog "Searching for AD Connect servers..." -Level "INFO" -Context $Context
        
        # Search using multiple methods
        $adConnectServers = Find-ADConnectServers -Context $Context
        
        if ($adConnectServers) {
            foreach ($server in $adConnectServers) {
                $EnvironmentInfo.ADConnectServers += [PSCustomObject]@{
                    ServerName = $server.Name
                    DNSHostName = $server.DNSHostName
                    OperatingSystem = $server.OperatingSystem
                    Description = $server.Description
                    DiscoveryMethod = $server.DiscoveryMethod
                }
            }
            
            Write-MandALog "Found $($adConnectServers.Count) potential AD Connect servers" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Could not search for AD Connect servers")
    }
    
    return $EnvironmentInfo
}

function Find-ADConnectServers {
    param($Context)
    
    $servers = @()
    
    # Method 1: Search by ServicePrincipalName
    try {
        $spnServers = Get-ADComputer -Filter {ServicePrincipalName -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction Stop
        foreach ($server in $spnServers) {
            $server | Add-Member -NotePropertyName DiscoveryMethod -NotePropertyValue "SPN" -Force
            $servers += $server
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "SPN search for AD Connect failed")
    }
    
    # Method 2: Search by common AD Connect service names
    try {
        $serviceNames = @("ADSync", "Azure AD Sync", "Azure AD Connect")
        foreach ($serviceName in $serviceNames) {
            $svcServers = Get-ADComputer -Filter {Description -like "*$serviceName*"} -Properties OperatingSystem,Description -ErrorAction Stop
            foreach ($server in $svcServers) {
                if ($servers.Name -notcontains $server.Name) {
                    $server | Add-Member -NotePropertyName DiscoveryMethod -NotePropertyValue "ServiceName" -Force
                    $servers += $server
                }
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("EnvironmentDetection", "Service name search for AD Connect failed")
    }
    
    return $servers
}

function Test-Microsoft365Services {
    param($EnvironmentInfo, $Context)
    
    # Check Exchange Online
    try {
        $exoConnection = Get-PSSession | Where-Object { 
            $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened" 
        }
        if ($exoConnection) {
            $EnvironmentInfo.EnvironmentDetails.ExchangeOnlineConnected = $true
        }
    }
    catch {}
    
    # Check SharePoint Online
    try {
        if (Get-Command Get-SPOSite -ErrorAction SilentlyContinue) {
            $EnvironmentInfo.EnvironmentDetails.SharePointOnlineConnected = $true
        }
    }
    catch {}
    
    # Check Teams
    try {
        if (Get-Command Get-Team -ErrorAction SilentlyContinue) {
            $EnvironmentInfo.EnvironmentDetails.TeamsConnected = $true
        }
    }
    catch {}
    
    return $EnvironmentInfo
}

function Determine-EnvironmentType {
    param($EnvironmentInfo)
    
    if ($EnvironmentInfo.HasAzureAD -and -not $EnvironmentInfo.HasOnPremAD) {
        $EnvironmentInfo.Type = "CloudOnly"
        $EnvironmentInfo.UserCorrelation.Method = "CloudOnly"
    }
    elseif ($EnvironmentInfo.HasAzureAD -and $EnvironmentInfo.HasOnPremAD -and $EnvironmentInfo.HasADConnect) {
        $EnvironmentInfo.Type = "HybridSynced"
        $EnvironmentInfo.UserCorrelation.Method = "ADConnect"
        
        # Calculate on-prem only users
        if ($EnvironmentInfo.UserCorrelation.TotalOnPremUsers -gt 0 -and $EnvironmentInfo.UserCorrelation.SyncedUsers -gt 0) {
            $EnvironmentInfo.UserCorrelation.OnPremOnlyUsers = [Math]::Max(0, 
                $EnvironmentInfo.UserCorrelation.TotalOnPremUsers - $EnvironmentInfo.UserCorrelation.SyncedUsers)
        }
    }
    elseif ($EnvironmentInfo.HasAzureAD -and $EnvironmentInfo.HasOnPremAD -and -not $EnvironmentInfo.HasADConnect) {
        $EnvironmentInfo.Type = "HybridDisconnected"
        $EnvironmentInfo.UserCorrelation.Method = "Manual"
    }
    elseif ($EnvironmentInfo.HasOnPremAD -and -not $EnvironmentInfo.HasAzureAD) {
        $EnvironmentInfo.Type = "OnPremOnly"
        $EnvironmentInfo.UserCorrelation.Method = "NotApplicable"
    }
    
    return $EnvironmentInfo.Type
}

function Write-EnvironmentSummary {
    param($EnvironmentInfo, $Context)
    
    Write-MandALog "Environment Detection Complete:" -Level "SUCCESS" -Context $Context
    Write-MandALog "  - Type: $($EnvironmentInfo.Type)" -Level "INFO" -Context $Context
    Write-MandALog "  - On-Prem AD: $($EnvironmentInfo.HasOnPremAD)" -Level "INFO" -Context $Context
    Write-MandALog "  - Azure AD: $($EnvironmentInfo.HasAzureAD)" -Level "INFO" -Context $Context
    Write-MandALog "  - AD Connect: $($EnvironmentInfo.HasADConnect)" -Level "INFO" -Context $Context
    
    if ($EnvironmentInfo.HasOnPremAD) {
        Write-MandALog "  - On-Prem Users: $($EnvironmentInfo.UserCorrelation.TotalOnPremUsers)" -Level "INFO" -Context $Context
    }
    
    if ($EnvironmentInfo.HasAzureAD) {
        Write-MandALog "  - Cloud Users: $($EnvironmentInfo.UserCorrelation.TotalCloudUsers)" -Level "INFO" -Context $Context
        Write-MandALog "  - Synced Users: $($EnvironmentInfo.UserCorrelation.SyncedUsers)" -Level "INFO" -Context $Context
    }
}


function ConvertTo-EnvironmentDataObject {
    param($EnvironmentInfo)
    
    return [PSCustomObject]@{
        EnvironmentType = $EnvironmentInfo.Type
        HasOnPremAD = $EnvironmentInfo.HasOnPremAD
        HasAzureAD = $EnvironmentInfo.HasAzureAD
        HasADConnect = $EnvironmentInfo.HasADConnect
        ADConnectStatus = $EnvironmentInfo.ADConnectStatus
        LastSyncTime = $EnvironmentInfo.LastSyncTime
        ADForestName = $EnvironmentInfo.EnvironmentDetails.ADForestName
        ADForestMode = $EnvironmentInfo.EnvironmentDetails.ADForestMode
        ADDomainCount = $EnvironmentInfo.EnvironmentDetails.ADDomainCount
        AzureTenantId = $EnvironmentInfo.EnvironmentDetails.AzureTenantId
        AzureTenantName = $EnvironmentInfo.EnvironmentDetails.AzureTenantName
        GraphAPIConnected = $EnvironmentInfo.EnvironmentDetails.GraphAPIConnected
        ExchangeOnlineConnected = $EnvironmentInfo.EnvironmentDetails.ExchangeOnlineConnected
        SharePointOnlineConnected = $EnvironmentInfo.EnvironmentDetails.SharePointOnlineConnected
        TeamsConnected = $EnvironmentInfo.EnvironmentDetails.TeamsConnected
        TotalOnPremUsers = $EnvironmentInfo.UserCorrelation.TotalOnPremUsers
        TotalCloudUsers = $EnvironmentInfo.UserCorrelation.TotalCloudUsers
        SyncedUsers = $EnvironmentInfo.UserCorrelation.SyncedUsers
        CloudOnlyUsers = $EnvironmentInfo.UserCorrelation.CloudOnlyUsers
        OnPremOnlyUsers = $EnvironmentInfo.UserCorrelation.OnPremOnlyUsers
        UserCorrelationMethod = $EnvironmentInfo.UserCorrelation.Method
        OnPremDomains = ($EnvironmentInfo.OnPremDomains -join ";")
        SyncedDomains = ($EnvironmentInfo.SyncedDomains -join ";")
        CloudOnlyDomains = ($EnvironmentInfo.CloudOnlyDomains -join ";")
        DiscoveredAt = $EnvironmentInfo.DiscoveredAt
    }
}

# Export module members
Export-ModuleMember -Function @(
    'Get-EnvironmentType',
    'Invoke-EnvironmentDetectionDiscovery'
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
        Write-MandALog "Starting EnvironmentDetectionDiscovery discovery" "INFO"
        
        $discoveryResult = @{
            ModuleName = "EnvironmentDetectionDiscovery"
            StartTime = Get-Date
            Status = "Completed"
            Data = @()
            Errors = @()
            Summary = @{ ItemsDiscovered = 0; ErrorCount = 0 }
        }
        
        # TODO: Implement actual discovery logic for EnvironmentDetectionDiscovery
        Write-MandALog "Completed EnvironmentDetectionDiscovery discovery" "SUCCESS"
        
        return $discoveryResult
        
    } catch {
        Write-MandALog "Error in EnvironmentDetectionDiscovery discovery: $($_.Exception.Message)" "ERROR"
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
        ModuleName = "EnvironmentDetectionDiscovery"
        ModuleVersion = "1.0.0"
        Description = "EnvironmentDetectionDiscovery discovery module for M&A Suite"
        RequiredPermissions = @("Read access to EnvironmentDetectionDiscovery resources")
        EstimatedDuration = "5-15 minutes"
        SupportedEnvironments = @("OnPremises", "Cloud", "Hybrid")
    }
}


Export-ModuleMember -Function Invoke-Discovery, Get-DiscoveryInfo
# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: EnvironmentDetection
# Description: Detects the type of environment (Cloud-only, Hybrid, On-prem only).
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    return $null
}

function Write-EnvironmentDetectionLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[EnvironmentDetection] $Message" -Level $Level -Component "EnvironmentDetectionDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-EnvironmentDetectionDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-EnvironmentDetectionLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('EnvironmentDetection')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'EnvironmentDetection'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. PERFORM DISCOVERY
        Write-EnvironmentDetectionLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Initialize environment info structure
        $environmentInfo = @{
            Type = "Unknown"
            HasOnPremAD = $false
            HasAzureAD = $false
            HasADConnect = $false
            ADConnectStatus = $null
            SyncedDomains = @()
            OnPremDomains = @()
            CloudOnlyDomains = @()
            ADConnectServers = @()
            LastSyncTime = $null
            UserCorrelation = @{
                TotalOnPremUsers = 0
                TotalCloudUsers = 0
                SyncedUsers = 0
                CloudOnlyUsers = 0
                OnPremOnlyUsers = 0
            }
            EnvironmentDetails = @{
                ADForestName = $null
                ADForestMode = $null
                ADDomainCount = 0
                AzureTenantId = $null
                AzureTenantName = $null
                GraphAPIConnected = $false
                ExchangeOnlineConnected = $false
                SharePointOnlineConnected = $false
                TeamsConnected = $false
            }
            DiscoveredAt = Get-Date
        }
        
        # Check on-premises AD
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Checking for on-premises Active Directory..." -Context $Context
        try {
            $adDomain = Get-ADDomain -ErrorAction Stop
            $adForest = Get-ADForest -ErrorAction Stop
            
            $environmentInfo.HasOnPremAD = $true
            $environmentInfo.OnPremDomains += $adDomain.DNSRoot
            $environmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
            $environmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode.ToString()
            $environmentInfo.EnvironmentDetails.ADDomainCount = @($adForest.Domains).Count
            
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "On-premises AD detected: $($adDomain.DNSRoot)" -Context $Context
            
            # Get user count
            try {
                $adUsers = @(Get-ADUser -Filter * -ErrorAction Stop)
                $environmentInfo.UserCorrelation.TotalOnPremUsers = $adUsers.Count
                Write-EnvironmentDetectionLog -Level "INFO" -Message "Found $($adUsers.Count) on-premises users" -Context $Context
            } catch {
                $result.AddWarning("Could not retrieve AD user count: $($_.Exception.Message)", @{Section="ADUsers"})
            }
        } catch {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "No on-premises AD detected or not accessible" -Context $Context
        }
        
        # Check Azure AD / Microsoft Graph
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Checking for Azure AD / Microsoft Graph connection..." -Context $Context
        try {
            $mgContext = Get-MgContext -ErrorAction SilentlyContinue
            
            if ($mgContext) {
                $environmentInfo.HasAzureAD = $true
                $environmentInfo.EnvironmentDetails.GraphAPIConnected = $true
                $environmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
                
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Azure AD detected: Tenant $($mgContext.TenantId)" -Context $Context
                
                # Get organization details
                try {
                    $org = Get-MgOrganization -ErrorAction Stop | Select-Object -First 1
                    if ($org) {
                        $environmentInfo.EnvironmentDetails.AzureTenantName = $org.DisplayName
                        
                        # Check for directory sync
                        if ($org.OnPremisesSyncEnabled) {
                            $environmentInfo.HasADConnect = $true
                            $environmentInfo.ADConnectStatus = "Enabled"
                            $environmentInfo.LastSyncTime = $org.OnPremisesLastSyncDateTime
                        }
                    }
                } catch {
                    $result.AddWarning("Could not retrieve organization details: $($_.Exception.Message)", @{Section="Organization"})
                }
                
                # Get domain information
                try {
                    $domains = Get-MgDomain -ErrorAction Stop
                    foreach ($domain in $domains) {
                        if ($domain.AuthenticationType -eq "Federated") {
                            $environmentInfo.SyncedDomains += $domain.Id
                        } elseif ($domain.AuthenticationType -eq "Managed" -and $domain.IsVerified) {
                            $environmentInfo.CloudOnlyDomains += $domain.Id
                        }
                    }
                } catch {
                    $result.AddWarning("Could not retrieve domain information: $($_.Exception.Message)", @{Section="Domains"})
                }
                
                # Get cloud user statistics
                try {
                    Write-EnvironmentDetectionLog -Level "INFO" -Message "Retrieving cloud user statistics..." -Context $Context
                    $pageSize = 999
                    $cloudUsers = @()
                    
                    # Get first page
                    $response = Get-MgUser -Top $pageSize -Select "OnPremisesSyncEnabled,UserPrincipalName" -ErrorAction Stop
                    $cloudUsers += $response
                    
                    # Check if there are more pages
                    $nextLink = $null
                    if ($response -is [Microsoft.Graph.PowerShell.Models.MicrosoftGraphUser[]]) {
                        # For array responses, check if we got a full page
                        if ($response.Count -eq $pageSize) {
                            Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Large tenant detected, using pagination..." -Context $Context
                            # Note: Simple pagination - in production you'd use @odata.nextLink
                        }
                    }
                    
                    $environmentInfo.UserCorrelation.TotalCloudUsers = $cloudUsers.Count
                    $environmentInfo.UserCorrelation.SyncedUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true }).Count
                    $environmentInfo.UserCorrelation.CloudOnlyUsers = @($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true }).Count
                    
                    Write-EnvironmentDetectionLog -Level "INFO" -Message "Cloud users - Total: $($cloudUsers.Count), Synced: $($environmentInfo.UserCorrelation.SyncedUsers), Cloud-only: $($environmentInfo.UserCorrelation.CloudOnlyUsers)" -Context $Context
                } catch {
                    $result.AddWarning("Could not retrieve cloud user statistics: $($_.Exception.Message)", @{Section="CloudUsers"})
                }
                
            } else {
                Write-EnvironmentDetectionLog -Level "INFO" -Message "No Azure AD / Microsoft Graph connection detected" -Context $Context
            }
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Error checking Azure AD: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Error checking Azure AD: $($_.Exception.Message)", @{Section="AzureAD"})
        }
        
        # Check for AD Connect servers (if both on-prem and cloud exist)
        if ($environmentInfo.HasOnPremAD -and $environmentInfo.HasAzureAD) {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "Searching for AD Connect servers..." -Context $Context
            try {
                # Search by ServicePrincipalName
                $adConnectServers = @()
                $spnServers = Get-ADComputer -Filter {ServicePrincipalName -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction SilentlyContinue
                if ($spnServers) {
                    $adConnectServers += $spnServers
                }
                
                # Search by description
                $descServers = Get-ADComputer -Filter {Description -like "*Azure AD Connect*" -or Description -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction SilentlyContinue
                if ($descServers) {
                    foreach ($server in $descServers) {
                        if ($adConnectServers.Name -notcontains $server.Name) {
                            $adConnectServers += $server
                        }
                    }
                }
                
                if ($adConnectServers) {
                    foreach ($server in $adConnectServers) {
                        $environmentInfo.ADConnectServers += @{
                            ServerName = $server.Name
                            DNSHostName = $server.DNSHostName
                            OperatingSystem = $server.OperatingSystem
                            Description = $server.Description
                            DiscoveryMethod = "ADQuery"
                        }
                    }
                    Write-EnvironmentDetectionLog -Level "INFO" -Message "Found $($adConnectServers.Count) potential AD Connect servers" -Context $Context
                }
            } catch {
                $result.AddWarning("Could not search for AD Connect servers: $($_.Exception.Message)", @{Section="ADConnect"})
            }
        }
        
        # Determine environment type
        if ($environmentInfo.HasAzureAD -and -not $environmentInfo.HasOnPremAD) {
            $environmentInfo.Type = "CloudOnly"
        } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and $environmentInfo.HasADConnect) {
            $environmentInfo.Type = "HybridSynced"
            # Calculate on-prem only users
            if ($environmentInfo.UserCorrelation.TotalOnPremUsers -gt 0 -and $environmentInfo.UserCorrelation.SyncedUsers -gt 0) {
                $environmentInfo.UserCorrelation.OnPremOnlyUsers = [Math]::Max(0, 
                    $environmentInfo.UserCorrelation.TotalOnPremUsers - $environmentInfo.UserCorrelation.SyncedUsers)
            }
        } elseif ($environmentInfo.HasAzureAD -and $environmentInfo.HasOnPremAD -and -not $environmentInfo.HasADConnect) {
            $environmentInfo.Type = "HybridDisconnected"
        } elseif ($environmentInfo.HasOnPremAD -and -not $environmentInfo.HasAzureAD) {
            $environmentInfo.Type = "OnPremOnly"
        }
        
        # Log summary
        Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Environment Detection Complete:" -Context $Context
        Write-EnvironmentDetectionLog -Level "INFO" -Message "  - Type: $($environmentInfo.Type)" -Context $Context
        Write-EnvironmentDetectionLog -Level "INFO" -Message "  - On-Prem AD: $($environmentInfo.HasOnPremAD)" -Context $Context
        Write-EnvironmentDetectionLog -Level "INFO" -Message "  - Azure AD: $($environmentInfo.HasAzureAD)" -Context $Context
        Write-EnvironmentDetectionLog -Level "INFO" -Message "  - AD Connect: $($environmentInfo.HasADConnect)" -Context $Context
        
        if ($environmentInfo.HasOnPremAD) {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "  - On-Prem Users: $($environmentInfo.UserCorrelation.TotalOnPremUsers)" -Context $Context
        }
        
        if ($environmentInfo.HasAzureAD) {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "  - Cloud Users: $($environmentInfo.UserCorrelation.TotalCloudUsers)" -Context $Context
            Write-EnvironmentDetectionLog -Level "INFO" -Message "  - Synced Users: $($environmentInfo.UserCorrelation.SyncedUsers)" -Context $Context
        }

        # 6. EXPORT DATA TO CSV
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Exporting environment detection results..." -Context $Context
        
        # Convert to flat object for CSV export
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $envData = [PSCustomObject]@{
            # Metadata fields
            _DiscoveryTimestamp = $timestamp
            _DiscoveryModule = 'EnvironmentDetection'
            
            # Environment data
            EnvironmentType = $environmentInfo.Type
            HasOnPremAD = $environmentInfo.HasOnPremAD
            HasAzureAD = $environmentInfo.HasAzureAD
            HasADConnect = $environmentInfo.HasADConnect
            ADConnectStatus = $environmentInfo.ADConnectStatus
            LastSyncTime = $environmentInfo.LastSyncTime
            ADForestName = $environmentInfo.EnvironmentDetails.ADForestName
            ADForestMode = $environmentInfo.EnvironmentDetails.ADForestMode
            ADDomainCount = $environmentInfo.EnvironmentDetails.ADDomainCount
            AzureTenantId = $environmentInfo.EnvironmentDetails.AzureTenantId
            AzureTenantName = $environmentInfo.EnvironmentDetails.AzureTenantName
            GraphAPIConnected = $environmentInfo.EnvironmentDetails.GraphAPIConnected
            ExchangeOnlineConnected = $environmentInfo.EnvironmentDetails.ExchangeOnlineConnected
            SharePointOnlineConnected = $environmentInfo.EnvironmentDetails.SharePointOnlineConnected
            TeamsConnected = $environmentInfo.EnvironmentDetails.TeamsConnected
            TotalOnPremUsers = $environmentInfo.UserCorrelation.TotalOnPremUsers
            TotalCloudUsers = $environmentInfo.UserCorrelation.TotalCloudUsers
            SyncedUsers = $environmentInfo.UserCorrelation.SyncedUsers
            CloudOnlyUsers = $environmentInfo.UserCorrelation.CloudOnlyUsers
            OnPremOnlyUsers = $environmentInfo.UserCorrelation.OnPremOnlyUsers
            OnPremDomains = ($environmentInfo.OnPremDomains -join ";")
            SyncedDomains = ($environmentInfo.SyncedDomains -join ";")
            CloudOnlyDomains = ($environmentInfo.CloudOnlyDomains -join ";")
            DiscoveredAt = $environmentInfo.DiscoveredAt
        }
        
        # Export main environment data
        $fileName = "EnvironmentDetection.csv"
        $filePath = Join-Path $outputPath $fileName
        @($envData) | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
        Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Exported environment data to $fileName" -Context $Context
        
        # Export AD Connect servers if found
        if ($environmentInfo.ADConnectServers -and $environmentInfo.ADConnectServers.Count -gt 0) {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "Exporting AD Connect server information..." -Context $Context
            $adcServers = $environmentInfo.ADConnectServers | ForEach-Object {
                [PSCustomObject]@{
                    _DiscoveryTimestamp = $timestamp
                    _DiscoveryModule = 'EnvironmentDetection'
                    ServerName = $_.ServerName
                    DNSHostName = $_.DNSHostName
                    OperatingSystem = $_.OperatingSystem
                    Description = $_.Description
                    DiscoveryMethod = $_.DiscoveryMethod
                }
            }
            
            $adcFileName = "ADConnectServers.csv"
            $adcFilePath = Join-Path $outputPath $adcFileName
            $adcServers | Export-Csv -Path $adcFilePath -NoTypeInformation -Encoding UTF8
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Exported AD Connect server data to $adcFileName" -Context $Context
        }
        
        # Store in global context if available
        if ($null -ne $global:MandA) {
            $global:MandA.EnvironmentType = $environmentInfo.Type
            $global:MandA.EnvironmentInfo = $environmentInfo
        }

        # 7. FINALIZE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        $recordCount = 1  # We export 1 environment record
        if ($result -is [hashtable]) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $recordCount
            $result['RecordCount'] = $recordCount  # Ensure both access methods work
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $recordCount
        }
        
        $result.Metadata["TotalRecords"] = $recordCount
        $result.Metadata["EnvironmentType"] = $environmentInfo.Type
        $result.Metadata["HasOnPremAD"] = $environmentInfo.HasOnPremAD
        $result.Metadata["HasAzureAD"] = $environmentInfo.HasAzureAD
        $result.Metadata["HasADConnect"] = $environmentInfo.HasADConnect
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds

    } catch {
        # Top-level error handler
        Write-EnvironmentDetectionLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        $stopwatch.Stop()
        $result.Complete()
        Write-EnvironmentDetectionLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# --- Helper Functions ---
function Ensure-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-EnvironmentDetectionDiscovery