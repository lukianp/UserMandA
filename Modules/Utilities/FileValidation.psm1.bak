# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    File validation utilities for M&A Discovery Suite
.DESCRIPTION
    Provides functions to validate discovery output files for content quality
.NOTES
    Version: 1.0.0
    Created: 2025-06-08
#>

function Test-DiscoveryFileValid {
    <#
    .SYNOPSIS
        Tests if a discovery CSV file exists and has valid content
    .DESCRIPTION
        Checks if file exists, has headers, and contains at least one data record
    .PARAMETER FilePath
        Path to the CSV file to validate
    .PARAMETER MinimumRecords
        Minimum number of data records required (default: 1)
    .PARAMETER RequiredHeaders
        Array of required header names (optional)
    .OUTPUTS
        Boolean indicating if file is valid for skipping discovery
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$false)]
        [int]$MinimumRecords = 1,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredHeaders = @()
    )
    
    try {
        # Check if file exists
        if (-not (Test-Path $FilePath)) {
            Write-Verbose "File does not exist: $FilePath"
            return $false
        }
        
        # Check file size (must be larger than just headers)
        $fileInfo = Get-Item $FilePath
        if ($fileInfo.Length -lt 50) {  # Minimum reasonable size for headers + 1 record
            Write-Verbose "File too small (likely empty or headers only): $FilePath ($($fileInfo.Length) bytes)"
            return $false
        }
        
        # Try to import and validate content
        try {
            $csvData = Import-Csv $FilePath -ErrorAction Stop
            
            # Check if we have any records
            if (-not $csvData -or $csvData.Count -lt $MinimumRecords) {
                Write-Verbose "File has insufficient records: $FilePath ($($csvData.Count) records, need $MinimumRecords)"
                return $false
            }
            
            # Check for required headers if specified
            if ($RequiredHeaders.Count -gt 0) {
                $actualHeaders = $csvData[0].PSObject.Properties.Name
                $missingHeaders = $RequiredHeaders | Where-Object { $_ -notin $actualHeaders }
                
                if ($missingHeaders.Count -gt 0) {
                    Write-Verbose "File missing required headers: $FilePath (Missing: $($missingHeaders -join ', '))"
                    return $false
                }
            }
            
            # Check if first record has meaningful data (not all null/empty)
            $firstRecord = $csvData[0]
            $nonEmptyProperties = $firstRecord.PSObject.Properties | Where-Object { 
                -not [string]::IsNullOrWhiteSpace($_.Value) 
            }
            
            if ($nonEmptyProperties.Count -eq 0) {
                Write-Verbose "File has no meaningful data in first record: $FilePath"
                return $false
            }
            
            Write-Verbose "File validation passed: $FilePath ($($csvData.Count) records)"
            return $true
        }
        catch {
            Write-Verbose "Failed to parse CSV file: $FilePath - $_"
            return $false
        }
    }
    catch {
        Write-Verbose "Error validating file: $FilePath - $_"
        return $false
    }
}

function Test-DiscoveryFileSkippable {
    <#
    .SYNOPSIS
        Determines if discovery should be skipped based on existing file quality
    .DESCRIPTION
        Combines configuration settings with file validation to determine skip behavior
    .PARAMETER Configuration
        Discovery configuration hashtable
    .PARAMETER FilePath
        Path to the output file that would be created
    .PARAMETER ModuleName
        Name of the discovery module for logging
    .PARAMETER MinimumRecords
        Minimum number of records required to consider file valid
    .PARAMETER RequiredHeaders
        Array of required header names
    .OUTPUTS
        Boolean indicating if discovery should be skipped
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        [int]$MinimumRecords = 1,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredHeaders = @()
    )
    
    # Check if skipping is enabled in configuration
    if (-not $Configuration.discovery.skipExistingFiles) {
        Write-Verbose "[$ModuleName] File skipping disabled in configuration"
        return $false
    }
    
    # Validate the existing file
    $isValid = Test-DiscoveryFileValid -FilePath $FilePath -MinimumRecords $MinimumRecords -RequiredHeaders $RequiredHeaders
    
    if ($isValid) {
        Write-Host "[$ModuleName] Valid existing file found, skipping discovery: $FilePath" -ForegroundColor Yellow
        return $true
    } else {
        Write-Verbose "[$ModuleName] Existing file invalid or insufficient, proceeding with discovery: $FilePath"
        return $false
    }
}

function Get-DiscoveryFileInfo {
    <#
    .SYNOPSIS
        Gets detailed information about a discovery file
    .DESCRIPTION
        Returns comprehensive information about file size, record count, and validity
    .PARAMETER FilePath
        Path to the CSV file to analyze
    .OUTPUTS
        PSCustomObject with file information
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    $result = [PSCustomObject]@{
        FilePath = $FilePath
        Exists = $false
        SizeBytes = 0
        SizeKB = 0
        RecordCount = 0
        HeaderCount = 0
        Headers = @()
        IsValid = $false
        LastModified = $null
        ValidationErrors = @()
    }
    
    try {
        if (Test-Path $FilePath) {
            $result.Exists = $true
            $fileInfo = Get-Item $FilePath
            $result.SizeBytes = $fileInfo.Length
            $result.SizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
            $result.LastModified = $fileInfo.LastWriteTime
            
            if ($fileInfo.Length -gt 0) {
                try {
                    $csvData = Import-Csv $FilePath -ErrorAction Stop
                    $result.RecordCount = $csvData.Count
                    
                    if ($csvData.Count -gt 0) {
                        $result.Headers = $csvData[0].PSObject.Properties.Name
                        $result.HeaderCount = $result.Headers.Count
                        $result.IsValid = Test-DiscoveryFileValid -FilePath $FilePath
                    }
                }
                catch {
                    $result.ValidationErrors += "Failed to parse CSV: $_"
                }
            } else {
                $result.ValidationErrors += "File is empty"
            }
        }
    }
    catch {
        $result.ValidationErrors += "Error accessing file: $_"
    }
    
    return $result
}

# Export module members
Export-ModuleMember -Function @(
    'Test-DiscoveryFileValid',
    'Test-DiscoveryFileSkippable', 
    'Get-DiscoveryFileInfo'
)