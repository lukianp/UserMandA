# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    CSV merge utility module for M&A Discovery Suite
.DESCRIPTION
    Provides functionality to merge large CSV datasets, handle deduplication,
    perform column mapping, and optimize memory usage for processing large
    discovery datasets during M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, adequate system memory for large datasets
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-CSVMergeLog {
    <#
    .SYNOPSIS
        Writes log entries specific to CSV merge operations.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[CSVMerge] $Message" -Level $Level -Component "CSVMergeUtility" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [CSVMerge] $Message" -ForegroundColor $color
    }
}

function Invoke-CSVMerge {
    <#
    .SYNOPSIS
        Main CSV merge function that processes and combines multiple CSV files.
    
    .DESCRIPTION
        Merges multiple CSV files with deduplication, column mapping, and
        memory-optimized processing for large datasets.
    
    .PARAMETER InputPath
        Path containing CSV files to merge.
    
    .PARAMETER OutputPath
        Path where merged files will be written.
    
    .PARAMETER Configuration
        Merge configuration including patterns, rules, and options.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$InputPath,

        [Parameter(Mandatory=$true)]
        [string]$OutputPath,

        [hashtable]$Configuration = @{},

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-CSVMergeLog -Level "HEADER" -Message "Starting CSV Merge Operation (v1.0)"
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'CSVMergeUtility'
        FilesProcessed = 0
        RecordsProcessed = 0
        RecordsOutput = 0
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
        # Validate paths
        if (-not (Test-Path $InputPath)) {
            $result.AddError("Input path does not exist: $InputPath", $null, $null)
            return $result
        }
        
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }

        # Get CSV files to process
        $csvFiles = Get-ChildItem -Path $InputPath -Filter "*.csv" -Recurse | 
            Where-Object { $_.Length -gt 0 } | 
            Sort-Object Name
            
        if ($csvFiles.Count -eq 0) {
            $result.AddWarning("No CSV files found in input path", @{Path=$InputPath})
            return $result
        }
        
        Write-CSVMergeLog -Level "INFO" -Message "Found $($csvFiles.Count) CSV files to process"
        
        # Group files by pattern for merging
        $fileGroups = Group-CSVFilesByType -Files $csvFiles -Configuration $Configuration
        
        foreach ($group in $fileGroups) {
            try {
                Write-CSVMergeLog -Level "INFO" -Message "Processing file group: $($group.GroupName) ($($group.Files.Count) files)"
                
                $mergeResult = Merge-CSVFileGroup -FileGroup $group -OutputPath $OutputPath -Configuration $Configuration -SessionId $SessionId
                
                $result.FilesProcessed += $group.Files.Count
                $result.RecordsProcessed += $mergeResult.RecordsProcessed
                $result.RecordsOutput += $mergeResult.RecordsOutput
                $result.Metadata[$group.GroupName] = $mergeResult.Metadata
                
                Write-CSVMergeLog -Level "SUCCESS" -Message "Merged $($group.GroupName): $($mergeResult.RecordsProcessed) → $($mergeResult.RecordsOutput) records"
                
            } catch {
                $result.AddError("Failed to merge file group $($group.GroupName): $($_.Exception.Message)", $_.Exception, $group)
            }
        }
        
        # Generate merge summary
        $summary = Generate-MergeSummary -Result $result -SessionId $SessionId
        $summaryPath = Join-Path $OutputPath "MergeSummary_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        $summary | Export-Csv -Path $summaryPath -NoTypeInformation -Force
        
        Write-CSVMergeLog -Level "SUCCESS" -Message "Merge summary written to: $summaryPath"

    } catch {
        Write-CSVMergeLog -Level "ERROR" -Message "Critical error during CSV merge: $($_.Exception.Message)"
        $result.AddError("A critical error occurred during CSV merge: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-CSVMergeLog -Level "HEADER" -Message "CSV merge completed in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Files: $($result.FilesProcessed), Records: $($result.RecordsProcessed) → $($result.RecordsOutput)."
    }

    return $result
}

function Group-CSVFilesByType {
    <#
    .SYNOPSIS
        Groups CSV files by discovery type for efficient merging.
    #>
    [CmdletBinding()]
    param(
        [System.IO.FileInfo[]]$Files,
        [hashtable]$Configuration
    )
    
    $groups = @{}
    
    foreach ($file in $Files) {
        $groupName = Get-FileGroupName -FileName $file.Name -Configuration $Configuration
        
        if (-not $groups.ContainsKey($groupName)) {
            $groups[$groupName] = @{
                GroupName = $groupName
                Files = @()
                TotalSize = 0
            }
        }
        
        $groups[$groupName].Files += $file
        $groups[$groupName].TotalSize += $file.Length
    }
    
    return $groups.Values | Sort-Object GroupName
}

function Get-FileGroupName {
    <#
    .SYNOPSIS
        Determines group name for CSV file based on naming patterns.
    #>
    [CmdletBinding()]
    param(
        [string]$FileName,
        [hashtable]$Configuration
    )
    
    # Custom grouping patterns from configuration
    if ($Configuration.groupingPatterns) {
        foreach ($pattern in $Configuration.groupingPatterns.Keys) {
            if ($FileName -match $pattern) {
                return $Configuration.groupingPatterns[$pattern]
            }
        }
    }
    
    # Default grouping patterns
    $patterns = @{
        '^ActiveDirectory_' = 'ActiveDirectory'
        '^Computer_' = 'Computers'
        '^Application_' = 'Applications'
        '^Network_' = 'Network'
        '^Storage_' = 'Storage'
        '^Database_' = 'Databases'
        '^Security_' = 'Security'
        '^Printer_' = 'Printers'
        '^WebServer_' = 'WebServers'
        '^Certificate_' = 'Certificates'
        '^Dependency_' = 'Dependencies'
        '^ScheduledTask_' = 'ScheduledTasks'
        '^DataClassification_' = 'DataClassification'
        '^Virtualization_' = 'Virtualization'
        '^PhysicalServer_' = 'PhysicalServers'
        '^CMDB_' = 'CMDB'
    }
    
    foreach ($pattern in $patterns.Keys) {
        if ($FileName -match $pattern) {
            return $patterns[$pattern]
        }
    }
    
    # Default to file name without extension and timestamp
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($FileName)
    $cleanName = $baseName -replace '_\d{8}_\d{6}$', '' -replace '_\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$', ''
    return $cleanName
}

function Merge-CSVFileGroup {
    <#
    .SYNOPSIS
        Merges a group of related CSV files with deduplication and optimization.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$FileGroup,
        [string]$OutputPath,
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $result = @{
        RecordsProcessed = 0
        RecordsOutput = 0
        Metadata = @{
            FilesInGroup = $FileGroup.Files.Count
            TotalSizeBytes = $FileGroup.TotalSize
            DeduplicationEnabled = $Configuration.enableDeduplication -eq $true
            ColumnMappingEnabled = $Configuration.enableColumnMapping -eq $true
        }
    }
    
    try {
        $outputFileName = "$($FileGroup.GroupName)_Merged_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
        $outputFilePath = Join-Path $OutputPath $outputFileName
        
        # Initialize deduplication tracking if enabled
        $seenRecords = @{}
        $duplicateCount = 0
        
        # Initialize column mapping
        $columnMap = Get-ColumnMapping -GroupName $FileGroup.GroupName -Configuration $Configuration
        $standardizedColumns = @()
        
        # Process files in order (usually by timestamp)
        $sortedFiles = $FileGroup.Files | Sort-Object LastWriteTime
        $isFirstFile = $true
        $outputStream = $null
        
        try {
            foreach ($file in $sortedFiles) {
                Write-CSVMergeLog -Level "INFO" -Message "Processing file: $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB)"
                
                # Use streaming approach for large files
                if ($file.Length -gt 50MB) {
                    $records = Read-CSVInBatches -FilePath $file.FullName -BatchSize 10000
                    $batchCount = 0
                    
                    foreach ($batch in $records) {
                        $batchCount++
                        Write-CSVMergeLog -Level "DEBUG" -Message "Processing batch $batchCount for $($file.Name)"
                        
                        $processedBatch = Process-RecordBatch -Records $batch -ColumnMap $columnMap -SeenRecords ([ref]$seenRecords) -Configuration $Configuration
                        $result.RecordsProcessed += $batch.Count
                        $duplicateCount += $batch.Count - $processedBatch.Count
                        
                        if ($processedBatch.Count -gt 0) {
                            if ($isFirstFile -and $batchCount -eq 1) {
                                # Write headers and first batch
                                $processedBatch | Export-Csv -Path $outputFilePath -NoTypeInformation -Force
                                $standardizedColumns = ($processedBatch | Get-Member -MemberType NoteProperty).Name
                                $isFirstFile = $false
                            } else {
                                # Append subsequent batches
                                $processedBatch | Export-Csv -Path $outputFilePath -NoTypeInformation -Append
                            }
                            $result.RecordsOutput += $processedBatch.Count
                        }
                    }
                } else {
                    # Load entire file for smaller files
                    $records = Import-Csv -Path $file.FullName -ErrorAction Stop
                    $result.RecordsProcessed += $records.Count
                    
                    if ($records.Count -gt 0) {
                        $processedRecords = Process-RecordBatch -Records $records -ColumnMap $columnMap -SeenRecords ([ref]$seenRecords) -Configuration $Configuration
                        $duplicateCount += $records.Count - $processedRecords.Count
                        
                        if ($processedRecords.Count -gt 0) {
                            if ($isFirstFile) {
                                $processedRecords | Export-Csv -Path $outputFilePath -NoTypeInformation -Force
                                $standardizedColumns = ($processedRecords | Get-Member -MemberType NoteProperty).Name
                                $isFirstFile = $false
                            } else {
                                $processedRecords | Export-Csv -Path $outputFilePath -NoTypeInformation -Append
                            }
                            $result.RecordsOutput += $processedRecords.Count
                        }
                    }
                }
            }
            
            # Update metadata
            $result.Metadata.DuplicatesRemoved = $duplicateCount
            $result.Metadata.UniqueRecordsTracked = $seenRecords.Count
            $result.Metadata.StandardizedColumns = $standardizedColumns.Count
            $result.Metadata.OutputFile = $outputFileName
            
            Write-CSVMergeLog -Level "SUCCESS" -Message "Created merged file: $outputFileName"
            
        } finally {
            if ($outputStream) {
                $outputStream.Close()
                $outputStream.Dispose()
            }
        }
        
    } catch {
        Write-CSVMergeLog -Level "ERROR" -Message "Failed to merge file group: $($_.Exception.Message)"
        throw
    }
    
    return $result
}

function Read-CSVInBatches {
    <#
    .SYNOPSIS
        Reads CSV file in batches to handle large files efficiently.
    #>
    [CmdletBinding()]
    param(
        [string]$FilePath,
        [int]$BatchSize = 10000
    )
    
    try {
        $reader = [System.IO.StreamReader]::new($FilePath)
        $csvReader = [System.IO.StringReader]::new("")
        
        # Read header
        $header = $reader.ReadLine()
        if (-not $header) { return }
        
        $batch = @()
        $lineCount = 0
        
        while (-not $reader.EndOfStream) {
            $line = $reader.ReadLine()
            if ($line) {
                $batch += $line
                $lineCount++
                
                if ($batch.Count -ge $BatchSize) {
                    # Convert batch to objects
                    $csvContent = $header + "`n" + ($batch -join "`n")
                    $objects = $csvContent | ConvertFrom-Csv
                    
                    yield $objects
                    
                    $batch = @()
                }
            }
        }
        
        # Process remaining records
        if ($batch.Count -gt 0) {
            $csvContent = $header + "`n" + ($batch -join "`n")
            $objects = $csvContent | ConvertFrom-Csv
            yield $objects
        }
        
    } catch {
        Write-CSVMergeLog -Level "ERROR" -Message "Failed to read CSV in batches: $($_.Exception.Message)"
        throw
    } finally {
        if ($reader) { $reader.Close() }
    }
}

function Process-RecordBatch {
    <#
    .SYNOPSIS
        Processes a batch of records with deduplication and column mapping.
    #>
    [CmdletBinding()]
    param(
        [array]$Records,
        [hashtable]$ColumnMap,
        [ref]$SeenRecords,
        [hashtable]$Configuration
    )
    
    $processedRecords = @()
    
    foreach ($record in $Records) {
        try {
            # Apply column mapping if configured
            if ($ColumnMap.Count -gt 0) {
                $mappedRecord = Apply-ColumnMapping -Record $record -ColumnMap $ColumnMap
            } else {
                $mappedRecord = $record
            }
            
            # Check for duplicates if enabled
            if ($Configuration.enableDeduplication) {
                $recordKey = Get-RecordKey -Record $mappedRecord -Configuration $Configuration
                
                if (-not $SeenRecords.Value.ContainsKey($recordKey)) {
                    $SeenRecords.Value[$recordKey] = $true
                    $processedRecords += $mappedRecord
                }
                # Else skip duplicate
            } else {
                $processedRecords += $mappedRecord
            }
            
        } catch {
            Write-CSVMergeLog -Level "WARN" -Message "Failed to process record: $($_.Exception.Message)"
        }
    }
    
    return $processedRecords
}

function Get-ColumnMapping {
    <#
    .SYNOPSIS
        Returns column mapping configuration for standardizing field names.
    #>
    [CmdletBinding()]
    param(
        [string]$GroupName,
        [hashtable]$Configuration
    )
    
    $columnMap = @{}
    
    # Check for custom column mappings
    if ($Configuration.columnMappings -and $Configuration.columnMappings[$GroupName]) {
        return $Configuration.columnMappings[$GroupName]
    }
    
    # Default column mappings for common standardization
    $defaultMappings = @{
        'ComputerName' = 'HostName'
        'DNSHostName' = 'HostName'
        'Name' = 'DisplayName'
        'MachineName' = 'HostName'
        'SystemName' = 'HostName'
        'ServerName' = 'HostName'
    }
    
    return $defaultMappings
}

function Apply-ColumnMapping {
    <#
    .SYNOPSIS
        Applies column mapping to standardize field names.
    #>
    [CmdletBinding()]
    param(
        [object]$Record,
        [hashtable]$ColumnMap
    )
    
    $mappedRecord = [PSCustomObject]@{}
    
    # Copy all properties first
    foreach ($prop in $Record.PSObject.Properties) {
        $mappedRecord | Add-Member -NotePropertyName $prop.Name -NotePropertyValue $prop.Value
    }
    
    # Apply mappings
    foreach ($oldName in $ColumnMap.Keys) {
        $newName = $ColumnMap[$oldName]
        
        if ($Record.$oldName -and -not $Record.$newName) {
            $mappedRecord | Add-Member -NotePropertyName $newName -NotePropertyValue $Record.$oldName -Force
            $mappedRecord.PSObject.Properties.Remove($oldName)
        }
    }
    
    return $mappedRecord
}

function Get-RecordKey {
    <#
    .SYNOPSIS
        Generates a unique key for record deduplication.
    #>
    [CmdletBinding()]
    param(
        [object]$Record,
        [hashtable]$Configuration
    )
    
    # Use configured key fields if available
    if ($Configuration.deduplicationKeys) {
        $keyFields = $Configuration.deduplicationKeys
    } else {
        # Default key fields in order of preference
        $keyFields = @('HostName', 'ComputerName', 'DNSHostName', 'Name', 'DisplayName', 'Id', 'Identifier')
    }
    
    $keyParts = @()
    foreach ($field in $keyFields) {
        if ($Record.$field) {
            $keyParts += "$field=$($Record.$field)"
        }
    }
    
    # Fallback to all properties if no key fields found
    if ($keyParts.Count -eq 0) {
        foreach ($prop in $Record.PSObject.Properties) {
            if ($prop.Value) {
                $keyParts += "$($prop.Name)=$($prop.Value)"
            }
        }
    }
    
    return ($keyParts -join '|')
}

function Generate-MergeSummary {
    <#
    .SYNOPSIS
        Generates a summary of the merge operation.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Result,
        [string]$SessionId
    )
    
    $summary = @()
    
    # Overall summary
    $summary += [PSCustomObject]@{
        SummaryType = "OverallMerge"
        FilesProcessed = $Result.FilesProcessed
        RecordsProcessed = $Result.RecordsProcessed
        RecordsOutput = $Result.RecordsOutput
        DeduplicationRatio = if ($Result.RecordsProcessed -gt 0) { 
            [math]::Round((($Result.RecordsProcessed - $Result.RecordsOutput) / $Result.RecordsProcessed) * 100, 2) 
        } else { 0 }
        ExecutionTime = $Result.EndTime - $Result.StartTime
        Success = $Result.Success
        ErrorCount = $Result.Errors.Count
        WarningCount = $Result.Warnings.Count
        SessionId = $SessionId
    }
    
    # Group-specific summaries
    foreach ($groupName in $Result.Metadata.Keys) {
        $groupMetadata = $Result.Metadata[$groupName]
        
        $summary += [PSCustomObject]@{
            SummaryType = "GroupMerge"
            GroupName = $groupName
            FilesInGroup = $groupMetadata.FilesInGroup
            TotalSizeBytes = $groupMetadata.TotalSizeBytes
            TotalSizeMB = [math]::Round($groupMetadata.TotalSizeBytes / 1MB, 2)
            RecordsProcessed = $groupMetadata.RecordsProcessed
            RecordsOutput = $groupMetadata.RecordsOutput
            DuplicatesRemoved = $groupMetadata.DuplicatesRemoved ?? 0
            OutputFile = $groupMetadata.OutputFile
            SessionId = $SessionId
        }
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-CSVMerge
