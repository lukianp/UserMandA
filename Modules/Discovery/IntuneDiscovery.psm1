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


function Get-IntuneManagedDevicesInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-ProgressStep "Starting Enhanced Intune Managed Devices Discovery..." -Status Progress
    $allManagedDevices = [System.Collections.Generic.List[PSObject]]::new()

    try {
        Write-ProgressStep "Fetching Intune Managed Devices..." -Status Progress
        
        # Get initial count
        $countQuery = Get-MgDeviceManagementManagedDevice -Top 1 -Count
        $totalDevices = $countQuery.Count
        
        Write-ProgressStep "Found $totalDevices Intune managed devices" -Status Info
        
        # Use pagination for large environments
        $devices = Get-MgDeviceManagementManagedDevice -All -ErrorAction Stop
        
        if ($devices) {
            $processedCount = 0
            
            foreach($device in $devices) {
                $processedCount++
                
                # Update progress every 20 devices
                if ($processedCount % 20 -eq 0 -or $processedCount -eq $totalDevices) {
                    Show-ProgressBar -Current $processedCount -Total $totalDevices `
                        -Activity "Processing device: $($device.DeviceName)"
                }
                
                $deviceObj = [PSCustomObject]@{
                    # Core identification
                    DeviceId = $device.Id
                    DeviceName = $device.DeviceName
                    SerialNumber = $device.SerialNumber
                    
                    # User mapping fields (critical for processing)
                    UserPrincipalName = $device.UserPrincipalName
                    UserDisplayName = $device.UserDisplayName
                    UserId = $device.UserId
                    EmailAddress = $device.EmailAddress
                    
                    # Device details
                    OperatingSystem = $device.OperatingSystem
                    OSVersion = $device.OsVersion
                    Model = $device.Model
                    Manufacturer = $device.Manufacturer
                    DeviceType = if ($device.DeviceType) { $device.DeviceType.ToString() } else { $null }
                    
                    # Management status
                    ManagementAgent = if ($device.ManagementAgent) { $device.ManagementAgent.ToString() } else { $null }
                    ManagementState = if ($device.ManagementState) { $device.ManagementState.ToString() } else { $null }
                    ManagedDeviceOwnerType = if ($device.ManagedDeviceOwnerType) { $device.ManagedDeviceOwnerType.ToString() } else { $null }
                    
                    # Compliance and security
                    ComplianceState = if ($device.ComplianceState) { $device.ComplianceState.ToString() } else { $null }
                    IsCompliant = $device.IsCompliant
                    IsEncrypted = $device.IsEncrypted
                    IsSupervised = $device.IsSupervised
                    JailBroken = $device.JailBroken
                    
                    # Dates
                    EnrolledDateTime = $device.EnrolledDateTime
                    LastSyncDateTime = $device.LastSyncDateTime
                    
                    # Azure AD integration
                    AzureADDeviceId = $device.AzureADDeviceId
                    AzureADRegistered = $device.AzureADRegistered
                    AutopilotEnrolled = $device.AutopilotEnrolled
                    
                    # Storage information
                    TotalStorageSpaceInGB = if ($device.TotalStorageSpaceInBytes) { [math]::Round($device.TotalStorageSpaceInBytes / 1GB, 2) } else { $null }
                    FreeStorageSpaceInGB = if ($device.FreeStorageSpaceInBytes) { [math]::Round($device.FreeStorageSpaceInBytes / 1GB, 2) } else { $null }
                    PhysicalMemoryInGB = if ($device.PhysicalMemoryInBytes) { [math]::Round($device.PhysicalMemoryInBytes / 1GB, 2) } else { $null }
                    
                    # Exchange status
                    ExchangeAccessState = if ($device.ExchangeAccessState) { $device.ExchangeAccessState.ToString() } else { $null }
                    ExchangeAccessStateReason = if ($device.ExchangeAccessStateReason) { $device.ExchangeAccessStateReason.ToString() } else { $null }
                    
                    # Category
                    DeviceCategory = $device.DeviceCategoryDisplayName
                }
                
                $allManagedDevices.Add($deviceObj)
            }

            Write-Host "" # Clear progress bar line

            if ($allManagedDevices.Count -gt 0) {
                Write-ProgressStep "Exporting $($allManagedDevices.Count) Intune devices to CSV..." -Status Progress
                Export-DataToCSV -Data $allManagedDevices -FileName "IntuneManagedDevices.csv" -OutputPath $script:outputPath
                Write-ProgressStep "Successfully exported Intune Managed Devices" -Status Success
            }
        } else {
            Write-ProgressStep "No Intune Managed Devices found" -Status Warning
        }
    } catch {
        Write-ProgressStep "Error during Intune Managed Devices Discovery: $($_.Exception.Message)" -Status Error
        throw
    }
    
    return $allManagedDevices
}

function Get-IntuneDeviceSoftwareInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Collections.Generic.List[PSObject]]$ManagedDevices,
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-ProgressStep "Starting Intune Device Software Inventory..." -Status Progress
    $allDeviceSoftware = [System.Collections.Generic.List[PSObject]]::new()

    if (-not $ManagedDevices -or $ManagedDevices.Count -eq 0) {
        Write-ProgressStep "No managed devices provided. Skipping software inventory." -Status Warning
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
    
    Write-ProgressStep "Retrieving software for $totalDevices devices..." -Status Progress

    foreach ($device in $ManagedDevices) {
        $currentDeviceNum++
        
        Show-ProgressBar -Current $currentDeviceNum -Total $totalDevices `
            -Activity "Getting software for: $($device.DeviceName)"
        
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
                        UserPrincipalName = $device.UserPrincipalName
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
            
            # Small delay to avoid throttling every 20 devices
            if ($currentDeviceNum % 20 -eq 0) {
                Start-Sleep -Milliseconds 500
            }
            
        } catch {
            Write-ProgressStep "Error retrieving software for device '$($device.DeviceName)'" -Status Warning -Details @{Error=$_.Exception.Message}
        }
    }

    Write-Host "" # Clear progress bar line

    if ($allDeviceSoftware.Count -gt 0) {
        Write-ProgressStep "Exporting $($allDeviceSoftware.Count) software entries to CSV..." -Status Progress
        Export-DataToCSV -Data $allDeviceSoftware -FileName "IntuneDeviceSoftware.csv" -OutputPath $script:outputPath
        Write-ProgressStep "Successfully exported device software inventory" -Status Success
    } else {
        Write-ProgressStep "No device software found across all devices" -Status Info
    }
    
    return $allDeviceSoftware
}



function Get-IntuneDeviceSoftwareInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Collections.Generic.List[PSObject]]$ManagedDevices,
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
    
    Write-MandALog "--- Starting Enhanced Intune Discovery ---" -Level "HEADER"
    
    # Initialize the module
    Initialize-IntuneDiscovery -Context $Context
    
    $overallStatus = $true
    $discoveredData = @{}

    try {
        # Check Graph connection
        Get-MgContext -ErrorAction Stop | Out-Null
        Write-MandALog "Graph context active for Intune discovery." -Level "INFO"
    } catch {
        Write-MandALog "Graph not connected. Skipping Intune Discovery. Error: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }

    try {
        # Core device discovery
        $managedDevices = Get-IntuneManagedDevicesInternal -Configuration $Configuration
        $discoveredData.ManagedDevices = $managedDevices
        
        # Get software inventory if devices exist and config allows
        if ($managedDevices -and $managedDevices.Count -gt 0) {
            $collectSoftware = $true
            if ($Configuration.discovery.intune -and $Configuration.discovery.intune.ContainsKey('collectDeviceSoftware')) {
                $collectSoftware = [bool]$Configuration.discovery.intune.collectDeviceSoftware
            }
            
            if ($collectSoftware) {
                $discoveredData.DeviceSoftware = Get-IntuneDeviceSoftwareInternal -ManagedDevices $managedDevices -Configuration $Configuration
            }
        }

        # Configuration and policy discovery
        $discoveredData.DeviceConfigurations = Get-IntuneDeviceConfigurationsInternal -Configuration $Configuration
        $discoveredData.DeviceCompliancePolicies = Get-IntuneDeviceCompliancePoliciesInternal -Configuration $Configuration
        $discoveredData.ManagedApps = Get-IntuneManagedAppsInternal -Configuration $Configuration
        $discoveredData.AppProtectionPolicies = Get-IntuneAppProtectionPoliciesInternal -Configuration $Configuration
        $discoveredData.EnrollmentRestrictions = Get-IntuneEnrollmentRestrictionsInternal -Configuration $Configuration

    } catch {
        Write-MandALog "Critical error during Intune Discovery: $($_.Exception.Message)" -Level "ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) {
        Write-MandALog "--- Intune Discovery Completed Successfully ---" -Level "SUCCESS"
    } else {
        Write-MandALog "--- Intune Discovery Completed With Errors ---" -Level "ERROR"
    }
    
    return $discoveredData
}

# Helper function for logging
function Write-MandALog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue -CommandType Function) {
        & Write-MandALog $Message -Level $Level
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "White" }
            "HEADER" { "Cyan" }
            default { "Gray" }
        }
        Write-Host "[IntuneDiscovery] $Message" -ForegroundColor $color
    }
}

function Export-DataToCSV {
    param($Data, $FileName, $OutputPath)
    
    if (Get-Command Export-DataToCSV -ErrorAction SilentlyContinue -CommandType Function) {
        & Export-DataToCSV -Data $Data -FileName $FileName -OutputPath $OutputPath
    } else {
        $filePath = Join-Path $OutputPath $FileName
        $Data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
    }
}

Export-ModuleMember -Function Invoke-IntuneDiscovery
