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
    $result = $null
    $isHashtableResult = $false
    
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Intune')
    } else {
        # Fallback to hashtable
        $isHashtableResult = $true
        $result = @{
            Success      = $true
            ModuleName   = 'Intune'
            RecordCount  = 0
            Data         = $null
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
        }
        
        # Add methods for hashtable
        $result.AddError = {
            param($m, $e, $c)
            $errorEntry = @{
                Timestamp = Get-Date
                Message = $m
                Exception = if ($e) { $e.ToString() } else { $null }
                ExceptionType = if ($e) { $e.GetType().FullName } else { $null }
                Context = $c
            }
            $null = $this.Errors.Add($errorEntry)
            $this.Success = $false
        }.GetNewClosure()
        
        $result.AddWarning = {
            param($m, $c)
            $warningEntry = @{
                Timestamp = Get-Date
                Message = $m
                Context = $c
            }
            $null = $this.Warnings.Add($warningEntry)
        }.GetNewClosure()
        
        $result.Complete = {
            $this.EndTime = Get-Date
            if ($this.StartTime -and $this.EndTime) {
                $duration = $this.EndTime - $this.StartTime
                $this.Metadata['Duration'] = $duration
                $this.Metadata['DurationSeconds'] = $duration.TotalSeconds
            }
        }.GetNewClosure()
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
        if ($Configuration.discovery -and $Configuration.discovery.intune -and 
            $Configuration.discovery.intune.collectDeviceSoftware) {
            $collectDeviceSoftware = $Configuration.discovery.intune.collectDeviceSoftware
        }
        
        Write-IntuneLog -Level "DEBUG" -Message "Config: Collect Device Software=$collectDeviceSoftware" -Context $Context

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
        $graphConnected = $false
        try {
            Write-IntuneLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            
            # Check if already connected
            $currentContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($currentContext -and $currentContext.Account -and $currentContext.ClientId -eq $authInfo.ClientId) {
                Write-IntuneLog -Level "DEBUG" -Message "Using existing Graph session" -Context $Context
                $graphConnected = $true
            } else {
                if ($currentContext) {
                    Write-IntuneLog -Level "DEBUG" -Message "Disconnecting existing Graph session" -Context $Context
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                }
                
                # Create PSCredential object from ClientId and SecureString
                $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
                
                # Connect using the PSCredential
                Connect-MgGraph -ClientSecretCredential $clientCredential `
                                -TenantId $authInfo.TenantId `
                                -NoWelcome -ErrorAction Stop
                
                Write-IntuneLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
                $graphConnected = $true
                
                # Verify connection
                $mgContext = Get-MgContext -ErrorAction Stop
                if (-not $mgContext) {
                    throw "Failed to establish Graph context after connection"
                }
            }
            
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-IntuneLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Managed Devices
        $managedDevices = @()
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering Intune managed devices..." -Context $Context
            
            $totalDevices = 0
            $nextLink = $null
            
            do {
                if ($nextLink) {
                    $response = Invoke-MgGraphRequest -Uri $nextLink -Method GET
                } else {
                    $uri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$top=999"
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET
                }
                
                if ($response.value) {
                    foreach ($device in $response.value) {
                        $totalDevices++
                        
                        $managedDevices += [PSCustomObject]@{
                            # Core identification
                            DeviceId = $device.id
                            DeviceName = $device.deviceName
                            SerialNumber = $device.serialNumber
                            
                            # User mapping fields (critical for processing)
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
                            
                            # Management status
                            ManagementAgent = $device.managementAgent
                            ManagementState = $device.managementState
                            ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                            
                            # Compliance and security
                            ComplianceState = $device.complianceState
                            IsCompliant = $device.isCompliant
                            IsEncrypted = $device.isEncrypted
                            IsSupervised = $device.isSupervised
                            JailBroken = $device.jailBroken
                            
                            # Dates
                            EnrolledDateTime = $device.enrolledDateTime
                            LastSyncDateTime = $device.lastSyncDateTime
                            
                            # Azure AD integration
                            AzureADDeviceId = $device.azureADDeviceId
                            AzureADRegistered = $device.azureADRegistered
                            AutopilotEnrolled = $device.autopilotEnrolled
                            
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
                            
                            # Category
                            DeviceCategory = $device.deviceCategoryDisplayName
                            _ObjectType = 'ManagedDevice'
                        }
                        
                        $null = $allDiscoveredData.Add($managedDevices[-1])
                        
                        # Report progress
                        if ($totalDevices % 100 -eq 0) {
                            Write-IntuneLog -Level "DEBUG" -Message "Processed $totalDevices devices so far..." -Context $Context
                        }
                    }
                }
                
                $nextLink = $response.'@odata.nextLink'
                
            } while ($nextLink)
            
            Write-IntuneLog -Level "SUCCESS" -Message "Discovered $totalDevices Intune managed devices" -Context $Context
            
            if ($isHashtableResult) {
                $result.Metadata["ManagedDeviceCount"] = $totalDevices
            } else {
                $result.Metadata["ManagedDeviceCount"] = $totalDevices
            }
            
        } catch {
            $result.AddWarning("Failed to discover managed devices: $($_.Exception.Message)", @{Operation = "GetManagedDevices"})
        }
        
        # Discover Device Configurations
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering device configurations..." -Context $Context
            
            $uri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations"
            $response = Invoke-MgGraphRequest -Uri $uri -Method GET
            
            if ($response.value) {
                foreach ($config in $response.value) {
                    $configObj = [PSCustomObject]@{
                        ConfigurationId = $config.id
                        DisplayName = $config.displayName
                        Description = $config.description
                        Version = $config.version
                        Platform = $config.'@odata.type' -replace '#microsoft.graph.', ''
                        CreatedDateTime = $config.createdDateTime
                        LastModifiedDateTime = $config.lastModifiedDateTime
                        _ObjectType = 'DeviceConfiguration'
                    }
                    
                    $null = $allDiscoveredData.Add($configObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) device configurations" -Context $Context
            }
            
        } catch {
            $result.AddWarning("Failed to discover device configurations: $($_.Exception.Message)", @{Operation = "GetDeviceConfigurations"})
        }
        
        # Discover Compliance Policies
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering compliance policies..." -Context $Context
            
            $uri = "https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies"
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
                        _ObjectType = 'CompliancePolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) compliance policies" -Context $Context
            }
            
        } catch {
            $result.AddWarning("Failed to discover compliance policies: $($_.Exception.Message)", @{Operation = "GetCompliancePolicies"})
        }
        
        # Discover Mobile Apps
        try {
            Write-IntuneLog -Level "INFO" -Message "Discovering mobile apps..." -Context $Context
            
            $uri = "https://graph.microsoft.com/v1.0/deviceAppManagement/mobileApps"
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
                        _ObjectType = 'MobileApp'
                    }
                    
                    $null = $allDiscoveredData.Add($appObj)
                }
                
                Write-IntuneLog -Level "SUCCESS" -Message "Discovered $($response.value.Count) mobile apps" -Context $Context
            }
            
        } catch {
            $result.AddWarning("Failed to discover mobile apps: $($_.Exception.Message)", @{Operation = "GetMobileApps"})
        }
        
        # Discover Device Software (if enabled)
        if ($collectDeviceSoftware -and $managedDevices.Count -gt 0) {
            try {
                Write-IntuneLog -Level "INFO" -Message "Discovering device software for $($managedDevices.Count) devices..." -Context $Context
                
                $softwareCount = 0
                $processedDevices = 0
                
                foreach ($device in $managedDevices) {
                    $processedDevices++
                    
                    if ($processedDevices % 50 -eq 0) {
                        Write-IntuneLog -Level "DEBUG" -Message "Software discovery progress: $processedDevices/$($managedDevices.Count) devices" -Context $Context
                    }
                    
                    try {
                        $uri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices/$($device.DeviceId)/detectedApps"
                        $response = Invoke-MgGraphRequest -Uri $uri -Method GET -ErrorAction SilentlyContinue
                        
                        if ($response.value) {
                            foreach ($app in $response.value) {
                                $softwareObj = [PSCustomObject]@{
                                    ManagedDeviceId = $device.DeviceId
                                    DeviceName = $device.DeviceName
                                    UserPrincipalName = $device.UserPrincipalName
                                    UserId = $device.UserId
                                    SoftwareDisplayName = $app.displayName
                                    SoftwareVersion = $app.version
                                    Publisher = $app.publisher
                                    Platform = $device.OperatingSystem
                                    SizeInMB = if ($app.sizeInByte) { 
                                        [math]::Round($app.sizeInByte / 1MB, 2) 
                                    } else { $null }
                                    DetectedAppId = $app.id
                                    _ObjectType = 'DeviceSoftware'
                                }
                                
                                $null = $allDiscoveredData.Add($softwareObj)
                                $softwareCount++
                            }
                        }
                        
                        # Small delay to avoid throttling
                        if ($processedDevices % 20 -eq 0) {
                            Start-Sleep -Milliseconds 500
                        }
                        
                    } catch {
                        Write-IntuneLog -Level "DEBUG" -Message "Could not get software for device $($device.DeviceName): $_" -Context $Context
                    }
                }
                
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
        # Handle both hashtable and object cases for RecordCount
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        if ($isHashtableResult) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $allDiscoveredData.Count
            $result['RecordCount'] = $allDiscoveredData.Count  # Ensure both access methods work
            $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
            $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $allDiscoveredData.Count
            $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
            $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        }

    } catch {
        # Top-level error handler
        Write-IntuneLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-IntuneLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph only if we connected
        if ($graphConnected) {
            try {
                $mgContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($mgContext) {
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                    Write-IntuneLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
                }
            } catch {
                # Ignore disconnect errors
            }
        }
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Get final record count for logging - SAFE ACCESS
        $finalRecordCount = 0
        try {
            if ($isHashtableResult) {
                $finalRecordCount = if ($result.ContainsKey('RecordCount')) { $result['RecordCount'] } else { 0 }
            } else {
                $finalRecordCount = if ($result -and $result.PSObject.Properties['RecordCount']) { $result.RecordCount } else { 0 }
            }
        } catch {
            $finalRecordCount = 0
        }
        Write-IntuneLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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

function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        $Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    try {
        if ($Data -and $Data.Count -gt 0) {
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
            Write-IntuneLog -Level "DEBUG" -Message "Exported $($Data.Count) records to $FilePath" -Context $Context
        }
    } catch {
        Write-IntuneLog -Level "ERROR" -Message "Failed to export data to $FilePath`: $_" -Context $Context
        throw
    }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-IntuneDiscovery