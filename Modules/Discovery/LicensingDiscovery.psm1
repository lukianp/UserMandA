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

    # Standardized pattern to extract credentials passed by the orchestrator
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication -and $Configuration.authentication._Credentials) { 
        return $Configuration.authentication._Credentials 
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
    # Module-specific wrapper for consistent logging component name
    # The global Write-MandALog function is guaranteed to exist
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
    # The DiscoveryResult class is loaded by the orchestrator
    # This fallback provides resilience in case the class definition fails to load
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Licensing')
    } else {
        # Fallback to a hashtable that mimics the class structure and methods
        $result = @{
            Success      = $true; ModuleName = 'Licensing'; RecordCount = 0
            Errors       = [System.Collections.ArrayList]::new(); Warnings = [System.Collections.ArrayList]::new(); Metadata = @{}
            StartTime    = Get-Date; EndTime = $null; ExecutionId = [guid]::NewGuid().ToString()
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # 3. AUTHENTICATE & CONNECT (Microsoft Graph should already be connected by orchestrator)
        if (-not (Test-LicensingPrerequisites -Context $Context)) {
            $result.AddError("Licensing prerequisites not met - Microsoft Graph connection required", $null, @{
                Component = "GraphConnection"
                Resolution = "Ensure Microsoft Graph is connected with appropriate permissions"
            })
            return $result
        }
        Write-LicensingLog -Message "Microsoft Graph connection verified" -Level "SUCCESS" -Context $Context

        # 4. PERFORM DISCOVERY
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # 4.1 Discover License SKUs
        $skus = @()
        try {
            Write-LicensingLog -Message "Discovering license SKUs..." -Level "INFO" -Context $Context
            $skus = Get-LicenseSKUsData -Configuration $Configuration -Context $Context
            Write-LicensingLog -Message "Discovered $($skus.Count) license SKUs" -Level "SUCCESS" -Context $Context
            
            if ($skus.Count -gt 0) {
                $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                $skus | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                }
                $skus | Export-Csv -Path (Join-Path $outputPath "LicenseSKUs.csv") -NoTypeInformation -Encoding UTF8
                $null = $allDiscoveredData.AddRange($skus)
                $result.Metadata['LicenseSKUCount'] = $skus.Count
            }

        } catch {
            $result.AddWarning("Failed to discover license SKUs: $($_.Exception.Message)", $_.Exception)
            Write-LicensingLog -Message "License SKU discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Only continue with dependent discoveries if we have SKUs
        if ($skus.Count -gt 0) {
            # 4.2 Discover User License Assignments
            try {
                Write-LicensingLog -Message "Discovering user license assignments..." -Level "INFO" -Context $Context
                $userLicenses = Get-UserLicenseAssignmentsData -Configuration $Configuration -Context $Context
                Write-LicensingLog -Message "Discovered $($userLicenses.Count) user license assignments" -Level "SUCCESS" -Context $Context
                
                if ($userLicenses.Count -gt 0) {
                    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    $userLicenses | ForEach-Object {
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    }
                    $userLicenses | Export-Csv -Path (Join-Path $outputPath "UserLicenseAssignments.csv") -NoTypeInformation -Encoding UTF8
                    $null = $allDiscoveredData.AddRange($userLicenses)
                    $result.Metadata['UserLicenseAssignmentCount'] = $userLicenses.Count
                }

            } catch {
                $result.AddWarning("Failed to discover user license assignments: $($_.Exception.Message)", $_.Exception)
                Write-LicensingLog -Message "User license assignment discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }

            # 4.3 Analyze Service Plan Usage
            try {
                Write-LicensingLog -Message "Analyzing service plan usage..." -Level "INFO" -Context $Context
                $servicePlans = Get-ServicePlanUsageData -Configuration $Configuration -Context $Context -SKUs $skus
                Write-LicensingLog -Message "Analyzed $($servicePlans.Count) service plans" -Level "SUCCESS" -Context $Context
                
                if ($servicePlans.Count -gt 0) {
                    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    $servicePlans | ForEach-Object {
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    }
                    $servicePlans | Export-Csv -Path (Join-Path $outputPath "ServicePlanUsage.csv") -NoTypeInformation -Encoding UTF8
                    $null = $allDiscoveredData.AddRange($servicePlans)
                    $result.Metadata['ServicePlanCount'] = $servicePlans.Count
                }

            } catch {
                $result.AddWarning("Failed to analyze service plan usage: $($_.Exception.Message)", $_.Exception)
                Write-LicensingLog -Message "Service plan analysis failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }

            # 4.4 Calculate License Costs
            try {
                Write-LicensingLog -Message "Calculating license costs..." -Level "INFO" -Context $Context
                $costAnalysis = Get-LicenseCostAnalysisData -Configuration $Configuration -Context $Context -SKUs $skus
                Write-LicensingLog -Message "Calculated costs for $($costAnalysis.Count) SKUs" -Level "SUCCESS" -Context $Context
                
                if ($costAnalysis.Count -gt 0) {
                    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    $costAnalysis | ForEach-Object {
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    }
                    $costAnalysis | Export-Csv -Path (Join-Path $outputPath "LicenseCostAnalysis.csv") -NoTypeInformation -Encoding UTF8
                    $null = $allDiscoveredData.AddRange($costAnalysis)
                    $result.Metadata['CostAnalysisRecordCount'] = $costAnalysis.Count
                    
                    # Calculate summary metrics
                    $totalAnnualCost = ($costAnalysis | Measure-Object -Property AnnualCost -Sum).Sum
                    $totalUnusedCost = ($costAnalysis | Measure-Object -Property UnusedAnnualCost -Sum).Sum
                    $result.Metadata['TotalAnnualCostUSD'] = [math]::Round($totalAnnualCost, 2)
                    $result.Metadata['TotalUnusedAnnualCostUSD'] = [math]::Round($totalUnusedCost, 2)
                    
                    Write-LicensingLog -Message "Total annual cost: $([math]::Round($totalAnnualCost, 2)) USD" -Level "INFO" -Context $Context
                    Write-LicensingLog -Message "Unused annual cost: $([math]::Round($totalUnusedCost, 2)) USD" -Level "WARN" -Context $Context
                }

            } catch {
                $result.AddWarning("Failed to calculate license costs: $($_.Exception.Message)", $_.Exception)
                Write-LicensingLog -Message "License cost calculation failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        } else {
            $result.AddWarning("No license SKUs found or accessible - dependent discoveries skipped", $null)
            Write-LicensingLog -Message "No license SKUs found - skipping dependent discoveries" -Level "WARN" -Context $Context
        }

        # 5. FINALIZE & UPDATE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        
        # Set overall success based on critical data availability
        $result.Success = ($skus.Count -gt 0)

    } catch {
        # This is the top-level catch for critical, unrecoverable errors
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
        Write-LicensingLog -Message "Critical error: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    } finally {
        # 6. CLEANUP & COMPLETE
        $stopwatch.Stop()
        $result.Complete()
        Write-LicensingLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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

function Test-LicensingPrerequisites {
    param($Context)
    
    try {
        # Check if Microsoft Graph is connected
        $mgContext = Get-MgContext -ErrorAction Stop
        if (-not $mgContext) {
            Write-LicensingLog -Message "Microsoft Graph context not found" -Level "ERROR" -Context $Context
            return $false
        }
        
        # Test licensing access by trying to get SKUs
        $null = Get-MgSubscribedSku -Top 1 -ErrorAction Stop
        Write-LicensingLog -Message "Microsoft Graph licensing access verified" -Level "SUCCESS" -Context $Context
        return $true
    } catch {
        Write-LicensingLog -Message "Prerequisites check failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $false
    }
}

function Get-LicenseSKUsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $skus = [System.Collections.ArrayList]::new()
    
    try {
        Write-LicensingLog -Message "Retrieving license SKUs..." -Level "INFO" -Context $Context
        
        $subscribedSkus = Get-MgSubscribedSku -ErrorAction Stop
        
        foreach ($sku in $subscribedSkus) {
            $totalLicenses = $sku.PrepaidUnits.Enabled + $sku.PrepaidUnits.Warning + $sku.PrepaidUnits.Suspended
            $usagePercentage = if ($totalLicenses -gt 0) {
                [math]::Round(($sku.ConsumedUnits / $totalLicenses) * 100, 2)
            } else { 0 }
            
            $servicePlans = $sku.ServicePlans | ForEach-Object {
                "$($_.ServicePlanName):$($_.ProvisioningStatus)"
            }
            
            $skuInfo = [PSCustomObject]@{
                SkuId = $sku.SkuId
                SkuPartNumber = $sku.SkuPartNumber
                DisplayName = Get-FriendlyLicenseName -SkuPartNumber $sku.SkuPartNumber
                CapabilityStatus = $sku.CapabilityStatus
                AppliesTo = $sku.AppliesTo
                TotalLicenses = $totalLicenses
                EnabledLicenses = $sku.PrepaidUnits.Enabled
                WarningLicenses = $sku.PrepaidUnits.Warning
                SuspendedLicenses = $sku.PrepaidUnits.Suspended
                ConsumedLicenses = $sku.ConsumedUnits
                AvailableLicenses = $sku.PrepaidUnits.Enabled - $sku.ConsumedUnits
                UsagePercentage = $usagePercentage
                ServicePlanCount = $sku.ServicePlans.Count
                ServicePlans = ($servicePlans -join ";")
                _DataType = 'LicenseSKUs'
            }
            
            $null = $skus.Add($skuInfo)
        }
        
        Write-LicensingLog -Message "Retrieved $($skus.Count) license SKUs" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to retrieve license SKUs: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $skus
}

function Get-UserLicenseAssignmentsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $licenseAssignments = [System.Collections.ArrayList]::new()
    
    try {
        Write-LicensingLog -Message "Retrieving user license assignments..." -Level "INFO" -Context $Context
        
        # Get all users with licenses
        $licensedUsers = Get-MgUser -All -Property Id,UserPrincipalName,DisplayName,Department,UsageLocation,AccountEnabled,AssignedLicenses,CreatedDateTime -Filter "assignedLicenses/`$count ne 0" -ConsistencyLevel eventual -CountVariable count -ErrorAction Stop
        
        Write-LicensingLog -Message "Processing $count licensed users..." -Level "INFO" -Context $Context
        
        $processedCount = 0
        foreach ($user in $licensedUsers) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-LicensingLog -Message "Processed $processedCount users..." -Level "DEBUG" -Context $Context
            }
            
            foreach ($license in $user.AssignedLicenses) {
                $assignmentInfo = [PSCustomObject]@{
                    UserId = $user.Id
                    UserPrincipalName = $user.UserPrincipalName
                    DisplayName = $user.DisplayName
                    Department = $user.Department
                    UsageLocation = $user.UsageLocation
                    AccountEnabled = $user.AccountEnabled
                    LicenseSkuId = $license.SkuId
                    DisabledPlansCount = if ($license.DisabledPlans) { $license.DisabledPlans.Count } else { 0 }
                    AssignmentDate = $user.CreatedDateTime
                    _DataType = 'UserLicenseAssignments'
                }
                
                $null = $licenseAssignments.Add($assignmentInfo)
            }
        }
        
        Write-LicensingLog -Message "Retrieved $($licenseAssignments.Count) license assignments" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to retrieve user license assignments: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $licenseAssignments
}

function Get-ServicePlanUsageData {
    param(
        [hashtable]$Configuration,
        $Context,
        $SKUs
    )
    
    $servicePlanData = [System.Collections.ArrayList]::new()
    
    try {
        Write-LicensingLog -Message "Analyzing service plan usage..." -Level "INFO" -Context $Context
        
        # Build service plan inventory from SKUs
        $servicePlanUsage = @{}
        
        foreach ($sku in $SKUs) {
            $skuDetails = Get-MgSubscribedSku | Where-Object { $_.SkuId -eq $sku.SkuId }
            
            if ($skuDetails -and $skuDetails.ServicePlans) {
                foreach ($servicePlan in $skuDetails.ServicePlans) {
                    $planKey = $servicePlan.ServicePlanId
                    
                    if (-not $servicePlanUsage.ContainsKey($planKey)) {
                        $servicePlanUsage[$planKey] = @{
                            ServicePlanId = $servicePlan.ServicePlanId
                            ServicePlanName = $servicePlan.ServicePlanName
                            FriendlyName = Get-FriendlyServicePlanName -ServicePlanName $servicePlan.ServicePlanName
                            TotalAvailable = 0
                            AppliesTo = $servicePlan.AppliesTo
                            ProvisioningStatus = $servicePlan.ProvisioningStatus
                            IncludedInSKUs = [System.Collections.ArrayList]::new()
                        }
                    }
                    
                    $servicePlanUsage[$planKey].TotalAvailable += $sku.ConsumedLicenses
                    $null = $servicePlanUsage[$planKey].IncludedInSKUs.Add($sku.SkuPartNumber)
                }
            }
        }
        
        # Convert to output format
        foreach ($planUsage in $servicePlanUsage.Values) {
            $planInfo = [PSCustomObject]@{
                ServicePlanId = $planUsage.ServicePlanId
                ServicePlanName = $planUsage.ServicePlanName
                FriendlyName = $planUsage.FriendlyName
                AppliesTo = $planUsage.AppliesTo
                ProvisioningStatus = $planUsage.ProvisioningStatus
                TotalAvailable = $planUsage.TotalAvailable
                IncludedInSKUs = (($planUsage.IncludedInSKUs | Select-Object -Unique) -join ";")
                _DataType = 'ServicePlanUsage'
            }
            
            $null = $servicePlanData.Add($planInfo)
        }
        
        Write-LicensingLog -Message "Analyzed $($servicePlanData.Count) service plans" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to analyze service plan usage: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $servicePlanData
}

function Get-LicenseCostAnalysisData {
    param(
        [hashtable]$Configuration,
        $Context,
        $SKUs
    )
    
    $costData = [System.Collections.ArrayList]::new()
    
    try {
        Write-LicensingLog -Message "Calculating license costs..." -Level "INFO" -Context $Context
        
        $totalMonthlyCost = 0
        $totalAnnualCost = 0
        $totalUnusedCost = 0
        
        foreach ($sku in $SKUs) {
            $estimatedMonthlyPrice = Get-EstimatedLicensePrice -SkuPartNumber $sku.SkuPartNumber
            $monthlyCost = $estimatedMonthlyPrice * $sku.ConsumedLicenses
            $annualCost = $monthlyCost * 12
            $unusedMonthlyCost = $estimatedMonthlyPrice * $sku.AvailableLicenses
            $unusedAnnualCost = $unusedMonthlyCost * 12
            
            $totalMonthlyCost += $monthlyCost
            $totalAnnualCost += $annualCost
            $totalUnusedCost += $unusedAnnualCost
            
            $costInfo = [PSCustomObject]@{
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
                _DataType = 'LicenseCostAnalysis'
            }
            
            $null = $costData.Add($costInfo)
        }
        
        Write-LicensingLog -Message "Calculated costs for $($costData.Count) SKUs" -Level "SUCCESS" -Context $Context
        Write-LicensingLog -Message "Total annual cost: $([math]::Round($totalAnnualCost, 2)) USD" -Level "INFO" -Context $Context
        Write-LicensingLog -Message "Total unused annual cost: $([math]::Round($totalUnusedCost, 2)) USD" -Level "WARN" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to calculate license costs: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $costData
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

function Get-FriendlyServicePlanName {
    param([string]$ServicePlanName)
    
    $servicePlanNames = @{
        "EXCHANGE_S_ENTERPRISE" = "Exchange Online"
        "TEAMS1" = "Microsoft Teams"
        "SHAREPOINTENTERPRISE" = "SharePoint Online"
        "OFFICESUBSCRIPTION" = "Microsoft 365 Apps"
        "MCOSTANDARD" = "Skype for Business Online"
        "YAMMER_ENTERPRISE" = "Yammer"
        "RMS_S_ENTERPRISE" = "Azure Rights Management"
        "PROJECTWORKMANAGEMENT" = "Microsoft Planner"
        "SWAY" = "Sway"
        "INTUNE_A" = "Microsoft Intune"
        "STREAM_O365_E3" = "Stream for Office 365"
        "POWERAPPS_O365_P2" = "PowerApps for Office 365"
        "FLOW_O365_P2" = "Power Automate for Office 365"
        "FORMS_PLAN_E3" = "Microsoft Forms"
        "WHITEBOARD_PLAN2" = "Whiteboard"
    }
    
    return if ($servicePlanNames.ContainsKey($ServicePlanName)) { $servicePlanNames[$ServicePlanName] } else { $ServicePlanName }
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