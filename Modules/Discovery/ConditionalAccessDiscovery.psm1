# -*- coding: utf-8-bom -*-
# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-31

<#
.SYNOPSIS
    Conditional Access Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure AD Conditional Access policies, security policies, and access controls using Microsoft Graph API.
    This module provides comprehensive security policy discovery including CA policies, named locations,
    authentication methods, risk policies, and compliance settings essential for M&A security assessment.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Updated: 2025-08-31 - Integrated with session-based authentication system
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module, AuthenticationService module
#>

# Import authentication modules for session-based authentication
try {
    $authModules = @(
        (Join-Path $PSScriptRoot "..\Authentication\AuthenticationService.psm1"),
        (Join-Path $PSScriptRoot "..\Authentication\SessionManager.psm1"),
        (Join-Path $PSScriptRoot "..\Authentication\AuthSession.psm1")
    )

    foreach ($module in $authModules) {
        if (Test-Path $module) {
            Import-Module $module -Force -ErrorAction SilentlyContinue
        }
    }
} catch {
    # Authentication modules will be imported by orchestrator if needed
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

function Write-ConditionalAccessLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter()]
        [string]$Level = "INFO",
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    Write-MandALog -Message $Message -Level $Level -Component "ConditionalAccessDiscovery" -Context $Context
}

function Invoke-ConditionalAccessDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$false)]
        [AllowEmptyString()]
        [AllowNull()]
        [string]$SessionId
    )
    
    # START: Enhanced discovery context validation and initialization
    Write-ConditionalAccessLog -Level "HEADER" -Message "=== M&A Conditional Access Discovery Module Starting ===" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "Conditional Access discovery completed successfully"
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
        Write-ConditionalAccessLog -Level "ERROR" -Message $message -Context $this.Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-ConditionalAccessLog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-ConditionalAccessLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-ConditionalAccessLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. ESTABLISH GRAPH CONNECTION (FLEXIBLE APPROACH)
        Write-ConditionalAccessLog -Level "INFO" -Message "Checking available connection methods..." -Context $Context

        $useGraph = $false
        $useExistingGraph = $false
        $useSessionGraph = $false

        # First, check for existing Microsoft Graph connection (preferred method)
        try {
            $mgContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($mgContext -and $mgContext.Account) {
                $useGraph = $true
                $useExistingGraph = $true
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Existing Microsoft Graph connection available. Account: $($mgContext.Account)" -Context $Context
            } else {
                Write-ConditionalAccessLog -Level "DEBUG" -Message "No existing Microsoft Graph connection found" -Context $Context
            }
        } catch {
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Error checking existing Microsoft Graph connection: $($_.Exception.Message)" -Context $Context
        }

        # If no existing connection, try session-based authentication as fallback
        if (-not $useExistingGraph -and $SessionId) {
            try {
                Write-ConditionalAccessLog -Level "INFO" -Message "Attempting to establish Microsoft Graph connection via Authentication Service..." -Context $Context
                Write-ConditionalAccessLog -Level "DEBUG" -Message "Using SessionId: $SessionId" -Context $Context

                # Get Microsoft Graph authentication via the unified service
                $graphConnection = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId

                if ($graphConnection -and $graphConnection.Connected) {
                    Write-ConditionalAccessLog -Level "SUCCESS" -Message "Microsoft Graph connection established successfully via Authentication Service" -Context $Context
                    $useGraph = $true
                    $useSessionGraph = $true
                } else {
                    Write-ConditionalAccessLog -Level "WARNING" -Message "Failed to establish Microsoft Graph connection via Authentication Service" -Context $Context
                }
            } catch {
                Write-ConditionalAccessLog -Level "WARNING" -Message "Session-based authentication failed: $($_.Exception.Message)" -Context $Context
            }
        }

        # If still no Graph connection and SessionId was provided, this is an error
        if (-not $useGraph) {
            if ($SessionId) {
                $result.AddError("Unable to establish Microsoft Graph connection. Please ensure you have a valid authentication session and try again.", $null, "Graph Connection")
                return $result
            } else {
                $result.AddError("No Microsoft Graph connection available. Please either connect using Connect-MgGraph, provide a valid SessionId, or run this through the M&A Orchestrator for proper authentication.", $null, "Graph Connection")
                return $result
            }
        }

        Write-ConditionalAccessLog -Level "SUCCESS" -Message "Authentication method established: $(if ($useExistingGraph) { 'Existing Connection' } else { 'Session Authentication' })" -Context $Context

        # 4. DISCOVERY EXECUTION
        Write-ConditionalAccessLog -Level "HEADER" -Message "Starting Conditional Access Discovery Process" -Context $Context
        
        $discoveryData = @{
            ConditionalAccessPolicies = @()
            NamedLocations = @()
            AuthenticationMethods = @()
            IdentityProtectionPolicies = @()
            TrustFrameworkPolicies = @()
            DirectorySettings = @()
            SecurityDefaults = @()
            Statistics = @{
                TotalCAPolicies = 0
                EnabledCAPolicies = 0
                DisabledCAPolicies = 0
                ReportOnlyCAPolicies = 0
                NamedLocations = 0
                AuthenticationMethods = 0
                RiskPolicies = 0
            }
        }

        # 4a. Discover Conditional Access Policies
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Conditional Access policies..." -Context $Context
        try {
            $caPolicies = Get-MgIdentityConditionalAccessPolicy -All -ErrorAction Stop
            
            foreach ($policy in $caPolicies) {
                $discoveryData.Statistics.TotalCAPolicies++
                
                switch ($policy.State) {
                    'enabled' { $discoveryData.Statistics.EnabledCAPolicies++ }
                    'disabled' { $discoveryData.Statistics.DisabledCAPolicies++ }
                    'enabledForReportingButNotEnforced' { $discoveryData.Statistics.ReportOnlyCAPolicies++ }
                }
                
                $policyInfo = @{
                    PolicyId = $policy.Id
                    DisplayName = $policy.DisplayName
                    Description = $policy.Description
                    State = $policy.State
                    CreatedDateTime = $policy.CreatedDateTime
                    ModifiedDateTime = $policy.ModifiedDateTime
                    
                    # Conditions
                    IncludeUsers = if ($policy.Conditions.Users.IncludeUsers) { $policy.Conditions.Users.IncludeUsers -join ';' } else { '' }
                    ExcludeUsers = if ($policy.Conditions.Users.ExcludeUsers) { $policy.Conditions.Users.ExcludeUsers -join ';' } else { '' }
                    IncludeGroups = if ($policy.Conditions.Users.IncludeGroups) { $policy.Conditions.Users.IncludeGroups -join ';' } else { '' }
                    ExcludeGroups = if ($policy.Conditions.Users.ExcludeGroups) { $policy.Conditions.Users.ExcludeGroups -join ';' } else { '' }
                    IncludeRoles = if ($policy.Conditions.Users.IncludeRoles) { $policy.Conditions.Users.IncludeRoles -join ';' } else { '' }
                    ExcludeRoles = if ($policy.Conditions.Users.ExcludeRoles) { $policy.Conditions.Users.ExcludeRoles -join ';' } else { '' }
                    
                    IncludeApplications = if ($policy.Conditions.Applications.IncludeApplications) { $policy.Conditions.Applications.IncludeApplications -join ';' } else { '' }
                    ExcludeApplications = if ($policy.Conditions.Applications.ExcludeApplications) { $policy.Conditions.Applications.ExcludeApplications -join ';' } else { '' }
                    IncludeUserActions = if ($policy.Conditions.Applications.IncludeUserActions) { $policy.Conditions.Applications.IncludeUserActions -join ';' } else { '' }
                    
                    IncludeLocations = if ($policy.Conditions.Locations.IncludeLocations) { $policy.Conditions.Locations.IncludeLocations -join ';' } else { '' }
                    ExcludeLocations = if ($policy.Conditions.Locations.ExcludeLocations) { $policy.Conditions.Locations.ExcludeLocations -join ';' } else { '' }
                    
                    Platforms = if ($policy.Conditions.Platforms.IncludePlatforms) { $policy.Conditions.Platforms.IncludePlatforms -join ';' } else { '' }
                    ExcludePlatforms = if ($policy.Conditions.Platforms.ExcludePlatforms) { $policy.Conditions.Platforms.ExcludePlatforms -join ';' } else { '' }
                    
                    ClientAppTypes = if ($policy.Conditions.ClientAppTypes) { $policy.Conditions.ClientAppTypes -join ';' } else { '' }
                    SignInRiskLevels = if ($policy.Conditions.SignInRiskLevels) { $policy.Conditions.SignInRiskLevels -join ';' } else { '' }
                    UserRiskLevels = if ($policy.Conditions.UserRiskLevels) { $policy.Conditions.UserRiskLevels -join ';' } else { '' }
                    
                    # Grant Controls
                    BuiltInControls = if ($policy.GrantControls.BuiltInControls) { $policy.GrantControls.BuiltInControls -join ';' } else { '' }
                    CustomAuthenticationFactors = if ($policy.GrantControls.CustomAuthenticationFactors) { $policy.GrantControls.CustomAuthenticationFactors -join ';' } else { '' }
                    TermsOfUse = if ($policy.GrantControls.TermsOfUse) { $policy.GrantControls.TermsOfUse -join ';' } else { '' }
                    Operator = $policy.GrantControls.Operator
                    
                    # Session Controls
                    ApplicationEnforcedRestrictions = if ($policy.SessionControls.ApplicationEnforcedRestrictions) { $policy.SessionControls.ApplicationEnforcedRestrictions.IsEnabled } else { $false }
                    CloudAppSecurity = if ($policy.SessionControls.CloudAppSecurity) { $policy.SessionControls.CloudAppSecurity.IsEnabled } else { $false }
                    PersistentBrowser = if ($policy.SessionControls.PersistentBrowser) { $policy.SessionControls.PersistentBrowser.IsEnabled } else { $false }
                    SignInFrequency = if ($policy.SessionControls.SignInFrequency) { "$($policy.SessionControls.SignInFrequency.IsEnabled):$($policy.SessionControls.SignInFrequency.Type):$($policy.SessionControls.SignInFrequency.Value)" } else { '' }
                }
                
                $discoveryData.ConditionalAccessPolicies += $policyInfo
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalCAPolicies) Conditional Access policies ($($discoveryData.Statistics.EnabledCAPolicies) enabled, $($discoveryData.Statistics.DisabledCAPolicies) disabled, $($discoveryData.Statistics.ReportOnlyCAPolicies) report-only)" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Conditional Access policies: $($_.Exception.Message)")
        }

        # 4b. Discover Named Locations
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Named Locations..." -Context $Context
        try {
            $namedLocations = Get-MgIdentityConditionalAccessNamedLocation -All -ErrorAction Stop
            
            foreach ($location in $namedLocations) {
                $discoveryData.Statistics.NamedLocations++
                
                $locationInfo = @{
                    LocationId = $location.Id
                    DisplayName = $location.DisplayName
                    CreatedDateTime = $location.CreatedDateTime
                    ModifiedDateTime = $location.ModifiedDateTime
                    ODataType = $location.AdditionalProperties.'@odata.type'
                }
                
                # Add specific properties based on location type
                if ($location.AdditionalProperties.'@odata.type' -eq '#microsoft.graph.ipNamedLocation') {
                    $locationInfo.IsTrusted = $location.AdditionalProperties.isTrusted
                    $locationInfo.IpRanges = if ($location.AdditionalProperties.ipRanges) { 
                        ($location.AdditionalProperties.ipRanges | ForEach-Object { 
                            if ($_.cidrAddress) { $_.cidrAddress } else { "$($_.lowerAddress)-$($_.upperAddress)" }
                        }) -join ';' 
                    } else { '' }
                } elseif ($location.AdditionalProperties.'@odata.type' -eq '#microsoft.graph.countryNamedLocation') {
                    $locationInfo.CountriesAndRegions = if ($location.AdditionalProperties.countriesAndRegions) { $location.AdditionalProperties.countriesAndRegions -join ';' } else { '' }
                    $locationInfo.IncludeUnknownCountriesAndRegions = $location.AdditionalProperties.includeUnknownCountriesAndRegions
                }
                
                $discoveryData.NamedLocations += $locationInfo
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.NamedLocations) Named Locations" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Named Locations: $($_.Exception.Message)")
        }

        # 4c. Discover Authentication Methods Policies
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Authentication Methods policies..." -Context $Context
        try {
            # Get authentication methods policy
            $authMethodsPolicy = Get-MgPolicyAuthenticationMethodPolicy -ErrorAction Stop
            
            if ($authMethodsPolicy) {
                $authMethodInfo = @{
                    PolicyId = $authMethodsPolicy.Id
                    DisplayName = $authMethodsPolicy.DisplayName
                    Description = $authMethodsPolicy.Description
                    LastModifiedDateTime = $authMethodsPolicy.LastModifiedDateTime
                    PolicyVersion = $authMethodsPolicy.PolicyVersion
                    ReconfirmationInDays = $authMethodsPolicy.ReconfirmationInDays
                    RegistrationEnforcement = if ($authMethodsPolicy.RegistrationEnforcement) { 
                        "AuthenticationMethodsRegistrationCampaignIncludeTargets:$($authMethodsPolicy.RegistrationEnforcement.AuthenticationMethodsRegistrationCampaign.IncludeTargets.Count)" 
                    } else { '' }
                }
                
                $discoveryData.AuthenticationMethods += $authMethodInfo
                $discoveryData.Statistics.AuthenticationMethods++
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.AuthenticationMethods) Authentication Methods policies" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Authentication Methods policies: $($_.Exception.Message)")
        }

        # 4d. Discover Identity Protection Policies (if available)
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Identity Protection policies..." -Context $Context
        try {
            # Try to get identity protection policies via Graph API
            $riskPolicies = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/policies" -Method GET -ErrorAction SilentlyContinue
            
            if ($riskPolicies -and $riskPolicies.value) {
                foreach ($policy in $riskPolicies.value) {
                    if ($policy.'@odata.type' -in @('#microsoft.graph.identitySecurityDefaultsEnforcementPolicy', '#microsoft.graph.riskBasedPolicy')) {
                        $discoveryData.Statistics.RiskPolicies++
                        
                        $riskPolicyInfo = @{
                            PolicyId = $policy.id
                            PolicyType = $policy.'@odata.type'
                            DisplayName = $policy.displayName
                            Description = $policy.description
                            IsEnabled = $policy.isEnabled
                            LastModifiedDateTime = $policy.lastModifiedDateTime
                        }
                        
                        $discoveryData.IdentityProtectionPolicies += $riskPolicyInfo
                    }
                }
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.RiskPolicies) Identity Protection policies" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Identity Protection policies: $($_.Exception.Message)")
        }

        # 4e. Discover Security Defaults
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Security Defaults..." -Context $Context
        try {
            $securityDefaults = Get-MgPolicyIdentitySecurityDefaultEnforcementPolicy -ErrorAction Stop
            
            if ($securityDefaults) {
                $securityDefaultsInfo = @{
                    PolicyId = $securityDefaults.Id
                    DisplayName = $securityDefaults.DisplayName
                    Description = $securityDefaults.Description
                    IsEnabled = $securityDefaults.IsEnabled
                    LastModifiedDateTime = $securityDefaults.LastModifiedDateTime
                }
                
                $discoveryData.SecurityDefaults += $securityDefaultsInfo
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered Security Defaults configuration" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Security Defaults: $($_.Exception.Message)")
        }

        # 4f. Discover Directory Settings
        Write-ConditionalAccessLog -Level "INFO" -Message "Discovering Directory Settings..." -Context $Context
        try {
            $directorySettings = Get-MgDirectorySetting -All -ErrorAction Stop
            
            foreach ($setting in $directorySettings) {
                $settingInfo = @{
                    SettingId = $setting.Id
                    DisplayName = $setting.DisplayName
                    TemplateId = $setting.TemplateId
                    Values = if ($setting.Values) { ($setting.Values | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                }
                
                $discoveryData.DirectorySettings += $settingInfo
            }
            
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Discovered $($directorySettings.Count) Directory Settings" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover Directory Settings: $($_.Exception.Message)")
        }

        Write-ConditionalAccessLog -Level "SUCCESS" -Message "Completed Conditional Access discovery" -Context $Context
        Write-ConditionalAccessLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalCAPolicies) CA policies, $($discoveryData.Statistics.NamedLocations) locations, $($discoveryData.Statistics.AuthenticationMethods) auth methods, $($discoveryData.Statistics.RiskPolicies) risk policies" -Context $Context

        # 5. SAVE DISCOVERY DATA TO CSV FILES
        Write-ConditionalAccessLog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save Conditional Access Policies
            if ($discoveryData.ConditionalAccessPolicies.Count -gt 0) {
                $csvPath = Join-Path $outputPath "ConditionalAccessPolicies.csv"
                $discoveryData.ConditionalAccessPolicies | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved $($discoveryData.ConditionalAccessPolicies.Count) Conditional Access policies to $csvPath" -Context $Context
            }
            
            # Save Named Locations
            if ($discoveryData.NamedLocations.Count -gt 0) {
                $csvPath = Join-Path $outputPath "NamedLocations.csv"
                $discoveryData.NamedLocations | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved $($discoveryData.NamedLocations.Count) Named Locations to $csvPath" -Context $Context
            }
            
            # Save Authentication Methods
            if ($discoveryData.AuthenticationMethods.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AuthenticationMethods.csv"
                $discoveryData.AuthenticationMethods | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved $($discoveryData.AuthenticationMethods.Count) Authentication Methods to $csvPath" -Context $Context
            }
            
            # Save Identity Protection Policies
            if ($discoveryData.IdentityProtectionPolicies.Count -gt 0) {
                $csvPath = Join-Path $outputPath "IdentityProtectionPolicies.csv"
                $discoveryData.IdentityProtectionPolicies | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved $($discoveryData.IdentityProtectionPolicies.Count) Identity Protection policies to $csvPath" -Context $Context
            }
            
            # Save Security Defaults
            if ($discoveryData.SecurityDefaults.Count -gt 0) {
                $csvPath = Join-Path $outputPath "SecurityDefaults.csv"
                $discoveryData.SecurityDefaults | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved Security Defaults configuration to $csvPath" -Context $Context
            }
            
            # Save Directory Settings
            if ($discoveryData.DirectorySettings.Count -gt 0) {
                $csvPath = Join-Path $outputPath "DirectorySettings.csv"
                $discoveryData.DirectorySettings | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved $($discoveryData.DirectorySettings.Count) Directory Settings to $csvPath" -Context $Context
            }
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "ConditionalAccessStatistics.csv"
            @($discoveryData.Statistics) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Saved Conditional Access statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 6. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-ConditionalAccessLog -Level "HEADER" -Message "=== M&A Conditional Access Discovery Module Completed ===" -Context $Context
        Write-ConditionalAccessLog -Level "SUCCESS" -Message "Conditional Access discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in Conditional Access discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
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

Export-ModuleMember -Function Invoke-ConditionalAccessDiscovery