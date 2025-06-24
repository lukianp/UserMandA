# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Adds the Invoke-SafeModuleExecution error handling wrapper to all module functions
.DESCRIPTION
    This script systematically adds the error handling wrapper function to all PowerShell modules
    in the M&A Discovery Suite, ensuring consistent error handling across all modules.
.NOTES
    Author: M&A Discovery Suite Team
    Version: 1.0.0
    Created: 2025-06-09
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ModulesPath = ".\Modules",
    
    [Parameter(Mandatory=$false)]
    [switch]$WhatIf,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Error handling wrapper function to be added to all modules
$ErrorHandlingWrapperFunction = @'

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

'@

function Add-WrapperToModule {
    param(
        [string]$ModulePath,
        [switch]$WhatIf
    )
    
    Write-Host "Processing module: $ModulePath" -ForegroundColor Cyan
    
    try {
        # Read the module content
        $content = Get-Content -Path $ModulePath -Raw -Encoding UTF8
        
        # Check if the wrapper function already exists
        if ($content -match "function Invoke-SafeModuleExecution") {
            Write-Host "  Wrapper function already exists in $ModulePath" -ForegroundColor Yellow
            return $false
        }
        
        # Find the best insertion point (after the module context section but before the first function)
        $lines = $content -split "`r?`n"
        $insertionIndex = -1
        
        # Look for patterns to determine insertion point
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            
            # Insert after module context initialization but before first function
            if ($line -match "^function Get-ModuleContext" -and $insertionIndex -eq -1) {
                # Find the end of this function
                $braceCount = 0
                $inFunction = $false
                for ($j = $i; $j -lt $lines.Count; $j++) {
                    if ($lines[$j] -match "\{") { 
                        $braceCount += ($lines[$j] -split "\{").Count - 1
                        $inFunction = $true
                    }
                    if ($lines[$j] -match "\}") { 
                        $braceCount -= ($lines[$j] -split "\}").Count - 1
                    }
                    if ($inFunction -and $braceCount -eq 0) {
                        $insertionIndex = $j + 1
                        break
                    }
                }
                break
            }
            
            # Fallback: insert before first function if no Get-ModuleContext found
            if ($line -match "^function " -and $insertionIndex -eq -1) {
                $insertionIndex = $i
                break
            }
        }
        
        # If no good insertion point found, insert after header comments
        if ($insertionIndex -eq -1) {
            for ($i = 0; $i -lt $lines.Count; $i++) {
                $line = $lines[$i].Trim()
                if ($line -eq "" -and $i -gt 10) {  # After header section
                    $insertionIndex = $i
                    break
                }
            }
        }
        
        # Final fallback: insert at line 20
        if ($insertionIndex -eq -1) {
            $insertionIndex = 20
        }
        
        if ($WhatIf) {
            Write-Host "  Would insert wrapper function at line $insertionIndex" -ForegroundColor Green
            return $true
        }
        
        # Insert the wrapper function
        $newLines = @()
        $newLines += $lines[0..($insertionIndex-1)]
        $newLines += ""
        $newLines += $ErrorHandlingWrapperFunction -split "`r?`n"
        $newLines += ""
        $newLines += $lines[$insertionIndex..($lines.Count-1)]
        
        # Write back to file
        $newContent = $newLines -join "`r`n"
        Set-Content -Path $ModulePath -Value $newContent -Encoding UTF8 -Force
        
        Write-Host "  Successfully added wrapper function to $ModulePath" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "  Error processing $ModulePath`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-AllModuleFiles {
    param([string]$Path)
    
    $moduleFiles = @()
    
    if (Test-Path $Path) {
        $moduleFiles = Get-ChildItem -Path $Path -Recurse -Filter "*.psm1" | 
                      Where-Object { $_.Name -notlike "*.bak" -and $_.Name -notlike "*.backup" } |
                      Sort-Object FullName
    }
    
    return $moduleFiles
}

# Main execution
Write-Host "M&A Discovery Suite - Error Handling Wrapper Addition" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Magenta

if (-not (Test-Path $ModulesPath)) {
    Write-Error "Modules path not found: $ModulesPath"
    exit 1
}

# Get all module files
$moduleFiles = Get-AllModuleFiles -Path $ModulesPath

if ($moduleFiles.Count -eq 0) {
    Write-Warning "No module files found in $ModulesPath"
    exit 0
}

Write-Host "Found $($moduleFiles.Count) module files to process" -ForegroundColor White

if ($WhatIf) {
    Write-Host "Running in WhatIf mode - no changes will be made" -ForegroundColor Yellow
}

$processedCount = 0
$successCount = 0

foreach ($moduleFile in $moduleFiles) {
    $processedCount++
    
    if (Add-WrapperToModule -ModulePath $moduleFile.FullName -WhatIf:$WhatIf) {
        $successCount++
    }
}

Write-Host "`nProcessing complete:" -ForegroundColor Magenta
Write-Host "  Total modules processed: $processedCount" -ForegroundColor White
Write-Host "  Successfully modified: $successCount" -ForegroundColor Green
Write-Host "  Skipped/Failed: $($processedCount - $successCount)" -ForegroundColor Yellow

if (-not $WhatIf) {
    Write-Host "`nRecommendation: Test the modules to ensure they still function correctly." -ForegroundColor Cyan
}