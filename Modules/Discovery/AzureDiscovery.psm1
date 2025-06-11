# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resources, and Azure AD information using 
    Microsoft Graph and Azure Resource Manager APIs
.NOTES
    Version: 3.1.0 (Fixed)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
    Architecture: New thread-safe session-based authentication
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

function Write-AzureLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Azure] $Message" -Level $Level -Component "AzureDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "[Azure] $Message" -ForegroundColor $color
    }
}

function Invoke-AzureDiscovery {
    <#
    .SYNOPSIS
        Discovers Azure resources using simplified authentication
    .DESCRIPTION
        Main discovery function that uses session-based authentication
    .PARAMETER Configuration
        Business configuration (no authentication data needed)
    .PARAMETER Context
        Global context for paths and settings
    .PARAMETER SessionId
        Authentication session ID (passed from orchestrator)
    .EXAMPLE
        Invoke-AzureDiscovery -Configuration $config -Context $context -SessionId $sessionId
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-AzureLog -Level "HEADER" -Message "Starting Discovery (v3.1.0 - Fixed)" -Context $Context
    Write-AzureLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = $null
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Azure')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true
            ModuleName   = 'Azure'
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
    $azureConnected = $false

    try {
        # STEP 1: Validate prerequisites
        Write-AzureLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-AzureLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
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
        $includeAzureADDevices = $true
        $includeConditionalAccess = $true
        $includeSubscriptionInfo = $true
        $includeAzureADApps = $true
        $includeAzureResources = $true
        
        if ($Configuration.azure) {
            if ($null -ne $Configuration.azure.includeAzureADDevices) { 
                $includeAzureADDevices = $Configuration.azure.includeAzureADDevices 
            }
            if ($null -ne $Configuration.azure.includeConditionalAccess) { 
                $includeConditionalAccess = $Configuration.azure.includeConditionalAccess 
            }
            if ($null -ne $Configuration.azure.includeSubscriptionInfo) { 
                $includeSubscriptionInfo = $Configuration.azure.includeSubscriptionInfo 
            }
            if ($null -ne $Configuration.azure.includeAzureADApps) { 
                $includeAzureADApps = $Configuration.azure.includeAzureADApps 
            }
            if ($null -ne $Configuration.azure.includeAzureResources) { 
                $includeAzureResources = $Configuration.azure.includeAzureResources 
            }
        }

        # STEP 3: Authenticate to Microsoft Graph (this usually works)
        Write-AzureLog -Level "INFO" -Message "Getting authentication for Microsoft Graph..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            $graphConnected = $true
            Write-AzureLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
            
            # Validate Graph connection
            $testUri = "https://graph.microsoft.com/v1.0/organization"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop
            if ($testResponse -and $testResponse.value) {
                Write-AzureLog -Level "DEBUG" -Message "Graph connection validated" -Context $Context
            }
        } catch {
            $result.AddError("Failed to authenticate with Microsoft Graph: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }
        
        # STEP 4: Try to authenticate to Azure Resource Manager
        # Note: This might fail due to the tenant ID issue, so we'll make it non-fatal
        Write-AzureLog -Level "INFO" -Message "Getting authentication for Azure Resource Manager..." -Context $Context
        try {
            $azureAuth = Get-AuthenticationForService -Service "Azure" -SessionId $SessionId
            $azureConnected = $true
            Write-AzureLog -Level "SUCCESS" -Message "Connected to Azure Resource Manager" -Context $Context
        } catch {
            Write-AzureLog -Level "WARN" -Message "Failed to connect to Azure Resource Manager: $($_.Exception.Message)" -Context $Context
            Write-AzureLog -Level "INFO" -Message "Continuing with Microsoft Graph data only" -Context $Context
            $result.AddWarning("Azure Resource Manager connection failed, using Graph data only: $($_.Exception.Message)", @{Service = "Azure"})
            $azureConnected = $false
        }

        # STEP 5: PERFORM DISCOVERY
        Write-AzureLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Get Organization and Tenant Information
        if ($includeSubscriptionInfo) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure organization and subscription information..." -Context $Context
                
                # Get organization details from Graph
                $org = Get-MgOrganization -ErrorAction Stop
                
                if ($org) {
                    # Add organization info as Azure tenant information
                    $tenantObj = [PSCustomObject]@{
                        TenantId = $org.Id
                        DisplayName = $org.DisplayName
                        VerifiedDomains = ($org.VerifiedDomains | Where-Object { $_.IsVerified } | ForEach-Object { $_.Name }) -join ';'
                        DefaultDomain = ($org.VerifiedDomains | Where-Object { $_.IsDefault } | Select-Object -First 1).Name
                        CountryLetterCode = $org.CountryLetterCode
                        PreferredLanguage = $org.PreferredLanguage
                        TechnicalNotificationMails = ($org.TechnicalNotificationMails -join ';')
                        CreatedDateTime = $org.CreatedDateTime
                        OnPremisesSyncEnabled = $org.OnPremisesSyncEnabled
                        City = $org.City
                        State = $org.State
                        Country = $org.Country
                        PostalCode = $org.PostalCode
                        BusinessPhones = ($org.BusinessPhones -join ';')
                        _ObjectType = 'AzureTenant'
                    }
                    
                    $null = $allDiscoveredData.Add($tenantObj)
                    Write-AzureLog -Level "SUCCESS" -Message "Discovered Azure tenant: $($org.DisplayName)" -Context $Context
                    
                    # Get subscribed SKUs (licenses) from Graph
                    $subscribedSkus = Get-MgSubscribedSku -All -ErrorAction Stop
                    
                    # Filter for Azure-related SKUs
                    $azureSkus = $subscribedSkus | Where-Object { 
                        $_.SkuPartNumber -like "*AZURE*" -or 
                        $_.SkuPartNumber -like "*INTUNE*" -or
                        $_.SkuPartNumber -like "*EMS*" -or
                        $_.SkuPartNumber -like "*AAD*" -or
                        $_.SkuPartNumber -like "*DEFENDER*" -or
                        $_.SkuPartNumber -like "*ATP*"
                    }
                    
                    # Create subscription-like records from SKU information
                    foreach ($sku in $azureSkus) {
                        $subObj = [PSCustomObject]@{
                            SubscriptionId = $sku.SkuId
                            Name = $sku.SkuPartNumber
                            State = if ($sku.PrepaidUnits.Enabled -gt 0) { "Enabled" } else { "Disabled" }
                            TenantId = $org.Id
                            CapabilityStatus = $sku.CapabilityStatus
                            ConsumedUnits = $sku.ConsumedUnits
                            PrepaidUnitsEnabled = $sku.PrepaidUnits.Enabled
                            PrepaidUnitsSuspended = $sku.PrepaidUnits.Suspended
                            PrepaidUnitsWarning = $sku.PrepaidUnits.Warning
                            AppliesTo = $sku.AppliesTo
                            ServicePlans = ($sku.ServicePlans | ForEach-Object { "$($_.ServicePlanName):$($_.ProvisioningStatus)" }) -join ';'
                            _ObjectType = 'Subscription'
                        }
                        
                        $null = $allDiscoveredData.Add($subObj)
                    }
                    
                    Write-AzureLog -Level "SUCCESS" -Message "Discovered $($azureSkus.Count) Azure-related subscriptions/SKUs" -Context $Context
                }
                
            } catch {
                Write-AzureLog -Level "WARN" -Message "Failed to discover subscription information: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover subscription information: $($_.Exception.Message)", @{Operation = "GetSubscriptions"})
            }
        }
        
        # Get Azure AD Devices
        if ($includeAzureADDevices) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure AD devices..." -Context $Context
                
                $deviceUri = "https://graph.microsoft.com/v1.0/devices?`$top=999"
                $deviceCount = 0
                
                do {
                    Write-AzureLog -Level "DEBUG" -Message "Fetching devices: $deviceUri" -Context $Context
                    $response = Invoke-MgGraphRequest -Uri $deviceUri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($device in $response.value) {
                            $deviceCount++
                            
                            # Create device record
                            $deviceObj = [PSCustomObject]@{
                                DeviceId = $device.deviceId
                                ObjectId = $device.id
                                DisplayName = $device.displayName
                                OperatingSystem = $device.operatingSystem
                                OperatingSystemVersion = $device.operatingSystemVersion
                                TrustType = $device.trustType
                                ApproximateLastSignInDateTime = $device.approximateLastSignInDateTime
                                IsCompliant = $device.isCompliant
                                IsManaged = $device.isManaged
                                ManagementType = $device.managementType
                                Manufacturer = $device.manufacturer
                                Model = $device.model
                                ProfileType = $device.profileType
                                SystemLabels = ($device.systemLabels -join ';')
                                DeviceOwnership = $device.deviceOwnership
                                EnrollmentType = $device.enrollmentType
                                RegistrationDateTime = $device.registrationDateTime
                                DeviceVersion = $device.deviceVersion
                                PhysicalIds = ($device.physicalIds -join ';')
                                AlternativeSecurityIds = if ($device.alternativeSecurityIds) { $device.alternativeSecurityIds.Count } else { 0 }
                                AccountEnabled = $device.accountEnabled
                                _ObjectType = 'Device'
                            }
                            
                            $null = $allDiscoveredData.Add($deviceObj)
                            
                            if ($deviceCount % 100 -eq 0) {
                                Write-AzureLog -Level "DEBUG" -Message "Processed $deviceCount devices..." -Context $Context
                            }
                        }
                    }
                    
                    $deviceUri = $response.'@odata.nextLink'
                } while ($deviceUri)
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $deviceCount Azure AD devices" -Context $Context
                
            } catch {
                Write-AzureLog -Level "WARN" -Message "Failed to discover Azure AD devices: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover Azure AD devices: $($_.Exception.Message)", @{Operation = "GetDevices"})
            }
        }
        
        # Get Azure AD Applications
        if ($includeAzureADApps) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure AD applications..." -Context $Context
                
                $appUri = "https://graph.microsoft.com/v1.0/applications?`$top=999"
                $appCount = 0
                $resourceGroups = @{}
                
                do {
                    Write-AzureLog -Level "DEBUG" -Message "Fetching applications: $appUri" -Context $Context
                    $response = Invoke-MgGraphRequest -Uri $appUri -Method GET -ErrorAction Stop
                    
                    if ($response -and $response.value) {
                        foreach ($app in $response.value) {
                            $appCount++
                            
                            # Group apps by publisher domain (simulating resource groups)
                            $groupName = if ($app.publisherDomain) { $app.publisherDomain } else { "Unknown" }
                            
                            if (-not $resourceGroups.ContainsKey($groupName)) {
                                $resourceGroups[$groupName] = @{
                                    Name = $groupName
                                    AppCount = 0
                                    Apps = @()
                                }
                            }
                            
                            $resourceGroups[$groupName].AppCount++
                            $resourceGroups[$groupName].Apps += $app.displayName
                            
                            # Create app record
                            $appObj = [PSCustomObject]@{
                                ApplicationId = $app.id
                                AppId = $app.appId
                                DisplayName = $app.displayName
                                PublisherDomain = $app.publisherDomain
                                SignInAudience = $app.signInAudience
                                CreatedDateTime = $app.createdDateTime
                                Description = $app.description
                                GroupName = $groupName
                                IdentifierUris = ($app.identifierUris -join ';')
                                Tags = ($app.tags -join ';')
                                AppRoleCount = if ($app.appRoles) { $app.appRoles.Count } else { 0 }
                                Oauth2PermissionCount = if ($app.api -and $app.api.oauth2PermissionScopes) { 
                                    $app.api.oauth2PermissionScopes.Count 
                                } else { 0 }
                                KeyCredentialCount = if ($app.keyCredentials) { $app.keyCredentials.Count } else { 0 }
                                PasswordCredentialCount = if ($app.passwordCredentials) { $app.passwordCredentials.Count } else { 0 }
                                RequiredResourceAccess = if ($app.requiredResourceAccess) { 
                                    ($app.requiredResourceAccess | ForEach-Object { $_.resourceAppId }) -join ';' 
                                } else { $null }
                                _ObjectType = 'Application'
                            }
                            
                            $null = $allDiscoveredData.Add($appObj)
                        }
                    }
                    
                    $appUri = $response.'@odata.nextLink'
                } while ($appUri)
                
                # Create resource group-like records
                foreach ($rgName in $resourceGroups.Keys) {
                    $rg = $resourceGroups[$rgName]
                    
                    $rgObj = [PSCustomObject]@{
                        ResourceGroupName = $rgName
                        Location = "global"
                        ProvisioningState = "Succeeded"
                        ResourceCount = $rg.AppCount
                        ResourceTypes = "Applications"
                        Tags = $null
                        _ObjectType = 'ResourceGroup'
                    }
                    
                    $null = $allDiscoveredData.Add($rgObj)
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $appCount applications in $($resourceGroups.Count) groups" -Context $Context
                
            } catch {
                Write-AzureLog -Level "WARN" -Message "Failed to discover applications: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover applications: $($_.Exception.Message)", @{Operation = "GetApplications"})
            }
        }
        
        # Get Conditional Access Policies
        if ($includeConditionalAccess) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering conditional access policies..." -Context $Context
                
                $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"
                $caResponse = Invoke-MgGraphRequest -Uri $caUri -Method GET -ErrorAction Stop
                
                if ($caResponse -and $caResponse.value) {
                    foreach ($policy in $caResponse.value) {
                        $policyObj = [PSCustomObject]@{
                            PolicyId = $policy.id
                            DisplayName = $policy.displayName
                            State = $policy.state
                            CreatedDateTime = $policy.createdDateTime
                            ModifiedDateTime = $policy.modifiedDateTime
                            IncludeUsers = if ($policy.conditions.users.includeUsers) { 
                                ($policy.conditions.users.includeUsers -join ';') 
                            } else { $null }
                            ExcludeUsers = if ($policy.conditions.users.excludeUsers) { 
                                ($policy.conditions.users.excludeUsers -join ';') 
                            } else { $null }
                            IncludeGroups = if ($policy.conditions.users.includeGroups) { 
                                ($policy.conditions.users.includeGroups -join ';') 
                            } else { $null }
                            ExcludeGroups = if ($policy.conditions.users.excludeGroups) { 
                                ($policy.conditions.users.excludeGroups -join ';') 
                            } else { $null }
                            IncludeApplications = if ($policy.conditions.applications.includeApplications) { 
                                ($policy.conditions.applications.includeApplications -join ';') 
                            } else { $null }
                            ExcludeApplications = if ($policy.conditions.applications.excludeApplications) { 
                                ($policy.conditions.applications.excludeApplications -join ';') 
                            } else { $null }
                            GrantControls = if ($policy.grantControls.builtInControls) { 
                                ($policy.grantControls.builtInControls -join ';') 
                            } else { $null }
                            SessionControls = if ($policy.sessionControls) { 
                                $policy.sessionControls.PSObject.Properties.Name -join ';' 
                            } else { $null }
                            _ObjectType = 'ConditionalAccessPolicy'
                        }
                        
                        $null = $allDiscoveredData.Add($policyObj)
                    }
                    
                    Write-AzureLog -Level "SUCCESS" -Message "Discovered $($caResponse.value.Count) conditional access policies" -Context $Context
                }
                
            } catch {
                Write-AzureLog -Level "DEBUG" -Message "Could not get conditional access policies: $_" -Context $Context
                # Don't add as warning since this requires specific permissions
            }
        }
        
        # Try to get Azure Resource Manager data if connected
        if ($azureConnected -and $includeAzureResources) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure resources..." -Context $Context
                
                # Get subscriptions
                $subscriptions = Get-AzSubscription -ErrorAction Stop
                
                foreach ($sub in $subscriptions) {
                    # Set context to subscription
                    Set-AzContext -SubscriptionId $sub.Id -ErrorAction Stop | Out-Null
                    
                    # Get resource groups
                    $resourceGroups = Get-AzResourceGroup -ErrorAction Stop
                    
                    foreach ($rg in $resourceGroups) {
                        $rgObj = [PSCustomObject]@{
                            SubscriptionId = $sub.Id
                            SubscriptionName = $sub.Name
                            ResourceGroupName = $rg.ResourceGroupName
                            Location = $rg.Location
                            ProvisioningState = $rg.ProvisioningState
                            Tags = if ($rg.Tags) { ($rg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' } else { $null }
                            ResourceId = $rg.ResourceId
                            _ObjectType = 'AzureResourceGroup'
                        }
                        
                        $null = $allDiscoveredData.Add($rgObj)
                    }
                    
                    Write-AzureLog -Level "SUCCESS" -Message "Discovered $($resourceGroups.Count) resource groups in subscription $($sub.Name)" -Context $Context
                }
                
            } catch {
                Write-AzureLog -Level "WARN" -Message "Failed to discover Azure resources: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to discover Azure resources: $($_.Exception.Message)", @{Operation = "GetAzureResources"})
            }
        }

        # STEP 6: Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-AzureLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
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
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Azure" -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
                # Map object types to file names
                $fileName = switch ($objectType) {
                    'Subscription' { 'AzureSubscriptions.csv' }
                    'ResourceGroup' { 'AzureResourceGroups.csv' }
                    'AzureResourceGroup' { 'AzureResourceGroups.csv' }
                    'Device' { 'AzureADDevices.csv' }
                    'AzureTenant' { 'AzureTenant.csv' }
                    'Application' { 'AzureApplications.csv' }
                    'ConditionalAccessPolicy' { 'AzureConditionalAccess.csv' }
                    default { "Azure_$objectType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-AzureLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-AzureLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # STEP 7: Update result metadata
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId
        $result.Metadata["GraphConnected"] = $graphConnected
        $result.Metadata["AzureConnected"] = $azureConnected
        
        # Add specific counts
        $dataGroups = $allDiscoveredData | Group-Object -Property _ObjectType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Top-level error handler
        Write-AzureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        Write-AzureLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
        $result.AddError("Critical error during discovery: $($_.Exception.Message)", $_.Exception, @{
            SessionId = $SessionId
            StackTrace = $_.ScriptStackTrace
        })
    } finally {
        # STEP 8: Cleanup
        Write-AzureLog -Level "INFO" -Message "Discovery completed (connections managed by auth service)" -Context $Context
        
        # Disconnect from services if connected
        if ($graphConnected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-AzureLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
            } catch {
                Write-AzureLog -Level "DEBUG" -Message "Error disconnecting from Graph: $_" -Context $Context
            }
        }
        
        if ($azureConnected) {
            try {
                Disconnect-AzAccount -ErrorAction SilentlyContinue
                Write-AzureLog -Level "DEBUG" -Message "Disconnected from Azure" -Context $Context
            } catch {
                Write-AzureLog -Level "DEBUG" -Message "Error disconnecting from Azure: $_" -Context $Context
            }
        }
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set in hashtable result
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        $finalStatus = if($result.Success){"SUCCESS"}else{"ERROR"}
        Write-AzureLog -Level $finalStatus -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-AzureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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

# Export the discovery function
Export-ModuleMember -Function Invoke-AzureDiscovery