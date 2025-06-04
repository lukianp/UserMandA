#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Migration Wave Generation Module
.DESCRIPTION
    Generates migration waves considering Exchange permission dependencies,
    shared mailbox access, and co-migration requirements.
.NOTES
    Version: 2.0.0 - Enhanced with Exchange dependency awareness
#>

[CmdletBinding()]
param()
#Updated global logging thingy
        if ($null -eq $global:MandA) {
    throw "Global environment not initialized"
}
        $outputPath = $Context.Paths.RawDataOutput

        if (-not (Test-Path $Context.Paths.RawDataOutput)) {
    New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force
}
# Main function to generate migration waves with dependency awareness
function New-MigrationWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Enhanced Migration Wave Generation..." -Level "INFO"
    $migrationWaves = [System.Collections.Generic.List[object]]::new()

    if ($null -eq $Profiles -or $Profiles.Count -eq 0) {
        Write-MandALog "No user profiles provided. Cannot generate migration waves." -Level "WARN"
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

    Write-MandALog "Wave generation settings:" -Level "INFO"
    Write-MandALog "  Strategy: $(if ($generateByDepartment) {'Department-Based'} else {'Complexity-Based'})" -Level "INFO"
    Write-MandALog "  Max wave size: $maxWaveSize" -Level "INFO"
    Write-MandALog "  Respect Exchange dependencies: $respectDependencies" -Level "INFO"
    
    # Phase 1: Identify dependency clusters
    Write-MandALog "Phase 1: Analyzing Exchange permission dependencies..." -Level "INFO"
    $dependencyClusters = @{}
    $processedUsers = @{} # Tracks users already assigned to a cluster to avoid reprocessing
    
    if ($respectDependencies) {
        # Iterate through all profiles to find starting points for clusters (users requiring co-migration)
        foreach ($userProfile in $Profiles | Where-Object { $_.RequiresCoMigration -or ($_.ExchangePermissions.PermissionsGrantedTo -and $_.ExchangePermissions.PermissionsGrantedTo.Count -gt 0) }) {
            $upn = $userProfile.UserPrincipalName
            
            # If this user hasn't been processed as part of another cluster yet
            if (-not $processedUsers.ContainsKey($upn)) {
                $clusterId = [guid]::NewGuid().ToString()
                $currentClusterUsers = [System.Collections.Generic.List[string]]::new()
                $clusterComplexityScore = 0
                
                $usersToProcessQueue = [System.Collections.Queue]::new()
                $usersToProcessQueue.Enqueue($upn)
                $processedUsers[$upn] = $clusterId # Mark initial user as processed for this cluster
                
                while ($usersToProcessQueue.Count -gt 0) {
                    $currentUserUPN = $usersToProcessQueue.Dequeue()
                    
                    if (-not $currentClusterUsers.Contains($currentUserUPN)) {
                        $currentClusterUsers.Add($currentUserUPN)
                        
                        $currentUserProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $currentUserUPN } | Select-Object -First 1
                        
                        if ($currentUserProfile) {
                            $clusterComplexityScore += $currentUserProfile.ComplexityScore
                            
                            # Add their explicitly defined co-migration users
                            if ($currentUserProfile.CoMigrationUsers) {
                                foreach ($coUserUPN in $currentUserProfile.CoMigrationUsers) {
                                    if (-not $processedUsers.ContainsKey($coUserUPN)) {
                                        $usersToProcessQueue.Enqueue($coUserUPN)
                                        $processedUsers[$coUserUPN] = $clusterId # Mark for this cluster
                                    } elseif ($processedUsers[$coUserUPN] -ne $clusterId) {
                                        # This user is already in another cluster - potential merge or conflict
                                        Write-MandALog "User $coUserUPN is part of cluster $($processedUsers[$coUserUPN]) but also linked to $currentUserUPN in new cluster $clusterId. Handle merge logic if necessary." -Level "WARN"
                                    }
                                }
                            }
                            
                            # Add users who have permissions TO this current user's mailbox (they depend on this user)
                            if ($currentUserProfile.ExchangePermissions.PermissionsGrantedTo) {
                                foreach ($permissionEntry in $currentUserProfile.ExchangePermissions.PermissionsGrantedTo) {
                                    $trusteeUPN = $permissionEntry.Trustee
                                    if ($trusteeUPN -like "*@*" -and (-not $processedUsers.ContainsKey($trusteeUPN))) { # Check if it's a UPN and not processed
                                        $usersToProcessQueue.Enqueue($trusteeUPN)
                                        $processedUsers[$trusteeUPN] = $clusterId # Mark for this cluster
                                    } elseif ($trusteeUPN -like "*@*" -and $processedUsers.ContainsKey($trusteeUPN) -and $processedUsers[$trusteeUPN] -ne $clusterId) {
                                        Write-MandALog "Trustee $trusteeUPN (has perm to $currentUserUPN) is part of cluster $($processedUsers[$trusteeUPN]) but also linked via $currentUserUPN in new cluster $clusterId. Handle merge logic if necessary." -Level "WARN"
                                    }
                                }
                            }

                            # Add users WHOSE mailboxes this current user has permissions ON (this user depends on them)
                            # This logic might be complex if A has perm on B, B should migrate with or before A.
                            # The current script focuses on CoMigrationUsers and PermissionsGrantedTo.
                            # If A has access to B's mailbox, and B requires co-migration, B's processing should pull A in if not already.
                        }
                    }
                }
                
                if ($currentClusterUsers.Count > 0) {
                    $dependencyClusters[$clusterId] = @{
                        Id              = $clusterId
                        Users           = $currentClusterUsers
                        Reason          = "Exchange Permission Dependencies or Co-Migration"
                        ComplexityScore = $clusterComplexityScore
                        Size            = $currentClusterUsers.Count
                    }
                    Write-MandALog "Created dependency cluster $clusterId with $($currentClusterUsers.Count) users" -Level "DEBUG"
                }
            }
        }
        Write-MandALog "Identified $($dependencyClusters.Count) dependency clusters after initial scan." -Level "INFO"
    }
    
    # Phase 2: Group shared mailbox users (Informational, not directly used for wave structure in this version)
    Write-MandALog "Phase 2: Analyzing shared mailbox groupings..." -Level "INFO"
    $sharedMailboxGroups = @{}
    
    foreach ($userProfile in $Profiles | Where-Object { $_.SharedMailboxCount -gt 0 }) {
        if ($userProfile.ExchangePermissions -and $userProfile.ExchangePermissions.SharedMailboxAccess) {
            foreach ($sharedMbx in $userProfile.ExchangePermissions.SharedMailboxAccess) {
                $mbxEmail = $sharedMbx.SharedMailbox
                
                if (-not $sharedMailboxGroups.ContainsKey($mbxEmail)) {
                    $sharedMailboxGroups[$mbxEmail] = @{
                        SharedMailbox = $mbxEmail
                        DisplayName   = $sharedMbx.DisplayName
                        Users         = [System.Collections.Generic.List[string]]::new()
                        TotalSize     = $sharedMbx.MailboxSize # Assuming MailboxSize is on the sharedMbx object
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
        if ($group.Users.Count -gt 5) { # Log if more than 5 users access the same shared mailbox
            Write-MandALog "Shared mailbox '$($group.DisplayName)' ($mbxEmail) has $($group.Users.Count) users with access" -Level "INFO"
        }
    }
    
    # Phase 3: Generate waves based on strategy
    Write-MandALog "Phase 3: Generating migration waves..." -Level "INFO"
    $waveCounter = 1
    $assignedUsersToWaves = @{} # Tracks UPN to WaveID to prevent double assignment

    # Helper to create a wave object
    function New-WaveObject {
        param(
            [string]$WaveName,
            [int]$CurrentWaveCounter,
            [System.Collections.IList]$WaveUserProfiles,
            [string]$Criteria,
            [bool]$IsDependencyCluster = $false,
            [string]$ClusterId = $null,
            [string]$Notes = ""
        )
        $avgComplexity = 0
        if ($WaveUserProfiles.Count -gt 0) {
            $avgComplexity = [math]::Round(($WaveUserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
        }
        return [PSCustomObject]@{
            WaveName           = $WaveName
            WaveID             = "WAVE-$CurrentWaveCounter"
            WaveOrder          = $CurrentWaveCounter
            TotalUsers         = $WaveUserProfiles.Count
            UserPrincipalNames = ($WaveUserProfiles.UserPrincipalName -join ";")
            Criteria           = $Criteria
            AverageComplexity  = $avgComplexity
            DependencyCluster  = $IsDependencyCluster
            ClusterId          = $ClusterId
            Notes              = $Notes
            UserProfilesInWave = $WaveUserProfiles # Keep the full profiles for later access
        }
    }

    # Department-based wave generation
    if ($generateByDepartment) {
        $usersByDepartment = $Profiles | Group-Object -Property @{
            Expression = { if ([string]::IsNullOrWhiteSpace($_.Department)) { "_NoDepartment" } else { $_.Department } }
        }
        
        foreach ($deptGroup in $usersByDepartment | Sort-Object Name) {
            $departmentName = $deptGroup.Name
            $deptUsersProfiles = [System.Collections.Generic.List[object]]::new($deptGroup.Group)
            $deptWaveNumber = 1
            
            Write-MandALog "Processing department: '$departmentName' with $($deptUsersProfiles.Count) users" -Level "DEBUG"
            
            $unassignedDeptUsers = $deptUsersProfiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
            
            # Prioritize clusters that have users in this department
            if ($respectDependencies) {
                foreach ($clusterId in $dependencyClusters.Keys) {
                    $cluster = $dependencyClusters[$clusterId]
                    $clusterUsersInCurrentDept = $cluster.Users | Where-Object { 
                        ($deptUsersProfiles.UserPrincipalName -contains $_) -and (-not $assignedUsersToWaves.ContainsKey($_))
                    }

                    if ($clusterUsersInCurrentDept.Count -gt 0) {
                        # If any user from this cluster is in the current department and not yet waved, wave the whole cluster
                        $allClusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }
                        if ($allClusterUserUPNsToWave.Count -gt 0) {
                            $clusterUserProfilesToWave = $Profiles | Where-Object { $allClusterUserUPNsToWave -contains $_.UserPrincipalName }
                            
                            $wave = New-WaveObject -WaveName "Dept-$departmentName-Wave$deptWaveNumber-Cluster" -CurrentWaveCounter $waveCounter `
                                -WaveUserProfiles $clusterUserProfilesToWave -Criteria "Department: $departmentName (Dependency Cluster)" `
                                -IsDependencyCluster $true -ClusterId $clusterId `
                                -Notes "Contains users due to Exchange dependencies, potentially跨departments."
                            $migrationWaves.Add($wave)
                            $allClusterUserUPNsToWave | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
                            $waveCounter++
                            $deptWaveNumber++
                            
                            # Update unassignedDeptUsers
                            $unassignedDeptUsers = $unassignedDeptUsers | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
                        }
                    }
                }
            }
            
            # Process remaining department users (not part of processed clusters)
            $remainingDeptUsersToWave = $unassignedDeptUsers | Sort-Object ComplexityScore, DisplayName
            for ($i = 0; $i -lt $remainingDeptUsersToWave.Count; $i += $maxWaveSize) {
                $waveUserBatch = $remainingDeptUsersToWave[$i..[System.Math]::Min($i + $maxWaveSize - 1, $remainingDeptUsersToWave.Count - 1)]
                if ($waveUserBatch.Count -eq 0) { continue }
                
                $wave = New-WaveObject -WaveName "Dept-$departmentName-Wave$deptWaveNumber" -CurrentWaveCounter $waveCounter `
                    -WaveUserProfiles $waveUserBatch -Criteria "Department: $departmentName"
                $migrationWaves.Add($wave)
                $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
                $waveCounter++
                $deptWaveNumber++
            }
        }
    } else { # Complexity-based wave generation
        # First, create waves for all dependency clusters
        if ($respectDependencies) {
            # Sort clusters by their aggregate complexity or size to prioritize smaller/less complex ones first, or larger ones
            # Current sort is by complexity score of the cluster
            $sortedClusterIds = $dependencyClusters.Keys | Sort-Object { $dependencyClusters[$_].ComplexityScore }
            
            foreach ($clusterId in $sortedClusterIds) {
                $cluster = $dependencyClusters[$clusterId]
                $clusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }

                if ($clusterUserUPNsToWave.Count -eq 0) { continue } # All users in this cluster already waved

                $clusterUserProfiles = $Profiles | Where-Object { $clusterUserUPNsToWave -contains $_.UserPrincipalName }
                
                # If cluster is too large, split it (respecting dependencies within the cluster is hard if split)
                # For now, if a cluster is too large, it will still be one wave, or split naively by complexity.
                # A true dependency-respecting split of a large cluster is more complex.
                if ($clusterUserProfiles.Count -gt $maxWaveSize) {
                    Write-MandALog "Dependency cluster $clusterId ($($clusterUserProfiles.Count) users) exceeds max wave size. Splitting by complexity." -Level "WARN"
                    $sortedClusterUsersForSplitting = $clusterUserProfiles | Sort-Object ComplexityScore, DisplayName
                    for ($i = 0; $i -lt $sortedClusterUsersForSplitting.Count; $i += $maxWaveSize) {
                        $subWaveUsers = $sortedClusterUsersForSplitting[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedClusterUsersForSplitting.Count - 1)]
                        if ($subWaveUsers.Count -eq 0) { continue }

                        $wave = New-WaveObject -WaveName "Dependency-Wave$waveCounter-Split" -CurrentWaveCounter $waveCounter `
                            -WaveUserProfiles $subWaveUsers -Criteria "Exchange Dependency Cluster (Split)" `
                            -IsDependencyCluster $true -ClusterId $clusterId -Notes "Large dependency cluster part."
                        $migrationWaves.Add($wave)
                        $subWaveUsers.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
                        $waveCounter++
                    }
                } else {
                    $wave = New-WaveObject -WaveName "Dependency-Wave$waveCounter" -CurrentWaveCounter $waveCounter `
                        -WaveUserProfiles $clusterUserProfiles -Criteria "Exchange Dependency Cluster" `
                        -IsDependencyCluster $true -ClusterId $clusterId
                    $migrationWaves.Add($wave)
                    $clusterUserProfiles.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
                    $waveCounter++
                }
            }
        }
        
        # Process all remaining users (not in any processed dependency cluster) by complexity
        $usersNotYetWaved = $Profiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
        $sortedRemainingUsers = $usersNotYetWaved | Sort-Object ComplexityScore, DisplayName
        
        for ($i = 0; $i -lt $sortedRemainingUsers.Count; $i += $maxWaveSize) {
            $waveUserBatch = $sortedRemainingUsers[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedRemainingUsers.Count - 1)]
            if ($waveUserBatch.Count -eq 0) { continue }
            
            $wave = New-WaveObject -WaveName "Complexity-Wave$waveCounter" -CurrentWaveCounter $waveCounter `
                -WaveUserProfiles $waveUserBatch -Criteria "Complexity Score Grouping"
            $migrationWaves.Add($wave)
            $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
            $waveCounter++
        }
    }
    
    # Phase 4: Add wave assignment back to original $Profiles objects (if they are references)
    # Or ensure the output $migrationWaves contains UserProfilesInWave with this info.
    # The $Profiles objects are passed by reference (IList of objects), so modifications should persist.
    Write-MandALog "Phase 4: Updating user profiles with wave assignments..." -Level "INFO"
    foreach ($wave in $migrationWaves) {
        foreach ($userProfileInWave in $wave.UserProfilesInWave) {
            # Find the original profile object to update it, to ensure the input list is modified
            $originalProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $userProfileInWave.UserPrincipalName } | Select-Object -First 1
            if ($originalProfile) {
                $originalProfile.PSObject.Properties.Add([PSNoteProperty]::new("MigrationWave", $wave.WaveID))
                # Add-Member -InputObject $originalProfile -MemberType NoteProperty -Name MigrationWave -Value $wave.WaveID -Force # Alternative
                
                if ($wave.DependencyCluster) {
                    $currentNotes = if ($originalProfile.PSObject.Properties["Notes"]) { $originalProfile.Notes } else { "" }
                    $newNote = "Part of Exchange dependency cluster $($wave.ClusterId)."
                    if ($currentNotes) {
                        $originalProfile.PSObject.Properties["Notes"].Value = "$currentNotes $newNote"
                    } else {
                         $originalProfile.PSObject.Properties.Add([PSNoteProperty]::new("Notes", $newNote))
                        # Add-Member -InputObject $originalProfile -MemberType NoteProperty -Name Notes -Value $newNote -Force
                    }
                }
            }
        }
    }
    
    # Phase 5: Generate wave summary
    Write-MandALog "Phase 5: Generating wave summary..." -Level "INFO"
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
        
        Write-MandALog "Wave Generation Summary:" -Level "INFO"
        foreach ($key in $waveSummary.Keys | Sort-Object) {
            Write-MandALog "  $key`: $($waveSummary[$key])" -Level "INFO"
        }
        
        # Add summary to the first wave object for easy programmatic access if needed
        $migrationWaves[0] | Add-Member -MemberType NoteProperty -Name "GenerationSummary" -Value $waveSummary -Force
    } else {
        Write-MandALog "No migration waves were generated." -Level "WARN"
    }
    
    Write-MandALog "Enhanced Migration Wave Generation completed. $($migrationWaves.Count) waves created." -Level "SUCCESS"
    return $migrationWaves
}

# Function to validate wave dependencies
function Test-WaveDependencies {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Waves, # Assumes waves have UserProfilesInWave or UserPrincipalNames and WaveOrder
        
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles # Assumes profiles have MigrationWave, CoMigrationUsers, UserPrincipalName
    )
    
    Write-MandALog "Validating wave dependencies..." -Level "INFO"
    $issues = [System.Collections.Generic.List[object]]::new()
    
    # Create a quick lookup for UPN to WaveOrder
    $userWaveOrderLookup = @{}
    foreach ($wave in $Waves) {
        $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }
        foreach ($upn in $waveUPNs) {
            $userWaveOrderLookup[$upn.Trim()] = $wave.WaveOrder
        }
    }

    foreach ($userProfile in $Profiles) {
        if ($userProfile.RequiresCoMigration -and $userProfile.CoMigrationUsers) {
            $currentUserUPN = $userProfile.UserPrincipalName
            $currentUserWaveOrder = $userWaveOrderLookup[$currentUserUPN]

            if ($null -eq $currentUserWaveOrder) {
                # Write-MandALog "User $currentUserUPN not found in any wave for dependency check." -Level "DEBUG"
                continue 
            }

            foreach ($dependentUserUPN in $userProfile.CoMigrationUsers) {
                $dependentUserWaveOrder = $userWaveOrderLookup[$dependentUserUPN]
                
                if ($null -ne $dependentUserWaveOrder) {
                    if ($dependentUserWaveOrder -gt $currentUserWaveOrder) {
                        $issues.Add([PSCustomObject]@{
                            User          = $currentUserUPN
                            UserWaveOrder = $currentUserWaveOrder
                            DependentUser = $dependentUserUPN
                            DependentWaveOrder = $dependentUserWaveOrder
                            Issue         = "Co-dependent user '$dependentUserUPN' is scheduled in a later wave (Order $dependentUserWaveOrder) than '$currentUserUPN' (Order $currentUserWaveOrder)."
                        })
                    }
                } else {
                     # Dependent user not found in any wave, might be an issue or intended if they are out of scope
                    Write-MandALog "Co-dependent user '$dependentUserUPN' for '$currentUserUPN' not found in any wave during validation." -Level "DEBUG"
                }
            }
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-MandALog "Found $($issues.Count) dependency issues in wave planning:" -Level "WARN"
        $issues | ForEach-Object {
            Write-MandALog "  User '$($_.User)' (Wave Order $($_.UserWaveOrder)) depends on '$($_.DependentUser)', but dependent is in later Wave Order $($_.DependentWaveOrder)." -Level "WARN"
        }
    } else {
        Write-MandALog "No co-migration dependency issues found in wave planning." -Level "SUCCESS"
    }
    
    return $issues
}

# Function to suggest optimizations for shared mailbox migrations
function Optimize-SharedMailboxWaves {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Waves, # Waves should have UserPrincipalNames and WaveID
        
        [Parameter(Mandatory = $true)]
        [System.Collections.IList]$Profiles, # Profiles should have UserPrincipalName, MigrationWave, ExchangePermissions.SharedMailboxAccess
        
        [Parameter(Mandatory = $false)]
        [int]$MinUsersForOptimization = 3 # Minimum users accessing a shared mailbox to consider it for optimization
    )
    
    Write-MandALog "Analyzing waves for shared mailbox migration optimization..." -Level "INFO"
    $sharedMailboxStats = @{} # Key: SharedMailboxEmail, Value: { Mailbox, Users (list of UPNs), WaveIDs (list of unique wave IDs) }
    
    # Create a lookup for UPN to WaveID
    $userToWaveIDLookup = @{}
    foreach ($wave in $Waves) {
        $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }
        foreach ($upn in $waveUPNs) {
            $userToWaveIDLookup[$upn.Trim()] = $wave.WaveID
        }
    }

    foreach ($userProfile in $Profiles | Where-Object { $_.SharedMailboxCount -gt 0 -and $_.ExchangePermissions -and $_.ExchangePermissions.SharedMailboxAccess }) {
        $userUPN = $userProfile.UserPrincipalName
        $userWaveID = $userToWaveIDLookup[$userUPN]

        foreach ($sharedMbxAccessInfo in $userProfile.ExchangePermissions.SharedMailboxAccess) {
            $mbxEmail = $sharedMbxAccessInfo.SharedMailbox
            
            if (-not $sharedMailboxStats.ContainsKey($mbxEmail)) {
                $sharedMailboxStats[$mbxEmail] = @{
                    Mailbox        = $mbxEmail
                    DisplayName    = $sharedMbxAccessInfo.DisplayName
                    Users          = [System.Collections.Generic.List[string]]::new()
                    WaveIDs        = [System.Collections.Generic.List[string]]::new() # Store unique WaveIDs
                    UserWaveMapping = @{} # UPN to WaveID
                }
            }
            
            $sharedMailboxStats[$mbxEmail].Users.Add($userUPN)
            if ($userWaveID -and (-not $sharedMailboxStats[$mbxEmail].WaveIDs.Contains($userWaveID))) {
                $sharedMailboxStats[$mbxEmail].WaveIDs.Add($userWaveID)
            }
            $sharedMailboxStats[$mbxEmail].UserWaveMapping[$userUPN] = $userWaveID
        }
    }
    
    $optimizationCandidates = [System.Collections.Generic.List[object]]::new()
    
    foreach ($mbxEmail in $sharedMailboxStats.Keys) {
        $stats = $sharedMailboxStats[$mbxEmail]
        if ($stats.Users.Count -ge $MinUsersForOptimization -and $stats.WaveIDs.Count -gt 1) {
            Write-MandALog "Shared mailbox '$($stats.DisplayName)' ($mbxEmail) has $($stats.Users.Count) users spread across $($stats.WaveIDs.Count) waves. Consider consolidating." -Level "INFO"
            $optimizationCandidates.Add($stats)
        }
    }
    
    Write-MandALog "Found $($optimizationCandidates.Count) shared mailboxes that could potentially benefit from wave consolidation of their users." -Level "INFO"
    
    # This function is more for analysis; actual re-waving would be a separate, complex step.
    return @{
        SharedMailboxAccessDetails = $sharedMailboxStats # All stats
        OptimizationSuggestions    = $optimizationCandidates # Mailboxes flagged for potential optimization
    }
}

Export-ModuleMember -Function New-MigrationWaves, Test-WaveDependencies, Optimize-SharedMailboxWaves
