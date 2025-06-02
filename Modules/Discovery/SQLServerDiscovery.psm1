<#
.SYNOPSIS
    SQL Server infrastructure discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers SQL Server instances, databases, configurations, and dependencies
#>

function Invoke-SQLServerDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting SQL Server infrastructure discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $discoveryResults = @{}
        
        # SQL Instances
        Write-MandALog "Discovering SQL Server instances..." -Level "INFO"
        $discoveryResults.Instances = Get-SQLServerInstances -OutputPath $outputPath -Configuration $Configuration
        
        # SQL Databases
        Write-MandALog "Discovering SQL databases..." -Level "INFO"
        $discoveryResults.Databases = Get-SQLDatabases -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        # SQL Agent Jobs
        Write-MandALog "Discovering SQL Agent jobs..." -Level "INFO"
        $discoveryResults.AgentJobs = Get-SQLAgentJobs -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        # SQL Logins
        Write-MandALog "Discovering SQL logins and permissions..." -Level "INFO"
        $discoveryResults.Logins = Get-SQLLogins -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        # SQL Linked Servers
        Write-MandALog "Discovering SQL linked servers..." -Level "INFO"
        $discoveryResults.LinkedServers = Get-SQLLinkedServers -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        # SQL Maintenance Plans
        Write-MandALog "Discovering SQL maintenance plans..." -Level "INFO"
        $discoveryResults.MaintenancePlans = Get-SQLMaintenancePlans -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        # SQL Configuration
        Write-MandALog "Discovering SQL server configurations..." -Level "INFO"
        $discoveryResults.Configurations = Get-SQLServerConfigurations -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
        
        Write-MandALog "SQL Server discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "SQL Server discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-SQLServerInstances {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "SQLInstances.csv"
    $instancesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Instances CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Discovering SQL Server instances in the domain..." -Level "INFO"
        
        # Method 1: Query AD for SQL Server SPNs
        $spnInstances = Get-SQLInstancesFromSPN -Configuration $Configuration
        
        # Method 2: Check common SQL ports on servers
        $portInstances = Get-SQLInstancesFromPortScan -Configuration $Configuration
        
        # Method 3: Check registry on accessible servers
        $registryInstances = Get-SQLInstancesFromRegistry -Configuration $Configuration
        
        # Merge and deduplicate instances
        $allInstances = @()
        $allInstances += $spnInstances
        $allInstances += $portInstances
        $allInstances += $registryInstances
        
        $uniqueInstances = $allInstances | Sort-Object ServerName, InstanceName -Unique
        
        Write-MandALog "Found $($uniqueInstances.Count) SQL Server instances" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($instance in $uniqueInstances) {
            $processedCount++
            if ($processedCount % 10 -eq 0) {
                Write-Progress -Activity "Processing SQL Instances" -Status "Instance $processedCount of $($uniqueInstances.Count)" -PercentComplete (($processedCount / $uniqueInstances.Count) * 100)
            }
            
            # Get additional instance details
            $instanceDetails = Get-SQLInstanceDetails -Instance $instance
            
            $instancesData.Add([PSCustomObject]@{
                ServerName = $instance.ServerName
                InstanceName = $instance.InstanceName
                FullName = if ($instance.InstanceName -eq "MSSQLSERVER") { $instance.ServerName } else { "$($instance.ServerName)\$($instance.InstanceName)" }
                Version = $instanceDetails.Version
                Edition = $instanceDetails.Edition
                ProductLevel = $instanceDetails.ProductLevel
                Collation = $instanceDetails.Collation
                IsClustered = $instanceDetails.IsClustered
                IsAlwaysOn = $instanceDetails.IsAlwaysOn
                MemoryAllocatedMB = $instanceDetails.MemoryAllocatedMB
                MaxMemoryMB = $instanceDetails.MaxMemoryMB
                CPUCount = $instanceDetails.CPUCount
                Status = $instanceDetails.Status
                StartupType = $instanceDetails.StartupType
                ServiceAccount = $instanceDetails.ServiceAccount
                LastStartTime = $instanceDetails.LastStartTime
                DiscoveryMethod = $instance.DiscoveryMethod
                DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            })
        }
        
        Write-Progress -Activity "Processing SQL Instances" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $instancesData -FilePath $outputFile
        Write-MandALog "Exported $($instancesData.Count) SQL instances to CSV" -Level "SUCCESS"
        
        return $instancesData
        
    } catch {
        Write-MandALog "Error discovering SQL instances: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; InstanceName = $null; FullName = $null; Version = $null
            Edition = $null; ProductLevel = $null; Collation = $null; IsClustered = $null
            IsAlwaysOn = $null; MemoryAllocatedMB = $null; MaxMemoryMB = $null; CPUCount = $null
            Status = $null; StartupType = $null; ServiceAccount = $null; LastStartTime = $null
            DiscoveryMethod = $null; DiscoveryTime = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-SQLInstancesFromSPN {
    param([hashtable]$Configuration)
    
    $instances = @()
    
    try {
        Write-MandALog "Searching for SQL Server SPNs in Active Directory..." -Level "INFO"
        
        # Check if AD module is available
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            Write-MandALog "ActiveDirectory module not available. Skipping SPN discovery." -Level "WARN"
            return @()
        }
        
        Import-Module ActiveDirectory -Force
        
        # FIXED: Use proper LDAP filter syntax
        # Search for computers with MSSQLSvc SPNs
        $spnFilter = "(servicePrincipalName=MSSQLSvc/*)"
        
        try {
            $computers = Get-ADComputer -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
            
            foreach ($computer in $computers) {
                foreach ($spn in $computer.servicePrincipalName) {
                    if ($spn -match "MSSQLSvc/([^:]+):?(\d+)?") {
                        $serverName = $matches[1].Split('.')[0]  # Get just the hostname
                        $port = if ($matches[2]) { $matches[2] } else { "1433" }
                        
                        # Determine instance name from port
                        $instanceName = if ($port -eq "1433") { "MSSQLSERVER" } else { "UNKNOWN" }
                        
                        $instances += [PSCustomObject]@{
                            ServerName = $serverName
                            InstanceName = $instanceName
                            Port = $port
                            DiscoveryMethod = "SPN"
                        }
                    }
                }
            }
        } catch {
            Write-MandALog "Error querying AD computers: $($_.Exception.Message)" -Level "WARN"
        }
        
        # Also check for service accounts with SQL SPNs
        try {
            $users = Get-ADUser -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
            
            foreach ($user in $users) {
                foreach ($spn in $user.servicePrincipalName) {
                    if ($spn -match "MSSQLSvc/([^:]+):?(\d+)?") {
                        $serverName = $matches[1].Split('.')[0]
                        $port = if ($matches[2]) { $matches[2] } else { "1433" }
                        $instanceName = if ($port -eq "1433") { "MSSQLSERVER" } else { "UNKNOWN" }
                        
                        $instances += [PSCustomObject]@{
                            ServerName = $serverName
                            InstanceName = $instanceName
                            Port = $port
                            DiscoveryMethod = "SPN"
                        }
                    }
                }
            }
        } catch {
            Write-MandALog "Error querying AD users: $($_.Exception.Message)" -Level "WARN"
        }
        
        Write-MandALog "Found $($instances.Count) instances via SPN discovery" -Level "INFO"
        
    } catch {
        Write-MandALog "Error during SPN discovery: $($_.Exception.Message)" -Level "WARN"
    }
    
    return $instances
}

function Get-SQLInstancesFromPortScan {
    param([hashtable]$Configuration)
    
    $instances = @()
    
    try {
        Write-MandALog "Scanning for SQL Server instances via common ports..." -Level "INFO"
        
        # Get list of Windows servers from AD
        if (-not (Get-Module -ListAvailable -Name "ActiveDirectory")) {
            return @()
        }
        
        $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties DNSHostName -ErrorAction SilentlyContinue | 
                   Select-Object -First 50  # Limit for performance
        
        $portsToCheck = @(1433, 1434)  # Default SQL ports
        
        foreach ($server in $servers) {
            foreach ($port in $portsToCheck) {
                $result = Test-NetConnection -ComputerName $server.DNSHostName -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
                
                if ($result) {
                    $instanceName = if ($port -eq 1433) { "MSSQLSERVER" } else { "UNKNOWN" }
                    
                    $instances += [PSCustomObject]@{
                        ServerName = $server.Name
                        InstanceName = $instanceName
                        Port = $port
                        DiscoveryMethod = "PortScan"
                    }
                }
            }
        }
        
        Write-MandALog "Found $($instances.Count) instances via port scanning" -Level "INFO"
        
    } catch {
        Write-MandALog "Error during port scan discovery: $($_.Exception.Message)" -Level "WARN"
    }
    
    return $instances
}

function Get-SQLInstancesFromRegistry {
    param([hashtable]$Configuration)
    
    $instances = @()
    
    try {
        Write-MandALog "Checking registry for SQL Server instances..." -Level "INFO"
        
        # This would typically require remote registry access
        # For now, we'll check the local server only
        $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
        
        if (Test-Path $regPath) {
            $instanceKeys = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
            
            foreach ($property in $instanceKeys.PSObject.Properties) {
                if ($property.Name -notin @("PSPath", "PSParentPath", "PSChildName", "PSDrive", "PSProvider")) {
                    $instances += [PSCustomObject]@{
                        ServerName = $env:COMPUTERNAME
                        InstanceName = $property.Name
                        Port = "1433"
                        DiscoveryMethod = "Registry"
                    }
                }
            }
        }
        
        Write-MandALog "Found $($instances.Count) instances via registry" -Level "INFO"
        
    } catch {
        Write-MandALog "Error during registry discovery: $($_.Exception.Message)" -Level "WARN"
    }
    
    return $instances
}

function Get-SQLInstanceDetails {
    param($Instance)
    
    $details = @{
        Version = "Unknown"
        Edition = "Unknown"
        ProductLevel = "Unknown"
        Collation = "Unknown"
        IsClustered = $false
        IsAlwaysOn = $false
        MemoryAllocatedMB = 0
        MaxMemoryMB = 0
        CPUCount = 0
        Status = "Unknown"
        StartupType = "Unknown"
        ServiceAccount = "Unknown"
        LastStartTime = $null
    }
    
    try {
        # Build connection string
        $connectionString = if ($Instance.InstanceName -eq "MSSQLSERVER") {
            "Server=$($Instance.ServerName);Database=master;Integrated Security=True;Connect Timeout=5"
        } else {
            "Server=$($Instance.ServerName)\$($Instance.InstanceName);Database=master;Integrated Security=True;Connect Timeout=5"
        }
        
        # Create connection
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        # Get version info
        $versionQuery = "SELECT 
            SERVERPROPERTY('ProductVersion') AS Version,
            SERVERPROPERTY('Edition') AS Edition,
            SERVERPROPERTY('ProductLevel') AS ProductLevel,
            SERVERPROPERTY('Collation') AS Collation,
            SERVERPROPERTY('IsClustered') AS IsClustered,
            SERVERPROPERTY('IsHadrEnabled') AS IsAlwaysOn"
        
        $command = New-Object System.Data.SqlClient.SqlCommand($versionQuery, $connection)
        $reader = $command.ExecuteReader()
        
        if ($reader.Read()) {
            $details.Version = $reader["Version"]
            $details.Edition = $reader["Edition"]
            $details.ProductLevel = $reader["ProductLevel"]
            $details.Collation = $reader["Collation"]
            $details.IsClustered = [bool]$reader["IsClustered"]
            $details.IsAlwaysOn = [bool]$reader["IsAlwaysOn"]
        }
        $reader.Close()
        
        # Get memory and CPU info
        $resourceQuery = "SELECT 
            (SELECT value_in_use FROM sys.configurations WHERE name = 'max server memory (MB)') AS MaxMemory,
            (SELECT COUNT(*) FROM sys.dm_os_schedulers WHERE status = 'VISIBLE ONLINE') AS CPUCount"
        
        $command = New-Object System.Data.SqlClient.SqlCommand($resourceQuery, $connection)
        $reader = $command.ExecuteReader()
        
        if ($reader.Read()) {
            $details.MaxMemoryMB = $reader["MaxMemory"]
            $details.CPUCount = $reader["CPUCount"]
        }
        $reader.Close()
        
        $connection.Close()
        
        # Get service status via WMI
        try {
            $serviceName = if ($Instance.InstanceName -eq "MSSQLSERVER") { 
                "MSSQLSERVER" 
            } else { 
                "MSSQL`$$($Instance.InstanceName)" 
            }
            
            $service = Get-WmiObject -ComputerName $Instance.ServerName -Class Win32_Service -Filter "Name='$serviceName'" -ErrorAction SilentlyContinue
            
            if ($service) {
                $details.Status = $service.State
                $details.StartupType = $service.StartMode
                $details.ServiceAccount = $service.StartName
            }
        } catch {
            # Ignore WMI errors
        }
        
    } catch {
        Write-MandALog "Could not get details for instance $($Instance.ServerName)\$($Instance.InstanceName): $($_.Exception.Message)" -Level "DEBUG"
    }
    
    return $details
}

function Get-SQLDatabases {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLDatabases.csv"
    $databasesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Databases CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL databases from discovered instances..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                Write-MandALog "Querying databases on $instanceName..." -Level "INFO"
                
                $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                $query = "SELECT 
                    d.database_id,
                    d.name AS DatabaseName,
                    d.state_desc AS State,
                    d.recovery_model_desc AS RecoveryModel,
                    d.compatibility_level AS CompatibilityLevel,
                    d.collation_name AS Collation,
                    d.create_date AS CreateDate,
                    CAST(SUM(mf.size) * 8 / 1024.0 AS DECIMAL(18,2)) AS SizeMB,
                    CAST(SUM(CASE WHEN mf.type = 0 THEN mf.size ELSE 0 END) * 8 / 1024.0 AS DECIMAL(18,2)) AS DataSizeMB,
                    CAST(SUM(CASE WHEN mf.type = 1 THEN mf.size ELSE 0 END) * 8 / 1024.0 AS DECIMAL(18,2)) AS LogSizeMB
                FROM sys.databases d
                INNER JOIN sys.master_files mf ON d.database_id = mf.database_id
                GROUP BY d.database_id, d.name, d.state_desc, d.recovery_model_desc, 
                         d.compatibility_level, d.collation_name, d.create_date
                ORDER BY d.name"
                
                $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
                $dataset = New-Object System.Data.DataSet
                $adapter.Fill($dataset) | Out-Null
                
                foreach ($row in $dataset.Tables[0].Rows) {
                    $databasesData.Add([PSCustomObject]@{
                        InstanceName = $instanceName
                        DatabaseId = $row["database_id"]
                        DatabaseName = $row["DatabaseName"]
                        State = $row["State"]
                        RecoveryModel = $row["RecoveryModel"]
                        CompatibilityLevel = $row["CompatibilityLevel"]
                        Collation = $row["Collation"]
                        CreateDate = $row["CreateDate"]
                        TotalSizeMB = $row["SizeMB"]
                        DataSizeMB = $row["DataSizeMB"]
                        LogSizeMB = $row["LogSizeMB"]
                        LastBackupDate = Get-LastBackupDate -InstanceName $instanceName -DatabaseName $row["DatabaseName"]
                        Owner = Get-DatabaseOwner -InstanceName $instanceName -DatabaseName $row["DatabaseName"]
                        IsSystemDatabase = ($row["database_id"] -le 4)
                        DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    })
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying instance $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($databasesData.Count) databases" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $databasesData -FilePath $outputFile
        Write-MandALog "Exported $($databasesData.Count) SQL databases to CSV" -Level "SUCCESS"
        
        return $databasesData
        
    } catch {
        Write-MandALog "Error retrieving SQL databases: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            InstanceName = $null; DatabaseId = $null; DatabaseName = $null; State = $null
            RecoveryModel = $null; CompatibilityLevel = $null; Collation = $null
            CreateDate = $null; TotalSizeMB = $null; DataSizeMB = $null; LogSizeMB = $null
            LastBackupDate = $null; Owner = $null; IsSystemDatabase = $null; DiscoveryTime = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-LastBackupDate {
    param($InstanceName, $DatabaseName)
    
    try {
        $query = "SELECT MAX(backup_finish_date) AS LastBackup 
                  FROM msdb.dbo.backupset 
                  WHERE database_name = @DatabaseName AND type = 'D'"
        
        $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@DatabaseName", $DatabaseName) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value) { $result } else { $null }
        
    } catch {
        return $null
    }
}

function Get-DatabaseOwner {
    param($InstanceName, $DatabaseName)
    
    try {
        $query = "SELECT SUSER_SNAME(owner_sid) AS Owner FROM sys.databases WHERE name = @DatabaseName"
        
        $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@DatabaseName", $DatabaseName) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value) { $result } else { "Unknown" }
        
    } catch {
        return "Unknown"
    }
}

function Get-SQLAgentJobs {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLAgentJobs.csv"
    $jobsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Agent Jobs CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL Agent jobs..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                $connectionString = "Server=$instanceName;Database=msdb;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                $query = "SELECT 
                    j.job_id,
                    j.name AS JobName,
                    j.enabled AS IsEnabled,
                    j.description,
                    SUSER_SNAME(j.owner_sid) AS Owner,
                    j.date_created AS CreateDate,
                    j.date_modified AS ModifyDate,
                    c.name AS Category,
                    s.freq_type,
                    s.freq_interval,
                    s.freq_subday_type,
                    s.freq_subday_interval,
                    s.freq_relative_interval,
                    s.freq_recurrence_factor,
                    s.active_start_date,
                    s.active_end_date,
                    s.active_start_time,
                    s.active_end_time
                FROM msdb.dbo.sysjobs j
                LEFT JOIN msdb.dbo.syscategories c ON j.category_id = c.category_id
                LEFT JOIN msdb.dbo.sysjobschedules js ON j.job_id = js.job_id
                LEFT JOIN msdb.dbo.sysschedules s ON js.schedule_id = s.schedule_id
                ORDER BY j.name"
                
                $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
                $dataset = New-Object System.Data.DataSet
                $adapter.Fill($dataset) | Out-Null
                
                foreach ($row in $dataset.Tables[0].Rows) {
                    $jobsData.Add([PSCustomObject]@{
                        InstanceName = $instanceName
                        JobId = $row["job_id"]
                        JobName = $row["JobName"]
                        IsEnabled = $row["IsEnabled"]
                        Description = if ($row["description"] -ne [DBNull]::Value) { $row["description"] } else { "" }
                        Owner = $row["Owner"]
                        CreateDate = $row["CreateDate"]
                        ModifyDate = $row["ModifyDate"]
                        Category = $row["Category"]
                        ScheduleType = Get-ScheduleDescription -Row $row
                        LastRunDate = Get-JobLastRunDate -InstanceName $instanceName -JobId $row["job_id"]
                        LastRunStatus = Get-JobLastRunStatus -InstanceName $instanceName -JobId $row["job_id"]
                        DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    })
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying jobs on $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($jobsData.Count) SQL Agent jobs" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $jobsData -FilePath $outputFile
        Write-MandALog "Exported $($jobsData.Count) SQL Agent jobs to CSV" -Level "SUCCESS"
        
        return $jobsData
        
    } catch {
        Write-MandALog "Error retrieving SQL Agent jobs: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            InstanceName = $null; JobId = $null; JobName = $null; IsEnabled = $null
            Description = $null; Owner = $null; CreateDate = $null; ModifyDate = $null
            Category = $null; ScheduleType = $null; LastRunDate = $null
            LastRunStatus = $null; DiscoveryTime = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-ScheduleDescription {
    param($Row)
    
    if ($Row["freq_type"] -eq [DBNull]::Value) {
        return "No Schedule"
    }
    
    $freqType = [int]$Row["freq_type"]
    
    switch ($freqType) {
        1 { return "One Time" }
        4 { return "Daily" }
        8 { return "Weekly" }
        16 { return "Monthly" }
        32 { return "Monthly Relative" }
        64 { return "SQL Agent Start" }
        128 { return "Computer Idle" }
        default { return "Custom" }
    }
}

function Get-JobLastRunDate {
    param($InstanceName, $JobId)
    
    try {
        $query = "SELECT MAX(run_date) AS LastRun FROM msdb.dbo.sysjobhistory WHERE job_id = @JobId AND step_id = 0"
        
        $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@JobId", $JobId) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value -and $result -gt 0) { 
            [DateTime]::ParseExact($result.ToString(), "yyyyMMdd", $null)
        } else { 
            $null 
        }
        
    } catch {
        return $null
    }
}

function Get-JobLastRunStatus {
    param($InstanceName, $JobId)
    
    try {
        $query = "SELECT TOP 1 run_status FROM msdb.dbo.sysjobhistory 
                  WHERE job_id = @JobId AND step_id = 0 
                  ORDER BY run_date DESC, run_time DESC"
        
        $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@JobId", $JobId) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        if ($result -ne [DBNull]::Value) {
            switch ([int]$result) {
                0 { return "Failed" }
                1 { return "Succeeded" }
                2 { return "Retry" }
                3 { return "Canceled" }
                default { return "Unknown" }
            }
        } else {
            return "Never Run"
        }
        
    } catch {
        return "Unknown"
    }
}

function Get-SQLLogins {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLLogins.csv"
    $loginsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Logins CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL logins..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                $query = "SELECT 
                    p.principal_id,
                    p.name AS LoginName,
                    p.type_desc AS LoginType,
                    p.is_disabled AS IsDisabled,
                    p.create_date AS CreateDate,
                    p.modify_date AS ModifyDate,
                    p.default_database_name AS DefaultDatabase,
                    p.default_language_name AS DefaultLanguage,
                    sl.is_policy_checked AS PasswordPolicyEnforced,
                    sl.is_expiration_checked AS PasswordExpirationEnabled,
                    LOGINPROPERTY(p.name, 'PasswordLastSetTime') AS PasswordLastSet,
                    LOGINPROPERTY(p.name, 'DaysUntilExpiration') AS DaysUntilExpiration
                FROM sys.server_principals p
                LEFT JOIN sys.sql_logins sl ON p.principal_id = sl.principal_id
                WHERE p.type IN ('S', 'U', 'G')
                ORDER BY p.name"
                
                $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
                $dataset = New-Object System.Data.DataSet
                $adapter.Fill($dataset) | Out-Null
                
                foreach ($row in $dataset.Tables[0].Rows) {
                    $loginsData.Add([PSCustomObject]@{
                        InstanceName = $instanceName
                        PrincipalId = $row["principal_id"]
                        LoginName = $row["LoginName"]
                        LoginType = $row["LoginType"]
                        IsDisabled = $row["IsDisabled"]
                        CreateDate = $row["CreateDate"]
                        ModifyDate = $row["ModifyDate"]
                        DefaultDatabase = $row["DefaultDatabase"]
                        DefaultLanguage = $row["DefaultLanguage"]
                        PasswordPolicyEnforced = if ($row["PasswordPolicyEnforced"] -ne [DBNull]::Value) { $row["PasswordPolicyEnforced"] } else { $null }
                        PasswordExpirationEnabled = if ($row["PasswordExpirationEnabled"] -ne [DBNull]::Value) { $row["PasswordExpirationEnabled"] } else { $null }
                        PasswordLastSet = if ($row["PasswordLastSet"] -ne [DBNull]::Value) { $row["PasswordLastSet"] } else { $null }
                        DaysUntilExpiration = if ($row["DaysUntilExpiration"] -ne [DBNull]::Value) { $row["DaysUntilExpiration"] } else { $null }
                        ServerRoles = Get-LoginServerRoles -InstanceName $instanceName -PrincipalId $row["principal_id"]
                        DatabaseAccess = Get-LoginDatabaseAccess -InstanceName $instanceName -LoginName $row["LoginName"]
                        DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    })
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying logins on $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($loginsData.Count) SQL logins" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $loginsData -FilePath $outputFile
        Write-MandALog "Exported $($loginsData.Count) SQL logins to CSV" -Level "SUCCESS"
        
        return $loginsData
        
    } catch {
        Write-MandALog "Error retrieving SQL logins: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            InstanceName = $null; PrincipalId = $null; LoginName = $null; LoginType = $null
            IsDisabled = $null; CreateDate = $null; ModifyDate = $null; DefaultDatabase = $null
            DefaultLanguage = $null; PasswordPolicyEnforced = $null; PasswordExpirationEnabled = $null
            PasswordLastSet = $null; DaysUntilExpiration = $null; ServerRoles = $null
            DatabaseAccess = $null; DiscoveryTime = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-LoginServerRoles {
    param($InstanceName, $PrincipalId)
    
    try {
        $query = "SELECT r.name 
                  FROM sys.server_role_members rm
                  JOIN sys.server_principals r ON rm.role_principal_id = r.principal_id
                  WHERE rm.member_principal_id = @PrincipalId"
        
        $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@PrincipalId", $PrincipalId) | Out-Null
        
        $reader = $command.ExecuteReader()
        $roles = @()
        
        while ($reader.Read()) {
            $roles += $reader["name"]
        }
        
        $reader.Close()
        $connection.Close()
        
        return ($roles -join ";")
        
    } catch {
        return ""
    }
}

function Get-LoginDatabaseAccess {
    param($InstanceName, $LoginName)
    
    try {
        $query = "SELECT COUNT(DISTINCT database_id) AS DatabaseCount
                  FROM sys.databases d
                  WHERE HAS_DBACCESS(d.name) = 1
                  AND EXISTS (SELECT 1 FROM sys.database_principals dp 
                             WHERE dp.name = @LoginName)"
        
        $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@LoginName", $LoginName) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value) { [int]$result } else { 0 }
        
    } catch {
        return 0
    }
}

function Get-SQLLinkedServers {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLLinkedServers.csv"
    $linkedServersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Linked Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL linked servers..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                $query = "SELECT 
                    s.server_id,
                    s.name AS LinkedServerName,
                    s.product,
                    s.provider,
                    s.data_source,
                    s.location,
                    s.provider_string,
                    s.catalog,
                    s.connect_timeout,
                    s.query_timeout,
                    s.is_linked,
                    s.is_remote_login_enabled,
                    s.is_rpc_out_enabled,
                    s.is_data_access_enabled,
                    s.is_collation_compatible,
                    s.uses_remote_collation,
                    s.collation_name,
                    s.lazy_schema_validation,
                    s.is_system,
                    s.modify_date
                FROM sys.servers s
                WHERE s.server_id != 0
                ORDER BY s.name"
                
                $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
                $dataset = New-Object System.Data.DataSet
                $adapter.Fill($dataset) | Out-Null
                
                foreach ($row in $dataset.Tables[0].Rows) {
                    $linkedServersData.Add([PSCustomObject]@{
                        InstanceName = $instanceName
                        ServerId = $row["server_id"]
                        LinkedServerName = $row["LinkedServerName"]
                        Product = $row["product"]
                        Provider = $row["provider"]
                        DataSource = $row["data_source"]
                        Location = if ($row["location"] -ne [DBNull]::Value) { $row["location"] } else { "" }
                        ProviderString = if ($row["provider_string"] -ne [DBNull]::Value) { $row["provider_string"] } else { "" }
                        Catalog = if ($row["catalog"] -ne [DBNull]::Value) { $row["catalog"] } else { "" }
                        ConnectTimeout = $row["connect_timeout"]
                        QueryTimeout = $row["query_timeout"]
                        IsLinked = $row["is_linked"]
                        IsRemoteLoginEnabled = $row["is_remote_login_enabled"]
                        IsRpcOutEnabled = $row["is_rpc_out_enabled"]
                        IsDataAccessEnabled = $row["is_data_access_enabled"]
                        IsCollationCompatible = $row["is_collation_compatible"]
                        UsesRemoteCollation = $row["uses_remote_collation"]
                        CollationName = if ($row["collation_name"] -ne [DBNull]::Value) { $row["collation_name"] } else { "" }
                        ModifyDate = $row["modify_date"]
                        LoginMappings = Get-LinkedServerLogins -InstanceName $instanceName -ServerId $row["server_id"]
                        DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    })
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying linked servers on $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($linkedServersData.Count) linked servers" -Level "SUCCESS"
        
        # Only export if we have data
        if ($linkedServersData.Count -gt 0) {
            Export-DataToCSV -Data $linkedServersData -FilePath $outputFile
            Write-MandALog "Exported $($linkedServersData.Count) linked servers to CSV" -Level "SUCCESS"
        } else {
            Write-MandALog "No linked servers found to export" -Level "INFO"
        }
        
        return $linkedServersData
        
    } catch {
        Write-MandALog "Error retrieving linked servers: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-LinkedServerLogins {
    param($InstanceName, $ServerId)
    
    try {
        $query = "SELECT COUNT(*) FROM sys.linked_logins WHERE server_id = @ServerId"
        
        $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@ServerId", $ServerId) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value) { [int]$result } else { 0 }
        
    } catch {
        return 0
    }
}

function Get-SQLMaintenancePlans {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLMaintenancePlans.csv"
    $maintenancePlansData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Maintenance Plans CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL maintenance plans..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                $connectionString = "Server=$instanceName;Database=msdb;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                # Check if maintenance plan tables exist (SSIS required)
                $checkQuery = "SELECT COUNT(*) FROM sys.tables WHERE name = 'sysssispackages'"
                $command = New-Object System.Data.SqlClient.SqlCommand($checkQuery, $connection)
                $tableExists = [int]$command.ExecuteScalar() -gt 0
                
                if ($tableExists) {
                    # FIXED: Use correct column names from sysssispackages table
                    # The 'owner' column should be 'ownersid' and we need to convert it
                    $query = "SELECT 
                        p.id,
                        p.name AS PlanName,
                        p.description,
                        p.createdate AS CreateDate,
                        SUSER_SNAME(p.ownersid) AS Owner,
                        p.packagedata.value('(/DTS:Executable/@DTS:CreationDate)[1]', 'datetime') AS PackageCreateDate,
                        p.packagedata.value('(/DTS:Executable/@DTS:LastModifiedProductVersion)[1]', 'varchar(50)') AS LastModifiedVersion
                    FROM msdb.dbo.sysssispackages p
                    WHERE p.packagetype = 6  -- Maintenance Plans
                    ORDER BY p.name"
                    
                    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
                    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
                    $dataset = New-Object System.Data.DataSet
                    
                    try {
                        $adapter.Fill($dataset) | Out-Null
                        
                        foreach ($row in $dataset.Tables[0].Rows) {
                            $maintenancePlansData.Add([PSCustomObject]@{
                                InstanceName = $instanceName
                                PlanId = $row["id"]
                                PlanName = $row["PlanName"]
                                Description = if ($row["description"] -ne [DBNull]::Value) { $row["description"] } else { "" }
                                CreateDate = $row["CreateDate"]
                                Owner = if ($row["Owner"] -ne [DBNull]::Value) { $row["Owner"] } else { "Unknown" }
                                PackageCreateDate = if ($row["PackageCreateDate"] -ne [DBNull]::Value) { $row["PackageCreateDate"] } else { $null }
                                LastModifiedVersion = if ($row["LastModifiedVersion"] -ne [DBNull]::Value) { $row["LastModifiedVersion"] } else { "" }
                                SubPlans = Get-MaintenanceSubPlans -InstanceName $instanceName -PlanId $row["id"]
                                DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            })
                        }
                    } catch {
                        Write-MandALog "Error executing maintenance plan query on $instanceName`: $($_.Exception.Message)" -Level "WARN"
                    }
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying maintenance plans on $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($maintenancePlansData.Count) maintenance plans" -Level "SUCCESS"
        
        # Only export if we have data
        if ($maintenancePlansData.Count -gt 0) {
            Export-DataToCSV -Data $maintenancePlansData -FilePath $outputFile
            Write-MandALog "Exported $($maintenancePlansData.Count) maintenance plans to CSV" -Level "SUCCESS"
        } else {
            Write-MandALog "No maintenance plans found to export" -Level "INFO"
        }
        
        return $maintenancePlansData
        
    } catch {
        Write-MandALog "Error retrieving maintenance plans: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-MaintenanceSubPlans {
    param($InstanceName, $PlanId)
    
    try {
        $query = "SELECT COUNT(*) FROM msdb.dbo.sysmaintplan_subplans WHERE plan_id = @PlanId"
        
        $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
        $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
        $connection.Open()
        
        $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
        $command.Parameters.AddWithValue("@PlanId", $PlanId) | Out-Null
        $result = $command.ExecuteScalar()
        
        $connection.Close()
        
        return if ($result -ne [DBNull]::Value) { [int]$result } else { 0 }
        
    } catch {
        return 0
    }
}

function Get-SQLServerConfigurations {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration,
        [array]$Instances
    )
    
    $outputFile = Join-Path $OutputPath "SQLConfigurations.csv"
    $configurationsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "SQL Configurations CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving SQL Server configurations..." -Level "INFO"
        
        foreach ($instance in $Instances) {
            try {
                $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") { 
                    $instance.ServerName 
                } else { 
                    "$($instance.ServerName)\$($instance.InstanceName)" 
                }
                
                $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
                $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                $connection.Open()
                
                # Get key configuration values
                $configItems = @(
                    "SELECT 'MaxServerMemory' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'max server memory (MB)'",
                    "SELECT 'MinServerMemory' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'min server memory (MB)'",
                    "SELECT 'MaxDOP' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'max degree of parallelism'",
                    "SELECT 'CostThreshold' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'cost threshold for parallelism'",
                    "SELECT 'BackupCompression' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'backup compression default'",
                    "SELECT 'RemoteAccess' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'remote access'",
                    "SELECT 'CLREnabled' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'clr enabled'",
                    "SELECT 'XPCmdShell' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'xp_cmdshell'",
                    "SELECT 'DatabaseMail' AS ConfigName, value_in_use AS ConfigValue FROM sys.configurations WHERE name = 'Database Mail XPs'",
                    "SELECT 'DefaultBackupPath' AS ConfigName, SERVERPROPERTY('InstanceDefaultBackupPath') AS ConfigValue",
                    "SELECT 'DefaultDataPath' AS ConfigName, SERVERPROPERTY('InstanceDefaultDataPath') AS ConfigValue",
                    "SELECT 'DefaultLogPath' AS ConfigName, SERVERPROPERTY('InstanceDefaultLogPath') AS ConfigValue",
                    "SELECT 'TempDbDataFiles' AS ConfigName, COUNT(*) AS ConfigValue FROM tempdb.sys.database_files WHERE type = 0"
                )
                
                foreach ($configQuery in $configItems) {
                    try {
                        $command = New-Object System.Data.SqlClient.SqlCommand($configQuery, $connection)
                        $reader = $command.ExecuteReader()
                        
                        if ($reader.Read()) {
                            $configurationsData.Add([PSCustomObject]@{
                                InstanceName = $instanceName
                                ConfigurationName = $reader["ConfigName"]
                                ConfigurationValue = if ($reader["ConfigValue"] -ne [DBNull]::Value) { $reader["ConfigValue"].ToString() } else { "NULL" }
                                DiscoveryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                            })
                        }
                        
                        $reader.Close()
                    } catch {
                        # Skip individual config errors
                    }
                }
                
                $connection.Close()
                
            } catch {
                Write-MandALog "Error querying configurations on $($instance.ServerName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Retrieved $($configurationsData.Count) configuration items" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $configurationsData -FilePath $outputFile
        Write-MandALog "Exported $($configurationsData.Count) configuration items to CSV" -Level "SUCCESS"
        
        return $configurationsData
        
    } catch {
        Write-MandALog "Error retrieving SQL configurations: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            InstanceName = $null; ConfigurationName = $null; ConfigurationValue = $null
            DiscoveryTime = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

# Helper function to safely export data
function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog "No data to export to $FilePath" -Level "WARN"
        return
    }
    
    try {
        $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
        Write-MandALog "Exported $($Data.Count) records to $FilePath" -Level "SUCCESS"
    } catch {
        Write-MandALog "Failed to export data to $FilePath`: $($_.Exception.Message)" -Level "ERROR"
    }
}

function Import-DataFromCSV {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-MandALog "CSV file not found: $FilePath" -Level "WARN"
        return @()
    }
    
    try {
        $data = Import-Csv -Path $FilePath -Encoding UTF8
        Write-MandALog "Imported $($data.Count) records from $FilePath" -Level "INFO"
        return $data
    } catch {
        Write-MandALog "Failed to import CSV from $FilePath`: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-SQLServerDiscovery',
    'Get-SQLServerInstances',
    'Get-SQLDatabases',
    'Get-SQLAgentJobs',
    'Get-SQLLogins',
    'Get-SQLLinkedServers',
    'Get-SQLMaintenancePlans',
    'Get-SQLServerConfigurations'
)
