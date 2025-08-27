# M&A Discovery Suite - Multi-Cloud Discovery Engine
# Comprehensive discovery across AWS, Azure, and Google Cloud Platform

function Invoke-MultiCloudDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("AWS", "Azure", "GCP", "All")]
        [string[]]$CloudProviders = @("All"),
        
        [Parameter(Mandatory = $false)]
        [string]$OutputPath = ".\Output\$CompanyName\CloudDiscovery",
        
        [Parameter(Mandatory = $false)]
        [hashtable]$AWSCredentials = @{},
        
        [Parameter(Mandatory = $false)]
        [hashtable]$AzureCredentials = @{},
        
        [Parameter(Mandatory = $false)]
        [hashtable]$GCPCredentials = @{},
        
        [Parameter(Mandatory = $false)]
        [string[]]$AWSRegions = @("us-east-1", "us-west-2", "eu-west-1"),
        
        [Parameter(Mandatory = $false)]
        [string[]]$AzureSubscriptions = @(),
        
        [Parameter(Mandatory = $false)]
        [string[]]$GCPProjects = @(),
        
        [Parameter(Mandatory = $false)]
        [switch]$IncludeCostAnalysis,
        
        [Parameter(Mandatory = $false)]
        [switch]$DiscoverCompliance,
        
        [Parameter(Mandatory = $false)]
        [switch]$AnalyzeSecurity,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\CloudDiscovery.log"
    )
    
    Begin {
        Write-Host "☁️ M&A Discovery Suite - Multi-Cloud Discovery Engine" -ForegroundColor Cyan
        Write-Host "==================================================" -ForegroundColor Cyan
        
        # Initialize cloud discovery session
        $session = @{
            CompanyName = $CompanyName
            CloudProviders = if ($CloudProviders -contains "All") { @("AWS", "Azure", "GCP") } else { $CloudProviders }
            StartTime = Get-Date
            Results = @{
                AWS = @{}
                Azure = @{}
                GCP = @{}
            }
            Summary = @{
                TotalResources = 0
                TotalCost = 0
                SecurityIssues = 0
                ComplianceGaps = 0
            }
            Errors = @()
        }
        
        # Ensure output directory exists
        if (!(Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        Write-Log "Starting multi-cloud discovery for $CompanyName" $LogFile
    }
    
    Process {
        try {
            foreach ($provider in $session.CloudProviders) {
                Write-Host "🔍 Discovering $provider resources..." -ForegroundColor Green
                
                switch ($provider) {
                    "AWS" {
                        $session.Results.AWS = Invoke-AWSDiscovery -Credentials $AWSCredentials -Regions $AWSRegions -Session $session
                    }
                    "Azure" {
                        $session.Results.Azure = Invoke-AzureDiscovery -Credentials $AzureCredentials -Subscriptions $AzureSubscriptions -Session $session
                    }
                    "GCP" {
                        $session.Results.GCP = Invoke-GCPDiscovery -Credentials $GCPCredentials -Projects $GCPProjects -Session $session
                    }
                }
            }
            
            # Perform cross-cloud analysis
            Write-Host "🔄 Performing cross-cloud analysis..." -ForegroundColor Yellow
            $crossAnalysis = Invoke-CrossCloudAnalysis -Session $session
            
            # Cost analysis if requested
            if ($IncludeCostAnalysis) {
                Write-Host "💰 Analyzing cloud costs..." -ForegroundColor Yellow
                $costAnalysis = Invoke-CloudCostAnalysis -Session $session
            }
            
            # Security analysis if requested
            if ($AnalyzeSecurity) {
                Write-Host "🔒 Analyzing security posture..." -ForegroundColor Yellow
                $securityAnalysis = Invoke-CloudSecurityAnalysis -Session $session
            }
            
            # Compliance assessment if requested
            if ($DiscoverCompliance) {
                Write-Host "⚖️ Assessing compliance..." -ForegroundColor Yellow
                $complianceAnalysis = Invoke-CloudComplianceAnalysis -Session $session
            }
            
            # Export results
            Write-Host "📊 Exporting discovery results..." -ForegroundColor Yellow
            Export-CloudDiscoveryResults -Session $session -OutputPath $OutputPath
            
            # Display summary
            Display-CloudDiscoverySummary -Session $session
            
            Write-Host "✅ Multi-cloud discovery completed successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "Multi-cloud discovery failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Invoke-AWSDiscovery {
    param(
        [hashtable]$Credentials,
        [string[]]$Regions,
        [hashtable]$Session
    )
    
    $awsResults = @{
        Regions = @{}
        Summary = @{
            TotalInstances = 0
            TotalVolumes = 0
            TotalS3Buckets = 0
            TotalVPCs = 0
            TotalCost = 0
        }
        SecurityGroups = @()
        IAMUsers = @()
        IAMRoles = @()
        S3Buckets = @()
        LambdaFunctions = @()
        RDSInstances = @()
        LoadBalancers = @()
    }
    
    try {
        # Check if AWS PowerShell module is available
        if (!(Get-Module -ListAvailable -Name "AWS.Tools.*" -ErrorAction SilentlyContinue)) {
            Write-Warning "AWS PowerShell modules not found. Install with: Install-Module AWS.Tools.Common"
            return $awsResults
        }
        
        # Configure AWS credentials if provided
        if ($Credentials.AccessKey -and $Credentials.SecretKey) {
            Set-AWSCredential -AccessKey $Credentials.AccessKey -SecretKey $Credentials.SecretKey -StoreAs "M&ADiscovery"
            Initialize-AWSDefaultConfiguration -ProfileName "M&ADiscovery"
        }
        
        foreach ($region in $Regions) {
            Write-Host "   📍 Discovering AWS resources in $region..." -ForegroundColor Cyan
            
            $regionResults = @{
                EC2Instances = @()
                EBSVolumes = @()
                VPCs = @()
                Subnets = @()
                SecurityGroups = @()
                Snapshots = @()
            }
            
            try {
                # EC2 Instances
                $ec2Instances = Get-EC2Instance -Region $region -ErrorAction SilentlyContinue
                foreach ($reservation in $ec2Instances) {
                    foreach ($instance in $reservation.Instances) {
                        $instanceData = @{
                            InstanceId = $instance.InstanceId
                            InstanceType = $instance.InstanceType
                            State = $instance.State.Name
                            LaunchTime = $instance.LaunchTime
                            PublicIpAddress = $instance.PublicIpAddress
                            PrivateIpAddress = $instance.PrivateIpAddress
                            VpcId = $instance.VpcId
                            SubnetId = $instance.SubnetId
                            SecurityGroups = $instance.SecurityGroups | ForEach-Object { $_.GroupId }
                            Tags = $instance.Tags | ForEach-Object { @{ Key = $_.Key; Value = $_.Value } }
                            Region = $region
                        }
                        $regionResults.EC2Instances += $instanceData
                        $awsResults.Summary.TotalInstances++
                    }
                }
                
                # EBS Volumes
                $ebsVolumes = Get-EC2Volume -Region $region -ErrorAction SilentlyContinue
                foreach ($volume in $ebsVolumes) {
                    $volumeData = @{
                        VolumeId = $volume.VolumeId
                        Size = $volume.Size
                        VolumeType = $volume.VolumeType
                        State = $volume.State
                        Encrypted = $volume.Encrypted
                        SnapshotId = $volume.SnapshotId
                        AvailabilityZone = $volume.AvailabilityZone
                        CreateTime = $volume.CreateTime
                        Tags = $volume.Tags | ForEach-Object { @{ Key = $_.Key; Value = $_.Value } }
                        Region = $region
                    }
                    $regionResults.EBSVolumes += $volumeData
                    $awsResults.Summary.TotalVolumes++
                }
                
                # VPCs
                $vpcs = Get-EC2Vpc -Region $region -ErrorAction SilentlyContinue
                foreach ($vpc in $vpcs) {
                    $vpcData = @{
                        VpcId = $vpc.VpcId
                        State = $vpc.State
                        CidrBlock = $vpc.CidrBlock
                        IsDefault = $vpc.IsDefault
                        Tags = $vpc.Tags | ForEach-Object { @{ Key = $_.Key; Value = $_.Value } }
                        Region = $region
                    }
                    $regionResults.VPCs += $vpcData
                    $awsResults.Summary.TotalVPCs++
                }
                
                # Security Groups
                $securityGroups = Get-EC2SecurityGroup -Region $region -ErrorAction SilentlyContinue
                foreach ($sg in $securityGroups) {
                    $sgData = @{
                        GroupId = $sg.GroupId
                        GroupName = $sg.GroupName
                        Description = $sg.Description
                        VpcId = $sg.VpcId
                        IngressRules = $sg.IpPermissions | ForEach-Object {
                            @{
                                Protocol = $_.IpProtocol
                                FromPort = $_.FromPort
                                ToPort = $_.ToPort
                                IpRanges = $_.IpRanges | ForEach-Object { $_.CidrIp }
                            }
                        }
                        EgressRules = $sg.IpPermissionsEgress | ForEach-Object {
                            @{
                                Protocol = $_.IpProtocol
                                FromPort = $_.FromPort
                                ToPort = $_.ToPort
                                IpRanges = $_.IpRanges | ForEach-Object { $_.CidrIp }
                            }
                        }
                        Tags = $sg.Tags | ForEach-Object { @{ Key = $_.Key; Value = $_.Value } }
                        Region = $region
                    }
                    $regionResults.SecurityGroups += $sgData
                    $awsResults.SecurityGroups += $sgData
                }
                
            } catch {
                Write-Warning "Failed to discover resources in region $region`: $($_.Exception.Message)"
                $Session.Errors += "AWS-$region`: $($_.Exception.Message)"
            }
            
            $awsResults.Regions[$region] = $regionResults
        }
        
        # Global services (S3, IAM, etc.)
        Write-Host "   🌐 Discovering AWS global services..." -ForegroundColor Cyan
        
        try {
            # S3 Buckets
            $s3Buckets = Get-S3Bucket -ErrorAction SilentlyContinue
            foreach ($bucket in $s3Buckets) {
                $bucketData = @{
                    BucketName = $bucket.BucketName
                    CreationDate = $bucket.CreationDate
                    Region = (Get-S3BucketLocation -BucketName $bucket.BucketName -ErrorAction SilentlyContinue).Value
                }
                
                # Get bucket encryption
                try {
                    $encryption = Get-S3BucketEncryption -BucketName $bucket.BucketName -ErrorAction SilentlyContinue
                    $bucketData.Encrypted = $encryption -ne $null
                } catch {
                    $bucketData.Encrypted = $false
                }
                
                # Get bucket versioning
                try {
                    $versioning = Get-S3BucketVersioning -BucketName $bucket.BucketName -ErrorAction SilentlyContinue
                    $bucketData.VersioningEnabled = $versioning.Status -eq "Enabled"
                } catch {
                    $bucketData.VersioningEnabled = $false
                }
                
                $awsResults.S3Buckets += $bucketData
                $awsResults.Summary.TotalS3Buckets++
            }
            
            # IAM Users
            $iamUsers = Get-IAMUserList -ErrorAction SilentlyContinue
            foreach ($user in $iamUsers) {
                $userData = @{
                    UserName = $user.UserName
                    UserId = $user.UserId
                    Arn = $user.Arn
                    CreateDate = $user.CreateDate
                    PasswordLastUsed = $user.PasswordLastUsed
                    Path = $user.Path
                }
                
                # Get user's groups
                try {
                    $userGroups = Get-IAMGroupForUser -UserName $user.UserName -ErrorAction SilentlyContinue
                    $userData.Groups = $userGroups | ForEach-Object { $_.GroupName }
                } catch {
                    $userData.Groups = @()
                }
                
                # Get user's policies
                try {
                    $userPolicies = Get-IAMUserPolicyList -UserName $user.UserName -ErrorAction SilentlyContinue
                    $userData.Policies = $userPolicies
                } catch {
                    $userData.Policies = @()
                }
                
                $awsResults.IAMUsers += $userData
            }
            
            # IAM Roles
            $iamRoles = Get-IAMRoleList -ErrorAction SilentlyContinue
            foreach ($role in $iamRoles) {
                $roleData = @{
                    RoleName = $role.RoleName
                    RoleId = $role.RoleId
                    Arn = $role.Arn
                    CreateDate = $role.CreateDate
                    AssumeRolePolicyDocument = $role.AssumeRolePolicyDocument
                    Path = $role.Path
                    MaxSessionDuration = $role.MaxSessionDuration
                }
                
                $awsResults.IAMRoles += $roleData
            }
            
        } catch {
            Write-Warning "Failed to discover AWS global services: $($_.Exception.Message)"
            $Session.Errors += "AWS-Global: $($_.Exception.Message)"
        }
        
    } catch {
        Write-Warning "AWS discovery initialization failed: $($_.Exception.Message)"
        $Session.Errors += "AWS-Init: $($_.Exception.Message)"
    }
    
    Write-Host "   ✅ AWS discovery completed ($($awsResults.Summary.TotalInstances) instances, $($awsResults.Summary.TotalS3Buckets) S3 buckets)" -ForegroundColor Green
    return $awsResults
}

function Invoke-AzureDiscovery {
    param(
        [hashtable]$Credentials,
        [string[]]$Subscriptions,
        [hashtable]$Session
    )
    
    $azureResults = @{
        Subscriptions = @{}
        Summary = @{
            TotalVMs = 0
            TotalStorageAccounts = 0
            TotalResourceGroups = 0
            TotalWebApps = 0
            TotalCost = 0
        }
        VirtualMachines = @()
        StorageAccounts = @()
        ResourceGroups = @()
        NetworkSecurityGroups = @()
        VirtualNetworks = @()
        WebApps = @()
        SQLDatabases = @()
        KeyVaults = @()
    }
    
    try {
        # Check if Azure PowerShell module is available
        if (!(Get-Module -ListAvailable -Name "Az.*" -ErrorAction SilentlyContinue)) {
            Write-Warning "Azure PowerShell modules not found. Install with: Install-Module Az"
            return $azureResults
        }
        
        # Connect to Azure if credentials provided
        if ($Credentials.TenantId -and $Credentials.ClientId -and $Credentials.ClientSecret) {
            $secureSecret = ConvertTo-SecureString $Credentials.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Credentials.ClientId, $secureSecret)
            Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $Credentials.TenantId -ErrorAction SilentlyContinue
        }
        
        # Get subscriptions if not specified
        if ($Subscriptions.Count -eq 0) {
            $allSubscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
            $Subscriptions = $allSubscriptions | ForEach-Object { $_.Id }
        }
        
        foreach ($subscriptionId in $Subscriptions) {
            Write-Host "   📍 Discovering Azure resources in subscription $subscriptionId..." -ForegroundColor Cyan
            
            try {
                Set-AzContext -SubscriptionId $subscriptionId -ErrorAction SilentlyContinue
                
                $subscriptionResults = @{
                    VirtualMachines = @()
                    StorageAccounts = @()
                    ResourceGroups = @()
                    NetworkSecurityGroups = @()
                    VirtualNetworks = @()
                }
                
                # Resource Groups
                $resourceGroups = Get-AzResourceGroup -ErrorAction SilentlyContinue
                foreach ($rg in $resourceGroups) {
                    $rgData = @{
                        ResourceGroupName = $rg.ResourceGroupName
                        Location = $rg.Location
                        ProvisioningState = $rg.ProvisioningState
                        Tags = $rg.Tags
                        SubscriptionId = $subscriptionId
                    }
                    $subscriptionResults.ResourceGroups += $rgData
                    $azureResults.ResourceGroups += $rgData
                    $azureResults.Summary.TotalResourceGroups++
                }
                
                # Virtual Machines
                $vms = Get-AzVM -ErrorAction SilentlyContinue
                foreach ($vm in $vms) {
                    $vmData = @{
                        Name = $vm.Name
                        ResourceGroupName = $vm.ResourceGroupName
                        Location = $vm.Location
                        VmSize = $vm.HardwareProfile.VmSize
                        OSType = $vm.StorageProfile.OsDisk.OsType
                        ProvisioningState = $vm.ProvisioningState
                        Tags = $vm.Tags
                        SubscriptionId = $subscriptionId
                    }
                    
                    # Get VM status
                    try {
                        $vmStatus = Get-AzVM -ResourceGroupName $vm.ResourceGroupName -Name $vm.Name -Status -ErrorAction SilentlyContinue
                        $vmData.PowerState = ($vmStatus.Statuses | Where-Object { $_.Code -like "PowerState/*" }).DisplayStatus
                    } catch {
                        $vmData.PowerState = "Unknown"
                    }
                    
                    $subscriptionResults.VirtualMachines += $vmData
                    $azureResults.VirtualMachines += $vmData
                    $azureResults.Summary.TotalVMs++
                }
                
                # Storage Accounts
                $storageAccounts = Get-AzStorageAccount -ErrorAction SilentlyContinue
                foreach ($storage in $storageAccounts) {
                    $storageData = @{
                        StorageAccountName = $storage.StorageAccountName
                        ResourceGroupName = $storage.ResourceGroupName
                        Location = $storage.Location
                        SkuName = $storage.Sku.Name
                        Kind = $storage.Kind
                        CreationTime = $storage.CreationTime
                        ProvisioningState = $storage.ProvisioningState
                        EnableHttpsTrafficOnly = $storage.EnableHttpsTrafficOnly
                        Tags = $storage.Tags
                        SubscriptionId = $subscriptionId
                    }
                    
                    $subscriptionResults.StorageAccounts += $storageData
                    $azureResults.StorageAccounts += $storageData
                    $azureResults.Summary.TotalStorageAccounts++
                }
                
                # Network Security Groups
                $nsgs = Get-AzNetworkSecurityGroup -ErrorAction SilentlyContinue
                foreach ($nsg in $nsgs) {
                    $nsgData = @{
                        Name = $nsg.Name
                        ResourceGroupName = $nsg.ResourceGroupName
                        Location = $nsg.Location
                        ProvisioningState = $nsg.ProvisioningState
                        SecurityRules = $nsg.SecurityRules | ForEach-Object {
                            @{
                                Name = $_.Name
                                Protocol = $_.Protocol
                                Direction = $_.Direction
                                Priority = $_.Priority
                                Access = $_.Access
                                SourceAddressPrefix = $_.SourceAddressPrefix
                                DestinationAddressPrefix = $_.DestinationAddressPrefix
                                SourcePortRange = $_.SourcePortRange
                                DestinationPortRange = $_.DestinationPortRange
                            }
                        }
                        Tags = $nsg.Tags
                        SubscriptionId = $subscriptionId
                    }
                    
                    $subscriptionResults.NetworkSecurityGroups += $nsgData
                    $azureResults.NetworkSecurityGroups += $nsgData
                }
                
                # Virtual Networks
                $vnets = Get-AzVirtualNetwork -ErrorAction SilentlyContinue
                foreach ($vnet in $vnets) {
                    $vnetData = @{
                        Name = $vnet.Name
                        ResourceGroupName = $vnet.ResourceGroupName
                        Location = $vnet.Location
                        ProvisioningState = $vnet.ProvisioningState
                        AddressSpace = $vnet.AddressSpace.AddressPrefixes
                        Subnets = $vnet.Subnets | ForEach-Object {
                            @{
                                Name = $_.Name
                                AddressPrefix = $_.AddressPrefix
                                ProvisioningState = $_.ProvisioningState
                            }
                        }
                        Tags = $vnet.Tags
                        SubscriptionId = $subscriptionId
                    }
                    
                    $subscriptionResults.VirtualNetworks += $vnetData
                    $azureResults.VirtualNetworks += $vnetData
                }
                
                $azureResults.Subscriptions[$subscriptionId] = $subscriptionResults
                
            } catch {
                Write-Warning "Failed to discover resources in subscription $subscriptionId`: $($_.Exception.Message)"
                $Session.Errors += "Azure-$subscriptionId`: $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-Warning "Azure discovery initialization failed: $($_.Exception.Message)"
        $Session.Errors += "Azure-Init: $($_.Exception.Message)"
    }
    
    Write-Host "   ✅ Azure discovery completed ($($azureResults.Summary.TotalVMs) VMs, $($azureResults.Summary.TotalStorageAccounts) storage accounts)" -ForegroundColor Green
    return $azureResults
}

function Invoke-GCPDiscovery {
    param(
        [hashtable]$Credentials,
        [string[]]$Projects,
        [hashtable]$Session
    )
    
    $gcpResults = @{
        Projects = @{}
        Summary = @{
            TotalInstances = 0
            TotalBuckets = 0
            TotalNetworks = 0
            TotalCost = 0
        }
        ComputeInstances = @()
        StorageBuckets = @()
        VPCNetworks = @()
        Firewalls = @()
        IAMPolicies = @()
        CloudFunctions = @()
        CloudSQLInstances = @()
    }
    
    try {
        # Check if Google Cloud SDK is available
        if (!(Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
            Write-Warning "Google Cloud SDK not found. Please install and configure gcloud CLI"
            return $gcpResults
        }
        
        # Authenticate if credentials provided
        if ($Credentials.ServiceAccountKeyPath) {
            $env:GOOGLE_APPLICATION_CREDENTIALS = $Credentials.ServiceAccountKeyPath
        }
        
        # Get projects if not specified
        if ($Projects.Count -eq 0) {
            try {
                $projectList = gcloud projects list --format="value(projectId)" 2>$null
                $Projects = $projectList -split "`n" | Where-Object { $_ -ne "" }
            } catch {
                Write-Warning "Failed to list GCP projects. Please specify projects manually."
                return $gcpResults
            }
        }
        
        foreach ($projectId in $Projects) {
            Write-Host "   📍 Discovering GCP resources in project $projectId..." -ForegroundColor Cyan
            
            try {
                gcloud config set project $projectId 2>$null
                
                $projectResults = @{
                    ComputeInstances = @()
                    StorageBuckets = @()
                    VPCNetworks = @()
                    Firewalls = @()
                }
                
                # Compute Instances
                try {
                    $instancesJson = gcloud compute instances list --format="json" 2>$null
                    if ($instancesJson) {
                        $instances = $instancesJson | ConvertFrom-Json
                        foreach ($instance in $instances) {
                            $instanceData = @{
                                Name = $instance.name
                                Zone = ($instance.zone -split '/')[-1]
                                MachineType = ($instance.machineType -split '/')[-1]
                                Status = $instance.status
                                CreationTimestamp = $instance.creationTimestamp
                                InternalIP = $instance.networkInterfaces[0].networkIP
                                ExternalIP = if ($instance.networkInterfaces[0].accessConfigs) { $instance.networkInterfaces[0].accessConfigs[0].natIP } else { $null }
                                Labels = $instance.labels
                                ProjectId = $projectId
                            }
                            
                            $projectResults.ComputeInstances += $instanceData
                            $gcpResults.ComputeInstances += $instanceData
                            $gcpResults.Summary.TotalInstances++
                        }
                    }
                } catch {
                    Write-Warning "Failed to discover compute instances in project $projectId"
                }
                
                # Storage Buckets
                try {
                    $bucketsJson = gcloud storage buckets list --format="json" 2>$null
                    if ($bucketsJson) {
                        $buckets = $bucketsJson | ConvertFrom-Json
                        foreach ($bucket in $buckets) {
                            $bucketData = @{
                                Name = $bucket.name
                                Location = $bucket.location
                                StorageClass = $bucket.storageClass
                                CreationTime = $bucket.timeCreated
                                Labels = $bucket.labels
                                ProjectId = $projectId
                            }
                            
                            $projectResults.StorageBuckets += $bucketData
                            $gcpResults.StorageBuckets += $bucketData
                            $gcpResults.Summary.TotalBuckets++
                        }
                    }
                } catch {
                    Write-Warning "Failed to discover storage buckets in project $projectId"
                }
                
                # VPC Networks
                try {
                    $networksJson = gcloud compute networks list --format="json" 2>$null
                    if ($networksJson) {
                        $networks = $networksJson | ConvertFrom-Json
                        foreach ($network in $networks) {
                            $networkData = @{
                                Name = $network.name
                                IPv4Range = $network.IPv4Range
                                Mode = $network.routingConfig.routingMode
                                CreationTimestamp = $network.creationTimestamp
                                ProjectId = $projectId
                            }
                            
                            $projectResults.VPCNetworks += $networkData
                            $gcpResults.VPCNetworks += $networkData
                            $gcpResults.Summary.TotalNetworks++
                        }
                    }
                } catch {
                    Write-Warning "Failed to discover VPC networks in project $projectId"
                }
                
                # Firewall Rules
                try {
                    $firewallsJson = gcloud compute firewall-rules list --format="json" 2>$null
                    if ($firewallsJson) {
                        $firewalls = $firewallsJson | ConvertFrom-Json
                        foreach ($firewall in $firewalls) {
                            $firewallData = @{
                                Name = $firewall.name
                                Direction = $firewall.direction
                                Priority = $firewall.priority
                                Network = ($firewall.network -split '/')[-1]
                                SourceRanges = $firewall.sourceRanges
                                TargetTags = $firewall.targetTags
                                Allowed = $firewall.allowed
                                Denied = $firewall.denied
                                ProjectId = $projectId
                            }
                            
                            $projectResults.Firewalls += $firewallData
                            $gcpResults.Firewalls += $firewallData
                        }
                    }
                } catch {
                    Write-Warning "Failed to discover firewall rules in project $projectId"
                }
                
                $gcpResults.Projects[$projectId] = $projectResults
                
            } catch {
                Write-Warning "Failed to discover resources in project $projectId`: $($_.Exception.Message)"
                $Session.Errors += "GCP-$projectId`: $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-Warning "GCP discovery initialization failed: $($_.Exception.Message)"
        $Session.Errors += "GCP-Init: $($_.Exception.Message)"
    }
    
    Write-Host "   ✅ GCP discovery completed ($($gcpResults.Summary.TotalInstances) instances, $($gcpResults.Summary.TotalBuckets) storage buckets)" -ForegroundColor Green
    return $gcpResults
}

function Invoke-CrossCloudAnalysis {
    param([hashtable]$Session)
    
    $analysis = @{
        MultiCloudResources = @()
        SecurityGaps = @()
        CostOptimization = @()
        ComplianceIssues = @()
    }
    
    # Identify similar resources across clouds
    $allInstances = @()
    
    if ($Session.Results.AWS.Summary.TotalInstances -gt 0) {
        foreach ($region in $Session.Results.AWS.Regions.Keys) {
            $allInstances += $Session.Results.AWS.Regions[$region].EC2Instances | ForEach-Object { 
                $_ | Add-Member -NotePropertyName "Provider" -NotePropertyValue "AWS" -PassThru
            }
        }
    }
    
    if ($Session.Results.Azure.Summary.TotalVMs -gt 0) {
        $allInstances += $Session.Results.Azure.VirtualMachines | ForEach-Object { 
            $_ | Add-Member -NotePropertyName "Provider" -NotePropertyValue "Azure" -PassThru
        }
    }
    
    if ($Session.Results.GCP.Summary.TotalInstances -gt 0) {
        $allInstances += $Session.Results.GCP.ComputeInstances | ForEach-Object { 
            $_ | Add-Member -NotePropertyName "Provider" -NotePropertyValue "GCP" -PassThru
        }
    }
    
    # Analyze multi-cloud distribution
    $analysis.MultiCloudResources = @{
        TotalInstances = $allInstances.Count
        ByProvider = $allInstances | Group-Object Provider | ForEach-Object {
            @{
                Provider = $_.Name
                Count = $_.Count
                Percentage = [math]::Round(($_.Count / $allInstances.Count) * 100, 2)
            }
        }
    }
    
    return $analysis
}

function Invoke-CloudCostAnalysis {
    param([hashtable]$Session)
    
    # Placeholder for cost analysis - would integrate with cloud billing APIs
    return @{
        TotalMonthlyCost = 0
        CostByProvider = @()
        CostOptimizationRecommendations = @()
    }
}

function Invoke-CloudSecurityAnalysis {
    param([hashtable]$Session)
    
    $securityIssues = @()
    
    # Analyze AWS security
    if ($Session.Results.AWS.SecurityGroups.Count -gt 0) {
        foreach ($sg in $Session.Results.AWS.SecurityGroups) {
            # Check for overly permissive rules
            foreach ($rule in $sg.IngressRules) {
                if ($rule.IpRanges -contains "0.0.0.0/0" -and ($rule.FromPort -eq 22 -or $rule.FromPort -eq 3389)) {
                    $securityIssues += @{
                        Provider = "AWS"
                        Type = "Security Group"
                        Resource = $sg.GroupId
                        Issue = "SSH/RDP access from anywhere"
                        Severity = "High"
                        Region = $sg.Region
                    }
                }
            }
        }
    }
    
    # Analyze unencrypted S3 buckets
    foreach ($bucket in $Session.Results.AWS.S3Buckets) {
        if (!$bucket.Encrypted) {
            $securityIssues += @{
                Provider = "AWS"
                Type = "S3 Bucket"
                Resource = $bucket.BucketName
                Issue = "Bucket not encrypted"
                Severity = "Medium"
                Region = $bucket.Region
            }
        }
    }
    
    # Analyze Azure NSGs
    foreach ($nsg in $Session.Results.Azure.NetworkSecurityGroups) {
        foreach ($rule in $nsg.SecurityRules) {
            if ($rule.SourceAddressPrefix -eq "*" -and $rule.Access -eq "Allow" -and $rule.Direction -eq "Inbound") {
                $securityIssues += @{
                    Provider = "Azure"
                    Type = "Network Security Group"
                    Resource = $nsg.Name
                    Issue = "Inbound access from anywhere"
                    Severity = "High"
                    Region = $nsg.Location
                }
            }
        }
    }
    
    $Session.Summary.SecurityIssues = $securityIssues.Count
    return $securityIssues
}

function Invoke-CloudComplianceAnalysis {
    param([hashtable]$Session)
    
    # Placeholder for compliance analysis
    return @{
        ComplianceFrameworks = @("SOC2", "ISO27001", "GDPR")
        ComplianceScore = 85
        Issues = @()
    }
}

function Export-CloudDiscoveryResults {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # Export AWS results
    if ($Session.Results.AWS.Summary.TotalInstances -gt 0) {
        $awsPath = Join-Path $OutputPath "AWS_Discovery_$timestamp.json"
        $Session.Results.AWS | ConvertTo-Json -Depth 10 | Out-File -FilePath $awsPath
        Write-Host "   📁 AWS results exported: $awsPath" -ForegroundColor Green
    }
    
    # Export Azure results
    if ($Session.Results.Azure.Summary.TotalVMs -gt 0) {
        $azurePath = Join-Path $OutputPath "Azure_Discovery_$timestamp.json"
        $Session.Results.Azure | ConvertTo-Json -Depth 10 | Out-File -FilePath $azurePath
        Write-Host "   📁 Azure results exported: $azurePath" -ForegroundColor Green
    }
    
    # Export GCP results
    if ($Session.Results.GCP.Summary.TotalInstances -gt 0) {
        $gcpPath = Join-Path $OutputPath "GCP_Discovery_$timestamp.json"
        $Session.Results.GCP | ConvertTo-Json -Depth 10 | Out-File -FilePath $gcpPath
        Write-Host "   📁 GCP results exported: $gcpPath" -ForegroundColor Green
    }
    
    # Export summary report
    $summaryPath = Join-Path $OutputPath "Multi_Cloud_Summary_$timestamp.html"
    Export-CloudSummaryReport -Session $Session -OutputPath $summaryPath
}

function Export-CloudSummaryReport {
    param(
        [hashtable]$Session,
        [string]$OutputPath
    )
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Multi-Cloud Discovery Summary - $($Session.CompanyName)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .provider-section { background: #f8f9fa; margin: 20px 0; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: white; padding: 15px; border-radius: 5px; text-align: center; border: 1px solid #dee2e6; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #2c3e50; }
        .aws { border-left: 4px solid #ff9900; }
        .azure { border-left: 4px solid #0078d4; }
        .gcp { border-left: 4px solid #4285f4; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Multi-Cloud Discovery Summary</h1>
        <p>Company: $($Session.CompanyName)</p>
        <p>Discovery Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card aws">
            <div class="metric-value">$($Session.Results.AWS.Summary.TotalInstances)</div>
            <div>AWS EC2 Instances</div>
        </div>
        <div class="metric-card azure">
            <div class="metric-value">$($Session.Results.Azure.Summary.TotalVMs)</div>
            <div>Azure Virtual Machines</div>
        </div>
        <div class="metric-card gcp">
            <div class="metric-value">$($Session.Results.GCP.Summary.TotalInstances)</div>
            <div>GCP Compute Instances</div>
        </div>
    </div>
    
    <div class="provider-section aws">
        <h2>🟠 Amazon Web Services</h2>
        <p><strong>EC2 Instances:</strong> $($Session.Results.AWS.Summary.TotalInstances)</p>
        <p><strong>S3 Buckets:</strong> $($Session.Results.AWS.Summary.TotalS3Buckets)</p>
        <p><strong>VPCs:</strong> $($Session.Results.AWS.Summary.TotalVPCs)</p>
        <p><strong>EBS Volumes:</strong> $($Session.Results.AWS.Summary.TotalVolumes)</p>
    </div>
    
    <div class="provider-section azure">
        <h2>🔵 Microsoft Azure</h2>
        <p><strong>Virtual Machines:</strong> $($Session.Results.Azure.Summary.TotalVMs)</p>
        <p><strong>Storage Accounts:</strong> $($Session.Results.Azure.Summary.TotalStorageAccounts)</p>
        <p><strong>Resource Groups:</strong> $($Session.Results.Azure.Summary.TotalResourceGroups)</p>
    </div>
    
    <div class="provider-section gcp">
        <h2>🔵 Google Cloud Platform</h2>
        <p><strong>Compute Instances:</strong> $($Session.Results.GCP.Summary.TotalInstances)</p>
        <p><strong>Storage Buckets:</strong> $($Session.Results.GCP.Summary.TotalBuckets)</p>
        <p><strong>VPC Networks:</strong> $($Session.Results.GCP.Summary.TotalNetworks)</p>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "   📊 Multi-cloud summary report: $OutputPath" -ForegroundColor Green
}

function Display-CloudDiscoverySummary {
    param([hashtable]$Session)
    
    Write-Host ""
    Write-Host "☁️ Multi-Cloud Discovery Summary:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    
    $totalResources = $Session.Results.AWS.Summary.TotalInstances + 
                     $Session.Results.Azure.Summary.TotalVMs + 
                     $Session.Results.GCP.Summary.TotalInstances
    
    Write-Host "   Total Compute Instances: $totalResources" -ForegroundColor White
    Write-Host "   🟠 AWS EC2: $($Session.Results.AWS.Summary.TotalInstances)" -ForegroundColor Yellow
    Write-Host "   🔵 Azure VMs: $($Session.Results.Azure.Summary.TotalVMs)" -ForegroundColor Blue
    Write-Host "   🔵 GCP Instances: $($Session.Results.GCP.Summary.TotalInstances)" -ForegroundColor Blue
    
    $totalStorage = $Session.Results.AWS.Summary.TotalS3Buckets + 
                   $Session.Results.Azure.Summary.TotalStorageAccounts + 
                   $Session.Results.GCP.Summary.TotalBuckets
    
    Write-Host "   Total Storage: $totalStorage" -ForegroundColor White
    Write-Host "   🟠 AWS S3: $($Session.Results.AWS.Summary.TotalS3Buckets)" -ForegroundColor Yellow
    Write-Host "   🔵 Azure Storage: $($Session.Results.Azure.Summary.TotalStorageAccounts)" -ForegroundColor Blue
    Write-Host "   🔵 GCP Storage: $($Session.Results.GCP.Summary.TotalBuckets)" -ForegroundColor Blue
    
    if ($Session.Errors.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️ Errors encountered:" -ForegroundColor Yellow
        foreach ($error in $Session.Errors) {
            Write-Host "   $error" -ForegroundColor Red
        }
    }
    
    $duration = (Get-Date) - $Session.StartTime
    Write-Host ""
    Write-Host "   Discovery Duration: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor White
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
Export-ModuleMember -Function Invoke-MultiCloudDiscovery

Write-Host "✅ Multi-Cloud Discovery Engine module loaded successfully" -ForegroundColor Green