# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 2.0.0
# Created: 2025-01-18
# Last Modified: 2025-12-30

<#
.SYNOPSIS
    Licensing Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers comprehensive Microsoft 365 licensing information including:
    - Subscription/SKU inventory with utilization metrics
    - User license assignments with assignment source (Direct/Group)
    - Service plan status per user per license
    - Licensing compliance analysis

    Uses Microsoft Graph API to extract all licensing data essential for M&A
    licensing assessment, cost optimization, and user migration planning.
.NOTES
    Version: 2.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Updated: 2025-12-30 - Major enhancement: Added user license assignments, service plans, compliance analysis
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>


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

function Write-LicensingLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Licensing] $Message" -Level $Level -Component "LicensingDiscovery" -Context $Context
}

function Connect-MgGraphWithMultipleStrategies {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-LicensingLog -Level "INFO" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Context $Context

    $licensingScopes = @("Organization.Read.All", "Directory.Read.All", "User.Read.All")

    # Strategy 1: Client Secret Credential
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-LicensingLog -Level "INFO" -Message "Strategy 1: Attempting Client Secret authentication..." -Context $Context
            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
            Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop
            $mgContext = Get-MgContext
            if ($mgContext -and $mgContext.TenantId) {
                Write-LicensingLog -Level "SUCCESS" -Message "Strategy 1: Client Secret authentication successful" -Context $Context
                return $mgContext
            }
        } catch {
            Write-LicensingLog -Level "WARN" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 2: Certificate-Based Authentication
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-LicensingLog -Level "INFO" -Message "Strategy 2: Attempting Certificate authentication..." -Context $Context
            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop
            $mgContext = Get-MgContext
            if ($mgContext -and $mgContext.TenantId) {
                Write-LicensingLog -Level "SUCCESS" -Message "Strategy 2: Certificate authentication successful" -Context $Context
                return $mgContext
            }
        } catch {
            Write-LicensingLog -Level "WARN" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 3: Device Code Flow
    if ($Configuration.TenantId) {
        try {
            Write-LicensingLog -Level "INFO" -Message "Strategy 3: Attempting Device Code authentication..." -Context $Context
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $licensingScopes -UseDeviceCode -NoWelcome -ErrorAction Stop
            $mgContext = Get-MgContext
            if ($mgContext -and $mgContext.TenantId) {
                Write-LicensingLog -Level "SUCCESS" -Message "Strategy 3: Device Code authentication successful" -Context $Context
                return $mgContext
            }
        } catch {
            Write-LicensingLog -Level "WARN" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 4: Interactive Browser Authentication
    try {
        Write-LicensingLog -Level "INFO" -Message "Strategy 4: Attempting Interactive authentication..." -Context $Context
        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $licensingScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $licensingScopes -NoWelcome -ErrorAction Stop
        }
        $mgContext = Get-MgContext
        if ($mgContext -and $mgContext.TenantId) {
            Write-LicensingLog -Level "SUCCESS" -Message "Strategy 4: Interactive authentication successful" -Context $Context
            return $mgContext
        }
    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Context $Context
    }

    Write-LicensingLog -Level "ERROR" -Message "All Microsoft Graph authentication strategies exhausted" -Context $Context
    return $null
}

function Invoke-LicensingDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-LicensingLog -Level "HEADER" -Message "Starting Discovery (v1.0.1 - Direct Credential Auth)" -Context $Context
    Write-LicensingLog -Level "INFO" -Message "SessionId: $SessionId (using Configuration credentials)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('Licensing')
    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message). Using fallback PSCustomObject" -Context $Context

        $result = [PSCustomObject]@{
            PSTypeName = 'DiscoveryResult'
            Success = $true
            ModuleName = 'Licensing'
            Data = $null
            RecordCount = 0
            Errors = [System.Collections.ArrayList]::new()
            Warnings = [System.Collections.ArrayList]::new()
            Metadata = [System.Collections.Hashtable]::new()
            StartTime = Get-Date
            EndTime = $null
            ExecutionId = [guid]::NewGuid().ToString()
        }

        # Add methods to the PSObject
        $result | Add-Member -MemberType ScriptMethod -Name AddError -Value {
            param([string]$message, $exception, $context)
            $this.Success = $false
            $this.Errors.Add(@{ Message = $message; Exception = $exception; Context = $context })
        }

        $result | Add-Member -MemberType ScriptMethod -Name AddWarning -Value {
            param([string]$message, $context)
            $this.Warnings.Add(@{ Message = $message; Context = $context })
        }

        $result | Add-Member -MemberType ScriptMethod -Name Complete -Value {
            $this.EndTime = Get-Date
            $duration = $this.EndTime - $this.StartTime
            $this.Metadata["Duration"] = $duration
            $this.Metadata["DurationSeconds"] = $duration.TotalSeconds
            if ($this.Errors.Count -gt 0) {
                $this.Success = $false
            }
        }
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-LicensingLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        Ensure-Path -Path $outputPath

        # EXTRACT AND VALIDATE CREDENTIALS FROM CONFIGURATION
        Write-LicensingLog -Level "INFO" -Message "Extracting credentials from Configuration..." -Context $Context

        $TenantId = $Configuration.TenantId
        $ClientId = $Configuration.ClientId
        $ClientSecret = $Configuration.ClientSecret

        # Log detailed credential presence and masked values
        Write-LicensingLog -Level "DEBUG" -Message "Credential extraction results:" -Context $Context
        Write-LicensingLog -Level "DEBUG" -Message "  - TenantId present: $([bool]$TenantId) | Value: $(if ($TenantId) { $TenantId } else { '<MISSING>' })" -Context $Context
        Write-LicensingLog -Level "DEBUG" -Message "  - ClientId present: $([bool]$ClientId) | Value: $(if ($ClientId) { $ClientId } else { '<MISSING>' })" -Context $Context
        Write-LicensingLog -Level "DEBUG" -Message "  - ClientSecret present: $([bool]$ClientSecret) | Length: $(if ($ClientSecret) { $ClientSecret.Length } else { 0 }) chars | Masked: $(if ($ClientSecret -and $ClientSecret.Length -ge 4) { $ClientSecret.Substring(0,4) + '****' } else { '<MISSING>' })" -Context $Context

        # Validate all required credentials are present
        $missingCredentials = @()
        if (-not $TenantId) { $missingCredentials += 'TenantId' }
        if (-not $ClientId) { $missingCredentials += 'ClientId' }
        if (-not $ClientSecret) { $missingCredentials += 'ClientSecret' }

        if ($missingCredentials.Count -gt 0) {
            $errorMessage = "Missing required credentials in Configuration parameter: $($missingCredentials -join ', ')"
            $result.AddError($errorMessage, $null, @{Section="Credential Validation"})
            Write-LicensingLog -Level "ERROR" -Message $errorMessage -Context $Context
            Write-LicensingLog -Level "ERROR" -Message "Configuration parameter must include: TenantId, ClientId, and ClientSecret" -Context $Context
            Write-LicensingLog -Level "DEBUG" -Message "Available Configuration keys: $($Configuration.Keys -join ', ')" -Context $Context
            return $result
        }

        Write-LicensingLog -Level "SUCCESS" -Message "All required credentials validated successfully" -Context $Context
        Write-LicensingLog -Level "INFO" -Message "Using credentials - Tenant: $TenantId, ClientId: $ClientId" -Context $Context

        # ESTABLISH MICROSOFT GRAPH CONNECTION
        Write-LicensingLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context

        try {
            # Use multi-strategy authentication
            $mgContext = Connect-MgGraphWithMultipleStrategies -Configuration $Configuration -Context $Context

            if (-not $mgContext) {
                $result.AddError("All Microsoft Graph authentication strategies failed", $null, @{Section="Graph Connection"})
                return $result
            }

            # Verify connection
            if ($mgContext -and $mgContext.TenantId) {
                Write-LicensingLog -Level "SUCCESS" -Message "Connected to Microsoft Graph successfully. Tenant: $($mgContext.TenantId), Scopes: $($mgContext.Scopes -join ', ')" -Context $Context
                Write-LicensingLog -Level "INFO" -Message "Authentication status: Connected to tenant $($mgContext.TenantId)" -Context $Context
            } else {
                $result.AddError("Microsoft Graph connection verification failed", $null, @{Section="Graph Connection"})
                return $result
            }

        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, @{Section="Graph Connection"})
            Write-LicensingLog -Level "ERROR" -Message "Graph connection error: $($_.Exception.Message)" -Context $Context
            Write-LicensingLog -Level "DEBUG" -Message "Exception details: $($_.Exception | Out-String)" -Context $Context
            return $result
        }

        # Perform discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        $userAssignments = [System.Collections.ArrayList]::new()
        $servicePlanData = [System.Collections.ArrayList]::new()

        # Build SKU lookup table for product names
        $skuLookup = @{}

        #region Discover Subscriptions (Enhanced)
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering subscriptions..." -Context $Context
            $subscriptions = Get-MgSubscribedSku -ErrorAction Stop

            foreach ($sub in $subscriptions) {
                # Build SKU lookup for later use
                $skuLookup[$sub.SkuId] = $sub.SkuPartNumber

                # Calculate utilization
                $available = $sub.PrepaidUnits.Enabled - $sub.ConsumedUnits
                $utilizationPercent = if ($sub.PrepaidUnits.Enabled -gt 0) {
                    [math]::Round(($sub.ConsumedUnits / $sub.PrepaidUnits.Enabled) * 100, 2)
                } else { 0 }

                # Determine status
                $status = switch ($sub.CapabilityStatus) {
                    'Enabled' { 'Active' }
                    'Warning' { 'Warning' }
                    'Suspended' { 'Suspended' }
                    'LockedOut' { 'LockedOut' }
                    default { $sub.CapabilityStatus }
                }

                $subObj = [PSCustomObject]@{
                    SkuId = $sub.SkuId
                    SkuPartNumber = $sub.SkuPartNumber
                    ConsumedUnits = $sub.ConsumedUnits
                    PrepaidUnits = $sub.PrepaidUnits.Enabled
                    AvailableUnits = $available
                    UtilizationPercent = $utilizationPercent
                    SuspendedUnits = $sub.PrepaidUnits.Suspended
                    WarningUnits = $sub.PrepaidUnits.Warning
                    Status = $status
                    AppliesTo = $sub.AppliesTo
                    ServicePlanCount = @($sub.ServicePlans).Count
                    ServicePlans = ($sub.ServicePlans | ForEach-Object { "$($_.ServicePlanName):$($_.ProvisioningStatus)" }) -join ';'
                    _DataType = 'Subscription'
                }
                $null = $allDiscoveredData.Add($subObj)
            }

            Write-LicensingLog -Level "SUCCESS" -Message "Discovered $($subscriptions.Count) subscriptions" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover subscriptions: $($_.Exception.Message)", @{Section="Subscriptions"})
            Write-LicensingLog -Level "WARN" -Message "Subscription discovery failed: $($_.Exception.Message)" -Context $Context
        }
        #endregion

        #region Discover User License Assignments
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering user license assignments..." -Context $Context

            # Get all users with license-related properties
            $users = Get-MgUser -All -Property "id,displayName,userPrincipalName,assignedLicenses,assignedPlans,licenseAssignmentStates" -ErrorAction Stop

            $licensedUserCount = 0
            $totalAssignments = 0

            foreach ($user in $users) {
                if ($null -eq $user.AssignedLicenses -or $user.AssignedLicenses.Count -eq 0) {
                    continue
                }

                $licensedUserCount++

                foreach ($license in $user.AssignedLicenses) {
                    $totalAssignments++

                    # Get product name from lookup
                    $productName = if ($skuLookup.ContainsKey($license.SkuId)) {
                        $skuLookup[$license.SkuId]
                    } else {
                        $license.SkuId
                    }

                    # Determine assignment source from licenseAssignmentStates
                    $assignmentSource = 'Direct'
                    $assignedByGroup = $null
                    $lastUpdated = $null
                    $assignmentState = $null
                    $error = $null

                    if ($user.LicenseAssignmentStates) {
                        $licState = $user.LicenseAssignmentStates | Where-Object { $_.SkuId -eq $license.SkuId } | Select-Object -First 1
                        if ($licState) {
                            if ($licState.AssignedByGroup) {
                                $assignmentSource = 'Group'
                                $assignedByGroup = $licState.AssignedByGroup
                            }
                            $lastUpdated = $licState.LastUpdatedDateTime
                            $assignmentState = $licState.State
                            $error = $licState.Error
                        }
                    }

                    # Get disabled plans for this license
                    $disabledPlans = if ($license.DisabledPlans) {
                        ($license.DisabledPlans -join ';')
                    } else { '' }

                    $assignmentObj = [PSCustomObject]@{
                        UserId = $user.Id
                        UserPrincipalName = $user.UserPrincipalName
                        DisplayName = $user.DisplayName
                        SkuId = $license.SkuId
                        SkuPartNumber = $productName
                        AssignmentSource = $assignmentSource
                        AssignedByGroup = $assignedByGroup
                        DisabledPlans = $disabledPlans
                        DisabledPlanCount = @($license.DisabledPlans).Count
                        LastUpdated = $lastUpdated
                        AssignmentState = $assignmentState
                        AssignmentError = $error
                        _DataType = 'UserAssignment'
                    }
                    $null = $userAssignments.Add($assignmentObj)
                }
            }

            Write-LicensingLog -Level "SUCCESS" -Message "Discovered $totalAssignments license assignments across $licensedUserCount users" -Context $Context

        } catch {
            $result.AddWarning("Failed to discover user license assignments: $($_.Exception.Message)", @{Section="UserAssignments"})
            Write-LicensingLog -Level "WARN" -Message "User license assignment discovery failed: $($_.Exception.Message)" -Context $Context
        }
        #endregion

        #region Discover Detailed Service Plans per User
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering service plan details per user..." -Context $Context

            # Get unique licensed user IDs
            $licensedUserIds = $userAssignments | Select-Object -ExpandProperty UserId -Unique
            $servicePlanCount = 0
            $processedUsers = 0
            $totalUsers = @($licensedUserIds).Count

            foreach ($userId in $licensedUserIds) {
                $processedUsers++
                if ($processedUsers % 50 -eq 0) {
                    Write-LicensingLog -Level "INFO" -Message "Processing service plans: $processedUsers of $totalUsers users..." -Context $Context
                }

                try {
                    $licenseDetails = Get-MgUserLicenseDetail -UserId $userId -ErrorAction Stop
                    $userName = ($userAssignments | Where-Object { $_.UserId -eq $userId } | Select-Object -First 1).DisplayName
                    $userUPN = ($userAssignments | Where-Object { $_.UserId -eq $userId } | Select-Object -First 1).UserPrincipalName

                    foreach ($licDetail in $licenseDetails) {
                        foreach ($plan in $licDetail.ServicePlans) {
                            $servicePlanCount++

                            $planObj = [PSCustomObject]@{
                                UserId = $userId
                                UserPrincipalName = $userUPN
                                DisplayName = $userName
                                SkuId = $licDetail.SkuId
                                SkuPartNumber = $licDetail.SkuPartNumber
                                ServicePlanId = $plan.ServicePlanId
                                ServicePlanName = $plan.ServicePlanName
                                ProvisioningStatus = $plan.ProvisioningStatus
                                AppliesTo = $plan.AppliesTo
                                _DataType = 'ServicePlan'
                            }
                            $null = $servicePlanData.Add($planObj)
                        }
                    }
                } catch {
                    # Skip users where we can't get license details (permissions issue or deleted user)
                    Write-LicensingLog -Level "DEBUG" -Message "Could not get license details for user $userId : $($_.Exception.Message)" -Context $Context
                }
            }

            Write-LicensingLog -Level "SUCCESS" -Message "Discovered $servicePlanCount service plan entries for $processedUsers users" -Context $Context

        } catch {
            $result.AddWarning("Failed to discover service plan details: $($_.Exception.Message)", @{Section="ServicePlans"})
            Write-LicensingLog -Level "WARN" -Message "Service plan discovery failed: $($_.Exception.Message)" -Context $Context
        }
        #endregion

        # Stage data for generic export and optionally export directly
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $result.Data = @()
        $disableInternal = ($Context -is [hashtable]) -and $Context.ContainsKey('DisableInternalExport') -and $Context.DisableInternalExport

        # Helper function to add metadata and export
        function Export-DiscoveryData {
            param($DataArray, $ExportName, $DataType)

            if ($DataArray.Count -eq 0) { return }

            $DataArray | ForEach-Object {
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
            }

            # Add to standardized result for the launcher
            $result.Data += ,([PSCustomObject]@{
                Name = $ExportName
                Group = $DataArray
            })

            # Optional direct export
            if (-not $disableInternal) {
                $fileName = "$ExportName.csv"
                $filePath = Join-Path $outputPath $fileName
                $DataArray | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-LicensingLog -Level "SUCCESS" -Message "Exported $($DataArray.Count) $DataType records to $fileName" -Context $Context
            } else {
                Write-LicensingLog -Level "INFO" -Message "Internal export disabled; launcher will export $ExportName" -Context $Context
            }
        }

        # Export Subscriptions/Licenses
        Export-DiscoveryData -DataArray $allDiscoveredData -ExportName "LicensingDiscovery_Licenses" -DataType "License/Subscription"

        # Export User Assignments
        Export-DiscoveryData -DataArray $userAssignments -ExportName "LicensingDiscovery_UserAssignments" -DataType "User Assignment"

        # Export Service Plans
        Export-DiscoveryData -DataArray $servicePlanData -ExportName "LicensingDiscovery_ServicePlans" -DataType "Service Plan"

        # Calculate and export summary statistics
        $summaryData = [System.Collections.ArrayList]::new()

        # Aggregate statistics
        $totalLicenses = ($allDiscoveredData | Measure-Object -Property PrepaidUnits -Sum).Sum
        $totalAssigned = ($allDiscoveredData | Measure-Object -Property ConsumedUnits -Sum).Sum
        $totalAvailable = $totalLicenses - $totalAssigned
        $avgUtilization = if ($totalLicenses -gt 0) { [math]::Round(($totalAssigned / $totalLicenses) * 100, 2) } else { 0 }

        $licensedUsers = ($userAssignments | Select-Object -ExpandProperty UserId -Unique).Count
        $directAssignments = ($userAssignments | Where-Object { $_.AssignmentSource -eq 'Direct' }).Count
        $groupAssignments = ($userAssignments | Where-Object { $_.AssignmentSource -eq 'Group' }).Count
        $avgLicensesPerUser = if ($licensedUsers -gt 0) { [math]::Round($userAssignments.Count / $licensedUsers, 2) } else { 0 }

        $enabledServicePlans = ($servicePlanData | Where-Object { $_.ProvisioningStatus -eq 'Success' }).Count
        $disabledServicePlans = ($servicePlanData | Where-Object { $_.ProvisioningStatus -eq 'Disabled' }).Count

        $summaryObj = [PSCustomObject]@{
            TotalLicenses = $totalLicenses
            TotalAssigned = $totalAssigned
            TotalAvailable = $totalAvailable
            UtilizationPercent = $avgUtilization
            LicensedUsers = $licensedUsers
            TotalAssignments = $userAssignments.Count
            DirectAssignments = $directAssignments
            GroupBasedAssignments = $groupAssignments
            DirectAssignmentPercent = if ($userAssignments.Count -gt 0) { [math]::Round(($directAssignments / $userAssignments.Count) * 100, 2) } else { 0 }
            AvgLicensesPerUser = $avgLicensesPerUser
            TotalServicePlans = $servicePlanData.Count
            EnabledServicePlans = $enabledServicePlans
            DisabledServicePlans = $disabledServicePlans
            UniqueProducts = $allDiscoveredData.Count
            DiscoveryTimestamp = $timestamp
            _DataType = 'Summary'
        }
        $null = $summaryData.Add($summaryObj)

        Export-DiscoveryData -DataArray $summaryData -ExportName "LicensingDiscovery_Summary" -DataType "Summary"

        # Set result counts
        $totalRecords = $allDiscoveredData.Count + $userAssignments.Count + $servicePlanData.Count + 1
        $result.RecordCount = $totalRecords
        $result.Metadata["TotalRecords"] = $totalRecords
        $result.Metadata["SubscriptionCount"] = $allDiscoveredData.Count
        $result.Metadata["UserAssignmentCount"] = $userAssignments.Count
        $result.Metadata["ServicePlanCount"] = $servicePlanData.Count
        $result.Metadata["LicensedUserCount"] = $licensedUsers
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-LicensingLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

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

Export-ModuleMember -Function Invoke-LicensingDiscovery

