# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-30

<#
.SYNOPSIS
    AWS Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers AWS infrastructure including EC2 instances, S3 buckets, RDS databases, Lambda functions, 
    VPCs, IAM resources, and other AWS services. This module provides comprehensive AWS cloud 
    environment discovery essential for M&A cloud infrastructure assessment and migration planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Requires: PowerShell 5.1+, AWS Tools for PowerShell, AWS credentials configured
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

function Write-AWSLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter()]
        [string]$Level = "INFO",
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    Write-MandALog -Message $Message -Level $Level -Component "AWSDiscovery" -Context $Context
}

function Test-AWSModule {
    param([string]$ModuleName)
    
    if (-not (Get-Module -Name $ModuleName -ListAvailable)) {
        throw "Required AWS PowerShell module '$ModuleName' is not installed. Please install using: Install-Module $ModuleName -Force"
    }
    
    try {
        Import-Module $ModuleName -Force -ErrorAction Stop
        return $true
    } catch {
        throw "Failed to import AWS PowerShell module '$ModuleName': $($_.Exception.Message)"
    }
}

function Invoke-AWSDiscovery {
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
    Write-AWSLog -Level "HEADER" -Message "=== M&A AWS Discovery Module Starting ===" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "AWS discovery completed successfully"
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
        Write-AWSLog -Level "ERROR" -Message $message -Context $this.Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-AWSLog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-AWSLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-AWSLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE AWS MODULES AND CREDENTIALS
        Write-AWSLog -Level "INFO" -Message "Validating AWS PowerShell modules..." -Context $Context
        
        $requiredModules = @(
            'AWS.Tools.Common',
            'AWS.Tools.EC2', 
            'AWS.Tools.S3',
            'AWS.Tools.RDS',
            'AWS.Tools.Lambda',
            'AWS.Tools.IAMAccessAnalyzer',
            'AWS.Tools.CloudFormation',
            'AWS.Tools.CloudWatch',
            'AWS.Tools.ElasticLoadBalancingV2'
        )
        
        foreach ($module in $requiredModules) {
            try {
                Test-AWSModule -ModuleName $module
                Write-AWSLog -Level "SUCCESS" -Message "AWS module $module validated successfully" -Context $Context
            } catch {
                $result.AddWarning("AWS module $module not available: $($_.Exception.Message)")
                Write-AWSLog -Level "WARN" -Message "AWS module $module not available, some features may be limited" -Context $Context
            }
        }
        
        # Test AWS credentials
        Write-AWSLog -Level "INFO" -Message "Validating AWS credentials..." -Context $Context
        try {
            $identity = Get-STSCallerIdentity -ErrorAction Stop
            Write-AWSLog -Level "SUCCESS" -Message "AWS credentials validated. Account: $($identity.Account), User: $($identity.Arn)" -Context $Context
            $accountId = $identity.Account
        } catch {
            $result.AddError("AWS credentials not configured or invalid. Please run 'Set-AWSCredential' or configure AWS CLI credentials.", $_.Exception, "AWS Credentials")
            return $result
        }

        # 4. GET AWS REGIONS TO SCAN
        $regionsToScan = @()
        if ($Configuration.discovery.aws.regions) {
            $regionsToScan = $Configuration.discovery.aws.regions
        } else {
            # Get all available regions
            try {
                $allRegions = Get-EC2Region -ErrorAction Stop
                $regionsToScan = $allRegions.RegionName
                Write-AWSLog -Level "INFO" -Message "No specific regions configured, will scan all $($regionsToScan.Count) available regions" -Context $Context
            } catch {
                # Fallback to common regions
                $regionsToScan = @('us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1')
                Write-AWSLog -Level "WARN" -Message "Could not get region list, using common regions: $($regionsToScan -join ', ')" -Context $Context
            }
        }

        # 5. DISCOVERY EXECUTION
        Write-AWSLog -Level "HEADER" -Message "Starting AWS Discovery Process for $($regionsToScan.Count) regions" -Context $Context
        
        $discoveryData = @{
            Account = @{
                AccountId = $accountId
                CallerIdentity = $identity
            }
            EC2Instances = @()
            S3Buckets = @()
            RDSDatabases = @()
            LambdaFunctions = @()
            VPCs = @()
            SecurityGroups = @()
            IAMUsers = @()
            IAMRoles = @()
            IAMPolicies = @()
            LoadBalancers = @()
            CloudFormationStacks = @()
            Statistics = @{
                TotalRegions = $regionsToScan.Count
                TotalInstances = 0
                TotalBuckets = 0
                TotalDatabases = 0
                TotalFunctions = 0
                TotalVPCs = 0
                TotalSecurityGroups = 0
                TotalUsers = 0
                TotalRoles = 0
                TotalStacks = 0
            }
        }

        # 5a. Discover IAM resources (global service)
        Write-AWSLog -Level "INFO" -Message "Discovering IAM resources (global)..." -Context $Context
        try {
            # IAM Users
            $iamUsers = Get-IAMUserList -ErrorAction SilentlyContinue
            foreach ($user in $iamUsers) {
                $userInfo = @{
                    UserName = $user.UserName
                    UserId = $user.UserId
                    Arn = $user.Arn
                    CreateDate = $user.CreateDate
                    Path = $user.Path
                    PasswordLastUsed = $user.PasswordLastUsed
                    Tags = ($user.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                }
                $discoveryData.IAMUsers += $userInfo
                $discoveryData.Statistics.TotalUsers++
            }
            
            # IAM Roles
            $iamRoles = Get-IAMRoleList -ErrorAction SilentlyContinue
            foreach ($role in $iamRoles) {
                $roleInfo = @{
                    RoleName = $role.RoleName
                    RoleId = $role.RoleId
                    Arn = $role.Arn
                    CreateDate = $role.CreateDate
                    Path = $role.Path
                    AssumeRolePolicyDocument = $role.AssumeRolePolicyDocument
                    Description = $role.Description
                    MaxSessionDuration = $role.MaxSessionDuration
                    Tags = ($role.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                }
                $discoveryData.IAMRoles += $roleInfo
                $discoveryData.Statistics.TotalRoles++
            }
            
            Write-AWSLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalUsers) IAM users and $($discoveryData.Statistics.TotalRoles) IAM roles" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover some IAM resources: $($_.Exception.Message)")
        }

        # 5b. Discover S3 buckets (global service)
        Write-AWSLog -Level "INFO" -Message "Discovering S3 buckets (global)..." -Context $Context
        try {
            $s3Buckets = Get-S3Bucket -ErrorAction SilentlyContinue
            foreach ($bucket in $s3Buckets) {
                try {
                    $bucketLocation = Get-S3BucketLocation -BucketName $bucket.BucketName -ErrorAction SilentlyContinue
                    $bucketVersioning = Get-S3BucketVersioning -BucketName $bucket.BucketName -ErrorAction SilentlyContinue
                    $bucketEncryption = Get-S3BucketEncryption -BucketName $bucket.BucketName -ErrorAction SilentlyContinue
                    
                    $bucketInfo = @{
                        BucketName = $bucket.BucketName
                        CreationDate = $bucket.CreationDate
                        Region = $bucketLocation.Value
                        VersioningStatus = $bucketVersioning.Status
                        MfaDelete = $bucketVersioning.EnableMfaDelete
                        EncryptionEnabled = $bucketEncryption -ne $null
                        EncryptionAlgorithm = if ($bucketEncryption) { $bucketEncryption.ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm } else { "None" }
                    }
                    
                    $discoveryData.S3Buckets += $bucketInfo
                    $discoveryData.Statistics.TotalBuckets++
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get details for S3 bucket $($bucket.BucketName): $($_.Exception.Message)" -Context $Context
                }
            }
            
            Write-AWSLog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalBuckets) S3 buckets" -Context $Context
            
        } catch {
            $result.AddWarning("Failed to discover S3 buckets: $($_.Exception.Message)")
        }

        # 5c. Discover regional resources
        foreach ($region in $regionsToScan) {
            Write-AWSLog -Level "INFO" -Message "Discovering resources in region: $region" -Context $Context
            
            try {
                Set-DefaultAWSRegion -Region $region
                
                # EC2 Instances
                try {
                    $instances = Get-EC2Instance -ErrorAction SilentlyContinue
                    foreach ($reservation in $instances) {
                        foreach ($instance in $reservation.Instances) {
                            $instanceInfo = @{
                                Region = $region
                                InstanceId = $instance.InstanceId
                                InstanceType = $instance.InstanceType
                                State = $instance.State.Name
                                LaunchTime = $instance.LaunchTime
                                Platform = $instance.Platform
                                Architecture = $instance.Architecture
                                VpcId = $instance.VpcId
                                SubnetId = $instance.SubnetId
                                SecurityGroups = ($instance.SecurityGroups | ForEach-Object { $_.GroupName }) -join ';'
                                PrivateIpAddress = $instance.PrivateIpAddress
                                PublicIpAddress = $instance.PublicIpAddress
                                KeyName = $instance.KeyName
                                ImageId = $instance.ImageId
                                Tags = ($instance.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                            }
                            $discoveryData.EC2Instances += $instanceInfo
                            $discoveryData.Statistics.TotalInstances++
                        }
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get EC2 instances in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                # VPCs
                try {
                    $vpcs = Get-EC2Vpc -ErrorAction SilentlyContinue
                    foreach ($vpc in $vpcs) {
                        $vpcInfo = @{
                            Region = $region
                            VpcId = $vpc.VpcId
                            CidrBlock = $vpc.CidrBlock
                            State = $vpc.State
                            IsDefault = $vpc.IsDefault
                            InstanceTenancy = $vpc.InstanceTenancy
                            DhcpOptionsId = $vpc.DhcpOptionsId
                            Tags = ($vpc.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                        }
                        $discoveryData.VPCs += $vpcInfo
                        $discoveryData.Statistics.TotalVPCs++
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get VPCs in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                # Security Groups
                try {
                    $securityGroups = Get-EC2SecurityGroup -ErrorAction SilentlyContinue
                    foreach ($sg in $securityGroups) {
                        $sgInfo = @{
                            Region = $region
                            GroupId = $sg.GroupId
                            GroupName = $sg.GroupName
                            Description = $sg.Description
                            VpcId = $sg.VpcId
                            InboundRules = $sg.IpPermissions.Count
                            OutboundRules = $sg.IpPermissionsEgress.Count
                            Tags = ($sg.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                        }
                        $discoveryData.SecurityGroups += $sgInfo
                        $discoveryData.Statistics.TotalSecurityGroups++
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get Security Groups in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                # RDS Instances
                try {
                    $rdsInstances = Get-RDSDBInstance -ErrorAction SilentlyContinue
                    foreach ($rds in $rdsInstances) {
                        $rdsInfo = @{
                            Region = $region
                            DBInstanceIdentifier = $rds.DBInstanceIdentifier
                            DBInstanceClass = $rds.DBInstanceClass
                            Engine = $rds.Engine
                            EngineVersion = $rds.EngineVersion
                            DBInstanceStatus = $rds.DBInstanceStatus
                            AllocatedStorage = $rds.AllocatedStorage
                            StorageType = $rds.StorageType
                            MultiAZ = $rds.MultiAZ
                            PubliclyAccessible = $rds.PubliclyAccessible
                            StorageEncrypted = $rds.StorageEncrypted
                            VpcId = $rds.DBSubnetGroup.VpcId
                            InstanceCreateTime = $rds.InstanceCreateTime
                            BackupRetentionPeriod = $rds.BackupRetentionPeriod
                            PreferredBackupWindow = $rds.PreferredBackupWindow
                            PreferredMaintenanceWindow = $rds.PreferredMaintenanceWindow
                        }
                        $discoveryData.RDSDatabases += $rdsInfo
                        $discoveryData.Statistics.TotalDatabases++
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get RDS instances in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                # Lambda Functions
                try {
                    $lambdaFunctions = Get-LMFunctionList -ErrorAction SilentlyContinue
                    foreach ($lambda in $lambdaFunctions) {
                        $lambdaInfo = @{
                            Region = $region
                            FunctionName = $lambda.FunctionName
                            FunctionArn = $lambda.FunctionArn
                            Runtime = $lambda.Runtime
                            Handler = $lambda.Handler
                            CodeSize = $lambda.CodeSize
                            Description = $lambda.Description
                            Timeout = $lambda.Timeout
                            MemorySize = $lambda.MemorySize
                            LastModified = $lambda.LastModified
                            Version = $lambda.Version
                        }
                        $discoveryData.LambdaFunctions += $lambdaInfo
                        $discoveryData.Statistics.TotalFunctions++
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get Lambda functions in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                # CloudFormation Stacks
                try {
                    $cfnStacks = Get-CFNStack -ErrorAction SilentlyContinue
                    foreach ($stack in $cfnStacks) {
                        $stackInfo = @{
                            Region = $region
                            StackName = $stack.StackName
                            StackId = $stack.StackId
                            StackStatus = $stack.StackStatus
                            CreationTime = $stack.CreationTime
                            LastUpdatedTime = $stack.LastUpdatedTime
                            Description = $stack.Description
                            Parameters = ($stack.Parameters | ForEach-Object { "$($_.ParameterKey)=$($_.ParameterValue)" }) -join ';'
                            Tags = ($stack.Tags | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';'
                        }
                        $discoveryData.CloudFormationStacks += $stackInfo
                        $discoveryData.Statistics.TotalStacks++
                    }
                } catch {
                    Write-AWSLog -Level "DEBUG" -Message "Could not get CloudFormation stacks in region $region: $($_.Exception.Message)" -Context $Context
                }
                
                Write-AWSLog -Level "SUCCESS" -Message "Completed discovery for region $region" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover resources in region ${region}: $($_.Exception.Message)")
            }
        }

        Write-AWSLog -Level "SUCCESS" -Message "Completed AWS discovery across all regions" -Context $Context
        Write-AWSLog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalInstances) EC2 instances, $($discoveryData.Statistics.TotalBuckets) S3 buckets, $($discoveryData.Statistics.TotalDatabases) RDS databases, $($discoveryData.Statistics.TotalFunctions) Lambda functions" -Context $Context

        # 6. SAVE DISCOVERY DATA TO CSV FILES
        Write-AWSLog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save EC2 Instances
            if ($discoveryData.EC2Instances.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSInstances.csv"
                $discoveryData.EC2Instances | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.EC2Instances.Count) EC2 instances to $csvPath" -Context $Context
            }
            
            # Save S3 Buckets
            if ($discoveryData.S3Buckets.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSS3Buckets.csv"
                $discoveryData.S3Buckets | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.S3Buckets.Count) S3 buckets to $csvPath" -Context $Context
            }
            
            # Save RDS Databases
            if ($discoveryData.RDSDatabases.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSRDSDatabases.csv"
                $discoveryData.RDSDatabases | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.RDSDatabases.Count) RDS databases to $csvPath" -Context $Context
            }
            
            # Save Lambda Functions
            if ($discoveryData.LambdaFunctions.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSLambdaFunctions.csv"
                $discoveryData.LambdaFunctions | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.LambdaFunctions.Count) Lambda functions to $csvPath" -Context $Context
            }
            
            # Save VPCs
            if ($discoveryData.VPCs.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSVPCs.csv"
                $discoveryData.VPCs | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.VPCs.Count) VPCs to $csvPath" -Context $Context
            }
            
            # Save Security Groups
            if ($discoveryData.SecurityGroups.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSSecurityGroups.csv"
                $discoveryData.SecurityGroups | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.SecurityGroups.Count) security groups to $csvPath" -Context $Context
            }
            
            # Save IAM Users
            if ($discoveryData.IAMUsers.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSIAMUsers.csv"
                $discoveryData.IAMUsers | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.IAMUsers.Count) IAM users to $csvPath" -Context $Context
            }
            
            # Save IAM Roles
            if ($discoveryData.IAMRoles.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSIAMRoles.csv"
                $discoveryData.IAMRoles | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.IAMRoles.Count) IAM roles to $csvPath" -Context $Context
            }
            
            # Save CloudFormation Stacks
            if ($discoveryData.CloudFormationStacks.Count -gt 0) {
                $csvPath = Join-Path $outputPath "AWSCloudFormationStacks.csv"
                $discoveryData.CloudFormationStacks | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-AWSLog -Level "SUCCESS" -Message "Saved $($discoveryData.CloudFormationStacks.Count) CloudFormation stacks to $csvPath" -Context $Context
            }
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "AWSStatistics.csv"
            @($discoveryData.Statistics) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-AWSLog -Level "SUCCESS" -Message "Saved AWS statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 7. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-AWSLog -Level "HEADER" -Message "=== M&A AWS Discovery Module Completed ===" -Context $Context
        Write-AWSLog -Level "SUCCESS" -Message "AWS discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in AWS discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
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

Export-ModuleMember -Function Invoke-AWSDiscovery