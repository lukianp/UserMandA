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
        $this.ProfilePath = Join-Path $this.RootPath "Profiles\$companyName"
        $this.InitializeDirectoryStructure()
    }
    
    hidden [string] GetSourceDirectory() {
        $scriptRoot = $PSScriptRoot
        
        while ($scriptRoot -and !(Test-Path (Join-Path $scriptRoot "QuickStart.ps1"))) {
            $scriptRoot = Split-Path $scriptRoot -Parent
        }
        
        if (!$scriptRoot) {
            $possiblePaths = @(
                "D:\Scripts\UserMandA",
                "C:\Scripts\UserMandA",
                "$env:USERPROFILE\Scripts\UserMandA",
                "$env:ProgramData\UserMandA"
            )
            
            foreach ($path in $possiblePaths) {
                if (Test-Path (Join-Path $path "QuickStart.ps1")) {
                    $scriptRoot = $path
                    break
                }
            }
        }
        
        if (!$scriptRoot) {
            throw "Could not determine UserMandA root directory. Please ensure QuickStart.ps1 exists in the root."
        }
        
        return $scriptRoot
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
        $this.ProfilePath = Join-Path $this.RootPath "Profiles\$companyName"
        
        Write-Host "Creating company profile for: $companyName" -ForegroundColor Green
        
        $this.CreateDirectoryStructure($this.ProfilePath, $this.DirectoryStructure.Profiles.Subdirectories.CompanyProfile.Subdirectories)
        
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
        $credTemplate = @{
            AzureAD = @{
                TenantId = ""
                ClientId = ""
                ClientSecret = ""
                CertificateThumbprint = ""
                Username = ""
                AuthMethod = "ServicePrincipal"
            }
            OnPremAD = @{
                DomainController = ""
                Domain = ""
                Username = ""
                UseCurrentUser = $false
            }
            Exchange = @{
                ServerUri = ""
                AuthMethod = "Kerberos"
                Username = ""
            }
            SharePoint = @{
                SiteUrl = ""
                AuthMethod = "AppOnly"
                ClientId = ""
                ClientSecret = ""
            }
            PaloAlto = @{
                PanoramaHost = ""
                ApiKey = ""
                Username = ""
                AuthMethod = "APIKey"
            }
        }
        
        $credPath = Join-Path $this.ProfilePath "credentials-template.json"
        $credTemplate | ConvertTo-Json -Depth 3 | Set-Content -Path $credPath -Encoding UTF8
        
        Write-Verbose "Created credentials template: $credPath"
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
        $profilesPath = Join-Path $this.RootPath "Profiles"
        
        if (!(Test-Path $profilesPath)) {
            return @()
        }
        
        $profiles = @()
        
        Get-ChildItem -Path $profilesPath -Directory | ForEach-Object {
            $metadataPath = Join-Path $_.FullName "profile-metadata.json"
            
            if (Test-Path $metadataPath) {
                $metadata = Get-Content -Path $metadataPath -Raw | ConvertFrom-Json
                $profiles += [PSCustomObject]@{
                    Name = $_.Name
                    Path = $_.FullName
                    Created = $metadata.CreatedDate
                    LastModified = $metadata.LastModified
                    Statistics = $metadata.Statistics
                    Status = if ($metadata.DiscoveryStatus.LastRun) { "Active" } else { "New" }
                }
            }
        }
        
        return $profiles | Sort-Object -Property Name
    }
    
    [void] SetActiveProfile([string]$companyName) {
        $this.CompanyName = $companyName
        $this.ProfilePath = Join-Path $this.RootPath "Profiles\$companyName"
        
        if (!(Test-Path $this.ProfilePath)) {
            throw "Company profile not found: $companyName"
        }
        
        $env:MANDA_ACTIVE_PROFILE = $companyName
        $env:MANDA_PROFILE_PATH = $this.ProfilePath
        
        Write-Host "Active profile set to: $companyName" -ForegroundColor Green
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