# PowerShell script to fix systematic compilation errors in test files
# This script addresses the most common issues across all test files

param(
    [string]$TestDirectory = "Tests",
    [switch]$WhatIf,
    [switch]$Verbose
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Fix-UserDtoConstructor {
    param([string]$Content)

    # Pattern for UserDto constructor calls with wrong parameter order
    # Current wrong format: new UserDto(upn, sid, displayName, sam, dept, title, enabled, manager, office, phone, groups, created, domain, type)
    # Correct format: new UserDto(upn, sam, sid, mail, displayName, enabled, ou, managerSid, dept, azureObjectId, groups, discoveryTimestamp, discoveryModule, sessionId)

    $pattern = 'new UserDto\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)'

    $replacement = 'new UserDto($1, $4, $2, null, $3, $6, $7, $8, $5, null, $11, $12, $13, $14)'

    $fixedContent = [regex]::Replace($Content, $pattern, $replacement)

    if ($fixedContent -ne $Content) {
        Write-Log "Fixed UserDto constructor in file" -Level "FIXED"
    }

    return $fixedContent
}

function Fix-LogicEngineServiceConstructor {
    param([string]$Content)

    # Fix LogicEngineService constructor calls that pass string as second parameter (should be MultiTierCacheService?)
    $pattern = 'new LogicEngineService\(\s*([^,]+),\s*("[^"]*"|\w+),\s*([^)]+)\)'
    $replacement = 'new LogicEngineService($1, null, $3)'

    $fixedContent = [regex]::Replace($Content, $pattern, $replacement)

    if ($fixedContent -ne $Content) {
        Write-Log "Fixed LogicEngineService constructor in file" -Level "FIXED"
    }

    return $fixedContent
}

function Add-MissingILoggerUsing {
    param([string]$Content)

    # Check if file uses ILogger but doesn't have the using directive
    if ($Content -match 'ILogger<' -and $Content -notmatch 'using Microsoft\.Extensions\.Logging;') {
        # Add the using directive after other using statements
        $pattern = '(using .*;\s*\n)+'
        $replacement = '$&using Microsoft.Extensions.Logging;' + "`n"

        $fixedContent = [regex]::Replace($Content, $pattern, $replacement, "Single", [regex]::Multiline)

        if ($fixedContent -ne $Content) {
            Write-Log "Added missing ILogger using directive" -Level "FIXED"
            return $fixedContent
        }
    }

    return $Content
}

function Fix-MoqReturnsAsync {
    param([string]$Content)

    # Fix incorrect Moq ReturnsAsync usage
    # Pattern: .ReturnsAsync<List<SqlDatabaseDto>>(...) should be .ReturnsAsync(...)
    $pattern = '\.ReturnsAsync<[^>]+>\s*\('
    $replacement = '.ReturnsAsync('

    $fixedContent = [regex]::Replace($Content, $pattern, $replacement)

    if ($fixedContent -ne $Content) {
        Write-Log "Fixed Moq ReturnsAsync usage" -Level "FIXED"
    }

    return $fixedContent
}

function Process-TestFile {
    param([string]$FilePath)

    Write-Log "Processing: $FilePath" -Level "INFO"

    try {
        $originalContent = Get-Content -Path $FilePath -Raw -Encoding UTF8

        $fixedContent = $originalContent

        # Apply fixes in order
        $fixedContent = Fix-UserDtoConstructor -Content $fixedContent
        $fixedContent = Fix-LogicEngineServiceConstructor -Content $fixedContent
        $fixedContent = Add-MissingILoggerUsing -Content $fixedContent
        $fixedContent = Fix-MoqReturnsAsync -Content $fixedContent

        # Save file if content changed
        if ($fixedContent -ne $originalContent) {
            if ($WhatIf) {
                Write-Log "Would fix: $FilePath" -Level "WHATIF"
            } else {
                $fixedContent | Set-Content -Path $FilePath -Encoding UTF8 -NoNewline
                Write-Log "Fixed: $FilePath" -Level "SUCCESS"
            }
        } else {
            if ($Verbose) {
                Write-Log "No changes needed: $FilePath" -Level "SKIP"
            }
        }

    } catch {
        Write-Log "Error processing $FilePath : $($_.Exception.Message)" -Level "ERROR"
    }
}

# Main execution
Write-Log "Starting bulk test file fixes..." -Level "START"

if ($WhatIf) {
    Write-Log "Running in WHATIF mode - no actual changes will be made" -Level "WARN"
}

# Get all C# test files
$testFiles = Get-ChildItem -Path $TestDirectory -Filter "*.cs" -Recurse -File

Write-Log "Found $($testFiles.Count) test files to process" -Level "INFO"

$processedCount = 0
$fixedCount = 0

foreach ($file in $testFiles) {
    Process-TestFile -FilePath $file.FullName
    $processedCount++

    # Progress reporting
    if ($processedCount % 50 -eq 0) {
        Write-Log "Processed $processedCount / $($testFiles.Count) files" -Level "PROGRESS"
    }
}

Write-Log "Completed processing $processedCount test files" -Level "COMPLETE"

if (-not $WhatIf) {
    Write-Log "Run 'dotnet build Tests/MandADiscoverySuite.Tests.csproj' to verify fixes" -Level "NEXT"
}