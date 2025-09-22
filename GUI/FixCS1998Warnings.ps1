# Fix CS1998 Warnings - Remove async/await from non-async methods
# This script systematically fixes async methods that don't use await

param(
    [string]$ProjectPath = "D:\Scripts\UserMandA\GUI",
    [switch]$WhatIf = $false
)

Write-Host "=== CS1998 Warning Fix Script ===" -ForegroundColor Green
Write-Host "Project Path: $ProjectPath" -ForegroundColor Yellow
Write-Host "WhatIf Mode: $WhatIf" -ForegroundColor Yellow

# Get current CS1998 warnings
Write-Host "`nGetting CS1998 warnings..." -ForegroundColor Cyan
$buildOutput = & dotnet build "$ProjectPath\MandADiscoverySuite.csproj" -c Release 2>&1
$cs1998Warnings = $buildOutput | Where-Object { $_ -match "warning CS1998" }

Write-Host "Found $($cs1998Warnings.Count) CS1998 warnings" -ForegroundColor Yellow

$fixedCount = 0
$processedFiles = @{}

foreach ($warning in $cs1998Warnings) {
    # Parse warning: D:\Scripts\UserMandA\GUI\Utilities\ModuleRegistryGenerator.cs(18,50): warning CS1998
    if ($warning -match "([^(]+)\((\d+),\d+\):\s+warning CS1998") {
        $filePath = $matches[1]
        $lineNumber = [int]$matches[2]

        # Skip if we've already processed this file
        if ($processedFiles.ContainsKey($filePath)) {
            continue
        }

        Write-Host "`nProcessing: $([System.IO.Path]::GetFileName($filePath)):$lineNumber" -ForegroundColor Cyan

        if (Test-Path $filePath) {
            try {
                $content = Get-Content $filePath -Raw
                $lines = Get-Content $filePath

                # Find async methods without await and fix them
                $modifiedContent = $content
                $changesMade = $false

                # Pattern to match async methods that don't contain await
                $asyncMethodPattern = '(?m)^(\s*(?:public|private|protected|internal|static|\s)*)\s+async\s+(Task(?:<[^>]+>)?)\s+(\w+)\s*\([^)]*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}'

                $matches = [regex]::Matches($modifiedContent, $asyncMethodPattern)

                foreach ($match in $matches) {
                    $fullMethod = $match.Value
                    $methodModifiers = $match.Groups[1].Value
                    $returnType = $match.Groups[2].Value
                    $methodName = $match.Groups[3].Value
                    $methodBody = $match.Groups[4].Value

                    # Check if method contains await
                    if ($methodBody -notmatch '\bawait\b' -and $methodBody -notmatch 'ConfigureAwait') {
                        Write-Host "  - Fixing async method: $methodName" -ForegroundColor Green

                        # Convert Task<T> to T, Task to void
                        $newReturnType = $returnType
                        if ($returnType -eq "Task") {
                            $newReturnType = "void"
                        } elseif ($returnType -match "Task<(.+)>") {
                            $newReturnType = $matches[1]
                        }

                        # Remove async keyword and update return type
                        $newMethodSignature = $fullMethod -replace '\basync\s+', '' -replace [regex]::Escape($returnType), $newReturnType

                        # Update method body to remove Task.FromResult or similar patterns
                        $newMethodSignature = $newMethodSignature -replace 'return\s+Task\.FromResult\(([^)]+)\)', 'return $1'
                        $newMethodSignature = $newMethodSignature -replace 'return\s+Task\.CompletedTask', 'return'

                        $modifiedContent = $modifiedContent.Replace($fullMethod, $newMethodSignature)
                        $changesMade = $true
                    }
                }

                if ($changesMade) {
                    if (-not $WhatIf) {
                        Set-Content -Path $filePath -Value $modifiedContent -NoNewline
                        Write-Host "  ✅ File updated successfully" -ForegroundColor Green
                        $fixedCount++
                    } else {
                        Write-Host "  ⚠️ Would update file (WhatIf mode)" -ForegroundColor Yellow
                    }
                    $processedFiles[$filePath] = $true
                } else {
                    Write-Host "  ⚪ No changes needed" -ForegroundColor Gray
                }

            } catch {
                Write-Host "  ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "  ❌ File not found: $filePath" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== CS1998 Fix Summary ===" -ForegroundColor Green
Write-Host "Total CS1998 warnings found: $($cs1998Warnings.Count)" -ForegroundColor Yellow
Write-Host "Files processed: $($processedFiles.Count)" -ForegroundColor Yellow
Write-Host "Files fixed: $fixedCount" -ForegroundColor Green

if ($WhatIf) {
    Write-Host "`n⚠️ This was a WhatIf run - no files were actually modified" -ForegroundColor Yellow
    Write-Host "Run without -WhatIf to apply the changes" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ CS1998 warning fixes applied successfully!" -ForegroundColor Green
}