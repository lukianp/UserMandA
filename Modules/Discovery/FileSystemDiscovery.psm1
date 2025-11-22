# FileSystemDiscovery.psm1
# Comprehensive File System Discovery Module with Streaming Support
# Merges functionality from FileServer.psm1, FileServerDiscovery.psm1, and follows Exchange Discovery Pattern

#Requires -Version 5.1

# Import DiscoveryBase module
$discoveryBasePath = Join-Path $PSScriptRoot "DiscoveryBase.psm1"
if (Test-Path $discoveryBasePath) {
    Import-Module $discoveryBasePath -Force
} else {
    throw "DiscoveryBase.psm1 not found at $discoveryBasePath"
}

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
        $logMessage = "[$timestamp] [$Level] [$Component] $Message"
        switch ($Level) {
            'ERROR' { Write-Error "[FileSystemDiscovery] $logMessage" }
            'WARN' { Write-Warning "[FileSystemDiscovery] $logMessage" }
            'SUCCESS' { Write-Verbose "[FileSystemDiscovery] $logMessage" -InformationAction Continue }
            'HEADER' { Write-Verbose "[FileSystemDiscovery] $logMessage" -Verbose }
            'DEBUG' { Write-Verbose "[FileSystemDiscovery] $logMessage" -Verbose }
            default { Write-Verbose "[FileSystemDiscovery] $logMessage" -InformationAction Continue }
        }
    }
}

<#
.SYNOPSIS
Core File System Discovery function

.DESCRIPTION
Discovers file servers, shares, permissions, file types, and large files using the discovery base module

.PARAMETER Configuration
Configuration hashtable with discovery settings

.PARAMETER Context
Context hashtable with paths and company information

.PARAMETER SessionId
Session ID for authentication and tracking

.OUTPUTS
DiscoveryResult object with structured data
#>
function Invoke-FileSystemDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-Verbose "[FileSystemDiscovery] Starting comprehensive File System discovery..."
    # Define discovery scriptblock
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        # Initialize data collection
        $allDiscoveredData = [System.Collections.ArrayList]::new()

        Write-Verbose "[FileSystemDiscovery] === STARTING FILE SYSTEM DISCOVERY ==="
        # Extract configuration parameters
        $servers = $Configuration.Servers
        $includeHiddenShares = $Configuration.IncludeHiddenShares
        $includeAdministrativeShares = $Configuration.IncludeAdministrativeShares
        $scanPermissions = $Configuration.ScanPermissions
        $scanLargeFiles = $Configuration.ScanLargeFiles
        $largeFileThresholdMB = $Configuration.LargeFileThresholdMB -as [int]
        if (!$largeFileThresholdMB) { $largeFileThresholdMB = 100 }

        Write-Verbose "[FileSystemDiscovery] Configuration received:"
        Write-Verbose "[FileSystemDiscovery]   - Servers parameter: $($servers -join ', ')"
        Write-Verbose "[FileSystemDiscovery]   - Servers count: $($servers.Count)"
        Write-Verbose "[FileSystemDiscovery]   - Include Hidden Shares: $includeHiddenShares"
        Write-Verbose "[FileSystemDiscovery]   - Include Admin Shares: $includeAdministrativeShares"
        Write-Verbose "[FileSystemDiscovery]   - Scan Permissions: $scanPermissions"
        Write-Verbose "[FileSystemDiscovery]   - Scan Large Files: $scanLargeFiles"
        Write-Verbose "[FileSystemDiscovery]   - Large File Threshold: ${largeFileThresholdMB}MB"
        # If no servers specified, use localhost as fallback
        if (!$servers -or $servers.Count -eq 0) {
            Write-Verbose "[FileSystemDiscovery] No servers specified, using local computer as fallback..."
            $servers = @($env:COMPUTERNAME)
            Write-Verbose "[FileSystemDiscovery] Will scan local computer: $($env:COMPUTERNAME)"
        }

        Write-Verbose "[FileSystemDiscovery] Will process $($servers.Count) server(s): $($servers -join ', ')"
        # Discover file servers and add to data
        $fileServerCount = 0
        foreach ($server in $servers) {
            if ($server -is [string]) {
                # Simple server name
                $serverObj = [PSCustomObject]@{
                    _DataType = 'FileServer'
                    Id = $server
                    ServerName = $server
                    IPAddress = $null
                    OS = $null
                    Domain = $env:USERDOMAIN
                    Status = 'Unknown'
                    LastSeen = Get-Date
                    DiscoveryMethod = 'Configuration'
                }
            } else {
                # Server object from network discovery
                $serverObj = [PSCustomObject]@{
                    _DataType = 'FileServer'
                    Id = $server.Name
                    ServerName = $server.Name
                    IPAddress = $server.IPAddress
                    OS = $server.OperatingSystem
                    Domain = $server.Domain
                    Status = $server.Status
                    LastSeen = Get-Date
                    DiscoveryMethod = 'NetworkScan'
                }
            }
            $null = $allDiscoveredData.Add($serverObj)
            $fileServerCount++
        }

        # Discover shares from each server
        $shareCount = 0
        $permissionCount = 0
        $largeFileCount = 0
        $fileAnalysisCount = 0

        foreach ($server in $servers) {
            $serverName = if ($server -is [string]) { $server } else { $server.Name }
            Write-Verbose "[FileSystemDiscovery] === PROCESSING SERVER: $serverName ==="
            # Discover shares
            try {
                # For local computer, use direct Get-SmbShare without CimSession
                if ($serverName -eq $env:COMPUTERNAME -or $serverName -eq 'localhost' -or $serverName -eq '127.0.0.1') {
                    Write-Verbose "[FileSystemDiscovery] Using local share enumeration for $serverName"
                    $shares = Get-SmbShare -ErrorAction Stop
                } else {
                    Write-Verbose "[FileSystemDiscovery] Using CimSession for remote server $serverName"
                    $shares = Get-SmbShare -CimSession $serverName -ErrorAction Stop
                }

                Write-Verbose "[FileSystemDiscovery] Found $($shares.Count) total shares on $serverName"
                foreach ($share in $shares) {
                    # Filter hidden/administrative shares if requested
                    if (!$includeHiddenShares -and $share.Name -match '\$$') {
                        Write-Verbose "[FileSystemDiscovery] Skipping hidden share: $($share.Name)"
                        continue
                    }
                    if (!$includeAdministrativeShares -and $share.Name -in @('ADMIN$', 'C$', 'D$', 'IPC$')) {
                        Write-Verbose "[FileSystemDiscovery] Skipping administrative share: $($share.Name)"
                        continue
                    }

                    Write-Verbose "[FileSystemDiscovery] Processing share: $($share.Name) (Path: $($share.Path))"
                    # Get share statistics
                    # For local computer, use the actual local path instead of UNC path for better reliability
                    $isLocalComputer = ($serverName -eq $env:COMPUTERNAME -or $serverName -eq 'localhost' -or $serverName -eq '127.0.0.1')
                    $sharePath = if ($isLocalComputer -and $share.Path) {
                        $share.Path  # Use actual local path for local shares
                    } else {
                        "\\$serverName\$($share.Name)"  # Use UNC path for remote shares
                    }
                    Write-Verbose "[FileSystemDiscovery] Using path: $sharePath (isLocal: $isLocalComputer)"
                    $stats = Get-ShareStatistics -SharePath $sharePath

                    $shareObj = [PSCustomObject]@{
                        _DataType = 'Share'
                        Id = "$serverName\$($share.Name)"
                        Server = $serverName
                        Name = $share.Name
                        Path = $share.Path
                        Description = $share.Description
                        ShareType = $share.ShareType
                        CurrentUsers = $share.CurrentUsers
                        EncryptData = $share.EncryptData
                        FolderEnumerationMode = $share.FolderEnumerationMode
                        CachingMode = $share.CachingMode
                        ScopeName = $share.ScopeName
                        SizeGB = $stats.SizeGB
                        UsedSpaceGB = $stats.UsedSpaceGB
                        FreeSpaceGB = $stats.FreeSpaceGB
                        FileCount = $stats.FileCount
                        FolderCount = $stats.FolderCount
                        LastAccessed = $stats.LastAccessed
                        DiscoveryTime = Get-Date
                    }
                    $null = $allDiscoveredData.Add($shareObj)
                    $shareCount++

                    # Scan permissions if requested
                    if ($scanPermissions) {
                        try {
                            $acl = Get-Acl -Path $sharePath -ErrorAction Stop
                            foreach ($access in $acl.Access) {
                                $riskScore = Get-PermissionRiskScore -Rights $access.FileSystemRights.ToString() -Principal $access.IdentityReference.Value

                                $permissionObj = [PSCustomObject]@{
                                    _DataType = 'Permission'
                                    Id = "$($shareObj.Id)\$($access.IdentityReference)"
                                    ShareId = $shareObj.Id
                                    Server = $serverName
                                    ShareName = $share.Name
                                    Path = $sharePath
                                    IdentityReference = $access.IdentityReference.ToString()
                                    FileSystemRights = $access.FileSystemRights.ToString()
                                    AccessControlType = $access.AccessControlType.ToString()
                                    IsInherited = $access.IsInherited
                                    InheritanceFlags = $access.InheritanceFlags.ToString()
                                    PropagationFlags = $access.PropagationFlags.ToString()
                                    RiskScore = $riskScore
                                    DiscoveryTime = Get-Date
                                }
                                $null = $allDiscoveredData.Add($permissionObj)
                                $permissionCount++
                            }
                        } catch {
                            Write-Warning "[FileSystemDiscovery] Could not get ACL for ${sharePath}: $($_.Exception.Message)"
                        }
                    }

                    # File type analysis
                    try {
                        if (Test-Path $sharePath) {
                            $files = Get-ChildItem $sharePath -Recurse -File -Force -ErrorAction SilentlyContinue
                            $fileGroups = $files | Group-Object Extension

                            foreach ($group in $fileGroups) {
                                $totalSize = ($group.Group | Measure-Object Length -Sum).Sum
                                $category = Get-FileCategory -Extension $group.Name

                                $fileAnalysisObj = [PSCustomObject]@{
                                    _DataType = 'FileAnalysis'
                                    Id = "$($shareObj.Id)\$($group.Name)"
                                    ShareId = $shareObj.Id
                                    ShareName = $share.Name
                                    Server = $serverName
                                    FileExtension = $group.Name
                                    FileCount = $group.Count
                                    TotalSizeGB = [math]::Round($totalSize / 1GB, 3)
                                    Category = $category.Category
                                    DataClassification = $category.Classification
                                    RiskLevel = $category.RiskLevel
                                    DiscoveryTime = Get-Date
                                }
                                $null = $allDiscoveredData.Add($fileAnalysisObj)
                                $fileAnalysisCount++
                            }
                        }
                    } catch {
                        Write-Warning "[FileSystemDiscovery] File type analysis failed for ${sharePath}: $($_.Exception.Message)"
                    }

                    # Scan for large files if requested
                    if ($scanLargeFiles) {
                        try {
                            $largeFiles = Get-ChildItem -Path $sharePath -File -Recurse -ErrorAction SilentlyContinue |
                                Where-Object { $_.Length -gt ($largeFileThresholdMB * 1MB) } |
                                Select-Object -First 1000  # Limit to prevent overwhelming data

                            foreach ($file in $largeFiles) {
                                $largeFileObj = [PSCustomObject]@{
                                    _DataType = 'LargeFile'
                                    Id = $file.FullName
                                    ShareId = $shareObj.Id
                                    Server = $serverName
                                    ShareName = $share.Name
                                    Path = $file.FullName
                                    Name = $file.Name
                                    SizeMB = [math]::Round($file.Length / 1MB, 2)
                                    SizeBytes = $file.Length
                                    Extension = $file.Extension
                                    CreationTime = $file.CreationTime
                                    LastWriteTime = $file.LastWriteTime
                                    LastAccessTime = $file.LastAccessTime
                                    IsReadOnly = $file.IsReadOnly
                                    Attributes = $file.Attributes.ToString()
                                    DiscoveryTime = Get-Date
                                }
                                $null = $allDiscoveredData.Add($largeFileObj)
                                $largeFileCount++
                            }
                        } catch {
                            Write-Warning "[FileSystemDiscovery] Could not scan large files in ${sharePath}: $($_.Exception.Message)"
                        }
                    }
                }
            } catch {
                Write-Warning "[FileSystemDiscovery] Could not get shares from ${serverName}: $($_.Exception.Message)"
                $Result.AddWarning("Could not get shares from ${serverName}: $($_.Exception.Message)")
            }
        }

        Write-Verbose "[FileSystemDiscovery] === DISCOVERY COMPLETE ==="
        Write-Verbose "[FileSystemDiscovery] Summary:"
        Write-Verbose "[FileSystemDiscovery]   - File Servers: $fileServerCount"
        Write-Verbose "[FileSystemDiscovery]   - Shares: $shareCount"
        Write-Verbose "[FileSystemDiscovery]   - Permissions: $permissionCount"
        Write-Verbose "[FileSystemDiscovery]   - File Type Analysis: $fileAnalysisCount"
        Write-Verbose "[FileSystemDiscovery]   - Large Files: $largeFileCount"
        Write-Verbose "[FileSystemDiscovery]   - Total Objects: $($allDiscoveredData.Count)"
        # Export data grouped by type
        $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
        foreach ($group in $dataGroups) {
            $fileName = switch ($group.Name) {
                'FileServer' { 'FileSystemServers.csv' }
                'Share' { 'FileSystemShares.csv' }
                'Permission' { 'FileSystemPermissions.csv' }
                'FileAnalysis' { 'FileSystemFileAnalysis.csv' }
                'LargeFile' { 'FileSystemLargeFiles.csv' }
                default { "FileSystem_$($group.Name).csv" }
            }

            Export-DiscoveryResults -Data $group.Group `
                -FileName $fileName `
                -OutputPath $Context.Paths.RawDataOutput `
                -ModuleName "FileSystem" `
                -SessionId $SessionId
        }

        # Return the raw data array
        return $allDiscoveredData
    }

    # Execute using base module (handles RecordCount automatically)
    # Note: RequiredServices is empty because FileSystem discovery doesn't need Graph/Exchange auth
    return Start-DiscoveryModule -ModuleName "FileSystem" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @() `
        -DiscoveryScript $discoveryScript
}

<#
.SYNOPSIS
Wrapper function for File System Discovery with structured return

.DESCRIPTION
Handles authentication and transforms data for the frontend

.OUTPUTS
Structured object matching TypeScript FileSystemDiscoveryResult interface
#>
function Start-FileSystemDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$CompanyName,

        [Parameter(Mandatory=$false)]
        [AllowNull()]
        [string[]]$Servers,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeHiddenShares = $false,

        [Parameter(Mandatory=$false)]
        [bool]$IncludeAdministrativeShares = $false,

        [Parameter(Mandatory=$false)]
        [bool]$ScanPermissions = $true,

        [Parameter(Mandatory=$false)]
        [bool]$ScanLargeFiles = $true,

        [Parameter(Mandatory=$false)]
        [int]$LargeFileThresholdMB = 100,

        [Parameter(Mandatory=$false)]
        [string]$OutputPath
    )

    Write-Verbose "[FileSystemDiscovery] Starting File System discovery for $CompanyName..."
    Write-Verbose "[FileSystemDiscovery] Servers parameter received: $($Servers -join ', ')"
    Write-Verbose "[FileSystemDiscovery] Servers count: $($Servers.Count)"
    # Ensure servers array is valid - use localhost as fallback
    if (-not $Servers -or $Servers.Count -eq 0) {
        Write-Verbose "[FileSystemDiscovery] No servers specified, using local computer: $($env:COMPUTERNAME)"
        $Servers = @($env:COMPUTERNAME)
    }

    Write-Verbose "[FileSystemDiscovery] Final servers list: $($Servers -join ', ')"
    # Initialize result structure
    $result = [PSCustomObject]@{
        Success = $false
        RecordCount = 0
        Errors = @()
        Warnings = @()
        Metadata = @{}
        Data = $null
        TotalItems = 0
        OutputPath = $OutputPath
        StartTime = Get-Date
        EndTime = $null
        Duration = $null
    }

    try {
        # Validate OutputPath - use default if not provided
        if ([string]::IsNullOrWhiteSpace($OutputPath)) {
            $OutputPath = "C:\DiscoveryData\FileSystem\Raw"
            Write-Verbose "[FileSystemDiscovery] OutputPath not provided, using default: $OutputPath"
        }

        # Ensure output paths exist
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        $logsPath = Join-Path (Split-Path $OutputPath -Parent) "Logs"
        if (-not (Test-Path $logsPath)) {
            New-Item -Path $logsPath -ItemType Directory -Force | Out-Null
        }

        # Generate session ID
        $sessionId = [guid]::NewGuid().ToString()

        # Build configuration
        $config = @{
            CompanyName = $CompanyName
            Servers = $Servers
            IncludeHiddenShares = $IncludeHiddenShares
            IncludeAdministrativeShares = $IncludeAdministrativeShares
            ScanPermissions = $ScanPermissions
            ScanLargeFiles = $ScanLargeFiles
            LargeFileThresholdMB = $LargeFileThresholdMB
        }

        $context = @{
            Paths = @{
                RawDataOutput = $OutputPath
                Logs = $logsPath
            }
            CompanyName = $CompanyName
        }

        # Call Invoke-FileSystemDiscovery with pipeline pollution filter
        $discoveryResult = Invoke-FileSystemDiscovery -Configuration $config -Context $context -SessionId $sessionId | Select-Object -Last 1

        # Transform data structure to match frontend TypeScript interface
        if ($discoveryResult -and $discoveryResult.PSObject.Properties.Name -contains 'Success') {
            if ($discoveryResult.Success) {
                $result.Success = $true
                $result.RecordCount = $discoveryResult.RecordCount
                $result.TotalItems = $discoveryResult.RecordCount

                # Transform flat data array into structured format for frontend
                $allData = $discoveryResult.Data
                $structuredData = @{
                    fileServers = @($allData | Where-Object { $_._DataType -eq 'FileServer' })
                    shares = @($allData | Where-Object { $_._DataType -eq 'Share' })
                    permissions = @($allData | Where-Object { $_._DataType -eq 'Permission' })
                    fileAnalysis = @($allData | Where-Object { $_._DataType -eq 'FileAnalysis' })
                    largeFiles = @($allData | Where-Object { $_._DataType -eq 'LargeFile' })
                }

                # Calculate duration
                $result.EndTime = Get-Date
                $duration = ($result.EndTime - $result.StartTime).TotalMilliseconds

                # Calculate statistics
                $statistics = @{
                    totalFileServers = $structuredData.fileServers.Count
                    totalShares = $structuredData.shares.Count
                    totalPermissions = $structuredData.permissions.Count
                    totalLargeFiles = $structuredData.largeFiles.Count
                    totalFileTypes = $structuredData.fileAnalysis.Count
                    totalSizeMB = ($structuredData.largeFiles | Measure-Object -Property SizeMB -Sum).Sum
                    averageFileSizeMB = if ($structuredData.largeFiles.Count -gt 0) {
                        ($structuredData.largeFiles | Measure-Object -Property SizeMB -Average).Average
                    } else { 0 }
                    largestFileMB = ($structuredData.largeFiles | Measure-Object -Property SizeMB -Maximum).Maximum
                    highRiskPermissions = ($structuredData.permissions | Where-Object { $_.RiskScore -ge 7 }).Count
                    totalServers = ($structuredData.shares | Select-Object -Unique Server).Count
                }

                # Build final result matching TypeScript interface
                $result.Data = [PSCustomObject]@{
                    id = [guid]::NewGuid().ToString()
                    startTime = $result.StartTime
                    endTime = $result.EndTime
                    duration = $duration
                    status = 'completed'

                    # Structured data properties
                    fileServers = $structuredData.fileServers
                    shares = $structuredData.shares
                    permissions = $structuredData.permissions
                    fileAnalysis = $structuredData.fileAnalysis
                    largeFiles = $structuredData.largeFiles

                    # Statistics
                    statistics = $statistics

                    # Errors/warnings
                    errors = if ($discoveryResult.Errors) { $discoveryResult.Errors } else { @() }
                    warnings = if ($discoveryResult.Warnings) { $discoveryResult.Warnings } else { @() }
                }

                $result.Metadata = $discoveryResult.Metadata

                Write-Verbose "[FileSystemDiscovery] Discovery completed successfully. Found $($result.RecordCount) File System objects."
            } else {
                $result.Success = $false
                $result.Errors = $discoveryResult.Errors
                $result.Warnings = $discoveryResult.Warnings
            }
        }

    } catch {
        $result.Success = $false
        $result.Errors += $_.Exception.Message
        Write-Error "[FileSystemDiscovery] Discovery failed: $($_.Exception.Message)"
    }

    return $result
}

#region Helper Functions

function Get-FileServersFromNetwork {
    [CmdletBinding()]
    param()

    Write-Verbose "[FileSystemDiscovery] Starting network file server discovery..."
    try {
        $servers = @()

        # Always include localhost for testing and reliability
        $localComputer = $env:COMPUTERNAME
        Write-Verbose "[FileSystemDiscovery] Adding local computer: $localComputer"
        # Get local shares count
        $localShareCount = 0
        try {
            $localShares = Get-SmbShare -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '\$' }
            if ($localShares) {
                $localShareCount = $localShares.Count
                Write-Verbose "[FileSystemDiscovery] Local computer has $localShareCount non-administrative shares"
            }
        } catch {
            Write-Warning "[FileSystemDiscovery] Could not enumerate local shares: $($_.Exception.Message)"
        }

        $servers += [PSCustomObject]@{
            Name = $localComputer
            IPAddress = "127.0.0.1"
            OperatingSystem = "Windows"
            Domain = $env:USERDOMAIN
            Status = "Local"
            LastLogon = Get-Date
            ShareCount = $localShareCount
        }

        # Method 1: Query Active Directory for file servers (optional, non-blocking)
        try {
            if (Get-Module -ListAvailable -Name ActiveDirectory) {
                Write-Verbose "[FileSystemDiscovery] Querying Active Directory for file servers..."
                Import-Module ActiveDirectory -Force
                $adServers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem, IPv4Address, LastLogonDate
                foreach ($server in $adServers) {
                    # Check if server has file shares (skip if not accessible)
                    if ($server.Name -ne $localComputer) {
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
                            # Server not accessible, skip silently
                        }
                    }
                }
            }
        } catch {
            Write-Verbose "[FileSystemDiscovery] Active Directory module not available or accessible - using local computer only"
        }

        # Method 2: Network browsing for shares (optional, non-blocking)
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
                            # Server not accessible, skip silently
                        }
                    }
                }
            }
        } catch {
            Write-Verbose "[FileSystemDiscovery] Network browsing not available - using local computer only"
        }

        Write-Verbose "[FileSystemDiscovery] Network discovery complete. Found $($servers.Count) server(s)."
        return $servers
    } catch {
        Write-Warning "[FileSystemDiscovery] File server discovery failed: $($_.Exception.Message)"
        # Return localhost as fallback
        return @([PSCustomObject]@{
            Name = $env:COMPUTERNAME
            IPAddress = "127.0.0.1"
            OperatingSystem = "Windows"
            Domain = $env:USERDOMAIN
            Status = "Local"
            LastLogon = Get-Date
            ShareCount = 0
        })
    }
}

function Get-ShareStatistics {
    [CmdletBinding()]
    param([string]$SharePath)

    try {
        Write-Verbose "[FileSystemDiscovery] Getting statistics for: $SharePath"
        if (Test-Path $SharePath) {
            Write-Verbose "[FileSystemDiscovery] Path exists, enumerating files (this may take a moment)..."
            # Use -Depth to limit recursion for faster results
            $items = Get-ChildItem $SharePath -Recurse -Force -ErrorAction SilentlyContinue -Depth 5
            $files = $items | Where-Object { -not $_.PSIsContainer }
            $folders = $items | Where-Object { $_.PSIsContainer }

            $folderSize = $files | Measure-Object -Property Length -Sum
            $fileCount = ($files | Measure-Object).Count
            $folderCount = ($folders | Measure-Object).Count
            $lastAccess = ($files | Sort-Object LastAccessTime -Descending | Select-Object -First 1).LastAccessTime

            Write-Verbose "[FileSystemDiscovery] Found $fileCount files, $folderCount folders, $(if ($folderSize.Sum) { [math]::Round($folderSize.Sum / 1MB, 2) } else { 0 }) MB"
            return [PSCustomObject]@{
                SizeGB = if ($folderSize.Sum) { [math]::Round($folderSize.Sum / 1GB, 2) } else { 0 }
                UsedSpaceGB = if ($folderSize.Sum) { [math]::Round($folderSize.Sum / 1GB, 2) } else { 0 }
                FreeSpaceGB = 0  # Would need drive info
                FileCount = $fileCount
                FolderCount = $folderCount
                LastAccessed = $lastAccess
            }
        } else {
            Write-Warning "[FileSystemDiscovery] Path not accessible: $SharePath"
            return [PSCustomObject]@{
                SizeGB = 0; UsedSpaceGB = 0; FreeSpaceGB = 0
                FileCount = 0; FolderCount = 0; LastAccessed = $null
            }
        }
    } catch {
        Write-Warning "[FileSystemDiscovery] Error getting statistics for ${SharePath}: $($_.Exception.Message)"
        return [PSCustomObject]@{
            SizeGB = 0; UsedSpaceGB = 0; FreeSpaceGB = 0
            FileCount = 0; FolderCount = 0; LastAccessed = $null
        }
    }
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

#endregion

# Export functions
Export-ModuleMember -Function Invoke-FileSystemDiscovery, Start-FileSystemDiscovery, Get-FileServersFromNetwork, Get-ShareStatistics, Get-FileCategory, Get-PermissionRiskScore
