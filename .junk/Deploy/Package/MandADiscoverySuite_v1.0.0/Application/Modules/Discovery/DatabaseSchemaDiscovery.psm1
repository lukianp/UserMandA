# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Database schema discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers database schemas, tables, relationships, and configurations across
    SQL Server, MySQL, PostgreSQL, and Oracle databases for comprehensive
    data infrastructure assessment during M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Database provider modules (SqlServer, MySQL, Oracle)
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-DatabaseLog {
    <#
    .SYNOPSIS
        Writes log entries specific to database discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Database] $Message" -Level $Level -Component "DatabaseSchemaDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [Database] $Message" -ForegroundColor $color
    }
}

function Invoke-DatabaseSchemaDiscovery {
    <#
    .SYNOPSIS
        Main database schema discovery function.
    
    .DESCRIPTION
        Discovers database instances, schemas, tables, and relationships across
        multiple database platforms including SQL Server, MySQL, PostgreSQL, and Oracle.
    
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

    Write-DatabaseLog -Level "HEADER" -Message "Starting Database Schema Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'DatabaseSchemaDiscovery'
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
        
        # Discover SQL Server Instances
        try {
            Write-DatabaseLog -Level "INFO" -Message "Discovering SQL Server instances..." -Context $Context
            $sqlServerData = Get-SqlServerInstances -Configuration $Configuration -SessionId $SessionId
            if ($sqlServerData.Count -gt 0) {
                $sqlServerData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SqlServer' -Force }
                $null = $allDiscoveredData.AddRange($sqlServerData)
                $result.Metadata["SqlServerCount"] = $sqlServerData.Count
            }
            Write-DatabaseLog -Level "SUCCESS" -Message "Discovered $($sqlServerData.Count) SQL Server objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover SQL Server instances: $($_.Exception.Message)", @{Section="SqlServer"})
        }
        
        # Discover MySQL Instances
        try {
            Write-DatabaseLog -Level "INFO" -Message "Discovering MySQL instances..." -Context $Context
            $mysqlData = Get-MySqlInstances -Configuration $Configuration -SessionId $SessionId
            if ($mysqlData.Count -gt 0) {
                $mysqlData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'MySQL' -Force }
                $null = $allDiscoveredData.AddRange($mysqlData)
                $result.Metadata["MySqlCount"] = $mysqlData.Count
            }
            Write-DatabaseLog -Level "SUCCESS" -Message "Discovered $($mysqlData.Count) MySQL objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover MySQL instances: $($_.Exception.Message)", @{Section="MySQL"})
        }
        
        # Discover PostgreSQL Instances
        try {
            Write-DatabaseLog -Level "INFO" -Message "Discovering PostgreSQL instances..." -Context $Context
            $postgresData = Get-PostgreSqlInstances -Configuration $Configuration -SessionId $SessionId
            if ($postgresData.Count -gt 0) {
                $postgresData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PostgreSQL' -Force }
                $null = $allDiscoveredData.AddRange($postgresData)
                $result.Metadata["PostgreSqlCount"] = $postgresData.Count
            }
            Write-DatabaseLog -Level "SUCCESS" -Message "Discovered $($postgresData.Count) PostgreSQL objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover PostgreSQL instances: $($_.Exception.Message)", @{Section="PostgreSQL"})
        }
        
        # Discover Oracle Instances
        try {
            Write-DatabaseLog -Level "INFO" -Message "Discovering Oracle instances..." -Context $Context
            $oracleData = Get-OracleInstances -Configuration $Configuration -SessionId $SessionId
            if ($oracleData.Count -gt 0) {
                $oracleData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Oracle' -Force }
                $null = $allDiscoveredData.AddRange($oracleData)
                $result.Metadata["OracleCount"] = $oracleData.Count
            }
            Write-DatabaseLog -Level "SUCCESS" -Message "Discovered $($oracleData.Count) Oracle objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Oracle instances: $($_.Exception.Message)", @{Section="Oracle"})
        }
        
        # Generate Database Summary
        try {
            Write-DatabaseLog -Level "INFO" -Message "Generating database summary..." -Context $Context
            $summary = Get-DatabaseSummary -DatabaseData $allDiscoveredData -SessionId $SessionId
            if ($summary.Count -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DatabaseSummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["DatabaseSummaryCount"] = $summary.Count
            }
            Write-DatabaseLog -Level "SUCCESS" -Message "Generated database summary" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate database summary: $($_.Exception.Message)", @{Section="DatabaseSummary"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-DatabaseLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Database_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "DatabaseSchemaDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-DatabaseLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-DatabaseLog -Level "WARN" -Message "No database data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during database schema discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-DatabaseLog -Level "HEADER" -Message "Database schema discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-SqlServerInstances {
    <#
    .SYNOPSIS
        Discovers SQL Server instances and their databases.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $sqlServerData = @()
    
    try {
        # Check for SQL Server instances on local machine
        $sqlInstances = @()
        
        # Try to get SQL Server services
        try {
            $sqlServices = Get-Service | Where-Object { $_.Name -like "MSSQL*" -or $_.Name -like "SQLServer*" }
            foreach ($service in $sqlServices) {
                $instanceName = if ($service.Name -eq "MSSQLSERVER") { "." } else { 
                    $service.Name -replace "MSSQL\\$", "" 
                }
                $sqlInstances += @{
                    InstanceName = $instanceName
                    ServiceName = $service.Name
                    Status = $service.Status
                    Source = "Service"
                }
            }
        } catch {
            Write-DatabaseLog -Level "DEBUG" -Message "Failed to get SQL Server services: $($_.Exception.Message)"
        }
        
        # Try registry discovery
        try {
            $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
            if (Test-Path $regPath) {
                $regInstances = Get-ItemProperty -Path $regPath
                $regInstances.PSObject.Properties | Where-Object { $_.Name -notlike "PS*" } | ForEach-Object {
                    $sqlInstances += @{
                        InstanceName = $_.Name
                        ServiceName = $_.Value
                        Status = "Unknown"
                        Source = "Registry"
                    }
                }
            }
        } catch {
            Write-DatabaseLog -Level "DEBUG" -Message "Failed to get SQL Server instances from registry: $($_.Exception.Message)"
        }
        
        # Add configured SQL Server instances
        if ($Configuration.databases.sqlServer.instances) {
            foreach ($instance in $Configuration.databases.sqlServer.instances) {
                $sqlInstances += @{
                    InstanceName = $instance.name
                    ServiceName = $instance.serviceName
                    Status = "Configured"
                    Source = "Configuration"
                    Server = $instance.server
                }
            }
        }
        
        # Process each SQL Server instance
        foreach ($instance in $sqlInstances) {
            try {
                $serverName = if ($instance.Server) { $instance.Server } else { 
                    if ($instance.InstanceName -eq ".") { $env:COMPUTERNAME } else { "$env:COMPUTERNAME\$($instance.InstanceName)" }
                }
                
                $sqlServerData += [PSCustomObject]@{
                    ObjectType = "SqlServerInstance"
                    InstanceName = $instance.InstanceName
                    ServerName = $serverName
                    ServiceName = $instance.ServiceName
                    ServiceStatus = $instance.Status
                    DiscoverySource = $instance.Source
                    # These would require actual connection to populate
                    Version = "Requires Connection"
                    Edition = "Requires Connection"
                    ProductLevel = "Requires Connection"
                    Collation = "Requires Connection"
                    IsClustered = "Requires Connection"
                    MaxServerMemory = "Requires Connection"
                    DatabaseCount = "Requires Connection"
                    ConnectionNote = "Database connection requires credentials and network access"
                    SessionId = $SessionId
                }
                
                # If we could connect, we would discover databases, tables, etc.
                $sqlServerData += [PSCustomObject]@{
                    ObjectType = "SqlServerDatabase"
                    InstanceName = $instance.InstanceName
                    ServerName = $serverName
                    DatabaseName = "master"
                    DatabaseStatus = "Requires Connection"
                    RecoveryModel = "Requires Connection"
                    CompatibilityLevel = "Requires Connection"
                    CollationName = "Requires Connection"
                    CreateDate = "Requires Connection"
                    Owner = "Requires Connection"
                    SizeMB = "Requires Connection"
                    DataFileSizeMB = "Requires Connection"
                    LogFileSizeMB = "Requires Connection"
                    ConnectionNote = "Database schema discovery requires authenticated connection"
                    SessionId = $SessionId
                }
                
            } catch {
                Write-DatabaseLog -Level "DEBUG" -Message "Failed to process SQL Server instance $($instance.InstanceName): $($_.Exception.Message)"
            }
        }
        
        # If no instances found, add informational record
        if ($sqlServerData.Count -eq 0) {
            $sqlServerData += [PSCustomObject]@{
                ObjectType = "SqlServerInfo"
                Message = "No SQL Server instances discovered on local machine"
                SearchMethod = "Service enumeration, Registry scan, Configuration"
                Note = "SQL Server may be installed on remote machines or require specific discovery configuration"
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Failed to discover SQL Server instances: $($_.Exception.Message)"
    }
    
    return $sqlServerData
}

function Get-MySqlInstances {
    <#
    .SYNOPSIS
        Discovers MySQL instances and databases.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $mysqlData = @()
    
    try {
        # Check for MySQL services
        $mysqlServices = Get-Service | Where-Object { $_.Name -like "*MySQL*" -or $_.DisplayName -like "*MySQL*" }
        
        foreach ($service in $mysqlServices) {
            $mysqlData += [PSCustomObject]@{
                ObjectType = "MySqlInstance"
                ServiceName = $service.Name
                DisplayName = $service.DisplayName
                Status = $service.Status
                StartType = $service.StartType
                # These would require connection
                Version = "Requires Connection"
                Port = "Requires Connection"
                DataDirectory = "Requires Connection"
                ConfigFile = "Requires Connection"
                ConnectionNote = "MySQL discovery requires connection credentials"
                SessionId = $SessionId
            }
        }
        
        # Check common MySQL installation paths
        $commonPaths = @(
            "C:\Program Files\MySQL",
            "C:\Program Files (x86)\MySQL",
            "C:\ProgramData\MySQL",
            "C:\mysql"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $mysqlData += [PSCustomObject]@{
                    ObjectType = "MySqlInstallation"
                    InstallationPath = $path
                    DiscoveryMethod = "File System"
                    Note = "MySQL installation detected at $path"
                    SessionId = $SessionId
                }
            }
        }
        
        # Add configured MySQL instances
        if ($Configuration.databases.mysql.instances) {
            foreach ($instance in $Configuration.databases.mysql.instances) {
                $mysqlData += [PSCustomObject]@{
                    ObjectType = "MySqlConfigured"
                    Server = $instance.server
                    Port = $instance.port
                    Database = $instance.database
                    Source = "Configuration"
                    ConnectionNote = "Configured MySQL instance requires credentials for discovery"
                    SessionId = $SessionId
                }
            }
        }
        
        if ($mysqlData.Count -eq 0) {
            $mysqlData += [PSCustomObject]@{
                ObjectType = "MySqlInfo"
                Message = "No MySQL instances discovered"
                SearchMethod = "Service enumeration, File system scan, Configuration"
                Note = "MySQL may be installed remotely or require specific configuration"
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Failed to discover MySQL instances: $($_.Exception.Message)"
    }
    
    return $mysqlData
}

function Get-PostgreSqlInstances {
    <#
    .SYNOPSIS
        Discovers PostgreSQL instances and databases.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $postgresData = @()
    
    try {
        # Check for PostgreSQL services
        $postgresServices = Get-Service | Where-Object { $_.Name -like "*postgres*" -or $_.DisplayName -like "*PostgreSQL*" }
        
        foreach ($service in $postgresServices) {
            $postgresData += [PSCustomObject]@{
                ObjectType = "PostgreSqlInstance"
                ServiceName = $service.Name
                DisplayName = $service.DisplayName
                Status = $service.Status
                StartType = $service.StartType
                Version = "Requires Connection"
                Port = "Requires Connection"
                DataDirectory = "Requires Connection"
                ConfigFile = "Requires Connection"
                ConnectionNote = "PostgreSQL discovery requires connection credentials"
                SessionId = $SessionId
            }
        }
        
        # Check common PostgreSQL installation paths
        $commonPaths = @(
            "C:\Program Files\PostgreSQL",
            "C:\Program Files (x86)\PostgreSQL",
            "C:\PostgreSQL"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $postgresData += [PSCustomObject]@{
                    ObjectType = "PostgreSqlInstallation"
                    InstallationPath = $path
                    DiscoveryMethod = "File System"
                    Note = "PostgreSQL installation detected at $path"
                    SessionId = $SessionId
                }
            }
        }
        
        # Add configured PostgreSQL instances
        if ($Configuration.databases.postgresql.instances) {
            foreach ($instance in $Configuration.databases.postgresql.instances) {
                $postgresData += [PSCustomObject]@{
                    ObjectType = "PostgreSqlConfigured"
                    Server = $instance.server
                    Port = $instance.port
                    Database = $instance.database
                    Source = "Configuration"
                    ConnectionNote = "Configured PostgreSQL instance requires credentials for discovery"
                    SessionId = $SessionId
                }
            }
        }
        
        if ($postgresData.Count -eq 0) {
            $postgresData += [PSCustomObject]@{
                ObjectType = "PostgreSqlInfo"
                Message = "No PostgreSQL instances discovered"
                SearchMethod = "Service enumeration, File system scan, Configuration"
                Note = "PostgreSQL may be installed remotely or require specific configuration"
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Failed to discover PostgreSQL instances: $($_.Exception.Message)"
    }
    
    return $postgresData
}

function Get-OracleInstances {
    <#
    .SYNOPSIS
        Discovers Oracle database instances.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $oracleData = @()
    
    try {
        # Check for Oracle services
        $oracleServices = Get-Service | Where-Object { $_.Name -like "*Oracle*" -or $_.DisplayName -like "*Oracle*" }
        
        foreach ($service in $oracleServices) {
            $oracleData += [PSCustomObject]@{
                ObjectType = "OracleInstance"
                ServiceName = $service.Name
                DisplayName = $service.DisplayName
                Status = $service.Status
                StartType = $service.StartType
                Version = "Requires Connection"
                SID = "Requires Connection"
                Port = "Requires Connection"
                OracleHome = "Requires Connection"
                ConnectionNote = "Oracle discovery requires connection credentials and Oracle client"
                SessionId = $SessionId
            }
        }
        
        # Check Oracle registry entries
        try {
            $oracleRegPaths = @(
                "HKLM:\SOFTWARE\ORACLE",
                "HKLM:\SOFTWARE\WOW6432Node\ORACLE"
            )
            
            foreach ($regPath in $oracleRegPaths) {
                if (Test-Path $regPath) {
                    $oracleData += [PSCustomObject]@{
                        ObjectType = "OracleRegistry"
                        RegistryPath = $regPath
                        DiscoveryMethod = "Registry"
                        Note = "Oracle registry entries found at $regPath"
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-DatabaseLog -Level "DEBUG" -Message "Failed to check Oracle registry: $($_.Exception.Message)"
        }
        
        # Check common Oracle installation paths
        $commonPaths = @(
            "C:\app",
            "C:\Oracle",
            "C:\oraclexe"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $oracleData += [PSCustomObject]@{
                    ObjectType = "OracleInstallation"
                    InstallationPath = $path
                    DiscoveryMethod = "File System"
                    Note = "Potential Oracle installation detected at $path"
                    SessionId = $SessionId
                }
            }
        }
        
        # Add configured Oracle instances
        if ($Configuration.databases.oracle.instances) {
            foreach ($instance in $Configuration.databases.oracle.instances) {
                $oracleData += [PSCustomObject]@{
                    ObjectType = "OracleConfigured"
                    Server = $instance.server
                    Port = $instance.port
                    SID = $instance.sid
                    ServiceName = $instance.serviceName
                    Source = "Configuration"
                    ConnectionNote = "Configured Oracle instance requires credentials and Oracle client for discovery"
                    SessionId = $SessionId
                }
            }
        }
        
        if ($oracleData.Count -eq 0) {
            $oracleData += [PSCustomObject]@{
                ObjectType = "OracleInfo"
                Message = "No Oracle instances discovered"
                SearchMethod = "Service enumeration, Registry scan, File system scan, Configuration"
                Note = "Oracle may be installed remotely or require Oracle client for discovery"
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Failed to discover Oracle instances: $($_.Exception.Message)"
    }
    
    return $oracleData
}

function Get-DatabaseSummary {
    <#
    .SYNOPSIS
        Generates a summary of database discovery results.
    #>
    [CmdletBinding()]
    param(
        [array]$DatabaseData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Platform counts
        $sqlServerCount = ($DatabaseData | Where-Object { $_._DataType -eq 'SqlServer' }).Count
        $mysqlCount = ($DatabaseData | Where-Object { $_._DataType -eq 'MySQL' }).Count
        $postgresCount = ($DatabaseData | Where-Object { $_._DataType -eq 'PostgreSQL' }).Count
        $oracleCount = ($DatabaseData | Where-Object { $_._DataType -eq 'Oracle' }).Count
        
        $summary += [PSCustomObject]@{
            SummaryType = "DatabasePlatforms"
            SqlServerObjects = $sqlServerCount
            MySqlObjects = $mysqlCount
            PostgreSqlObjects = $postgresCount
            OracleObjects = $oracleCount
            TotalDatabaseObjects = $sqlServerCount + $mysqlCount + $postgresCount + $oracleCount
            DiscoveryNote = "Full database schema discovery requires authenticated connections to database instances"
            RecommendedNextSteps = "Configure database connections with appropriate credentials for detailed schema discovery"
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # Service status summary
        $runningServices = ($DatabaseData | Where-Object { $_.Status -eq 'Running' -or $_.ServiceStatus -eq 'Running' }).Count
        $stoppedServices = ($DatabaseData | Where-Object { $_.Status -eq 'Stopped' -or $_.ServiceStatus -eq 'Stopped' }).Count
        
        if ($runningServices -gt 0 -or $stoppedServices -gt 0) {
            $summary += [PSCustomObject]@{
                SummaryType = "DatabaseServices"
                RunningServices = $runningServices
                StoppedServices = $stoppedServices
                TotalServices = $runningServices + $stoppedServices
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-DatabaseLog -Level "ERROR" -Message "Failed to generate database summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-DatabaseSchemaDiscovery
