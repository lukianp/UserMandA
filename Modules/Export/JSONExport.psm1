# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    M&A Discovery Suite - JSON Export Module
.DESCRIPTION
    This module is responsible for exporting processed data to JSON files.
    It can also handle PowerApps optimized JSON if configured.
.NOTES
    Version: 1.1.1 (Corrected JSON depth handling)
    Author: Lukian Poleschtschuk
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

# Helper to load data if not passed directly (for "Export Only" mode)
function Get-ProcessedDataForJSONExport {
    param(
        [string]$KeyName, # e.g., "UserProfiles"
        [hashtable]$DirectInputData,
        [string]$ProcessedOutputPath, # e.g., "C:\MandA\Discovery\Output\Processed"
        [string]$DefaultFileName # e.g., "UserProfiles.csv" (source if direct input is null)
    )
    if ($null -ne $DirectInputData -and $DirectInputData.ContainsKey($KeyName) -and $null -ne $DirectInputData[$KeyName]) {
        Write-MandALog "Using $KeyName data passed directly to JSON export." -Level "DEBUG"
        return $DirectInputData[$KeyName]
    } else {
        $expectedFilePath = Join-Path $ProcessedOutputPath $DefaultFileName
        if (Test-Path $expectedFilePath) {
            Write-MandALog "Attempting to load $KeyName data from file for JSON export: $expectedFilePath" -Level "INFO"
            try {
                # Assuming processed files are CSVs that need to be converted to objects for JSON
                return Import-DataFromCSV -FilePath $expectedFilePath 
            } catch {
                Write-MandALog "Failed to load $KeyName from $expectedFilePath for JSON export. Error: $($_.Exception.Message)" -Level "WARN"
                return $null
            }
        } else {
            Write-MandALog "$KeyName data not passed directly and source file not found at $expectedFilePath. Cannot export $KeyName to JSON." -Level "WARN"
            return $null
        }
    }
}

# Main function to export data to JSON files
function Export-ToJSON {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] # Even if $null, it's passed, module should handle loading from file
        [hashtable]$ProcessedData, # Contains UserProfiles, MigrationWaves, ComplexityAnalysis, etc.

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting JSON Export Process..." -Level "INFO"
    $exportOutputPath = Join-Path $Configuration.environment.outputPath "Exports\JSON" # Specific subfolder for JSON exports

    if (-not (Test-Path $exportOutputPath)) {
        try {
            New-Item -Path $exportOutputPath -ItemType Directory -Force | Out-Null
            Write-MandALog "Created directory for JSON exports: $exportOutputPath" -Level "INFO"
        } catch {
            Write-MandALog "Failed to create JSON export directory '$exportOutputPath': $($_.Exception.Message)" -Level "ERROR"
            return
        }
    }

    # Define what to export. Keys should match $ProcessedData or be loadable.
    # DefaultFileName is the source CSV in "Processed" folder if $ProcessedData is sparse.
    $exportItems = @(
        @{ Key = "UserProfiles"; OutputFileName = "UserProfiles.json"; SourceCsv = "UserProfiles.csv" }
        @{ Key = "MigrationWaves"; OutputFileName = "MigrationWaves.json"; SourceCsv = "MigrationWaves.csv" }
        @{ Key = "ComplexityAnalysis"; OutputFileName = "ComplexityAnalysis.json"; SourceCsv = "ComplexityAnalysis.csv" }
        @{ Key = "ValidationResults"; OutputFileName = "DataQualityIssues.json"; SourceCsv = "DataQualityIssues.csv" } # Assuming issues are in a CSV
        @{ Key = "AggregatedDataStore"; OutputFileName = "AggregatedDataStore_Full.json"; SourceCsv = "N/A" } # Example: Exporting a complex object directly
        @{ Key = "RelationshipGraph"; OutputFileName = "RelationshipGraph.json"; SourceCsv = "N/A" } # Example
    )

    $processedDataPath = Join-Path $Configuration.environment.outputPath "Processed"

    # Determine JSON export depth from configuration or use default
    $jsonExportDepth = 5 # Default depth
    if ($Configuration.export -and $Configuration.export.ContainsKey('jsonExportDepth') -and $null -ne $Configuration.export.jsonExportDepth) {
        try {
            $jsonExportDepth = [int]$Configuration.export.jsonExportDepth
        } catch {
            Write-MandALog "Invalid value for jsonExportDepth in configuration: '$($Configuration.export.jsonExportDepth)'. Using default depth of 5." -Level "WARN"
        }
    }


    foreach ($item in $exportItems) {
        $dataToExport = $null
        if ($item.SourceCsv -ne "N/A") {
            $dataToExport = Get-ProcessedDataForJSONExport -KeyName $item.Key -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultFileName $item.SourceCsv
        } elseif ($ProcessedData -and $ProcessedData.ContainsKey($item.Key)) {
            # For complex objects not necessarily from a single CSV
            $dataToExport = $ProcessedData[$item.Key]
            Write-MandALog "Using $($item.Key) directly from ProcessedData for JSON export." -Level "DEBUG"
        }


        if ($null -ne $dataToExport) {
            # For lists/arrays, check .Count. For single hashtables/objects, just proceed.
            $canExport = $false
            if ($dataToExport -is [System.Collections.IList]) {
                if ($dataToExport.Count -gt 0) { $canExport = $true }
            } else { # Assume it's a single object/hashtable worth exporting
                $canExport = $true
            }

            if ($canExport) {
                $filePath = Join-Path $exportOutputPath $item.OutputFileName
                try {
                    $dataToExport | ConvertTo-Json -Depth $jsonExportDepth | Set-Content -Path $filePath -Encoding UTF8
                    Write-MandALog "Exported $($item.Key) to $filePath" -Level "SUCCESS"
                } catch {
                    Write-MandALog "Failed to export $($item.Key) to $filePath. Error: $($_.Exception.Message)" -Level "ERROR"
                }
            } else {
                Write-MandALog "No data available for $($item.Key) after attempting to load/retrieve. Skipping JSON export for this item." -Level "INFO"
            }
        } else {
             Write-MandALog "Data for $($item.Key) is null. Skipping JSON export for this item." -Level "INFO"
        }
    }

    # Handle PowerApps Optimized JSON if configured (can be a separate file or modify general JSON)
    # This example assumes it's a distinct export based on UserProfiles
    if ($Configuration.export.powerAppsOptimized) {
        Write-MandALog "Generating PowerApps optimized JSON..." -Level "INFO"
        $userProfilesForPowerApps = Get-ProcessedDataForJSONExport -KeyName "UserProfiles" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultFileName "UserProfiles.csv"
        
        if ($null -ne $userProfilesForPowerApps -and $userProfilesForPowerApps.Count -gt 0) {
            # Placeholder: Logic to transform $userProfilesForPowerApps for PowerApps
            # e.g., flatten complex objects, select specific fields, ensure date formats are ISO 8601
            $powerAppsData = $userProfilesForPowerApps | Select-Object UserPrincipalName, DisplayName, Department, MigrationCategory, ComplexityScore # Example subset
            
            $filePath = Join-Path $exportOutputPath "PowerApps_UserProfiles.json"
            try {
                # PowerApps often benefits from a shallower depth or specific structuring
                $powerAppsJsonDepth = 3 
                if ($Configuration.export.ContainsKey('powerAppsJsonDepth') -and $null -ne $Configuration.export.powerAppsJsonDepth) {
                    try { $powerAppsJsonDepth = [int]$Configuration.export.powerAppsJsonDepth } catch {}
                }
                $powerAppsData | ConvertTo-Json -Depth $powerAppsJsonDepth | Set-Content -Path $filePath -Encoding UTF8
                Write-MandALog "Exported PowerApps optimized UserProfiles to $filePath" -Level "SUCCESS"
            } catch {
                Write-MandALog "Failed to export PowerApps optimized UserProfiles to $filePath. Error: $($_.Exception.Message)" -Level "ERROR"
            }
        } else {
            Write-MandALog "No UserProfiles data available for PowerApps optimized JSON export." -Level "INFO"
        }
    }

    Write-MandALog "JSON Export Process completed." -Level "SUCCESS"
    return @{ Status = "Completed"; Path = $exportOutputPath }
}

Export-ModuleMember -Function Export-ToJSON
