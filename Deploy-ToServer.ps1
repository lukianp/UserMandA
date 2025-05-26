<#
.SYNOPSIS
    Deploy M&A Discovery Suite to target server location
.DESCRIPTION
    Copies all necessary files from the development workspace to the target server location
.PARAMETER TargetPath
    Target path on the server (e.g., C:\UserMigration)
.PARAMETER Force
    Overwrite existing files
.EXAMPLE
    .\Deploy-ToServer.ps1 -TargetPath "C:\UserMigration" -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$TargetPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Get current script location
$SourcePath = $PSScriptRoot

Write-Host "M&A Discovery Suite - Server Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Source: $SourcePath" -ForegroundColor Yellow
Write-Host "Target: $TargetPath" -ForegroundColor Yellow
Write-Host ""

# Create target directory structure
$directories = @(
    "Core",
    "Configuration", 
    "Scripts",
    "Modules\Authentication",
    "Modules\Connectivity", 
    "Modules\Discovery",
    "Modules\Processing",
    "Modules\Export",
    "Modules\Utilities"
)

Write-Host "Creating directory structure..." -ForegroundColor Green
foreach ($dir in $directories) {
    $targetDir = Join-Path $TargetPath $dir
    if (-not (Test-Path $targetDir)) {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    } else {
        Write-Host "  Exists: $dir" -ForegroundColor Gray
    }
}

# Define files to copy
$filesToCopy = @{
    # Core files
    "Core\MandA-Orchestrator.ps1" = "Core\MandA-Orchestrator.ps1"
    
    # Configuration
    "Configuration\default-config.json" = "Configuration\default-config.json"
    
    # Scripts
    "Scripts\QuickStart.ps1" = "Scripts\QuickStart.ps1"
    "Scripts\Validate-Installation.ps1" = "Scripts\Validate-Installation.ps1"
    "Scripts\Set-SuiteEnvironment.ps1" = "Scripts\Set-SuiteEnvironment.ps1"
    "Scripts\Test-LocationIndependence.ps1" = "Scripts\Test-LocationIndependence.ps1"
    
    # Documentation
    "README.md" = "README.md"
    
    # Authentication modules
    "Modules\Authentication\Authentication.psm1" = "Modules\Authentication\Authentication.psm1"
    "Modules\Authentication\CredentialManagement.psm1" = "Modules\Authentication\CredentialManagement.psm1"
    
    # Connectivity modules
    "Modules\Connectivity\ConnectionManager.psm1" = "Modules\Connectivity\ConnectionManager.psm1"
    "Modules\Connectivity\EnhancedConnectionManager.psm1" = "Modules\Connectivity\EnhancedConnectionManager.psm1"
    
    # Discovery modules
    "Modules\Discovery\ActiveDirectoryDiscovery.psm1" = "Modules\Discovery\ActiveDirectoryDiscovery.psm1"
    "Modules\Discovery\GraphDiscovery.psm1" = "Modules\Discovery\GraphDiscovery.psm1"
    "Modules\Discovery\GPODiscovery.psm1" = "Modules\Discovery\GPODiscovery.psm1"
    "Modules\Discovery\EnhancedGPODiscovery.psm1" = "Modules\Discovery\EnhancedGPODiscovery.psm1"
    
    # Processing modules
    "Modules\Processing\DataAggregation.psm1" = "Modules\Processing\DataAggregation.psm1"
    "Modules\Processing\UserProfileBuilder.psm1" = "Modules\Processing\UserProfileBuilder.psm1"
    "Modules\Processing\WaveGeneration.psm1" = "Modules\Processing\WaveGeneration.psm1"
    "Modules\Processing\DataValidation.psm1" = "Modules\Processing\DataValidation.psm1"
    
    # Export modules
    "Modules\Export\CSVExport.psm1" = "Modules\Export\CSVExport.psm1"
    "Modules\Export\JSONExport.psm1" = "Modules\Export\JSONExport.psm1"
    
    # Utility modules
    "Modules\Utilities\Logging.psm1" = "Modules\Utilities\Logging.psm1"
    "Modules\Utilities\EnhancedLogging.psm1" = "Modules\Utilities\EnhancedLogging.psm1"
    "Modules\Utilities\ErrorHandling.psm1" = "Modules\Utilities\ErrorHandling.psm1"
    "Modules\Utilities\ValidationHelpers.psm1" = "Modules\Utilities\ValidationHelpers.psm1"
    "Modules\Utilities\ProgressTracking.psm1" = "Modules\Utilities\ProgressTracking.psm1"
    "Modules\Utilities\FileOperations.psm1" = "Modules\Utilities\FileOperations.psm1"
}

Write-Host "`nCopying files..." -ForegroundColor Green
$copiedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($sourceFile in $filesToCopy.Keys) {
    $targetFile = $filesToCopy[$sourceFile]
    $sourcePath = Join-Path $SourcePath $sourceFile
    $targetPath = Join-Path $TargetPath $targetFile
    
    try {
        if (Test-Path $sourcePath) {
            if ((Test-Path $targetPath) -and -not $Force) {
                Write-Host "  Skipped: $sourceFile (already exists)" -ForegroundColor Yellow
                $skippedCount++
            } else {
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
                Write-Host "  Copied: $sourceFile" -ForegroundColor Gray
                $copiedCount++
            }
        } else {
            Write-Host "  Missing: $sourceFile" -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "  Error copying $sourceFile`: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`nDeployment Summary:" -ForegroundColor Cyan
Write-Host "  Files copied: $copiedCount" -ForegroundColor Green
Write-Host "  Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "  Errors: $errorCount" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Navigate to: $TargetPath" -ForegroundColor White
    Write-Host "2. Run: .\Scripts\Test-LocationIndependence.ps1" -ForegroundColor White
    Write-Host "3. Run: .\Scripts\Validate-Installation.ps1" -ForegroundColor White
    Write-Host "4. Run: .\Scripts\QuickStart.ps1 -Operation Validate" -ForegroundColor White
    Write-Host "5. Run: .\Scripts\QuickStart.ps1 -Operation Full" -ForegroundColor White
} else {
    Write-Host "`nDeployment completed with errors. Please check missing files." -ForegroundColor Yellow
}

Write-Host ""