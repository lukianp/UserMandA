# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: ExternalIdentity
# Description: Discovers B2B guest users, external collaboration settings, and guest activity analysis.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add debugging to see what's in the configuration
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "ExternalIdentityDiscovery"

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
        # Get configuration settings
        $pageSize = 999  # Graph API max
        $topPartnerDomains = 10
        $recentGuestCount = 50
        
        if ($Configuration.discovery -and $Configuration.discovery.externalIdentity) {
            $externalConfig = $Configuration.discovery.externalIdentity
            if ($null -ne $externalConfig.topPartnerDomainsToAnalyze) {
                $topPartnerDomains = $externalConfig.topPartnerDomainsToAnalyze
            }
            if ($null -ne $externalConfig.recentGuestCountForInvitationFallback) {
                $recentGuestCount = $externalConfig.recentGuestCountForInvitationFallback
            }
        }
        
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Config: Top domains=$topPartnerDomains, Recent guests=$recentGuestCount" -Context $Context

        # 4. AUTHENTICATE & CONNECT
        Write-ExternalIdentityLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-ExternalIdentityLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-ExternalIdentityLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            
            # Disconnect any existing session first
            $currentContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($currentContext) {
                Write-ExternalIdentityLog -Level "DEBUG" -Message "Disconnecting existing Graph session" -Context $Context
                Disconnect-MgGraph -ErrorAction SilentlyContinue
            }
            
            # Connect using client secret
            $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            Connect-MgGraph -ClientId $authInfo.ClientId `
                            -TenantId $authInfo.TenantId `
                            -ClientSecret $secureSecret `
                            -NoWelcome -ErrorAction Stop
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-ExternalIdentityLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get B2B Guest Users
        $guestUsers = [System.Collections.ArrayList]::new()
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering B2B guest users..." -Context $Context
            
            $totalGuests = 0
            $nextLink = $null
            
            do {
                if ($nextLink) {
                    $response = Invoke-MgGraphRequest -Uri $nextLink -Method GET
                } else {
                    # Filter for guest users only
                    $filter = "userType eq 'Guest'"
                    $uri = "https://graph.microsoft.com/v1.0/users?`$filter=$filter&`$top=$pageSize&`$select=id,displayName,userPrincipalName,mail,createdDateTime,signInActivity,externalUserState,externalUserStateChangeDateTime,companyName"
                    $response = Invoke-MgGraphRequest -Uri $uri -Method GET
                }
                
                if ($response.value) {
                    foreach ($guest in $response.value) {
                        $totalGuests++
                        
                        # Parse domain from UPN
                        $domain = "Unknown"
                        if ($guest.userPrincipalName -match '#EXT#@') {
                            # External user format
                            $emailPart = $guest.userPrincipalName.Split('#')[0]
                            if ($emailPart -match '@(.+)$') {
                                $domain = $matches[1]
                            }
                        } elseif ($guest.mail) {
                            # Use mail if available
                            if ($guest.mail -match '@(.+)$') {
                                $domain = $matches[1]
                            }
                        }
                        
                        # Calculate days since last sign-in
                        $daysSinceLastSignIn = $null
                        $lastSignInDateTime = $null
                        if ($guest.signInActivity -and $guest.signInActivity.lastSignInDateTime) {
                            try {
                                $lastSignIn = [DateTime]$guest.signInActivity.lastSignInDateTime
                                $daysSinceLastSignIn = [Math]::Round(((Get-Date) - $lastSignIn).TotalDays, 0)
                                $lastSignInDateTime = $guest.signInActivity.lastSignInDateTime
                            } catch {
                                Write-ExternalIdentityLog -Level "DEBUG" -Message "Could not parse lastSignInDateTime for user $($guest.id)" -Context $Context
                            }
                        }
                        
                        $guestObj = [PSCustomObject]@{
                            GuestId = $guest.id
                            DisplayName = $guest.displayName
                            UserPrincipalName = $guest.userPrincipalName
                            Email = $guest.mail
                            Domain = $domain
                            CompanyName = $guest.companyName
                            CreatedDateTime = $guest.createdDateTime
                            ExternalUserState = $guest.externalUserState
                            ExternalUserStateChangeDateTime = $guest.externalUserStateChangeDateTime
                            LastSignInDateTime = $lastSignInDateTime
                            DaysSinceLastSignIn = $daysSinceLastSignIn
                            _DataType = 'GuestUser'
                        }
                        
                        $null = $guestUsers.Add($guestObj)
                        $null = $allDiscoveredData.Add($guestObj)
                        
                        # Report progress
                        if ($totalGuests % 100 -eq 0) {
                            Write-ExternalIdentityLog -Level "DEBUG" -Message "Processed $totalGuests guest users so far..." -Context $Context
                        }
                    }
                }
                
                $nextLink = $response.'@odata.nextLink'
                
            } while ($nextLink)
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $totalGuests B2B guest users" -Context $Context
            $result.Metadata["GuestUserCount"] = $totalGuests
            
        } catch {
            Write-ExternalIdentityLog -Level "ERROR" -Message "Error discovering guest users: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover guest users: $($_.Exception.Message)", @{Section="GuestUsers"})
        }
        
        # Get External Collaboration Settings
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Retrieving external collaboration settings..." -Context $Context
            
            # Get authorization policy
            $authPolicy = $null
            try {
                $uri = "https://graph.microsoft.com/v1.0/policies/authorizationPolicy"
                $authPolicyResponse = Invoke-MgGraphRequest -Uri $uri -Method GET
                if ($authPolicyResponse -and $authPolicyResponse.value) {
                    $authPolicy = $authPolicyResponse.value[0]
                } elseif ($authPolicyResponse) {
                    $authPolicy = $authPolicyResponse
                }
            } catch {
                Write-ExternalIdentityLog -Level "WARN" -Message "Could not retrieve authorization policy: $($_.Exception.Message)" -Context $Context
            }
            
            # Get B2B settings
            $b2bPolicy = $null
            try {
                $uri = "https://graph.microsoft.com/beta/policies/crossTenantAccessPolicy/default"
                $b2bPolicy = Invoke-MgGraphRequest -Uri $uri -Method GET
            } catch {
                Write-ExternalIdentityLog -Level "WARN" -Message "Could not retrieve cross-tenant access policy" -Context $Context
            }
            
            $collaborationSettings = [PSCustomObject]@{
                AllowInvitesFrom = if ($authPolicy -and $authPolicy.allowInvitesFrom) { 
                    $authPolicy.allowInvitesFrom 
                } else { 
                    "Unknown" 
                }
                AllowedToCreateTenants = if ($authPolicy -and $authPolicy.defaultUserRolePermissions) {
                    $authPolicy.defaultUserRolePermissions.allowedToCreateTenants
                } else { 
                    $false 
                }
                AllowedToReadOtherUsers = if ($authPolicy -and $authPolicy.defaultUserRolePermissions) {
                    $authPolicy.defaultUserRolePermissions.allowedToReadOtherUsers
                } else { 
                    $false 
                }
                GuestUserRoleId = if ($authPolicy -and $authPolicy.guestUserRoleId) {
                    $authPolicy.guestUserRoleId
                } else {
                    "Unknown"
                }
                B2BCollaborationInbound = if ($b2bPolicy) { "Configured" } else { "Default" }
                B2BCollaborationOutbound = if ($b2bPolicy) { "Configured" } else { "Default" }
                _DataType = 'CollaborationSettings'
            }
            
            $null = $allDiscoveredData.Add($collaborationSettings)
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Retrieved external collaboration settings" -Context $Context
            
        } catch {
            Write-ExternalIdentityLog -Level "ERROR" -Message "Error retrieving collaboration settings: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to retrieve collaboration settings: $($_.Exception.Message)", @{Section="CollaborationSettings"})
        }
        
        # Analyze Guest Activity by Domain
        if ($guestUsers.Count -gt 0) {
            try {
                Write-ExternalIdentityLog -Level "INFO" -Message "Analyzing guest user activity by domain..." -Context $Context
                
                # Group by domain
                $domainStats = $guestUsers | Group-Object -Property Domain | ForEach-Object {
                    $domainGuests = $_.Group
                    $activeGuests = @($domainGuests | Where-Object { $_.DaysSinceLastSignIn -ne $null -and $_.DaysSinceLastSignIn -lt 90 })
                    $invitedGuests = @($domainGuests | Where-Object { $_.ExternalUserState -eq 'PendingAcceptance' })
                    
                    # Calculate average inactivity
                    $avgInactivity = $null
                    $guestsWithSignIn = @($domainGuests | Where-Object { $_.DaysSinceLastSignIn -ne $null })
                    if ($guestsWithSignIn.Count -gt 0) {
                        $avgInactivity = [Math]::Round(($guestsWithSignIn | Measure-Object -Property DaysSinceLastSignIn -Average).Average, 1)
                    }
                    
                    [PSCustomObject]@{
                        Domain = $_.Name
                        TotalGuests = $_.Count
                        ActiveGuests = $activeGuests.Count
                        InactiveGuests = $_.Count - $activeGuests.Count
                        PendingInvitations = $invitedGuests.Count
                        AverageInactivityDays = $avgInactivity
                        OldestGuestCreated = ($domainGuests.CreatedDateTime | Sort-Object | Select-Object -First 1)
                        NewestGuestCreated = ($domainGuests.CreatedDateTime | Sort-Object -Descending | Select-Object -First 1)
                        _DataType = 'GuestActivityAnalysis'
                    }
                }
                
                # Sort by total guests and take top domains
                $topDomains = $domainStats | Sort-Object -Property TotalGuests -Descending | Select-Object -First $topPartnerDomains
                
                foreach ($domainStat in $topDomains) {
                    $null = $allDiscoveredData.Add($domainStat)
                }
                
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Analyzed activity for $($topDomains.Count) partner domains" -Context $Context
                $result.Metadata["PartnerDomainCount"] = $topDomains.Count
                
            } catch {
                Write-ExternalIdentityLog -Level "ERROR" -Message "Error analyzing guest activity: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Failed to analyze guest activity: $($_.Exception.Message)", @{Section="GuestActivityAnalysis"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ExternalIdentityLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Add metadata to each record
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ExternalIdentity" -Force
                }
                
                # Map to expected filenames
                $fileName = switch ($dataType) {
                    'GuestUser' { 'B2BGuestUsers.csv' }
                    'CollaborationSettings' { 'ExternalCollaborationSettings.csv' }
                    'GuestActivityAnalysis' { 'GuestUserActivityAnalysis.csv' }
                    default { "ExternalIdentity_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported $($data.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-ExternalIdentityLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds

    } catch {
        # Top-level error handler
        Write-ExternalIdentityLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-ExternalIdentityLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Safe record count display
        $recordCount = 0
        if ($result -is [hashtable]) {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        } else {
            $recordCount = if ($result.RecordCount) { $result.RecordCount } else { 0 }
        }
        
        Write-ExternalIdentityLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $recordCount." -Context $Context
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

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExternalIdentityDiscovery