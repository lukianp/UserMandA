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
    $result = $null
    $isHashtableResult = $false
    
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('ExternalIdentity')
    } else {
        # Fallback to hashtable
        $isHashtableResult = $true
        $result = @{
            Success      = $true
            ModuleName   = 'ExternalIdentity'
            RecordCount  = 0
            Data         = $null
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
        }
        
        # Add methods for hashtable
        $result.AddError = {
            param($m, $e, $c)
            $errorEntry = @{
                Timestamp = Get-Date
                Message = $m
                Exception = if ($e) { $e.ToString() } else { $null }
                ExceptionType = if ($e) { $e.GetType().FullName } else { $null }
                Context = $c
            }
            $null = $this.Errors.Add($errorEntry)
            $this.Success = $false
        }.GetNewClosure()
        
        $result.AddWarning = {
            param($m, $c)
            $warningEntry = @{
                Timestamp = Get-Date
                Message = $m
                Context = $c
            }
            $null = $this.Warnings.Add($warningEntry)
        }.GetNewClosure()
        
        $result.Complete = {
            $this.EndTime = Get-Date
            if ($this.StartTime -and $this.EndTime) {
                $duration = $this.EndTime - $this.StartTime
                $this.Metadata['Duration'] = $duration
                $this.Metadata['DurationSeconds'] = $duration.TotalSeconds
            }
        }.GetNewClosure()
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
        $graphConnected = $false
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            
            # Check if already connected
            $currentContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($currentContext -and $currentContext.Account -and $currentContext.ClientId -eq $authInfo.ClientId) {
                Write-ExternalIdentityLog -Level "DEBUG" -Message "Using existing Graph session" -Context $Context
                $graphConnected = $true
            } else {
                if ($currentContext) {
                    Write-ExternalIdentityLog -Level "DEBUG" -Message "Disconnecting existing Graph session" -Context $Context
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                }
                
                # FIX: Create PSCredential object from ClientId and SecureString
                $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
                
                # Connect using the PSCredential
                Connect-MgGraph -ClientSecretCredential $clientCredential `
                                -TenantId $authInfo.TenantId `
                                -NoWelcome -ErrorAction Stop
                
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
                $graphConnected = $true
                
                # Verify connection
                $mgContext = Get-MgContext -ErrorAction Stop
                if (-not $mgContext) {
                    throw "Failed to establish Graph context after connection"
                }
            }
            
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-ExternalIdentityLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get B2B Guest Users
        $guestUsers = @()
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering B2B guest users..." -Context $Context
            
            $totalGuests = 0
            $nextLink = $null
            
            do {
                if ($nextLink) {
                    $response = Invoke-MgGraphRequest -Uri $nextLink -Method GET
                } else {
                    # Filter for guest users only with proper encoding
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
                        if ($guest.signInActivity -and $guest.signInActivity.lastSignInDateTime) {
                            try {
                                $lastSignIn = [DateTime]$guest.signInActivity.lastSignInDateTime
                                $daysSinceLastSignIn = [Math]::Round(((Get-Date) - $lastSignIn).TotalDays, 0)
                            } catch {
                                Write-ExternalIdentityLog -Level "DEBUG" -Message "Could not parse lastSignInDateTime for user $($guest.id)" -Context $Context
                            }
                        }
                        
                        $guestUsers += [PSCustomObject]@{
                            GuestId = $guest.id
                            DisplayName = $guest.displayName
                            UserPrincipalName = $guest.userPrincipalName
                            Email = $guest.mail
                            Domain = $domain
                            CompanyName = $guest.companyName
                            CreatedDateTime = $guest.createdDateTime
                            ExternalUserState = $guest.externalUserState
                            ExternalUserStateChangeDateTime = $guest.externalUserStateChangeDateTime
                            LastSignInDateTime = if ($guest.signInActivity -and $guest.signInActivity.lastSignInDateTime) { 
                                $guest.signInActivity.lastSignInDateTime 
                            } else { 
                                $null 
                            }
                            DaysSinceLastSignIn = $daysSinceLastSignIn
                            _ObjectType = 'GuestUser'
                        }
                        
                        $null = $allDiscoveredData.Add($guestUsers[-1])
                        
                        # Report progress
                        if ($totalGuests % 100 -eq 0) {
                            Write-ExternalIdentityLog -Level "DEBUG" -Message "Processed $totalGuests guest users so far..." -Context $Context
                        }
                    }
                }
                
                $nextLink = $response.'@odata.nextLink'
                
            } while ($nextLink)
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $totalGuests B2B guest users" -Context $Context
            
            if ($isHashtableResult) {
                $result.Metadata["GuestUserCount"] = $totalGuests
            } else {
                $result.Metadata["GuestUserCount"] = $totalGuests
            }
            
        } catch {
            $result.AddWarning("Failed to discover guest users: $($_.Exception.Message)", @{Operation = "GetGuestUsers"})
        }
        
        # Get External Collaboration Settings
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Retrieving external collaboration settings..." -Context $Context
            
            # Get authorization policy using cmdlet
            $authPolicy = $null
            try {
                # First try the cmdlet
                $authPolicy = Get-MgPolicyAuthorizationPolicy -ErrorAction Stop
            } catch {
                # Fallback to REST API
                Write-ExternalIdentityLog -Level "DEBUG" -Message "Cmdlet failed, trying REST API" -Context $Context
                $uri = "https://graph.microsoft.com/v1.0/policies/authorizationPolicy"
                $authPolicyResponse = Invoke-MgGraphRequest -Uri $uri -Method GET
                if ($authPolicyResponse) {
                    $authPolicy = $authPolicyResponse
                }
            }
            
            if (-not $authPolicy) {
                throw "Could not retrieve authorization policy"
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
                AllowInvitesFrom = if ($authPolicy.AllowInvitesFrom) { $authPolicy.AllowInvitesFrom } else { "Unknown" }
                AllowedToCreateTenants = if ($authPolicy.DefaultUserRolePermissions) {
                    $authPolicy.DefaultUserRolePermissions.AllowedToCreateTenants
                } else { $false }
                AllowedToReadOtherUsers = if ($authPolicy.DefaultUserRolePermissions) {
                    $authPolicy.DefaultUserRolePermissions.AllowedToReadOtherUsers
                } else { $false }
                GuestUserRoleId = $authPolicy.GuestUserRoleId
                B2BCollaborationInbound = if ($b2bPolicy) { "Configured" } else { "Default" }
                B2BCollaborationOutbound = if ($b2bPolicy) { "Configured" } else { "Default" }
                _ObjectType = 'CollaborationSettings'
            }
            
            $null = $allDiscoveredData.Add($collaborationSettings)
            
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Retrieved external collaboration settings" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to retrieve collaboration settings: $($_.Exception.Message)", @{Operation = "GetCollaborationSettings"})
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
                        _ObjectType = 'GuestActivityAnalysis'
                    }
                }
                
                # Sort by total guests and take top domains
                $topDomains = $domainStats | Sort-Object -Property TotalGuests -Descending | Select-Object -First $topPartnerDomains
                
                foreach ($domainStat in $topDomains) {
                    $null = $allDiscoveredData.Add($domainStat)
                }
                
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Analyzed activity for $($topDomains.Count) partner domains" -Context $Context
                
                if ($isHashtableResult) {
                    $result.Metadata["PartnerDomainCount"] = $topDomains.Count
                } else {
                    $result.Metadata["PartnerDomainCount"] = $topDomains.Count
                }
                
            } catch {
                $result.AddWarning("Failed to analyze guest activity: $($_.Exception.Message)", @{Operation = "AnalyzeGuestActivity"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ExternalIdentityLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by object type and export to separate files
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $objects = $group.Group
                
                # Remove the _ObjectType property before export
                $exportData = $objects | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_ObjectType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ExternalIdentity" -Force
                    $obj
                }
                
                # Map object types to file names (MUST match orchestrator expectations)
                $fileName = switch ($objectType) {
                    'GuestUser' { 'B2BGuestUsers.csv' }
                    'CollaborationSettings' { 'ExternalCollaborationSettings.csv' }
                    'GuestActivityAnalysis' { 'GuestUserActivityAnalysis.csv' }
                    default { "ExternalIdentity_$objectType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-ExternalIdentityLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        if ($isHashtableResult) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $allDiscoveredData.Count
            $result['RecordCount'] = $allDiscoveredData.Count  # Ensure both access methods work
            $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
            $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $allDiscoveredData.Count
            $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
            $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        }

    } catch {
        # Top-level error handler
        Write-ExternalIdentityLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-ExternalIdentityLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Microsoft Graph only if we connected
        if ($graphConnected) {
            try {
                $mgContext = Get-MgContext -ErrorAction SilentlyContinue
                if ($mgContext) {
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                    Write-ExternalIdentityLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
                }
            } catch {
                # Ignore disconnect errors
            }
        }
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Get final record count for logging
        $finalRecordCount = if ($isHashtableResult) { $result['RecordCount'] } else { $result.RecordCount }
        Write-ExternalIdentityLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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