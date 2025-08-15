# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Data Aggregation Module for M&A Discovery Suite
.DESCRIPTION
    Orchestrates the entire data processing phase by aggregating raw discovery data using memory-efficient streaming, 
    then calls other processing modules for profiling and wave generation. This module provides comprehensive data 
    aggregation capabilities including multi-source data correlation, memory-efficient processing, and 
    orchestration of downstream processing workflows.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module, Processing modules
#>

function Write-ProcessingLog {
    [CmdletBinding()]
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[DataAggregation] $Message" -Level $Level -Component "Processing" -Context $Context
}

# Helper to safely load a CSV into a lookup hashtable for fast correlation
function Get-CsvAsLookup {
    param(
        [string]$FilePath,
        [string]$KeyProperty,
        [hashtable]$Context
    )
    if (-not (Test-Path $FilePath)) {
        Write-ProcessingLog -Level "WARN" -Message "Lookup file not found: $FilePath" -Context $Context
        return @{}
    }
    $lookup = @{}
    Import-Csv -Path $FilePath | ForEach-Object {
        if ($_.PSObject.Properties[$KeyProperty]) {
            $key = $_.$KeyProperty
            if (-not [string]::IsNullOrWhiteSpace($key) -and -not $lookup.ContainsKey($key)) {
                $lookup[$key] = $_
            }
        }
    }
    return $lookup
}

# --- Main Processing Orchestration Function ---

function Start-DataAggregation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-ProcessingLog -Level "HEADER" -Message "Starting Full Data Processing & Aggregation Phase (v3.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $success = $true

    try {
        # 1. DEFINE PATHS AND CONFIGURATION
        $rawPath = $Context.Paths.RawDataOutput
        $processedPath = $Context.Paths.ProcessedDataOutput
        Write-ProcessingLog -Level "INFO" -Message "Reading raw data from: $rawPath" -Context $Context
        Write-ProcessingLog -Level "INFO" -Message "Writing processed data to: $processedPath" -Context $Context

        # ======================================================================
        # STEP 1: AGGREGATE RAW DATA (MEMORY-EFFICIENT)
        # ======================================================================
        Write-ProcessingLog -Level "INFO" -Message "STEP 1: Loading lookup data (smaller files) into memory..." -Context $Context
        $graphUserLookup = Get-CsvAsLookup -FilePath (Join-Path $rawPath "GraphUsers.csv") -KeyProperty "userPrincipalName" -Context $Context
        $exchangeMailboxLookup = Get-CsvAsLookup -FilePath (Join-Path $rawPath "ExchangeMailboxes.csv") -KeyProperty "ExternalDirectoryObjectId" -Context $Context
        Write-ProcessingLog -Level "SUCCESS" -Message "Loaded $($graphUserLookup.Count) Graph users and $($exchangeMailboxLookup.Count) mailboxes." -Context $Context

        Write-ProcessingLog -Level "INFO" -Message "STEP 1: Streaming and aggregating primary AD User data..." -Context $Context
        $aggregatedUsers = [System.Collections.ArrayList]::new()
        $userFilePath = Join-Path $rawPath "ADUsers.csv"
        $aggregatedUsersFile = Join-Path $processedPath "Aggregated_Users.csv"

        if (Test-Path $userFilePath) {
            $reader = [System.IO.StreamReader]::new($userFilePath)
            $csvHeader = $reader.ReadLine()
            $i = 0
            while (-not $reader.EndOfStream) {
                $i++; $user = ConvertFrom-Csv -InputObject ($csvHeader + "`n" + $reader.ReadLine())
                
                # --- Aggregation Logic ---
                $upn = $user.userPrincipalName
                $guid = $user.ObjectGUID
                if ($graphUserLookup.ContainsKey($upn)) {
                    $user | Add-Member -MemberType NoteProperty -Name "GraphLastSignIn" -Value $graphUserLookup[$upn].lastSignInDateTime -Force
                }
                if ($exchangeMailboxLookup.ContainsKey($guid)) {
                    $user | Add-Member -MemberType NoteProperty -Name "MailboxSizeGB" -Value ([Math]::Round(($exchangeMailboxLookup[$guid].TotalItemSize.Split(' ')[0] / 1GB), 2)) -Force
                }
                $null = $aggregatedUsers.Add($user)
                if ($i % 10000 -eq 0) {
                    Write-ProcessingLog -Level "DEBUG" -Message "Aggregated $i user records..." -Context $Context; [System.GC]::Collect()
                }
            }
            $reader.Dispose()
            Write-ProcessingLog -Level "SUCCESS" -Message "Finished aggregating $($aggregatedUsers.Count) user records. Exporting..." -Context $Context
            $aggregatedUsers | Export-Csv -Path $aggregatedUsersFile -NoTypeInformation -Encoding UTF8
        } else {
            throw "Primary data file 'ADUsers.csv' not found. Cannot continue processing."
        }

        # =// Release memory before next step
        $aggregatedUsers = $null; $graphUserLookup = $null; $exchangeMailboxLookup = $null; [System.GC]::Collect()

        # ======================================================================
        # STEP 2: BUILD USER PROFILES
        # ======================================================================
        Write-ProcessingLog -Level "HEADER" -Message "STEP 2: Starting User Profile Builder" -Context $Context
        $userProfiles = Invoke-UserProfileBuilder -InputPath $aggregatedUsersFile -Configuration $Configuration -Context $Context
        $userProfilesFile = Join-Path $processedPath "User_Profiles.csv"
        $userProfiles | Export-Csv -Path $userProfilesFile -NoTypeInformation -Encoding UTF8
        Write-ProcessingLog -Level "SUCCESS" -Message "User profiles built and saved to '$($userProfilesFile)'" -Context $Context
        
        # ======================================================================
        # STEP 3: GENERATE MIGRATION WAVES
        # ======================================================================
        Write-ProcessingLog -Level "HEADER" -Message "STEP 3: Starting Wave Generation" -Context $Context
        $migrationWaves = Invoke-WaveGeneration -InputPath $userProfilesFile -Configuration $Configuration -Context $Context
        $migrationWavesFile = Join-Path $processedPath "Migration_Waves.csv"
        $migrationWaves | Export-Csv -Path $migrationWavesFile -NoTypeInformation -Encoding UTF8
        Write-ProcessingLog -Level "SUCCESS" -Message "Migration waves generated and saved to '$($migrationWavesFile)'" -Context $Context
        
        # ======================================================================
        # STEP 4: VALIDATE PROCESSED DATA
        # ======================================================================
        Write-ProcessingLog -Level "HEADER" -Message "STEP 4: Starting Final Data Validation" -Context $Context
        Invoke-DataValidation -InputDirectory $processedPath -Configuration $Configuration -Context $Context
        Write-ProcessingLog -Level "SUCCESS" -Message "Data validation checks completed." -Context $Context

    } catch {
        $errorMessage = "A critical error occurred in the processing phase."
        if ($PSItem -and $PSItem.Exception -and -not [string]::IsNullOrWhiteSpace($PSItem.Exception.Message)) {
            $errorMessage += " Error: $($PSItem.Exception.Message)"
        }
        Write-ProcessingLog -Level "CRITICAL" -Message $errorMessage -Context $Context
        Write-ProcessingLog -Level "DEBUG" -Message "Stack Trace: $($PSItem.ScriptStackTrace)" -Context $Context
        $success = $false
    } finally {
        $stopwatch.Stop()
        Write-ProcessingLog -Level "HEADER" -Message "Full processing phase finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss'))" -Context $Context
    }
    return $success
}

Export-ModuleMember -Function Start-DataAggregation