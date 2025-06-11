# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Microsoft Intune Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune managed devices, configurations, and policies using Microsoft Graph API
.NOTES
    Version: 4.2.0 (Fixed)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-IntuneLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Intune] $Message" -Level $Level -Component "IntuneDiscovery" -Context $Context
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

    Write-IntuneLog -Level "HEADER" -Message "Starting Discovery (v4.2.0 - Fixed)" -Context $Context
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
        }

        # STEP 3: Authenticate (Simplified - no validation needed)
        Write-IntuneLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            $graphConnected = $true
            Write-IntuneLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }

        # STEP 4: PERFORM DISCOVERY
        Write-IntuneLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Discover Managed Devices (Progressive approach)
        $managedDevices = @()
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune managed devices..." -Context $Context
            
            $totalDevices = 0
            $deviceErrors = 0
            
            # Start with basic fields that always work
            $basicSelectFields = @(
                'id', 'userId', 'deviceName', 'managedDeviceOwnerType', 'enrolledDateTime',
                'lastSyncDateTime', 'operatingSystem', 'complianceState', 'jailBroken',
                'managementAgent', 'osVersion', 'easActivated', 'azureADRegistered',
                'deviceEnrollmentType', 'emailAddress', 'azureADDeviceId', 'deviceRegistrationState',
                'userPrincipalName', 'model', 'manufacturer', 'serialNumber', 'imei'
            )
            
            # Try v1.0 endpoint first for stability
            $uri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$select=$($basicSelectFields -join ',')&`$top=$maxDevicesPerBatch"
            $useBeta = $false
            
            # If v1.0 fails, fall back to beta
            try {
                $testResponse = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                if (-not $testResponse -or -not $testResponse.value) {
                    $useBeta = $true
                }
            } catch {
                $useBeta = $true
            }
            
            if ($useBeta) {
                Write-IntuneLog -Level "INFO" -Message "Using beta endpoint for richer device data" -Context $Context
                # Beta endpoint with extended fields
                $extendedSelectFields = @(
                    'id', 'userId', 'deviceName', 'managedDeviceOwnerType', 'enrolledDateTime',
                    'lastSyncDateTime', 'operatingSystem', 'complianceState', 'jailBroken',
                    'managementAgent', 'osVersion', 'easActivated', 'easDeviceId',
                    'easActivationDateTime', 'azureADRegistered', 'deviceEnrollmentType',
                    'emailAddress', 'azureADDeviceId', 'deviceRegistrationState',
                    'deviceCategoryDisplayName', 'isSupervised', 'exchangeLastSuccessfulSyncDateTime',
                    'exchangeAccessState', 'exchangeAccessStateReason', 'isEncrypted',
                    'userPrincipalName', 'model', 'manufacturer', 'imei',
                    'complianceGracePeriodExpirationDateTime', 'serialNumber', 'phoneNumber',
                    'androidSecurityPatchLevel', 'userDisplayName', 'wiFiMacAddress',
                    'subscriberCarrier', 'meid', 'totalStorageSpaceInBytes',
                    'freeStorageSpaceInBytes', 'managedDeviceName', 'partnerReportedThreatState'
                )
                $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices?`$select=$($extendedSelectFields -join ',')&`$top=$maxDevicesPerBatch"
            }
            
            do {
                Write-IntuneLog -Level "DEBUG" -Message "Fetching devices from: $uri" -Context $Context
                
                try {
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($device in $response.value) {
                            $totalDevices++
                            
                            try {
                                # Get additional device details if using v1.0
                                $additionalDetails = @{}
                                if (-not $useBeta) {
                                    try {
                                        $detailUri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices/$($device.id)"
                                        $deviceDetails = Invoke-MgGraphRequest -Uri $detailUri -Method GET -ErrorAction Stop
                                        $additionalDetails = $deviceDetails
                                    } catch {
                                        Write-IntuneLog -Level "DEBUG" -Message "Could not get additional details for device $($device.deviceName): $_" -Context $Context
                                    }
                                }
                                
                                $deviceObj = [PSCustomObject]@{
                                    # Core identification
                                    DeviceId = $device.id
                                    DeviceName = $device.deviceName
                                    ManagedDeviceName = if ($additionalDetails.managedDeviceName) { $additionalDetails.managedDeviceName } else { $device.managedDeviceName }
                                    SerialNumber = $device.serialNumber
                                    
                                    # User mapping fields
                                    UserPrincipalName = $device.userPrincipalName
                                    UserDisplayName = if ($additionalDetails.userDisplayName) { $additionalDetails.userDisplayName } else { $device.userDisplayName }
                                    UserId = $device.userId
                                    EmailAddress = $device.emailAddress
                                    
                                    # Device details
                                    OperatingSystem = $device.operatingSystem
                                    OSVersion = $device.osVersion
                                    Model = $device.model
                                    Manufacturer = $device.manufacturer
                                    DeviceType = if ($additionalDetails.deviceType) { $additionalDetails.deviceType } else { $device.deviceType }
                                    
                                    # Network identifiers
                                    IMEI = $device.imei
                                    MEID = if ($additionalDetails.meid) { $additionalDetails.meid } else { $device.meid }
                                    WiFiMacAddress = if ($additionalDetails.wiFiMacAddress) { $additionalDetails.wiFiMacAddress } else { $device.wiFiMacAddress }
                                    EthernetMacAddress = if ($additionalDetails.ethernetMacAddress) { $additionalDetails.ethernetMacAddress } else { $device.ethernetMacAddress }
                                    PhoneNumber = if ($additionalDetails.phoneNumber) { $additionalDetails.phoneNumber } else { $device.phoneNumber }
                                    SubscriberCarrier = if ($additionalDetails.subscriberCarrier) { $additionalDetails.subscriberCarrier } else { $device.subscriberCarrier }
                                    
                                    # Management status
                                    ManagementAgent = $device.managementAgent
                                    ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                                    DeviceEnrollmentType = $device.deviceEnrollmentType
                                    DeviceRegistrationState = $device.deviceRegistrationState
                                    
                                    # Compliance and security
                                    ComplianceState = $device.complianceState
                                    ComplianceGracePeriodExpirationDateTime = if ($additionalDetails.complianceGracePeriodExpirationDateTime) { 
                                        $additionalDetails.complianceGracePeriodExpirationDateTime 
                                    } else { 
                                        $device.complianceGracePeriodExpirationDateTime 
                                    }
                                    IsEncrypted = if ($additionalDetails.isEncrypted) { $additionalDetails.isEncrypted } else { $device.isEncrypted }
                                    IsSupervised = if ($additionalDetails.isSupervised) { $additionalDetails.isSupervised } else { $device.isSupervised }
                                    JailBroken = $device.jailBroken
                                    AndroidSecurityPatchLevel = if ($additionalDetails.androidSecurityPatchLevel) { 
                                        $additionalDetails.androidSecurityPatchLevel 
                                    } else { 
                                        $device.androidSecurityPatchLevel 
                                    }
                                    PartnerReportedThreatState = if ($additionalDetails.partnerReportedThreatState) { 
                                        $additionalDetails.partnerReportedThreatState 
                                    } else { 
                                        $device.partnerReportedThreatState 
                                    }
                                    
                                    # Dates
                                    EnrolledDateTime = $device.enrolledDateTime
                                    LastSyncDateTime = $device.lastSyncDateTime
                                    
                                    # Azure AD integration
                                    AzureADDeviceId = $device.azureADDeviceId
                                    AzureADRegistered = $device.azureADRegistered
                                    
                                    # Storage information
                                    TotalStorageSpaceInGB = if ($device.totalStorageSpaceInBytes -or $additionalDetails.totalStorageSpaceInBytes) { 
                                        $bytes = if ($additionalDetails.totalStorageSpaceInBytes) { $additionalDetails.totalStorageSpaceInBytes } else { $device.totalStorageSpaceInBytes }
                                        [math]::Round($bytes / 1GB, 2) 
                                    } else { $null }
                                    FreeStorageSpaceInGB = if ($device.freeStorageSpaceInBytes -or $additionalDetails.freeStorageSpaceInBytes) { 
                                        $bytes = if ($additionalDetails.freeStorageSpaceInBytes) { $additionalDetails.freeStorageSpaceInBytes } else { $device.freeStorageSpaceInBytes }
                                        [math]::Round($bytes / 1GB, 2) 
                                    } else { $null }
                                    
                                    # Exchange status
                                    ExchangeAccessState = if ($additionalDetails.exchangeAccessState) { 
                                        $additionalDetails.exchangeAccessState 
                                    } else { 
                                        $device.exchangeAccessState 
                                    }
                                    ExchangeAccessStateReason = if ($additionalDetails.exchangeAccessStateReason) { 
                                        $additionalDetails.exchangeAccessStateReason 
                                    } else { 
                                        $device.exchangeAccessStateReason 
                                    }
                                    EASActivated = $device.easActivated
                                    EASDeviceId = if ($additionalDetails.easDeviceId) { $additionalDetails.easDeviceId } else { $device.easDeviceId }
                                    
                                    # Category
                                    DeviceCategory = if ($additionalDetails.deviceCategoryDisplayName) { 
                                        $additionalDetails.deviceCategoryDisplayName 
                                    } else { 
                                        $device.deviceCategoryDisplayName 
                                    }
                                    
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
                    Write-IntuneLog -Level "ERROR" -Message "Error fetching devices: $($_.Exception.Message)" -Context $Context
                    $uri = $null
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
                
                # Try v1.0 first
                $configUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations?`$top=999"
                $configCount = 0
                
                # Test endpoint availability
                try {
                    $testResponse = Invoke-MgGraphRequest -Uri $configUri -Method GET -ErrorAction Stop
                    if (-not $testResponse) {
                        $configUri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations?`$top=999"
                    }
                } catch {
                    $configUri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations?`$top=999"
                }
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $configUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($config in $response.value) {
                                $configCount++
                                
                                $configObj = [PSCustomObject]@{
                                    ConfigurationId = $config.id
                                    DisplayName = $config.displayName
                                    Description = $config.description
                                    CreatedDateTime = $config.createdDateTime
                                    LastModifiedDateTime = $config.lastModifiedDateTime
                                    Version = $config.version
                                    ConfigurationType = $config.'@odata.type' -replace '#microsoft.graph.', ''
                                    RoleScopeTagIds = if ($config.roleScopeTagIds) { ($config.roleScopeTagIds -join ';') } else { $null }
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
                
                $complianceUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies?`$top=999"
                $complianceCount = 0
                
                # Test endpoint
                try {
                    $testResponse = Invoke-MgGraphRequest -Uri $complianceUri -Method GET -ErrorAction Stop
                    if (-not $testResponse) {
                        $complianceUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies?`$top=999"
                    }
                } catch {
                    $complianceUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies?`$top=999"
                }
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $complianceUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($policy in $response.value) {
                                $complianceCount++
                                
                                $policyObj = [PSCustomObject]@{
                                    PolicyId = $policy.id
                                    DisplayName = $policy.displayName
                                    Description = $policy.description
                                    CreatedDateTime = $policy.createdDateTime
                                    LastModifiedDateTime = $policy.lastModifiedDateTime
                                    Version = $policy.version
                                    Platform = $policy.'@odata.type' -replace '#microsoft.graph.', '' -replace 'CompliancePolicy', ''
                                    RoleScopeTagIds = if ($policy.roleScopeTagIds) { ($policy.roleScopeTagIds -join ';') } else { $null }
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
        
        # Discover App Protection Policies
        if ($includeAppProtectionPolicies) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering app protection policies..." -Context $Context
                
                # iOS App Protection Policies
                try {
                    $iosAppPolicyUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/iosManagedAppProtections?`$top=999"
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
                    $androidAppPolicyUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/androidManagedAppProtections?`$top=999"
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
                                _ObjectType = 'AppProtectionPolicy'
                            }
                            
                            $null = $allDiscoveredData.Add($policyObj)
                        }
                        Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) Android app protection policies" -Context $Context
                    }
                } catch {
                    Write-IntuneLog -Level "DEBUG" -Message "Could not get Android app protection policies: $_" -Context $Context
                }
                
                # Windows Information Protection Policies
                try {
                    $wipPolicyUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/windowsInformationProtectionPolicies?`$top=999"
                    $response = Invoke-MgGraphRequest -Uri $wipPolicyUri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($policy in $response.value) {
                            $policyObj = [PSCustomObject]@{
                                PolicyId = $policy.id
                                DisplayName = $policy.displayName
                                Description = $policy.description
                                CreatedDateTime = $policy.createdDateTime
                                LastModifiedDateTime = $policy.lastModifiedDateTime
                                Platform = "Windows"
                                PolicyType = "InformationProtection"
                                _ObjectType = 'AppProtectionPolicy'
                            }
                            
                            $null = $allDiscoveredData.Add($policyObj)
                        }
                        Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) Windows Information Protection policies" -Context $Context
                    }
                } catch {
                    Write-IntuneLog -Level "DEBUG" -Message "Could not get Windows Information Protection policies: $_" -Context $Context
                }
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover app protection policies: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover app protection policies: $($_.Exception.Message)", @{Operation = "GetAppProtectionPolicies"})
            }
        }
        
        # Discover Managed Apps
        if ($includeManagedApps) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering managed applications..." -Context $Context
                
                $mobileAppsUri = "https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps?`$top=999"
                $appCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $mobileAppsUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($app in $response.value) {
                                $appCount++
                                
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
        
        # Discover Autopilot Devices
        if ($includeAutopilotDevices) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering Windows Autopilot devices..." -Context $Context
                
                $autopilotUri = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeviceIdentities?`$top=999"
                $autopilotCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $autopilotUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($apDevice in $response.value) {
                                $autopilotCount++
                                
                                $apObj = [PSCustomObject]@{
                                    AutopilotDeviceId = $apDevice.id
                                    SerialNumber = $apDevice.serialNumber
                                    Model = $apDevice.model
                                    Manufacturer = $apDevice.manufacturer
                                    AzureActiveDirectoryDeviceId = $apDevice.azureActiveDirectoryDeviceId
                                    ManagedDeviceId = $apDevice.managedDeviceId
                                    DisplayName = $apDevice.displayName
                                    GroupTag = $apDevice.groupTag
                                    PurchaseOrderIdentifier = $apDevice.purchaseOrderIdentifier
                                    EnrollmentState = if ($apDevice.enrollmentState) { $apDevice.enrollmentState.enrollmentState } else { $null }
                                    LastContactedDateTime = $apDevice.lastContactedDateTime
                                    AddressableUserName = $apDevice.addressableUserName
                                    UserPrincipalName = $apDevice.userPrincipalName
                                    ResourceName = $apDevice.resourceName
                                    SkuNumber = $apDevice.skuNumber
                                    SystemFamily = $apDevice.systemFamily
                                    _ObjectType = 'AutopilotDevice'
                                }
                                
                                $null = $allDiscoveredData.Add($apObj)
                            }
                        }
                        
                        $autopilotUri = $response.'@odata.nextLink'
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching Autopilot devices: $($_.Exception.Message)" -Context $Context
                        $autopilotUri = $null
                    }
                } while ($autopilotUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $autopilotCount Autopilot devices" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover Autopilot devices: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover Autopilot devices: $($_.Exception.Message)", @{Operation = "GetAutopilotDevices"})
            }
        }
        
        # Discover Group Policy Configurations (Administrative Templates)
        if ($includeGroupPolicyConfigurations) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering group policy configurations..." -Context $Context
                
                $gpConfigUri = "https://graph.microsoft.com/beta/deviceManagement/groupPolicyConfigurations?`$top=999"
                $gpCount = 0
                
                do {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $gpConfigUri -Method GET -ErrorAction Stop
                        
                        if ($response -and $response.value) {
                            foreach ($gp in $response.value) {
                                $gpCount++
                                
                                $gpObj = [PSCustomObject]@{
                                    ConfigurationId = $gp.id
                                    DisplayName = $gp.displayName
                                    Description = $gp.description
                                    CreatedDateTime = $gp.createdDateTime
                                    LastModifiedDateTime = $gp.lastModifiedDateTime
                                    RoleScopeTagIds = if ($gp.roleScopeTagIds) { ($gp.roleScopeTagIds -join ';') } else { $null }
                                    _ObjectType = 'GroupPolicyConfiguration'
                                }
                                
                                $null = $allDiscoveredData.Add($gpObj)
                            }
                        }
                        
                        $gpConfigUri = $response.'@odata.nextLink'
                    } catch {
                        Write-IntuneLog -Level "ERROR" -Message "Error fetching group policy configurations: $($_.Exception.Message)" -Context $Context
                        $gpConfigUri = $null
                    }
                } while ($gpConfigUri)
                
                if ($gpCount -gt 0) {
                    Write-IntuneLog -Level "SUCCESS" -Message "Discovered $gpCount group policy configurations" -Context $Context
                }
                
            } catch {
                Write-IntuneLog -Level "DEBUG" -Message "Could not discover group policy configurations: $($_.Exception.Message)" -Context $Context
            }
        }
        
        # Discover Device Categories (to understand device organization)
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering device categories..." -Context $Context
            
            $categoryUri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCategories"
            
            try {
                $response = Invoke-MgGraphRequest -Uri $categoryUri -Method GET -ErrorAction Stop
            } catch {
                # Try beta if v1.0 fails
                $categoryUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCategories"
                $response = Invoke-MgGraphRequest -Uri $categoryUri -Method GET -ErrorAction Stop
            }
            
            if ($response -and $response.value) {
                foreach ($category in $response.value) {
                    $categoryObj = [PSCustomObject]@{
                        CategoryId = $category.id
                        DisplayName = $category.displayName
                        Description = $category.description
                        _ObjectType = 'DeviceCategory'
                    }
                    
                    $null = $allDiscoveredData.Add($categoryObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) device categories" -Context $Context
            }
            
        } catch {
            Write-IntuneLog -Level "DEBUG" -Message "Could not discover device categories: $($_.Exception.Message)" -Context $Context
        }
        
        # Discover Role Definitions (to understand RBAC)
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune role definitions..." -Context $Context
            
            $roleUri = "https://graph.microsoft.com/v1.0/deviceManagement/roleDefinitions"
            
            try {
                $response = Invoke-MgGraphRequest -Uri $roleUri -Method GET -ErrorAction Stop
            } catch {
                # Try beta if v1.0 fails
                $roleUri = "https://graph.microsoft.com/beta/deviceManagement/roleDefinitions"
                $response = Invoke-MgGraphRequest -Uri $roleUri -Method GET -ErrorAction Stop
            }
            
            if ($response -and $response.value) {
                foreach ($role in $response.value) {
                    $roleObj = [PSCustomObject]@{
                        RoleId = $role.id
                        DisplayName = $role.displayName
                        Description = $role.description
                        IsBuiltIn = $role.isBuiltIn
                        RolePermissions = if ($role.rolePermissions) { 
                            ($role.rolePermissions | ForEach-Object { $_.resourceActions.allowedResourceActions }) -join ';' 
                        } else { $null }
                        _ObjectType = 'IntuneRole'
                    }
                    
                    $null = $allDiscoveredData.Add($roleObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) role definitions" -Context $Context
            }
            
        } catch {
            Write-IntuneLog -Level "DEBUG" -Message "Could not discover role definitions: $($_.Exception.Message)" -Context $Context
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

# Helper function
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

# Export module function
Export-ModuleMember -Function Invoke-IntuneDiscovery