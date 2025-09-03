# AddHeadersToGUIFiles.ps1
#
# Purpose:
# This script adds or updates standardized headers to all files in the GUI directory.
# Standardized headers provide several benefits for software development and management:
# 1. Consistency: Ensures all files follow the same documentation format.
# 2. Version Tracking: Includes version numbers for better software lifecycle management.
# 3. Technology Identification: Specifies the language and technologies used (e.g., PowerShell, C#, XAML).
# 4. Authority Attribution: Clearly identifies authors and ownership.
# 5. Documentation: Provides synopsis and description for better code understanding and maintenance.
# 6. Compliance: Helps meet organizational standards for code documentation.
# 7. Searchability: Enables easier searching and indexing of code assets.
# 8. Integration: Facilitates integration with documentation tools and version control systems.
#
# The headers are tailored based on file type and use language-appropriate comment syntax.
# Existing headers are detected, version incremented, and dates updated appropriately.
# New headers are created with version 1.0 and current date as "Created".
# Custom synopsis and description are generated based on file content analysis.

$currentDate = "2025-09-03"

function Get-PowerShellHeader {
    param ($version, $created, $lastModified, $synopsis, $description)
    return @"
# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: $version
# Created: $created
# Last Modified: $lastModified

<#
.SYNOPSIS
    $synopsis
.DESCRIPTION
    $description
.NOTES
    Version: $version
    Author: Lukian Poleschtschuk
    Created: $created
    Requires: PowerShell 5.1
#>
"@
}

function Get-CSharpHeader {
    param ($version, $created, $lastModified, $synopsis, $description)
    return @"
/*
Author: System Enhancement
Version: $version
Created: $created
Last Modified: $lastModified

Synopsis:
    $synopsis
Description:
    $description
Notes:
    Version: $version
    Author: System Enhancement
    Created: $created
    Requires: .NET Framework or .NET Core
*/
"@
}

function Get-XAMLHeader {
    param ($version, $created, $lastModified, $synopsis, $description)
    return @"
<!--
Author: System Enhancement
Version: $version
Created: $created
Last Modified: $lastModified

Synopsis:
    $synopsis
Description:
    $description
Notes:
    Version: $version
    Author: System Enhancement
    Created: $created
    Requires: XAML/WPF
-->
"@
}

function Get-GenericHeader {
    param ($version, $created, $lastModified, $synopsis, $description, $commentPrefix)
    return @"
${commentPrefix}Author: System Enhancement
${commentPrefix}Version: $version
${commentPrefix}Created: $created
${commentPrefix}Last Modified: $lastModified

${commentPrefix}Synopsis:
${commentPrefix}    $synopsis
${commentPrefix}Description:
${commentPrefix}    $description
${commentPrefix}Notes:
${commentPrefix}    Version: $version
${commentPrefix}    Author: System Enhancement
${commentPrefix}    Created: $created
${commentPrefix}
"@
}

function GenerateSynopsisDescription {
    param ($path, $content, $ext)
    $fileName = [IO.Path]::GetFileNameWithoutExtension($path)
    $synopsis = "Provides functionality for $fileName component in the M&A Discovery Suite GUI."
    $description = ""
    switch ($ext) {
        ".cs" {
            if ($content -match "class\s+(\w+)") {
                $class = $matches[1]
                $description = "This file contains the $class implementation, managing GUI elements and logic specific to $fileName."
            } else {
                $description = "Contains class definitions and methods for handling GUI operations related to $fileName."
            }
        }
        ".xaml" {
            if ($content -match 'x:Class="([^"]+)"') {
                $class = $matches[1]
                $description = "Defines the user interface layout using XAML for the $class, part of the $fileName view."
            } else {
                $description = "XAML markup file defining the visual structure for the $fileName view in the GUI."
            }
        }
        ".ps1" {
            $description = "PowerShell script handling automation and configuration tasks for $fileName in the GUI suite."
        }
        default {
            $description = "Supports GUI components related to $fileName in the M&A Discovery Suite."
        }
    }
    return $synopsis, $description
}

# Get all files recursively in GUI
$files = Get-ChildItem -Path "GUI" -Recurse -File

foreach ($file in $files) {
    $path = $file.FullName
    try {
        $content = Get-Content $path -Raw
        $firstLines = if ($content) { (($content -split "`n")[0..19] | Where-Object { $_ }) -join "`n" } else { "" }
        $ext = $file.Extension.ToLower()

        # Check for existing header
        $hasHeader = $false
        $existingVersion = "1.0"
        $existingCreated = $currentDate
        if ($firstLines -match "Version:\s*([0-9]+\.[0-9]+)") {
            $hasHeader = $true
            $existingVersion = "1.1"
        }
        if ($firstLines -match "Created:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})") {
            $existingCreated = $matches[1]
        }

        # Generate synopsis and description
        $synopsis, $description = GenerateSynopsisDescription $path $content $ext

        # Get header based on type
        switch ($ext) {
            { $_ -in ".ps1", ".psm1" } { $header = Get-PowerShellHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".cs" { $header = Get-CSharpHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".xaml", ".xml", ".csproj" { $header = Get-XAMLHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".json" { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "//" }
            ".md" { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "#" }
            default { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "#" }
        }

        # Add or update header
        if ($hasHeader) {
            # Find and replace existing header block
            # This is simplistic: assume header is at top and ends with #> or */ or -->
            $headerEnd = switch ($ext) {
                { $_ -in ".ps1", ".psm1" } { "#>" }
                ".cs" { "*/" }
                ".xaml", ".xml", ".csproj" { "-->" }
                default { "" }
            }
            if ($headerEnd) {
                $pattern = "(.*?)$headerEnd"
                $content = [regex]::Replace($content, $pattern, "$header`n`n", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            } else {
                $content = $header + "`n`n" + $content
            }
        } else {
            $content = $header + "`n" + $content
        }

        # Write back
        Set-Content $path $content -Encoding UTF8
        Write-Host "Updated $path"
    } catch {
        Write-Host "Error processing $path : $_"
    }
}

$logPath = "Scripts/AddHeadersToGUIFiles_log.txt"

# Get all files recursively in GUI
$files = Get-ChildItem -Path "GUI" -Recurse -File

Add-Content $logPath "Starting script at $(Get-Date)"
Add-Content $logPath "Found $($files.Count) files to process"

foreach ($file in $files) {
    $path = $file.FullName
    Add-Content $logPath "Processing $path"
    try {
        $content = Get-Content $path -Raw
        Add-Content $logPath "$path read successfully, length: $($content.Length)"
        $firstLines = if ($content) { (($content -split "`n")[0..19] | Where-Object { $_ }) -join "`n" } else { "" }
        $ext = $file.Extension.ToLower()
        Add-Content $logPath "$path ext: $ext"

        # Check for existing header
        $hasHeader = $false
        $existingVersion = "1.0"
        $existingCreated = $currentDate
        if ($firstLines -match "Version:\s*([0-9]+\.[0-9]+)") {
            $hasHeader = $true
            $existingVersion = "1.1"
            Add-Content $logPath "$path has existing header, version set to 1.1"
        } else {
            Add-Content $logPath "$path no existing header, version 1.0"
        }
        if ($firstLines -match "Created:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})") {
            $existingCreated = $matches[1]
        }

        # Generate synopsis and description
        $synopsis, $description = GenerateSynopsisDescription $path $content $ext

        # Get header based on type
        switch ($ext) {
            { $_ -in ".ps1", ".psm1" } { $header = Get-PowerShellHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".cs" { $header = Get-CSharpHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".xaml", ".xml", ".csproj" { $header = Get-XAMLHeader $existingVersion $existingCreated $currentDate $synopsis $description }
            ".json" { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "//" }
            ".md" { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "#" }
            default { $header = Get-GenericHeader $existingVersion $existingCreated $currentDate $synopsis $description "#" }
        }
        Add-Content $logPath "$path header generated, type: $ext"

        # Add or update header
        if ($hasHeader) {
            # Find and replace existing header block
            $headerEnd = switch ($ext) {
                { $_ -in ".ps1", ".psm1" } { "#>" }
                ".cs" { "*/" }
                ".xaml", ".xml", ".csproj" { "-->" }
                default { "" }
            }
            if ($headerEnd) {
                $pattern = "(.*?)$headerEnd"
                $content = [regex]::Replace($content, $pattern, "$header`n`n", [System.Text.RegularExpressions.RegexOptions]::Singleline)
            } else {
                $content = $header + "`n`n" + $content
            }
        } else {
            $content = $header + "`n" + $content
        }

        # Write back
        Set-Content $path $content -Encoding UTF8
        Add-Content $logPath "$path updated successfully"
        Write-Host "Updated $path"
    } catch {
        Add-Content $logPath "Error processing $path : $_"
        Write-Host "Error processing $path : $_"
    }
}

Add-Content $logPath "Script complete at $(Get-Date)"
Write-Host "Header addition/update complete."