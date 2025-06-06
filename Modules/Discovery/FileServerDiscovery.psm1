# -*- coding: utf-8-bom -*-
#Requires -Modules ActiveDirectory, CimCmdlets, SmbShare, DfsMgmt, FailoverClusters

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# DiscoveryResult class definition
# DiscoveryResult class is defined globally by the Orchestrator using Add-Type
# No local definition needed - the global C# class will be used

<#
.SYNOPSIS

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}
    Enhanced File Server and Storage Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers file servers, shares, DFS namespaces, permissions, storage information,
    shadow copies, and file server clusters with improved performance and reliability
.NOTES
    Author: M&A Discovery Suite
    Version: 2.0.0
    Last Modified: 2024-01-20
#>



$authModulePathFromGlobal = Join-Path $global:MandA.Paths.Authentication "DiscoveryModuleBase.psm1"
Import-Module $authModulePathFromGlobal -Force

# Module-specific variables
$script:PerformanceTracker = $null
$script:ServerCircuitBreakers = @{}
$script:CimSessions = @{}
$script:PSSessionPool = @{}

# Prerequisites validation function
function Test-FileServerDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context,
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    $prerequisites = @{
        IsValid = $true
        MissingRequirements = @()
        Warnings = @()
    }
    
    try {
        Write-ProgressStep "Validating File Server Discovery prerequisites..." -Status Progress
        
        # Check for required modules
        $requiredModules = @('ActiveDirectory', 'CimCmdlets', 'SmbShare')
        $optionalModules = @('DfsMgmt', 'FailoverClusters')
        
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.IsValid = $false
                $prerequisites.MissingRequirements += "Required module '$module' not available"
            }
        }
        
        foreach ($module in $optionalModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.Warnings += "Optional module '$module' not available - some features will be limited"
            }
        }
        
        # Check Active Directory connectivity
        try {
            $null = Get-ADDomain -ErrorAction Stop
        } catch {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Cannot connect to Active Directory: $($_.Exception.Message)"
        }
        
        # Validate credentials if provided
        if ($Credential) {
            $prerequisites.Warnings += "Using provided credentials for file server access"
        } else {
            $prerequisites.Warnings += "No credentials provided - using current user context"
        }
        
        Write-ProgressStep "Prerequisites validation completed" -Status Success
        
    } catch {
        $prerequisites.IsValid = $false
        $prerequisites.MissingRequirements += "Prerequisites validation failed: $($_.Exception.Message)"
        Write-ProgressStep "Prerequisites validation failed: $($_.Exception.Message)" -Status Error
    }
    
    return $prerequisites
}

# Enhanced main function with comprehensive error handling
function Invoke-FileServerDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context,
        
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new("FileServer")
    
    try {
        Write-ProgressStep "Starting File Server Discovery" -Status Progress
        
        # Validate prerequisites
        $prerequisites = Test-FileServerDiscoveryPrerequisites -Configuration $Configuration -Context $Context -Credential $Credential
        if (-not $prerequisites.IsValid) {
            throw "Prerequisites validation failed: $($prerequisites.MissingRequirements -join '; ')"
        }
        
        # Log warnings
        foreach ($warning in $prerequisites.Warnings) {
            Write-ProgressStep $warning -Status Warning
            $Context.ErrorCollector.AddWarning("FileServer", $warning)
        }
        
        # Initialize performance tracking
        $script:PerformanceTracker = [DiscoveryPerformanceTracker]::new()
        $config = Get-FileServerConfig -Configuration $Configuration
        $results = @{}
        
        # 1. Discover File Servers with error handling
        try {
            Write-ProgressStep "Discovering file servers..." -Status Progress
            $script:PerformanceTracker.StartOperation("FileServers")
            $results.FileServers = Get-FileServersWithErrorHandling -Configuration $config -Context $Context -Credential $Credential
            $script:PerformanceTracker.EndOperation("FileServers", $results.FileServers.Count)
            $result.Metadata.SectionsProcessed++
            
            if ($results.FileServers.Count -eq 0) {
                Write-ProgressStep "No file servers found. Skipping dependent discoveries." -Status Warning
                $Context.ErrorCollector.AddWarning("FileServer", "No file servers found")
            }
            
        } catch {
            $errorMsg = "Failed to discover file servers: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $results.FileServers = @()
        }
        
        # 2. Discover File Shares with error handling
        if ($results.FileServers.Count -gt 0) {
            try {
                Write-ProgressStep "Discovering file shares..." -Status Progress
                $script:PerformanceTracker.StartOperation("FileShares")
                $results.FileShares = Get-FileSharesWithErrorHandling -ServerList $results.FileServers -Configuration $config -Context $Context -Credential $Credential
                $script:PerformanceTracker.EndOperation("FileShares", $results.FileShares.Count)
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to discover file shares: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $results.FileShares = @()
            }
        }
        
        # 3. Discover DFS Namespaces with error handling
        if ($config.DiscoverDFS) {
            try {
                Write-ProgressStep "Discovering DFS namespaces..." -Status Progress
                $script:PerformanceTracker.StartOperation("DFSNamespaces")
                $results.DFSNamespaces = Get-DFSNamespacesWithErrorHandling -Configuration $config -Context $Context
                $script:PerformanceTracker.EndOperation("DFSNamespaces", $results.DFSNamespaces.Count)
                $result.Metadata.SectionsProcessed++
                
                # 4. Discover DFS Folders
                if ($results.DFSNamespaces.Count -gt 0) {
                    try {
                        Write-ProgressStep "Discovering DFS folders..." -Status Progress
                        $script:PerformanceTracker.StartOperation("DFSFolders")
                        $results.DFSFolders = Get-DFSFoldersWithErrorHandling -DfsNamespaces $results.DFSNamespaces -Configuration $config -Context $Context
                        $script:PerformanceTracker.EndOperation("DFSFolders", $results.DFSFolders.Count)
                        $result.Metadata.SectionsProcessed++
                        
                    } catch {
                        $errorMsg = "Failed to discover DFS folders: $($_.Exception.Message)"
                        Write-ProgressStep $errorMsg -Status Error
                        $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                        $result.Metadata.SectionErrors++
                        $results.DFSFolders = @()
                    }
                }
                
            } catch {
                $errorMsg = "Failed to discover DFS namespaces: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $results.DFSNamespaces = @()
            }
        }
        
        # 5. Storage Analysis with error handling
        if ($config.DiscoverStorageAnalysis -and $results.FileServers.Count -gt 0) {
            try {
                Write-ProgressStep "Performing storage analysis..." -Status Progress
                $script:PerformanceTracker.StartOperation("StorageAnalysis")
                $results.StorageAnalysis = Get-StorageAnalysisWithErrorHandling -ServerList $results.FileServers -Configuration $config -Context $Context -Credential $Credential
                $script:PerformanceTracker.EndOperation("StorageAnalysis", $results.StorageAnalysis.Count)
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to perform storage analysis: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $results.StorageAnalysis = @()
            }
        }
        
        # 6. Shadow Copy Discovery with error handling
        if ($config.DiscoverShadowCopies -and $results.FileServers.Count -gt 0) {
            try {
                Write-ProgressStep "Discovering shadow copies..." -Status Progress
                $script:PerformanceTracker.StartOperation("ShadowCopies")
                $results.ShadowCopies = Get-ShadowCopyWithErrorHandling -ServerList $results.FileServers -Configuration $config -Context $Context -Credential $Credential
                $script:PerformanceTracker.EndOperation("ShadowCopies", $results.ShadowCopies.Count)
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to discover shadow copies: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $results.ShadowCopies = @()
            }
        }
        
        # 7. File Server Clustering with error handling
        if ($config.DiscoverClusters) {
            try {
                Write-ProgressStep "Discovering file server clusters..." -Status Progress
                $script:PerformanceTracker.StartOperation("FileServerClusters")
                $results.FileServerClusters = Get-FileServerClustersWithErrorHandling -Configuration $config -Context $Context
                $script:PerformanceTracker.EndOperation("FileServerClusters", $results.FileServerClusters.Count)
                $result.Metadata.SectionsProcessed++
                
            } catch {
                $errorMsg = "Failed to discover file server clusters: $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("FileServer", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $results.FileServerClusters = @()
            }
        }
        
        # Update result
        $result.Data = Convert-ToFlattenedFileServerData -Results $results
        $result.Success = $true
        $result.Metadata.TotalSections = 7
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "File Server Discovery completed" -Status Success
        return $result
        
    } catch {
        $result.Success = $false
        $result.ErrorMessage = $_.Exception.Message
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "File Server Discovery failed: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("FileServer", "Discovery failed", $_.Exception)
        
        return $result
        
    } finally {
        # Cleanup resources
        Clear-FileServerResources
        Write-ProgressStep "File Server Discovery cleanup completed" -Status Info
    }
}

# Enhanced wrapper functions with retry logic
function Get-FileServersWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-FileServersEnhanced -Configuration $Configuration -Context $Context -Credential $Credential
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "File servers discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-FileSharesWithErrorHandling {
    param($ServerList, $Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-FileSharesEnhanced -ServerList $ServerList -Configuration $Configuration -Context $Context -Credential $Credential
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "File shares discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DFSNamespacesWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DFSNamespacesEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DFS namespaces discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DFSFoldersWithErrorHandling {
    param($DfsNamespaces, $Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DFSFoldersEnhanced -DfsNamespaces $DfsNamespaces -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DFS folders discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-StorageAnalysisWithErrorHandling {
    param($ServerList, $Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-StorageAnalysisEnhanced -ServerList $ServerList -Configuration $Configuration -Context $Context -Credential $Credential
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Storage analysis failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ShadowCopyWithErrorHandling {
    param($ServerList, $Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-ShadowCopyEnhanced -ServerList $ServerList -Configuration $Configuration -Context $Context -Credential $Credential
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Shadow copy discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-FileServerClustersWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-FileServerClustersEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "File server clusters discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
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
    if ($Configuration.discovery.fileServer) {
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
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    $fileServers = [System.Collections.Generic.List[PSObject]]::new()
    $processedServers = [System.Collections.Generic.HashSet[string]]::new()
    
    try {
        Write-ProgressStep "Starting file server discovery..." -Status Progress
        
        # Get target servers
        $targetServers = @()
        
        if ($Configuration.TargetServers -and $Configuration.TargetServers.Count -gt 0) {
            Write-ProgressStep "Using configured target server list: $($Configuration.TargetServers.Count) servers" -Status Info
            
            foreach ($serverName in $Configuration.TargetServers) {
                try {
                    $serverAD = Get-ADComputer -Identity $serverName -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
                    $targetServers += $serverAD
                } catch {
                    Write-ProgressStep "Could not find server '$serverName' in AD" -Status Warning
                }
            }
        } else {
            Write-ProgressStep "Discovering servers from Active Directory..." -Status Progress
            
            $targetServers = Get-ADComputer -Filter { 
                OperatingSystem -like "*Server*" -and 
                Enabled -eq $true 
            } -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
        }
        
        Write-ProgressStep "Found $($targetServers.Count) potential file servers" -Status Info
        
        # Filter excluded servers
        $excludedServers = [System.Collections.Generic.HashSet[string]]::new($Configuration.ExcludedServers, [System.StringComparer]::OrdinalIgnoreCase)
        
        # Process servers in batches with progress
        $serverBatches = Split-ArrayIntoBatches -Array $targetServers -BatchSize $Configuration.MaxConcurrentServers
        $totalServers = $targetServers.Count
        $processedCount = 0
        
        foreach ($batchIndex in 0..($serverBatches.Count - 1)) {
            $batch = $serverBatches[$batchIndex]
            
            Write-ProgressStep "Processing batch $($batchIndex + 1) of $($serverBatches.Count)" -Status Progress
            
            # Process batch in parallel
            $batchResults = $batch | ForEach-Object -Parallel {
                $server = $_
                $config = $using:Configuration
                $context = $using:Context
                $cred = $using:Credential
                $excluded = $using:excludedServers
                
                $serverName = if ($server.DNSHostName) { $server.DNSHostName } else { $server.Name }
                
                # Check if excluded
                if ($excluded.Contains($serverName) -or $excluded.Contains($server.Name)) {
                    return $null
                }
                
                # Test connectivity
                if (-not (Test-ServerConnectivity -ServerName $serverName -Timeout 5)) {
                    return $null
                }
                
                # Create result object
                $serverInfo = @{
                    ServerName = $serverName
                    NetBIOSName = $server.Name
                    OperatingSystem = $server.OperatingSystem
                    Description = $server.Description
                    IsFileServer = $false
                    ShareCount = 0
                    Features = @()
                    TotalDiskSpaceGB = 0
                    FreeDiskSpaceGB = 0
                    UsedDiskSpaceGB = 0
                    PercentUsed = 0
                    LastDiscovered = Get-Date
                    DiscoveryStatus = "Unknown"
                    _DataType = 'FileServers'
                }
                
                try {
                    # Check for file server features
                    $features = Invoke-Command -ComputerName $serverName -Credential $cred -ScriptBlock {
                        Get-WindowsFeature -Name FS-FileServer, FS-DFS-Namespace, FS-DFS-Replication, FS-Resource-Manager |
                        Where-Object { $_.InstallState -eq "Installed" } |
                        Select-Object Name, DisplayName
                    } -ErrorAction Stop
                    
                    if ($features) {
                        $serverInfo.Features = ($features.Name -join '; ')
                        $serverInfo.IsFileServer = $true
                    }
                    
                    # Get share count
                    $shares = $null
                    if ($config.UseSmbShareForEnumeration) {
                        $shares = Get-SmbShare -CimSession $serverName -ErrorAction SilentlyContinue |
                                 Where-Object { $_.ShareType -eq 'FileSystemDirectory' -and $_.Name -notin $config.ExcludedShareNames }
                    } else {
                        $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -ErrorAction SilentlyContinue |
                                 Where-Object { $_.Type -eq 0 -and $_.Name -notin $config.ExcludedShareNames }
                    }
                    
                    if ($shares) {
                        $serverInfo.ShareCount = @($shares).Count
                        $serverInfo.IsFileServer = $true
                    }
                    
                    # Get disk information
                    $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -ErrorAction SilentlyContinue
                    if ($disks) {
                        $totalSize = ($disks | Measure-Object -Property Size -Sum).Sum
                        $freeSpace = ($disks | Measure-Object -Property FreeSpace -Sum).Sum
                        
                        if ($totalSize -gt 0) {
                            $serverInfo.TotalDiskSpaceGB = [Math]::Round($totalSize / 1GB, 2)
                            $serverInfo.FreeDiskSpaceGB = [Math]::Round($freeSpace / 1GB, 2)
                            $serverInfo.UsedDiskSpaceGB = [Math]::Round(($totalSize - $freeSpace) / 1GB, 2)
                            $serverInfo.PercentUsed = [Math]::Round((($totalSize - $freeSpace) / $totalSize) * 100, 1)
                        }
                    }
                    
                    $serverInfo.DiscoveryStatus = "Success"
                    
                } catch {
                    $serverInfo.DiscoveryStatus = "Failed: $($_.Exception.Message)"
                }
                
                # Only return if it's likely a file server
                if ($serverInfo.IsFileServer -or $serverInfo.ShareCount -gt 0) {
                    return [PSCustomObject]$serverInfo
                }
                
                return $null
                
            } -ThrottleLimit $Configuration.MaxConcurrentServers
            
            # Add non-null results and update progress
            foreach ($result in $batchResults) {
                if ($null -ne $result -and -not $processedServers.Contains($result.ServerName)) {
                    $fileServers.Add($result)
                    $processedServers.Add($result.ServerName)
                    $processedCount++
                    
                    # Update progress
                    Show-ProgressBar -Current $processedCount -Total $totalServers `
                        -Activity "Discovered file server: $($result.ServerName)"
                }
            }
        }
        
        Write-Host "" # Clear progress bar line
        Write-ProgressStep "Identified $($fileServers.Count) file servers" -Status Success
        return $fileServers
        
    } catch {
        Write-ProgressStep "Error discovering file servers: $($_.Exception.Message)" -Status Error
        throw
    }
}

function Get-FileSharesEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    $fileShares = [System.Collections.Generic.List[PSObject]]::new()
    $totalServers = $ServerList.Count
    $currentServer = 0
    
    try {
        Write-ProgressStep "Discovering shares on $totalServers servers..." -Status Progress
        
        foreach ($server in $ServerList) {
            $currentServer++
            $serverName = $server.ServerName
            
            Show-ProgressBar -Current $currentServer -Total $totalServers `
                -Activity "Server: $serverName"
            
            # Get circuit breaker for this server
            if (-not $script:ServerCircuitBreakers.ContainsKey($serverName)) {
                $script:ServerCircuitBreakers[$serverName] = [CircuitBreaker]::new($serverName)
            }
            $circuitBreaker = $script:ServerCircuitBreakers[$serverName]
            
            if (-not $circuitBreaker.CanAttempt()) {
                Write-ProgressStep "Skipping $serverName - circuit breaker is open" -Status Warning
                continue
            }
            
            try {
                # Get shares
                $shares = Get-ServerShares -ServerName $serverName -Configuration $Configuration -Credential $Credential
                
                if ($null -eq $shares -or $shares.Count -eq 0) {
                    continue
                }
                
                Write-ProgressStep "Processing $($shares.Count) shares on $serverName" -Status Info
                
                # Process shares with sub-progress
                $shareCount = 0
                foreach ($share in $shares) {
                    $shareCount++
                    
                    # Update sub-progress every 5 shares
                    if ($shareCount % 5 -eq 0 -or $shareCount -eq $shares.Count) {
                        Write-Host "`r  Processing share $shareCount of $($shares.Count): $($share.Name)..." -NoNewline -ForegroundColor Gray
                    }
                    
                    $shareInfo = Get-ShareDetails -ServerName $serverName `
                                                 -Share $share `
                                                 -Configuration $Configuration `
                                                 -Context $Context `
                                                 -Credential $Credential
                    
                    if ($shareInfo) {
                        $fileShares.Add($shareInfo)
                    }
                }
                
                Write-Host "`r" + (" " * 80) + "`r" -NoNewline # Clear sub-progress line
                
                # Record success
                $circuitBreaker.RecordSuccess()
                
            } catch {
                $circuitBreaker.RecordFailure($_.Exception)
                Write-ProgressStep "Error processing shares on $serverName`: $($_.Exception.Message)" -Status Error
            }
        }
        
        Write-Host "" # Clear progress bar line
        Write-ProgressStep "Discovered $($fileShares.Count) file shares" -Status Success
        return $fileShares
        
    } catch {
        Write-ProgressStep "Error discovering file shares: $($_.Exception.Message)" -Status Error
        throw
    }
}



function Get-ServerShares {
    param(
        [string]$ServerName,
        [hashtable]$Configuration,
        [PSCredential]$Credential
    )
    
    $shares = @()
    
    try {
        if ($Configuration.UseSmbShareForEnumeration) {
            # Create CIM session
            $cimSession = Get-OrCreateCimSession -ComputerName $ServerName -Credential $Credential
            
            $shares = Get-SmbShare -CimSession $cimSession -ErrorAction Stop |
                     Where-Object { 
                         $_.ShareType -eq 'FileSystemDirectory' -and 
                         $_.Name -notin $Configuration.ExcludedShareNames -and
                         $_.Name -notmatch '^\w\$$'
                     }
        } else {
            # Use WMI
            $shares = Get-CimInstance -ClassName Win32_Share `
                                     -ComputerName $ServerName `
                                     -Credential $Credential `
                                     -ErrorAction Stop |
                     Where-Object { 
                         $_.Type -eq 0 -and 
                         $_.Name -notin $Configuration.ExcludedShareNames -and
                         $_.Name -notmatch '^\w\$$'
                     }
        }
        
        return $shares
        
    } catch {
        throw
    }
}

function Get-ShareDetails {
    param(
        [string]$ServerName,
        $Share,
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    $sharePath = $Share.Path
    $uncPath = "\\$ServerName\$($Share.Name)"
    
    $shareInfo = [PSCustomObject]@{
        ServerName = $ServerName
        ShareName = $Share.Name
        SharePath = $sharePath
        UNCPath = $uncPath
        Description = $Share.Description
        CurrentUsers = if ($Share.PSObject.Properties['CurrentUses']) { $Share.CurrentUses } else { 0 }
        ShareType = if ($Share.PSObject.Properties['ShareType']) { $Share.ShareType.ToString() } else { "FileSystemDirectory" }
        ShareState = if ($Share.PSObject.Properties['ShareState']) { $Share.ShareState } else { "Online" }
        CachingMode = if ($Share.PSObject.Properties['CachingMode']) { $Share.CachingMode } else { "None" }
        EncryptData = if ($Share.PSObject.Properties['EncryptData']) { $Share.EncryptData } else { $false }
        Permissions = $null
        SizeMB = $null
        FileCount = $null
        FolderCount = $null
        LastAccessed = $null
        CollectionStatus = "Pending"
        CollectionErrors = @()
        _DataType = 'FileShares'
    }
    
    # Collect details based on level
    if ($Configuration.CollectShareDetailsLevel -ne "None") {
        # Get permissions
        if ($Configuration.CollectShareDetailsLevel -in @("Basic", "Full")) {
            try {
                $shareInfo.Permissions = Get-SharePermissions -UNCPath $uncPath `
                                                             -ServerName $ServerName `
                                                             -ShareName $Share.Name `
                                                             -Timeout $Configuration.TimeoutPerShareAclSeconds `
                                                             -Credential $Credential `
                                                             -Context $Context
            } catch {
                $shareInfo.CollectionErrors += "ACL: $($_.Exception.Message)"
                Write-MandALog "Failed to get ACLs for $uncPath`: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
            }
        }
        
        # Get size and file count (Full only)
        if ($Configuration.CollectShareDetailsLevel -eq "Full") {
            try {
                $sizeInfo = Get-ShareSize -UNCPath $uncPath `
                                        -ServerName $ServerName `
                                        -LocalPath $sharePath `
                                        -Configuration $Configuration `
                                        -Credential $Credential `
                                        -Context $Context
                
                if ($sizeInfo) {
                    $shareInfo.SizeMB = $sizeInfo.SizeMB
                    $shareInfo.FileCount = $sizeInfo.FileCount
                    $shareInfo.FolderCount = $sizeInfo.FolderCount
                    $shareInfo.LastAccessed = $sizeInfo.LastAccessed
                }
            } catch {
                $shareInfo.CollectionErrors += "Size: $($_.Exception.Message)"
                Write-MandALog "Failed to get size for $uncPath`: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
            }
        }
    }
    
    # Set final status
    if ($shareInfo.CollectionErrors.Count -eq 0) {
        $shareInfo.CollectionStatus = "Success"
    } else {
        $shareInfo.CollectionStatus = "PartialSuccess"
        $shareInfo.CollectionErrors = $shareInfo.CollectionErrors -join "; "
    }
    
    return $shareInfo
}

function Get-SharePermissions {
    param(
        [string]$UNCPath,
        [string]$ServerName,
        [string]$ShareName,
        [int]$Timeout,
        [PSCredential]$Credential,
        [MandAContext]$Context
    )
    
    $job = Start-Job -ScriptBlock {
        param($Path, $Server, $Share, $Cred)
        
        try {
            # Get NTFS permissions
            $acl = Get-Acl -Path $Path -ErrorAction Stop
            $ntfsPerms = $acl.Access | ForEach-Object {
                [PSCustomObject]@{
                    Identity = $_.IdentityReference.ToString()
                    Rights = $_.FileSystemRights.ToString()
                    Type = $_.AccessControlType.ToString()
                    Inherited = $_.IsInherited
                }
            }
            
            # Get Share permissions
            $sharePerms = @()
            if ($Cred) {
                $sharePerms = Invoke-Command -ComputerName $Server -Credential $Cred -ScriptBlock {
                    param($ShareName)
                    Get-SmbShareAccess -Name $ShareName -ErrorAction SilentlyContinue
                } -ArgumentList $Share -ErrorAction SilentlyContinue
            } else {
                $sharePerms = Get-SmbShareAccess -Name $Share -CimSession $Server -ErrorAction SilentlyContinue
            }
            
            return @{
                NTFS = $ntfsPerms
                Share = $sharePerms
            }
        } catch {
            throw
        }
    } -ArgumentList $UNCPath, $ServerName, $ShareName, $Credential
    
    $completed = Wait-Job -Job $job -Timeout $Timeout
    
    if ($completed) {
        $result = Receive-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force
        
        if ($result) {
            # Format permissions
            $formatted = @{
                NTFSPermissions = ($result.NTFS | ForEach-Object { "$($_.Identity):$($_.Rights)" }) -join "; "
                SharePermissions = ($result.Share | ForEach-Object { "$($_.AccountName):$($_.AccessRight)" }) -join "; "
            }
            
            return ($formatted | ConvertTo-Json -Compress)
        }
    } else {
        Stop-Job -Job $job -Force
        Remove-Job -Job $job -Force
        throw "Timeout getting permissions after $Timeout seconds"
    }
    
    return $null
}

function Get-ShareSize {
    param(
        [string]$UNCPath,
        [string]$ServerName,
        [string]$LocalPath,
        [hashtable]$Configuration,
        [PSCredential]$Credential,
        [MandAContext]$Context
    )
    
    # Check path depth
    $pathDepth = ($LocalPath -split '[\\/]').Count
    if ($pathDepth -gt $Configuration.SkipShareSizeCalculationForPathDepthExceeding) {
        Write-MandALog "Skipping size calculation for $UNCPath - path depth exceeds threshold" -Level "DEBUG" -Context $Context
        return @{
            SizeMB = -1
            FileCount = -1
            FolderCount = -1
            LastAccessed = $null
            SkipReason = "PathDepthExceeded"
        }
    }
    
    $job = Start-Job -ScriptBlock {
        param($Server, $Path, $MaxDepth, $Cred)
        
        try {
            $result = Invoke-Command -ComputerName $Server -Credential $Cred -ScriptBlock {
                param($LocalPath, $Depth)
                
                $stats = @{
                    FileCount = 0
                    FolderCount = 0
                    TotalSize = 0
                    LastAccessed = $null
                }
                
                # Use robocopy for fast enumeration
                $robocopyArgs = @($LocalPath, "NULL", "/L", "/S", "/NJH", "/BYTES", "/FP", "/NC", "/NDL", "/TS", "/XJ", "/R:0", "/W:0")
                if ($Depth -gt 0) {
                    $robocopyArgs += "/LEV:$Depth"
                }
                
                $robocopyOutput = & robocopy @robocopyArgs 2>$null
                
                foreach ($line in $robocopyOutput) {
                    if ($line -match '^\s*(\d+)\s+(.+)') {
                        $size = [int64]$matches[1]
                        $stats.TotalSize += $size
                        $stats.FileCount++
                        
                        # Parse timestamp if available
                        if ($line -match '\d{4}/\d{2}/\d{2}\s+\d{2}:\d{2}:\d{2}') {
                            $timestamp = [DateTime]::ParseExact($matches[0], 'yyyy/MM/dd HH:mm:ss', $null)
                            if ($null -eq $stats.LastAccessed -or $timestamp -gt $stats.LastAccessed) {
                                $stats.LastAccessed = $timestamp
                            }
                        }
                    } elseif ($line -match '^\s*Dir\s+(\d+)') {
                        $stats.FolderCount = [int]$matches[1]
                    }
                }
                
                return $stats
            } -ArgumentList $Path, $MaxDepth
            
            return $result
        } catch {
            throw
        }
    } -ArgumentList $ServerName, $LocalPath, $Configuration.MaxSharePathDepthForSize, $Credential
    
    $completed = Wait-Job -Job $job -Timeout $Configuration.TimeoutPerShareSizeSeconds
    
    if ($completed) {
        $result = Receive-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force
        
        if ($result) {
            return @{
                SizeMB = [Math]::Round($result.TotalSize / 1MB, 2)
                FileCount = $result.FileCount
                FolderCount = $result.FolderCount
                LastAccessed = $result.LastAccessed
            }
        }
    } else {
        Stop-Job -Job $job -Force
        Remove-Job -Job $job -Force
        Write-MandALog "Timeout calculating size for $UNCPath after $($Configuration.TimeoutPerShareSizeSeconds) seconds" -Level "DEBUG" -Context $Context
        
        return @{
            SizeMB = -1
            FileCount = -1
            FolderCount = -1
            LastAccessed = $null
            SkipReason = "Timeout"
        }
    }
    
    return $null
}

function Get-DFSNamespacesEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $dfsNamespaces = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Discovering DFS Namespaces..." -Level "INFO" -Context $Context
        
        # Check if DFS module is available
        if (-not (Get-Module -ListAvailable -Name DfsMgmt)) {
            Write-MandALog "DfsMgmt module not available. Install RSAT DFS Management Tools." -Level "WARN" -Context $Context
            return $dfsNamespaces
        }
        
        Import-Module DfsMgmt -ErrorAction Stop
        
        # Get DFS roots
        $dfsRoots = Get-DfsnRoot -ErrorAction SilentlyContinue
        
        if ($null -eq $dfsRoots -or $dfsRoots.Count -eq 0) {
            Write-MandALog "No DFS namespaces found" -Level "INFO" -Context $Context
            return $dfsNamespaces
        }
        
        foreach ($root in $dfsRoots) {
            try {
                # Get namespace servers
                $namespaceServers = Get-DfsnRootTarget -Path $root.Path -ErrorAction SilentlyContinue
                
                # Get additional namespace info
                $namespaceInfo = [PSCustomObject]@{
                    NamespacePath = $root.Path
                    NamespaceType = $root.Type.ToString()
                    State = $root.State.ToString()
                    Description = $root.Description
                    TimeToLiveSecs = if ($root.TimeToLive) { $root.TimeToLive.TotalSeconds } else { 300 }
                    EnableSiteCosting = $root.EnableSiteCosting
                    EnableInsiteReferrals = $root.EnableInsiteReferrals
                    EnableAccessBasedEnumeration = $root.EnableAccessBasedEnumeration
                    EnableRootScalability = $root.EnableRootScalability
                    EnableTargetFailback = $root.EnableTargetFailback
                    NamespaceServers = ($namespaceServers.TargetPath -join "; ")
                    ServerCount = @($namespaceServers).Count
                    DiscoveredAt = Get-Date
                    _DataType = 'DFSNamespaces'
                }
                
                $dfsNamespaces.Add($namespaceInfo)
                
            } catch {
                Write-MandALog "Error processing DFS namespace $($root.Path): $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-MandALog "Found $($dfsNamespaces.Count) DFS namespaces" -Level "SUCCESS" -Context $Context
        return $dfsNamespaces
        
    } catch {
        Write-MandALog "Error discovering DFS namespaces: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-DFSFoldersEnhanced {
    param(
        [array]$DfsNamespaces,
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $dfsFolders = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Discovering DFS folders for $($DfsNamespaces.Count) namespaces..." -Level "INFO" -Context $Context
        
        foreach ($namespace in $DfsNamespaces) {
            $rootPath = $namespace.NamespacePath
            Write-MandALog "Processing DFS namespace: $rootPath" -Level "DEBUG" -Context $Context
            
            try {
                # Get all folders in namespace
                $folders = Get-DfsnFolder -Path "$rootPath\*" -ErrorAction SilentlyContinue
                
                if ($null -eq $folders) {
                    continue
                }
                
                # Process in batches for performance
                $folderBatches = Split-ArrayIntoBatches -Array $folders -BatchSize 50
                
                foreach ($batch in $folderBatches) {
                    $batchResults = $batch | ForEach-Object -Parallel {
                        $folder = $_
                        
                        try {
                            # Get folder targets
                            $targets = Get-DfsnFolderTarget -Path $folder.Path -ErrorAction SilentlyContinue
                            
                            [PSCustomObject]@{
                                NamespacePath = $using:rootPath
                                FolderPath = $folder.Path
                                FolderName = Split-Path $folder.Path -Leaf
                                State = $folder.State.ToString()
                                Description = $folder.Description
                                TimeToLiveSecs = if ($folder.TimeToLive) { $folder.TimeToLive.TotalSeconds } else { 300 }
                                EnableInsiteReferrals = $folder.EnableInsiteReferrals
                                EnableTargetFailback = $folder.EnableTargetFailback
                                TargetCount = @($targets).Count
                                Targets = ($targets.TargetPath -join "; ")
                                TargetStates = ($targets.State -join "; ")
                                PrimaryTarget = ($targets | Where-Object { $_.ReferralPriorityClass -eq 'GlobalHigh' } | Select-Object -First 1).TargetPath
                                DiscoveredAt = Get-Date
                                _DataType = 'DFSFolders'
                            }
                        } catch {
                            $null
                        }
                    } -ThrottleLimit 5
                    
                    foreach ($result in $batchResults) {
                        if ($null -ne $result) {
                            $dfsFolders.Add($result)
                        }
                    }
                }
                
            } catch {
                Write-MandALog "Error processing namespace '$rootPath': $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-MandALog "Discovered $($dfsFolders.Count) DFS folders" -Level "SUCCESS" -Context $Context
        return $dfsFolders
        
    } catch {
        Write-MandALog "Error discovering DFS folders: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-StorageAnalysisEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    $storageAnalysis = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Analyzing storage on $($ServerList.Count) servers..." -Level "INFO" -Context $Context
        
        $currentServer = 0
        foreach ($server in $ServerList) {
            $currentServer++
            $serverName = $server.ServerName
            
            Write-Progress -Activity "Analyzing Storage" `
                          -Status "Server $currentServer of $($ServerList.Count): $serverName" `
                          -PercentComplete (($currentServer / $ServerList.Count) * 100)
            
            try {
                # Get disk information
                $disks = Get-CimInstance -ClassName Win32_LogicalDisk `
                                        -ComputerName $serverName `
                                        -Filter "DriveType = 3" `
                                        -ErrorAction Stop
                
                # Get volume information for additional details
                $volumes = Get-CimInstance -ClassName Win32_Volume `
                                          -ComputerName $serverName `
                                          -Filter "DriveType = 3" `
                                          -ErrorAction SilentlyContinue
                
                foreach ($disk in $disks) {
                    # Find matching volume
                    $volume = $volumes | Where-Object { $_.DriveLetter -eq $disk.DeviceID }
                    
                    $storageInfo = [PSCustomObject]@{
                        ServerName = $serverName
                        DriveLetter = $disk.DeviceID
                        VolumeName = $disk.VolumeName
                        VolumeLabel = if ($volume) { $volume.Label } else { $disk.VolumeName }
                        FileSystem = $disk.FileSystem
                        TotalSizeGB = [Math]::Round($disk.Size / 1GB, 2)
                        UsedSpaceGB = [Math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2)
                        FreeSpaceGB = [Math]::Round($disk.FreeSpace / 1GB, 2)
                        PercentUsed = if ($disk.Size -gt 0) { [Math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1) } else { 0 }
                        PercentFree = if ($disk.Size -gt 0) { [Math]::Round(($disk.FreeSpace / $disk.Size) * 100, 1) } else { 0 }
                        BlockSize = if ($volume) { $volume.BlockSize } else { "Unknown" }
                        Compressed = if ($volume) { $volume.Compressed } else { $false }
                        Encrypted = if ($volume) { $volume.FileEncryptionStatus } else { "Unknown" }
                        IsBoot = if ($volume) { $volume.BootVolume } else { $false }
                        IsSystem = if ($volume) { $volume.SystemVolume } else { $false }
                        HealthStatus = "Healthy"  # Would need additional WMI queries for real health
                        LastAnalyzed = Get-Date
                        _DataType = 'StorageAnalysis'
                    }
                    
                    # Add health warnings
                    if ($storageInfo.PercentFree -lt 10) {
                        $storageInfo.HealthStatus = "Warning: Low disk space"
                    } elseif ($storageInfo.PercentFree -lt 5) {
                        $storageInfo.HealthStatus = "Critical: Very low disk space"
                    }
                    
                    $storageAnalysis.Add($storageInfo)
                }
                
            } catch {
                Write-MandALog "Error analyzing storage on $serverName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Analyzing Storage" -Completed
        
        Write-MandALog "Completed storage analysis for $($storageAnalysis.Count) volumes" -Level "SUCCESS" -Context $Context
        return $storageAnalysis
        
    } catch {
        Write-MandALog "Error performing storage analysis: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ShadowCopyEnhanced {
    param(
        [array]$ServerList,
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    $shadowCopies = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Discovering shadow copies on $($ServerList.Count) servers..." -Level "INFO" -Context $Context
        
        $currentServer = 0
        foreach ($server in $ServerList) {
            $currentServer++
            $serverName = $server.ServerName
            
            Write-Progress -Activity "Discovering Shadow Copies" `
                          -Status "Server $currentServer of $($ServerList.Count): $serverName" `
                          -PercentComplete (($currentServer / $ServerList.Count) * 100)
            
            try {
                # Get shadow copies
                $shadows = Get-CimInstance -ClassName Win32_ShadowCopy `
                                         -ComputerName $serverName `
                                         -ErrorAction Stop
                
                if ($null -eq $shadows -or $shadows.Count -eq 0) {
                    # No shadow copies on this server
                    continue
                }
                
                # Get shadow storage info
                $shadowStorage = Get-CimInstance -ClassName Win32_ShadowStorage `
                                               -ComputerName $serverName `
                                               -ErrorAction SilentlyContinue
                
                # Group by volume
                $volumeGroups = $shadows | Group-Object VolumeName
                
                foreach ($volumeGroup in $volumeGroups) {
                    $volumeName = $volumeGroup.Name
                    $volumeShadows = $volumeGroup.Group
                    
                    # Find storage info for this volume
                    $storage = $shadowStorage | Where-Object { $_.Volume -eq $volumeName }
                    
                    # Calculate stats
                    $oldestShadow = ($volumeShadows.InstallDate | Measure-Object -Minimum).Minimum
                    $newestShadow = ($volumeShadows.InstallDate | Measure-Object -Maximum).Maximum
                    
                    $shadowInfo = [PSCustomObject]@{
                        ServerName = $serverName
                        VolumeName = $volumeName
                        ShadowCopyCount = $volumeShadows.Count
                        OldestShadowDate = $oldestShadow
                        NewestShadowDate = $newestShadow
                        MaxSpaceGB = if ($storage) { [Math]::Round($storage.MaxSpace / 1GB, 2) } else { "Unknown" }
                        UsedSpaceGB = if ($storage) { [Math]::Round($storage.UsedSpace / 1GB, 2) } else { "Unknown" }
                        AllocatedSpaceGB = if ($storage) { [Math]::Round($storage.AllocatedSpace / 1GB, 2) } else { "Unknown" }
                        DiffAreaVolume = if ($storage) { $storage.DiffVolume } else { "Unknown" }
                        Provider = ($volumeShadows | Select-Object -First 1).ProviderID
                        ClientAccessible = ($volumeShadows | Where-Object { $_.ClientAccessible }).Count
                        Persistent = ($volumeShadows | Where-Object { $_.Persistent }).Count
                        Transportable = ($volumeShadows | Where-Object { $_.Transportable }).Count
                        NoAutoRelease = ($volumeShadows | Where-Object { $_.NoAutoRelease }).Count
                        LastAnalyzed = Get-Date
                        _DataType = 'ShadowCopies'
                    }
                    
                    $shadowCopies.Add($shadowInfo)
                }
                
            } catch {
                Write-MandALog "Error querying shadow copies on $serverName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-Progress -Activity "Discovering Shadow Copies" -Completed
        
        Write-MandALog "Discovered shadow copy configurations on $($shadowCopies.Count) volumes" -Level "SUCCESS" -Context $Context
        return $shadowCopies
        
    } catch {
        Write-MandALog "Error discovering shadow copies: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-FileServerClustersEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context
    )
    
    $clusters = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog "Discovering file server clusters..." -Level "INFO" -Context $Context
        
        # Check if FailoverClusters module is available
        if (-not (Get-Module -ListAvailable -Name FailoverClusters)) {
            Write-MandALog "FailoverClusters module not available. Install RSAT Failover Clustering Tools." -Level "WARN" -Context $Context
            return $clusters
        }
        
        Import-Module FailoverClusters -ErrorAction Stop
        
        # Find clusters in AD
        $clusterComputers = Get-ADComputer -Filter { ServicePrincipalName -like "*MSClusterVirtualServer*" } `
                                         -Properties ServicePrincipalName, Description `
                                         -ErrorAction SilentlyContinue
        
        if ($null -eq $clusterComputers -or $clusterComputers.Count -eq 0) {
            Write-MandALog "No clusters found in Active Directory" -Level "INFO" -Context $Context
            return $clusters
        }
        
        foreach ($clusterAD in $clusterComputers) {
            $clusterName = $clusterAD.Name
            
            try {
                # Get cluster information
                $cluster = Get-Cluster -Name $clusterName -ErrorAction Stop
                
                if ($null -eq $cluster) {
                    continue
                }
                
                # Get cluster nodes
                $nodes = Get-ClusterNode -Cluster $cluster -ErrorAction SilentlyContinue
                
                # Get file server resources
                $fileServerResources = Get-ClusterResource -Cluster $cluster -ErrorAction SilentlyContinue |
                                      Where-Object { $_.ResourceType -like "*File Server*" }
                
                # Get cluster shared volumes
                $csvs = Get-ClusterSharedVolume -Cluster $cluster -ErrorAction SilentlyContinue
                
                # Get quorum information
                $quorum = Get-ClusterQuorum -Cluster $cluster -ErrorAction SilentlyContinue
                
                $clusterInfo = [PSCustomObject]@{
                    ClusterName = $cluster.Name
                    Domain = $cluster.Domain
                    Description = if ($clusterAD.Description) { $clusterAD.Description } else { "" }
                    ClusterFQDN = "$($cluster.Name).$($cluster.Domain)"
                    NodeCount = @($nodes).Count
                    Nodes = ($nodes.Name -join "; ")
                    NodeStates = ($nodes | ForEach-Object { "$($_.Name):$($_.State)" }) -join "; "
                    FileServerResourceCount = @($fileServerResources).Count
                    FileServerResources = ($fileServerResources.Name -join "; ")
                    FileServerResourceStates = ($fileServerResources | ForEach-Object { "$($_.Name):$($_.State)" }) -join "; "
                    ClusterQuorumType = if ($quorum) { $quorum.QuorumType.ToString() } else { "Unknown" }
                    QuorumResource = if ($quorum -and $quorum.QuorumResource) { $quorum.QuorumResource } else { "None" }
                    SharedVolumeCount = @($csvs).Count
                    SharedVolumes = ($csvs.Name -join "; ")
                    SharedVolumePaths = ($csvs.SharedVolumeInfo.FriendlyVolumeName -join "; ")
                    EnabledFeatures = @()  # Would need additional queries
                    CreatedDate = $clusterAD.whenCreated
                    DistinguishedName = $clusterAD.DistinguishedName
                    LastAnalyzed = Get-Date
                    _DataType = 'FileServerClusters'
                }
                
                $clusters.Add($clusterInfo)
                
            } catch {
                Write-MandALog "Error querying cluster '$clusterName': $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-MandALog "Discovered $($clusters.Count) file server clusters" -Level "SUCCESS" -Context $Context
        return $clusters
        
    } catch {
        Write-MandALog "Error discovering file server clusters: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

# Helper Functions

function Test-ServerConnectivity {
    param(
        [string]$ServerName,
        [int]$Timeout = 5
    )
    
    try {
        $ping = Test-Connection -ComputerName $ServerName -Count 1 -Quiet -ErrorAction SilentlyContinue
        if (-not $ping) {
            return $false
        }
        
        # Test WMI/CIM connectivity
        $testCim = Get-CimInstance -ClassName Win32_ComputerSystem `
                                  -ComputerName $ServerName `
                                  -OperationTimeoutSec $Timeout `
                                  -ErrorAction SilentlyContinue
        
        return ($null -ne $testCim)
        
    } catch {
        return $false
    }
}

function Get-OrCreateCimSession {
    param(
        [string]$ComputerName,
        [PSCredential]$Credential
    )
    
    # Check if session already exists
    if ($script:CimSessions.ContainsKey($ComputerName)) {
        $session = $script:CimSessions[$ComputerName]
        if ((Get-CimSession -Id $session.Id -ErrorAction SilentlyContinue)) {
            return $session
        }
    }
    
    # Create new session
    $sessionOptions = New-CimSessionOption -Protocol Dcom
    
    $sessionParams = @{
        ComputerName = $ComputerName
        SessionOption = $sessionOptions
        ErrorAction = 'Stop'
    }
    
    if ($Credential) {
        $sessionParams.Credential = $Credential
    }
    
    $session = New-CimSession @sessionParams
    $script:CimSessions[$ComputerName] = $session
    
    return $session
}

function Split-ArrayIntoBatches {
    param(
        [array]$Array,
        [int]$BatchSize
    )
    
    $batches = [System.Collections.Generic.List[array]]::new()
    
    for ($i = 0; $i -lt $Array.Count; $i += $BatchSize) {
        $batch = $Array[$i..[Math]::Min($i + $BatchSize - 1, $Array.Count - 1)]
        $batches.Add($batch)
    }
    
    return $batches
}

function Convert-ToFlattenedFileServerData {
    param([hashtable]$Results)
    
    $flatData = [System.Collections.Generic.List[PSObject]]::new()
    
    # Map of result keys to export file names
    $fileMap = @{
        'FileServers' = 'FileServers.csv'
        'FileShares' = 'FileShares.csv'
        'DFSNamespaces' = 'DFSNamespaces.csv'
        'DFSFolders' = 'DFSFolders.csv'
        'StorageAnalysis' = 'StorageAnalysis.csv'
        'ShadowCopies' = 'ShadowCopies.csv'
        'FileServerClusters' = 'FileServerClusters.csv'
    }
    
    foreach ($key in $Results.Keys) {
        if ($Results[$key] -is [array] -or $Results[$key] -is [System.Collections.Generic.List[PSObject]]) {
            if ($Results[$key].Count -gt 0) {
                # Data is already tagged with _DataType
                $flatData.AddRange($Results[$key])
            }
        }
    }
    
    return $flatData
}

function Clear-FileServerResources {
    # Clean up CIM sessions
    foreach ($session in $script:CimSessions.Values) {
        try {
            Remove-CimSession -CimSession $session -ErrorAction SilentlyContinue
        } catch {
            # Ignore cleanup errors
        }
    }
    $script:CimSessions.Clear()
    
    # Clean up PS sessions
    foreach ($session in $script:PSSessionPool.Values) {
        try {
            Remove-PSSession -Session $session -ErrorAction SilentlyContinue
        } catch {
            # Ignore cleanup errors
        }
    }
    $script:PSSessionPool.Clear()
    
    # Clear circuit breakers
    $script:ServerCircuitBreakers.Clear()
}

# Export module members
Export-ModuleMember -Function 'Invoke-FileServerDiscovery'


