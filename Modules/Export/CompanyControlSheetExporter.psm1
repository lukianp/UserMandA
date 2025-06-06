# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Exports processed M&A discovery data to a series of CSV files formatted for a Company Control Sheet.
.DESCRIPTION
    This module contains the Export-ToCompanyControlSheet function, which takes the aggregated and processed
    data from the M&A Discovery Suite and generates multiple CSV files. Each CSV corresponds to a specific
    tab or section of a typical M&A Company Control Sheet, populating it with relevant discovered information.

    The module assumes that the discovery and processing phases have populated a rich data object
    (referred to as $ProcessedData) containing collections like UserProfiles, AggregatedDataStore.Users,
    AggregatedDataStore.Groups, AggregatedDataStore.Devices, AggregatedDataStore.ExchangeMailboxes, etc.

    The output CSV files are saved to a subdirectory (CompanyControlSheetCSVs) within the main configured output path.
.PARAMETER ProcessedData
    A hashtable containing the fully processed and aggregated data from the M&A Discovery Suite.
    This includes UserProfiles, AggregatedDataStore (with Users, Groups, Devices, etc.), MigrationWaves, etc.
.PARAMETER Configuration
    The main configuration hashtable for the M&A Discovery Suite, used to determine the base output path.
.EXAMPLE
    # Assuming $ProcessedData and $Config are already populated
    Export-ToCompanyControlSheet -ProcessedData $ProcessedData -Configuration $Config

    # This function is typically called by the MandA-Orchestrator.ps1 during the Export phase.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
    Date: 2025-05-29

    Dependencies:
    - Assumes Write-MandALog function is available globally (from EnhancedLogging.psm1).
    - Assumes utility functions like Ensure-DirectoryExists might be available (or can be inlined).

    Data Availability:
    The completeness of the output CSVs depends heavily on the data collected during the discovery phase
    and the richness of the $ProcessedData object. Some sheets may be sparsely populated or empty if the
    corresponding data was not discovered or aggregated. Column headers are suggestive and aim for
    comprehensiveness; actual data presence will vary.
#>




#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}

function Export-ToCompanyControlSheet {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting export to Company Control Sheet CSVs" -Level "HEADER"

    # Determine base output path and create subdirectory for these specific CSVs
    $baseSuiteOutputPath = $Configuration.environment.outputPath
    if (-not ([System.IO.Path]::IsPathRooted($baseSuiteOutputPath))) {
        # If SuiteRoot is available globally (set by Set-SuiteEnvironment.ps1)
        if ($global:MandASuiteRoot) {
            $baseSuiteOutputPath = Join-Path $global:MandASuiteRoot $baseSuiteOutputPath
        } else {
            # Fallback if MandASuiteRoot is not set, assume relative to current script execution (less ideal)
            Write-MandALog "Global variable MandASuiteRoot not found. Resolving output path relative to PSScriptRoot of the calling script or current location." -Level "WARN"
            $baseSuiteOutputPath = Resolve-Path -Path $baseSuiteOutputPath -ErrorAction SilentlyContinue
            if (-not $baseSuiteOutputPath) {
                 Write-MandALog "Could not resolve base output path: $($Configuration.environment.outputPath). Defaulting to .\Output" -Level "ERROR"
                 $baseSuiteOutputPath = ".\Output"
            }
        }
    }
    
    $outputCsvPath = Join-Path $baseSuiteOutputPath "CompanyControlSheetCSVs"

    # Helper function to ensure directory exists
    function Ensure-DirectoryExistsInternal {
        param([string]$Path)
        if (-not (Test-Path $Path -PathType Container)) {
            try {
                New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-MandALog "Created directory: $Path" -Level "INFO"
            }
            catch {
                Write-MandALog "Failed to create directory: $Path. Error: $($_.Exception.Message)" -Level "ERROR"
                throw "Failed to create output directory for Company Control Sheet CSVs."
            }
        }
    }
    Ensure-DirectoryExistsInternal -Path $outputCsvPath

    # --- User_List.csv ---
    Write-MandALog "Processing User_List.csv" -Level "INFO"
    try {
        if ($ProcessedData.UserProfiles -and $ProcessedData.UserProfiles.Count -gt 0) {
            $userListData = $ProcessedData.UserProfiles | ForEach-Object {
                [PSCustomObject]@{
                    UserPrincipalName        = $_.UserPrincipalName
                    DisplayName              = $_.DisplayName
                    FirstName                = $_.GivenName # Assuming GivenName and Surname are in UserProfiles
                    LastName                 = $_.Surname
                    Department               = $_.Department
                    JobTitle                 = $_.JobTitle
                    OfficeLocation           = $_.OfficeLocation # Assuming OfficeLocation is in UserProfiles
                    ManagerUPN               = $_.ManagerUPN # Assuming ManagerUPN is in UserProfiles
                    SamAccountName           = $_.SamAccountName
                    EmployeeId               = $_.EmployeeId # Assuming EmployeeId is in UserProfiles
                    GraphId                  = $_.GraphId
                    AD_ObjectGUID            = $_.AD_ObjectGUID # Assuming AD_ObjectGUID is in UserProfiles
                    PrimaryEmailAddress      = $_.PrimarySmtpAddress
                    AccountEnabled           = $_.Enabled
                    LastLogonDate            = if ($_.LastLogon) { [datetime]$_.LastLogon } else { $null }
                    PasswordLastSet          = if ($_.PasswordLastSet) { [datetime]$_.PasswordLastSet } else { $null } # Assuming PasswordLastSet is in UserProfiles
                    CreatedDateTime          = if ($_.CreatedDateTime) { [datetime]$_.CreatedDateTime } else { $null }
                    OnPremisesSyncEnabled    = $_.OnPremisesSyncEnabled
                    DirSyncImmutableId       = $_.DirSyncImmutableId # Assuming DirSyncImmutableId is in UserProfiles
                    UsageLocation            = $_.UsageLocation
                    AssignedLicenses         = if ($_.AssignedLicenses) { ($_.AssignedLicenses.SkuPartNumber -join '; ') } else { "" }
                    BelongsToWave            = $_.MigrationWaveName
                    MigrationComplexityScore = $_.ComplexityScore
                    MigrationReadinessStatus = $_.ReadinessStatus
                    Notes                    = $_.Notes # Assuming Notes field exists
                }
            }
            $userListData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - User_List.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported User_List.csv with $($userListData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No UserProfiles data found to export for User_List.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - User_List.csv") -ItemType File -Force | Out-Null # Create empty file
        }
    } catch {
        Write-MandALog "Error exporting User_List.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- IP_Details.csv ---
    Write-MandALog "Processing IP_Details.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Devices -and $ProcessedData.AggregatedDataStore.Devices.Count -gt 0) {
            $ipDetailsData = $ProcessedData.AggregatedDataStore.Devices | Where-Object { $_.IPAddress -or $_.IPv6Address } | ForEach-Object {
                [PSCustomObject]@{
                    DeviceName      = $_.DisplayName # or Hostname
                    OperatingSystem = $_.OperatingSystem
                    DeviceType      = $_.DeviceType
                    IPAddress_v4    = $_.IPAddress
                    SubnetMask_v4   = $_.SubnetMask
                    DefaultGateway_v4 = $_.DefaultGateway
                    IPAddress_v6    = $_.IPv6Address # Assuming IPv6Address might be collected
                    MACAddress      = $_.MACAddress
                    DNS_Servers     = if ($_.DNSServers) { ($_.DNSServers -join '; ') } else { "" }
                    DHCP_Enabled    = $_.DHCPEnabled # Assuming DHCPEnabled might be collected
                    LastSeen        = if ($_.LastSyncDateTime) { [datetime]$_.LastSyncDateTime } else { $null }
                    Notes           = $_.Notes
                }
            }
            if ($ipDetailsData.Count -gt 0) {
                $ipDetailsData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - IP_Details.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported IP_Details.csv with $($ipDetailsData.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No device data with IP information found for IP_Details.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - IP_Details.csv") -ItemType File -Force | Out-Null
            }
        } else {
            Write-MandALog "No AggregatedDataStore.Devices data found to export for IP_Details.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - IP_Details.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting IP_Details.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Current_Hardware_Asset_List.csv ---
    Write-MandALog "Processing Current_Hardware_Asset_List.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Devices -and $ProcessedData.AggregatedDataStore.Devices.Count -gt 0) {
            $hardwareData = $ProcessedData.AggregatedDataStore.Devices | ForEach-Object {
                [PSCustomObject]@{
                    AssetID              = $_.AssetTag # Or a generated ID if AssetTag is not consistently available
                    DeviceName           = $_.DisplayName
                    SerialNumber         = $_.SerialNumber
                    Manufacturer         = $_.Manufacturer
                    Model                = $_.Model
                    DeviceType           = $_.DeviceType # e.g., Laptop, Desktop, Server, Mobile, VirtualMachine
                    ChassisType          = $_.ChassisType # Assuming ChassisType might be collected
                    OperatingSystem      = $_.OperatingSystem
                    OSVersion            = $_.OSVersion
                    OS_BuildNumber       = $_.OS_BuildNumber # Assuming OS_BuildNumber might be collected
                    CPU_Processor        = $_.Processor
                    RAM_GB               = if ($_.TotalPhysicalMemoryBytes) { [math]::Round($_.TotalPhysicalMemoryBytes / 1GB, 2) } elseif($_.TotalPhysicalMemoryGB) { $_.TotalPhysicalMemoryGB } else { $null }
                    Storage_Total_GB     = if ($_.TotalStorageBytes) { [math]::Round($_.TotalStorageBytes / 1GB, 2) } elseif($_.TotalStorageGB) { $_.TotalStorageGB } else { $null }
                    Storage_Type         = $_.StorageType # e.g., SSD, HDD
                    PurchaseDate         = if ($_.PurchaseDate) { [datetime]$_.PurchaseDate } else { $null }
                    WarrantyExpiryDate   = if ($_.WarrantyExpiryDate) { [datetime]$_.WarrantyExpiryDate } else { $null }
                    AssignedUserUPN      = $_.RegisteredUserUPN # or PrimaryUserUPN
                    LastSeenDateTime     = if ($_.LastSyncDateTime) { [datetime]$_.LastSyncDateTime } elseif ($_.ApproximateLastSignInDateTime) { [datetime]$_.ApproximateLastSignInDateTime } else { $null }
                    DeviceStatus         = $_.DeviceStatus # e.g., Active, Inactive, Compliant, NonCompliant
                    ManagementAgent      = $_.ManagementAgent # e.g., Intune, SCCM, AD
                    Notes                = $_.Notes
                }
            }
            $hardwareData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Hardware_Asset_List.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Current_Hardware_Asset_List.csv with $($hardwareData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.Devices data found to export for Current_Hardware_Asset_List.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Hardware_Asset_List.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Current_Hardware_Asset_List.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Current_Software_Asset_List.csv / Current_Laptop_Application_List.csv / Current_VDI_Application_List.csv ---
    # This requires a specific $ProcessedData.AggregatedDataStore.InstalledSoftware structure.
    # For now, this will be a placeholder. Actual implementation depends on how software inventory is collected.
    # If data comes from Intune (DeviceManagementApps.Read.All), it's often high-level app registrations, not installed EXE/MSI inventory.
    Write-MandALog "Processing Software/Application Lists (Current_Software_Asset_List.csv, etc.)" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.InstalledSoftware -and $ProcessedData.AggregatedDataStore.InstalledSoftware.Count -gt 0) {
            $allSoftware = $ProcessedData.AggregatedDataStore.InstalledSoftware | ForEach-Object {
                [PSCustomObject]@{
                    ApplicationName = $_.ApplicationName
                    Publisher       = $_.Publisher
                    Version         = $_.Version
                    InstallDate     = if ($_.InstallDate) { [datetime]$_.InstallDate } else { $null }
                    DeviceName      = $_.DeviceName # Link to hardware asset
                    UserUPN         = $_.UserUPN    # User context if applicable
                    InstallType     = $_.InstallType # e.g., Laptop, VDI, ServerApp, UserInstalled, SystemInstalled
                    InstallPath     = $_.InstallPath
                    LicenseKey      = $_.LicenseKey # Highly unlikely to be discovered automatically
                    Notes           = $_.Notes
                }
            }

            $allSoftware | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Software_Asset_List.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Current_Software_Asset_List.csv with $($allSoftware.Count) records." -Level "SUCCESS"

            $laptopApps = $allSoftware | Where-Object { $_.InstallType -eq 'Laptop' -or ($_.DeviceName -match "LAPTOP" -or $_.DeviceName -match "LT-") } # Example filter
            if ($laptopApps.Count -gt 0) {
                $laptopApps | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Laptop_Application_List.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported Current_Laptop_Application_List.csv with $($laptopApps.Count) records." -Level "SUCCESS"
            } else {
                 Write-MandALog "No specific laptop application data found for Current_Laptop_Application_List.csv." -Level "WARN"
                 New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Laptop_Application_List.csv") -ItemType File -Force | Out-Null
            }


            $vdiApps = $allSoftware | Where-Object { $_.InstallType -eq 'VDI' -or ($_.DeviceName -match "VDI" -or $_.DeviceName -match "CITRIX") } # Example filter
            if ($vdiApps.Count -gt 0) {
                $vdiApps | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_VDI_Application_List.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported Current_VDI_Application_List.csv with $($vdiApps.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No specific VDI application data found for Current_VDI_Application_List.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_VDI_Application_List.csv") -ItemType File -Force | Out-Null
            }

        } else {
            Write-MandALog "No AggregatedDataStore.InstalledSoftware data found. Software lists will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Software_Asset_List.csv") -ItemType File -Force | Out-Null
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_Laptop_Application_List.csv") -ItemType File -Force | Out-Null
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Current_VDI_Application_List.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Software/Application Lists: $($_.Exception.Message)" -Level "ERROR"
    }


    # --- Server_Specifications.csv ---
    Write-MandALog "Processing Server_Specifications.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Devices -and $ProcessedData.AggregatedDataStore.Devices.Count -gt 0) {
            $serverSpecData = $ProcessedData.AggregatedDataStore.Devices | Where-Object { $_.DeviceType -eq 'Server' -or $_.OperatingSystem -like "*Server*" } | ForEach-Object {
                [PSCustomObject]@{
                    ServerName        = $_.DisplayName
                    OperatingSystem   = $_.OperatingSystem
                    OSVersion         = $_.OSVersion
                    OS_ServicePack    = $_.OS_ServicePack # Assuming OS_ServicePack might be collected
                    Domain_Workgroup  = $_.DomainName # or Workgroup
                    ServerRole        = if ($_.ServerRole) { ($_.ServerRole -join '; ') } else { "" } # Assuming ServerRole is an array
                    CPU_Processor     = $_.Processor
                    CPU_Cores         = $_.ProcessorCores # Assuming ProcessorCores might be collected
                    CPU_Sockets       = $_.ProcessorSockets # Assuming ProcessorSockets might be collected
                    RAM_GB            = if ($_.TotalPhysicalMemoryBytes) { [math]::Round($_.TotalPhysicalMemoryBytes / 1GB, 2) } elseif($_.TotalPhysicalMemoryGB) { $_.TotalPhysicalMemoryGB } else { $null }
                    Storage_Config_GB = if ($_.TotalStorageBytes) { [math]::Round($_.TotalStorageBytes / 1GB, 2) } elseif($_.TotalStorageGB) { $_.TotalStorageGB } else { $null } # Further details like disk layout would be advanced discovery
                    IPAddress_v4      = $_.IPAddress
                    IsVirtual         = $_.IsVirtual
                    Hypervisor        = $_.Hypervisor
                    LastBootTime      = if ($_.LastBootUpTime) { [datetime]$_.LastBootUpTime } else { $null } # Assuming LastBootUpTime might be collected
                    Uptime_Days       = if ($_.LastBootUpTime) { (New-TimeSpan -Start ([datetime]$_.LastBootUpTime) -End (Get-Date)).TotalDays } else { $null }
                    Notes             = $_.Notes
                }
            }
            if ($serverSpecData.Count -gt 0) {
                $serverSpecData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_Specifications.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported Server_Specifications.csv with $($serverSpecData.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No server device data found for Server_Specifications.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_Specifications.csv") -ItemType File -Force | Out-Null
            }
        } else {
            Write-MandALog "No AggregatedDataStore.Devices data found to export for Server_Specifications.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_Specifications.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Server_Specifications.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Server_App_Target.csv ---
    # Requires specific discovery of applications hosted on servers and their purpose.
    Write-MandALog "Processing Server_App_Target.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.ServerApplications -and $ProcessedData.AggregatedDataStore.ServerApplications.Count -gt 0) {
            $serverAppData = $ProcessedData.AggregatedDataStore.ServerApplications | ForEach-Object {
                [PSCustomObject]@{
                    ServerName         = $_.ServerName
                    ApplicationName    = $_.ApplicationName
                    ApplicationVersion = $_.ApplicationVersion
                    ApplicationType    = $_.ApplicationType # e.g., Web, Database, Business App
                    Purpose            = $_.Purpose
                    BusinessOwner      = $_.BusinessOwner
                    TechnicalOwner     = $_.TechnicalOwner
                    Dependencies       = if ($_.Dependencies) { ($_.Dependencies -join '; ') } else { "" }
                    PortUsage          = $_.PortUsage
                    DataSensitivity    = $_.DataSensitivity # e.g., High, Medium, Low
                    Notes              = $_.Notes
                }
            }
            $serverAppData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_App_Target.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Server_App_Target.csv with $($serverAppData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.ServerApplications data found. Server_App_Target.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_App_Target.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Server_App_Target.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Server_Data_Source_Target.csv ---
    # Requires discovery of databases, file shares, etc., hosted on servers.
    Write-MandALog "Processing Server_Data_Source_Target.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.ServerDataSources -and $ProcessedData.AggregatedDataStore.ServerDataSources.Count -gt 0) {
            $serverDataSourceData = $ProcessedData.AggregatedDataStore.ServerDataSources | ForEach-Object {
                [PSCustomObject]@{
                    ServerName             = $_.ServerName
                    DataSourceName         = $_.DataSourceName
                    DataSourceType         = $_.DataSourceType # e.g., SQLDB, OracleDB, FileShare, API Endpoint
                    Path_Or_ConnectionString = $_.PathOrConnectionString
                    Database_Share_Size_GB = if ($_.SizeGB) { [math]::Round($_.SizeGB, 2) } else { $null }
                    Purpose                = $_.Purpose
                    BusinessOwner          = $_.BusinessOwner
                    TechnicalOwner         = $_.TechnicalOwner
                    AccessControl          = $_.AccessControl # e.g., AD Groups, SQL Logins
                    BackupFrequency        = $_.BackupFrequency
                    Notes                  = $_.Notes
                }
            }
            $serverDataSourceData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_Data_Source_Target.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Server_Data_Source_Target.csv with $($serverDataSourceData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.ServerDataSources data found. Server_Data_Source_Target.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Server_Data_Source_Target.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Server_Data_Source_Target.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- FW Rules.csv ---
    # Data typically from GPO discovery (Windows Firewall) or network appliance exports.
    Write-MandALog "Processing FW Rules.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.FirewallRules -and $ProcessedData.AggregatedDataStore.FirewallRules.Count -gt 0) {
            $fwRulesData = $ProcessedData.AggregatedDataStore.FirewallRules | ForEach-Object {
                [PSCustomObject]@{
                    RuleName        = $_.RuleName
                    Description     = $_.Description
                    IsEnabled       = $_.IsEnabled
                    Direction       = $_.Direction # Inbound, Outbound
                    Action          = $_.Action    # Allow, Block
                    Protocol        = $_.Protocol  # TCP, UDP, ICMP, Any
                    LocalPorts      = $_.LocalPorts
                    RemotePorts     = $_.RemotePorts
                    LocalAddresses  = $_.LocalAddresses
                    RemoteAddresses = $_.RemoteAddresses
                    ProgramPath     = $_.ProgramPath
                    ServiceName     = $_.ServiceName
                    Profile         = $_.Profile # Domain, Private, Public
                    SourceDevice_Or_GPO = $_.Source # e.g., GPO Name, Firewall Appliance Name
                    Notes           = $_.Notes
                }
            }
            $fwRulesData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - FW Rules.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported FW Rules.csv with $($fwRulesData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.FirewallRules data found. FW Rules.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - FW Rules.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting FW Rules.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- UAT_Group.csv ---
    Write-MandALog "Processing UAT_Group.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Groups -and $ProcessedData.AggregatedDataStore.Groups.Count -gt 0) {
            # Assuming UAT groups are identified by a naming convention, custom attribute, or specific note.
            $uatGroupData = $ProcessedData.AggregatedDataStore.Groups | Where-Object {
                $_.DisplayName -like "UAT_*" -or 
                $_.DisplayName -like "*_UAT" -or 
                $_.Notes -like "*UAT Group*" -or
                ($_.ExtensionAttributes -and ($_.ExtensionAttributes.customAttribute1 -eq "UAT" -or $_.ExtensionAttributes.extensionAttribute1 -eq "UAT")) # Example for custom attribute
            } | ForEach-Object {
                [PSCustomObject]@{
                    GroupName        = $_.DisplayName
                    GroupType        = if ($_.GroupTypes) { ($_.GroupTypes -join '; ') } else { "Unknown" } # M365, Security, Distribution, DynamicMembership
                    Description      = $_.Description
                    MailAddress      = $_.Mail # If mail-enabled
                    MemberCount      = if ($_.Members) { ($_.Members.Count) } elseif ($_.MemberCount) { $_.MemberCount } else { 0 }
                    BusinessOwner    = $_.BusinessOwner # Requires discovery
                    UAT_Coordinator  = $_.UATCoordinator # Requires discovery
                    SourceSystem     = if ($_.Id -like "*-*-*-*-*") {"AzureAD/Graph"} elseif ($_.ObjectGUID) {"ActiveDirectory"} else {"Unknown"}
                    Notes            = $_.Notes
                }
            }
             if ($uatGroupData.Count -gt 0) {
                $uatGroupData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - UAT_Group.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported UAT_Group.csv with $($uatGroupData.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No UAT-specific group data found for UAT_Group.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - UAT_Group.csv") -ItemType File -Force | Out-Null
            }
        } else {
            Write-MandALog "No AggregatedDataStore.Groups data found to export for UAT_Group.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - UAT_Group.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting UAT_Group.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Exchange_Discovery.csv ---
    Write-MandALog "Processing Exchange_Discovery.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.ExchangeMailboxes -and $ProcessedData.AggregatedDataStore.ExchangeMailboxes.Count -gt 0) {
            $exchangeDiscoveryData = $ProcessedData.AggregatedDataStore.ExchangeMailboxes | ForEach-Object {
                [PSCustomObject]@{
                    UserPrincipalName     = $_.UserPrincipalName
                    DisplayName           = $_.DisplayName
                    MailboxType           = $_.RecipientTypeDetails # UserMailbox, SharedMailbox, RoomMailbox, EquipmentMailbox
                    PrimarySmtpAddress    = $_.PrimarySmtpAddress
                    AliasEmailAddresses   = if ($_.EmailAddresses) { ($_.EmailAddresses | Where-Object { $_.PrefixString -ne "SMTP" -and $_.PrefixString -ne "smtp"} | ForEach-Object { $_.ProxyAddressString }) -join '; ' } else { "" }
                    TotalItemSize_GB      = if ($_.TotalItemSize) { [math]::Round($_.TotalItemSize.ToGB(), 2) } else { $null }
                    ItemCount             = $_.ItemCount
                    LastLogonTime         = if ($_.LastLogonTime) { [datetime]$_.LastLogonTime } else { $null }
                    ArchiveStatus         = $_.ArchiveStatus # None, Active, LocallyArchived
                    ArchiveSize_GB        = if ($_.TotalArchiveSize) { [math]::Round($_.TotalArchiveSize.ToGB(), 2) } else { $null } # Assuming TotalArchiveSize
                    LitigationHoldEnabled = $_.LitigationHoldEnabled
                    InPlaceHoldEnabled    = $_.InPlaceHolds -ne $null -and $_.InPlaceHolds.Count -gt 0 # Check if InPlaceHolds property exists and has entries
                    RetentionPolicy       = $_.RetentionPolicy
                    MailboxPlan           = $_.MailboxPlan # Assuming MailboxPlan might be collected
                    ProhibitSendQuota_GB  = if ($_.ProhibitSendQuota) { [math]::Round($_.ProhibitSendQuota.ToGB(), 2) } else { $null }
                    IssueWarningQuota_GB  = if ($_.IssueWarningQuota) { [math]::Round($_.IssueWarningQuota.ToGB(), 2) } else { $null }
                    Notes                 = $_.Notes
                }
            }
            $exchangeDiscoveryData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Exchange_Discovery.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Exchange_Discovery.csv with $($exchangeDiscoveryData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.ExchangeMailboxes data found. Exchange_Discovery.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Exchange_Discovery.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Exchange_Discovery.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- ExchangePermissions.csv --- (Corrected filename from ExchagePermissions.csv)
    Write-MandALog "Processing ExchangePermissions.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.ExchangePermissions -and $ProcessedData.AggregatedDataStore.ExchangePermissions.Count -gt 0) {
            $exchangePermData = $ProcessedData.AggregatedDataStore.ExchangePermissions | ForEach-Object {
                [PSCustomObject]@{
                    MailboxOwnerUPN    = $_.MailboxOwnerUPN
                    UserWithPermission = $_.UserWithPermission # Could be UPN, DisplayName, or Group Name
                    PermissionType     = $_.PermissionType # e.g., FullAccess, SendAs, SendOnBehalf, FolderPermission
                    GrantedRights      = if ($_.GrantedRights) { ($_.GrantedRights -join '; ') } else { "" } # For FolderPermission, e.g., ReadItems, CreateItems
                    FolderName         = $_.FolderName # For FolderPermission
                    Inherited          = $_.IsInherited
                    Deny               = $_.IsDeny # If applicable
                    Notes              = $_.Notes
                }
            }
            $exchangePermData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - ExchangePermissions.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported ExchangePermissions.csv with $($exchangePermData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.ExchangePermissions data found. ExchangePermissions.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - ExchangePermissions.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting ExchangePermissions.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Email_Connected_Mobile_List.csv ---
    Write-MandALog "Processing Email_Connected_Mobile_List.csv" -Level "INFO"
    try {
        # Data could come from Intune-managed devices or Exchange ActiveSync (EAS) device statistics.
        # Assuming $ProcessedData.AggregatedDataStore.MobileDevices exists and has relevant info.
        if ($ProcessedData.AggregatedDataStore.MobileDevices -and $ProcessedData.AggregatedDataStore.MobileDevices.Count -gt 0) {
            $mobileDeviceData = $ProcessedData.AggregatedDataStore.MobileDevices | Where-Object { $_.ClientType -eq 'ExchangeActiveSync' -or $_.ManagementType -like '*EAS*' -or $_.IsEmailClient } | ForEach-Object {
                [PSCustomObject]@{
                    UserUPN         = $_.UserPrincipalName
                    DeviceModel     = $_.DeviceModel
                    DeviceOS        = $_.DeviceOperatingSystem
                    DeviceOSVersion = $_.DeviceOSVersion # Assuming DeviceOSVersion might be collected
                    DeviceID        = $_.DeviceId # EAS Device ID or Intune Device ID
                    IMEI_MEID       = $_.IMEI # If available (privacy considerations)
                    ClientType      = $_.ClientType # e.g., Outlook for iOS/Android, ExchangeActiveSync
                    LastSyncTime    = if ($_.LastSyncAttemptTime) { [datetime]$_.LastSyncAttemptTime } elseif ($_.LastSyncDateTime) { [datetime]$_.LastSyncDateTime } else { $null }
                    AccessState     = $_.DeviceAccessState # Allowed, Blocked, Quarantined
                    PolicyApplied   = $_.EASPolicyApplied # Assuming EASPolicyApplied might be collected
                    Notes           = $_.Notes
                }
            }
            if ($mobileDeviceData.Count -gt 0) {
                $mobileDeviceData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Email_Connected_Mobile_List.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported Email_Connected_Mobile_List.csv with $($mobileDeviceData.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No relevant mobile device data found for Email_Connected_Mobile_List.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Email_Connected_Mobile_List.csv") -ItemType File -Force | Out-Null
            }
        } else {
            Write-MandALog "No AggregatedDataStore.MobileDevices data found. Email_Connected_Mobile_List.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Email_Connected_Mobile_List.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Email_Connected_Mobile_List.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Master_Group_List.csv ---
    Write-MandALog "Processing Master_Group_List.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Groups -and $ProcessedData.AggregatedDataStore.Groups.Count -gt 0) {
            $masterGroupData = $ProcessedData.AggregatedDataStore.Groups | ForEach-Object {
                [PSCustomObject]@{
                    GroupName        = $_.DisplayName
                    SamAccountName   = $_.SamAccountName # From AD
                    GraphId          = $_.Id # From Graph
                    AD_ObjectGUID    = $_.ObjectGUID # From AD
                    Description      = $_.Description
                    GroupType        = if ($_.GroupTypes) { ($_.GroupTypes -join '; ') } else { "Unknown" } # e.g., Unified (M365), Security, Distribution, DynamicMembership
                    MailEnabled      = $_.MailEnabled
                    SecurityEnabled  = $_.SecurityEnabled
                    MailNickname     = $_.MailNickname
                    GroupScope       = $_.GroupScope # From AD (Global, DomainLocal, Universal)
                    IsAssignableToRole= $_.IsAssignableToRole # Azure AD PIM roles
                    Visibility       = $_.Visibility # Public, Private (for M365 groups)
                    OwnerUPN         = if ($_.Owners) { ($_.Owners.UserPrincipalName -join '; ') } else { "" } # Assuming Owners is a collection of user objects
                    ManagedBy        = $_.ManagedBy # From AD
                    MemberCount      = if ($_.Members) { ($_.Members.Count) } elseif ($_.MemberCount) { $_.MemberCount } else { 0 }
                    CreatedDateTime  = if ($_.CreatedDateTime) { [datetime]$_.CreatedDateTime } else { $null }
                    SourceSystem     = if ($_.Id -like "*-*-*-*-*") {"AzureAD/Graph"} elseif ($_.ObjectGUID) {"ActiveDirectory"} else {"Unknown"}
                    Notes            = $_.Notes
                }
            }
            $masterGroupData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Master_Group_List.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Master_Group_List.csv with $($masterGroupData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No AggregatedDataStore.Groups data found. Master_Group_List.csv will be empty." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Master_Group_List.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Master_Group_List.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- Group_Memberships_List.csv ---
    # Denormalized list of UserUPN and GroupName.
    Write-MandALog "Processing Group_Memberships_List.csv" -Level "INFO"
    try {
        $groupMembershipData = [System.Collections.Generic.List[PSObject]]::new()
        if ($ProcessedData.AggregatedDataStore.Groups -and $ProcessedData.AggregatedDataStore.Groups.Count -gt 0) {
            foreach ($group in $ProcessedData.AggregatedDataStore.Groups) {
                if ($group.Members -and $group.Members.Count -gt 0) {
                    foreach ($member in $group.Members) {
                        # Member object structure can vary. It might be a User object, a string ID, or a simpler object.
                        $userPrincipalName = $null
                        $memberType = "Unknown"

                        if ($member -is [string]) { # Assuming member is a User ID
                            $user = $ProcessedData.AggregatedDataStore.Users | Where-Object { $_.Id -eq $member -or $_.AD_ObjectGUID -eq $member } | Select-Object -First 1
                            if ($user) { $userPrincipalName = $user.UserPrincipalName }
                            $memberType = "User" # Assumption
                        } elseif ($member.UserPrincipalName) {
                            $userPrincipalName = $member.UserPrincipalName
                            $memberType = "User"
                        } elseif ($member.DisplayName -and $member.ObjectType -eq 'Group') { # Nested Group
                             $userPrincipalName = "NestedGroup: $($member.DisplayName)" # Indicate nested group
                             $memberType = "Group"
                        } elseif ($member.DisplayName) { # Could be a contact or other object type
                            $userPrincipalName = $member.DisplayName
                            $memberType = $member.ObjectType # If available
                        }


                        if ($userPrincipalName) {
                            $groupMembershipData.Add([PSCustomObject]@{
                                MemberPrincipalName_Or_Identifier = $userPrincipalName
                                MemberType          = $memberType
                                GroupName           = $group.DisplayName
                                GroupGraphId        = $group.Id
                                Group_AD_ObjectGUID = $group.ObjectGUID
                                GroupSourceSystem   = if ($group.Id -like "*-*-*-*-*") {"AzureAD/Graph"} elseif ($group.ObjectGUID) {"ActiveDirectory"} else {"Unknown"}
                            })
                        }
                    }
                }
            }
        }
        if ($groupMembershipData.Count -gt 0) {
            $groupMembershipData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Group_Memberships_List.csv") -NoTypeInformation -Encoding UTF8
            Write-MandALog "Exported Group_Memberships_List.csv with $($groupMembershipData.Count) records." -Level "SUCCESS"
        } else {
            Write-MandALog "No group membership data to export for Group_Memberships_List.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - Group_Memberships_List.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting Group_Memberships_List.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    # --- 3rd Party Vendors.csv ---
    # Primarily from Guest users in Azure AD, or requires manual/external data source.
    Write-MandALog "Processing 3rd Party Vendors.csv" -Level "INFO"
    try {
        if ($ProcessedData.AggregatedDataStore.Users -and $ProcessedData.AggregatedDataStore.Users.Count -gt 0) {
            $vendorData = $ProcessedData.AggregatedDataStore.Users | Where-Object { $_.UserType -eq 'Guest' } | ForEach-Object {
                [PSCustomObject]@{
                    VendorName         = $_.CompanyName # Often the external org's name if available
                    ServiceProvided    = "External Collaboration" # General placeholder
                    ContactPersonName  = $_.DisplayName
                    ContactEmail       = $_.Mail
                    InvitedByUserUPN   = if ($_.InvitedBy) { $_.InvitedBy.UserPrincipalName } else { "" } # Assuming InvitedBy is an object
                    InvitationDate     = if ($_.InvitationCreationDateTime) { [datetime]$_.InvitationCreationDateTime } else { $null } # Assuming InvitationCreationDateTime
                    LastSignInDateTime = if ($_.LastSignInDateTime) { [datetime]$_.LastSignInDateTime } else { $null }
                    Status             = if ($_.AccountEnabled) { "Active" } else { "Inactive" }
                    ContractExpiry     = "" # Manual field, not typically discoverable
                    Notes              = "Azure AD Guest User. Source: $($_.CreationType)" # e.g. Invitation, B2B
                }
            }
            if ($vendorData.Count -gt 0) {
                $vendorData | Export-Csv -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - 3rd Party Vendors.csv") -NoTypeInformation -Encoding UTF8
                Write-MandALog "Exported 3rd Party Vendors.csv (from Guest Users) with $($vendorData.Count) records." -Level "SUCCESS"
            } else {
                Write-MandALog "No Guest User data found for 3rd Party Vendors.csv." -Level "WARN"
                New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - 3rd Party Vendors.csv") -ItemType File -Force | Out-Null
            }
        } else {
            Write-MandALog "No AggregatedDataStore.Users data found to export for 3rd Party Vendors.csv." -Level "WARN"
            New-Item -Path (Join-Path $outputCsvPath "Company_Control_Sheet.xlsx - 3rd Party Vendors.csv") -ItemType File -Force | Out-Null
        }
    } catch {
        Write-MandALog "Error exporting 3rd Party Vendors.csv: $($_.Exception.Message)" -Level "ERROR"
    }

    Write-MandALog "Company Control Sheet CSV export process finished." -Level "SUCCESS"
}

# Export the main function to make it available for import.
Export-ModuleMember -Function Export-ToCompanyControlSheet

Write-Host "CompanyControlSheetExporter.psm1 module loaded. Use Export-ToCompanyControlSheet function."
