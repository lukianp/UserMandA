# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Web server configuration discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers IIS, Apache, Nginx, and other web server configurations including
    sites, applications, bindings, SSL certificates, and security settings for
    comprehensive web infrastructure assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, IIS Administration tools, appropriate permissions
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-WebServerLog {
    <#
    .SYNOPSIS
        Writes log entries specific to web server discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[WebServer] $Message" -Level $Level -Component "WebServerConfigDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [WebServer] $Message" -ForegroundColor $color
    }
}

function Invoke-WebServerConfigDiscovery {
    <#
    .SYNOPSIS
        Main web server configuration discovery function.
    
    .DESCRIPTION
        Discovers IIS, Apache, Nginx and other web server configurations including
        sites, bindings, applications, and security settings.
    
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

    Write-WebServerLog -Level "HEADER" -Message "Starting Web Server Configuration Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'WebServerConfigDiscovery'
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
        
        # Discover IIS Configuration
        try {
            Write-WebServerLog -Level "INFO" -Message "Discovering IIS configuration..." -Context $Context
            $iisData = Get-IISConfiguration -SessionId $SessionId
            if ($iisData.Count -gt 0) {
                $iisData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'IIS' -Force }
                $null = $allDiscoveredData.AddRange($iisData)
                $result.Metadata["IISCount"] = $iisData.Count
            }
            Write-WebServerLog -Level "SUCCESS" -Message "Discovered $($iisData.Count) IIS configuration objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover IIS configuration: $($_.Exception.Message)", @{Section="IIS"})
        }
        
        # Discover Apache Configuration
        try {
            Write-WebServerLog -Level "INFO" -Message "Discovering Apache configuration..." -Context $Context
            $apacheData = Get-ApacheConfiguration -Configuration $Configuration -SessionId $SessionId
            if ($apacheData.Count -gt 0) {
                $apacheData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Apache' -Force }
                $null = $allDiscoveredData.AddRange($apacheData)
                $result.Metadata["ApacheCount"] = $apacheData.Count
            }
            Write-WebServerLog -Level "SUCCESS" -Message "Discovered $($apacheData.Count) Apache configuration objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Apache configuration: $($_.Exception.Message)", @{Section="Apache"})
        }
        
        # Discover Nginx Configuration
        try {
            Write-WebServerLog -Level "INFO" -Message "Discovering Nginx configuration..." -Context $Context
            $nginxData = Get-NginxConfiguration -Configuration $Configuration -SessionId $SessionId
            if ($nginxData.Count -gt 0) {
                $nginxData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Nginx' -Force }
                $null = $allDiscoveredData.AddRange($nginxData)
                $result.Metadata["NginxCount"] = $nginxData.Count
            }
            Write-WebServerLog -Level "SUCCESS" -Message "Discovered $($nginxData.Count) Nginx configuration objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Nginx configuration: $($_.Exception.Message)", @{Section="Nginx"})
        }
        
        # Discover Web Application Frameworks
        try {
            Write-WebServerLog -Level "INFO" -Message "Discovering web application frameworks..." -Context $Context
            $frameworkData = Get-WebApplicationFrameworks -SessionId $SessionId
            if ($frameworkData.Count -gt 0) {
                $frameworkData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'WebFramework' -Force }
                $null = $allDiscoveredData.AddRange($frameworkData)
                $result.Metadata["WebFrameworkCount"] = $frameworkData.Count
            }
            Write-WebServerLog -Level "SUCCESS" -Message "Discovered $($frameworkData.Count) web framework objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover web frameworks: $($_.Exception.Message)", @{Section="WebFrameworks"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-WebServerLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "WebServer_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "WebServerConfigDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-WebServerLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-WebServerLog -Level "WARN" -Message "No web server configuration data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-WebServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during web server discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-WebServerLog -Level "HEADER" -Message "Web server discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-IISConfiguration {
    <#
    .SYNOPSIS
        Discovers IIS configuration including sites, app pools, and bindings.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $iisData = @()
    
    try {
        # Check if IIS is installed
        $iisFeature = Get-WindowsFeature -Name Web-Server -ErrorAction SilentlyContinue
        if (-not $iisFeature -or $iisFeature.InstallState -ne "Installed") {
            Write-WebServerLog -Level "INFO" -Message "IIS not installed on this system"
            return $iisData
        }
        
        # Check for IIS Administration module
        if (Get-Module -Name IISAdministration -ListAvailable) {
            Import-Module IISAdministration -ErrorAction Stop
            
            # Get IIS Sites
            $sites = Get-IISSite -ErrorAction Stop
            foreach ($site in $sites) {
                $iisData += [PSCustomObject]@{
                    ObjectType = "IISSite"
                    Name = $site.Name
                    State = $site.State
                    ApplicationCount = $site.Applications.Count
                    PhysicalPath = $site.Applications[0].VirtualDirectories[0].PhysicalPath
                    ApplicationPool = $site.Applications[0].ApplicationPoolName
                    EnabledProtocols = $site.Applications[0].EnabledProtocols
                    Bindings = ($site.Bindings | ForEach-Object { 
                        "$($_.Protocol)://$($_.BindingInformation)" + $(if ($_.CertificateThumbprint) { " (SSL: $($_.CertificateThumbprint))" })
                    }) -join '; '
                    SessionId = $SessionId
                }
                
                # Get site applications
                foreach ($app in $site.Applications) {
                    if ($app.Path -ne "/") {
                        $iisData += [PSCustomObject]@{
                            ObjectType = "IISApplication"
                            SiteName = $site.Name
                            ApplicationPath = $app.Path
                            PhysicalPath = $app.VirtualDirectories[0].PhysicalPath
                            ApplicationPool = $app.ApplicationPoolName
                            EnabledProtocols = $app.EnabledProtocols
                            PreloadEnabled = $app.PreloadEnabled
                            SessionId = $SessionId
                        }
                    }
                    
                    # Get virtual directories
                    foreach ($vdir in $app.VirtualDirectories) {
                        if ($vdir.Path -ne "/") {
                            $iisData += [PSCustomObject]@{
                                ObjectType = "IISVirtualDirectory"
                                SiteName = $site.Name
                                ApplicationPath = $app.Path
                                VirtualPath = $vdir.Path
                                PhysicalPath = $vdir.PhysicalPath
                                LogonMethod = $vdir.LogonMethod
                                UserName = $vdir.UserName
                                SessionId = $SessionId
                            }
                        }
                    }
                }
            }
            
            # Get Application Pools
            $appPools = Get-IISAppPool -ErrorAction Stop
            foreach ($pool in $appPools) {
                $iisData += [PSCustomObject]@{
                    ObjectType = "IISAppPool"
                    Name = $pool.Name
                    State = $pool.State
                    ManagedRuntimeVersion = $pool.ManagedRuntimeVersion
                    ManagedPipelineMode = $pool.ManagedPipelineMode
                    StartMode = $pool.StartMode
                    Enable32BitAppOnWin64 = $pool.Enable32BitAppOnWin64
                    QueueLength = $pool.QueueLength
                    ProcessIdentityType = $pool.ProcessModel.IdentityType
                    ProcessIdentityUser = if ($pool.ProcessModel.IdentityType -eq "SpecificUser") { $pool.ProcessModel.UserName } else { "" }
                    IdleTimeout = $pool.ProcessModel.IdleTimeout
                    MaxProcesses = $pool.ProcessModel.MaxProcesses
                    RecyclingPeriodicRestart = $pool.Recycling.PeriodicRestart.Time
                    RecyclingMemoryLimit = $pool.Recycling.PeriodicRestart.Memory
                    SessionId = $SessionId
                }
            }
            
            # Get IIS Modules
            $modules = Get-IISConfigSection -SectionPath "system.webServer/modules" | Get-IISConfigCollection
            foreach ($module in $modules) {
                $iisData += [PSCustomObject]@{
                    ObjectType = "IISModule"
                    Name = $module.Attributes["name"].Value
                    Type = $module.Attributes["type"].Value
                    PreCondition = $module.Attributes["preCondition"].Value
                    SessionId = $SessionId
                }
            }
            
        } else {
            # Fallback to WebAdministration module
            Import-Module WebAdministration -ErrorAction SilentlyContinue
            
            $sites = Get-Website -ErrorAction SilentlyContinue
            foreach ($site in $sites) {
                $iisData += [PSCustomObject]@{
                    ObjectType = "IISSite"
                    Name = $site.Name
                    State = $site.State
                    PhysicalPath = $site.PhysicalPath
                    ApplicationPool = $site.ApplicationPool
                    Bindings = ($site.Bindings.Collection | ForEach-Object { $_.BindingInformation }) -join '; '
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-WebServerLog -Level "ERROR" -Message "Failed to discover IIS configuration: $($_.Exception.Message)"
    }
    
    return $iisData
}

function Get-ApacheConfiguration {
    <#
    .SYNOPSIS
        Discovers Apache web server configuration.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $apacheData = @()
    
    try {
        # Common Apache installation paths on Windows
        $apachePaths = @(
            "C:\Apache24",
            "C:\Apache2.4",
            "C:\Apache2",
            "C:\Program Files\Apache Software Foundation\Apache2.4",
            "C:\Program Files\Apache Software Foundation\Apache2.2",
            "C:\Program Files (x86)\Apache Software Foundation\Apache2.4",
            "C:\xampp\apache",
            "C:\wamp\bin\apache",
            "C:\wamp64\bin\apache"
        )
        
        # Add configured paths
        if ($Configuration.webServers.apache.paths) {
            $apachePaths += $Configuration.webServers.apache.paths
        }
        
        foreach ($path in $apachePaths) {
            if (Test-Path $path) {
                $apacheData += [PSCustomObject]@{
                    ObjectType = "ApacheInstallation"
                    InstallPath = $path
                    ConfigPath = Join-Path $path "conf\httpd.conf"
                    BinPath = Join-Path $path "bin"
                    LogPath = Join-Path $path "logs"
                    SessionId = $SessionId
                }
                
                # Check for httpd.conf
                $confPath = Join-Path $path "conf\httpd.conf"
                if (Test-Path $confPath) {
                    $apacheData += [PSCustomObject]@{
                        ObjectType = "ApacheConfig"
                        ConfigFile = $confPath
                        LastModified = (Get-Item $confPath).LastWriteTime
                        Size = [math]::Round((Get-Item $confPath).Length / 1KB, 2)
                        SessionId = $SessionId
                    }
                    
                    # Parse basic configuration
                    try {
                        $configContent = Get-Content $confPath -ErrorAction SilentlyContinue
                        
                        # Extract ServerRoot
                        $serverRoot = $configContent | Where-Object { $_ -match '^\s*ServerRoot\s+"?([^"]+)"?' } | ForEach-Object { $Matches[1] }
                        
                        # Extract Listen directives
                        $listenPorts = $configContent | Where-Object { $_ -match '^\s*Listen\s+(\d+)' } | ForEach-Object { $Matches[1] }
                        
                        # Extract ServerName
                        $serverName = $configContent | Where-Object { $_ -match '^\s*ServerName\s+(.+)' } | ForEach-Object { $Matches[1] }
                        
                        # Extract DocumentRoot
                        $documentRoot = $configContent | Where-Object { $_ -match '^\s*DocumentRoot\s+"?([^"]+)"?' } | ForEach-Object { $Matches[1] }
                        
                        $apacheData += [PSCustomObject]@{
                            ObjectType = "ApacheSettings"
                            ServerRoot = $serverRoot
                            ListenPorts = ($listenPorts -join ', ')
                            ServerName = $serverName
                            DocumentRoot = $documentRoot
                            SessionId = $SessionId
                        }
                        
                        # Look for virtual hosts
                        $vhostFiles = Get-ChildItem -Path (Join-Path $path "conf\extra") -Filter "*vhost*.conf" -ErrorAction SilentlyContinue
                        foreach ($vhost in $vhostFiles) {
                            $apacheData += [PSCustomObject]@{
                                ObjectType = "ApacheVirtualHost"
                                ConfigFile = $vhost.FullName
                                FileName = $vhost.Name
                                LastModified = $vhost.LastWriteTime
                                SessionId = $SessionId
                            }
                        }
                        
                    } catch {
                        Write-WebServerLog -Level "DEBUG" -Message "Failed to parse Apache config: $($_.Exception.Message)"
                    }
                }
                
                # Check for Apache service
                $apacheServices = Get-Service | Where-Object { $_.Name -like "*Apache*" -or $_.DisplayName -like "*Apache*" }
                foreach ($service in $apacheServices) {
                    $apacheData += [PSCustomObject]@{
                        ObjectType = "ApacheService"
                        ServiceName = $service.Name
                        DisplayName = $service.DisplayName
                        Status = $service.Status
                        StartType = $service.StartType
                        SessionId = $SessionId
                    }
                }
            }
        }
        
    } catch {
        Write-WebServerLog -Level "ERROR" -Message "Failed to discover Apache configuration: $($_.Exception.Message)"
    }
    
    return $apacheData
}

function Get-NginxConfiguration {
    <#
    .SYNOPSIS
        Discovers Nginx web server configuration.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $nginxData = @()
    
    try {
        # Common Nginx installation paths on Windows
        $nginxPaths = @(
            "C:\nginx",
            "C:\Program Files\nginx",
            "C:\Program Files (x86)\nginx"
        )
        
        # Add configured paths
        if ($Configuration.webServers.nginx.paths) {
            $nginxPaths += $Configuration.webServers.nginx.paths
        }
        
        foreach ($path in $nginxPaths) {
            if (Test-Path $path) {
                $nginxData += [PSCustomObject]@{
                    ObjectType = "NginxInstallation"
                    InstallPath = $path
                    ConfigPath = Join-Path $path "conf\nginx.conf"
                    LogPath = Join-Path $path "logs"
                    SessionId = $SessionId
                }
                
                # Check for nginx.conf
                $confPath = Join-Path $path "conf\nginx.conf"
                if (Test-Path $confPath) {
                    $nginxData += [PSCustomObject]@{
                        ObjectType = "NginxConfig"
                        ConfigFile = $confPath
                        LastModified = (Get-Item $confPath).LastWriteTime
                        Size = [math]::Round((Get-Item $confPath).Length / 1KB, 2)
                        SessionId = $SessionId
                    }
                    
                    # Look for sites-enabled/sites-available
                    $sitesEnabled = Join-Path $path "conf\sites-enabled"
                    if (Test-Path $sitesEnabled) {
                        $siteConfigs = Get-ChildItem -Path $sitesEnabled -Filter "*.conf" -ErrorAction SilentlyContinue
                        foreach ($site in $siteConfigs) {
                            $nginxData += [PSCustomObject]@{
                                ObjectType = "NginxSite"
                                ConfigFile = $site.FullName
                                SiteName = $site.Name
                                Enabled = $true
                                LastModified = $site.LastWriteTime
                                SessionId = $SessionId
                            }
                        }
                    }
                }
                
                # Check for Nginx service
                $nginxServices = Get-Service | Where-Object { $_.Name -like "*nginx*" -or $_.DisplayName -like "*nginx*" }
                foreach ($service in $nginxServices) {
                    $nginxData += [PSCustomObject]@{
                        ObjectType = "NginxService"
                        ServiceName = $service.Name
                        DisplayName = $service.DisplayName
                        Status = $service.Status
                        StartType = $service.StartType
                        SessionId = $SessionId
                    }
                }
            }
        }
        
        # Check for Nginx processes
        $nginxProcesses = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        foreach ($process in $nginxProcesses) {
            $nginxData += [PSCustomObject]@{
                ObjectType = "NginxProcess"
                ProcessId = $process.Id
                ProcessName = $process.ProcessName
                StartTime = $process.StartTime
                WorkingSet = [math]::Round($process.WorkingSet64 / 1MB, 2)
                Path = $process.Path
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-WebServerLog -Level "ERROR" -Message "Failed to discover Nginx configuration: $($_.Exception.Message)"
    }
    
    return $nginxData
}

function Get-WebApplicationFrameworks {
    <#
    .SYNOPSIS
        Discovers web application frameworks and runtime environments.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $frameworkData = @()
    
    try {
        # .NET Framework versions
        $dotNetVersions = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP' -Recurse -ErrorAction SilentlyContinue |
            Get-ItemProperty -Name Version -ErrorAction SilentlyContinue |
            Where-Object { $_.PSChildName -match '^(?!S)\d' -and $_.Version } |
            Select-Object PSChildName, Version
            
        foreach ($version in $dotNetVersions) {
            $frameworkData += [PSCustomObject]@{
                ObjectType = "DotNetFramework"
                FrameworkName = ".NET Framework"
                Version = $version.Version
                VersionName = $version.PSChildName
                SessionId = $SessionId
            }
        }
        
        # .NET Core / .NET 5+ runtimes
        $dotnetExe = Get-Command dotnet -ErrorAction SilentlyContinue
        if ($dotnetExe) {
            try {
                $runtimes = & dotnet --list-runtimes 2>$null
                foreach ($runtime in $runtimes) {
                    if ($runtime -match '(\S+)\s+(\S+)\s+\[(.+)\]') {
                        $frameworkData += [PSCustomObject]@{
                            ObjectType = "DotNetCore"
                            FrameworkName = $Matches[1]
                            Version = $Matches[2]
                            InstallPath = $Matches[3]
                            SessionId = $SessionId
                        }
                    }
                }
                
                $sdks = & dotnet --list-sdks 2>$null
                foreach ($sdk in $sdks) {
                    if ($sdk -match '(\S+)\s+\[(.+)\]') {
                        $frameworkData += [PSCustomObject]@{
                            ObjectType = "DotNetSDK"
                            FrameworkName = ".NET SDK"
                            Version = $Matches[1]
                            InstallPath = $Matches[2]
                            SessionId = $SessionId
                        }
                    }
                }
            } catch {
                Write-WebServerLog -Level "DEBUG" -Message "Failed to enumerate .NET runtimes"
            }
        }
        
        # Node.js
        $nodeExe = Get-Command node -ErrorAction SilentlyContinue
        if ($nodeExe) {
            try {
                $nodeVersion = & node --version 2>$null
                $npmVersion = & npm --version 2>$null
                $frameworkData += [PSCustomObject]@{
                    ObjectType = "NodeJS"
                    FrameworkName = "Node.js"
                    Version = $nodeVersion
                    NPMVersion = $npmVersion
                    InstallPath = Split-Path $nodeExe.Source -Parent
                    SessionId = $SessionId
                }
            } catch {
                Write-WebServerLog -Level "DEBUG" -Message "Failed to get Node.js version"
            }
        }
        
        # Python
        $pythonExe = Get-Command python -ErrorAction SilentlyContinue
        if ($pythonExe) {
            try {
                $pythonVersion = & python --version 2>&1
                $frameworkData += [PSCustomObject]@{
                    ObjectType = "Python"
                    FrameworkName = "Python"
                    Version = ($pythonVersion -replace 'Python ', '')
                    InstallPath = Split-Path $pythonExe.Source -Parent
                    SessionId = $SessionId
                }
            } catch {
                Write-WebServerLog -Level "DEBUG" -Message "Failed to get Python version"
            }
        }
        
        # PHP
        $phpExe = Get-Command php -ErrorAction SilentlyContinue
        if ($phpExe) {
            try {
                $phpVersion = & php --version 2>$null | Select-Object -First 1
                $frameworkData += [PSCustomObject]@{
                    ObjectType = "PHP"
                    FrameworkName = "PHP"
                    Version = ($phpVersion -split ' ')[1]
                    InstallPath = Split-Path $phpExe.Source -Parent
                    SessionId = $SessionId
                }
            } catch {
                Write-WebServerLog -Level "DEBUG" -Message "Failed to get PHP version"
            }
        }
        
        # Java
        $javaExe = Get-Command java -ErrorAction SilentlyContinue
        if ($javaExe) {
            try {
                $javaVersion = & java -version 2>&1 | Select-Object -First 1
                $frameworkData += [PSCustomObject]@{
                    ObjectType = "Java"
                    FrameworkName = "Java"
                    Version = ($javaVersion -split '"')[1]
                    JavaHome = $env:JAVA_HOME
                    InstallPath = Split-Path $javaExe.Source -Parent
                    SessionId = $SessionId
                }
            } catch {
                Write-WebServerLog -Level "DEBUG" -Message "Failed to get Java version"
            }
        }
        
    } catch {
        Write-WebServerLog -Level "ERROR" -Message "Failed to discover web frameworks: $($_.Exception.Message)"
    }
    
    return $frameworkData
}

# Export functions
Export-ModuleMember -Function Invoke-WebServerConfigDiscovery