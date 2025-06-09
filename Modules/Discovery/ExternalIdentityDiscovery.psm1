# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: ExternalIdentity
# Description: Discovers B2B guest users, collaboration settings, external 
#              identity providers, and partner organizations.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Standardized pattern to extract credentials passed by the orchestrator.
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication -and $Configuration.authentication._Credentials) { return $Configuration.authentication._Credentials }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    # Return null if no credentials found
    return $null
}

function Write-ExternalIdentityLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    # Module-specific wrapper for consistent logging component name.
    # The global Write-MandALog function is guaranteed to exist.
    Write-MandALog -Message "[ExternalIdentity] $Message" -Level $Level -Component "ExternalIdentityDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-ExternalIdentityDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-ExternalIdentityLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    # The DiscoveryResult class is loaded by the orchestrator.
    # This fallback provides resilience in case the class definition fails to load.
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('ExternalIdentity')
    } else {
        # Fallback to a hashtable that mimics the class structure and methods.
        $result = @{
            Success      = $true; ModuleName = 'ExternalIdentity'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); Warnings = [System.Collections.ArrayList]::new(); Metadata = @{};
            StartTime    = Get-Date; EndTime = $null; ExecutionId = [guid]::NewGuid().ToString();
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

        # 3. AUTHENTICATE & CONNECT
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        if (-not $authInfo) {
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }

        # Get Graph API token
        $authResponse = Get-GraphApiToken -AuthInfo $authInfo -Context $Context
        if (-not $authResponse -or -not $authResponse.access_token) {
            $result.AddError("Failed to acquire Microsoft Graph token.", $null, @{Component = "Authentication"})
            return $result
        }
        Write-ExternalIdentityLog -Level "SUCCESS" -Message "Successfully acquired Graph API token." -Context $Context

        # 4. PERFORM DISCOVERY
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover B2B Guest Users
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering B2B Guest Users..." -Context $Context
            $guestUsers = Get-B2BGuestUsers -AuthResponse $authResponse -Context $Context
            $null = $allDiscoveredData.AddRange($guestUsers)
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovered $($guestUsers.Count) B2B guest users." -Context $Context
            
            # 5. EXPORT DATA TO CSV
            if ($guestUsers.Count -gt 0) {
                Export-DiscoveryData -Data $guestUsers -OutputPath $outputPath -FileName "ExternalIdentity_B2BGuests.csv" -ModuleName "ExternalIdentity"
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported B2B guest users to CSV." -Context $Context
            }

            $result.Metadata["B2BGuestCount"] = $guestUsers.Count

        } catch {
            $result.AddWarning("Failed to discover B2B Guest Users. Error: $($_.Exception.Message)", @{Operation = "GetB2BGuests"})
        }
        
        # Discover External Collaboration Settings
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering External Collaboration Settings..." -Context $Context
            $collabSettings = Get-ExternalCollaborationSettings -AuthResponse $authResponse -Context $Context
            if ($collabSettings) {
                $null = $allDiscoveredData.Add($collabSettings)
                Write-ExternalIdentityLog -Level "INFO" -Message "Discovered external collaboration settings." -Context $Context
                
                Export-DiscoveryData -Data @($collabSettings) -OutputPath $outputPath -FileName "ExternalIdentity_CollaborationSettings.csv" -ModuleName "ExternalIdentity"
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported collaboration settings to CSV." -Context $Context
                
                $result.Metadata["CollaborationSettingsFound"] = $true
            }

        } catch {
            $result.AddWarning("Failed to discover Collaboration Settings. Error: $($_.Exception.Message)", @{Operation = "GetCollaborationSettings"})
        }
        
        # Discover Identity Providers
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering Identity Providers..." -Context $Context
            $identityProviders = Get-IdentityProviders -AuthResponse $authResponse -Context $Context
            $null = $allDiscoveredData.AddRange($identityProviders)
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovered $($identityProviders.Count) identity providers." -Context $Context
            
            if ($identityProviders.Count -gt 0) {
                Export-DiscoveryData -Data $identityProviders -OutputPath $outputPath -FileName "ExternalIdentity_IdentityProviders.csv" -ModuleName "ExternalIdentity"
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported identity providers to CSV." -Context $Context
            }

            $result.Metadata["IdentityProviderCount"] = $identityProviders.Count

        } catch {
            $result.AddWarning("Failed to discover Identity Providers. Error: $($_.Exception.Message)", @{Operation = "GetIdentityProviders"})
        }

        # Discover Partner Organizations (from guest user domains)
        try {
            if ($guestUsers.Count -gt 0) {
                Write-ExternalIdentityLog -Level "INFO" -Message "Analyzing partner organizations from guest users..." -Context $Context
                $partnerOrgs = Get-PartnerOrganizations -GuestUsers $guestUsers -Configuration $Configuration -Context $Context
                $null = $allDiscoveredData.AddRange($partnerOrgs)
                Write-ExternalIdentityLog -Level "INFO" -Message "Identified $($partnerOrgs.Count) partner organizations." -Context $Context
                
                if ($partnerOrgs.Count -gt 0) {
                    Export-DiscoveryData -Data $partnerOrgs -OutputPath $outputPath -FileName "ExternalIdentity_PartnerOrganizations.csv" -ModuleName "ExternalIdentity"
                    Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported partner organizations to CSV." -Context $Context
                }

                $result.Metadata["PartnerOrganizationCount"] = $partnerOrgs.Count
            }

        } catch {
            $result.AddWarning("Failed to analyze partner organizations. Error: $($_.Exception.Message)", @{Operation = "GetPartnerOrganizations"})
        }

        # 6. FINALIZE & UPDATE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["OutputPath"] = $outputPath

    } catch {
        # This is the top-level catch for critical, unrecoverable errors.
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, @{Operation = "ExternalIdentityDiscovery"})
    } finally {
        # 7. CLEANUP & COMPLETE
        # No persistent connections to clean up for Graph API
        
        $stopwatch.Stop()
        $result.Complete() # Sets EndTime
        
        # Log summary
        $errorCount = if ($result.Errors -is [System.Collections.ArrayList]) { $result.Errors.Count } else { 0 }
        $warningCount = if ($result.Warnings -is [System.Collections.ArrayList]) { $result.Warnings.Count } else { 0 }
        
        Write-ExternalIdentityLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount), Errors: $errorCount, Warnings: $warningCount." -Context $Context
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

function Get-GraphApiToken {
    param(
        [hashtable]$AuthInfo,
        [hashtable]$Context
    )
    
    try {
        $tokenBody = @{
            client_id     = $AuthInfo.ClientId
            scope         = "https://graph.microsoft.com/.default"
            client_secret = $AuthInfo.ClientSecret
            grant_type    = "client_credentials"
        }
        $tokenUri = "https://login.microsoftonline.com/$($AuthInfo.TenantId)/oauth2/v2.0/token"
        
        $authResponse = Invoke-RestMethod -Method Post -Uri $tokenUri -Body $tokenBody -ErrorAction Stop
        return $authResponse
    } catch {
        Write-ExternalIdentityLog -Message "Failed to acquire Graph token: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $null
    }
}

function Get-GraphDataInBatches {
    param(
        [string]$Uri,
        [hashtable]$AuthResponse,
        [hashtable]$Context
    )
    
    $allData = [System.Collections.ArrayList]::new()
    $headers = @{ "Authorization" = "Bearer $($AuthResponse.access_token)" }
    $currentUri = $Uri

    do {
        try {
            $response = Invoke-RestMethod -Method Get -Uri $currentUri -Headers $headers -ContentType "application/json" -ErrorAction Stop
            if ($response.value) {
                $null = $allData.AddRange($response.value)
            } elseif ($response -and -not $response.'@odata.context') {
                # Single object response
                $null = $allData.Add($response)
            }
            $currentUri = $response.'@odata.nextLink'
        }
        catch {
            Write-ExternalIdentityLog -Message "Graph API request failed for URI '$Uri': $($_.Exception.Message)" -Level "ERROR" -Context $Context
            break
        }
    } while ($currentUri)
    
    return $allData
}

function Get-B2BGuestUsers {
    param(
        [hashtable]$AuthResponse,
        [hashtable]$Context
    )
    
    $guestUsers = @()
    
    # Build the query with proper encoding
    $filter = [System.Web.HttpUtility]::UrlEncode("userType eq 'Guest'")
    $select = "id,userPrincipalName,displayName,mail,userType,externalUserState,createdDateTime,accountEnabled,identities"
    $guestUsersUri = "https://graph.microsoft.com/v1.0/users?`$filter=$filter&`$select=$select"
    
    $users = Get-GraphDataInBatches -Uri $guestUsersUri -AuthResponse $AuthResponse -Context $Context
    
    foreach ($user in $users) {
        # Extract external identity information
        $externalEmail = $null
        $externalDomain = $null
        
        if ($user.identities) {
            $externalIdentity = $user.identities | Where-Object { $_.signInType -eq "federated" -or $_.signInType -eq "emailAddress" } | Select-Object -First 1
            if ($externalIdentity) {
                $externalEmail = $externalIdentity.issuerAssignedId
                if ($externalEmail -match "@(.+)$") {
                    $externalDomain = $matches[1]
                }
            }
        }
        
        # If no external identity found, try to extract from UPN
        if (-not $externalDomain -and $user.userPrincipalName -match "#EXT#@") {
            $parts = $user.userPrincipalName -split "#EXT#"
            if ($parts[0] -match "_(.+)$") {
                $externalDomain = $matches[1] -replace "_", "."
            }
        }
        
        $guestUsers += [PSCustomObject]@{
            Id = $user.id
            UserPrincipalName = $user.userPrincipalName
            DisplayName = $user.displayName
            Mail = $user.mail
            UserType = $user.userType
            ExternalUserState = $user.externalUserState
            ExternalEmail = $externalEmail
            ExternalDomain = $externalDomain
            CreatedDateTime = $user.createdDateTime
            AccountEnabled = $user.accountEnabled
        }
    }
    
    return $guestUsers
}

function Get-ExternalCollaborationSettings {
    param(
        [hashtable]$AuthResponse,
        [hashtable]$Context
    )
    
    $collabSettingsUri = "https://graph.microsoft.com/v1.0/policies/authorizationPolicy"
    $headers = @{ "Authorization" = "Bearer $($AuthResponse.access_token)" }
    
    try {
        $response = Invoke-RestMethod -Method Get -Uri $collabSettingsUri -Headers $headers -ContentType "application/json" -ErrorAction Stop
        
        # Extract relevant settings
        $settings = [PSCustomObject]@{
            Id = $response.id
            DisplayName = $response.displayName
            Description = $response.description
            AllowInvitesFrom = $response.allowInvitesFrom
            AllowedToSignUpEmailBasedSubscriptions = $response.allowedToSignUpEmailBasedSubscriptions
            AllowedToUseSSPR = $response.allowedToUseSSPR
            AllowEmailVerifiedUsersToJoinOrganization = $response.allowEmailVerifiedUsersToJoinOrganization
            BlockMsolPowerShell = $response.blockMsolPowerShell
            GuestUserRoleId = $response.guestUserRoleId
            PermissionGrantPolicyIdsAssignedToDefaultUserRole = ($response.permissionGrantPolicyIdsAssignedToDefaultUserRole -join ";")
        }
        
        return $settings
    } catch {
        Write-ExternalIdentityLog -Message "Failed to get collaboration settings: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $null
    }
}

function Get-IdentityProviders {
    param(
        [hashtable]$AuthResponse,
        [hashtable]$Context
    )
    
    $identityProviders = @()
    
    $idpUri = "https://graph.microsoft.com/v1.0/identity/identityProviders"
    $providers = Get-GraphDataInBatches -Uri $idpUri -AuthResponse $AuthResponse -Context $Context
    
    foreach ($provider in $providers) {
        $identityProviders += [PSCustomObject]@{
            Id = $provider.id
            DisplayName = $provider.displayName
            Type = $provider.type
            ClientId = $provider.clientId
            ClientSecret = if ($provider.clientSecret) { "[REDACTED]" } else { $null }
        }
    }
    
    return $identityProviders
}

function Get-PartnerOrganizations {
    param(
        [array]$GuestUsers,
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $partnerOrgs = @()
    
    # Group guest users by external domain
    $domainGroups = $GuestUsers | Where-Object { $_.ExternalDomain } | Group-Object -Property ExternalDomain
    
    # Determine how many to analyze based on configuration
    $topCount = 10  # Default
    if ($Configuration.discovery -and $Configuration.discovery.externalIdentity -and $Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze) {
        $topCount = $Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze
    }
    
    # Get top partner domains by guest count
    $topDomains = $domainGroups | Sort-Object Count -Descending | Select-Object -First $topCount
    
    foreach ($domainGroup in $topDomains) {
        $domain = $domainGroup.Name
        $guestCount = $domainGroup.Count
        $activeGuests = ($domainGroup.Group | Where-Object { $_.AccountEnabled -eq $true }).Count
        $pendingGuests = ($domainGroup.Group | Where-Object { $_.ExternalUserState -eq "PendingAcceptance" }).Count
        
        $partnerOrgs += [PSCustomObject]@{
            PartnerDomain = $domain
            TotalGuestCount = $guestCount
            ActiveGuestCount = $activeGuests
            PendingGuestCount = $pendingGuests
            FirstGuestAdded = ($domainGroup.Group | Sort-Object CreatedDateTime | Select-Object -First 1).CreatedDateTime
            LastGuestAdded = ($domainGroup.Group | Sort-Object CreatedDateTime -Descending | Select-Object -First 1).CreatedDateTime
        }
    }
    
    return $partnerOrgs
}

function Export-DiscoveryData {
    param(
        [array]$Data,
        [string]$OutputPath,
        [string]$FileName,
        [string]$ModuleName
    )
    
    if ($Data.Count -eq 0) {
        return
    }
    
    # Add metadata to each record
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $Data | ForEach-Object {
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value $ModuleName -Force
    }
    
    # Export to CSV
    $filePath = Join-Path $OutputPath $FileName
    $Data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery