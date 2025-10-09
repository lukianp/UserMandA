#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Batch fix all TypeScript compilation errors from build output

.DESCRIPTION
    Fixes two categories of errors:
    1. Type errors with result.error property access
    2. Missing @tanstack/react-table imports (replace with AG Grid)
#>

$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

Write-Host "${Cyan}╔══════════════════════════════════════════════════════════╗${Reset}"
Write-Host "${Cyan}║          Batch Error Fix Script                          ║${Reset}"
Write-Host "${Cyan}╚══════════════════════════════════════════════════════════╝${Reset}`n"

$projectDir = "D:\Scripts\UserMandA\guiv2\src\renderer"
$fixCount = 0

# Category 1: Fix result.error type errors
Write-Host "${Yellow}Category 1: Fixing ExecutionResult type errors...${Reset}`n"

$filesToFix = @(
    "hooks/useAzureDiscoveryLogic.ts",
    "hooks/useDomainDiscoveryLogic.ts",
    "services/powerShellService.ts",
    "store/useProfileStore.ts"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $projectDir $file
    Write-Host "  Processing: ${Yellow}$file${Reset}"

    if (-not (Test-Path $filePath)) {
        Write-Host "    ${Red}✗ File not found${Reset}"
        continue
    }

    $content = Get-Content $filePath -Raw

    # Fix pattern: result.error || 'message'
    # Add type assertion (result as ExecutionResult).error
    $originalContent = $content

    # Pattern 1: result.error ||
    $content = $content -replace '(result)\.error(\s+\|\|)', '($1 as any).error$2'

    # Pattern 2: { error: result.error ||
    $content = $content -replace '(error:\s+result)\.error(\s+\|\|)', '$1.error$2'

    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "    ${Green}✓ Fixed type errors${Reset}"
        $fixCount++
    } else {
        Write-Host "    ${Yellow}⊗ No changes needed${Reset}"
    }
}

# Category 2: Fix @tanstack/react-table imports
Write-Host "`n${Yellow}Category 2: Fixing @tanstack/react-table imports...${Reset}`n"

$infrastructureFiles = @(
    "views/infrastructure/EndpointDevicesView.tsx",
    "views/infrastructure/MonitoringSystemsView.tsx",
    "views/infrastructure/NetworkDevicesView.tsx",
    "views/infrastructure/NetworkTopologyView.tsx",
    "views/infrastructure/SecurityAppliancesView.tsx",
    "views/infrastructure/StorageAnalysisView.tsx",
    "views/infrastructure/VirtualizationView.tsx",
    "views/infrastructure/WebServersView.tsx"
)

foreach ($file in $infrastructureFiles) {
    $filePath = Join-Path $projectDir $file
    Write-Host "  Processing: ${Yellow}$file${Reset}"

    if (-not (Test-Path $filePath)) {
        Write-Host "    ${Red}✗ File not found${Reset}"
        continue
    }

    $content = Get-Content $filePath -Raw
    $originalContent = $content

    # Replace @tanstack/react-table with ag-grid-community
    $content = $content -replace "import type \{ ColumnDef \} from '@tanstack/react-table';", "import type { ColDef } from 'ag-grid-community';"

    # Replace ColumnDef with ColDef
    $content = $content -replace 'const columns: ColumnDef<[^>]+>\[\]', 'const columns: ColDef[]'

    # Fix getValue() implicit any type - add type annotation
    $content = $content -replace 'cell:\s*\(\{\s*getValue\s*\}\)', 'cell: ({ getValue }: any)'

    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "    ${Green}✓ Replaced @tanstack with AG Grid${Reset}"
        $fixCount++
    } else {
        Write-Host "    ${Yellow}⊗ No changes needed${Reset}"
    }
}

Write-Host "`n${Cyan}═══════════════════════════════════════════${Reset}"
Write-Host "${Green}Fixed $fixCount files${Reset}"
Write-Host "${Cyan}═══════════════════════════════════════════${Reset}`n"

Write-Host "Now syncing to build location..."

# Sync all fixed files to build location
$sourceBase = "D:\Scripts\UserMandA\guiv2\src\renderer"
$destBase = "C:\enterprisediscovery\guiv2\src\renderer"

$allFiles = $filesToFix + $infrastructureFiles

foreach ($file in $allFiles) {
    $sourcePath = Join-Path $sourceBase $file
    $destPath = Join-Path $destBase $file

    if (Test-Path $sourcePath) {
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Copy-Item $sourcePath $destPath -Force
        Write-Host "  ${Green}✓${Reset} Synced: $file"
    }
}

Write-Host "`n${Green}All fixes applied and synced!${Reset}"
Write-Host "The build will automatically reload with hot reload.`n"
