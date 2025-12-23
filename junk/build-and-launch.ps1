# Build and Launch Electron App
# This script builds all THREE webpack bundles and launches the app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILDING ELECTRON APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$deploymentDir = "C:\enterprisediscovery\guiv2"

# Check if deployment directory exists
if (-not (Test-Path $deploymentDir)) {
    Write-Host "[X] Deployment directory not found: $deploymentDir" -ForegroundColor Red
    Write-Host "Please ensure the app is set up in the deployment directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/6] Navigating to deployment directory..." -ForegroundColor Yellow
Set-Location $deploymentDir
Write-Host "      Current directory: $(Get-Location)" -ForegroundColor Gray

Write-Host ""
Write-Host "[2/6] Killing any running Electron processes..." -ForegroundColor Yellow
$electronProcesses = Get-Process -Name electron -ErrorAction SilentlyContinue
if ($electronProcesses) {
    $electronProcesses | Stop-Process -Force
    Write-Host "      Killed $($electronProcesses.Count) Electron process(es)" -ForegroundColor Green
} else {
    Write-Host "      No Electron processes running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[3/6] Building MAIN process bundle..." -ForegroundColor Yellow
npm run build:main
if ($LASTEXITCODE -ne 0) {
    Write-Host "      [X] Main process build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      [OK] Main process built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[4/6] Building PRELOAD script bundle..." -ForegroundColor Yellow
npx webpack --config webpack.preload.config.js --mode=production
if ($LASTEXITCODE -ne 0) {
    Write-Host "      [X] Preload script build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      [OK] Preload script built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Building RENDERER process bundle..." -ForegroundColor Yellow
npm run build:renderer
if ($LASTEXITCODE -ne 0) {
    Write-Host "      [X] Renderer process build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      [OK] Renderer process built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[6/6] Verifying webpack bundles..." -ForegroundColor Yellow

$requiredFiles = @{
    "Main" = ".webpack\main\main.js"
    "Preload" = ".webpack\preload\index.js"
    "Renderer HTML" = ".webpack\renderer\main_window\index.html"
    "Renderer JS" = ".webpack\renderer\main_window\index.js"
}

$allFilesExist = $true
foreach ($file in $requiredFiles.GetEnumerator()) {
    $filePath = Join-Path $deploymentDir $file.Value
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        Write-Host "      [OK] $($file.Key): $($file.Value) ($([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "      [X] $($file.Key): $($file.Value) - MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "[X] Some webpack bundles are missing! Cannot launch app." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETE - LAUNCHING APP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in this window to stop the app when done testing." -ForegroundColor Yellow
Write-Host ""

# Launch the app
npm start
