# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    M&A Discovery Suite - CSV Export Module
.DESCRIPTION
    This module is responsible for exporting processed data (user profiles,
    migration waves, complexity analysis, etc.) to CSV files.
.NOTES
    Version: 1.1.0 (Refactored for orchestrator data contracts)
    Author: Gemini
#>

#[CmdletBinding()]
#param()


#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}

# Main function to export data to CSV files
function Export-ToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData, # Contains UserProfiles, MigrationWaves, ComplexityAnalysis, etc.

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting CSV Export Process..." -Level "INFO"
    $processedOutputPath = Join-Path $Configuration.environment.outputPath "Processed" # Standard location for processed outputs

    # Ensure the output directory exists (FileOperations.psm1 should be loaded)
    if (-not (Test-Path $processedOutputPath)) {
        try {
            Initialize-OutputDirectories -Path $processedOutputPath # Assuming this function can take a specific path
            Write-MandALog "Created directory for CSV exports: $processedOutputPath" -Level "INFO"
        } catch {
            Write-MandALog "Failed to create CSV export directory '$processedOutputPath': $($_.Exception.Message)" -Level "ERROR"
            return # Cannot proceed without output directory
        }
    }

    # Helper to handle data loading if $ProcessedData is null (for "Export Only" mode)
    function Get-DataForExport {
        param(
            [string]$KeyName, # e.g., "UserProfiles"
            [hashtable]$DirectInputData,
            [string]$ExpectedFilePath
        )
        if ($null -ne $DirectInputData -and $DirectInputData.ContainsKey($KeyName) -and $null -ne $DirectInputData[$KeyName]) {
            Write-MandALog "Using $KeyName data passed directly to export function." -Level "DEBUG"
            return $DirectInputData[$KeyName]
        } elseif (Test-Path $ExpectedFilePath) {
            Write-MandALog "Loading $KeyName data from file for export: $ExpectedFilePath" -Level "INFO"
            try {
                return Import-DataFromCSV -FilePath $ExpectedFilePath
            } catch {
                Write-MandALog "Failed to load $KeyName from $ExpectedFilePath. Error: $($_.Exception.Message)" -Level "WARN"
                return @()
            }
        } else {
            Write-MandALog "$KeyName data not passed directly and file not found at $ExpectedFilePath. Cannot export." -Level "WARN"
            return @()
        }
    }

    # Define files to export and the corresponding keys in $ProcessedData or file paths
    $exportItems = @(
        @{ Key = "UserProfiles"; FileName = "UserProfiles.csv" }
        @{ Key = "MigrationWaves"; FileName = "MigrationWaves.csv" }
        @{ Key = "ComplexityAnalysis"; FileName = "ComplexityAnalysis.csv" }
        @{ Key = "ValidationResults"; FileName = "DataQualityIssues.csv"; DataPath = "Issues" } # If ValidationResults.Issues is the list
        # Add more items as needed, e.g., from AggregatedDataStore or RelationshipGraph if direct export is desired
    )

    foreach ($item in $exportItems) {
        $dataToExport = $null
        $expectedFilePath = Join-Path $processedOutputPath $item.FileName
        
        if ($item.ContainsKey("DataPath")) { # e.g. $ProcessedData.ValidationResults.Issues
            $mainData = Get-DataForExport -KeyName $item.Key -DirectInputData $ProcessedData -ExpectedFilePath $expectedFilePath # Path here is for the main object
            if ($mainData -and $mainData.PSObject.Properties[$item.DataPath]) {
                $dataToExport = $mainData.PSObject.Properties[$item.DataPath].Value
            }
        } else {
            $dataToExport = Get-DataForExport -KeyName $item.Key -DirectInputData $ProcessedData -ExpectedFilePath $expectedFilePath
        }

        if ($null -ne $dataToExport -and $dataToExport.Count -gt 0) {
            $filePath = Join-Path $processedOutputPath $item.FileName # Output to Processed folder
            try {
                # Use Export-DataToCSV from FileOperations.psm1 if it exists and is preferred
                # Otherwise, use standard Export-Csv
                if (Get-Command 'Export-DataToCSV' -ErrorAction SilentlyContinue) {
                    Export-DataToCSV -Data $dataToExport -FilePath $filePath
                } else {
                    $dataToExport | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                    Write-MandALog "Exported $($item.Key) to $filePath using Export-Csv." -Level "SUCCESS"
                }
            } catch {
                Write-MandALog "Failed to export $($item.Key) to $filePath. Error: $($_.Exception.Message)" -Level "ERROR"
            }
        } else {
            Write-MandALog "No data available for $($item.Key), skipping CSV export for this item." -Level "INFO"
        }
    }

    Write-MandALog "CSV Export Process completed." -Level "SUCCESS"
    # Typically, export functions don't return large data, their output is files.
    # They might return a summary or status.
    return @{ Status = "Completed"; FilesExported = $exportItems.FileName }
}

Export-ModuleMember -Function Export-ToCSV
