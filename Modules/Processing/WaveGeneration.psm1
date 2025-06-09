# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

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