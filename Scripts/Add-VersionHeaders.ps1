<#
Write-Host "Version control implementation complete!" -ForegroundColor Cyan
# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Adds standardized version control headers to all files in the M&A Discovery Suite
.DESCRIPTION
    This script systematically adds version control headers to all PowerShell scripts, modules, 
    configuration files, and documentation. It preserves existing content while adding 
    comprehensive version tracking information.
.PARAMETER Version
    The version number to assign to all files (default: 1.0.0)
.PARAMETER Force
    Overwrites existing version headers if present
.PARAMETER WhatIf
    Shows what would be changed without making actual changes
.EXAMPLE
    .\Add-VersionHeaders.ps1 -Version "1.0.0"
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-06
    Last Modified: 2025-06-06
    Change Log: Initial version - comprehensive version control implementation
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory = $false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Initial version - comprehensive version control implementation

$ErrorActionPreference = "Stop"

# Get script root directory (should be the suite root)
$SuiteRoot = Split-Path $PSScriptRoot -Parent
$CurrentDate = Get-Date -Format "yyyy-MM-dd"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "        M&A Discovery Suite - Version Control Header Addition          " -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Suite Root: $SuiteRoot" -ForegroundColor Gray
Write-Host "Version: $Version" -ForegroundColor Gray
Write-Host "Date: $CurrentDate" -ForegroundColor Gray
Write-Host ""

# Define file type mappings and their header formats
$FileTypes = @{
    PowerShell = @{
        Extensions = @('.ps1', '.psm1', '.psd1')
        CommentChar = '#'
        HeaderTemplate = @'
# Author: Lukian Poleschtschuk
# Version: {VERSION}
# Created: {CREATED_DATE}
# Last Modified: {MODIFIED_DATE}
# Change Log: {CHANGE_LOG}
'@
    }
    JSON = @{
        Extensions = @('.json')
        CommentChar = '//'
        HeaderTemplate = @'
{
  "_metadata": {
    "author": "Lukian Poleschtschuk",
    "version": "{VERSION}",
    "created": "{CREATED_DATE}",
    "lastModified": "{MODIFIED_DATE}",
    "changeLog": "{CHANGE_LOG}"
  },
'@
    }
    Markdown = @{
        Extensions = @('.md')
        CommentChar = '<!--'
        HeaderTemplate = @'
<!--
Author: Lukian Poleschtschuk
Version: {VERSION}
Created: {CREATED_DATE}
Last Modified: {MODIFIED_DATE}
Change Log: {CHANGE_LOG}
-->

'@
    }
    XML = @{
        Extensions = @('.xml')
        CommentChar = '<!--'
        HeaderTemplate = @'
<!--
Author: Lukian Poleschtschuk
Version: {VERSION}
Created: {CREATED_DATE}
Last Modified: {MODIFIED_DATE}
Change Log: {CHANGE_LOG}
-->
'@
    }
}

function Test-HasVersionHeader {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $false }
    
    # Check for various version header patterns
    $patterns = @(
        'Author:\s*Lukian Poleschtschuk',
        'Version:\s*\d+\.\d+\.\d+',
        '_metadata.*version',
        'Author.*Version.*Created.*Last Modified.*Change Log'
    )
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            return $true
        }
    }
    
    return $false
}

function Get-FileType {
    param([string]$FilePath)
    
    $extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    
    foreach ($type in $FileTypes.Keys) {
        if ($FileTypes[$type].Extensions -contains $extension) {
            return $type
        }
    }
    
    return $null
}

function Add-VersionHeaderToFile {
    param(
        [string]$FilePath,
        [string]$FileType,
        [string]$Version,
        [bool]$Force
    )
    
    try {
        $originalContent = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if (-not $originalContent) {
            Write-Warning "Could not read file: $FilePath"
            return $false
        }
        
        # Check if header already exists
        if ((Test-HasVersionHeader $FilePath) -and -not $Force) {
            Write-Host "  [SKIP] Version header already exists" -ForegroundColor Yellow
            return $false
        }
        
        $fileInfo = Get-Item $FilePath
        $createdDate = $fileInfo.CreationTime.ToString("yyyy-MM-dd")
        $modifiedDate = Get-Date -Format "yyyy-MM-dd"
        $changeLog = if ($Force) { "Updated version control header" } else { "Initial version - any future changes require version increment" }
        
        # Get the appropriate header template
        $headerTemplate = $FileTypes[$FileType].HeaderTemplate
        
        # Replace placeholders
        $header = $headerTemplate -replace '\{VERSION\}', $Version
        $header = $header -replace '\{CREATED_DATE\}', $createdDate
        $header = $header -replace '\{MODIFIED_DATE\}', $modifiedDate
        $header = $header -replace '\{CHANGE_LOG\}', $changeLog
        
        # Handle different file types
        switch ($FileType) {
            'PowerShell' {
                # For PowerShell files, add after any existing #Requires or encoding declarations
                $lines = $originalContent -split "`r?`n"
                $insertIndex = 0
                
                # Skip UTF-8 BOM and #Requires statements
                for ($i = 0; $i -lt $lines.Count; $i++) {
                    if ($lines[$i] -match '^#.*coding:|^#Requires|^#!') {
                        $insertIndex = $i + 1
                    } else {
                        break
                    }
                }
                
                # Insert header
                $newLines = @()
                $newLines += $lines[0..($insertIndex - 1)]
                if ($insertIndex -gt 0) { $newLines += "" }
                $newLines += $header -split "`r?`n"
                $newLines += ""
                $newLines += $lines[$insertIndex..($lines.Count - 1)]
                
                $newContent = $newLines -join "`r`n"
            }
            
            'JSON' {
                # For JSON files, we need to carefully insert metadata
                $jsonContent = $originalContent | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($jsonContent) {
                    # Create new object with metadata first
                    $newJson = [ordered]@{
                        '_metadata' = [ordered]@{
                            'author' = 'Lukian Poleschtschuk'
                            'version' = $Version
                            'created' = $createdDate
                            'lastModified' = $modifiedDate
                            'changeLog' = $changeLog
                        }
                    }
                    
                    # Add existing properties
                    foreach ($property in $jsonContent.PSObject.Properties) {
                        if ($property.Name -ne '_metadata') {
                            $newJson[$property.Name] = $property.Value
                        }
                    }
                    
                    $newContent = $newJson | ConvertTo-Json -Depth 10
                } else {
                    # Fallback for malformed JSON
                    $newContent = $header + "`r`n" + $originalContent
                }
            }
            
            'Markdown' {
                # For Markdown, add header at the very beginning
                $newContent = $header + $originalContent
            }
            
            'XML' {
                # For XML, add after XML declaration if present
                if ($originalContent -match '^<\?xml.*\?>') {
                    $xmlDeclaration = $matches[0]
                    $restOfContent = $originalContent.Substring($xmlDeclaration.Length).TrimStart()
                    $newContent = $xmlDeclaration + "`r`n" + $header + "`r`n" + $restOfContent
                } else {
                    $newContent = $header + "`r`n" + $originalContent
                }
            }
            
            default {
                $newContent = $header + "`r`n" + $originalContent
            }
        }
        
        # Write the new content
        if ($PSCmdlet.ShouldProcess($FilePath, "Add version header")) {
            Set-Content -Path $FilePath -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "  [OK] Version header added" -ForegroundColor Green
            return $true
        }
        
        return $false
        
    } catch {
        Write-Error "Failed to process file $FilePath : $($_.Exception.Message)"
        return $false
    }
}

# Get all files to process
Write-Host "Scanning for files to process..." -ForegroundColor Yellow

$AllFiles = @()
$ExcludePaths = @(
    'TestErrorReports',
    '.git',
    'node_modules',
    'bin',
    'obj'
)

# Get all relevant files
Get-ChildItem -Path $SuiteRoot -Recurse -File | Where-Object {
    $file = $_
    $shouldInclude = $false
    
    # Check if file type is supported
    $fileType = Get-FileType $file.FullName
    if ($fileType) {
        $shouldInclude = $true
    }
    
    # Exclude certain paths
    foreach ($excludePath in $ExcludePaths) {
        if ($file.FullName -like "*$excludePath*") {
            $shouldInclude = $false
            break
        }
    }
    
    return $shouldInclude
} | ForEach-Object {
    $AllFiles += [PSCustomObject]@{
        Path = $_.FullName
        RelativePath = $_.FullName.Replace($SuiteRoot, '').TrimStart('\', '/')
        Type = Get-FileType $_.FullName
        Size = $_.Length
    }
}

Write-Host "Found $($AllFiles.Count) files to process" -ForegroundColor Green
Write-Host ""

# Group files by type for reporting
$FilesByType = $AllFiles | Group-Object Type
foreach ($group in $FilesByType) {
    Write-Host "  $($group.Name): $($group.Count) files" -ForegroundColor Gray
}
Write-Host ""

# Process files
$ProcessedCount = 0
$SuccessCount = 0
$SkippedCount = 0
$ErrorCount = 0

foreach ($file in $AllFiles) {
    $ProcessedCount++
    $percentComplete = [math]::Round(($ProcessedCount / $AllFiles.Count) * 100, 1)
    
    Write-Host "[$ProcessedCount/$($AllFiles.Count)] ($percentComplete%) Processing: $($file.RelativePath)" -ForegroundColor Cyan
    
    try {
        $result = Add-VersionHeaderToFile -FilePath $file.Path -FileType $file.Type -Version $Version -Force $Force
        
        if ($result) {
            $SuccessCount++
        } else {
            $SkippedCount++
        }
        
    } catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        $ErrorCount++
    }
}

# Summary
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "                            SUMMARY                                     " -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Files Processed: $ProcessedCount" -ForegroundColor White
Write-Host "Successfully Updated:  $SuccessCount" -ForegroundColor Green
Write-Host "Skipped (Existing):    $SkippedCount" -ForegroundColor Yellow
Write-Host "Errors:                $ErrorCount" -ForegroundColor Red
Write-Host ""

if ($SuccessCount -gt 0) {
    Write-Host "Version control headers have been successfully added!" -ForegroundColor Green
    Write-Host "All files now include:" -ForegroundColor Gray
    Write-Host "  - Author: Lukian Poleschtschuk" -ForegroundColor Gray
    Write-Host "  - Version: $Version" -ForegroundColor Gray
    Write-Host "  - Creation and modification dates" -ForegroundColor Gray
    Write-Host "  - Change log tracking" -ForegroundColor Gray
}

if ($ErrorCount -gt 0) {
    Write-Host "Some files could not be processed. Please review the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Version control implementation complete!" -ForegroundColor Cyan