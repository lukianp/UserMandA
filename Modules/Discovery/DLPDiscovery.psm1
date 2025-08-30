﻿# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-30

<#
.SYNOPSIS
    Data Loss Prevention (DLP) Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Microsoft Purview DLP policies, rules, and configurations using Microsoft Graph API and 
    Exchange/Security & Compliance Center. This module provides comprehensive DLP policy discovery 
    including policy definitions, rules, conditions, actions, and compliance status essential for M&A 
    data governance and security assessment.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Requires: PowerShell 5.1+, Microsoft.Graph modules, Exchange Online Management
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

function Write-DLPLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter()]
        [string]$Level = "INFO",
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    Write-MandALog -Message $Message -Level $Level -Component "DLPDiscovery" -Context $Context
}

function Invoke-DLPDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$DiscoveryContext
    )
    
    # START: Enhanced discovery context validation and initialization
    Write-DLPLog -Level "HEADER" -Message "=== M&A DLP Discovery Module Starting ===" -Context $DiscoveryContext
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "DLP discovery completed successfully"
        Data = @{}
        Errors = @()
        Warnings = @()
        Context = $DiscoveryContext
    }
    
    # Helper to add errors with proper context
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $location)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Location = $location
            Timestamp = Get-Date
        }
        Write-DLPLog -Level "ERROR" -Message $message -Context $this.Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-DLPLog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # Extract context components with comprehensive validation
        $Configuration = $DiscoveryContext.Configuration
        $Context = $DiscoveryContext.Context
        
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-DLPLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-DLPLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE CONNECTION METHODS
        Write-DLPLog -Level "INFO" -Message "Checking available connection methods..." -Context $Context
        
        $useGraph = $false
        $useExchangeOnline = $false
        
        # Check Microsoft Graph connection
        try {
            $mgContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($mgContext -and $mgContext.Account) {
                $useGraph = $true
                Write-DLPLog -Level "SUCCESS" -Message "Microsoft Graph connection available. Account: $($mgContext.Account)" -Context $Context
            }
        } catch {
            Write-DLPLog -Level "DEBUG" -Message "Microsoft Graph not available: $($_.Exception.Message)" -Context $Context
        }
        
        # Check Exchange Online connection
        try {
            $exoSession = Get-ConnectionInformation -ErrorAction SilentlyContinue
            if ($exoSession -and $exoSession.State -eq 'Connected') {
                $useExchangeOnline = $true
                Write-DLPLog -Level "SUCCESS" -Message "Exchange Online connection available" -Context $Context
            }
        } catch {
            Write-DLPLog -Level "DEBUG" -Message "Exchange Online not available: $($_.Exception.Message)" -Context $Context
        }
        
        if (-not $useGraph -and -not $useExchangeOnline) {
            $result.AddError("Neither Microsoft Graph nor Exchange Online connection is available. Please connect using Connect-MgGraph or Connect-ExchangeOnline.", $null, "Connection Validation")
            return $result
        }

        # 4. DISCOVERY EXECUTION
        Write-DLPLog -Level "HEADER" -Message "Starting DLP Discovery Process" -Context $Context
        
        $discoveryData = @{
            DLPPolicies = @()
            DLPRules = @()
            SensitiveInfoTypes = @()
            DataClassifications = @()
            RetentionPolicies = @()
            ComplianceTags = @()
            AlertPolicies = @()
            Statistics = @{
                TotalDLPPolicies = 0
                EnabledDLPPolicies = 0
                DisabledDLPPolicies = 0
                TotalDLPRules = 0
                SensitiveInfoTypes = 0
                DataClassifications = 0
                RetentionPolicies = 0
                AlertPolicies = 0
            }
        }

        # 4a. Discover DLP Policies via Exchange Online (preferred method)
        if ($useExchangeOnline) {
            Write-DLPLog -Level "INFO" -Message "Discovering DLP policies via Exchange Online..." -Context $Context
            try {
                $dlpPolicies = Get-DlpPolicy -ErrorAction Stop
                
                foreach ($policy in $dlpPolicies) {
                    $discoveryData.Statistics.TotalDLPPolicies++
                    
                    if ($policy.Enabled) {
                        $discoveryData.Statistics.EnabledDLPPolicies++
                    } else {
                        $discoveryData.Statistics.DisabledDLPPolicies++
                    }
                    
                    $policyInfo = @{
                        PolicyName = $policy.Name
                        DisplayName = $policy.DisplayName
                        Description = $policy.Description
                        Enabled = $policy.Enabled
                        State = $policy.State
                        Mode = $policy.Mode
                        CreatedBy = $policy.CreatedBy
                        CreatedTime = $policy.CreatedTime
                        LastModifiedBy = $policy.LastModifiedBy
                        LastModifiedTime = $policy.LastModifiedTime
                        Priority = $policy.Priority
                        ExchangeBinding = if ($policy.ExchangeBinding) { $policy.ExchangeBinding -join ';' } else { '' }
                        SharePointBinding = if ($policy.SharePointBinding) { $policy.SharePointBinding -join ';' } else { '' }
                        OneDriveBinding = if ($policy.OneDriveBinding) { $policy.OneDriveBinding -join ';' } else { '' }
                        TeamsBinding = if ($policy.TeamsBinding) { $policy.TeamsBinding -join ';' } else { '' }
                        EndpointDlpBinding = if ($policy.EndpointDlpBinding) { $policy.EndpointDlpBinding -join ';' } else { '' }
                        PolicyTemplateInfo = $policy.PolicyTemplateInfo
                        Comment = $policy.Comment
                    }
                    
                    $discoveryData.DLPPolicies += $policyInfo
                }
                
                Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalDLPPolicies) DLP policies ($($discoveryData.Statistics.EnabledDLPPolicies) enabled, $($discoveryData.Statistics.DisabledDLPPolicies) disabled)" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover DLP policies via Exchange Online: $($_.Exception.Message)")
            }

            # 4b. Discover DLP Rules
            Write-DLPLog -Level "INFO" -Message "Discovering DLP rules..." -Context $Context
            try {
                $dlpRules = Get-DlpComplianceRule -ErrorAction Stop
                
                foreach ($rule in $dlpRules) {
                    $discoveryData.Statistics.TotalDLPRules++
                    
                    $ruleInfo = @{
                        RuleName = $rule.Name
                        DisplayName = $rule.DisplayName
                        Description = $rule.Description
                        Policy = $rule.Policy
                        Enabled = $rule.Disabled -eq $false
                        State = $rule.State
                        Mode = $rule.Mode
                        Priority = $rule.Priority
                        RuleErrorAction = $rule.RuleErrorAction
                        SeverityLevel = $rule.SeverityLevel
                        CreatedBy = $rule.CreatedBy
                        CreatedTime = $rule.CreatedTime
                        LastModifiedBy = $rule.LastModifiedBy
                        LastModifiedTime = $rule.LastModifiedTime
                        
                        # Conditions
                        ContentContainsSensitiveInformation = if ($rule.ContentContainsSensitiveInformation) { 
                            ($rule.ContentContainsSensitiveInformation | ForEach-Object { "$($_.name):$($_.mincount)-$($_.maxcount):$($_.confidencelevel)" }) -join ';' 
                        } else { '' }
                        ContentMatchQuery = $rule.ContentMatchQuery
                        ExceptIfContentMatchQuery = $rule.ExceptIfContentMatchQuery
                        FromAddressContainsWords = if ($rule.FromAddressContainsWords) { $rule.FromAddressContainsWords -join ';' } else { '' }
                        SubjectContainsWords = if ($rule.SubjectContainsWords) { $rule.SubjectContainsWords -join ';' } else { '' }
                        AttachmentExtensionMatchesPatterns = if ($rule.AttachmentExtensionMatchesPatterns) { $rule.AttachmentExtensionMatchesPatterns -join ';' } else { '' }
                        DocumentSizeOver = $rule.DocumentSizeOver
                        
                        # Actions
                        BlockAccess = $rule.BlockAccess
                        NotifyUser = if ($rule.NotifyUser) { $rule.NotifyUser -join ';' } else { '' }
                        NotifyPolicyTipCustomText = $rule.NotifyPolicyTipCustomText
                        GenerateIncidentReport = if ($rule.GenerateIncidentReport) { $rule.GenerateIncidentReport -join ';' } else { '' }
                        IncidentReportContent = if ($rule.IncidentReportContent) { $rule.IncidentReportContent -join ';' } else { '' }
                        ReportSeverityLevel = $rule.ReportSeverityLevel
                        RemoveRMSTemplate = $rule.RemoveRMSTemplate
                        ApplyRightsProtectionTemplate = $rule.ApplyRightsProtectionTemplate
                    }
                    
                    $discoveryData.DLPRules += $ruleInfo
                }
                
                Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalDLPRules) DLP rules" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover DLP rules: $($_.Exception.Message)")
            }

            # 4c. Discover Sensitive Information Types
            Write-DLPLog -Level "INFO" -Message "Discovering Sensitive Information Types..." -Context $Context
            try {
                $sensitiveInfoTypes = Get-DlpSensitiveInformationType -ErrorAction Stop
                
                foreach ($infoType in $sensitiveInfoTypes) {
                    $discoveryData.Statistics.SensitiveInfoTypes++
                    
                    $infoTypeData = @{
                        Name = $infoType.Name
                        DisplayName = $infoType.DisplayName
                        Description = $infoType.Description
                        Publisher = $infoType.Publisher
                        RulePackId = $infoType.RulePackId
                        RulePackType = $infoType.RulePackType
                        Category = $infoType.Category
                        LocalizationId = $infoType.LocalizationId
                        RecommendedConfidence = $infoType.RecommendedConfidence
                        ThresholdConfig = if ($infoType.ThresholdConfig) { $infoType.ThresholdConfig -join ';' } else { '' }
                        IsDefault = $infoType.IsDefault
                        IsCustom = $infoType.IsCustom
                    }
                    
                    $discoveryData.SensitiveInfoTypes += $infoTypeData
                }
                
                Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.SensitiveInfoTypes) Sensitive Information Types" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Sensitive Information Types: $($_.Exception.Message)")
            }

            # 4d. Discover Retention Policies
            Write-DLPLog -Level "INFO" -Message "Discovering Retention policies..." -Context $Context
            try {
                $retentionPolicies = Get-RetentionCompliancePolicy -ErrorAction Stop
                
                foreach ($policy in $retentionPolicies) {
                    $discoveryData.Statistics.RetentionPolicies++
                    
                    $retentionInfo = @{
                        PolicyName = $policy.Name
                        DisplayName = $policy.DisplayName
                        Description = $policy.Description
                        Enabled = $policy.Enabled
                        Mode = $policy.Mode
                        CreatedBy = $policy.CreatedBy
                        CreatedTime = $policy.CreatedTime
                        LastModifiedBy = $policy.LastModifiedBy
                        LastModifiedTime = $policy.LastModifiedTime
                        ExchangeLocation = if ($policy.ExchangeLocation) { $policy.ExchangeLocation -join ';' } else { '' }
                        SharePointLocation = if ($policy.SharePointLocation) { $policy.SharePointLocation -join ';' } else { '' }
                        OneDriveLocation = if ($policy.OneDriveLocation) { $policy.OneDriveLocation -join ';' } else { '' }
                        TeamsChannelLocation = if ($policy.TeamsChannelLocation) { $policy.TeamsChannelLocation -join ';' } else { '' }
                        TeamsChatLocation = if ($policy.TeamsChatLocation) { $policy.TeamsChatLocation -join ';' } else { '' }
                        PublicFolderLocation = if ($policy.PublicFolderLocation) { $policy.PublicFolderLocation -join ';' } else { '' }
                        RestrictiveRetention = $policy.RestrictiveRetention
                    }
                    
                    $discoveryData.RetentionPolicies += $retentionInfo
                }
                
                Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.RetentionPolicies) Retention policies" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Retention policies: $($_.Exception.Message)")
            }

            # 4e. Discover Alert Policies
            Write-DLPLog -Level "INFO" -Message "Discovering Alert policies..." -Context $Context
            try {
                $alertPolicies = Get-AlertPolicy -ErrorAction Stop
                
                foreach ($policy in $alertPolicies) {
                    $discoveryData.Statistics.AlertPolicies++
                    
                    $alertInfo = @{
                        AlertPolicyName = $policy.Name
                        DisplayName = $policy.DisplayName
                        Description = $policy.Description
                        Category = $policy.Category
                        Operation = if ($policy.Operation) { $policy.Operation -join ';' } else { '' }
                        UserId = if ($policy.UserId) { $policy.UserId -join ';' } else { '' }
                        Condition = $policy.Condition
                        NotificationCulture = $policy.NotificationCulture
                        NotifyUser = if ($policy.NotifyUser) { $policy.NotifyUser -join ';' } else { '' }
                        NotificationEnabled = $policy.NotificationEnabled
                        AggregationType = $policy.AggregationType
                        Threshold = $policy.Threshold
                        TimeWindow = $policy.TimeWindow
                        Severity = $policy.Severity
                        Disabled = $policy.Disabled
                        CreatedBy = $policy.CreatedBy
                        CreatedTime = $policy.CreatedTime
                        LastModifiedBy = $policy.LastModifiedBy
                        LastModifiedTime = $policy.LastModifiedTime
                    }
                    
                    $discoveryData.AlertPolicies += $alertInfo
                }
                
                Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.AlertPolicies) Alert policies" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Alert policies: $($_.Exception.Message)")
            }
        }

        # 4f. Additional Graph API discoveries (if available)
        if ($useGraph) {
            Write-DLPLog -Level "INFO" -Message "Discovering additional compliance data via Graph API..." -Context $Context
            try {
                # Try to get data classifications via Graph
                $dataClassifications = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/informationProtection/dataLossPreventionPolicies" -Method GET -ErrorAction SilentlyContinue
                
                if ($dataClassifications -and $dataClassifications.value) {
                    foreach ($classification in $dataClassifications.value) {
                        $discoveryData.Statistics.DataClassifications++
                        
                        $classificationInfo = @{
                            PolicyId = $classification.id
                            DisplayName = $classification.displayName
                            Description = $classification.description
                            CreatedDateTime = $classification.createdDateTime
                            LastModifiedDateTime = $classification.lastModifiedDateTime
                        }
                        
                        $discoveryData.DataClassifications += $classificationInfo
                    }
                    
                    Write-DLPLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.DataClassifications) Data Classifications via Graph API" -Context $Context
                }
                
            } catch {
                Write-DLPLog -Level "DEBUG" -Message "Graph API data classification discovery not available: $($_.Exception.Message)" -Context $Context
            }
        }

        Write-DLPLog -Level "SUCCESS" -Message "Completed DLP discovery" -Context $Context
        Write-DLPLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalDLPPolicies) DLP policies, $($discoveryData.Statistics.TotalDLPRules) rules, $($discoveryData.Statistics.SensitiveInfoTypes) sensitive info types, $($discoveryData.Statistics.RetentionPolicies) retention policies" -Context $Context

        # 5. SAVE DISCOVERY DATA TO CSV FILES
        Write-DLPLog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save DLP Policies
            if ($discoveryData.DLPPolicies.Count -gt 0) {
                $csvPath = Join-Path $outputPath "DLPPolicies.csv"
                $discoveryData.DLPPolicies | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.DLPPolicies.Count) DLP policies to $csvPath" -Context $Context
            }
            
            # Save DLP Rules
            if ($discoveryData.DLPRules.Count -gt 0) {
                $csvPath = Join-Path $outputPath "DLPRules.csv"
                $discoveryData.DLPRules | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.DLPRules.Count) DLP rules to $csvPath" -Context $Context
            }
            
            # Save Sensitive Information Types
            if ($discoveryData.SensitiveInfoTypes.Count -gt 0) {
                $csvPath = Join-Path $outputPath "SensitiveInformationTypes.csv"
                $discoveryData.SensitiveInfoTypes | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.SensitiveInfoTypes.Count) Sensitive Information Types to $csvPath" -Context $Context
            }
            
            # Save Data Classifications
            if ($discoveryData.DataClassifications.Count -gt 0) {
                $csvPath = Join-Path $outputPath "DataClassifications.csv"
                $discoveryData.DataClassifications | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.DataClassifications.Count) Data Classifications to $csvPath" -Context $Context
            }
            
            # Save Retention Policies
            if ($discoveryData.RetentionPolicies.Count -gt 0) {
                $csvPath = Join-Path $outputPath "RetentionPolicies.csv"
                $discoveryData.RetentionPolicies | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.RetentionPolicies.Count) Retention policies to $csvPath" -Context $Context
            }
            
            # Save Alert Policies
            if ($discoveryData.AlertPolicies.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AlertPolicies.csv"
                $discoveryData.AlertPolicies | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-DLPLog -Level "SUCCESS" -Message "Saved $($discoveryData.AlertPolicies.Count) Alert policies to $csvPath" -Context $Context
            }
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "DLPStatistics.csv"
            @($discoveryData.Statistics) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-DLPLog -Level "SUCCESS" -Message "Saved DLP statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 6. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-DLPLog -Level "HEADER" -Message "=== M&A DLP Discovery Module Completed ===" -Context $Context
        Write-DLPLog -Level "SUCCESS" -Message "DLP discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in DLP discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
    }
    
    return $result
}

# Helper function to ensure path exists
function Ensure-Path {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -ItemType Directory -Force | Out-Null
    }
}

Export-ModuleMember -Function Invoke-DLPDiscovery