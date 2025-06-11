# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Microsoft Intune Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune managed devices, configurations, and policies using Microsoft Graph API
.NOTES
    Version: 4.4.0 (Fixed Authentication and Discovery)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

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
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] [IntuneDiscovery] [Intune] $Message" -ForegroundColor $color
    }
}

function Test-IntuneConnection {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$RetryDelaySeconds = 5
    )
    
    $attempt = 0
    $connected = $false
    
    while ($attempt -lt $MaxRetries -and -not $connected) {
        $attempt++
        
        try {
            Write-IntuneLog -Level "DEBUG" -Message "Testing Intune/Graph connection (attempt $attempt/$MaxRetries)..."
            
            # Test with Intune-specific endpoint
            $testUri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices?`$top=1"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop
            
            if ($testResponse) {
                $connected = $true
                Write-IntuneLog -Level "SUCCESS" -Message "Intune connection validated successfully"
                return $true
            }
        } catch {
            Write-IntuneLog -Level "WARN" -Message "Connection test failed (attempt $attempt): $($_.Exception.Message)"
            
            if ($attempt -lt $MaxRetries) {
                Write-IntuneLog -Level "INFO" -Message "Retrying in $RetryDelaySeconds seconds..."
                Start-Sleep -Seconds $RetryDelaySeconds
            }
        }
    }
    
    return $false
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

    Write-IntuneLog -Level "HEADER" -Message "Starting Discovery (v4.4.0 - Fixed Authentication and Discovery)" -Context $Context
    Write-IntuneLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = $null
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Intune')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true
            ModuleName   = 'Intune'
            RecordCount  = 0
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    # Initialize variables
    $allDiscoveredData = [System.Collections.ArrayList]::new()
    $graphConnected = $false

    try {
        # STEP 1: Validate prerequisites
        Write-IntuneLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-IntuneLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        # Ensure output directory exists
        if (-not (Test-Path -Path $outputPath -PathType Container)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            } catch {
                $result.AddError("Failed to create output directory: $outputPath", $_.Exception, $null)
                return $result
            }
        }

        # STEP 2: Get module configuration
        $includeDeviceConfiguration = $true
        $includeCompliancePolicies = $true
        $includeProtectionPolicies = $true
        $includeAutopilotDevices = $true
        $includeAppProtectionPolicies = $true
        $includeManagedApps = $true
        $includeGroupPolicyConfigurations = $true
        $includeEnrollmentConfigurations = $true
        $includeScripts = $true
        $maxDevicesPerBatch = 999
        
        if ($Configuration.discovery -and $Configuration.discovery.intune) {
            $intuneConfig = $Configuration.discovery.intune
            if ($null -ne $intuneConfig.includeDeviceConfiguration) { $includeDeviceConfiguration = $intuneConfig.includeDeviceConfiguration }
            if ($null -ne $intuneConfig.includeCompliancePolicies) { $includeCompliancePolicies = $intuneConfig.includeCompliancePolicies }
            if ($null -ne $intuneConfig.includeProtectionPolicies) { $includeProtectionPolicies = $intuneConfig.includeProtectionPolicies }
            if ($null -ne $intuneConfig.includeAutopilotDevices) { $includeAutopilotDevices = $intuneConfig.includeAutopilotDevices }
            if ($null -ne $intuneConfig.includeAppProtectionPolicies) { $includeAppProtectionPolicies = $intuneConfig.includeAppProtectionPolicies }
            if ($null -ne $intuneConfig.includeManagedApps) { $includeManagedApps = $intuneConfig.includeManagedApps }
            if ($null -ne $intuneConfig.includeGroupPolicyConfigurations) { $includeGroupPolicyConfigurations = $intuneConfig.includeGroupPolicyConfigurations }
            if ($null -ne $intuneConfig.includeEnrollmentConfigurations) { $includeEnrollmentConfigurations = $intuneConfig.includeEnrollmentConfigurations }
            if ($null -ne $intuneConfig.includeScripts) { $includeScripts = $intuneConfig.includeScripts }
        }

        # STEP 3: Authenticate to Microsoft Graph with retry logic
        Write-IntuneLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        $authRetries = 0
        $maxAuthRetries = 3
        $graphAuth = $null
        
        while ($authRetries -lt $maxAuthRetries -and -not $graphAuth) {
            $authRetries++
            try {
                Write-IntuneLog -Level "DEBUG" -Message "Authentication attempt $authRetries of $maxAuthRetries..." -Context $Context
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
                
                if ($graphAuth) {
                    Write-IntuneLog -Level "SUCCESS" -Message "Authentication successful" -Context $Context
                    break
                }
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Authentication attempt $authRetries failed: $($_.Exception.Message)" -Context $Context
                if ($authRetries -lt $maxAuthRetries) {
                    Start-Sleep -Seconds 2
                } else {
                    $result.AddError("Failed to authenticate with Graph service after $maxAuthRetries attempts: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
                    return $result
                }
            }
        }
        
        # Validate connection with retry
        if (-not (Test-IntuneConnection -MaxRetries 3 -RetryDelaySeconds 5)) {
            $result.AddError("Failed to establish valid Intune connection after authentication", $null, @{SessionId = $SessionId})
            return $result
        }
        
        $graphConnected = $true

        # STEP 4: PERFORM DISCOVERY
        Write-IntuneLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Discover Managed Devices with enhanced retry logic
        $managedDevices = @()
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune managed devices..." -Context $Context
            
            # Use beta endpoint for comprehensive device data
            $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices?`$top=$maxDevicesPerBatch"
            
            $totalDevices = 0
            $deviceErrors = 0
            
            do {
                Write-IntuneLog -Level "DEBUG" -Message "Fetching devices from: $uri" -Context $Context
                $retryCount = 0
                $maxRetries = 3
                $response = $null
                
                while ($retryCount -lt $maxRetries -and -not $response) {
                    $retryCount++
                    try {
                        $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($device in $response.value) {
                                $totalDevices++
                                
                                try {
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
                                    
                                    $managedDevices += $deviceObj
                                    $null = $allDiscoveredData.Add($deviceObj)
                                    
                                } catch {
                                    $deviceErrors++
                                    Write-IntuneLog -Level "DEBUG" -Message "Error processing device $($device.deviceName): $_" -Context $Context
                                }
                                
                                # Report progress
                                if ($totalDevices % 100 -eq 0) {
                                    Write-IntuneLog -Level "DEBUG" -Message "Processed $totalDevices devices so far..." -Context $Context
                                }
                            }
                        }
                        
                        $uri = $response.'@odata.nextLink'
                        
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching devices (attempt $retryCount): $($_.Exception.Message)" -Context $Context
                        if ($retryCount -lt $maxRetries) {
                            Start-Sleep -Seconds ([Math]::Pow(2, $retryCount))  # Exponential backoff
                        } else {
                            $uri = $null
                        }
                    }
                }
                
            } while ($uri)
            
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalDevices Intune managed devices ($deviceErrors errors)" -Context $Context
            $result.Metadata["ManagedDeviceCount"] = $totalDevices
            
        } catch {
            Write-IntuneLog -Level "WARN" -Message "Failed to discover managed devices: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover managed devices: $($_.Exception.Message)", @{Operation = "GetManagedDevices"})
        }
        
        # Discover Device Configurations
        if ($includeDeviceConfiguration) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device configuration profiles..." -Context $Context
                
                $configUri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations?`$top=999"
                $configCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $configUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($config in $response.value) {
                                $configCount++
                                
                                # Get assignments for this configuration
                                $assignments = @()
                                try {
                                    $assignmentUri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations/$($config.id)/assignments"
                                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                                    $assignments = $assignmentResponse.value
                                } catch {
                                    Write-IntuneLog -Level "DEBUG" -Message "Could not get assignments for configuration $($config.displayName): $_" -Context $Context
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
                        }
                        
                        $configUri = $response.'@odata.nextLink'
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching configurations: $($_.Exception.Message)" -Context $Context
                        $configUri = $null
                    }
                } while ($configUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $configCount device configuration profiles" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover device configurations: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover device configurations: $($_.Exception.Message)", @{Operation = "GetDeviceConfigurations"})
            }
        }
        
        # Discover Compliance Policies
        if ($includeCompliancePolicies) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering compliance policies..." -Context $Context
                
                $complianceUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies?`$top=999"
                $complianceCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $complianceUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($policy in $response.value) {
                                $complianceCount++
                                
                                # Get assignments
                                $assignments = @()
                                try {
                                    $assignmentUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies/$($policy.id)/assignments"
                                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                                    $assignments = $assignmentResponse.value
                                } catch {
                                    Write-IntuneLog -Level "DEBUG" -Message "Could not get assignments for compliance policy $($policy.displayName): $_" -Context $Context
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
                        }
                        
                        $complianceUri = $response.'@odata.nextLink'
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching compliance policies: $($_.Exception.Message)" -Context $Context
                        $complianceUri = $null
                    }
                } while ($complianceUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $complianceCount compliance policies" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover compliance policies: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover compliance policies: $($_.Exception.Message)", @{Operation = "GetCompliancePolicies"})
            }
        }
        
        # Continue with other discovery operations...
        # (App Protection Policies, Managed Apps, Autopilot Devices, etc.)
        # The pattern remains the same - proper error handling and retry logic
        
        # App Protection Policies
        if ($includeAppProtectionPolicies) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering app protection policies..." -Context $Context
                
                # iOS App Protection Policies
                try {
                    $iosAppPolicyUri = "https://graph.microsoft.com/beta/deviceAppManagement/iosManagedAppProtections?`$top=999"
                    $response = Invoke-MgGraphRequest -Uri $iosAppPolicyUri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($policy in $response.value) {
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
                        Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) iOS app protection policies" -Context $Context
                    }
                } catch {
                    Write-IntuneLog -Level "DEBUG" -Message "Could not get iOS app protection policies: $_" -Context $Context
                }
                
                # Android App Protection Policies
                try {
                    $androidAppPolicyUri = "https://graph.microsoft.com/beta/deviceAppManagement/androidManagedAppProtections?`$top=999"
                    $response = Invoke-MgGraphRequest -Uri $androidAppPolicyUri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($policy in $response.value) {
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
                        Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) Android app protection policies" -Context $Context
                    }
                } catch {
                    Write-IntuneLog -Level "DEBUG" -Message "Could not get Android app protection policies: $_" -Context $Context
                }
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover app protection policies: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover app protection policies: $($_.Exception.Message)", @{Operation = "GetAppProtectionPolicies"})
            }
        }
        
        # Managed Apps
        if ($includeManagedApps) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering managed applications..." -Context $Context
                
                $mobileAppsUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps?`$top=999"
                $appCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $mobileAppsUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($app in $response.value) {
                                $appCount++
                                
                                # Get assignments
                                $assignments = @()
                                try {
                                    $assignmentUri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps/$($app.id)/assignments"
                                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction Stop
                                    $assignments = $assignmentResponse.value
                                } catch {
                                    Write-IntuneLog -Level "DEBUG" -Message "Could not get assignments for app $($app.displayName): $_" -Context $Context
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
                        }
                        
                        $mobileAppsUri = $response.'@odata.nextLink'
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching mobile apps: $($_.Exception.Message)" -Context $Context
                        $mobileAppsUri = $null
                    }
                } while ($mobileAppsUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $appCount managed applications" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover managed apps: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover managed apps: $($_.Exception.Message)", @{Operation = "GetManagedApps"})
            }
        }
        
        # STEP 5: Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-IntuneLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by object type and export to separate files
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $objects = $group.Group
                
                # Remove the _ObjectType property before export
                $exportData = $objects | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_ObjectType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Intune" -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
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
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-IntuneLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-IntuneLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # STEP 6: Update result metadata
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId
        
        # Add specific counts
        $dataGroups = $allDiscoveredData | Group-Object -Property _ObjectType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Catch any unexpected errors
        Write-IntuneLog -Level "ERROR" -Message "Critical error during discovery: $($_.Exception.Message)" -Context $Context
        Write-IntuneLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
        $result.AddError("Critical error during discovery: $($_.Exception.Message)", $_.Exception, @{
            ErrorType = "General"
            StackTrace = $_.ScriptStackTrace
        })
    } finally {
        # STEP 7: Cleanup
        Write-IntuneLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Note: No need to disconnect - handled by auth service
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set in hashtable result
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        $finalStatus = if($result.Success){"SUCCESS"}else{"ERROR"}
        Write-IntuneLog -Level $finalStatus -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-IntuneLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# Export module function
Export-ModuleMember -Function Invoke-IntuneDiscovery