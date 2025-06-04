<#
.SYNOPSIS
    File Server and Storage discovery for M&A Discovery Suite.
.DESCRIPTION
    Discovers file servers, shares, DFS namespaces, permissions, storage information,
    shadow copies, and file server clusters. Enhanced for robustness and performance.
.NOTES
    Version: 2.0.0
    Author: Gemini (based on user's script with improvements)
    Date: 2025-06-01
#>

#Requires -Modules ActiveDirectory # For Get-ADComputer
#Requires -Modules CimCmdlets # For Get-CimInstance (alternative to Get-WmiObject)
#Requires -Modules DfsMgmt # For Get-DfsnRoot, etc. (new name for DFSN module in modern Windows)
#Requires -Modules FailoverClusters # For cluster discovery

# Helper functions from FileOperations.psm1 are expected to be loaded globally by the orchestrator
# e.g., Export-SuiteDataToCsv, Import-SuiteDataFromCsv

# --- Main Exported Function ---

$outputPath = $Context.Paths.RawDataOutput
function Invoke-FileServerDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "--- Starting File Server and Storage Discovery (v2.0.0) ---" -Level "HEADER"
        
        # Ensure essential config sub-section exists
        if (-not $Configuration.discovery.ContainsKey('fileServer')) {
            Write-MandALog "FileServer discovery configuration missing from 'default-config.json' under 'discovery.fileServer'. Using safe defaults or skipping certain parts." -Level "WARN"
            # Provide minimal defaults if missing, or this could fail later
            $Configuration.discovery.fileServer = @{
                targetServers = @(); excludedServers = @(); useSmbShareForEnumeration = $true;
                timeoutPerServerRemoteCommandSeconds = 120; collectShareDetailsLevel = 'Basic';
                timeoutPerShareAclSeconds = 60; timeoutPerShareSizeSeconds = 300; maxSharePathDepthForSize = 1;
                excludedShareNames = @("ADMIN$", "IPC$", "PRINT$", "FAX$", "SYSVOL", "NETLOGON");
                discoverDFS = $true; discoverStorageAnalysis = $true; discoverShadowCopies = $true; discoverClusters = $true
                skipShareSizeCalculationForPathDepthExceeding = 1000000
            }
        }

        $rawOutputPath = Join-Path $Configuration.environment.outputPath "Raw"
        $discoveryResults = @{
            FileServers = @(); FileShares = @(); DFSNamespaces = @(); DFSFolders = @();
            StorageAnalysis = @(); ShadowCopies = @(); FileServerClusters = @()
        }
        
        $fileServerConfig = $Configuration.discovery.fileServer

        # File Server Discovery
        if ($Configuration.discovery.enabledSources -contains "FileServerList") { # Assuming a separate toggle if needed
            Write-MandALog "Discovering File Servers..." -Level "INFO"
            $discoveryResults.FileServers = Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
        }
        
        # File Share Discovery (uses servers from Get-FileServersDataInternal or a new list)
        if ($Configuration.discovery.enabledSources -contains "FileShares") {
             Write-MandALog "Discovering File Shares..." -Level "INFO"
            $serverListForShares = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
            $discoveryResults.FileShares = Get-FileSharesDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForShares
        }
        
        # DFS Discovery
        if ($fileServerConfig.discoverDFS) {
            Write-MandALog "Discovering DFS Namespaces..." -Level "INFO"
            $discoveryResults.DFSNamespaces = Get-DFSNamespacesDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
            Write-MandALog "Discovering DFS Folders..." -Level "INFO"
            $discoveryResults.DFSFolders = Get-DFSFoldersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -DfsNamespaces $discoveryResults.DFSNamespaces
        }
        
        # Storage Analysis
         if ($fileServerConfig.discoverStorageAnalysis) {
            Write-MandALog "Analyzing Storage Usage..." -Level "INFO"
            $serverListForStorage = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
            $discoveryResults.StorageAnalysis = Get-StorageAnalysisDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForStorage
        }
        
        # Shadow Copy Discovery
        if ($fileServerConfig.discoverShadowCopies) {
            Write-MandALog "Discovering Shadow Copy Settings..." -Level "INFO"
            $serverListForShadow = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
            $discoveryResults.ShadowCopies = Get-ShadowCopyDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForShadow
        }
        
        # File Server Clustering
        if ($fileServerConfig.discoverClusters) {
            Write-MandALog "Discovering File Server Clusters..." -Level "INFO"
            $discoveryResults.FileServerClusters = Get-FileServerClustersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
        }
        
        Write-MandALog "File Server and Storage discovery completed." -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "File Server discovery phase failed catastrophically: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# --- Internal Data Collection Functions ---

function Get-FileServersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    
    $outputFileName = "FileServers"
    $fileServerConfig = $Configuration.discovery.fileServer
    $fileServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
    
    try {
        Write-MandALog "Identifying potential file servers..." -Level "INFO"
        $targetServers = @()
        if ($fileServerConfig.targetServers -is [array] -and $fileServerConfig.targetServers.Count -gt 0) {
            $targetServers = $fileServerConfig.targetServers | ForEach-Object { Get-ADComputer -Identity $_ -Properties OperatingSystem, Description, DNSHostName -ErrorAction SilentlyContinue } | Where-Object {$null -ne $_}
            Write-MandALog "Using configured target server list: $($fileServerConfig.targetServers -join ', ')" -Level "INFO"
        } else {
            $targetServers = Get-ADComputer -Filter { OperatingSystem -like "*Server*" -and Enabled -eq $true } -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
            Write-MandALog "Discovering servers from Active Directory." -Level "INFO"
        }

        $excludedServers = [System.Collections.Generic.HashSet[string]]::new([string[]]$fileServerConfig.excludedServers, [System.StringComparer]::OrdinalIgnoreCase)

        $sessionOption = New-PSSessionOption -OperationTimeout ($fileServerConfig.timeoutPerServerRemoteCommandSeconds * 1000) -ErrorAction SilentlyContinue

        foreach ($serverADInfo in $targetServers) {
            $serverName = $serverADInfo.DNSHostName # Prefer FQDN
            if ([string]::IsNullOrWhiteSpace($serverName)) { $serverName = $serverADInfo.Name }
            if ($excludedServers.Contains($serverName)) {
                Write-MandALog "Skipping excluded server: $serverName" -Level "DEBUG"
                continue
            }

            Write-MandALog "Processing server: $serverName" -Level "DEBUG"
            try {
                if (-not (Test-NetConnection -ComputerName $serverName -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue)) {
                    Write-MandALog "Server $serverName is not reachable via Test-NetConnection." -Level "WARN"
                    continue
                }

                $fileFeatures = $null; $shares = $null; $disks = $null
                try {
                     $fileFeatures = Invoke-Command -ComputerName $serverName -SessionOption $sessionOption -ScriptBlock {
                        Get-WindowsFeature -Name FS-FileServer, FS-DFS-Namespace, FS-DFS-Replication, FS-Resource-Manager |
                            Where-Object { $_.InstallState -eq "Installed" } | Select-Object Name, DisplayName, InstallState
                    } -ErrorAction SilentlyContinue
                } catch { Write-MandALog "Failed to get Windows Features from $serverName : $($_.Exception.Message)" -Level "WARN"}

                if ($fileServerConfig.useSmbShareForEnumeration -as [bool]) {
                    try {
                         $shares = Get-SmbShare -CimSession $serverName -ErrorAction SilentlyContinue |
                            Where-Object { $_.ShareType -eq 'FileSystemDirectory' -and $_.Name -notin $fileServerConfig.excludedShareNames -and $_.Name -notmatch '^\w\$' }
                    } catch { Write-MandALog "Get-SmbShare failed for $serverName : $($_.Exception.Message). Falling back to WMI if configured or skipping." -Level "WARN"}
                }
                if ($null -eq $shares) { # Fallback or if useSmbShare is false
                    try {
                        $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -ErrorAction SilentlyContinue |
                            Where-Object { $_.Type -eq 0 -and $_.Name -notin $fileServerConfig.excludedShareNames -and $_.Name -notmatch '^\w\$' } # Type 0 is Disk Drive
                    } catch { Write-MandALog "Get-CimInstance Win32_Share failed for $serverName : $($_.Exception.Message)" -Level "WARN"}
                }
                
                if (($null -ne $shares -and $shares.Count -gt 0) -or ($null -ne $fileFeatures -and $fileFeatures.Count -gt 0)) {
                    try {
                        $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -ErrorAction SilentlyContinue
                    } catch { Write-MandALog "Get-CimInstance Win32_LogicalDisk failed for $serverName : $($_.Exception.Message)" -Level "WARN"}

                    $totalDiskSpace = if($null -ne $disks){($disks | Measure-Object -Property Size -Sum -ErrorAction SilentlyContinue).Sum}else{0}
                    $freeDiskSpace = if($null -ne $disks){($disks | Measure-Object -Property FreeSpace -Sum -ErrorAction SilentlyContinue).Sum}else{0}
                    
                    $fileServers.Add([PSCustomObject]@{
                        ServerName              = $serverName
                        OperatingSystem         = $serverADInfo.OperatingSystem
                        Description             = $serverADInfo.Description
                        ShareCount              = if($null -ne $shares){($shares | Measure-Object).Count}else{0}
                        TotalDiskSpaceGB        = if($totalDiskSpace -gt 0){[math]::Round($totalDiskSpace / 1GB, 2)}else{0}
                        FreeDiskSpaceGB         = if($freeDiskSpace -gt 0){[math]::Round($freeDiskSpace / 1GB, 2)}else{0}
                        UsedDiskSpaceGB         = if($totalDiskSpace -gt 0){[math]::Round(($totalDiskSpace - $freeDiskSpace) / 1GB, 2)}else{0}
                        PercentUsed             = if ($totalDiskSpace -gt 0) { [math]::Round((($totalDiskSpace - $freeDiskSpace) / $totalDiskSpace) * 100, 1) } else { 0 }
                        FileServerInstalled     = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-FileServer"))
                        DFSNamespaceInstalled   = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-DFS-Namespace"))
                        DFSReplicationInstalled = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-DFS-Replication"))
                        FSRMInstalled           = ($null -ne ($fileFeatures | Where-Object Name -eq "FS-Resource-Manager"))
                        LastDiscovered          = Get-Date
                    })
                }
            } catch { Write-MandALog "Error processing server $serverName $($_.Exception.Message)" -Level "WARN" }
        }
        
        Write-MandALog "Identified $($fileServers.Count) potential file servers." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $fileServers -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $fileServers
    } catch {
        Write-MandALog "Error retrieving File Servers list: $($_.Exception.Message)" -Level "ERROR"
        return @() # Return empty on major failure
    }
}

function Get-FileSharesDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][array]$ServerList # Array of server objects/names from Get-FileServersDataInternal
    )
    $outputFileName = "FileShares"
    $fileServerConfig = $Configuration.discovery.fileServer
    $fileSharesResult = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
    if ($null -eq $ServerList -or $ServerList.Count -eq 0) {
        Write-MandALog "No servers provided to Get-FileSharesDataInternal. Skipping share discovery." -Level "WARN"
        return @()
    }

    $collectDetailsLevel = $fileServerConfig.collectShareDetailsLevel
    $sessionOption = New-PSSessionOption -OperationTimeout ($fileServerConfig.timeoutPerServerRemoteCommandSeconds * 1000) -ErrorAction SilentlyContinue
    $aclTimeoutSeconds = $fileServerConfig.timeoutPerShareAclSeconds
    $sizeTimeoutSeconds = $fileServerConfig.timeoutPerShareSizeSeconds

    $totalServers = $ServerList.Count
    $currentServerIdx = 0
    
    foreach ($serverEntry in $ServerList) {
        $serverName = $serverEntry.ServerName # Assuming ServerList contains objects with ServerName property
        $currentServerIdx++
        Write-Progress -Activity "Discovering File Shares" -Status "Server $currentServerIdx of $totalServers $serverName" -PercentComplete (($currentServerIdx / $totalServers) * 100)
        Write-MandALog "Enumerating shares on $serverName..." -Level "INFO"

        $shares = @()
        try {
            if ($fileServerConfig.useSmbShareForEnumeration -as [bool]) {
                $shares = Get-SmbShare -CimSession $serverName -ErrorAction Stop |
                    Where-Object { $_.ShareType -eq 'FileSystemDirectory' -and $_.Name -notin $fileServerConfig.excludedShareNames -and $_.Name -notmatch '^\w\$' }
            } else {
                $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -ErrorAction Stop |
                    Where-Object { $_.Type -eq 0 -and $_.Name -notin $fileServerConfig.excludedShareNames -and $_.Name -notmatch '^\w\$' }
            }
        } catch { Write-MandALog "Failed to list shares on $serverName $($_.Exception.Message)" -Level "WARN"; continue }
        
        if ($null -eq $shares) { Write-MandALog "No shares found or accessible on $serverName." -Level "DEBUG"; continue }

        foreach ($share in $shares) {
            Write-MandALog "Processing share '$($share.Name)' on '$serverName'..." -Level "DEBUG"
            $sharePath = $share.Path # Local path on the server
            $uncPath = "\\$serverName\$($share.Name)"
            $shareDetails = @{
                ServerName      = $serverName
                ShareName       = $share.Name
                SharePath       = $sharePath
                UNCPath         = $uncPath
                Description     = $share.Description
                CurrentUsers    = if ($share.PSObject.Properties["CurrentUses"]) {$share.CurrentUses} elseif($share.PSObject.Properties["CurrentUserCount"]) {$share.CurrentUserCount} else {0} # Property name differs
                Type            = if ($share.PSObject.Properties["ShareType"]) {$share.ShareType.ToString()} elseif($share.PSObject.Properties["Type"]) {$share.Type} else {"Unknown"}
            }

            if ($collectDetailsLevel -ne "None") {
                # Get ACLs (Basic or Full)
                if ($collectDetailsLevel -in "Basic", "Full") {
                    $aclJob = Start-Job -ScriptBlock {
                        param($PathToACL)
                        (Get-Acl -Path $PathToACL -ErrorAction SilentlyContinue).AccessToString
                    } -ArgumentList $uncPath # Use UNC path for ACLs if possible, or local path via Invoke-Command
                    
                    if (Wait-Job $aclJob -Timeout $aclTimeoutSeconds) {
                        $shareDetails.ACLs = Receive-Job $aclJob
                    } else {
                        Write-MandALog "Timeout ($($aclTimeoutSeconds)s) getting ACLs for $uncPath" -Level "WARN"
                        Stop-Job $aclJob -Force
                        $shareDetails.ACLs = "ACL_TIMEOUT"
                    }
                    Remove-Job $aclJob -Force
                }

                # Get Size and Item Counts (Full only) - THIS IS THE SLOWEST PART
                if ($collectDetailsLevel -eq "Full") {
                    Write-MandALog "Attempting to get size/item count for $uncPath (Timeout: $($sizeTimeoutSeconds)s)" -Level "DEBUG"
                    $sizeJob = Start-Job -ScriptBlock {
                        param($RemotePath, $MaxDepth, $PathDepthExceedThreshold)
                        $fileCount = 0; $folderCount = 0; $sizeBytes = 0; $errorMsg = $null
                        try {
                            # Check path depth first
                            $pathDepth = ($RemotePath -split '[\\/]').Count
                            if ($pathDepth -gt $PathDepthExceedThreshold) {
                                $errorMsg = "Path_Depth_Exceeded_Threshold_($PathDepthExceedThreshold)"
                                throw $errorMsg
                            }

                            $items = Get-ChildItem -Path $RemotePath -Recurse -Force -Depth $MaxDepth -ErrorAction SilentlyContinue
                            $fileItems = $items | Where-Object {-not $_.PSIsContainer}
                            $folderItems = $items | Where-Object {$_.PSIsContainer}
                            $fileCount = $fileItems.Count
                            $folderCount = $folderItems.Count
                            $sizeBytes = ($fileItems | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                        } catch {
                           if ($null -eq $errorMsg) { $errorMsg = $_.Exception.Message }
                        }
                        return @{ FileCount = $fileCount; FolderCount = $folderCount; SizeBytes = $sizeBytes; SizeError = $errorMsg }
                    } -ArgumentList $sharePath, $fileServerConfig.maxSharePathDepthForSize, $fileServerConfig.skipShareSizeCalculationForPathDepthExceeding
                    
                    if(Wait-Job $sizeJob -Timeout $sizeTimeoutSeconds) {
                        $folderInfo = Receive-Job $sizeJob
                        $shareDetails.FileCount = $folderInfo.FileCount
                        $shareDetails.FolderCount = $folderInfo.FolderCount
                        $shareDetails.SizeBytes = $folderInfo.SizeBytes
                        $shareDetails.SizeMB = if ($null -ne $folderInfo.SizeBytes) { [math]::Round($folderInfo.SizeBytes / 1MB, 2) } else { 0 }
                        if ($null -ne $folderInfo.SizeError) { $shareDetails.SizeCollectionError = $folderInfo.SizeError }
                    } else {
                        Write-MandALog "Timeout ($($sizeTimeoutSeconds)s) getting size for $uncPath" -Level "WARN"
                        Stop-Job $sizeJob -Force
                        $shareDetails.SizeCollectionError = "SIZE_CALCULATION_TIMEOUT"
                    }
                    Remove-Job $sizeJob -Force
                }
            }
            $fileSharesResult.Add([PSCustomObject]$shareDetails)
        }
    }
    Write-Progress -Activity "Discovering File Shares" -Completed
    Write-MandALog "Processed $($fileSharesResult.Count) file shares entries across all servers." -Level "SUCCESS"
    Export-SuiteDataToCsv -DataToExport $fileSharesResult -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
    return $fileSharesResult
}


function Get-DFSNamespacesDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFileName = "DFSNamespaces"
    $dfsNamespaces = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
    
    if (-not (Get-Module -ListAvailable -Name DfsMgmt)) { # DfsMgmt is the module name for newer systems
        Write-MandALog "DfsMgmt module not available. Skipping DFS Namespace discovery. Install RSAT: File Services Tools -> DFS Management Tools." -Level "WARN"
        return @()
    }
    Import-Module DfsMgmt -ErrorAction SilentlyContinue # SilentlyContinue as it might already be loaded

    try {
        Write-MandALog "Discovering DFS Namespaces using DfsMgmt module..." -Level "INFO"
        $dfsRoots = Get-DfsnRoot -ErrorAction SilentlyContinue
        
        if ($null -eq $dfsRoots -or $dfsRoots.Count -eq 0) {
             Write-MandALog "No DFS Namespaces found via Get-DfsnRoot. Check if DFSN role is installed or if there are namespaces." -Level "INFO"
        } else {
            foreach ($root in $dfsRoots) {
                $namespaceServers = @()
                try { $namespaceServers = Get-DfsnRootTarget -Path $root.Path -ErrorAction SilentlyContinue } 
                catch { Write-MandALog "Could not get root targets for $($root.Path): $($_.Exception.Message)" -Level "DEBUG" }
                
                $dfsNamespaces.Add([PSCustomObject]@{
                    NamespacePath    = $root.Path
                    NamespaceType    = $root.Type.ToString()
                    State            = $root.State.ToString()
                    Description      = $root.Description
                    TimeToLiveSecs   = $root.TimeToLive.TotalSeconds
                    NamespaceServers = ($namespaceServers.TargetPath -join "; ")
                    ServerCount      = $namespaceServers.Count
                    GrantAdminAccess = $root.GrantAdminAccess # This property might not exist on all objects, handle if $null
                    LastModified     = if($root.PSObject.Properties['LastModifiedTime']){$root.LastModifiedTime}else{$null}
                })
            }
        }
        Write-MandALog "Found $($dfsNamespaces.Count) DFS namespaces." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $dfsNamespaces -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $dfsNamespaces
    } catch {
        Write-MandALog "Error retrieving DFS Namespaces: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-DFSFoldersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$false)][array]$DfsNamespaces # Pass results from Get-DFSNamespacesDataInternal
    )
    $outputFileName = "DFSFolders"
    $dfsFoldersResult = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
    
    if (-not (Get-Module -ListAvailable -Name DfsMgmt)) {
        Write-MandALog "DfsMgmt module not available. Skipping DFS Folder discovery." -Level "WARN"
        return @()
    }
    if ($null -eq $DfsNamespaces -or $DfsNamespaces.Count -eq 0) {
        Write-MandALog "No DFS Namespaces provided to Get-DFSFoldersDataInternal. Skipping DFS Folder discovery." -Level "INFO"
        return @()
    }

    try {
        Write-MandALog "Discovering DFS Folders and Targets for $($DfsNamespaces.Count) namespaces..." -Level "INFO"
        foreach ($namespaceInfo in $DfsNamespaces) {
            $rootPath = $namespaceInfo.NamespacePath
            Write-MandALog "Processing DFS namespace: $rootPath" -Level "DEBUG"
            try {
                $folders = Get-DfsnFolder -Path "$rootPath\*" -Recurse -ErrorAction SilentlyContinue # Added -Recurse
                if ($null -ne $folders) {
                    foreach ($folder in $folders) {
                        $targets = @()
                        try { $targets = Get-DfsnFolderTarget -Path $folder.Path -ErrorAction SilentlyContinue }
                        catch { Write-MandALog "Could not get folder targets for $($folder.Path): $($_.Exception.Message)" -Level "DEBUG" }
                        
                        $dfsFoldersResult.Add([PSCustomObject]@{
                            NamespacePath         = $rootPath
                            FolderPath            = $folder.Path
                            State                 = $folder.State.ToString()
                            Description           = $folder.Description
                            TimeToLiveSecs        = $folder.TimeToLive.TotalSeconds
                            TargetCount           = $targets.Count
                            Targets               = ($targets.TargetPath -join "; ")
                            TargetStates          = ($targets.State.ToString() -join "; ") # Convert enum to string
                            ReferralPriorityClass = if($folder.PSObject.Properties['ReferralPriorityClass']){$folder.ReferralPriorityClass.ToString()}else{$null}
                            # ReferralPriorityRank may not always exist or be relevant.
                        })
                    }
                }
            } catch { Write-MandALog "Error processing namespace '$rootPath' for folders: $($_.Exception.Message)" -Level "WARN" }
        }
        Write-MandALog "Discovered $($dfsFoldersResult.Count) DFS folders/links." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $dfsFoldersResult -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $dfsFoldersResult
    } catch {
        Write-MandALog "Error retrieving DFS Folders: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-StorageAnalysisDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][array]$ServerList
    )
    $outputFileName = "StorageAnalysis"
    $storageAnalysis = [System.Collections.Generic.List[PSCustomObject]]::new()
    $fileServerConfig = $Configuration.discovery.fileServer
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
     if ($null -eq $ServerList -or $ServerList.Count -eq 0) {
        Write-MandALog "No servers provided to Get-StorageAnalysisDataInternal. Skipping." -Level "WARN"
        return @()
    }
    try {
        Write-MandALog "Analyzing storage usage patterns on listed servers..." -Level "INFO"
        foreach ($serverEntry in $ServerList) {
            $serverName = $serverEntry.ServerName
            Write-MandALog "Analyzing storage on $serverName" -Level "DEBUG"
            try {
                if (-not (Test-NetConnection -ComputerName $serverName -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue)) {
                     Write-MandALog "Server $serverName unreachable for storage analysis." -Level "WARN"; continue
                }
                $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -ErrorAction Stop
                foreach ($disk in $disks) {
                    $volume = Get-CimInstance -ClassName Win32_Volume -ComputerName $serverName -Filter "DriveLetter = '$($disk.DeviceID)'" -ErrorAction SilentlyContinue
                    $storageAnalysis.Add([PSCustomObject]@{
                        ServerName    = $serverName
                        DriveLetter   = $disk.DeviceID
                        VolumeName    = $disk.VolumeName
                        FileSystem    = $disk.FileSystem
                        TotalSizeGB   = if($null -ne $disk.Size){[math]::Round($disk.Size / 1GB, 2)}else{0}
                        UsedSpaceGB   = if($null -ne $disk.Size -and $null -ne $disk.FreeSpace){[math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2)}else{0}
                        FreeSpaceGB   = if($null -ne $disk.FreeSpace){[math]::Round($disk.FreeSpace / 1GB, 2)}else{0}
                        PercentUsed   = if ($null -ne $disk.Size -and $disk.Size -gt 0) { [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1) } else { 0 }
                        BlockSize     = if ($null -ne $volume) { $volume.BlockSize } else { "Unknown" }
                        Compressed    = if ($null -ne $volume) { $volume.Compressed } else { "Unknown" }
                        Label         = if ($null -ne $volume) { $volume.Label } else { $disk.VolumeName }
                        LastAnalyzed  = Get-Date
                    })
                }
            } catch { Write-MandALog "Error analyzing storage on $serverName $($_.Exception.Message)" -Level "WARN" }
        }
        Write-MandALog "Completed storage analysis for $($storageAnalysis.Count) volumes." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $storageAnalysis -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $storageAnalysis
    } catch {
        Write-MandALog "Error performing Storage Analysis: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ShadowCopyDataInternal {
     [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][array]$ServerList
    )
    $outputFileName = "ShadowCopies"
    $shadowCopiesResult = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }
    if ($null -eq $ServerList -or $ServerList.Count -eq 0) {
        Write-MandALog "No servers provided to Get-ShadowCopyDataInternal. Skipping." -Level "WARN"
        return @()
    }
    try {
        Write-MandALog "Discovering Shadow Copy settings on listed servers..." -Level "INFO"
        foreach ($serverEntry in $ServerList) {
            $serverName = $serverEntry.ServerName
             Write-MandALog "Querying shadow copies on $serverName" -Level "DEBUG"
            try {
                 if (-not (Test-NetConnection -ComputerName $serverName -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue)) {
                     Write-MandALog "Server $serverName unreachable for shadow copy discovery." -Level "WARN"; continue
                }
                $shadows = Get-CimInstance -ClassName Win32_ShadowCopy -ComputerName $serverName -ErrorAction Stop
                if ($null -ne $shadows) {
                    foreach ($shadow in $shadows) {
                        $shadowStorage = Get-CimInstance -ClassName Win32_ShadowStorage -ComputerName $serverName -Filter "Volume='$($shadow.VolumeName)'" -ErrorAction SilentlyContinue
                        $shadowCopiesResult.Add([PSCustomObject]@{
                            ServerName          = $serverName
                            ShadowID            = $shadow.ID
                            VolumeName          = $shadow.VolumeName
                            InstallDate         = $shadow.InstallDate # This is CIM_DATETIME, might need conversion
                            Persistent          = $shadow.Persistent
                            ClientAccessible    = $shadow.ClientAccessible
                            MaxSpaceGB          = if ($null -ne $shadowStorage) { [math]::Round($shadowStorage.MaxSpace / 1GB, 2) } else { "N/A" }
                            UsedSpaceGB         = if ($null -ne $shadowStorage) { [math]::Round($shadowStorage.UsedSpace / 1GB, 2) } else { "N/A" }
                            OriginatingMachine  = $shadow.OriginatingMachine
                        })
                    }
                }
            } catch { Write-MandALog "Error querying shadow copies on $serverName $($_.Exception.Message)" -Level "WARN" }
        }
        Write-MandALog "Discovered $($shadowCopiesResult.Count) shadow copy configurations." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $shadowCopiesResult -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $shadowCopiesResult
    } catch {
        Write-MandALog "Error retrieving Shadow Copies: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-FileServerClustersDataInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$RawOutputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration
    )
    $outputFileName = "FileServerClusters"
    $fsClustersResult = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if (($Configuration.discovery.skipExistingFiles -as [bool]) -and (Test-Path (Join-Path $RawOutputPath "$outputFileName.csv"))) {
        Write-MandALog "$outputFileName CSV already exists. Importing." -Level "INFO"
        return Import-SuiteDataFromCsv -FullCsvPath (Join-Path $RawOutputPath "$outputFileName.csv")
    }

    if (-not (Get-Module -ListAvailable -Name FailoverClusters)) {
        Write-MandALog "FailoverClusters module not available. Skipping File Server Cluster discovery. Install RSAT: Failover Clustering Tools." -Level "WARN"
        return @()
    }
    Import-Module FailoverClusters -ErrorAction SilentlyContinue

    try {
        Write-MandALog "Discovering File Server Clusters from AD..." -Level "INFO"
        $clusterADObjects = Get-ADComputer -Filter { ServicePrincipalName -like "*MSClusterVirtualServer*" } -Properties * -ErrorAction SilentlyContinue
        
        if ($null -eq $clusterADObjects -or $clusterADObjects.Count -eq 0) {
            Write-MandALog "No AD objects found with MSClusterVirtualServer SPN. Trying MSClusterSet ObjectClass." -Level "INFO"
            $clusterADObjects = Get-ADObject -LDAPFilter "(&(objectClass=msCluster-VirtualServer)(servicePrincipalName=MSClusterVirtualServer/*))" -Properties * -ErrorAction SilentlyContinue
        }
         if ($null -eq $clusterADObjects -or $clusterADObjects.Count -eq 0) {
            Write-MandALog "No potential cluster AD objects found. Skipping cluster details discovery." -Level "INFO"
            return @()
        }


        foreach ($adClusterObj in $clusterADObjects) {
            $clusterName = $adClusterObj.Name -replace '\$$', '' # Remove trailing $ if present
            Write-MandALog "Querying details for potential cluster: $clusterName" -Level "DEBUG"
            try {
                $clusterInfo = Get-Cluster -Name $clusterName -ErrorAction Stop
                if ($null -eq $clusterInfo) { Write-MandALog "Get-Cluster for $clusterName returned null." -Level "WARN"; continue }

                $clusterNodes = Get-ClusterNode -Cluster $clusterInfo -ErrorAction SilentlyContinue
                $fileServerResources = Get-ClusterResource -Cluster $clusterInfo -ErrorAction SilentlyContinue | 
                                         Where-Object { $_.ResourceType -like "*File Server*" }
                
                $fsClustersResult.Add([PSCustomObject]@{
                    ClusterName             = $clusterInfo.Name
                    Domain                  = $clusterInfo.Domain
                    Description             = $clusterInfo.Description
                    NodeCount               = $clusterNodes.Count
                    Nodes                   = ($clusterNodes.Name -join "; ")
                    FileServerResourceCount = $fileServerResources.Count
                    FileServerResources     = ($fileServerResources.Name -join "; ")
                    ClusterQuorumType       = (Get-ClusterQuorum -Cluster $clusterInfo -ErrorAction SilentlyContinue).QuorumType.ToString()
                    SharedVolumeCount       = (Get-ClusterSharedVolume -Cluster $clusterInfo -ErrorAction SilentlyContinue).Count
                    AD_DistinguishedName    = $adClusterObj.DistinguishedName
                    AD_WhenCreated          = $adClusterObj.whenCreated
                })
            } catch { Write-MandALog "Error querying cluster '$clusterName' using FailoverClusters module: $($_.Exception.Message)" -Level "WARN" }
        }
        Write-MandALog "Discovered details for $($fsClustersResult.Count) file server clusters." -Level "SUCCESS"
        Export-SuiteDataToCsv -DataToExport $fsClustersResult -FileNameWithoutExtension $outputFileName -Configuration $Configuration -SubFolder "Raw"
        return $fsClustersResult
    } catch {
        Write-MandALog "Error retrieving File Server Clusters: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export the main invoker function
Export-ModuleMember -Function Invoke-FileServerDiscovery
