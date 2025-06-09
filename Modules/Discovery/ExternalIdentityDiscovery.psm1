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

    # Check multiple possible locations where auth might be passed
    
    # 1. Direct auth context injection by orchestrator
    if ($Configuration._AuthContext) { 
        return $Configuration._AuthContext 
    }
    
    # 2. Credentials property
    if ($Configuration._Credentials) { 
        return $Configuration._Credentials 
    }
    
    # 3. Within authentication section
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
    
    # 4. Direct properties at root level
    if ($Configuration.ClientId -and 
        $Configuration.ClientSecret -and 
        $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    
    # No credentials found
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
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('ExternalIdentity')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'ExternalIdentity'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-ExternalIdentityLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # No specific configuration required for ExternalIdentity

        # 4. AUTHENTICATE & CONNECT
        Write-ExternalIdentityLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Configuration keys: $($Configuration.Keys -join ', ')" -Context $Context
        
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-ExternalIdentityLog -Level "ERROR" -Message "FATAL: No authentication found. Keys checked: _AuthContext, _Credentials, authentication.*, root level" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Get Graph API token
        Write-ExternalIdentityLog -Level "INFO" -Message "Acquiring Microsoft Graph token..." -Context $Context
        $authResponse = Get-GraphApiToken -AuthInfo $authInfo -Context $Context
        if (-not $authResponse -or -not $authResponse.access_token) {
            $result.AddError("Failed to acquire Microsoft Graph token.", $null, @{Component = "Authentication"})
            return $result
        }
        Write-ExternalIdentityLog -Level "SUCCESS" -Message "Successfully acquired Graph API token" -Context $Context

        # 5. PERFORM DISCOVERY
        Write-ExternalIdentityLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover B2B Guest Users
        $guestUsers = @()
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering B2B Guest Users..." -Context $Context
            $guestUsers = Get-B2BGuestUsers -AuthResponse $authResponse -Context $Context
            
            if ($guestUsers.Count -gt 0) {
                foreach ($user in $guestUsers) {
                    $null = $allDiscoveredData.Add($user)
                }
            }
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $($guestUsers.Count) B2B guest users" -Context $Context
            $result.Metadata["B2BGuestCount"] = $guestUsers.Count

        } catch {
            $result.AddWarning("Failed to discover B2B Guest Users: $($_.Exception.Message)", @{Operation = "GetB2BGuests"})
        }
        
        # Discover External Collaboration Settings
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering External Collaboration Settings..." -Context $Context
            $collabSettings = Get-ExternalCollaborationSettings -AuthResponse $authResponse -Context $Context
            
            if ($collabSettings) {
                $null = $allDiscoveredData.Add($collabSettings)
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered external collaboration settings" -Context $Context
                $result.Metadata["CollaborationSettingsFound"] = $true
            } else {
                Write-ExternalIdentityLog -Level "WARN" -Message "No collaboration settings found" -Context $Context
            }

        } catch {
            $result.AddWarning("Failed to discover Collaboration Settings: $($_.Exception.Message)", @{Operation = "GetCollaborationSettings"})
        }
        
        # Discover Identity Providers
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering Identity Providers..." -Context $Context
            $identityProviders = Get-IdentityProviders -AuthResponse $authResponse -Context $Context
            
            if ($identityProviders.Count -gt 0) {
                foreach ($provider in $identityProviders) {
                    $null = $allDiscoveredData.Add($provider)
                }
            }
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $($identityProviders.Count) identity providers" -Context $Context
            $result.Metadata["IdentityProviderCount"] = $identityProviders.Count

        } catch {
            $result.AddWarning("Failed to discover Identity Providers: $($_.Exception.Message)", @{Operation = "GetIdentityProviders"})
        }

        # Discover Partner Organizations (from guest user domains)
        try {
            if ($guestUsers.Count -gt 0) {
                Write-ExternalIdentityLog -Level "INFO" -Message "Analyzing partner organizations from guest users..." -Context $Context
                $partnerOrgs = Get-PartnerOrganizations -GuestUsers $guestUsers -Configuration $Configuration -Context $Context
                
                if ($partnerOrgs.Count -gt 0) {
                    foreach ($org in $partnerOrgs) {
                        $null = $allDiscoveredData.Add($org)
                    }
                }
                
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Identified $($partnerOrgs.Count) partner organizations" -Context $Context
                $result.Metadata["PartnerOrganizationCount"] = $partnerOrgs.Count
            }

        } catch {
            $result.AddWarning("Failed to analyze partner organizations: $($_.Exception.Message)", @{Operation = "GetPartnerOrganizations"})
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ExternalIdentityLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Export B2B Guest Users (MUST match orchestrator expectations)
            $guestUsersToExport = $allDiscoveredData | Where-Object { $_.UserPrincipalName -and $_.UserType -eq 'Guest' }
            if ($guestUsersToExport.Count -gt 0) {
                $fileName = "B2BGuestUsers.csv" # EXACT name expected by orchestrator
                $filePath = Join-Path $outputPath $fileName
                
                $guestUsersToExport | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ExternalIdentity" -Force
                }
                
                $guestUsersToExport | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported $($guestUsersToExport.Count) B2B guest users to $fileName" -Context $Context
            }
            
            # Export Collaboration Settings (MUST match orchestrator expectations)
            $collabSettingsToExport = $allDiscoveredData | Where-Object { $_.PSObject.Properties.Name -contains 'AllowInvitesFrom' }
            if ($collabSettingsToExport.Count -gt 0) {
                $fileName = "ExternalCollaborationSettings.csv" # EXACT name expected by orchestrator
                $filePath = Join-Path $outputPath $fileName
                
                $collabSettingsToExport | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ExternalIdentity" -Force
                }
                
                $collabSettingsToExport | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported collaboration settings to $fileName" -Context $Context
            }
            
            # Export Guest User Activity Analysis (combines partners and providers)
            $activityAnalysis = @()
            
            # Add partner organizations to activity analysis
            $partnerOrgsData = $allDiscoveredData | Where-Object { $_.PSObject.Properties.Name -contains 'PartnerDomain' }
            foreach ($org in $partnerOrgsData) {
                $activityAnalysis += [PSCustomObject]@{
                    AnalysisType = "PartnerOrganization"
                    Name = $org.PartnerDomain
                    TotalGuestCount = $org.TotalGuestCount
                    ActiveGuestCount = $org.ActiveGuestCount
                    Details = "First: $($org.FirstGuestAdded), Last: $($org.LastGuestAdded)"
                }
            }
            
            # Add identity providers to activity analysis
            $providersData = $allDiscoveredData | Where-Object { $_.PSObject.Properties.Name -contains 'Type' -and $_.Type }
            foreach ($provider in $providersData) {
                $activityAnalysis += [PSCustomObject]@{
                    AnalysisType = "IdentityProvider"
                    Name = $provider.DisplayName
                    TotalGuestCount = 0
                    ActiveGuestCount = 0
                    Details = "Type: $($provider.Type), ID: $($provider.Id)"
                }
            }
            
            if ($activityAnalysis.Count -gt 0) {
                $fileName = "GuestUserActivityAnalysis.csv" # EXACT name expected by orchestrator
                $filePath = Join-Path $outputPath $fileName
                
                $activityAnalysis | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ExternalIdentity" -Force
                }
                
                $activityAnalysis | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported $($activityAnalysis.Count) activity analysis records to $fileName" -Context $Context
            }
        } else {
            Write-ExternalIdentityLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds

    } catch {
        # Top-level error handler
        Write-ExternalIdentityLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-ExternalIdentityLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # No persistent connections to clean up for Graph API (uses REST)
        
        $stopwatch.Stop()
        $result.Complete()
        Write-ExternalIdentityLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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
        
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Requesting token from: $tokenUri" -Context $Context
        
        $authResponse = Invoke-RestMethod -Method Post -Uri $tokenUri -Body $tokenBody -ErrorAction Stop
        
        if ($authResponse.access_token) {
            Write-ExternalIdentityLog -Level "DEBUG" -Message "Token acquired successfully" -Context $Context
        }
        
        return $authResponse
    } catch {
        Write-ExternalIdentityLog -Level "ERROR" -Message "Failed to acquire Graph token: $($_.Exception.Message)" -Context $Context
        return $null
    }
}

function Get-GraphDataInBatches {
    param(
        [string]$Uri,
        [hashtable]$AuthResponse,
        [hashtable]$Context,
        [string]$ProgressMessage = "Fetching data"
    )
    
    $allData = [System.Collections.ArrayList]::new()
    $headers = @{ "Authorization" = "Bearer $($AuthResponse.access_token)" }
    $currentUri = $Uri
    $pageCount = 0

    do {
        try {
            $pageCount++
            Write-ExternalIdentityLog -Level "DEBUG" -Message "$ProgressMessage - Page $pageCount" -Context $Context
            
            $response = Invoke-RestMethod -Method Get -Uri $currentUri -Headers $headers -ContentType "application/json" -ErrorAction Stop
            
            if ($response.value) {
                $null = $allData.AddRange($response.value)
                Write-ExternalIdentityLog -Level "DEBUG" -Message "Retrieved $($response.value.Count) items from page $pageCount" -Context $Context
            } elseif ($response -and -not $response.'@odata.context') {
                # Single object response
                $null = $allData.Add($response)
            }
            
            $currentUri = $response.'@odata.nextLink'
            
            # Report progress every 5 pages
            if ($pageCount % 5 -eq 0) {
                Write-ExternalIdentityLog -Level "INFO" -Message "$ProgressMessage - Processed $pageCount pages, $($allData.Count) items so far..." -Context $Context
            }
            
        } catch {
            Write-ExternalIdentityLog -Level "ERROR" -Message "Graph API request failed for URI '$currentUri': $($_.Exception.Message)" -Context $Context
            break
        }
    } while ($currentUri)
    
    Write-ExternalIdentityLog -Level "DEBUG" -Message "$ProgressMessage - Completed. Total items: $($allData.Count)" -Context $Context
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
    
    Write-ExternalIdentityLog -Level "DEBUG" -Message "Query URI: $guestUsersUri" -Context $Context
    
    $users = Get-GraphDataInBatches -Uri $guestUsersUri -AuthResponse $AuthResponse -Context $Context -ProgressMessage "Fetching B2B guest users"
    
    $processedCount = 0
    foreach ($user in $users) {
        $processedCount++
        
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
        
        # Report progress every 100 users
        if ($processedCount % 100 -eq 0) {
            Write-ExternalIdentityLog -Level "DEBUG" -Message "Processed $processedCount guest users..." -Context $Context
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
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Fetching collaboration settings from: $collabSettingsUri" -Context $Context
        
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
        Write-ExternalIdentityLog -Level "ERROR" -Message "Failed to get collaboration settings: $($_.Exception.Message)" -Context $Context
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
    $providers = Get-GraphDataInBatches -Uri $idpUri -AuthResponse $AuthResponse -Context $Context -ProgressMessage "Fetching identity providers"
    
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
    
    Write-ExternalIdentityLog -Level "DEBUG" -Message "Analyzing partner organizations from $($GuestUsers.Count) guest users" -Context $Context
    
    # Group guest users by external domain
    $domainGroups = $GuestUsers | Where-Object { $_.ExternalDomain } | Group-Object -Property ExternalDomain
    
    Write-ExternalIdentityLog -Level "DEBUG" -Message "Found $($domainGroups.Count) unique external domains" -Context $Context
    
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

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery