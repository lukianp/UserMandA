<#
.SYNOPSIS
    Enhanced GPO discovery module with robust XML parsing and namespace handling
.DESCRIPTION
    Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling
    Fixed version with Invoke-GPODiscovery function added
.NOTES
    Version: 2.0.0 (Fixed)
    Date: 2025-06-02
#>

#Requires -Modules ActiveDirectory, GroupPolicy

# --- Helper Functions ---
function Export-DataToCSV {
    [CmdletBinding()]
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
        Write-MandALog "Failed to export data to $FilePath $($_.Exception.Message)" -Level "ERROR"
    }
}

# --- Main Discovery Function ---
function Get-GPOData {
    param(
        [string]$OutputPath,
        [string]$DomainController
    )
    
    try {
        Write-MandALog "Starting comprehensive GPO analysis..." -Level "HEADER"
        
        # Initialize collections
        $allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allGPOLinks = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allGPOPermissions = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        # Create GPO reports directory
        $gpoReportsPath = Join-Path $OutputPath "GPOReports"
        if (!(Test-Path $gpoReportsPath)) {
            New-Item -Path $gpoReportsPath -ItemType Directory -Force | Out-Null
            Write-MandALog "Created GPO reports directory: $gpoReportsPath" -Level "INFO"
        }
        
        # Get all GPOs in domain with enhanced error handling
        try {
            $gpoParams = @{
                All = $true
                ErrorAction = 'Stop'
            }
            if ($DomainController) {
                $gpoParams.Server = $DomainController
            }
            
            $gpos = Get-GPO @gpoParams
            Write-MandALog "Found $($gpos.Count) GPOs to analyze" -Level "INFO"
        } catch {
            Write-MandALog "Failed to retrieve GPOs: $($_.Exception.Message)" -Level "ERROR"
            throw "Unable to retrieve GPOs from domain"
        }
        
        $processedCount = 0
        $successfullyProcessed = 0
        $failedProcessing = 0
        
        foreach ($gpo in $gpos) {
            $processedCount++
            Write-Progress -Activity "Analyzing GPOs" -Status "GPO $processedCount of $($gpos.Count): $($gpo.DisplayName)" `
                -PercentComplete (($processedCount / $gpos.Count) * 100)
            
            try {
                # Add GPO to main list
                $gpoObject = [PSCustomObject]@{
                    Id = if ($gpo.Id) { $gpo.Id.ToString() } else { "Unknown" }
                    DisplayName = if ($gpo.DisplayName) { $gpo.DisplayName } else { "Unknown GPO" }
                    Status = if ($gpo.GpoStatus) { $gpo.GpoStatus } else { "Unknown" }
                    CreationTime = if ($gpo.CreationTime) { $gpo.CreationTime } else { "Unknown" }
                    ModificationTime = if ($gpo.ModificationTime) { $gpo.ModificationTime } else { "Unknown" }
                    DomainName = if ($gpo.DomainName) { $gpo.DomainName } else { "Unknown" }
                    Owner = if ($gpo.Owner) { $gpo.Owner } else { "Unknown" }
                    Description = if ($gpo.Description) { $gpo.Description } else { "" }
                    WmiFilter = if ($gpo.WmiFilter) { $gpo.WmiFilter.Name } else { "" }
                    UserEnabled = ($gpo.GpoStatus -notmatch "UserSettingsDisabled")
                    ComputerEnabled = ($gpo.GpoStatus -notmatch "ComputerSettingsDisabled")
                }
                
                $allGPOs.Add($gpoObject)
                
                # Get GPO Links
                try {
                    $gpoLinks = Get-GPOLinks -GPO $gpo -DomainController $DomainController
                    if ($gpoLinks) {
                        $allGPOLinks.AddRange($gpoLinks)
                    }
                } catch {
                    Write-MandALog "Failed to get links for GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
                }
                
                # Get GPO Permissions
                try {
                    $gpoPermissions = Get-GPOPermissions -GPO $gpo
                    if ($gpoPermissions) {
                        $allGPOPermissions.AddRange($gpoPermissions)
                    }
                } catch {
                    Write-MandALog "Failed to get permissions for GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
                }
                
                # Generate GPO report
                try {
                    $reportPath = Join-Path $gpoReportsPath "$($gpo.Id)_$($gpo.DisplayName -replace '[\\/:*?"<>|]', '_').xml"
                    Get-GPOReport -Guid $gpo.Id -ReportType Xml -Path $reportPath -ErrorAction Stop
                    
                    # Parse GPO report for specific settings
                    $gpoSettings = Parse-GPOReport -ReportPath $reportPath -GPO $gpo
                    if ($gpoSettings) {
                        if ($gpoSettings.DriveMappings) { $allDriveMappings.AddRange($gpoSettings.DriveMappings) }
                        if ($gpoSettings.PrinterMappings) { $allPrinterMappings.AddRange($gpoSettings.PrinterMappings) }
                        if ($gpoSettings.FolderRedirections) { $allFolderRedirections.AddRange($gpoSettings.FolderRedirections) }
                        if ($gpoSettings.LogonScripts) { $allLogonScripts.AddRange($gpoSettings.LogonScripts) }
                    }
                } catch {
                    Write-MandALog "Failed to generate report for GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
                }
                
                $successfullyProcessed++
                
            } catch {
                Write-MandALog "Error processing GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "ERROR"
                $failedProcessing++
            }
        }
        
        Write-Progress -Activity "Analyzing GPOs" -Completed
        
        # Enhanced summary
        Write-MandALog "GPO Analysis Summary:" -Level "SUCCESS"
        Write-MandALog "  Total GPOs processed: $($allGPOs.Count)" -Level "INFO"
        Write-MandALog "  Successfully analyzed: $successfullyProcessed" -Level "SUCCESS"
        Write-MandALog "  Failed to analyze: $failedProcessing" -Level "WARN"
        Write-MandALog "  GPO Links found: $($allGPOLinks.Count)" -Level "INFO"
        Write-MandALog "  Drive Mappings found: $($allDriveMappings.Count)" -Level "INFO"
        Write-MandALog "  Printer Mappings found: $($allPrinterMappings.Count)" -Level "INFO"
        Write-MandALog "  Folder Redirections found: $($allFolderRedirections.Count)" -Level "INFO"
        Write-MandALog "  Logon Scripts found: $($allLogonScripts.Count)" -Level "INFO"
        
        return @{
            GPOs = $allGPOs
            GPOLinks = $allGPOLinks
            GPOPermissions = $allGPOPermissions
            DriveMappings = $allDriveMappings
            PrinterMappings = $allPrinterMappings
            FolderRedirections = $allFolderRedirections
            LogonScripts = $allLogonScripts
            ProcessingStats = @{
                Total = $allGPOs.Count
                Successful = $successfullyProcessed
                Failed = $failedProcessing
            }
        }
        
    } catch {
        Write-MandALog "GPO analysis failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-GPOLinks {
    param(
        [Microsoft.GroupPolicy.Gpo]$GPO,
        [string]$DomainController
    )
    
    $links = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        # Get the domain
        $domain = Get-ADDomain -Server $DomainController -ErrorAction Stop
        
        # Search for GPO links in OUs
        $searcher = [ADSISearcher]"(&(objectClass=organizationalUnit)(gPLink=*$($GPO.Id)*))"
        $searcher.SearchRoot = [ADSI]"LDAP://$($domain.DistinguishedName)"
        $searcher.PageSize = 1000
        $results = $searcher.FindAll()
        
        foreach ($result in $results) {
            $ou = $result.Properties
            $links.Add([PSCustomObject]@{
                GPOId = $GPO.Id.ToString()
                GPOName = $GPO.DisplayName
                LinkPath = $ou.distinguishedname[0]
                LinkType = "OU"
                Enforced = $false  # Would need to parse gPLink attribute
                LinkEnabled = $true  # Would need to parse gPLink attribute
            })
        }
        
        # Also check domain root
        $domainObj = Get-ADObject -Identity $domain.DistinguishedName -Properties gPLink -Server $DomainController
        if ($domainObj.gPLink -match $GPO.Id) {
            $links.Add([PSCustomObject]@{
                GPOId = $GPO.Id.ToString()
                GPOName = $GPO.DisplayName
                LinkPath = $domain.DistinguishedName
                LinkType = "Domain"
                Enforced = $false
                LinkEnabled = $true
            })
        }
        
    } catch {
        Write-MandALog "Error getting links for GPO '$($GPO.DisplayName)': $($_.Exception.Message)" -Level "WARN"
    }
    
    return $links
}

function Get-GPOPermissions {
    param(
        [Microsoft.GroupPolicy.Gpo]$GPO
    )
    
    $permissions = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    try {
        $gpoSecurity = $GPO.GetSecurityInfo()
        
        foreach ($ace in $gpoSecurity.Discretionary) {
            $permissions.Add([PSCustomObject]@{
                GPOId = $GPO.Id.ToString()
                GPOName = $GPO.DisplayName
                Trustee = $ace.Trustee.Name
                TrusteeType = $ace.Trustee.SidType
                Permission = $ace.Permission
                Inherited = $ace.Inherited
                Denied = $ace.Denied
            })
        }
        
    } catch {
        Write-MandALog "Error getting permissions for GPO '$($GPO.DisplayName)': $($_.Exception.Message)" -Level "WARN"
    }
    
    return $permissions
}

function Parse-GPOReport {
    param(
        [string]$ReportPath,
        [Microsoft.GroupPolicy.Gpo]$GPO
    )
    
    $result = @{
        DriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        PrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        FolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
        LogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
    }
    
    if (-not (Test-Path $ReportPath)) {
        return $result
    }
    
    try {
        [xml]$xmlReport = Get-Content $ReportPath -Raw
        
        # Parse Drive Mappings
        $driveMappings = $xmlReport.GPO.User.ExtensionData.Extension | 
            Where-Object { $_.type -eq 'q1:DriveMapSettings' }
        
        if ($driveMappings) {
            foreach ($drive in $driveMappings.DriveMapSettings.Drive) {
                $result.DriveMappings.Add([PSCustomObject]@{
                    GPOId = $GPO.Id.ToString()
                    GPOName = $GPO.DisplayName
                    DriveLetter = $drive.Properties.letter
                    Path = $drive.Properties.path
                    Label = $drive.Properties.label
                    Action = $drive.Properties.action
                    ThisDrive = $drive.Properties.thisDrive
                    Persistent = $drive.Properties.persistent
                    UserName = $drive.Properties.userName
                })
            }
        }
        
        # Parse Printer Mappings
        $printerMappings = $xmlReport.GPO.User.ExtensionData.Extension | 
            Where-Object { $_.type -eq 'q1:PrinterSettings' }
            
        if ($printerMappings) {
            foreach ($printer in $printerMappings.PrinterSettings.Printer) {
                $result.PrinterMappings.Add([PSCustomObject]@{
                    GPOId = $GPO.Id.ToString()
                    GPOName = $GPO.DisplayName
                    PrinterPath = $printer.Properties.path
                    Action = $printer.Properties.action
                    SetAsDefault = $printer.Properties.default
                    Location = $printer.Properties.location
                    Comment = $printer.Properties.comment
                })
            }
        }
        
        # Parse Folder Redirections
        $folderRedirections = $xmlReport.GPO.User.ExtensionData.Extension | 
            Where-Object { $_.type -eq 'q1:FolderRedirectionSettings' }
            
        if ($folderRedirections) {
            foreach ($folder in $folderRedirections.Folder) {
                $result.FolderRedirections.Add([PSCustomObject]@{
                    GPOId = $GPO.Id.ToString()
                    GPOName = $GPO.DisplayName
                    FolderName = $folder.Location.DestinationPath
                    TargetPath = $folder.Location.DestinationPath
                    GrantExclusiveRights = $folder.Settings.GrantExclusiveRights
                    MoveContents = $folder.Settings.MoveContents
                    ApplyToDownlevelOS = $folder.Settings.ApplyToDownlevelOS
                })
            }
        }
        
        # Parse Logon Scripts
        $scripts = $xmlReport.GPO.User.ExtensionData.Extension | 
            Where-Object { $_.type -eq 'q1:Scripts' }
            
        if ($scripts) {
            foreach ($script in $scripts.Script) {
                if ($script.Type -eq 'Logon') {
                    $result.LogonScripts.Add([PSCustomObject]@{
                        GPOId = $GPO.Id.ToString()
                        GPOName = $GPO.DisplayName
                        ScriptType = 'Logon'
                        ScriptPath = $script.Properties.path
                        ScriptParameters = $script.Properties.parameters
                        RunOrder = $script.Properties.runOrder
                    })
                }
            }
        }
        
    } catch {
        Write-MandALog "Error parsing GPO report for '$($GPO.DisplayName)': $($_.Exception.Message)" -Level "WARN"
    }
    
    return $result
}

function Export-GPODataToCSV {
    param(
        [array]$GPOs,
        [array]$GPOLinks,
        [array]$GPOPermissions,
        [array]$DriveMappings,
        [array]$PrinterMappings,
        [array]$FolderRedirections,
        [array]$LogonScripts,
        [string]$OutputPath
    )
    
    try {
        # Export GPOs
        if ($GPOs -and $GPOs.Count -gt 0) {
            $gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
            Export-DataToCSV -Data $GPOs -FilePath $gpoOutputFile
        }
        
        # Export GPO Links
        if ($GPOLinks -and $GPOLinks.Count -gt 0) {
            $linksOutputFile = Join-Path $OutputPath "GroupPolicyLinks.csv"
            Export-DataToCSV -Data $GPOLinks -FilePath $linksOutputFile
        }
        
        # Export GPO Permissions
        if ($GPOPermissions -and $GPOPermissions.Count -gt 0) {
            $permsOutputFile = Join-Path $OutputPath "GroupPolicyPermissions.csv"
            Export-DataToCSV -Data $GPOPermissions -FilePath $permsOutputFile
        }
        
        # Export Drive Mappings
        if ($DriveMappings -and $DriveMappings.Count -gt 0) {
            $driveOutputFile = Join-Path $OutputPath "GPODriveMappings.csv"
            Export-DataToCSV -Data $DriveMappings -FilePath $driveOutputFile
        }
        
        # Export Printer Mappings
        if ($PrinterMappings -and $PrinterMappings.Count -gt 0) {
            $printerOutputFile = Join-Path $OutputPath "GPOPrinterMappings.csv"
            Export-DataToCSV -Data $PrinterMappings -FilePath $printerOutputFile
        }
        
        # Export Folder Redirections
        if ($FolderRedirections -and $FolderRedirections.Count -gt 0) {
            $folderOutputFile = Join-Path $OutputPath "GPOFolderRedirections.csv"
            Export-DataToCSV -Data $FolderRedirections -FilePath $folderOutputFile
        }
        
        # Export Logon Scripts
        if ($LogonScripts -and $LogonScripts.Count -gt 0) {
            $scriptOutputFile = Join-Path $OutputPath "GPOLogonScripts.csv"
            Export-DataToCSV -Data $LogonScripts -FilePath $scriptOutputFile
        }
        
        Write-MandALog "GPO data export completed" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Failed to export GPO data: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

# --- Main Invoke Function ---
function Invoke-GPODiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "--- Starting GPO Discovery Phase ---" -Level "HEADER"
        
        # Verify prerequisites
        if (-not (Get-Module -ListAvailable -Name GroupPolicy)) {
            Write-MandALog "GroupPolicy module not available. Skipping GPO discovery." -Level "WARN"
            return @{}
        }
        
        if (-not (Get-Module -ListAvailable -Name ActiveDirectory)) {
            Write-MandALog "ActiveDirectory module not available. Skipping GPO discovery." -Level "WARN"
            return @{}
        }
        
        # Import required modules
        Import-Module GroupPolicy -ErrorAction Stop
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Set up paths and parameters
        $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
        $domainController = $Configuration.environment.domainController
        
        if (-not $domainController) {
            Write-MandALog "No domain controller specified in configuration. Attempting to discover..." -Level "WARN"
            try {
                $domainController = (Get-ADDomainController -Discover -NextClosestSite).HostName
                Write-MandALog "Using discovered domain controller: $domainController" -Level "INFO"
            } catch {
                Write-MandALog "Failed to discover domain controller: $($_.Exception.Message)" -Level "ERROR"
                return @{}
            }
        }
        
        # Test domain controller connectivity
        if (-not (Test-Connection -ComputerName $domainController -Count 1 -Quiet)) {
            Write-MandALog "Domain controller $domainController is not reachable. Skipping GPO discovery." -Level "ERROR"
            return @{}
        }
        
        # Run GPO discovery
        $gpoData = Get-GPOData -OutputPath $outputPath -DomainController $domainController
        
        # Export data to CSV files
        if ($gpoData) {
            Export-GPODataToCSV @gpoData -OutputPath $outputPath
        }
        
        Write-MandALog "--- GPO Discovery Phase Completed ---" -Level "SUCCESS"
        return $gpoData
        
    } catch {
        Write-MandALog "GPO discovery failed: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return @{}
    }
}

# Export module functions
Export-ModuleMember -Function @(
    'Get-GPOData',
    'Export-GPODataToCSV',
    'Invoke-GPODiscovery'
)
