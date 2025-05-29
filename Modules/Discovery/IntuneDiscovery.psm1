<#
.SYNOPSIS
    Microsoft Intune discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune-managed devices, compliance policies, configuration profiles, and app deployments
#>

function Invoke-IntuneDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Microsoft Intune discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Graph connection (Intune uses Graph API)
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping Intune discovery." -Level "WARN"
            return @{}
        }
        
        # Verify Intune permissions
        $requiredScopes = @(
            "DeviceManagementManagedDevices.Read.All",
            "DeviceManagementConfiguration.Read.All",
            "DeviceManagementApps.Read.All"
        )
        
        $hasRequiredScopes = $true
        foreach ($scope in $requiredScopes) {
            if ($context.Scopes -notcontains $scope) {
                Write-MandALog "Missing required scope: $scope" -Level "WARN"
                $hasRequiredScopes = $false
            }
        }
        
        if (-not $hasRequiredScopes) {
            Write-MandALog "Insufficient permissions for Intune discovery. Some data may be unavailable." -Level "WARN"
        }
        
        # Managed Devices
        Write-MandALog "Discovering Intune managed devices..." -Level "INFO"
        $discoveryResults.ManagedDevices = Get-IntuneManagedDevices -OutputPath $rawPath -Configuration $Configuration
        
        # Device Compliance Policies
        Write-MandALog "Discovering device compliance policies..." -Level "INFO"
        $discoveryResults.CompliancePolicies = Get-IntuneCompliancePolicies -OutputPath $rawPath -Configuration $Configuration
        
        # Device Configuration Profiles
        Write-MandALog "Discovering device configuration profiles..." -Level "INFO"
        $discoveryResults.ConfigurationProfiles = Get-IntuneConfigurationProfiles -OutputPath $rawPath -Configuration $Configuration
        
        # Mobile Apps
        Write-MandALog "Discovering mobile apps..." -Level "INFO"
        $discoveryResults.MobileApps = Get-IntuneMobileApps -OutputPath $rawPath -Configuration $Configuration
        
        # App Protection Policies
        Write-MandALog "Discovering app protection policies..." -Level "INFO"
        $discoveryResults.AppProtectionPolicies = Get-IntuneAppProtectionPolicies -OutputPath $rawPath -Configuration $Configuration
        
        # Enrollment Restrictions
        Write-MandALog "Discovering enrollment restrictions..." -Level "INFO"
        $discoveryResults.EnrollmentRestrictions = Get-IntuneEnrollmentRestrictions -OutputPath $rawPath -Configuration $Configuration
        
        # Device Categories
        Write-MandALog "Discovering device categories..." -Level "INFO"
        $discoveryResults.DeviceCategories = Get-IntuneDeviceCategories -OutputPath $rawPath -Configuration $Configuration
        
        # Autopilot Devices
        Write-MandALog "Discovering Autopilot devices..." -Level "INFO"
        $discoveryResults.AutopilotDevices = Get-IntuneAutopilotDevices -OutputPath $rawPath -Configuration $Configuration
        
        Write-MandALog "Microsoft Intune discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Microsoft Intune discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-IntuneManagedDevices {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneManagedDevices.csv"
    $deviceData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Intune managed devices CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Intune managed devices..." -Level "INFO"
        
        $devices = Get-MgDeviceManagementManagedDevice -All
        
        Write-MandALog "Retrieved $($devices.Count) managed devices" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($device in $devices) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-Progress -Activity "Processing Intune Devices" -Status "Device $processedCount of $($devices.Count)" -PercentComplete (($processedCount / $devices.Count) * 100)
            }
            
            $deviceData.Add([PSCustomObject]@{
                DeviceId = $device.Id
                DeviceName = $device.DeviceName
                ManagedDeviceOwnerType = $device.ManagedDeviceOwnerType
                DeviceType = $device.DeviceType
                ComplianceState = $device.ComplianceState
                EnrolledDateTime = $device.EnrolledDateTime
                LastSyncDateTime = $device.LastSyncDateTime
                OperatingSystem = $device.OperatingSystem
                OSVersion = $device.OSVersion
                Model = $device.Model
                Manufacturer = $device.Manufacturer
                SerialNumber = $device.SerialNumber
                UserPrincipalName = $device.UserPrincipalName
                UserDisplayName = $device.UserDisplayName
                EmailAddress = $device.EmailAddress
                AzureADDeviceId = $device.AzureADDeviceId
                AzureADRegistered = $device.AzureADRegistered
                IsEncrypted = $device.IsEncrypted
                IsSupervised = $device.IsSupervised
                JailBroken = $device.JailBroken
                ManagementAgent = $device.ManagementAgent
                ManagementState = $device.ManagementState
                DeviceRegistrationState = $device.DeviceRegistrationState
                DeviceEnrollmentType = $device.DeviceEnrollmentType
                ActivationLockBypassCode = if ($device.ActivationLockBypassCode) { "Set" } else { "NotSet" }
                EASDeviceId = $device.EASDeviceId
                EASActivated = $device.EASActivated
                ExchangeAccessState = $device.ExchangeAccessState
                ExchangeAccessStateReason = $device.ExchangeAccessStateReason
                RemoteAssistanceSessionUrl = if ($device.RemoteAssistanceSessionUrl) { "Available" } else { "NotAvailable" }
                FreeStorageSpaceInBytes = $device.FreeStorageSpaceInBytes
                TotalStorageSpaceInBytes = $device.TotalStorageSpaceInBytes
                ManagedDeviceName = $device.ManagedDeviceName
                PartnerReportedThreatState = $device.PartnerReportedThreatState
                ConfigurationManagerClientEnabledFeatures = if ($device.ConfigurationManagerClientEnabledFeatures) { "Enabled" } else { "Disabled" }
                WiFiMacAddress = $device.WiFiMacAddress
                EthernetMacAddress = $device.EthernetMacAddress
                IMEI = $device.IMEI
                MEID = $device.MEID
                SubscriberCarrier = $device.SubscriberCarrier
                PhoneNumber = $device.PhoneNumber
                ICCID = $device.ICCID
                Notes = $device.Notes
            })
        }
        
        Write-Progress -Activity "Processing Intune Devices" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $deviceData -FilePath $outputFile
        Write-MandALog "Exported $($deviceData.Count) managed devices to CSV" -Level "SUCCESS"
        
        return $deviceData
        
    } catch {
        Write-MandALog "Error retrieving Intune managed devices: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneCompliancePolicies {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneCompliancePolicies.csv"
    $policyData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Compliance policies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving device compliance policies..." -Level "INFO"
        
        $policies = Get-MgDeviceManagementDeviceCompliancePolicy -All
        
        foreach ($policy in $policies) {
            # Get policy assignments
            $assignments = Get-MgDeviceManagementDeviceCompliancePolicyAssignment -DeviceCompliancePolicyId $policy.Id
            
            $policyData.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
                Version = $policy.Version
                Platform = if ($policy.AdditionalProperties.ContainsKey('@odata.type')) {
                    switch ($policy.AdditionalProperties['@odata.type']) {
                        '#microsoft.graph.androidCompliancePolicy' { 'Android' }
                        '#microsoft.graph.iosCompliancePolicy' { 'iOS' }
                        '#microsoft.graph.windows10CompliancePolicy' { 'Windows10' }
                        '#microsoft.graph.macOSCompliancePolicy' { 'macOS' }
                        default { 'Unknown' }
                    }
                } else { 'Unknown' }
                AssignmentCount = $assignments.Count
                AssignmentTargets = ($assignments | ForEach-Object {
                    if ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.allLicensedUsersAssignmentTarget') {
                        "All Users"
                    } elseif ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.groupAssignmentTarget') {
                        "Group:$($_.Target.AdditionalProperties.groupId)"
                    } else {
                        "Unknown"
                    }
                }) -join ";"
                # Platform-specific settings would need to be extracted based on type
                PasswordRequired = if ($policy.AdditionalProperties.passwordRequired) { $policy.AdditionalProperties.passwordRequired } else { "N/A" }
                PasswordMinimumLength = if ($policy.AdditionalProperties.passwordMinimumLength) { $policy.AdditionalProperties.passwordMinimumLength } else { "N/A" }
                StorageRequireEncryption = if ($policy.AdditionalProperties.storageRequireEncryption) { $policy.AdditionalProperties.storageRequireEncryption } else { "N/A" }
                SecurityBlockJailbrokenDevices = if ($policy.AdditionalProperties.securityBlockJailbrokenDevices) { $policy.AdditionalProperties.securityBlockJailbrokenDevices } else { "N/A" }
                DeviceThreatProtectionEnabled = if ($policy.AdditionalProperties.deviceThreatProtectionEnabled) { $policy.AdditionalProperties.deviceThreatProtectionEnabled } else { "N/A" }
                DeviceThreatProtectionRequiredSecurityLevel = if ($policy.AdditionalProperties.deviceThreatProtectionRequiredSecurityLevel) { $policy.AdditionalProperties.deviceThreatProtectionRequiredSecurityLevel } else { "N/A" }
            })
        }
        
        Write-MandALog "Retrieved $($policyData.Count) compliance policies" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $policyData -FilePath $outputFile
        
        return $policyData
        
    } catch {
        Write-MandALog "Error retrieving compliance policies: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneConfigurationProfiles {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneConfigurationProfiles.csv"
    $profileData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Configuration profiles CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving device configuration profiles..." -Level "INFO"
        
        $profiles = Get-MgDeviceManagementDeviceConfiguration -All
        
        foreach ($profile in $profiles) {
            # Get profile assignments
            $assignments = Get-MgDeviceManagementDeviceConfigurationAssignment -DeviceConfigurationId $profile.Id
            
            $profileData.Add([PSCustomObject]@{
                ProfileId = $profile.Id
                DisplayName = $profile.DisplayName
                Description = $profile.Description
                CreatedDateTime = $profile.CreatedDateTime
                LastModifiedDateTime = $profile.LastModifiedDateTime
                Version = $profile.Version
                Platform = if ($profile.AdditionalProperties.ContainsKey('@odata.type')) {
                    switch ($profile.AdditionalProperties['@odata.type']) {
                        { $_ -match 'android' } { 'Android' }
                        { $_ -match 'ios' } { 'iOS' }
                        { $_ -match 'windows' } { 'Windows' }
                        { $_ -match 'macOS' } { 'macOS' }
                        default { 'Unknown' }
                    }
                } else { 'Unknown' }
                ProfileType = if ($profile.AdditionalProperties.ContainsKey('@odata.type')) {
                    $profile.AdditionalProperties['@odata.type'].Split('.')[-1]
                } else { 'Unknown' }
                AssignmentCount = $assignments.Count
                AssignmentTargets = ($assignments | ForEach-Object {
                    if ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.allLicensedUsersAssignmentTarget') {
                        "All Users"
                    } elseif ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.groupAssignmentTarget') {
                        "Group:$($_.Target.AdditionalProperties.groupId)"
                    } else {
                        "Unknown"
                    }
                }) -join ";"
                # Extract key settings based on profile type
                WiFiConfigured = if ($profile.AdditionalProperties.ContainsKey('wifi')) { "Yes" } else { "No" }
                VPNConfigured = if ($profile.AdditionalProperties.ContainsKey('vpn')) { "Yes" } else { "No" }
                EmailConfigured = if ($profile.AdditionalProperties.ContainsKey('email')) { "Yes" } else { "No" }
                CertificateConfigured = if ($profile.AdditionalProperties.ContainsKey('certificate')) { "Yes" } else { "No" }
                RestrictionsConfigured = if ($profile.AdditionalProperties.ContainsKey('deviceRestrictions')) { "Yes" } else { "No" }
            })
        }
        
        Write-MandALog "Retrieved $($profileData.Count) configuration profiles" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $profileData -FilePath $outputFile
        
        return $profileData
        
    } catch {
        Write-MandALog "Error retrieving configuration profiles: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneMobileApps {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneMobileApps.csv"
    $appData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Mobile apps CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving mobile apps..." -Level "INFO"
        
        $apps = Get-MgDeviceManagementMobileApp -All
        
        foreach ($app in $apps) {
            # Get app assignments
            $assignments = Get-MgDeviceManagementMobileAppAssignment -MobileAppId $app.Id
            
            $appType = if ($app.AdditionalProperties.ContainsKey('@odata.type')) {
                switch ($app.AdditionalProperties['@odata.type']) {
                    '#microsoft.graph.win32LobApp' { 'Win32' }
                    '#microsoft.graph.windowsMobileMSI' { 'MSI' }
                    '#microsoft.graph.microsoftStoreForBusinessApp' { 'StoreForBusiness' }
                    '#microsoft.graph.webApp' { 'WebApp' }
                    '#microsoft.graph.iosStoreApp' { 'iOSStore' }
                    '#microsoft.graph.androidStoreApp' { 'AndroidStore' }
                    '#microsoft.graph.managedIOSStoreApp' { 'ManagedIOSStore' }
                    '#microsoft.graph.managedAndroidStoreApp' { 'ManagedAndroidStore' }
                    default { 'Unknown' }
                }
            } else { 'Unknown' }
            
            $appData.Add([PSCustomObject]@{
                AppId = $app.Id
                DisplayName = $app.DisplayName
                Description = $app.Description
                Publisher = $app.Publisher
                AppType = $appType
                CreatedDateTime = $app.CreatedDateTime
                LastModifiedDateTime = $app.LastModifiedDateTime
                IsFeatured = $app.IsFeatured
                PrivacyInformationUrl = $app.PrivacyInformationUrl
                InformationUrl = $app.InformationUrl
                Owner = $app.Owner
                Developer = $app.Developer
                Notes = $app.Notes
                AssignmentCount = $assignments.Count
                AssignmentIntent = ($assignments | ForEach-Object { $_.Intent }) -join ";"
                AssignmentTargets = ($assignments | ForEach-Object {
                    if ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.allLicensedUsersAssignmentTarget') {
                        "All Users"
                    } elseif ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.groupAssignmentTarget') {
                        "Group:$($_.Target.AdditionalProperties.groupId)"
                    } elseif ($_.Target.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.allDevicesAssignmentTarget') {
                        "All Devices"
                    } else {
                        "Unknown"
                    }
                }) -join ";"
                # App-specific properties
                FileName = if ($app.AdditionalProperties.fileName) { $app.AdditionalProperties.fileName } else { "N/A" }
                Size = if ($app.AdditionalProperties.size) { $app.AdditionalProperties.size } else { "N/A" }
                ProductCode = if ($app.AdditionalProperties.productCode) { $app.AdditionalProperties.productCode } else { "N/A" }
                ProductVersion = if ($app.AdditionalProperties.productVersion) { $app.AdditionalProperties.productVersion } else { "N/A" }
                BundleId = if ($app.AdditionalProperties.bundleId) { $app.AdditionalProperties.bundleId } else { "N/A" }
                AppStoreUrl = if ($app.AdditionalProperties.appStoreUrl) { $app.AdditionalProperties.appStoreUrl } else { "N/A" }
                MinimumSupportedOperatingSystem = if ($app.AdditionalProperties.minimumSupportedOperatingSystem) { 
                    ($app.AdditionalProperties.minimumSupportedOperatingSystem | ConvertTo-Json -Compress) 
                } else { "N/A" }
            })
        }
        
        Write-MandALog "Retrieved $($appData.Count) mobile apps" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $appData -FilePath $outputFile
        
        return $appData
        
    } catch {
        Write-MandALog "Error retrieving mobile apps: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneAppProtectionPolicies {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneAppProtectionPolicies.csv"
    $policyData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "App protection policies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving app protection policies..." -Level "INFO"
        
        # Get iOS app protection policies
        $iosPolicies = Get-MgDeviceAppManagementiOSManagedAppProtection -All
        
        foreach ($policy in $iosPolicies) {
            $policyData.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
                Version = $policy.Version
                Platform = "iOS"
                PeriodOfflineBeforeAccessCheck = $policy.PeriodOfflineBeforeAccessCheck
                PeriodOnlineBeforeAccessCheck = $policy.PeriodOnlineBeforeAccessCheck
                AllowedInboundDataTransferSources = $policy.AllowedInboundDataTransferSources
                AllowedOutboundDataTransferDestinations = $policy.AllowedOutboundDataTransferDestinations
                AllowedOutboundClipboardSharingLevel = $policy.AllowedOutboundClipboardSharingLevel
                ContactSyncBlocked = $policy.ContactSyncBlocked
                DataBackupBlocked = $policy.DataBackupBlocked
                DeviceComplianceRequired = $policy.DeviceComplianceRequired
                DisableAppPinIfDevicePinIsSet = $policy.DisableAppPinIfDevicePinIsSet
                FingerprintBlocked = $policy.FingerprintBlocked
                ManagedBrowserToOpenLinksRequired = $policy.ManagedBrowserToOpenLinksRequired
                MaximumPinRetries = $policy.MaximumPinRetries
                MinimumPinLength = $policy.MinimumPinLength
                MinimumRequiredAppVersion = $policy.MinimumRequiredAppVersion
                MinimumRequiredOsVersion = $policy.MinimumRequiredOsVersion
                MinimumWarningOsVersion = $policy.MinimumWarningOsVersion
                OrganizationalCredentialsRequired = $policy.OrganizationalCredentialsRequired
                PeriodBeforePinReset = $policy.PeriodBeforePinReset
                PinCharacterSet = $policy.PinCharacterSet
                PinRequired = $policy.PinRequired
                PrintBlocked = $policy.PrintBlocked
                SaveAsBlocked = $policy.SaveAsBlocked
                SimplePinBlocked = $policy.SimplePinBlocked
            })
        }
        
        # Get Android app protection policies
        $androidPolicies = Get-MgDeviceAppManagementAndroidManagedAppProtection -All
        
        foreach ($policy in $androidPolicies) {
            $policyData.Add([PSCustomObject]@{
                PolicyId = $policy.Id
                DisplayName = $policy.DisplayName
                Description = $policy.Description
                CreatedDateTime = $policy.CreatedDateTime
                LastModifiedDateTime = $policy.LastModifiedDateTime
                Version = $policy.Version
                Platform = "Android"
                PeriodOfflineBeforeAccessCheck = $policy.PeriodOfflineBeforeAccessCheck
                PeriodOnlineBeforeAccessCheck = $policy.PeriodOnlineBeforeAccessCheck
                AllowedInboundDataTransferSources = $policy.AllowedInboundDataTransferSources
                AllowedOutboundDataTransferDestinations = $policy.AllowedOutboundDataTransferDestinations
                AllowedOutboundClipboardSharingLevel = $policy.AllowedOutboundClipboardSharingLevel
                ContactSyncBlocked = $policy.ContactSyncBlocked
                DataBackupBlocked = $policy.DataBackupBlocked
                DeviceComplianceRequired = $policy.DeviceComplianceRequired
                DisableAppPinIfDevicePinIsSet = $policy.DisableAppPinIfDevicePinIsSet
                FingerprintBlocked = $policy.FingerprintBlocked
                ManagedBrowserToOpenLinksRequired = $policy.ManagedBrowserToOpenLinksRequired
                MaximumPinRetries = $policy.MaximumPinRetries
                MinimumPinLength = $policy.MinimumPinLength
                MinimumRequiredAppVersion = $policy.MinimumRequiredAppVersion
                MinimumRequiredOsVersion = $policy.MinimumRequiredOsVersion
                MinimumWarningOsVersion = $policy.MinimumWarningOsVersion
                OrganizationalCredentialsRequired = $policy.OrganizationalCredentialsRequired
                PeriodBeforePinReset = $policy.PeriodBeforePinReset
                PinCharacterSet = $policy.PinCharacterSet
                PinRequired = $policy.PinRequired
                PrintBlocked = $policy.PrintBlocked
                SaveAsBlocked = $policy.SaveAsBlocked
                SimplePinBlocked = $policy.SimplePinBlocked
            })
        }
        
        Write-MandALog "Retrieved $($policyData.Count) app protection policies" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $policyData -FilePath $outputFile
        
        return $policyData
        
    } catch {
        Write-MandALog "Error retrieving app protection policies: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneEnrollmentRestrictions {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneEnrollmentRestrictions.csv"
    $restrictionData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Enrollment restrictions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving enrollment restrictions..." -Level "INFO"
        
        $restrictions = Get-MgDeviceManagementDeviceEnrollmentConfiguration -All
        
        foreach ($restriction in $restrictions) {
            $restrictionType = if ($restriction.AdditionalProperties.ContainsKey('@odata.type')) {
                switch ($restriction.AdditionalProperties['@odata.type']) {
                    '#microsoft.graph.deviceEnrollmentLimitConfiguration' { 'DeviceLimit' }
                    '#microsoft.graph.deviceEnrollmentPlatformRestrictionsConfiguration' { 'PlatformRestrictions' }
                    '#microsoft.graph.deviceEnrollmentWindowsHelloForBusinessConfiguration' { 'WindowsHelloForBusiness' }
                    default { 'Unknown' }
                }
            } else { 'Unknown' }
            
            $restrictionData.Add([PSCustomObject]@{
                RestrictionId = $restriction.Id
                DisplayName = $restriction.DisplayName
                Description = $restriction.Description
                CreatedDateTime = $restriction.CreatedDateTime
                LastModifiedDateTime = $restriction.LastModifiedDateTime
                Version = $restriction.Version
                Priority = $restriction.Priority
                RestrictionType = $restrictionType
                # Type-specific settings
                DeviceLimit = if ($restriction.AdditionalProperties.limit) { $restriction.AdditionalProperties.limit } else { "N/A" }
                iOSRestriction = if ($restriction.AdditionalProperties.iosRestriction) { 
                    "Blocked: $($restriction.AdditionalProperties.iosRestriction.platformBlocked), " +
                    "PersonalDeviceEnrollmentBlocked: $($restriction.AdditionalProperties.iosRestriction.personalDeviceEnrollmentBlocked)"
                } else { "N/A" }
                AndroidRestriction = if ($restriction.AdditionalProperties.androidRestriction) { 
                    "Blocked: $($restriction.AdditionalProperties.androidRestriction.platformBlocked), " +
                    "PersonalDeviceEnrollmentBlocked: $($restriction.AdditionalProperties.androidRestriction.personalDeviceEnrollmentBlocked)"
                } else { "N/A" }
                WindowsRestriction = if ($restriction.AdditionalProperties.windowsRestriction) { 
                    "Blocked: $($restriction.AdditionalProperties.windowsRestriction.platformBlocked), " +
                    "PersonalDeviceEnrollmentBlocked: $($restriction.AdditionalProperties.windowsRestriction.personalDeviceEnrollmentBlocked)"
                } else { "N/A" }
                macOSRestriction = if ($restriction.AdditionalProperties.macOSRestriction) { 
                    "Blocked: $($restriction.AdditionalProperties.macOSRestriction.platformBlocked), " +
                    "PersonalDeviceEnrollmentBlocked: $($restriction.AdditionalProperties.macOSRestriction.personalDeviceEnrollmentBlocked)"
                } else { "N/A" }
            })
        }
        
        Write-MandALog "Retrieved $($restrictionData.Count) enrollment restrictions" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $restrictionData -FilePath $outputFile
        
        return $restrictionData
        
    } catch {
        Write-MandALog "Error retrieving enrollment restrictions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneDeviceCategories {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneDeviceCategories.csv"
    $categoryData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Device categories CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving device categories..." -Level "INFO"
        
        $categories = Get-MgDeviceManagementDeviceCategory -All
        
        foreach ($category in $categories) {
            # Count devices in this category
            $devicesInCategory = Get-MgDeviceManagementManagedDevice -Filter "deviceCategoryDisplayName eq '$($category.DisplayName)'" -CountVariable deviceCount
            
            $categoryData.Add([PSCustomObject]@{
                CategoryId = $category.Id
                DisplayName = $category.DisplayName
                Description = $category.Description
                DeviceCount = $deviceCount
            })
        }
        
        Write-MandALog "Retrieved $($categoryData.Count) device categories" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $categoryData -FilePath $outputFile
        
        return $categoryData
        
    } catch {
        Write-MandALog "Error retrieving device categories: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-IntuneAutopilotDevices {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "IntuneAutopilotDevices.csv"
    $autopilotData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Autopilot devices CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Autopilot devices..." -Level "INFO"
        
        $autopilotDevices = Get-MgDeviceManagementWindowsAutopilotDeviceIdentity -All
        
        foreach ($device in $autopilotDevices) {
            $autopilotData.Add([PSCustomObject]@{
                AutopilotDeviceId = $device.Id
                SerialNumber = $device.SerialNumber
                Model = $device.Model
                Manufacturer = $device.Manufacturer
                ProductKey = if ($device.ProductKey) { "Present" } else { "NotPresent" }
                PurchaseOrderIdentifier = $device.PurchaseOrderIdentifier
                ResourceName = $device.ResourceName
                SkuNumber = $device.SkuNumber
                SystemFamily = $device.SystemFamily
                AzureActiveDirectoryDeviceId = $device.AzureActiveDirectoryDeviceId
                ManagedDeviceId = $device.ManagedDeviceId
                DisplayName = $device.DisplayName
                EnrollmentState = $device.EnrollmentState
                LastContactedDateTime = $device.LastContactedDateTime
                AddressableUserName = $device.AddressableUserName
                UserPrincipalName = $device.UserPrincipalName
                GroupTag = $device.GroupTag
                DeploymentProfileAssignmentStatus = $device.DeploymentProfileAssignmentStatus
                DeploymentProfileAssignedDateTime = $device.DeploymentProfileAssignedDateTime
                DeploymentProfileAssignmentDetailedStatus = $device.DeploymentProfileAssignmentDetailedStatus
                RemediationState = $device.RemediationState
                RemediationStateLastModifiedDateTime = $device.RemediationStateLastModifiedDateTime
            })
        }
        
        Write-MandALog "Retrieved $($autopilotData.Count) Autopilot devices" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $autopilotData -FilePath $outputFile
        
        return $autopilotData
        
    } catch {
        Write-MandALog "Error retrieving Autopilot devices: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-IntuneDiscovery',
    'Get-IntuneManagedDevices',
    'Get-IntuneCompliancePolicies',
    'Get-IntuneConfigurationProfiles',
    'Get-IntuneMobileApps',
    'Get-IntuneAppProtectionPolicies',
    'Get-IntuneEnrollmentRestrictions',
    'Get-IntuneDeviceCategories',
    'Get-IntuneAutopilotDevices'
)