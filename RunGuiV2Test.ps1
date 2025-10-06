# Simple GUI v2 Test Runner
# This script builds and runs GUI v2, collecting errors to ERRORS.md

param(
    [switch]$SkipBuild
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputPath = "C:\enterprisediscovery\guiv2"
$ErrorLog = Join-Path $ScriptDir "ERRORS.md"

# Error collection
$script:Errors = @()
$script:Warnings = @()

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Add-ErrorEntry {
    param([string]$Message, [string]$Type = "Error")
    if ($Type -eq "Error") {
        $script:Errors += $Message
        Write-ColorOutput "ERROR: $Message" "Red"
    } else {
        $script:Warnings += $Message
        Write-ColorOutput "WARN: $Message" "Yellow"
    }
}

# Banner
Write-ColorOutput "`n=== GUI v2 Build and Test ===" "Cyan"

# Step 1: Build
if (-not $SkipBuild) {
    Write-ColorOutput "`nStep 1: Building GUI v2..." "Yellow"

    $buildScript = Join-Path $ScriptDir "buildguiv2.ps1"
    if (Test-Path $buildScript) {
        try {
            $buildOutput = & $buildScript -Configuration Development 2>&1
            $buildOutput | ForEach-Object {
                $line = $_.ToString()
                if ($line -match "error" -and $line -notmatch "0 error") {
                    Add-ErrorEntry $line
                } elseif ($line -match "warning") {
                    Add-ErrorEntry $line "Warning"
                }
            }
            Write-ColorOutput "Build complete" "Green"
        } catch {
            Add-ErrorEntry "Build failed: $($_.Exception.Message)"
        }
    } else {
        Add-ErrorEntry "Build script not found: $buildScript"
    }
} else {
    Write-ColorOutput "Skipping build step" "Cyan"
}

# Step 2: Verify output
Write-ColorOutput "`nStep 2: Verifying build output..." "Yellow"

if (-not (Test-Path $OutputPath)) {
    Add-ErrorEntry "Output directory not found: $OutputPath"
} else {
    $mainJs = Join-Path $OutputPath ".webpack\main\index.js"
    $rendererHtml = Join-Path $OutputPath ".webpack\renderer\main_window\index.html"

    if (-not (Test-Path $mainJs)) {
        Add-ErrorEntry "Main bundle missing: $mainJs"
    }
    if (-not (Test-Path $rendererHtml)) {
        Add-ErrorEntry "Renderer bundle missing: $rendererHtml"
    }

    if ((Test-Path $mainJs) -and (Test-Path $rendererHtml)) {
        Write-ColorOutput "Build output verified" "Green"
    }
}

# Step 3: Launch application
Write-ColorOutput "`nStep 3: Launching application..." "Yellow"

# Kill existing Electron processes
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

# Change to output directory and launch
try {
    Push-Location $OutputPath

    Write-ColorOutput "Starting Electron app (will run for 60 seconds)..." "Cyan"
    Write-ColorOutput "Watch for errors in the console output below...`n" "Cyan"

    # Start npm and capture output
    $process = Start-Process -FilePath "npm" -ArgumentList "start" `
        -WorkingDirectory $OutputPath `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardOutput "stdout.log" `
        -RedirectStandardError "stderr.log"

    # Wait for 60 seconds
    Start-Sleep -Seconds 60

    # Stop the process
    if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
        Write-ColorOutput "`nApplication stopped after 60 seconds" "Yellow"
    } else {
        Write-ColorOutput "`nApplication exited early with code: $($process.ExitCode)" "Red"
        if ($process.ExitCode -ne 0) {
            Add-ErrorEntry "Application crashed with exit code $($process.ExitCode)"
        }
    }

    # Read logs and check for errors
    if (Test-Path "stdout.log") {
        Get-Content "stdout.log" | ForEach-Object {
            if ($_ -match "error|ERROR") {
                Add-ErrorEntry $_
            } elseif ($_ -match "warning|WARN") {
                Add-ErrorEntry $_ "Warning"
            }
        }
    }

    if (Test-Path "stderr.log") {
        Get-Content "stderr.log" | ForEach-Object {
            Add-ErrorEntry $_
        }
    }

} catch {
    Add-ErrorEntry "Failed to launch: $($_.Exception.Message)"
} finally {
    Pop-Location
}

# Step 4: Generate error report
Write-ColorOutput "`n=== ERROR SUMMARY ===" "Cyan"
Write-ColorOutput "Total Errors: $($script:Errors.Count)" $(if ($script:Errors.Count -gt 0) { "Red" } else { "Green" })
Write-ColorOutput "Total Warnings: $($script:Warnings.Count)" $(if ($script:Warnings.Count -gt 0) { "Yellow" } else { "Green" })

# Save to markdown
$content = "# GUI v2 Test Results`n`n"
$content += "**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$content += "**Total Errors:** $($script:Errors.Count)`n"
$content += "**Total Warnings:** $($script:Warnings.Count)`n`n"
$content += "---`n`n"

if ($script:Errors.Count -gt 0) {
    $content += "## Errors`n`n"
    foreach ($err in $script:Errors) {
        $content += "- $err`n"
    }
    $content += "`n"
}

if ($script:Warnings.Count -gt 0) {
    $content += "## Warnings`n`n"
    foreach ($warn in $script:Warnings) {
        $content += "- $warn`n"
    }
    $content += "`n"
}

$content += "---`n`n"
$content += "**Next Steps:**`n"
$content += "1. Fix critical errors first`n"
$content += "2. Address TypeScript issues`n"
$content += "3. Review warnings`n"

$content | Out-File -FilePath $ErrorLog -Encoding UTF8

Write-ColorOutput "`nError report saved to: $ErrorLog" "Green"

if ($script:Errors.Count -eq 0) {
    Write-ColorOutput "`nSUCCESS: No errors detected!" "Green"
} else {
    Write-ColorOutput "`nFAILED: Found $($script:Errors.Count) error(s)" "Red"
}

Write-ColorOutput "`nDone.`n" "Cyan"
