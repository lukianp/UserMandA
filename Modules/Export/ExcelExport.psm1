# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Module ImportExcel # Add this if you use the ImportExcel module

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

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
    M&A Discovery Suite - Excel Export Module
.DESCRIPTION
    This module is responsible for exporting processed data to Excel files.
    It requires the ImportExcel module to be installed.
.NOTES
    Version: 1.0.0 (Skeletal structure)
    Author: Gemini
#>




# NOTE: Global environment check has been moved to function scope to avoid module loading issues.
# Functions will check for the global context when they are called, rather than at module import time.
        $outputPath = (Get-ModuleContext).Paths.RawDataOutput

        if (-not (Test-Path (Get-ModuleContext).Paths.RawDataOutput)) {
    New-Item -Path (Get-ModuleContext).Paths.RawDataOutput -ItemType Directory -Force
}



# Helper to load data if not passed directly (for "Export Only" mode)
function Get-ProcessedDataForExcelExport {
    param(
        [string]$KeyName, 
        [hashtable]$DirectInputData,
        [string]$ProcessedOutputPath,
        [string]$DefaultSourceCsvFileName 
    )
    if ($null -ne $DirectInputData -and $DirectInputData.ContainsKey($KeyName) -and $null -ne $DirectInputData[$KeyName]) {
        Write-MandALog "Using $KeyName data passed directly to Excel export." -Level "DEBUG"
        return $DirectInputData[$KeyName]
    } else {
        $expectedFilePath = Join-Path $ProcessedOutputPath $DefaultSourceCsvFileName
        if (Test-Path $expectedFilePath) {
            Write-MandALog "Attempting to load $KeyName data from file for Excel export: $expectedFilePath" -Level "INFO"
            try {
                return Import-DataFromCSV -FilePath $expectedFilePath # Assumes source for Excel is a processed CSV
            } catch {
                Write-MandALog "Failed to load $KeyName from $expectedFilePath for Excel export. Error: $($_.Exception.Message)" -Level "WARN"
                return $null
            }
        } else {
            Write-MandALog "$KeyName data not passed directly and source file not found at $expectedFilePath. Cannot export $KeyName to Excel." -Level "WARN"
            return $null
        }
    }
}

# Main function to export data to Excel
function Export-ToExcel {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Excel Export Process..." -Level "INFO"

    if (-not (Get-Module -Name ImportExcel -ListAvailable)) {
        Write-MandALog "ImportExcel module is not available. Skipping Excel export." -Level "WARN"
        return $null
    }

    $exportOutputPath = Join-Path $Configuration.environment.outputPath "Exports\Excel"
    if (-not (Test-Path $exportOutputPath)) {
        try { New-Item -Path $exportOutputPath -ItemType Directory -Force | Out-Null }
        catch { Write-MandALog "Failed to create Excel export directory '$exportOutputPath': $($_.Exception.Message)" -Level "ERROR"; return }
    }

    $excelFilePath = Join-Path $exportOutputPath "MandA_Discovery_Report_$(Get-Date -Format 'yyyyMMddHHmmss').xlsx"
    $processedDataPath = Join-Path $Configuration.environment.outputPath "Processed"

    try {
        $exportParams = @{ Path = $excelFilePath; Show = $false }

        # Example: Export UserProfiles to a sheet
        $userProfiles = Get-ProcessedDataForExcelExport -KeyName "UserProfiles" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultSourceCsvFileName "UserProfiles.csv"
        if ($null -ne $userProfiles -and $userProfiles.Count -gt 0) {
            $userProfiles | Export-Excel @exportParams -WorksheetName "UserProfiles" -AutoSize -AutoFilter -FreezeTopRow
            Write-MandALog "Exported UserProfiles to Excel sheet." -Level "DEBUG"
        } else {
            Write-MandALog "No UserProfile data to export to Excel." -Level "INFO"
        }

        # Example: Export MigrationWaves to another sheet
        $migrationWaves = Get-ProcessedDataForExcelExport -KeyName "MigrationWaves" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultSourceCsvFileName "MigrationWaves.csv"
        if ($null -ne $migrationWaves -and $migrationWaves.Count -gt 0) {
            # Select specific properties for cleaner Excel output if $migrationWaves objects are complex
            $migrationWavesForExcel = $migrationWaves | Select-Object WaveName, WaveID, TotalUsers, UserPrincipalNames, Criteria, AverageComplexity 
            $migrationWavesForExcel | Export-Excel @exportParams -WorksheetName "MigrationWaves" -AutoSize -AutoFilter -FreezeTopRow -Append
            Write-MandALog "Exported MigrationWaves to Excel sheet." -Level "DEBUG"
        } else {
            Write-MandALog "No MigrationWave data to export to Excel." -Level "INFO"
        }
        
        # Add more sheets as needed for ComplexityAnalysis, DataQualityIssues etc.
        # $complexityAnalysis = Get-ProcessedDataForExcelExport -KeyName "ComplexityAnalysis" ...
        # $complexityAnalysis | Export-Excel @exportParams -WorksheetName "ComplexityAnalysis" -AutoSize -AutoFilter -FreezeTopRow -Append
        
        # $validationIssues = Get-ProcessedDataForExcelExport -KeyName "ValidationResults" ...
        # if($validationIssues -and $validationIssues.Issues) {
        #    $validationIssues.Issues | Export-Excel @exportParams -WorksheetName "DataQualityIssues" -AutoSize -AutoFilter -FreezeTopRow -Append
        # }


        Write-MandALog "Excel Export Process completed. File: $excelFilePath" -Level "SUCCESS"
        return @{ Status = "Completed"; Path = $excelFilePath }
    } catch {
        Write-MandALog "Excel export failed: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

Export-ModuleMember -Function Export-ToExcel

