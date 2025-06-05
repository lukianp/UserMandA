#Requires -Version 5.1
<#
.SYNOPSIS
    File operations for M&A Discovery Suite
.DESCRIPTION
    Provides standardized file I/O operations with error handling and context-aware logging.
.NOTES
    Author: Lukian Poleschtschuk & Gemini
    Version: 1.1.0 
    Created: 2025-06-03
    Last Modified: 2025-06-05
    Change Log: 
    - Added -Context parameter to functions for Write-MandALog.
    - Ensured Get-OrElse is available (expected to be global).
#>

# This module's functions will use Write-MandALog. 
# It's expected that EnhancedLogging.psm1 is loaded and configured by the calling environment (e.g., Orchestrator via Context).
# It also expects global:Get-OrElse to be defined by Set-SuiteEnvironment.ps1

function Import-DataFromCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ",",

        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # Optional: For logging via Write-MandALog if called directly
    )
    
    try {
        if (-not (Test-Path $FilePath -PathType Leaf)) {
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "CSV file not found: $FilePath" -Level "ERROR" -Context $Context }
            else { Write-Error "CSV file not found: $FilePath" }
            return @()
        }
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Importing CSV data from: $FilePath" -Level "DEBUG" -Context $Context }
        else { Write-Host "[DEBUG FileOps] Importing CSV data from: $FilePath" }

        $data = Import-Csv -Path $FilePath -Delimiter $Delimiter -Encoding UTF8 -ErrorAction Stop # Specify UTF8 for reading
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Successfully imported $($data.Count) records from CSV '$FilePath'" -Level "DEBUG" -Context $Context }
        else { Write-Host "[DEBUG FileOps] Successfully imported $($data.Count) records from CSV '$FilePath'" }
        
        return $data
        
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Failed to import CSV file '$FilePath': $($_.Exception.Message)" -Level "ERROR" -Context $Context }
        else { Write-Error "Failed to import CSV file '$FilePath': $($_.Exception.Message)" }
        return @()
    }
}

function Export-DataToCSV {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        $Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ",",
        
        [Parameter(Mandatory=$false)]
        [switch]$Append,

        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # Optional: For logging
    )
    
    try {
        $directory = Split-Path $FilePath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force -ErrorAction Stop | Out-Null
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Created directory: $directory" -Level "DEBUG" -Context $Context }
            else { Write-Host "[DEBUG FileOps] Created directory: $directory" }
        }
        
        $exportParams = @{
            Path = $FilePath
            NoTypeInformation = $true
            Delimiter = $Delimiter
            Encoding = "UTF8" # CRITICAL for PowerShell 5.1 to handle special characters
            ErrorAction = "Stop"
        }
        
        if ($Append.IsPresent) { # Check .IsPresent for switch parameters
            $exportParams.Append = $true
        }
        
        $Data | Export-Csv @exportParams # Splatting parameters
        
        $recordCount = 0
        if ($Data -is [System.Collections.IList]) { $recordCount = $Data.Count } 
        elseif ($Data) { $recordCount = 1 } # Single object

        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Successfully exported $recordCount records to CSV: $FilePath" -Level "SUCCESS" -Context $Context }
        else { Write-Host "[SUCCESS FileOps] Successfully exported $recordCount records to CSV: $FilePath" }
        
        return $true
        
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Failed to export CSV file '$FilePath': $($_.Exception.Message)" -Level "ERROR" -Context $Context }
        else { Write-Error "Failed to export CSV file '$FilePath': $($_.Exception.Message)" }
        return $false
    }
}

function Test-FileWriteAccess {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path, # This should be a directory path to test write access in

        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # Optional: For logging
    )
    
    try {
        if (-not (Test-Path $Path -PathType Container)) {
             if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Directory for write test does not exist: $Path" -Level "WARN" -Context $Context }
             else { Write-Warning "Directory for write test does not exist: $Path"}
             return $false # Cannot test write access if directory doesn't exist
        }
        $testFile = Join-Path $Path "write_test_$(Get-Random).tmp"
        "test" | Out-File -FilePath $testFile -Encoding UTF8 -ErrorAction Stop # Use UTF8 for Out-File
        Remove-Item $testFile -Force -ErrorAction Stop
        return $true
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "File write access test failed for path '$Path': $($_.Exception.Message)" -Level "ERROR" -Context $Context }
        else { Write-Error "File write access test failed for path '$Path': $($_.Exception.Message)"}
        return $false
    }
}

function Backup-File {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,

        [Parameter(Mandatory=$false)]
        [MandAContext]$Context # Optional: For logging
    )
    
    try {
        if (Test-Path $FilePath -PathType Leaf) { # Ensure it's a file
            $backupPath = "$FilePath.$(Get-Date -Format 'yyyyMMddHHmmss').bak"
            Copy-Item -Path $FilePath -Destination $backupPath -Force -ErrorAction Stop
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Created backup: $backupPath" -Level "DEBUG" -Context $Context }
            else { Write-Host "[DEBUG FileOps] Created backup: $backupPath" }
            return $backupPath
        }
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "File to backup not found: $FilePath" -Level "WARN" -Context $Context }
        else { Write-Warning "File to backup not found: $FilePath" }
        return $null
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Write-MandALog "Failed to backup file '$FilePath': $($_.Exception.Message)" -Level "WARN" -Context $Context }
        else { Write-Warning "Failed to backup file '$FilePath': $($_.Exception.Message)" }
        return $null
    }
}

# Export functions
Export-ModuleMember -Function Import-DataFromCSV, Export-DataToCSV, Test-FileWriteAccess, Backup-File
