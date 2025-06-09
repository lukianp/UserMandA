# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-03
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Provides common file and directory operation utilities for the M&A Discovery Suite.
.DESCRIPTION
    This module includes functions for importing/exporting CSV data,
    testing file write access, backing up files, and other file system tasks.
    It standardizes on UTF-8 encoding and integrates with EnhancedLogging.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Uses Write-MandALog for logging.
    - Standardizes on UTF-8 for CSV and text file operations.
    - Path construction relies on Join-Path for robustness.
    - Context parameter for logging and potentially for default paths if needed.
#>

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
{
    try {
        if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
    } catch {
        Write-MandALog "Error in function 'Get-ModuleContext': $($_.Exception.Message)" "ERROR"
        throw
    }
}


function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}



# Export-ModuleMember moved to end of file

function Ensure-DirectoryExists {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    if ([string]::IsNullOrWhiteSpace($DirectoryPath)) {
        Write-MandALog -Message "Ensure-DirectoryExists: DirectoryPath is null or empty." -Level "ERROR" -Component "FileOps" -Context $Context
        return $false
    }
    if (-not (Test-Path $DirectoryPath -PathType Container)) {
        Write-MandALog -Message "Directory '$DirectoryPath' does not exist. Attempting to create." -Level "INFO" -Component "FileOps" -Context $Context
        try {
            New-Item -Path $DirectoryPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            Write-MandALog -Message "Successfully created directory: '$DirectoryPath'" -Level "SUCCESS" -Component "FileOps" -Context $Context
            return $true
        } catch {
            Write-MandALog -Message "Failed to create directory '$DirectoryPath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
            # Optionally, add to ErrorCollector if $Context contains one
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("FileOperations", "Failed to create directory '$DirectoryPath'", $_.Exception)
            }
            return $false
        }
    }
    Write-MandALog -Message "Directory '$DirectoryPath' already exists." -Level "DEBUG" -Component "FileOps" -Context $Context
    return $true
}

function Import-DataFromCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,

        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ",",

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    if (-not (Test-Path $FilePath -PathType Leaf)) {
        Write-MandALog -Message "CSV file not found for import: '$FilePath'" -Level "WARN" -Component "FileOps" -Context $Context
        return $null
    }
    try {
        Write-MandALog -Message "Importing data from CSV: '$FilePath'" -Level "DEBUG" -Component "FileOps" -Context $Context
        # PowerShell 5.1's Import-Csv uses Default encoding. If files are strictly UTF-8, this might be an issue.
        # For broader compatibility with files possibly saved by older Excel, 'Default' might be safer than strict 'UTF8'.
        # If UTF-8 is guaranteed, use -Encoding UTF8.
        $data = Import-Csv -Path $FilePath -Delimiter $Delimiter -Encoding Default -ErrorAction Stop
        Write-MandALog -Message "Successfully imported $($data.Count) records from '$FilePath'." -Level "INFO" -Component "FileOps" -Context $Context
        return $data
    } catch {
        Write-MandALog -Message "Failed to import CSV '$FilePath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
        if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
            $Context.ErrorCollector.AddError("FileOperations_ImportCSV", "Failed to import CSV '$FilePath'", $_.Exception)
        }
        return $null
    }
}

function Export-DataToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data, # Array of PSCustomObjects or similar

        [Parameter(Mandatory=$true)]
        [string]$FilePath,

        [Parameter(Mandatory=$false)]
        [switch]$NoTypeInformation = $true,

        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ",",

        [Parameter(Mandatory=$false)]
        [switch]$Append,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging and ensuring directory exists
    )
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        Write-MandALog -Message "No data provided to export to CSV: '$FilePath'. Skipping." -Level "INFO" -Component "FileOps" -Context $Context
        return $false
    }

    $directory = Split-Path $FilePath -Parent
    if (-not (Ensure-DirectoryExists -DirectoryPath $directory -Context $Context)) {
        Write-MandALog -Message "Cannot export CSV. Parent directory '$directory' for '$FilePath' could not be ensured." -Level "ERROR" -Component "FileOps" -Context $Context
        return $false
    }

    try {
        Write-MandALog -Message "Exporting $($Data.Count) records to CSV: '$FilePath' (Append: $($Append.IsPresent))." -Level "DEBUG" -Component "FileOps" -Context $Context
        
        $exportParams = @{
            Path = $FilePath
            Delimiter = $Delimiter
            Encoding = "UTF8" # Standardize on UTF8 for export
            ErrorAction = "Stop"
        }
        if ($NoTypeInformation) { $exportParams.NoTypeInformation = $true }
        if ($Append) { $exportParams.Append = $true }

        # Use pipeline to properly handle array of objects
        $Data | Export-Csv @exportParams
        
        Write-MandALog -Message "Successfully exported data to '$FilePath'." -Level "SUCCESS" -Component "FileOps" -Context $Context
        return $true
    } catch {
        Write-MandALog -Message "Failed to export data to CSV '$FilePath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
        if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
            $Context.ErrorCollector.AddError("FileOperations_ExportCSV", "Failed to export to CSV '$FilePath'", $_.Exception)
        }
        return $false
    }
}

function Test-FileWriteAccess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path, # Can be a directory or a full file path

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    $testFilePath = ""
    $isDirectory = Test-Path -Path $Path -PathType Container

    if ($isDirectory) {
        if (-not (Ensure-DirectoryExists -DirectoryPath $Path -Context $Context)) {
            return $false # Directory couldn't be created/doesn't exist
        }
        $testFileName = "write_test_$(Get-RandomInt -Min 10000 -Max 99999).tmp"
        $testFilePath = Join-Path $Path $testFileName
    } else {
        $parentDir = Split-Path $Path -Parent
         if (-not (Ensure-DirectoryExists -DirectoryPath $parentDir -Context $Context)) {
            return $false # Parent directory couldn't be created
        }
        $testFilePath = $Path # Test writing to the specified file path directly
    }

    try {
        Set-Content -Path $testFilePath -Value "Test write access $(Get-Date)" -Encoding UTF8 -ErrorAction Stop
        Remove-Item -Path $testFilePath -Force -ErrorAction Stop # Clean up
        Write-MandALog -Message "Write access confirmed for path: '$Path'." -Level "DEBUG" -Component "FileOps" -Context $Context
        return $true
    } catch {
        Write-MandALog -Message "Write access test failed for path: '$Path'. Error: $($_.Exception.Message)" -Level "WARN" -Component "FileOps" -Context $Context
        # Clean up if test file was partially created or if testing a specific file path that now exists due to Set-Content attempt
        if (Test-Path $testFilePath -PathType Leaf) {
            Remove-Item -Path $testFilePath -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
}

function Backup-File {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,

        [Parameter(Mandatory=$false)]
        [string]$BackupSuffix = "_BAK_$(Get-Date -Format 'yyyyMMddHHmmss')",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    if (-not (Test-Path $FilePath -PathType Leaf)) {
        Write-MandALog -Message "File not found for backup: '$FilePath'. Skipping backup." -Level "WARN" -Component "FileOps" -Context $Context
        return $null
    }

    $fileInfo = Get-Item $FilePath
    $backupFileName = "$($fileInfo.BaseName)$BackupSuffix$($fileInfo.Extension)"
    $backupPath = Join-Path $fileInfo.DirectoryName $backupFileName

    if ($PSCmdlet.ShouldProcess($FilePath, "Backup to '$backupPath'")) {
        try {
            Copy-Item -Path $FilePath -Destination $backupPath -Force -ErrorAction Stop
            Write-MandALog -Message "File '$($fileInfo.Name)' backed up successfully to '$backupFileName'." -Level "INFO" -Component "FileOps" -Context $Context
            return $backupPath
        } catch {
            Write-MandALog -Message "Failed to backup file '$($fileInfo.Name)'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
            if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                $Context.ErrorCollector.AddError("FileOperations_Backup", "Failed to backup file '$($fileInfo.Name)'", $_.Exception)
            }
            return $null
        }
    } else {
        Write-MandALog -Message "Backup of file '$($fileInfo.Name)' skipped by ShouldProcess." -Level "DEBUG" -Component "FileOps" -Context $Context
        return $null
    }
}

function Clear-OldFiles {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,

        [Parameter(Mandatory=$true)]
        [int]$RetentionDays,

        [Parameter(Mandatory=$false)]
        [string]$FileFilter = "*.*",

        [Parameter(Mandatory=$false)]
        [switch]$Recurse,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )
    if (-not (Test-Path $DirectoryPath -PathType Container)) {
        Write-MandALog -Message "Directory for cleanup not found: '$DirectoryPath'." -Level "WARN" -Component "FileOps" -Context $Context
        return
    }
    if ($RetentionDays -le 0) {
        Write-MandALog -Message "RetentionDays ($RetentionDays) is not positive. Skipping cleanup in '$DirectoryPath'." -Level "INFO" -Component "FileOps" -Context $Context
        return
    }

    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Write-MandALog -Message "Clearing files older than $cutoffDate (Retention: $RetentionDays days) in '$DirectoryPath' (Filter: '$FileFilter')." -Level "INFO" -Component "FileOps" -Context $Context
    
    $getChildItemParams = @{
        Path = $DirectoryPath
        Filter = $FileFilter
        File = $true # Only files
        ErrorAction = "SilentlyContinue" # Continue if some subdirs are not accessible
    }
    if ($Recurse) { $getChildItemParams.Recurse = $true }

    $filesToRemove = Get-ChildItem @getChildItemParams | Where-Object { $_.LastWriteTime -lt $cutoffDate }

    if ($filesToRemove.Count -eq 0) {
        Write-MandALog -Message "No files older than $RetentionDays days found matching filter '$FileFilter' in '$DirectoryPath'." -Level "INFO" -Component "FileOps" -Context $Context
        return
    }

    Write-MandALog -Message "Found $($filesToRemove.Count) old files to remove from '$DirectoryPath'." -Level "INFO" -Component "FileOps" -Context $Context
    foreach ($file in $filesToRemove) {
        if ($PSCmdlet.ShouldProcess($file.FullName, "Remove old file (LastWriteTime: $($file.LastWriteTime))")) {
            try {
                Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                Write-MandALog -Message "Removed old file: $($file.FullName)" -Level "DEBUG" -Component "FileOps" -Context $Context
            } catch {
                Write-MandALog -Message "Failed to remove old file '$($file.FullName)'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
                 if ($Context -and $Context.PSObject.Properties['ErrorCollector']) {
                    $Context.ErrorCollector.AddError("FileOperations_Cleanup", "Failed to remove old file '$($file.FullName)'", $_.Exception)
                }
            }
        }
    }
    Write-MandALog -Message "Old file cleanup process completed for '$DirectoryPath'." -Level "INFO" -Component "FileOps" -Context $Context
}

function Get-DirectorySizeFormatted {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,
        [PSCustomObject]$Context
    )
    if (-not (Test-Path $DirectoryPath -PathType Container)) {
        Write-MandALog -Message "Directory not found: '$DirectoryPath'. Cannot get size." -Level "WARN" -Component "FileOps" -Context $Context
        return "N/A"
    }
    try {
        $totalSize = (Get-ChildItem $DirectoryPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($null -eq $totalSize) { $totalSize = 0 }

        if ($totalSize -ge 1TB) { return ("{0:N2} TB" -f ($totalSize / 1TB)) }
        elseif ($totalSize -ge 1GB) { return ("{0:N2} GB" -f ($totalSize / 1GB)) }
        elseif ($totalSize -ge 1MB) { return ("{0:N2} MB" -f ($totalSize / 1MB)) }
        elseif ($totalSize -ge 1KB) { return ("{0:N2} KB" -f ($totalSize / 1KB)) }
        else { return ("{0} Bytes" -f $totalSize) }
    } catch {
        Write-MandALog -Message "Error calculating directory size for '$DirectoryPath': $($_.Exception.Message)" -Level "ERROR" -Component "FileOps" -Context $Context
        return "Error"
    }
}

# Helper for Get-RandomInt if System.Random is preferred over Get-Random for performance or specific scenarios
function Get-RandomInt {
    param($Min, $Max)
    # Simple wrapper, Get-Random is usually fine.
    return Get-Random -Minimum $Min -Maximum ($Max + 1) # Get-Random's Max is exclusive
}


# Export all public functions
Export-ModuleMember -Function Import-DataFromCSV, Export-DataToCSV, Test-FileWriteAccess, Backup-File, Ensure-DirectoryExists, Clear-OldFiles, Get-DirectorySizeFormatted

Write-Host "[FileOperations.psm1] Module loaded." -ForegroundColor DarkGray



