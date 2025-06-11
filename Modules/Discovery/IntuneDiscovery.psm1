# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Microsoft Intune Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Intune managed devices, configurations, and policies using Microsoft Graph API
.NOTES
    Version: 4.1.0 (Fixed)
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

    Write-IntuneLog -Level "HEADER" -Message "Starting Discovery (v4.1.0 - Fixed)" -Context $Context
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
        $collectDeviceSoftware = $false
        $includeDeviceConfiguration = $true
        $includeCompliancePolicies = $true
        $includeProtectionPolicies = $true
        $includeAutopilotDevices = $true
        $includeWindowsUpdatePolicies = $true
        $includeGroupAssignments = $true
        $includeDeviceCategories = $true
        $maxDevicesForSoftware = 100
        
        if ($Configuration.discovery -and $Configuration.discovery.intune) {
            $intuneConfig = $Configuration.discovery.intune
            if ($null -ne $intuneConfig.collectDeviceSoftware) { $collectDeviceSoftware = $intuneConfig.collectDeviceSoftware }
            if ($null -ne $intuneConfig.includeDeviceConfiguration) { $includeDeviceConfiguration = $intuneConfig.includeDeviceConfiguration }
            if ($null -ne $intuneConfig.includeCompliancePolicies) { $includeCompliancePolicies = $intuneConfig.includeCompliancePolicies }
            if ($null -ne $intuneConfig.includeProtectionPolicies) { $includeProtectionPolicies = $intuneConfig.includeProtectionPolicies }
            if ($null -ne $intuneConfig.includeAutopilotDevices) { $includeAutopilotDevices = $intuneConfig.includeAutopilotDevices }
            if ($null -ne $intuneConfig.includeWindowsUpdatePolicies) { $includeWindowsUpdatePolicies = $intuneConfig.includeWindowsUpdatePolicies }
            if ($null -ne $intuneConfig.includeGroupAssignments) { $includeGroupAssignments = $intuneConfig.includeGroupAssignments }
            if ($null -ne $intuneConfig.includeDeviceCategories) { $includeDeviceCategories = $intuneConfig.includeDeviceCategories }
            if ($null -ne $intuneConfig.maxDevicesForSoftware) { $maxDevicesForSoftware = $intuneConfig.maxDevicesForSoftware }
        }

        # STEP 3: Authenticate
        Write-IntuneLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            $graphConnected = $true
            Write-IntuneLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            
            # Validate connection with Intune endpoint
            Write-IntuneLog -Level "DEBUG" -Message "Validating Intune access..." -Context $Context
            $testUri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$top=1"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop
            
            if ($null -ne $testResponse) {
                Write-IntuneLog -Level "DEBUG" -Message "Intune access validated successfully" -Context $Context
            }
            
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }

        # STEP 4: PERFORM DISCOVERY
        Write-IntuneLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Discover Managed Devices
        $managedDevices = @()
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune managed devices..." -Context $Context
            
            $totalDevices = 0
            
            # Enhanced select fields for comprehensive data
            $selectFields = @(
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
                'freeStorageSpaceInBytes', 'managedDeviceName', 'partnerReportedThreatState',
                'autopilotEnrolled', 'requireUserEnrollmentApproval', 'managementCertificateExpirationDate',
                'iccid', 'udid', 'roleScopeTagIds', 'windowsActiveMalwareCount',
                'windowsRemediatedMalwareCount', 'notes', 'ethernetMacAddress',
                'physicalMemoryInBytes', 'deviceType'
            )
            
            $selectParam = "`$select=" + ($selectFields -join ',')
            $uri = "https://graph.microsoft.com/beta/deviceManagement/managedDevices?$selectParam&`$top=999"
            
            do {
                Write-IntuneLog -Level "DEBUG" -Message "Fetching devices from: $uri" -Context $Context
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction Stop
                
                if ($response -and $response.value) {
                    foreach ($device in $response.value) {
                        $totalDevices++
                        
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
                            ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                            DeviceEnrollmentType = $device.deviceEnrollmentType
                            DeviceRegistrationState = $device.deviceRegistrationState
                            ManagementCertificateExpirationDate = $device.managementCertificateExpirationDate
                            
                            # Compliance and security
                            ComplianceState = $device.complianceState
                            ComplianceGracePeriodExpirationDateTime = $device.complianceGracePeriodExpirationDateTime
                            IsEncrypted = $device.isEncrypted
                            IsSupervised = $device.isSupervised
                            JailBroken = $device.jailBroken
                            AndroidSecurityPatchLevel = $device.androidSecurityPatchLevel
                            PartnerReportedThreatState = $device.partnerReportedThreatState
                            
                            # Windows security
                            WindowsActiveMalwareCount = $device.windowsActiveMalwareCount
                            WindowsRemediatedMalwareCount = $device.windowsRemediatedMalwareCount
                            
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
                            
                            _ObjectType = 'ManagedDevice'
                        }
                        
                        $managedDevices += $deviceObj
                        $null = $allDiscoveredData.Add($deviceObj)
                        
                        # Report progress
                        if ($totalDevices % 100 -eq 0) {
                            Write-IntuneLog -Level "DEBUG" -Message "Processed $totalDevices devices so far..." -Context $Context
                        }
                    }
                }
                
                $uri = $response.'@odata.nextLink'
                
            } while ($uri)
            
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalDevices Intune managed devices" -Context $Context
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
                                RoleScopeTagIds = ($config.roleScopeTagIds -join ';')
                                _ObjectType = 'DeviceConfiguration'
                            }
                            
                            $null = $allDiscoveredData.Add($configObj)
                        }
                    }
                    
                    $configUri = $response.'@odata.nextLink'
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
                                RoleScopeTagIds = ($policy.roleScopeTagIds -join ';')
                                _ObjectType = 'CompliancePolicy'
                            }
                            
                            $null = $allDiscoveredData.Add($policyObj)
                        }
                    }
                    
                    $complianceUri = $response.'@odata.nextLink'
                } while ($complianceUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $complianceCount compliance policies" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover compliance policies: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover compliance policies: $($_.Exception.Message)", @{Operation = "GetCompliancePolicies"})
            }
        }
        
        # Discover Autopilot Devices
        if ($includeAutopilotDevices) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering Windows Autopilot devices..." -Context $Context
                
                $autopilotUri = "https://graph.microsoft.com/beta/deviceManagement/windowsAutopilotDeviceIdentities?`$top=999"
                $autopilotCount = 0
                
                do {
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
                                EnrollmentState = $apDevice.enrollmentState.enrollmentState
                                LastContactedDateTime = $apDevice.lastContactedDateTime
                                AddressableUserName = $apDevice.addressableUserName
                                UserPrincipalName = $apDevice.userPrincipalName
                                _ObjectType = 'AutopilotDevice'
                            }
                            
                            $null = $allDiscoveredData.Add($apObj)
                        }
                    }
                    
                    $autopilotUri = $response.'@odata.nextLink'
                } while ($autopilotUri)
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $autopilotCount Autopilot devices" -Context $Context
                
            } catch {
                Write-IntuneLog -Level "WARN" -Message "Failed to discover Autopilot devices: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover Autopilot devices: $($_.Exception.Message)", @{Operation = "GetAutopilotDevices"})
            }
        }
        
        # Discover Device Categories
        if ($includeDeviceCategories) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device categories..." -Context $Context
                
                $categoryUri = "https://graph.microsoft.com/beta/deviceManagement/deviceCategories"
                $response = Invoke-MgGraphRequest -Uri $categoryUri -Method GET -ErrorAction Stop
                
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
                Write-IntuneLog -Level "WARN" -Message "Failed to discover device categories: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover device categories: $($_.Exception.Message)", @{Operation = "GetDeviceCategories"})
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
                    'AutopilotDevice' { 'IntuneAutopilotDevices.csv' }
                    'DeviceCategory' { 'IntuneDeviceCategories.csv' }
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
        
        if ($graphConnected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-IntuneLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
            } catch {
                Write-IntuneLog -Level "DEBUG" -Message "Error disconnecting from Graph: $_" -Context $Context
            }
        }
        
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