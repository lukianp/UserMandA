<#
.SYNOPSIS
    GPO discovery module for M&A Discovery Suite
.DESCRIPTION
    Handles Group Policy Object discovery with robust XML parsing and namespace handling
#>

function Get-GPOData {
    param(
        [string]$OutputPath,
        [string]$DomainController
    )
    
    try {
        Write-MandALog "Starting comprehensive GPO analysis..." -Level "HEADER"
        
        # Create output files
        $gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
        $driveOutputFile = Join-Path $OutputPath "DriveMappingsGPO.csv"
        $printerOutputFile = Join-Path $OutputPath "PrinterMappingsGPO.csv"
        $folderOutputFile = Join-Path $OutputPath "FolderRedirectionGPO.csv"
        $logonScriptsFile = Join-Path $OutputPath "LogonScripts.csv"
        
        # Initialize collections
        $allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
        $allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
        
        # Create GPO reports directory
        $gpoReportsPath = Join-Path $OutputPath "GPOReports"
        if (!(Test-Path $gpoReportsPath)) {
            New-Item -Path $gpoReportsPath -ItemType Directory -Force | Out-Null
            Write-MandALog "Created GPO reports directory: $gpoReportsPath" -Level "INFO"
        }
        
        # Get all GPOs in domain
        $gpos = Get-GPO -All -Server $DomainController -ErrorAction Stop
        Write-MandALog "Found $($gpos.Count) GPOs to analyze" -Level "INFO"
        
        $processedCount = 0
        foreach ($gpo in $gpos) {
            $processedCount++
            Write-Progress -Activity "Analyzing GPOs" -Status "GPO $processedCount of $($gpos.Count): $($gpo.DisplayName)" -PercentComplete (($processedCount / $gpos.Count) * 100)
            
            try {
                # Add GPO to main list
                $allGPOs.Add([PSCustomObject]@{
                    Id = $gpo.Id.ToString()
                    DisplayName = $gpo.DisplayName
                    Status = $gpo.GpoStatus
                    CreationTime = $gpo.CreationTime
                    ModificationTime = $gpo.ModificationTime
                    DomainName = $gpo.DomainName
                    Owner = $gpo.Owner
                    Description = $gpo.Description
                    LinkedOUs = Get-GPOLinkedOUs -GPO $gpo -DomainController $DomainController
                    SecurityGroups = Get-GPOSecurityFiltering -GPO $gpo -DomainController $DomainController
                    WMIFilter = Get-GPOWMIFilter -GPO $gpo -DomainController $DomainController
                })
                
                # Export GPO to XML for detailed analysis
                $reportPath = Join-Path $gpoReportsPath "$($gpo.Id).xml"
                try {
                    Get-GPOReport -Guid $gpo.Id -ReportType Xml -Path $reportPath -Server $DomainController -ErrorAction Stop
                    
                    # Parse the XML with proper error handling
                    $xmlContent = Get-Content $reportPath -Raw -ErrorAction Stop
                    if ([string]::IsNullOrWhiteSpace($xmlContent)) {
                        Write-MandALog "Empty XML report for GPO: $($gpo.DisplayName)" -Level "WARN"
                        continue
                    }
                    
                    # Parse XML with robust namespace handling
                    $gpoData = Parse-GPOXMLReport -XmlContent $xmlContent -GPO $gpo
                    
                    # Add parsed data to collections
                    if ($gpoData.DriveMappings) {
                        $allDriveMappings.AddRange($gpoData.DriveMappings)
                    }
                    if ($gpoData.PrinterMappings) {
                        $allPrinterMappings.AddRange($gpoData.PrinterMappings)
                    }
                    if ($gpoData.FolderRedirections) {
                        $allFolderRedirections.AddRange($gpoData.FolderRedirections)
                    }
                    if ($gpoData.LogonScripts) {
                        $allLogonScripts.AddRange($gpoData.LogonScripts)
                    }
                    
                } catch {
                    Write-MandALog "Error generating XML report for GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
                }
                
            } catch {
                Write-MandALog "Error processing GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-Progress -Activity "Analyzing GPOs" -Completed
        
        # Export all data to CSV files
        Export-GPODataToCSV -GPOs $allGPOs -DriveMappings $allDriveMappings -PrinterMappings $allPrinterMappings -FolderRedirections $allFolderRedirections -LogonScripts $allLogonScripts -OutputPath $OutputPath
        
        # Summary
        Write-MandALog "GPO Analysis Summary:" -Level "SUCCESS"
        Write-MandALog "  Total GPOs processed: $($allGPOs.Count)" -Level "INFO"
        Write-MandALog "  Drive mappings found: $($allDriveMappings.Count)" -Level "INFO"
        Write-MandALog "  Printer mappings found: $($allPrinterMappings.Count)" -Level "INFO"
        Write-MandALog "  Folder redirections found: $($allFolderRedirections.Count)" -Level "INFO"
        Write-MandALog "  Logon scripts found: $($allLogonScripts.Count)" -Level "INFO"
        
        return @{
            GPOs = $allGPOs
            DriveMappings = $allDriveMappings
            PrinterMappings = $allPrinterMappings
            FolderRedirections = $allFolderRedirections
            LogonScripts = $allLogonScripts
        }
        
    } catch {
        Write-MandALog "GPO analysis failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Parse-GPOXMLReport {
    param(
        [string]$XmlContent,
        [object]$GPO
    )
    
    $result = @{
        DriveMappings = @()
        PrinterMappings = @()
        FolderRedirections = @()
        LogonScripts = @()
    }
    
    try {
        # Load XML with proper error handling
        [xml]$gpoXml = $XmlContent
        
        # Create namespace manager to handle XML namespaces properly
        $nsManager = New-Object System.Xml.XmlNamespaceManager($gpoXml.NameTable)
        
        # Add common namespaces found in GPO reports
        $nsManager.AddNamespace("gpo", "http://www.microsoft.com/GroupPolicy/GPOOperations")
        $nsManager.AddNamespace("q1", "http://www.microsoft.com/GroupPolicy/Settings")
        $nsManager.AddNamespace("q2", "http://www.microsoft.com/GroupPolicy/Settings/Registry")
        $nsManager.AddNamespace("q3", "http://www.microsoft.com/GroupPolicy/Settings/Files")
        $nsManager.AddNamespace("q4", "http://www.microsoft.com/GroupPolicy/Settings/Scripts")
        $nsManager.AddNamespace("q5", "http://www.microsoft.com/GroupPolicy/Settings/FolderRedirection")
        
        # Try to detect and add any other namespaces from the document
        if ($gpoXml.DocumentElement -and $gpoXml.DocumentElement.Attributes) {
            foreach ($attr in $gpoXml.DocumentElement.Attributes) {
                if ($attr.Name.StartsWith("xmlns:")) {
                    $prefix = $attr.Name.Substring(6)
                    if (-not $nsManager.HasNamespace($prefix)) {
                        try {
                            $nsManager.AddNamespace($prefix, $attr.Value)
                        } catch {
                            # Ignore namespace conflicts
                        }
                    }
                }
            }
        }
        
        Write-MandALog "Analyzing GPO: $($GPO.DisplayName)" -Level "DEBUG"
        
        # Search for Drive Mappings using multiple approaches
        $result.DriveMappings = Find-DriveMappings -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Printer Mappings
        $result.PrinterMappings = Find-PrinterMappings -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Folder Redirections
        $result.FolderRedirections = Find-FolderRedirections -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Logon Scripts
        $result.LogonScripts = Find-LogonScripts -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
    } catch {
        Write-MandALog "Error parsing XML for GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $result
}

function Find-DriveMappings {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $driveMappings = @()
    
    try {
        # Multiple XPath expressions to find drive mappings
        $xpathExpressions = @(
            "//Drive",
            "//q1:Drive",
            "//*[local-name()='Drive']",
            "//DriveMapSettings/Drive",
            "//Drives/Drive",
            "//*[contains(local-name(), 'Drive')]"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $driveNodes = if ($NamespaceManager) {
                    $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                } else {
                    $XmlDoc.SelectNodes($xpath)
                }
                
                if ($driveNodes -and $driveNodes.Count -gt 0) {
                    Write-MandALog "  Found $($driveNodes.Count) drive mappings in $($GPO.DisplayName) using XPath: $xpath" -Level "INFO"
                    
                    foreach ($drive in $driveNodes) {
                        $props = $drive.SelectSingleNode("Properties")
                        if (-not $props) { $props = $drive.SelectSingleNode("*/Properties") }
                        if (-not $props) { $props = $drive }
                        
                        if ($props) {
                            $driveMappings += [PSCustomObject]@{
                                GpoId = $GPO.Id.ToString()
                                GpoName = $GPO.DisplayName
                                DriveLetter = Get-XmlAttributeValue -Node $props -AttributeNames @("letter", "Letter", "DriveLetter", "drive")
                                UncPath = Get-XmlAttributeValue -Node $props -AttributeNames @("path", "Path", "UncPath", "target")
                                Action = Get-XmlAttributeValue -Node $props -AttributeNames @("action", "Action")
                                Label = Get-XmlAttributeValue -Node $props -AttributeNames @("label", "Label")
                                Persistent = Get-XmlAttributeValue -Node $props -AttributeNames @("persistent", "Persistent")
                                UseLetter = Get-XmlAttributeValue -Node $props -AttributeNames @("useLetter", "UseLetter")
                            }
                        }
                    }
                    break # Found drives, no need to try other XPath expressions
                }
            } catch {
                # Continue to next XPath expression
                Write-MandALog "XPath '$xpath' failed for drive mappings: $($_.Exception.Message)" -Level "DEBUG"
            }
        }
    } catch {
        Write-MandALog "Error finding drive mappings in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $driveMappings
}

function Find-PrinterMappings {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $printerMappings = @()
    
    try {
        # Multiple XPath expressions to find printer mappings
        $xpathExpressions = @(
            "//SharedPrinter | //PortPrinter | //LocalPrinter",
            "//q1:SharedPrinter | //q1:PortPrinter | //q1:LocalPrinter",
            "//*[local-name()='SharedPrinter' or local-name()='PortPrinter' or local-name()='LocalPrinter']",
            "//Printers//*[contains(local-name(), 'Printer')]",
            "//*[contains(local-name(), 'Printer')]"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $printerNodes = if ($NamespaceManager) {
                    $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                } else {
                    $XmlDoc.SelectNodes($xpath)
                }
                
                if ($printerNodes -and $printerNodes.Count -gt 0) {
                    Write-MandALog "  Found $($printerNodes.Count) printer mappings in $($GPO.DisplayName) using XPath: $xpath" -Level "INFO"
                    
                    foreach ($printer in $printerNodes) {
                        $printerType = $printer.LocalName
                        $props = $printer.SelectSingleNode("Properties")
                        if (-not $props) { $props = $printer.SelectSingleNode("*/Properties") }
                        if (-not $props) { $props = $printer }
                        
                        if ($props) {
                            $scope = if ($printerType -eq "SharedPrinter") { "User" } else { "Computer" }
                            $printerName = Get-XmlAttributeValue -Node $props -AttributeNames @("name", "Name", "localName", "LocalName", "printerName")
                            $printerPath = Get-XmlAttributeValue -Node $props -AttributeNames @("path", "Path", "uncPath", "UncPath", "ipAddress", "IpAddress")
                            
                            $printerMappings += [PSCustomObject]@{
                                GpoId = $GPO.Id.ToString()
                                GpoName = $GPO.DisplayName
                                PrinterName = $printerName
                                PrinterPath = $printerPath
                                Scope = $scope
                                Action = Get-XmlAttributeValue -Node $props -AttributeNames @("action", "Action")
                                Default = Get-XmlAttributeValue -Node $props -AttributeNames @("default", "Default")
                                Location = Get-XmlAttributeValue -Node $props -AttributeNames @("location", "Location")
                                Comment = Get-XmlAttributeValue -Node $props -AttributeNames @("comment", "Comment")
                            }
                        }
                    }
                    break # Found printers, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "XPath '$xpath' failed for printer mappings: $($_.Exception.Message)" -Level "DEBUG"
            }
        }
    } catch {
        Write-MandALog "Error finding printer mappings in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $printerMappings
}

function Find-FolderRedirections {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $folderRedirections = @()
    
    try {
        # Multiple XPath expressions to find folder redirections
        $xpathExpressions = @(
            "//Folder[Location or @DestinationPath]",
            "//q5:Folder",
            "//*[local-name()='Folder' and (child::*[local-name()='Location'] or @DestinationPath)]",
            "//FolderRedirection//Folder",
            "//*[contains(local-name(), 'Folder') and contains(local-name(), 'Redirect')]"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $folderNodes = if ($NamespaceManager) {
                    $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                } else {
                    $XmlDoc.SelectNodes($xpath)
                }
                
                if ($folderNodes -and $folderNodes.Count -gt 0) {
                    Write-MandALog "  Found $($folderNodes.Count) folder redirections in $($GPO.DisplayName) using XPath: $xpath" -Level "INFO"
                    
                    foreach ($folder in $folderNodes) {
                        $folderId = Get-XmlAttributeValue -Node $folder -AttributeNames @("Id", "id", "FolderId")
                        $location = $folder.SelectSingleNode("Location")
                        if (-not $location) { $location = $folder.SelectSingleNode("*/Location") }
                        $destinationPath = ""
                        
                        if ($location) {
                            $destinationPath = Get-XmlAttributeValue -Node $location -AttributeNames @("DestinationPath", "destinationPath", "Path", "path")
                            if ([string]::IsNullOrWhiteSpace($destinationPath)) {
                                $destinationPath = $location.InnerText
                            }
                        }
                        if ([string]::IsNullOrWhiteSpace($destinationPath)) {
                            $destinationPath = Get-XmlAttributeValue -Node $folder -AttributeNames @("DestinationPath", "destinationPath", "Path", "path")
                        }
                        
                        if (-not [string]::IsNullOrWhiteSpace($destinationPath)) {
                            # Map folder IDs to friendly names
                            $folderName = Get-FolderFriendlyName -FolderId $folderId
                            
                            $grantExclusive = $folder.SelectSingleNode("GrantExclusiveRights")
                            if (-not $grantExclusive) { $grantExclusive = $folder.SelectSingleNode("*/GrantExclusiveRights") }
                            $moveContents = $folder.SelectSingleNode("MoveContents")
                            if (-not $moveContents) { $moveContents = $folder.SelectSingleNode("*/MoveContents") }
                            
                            $folderRedirections += [PSCustomObject]@{
                                GpoId = $GPO.Id.ToString()
                                GpoName = $GPO.DisplayName
                                FolderName = $folderName
                                RedirectedPath = $destinationPath
                                Scope = "User"
                                GrantExclusiveRights = if ($grantExclusive) { $grantExclusive.InnerText } else { "True" }
                                MoveContents = if ($moveContents) { $moveContents.InnerText } else { "True" }
                                ApplyToDownlevel = "True"
                            }
                        }
                    }
                    break # Found folder redirections, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "XPath '$xpath' failed for folder redirections: $($_.Exception.Message)" -Level "DEBUG"
            }
        }
    } catch {
        Write-MandALog "Error finding folder redirections in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $folderRedirections
}

function Find-LogonScripts {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $logonScripts = @()
    
    try {
        # Multiple XPath expressions to find logon scripts
        $xpathExpressions = @(
            "//Script[@Type='Logon' or @type='Logon']",
            "//q4:Script[@Type='Logon' or @type='Logon']",
            "//*[local-name()='Script' and (@Type='Logon' or @type='Logon')]",
            "//Scripts/Script[@Type='Logon']",
            "//LogonScripts//Script",
            "//*[contains(local-name(), 'Script') and contains(@Type, 'Logon')]"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $scriptNodes = if ($NamespaceManager) {
                    $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                } else {
                    $XmlDoc.SelectNodes($xpath)
                }
                
                if ($scriptNodes -and $scriptNodes.Count -gt 0) {
                    Write-MandALog "  Found $($scriptNodes.Count) logon scripts in $($GPO.DisplayName) using XPath: $xpath" -Level "INFO"
                    
                    foreach ($script in $scriptNodes) {
                        $scriptType = Get-XmlAttributeValue -Node $script -AttributeNames @("Type", "type")
                        if ([string]::IsNullOrWhiteSpace($scriptType)) { $scriptType = "Logon" }
                        
                        $runOrder = Get-XmlAttributeValue -Node $script -AttributeNames @("RunOrder", "runOrder", "Order", "order")
                        if ([string]::IsNullOrWhiteSpace($runOrder)) { $runOrder = "0" }
                        
                        $logonScripts += [PSCustomObject]@{
                            GpoId = $GPO.Id.ToString()
                            GpoName = $GPO.DisplayName
                            ScriptPath = Get-XmlAttributeValue -Node $script -AttributeNames @("Command", "command", "Path", "path", "ScriptPath")
                            ScriptType = $scriptType
                            Parameters = Get-XmlAttributeValue -Node $script -AttributeNames @("Parameters", "parameters", "Args", "args")
                            RunOrder = $runOrder
                        }
                    }
                    break # Found scripts, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "XPath '$xpath' failed for logon scripts: $($_.Exception.Message)" -Level "DEBUG"
            }
        }
    } catch {
        Write-MandALog "Error finding logon scripts in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $logonScripts
}

function Get-XmlAttributeValue {
    param(
        [System.Xml.XmlNode]$Node,
        [string[]]$AttributeNames
    )
    
    if (-not $Node) { return $null }
    
    foreach ($attrName in $AttributeNames) {
        $value = $Node.GetAttribute($attrName)
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            return $value
        }
    }
    
    # Try inner text as fallback
    if (-not [string]::IsNullOrWhiteSpace($Node.InnerText)) {
        return $Node.InnerText
    }
    
    return $null
}

function Get-FolderFriendlyName {
    param([string]$FolderId)
    
    $folderMap = @{
        "{1777F761-68AD-4D8A-87BD-30B759FA33DD}" = "Favorites"
        "{FDD39AD0-238F-46AF-ADB4-6C85480369C7}" = "Documents"
        "{33E28130-4E1E-4676-835A-98395C3BC3BB}" = "Pictures"
        "{4BD8D571-6D19-48D3-BE97-422220080E43}" = "Music"
        "{18989B1D-99B5-455B-841C-AB7C74E4DDFC}" = "Videos"
        "{3EB685DB-65F9-4CF6-A03A-E3EF65729F3D}" = "AppData\Roaming"
        "{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}" = "Desktop"
        "{56784854-C6CB-462B-8169-88E350ACB882}" = "Contacts"
        "{7D1D3A04-DEBB-4115-95CF-2F29DA2920DA}" = "Searches"
        "{374DE290-123F-4565-9164-39C4925E467B}" = "Downloads"
        "{BFB9D5E0-C6A9-404C-B2B2-AE6DB6AF4968}" = "Links"
        "{4C5C32FF-BB9D-43B0-B5B4-2D72E54EAAA4}" = "Saved Games"
    }
    
    if ($folderMap.ContainsKey($FolderId)) {
        return $folderMap[$FolderId]
    } else {
        return $FolderId
    }
}

function Get-GPOLinkedOUs {
    param([object]$GPO, [string]$DomainController)
    
    try {
        $links = Get-GPInheritance -Target (Get-ADDomain -Server $DomainController).DistinguishedName -Server $DomainController -ErrorAction SilentlyContinue |
                 Where-Object { $_.GpoLinks.GpoId -contains $GPO.Id }
        
        if ($links) {
            return ($links.Path -join ';')
        }
    } catch {
        # Ignore errors
    }
    
    return "Unknown"
}

function Get-GPOSecurityFiltering {
    param([object]$GPO, [string]$DomainController)
    
    try {
        $permissions = Get-GPPermission -Guid $GPO.Id -All -Server $DomainController -ErrorAction SilentlyContinue |
                      Where-Object { $_.Permission -eq "GpoApply" }
        
        if ($permissions) {
            return ($permissions.Trustee.Name -join ';')
        }
    } catch {
        # Ignore errors
    }
    
    return "Authenticated Users"
}

function Get-GPOWMIFilter {
    param([object]$GPO, [string]$DomainController)
    
    try {
        if ($GPO.WmiFilter) {
            return $GPO.WmiFilter.Name
        }
    } catch {
        # Ignore errors
    }
    
    return "None"
}

function Export-GPODataToCSV {
    param(
        [array]$GPOs,
        [array]$DriveMappings,
        [array]$PrinterMappings,
        [array]$FolderRedirections,
        [array]$LogonScripts,
        [string]$OutputPath
    )
    
    # Export GPOs
    $gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
    if ($GPOs.Count -eq 0) {
        $headers = [PSCustomObject]@{
            Id = $null; DisplayName = $null; Status = $null; CreationTime = $null
            ModificationTime = $null; DomainName = $null; Owner = $null; Description = $null
            LinkedOUs = $null; SecurityGroups = $null; WMIFilter = $null
        }
        ,$headers | Export-Csv -Path $gpoOutputFile -NoTypeInformation -Encoding UTF8 -Force
    } else {
        $GPOs | Export-Csv -Path $gpoOutputFile -NoTypeInformation -Encoding UTF8 -Force
    }
    
    # Export Drive Mappings
    $driveOutputFile = Join-Path $OutputPath "DriveMappingsGPO.csv"
    if ($DriveMappings.Count -eq 0) {
        $headers = [PSCustomObject]@{
            GpoId = $null; GpoName = $null; DriveLetter = $null; UncPath = $null
            Action = $null; Label = $null; Persistent = $null; UseLetter = $null
        }
        ,$headers | Export-Csv -Path $driveOutputFile -NoTypeInformation -Encoding UTF8 -Force
    } else {
        $DriveMappings | Export-Csv -Path $driveOutputFile -NoTypeInformation -Encoding UTF8 -Force
    }
    
    # Export Printer Mappings
    $printerOutputFile = Join-Path $OutputPath "PrinterMappingsGPO.csv"
    if ($PrinterMappings.Count -eq 0) {
        $headers = [PSCustomObject]@{
            GpoId = $null; GpoName = $null; PrinterName = $null; PrinterPath = $null
            Scope = $null; Action = $null; Default = $null; Location = $null; Comment = $null
        }
        ,$headers | Export-Csv -Path $printerOutputFile -NoTypeInformation -Encoding UTF8 -Force
    } else {
        $PrinterMappings | Export-Csv -Path $printerOutputFile -NoTypeInformation -Encoding UTF8 -Force
    }
    
    # Export Folder Redirections
    $folderOutputFile = Join-Path $OutputPath "FolderRedirectionGPO.csv"
    if ($FolderRedirections.Count -eq 0) {
        $headers = [PSCustomObject]@{
            GpoId = $null; GpoName = $null; FolderName = $null; RedirectedPath = $null
            Scope = $null; GrantExclusiveRights = $null; MoveContents = $null; ApplyToDownlevel = $null
        }
        ,$headers | Export-Csv -Path $folderOutputFile -NoTypeInformation -Encoding UTF8 -Force
    } else {
        $FolderRedirections | Export-Csv -Path $folderOutputFile -NoTypeInformation -Encoding UTF8 -Force
    }
    
    # Export Logon Scripts
    $logonScriptsFile = Join-Path $OutputPath "LogonScripts.csv"
    if ($LogonScripts.Count -eq 0) {
        $headers = [PSCustomObject]@{
            GpoId = $null; GpoName = $null; ScriptPath = $null; ScriptType = $null
            Parameters = $null; RunOrder = $null
        }
        ,$headers | Export-Csv -Path $logonScriptsFile -NoTypeInformation -Encoding UTF8 -Force
    } else {
        $LogonScripts | Export-Csv -Path $logonScriptsFile -NoTypeInformation -Encoding UTF8 -Force
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Get-GPOData'
)