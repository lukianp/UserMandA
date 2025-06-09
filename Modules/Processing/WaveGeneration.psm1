# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}


function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}


    M&A Discovery Suite - Enhanced Migration Wave Generation Module
.DESCRIPTION
    Generates migration waves considering Exchange permission dependencies,
    shared mailbox access, and co-migration requirements.
.NOTES
    Version: 2.0.2 (Corrected context access at module scope)
#>

[CmdletBinding()]
param()

# NOTE: Context access has been moved to function scope to avoid module loading issues.
# The global context ($global:MandA) will be accessed by functions when they are called,
# rather than at module import time. Directory creation will be handled by the orchestrator
# or individual functions as needed.

# Main function to generate migration waves with dependency awareness
function New-MigrationWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )
    # Use Write-MandALog if available, otherwise Write-Host
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }


    $LogFn.Invoke("Starting Enhanced Migration Wave Generation..." , "INFO")
    $migrationWaves = [System.Collections.Generic.List[object]]::new()

    if ($null -eq $Profiles -or $Profiles.Count -eq 0) {
        $LogFn.Invoke("No user profiles provided. Cannot generate migration waves.", "WARN")
        return $migrationWaves
    }

    # Get configuration settings
    $generateByDepartment = $false
    if ($Configuration.processing.ContainsKey('generateWavesByDepartment')) {
        $generateByDepartment = $Configuration.processing.generateWavesByDepartment
    }
    
    $maxWaveSize = 50
    if ($Configuration.processing.ContainsKey('maxWaveSize') -and $Configuration.processing.maxWaveSize -gt 0) {
        $maxWaveSize = $Configuration.processing.maxWaveSize
    }
    
    $respectDependencies = $true # New setting to respect Exchange dependencies
    if ($Configuration.processing.ContainsKey('respectExchangeDependencies')) {
        $respectDependencies = $Configuration.processing.respectExchangeDependencies
    }

    $LogFn.Invoke("Wave generation settings:", "INFO")
    $LogFn.Invoke("  Strategy: $(if ($generateByDepartment) {'Department-Based'} else {'Complexity-Based'})", "INFO")
    $LogFn.Invoke("  Max wave size: $maxWaveSize", "INFO")
    $LogFn.Invoke("  Respect Exchange dependencies: $respectDependencies", "INFO")
    
    # Phase 1: Identify dependency clusters
    $LogFn.Invoke("Phase 1: Analyzing Exchange permission dependencies...", "INFO")
    $dependencyClusters = @{}
    $processedUsers = @{} # Tracks users already assigned to a cluster to avoid reprocessing
    
    if ($respectDependencies) {
        # Iterate through all profiles to find starting points for clusters (users requiring co-migration)
        # Ensure ExchangePermissions and PermissionsGrantedTo exist and are not null before trying to count
        foreach ($userProfile in $Profiles | Where-Object { $_.RequiresCoMigration -or ($_.PSObject.Properties['ExchangePermissions'] -and $_.ExchangePermissions -and $_.ExchangePermissions.PSObject.Properties['PermissionsGrantedTo'] -and $_.ExchangePermissions.PermissionsGrantedTo -and $_.ExchangePermissions.PermissionsGrantedTo.Count -gt 0) }) {
            $upn = $userProfile.UserPrincipalName
            
            if (-not $processedUsers.ContainsKey($upn)) {
                $clusterId = [guid]::NewGuid().ToString()
                $currentClusterUsers = [System.Collections.Generic.List[string]]::new()
                $clusterComplexityScore = 0
                
                $usersToProcessQueue = [System.Collections.Queue]::new()
                $usersToProcessQueue.Enqueue($upn)
                $processedUsers[$upn] = $clusterId 
                
                while ($usersToProcessQueue.Count -gt 0) {
                    $currentUserUPN = $usersToProcessQueue.Dequeue()
                    
                    if (-not $currentClusterUsers.Contains($currentUserUPN)) {
                        $currentClusterUsers.Add($currentUserUPN)
                        
                        $currentUserProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $currentUserUPN } | Select-Object -First 1
                        
                        if ($currentUserProfile) {
                            $clusterComplexityScore += $currentUserProfile.ComplexityScore
                            
                            if ($currentUserProfile.PSObject.Properties['CoMigrationUsers'] -and $currentUserProfile.CoMigrationUsers) {
                                foreach ($coUserUPN in $currentUserProfile.CoMigrationUsers) {
                                    if (-not $processedUsers.ContainsKey($coUserUPN)) {
                                        $usersToProcessQueue.Enqueue($coUserUPN)
                                        $processedUsers[$coUserUPN] = $clusterId 
                                    } elseif ($processedUsers[$coUserUPN] -ne $clusterId) {
                                        $LogFn.Invoke("User $coUserUPN is part of cluster $($processedUsers[$coUserUPN]) but also linked to $currentUserUPN in new cluster $clusterId. Handle merge logic if necessary.", "WARN")
                                    }
                                }
                            }
                            
                            if ($currentUserProfile.PSObject.Properties['ExchangePermissions'] -and $currentUserProfile.ExchangePermissions -and $currentUserProfile.ExchangePermissions.PSObject.Properties['PermissionsGrantedTo'] -and $currentUserProfile.ExchangePermissions.PermissionsGrantedTo) {
                                foreach ($permissionEntry in $currentUserProfile.ExchangePermissions.PermissionsGrantedTo) {
                                    $trusteeUPN = $permissionEntry.Trustee
                                    if ($trusteeUPN -like "*@*" -and (-not $processedUsers.ContainsKey($trusteeUPN))) { 
                                        $usersToProcessQueue.Enqueue($trusteeUPN)
                                        $processedUsers[$trusteeUPN] = $clusterId 
                                    } elseif ($trusteeUPN -like "*@*" -and $processedUsers.ContainsKey($trusteeUPN) -and $processedUsers[$trusteeUPN] -ne $clusterId) {
                                        $LogFn.Invoke("Trustee $trusteeUPN (has perm to $currentUserUPN) is part of cluster $($processedUsers[$trusteeUPN]) but also linked via $currentUserUPN in new cluster $clusterId. Handle merge logic if necessary.", "WARN")
                                    }
                                }
                            }
                        }
                    }
                }
                
                if ($currentClusterUsers.Count -gt 0) {
                    $dependencyClusters[$clusterId] = @{
                        Id                = $clusterId
                        Users             = $currentClusterUsers
                        Reason            = "Exchange Permission Dependencies or Co-Migration"
                        ComplexityScore   = $clusterComplexityScore
                        Size              = $currentClusterUsers.Count
                    }
                    $LogFn.Invoke("Created dependency cluster $clusterId with $($currentClusterUsers.Count) users", "DEBUG")
                }
            }
        }
        $LogFn.Invoke("Identified $($dependencyClusters.Count) dependency clusters after initial scan.", "INFO")
    }
    
    $LogFn.Invoke("Phase 2: Analyzing shared mailbox groupings...", "INFO")
    $sharedMailboxGroups = @{}
    
    # Ensure ExchangePermissions and SharedMailboxAccess exist before iterating
    foreach ($userProfile in $Profiles | Where-Object { $_.PSObject.Properties['SharedMailboxCount'] -and $_.SharedMailboxCount -gt 0 -and $_.PSObject.Properties['ExchangePermissions'] -and $_.ExchangePermissions -and $_.ExchangePermissions.PSObject.Properties['SharedMailboxAccess'] -and $_.ExchangePermissions.SharedMailboxAccess }) {
        if ($userProfile.ExchangePermissions -and $userProfile.ExchangePermissions.SharedMailboxAccess) {
            foreach ($sharedMbx in $userProfile.ExchangePermissions.SharedMailboxAccess) {
                $mbxEmail = $sharedMbx.SharedMailbox
                
                if (-not $sharedMailboxGroups.ContainsKey($mbxEmail)) {
                    $sharedMailboxGroups[$mbxEmail] = @{
                        SharedMailbox = $mbxEmail
                        DisplayName   = $sharedMbx.DisplayName
                        Users         = [System.Collections.Generic.List[string]]::new()
                        TotalSize     = $sharedMbx.MailboxSize 
                    }
                }
                
                if (-not $sharedMailboxGroups[$mbxEmail].Users.Contains($userProfile.UserPrincipalName)) {
                    $sharedMailboxGroups[$mbxEmail].Users.Add($userProfile.UserPrincipalName)
                }
            }
        }
    }
    
    foreach ($mbxEmail in $sharedMailboxGroups.Keys) {
        $group = $sharedMailboxGroups[$mbxEmail]
        if ($group.Users.Count -gt 5) { 
            $LogFn.Invoke("Shared mailbox '$($group.DisplayName)' ($mbxEmail) has $($group.Users.Count) users with access", "INFO")
        }
    }
    
    $LogFn.Invoke("Phase 3: Generating migration waves...", "INFO")
    $waveCounter = 1
    $assignedUsersToWaves = @{} 

    function New-WaveObjectLocal { # Renamed to avoid conflict if New-WaveObject is global
        param(
            [string]$WaveName, [int]$CurrentWaveCounter, [System.Collections.IList]$WaveUserProfiles,
            [string]$Criteria, [bool]$IsDependencyCluster = $false, [string]$ClusterId = $null, [string]$Notes = ""
        )
        $avgComplexity = 0
        if ($WaveUserProfiles.Count -gt 0) {
            $avgComplexity = [math]::Round(($WaveUserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
        }
        return [PSCustomObject]@{
            WaveName           = $WaveName; WaveID = "WAVE-$CurrentWaveCounter"; WaveOrder = $CurrentWaveCounter
            TotalUsers         = $WaveUserProfiles.Count; UserPrincipalNames = ($WaveUserProfiles.UserPrincipalName -join ";")
            Criteria           = $Criteria; AverageComplexity = $avgComplexity; DependencyCluster = $IsDependencyCluster
            ClusterId          = $ClusterId; Notes = $Notes; UserProfilesInWave = $WaveUserProfiles
        }
    }

    if ($generateByDepartment) {
        $usersByDepartment = $Profiles | Group-Object -Property @{ Expression = { if ([string]::IsNullOrWhiteSpace($_.Department)) { "_NoDepartment" } else { $_.Department } } }
        
        foreach ($deptGroup in $usersByDepartment | Sort-Object Name) {
            $departmentName = $deptGroup.Name
            $deptUsersProfiles = [System.Collections.Generic.List[object]]::new($deptGroup.Group)
            $deptWaveNumber = 1
            $LogFn.Invoke("Processing department: '$departmentName' with $($deptUsersProfiles.Count) users", "DEBUG")
            $unassignedDeptUsers = $deptUsersProfiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
            
            if ($respectDependencies) {
                foreach ($clusterId in $dependencyClusters.Keys) {
                    $cluster = $dependencyClusters[$clusterId]
                    $clusterUsersInCurrentDept = $cluster.Users | Where-Object { ($deptUsersProfiles.UserPrincipalName -contains $_) -and (-not $assignedUsersToWaves.ContainsKey($_)) }
                    if ($clusterUsersInCurrentDept.Count -gt 0) {
                        $allClusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }
                        if ($allClusterUserUPNsToWave.Count -gt 0) {
                            $clusterUserProfilesToWave = $Profiles | Where-Object { $allClusterUserUPNsToWave -contains $_.UserPrincipalName }
                            $wave = New-WaveObjectLocal -WaveName "Dept-$departmentName-Wave$deptWaveNumber-Cluster" -CurrentWaveCounter $waveCounter -WaveUserProfiles $clusterUserProfilesToWave -Criteria "Department: $departmentName (Dependency Cluster)" -IsDependencyCluster $true -ClusterId $clusterId -Notes "Contains users due to Exchange dependencies, potentially across departments."
                            $migrationWaves.Add($wave); $allClusterUserUPNsToWave | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }; $waveCounter++; $deptWaveNumber++
                            $unassignedDeptUsers = $unassignedDeptUsers | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
                        }
                    }
                }
            }
            
            $remainingDeptUsersToWave = $unassignedDeptUsers | Sort-Object ComplexityScore, DisplayName
            for ($i = 0; $i -lt $remainingDeptUsersToWave.Count; $i += $maxWaveSize) {
                $waveUserBatch = $remainingDeptUsersToWave[$i..[System.Math]::Min($i + $maxWaveSize - 1, $remainingDeptUsersToWave.Count - 1)]
                if ($waveUserBatch.Count -eq 0) { continue }
                $wave = New-WaveObjectLocal -WaveName "Dept-$departmentName-Wave$deptWaveNumber" -CurrentWaveCounter $waveCounter -WaveUserProfiles $waveUserBatch -Criteria "Department: $departmentName"
                $migrationWaves.Add($wave); $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }; $waveCounter++; $deptWaveNumber++
            }
        }
    } else { 
        if ($respectDependencies) {
            $sortedClusterIds = $dependencyClusters.Keys | Sort-Object { $dependencyClusters[$_].ComplexityScore }
            foreach ($clusterId in $sortedClusterIds) {
                $cluster = $dependencyClusters[$clusterId]
                $clusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }
                if ($clusterUserUPNsToWave.Count -eq 0) { continue } 
                $clusterUserProfiles = $Profiles | Where-Object { $clusterUserUPNsToWave -contains $_.UserPrincipalName }
                if ($clusterUserProfiles.Count -gt $maxWaveSize) {
                    $LogFn.Invoke("Dependency cluster $clusterId ($($clusterUserProfiles.Count) users) exceeds max wave size. Splitting by complexity.", "WARN")
                    $sortedClusterUsersForSplitting = $clusterUserProfiles | Sort-Object ComplexityScore, DisplayName
                    for ($i = 0; $i -lt $sortedClusterUsersForSplitting.Count; $i += $maxWaveSize) {
                        $subWaveUsers = $sortedClusterUsersForSplitting[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedClusterUsersForSplitting.Count - 1)]
                        if ($subWaveUsers.Count -eq 0) { continue }
                        $wave = New-WaveObjectLocal -WaveName "Dependency-Wave$waveCounter-Split" -CurrentWaveCounter $waveCounter -WaveUserProfiles $subWaveUsers -Criteria "Exchange Dependency Cluster (Split)" -IsDependencyCluster $true -ClusterId $clusterId -Notes "Large dependency cluster part."
                        $migrationWaves.Add($wave); $subWaveUsers.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }; $waveCounter++
                    }
                } else {
                    $wave = New-WaveObjectLocal -WaveName "Dependency-Wave$waveCounter" -CurrentWaveCounter $waveCounter -WaveUserProfiles $clusterUserProfiles -Criteria "Exchange Dependency Cluster" -IsDependencyCluster $true -ClusterId $clusterId
                    $migrationWaves.Add($wave); $clusterUserProfiles.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }; $waveCounter++
                }
            }
        }
        
        $usersNotYetWaved = $Profiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
        $sortedRemainingUsers = $usersNotYetWaved | Sort-Object ComplexityScore, DisplayName
        for ($i = 0; $i -lt $sortedRemainingUsers.Count; $i += $maxWaveSize) {
            $waveUserBatch = $sortedRemainingUsers[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedRemainingUsers.Count - 1)]
            if ($waveUserBatch.Count -eq 0) { continue }
            $wave = New-WaveObjectLocal -WaveName "Complexity-Wave$waveCounter" -CurrentWaveCounter $waveCounter -WaveUserProfiles $waveUserBatch -Criteria "Complexity Score Grouping"
            $migrationWaves.Add($wave); $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }; $waveCounter++
        }
    }
    
    $LogFn.Invoke("Phase 4: Updating user profiles with wave assignments...", "INFO")
    foreach ($wave in $migrationWaves) {
        foreach ($userProfileInWave in $wave.UserProfilesInWave) {
            $originalProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $userProfileInWave.UserPrincipalName } | Select-Object -First 1
            if ($originalProfile) {
                # Ensure the property can be added or updated.
                if ($originalProfile.PSObject.Properties["MigrationWave"]) {
                    $originalProfile.MigrationWave = $wave.WaveID
                } else {
                    $originalProfile | Add-Member -MemberType NoteProperty -Name "MigrationWave" -Value $wave.WaveID
                }
                if ($wave.DependencyCluster) {
                    $currentNotes = if ($originalProfile.PSObject.Properties["Notes"]) { $originalProfile.Notes } else { "" }
                    $newNote = "Part of Exchange dependency cluster $($wave.ClusterId)."
                    if ($originalProfile.PSObject.Properties["Notes"]) {
                         $originalProfile.Notes = "$currentNotes $newNote".Trim()
                    } else {
                         $originalProfile | Add-Member -MemberType NoteProperty -Name "Notes" -Value $newNote
                    }
                }
            }
        }
    }
    
    $LogFn.Invoke("Phase 5: Generating wave summary...", "INFO")
    if ($migrationWaves.Count -gt 0) {
        $waveSummary = @{
            TotalWaves        = $migrationWaves.Count
            TotalUsers        = ($migrationWaves | Measure-Object -Property TotalUsers -Sum).Sum
            DependencyWaves   = ($migrationWaves | Where-Object { $_.DependencyCluster }).Count
            StandardWaves     = ($migrationWaves | Where-Object { -not $_.DependencyCluster }).Count
            LargestWaveUsers  = ($migrationWaves | Measure-Object -Property TotalUsers -Maximum).Maximum
            SmallestWaveUsers = ($migrationWaves | Measure-Object -Property TotalUsers -Minimum).Minimum
            AverageWaveSize   = [math]::Round(($migrationWaves | Measure-Object -Property TotalUsers -Average).Average, 1)
        }
        $LogFn.Invoke("Wave Generation Summary:", "INFO")
        foreach ($key in $waveSummary.Keys | Sort-Object) { $LogFn.Invoke("  $key`: $($waveSummary[$key])", "INFO") }
        if ($migrationWaves[0].PSObject.Properties["GenerationSummary"]) {
            $migrationWaves[0].GenerationSummary = $waveSummary
        } else {
            $migrationWaves[0] | Add-Member -MemberType NoteProperty -Name "GenerationSummary" -Value $waveSummary
        }
    } else {
        $LogFn.Invoke("No migration waves were generated.", "WARN")
    }
    
    $LogFn.Invoke("Enhanced Migration Wave Generation completed. $($migrationWaves.Count) waves created.", "SUCCESS")
    return $migrationWaves
}

function Test-WaveDependencies {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [System.Collections.IList]$Waves, 
        [Parameter(Mandatory = $true)] [System.Collections.IList]$Profiles 
    )
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }
    $LogFn.Invoke("Validating wave dependencies...", "INFO")
    $issues = [System.Collections.Generic.List[object]]::new()
    $userWaveOrderLookup = @{}
    foreach ($wave in $Waves) {
        $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }
        foreach ($upn in $waveUPNs) { $userWaveOrderLookup[$upn.Trim()] = $wave.WaveOrder }
    }
    foreach ($userProfile in $Profiles) {
        if ($userProfile.PSObject.Properties['RequiresCoMigration'] -and $userProfile.RequiresCoMigration -and $userProfile.PSObject.Properties['CoMigrationUsers'] -and $userProfile.CoMigrationUsers) {
            $currentUserUPN = $userProfile.UserPrincipalName
            $currentUserWaveOrder = $userWaveOrderLookup[$currentUserUPN]
            if ($null -eq $currentUserWaveOrder) { continue }
            foreach ($dependentUserUPN in $userProfile.CoMigrationUsers) {
                $dependentUserWaveOrder = $userWaveOrderLookup[$dependentUserUPN]
                if ($null -ne $dependentUserWaveOrder) {
                    if ($dependentUserWaveOrder -gt $currentUserWaveOrder) {
                        $issues.Add([PSCustomObject]@{ User = $currentUserUPN; UserWaveOrder = $currentUserWaveOrder; DependentUser = $dependentUserUPN; DependentWaveOrder = $dependentUserWaveOrder; Issue = "Co-dependent user '$dependentUserUPN' is scheduled in a later wave (Order $dependentUserWaveOrder) than '$currentUserUPN' (Order $currentUserWaveOrder)." })
                    }
                } else { $LogFn.Invoke("Co-dependent user '$dependentUserUPN' for '$currentUserUPN' not found in any wave during validation.", "DEBUG") }
            }
        }
    }
    if ($issues.Count -gt 0) {
        $LogFn.Invoke("Found $($issues.Count) dependency issues in wave planning:", "WARN")
        $issues | ForEach-Object { $LogFn.Invoke("  User '$($_.User)' (Wave Order $($_.UserWaveOrder)) depends on '$($_.DependentUser)', but dependent is in later Wave Order $($_.DependentWaveOrder).", "WARN") }
    } else { $LogFn.Invoke("No co-migration dependency issues found in wave planning.", "SUCCESS") }
    return $issues
}

function Optimize-SharedMailboxWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)] [System.Collections.IList]$Waves, 
        [Parameter(Mandatory = $true)] [System.Collections.IList]$Profiles, 
        [Parameter(Mandatory = $false)] [int]$MinUsersForOptimization = 3 
    )
    $LogFn = if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) { Get-Command Write-MandALog } else { Get-Command Write-Host }
    $LogFn.Invoke("Analyzing waves for shared mailbox migration optimization...", "INFO")
    $sharedMailboxStats = @{}; $userToWaveIDLookup = @{}
    foreach ($wave in $Waves) { $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }; foreach ($upn in $waveUPNs) { $userToWaveIDLookup[$upn.Trim()] = $wave.WaveID } }
    foreach ($userProfile in $Profiles | Where-Object { $_.PSObject.Properties['SharedMailboxCount'] -and $_.SharedMailboxCount -gt 0 -and $_.PSObject.Properties['ExchangePermissions'] -and $_.ExchangePermissions -and $_.ExchangePermissions.PSObject.Properties['SharedMailboxAccess'] -and $_.ExchangePermissions.SharedMailboxAccess }) {
        $userUPN = $userProfile.UserPrincipalName; $userWaveID = $userToWaveIDLookup[$userUPN]
        foreach ($sharedMbxAccessInfo in $userProfile.ExchangePermissions.SharedMailboxAccess) {
            $mbxEmail = $sharedMbxAccessInfo.SharedMailbox
            if (-not $sharedMailboxStats.ContainsKey($mbxEmail)) { $sharedMailboxStats[$mbxEmail] = @{ Mailbox = $mbxEmail; DisplayName = $sharedMbxAccessInfo.DisplayName; Users = [System.Collections.Generic.List[string]]::new(); WaveIDs = [System.Collections.Generic.List[string]]::new(); UserWaveMapping = @{} } }
            $sharedMailboxStats[$mbxEmail].Users.Add($userUPN)
            if ($userWaveID -and (-not $sharedMailboxStats[$mbxEmail].WaveIDs.Contains($userWaveID))) { $sharedMailboxStats[$mbxEmail].WaveIDs.Add($userWaveID) }
            $sharedMailboxStats[$mbxEmail].UserWaveMapping[$userUPN] = $userWaveID
        }
    }
    $optimizationCandidates = [System.Collections.Generic.List[object]]::new()
    foreach ($mbxEmail in $sharedMailboxStats.Keys) {
        $stats = $sharedMailboxStats[$mbxEmail]
        if ($stats.Users.Count -ge $MinUsersForOptimization -and $stats.WaveIDs.Count -gt 1) {
            $LogFn.Invoke("Shared mailbox '$($stats.DisplayName)' ($mbxEmail) has $($stats.Users.Count) users spread across $($stats.WaveIDs.Count) waves. Consider consolidating.", "INFO")
            $optimizationCandidates.Add($stats)
        }
    }
    $LogFn.Invoke("Found $($optimizationCandidates.Count) shared mailboxes that could potentially benefit from wave consolidation of their users.", "INFO")
    return @{ SharedMailboxAccessDetails = $sharedMailboxStats; OptimizationSuggestions = $optimizationCandidates }
}

Export-ModuleMember -Function New-MigrationWaves, Test-WaveDependencies, Optimize-SharedMailboxWaves

