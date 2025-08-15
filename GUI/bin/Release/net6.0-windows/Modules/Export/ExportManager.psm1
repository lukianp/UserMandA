# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Export Manager Module for M&A Discovery Suite
.DESCRIPTION
    This module provides a unified interface for exporting processed data to multiple formats
    including CSV, JSON, XML, and other formats. It coordinates between different export
    modules and provides consistent configuration and error handling.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, CSVExport.psm1, JSONExport.psm1
#>

# Import required export modules
$exportModulesPath = $PSScriptRoot
Import-Module (Join-Path $exportModulesPath "CSVExport.psm1") -Force -ErrorAction SilentlyContinue
Import-Module (Join-Path $exportModulesPath "JSONExport.psm1") -Force -ErrorAction SilentlyContinue

function Export-ProcessedData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [hashtable]$ProcessedData,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        $Context = $null,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('CSV', 'JSON', 'Both', 'All')]
        [string[]]$ExportFormats = @('CSV', 'JSON'),
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Minimal', 'Standard', 'Detailed', 'Complete')]
        [string]$ExportLevel = 'Standard',
        
        [Parameter(Mandatory=$false)]
        [switch]$IndentedJSON,
        
        [Parameter(Mandatory=$false)]
        [int]$JSONMaxDepth = 10
    )
    
    # Define local logging wrapper
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "ExportManager" -Context $Context
        } else {
            Write-Host "[$LevelParam][ExportManager] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }

    & $LogInfo "Starting unified export process..."
    & $LogInfo "Export formats: $($ExportFormats -join ', ')"
    & $LogInfo "Export level: $ExportLevel"
    
    $exportResults = @{
        CSV = $null
        JSON = $null
        Overall = @{
            Success = $true
            TotalFilesExported = 0
            TotalRecordsExported = 0
            TotalErrors = 0
            StartTime = Get-Date
            EndTime = $null
        }
    }
    
    try {
        # Handle 'Both' and 'All' shortcuts
        if ($ExportFormats -contains 'Both' -or $ExportFormats -contains 'All') {
            $ExportFormats = @('CSV', 'JSON')
        }
        
        # Export to CSV if requested
        if ($ExportFormats -contains 'CSV') {
            & $LogInfo "Exporting to CSV format..."
            try {
                $csvResult = Export-ToCSV -ProcessedData $ProcessedData -Configuration $Configuration -Context $Context
                $exportResults.CSV = $csvResult
                
                if ($csvResult) {
                    $exportResults.Overall.TotalFilesExported += $csvResult.FilesExported
                    $exportResults.Overall.TotalRecordsExported += $csvResult.RecordsExported
                    $exportResults.Overall.TotalErrors += $csvResult.Errors
                    & $LogInfo "CSV export completed: $($csvResult.FilesExported) files, $($csvResult.RecordsExported) records" "SUCCESS"
                } else {
                    & $LogInfo "CSV export failed or returned no result" "ERROR"
                    $exportResults.Overall.Success = $false
                    $exportResults.Overall.TotalErrors++
                }
            } catch {
                & $LogInfo "CSV export failed with exception: $($_.Exception.Message)" "ERROR"
                $exportResults.Overall.Success = $false
                $exportResults.Overall.TotalErrors++
                $exportResults.CSV = @{ Status = "Failed"; Error = $_.Exception.Message }
            }
        }
        
        # Export to JSON if requested
        if ($ExportFormats -contains 'JSON') {
            & $LogInfo "Exporting to JSON format..."
            try {
                $jsonParams = @{
                    ProcessedData = $ProcessedData
                    Configuration = $Configuration
                    Context = $Context
                    ExportLevel = $ExportLevel
                    MaxDepth = $JSONMaxDepth
                }
                
                if ($IndentedJSON) {
                    $jsonParams.IndentedOutput = $true
                }
                
                $jsonResult = Export-ToJSON @jsonParams
                $exportResults.JSON = $jsonResult
                
                if ($jsonResult) {
                    $exportResults.Overall.TotalFilesExported += $jsonResult.FilesExported
                    $exportResults.Overall.TotalRecordsExported += $jsonResult.RecordsExported
                    $exportResults.Overall.TotalErrors += $jsonResult.Errors
                    & $LogInfo "JSON export completed: $($jsonResult.FilesExported) files, $($jsonResult.RecordsExported) records" "SUCCESS"
                } else {
                    & $LogInfo "JSON export failed or returned no result" "ERROR"
                    $exportResults.Overall.Success = $false
                    $exportResults.Overall.TotalErrors++
                }
            } catch {
                & $LogInfo "JSON export failed with exception: $($_.Exception.Message)" "ERROR"
                $exportResults.Overall.Success = $false
                $exportResults.Overall.TotalErrors++
                $exportResults.JSON = @{ Status = "Failed"; Error = $_.Exception.Message }
            }
        }
        
        $exportResults.Overall.EndTime = Get-Date
        $exportResults.Overall.Duration = $exportResults.Overall.EndTime - $exportResults.Overall.StartTime
        
        # Log final summary
        if ($exportResults.Overall.Success -and $exportResults.Overall.TotalErrors -eq 0) {
            & $LogInfo "All exports completed successfully!" "SUCCESS"
            & $LogInfo "Total: $($exportResults.Overall.TotalFilesExported) files, $($exportResults.Overall.TotalRecordsExported) records in $($exportResults.Overall.Duration.ToString('hh\:mm\:ss'))" "SUCCESS"
        } else {
            & $LogInfo "Export process completed with $($exportResults.Overall.TotalErrors) errors" "WARN"
        }
        
    } catch {
        & $LogInfo "Critical error in export manager: $($_.Exception.Message)" "ERROR"
        $exportResults.Overall.Success = $false
        $exportResults.Overall.TotalErrors++
        $exportResults.Overall.EndTime = Get-Date
    }
    
    return $exportResults
}

function Convert-BetweenFormats {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$SourcePath,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('CSV', 'JSON')]
        [string]$SourceFormat,
        
        [Parameter(Mandatory=$true)]
        [string]$DestinationPath,
        
        [Parameter(Mandatory=$true)]
        [ValidateSet('CSV', 'JSON')]
        [string]$DestinationFormat,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Minimal', 'Standard', 'Detailed', 'Complete')]
        [string]$ExportLevel = 'Standard',
        
        [Parameter(Mandatory=$false)]
        [switch]$IndentedJSON,
        
        [Parameter(Mandatory=$false)]
        [int]$JSONMaxDepth = 10,
        
        [Parameter(Mandatory=$false)]
        $Context = $null
    )
    
    # Define local logging wrapper
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "ExportManager" -Context $Context
        } else {
            Write-Host "[$LevelParam][ExportManager] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }
    
    if ($SourceFormat -eq $DestinationFormat) {
        & $LogInfo "Source and destination formats are the same. No conversion needed." "WARN"
        return $false
    }
    
    & $LogInfo "Converting from $SourceFormat to $DestinationFormat: $SourcePath -> $DestinationPath"
    
    try {
        if ($SourceFormat -eq 'CSV' -and $DestinationFormat -eq 'JSON') {
            # CSV to JSON conversion
            $params = @{
                CSVPath = $SourcePath
                JSONPath = $DestinationPath
                ExportLevel = $ExportLevel
                MaxDepth = $JSONMaxDepth
                Context = $Context
            }
            
            if ($IndentedJSON) {
                $params.IndentedOutput = $true
            }
            
            return Convert-CSVToJSON @params
            
        } elseif ($SourceFormat -eq 'JSON' -and $DestinationFormat -eq 'CSV') {
            # JSON to CSV conversion
            if (-not (Test-Path $SourcePath)) {
                & $LogInfo "Source JSON file not found: $SourcePath" "ERROR"
                return $false
            }
            
            $jsonData = Get-Content -Path $SourcePath -Encoding UTF8 | ConvertFrom-Json
            
            # Extract data array from structured JSON
            $dataToExport = $null
            if ($jsonData.PSObject.Properties['Data']) {
                $dataToExport = $jsonData.Data
            } elseif ($jsonData.PSObject.Properties['Users']) {
                $dataToExport = $jsonData.Users
            } elseif ($jsonData.PSObject.Properties['Devices']) {
                $dataToExport = $jsonData.Devices
            } else {
                $dataToExport = $jsonData
            }
            
            if (-not $dataToExport -or @($dataToExport).Count -eq 0) {
                & $LogInfo "No data found in JSON file or unsupported structure: $SourcePath" "ERROR"
                return $false
            }
            
            # Ensure output directory exists
            $outputDir = [System.IO.Path]::GetDirectoryName($DestinationPath)
            if (-not (Test-Path $outputDir)) {
                New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
            }
            
            # Export to CSV
            @($dataToExport) | Export-Csv -Path $DestinationPath -NoTypeInformation -Encoding UTF8 -Force
            
            & $LogInfo "Successfully converted JSON to CSV ($(@($dataToExport).Count) records)" "SUCCESS"
            return $true
            
        } else {
            & $LogInfo "Unsupported conversion: $SourceFormat to $DestinationFormat" "ERROR"
            return $false
        }
        
    } catch {
        & $LogInfo "Format conversion failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Get-ExportStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        $Context = $null,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('CSV', 'JSON', 'Both', 'All')]
        [string[]]$CheckFormats = @('CSV', 'JSON')
    )
    
    # Define local logging wrapper
    $LogInfo = {
        param($MessageParam, $LevelParam="INFO")
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message $MessageParam -Level $LevelParam -Component "ExportManager" -Context $Context
        } else {
            Write-Host "[$LevelParam][ExportManager] $MessageParam" -ForegroundColor $(
                switch ($LevelParam) {
                    "ERROR" { "Red" }
                    "WARN" { "Yellow" }
                    "SUCCESS" { "Green" }
                    "DEBUG" { "Gray" }
                    default { "White" }
                }
            )
        }
    }
    
    # Determine output path
    $processedOutputPath = $null
    if ($Context -and $Context.Paths -and $Context.Paths.ProcessedDataOutput) {
        $processedOutputPath = $Context.Paths.ProcessedDataOutput
    } elseif ($Configuration.environment -and $Configuration.environment.outputPath) {
        $processedOutputPath = Join-Path $Configuration.environment.outputPath "Processed"
    } elseif ($Configuration.paths -and $Configuration.paths.processedDataOutput) {
        $processedOutputPath = $Configuration.paths.processedDataOutput
    } else {
        & $LogInfo "Cannot determine processed data output path from configuration" "ERROR"
        return $null
    }
    
    $status = @{
        ProcessedDataPath = $processedOutputPath
        CSV = @{
            Available = $false
            Path = $processedOutputPath
            Files = @()
            TotalFiles = 0
            TotalSize = 0
        }
        JSON = @{
            Available = $false
            Path = Join-Path $processedOutputPath "JSON"
            Files = @()
            TotalFiles = 0
            TotalSize = 0
        }
        Summary = @{
            HasCSV = $false
            HasJSON = $false
            LastExportDate = $null
        }
    }
    
    try {
        # Handle 'Both' and 'All' shortcuts
        if ($CheckFormats -contains 'Both' -or $CheckFormats -contains 'All') {
            $CheckFormats = @('CSV', 'JSON')
        }
        
        # Check CSV files
        if ($CheckFormats -contains 'CSV' -and (Test-Path $processedOutputPath)) {
            $csvFiles = Get-ChildItem -Path $processedOutputPath -Filter "*.csv" -ErrorAction SilentlyContinue
            if ($csvFiles) {
                $status.CSV.Available = $true
                $status.CSV.Files = $csvFiles | ForEach-Object {
                    @{
                        Name = $_.Name
                        Path = $_.FullName
                        Size = $_.Length
                        LastModified = $_.LastWriteTime
                        Records = $null  # Could be populated by counting CSV rows if needed
                    }
                }
                $status.CSV.TotalFiles = $csvFiles.Count
                $status.CSV.TotalSize = ($csvFiles | Measure-Object -Property Length -Sum).Sum
                $status.Summary.HasCSV = $true
                
                # Get most recent CSV file date
                $latestCSV = ($csvFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
                if (-not $status.Summary.LastExportDate -or $latestCSV -gt $status.Summary.LastExportDate) {
                    $status.Summary.LastExportDate = $latestCSV
                }
            }
        }
        
        # Check JSON files
        if ($CheckFormats -contains 'JSON' -and (Test-Path $status.JSON.Path)) {
            $jsonFiles = Get-ChildItem -Path $status.JSON.Path -Filter "*.json" -ErrorAction SilentlyContinue
            if ($jsonFiles) {
                $status.JSON.Available = $true
                $status.JSON.Files = $jsonFiles | ForEach-Object {
                    @{
                        Name = $_.Name
                        Path = $_.FullName
                        Size = $_.Length
                        LastModified = $_.LastWriteTime
                        Records = $null  # Could be populated by parsing JSON if needed
                    }
                }
                $status.JSON.TotalFiles = $jsonFiles.Count
                $status.JSON.TotalSize = ($jsonFiles | Measure-Object -Property Length -Sum).Sum
                $status.Summary.HasJSON = $true
                
                # Get most recent JSON file date
                $latestJSON = ($jsonFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
                if (-not $status.Summary.LastExportDate -or $latestJSON -gt $status.Summary.LastExportDate) {
                    $status.Summary.LastExportDate = $latestJSON
                }
            }
        }
        
        & $LogInfo "Export status check completed" "SUCCESS"
        & $LogInfo "CSV: $($status.CSV.TotalFiles) files ($([math]::Round($status.CSV.TotalSize/1MB, 2)) MB)" "INFO"
        & $LogInfo "JSON: $($status.JSON.TotalFiles) files ($([math]::Round($status.JSON.TotalSize/1MB, 2)) MB)" "INFO"
        
    } catch {
        & $LogInfo "Failed to check export status: $($_.Exception.Message)" "ERROR"
    }
    
    return $status
}

Export-ModuleMember -Function Export-ProcessedData, Convert-BetweenFormats, Get-ExportStatus