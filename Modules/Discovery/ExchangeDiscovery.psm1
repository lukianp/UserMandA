# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Exchange
# Description: Discovers Exchange Online mailboxes and groups using Microsoft Graph API.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Add debugging to see what's in the configuration
    Write-MandALog -Message "AuthCheck: Received config keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Component "ExchangeDiscovery"

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

function Write-ExchangeLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Exchange] $Message" -Level $Level -Component "ExchangeDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-ExchangeDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-ExchangeLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    $result = $null
    $isHashtableResult = $false
    
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Exchange')
    } else {
        # Fallback to hashtable
        $isHashtableResult = $true
        $result = @{
            Success      = $true
            ModuleName   = 'Exchange'
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
        Write-ExchangeLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-ExchangeLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 4. AUTHENTICATE & CONNECT
        Write-ExchangeLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-ExchangeLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-ExchangeLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Connect to Microsoft Graph
        $graphConnected = $false
        try {
            Write-ExchangeLog -Level "INFO" -Message "Connecting to Microsoft Graph..." -Context $Context
            
            # Check if already connected
            $currentContext = Get-MgContext -ErrorAction SilentlyContinue
            if ($currentContext -and $currentContext.Account -and $currentContext.ClientId -eq $authInfo.ClientId) {
                Write-ExchangeLog -Level "DEBUG" -Message "Using existing Graph session" -Context $Context
                $graphConnected = $true
            } else {
                if ($currentContext) {
                    Write-ExchangeLog -Level "DEBUG" -Message "Disconnecting existing Graph session" -Context $Context
                    Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                }
                
                # CRITICAL FIX: Use proper credential object for Connect-MgGraph
                $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                $clientCredential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)
                
                # Connect using the PSCredential object (not SecureString directly)
                Connect-MgGraph -ClientId $authInfo.ClientId `
                                -TenantId $authInfo.TenantId `
                                -ClientSecretCredential $clientCredential `
                                -NoWelcome -ErrorAction Stop
                
                Write-ExchangeLog -Level "SUCCESS" -Message "Connected to Microsoft Graph" -Context $Context
                $graphConnected = $true
            }
            
        } catch {
            $result.AddError("Failed to connect to Microsoft Graph: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-ExchangeLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Mailboxes (User mailboxes)
        try {
            Write-ExchangeLog -Level "INFO" -Message "Discovering mailboxes via Graph API..." -Context $Context
            
            # Use a more basic query without complex filters
            $mailboxUri = "https://graph.microsoft.com/v1.0/users?`$select=id,userPrincipalName,displayName,mail,mailNickname,accountEnabled,createdDateTime,department,jobTitle&`$top=999"
            
            $mailboxes = @()
            $headers = @{
                'ConsistencyLevel' = 'eventual'
            }
            
            do {
                $response = Invoke-MgGraphRequest -Uri $mailboxUri -Method GET -Headers $headers -ErrorAction Stop
                
                foreach ($user in $response.value) {
                    # Only include users with mail property (indicates they have a mailbox)
                    if ($user.mail) {
                        # Skip disabled users if configured
                        if ($Configuration.discovery.excludeDisabledUsers -and -not $user.accountEnabled) {
                            continue
                        }
                        
                        $mailboxObj = [PSCustomObject]@{
                            Id = $user.id
                            UserPrincipalName = $user.userPrincipalName
                            PrimarySmtpAddress = $user.mail
                            DisplayName = $user.displayName
                            Alias = $user.mailNickname
                            AccountEnabled = $user.accountEnabled
                            CreatedDateTime = $user.createdDateTime
                            Department = $user.department
                            JobTitle = $user.jobTitle
                            RecipientType = "UserMailbox"
                            _DataType = "Mailbox"
                        }
                        
                        $mailboxes += $mailboxObj
                    }
                }
                
                $mailboxUri = $response.'@odata.nextLink'
            } while ($mailboxUri)
            
            if ($mailboxes.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($mailboxes)
            }
            Write-ExchangeLog -Level "SUCCESS" -Message "Discovered $($mailboxes.Count) mailboxes" -Context $Context
            
        } catch {
            Write-ExchangeLog -Level "ERROR" -Message "Error discovering mailboxes: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover mailboxes: $($_.Exception.Message)", @{Section="Mailboxes"})
        }
        
        # Discover Distribution Groups
        try {
            Write-ExchangeLog -Level "INFO" -Message "Discovering distribution groups via Graph API..." -Context $Context
            
            $groupUri = "https://graph.microsoft.com/v1.0/groups?`$filter=mailEnabled eq true and securityEnabled eq false&`$select=id,displayName,mail,mailNickname,description,createdDateTime&`$top=999"
            
            $distGroups = @()
            do {
                $response = Invoke-MgGraphRequest -Uri $groupUri -Method GET -ErrorAction Stop
                
                foreach ($group in $response.value) {
                    $groupObj = [PSCustomObject]@{
                        Id = $group.id
                        DisplayName = $group.displayName
                        PrimarySmtpAddress = $group.mail
                        Alias = $group.mailNickname
                        Description = $group.description
                        CreatedDateTime = $group.createdDateTime
                        GroupType = "Distribution"
                        RecipientType = "MailUniversalDistributionGroup"
                        _DataType = "DistributionGroup"
                    }
                    
                    $distGroups += $groupObj
                }
                
                $groupUri = $response.'@odata.nextLink'
            } while ($groupUri)
            
            if ($distGroups.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($distGroups)
            }
            Write-ExchangeLog -Level "SUCCESS" -Message "Discovered $($distGroups.Count) distribution groups" -Context $Context
            
        } catch {
            Write-ExchangeLog -Level "ERROR" -Message "Error discovering distribution groups: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover distribution groups: $($_.Exception.Message)", @{Section="DistributionGroups"})
        }
        
        # Discover Mail-Enabled Security Groups
        try {
            Write-ExchangeLog -Level "INFO" -Message "Discovering mail-enabled security groups via Graph API..." -Context $Context
            
            $secGroupUri = "https://graph.microsoft.com/v1.0/groups?`$filter=mailEnabled eq true and securityEnabled eq true&`$select=id,displayName,mail,mailNickname,description,createdDateTime&`$top=999"
            
            $mailSecGroups = @()
            do {
                $response = Invoke-MgGraphRequest -Uri $secGroupUri -Method GET -ErrorAction Stop
                
                foreach ($group in $response.value) {
                    $groupObj = [PSCustomObject]@{
                        Id = $group.id
                        DisplayName = $group.displayName
                        PrimarySmtpAddress = $group.mail
                        Alias = $group.mailNickname
                        Description = $group.description
                        CreatedDateTime = $group.createdDateTime
                        GroupType = "MailEnabledSecurity"
                        RecipientType = "MailUniversalSecurityGroup"
                        _DataType = "DistributionGroup"  # Group with Mailboxes to match orchestrator expectations
                    }
                    
                    $mailSecGroups += $groupObj
                }
                
                $secGroupUri = $response.'@odata.nextLink'
            } while ($secGroupUri)
            
            if ($mailSecGroups.Count -gt 0) {
                $null = $allDiscoveredData.AddRange($mailSecGroups)
            }
            Write-ExchangeLog -Level "SUCCESS" -Message "Discovered $($mailSecGroups.Count) mail-enabled security groups" -Context $Context
            
        } catch {
            Write-ExchangeLog -Level "ERROR" -Message "Error discovering mail-enabled security groups: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover mail-enabled security groups: $($_.Exception.Message)", @{Section="MailSecurityGroups"})
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-ExchangeLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by type and export - Use the exact filenames expected by orchestrator
            $mailboxData = $allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' }
            $groupData = $allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' }
            
            # Export Mailboxes
            if ($mailboxData.Count -gt 0) {
                $mailboxData | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Exchange" -Force
                }
                
                $mailboxFile = Join-Path $outputPath "ExchangeMailboxes.csv"
                $mailboxData | Export-Csv -Path $mailboxFile -NoTypeInformation -Encoding UTF8
                Write-ExchangeLog -Level "SUCCESS" -Message "Exported $($mailboxData.Count) mailboxes to ExchangeMailboxes.csv" -Context $Context
            }
            
            # Export Distribution Groups (includes mail-enabled security groups)
            if ($groupData.Count -gt 0) {
                $groupData | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Exchange" -Force
                }
                
                $groupFile = Join-Path $outputPath "ExchangeDistributionGroups.csv"
                $groupData | Export-Csv -Path $groupFile -NoTypeInformation -Encoding UTF8
                Write-ExchangeLog -Level "SUCCESS" -Message "Exported $($groupData.Count) groups to ExchangeDistributionGroups.csv" -Context $Context
            }
            
        } else {
            Write-ExchangeLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA
        $result.Data = $allDiscoveredData
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["MailboxCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' }).Count
        $result.Metadata["GroupCount"] = ($allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' }).Count

    } catch {
        # Top-level error handler
        Write-ExchangeLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        
        if ($isHashtableResult) {
            & $result.AddError "A critical error occurred during discovery: $($_.Exception.Message)" $_.Exception $null
        } else {
            $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
        }
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-ExchangeLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from services
        if ($graphConnected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-ExchangeLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
            } catch {
                # Ignore disconnect errors
            }
        }
        
        $stopwatch.Stop()
        
        if ($isHashtableResult) {
            & $result.Complete
        } else {
            $result.Complete()
        }
        
        # Get final record count for logging - from Metadata
        $finalRecordCount = 0
        if ($result.Metadata -and $result.Metadata.ContainsKey('RecordCount')) {
            $finalRecordCount = $result.Metadata['RecordCount']
        }
        
        Write-ExchangeLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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
Export-ModuleMember -Function Invoke-ExchangeDiscovery