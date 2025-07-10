# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Module for exporting data in PowerApps compatible format
.DESCRIPTION
    Provides functions to generate JSON in PowerApps format, include metadata,
    and support incremental updates.
.NOTES
    Author: M&A Discovery Team
    Version: 1.0.0
    Created: 2025-06-11
#>

function ConvertTo-PowerAppsJson {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$CollectionName,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Metadata = @{}
    )
    
    $powerAppsCollection = @{
        CollectionName = $CollectionName
        Metadata = $Metadata
        Records = @()
    }
    
    foreach ($item in $Data) {
        $record = [PSCustomObject]@{}
        foreach ($prop in $item.PSObject.Properties) {
            # Convert complex objects to JSON string if needed
            if ($prop.Value -is [hashtable] -or $prop.Value -is [array] -or $prop.Value -is [PSCustomObject]) {
                $record | Add-Member -NotePropertyName $prop.Name -NotePropertyValue ($prop.Value | ConvertTo-Json -Compress)
            } else {
                $record | Add-Member -NotePropertyName $prop.Name -NotePropertyValue $prop.Value
            }
        }
        $powerAppsCollection.Records += $record
    }
    
    return $powerAppsCollection | ConvertTo-Json -Depth 10 -Compress
}

function Export-PowerAppsData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object[]]$Data,
        
        [Parameter(Mandatory=$true)]
        [string]$CollectionName,
        
        [Parameter(Mandatory=$true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Metadata = @{},
        
        [Parameter(Mandatory=$false)]
        [switch]$Append # For incremental updates
    )
    
    $filePath = Join-Path $OutputPath "$($CollectionName).json"
    
    # Add default metadata
    $defaultMetadata = @{
        ExportTimestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        SourceModule = "MandADiscoverySuite"
        RecordCount = $Data.Count
    }
    $mergedMetadata = $defaultMetadata.Clone()
    $Metadata.GetEnumerator() | ForEach-Object { $mergedMetadata[$_.Key] = $_.Value }
    
    $powerAppsJson = ConvertTo-PowerAppsJson -Data $Data -CollectionName $CollectionName -Metadata $mergedMetadata
    
    if ($Append -and (Test-Path $filePath)) {
        # For append, we need to read existing, merge, and rewrite.
        # This is a simplified append. A robust solution would handle de-duplication and updates.
        Write-Warning "Append mode for PowerApps export is basic and will simply add new records. De-duplication is not handled."
        $existingContent = Get-Content -Path $filePath -Raw -Encoding UTF8 | ConvertFrom-Json
        $existingContent.Records += ($powerAppsJson | ConvertFrom-Json).Records
        $existingContent.Metadata.RecordCount = $existingContent.Records.Count
        $existingContent.Metadata.ExportTimestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        $existingContent | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $filePath -Encoding UTF8
    } else {
        Set-Content -Path $filePath -Value $powerAppsJson -Encoding UTF8
    }
    
    Write-Host "Exported $($Data.Count) records to PowerApps JSON collection '$CollectionName' at $filePath" -ForegroundColor Green
}

Export-ModuleMember -Function @(
    'ConvertTo-PowerAppsJson',
    'Export-PowerAppsData'
)
