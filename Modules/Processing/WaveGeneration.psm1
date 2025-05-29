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
    if ($Configuration.processing.ContainsKey('maxWaveSize') -and $Configuration.processing.maxWaveSize -gt 0) {
        $maxWaveSize = $Configuration.processing.maxWaveSize
    } else {
        Write-MandALog "maxWaveSize not configured or invalid in processing settings. Using default: $maxWaveSize" -Level "WARN"
    }

    Write-MandALog "Wave generation strategy: $(if($generateByDepartment){'Department'} else {'Complexity'}). Max wave size: $maxWaveSize" -Level "DEBUG"
    
    # --- Wave Generation Logic ---
    # This is where your specific algorithms for grouping users into waves go.
    # The following are illustrative examples.

    if ($generateByDepartment) {
        Write-MandALog "Generating waves by department..." -Level "INFO"
        # Ensure profiles have a 'Department' property for grouping
        # Group users by Department, handling null or empty department names
        $usersByDepartment = $Profiles | Group-Object -Property @{Expression={if ([string]::IsNullOrWhiteSpace($_.Department)) { "_UndefinedDepartment" } else { $_.Department }}}
        
        $waveCounter = 1
        foreach ($deptGroup in $usersByDepartment) {
            $departmentName = $deptGroup.Name # This will be "_UndefinedDepartment" for users with no department
            $usersInDept = $deptGroup.Group | Sort-Object DisplayName # Consistent ordering within the department
            $deptWaveNumber = 1
            
            Write-MandALog "Processing department: '$departmentName' with $($usersInDept.Count) users." -Level "DEBUG"

            for ($i = 0; $i -lt $usersInDept.Count; $i += $maxWaveSize) {
                $waveUsers = $usersInDept[$i..[System.Math]::Min($i + $maxWaveSize - 1, $usersInDept.Count - 1)]
                
                $avgComplexity = 0
                if ($waveUsers.Count -gt 0) { # Avoid division by zero if $waveUsers is empty (should not happen with this loop logic)
                    $avgComplexity = ($waveUsers | Measure-Object -Property ComplexityScore -Average).Average
                }
                
                $wave = [PSCustomObject]@{
                    WaveName          = "Dept-$departmentName-Wave$deptWaveNumber"
                    WaveID            = "WAVE-$($waveCounter)"
                    TotalUsers        = $waveUsers.Count
                    UserPrincipalNames= ($waveUsers.UserPrincipalName -join ";") 
                    Criteria          = "Department: $departmentName"
                    AverageComplexity = [math]::Round($avgComplexity, 2)
                    UserProfilesInWave= $waveUsers # Optionally include full profiles, or just UPNs
                }
                $migrationWaves.Add($wave)
                $waveCounter++
                $deptWaveNumber++
            }
        }
    } else { # Default to complexity-based or other logic
        Write-MandALog "Generating waves by complexity..." -Level "INFO"
        # Ensure profiles have 'ComplexityScore' property
        # Users with higher complexity might be in later waves, or smaller waves, or mixed.
        # This example sorts by complexity and then groups.
        $sortedProfiles = $Profiles | Sort-Object ComplexityScore, DisplayName 
        
        $waveCounter = 1
        for ($i = 0; $i -lt $sortedProfiles.Count; $i += $maxWaveSize) {
            $waveUsers = $sortedProfiles[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedProfiles.Count - 1)]
            
            $avgComplexity = 0
            if ($waveUsers.Count -gt 0) {
                $avgComplexity = ($waveUsers | Measure-Object -Property ComplexityScore -Average).Average
            }

            $wave = [PSCustomObject]@{
                WaveName          = "Complexity-Wave$waveCounter"
                WaveID            = "WAVE-$($waveCounter)"
                TotalUsers        = $waveUsers.Count
                UserPrincipalNames= ($waveUsers.UserPrincipalName -join ";")
                Criteria          = "Complexity Score Grouping"
                AverageComplexity = [math]::Round($avgComplexity, 2)
                UserProfilesInWave= $waveUsers # Optionally include full profiles
            }
            $migrationWaves.Add($wave)
            $waveCounter++
        }
    }

    # Fallback if no waves were generated but profiles exist (e.g., all users had undefined department and dept. generation was on)
    if ($migrationWaves.Count -eq 0 -and $Profiles.Count -gt 0) {
        Write-MandALog "No specific waves generated by primary strategy. Creating a single fallback wave for all $($Profiles.Count) users." -Level "WARN"
        $avgComplexityFallback = 0
        if ($Profiles.Count -gt 0) {
             $avgComplexityFallback = ($Profiles | Measure-Object -Property ComplexityScore -Average).Average
        }
        $wave = [PSCustomObject]@{
            WaveName          = "Fallback-Wave1"
            WaveID            = "WAVE-FB1"
            TotalUsers        = $Profiles.Count
            UserPrincipalNames= ($Profiles.UserPrincipalName -join ";")
            Criteria          = "Fallback - All users"
            AverageComplexity = [math]::Round($avgComplexityFallback, 2)
            UserProfilesInWave= $Profiles
        }
        $migrationWaves.Add($wave)
    }

    Write-MandALog "Migration Wave Generation completed. $($migrationWaves.Count) waves created." -Level "SUCCESS"
    return $migrationWaves
}

Export-ModuleMember -Function New-MigrationWaves
