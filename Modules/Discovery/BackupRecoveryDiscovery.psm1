# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Backup and recovery systems discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers backup infrastructure including backup software, schedules, retention
    policies, storage locations, and recovery capabilities to assess data protection
    and business continuity readiness during M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Administrative privileges, backup system access
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-BackupLog {
    <#
    .SYNOPSIS
        Writes log entries specific to backup and recovery discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Backup] $Message" -Level $Level -Component "BackupRecoveryDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [Backup] $Message" -ForegroundColor $color
    }
}

function Invoke-BackupRecoveryDiscovery {
    <#
    .SYNOPSIS
        Main backup and recovery discovery function.
    
    .DESCRIPTION
        Discovers backup software, schedules, policies, storage, and recovery
        capabilities to assess data protection infrastructure.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-BackupLog -Level "HEADER" -Message "Starting Backup and Recovery Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'BackupRecoveryDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Windows Backup
        try {
            Write-BackupLog -Level "INFO" -Message "Discovering Windows Backup..." -Context $Context
            $windowsBackupData = Get-WindowsBackupConfiguration -SessionId $SessionId
            if ($windowsBackupData.Count -gt 0) {
                $windowsBackupData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'WindowsBackup' -Force }
                $null = $allDiscoveredData.AddRange($windowsBackupData)
                $result.Metadata["WindowsBackupCount"] = $windowsBackupData.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Discovered $($windowsBackupData.Count) Windows Backup objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Windows Backup: $($_.Exception.Message)", @{Section="WindowsBackup"})
        }
        
        # Discover Third-Party Backup Software
        try {
            Write-BackupLog -Level "INFO" -Message "Discovering third-party backup software..." -Context $Context
            $thirdPartyBackupData = Get-ThirdPartyBackupSoftware -Configuration $Configuration -SessionId $SessionId
            if ($thirdPartyBackupData.Count -gt 0) {
                $thirdPartyBackupData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ThirdPartyBackup' -Force }
                $null = $allDiscoveredData.AddRange($thirdPartyBackupData)
                $result.Metadata["ThirdPartyBackupCount"] = $thirdPartyBackupData.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Discovered $($thirdPartyBackupData.Count) third-party backup objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover third-party backup software: $($_.Exception.Message)", @{Section="ThirdPartyBackup"})
        }
        
        # Discover Backup Storage
        try {
            Write-BackupLog -Level "INFO" -Message "Discovering backup storage..." -Context $Context
            $backupStorageData = Get-BackupStorageConfiguration -Configuration $Configuration -SessionId $SessionId
            if ($backupStorageData.Count -gt 0) {
                $backupStorageData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'BackupStorage' -Force }
                $null = $allDiscoveredData.AddRange($backupStorageData)
                $result.Metadata["BackupStorageCount"] = $backupStorageData.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Discovered $($backupStorageData.Count) backup storage objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover backup storage: $($_.Exception.Message)", @{Section="BackupStorage"})
        }
        
        # Discover System Recovery Configuration
        try {
            Write-BackupLog -Level "INFO" -Message "Discovering system recovery configuration..." -Context $Context
            $recoveryData = Get-SystemRecoveryConfiguration -SessionId $SessionId
            if ($recoveryData.Count -gt 0) {
                $recoveryData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SystemRecovery' -Force }
                $null = $allDiscoveredData.AddRange($recoveryData)
                $result.Metadata["SystemRecoveryCount"] = $recoveryData.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Discovered $($recoveryData.Count) system recovery objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover system recovery: $($_.Exception.Message)", @{Section="SystemRecovery"})
        }
        
        # Discover VSS Configuration
        try {
            Write-BackupLog -Level "INFO" -Message "Discovering Volume Shadow Copy Service..." -Context $Context
            $vssData = Get-VSSConfiguration -SessionId $SessionId
            if ($vssData.Count -gt 0) {
                $vssData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'VSS' -Force }
                $null = $allDiscoveredData.AddRange($vssData)
                $result.Metadata["VSSCount"] = $vssData.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Discovered $($vssData.Count) VSS objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover VSS configuration: $($_.Exception.Message)", @{Section="VSS"})
        }
        
        # Generate Backup Assessment
        try {
            Write-BackupLog -Level "INFO" -Message "Generating backup assessment..." -Context $Context
            $assessment = Get-BackupAssessment -BackupData $allDiscoveredData -SessionId $SessionId
            if ($assessment.Count -gt 0) {
                $assessment | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'BackupAssessment' -Force }
                $null = $allDiscoveredData.AddRange($assessment)
                $result.Metadata["AssessmentCount"] = $assessment.Count
            }
            Write-BackupLog -Level "SUCCESS" -Message "Generated backup assessment" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate backup assessment: $($_.Exception.Message)", @{Section="Assessment"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-BackupLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Backup_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "BackupRecoveryDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-BackupLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-BackupLog -Level "WARN" -Message "No backup data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-BackupLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during backup discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-BackupLog -Level "HEADER" -Message "Backup discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-WindowsBackupConfiguration {
    <#
    .SYNOPSIS
        Discovers Windows Server Backup and Windows Backup configuration.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $backupData = @()
    
    try {
        # Check if Windows Server Backup is available
        if (Get-WindowsFeature -Name Windows-Server-Backup -ErrorAction SilentlyContinue) {
            try {
                Import-Module WindowsServerBackup -ErrorAction SilentlyContinue
                
                # Get backup policy
                $backupPolicy = Get-WBPolicy -ErrorAction SilentlyContinue
                if ($backupPolicy) {
                    $backupData += [PSCustomObject]@{
                        BackupType = "WindowsServerBackup"
                        PolicyExists = $true
                        Schedule = ($backupPolicy.Schedule | ForEach-Object { $_.ToString() }) -join '; '
                        BackupTargets = ($backupPolicy.BackupTargets | ForEach-Object { $_.TargetType + ": " + $_.TargetPath }) -join '; '
                        VolumesToBackup = ($backupPolicy.VolumesToBackup | ForEach-Object { $_.MountPath }) -join '; '
                        BMRBackupEnabled = $backupPolicy.BMRBackupEnabled
                        SystemStateBackupEnabled = $backupPolicy.SystemStateBackupEnabled
                        RetentionPolicy = $backupPolicy.RetentionPolicy
                        SessionId = $SessionId
                    }
                } else {
                    $backupData += [PSCustomObject]@{
                        BackupType = "WindowsServerBackup"
                        PolicyExists = $false
                        Status = "No backup policy configured"
                        SessionId = $SessionId
                    }
                }
                
                # Get backup history
                $backupJobs = Get-WBJob -Previous 10 -ErrorAction SilentlyContinue
                foreach ($job in $backupJobs) {
                    $backupData += [PSCustomObject]@{
                        BackupType = "WindowsServerBackupJob"
                        JobType = $job.JobType
                        JobState = $job.JobState
                        StartTime = $job.StartTime
                        EndTime = $job.EndTime
                        HResult = $job.HResult
                        ErrorDescription = $job.ErrorDescription
                        BackupTarget = $job.BackupTarget
                        VersionId = $job.VersionId
                        SessionId = $SessionId
                    }
                }
                
            } catch {
                Write-BackupLog -Level "DEBUG" -Message "Windows Server Backup module not available or failed to load"
            }
        }
        
        # Check File History (Windows 8/10/11)
        try {
            $fileHistoryKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\FileHistory"
            if (Test-Path $fileHistoryKey) {
                $fileHistoryConfig = Get-ItemProperty -Path $fileHistoryKey -ErrorAction SilentlyContinue
                
                $backupData += [PSCustomObject]@{
                    BackupType = "FileHistory"
                    Enabled = $fileHistoryConfig.Enabled -eq 1
                    ConfiguredTargetUrl = $fileHistoryConfig.ConfiguredTargetUrl
                    ProtectedUpToTime = $fileHistoryConfig.ProtectedUpToTime
                    LastBackupTime = $fileHistoryConfig.LastBackupTime
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "File History configuration not accessible"
        }
        
        # Check System Image Backup locations
        try {
            $systemImageLocations = @(
                "C:\WindowsImageBackup",
                "D:\WindowsImageBackup",
                "E:\WindowsImageBackup"
            )
            
            foreach ($location in $systemImageLocations) {
                if (Test-Path $location) {
                    $systemImageBackups = Get-ChildItem -Path $location -Directory -ErrorAction SilentlyContinue
                    foreach ($backup in $systemImageBackups) {
                        $backupData += [PSCustomObject]@{
                            BackupType = "SystemImageBackup"
                            BackupLocation = $location
                            ComputerName = $backup.Name
                            BackupDate = $backup.LastWriteTime
                            SizeGB = [math]::Round((Get-ChildItem -Path $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB, 2)
                            SessionId = $SessionId
                        }
                    }
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "System image backup locations not accessible"
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to discover Windows Backup: $($_.Exception.Message)"
    }
    
    return $backupData
}

function Get-ThirdPartyBackupSoftware {
    <#
    .SYNOPSIS
        Discovers third-party backup software installations and configurations.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $thirdPartyData = @()
    
    try {
        # Common backup software to look for
        $backupSoftware = @{
            "Veeam" = @{
                Services = @("VeeamBackupSvc", "VeeamBrokerSvc", "VeeamCatalogSvc")
                RegistryPaths = @("HKLM:\SOFTWARE\Veeam", "HKLM:\SOFTWARE\WOW6432Node\Veeam")
                InstallPaths = @("C:\Program Files\Veeam", "C:\Program Files (x86)\Veeam")
            }
            "Symantec Backup Exec" = @{
                Services = @("BackupExecJobEngine", "BackupExecAgentBrowser", "BackupExecRPCService")
                RegistryPaths = @("HKLM:\SOFTWARE\Symantec\Backup Exec", "HKLM:\SOFTWARE\VERITAS\Backup Exec")
                InstallPaths = @("C:\Program Files\Symantec", "C:\Program Files\VERITAS")
            }
            "CommVault" = @{
                Services = @("GxCVD", "GxCIMgr", "GxFWD")
                RegistryPaths = @("HKLM:\SOFTWARE\CommVault Systems")
                InstallPaths = @("C:\Program Files\CommVault")
            }
            "Acronis" = @{
                Services = @("AcronisAgent", "ARSM", "AcrSch2Svc")
                RegistryPaths = @("HKLM:\SOFTWARE\Acronis")
                InstallPaths = @("C:\Program Files\Acronis", "C:\Program Files (x86)\Acronis")
            }
            "NetBackup" = @{
                Services = @("NetBackup Client Service", "NetBackup Legacy Network Service")
                RegistryPaths = @("HKLM:\SOFTWARE\VERITAS\NetBackup")
                InstallPaths = @("C:\Program Files\VERITAS")
            }
            "TSM" = @{
                Services = @("TSM Client Acceptor", "TSM Client Scheduler")
                RegistryPaths = @("HKLM:\SOFTWARE\IBM\ADSM")
                InstallPaths = @("C:\Program Files\Tivoli")
            }
        }
        
        foreach ($softwareName in $backupSoftware.Keys) {
            $software = $backupSoftware[$softwareName]
            $detected = $false
            $installInfo = @{}
            
            # Check services
            foreach ($serviceName in $software.Services) {
                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($service) {
                    $detected = $true
                    $installInfo["Service_$serviceName"] = @{
                        Status = $service.Status
                        StartType = $service.StartType
                        DisplayName = $service.DisplayName
                    }
                }
            }
            
            # Check registry
            foreach ($regPath in $software.RegistryPaths) {
                if (Test-Path $regPath) {
                    $detected = $true
                    $regInfo = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
                    $installInfo["Registry"] = $regPath
                    if ($regInfo.Version) { $installInfo["Version"] = $regInfo.Version }
                    if ($regInfo.InstallLocation) { $installInfo["InstallLocation"] = $regInfo.InstallLocation }
                }
            }
            
            # Check installation paths
            foreach ($installPath in $software.InstallPaths) {
                if (Test-Path $installPath) {
                    $detected = $true
                    $installInfo["InstallPath"] = $installPath
                    
                    # Get version info from executables
                    $exeFiles = Get-ChildItem -Path $installPath -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5
                    foreach ($exe in $exeFiles) {
                        if ($exe.VersionInfo.ProductVersion) {
                            $installInfo["ProductVersion"] = $exe.VersionInfo.ProductVersion
                            break
                        }
                    }
                }
            }
            
            if ($detected) {
                $thirdPartyData += [PSCustomObject]@{
                    BackupSoftware = $softwareName
                    Detected = $true
                    InstallationDetails = ($installInfo | ConvertTo-Json -Compress)
                    ServiceCount = ($installInfo.Keys | Where-Object { $_ -like "Service_*" }).Count
                    SessionId = $SessionId
                }
            }
        }
        
        # Look for generic backup software by searching installed programs
        $installedPrograms = Get-CimInstance -ClassName Win32_Product -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -match "backup|recovery|archive|sync" }
            
        foreach ($program in $installedPrograms) {
            # Skip if already detected above
            $alreadyDetected = $false
            foreach ($knownSoftware in $backupSoftware.Keys) {
                if ($program.Name -match ($knownSoftware -replace " ", ".*")) {
                    $alreadyDetected = $true
                    break
                }
            }
            
            if (-not $alreadyDetected) {
                $thirdPartyData += [PSCustomObject]@{
                    BackupSoftware = "Generic: $($program.Name)"
                    Detected = $true
                    Version = $program.Version
                    Vendor = $program.Vendor
                    InstallDate = $program.InstallDate
                    InstallLocation = $program.InstallLocation
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to discover third-party backup software: $($_.Exception.Message)"
    }
    
    return $thirdPartyData
}

function Get-BackupStorageConfiguration {
    <#
    .SYNOPSIS
        Discovers backup storage locations and configurations.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $storageData = @()
    
    try {
        # Check common backup storage locations
        $backupPaths = @(
            "C:\Backup",
            "C:\Backups", 
            "D:\Backup",
            "D:\Backups",
            "E:\Backup",
            "E:\Backups",
            "C:\WindowsImageBackup",
            "\\*\Backup*"
        )
        
        # Add configured backup paths
        if ($Configuration.backup.storagePaths) {
            $backupPaths += $Configuration.backup.storagePaths
        }
        
        foreach ($path in $backupPaths) {
            if ($path -like "\\*") {
                # Network path - check if accessible
                try {
                    $networkPaths = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue | Select-Object -First 10
                    foreach ($netPath in $networkPaths) {
                        $storageData += [PSCustomObject]@{
                            StorageType = "NetworkBackupStorage"
                            Path = $netPath.FullName
                            Size = "Network - Not Calculated"
                            LastAccessed = $netPath.LastAccessTime
                            LastModified = $netPath.LastWriteTime
                            FileCount = (Get-ChildItem -Path $netPath.FullName -File -ErrorAction SilentlyContinue).Count
                            SessionId = $SessionId
                        }
                    }
                } catch {
                    Write-BackupLog -Level "DEBUG" -Message "Network backup path not accessible: $path"
                }
            } else {
                # Local path
                if (Test-Path $path) {
                    try {
                        $pathInfo = Get-Item $path
                        $childItems = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
                        $totalSize = ($childItems | Measure-Object -Property Length -Sum).Sum
                        
                        $storageData += [PSCustomObject]@{
                            StorageType = "LocalBackupStorage"
                            Path = $path
                            SizeBytes = $totalSize
                            SizeGB = [math]::Round($totalSize / 1GB, 2)
                            LastAccessed = $pathInfo.LastAccessTime
                            LastModified = $pathInfo.LastWriteTime
                            FileCount = ($childItems | Where-Object { -not $_.PSIsContainer }).Count
                            FolderCount = ($childItems | Where-Object { $_.PSIsContainer }).Count
                            SessionId = $SessionId
                        }
                        
                        # Analyze backup files in the directory
                        $backupFiles = $childItems | Where-Object { 
                            $_.Extension -in @('.bak', '.backup', '.vhd', '.vhdx', '.vmdk', '.zip', '.7z') -or
                            $_.Name -match "backup|archive|dump"
                        }
                        
                        foreach ($backupFile in ($backupFiles | Select-Object -First 20)) {
                            $storageData += [PSCustomObject]@{
                                StorageType = "BackupFile"
                                Path = $backupFile.FullName
                                FileName = $backupFile.Name
                                Extension = $backupFile.Extension
                                SizeBytes = $backupFile.Length
                                SizeMB = [math]::Round($backupFile.Length / 1MB, 2)
                                Created = $backupFile.CreationTime
                                LastModified = $backupFile.LastWriteTime
                                Age = (Get-Date) - $backupFile.LastWriteTime
                                SessionId = $SessionId
                            }
                        }
                        
                    } catch {
                        Write-BackupLog -Level "DEBUG" -Message "Failed to analyze backup path $path: $($_.Exception.Message)"
                    }
                }
            }
        }
        
        # Check for removable storage (external drives, USB)
        $removableDrives = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DriveType -eq 2 }
        foreach ($drive in $removableDrives) {
            $storageData += [PSCustomObject]@{
                StorageType = "RemovableBackupStorage"
                Path = $drive.DeviceID
                SizeBytes = $drive.Size
                SizeGB = [math]::Round($drive.Size / 1GB, 2)
                FreeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 2)
                VolumeLabel = $drive.VolumeName
                FileSystem = $drive.FileSystem
                SessionId = $SessionId
            }
        }
        
        # Check tape drives
        $tapeDrives = Get-CimInstance -ClassName Win32_TapeDrive -ErrorAction SilentlyContinue
        foreach ($tape in $tapeDrives) {
            $storageData += [PSCustomObject]@{
                StorageType = "TapeBackupStorage"
                DeviceName = $tape.Name
                Manufacturer = $tape.Manufacturer
                MediaType = $tape.MediaType
                Status = $tape.Status
                Availability = $tape.Availability
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to discover backup storage: $($_.Exception.Message)"
    }
    
    return $storageData
}

function Get-SystemRecoveryConfiguration {
    <#
    .SYNOPSIS
        Discovers system recovery and disaster recovery configurations.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $recoveryData = @()
    
    try {
        # System Recovery Options
        $recoveryOptions = Get-CimInstance -ClassName Win32_OSRecoveryConfiguration -ErrorAction SilentlyContinue
        foreach ($option in $recoveryOptions) {
            $recoveryData += [PSCustomObject]@{
                RecoveryType = "SystemRecoveryOptions"
                AutoReboot = $option.AutoReboot
                DebugInfoType = $option.DebugInfoType
                KernelDumpOnly = $option.KernelDumpOnly
                OverwriteExistingDebugFile = $option.OverwriteExistingDebugFile
                SendAdminAlert = $option.SendAdminAlert
                WriteDebugInfo = $option.WriteDebugInfo
                WriteToSystemLog = $option.WriteToSystemLog
                DebugFilePath = $option.DebugFilePath
                SessionId = $SessionId
            }
        }
        
        # Boot Configuration Data (BCD)
        try {
            $bcdOutput = & bcdedit /enum 2>$null
            if ($bcdOutput) {
                $recoveryData += [PSCustomObject]@{
                    RecoveryType = "BootConfiguration"
                    BCDEntriesCount = ($bcdOutput | Where-Object { $_ -match "identifier" }).Count
                    HasRecoveryPartition = ($bcdOutput -join "`n") -match "recovery"
                    HasBootManager = ($bcdOutput -join "`n") -match "bootmgr"
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "Failed to enumerate BCD entries"
        }
        
        # System Restore Points
        try {
            if (Get-Command Get-ComputerRestorePoint -ErrorAction SilentlyContinue) {
                $restorePoints = Get-ComputerRestorePoint -ErrorAction SilentlyContinue
                
                $recoveryData += [PSCustomObject]@{
                    RecoveryType = "SystemRestoreOverview"
                    RestorePointCount = $restorePoints.Count
                    LatestRestorePoint = if ($restorePoints) { ($restorePoints | Sort-Object CreationTime -Descending | Select-Object -First 1).CreationTime } else { $null }
                    OldestRestorePoint = if ($restorePoints) { ($restorePoints | Sort-Object CreationTime | Select-Object -First 1).CreationTime } else { $null }
                    SessionId = $SessionId
                }
                
                foreach ($restorePoint in ($restorePoints | Select-Object -First 10)) {
                    $recoveryData += [PSCustomObject]@{
                        RecoveryType = "SystemRestorePoint"
                        SequenceNumber = $restorePoint.SequenceNumber
                        Description = $restorePoint.Description
                        RestorePointType = $restorePoint.RestorePointType
                        CreationTime = $restorePoint.CreationTime
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "System Restore information not available"
        }
        
        # Recovery Environment (WinRE)
        try {
            $winREInfo = & reagentc /info 2>$null
            if ($winREInfo) {
                $winREEnabled = $winREInfo -match "Enabled"
                $winRELocation = ($winREInfo | Where-Object { $_ -match "Windows RE location" }) -replace ".*: ", ""
                
                $recoveryData += [PSCustomObject]@{
                    RecoveryType = "WindowsRecoveryEnvironment"
                    Enabled = $winREEnabled
                    Location = $winRELocation
                    Status = ($winREInfo | Where-Object { $_ -match "Windows RE status" }) -replace ".*: ", ""
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "Windows Recovery Environment information not available"
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to discover system recovery configuration: $($_.Exception.Message)"
    }
    
    return $recoveryData
}

function Get-VSSConfiguration {
    <#
    .SYNOPSIS
        Discovers Volume Shadow Copy Service configuration and shadow copies.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $vssData = @()
    
    try {
        # VSS Service
        $vssService = Get-Service -Name VSS -ErrorAction SilentlyContinue
        if ($vssService) {
            $vssData += [PSCustomObject]@{
                VSSType = "Service"
                Status = $vssService.Status
                StartType = $vssService.StartType
                DisplayName = $vssService.DisplayName
                SessionId = $SessionId
            }
        }
        
        # Shadow Copies
        $shadowCopies = Get-CimInstance -ClassName Win32_ShadowCopy -ErrorAction SilentlyContinue
        foreach ($shadow in $shadowCopies) {
            $vssData += [PSCustomObject]@{
                VSSType = "ShadowCopy"
                DeviceObject = $shadow.DeviceObject
                VolumeName = $shadow.VolumeName
                InstallDate = $shadow.InstallDate
                OriginatingMachine = $shadow.OriginatingMachine
                ServiceMachine = $shadow.ServiceMachine
                State = $shadow.State
                Persistent = $shadow.Persistent
                ClientAccessible = $shadow.ClientAccessible
                NoAutoRelease = $shadow.NoAutoRelease
                SessionId = $SessionId
            }
        }
        
        # VSS Writers
        try {
            $vssWriters = & vssadmin list writers 2>$null
            if ($vssWriters) {
                $writerBlocks = ($vssWriters -join "`n") -split "Writer name:"
                foreach ($block in $writerBlocks) {
                    if ($block.Trim()) {
                        $lines = $block -split "`n"
                        $writerName = ($lines[0] -replace "'", "").Trim()
                        $writerId = ($lines | Where-Object { $_ -match "Writer Id:" }) -replace ".*Writer Id: ", ""
                        $writerState = ($lines | Where-Object { $_ -match "State:" }) -replace ".*State: \[\d+\] ", ""
                        
                        if ($writerName) {
                            $vssData += [PSCustomObject]@{
                                VSSType = "Writer"
                                WriterName = $writerName
                                WriterId = $writerId
                                State = $writerState
                                SessionId = $SessionId
                            }
                        }
                    }
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "VSS writers information not available"
        }
        
        # VSS Providers
        try {
            $vssProviders = & vssadmin list providers 2>$null
            if ($vssProviders) {
                $providerBlocks = ($vssProviders -join "`n") -split "Provider name:"
                foreach ($block in $providerBlocks) {
                    if ($block.Trim()) {
                        $lines = $block -split "`n"
                        $providerName = ($lines[0] -replace "'", "").Trim()
                        $providerType = ($lines | Where-Object { $_ -match "Type:" }) -replace ".*Type: ", ""
                        $providerVersion = ($lines | Where-Object { $_ -match "Version:" }) -replace ".*Version: ", ""
                        
                        if ($providerName) {
                            $vssData += [PSCustomObject]@{
                                VSSType = "Provider"
                                ProviderName = $providerName
                                Type = $providerType
                                Version = $providerVersion
                                SessionId = $SessionId
                            }
                        }
                    }
                }
            }
        } catch {
            Write-BackupLog -Level "DEBUG" -Message "VSS providers information not available"
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to discover VSS configuration: $($_.Exception.Message)"
    }
    
    return $vssData
}

function Get-BackupAssessment {
    <#
    .SYNOPSIS
        Generates an assessment of backup and recovery readiness.
    #>
    [CmdletBinding()]
    param(
        [array]$BackupData,
        [string]$SessionId
    )
    
    $assessment = @()
    
    try {
        # Overall backup coverage assessment
        $windowsBackupConfigured = ($BackupData | Where-Object { $_._DataType -eq 'WindowsBackup' -and $_.PolicyExists -eq $true }).Count -gt 0
        $thirdPartyBackupFound = ($BackupData | Where-Object { $_._DataType -eq 'ThirdPartyBackup' -and $_.Detected -eq $true }).Count -gt 0
        $backupStorageFound = ($BackupData | Where-Object { $_._DataType -eq 'BackupStorage' }).Count -gt 0
        $vssConfigured = ($BackupData | Where-Object { $_._DataType -eq 'VSS' -and $_.VSSType -eq 'Service' -and $_.Status -eq 'Running' }).Count -gt 0
        
        $backupScore = 0
        $backupFindings = @()
        
        if ($windowsBackupConfigured) {
            $backupScore += 25
            $backupFindings += "Windows Backup configured"
        } else {
            $backupFindings += "No Windows Backup policy found"
        }
        
        if ($thirdPartyBackupFound) {
            $backupScore += 35
            $thirdPartyCount = ($BackupData | Where-Object { $_._DataType -eq 'ThirdPartyBackup' -and $_.Detected -eq $true }).Count
            $backupFindings += "$thirdPartyCount third-party backup solution(s) detected"
        } else {
            $backupFindings += "No third-party backup solutions detected"
        }
        
        if ($backupStorageFound) {
            $backupScore += 20
            $storageCount = ($BackupData | Where-Object { $_._DataType -eq 'BackupStorage' }).Count
            $backupFindings += "$storageCount backup storage location(s) found"
        } else {
            $backupFindings += "Limited backup storage evidence found"
        }
        
        if ($vssConfigured) {
            $backupScore += 20
            $backupFindings += "Volume Shadow Copy Service operational"
        } else {
            $backupFindings += "Volume Shadow Copy Service issues detected"
        }
        
        # Determine risk level
        $riskLevel = if ($backupScore -ge 80) { "Low" } 
                    elseif ($backupScore -ge 60) { "Medium" } 
                    elseif ($backupScore -ge 40) { "High" } 
                    else { "Critical" }
        
        $assessment += [PSCustomObject]@{
            AssessmentType = "BackupReadiness"
            BackupScore = $backupScore
            RiskLevel = $riskLevel
            WindowsBackupConfigured = $windowsBackupConfigured
            ThirdPartyBackupDetected = $thirdPartyBackupFound
            BackupStorageAvailable = $backupStorageFound
            VSSOperational = $vssConfigured
            Findings = ($backupFindings -join '; ')
            Recommendations = Get-BackupRecommendations -RiskLevel $riskLevel -Findings $backupFindings
            AssessmentDate = Get-Date
            SessionId = $SessionId
        }
        
        # Recovery readiness assessment
        $systemRecoveryConfigured = ($BackupData | Where-Object { $_._DataType -eq 'SystemRecovery' }).Count -gt 0
        $restorePointsAvailable = ($BackupData | Where-Object { $_._DataType -eq 'SystemRecovery' -and $_.RecoveryType -eq 'SystemRestoreOverview' -and $_.RestorePointCount -gt 0 }).Count -gt 0
        $winREEnabled = ($BackupData | Where-Object { $_._DataType -eq 'SystemRecovery' -and $_.RecoveryType -eq 'WindowsRecoveryEnvironment' -and $_.Enabled -eq $true }).Count -gt 0
        
        $recoveryScore = 0
        $recoveryFindings = @()
        
        if ($systemRecoveryConfigured) {
            $recoveryScore += 30
            $recoveryFindings += "System recovery options configured"
        }
        
        if ($restorePointsAvailable) {
            $recoveryScore += 35
            $recoveryFindings += "System restore points available"
        }
        
        if ($winREEnabled) {
            $recoveryScore += 35
            $recoveryFindings += "Windows Recovery Environment enabled"
        }
        
        $recoveryRiskLevel = if ($recoveryScore -ge 80) { "Low" } 
                           elseif ($recoveryScore -ge 60) { "Medium" } 
                           elseif ($recoveryScore -ge 40) { "High" } 
                           else { "Critical" }
        
        $assessment += [PSCustomObject]@{
            AssessmentType = "RecoveryReadiness"
            RecoveryScore = $recoveryScore
            RiskLevel = $recoveryRiskLevel
            SystemRecoveryConfigured = $systemRecoveryConfigured
            RestorePointsAvailable = $restorePointsAvailable
            WindowsREEnabled = $winREEnabled
            Findings = ($recoveryFindings -join '; ')
            Recommendations = Get-RecoveryRecommendations -RiskLevel $recoveryRiskLevel -Findings $recoveryFindings
            AssessmentDate = Get-Date
            SessionId = $SessionId
        }
        
    } catch {
        Write-BackupLog -Level "ERROR" -Message "Failed to generate backup assessment: $($_.Exception.Message)"
    }
    
    return $assessment
}

function Get-BackupRecommendations {
    <#
    .SYNOPSIS
        Provides backup recommendations based on risk level.
    #>
    [CmdletBinding()]
    param(
        [string]$RiskLevel,
        [array]$Findings
    )
    
    $recommendations = @()
    
    switch ($RiskLevel) {
        "Critical" {
            $recommendations += "URGENT: Implement comprehensive backup solution immediately"
            $recommendations += "Configure automated daily backups for critical data"
            $recommendations += "Establish offsite backup storage"
            $recommendations += "Test backup and restore procedures"
        }
        "High" {
            $recommendations += "Enhance existing backup coverage"
            $recommendations += "Implement redundant backup solutions"
            $recommendations += "Regular backup verification and testing"
        }
        "Medium" {
            $recommendations += "Review backup schedules and retention policies"
            $recommendations += "Consider additional backup storage locations"
            $recommendations += "Regular backup health monitoring"
        }
        "Low" {
            $recommendations += "Maintain current backup practices"
            $recommendations += "Periodic review of backup strategies"
        }
    }
    
    return ($recommendations -join '; ')
}

function Get-RecoveryRecommendations {
    <#
    .SYNOPSIS
        Provides recovery recommendations based on risk level.
    #>
    [CmdletBinding()]
    param(
        [string]$RiskLevel,
        [array]$Findings
    )
    
    $recommendations = @()
    
    switch ($RiskLevel) {
        "Critical" {
            $recommendations += "URGENT: Establish disaster recovery procedures"
            $recommendations += "Create system recovery media"
            $recommendations += "Document recovery processes"
            $recommendations += "Test recovery procedures regularly"
        }
        "High" {
            $recommendations += "Improve system recovery capabilities"
            $recommendations += "Enable Windows Recovery Environment"
            $recommendations += "Create regular system restore points"
        }
        "Medium" {
            $recommendations += "Review recovery time objectives (RTO)"
            $recommendations += "Test recovery procedures periodically"
        }
        "Low" {
            $recommendations += "Maintain current recovery configurations"
            $recommendations += "Document recovery procedures"
        }
    }
    
    return ($recommendations -join '; ')
}

# Export functions
Export-ModuleMember -Function Invoke-BackupRecoveryDiscovery