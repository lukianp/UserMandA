# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Identity.DirectoryManagement

<#
.SYNOPSIS
    Microsoft 365 Licensing discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers license inventory, assignments, costs, and compliance
.NOTES
    Author: M&A Discovery Team
    Version: 7.1.0
    Last Modified: 2025-06-09
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

function Write-LicensingLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        $Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Licensing] $Message" -Level $Level -Component "LicensingDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            default { "White" }
        }
        Write-Host "[Licensing] $Message" -ForegroundColor $color
    }
}

function Test-LicensingPrerequisites {
    param($Context)
    
    try {
        $mgContext = Get-MgContext -ErrorAction Stop
        if (-not $mgContext) {
            return $false
        }
        
        # Test licensing access
        $null = Get-MgSubscribedSku -Top 1 -ErrorAction Stop
        return $true
    } catch {
        Write-LicensingLog -Message "Prerequisites check failed: $_" -Level "ERROR" -Context $Context
        return $false
    }
}

function Get-LicenseSKUsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $skus = @()
    
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
            
            $skus += [PSCustomObject]@{
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
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Licensing'
            }
        }
        
        Write-LicensingLog -Message "Retrieved $($skus.Count) license SKUs" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to retrieve license SKUs: $_" -Level "ERROR" -Context $Context
        throw
    }
    
    return $skus
}

function Get-UserLicenseAssignmentsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $licenseAssignments = @()
    
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
                $licenseAssignments += [PSCustomObject]@{
                    UserId = $user.Id
                    UserPrincipalName = $user.UserPrincipalName
                    DisplayName = $user.DisplayName
                    Department = $user.Department
                    UsageLocation = $user.UsageLocation
                    AccountEnabled = $user.AccountEnabled
                    LicenseSkuId = $license.SkuId
                    DisabledPlansCount = if ($license.DisabledPlans) { $license.DisabledPlans.Count } else { 0 }
                    AssignmentDate = $user.CreatedDateTime
                    _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    _DiscoveryModule = 'Licensing'
                }
            }
        }
        
        Write-LicensingLog -Message "Retrieved $($licenseAssignments.Count) license assignments" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to retrieve user license assignments: $_" -Level "ERROR" -Context $Context
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
    
    $servicePlanData = @()
    
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
                            IncludedInSKUs = @()
                        }
                    }
                    
                    $servicePlanUsage[$planKey].TotalAvailable += $sku.ConsumedLicenses
                    $servicePlanUsage[$planKey].IncludedInSKUs += $sku.SkuPartNumber
                }
            }
        }
        
        # Convert to output format
        foreach ($planUsage in $servicePlanUsage.Values) {
            $servicePlanData += [PSCustomObject]@{
                ServicePlanId = $planUsage.ServicePlanId
                ServicePlanName = $planUsage.ServicePlanName
                FriendlyName = $planUsage.FriendlyName
                AppliesTo = $planUsage.AppliesTo
                ProvisioningStatus = $planUsage.ProvisioningStatus
                TotalAvailable = $planUsage.TotalAvailable
                IncludedInSKUs = ($planUsage.IncludedInSKUs | Select-Object -Unique) -join ";"
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Licensing'
            }
        }
        
        Write-LicensingLog -Message "Analyzed $($servicePlanData.Count) service plans" -Level "SUCCESS" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to analyze service plan usage: $_" -Level "ERROR" -Context $Context
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
    
    $costData = @()
    
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
            
            $costData += [PSCustomObject]@{
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
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Licensing'
            }
        }
        
        Write-LicensingLog -Message "Calculated costs for $($costData.Count) SKUs" -Level "SUCCESS" -Context $Context
        Write-LicensingLog -Message "Total annual cost: $([math]::Round($totalAnnualCost, 2)) USD" -Level "INFO" -Context $Context
    } catch {
        Write-LicensingLog -Message "Failed to calculate license costs: $_" -Level "ERROR" -Context $Context
        throw
    }
    
    return $costData
}

function Export-LicensingData {
    param(
        [string]$FilePath,
        [array]$Data,
        [string]$DataType,
        $Context
    )
    
    try {
        if ($Data.Count -gt 0) {
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
            Write-LicensingLog -Message "Exported $($Data.Count) $DataType records to $([System.IO.Path]::GetFileName($FilePath))" -Level "SUCCESS" -Context $Context
        } else {
            Write-LicensingLog -Message "No $DataType data to export" -Level "WARN" -Context $Context
        }
    } catch {
        Write-LicensingLog -Message "Failed to export $DataType data: $_" -Level "ERROR" -Context $Context
        throw
    }
}

# Main discovery function - matches orchestrator expectations
function Invoke-LicensingDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    # Initialize result using the globally defined DiscoveryResult class
    $result = [DiscoveryResult]::new('Licensing')
    
    try {
        Write-LicensingLog -Message "Starting Microsoft 365 Licensing Discovery..." -Level "INFO" -Context $Context
        
        # Check prerequisites
        if (-not (Test-LicensingPrerequisites -Context $Context)) {
            $result.AddError("Licensing prerequisites not met", $null, @{
                Component = "GraphConnection"
                Resolution = "Ensure Microsoft Graph is connected with appropriate permissions"
            })
            return $result
        }
        
        # Get output path
        $outputPath = Join-Path $Context.Paths.RawDataOutput ""
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }
        
        # Discover license SKUs
        $skus = @()
        try {
            $skus = Get-LicenseSKUsData -Configuration $Configuration -Context $Context
            $result.Metadata['LicenseSKUCount'] = $skus.Count
            
            if ($skus.Count -gt 0) {
                Export-LicensingData -FilePath (Join-Path $outputPath "LicenseSKUs.csv") `
                    -Data $skus -DataType "license SKUs" -Context $Context
            }
        } catch {
            $result.AddError("Failed to discover license SKUs", $_.Exception, @{
                Operation = "GetLicenseSKUs"
            })
        }
        
        # Only continue if we have SKUs
        if ($skus.Count -gt 0) {
            # Discover user license assignments
            try {
                $userLicenses = Get-UserLicenseAssignmentsData -Configuration $Configuration -Context $Context
                $result.Metadata['UserLicenseAssignmentCount'] = $userLicenses.Count
                
                if ($userLicenses.Count -gt 0) {
                    Export-LicensingData -FilePath (Join-Path $outputPath "UserLicenseAssignments.csv") `
                        -Data $userLicenses -DataType "user license assignments" -Context $Context
                }
            } catch {
                $result.AddError("Failed to discover user license assignments", $_.Exception, @{
                    Operation = "GetUserLicenseAssignments"
                })
            }
            
            # Analyze service plan usage
            try {
                $servicePlans = Get-ServicePlanUsageData -Configuration $Configuration -Context $Context -SKUs $skus
                $result.Metadata['ServicePlanCount'] = $servicePlans.Count
                
                if ($servicePlans.Count -gt 0) {
                    Export-LicensingData -FilePath (Join-Path $outputPath "ServicePlanUsage.csv") `
                        -Data $servicePlans -DataType "service plan usage" -Context $Context
                }
            } catch {
                $result.AddError("Failed to analyze service plan usage", $_.Exception, @{
                    Operation = "GetServicePlanUsage"
                })
            }
            
            # Calculate license costs
            try {
                $costAnalysis = Get-LicenseCostAnalysisData -Configuration $Configuration -Context $Context -SKUs $skus
                $result.Metadata['CostAnalysisRecordCount'] = $costAnalysis.Count
                
                if ($costAnalysis.Count -gt 0) {
                    Export-LicensingData -FilePath (Join-Path $outputPath "LicenseCostAnalysis.csv") `
                        -Data $costAnalysis -DataType "license cost analysis" -Context $Context
                }
            } catch {
                $result.AddError("Failed to calculate license costs", $_.Exception, @{
                    Operation = "GetLicenseCosts"
                })
            }
        } else {
            $result.AddWarning("No license SKUs found or accessible")
        }
        
        # Set overall success based on critical data
        $result.Success = ($skus.Count -gt 0)
        
    } catch {
        $result.AddError("Unexpected error in Licensing discovery", $_.Exception, @{
            Operation = "LicensingDiscovery"
        })
    } finally {
        $result.Complete()
        Write-LicensingLog -Message "Licensing Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count)" -Level "INFO" -Context $Context
    }
    
    return $result
}

# Helper functions
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
    
    # Estimated monthly prices in USD (public list prices)
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

# Export the required function
Export-ModuleMember -Function Invoke-LicensingDiscovery