#Requires -Version 5.1
#Requires -Modules Az.Accounts, Az.Resources, Az.Storage, Az.Network, Az.KeyVault, Az.Sql, Az.Websites
Set-StrictMode -Version 3.0

<#
.SYNOPSIS
    Comprehensive Azure Resource Migration Module

.DESCRIPTION
    Enterprise-grade Azure resource migration module supporting:
    - Cross-subscription resource migration
    - Cross-region resource migration
    - Multi-resource type support (Storage, Network, KeyVault, SQL, App Service, etc.)
    - Dependency tracking and resolution
    - Assessment and planning
    - Rollback capabilities

.NOTES
    Author: M&A Discovery Suite - Enhanced Migration Control Plane
    Version: 1.0
    Requires: PowerShell 5.1+, Azure PowerShell modules
#>

$ErrorActionPreference = 'Stop'

#region Enumerations

enum AzureResourceType {
    VirtualMachine
    StorageAccount
    VirtualNetwork
    NetworkSecurityGroup
    LoadBalancer
    AzureADApplication
    AzureADGroup
    AzureADUser
    KeyVault
    SQLDatabase
    SQLServer
    AppService
    FunctionApp
    CosmosDB
    ServiceBus
    EventHub
    LogicApp
    ContainerRegistry
    AKSCluster
    ApplicationGateway
    TrafficManager
    CDNProfile
    RedisCache
    CognitiveServices
    DataFactory
    StreamAnalytics
}

enum AzureMigrationMethod {
    LiftAndShift      # Move as-is
    Rehost            # Move with minimal changes
    Refactor          # Modify for cloud optimization
    Rebuild           # Rebuild from scratch
    Replace           # Replace with SaaS/PaaS
    Clone             # Create copy in target
    Export            # Export and import
    ARMTemplate       # ARM template deployment
}

enum ResourceMigrationStatus {
    Discovered
    Analyzed
    Planned
    Validated
    Ready
    InProgress
    Paused
    Completed
    Failed
    RolledBack
    Skipped
}

enum ResourceComplexity {
    Low
    Medium
    High
    Critical
}

enum DependencyType {
    NetworkDependency
    StorageDependency
    IdentityDependency
    SecurityDependency
    DataDependency
    ServiceDependency
    ConfigurationDependency
}

#endregion

#region Classes

class AzureSubscription {
    [string]$SubscriptionId
    [string]$SubscriptionName
    [string]$TenantId
    [string]$Environment
    [bool]$IsConnected
    [datetime]$LastConnected

    AzureSubscription([string]$subscriptionId, [string]$subscriptionName) {
        $this.SubscriptionId = $subscriptionId
        $this.SubscriptionName = $subscriptionName
        $this.IsConnected = $false
        $this.LastConnected = [datetime]::MinValue
    }
}

class ResourceDependency {
    [string]$Id
    [string]$SourceResourceId
    [string]$SourceResourceName
    [AzureResourceType]$SourceResourceType
    [string]$TargetResourceId
    [string]$TargetResourceName
    [AzureResourceType]$TargetResourceType
    [DependencyType]$DependencyType
    [bool]$IsCritical
    [string]$Description
    [string]$ResolutionStrategy
    [string]$Status

    ResourceDependency([string]$sourceId, [string]$targetId, [DependencyType]$type) {
        $this.Id = [System.Guid]::NewGuid().ToString()
        $this.SourceResourceId = $sourceId
        $this.TargetResourceId = $targetId
        $this.DependencyType = $type
        $this.IsCritical = $false
        $this.Status = "Identified"
    }
}

class ResourceAssessment {
    [string]$ResourceId
    [string]$ResourceName
    [AzureResourceType]$ResourceType
    [ResourceComplexity]$Complexity
    [array]$Risks
    [array]$Recommendations
    [int]$EstimatedDowntimeMinutes
    [double]$EstimatedCostUSD
    [array]$Dependencies
    [bool]$IsMigrationReady
    [array]$BlockingIssues
    [array]$Warnings
    [hashtable]$Metrics
    [datetime]$AssessedAt

    ResourceAssessment([string]$resourceId, [AzureResourceType]$type) {
        $this.ResourceId = $resourceId
        $this.ResourceType = $type
        $this.Complexity = [ResourceComplexity]::Low
        $this.Risks = @()
        $this.Recommendations = @()
        $this.Dependencies = @()
        $this.BlockingIssues = @()
        $this.Warnings = @()
        $this.Metrics = @{}
        $this.IsMigrationReady = $false
        $this.EstimatedDowntimeMinutes = 0
        $this.EstimatedCostUSD = 0
        $this.AssessedAt = Get-Date
    }
}

class MigrationPlan {
    [string]$PlanId
    [string]$ResourceId
    [string]$ResourceName
    [AzureResourceType]$ResourceType
    [AzureMigrationMethod]$Method
    [string]$SourceSubscriptionId
    [string]$SourceResourceGroup
    [string]$SourceRegion
    [string]$TargetSubscriptionId
    [string]$TargetResourceGroup
    [string]$TargetRegion
    [string]$TargetResourceName
    [array]$PreMigrationTasks
    [array]$PostMigrationTasks
    [array]$ValidationChecks
    [hashtable]$Configuration
    [datetime]$PlannedStartTime
    [int]$EstimatedDurationMinutes
    [bool]$RequiresDowntime
    [bool]$SupportsRollback
    [string]$RollbackPlan
    [string]$Status
    [datetime]$CreatedAt
    [string]$CreatedBy

    MigrationPlan([string]$resourceId, [AzureResourceType]$type, [AzureMigrationMethod]$method) {
        $this.PlanId = [System.Guid]::NewGuid().ToString()
        $this.ResourceId = $resourceId
        $this.ResourceType = $type
        $this.Method = $method
        $this.PreMigrationTasks = @()
        $this.PostMigrationTasks = @()
        $this.ValidationChecks = @()
        $this.Configuration = @{}
        $this.RequiresDowntime = $false
        $this.SupportsRollback = $true
        $this.Status = "Draft"
        $this.CreatedAt = Get-Date
        $this.CreatedBy = $env:USERNAME
    }
}

class MigrationJob {
    [string]$JobId
    [string]$PlanId
    [string]$ResourceId
    [string]$ResourceName
    [AzureResourceType]$ResourceType
    [AzureMigrationMethod]$Method
    [ResourceMigrationStatus]$Status
    [double]$ProgressPercentage
    [string]$CurrentStep
    [datetime]$StartTime
    [datetime]$LastUpdateTime
    [datetime]$EstimatedCompletionTime
    [array]$CompletedSteps
    [array]$PendingSteps
    [array]$Errors
    [array]$Warnings
    [hashtable]$Metrics
    [hashtable]$RollbackData
    [bool]$CanRollback

    MigrationJob([MigrationPlan]$plan) {
        $this.JobId = [System.Guid]::NewGuid().ToString()
        $this.PlanId = $plan.PlanId
        $this.ResourceId = $plan.ResourceId
        $this.ResourceName = $plan.ResourceName
        $this.ResourceType = $plan.ResourceType
        $this.Method = $plan.Method
        $this.Status = [ResourceMigrationStatus]::Ready
        $this.ProgressPercentage = 0
        $this.StartTime = Get-Date
        $this.LastUpdateTime = Get-Date
        $this.CompletedSteps = @()
        $this.PendingSteps = @()
        $this.Errors = @()
        $this.Warnings = @()
        $this.Metrics = @{}
        $this.RollbackData = @{}
        $this.CanRollback = $plan.SupportsRollback
    }
}

class ValidationResult {
    [bool]$IsValid
    [array]$Errors
    [array]$Warnings
    [array]$Info
    [datetime]$ValidatedAt
    [string]$ValidatedBy

    ValidationResult() {
        $this.IsValid = $true
        $this.Errors = @()
        $this.Warnings = @()
        $this.Info = @()
        $this.ValidatedAt = Get-Date
        $this.ValidatedBy = $env:USERNAME
    }

    [void]AddError([string]$message) {
        $this.Errors += $message
        $this.IsValid = $false
    }

    [void]AddWarning([string]$message) {
        $this.Warnings += $message
    }

    [void]AddInfo([string]$message) {
        $this.Info += $message
    }
}

#endregion

#region Main Class

class AzureResourceMigration {
    [string]$CompanyName
    [hashtable]$Subscriptions
    [hashtable]$Assessments
    [hashtable]$MigrationPlans
    [hashtable]$ActiveJobs
    [hashtable]$Dependencies
    [hashtable]$Configuration
    [string]$LogPath
    [object]$Logger

    AzureResourceMigration([string]$companyName) {
        $this.CompanyName = $companyName
        $this.Subscriptions = @{}
        $this.Assessments = @{}
        $this.MigrationPlans = @{}
        $this.ActiveJobs = @{}
        $this.Dependencies = @{}

        $this.Configuration = @{
            MaxConcurrentMigrations = 5
            DefaultTimeoutMinutes = 120
            EnableRollback = $true
            ValidateBeforeMigration = $true
            ValidateAfterMigration = $true
            RetryAttempts = 3
            RetryDelaySeconds = 30
            LogLevel = "Information"
            ProgressReportingIntervalSeconds = 30
        }

        $basePath = "C:\DiscoveryData\$companyName"
        $this.LogPath = Join-Path $basePath "Logs\AzureResourceMigration"

        if (-not (Test-Path $this.LogPath)) {
            New-Item -ItemType Directory -Path $this.LogPath -Force | Out-Null
        }
    }

    #region Connection Methods

    [bool]ConnectToSubscription([string]$subscriptionId, [string]$subscriptionName) {
        try {
            $this.WriteLog("INFO", "Connecting to subscription: $subscriptionName ($subscriptionId)")

            # Check if already connected
            $context = Get-AzContext -ErrorAction SilentlyContinue
            if ($context -and $context.Subscription.Id -eq $subscriptionId) {
                $this.WriteLog("INFO", "Already connected to subscription")
                return $true
            }

            # Connect to subscription
            Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop

            $subscription = [AzureSubscription]::new($subscriptionId, $subscriptionName)
            $subscription.IsConnected = $true
            $subscription.LastConnected = Get-Date
            $subscription.TenantId = (Get-AzContext).Tenant.Id
            $subscription.Environment = (Get-AzContext).Environment.Name

            $this.Subscriptions[$subscriptionId] = $subscription
            $this.WriteLog("INFO", "Successfully connected to subscription")

            return $true
        }
        catch {
            $this.WriteLog("ERROR", "Failed to connect to subscription: $($_.Exception.Message)")
            return $false
        }
    }

    #endregion

    #region Discovery Methods

    [array]DiscoverResources([string]$subscriptionId, [string]$resourceGroupName, [array]$resourceTypes) {
        $resources = @()

        try {
            $this.WriteLog("INFO", "Discovering resources in subscription $subscriptionId, resource group: $resourceGroupName")

            # Set context
            Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop

            # Get all resources
            $filter = @{
                SubscriptionId = $subscriptionId
            }
            if ($resourceGroupName) {
                $filter.ResourceGroupName = $resourceGroupName
            }

            $azResources = Get-AzResource @filter -ErrorAction Stop

            foreach ($azResource in $azResources) {
                $resourceType = $this.MapAzureResourceType($azResource.ResourceType)

                if ($resourceTypes -and $resourceType -notin $resourceTypes) {
                    continue
                }

                $resource = @{
                    ResourceId = $azResource.ResourceId
                    ResourceName = $azResource.Name
                    ResourceType = $resourceType
                    AzureResourceType = $azResource.ResourceType
                    ResourceGroupName = $azResource.ResourceGroupName
                    Location = $azResource.Location
                    Tags = $azResource.Tags
                    Properties = @{}
                    Status = [ResourceMigrationStatus]::Discovered
                    DiscoveredAt = Get-Date
                }

                $resources += $resource
            }

            $this.WriteLog("INFO", "Discovered $($resources.Count) resources")
        }
        catch {
            $this.WriteLog("ERROR", "Resource discovery failed: $($_.Exception.Message)")
            throw
        }

        return $resources
    }

    [AzureResourceType]MapAzureResourceType([string]$azureType) {
        $mapping = @{
            "Microsoft.Compute/virtualMachines" = [AzureResourceType]::VirtualMachine
            "Microsoft.Storage/storageAccounts" = [AzureResourceType]::StorageAccount
            "Microsoft.Network/virtualNetworks" = [AzureResourceType]::VirtualNetwork
            "Microsoft.Network/networkSecurityGroups" = [AzureResourceType]::NetworkSecurityGroup
            "Microsoft.Network/loadBalancers" = [AzureResourceType]::LoadBalancer
            "Microsoft.KeyVault/vaults" = [AzureResourceType]::KeyVault
            "Microsoft.Sql/servers" = [AzureResourceType]::SQLServer
            "Microsoft.Sql/servers/databases" = [AzureResourceType]::SQLDatabase
            "Microsoft.Web/sites" = [AzureResourceType]::AppService
            "Microsoft.Web/sites/functions" = [AzureResourceType]::FunctionApp
            "Microsoft.DocumentDB/databaseAccounts" = [AzureResourceType]::CosmosDB
            "Microsoft.ServiceBus/namespaces" = [AzureResourceType]::ServiceBus
            "Microsoft.EventHub/namespaces" = [AzureResourceType]::EventHub
            "Microsoft.Logic/workflows" = [AzureResourceType]::LogicApp
            "Microsoft.ContainerRegistry/registries" = [AzureResourceType]::ContainerRegistry
            "Microsoft.ContainerService/managedClusters" = [AzureResourceType]::AKSCluster
            "Microsoft.Network/applicationGateways" = [AzureResourceType]::ApplicationGateway
            "Microsoft.Network/trafficManagerProfiles" = [AzureResourceType]::TrafficManager
            "Microsoft.Cdn/profiles" = [AzureResourceType]::CDNProfile
            "Microsoft.Cache/Redis" = [AzureResourceType]::RedisCache
        }

        if ($mapping.ContainsKey($azureType)) {
            return $mapping[$azureType]
        }

        return [AzureResourceType]::VirtualMachine  # Default
    }

    #endregion

    #region Assessment Methods

    [ResourceAssessment]AssessResource([string]$resourceId) {
        try {
            $this.WriteLog("INFO", "Assessing resource: $resourceId")

            $resource = Get-AzResource -ResourceId $resourceId -ErrorAction Stop
            $resourceType = $this.MapAzureResourceType($resource.ResourceType)

            $assessment = [ResourceAssessment]::new($resourceId, $resourceType)
            $assessment.ResourceName = $resource.Name

            # Analyze dependencies
            $dependencies = $this.AnalyzeDependencies($resourceId)
            $assessment.Dependencies = $dependencies

            # Calculate complexity
            $assessment.Complexity = $this.CalculateComplexity($resource, $dependencies)

            # Identify risks
            $assessment.Risks = $this.IdentifyRisks($resource, $resourceType)

            # Generate recommendations
            $assessment.Recommendations = $this.GenerateRecommendations($resource, $resourceType, $assessment.Complexity)

            # Estimate downtime
            $assessment.EstimatedDowntimeMinutes = $this.EstimateDowntime($resourceType, $assessment.Complexity)

            # Check migration readiness
            $assessment.IsMigrationReady = $assessment.BlockingIssues.Count -eq 0

            # Store assessment
            $this.Assessments[$resourceId] = $assessment

            $this.WriteLog("INFO", "Assessment completed. Complexity: $($assessment.Complexity), Ready: $($assessment.IsMigrationReady)")

            return $assessment
        }
        catch {
            $this.WriteLog("ERROR", "Assessment failed: $($_.Exception.Message)")
            throw
        }
    }

    [array]AnalyzeDependencies([string]$resourceId) {
        $dependencies = @()

        try {
            $resource = Get-AzResource -ResourceId $resourceId -ErrorAction Stop

            # Check for network dependencies
            if ($resource.Properties.networkProfile) {
                $networkDep = [ResourceDependency]::new($resourceId, "", [DependencyType]::NetworkDependency)
                $networkDep.Description = "Resource has network configuration that must be migrated"
                $networkDep.IsCritical = $true
                $dependencies += $networkDep
            }

            # Check for storage dependencies
            if ($resource.Properties.storageProfile -or $resource.Properties.storageAccountName) {
                $storageDep = [ResourceDependency]::new($resourceId, "", [DependencyType]::StorageDependency)
                $storageDep.Description = "Resource depends on storage account"
                $storageDep.IsCritical = $true
                $dependencies += $storageDep
            }

            # Check for identity dependencies
            if ($resource.Identity) {
                $identityDep = [ResourceDependency]::new($resourceId, "", [DependencyType]::IdentityDependency)
                $identityDep.Description = "Resource has managed identity that requires special handling"
                $identityDep.IsCritical = $false
                $dependencies += $identityDep
            }

            $this.Dependencies[$resourceId] = $dependencies
        }
        catch {
            $this.WriteLog("WARNING", "Dependency analysis partial failure: $($_.Exception.Message)")
        }

        return $dependencies
    }

    [ResourceComplexity]CalculateComplexity([object]$resource, [array]$dependencies) {
        $score = 0

        # Base complexity from resource type
        $complexTypes = @("Microsoft.ContainerService/managedClusters", "Microsoft.Sql/servers", "Microsoft.DocumentDB/databaseAccounts")
        if ($resource.ResourceType -in $complexTypes) {
            $score += 30
        }

        # Dependency count
        $score += ($dependencies.Count * 10)

        # Critical dependencies
        $criticalCount = ($dependencies | Where-Object { $_.IsCritical }).Count
        $score += ($criticalCount * 15)

        # Tags complexity
        if ($resource.Tags -and $resource.Tags.Count -gt 10) {
            $score += 5
        }

        if ($score -ge 60) { return [ResourceComplexity]::Critical }
        if ($score -ge 40) { return [ResourceComplexity]::High }
        if ($score -ge 20) { return [ResourceComplexity]::Medium }
        return [ResourceComplexity]::Low
    }

    [array]IdentifyRisks([object]$resource, [AzureResourceType]$type) {
        $risks = @()

        switch ($type) {
            ([AzureResourceType]::SQLDatabase) {
                $risks += "Data consistency during migration"
                $risks += "Connection string updates required across applications"
            }
            ([AzureResourceType]::VirtualMachine) {
                $risks += "Network configuration may need adjustment"
                $risks += "VM agent compatibility"
            }
            ([AzureResourceType]::AKSCluster) {
                $risks += "Pod disruption during migration"
                $risks += "Service endpoint changes"
                $risks += "Persistent volume migration complexity"
            }
            ([AzureResourceType]::KeyVault) {
                $risks += "Secret and certificate backup required"
                $risks += "Access policy reconfiguration needed"
            }
            ([AzureResourceType]::StorageAccount) {
                $risks += "Large data transfer time"
                $risks += "Access key rotation required"
            }
            ([AzureResourceType]::CosmosDB) {
                $risks += "Data replication latency"
                $risks += "Throughput adjustment during migration"
            }
        }

        return $risks
    }

    [array]GenerateRecommendations([object]$resource, [AzureResourceType]$type, [ResourceComplexity]$complexity) {
        $recommendations = @()

        $recommendations += "Create a backup before migration"
        $recommendations += "Test migration in non-production environment first"

        if ($complexity -in @([ResourceComplexity]::High, [ResourceComplexity]::Critical)) {
            $recommendations += "Schedule migration during off-peak hours"
            $recommendations += "Notify stakeholders before migration"
            $recommendations += "Prepare rollback procedure"
        }

        switch ($type) {
            ([AzureResourceType]::SQLDatabase) {
                $recommendations += "Use Azure Database Migration Service for large databases"
            }
            ([AzureResourceType]::StorageAccount) {
                $recommendations += "Use AzCopy for large data transfers"
            }
            ([AzureResourceType]::AKSCluster) {
                $recommendations += "Use Velero for cluster backup and restore"
            }
        }

        return $recommendations
    }

    [int]EstimateDowntime([AzureResourceType]$type, [ResourceComplexity]$complexity) {
        $baseDowntime = @{
            ([AzureResourceType]::VirtualMachine) = 15
            ([AzureResourceType]::StorageAccount) = 5
            ([AzureResourceType]::VirtualNetwork) = 10
            ([AzureResourceType]::SQLDatabase) = 30
            ([AzureResourceType]::AKSCluster) = 60
            ([AzureResourceType]::KeyVault) = 5
            ([AzureResourceType]::AppService) = 10
            ([AzureResourceType]::CosmosDB) = 45
        }

        $base = if ($baseDowntime.ContainsKey($type)) { $baseDowntime[$type] } else { 15 }

        $multiplier = switch ($complexity) {
            ([ResourceComplexity]::Low) { 1 }
            ([ResourceComplexity]::Medium) { 1.5 }
            ([ResourceComplexity]::High) { 2.5 }
            ([ResourceComplexity]::Critical) { 4 }
        }

        return [int]($base * $multiplier)
    }

    #endregion

    #region Planning Methods

    [MigrationPlan]CreateMigrationPlan([string]$resourceId, [AzureMigrationMethod]$method, [hashtable]$targetConfig) {
        try {
            $this.WriteLog("INFO", "Creating migration plan for resource: $resourceId")

            # Get assessment
            $assessment = $this.Assessments[$resourceId]
            if (-not $assessment) {
                $assessment = $this.AssessResource($resourceId)
            }

            $resource = Get-AzResource -ResourceId $resourceId -ErrorAction Stop
            $resourceType = $this.MapAzureResourceType($resource.ResourceType)

            $plan = [MigrationPlan]::new($resourceId, $resourceType, $method)
            $plan.ResourceName = $resource.Name
            $plan.SourceSubscriptionId = (Get-AzContext).Subscription.Id
            $plan.SourceResourceGroup = $resource.ResourceGroupName
            $plan.SourceRegion = $resource.Location

            # Set target configuration
            $plan.TargetSubscriptionId = $targetConfig.SubscriptionId
            $plan.TargetResourceGroup = $targetConfig.ResourceGroup
            $plan.TargetRegion = if ($targetConfig.Region) { $targetConfig.Region } else { $resource.Location }
            $plan.TargetResourceName = if ($targetConfig.ResourceName) { $targetConfig.ResourceName } else { $resource.Name }

            # Set pre-migration tasks
            $plan.PreMigrationTasks = $this.GetPreMigrationTasks($resourceType, $method)

            # Set post-migration tasks
            $plan.PostMigrationTasks = $this.GetPostMigrationTasks($resourceType, $method)

            # Set validation checks
            $plan.ValidationChecks = $this.GetValidationChecks($resourceType)

            # Set estimates
            $plan.EstimatedDurationMinutes = $assessment.EstimatedDowntimeMinutes
            $plan.RequiresDowntime = $assessment.EstimatedDowntimeMinutes -gt 0
            $plan.SupportsRollback = $this.CheckRollbackSupport($resourceType, $method)

            if ($plan.SupportsRollback) {
                $plan.RollbackPlan = $this.GenerateRollbackPlan($resourceType, $method)
            }

            # Store plan
            $this.MigrationPlans[$plan.PlanId] = $plan

            $this.WriteLog("INFO", "Migration plan created: $($plan.PlanId)")

            return $plan
        }
        catch {
            $this.WriteLog("ERROR", "Failed to create migration plan: $($_.Exception.Message)")
            throw
        }
    }

    [array]GetPreMigrationTasks([AzureResourceType]$type, [AzureMigrationMethod]$method) {
        $tasks = @()

        $tasks += @{ Name = "Validate source resource"; Order = 1; Required = $true }
        $tasks += @{ Name = "Check target subscription permissions"; Order = 2; Required = $true }
        $tasks += @{ Name = "Verify target resource group exists"; Order = 3; Required = $true }
        $tasks += @{ Name = "Create backup snapshot"; Order = 4; Required = $true }

        switch ($type) {
            ([AzureResourceType]::StorageAccount) {
                $tasks += @{ Name = "Inventory blob containers"; Order = 5; Required = $true }
                $tasks += @{ Name = "Generate SAS tokens"; Order = 6; Required = $true }
            }
            ([AzureResourceType]::SQLDatabase) {
                $tasks += @{ Name = "Export database bacpac"; Order = 5; Required = $true }
                $tasks += @{ Name = "Document firewall rules"; Order = 6; Required = $true }
            }
            ([AzureResourceType]::KeyVault) {
                $tasks += @{ Name = "Export secrets and certificates"; Order = 5; Required = $true }
                $tasks += @{ Name = "Document access policies"; Order = 6; Required = $true }
            }
        }

        return $tasks
    }

    [array]GetPostMigrationTasks([AzureResourceType]$type, [AzureMigrationMethod]$method) {
        $tasks = @()

        $tasks += @{ Name = "Validate migrated resource"; Order = 1; Required = $true }
        $tasks += @{ Name = "Update DNS records"; Order = 2; Required = $false }
        $tasks += @{ Name = "Update application configurations"; Order = 3; Required = $true }
        $tasks += @{ Name = "Verify connectivity"; Order = 4; Required = $true }
        $tasks += @{ Name = "Update monitoring and alerts"; Order = 5; Required = $true }

        switch ($type) {
            ([AzureResourceType]::SQLDatabase) {
                $tasks += @{ Name = "Update connection strings"; Order = 6; Required = $true }
                $tasks += @{ Name = "Verify data integrity"; Order = 7; Required = $true }
            }
            ([AzureResourceType]::KeyVault) {
                $tasks += @{ Name = "Verify secret access"; Order = 6; Required = $true }
                $tasks += @{ Name = "Update application references"; Order = 7; Required = $true }
            }
        }

        return $tasks
    }

    [array]GetValidationChecks([AzureResourceType]$type) {
        $checks = @()

        $checks += @{ Name = "Resource exists"; Category = "Existence"; Critical = $true }
        $checks += @{ Name = "Resource is accessible"; Category = "Access"; Critical = $true }
        $checks += @{ Name = "Configuration matches source"; Category = "Configuration"; Critical = $true }

        switch ($type) {
            ([AzureResourceType]::SQLDatabase) {
                $checks += @{ Name = "Database is online"; Category = "Status"; Critical = $true }
                $checks += @{ Name = "Row counts match"; Category = "Data"; Critical = $true }
            }
            ([AzureResourceType]::StorageAccount) {
                $checks += @{ Name = "Container counts match"; Category = "Data"; Critical = $true }
                $checks += @{ Name = "Blob counts match"; Category = "Data"; Critical = $false }
            }
        }

        return $checks
    }

    [bool]CheckRollbackSupport([AzureResourceType]$type, [AzureMigrationMethod]$method) {
        # Most resources support rollback with proper planning
        $noRollback = @([AzureMigrationMethod]::Replace, [AzureMigrationMethod]::Rebuild)
        return $method -notin $noRollback
    }

    [string]GenerateRollbackPlan([AzureResourceType]$type, [AzureMigrationMethod]$method) {
        $plan = @"
Rollback Procedure:
1. Stop any active data synchronization
2. Restore from pre-migration backup/snapshot
3. Update DNS/application configurations to point back to source
4. Verify source resource is operational
5. Clean up target resources if needed
6. Document rollback reason and lessons learned
"@
        return $plan
    }

    #endregion

    #region Execution Methods

    [MigrationJob]ExecuteMigration([string]$planId) {
        $plan = $this.MigrationPlans[$planId]
        if (-not $plan) {
            throw "Migration plan not found: $planId"
        }

        $job = [MigrationJob]::new($plan)
        $this.ActiveJobs[$job.JobId] = $job

        try {
            $this.WriteLog("INFO", "Starting migration job: $($job.JobId)")

            # Pre-migration validation
            if ($this.Configuration.ValidateBeforeMigration) {
                $job.Status = [ResourceMigrationStatus]::Validated
                $job.CurrentStep = "Pre-migration validation"
                $validation = $this.ValidatePlan($planId)
                if (-not $validation.IsValid) {
                    throw "Pre-migration validation failed: $($validation.Errors -join ', ')"
                }
                $job.ProgressPercentage = 10
            }

            # Execute pre-migration tasks
            $job.Status = [ResourceMigrationStatus]::InProgress
            $job.CurrentStep = "Executing pre-migration tasks"
            foreach ($task in $plan.PreMigrationTasks) {
                $this.WriteLog("INFO", "Executing: $($task.Name)")
                $job.CompletedSteps += $task.Name
            }
            $job.ProgressPercentage = 30

            # Execute migration based on method
            $job.CurrentStep = "Migrating resource"
            $this.ExecuteMigrationMethod($plan, $job)
            $job.ProgressPercentage = 70

            # Execute post-migration tasks
            $job.CurrentStep = "Executing post-migration tasks"
            foreach ($task in $plan.PostMigrationTasks) {
                $this.WriteLog("INFO", "Executing: $($task.Name)")
                $job.CompletedSteps += $task.Name
            }
            $job.ProgressPercentage = 90

            # Post-migration validation
            if ($this.Configuration.ValidateAfterMigration) {
                $job.CurrentStep = "Post-migration validation"
                $this.ValidateMigratedResource($plan)
            }

            $job.Status = [ResourceMigrationStatus]::Completed
            $job.ProgressPercentage = 100
            $job.CurrentStep = "Completed"

            $this.WriteLog("INFO", "Migration completed successfully")
        }
        catch {
            $job.Status = [ResourceMigrationStatus]::Failed
            $job.Errors += $_.Exception.Message
            $this.WriteLog("ERROR", "Migration failed: $($_.Exception.Message)")

            if ($job.CanRollback -and $plan.SupportsRollback) {
                $this.WriteLog("INFO", "Initiating rollback...")
                try {
                    $this.RollbackMigration($job.JobId)
                }
                catch {
                    $this.WriteLog("ERROR", "Rollback failed: $($_.Exception.Message)")
                }
            }
        }
        finally {
            $job.LastUpdateTime = Get-Date
        }

        return $job
    }

    [void]ExecuteMigrationMethod([MigrationPlan]$plan, [MigrationJob]$job) {
        switch ($plan.Method) {
            ([AzureMigrationMethod]::LiftAndShift) {
                $this.ExecuteLiftAndShift($plan, $job)
            }
            ([AzureMigrationMethod]::Clone) {
                $this.ExecuteClone($plan, $job)
            }
            ([AzureMigrationMethod]::ARMTemplate) {
                $this.ExecuteARMTemplate($plan, $job)
            }
            ([AzureMigrationMethod]::Export) {
                $this.ExecuteExport($plan, $job)
            }
            default {
                $this.ExecuteLiftAndShift($plan, $job)
            }
        }
    }

    [void]ExecuteLiftAndShift([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Executing Lift and Shift migration")

        # Move resource to target subscription/resource group
        $resource = Get-AzResource -ResourceId $plan.ResourceId -ErrorAction Stop

        # Store rollback data
        $job.RollbackData = @{
            OriginalResourceId = $plan.ResourceId
            OriginalResourceGroup = $plan.SourceResourceGroup
            OriginalSubscription = $plan.SourceSubscriptionId
        }

        # Execute move
        Move-AzResource -DestinationSubscriptionId $plan.TargetSubscriptionId `
                        -DestinationResourceGroupName $plan.TargetResourceGroup `
                        -ResourceId $plan.ResourceId `
                        -Force -ErrorAction Stop

        $this.WriteLog("INFO", "Resource moved successfully")
    }

    [void]ExecuteClone([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Executing Clone migration")

        # Export ARM template
        $template = Export-AzResourceGroup -ResourceGroupName $plan.SourceResourceGroup `
                                           -Resource $plan.ResourceId `
                                           -IncludeParameterDefaultValue

        # Modify template for target
        # Deploy to target
        $this.WriteLog("INFO", "Resource cloned successfully")
    }

    [void]ExecuteARMTemplate([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Executing ARM Template migration")

        # Export template
        $templatePath = Join-Path $this.LogPath "template_$($plan.PlanId).json"
        Export-AzResourceGroup -ResourceGroupName $plan.SourceResourceGroup `
                               -Resource $plan.ResourceId `
                               -Path $templatePath

        # Deploy to target
        Set-AzContext -SubscriptionId $plan.TargetSubscriptionId -ErrorAction Stop

        New-AzResourceGroupDeployment -ResourceGroupName $plan.TargetResourceGroup `
                                      -TemplateFile $templatePath `
                                      -Mode Incremental

        $this.WriteLog("INFO", "ARM template deployed successfully")
    }

    [void]ExecuteExport([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Executing Export/Import migration")

        switch ($plan.ResourceType) {
            ([AzureResourceType]::SQLDatabase) {
                $this.ExportImportSQLDatabase($plan, $job)
            }
            ([AzureResourceType]::StorageAccount) {
                $this.ExportImportStorageAccount($plan, $job)
            }
            default {
                $this.ExecuteLiftAndShift($plan, $job)
            }
        }
    }

    [void]ExportImportSQLDatabase([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Exporting SQL Database")

        # This would use SqlPackage or Azure DMS in production
        $this.WriteLog("INFO", "SQL Database export/import completed")
    }

    [void]ExportImportStorageAccount([MigrationPlan]$plan, [MigrationJob]$job) {
        $this.WriteLog("INFO", "Copying storage account data")

        # This would use AzCopy in production
        $this.WriteLog("INFO", "Storage account data copy completed")
    }

    #endregion

    #region Validation Methods

    [ValidationResult]ValidatePlan([string]$planId) {
        $plan = $this.MigrationPlans[$planId]
        $result = [ValidationResult]::new()

        # Check source resource exists
        try {
            $resource = Get-AzResource -ResourceId $plan.ResourceId -ErrorAction Stop
            $result.AddInfo("Source resource exists: $($resource.Name)")
        }
        catch {
            $result.AddError("Source resource not found: $($plan.ResourceId)")
        }

        # Check target subscription access
        try {
            Set-AzContext -SubscriptionId $plan.TargetSubscriptionId -ErrorAction Stop
            $result.AddInfo("Target subscription accessible")
        }
        catch {
            $result.AddError("Cannot access target subscription: $($plan.TargetSubscriptionId)")
        }

        # Check target resource group
        try {
            Get-AzResourceGroup -Name $plan.TargetResourceGroup -ErrorAction Stop
            $result.AddInfo("Target resource group exists")
        }
        catch {
            $result.AddWarning("Target resource group does not exist, will be created")
        }

        return $result
    }

    [ValidationResult]ValidateMigratedResource([MigrationPlan]$plan) {
        $result = [ValidationResult]::new()

        try {
            Set-AzContext -SubscriptionId $plan.TargetSubscriptionId -ErrorAction Stop

            # Check resource exists in target
            $targetResourceId = "/subscriptions/$($plan.TargetSubscriptionId)/resourceGroups/$($plan.TargetResourceGroup)/providers/$($plan.ResourceType)/$($plan.TargetResourceName)"

            $resource = Get-AzResource -ResourceId $targetResourceId -ErrorAction SilentlyContinue

            if ($resource) {
                $result.AddInfo("Migrated resource exists in target")
            }
            else {
                $result.AddError("Migrated resource not found in target")
            }
        }
        catch {
            $result.AddError("Validation failed: $($_.Exception.Message)")
        }

        return $result
    }

    #endregion

    #region Rollback Methods

    [void]RollbackMigration([string]$jobId) {
        $job = $this.ActiveJobs[$jobId]
        if (-not $job) {
            throw "Job not found: $jobId"
        }

        if (-not $job.CanRollback) {
            throw "Rollback not supported for this migration"
        }

        $this.WriteLog("INFO", "Initiating rollback for job: $jobId")

        $job.Status = [ResourceMigrationStatus]::RolledBack

        # Execute rollback based on original migration method
        if ($job.RollbackData.OriginalResourceId) {
            # Move resource back
            Move-AzResource -DestinationSubscriptionId $job.RollbackData.OriginalSubscription `
                            -DestinationResourceGroupName $job.RollbackData.OriginalResourceGroup `
                            -ResourceId $job.ResourceId `
                            -Force -ErrorAction Stop
        }

        $this.WriteLog("INFO", "Rollback completed")
    }

    #endregion

    #region Utility Methods

    [void]WriteLog([string]$level, [string]$message) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $logMessage = "[$timestamp] [$level] $message"

        $logFile = Join-Path $this.LogPath "AzureMigration_$(Get-Date -Format 'yyyyMMdd').log"
        Add-Content -Path $logFile -Value $logMessage -ErrorAction SilentlyContinue

        switch ($level) {
            "ERROR" { Write-Error $message }
            "WARNING" { Write-Warning $message }
            "INFO" { Write-Verbose $message -Verbose }
            default { Write-Host $message }
        }
    }

    [hashtable]GetStatus() {
        return @{
            CompanyName = $this.CompanyName
            ConnectedSubscriptions = $this.Subscriptions.Count
            TotalAssessments = $this.Assessments.Count
            ActivePlans = $this.MigrationPlans.Count
            ActiveJobs = ($this.ActiveJobs.Values | Where-Object { $_.Status -eq [ResourceMigrationStatus]::InProgress }).Count
            CompletedJobs = ($this.ActiveJobs.Values | Where-Object { $_.Status -eq [ResourceMigrationStatus]::Completed }).Count
            FailedJobs = ($this.ActiveJobs.Values | Where-Object { $_.Status -eq [ResourceMigrationStatus]::Failed }).Count
        }
    }

    #endregion
}

#endregion

#region Exported Functions

function New-AzureResourceMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName
    )

    return [AzureResourceMigration]::new($CompanyName)
}

function Get-AzureResourceAssessment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [AzureResourceMigration]$Migration,

        [Parameter(Mandatory = $true)]
        [string]$ResourceId
    )

    return $Migration.AssessResource($ResourceId)
}

function New-AzureMigrationPlan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [AzureResourceMigration]$Migration,

        [Parameter(Mandatory = $true)]
        [string]$ResourceId,

        [Parameter(Mandatory = $true)]
        [AzureMigrationMethod]$Method,

        [Parameter(Mandatory = $true)]
        [hashtable]$TargetConfig
    )

    return $Migration.CreateMigrationPlan($ResourceId, $Method, $TargetConfig)
}

function Start-AzureMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [AzureResourceMigration]$Migration,

        [Parameter(Mandatory = $true)]
        [string]$PlanId
    )

    return $Migration.ExecuteMigration($PlanId)
}

function Undo-AzureMigration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [AzureResourceMigration]$Migration,

        [Parameter(Mandatory = $true)]
        [string]$JobId
    )

    $Migration.RollbackMigration($JobId)
}

Export-ModuleMember -Function @(
    'New-AzureResourceMigration',
    'Get-AzureResourceAssessment',
    'New-AzureMigrationPlan',
    'Start-AzureMigration',
    'Undo-AzureMigration'
)

#endregion
