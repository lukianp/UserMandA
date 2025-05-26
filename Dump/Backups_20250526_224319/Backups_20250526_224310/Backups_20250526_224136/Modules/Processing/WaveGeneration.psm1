<#
.SYNOPSIS
    Migration wave generation for M&A Discovery Suite
.DESCRIPTION
    Generates intelligent migration waves based on user profiles and business rules
#>

function Generate-MigrationWaves {
    param(
        [array]$Profiles,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Generating migration waves" -Level "HEADER"
        
        if (-not $Profiles -or $Profiles.Count -eq 0) {
            Write-MandALog "No user profiles available for wave generation" -Level "WARN"
            return @{}
        }
        
        $migrationWaves = @{}
        $maxWaveSize = $Configuration.processing.maxWaveSize
        $generateByDepartment = $Configuration.processing.generateWavesByDepartment
        
        if ($generateByDepartment) {
            $migrationWaves = Generate-WavesByDepartment -Profiles $Profiles -MaxWaveSize $maxWaveSize -Configuration $Configuration
        } else {
            $migrationWaves = Generate-WavesByComplexity -Profiles $Profiles -MaxWaveSize $maxWaveSize -Configuration $Configuration
        }
        
        # Validate and optimize waves
        $optimizedWaves = Optimize-MigrationWaves -Waves $migrationWaves -Configuration $Configuration
        
        # Generate wave summary
        $waveSummary = Generate-WaveSummary -Waves $optimizedWaves
        
        Write-MandALog "Migration wave generation completed" -Level "SUCCESS"
        Write-MandALog "Generated $($optimizedWaves.Count) migration waves" -Level "INFO"
        Write-MandALog "Total users assigned: $($waveSummary.TotalUsers)" -Level "INFO"
        Write-MandALog "Average wave size: $($waveSummary.AverageWaveSize)" -Level "INFO"
        
        return $optimizedWaves
        
    } catch {
        Write-MandALog "Migration wave generation failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Generate-WavesByDepartment {
    param(
        [array]$Profiles,
        [int]$MaxWaveSize,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Generating waves by department" -Level "INFO"
        
        $waves = @{}
        $waveNumber = 1
        
        # Group users by department
        $departmentGroups = $Profiles | Group-Object -Property Department
        
        foreach ($departmentGroup in $departmentGroups) {
            $departmentName = if ([string]::IsNullOrWhiteSpace($departmentGroup.Name)) { "Unknown Department" } else { $departmentGroup.Name }
            $departmentUsers = $departmentGroup.Group
            
            Write-MandALog "Processing department: $departmentName ($($departmentUsers.Count) users)" -Level "INFO"
            
            # Sort users within department by priority and complexity
            $sortedUsers = $departmentUsers | Sort-Object @(
                @{ Expression = { Get-PriorityWeight -Priority $_.MigrationPriority }; Descending = $true },
                @{ Expression = "ComplexityScore"; Descending = $false },
                @{ Expression = "ReadinessScore"; Descending = $true }
            )
            
            # Split department into waves if needed
            $departmentWaves = Split-UsersIntoWaves -Users $sortedUsers -MaxWaveSize $MaxWaveSize -BaseName $departmentName
            
            foreach ($wave in $departmentWaves) {
                $waves[$waveNumber] = $wave
                $waveNumber++
            }
        }
        
        return $waves
        
    } catch {
        Write-MandALog "Error generating waves by department: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Generate-WavesByComplexity {
    param(
        [array]$Profiles,
        [int]$MaxWaveSize,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Generating waves by complexity" -Level "INFO"
        
        $waves = @{}
        $waveNumber = 1
        
        # Group users by migration category and priority
        $priorityGroups = @{
            "High_Simple" = $Profiles | Where-Object { $_.MigrationPriority -eq "High" -and $_.MigrationCategory -eq "Simple" }
            "High_Standard" = $Profiles | Where-Object { $_.MigrationPriority -eq "High" -and $_.MigrationCategory -eq "Standard" }
            "Medium_Simple" = $Profiles | Where-Object { $_.MigrationPriority -eq "Medium" -and $_.MigrationCategory -eq "Simple" }
            "Medium_Standard" = $Profiles | Where-Object { $_.MigrationPriority -eq "Medium" -and $_.MigrationCategory -eq "Standard" }
            "Medium_Complex" = $Profiles | Where-Object { $_.MigrationPriority -eq "Medium" -and $_.MigrationCategory -eq "Complex" }
            "Low_Simple" = $Profiles | Where-Object { $_.MigrationPriority -eq "Low" -and $_.MigrationCategory -eq "Simple" }
            "Low_Standard" = $Profiles | Where-Object { $_.MigrationPriority -eq "Low" -and $_.MigrationCategory -eq "Standard" }
            "Low_Complex" = $Profiles | Where-Object { $_.MigrationPriority -eq "Low" -and $_.MigrationCategory -eq "Complex" }
            "HighRisk" = $Profiles | Where-Object { $_.MigrationCategory -eq "High Risk" }
        }
        
        # Process groups in priority order
        $groupOrder = @("High_Simple", "High_Standard", "Medium_Simple", "Medium_Standard", "Medium_Complex", "Low_Simple", "Low_Standard", "Low_Complex", "HighRisk")
        
        foreach ($groupName in $groupOrder) {
            $groupUsers = $priorityGroups[$groupName]
            
            if ($groupUsers -and $groupUsers.Count -gt 0) {
                Write-MandALog "Processing group: $groupName ($($groupUsers.Count) users)" -Level "INFO"
                
                # Sort users within group by readiness score
                $sortedUsers = $groupUsers | Sort-Object @(
                    @{ Expression = "ReadinessScore"; Descending = $true },
                    @{ Expression = "ComplexityScore"; Descending = $false }
                )
                
                # Split group into waves
                $groupWaves = Split-UsersIntoWaves -Users $sortedUsers -MaxWaveSize $MaxWaveSize -BaseName $groupName
                
                foreach ($wave in $groupWaves) {
                    $waves[$waveNumber] = $wave
                    $waveNumber++
                }
            }
        }
        
        return $waves
        
    } catch {
        Write-MandALog "Error generating waves by complexity: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Split-UsersIntoWaves {
    param(
        [array]$Users,
        [int]$MaxWaveSize,
        [string]$BaseName
    )
    
    $waves = @()
    $currentWaveUsers = @()
    $waveIndex = 1
    
    foreach ($user in $Users) {
        $currentWaveUsers += $user
        
        if ($currentWaveUsers.Count -ge $MaxWaveSize) {
            # Create wave
            $waveName = if ($Users.Count -le $MaxWaveSize) { $BaseName } else { "$BaseName - Wave $waveIndex" }
            
            $wave = Create-MigrationWave -Users $currentWaveUsers -Name $waveName
            $waves += $wave
            
            # Reset for next wave
            $currentWaveUsers = @()
            $waveIndex++
        }
    }
    
    # Handle remaining users
    if ($currentWaveUsers.Count -gt 0) {
        $waveName = if ($waveIndex -eq 1) { $BaseName } else { "$BaseName - Wave $waveIndex" }
        $wave = Create-MigrationWave -Users $currentWaveUsers -Name $waveName
        $waves += $wave
    }
    
    return $waves
}

function Create-MigrationWave {
    param(
        [array]$Users,
        [string]$Name
    )
    
    # Calculate wave statistics
    $totalUsers = $Users.Count
    $totalEstimatedTime = ($Users | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
    $averageComplexity = if ($totalUsers -gt 0) { [math]::Round(($Users | Measure-Object -Property ComplexityScore -Average).Average, 1) } else { 0 }
    $averageReadiness = if ($totalUsers -gt 0) { [math]::Round(($Users | Measure-Object -Property ReadinessScore -Average).Average, 1) } else { 0 }
    
    # Count by category
    $simpleCount = ($Users | Where-Object { $_.MigrationCategory -eq "Simple" }).Count
    $standardCount = ($Users | Where-Object { $_.MigrationCategory -eq "Standard" }).Count
    $complexCount = ($Users | Where-Object { $_.MigrationCategory -eq "Complex" }).Count
    $highRiskCount = ($Users | Where-Object { $_.MigrationCategory -eq "High Risk" }).Count
    
    # Count by readiness
    $readyCount = ($Users | Where-Object { $_.ReadinessStatus -eq "Ready" }).Count
    $minorIssuesCount = ($Users | Where-Object { $_.ReadinessStatus -eq "Minor Issues" }).Count
    $needsAttentionCount = ($Users | Where-Object { $_.ReadinessStatus -eq "Needs Attention" }).Count
    $notReadyCount = ($Users | Where-Object { $_.ReadinessStatus -eq "Not Ready" }).Count
    
    # Determine wave risk level
    $waveRiskLevel = "Low"
    if ($highRiskCount -gt 0 -or $notReadyCount -gt ($totalUsers * 0.3)) {
        $waveRiskLevel = "High"
    } elseif ($complexCount -gt ($totalUsers * 0.5) -or $needsAttentionCount -gt ($totalUsers * 0.3)) {
        $waveRiskLevel = "Medium"
    }
    
    # Assign wave numbers to users
    foreach ($user in $Users) {
        $user.MigrationWave = $Name
    }
    
    return @{
        Name = $Name
        Users = $Users
        TotalUsers = $totalUsers
        EstimatedTimeHours = [math]::Round($totalEstimatedTime / 60, 1)
        AverageComplexityScore = $averageComplexity
        AverageReadinessScore = $averageReadiness
        RiskLevel = $waveRiskLevel
        Statistics = @{
            Simple = $simpleCount
            Standard = $standardCount
            Complex = $complexCount
            HighRisk = $highRiskCount
            Ready = $readyCount
            MinorIssues = $minorIssuesCount
            NeedsAttention = $needsAttentionCount
            NotReady = $notReadyCount
        }
        Departments = ($Users | Group-Object -Property Department | ForEach-Object { "$($_.Name) ($($_.Count))" }) -join '; '
    }
}

function Optimize-MigrationWaves {
    param(
        [hashtable]$Waves,
        [hashtable]$Configuration
    )
    
    try {
        Write-MandALog "Optimizing migration waves" -Level "INFO"
        
        $optimizedWaves = $Waves.Clone()
        $maxWaveSize = $Configuration.processing.maxWaveSize
        
        # Check for waves that are too small and could be merged
        $smallWaves = @()
        $normalWaves = @()
        
        foreach ($waveKey in $optimizedWaves.Keys) {
            $wave = $optimizedWaves[$waveKey]
            if ($wave.TotalUsers -lt ($maxWaveSize * 0.3)) { # Less than 30% of max size
                $smallWaves += @{ Key = $waveKey; Wave = $wave }
            } else {
                $normalWaves += @{ Key = $waveKey; Wave = $wave }
            }
        }
        
        # Merge small waves with similar characteristics
        if ($smallWaves.Count -gt 1) {
            $mergedWaves = Merge-SmallWaves -SmallWaves $smallWaves -MaxWaveSize $maxWaveSize
            
            # Remove original small waves
            foreach ($smallWave in $smallWaves) {
                $optimizedWaves.Remove($smallWave.Key)
            }
            
            # Add merged waves
            $newWaveNumber = ($optimizedWaves.Keys | Measure-Object -Maximum).Maximum + 1
            foreach ($mergedWave in $mergedWaves) {
                $optimizedWaves[$newWaveNumber] = $mergedWave
                $newWaveNumber++
            }
        }
        
        # Rebalance waves if needed
        $rebalancedWaves = Rebalance-Waves -Waves $optimizedWaves -MaxWaveSize $maxWaveSize
        
        Write-MandALog "Wave optimization completed" -Level "SUCCESS"
        return $rebalancedWaves
        
    } catch {
        Write-MandALog "Error optimizing migration waves: $($_.Exception.Message)" -Level "ERROR"
        return $Waves
    }
}

function Merge-SmallWaves {
    param(
        [array]$SmallWaves,
        [int]$MaxWaveSize
    )
    
    $mergedWaves = @()
    $currentMergeUsers = @()
    $currentMergeName = ""
    
    # Sort small waves by risk level and complexity
    $sortedSmallWaves = $SmallWaves | Sort-Object @(
        @{ Expression = { Get-RiskWeight -RiskLevel $_.Wave.RiskLevel }; Descending = $false },
        @{ Expression = { $_.Wave.AverageComplexityScore }; Descending = $false }
    )
    
    foreach ($smallWave in $sortedSmallWaves) {
        $wave = $smallWave.Wave
        
        # Check if adding this wave would exceed max size
        if (($currentMergeUsers.Count + $wave.TotalUsers) -le $MaxWaveSize) {
            # Add to current merge
            $currentMergeUsers += $wave.Users
            if ([string]::IsNullOrWhiteSpace($currentMergeName)) {
                $currentMergeName = "Merged Wave - $($wave.Name)"
            } else {
                $currentMergeName += " + $($wave.Name)"
            }
        } else {
            # Create merged wave from current users
            if ($currentMergeUsers.Count -gt 0) {
                $mergedWave = Create-MigrationWave -Users $currentMergeUsers -Name $currentMergeName
                $mergedWaves += $mergedWave
            }
            
            # Start new merge
            $currentMergeUsers = $wave.Users
            $currentMergeName = "Merged Wave - $($wave.Name)"
        }
    }
    
    # Handle remaining users
    if ($currentMergeUsers.Count -gt 0) {
        $mergedWave = Create-MigrationWave -Users $currentMergeUsers -Name $currentMergeName
        $mergedWaves += $mergedWave
    }
    
    return $mergedWaves
}

function Rebalance-Waves {
    param(
        [hashtable]$Waves,
        [int]$MaxWaveSize
    )
    
    # For now, return waves as-is
    # Future enhancement: implement wave rebalancing logic
    return $Waves
}

function Generate-WaveSummary {
    param([hashtable]$Waves)
    
    $totalUsers = 0
    $totalTime = 0
    $waveSizes = @()
    
    foreach ($wave in $Waves.Values) {
        $totalUsers += $wave.TotalUsers
        $totalTime += $wave.EstimatedTimeHours
        $waveSizes += $wave.TotalUsers
    }
    
    $averageWaveSize = if ($Waves.Count -gt 0) { [math]::Round($totalUsers / $Waves.Count, 1) } else { 0 }
    $minWaveSize = if ($waveSizes.Count -gt 0) { ($waveSizes | Measure-Object -Minimum).Minimum } else { 0 }
    $maxWaveSize = if ($waveSizes.Count -gt 0) { ($waveSizes | Measure-Object -Maximum).Maximum } else { 0 }
    
    return @{
        TotalWaves = $Waves.Count
        TotalUsers = $totalUsers
        TotalEstimatedTimeHours = [math]::Round($totalTime, 1)
        AverageWaveSize = $averageWaveSize
        MinWaveSize = $minWaveSize
        MaxWaveSize = $maxWaveSize
    }
}

function Get-PriorityWeight {
    param([string]$Priority)
    
    switch ($Priority) {
        "High" { return 3 }
        "Medium" { return 2 }
        "Low" { return 1 }
        default { return 1 }
    }
}

function Get-RiskWeight {
    param([string]$RiskLevel)
    
    switch ($RiskLevel) {
        "Low" { return 1 }
        "Medium" { return 2 }
        "High" { return 3 }
        default { return 2 }
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Generate-MigrationWaves',
    'Generate-WavesByDepartment',
    'Generate-WavesByComplexity',
    'Create-MigrationWave',
    'Optimize-MigrationWaves'
)