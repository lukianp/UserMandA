#Requires -Version 5.1
using namespace System.IO

Set-StrictMode -Version 3.0

class CompanyProfileManager {
    [string]$RootPath
    [string]$CompanyName
    [string]$ProfilePath
    [hashtable]$DirectoryStructure
    
    CompanyProfileManager() {
        $this.RootPath = $this.GetSourceDirectory()
        $this.InitializeDirectoryStructure()
    }
    
    CompanyProfileManager([string]$companyName) {
        $this.RootPath = $this.GetSourceDirectory()
        $this.CompanyName = $companyName
        $this.ProfilePath = Join-Path $this.RootPath $companyName
        $this.InitializeDirectoryStructure()
    }
    
    hidden [string] GetSourceDirectory() {
        # Default to C:\DiscoveryData for company profiles (direct structure)
        $defaultPath = "C:\DiscoveryData"
        
        # Check if environment variable is set for custom path
        if ($env:MANDA_DISCOVERY_PATH) {
            $defaultPath = $env:MANDA_DISCOVERY_PATH
        }
        
        # Ensure the directory exists
        if (!(Test-Path $defaultPath)) {
            New-Item -ItemType Directory -Path $defaultPath -Force | Out-Null
        }
        
        return $defaultPath
    }
    
    hidden [void] InitializeDirectoryStructure() {
        $this.DirectoryStructure = @{
            'Profiles' = @{
                Description = 'Root directory for all company profiles'
                Subdirectories = @{
                    'CompanyProfile' = @{
                        Description = 'Individual company profile directory'
                        Subdirectories = @{
                            'Discovery' = @{
                                Description = 'Discovery data organized by source'
                                Subdirectories = @{
                                    'ActiveDirectory' = 'AD users, groups, OUs, GPOs'
                                    'Azure' = 'Azure AD/Entra ID data'
                                    'Exchange' = 'Mailboxes, distribution lists, permissions'
                                    'SharePoint' = 'Sites, libraries, permissions'
                                    'Teams' = 'Teams, channels, memberships'
                                    'FileShares' = 'File server data and permissions'
                                    'Applications' = 'Enterprise apps and registrations'
                                    'Infrastructure' = 'Network, servers, services'
                                    'Security' = 'Certificates, policies, compliance'
                                    'PaloAlto' = 'Palo Alto Networks configuration'
                                }
                            }
                            'Raw' = @{
                                Description = 'Raw export files from discovery'
                                Subdirectories = @{}
                            }
                            'Processed' = @{
                                Description = 'Processed and normalized data'
                                Subdirectories = @{
                                    'Users' = 'User profiles with all related data'
                                    'Groups' = 'Security groups and memberships'
                                    'Computers' = 'Computer accounts and profiles'
                                    'Applications' = 'Application inventory and mappings'
                                    'Permissions' = 'Consolidated permission reports'
                                    'Waves' = 'Migration wave assignments'
                                }
                            }
                            'Reports' = @{
                                Description = 'Generated reports and analytics'
                                Subdirectories = @{
                                    'Executive' = 'High-level summary reports'
                                    'Technical' = 'Detailed technical reports'
                                    'Compliance' = 'Compliance and security reports'
                                    'Migration' = 'Migration readiness reports'
                                }
                            }
                            'Logs' = @{
                                Description = 'Discovery and processing logs'
                                Subdirectories = @{
                                    'Discovery' = 'Discovery execution logs'
                                    'Processing' = 'Data processing logs'
                                    'Errors' = 'Error logs and troubleshooting'
                                }
                            }
                            'Config' = @{
                                Description = 'Company-specific configuration'
                                Subdirectories = @{}
                            }
                            'Migration' = @{
                                Description = 'Migration tracking and status'
                                Subdirectories = @{
                                    'Planning' = 'Migration planning documents'
                                    'Mappings' = 'Source to target mappings'
                                    'Status' = 'Migration status tracking'
                                    'Validation' = 'Post-migration validation'
                                }
                            }
                        }
                    }
                }
            }
            'Templates' = @{
                Description = 'Template files for reports and exports'
                Subdirectories = @{
                    'Reports' = 'Report templates'
                    'Exports' = 'Export format templates'
                    'Mappings' = 'Mapping templates'
                }
            }
            'Tools' = @{
                Description = 'Supporting tools and utilities'
                Subdirectories = @{
                    'Migration' = 'Migration tools'
                    'Validation' = 'Validation tools'
                    'Reporting' = 'Reporting tools'
                }
            }
        }
    }
    
    [void] CreateCompanyProfile([string]$companyName) {
        $this.CompanyName = $companyName
        $this.ProfilePath = Join-Path $this.RootPath $companyName
        
        Write-Host "Creating company profile for: $companyName" -ForegroundColor Green
        
        # Create the actual directory structure that matches ljpops
        $directories = @(
            "Archives",
            "Backups", 
            "Credentials",
            "Credentials\Backups",
            "Discovery",
            "Exports",
            "Logs",
            "Logs\Application",
            "Logs\Audit", 
            "Logs\Security",
            "Raw",
            "Reports",
            "Temp"
        )
        
        foreach ($dir in $directories) {
            $dirPath = Join-Path $this.ProfilePath $dir
            if (!(Test-Path $dirPath)) {
                New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
                Write-Verbose "Created directory: $dirPath"
            }
        }
        
        $this.CreateMetadataFile()
        $this.CreateCredentialsTemplate()
        
        Write-Host "Company profile created successfully at: $($this.ProfilePath)" -ForegroundColor Green
    }
    
    hidden [void] CreateDirectoryStructure([string]$basePath, [hashtable]$structure) {
        foreach ($dir in $structure.GetEnumerator()) {
            $dirPath = Join-Path $basePath $dir.Key
            
            if (!(Test-Path $dirPath)) {
                New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
                Write-Verbose "Created directory: $dirPath"
            }
            
            if ($dir.Value -is [hashtable] -and $dir.Value.ContainsKey('Subdirectories')) {
                $this.CreateDirectoryStructure($dirPath, $dir.Value.Subdirectories)
            }
            elseif ($dir.Value -is [hashtable]) {
                foreach ($subdir in $dir.Value.GetEnumerator()) {
                    $subdirPath = Join-Path $dirPath $subdir.Key
                    if (!(Test-Path $subdirPath)) {
                        New-Item -ItemType Directory -Path $subdirPath -Force | Out-Null
                        Write-Verbose "Created subdirectory: $subdirPath"
                    }
                }
            }
        }
    }
    
    hidden [void] CreateMetadataFile() {
        $metadata = @{
            CompanyName = $this.CompanyName
            ProfileVersion = "1.0"
            CreatedDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            CreatedBy = $env:USERNAME
            ProfilePath = $this.ProfilePath
            Description = "M&A Discovery Profile for $($this.CompanyName)"
            DiscoveryStatus = @{
                LastRun = $null
                CompletedModules = @()
                PendingModules = @()
                FailedModules = @()
            }
            Statistics = @{
                Users = 0
                Groups = 0
                Computers = 0
                Applications = 0
                Mailboxes = 0
                SharePointSites = 0
                Teams = 0
            }
        }
        
        $metadataPath = Join-Path $this.ProfilePath "profile-metadata.json"
        $metadata | ConvertTo-Json -Depth 5 | Set-Content -Path $metadataPath -Encoding UTF8
        
        Write-Verbose "Created metadata file: $metadataPath"
    }
    
    hidden [void] CreateCredentialsTemplate() {
        # Create the discoverycredentials.config template matching ljpops structure
        $credTemplate = @{
            TenantId = ""
            ApplicationObjectId = ""
            ExpiryDate = ""
            PermissionCount = 0
            SecretKeyId = ""
            CreatedDate = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
            ScriptVersion = "4.0.0"
            ValidityYears = 2
            AzureRoles = "Reader"
            AzureSubscriptionCount = 0
            DaysUntilExpiry = 730
            ApplicationName = "MandADiscovery"
            AzureADRoles = @("Cloud Application Administrator")
            ClientSecret = ""
            ComputerName = $env:COMPUTERNAME
            Domain = $env:USERDOMAIN
            PowerShellVersion = "5.1+"
            ClientId = ""
            CreatedBy = $env:USERNAME
            CreatedOnComputer = $env:COMPUTERNAME
            RoleAssignmentSuccess = $false
        }
        
        # Create the main credentials file
        $credPath = Join-Path $this.ProfilePath "Credentials\discoverycredentials.config"
        $credTemplate | ConvertTo-Json -Depth 3 | Set-Content -Path $credPath -Encoding UTF8
        
        # Also create a template file for reference
        $templatePath = Join-Path $this.ProfilePath "Credentials\credentials-template.json"
        $credTemplate | ConvertTo-Json -Depth 3 | Set-Content -Path $templatePath -Encoding UTF8
        
        Write-Verbose "Created credentials files: $credPath and $templatePath"
    }
    
    [hashtable] GetProfilePaths() {
        if (!$this.CompanyName -or !$this.ProfilePath) {
            throw "Company profile not initialized"
        }
        
        return @{
            Root = $this.ProfilePath
            Discovery = Join-Path $this.ProfilePath "Discovery"
            Raw = Join-Path $this.ProfilePath "Raw"
            Processed = Join-Path $this.ProfilePath "Processed"
            Reports = Join-Path $this.ProfilePath "Reports"
            Logs = Join-Path $this.ProfilePath "Logs"
            Config = Join-Path $this.ProfilePath "Config"
            Migration = Join-Path $this.ProfilePath "Migration"
            
            DiscoveryPaths = @{
                ActiveDirectory = Join-Path $this.ProfilePath "Discovery\ActiveDirectory"
                Azure = Join-Path $this.ProfilePath "Discovery\Azure"
                Exchange = Join-Path $this.ProfilePath "Discovery\Exchange"
                SharePoint = Join-Path $this.ProfilePath "Discovery\SharePoint"
                Teams = Join-Path $this.ProfilePath "Discovery\Teams"
                FileShares = Join-Path $this.ProfilePath "Discovery\FileShares"
                Applications = Join-Path $this.ProfilePath "Discovery\Applications"
                Infrastructure = Join-Path $this.ProfilePath "Discovery\Infrastructure"
                Security = Join-Path $this.ProfilePath "Discovery\Security"
                PaloAlto = Join-Path $this.ProfilePath "Discovery\PaloAlto"
            }
            
            ProcessedPaths = @{
                Users = Join-Path $this.ProfilePath "Processed\Users"
                Groups = Join-Path $this.ProfilePath "Processed\Groups"
                Computers = Join-Path $this.ProfilePath "Processed\Computers"
                Applications = Join-Path $this.ProfilePath "Processed\Applications"
                Permissions = Join-Path $this.ProfilePath "Processed\Permissions"
                Waves = Join-Path $this.ProfilePath "Processed\Waves"
            }
        }
    }
    
    [void] SaveDiscoveryData([string]$moduleName, [object]$data, [string]$format = 'JSON') {
        $paths = $this.GetProfilePaths()
        $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
        
        $moduleDir = Join-Path $paths.Discovery $moduleName
        if (!(Test-Path $moduleDir)) {
            New-Item -ItemType Directory -Path $moduleDir -Force | Out-Null
        }
        
        $fileName = "${moduleName}_${timestamp}"
        $filePath = $null
        
        switch ($format.ToUpper()) {
            'JSON' {
                $filePath = Join-Path $moduleDir "$fileName.json"
                $data | ConvertTo-Json -Depth 10 | Set-Content -Path $filePath -Encoding UTF8
            }
            'CSV' {
                $filePath = Join-Path $moduleDir "$fileName.csv"
                $data | Export-Csv -Path $filePath -NoTypeInformation
            }
            'XML' {
                $filePath = Join-Path $moduleDir "$fileName.xml"
                $data | Export-Clixml -Path $filePath
            }
            default {
                throw "Unsupported format: $format"
            }
        }
        
        if ($filePath) {
            $latestLink = Join-Path $moduleDir "${moduleName}_Latest.$($format.ToLower())"
            if (Test-Path $latestLink) {
                Remove-Item $latestLink -Force
            }
            Copy-Item -Path $filePath -Destination $latestLink -Force
            
            Write-Verbose "Saved discovery data to: $filePath"
        }
    }
    
    [object] LoadDiscoveryData([string]$moduleName, [string]$format = 'JSON', [bool]$latest = $true) {
        $paths = $this.GetProfilePaths()
        $moduleDir = Join-Path $paths.Discovery $moduleName
        
        if (!(Test-Path $moduleDir)) {
            throw "Discovery data not found for module: $moduleName"
        }
        
        if ($latest) {
            $filePath = Join-Path $moduleDir "${moduleName}_Latest.$($format.ToLower())"
        }
        else {
            $files = Get-ChildItem -Path $moduleDir -Filter "${moduleName}_*.$($format.ToLower())" | 
                     Sort-Object -Property LastWriteTime -Descending
            
            if ($files.Count -eq 0) {
                throw "No discovery data files found for module: $moduleName"
            }
            
            $filePath = $files[0].FullName
        }
        
        if (!(Test-Path $filePath)) {
            throw "Discovery data file not found: $filePath"
        }
        
        switch ($format.ToUpper()) {
            'JSON' {
                return Get-Content -Path $filePath -Raw | ConvertFrom-Json
            }
            'CSV' {
                return Import-Csv -Path $filePath
            }
            'XML' {
                return Import-Clixml -Path $filePath
            }
            default {
                throw "Unsupported format: $format"
            }
        }
        
        # This should never be reached, but PowerShell requires explicit return
        return $null
    }
    
    [void] UpdateProfileMetadata([hashtable]$updates) {
        $metadataPath = Join-Path $this.ProfilePath "profile-metadata.json"
        
        if (!(Test-Path $metadataPath)) {
            throw "Profile metadata not found"
        }
        
        $metadata = Get-Content -Path $metadataPath -Raw | ConvertFrom-Json
        
        foreach ($key in $updates.Keys) {
            if ($metadata.PSObject.Properties.Name -contains $key) {
                $metadata.$key = $updates[$key]
            }
        }
        
        $metadata.LastModified = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $metadata.ModifiedBy = $env:USERNAME
        
        $metadata | ConvertTo-Json -Depth 5 | Set-Content -Path $metadataPath -Encoding UTF8
    }
    
    [array] ListCompanyProfiles() {
        if (!(Test-Path $this.RootPath)) {
            return @()
        }
        
        $profiles = @()
        
        # Look for company profiles directly in the root path
        Get-ChildItem -Path $this.RootPath -Directory | ForEach-Object {
            $profilePath = $_.FullName
            
            # Check if this looks like a valid company profile (has expected structure)
            $hasCredentials = Test-Path (Join-Path $profilePath "Credentials")
            $hasRaw = Test-Path (Join-Path $profilePath "Raw")
            $hasLogs = Test-Path (Join-Path $profilePath "Logs")
            
            if ($hasCredentials -or $hasRaw -or $hasLogs) {
                # This looks like a valid company profile
                $metadataPath = Join-Path $profilePath "profile-metadata.json"
                
                if (Test-Path $metadataPath) {
                    try {
                        $metadata = Get-Content -Path $metadataPath -Raw | ConvertFrom-Json
                        $profiles += [PSCustomObject]@{
                            Name = $_.Name
                            Path = $profilePath
                            Created = $metadata.CreatedDate
                            LastModified = $metadata.LastModified
                            Statistics = $metadata.Statistics
                            Status = if ($metadata.DiscoveryStatus.LastRun) { "Active" } else { "New" }
                        }
                    } catch {
                        # Metadata exists but is invalid, still add the profile
                        $profiles += [PSCustomObject]@{
                            Name = $_.Name
                            Path = $profilePath
                            Created = "Unknown"
                            LastModified = "Unknown"
                            Statistics = @{}
                            Status = "Detected"
                        }
                    }
                } else {
                    # No metadata but valid structure
                    $profiles += [PSCustomObject]@{
                        Name = $_.Name
                        Path = $profilePath
                        Created = "Unknown"
                        LastModified = "Unknown"
                        Statistics = @{}
                        Status = "Detected"
                    }
                }
            }
        }
        
        return $profiles | Sort-Object -Property Name
    }
    
    [void] SetActiveProfile([string]$companyName) {
        $this.CompanyName = $companyName
        $this.ProfilePath = Join-Path $this.RootPath $companyName
        
        if (!(Test-Path $this.ProfilePath)) {
            throw "Company profile not found: $companyName"
        }
        
        $env:MANDA_ACTIVE_PROFILE = $companyName
        $env:MANDA_PROFILE_PATH = $this.ProfilePath
        
        Write-Host "Active profile set to: $companyName" -ForegroundColor Green
    }
    
    [hashtable] GetProfile() {
        if (!$this.CompanyName -or !$this.ProfilePath) {
            throw "Company profile not initialized"
        }
        
        $metadataPath = Join-Path $this.ProfilePath "profile-metadata.json"
        if (Test-Path $metadataPath) {
            $metadata = Get-Content -Path $metadataPath -Raw | ConvertFrom-Json
            return @{
                CompanyName = $this.CompanyName
                ProfilePath = $this.ProfilePath
                Metadata = $metadata
                Paths = $this.GetProfilePaths()
            }
        }
        
        return @{
            CompanyName = $this.CompanyName
            ProfilePath = $this.ProfilePath
            Paths = $this.GetProfilePaths()
        }
    }
    
    [string] GetProfileDataPath() {
        if (!$this.ProfilePath) {
            throw "Company profile not initialized"
        }
        return $this.ProfilePath
    }

    [void] GenerateDirectoryReport() {
        $reportPath = Join-Path $this.ProfilePath "Reports\directory-structure.txt"
        $report = @()
        
        $report += "Company Profile Directory Structure"
        $report += "==================================="
        $report += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $report += "Profile: $($this.CompanyName)"
        $report += "Path: $($this.ProfilePath)"
        $report += ""
        
        $this.GenerateTreeReport($this.ProfilePath, "", [ref]$report)
        
        $report | Set-Content -Path $reportPath -Encoding UTF8
        Write-Host "Directory structure report saved to: $reportPath" -ForegroundColor Green
    }
    
    hidden [void] GenerateTreeReport([string]$path, [string]$indent, [ref]$report) {
        $items = Get-ChildItem -Path $path | Sort-Object -Property PSIsContainer -Descending
        
        foreach ($item in $items) {
            if ($item.PSIsContainer) {
                $report.Value += "$indent+-- $($item.Name)\"
                $this.GenerateTreeReport($item.FullName, "$indent|   ", $report)
            }
            else {
                $report.Value += "$indent|-- $($item.Name)"
            }
        }
    }
}

function New-CompanyProfile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName
    )
    
    $manager = [CompanyProfileManager]::new()
    $manager.CreateCompanyProfile($CompanyName)
    
    return $manager.GetProfilePaths()
}

function Get-CompanyProfileManager {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string]$CompanyName
    )
    
    if ($CompanyName) {
        return [CompanyProfileManager]::new($CompanyName)
    }
    else {
        return [CompanyProfileManager]::new()
    }
}

function Get-CompanyProfiles {
    [CmdletBinding()]
    param()
    
    $manager = [CompanyProfileManager]::new()
    return $manager.ListCompanyProfiles()
}

function Set-ActiveCompanyProfile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName
    )
    
    $manager = [CompanyProfileManager]::new()
    $manager.SetActiveProfile($CompanyName)
}

Export-ModuleMember -Function New-CompanyProfile, Get-CompanyProfileManager, Get-CompanyProfiles, Set-ActiveCompanyProfile