#Requires -Version 5.1

<#
.SYNOPSIS
    Monitors GUI v2 build, launch, and runtime with automatic error collection

.DESCRIPTION
    This script:
    1. Runs buildguiv2.ps1 and captures all output
    2. Launches the application from C:\enterprisediscovery\guiv2
    3. Monitors Electron console logs in real-time
    4. Collects all errors into ERRORS.md for later fixing
    5. Provides live feedback with color-coded output

.PARAMETER SkipBuild
    Skip the build step and go straight to monitoring

.PARAMETER Configuration
    Build configuration: Development or Production (default: Development for debugging)

.EXAMPLE
    .\Monitor-GuiV2Build-Fixed.ps1
    Builds and monitors GUI v2 with full error collection

.EXAMPLE
    .\Monitor-GuiV2Build-Fixed.ps1 -SkipBuild
    Skip build and just monitor an already-built application
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,

    [Parameter(Mandatory = $false)]
    [ValidateSet('Development', 'Production')]
    [string]$Configuration = 'Development'
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Continue' # Don't stop on errors, we want to collect them

# Setup paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BuildScript = Join-Path $ScriptDir "buildguiv2.ps1"
$OutputPath = "C:\enterprisediscovery\guiv2"
$ErrorLogPath = Join-Path $ScriptDir "ERRORS.md"
$BuildLogPath = Join-Path $ScriptDir "build-output.log"

# Initialize error collection
$Global:ErrorCollection = @{
    BuildErrors = @()
    TypeScriptErrors = @()
    RuntimeErrors = @()
    ConsoleErrors = @()
    Warnings = @()
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

# Helper function to add errors
function Add-Error {
    param(
        [string]$Category,
        [string]$Message,
        [string]$Source = "Unknown"
    )

    $errorEntry = @{
        Timestamp = Get-Date -Format "HH:mm:ss"
        Source = $Source
        Message = $Message
    }

    switch ($Category) {
        "Build" { $Global:ErrorCollection.BuildErrors += $errorEntry }
        "TypeScript" { $Global:ErrorCollection.TypeScriptErrors += $errorEntry }
        "Runtime" { $Global:ErrorCollection.RuntimeErrors += $errorEntry }
        "Console" { $Global:ErrorCollection.ConsoleErrors += $errorEntry }
        "Warning" { $Global:ErrorCollection.Warnings += $errorEntry }
    }
}

# Function to save errors to markdown
function Save-ErrorsToMarkdown {
    $totalErrors = $Global:ErrorCollection.BuildErrors.Count +
                   $Global:ErrorCollection.TypeScriptErrors.Count +
                   $Global:ErrorCollection.RuntimeErrors.Count +
                   $Global:ErrorCollection.ConsoleErrors.Count

    $content = "# GUI v2 Build & Runtime Errors`n"
    $content += "**Generated:** $($Global:ErrorCollection.Timestamp)`n"
    $content += "**Total Errors:** $totalErrors`n"
    $content += "**Total Warnings:** $($Global:ErrorCollection.Warnings.Count)`n`n"
    $content += "---`n`n"

    # Build Errors
    if ($Global:ErrorCollection.BuildErrors.Count -gt 0) {
        $content += "## Build Errors ($($Global:ErrorCollection.BuildErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.BuildErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "````````n$($err.Message)`n````````n`n"
        }
    }

    # TypeScript Errors
    if ($Global:ErrorCollection.TypeScriptErrors.Count -gt 0) {
        $content += "## TypeScript Errors ($($Global:ErrorCollection.TypeScriptErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.TypeScriptErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "````typescript`n$($err.Message)`n````````n`n"
        }
    }

    # Runtime Errors
    if ($Global:ErrorCollection.RuntimeErrors.Count -gt 0) {
        $content += "## Runtime Errors ($($Global:ErrorCollection.RuntimeErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.RuntimeErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "````javascript`n$($err.Message)`n````````n`n"
        }
    }

    # Console Errors
    if ($Global:ErrorCollection.ConsoleErrors.Count -gt 0) {
        $content += "## Console Errors ($($Global:ErrorCollection.ConsoleErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.ConsoleErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "````````n$($err.Message)`n````````n`n"
        }
    }

    # Warnings
    if ($Global:ErrorCollection.Warnings.Count -gt 0) {
        $content += "## Warnings ($($Global:ErrorCollection.Warnings.Count))`n`n"
        foreach ($warn in $Global:ErrorCollection.Warnings) {
            $content += "- **[$($warn.Timestamp)]** $($warn.Source): $($warn.Message)`n"
        }
    }

    $content += "`n---`n`n"
    $content += "## Next Steps`n`n"
    $content += "1. Fix Build Errors First - These prevent compilation`n"
    $content += "2. Fix TypeScript Errors - Type safety issues`n"
    $content += "3. Fix Runtime Errors - Application crashes`n"
    $content += "4. Review Warnings - Potential issues`n`n"

    $content += "## Error Summary`n`n"
    $content += "| Category | Count |`n"
    $content += "|----------|-------|`n"
    $content += "| Build Errors | $($Global:ErrorCollection.BuildErrors.Count) |`n"
    $content += "| TypeScript Errors | $($Global:ErrorCollection.TypeScriptErrors.Count) |`n"
    $content += "| Runtime Errors | $($Global:ErrorCollection.RuntimeErrors.Count) |`n"
    $content += "| Console Errors | $($Global:ErrorCollection.ConsoleErrors.Count) |`n"
    $content += "| Warnings | $($Global:ErrorCollection.Warnings.Count) |`n`n"
    $content += "**Run again:** ``.\Monitor-GuiV2Build-Fixed.ps1```n"

    $content | Out-File -FilePath $ErrorLogPath -Encoding UTF8
    Write-Host "`n[✓] Errors saved to: $ErrorLogPath" -ForegroundColor Green
}

# Banner
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        GUI v2 BUILD & DEBUG MONITORING SYSTEM         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Build
if (-not $SkipBuild) {
    Write-Host "[1/3] Running buildguiv2.ps1..." -ForegroundColor Yellow

    if (-not (Test-Path $BuildScript)) {
        Write-Host "[✗] Build script not found: $BuildScript" -ForegroundColor Red
        exit 1
    }

    # Run build and capture output
    try {
        $buildOutput = & $BuildScript -Configuration $Configuration 2>&1 | Tee-Object -FilePath $BuildLogPath

        # Parse build output for errors
        $buildOutput | ForEach-Object {
            $line = $_.ToString()
            if ($line -match "error" -and $line -notmatch "0 error") {
                Add-Error -Category "Build" -Message $line -Source "buildguiv2.ps1"
                Write-Host "  [ERROR] $line" -ForegroundColor Red
            }
            elseif ($line -match "warning") {
                Add-Error -Category "Warning" -Message $line -Source "buildguiv2.ps1"
                Write-Host "  [WARN] $line" -ForegroundColor Yellow
            }
        }

        Write-Host "[✓] Build complete. Log saved to: $BuildLogPath" -ForegroundColor Green
    }
    catch {
        Add-Error -Category "Build" -Message $_.Exception.Message -Source "buildguiv2.ps1"
        Write-Host "[✗] Build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "[SKIP] Build step skipped as requested" -ForegroundColor Cyan
}

# Step 2: Verify build output exists
Write-Host "`n[2/3] Verifying build output..." -ForegroundColor Yellow

if (-not (Test-Path $OutputPath)) {
    Write-Host "[✗] Output path not found: $OutputPath" -ForegroundColor Red
    Add-Error -Category "Build" -Message "Output directory not found: $OutputPath" -Source "Verification"
    Save-ErrorsToMarkdown
    exit 1
}

$mainBundle = Join-Path $OutputPath ".webpack\main\index.js"
$rendererBundle = Join-Path $OutputPath ".webpack\renderer\main_window\index.html"

if (-not (Test-Path $mainBundle)) {
    Write-Host "[✗] Main bundle not found: $mainBundle" -ForegroundColor Red
    Add-Error -Category "Build" -Message "Main bundle missing: $mainBundle" -Source "Verification"
}

if (-not (Test-Path $rendererBundle)) {
    Write-Host "[✗] Renderer bundle not found: $rendererBundle" -ForegroundColor Red
    Add-Error -Category "Build" -Message "Renderer bundle missing: $rendererBundle" -Source "Verification"
}

if ((Test-Path $mainBundle) -and (Test-Path $rendererBundle)) {
    Write-Host "[✓] Build output verified" -ForegroundColor Green
}

# Step 3: Launch and monitor
Write-Host "`n[3/3] Launching application and monitoring..." -ForegroundColor Yellow

# Stop any existing Electron processes
Get-Process | Where-Object { $_.ProcessName -eq "electron" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Setup log files
$stdoutLog = Join-Path $ScriptDir "app-stdout.log"
$stderrLog = Join-Path $ScriptDir "app-stderr.log"

# Launch application
try {
    Push-Location $OutputPath

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "npm"
    $processInfo.Arguments = "start"
    $processInfo.WorkingDirectory = $OutputPath
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $false

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo

    # Event handlers for real-time output
    $stdoutHandler = {
        param($sender, $e)
        if (-not [string]::IsNullOrEmpty($e.Data)) {
            $line = $e.Data
            $line | Out-File -FilePath $stdoutLog -Append -Encoding UTF8

            # Categorize and display
            if ($line -match "error" -or $line -match "ERROR") {
                Write-Host "  [ERROR] $line" -ForegroundColor Red
                Add-Error -Category "Runtime" -Message $line -Source "Electron Console"
            }
            elseif ($line -match "warning" -or $line -match "WARN") {
                Write-Host "  [WARN] $line" -ForegroundColor Yellow
                Add-Error -Category "Warning" -Message $line -Source "Electron Console"
            }
            elseif ($line -match "TypeScript" -or $line -match "TS\d+:") {
                Write-Host "  [TS] $line" -ForegroundColor Magenta
                Add-Error -Category "TypeScript" -Message $line -Source "Electron Console"
            }
            else {
                Write-Host "  [INFO] $line" -ForegroundColor Gray
            }
        }
    }

    $stderrHandler = {
        param($sender, $e)
        if (-not [string]::IsNullOrEmpty($e.Data)) {
            $line = $e.Data
            $line | Out-File -FilePath $stderrLog -Append -Encoding UTF8
            Write-Host "  [STDERR] $line" -ForegroundColor Red
            Add-Error -Category "Runtime" -Message $line -Source "Electron stderr"
        }
    }

    $process.add_OutputDataReceived($stdoutHandler)
    $process.add_ErrorDataReceived($stderrHandler)

    Write-Host "`n[✓] Starting Electron application..." -ForegroundColor Green
    Write-Host "[i] Monitoring for 5 minutes. Press Ctrl+C to stop early.`n" -ForegroundColor Cyan

    $null = $process.Start()
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()

    # Monitor for 5 minutes or until process exits
    $timeout = 300 # 5 minutes
    $startTime = Get-Date

    while (-not $process.HasExited -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
        Start-Sleep -Milliseconds 500
    }

    if ($process.HasExited) {
        Write-Host "`n[!] Application exited with code: $($process.ExitCode)" -ForegroundColor Yellow
        if ($process.ExitCode -ne 0) {
            Add-Error -Category "Runtime" -Message "Application exited with code $($process.ExitCode)" -Source "Electron Process"
        }
    }
    else {
        Write-Host "`n[✓] Monitoring timeout reached (5 minutes)" -ForegroundColor Green
        $process.Kill()
    }
}
catch {
    Write-Host "`n[✗] Failed to launch application: $($_.Exception.Message)" -ForegroundColor Red
    Add-Error -Category "Runtime" -Message $_.Exception.Message -Source "Application Launch"
}
finally {
    Pop-Location
}

# Step 4: Save errors and display summary
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ERROR SUMMARY                          ║" -ForegroundColor Cyan
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Build Errors:        $($Global:ErrorCollection.BuildErrors.Count.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($Global:ErrorCollection.BuildErrors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "║  TypeScript Errors:   $($Global:ErrorCollection.TypeScriptErrors.Count.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($Global:ErrorCollection.TypeScriptErrors.Count -gt 0) { "Magenta" } else { "Green" })
Write-Host "║  Runtime Errors:      $($Global:ErrorCollection.RuntimeErrors.Count.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($Global:ErrorCollection.RuntimeErrors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "║  Console Errors:      $($Global:ErrorCollection.ConsoleErrors.Count.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($Global:ErrorCollection.ConsoleErrors.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "║  Warnings:            $($Global:ErrorCollection.Warnings.Count.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($Global:ErrorCollection.Warnings.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
$totalErrors = $Global:ErrorCollection.BuildErrors.Count + $Global:ErrorCollection.TypeScriptErrors.Count + $Global:ErrorCollection.RuntimeErrors.Count + $Global:ErrorCollection.ConsoleErrors.Count
Write-Host "║  TOTAL ERRORS:        $($totalErrors.ToString().PadLeft(3))                                   ║" -ForegroundColor $(if ($totalErrors -gt 0) { "Red" } else { "Green" })
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Save-ErrorsToMarkdown

if ($totalErrors -eq 0) {
    Write-Host "[✓] No errors detected! Application is running successfully." -ForegroundColor Green
}
else {
    Write-Host "[!] Found $totalErrors error(s). Check ERRORS.md for details." -ForegroundColor Yellow
}

Write-Host "`nLogs saved to:" -ForegroundColor Cyan
Write-Host "  - Build log:  $BuildLogPath" -ForegroundColor Gray
Write-Host "  - Stdout log: $stdoutLog" -ForegroundColor Gray
Write-Host "  - Stderr log: $stderrLog" -ForegroundColor Gray
Write-Host "  - Error report: $ErrorLogPath`n" -ForegroundColor Gray
