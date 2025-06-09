# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

function Invoke-DataValidation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$InputDirectory,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][hashtable]$Context
    )

    Write-MandALog -Message "[DataValidation] Performing validation on processed files in '$InputDirectory'..." -Level "INFO"
    $validationErrors = [System.Collections.ArrayList]::new()

    # Example: Check for users without a migration wave
    $wavesFile = Join-Path $InputDirectory "Migration_Waves.csv"
    if (Test-Path $wavesFile) {
        $usersWithWaves = Import-Csv -Path $wavesFile
        $usersMissingWaves = $usersWithWaves | Where-Object { [string]::IsNullOrWhiteSpace($_.MigrationWave) }
        if ($usersMissingWaves) {
            $null = $validationErrors.Add("Found $($usersMissingWaves.Count) users missing a MigrationWave assignment.")
        }
    }

    if ($validationErrors.Count -gt 0) {
        Write-MandALog -Message "[DataValidation] Validation found $($validationErrors.Count) issues." -Level "WARN"
        $validationErrors | ForEach-Object { Write-MandALog -Message "  - $_" -Level "WARN" }
    } else {
        Write-MandALog -Message "[DataValidation] All processed data passed validation checks." -Level "SUCCESS"
    }

    # This module could return a report, but for now, it just logs.
    return $true
}

Export-ModuleMember -Function Invoke-DataValidation