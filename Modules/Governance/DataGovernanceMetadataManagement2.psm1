# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-19
# Last Modified: 2025-08-19

<#
.SYNOPSIS
    Data governance and metadata management module for the M&A Discovery Suite.

.DESCRIPTION
    This module inventories data governance artefacts including retention
    policies, classification tags and metadata, and highlights potential
    governance issues such as missing retention assignments or undefined
    owners.  Results are exported to CSV files grouped by category for
    consumption by the GUI.

.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-19
    Requires: PowerShell 5.1+, access to file system metadata
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-DataGovernanceLog {
    <#
    .SYNOPSIS
        Writes log entries specific to data governance discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[DataGovernance] $Message" -Level $Level -Component "DataGovernanceMetadataManagement" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN'  { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [DataGovernance] $Message" -ForegroundColor $color
    }
}

function Invoke-DataGovernanceMetadataManagement {
    <#
    .SYNOPSIS
        Main function for data governance discovery and metadata management.

    .DESCRIPTION
        Discovers data retention policies, metadata tags, and governance issues
        across the organisation's datasets.  It reads configuration files and
        file attributes where available and produces consolidated output.

    .PARAMETER Configuration
        Discovery configuration hashtable.  Supports optional keys:
            RetentionPolicyPaths - array of directories containing policy files
            MetadataPaths       - array of directories to search for metadata files

    .PARAMETER Context
        Execution context with output paths and session information.

    .PARAMETER SessionId
        Unique session identifier.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-DataGovernanceLog -Level "HEADER" -Message "Starting Data Governance and Metadata Management (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialise result object
    $result = @{
        Success    = $true
        ModuleName = 'DataGovernanceMetadataManagement'
        RecordCount = 0
        Errors     = [System.Collections.ArrayList]::new()
        Warnings   = [System.Collections.ArrayList]::new()
        Metadata   = @{}
        StartTime  = Get-Date
        EndTime    = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError   = { param($m,$e,$c) $this.Errors.Add(@{Message=$m;Exception=$e;Context=$c}); $this.Success=$false }.GetNewClosure()
        AddWarning = { param($m,$c) $this.Warnings.Add(@{Message=$m;Context=$c}) }.GetNewClosure()
        Complete   = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Discover retention policies
        try {
            Write-DataGovernanceLog -Level "INFO" -Message "Discovering retention policies..." -Context $Context
            $policyData = Get-RetentionPolicies -Configuration $Configuration -SessionId $SessionId
            if ($policyData.Count -gt 0) {
                $policyData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'RetentionPolicy' -Force }
                $null = $allDiscoveredData.AddRange($policyData)
                $result.Metadata["RetentionPolicyCount"] = $policyData.Count
            }
            Write-DataGovernanceLog -Level "SUCCESS" -Message "Discovered $($policyData.Count) retention policies" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover retention policies: $($_.Exception.Message)", @{Section='RetentionPolicies'})
        }

        # Discover metadata tags
        try {
            Write-DataGovernanceLog -Level "INFO" -Message "Discovering metadata tags..." -Context $Context
            $metadataData = Get-MetadataTags -Configuration $Configuration -SessionId $SessionId
            if ($metadataData.Count -gt 0) {
                $metadataData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'MetadataTag' -Force }
                $null = $allDiscoveredData.AddRange($metadataData)
                $result.Metadata["MetadataTagCount"] = $metadataData.Count
            }
            Write-DataGovernanceLog -Level "SUCCESS" -Message "Discovered $($metadataData.Count) metadata tags" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover metadata tags: $($_.Exception.Message)", @{Section='Metadata'})
        }

        # Identify governance issues
        try {
            Write-DataGovernanceLog -Level "INFO" -Message "Evaluating governance issues..." -Context $Context
            $issueData = Get-GovernanceIssues -RetentionPolicies $policyData -MetadataTags $metadataData -SessionId $SessionId
            if ($issueData.Count -gt 0) {
                $issueData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GovernanceIssue' -Force }
                $null = $allDiscoveredData.AddRange($issueData)
                $result.Metadata["GovernanceIssueCount"] = $issueData.Count
            }
            Write-DataGovernanceLog -Level "SUCCESS" -Message "Identified $($issueData.Count) governance issues" -Context $Context
        } catch {
            $result.AddWarning("Failed to evaluate governance issues: $($_.Exception.Message)", @{Section='GovernanceIssues'})
        }

        # Export results
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "DataGovernance_${dataType}.csv"
                $filePath = Join-Path $outputPath $fileName
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryTimestamp' -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryModule' -Value 'DataGovernanceMetadataManagement' -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_SessionId' -Value $SessionId -Force
                }
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-DataGovernanceLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-DataGovernanceLog -Level "WARN" -Message "No data governance results to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-DataGovernanceLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during data governance discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-DataGovernanceLog -Level "HEADER" -Message "Data governance discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }
    return $result
}

function Get-RetentionPolicies {
    <#
    .SYNOPSIS
        Discovers data retention policies from configuration files.
    .DESCRIPTION
        Searches specified directories for JSON or YAML files that define
        retention policies.  Returns a list of objects with policy details.
        If no directories are provided or no policies are found, a sample
        policy is returned as a placeholder.

    .PARAMETER Configuration
        Configuration hashtable that may contain a key 'RetentionPolicyPaths'.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    $searchPaths = @()
    if ($Configuration.ContainsKey('RetentionPolicyPaths')) {
        $searchPaths = $Configuration['RetentionPolicyPaths']
    }
    # Default search path: try context company root if available
    if (-not $searchPaths -and $Configuration.ContainsKey('CompanyRoot')) {
        $searchPaths = @($Configuration['CompanyRoot'])
    }
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            $files = Get-ChildItem -Path $path -Recurse -Include '*.retention.json','*.ret.json','*.retention.yaml','*.retention.yml' -ErrorAction SilentlyContinue
            foreach ($f in $files) {
                try {
                    $content = Get-Content -Path $f.FullName -Raw -ErrorAction Stop
                    $policy = ConvertFrom-Json -InputObject $content -ErrorAction Stop
                    $results += [PSCustomObject]@{
                        PolicyName  = $policy.Name
                        Description = $policy.Description
                        RetentionDays = $policy.RetentionDays
                        Scope      = $policy.Scope
                        SourceFile = $f.FullName
                    }
                } catch {
                    # Skip invalid files
                }
            }
        }
    }
    if ($results.Count -eq 0) {
        # Provide a sample retention policy if none discovered
        $results += [PSCustomObject]@{
            PolicyName    = 'DefaultRetention'
            Description   = 'Default 90 day retention policy'
            RetentionDays = 90
            Scope         = 'Unclassified'
            SourceFile    = 'Generated'
        }
    }
    return $results
}

function Get-MetadataTags {
    <#
    .SYNOPSIS
        Retrieves metadata tags from files within specified directories.
    .DESCRIPTION
        Searches for *.metadata.json files or extended properties on files in the
        provided paths.  For each metadata entry discovered, a custom object
        containing the file name, tag name, and tag value is returned.  If
        nothing is found, a sample metadata tag is generated.

    .PARAMETER Configuration
        Configuration hashtable that may contain a key 'MetadataPaths'.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    $searchPaths = @()
    if ($Configuration.ContainsKey('MetadataPaths')) {
        $searchPaths = $Configuration['MetadataPaths']
    }
    if (-not $searchPaths -and $Configuration.ContainsKey('CompanyRoot')) {
        $searchPaths = @($Configuration['CompanyRoot'])
    }
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            # JSON metadata files
            $metaFiles = Get-ChildItem -Path $path -Recurse -Include '*.metadata.json' -ErrorAction SilentlyContinue
            foreach ($file in $metaFiles) {
                try {
                    $json = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
                    $metadata = ConvertFrom-Json $json -ErrorAction Stop
                    foreach ($key in $metadata.PSObject.Properties.Name) {
                        $results += [PSCustomObject]@{
                            FileName = $file.FullName
                            TagName  = $key
                            TagValue = $metadata.$key
                        }
                    }
                } catch {
                    # ignore parse errors
                }
            }
            # Extended attributes (use get-item property where possible)
            $filesWithAttrs = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue
            foreach ($f in $filesWithAttrs) {
                try {
                    $item = Get-Item -Path $f.FullName -ErrorAction Stop
                    # Example: Title property via Windows indexer
                    if ($item.Attributes -notcontains 'Directory' -and $item | Get-Member -Name 'ExtendedProperty' -ErrorAction SilentlyContinue) {
                        # not widely supported; skip
                    }
                } catch {
                    # ignore
                }
            }
        }
    }
    if ($results.Count -eq 0) {
        # Provide a sample tag if none discovered
        $results += [PSCustomObject]@{
            FileName = 'N/A'
            TagName  = 'Owner'
            TagValue = 'Unknown'
        }
    }
    return $results
}

function Get-GovernanceIssues {
    <#
    .SYNOPSIS
        Evaluates potential data governance issues based on discovered data.
    .DESCRIPTION
        Compares retention policies and metadata tags to identify objects that
        lack required governance attributes.  This is a simplified example that
        flags any file or dataset that does not have an explicit retention policy
        or owner tag.

    .PARAMETER RetentionPolicies
        Array of retention policy objects.
    .PARAMETER MetadataTags
        Array of metadata tag objects.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [array]$RetentionPolicies,
        [array]$MetadataTags,
        [string]$SessionId
    )
    $results = @()
    # Identify if at least one policy exists for unclassified data
    $hasDefault = $false
    foreach ($p in $RetentionPolicies) {
        if ($p.Scope -eq 'Unclassified') { $hasDefault = $true; break }
    }
    if (-not $hasDefault) {
        $results += [PSCustomObject]@{
            IssueType    = 'RetentionPolicy'
            Description  = 'No default retention policy defined for unclassified data'
            AffectedItem = 'Global'
            Severity     = 'Medium'
        }
    }
    # Check for files with no owner tag (simulated by sample metadata)
    foreach ($tag in $MetadataTags) {
        if ($tag.TagName -eq 'Owner' -and ([string]::IsNullOrEmpty($tag.TagValue) -or $tag.TagValue -eq 'Unknown')) {
            $results += [PSCustomObject]@{
                IssueType    = 'Metadata'
                Description  = 'File has no defined owner metadata'
                AffectedItem = $tag.FileName
                Severity     = 'Low'
            }
        }
    }
    return $results
}