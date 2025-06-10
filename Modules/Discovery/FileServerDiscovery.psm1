# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: FileServer
# Description: Discovers file servers, shares, DFS namespaces, permissions, 
#              storage information, shadow copies, and file server clusters.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Check multiple possible locations where auth might be passed
    
    # 1. Direct auth context injection by orchestrator
    if ($Configuration._AuthContext) { 
        return $Configuration._AuthContext 
    }
    
    # 2. Credentials property
    if ($Configuration._Credentials) { 
        return $Configuration._Credentials 
    }
    
    # 3. Within authentication section
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
    
    # 4. Direct properties at root level
    if ($Configuration.ClientId -and 
        $Configuration.ClientSecret -and 
        $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    
    # No credentials found
    return $null
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

# --- Main Discovery Function ---

function Invoke-FileServerDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-FileServerLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('FileServer')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true; ModuleName = 'FileServer'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); 
            Warnings     = [System.Collections.ArrayList]::new(); 
            Metadata     = @{};
            StartTime    = Get-Date; EndTime = $null; 
            ExecutionId  = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-FileServerLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-FileServerLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE MODULE-SPECIFIC CONFIGURATION
        # FileServer doesn't require cloud authentication or specific config like SharePoint

        # 4. AUTHENTICATE & CONNECT
        Write-FileServerLog -Level "INFO" -Message "FileServer discovery uses Windows integrated authentication" -Context $Context
        
        # For on-premises modules like FileServer, we don't need cloud authentication
        # The module will use the current Windows credentials for accessing servers

        # 5. PERFORM DISCOVERY
        Write-FileServerLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # 5.1 Get configuration
        $config = Get-FileServerConfig -Configuration $Configuration
        Write-FileServerLog -Message "Configuration loaded: Target servers=$($config.TargetServers.Count), DFS=$($config.DiscoverDFS)" -Level "INFO" -Context $Context

        # 5.2 Discover File Servers
        try {
            Write-FileServerLog -Message "Discovering file servers..." -Level "INFO" -Context $Context
            $fileServers = Get-FileServersEnhanced -Configuration $config -Context $Context
            Write-FileServerLog -Message "Discovered $($fileServers.Count) file servers" -Level "SUCCESS" -Context $Context
            
            if ($fileServers.Count -gt 0) {
                Export-DiscoveryData -Data $fileServers -OutputPath $outputPath -FileName "FileServers.csv" -Context $Context
                $null = $allDiscoveredData.AddRange($fileServers)
            }
        } catch {
            $result.AddWarning("Failed to discover file servers: $($_.Exception.Message)", @{Section="FileServers"})
            Write-FileServerLog -Message "File server discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        }
        
        # 5.3 Discover File Shares
        if ($fileServers -and $fileServers.Count -gt 0) {
            try {
                Write-FileServerLog -Message "Discovering file shares..." -Level "INFO" -Context $Context
                $fileShares = Get-FileSharesEnhanced -ServerList $fileServers -Configuration $config -Context $Context
                Write-FileServerLog -Message "Discovered $($fileShares.Count) file shares" -Level "SUCCESS" -Context $Context
                
                if ($fileShares.Count -gt 0) {
                    Export-DiscoveryData -Data $fileShares -OutputPath $outputPath -FileName "FileShares.csv" -Context $Context
                    $null = $allDiscoveredData.AddRange($fileShares)
                }
            } catch {
                $result.AddWarning("Failed to discover file shares: $($_.Exception.Message)", @{Section="FileShares"})
                Write-FileServerLog -Message "File share discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }

        # 5.4 Discover DFS Namespaces
        if ($config.DiscoverDFS) {
            try {
                Write-FileServerLog -Message "Discovering DFS namespaces..." -Level "INFO" -Context $Context
                $dfsNamespaces = Get-DFSNamespacesEnhanced -Configuration $config -Context $Context
                Write-FileServerLog -Message "Discovered $($dfsNamespaces.Count) DFS namespaces" -Level "SUCCESS" -Context $Context
                
                if ($dfsNamespaces.Count -gt 0) {
                    Export-DiscoveryData -Data $dfsNamespaces -OutputPath $outputPath -FileName "DFSNamespaces.csv" -Context $Context
                    $null = $allDiscoveredData.AddRange($dfsNamespaces)
                    
                    # 5.5 Discover DFS Folders
                    try {
                        Write-FileServerLog -Message "Discovering DFS folders..." -Level "INFO" -Context $Context
                        $dfsFolders = Get-DFSFoldersEnhanced -DfsNamespaces $dfsNamespaces -Configuration $config -Context $Context
                        Write-FileServerLog -Message "Discovered $($dfsFolders.Count) DFS folders" -Level "SUCCESS" -Context $Context
                        
                        if ($dfsFolders.Count -gt 0) {
                            Export-DiscoveryData -Data $dfsFolders -OutputPath $outputPath -FileName "DFSFolders.csv" -Context $Context
                            $null = $allDiscoveredData.AddRange($dfsFolders)
                        }
                    } catch {
                        $result.AddWarning("Failed to discover DFS folders: $($_.Exception.Message)", @{Section="DFSFolders"})
                        Write-FileServerLog -Message "DFS folder discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
                    }
                }
            } catch {
                $result.AddWarning("Failed to discover DFS namespaces: $($_.Exception.Message)", @{Section="DFSNamespaces"})
                Write-FileServerLog -Message "DFS namespace discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }

        # 5.6 Storage Analysis
        if ($config.DiscoverStorageAnalysis -and $fileServers -and $fileServers.Count -gt 0) {
            try {
                Write-FileServerLog -Message "Performing storage analysis..." -Level "INFO" -Context $Context
                $storageAnalysis = Get-StorageAnalysisEnhanced -ServerList $fileServers -Configuration $config -Context $Context
                Write-FileServerLog -Message "Analyzed storage for $($storageAnalysis.Count) volumes" -Level "SUCCESS" -Context $Context
                
                if ($storageAnalysis.Count -gt 0) {
                    Export-DiscoveryData -Data $storageAnalysis -OutputPath $outputPath -FileName "StorageAnalysis.csv" -Context $Context
                    $null = $allDiscoveredData.AddRange($storageAnalysis)
                }
            } catch {
                $result.AddWarning("Failed to perform storage analysis: $($_.Exception.Message)", @{Section="StorageAnalysis"})
                Write-FileServerLog -Message "Storage analysis failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }

        # 5.7 Shadow Copy Discovery
        if ($config.DiscoverShadowCopies -and $fileServers -and $fileServers.Count -gt 0) {
            try {
                Write-FileServerLog -Message "Discovering shadow copies..." -Level "INFO" -Context $Context
                $shadowCopies = Get-ShadowCopyEnhanced -ServerList $fileServers -Configuration $config -Context $Context
                Write-FileServerLog -Message "Discovered shadow copy configurations for $($shadowCopies.Count) volumes" -Level "SUCCESS" -Context $Context
                
                if ($shadowCopies.Count -gt 0) {
                    Export-DiscoveryData -Data $shadowCopies -OutputPath $outputPath -FileName "ShadowCopies.csv" -Context $Context
                    $null = $allDiscoveredData.AddRange($shadowCopies)
                }
            } catch {
                $result.AddWarning("Failed to discover shadow copies: $($_.Exception.Message)", @{Section="ShadowCopies"})
                Write-FileServerLog -Message "Shadow copy discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }

        # 5.8 File Server Clustering
        if ($config.DiscoverClusters) {
            try {
                Write-FileServerLog -Message "Discovering file server clusters..." -Level "INFO" -Context $Context
                $fileServerClusters = Get-FileServerClustersEnhanced -Configuration $config -Context $Context
                Write-FileServerLog -Message "Discovered $($fileServerClusters.Count) file server clusters" -Level "SUCCESS" -Context $Context
                
                if ($fileServerClusters.Count -gt 0) {
                    Export-DiscoveryData -Data $fileServerClusters -OutputPath $outputPath -FileName "FileServerClusters.csv" -Context $Context
                    $null = $allDiscoveredData.AddRange($fileServerClusters)
                }
            } catch {
                $result.AddWarning("Failed to discover file server clusters: $($_.Exception.Message)", @{Section="FileServerClusters"})
                Write-FileServerLog -Message "File server cluster discovery failed: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            }
        }

        # 6. FINALIZE METADATA
        # CRITICAL FIX: Ensure RecordCount property exists and is set correctly
        if ($result -is [hashtable]) {
            # For hashtable, ensure RecordCount key exists and is set
            $result.RecordCount = $allDiscoveredData.Count
            $result['RecordCount'] = $allDiscoveredData.Count  # Ensure both access methods work
        } else {
            # For DiscoveryResult object, set the property directly
            $result.RecordCount = $allDiscoveredData.Count
        }
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["FileServersFound"] = if ($fileServers) { $fileServers.Count } else { 0 }
        $result.Metadata["FileSharesFound"] = if ($fileShares) { $fileShares.Count } else { 0 }
        $result.Metadata["DFSNamespacesFound"] = if ($dfsNamespaces) { $dfsNamespaces.Count } else { 0 }

    } catch {
        # Top-level error handler
        Write-FileServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-FileServerLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # No service connections to disconnect for FileServer
        
        $stopwatch.Stop()
        $result.Complete()
        Write-FileServerLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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

function Export-DiscoveryData {
    param(
        [array]$Data,
        [string]$OutputPath,
        [string]$FileName,
        $Context
    )
    
    if ($Data.Count -eq 0) {
        return
    }
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $Data | ForEach-Object {
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "FileServer" -Force
    }
    
    $filePath = Join-Path $OutputPath $FileName
    $Data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
    
    Write-FileServerLog -Message "Exported $($Data.Count) records to $FileName" -Level "SUCCESS" -Context $Context
}

function Get-FileServerConfig {
    param([hashtable]$Configuration)
    
    # Extract and validate configuration with defaults
    $config = @{
        TargetServers = @()
        ExcludedServers = @()
        UseSmbShareForEnumeration = $true
        TimeoutPerServerRemoteCommandSeconds = 120
        CollectShareDetailsLevel = "Basic"
        TimeoutPerShareAclSeconds = 60
        TimeoutPerShareSizeSeconds = 300
        MaxSharePathDepthForSize = 2
        ExcludedShareNames = @("ADMIN$", "IPC$", "PRINT$", "FAX$", "SYSVOL", "NETLOGON", "C$", "D$", "E$")
        DiscoverDFS = $true
        DiscoverStorageAnalysis = $true
        DiscoverShadowCopies = $true
        DiscoverClusters = $true
        SkipShareSizeCalculationForPathDepthExceeding = 10
        MaxConcurrentServers = 5
        MaxSharesPerBatch = 50
        EnableDetailedPermissions = $false
    }
    
    # Override with actual config if present
    if ($Configuration.discovery -and $Configuration.discovery.fileServer) {
        $fileConfig = $Configuration.discovery.fileServer
        foreach ($key in $config.Keys) {
            $configKey = $key.Substring(0,1).ToLower() + $key.Substring(1)
            if ($fileConfig.ContainsKey($configKey)) {
                $config[$key] = $fileConfig[$configKey]
            }
        }
    }
    
    return $config
}

function Get-FileServersEnhanced {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $fileServers = [System.Collections.ArrayList]::new()
    $progressCount = 0
    
    try {
        # Import required module
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            throw "ActiveDirectory module is required but not available"
        }
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Get target servers
        if ($Configuration.TargetServers -and $Configuration.TargetServers.Count -gt 0) {
            Write-FileServerLog -Message "Using configured target server list: $($Configuration.TargetServers.Count) servers" -Level "INFO" -Context $Context
            
            foreach ($serverName in $Configuration.TargetServers) {
                $progressCount++
                if ($progressCount % 10 -eq 0) {
                    Write-Progress -Activity "Discovering File Servers" -Status "Processing server $progressCount of $($Configuration.TargetServers.Count)" -PercentComplete (($progressCount / $Configuration.TargetServers.Count) * 100)
                }
                
                try {
                    $serverAD = Get-ADComputer -Identity $serverName -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
                    $serverInfo = [PSCustomObject]@{
                        ServerName = if ($serverAD.DNSHostName) { $serverAD.DNSHostName } else { $serverAD.Name }
                        NetBIOSName = $serverAD.Name
                        OperatingSystem = $serverAD.OperatingSystem
                        Description = $serverAD.Description
                        IsFileServer = $true
                        ShareCount = 0
                        Features = "Configured Target"
                        DiscoveryStatus = "Configured"
                        LastDiscovered = Get-Date
                        _DataType = 'FileServers'
                    }
                    $null = $fileServers.Add($serverInfo)
                } catch {
                    Write-FileServerLog -Message "Could not find server '$serverName' in AD: $($_.Exception.Message)" -Level "WARN" -Context $Context
                }
            }
        } else {
            Write-FileServerLog -Message "Discovering servers from Active Directory..." -Level "INFO" -Context $Context
            
            $adServers = Get-ADComputer -Filter { 
                OperatingSystem -like "*Server*" -and 
                Enabled -eq $true 
            } -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
            
            Write-FileServerLog -Message "Found $($adServers.Count) potential file servers" -Level "INFO" -Context $Context
            
            # Filter and process servers in batches
            $excludedServers = [System.Collections.Generic.HashSet[string]]::new($Configuration.ExcludedServers, [System.StringComparer]::OrdinalIgnoreCase)
            $totalServers = $adServers.Count
            $processedCount = 0
            
            foreach ($server in $adServers) {
                $processedCount++
                if ($processedCount % 50 -eq 0) {
                    Write-Progress -Activity "Discovering File Servers" -Status "Processing server $processedCount of $totalServers" -PercentComplete (($processedCount / $totalServers) * 100)
                    
                    # Force garbage collection every 50 servers
                    [System.GC]::Collect()
                    [System.GC]::WaitForPendingFinalizers()
                    [System.GC]::Collect()
                }
                
                $serverName = if ($server.DNSHostName) { $server.DNSHostName } else { $server.Name }
                
                # Check if excluded
                if ($excludedServers.Contains($serverName) -or $excludedServers.Contains($server.Name)) {
                    continue
                }
                
                # Test basic connectivity
                if (-not (Test-Connection -ComputerName $serverName -Count 1 -Quiet -ErrorAction SilentlyContinue)) {
                    continue
                }
                
                $serverInfo = [PSCustomObject]@{
                    ServerName = $serverName
                    NetBIOSName = $server.Name
                    OperatingSystem = $server.OperatingSystem
                    Description = $server.Description
                    IsFileServer = $true
                    ShareCount = 0
                    Features = "Auto-discovered"
                    DiscoveryStatus = "Success"
                    LastDiscovered = Get-Date
                    _DataType = 'FileServers'
                }
                
                $null = $fileServers.Add($serverInfo)
            }
        }
        
        Write-Progress -Activity "Discovering File Servers" -Completed
        Write-FileServerLog -Message "Identified $($fileServers.Count) file servers" -Level "SUCCESS" -Context $Context
        return $fileServers
        
    } catch {
        Write-Progress -Activity "Discovering File Servers" -Completed
        Write-FileServerLog -Message "Error discovering file servers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-FileSharesEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        $Context
    )
    
    $fileShares = [System.Collections.ArrayList]::new()
    $totalServers = $ServerList.Count
    $processedServers = 0
    
    try {
        Write-FileServerLog -Message "Discovering shares on $totalServers servers..." -Level "INFO" -Context $Context
        
        foreach ($server in $ServerList) {
            $processedServers++
            $serverName = $server.ServerName
            
            Write-Progress -Activity "Discovering File Shares" -Status "Processing $serverName ($processedServers of $totalServers)" -PercentComplete (($processedServers / $totalServers) * 100)
            
            try {
                # Get shares using WMI with timeout
                $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -OperationTimeoutSec $Configuration.TimeoutPerServerRemoteCommandSeconds -ErrorAction Stop |
                         Where-Object { 
                             $_.Type -eq 0 -and 
                             $_.Name -notin $Configuration.ExcludedShareNames -and
                             $_.Name -notmatch '^\w\$$'
                         }
                
                foreach ($share in $shares) {
                    $shareInfo = [PSCustomObject]@{
                        ServerName = $serverName
                        ShareName = $share.Name
                        SharePath = $share.Path
                        UNCPath = "\\$serverName\$($share.Name)"
                        Description = $share.Description
                        ShareType = "FileSystemDirectory"
                        ShareState = "Online"
                        DiscoveredAt = Get-Date
                        _DataType = 'FileShares'
                    }
                    
                    $null = $fileShares.Add($shareInfo)
                }
                
                # Update share count on server object
                $server.ShareCount = $shares.Count
                
            } catch {
                Write-FileServerLog -Message "Error processing shares on $serverName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
            
            # Memory management
            if ($processedServers % 20 -eq 0) {
                [System.GC]::Collect()
                [System.GC]::WaitForPendingFinalizers()
                [System.GC]::Collect()
            }
        }
        
        Write-Progress -Activity "Discovering File Shares" -Completed
        Write-FileServerLog -Message "Discovered $($fileShares.Count) file shares" -Level "SUCCESS" -Context $Context
        return $fileShares
        
    } catch {
        Write-Progress -Activity "Discovering File Shares" -Completed
        Write-FileServerLog -Message "Error discovering file shares: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-DFSNamespacesEnhanced {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $dfsNamespaces = [System.Collections.ArrayList]::new()
    
    try {
        Write-FileServerLog -Message "Discovering DFS Namespaces..." -Level "INFO" -Context $Context
        
        # Check if DFS module is available
        if (-not (Get-Module -ListAvailable -Name DfsMgmt)) {
            Write-FileServerLog -Message "DfsMgmt module not available. Install RSAT DFS Management Tools." -Level "WARN" -Context $Context
            return $dfsNamespaces
        }
        
        Import-Module DfsMgmt -ErrorAction Stop
        
        # Get DFS roots
        $dfsRoots = Get-DfsnRoot -ErrorAction SilentlyContinue
        
        if ($null -eq $dfsRoots -or $dfsRoots.Count -eq 0) {
            Write-FileServerLog -Message "No DFS namespaces found" -Level "INFO" -Context $Context
            return $dfsNamespaces
        }
        
        $totalRoots = @($dfsRoots).Count
        $processedRoots = 0
        
        foreach ($root in $dfsRoots) {
            $processedRoots++
            Write-Progress -Activity "Discovering DFS Namespaces" -Status "Processing $($root.Path)" -PercentComplete (($processedRoots / $totalRoots) * 100)
            
            try {
                $namespaceInfo = [PSCustomObject]@{
                    NamespacePath = $root.Path
                    NamespaceType = $root.Type.ToString()
                    State = $root.State.ToString()
                    Description = $root.Description
                    TimeToLiveSecs = if ($root.TimeToLive) { $root.TimeToLive.TotalSeconds } else { 300 }
                    DiscoveredAt = Get-Date
                    _DataType = 'DFSNamespaces'
                }
                
                $null = $dfsNamespaces.Add($namespaceInfo)
                
            } catch {
                Write-FileServerLog -Message "Error processing DFS namespace $($root.Path): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Discovering DFS Namespaces" -Completed
        Write-FileServerLog -Message "Found $($dfsNamespaces.Count) DFS namespaces" -Level "SUCCESS" -Context $Context
        return $dfsNamespaces
        
    } catch {
        Write-Progress -Activity "Discovering DFS Namespaces" -Completed
        Write-FileServerLog -Message "Error discovering DFS namespaces: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-DFSFoldersEnhanced {
    param(
        [array]$DfsNamespaces,
        [hashtable]$Configuration,
        $Context
    )
    
    $dfsFolders = [System.Collections.ArrayList]::new()
    
    try {
        Write-FileServerLog -Message "Discovering DFS folders for $($DfsNamespaces.Count) namespaces..." -Level "INFO" -Context $Context
        
        $totalNamespaces = $DfsNamespaces.Count
        $processedNamespaces = 0
        
        foreach ($namespace in $DfsNamespaces) {
            $processedNamespaces++
            $rootPath = $namespace.NamespacePath
            
            Write-Progress -Activity "Discovering DFS Folders" -Status "Processing namespace $rootPath" -PercentComplete (($processedNamespaces / $totalNamespaces) * 100)
            
            try {
                # Get all folders in namespace
                $folders = Get-DfsnFolder -Path "$rootPath\*" -ErrorAction SilentlyContinue
                
                if ($null -eq $folders) {
                    continue
                }
                
                foreach ($folder in $folders) {
                    try {
                        $folderInfo = [PSCustomObject]@{
                            NamespacePath = $rootPath
                            FolderPath = $folder.Path
                            FolderName = Split-Path $folder.Path -Leaf
                            State = $folder.State.ToString()
                            Description = $folder.Description
                            DiscoveredAt = Get-Date
                            _DataType = 'DFSFolders'
                        }
                        
                        $null = $dfsFolders.Add($folderInfo)
                    } catch {
                        Write-FileServerLog -Message "Error processing DFS folder $($folder.Path): $($_.Exception.Message)" -Level "WARN" -Context $Context
                    }
                }
                
            } catch {
                Write-FileServerLog -Message "Error processing namespace '$rootPath': $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Discovering DFS Folders" -Completed
        Write-FileServerLog -Message "Discovered $($dfsFolders.Count) DFS folders" -Level "SUCCESS" -Context $Context
        return $dfsFolders
        
    } catch {
        Write-Progress -Activity "Discovering DFS Folders" -Completed
        Write-FileServerLog -Message "Error discovering DFS folders: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-StorageAnalysisEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        $Context
    )
    
    $storageAnalysis = [System.Collections.ArrayList]::new()
    
    try {
        Write-FileServerLog -Message "Analyzing storage on $($ServerList.Count) servers..." -Level "INFO" -Context $Context
        
        $totalServers = $ServerList.Count
        $processedServers = 0
        
        foreach ($server in $ServerList) {
            $processedServers++
            $serverName = $server.ServerName
            
            Write-Progress -Activity "Analyzing Storage" -Status "Processing $serverName" -PercentComplete (($processedServers / $totalServers) * 100)
            
            try {
                # Get disk information with timeout
                $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -OperationTimeoutSec $Configuration.TimeoutPerServerRemoteCommandSeconds -ErrorAction Stop
                
                foreach ($disk in $disks) {
                    $storageInfo = [PSCustomObject]@{
                        ServerName = $serverName
                        DriveLetter = $disk.DeviceID
                        VolumeName = $disk.VolumeName
                        FileSystem = $disk.FileSystem
                        TotalSizeGB = [Math]::Round($disk.Size / 1GB, 2)
                        UsedSpaceGB = [Math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2)
                        FreeSpaceGB = [Math]::Round($disk.FreeSpace / 1GB, 2)
                        PercentUsed = if ($disk.Size -gt 0) { [Math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1) } else { 0 }
                        PercentFree = if ($disk.Size -gt 0) { [Math]::Round(($disk.FreeSpace / $disk.Size) * 100, 1) } else { 0 }
                        HealthStatus = if ($disk.FreeSpace / $disk.Size -lt 0.1) { "Warning: Low disk space" } else { "Healthy" }
                        LastAnalyzed = Get-Date
                        _DataType = 'StorageAnalysis'
                    }
                    
                    $null = $storageAnalysis.Add($storageInfo)
                }
                
            } catch {
                Write-FileServerLog -Message "Error analyzing storage on $serverName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Analyzing Storage" -Completed
        Write-FileServerLog -Message "Completed storage analysis for $($storageAnalysis.Count) volumes" -Level "SUCCESS" -Context $Context
        return $storageAnalysis
        
    } catch {
        Write-Progress -Activity "Analyzing Storage" -Completed
        Write-FileServerLog -Message "Error performing storage analysis: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ShadowCopyEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        $Context
    )
    
    $shadowCopies = [System.Collections.ArrayList]::new()
    
    try {
        Write-FileServerLog -Message "Discovering shadow copies on $($ServerList.Count) servers..." -Level "INFO" -Context $Context
        
        $totalServers = $ServerList.Count
        $processedServers = 0
        
        foreach ($server in $ServerList) {
            $processedServers++
            $serverName = $server.ServerName
            
            Write-Progress -Activity "Discovering Shadow Copies" -Status "Processing $serverName" -PercentComplete (($processedServers / $totalServers) * 100)
            
            try {
                # Get shadow copies with timeout
                $shadows = Get-CimInstance -ClassName Win32_ShadowCopy -ComputerName $serverName -OperationTimeoutSec $Configuration.TimeoutPerServerRemoteCommandSeconds -ErrorAction Stop
                
                if ($null -eq $shadows -or $shadows.Count -eq 0) {
                    continue
                }
                
                # Group by volume
                $volumeGroups = $shadows | Group-Object VolumeName
                
                foreach ($volumeGroup in $volumeGroups) {
                    $volumeName = $volumeGroup.Name
                    $volumeShadows = $volumeGroup.Group
                    
                    $shadowInfo = [PSCustomObject]@{
                        ServerName = $serverName
                        VolumeName = $volumeName
                        ShadowCopyCount = $volumeShadows.Count
                        OldestShadowDate = ($volumeShadows.InstallDate | Measure-Object -Minimum).Minimum
                        NewestShadowDate = ($volumeShadows.InstallDate | Measure-Object -Maximum).Maximum
                        LastAnalyzed = Get-Date
                        _DataType = 'ShadowCopies'
                    }
                    
                    $null = $shadowCopies.Add($shadowInfo)
                }
                
            } catch {
                Write-FileServerLog -Message "Error querying shadow copies on $serverName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Discovering Shadow Copies" -Completed
        Write-FileServerLog -Message "Discovered shadow copy configurations on $($shadowCopies.Count) volumes" -Level "SUCCESS" -Context $Context
        return $shadowCopies
        
    } catch {
        Write-Progress -Activity "Discovering Shadow Copies" -Completed
        Write-FileServerLog -Message "Error discovering shadow copies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-FileServerClustersEnhanced {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $clusters = [System.Collections.ArrayList]::new()
    
    try {
        Write-FileServerLog -Message "Discovering file server clusters..." -Level "INFO" -Context $Context
        
        # Check if FailoverClusters module is available
        if (-not (Get-Module -ListAvailable -Name FailoverClusters)) {
            Write-FileServerLog -Message "FailoverClusters module not available. Install RSAT Failover Clustering Tools." -Level "WARN" -Context $Context
            return $clusters
        }
        
        Import-Module FailoverClusters -ErrorAction Stop
        
        # Find clusters in AD
        $clusterComputers = Get-ADComputer -Filter { ServicePrincipalName -like "*MSClusterVirtualServer*" } -Properties ServicePrincipalName, Description -ErrorAction SilentlyContinue
        
        if ($null -eq $clusterComputers -or $clusterComputers.Count -eq 0) {
            Write-FileServerLog -Message "No clusters found in Active Directory" -Level "INFO" -Context $Context
            return $clusters
        }
        
        $totalClusters = @($clusterComputers).Count
        $processedClusters = 0
        
        foreach ($clusterAD in $clusterComputers) {
            $processedClusters++
            $clusterName = $clusterAD.Name
            
            Write-Progress -Activity "Discovering Clusters" -Status "Processing $clusterName" -PercentComplete (($processedClusters / $totalClusters) * 100)
            
            try {
                # Get cluster information
                $cluster = Get-Cluster -Name $clusterName -ErrorAction Stop
                
                if ($null -eq $cluster) {
                    continue
                }
                
                $clusterInfo = [PSCustomObject]@{
                    ClusterName = $cluster.Name
                    Domain = $cluster.Domain
                    Description = if ($clusterAD.Description) { $clusterAD.Description } else { "" }
                    ClusterFQDN = "$($cluster.Name).$($cluster.Domain)"
                    LastAnalyzed = Get-Date
                    _DataType = 'FileServerClusters'
                }
                
                $null = $clusters.Add($clusterInfo)
                
            } catch {
                Write-FileServerLog -Message "Error querying cluster '$clusterName': $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Discovering Clusters" -Completed
        Write-FileServerLog -Message "Discovered $($clusters.Count) file server clusters" -Level "SUCCESS" -Context $Context
        return $clusters
        
    } catch {
        Write-Progress -Activity "Discovering Clusters" -Completed
        Write-FileServerLog -Message "Error discovering file server clusters: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-FileServerDiscovery