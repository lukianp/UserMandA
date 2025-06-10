# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Intune
# Description: Discovers Intune managed devices, configurations, policies, apps, and user associations
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add this for debugging:
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "IntuneDiscovery"

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

# --- Main Discovery Function ---

function Invoke-IntuneDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-IntuneLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Intune')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'Intune'; RecordCount = 0;
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
        Write-IntuneLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-IntuneLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        $collectDeviceSoftware = $false
        $includeDeviceEnrollmentProfiles = $true
        $includeProtectionPolicies = $true
        $includeAutopilotDevices = $true
        $includeWindowsUpdatePolicies = $true
        $includeGroupAssignments = $true
        $includeDeviceCategories = $true
        $maxDevicesForSoftware = 100  # Limit for performance
        
        if ($Configuration.discovery -and $Configuration.discovery.intune) {
            $intuneConfig = $Configuration.discovery.intune
            if ($null -ne $intuneConfig.collectDeviceSoftware) { $collectDeviceSoftware = $intuneConfig.collectDeviceSoftware }
            if ($null -ne $intuneConfig.includeDeviceEnrollmentProfiles) { $includeDeviceEnrollmentProfiles = $intuneConfig.includeDeviceEnrollmentProfiles }
            if ($null -ne $intuneConfig.includeProtectionPolicies) { $includeProtectionPolicies = $intuneConfig.includeProtectionPolicies }
            if ($null -ne $intuneConfig.includeAutopilotDevices) { $includeAutopilotDevices = $intuneConfig.includeAutopilotDevices }
            if ($null -ne $intuneConfig.includeWindowsUpdatePolicies) { $includeWindowsUpdatePolicies = $intuneConfig.includeWindowsUpdatePolicies }
            if ($null -ne $intuneConfig.includeGroupAssignments) { $includeGroupAssignments = $intuneConfig.includeGroupAssignments }
            if ($null -ne $intuneConfig.includeDeviceCategories) { $includeDeviceCategories = $intuneConfig.includeDeviceCategories }
            if ($null -ne $intuneConfig.maxDevicesForSoftware) { $maxDevicesForSoftware = $intuneConfig.maxDevicesForSoftware }
        }
        
        Write-IntuneLog -Level "DEBUG" -Message "Configuration loaded:" -Context $Context
        Write-IntuneLog -Level "DEBUG" -Message "  - Collect Device Software: $collectDeviceSoftware" -Context $Context
        Write-IntuneLog -Level "DEBUG" -Message "  - Include Enrollment Profiles: $includeDeviceEnrollmentProfiles" -Context $Context
        Write-IntuneLog -Level "DEBUG" -Message "  - Include Protection Policies: $includeProtectionPolicies" -Context $Context
        Write-IntuneLog -Level "DEBUG" -Message "  - Include Autopilot Devices: $includeAutopilotDevices" -Context $Context

        # 4. AUTHENTICATE & CONNECT
        Write-IntuneLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-IntuneLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-IntuneLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-IntuneLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $secureSecret `
                            -NoWelcome -ErrorAction Stop
            Write-IntuneLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-IntuneLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Managed Devices (Enhanced)
        $managedDevices = @()
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune managed devices..." -Context $Context
            
            $totalDevices = 0
            $nextLink = $null
            
            # Enhanced select fields for more comprehensive data
            $selectFields = @(
                'id', 'userId', 'deviceName', 'managedDeviceOwnerType', 'enrolledDateTime',
                'lastSyncDateTime', 'operatingSystem', 'complianceState', 'jailBroken',
                'managementAgent', 'osVersion', 'easActivated', 'easDeviceId',
                'easActivationDateTime', 'azureADRegistered', 'deviceEnrollmentType',
                'activationLockBypassCode', 'emailAddress', 'azureADDeviceId',
                'deviceRegistrationState', 'deviceCategoryDisplayName', 'isSupervised',
                'exchangeLastSuccessfulSyncDateTime', 'exchangeAccessState',
                'exchangeAccessStateReason', 'remoteAssistanceSessionUrl',
                'remoteAssistanceSessionErrorDetails', 'isEncrypted', 'userPrincipalName',
                'model', 'manufacturer', 'imei', 'complianceGracePeriodExpirationDateTime',
                'serialNumber', 'phoneNumber', 'androidSecurityPatchLevel', 'userDisplayName',
                'configurationManagerClientEnabledFeatures', 'wiFiMacAddress',
                'deviceHealthAttestationState', 'subscriberCarrier', 'meid',
                'totalStorageSpaceInBytes', 'freeStorageSpaceInBytes', 'managedDeviceName',
                'partnerReportedThreatState', 'autopilotEnrolled', 'requireUserEnrollmentApproval',
                'managementCertificateExpirationDate', 'iccid', 'udid', 'roleScopeTagIds',
                'windowsActiveMalwareCount', 'windowsRemediatedMalwareCount',
                'notes', 'ethernetMacAddress', 'physicalMemoryInBytes', 'deviceType'
            )
            
            $selectParam = "`$select=" + ($selectFields -join ',')
            
            do {
                if ($nextLink) {
                    $response = Invoke-MgGraphRequest -Uri $nextLink -Method GET
                } else {
                    $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices?$selectParam&`$top=999"
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET
                }
                
                if ($response.value) {
                    foreach ($device in $response.value) {
                        $totalDevices++
                        
                        # Parse device health attestation state if present
                        $bootDebuggingEnabled = $null
                        $secureBootEnabled = $null
                        $codeIntegrityEnabled = $null
                        $testSigningEnabled = $null
                        
                        if ($device.deviceHealthAttestationState) {
                            $bootDebuggingEnabled = $device.deviceHealthAttestationState.bootDebugging
                            $secureBootEnabled = $device.deviceHealthAttestationState.secureBoot
                            $codeIntegrityEnabled = $device.deviceHealthAttestationState.codeIntegrity
                            $testSigningEnabled = $device.deviceHealthAttestationState.testSigning
                        }
                        
                        $deviceObj = [PSCustomObject]@{
                            # Core identification
                            DeviceId = $device.id
                            DeviceName = $device.deviceName
                            ManagedDeviceName = $device.managedDeviceName
                            SerialNumber = $device.serialNumber
                            
                            # User mapping fields
                            UserPrincipalName = $device.userPrincipalName
                            UserDisplayName = $device.userDisplayName
                            UserId = $device.userId
                            EmailAddress = $device.emailAddress
                            
                            # Device details
                            OperatingSystem = $device.operatingSystem
                            OSVersion = $device.osVersion
                            Model = $device.model
                            Manufacturer = $device.manufacturer
                            DeviceType = $device.deviceType
                            
                            # Network identifiers
                            IMEI = $device.imei
                            MEID = $device.meid
                            WiFiMacAddress = $device.wiFiMacAddress
                            EthernetMacAddress = $device.ethernetMacAddress
                            ICCID = $device.iccid
                            UDID = $device.udid
                            PhoneNumber = $device.phoneNumber
                            SubscriberCarrier = $device.subscriberCarrier
                            
                            # Management status
                            ManagementAgent = $device.managementAgent
                            ManagementState = $device.managementState
                            ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                            DeviceEnrollmentType = $device.deviceEnrollmentType
                            DeviceRegistrationState = $device.deviceRegistrationState
                            ManagementCertificateExpirationDate = $device.managementCertificateExpirationDate
                            
                            # Compliance and security
                            ComplianceState = $device.complianceState
                            ComplianceGracePeriodExpirationDateTime = $device.complianceGracePeriodExpirationDateTime
                            IsCompliant = $device.isCompliant
                            IsEncrypted = $device.isEncrypted
                            IsSupervised = $device.isSupervised
                            JailBroken = $device.jailBroken
                            AndroidSecurityPatchLevel = $device.androidSecurityPatchLevel
                            PartnerReportedThreatState = $device.partnerReportedThreatState
                            
                            # Windows security
                            WindowsActiveMalwareCount = $device.windowsActiveMalwareCount
                            WindowsRemediatedMalwareCount = $device.windowsRemediatedMalwareCount
                            BootDebuggingEnabled = $bootDebuggingEnabled
                            SecureBootEnabled = $secureBootEnabled
                            CodeIntegrityEnabled = $codeIntegrityEnabled
                            TestSigningEnabled = $testSigningEnabled
                            
                            # Dates
                            EnrolledDateTime = $device.enrolledDateTime
                            LastSyncDateTime = $device.lastSyncDateTime
                            EASActivationDateTime = $device.easActivationDateTime
                            ExchangeLastSuccessfulSyncDateTime = $device.exchangeLastSuccessfulSyncDateTime
                            
                            # Azure AD integration
                            AzureADDeviceId = $device.azureADDeviceId
                            AzureADRegistered = $device.azureADRegistered
                            AutopilotEnrolled = $device.autopilotEnrolled
                            RequireUserEnrollmentApproval = $device.requireUserEnrollmentApproval
                            
                            # Storage information
                            TotalStorageSpaceInGB = if ($device.totalStorageSpaceInBytes) { 
                                [math]::Round($device.totalStorageSpaceInBytes / 1GB, 2) 
                            } else { $null }
                            FreeStorageSpaceInGB = if ($device.freeStorageSpaceInBytes) { 
                                [math]::Round($device.freeStorageSpaceInBytes / 1GB, 2) 
                            } else { $null }
                            PhysicalMemoryInGB = if ($device.physicalMemoryInBytes) { 
                                [math]::Round($device.physicalMemoryInBytes / 1GB, 2) 
                            } else { $null }
                            
                            # Exchange status
                            ExchangeAccessState = $device.exchangeAccessState
                            ExchangeAccessStateReason = $device.exchangeAccessStateReason
                            EASActivated = $device.easActivated
                            EASDeviceId = $device.easDeviceId
                            
                            # Category and tags
                            DeviceCategory = $device.deviceCategoryDisplayName
                            RoleScopeTagIds = ($device.roleScopeTagIds -join ';')
                            
                            # Additional info
                            Notes = $device.notes
                            RemoteAssistanceSessionUrl = $device.remoteAssistanceSessionUrl
                            RemoteAssistanceSessionErrorDetails = $device.remoteAssistanceSessionErrorDetails
                            ActivationLockBypassCode = $device.activationLockBypassCode
                            
                            _ObjectType = 'ManagedDevice'
                        }
                        
                        $managedDevices += $deviceObj
                        $null = $allDiscoveredData.Add($deviceObj)
                        
                        # Report progress
                        if ($totalDevices % 100 -eq 0) {
                            Write-IntuneLog -Level "DEBUG" -Message "Processed $totalDevices devices so far..." -Context $Context
                            Write-Progress -Activity "Discovering Intune Devices" -Status "$totalDevices devices" -PercentComplete (($totalDevices / 10000) * 100)
                        }
                    }
                }
                
                $nextLink = $response.'@odata.nextLink'
                
            } while ($nextLink)
            
            Write-Progress -Activity "Discovering Intune Devices" -Completed
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalDevices Intune managed devices" -Context $Context
            $result.Metadata["ManagedDeviceCount"] = $totalDevices
            
        } catch {
            $result.AddWarning("Failed to discover managed devices: $($_.Exception.Message)", @{Operation = "GetManagedDevices"})
        }
        
        # Discover Device Configurations (Enhanced)
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering device configurations..." -Context $Context
            
            $configTypes = @(
                @{Uri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations"; Type = "DeviceConfiguration"},
                @{Uri = "https://graph.microsoft.com/beta/deviceManagement/deviceManagementScripts"; Type = "PowerShellScript"},
                @{Uri = "https://graph.microsoft.com/beta/deviceManagement/configurationPolicies"; Type = "SettingsCatalog"}
            )
            
            $totalConfigs = 0
            
            foreach ($configType in $configTypes) {
                try {
                    $response = Invoke-MgGraphRequest -Uri $configType.Uri -Method GET
                    
                    if ($response.value) {
                        foreach ($config in $response.value) {
                            $totalConfigs++
                            
                            $configObj = [PSCustomObject]@{
                                ConfigurationId = $config.id
                                DisplayName = $config.displayName
                                Description = $config.description
                                ConfigurationType = $configType.Type
                                Platform = if ($config.'@odata.type') { $config.'@odata.type' -replace '#microsoft.graph.', '' } else { $null }
                                Version = $config.version
                                CreatedDateTime = $config.createdDateTime
                                LastModifiedDateTime = $config.lastModifiedDateTime
                                RoleScopeTagIds = if ($config.roleScopeTagIds) { ($config.roleScopeTagIds -join ';') } else { $null }
                                # Script-specific properties
                                ScriptContent = if ($config.scriptContent -and $configType.Type -eq 'PowerShellScript') { 
                                    "Script present ($(([System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($config.scriptContent))).Length) chars)" 
                                } else { $null }
                                RunAsAccount = if ($config.runAsAccount) { $config.runAsAccount } else { $null }
                                EnforceSignatureCheck = if ($null -ne $config.enforceSignatureCheck) { $config.enforceSignatureCheck } else { $null }
                                FileName = if ($config.fileName) { $config.fileName } else { $null }
                                # Settings catalog specific
                                SettingCount = if ($config.settings) { $config.settings.Count } else { $null }
                                Technologies = if ($config.technologies) { ($config.technologies -join ';') } else { $null }
                                _ObjectType = 'DeviceConfiguration'
                            }
                            
                            $null = $allDiscoveredData.Add($configObj)
                            
                            # Get assignments if enabled
                            if ($includeGroupAssignments) {
                                try {
                                    $assignmentUri = "$($configType.Uri)/$($config.id)/assignments"
                                    $assignmentResponse = Invoke-MgGraphRequest -Uri $assignmentUri -Method GET -ErrorAction SilentlyContinue
                                    
                                    if ($assignmentResponse.value) {
                                        foreach ($assignment in $assignmentResponse.value) {
                                            $assignmentObj = [PSCustomObject]@{
                                                ConfigurationId = $config.id
                                                ConfigurationName = $config.displayName
                                                ConfigurationType = $configType.Type
                                                AssignmentId = $assignment.id
                                                TargetType = if ($assignment.target.'@odata.type') { 
                                                    $assignment.target.'@odata.type' -replace '#microsoft.graph.', '' 
                                                } else { $null }
                                                TargetGroupId = if ($assignment.target.groupId) { $assignment.target.groupId } else { $null }
                                                FilterId = if ($assignment.target.deviceAndAppManagementAssignmentFilterId) { 
                                                    $assignment.target.deviceAndAppManagementAssignmentFilterId 
                                                } else { $null }
                                                FilterType = if ($assignment.target.deviceAndAppManagementAssignmentFilterType) { 
                                                    $assignment.target.deviceAndAppManagementAssignmentFilterType 
                                                } else { $null }
                                                _ObjectType = 'ConfigurationAssignment'
                                            }
                                            
                                            $null = $allDiscoveredData.Add($assignmentObj)
                                        }
                                    }
                                } catch {
                                    Write-IntuneLog -Level "DEBUG" -Message "Could not get assignments for config $($config.displayName): $_" -Context $Context
                                }
                            }
                        }
                    }
                } catch {
                    Write-IntuneLog -Level "DEBUG" -Message "Could not get configurations from $($configType.Uri): $_" -Context $Context
                }
            }
            
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalConfigs device configurations" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover device configurations: $($_.Exception.Message)", @{Operation = "GetDeviceConfigurations"})
        }
        
        # Discover Compliance Policies (Enhanced)
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering compliance policies..." -Context $Context
            
            $uri = "https://graph.microsoft.com/beta/deviceManagement/deviceCompliancePolicies"
            $response = Invoke-MgGraphRequest -Uri $uri -Method GET
            
            if ($response.value) {
                foreach ($policy in $response.value) {
                    $policyObj = [PSCustomObject]@{
                        PolicyId = $policy.id
                        DisplayName = $policy.displayName
                        Description = $policy.description
                        Version = $policy.version
                        Platform = $policy.'@odata.type' -replace '#microsoft.graph.', ''
                        CreatedDateTime = $policy.createdDateTime
                        LastModifiedDateTime = $policy.lastModifiedDateTime
                        RoleScopeTagIds = if ($policy.roleScopeTagIds) { ($policy.roleScopeTagIds -join ';') } else { $null }
                        # Platform-specific settings counts
                        PasswordRequired = if ($null -ne $policy.passwordRequired) { $policy.passwordRequired } else { $null }
                        PasswordMinimumLength = if ($policy.passwordMinimumLength) { $policy.passwordMinimumLength } else { $null }
                        PasswordRequiredType = if ($policy.passwordRequiredType) { $policy.passwordRequiredType } else { $null }
                        RequireHealthyDeviceReport = if ($null -ne $policy.requireHealthyDeviceReport) { $policy.requireHealthyDeviceReport } else { $null }
                        OsMinimumVersion = if ($policy.osMinimumVersion) { $policy.osMinimumVersion } else { $null }
                        OsMaximumVersion = if ($policy.osMaximumVersion) { $policy.osMaximumVersion } else { $null }
                        MobileOsMinimumVersion = if ($policy.mobileOsMinimumVersion) { $policy.mobileOsMinimumVersion } else { $null }
                        MobileOsMaximumVersion = if ($policy.mobileOsMaximumVersion) { $policy.mobileOsMaximumVersion } else { $null }
                        _ObjectType = 'CompliancePolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) compliance policies" -Context $Context
            }
            
        } catch {
            $result.AddWarning("Failed to discover compliance policies: $($_.Exception.Message)", @{Operation = "GetCompliancePolicies"})
        }
        
        # Discover Protection Policies (if enabled)
        if ($includeProtectionPolicies) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering app protection policies..." -Context $Context
                
                $protectionTypes = @(
                    @{Uri = "https://graph.microsoft.com/beta/deviceAppManagement/iosManagedAppProtections"; Platform = "iOS"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceAppManagement/androidManagedAppProtections"; Platform = "Android"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceAppManagement/windowsInformationProtectionPolicies"; Platform = "Windows"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceAppManagement/mdmWindowsInformationProtectionPolicies"; Platform = "WindowsMDM"}
                )
                
                $totalProtectionPolicies = 0
                
                foreach ($protType in $protectionTypes) {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $protType.Uri -Method GET -ErrorAction SilentlyContinue
                        
                        if ($response.value) {
                            foreach ($policy in $response.value) {
                                $totalProtectionPolicies++
                                
                                $protectionObj = [PSCustomObject]@{
                                    PolicyId = $policy.id
                                    DisplayName = $policy.displayName
                                    Description = $policy.description
                                    Platform = $protType.Platform
                                    CreatedDateTime = $policy.createdDateTime
                                    LastModifiedDateTime = $policy.lastModifiedDateTime
                                    Version = $policy.version
                                    # Protection settings
                                    PinRequired = if ($null -ne $policy.pinRequired) { $policy.pinRequired } else { $null }
                                    DisableAppPinIfDevicePinIsSet = if ($null -ne $policy.disableAppPinIfDevicePinIsSet) { 
                                        $policy.disableAppPinIfDevicePinIsSet 
                                    } else { $null }
                                    MinimumPinLength = if ($policy.minimumPinLength) { $policy.minimumPinLength } else { $null }
                                    BlockDataIngestionIntoOrganizationDocuments = if ($null -ne $policy.blockDataIngestionIntoOrganizationDocuments) { 
                                        $policy.blockDataIngestionIntoOrganizationDocuments 
                                    } else { $null }
                                    AllowedDataStorageLocations = if ($policy.allowedDataStorageLocations) { 
                                        ($policy.allowedDataStorageLocations -join ';') 
                                    } else { $null }
                                    ContactSyncBlocked = if ($null -ne $policy.contactSyncBlocked) { $policy.contactSyncBlocked } else { $null }
                                    PrintBlocked = if ($null -ne $policy.printBlocked) { $policy.printBlocked } else { $null }
                                    FingerprintBlocked = if ($null -ne $policy.fingerprintBlocked) { $policy.fingerprintBlocked } else { $null }
                                    FaceIdBlocked = if ($null -ne $policy.faceIdBlocked) { $policy.faceIdBlocked } else { $null }
                                    _ObjectType = 'AppProtectionPolicy'
                                }
                                
                                $null = $allDiscoveredData.Add($protectionObj)
                            }
                        }
                    } catch {
                        Write-IntuneLog -Level "DEBUG" -Message "Could not get protection policies from $($protType.Uri): $_" -Context $Context
                    }
                }
                
                if ($totalProtectionPolicies -gt 0) {
                    Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalProtectionPolicies app protection policies" -Context $Context
                }
                
            } catch {
                $result.AddWarning("Failed to discover protection policies: $($_.Exception.Message)", @{Operation = "GetProtectionPolicies"})
            }
        }
        
        # Discover Mobile Apps (Enhanced)
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering mobile apps..." -Context $Context
            
            $uri = "https://graph.microsoft.com/beta/deviceAppManagement/mobileApps?`$expand=categories,assignments"
            $response = Invoke-MgGraphRequest -Uri $uri -Method GET
            
            if ($response.value) {
                foreach ($app in $response.value) {
                    $appObj = [PSCustomObject]@{
                        AppId = $app.id
                        DisplayName = $app.displayName
                        Description = $app.description
                        Publisher = $app.publisher
                        AppType = $app.'@odata.type' -replace '#microsoft.graph.', ''
                        CreatedDateTime = $app.createdDateTime
                        LastModifiedDateTime = $app.lastModifiedDateTime
                        IsFeatured = $app.isFeatured
                        PrivacyInformationUrl = $app.privacyInformationUrl
                        InformationUrl = $app.informationUrl
                        Owner = $app.owner
                        Developer = $app.developer
                        Notes = $app.notes
                        PublishingState = $app.publishingState
                        # App-specific properties
                        AppVersion = if ($app.version) { $app.version } else { $null }
                        FileName = if ($app.fileName) { $app.fileName } else { $null }
                        Size = if ($app.size) { [math]::Round($app.size / 1MB, 2) } else { $null }
                        MinimumSupportedOperatingSystem = if ($app.minimumSupportedOperatingSystem) { 
                            $app.minimumSupportedOperatingSystem | ConvertTo-Json -Compress 
                        } else { $null }
                        BundleId = if ($app.bundleId) { $app.bundleId } else { $null }
                        AppStoreUrl = if ($app.appStoreUrl) { $app.appStoreUrl } else { $null }
                        PackageId = if ($app.packageId) { $app.packageId } else { $null }
                        Categories = if ($app.categories) { ($app.categories.displayName -join ';') } else { $null }
                        LargeIcon = if ($app.largeIcon -and $app.largeIcon.value) { "Icon present" } else { "No icon" }
                        # Installation stats
                        InstallSummary = if ($app.installSummary) {
                            "Installed: $($app.installSummary.installedDeviceCount), Failed: $($app.installSummary.failedDeviceCount)"
                        } else { $null }
                        _ObjectType = 'MobileApp'
                    }
                    
                    $null = $allDiscoveredData.Add($appObj)
                    
                    # Add assignment information
                    if ($app.assignments -and $includeGroupAssignments) {
                        foreach ($assignment in $app.assignments) {
                            $appAssignmentObj = [PSCustomObject]@{
                                AppId = $app.id
                                AppDisplayName = $app.displayName
                                AssignmentId = $assignment.id
                                Intent = $assignment.intent
                                TargetType = if ($assignment.target.'@odata.type') { 
                                    $assignment.target.'@odata.type' -replace '#microsoft.graph.', '' 
                                } else { $null }
                                TargetGroupId = if ($assignment.target.groupId) { $assignment.target.groupId } else { $null }
                                _ObjectType = 'AppAssignment'
                            }
                            
                            $null = $allDiscoveredData.Add($appAssignmentObj)
                        }
                    }
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) mobile apps" -Context $Context
            }
            
        } catch {
            $result.AddWarning("Failed to discover mobile apps: $($_.Exception.Message)", @{Operation = "GetMobileApps"})
        }
        
        # Discover Enrollment Profiles (if enabled)
        if ($includeDeviceEnrollmentProfiles) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device enrollment profiles..." -Context $Context
                
                $enrollmentTypes = @(
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/depOnboardingSettings"; Type = "AppleDepEnrollment"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeploymentProfiles"; Type = "WindowsAutopilot"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/deviceEnrollmentConfigurations"; Type = "EnrollmentConfiguration"}
                )
                
                $totalEnrollmentProfiles = 0
                
                foreach ($enrollType in $enrollmentTypes) {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $enrollType.Uri -Method GET -ErrorAction SilentlyContinue
                        
                        if ($response.value) {
                            foreach ($profile in $response.value) {
                                $totalEnrollmentProfiles++
                                
                                $enrollmentObj = [PSCustomObject]@{
                                    ProfileId = $profile.id
                                    DisplayName = $profile.displayName
                                    Description = $profile.description
                                    ProfileType = $enrollType.Type
                                    CreatedDateTime = $profile.createdDateTime
                                    LastModifiedDateTime = $profile.lastModifiedDateTime
                                    # Type-specific properties
                                    TokenName = if ($profile.tokenName) { $profile.tokenName } else { $null }
                                    TokenExpirationDateTime = if ($profile.tokenExpirationDateTime) { $profile.tokenExpirationDateTime } else { $null }
                                    AppleId = if ($profile.appleId) { $profile.appleId } else { $null }
                                    OutOfBoxExperienceSettings = if ($profile.outOfBoxExperienceSettings) { 
                                        $profile.outOfBoxExperienceSettings | ConvertTo-Json -Compress 
                                    } else { $null }
                                    EnrollmentMode = if ($profile.enrollmentMode) { $profile.enrollmentMode } else { $null }
                                    _ObjectType = 'EnrollmentProfile'
                                }
                                
                                $null = $allDiscoveredData.Add($enrollmentObj)
                            }
                        }
                    } catch {
                        Write-IntuneLog -Level "DEBUG" -Message "Could not get enrollment profiles from $($enrollType.Uri): $_" -Context $Context
                    }
                }
                
                if ($totalEnrollmentProfiles -gt 0) {
                    Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalEnrollmentProfiles enrollment profiles" -Context $Context
                }
                
            } catch {
                $result.AddWarning("Failed to discover enrollment profiles: $($_.Exception.Message)", @{Operation = "GetEnrollmentProfiles"})
            }
        }
        
        # Discover Autopilot Devices (if enabled)
        if ($includeAutopilotDevices) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering Windows Autopilot devices..." -Context $Context
                
                $uri = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeviceIdentities"
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction SilentlyContinue
                
                if ($response.value) {
                    foreach ($apDevice in $response.value) {
                        $autopilotObj = [PSCustomObject]@{
                            AutopilotDeviceId = $apDevice.id
                            SerialNumber = $apDevice.serialNumber
                            Model = $apDevice.model
                            Manufacturer = $apDevice.manufacturer
                            ProductKey = $apDevice.productKey
                            PurchaseOrderIdentifier = $apDevice.purchaseOrderIdentifier
                            ResourceName = $apDevice.resourceName
                            SkuNumber = $apDevice.skuNumber
                            SystemFamily = $apDevice.systemFamily
                            AzureActiveDirectoryDeviceId = $apDevice.azureActiveDirectoryDeviceId
                            ManagedDeviceId = $apDevice.managedDeviceId
                            DisplayName = $apDevice.displayName
                            GroupTag = $apDevice.groupTag
                            EnrollmentState = $apDevice.enrollmentState
                            LastContactedDateTime = $apDevice.lastContactedDateTime
                            AddressableUserName = $apDevice.addressableUserName
                            UserPrincipalName = $apDevice.userPrincipalName
                            DeploymentProfileAssignmentStatus = $apDevice.deploymentProfileAssignmentStatus
                            DeploymentProfileAssignedDateTime = $apDevice.deploymentProfileAssignedDateTime
                            _ObjectType = 'AutopilotDevice'
                        }
                        
                        $null = $allDiscoveredData.Add($autopilotObj)
                    }
                    
                    Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) Autopilot devices" -Context $Context
                }
                
            } catch {
                Write-IntuneLog -Level "DEBUG" -Message "Could not get Autopilot devices: $_" -Context $Context
            }
        }
        
        # Discover Device Categories (if enabled)
        if ($includeDeviceCategories) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device categories..." -Context $Context
                
                $uri = "https://graph.microsoft.com/beta/deviceManagement/deviceCategories"
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction SilentlyContinue
                
                if ($response.value) {
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
                Write-IntuneLog -Level "DEBUG" -Message "Could not get device categories: $_" -Context $Context
            }
        }
        
        # Discover Windows Update Policies (if enabled)
        if ($includeWindowsUpdatePolicies) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering Windows update policies..." -Context $Context
                
                $updateTypes = @(
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/deviceConfigurations?\$filter=isof('microsoft.graph.windowsUpdateForBusinessConfiguration')"; Type = "UpdateForBusiness"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/windowsFeatureUpdateProfiles"; Type = "FeatureUpdateProfile"},
                    @{Uri = "https://graph.microsoft.com/beta/deviceManagement/windowsQualityUpdateProfiles"; Type = "QualityUpdateProfile"}
                )
                
                $totalUpdatePolicies = 0
                
                foreach ($updateType in $updateTypes) {
                    try {
                        $response = Invoke-MgGraphRequest -Uri $updateType.Uri -Method GET -ErrorAction SilentlyContinue
                        
                        if ($response.value) {
                            foreach ($policy in $response.value) {
                                $totalUpdatePolicies++
                                
                                $updateObj = [PSCustomObject]@{
                                    PolicyId = $policy.id
                                    DisplayName = $policy.displayName
                                    Description = $policy.description
                                    PolicyType = $updateType.Type
                                    CreatedDateTime = $policy.createdDateTime
                                    LastModifiedDateTime = $policy.lastModifiedDateTime
                                    # Update-specific settings
                                    FeatureUpdateVersion = if ($policy.featureUpdateVersion) { $policy.featureUpdateVersion } else { $null }
                                    QualityUpdateClassification = if ($policy.qualityUpdateClassification) { $policy.qualityUpdateClassification } else { $null }
                                    DeliveryOptimizationMode = if ($policy.deliveryOptimizationMode) { $policy.deliveryOptimizationMode } else { $null }
                                    AutomaticUpdateMode = if ($policy.automaticUpdateMode) { $policy.automaticUpdateMode } else { $null }
                                    BusinessReadyUpdatesOnly = if ($null -ne $policy.businessReadyUpdatesOnly) { $policy.businessReadyUpdatesOnly } else { $null }
                                    _ObjectType = 'WindowsUpdatePolicy'
                                }
                                
                                $null = $allDiscoveredData.Add($updateObj)
                            }
                        }
                    } catch {
                        Write-IntuneLog -Level "DEBUG" -Message "Could not get update policies from $($updateType.Uri): $_" -Context $Context
                    }
                }
                
                if ($totalUpdatePolicies -gt 0) {
                    Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalUpdatePolicies Windows update policies" -Context $Context
                }
                
            } catch {
                $result.AddWarning("Failed to discover Windows update policies: $($_.Exception.Message)", @{Operation = "GetWindowsUpdatePolicies"})
            }
        }
        
        # Discover Device Software (if enabled)
        if ($collectDeviceSoftware -and $managedDevices.Count -gt 0) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device software..." -Context $Context
                
                # Limit devices for software discovery to prevent timeout
                $devicesForSoftware = $managedDevices | Select-Object -First $maxDevicesForSoftware
                Write-IntuneLog -Level "INFO" -Message "Collecting software for $($devicesForSoftware.Count) devices (limited from $($managedDevices.Count))" -Context $Context
                
                $softwareCount = 0
                $processedDevices = 0
                
                foreach ($device in $devicesForSoftware) {
                    $processedDevices++
                    
                    if ($processedDevices % 20 -eq 0) {
                        Write-IntuneLog -Level "DEBUG" -Message "Software discovery progress: $processedDevices/$($devicesForSoftware.Count) devices" -Context $Context
                        Write-Progress -Activity "Discovering Device Software" -Status "$processedDevices devices" -PercentComplete (($processedDevices / $devicesForSoftware.Count) * 100)
                    }
                    
                    try {
                        $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices/$($device.DeviceId)/detectedApps?`$top=100"
                        $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction SilentlyContinue
                        
                        if ($response.value) {
                            foreach ($app in $response.value) {
                                $softwareObj = [PSCustomObject]@{
                                    ManagedDeviceId = $device.DeviceId
                                    DeviceName = $device.DeviceName
                                    UserPrincipalName = $device.UserPrincipalName
                                    UserId = $device.UserId
                                    SoftwareId = $app.id
                                    SoftwareDisplayName = $app.displayName
                                    SoftwareVersion = $app.version
                                    Publisher = $app.publisher
                                    Platform = $device.OperatingSystem
                                    SizeInMB = if ($app.sizeInByte) { 
                                        [math]::Round($app.sizeInByte / 1MB, 2) 
                                    } else { $null }
                                    DetectedAppId = $app.id
                                    DeviceCount = $app.deviceCount
                                    _ObjectType = 'DeviceSoftware'
                                }
                                
                                $null = $allDiscoveredData.Add($softwareObj)
                                $softwareCount++
                            }
                        }
                        
                        # Small delay to avoid throttling
                        if ($processedDevices % 10 -eq 0) {
                            Start-Sleep -Milliseconds 250
                        }
                        
                    } catch {
                        Write-IntuneLog -Level "DEBUG" -Message "Could not get software for device $($device.DeviceName): $_" -Context $Context
                    }
                }
                
                Write-Progress -Activity "Discovering Device Software" -Completed
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $softwareCount software entries across $processedDevices devices" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover device software: $($_.Exception.Message)", @{Operation = "GetDeviceSoftware"})
            }
        }

        # 6. EXPORT DATA TO CSV
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
                    $obj
                }
                
                # Map object types to file names (MUST match orchestrator expectations)
                $fileName = switch ($objectType) {
                    'ManagedDevice' { 'IntuneManagedDevices.csv' }
                    'DeviceConfiguration' { 'IntuneDeviceConfigurations.csv' }
                    'CompliancePolicy' { 'IntuneCompliancePolicies.csv' }
                    'MobileApp' { 'IntuneManagedApps.csv' }
                    'DeviceSoftware' { 'IntuneDeviceSoftware.csv' }
                    'AppProtectionPolicy' { 'IntuneAppProtectionPolicies.csv' }
                    'EnrollmentProfile' { 'IntuneEnrollmentProfiles.csv' }
                    'AutopilotDevice' { 'IntuneAutopilotDevices.csv' }
                    'DeviceCategory' { 'IntuneDeviceCategories.csv' }
                    'WindowsUpdatePolicy' { 'IntuneWindowsUpdatePolicies.csv' }
                    'ConfigurationAssignment' { 'IntuneConfigurationAssignments.csv' }
                    'AppAssignment' { 'IntuneAppAssignments.csv' }
                    default { "Intune_$objectType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-IntuneLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-IntuneLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        
        # Add specific counts
        $dataGroups = $allDiscoveredData | Group-Object -Property _ObjectType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Top-level error handler
        Write-IntuneLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-IntuneLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        Write-IntuneLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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
Export-ModuleMember -Function Invoke-IntuneDiscovery