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

function New-AdvancedWaveGeneration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$UserData,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$WaveConfig = @{
            MaxWaves = 5
            MaxUsersPerWave = 200
            MinUsersPerWave = 10
            WaveSpacingDays = 14
            TestUserPercentage = 5
            PilotUserPercentage = 15
        },
        
        [Parameter(Mandatory = $false)]
        [hashtable]$DepartmentRules = @{
            'IT' = @{ Priority = 'High'; Complexity = 'Low'; Wave = 1 }
            'Executive' = @{ Priority = 'High'; Complexity = 'Medium'; Wave = 1 }
            'HR' = @{ Priority = 'High'; Complexity = 'Medium'; Wave = 1 }
            'Finance' = @{ Priority = 'High'; Complexity = 'High'; Wave = 2 }
            'Legal' = @{ Priority = 'High'; Complexity = 'Medium'; Wave = 2 }
            'Marketing' = @{ Priority = 'Medium'; Complexity = 'Low'; Wave = 3 }
            'Sales' = @{ Priority = 'Medium'; Complexity = 'Medium'; Wave = 3 }
            'Operations' = @{ Priority = 'Medium'; Complexity = 'Medium'; Wave = 4 }
            'Support' = @{ Priority = 'Low'; Complexity = 'Low'; Wave = 4 }
            'Default' = @{ Priority = 'Medium'; Complexity = 'Medium'; Wave = 4 }
        },
        
        [Parameter(Mandatory = $false)]
        [string]$CompanyName = "Unknown"
    )
    
    Write-MandALog -Message "[AdvancedWaveGeneration] Starting advanced wave generation for $($UserData.Count) users..." -Level "INFO"
    
    # Step 1: Calculate complexity scores
    $userComplexity = @{}
    foreach ($user in $UserData) {
        $score = Get-UserComplexityScore -User $user -DepartmentRules $DepartmentRules
        $userComplexity[$user.UserPrincipalName] = @{
            Score = $score
            Category = if ($score -lt 30) { 'Low' } elseif ($score -lt 80) { 'Medium' } else { 'High' }
            User = $user
        }
    }
    
    # Step 2: Analyze dependencies
    $dependencies = Get-UserDependencies -UserData $UserData
    
    # Step 3: Create initial wave assignments
    $waves = Initialize-WaveStructure -WaveConfig $WaveConfig
    $waves = Assign-UsersToWaves -UserData $UserData -UserComplexity $userComplexity -Dependencies $dependencies -Waves $waves -DepartmentRules $DepartmentRules -WaveConfig $WaveConfig
    
    # Step 4: Balance waves
    $waves = Optimize-WaveBalance -Waves $waves -WaveConfig $WaveConfig
    
    # Step 5: Generate final plan
    $wavePlan = New-FinalWavePlan -Waves $waves -WaveConfig $WaveConfig -CompanyName $CompanyName
    
    Write-MandALog -Message "[AdvancedWaveGeneration] Generated $($wavePlan.TotalWaves) waves for $($wavePlan.TotalUsers) users" -Level "SUCCESS"
    
    return $wavePlan
}

function Get-UserComplexityScore {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [object]$User,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$DepartmentRules
    )
    
    $score = 0
    $complexityWeights = @{
        SecurityGroups = 2
        MailboxSize = 3
        SharedMailboxes = 4
        OneDriveSize = 2
        SharePointSites = 3
        TeamsOwnership = 4
        ApplicationAccess = 5
        AdminRoles = 10
        ServiceAccounts = 8
    }
    
    # Base complexity from department
    $department = if ($User.Department) { $User.Department } else { 'Default' }
    $deptRule = if ($DepartmentRules[$department]) { $DepartmentRules[$department] } else { $DepartmentRules['Default'] }
    
    switch ($deptRule.Complexity) {
        'Low' { $score += 10 }
        'Medium' { $score += 25 }
        'High' { $score += 50 }
    }
    
    # Security groups complexity
    if ($User.SecurityGroups) {
        $securityGroups = if ($User.SecurityGroups -is [array]) { $User.SecurityGroups } else { @($User.SecurityGroups) }
        $score += ($securityGroups.Count * $complexityWeights.SecurityGroups)
    }
    
    # Mailbox size complexity
    $mailboxSizeGB = [int](if ($User.MailboxSizeGB) { $User.MailboxSizeGB } else { 0 })
    if ($mailboxSizeGB -gt 50) { $score += $complexityWeights.MailboxSize * 5 }
    elseif ($mailboxSizeGB -gt 10) { $score += $complexityWeights.MailboxSize * 2 }
    elseif ($mailboxSizeGB -gt 0) { $score += $complexityWeights.MailboxSize }
    
    # Admin roles (high complexity)
    if ($User.AdminRoles) {
        $adminRoles = if ($User.AdminRoles -is [array]) { $User.AdminRoles } else { @($User.AdminRoles) }
        $score += ($adminRoles.Count * $complexityWeights.AdminRoles)
    }
    
    # Service accounts (very high complexity)
    if ($User.IsServiceAccount -eq $true -or $User.AccountType -eq 'Service') {
        $score += $complexityWeights.ServiceAccounts
    }
    
    return $score
}

function Get-UserDependencies {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$UserData
    )
    
    $dependencies = @{}
    
    foreach ($user in $UserData) {
        $userDeps = @()
        
        # Manager dependency
        if ($user.Manager) {
            $userDeps += @{
                Type = 'Manager'
                TargetUser = $user.Manager
                Weight = 3
            }
        }
        
        # Direct reports dependency
        if ($user.DirectReports) {
            $directReports = if ($user.DirectReports -is [array]) { $user.DirectReports } else { @($user.DirectReports) }
            foreach ($report in $directReports) {
                $userDeps += @{
                    Type = 'DirectReport'
                    TargetUser = $report
                    Weight = 2
                }
            }
        }
        
        $dependencies[$user.UserPrincipalName] = $userDeps
    }
    
    return $dependencies
}

function Initialize-WaveStructure {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$WaveConfig
    )
    
    $waves = @{}
    
    for ($i = 1; $i -le $WaveConfig.MaxWaves; $i++) {
        $waves[$i] = @{
            Users = @()
            TotalComplexity = 0
            UserCount = 0
            Departments = @{}
        }
    }
    
    return $waves
}

function Assign-UsersToWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$UserData,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$UserComplexity,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Dependencies,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$Waves,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$DepartmentRules,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$WaveConfig
    )
    
    # Sort users by department priority and complexity
    $sortedUsers = $UserData | Sort-Object {
        $user = $_
        $dept = if ($user.Department) { $user.Department } else { 'Default' }
        $deptRule = if ($DepartmentRules[$dept]) { $DepartmentRules[$dept] } else { $DepartmentRules['Default'] }
        
        $priorityWeight = switch ($deptRule.Priority) {
            'High' { 100 }
            'Medium' { 50 }
            'Low' { 10 }
            default { 30 }
        }
        
        $complexityScore = $UserComplexity[$user.UserPrincipalName].Score
        
        # Lower scores go first (easier users first within priority groups)
        ($priorityWeight * -1) + ($complexityScore * 0.1)
    }
    
    # Assign users to waves
    foreach ($user in $sortedUsers) {
        $userComplexityInfo = $UserComplexity[$user.UserPrincipalName]
        $department = if ($user.Department) { $user.Department } else { 'Default' }
        $deptRule = if ($DepartmentRules[$department]) { $DepartmentRules[$department] } else { $DepartmentRules['Default'] }
        
        # Determine preferred wave
        $preferredWave = $deptRule.Wave
        
        # Check if preferred wave has capacity
        $targetWave = $preferredWave
        if ($Waves[$preferredWave].UserCount -ge $WaveConfig.MaxUsersPerWave) {
            # Find next available wave
            for ($w = $preferredWave + 1; $w -le $WaveConfig.MaxWaves; $w++) {
                if ($Waves[$w].UserCount -lt $WaveConfig.MaxUsersPerWave) {
                    $targetWave = $w
                    break
                }
            }
        }
        
        # Create user assignment
        $assignment = @{
            UserPrincipalName = $user.UserPrincipalName
            DisplayName = if ($user.DisplayName) { $user.DisplayName } elseif ($user.Name) { $user.Name } else { $user.UserPrincipalName }
            Department = $department
            WaveNumber = $targetWave
            ComplexityScore = $userComplexityInfo.Score
            ComplexityCategory = $userComplexityInfo.Category
            Priority = $deptRule.Priority
            Dependencies = if ($Dependencies[$user.UserPrincipalName]) { $Dependencies[$user.UserPrincipalName] } else { @() }
            EstimatedMigrationTime = Get-EstimatedMigrationTime -ComplexityScore $userComplexityInfo.Score
            MigrationStatus = 'Planned'
            Notes = @()
        }
        
        # Add to wave
        $Waves[$targetWave].Users += $assignment
        $Waves[$targetWave].TotalComplexity += $userComplexityInfo.Score
        $Waves[$targetWave].UserCount++
        
        if (-not $Waves[$targetWave].Departments.ContainsKey($department)) {
            $Waves[$targetWave].Departments[$department] = 0
        }
        $Waves[$targetWave].Departments[$department]++
    }
    
    return $Waves
}

function Optimize-WaveBalance {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Waves,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$WaveConfig
    )
    
    # Simple optimization - move users between adjacent waves if needed
    foreach ($waveNum in ($Waves.Keys | Sort-Object)) {
        $wave = $Waves[$waveNum]
        
        # If wave is too large, move some users to next wave
        if ($wave.UserCount -gt $WaveConfig.MaxUsersPerWave) {
            $nextWave = $waveNum + 1
            if ($nextWave -le $WaveConfig.MaxWaves) {
                $excess = $wave.UserCount - $WaveConfig.MaxUsersPerWave
                $usersToMove = $wave.Users | Sort-Object ComplexityScore -Descending | Select-Object -First $excess
                
                foreach ($userToMove in $usersToMove) {
                    # Remove from current wave
                    $wave.Users = $wave.Users | Where-Object { $_.UserPrincipalName -ne $userToMove.UserPrincipalName }
                    $wave.UserCount--
                    $wave.TotalComplexity -= $userToMove.ComplexityScore
                    
                    # Add to next wave
                    $userToMove.WaveNumber = $nextWave
                    $Waves[$nextWave].Users += $userToMove
                    $Waves[$nextWave].UserCount++
                    $Waves[$nextWave].TotalComplexity += $userToMove.ComplexityScore
                }
            }
        }
    }
    
    return $Waves
}

function New-FinalWavePlan {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Waves,
        
        [Parameter(Mandatory = $true)]
        [hashtable]$WaveConfig,
        
        [Parameter(Mandatory = $true)]
        [string]$CompanyName
    )
    
    $plan = @{
        CompanyName = $CompanyName
        GeneratedDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        TotalUsers = 0
        TotalWaves = 0
        WaveDetails = @{}
        WaveAssignments = @()
        Summary = @{
            ByComplexity = @{}
            ByDepartment = @{}
            ByWave = @{}
        }
        Timeline = @()
        Recommendations = @()
    }
    
    $startDate = Get-Date
    
    foreach ($waveNum in ($Waves.Keys | Sort-Object)) {
        $wave = $Waves[$waveNum]
        
        if ($wave.UserCount -eq 0) {
            continue
        }
        
        $plan.TotalWaves++
        $plan.TotalUsers += $wave.UserCount
        
        # Calculate wave dates
        $waveStartDate = $startDate.AddDays(($waveNum - 1) * $WaveConfig.WaveSpacingDays)
        $totalEstimatedHours = ($wave.Users | Measure-Object EstimatedMigrationTime -Sum).Sum
        $completionDate = $waveStartDate.AddDays([Math]::Ceiling($totalEstimatedHours / 8))
        
        $waveDetail = @{
            WaveNumber = $waveNum
            UserCount = $wave.UserCount
            TotalComplexity = $wave.TotalComplexity
            AverageComplexity = if ($wave.UserCount -gt 0) { [Math]::Round($wave.TotalComplexity / $wave.UserCount, 2) } else { 0 }
            Departments = $wave.Departments
            StartDate = $waveStartDate.ToString('yyyy-MM-dd')
            EstimatedCompletionDate = $completionDate.ToString('yyyy-MM-dd')
            EstimatedDurationDays = [Math]::Ceiling(($completionDate - $waveStartDate).TotalDays)
            EstimatedEffortHours = $totalEstimatedHours
            Users = $wave.Users
        }
        
        $plan.WaveDetails[$waveNum] = $waveDetail
        $plan.WaveAssignments += $wave.Users
        
        # Add to timeline
        $plan.Timeline += @{
            WaveNumber = $waveNum
            Phase = 'Migration'
            StartDate = $waveStartDate.ToString('yyyy-MM-dd')
            EndDate = $completionDate.ToString('yyyy-MM-dd')
            UserCount = $wave.UserCount
            Description = "Wave $waveNum migration - $($wave.UserCount) users"
        }
    }
    
    # Generate summary statistics
    if ($plan.WaveAssignments.Count -gt 0) {
        # By complexity
        $complexityGroups = $plan.WaveAssignments | Group-Object ComplexityCategory
        foreach ($group in $complexityGroups) {
            $plan.Summary.ByComplexity[$group.Name] = $group.Count
        }
        
        # By department
        $deptGroups = $plan.WaveAssignments | Group-Object Department
        foreach ($group in $deptGroups) {
            $plan.Summary.ByDepartment[$group.Name] = $group.Count
        }
        
        # By wave
        $waveGroups = $plan.WaveAssignments | Group-Object WaveNumber
        foreach ($group in $waveGroups) {
            $plan.Summary.ByWave["Wave $($group.Name)"] = $group.Count
        }
    }
    
    # Generate recommendations
    $plan.Recommendations = @("Wave plan generated successfully with optimized user distribution")
    
    return $plan
}

function Get-EstimatedMigrationTime {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [int]$ComplexityScore
    )
    
    # Return estimated hours based on complexity
    if ($ComplexityScore -lt 30) { return 2 }       # Low complexity: 2 hours
    elseif ($ComplexityScore -lt 80) { return 4 }   # Medium complexity: 4 hours
    else { return 8 }                               # High complexity: 8 hours
}

Export-ModuleMember -Function Invoke-WaveGeneration, New-AdvancedWaveGeneration, Get-UserComplexityScore, Get-UserDependencies, Get-EstimatedMigrationTime