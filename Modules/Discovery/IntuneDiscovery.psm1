Install-Module Microsoft.Graph.Beta.DeviceAppManagement -AllowPrerelease -Force

#Requires -Version 5.1
#Requires -Modules Microsoft.Graph.DeviceManagement, Microsoft.Graph.Beta.DeviceManagement, Microsoft.Graph.Beta.Users.Actions, Microsoft.Graph.Users.Actions, Microsoft.Graph.Beta.DeviceAppManagement
# Microsoft.Graph.Beta.Users.Actions for Get-MgBetaUserManagedDevice, Microsoft.Graph.Users.Actions for Get-MgUserManagedDevice
<#
.SYNOPSIS
    M&A Discovery Suite - Intune Discovery Module (Comprehensive)
.DESCRIPTION
    Discovers a wide range of Intune information using Microsoft Graph API, including
    managed devices, compliance policies, configuration profiles, mobile applications,
    enrollment restrictions, terms and conditions, Autopilot profiles, and App Protection Policies.
.NOTES
    Version: 1.2.1 (Corrected helper function verb)
    Author: Gemini
    Inspired by AzureHound data points related to device management and Intune configurations.
    Ensure Graph connection is established and has necessary permissions like:
    DeviceManagementManagedDevices.Read.All, DeviceManagementConfiguration.Read.All,
    DeviceManagementApps.Read.All, DeviceManagementServiceConfig.Read.All, DeviceManagementRBAC.Read.All,
    Policy.Read.All (for some settings).
    Using Beta endpoints for richer data where appropriate.
#>


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
        DetectedApps = [System.Collections.Generic.List[object]]::new(); 
        DeviceCompliancePolicies = [System.Collections.Generic.List[object]]::new();
        DeviceCompliancePolicyAssignments = [System.Collections.Generic.List[object]]::new();
        DeviceConfigurationProfiles = [System.Collections.Generic.List[object]]::new();
        DeviceConfigurationProfileAssignments = [System.Collections.Generic.List[object]]::new();
        MobileApps = [System.Collections.Generic.List[object]]::new(); 
        MobileAppAssignments = [System.Collections.Generic.List[object]]::new();
        DeviceEnrollmentConfigurations = [System.Collections.Generic.List[object]]::new(); 
        TermsAndConditions = [System.Collections.Generic.List[object]]::new();
        TermsAndConditionsAssignments = [System.Collections.Generic.List[object]]::new();
        AutopilotProfiles = [System.Collections.Generic.List[object]]::new();
        AutopilotProfileAssignments = [System.Collections.Generic.List[object]]::new();
        AppProtectionPolicies = [System.Collections.Generic.List[object]]::new();
        AppProtectionPolicyAssignments = [System.Collections.Generic.List[object]]::new(); # Assignments for these are often separate calls
        RoleDefinitions = [System.Collections.Generic.List[object]]::new(); # Intune RBAC Roles
        RoleAssignments = [System.Collections.Generic.List[object]]::new(); # Intune RBAC Assignments
    }
    
    $totalStepsEstimate = 12 # Increased estimate for more categories
    Initialize-ProgressTracker -Phase "IntuneDiscovery" -TotalSteps $totalStepsEstimate 
    $currentStep = 0

    # Helper to get and structure assignment data
    function Get-IntuneObjectAssignments { # Renamed from Process-Assignments
        param(
            [Parameter(Mandatory=$true)]
            $ParentObject, 
            [Parameter(Mandatory=$true)]
            [string]$ParentIdProperty, 
            [Parameter(Mandatory=$true)]
            [string]$ParentDisplayProperty, 
            [Parameter(Mandatory=$true)]
            [string]$TargetListKeyInAllIntuneData
        )
        
        if ($ParentObject.Assignments) {
            $parentIdValue = $ParentObject.$ParentIdProperty
            $parentDisplayValue = $ParentObject.$ParentDisplayProperty

            $ParentObject.Assignments | ForEach-Object {
                $assignmentItem = $_
                $targetDisplayName = "Unknown Target"
                $targetValue = $null
                $targetODataType = $null

                if ($assignmentItem.Target) {
                    $targetODataType = $assignmentItem.Target.'@odata.type'
                    if ($assignmentItem.Target.DisplayName) { $targetDisplayName = $assignmentItem.Target.DisplayName }
                    
                    if ($assignmentItem.Target.GroupId) { 
                        $targetValue = $assignmentItem.Target.GroupId
                        # Override display name if it's a group ID and DisplayName was null
                        if ([string]::IsNullOrWhiteSpace($assignmentItem.Target.DisplayName)) {
                            $targetDisplayName = "Group: $targetValue" 
                        }
                    } elseif ($targetODataType -match "allLicensedUsersAssignmentTarget") { $targetDisplayName = "All Licensed Users"}
                    elseif ($targetODataType -match "allDevicesAssignmentTarget") { $targetDisplayName = "All Devices"}
                    # Add other specific target types if needed
                }

                $allIntuneData[$TargetListKeyInAllIntuneData].Add([PSCustomObject]@{
                    ParentId = $parentIdValue; ParentDisplayName = $parentDisplayValue; AssignmentId = $assignmentItem.Id; 
                    TargetODataType = $targetODataType; TargetDisplayName = $targetDisplayName; TargetValue = $targetValue;
                    Intent = if($assignmentItem.PSObject.Properties["Intent"] -and $null -ne $assignmentItem.Intent){$assignmentItem.Intent}else{$null}
                })
            }
        }
    }

    # 1. Discover Managed Devices (and their detected apps)
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Intune Managed Devices & Detected Apps"
    try {
        $deviceSelectProperties = "deviceName,id,userId,userPrincipalName,manufacturer,model,serialNumber,osVersion,complianceState,managementAgent,lastSyncDateTime,enrolledDateTime,deviceOwnership,operatingSystem,ethernetMacAddress,imei,meid,isEncrypted,isSupervised,azureADRegistered,deviceCategoryDisplayName,managementState,partnerReportedThreatState,notes"
        $devices = Get-MgBetaDeviceManagementManagedDevice -All -ErrorAction SilentlyContinue -Property $deviceSelectProperties -ExpandProperty "detectedApps(`$select=displayName,version,sizeInKB,platform,publisher,id)"
        
        if ($devices) {
            $devices | ForEach-Object {
                $currentDevice = $_ 
                $allIntuneData.ManagedDevices.Add([PSCustomObject]@{
                    DeviceId = $currentDevice.Id; DeviceName = $currentDevice.DeviceName; UserId = $currentDevice.UserId; UserPrincipalName = $currentDevice.UserPrincipalName; Manufacturer = $currentDevice.Manufacturer; Model = $currentDevice.Model; SerialNumber = $currentDevice.SerialNumber;
                    OS = $currentDevice.OperatingSystem; OSVersion = $currentDevice.OSVersion; ComplianceState = $currentDevice.ComplianceState; ManagementAgent = $currentDevice.ManagementAgent; LastSync = $currentDevice.LastSyncDateTime; EnrolledDate = $currentDevice.EnrolledDateTime;
                    Ownership = $currentDevice.DeviceOwnership; EthernetMacAddress = $currentDevice.EthernetMacAddress; Imei = $currentDevice.Imei; Meid = $currentDevice.Meid; IsEncrypted = $currentDevice.IsEncrypted; IsSupervised = $currentDevice.IsSupervised;
                    AzureADRegistered = $currentDevice.AzureADRegistered; DeviceCategory = $currentDevice.DeviceCategoryDisplayName; ManagementState = $currentDevice.ManagementState; PartnerReportedThreatState = $currentDevice.PartnerReportedThreatState; Notes = $currentDevice.Notes
                })
                if ($currentDevice.DetectedApps) {
                    $currentDevice.DetectedApps | ForEach-Object {
                        $detectedApp = $_
                        $allIntuneData.DetectedApps.Add([PSCustomObject]@{
                            ManagedDeviceId = $currentDevice.Id; ManagedDeviceName= $currentDevice.DeviceName; AppName = $detectedApp.DisplayName; AppVersion = $detectedApp.Version;
                            AppSizeInKB = $detectedApp.SizeInKB; AppPlatform = $detectedApp.Platform; AppPublisher = $detectedApp.Publisher; AppId = $detectedApp.Id 
                        })
                    }
                }
            }
            Write-MandALog "Discovered $($devices.Count) Intune managed devices." -Level "INFO"
        } else { Write-MandALog "No Intune managed devices found or error occurred." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Intune Managed Devices: $($_.Exception.Message)" -Level "WARN" }

    # 2. Discover Device Compliance Policies & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Compliance Policies"
    try {
        $compliancePolicies = Get-MgBetaDeviceManagementDeviceCompliancePolicy -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,platforms,technologies,roleScopeTagIds" -ExpandProperty "assignments"
        if ($compliancePolicies) {
            $compliancePolicies | ForEach-Object {
                $currentPolicy = $_ 
                $allIntuneData.DeviceCompliancePolicies.Add([PSCustomObject]@{
                    PolicyId = $currentPolicy.Id; DisplayName = $currentPolicy.DisplayName; Description = $currentPolicy.Description; Version = $currentPolicy.Version; CreatedDate = $currentPolicy.CreatedDateTime; ModifiedDate = $currentPolicy.LastModifiedDateTime;
                    Platforms = ($currentPolicy.Platforms -join ';'); Technologies = ($currentPolicy.Technologies -join ';'); RoleScopeTagIds = ($currentPolicy.RoleScopeTagIds -join ';')
                })
                Get-IntuneObjectAssignments -ParentObject $currentPolicy -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "DeviceCompliancePolicyAssignments"
            }
            Write-MandALog "Discovered $($compliancePolicies.Count) device compliance policies." -Level "INFO"
        } else { Write-MandALog "No device compliance policies found or error occurred." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Compliance Policies: $($_.Exception.Message)" -Level "WARN" }

    # 3. Discover Device Configuration Profiles & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Configuration Profiles"
    try {
        $configProfiles = Get-MgBetaDeviceManagementDeviceConfiguration -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,platforms,technologies,roleScopeTagIds" -ExpandProperty "assignments"
        if ($configProfiles) {
            $configProfiles | ForEach-Object {
                $currentProfile = $_ 
                $allIntuneData.DeviceConfigurationProfiles.Add([PSCustomObject]@{
                    ProfileId = $currentProfile.Id; DisplayName = $currentProfile.DisplayName; Description = $currentProfile.Description; Version = $currentProfile.Version; CreatedDate = $currentProfile.CreatedDateTime; ModifiedDate = $currentProfile.LastModifiedDateTime;
                    Platforms = ($currentProfile.Platforms -join ';'); Technologies = ($currentProfile.Technologies -join ';'); RoleScopeTagIds = ($currentProfile.RoleScopeTagIds -join ';')
                })
                Get-IntuneObjectAssignments -ParentObject $currentProfile -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "DeviceConfigurationProfileAssignments"
            }
            Write-MandALog "Discovered $($configProfiles.Count) device configuration profiles." -Level "INFO"
        } else { Write-MandALog "No device configuration profiles found or error occurred." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Configuration Profiles: $($_.Exception.Message)" -Level "WARN" }

    # 4. Discover Mobile Apps (Catalog) & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Mobile Apps (Catalog)"
    try {
        $apps = Get-MgBetaDeviceAppManagementMobileApp -All -ErrorAction SilentlyContinue -Property "id,displayName,publisher,version,isFeatured,owner,developer,informationUrl,privacyInformationUrl,publishingState,categories,assignments" -ExpandProperty "assignments, categories"
        if ($apps) {
            $apps | ForEach-Object {
                $currentApp = $_ 
                $allIntuneData.MobileApps.Add([PSCustomObject]@{
                    AppId = $currentApp.Id; DisplayName = $currentApp.DisplayName; Publisher = $currentApp.Publisher; Version = $currentApp.Version; Owner = $currentApp.Owner; Developer = $currentApp.Developer; PublishingState = $currentApp.PublishingState;
                    IsFeatured = $currentApp.IsFeatured; InfoUrl = $currentApp.InformationUrl; PrivacyUrl = $currentApp.PrivacyInformationUrl; ODataType = $currentApp.'@odata.type'; Categories = ($currentApp.Categories.DisplayName -join ';')
                })
                Get-IntuneObjectAssignments -ParentObject $currentApp -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "MobileAppAssignments"
            }
            Write-MandALog "Discovered $($apps.Count) mobile apps from catalog." -Level "INFO"
        } else { Write-MandALog "No mobile apps found in catalog." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Mobile Apps: $($_.Exception.Message)" -Level "WARN" }

    # 5. Discover Device Enrollment Configurations
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Device Enrollment Configurations"
    try {
        $enrollmentConfigs = Get-MgBetaDeviceManagementDeviceEnrollmentConfiguration -All -ErrorAction SilentlyContinue -Property "id,displayName,priority,version,createdDateTime,lastModifiedDateTime,platformType" 
        if ($enrollmentConfigs) {
            $enrollmentConfigs | ForEach-Object {
                $currentEnrollConfig = $_
                $allIntuneData.DeviceEnrollmentConfigurations.Add([PSCustomObject]@{
                    ConfigId = $currentEnrollConfig.Id; DisplayName = $currentEnrollConfig.DisplayName; Priority = $currentEnrollConfig.Priority; Version = $currentEnrollConfig.Version; CreatedDate = $currentEnrollConfig.CreatedDateTime; ModifiedDate = $currentEnrollConfig.LastModifiedDateTime;
                    ODataType = $currentEnrollConfig.'@odata.type'; 
                    PlatformType = if($currentEnrollConfig.AdditionalProperties.ContainsKey("platformType")) {$currentEnrollConfig.AdditionalProperties["platformType"]} else {$null}
                })
            }
            Write-MandALog "Discovered $($enrollmentConfigs.Count) device enrollment configurations (generic)." -Level "INFO"
        } else { Write-MandALog "No device enrollment configurations found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Device Enrollment Configurations: $($_.Exception.Message)" -Level "WARN" }

    # 6. Discover Terms and Conditions & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Terms and Conditions"
    try {
        $terms = Get-MgBetaDeviceManagementTermsAndCondition -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,acceptanceStatement,bodyText" -ExpandProperty "assignments"
        if ($terms) {
            $terms | ForEach-Object {
                $currentTerm = $_ 
                $allIntuneData.TermsAndConditions.Add([PSCustomObject]@{
                    TermsId = $currentTerm.Id; DisplayName = $currentTerm.DisplayName; Description = $currentTerm.Description; Version = $currentTerm.Version; CreatedDate = $currentTerm.CreatedDateTime; ModifiedDate = $currentTerm.LastModifiedDateTime;
                    AcceptanceStatement = $currentTerm.AcceptanceStatement; HasBodyText = (![string]::IsNullOrWhiteSpace($currentTerm.BodyText.Content))
                })
                Get-IntuneObjectAssignments -ParentObject $currentTerm -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "TermsAndConditionsAssignments"
            }
            Write-MandALog "Discovered $($terms.Count) Terms and Conditions policies." -Level "INFO"
        } else { Write-MandALog "No Terms and Conditions policies found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Terms and Conditions: $($_.Exception.Message)" -Level "WARN" }
    
    # 7. Discover Windows Autopilot Deployment Profiles & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Autopilot Profiles"
    try {
        $autopilotProfiles = Get-MgBetaDeviceManagementWindowsAutopilotDeploymentProfile -All -ErrorAction SilentlyContinue -Property "id,displayName,description,createdDateTime,lastModifiedDateTime,deviceNameTemplate,deviceType,enableWhiteGlove,extractHardwareHash,language,managementServiceAppId" -ExpandProperty "assignments"
        if ($autopilotProfiles) {
            $autopilotProfiles | ForEach-Object { 
                $currentAutopilotProfile = $_
                $allIntuneData.AutopilotProfiles.Add([PSCustomObject]@{
                    ProfileId = $currentAutopilotProfile.Id; DisplayName = $currentAutopilotProfile.DisplayName; Description = $currentAutopilotProfile.Description; CreatedDate = $currentAutopilotProfile.CreatedDateTime; ModifiedDate = $currentAutopilotProfile.LastModifiedDateTime;
                    DeviceNameTemplate = $currentAutopilotProfile.DeviceNameTemplate; DeviceType = $currentAutopilotProfile.DeviceType; EnableWhiteGlove = $currentAutopilotProfile.EnableWhiteGlove; ExtractHardwareHash = $currentAutopilotProfile.ExtractHardwareHash; Language = $currentAutopilotProfile.Language; ManagementServiceAppId = $currentAutopilotProfile.ManagementServiceAppId
                }) 
                Get-IntuneObjectAssignments -ParentObject $currentAutopilotProfile -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "AutopilotProfileAssignments"
            }
            Write-MandALog "Discovered $($autopilotProfiles.Count) Autopilot profiles." -Level "INFO"
        } else { Write-MandALog "No Autopilot profiles found or error occurred." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Autopilot Profiles: $($_.Exception.Message)" -Level "WARN" }

    # 8. Discover App Protection Policies (MAM) & Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering App Protection Policies"
    try {
        # iOS
        $appProtectionIOs = Get-MgBetaDeviceAppManagementIosManagedAppProtection -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,isAssigned" 
        if ($appProtectionIOs) {
            $appProtectionIOs | ForEach-Object {
                $currentAppProtect = $_
                $allIntuneData.AppProtectionPolicies.Add([PSCustomObject]@{ PolicyId = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName; Description = $currentAppProtect.Description; Version = $currentAppProtect.Version; CreatedDate = $currentAppProtect.CreatedDateTime; ModifiedDate = $currentAppProtect.LastModifiedDateTime; Platform = "iOS"; IsAssigned = $currentAppProtect.IsAssigned })
                # Assignments for App Protection Policies are retrieved differently (Get-MgDeviceAppManagementManagedAppPolicyAssignment)
                # This requires iterating through each policy and getting its assignments.
                $policyAssignments = Get-MgBetaDeviceAppManagementManagedAppPolicyAssignment -ManagedAppPolicyId $currentAppProtect.Id -ErrorAction SilentlyContinue
                if ($policyAssignments) { Process-Assignments -ParentObject @{Assignments = $policyAssignments; Id = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName} -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "AppProtectionPolicyAssignments" }

            }
            Write-MandALog "Discovered $($appProtectionIOs.Count) iOS App Protection policies." -Level "INFO"
        } else { Write-MandALog "No iOS App Protection policies found." -Level "INFO"}
        
        # Android
        $appProtectionAndroid = Get-MgBetaDeviceAppManagementAndroidManagedAppProtection -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,isAssigned"
         if ($appProtectionAndroid) {
            $appProtectionAndroid | ForEach-Object {
                $currentAppProtect = $_
                $allIntuneData.AppProtectionPolicies.Add([PSCustomObject]@{ PolicyId = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName; Description = $currentAppProtect.Description; Version = $currentAppProtect.Version; CreatedDate = $currentAppProtect.CreatedDateTime; ModifiedDate = $currentAppProtect.LastModifiedDateTime; Platform = "Android"; IsAssigned = $currentAppProtect.IsAssigned })
                $policyAssignments = Get-MgBetaDeviceAppManagementManagedAppPolicyAssignment -ManagedAppPolicyId $currentAppProtect.Id -ErrorAction SilentlyContinue
                if ($policyAssignments) { Process-Assignments -ParentObject @{Assignments = $policyAssignments; Id = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName} -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "AppProtectionPolicyAssignments" }
            }
            Write-MandALog "Discovered $($appProtectionAndroid.Count) Android App Protection policies." -Level "INFO"
        } else { Write-MandALog "No Android App Protection policies found." -Level "INFO"}

        # Windows
        $appProtectionWindows = Get-MgBetaDeviceAppManagementWindowsManagedAppProtection -All -ErrorAction SilentlyContinue -Property "id,displayName,description,version,createdDateTime,lastModifiedDateTime,isAssigned"
         if ($appProtectionWindows) {
            $appProtectionWindows | ForEach-Object {
                $currentAppProtect = $_
                $allIntuneData.AppProtectionPolicies.Add([PSCustomObject]@{ PolicyId = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName; Description = $currentAppProtect.Description; Version = $currentAppProtect.Version; CreatedDate = $currentAppProtect.CreatedDateTime; ModifiedDate = $currentAppProtect.LastModifiedDateTime; Platform = "Windows"; IsAssigned = $currentAppProtect.IsAssigned })
                $policyAssignments = Get-MgBetaDeviceAppManagementManagedAppPolicyAssignment -ManagedAppPolicyId $currentAppProtect.Id -ErrorAction SilentlyContinue
                if ($policyAssignments) { Process-Assignments -ParentObject @{Assignments = $policyAssignments; Id = $currentAppProtect.Id; DisplayName = $currentAppProtect.DisplayName} -ParentIdProperty "Id" -ParentDisplayProperty "DisplayName" -TargetListKeyInAllIntuneData "AppProtectionPolicyAssignments" }
            }
            Write-MandALog "Discovered $($appProtectionWindows.Count) Windows App Protection policies." -Level "INFO"
        } else { Write-MandALog "No Windows App Protection policies found." -Level "INFO"}

    } catch { Write-MandALog "Error discovering App Protection Policies: $($_.Exception.Message)" -Level "WARN" }

    # 9. Discover Intune RBAC Role Definitions
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Intune RBAC Role Definitions"
    try {
        $roleDefinitions = Get-MgBetaDeviceManagementRoleDefinition -All -ErrorAction SilentlyContinue -Property "id,displayName,description,isBuiltIn,rolePermissions"
        if ($roleDefinitions) {
            $roleDefinitions | ForEach-Object {
                $currentRoleDef = $_
                $allIntuneData.RoleDefinitions.Add([PSCustomObject]@{
                    RoleDefinitionId = $currentRoleDef.Id; DisplayName = $currentRoleDef.DisplayName; Description = $currentRoleDef.Description; IsBuiltIn = $currentRoleDef.IsBuiltIn;
                    PermissionsCount = if($currentRoleDef.RolePermissions){$currentRoleDef.RolePermissions.Count} else{0}
                    RolePermissionsSummary = ConvertTo-Json ($currentRoleDef.RolePermissions | Select-Object -First 5 -ExpandProperty ResourceActions DisplayName) -Compress -Depth 2
                })
            }
            Write-MandALog "Discovered $($roleDefinitions.Count) Intune RBAC Role Definitions." -Level "INFO"
        } else { Write-MandALog "No Intune RBAC Role Definitions found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Intune RBAC Role Definitions: $($_.Exception.Message)" -Level "WARN" }

    # 10. Discover Intune RBAC Role Assignments
    $currentStep++; Update-Progress -Step $currentStep -Status "Discovering Intune RBAC Role Assignments"
    try {
        # Get-MgBetaDeviceManagementRoleAssignment also needs -DeviceAndAppManagementRoleAssignmentId for specific, or -All
        $roleAssignments = Get-MgBetaDeviceManagementRoleAssignment -All -ErrorAction SilentlyContinue -Property "id,displayName,description,roleDefinitionId,scopeMembers,scopeType" 
        if ($roleAssignments) {
            $roleAssignments | ForEach-Object {
                $currentRoleAssign = $_
                $allIntuneData.RoleAssignments.Add([PSCustomObject]@{
                    RoleAssignmentId = $currentRoleAssign.Id; DisplayName = $currentRoleAssign.DisplayName; Description = $currentRoleAssign.Description; 
                    RoleDefinitionId = if ($currentRoleAssign.RoleDefinition) {$currentRoleAssign.RoleDefinition.Id} else {$null}; 
                    RoleDefinitionDisplayName = if ($currentRoleAssign.RoleDefinition) {$currentRoleAssign.RoleDefinition.DisplayName} else {$null};
                    ScopeType = $currentRoleAssign.ScopeType; 
                    ScopeMembersCount = if($currentRoleAssign.ScopeMembers){$currentRoleAssign.ScopeMembers.Count} else {0};
                    ScopeMembers = ($currentRoleAssign.ScopeMembers -join ';') # List of IDs
                })
            }
            Write-MandALog "Discovered $($roleAssignments.Count) Intune RBAC Role Assignments." -Level "INFO"
        } else { Write-MandALog "No Intune RBAC Role Assignments found." -Level "INFO"}
    } catch { Write-MandALog "Error discovering Intune RBAC Role Assignments: $($_.Exception.Message)" -Level "WARN" }


    Write-Progress -Activity "IntuneDiscovery" -Completed

    foreach ($dataTypeKey in $allIntuneData.PSObject.Properties.Name) {
        $dataToExport = $allIntuneData.$dataTypeKey
        if ($null -ne $dataToExport -and $dataToExport.Count -gt 0) {
            $fileName = Join-Path $outputPath "Intune$($dataTypeKey).csv"
            try {
                $dataToExport | Export-Csv -Path $fileName -NoTypeInformation -Encoding UTF8 -Append:$false 
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
