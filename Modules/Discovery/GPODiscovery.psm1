# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# DiscoveryResult class definition
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    class DiscoveryResult {
        [bool]$Success = $false
        [string]$ModuleName
        [object]$Data
        [System.Collections.ArrayList]$Errors
        [System.Collections.ArrayList]$Warnings  
        [hashtable]$Metadata
        [datetime]$StartTime
        [datetime]$EndTime
        [string]$ExecutionId
        
        DiscoveryResult([string]$moduleName) {
            $this.ModuleName = $moduleName
            $this.Errors = [System.Collections.ArrayList]::new()
            $this.Warnings = [System.Collections.ArrayList]::new()
            $this.Metadata = @{}
            $this.StartTime = Get-Date
            $this.ExecutionId = [guid]::NewGuid().ToString()
            $this.Success = $true
        }
        
        [void]AddError([string]$message, [Exception]$exception) {
            $this.AddError($message, $exception, @{})
        }
        
        [void]AddError([string]$message, [Exception]$exception, [hashtable]$context) {
            $errorEntry = @{
                Timestamp = Get-Date
                Message = $message
                Exception = if ($exception) { $exception.ToString() } else { $null }
                ExceptionType = if ($exception) { $exception.GetType().FullName } else { $null }
                Context = $context
                StackTrace = if ($exception) { $exception.StackTrace } else { (Get-PSCallStack | Out-String) }
            }
            [void]$this.Errors.Add($errorEntry)
            $this.Success = $false
        }
        
        [void]AddWarning([string]$message) {
            $this.AddWarning($message, @{})
        }
        
        [void]AddWarning([string]$message, [hashtable]$context) {
            $warningEntry = @{
                Timestamp = Get-Date
                Message = $message
                Context = $context
            }
            [void]$this.Warnings.Add($warningEntry)
        }
        
        [void]Complete() {
            $this.EndTime = Get-Date
            if ($null -ne $this.StartTime -and $null -ne $this.EndTime) {
                $this.Metadata['Duration'] = $this.EndTime - $this.StartTime
                $this.Metadata['DurationSeconds'] = ($this.EndTime - $this.StartTime).TotalSeconds
            }
        }
    }
}

<#
.SYNOPSIS

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}
    Enhanced GPO discovery module with robust XML parsing and namespace handling
.DESCRIPTION
    Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling
    Fixed version with Invoke-GPODiscovery function added
.NOTES
    Version: 2.0.0 (Fixed)
    Date: 2025-06-02
#>

#Requires -Modules ActiveDirectory, GroupPolicy

$authModulePathFromGlobal = Join-Path $global:MandA.Paths.Authentication "DiscoveryModuleBase.psm1"
Import-Module $authModulePathFromGlobal -Force

# Prerequisites validation function
function Test-GPODiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context,
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    $prerequisites = @{
        IsValid = $true
        MissingRequirements = @()
        Warnings = @()
    }
    
    try {
        Write-ProgressStep "Validating GPO Discovery prerequisites..." -Status Progress
        
        # Check for required modules
        $requiredModules = @('ActiveDirectory', 'GroupPolicy')
        
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.IsValid = $false
                $prerequisites.MissingRequirements += "Required module '$module' not available"
            }
        }
        
        # Check Active Directory connectivity
        try {
            $null = Get-ADDomain -ErrorAction Stop
        } catch {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Cannot connect to Active Directory: $($_.Exception.Message)"
        }
        
        # Check domain controller connectivity if specified
        if ($Configuration.environment.domainController) {
            try {
                if (-not (Test-Connection -ComputerName $Configuration.environment.domainController -Count 1 -Quiet)) {
                    $prerequisites.Warnings += "Specified domain controller '$($Configuration.environment.domainController)' is not reachable"
                }
            } catch {
                $prerequisites.Warnings += "Cannot test connectivity to domain controller: $($_.Exception.Message)"
            }
        }
        
        # Check GroupPolicy module functionality
        try {
            $testGPO = Get-GPO -All -ErrorAction Stop | Select-Object -First 1
            if (-not $testGPO) {
                $prerequisites.Warnings += "No GPOs found in domain - discovery may return empty results"
            }
        } catch {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Cannot access Group Policy objects: $($_.Exception.Message)"
        }
        
        Write-ProgressStep "Prerequisites validation completed" -Status Success
        
    } catch {
        $prerequisites.IsValid = $false
        $prerequisites.MissingRequirements += "Prerequisites validation failed: $($_.Exception.Message)"
        Write-ProgressStep "Prerequisites validation failed: $($_.Exception.Message)" -Status Error
    }
    
    return $prerequisites
}

# Enhanced wrapper function with retry logic
function Get-GPODataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-GPODataEnhanced -Configuration $Configuration -Context $Context -Credential $Credential
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "GPO discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-GPODataEnhanced {
    param(
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [PSCredential]$Credential
    )
    
    try {
        Write-ProgressStep "Starting comprehensive GPO analysis..." -Status Progress
        
        # Get domain controller
        $domainController = $Configuration.environment.domainController
        if (-not $domainController) {
            try {
                $domainController = (Get-ADDomainController -Discover -NextClosestSite).HostName
                Write-ProgressStep "Using discovered domain controller: $domainController" -Status Info
            } catch {
                throw "Failed to discover domain controller: $($_.Exception.Message)"
            }
        }
        
        # Test domain controller connectivity
        if (-not (Test-Connection -ComputerName $domainController -Count 1 -Quiet)) {
            throw "Domain controller $domainController is not reachable"
        }
        
        # Call the original Get-GPOData function but with enhanced error handling
        return Get-GPOData -OutputPath $null -DomainController $domainController
        
    } catch {
        Write-ProgressStep "Enhanced GPO data collection failed: $($_.Exception.Message)" -Status Error
        throw
    }
}

function Convert-ToFlattenedGPOData {
    param([hashtable]$Results)
    
    $flatData = [System.Collections.Generic.List[PSObject]]::new()
    
    if ($Results.GPOData) {
        $gpoData = $Results.GPOData
        
        # Add _DataType to each collection
        if ($gpoData.GPOs) {
            foreach ($gpo in $gpoData.GPOs) {
                $gpo | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GPOs' -Force
                $flatData.Add($gpo)
            }
        }
        
        if ($gpoData.GPOLinks) {
            foreach ($link in $gpoData.GPOLinks) {
                $link | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GPOLinks' -Force
                $flatData.Add($link)
            }
        }
        
        if ($gpoData.GPOPermissions) {
            foreach ($perm in $gpoData.GPOPermissions) {
                $perm | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GPOPermissions' -Force
                $flatData.Add($perm)
            }
        }
        
        if ($gpoData.DriveMappings) {
            foreach ($drive in $gpoData.DriveMappings) {
                $drive | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DriveMappings' -Force
                $flatData.Add($drive)
            }
        }
        
        if ($gpoData.PrinterMappings) {
            foreach ($printer in $gpoData.PrinterMappings) {
                $printer | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrinterMappings' -Force
                $flatData.Add($printer)
            }
        }
        
        if ($gpoData.FolderRedirections) {
            foreach ($folder in $gpoData.FolderRedirections) {
                $folder | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'FolderRedirections' -Force
                $flatData.Add($folder)
            }
        }
        
        if ($gpoData.LogonScripts) {
            foreach ($script in $gpoData.LogonScripts) {
                $script | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'LogonScripts' -Force
                $flatData.Add($script)
            }
        }
    }
    
    return $flatData
}

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
        Write-ProgressStep "Starting comprehensive GPO analysis..." -Status Progress
        
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
            Write-ProgressStep "Created GPO reports directory" -Status Info
        }
        
        # Get all GPOs in domain
        Write-ProgressStep "Retrieving GPOs from domain..." -Status Progress
        
        try {
            $gpoParams = @{
                All = $true
                ErrorAction = 'Stop'
            }
            if ($DomainController) {
                $gpoParams.Server = $DomainController
            }
            
            $gpos = Get-GPO @gpoParams
            Write-ProgressStep "Found $($gpos.Count) GPOs to analyze" -Status Success
        } catch {
            Write-ProgressStep "Failed to retrieve GPOs: $($_.Exception.Message)" -Status Error
            throw "Unable to retrieve GPOs from domain"
        }
        
        $totalGPOs = $gpos.Count
        $processedCount = 0
        $successfullyProcessed = 0
        $failedProcessing = 0
        
        foreach ($gpo in $gpos) {
            $processedCount++
            
            Show-ProgressBar -Current $processedCount -Total $totalGPOs `
                -Activity "GPO: $($gpo.DisplayName)"
            
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
                
                # Update sub-status
                Write-Host "`r  Getting links and permissions..." -NoNewline -ForegroundColor Gray
                
                # Get GPO Links
                try {
                    $gpoLinks = Get-GPOLinks -GPO $gpo -DomainController $DomainController
                    if ($gpoLinks) {
                        $allGPOLinks.AddRange($gpoLinks)
                    }
                } catch {
                    # Log but don't fail the entire GPO
                }
                
                # Get GPO Permissions
                try {
                    $gpoPermissions = Get-GPOPermissions -GPO $gpo
                    if ($gpoPermissions) {
                        $allGPOPermissions.AddRange($gpoPermissions)
                    }
                } catch {
                    # Log but don't fail the entire GPO
                }
                
                Write-Host "`r  Generating GPO report..." -NoNewline -ForegroundColor Gray
                
                # Generate GPO report
                try {
                    $reportPath = Join-Path $gpoReportsPath "$($gpo.Id)_$($gpo.DisplayName -replace '[\\/:*?"<>|]', '_').xml"
                    Get-GPOReport -Guid $gpo.Id -ReportType Xml -Path $reportPath -ErrorAction Stop
                    
                    Write-Host "`r  Parsing GPO settings..." -NoNewline -ForegroundColor Gray
                    
                    # Parse GPO report for specific settings
                    $gpoSettings = Parse-GPOReport -ReportPath $reportPath -GPO $gpo
                    if ($gpoSettings) {
                        if ($gpoSettings.DriveMappings) { $allDriveMappings.AddRange($gpoSettings.DriveMappings) }
                        if ($gpoSettings.PrinterMappings) { $allPrinterMappings.AddRange($gpoSettings.PrinterMappings) }
                        if ($gpoSettings.FolderRedirections) { $allFolderRedirections.AddRange($gpoSettings.FolderRedirections) }
                        if ($gpoSettings.LogonScripts) { $allLogonScripts.AddRange($gpoSettings.LogonScripts) }
                    }
                } catch {
                    # Log but don't fail the entire GPO
                }
                
                Write-Host "`r" + (" " * 80) + "`r" -NoNewline # Clear sub-status line
                $successfullyProcessed++
                
            } catch {
                Write-Host "`r" + (" " * 80) + "`r" -NoNewline # Clear sub-status line
                Write-ProgressStep "Error processing GPO '$($gpo.DisplayName)'" -Status Error
                $failedProcessing++
            }
        }
        
        Write-Host "" # Clear progress bar line
        
        # Display summary
        Write-ProgressStep "GPO Analysis Complete" -Status Success
        Write-ProgressStep "  Total GPOs processed: $($allGPOs.Count)" -Status Info
        Write-ProgressStep "  Successfully analyzed: $successfullyProcessed" -Status Success
        
        if ($failedProcessing -gt 0) {
            Write-ProgressStep "  Failed to analyze: $failedProcessing" -Status Warning
        }
        
        Write-ProgressStep "  GPO Links found: $($allGPOLinks.Count)" -Status Info
        Write-ProgressStep "  Drive Mappings found: $($allDriveMappings.Count)" -Status Info
        Write-ProgressStep "  Printer Mappings found: $($allPrinterMappings.Count)" -Status Info
        Write-ProgressStep "  Folder Redirections found: $($allFolderRedirections.Count)" -Status Info
        Write-ProgressStep "  Logon Scripts found: $($allLogonScripts.Count)" -Status Info
        
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
        Write-ProgressStep "GPO analysis failed: $($_.Exception.Message)" -Status Error
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

# Enhanced main function with comprehensive error handling
function Invoke-GPODiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context,
        
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new("GPO")
    
    try {
        Write-ProgressStep "Starting GPO Discovery" -Status Progress
        
        # Validate prerequisites
        $prerequisites = Test-GPODiscoveryPrerequisites -Configuration $Configuration -Context $Context -Credential $Credential
        if (-not $prerequisites.IsValid) {
            throw "Prerequisites validation failed: $($prerequisites.MissingRequirements -join '; ')"
        }
        
        # Log warnings
        foreach ($warning in $prerequisites.Warnings) {
            Write-ProgressStep $warning -Status Warning
            $Context.ErrorCollector.AddWarning("GPO", $warning)
        }
        
        # Import required modules
        Import-Module GroupPolicy -ErrorAction Stop
        Import-Module ActiveDirectory -ErrorAction Stop
        
        $results = @{}
        
        # 1. Discover GPOs with error handling
        try {
            Write-ProgressStep "Discovering Group Policy Objects..." -Status Progress
            $results.GPOData = Get-GPODataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $result.Metadata.SectionsProcessed++
            
            if ($results.GPOData.GPOs.Count -eq 0) {
                Write-ProgressStep "No GPOs found in domain" -Status Warning
                $Context.ErrorCollector.AddWarning("GPO", "No GPOs found in domain")
            }
            
        } catch {
            $errorMsg = "Failed to discover GPOs: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("GPO", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $results.GPOData = @{
                GPOs = @()
                GPOLinks = @()
                GPOPermissions = @()
                DriveMappings = @()
                PrinterMappings = @()
                FolderRedirections = @()
                LogonScripts = @()
                ProcessingStats = @{ Total = 0; Successful = 0; Failed = 0 }
            }
        }
        
        # Update result
        $result.Data = Convert-ToFlattenedGPOData -Results $results
        $result.Success = $true
        $result.Metadata.TotalSections = 1
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "GPO Discovery completed" -Status Success
        return $result
        
    } catch {
        $result.Success = $false
        $result.ErrorMessage = $_.Exception.Message
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "GPO Discovery failed: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("GPO", "Discovery failed", $_.Exception)
        
        return $result
        
    } finally {
        # Cleanup resources
        Write-ProgressStep "GPO Discovery cleanup completed" -Status Info
    }
}

# Export module functions
Export-ModuleMember -Function @(
    'Get-GPOData',
    'Export-GPODataToCSV',
    'Invoke-GPODiscovery'
)

