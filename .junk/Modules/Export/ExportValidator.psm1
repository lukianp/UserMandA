# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Module for validating exported data files
.DESCRIPTION
    Provides functions to verify CSV integrity, check for required columns,
    and validate data types in exported files.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-11
#>

function Test-ExportFileIntegrity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )
    
    $result = @{
        Success = $true
        Message = "File integrity check passed."
        Details = @{}
    }
    
    if (-not (Test-Path $FilePath)) {
        $result.Success = $false
        $result.Message = "File not found: $FilePath"
        return $result
    }
    
    try {
        # Check if it's a valid CSV by attempting to import
        $data = Import-Csv -Path $FilePath -ErrorAction Stop
        $result.Details.RecordCount = $data.Count
        $result.Details.HeaderCount = ($data | Get-Member -MemberType NoteProperty).Count
        
        if ($data.Count -eq 0) {
            $result.Success = $false
            $result.Message = "File is empty or contains no data rows."
        }
        
    } catch {
        $result.Success = $false
        $result.Message = "Failed to import CSV. File might be corrupted or malformed: $($_.Exception.Message)"
        $result.Details.Exception = $_.Exception.Message
    }
    
    return $result
}

function Test-ExportFileSchema {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$RequiredSchema # e.g., @{ Column1 = "string"; Column2 = "int" }
    )
    
    $result = @{
        Success = $true
        Message = "File schema validation passed."
        MissingColumns = @()
        InvalidDataTypes = @()
    }
    
    $integrityCheck = Test-ExportFileIntegrity -FilePath $FilePath
    if (-not $integrityCheck.Success) {
        $result.Success = $false
        $result.Message = "File integrity check failed: $($integrityCheck.Message)"
        return $result
    }
    
    $data = Import-Csv -Path $FilePath -ErrorAction Stop
    if ($data.Count -eq 0) {
        $result.Success = $false
        $result.Message = "File is empty, cannot validate schema."
        return $result
    }
    
    # Check for required columns
    $actualColumns = ($data[0] | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)
    foreach ($column in $RequiredSchema.Keys) {
        if ($column -notin $actualColumns) {
            $result.Success = $false
            $result.MissingColumns += $column
        }
    }
    
    # Validate data types (only for first record as a sample)
    foreach ($column in $RequiredSchema.Keys) {
        if ($column -in $actualColumns) {
            $expectedType = $RequiredSchema[$column]
            $sampleValue = $data[0].$column
            
            if (-not (Test-DataType -Value $sampleValue -ExpectedType $expectedType)) {
                $result.Success = $false
                $result.InvalidDataTypes += @{ Column = $column; ExpectedType = $expectedType; ActualValue = $sampleValue }
            }
        }
    }
    
    if (-not $result.Success) {
        $result.Message = "File schema validation failed."
    }
    
    return $result
}

function Test-DataType {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        $Value,
        
        [Parameter(Mandatory=$true)]
        [string]$ExpectedType
    )
    
    switch ($ExpectedType.ToLower()) {
        "string" { return $true } # All values can be treated as strings
        "int" { return $Value -match '^\d+$' }
        "boolean" { return $Value -match '^(true|false)$' -or $Value -is [boolean] }
        "datetime" {
            try {
                [datetime]$Value | Out-Null
                return $true
            } catch {
                return $false
            }
        }
        "double" {
            try {
                [double]$Value | Out-Null
                return $true
            } catch {
                return $false
            }
        }
        default { return $false } # Unknown type
    }
}

Export-ModuleMember -Function @(
    'Test-ExportFileIntegrity',
    'Test-ExportFileSchema',
    'Test-DataType'
)