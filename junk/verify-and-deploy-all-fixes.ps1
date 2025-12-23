# Verify and Deploy All Credential Fixes
# This script ensures all modified files are in the correct locations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CREDENTIAL FIX DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$workspace = "D:\Scripts\UserMandA"
$deployment = "C:\enterprisediscovery"

# Files that were modified
$filesToVerify = @{
    "Core Module" = @(
        @{
            Source = "$workspace\Modules\Core\CredentialLoader.psm1"
            Dest = "$deployment\Modules\Core\CredentialLoader.psm1"
        }
    )
    "Discovery Modules" = @(
        @{
            Source = "$workspace\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\AzureDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\AzureDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\ConditionalAccessDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\ConditionalAccessDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\ExchangeDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\ExchangeDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\IntuneDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\IntuneDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\LicensingDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\LicensingDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\OneDriveDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\OneDriveDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\PowerPlatformDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\PowerPlatformDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\SharePointDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\SharePointDiscovery.psm1"
        },
        @{
            Source = "$workspace\Modules\Discovery\TeamsDiscovery.psm1"
            Dest = "$deployment\Modules\Discovery\TeamsDiscovery.psm1"
        }
    )
}

$totalFiles = 0
$copiedFiles = 0
$alreadyDeployed = 0
$errors = 0

Write-Host "Phase 1: Verifying Workspace Files" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

foreach ($category in $filesToVerify.Keys) {
    Write-Host "`n[$category]" -ForegroundColor Cyan

    foreach ($file in $filesToVerify[$category]) {
        $totalFiles++
        $fileName = Split-Path $file.Source -Leaf

        if (Test-Path $file.Source) {
            Write-Host "  [OK] $fileName (exists in workspace)" -ForegroundColor Green
        } else {
            Write-Host "  [X] $fileName (MISSING from workspace!)" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host "`n"
Write-Host "Phase 2: Deploying to $deployment" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Ensure deployment directories exist
New-Item -ItemType Directory -Path "$deployment\Modules\Core" -Force -ErrorAction SilentlyContinue | Out-Null
New-Item -ItemType Directory -Path "$deployment\Modules\Discovery" -Force -ErrorAction SilentlyContinue | Out-Null

foreach ($category in $filesToVerify.Keys) {
    Write-Host "`n[$category]" -ForegroundColor Cyan

    foreach ($file in $filesToVerify[$category]) {
        $fileName = Split-Path $file.Source -Leaf

        if (-not (Test-Path $file.Source)) {
            Write-Host "  [X] $fileName (source missing, skipping)" -ForegroundColor Red
            continue
        }

        try {
            # Check if destination exists and compare
            $needsCopy = $true
            if (Test-Path $file.Dest) {
                $sourceHash = (Get-FileHash $file.Source -Algorithm SHA256).Hash
                $destHash = (Get-FileHash $file.Dest -Algorithm SHA256).Hash

                if ($sourceHash -eq $destHash) {
                    Write-Host "  = $fileName (already up-to-date)" -ForegroundColor Gray
                    $alreadyDeployed++
                    $needsCopy = $false
                }
            }

            if ($needsCopy) {
                Copy-Item -Path $file.Source -Destination $file.Dest -Force -ErrorAction Stop
                Write-Host "  [COPY] $fileName (copied)" -ForegroundColor Green
                $copiedFiles++
            }

        } catch {
            Write-Host "  [X] $fileName (copy failed: $($_.Exception.Message))" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host "`n"
Write-Host "Phase 3: Verification Summary" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

Write-Host "Total files checked: $totalFiles"
Write-Host "  [OK] Copied to deployment: $copiedFiles" -ForegroundColor Green
Write-Host "  [=] Already up-to-date: $alreadyDeployed" -ForegroundColor Gray
Write-Host "  [X] Errors: $errors" -ForegroundColor $(if ($errors -eq 0) { 'Green' } else { 'Red' })

Write-Host "`n"
Write-Host "Phase 4: Deployment File Verification" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow

$deployedCount = 0
foreach ($category in $filesToVerify.Keys) {
    foreach ($file in $filesToVerify[$category]) {
        if (Test-Path $file.Dest) {
            $deployedCount++
        }
    }
}

Write-Host "Files present in deployment: $deployedCount / $totalFiles"

if ($deployedCount -eq $totalFiles) {
    Write-Host "`n[OK] ALL FILES SUCCESSFULLY DEPLOYED!" -ForegroundColor Green
} else {
    Write-Host "`n[X] Some files missing from deployment!" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Workspace: $workspace" -ForegroundColor White
Write-Host "Deployment: $deployment" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# Return summary object
return [PSCustomObject]@{
    TotalFiles = $totalFiles
    Copied = $copiedFiles
    AlreadyDeployed = $alreadyDeployed
    Errors = $errors
    DeploymentComplete = ($deployedCount -eq $totalFiles)
}
