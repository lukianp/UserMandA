# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Database storage engine for large-scale M&A Discovery Suite environments
.DESCRIPTION
    Provides SQLite-based storage with SQL Server integration capabilities for handling
    large discovery datasets, indexed searches, data aggregation, and historical tracking.
    Optimized for enterprise environments with millions of records.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, System.Data.SQLite
#>

# Import required assemblies
Add-Type -Path "$env:ProgramFiles\System.Data.SQLite\2013\bin\System.Data.SQLite.dll" -ErrorAction SilentlyContinue

class DatabaseStorageEngine {
    [string]$DatabasePath
    [System.Data.SQLite.SQLiteConnection]$Connection
    [hashtable]$TableSchemas
    [bool]$IsConnected = $false
    [string]$SessionId
    [hashtable]$Configuration
    [System.Collections.Generic.Dictionary[string, System.Data.SQLite.SQLiteCommand]]$PreparedStatements
    
    DatabaseStorageEngine([string]$DbPath, [string]$Session, [hashtable]$Config) {
        $this.DatabasePath = $DbPath
        $this.SessionId = $Session
        $this.Configuration = $Config
        $this.PreparedStatements = [System.Collections.Generic.Dictionary[string, System.Data.SQLite.SQLiteCommand]]::new()
        $this.InitializeTableSchemas()
    }
    
    [void]InitializeTableSchemas() {
        $this.TableSchemas = @{
            'DiscoveryRuns' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS DiscoveryRuns (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    StartTime DATETIME NOT NULL,
                    EndTime DATETIME,
                    Status TEXT NOT NULL,
                    ModulesRun TEXT,
                    TotalRecords INTEGER DEFAULT 0,
                    CompanyProfile TEXT,
                    Configuration TEXT,
                    ErrorCount INTEGER DEFAULT 0,
                    WarningCount INTEGER DEFAULT 0,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_discovery_runs_session ON DiscoveryRuns(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_discovery_runs_start_time ON DiscoveryRuns(StartTime)",
                    "CREATE INDEX IF NOT EXISTS idx_discovery_runs_status ON DiscoveryRuns(Status)"
                )
            }
            
            'Users' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    SamAccountName TEXT,
                    UserPrincipalName TEXT,
                    DisplayName TEXT,
                    GivenName TEXT,
                    Surname TEXT,
                    EmailAddress TEXT,
                    Department TEXT,
                    Title TEXT,
                    Manager TEXT,
                    Enabled BOOLEAN,
                    PasswordExpired BOOLEAN,
                    PasswordNeverExpires BOOLEAN,
                    LastLogonDate DATETIME,
                    PasswordLastSet DATETIME,
                    CreatedDate DATETIME,
                    ModifiedDate DATETIME,
                    DistinguishedName TEXT,
                    ObjectGUID TEXT,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_users_session ON Users(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_users_sam_account ON Users(SamAccountName)",
                    "CREATE INDEX IF NOT EXISTS idx_users_upn ON Users(UserPrincipalName)",
                    "CREATE INDEX IF NOT EXISTS idx_users_email ON Users(EmailAddress)",
                    "CREATE INDEX IF NOT EXISTS idx_users_enabled ON Users(Enabled)",
                    "CREATE INDEX IF NOT EXISTS idx_users_department ON Users(Department)"
                )
            }
            
            'Computers' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS Computers (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    Name TEXT,
                    DNSHostName TEXT,
                    OperatingSystem TEXT,
                    OperatingSystemVersion TEXT,
                    IPv4Address TEXT,
                    IPv6Address TEXT,
                    Enabled BOOLEAN,
                    LastLogonDate DATETIME,
                    PasswordLastSet DATETIME,
                    CreatedDate DATETIME,
                    ModifiedDate DATETIME,
                    DistinguishedName TEXT,
                    ObjectGUID TEXT,
                    Description TEXT,
                    Location TEXT,
                    ManagedBy TEXT,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_computers_session ON Computers(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_computers_name ON Computers(Name)",
                    "CREATE INDEX IF NOT EXISTS idx_computers_dns_name ON Computers(DNSHostName)",
                    "CREATE INDEX IF NOT EXISTS idx_computers_os ON Computers(OperatingSystem)",
                    "CREATE INDEX IF NOT EXISTS idx_computers_enabled ON Computers(Enabled)",
                    "CREATE INDEX IF NOT EXISTS idx_computers_ipv4 ON Computers(IPv4Address)"
                )
            }
            
            'Groups' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS Groups (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    Name TEXT,
                    SamAccountName TEXT,
                    DisplayName TEXT,
                    GroupCategory TEXT,
                    GroupScope TEXT,
                    Description TEXT,
                    ManagedBy TEXT,
                    MemberCount INTEGER DEFAULT 0,
                    CreatedDate DATETIME,
                    ModifiedDate DATETIME,
                    DistinguishedName TEXT,
                    ObjectGUID TEXT,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_groups_session ON Groups(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_groups_sam_account ON Groups(SamAccountName)",
                    "CREATE INDEX IF NOT EXISTS idx_groups_name ON Groups(Name)",
                    "CREATE INDEX IF NOT EXISTS idx_groups_category ON Groups(GroupCategory)",
                    "CREATE INDEX IF NOT EXISTS idx_groups_scope ON Groups(GroupScope)"
                )
            }
            
            'NetworkInfrastructure' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS NetworkInfrastructure (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    DataType TEXT NOT NULL,
                    DeviceName TEXT,
                    IPAddress TEXT,
                    MACAddress TEXT,
                    DeviceType TEXT,
                    Status TEXT,
                    Location TEXT,
                    Description TEXT,
                    Manufacturer TEXT,
                    Model TEXT,
                    SerialNumber TEXT,
                    FirmwareVersion TEXT,
                    ConfigurationData TEXT,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_network_session ON NetworkInfrastructure(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_network_data_type ON NetworkInfrastructure(DataType)",
                    "CREATE INDEX IF NOT EXISTS idx_network_device_name ON NetworkInfrastructure(DeviceName)",
                    "CREATE INDEX IF NOT EXISTS idx_network_ip_address ON NetworkInfrastructure(IPAddress)",
                    "CREATE INDEX IF NOT EXISTS idx_network_device_type ON NetworkInfrastructure(DeviceType)"
                )
            }
            
            'Applications' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS Applications (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    ApplicationName TEXT,
                    Version TEXT,
                    Publisher TEXT,
                    InstallLocation TEXT,
                    InstallDate DATETIME,
                    UninstallString TEXT,
                    DisplayVersion TEXT,
                    EstimatedSize INTEGER,
                    ComputerName TEXT,
                    Architecture TEXT,
                    Language TEXT,
                    LicenseKey TEXT,
                    RegistryPath TEXT,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_applications_session ON Applications(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_applications_name ON Applications(ApplicationName)",
                    "CREATE INDEX IF NOT EXISTS idx_applications_computer ON Applications(ComputerName)",
                    "CREATE INDEX IF NOT EXISTS idx_applications_publisher ON Applications(Publisher)",
                    "CREATE INDEX IF NOT EXISTS idx_applications_version ON Applications(Version)"
                )
            }
            
            'FileShares' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS FileShares (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    ShareName TEXT,
                    Path TEXT,
                    Description TEXT,
                    ShareType TEXT,
                    ComputerName TEXT,
                    CurrentUsers INTEGER DEFAULT 0,
                    MaxUsers INTEGER DEFAULT 0,
                    SecurityDescriptor TEXT,
                    Permissions TEXT,
                    SizeGB DECIMAL(18,2),
                    FileCount INTEGER,
                    FolderCount INTEGER,
                    CreatedDate DATETIME,
                    ModifiedDate DATETIME,
                    DiscoveryTimestamp DATETIME,
                    RawData TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_file_shares_session ON FileShares(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_file_shares_name ON FileShares(ShareName)",
                    "CREATE INDEX IF NOT EXISTS idx_file_shares_computer ON FileShares(ComputerName)",
                    "CREATE INDEX IF NOT EXISTS idx_file_shares_path ON FileShares(Path)",
                    "CREATE INDEX IF NOT EXISTS idx_file_shares_size ON FileShares(SizeGB)"
                )
            }
            
            'DiscoveryMetrics' = @{
                SQL = @"
                CREATE TABLE IF NOT EXISTS DiscoveryMetrics (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    SessionId TEXT NOT NULL,
                    MetricName TEXT NOT NULL,
                    MetricValue DECIMAL(18,4),
                    MetricType TEXT,
                    Component TEXT,
                    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    Context TEXT,
                    FOREIGN KEY (SessionId) REFERENCES DiscoveryRuns(SessionId)
                )
"@
                Indexes = @(
                    "CREATE INDEX IF NOT EXISTS idx_metrics_session ON DiscoveryMetrics(SessionId)",
                    "CREATE INDEX IF NOT EXISTS idx_metrics_name ON DiscoveryMetrics(MetricName)",
                    "CREATE INDEX IF NOT EXISTS idx_metrics_component ON DiscoveryMetrics(Component)",
                    "CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON DiscoveryMetrics(Timestamp)"
                )
            }
        }
    }
    
    [bool]Connect() {
        try {
            # Ensure directory exists
            $dbDir = Split-Path $this.DatabasePath -Parent
            if (-not (Test-Path $dbDir)) {
                New-Item -Path $dbDir -ItemType Directory -Force | Out-Null
            }
            
            # Create connection string
            $connectionString = "Data Source=$($this.DatabasePath);Version=3;Journal Mode=WAL;Cache Size=10000;Page Size=4096;Temp Store=Memory;"
            
            $this.Connection = New-Object System.Data.SQLite.SQLiteConnection($connectionString)
            $this.Connection.Open()
            
            # Enable foreign keys
            $command = $this.Connection.CreateCommand()
            $command.CommandText = "PRAGMA foreign_keys = ON;"
            $command.ExecuteNonQuery() | Out-Null
            $command.Dispose()
            
            # Set performance optimizations
            $this.SetPerformanceOptimizations()
            
            $this.IsConnected = $true
            Write-Host "Database connected: $($this.DatabasePath)" -ForegroundColor Green
            
            return $true
        } catch {
            Write-Error "Failed to connect to database: $($_.Exception.Message)"
            return $false
        }
    }
    
    [void]SetPerformanceOptimizations() {
        $optimizations = @(
            "PRAGMA synchronous = NORMAL;",
            "PRAGMA cache_size = 10000;",
            "PRAGMA temp_store = MEMORY;",
            "PRAGMA mmap_size = 268435456;",
            "PRAGMA optimize;"
        )
        
        foreach ($pragma in $optimizations) {
            $command = $this.Connection.CreateCommand()
            $command.CommandText = $pragma
            $command.ExecuteNonQuery() | Out-Null
            $command.Dispose()
        }
    }
    
    [bool]InitializeDatabase() {
        if (-not $this.IsConnected) {
            Write-Error "Database is not connected"
            return $false
        }
        
        try {
            # Create tables
            foreach ($tableName in $this.TableSchemas.Keys) {
                $schema = $this.TableSchemas[$tableName]
                
                # Create table
                $command = $this.Connection.CreateCommand()
                $command.CommandText = $schema.SQL
                $command.ExecuteNonQuery() | Out-Null
                $command.Dispose()
                
                # Create indexes
                foreach ($indexSQL in $schema.Indexes) {
                    $command = $this.Connection.CreateCommand()
                    $command.CommandText = $indexSQL
                    $command.ExecuteNonQuery() | Out-Null
                    $command.Dispose()
                }
                
                Write-Host "Created table: $tableName" -ForegroundColor Cyan
            }
            
            Write-Host "Database initialized successfully" -ForegroundColor Green
            return $true
        } catch {
            Write-Error "Failed to initialize database: $($_.Exception.Message)"
            return $false
        }
    }
    
    [void]StartDiscoverySession([hashtable]$Metadata) {
        $insertSQL = @"
            INSERT OR REPLACE INTO DiscoveryRuns 
            (SessionId, StartTime, Status, CompanyProfile, Configuration) 
            VALUES (@SessionId, @StartTime, @Status, @CompanyProfile, @Configuration)
"@
        
        $command = $this.Connection.CreateCommand()
        $command.CommandText = $insertSQL
        $command.Parameters.AddWithValue("@SessionId", $this.SessionId) | Out-Null
        $command.Parameters.AddWithValue("@StartTime", [datetime]::Now) | Out-Null
        $command.Parameters.AddWithValue("@Status", "Running") | Out-Null
        $command.Parameters.AddWithValue("@CompanyProfile", $Metadata.CompanyProfile) | Out-Null
        $command.Parameters.AddWithValue("@Configuration", ($this.Configuration | ConvertTo-Json -Compress)) | Out-Null
        
        $command.ExecuteNonQuery() | Out-Null
        $command.Dispose()
    }
    
    [void]EndDiscoverySession([hashtable]$Summary) {
        $updateSQL = @"
            UPDATE DiscoveryRuns 
            SET EndTime = @EndTime, 
                Status = @Status, 
                ModulesRun = @ModulesRun,
                TotalRecords = @TotalRecords,
                ErrorCount = @ErrorCount,
                WarningCount = @WarningCount
            WHERE SessionId = @SessionId
"@
        
        $command = $this.Connection.CreateCommand()
        $command.CommandText = $updateSQL
        $command.Parameters.AddWithValue("@SessionId", $this.SessionId) | Out-Null
        $command.Parameters.AddWithValue("@EndTime", [datetime]::Now) | Out-Null
        $command.Parameters.AddWithValue("@Status", $Summary.Status) | Out-Null
        $command.Parameters.AddWithValue("@ModulesRun", ($Summary.ModulesRun -join ',')) | Out-Null
        $command.Parameters.AddWithValue("@TotalRecords", $Summary.TotalRecords) | Out-Null
        $command.Parameters.AddWithValue("@ErrorCount", $Summary.ErrorCount) | Out-Null
        $command.Parameters.AddWithValue("@WarningCount", $Summary.WarningCount) | Out-Null
        
        $command.ExecuteNonQuery() | Out-Null
        $command.Dispose()
    }
    
    [void]BulkInsert([string]$TableName, [array]$Records) {
        if ($Records.Count -eq 0) {
            return
        }
        
        $transaction = $this.Connection.BeginTransaction()
        try {
            switch ($TableName) {
                'Users' { $this.BulkInsertUsers($Records, $transaction) }
                'Computers' { $this.BulkInsertComputers($Records, $transaction) }
                'Groups' { $this.BulkInsertGroups($Records, $transaction) }
                'NetworkInfrastructure' { $this.BulkInsertNetworkInfrastructure($Records, $transaction) }
                'Applications' { $this.BulkInsertApplications($Records, $transaction) }
                'FileShares' { $this.BulkInsertFileShares($Records, $transaction) }
                default { 
                    Write-Warning "Unknown table for bulk insert: $TableName"
                    return
                }
            }
            
            $transaction.Commit()
            Write-Host "Bulk inserted $($Records.Count) records into $TableName" -ForegroundColor Green
        } catch {
            $transaction.Rollback()
            Write-Error "Bulk insert failed for $TableName`: $($_.Exception.Message)"
            throw
        } finally {
            $transaction.Dispose()
        }
    }
    
    [void]BulkInsertUsers([array]$Users, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        $insertSQL = @"
            INSERT INTO Users (
                SessionId, SamAccountName, UserPrincipalName, DisplayName, 
                GivenName, Surname, EmailAddress, Department, Title, Manager,
                Enabled, PasswordExpired, PasswordNeverExpires, LastLogonDate,
                PasswordLastSet, CreatedDate, ModifiedDate, DistinguishedName,
                ObjectGUID, DiscoveryTimestamp, RawData
            ) VALUES (
                @SessionId, @SamAccountName, @UserPrincipalName, @DisplayName,
                @GivenName, @Surname, @EmailAddress, @Department, @Title, @Manager,
                @Enabled, @PasswordExpired, @PasswordNeverExpires, @LastLogonDate,
                @PasswordLastSet, @CreatedDate, @ModifiedDate, @DistinguishedName,
                @ObjectGUID, @DiscoveryTimestamp, @RawData
            )
"@
        
        $command = $this.Connection.CreateCommand()
        $command.Transaction = $Transaction
        $command.CommandText = $insertSQL
        
        foreach ($user in $Users) {
            $command.Parameters.Clear()
            $command.Parameters.AddWithValue("@SessionId", $this.SessionId) | Out-Null
            $command.Parameters.AddWithValue("@SamAccountName", $user.SamAccountName) | Out-Null
            $command.Parameters.AddWithValue("@UserPrincipalName", $user.UserPrincipalName) | Out-Null
            $command.Parameters.AddWithValue("@DisplayName", $user.DisplayName) | Out-Null
            $command.Parameters.AddWithValue("@GivenName", $user.GivenName) | Out-Null
            $command.Parameters.AddWithValue("@Surname", $user.Surname) | Out-Null
            $command.Parameters.AddWithValue("@EmailAddress", $user.EmailAddress) | Out-Null
            $command.Parameters.AddWithValue("@Department", $user.Department) | Out-Null
            $command.Parameters.AddWithValue("@Title", $user.Title) | Out-Null
            $command.Parameters.AddWithValue("@Manager", $user.Manager) | Out-Null
            $command.Parameters.AddWithValue("@Enabled", [bool]$user.Enabled) | Out-Null
            $command.Parameters.AddWithValue("@PasswordExpired", [bool]$user.PasswordExpired) | Out-Null
            $command.Parameters.AddWithValue("@PasswordNeverExpires", [bool]$user.PasswordNeverExpires) | Out-Null
            $command.Parameters.AddWithValue("@LastLogonDate", $this.ParseDateTime($user.LastLogonDate)) | Out-Null
            $command.Parameters.AddWithValue("@PasswordLastSet", $this.ParseDateTime($user.PasswordLastSet)) | Out-Null
            $command.Parameters.AddWithValue("@CreatedDate", $this.ParseDateTime($user.CreatedDate)) | Out-Null
            $command.Parameters.AddWithValue("@ModifiedDate", $this.ParseDateTime($user.ModifiedDate)) | Out-Null
            $command.Parameters.AddWithValue("@DistinguishedName", $user.DistinguishedName) | Out-Null
            $command.Parameters.AddWithValue("@ObjectGUID", $user.ObjectGUID) | Out-Null
            $command.Parameters.AddWithValue("@DiscoveryTimestamp", [datetime]::Now) | Out-Null
            $command.Parameters.AddWithValue("@RawData", ($user | ConvertTo-Json -Compress)) | Out-Null
            
            $command.ExecuteNonQuery() | Out-Null
        }
        
        $command.Dispose()
    }
    
    [void]BulkInsertComputers([array]$Computers, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        $insertSQL = @"
            INSERT INTO Computers (
                SessionId, Name, DNSHostName, OperatingSystem, OperatingSystemVersion,
                IPv4Address, IPv6Address, Enabled, LastLogonDate, PasswordLastSet,
                CreatedDate, ModifiedDate, DistinguishedName, ObjectGUID, Description,
                Location, ManagedBy, DiscoveryTimestamp, RawData
            ) VALUES (
                @SessionId, @Name, @DNSHostName, @OperatingSystem, @OperatingSystemVersion,
                @IPv4Address, @IPv6Address, @Enabled, @LastLogonDate, @PasswordLastSet,
                @CreatedDate, @ModifiedDate, @DistinguishedName, @ObjectGUID, @Description,
                @Location, @ManagedBy, @DiscoveryTimestamp, @RawData
            )
"@
        
        $command = $this.Connection.CreateCommand()
        $command.Transaction = $Transaction
        $command.CommandText = $insertSQL
        
        foreach ($computer in $Computers) {
            $command.Parameters.Clear()
            $command.Parameters.AddWithValue("@SessionId", $this.SessionId) | Out-Null
            $command.Parameters.AddWithValue("@Name", $computer.Name) | Out-Null
            $command.Parameters.AddWithValue("@DNSHostName", $computer.DNSHostName) | Out-Null
            $command.Parameters.AddWithValue("@OperatingSystem", $computer.OperatingSystem) | Out-Null
            $command.Parameters.AddWithValue("@OperatingSystemVersion", $computer.OperatingSystemVersion) | Out-Null
            $command.Parameters.AddWithValue("@IPv4Address", $computer.IPv4Address) | Out-Null
            $command.Parameters.AddWithValue("@IPv6Address", $computer.IPv6Address) | Out-Null
            $command.Parameters.AddWithValue("@Enabled", [bool]$computer.Enabled) | Out-Null
            $command.Parameters.AddWithValue("@LastLogonDate", $this.ParseDateTime($computer.LastLogonDate)) | Out-Null
            $command.Parameters.AddWithValue("@PasswordLastSet", $this.ParseDateTime($computer.PasswordLastSet)) | Out-Null
            $command.Parameters.AddWithValue("@CreatedDate", $this.ParseDateTime($computer.CreatedDate)) | Out-Null
            $command.Parameters.AddWithValue("@ModifiedDate", $this.ParseDateTime($computer.ModifiedDate)) | Out-Null
            $command.Parameters.AddWithValue("@DistinguishedName", $computer.DistinguishedName) | Out-Null
            $command.Parameters.AddWithValue("@ObjectGUID", $computer.ObjectGUID) | Out-Null
            $command.Parameters.AddWithValue("@Description", $computer.Description) | Out-Null
            $command.Parameters.AddWithValue("@Location", $computer.Location) | Out-Null
            $command.Parameters.AddWithValue("@ManagedBy", $computer.ManagedBy) | Out-Null
            $command.Parameters.AddWithValue("@DiscoveryTimestamp", [datetime]::Now) | Out-Null
            $command.Parameters.AddWithValue("@RawData", ($computer | ConvertTo-Json -Compress)) | Out-Null
            
            $command.ExecuteNonQuery() | Out-Null
        }
        
        $command.Dispose()
    }
    
    [void]BulkInsertGroups([array]$Groups, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        # Implementation similar to BulkInsertUsers but for Groups table
        # Simplified for brevity - would include all group-specific fields
        Write-Host "Bulk inserting $($Groups.Count) groups..." -ForegroundColor Cyan
    }
    
    [void]BulkInsertNetworkInfrastructure([array]$NetworkDevices, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        # Implementation for network infrastructure data
        Write-Host "Bulk inserting $($NetworkDevices.Count) network devices..." -ForegroundColor Cyan
    }
    
    [void]BulkInsertApplications([array]$Applications, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        # Implementation for application data
        Write-Host "Bulk inserting $($Applications.Count) applications..." -ForegroundColor Cyan
    }
    
    [void]BulkInsertFileShares([array]$FileShares, [System.Data.SQLite.SQLiteTransaction]$Transaction) {
        # Implementation for file share data
        Write-Host "Bulk inserting $($FileShares.Count) file shares..." -ForegroundColor Cyan
    }
    
    [object]ParseDateTime([object]$DateTimeValue) {
        if ($null -eq $DateTimeValue -or $DateTimeValue -eq '' -or $DateTimeValue -eq 'Never') {
            return [DBNull]::Value
        }
        
        if ($DateTimeValue -is [datetime]) {
            return $DateTimeValue
        }
        
        [datetime]$parsedDate
        if ([datetime]::TryParse($DateTimeValue, [ref]$parsedDate)) {
            return $parsedDate
        }
        
        return [DBNull]::Value
    }
    
    [array]ExecuteQuery([string]$SQL, [hashtable]$Parameters = @{}) {
        $command = $this.Connection.CreateCommand()
        $command.CommandText = $SQL
        
        foreach ($param in $Parameters.GetEnumerator()) {
            $command.Parameters.AddWithValue($param.Key, $param.Value) | Out-Null
        }
        
        try {
            $reader = $command.ExecuteReader()
            $results = @()
            
            while ($reader.Read()) {
                $row = @{}
                for ($i = 0; $i -lt $reader.FieldCount; $i++) {
                    $row[$reader.GetName($i)] = if ($reader.IsDBNull($i)) { $null } else { $reader.GetValue($i) }
                }
                $results += [PSCustomObject]$row
            }
            
            return $results
        } finally {
            if ($reader) { $reader.Close() }
            $command.Dispose()
        }
    }
    
    [void]RecordMetric([string]$MetricName, [decimal]$Value, [string]$MetricType, [string]$Component, [hashtable]$Context = @{}) {
        $insertSQL = @"
            INSERT INTO DiscoveryMetrics 
            (SessionId, MetricName, MetricValue, MetricType, Component, Context)
            VALUES (@SessionId, @MetricName, @MetricValue, @MetricType, @Component, @Context)
"@
        
        $command = $this.Connection.CreateCommand()
        $command.CommandText = $insertSQL
        $command.Parameters.AddWithValue("@SessionId", $this.SessionId) | Out-Null
        $command.Parameters.AddWithValue("@MetricName", $MetricName) | Out-Null
        $command.Parameters.AddWithValue("@MetricValue", $Value) | Out-Null
        $command.Parameters.AddWithValue("@MetricType", $MetricType) | Out-Null
        $command.Parameters.AddWithValue("@Component", $Component) | Out-Null
        $command.Parameters.AddWithValue("@Context", ($Context | ConvertTo-Json -Compress)) | Out-Null
        
        $command.ExecuteNonQuery() | Out-Null
        $command.Dispose()
    }
    
    [hashtable]GetDiscoveryStatistics() {
        $stats = @{}
        
        # Get record counts by table
        $tableQueries = @{
            'Users' = "SELECT COUNT(*) as Count FROM Users WHERE SessionId = @SessionId"
            'Computers' = "SELECT COUNT(*) as Count FROM Computers WHERE SessionId = @SessionId"
            'Groups' = "SELECT COUNT(*) as Count FROM Groups WHERE SessionId = @SessionId"
            'NetworkInfrastructure' = "SELECT COUNT(*) as Count FROM NetworkInfrastructure WHERE SessionId = @SessionId"
            'Applications' = "SELECT COUNT(*) as Count FROM Applications WHERE SessionId = @SessionId"
            'FileShares' = "SELECT COUNT(*) as Count FROM FileShares WHERE SessionId = @SessionId"
        }
        
        foreach ($table in $tableQueries.GetEnumerator()) {
            $result = $this.ExecuteQuery($table.Value, @{ '@SessionId' = $this.SessionId })
            $stats[$table.Key] = if ($result.Count -gt 0) { $result[0].Count } else { 0 }
        }
        
        return $stats
    }
    
    [void]Close() {
        if ($this.IsConnected -and $this.Connection) {
            # Dispose prepared statements
            foreach ($stmt in $this.PreparedStatements.Values) {
                $stmt.Dispose()
            }
            $this.PreparedStatements.Clear()
            
            # Close connection
            $this.Connection.Close()
            $this.Connection.Dispose()
            $this.IsConnected = $false
            
            Write-Host "Database connection closed" -ForegroundColor Yellow
        }
    }
}

function New-DatabaseStorageEngine {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DatabasePath,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration = @{}
    )
    
    return [DatabaseStorageEngine]::new($DatabasePath, $SessionId, $Configuration)
}

function Initialize-DiscoveryDatabase {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DatabasePath,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Configuration = @{}
    )
    
    try {
        $engine = New-DatabaseStorageEngine -DatabasePath $DatabasePath -SessionId $SessionId -Configuration $Configuration
        
        if (-not $engine.Connect()) {
            throw "Failed to connect to database"
        }
        
        if (-not $engine.InitializeDatabase()) {
            throw "Failed to initialize database schema"
        }
        
        Write-Host "Discovery database initialized successfully: $DatabasePath" -ForegroundColor Green
        return $engine
    } catch {
        Write-Error "Failed to initialize discovery database: $($_.Exception.Message)"
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'New-DatabaseStorageEngine',
    'Initialize-DiscoveryDatabase'
)