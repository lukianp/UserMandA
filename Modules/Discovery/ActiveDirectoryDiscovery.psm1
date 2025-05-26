<#
.SYNOPSIS
    Active Directory discovery for M&A Discovery Suite
.DESCRIPTION
    Handles on-premises Active Directory data collection
#>

function Invoke-ActiveDirectoryDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Active Directory discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $domainController = $Configuration.environment.domainController
        
        $discoveryResults = @{}
        
        # AD Users
        Write-MandALog "Discovering AD Users..." -Level "INFO"
        $discoveryResults.Users = Get-ADUsersData -OutputPath $outputPath -DomainController $domainController -Configuration $Configuration
        
        # Security Groups
        Write-MandALog "Discovering Security Groups..." -Level "INFO"
        $discoveryResults.SecurityGroups = Get-SecurityGroupsData -OutputPath $outputPath -DomainController $domainController -Configuration $Configuration
        
        # Security Group Members
        Write-MandALog "Discovering Security Group Members..." -Level "INFO"
        $discoveryResults.GroupMembers = Get-SecurityGroupMembersData -OutputPath $outputPath -DomainController $domainController -Configuration $Configuration
        
        # Computers
        Write-MandALog "Discovering AD Computers..." -Level "INFO"
        $discoveryResults.Computers = Get-ADComputersData -OutputPath $outputPath -DomainController $domainController -Configuration $Configuration
        
        # Organizational Units
        Write-MandALog "Discovering Organizational Units..." -Level "INFO"
        $discoveryResults.OUs = Get-ADOrganizationalUnits -OutputPath $outputPath -DomainController $domainController -Configuration $Configuration
        
        Write-MandALog "Active Directory discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Active Directory discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-ADUsersData {
    param(
        [string]$OutputPath,
        [string]$DomainController,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADUsers.csv"
    $usersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    # Check if file exists and skip if configured
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Users CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD users from $DomainController" -Level "INFO"
        
        # Check if ActiveDirectory module is available
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping AD discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        $properties = @(
            'UserPrincipalName', 'SamAccountName', 'DistinguishedName', 'SID', 'Enabled',
            'mail', 'manager', 'Department', 'Title', 'LastLogonDate', 'GivenName', 'Surname',
            'DisplayName', 'EmployeeID', 'EmployeeType', 'Office', 'Company', 'whenCreated',
            'PasswordLastSet', 'PasswordNeverExpires', 'AccountExpirationDate', 'ProxyAddresses'
        )
        
        $users = Get-ADUser -Filter * -Properties $properties -Server $DomainController -ErrorAction Stop
        Write-MandALog "Retrieved $($users.Count) AD users" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($user in $users) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-Progress -Activity "Processing AD Users" -Status "User $processedCount of $($users.Count)" -PercentComplete (($processedCount / $users.Count) * 100)
            }
            
            $usersData.Add([PSCustomObject]@{
                UserPrincipalName = $user.UserPrincipalName
                SamAccountName = $user.SamAccountName
                DistinguishedName = $user.DistinguishedName
                SID = $user.SID.Value
                Enabled = $user.Enabled
                mail = $user.mail
                manager = $user.manager
                Department = $user.Department
                Title = $user.Title
                LastLogonDate = $user.LastLogonDate
                GivenName = $user.GivenName
                Surname = $user.Surname
                DisplayName = $user.DisplayName
                EmployeeID = $user.EmployeeID
                EmployeeType = $user.EmployeeType
                Office = $user.Office
                Company = $user.Company
                whenCreated = $user.whenCreated
                PasswordLastSet = $user.PasswordLastSet
                PasswordNeverExpires = $user.PasswordNeverExpires
                AccountExpirationDate = $user.AccountExpirationDate
                ProxyAddresses = ($user.ProxyAddresses -join ';')
            })
        }
        
        Write-Progress -Activity "Processing AD Users" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $usersData -FilePath $outputFile
        Write-MandALog "Exported $($usersData.Count) AD users to CSV" -Level "SUCCESS"
        
        return $usersData
        
    } catch {
        Write-MandALog "Error retrieving AD Users: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            UserPrincipalName = $null; SamAccountName = $null; DistinguishedName = $null
            SID = $null; Enabled = $null; mail = $null; manager = $null; Department = $null
            Title = $null; LastLogonDate = $null; GivenName = $null; Surname = $null
            DisplayName = $null; EmployeeID = $null; EmployeeType = $null; Office = $null
            Company = $null; whenCreated = $null; PasswordLastSet = $null
            PasswordNeverExpires = $null; AccountExpirationDate = $null; ProxyAddresses = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-SecurityGroupsData {
    param(
        [string]$OutputPath,
        [string]$DomainController,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SecurityGroups.csv"
    $groupsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Security Groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving security groups from $DomainController" -Level "INFO"
        
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping security groups discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        $properties = @(
            'SamAccountName', 'Name', 'DistinguishedName', 'SID', 'GroupCategory',
            'GroupScope', 'Description', 'Members', 'whenCreated', 'whenChanged', 'managedBy'
        )
        
        $groups = Get-ADGroup -Filter {GroupCategory -eq "Security"} -Properties $properties -Server $DomainController -ErrorAction Stop
        Write-MandALog "Retrieved $($groups.Count) security groups" -Level "SUCCESS"
        
        foreach ($group in $groups) {
            $memberCount = if ($group.Members) { $group.Members.Count } else { 0 }
            
            $groupsData.Add([PSCustomObject]@{
                SamAccountName = $group.SamAccountName
                Name = $group.Name
                DistinguishedName = $group.DistinguishedName
                SID = $group.SID.Value
                GroupCategory = $group.GroupCategory
                GroupScope = $group.GroupScope
                Description = $group.Description
                MemberCount = $memberCount
                whenCreated = $group.whenCreated
                whenChanged = $group.whenChanged
                managedBy = $group.managedBy
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $groupsData -FilePath $outputFile
        Write-MandALog "Exported $($groupsData.Count) security groups to CSV" -Level "SUCCESS"
        
        return $groupsData
        
    } catch {
        Write-MandALog "Error retrieving Security Groups: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SamAccountName = $null; Name = $null; DistinguishedName = $null; SID = $null
            GroupCategory = $null; GroupScope = $null; Description = $null; MemberCount = $null
            whenCreated = $null; whenChanged = $null; managedBy = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-SecurityGroupMembersData {
    param(
        [string]$OutputPath,
        [string]$DomainController,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SecurityGroupMembers.csv"
    $membersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Security Group Members CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving security group memberships from $DomainController" -Level "INFO"
        
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping group members discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        $groups = Get-ADGroup -Filter {GroupCategory -eq "Security"} -Properties SamAccountName,DistinguishedName -Server $DomainController -ErrorAction Stop
        Write-MandALog "Processing group memberships for $($groups.Count) security groups" -Level "INFO"
        
        $processedGroups = 0
        foreach ($group in $groups) {
            $processedGroups++
            if ($processedGroups % 50 -eq 0) {
                Write-Progress -Activity "Processing Group Memberships" -Status "Group $processedGroups of $($groups.Count)" -PercentComplete (($processedGroups / $groups.Count) * 100)
            }
            
            try {
                $members = Get-ADGroupMember -Identity $group.DistinguishedName -Server $DomainController -ErrorAction SilentlyContinue
                foreach ($member in $members) {
                    $membersData.Add([PSCustomObject]@{
                        GroupSamAccountName = $group.SamAccountName
                        GroupDN = $group.DistinguishedName
                        MemberSamAccountName = $member.SamAccountName
                        MemberDN = $member.DistinguishedName
                        MemberType = $member.objectClass
                        MemberSID = if ($member.SID) { $member.SID.Value } else { $null }
                    })
                }
            } catch {
                Write-MandALog "Error processing group $($group.SamAccountName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Processing Group Memberships" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $membersData -FilePath $outputFile
        Write-MandALog "Exported $($membersData.Count) group memberships to CSV" -Level "SUCCESS"
        
        return $membersData
        
    } catch {
        Write-MandALog "Error retrieving Security Group Members: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            GroupSamAccountName = $null; GroupDN = $null; MemberSamAccountName = $null
            MemberDN = $null; MemberType = $null; MemberSID = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-ADComputersData {
    param(
        [string]$OutputPath,
        [string]$DomainController,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADComputers.csv"
    $computersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Computers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD computers from $DomainController" -Level "INFO"
        
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping computers discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        $properties = @(
            'Name', 'SamAccountName', 'DistinguishedName', 'SID', 'Enabled',
            'OperatingSystem', 'OperatingSystemVersion', 'LastLogonDate', 'whenCreated',
            'IPv4Address', 'DNSHostName', 'Description'
        )
        
        $computers = Get-ADComputer -Filter * -Properties $properties -Server $DomainController -ErrorAction Stop
        Write-MandALog "Retrieved $($computers.Count) AD computers" -Level "SUCCESS"
        
        foreach ($computer in $computers) {
            $computersData.Add([PSCustomObject]@{
                Name = $computer.Name
                SamAccountName = $computer.SamAccountName
                DistinguishedName = $computer.DistinguishedName
                SID = $computer.SID.Value
                Enabled = $computer.Enabled
                OperatingSystem = $computer.OperatingSystem
                OperatingSystemVersion = $computer.OperatingSystemVersion
                LastLogonDate = $computer.LastLogonDate
                whenCreated = $computer.whenCreated
                IPv4Address = $computer.IPv4Address
                DNSHostName = $computer.DNSHostName
                Description = $computer.Description
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $computersData -FilePath $outputFile
        Write-MandALog "Exported $($computersData.Count) AD computers to CSV" -Level "SUCCESS"
        
        return $computersData
        
    } catch {
        Write-MandALog "Error retrieving AD Computers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Name = $null; SamAccountName = $null; DistinguishedName = $null; SID = $null
            Enabled = $null; OperatingSystem = $null; OperatingSystemVersion = $null
            LastLogonDate = $null; whenCreated = $null; IPv4Address = $null
            DNSHostName = $null; Description = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-ADOrganizationalUnits {
    param(
        [string]$OutputPath,
        [string]$DomainController,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "OrganizationalUnits.csv"
    $ouData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Organizational Units CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Organizational Units from $DomainController" -Level "INFO"
        
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping OUs discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        $properties = @(
            'Name', 'DistinguishedName', 'Description', 'whenCreated', 'whenChanged',
            'ProtectedFromAccidentalDeletion', 'managedBy'
        )
        
        $ous = Get-ADOrganizationalUnit -Filter * -Properties $properties -Server $DomainController -ErrorAction Stop
        Write-MandALog "Retrieved $($ous.Count) Organizational Units" -Level "SUCCESS"
        
        foreach ($ou in $ous) {
            # Get user and computer counts
            $userCount = 0
            $computerCount = 0
            
            try {
                $userCount = (Get-ADUser -Filter * -SearchBase $ou.DistinguishedName -SearchScope OneLevel -Server $DomainController -ErrorAction SilentlyContinue | Measure-Object).Count
                $computerCount = (Get-ADComputer -Filter * -SearchBase $ou.DistinguishedName -SearchScope OneLevel -Server $DomainController -ErrorAction SilentlyContinue | Measure-Object).Count
            } catch {
                # Ignore errors for counts
            }
            
            $ouData.Add([PSCustomObject]@{
                Name = $ou.Name
                DistinguishedName = $ou.DistinguishedName
                Description = $ou.Description
                whenCreated = $ou.whenCreated
                whenChanged = $ou.whenChanged
                ProtectedFromAccidentalDeletion = $ou.ProtectedFromAccidentalDeletion
                managedBy = $ou.managedBy
                UserCount = $userCount
                ComputerCount = $computerCount
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $ouData -FilePath $outputFile
        Write-MandALog "Exported $($ouData.Count) Organizational Units to CSV" -Level "SUCCESS"
        
        return $ouData
        
    } catch {
        Write-MandALog "Error retrieving Organizational Units: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Name = $null; DistinguishedName = $null; Description = $null
            whenCreated = $null; whenChanged = $null; ProtectedFromAccidentalDeletion = $null
            managedBy = $null; UserCount = $null; ComputerCount = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-ActiveDirectoryDiscovery',
    'Get-ADUsersData',
    'Get-SecurityGroupsData',
    'Get-SecurityGroupMembersData',
    'Get-ADComputersData',
    'Get-ADOrganizationalUnits'
)