<#
.SYNOPSIS
    File Server and Storage discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers file shares, DFS namespaces, permissions, and storage information
#>

function Invoke-FileServerDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting File Server and Storage discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $discoveryResults = @{}
        
        # File Server Discovery
        Write-MandALog "Discovering File Servers..." -Level "INFO"
        $discoveryResults.FileServers = Get-FileServersData -OutputPath $outputPath -Configuration $Configuration
        
        # File Share Discovery
        Write-MandALog "Discovering File Shares..." -Level "INFO"
        $discoveryResults.FileShares = Get-FileSharesData -OutputPath $outputPath -Configuration $Configuration
        
        # DFS Discovery
        Write-MandALog "Discovering DFS Namespaces..." -Level "INFO"
        $discoveryResults.DFSNamespaces = Get-DFSNamespacesData -OutputPath $outputPath -Configuration $Configuration
        $discoveryResults.DFSFolders = Get-DFSFoldersData -OutputPath $outputPath -Configuration $Configuration
        
        # Storage Analysis
        Write-MandALog "Analyzing Storage Usage..." -Level "INFO"
        $discoveryResults.StorageAnalysis = Get-StorageAnalysisData -OutputPath $outputPath -Configuration $Configuration
        
        # Shadow Copy Discovery
        Write-MandALog "Discovering Shadow Copy Settings..." -Level "INFO"
        $discoveryResults.ShadowCopies = Get-ShadowCopyData -OutputPath $outputPath -Configuration $Configuration
        
        # File Server Clustering
        Write-MandALog "Discovering File Server Clusters..." -Level "INFO"
        $discoveryResults.FileServerClusters = Get-FileServerClustersData -OutputPath $outputPath -Configuration $Configuration
        
        Write-MandALog "File Server discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "File Server discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-FileServersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "FileServers.csv"
    $fileServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "File Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering file servers in the domain" -Level "INFO"
        
        # Get all servers with File Services role
        $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem, Description -ErrorAction Stop
        
        foreach ($server in $servers) {
            try {
                # Test if server is reachable
                if (Test-Connection -ComputerName $server.Name -Count 1 -Quiet) {
                    # Check for file server features
                    $fileFeatures = Invoke-Command -ComputerName $server.Name -ScriptBlock {
                        Get-WindowsFeature -Name FS-FileServer, FS-DFS-Namespace, FS-DFS-Replication, FS-Resource-Manager |
                            Where-Object { $_.InstallState -eq "Installed" }
                    } -ErrorAction SilentlyContinue
                    
                    # Get share count
                    $shares = Get-WmiObject -Class Win32_Share -ComputerName $server.Name -ErrorAction SilentlyContinue |
                        Where-Object { $_.Type -eq 0 -and $_.Name -notlike "*$" }
                    
                    if ($shares -or $fileFeatures) {
                        # Get disk information
                        $disks = Get-WmiObject -Class Win32_LogicalDisk -ComputerName $server.Name -Filter "DriveType = 3" -ErrorAction SilentlyContinue
                        
                        $totalDiskSpace = ($disks | Measure-Object -Property Size -Sum).Sum
                        $freeDiskSpace = ($disks | Measure-Object -Property FreeSpace -Sum).Sum
                        
                        $fileServers.Add([PSCustomObject]@{
                            ServerName = $server.Name
                            OperatingSystem = $server.OperatingSystem
                            Description = $server.Description
                            ShareCount = ($shares | Measure-Object).Count
                            TotalDiskSpaceGB = [math]::Round($totalDiskSpace / 1GB, 2)
                            FreeDiskSpaceGB = [math]::Round($freeDiskSpace / 1GB, 2)
                            UsedDiskSpaceGB = [math]::Round(($totalDiskSpace - $freeDiskSpace) / 1GB, 2)
                            PercentUsed = if ($totalDiskSpace -gt 0) { [math]::Round((($totalDiskSpace - $freeDiskSpace) / $totalDiskSpace) * 100, 1) } else { 0 }
                            FileServerInstalled = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-FileServer"))
                            DFSNamespaceInstalled = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-DFS-Namespace"))
                            DFSReplicationInstalled = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-DFS-Replication"))
                            FSRMInstalled = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-Resource-Manager"))
                            LastDiscovered = Get-Date
                        })
                    }
                } else {
                    Write-MandALog "Server $($server.Name) is not reachable" -Level "WARN"
                }
            } catch {
                Write-MandALog "Error querying server $($server.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($fileServers.Count) file servers" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $fileServers -FilePath $outputFile
        return $fileServers
        
    } catch {
        Write-MandALog "Error retrieving File Servers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; OperatingSystem = $null; Description = $null
            ShareCount = $null; TotalDiskSpaceGB = $null; FreeDiskSpaceGB = $null
            UsedDiskSpaceGB = $null; PercentUsed = $null; FileServerInstalled = $null
            DFSNamespaceInstalled = $null; DFSReplicationInstalled = $null
            FSRMInstalled = $null; LastDiscovered = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-FileSharesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "FileShares.csv"
    $fileShares = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "File Shares CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get all servers (or use discovered file servers)
        $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem -ErrorAction Stop
        
        $totalServers = $servers.Count
        $currentServer = 0
        
        foreach ($server in $servers) {
            $currentServer++
            Write-Progress -Activity "Discovering File Shares" -Status "Server $currentServer of $totalServers`: $($server.Name)" -PercentComplete (($currentServer / $totalServers) * 100)
            
            try {
                if (Test-Connection -ComputerName $server.Name -Count 1 -Quiet) {
                    # Get shares from WMI
                    $shares = Get-WmiObject -Class Win32_Share -ComputerName $server.Name -ErrorAction Stop |
                        Where-Object { $_.Type -eq 0 -and $_.Name -notlike "*$" }
                    
                    foreach ($share in $shares) {
                        try {
                            # Get share permissions
                            $sharePermissions = Get-WmiObject -Class Win32_LogicalShareSecuritySetting -ComputerName $server.Name -Filter "Name='$($share.Name)'" -ErrorAction SilentlyContinue
                            
                            # Get folder size and file count (limited to avoid timeout)
                            $folderInfo = Invoke-Command -ComputerName $server.Name -ScriptBlock {
                                param($path)
                                try {
                                    $folder = Get-Item $path -ErrorAction Stop
                                    if ($folder.PSIsContainer) {
                                        # Get immediate children count only (not recursive to save time)
                                        $items = Get-ChildItem $path -ErrorAction SilentlyContinue
                                        $fileCount = ($items | Where-Object { -not $_.PSIsContainer }).Count
                                        $folderCount = ($items | Where-Object { $_.PSIsContainer }).Count
                                        
                                        # Get size (limited depth)
                                        $size = 0
                                        try {
                                            $size = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | 
                                                Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                                        } catch {
                                            $size = 0
                                        }
                                        
                                        return @{
                                            FileCount = $fileCount
                                            FolderCount = $folderCount
                                            SizeBytes = $size
                                        }
                                    }
                                } catch {
                                    return @{
                                        FileCount = 0
                                        FolderCount = 0
                                        SizeBytes = 0
                                        Error = $_.Exception.Message
                                    }
                                }
                            } -ArgumentList $share.Path -ErrorAction SilentlyContinue
                            
                            $fileShares.Add([PSCustomObject]@{
                                ServerName = $server.Name
                                ShareName = $share.Name
                                SharePath = $share.Path
                                Description = $share.Description
                                MaximumAllowed = $share.MaximumAllowed
                                CurrentUsers = $share.CurrentUserCount
                                Status = $share.Status
                                Type = switch ($share.Type) {
                                    0 { "Disk Drive" }
                                    1 { "Print Queue" }
                                    2 { "Device" }
                                    3 { "IPC" }
                                    2147483648 { "Disk Drive Admin" }
                                    2147483649 { "Print Queue Admin" }
                                    2147483650 { "Device Admin" }
                                    2147483651 { "IPC Admin" }
                                    default { "Unknown" }
                                }
                                FileCount = if ($folderInfo) { $folderInfo.FileCount } else { 0 }
                                FolderCount = if ($folderInfo) { $folderInfo.FolderCount } else { 0 }
                                SizeMB = if ($folderInfo -and $folderInfo.SizeBytes) { [math]::Round($folderInfo.SizeBytes / 1MB, 2) } else { 0 }
                                AllowMaximum = $share.AllowMaximum
                                Caption = $share.Caption
                            })
                        } catch {
                            Write-MandALog "Error processing share $($share.Name) on $($server.Name): $($_.Exception.Message)" -Level "WARN"
                        }
                    }
                }
            } catch {
                Write-MandALog "Error querying shares on $($server.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Discovering File Shares" -Completed
        Write-MandALog "Found $($fileShares.Count) file shares" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $fileShares -FilePath $outputFile
        return $fileShares
        
    } catch {
        Write-MandALog "Error retrieving File Shares: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ShareName = $null; SharePath = $null
            Description = $null; MaximumAllowed = $null; CurrentUsers = $null
            Status = $null; Type = $null; FileCount = $null; FolderCount = $null
            SizeMB = $null; AllowMaximum = $null; Caption = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DFSNamespacesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DFSNamespaces.csv"
    $dfsNamespaces = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DFS Namespaces CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering DFS Namespaces" -Level "INFO"
        
        # Get DFS roots from AD
        $domainObject = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
        $domainDN = "DC=" + $domainObject.Name.Replace(".", ",DC=")
        
        # Try DFSN PowerShell module first
        if (Get-Module -ListAvailable -Name DFSN) {
            Import-Module DFSN -ErrorAction SilentlyContinue
            
            try {
                $dfsRoots = Get-DfsnRoot -ErrorAction Stop
                
                foreach ($root in $dfsRoots) {
                    # Get namespace servers
                    $namespaceServers = Get-DfsnRootTarget -Path $root.Path -ErrorAction SilentlyContinue
                    
                    $dfsNamespaces.Add([PSCustomObject]@{
                        NamespacePath = $root.Path
                        NamespaceType = $root.Type
                        State = $root.State
                        Description = $root.Description
                        TimeToLive = $root.TimeToLive
                        NamespaceServers = ($namespaceServers.TargetPath -join "; ")
                        ServerCount = ($namespaceServers | Measure-Object).Count
                        GrantAdminAccess = $root.GrantAdminAccess
                        LastModified = $root.LastModifiedTime
                    })
                }
            } catch {
                Write-MandALog "Error using DFSN module: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        # Fallback to WMI method
        if ($dfsNamespaces.Count -eq 0) {
            Write-MandALog "Attempting WMI method for DFS discovery" -Level "INFO"
            
            # Query for DFS namespace servers
            $dfsServers = Get-ADComputer -Filter {ServicePrincipalName -like "*DFS*"} -ErrorAction SilentlyContinue
            
            foreach ($server in $dfsServers) {
                try {
                    $namespaces = Get-WmiObject -Namespace "root\MicrosoftDfs" -Class "DfsrNamespaceConfig" -ComputerName $server.Name -ErrorAction Stop
                    
                    foreach ($namespace in $namespaces) {
                        $dfsNamespaces.Add([PSCustomObject]@{
                            NamespacePath = $namespace.NamespaceName
                            NamespaceType = "Unknown (WMI)"
                            State = $namespace.State
                            Description = $namespace.Description
                            TimeToLive = $namespace.Ttl
                            NamespaceServers = $server.Name
                            ServerCount = 1
                            GrantAdminAccess = $null
                            LastModified = $null
                        })
                    }
                } catch {
                    Write-MandALog "Error querying DFS on $($server.Name): $($_.Exception.Message)" -Level "WARN"
                }
            }
        }
        
        Write-MandALog "Found $($dfsNamespaces.Count) DFS namespaces" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dfsNamespaces -FilePath $outputFile
        return $dfsNamespaces
        
    } catch {
        Write-MandALog "Error retrieving DFS Namespaces: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            NamespacePath = $null; NamespaceType = $null; State = $null
            Description = $null; TimeToLive = $null; NamespaceServers = $null
            ServerCount = $null; GrantAdminAccess = $null; LastModified = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DFSFoldersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DFSFolders.csv"
    $dfsFolders = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DFS Folders CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering DFS Folders and Targets" -Level "INFO"
        
        if (Get-Module -ListAvailable -Name DFSN) {
            Import-Module DFSN -ErrorAction SilentlyContinue
            
            try {
                # Get all DFS roots
                $dfsRoots = Get-DfsnRoot -ErrorAction Stop
                
                foreach ($root in $dfsRoots) {
                    Write-MandALog "Processing DFS namespace: $($root.Path)" -Level "INFO"
                    
                    try {
                        # Get all folders in this namespace
                        $folders = Get-DfsnFolder -Path "$($root.Path)\*" -ErrorAction Stop
                        
                        foreach ($folder in $folders) {
                            # Get folder targets
                            $targets = Get-DfsnFolderTarget -Path $folder.Path -ErrorAction SilentlyContinue
                            
                            $dfsFolders.Add([PSCustomObject]@{
                                NamespacePath = $root.Path
                                FolderPath = $folder.Path
                                State = $folder.State
                                Description = $folder.Description
                                TimeToLive = $folder.TimeToLive
                                TargetCount = ($targets | Measure-Object).Count
                                Targets = ($targets.TargetPath -join "; ")
                                TargetStates = ($targets.State -join "; ")
                                ReferralPriorityClass = $folder.ReferralPriorityClass
                                ReferralPriorityRank = $folder.ReferralPriorityRank
                            })
                        }
                    } catch {
                        Write-MandALog "Error processing namespace $($root.Path): $($_.Exception.Message)" -Level "WARN"
                    }
                }
            } catch {
                Write-MandALog "Error using DFSN module for folders: $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dfsFolders.Count) DFS folders" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dfsFolders -FilePath $outputFile
        return $dfsFolders
        
    } catch {
        Write-MandALog "Error retrieving DFS Folders: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            NamespacePath = $null; FolderPath = $null; State = $null
            Description = $null; TimeToLive = $null; TargetCount = $null
            Targets = $null; TargetStates = $null; ReferralPriorityClass = $null
            ReferralPriorityRank = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-StorageAnalysisData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "StorageAnalysis.csv"
    $storageAnalysis = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Storage Analysis CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Analyzing storage usage patterns" -Level "INFO"
        
        # Get file servers or use all servers
        $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem -ErrorAction Stop
        
        foreach ($server in $servers) {
            try {
                if (Test-Connection -ComputerName $server.Name -Count 1 -Quiet) {
                    # Get logical disks
                    $disks = Get-WmiObject -Class Win32_LogicalDisk -ComputerName $server.Name -Filter "DriveType = 3" -ErrorAction Stop
                    
                    foreach ($disk in $disks) {
                        # Get volume information
                        $volume = Get-WmiObject -Class Win32_Volume -ComputerName $server.Name -Filter "DriveLetter = '$($disk.DeviceID)'" -ErrorAction SilentlyContinue
                        
                        $storageAnalysis.Add([PSCustomObject]@{
                            ServerName = $server.Name
                            DriveLetter = $disk.DeviceID
                            VolumeName = $disk.VolumeName
                            FileSystem = $disk.FileSystem
                            TotalSizeGB = [math]::Round($disk.Size / 1GB, 2)
                            UsedSpaceGB = [math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2)
                            FreeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
                            PercentUsed = if ($disk.Size -gt 0) { [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1) } else { 0 }
                            PercentFree = if ($disk.Size -gt 0) { [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 1) } else { 0 }
                            BlockSize = if ($volume) { $volume.BlockSize } else { "Unknown" }
                            Compressed = if ($volume) { $volume.Compressed } else { "Unknown" }
                            DirtyBitSet = if ($volume) { $volume.DirtyBitSet } else { "Unknown" }
                            Label = if ($volume) { $volume.Label } else { $disk.VolumeName }
                            LastAnalyzed = Get-Date
                        })
                    }
                }
            } catch {
                Write-MandALog "Error analyzing storage on $($server.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Completed storage analysis for $($storageAnalysis.Count) volumes" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $storageAnalysis -FilePath $outputFile
        return $storageAnalysis
        
    } catch {
        Write-MandALog "Error performing Storage Analysis: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; DriveLetter = $null; VolumeName = $null
            FileSystem = $null; TotalSizeGB = $null; UsedSpaceGB = $null
            FreeSpaceGB = $null; PercentUsed = $null; PercentFree = $null
            BlockSize = $null; Compressed = $null; DirtyBitSet = $null
            Label = $null; LastAnalyzed = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-ShadowCopyData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ShadowCopies.csv"
    $shadowCopies = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Shadow Copies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering Shadow Copy settings" -Level "INFO"
        
        # Get file servers
        $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties OperatingSystem -ErrorAction Stop
        
        foreach ($server in $servers) {
            try {
                if (Test-Connection -ComputerName $server.Name -Count 1 -Quiet) {
                    # Get shadow copy information
                    $shadows = Get-WmiObject -Class Win32_ShadowCopy -ComputerName $server.Name -ErrorAction SilentlyContinue
                    
                    if ($shadows) {
                        foreach ($shadow in $shadows) {
                            # Get shadow storage
                            $shadowStorage = Get-WmiObject -Class Win32_ShadowStorage -ComputerName $server.Name -Filter "Volume='$($shadow.VolumeName)'" -ErrorAction SilentlyContinue
                            
                            $shadowCopies.Add([PSCustomObject]@{
                                ServerName = $server.Name
                                ShadowID = $shadow.ID
                                VolumeName = $shadow.VolumeName
                                InstallDate = $shadow.InstallDate
                                Count = $shadow.Count
                                DeviceObject = $shadow.DeviceObject
                                OriginatingMachine = $shadow.OriginatingMachine
                                ServiceMachine = $shadow.ServiceMachine
                                ExposedName = $shadow.ExposedName
                                State = switch ($shadow.State) {
                                    1 { "Preparing" }
                                    2 { "ProcessingPrepare" }
                                    3 { "Prepared" }
                                    4 { "ProcessingPrecommit" }
                                    5 { "Precommitted" }
                                    6 { "ProcessingCommit" }
                                    7 { "Committed" }
                                    8 { "ProcessingPostcommit" }
                                    9 { "Created" }
                                    10 { "Aborted" }
                                    11 { "Deleted" }
                                    12 { "Count" }
                                    default { "Unknown" }
                                }
                                ClientAccessible = $shadow.ClientAccessible
                                NoAutoRelease = $shadow.NoAutoRelease
                                Persistent = $shadow.Persistent
                                MaxSpace = if ($shadowStorage) { [math]::Round($shadowStorage.MaxSpace / 1GB, 2) } else { "Unknown" }
                                UsedSpace = if ($shadowStorage) { [math]::Round($shadowStorage.UsedSpace / 1GB, 2) } else { "Unknown" }
                            })
                        }
                    }
                }
            } catch {
                Write-MandALog "Error querying shadow copies on $($server.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($shadowCopies.Count) shadow copy configurations" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $shadowCopies -FilePath $outputFile
        return $shadowCopies
        
    } catch {
        Write-MandALog "Error retrieving Shadow Copies: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ShadowID = $null; VolumeName = $null
            InstallDate = $null; Count = $null; DeviceObject = $null
            OriginatingMachine = $null; ServiceMachine = $null; ExposedName = $null
            State = $null; ClientAccessible = $null; NoAutoRelease = $null
            Persistent = $null; MaxSpace = $null; UsedSpace = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-FileServerClustersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "FileServerClusters.csv"
    $fsClusters = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "File Server Clusters CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering File Server Clusters" -Level "INFO"
        
        # Get all clusters
        $clusters = Get-ADObject -Filter {ObjectClass -eq "msCS-ClusterSet" -or ObjectClass -eq "serviceConnectionPoint"} -Properties * -ErrorAction SilentlyContinue |
            Where-Object { $_.servicePrincipalName -like "*MSCluster*" }
        
        # Alternative: Try to find clusters via computer objects
        if (-not $clusters) {
            $clusters = Get-ADComputer -Filter {ServicePrincipalName -like "*MSCluster*"} -Properties * -ErrorAction SilentlyContinue
        }
        
        foreach ($cluster in $clusters) {
            try {
                $clusterName = $cluster.Name -replace '\$$', ''
                
                # Get cluster information using FailoverClusters module if available
                if (Get-Module -ListAvailable -Name FailoverClusters) {
                    Import-Module FailoverClusters -ErrorAction SilentlyContinue
                    
                    try {
                        $clusterInfo = Get-Cluster -Name $clusterName -ErrorAction Stop
                        $clusterNodes = Get-ClusterNode -Cluster $clusterName -ErrorAction SilentlyContinue
                        $clusterResources = Get-ClusterResource -Cluster $clusterName -ErrorAction SilentlyContinue | 
                            Where-Object { $_.ResourceType -like "*File Server*" }
                        
                        $fsClusters.Add([PSCustomObject]@{
                            ClusterName = $clusterName
                            Domain = $clusterInfo.Domain
                            Description = $clusterInfo.Description
                            NodeCount = ($clusterNodes | Measure-Object).Count
                            Nodes = ($clusterNodes.Name -join "; ")
                            FileServerResourceCount = ($clusterResources | Measure-Object).Count
                            FileServerResources = ($clusterResources.Name -join "; ")
                            ClusterQuorum = (Get-ClusterQuorum -Cluster $clusterName -ErrorAction SilentlyContinue).QuorumType
                            SharedVolumeCount = (Get-ClusterSharedVolume -Cluster $clusterName -ErrorAction SilentlyContinue | Measure-Object).Count
                            Created = $cluster.Created
                            Modified = $cluster.Modified
                        })
                    } catch {
                        Write-MandALog "Error querying cluster $clusterName using FailoverClusters module: $($_.Exception.Message)" -Level "WARN"
                    }
                } else {
                    # Basic cluster info without FailoverClusters module
                    $fsClusters.Add([PSCustomObject]@{
                        ClusterName = $clusterName
                        Domain = $cluster.CanonicalName.Split('/')[0]
                        Description = $cluster.Description
                        NodeCount = "Unknown"
                        Nodes = "Requires FailoverClusters module"
                        FileServerResourceCount = "Unknown"
                        FileServerResources = "Requires FailoverClusters module"
                        ClusterQuorum = "Unknown"
                        SharedVolumeCount = "Unknown"
                        Created = $cluster.Created
                        Modified = $cluster.Modified
                    })
                }
            } catch {
                Write-MandALog "Error processing cluster $($cluster.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($fsClusters.Count) file server clusters" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $fsClusters -FilePath $outputFile
        return $fsClusters
        
    } catch {
        Write-MandALog "Error retrieving File Server Clusters: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ClusterName = $null; Domain = $null; Description = $null
            NodeCount = $null; Nodes = $null; FileServerResourceCount = $null
            FileServerResources = $null; ClusterQuorum = $null; SharedVolumeCount = $null
            Created = $null; Modified = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-FileServerDiscovery',
    'Get-FileServersData',
    'Get-FileSharesData',
    'Get-DFSNamespacesData',
    'Get-DFSFoldersData',
    'Get-StorageAnalysisData',
    'Get-ShadowCopyData',
    'Get-FileServerClustersData'
)