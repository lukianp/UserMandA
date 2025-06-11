# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


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

# --- Main Discovery Function ---

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

    Write-IntuneLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-IntuneLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
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

        # 4. AUTHENTICATE & CONNECT (NEW SESSION-BASED)
        Write-IntuneLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-IntuneLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
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
                
                $nextLink = $response.'@odata.nextLink'
                
            } while ($nextLink)
            
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalDevices Intune managed devices" -Context $Context
            $result.Metadata["ManagedDeviceCount"] = $totalDevices
            
        } catch {
            $result.AddWarning("Failed to discover managed devices: $($_.Exception.Message)", @{Operation = "GetManagedDevices"})
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
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
                # Map object types to file names
                $fileName = switch ($objectType) {
                    'ManagedDevice' { 'IntuneManagedDevices.csv' }
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
        $result.Metadata["SessionId"] = $SessionId
        
        # Add specific counts
        $dataGroups = $allDiscoveredData | Group-Object -Property _ObjectType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    }
    catch [System.UnauthorizedAccessException] {
        $result.AddError("Access denied: $($_.Exception.Message)", $_.Exception, @{ErrorType="Authorization"})
        Write-IntuneLog -Level "ERROR" -Message "Authorization error: $($_.Exception.Message)" -Context $Context
    }
    catch [System.Net.WebException] {
        $result.AddError("Network error: $($_.Exception.Message)", $_.Exception, @{ErrorType="Network"})
        Write-IntuneLog -Level "ERROR" -Message "Network error: $($_.Exception.Message)" -Context $Context
    }
    catch {
        $result.AddError("Unexpected error: $($_.Exception.Message)", $_.Exception, @{ErrorType="General"})
        Write-IntuneLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
    }
    finally {
        # 8. CLEANUP & COMPLETE
        Write-IntuneLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        Write-IntuneLog -Level $(if($result.Success){"SUCCESS"}else{"ERROR"}) -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
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