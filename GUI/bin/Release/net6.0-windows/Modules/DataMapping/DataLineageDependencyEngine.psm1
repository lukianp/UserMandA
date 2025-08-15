# M&A Discovery Suite - Data Lineage and Dependency Mapping Engine
# Advanced relationship discovery and dependency visualization across enterprise systems

function Invoke-DataLineageMapping {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory = $false)]
        [string]$InputPath = ".\Output\$CompanyName\RawData",
        
        [Parameter(Mandatory = $false)]
        [string]$OutputPath = ".\Output\$CompanyName\DataLineage",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Database", "Application", "Network", "Infrastructure", "All")]
        [string[]]$MappingTypes = @("All"),
        
        [Parameter(Mandatory = $false)]
        [switch]$GenerateVisualMaps,
        
        [Parameter(Mandatory = $false)]
        [switch]$AnalyzeCriticalPath,
        
        [Parameter(Mandatory = $false)]
        [switch]$DetectCircularDependencies,
        
        [Parameter(Mandatory = $false)]
        [switch]$CalculateRiskScores,
        
        [Parameter(Mandatory = $false)]
        [ValidateRange(1, 10)]
        [int]$DependencyDepth = 5,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\DataLineageMapping.log"
    )
    
    Begin {
        Write-Host "🔗 M&A Discovery Suite - Data Lineage and Dependency Mapping Engine" -ForegroundColor Cyan
        Write-Host "=====================================================================" -ForegroundColor Cyan
        
        # Initialize mapping session
        $session = @{
            CompanyName = $CompanyName
            MappingTypes = if ($MappingTypes -contains "All") { @("Database", "Application", "Network", "Infrastructure") } else { $MappingTypes }
            StartTime = Get-Date
            Entities = @{}
            Relationships = @()
            DependencyGraph = @{}
            CriticalPaths = @()
            CircularDependencies = @()
            RiskAssessments = @{}
            Statistics = @{
                TotalEntities = 0
                TotalRelationships = 0
                MaxDependencyDepth = 0
                CircularDependenciesFound = 0
                HighRiskEntities = 0
            }
        }
        
        # Ensure output directory exists
        if (!(Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        Write-Log "Starting data lineage mapping for $CompanyName" $LogFile
    }
    
    Process {
        try {
            # Load discovery data
            Write-Host "📂 Loading discovery data..." -ForegroundColor Yellow
            $discoveryData = Load-DiscoveryData -InputPath $InputPath
            
            if (!$discoveryData -or $discoveryData.Keys.Count -eq 0) {
                Write-Warning "No discovery data found. Please run discovery first."
                return
            }
            
            # Entity extraction and classification
            Write-Host "🏷️ Extracting and classifying entities..." -ForegroundColor Yellow
            Extract-Entities -Data $discoveryData -Session $session
            
            # Relationship discovery
            Write-Host "🔍 Discovering relationships..." -ForegroundColor Yellow
            foreach ($mappingType in $session.MappingTypes) {
                Write-Host "   📊 Mapping $mappingType dependencies..." -ForegroundColor Green
                
                switch ($mappingType) {
                    "Database" { Discover-DatabaseDependencies -Session $session }
                    "Application" { Discover-ApplicationDependencies -Session $session }
                    "Network" { Discover-NetworkDependencies -Session $session }
                    "Infrastructure" { Discover-InfrastructureDependencies -Session $session }
                }
            }
            
            # Build dependency graph
            Write-Host "🗺️ Building dependency graph..." -ForegroundColor Yellow
            Build-DependencyGraph -Session $session -MaxDepth $DependencyDepth
            
            # Analyze critical paths
            if ($AnalyzeCriticalPath) {
                Write-Host "🎯 Analyzing critical paths..." -ForegroundColor Yellow
                Analyze-CriticalPaths -Session $session
            }
            
            # Detect circular dependencies
            if ($DetectCircularDependencies) {
                Write-Host "🔄 Detecting circular dependencies..." -ForegroundColor Yellow
                Detect-CircularDependencies -Session $session
            }
            
            # Calculate risk scores
            if ($CalculateRiskScores) {
                Write-Host "⚠️ Calculating risk scores..." -ForegroundColor Yellow
                Calculate-DependencyRiskScores -Session $session
            }
            
            # Generate visual maps
            if ($GenerateVisualMaps) {
                Write-Host "🎨 Generating visual dependency maps..." -ForegroundColor Yellow
                Generate-VisualMaps -Session $session -OutputPath $OutputPath
            }
            
            # Export results
            Write-Host "📊 Exporting lineage and dependency data..." -ForegroundColor Yellow
            Export-LineageResults -Session $session -OutputPath $OutputPath
            
            # Display summary
            Display-LineageSummary -Session $session
            
            Write-Host "✅ Data lineage mapping completed successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Data lineage mapping failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Load-DiscoveryData {
    param([string]$InputPath)
    
    $discoveryData = @{}
    
    if (!(Test-Path $InputPath)) {
        return $discoveryData
    }
    
    $csvFiles = Get-ChildItem -Path $InputPath -Filter "*.csv" -Recurse
    
    foreach ($file in $csvFiles) {
        $moduleName = ($file.BaseName -split '_')[0]
        try {
            $data = Import-Csv -Path $file.FullName
            if ($data) {
                $discoveryData[$moduleName] = $data
            }
        }
        catch {
            Write-Warning "Failed to load $($file.Name): $($_.Exception.Message)"
        }
    }
    
    return $discoveryData
}

function Extract-Entities {
    param(
        [hashtable]$Data,
        [hashtable]$Session
    )
    
    $entityId = 1
    
    # Extract Active Directory entities
    if ($Data.ContainsKey("ActiveDirectory")) {
        foreach ($adObject in $Data["ActiveDirectory"]) {
            $entity = @{
                Id = "AD_$entityId"
                Name = $adObject.Name ?? $adObject.SamAccountName ?? "Unknown"
                Type = Get-ADObjectType -Object $adObject
                Category = "Identity"
                Source = "ActiveDirectory"
                Attributes = @{
                    DistinguishedName = $adObject.DistinguishedName
                    ObjectClass = $adObject.ObjectClass
                    WhenCreated = $adObject.WhenCreated
                    WhenChanged = $adObject.WhenChanged
                    Enabled = $adObject.Enabled
                }
                Dependencies = @()
                Dependents = @()
                RiskScore = 0
                CriticalityLevel = "Medium"
            }
            
            $Session.Entities[$entity.Id] = $entity
            $entityId++
        }
    }
    
    # Extract Exchange entities
    if ($Data.ContainsKey("Exchange")) {
        foreach ($exchObject in $Data["Exchange"]) {
            $entity = @{
                Id = "EX_$entityId"
                Name = $exchObject.Name ?? $exchObject.DisplayName ?? "Unknown"
                Type = Get-ExchangeObjectType -Object $exchObject
                Category = "Messaging"
                Source = "Exchange"
                Attributes = @{
                    Database = $exchObject.Database
                    Server = $exchObject.Server
                    PrimarySmtpAddress = $exchObject.PrimarySmtpAddress
                    RecipientType = $exchObject.RecipientType
                    MailboxSize = $exchObject.TotalItemSize
                }
                Dependencies = @()
                Dependents = @()
                RiskScore = 0
                CriticalityLevel = "Medium"
            }
            
            $Session.Entities[$entity.Id] = $entity
            $entityId++
        }
    }
    
    # Extract SQL Server entities
    if ($Data.ContainsKey("SQLServer")) {
        foreach ($sqlObject in $Data["SQLServer"]) {
            $entity = @{
                Id = "SQL_$entityId"
                Name = $sqlObject.Name ?? $sqlObject.DatabaseName ?? "Unknown"
                Type = Get-SQLObjectType -Object $sqlObject
                Category = "Database"
                Source = "SQLServer"
                Attributes = @{
                    ServerName = $sqlObject.ServerName
                    DatabaseName = $sqlObject.DatabaseName
                    Owner = $sqlObject.Owner
                    Size = $sqlObject.Size
                    Status = $sqlObject.Status
                    RecoveryModel = $sqlObject.RecoveryModel
                }
                Dependencies = @()
                Dependents = @()
                RiskScore = 0
                CriticalityLevel = "High"  # Databases are typically critical
            }
            
            $Session.Entities[$entity.Id] = $entity
            $entityId++
        }
    }
    
    # Extract Application entities
    if ($Data.ContainsKey("Applications")) {
        foreach ($appObject in $Data["Applications"]) {
            $entity = @{
                Id = "APP_$entityId"
                Name = $appObject.Name ?? $appObject.DisplayName ?? "Unknown"
                Type = "Application"
                Category = "Application"
                Source = "Applications"
                Attributes = @{
                    Version = $appObject.Version
                    Vendor = $appObject.Publisher
                    InstallDate = $appObject.InstallDate
                    Size = $appObject.Size
                    Location = $appObject.InstallLocation
                }
                Dependencies = @()
                Dependents = @()
                RiskScore = 0
                CriticalityLevel = Get-ApplicationCriticality -App $appObject
            }
            
            $Session.Entities[$entity.Id] = $entity
            $entityId++
        }
    }
    
    # Extract Network entities
    if ($Data.ContainsKey("NetworkInfrastructure")) {
        foreach ($netObject in $Data["NetworkInfrastructure"]) {
            $entity = @{
                Id = "NET_$entityId"
                Name = $netObject.Name ?? $netObject.IPAddress ?? "Unknown"
                Type = Get-NetworkObjectType -Object $netObject
                Category = "Network"
                Source = "NetworkInfrastructure"
                Attributes = @{
                    IPAddress = $netObject.IPAddress
                    MACAddress = $netObject.MACAddress
                    DeviceType = $netObject.DeviceType
                    Location = $netObject.Location
                    Status = $netObject.Status
                }
                Dependencies = @()
                Dependents = @()
                RiskScore = 0
                CriticalityLevel = "High"  # Network infrastructure is typically critical
            }
            
            $Session.Entities[$entity.Id] = $entity
            $entityId++
        }
    }
    
    $Session.Statistics.TotalEntities = $Session.Entities.Keys.Count
    Write-Host "   📈 Extracted $($Session.Statistics.TotalEntities) entities" -ForegroundColor Cyan
}

function Get-ADObjectType {
    param($Object)
    
    if ($Object.ObjectClass -eq "user") { return "User" }
    if ($Object.ObjectClass -eq "group") { return "Group" }
    if ($Object.ObjectClass -eq "computer") { return "Computer" }
    if ($Object.ObjectClass -eq "organizationalUnit") { return "OrganizationalUnit" }
    return "ADObject"
}

function Get-ExchangeObjectType {
    param($Object)
    
    if ($Object.RecipientType -match "Mailbox") { return "Mailbox" }
    if ($Object.RecipientType -match "Group") { return "DistributionGroup" }
    if ($Object.PSObject.Properties.Name -contains "Database") { return "Database" }
    return "ExchangeObject"
}

function Get-SQLObjectType {
    param($Object)
    
    if ($Object.PSObject.Properties.Name -contains "DatabaseName") { return "Database" }
    if ($Object.PSObject.Properties.Name -contains "TableName") { return "Table" }
    if ($Object.PSObject.Properties.Name -contains "InstanceName") { return "Instance" }
    return "SQLObject"
}

function Get-NetworkObjectType {
    param($Object)
    
    if ($Object.DeviceType -match "Switch") { return "Switch" }
    if ($Object.DeviceType -match "Router") { return "Router" }
    if ($Object.DeviceType -match "Firewall") { return "Firewall" }
    if ($Object.DeviceType -match "Server") { return "Server" }
    return "NetworkDevice"
}

function Get-ApplicationCriticality {
    param($App)
    
    $criticalApps = @("SQL Server", "Exchange", "Active Directory", "SharePoint", "Oracle", "SAP")
    $appName = $App.Name ?? $App.DisplayName ?? ""
    
    foreach ($criticalApp in $criticalApps) {
        if ($appName -match $criticalApp) {
            return "Critical"
        }
    }
    
    return "Medium"
}

function Discover-DatabaseDependencies {
    param([hashtable]$Session)
    
    $relationships = @()
    
    # Find database-to-server relationships
    $databases = $Session.Entities.Values | Where-Object { $_.Type -eq "Database" }
    $servers = $Session.Entities.Values | Where-Object { $_.Type -eq "Server" -or $_.Category -eq "Network" }
    
    foreach ($database in $databases) {
        foreach ($server in $servers) {
            if ($database.Attributes.ServerName -and $server.Name -match $database.Attributes.ServerName) {
                $relationship = @{
                    SourceId = $database.Id
                    TargetId = $server.Id
                    Type = "HostedOn"
                    Category = "Infrastructure"
                    Strength = "Strong"
                    Direction = "OneWay"
                    Description = "Database hosted on server"
                    DiscoveredDate = Get-Date
                }
                
                $relationships += $relationship
                $database.Dependencies += $server.Id
                $server.Dependents += $database.Id
            }
        }
    }
    
    # Find application-to-database relationships
    $applications = $Session.Entities.Values | Where-Object { $_.Category -eq "Application" }
    
    foreach ($app in $applications) {
        foreach ($database in $databases) {
            # Look for database connections in application attributes
            if (Test-ApplicationDatabaseConnection -Application $app -Database $database) {
                $relationship = @{
                    SourceId = $app.Id
                    TargetId = $database.Id
                    Type = "ConnectsTo"
                    Category = "Data"
                    Strength = "Strong"
                    Direction = "OneWay"
                    Description = "Application connects to database"
                    DiscoveredDate = Get-Date
                }
                
                $relationships += $relationship
                $app.Dependencies += $database.Id
                $database.Dependents += $app.Id
            }
        }
    }
    
    $Session.Relationships += $relationships
    Write-Host "     ✅ Discovered $($relationships.Count) database dependencies" -ForegroundColor Green
}

function Discover-ApplicationDependencies {
    param([hashtable]$Session)
    
    $relationships = @()
    
    # Find service dependencies
    $applications = $Session.Entities.Values | Where-Object { $_.Category -eq "Application" }
    
    foreach ($app1 in $applications) {
        foreach ($app2 in $applications) {
            if ($app1.Id -ne $app2.Id) {
                # Check for known dependency patterns
                if (Test-ApplicationDependency -App1 $app1 -App2 $app2) {
                    $relationship = @{
                        SourceId = $app1.Id
                        TargetId = $app2.Id
                        Type = "DependsOn"
                        Category = "Application"
                        Strength = "Medium"
                        Direction = "OneWay"
                        Description = "Application dependency"
                        DiscoveredDate = Get-Date
                    }
                    
                    $relationships += $relationship
                    $app1.Dependencies += $app2.Id
                    $app2.Dependents += $app1.Id
                }
            }
        }
    }
    
    $Session.Relationships += $relationships
    Write-Host "     ✅ Discovered $($relationships.Count) application dependencies" -ForegroundColor Green
}

function Discover-NetworkDependencies {
    param([hashtable]$Session)
    
    $relationships = @()
    
    # Find network infrastructure dependencies
    $networkDevices = $Session.Entities.Values | Where-Object { $_.Category -eq "Network" }
    $servers = $Session.Entities.Values | Where-Object { $_.Type -eq "Server" -or $_.Type -eq "Computer" }
    
    foreach ($server in $servers) {
        foreach ($networkDevice in $networkDevices) {
            # Check for network connectivity based on IP ranges
            if (Test-NetworkConnectivity -Server $server -NetworkDevice $networkDevice) {
                $relationship = @{
                    SourceId = $server.Id
                    TargetId = $networkDevice.Id
                    Type = "ConnectedTo"
                    Category = "Network"
                    Strength = "Strong"
                    Direction = "TwoWay"
                    Description = "Network connectivity"
                    DiscoveredDate = Get-Date
                }
                
                $relationships += $relationship
                $server.Dependencies += $networkDevice.Id
                $networkDevice.Dependents += $server.Id
            }
        }
    }
    
    $Session.Relationships += $relationships
    Write-Host "     ✅ Discovered $($relationships.Count) network dependencies" -ForegroundColor Green
}

function Discover-InfrastructureDependencies {
    param([hashtable]$Session)
    
    $relationships = @()
    
    # Find infrastructure service dependencies
    $services = $Session.Entities.Values | Where-Object { $_.Type -match "Service|Server" }
    
    foreach ($service1 in $services) {
        foreach ($service2 in $services) {
            if ($service1.Id -ne $service2.Id) {
                # Check for infrastructure dependencies (DNS, DHCP, Domain Controllers, etc.)
                if (Test-InfrastructureDependency -Service1 $service1 -Service2 $service2) {
                    $relationship = @{
                        SourceId = $service1.Id
                        TargetId = $service2.Id
                        Type = "RequiresService"
                        Category = "Infrastructure"
                        Strength = "Strong"
                        Direction = "OneWay"
                        Description = "Infrastructure service dependency"
                        DiscoveredDate = Get-Date
                    }
                    
                    $relationships += $relationship
                    $service1.Dependencies += $service2.Id
                    $service2.Dependents += $service1.Id
                }
            }
        }
    }
    
    $Session.Relationships += $relationships
    Write-Host "     ✅ Discovered $($relationships.Count) infrastructure dependencies" -ForegroundColor Green
}

function Test-ApplicationDatabaseConnection {
    param($Application, $Database)
    
    # Simplified logic - in practice, this would analyze connection strings, config files, etc.
    $appName = $Application.Name.ToLower()
    $dbName = $Database.Name.ToLower()
    
    # Check for common naming patterns
    if ($appName -match $dbName -or $dbName -match $appName) {
        return $true
    }
    
    # Check for common database connections
    $commonConnections = @{
        "sharepoint" = @("sharepoint", "wss", "moss")
        "exchange" = @("exchange", "mailbox")
        "crm" = @("crm", "dynamics")
        "erp" = @("erp", "sap", "oracle")
    }
    
    foreach ($appPattern in $commonConnections.Keys) {
        if ($appName -match $appPattern) {
            foreach ($dbPattern in $commonConnections[$appPattern]) {
                if ($dbName -match $dbPattern) {
                    return $true
                }
            }
        }
    }
    
    return $false
}

function Test-ApplicationDependency {
    param($App1, $App2)
    
    # Known application dependency patterns
    $dependencyMatrix = @{
        "SharePoint" = @("SQL Server", "IIS", ".NET Framework")
        "Exchange" = @("Active Directory", "IIS", ".NET Framework")
        "Dynamics CRM" = @("SQL Server", "IIS", ".NET Framework", "Active Directory")
        "SAP" = @("SQL Server", "Oracle", "HANA")
    }
    
    $app1Name = $App1.Name
    $app2Name = $App2.Name
    
    foreach ($mainApp in $dependencyMatrix.Keys) {
        if ($app1Name -match $mainApp) {
            foreach ($dependency in $dependencyMatrix[$mainApp]) {
                if ($app2Name -match $dependency) {
                    return $true
                }
            }
        }
    }
    
    return $false
}

function Test-NetworkConnectivity {
    param($Server, $NetworkDevice)
    
    # Simplified network connectivity test based on IP ranges
    $serverIP = $Server.Attributes.IPAddress
    $deviceIP = $NetworkDevice.Attributes.IPAddress
    
    if ($serverIP -and $deviceIP) {
        # Check if they're in the same subnet (simplified)
        $serverNetwork = ($serverIP -split '\.')[0..2] -join '.'
        $deviceNetwork = ($deviceIP -split '\.')[0..2] -join '.'
        
        return $serverNetwork -eq $deviceNetwork
    }
    
    return $false
}

function Test-InfrastructureDependency {
    param($Service1, $Service2)
    
    # Infrastructure dependency patterns
    $infraDependencies = @{
        "Domain Controller" = @("DNS", "Time Service")
        "Exchange Server" = @("Domain Controller", "DNS")
        "SQL Server" = @("Domain Controller", "DNS")
        "Web Server" = @("DNS", "Load Balancer")
        "File Server" = @("Domain Controller", "DNS")
    }
    
    $service1Type = $Service1.Type
    $service2Type = $Service2.Type
    
    foreach ($serviceType in $infraDependencies.Keys) {
        if ($service1Type -match $serviceType) {
            foreach ($dependency in $infraDependencies[$serviceType]) {
                if ($service2Type -match $dependency) {
                    return $true
                }
            }
        }
    }
    
    return $false
}

function Build-DependencyGraph {
    param(
        [hashtable]$Session,
        [int]$MaxDepth
    )
    
    $graph = @{}
    
    # Initialize graph nodes
    foreach ($entityId in $Session.Entities.Keys) {
        $graph[$entityId] = @{
            Entity = $Session.Entities[$entityId]
            DirectDependencies = @()
            AllDependencies = @()
            Depth = 0
            Path = @($entityId)
        }
    }
    
    # Build direct dependencies
    foreach ($relationship in $Session.Relationships) {
        $sourceId = $relationship.SourceId
        $targetId = $relationship.TargetId
        
        if ($graph.ContainsKey($sourceId) -and $graph.ContainsKey($targetId)) {
            $graph[$sourceId].DirectDependencies += @{
                TargetId = $targetId
                Relationship = $relationship
            }
        }
    }
    
    # Calculate dependency depths using breadth-first search
    foreach ($rootId in $graph.Keys) {
        $visited = @{}
        $queue = @(@{ Id = $rootId; Depth = 0; Path = @($rootId) })
        $maxDepthFound = 0
        
        while ($queue.Count -gt 0) {
            $current = $queue[0]
            $queue = $queue[1..($queue.Count-1)]
            
            if ($visited.ContainsKey($current.Id) -or $current.Depth -ge $MaxDepth) {
                continue
            }
            
            $visited[$current.Id] = $true
            $maxDepthFound = [math]::Max($maxDepthFound, $current.Depth)
            
            foreach ($dependency in $graph[$current.Id].DirectDependencies) {
                if (!$visited.ContainsKey($dependency.TargetId)) {
                    $newPath = $current.Path + $dependency.TargetId
                    $queue += @{
                        Id = $dependency.TargetId
                        Depth = $current.Depth + 1
                        Path = $newPath
                    }
                    
                    $graph[$rootId].AllDependencies += @{
                        TargetId = $dependency.TargetId
                        Depth = $current.Depth + 1
                        Path = $newPath
                        Relationship = $dependency.Relationship
                    }
                }
            }
        }
        
        $graph[$rootId].MaxDepth = $maxDepthFound
    }
    
    $Session.DependencyGraph = $graph
    $Session.Statistics.MaxDependencyDepth = ($graph.Values | ForEach-Object { $_.MaxDepth } | Measure-Object -Maximum).Maximum
    $Session.Statistics.TotalRelationships = $Session.Relationships.Count
    
    Write-Host "   📊 Built dependency graph with max depth: $($Session.Statistics.MaxDependencyDepth)" -ForegroundColor Cyan
}

function Analyze-CriticalPaths {
    param([hashtable]$Session)
    
    $criticalPaths = @()
    
    # Find paths to critical entities
    $criticalEntities = $Session.Entities.Values | Where-Object { $_.CriticalityLevel -eq "Critical" }
    
    foreach ($criticalEntity in $criticalEntities) {
        $entityId = $criticalEntity.Id
        $graphNode = $Session.DependencyGraph[$entityId]
        
        # Find entities that depend on this critical entity
        $dependentPaths = @()
        
        foreach ($otherEntityId in $Session.DependencyGraph.Keys) {
            $otherNode = $Session.DependencyGraph[$otherEntityId]
            
            foreach ($dependency in $otherNode.AllDependencies) {
                if ($dependency.TargetId -eq $entityId) {
                    $dependentPaths += @{
                        SourceEntity = $Session.Entities[$otherEntityId]
                        TargetEntity = $criticalEntity
                        Path = $dependency.Path
                        Depth = $dependency.Depth
                        RiskLevel = Calculate-PathRiskLevel -Path $dependency.Path -Session $Session
                    }
                }
            }
        }
        
        if ($dependentPaths.Count -gt 0) {
            $criticalPaths += @{
                CriticalEntity = $criticalEntity
                DependentPaths = $dependentPaths
                TotalDependents = $dependentPaths.Count
                HighRiskPaths = ($dependentPaths | Where-Object { $_.RiskLevel -eq "High" }).Count
            }
        }
    }
    
    $Session.CriticalPaths = $criticalPaths
    Write-Host "   🎯 Identified $($criticalPaths.Count) critical dependency paths" -ForegroundColor Cyan
}

function Detect-CircularDependencies {
    param([hashtable]$Session)
    
    $circularDependencies = @()
    $visited = @{}
    $recursionStack = @{}
    
    function Find-Cycles {
        param([string]$EntityId, [array]$Path)
        
        if ($recursionStack.ContainsKey($EntityId)) {
            # Found a cycle
            $cycleStart = $Path.IndexOf($EntityId)
            $cycle = $Path[$cycleStart..($Path.Count-1)] + $EntityId
            
            return @{
                Cycle = $cycle
                Entities = $cycle | ForEach-Object { $Session.Entities[$_] }
                Length = $cycle.Count - 1
                RiskLevel = "High"  # Circular dependencies are always high risk
            }
        }
        
        if ($visited.ContainsKey($EntityId)) {
            return $null
        }
        
        $visited[$EntityId] = $true
        $recursionStack[$EntityId] = $true
        $currentPath = $Path + $EntityId
        
        if ($Session.DependencyGraph.ContainsKey($EntityId)) {
            foreach ($dependency in $Session.DependencyGraph[$EntityId].DirectDependencies) {
                $cycle = Find-Cycles -EntityId $dependency.TargetId -Path $currentPath
                if ($cycle) {
                    return $cycle
                }
            }
        }
        
        $recursionStack.Remove($EntityId)
        return $null
    }
    
    foreach ($entityId in $Session.Entities.Keys) {
        if (!$visited.ContainsKey($entityId)) {
            $cycle = Find-Cycles -EntityId $entityId -Path @()
            if ($cycle) {
                $circularDependencies += $cycle
            }
        }
    }
    
    $Session.CircularDependencies = $circularDependencies
    $Session.Statistics.CircularDependenciesFound = $circularDependencies.Count
    
    Write-Host "   🔄 Detected $($circularDependencies.Count) circular dependencies" -ForegroundColor $(if ($circularDependencies.Count -gt 0) { "Red" } else { "Green" })
}

function Calculate-DependencyRiskScores {
    param([hashtable]$Session)
    
    foreach ($entityId in $Session.Entities.Keys) {
        $entity = $Session.Entities[$entityId]
        $graphNode = $Session.DependencyGraph[$entityId]
        
        $riskScore = 0
        $riskFactors = @()
        
        # Base risk based on criticality
        switch ($entity.CriticalityLevel) {
            "Critical" { $riskScore += 40; $riskFactors += "Critical system" }
            "High" { $riskScore += 30; $riskFactors += "High importance" }
            "Medium" { $riskScore += 20; $riskFactors += "Medium importance" }
            "Low" { $riskScore += 10; $riskFactors += "Low importance" }
        }
        
        # Risk based on number of dependencies
        $dependencyCount = $graphNode.AllDependencies.Count
        if ($dependencyCount -gt 20) {
            $riskScore += 30
            $riskFactors += "High dependency count ($dependencyCount)"
        } elseif ($dependencyCount -gt 10) {
            $riskScore += 20
            $riskFactors += "Medium dependency count ($dependencyCount)"
        } elseif ($dependencyCount -gt 5) {
            $riskScore += 10
            $riskFactors += "Some dependencies ($dependencyCount)"
        }
        
        # Risk based on number of dependents
        $dependentCount = $entity.Dependents.Count
        if ($dependentCount -gt 20) {
            $riskScore += 25
            $riskFactors += "Many dependents ($dependentCount)"
        } elseif ($dependentCount -gt 10) {
            $riskScore += 15
            $riskFactors += "Several dependents ($dependentCount)"
        }
        
        # Risk based on dependency depth
        if ($graphNode.MaxDepth -gt 5) {
            $riskScore += 15
            $riskFactors += "Deep dependency chain ($($graphNode.MaxDepth))"
        }
        
        # Risk based on circular dependencies
        $circularRisk = $Session.CircularDependencies | Where-Object { $_.Cycle -contains $entityId }
        if ($circularRisk) {
            $riskScore += 35
            $riskFactors += "Part of circular dependency"
        }
        
        # Risk based on entity age (older systems may be more fragile)
        if ($entity.Attributes.WhenCreated) {
            $age = (Get-Date) - [DateTime]$entity.Attributes.WhenCreated
            if ($age.TotalDays -gt 2555) { # > 7 years
                $riskScore += 15
                $riskFactors += "Legacy system ($(([math]::Round($age.TotalDays/365, 1))) years old)"
            }
        }
        
        # Cap risk score at 100
        $riskScore = [math]::Min($riskScore, 100)
        
        $entity.RiskScore = $riskScore
        $entity.RiskFactors = $riskFactors
        $entity.RiskLevel = switch ($riskScore) {
            { $_ -ge 80 } { "Critical" }
            { $_ -ge 60 } { "High" }
            { $_ -ge 40 } { "Medium" }
            default { "Low" }
        }
        
        $Session.RiskAssessments[$entityId] = @{
            Entity = $entity
            RiskScore = $riskScore
            RiskLevel = $entity.RiskLevel
            RiskFactors = $riskFactors
        }
    }
    
    $Session.Statistics.HighRiskEntities = ($Session.Entities.Values | Where-Object { $_.RiskLevel -in @("Critical", "High") }).Count
    
    Write-Host "   ⚠️ Calculated risk scores - $($Session.Statistics.HighRiskEntities) high-risk entities identified" -ForegroundColor Yellow
}

function Calculate-PathRiskLevel {
    param([array]$Path, [hashtable]$Session)
    
    $totalRisk = 0
    $pathLength = $Path.Count
    
    foreach ($entityId in $Path) {
        if ($Session.Entities.ContainsKey($entityId)) {
            $entity = $Session.Entities[$entityId]
            $totalRisk += $entity.RiskScore
        }
    }
    
    $averageRisk = if ($pathLength -gt 0) { $totalRisk / $pathLength } else { 0 }
    
    # Factor in path length (longer paths are riskier)
    $lengthRisk = [math]::Min($pathLength * 5, 25)
    $totalPathRisk = $averageRisk + $lengthRisk
    
    if ($totalPathRisk -ge 70) { return "High" }
    if ($totalPathRisk -ge 40) { return "Medium" }
    return "Low"
}

function Generate-VisualMaps {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    # Generate GraphViz DOT file for dependency visualization
    $dotFile = Join-Path $OutputPath "DependencyGraph_$(Get-Date -Format 'yyyyMMdd_HHmmss').dot"
    $dot = Generate-GraphVizDot -Session $Session
    $dot | Out-File -FilePath $dotFile -Encoding UTF8
    
    # Generate HTML network visualization
    $htmlFile = Join-Path $OutputPath "DependencyVisualization_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    $html = Generate-HTMLVisualization -Session $Session
    $html | Out-File -FilePath $htmlFile -Encoding UTF8
    
    Write-Host "   🎨 Visual maps generated:" -ForegroundColor Green
    Write-Host "      📊 GraphViz DOT: $dotFile" -ForegroundColor Cyan
    Write-Host "      🌐 HTML Visualization: $htmlFile" -ForegroundColor Cyan
}

function Generate-GraphVizDot {
    param([hashtable]$Session)
    
    $dot = @"
digraph DependencyGraph {
    rankdir=TB;
    node [shape=box, style=rounded];
    
"@

    # Add nodes with risk-based coloring
    foreach ($entity in $Session.Entities.Values) {
        $color = switch ($entity.RiskLevel) {
            "Critical" { "red" }
            "High" { "orange" }
            "Medium" { "yellow" }
            "Low" { "lightgreen" }
            default { "lightblue" }
        }
        
        $label = "$($entity.Name)`n($($entity.Type))`nRisk: $($entity.RiskScore)"
        $dot += "    `"$($entity.Id)`" [label=`"$label`", fillcolor=$color, style=filled];`n"
    }
    
    $dot += "`n"
    
    # Add edges
    foreach ($relationship in $Session.Relationships) {
        $style = switch ($relationship.Strength) {
            "Strong" { "solid" }
            "Medium" { "dashed" }
            "Weak" { "dotted" }
            default { "solid" }
        }
        
        $color = switch ($relationship.Category) {
            "Database" { "blue" }
            "Application" { "green" }
            "Network" { "purple" }
            "Infrastructure" { "red" }
            default { "black" }
        }
        
        $dot += "    `"$($relationship.SourceId)`" -> `"$($relationship.TargetId)`" [style=$style, color=$color, label=`"$($relationship.Type)`"];`n"
    }
    
    $dot += "}"
    
    return $dot
}

function Generate-HTMLVisualization {
    param([hashtable]$Session)
    
    # Generate nodes and edges in JSON format for web visualization
    $nodes = @()
    $edges = @()
    
    foreach ($entity in $Session.Entities.Values) {
        $nodes += @{
            id = $entity.Id
            label = $entity.Name
            group = $entity.Category
            title = "$($entity.Name) ($($entity.Type))`nRisk Score: $($entity.RiskScore)`nDependencies: $($entity.Dependencies.Count)`nDependents: $($entity.Dependents.Count)"
            color = switch ($entity.RiskLevel) {
                "Critical" { "#dc3545" }
                "High" { "#fd7e14" }
                "Medium" { "#ffc107" }
                "Low" { "#28a745" }
                default { "#6c757d" }
            }
            size = [math]::Max(10, $entity.RiskScore / 2)
        }
    }
    
    foreach ($relationship in $Session.Relationships) {
        $edges += @{
            from = $relationship.SourceId
            to = $relationship.TargetId
            label = $relationship.Type
            title = "$($relationship.Type) - $($relationship.Category)"
            color = switch ($relationship.Category) {
                "Database" { "#007bff" }
                "Application" { "#28a745" }
                "Network" { "#6f42c1" }
                "Infrastructure" { "#dc3545" }
                default { "#6c757d" }
            }
            width = switch ($relationship.Strength) {
                "Strong" { 3 }
                "Medium" { 2 }
                "Weak" { 1 }
                default { 2 }
            }
        }
    }
    
    $nodesJson = $nodes | ConvertTo-Json -Depth 10
    $edgesJson = $edges | ConvertTo-Json -Depth 10
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Data Lineage and Dependency Visualization - $($Session.CompanyName)</title>
    <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        #network { width: 100%; height: 80vh; border: 1px solid #ccc; }
        .controls { margin: 20px 0; }
        .legend { display: flex; gap: 20px; margin: 20px 0; }
        .legend-item { display: flex; align-items: center; gap: 5px; }
        .legend-color { width: 20px; height: 20px; border-radius: 50%; }
    </style>
</head>
<body>
    <h1>Data Lineage and Dependency Visualization</h1>
    <p><strong>Company:</strong> $($Session.CompanyName) | <strong>Generated:</strong> $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    
    <div class="legend">
        <div class="legend-item">
            <div class="legend-color" style="background: #dc3545;"></div>
            <span>Critical Risk</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #fd7e14;"></div>
            <span>High Risk</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ffc107;"></div>
            <span>Medium Risk</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #28a745;"></div>
            <span>Low Risk</span>
        </div>
    </div>
    
    <div class="controls">
        <button onclick="network.fit()">Fit to Screen</button>
        <button onclick="togglePhysics()">Toggle Physics</button>
        <select onchange="filterByCategory(this.value)">
            <option value="">All Categories</option>
            <option value="Identity">Identity</option>
            <option value="Database">Database</option>
            <option value="Application">Application</option>
            <option value="Network">Network</option>
            <option value="Messaging">Messaging</option>
        </select>
    </div>
    
    <div id="network"></div>
    
    <script>
        const nodes = new vis.DataSet($nodesJson);
        const edges = new vis.DataSet($edgesJson);
        const allNodes = nodes.get();
        const allEdges = edges.get();
        
        const container = document.getElementById('network');
        const data = { nodes: nodes, edges: edges };
        const options = {
            physics: {
                enabled: true,
                stabilization: { iterations: 100 }
            },
            layout: {
                improvedLayout: true
            },
            nodes: {
                font: { size: 12 },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                font: { size: 10 },
                smooth: { type: 'continuous' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };
        
        const network = new vis.Network(container, data, options);
        
        function togglePhysics() {
            const physicsEnabled = network.physics.physicsEnabled;
            network.setOptions({ physics: { enabled: !physicsEnabled } });
        }
        
        function filterByCategory(category) {
            if (category === '') {
                nodes.update(allNodes);
                edges.update(allEdges);
            } else {
                const filteredNodes = allNodes.filter(node => node.group === category);
                const nodeIds = filteredNodes.map(node => node.id);
                const filteredEdges = allEdges.filter(edge => 
                    nodeIds.includes(edge.from) && nodeIds.includes(edge.to)
                );
                
                nodes.update(filteredNodes);
                edges.update(filteredEdges);
            }
            network.fit();
        }
        
        network.on('selectNode', function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                alert('Selected: ' + node.title);
            }
        });
    </script>
</body>
</html>
"@
    
    return $html
}

function Export-LineageResults {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # Export entities
    $entitiesFile = Join-Path $OutputPath "Entities_$timestamp.csv"
    $entitiesData = $Session.Entities.Values | ForEach-Object {
        [PSCustomObject]@{
            Id = $_.Id
            Name = $_.Name
            Type = $_.Type
            Category = $_.Category
            Source = $_.Source
            CriticalityLevel = $_.CriticalityLevel
            RiskScore = $_.RiskScore
            RiskLevel = $_.RiskLevel
            DependencyCount = $_.Dependencies.Count
            DependentCount = $_.Dependents.Count
        }
    }
    $entitiesData | Export-Csv -Path $entitiesFile -NoTypeInformation
    
    # Export relationships
    $relationshipsFile = Join-Path $OutputPath "Relationships_$timestamp.csv"
    $Session.Relationships | Export-Csv -Path $relationshipsFile -NoTypeInformation
    
    # Export risk assessments
    $riskFile = Join-Path $OutputPath "RiskAssessments_$timestamp.csv"
    $riskData = $Session.RiskAssessments.Values | ForEach-Object {
        [PSCustomObject]@{
            EntityId = $_.Entity.Id
            EntityName = $_.Entity.Name
            EntityType = $_.Entity.Type
            RiskScore = $_.RiskScore
            RiskLevel = $_.RiskLevel
            RiskFactors = ($_.RiskFactors -join '; ')
        }
    }
    $riskData | Export-Csv -Path $riskFile -NoTypeInformation
    
    # Export critical paths
    if ($Session.CriticalPaths.Count -gt 0) {
        $criticalPathsFile = Join-Path $OutputPath "CriticalPaths_$timestamp.json"
        $Session.CriticalPaths | ConvertTo-Json -Depth 10 | Out-File -FilePath $criticalPathsFile
    }
    
    # Export circular dependencies
    if ($Session.CircularDependencies.Count -gt 0) {
        $circularDepsFile = Join-Path $OutputPath "CircularDependencies_$timestamp.json"
        $Session.CircularDependencies | ConvertTo-Json -Depth 10 | Out-File -FilePath $circularDepsFile
    }
    
    # Export summary report
    $summaryFile = Join-Path $OutputPath "LineageSummary_$timestamp.html"
    Generate-LineageSummaryReport -Session $Session -OutputPath $summaryFile
    
    Write-Host "   📁 Results exported to:" -ForegroundColor Green
    Write-Host "      📊 Entities: $entitiesFile" -ForegroundColor Cyan
    Write-Host "      🔗 Relationships: $relationshipsFile" -ForegroundColor Cyan
    Write-Host "      ⚠️ Risk Assessments: $riskFile" -ForegroundColor Cyan
    Write-Host "      📄 Summary Report: $summaryFile" -ForegroundColor Cyan
}

function Generate-LineageSummaryReport {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Data Lineage Summary - $($Session.CompanyName)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #dee2e6; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #2c3e50; }
        .section { margin: 20px 0; }
        .risk-critical { color: #dc3545; font-weight: bold; }
        .risk-high { color: #fd7e14; font-weight: bold; }
        .risk-medium { color: #ffc107; }
        .risk-low { color: #28a745; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Data Lineage and Dependency Analysis</h1>
        <p>Company: $($Session.CompanyName)</p>
        <p>Analysis Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">$($Session.Statistics.TotalEntities)</div>
            <div>Total Entities</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$($Session.Statistics.TotalRelationships)</div>
            <div>Total Relationships</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$($Session.Statistics.MaxDependencyDepth)</div>
            <div>Max Dependency Depth</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$($Session.Statistics.HighRiskEntities)</div>
            <div>High Risk Entities</div>
        </div>
    </div>
"@

    if ($Session.CircularDependencies.Count -gt 0) {
        $html += @"
    <div class="section">
        <h2 style="color: #dc3545;">⚠️ Circular Dependencies Detected</h2>
        <p>Found $($Session.CircularDependencies.Count) circular dependencies that require immediate attention:</p>
        <ul>
"@
        foreach ($cycle in $Session.CircularDependencies) {
            $cycleNames = $cycle.Entities | ForEach-Object { $_.Name }
            $html += "            <li>$($cycleNames -join ' → ') (Length: $($cycle.Length))</li>`n"
        }
        $html += "        </ul>`n    </div>`n"
    }

    $highRiskEntities = $Session.Entities.Values | Where-Object { $_.RiskLevel -in @("Critical", "High") } | Sort-Object RiskScore -Descending | Select-Object -First 10
    if ($highRiskEntities.Count -gt 0) {
        $html += @"
    <div class="section">
        <h2>🎯 Top High-Risk Entities</h2>
        <table>
            <thead>
                <tr>
                    <th>Entity Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Dependencies</th>
                    <th>Dependents</th>
                </tr>
            </thead>
            <tbody>
"@
        foreach ($entity in $highRiskEntities) {
            $riskClass = "risk-$($entity.RiskLevel.ToLower())"
            $html += @"
                <tr>
                    <td>$($entity.Name)</td>
                    <td>$($entity.Type)</td>
                    <td>$($entity.Category)</td>
                    <td>$($entity.RiskScore)</td>
                    <td class="$riskClass">$($entity.RiskLevel)</td>
                    <td>$($entity.Dependencies.Count)</td>
                    <td>$($entity.Dependents.Count)</td>
                </tr>
"@
        }
        $html += "            </tbody>`n        </table>`n    </div>`n"
    }

    $categoryStats = $Session.Entities.Values | Group-Object Category | ForEach-Object {
        @{
            Category = $_.Name
            Count = $_.Count
            HighRisk = ($_.Group | Where-Object { $_.RiskLevel -in @("Critical", "High") }).Count
        }
    } | Sort-Object Count -Descending

    $html += @"
    <div class="section">
        <h2>📊 Entity Distribution by Category</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Total Entities</th>
                    <th>High Risk Entities</th>
                    <th>Risk Percentage</th>
                </tr>
            </thead>
            <tbody>
"@
    foreach ($stat in $categoryStats) {
        $riskPercentage = if ($stat.Count -gt 0) { [math]::Round(($stat.HighRisk / $stat.Count) * 100, 1) } else { 0 }
        $html += @"
                <tr>
                    <td>$($stat.Category)</td>
                    <td>$($stat.Count)</td>
                    <td>$($stat.HighRisk)</td>
                    <td>$riskPercentage%</td>
                </tr>
"@
    }
    $html += "            </tbody>`n        </table>`n    </div>`n"

    $html += @"
</body>
</html>
"@
    
    $html | Out-File -FilePath $OutputPath -Encoding UTF8
}

function Display-LineageSummary {
    param([hashtable]$Session)
    
    Write-Host ""
    Write-Host "🔗 Data Lineage and Dependency Analysis Summary:" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "   Total Entities: $($Session.Statistics.TotalEntities)" -ForegroundColor White
    Write-Host "   Total Relationships: $($Session.Statistics.TotalRelationships)" -ForegroundColor White
    Write-Host "   Maximum Dependency Depth: $($Session.Statistics.MaxDependencyDepth)" -ForegroundColor White
    Write-Host "   High-Risk Entities: $($Session.Statistics.HighRiskEntities)" -ForegroundColor Yellow
    
    if ($Session.Statistics.CircularDependenciesFound -gt 0) {
        Write-Host "   ⚠️ Circular Dependencies: $($Session.Statistics.CircularDependenciesFound)" -ForegroundColor Red
    } else {
        Write-Host "   ✅ No Circular Dependencies Found" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "   Entity Distribution:" -ForegroundColor Cyan
    $categoryStats = $Session.Entities.Values | Group-Object Category
    foreach ($category in $categoryStats) {
        Write-Host "      $($category.Name): $($category.Count)" -ForegroundColor White
    }
    
    $duration = (Get-Date) - $Session.StartTime
    Write-Host ""
    Write-Host "   Analysis Duration: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor White
}

function Write-Log {
    param(
        [string]$Message,
        [string]$LogFile
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    try {
        $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
    catch {
        Write-Warning "Could not write to log file: $($_.Exception.Message)"
    }
}

# Export module functions
Export-ModuleMember -Function Invoke-DataLineageMapping

Write-Host "✅ Data Lineage and Dependency Mapping Engine module loaded successfully" -ForegroundColor Green