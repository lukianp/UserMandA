<#
.SYNOPSIS
    Deploy M&A Discovery Suite to a target server location.
.DESCRIPTION
    Copies all necessary files and the complete directory structure from the development workspace 
    to a target server location, ensuring a fully functional deployment.
.PARAMETER TargetPath
    Target path on the server (e.g., C:\UserMigration)
.PARAMETER Force
    Overwrite existing files in the target location.
.EXAMPLE
    .\Deploy-ToServer.ps1 -TargetPath "C:\UserMigration" -Force
.NOTES
    Author: Lukian Poleschtschuk
    Version: 1.0.0
    Created: 2025-06-03
    Last Modified: 2025-06-03
    Change Log: Initial version - any future changes require version increment
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory=$true)]
    [string]$TargetPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Get current script location to determine the source
$SourcePath = $PSScriptRoot

Write-Host "M&A Discovery Suite - Server Deployment v2.0.0" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Source: $SourcePath" -ForegroundColor Yellow
Write-Host "Target: $TargetPath" -ForegroundColor Yellow
Write-Host ""

# Define the complete directory structure to be created
$directories = @(
    "Core",
    "Configuration",
    "Documentation",
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
        if ($PSCmdlet.ShouldProcess($targetDir, "Create Directory")) {
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Exists:  $dir" -ForegroundColor Gray
    }
}

# Define the comprehensive list of files to copy
$filesToCopy = @{
    # Root files
    "Deploy-ToServer.ps1" = "Deploy-ToServer.ps1"
    "QuickStart.ps1" = "QuickStart.ps1"
    "README.md" = "README.md"
    "Set-SuiteEnvironment.ps1" = "Set-SuiteEnvironment.ps1"
    "Unblock-AllFiles.ps1" = "Unblock-AllFiles.ps1"

    # Core files
    "Core\MandA-Orchestrator.ps1" = "Core\MandA-Orchestrator.ps1"
    
    # Configuration
    "Configuration\default-config.json" = "Configuration\default-config.json"
    "Configuration\config.schema.json" = "Configuration\config.schema.json"

    # Documentation
    "Documentation\Complete_MandA_Discovery_Implementation.md" = "Documentation\Complete_MandA_Discovery_Implementation.md"
    "Documentation\MandA_Discovery_Architecture_Plan.md" = "Documentation\MandA_Discovery_Architecture_Plan.md"
    "Documentation\Server-Setup-Guide.md" = "Documentation\Server-Setup-Guide.md"

    # Scripts
    "Scripts\DiscoverySuiteModuleCheck.ps1" = "Scripts\DiscoverySuiteModuleCheck.ps1"
    "Scripts\QuickStart.ps1" = "Scripts\QuickStart.ps1"
    "Scripts\Set-SuiteEnvironment.ps1" = "Scripts\Set-SuiteEnvironment.ps1"
    "Scripts\Setup-AppRegistration.ps1" = "Scripts\Setup-AppRegistration.ps1"
    "Scripts\Setup-AppRegistrationOnce.ps1" = "Scripts\Setup-AppRegistrationOnce.ps1"
    "Scripts\Test-AppRegistrationSyntax.ps1" = "Scripts\Test-AppRegistrationSyntax.ps1"
    "Scripts\Validate-Installation.ps1" = "Scripts\Validate-Installation.ps1"
    
    # Authentication modules
    "Modules\Authentication\Authentication.psm1" = "Modules\Authentication\Authentication.psm1"
    "Modules\Authentication\CredentialManagement.psm1" = "Modules\Authentication\CredentialManagement.psm1"
    
    # Connectivity modules
    "Modules\Connectivity\ConnectionManager.psm1" = "Modules\Connectivity\ConnectionManager.psm1"
    "Modules\Connectivity\EnhancedConnectionManager.psm1" = "Modules\Connectivity\EnhancedConnectionManager.psm1"
    
    # Discovery modules
    "Modules\Discovery\ActiveDirectoryDiscovery.psm1" = "Modules\Discovery\ActiveDirectoryDiscovery.psm1"
    "Modules\Discovery\AzureDiscovery.psm1" = "Modules\Discovery\AzureDiscovery.psm1"
    "Modules\Discovery\EnvironmentDetectionDiscovery.psm1" = "Modules\Discovery\EnvironmentDetectionDiscovery.psm1"
    "Modules\Discovery\ExchangeDiscovery.psm1" = "Modules\Discovery\ExchangeDiscovery.psm1"
    "Modules\Discovery\ExternalIdentityDiscovery.psm1" = "Modules\Discovery\ExternalIdentityDiscovery.psm1"
    "Modules\Discovery\FileServerDiscovery.psm1" = "Modules\Discovery\FileServerDiscovery.psm1"
    "Modules\Discovery\GraphDiscovery.psm1" = "Modules\Discovery\GraphDiscovery.psm1"
    "Modules\Discovery\GPODiscovery.psm1" = "Modules\Discovery\GPODiscovery.psm1"
    "Modules\Discovery\EnhancedGPODiscovery.psm1" = "Modules\Discovery\EnhancedGPODiscovery.psm1"
    "Modules\Discovery\IntuneDiscovery.psm1" = "Modules\Discovery\IntuneDiscovery.psm1"
    "Modules\Discovery\LicensingDiscovery.psm1" = "Modules\Discovery\LicensingDiscovery.psm1"
    "Modules\Discovery\NetworkInfrastructureDiscovery.psm1" = "Modules\Discovery\NetworkInfrastructureDiscovery.psm1"
    "Modules\Discovery\SharePointDiscovery.psm1" = "Modules\Discovery\SharePointDiscovery.psm1"
    "Modules\Discovery\SQLServerDiscovery.psm1" = "Modules\Discovery\SQLServerDiscovery.psm1"
    "Modules\Discovery\TeamsDiscovery.psm1" = "Modules\Discovery\TeamsDiscovery.psm1"

    # Processing modules
    "Modules\Processing\DataAggregation.psm1" = "Modules\Processing\DataAggregation.psm1"
    "Modules\Processing\UserProfileBuilder.psm1" = "Modules\Processing\UserProfileBuilder.psm1"
    "Modules\Processing\WaveGeneration.psm1" = "Modules\Processing\WaveGeneration.psm1"
    "Modules\Processing\DataValidation.psm1" = "Modules\Processing\DataValidation.psm1"
    
    # Export modules
    "Modules\Export\CSVExport.psm1" = "Modules\Export\CSVExport.psm1"
    "Modules\Export\JSONExport.psm1" = "Modules\Export\JSONExport.psm1"
    "Modules\Export\ExcelExport.psm1" = "Modules\Export\ExcelExport.psm1"
    "Modules\Export\CompanyControlSheetExporter.psm1" = "Modules\Export\CompanyControlSheetExporter.psm1"

    # Utility modules
    "Modules\Utilities\Logging.psm1" = "Modules\Utilities\Logging.psm1"
    "Modules\Utilities\EnhancedLogging.psm1" = "Modules\Utilities\EnhancedLogging.psm1"
    "Modules\Utilities\ErrorHandling.psm1" = "Modules\Utilities\ErrorHandling.psm1"
    "Modules\Utilities\ValidationHelpers.psm1" = "Modules\Utilities\ValidationHelpers.psm1"
    "Modules\Utilities\ProgressTracking.psm1" = "Modules\Utilities\ProgressTracking.psm1"
    "Modules\Utilities\FileOperations.psm1" = "Modules\Utilities\FileOperations.psm1"
    "Modules\Utilities\ConfigurationValidation.psm1" = "Modules\Utilities\ConfigurationValidation.psm1"
}

Write-Host "`nCopying $($filesToCopy.Count) files..." -ForegroundColor Green
$copiedCount = 0
$skippedCount = 0
$errorCount = 0
$missingCount = 0

foreach ($sourceFile in $filesToCopy.Keys) {
    $targetFile = $filesToCopy[$sourceFile]
    $sourcePath = Join-Path $SourcePath $sourceFile
    $targetPath = Join-Path $TargetPath $targetFile
    
    try {
        if (Test-Path $sourcePath) {
            if (((Test-Path $targetPath) -and -not $Force)) {
                Write-Host "  Skipped: $sourceFile (already exists)" -ForegroundColor Yellow
                $skippedCount++
            } else {
                 if ($PSCmdlet.ShouldProcess($targetPath, "Copy File from $sourcePath")) {
                    Copy-Item -Path $sourcePath -Destination $targetPath -Force
                    Write-Host "  Copied:  $sourceFile" -ForegroundColor Gray
                    $copiedCount++
                 }
            }
        } else {
            Write-Host "  Missing: $sourceFile (Source file not found)" -ForegroundColor Red
            $missingCount++
            $errorCount++
        }
    } catch {
        Write-Host "  Error copying $sourceFile`: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`nDeployment Summary:" -ForegroundColor Cyan
Write-Host "  Files copied: $copiedCount" -ForegroundColor Green
Write-Host "  Files skipped (use -Force to overwrite): $skippedCount" -ForegroundColor Yellow
Write-Host "  Source files missing: $missingCount" -ForegroundColor Red
Write-Host "  Copying errors: $errorCount" -ForegroundColor Red

if ($errorCount -eq 0) {
    Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Navigate to target directory: cd `"$TargetPath`"" -ForegroundColor White
    Write-Host "2. Unblock scripts: .\\Unblock-AllFiles.ps1" -ForegroundColor White
    Write-Host "3. Validate the installation: .\\Scripts\\Validate-Installation.ps1" -ForegroundColor White
    Write-Host "4. Launch the suite: .\\QuickStart.ps1" -ForegroundColor White
} else {
    Write-Host "`nDeployment completed with errors. Please check for missing source files or permission issues." -ForegroundColor Red
}

Write-Host ""