# Fix Advanced Discovery Module Validator Regex Errors
# Addresses the "parsing "\" - Illegal \ at end of pattern" errors

param(
    [string]$ValidatorPath = "Scripts/Advanced-DiscoveryModuleValidator.ps1",
    [switch]$CreateBackup = $true
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

Write-FixLog "Starting Advanced Validator regex error fixes" "INFO"

if (-not (Test-Path $ValidatorPath)) {
    Write-FixLog "Validator file not found: $ValidatorPath" "ERROR"
    exit 1
}

# Create backup if requested
if ($CreateBackup) {
    $backupPath = "$ValidatorPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $ValidatorPath $backupPath
    Write-FixLog "Created backup: $backupPath" "SUCCESS"
}

# Read the current content
$content = Get-Content $ValidatorPath -Raw

Write-FixLog "Applying regex pattern fixes..." "INFO"

# Fix 1: Escape backslashes in resource patterns (lines 177-184)
$content = $content -replace 'New-Object\\s\+System\\.IO\\.', 'New-Object\s+System\.IO\.'
$content = $content -replace 'New-Object\\s\+System\\.Net\\.', 'New-Object\s+System\.Net\.'
$content = $content -replace '\\[System\\.IO\\.File\\]::', '\[System\.IO\.File\]::'

# Fix 2: Fix hardcoded path detection regex (line 602)
$content = $content -replace '\[A-Z\]:\\\\|/\[a-z\]\+/', '[A-Z]:\\\\|/[a-z]+/'

# Fix 3: Fix array allocation detection regex (line 607)
$content = $content -replace 'New-Object\.\*\\[\\]', 'New-Object.*\[\]'

# Fix 4: Add proper escaping for all regex patterns
$fixedResourcePatterns = @'
    # Look for resource allocation patterns
    $resourcePatterns = @(
        'New-Object\s+System\.IO\.',
        'New-Object\s+System\.Net\.',
        '\[System\.IO\.File\]::',
        'Get-WmiObject',
        'Get-CimInstance',
        'Invoke-RestMethod',
        'Invoke-WebRequest'
    )
'@

# Replace the problematic resource patterns section
$content = $content -replace '(?s)    # Look for resource allocation patterns.*?    \)', $fixedResourcePatterns

# Fix 5: Update hardcoded path detection
$content = $content -replace "if \(\`$content -match '\[A-Z\]:\\\\|/\[a-z\]\+/'\)", "if (`$content -match '[A-Z]:\\\\|/[a-z]+/')"

# Fix 6: Update array allocation detection
$content = $content -replace "if \(\`$content -match 'New-Object\.\*\\[\\]'", "if (`$content -match 'New-Object.*\[\]'"

Write-FixLog "Writing fixed content..." "INFO"

# Write the fixed content
Set-Content $ValidatorPath $content -Encoding UTF8

Write-FixLog "Advanced Validator regex errors fixed successfully" "SUCCESS"
Write-FixLog "Testing the fixed validator..." "INFO"

# Test the fixed validator
try {
    $testResult = & powershell -ExecutionPolicy Bypass -File $ValidatorPath -DetailedReport 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-FixLog "Validator test completed successfully" "SUCCESS"
    } else {
        Write-FixLog "Validator completed with warnings/errors (exit code: $LASTEXITCODE)" "WARN"
    }
} catch {
    Write-FixLog "Error testing validator: $($_.Exception.Message)" "ERROR"
}

Write-FixLog "Regex error fix process completed" "SUCCESS"