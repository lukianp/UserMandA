# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.1.0
# Created: 2025-01-18
# Last Modified: 2026-01-01

<#
.SYNOPSIS
    Microsoft Intune Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune managed devices, configurations, and policies using Microsoft Graph API. This module provides 
    comprehensive Intune discovery including device management policies, configuration profiles, compliance settings, 
    and mobile device management configurations essential for M&A device management assessment and migration planning.
.NOTES
    Version: 1.1.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Modified: 2026-01-01 - Switch from beta to v1.0 API for stable discovery data
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Write-IntuneLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )

    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Intune] $Message" -Level $Level -Component "IntuneDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "[Intune] $Message" -ForegroundColor $color
    }
}

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Extract credentials from Configuration
    $TenantId = $Configuration.TenantId
    $ClientId = $Configuration.ClientId
    $ClientSecret = $Configuration.ClientSecret

    if (-not $TenantId -or -not $ClientId -or -not $ClientSecret) {
        Write-IntuneLog -Message "Missing credentials. TenantId: $(if($TenantId){'Present'}else{'Missing'}), ClientId: $(if($ClientId){'Present'}else{'Missing'}), ClientSecret: $(if($ClientSecret){'Present (length: ' + $ClientSecret.Length + ')'}else{'Missing'})" -Level "ERROR"
        return @{
            Success = $false
            Error = "Missing required credentials: TenantId, ClientId, and ClientSecret are required"
        }
    }

    Write-IntuneLog -Message "Credentials validated successfully. TenantId: $TenantId, ClientId: $ClientId, ClientSecret: Present (length: $($ClientSecret.Length))" -Level "SUCCESS"

    return @{
        Success = $true
        TenantId = $TenantId
        ClientId = $ClientId
        ClientSecret = $ClientSecret
    }
}

function Invoke-IntuneDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-IntuneLog -Level "HEADER" -Message "Starting Intune Discovery (Session-based)" -Context $Context
    Write-IntuneLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context

    # Validate and extract credentials
    $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
    if (-not $authInfo.Success) {
        Write-IntuneLog -Level "ERROR" -Message "Authentication validation failed: $($authInfo.Error)" -Context $Context
        # Return error result
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $errorResult = [DiscoveryResult]::new('Intune')
        $errorResult.AddError($authInfo.Error, $null, @{Phase = "Authentication"})
        $errorResult.EndTime = Get-Date
        return $errorResult
    }

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Log authentication status
        Write-ModuleLog -ModuleName "Intune" -Message "Authentication Status - TenantId: $($Configuration.TenantId), ClientId: $($Configuration.ClientId), ClientSecret: $(if($Configuration.ClientSecret){'Present (length: ' + $Configuration.ClientSecret.Length + ')'}else{'Missing'})" -Level "INFO"

        # Verify Graph connection
        if ($Connections.Graph) {
            Write-ModuleLog -ModuleName "Intune" -Message "Graph API connection established successfully" -Level "SUCCESS"
        } else {
            Write-ModuleLog -ModuleName "Intune" -Message "WARNING: Graph API connection not available" -Level "WARN"
            $Result.AddError("Graph API connection not available", $null, @{Phase = "Connection"})
            return $allDiscoveredData
        }

        # Discover Managed Devices with enhanced retry logic
        try {
            Write-ModuleLog -ModuleName "Intune" -Message "Discovering Intune managed devices..." -Level "INFO"
            
            # Use v1.0 endpoint for stable device data
            $uri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$top=999"
            
            $managedDevices = Invoke-GraphAPIWithPaging -Uri $uri -ModuleName "Intune"
            
            foreach ($device in $managedDevices) {
                # Extract all available device information
                $deviceObj = [PSCustomObject]@{
                    # Core identification
                    DeviceId = $device.id
                    DeviceName = $device.deviceName
                    ManagedDeviceName = $device.managedDeviceName
                    SerialNumber = $device.serialNumber
                    
                    # User mapping
                    UserPrincipalName = $device.userPrincipalName
                    UserDisplayName = $device.userDisplayName
                    UserId = $device.userId
                    EmailAddress = $device.emailAddress
                    
                    # Device specifications
                    OperatingSystem = $device.operatingSystem
                    OSVersion = $device.osVersion
                    Model = $device.model
                    Manufacturer = $device.manufacturer
                    DeviceType = $device.deviceType
                    HardwareInformation = if ($device.hardwareInformation) {
                        "$($device.hardwareInformation.model)|$($device.hardwareInformation.manufacturer)|$($device.hardwareInformation.serialNumber)"
                    } else { $null }
                    
                    # Network identifiers
                    IMEI = $device.imei
                    MEID = $device.meid
                    WiFiMacAddress = $device.wiFiMacAddress
                    EthernetMacAddress = $device.ethernetMacAddress
                    PhoneNumber = $device.phoneNumber
                    SubscriberCarrier = $device.subscriberCarrier
                    ICCID = $device.iccid
                    UDID = $device.udid
                    
                    # Management details
                    ManagementAgent = $device.managementAgent
                    ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                    DeviceEnrollmentType = $device.deviceEnrollmentType
                    DeviceRegistrationState = $device.deviceRegistrationState
                    ManagementState = $device.managementState
                    
                    # Compliance and security
                    ComplianceState = $device.complianceState
                    ComplianceGracePeriodExpirationDateTime = $device.complianceGracePeriodExpirationDateTime
                    IsEncrypted = $device.isEncrypted
                    IsSupervised = $device.isSupervised
                    JailBroken = $device.jailBroken
                    AndroidSecurityPatchLevel = $device.androidSecurityPatchLevel
                    PartnerReportedThreatState = $device.partnerReportedThreatState
                    
                    # Dates and sync info
                    EnrolledDateTime = $device.enrolledDateTime
                    LastSyncDateTime = $device.lastSyncDateTime
                    ManagementCertificateExpirationDate = $device.managementCertificateExpirationDate
                    
                    # Azure AD integration
                    AzureADDeviceId = $device.azureADDeviceId
                    AzureADRegistered = $device.azureADRegistered
                    AzureActiveDirectoryDeviceId = $device.azureActiveDirectoryDeviceId
                    
                    # Storage information
                    TotalStorageSpaceInGB = if ($device.totalStorageSpaceInBytes) { 
                        [math]::Round($device.totalStorageSpaceInBytes / 1GB, 2) 
                    } else { $null }
                    FreeStorageSpaceInGB = if ($device.freeStorageSpaceInBytes) { 
                        [math]::Round($device.freeStorageSpaceInBytes / 1GB, 2) 
                    } else { $null }
                    
                    # Exchange/ActiveSync status
                    ExchangeAccessState = $device.exchangeAccessState
                    ExchangeAccessStateReason = $device.exchangeAccessStateReason
                    ExchangeLastSuccessfulSyncDateTime = $device.exchangeLastSuccessfulSyncDateTime
                    EASActivated = $device.easActivated
                    EASDeviceId = $device.easDeviceId
                    EASActivationDateTime = $device.easActivationDateTime
                    
                    # Configuration and apps
                    ConfigurationManagerClientEnabledFeatures = if ($device.configurationManagerClientEnabledFeatures) {
                        $device.configurationManagerClientEnabledFeatures | ConvertTo-Json -Compress
                    } else { $null }
                    DeviceCategory = $device.deviceCategoryDisplayName
                    
                    # Additional status
                    ActivationLockBypassCode = $device.activationLockBypassCode
                    RemoteAssistanceSessionUrl = $device.remoteAssistanceSessionUrl
                    RemoteAssistanceSessionErrorDetails = $device.remoteAssistanceSessionErrorDetails
                    IsEASManaged = $device.isEASManaged
                    AutopilotEnrolled = $device.autopilotEnrolled
                    RequireUserEnrollmentApproval = $device.requireUserEnrollmentApproval
                    
                    _ObjectType = 'ManagedDevice'
                }
                
                $null = $allDiscoveredData.Add($deviceObj)
            }
            
            Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($managedDevices.Count) Intune managed devices" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover managed devices: $($_.Exception.Message)", @{Operation = "GetManagedDevices"})
        }
        
        # Discover Device Configurations
        try {
            Write-ModuleLog -ModuleName "Intune" -Message "Discovering device configuration profiles..." -Level "INFO"
            
            $configUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations?`$top=999"
            $deviceConfigurations = Invoke-GraphAPIWithPaging -Uri $configUri -ModuleName "Intune"
            
            foreach ($config in $deviceConfigurations) {
                # Get assignments for this configuration
                $assignments = @()
                try {
                    $assignmentUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations/$($config.id)/assignments"
                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                    $assignments = $assignmentResponse.value
                } catch {
                    Write-ModuleLog -ModuleName "Intune" -Message "Could not get assignments for configuration $($config.displayName): $_" -Level "DEBUG"
                }
                
                $configObj = [PSCustomObject]@{
                    ConfigurationId = $config.id
                    DisplayName = $config.displayName
                    Description = $config.description
                    CreatedDateTime = $config.createdDateTime
                    LastModifiedDateTime = $config.lastModifiedDateTime
                    Version = $config.version
                    ConfigurationType = $config.'@odata.type' -replace '#microsoft.graph.', ''
                    RoleScopeTagIds = if ($config.roleScopeTagIds) { ($config.roleScopeTagIds -join ';') } else { $null }
                    SupportsScopeTags = $config.supportsScopeTags
                    DeviceManagementApplicabilityRuleOsEdition = if ($config.deviceManagementApplicabilityRuleOsEdition) {
                        $config.deviceManagementApplicabilityRuleOsEdition | ConvertTo-Json -Compress
                    } else { $null }
                    DeviceManagementApplicabilityRuleOsVersion = if ($config.deviceManagementApplicabilityRuleOsVersion) {
                        $config.deviceManagementApplicabilityRuleOsVersion | ConvertTo-Json -Compress
                    } else { $null }
                    DeviceManagementApplicabilityRuleDeviceMode = if ($config.deviceManagementApplicabilityRuleDeviceMode) {
                        $config.deviceManagementApplicabilityRuleDeviceMode | ConvertTo-Json -Compress
                    } else { $null }
                    AssignmentCount = $assignments.Count
                    AssignmentTargets = if ($assignments) {
                        ($assignments | ForEach-Object { "$($_.target.'@odata.type'):$($_.id)" }) -join ';'
                    } else { $null }
                    _ObjectType = 'DeviceConfiguration'
                }
                
                $null = $allDiscoveredData.Add($configObj)
            }
            
            Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($deviceConfigurations.Count) device configuration profiles" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover device configurations: $($_.Exception.Message)", @{Operation = "GetDeviceConfigurations"})
        }
        
        # Discover Compliance Policies
        try {
            Write-ModuleLog -ModuleName "Intune" -Message "Discovering compliance policies..." -Level "INFO"
            
            $complianceUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies?`$top=999"
            $compliancePolicies = Invoke-GraphAPIWithPaging -Uri $complianceUri -ModuleName "Intune"
            
            foreach ($policy in $compliancePolicies) {
                # Get assignments
                $assignments = @()
                try {
                    $assignmentUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies/$($policy.id)/assignments"
                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                    $assignments = $assignmentResponse.value
                } catch {
                    Write-ModuleLog -ModuleName "Intune" -Message "Could not get assignments for compliance policy $($policy.displayName): $_" -Level "DEBUG"
                }
                
                $policyObj = [PSCustomObject]@{
                    PolicyId = $policy.id
                    DisplayName = $policy.displayName
                    Description = $policy.description
                    CreatedDateTime = $policy.createdDateTime
                    LastModifiedDateTime = $policy.lastModifiedDateTime
                    Version = $policy.version
                    Platform = $policy.'@odata.type' -replace '#microsoft.graph.', '' -replace 'CompliancePolicy', ''
                    RoleScopeTagIds = if ($policy.roleScopeTagIds) { ($policy.roleScopeTagIds -join ';') } else { $null }
                    ScheduledActionsForRule = if ($policy.scheduledActionsForRule) {
                        $policy.scheduledActionsForRule | ConvertTo-Json -Compress
                    } else { $null }
                    AssignmentCount = $assignments.Count
                    AssignmentTargets = if ($assignments) {
                        ($assignments | ForEach-Object { "$($_.target.'@odata.type'):$($_.id)" }) -join ';'
                    } else { $null }
                    _ObjectType = 'CompliancePolicy'
                }
                
                $null = $allDiscoveredData.Add($policyObj)
            }
            
            Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($compliancePolicies.Count) compliance policies" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover compliance policies: $($_.Exception.Message)", @{Operation = "GetCompliancePolicies"})
        }
        
        # App Protection Policies
        try {
            Write-ModuleLog -ModuleName "Intune" -Message "Discovering app protection policies..." -Level "INFO"
            
            # iOS App Protection Policies
            try {
                $iosAppPolicyUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/iosManagedAppProtections?`$top=999"
                $iosAppPolicies = Invoke-GraphAPIWithPaging -Uri $iosAppPolicyUri -ModuleName "Intune"
                
                foreach ($policy in $iosAppPolicies) {
                    $policyObj = [PSCustomObject]@{
                        PolicyId = $policy.id
                        DisplayName = $policy.displayName
                        Description = $policy.description
                        CreatedDateTime = $policy.createdDateTime
                        LastModifiedDateTime = $policy.lastModifiedDateTime
                        Platform = "iOS"
                        PolicyType = "AppProtection"
                        Version = $policy.version
                        PeriodOfflineBeforeAccessCheck = $policy.periodOfflineBeforeAccessCheck
                        PeriodOnlineBeforeAccessCheck = $policy.periodOnlineBeforeAccessCheck
                        AllowedInboundDataTransferSources = $policy.allowedInboundDataTransferSources
                        AllowedOutboundDataTransferDestinations = $policy.allowedOutboundDataTransferDestinations
                        PinRequired = $policy.pinRequired
                        MaximumPinRetries = $policy.maximumPinRetries
                        SimplePinBlocked = $policy.simplePinBlocked
                        MinimumPinLength = $policy.minimumPinLength
                        PinCharacterSet = $policy.pinCharacterSet
                        PeriodBeforePinReset = $policy.periodBeforePinReset
                        AllowedDataStorageLocations = if ($policy.allowedDataStorageLocations) {
                            ($policy.allowedDataStorageLocations -join ';')
                        } else { $null }
                        ContactSyncBlocked = $policy.contactSyncBlocked
                        PrintBlocked = $policy.printBlocked
                        FingerprintBlocked = $policy.fingerprintBlocked
                        DisableAppPinIfDevicePinIsSet = $policy.disableAppPinIfDevicePinIsSet
                        _ObjectType = 'AppProtectionPolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
                Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($iosAppPolicies.Count) iOS app protection policies" -Level "SUCCESS"
            } catch {
                $Result.AddWarning("Could not get iOS app protection policies: $($_.Exception.Message)", @{Operation = "GetIosAppProtectionPolicies"})
            }
            
            # Android App Protection Policies
            try {
                $androidAppPolicyUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/androidManagedAppProtections?`$top=999"
                $androidAppPolicies = Invoke-GraphAPIWithPaging -Uri $androidAppPolicyUri -ModuleName "Intune"
                
                foreach ($policy in $androidAppPolicies) {
                    $policyObj = [PSCustomObject]@{
                        PolicyId = $policy.id
                        DisplayName = $policy.displayName
                        Description = $policy.description
                        CreatedDateTime = $policy.createdDateTime
                        LastModifiedDateTime = $policy.lastModifiedDateTime
                        Platform = "Android"
                        PolicyType = "AppProtection"
                        Version = $policy.version
                        PeriodOfflineBeforeAccessCheck = $policy.periodOfflineBeforeAccessCheck
                        PeriodOnlineBeforeAccessCheck = $policy.periodOnlineBeforeAccessCheck
                        AllowedInboundDataTransferSources = $policy.allowedInboundDataTransferSources
                        AllowedOutboundDataTransferDestinations = $policy.allowedOutboundDataTransferDestinations
                        PinRequired = $policy.pinRequired
                        MaximumPinRetries = $policy.maximumPinRetries
                        SimplePinBlocked = $policy.simplePinBlocked
                        MinimumPinLength = $policy.minimumPinLength
                        PinCharacterSet = $policy.pinCharacterSet
                        PeriodBeforePinReset = $policy.periodBeforePinReset
                        AllowedDataStorageLocations = if ($policy.allowedDataStorageLocations) {
                            ($policy.allowedDataStorageLocations -join ';')
                        } else { $null }
                        ContactSyncBlocked = $policy.contactSyncBlocked
                        PrintBlocked = $policy.printBlocked
                        FingerprintBlocked = $policy.fingerprintBlocked
                        DisableAppPinIfDevicePinIsSet = $policy.disableAppPinIfDevicePinIsSet
                        ScreenCaptureBlocked = $policy.screenCaptureBlocked
                        RequireClass3Biometrics = $policy.requireClass3Biometrics
                        RequirePinAfterBiometricChange = $policy.requirePinAfterBiometricChange
                        _ObjectType = 'AppProtectionPolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
                Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($androidAppPolicies.Count) Android app protection policies" -Level "SUCCESS"
            } catch {
                $Result.AddWarning("Could not get Android app protection policies: $($_.Exception.Message)", @{Operation = "GetAndroidAppProtectionPolicies"})
            }
            
        } catch {
            $Result.AddWarning("Failed to discover app protection policies: $($_.Exception.Message)", @{Operation = "GetAppProtectionPolicies"})
        }
        
        # Managed Apps
        try {
            Write-ModuleLog -ModuleName "Intune" -Message "Discovering managed applications..." -Level "INFO"
            
            $mobileAppsUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?`$top=999"
            $managedApps = Invoke-GraphAPIWithPaging -Uri $mobileAppsUri -ModuleName "Intune"
            
            foreach ($app in $managedApps) {
                # Get assignments
                $assignments = @()
                try {
                    $assignmentUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps/$($app.id)/assignments"
                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                    $assignments = $assignmentResponse.value
                } catch {
                    Write-ModuleLog -ModuleName "Intune" -Message "Could not get assignments for app $($app.displayName): $_" -Level "DEBUG"
                }
                
                $appObj = [PSCustomObject]@{
                    AppId = $app.id
                    DisplayName = $app.displayName
                    Description = $app.description
                    Publisher = $app.publisher
                    CreatedDateTime = $app.createdDateTime
                    LastModifiedDateTime = $app.lastModifiedDateTime
                    AppType = $app.'@odata.type' -replace '#microsoft.graph.', ''
                    IsFeatured = $app.isFeatured
                    PrivacyInformationUrl = $app.privacyInformationUrl
                    InformationUrl = $app.informationUrl
                    Owner = $app.owner
                    Developer = $app.developer
                    Notes = $app.notes
                    PublishingState = $app.publishingState
                    AppAvailability = $app.appAvailability
                    Version = $app.version
                    FileName = $app.fileName
                    Size = if ($app.size) { [math]::Round($app.size / 1MB, 2) } else { $null }
                    AssignmentCount = $assignments.Count
                    AssignmentTargets = if ($assignments) {
                        ($assignments | ForEach-Object { "$($_.target.'@odata.type'):$($_.intent)" }) -join ';'
                    } else { $null }
                    _ObjectType = 'ManagedApp'
                }
                
                $null = $allDiscoveredData.Add($appObj)
            }
            
            Write-ModuleLog -ModuleName "Intune" -Message "Discovered $($managedApps.Count) managed applications" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover managed apps: $($_.Exception.Message)", @{Operation = "GetManagedApps"})
        }
        
        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "Intune" -Message "Exporting $($allDiscoveredData.Count) records..." -Level "INFO"

            # Check if internal export is disabled
            if (-not $Context.ContainsKey('DisableInternalExport') -or -not $Context.DisableInternalExport) {
                # Group by object type and export to separate files
                $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType

                foreach ($group in $objectGroups) {
                    $objectType = $group.Name
                    $data = $group.Group

                    # Map object types to file names
                    $fileName = switch ($objectType) {
                        'ManagedDevice' { 'IntuneManagedDevices.csv' }
                        'DeviceConfiguration' { 'IntuneDeviceConfigurations.csv' }
                        'CompliancePolicy' { 'IntuneCompliancePolicies.csv' }
                        'AppProtectionPolicy' { 'IntuneAppProtectionPolicies.csv' }
                        'ManagedApp' { 'IntuneManagedApps.csv' }
                        'AutopilotDevice' { 'IntuneAutopilotDevices.csv' }
                        'GroupPolicyConfiguration' { 'IntuneGroupPolicyConfigurations.csv' }
                        'EnrollmentConfiguration' { 'IntuneEnrollmentConfigurations.csv' }
                        'PowerShellScript' { 'IntunePowerShellScripts.csv' }
                        'DeviceCategory' { 'IntuneDeviceCategories.csv' }
                        'IntuneRole' { 'IntuneRoleDefinitions.csv' }
                        default { "Intune_$objectType.csv" }
                    }

                    Export-DiscoveryResults -Data $data `
                        -FileName $fileName `
                        -OutputPath $Context.Paths.RawDataOutput `
                        -ModuleName "Intune" `
                        -SessionId $SessionId
                }
            }
        } else {
            Write-ModuleLog -ModuleName "Intune" -Message "No data discovered to export" -Level "WARN"
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "Intune" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph') `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-IntuneDiscovery