# Cleanup Script - Move old files to junk folder
$junk = "D:\Scripts\UserMandA\junk"
$root = "D:\Scripts\UserMandA"

Write-Host "=== Moving old files to junk ===" -ForegroundColor Cyan

# 1. Old fix/test scripts in root
$oldScripts = @(
    'add-graph-disconnect.ps1',
    'apply-powershell-dialog-fixes.ps1',
    'apply-powershell-dialog-integration.ps1',
    'build-and-launch.ps1',
    'compare-hooks.ps1',
    'deploy-credential-fixes.ps1',
    'fix-activedirectory-credentials.ps1',
    'fix-activedirectory-credentials-v2.ps1',
    'fix-date-timestamps.ps1',
    'fix-discovery-modules.ps1',
    'fix-timestamp-errors.ps1',
    'make-all-discoveries-consistent.ps1',
    'scan-all-discovery-modules.ps1',
    'test-onedrive-credential-extraction.ps1',
    'update-infrastructure-hooks.ps1',
    'validate-onedrive-module.ps1',
    'verify-activedirectory-changes.ps1',
    'verify-and-deploy-all-fixes.ps1',
    'run-demo.bat',
    'QuickStart.ps1'
)

Write-Host "`n[1/6] Moving old scripts..." -ForegroundColor Yellow
foreach ($f in $oldScripts) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Move-Item $path $junk -Force
        Write-Host "  Moved: $f" -ForegroundColor Gray
    }
}

# 2. Old WPF/launcher files
$oldWpfFiles = @(
    'App.xaml',
    'MandADiscoverySuite.deps.json',
    'MandADiscoverySuite.dll',
    'MandADiscoverySuite.exe',
    'MandADiscoverySuite.pdb',
    'MandADiscoverySuite.runtimeconfig.json',
    'MandADiscoverySuite.xaml',
    'Launch-MandADiscoverySuite.bat'
)

Write-Host "`n[2/6] Moving old WPF files..." -ForegroundColor Yellow
foreach ($f in $oldWpfFiles) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Move-Item $path $junk -Force
        Write-Host "  Moved: $f" -ForegroundColor Gray
    }
}

# 3. All DLLs in root
Write-Host "`n[3/6] Moving DLL files..." -ForegroundColor Yellow
$dlls = Get-ChildItem "$root\*.dll" -ErrorAction SilentlyContinue
foreach ($dll in $dlls) {
    Move-Item $dll.FullName $junk -Force
    Write-Host "  Moved: $($dll.Name)" -ForegroundColor Gray
}
Write-Host "  Total DLLs moved: $($dlls.Count)" -ForegroundColor Green

# 4. Old screenshots and icons
$oldImages = @(
    'quest_features.png',
    'quest_screenshot.png',
    'quest_screenshot_features.png',
    'quest_screenshot_main.png',
    'quest_screenshot2.png',
    'quest_screenshot3.png',
    'app.ico'
)

Write-Host "`n[4/6] Moving old images..." -ForegroundColor Yellow
foreach ($f in $oldImages) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Move-Item $path $junk -Force
        Write-Host "  Moved: $f" -ForegroundColor Gray
    }
}

# 5. Old directories
$oldDirs = @(
    'GUI',
    'Configuration',
    'Controls',
    'Core',
    'Resources',
    'Styles',
    'Themes',
    'Views',
    'obj',
    'packages',
    'runtimes',
    'temp',
    'Tools',
    'plans',
    'nul',
    'DemoPackage'
)

Write-Host "`n[5/6] Moving old directories..." -ForegroundColor Yellow
foreach ($d in $oldDirs) {
    $path = Join-Path $root $d
    if (Test-Path $path) {
        Move-Item $path $junk -Force
        Write-Host "  Moved: $d/" -ForegroundColor Gray
    }
}

# 6. Old demo zips
$oldZips = @(
    'enterprise-discovery-demo.zip',
    'enterprise-discovery-demo-final.zip'
)

Write-Host "`n[6/6] Moving old demo zips..." -ForegroundColor Yellow
foreach ($f in $oldZips) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Move-Item $path $junk -Force
        Write-Host "  Moved: $f" -ForegroundColor Gray
    }
}

# 7. Move root node_modules (guiv2 has its own)
if (Test-Path "$root\node_modules") {
    Write-Host "`nMoving root node_modules (guiv2 has its own)..." -ForegroundColor Yellow
    Move-Item "$root\node_modules" $junk -Force
    Write-Host "  Moved: node_modules/" -ForegroundColor Gray
}

# 8. Clean up Scripts folder
Write-Host "`nCleaning Scripts folder..." -ForegroundColor Yellow
$scriptsJunk = Join-Path $junk "Scripts_old"
New-Item -ItemType Directory -Path $scriptsJunk -Force | Out-Null

$scriptsToMove = @(
    'apply_complete_fix.ps1',
    'fix_complete_method.ps1',
    'DiscoveryModuleLauncher.ps1.backup',
    'Fix-AppRegistrationScript.ps1',
    'Fix-CommentBlock.ps1',
    'Fix-Emojis.bat',
    'Fix-Emojis.ps1',
    'FixHardCodedColors.ps1',
    'Fix-ModuleConflicts.ps1',
    'MandADiscovery_Registration_Log.txt',
    'MandADiscovery_Registration_Log_metrics.json',
    'Purviewtest.ps1',
    'PurviewRecover.ps1'
)

foreach ($f in $scriptsToMove) {
    $path = Join-Path "$root\Scripts" $f
    if (Test-Path $path) {
        Move-Item $path $scriptsJunk -Force
        Write-Host "  Moved: Scripts/$f" -ForegroundColor Gray
    }
}

# Move test scripts
Get-ChildItem "$root\Scripts\Test-*.ps1" -ErrorAction SilentlyContinue | ForEach-Object {
    Move-Item $_.FullName $scriptsJunk -Force
    Write-Host "  Moved: Scripts/$($_.Name)" -ForegroundColor Gray
}
Get-ChildItem "$root\Scripts\test-*.ps1" -ErrorAction SilentlyContinue | ForEach-Object {
    Move-Item $_.FullName $scriptsJunk -Force
    Write-Host "  Moved: Scripts/$($_.Name)" -ForegroundColor Gray
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "Files moved to: $junk" -ForegroundColor White
Write-Host "See MOVED_FILES_MANIFEST.md for restore instructions" -ForegroundColor White
