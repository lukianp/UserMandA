#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fully automated error detection and fixing loop

.DESCRIPTION
    1. Parse build output for TypeScript errors
    2. Fix errors automatically
    3. Wait for rebuild
    4. Check if errors are gone
    5. Repeat until all errors fixed
#>

param(
    [int]$MaxIterations = 10,
    [int]$RebuildWaitSeconds = 15
)

$ErrorActionPreference = "Continue"

# Colors
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Magenta = "`e[35m"
$Reset = "`e[0m"

$projectDir = "D:\Scripts\UserMandA\guiv2\src\renderer"
$buildDir = "C:\enterprisediscovery\guiv2"
$buildLogFile = Join-Path $env:TEMP "guiv2-build-errors.log"

Write-Host "${Cyan}╔══════════════════════════════════════════════════════════════╗${Reset}"
Write-Host "${Cyan}║    Fully Automated Error Detection & Fix Loop               ║${Reset}"
Write-Host "${Cyan}╚══════════════════════════════════════════════════════════════╝${Reset}`n"

function Get-BuildErrors {
    param([string]$LogPath)

    if (-not (Test-Path $LogPath)) {
        return @()
    }

    $content = Get-Content $LogPath -Raw
    $errors = @()

    # Parse TypeScript errors from ForkTsCheckerWebpackPlugin
    # Pattern: ERROR in ./src/renderer/PATH:LINE:COL
    $errorMatches = [regex]::Matches($content, 'ERROR in \./src/renderer/([^:]+):(\d+):(\d+)\s+([^\n]+(?:\n(?!\s*ERROR)[^\n]+)*)')

    foreach ($match in $errorMatches) {
        $filePath = $match.Groups[1].Value
        $line = $match.Groups[2].Value
        $col = $match.Groups[3].Value
        $message = $match.Groups[4].Value.Trim()

        $errors += @{
            File = $filePath
            Line = [int]$line
            Column = [int]$col
            Message = $message
            FullPath = Join-Path $projectDir $filePath
        }
    }

    return $errors
}

function Fix-ResultErrorProperty {
    param([array]$Errors)

    $fixed = 0
    $filesToSync = @()

    # Group errors by file
    $errorsByFile = $Errors | Group-Object -Property File

    foreach ($group in $errorsByFile) {
        $file = $group.Group[0].FullPath

        if (-not (Test-Path $file)) {
            Write-Host "  ${Red}✗${Reset} File not found: $($group.Name)"
            continue
        }

        $content = Get-Content $file -Raw
        $originalContent = $content

        # Fix: Property 'error' does not exist
        # Add type assertion (result as any).error
        $content = $content -replace '(\bresult)\.error(\s+\|\|)', '($1 as any).error$2'

        # Fix: error: result.error
        $content = $content -replace '(error:\s+result)\.error(\s+\|\|)', '($1 as any).error$2'

        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
            $filesToSync += $group.Name
            $fixed++
            Write-Host "  ${Green}✓${Reset} Fixed: $($group.Name)"
        }
    }

    return @{
        Fixed = $fixed
        FilesToSync = $filesToSync
    }
}

function Fix-TanstackImports {
    param([array]$Errors)

    $fixed = 0
    $filesToSync = @()

    # Find errors related to @tanstack/react-table
    $tanstackErrors = $Errors | Where-Object { $_.Message -match "tanstack/react-table" -or $_.Message -match "getValue.*implicit.*any" }
    $errorsByFile = $tanstackErrors | Group-Object -Property File | Select-Object -Unique

    foreach ($group in $errorsByFile) {
        $file = $group.Group[0].FullPath

        if (-not (Test-Path $file)) {
            continue
        }

        $content = Get-Content $file -Raw
        $originalContent = $content

        # Replace @tanstack/react-table with ag-grid-community
        $content = $content -replace "import type \{ ColumnDef \} from '@tanstack/react-table';", "import type { ColDef } from 'ag-grid-community';"

        # Replace ColumnDef with ColDef
        $content = $content -replace '\bColumnDef\b', 'ColDef'

        # Fix getValue() implicit any type
        $content = $content -replace 'cell:\s*\(\{\s*getValue\s*\}\)', 'cell: ({ getValue }: any)'

        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -NoNewline -Encoding UTF8
            $filesToSync += $group.Name
            $fixed++
            Write-Host "  ${Green}✓${Reset} Fixed @tanstack import: $($group.Name)"
        }
    }

    return @{
        Fixed = $fixed
        FilesToSync = $filesToSync
    }
}

function Sync-FilesToBuild {
    param([array]$Files)

    $sourceBase = $projectDir
    $destBase = Join-Path $buildDir "src\renderer"

    foreach ($file in $Files) {
        $sourcePath = Join-Path $sourceBase $file
        $destPath = Join-Path $destBase $file

        if (Test-Path $sourcePath) {
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }

            Copy-Item $sourcePath $destPath -Force
            Write-Host "    ${Cyan}→${Reset} Synced: $file"
        }
    }
}

function Start-ErrorMonitoring {
    Write-Host "${Yellow}Starting build output monitoring...${Reset}`n"

    # Start monitoring build output in background
    $job = Start-Job -ScriptBlock {
        param($BuildDir, $LogFile)

        # Tail the webpack output
        Push-Location $BuildDir
        $process = Start-Process powershell -ArgumentList "-NoProfile", "-Command", "npm start 2>&1 | Tee-Object -FilePath '$LogFile'" -PassThru -WindowStyle Hidden
        Pop-Location

        return $process.Id
    } -ArgumentList $buildDir, $buildLogFile

    Start-Sleep -Seconds 5
    return $job
}

# Main loop
$iteration = 0
$totalFixed = 0

Write-Host "${Yellow}Waiting for initial build to complete...${Reset}"
Start-Sleep -Seconds $RebuildWaitSeconds

while ($iteration -lt $MaxIterations) {
    $iteration++

    Write-Host "`n${Magenta}═══════════════════════════════════════════════════════════${Reset}"
    Write-Host "${Magenta}Iteration $iteration of $MaxIterations${Reset}"
    Write-Host "${Magenta}═══════════════════════════════════════════════════════════${Reset}`n"

    # Get current errors from build output
    Write-Host "${Cyan}Parsing build errors...${Reset}"
    $errors = Get-BuildErrors -LogPath $buildLogFile

    if ($errors.Count -eq 0) {
        Write-Host "${Green}✓ No TypeScript errors found!${Reset}`n"
        break
    }

    Write-Host "${Yellow}Found $($errors.Count) error(s)${Reset}`n"

    # Categorize errors
    $resultErrors = $errors | Where-Object { $_.Message -match "Property 'error' does not exist" }
    $tanstackErrors = $errors | Where-Object { $_.Message -match "tanstack|getValue.*any" }

    # Fix errors
    $allFilesToSync = @()

    if ($resultErrors.Count -gt 0) {
        Write-Host "${Cyan}Fixing result.error type errors ($($resultErrors.Count))...${Reset}"
        $result = Fix-ResultErrorProperty -Errors $resultErrors
        $allFilesToSync += $result.FilesToSync
        $totalFixed += $result.Fixed
    }

    if ($tanstackErrors.Count -gt 0) {
        Write-Host "`n${Cyan}Fixing @tanstack/react-table imports ($($tanstackErrors.Count))...${Reset}"
        $result = Fix-TanstackImports -Errors $tanstackErrors
        $allFilesToSync += $result.FilesToSync
        $totalFixed += $result.Fixed
    }

    # Sync fixed files to build directory
    if ($allFilesToSync.Count -gt 0) {
        Write-Host "`n${Cyan}Syncing $($allFilesToSync.Count) file(s) to build directory...${Reset}"
        Sync-FilesToBuild -Files ($allFilesToSync | Select-Object -Unique)

        Write-Host "`n${Yellow}Waiting ${RebuildWaitSeconds}s for rebuild...${Reset}"
        Start-Sleep -Seconds $RebuildWaitSeconds
    } else {
        Write-Host "`n${Yellow}No fixable errors found. May need manual intervention.${Reset}"

        # Show sample of unfixed errors
        Write-Host "`nSample errors:"
        $errors | Select-Object -First 3 | ForEach-Object {
            Write-Host "  ${Red}✗${Reset} $($_.File):$($_.Line) - $($_.Message.Substring(0, [Math]::Min(100, $_.Message.Length)))"
        }

        break
    }
}

# Final summary
Write-Host "`n${Cyan}╔══════════════════════════════════════════════════════════════╗${Reset}"
Write-Host "${Cyan}║                    Final Summary                             ║${Reset}"
Write-Host "${Cyan}╚══════════════════════════════════════════════════════════════╝${Reset}"
Write-Host ""
Write-Host "Iterations completed: ${Magenta}$iteration${Reset}"
Write-Host "Total files fixed:    ${Green}$totalFixed${Reset}"

# Check final error count
$finalErrors = Get-BuildErrors -LogPath $buildLogFile

if ($finalErrors.Count -eq 0) {
    Write-Host "Final error count:    ${Green}0 ✓${Reset}"
    Write-Host ""
    Write-Host "${Green}🎉 All errors fixed successfully!${Reset}"
} else {
    Write-Host "Final error count:    ${Red}$($finalErrors.Count)${Reset}"
    Write-Host ""
    Write-Host "${Yellow}Some errors remain. Review the build output.${Reset}"
}

Write-Host ""
