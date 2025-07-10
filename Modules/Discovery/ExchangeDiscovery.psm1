# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Exchange
# Description: Discovers Exchange Online mailboxes and groups using Microsoft Graph API.
#================================================================================

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

# --- Main Discovery Function ---

function Invoke-ExchangeDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Mailboxes (User mailboxes)
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering mailboxes via Graph API..." -Level "INFO"
            
            # Use a more basic query without complex filters
            $mailboxUri = "https://graph.microsoft.com/v1.0/users?`$select=id,userPrincipalName,displayName,mail,mailNickname,accountEnabled,createdDateTime,department,jobTitle&`$top=999"
            
            $mailboxes = Invoke-GraphAPIWithPaging -Uri $mailboxUri -ModuleName "Exchange"
            
            foreach ($user in $mailboxes) {
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
                    
                    $null = $allDiscoveredData.Add($mailboxObj)
                }
            }
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($mailboxes.Count) mailboxes" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover mailboxes: $($_.Exception.Message)", @{Section="Mailboxes"})
        }
        
        # Discover Distribution Groups
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering distribution groups via Graph API..." -Level "INFO"
            
            $groupUri = "https://graph.microsoft.com/v1.0/groups?`$filter=mailEnabled eq true and securityEnabled eq false&`$select=id,displayName,mail,mailNickname,description,createdDateTime&`$top=999"
            
            $distGroups = Invoke-GraphAPIWithPaging -Uri $groupUri -ModuleName "Exchange"
            
            foreach ($group in $distGroups) {
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
                
                $null = $allDiscoveredData.Add($groupObj)
            }
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($distGroups.Count) distribution groups" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover distribution groups: $($_.Exception.Message)", @{Section="DistributionGroups"})
        }
        
        # Discover Mail-Enabled Security Groups
        try {
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovering mail-enabled security groups via Graph API..." -Level "INFO"
            
            $secGroupUri = "https://graph.microsoft.com/v1.0/groups?`$filter=mailEnabled eq true and securityEnabled eq true&`$select=id,displayName,mail,mailNickname,description,createdDateTime&`$top=999"
            
            $mailSecGroups = Invoke-GraphAPIWithPaging -Uri $secGroupUri -ModuleName "Exchange"
            
            foreach ($group in $mailSecGroups) {
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
                
                $null = $allDiscoveredData.Add($groupObj)
            }
            Write-ModuleLog -ModuleName "Exchange" -Message "Discovered $($mailSecGroups.Count) mail-enabled security groups" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover mail-enabled security groups: $($_.Exception.Message)", @{Section="MailSecurityGroups"})
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "Exchange" -Message "Exporting $($allDiscoveredData.Count) records..." -Level "INFO"
            
            # Group by type and export - Use the exact filenames expected by orchestrator
            $mailboxData = $allDiscoveredData | Where-Object { $_._DataType -eq 'Mailbox' }
            $groupData = $allDiscoveredData | Where-Object { $_._DataType -eq 'DistributionGroup' }
            
            # Export Mailboxes
            if ($mailboxData.Count -gt 0) {
                Export-DiscoveryResults -Data $mailboxData `
                    -FileName "ExchangeMailboxes.csv" `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Exchange" `
                    -SessionId $SessionId
            }
            
            # Export Distribution Groups (includes mail-enabled security groups)
            if ($groupData.Count -gt 0) {
                Export-DiscoveryResults -Data $groupData `
                    -FileName "ExchangeDistributionGroups.csv" `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Exchange" `
                    -SessionId $SessionId
            }
            
        } else {
            Write-ModuleLog -ModuleName "Exchange" -Message "No data discovered to export" -Level "WARN"
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "Exchange" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph') `
        -DiscoveryScript $discoveryScript
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-ExchangeDiscovery