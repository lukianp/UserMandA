# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Azure
# Description: Discovers Azure subscriptions and related Azure AD information using Microsoft Graph API.
# Note: Full Azure resource discovery (Resource Groups, VMs) requires Azure Resource Manager APIs,
#       which are not available through Microsoft Graph. This module discovers what's available via Graph.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add debug logging at the start
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "AzureDiscovery"

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

function Write-AzureLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Azure] $Message" -Level $Level -Component "AzureDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-AzureLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Azure')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'Azure'; RecordCount = 0;
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
        Write-AzureLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-AzureLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        $includeAzureADDevices = $true
        $includeConditionalAccess = $true
        $includeSubscriptionInfo = $true
        $includeAzureADApps = $true
        
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
        }

        # 4. AUTHENTICATE & CONNECT
        Write-AzureLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        # Reconstruct auth from thread-safe config
        if (-not $authInfo -and $Configuration._AuthContext) {
            $authInfo = $Configuration._AuthContext
            Write-AzureLog -Level "DEBUG" -Message "Using injected auth context" -Context $Context
        }
        
        if (-not $authInfo) {
            Write-AzureLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-AzureLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Azure
        Write-AzureLog -Level "INFO" -Message "Connecting to Azure..." -Context $Context

        # Always disconnect first to ensure clean state
        try {
            Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
        } catch {
            # Ignore errors
        }

        # Then connect with credentials
        try {
            $securePassword = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $securePassword)

            $connectionParams = @{
                ServicePrincipal = $true
                Credential = $credential
                Tenant = $authInfo.TenantId  # This is correct
                ErrorAction = 'Stop'
                WarningAction = 'SilentlyContinue'
            }

            $null = Connect-AzAccount @connectionParams
            
            # Verify connection
            $context = Get-AzContext -ErrorAction Stop
            if (-not $context) {
                throw "No Azure context after connection"
            }
            
            Write-AzureLog -Level "SUCCESS" -Message "Connected to Azure. Account: $($context.Account.Id), Tenant: $($context.Tenant.Id)" -Context $Context
            
        } catch {
            $errorDetails = @{
                Message = $_.Exception.Message
                Type = $_.Exception.GetType().FullName
                AuthClientId = $authInfo.ClientId.Substring(0,8) + "..."
                TenantId = $authInfo.TenantId
            }
            
            Write-AzureLog -Level "ERROR" -Message "Azure connection failed: $($errorDetails | ConvertTo-Json -Compress)" -Context $Context
            $result.AddError("Failed to connect to Azure: $($_.Exception.Message)", $_.Exception, $errorDetails)
            return $result
        }

        # Connect to Microsoft Graph
        try {
            Write-AzureLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
            
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecretCredential $clientCredential `
                            -NoWelcome -ErrorAction Stop
            
            Write-AzureLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
            
            # Verify connection
            $mgContext = Get-MgContext -ErrorAction Stop
            if (-not $mgContext) {
                throw "Failed to establish Graph context after connection"
            }
            Write-AzureLog -Level "DEBUG" -Message "Connected to tenant: $($mgContext.TenantId)" -Context $Context
            
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-AzureLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get Organization and Subscription Information
        if ($includeSubscriptionInfo) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure organization and subscription information..." -Context $Context
                
                # Get organization details which includes Azure subscription info
                $org = Get-MgOrganization -ErrorAction Stop
                
                if ($org) {
                    # Get subscribed SKUs (licenses) which can indicate Azure subscriptions
                    $subscribedSkus = Get-MgSubscribedSku -All -ErrorAction Stop
                    
                    # Filter for Azure-related SKUs
                    $azureSkus = $subscribedSkus | Where-Object { 
                        $_.SkuPartNumber -like "*AZURE*" -or 
                        $_.SkuPartNumber -like "*INTUNE*" -or
                        $_.SkuPartNumber -like "*EMS*" -or
                        $_.SkuPartNumber -like "*AAD*"
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
                            _ObjectType = 'Subscription'
                        }
                        
                        $null = $allDiscoveredData.Add($subObj)
                    }
                    
                    Write-AzureLog -Level "SUCCESS" -Message "Discovered $($azureSkus.Count) Azure-related subscriptions/SKUs" -Context $Context
                    
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
                        _ObjectType = 'AzureTenant'
                    }
                    
                    $null = $allDiscoveredData.Add($tenantObj)
                }
                
            } catch {
                $result.AddWarning("Failed to discover subscription information: $($_.Exception.Message)", @{Operation = "GetSubscriptions"})
            }
        }
        
        # Get Azure AD Devices (managed devices)
        if ($includeAzureADDevices) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure AD devices..." -Context $Context
                
                $devices = Get-MgDevice -All -ErrorAction Stop
                $deviceCount = 0
                
                foreach ($device in $devices) {
                    $deviceCount++
                    
                    # Create device record that resembles VM information
                    $deviceObj = [PSCustomObject]@{
                        DeviceId = $device.DeviceId
                        ObjectId = $device.Id
                        DisplayName = $device.DisplayName
                        OperatingSystem = $device.OperatingSystem
                        OperatingSystemVersion = $device.OperatingSystemVersion
                        TrustType = $device.TrustType
                        ApproximateLastSignInDateTime = $device.ApproximateLastSignInDateTime
                        IsCompliant = $device.IsCompliant
                        IsManaged = $device.IsManaged
                        ManagementType = $device.ManagementType
                        Manufacturer = $device.Manufacturer
                        Model = $device.Model
                        ProfileType = $device.ProfileType
                        SystemLabels = ($device.SystemLabels -join ';')
                        DeviceOwnership = $device.DeviceOwnership
                        EnrollmentType = $device.EnrollmentType
                        RegistrationDateTime = $device.RegistrationDateTime
                        DeviceVersion = $device.DeviceVersion
                        PhysicalIds = ($device.PhysicalIds -join ';')
                        AlternativeSecurityIds = if ($device.AlternativeSecurityIds) { $device.AlternativeSecurityIds.Count } else { 0 }
                        _ObjectType = 'Device'
                    }
                    
                    $null = $allDiscoveredData.Add($deviceObj)
                    
                    if ($deviceCount % 100 -eq 0) {
                        Write-AzureLog -Level "DEBUG" -Message "Processed $deviceCount devices..." -Context $Context
                    }
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $deviceCount Azure AD devices" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Azure AD devices: $($_.Exception.Message)", @{Operation = "GetDevices"})
            }
        }
        
        # Get Azure AD Applications (resource-like discovery)
        if ($includeAzureADApps) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure AD applications..." -Context $Context
                
                $apps = Get-MgApplication -All -ErrorAction Stop
                $appCount = 0
                $resourceGroups = @{}
                
                foreach ($app in $apps) {
                    $appCount++
                    
                    # Group apps by publisher domain (simulating resource groups)
                    $groupName = if ($app.PublisherDomain) { $app.PublisherDomain } else { "Unknown" }
                    
                    if (-not $resourceGroups.ContainsKey($groupName)) {
                        $resourceGroups[$groupName] = @{
                            Name = $groupName
                            AppCount = 0
                            Apps = @()
                        }
                    }
                    
                    $resourceGroups[$groupName].AppCount++
                    $resourceGroups[$groupName].Apps += $app.DisplayName
                    
                    # Create app record
                    $appObj = [PSCustomObject]@{
                        ApplicationId = $app.Id
                        AppId = $app.AppId
                        DisplayName = $app.DisplayName
                        PublisherDomain = $app.PublisherDomain
                        SignInAudience = $app.SignInAudience
                        CreatedDateTime = $app.CreatedDateTime
                        Description = $app.Description
                        GroupName = $groupName  # Simulated resource group
                        IdentifierUris = ($app.IdentifierUris -join ';')
                        Tags = ($app.Tags -join ';')
                        AppRoleCount = if ($app.AppRoles) { $app.AppRoles.Count } else { 0 }
                        Oauth2PermissionCount = if ($app.Api -and $app.Api.Oauth2PermissionScopes) { 
                            $app.Api.Oauth2PermissionScopes.Count 
                        } else { 0 }
                        KeyCredentialCount = if ($app.KeyCredentials) { $app.KeyCredentials.Count } else { 0 }
                        PasswordCredentialCount = if ($app.PasswordCredentials) { $app.PasswordCredentials.Count } else { 0 }
                        _ObjectType = 'Application'
                    }
                    
                    $null = $allDiscoveredData.Add($appObj)
                }
                
                # Create resource group-like records from publisher domains
                foreach ($rgName in $resourceGroups.Keys) {
                    $rg = $resourceGroups[$rgName]
                    
                    $rgObj = [PSCustomObject]@{
                        ResourceGroupName = $rgName
                        Location = "global"  # Azure AD is global
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
                $result.AddWarning("Failed to discover applications: $($_.Exception.Message)", @{Operation = "GetApplications"})
            }
        }
        
        # Get Conditional Access Policies (governance/compliance related)
        if ($includeConditionalAccess) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering conditional access policies..." -Context $Context
                
                $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"
                $caResponse = Invoke-MgGraphRequest -Uri $caUri -Method GET -ErrorAction Stop
                
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
                        IncludeGroups = if ($policy.conditions.users.includeGroups) { 
                            ($policy.conditions.users.includeGroups -join ';') 
                        } else { $null }
                        IncludeApplications = if ($policy.conditions.applications.includeApplications) { 
                            ($policy.conditions.applications.includeApplications -join ';') 
                        } else { $null }
                        GrantControls = if ($policy.grantControls.builtInControls) { 
                            ($policy.grantControls.builtInControls -join ';') 
                        } else { $null }
                        _ObjectType = 'ConditionalAccessPolicy'
                    }
                    
                    $null = $allDiscoveredData.Add($policyObj)
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $($caResponse.value.Count) conditional access policies" -Context $Context
                
            } catch {
                Write-AzureLog -Level "DEBUG" -Message "Could not get conditional access policies: $_" -Context $Context
            }
        }
        
        # Note about limitations
        Write-AzureLog -Level "INFO" -Message "Note: Full Azure resource discovery (Resource Groups, VMs, Storage) requires Azure Resource Manager APIs" -Context $Context
        $result.AddWarning("Limited to Azure AD and subscription data via Graph API. Use Az modules for full resource discovery.", @{Info = "APILimitation"})

        # 6. EXPORT DATA TO CSV
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
                    $obj
                }
                
                # Map object types to file names (MUST match orchestrator expectations)
                $fileName = switch ($objectType) {
                    'Subscription' { 'AzureSubscriptions.csv' }
                    'ResourceGroup' { 'AzureResourceGroups.csv' }
                    'Device' { 'AzureVirtualMachines.csv' }  # Map devices to VMs file for compatibility
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

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count  # Orchestrator specifically looks for this
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        
        # Add specific counts
        $dataGroups = $allDiscoveredData | Group-Object -Property _ObjectType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Top-level error handler
        Write-AzureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-AzureLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        Write-AzureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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
Export-ModuleMember -Function Invoke-AzureDiscovery