# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Exchange Online discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Exchange Online mailboxes, distribution groups, permissions, and configurations
#>


# Exchange Discovery Prerequisites Function
function Test-ExchangeDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating Exchange Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Check if Exchange Online PowerShell is available
        try {
            $testCmd = Get-Command Get-Mailbox -ErrorAction Stop
            Write-MandALog "Exchange Online PowerShell commands available" -Level "SUCCESS" -Context $Context
        }
        catch {
            $Result.AddError("Exchange Online PowerShell not available", $_.Exception, @{
                Prerequisite = 'Exchange Online PowerShell'
                Resolution = 'Connect to Exchange Online using Connect-ExchangeOnline'
            })
            return
        }
        
        # Test Exchange Online connectivity
        try {
            $testMailbox = Get-Mailbox -ResultSize 1 -ErrorAction Stop
            Write-MandALog "Successfully connected to Exchange Online" -Level "SUCCESS" -Context $Context
            $Result.Metadata['ExchangeOnlineConnected'] = $true
        }
        catch {
            $Result.AddError("Failed to connect to Exchange Online", $_.Exception, @{
                Prerequisite = 'Exchange Online Connectivity'
                Resolution = 'Verify Exchange Online connection and permissions'
            })
            return
        }
        
        Write-MandALog "All Exchange Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-ExchangeMailboxesWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $mailboxes = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            Write-MandALog "Retrieving Exchange Online mailboxes..." -Level "INFO" -Context $Context
            
            # Get mailboxes with pagination
            $resultSize = 1000
            $resultPage = 1
            $allMailboxes = @()
            
            do {
                Write-MandALog "Retrieving mailboxes page $resultPage..." -Level "DEBUG" -Context $Context
                $results = Get-Mailbox -ResultSize $resultSize -IncludeInactiveMailbox:$($Configuration.exchangeOnline.includeSoftDeletedMailboxes) |
                    Select-Object -First $resultSize -Skip (($resultPage - 1) * $resultSize)
                
                if ($results) {
                    $allMailboxes += $results
                    $resultPage++
                }
            } while ($results.Count -eq $resultSize)
            
            Write-MandALog "Retrieved $($allMailboxes.Count) mailboxes" -Level "SUCCESS" -Context $Context
            
            # Process mailboxes with individual error handling
            $processedCount = 0
            foreach ($mailbox in $allMailboxes) {
                try {
                    $processedCount++
                    if ($processedCount % 100 -eq 0) {
                        Write-MandALog "Processed $processedCount/$($allMailboxes.Count) mailboxes" -Level "PROGRESS" -Context $Context
                    }
                    
                    # Filter based on configuration
                    if (-not $Configuration.exchangeOnline.includeResourceMailboxes -and $mailbox.RecipientTypeDetails -match "Room|Equipment") {
                        continue
                    }
                    
                    if (-not $Configuration.exchangeOnline.includeSharedMailboxes -and $mailbox.RecipientTypeDetails -eq "SharedMailbox") {
                        continue
                    }
                    
                    $mailboxObj = ConvertTo-ExchangeMailboxObject -Mailbox $mailbox -Context $Context
                    $null = $mailboxes.Add($mailboxObj)
                }
                catch {
                    Write-MandALog "Error processing mailbox at index $processedCount`: $_" -Level "WARN" -Context $Context
                    # Continue processing other mailboxes
                }
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Exchange mailboxes after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Exchange mailbox query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $mailboxes.ToArray()
}

function ConvertTo-ExchangeMailboxObject {
    param($Mailbox, $Context)
    
    try {
        return [PSCustomObject]@{
            Identity = $Mailbox.Identity
            UserPrincipalName = $Mailbox.UserPrincipalName
            PrimarySmtpAddress = $Mailbox.PrimarySmtpAddress
            DisplayName = $Mailbox.DisplayName
            Alias = $Mailbox.Alias
            RecipientType = $Mailbox.RecipientType
            RecipientTypeDetails = $Mailbox.RecipientTypeDetails
            EmailAddresses = ($Mailbox.EmailAddresses | Where-Object { $_ -like "smtp:*" } | ForEach-Object { $_.Substring(5) }) -join ";"
            ArchiveStatus = $Mailbox.ArchiveStatus
            ArchiveGuid = if ($Mailbox.ArchiveGuid) { $Mailbox.ArchiveGuid.ToString() } else { "" }
            DatabaseName = $Mailbox.Database
            RetentionPolicy = $Mailbox.RetentionPolicy
            LitigationHoldEnabled = $Mailbox.LitigationHoldEnabled
            SingleItemRecoveryEnabled = $Mailbox.SingleItemRecoveryEnabled
            WhenCreated = $Mailbox.WhenCreated
            WhenChanged = $Mailbox.WhenChanged
            IsInactive = $Mailbox.IsInactiveMailbox
            HiddenFromAddressListsEnabled = $Mailbox.HiddenFromAddressListsEnabled
            ForwardingAddress = $Mailbox.ForwardingAddress
            ForwardingSmtpAddress = $Mailbox.ForwardingSmtpAddress
            DeliverToMailboxAndForward = $Mailbox.DeliverToMailboxAndForward
            GrantSendOnBehalfTo = ($Mailbox.GrantSendOnBehalfTo -join ";")
            IssueWarningQuota = $Mailbox.IssueWarningQuota
            ProhibitSendQuota = $Mailbox.ProhibitSendQuota
            ProhibitSendReceiveQuota = $Mailbox.ProhibitSendReceiveQuota
            UseDatabaseQuotaDefaults = $Mailbox.UseDatabaseQuotaDefaults
            CustomAttribute1 = $Mailbox.CustomAttribute1
            CustomAttribute2 = $Mailbox.CustomAttribute2
            Department = $Mailbox.Department
            Office = $Mailbox.Office
            MailboxPlan = $Mailbox.MailboxPlan
            ExternalDirectoryObjectId = $Mailbox.ExternalDirectoryObjectId
        }
    }
    catch {
        Write-MandALog "Error converting mailbox object: $_" -Level "WARN" -Context $Context
        return $null
    }
}

#Cannot use $outputpath for logging as its used internallyin the module
function Invoke-ExchangeDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Exchange')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
        # Create minimal context if not provided
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        Write-MandALog "--- Starting Exchange Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-ExchangeDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting Exchange discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $exchangeData = @{
            Mailboxes = @()
            MailboxStats = @()
            DistributionGroups = @()
            MailSecurityGroups = @()
            MailboxPermissions = @()
            SendAsPermissions = @()
            SendOnBehalfPermissions = @()
            MailFlowRules = @()
            RetentionPolicies = @()
        }
        
        # Discover Mailboxes with specific error handling
        try {
            Write-MandALog "Discovering Exchange mailboxes..." -Level "INFO" -Context $Context
            $exchangeData.Mailboxes = Get-ExchangeMailboxesWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['MailboxCount'] = $exchangeData.Mailboxes.Count
            Write-MandALog "Successfully discovered $($exchangeData.Mailboxes.Count) Exchange mailboxes" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Exchange mailboxes",
                $_.Exception,
                @{
                    Operation = 'Get-Mailbox'
                    ExchangeOnline = $true
                }
            )
            Write-MandALog "Error discovering Exchange mailboxes: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if mailboxes fail
        }
        
        # Discover Mailbox Statistics with specific error handling
        try {
            Write-MandALog "Gathering mailbox statistics..." -Level "INFO" -Context $Context
            $exchangeData.MailboxStats = Get-ExchangeMailboxStatistics -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Mailboxes $exchangeData.Mailboxes
            $result.Metadata['MailboxStatsCount'] = $exchangeData.MailboxStats.Count
            Write-MandALog "Successfully gathered statistics for $($exchangeData.MailboxStats.Count) mailboxes" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to gather mailbox statistics",
                $_.Exception,
                @{
                    Operation = 'Get-MailboxStatistics'
                    MailboxCount = $exchangeData.Mailboxes.Count
                }
            )
            Write-MandALog "Error gathering mailbox statistics: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Distribution Groups with specific error handling
        try {
            Write-MandALog "Discovering distribution groups..." -Level "INFO" -Context $Context
            $exchangeData.DistributionGroups = Get-ExchangeDistributionGroups -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['DistributionGroupCount'] = $exchangeData.DistributionGroups.Count
            Write-MandALog "Successfully discovered $($exchangeData.DistributionGroups.Count) distribution groups" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover distribution groups",
                $_.Exception,
                @{
                    Operation = 'Get-DistributionGroup'
                }
            )
            Write-MandALog "Error discovering distribution groups: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Mail-Enabled Security Groups with specific error handling
        try {
            Write-MandALog "Discovering mail-enabled security groups..." -Level "INFO" -Context $Context
            $exchangeData.MailSecurityGroups = Get-ExchangeMailSecurityGroups -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['MailSecurityGroupCount'] = $exchangeData.MailSecurityGroups.Count
            Write-MandALog "Successfully discovered $($exchangeData.MailSecurityGroups.Count) mail-enabled security groups" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover mail-enabled security groups",
                $_.Exception,
                @{
                    Operation = 'Get-DistributionGroup'
                    RecipientTypeDetails = 'MailUniversalSecurityGroup'
                }
            )
            Write-MandALog "Error discovering mail-enabled security groups: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Mailbox Permissions with specific error handling
        try {
            Write-MandALog "Discovering mailbox permissions..." -Level "INFO" -Context $Context
            $exchangeData.MailboxPermissions = Get-ExchangeMailboxPermissions -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Mailboxes $exchangeData.Mailboxes
            $result.Metadata['MailboxPermissionCount'] = $exchangeData.MailboxPermissions.Count
            Write-MandALog "Successfully discovered $($exchangeData.MailboxPermissions.Count) mailbox permissions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover mailbox permissions",
                $_.Exception,
                @{
                    Operation = 'Get-MailboxPermission'
                    MailboxCount = $exchangeData.Mailboxes.Count
                }
            )
            Write-MandALog "Error discovering mailbox permissions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Send As Permissions with specific error handling
        try {
            Write-MandALog "Discovering Send As permissions..." -Level "INFO" -Context $Context
            $exchangeData.SendAsPermissions = Get-ExchangeSendAsPermissions -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['SendAsPermissionCount'] = $exchangeData.SendAsPermissions.Count
            Write-MandALog "Successfully discovered $($exchangeData.SendAsPermissions.Count) Send As permissions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Send As permissions",
                $_.Exception,
                @{
                    Operation = 'Get-RecipientPermission'
                }
            )
            Write-MandALog "Error discovering Send As permissions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Send On Behalf Permissions with specific error handling
        try {
            Write-MandALog "Discovering Send On Behalf permissions..." -Level "INFO" -Context $Context
            $exchangeData.SendOnBehalfPermissions = Get-ExchangeSendOnBehalfPermissions -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration -Mailboxes $exchangeData.Mailboxes
            $result.Metadata['SendOnBehalfPermissionCount'] = $exchangeData.SendOnBehalfPermissions.Count
            Write-MandALog "Successfully discovered $($exchangeData.SendOnBehalfPermissions.Count) Send On Behalf permissions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Send On Behalf permissions",
                $_.Exception,
                @{
                    Operation = 'Process-SendOnBehalfPermissions'
                    MailboxCount = $exchangeData.Mailboxes.Count
                }
            )
            Write-MandALog "Error discovering Send On Behalf permissions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Mail Flow Rules with specific error handling
        try {
            Write-MandALog "Discovering mail flow rules..." -Level "INFO" -Context $Context
            $exchangeData.MailFlowRules = Get-ExchangeMailFlowRules -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['MailFlowRuleCount'] = $exchangeData.MailFlowRules.Count
            Write-MandALog "Successfully discovered $($exchangeData.MailFlowRules.Count) mail flow rules" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover mail flow rules",
                $_.Exception,
                @{
                    Operation = 'Get-TransportRule'
                }
            )
            Write-MandALog "Error discovering mail flow rules: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Discover Retention Policies with specific error handling
        try {
            Write-MandALog "Discovering retention policies..." -Level "INFO" -Context $Context
            $exchangeData.RetentionPolicies = Get-ExchangeRetentionPolicies -OutputPath $Context.Paths.RawDataOutput -Configuration $Configuration
            $result.Metadata['RetentionPolicyCount'] = $exchangeData.RetentionPolicies.Count
            Write-MandALog "Successfully discovered $($exchangeData.RetentionPolicies.Count) retention policies" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover retention policies",
                $_.Exception,
                @{
                    Operation = 'Get-RetentionPolicy'
                }
            )
            Write-MandALog "Error discovering retention policies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # Set the data even if partially successful
        $result.Data = $exchangeData
        
        # Determine overall success based on critical data
        if ($exchangeData.Mailboxes.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No Exchange mailboxes retrieved")
            Write-MandALog "Exchange Discovery failed - no mailboxes retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- Exchange Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in Exchange discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in Exchange Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "Exchange Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            # Clear any cached Exchange sessions if needed
            if (Get-Variable -Name 'ExchangeSession' -ErrorAction SilentlyContinue) {
                Remove-Variable -Name 'ExchangeSession' -Force
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
}

function Get-ExchangeMailboxes {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeMailboxes.csv"
    $mailboxData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Exchange mailboxes CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Exchange Online mailboxes..." -Level "INFO"
        
        # Get mailboxes with pagination
        $mailboxes = @()
        $resultSize = 1000
        $resultPage = 1
        
        do {
            Write-MandALog "Retrieving mailboxes page $resultPage..." -Level "DEBUG"
            $results = Get-Mailbox -ResultSize $resultSize -IncludeInactiveMailbox:$($Configuration.exchangeOnline.includeSoftDeletedMailboxes) |
                Select-Object -First $resultSize -Skip (($resultPage - 1) * $resultSize)
            
            if ($results) {
                $mailboxes += $results
                $resultPage++
            }
        } while ($results.Count -eq $resultSize)
        
        Write-MandALog "Retrieved $($mailboxes.Count) mailboxes" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($mailbox in $mailboxes) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-Progress -Activity "Processing Exchange Mailboxes" -Status "Mailbox $processedCount of $($mailboxes.Count)" -PercentComplete (($processedCount / $mailboxes.Count) * 100)
            }
            
            # Filter based on configuration
            if (-not $Configuration.exchangeOnline.includeResourceMailboxes -and $mailbox.RecipientTypeDetails -match "Room|Equipment") {
                continue
            }
            
            if (-not $Configuration.exchangeOnline.includeSharedMailboxes -and $mailbox.RecipientTypeDetails -eq "SharedMailbox") {
                continue
            }
            
            $mailboxData.Add([PSCustomObject]@{
                Identity = $mailbox.Identity
                UserPrincipalName = $mailbox.UserPrincipalName
                PrimarySmtpAddress = $mailbox.PrimarySmtpAddress
                DisplayName = $mailbox.DisplayName
                Alias = $mailbox.Alias
                RecipientType = $mailbox.RecipientType
                RecipientTypeDetails = $mailbox.RecipientTypeDetails
                EmailAddresses = ($mailbox.EmailAddresses | Where-Object { $_ -like "smtp:*" } | ForEach-Object { $_.Substring(5) }) -join ";"
                ArchiveStatus = $mailbox.ArchiveStatus
                ArchiveGuid = if ($mailbox.ArchiveGuid) { $mailbox.ArchiveGuid.ToString() } else { "" }
                DatabaseName = $mailbox.Database
                RetentionPolicy = $mailbox.RetentionPolicy
                LitigationHoldEnabled = $mailbox.LitigationHoldEnabled
                SingleItemRecoveryEnabled = $mailbox.SingleItemRecoveryEnabled
                WhenCreated = $mailbox.WhenCreated
                WhenChanged = $mailbox.WhenChanged
                IsInactive = $mailbox.IsInactiveMailbox
                HiddenFromAddressListsEnabled = $mailbox.HiddenFromAddressListsEnabled
                ForwardingAddress = $mailbox.ForwardingAddress
                ForwardingSmtpAddress = $mailbox.ForwardingSmtpAddress
                DeliverToMailboxAndForward = $mailbox.DeliverToMailboxAndForward
                GrantSendOnBehalfTo = ($mailbox.GrantSendOnBehalfTo -join ";")
                IssueWarningQuota = $mailbox.IssueWarningQuota
                ProhibitSendQuota = $mailbox.ProhibitSendQuota
                ProhibitSendReceiveQuota = $mailbox.ProhibitSendReceiveQuota
                UseDatabaseQuotaDefaults = $mailbox.UseDatabaseQuotaDefaults
                CustomAttribute1 = $mailbox.CustomAttribute1
                CustomAttribute2 = $mailbox.CustomAttribute2
                Department = $mailbox.Department
                Office = $mailbox.Office
                MailboxPlan = $mailbox.MailboxPlan
                ExternalDirectoryObjectId = $mailbox.ExternalDirectoryObjectId
            })
        }
        
        Write-Progress -Activity "Processing Exchange Mailboxes" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $mailboxData -FilePath $outputFile
        Write-MandALog "Exported $($mailboxData.Count) mailboxes to CSV" -Level "SUCCESS"
        
        return $mailboxData
        
    } catch {
        Write-MandALog "Error retrieving Exchange mailboxes: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeMailboxStatistics {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Mailboxes
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeMailboxStatistics.csv"
    $statsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Mailbox statistics CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Gathering mailbox statistics for $($Mailboxes.Count) mailboxes..." -Level "INFO"
        
        $batchSize = $Configuration.exchangeOnline.mailboxStatsBatchSize
        $batches = [Math]::Ceiling($Mailboxes.Count / $batchSize)
        
        for ($i = 0; $i -lt $batches; $i++) {
            $startIndex = $i * $batchSize
            $endIndex = [Math]::Min((($i + 1) * $batchSize) - 1, $Mailboxes.Count - 1)
            $batchMailboxes = $Mailboxes[$startIndex..$endIndex]
            
            Write-MandALog "Processing statistics batch $($i + 1) of $batches (mailboxes $startIndex to $endIndex)..." -Level "INFO"
            
            foreach ($mailbox in $batchMailboxes) {
                try {
                    $stats = Get-MailboxStatistics -Identity $mailbox.Identity -ErrorAction Stop
                    
                    $statsData.Add([PSCustomObject]@{
                        Identity = $mailbox.Identity
                        UserPrincipalName = $mailbox.UserPrincipalName
                        DisplayName = $stats.DisplayName
                        ItemCount = $stats.ItemCount
                        TotalItemSize = $stats.TotalItemSize.ToString()
                        TotalItemSizeMB = [Math]::Round($stats.TotalItemSize.Value.ToMB(), 2)
                        TotalDeletedItemSize = if ($stats.TotalDeletedItemSize) { $stats.TotalDeletedItemSize.ToString() } else { "" }
                        TotalDeletedItemSizeMB = if ($stats.TotalDeletedItemSize) { [Math]::Round($stats.TotalDeletedItemSize.Value.ToMB(), 2) } else { 0 }
                        DeletedItemCount = $stats.DeletedItemCount
                        MailboxTypeDetail = $stats.MailboxTypeDetail
                        LastLogonTime = $stats.LastLogonTime
                        LastLogoffTime = $stats.LastLogoffTime
                        LastUserActionTime = $stats.LastUserActionTime
                        SystemMessageCount = $stats.SystemMessageCount
                        SystemMessageSize = if ($stats.SystemMessageSize) { $stats.SystemMessageSize.ToString() } else { "" }
                        ServerName = $stats.ServerName
                        DatabaseName = $stats.DatabaseName
                        IsArchiveMailbox = $stats.IsArchiveMailbox
                        IsQuarantined = $stats.IsQuarantined
                    })
                } catch {
                    Write-MandALog "Failed to get statistics for mailbox $($mailbox.UserPrincipalName): $($_.Exception.Message)" -Level "WARN"
                }
            }
        }
        
        Write-MandALog "Gathered statistics for $($statsData.Count) mailboxes" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $statsData -FilePath $outputFile
        
        return $statsData
        
    } catch {
        Write-MandALog "Error gathering mailbox statistics: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeDistributionGroups {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeDistributionGroups.csv"
    $dgData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Distribution groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving distribution groups..." -Level "INFO"
        
        $distributionGroups = Get-DistributionGroup -ResultSize Unlimited
        
        foreach ($dg in $distributionGroups) {
            # Get member count
            $members = Get-DistributionGroupMember -Identity $dg.Identity -ResultSize Unlimited
            $memberCount = ($members | Measure-Object).Count
            
            $dgData.Add([PSCustomObject]@{
                Identity = $dg.Identity
                DisplayName = $dg.DisplayName
                PrimarySmtpAddress = $dg.PrimarySmtpAddress
                Alias = $dg.Alias
                GroupType = $dg.GroupType
                RecipientType = $dg.RecipientType
                RecipientTypeDetails = $dg.RecipientTypeDetails
                MemberCount = $memberCount
                ManagedBy = ($dg.ManagedBy -join ";")
                EmailAddresses = ($dg.EmailAddresses | Where-Object { $_ -like "smtp:*" } | ForEach-Object { $_.Substring(5) }) -join ";"
                MemberJoinRestriction = $dg.MemberJoinRestriction
                MemberDepartRestriction = $dg.MemberDepartRestriction
                RequireSenderAuthenticationEnabled = $dg.RequireSenderAuthenticationEnabled
                AcceptMessagesOnlyFromSendersOrMembers = ($dg.AcceptMessagesOnlyFromSendersOrMembers -join ";")
                RejectMessagesFromSendersOrMembers = ($dg.RejectMessagesFromSendersOrMembers -join ";")
                ModerationEnabled = $dg.ModerationEnabled
                ModeratedBy = ($dg.ModeratedBy -join ";")
                BypassModerationFromSendersOrMembers = ($dg.BypassModerationFromSendersOrMembers -join ";")
                GrantSendOnBehalfTo = ($dg.GrantSendOnBehalfTo -join ";")
                HiddenFromAddressListsEnabled = $dg.HiddenFromAddressListsEnabled
                WhenCreated = $dg.WhenCreated
                WhenChanged = $dg.WhenChanged
                IsDirSynced = $dg.IsDirSynced
                ExternalDirectoryObjectId = $dg.ExternalDirectoryObjectId
            })
        }
        
        Write-MandALog "Retrieved $($dgData.Count) distribution groups" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dgData -FilePath $outputFile
        
        return $dgData
        
    } catch {
        Write-MandALog "Error retrieving distribution groups: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeMailSecurityGroups {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeMailSecurityGroups.csv"
    $msgData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Mail-enabled security groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving mail-enabled security groups..." -Level "INFO"
        
        $mailSecurityGroups = Get-DistributionGroup -RecipientTypeDetails MailUniversalSecurityGroup -ResultSize Unlimited
        
        foreach ($msg in $mailSecurityGroups) {
            # Get member count
            $members = Get-DistributionGroupMember -Identity $msg.Identity -ResultSize Unlimited
            $memberCount = ($members | Measure-Object).Count
            
            $msgData.Add([PSCustomObject]@{
                Identity = $msg.Identity
                DisplayName = $msg.DisplayName
                PrimarySmtpAddress = $msg.PrimarySmtpAddress
                Alias = $msg.Alias
                GroupType = $msg.GroupType
                RecipientTypeDetails = $msg.RecipientTypeDetails
                MemberCount = $memberCount
                ManagedBy = ($msg.ManagedBy -join ";")
                EmailAddresses = ($msg.EmailAddresses | Where-Object { $_ -like "smtp:*" } | ForEach-Object { $_.Substring(5) }) -join ";"
                SecurityEnabled = $true
                MailEnabled = $true
                Universal = $true
                RequireSenderAuthenticationEnabled = $msg.RequireSenderAuthenticationEnabled
                ModerationEnabled = $msg.ModerationEnabled
                ModeratedBy = ($msg.ModeratedBy -join ";")
                GrantSendOnBehalfTo = ($msg.GrantSendOnBehalfTo -join ";")
                HiddenFromAddressListsEnabled = $msg.HiddenFromAddressListsEnabled
                WhenCreated = $msg.WhenCreated
                WhenChanged = $msg.WhenChanged
                IsDirSynced = $msg.IsDirSynced
                ExternalDirectoryObjectId = $msg.ExternalDirectoryObjectId
            })
        }
        
        Write-MandALog "Retrieved $($msgData.Count) mail-enabled security groups" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $msgData -FilePath $outputFile
        
        return $msgData
        
    } catch {
        Write-MandALog "Error retrieving mail-enabled security groups: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeMailboxPermissions {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Mailboxes
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeMailboxPermissions.csv"
    $permData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Mailbox permissions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving mailbox permissions for $($Mailboxes.Count) mailboxes..." -Level "INFO"
        
        $processedCount = 0
        foreach ($mailbox in $Mailboxes | Select-Object -First 100) { # Limit for performance
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing Mailbox Permissions" -Status "Mailbox $processedCount" -PercentComplete (($processedCount / 100) * 100)
            }
            
            try {
                $permissions = Get-MailboxPermission -Identity $mailbox.Identity | 
                    Where-Object { $_.User -notlike "NT AUTHORITY\*" -and $_.User -notlike "S-1-5-*" -and -not $_.IsInherited }
                
                foreach ($perm in $permissions) {
                    $permData.Add([PSCustomObject]@{
                        MailboxIdentity = $mailbox.Identity
                        MailboxUPN = $mailbox.UserPrincipalName
                        MailboxDisplayName = $mailbox.DisplayName
                        User = $perm.User
                        AccessRights = ($perm.AccessRights -join ";")
                        IsInherited = $perm.IsInherited
                        Deny = $perm.Deny
                        InheritanceType = $perm.InheritanceType
                    })
                }
            } catch {
                Write-MandALog "Failed to get permissions for mailbox $($mailbox.UserPrincipalName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Mailbox Permissions" -Completed
        Write-MandALog "Retrieved $($permData.Count) mailbox permission entries" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $permData -FilePath $outputFile
        
        return $permData
        
    } catch {
        Write-MandALog "Error retrieving mailbox permissions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeSendAsPermissions {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeSendAsPermissions.csv"
    $sendAsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Send As permissions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Send As permissions..." -Level "INFO"
        
        # Get all recipients with Send As permissions
        $sendAsPerms = Get-RecipientPermission -ResultSize Unlimited | 
            Where-Object { $_.Trustee -ne "NT AUTHORITY\SELF" -and $_.AccessRights -contains "SendAs" }
        
        foreach ($perm in $sendAsPerms) {
            $sendAsData.Add([PSCustomObject]@{
                Identity = $perm.Identity
                Trustee = $perm.Trustee
                TrusteeType = $perm.TrusteeType
                AccessRights = ($perm.AccessRights -join ";")
                AccessControlType = $perm.AccessControlType
                IsInherited = $perm.IsInherited
                InheritanceType = $perm.InheritanceType
            })
        }
        
        Write-MandALog "Retrieved $($sendAsData.Count) Send As permission entries" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $sendAsData -FilePath $outputFile
        
        return $sendAsData
        
    } catch {
        Write-MandALog "Error retrieving Send As permissions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeSendOnBehalfPermissions {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Mailboxes
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeSendOnBehalfPermissions.csv"
    $sobData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Send On Behalf permissions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Processing Send On Behalf permissions..." -Level "INFO"
        
        # Filter mailboxes that have GrantSendOnBehalfTo populated
        $mailboxesWithSOB = $Mailboxes | Where-Object { $_.GrantSendOnBehalfTo }
        
        foreach ($mailbox in $mailboxesWithSOB) {
            $delegates = $mailbox.GrantSendOnBehalfTo -split ";"
            
            foreach ($delegate in $delegates) {
                if (-not [string]::IsNullOrWhiteSpace($delegate)) {
                    $sobData.Add([PSCustomObject]@{
                        MailboxIdentity = $mailbox.Identity
                        MailboxUPN = $mailbox.UserPrincipalName
                        MailboxDisplayName = $mailbox.DisplayName
                        Delegate = $delegate.Trim()
                        PermissionType = "SendOnBehalf"
                    })
                }
            }
        }
        
        Write-MandALog "Found $($sobData.Count) Send On Behalf permission entries" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $sobData -FilePath $outputFile
        
        return $sobData
        
    } catch {
        Write-MandALog "Error processing Send On Behalf permissions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeMailFlowRules {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeMailFlowRules.csv"
    $rulesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Mail flow rules CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving mail flow rules..." -Level "INFO"
        
        $rules = Get-TransportRule
        
        foreach ($rule in $rules) {
            $rulesData.Add([PSCustomObject]@{
                Identity = $rule.Identity
                Name = $rule.Name
                State = $rule.State
                Mode = $rule.Mode
                Priority = $rule.Priority
                Comments = $rule.Comments
                Description = $rule.Description
                Conditions = ($rule.Conditions | ForEach-Object { $_.GetType().Name }) -join ";"
                Exceptions = ($rule.Exceptions | ForEach-Object { $_.GetType().Name }) -join ";"
                Actions = ($rule.Actions | ForEach-Object { $_.GetType().Name }) -join ";"
                SenderAddressLocation = $rule.SenderAddressLocation
                RuleVersion = $rule.RuleVersion
                WhenChanged = $rule.WhenChanged
                CreatedBy = $rule.CreatedBy
                LastModifiedBy = $rule.LastModifiedBy
                IsValid = $rule.IsValid
            })
        }
        
        Write-MandALog "Retrieved $($rulesData.Count) mail flow rules" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $rulesData -FilePath $outputFile
        
        return $rulesData
        
    } catch {
        Write-MandALog "Error retrieving mail flow rules: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ExchangeRetentionPolicies {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ExchangeRetentionPolicies.csv"
    $policyData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Retention policies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving retention policies..." -Level "INFO"
        
        $policies = Get-RetentionPolicy
        
        foreach ($policy in $policies) {
            # Get retention policy tags
            $tags = Get-RetentionPolicyTag -Policy $policy.Identity
            
            $policyData.Add([PSCustomObject]@{
                Identity = $policy.Identity
                Name = $policy.Name
                IsDefault = $policy.IsDefault
                IsDefaultArbitrationMailbox = $policy.IsDefaultArbitrationMailbox
                RetentionPolicyTagLinks = ($policy.RetentionPolicyTagLinks -join ";")
                TagCount = $tags.Count
                WhenCreated = $policy.WhenCreated
                WhenChanged = $policy.WhenChanged
                Guid = $policy.Guid.ToString()
                ExchangeVersion = $policy.ExchangeVersion
                OrganizationId = $policy.OrganizationId
            })
        }
        
        Write-MandALog "Retrieved $($policyData.Count) retention policies" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $policyData -FilePath $outputFile
        
        return $policyData
        
    } catch {
        Write-MandALog "Error retrieving retention policies: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-ExchangeDiscovery',
    'Get-ExchangeMailboxes',
    'Get-ExchangeMailboxStatistics',
    'Get-ExchangeDistributionGroups',
    'Get-ExchangeMailSecurityGroups',
    'Get-ExchangeMailboxPermissions',
    'Get-ExchangeSendAsPermissions',
    'Get-ExchangeSendOnBehalfPermissions',
    'Get-ExchangeMailFlowRules',
    'Get-ExchangeRetentionPolicies'
)
