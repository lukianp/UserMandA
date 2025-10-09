#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sync guiv2 source files from project to build location

.DESCRIPTION
    Copies changed files from D:\Scripts\UserMandA\guiv2 to C:\enterprisediscovery\guiv2
    Triggers hot reload in the running dev server

.PARAMETER Path
    Specific file or folder to sync. If not specified, syncs entire guiv2 directory.

.EXAMPLE
    .\sync-to-build.ps1
    Sync all files

.EXAMPLE
    .\sync-to-build.ps1 -Path "guiv2\src\renderer\hooks\useSystemHealthLogic.ts"
    Sync specific file
#>

param(
    [string]$Path = "guiv2"
)

$Source = "D:\Scripts\UserMandA\$Path"
$Destination = "C:\enterprisediscovery\$Path"

Write-Host "🔄 Syncing files..." -ForegroundColor Cyan
Write-Host "   Source: $Source" -ForegroundColor Gray
Write-Host "   Dest:   $Destination" -ForegroundColor Gray

if (Test-Path $Source -PathType Leaf) {
    # Single file
    Copy-Item $Source $Destination -Force
    Write-Host "✅ File synced: $Path" -ForegroundColor Green
} elseif (Test-Path $Source -PathType Container) {
    # Directory - use robocopy for efficiency
    robocopy $Source $Destination /MIR /NJH /NJS /NDL /NP /R:0 /W:0 | Out-Null
    if ($LASTEXITCODE -le 1) {
        Write-Host "✅ Directory synced: $Path" -ForegroundColor Green
    } else {
        Write-Host "❌ Sync failed with code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Path not found: $Source" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Hot reload should pick up changes automatically" -ForegroundColor Yellow
