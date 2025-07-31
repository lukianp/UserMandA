# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Wave Generation Module for M&A Discovery Suite
.DESCRIPTION
    Generates migration waves from user data based on various criteria including department, location, and business rules. 
    This module provides intelligent wave generation capabilities for M&A migrations including user grouping, 
    wave sizing, dependency analysis, and migration scheduling to optimize migration success and minimize 
    business disruption.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>

function Invoke-WaveGeneration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$InputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][hashtable]$Context
    )

    Write-MandALog -Message "[WaveGeneration] Generating migration waves from '$InputPath'..." -Level "INFO"
    $allUsers = Import-Csv -Path $InputPath
    $maxWaveSize = $Configuration.processing.maxWaveSize

    # Group users by department (or another attribute)
    $usersByDept = $allUsers | Group-Object -Property Department

    $waveNumber = 1
    foreach ($deptGroup in $usersByDept) {
        # Further sort by complexity to put easier users first
        $sortedUsers = $deptGroup.Group | Sort-Object -Property ComplexityScore -as [int]
        
        for ($i = 0; $i -lt $sortedUsers.Count; $i++) {
            $user = $sortedUsers[$i]
            # Assign wave number based on max size
            $currentWave = "Wave-" + $waveNumber.ToString("00")
            $user | Add-Member -NotePropertyName "MigrationWave" -Value $currentWave -Force

            if (($i + 1) % $maxWaveSize -eq 0) {
                $waveNumber++
            }
        }
        if ($deptGroup.Count % $maxWaveSize -ne 0) {
            $waveNumber++
        }
    }
    
    Write-MandALog -Message "[WaveGeneration] Assigned $($allUsers.Count) users to $($waveNumber - 1) waves." -Level "SUCCESS"
    return $allUsers
}

Export-ModuleMember -Function Invoke-WaveGeneration