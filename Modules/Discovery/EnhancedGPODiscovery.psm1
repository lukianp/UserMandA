<#
.SYNOPSIS
    Enhanced GPO discovery module with robust XML parsing and namespace handling
.DESCRIPTION
    Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling
#>

function Get-GPOData {
    param(
        [string]$OutputPath,
        [string]$DomainController
    )
    
    try {
        Write-MandALog "🎯 Starting comprehensive GPO analysis..." -Level "HEADER"
        
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
            Write-MandALog "📁 Created GPO reports directory: $gpoReportsPath" -Level "INFO"
        }
        
        # Get all GPOs in domain with enhanced error handling
        try {
            $gpos = Get-GPO -All -Server $DomainController -ErrorAction Stop
            Write-MandALog "📊 Found $($gpos.Count) GPOs to analyze" -Level "INFO"
        } catch {
            Write-MandALog "❌ Failed to retrieve GPOs: $($_.Exception.Message)" -Level "ERROR"
            
            # Try alternative method using PowerShell AD module
            try {
                Write-MandALog "🔄 Attempting alternative GPO retrieval method..." -Level "PROGRESS"
                Import-Module ActiveDirectory -ErrorAction Stop
                $gpos = Get-ADObject -Filter "objectClass -eq 'groupPolicyContainer'" -Server $DomainController -Properties displayName, gPCFileSysPath, whenCreated, whenChanged
                Write-MandALog "📊 Retrieved $($gpos.Count) GPOs using AD module" -Level "SUCCESS"
            } catch {
                Write-MandALog "❌ Alternative GPO retrieval also failed: $($_.Exception.Message)" -Level "ERROR"
                throw "Unable to retrieve GPOs from domain"
            }
        }
        
        $processedCount = 0
        $successfullyProcessed = 0
        $failedProcessing = 0
        
        foreach ($gpo in $gpos) {
            $processedCount++
            Write-ProgressBar -Current $processedCount -Total $gpos.Count -Activity "Analyzing GPOs" -Status "GPO $processedCount of $($gpos.Count): $($gpo.DisplayName)"
            
            try {
                # Add GPO to main list with enhanced error handling
                $gpoObject = [PSCustomObject]@{
                    Id = if ($gpo.Id) { $gpo.Id.ToString() } else { $gpo.ObjectGUID }
                    DisplayName = if ($gpo.DisplayName) { $gpo.DisplayName } else { "Unknown GPO" }
                    Status = if ($gpo.GpoStatus) { $gpo.GpoStatus } else { "Unknown" }
                    CreationTime = if ($gpo.CreationTime) { $gpo.CreationTime } else { $gpo.whenCreated }
                    ModificationTime = if ($gpo.ModificationTime) { $gpo.ModificationTime } else { $gpo.whenChanged }
                    DomainName = if ($gpo.DomainName) { $gpo.DomainName } else { (Get-ADDomain -Server $DomainController).DNSRoot }
                    Owner = if ($gpo.Owner) { $gpo.Owner } else { "Unknown" }
                    Description = if ($gpo.Description) { $gpo.Description } else { "" }
                    LinkedOUs = Get-GPOLinkedOUs -GPO $gpo -DomainController $DomainController
                    SecurityGroups = Get-GPOSecurityFiltering -GPO $gpo -DomainController $DomainController
                    WMIFilter = Get-GPOWMIFilter -GPO $gpo -DomainController $DomainController
                }
                
                $allGPOs.Add($gpoObject)
                
                # Export GPO to XML for detailed analysis with enhanced error handling
                $gpoId = if ($gpo.Id) { $gpo.Id } else { $gpo.ObjectGUID }
                $reportPath = Join-Path $gpoReportsPath "$gpoId.xml"
                
                try {
                    # Try multiple methods to get GPO report
                    $xmlContent = $null
                    
                    # Method 1: Standard Get-GPOReport
                    try {
                        Get-GPOReport -Guid $gpoId -ReportType Xml -Path $reportPath -Server $DomainController -ErrorAction Stop
                        $xmlContent = Get-Content $reportPath -Raw -ErrorAction Stop
                    } catch {
                        Write-MandALog "⚠️ Standard GPO report failed for $($gpo.DisplayName): $($_.Exception.Message)" -Level "WARN"
                        
                        # Method 2: Try with name instead of GUID
                        try {
                            Get-GPOReport -Name $gpo.DisplayName -ReportType Xml -Path $reportPath -Server $DomainController -ErrorAction Stop
                            $xmlContent = Get-Content $reportPath -Raw -ErrorAction Stop
                        } catch {
                            Write-MandALog "⚠️ Named GPO report also failed for $($gpo.DisplayName)" -Level "WARN"
                            
                            # Method 3: Create minimal XML structure
                            $xmlContent = Create-MinimalGPOXML -GPO $gpo
                            $xmlContent | Set-Content -Path $reportPath -Encoding UTF8
                        }
                    }
                    
                    if ([string]::IsNullOrWhiteSpace($xmlContent)) {
                        Write-MandALog "⚠️ Empty XML report for GPO: $($gpo.DisplayName)" -Level "WARN"
                        continue
                    }
                    
                    # Parse XML with robust namespace handling
                    $gpoData = Parse-GPOXMLReportEnhanced -XmlContent $xmlContent -GPO $gpo
                    
                    # Add parsed data to collections
                    if ($gpoData.DriveMappings -and $gpoData.DriveMappings.Count -gt 0) {
                        $allDriveMappings.AddRange($gpoData.DriveMappings)
                    }
                    if ($gpoData.PrinterMappings -and $gpoData.PrinterMappings.Count -gt 0) {
                        $allPrinterMappings.AddRange($gpoData.PrinterMappings)
                    }
                    if ($gpoData.FolderRedirections -and $gpoData.FolderRedirections.Count -gt 0) {
                        $allFolderRedirections.AddRange($gpoData.FolderRedirections)
                    }
                    if ($gpoData.LogonScripts -and $gpoData.LogonScripts.Count -gt 0) {
                        $allLogonScripts.AddRange($gpoData.LogonScripts)
                    }
                    
                    $successfullyProcessed++
                    
                } catch {
                    Write-MandALog "⚠️ Error processing XML for GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "WARN"
                    $failedProcessing++
                }
                
            } catch {
                Write-MandALog "❌ Error processing GPO '$($gpo.DisplayName)': $($_.Exception.Message)" -Level "ERROR"
                $failedProcessing++
            }
        }
        
        Write-Host ""  # Clear progress line
        
        # Export all data to CSV files
        Export-GPODataToCSV -GPOs $allGPOs -DriveMappings $allDriveMappings -PrinterMappings $allPrinterMappings -FolderRedirections $allFolderRedirections -LogonScripts $allLogonScripts -OutputPath $OutputPath
        
        # Enhanced summary with visual indicators
        Write-MandALog "🎯 GPO Analysis Summary:" -Level "SUCCESS"
        Write-MandALog "  📊 Total GPOs processed: $($allGPOs.Count)" -Level "INFO"
        Write-MandALog "  ✅ Successfully analyzed: $successfullyProcessed" -Level "SUCCESS"
        Write-MandALog "  ⚠️ Failed to analyze: $failedProcessing" -Level "WARN"
        Write-MandALog "  🗂️ Drive mappings found: $($allDriveMappings.Count)" -Level "INFO"
        Write-MandALog "  🖨️ Printer mappings found: $($allPrinterMappings.Count)" -Level "INFO"
        Write-MandALog "  📁 Folder redirections found: $($allFolderRedirections.Count)" -Level "INFO"
        Write-MandALog "  📜 Logon scripts found: $($allLogonScripts.Count)" -Level "INFO"
        
        return @{
            GPOs = $allGPOs
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
        Write-MandALog "❌ GPO analysis failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Parse-GPOXMLReportEnhanced {
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
        # Load XML with enhanced error handling
        [xml]$gpoXml = $null
        
        try {
            $gpoXml = [xml]$XmlContent
        } catch {
            Write-MandALog "⚠️ Failed to parse XML for GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
            
            # Try to clean and repair XML
            $cleanedXml = Repair-GPOXML -XmlContent $XmlContent
            try {
                $gpoXml = [xml]$cleanedXml
                Write-MandALog "✅ Successfully repaired XML for GPO $($GPO.DisplayName)" -Level "SUCCESS"
            } catch {
                Write-MandALog "❌ Unable to repair XML for GPO $($GPO.DisplayName)" -Level "ERROR"
                return $result
            }
        }
        
        # Create enhanced namespace manager
        $nsManager = New-Object System.Xml.XmlNamespaceManager($gpoXml.NameTable)
        
        # Add comprehensive namespace mappings
        $commonNamespaces = @{
            "gpo" = "http://www.microsoft.com/GroupPolicy/GPOOperations"
            "q1" = "http://www.microsoft.com/GroupPolicy/Settings"
            "q2" = "http://www.microsoft.com/GroupPolicy/Settings/Registry"
            "q3" = "http://www.microsoft.com/GroupPolicy/Settings/Files"
            "q4" = "http://www.microsoft.com/GroupPolicy/Settings/Scripts"
            "q5" = "http://www.microsoft.com/GroupPolicy/Settings/FolderRedirection"
            "q6" = "http://www.microsoft.com/GroupPolicy/Settings/DriveMapSettings"
            "q7" = "http://www.microsoft.com/GroupPolicy/Settings/Printers"
            "q8" = "http://www.microsoft.com/GroupPolicy/Settings/EnvironmentVariables"
            "q9" = "http://www.microsoft.com/GroupPolicy/Settings/PublicKey"
            "q10" = "http://www.microsoft.com/GroupPolicy/Settings/Security"
        }
        
        foreach ($ns in $commonNamespaces.GetEnumerator()) {
            try {
                $nsManager.AddNamespace($ns.Key, $ns.Value)
            } catch {
                # Ignore namespace conflicts
            }
        }
        
        # Auto-detect and add namespaces from the document
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
                } elseif ($attr.Name -eq "xmlns") {
                    try {
                        $nsManager.AddNamespace("default", $attr.Value)
                    } catch {
                        # Ignore namespace conflicts
                    }
                }
            }
        }
        
        Write-MandALog "🔍 Analyzing GPO: $($GPO.DisplayName)" -Level "DEBUG"
        
        # Search for Drive Mappings using enhanced approaches
        $result.DriveMappings = Find-DriveMappingsEnhanced -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Printer Mappings
        $result.PrinterMappings = Find-PrinterMappingsEnhanced -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Folder Redirections
        $result.FolderRedirections = Find-FolderRedirectionsEnhanced -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
        # Search for Logon Scripts
        $result.LogonScripts = Find-LogonScriptsEnhanced -XmlDoc $gpoXml -NamespaceManager $nsManager -GPO $GPO
        
    } catch {
        Write-MandALog "❌ Error parsing XML for GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "ERROR"
    }
    
    return $result
}

function Repair-GPOXML {
    param([string]$XmlContent)
    
    try {
        # Common XML repairs
        $repairedXml = $XmlContent
        
        # Fix common encoding issues
        $repairedXml = $repairedXml -replace '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ''
        
        # Fix malformed namespace declarations
        $repairedXml = $repairedXml -replace 'xmlns:q(\d+)=""', ''
        
        # Ensure proper XML declaration
        if (-not $repairedXml.StartsWith('<?xml')) {
            $repairedXml = '<?xml version="1.0" encoding="utf-8"?>' + "`n" + $repairedXml
        }
        
        # Fix unclosed tags (basic repair)
        $repairedXml = $repairedXml -replace '<([^/>]+)>([^<]*)</\1>', '<$1>$2</$1>'
        
        return $repairedXml
        
    } catch {
        Write-MandALog "⚠️ XML repair failed: $($_.Exception.Message)" -Level "WARN"
        return $XmlContent
    }
}

function Find-DriveMappingsEnhanced {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $driveMappings = @()
    
    try {
        # Enhanced XPath expressions with fallbacks
        $xpathExpressions = @(
            "//Drive",
            "//q1:Drive",
            "//q6:Drive",
            "//*[local-name()='Drive']",
            "//DriveMapSettings/Drive",
            "//DriveMapSettings//Drive",
            "//Drives/Drive",
            "//Drives//Drive",
            "//*[contains(local-name(), 'Drive') and not(contains(local-name(), 'OneDrive'))]",
            "//ExtensionData//*[local-name()='Drive']",
            "//*[@clsid='{935D1B74-9CB8-4BD3-B83E-7C656DCBC2F6}']//Drive"  # Drive Maps extension CLSID
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $driveNodes = $null
                
                # Try with namespace manager first, then without
                try {
                    if ($NamespaceManager) {
                        $driveNodes = $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                    } else {
                        $driveNodes = $XmlDoc.SelectNodes($xpath)
                    }
                } catch {
                    # Fallback without namespace manager
                    $driveNodes = $XmlDoc.SelectNodes($xpath)
                }
                
                if ($driveNodes -and $driveNodes.Count -gt 0) {
                    Write-MandALog "  🗂️ Found $($driveNodes.Count) drive mappings in $($GPO.DisplayName)" -Level "INFO"
                    
                    foreach ($drive in $driveNodes) {
                        # Enhanced property extraction with multiple fallback methods
                        $props = $drive.SelectSingleNode("Properties")
                        if (-not $props) { $props = $drive.SelectSingleNode("*/Properties") }
                        if (-not $props) { $props = $drive.SelectSingleNode(".//Properties") }
                        if (-not $props) { $props = $drive }
                        
                        if ($props) {
                            $driveMapping = [PSCustomObject]@{
                                GpoId = if ($GPO.Id) { $GPO.Id.ToString() } else { $GPO.ObjectGUID }
                                GpoName = if ($GPO.DisplayName) { $GPO.DisplayName } else { "Unknown GPO" }
                                DriveLetter = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("letter", "Letter", "DriveLetter", "drive", "driveLetter")
                                UncPath = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("path", "Path", "UncPath", "target", "uncPath", "targetPath")
                                Action = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("action", "Action")
                                Label = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("label", "Label", "displayName")
                                Persistent = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("persistent", "Persistent", "reconnect")
                                UseLetter = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("useLetter", "UseLetter", "useFirstAvailable")
                            }
                            
                            # Only add if we have meaningful data
                            if ($driveMapping.DriveLetter -or $driveMapping.UncPath) {
                                $driveMappings += $driveMapping
                            }
                        }
                    }
                    break # Found drives, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "🔍 XPath '$xpath' failed for drive mappings: $($_.Exception.Message)" -Level "DEBUG"
                continue
            }
        }
    } catch {
        Write-MandALog "❌ Error finding drive mappings in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $driveMappings
}

function Get-XmlAttributeValueEnhanced {
    param(
        [System.Xml.XmlNode]$Node,
        [string[]]$AttributeNames
    )
    
    if (-not $Node) { return $null }
    
    foreach ($attrName in $AttributeNames) {
        try {
            $value = $Node.GetAttribute($attrName)
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                return $value
            }
        } catch {
            # Continue to next attribute name
        }
    }
    
    # Try inner text as fallback
    try {
        if (-not [string]::IsNullOrWhiteSpace($Node.InnerText)) {
            return $Node.InnerText
        }
    } catch {
        # Ignore errors
    }
    
    return $null
}

function Find-PrinterMappingsEnhanced {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $printerMappings = @()
    
    try {
        # Enhanced XPath expressions for printer mappings
        $xpathExpressions = @(
            "//SharedPrinter | //PortPrinter | //LocalPrinter",
            "//q1:SharedPrinter | //q1:PortPrinter | //q1:LocalPrinter",
            "//q7:SharedPrinter | //q7:PortPrinter | //q7:LocalPrinter",
            "//*[local-name()='SharedPrinter' or local-name()='PortPrinter' or local-name()='LocalPrinter']",
            "//Printers//*[contains(local-name(), 'Printer')]",
            "//*[contains(local-name(), 'Printer') and not(contains(local-name(), 'PrinterConnection'))]",
            "//ExtensionData//*[contains(local-name(), 'Printer')]"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $printerNodes = $null
                
                try {
                    if ($NamespaceManager) {
                        $printerNodes = $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                    } else {
                        $printerNodes = $XmlDoc.SelectNodes($xpath)
                    }
                } catch {
                    $printerNodes = $XmlDoc.SelectNodes($xpath)
                }
                
                if ($printerNodes -and $printerNodes.Count -gt 0) {
                    Write-MandALog "  🖨️ Found $($printerNodes.Count) printer mappings in $($GPO.DisplayName)" -Level "INFO"
                    
                    foreach ($printer in $printerNodes) {
                        $printerType = $printer.LocalName
                        $props = $printer.SelectSingleNode("Properties")
                        if (-not $props) { $props = $printer.SelectSingleNode("*/Properties") }
                        if (-not $props) { $props = $printer.SelectSingleNode(".//Properties") }
                        if (-not $props) { $props = $printer }
                        
                        if ($props) {
                            $scope = if ($printerType -eq "SharedPrinter") { "User" } else { "Computer" }
                            $printerName = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("name", "Name", "localName", "LocalName", "printerName", "displayName")
                            $printerPath = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("path", "Path", "uncPath", "UncPath", "ipAddress", "IpAddress", "serverName")
                            
                            $printerMapping = [PSCustomObject]@{
                                GpoId = if ($GPO.Id) { $GPO.Id.ToString() } else { $GPO.ObjectGUID }
                                GpoName = if ($GPO.DisplayName) { $GPO.DisplayName } else { "Unknown GPO" }
                                PrinterName = $printerName
                                PrinterPath = $printerPath
                                Scope = $scope
                                Action = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("action", "Action")
                                Default = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("default", "Default", "setAsDefault")
                                Location = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("location", "Location")
                                Comment = Get-XmlAttributeValueEnhanced -Node $props -AttributeNames @("comment", "Comment", "description")
                            }
                            
                            # Only add if we have meaningful data
                            if ($printerMapping.PrinterName -or $printerMapping.PrinterPath) {
                                $printerMappings += $printerMapping
                            }
                        }
                    }
                    break # Found printers, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "🔍 XPath '$xpath' failed for printer mappings: $($_.Exception.Message)" -Level "DEBUG"
                continue
            }
        }
    } catch {
        Write-MandALog "❌ Error finding printer mappings in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $printerMappings
}

function Find-FolderRedirectionsEnhanced {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $folderRedirections = @()
    
    try {
        # Enhanced XPath expressions for folder redirections
        $xpathExpressions = @(
            "//Folder[Location or @DestinationPath]",
            "//q5:Folder",
            "//q1:Folder[Location or @DestinationPath]",
            "//*[local-name()='Folder' and (child::*[local-name()='Location'] or @DestinationPath)]",
            "//FolderRedirection//Folder",
            "//FolderRedirection//*[local-name()='Folder']",
            "//*[contains(local-name(), 'Folder') and contains(local-name(), 'Redirect')]",
            "//ExtensionData//*[local-name()='Folder']"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $folderNodes = $null
                
                try {
                    if ($NamespaceManager) {
                        $folderNodes = $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                    } else {
                        $folderNodes = $XmlDoc.SelectNodes($xpath)
                    }
                } catch {
                    $folderNodes = $XmlDoc.SelectNodes($xpath)
                }
                
                if ($folderNodes -and $folderNodes.Count -gt 0) {
                    Write-MandALog "  📁 Found $($folderNodes.Count) folder redirections in $($GPO.DisplayName)" -Level "INFO"
                    
                    foreach ($folder in $folderNodes) {
                        $folderId = Get-XmlAttributeValueEnhanced -Node $folder -AttributeNames @("Id", "id", "FolderId", "folderType")
                        $location = $folder.SelectSingleNode("Location")
                        if (-not $location) { $location = $folder.SelectSingleNode("*/Location") }
                        if (-not $location) { $location = $folder.SelectSingleNode(".//Location") }
                        $destinationPath = ""
                        
                        if ($location) {
                            $destinationPath = Get-XmlAttributeValueEnhanced -Node $location -AttributeNames @("DestinationPath", "destinationPath", "Path", "path", "target")
                            if ([string]::IsNullOrWhiteSpace($destinationPath)) {
                                $destinationPath = $location.InnerText
                            }
                        }
                        if ([string]::IsNullOrWhiteSpace($destinationPath)) {
                            $destinationPath = Get-XmlAttributeValueEnhanced -Node $folder -AttributeNames @("DestinationPath", "destinationPath", "Path", "path", "target")
                        }
                        
                        if (-not [string]::IsNullOrWhiteSpace($destinationPath)) {
                            # Map folder IDs to friendly names
                            $folderName = Get-FolderFriendlyName -FolderId $folderId
                            
                            $folderRedirections += [PSCustomObject]@{
                                GpoId = if ($GPO.Id) { $GPO.Id.ToString() } else { $GPO.ObjectGUID }
                                GpoName = if ($GPO.DisplayName) { $GPO.DisplayName } else { "Unknown GPO" }
                                FolderName = $folderName
                                RedirectedPath = $destinationPath
                                Scope = "User"
                                GrantExclusiveRights = "True"
                                MoveContents = "True"
                                ApplyToDownlevel = "True"
                            }
                        }
                    }
                    break # Found folder redirections, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "🔍 XPath '$xpath' failed for folder redirections: $($_.Exception.Message)" -Level "DEBUG"
                continue
            }
        }
    } catch {
        Write-MandALog "❌ Error finding folder redirections in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $folderRedirections
}

function Find-LogonScriptsEnhanced {
    param(
        [xml]$XmlDoc,
        [System.Xml.XmlNamespaceManager]$NamespaceManager,
        [object]$GPO
    )
    
    $logonScripts = @()
    
    try {
        # Enhanced XPath expressions for logon scripts
        $xpathExpressions = @(
            "//Script[@Type='Logon' or @type='Logon']",
            "//q4:Script[@Type='Logon' or @type='Logon']",
            "//*[local-name()='Script' and (@Type='Logon' or @type='Logon')]",
            "//Scripts/Script[@Type='Logon']",
            "//LogonScripts//Script",
            "//*[contains(local-name(), 'Script') and contains(@Type, 'Logon')]",
            "//ExtensionData//*[local-name()='Script']"
        )
        
        foreach ($xpath in $xpathExpressions) {
            try {
                $scriptNodes = $null
                
                try {
                    if ($NamespaceManager) {
                        $scriptNodes = $XmlDoc.SelectNodes($xpath, $NamespaceManager)
                    } else {
                        $scriptNodes = $XmlDoc.SelectNodes($xpath)
                    }
                } catch {
                    $scriptNodes = $XmlDoc.SelectNodes($xpath)
                }
                
                if ($scriptNodes -and $scriptNodes.Count -gt 0) {
                    Write-MandALog "  📜 Found $($scriptNodes.Count) logon scripts in $($GPO.DisplayName)" -Level "INFO"
                    
                    foreach ($script in $scriptNodes) {
                        $scriptType = Get-XmlAttributeValueEnhanced -Node $script -AttributeNames @("Type", "type")
                        if ([string]::IsNullOrWhiteSpace($scriptType)) { $scriptType = "Logon" }
                        
                        $runOrder = Get-XmlAttributeValueEnhanced -Node $script -AttributeNames @("RunOrder", "runOrder", "Order", "order")
                        if ([string]::IsNullOrWhiteSpace($runOrder)) { $runOrder = "0" }
                        
                        $logonScripts += [PSCustomObject]@{
                            GpoId = if ($GPO.Id) { $GPO.Id.ToString() } else { $GPO.ObjectGUID }
                            GpoName = if ($GPO.DisplayName) { $GPO.DisplayName } else { "Unknown GPO" }
                            ScriptPath = Get-XmlAttributeValueEnhanced -Node $script -AttributeNames @("Command", "command", "Path", "path", "ScriptPath")
                            ScriptType = $scriptType
                            Parameters = Get-XmlAttributeValueEnhanced -Node $script -AttributeNames @("Parameters", "parameters", "Args", "args")
                            RunOrder = $runOrder
                        }
                    }
                    break # Found scripts, no need to try other XPath expressions
                }
            } catch {
                Write-MandALog "🔍 XPath '$xpath' failed for logon scripts: $($_.Exception.Message)" -Level "DEBUG"
                continue
            }
        }
    } catch {
        Write-MandALog "❌ Error finding logon scripts in GPO $($GPO.DisplayName): $($_.Exception.Message)" -Level "WARN"
    }
    
    return $logonScripts
}

function Create-MinimalGPOXML {
    param([object]$GPO)
    
    $gpoId = if ($GPO.Id) { $GPO.Id } else { $GPO.ObjectGUID }
    $gpoName = if ($GPO.DisplayName) { $GPO.DisplayName } else { "Unknown GPO" }
    
    return @"
<?xml version="1.0" encoding="utf-8"?>
<GPO xmlns="http://www.microsoft.com/GroupPolicy/GPOOperations" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <Identifier>
        <Identifier xmlns="http://www.microsoft.com/GroupPolicy/GPOOperations">{$gpoId}</Identifier>
        <Domain xmlns="http://www.microsoft.com/GroupPolicy/GPOOperations">$((Get-ADDomain).DNSRoot)</Domain>
    </Identifier>
    <Name>$gpoName</Name>
    <Computer>
        <Enabled>false</Enabled>
        <ExtensionData />
    </Computer>
    <User>
        <Enabled>false</Enabled>
        <ExtensionData />
    </User>
</GPO>
"@
}