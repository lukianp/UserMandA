#Requires -Version 5.1
<#
.SYNOPSIS
    File operations for M&A Discovery Suite
.DESCRIPTION
    Provides standardized file I/O operations with error handling
#>

function Import-DataFromCSV {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ","
    )
    
    try {
        if (-not (Test-Path $FilePath -PathType Leaf)) {
            Write-MandALog "CSV file not found: $FilePath" -Level "ERROR"
            return @()
        }
        
        Write-MandALog "Importing CSV data from: $FilePath" -Level "DEBUG"
        $data = Import-Csv -Path $FilePath -Delimiter $Delimiter -ErrorAction Stop
        Write-MandALog "Successfully imported $($data.Count) records from CSV" -Level "DEBUG"
        
        return $data
        
    } catch {
        Write-MandALog "Failed to import CSV file '$FilePath': $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        $Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$Delimiter = ",",
        
        [Parameter(Mandatory=$false)]
        [switch]$Append
    )
    
    try {
        # Ensure directory exists
        $directory = Split-Path $FilePath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
            Write-MandALog "Created directory: $directory" -Level "DEBUG"
        }
        
        # Export data
        $params = @{
            Path = $FilePath
            NoTypeInformation = $true
            Delimiter = $Delimiter
            Encoding = "UTF8"
        }
        
        if ($Append) {
            $params.Append = $true
        }
        
        $Data | Export-Csv @params
        Write-MandALog "Successfully exported $($Data.Count) records to CSV: $FilePath" -Level "SUCCESS"
        
        return $true
        
    } catch {
        Write-MandALog "Failed to export CSV file '$FilePath': $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-FileWriteAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )
    
    try {
        $testFile = Join-Path $Path "write_test_$(Get-Random).tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -Force
        return $true
    } catch {
        return $false
    }
}

function Backup-File {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    try {
        if (Test-Path $FilePath) {
            $backupPath = "$FilePath.$(Get-Date -Format 'yyyyMMddHHmmss').bak"
            Copy-Item -Path $FilePath -Destination $backupPath -Force
            Write-MandALog "Created backup: $backupPath" -Level "DEBUG"
            return $backupPath
        }
        return $null
    } catch {
        Write-MandALog "Failed to backup file '$FilePath': $($_.Exception.Message)" -Level "WARN"
        return $null
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Import-DataFromCSV',
    'Export-DataToCSV',
    'Test-FileWriteAccess',
    'Backup-File'
)﻿
