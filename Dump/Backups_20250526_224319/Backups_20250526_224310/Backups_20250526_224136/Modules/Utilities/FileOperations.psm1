<#
.SYNOPSIS
    File operations for M&A Discovery Suite
.DESCRIPTION
    Provides file system operations and management utilities
#>

function Export-DataToCSV {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [switch]$Append,
        
        [Parameter(Mandatory=$false)]
        [string]$Encoding = "UTF8"
    )
    
    try {
        # Ensure directory exists
        $directory = Split-Path $FilePath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -Path $directory -ItemType Directory -Force | Out-Null
        }
        
        if ($Data.Count -eq 0) {
            Write-MandALog "No data to export to $FilePath" -Level "WARN"
            return $false
        }
        
        if ($Append -and (Test-Path $FilePath)) {
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding $Encoding -Append
        } else {
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding $Encoding
        }
        
        Write-MandALog "Exported $($Data.Count) records to $FilePath" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Failed to export data to CSV: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Import-DataFromCSV {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$Encoding = "UTF8"
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            Write-MandALog "CSV file not found: $FilePath" -Level "ERROR"
            return @()
        }
        
        $data = Import-Csv -Path $FilePath -Encoding $Encoding
        Write-MandALog "Imported $($data.Count) records from $FilePath" -Level "SUCCESS"
        return $data
        
    } catch {
        Write-MandALog "Failed to import data from CSV: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Backup-File {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [string]$BackupDirectory = $null
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            Write-MandALog "File not found for backup: $FilePath" -Level "ERROR"
            return $null
        }
        
        $fileName = Split-Path $FilePath -Leaf
        $fileDirectory = Split-Path $FilePath -Parent
        
        if (-not $BackupDirectory) {
            $BackupDirectory = Join-Path $fileDirectory "Backup"
        }
        
        if (-not (Test-Path $BackupDirectory)) {
            New-Item -Path $BackupDirectory -ItemType Directory -Force | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFileName = "$($fileName.Split('.')[0])_$timestamp.$($fileName.Split('.')[-1])"
        $backupPath = Join-Path $BackupDirectory $backupFileName
        
        Copy-Item -Path $FilePath -Destination $backupPath -Force
        
        Write-MandALog "File backed up: $backupPath" -Level "SUCCESS"
        return $backupPath
        
    } catch {
        Write-MandALog "Failed to backup file: $($_.Exception.Message)" -Level "ERROR"
        return $null
    }
}

function Compress-Directory {
    param(
        [Parameter(Mandatory=$true)]
        [string]$SourcePath,
        
        [Parameter(Mandatory=$true)]
        [string]$DestinationPath,
        
        [Parameter(Mandatory=$false)]
        [switch]$DeleteSource
    )
    
    try {
        if (-not (Test-Path $SourcePath)) {
            Write-MandALog "Source directory not found: $SourcePath" -Level "ERROR"
            return $false
        }
        
        # Ensure destination directory exists
        $destDirectory = Split-Path $DestinationPath -Parent
        if (-not (Test-Path $destDirectory)) {
            New-Item -Path $destDirectory -ItemType Directory -Force | Out-Null
        }
        
        # Use .NET compression
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($SourcePath, $DestinationPath)
        
        $compressedSize = (Get-Item $DestinationPath).Length
        $originalSize = (Get-ChildItem -Path $SourcePath -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $compressionRatio = [math]::Round((1 - ($compressedSize / $originalSize)) * 100, 1)
        
        Write-MandALog "Directory compressed: $DestinationPath (${compressionRatio}% compression)" -Level "SUCCESS"
        
        if ($DeleteSource) {
            Remove-Item -Path $SourcePath -Recurse -Force
            Write-MandALog "Source directory deleted: $SourcePath" -Level "INFO"
        }
        
        return $true
        
    } catch {
        Write-MandALog "Failed to compress directory: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-DirectorySize {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath
    )
    
    try {
        if (-not (Test-Path $DirectoryPath)) {
            return 0
        }
        
        $size = (Get-ChildItem -Path $DirectoryPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
        return $size
        
    } catch {
        Write-MandALog "Failed to calculate directory size: $($_.Exception.Message)" -Level "ERROR"
        return 0
    }
}

function Format-FileSize {
    param(
        [Parameter(Mandatory=$true)]
        [long]$SizeInBytes
    )
    
    $units = @("B", "KB", "MB", "GB", "TB")
    $unitIndex = 0
    $size = [double]$SizeInBytes
    
    while ($size -ge 1024 -and $unitIndex -lt ($units.Length - 1)) {
        $size = $size / 1024
        $unitIndex++
    }
    
    return "$([math]::Round($size, 2)) $($units[$unitIndex])"
}

function Test-FileInUse {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            return $false
        }
        
        $file = [System.IO.File]::Open($FilePath, 'Open', 'Write')
        $file.Close()
        return $false
        
    } catch {
        return $true
    }
}

function Wait-ForFileRelease {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [int]$TimeoutSeconds = 30,
        
        [Parameter(Mandatory=$false)]
        [int]$CheckIntervalSeconds = 1
    )
    
    $startTime = Get-Date
    
    while ((Test-FileInUse -FilePath $FilePath) -and ((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
        Write-MandALog "Waiting for file release: $FilePath" -Level "DEBUG"
        Start-Sleep -Seconds $CheckIntervalSeconds
    }
    
    $isReleased = -not (Test-FileInUse -FilePath $FilePath)
    
    if ($isReleased) {
        Write-MandALog "File released: $FilePath" -Level "SUCCESS"
    } else {
        Write-MandALog "Timeout waiting for file release: $FilePath" -Level "WARN"
    }
    
    return $isReleased
}

function Clean-OldFiles {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath,
        
        [Parameter(Mandatory=$false)]
        [int]$DaysOld = 30,
        
        [Parameter(Mandatory=$false)]
        [string]$FilePattern = "*.*"
    )
    
    try {
        if (-not (Test-Path $DirectoryPath)) {
            Write-MandALog "Directory not found for cleanup: $DirectoryPath" -Level "WARN"
            return 0
        }
        
        $cutoffDate = (Get-Date).AddDays(-$DaysOld)
        $oldFiles = Get-ChildItem -Path $DirectoryPath -Filter $FilePattern -Recurse | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        $deletedCount = 0
        foreach ($file in $oldFiles) {
            try {
                Remove-Item $file.FullName -Force
                $deletedCount++
                Write-MandALog "Deleted old file: $($file.Name)" -Level "DEBUG"
            } catch {
                Write-MandALog "Failed to delete file $($file.Name): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        if ($deletedCount -gt 0) {
            Write-MandALog "Cleaned up $deletedCount old files from $DirectoryPath" -Level "SUCCESS"
        }
        
        return $deletedCount
        
    } catch {
        Write-MandALog "File cleanup failed: $($_.Exception.Message)" -Level "ERROR"
        return 0
    }
}

function Secure-DeleteFile {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [int]$Passes = 3
    )
    
    try {
        if (-not (Test-Path $FilePath)) {
            Write-MandALog "File not found for secure deletion: $FilePath" -Level "WARN"
            return $true
        }
        
        $fileSize = (Get-Item $FilePath).Length
        
        # Overwrite file content multiple times
        for ($pass = 1; $pass -le $Passes; $pass++) {
            $randomData = New-Object byte[] $fileSize
            (New-Object Random).NextBytes($randomData)
            [System.IO.File]::WriteAllBytes($FilePath, $randomData)
            Write-MandALog "Secure deletion pass $pass of $Passes completed" -Level "DEBUG"
        }
        
        # Final deletion
        Remove-Item $FilePath -Force
        
        Write-MandALog "File securely deleted: $FilePath" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Secure file deletion failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Export-DataToCSV',
    'Import-DataFromCSV',
    'Backup-File',
    'Compress-Directory',
    'Get-DirectorySize',
    'Format-FileSize',
    'Test-FileInUse',
    'Wait-ForFileRelease',
    'Clean-OldFiles',
    'Secure-DeleteFile'
)