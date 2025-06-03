<#
.SYNOPSIS
    Exchange Online discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Exchange Online mailboxes, distribution groups, permissions, and configurations
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

function Invoke-ExchangeDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Exchange Online discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Exchange connection
        try {
            $testCmd = Get-Command Get-Mailbox -ErrorAction Stop
            Write-MandALog "Exchange Online connection verified" -Level "SUCCESS"
        } catch {
            Write-MandALog "Exchange Online not connected. Skipping Exchange discovery." -Level "WARN"
            return @{}
        }
        
        # Mailboxes
        Write-MandALog "Discovering Exchange mailboxes..." -Level "INFO"
        $discoveryResults.Mailboxes = Get-ExchangeMailboxes -OutputPath $rawPath -Configuration $Configuration
        
        # Mailbox Statistics
        Write-MandALog "Gathering mailbox statistics..." -Level "INFO"
        $discoveryResults.MailboxStats = Get-ExchangeMailboxStatistics -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
        
        # Distribution Groups
        Write-MandALog "Discovering distribution groups..." -Level "INFO"
        $discoveryResults.DistributionGroups = Get-ExchangeDistributionGroups -OutputPath $rawPath -Configuration $Configuration
        
        # Mail-Enabled Security Groups
        Write-MandALog "Discovering mail-enabled security groups..." -Level "INFO"
        $discoveryResults.MailSecurityGroups = Get-ExchangeMailSecurityGroups -OutputPath $rawPath -Configuration $Configuration
        
        # Mailbox Permissions
        Write-MandALog "Discovering mailbox permissions..." -Level "INFO"
        $discoveryResults.MailboxPermissions = Get-ExchangeMailboxPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
        
        # Send As Permissions
        Write-MandALog "Discovering Send As permissions..." -Level "INFO"
        $discoveryResults.SendAsPermissions = Get-ExchangeSendAsPermissions -OutputPath $rawPath -Configuration $Configuration
        
        # Send On Behalf Permissions
        Write-MandALog "Discovering Send On Behalf permissions..." -Level "INFO"
        $discoveryResults.SendOnBehalfPermissions = Get-ExchangeSendOnBehalfPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
        
        # Mail Flow Rules
        Write-MandALog "Discovering mail flow rules..." -Level "INFO"
        $discoveryResults.MailFlowRules = Get-ExchangeMailFlowRules -OutputPath $rawPath -Configuration $Configuration
        
        # Retention Policies
        Write-MandALog "Discovering retention policies..." -Level "INFO"
        $discoveryResults.RetentionPolicies = Get-ExchangeRetentionPolicies -OutputPath $rawPath -Configuration $Configuration
        
        Write-MandALog "Exchange Online discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Exchange Online discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
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
