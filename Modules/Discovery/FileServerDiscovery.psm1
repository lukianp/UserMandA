# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


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

function Write-FileServerLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[FileServer] $Message" -Level $Level -Component "FileServerDiscovery" -Context $Context
}

function Invoke-FileServerDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-FileServerLog -Level "HEADER" -Message "🚀 Starting File Server Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-FileServerLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('FileServer')
    } catch {
        Write-FileServerLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session (if needed for this service type)
        if ("FileSystem" -eq "Graph") {
            Write-FileServerLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
            try {
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
                Write-FileServerLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            } catch {
                $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
                return $result
            }
        } else {
            Write-FileServerLog -Level "INFO" -Message "Using session-based authentication for FileSystem service" -Context $Context
        }

        # Perform comprehensive file server discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        Write-FileServerLog -Level "INFO" -Message "Starting comprehensive file server discovery..." -Context $Context
        
        # 1. Discover File Servers via Network Scanning
        Write-FileServerLog -Level "INFO" -Message "Discovering file servers on network..." -Context $Context
        try {
            $fileServers = Get-FileServersFromNetwork
            foreach ($server in $fileServers) {
                $serverData = [PSCustomObject]@{
                    ServerName = $server.Name
                    IPAddress = $server.IPAddress
                    OS = $server.OperatingSystem
                    Domain = $server.Domain
                    Status = $server.Status
                    LastSeen = Get-Date
                    DiscoveryMethod = "NetworkScan"
                    _DataType = 'FileServers'
                }
                $null = $allDiscoveredData.Add($serverData)
            }
            Write-FileServerLog -Level "SUCCESS" -Message "Found $($fileServers.Count) file servers" -Context $Context
        } catch {
            Write-FileServerLog -Level "WARN" -Message "Network file server discovery failed: $($_.Exception.Message)" -Context $Context
        }

        # 2. Discover Network Shares
        Write-FileServerLog -Level "INFO" -Message "Discovering network shares..." -Context $Context
        try {
            $shares = Get-NetworkShares
            foreach ($share in $shares) {
                $shareData = [PSCustomObject]@{
                    ShareName = $share.Name
                    SharePath = $share.Path
                    ServerName = $share.ServerName
                    ShareType = $share.Type
                    Description = $share.Description
                    MaxUsers = $share.MaxUsers
                    CurrentUsers = $share.CurrentUsers
                    Permissions = ($share.Permissions -join ';')
                    SizeGB = $share.SizeGB
                    UsedSpaceGB = $share.UsedSpaceGB
                    FreeSpaceGB = $share.FreeSpaceGB
                    FileCount = $share.FileCount
                    FolderCount = $share.FolderCount
                    LastAccessed = $share.LastAccessed
                    _DataType = 'NetworkShares'
                }
                $null = $allDiscoveredData.Add($shareData)
            }
            Write-FileServerLog -Level "SUCCESS" -Message "Found $($shares.Count) network shares" -Context $Context
        } catch {
            Write-FileServerLog -Level "WARN" -Message "Network shares discovery failed: $($_.Exception.Message)" -Context $Context
        }

        # 3. Discover File Types and Categories
        Write-FileServerLog -Level "INFO" -Message "Analyzing file types and data categories..." -Context $Context
        try {
            $fileAnalysis = Get-FileTypeAnalysis -Shares $shares
            foreach ($analysis in $fileAnalysis) {
                $fileData = [PSCustomObject]@{
                    ShareName = $analysis.ShareName
                    FileExtension = $analysis.Extension
                    FileCount = $analysis.Count
                    TotalSizeGB = $analysis.TotalSizeGB
                    Category = $analysis.Category
                    DataClassification = $analysis.DataClassification
                    RiskLevel = $analysis.RiskLevel
                    _DataType = 'FileAnalysis'
                }
                $null = $allDiscoveredData.Add($fileData)
            }
            Write-FileServerLog -Level "SUCCESS" -Message "Completed file type analysis" -Context $Context
        } catch {
            Write-FileServerLog -Level "WARN" -Message "File analysis failed: $($_.Exception.Message)" -Context $Context
        }

        # 4. Discover Access Permissions and Security
        Write-FileServerLog -Level "INFO" -Message "Analyzing share permissions and security..." -Context $Context
        try {
            $permissions = Get-SharePermissionAnalysis -Shares $shares
            foreach ($perm in $permissions) {
                $permData = [PSCustomObject]@{
                    ShareName = $perm.ShareName
                    Principal = $perm.Principal
                    PrincipalType = $perm.PrincipalType
                    AccessRights = $perm.AccessRights
                    AccessType = $perm.AccessType
                    Inherited = $perm.Inherited
                    Domain = $perm.Domain
                    RiskScore = $perm.RiskScore
                    _DataType = 'SharePermissions'
                }
                $null = $allDiscoveredData.Add($permData)
            }
            Write-FileServerLog -Level "SUCCESS" -Message "Completed permission analysis" -Context $Context
        } catch {
            Write-FileServerLog -Level "WARN" -Message "Permission analysis failed: $($_.Exception.Message)" -Context $Context
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "FileServer" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = "FileServer_$($group.Name).csv"
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-FileServerLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-FileServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        if ("FileSystem" -eq "Graph") {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        $stopwatch.Stop()
        $result.Complete()
        Write-FileServerLog -Level "HEADER" -Message "🎉 File Server Discovery completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')) - Found $($result.RecordCount) records!" -Context $Context
    }

    return $result
}

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

function Get-FileServersFromNetwork {
    [CmdletBinding()]
    param()
    
    try {
        $servers = @()
        
        # Method 1: Query Active Directory for file servers
        try {
            if (Get-Module -ListAvailable -Name ActiveDirectory) {
                Import-Module ActiveDirectory -Force
                $adServers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem, IPv4Address, LastLogonDate
                foreach ($server in $adServers) {
                    # Check if server has file shares
                    try {
                        $shares = Get-WmiObject -Class Win32_Share -ComputerName $server.Name -ErrorAction Stop | Where-Object {$_.Type -eq 0}
                        if ($shares) {
                            $servers += [PSCustomObject]@{
                                Name = $server.Name
                                IPAddress = $server.IPv4Address
                                OperatingSystem = $server.OperatingSystem
                                Domain = $server.DistinguishedName -replace '^.*?DC=([^,]+).*','$1'
                                Status = "Online"
                                LastLogon = $server.LastLogonDate
                                ShareCount = $shares.Count
                            }
                        }
                    } catch {
                        # Server not accessible, skip
                    }
                }
            }
        } catch {
            Write-Warning "Active Directory module not available or accessible"
        }
        
        # Method 2: Network browsing for shares
        try {
            $netView = net view /domain 2>$null
            if ($netView) {
                $serverNames = $netView | Where-Object {$_ -match '^\\\\'} | ForEach-Object {($_ -split '\s+')[0].TrimStart('\\')}
                foreach ($serverName in $serverNames) {
                    if ($servers.Name -notcontains $serverName) {
                        try {
                            $shares = Get-WmiObject -Class Win32_Share -ComputerName $serverName -ErrorAction Stop | Where-Object {$_.Type -eq 0}
                            if ($shares) {
                                $servers += [PSCustomObject]@{
                                    Name = $serverName
                                    IPAddress = (Resolve-DnsName $serverName -ErrorAction SilentlyContinue).IPAddress
                                    OperatingSystem = "Unknown"
                                    Domain = $env:USERDOMAIN
                                    Status = "Online"
                                    LastLogon = $null
                                    ShareCount = $shares.Count
                                }
                            }
                        } catch {
                            # Server not accessible, skip
                        }
                    }
                }
            }
        } catch {
            Write-Warning "Network browsing failed"
        }
        
        return $servers
    } catch {
        Write-Warning "File server discovery failed: $($_.Exception.Message)"
        return @()
    }
}

function Get-NetworkShares {
    [CmdletBinding()]
    param()
    
    try {
        $allShares = @()
        $fileServers = Get-FileServersFromNetwork
        
        foreach ($server in $fileServers) {
            try {
                Write-Progress -Activity "Discovering shares" -Status "Processing $($server.Name)" -PercentComplete (($allShares.Count / $fileServers.Count) * 100)
                
                # Get shares from server
                $shares = Get-WmiObject -Class Win32_Share -ComputerName $server.Name -ErrorAction Stop | Where-Object {$_.Type -eq 0 -and $_.Name -notmatch '^[A-Z]\$$'}
                
                foreach ($share in $shares) {
                    try {
                        # Get share statistics
                        $sharePath = "\\$($server.Name)\$($share.Name)"
                        $stats = Get-ShareStatistics -SharePath $sharePath
                        $permissions = Get-SharePermissions -SharePath $sharePath
                        
                        $shareObj = [PSCustomObject]@{
                            Name = $share.Name
                            Path = $share.Path
                            ServerName = $server.Name
                            Type = switch ($share.Type) { 0 {"Disk"} 1 {"Print"} 2 {"Device"} 3 {"IPC"} default {"Unknown"} }
                            Description = $share.Description
                            MaxUsers = $share.AllowMaximum
                            CurrentUsers = $share.CurrentUsers
                            Permissions = $permissions
                            SizeGB = $stats.SizeGB
                            UsedSpaceGB = $stats.UsedSpaceGB
                            FreeSpaceGB = $stats.FreeSpaceGB
                            FileCount = $stats.FileCount
                            FolderCount = $stats.FolderCount
                            LastAccessed = $stats.LastAccessed
                        }
                        $allShares += $shareObj
                    } catch {
                        Write-Warning "Failed to get details for share $($share.Name) on $($server.Name): $($_.Exception.Message)"
                    }
                }
            } catch {
                Write-Warning "Failed to query shares on $($server.Name): $($_.Exception.Message)"
            }
        }
        
        Write-Progress -Activity "Discovering shares" -Completed
        return $allShares
    } catch {
        Write-Warning "Network shares discovery failed: $($_.Exception.Message)"
        return @()
    }
}

function Get-ShareStatistics {
    [CmdletBinding()]
    param([string]$SharePath)
    
    try {
        if (Test-Path $SharePath) {
            $folderSize = Get-ChildItem $SharePath -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
            $fileCount = (Get-ChildItem $SharePath -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object).Count
            $folderCount = (Get-ChildItem $SharePath -Recurse -Directory -Force -ErrorAction SilentlyContinue | Measure-Object).Count
            $lastAccess = (Get-ChildItem $SharePath -Force -ErrorAction SilentlyContinue | Sort-Object LastAccessTime -Descending | Select-Object -First 1).LastAccessTime
            
            return [PSCustomObject]@{
                SizeGB = [math]::Round($folderSize.Sum / 1GB, 2)
                UsedSpaceGB = [math]::Round($folderSize.Sum / 1GB, 2)
                FreeSpaceGB = 0  # Would need drive info
                FileCount = $fileCount
                FolderCount = $folderCount
                LastAccessed = $lastAccess
            }
        } else {
            return [PSCustomObject]@{
                SizeGB = 0; UsedSpaceGB = 0; FreeSpaceGB = 0
                FileCount = 0; FolderCount = 0; LastAccessed = $null
            }
        }
    } catch {
        return [PSCustomObject]@{
            SizeGB = 0; UsedSpaceGB = 0; FreeSpaceGB = 0
            FileCount = 0; FolderCount = 0; LastAccessed = $null
        }
    }
}

function Get-SharePermissions {
    [CmdletBinding()]
    param([string]$SharePath)
    
    try {
        if (Test-Path $SharePath) {
            $acl = Get-Acl $SharePath -ErrorAction SilentlyContinue
            $permissions = @()
            foreach ($access in $acl.Access) {
                $permissions += "$($access.IdentityReference):$($access.FileSystemRights):$($access.AccessControlType)"
            }
            return $permissions
        } else {
            return @("Access Denied")
        }
    } catch {
        return @("Error: $($_.Exception.Message)")
    }
}

function Get-FileTypeAnalysis {
    [CmdletBinding()]
    param([array]$Shares)
    
    $analysis = @()
    foreach ($share in $Shares) {
        try {
            if (Test-Path "\\$($share.ServerName)\$($share.Name)") {
                $files = Get-ChildItem "\\$($share.ServerName)\$($share.Name)" -Recurse -File -Force -ErrorAction SilentlyContinue
                $fileGroups = $files | Group-Object Extension
                
                foreach ($group in $fileGroups) {
                    $totalSize = ($group.Group | Measure-Object Length -Sum).Sum
                    $category = Get-FileCategory -Extension $group.Name
                    
                    $analysis += [PSCustomObject]@{
                        ShareName = $share.Name
                        Extension = $group.Name
                        Count = $group.Count
                        TotalSizeGB = [math]::Round($totalSize / 1GB, 3)
                        Category = $category.Category
                        DataClassification = $category.Classification
                        RiskLevel = $category.RiskLevel
                    }
                }
            }
        } catch {
            Write-Warning "File analysis failed for share $($share.Name): $($_.Exception.Message)"
        }
    }
    return $analysis
}

function Get-FileCategory {
    [CmdletBinding()]
    param([string]$Extension)
    
    $categories = @{
        '.doc' = @{Category='Documents'; Classification='BusinessData'; RiskLevel='Medium'}
        '.docx' = @{Category='Documents'; Classification='BusinessData'; RiskLevel='Medium'}
        '.pdf' = @{Category='Documents'; Classification='BusinessData'; RiskLevel='Medium'}
        '.xls' = @{Category='Spreadsheets'; Classification='BusinessData'; RiskLevel='High'}
        '.xlsx' = @{Category='Spreadsheets'; Classification='BusinessData'; RiskLevel='High'}
        '.ppt' = @{Category='Presentations'; Classification='BusinessData'; RiskLevel='Medium'}
        '.pptx' = @{Category='Presentations'; Classification='BusinessData'; RiskLevel='Medium'}
        '.txt' = @{Category='Text'; Classification='GeneralData'; RiskLevel='Low'}
        '.log' = @{Category='Logs'; Classification='SystemData'; RiskLevel='Low'}
        '.exe' = @{Category='Executables'; Classification='SystemData'; RiskLevel='High'}
        '.msi' = @{Category='Installers'; Classification='SystemData'; RiskLevel='Medium'}
        '.zip' = @{Category='Archives'; Classification='Unknown'; RiskLevel='Medium'}
        '.rar' = @{Category='Archives'; Classification='Unknown'; RiskLevel='Medium'}
        '.mp4' = @{Category='Media'; Classification='GeneralData'; RiskLevel='Low'}
        '.avi' = @{Category='Media'; Classification='GeneralData'; RiskLevel='Low'}
        '.jpg' = @{Category='Images'; Classification='GeneralData'; RiskLevel='Low'}
        '.png' = @{Category='Images'; Classification='GeneralData'; RiskLevel='Low'}
        '.pst' = @{Category='Email'; Classification='BusinessData'; RiskLevel='High'}
        '.sql' = @{Category='Database'; Classification='BusinessData'; RiskLevel='High'}
        '.bak' = @{Category='Backups'; Classification='SystemData'; RiskLevel='Medium'}
    }
    
    if ($categories.ContainsKey($Extension.ToLower())) {
        return $categories[$Extension.ToLower()]
    } else {
        return @{Category='Unknown'; Classification='Unknown'; RiskLevel='Low'}
    }
}

function Get-SharePermissionAnalysis {
    [CmdletBinding()]
    param([array]$Shares)
    
    $permissions = @()
    foreach ($share in $Shares) {
        try {
            if (Test-Path "\\$($share.ServerName)\$($share.Name)") {
                $acl = Get-Acl "\\$($share.ServerName)\$($share.Name)" -ErrorAction SilentlyContinue
                foreach ($access in $acl.Access) {
                    $riskScore = Get-PermissionRiskScore -Rights $access.FileSystemRights -Principal $access.IdentityReference
                    
                    $permissions += [PSCustomObject]@{
                        ShareName = $share.Name
                        Principal = $access.IdentityReference.Value
                        PrincipalType = if ($access.IdentityReference.Value -like '*\*') { 'Domain' } else { 'Local' }
                        AccessRights = $access.FileSystemRights
                        AccessType = $access.AccessControlType
                        Inherited = $access.IsInherited
                        Domain = if ($access.IdentityReference.Value -like '*\*') { ($access.IdentityReference.Value -split '\\')[0] } else { 'Local' }
                        RiskScore = $riskScore
                    }
                }
            }
        } catch {
            Write-Warning "Permission analysis failed for share $($share.Name): $($_.Exception.Message)"
        }
    }
    return $permissions
}

function Get-PermissionRiskScore {
    [CmdletBinding()]
    param([string]$Rights, [string]$Principal)
    
    $score = 0
    
    # High risk permissions
    if ($Rights -match 'FullControl|Modify|Write') { $score += 3 }
    elseif ($Rights -match 'ReadAndExecute|Read') { $score += 1 }
    
    # High risk principals
    if ($Principal -match 'Everyone|Anonymous|Guest') { $score += 5 }
    elseif ($Principal -match 'Users|Authenticated Users') { $score += 2 }
    elseif ($Principal -match 'Administrators|Domain Admins') { $score += 1 }
    
    return [math]::Min($score, 10)  # Cap at 10
}

Export-ModuleMember -Function Invoke-FileServerDiscovery
