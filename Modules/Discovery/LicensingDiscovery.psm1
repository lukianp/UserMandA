# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Licensing
# Description: Discovers Microsoft 365 license inventory, assignments, costs, 
#              and compliance for comprehensive license analysis.
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

# --- Main Discovery Function ---

function Invoke-LicensingDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-LicensingLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    $result = $null
    $isHashtableResult = $false
    
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Licensing')
    } else {
        # Fallback to hashtable
        $isHashtableResult = $true
        $result = @{
            Success      = $true
            ModuleName   = 'Licensing'
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
        Write-LicensingLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-LicensingLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # No specific configuration needed for licensing

        # 4. AUTHENTICATE & CONNECT
        Write-LicensingLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-LicensingLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-LicensingLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        $graphConnected = $false
        try {
            Write-LicensingLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            
            # Check if already connected
            $currentContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($currentContext -and $currentContext.Account -and $currentContext.ClientId -eq $authInfo.ClientId) {
                Write-LicensingLog -Level "DEBUG" -Message "Using existing Graph session" -Context $Context
                $graphConnected = $true
            } else {
                if ($currentContext) {
                    Write-LicensingLog -Level "DEBUG" -Message "Disconnecting existing Graph session" -Context $Context
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                }
                
                # Create PSCredential object from ClientId and SecureString
                $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
                
                # CRITICAL FIX: Use proper credential object for Connect-MgGraph
                $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
                
                # Connect using the PSCredential object (not SecureString directly)
                Connect-MgGraph -ClientSecretCredential $clientCredential `
                                -TenantId $authInfo.TenantId `
                                -NoWelcome -ErrorAction Stop
                
                Write-LicensingLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
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

        # Test licensing permissions
        try {
            Write-LicensingLog -Level "INFO" -Message "Testing licensing permissions..." -Context $Context
            
            # Try to get organization info first (requires Organization.Read.All)
            $orgInfo = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/organization" -Method GET -ErrorAction Stop
            Write-LicensingLog -Level "DEBUG" -Message "Organization access confirmed" -Context $Context
            
            # Try to get subscribed SKUs (requires Organization.Read.All or Directory.Read.All)
            $testSku = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/subscribedSkus?`$top=1" -Method GET -ErrorAction Stop
            Write-LicensingLog -Level "SUCCESS" -Message "License SKU access confirmed" -Context $Context
            
        } catch {
            $errorMessage = $_.Exception.Message
            
            # Provide specific guidance based on the error
            if ($errorMessage -like "*Insufficient privileges*" -or $errorMessage -like "*Authorization_RequestDenied*") {
                $result.AddError(
                    "Insufficient permissions to read license information. Required permissions: Organization.Read.All or Directory.Read.All", 
                    $_.Exception, 
                    @{
                        RequiredPermissions = @("Organization.Read.All", "Directory.Read.All")
                        CurrentError = $errorMessage
                        Resolution = "Grant the application one of the required permissions in Azure AD"
                    }
                )
            } else {
                $result.AddError("Failed to access license information: $errorMessage", $_.Exception, $null)
            }
            
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-LicensingLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get License SKUs
        $skus = @()
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering license SKUs..." -Context $Context
            
            $uri = "https://graph.microsoft.com/v1.0/subscribedSkus"
            $response = Invoke-MgGraphRequest -Uri $uri -Method GET
            
            if ($response.value) {
                foreach ($sku in $response.value) {
                    $totalLicenses = $sku.prepaidUnits.enabled + $sku.prepaidUnits.warning + $sku.prepaidUnits.suspended
                    $usagePercentage = if ($totalLicenses -gt 0) {
                        [math]::Round(($sku.consumedUnits / $totalLicenses) * 100, 2)
                    } else { 0 }
                    
                    $servicePlans = $sku.servicePlans | ForEach-Object {
                        "$($_.servicePlanName):$($_.provisioningStatus)"
                    }
                    
                    $skuObj = [PSCustomObject]@{
                        SkuId = $sku.skuId
                        SkuPartNumber = $sku.skuPartNumber
                        DisplayName = Get-FriendlyLicenseName -SkuPartNumber $sku.skuPartNumber
                        CapabilityStatus = $sku.capabilityStatus
                        AppliesTo = $sku.appliesTo
                        TotalLicenses = $totalLicenses
                        EnabledLicenses = $sku.prepaidUnits.enabled
                        WarningLicenses = $sku.prepaidUnits.warning
                        SuspendedLicenses = $sku.prepaidUnits.suspended
                        ConsumedLicenses = $sku.consumedUnits
                        AvailableLicenses = $sku.prepaidUnits.enabled - $sku.consumedUnits
                        UsagePercentage = $usagePercentage
                        ServicePlanCount = $sku.servicePlans.Count
                        ServicePlans = ($servicePlans -join ";")
                        _ObjectType = 'LicenseSKU'
                    }
                    
                    $skus += $skuObj
                    $null = $allDiscoveredData.Add($skuObj)
                }
                
                Write-LicensingLog -Level "SUCCESS" -Message "Discovered $($skus.Count) license SKUs" -Context $Context
                
                if ($isHashtableResult) {
                    $result.Metadata["LicenseSKUCount"] = $skus.Count
                } else {
                    $result.Metadata["LicenseSKUCount"] = $skus.Count
                }
            }
            
        } catch {
            $result.AddWarning("Failed to discover license SKUs: $($_.Exception.Message)", @{Operation = "GetLicenseSKUs"})
        }
        
        # Get User License Assignments
        if ($skus.Count -gt 0) {
            try {
                Write-LicensingLog -Level "INFO" -Message "Discovering user license assignments..." -Context $Context
                
                # Get licensed users with pagination
                $userLicenseCount = 0
                $nextLink = $null
                
                do {
                    if ($nextLink) {
                        $response = Invoke-MgGraphRequest -Uri $nextLink -Method GET
                    } else {
                        # Use Graph API directly for better control
                        $uri = "https://graph.microsoft.com/v1.0/users?`$filter=assignedLicenses/`$count ne 0&`$count=true&`$top=999&`$select=id,userPrincipalName,displayName,department,usageLocation,accountEnabled,assignedLicenses,createdDateTime"
                        $headers = @{ 'ConsistencyLevel' = 'eventual' }
                        $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers
                    }
                    
                    if ($response.value) {
                        foreach ($user in $response.value) {
                            foreach ($license in $user.assignedLicenses) {
                                $assignmentObj = [PSCustomObject]@{
                                    UserId = $user.id
                                    UserPrincipalName = $user.userPrincipalName
                                    DisplayName = $user.displayName
                                    Department = $user.department
                                    UsageLocation = $user.usageLocation
                                    AccountEnabled = $user.accountEnabled
                                    LicenseSkuId = $license.skuId
                                    DisabledPlansCount = if ($license.disabledPlans) { $license.disabledPlans.Count } else { 0 }
                                    AssignmentDate = $user.createdDateTime
                                    _ObjectType = 'UserLicenseAssignment'
                                }
                                
                                $null = $allDiscoveredData.Add($assignmentObj)
                                $userLicenseCount++
                            }
                        }
                    }
                    
                    $nextLink = $response.'@odata.nextLink'
                    
                    # Progress reporting
                    if ($userLicenseCount % 1000 -eq 0 -and $userLicenseCount -gt 0) {
                        Write-LicensingLog -Level "DEBUG" -Message "Processed $userLicenseCount license assignments..." -Context $Context
                    }
                    
                } while ($nextLink)
                
                Write-LicensingLog -Level "SUCCESS" -Message "Discovered $userLicenseCount user license assignments" -Context $Context
                
                if ($isHashtableResult) {
                    $result.Metadata["UserLicenseAssignmentCount"] = $userLicenseCount
                } else {
                    $result.Metadata["UserLicenseAssignmentCount"] = $userLicenseCount
                }
                
            } catch {
                $result.AddWarning("Failed to discover user license assignments: $($_.Exception.Message)", @{Operation = "GetUserLicenseAssignments"})
            }
            
            # Calculate License Costs
            try {
                Write-LicensingLog -Level "INFO" -Message "Calculating license costs..." -Context $Context
                
                $totalAnnualCost = 0
                $totalUnusedCost = 0
                
                foreach ($sku in $skus) {
                    $estimatedMonthlyPrice = Get-EstimatedLicensePrice -SkuPartNumber $sku.SkuPartNumber
                    $monthlyCost = $estimatedMonthlyPrice * $sku.ConsumedLicenses
                    $annualCost = $monthlyCost * 12
                    $unusedMonthlyCost = $estimatedMonthlyPrice * $sku.AvailableLicenses
                    $unusedAnnualCost = $unusedMonthlyCost * 12
                    
                    $totalAnnualCost += $annualCost
                    $totalUnusedCost += $unusedAnnualCost
                    
                    $costObj = [PSCustomObject]@{
                        SkuPartNumber = $sku.SkuPartNumber
                        DisplayName = $sku.DisplayName
                        EstimatedPricePerLicense = $estimatedMonthlyPrice
                        ConsumedLicenses = $sku.ConsumedLicenses
                        AvailableLicenses = $sku.AvailableLicenses
                        TotalLicenses = $sku.TotalLicenses
                        MonthlyCost = [math]::Round($monthlyCost, 2)
                        AnnualCost = [math]::Round($annualCost, 2)
                        UnusedMonthlyCost = [math]::Round($unusedMonthlyCost, 2)
                        UnusedAnnualCost = [math]::Round($unusedAnnualCost, 2)
                        CostEfficiency = $sku.UsagePercentage
                        Currency = "USD"
                        PriceNote = "Estimated based on public list prices"
                        _ObjectType = 'LicenseCostAnalysis'
                    }
                    
                    $null = $allDiscoveredData.Add($costObj)
                }
                
                Write-LicensingLog -Level "SUCCESS" -Message "Calculated costs for $($skus.Count) SKUs" -Context $Context
                Write-LicensingLog -Level "INFO" -Message "Total annual cost: $([math]::Round($totalAnnualCost, 2)) USD" -Context $Context
                Write-LicensingLog -Level "WARN" -Message "Total unused annual cost: $([math]::Round($totalUnusedCost, 2)) USD" -Context $Context
                
                if ($isHashtableResult) {
                    $result.Metadata["TotalAnnualCostUSD"] = [math]::Round($totalAnnualCost, 2)
                    $result.Metadata["TotalUnusedAnnualCostUSD"] = [math]::Round($totalUnusedCost, 2)
                } else {
                    $result.Metadata["TotalAnnualCostUSD"] = [math]::Round($totalAnnualCost, 2)
                    $result.Metadata["TotalUnusedAnnualCostUSD"] = [math]::Round($totalUnusedCost, 2)
                }
                
            } catch {
                $result.AddWarning("Failed to calculate license costs: $($_.Exception.Message)", @{Operation = "CalculateCosts"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-LicensingLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
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
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    $obj
                }
                
                # Map object types to file names (MUST match orchestrator expectations)
                $fileName = switch ($objectType) {
                    'LicenseSKU' { 'LicenseSKUs.csv' }
                    'UserLicenseAssignment' { 'UserLicenseAssignments.csv' }
                    'LicenseCostAnalysis' { 'LicenseCostAnalysis.csv' }
                    default { "Licensing_$objectType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-LicensingLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-LicensingLog -Level "WARN" -Message "No data discovered to export" -Context $Context
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
        Write-LicensingLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-LicensingLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph only if we connected
        if ($graphConnected) {
            try {
                $mgContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($mgContext) {
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                    Write-LicensingLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
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
        Write-LicensingLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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

function Get-FriendlyLicenseName {
    param([string]$SkuPartNumber)
    
    $licenseNames = @{
        "AAD_PREMIUM" = "Azure Active Directory Premium P1"
        "AAD_PREMIUM_P2" = "Azure Active Directory Premium P2"
        "ENTERPRISEPACK" = "Office 365 E3"
        "ENTERPRISEPREMIUM" = "Office 365 E5"
        "SPE_E3" = "Microsoft 365 E3"
        "SPE_E5" = "Microsoft 365 E5"
        "SPB" = "Microsoft 365 Business Premium"
        "O365_BUSINESS_PREMIUM" = "Microsoft 365 Business Standard"
        "O365_BUSINESS_ESSENTIALS" = "Microsoft 365 Business Basic"
        "DESKLESSPACK" = "Office 365 F3"
        "SPE_F1" = "Microsoft 365 F3"
        "EXCHANGESTANDARD" = "Exchange Online Plan 1"
        "EXCHANGEENTERPRISE" = "Exchange Online Plan 2"
        "PROJECTPROFESSIONAL" = "Project Plan 3"
        "PROJECTPREMIUM" = "Project Plan 5"
        "VISIOCLIENT" = "Visio Plan 2"
        "POWER_BI_PRO" = "Power BI Pro"
        "EMS" = "Enterprise Mobility + Security E3"
        "EMSPREMIUM" = "Enterprise Mobility + Security E5"
        "ATP_ENTERPRISE" = "Microsoft Defender for Office 365 Plan 1"
        "THREAT_INTELLIGENCE" = "Microsoft Defender for Office 365 Plan 2"
    }
    
    return if ($licenseNames.ContainsKey($SkuPartNumber)) { $licenseNames[$SkuPartNumber] } else { $SkuPartNumber }
}

function Get-EstimatedLicensePrice {
    param([string]$SkuPartNumber)
    
    # Estimated monthly prices in USD (public list prices as of 2024)
    $prices = @{
        "AAD_PREMIUM" = 6.00
        "AAD_PREMIUM_P2" = 9.00
        "ENTERPRISEPACK" = 23.00
        "ENTERPRISEPREMIUM" = 38.00
        "SPE_E3" = 36.00
        "SPE_E5" = 57.00
        "SPB" = 22.00
        "O365_BUSINESS_PREMIUM" = 12.50
        "O365_BUSINESS_ESSENTIALS" = 6.00
        "DESKLESSPACK" = 10.00
        "SPE_F1" = 10.00
        "EXCHANGESTANDARD" = 4.00
        "EXCHANGEENTERPRISE" = 8.00
        "PROJECTPROFESSIONAL" = 30.00
        "PROJECTPREMIUM" = 55.00
        "VISIOCLIENT" = 15.00
        "POWER_BI_PRO" = 10.00
        "EMS" = 10.30
        "EMSPREMIUM" = 16.40
        "ATP_ENTERPRISE" = 2.00
        "THREAT_INTELLIGENCE" = 5.00
    }
    
    return if ($prices.ContainsKey($SkuPartNumber)) { $prices[$SkuPartNumber] } else { 10.00 }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-LicensingDiscovery