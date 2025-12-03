# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Application dependency mapping module for M&A Discovery Suite
.DESCRIPTION
    Maps application dependencies, service relationships, network connections,
    and inter-process communications to provide comprehensive understanding of
    application architecture and dependencies for M&A assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Administrative privileges for process analysis
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-DependencyLog {
    <#
    .SYNOPSIS
        Writes log entries specific to dependency mapping.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Dependency] $Message" -Level $Level -Component "ApplicationDependencyMapping" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        $logMessage = "[$timestamp] [$Level] [Dependency] $Message"
        switch ($Level) {
            'ERROR' { Write-Error "[ApplicationDependencyMapping] $logMessage" }
            'WARN' { Write-Warning "[ApplicationDependencyMapping] $logMessage" }
            'SUCCESS' { Write-Information "[ApplicationDependencyMapping] $logMessage" -InformationAction Continue }
            'DEBUG' { Write-Verbose "[ApplicationDependencyMapping] $logMessage" -Verbose }
            default { Write-Information "[ApplicationDependencyMapping] $logMessage" -InformationAction Continue }
        }
    }
}

function Invoke-ApplicationDependencyMapping {
    <#
    .SYNOPSIS
        Main application dependency mapping function.
    
    .DESCRIPTION
        Maps application dependencies including service relationships, network
        connections, DLL dependencies, and configuration dependencies.
    
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

    Write-DependencyLog -Level "HEADER" -Message "Starting Application Dependency Mapping (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'ApplicationDependencyMapping'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
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
        
        # Map Service Dependencies
        try {
            Write-DependencyLog -Level "INFO" -Message "Mapping service dependencies..." -Context $Context
            $serviceDependencies = Get-ServiceDependencies -SessionId $SessionId
            if ($serviceDependencies.Count -gt 0) {
                $serviceDependencies | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ServiceDependency' -Force }
                $null = $allDiscoveredData.AddRange($serviceDependencies)
                $result.Metadata["ServiceDependencyCount"] = $serviceDependencies.Count
            }
            Write-DependencyLog -Level "SUCCESS" -Message "Mapped $($serviceDependencies.Count) service dependencies" -Context $Context
        } catch {
            $result.AddWarning("Failed to map service dependencies: $($_.Exception.Message)", @{Section="ServiceDependencies"})
        }
        
        # Map Process Dependencies
        try {
            Write-DependencyLog -Level "INFO" -Message "Mapping process dependencies..." -Context $Context
            $processDependencies = Get-ProcessDependencies -SessionId $SessionId
            if ($processDependencies.Count -gt 0) {
                $processDependencies | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ProcessDependency' -Force }
                $null = $allDiscoveredData.AddRange($processDependencies)
                $result.Metadata["ProcessDependencyCount"] = $processDependencies.Count
            }
            Write-DependencyLog -Level "SUCCESS" -Message "Mapped $($processDependencies.Count) process dependencies" -Context $Context
        } catch {
            $result.AddWarning("Failed to map process dependencies: $($_.Exception.Message)", @{Section="ProcessDependencies"})
        }
        
        # Map Network Connections
        try {
            Write-DependencyLog -Level "INFO" -Message "Mapping network connections..." -Context $Context
            $networkConnections = Get-NetworkConnectionMapping -SessionId $SessionId
            if ($networkConnections.Count -gt 0) {
                $networkConnections | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NetworkConnection' -Force }
                $null = $allDiscoveredData.AddRange($networkConnections)
                $result.Metadata["NetworkConnectionCount"] = $networkConnections.Count
            }
            Write-DependencyLog -Level "SUCCESS" -Message "Mapped $($networkConnections.Count) network connections" -Context $Context
        } catch {
            $result.AddWarning("Failed to map network connections: $($_.Exception.Message)", @{Section="NetworkConnections"})
        }
        
        # Map Application Configuration Dependencies
        try {
            Write-DependencyLog -Level "INFO" -Message "Mapping configuration dependencies..." -Context $Context
            $configDependencies = Get-ConfigurationDependencies -Configuration $Configuration -SessionId $SessionId
            if ($configDependencies.Count -gt 0) {
                $configDependencies | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ConfigDependency' -Force }
                $null = $allDiscoveredData.AddRange($configDependencies)
                $result.Metadata["ConfigDependencyCount"] = $configDependencies.Count
            }
            Write-DependencyLog -Level "SUCCESS" -Message "Mapped $($configDependencies.Count) configuration dependencies" -Context $Context
        } catch {
            $result.AddWarning("Failed to map configuration dependencies: $($_.Exception.Message)", @{Section="ConfigDependencies"})
        }
        
        # Generate Dependency Analysis
        try {
            Write-DependencyLog -Level "INFO" -Message "Generating dependency analysis..." -Context $Context
            $analysis = Get-DependencyAnalysis -DependencyData $allDiscoveredData -SessionId $SessionId
            if ($analysis.Count -gt 0) {
                $analysis | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DependencyAnalysis' -Force }
                $null = $allDiscoveredData.AddRange($analysis)
                $result.Metadata["DependencyAnalysisCount"] = $analysis.Count
            }
            Write-DependencyLog -Level "SUCCESS" -Message "Generated dependency analysis" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate dependency analysis: $($_.Exception.Message)", @{Section="DependencyAnalysis"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-DependencyLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Dependency_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ApplicationDependencyMapping" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-DependencyLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-DependencyLog -Level "WARN" -Message "No dependency data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during dependency mapping: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-DependencyLog -Level "HEADER" -Message "Dependency mapping finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-ServiceDependencies {
    <#
    .SYNOPSIS
        Maps Windows service dependencies and relationships.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $dependencies = @()
    
    try {
        # Get all services with their dependencies
        $services = Get-CimInstance -ClassName Win32_Service -ErrorAction SilentlyContinue
        
        foreach ($service in $services) {
            # Service dependencies (services this service depends on)
            if ($service.ServicesDependedOn) {
                foreach ($dependency in $service.ServicesDependedOn) {
                    $dependencies += [PSCustomObject]@{
                        DependencyType = "ServiceDependency"
                        SourceService = $service.Name
                        SourceDisplayName = $service.DisplayName
                        SourceState = $service.State
                        SourceStartMode = $service.StartMode
                        DependsOn = $dependency
                        DependencyDirection = "Requires"
                        ProcessId = $service.ProcessId
                        PathName = $service.PathName
                        StartName = $service.StartName
                        Critical = ($service.StartMode -eq "Auto" -or $service.StartMode -eq "Boot" -or $service.StartMode -eq "System")
                        SessionId = $SessionId
                    }
                }
            }
            
            # Dependent services (services that depend on this service)
            $dependentServices = Get-CimInstance -ClassName Win32_DependentService -Filter "Antecedent='Win32_Service.Name=""$($service.Name)""'" -ErrorAction SilentlyContinue
            foreach ($dependent in $dependentServices) {
                $depServiceName = ($dependent.Dependent -split '"')[1]
                $dependencies += [PSCustomObject]@{
                    DependencyType = "ServiceDependency"
                    SourceService = $depServiceName
                    SourceDisplayName = ""
                    SourceState = ""
                    SourceStartMode = ""
                    DependsOn = $service.Name
                    DependencyDirection = "RequiredBy"
                    ProcessId = $service.ProcessId
                    PathName = $service.PathName
                    StartName = $service.StartName
                    Critical = ($service.StartMode -eq "Auto" -or $service.StartMode -eq "Boot" -or $service.StartMode -eq "System")
                    SessionId = $SessionId
                }
            }
            
            # Service to process mapping
            if ($service.ProcessId -and $service.ProcessId -gt 0) {
                $process = Get-Process -Id $service.ProcessId -ErrorAction SilentlyContinue
                if ($process) {
                    $dependencies += [PSCustomObject]@{
                        DependencyType = "ServiceProcess"
                        ServiceName = $service.Name
                        ServiceDisplayName = $service.DisplayName
                        ProcessId = $service.ProcessId
                        ProcessName = $process.ProcessName
                        ProcessPath = $process.Path
                        ProcessCommandLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$($service.ProcessId)" -ErrorAction SilentlyContinue).CommandLine
                        ProcessMemory = [math]::Round($process.WorkingSet64 / 1MB, 2)
                        ProcessCPU = $process.CPU
                        ProcessStartTime = $process.StartTime
                        SessionId = $SessionId
                    }
                }
            }
        }
        
    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Failed to map service dependencies: $($_.Exception.Message)"
    }
    
    return $dependencies
}

function Get-ProcessDependencies {
    <#
    .SYNOPSIS
        Maps process dependencies including parent-child relationships and DLL dependencies.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $dependencies = @()
    
    try {
        # Get all processes with parent process information
        $processes = Get-CimInstance -ClassName Win32_Process -ErrorAction SilentlyContinue
        
        foreach ($process in $processes) {
            # Parent-child process relationships
            if ($process.ParentProcessId -and $process.ParentProcessId -gt 0) {
                $parentProcess = $processes | Where-Object { $_.ProcessId -eq $process.ParentProcessId }
                if ($parentProcess) {
                    $dependencies += [PSCustomObject]@{
                        DependencyType = "ProcessHierarchy"
                        ProcessId = $process.ProcessId
                        ProcessName = $process.Name
                        ProcessPath = $process.ExecutablePath
                        ParentProcessId = $process.ParentProcessId
                        ParentProcessName = $parentProcess.Name
                        ParentProcessPath = $parentProcess.ExecutablePath
                        CommandLine = $process.CommandLine
                        CreationDate = $process.CreationDate
                        Priority = $process.Priority
                        ThreadCount = $process.ThreadCount
                        HandleCount = $process.HandleCount
                        WorkingSetSize = [math]::Round($process.WorkingSetSize / 1MB, 2)
                        VirtualSize = [math]::Round($process.VirtualSize / 1MB, 2)
                        SessionId = $SessionId
                    }
                }
            }
            
            # Get loaded modules (DLLs) for key processes
            if ($process.ProcessId -and $process.ExecutablePath) {
                try {
                    $psProcess = Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
                    if ($psProcess -and $psProcess.Modules) {
                        # Limit to first 10 modules to avoid excessive data
                        $modules = $psProcess.Modules | Select-Object -First 10
                        foreach ($module in $modules) {
                            $dependencies += [PSCustomObject]@{
                                DependencyType = "ProcessModule"
                                ProcessId = $process.ProcessId
                                ProcessName = $process.Name
                                ModuleName = $module.ModuleName
                                ModulePath = $module.FileName
                                ModuleVersion = $module.FileVersionInfo.FileVersion
                                ModuleCompany = $module.FileVersionInfo.CompanyName
                                ModuleDescription = $module.FileVersionInfo.FileDescription
                                ModuleSize = [math]::Round($module.ModuleMemorySize / 1KB, 2)
                                SessionId = $SessionId
                            }
                        }
                    }
                } catch {
                    # Skip if we can't access process modules
                }
            }
        }
        
        # Identify critical system processes
        $criticalProcesses = @('lsass', 'services', 'csrss', 'winlogon', 'svchost', 'System')
        $criticalDeps = $processes | Where-Object { $criticalProcesses -contains $_.Name.Replace('.exe','') }
        
        foreach ($critical in $criticalDeps) {
            $dependencies += [PSCustomObject]@{
                DependencyType = "CriticalProcess"
                ProcessId = $critical.ProcessId
                ProcessName = $critical.Name
                ProcessPath = $critical.ExecutablePath
                Priority = "Critical"
                Description = "System critical process"
                Owner = (Get-CimInstance Win32_Process -Filter "ProcessId=$($critical.ProcessId)" -ErrorAction SilentlyContinue | Invoke-CimMethod -MethodName GetOwner -ErrorAction SilentlyContinue).User
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Failed to map process dependencies: $($_.Exception.Message)"
    }
    
    return $dependencies
}

function Get-NetworkConnectionMapping {
    <#
    .SYNOPSIS
        Maps network connections and communication patterns between applications.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $connections = @()
    
    try {
        # Get TCP connections
        $tcpConnections = Get-NetTCPConnection -ErrorAction SilentlyContinue
        
        foreach ($conn in $tcpConnections) {
            if ($conn.OwningProcess -and $conn.OwningProcess -gt 0) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $connections += [PSCustomObject]@{
                        ConnectionType = "TCP"
                        ProcessId = $conn.OwningProcess
                        ProcessName = $process.ProcessName
                        LocalAddress = $conn.LocalAddress
                        LocalPort = $conn.LocalPort
                        RemoteAddress = $conn.RemoteAddress
                        RemotePort = $conn.RemotePort
                        State = $conn.State
                        CreationTime = $conn.CreationTime
                        IsLoopback = ($conn.RemoteAddress -eq "127.0.0.1" -or $conn.RemoteAddress -eq "::1")
                        IsListening = ($conn.State -eq "Listen")
                        IsEstablished = ($conn.State -eq "Established")
                        SessionId = $SessionId
                    }
                }
            }
        }
        
        # Get UDP endpoints
        $udpEndpoints = Get-NetUDPEndpoint -ErrorAction SilentlyContinue
        
        foreach ($endpoint in $udpEndpoints) {
            if ($endpoint.OwningProcess -and $endpoint.OwningProcess -gt 0) {
                $process = Get-Process -Id $endpoint.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $connections += [PSCustomObject]@{
                        ConnectionType = "UDP"
                        ProcessId = $endpoint.OwningProcess
                        ProcessName = $process.ProcessName
                        LocalAddress = $endpoint.LocalAddress
                        LocalPort = $endpoint.LocalPort
                        RemoteAddress = ""
                        RemotePort = ""
                        State = "Listening"
                        CreationTime = $endpoint.CreationTime
                        IsLoopback = $false
                        IsListening = $true
                        IsEstablished = $false
                        SessionId = $SessionId
                    }
                }
            }
        }
        
        # Analyze connection patterns
        $connectionPatterns = $connections | Group-Object ProcessName, RemotePort | Where-Object { $_.Count -gt 1 }
        
        foreach ($pattern in $connectionPatterns) {
            $connections += [PSCustomObject]@{
                ConnectionType = "Pattern"
                ProcessName = ($pattern.Name -split ',')[0].Trim()
                RemotePort = ($pattern.Name -split ',')[1].Trim()
                ConnectionCount = $pattern.Count
                Pattern = "Multiple connections to same port"
                PotentialService = Get-ServiceNameFromPort -Port ($pattern.Name -split ',')[1].Trim()
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Failed to map network connections: $($_.Exception.Message)"
    }
    
    return $connections
}

function Get-ConfigurationDependencies {
    <#
    .SYNOPSIS
        Maps application configuration dependencies from common locations.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $configDeps = @()
    
    try {
        # Check IIS configuration dependencies
        if (Get-Module -Name IISAdministration -ListAvailable) {
            Import-Module IISAdministration -ErrorAction SilentlyContinue
            try {
                $sites = Get-IISSite -ErrorAction SilentlyContinue
                foreach ($site in $sites) {
                    $configDeps += [PSCustomObject]@{
                        ConfigType = "IISSite"
                        ApplicationName = $site.Name
                        ApplicationPath = $site.Applications[0].VirtualDirectories[0].PhysicalPath
                        ConfigLocation = "IIS"
                        State = $site.State
                        Bindings = ($site.Bindings | ForEach-Object { "$($_.Protocol)://$($_.BindingInformation)" }) -join '; '
                        AppPool = $site.Applications[0].ApplicationPoolName
                        Dependencies = "IIS, .NET Framework"
                        SessionId = $SessionId
                    }
                }
                
                $appPools = Get-IISAppPool -ErrorAction SilentlyContinue
                foreach ($pool in $appPools) {
                    $configDeps += [PSCustomObject]@{
                        ConfigType = "IISAppPool"
                        ApplicationName = $pool.Name
                        RuntimeVersion = $pool.ManagedRuntimeVersion
                        PipelineMode = $pool.ManagedPipelineMode
                        Enable32Bit = $pool.Enable32BitAppOnWin64
                        State = $pool.State
                        ProcessIdentity = $pool.ProcessModel.IdentityType
                        Dependencies = ".NET Framework"
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-DependencyLog -Level "DEBUG" -Message "IIS configuration not accessible"
            }
        }
        
        # Check for database connection strings in common locations
        $configPaths = @(
            "C:\inetpub\wwwroot",
            "C:\Program Files",
            "C:\Program Files (x86)"
        )
        
        foreach ($path in $configPaths) {
            if (Test-Path $path) {
                # Look for web.config files
                $webConfigs = Get-ChildItem -Path $path -Filter "web.config" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 10
                foreach ($config in $webConfigs) {
                    $configDeps += [PSCustomObject]@{
                        ConfigType = "WebConfig"
                        ApplicationPath = $config.DirectoryName
                        ConfigFile = $config.FullName
                        ConfigLocation = "FileSystem"
                        Dependencies = "IIS, .NET Framework"
                        LastModified = $config.LastWriteTime
                        Size = [math]::Round($config.Length / 1KB, 2)
                        SessionId = $SessionId
                    }
                }
                
                # Look for app.config files
                $appConfigs = Get-ChildItem -Path $path -Filter "*.exe.config" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 10
                foreach ($config in $appConfigs) {
                    $configDeps += [PSCustomObject]@{
                        ConfigType = "AppConfig"
                        ApplicationPath = $config.DirectoryName
                        ConfigFile = $config.FullName
                        ConfigLocation = "FileSystem"
                        Dependencies = ".NET Framework"
                        LastModified = $config.LastWriteTime
                        Size = [math]::Round($config.Length / 1KB, 2)
                        SessionId = $SessionId
                    }
                }
            }
        }
        
        # Check for SQL Server dependencies via registry
        try {
            $sqlInstances = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL" -ErrorAction SilentlyContinue
            if ($sqlInstances) {
                $sqlInstances.PSObject.Properties | Where-Object { $_.Name -notlike "PS*" } | ForEach-Object {
                    $configDeps += [PSCustomObject]@{
                        ConfigType = "SQLServerInstance"
                        ApplicationName = $_.Name
                        InstanceName = $_.Value
                        ConfigLocation = "Registry"
                        Dependencies = "SQL Server"
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-DependencyLog -Level "DEBUG" -Message "SQL Server registry entries not found"
        }
        
    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Failed to map configuration dependencies: $($_.Exception.Message)"
    }
    
    return $configDeps
}

function Get-ServiceNameFromPort {
    <#
    .SYNOPSIS
        Attempts to identify service name from well-known port numbers.
    #>
    [CmdletBinding()]
    param([string]$Port)
    
    $wellKnownPorts = @{
        "80" = "HTTP"
        "443" = "HTTPS"
        "445" = "SMB"
        "3389" = "RDP"
        "1433" = "SQL Server"
        "3306" = "MySQL"
        "5432" = "PostgreSQL"
        "1521" = "Oracle"
        "25" = "SMTP"
        "110" = "POP3"
        "143" = "IMAP"
        "389" = "LDAP"
        "636" = "LDAPS"
        "21" = "FTP"
        "22" = "SSH"
        "23" = "Telnet"
        "53" = "DNS"
        "67" = "DHCP"
        "68" = "DHCP"
        "135" = "RPC"
        "139" = "NetBIOS"
        "161" = "SNMP"
        "162" = "SNMP Trap"
        "5985" = "WinRM HTTP"
        "5986" = "WinRM HTTPS"
    }
    
    if ($wellKnownPorts.ContainsKey($Port)) {
        return $wellKnownPorts[$Port]
    } else {
        return "Unknown"
    }
}

function Get-DependencyAnalysis {
    <#
    .SYNOPSIS
        Analyzes discovered dependencies to identify critical paths and risks.
    #>
    [CmdletBinding()]
    param(
        [array]$DependencyData,
        [string]$SessionId
    )
    
    $analysis = @()
    
    try {
        # Service dependency analysis
        $serviceDeps = $DependencyData | Where-Object { $_._DataType -eq 'ServiceDependency' -and $_.DependencyType -eq 'ServiceDependency' }
        $serviceCount = ($serviceDeps | Select-Object SourceService -Unique).Count
        $criticalServices = ($serviceDeps | Where-Object { $_.Critical -eq $true } | Select-Object SourceService -Unique).Count
        
        $analysis += [PSCustomObject]@{
            AnalysisType = "ServiceDependencySummary"
            TotalServices = $serviceCount
            ServicesWithDependencies = ($serviceDeps | Select-Object SourceService -Unique).Count
            CriticalServices = $criticalServices
            TotalDependencyRelationships = $serviceDeps.Count
            AverageDependenciesPerService = if ($serviceCount -gt 0) { [math]::Round($serviceDeps.Count / $serviceCount, 2) } else { 0 }
            MostDependentService = ($serviceDeps | Group-Object SourceService | Sort-Object Count -Descending | Select-Object -First 1).Name
            SessionId = $SessionId
        }
        
        # Network connection analysis
        $networkConns = $DependencyData | Where-Object { $_._DataType -eq 'NetworkConnection' }
        $listeningPorts = ($networkConns | Where-Object { $_.IsListening -eq $true }).Count
        $establishedConns = ($networkConns | Where-Object { $_.IsEstablished -eq $true }).Count
        $externalConns = ($networkConns | Where-Object { $_.RemoteAddress -and $_.RemoteAddress -notlike "10.*" -and $_.RemoteAddress -notlike "192.168.*" -and $_.RemoteAddress -notlike "172.16.*" -and $_.RemoteAddress -ne "127.0.0.1" }).Count
        
        $analysis += [PSCustomObject]@{
            AnalysisType = "NetworkConnectionSummary"
            TotalConnections = $networkConns.Count
            ListeningPorts = $listeningPorts
            EstablishedConnections = $establishedConns
            ExternalConnections = $externalConns
            UniqueProcessesWithConnections = ($networkConns | Select-Object ProcessName -Unique).Count
            MostConnectedProcess = ($networkConns | Group-Object ProcessName | Sort-Object Count -Descending | Select-Object -First 1).Name
            SessionId = $SessionId
        }
        
        # Critical dependency chains
        $criticalChains = @()
        foreach ($service in ($serviceDeps | Where-Object { $_.Critical -eq $true } | Select-Object SourceService -Unique)) {
            $chain = Get-ServiceDependencyChain -ServiceName $service.SourceService -Dependencies $serviceDeps -Depth 0
            if ($chain.Count -gt 2) {
                $criticalChains += @{
                    Service = $service.SourceService
                    ChainDepth = $chain.Count
                    Chain = ($chain -join ' -> ')
                }
            }
        }
        
        if ($criticalChains.Count -gt 0) {
            foreach ($chain in $criticalChains) {
                $analysis += [PSCustomObject]@{
                    AnalysisType = "CriticalDependencyChain"
                    ServiceName = $chain.Service
                    ChainDepth = $chain.ChainDepth
                    DependencyChain = $chain.Chain
                    Risk = if ($chain.ChainDepth -gt 5) { "High" } elseif ($chain.ChainDepth -gt 3) { "Medium" } else { "Low" }
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-DependencyLog -Level "ERROR" -Message "Failed to generate dependency analysis: $($_.Exception.Message)"
    }
    
    return $analysis
}

function Get-ServiceDependencyChain {
    <#
    .SYNOPSIS
        Recursively builds service dependency chain.
    #>
    [CmdletBinding()]
    param(
        [string]$ServiceName,
        [array]$Dependencies,
        [int]$Depth,
        [string[]]$VisitedServices = @()
    )
    
    if ($Depth -gt 10 -or $ServiceName -in $VisitedServices) {
        return @()
    }
    
    $VisitedServices += $ServiceName
    $chain = @($ServiceName)
    
    $deps = $Dependencies | Where-Object { $_.SourceService -eq $ServiceName -and $_.DependencyDirection -eq "Requires" }
    foreach ($dep in $deps) {
        $subChain = Get-ServiceDependencyChain -ServiceName $dep.DependsOn -Dependencies $Dependencies -Depth ($Depth + 1) -VisitedServices $VisitedServices
        if ($subChain.Count -gt 0) {
            $chain += $subChain
        }
    }
    
    return $chain
}

# Export functions
Export-ModuleMember -Function Invoke-ApplicationDependencyMapping
