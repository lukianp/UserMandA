# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-30

<#
.SYNOPSIS
    Google Cloud Platform Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers GCP infrastructure including Compute Engine instances, Cloud Storage buckets, 
    Cloud SQL databases, Cloud Functions, BigQuery datasets, and other GCP services. 
    This module provides comprehensive GCP cloud environment discovery essential for M&A 
    cloud infrastructure assessment and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Requires: PowerShell 5.1+, Google Cloud SDK (gcloud CLI), authenticated GCP credentials
#>

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

function Write-GCPLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter()]
        [string]$Level = "INFO",
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    Write-MandALog -Message $Message -Level $Level -Component "GCPDiscovery" -Context $Context
}

function Test-GCloudCLI {
    try {
        $gcloudVersion = & gcloud version --format="json" 2>&1 | ConvertFrom-Json -ErrorAction Stop
        return $true
    } catch {
        throw "Google Cloud SDK (gcloud CLI) is not installed or not accessible. Please install from: https://cloud.google.com/sdk/docs/install"
    }
}

function Invoke-GCloudCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        
        [Parameter()]
        [string]$ProjectId,
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    try {
        $fullCommand = if ($ProjectId) { 
            "$Command --project=$ProjectId --format=json" 
        } else { 
            "$Command --format=json" 
        }
        
        Write-GCPLog -Level "DEBUG" -Message "Executing: gcloud $fullCommand" -Context $Context
        
        $output = & gcloud $fullCommand.Split(' ') 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "gcloud command failed with exit code $LASTEXITCODE`: $($output -join ' ')"
        }
        
        if ($output) {
            return $output | ConvertFrom-Json -ErrorAction Stop
        }
        return @()
        
    } catch {
        Write-GCPLog -Level "ERROR" -Message "Failed to execute gcloud command '$Command': $($_.Exception.Message)" -Context $Context
        throw
    }
}

function Invoke-GCPDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    # START: Enhanced discovery context validation and initialization
    Write-GCPLog -Level "HEADER" -Message "=== M&A GCP Discovery Module Starting ===" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "GCP discovery completed successfully"
        Data = @{}
        Errors = @()
        Warnings = @()
        Context = $Context
    }
    
    # Helper to add errors with proper context
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $location)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Location = $location
            Timestamp = Get-Date
        }
        Write-GCPLog -Level "ERROR" -Message $message -Context $this.Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-GCPLog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # Extract context components with comprehensive validation
        
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-GCPLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-GCPLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE GCLOUD CLI AND AUTHENTICATION
        Write-GCPLog -Level "INFO" -Message "Validating Google Cloud SDK..." -Context $Context
        
        try {
            Test-GCloudCLI
            Write-GCPLog -Level "SUCCESS" -Message "Google Cloud SDK validated successfully" -Context $Context
        } catch {
            $result.AddError($_.Exception.Message, $_.Exception, "GCloud CLI Validation")
            return $result
        }
        
        # Test GCP authentication
        Write-GCPLog -Level "INFO" -Message "Validating GCP authentication..." -Context $Context
        try {
            $authInfo = Invoke-GCloudCommand -Command "auth list --filter=status:ACTIVE" -Context $Context
            if (-not $authInfo -or $authInfo.Count -eq 0) {
                $result.AddError("No active GCP authentication found. Please run 'gcloud auth login' or 'gcloud auth application-default login'.", $null, "GCP Authentication")
                return $result
            }
            
            $activeAccount = $authInfo[0].account
            Write-GCPLog -Level "SUCCESS" -Message "GCP authentication validated. Active account: $activeAccount" -Context $Context
        } catch {
            $result.AddError("GCP authentication validation failed: $($_.Exception.Message)", $_.Exception, "GCP Authentication")
            return $result
        }

        # 4. GET GCP PROJECTS TO SCAN
        Write-GCPLog -Level "INFO" -Message "Discovering GCP projects..." -Context $Context
        $projectsToScan = @()
        
        try {
            if ($Configuration.discovery.gcp.projectIds) {
                $projectsToScan = $Configuration.discovery.gcp.projectIds
                Write-GCPLog -Level "INFO" -Message "Using configured projects: $($projectsToScan -join ', ')" -Context $Context
            } else {
                # Get all accessible projects
                $allProjects = Invoke-GCloudCommand -Command "projects list" -Context $Context
                $projectsToScan = $allProjects | ForEach-Object { $_.projectId }
                Write-GCPLog -Level "INFO" -Message "No specific projects configured, will scan all $($projectsToScan.Count) accessible projects" -Context $Context
            }
        } catch {
            $result.AddError("Failed to list GCP projects: $($_.Exception.Message)", $_.Exception, "Project Discovery")
            return $result
        }

        # 5. DISCOVERY EXECUTION
        Write-GCPLog -Level "HEADER" -Message "Starting GCP Discovery Process for $($projectsToScan.Count) projects" -Context $Context
        
        $discoveryData = @{
            Projects = @()
            ComputeInstances = @()
            StorageBuckets = @()
            CloudSQLInstances = @()
            CloudFunctions = @()
            BigQueryDatasets = @()
            VPCNetworks = @()
            Firewalls = @()
            IAMMembers = @()
            ServiceAccounts = @()
            Statistics = @{
                TotalProjects = $projectsToScan.Count
                TotalInstances = 0
                TotalBuckets = 0
                TotalDatabases = 0
                TotalFunctions = 0
                TotalDatasets = 0
                TotalNetworks = 0
                TotalServiceAccounts = 0
            }
        }

        # 5a. Discover each project
        foreach ($projectId in $projectsToScan) {
            Write-GCPLog -Level "INFO" -Message "Discovering resources in project: $projectId" -Context $Context
            
            try {
                # Get project information
                $projectInfo = Invoke-GCloudCommand -Command "projects describe $projectId" -Context $Context
                $projectData = @{
                    ProjectId = $projectInfo.projectId
                    ProjectName = $projectInfo.name
                    ProjectNumber = $projectInfo.projectNumber
                    LifecycleState = $projectInfo.lifecycleState
                    CreateTime = $projectInfo.createTime
                    Labels = if ($projectInfo.labels) { ($projectInfo.labels.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                }
                $discoveryData.Projects += $projectData
                
                # Compute Engine instances
                try {
                    $instances = Invoke-GCloudCommand -Command "compute instances list" -ProjectId $projectId -Context $Context
                    foreach ($instance in $instances) {
                        $instanceInfo = @{
                            ProjectId = $projectId
                            Name = $instance.name
                            Zone = $instance.zone -replace '.*/zones/', ''
                            MachineType = $instance.machineType -replace '.*/machineTypes/', ''
                            Status = $instance.status
                            InternalIP = ($instance.networkInterfaces | Select-Object -First 1).networkIP
                            ExternalIP = if ($instance.networkInterfaces[0].accessConfigs) { $instance.networkInterfaces[0].accessConfigs[0].natIP } else { '' }
                            CreationTimestamp = $instance.creationTimestamp
                            Tags = if ($instance.tags.items) { $instance.tags.items -join ';' } else { '' }
                            Labels = if ($instance.labels) { ($instance.labels.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                            Disks = $instance.disks.Count
                            NetworkInterfaces = $instance.networkInterfaces.Count
                        }
                        $discoveryData.ComputeInstances += $instanceInfo
                        $discoveryData.Statistics.TotalInstances++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get Compute instances for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # Cloud Storage buckets
                try {
                    $buckets = Invoke-GCloudCommand -Command "storage buckets list" -ProjectId $projectId -Context $Context
                    foreach ($bucket in $buckets) {
                        $bucketInfo = @{
                            ProjectId = $projectId
                            Name = $bucket.name
                            Location = $bucket.location
                            LocationType = $bucket.locationType
                            StorageClass = $bucket.storageClass
                            CreatedTime = $bucket.timeCreated
                            UpdatedTime = $bucket.updated
                            Labels = if ($bucket.labels) { ($bucket.labels.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                        }
                        $discoveryData.StorageBuckets += $bucketInfo
                        $discoveryData.Statistics.TotalBuckets++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get Cloud Storage buckets for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # Cloud SQL instances
                try {
                    $sqlInstances = Invoke-GCloudCommand -Command "sql instances list" -ProjectId $projectId -Context $Context
                    foreach ($sqlInstance in $sqlInstances) {
                        $sqlInfo = @{
                            ProjectId = $projectId
                            Name = $sqlInstance.name
                            DatabaseVersion = $sqlInstance.databaseVersion
                            Tier = $sqlInstance.settings.tier
                            Region = $sqlInstance.region
                            State = $sqlInstance.state
                            BackendType = $sqlInstance.backendType
                            InstanceType = $sqlInstance.instanceType
                            CreatedTime = $sqlInstance.createTime
                            IpAddresses = if ($sqlInstance.ipAddresses) { ($sqlInstance.ipAddresses | ForEach-Object { $_.ipAddress }) -join ';' } else { '' }
                            ConnectionName = $sqlInstance.connectionName
                        }
                        $discoveryData.CloudSQLInstances += $sqlInfo
                        $discoveryData.Statistics.TotalDatabases++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get Cloud SQL instances for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # Cloud Functions
                try {
                    $functions = Invoke-GCloudCommand -Command "functions list" -ProjectId $projectId -Context $Context
                    foreach ($function in $functions) {
                        $functionInfo = @{
                            ProjectId = $projectId
                            Name = $function.name -replace '.*/functions/', ''
                            Runtime = $function.runtime
                            Status = $function.status
                            SourceArchiveUrl = $function.sourceArchiveUrl
                            EntryPoint = $function.entryPoint
                            Trigger = if ($function.httpsTrigger) { 'HTTP' } elseif ($function.eventTrigger) { $function.eventTrigger.eventType } else { 'Unknown' }
                            UpdateTime = $function.updateTime
                            VersionId = $function.versionId
                            Labels = if ($function.labels) { ($function.labels.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                        }
                        $discoveryData.CloudFunctions += $functionInfo
                        $discoveryData.Statistics.TotalFunctions++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get Cloud Functions for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # BigQuery datasets
                try {
                    $datasets = Invoke-GCloudCommand -Command "bq ls --max_results=1000" -ProjectId $projectId -Context $Context
                    foreach ($dataset in $datasets) {
                        $datasetInfo = @{
                            ProjectId = $projectId
                            DatasetId = $dataset.datasetReference.datasetId
                            FriendlyName = $dataset.friendlyName
                            Description = $dataset.description
                            Location = $dataset.location
                            CreationTime = $dataset.creationTime
                            LastModifiedTime = $dataset.lastModifiedTime
                            Labels = if ($dataset.labels) { ($dataset.labels.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';' } else { '' }
                        }
                        $discoveryData.BigQueryDatasets += $datasetInfo
                        $discoveryData.Statistics.TotalDatasets++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get BigQuery datasets for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # VPC Networks
                try {
                    $networks = Invoke-GCloudCommand -Command "compute networks list" -ProjectId $projectId -Context $Context
                    foreach ($network in $networks) {
                        $networkInfo = @{
                            ProjectId = $projectId
                            Name = $network.name
                            Mode = $network.subnetMode
                            IPv4Range = $network.IPv4Range
                            CreationTimestamp = $network.creationTimestamp
                            AutoCreateSubnetworks = $network.autoCreateSubnetworks
                            RoutingMode = if ($network.routingConfig) { $network.routingConfig.routingMode } else { '' }
                        }
                        $discoveryData.VPCNetworks += $networkInfo
                        $discoveryData.Statistics.TotalNetworks++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get VPC networks for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # Firewall rules
                try {
                    $firewalls = Invoke-GCloudCommand -Command "compute firewall-rules list" -ProjectId $projectId -Context $Context
                    foreach ($firewall in $firewalls) {
                        $firewallInfo = @{
                            ProjectId = $projectId
                            Name = $firewall.name
                            Direction = $firewall.direction
                            Priority = $firewall.priority
                            Network = $firewall.network -replace '.*/networks/', ''
                            Action = if ($firewall.allowed) { 'ALLOW' } else { 'DENY' }
                            Protocols = if ($firewall.allowed) { ($firewall.allowed | ForEach-Object { "$($_.IPProtocol):$($_.ports -join ',')" }) -join ';' } else { '' }
                            SourceRanges = if ($firewall.sourceRanges) { $firewall.sourceRanges -join ';' } else { '' }
                            DestinationRanges = if ($firewall.destinationRanges) { $firewall.destinationRanges -join ';' } else { '' }
                            SourceTags = if ($firewall.sourceTags) { $firewall.sourceTags -join ';' } else { '' }
                            TargetTags = if ($firewall.targetTags) { $firewall.targetTags -join ';' } else { '' }
                        }
                        $discoveryData.Firewalls += $firewallInfo
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get firewall rules for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                # Service Accounts
                try {
                    $serviceAccounts = Invoke-GCloudCommand -Command "iam service-accounts list" -ProjectId $projectId -Context $Context
                    foreach ($sa in $serviceAccounts) {
                        $saInfo = @{
                            ProjectId = $projectId
                            Name = $sa.name -replace '.*/serviceAccounts/', ''
                            DisplayName = $sa.displayName
                            Email = $sa.email
                            Description = $sa.description
                            Disabled = $sa.disabled
                            UniqueId = $sa.uniqueId
                        }
                        $discoveryData.ServiceAccounts += $saInfo
                        $discoveryData.Statistics.TotalServiceAccounts++
                    }
                } catch {
                    Write-GCPLog -Level "DEBUG" -Message "Could not get service accounts for project $projectId`: $($_.Exception.Message)" -Context $Context
                }
                
                Write-GCPLog -Level "SUCCESS" -Message "Completed discovery for project $projectId" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover resources in project ${projectId}: $($_.Exception.Message)")
            }
        }

        Write-GCPLog -Level "SUCCESS" -Message "Completed GCP discovery across all projects" -Context $Context
        Write-GCPLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalInstances) Compute instances, $($discoveryData.Statistics.TotalBuckets) Storage buckets, $($discoveryData.Statistics.TotalDatabases) SQL instances, $($discoveryData.Statistics.TotalFunctions) Functions" -Context $Context

        # 6. SAVE DISCOVERY DATA TO CSV FILES
        Write-GCPLog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save Projects
            if ($discoveryData.Projects.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPProjects.csv"
                $discoveryData.Projects | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.Projects.Count) GCP projects to $csvPath" -Context $Context
            }
            
            # Save Compute Instances
            if ($discoveryData.ComputeInstances.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPComputeInstances.csv"
                $discoveryData.ComputeInstances | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.ComputeInstances.Count) Compute instances to $csvPath" -Context $Context
            }
            
            # Save Storage Buckets
            if ($discoveryData.StorageBuckets.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPStorageBuckets.csv"
                $discoveryData.StorageBuckets | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.StorageBuckets.Count) Storage buckets to $csvPath" -Context $Context
            }
            
            # Save Cloud SQL Instances
            if ($discoveryData.CloudSQLInstances.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPCloudSQLInstances.csv"
                $discoveryData.CloudSQLInstances | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.CloudSQLInstances.Count) Cloud SQL instances to $csvPath" -Context $Context
            }
            
            # Save Cloud Functions
            if ($discoveryData.CloudFunctions.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPCloudFunctions.csv"
                $discoveryData.CloudFunctions | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.CloudFunctions.Count) Cloud Functions to $csvPath" -Context $Context
            }
            
            # Save BigQuery Datasets
            if ($discoveryData.BigQueryDatasets.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPBigQueryDatasets.csv"
                $discoveryData.BigQueryDatasets | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.BigQueryDatasets.Count) BigQuery datasets to $csvPath" -Context $Context
            }
            
            # Save VPC Networks
            if ($discoveryData.VPCNetworks.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPVPCNetworks.csv"
                $discoveryData.VPCNetworks | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.VPCNetworks.Count) VPC networks to $csvPath" -Context $Context
            }
            
            # Save Firewall Rules
            if ($discoveryData.Firewalls.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPFirewallRules.csv"
                $discoveryData.Firewalls | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.Firewalls.Count) firewall rules to $csvPath" -Context $Context
            }
            
            # Save Service Accounts
            if ($discoveryData.ServiceAccounts.Count -gt 0) {
                $csvPath = Join-Path $outputPath "GCPServiceAccounts.csv"
                $discoveryData.ServiceAccounts | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-GCPLog -Level "SUCCESS" -Message "Saved $($discoveryData.ServiceAccounts.Count) service accounts to $csvPath" -Context $Context
            }
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "GCPStatistics.csv"
            @($discoveryData.Statistics) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-GCPLog -Level "SUCCESS" -Message "Saved GCP statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 7. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-GCPLog -Level "HEADER" -Message "=== M&A GCP Discovery Module Completed ===" -Context $Context
        Write-GCPLog -Level "SUCCESS" -Message "GCP discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in GCP discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
    }
    
    return $result
}

# Helper function to ensure path exists
function Ensure-Path {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -ItemType Directory -Force | Out-Null
    }
}

Export-ModuleMember -Function Invoke-GCPDiscovery