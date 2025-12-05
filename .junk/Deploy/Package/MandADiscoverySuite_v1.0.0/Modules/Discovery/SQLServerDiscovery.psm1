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

function Write-SQLServerLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[SQLServer] $Message" -Level $Level -Component "SQLServerDiscovery" -Context $Context
}

function Invoke-SQLServerDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-SQLServerLog -Level "HEADER" -Message "Starting SQL Server Discovery (v5.0 - Enhanced Enterprise Discovery)" -Context $Context
    Write-SQLServerLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('SQLServer')
    } catch {
        Write-SQLServerLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
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

        # Perform SQL Server discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        Write-SQLServerLog -Level "INFO" -Message "Starting comprehensive SQL Server discovery" -Context $Context
        
        # Discovery phase 1: Find SQL Server instances via multiple methods
        $discoveredInstances = Find-SQLServerInstances -Context $Context
        Write-SQLServerLog -Level "INFO" -Message "Found $($discoveredInstances.Count) potential SQL Server instances" -Context $Context
        
        # Discovery phase 2: Collect detailed information for each instance
        foreach ($instance in $discoveredInstances) {
            try {
                $instanceDetails = Get-SQLServerInstanceDetails -Instance $instance -Context $Context
                if ($instanceDetails) {
                    $instanceDetails._DataType = 'SQLServerInstance'
                    $null = $allDiscoveredData.Add($instanceDetails)
                }
            } catch {
                Write-SQLServerLog -Level "WARN" -Message "Failed to get details for instance $($instance.InstanceName): $($_.Exception.Message)" -Context $Context
            }
        }
        
        # Discovery phase 3: Collect database information for accessible instances
        $databaseData = Get-SQLServerDatabaseDetails -Instances $discoveredInstances -Context $Context
        foreach ($database in $databaseData) {
            $database._DataType = 'SQLServerDatabase'
            $null = $allDiscoveredData.Add($database)
        }

        # Export data in GUI-compatible format
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "SQLServer" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Use specific naming for GUI compatibility
                $fileName = switch ($group.Name) {
                    'SQLServerInstance' { 'SqlServers.csv' }
                    'SQLServerDatabase' { 'Databases.csv' }
                    default { "SQLServer_$($group.Name).csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-SQLServerLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        } else {
            Write-SQLServerLog -Level "WARN" -Message "No SQL Server instances or databases discovered" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-SQLServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during SQL Server discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-SQLServerLog -Level "HEADER" -Message "SQL Server discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
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

function Find-SQLServerInstances {
    [CmdletBinding()]
    param(
        [hashtable]$Context
    )
    
    $instances = [System.Collections.ArrayList]::new()
    Write-SQLServerLog -Level "INFO" -Message "Starting SQL Server instance discovery using multiple detection methods" -Context $Context
    
    # Method 1: WMI Service detection
    try {
        Write-SQLServerLog -Level "INFO" -Message "Scanning for SQL Server services via WMI" -Context $Context
        $sqlServices = Get-WmiObject -Class Win32_Service -Filter "Name LIKE 'MSSQL%' OR Name LIKE 'SQL%'" -ErrorAction SilentlyContinue
        
        foreach ($service in $sqlServices) {
            if ($service.Name -match '^MSSQL\$(.+)$' -or $service.Name -eq 'MSSQLSERVER') {
                $instanceName = if ($service.Name -eq 'MSSQLSERVER') { 'MSSQLSERVER' } else { $Matches[1] }
                $instance = [PSCustomObject]@{
                    InstanceName = $instanceName
                    ServiceName = $service.Name
                    ServiceState = $service.State
                    ServiceStatus = $service.Status
                    StartMode = $service.StartMode
                    PathName = $service.PathName
                    DetectionMethod = 'WMI-Service'
                    ComputerName = $env:COMPUTERNAME
                }
                $null = $instances.Add($instance)
                Write-SQLServerLog -Level "INFO" -Message "Found SQL Server instance via WMI: $instanceName ($($service.State))" -Context $Context
            }
        }
    } catch {
        Write-SQLServerLog -Level "WARN" -Message "WMI service detection failed: $($_.Exception.Message)" -Context $Context
    }
    
    # Method 2: Registry scanning
    try {
        Write-SQLServerLog -Level "INFO" -Message "Scanning Windows Registry for SQL Server instances" -Context $Context
        $registryPaths = @(
            'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL',
            'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Microsoft SQL Server\Instance Names\SQL'
        )
        
        foreach ($regPath in $registryPaths) {
            if (Test-Path $regPath) {
                $regInstances = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
                if ($regInstances) {
                    $regInstances.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | ForEach-Object {
                        $instanceName = $_.Name
                        $instanceId = $_.Value
                        
                        # Check if already found
                        if (-not ($instances | Where-Object { $_.InstanceName -eq $instanceName })) {
                            $instance = [PSCustomObject]@{
                                InstanceName = $instanceName
                                InstanceId = $instanceId
                                ServiceName = if ($instanceName -eq 'MSSQLSERVER') { 'MSSQLSERVER' } else { "MSSQL`$$instanceName" }
                                DetectionMethod = 'Registry'
                                ComputerName = $env:COMPUTERNAME
                            }
                            $null = $instances.Add($instance)
                            Write-SQLServerLog -Level "INFO" -Message "Found SQL Server instance via Registry: $instanceName" -Context $Context
                        }
                    }
                }
            }
        }
    } catch {
        Write-SQLServerLog -Level "WARN" -Message "Registry detection failed: $($_.Exception.Message)" -Context $Context
    }
    
    # Method 3: Network protocol detection (SQL Browser service)
    try {
        Write-SQLServerLog -Level "INFO" -Message "Checking SQL Server Browser service for instance enumeration" -Context $Context
        $browserService = Get-Service -Name 'SQLBrowser' -ErrorAction SilentlyContinue
        if ($browserService -and $browserService.Status -eq 'Running') {
            # Note: Actual SSRP protocol implementation would be complex
            # This is a placeholder for detection via SQL Browser
            Write-SQLServerLog -Level "INFO" -Message "SQL Browser service is running - instances may be discoverable via network" -Context $Context
        }
    } catch {
        Write-SQLServerLog -Level "WARN" -Message "SQL Browser detection failed: $($_.Exception.Message)" -Context $Context
    }
    
    Write-SQLServerLog -Level "SUCCESS" -Message "Instance discovery completed. Found $($instances.Count) instances" -Context $Context
    return $instances
}

function Get-SQLServerInstanceDetails {
    [CmdletBinding()]
    param(
        [PSCustomObject]$Instance,
        [hashtable]$Context
    )
    
    Write-SQLServerLog -Level "INFO" -Message "Collecting detailed information for instance: $($Instance.InstanceName)" -Context $Context
    
    try {
        # Build connection string
        $serverName = if ($Instance.InstanceName -eq 'MSSQLSERVER') { 
            $env:COMPUTERNAME 
        } else { 
            "$($env:COMPUTERNAME)\$($Instance.InstanceName)" 
        }
        
        # Try to get version and edition information from registry first
        $versionInfo = Get-SQLServerVersionFromRegistry -InstanceName $Instance.InstanceName -Context $Context
        
        # Get database count and sizes (this will require SQL connection)
        $databaseInfo = Get-SQLServerDatabaseSummary -ServerName $serverName -Context $Context
        
        # Create the instance data object matching GUI expectations
        $instanceData = [PSCustomObject]@{
            Server = $env:COMPUTERNAME
            Instance = $Instance.InstanceName
            Version = $versionInfo.Version
            Edition = $versionInfo.Edition
            DatabaseCount = $databaseInfo.DatabaseCount
            TotalSizeGB = $databaseInfo.TotalSizeGB
            LastSeen = Get-Date
            Engine = 'SQL Server'
            # Additional metadata
            ServiceState = $Instance.ServiceState
            ServiceStatus = $Instance.ServiceStatus
            StartMode = $Instance.StartMode
            DetectionMethod = $Instance.DetectionMethod
            Collation = $versionInfo.Collation
            Authentication = $versionInfo.Authentication
            BackupStatus = $databaseInfo.BackupStatus
        }
        
        Write-SQLServerLog -Level "SUCCESS" -Message "Successfully collected details for instance: $($Instance.InstanceName)" -Context $Context
        return $instanceData
        
    } catch {
        Write-SQLServerLog -Level "ERROR" -Message "Failed to collect details for instance $($Instance.InstanceName): $($_.Exception.Message)" -Context $Context
        
        # Return minimal data for failed instances
        return [PSCustomObject]@{
            Server = $env:COMPUTERNAME
            Instance = $Instance.InstanceName
            Version = 'Unknown'
            Edition = 'Unknown'
            DatabaseCount = 0
            TotalSizeGB = 0
            LastSeen = Get-Date
            Engine = 'SQL Server'
            ServiceState = $Instance.ServiceState
            ServiceStatus = $Instance.ServiceStatus
            DetectionMethod = $Instance.DetectionMethod
            Error = $_.Exception.Message
        }
    }
}

function Get-SQLServerVersionFromRegistry {
    [CmdletBinding()]
    param(
        [string]$InstanceName,
        [hashtable]$Context
    )
    
    $versionInfo = [PSCustomObject]@{
        Version = 'Unknown'
        Edition = 'Unknown'
        Collation = 'Unknown'
        Authentication = 'Unknown'
    }
    
    try {
        # Get instance registry path
        $instanceRegPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
        if (Test-Path $instanceRegPath) {
            $instanceId = (Get-ItemProperty -Path $instanceRegPath -Name $InstanceName -ErrorAction SilentlyContinue).$InstanceName
            
            if ($instanceId) {
                # Get version information
                $setupRegPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceId\Setup"
                if (Test-Path $setupRegPath) {
                    $setupInfo = Get-ItemProperty -Path $setupRegPath -ErrorAction SilentlyContinue
                    if ($setupInfo) {
                        $versionInfo.Version = $setupInfo.Version
                        $versionInfo.Edition = $setupInfo.Edition
                    }
                }
                
                # Get instance-specific settings
                $instanceSetupPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\$instanceId\MSSQLServer"
                if (Test-Path $instanceSetupPath) {
                    $instanceInfo = Get-ItemProperty -Path $instanceSetupPath -ErrorAction SilentlyContinue
                    if ($instanceInfo) {
                        $versionInfo.Collation = $instanceInfo.DefaultData
                        # Authentication mode: 1 = Windows, 2 = Mixed
                        $authMode = $instanceInfo.LoginMode
                        $versionInfo.Authentication = if ($authMode -eq 1) { 'Windows' } elseif ($authMode -eq 2) { 'Mixed' } else { 'Unknown' }
                    }
                }
            }
        }
        
        Write-SQLServerLog -Level "INFO" -Message "Retrieved version info from registry for $InstanceName" -Context $Context
        
    } catch {
        Write-SQLServerLog -Level "WARN" -Message "Failed to get version info from registry for $InstanceName`: $($_.Exception.Message)" -Context $Context
    }
    
    return $versionInfo
}

function Get-SQLServerDatabaseSummary {
    [CmdletBinding()]
    param(
        [string]$ServerName,
        [hashtable]$Context
    )
    
    $summary = [PSCustomObject]@{
        DatabaseCount = 0
        TotalSizeGB = 0
        BackupStatus = 'Unknown'
    }
    
    try {
        # Try to connect using Windows Authentication
        Write-SQLServerLog -Level "INFO" -Message "Attempting to connect to SQL Server: $ServerName" -Context $Context
        
        # Use SqlClient if available, otherwise use SQLCMD or PowerShell SQL modules
        if (Get-Module -ListAvailable -Name 'SqlServer' -ErrorAction SilentlyContinue) {
            Import-Module SqlServer -ErrorAction SilentlyContinue
            
            $query = @"
SELECT 
    COUNT(*) as DatabaseCount,
    CAST(SUM(
        (SELECT SUM(CAST(size AS BIGINT)) * 8 / 1024.0 / 1024.0
         FROM sys.master_files mf 
         WHERE mf.database_id = d.database_id)
    ) AS DECIMAL(10,2)) as TotalSizeGB
FROM sys.databases d
WHERE d.name NOT IN ('master', 'model', 'msdb', 'tempdb')
"@
            
            $result = Invoke-Sqlcmd -ServerInstance $ServerName -Query $query -QueryTimeout 30 -ErrorAction Stop
            if ($result) {
                $summary.DatabaseCount = $result.DatabaseCount
                $summary.TotalSizeGB = $result.TotalSizeGB
                $summary.BackupStatus = 'Connected'
            }
            
        } else {
            # Fallback: Use SQLCMD command line tool
            $sqlcmdResult = & sqlcmd -S $ServerName -E -Q "SELECT COUNT(*) FROM sys.databases WHERE name NOT IN ('master','model','msdb','tempdb')" -h -1 2>$null
            if ($LASTEXITCODE -eq 0 -and $sqlcmdResult) {
                $summary.DatabaseCount = [int]($sqlcmdResult | Where-Object { $_ -match '^\s*\d+\s*$' } | Select-Object -First 1).Trim()
                $summary.BackupStatus = 'Connected'
            }
        }
        
        Write-SQLServerLog -Level "SUCCESS" -Message "Successfully connected to $ServerName - Databases: $($summary.DatabaseCount)" -Context $Context
        
    } catch {
        Write-SQLServerLog -Level "WARN" -Message "Could not connect to SQL Server $ServerName`: $($_.Exception.Message)" -Context $Context
        $summary.BackupStatus = 'Connection Failed'
    }
    
    return $summary
}

function Get-SQLServerDatabaseDetails {
    [CmdletBinding()]
    param(
        [array]$Instances,
        [hashtable]$Context
    )
    
    $databases = [System.Collections.ArrayList]::new()
    Write-SQLServerLog -Level "INFO" -Message "Collecting detailed database information for accessible instances" -Context $Context
    
    foreach ($instance in $Instances) {
        try {
            $serverName = if ($instance.InstanceName -eq 'MSSQLSERVER') { 
                $env:COMPUTERNAME 
            } else { 
                "$($env:COMPUTERNAME)\$($instance.InstanceName)" 
            }
            
            # Try to get detailed database information
            if (Get-Module -ListAvailable -Name 'SqlServer' -ErrorAction SilentlyContinue) {
                Import-Module SqlServer -ErrorAction SilentlyContinue
                
                $query = @"
SELECT 
    d.name as DatabaseName,
    SUSER_SNAME(d.owner_sid) as Owner,
    CAST(SUM(CAST(mf.size AS BIGINT)) * 8 / 1024.0 / 1024.0 AS DECIMAL(10,2)) as SizeGB,
    d.compatibility_level as CompatLevel,
    d.state_desc as Status,
    COALESCE(b.backup_finish_date, '1900-01-01') as LastBackup
FROM sys.databases d
LEFT JOIN sys.master_files mf ON d.database_id = mf.database_id
LEFT JOIN (
    SELECT database_name, MAX(backup_finish_date) as backup_finish_date
    FROM msdb.dbo.backupset 
    WHERE type = 'D'
    GROUP BY database_name
) b ON d.name = b.database_name
WHERE d.name NOT IN ('master', 'model', 'msdb', 'tempdb')
GROUP BY d.name, d.owner_sid, d.compatibility_level, d.state_desc, b.backup_finish_date
ORDER BY d.name
"@
                
                $dbResults = Invoke-Sqlcmd -ServerInstance $serverName -Query $query -QueryTimeout 60 -ErrorAction Stop
                
                foreach ($db in $dbResults) {
                    $dbData = [PSCustomObject]@{
                        Server = $env:COMPUTERNAME
                        Instance = $instance.InstanceName
                        DatabaseName = $db.DatabaseName
                        Owner = $db.Owner
                        SizeGB = $db.SizeGB
                        CompatLevel = $db.CompatLevel
                        Status = $db.Status
                        LastBackup = if ($db.LastBackup -and $db.LastBackup -ne '1900-01-01') { $db.LastBackup } else { $null }
                    }
                    $null = $databases.Add($dbData)
                }
                
                Write-SQLServerLog -Level "SUCCESS" -Message "Collected database details for instance $($instance.InstanceName): $($dbResults.Count) databases" -Context $Context
            }
            
        } catch {
            Write-SQLServerLog -Level "WARN" -Message "Failed to collect database details for instance $($instance.InstanceName): $($_.Exception.Message)" -Context $Context
        }
    }
    
    Write-SQLServerLog -Level "INFO" -Message "Database detail collection completed. Total databases: $($databases.Count)" -Context $Context
    return $databases
}

Export-ModuleMember -Function Invoke-SQLServerDiscovery

