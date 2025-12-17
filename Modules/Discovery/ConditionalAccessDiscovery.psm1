# -*- coding: utf-8-bom -*-
# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.1
# Created: 2025-08-30
# Last Modified: 2025-12-17

<#
.SYNOPSIS
    Conditional Access Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure AD Conditional Access policies, security policies, and access controls using Microsoft Graph API.
    This module provides comprehensive security policy discovery including CA policies, named locations,
    authentication methods, risk policies, and compliance settings essential for M&A security assessment.
.NOTES
    Version: 1.0.1
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Updated: 2025-12-17 - Migrated to direct credential authentication from Configuration parameter
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import authentication modules for session-based authentication (optional)
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

        # 3. EXTRACT AND VALIDATE CREDENTIALS FROM CONFIGURATION
        Write-ConditionalAccessLog -Level "INFO" -Message "Extracting credentials from Configuration parameter..." -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "Configuration object type: $($Configuration.GetType().FullName)" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "Configuration keys present: $($Configuration.Keys -join ', ')" -Context $Context

        # Extract credential components
        $TenantId = $Configuration.TenantId
        $ClientId = $Configuration.ClientId
        $ClientSecret = $Configuration.ClientSecret

        # Log detailed credential presence and masked values
        Write-ConditionalAccessLog -Level "DEBUG" -Message "Credential extraction results:" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - TenantId present: $([bool]$TenantId) | Value: $(if ($TenantId) { $TenantId } else { '<MISSING>' })" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - ClientId present: $([bool]$ClientId) | Value: $(if ($ClientId) { $ClientId } else { '<MISSING>' })" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - ClientSecret present: $([bool]$ClientSecret) | Length: $(if ($ClientSecret) { $ClientSecret.Length } else { 0 }) chars | Masked: $(if ($ClientSecret -and $ClientSecret.Length -ge 4) { $ClientSecret.Substring(0,4) + '****' } else { '<MISSING>' })" -Context $Context

        # Validate all required credentials are present
        $missingCredentials = @()
        if (-not $TenantId) { $missingCredentials += 'TenantId' }
        if (-not $ClientId) { $missingCredentials += 'ClientId' }
        if (-not $ClientSecret) { $missingCredentials += 'ClientSecret' }

        if ($missingCredentials.Count -gt 0) {
            $errorMessage = "Missing required credentials in Configuration parameter: $($missingCredentials -join ', ')"
            $result.AddError($errorMessage, $null, "Credential Validation")
            Write-ConditionalAccessLog -Level "ERROR" -Message $errorMessage -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "Configuration parameter must include: TenantId, ClientId, and ClientSecret" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Available Configuration keys: $($Configuration.Keys -join ', ')" -Context $Context
            return $result
        }

        Write-ConditionalAccessLog -Level "SUCCESS" -Message "All required credentials validated successfully" -Context $Context
        Write-ConditionalAccessLog -Level "INFO" -Message "Using credentials - Tenant: $TenantId, ClientId: $ClientId" -Context $Context

        # 4. ESTABLISH MICROSOFT GRAPH CONNECTION
        Write-ConditionalAccessLog -Level "INFO" -Message "Establishing Microsoft Graph connection using client credentials..." -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "Authentication parameters:" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - TenantId: $TenantId" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - ClientId: $ClientId" -Context $Context
        Write-ConditionalAccessLog -Level "DEBUG" -Message "  - ClientSecret: $(if ($ClientSecret.Length -ge 4) { $ClientSecret.Substring(0,4) + '****' } else { '****' }) ($($ClientSecret.Length) characters)" -Context $Context

        try {
            # Create credential object
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Converting client secret to secure string..." -Context $Context
            $secureSecret = ConvertTo-SecureString $ClientSecret -AsPlainText -Force

            Write-ConditionalAccessLog -Level "DEBUG" -Message "Creating PSCredential object with ClientId as username..." -Context $Context
            $credential = New-Object System.Management.Automation.PSCredential($ClientId, $secureSecret)

            # Attempt Graph connection
            Write-ConditionalAccessLog -Level "INFO" -Message "Connecting to Microsoft Graph API with client credentials..." -Context $Context
            Connect-MgGraph -ClientSecretCredential $credential -TenantId $TenantId -NoWelcome -ErrorAction Stop
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Connect-MgGraph command completed without errors" -Context $Context

            # Verify connection
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Verifying Graph connection context..." -Context $Context
            $mgContext = Get-MgContext -ErrorAction Stop

            if (-not $mgContext) {
                $errorMessage = "Microsoft Graph context is null after connection attempt"
                $result.AddError($errorMessage, $null, "Graph Connection")
                Write-ConditionalAccessLog -Level "ERROR" -Message $errorMessage -Context $Context
                return $result
            }

            Write-ConditionalAccessLog -Level "DEBUG" -Message "Graph context retrieved successfully" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "Context details:" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "  - TenantId: $($mgContext.TenantId)" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "  - ClientId: $($mgContext.ClientId)" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "  - AuthType: $($mgContext.AuthType)" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "  - Scopes: $($mgContext.Scopes -join ', ')" -Context $Context
            Write-ConditionalAccessLog -Level "DEBUG" -Message "  - Account: $($mgContext.Account)" -Context $Context

            # Validate tenant ID matches
            if ($mgContext.TenantId -ne $TenantId) {
                $errorMessage = "Microsoft Graph connection tenant mismatch. Expected: $TenantId, Got: $($mgContext.TenantId)"
                $result.AddError($errorMessage, $null, "Graph Connection")
                Write-ConditionalAccessLog -Level "ERROR" -Message $errorMessage -Context $Context
                return $result
            }

            Write-ConditionalAccessLog -Level "SUCCESS" -Message "Microsoft Graph connection established and verified successfully" -Context $Context
            Write-ConditionalAccessLog -Level "INFO" -Message "Connected to tenant: $($mgContext.TenantId) with scopes: $($mgContext.Scopes -join ', ')" -Context $Context

        } catch {
            $errorMessage = "Failed to connect to Microsoft Graph: $($_.Exception.Message)"
            $result.AddError($errorMessage, $_.Exception, "Graph Connection")
            Write-ConditionalAccessLog -Level "ERROR" -Message $errorMessage -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "Exception type: $($_.Exception.GetType().FullName)" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "Stack trace: $($_.Exception.StackTrace)" -Context $Context

            if ($_.Exception.InnerException) {
                Write-ConditionalAccessLog -Level "ERROR" -Message "Inner exception: $($_.Exception.InnerException.Message)" -Context $Context
            }

            Write-ConditionalAccessLog -Level "ERROR" -Message "Troubleshooting steps:" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "  1. Verify TenantId is correct: $TenantId" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "  2. Verify ClientId (Application ID) is correct: $ClientId" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "  3. Verify ClientSecret is valid and not expired" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "  4. Verify app registration has required API permissions" -Context $Context
            Write-ConditionalAccessLog -Level "ERROR" -Message "  5. Verify admin consent has been granted for API permissions" -Context $Context

            return $result
        }

        # 5. DISCOVERY EXECUTION
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

        # 5a. Discover Conditional Access Policies
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

        # 5b. Discover Named Locations
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

        # 5c. Discover Authentication Methods Policies
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

        # 5d. Discover Identity Protection Policies (if available)
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

        # 5e. Discover Security Defaults
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

        # 5f. Discover Directory Settings (Note: Get-MgDirectorySetting cmdlet is not available in Microsoft.Graph stable API)
        Write-ConditionalAccessLog -Level "INFO" -Message "Directory Settings discovery skipped - cmdlet not available" -Context $Context
        # The Microsoft.Graph module does not provide Get-MgDirectorySetting cmdlet in stable v1.0 API
        # Directory settings can be accessed via Invoke-MgGraphRequest if needed in future versions

        Write-ConditionalAccessLog -Level "SUCCESS" -Message "Completed Conditional Access discovery" -Context $Context
        Write-ConditionalAccessLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalCAPolicies) CA policies, $($discoveryData.Statistics.NamedLocations) locations, $($discoveryData.Statistics.AuthenticationMethods) auth methods, $($discoveryData.Statistics.RiskPolicies) risk policies" -Context $Context

        # 6. SAVE DISCOVERY DATA TO CSV FILES
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

        # 7. SET RESULT DATA
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
