# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Microsoft 365 Licensing discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers license inventory, assignments, costs, and compliance
#>

# Modules/Discovery/LicensingDiscovery.psm1
#Cant use the global thingy fix here because outputpath is used in the  functions

function Invoke-LicensingDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Microsoft 365 Licensing discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Graph connection
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            Write-MandALog "Microsoft Graph not connected. Skipping licensing discovery." -Level "WARN"
            return @{}
        }
        
        # License SKUs
        Write-MandALog "Discovering license SKUs..." -Level "INFO"
        $discoveryResults.LicenseSKUs = Get-LicenseSKUsData -OutputPath $rawPath -Configuration $Configuration
        
        # User License Assignments
        Write-MandALog "Discovering user license assignments..." -Level "INFO"
        $discoveryResults.UserLicenses = Get-UserLicenseAssignmentsData -OutputPath $rawPath -Configuration $Configuration
        
        # License Usage Analysis
        Write-MandALog "Analyzing license usage..." -Level "INFO"
        $discoveryResults.LicenseUsage = Get-LicenseUsageAnalysisData -OutputPath $rawPath -Configuration $Configuration -SKUs $discoveryResults.LicenseSKUs
        
        # Service Plan Usage
        Write-MandALog "Analyzing service plan usage..." -Level "INFO"
        $discoveryResults.ServicePlanUsage = Get-ServicePlanUsageData -OutputPath $rawPath -Configuration $Configuration
        
        # License Costs
        Write-MandALog "Calculating license costs..." -Level "INFO"
        $discoveryResults.LicenseCosts = Get-LicenseCostAnalysisData -OutputPath $rawPath -Configuration $Configuration -SKUs $discoveryResults.LicenseSKUs
        
        # License Compliance
        Write-MandALog "Checking license compliance..." -Level "INFO"
        $discoveryResults.LicenseCompliance = Get-LicenseComplianceData -OutputPath $rawPath -Configuration $Configuration
        
        # Group-Based Licensing
        Write-MandALog "Discovering group-based licensing..." -Level "INFO"
        $discoveryResults.GroupLicensing = Get-GroupBasedLicensingData -OutputPath $rawPath -Configuration $Configuration
        
        Write-MandALog "Microsoft 365 Licensing discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Microsoft 365 Licensing discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-LicenseSKUsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "LicenseSKUs.csv"
    $skuData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "License SKUs CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving license SKUs..." -Level "INFO"
        
        $subscribedSkus = Get-MgSubscribedSku -All
        
        foreach ($sku in $subscribedSkus) {
            # Calculate usage percentages
            $totalLicenses = $sku.PrepaidUnits.Enabled + $sku.PrepaidUnits.Warning + $sku.PrepaidUnits.Suspended
            $usagePercentage = if ($totalLicenses -gt 0) {
                [math]::Round(($sku.ConsumedUnits / $totalLicenses) * 100, 2)
            } else { 0 }
            
            # Get service plans
            $servicePlans = $sku.ServicePlans | ForEach-Object {
                "$($_.ServicePlanName):$($_.ProvisioningStatus)"
            }
            
            $skuData.Add([PSCustomObject]@{
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
                AccountId = $sku.AccountId
                AccountName = $sku.AccountName
                AccountObjectId = $sku.AccountObjectId
            })
        }
        
        Write-MandALog "Retrieved $($skuData.Count) license SKUs" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $skuData -FilePath $outputFile
        
        return $skuData
        
    } catch {
        Write-MandALog "Error retrieving license SKUs: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-UserLicenseAssignmentsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "UserLicenseAssignments.csv"
    $licenseData = [System.Collections.Generic.List[PSObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-ProgressStep "User license assignments CSV already exists. Skipping." -Status Info
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-ProgressStep "Retrieving user license assignments..." -Status Progress
        
        # Get all users first
        Write-ProgressStep "Fetching all users from Graph..." -Status Progress
        $allUsers = Get-MgUser -All -Property Id,UserPrincipalName,DisplayName,Department,UsageLocation,AccountEnabled,AssignedLicenses,CreatedDateTime -ErrorAction Stop
        
        # Filter users with licenses locally
        $licensedUsers = $allUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
        $licensedUserCount = ($licensedUsers | Measure-Object).Count
        
        Write-ProgressStep "Processing license assignments for $licensedUserCount users..." -Status Info
        
        $processedCount = 0
        foreach ($user in $licensedUsers) {
            $processedCount++
            
            Show-ProgressBar -Current $processedCount -Total $licensedUserCount `
                -Activity "Processing licenses for: $($user.UserPrincipalName)"
            
            foreach ($license in $user.AssignedLicenses) {
                # Get SKU details
                $sku = Get-MgSubscribedSku | Where-Object { $_.SkuId -eq $license.SkuId }
                
                if ($sku) {
                    # Get disabled plans
                    $disabledPlans = @()
                    if ($license.DisabledPlans) {
                        $disabledPlans = $sku.ServicePlans | Where-Object { $_.ServicePlanId -in $license.DisabledPlans } | 
                            ForEach-Object { $_.ServicePlanName }
                    }
                    
                    $licenseData.Add([PSCustomObject]@{
                        UserId = $user.Id
                        UserPrincipalName = $user.UserPrincipalName
                        DisplayName = $user.DisplayName
                        Department = $user.Department
                        UsageLocation = $user.UsageLocation
                        AccountEnabled = $user.AccountEnabled
                        LicenseSkuId = $license.SkuId
                        LicenseSkuPartNumber = $sku.SkuPartNumber
                        LicenseDisplayName = Get-FriendlyLicenseName -SkuPartNumber $sku.SkuPartNumber
                        AssignmentDate = $user.CreatedDateTime
                        DisabledPlansCount = $license.DisabledPlans.Count
                        DisabledPlans = ($disabledPlans -join ";")
                        EnabledPlansCount = $sku.ServicePlans.Count - $license.DisabledPlans.Count
                        LicenseAssignmentState = "Active"
                    })
                }
            }
        }
        
        Write-Host "" # Clear progress bar line
        Write-ProgressStep "Processed $($licenseData.Count) license assignments" -Status Success
        
        if ($licenseData.Count -gt 0) {
            Write-ProgressStep "Exporting license assignment data to CSV..." -Status Progress
            Export-DataToCSV -Data $licenseData -FilePath $outputFile
            Write-ProgressStep "License assignment export completed" -Status Success
        } else {
            Write-ProgressStep "No license assignment data to export" -Status Warning
        }
        
        return $licenseData
        
    } catch {
        Write-ProgressStep "Error retrieving user license assignments: $($_.Exception.Message)" -Status Error
        throw
    }
}

function Get-ServicePlanUsageData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ServicePlanUsage.csv"
    $servicePlanData = [System.Collections.Generic.List[PSObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-ProgressStep "Service plan usage CSV already exists. Skipping." -Status Info
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-ProgressStep "Analyzing service plan usage..." -Status Progress
        Write-ProgressStep "Checking service plan assignments for users..." -Status Info
        
        # Get all SKUs and their service plans
        $allSkus = Get-MgSubscribedSku -All
        
        # Dictionary to track service plan usage
        $servicePlanUsage = @{}
        
        Write-ProgressStep "Processing $($allSkus.Count) SKUs..." -Status Progress
        
        $skuCount = 0
        foreach ($sku in $allSkus) {
            $skuCount++
            
            Show-ProgressBar -Current $skuCount -Total $allSkus.Count `
                -Activity "Processing SKU: $($sku.SkuPartNumber)"
            
            foreach ($servicePlan in $sku.ServicePlans) {
                $planKey = $servicePlan.ServicePlanId
                
                if (-not $servicePlanUsage.ContainsKey($planKey)) {
                    $servicePlanUsage[$planKey] = @{
                        ServicePlanId = $servicePlan.ServicePlanId
                        ServicePlanName = $servicePlan.ServicePlanName
                        FriendlyName = Get-FriendlyServicePlanName -ServicePlanName $servicePlan.ServicePlanName
                        TotalAvailable = 0
                        TotalAssigned = 0
                        TotalDisabled = 0
                        AppliesTo = $servicePlan.AppliesTo
                        ProvisioningStatus = $servicePlan.ProvisioningStatus
                        IncludedInSKUs = @()
                    }
                }
                
                $servicePlanUsage[$planKey].TotalAvailable += $sku.ConsumedUnits
                $servicePlanUsage[$planKey].IncludedInSKUs += $sku.SkuPartNumber
            }
        }
        
        Write-Host "" # Clear progress bar line
        
        # Sample users for actual usage statistics
        Write-ProgressStep "Sampling user assignments for usage statistics..." -Status Progress
        $sampleUsers = Get-MgUser -Top 100 -Property Id,AssignedLicenses -ErrorAction Stop
        $sampleLicensedUsers = $sampleUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
        
        foreach ($user in $sampleLicensedUsers) {
            foreach ($license in $user.AssignedLicenses) {
                $sku = $allSkus | Where-Object { $_.SkuId -eq $license.SkuId }
                
                if ($sku) {
                    foreach ($servicePlan in $sku.ServicePlans) {
                        if ($servicePlanUsage.ContainsKey($servicePlan.ServicePlanId)) {
                            if ($servicePlan.ServicePlanId -in $license.DisabledPlans) {
                                $servicePlanUsage[$servicePlan.ServicePlanId].TotalDisabled++
                            } else {
                                $servicePlanUsage[$servicePlan.ServicePlanId].TotalAssigned++
                            }
                        }
                    }
                }
            }
        }
        
        # Convert to output format
        Write-ProgressStep "Formatting service plan data..." -Status Progress
        
        foreach ($planUsage in $servicePlanUsage.Values) {
            $utilizationRate = if ($planUsage.TotalAvailable -gt 0) {
                [math]::Round(($planUsage.TotalAssigned / $planUsage.TotalAvailable) * 100, 2)
            } else { 0 }
            
            $servicePlanData.Add([PSCustomObject]@{
                ServicePlanId = $planUsage.ServicePlanId
                ServicePlanName = $planUsage.ServicePlanName
                FriendlyName = $planUsage.FriendlyName
                AppliesTo = $planUsage.AppliesTo
                ProvisioningStatus = $planUsage.ProvisioningStatus
                TotalAvailable = $planUsage.TotalAvailable
                EstimatedAssigned = $planUsage.TotalAssigned
                EstimatedDisabled = $planUsage.TotalDisabled
                EstimatedUtilizationRate = $utilizationRate
                IncludedInSKUs = ($planUsage.IncludedInSKUs | Select-Object -Unique) -join ";"
                Notes = "Based on sample of 100 users"
            })
        }
        
        Write-ProgressStep "Analyzed $($servicePlanData.Count) service plans" -Status Success
        
        if ($servicePlanData.Count -gt 0) {
            Write-ProgressStep "Exporting service plan data to CSV..." -Status Progress
            Export-DataToCSV -Data $servicePlanData -FilePath $outputFile
            Write-ProgressStep "Service plan export completed" -Status Success
        } else {
            Write-ProgressStep "No service plan data to export" -Status Warning
        }
        
        return $servicePlanData
        
    } catch {
        Write-ProgressStep "Error analyzing service plan usage: $($_.Exception.Message)" -Status Error
        throw
    }
}

function Get-LicenseUsageAnalysisData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$SKUs
    )
    
    $outputFile = Join-Path $OutputPath "LicenseUsageAnalysis.csv"
    $usageData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "License usage analysis CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Analyzing license usage patterns..." -Level "INFO"
        
        foreach ($sku in $SKUs) {
            # Analyze usage patterns
            $analysis = @{
                SkuPartNumber = $sku.SkuPartNumber
                DisplayName = $sku.DisplayName
                TotalLicenses = $sku.TotalLicenses
                ConsumedLicenses = $sku.ConsumedLicenses
                AvailableLicenses = $sku.AvailableLicenses
                UsagePercentage = $sku.UsagePercentage
                Status = "Normal"
                Recommendation = "None"
                PotentialSavings = 0
                RiskLevel = "Low"
            }
            
            # Determine status and recommendations
            if ($sku.UsagePercentage -eq 100) {
                $analysis.Status = "FullyUtilized"
                $analysis.Recommendation = "Consider purchasing additional licenses"
                $analysis.RiskLevel = "High"
            } elseif ($sku.UsagePercentage -ge 90) {
                $analysis.Status = "NearCapacity"
                $analysis.Recommendation = "Monitor usage closely, may need additional licenses soon"
                $analysis.RiskLevel = "Medium"
            } elseif ($sku.UsagePercentage -le 50 -and $sku.TotalLicenses -gt 10) {
                $analysis.Status = "Underutilized"
                $unusedLicenses = $sku.AvailableLicenses
                $analysis.Recommendation = "Consider reducing licenses by $unusedLicenses"
                # Estimate savings (using average enterprise pricing)
                $analysis.PotentialSavings = Get-EstimatedLicenseCost -SkuPartNumber $sku.SkuPartNumber -Count $unusedLicenses
                $analysis.RiskLevel = "Low"
            }
            
            # Check for expired or warning licenses
            if ($sku.WarningLicenses -gt 0) {
                $analysis.Status = "HasWarnings"
                $analysis.Recommendation = "Address $($sku.WarningLicenses) licenses in warning state"
                $analysis.RiskLevel = "High"
            }
            
            if ($sku.SuspendedLicenses -gt 0) {
                $analysis.Status = "HasSuspensions"
                $analysis.Recommendation = "Resolve $($sku.SuspendedLicenses) suspended licenses"
                $analysis.RiskLevel = "Critical"
            }
            
            $usageData.Add([PSCustomObject]$analysis)
        }
        
        Write-MandALog "Completed license usage analysis" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $usageData -FilePath $outputFile
        
        return $usageData
        
    } catch {
        Write-MandALog "Error analyzing license usage: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ServicePlanUsageData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ServicePlanUsage.csv"
    $servicePlanData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Service plan usage CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Analyzing service plan usage..." -Level "INFO"
        Write-MandALog "Checking service plan assignments for users..." -Level "INFO"
        
        # Get all SKUs and their service plans
        $allSkus = Get-MgSubscribedSku -All
        
        # Dictionary to track service plan usage
        $servicePlanUsage = @{}
        
        foreach ($sku in $allSkus) {
            foreach ($servicePlan in $sku.ServicePlans) {
                $planKey = $servicePlan.ServicePlanId
                
                if (-not $servicePlanUsage.ContainsKey($planKey)) {
                    $servicePlanUsage[$planKey] = @{
                        ServicePlanId = $servicePlan.ServicePlanId
                        ServicePlanName = $servicePlan.ServicePlanName
                        FriendlyName = Get-FriendlyServicePlanName -ServicePlanName $servicePlan.ServicePlanName
                        TotalAvailable = 0
                        TotalAssigned = 0
                        TotalDisabled = 0
                        AppliesTo = $servicePlan.AppliesTo
                        ProvisioningStatus = $servicePlan.ProvisioningStatus
                        IncludedInSKUs = @()
                    }
                }
                
                $servicePlanUsage[$planKey].TotalAvailable += $sku.ConsumedUnits
                $servicePlanUsage[$planKey].IncludedInSKUs += $sku.SkuPartNumber
            }
        }
        
        # FIXED: Get sample users differently
        $sampleUsers = Get-MgUser -Top 100 -Property Id,AssignedLicenses -ErrorAction Stop
        $sampleLicensedUsers = $sampleUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
        
        foreach ($user in $sampleLicensedUsers) {
            foreach ($license in $user.AssignedLicenses) {
                $sku = $allSkus | Where-Object { $_.SkuId -eq $license.SkuId }
                
                if ($sku) {
                    foreach ($servicePlan in $sku.ServicePlans) {
                        if ($servicePlanUsage.ContainsKey($servicePlan.ServicePlanId)) {
                            if ($servicePlan.ServicePlanId -in $license.DisabledPlans) {
                                $servicePlanUsage[$servicePlan.ServicePlanId].TotalDisabled++
                            } else {
                                $servicePlanUsage[$servicePlan.ServicePlanId].TotalAssigned++
                            }
                        }
                    }
                }
            }
        }
        
        # Convert to output format
        foreach ($planUsage in $servicePlanUsage.Values) {
            $utilizationRate = if ($planUsage.TotalAvailable -gt 0) {
                [math]::Round(($planUsage.TotalAssigned / $planUsage.TotalAvailable) * 100, 2)
            } else { 0 }
            
            $servicePlanData.Add([PSCustomObject]@{
                ServicePlanId = $planUsage.ServicePlanId
                ServicePlanName = $planUsage.ServicePlanName
                FriendlyName = $planUsage.FriendlyName
                AppliesTo = $planUsage.AppliesTo
                ProvisioningStatus = $planUsage.ProvisioningStatus
                TotalAvailable = $planUsage.TotalAvailable
                EstimatedAssigned = $planUsage.TotalAssigned
                EstimatedDisabled = $planUsage.TotalDisabled
                EstimatedUtilizationRate = $utilizationRate
                IncludedInSKUs = ($planUsage.IncludedInSKUs | Select-Object -Unique) -join ";"
                Notes = "Based on sample of 100 users"
            })
        }
        
        Write-MandALog "Analyzed $($servicePlanData.Count) service plans" -Level "SUCCESS"
        
        # Only export if we have data
        if ($servicePlanData.Count -gt 0) {
            Export-DataToCSV -Data $servicePlanData -FilePath $outputFile
        } else {
            Write-MandALog "No service plan data to export" -Level "WARN"
        }
        
        return $servicePlanData
        
    } catch {
        Write-MandALog "Error analyzing service plan usage: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-LicenseCostAnalysisData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$SKUs
    )
    
    $outputFile = Join-Path $OutputPath "LicenseCostAnalysis.csv"
    $costData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "License cost analysis CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Calculating license costs..." -Level "INFO"
        
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
            
            $costData.Add([PSCustomObject]@{
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
                CostEfficiency = if ($sku.TotalLicenses -gt 0) {
                    [math]::Round(($sku.ConsumedLicenses / $sku.TotalLicenses) * 100, 2)
                } else { 0 }
                Currency = "USD"
                PriceNote = "Estimated based on public list prices"
            })
        }
        
        # Add summary row
        $costData.Add([PSCustomObject]@{
            SkuPartNumber = "TOTAL"
            DisplayName = "Total License Costs"
            EstimatedPricePerLicense = 0
            ConsumedLicenses = ($SKUs | Measure-Object -Property ConsumedLicenses -Sum).Sum
            AvailableLicenses = ($SKUs | Measure-Object -Property AvailableLicenses -Sum).Sum
            TotalLicenses = ($SKUs | Measure-Object -Property TotalLicenses -Sum).Sum
            MonthlyCost = [math]::Round($totalMonthlyCost, 2)
            AnnualCost = [math]::Round($totalAnnualCost, 2)
            UnusedMonthlyCost = [math]::Round($totalUnusedCost / 12, 2)
            UnusedAnnualCost = [math]::Round($totalUnusedCost, 2)
            CostEfficiency = 0
            Currency = "USD"
            PriceNote = "Summary of all licenses"
        })
        
        Write-MandALog "Completed license cost analysis" -Level "SUCCESS"
        Write-MandALog "Estimated annual license cost: `$$([math]::Round($totalAnnualCost, 2))" -Level "INFO"
        Write-MandALog "Potential annual savings from unused licenses: `$$([math]::Round($totalUnusedCost, 2))" -Level "INFO"
        
        # Export to CSV
        Export-DataToCSV -Data $costData -FilePath $outputFile
        
        return $costData
        
    } catch {
        Write-MandALog "Error calculating license costs: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-LicenseComplianceData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "LicenseCompliance.csv"
    $complianceData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "License compliance CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Checking license compliance..." -Level "INFO"
        
        # FIXED: Get all users and filter locally
        $allUsers = Get-MgUser -All -Property Id,UserPrincipalName,AssignedLicenses,AccountEnabled,UsageLocation -ErrorAction Stop
        
        # Check for unlicensed active users
        $unlicensedActiveUsers = $allUsers | Where-Object { 
            $_.AccountEnabled -eq $true -and 
            (-not $_.AssignedLicenses -or $_.AssignedLicenses.Count -eq 0) 
        }
        $unlicensedCount = ($unlicensedActiveUsers | Measure-Object).Count
        
        # Check for users without usage location
        $usersWithoutLocation = $allUsers | Where-Object { 
            (-not $_.UsageLocation -or $_.UsageLocation -eq "") -and 
            $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 
        }
        $noLocationCount = ($usersWithoutLocation | Measure-Object).Count
        
        # Check for duplicate licenses
        $allUserLicenses = $allUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
        
        # Compliance checks
        $complianceChecks = @(
            @{
                CheckName = "Unlicensed Active Users"
                Category = "License Assignment"
                Status = if ($unlicensedCount -eq 0) { "Compliant" } else { "Non-Compliant" }
                Count = $unlicensedCount
                Severity = if ($unlicensedCount -eq 0) { "Low" } else { "High" }
                Recommendation = if ($unlicensedCount -eq 0) { 
                    "All active users have licenses assigned" 
                } else { 
                    "Assign licenses to $unlicensedCount active users or disable accounts" 
                }
                Impact = "Users without licenses cannot access Microsoft 365 services"
            },
            @{
                CheckName = "Users Without Usage Location"
                Category = "License Configuration"
                Status = if ($noLocationCount -eq 0) { "Compliant" } else { "Non-Compliant" }
                Count = $noLocationCount
                Severity = if ($noLocationCount -eq 0) { "Low" } else { "Medium" }
                Recommendation = if ($noLocationCount -eq 0) { 
                    "All licensed users have usage location set" 
                } else { 
                    "Set usage location for $noLocationCount users" 
                }
                Impact = "Some services may not be available without usage location"
            }
        )
        
        # Check for over-licensing (users with multiple similar licenses)
        $e3SkuId = "05e9a617-0261-4cee-bb44-138d3ef5d965"
        $e5SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"
        $businessStandardSkuId = "6fd2c87f-b296-42f0-b197-1e91e994b900"
        $businessPremiumSkuId = "cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46"
        
        $e3e5Users = $allUserLicenses | Where-Object { 
            $licenses = $_.AssignedLicenses | ForEach-Object { $_.SkuId }
            ($licenses -contains $e3SkuId -and $licenses -contains $e5SkuId) -or
            ($licenses -contains $businessStandardSkuId -and $licenses -contains $businessPremiumSkuId)
        }
        $duplicateLicenseCount = ($e3e5Users | Measure-Object).Count
        
        if ($duplicateLicenseCount -gt 0) {
            $complianceChecks += @{
                CheckName = "Duplicate License Assignments"
                Category = "License Optimization"
                Status = "Warning"
                Count = $duplicateLicenseCount
                Severity = "Medium"
                Recommendation = "Review users with multiple similar licenses (e.g., E3 and E5)"
                Impact = "Unnecessary costs from duplicate licensing"
            }
        }
        
        # Convert to output format
        foreach ($check in $complianceChecks) {
            $complianceData.Add([PSCustomObject]$check)
        }
        
        # Add specific user details for non-compliant items
        if ($unlicensedCount -gt 0) {
            $sampleUnlicensed = $unlicensedActiveUsers | Select-Object -First 10
            foreach ($user in $sampleUnlicensed) {
                $complianceData.Add([PSCustomObject]@{
                    CheckName = "Unlicensed User Detail"
                    Category = "User Specific"
                    Status = "Non-Compliant"
                    Count = 1
                    Severity = "High"
                    Recommendation = "Assign license to $($user.UserPrincipalName)"
                    Impact = $user.UserPrincipalName
                })
            }
        }
        
        Write-MandALog "Completed license compliance checks" -Level "SUCCESS"
        
        # Only export if we have data
        if ($complianceData.Count -gt 0) {
            Export-DataToCSV -Data $complianceData -FilePath $outputFile
        } else {
            Write-MandALog "No compliance data to export" -Level "WARN"
        }
        
        return $complianceData
        
    } catch {
        Write-MandALog "Error checking license compliance: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-GroupBasedLicensingData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GroupBasedLicensing.csv"
    $groupLicenseData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Group-based licensing CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering group-based licensing..." -Level "INFO"
        
        # FIXED: Get all groups and filter locally
        $allGroups = Get-MgGroup -All -Property Id,DisplayName,GroupTypes,MailEnabled,SecurityEnabled,AssignedLicenses,CreatedDateTime -ErrorAction Stop
        
        # Filter groups with license assignments
        $groupsWithLicenses = $allGroups | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
        
        Write-MandALog "Found $($groupsWithLicenses.Count) groups with license assignments" -Level "INFO"
        
        foreach ($group in $groupsWithLicenses) {
            # Get group members count
            try {
                $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction Stop
                $memberCount = ($members | Measure-Object).Count
            } catch {
                Write-MandALog "Could not get member count for group $($group.DisplayName): $($_.Exception.Message)" -Level "WARN"
                $memberCount = 0
            }
            
            foreach ($license in $group.AssignedLicenses) {
                $sku = Get-MgSubscribedSku | Where-Object { $_.SkuId -eq $license.SkuId }
                
                if ($sku) {
                    $groupLicenseData.Add([PSCustomObject]@{
                        GroupId = $group.Id
                        GroupDisplayName = $group.DisplayName
                        GroupType = ($group.GroupTypes -join ";")
                        MailEnabled = $group.MailEnabled
                        SecurityEnabled = $group.SecurityEnabled
                        MemberCount = $memberCount
                        LicenseSkuId = $license.SkuId
                        LicenseSkuPartNumber = $sku.SkuPartNumber
                        LicenseDisplayName = Get-FriendlyLicenseName -SkuPartNumber $sku.SkuPartNumber
                        DisabledPlansCount = $license.DisabledPlans.Count
                        CreatedDateTime = $group.CreatedDateTime
                        LicenseAssignmentState = "Active"
                        EstimatedLicenseImpact = $memberCount
                    })
                }
            }
        }
        
        Write-MandALog "Processed $($groupLicenseData.Count) group license assignments" -Level "SUCCESS"
        
        # Only export if we have data
        if ($groupLicenseData.Count -gt 0) {
            Export-DataToCSV -Data $groupLicenseData -FilePath $outputFile
        } else {
            Write-MandALog "No group-based licensing data to export" -Level "WARN"
        }
        
        return $groupLicenseData
        
    } catch {
        Write-MandALog "Error retrieving group-based licensing: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
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
        "FLOW_FREE" = "Power Automate Free"
        "POWERAPPS_VIRAL" = "PowerApps Plan 2"
        "TEAMS_EXPLORATORY" = "Teams Exploratory"
        "STREAM" = "Microsoft Stream"
    }
    
    if ($licenseNames.ContainsKey($SkuPartNumber)) {
        return $licenseNames[$SkuPartNumber]
    } else {
        return $SkuPartNumber
    }
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
    
    if ($servicePlanNames.ContainsKey($ServicePlanName)) {
        return $servicePlanNames[$ServicePlanName]
    } else {
        return $ServicePlanName
    }
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
    
    if ($prices.ContainsKey($SkuPartNumber)) {
        return $prices[$SkuPartNumber]
    } else {
        return 10.00 # Default estimate
    }
}

function Get-EstimatedLicenseCost {
    param(
        [string]$SkuPartNumber,
        [int]$Count
    )
    
    $monthlyPrice = Get-EstimatedLicensePrice -SkuPartNumber $SkuPartNumber
    return [math]::Round($monthlyPrice * $Count * 12, 2) # Annual cost
}

function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data to export to $FilePath" -Level "WARN"
        return
    }
    
    try {
        $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
        Write-MandALog "Exported $($Data.Count) records to $FilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $FilePath`: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Import-DataFromCSV {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-MandALog "CSV file not found: $FilePath" -Level "WARN"
        return @()
    }
    
    try {
        $data = Import-Csv -Path $FilePath -Encoding UTF8
        Write-MandALog "Imported $($data.Count) records from $FilePath" -Level "INFO"
        return $data
    } catch {
        Write-MandALog "Failed to import CSV from $FilePath`: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-LicensingDiscovery',
    'Get-LicenseSKUsData',
    'Get-UserLicenseAssignmentsData',
    'Get-LicenseUsageAnalysisData',
    'Get-ServicePlanUsageData',
    'Get-LicenseCostAnalysisData',
    'Get-LicenseComplianceData',
    'Get-GroupBasedLicensingData'
)
