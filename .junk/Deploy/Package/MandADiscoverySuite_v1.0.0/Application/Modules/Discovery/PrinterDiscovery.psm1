# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Printer discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers network printers, print servers, print queues, and printing infrastructure
    using WMI, SNMP, and Active Directory to provide comprehensive printing environment
    assessment for M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Print Management features, SNMP tools (optional)
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-PrinterLog {
    <#
    .SYNOPSIS
        Writes log entries specific to printer discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Printer] $Message" -Level $Level -Component "PrinterDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [Printer] $Message" -ForegroundColor $color
    }
}

function Invoke-PrinterDiscovery {
    <#
    .SYNOPSIS
        Main printer discovery function.
    
    .DESCRIPTION
        Discovers local printers, network printers, print servers, and printing
        infrastructure to provide comprehensive printing environment assessment.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-PrinterLog -Level "HEADER" -Message "Starting Printer Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'PrinterDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Local Printers
        try {
            Write-PrinterLog -Level "INFO" -Message "Discovering local printers..." -Context $Context
            $localPrinterData = Get-LocalPrinters -SessionId $SessionId
            if ($localPrinterData.Count -gt 0) {
                $localPrinterData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'LocalPrinter' -Force }
                $null = $allDiscoveredData.AddRange($localPrinterData)
                $result.Metadata["LocalPrinterCount"] = $localPrinterData.Count
            }
            Write-PrinterLog -Level "SUCCESS" -Message "Discovered $($localPrinterData.Count) local printers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover local printers: $($_.Exception.Message)", @{Section="LocalPrinters"})
        }
        
        # Discover Network Printers
        try {
            Write-PrinterLog -Level "INFO" -Message "Discovering network printers..." -Context $Context
            $networkPrinterData = Get-NetworkPrinters -Configuration $Configuration -SessionId $SessionId
            if ($networkPrinterData.Count -gt 0) {
                $networkPrinterData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NetworkPrinter' -Force }
                $null = $allDiscoveredData.AddRange($networkPrinterData)
                $result.Metadata["NetworkPrinterCount"] = $networkPrinterData.Count
            }
            Write-PrinterLog -Level "SUCCESS" -Message "Discovered $($networkPrinterData.Count) network printers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover network printers: $($_.Exception.Message)", @{Section="NetworkPrinters"})
        }
        
        # Discover Print Servers
        try {
            Write-PrinterLog -Level "INFO" -Message "Discovering print servers..." -Context $Context
            $printServerData = Get-PrintServers -Configuration $Configuration -SessionId $SessionId
            if ($printServerData.Count -gt 0) {
                $printServerData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrintServer' -Force }
                $null = $allDiscoveredData.AddRange($printServerData)
                $result.Metadata["PrintServerCount"] = $printServerData.Count
            }
            Write-PrinterLog -Level "SUCCESS" -Message "Discovered $($printServerData.Count) print servers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover print servers: $($_.Exception.Message)", @{Section="PrintServers"})
        }
        
        # Discover Printer Drivers
        try {
            Write-PrinterLog -Level "INFO" -Message "Discovering printer drivers..." -Context $Context
            $driverData = Get-PrinterDrivers -SessionId $SessionId
            if ($driverData.Count -gt 0) {
                $driverData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrinterDriver' -Force }
                $null = $allDiscoveredData.AddRange($driverData)
                $result.Metadata["PrinterDriverCount"] = $driverData.Count
            }
            Write-PrinterLog -Level "SUCCESS" -Message "Discovered $($driverData.Count) printer drivers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover printer drivers: $($_.Exception.Message)", @{Section="PrinterDrivers"})
        }
        
        # Generate Printer Summary
        try {
            Write-PrinterLog -Level "INFO" -Message "Generating printer summary..." -Context $Context
            $summary = Get-PrinterSummary -PrinterData $allDiscoveredData -SessionId $SessionId
            if ($summary.Count -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'PrinterSummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["PrinterSummaryCount"] = $summary.Count
            }
            Write-PrinterLog -Level "SUCCESS" -Message "Generated printer summary" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate printer summary: $($_.Exception.Message)", @{Section="PrinterSummary"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-PrinterLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Printer_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "PrinterDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-PrinterLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-PrinterLog -Level "WARN" -Message "No printer data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during printer discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-PrinterLog -Level "HEADER" -Message "Printer discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-LocalPrinters {
    <#
    .SYNOPSIS
        Discovers local printers and their configurations.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $printerData = @()
    
    try {
        # Get printers using WMI
        $printers = Get-CimInstance -ClassName Win32_Printer -ErrorAction SilentlyContinue
        
        foreach ($printer in $printers) {
            $printerData += [PSCustomObject]@{
                PrinterType = "Local"
                Name = $printer.Name
                DeviceID = $printer.DeviceID
                DriverName = $printer.DriverName
                PortName = $printer.PortName
                Location = $printer.Location
                Comment = $printer.Comment
                ShareName = $printer.ShareName
                Shared = $printer.Shared
                Published = $printer.Published
                Local = $printer.Local
                Network = $printer.Network
                Default = $printer.Default
                Status = $printer.Status
                StatusInfo = $printer.StatusInfo
                PrinterState = $printer.PrinterState
                PrinterStatus = $printer.PrinterStatus
                Attributes = $printer.Attributes
                Priority = $printer.Priority
                HorizontalResolution = $printer.HorizontalResolution
                VerticalResolution = $printer.VerticalResolution
                PrintProcessor = $printer.PrintProcessor
                PrintJobDataType = $printer.PrintJobDataType
                Parameters = $printer.Parameters
                SeparatorFile = $printer.SeparatorFile
                SpoolEnabled = $printer.SpoolEnabled
                DirectPrinting = $printer.DirectPrinting
                DoCompleteFirst = $printer.DoCompleteFirst
                EnableBIDI = $printer.EnableBIDI
                EnableDeviceQueryPrint = $printer.EnableDevQueryPrint
                Hidden = $printer.Hidden
                KeepPrintedJobs = $printer.KeepPrintedJobs
                Queued = $printer.Queued
                RawOnly = $printer.RawOnly
                Published = $printer.Published
                SessionId = $SessionId
            }
        }
        
        # Get printer ports
        $printerPorts = Get-CimInstance -ClassName Win32_TCPIPPrinterPort -ErrorAction SilentlyContinue
        foreach ($port in $printerPorts) {
            $printerData += [PSCustomObject]@{
                PrinterType = "TCPIPPort"
                Name = $port.Name
                HostAddress = $port.HostAddress
                PortNumber = $port.PortNumber
                Protocol = $port.Protocol
                SNMPEnabled = $port.SNMPEnabled
                SNMPCommunity = $port.SNMPCommunity
                SNMPDevIndex = $port.SNMPDevIndex
                Description = $port.Description
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Failed to discover local printers: $($_.Exception.Message)"
    }
    
    return $printerData
}

function Get-NetworkPrinters {
    <#
    .SYNOPSIS
        Discovers network printers and print queues.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $networkPrinterData = @()
    
    try {
        # Get network printers from WMI
        $networkPrinters = Get-CimInstance -ClassName Win32_Printer | Where-Object { $_.Network -eq $true }
        
        foreach ($printer in $networkPrinters) {
            $networkPrinterData += [PSCustomObject]@{
                PrinterType = "Network"
                Name = $printer.Name
                ServerName = $printer.ServerName
                ShareName = $printer.ShareName
                Location = $printer.Location
                Comment = $printer.Comment
                DriverName = $printer.DriverName
                PortName = $printer.PortName
                Status = $printer.Status
                PrinterState = $printer.PrinterState
                PrinterStatus = $printer.PrinterStatus
                Default = $printer.Default
                Priority = $printer.Priority
                Attributes = $printer.Attributes
                HorizontalResolution = $printer.HorizontalResolution
                VerticalResolution = $printer.VerticalResolution
                SessionId = $SessionId
            }
        }
        
        # Check for configured network printer ranges
        if ($Configuration.printers.networkRanges) {
            foreach ($range in $Configuration.printers.networkRanges) {
                $networkPrinterData += [PSCustomObject]@{
                    PrinterType = "NetworkRange"
                    Name = "Network Scan Range"
                    IPRange = $range.ipRange
                    Ports = ($range.ports -join ', ')
                    Note = "Configured for network printer scanning"
                    Status = "Requires network scanning implementation"
                    SessionId = $SessionId
                }
            }
        }
        
        # Try to discover printers via Active Directory
        try {
            if (Get-Module -Name ActiveDirectory -ListAvailable) {
                Import-Module ActiveDirectory -ErrorAction SilentlyContinue
                $publishedPrinters = Get-ADObject -Filter "objectClass -eq 'printQueue'" -Properties * -ErrorAction SilentlyContinue
                
                foreach ($printer in $publishedPrinters) {
                    $networkPrinterData += [PSCustomObject]@{
                        PrinterType = "ADPublished"
                        Name = $printer.Name
                        DistinguishedName = $printer.DistinguishedName
                        PrinterName = $printer.printerName
                        ServerName = $printer.serverName
                        Location = $printer.location
                        UNCName = $printer.uNCName
                        URL = $printer.url
                        DriverName = $printer.driverName
                        DriverVersion = $printer.driverVersion
                        PortName = $printer.portName
                        PrintLanguage = ($printer.printLanguage -join ', ')
                        PrintColor = $printer.printColor
                        PrintDuplexSupported = $printer.printDuplexSupported
                        PrintMaxResolutionSupported = $printer.printMaxResolutionSupported
                        PrintMediaReady = ($printer.printMediaReady -join ', ')
                        PrintMediaSupported = ($printer.printMediaSupported -join ', ')
                        PrintOrientationsSupported = ($printer.printOrientationsSupported -join ', ')
                        Priority = $printer.priority
                        WhenCreated = $printer.whenCreated
                        WhenChanged = $printer.whenChanged
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-PrinterLog -Level "DEBUG" -Message "Active Directory printer discovery not available: $($_.Exception.Message)"
        }
        
    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Failed to discover network printers: $($_.Exception.Message)"
    }
    
    return $networkPrinterData
}

function Get-PrintServers {
    <#
    .SYNOPSIS
        Discovers print servers and their configurations.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $printServerData = @()
    
    try {
        # Check if Print Management module is available
        if (Get-Module -Name PrintManagement -ListAvailable) {
            Import-Module PrintManagement -ErrorAction SilentlyContinue
            
            try {
                # Get local print server
                $printServer = Get-PrinterPort | Select-Object ComputerName -Unique
                foreach ($server in $printServer) {
                    if ($server.ComputerName) {
                        $printServerData += [PSCustomObject]@{
                            ServerType = "PrintServer"
                            ServerName = $server.ComputerName
                            IsLocal = ($server.ComputerName -eq $env:COMPUTERNAME)
                            Source = "PrintManagement"
                            SessionId = $SessionId
                        }
                    }
                }
                
                # Get printer information from print management
                $printers = Get-Printer -ErrorAction SilentlyContinue
                $printersByServer = $printers | Group-Object ComputerName
                
                foreach ($serverGroup in $printersByServer) {
                    $serverName = if ($serverGroup.Name) { $serverGroup.Name } else { $env:COMPUTERNAME }
                    
                    $printServerData += [PSCustomObject]@{
                        ServerType = "PrintServerSummary"
                        ServerName = $serverName
                        PrinterCount = $serverGroup.Count
                        SharedPrinters = ($serverGroup.Group | Where-Object { $_.Shared -eq $true }).Count
                        PublishedPrinters = ($serverGroup.Group | Where-Object { $_.Published -eq $true }).Count
                        LocalPrinters = ($serverGroup.Group | Where-Object { $_.Type -eq "Local" }).Count
                        NetworkPrinters = ($serverGroup.Group | Where-Object { $_.Type -eq "Connection" }).Count
                        SessionId = $SessionId
                    }
                }
                
            } catch {
                Write-PrinterLog -Level "DEBUG" -Message "Print Management module available but failed to query: $($_.Exception.Message)"
            }
        }
        
        # Get print spooler service information
        $spoolerService = Get-Service -Name Spooler -ErrorAction SilentlyContinue
        if ($spoolerService) {
            $printServerData += [PSCustomObject]@{
                ServerType = "SpoolerService"
                ServerName = $env:COMPUTERNAME
                ServiceName = $spoolerService.Name
                Status = $spoolerService.Status
                StartType = $spoolerService.StartType
                DisplayName = $spoolerService.DisplayName
                SessionId = $SessionId
            }
        }
        
        # Check for configured print servers
        if ($Configuration.printers.printServers) {
            foreach ($server in $Configuration.printers.printServers) {
                $printServerData += [PSCustomObject]@{
                    ServerType = "ConfiguredServer"
                    ServerName = $server.name
                    IPAddress = $server.ipAddress
                    Type = $server.type
                    Source = "Configuration"
                    Note = "Configured print server - requires connection for detailed discovery"
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Failed to discover print servers: $($_.Exception.Message)"
    }
    
    return $printServerData
}

function Get-PrinterDrivers {
    <#
    .SYNOPSIS
        Discovers installed printer drivers.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $driverData = @()
    
    try {
        # Get printer drivers using WMI
        $drivers = Get-CimInstance -ClassName Win32_PrinterDriver -ErrorAction SilentlyContinue
        
        foreach ($driver in $drivers) {
            $driverData += [PSCustomObject]@{
                DriverType = "PrinterDriver"
                Name = $driver.Name
                Version = $driver.Version
                InfName = $driver.InfName
                OEMUrl = $driver.OEMUrl
                DriverPath = $driver.DriverPath
                DataFile = $driver.DataFile
                ConfigFile = $driver.ConfigFile
                HelpFile = $driver.HelpFile
                DependentFiles = ($driver.DependentFiles -join '; ')
                MonitorName = $driver.MonitorName
                DefaultDataType = $driver.DefaultDataType
                SupportedPlatform = $driver.SupportedPlatform
                FilePath = $driver.FilePath
                Started = $driver.Started
                StartMode = $driver.StartMode
                SessionId = $SessionId
            }
        }
        
        # Get print processors
        $printProcessors = Get-CimInstance -ClassName Win32_PrinterDriverDll -ErrorAction SilentlyContinue
        foreach ($processor in $printProcessors) {
            $driverData += [PSCustomObject]@{
                DriverType = "PrintProcessor"
                Name = $processor.Name
                Path = $processor.Path
                SessionId = $SessionId
            }
        }
        
        # Try to get driver store information
        try {
            if (Get-Command Get-WindowsDriver -ErrorAction SilentlyContinue) {
                $windowsDrivers = Get-WindowsDriver -Online | Where-Object { $_.ClassName -eq "Printer" }
                foreach ($driver in $windowsDrivers) {
                    $driverData += [PSCustomObject]@{
                        DriverType = "WindowsDriver"
                        ProviderName = $driver.ProviderName
                        ClassDescription = $driver.ClassDescription
                        ClassName = $driver.ClassName
                        Version = $driver.Version
                        Date = $driver.Date
                        Architecture = $driver.Architecture
                        InboxDriver = $driver.InboxDriver
                        OriginalFileName = $driver.OriginalFileName
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-PrinterLog -Level "DEBUG" -Message "Windows driver enumeration not available"
        }
        
    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Failed to discover printer drivers: $($_.Exception.Message)"
    }
    
    return $driverData
}

function Get-PrinterSummary {
    <#
    .SYNOPSIS
        Generates a summary of printer discovery results.
    #>
    [CmdletBinding()]
    param(
        [array]$PrinterData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Overall printer summary
        $localPrinterCount = ($PrinterData | Where-Object { $_._DataType -eq 'LocalPrinter' -and $_.PrinterType -eq 'Local' }).Count
        $networkPrinterCount = ($PrinterData | Where-Object { $_._DataType -eq 'NetworkPrinter' }).Count
        $printServerCount = ($PrinterData | Where-Object { $_._DataType -eq 'PrintServer' -and $_.ServerType -eq 'PrintServer' }).Count
        $driverCount = ($PrinterData | Where-Object { $_._DataType -eq 'PrinterDriver' -and $_.DriverType -eq 'PrinterDriver' }).Count
        
        # Printer status analysis
        $activePrinters = ($PrinterData | Where-Object { $_.Status -eq 'OK' -or $_.Status -eq 'Idle' }).Count
        $offlinePrinters = ($PrinterData | Where-Object { $_.Status -eq 'Offline' -or $_.Status -eq 'Error' }).Count
        $sharedPrinters = ($PrinterData | Where-Object { $_.Shared -eq $true }).Count
        $publishedPrinters = ($PrinterData | Where-Object { $_.Published -eq $true }).Count
        
        $summary += [PSCustomObject]@{
            SummaryType = "PrinterOverview"
            LocalPrinterCount = $localPrinterCount
            NetworkPrinterCount = $networkPrinterCount
            PrintServerCount = $printServerCount
            DriverCount = $driverCount
            TotalPrinterObjects = $localPrinterCount + $networkPrinterCount
            ActivePrinters = $activePrinters
            OfflinePrinters = $offlinePrinters
            SharedPrinters = $sharedPrinters
            PublishedPrinters = $publishedPrinters
            TCPIPPortCount = ($PrinterData | Where-Object { $_.PrinterType -eq 'TCPIPPort' }).Count
            ADPublishedCount = ($PrinterData | Where-Object { $_.PrinterType -eq 'ADPublished' }).Count
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # Printer type breakdown
        $printerTypes = $PrinterData | Where-Object { $_.PrinterType } | Group-Object PrinterType | Sort-Object Count -Descending
        foreach ($type in $printerTypes) {
            $summary += [PSCustomObject]@{
                SummaryType = "PrinterTypeBreakdown"
                PrinterType = $type.Name
                Count = $type.Count
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
        # Driver analysis
        $uniqueDrivers = ($PrinterData | Where-Object { $_.DriverName } | Select-Object DriverName -Unique).Count
        if ($uniqueDrivers -gt 0) {
            $summary += [PSCustomObject]@{
                SummaryType = "DriverAnalysis"
                UniqueDriverCount = $uniqueDrivers
                TotalDriverInstances = ($PrinterData | Where-Object { $_.DriverName }).Count
                MostCommonDriver = ($PrinterData | Where-Object { $_.DriverName } | Group-Object DriverName | Sort-Object Count -Descending | Select-Object -First 1).Name
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-PrinterLog -Level "ERROR" -Message "Failed to generate printer summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-PrinterDiscovery
