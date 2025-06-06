# -*- coding: utf-8-bom -*-
#Requires -Modules ActiveDirectory

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

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
        $result.ErrorMessage = $_.Exception.Message
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

