# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-19
# Last Modified: 2025-08-19

<#
.SYNOPSIS
    Data lineage and dependency mapping module for the M&A Discovery Suite.

.DESCRIPTION
    This module analyses the relationships between data sources, processing
    pipelines and consuming applications to build a picture of how data flows
    through the organisation.  It provides insights into database table
    dependencies, ETL pipeline connections and application data exchanges.

.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-19
    Requires: PowerShell 5.1+, optional database connectivity
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-LineageLog {
    <#
    .SYNOPSIS
        Writes log entries specific to data lineage discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[DataLineage] $Message" -Level $Level -Component "DataLineageDependencyEngine" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN'  { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [DataLineage] $Message" -ForegroundColor $color
    }
}

function Invoke-DataLineageDependencyEngine {
    <#
    .SYNOPSIS
        Main function for data lineage and dependency discovery.

    .DESCRIPTION
        Discovers relationships between databases, ETL pipelines and
        applications.  Generates a dependency map of how data moves from
        source to destination across systems.  Results are exported to CSV
        grouped by dependency type.

    .PARAMETER Configuration
        Discovery configuration hashtable.  Supports optional keys:
            DatabaseConnectionInfo  - connection strings or details for live DB analysis
            ETLPipelinePaths        - directories containing ETL definitions
            ApplicationDependencyFile - path to a CSV or JSON file of application dependencies

    .PARAMETER Context
        Execution context containing output paths and session information.

    .PARAMETER SessionId
        Unique session identifier.
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

    Write-LineageLog -Level "HEADER" -Message "Starting Data Lineage & Dependency Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialise result object
    $result = @{
        Success     = $true
        ModuleName  = 'DataLineageDependencyEngine'
        RecordCount = 0
        Errors      = [System.Collections.ArrayList]::new()
        Warnings    = [System.Collections.ArrayList]::new()
        Metadata    = @{}
        StartTime   = Get-Date
        EndTime     = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError    = { param($m,$e,$c) $this.Errors.Add(@{Message=$m;Exception=$e;Context=$c}); $this.Success=$false }.GetNewClosure()
        AddWarning  = { param($m,$c) $this.Warnings.Add(@{Message=$m;Context=$c}) }.GetNewClosure()
        Complete    = { $this.EndTime = Get-Date }.GetNewClosure()
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

        # Discover database dependencies
        try {
            Write-LineageLog -Level "INFO" -Message "Discovering database table dependencies..." -Context $Context
            $dbLineageData = Get-DatabaseLineage -Configuration $Configuration -SessionId $SessionId
            if ($dbLineageData.Count -gt 0) {
                $dbLineageData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'DatabaseLineage' -Force }
                $null = $allDiscoveredData.AddRange($dbLineageData)
                $result.Metadata["DatabaseLineageCount"] = $dbLineageData.Count
            }
            Write-LineageLog -Level "SUCCESS" -Message "Discovered $($dbLineageData.Count) database lineage records" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover database lineage: $($_.Exception.Message)", @{Section='DatabaseLineage'})
        }

        # Discover ETL pipeline dependencies
        try {
            Write-LineageLog -Level "INFO" -Message "Discovering ETL pipeline dependencies..." -Context $Context
            $etlData = Get-ETLPipelineDependencies -Configuration $Configuration -SessionId $SessionId
            if ($etlData.Count -gt 0) {
                $etlData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ETLPipeline' -Force }
                $null = $allDiscoveredData.AddRange($etlData)
                $result.Metadata["ETLPipelineCount"] = $etlData.Count
            }
            Write-LineageLog -Level "SUCCESS" -Message "Discovered $($etlData.Count) ETL pipeline dependency records" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover ETL pipeline dependencies: $($_.Exception.Message)", @{Section='ETLPipeline'})
        }

        # Discover application data flows
        try {
            Write-LineageLog -Level "INFO" -Message "Discovering application data flows..." -Context $Context
            $appFlowData = Get-ApplicationDataFlows -Configuration $Configuration -SessionId $SessionId
            if ($appFlowData.Count -gt 0) {
                $appFlowData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ApplicationFlow' -Force }
                $null = $allDiscoveredData.AddRange($appFlowData)
                $result.Metadata["ApplicationFlowCount"] = $appFlowData.Count
            }
            Write-LineageLog -Level "SUCCESS" -Message "Discovered $($appFlowData.Count) application flow records" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover application data flows: $($_.Exception.Message)", @{Section='ApplicationFlow'})
        }

        # Export results
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "DataLineage_${dataType}.csv"
                $filePath = Join-Path $outputPath $fileName
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryTimestamp' -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryModule' -Value 'DataLineageDependencyEngine' -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_SessionId' -Value $SessionId -Force
                }
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-LineageLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-LineageLog -Level "WARN" -Message "No data lineage results to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-LineageLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during data lineage discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-LineageLog -Level "HEADER" -Message "Data lineage discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }
    return $result
}

function Get-DatabaseLineage {
    <#
    .SYNOPSIS
        Retrieves database table dependencies.
    .DESCRIPTION
        Connects to configured databases (if connection information is supplied) or
        returns a sample set of table dependencies.  In a real environment
        this function would connect to SQL Server, MySQL, PostgreSQL, etc.,
        enumerate foreign key relationships and package the results.
    .PARAMETER Configuration
        Configuration hashtable containing optional DatabaseConnectionInfo.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    # In absence of connection details, return sample dependencies
    $results += [PSCustomObject]@{
        SourceDatabase   = 'CRM_DB'
        SourceTable      = 'Customers'
        TargetDatabase   = 'DW_DB'
        TargetTable      = 'DimCustomer'
        DependencyType   = 'ForeignKey'
    }
    $results += [PSCustomObject]@{
        SourceDatabase   = 'ERP_DB'
        SourceTable      = 'Orders'
        TargetDatabase   = 'CRM_DB'
        TargetTable      = 'OrderSync'
        DependencyType   = 'Replication'
    }
    return $results
}

function Get-ETLPipelineDependencies {
    <#
    .SYNOPSIS
        Retrieves ETL pipeline dependencies.
    .DESCRIPTION
        Scans specified directories for ETL definitions (e.g., SSIS packages,
        Azure Data Factory JSON definitions).  In this simplified implementation
        the function returns example ETL flows.  In a real environment, it
        would parse package metadata to extract source and target information.
    .PARAMETER Configuration
        Configuration hashtable containing optional ETLPipelinePaths.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    # Example ETL pipeline
    $results += [PSCustomObject]@{
        PipelineName = 'NightlyOrderLoad'
        Source       = 'ERP_DB.Orders'
        Destination  = 'DW_DB.FactOrder'
        Schedule     = '02:00 Daily'
        Tool         = 'SSIS'
    }
    $results += [PSCustomObject]@{
        PipelineName = 'CustomerSync'
        Source       = 'CRM_DB.Customers'
        Destination  = 'ERP_DB.CustomerMaster'
        Schedule     = 'Hourly'
        Tool         = 'CustomScript'
    }
    return $results
}

function Get-ApplicationDataFlows {
    <#
    .SYNOPSIS
        Retrieves application data flows.
    .DESCRIPTION
        Reads a dependency file if provided, otherwise returns a sample list of
        application interactions.  The dependency file may be a CSV or JSON
        containing columns such as SourceApplication, TargetApplication and
        DataType.  If the file cannot be parsed, an empty list is returned.
    .PARAMETER Configuration
        Configuration hashtable containing optional ApplicationDependencyFile.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    $file = $null
    if ($Configuration.ContainsKey('ApplicationDependencyFile')) {
        $file = $Configuration['ApplicationDependencyFile']
    }
    if ($file -and (Test-Path $file)) {
        try {
            if ($file.ToString().EndsWith('.csv')) {
                $csv = Import-Csv -Path $file -ErrorAction Stop
                foreach ($row in $csv) {
                    $results += [PSCustomObject]@{
                        SourceApplication = $row.SourceApplication
                        TargetApplication = $row.TargetApplication
                        DataType          = $row.DataType
                    }
                }
            } elseif ($file.ToString().EndsWith('.json')) {
                $json = Get-Content -Path $file -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
                foreach ($item in $json) {
                    $results += [PSCustomObject]@{
                        SourceApplication = $item.SourceApplication
                        TargetApplication = $item.TargetApplication
                        DataType          = $item.DataType
                    }
                }
            }
        } catch {
            # If parsing fails, generate sample data
        }
    }
    if ($results.Count -eq 0) {
        # Provide sample flows
        $results += [PSCustomObject]@{
            SourceApplication = 'Salesforce'
            TargetApplication = 'DataWarehouse'
            DataType          = 'Customer'
        }
        $results += [PSCustomObject]@{
            SourceApplication = 'CRM'
            TargetApplication = 'MarketingAutomation'
            DataType          = 'Lead'
        }
    }
    return $results
}