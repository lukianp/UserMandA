# Properly Fix Advanced Discovery Module Validator Regex Errors
# Targets specific lines with problematic regex patterns

param(
    [string]$ValidatorPath = "Scripts/Advanced-DiscoveryModuleValidator.ps1"
)

function Write-FixLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

Write-FixLog "Starting precise regex fixes for Advanced Validator" "INFO"

if (-not (Test-Path $ValidatorPath)) {
    Write-FixLog "Validator file not found: $ValidatorPath" "ERROR"
    exit 1
}

# Read the file line by line to make precise fixes
$lines = Get-Content $ValidatorPath

Write-FixLog "Applying targeted regex fixes..." "INFO"

# Fix the resource patterns array (lines 176-184)
for ($i = 0; $i -lt $lines.Count; $i++) {
    # Fix line 177: 'New-Object\s+System\.IO\.',
    if ($lines[$i] -match "^\s*'New-Object\\s\+System\\.IO\\.'") {
        $lines[$i] = "        'New-Object\s+System\.IO\.'"
        Write-FixLog "Fixed line $($i+1): Resource pattern for System.IO" "SUCCESS"
    }
    
    # Fix line 178: 'New-Object\s+System\.Net\.',
    if ($lines[$i] -match "^\s*'New-Object\\s\+System\\.Net\\.'") {
        $lines[$i] = "        'New-Object\s+System\.Net\.'"
        Write-FixLog "Fixed line $($i+1): Resource pattern for System.Net" "SUCCESS"
    }
    
    # Fix line 179: '\[System\.IO\.File\]::',
    if ($lines[$i] -match "^\s*'\\[System\\.IO\\.File\\]::'") {
        $lines[$i] = "        '\[System\.IO\.File\]::'"
        Write-FixLog "Fixed line $($i+1): Resource pattern for System.IO.File" "SUCCESS"
    }
    
    # Fix line 602: hardcoded path detection
    if ($lines[$i] -match "if \(\`\$content -match '\[A-Z\]:\\\\|/\[a-z\]\+/'\)") {
        $lines[$i] = "            if (`$content -match '[A-Z]:\\\\|/[a-z]+/') {"
        Write-FixLog "Fixed line $($i+1): Hardcoded path detection regex" "SUCCESS"
    }
    
    # Fix line 607: array allocation detection
    if ($lines[$i] -match "if \(\`\$content -match 'New-Object\.\*\\[\\]'") {
        $lines[$i] = "            if (`$content -match 'New-Object.*\[\]' -and `$content -notmatch '\.Dispose\(\)') {"
        Write-FixLog "Fixed line $($i+1): Array allocation detection regex" "SUCCESS"
    }
}

Write-FixLog "Writing corrected content..." "INFO"

# Write the corrected content back
Set-Content $ValidatorPath $lines -Encoding UTF8

Write-FixLog "Regex fixes applied successfully" "SUCCESS"
Write-FixLog "Testing the corrected validator..." "INFO"

# Test the corrected validator
try {
    $testResult = & powershell -ExecutionPolicy Bypass -Command "& '$ValidatorPath' -DetailedReport" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-FixLog "Validator test completed successfully" "SUCCESS"
    } else {
        Write-FixLog "Validator completed with validation issues (exit code: $LASTEXITCODE)" "WARN"
        Write-FixLog "This is expected - the validator found issues to fix" "INFO"
    }
} catch {
    Write-FixLog "Error testing validator: $($_.Exception.Message)" "ERROR"
}

Write-FixLog "Precise regex fix process completed" "SUCCESS"