#Requires -Version 5.1
#Requires -Modules Microsoft.Graph.DeviceManagement, Microsoft.Graph.Beta.DeviceManagement, Microsoft.Graph.Beta.Users.Actions, Microsoft.Graph.Users.Actions 
# Microsoft.Graph.Beta.Users.Actions for Get-MgBetaUserManagedDevice, Microsoft.Graph.Users.Actions for Get-MgUserManagedDevice
<#
.SYNOPSIS
    M&A Discovery Suite - Intune Discovery Module (Comprehensive)
.DESCRIPTION
    Discovers a wide range of Intune information using Microsoft Graph API, including
    managed devices, compliance policies, configuration profiles, mobile applications,
    enrollment restrictions, terms and conditions, and more.
.NOTES
    Version: 1.1.0 (Comprehensive Update)
    Author: Lukian Poleschtschuk
    Inspired by AzureHound data points related to device management and Intune configurations.
    Ensure Graph connection is established and has necessary permissions like:
    DeviceManagementManagedDevices.Read.All, DeviceManagementConfiguration.Read.All,
    DeviceManagementApps.Read.All, DeviceManagementServiceConfig.Read.All,
    Policy.Read.All (for some settings).
    Using Beta endpoints for richer data where appropriate.
#>

[CmdletBinding()]
param()

# Main function to invoke Intune discovery
function Invoke-IntuneDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Comprehensive Intune Discovery via Microsoft Graph" -Level "HEADER"
    $script:ExecutionMetrics.Phase = "Discovery - Intune (Comprehensive)"

    $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
    if (-not (Test-Path $outputPath)) {
        New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
    }

    $graphContext = Get-MgContext -ErrorAction SilentlyContinue
    if (-not $graphContext) {
        Write-MandALog "Not connected to Microsoft Graph. Skipping Intune Discovery." -Level "WARN"
        return $null
    }
    Write-MandALog "Connected to Microsoft Graph for Intune Discovery. Tenant: $($graphContext.TenantId)" -Level "INFO"

    $allIntuneData = @{
        ManagedDevices = [System.Collections.Generic.List[object]]::new();
        DetectedApps = [System.Collections.Generic.List[object]]::new(); # Apps detected on devices
        DeviceCompliancePolicies = [System.Collections.Generic.List[object]]::new();
        DeviceCompliancePolicyAssignments = [System.Collections.Generic.List[object]]::new();
        DeviceConfigurationProfiles = [System.Collections.Generic.List[object]]::new();
        DeviceConfigurationProfileAssignments = [System.Collections.Generic.List[object]]::new();
        MobileApps = [System.Collections.Generic.List[object]]::new(); # Catalog apps
        MobileAppAssignments = [System.Collections.Generic.List[object]]::new();
        DeviceEnrollmentConfigurations = [System.Collections.Generic.List[object]]::new(); # e.g. platform restrictions
        TermsAndConditions = [System.Collections.Generic.List[object]]::new();
        TermsAndConditionsAssignments = [System.Collections.Generic.List[object]]::new();
        AutopilotProfiles = [System.Collections.Generic.List[object]]::new();
        # Add more Intune object types as needed: App Protection Policies, etc.
    }
    
    $totalStepsEstimate = 10 # Rough estimate for major categories
    Initialize-ProgressTracker -Phase "IntuneDiscovery" -TotalSteps $totalStepsEstimate 
    $currentStep = 0

    # 1. Discover Managed Devices (and their detected apps)
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Intune Managed Devices & Detected Apps"
    try {
        $devices = Get-MgBetaDeviceManagementManagedDevice -All -ErrorAction SilentlyContinue -Property "deviceName,id,userId,userPrincipalName,manufacturer,model,serialNumber,osVersion,complianceState,managementAgent,lastSyncDateTime,enrolledDateTime,deviceOwnership,operatingSystem,ethernetMacAddress,imei,meid,isEncrypted,isSupervised,azureADRegistered,deviceCategoryDisplayName,managementState,partnerReportedThreatState" -ExpandProperty "detectedApps"
        if ($devices) {
            $devices | ForEach-Object {
                $allIntuneData.ManagedDevices.Add([PSCustomObject]@{
                    DeviceId = $_.Id; DeviceName = $_.DeviceName; UserId = $_.UserId; UserPrincipalName = $_.UserPrincipalName; Manufacturer = $_.Manufacturer; Model = $_.Model; SerialNumber = $_.SerialNumber;
                    OS = $_.OperatingSystem; OSVersion = $_.OSVersion; ComplianceState = $_.ComplianceState; ManagementAgent = $_.ManagementAgent; LastSync = $_.LastSyncDateTime; EnrolledDate = $_.EnrolledDateTime;
                    Ownership = $_.DeviceOwnership; EthernetMacAddress = $_.EthernetMacAddress; Imei = $_.Imei; Meid = $_.Meid; IsEncrypted = $_.IsEncrypted; IsSupervised = $_.IsSupervised;
                    AzureADRegistered = $_.AzureADRegistered; DeviceCategory = $_.DeviceCategoryDisplayName; ManagementState = $_.ManagementState; PartnerReportedThreatState = $_.PartnerReportedThreatState
                })
                # Process detected apps for this device
                if ($_.DetectedApps) {
                    $_.DetectedApps | ForEach-Object {
                        $allIntuneData.DetectedApps.Add([PSCustomObject]@{
                            ManagedDeviceId = $devices.Id # Link back to the device
                            ManagedDeviceName= $devices.DeviceName
                            AppName         = $_.DisplayName
                            AppVersion      = $_.Version
                            AppSizeInKB     = $_.SizeInKB
                            AppPlatform     = $_.Platform # If available, else infer from device
                            AppPublisher    = $_.Publisher # If available
                            AppId           = $_.Id # ID of the detected app instance
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($devices.Count) Intune managed devices." -Level "INFO"
        } else { Write-MandALog "No Intune managed devices found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Intune Managed Devices: $($_.Exception.Message)" -Level "WARN" }

    # 2. Discover Device Compliance Policies & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Compliance Policies"
    try {
        $compliancePolicies = Get-MgBetaDeviceManagementDeviceCompliancePolicy -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,platforms,technologies,roleScopeTagIds" -ExpandProperty "assignments"
        if ($compliancePolicies) {
            $compliancePolicies | ForEach-Object {
                $allIntuneData.DeviceCompliancePolicies.Add([PSCustomObject]@{
                    PolicyId = $_.Id; DisplayName = $_.DisplayName; Description = $_.Description; Version = $_.Version; CreatedDate = $_.CreatedDateTime; ModifiedDate = $_.LastModifiedDateTime;
                    Platforms = $_.Platforms; Technologies = $_.Technologies; RoleScopeTagIds = ($_.RoleScopeTagIds -join ';')
                })
                if ($_.Assignments) {
                    $_.Assignments | ForEach-Object {
                        $allIntuneData.DeviceCompliancePolicyAssignments.Add([PSCustomObject]@{
                            PolicyId = $compliancePolicies.Id; PolicyDisplayName = $compliancePolicies.DisplayName; AssignmentId = $_.Id; TargetType = $_.Target.GetType().Name; TargetDisplayName = $_.Target.DisplayName; TargetGroupId = if($_.Target.GroupId){$_.Target.GroupId}else{$null}
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($compliancePolicies.Count) device compliance policies." -Level "INFO"
        } else { Write-MandALog "No device compliance policies found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Compliance Policies: $($_.Exception.Message)" -Level "WARN" }

    # 3. Discover Device Configuration Profiles & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Configuration Profiles"
    try {
        $configProfiles = Get-MgBetaDeviceManagementDeviceConfiguration -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,platforms,technologies,roleScopeTagIds" -ExpandProperty "assignments"
        if ($configProfiles) {
            $configProfiles | ForEach-Object {
                $allIntuneData.DeviceConfigurationProfiles.Add([PSCustomObject]@{
                    ProfileId = $_.Id; DisplayName = $_.DisplayName; Description = $_.Description; Version = $_.Version; CreatedDate = $_.CreatedDateTime; ModifiedDate = $_.LastModifiedDateTime;
                    Platforms = $_.Platforms; Technologies = $_.Technologies; RoleScopeTagIds = ($_.RoleScopeTagIds -join ';')
                })
                 if ($_.Assignments) {
                    $_.Assignments | ForEach-Object {
                        $allIntuneData.DeviceConfigurationProfileAssignments.Add([PSCustomObject]@{
                            ProfileId = $configProfiles.Id; ProfileDisplayName = $configProfiles.DisplayName; AssignmentId = $_.Id; TargetType = $_.Target.GetType().Name; TargetDisplayName = $_.Target.DisplayName; TargetGroupId = if($_.Target.GroupId){$_.Target.GroupId}else{$null}
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($configProfiles.Count) device configuration profiles." -Level "INFO"
        } else { Write-MandALog "No device configuration profiles found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Configuration Profiles: $($_.Exception.Message)" -Level "WARN" }

    # 4. Discover Mobile Apps (Catalog) & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Mobile Apps (Catalog)"
    try {
        $apps = Get-MgBetaDeviceAppManagementMobileApp -All -ErrorAction SilentlyContinue -Property "id,displayName,publisher,version,isFeatured,owner,developer,informationUrl,privacyInformationUrl,publishingState,categories,assignments" -ExpandProperty "assignments, categories"
        if ($apps) {
            $apps | ForEach-Object {
                $allIntuneData.MobileApps.Add([PSCustomObject]@{
                    AppId = $_.Id; DisplayName = $_.DisplayName; Publisher = $_.Publisher; Version = $_.Version; Owner = $_.Owner; Developer = $_.Developer; PublishingState = $_.PublishingState;
                    IsFeatured = $_.IsFeatured; InfoUrl = $_.InformationUrl; PrivacyUrl = $_.PrivacyInformationUrl; ODataType = $_.'@odata.type'; Categories = ($_.Categories.DisplayName -join ';')
                })
                 if ($_.Assignments) {
                    $_.Assignments | ForEach-Object {
                        $allIntuneData.MobileAppAssignments.Add([PSCustomObject]@{
                            AppId = $apps.Id; AppDisplayName = $apps.DisplayName; AssignmentId = $_.Id; Intent = $_.Intent; TargetType = $_.Target.GetType().Name; TargetDisplayName = $_.Target.DisplayName; TargetGroupId = if($_.Target.GroupId){$_.Target.GroupId}else{$null}
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($apps.Count) mobile apps from catalog." -Level "INFO"
        } else { Write-MandALog "No mobile apps found in catalog." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Mobile Apps: $($_.Exception.Message)" -Level "WARN" }

    # 5. Discover Device Enrollment Configurations (Platform Restrictions etc.)
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Enrollment Configurations"
    try {
        $enrollmentConfigs = Get-MgBetaDeviceManagementDeviceEnrollmentConfiguration -All -ErrorAction SilentlyContinue -Property "id,displayName,priority,version,createdDateTime,lastModifiedDateTime,platformType,platformRestriction,platformRestrictionCount"
        if ($enrollmentConfigs) {
            $enrollmentConfigs | ForEach-Object {
                $allIntuneData.DeviceEnrollmentConfigurations.Add([PSCustomObject]@{
                    ConfigId = $_.Id; DisplayName = $_.DisplayName; Priority = $_.Priority; Version = $_.Version; CreatedDate = $_.CreatedDateTime; ModifiedDate = $_.LastModifiedDateTime;
                    PlatformType = $_.PlatformType; # This might need specific handling per type
                    # PlatformRestriction details are complex and vary by type, e.g. $_.PlatformRestriction.OsMinimumVersion
                    # For simplicity, just noting count or a summary.
                    PlatformRestrictionSummary = if($_.PlatformRestriction){ "Configured" } else {"Not Configured"} 
                    PlatformRestrictionCount = $_.PlatformRestrictionCount # if the property exists
                })
            }
            Write-MandALog "Discovered $($enrollmentConfigs.Count) device enrollment configurations." -Level "INFO"
        } else { Write-MandALog "No device enrollment configurations found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Enrollment Configurations: $($_.Exception.Message)" -Level "WARN" }

    # 6. Discover Terms and Conditions & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Terms and Conditions"
    try {
        $terms = Get-MgBetaDeviceManagementTermsAndCondition -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,acceptanceStatement,bodyText" -ExpandProperty "assignments"
        if ($terms) {
            $terms | ForEach-Object {
                $allIntuneData.TermsAndConditions.Add([PSCustomObject]@{
                    TermsId = $_.Id; DisplayName = $_.DisplayName; Description = $_.Description; Version = $_.Version; CreatedDate = $_.CreatedDateTime; ModifiedDate = $_.LastModifiedDateTime;
                    AcceptanceStatement = $_.AcceptanceStatement; HasBodyText = (![string]::IsNullOrWhiteSpace($_.BodyText.Content))
                })
                if ($_.Assignments) {
                    $_.Assignments | ForEach-Object {
                        $allIntuneData.TermsAndConditionsAssignments.Add([PSCustomObject]@{
                            TermsId = $terms.Id; TermsDisplayName = $terms.DisplayName; AssignmentId = $_.Id; TargetType = $_.Target.GetType().Name; TargetDisplayName = $_.Target.DisplayName; TargetGroupId = if($_.Target.GroupId){$_.Target.GroupId}else{$null}
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($terms.Count) Terms and Conditions policies." -Level "INFO"
        } else { Write-MandALog "No Terms and Conditions policies found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Terms and Conditions: $($_.Exception.Message)" -Level "WARN" }
    
    # 7. Discover Windows Autopilot Deployment Profiles (Example, requires specific permissions and module might be different)
    # Using Beta endpoint for Autopilot profiles
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Autopilot Profiles"
    try {
        # Example: Get-MgBetaDeviceManagementWindowsAutopilotDeploymentProfile -All
        # This cmdlet might be in a different specific Graph module or need specific permissions.
        # For now, this is a placeholder to show where it would go.
        # $autopilotProfiles = Get-MgBetaDeviceManagementWindowsAutopilotDeploymentProfile -All -ErrorAction SilentlyContinue
        # if ($autopilotProfiles) {
        #     $autopilotProfiles | ForEach-Object { $allIntuneData.AutopilotProfiles.Add(...) }
        #     Write-MandALog "Discovered $($autopilotProfiles.Count) Autopilot profiles." -Level "INFO"
        # } else { Write-MandALog "No Autopilot profiles found." -Level "INFO"}
         Write-MandALog "Autopilot Profile discovery is a placeholder and was skipped." -Level "INFO"
    } catch { Write-MandALog "Error discovering Autopilot Profiles (or cmdlet not found): $($_.Exception.Message)" -Level "WARN" }


    Write-Progress -Activity "IntuneDiscovery" -Completed

    foreach ($dataTypeKey in $allIntuneData.PSObject.Properties.Name) {
        $dataToExport = $allIntuneData.$dataTypeKey
        if ($dataToExport.Count -gt 0) {
            $fileName = Join-Path $outputPath "Intune$($dataTypeKey).csv"
            try {
                $dataToExport | Export-Csv -Path $fileName -NoTypeInformation -Encoding UTF8 -Append:$false # Ensure overwrite
                Write-MandALog "Exported Intune $($dataTypeKey) data to $fileName" -Level "SUCCESS"
            } catch {
                Write-MandALog "Failed to export Intune $($dataTypeKey) data to $fileName. Error: $($_.Exception.Message)" -Level "ERROR"
            }
        } else {
            Write-MandALog "No data found for Intune $($dataTypeKey) to export." -Level "INFO"
        }
    }

    Write-MandALog "Comprehensive Intune Discovery completed." -Level "SUCCESS"
    return $allIntuneData 
}

Export-ModuleMember -Function Invoke-IntuneDiscovery
