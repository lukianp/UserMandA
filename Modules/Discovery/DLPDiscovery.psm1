# -*- coding: utf-8-bom -*-
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

# Import required modules if available
try {
    # Import Authentication Service for connection management
    if (Get-Module -Name AuthenticationService -ListAvailable -ErrorAction SilentlyContinue) {
        Import-Module AuthenticationService -ErrorAction SilentlyContinue
    }
} catch {
    Write-Debug "AuthenticationService module not available: $($_.Exception.Message)"
}

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

function Connect-MgGraphWithMultipleStrategies {
    <#
    .SYNOPSIS
        Connects to Microsoft Graph using multiple authentication strategies with automatic fallback
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-DLPLog -Level "INFO" -Message "Attempting Microsoft Graph authentication with multiple strategies..." -Context $Context

    $dlpScopes = @("InformationProtectionPolicy.Read.All", "Directory.Read.All", "User.Read.All")

    # Strategy 1: Client Secret Credential
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 1: Attempting Client Secret authentication..." -Context $Context
            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
            Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-DLPLog -Level "SUCCESS" -Message "Strategy 1: Client Secret authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 1: Client Secret auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 2: Certificate-Based Authentication
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 2: Attempting Certificate authentication..." -Context $Context
            Connect-MgGraph -ClientId $Configuration.ClientId -TenantId $Configuration.TenantId -CertificateThumbprint $Configuration.CertificateThumbprint -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-DLPLog -Level "SUCCESS" -Message "Strategy 2: Certificate authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 2: Certificate auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 3: Device Code Flow
    if ($Configuration.TenantId) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 3: Attempting Device Code authentication..." -Context $Context
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $dlpScopes -UseDeviceCode -NoWelcome -ErrorAction Stop
            $context = Get-MgContext
            if ($context -and $context.TenantId) {
                Write-DLPLog -Level "SUCCESS" -Message "Strategy 3: Device Code authentication successful" -Context $Context
                return $context
            }
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 3: Device Code auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 4: Interactive Browser Authentication
    try {
        Write-DLPLog -Level "INFO" -Message "Strategy 4: Attempting Interactive authentication..." -Context $Context
        if ($Configuration.TenantId) {
            Connect-MgGraph -TenantId $Configuration.TenantId -Scopes $dlpScopes -NoWelcome -ErrorAction Stop
        } else {
            Connect-MgGraph -Scopes $dlpScopes -NoWelcome -ErrorAction Stop
        }
        $context = Get-MgContext
        if ($context -and $context.TenantId) {
            Write-DLPLog -Level "SUCCESS" -Message "Strategy 4: Interactive authentication successful" -Context $Context
            return $context
        }
    } catch {
        Write-DLPLog -Level "ERROR" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Context $Context
    }

    Write-DLPLog -Level "ERROR" -Message "All Microsoft Graph authentication strategies exhausted" -Context $Context
    return $null
}

function Connect-ExchangeOnlineWithMultipleStrategies {
    <#
    .SYNOPSIS
        Connects to Exchange Online using multiple authentication strategies with automatic fallback
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-DLPLog -Level "INFO" -Message "Attempting Exchange Online authentication with multiple strategies..." -Context $Context

    # Strategy 1: Certificate Thumbprint (preferred for automation)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.CertificateThumbprint) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 1: Attempting Certificate authentication..." -Context $Context
            Connect-ExchangeOnline -AppId $Configuration.ClientId -CertificateThumbprint $Configuration.CertificateThumbprint -Organization $Configuration.TenantId -ShowBanner:$false -ErrorAction Stop
            Write-DLPLog -Level "SUCCESS" -Message "Strategy 1: Certificate authentication successful" -Context $Context
            return $true
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 1: Certificate auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 2: Client Secret (fallback for certificate issues)
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 2: Attempting Client Secret authentication..." -Context $Context
            Connect-ExchangeOnline -AppId $Configuration.ClientId -CertificateThumbprint $null -Organization $Configuration.TenantId -ShowBanner:$false -ErrorAction Stop
            Write-DLPLog -Level "SUCCESS" -Message "Strategy 2: Client Secret authentication successful" -Context $Context
            return $true
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 2: Client Secret auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 3: Modern Auth with User Principal
    if ($Configuration.UserPrincipalName) {
        try {
            Write-DLPLog -Level "INFO" -Message "Strategy 3: Attempting User Principal authentication..." -Context $Context
            Connect-ExchangeOnline -UserPrincipalName $Configuration.UserPrincipalName -ShowBanner:$false -ErrorAction Stop
            Write-DLPLog -Level "SUCCESS" -Message "Strategy 3: User Principal authentication successful" -Context $Context
            return $true
        } catch {
            Write-DLPLog -Level "WARN" -Message "Strategy 3: User Principal auth failed: $($_.Exception.Message)" -Context $Context
        }
    }

    # Strategy 4: Interactive Authentication (GUI required - last resort)
    try {
        Write-DLPLog -Level "INFO" -Message "Strategy 4: Attempting Interactive authentication..." -Context $Context
        Connect-ExchangeOnline -ShowBanner:$false -ErrorAction Stop
        Write-DLPLog -Level "SUCCESS" -Message "Strategy 4: Interactive authentication successful" -Context $Context
        return $true
    } catch {
        Write-DLPLog -Level "ERROR" -Message "Strategy 4: Interactive auth failed: $($_.Exception.Message)" -Context $Context
    }

    Write-DLPLog -Level "ERROR" -Message "All Exchange Online authentication strategies exhausted" -Context $Context
    return $false
}

function Invoke-DLPDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    # START: Enhanced discovery context validation and initialization
    Write-DLPLog -Level "HEADER" -Message "=== M&A DLP Discovery Module Starting ===" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "DLP discovery completed successfully"
        Data = @{}
        Errors = @()
        Warnings = @()
        Context = $Context
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
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-DLPLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-DLPLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. ESTABLISH AND VALIDATE CONNECTION METHODS
        Write-DLPLog -Level "INFO" -Message "Establishing and validating connection methods..." -Context $Context

        $useGraph = $false
        $useExchangeOnline = $false

        # Try to establish Microsoft Graph connection using Authentication Service
        try {
            Write-DLPLog -Level "INFO" -Message "Attempting to connect to Microsoft Graph..." -Context $Context

            # Import Authentication Service if available
            if (Get-Module -Name AuthenticationService -ErrorAction SilentlyContinue) {
                try {
                    $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId -ErrorAction Stop
                    if ($graphAuth -and $graphAuth.Connected) {
                        $useGraph = $true
                        Write-DLPLog -Level "SUCCESS" -Message "Microsoft Graph connection established successfully" -Context $Context
                    }
                } catch {
                    Write-DLPLog -Level "DEBUG" -Message "AuthenticationService Graph connection failed: $($_.Exception.Message)" -Context $Context
                }
            }

            # Fallback: Check for existing Microsoft Graph connection
            if (-not $useGraph) {
                $mgContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($mgContext -and $mgContext.Account) {
                    $useGraph = $true
                    Write-DLPLog -Level "SUCCESS" -Message "Microsoft Graph connection already available. Account: $($mgContext.Account)" -Context $Context
                } else {
                    Write-DLPLog -Level "DEBUG" -Message "No existing Microsoft Graph connection found" -Context $Context
                }
            }
        } catch {
            Write-DLPLog -Level "DEBUG" -Message "Microsoft Graph connection establishment failed: $($_.Exception.Message)" -Context $Context
        }

        # Try to establish Exchange Online connection
        try {
            Write-DLPLog -Level "INFO" -Message "Attempting to connect to Exchange Online..." -Context $Context

            # Check for existing Exchange Online connection first
            try {
                $exoSession = Get-ConnectionInformation -ErrorAction SilentlyContinue
                if ($exoSession -and $exoSession.State -eq 'Connected') {
                    $useExchangeOnline = $true
                    Write-DLPLog -Level "SUCCESS" -Message "Exchange Online connection already available" -Context $Context
                }
            } catch {
                Write-DLPLog -Level "DEBUG" -Message "Checking existing Exchange Online connection failed: $($_.Exception.Message)" -Context $Context
            }

            # If no existing connection, try to establish one
            if (-not $useExchangeOnline) {
                # Try using Connect-ExchangeOnline if available and credentials exist
                if ((Get-Command Connect-ExchangeOnline -ErrorAction SilentlyContinue) -and
                    $Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {

                    try {
                        Write-DLPLog -Level "INFO" -Message "Attempting to connect to Exchange Online using provided credentials..." -Context $Context

                        # Convert client secret to secure string
                        $secureSecret = if ($Configuration.ClientSecret -is [SecureString]) {
                            $Configuration.ClientSecret
                        } else {
                            ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
                        }

                        # Import required modules
                        if (Get-Module -Name ExchangeOnlineManagement -ListAvailable -ErrorAction SilentlyContinue) {
                            Import-Module ExchangeOnlineManagement -ErrorAction SilentlyContinue
                        }

                        # Establish connection
                        Connect-ExchangeOnline -AppId $Configuration.ClientId -CertificateThumbprint $null -Organization $Configuration.TenantId -ShowBanner:$false

                        # Verify connection
                        $verifySession = Get-ConnectionInformation -ErrorAction SilentlyContinue
                        if ($verifySession -and $verifySession.State -eq 'Connected') {
                            $useExchangeOnline = $true
                            Write-DLPLog -Level "SUCCESS" -Message "Exchange Online connection established successfully" -Context $Context
                        }
                    } catch {
                        Write-DLPLog -Level "DEBUG" -Message "Exchange Online connection attempt failed: $($_.Exception.Message)" -Context $Context
                    }
                } else {
                    Write-DLPLog -Level "DEBUG" -Message "Exchange Online Management module not available or credentials incomplete" -Context $Context
                }
            }
        } catch {
            Write-DLPLog -Level "DEBUG" -Message "Exchange Online connection establishment failed: $($_.Exception.Message)" -Context $Context
        }

        if (-not $useGraph -and -not $useExchangeOnline) {
            $result.AddError("Could not establish connection to either Microsoft Graph or Exchange Online. Please ensure credentials are properly configured and required modules are installed.", $null, "Connection Validation")
            return $result
        }

        # Log available connections
        $availableServices = @()
        if ($useGraph) { $availableServices += "Microsoft Graph" }
        if ($useExchangeOnline) { $availableServices += "Exchange Online" }
        Write-DLPLog -Level "INFO" -Message "Connected to services: $($availableServices -join ', ')" -Context $Context

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