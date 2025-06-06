# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Enhanced Intune Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune managed devices, configurations, policies, apps, and user associations
.NOTES
    Author: Enhanced Version
    Version: 2.0.0
    Created: 2025-06-03
    Last Modified: 2025-01-15
#>

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.DeviceManagement, Microsoft.Graph.Beta.DeviceManagement

# Module initialization
$script:outputPath = $null

function Initialize-IntuneDiscovery {
    param($Context)
    
    # Set output path
    if ($Context -and $Context.Paths -and $Context.Paths.RawDataOutput) {
        $script:outputPath = $Context.Paths.RawDataOutput
    } elseif ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.RawDataOutput) {
        $script:outputPath = $global:MandA.Paths.RawDataOutput
    } else {
        $script:outputPath = ".\Raw"
    }
    
    # Ensure output directory exists
    if (-not (Test-Path $script:outputPath)) {
        New-Item -Path $script:outputPath -ItemType Directory -Force | Out-Null
    }
}

# Intune Discovery Prerequisites Function
function Test-IntuneDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating Intune Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Check if Microsoft Graph PowerShell modules are available
        $requiredModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.DeviceManagement')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $Result.AddError("$module PowerShell module is not available", $null, @{
                    Prerequisite = "$module Module"
                    Resolution = "Install $module PowerShell module using 'Install-Module $module'"
                })
                return
            }
        }
        
        # Import modules if not already loaded
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module)) {
                Import-Module $module -ErrorAction Stop
                Write-MandALog "$module module imported successfully" -Level "DEBUG" -Context $Context
            }
        }
        
        # Test Microsoft Graph connectivity
        try {
            $mgContext = Get-MgContext -ErrorAction Stop
            if (-not $mgContext) {
                $Result.AddError("Not connected to Microsoft Graph", $null, @{
                    Prerequisite = 'Microsoft Graph Authentication'
                    Resolution = 'Connect to Microsoft Graph using Connect-MgGraph'
                })
                return
            }
            
            Write-MandALog "Successfully connected to Microsoft Graph. Context: $($mgContext.Account)" -Level "SUCCESS" -Context $Context
            $Result.Metadata['GraphContext'] = $mgContext.Account
            $Result.Metadata['TenantId'] = $mgContext.TenantId
        }
        catch {
            $Result.AddError("Failed to verify Microsoft Graph connection", $_.Exception, @{
                Prerequisite = 'Microsoft Graph Connectivity'
                Resolution = 'Verify Microsoft Graph connection and permissions'
            })
            return
        }
        
        # Test Intune access
        try {
            $testDevice = Get-MgDeviceManagementManagedDevice -Top 1 -ErrorAction Stop
            Write-MandALog "Successfully verified Intune access" -Level "SUCCESS" -Context $Context
        }
        catch {
            $Result.AddError("Failed to access Intune managed devices", $_.Exception, @{
                Prerequisite = 'Intune Access'
                Resolution = 'Verify Microsoft Graph permissions (DeviceManagementManagedDevices.Read.All)'
            })
            return
        }
        
        Write-MandALog "All Intune Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-IntuneManagedDevicesWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $devices = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving Intune managed devices..." -Level "INFO" -Context $Context
            
            # Get devices with pagination
            $allDevices = Get-MgDeviceManagementManagedDevice -All -ErrorAction Stop
            
            Write-MandALog "Retrieved $($allDevices.Count) Intune managed devices" -Level "SUCCESS" -Context $Context
            
            # Process devices with individual error handling
            $processedCount = 0
            foreach ($device in $allDevices) {
                try {
                    $processedCount++
                    if ($processedCount % 20 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allDevices.Count) devices" -Level "PROGRESS" -Context $Context
                    }
                    
                    $deviceObj = ConvertTo-IntuneDeviceObject -Device $device -Context $Context
                    if ($deviceObj) {
                        $null = $devices.Add($deviceObj)
                    }
                }
                catch {
                    Write-MandALog "Error processing device at index $processedCount`: $_" -Level "WARN" -Context $Context
                    # Continue processing other devices
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Intune managed devices after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Intune device query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $devices.ToArray()
}

function ConvertTo-IntuneDeviceObject {
    param($Device, $Context)
    
    try {
        return [PSCustomObject]@{
            # Core identification
            DeviceId = $Device.Id
            DeviceName = $Device.DeviceName
            SerialNumber = $Device.SerialNumber
            
            # User mapping fields (critical for processing)
            UserPrincipalName = $Device.UserPrincipalName
            UserDisplayName = $Device.UserDisplayName
            UserId = $Device.UserId
            EmailAddress = $Device.EmailAddress
            
            # Device details
            OperatingSystem = $Device.OperatingSystem
            OSVersion = $Device.OsVersion
            Model = $Device.Model
            Manufacturer = $Device.Manufacturer
            DeviceType = if ($Device.DeviceType) { $Device.DeviceType.ToString() } else { $null }
            
            # Management status
            ManagementAgent = if ($Device.ManagementAgent) { $Device.ManagementAgent.ToString() } else { $null }
            ManagementState = if ($Device.ManagementState) { $Device.ManagementState.ToString() } else { $null }
            ManagedDeviceOwnerType = if ($Device.ManagedDeviceOwnerType) { $Device.ManagedDeviceOwnerType.ToString() } else { $null }
            
            # Compliance and security
            ComplianceState = if ($Device.ComplianceState) { $Device.ComplianceState.ToString() } else { $null }
            IsCompliant = $Device.IsCompliant
            IsEncrypted = $Device.IsEncrypted
            IsSupervised = $Device.IsSupervised
            JailBroken = $Device.JailBroken
            
            # Dates
            EnrolledDateTime = $Device.EnrolledDateTime
            LastSyncDateTime = $Device.LastSyncDateTime
            
            # Azure AD integration
            AzureADDeviceId = $Device.AzureADDeviceId
            AzureADRegistered = $Device.AzureADRegistered
            AutopilotEnrolled = $Device.AutopilotEnrolled
            
            # Storage information
            TotalStorageSpaceInGB = if ($Device.TotalStorageSpaceInBytes) { [math]::Round($Device.TotalStorageSpaceInBytes / 1GB, 2) } else { $null }
            FreeStorageSpaceInGB = if ($Device.FreeStorageSpaceInBytes) { [math]::Round($Device.FreeStorageSpaceInBytes / 1GB, 2) } else { $null }
            PhysicalMemoryInGB = if ($Device.PhysicalMemoryInBytes) { [math]::Round($Device.PhysicalMemoryInBytes / 1GB, 2) } else { $null }
            
            # Exchange status
            ExchangeAccessState = if ($Device.ExchangeAccessState) { $Device.ExchangeAccessState.ToString() } else { $null }
            ExchangeAccessStateReason = if ($Device.ExchangeAccessStateReason) { $Device.ExchangeAccessStateReason.ToString() } else { $null }
            
            # Category
            DeviceCategory = $Device.DeviceCategoryDisplayName
        }
    }
    catch {
        Write-MandALog "Error converting Intune device object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

function Get-IntuneDeviceSoftwareInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$ManagedDevices,
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-MandALog "Starting Intune Device Software Inventory..." -Level "INFO"
    $allDeviceSoftware = [System.Collections.Generic.List[PSObject]]::new()

    if (-not $ManagedDevices -or $ManagedDevices.Count -eq 0) {
        Write-MandALog "No managed devices provided. Skipping software inventory." -Level "WARN"
        return $allDeviceSoftware
    }

    # Check if we should use beta endpoint
    $useBeta = $false
    if ($Configuration.graphAPI -and $Configuration.graphAPI.useBetaEndpoint) {
        $useBeta = $true
        Select-MgProfile -Name "beta"
    }

    $totalDevices = $ManagedDevices.Count
    $currentDeviceNum = 0
    $batchSize = 10 # Process in batches to show progress
    
    Write-MandALog "Retrieving software for $totalDevices devices..." -Level "INFO"

    foreach ($device in $ManagedDevices) {
        $currentDeviceNum++
        
        if ($currentDeviceNum % $batchSize -eq 0) {
            Write-MandALog "Progress: $currentDeviceNum/$totalDevices devices processed" -Level "INFO"
        }
        
        try {
            # Get detected apps for the device
            $detectedApps = $null
            if ($useBeta) {
                $detectedApps = Get-MgBetaDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.DeviceId -All -ErrorAction SilentlyContinue
            } else {
                $detectedApps = Get-MgDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.DeviceId -All -ErrorAction SilentlyContinue
            }

            if ($detectedApps) {
                foreach ($app in $detectedApps) {
                    $allDeviceSoftware.Add([PSCustomObject]@{
                        ManagedDeviceId = $device.DeviceId
                        DeviceName = $device.DeviceName
                        UserPrincipalName = $device.UserPrincipalName # Important for user mapping
                        UserId = $device.UserId
                        SoftwareDisplayName = $app.DisplayName
                        SoftwareVersion = $app.Version
                        Publisher = if ($app.Publisher) { $app.Publisher } else { "Unknown" }
                        Platform = if ($app.Platform) { $app.Platform } else { $device.OperatingSystem }
                        SizeInMB = if ($app.SizeInByte) { [math]::Round($app.SizeInByte / 1MB, 2) } else { $null }
                        DetectedAppId = $app.Id
                    })
                }
            }
            
            # Small delay to avoid throttling
            if ($currentDeviceNum % 20 -eq 0) {
                Start-Sleep -Milliseconds 500
            }
            
        } catch {
            Write-MandALog "Error retrieving software for device '$($device.DeviceName)': $($_.Exception.Message)" -Level "WARN"
        }
    }

    if ($allDeviceSoftware.Count -gt 0) {
        Export-DataToCSV -Data $allDeviceSoftware -FileName "IntuneDeviceSoftware.csv" -OutputPath $script:outputPath
        Write-MandALog "Successfully exported $($allDeviceSoftware.Count) software entries." -Level "SUCCESS"
    } else {
        Write-MandALog "No device software found across all devices." -Level "INFO"
    }
    
    return $allDeviceSoftware
}

function Get-IntuneDeviceConfigurationsInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    
    Write-MandALog "Starting Intune Device Configurations Discovery..." -Level "INFO"
    $allConfigs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $deviceConfigs = Get-MgDeviceManagementDeviceConfiguration -All -ErrorAction Stop
        
        foreach ($config in $deviceConfigs) {
            $allConfigs.Add([PSCustomObject]@{
                ConfigurationId = $config.Id
                DisplayName = $config.DisplayName
                Description = $config.Description
                Version = $config.Version
                Platform = if ($config.Platform) { $config.Platform.ToString() } else { $null }
                CreatedDateTime = $config.CreatedDateTime
                LastModifiedDateTime = $config.LastModifiedDateTime
            })
        }
        
        if ($allConfigs.Count -gt 0) {
            Export-DataToCSV -Data $allConfigs -FileName "IntuneDeviceConfigurations.csv" -OutputPath $script:outputPath
            Write-MandALog "Exported $($allConfigs.Count) device configurations." -Level "SUCCESS"
        }
    } catch {
        Write-MandALog "Error during Device Configurations Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $allConfigs
}

function Get-IntuneDeviceCompliancePoliciesInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    
    Write-MandALog "Starting Intune Compliance Policies Discovery..." -Level "INFO"
    $allPolicies = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $compliancePolicies = Get-MgDeviceManagementDeviceCompliancePolicy -All -ErrorAction Stop
        
        foreach ($policy in $compliancePolicies) {
            $allPolicies.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                Version = $policy.Version
                Platform = if ($policy.Platform) { $policy.Platform.ToString() } else { $null }
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
            })
        }
        
        if ($allPolicies.Count -gt 0) {
            Export-DataToCSV -Data $allPolicies -FileName "IntuneCompliancePolicies.csv" -OutputPath $script:outputPath
            Write-MandALog "Exported $($allPolicies.Count) compliance policies." -Level "SUCCESS"
        }
    } catch {
        Write-MandALog "Error during Compliance Policies Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $allPolicies
}

function Get-IntuneManagedAppsInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    
    Write-MandALog "Starting Intune Managed Apps Discovery..." -Level "INFO"
    $allApps = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        # Get mobile apps
        $mobileApps = Get-MgDeviceAppManagementMobileApp -All -ErrorAction Stop
        
        foreach ($app in $mobileApps) {
            $allApps.Add([PSCustomObject]@{
                AppId = $app.Id
                DisplayName = $app.DisplayName
                Description = $app.Description
                Publisher = $app.Publisher
                AppType = ($app.GetType().Name -replace 'MicrosoftGraph','')
                CreatedDateTime = $app.CreatedDateTime
                LastModifiedDateTime = $app.LastModifiedDateTime
                IsFeatured = $app.IsFeatured
                PrivacyInformationUrl = $app.PrivacyInformationUrl
                InformationUrl = $app.InformationUrl
                Owner = $app.Owner
                Developer = $app.Developer
                Notes = $app.Notes
            })
        }
        
        if ($allApps.Count -gt 0) {
            Export-DataToCSV -Data $allApps -FileName "IntuneManagedApps.csv" -OutputPath $script:outputPath
            Write-MandALog "Exported $($allApps.Count) managed apps." -Level "SUCCESS"
        }
    } catch {
        Write-MandALog "Error during Managed Apps Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $allApps
}

function Get-IntuneAppProtectionPoliciesInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    
    Write-MandALog "Starting Intune App Protection Policies Discovery..." -Level "INFO"
    $allPolicies = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        # iOS policies
        $iosPolicies = Get-MgDeviceAppManagementIosManagedAppProtection -All -ErrorAction SilentlyContinue
        foreach ($policy in $iosPolicies) {
            $allPolicies.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                Platform = "iOS"
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
                Version = $policy.Version
            })
        }
        
        # Android policies
        $androidPolicies = Get-MgDeviceAppManagementAndroidManagedAppProtection -All -ErrorAction SilentlyContinue
        foreach ($policy in $androidPolicies) {
            $allPolicies.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                Platform = "Android"
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
                Version = $policy.Version
            })
        }
        
        if ($allPolicies.Count -gt 0) {
            Export-DataToCSV -Data $allPolicies -FileName "IntuneAppProtectionPolicies.csv" -OutputPath $script:outputPath
            Write-MandALog "Exported $($allPolicies.Count) app protection policies." -Level "SUCCESS"
        }
    } catch {
        Write-MandALog "Error during App Protection Policies Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $allPolicies
}

function Get-IntuneEnrollmentRestrictionsInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    
    Write-MandALog "Starting Intune Enrollment Restrictions Discovery..." -Level "INFO"
    $allRestrictions = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $enrollmentConfigs = Get-MgDeviceManagementDeviceEnrollmentConfiguration -All -ErrorAction Stop
        
        foreach ($config in $enrollmentConfigs) {
            $allRestrictions.Add([PSCustomObject]@{
                RestrictionId = $config.Id
                DisplayName = $config.DisplayName
                Description = $config.Description
                Priority = $config.Priority
                ConfigurationType = ($config.GetType().Name -replace 'MicrosoftGraph','')
                CreatedDateTime = $config.CreatedDateTime
                LastModifiedDateTime = $config.LastModifiedDateTime
                Version = $config.Version
            })
        }
        
        if ($allRestrictions.Count -gt 0) {
            Export-DataToCSV -Data $allRestrictions -FileName "IntuneEnrollmentRestrictions.csv" -OutputPath $script:outputPath
            Write-MandALog "Exported $($allRestrictions.Count) enrollment restrictions." -Level "SUCCESS"
        }
    } catch {
        Write-MandALog "Error during Enrollment Restrictions Discovery: $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $allRestrictions
}

# Main function
function Invoke-IntuneDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Intune')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
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
        
        # Initialize the module
        Initialize-IntuneDiscovery -Context $Context
        
        Write-MandALog "--- Starting Intune Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-IntuneDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting Intune discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $intuneData = @{
            ManagedDevices = @()
            DeviceSoftware = @()
            DeviceConfigurations = @()
            DeviceCompliancePolicies = @()
            ManagedApps = @()
            AppProtectionPolicies = @()
            EnrollmentRestrictions = @()
        }
        
        # Discover Managed Devices with specific error handling
        try {
            Write-MandALog "Discovering Intune managed devices..." -Level "INFO" -Context $Context
            $intuneData.ManagedDevices = Get-IntuneManagedDevicesWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['ManagedDeviceCount'] = $intuneData.ManagedDevices.Count
            Write-MandALog "Successfully discovered $($intuneData.ManagedDevices.Count) Intune managed devices" -Level "SUCCESS" -Context $Context
            
            # Export devices data
            if ($intuneData.ManagedDevices.Count -gt 0) {
                Export-DataToCSV -Data $intuneData.ManagedDevices -FilePath (Join-Path $Context.Paths.RawDataOutput "IntuneManagedDevices.csv") -Context $Context
            }
        }
        catch {
            $result.AddError(
                "Failed to discover Intune managed devices",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceManagementManagedDevice'
                    GraphContext = if ($mgCtx = Get-MgContext) { $mgCtx.Account } else { $null }
                }
            )
            Write-MandALog "Error discovering Intune managed devices: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if devices fail
        }
        
        # Discover Device Software with specific error handling
        if ($intuneData.ManagedDevices.Count -gt 0 -and $Configuration.discovery.intune.collectDeviceSoftware -eq $true) {
            try {
                Write-MandALog "Discovering Intune device software..." -Level "INFO" -Context $Context
                $intuneData.DeviceSoftware = Get-IntuneDeviceSoftwareInternal -ManagedDevices $intuneData.ManagedDevices -Configuration $Configuration
                $result.Metadata['DeviceSoftwareCount'] = $intuneData.DeviceSoftware.Count
                Write-MandALog "Successfully discovered $($intuneData.DeviceSoftware.Count) device software entries" -Level "SUCCESS" -Context $Context
            }
            catch {
                $result.AddError(
                    "Failed to discover Intune device software",
                    $_.Exception,
                    @{
                        Operation = 'Get-MgDeviceManagementManagedDeviceDetectedApp'
                        DeviceCount = $intuneData.ManagedDevices.Count
                    }
                )
                Write-MandALog "Error discovering Intune device software: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }
        
        # Discover Device Configurations with specific error handling
        try {
            Write-MandALog "Discovering Intune device configurations..." -Level "INFO" -Context $Context
            $intuneData.DeviceConfigurations = Get-IntuneDeviceConfigurationsInternal -Configuration $Configuration
            $result.Metadata['DeviceConfigurationCount'] = $intuneData.DeviceConfigurations.Count
            Write-MandALog "Successfully discovered $($intuneData.DeviceConfigurations.Count) device configurations" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Intune device configurations",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceManagementDeviceConfiguration'
                }
            )
            Write-MandALog "Error discovering Intune device configurations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Compliance Policies with specific error handling
        try {
            Write-MandALog "Discovering Intune compliance policies..." -Level "INFO" -Context $Context
            $intuneData.DeviceCompliancePolicies = Get-IntuneDeviceCompliancePoliciesInternal -Configuration $Configuration
            $result.Metadata['CompliancePolicyCount'] = $intuneData.DeviceCompliancePolicies.Count
            Write-MandALog "Successfully discovered $($intuneData.DeviceCompliancePolicies.Count) compliance policies" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Intune compliance policies",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceManagementDeviceCompliancePolicy'
                }
            )
            Write-MandALog "Error discovering Intune compliance policies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Managed Apps with specific error handling
        try {
            Write-MandALog "Discovering Intune managed apps..." -Level "INFO" -Context $Context
            $intuneData.ManagedApps = Get-IntuneManagedAppsInternal -Configuration $Configuration
            $result.Metadata['ManagedAppCount'] = $intuneData.ManagedApps.Count
            Write-MandALog "Successfully discovered $($intuneData.ManagedApps.Count) managed apps" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Intune managed apps",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceAppManagementMobileApp'
                }
            )
            Write-MandALog "Error discovering Intune managed apps: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover App Protection Policies with specific error handling
        try {
            Write-MandALog "Discovering Intune app protection policies..." -Level "INFO" -Context $Context
            $intuneData.AppProtectionPolicies = Get-IntuneAppProtectionPoliciesInternal -Configuration $Configuration
            $result.Metadata['AppProtectionPolicyCount'] = $intuneData.AppProtectionPolicies.Count
            Write-MandALog "Successfully discovered $($intuneData.AppProtectionPolicies.Count) app protection policies" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Intune app protection policies",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceAppManagementManagedAppProtection'
                }
            )
            Write-MandALog "Error discovering Intune app protection policies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Enrollment Restrictions with specific error handling
        try {
            Write-MandALog "Discovering Intune enrollment restrictions..." -Level "INFO" -Context $Context
            $intuneData.EnrollmentRestrictions = Get-IntuneEnrollmentRestrictionsInternal -Configuration $Configuration
            $result.Metadata['EnrollmentRestrictionCount'] = $intuneData.EnrollmentRestrictions.Count
            Write-MandALog "Successfully discovered $($intuneData.EnrollmentRestrictions.Count) enrollment restrictions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Intune enrollment restrictions",
                $_.Exception,
                @{
                    Operation = 'Get-MgDeviceManagementDeviceEnrollmentConfiguration'
                }
            )
            Write-MandALog "Error discovering Intune enrollment restrictions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $intuneData
        
        # Determine overall success based on critical data
        if ($intuneData.ManagedDevices.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No managed devices retrieved from Intune")
        } else {
            $result.Success = $true
            Write-MandALog "Intune discovery completed successfully with $($intuneData.ManagedDevices.Count) devices" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in Intune discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in Intune discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "Intune Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count)" -Level "INFO" -Context $Context
        
        # Clean up Graph connections if needed
        try {
            # Reset Graph profile to default if we changed it
            if (Get-MgContext -ErrorAction SilentlyContinue) {
                Select-MgProfile -Name "v1.0" -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
}

# Export module functions
Export-ModuleMember -Function @(
    'Invoke-IntuneDiscovery',
    'Initialize-IntuneDiscovery'
)
