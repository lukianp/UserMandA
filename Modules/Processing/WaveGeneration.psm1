#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Migration Wave Generation Module
.DESCRIPTION
    This module is responsible for generating migration waves based on user profiles
    and configuration settings (e.g., by department or complexity).
.NOTES
    Version: 1.2.0 (Aligned with orchestrator data contracts)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Main function to generate migration waves
function New-MigrationWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Expects an array/list of user profile objects from UserProfileBuilder

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Migration Wave Generation for $($Profiles.Count) profiles..." -Level "INFO"
    $migrationWaves = [System.Collections.Generic.List[object]]::new()

    if ($null -eq $Profiles -or $Profiles.Count -eq 0) {
        Write-MandALog "No user profiles provided. Cannot generate migration waves." -Level "WARN"
        return $migrationWaves # Return empty list
    }

    # Get wave generation settings from configuration
    $generateByDepartment = $false
    if ($Configuration.processing.ContainsKey('generateWavesByDepartment')) {
        $generateByDepartment = $Configuration.processing.generateWavesByDepartment
    }
    
    $maxWaveSize = 50 # Default
    if ($Configuration.processing.ContainsKey('maxWaveSize')) {
        $maxWaveSize = $Configuration.processing.maxWaveSize
    }

    Write-MandALog "Wave generation strategy: $(if($generateByDepartment){'Department'} else {'Complexity'}). Max wave size: $maxWaveSize" -Level "DEBUG"
    
    # Placeholder: Detailed wave generation logic
    # This would involve sorting users, grouping them based on criteria,
    # and ensuring wave sizes are respected.

    if ($generateByDepartment) {
        Write-MandALog "Generating waves by department..." -Level "INFO"
        # Ensure profiles have a 'Department' property for grouping
        $usersByDepartment = $Profiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Department) } | Group-Object Department
        
        $waveCounter = 1
        foreach ($deptGroup in $usersByDepartment) {
            $departmentName = $deptGroup.Name
            $usersInDept = $deptGroup.Group | Sort-Object DisplayName # Consistent ordering
            $deptWaveNumber = 1
            
            for ($i = 0; $i -lt $usersInDept.Count; $i += $maxWaveSize) {
                $waveUsers = $usersInDept[$i..[System.Math]::Min($i + $maxWaveSize - 1, $usersInDept.Count - 1)]
                # Calculate average complexity for the wave (example metric)
                $avgComplexity = ($waveUsers | Measure-Object -Property ComplexityScore -Average).Average
                
                $wave = [PSCustomObject]@{
                    WaveName          = "Dept-$departmentName-Wave$deptWaveNumber"
                    WaveID            = "WAVE-$($waveCounter)"
                    TotalUsers        = $waveUsers.Count
                    UserPrincipalNames= ($waveUsers.UserPrincipalName -join ";") # Storing UPNs for summary
                  # Users             = $waveUsers # Optionally include full profiles, can make CSV large
                    Criteria          = "Department: $departmentName"
                    AverageComplexity = [math]::Round($avgComplexity, 2)
                    # Add other wave-specific summary data here
                }
                $migrationWaves.Add($wave)
                $waveCounter++
                $deptWaveNumber++
            }
        }
    } else { # Default to complexity-based or other logic
        Write-MandALog "Generating waves by complexity (example)..." -Level "INFO"
        # Ensure profiles have 'ComplexityScore' property
        $sortedProfiles = $Profiles | Sort-Object ComplexityScore, DisplayName # Sort by complexity, then name
        
        $waveCounter = 1
        for ($i = 0; $i -lt $sortedProfiles.Count; $i += $maxWaveSize) {
            $waveUsers = $sortedProfiles[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedProfiles.Count - 1)]
            $avgComplexity = ($waveUsers | Measure-Object -Property ComplexityScore -Average).Average

            $wave = [PSCustomObject]@{
                WaveName          = "Complexity-Wave$waveCounter"
                WaveID            = "WAVE-$($waveCounter)"
                TotalUsers        = $waveUsers.Count
                UserPrincipalNames= ($waveUsers.UserPrincipalName -join ";")
              # Users             = $waveUsers # Optionally include full profiles
                Criteria          = "Complexity Score Grouping"
                AverageComplexity = [math]::Round($avgComplexity, 2)
            }
            $migrationWaves.Add($wave)
            $waveCounter++
        }
    }

    if ($migrationWaves.Count -eq 0 -and $Profiles.Count -gt 0) {
        Write-MandALog "No specific wave generation logic matched or no users fit criteria. Creating a single fallback wave." -Level "WARN"
        $wave = [PSCustomObject]@{
            WaveName          = "Fallback-Wave1"
            WaveID            = "WAVE-FB1"
            TotalUsers        = $Profiles.Count
            UserPrincipalNames= ($Profiles.UserPrincipalName -join ";")
            Criteria          = "Fallback - All remaining users"
            AverageComplexity = [math]::Round(($Profiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
        }
        $migrationWaves.Add($wave)
    }

    Write-MandALog "Migration Wave Generation completed. $($migrationWaves.Count) waves created." -Level "SUCCESS"
    return $migrationWaves
}

Export-ModuleMember -Function New-MigrationWaves
