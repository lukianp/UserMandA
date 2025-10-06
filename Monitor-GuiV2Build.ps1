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
    .\Monitor-GuiV2Build.ps1
    Builds and monitors GUI v2 with full error collection

.EXAMPLE
    .\Monitor-GuiV2Build.ps1 -SkipBuild
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

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   M&A Discovery Suite - GUI v2 Build & Debug Monitor     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to log errors
function Add-Error {
    param(
        [string]$Category,
        [string]$Message,
        [string]$Source = "",
        [string]$Severity = "Error"
    )

    $entry = @{
        Category = $Category
        Message = $Message
        Source = $Source
        Severity = $Severity
        Timestamp = Get-Date -Format "HH:mm:ss"
    }

    switch ($Category) {
        "Build" { $Global:ErrorCollection.BuildErrors += $entry }
        "TypeScript" { $Global:ErrorCollection.TypeScriptErrors += $entry }
        "Runtime" { $Global:ErrorCollection.RuntimeErrors += $entry }
        "Console" { $Global:ErrorCollection.ConsoleErrors += $entry }
        default { $Global:ErrorCollection.Warnings += $entry }
    }
}

# Function to save errors to markdown
function Save-ErrorsToMarkdown {
    $content = @"
# GUI v2 Build & Runtime Errors
**Generated:** $($Global:ErrorCollection.Timestamp)
**Total Errors:** $($Global:ErrorCollection.BuildErrors.Count + $Global:ErrorCollection.TypeScriptErrors.Count + $Global:ErrorCollection.RuntimeErrors.Count + $Global:ErrorCollection.ConsoleErrors.Count)
**Total Warnings:** $($Global:ErrorCollection.Warnings.Count)

---

"@

    # Build Errors
    if ($Global:ErrorCollection.BuildErrors.Count -gt 0) {
        $content += "## 🔴 Build Errors ($($Global:ErrorCollection.BuildErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.BuildErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "``````n$($err.Message)`n``````n`n"
        }
    }

    # TypeScript Errors
    if ($Global:ErrorCollection.TypeScriptErrors.Count -gt 0) {
        $content += "## 🟠 TypeScript Errors ($($Global:ErrorCollection.TypeScriptErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.TypeScriptErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "``````typescript`n$($err.Message)`n``````n`n"
        }
    }

    # Runtime Errors
    if ($Global:ErrorCollection.RuntimeErrors.Count -gt 0) {
        $content += "## 🔴 Runtime Errors ($($Global:ErrorCollection.RuntimeErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.RuntimeErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "``````javascript`n$($err.Message)`n``````n`n"
        }
    }

    # Console Errors
    if ($Global:ErrorCollection.ConsoleErrors.Count -gt 0) {
        $content += "## ⚠️ Console Errors ($($Global:ErrorCollection.ConsoleErrors.Count))`n`n"
        foreach ($err in $Global:ErrorCollection.ConsoleErrors) {
            $content += "### [$($err.Timestamp)] $($err.Source)`n"
            $content += "``````n$($err.Message)`n``````n`n"
        }
    }

    # Warnings
    if ($Global:ErrorCollection.Warnings.Count -gt 0) {
        $content += "## ⚡ Warnings ($($Global:ErrorCollection.Warnings.Count))`n`n"
        foreach ($warn in $Global:ErrorCollection.Warnings) {
            $content += "- **[$($warn.Timestamp)]** $($warn.Source): $($warn.Message)`n"
        }
    }

    $content += @"

---

## 🔧 Next Steps

1. **Fix Build Errors First** - These prevent compilation
2. **Fix TypeScript Errors** - Type safety issues
3. **Fix Runtime Errors** - Application crashes
4. **Review Warnings** - Potential issues

## 📊 Error Summary

| Category | Count |
|----------|-------|
| Build Errors | $($Global:ErrorCollection.BuildErrors.Count) |
| TypeScript Errors | $($Global:ErrorCollection.TypeScriptErrors.Count) |
| Runtime Errors | $($Global:ErrorCollection.RuntimeErrors.Count) |
| Console Errors | $($Global:ErrorCollection.ConsoleErrors.Count) |
| Warnings | $($Global:ErrorCollection.Warnings.Count) |

**Run again:** ``.\Monitor-GuiV2Build.ps1``
"@

    Set-Content -Path $ErrorLogPath -Value $content -Encoding UTF8
    Write-Host "[✓] Errors saved to: $ErrorLogPath" -ForegroundColor Green
}

# STEP 1: BUILD
if (-not $SkipBuild) {
    Write-Host "═══ STEP 1: BUILDING APPLICATION ═══" -ForegroundColor Yellow
    Write-Host ""

    if (!(Test-Path $BuildScript)) {
        Write-Host "[✗] Build script not found: $BuildScript" -ForegroundColor Red
        exit 1
    }

    Write-Host "[→] Running buildguiv2.ps1 (Configuration: $Configuration)..." -ForegroundColor Cyan
    Write-Host "[→] Capturing all output to: $BuildLogPath" -ForegroundColor Gray
    Write-Host ""

    # Run build and capture output
    $buildOutput = & $BuildScript -Configuration $Configuration -SkipTests 2>&1 | Tee-Object -FilePath $BuildLogPath

    # Parse build output for errors
    foreach ($line in $buildOutput) {
        $lineStr = $line.ToString()

        # Detect build errors
        if ($lineStr -match "error|failed|exception" -and $lineStr -notmatch "0 errors") {
            Add-Error -Category "Build" -Message $lineStr -Source "buildguiv2.ps1"
            Write-Host "  [BUILD ERROR] $lineStr" -ForegroundColor Red
        }
        # Detect TypeScript errors
        elseif ($lineStr -match "TS\d{4}:") {
            Add-Error -Category "TypeScript" -Message $lineStr -Source "TypeScript Compiler"
            Write-Host "  [TS ERROR] $lineStr" -ForegroundColor DarkYellow
        }
        # Detect warnings
        elseif ($lineStr -match "warning") {
            Add-Error -Category "Warning" -Message $lineStr -Source "Build Process"
            Write-Host "  [WARNING] $lineStr" -ForegroundColor Yellow
        }
        # Normal output
        elseif ($lineStr -match "\[OK\]") {
            Write-Host "  $lineStr" -ForegroundColor Green
        }
        else {
            Write-Host "  $lineStr" -ForegroundColor Gray
        }
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[✗] Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Save-ErrorsToMarkdown
        Write-Host ""
        Write-Host "[→] Review errors in: $ErrorLogPath" -ForegroundColor Cyan
        exit 1
    }

    Write-Host ""
    Write-Host "[✓] Build completed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "═══ SKIPPING BUILD (Using existing build) ═══" -ForegroundColor Yellow
    Write-Host ""
}

# STEP 2: PRE-LAUNCH CHECKS
Write-Host "═══ STEP 2: PRE-LAUNCH VERIFICATION ═══" -ForegroundColor Yellow
Write-Host ""

# Check if output directory exists
if (!(Test-Path $OutputPath)) {
    Write-Host "[✗] Output directory not found: $OutputPath" -ForegroundColor Red
    Write-Host "[→] Run build first: .\buildguiv2.ps1" -ForegroundColor Cyan
    exit 1
}

# Check critical files
$criticalFiles = @(
    "package.json",
    ".webpack\main\index.js",
    ".webpack\renderer\main_window\index.html"
)

foreach ($file in $criticalFiles) {
    $filePath = Join-Path $OutputPath $file
    if (Test-Path $filePath) {
        Write-Host "[✓] $file" -ForegroundColor Green
    } else {
        Write-Host "[✗] Missing: $file" -ForegroundColor Red
        Add-Error -Category "Build" -Message "Missing critical file: $file" -Source "Pre-Launch Check"
    }
}

Write-Host ""

# Check Node.js
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "[✓] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js not found" -ForegroundColor Red
    Add-Error -Category "Build" -Message "Node.js not found in PATH" -Source "Environment Check"
}

Write-Host ""

# STEP 3: LAUNCH APPLICATION
Write-Host "═══ STEP 3: LAUNCHING APPLICATION ═══" -ForegroundColor Yellow
Write-Host ""

Push-Location $OutputPath

Write-Host "[→] Starting Electron application..." -ForegroundColor Cyan
Write-Host "[→] Monitoring console output for errors..." -ForegroundColor Gray
Write-Host "[→] Press Ctrl+C to stop monitoring" -ForegroundColor Gray
Write-Host ""
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Create a debug environment with detailed logging
$env:DEBUG = "true"
$env:NODE_ENV = "development"
$env:ELECTRON_ENABLE_LOGGING = "1"

# Start the application and monitor output
$process = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow -RedirectStandardOutput "$ScriptDir\app-stdout.log" -RedirectStandardError "$ScriptDir\app-stderr.log"

Write-Host "[✓] Application launched (PID: $($process.Id))" -ForegroundColor Green
Write-Host ""

# Monitor log files in real-time
$stdoutLog = "$ScriptDir\app-stdout.log"
$stderrLog = "$ScriptDir\app-stderr.log"
$lastStdoutLine = 0
$lastStderrLine = 0

Write-Host "═══ LIVE CONSOLE OUTPUT ═══" -ForegroundColor Magenta
Write-Host ""

# Monitor for 60 seconds or until process exits
$startTime = Get-Date
$timeout = 300 # 5 minutes

while (-not $process.HasExited -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
    # Read new lines from stdout
    if (Test-Path $stdoutLog) {
        $stdoutLines = Get-Content $stdoutLog -ErrorAction SilentlyContinue
        if ($stdoutLines -and $stdoutLines.Count -gt $lastStdoutLine) {
            for ($i = $lastStdoutLine; $i -lt $stdoutLines.Count; $i++) {
                $line = $stdoutLines[$i]

                if ($line -match "error" -or $line -match "failed") {
                    Write-Host "  [ERROR] $line" -ForegroundColor Red
                    Add-Error -Category "Runtime" -Message $line -Source "Electron Console"
                } elseif ($line -match "warning") {
                    Write-Host "  [WARN] $line" -ForegroundColor Yellow
                    Add-Error -Category "Warning" -Message $line -Source "Electron Console"
                } elseif ($line -match "info") {
                    Write-Host "  [INFO] $line" -ForegroundColor Cyan
                } else {
                    Write-Host "  $line" -ForegroundColor Gray
                }
            }
            $lastStdoutLine = $stdoutLines.Count
        }
    }

    # Read new lines from stderr
    if (Test-Path $stderrLog) {
        $stderrLines = Get-Content $stderrLog -ErrorAction SilentlyContinue
        if ($stderrLines -and $stderrLines.Count -gt $lastStderrLine) {
            for ($i = $lastStderrLine; $i -lt $stderrLines.Count; $i++) {
                $line = $stderrLines[$i]
                Write-Host "  [STDERR] $line" -ForegroundColor Red
                Add-Error -Category "Console" -Message $line -Source "Electron stderr"
            }
            $lastStderrLine = $stderrLines.Count
        }
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Check if process exited
if ($process.HasExited) {
    if ($process.ExitCode -eq 0) {
        Write-Host "[✓] Application exited normally" -ForegroundColor Green
    } else {
        Write-Host "[✗] Application crashed with exit code: $($process.ExitCode)" -ForegroundColor Red
        Add-Error -Category "Runtime" -Message "Application crashed with exit code $($process.ExitCode)" -Source "Electron Process"
    }
} else {
    Write-Host "[→] Application still running after $timeout seconds" -ForegroundColor Cyan
    Write-Host "[→] Check the application window for UI errors" -ForegroundColor Cyan
}

Pop-Location

# STEP 4: SAVE RESULTS
Write-Host ""
Write-Host "═══ STEP 4: SAVING ERROR REPORT ═══" -ForegroundColor Yellow
Write-Host ""

Save-ErrorsToMarkdown

# Display summary
$totalErrors = $Global:ErrorCollection.BuildErrors.Count +
               $Global:ErrorCollection.TypeScriptErrors.Count +
               $Global:ErrorCollection.RuntimeErrors.Count +
               $Global:ErrorCollection.ConsoleErrors.Count

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ERROR SUMMARY                          ║" -ForegroundColor Cyan
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Build Errors:      $($Global:ErrorCollection.BuildErrors.Count.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($Global:ErrorCollection.BuildErrors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "║  TypeScript Errors: $($Global:ErrorCollection.TypeScriptErrors.Count.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($Global:ErrorCollection.TypeScriptErrors.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "║  Runtime Errors:    $($Global:ErrorCollection.RuntimeErrors.Count.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($Global:ErrorCollection.RuntimeErrors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "║  Console Errors:    $($Global:ErrorCollection.ConsoleErrors.Count.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($Global:ErrorCollection.ConsoleErrors.Count -gt 0) { "Red" } else { "Green" })
Write-Host "║  Warnings:          $($Global:ErrorCollection.Warnings.Count.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($Global:ErrorCollection.Warnings.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  TOTAL ERRORS:      $($totalErrors.ToString().PadLeft(3))                                  ║" -ForegroundColor $(if ($totalErrors -gt 0) { "Red" } else { "Green" })
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($totalErrors -gt 0) {
    Write-Host "[→] Review detailed errors in: $ErrorLogPath" -ForegroundColor Cyan
    Write-Host "[→] Fix errors and run again: .\Monitor-GuiV2Build.ps1" -ForegroundColor Cyan
} else {
    Write-Host "[✓] No errors detected! Application is running successfully." -ForegroundColor Green
}

Write-Host ""
Write-Host "Logs saved to:" -ForegroundColor Gray
Write-Host "  - Build Output: $BuildLogPath" -ForegroundColor White
Write-Host "  - Error Report: $ErrorLogPath" -ForegroundColor White
Write-Host "  - App stdout: $ScriptDir\app-stdout.log" -ForegroundColor White
Write-Host "  - App stderr: $ScriptDir\app-stderr.log" -ForegroundColor White
Write-Host ""
