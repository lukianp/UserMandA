<#
.SYNOPSIS
    Handles discovery of Intune (Microsoft Endpoint Manager) entities via Microsoft Graph.
.DESCRIPTION
    Discovers Intune managed devices, device configurations, compliance policies, and managed apps
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.DeviceManagement, Microsoft.Graph.Beta.DeviceManagement # DetectedApps often requires Beta




#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}


# --- Helper Functions (Assumed to be available globally) ---
# Export-DataToCSV
# Write-MandALog

# --- Private Functions ---

function Get-IntuneManagedDevicesInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Intune Managed Devices Discovery..." -Level "INFO"

    $allManagedDevices = [System.Collections.Generic.List[PSObject]]::new()

    $selectFields = $Configuration.discovery.intune.selectFields.managedDevices
    if (-not $selectFields -or $selectFields.Count -eq 0) {
        $selectFields = @("id", "deviceName", "userPrincipalName", "managedDeviceOwnerType", "operatingSystem", "osVersion", "complianceState", "lastSyncDateTime", "enrolledDateTime", "model", "manufacturer", "serialNumber", "userId", "azureADDeviceId", "managementAgent")
        Write-MandALog "Intune managedDevice selectFields not defined, using default." -Level "DEBUG"
    }
    try {
        Write-MandALog "Fetching All Intune Managed Devices with select fields: $($selectFields -join ',')." -Level "INFO"
        # Using -All for pagination. This can take time in large environments.
        $devices = Get-MgDeviceManagementManagedDevice -Select $selectFields -All -ErrorAction SilentlyContinue
        if ($devices) {
            foreach($device in $devices) {
                 $deviceProps = @{}
                foreach($field in $selectFields){
                    if ($device.PSObject.Properties[$field]) { $deviceProps[$field] = $device.PSObject.Properties[$field].Value }
                    else { $deviceProps[$field] = $null }
                }
                # Ensure common problematic fields are strings for CSV
                if ($deviceProps.ContainsKey('managedDeviceOwnerType')) { $deviceProps['managedDeviceOwnerType'] = $deviceProps['managedDeviceOwnerType'].ToString() }
                if ($deviceProps.ContainsKey('complianceState')) { $deviceProps['complianceState'] = $deviceProps['complianceState'].ToString() }
                if ($deviceProps.ContainsKey('managementAgent')) { $deviceProps['managementAgent'] = $deviceProps['managementAgent'].ToString() }

                $allManagedDevices.Add([PSCustomObject]$deviceProps)
            }

            if ($allManagedDevices.Count -gt 0) {
                Export-DataToCSV -InputObject $allManagedDevices -FileName "IntuneManagedDevices.csv" -OutputPath $outputPath
                Write-MandALog "Successfully exported $($allManagedDevices.Count) Intune Managed Devices." -Level "SUCCESS"
            } else { Write-MandALog "No Intune Managed Device objects constructed for export." -Level "INFO" }
        } else { Write-MandALog "No Intune Managed Devices found or an error occurred." -Level "WARN" }
    } catch { Write-MandALog "Error during Intune Managed Devices Discovery: $($_.Exception.Message)" -Level "ERROR" }
    return $allManagedDevices
}

function Get-IntuneDeviceSoftwareInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [System.Collections.Generic.List[PSObject]]$ManagedDevices, # Pass the list of devices from Get-IntuneManagedDevicesInternal
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "Starting Intune Device Software Inventory..." -Level "INFO"
   
    $allDeviceSoftware = [System.Collections.Generic.List[PSObject]]::new()

    if (-not $ManagedDevices -or $ManagedDevices.Count -eq 0) {
        Write-MandALog "No managed devices provided to Get-IntuneDeviceSoftwareInternal. Skipping software inventory." -Level "WARN"
        return $allDeviceSoftware
    }

    # Detected applications endpoint is often in Beta. Ensure Beta Graph profile is selected if needed.
    # Example: Select-MgProfile -Name "beta" before these calls if not already set globally by ConnectionManager.
    # Or use Get-MgBetaDeviceManagementManagedDeviceDetectedApp
    # For simplicity, this example assumes the correct profile is active or the v1.0 endpoint supports it sufficiently.

    $totalDevices = $ManagedDevices.Count
    $currentDeviceNum = 0
    Write-MandALog "Retrieving software for $totalDevices devices. This may take a significant amount of time." -Level "INFO"

    foreach ($device in $ManagedDevices) {
        $currentDeviceNum++
        Write-MandALog "Processing device ($currentDeviceNum/$totalDevices): $($device.deviceName) (ID: $($device.id)) for software inventory." -Level "DEBUG"
        try {
            # The endpoint for detectedApps might require Beta profile.
            # Using Get-MgDeviceManagementManagedDeviceDetectedApp or Get-MgBetaDeviceManagementManagedDeviceDetectedApp
            # For detected apps, you usually need to expand the 'detectedApps' navigation property or query it directly.
            # Get-MgDeviceManagementManagedDevice -ManagedDeviceId $device.Id -ExpandProperty detectedApps # Less efficient
            
            # More direct way:
            $detectedApps = Get-MgDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.Id -All -ErrorAction SilentlyContinue
            # If issues with v1.0, try beta explicitly:
            # $detectedApps = Get-MgBetaDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.Id -All -ErrorAction SilentlyContinue

            if ($detectedApps) {
                foreach ($app in $detectedApps) {
                    $allDeviceSoftware.Add([PSCustomObject]@{
                        ManagedDeviceId     = $device.id
                        DeviceName          = $device.deviceName
                        SoftwareDisplayName = $app.DisplayName
                        SoftwareVersion     = $app.Version
                        Publisher           = $app.Publisher # May not always be available
                        Platform            = $app.Platform # May not always be available
                        SizeInKB            = $app.SizeInKB
                        DetectedAppId       = $app.Id # ID of the detected app entry
                    })
                }
                Write-MandALog "Found $($detectedApps.Count) detected applications for device '$($device.deviceName)'." -Level "DEBUG"
            } else {
                 Write-MandALog "No detected applications found for device '$($device.deviceName)' or error retrieving them." -Level "VERBOSE"
            }
        } catch {
            Write-MandALog "Error retrieving software for device '$($device.deviceName)' (ID: $($device.id)): $($_.Exception.Message)" -Level "WARN"
        }
        # Optional: Add a small delay to avoid hitting throttling limits if processing many devices quickly
        # Start-Sleep -Milliseconds 200
    }

    if ($allDeviceSoftware.Count -gt 0) {
       Export-DataToCSV -Data $allGraphUsers -FileName  "IntuneDeviceSoftware.csv" -OutputPath $outputPath
        Write-MandALog "Successfully exported $($allDeviceSoftware.Count) detected software entries from all processed devices." -Level "SUCCESS"
    } else {
        Write-MandALog "No device software inventoried across all devices or export was not possible." -Level "INFO"
    }
    return $allDeviceSoftware
}


# Placeholder for other Intune discovery functions:
function Get-IntuneDeviceConfigurationsInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    Write-MandALog "Intune Device Configurations Discovery (Placeholder - Not Implemented)" -Level "INFO"
    # Example: Get-MgDeviceManagementDeviceConfiguration -All | Select Id, DisplayName, Version, Platform, LastModifiedDateTime
    return [System.Collections.Generic.List[PSObject]]::new()
}

function Get-IntuneDeviceCompliancePoliciesInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    Write-MandALog "Intune Device Compliance Policies Discovery (Placeholder - Not Implemented)" -Level "INFO"
    # Example: Get-MgDeviceManagementDeviceCompliancePolicy -All | Select Id, DisplayName, Version, Platform, LastModifiedDateTime, ScheduledActionsForRule
    return [System.Collections.Generic.List[PSObject]]::new()
}

function Get-IntuneManagedAppsInternal {
    [CmdletBinding()]
    param([Parameter(Mandatory=$true)][hashtable]$Configuration)
    Write-MandALog "Intune Managed Apps Discovery (Placeholder - Not Implemented)" -Level "INFO"
    # Example: Get-MgDeviceAppManagementMobileApp -All | Select Id, DisplayName, Publisher, Version, PublishingState
    return [System.Collections.Generic.List[PSObject]]::new()
}

# --- Public Function (Exported) ---
function Invoke-IntuneDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    Write-MandALog "--- Starting Comprehensive Intune Discovery via Microsoft Graph ---" -Level "HEADER"
    $overallStatus = $true
    $discoveredData = @{}

    try {
        Get-MgContext -ErrorAction Stop | Out-Null
        Write-MandALog "Graph context active for Intune discovery." -Level "INFO"
    } catch {
        Write-MandALog "Graph not connected. Skipping Intune Discovery. Error: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
    
    if ($script:ExecutionMetrics -is [hashtable]) {
        $script:ExecutionMetrics.Phase = "Intune Discovery"
    }

    try {
        $managedDevices = Get-IntuneManagedDevicesInternal -Configuration $Configuration
        $discoveredData.ManagedDevices = $managedDevices
        
        # Get software inventory if devices were found
        if ($managedDevices -and $managedDevices.Count -gt 0) {
            # Check configuration if user wants to collect software inventory (can be intensive)
            $collectSoftwareFlag = $true # Default to true
            if ($Configuration.discovery.intune -and $Configuration.discovery.intune.ContainsKey('collectDeviceSoftware')) {
                 try { $collectSoftwareFlag = [System.Convert]::ToBoolean($Configuration.discovery.intune.collectDeviceSoftware) }
                 catch { Write-MandALog "Invalid boolean value for 'collectDeviceSoftware' in config. Defaulting to true." -Level "WARN"}
            }
            if($collectSoftwareFlag){
                $discoveredData.DeviceSoftware = Get-IntuneDeviceSoftwareInternal -ManagedDevices $managedDevices -Configuration $Configuration
            } else {
                 Write-MandALog "Skipping Intune device software inventory as per configuration (discovery.intune.collectDeviceSoftware is false or not set)." -Level "INFO"
            }
        } else {
            Write-MandALog "No managed devices found, skipping device software inventory." -Level "INFO"
        }

        $discoveredData.DeviceConfigurations = Get-IntuneDeviceConfigurationsInternal -Configuration $Configuration
        $discoveredData.DeviceCompliancePolicies = Get-IntuneDeviceCompliancePoliciesInternal -Configuration $Configuration
        $discoveredData.ManagedApps = Get-IntuneManagedAppsInternal -Configuration $Configuration

    } catch {
        Write-MandALog "An error occurred during the Intune Discovery Phase: $($_.Exception.Message)" -Level "ERROR"
        $overallStatus = $false
    }

    if ($overallStatus) { Write-MandALog "--- Intune Discovery Phase Completed Successfully ---" -Level "SUCCESS" }
    else { Write-MandALog "--- Intune Discovery Phase Completed With Errors ---" -Level "ERROR" }
    
    return $discoveredData
}
Export-ModuleMember -Function Invoke-IntuneDiscovery
