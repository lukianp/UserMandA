# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Applies lazy initialization pattern to all PowerShell modules in the M&A Discovery Suite
.DESCRIPTION
    This script systematically replaces direct $global:MandA access with lazy initialization
    using the Get-ModuleContext function across all modules.
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-06
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ModulesPath = ".\Modules",
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf
)

# Function to add lazy initialization to a module
function Add-LazyInitialization {
    param(
        [string]$FilePath
    )
    
    Write-Host "Processing: $FilePath" -ForegroundColor Cyan
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    
    # Check if lazy initialization already exists
    if ($content -match 'function Get-ModuleContext') {
        Write-Host "  Lazy initialization already exists, skipping..." -ForegroundColor Yellow
        return
    }
    
    # Find insertion point (after initial comments and requires)
    $lines = Get-Content -Path $FilePath -Encoding UTF8
    $insertionIndex = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()
        
        # Skip empty lines, comments, and #Requires
        if ([string]::IsNullOrWhiteSpace($line) -or 
            $line.StartsWith('#') -or 
            $line.StartsWith('<#') -or
            $line.StartsWith('.SYNOPSIS') -or
            $line.StartsWith('.DESCRIPTION') -or
            $line.StartsWith('.NOTES') -or
            $line.StartsWith('#>')) {
            continue
        }
        
        # Found first non-comment line
        $insertionIndex = $i
        break
    }
    
    # Create the lazy initialization code
    $lazyInitCode = @"

# Module-scope context variable
`$script:ModuleContext = `$null

# Lazy initialization function
function Get-ModuleContext {
    if (`$null -eq `$script:ModuleContext) {
        if (`$null -ne `$global:MandA) {
            `$script:ModuleContext = `$global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return `$script:ModuleContext
}
"@
    
    # Insert the lazy initialization code
    $newLines = @()
    $newLines += $lines[0..($insertionIndex-1)]
    $newLines += $lazyInitCode.Split("`n")
    $newLines += $lines[$insertionIndex..($lines.Count-1)]
    
    if (-not $WhatIf) {
        $newLines | Set-Content -Path $FilePath -Encoding UTF8
        Write-Host "  Added lazy initialization" -ForegroundColor Green
    } else {
        Write-Host "  Would add lazy initialization" -ForegroundColor Yellow
    }
}

# Function to replace global access patterns
function Replace-GlobalAccess {
    param(
        [string]$FilePath
    )
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    
    # Replace common patterns
    $patterns = @{
        '`$global:MandA\.Config' = '(Get-ModuleContext).Config'
        '`$global:MandA\.Paths' = '(Get-ModuleContext).Paths'
        '`$global:MandA\.CompanyName' = '(Get-ModuleContext).CompanyName'
        'Join-Path `$global:MandA\.Paths\.([A-Za-z]+)' = 'Join-Path (Get-ModuleContext).Paths.$1'
        '`$global:MandA\.([A-Za-z]+)' = '(Get-ModuleContext).$1'
    }
    
    $changesMade = $false
    foreach ($pattern in $patterns.Keys) {
        $replacement = $patterns[$pattern]
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
            $changesMade = $true
            Write-Host "  Replaced pattern: $pattern" -ForegroundColor Green
        }
    }
    
    # Special handling for Context.Paths.RawDataOutput patterns
    if ($content -match '\$Context\.Paths\.([A-Za-z]+)') {
        $content = $content -replace '\$Context\.Paths\.([A-Za-z]+)', '(Get-ModuleContext).Paths.$1'
        $changesMade = $true
        Write-Host "  Replaced Context.Paths patterns" -ForegroundColor Green
    }
    
    if ($changesMade -and -not $WhatIf) {
        Set-Content -Path $FilePath -Value $content -Encoding UTF8
        Write-Host "  Updated global access patterns" -ForegroundColor Green
    } elseif ($changesMade) {
        Write-Host "  Would update global access patterns" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "Applying lazy initialization pattern to M&A Discovery Suite modules..." -ForegroundColor Cyan
Write-Host "WhatIf mode: $WhatIf" -ForegroundColor Yellow

# Get all PowerShell module files
$moduleFiles = Get-ChildItem -Path $ModulesPath -Recurse -Filter "*.psm1"

Write-Host "Found $($moduleFiles.Count) module files to process" -ForegroundColor Cyan

foreach ($moduleFile in $moduleFiles) {
    Write-Host "`nProcessing module: $($moduleFile.Name)" -ForegroundColor White
    
    try {
        # Add lazy initialization if not present
        Add-LazyInitialization -FilePath $moduleFile.FullName
        
        # Replace global access patterns
        Replace-GlobalAccess -FilePath $moduleFile.FullName
        
        Write-Host "  Completed successfully" -ForegroundColor Green
    }
    catch {
        Write-Error "  Failed to process $($moduleFile.Name): $_"
    }
}

Write-Host "`nLazy initialization pattern application completed!" -ForegroundColor Green

if ($WhatIf) {
    Write-Host "This was a WhatIf run. No files were actually modified." -ForegroundColor Yellow
    Write-Host "Run without -WhatIf to apply changes." -ForegroundColor Yellow
}