#Requires -Version 5.1
#Requires -Modules EnhancedLogging, FileOperations # Assuming these provide Write-MandALog and potentially file helpers

<#
.SYNOPSIS
    Exports processed M&A discovery data into JSON formats optimized for PowerApps consumption.
.DESCRIPTION
    The PowerAppsExporter module takes the aggregated and processed data from the M&A Discovery Suite
    and transforms it into several JSON files. These files are structured to be easily ingested by
    PowerApps, typically for creating dashboards or reports related to users, migration waves,
    departments, and applications.

    Key outputs include:
    - powerapps_users.json: Detailed user information.
    - powerapps_waves.json: Migration wave details with associated user UPNs.
    - powerapps_departments.json: Summaries for each department.
    - powerapps_applications.json: List of discovered applications.
    - powerapps_metadata.json: Overall export metadata.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite AI Assistant
    Date: 2025-05-30

    This module relies on functions like Write-MandALog, which are expected to be
    available in the global scope, typically loaded by the M&A Orchestrator from
    utility modules like EnhancedLogging.psm1.
#>

function Export-ForPowerApps {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$ProcessedData,

        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    try {
        Write-MandALog "Starting PowerApps Export Process" -Level "HEADER"

        $baseOutputPath = $Configuration.environment.outputPath
        $powerAppsOutputPath = Join-Path -Path $baseOutputPath -ChildPath "Processed\PowerApps"
        $jsonDepth = if ($Configuration.export.powerAppsJsonDepth) { $Configuration.export.powerAppsJsonDepth } else { 3 } # Default depth if not specified

        # Ensure the output directory exists
        if (-not (Test-Path -Path $powerAppsOutputPath -PathType Container)) {
            try {
                New-Item -Path $powerAppsOutputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
                Write-MandALog "Created PowerApps export directory: $powerAppsOutputPath" -Level "SUCCESS"
            }
            catch {
                Write-MandALog "Failed to create PowerApps export directory '$powerAppsOutputPath': $($_.Exception.Message)" -Level "ERROR"
                throw "Failed to create output directory for PowerApps export."
            }
        }

        # --- Prepare Metadata ---
        $metadata = @{
            ExportTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
            SuiteVersion = $Configuration.metadata.version # Assuming version is in config metadata
            ProjectName = $Configuration.metadata.projectName
            CompanyName = $Configuration.metadata.companyName
            TotalUsers = 0
            TotalWaves = 0
            TotalDepartments = 0
            TotalApplications = 0
        }

        # --- Process User Profiles ---
        $powerAppsUsers = @()
        if ($ProcessedData.UserProfiles -and $ProcessedData.UserProfiles.Count -gt 0) {
            Write-MandALog "Processing $($ProcessedData.UserProfiles.Count) user profiles for PowerApps export..." -Level "INFO"
            foreach ($userProfile in $ProcessedData.UserProfiles) {
                # Select and flatten properties for PowerApps
                # Ensure property names are PowerApps friendly (avoid special characters if possible, though PS converts them)
                $paUser = [PSCustomObject]@{
                    UPN = $userProfile.UserPrincipalName
                    DisplayName = $userProfile.DisplayName
                    SamAccountName = $userProfile.SamAccountName
                    Email = $userProfile.Mail # Assuming 'Mail' property exists
                    Department = $userProfile.Department
                    JobTitle = $userProfile.JobTitle
                    AccountEnabled = $userProfile.Enabled
                    LastLogonDate = if ($userProfile.LastLogon) { try { Get-Date $userProfile.LastLogon -Format "yyyy-MM-ddTHH:mm:ssZ" } catch { $userProfile.LastLogon } } else { $null }
                    ComplexityScore = $userProfile.ComplexityScore
                    MigrationReadiness = $userProfile.ReadinessStatus
                    MigrationCategory = $userProfile.MigrationCategory # e.g., Standard, Complex
                    AssignedWaveName = $userProfile.MigrationWave # Assuming this property is added by WaveGeneration or ProfileBuilder
                    SourceAD = $userProfile.SourceAD # boolean or string indicating presence
                    SourceAzureAD = $userProfile.SourceAzureAD
                    SourceExchange = $userProfile.SourceExchange
                    MailboxSizeGB = if ($userProfile.MailboxSizeGB) { [math]::Round($userProfile.MailboxSizeGB, 2) } else { $null }
                    KeyRiskFactors = ($userProfile.RiskFactors | Out-String).Trim() # Convert array to string
                    Notes = $userProfile.Notes # Any specific notes
                }
                $powerAppsUsers += $paUser
            }
            $userOutputFilePath = Join-Path -Path $powerAppsOutputPath -ChildPath "powerapps_users.json"
            $powerAppsUsers | ConvertTo-Json -Depth $jsonDepth | Set-Content -Path $userOutputFilePath -Encoding UTF8
            Write-MandALog "Successfully exported $($powerAppsUsers.Count) users to '$userOutputFilePath'" -Level "SUCCESS"
            $metadata.TotalUsers = $powerAppsUsers.Count
        } else {
            Write-MandALog "No user profiles found in ProcessedData to export for PowerApps." -Level "WARN"
        }

        # --- Process Migration Waves ---
        $powerAppsWaves = @()
        if ($ProcessedData.MigrationWaves -and $ProcessedData.MigrationWaves.Count -gt 0) {
            Write-MandALog "Processing $($ProcessedData.MigrationWaves.Count) migration waves for PowerApps export..." -Level "INFO"
            foreach ($wave in $ProcessedData.MigrationWaves) {
                $paWave = [PSCustomObject]@{
                    WaveID = if ($wave.WaveID) { $wave.WaveID } else { $wave.Name } # Prefer a dedicated ID if available
                    WaveName = $wave.Name
                    TotalUsersInWave = $wave.TotalUsers
                    AverageComplexity = if ($wave.AverageComplexityScore) { [math]::Round($wave.AverageComplexityScore, 2) } else { $null }
                    DepartmentsInWave = $wave.Departments # Assuming this is a string or simple array
                    RiskLevel = $wave.RiskLevel
                    EstimatedTimeHours = $wave.EstimatedTimeHours
                    Status = $wave.Status # e.g., Planned, InProgress, Completed (if available)
                    UserUPNs = $wave.Users | ForEach-Object { $_.UserPrincipalName } # Extract UPNs from user objects in the wave
                }
                $powerAppsWaves += $paWave
            }
            $waveOutputFilePath = Join-Path -Path $powerAppsOutputPath -ChildPath "powerapps_waves.json"
            $powerAppsWaves | ConvertTo-Json -Depth $jsonDepth | Set-Content -Path $waveOutputFilePath -Encoding UTF8
            Write-MandALog "Successfully exported $($powerAppsWaves.Count) waves to '$waveOutputFilePath'" -Level "SUCCESS"
            $metadata.TotalWaves = $powerAppsWaves.Count
        } else {
            Write-MandALog "No migration waves found in ProcessedData to export for PowerApps." -Level "WARN"
        }

        # --- Process Departments (Derived from User Profiles) ---
        $powerAppsDepartments = @()
        if ($powerAppsUsers.Count -gt 0) {
            Write-MandALog "Deriving department summaries for PowerApps export..." -Level "INFO"
            $departments = $powerAppsUsers | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Department) } | Group-Object Department
            foreach ($deptGroup in $departments) {
                $deptUsers = $deptGroup.Group
                $paDepartment = [PSCustomObject]@{
                    DepartmentName = $deptGroup.Name
                    UserCount = $deptUsers.Count
                    AverageComplexity = [math]::Round(($deptUsers | Measure-Object -Property ComplexityScore -Average).Average, 2)
                    UserUPNs = $deptUsers.UPN
                }
                $powerAppsDepartments += $paDepartment
            }
            $departmentOutputFilePath = Join-Path -Path $powerAppsOutputPath -ChildPath "powerapps_departments.json"
            $powerAppsDepartments | ConvertTo-Json -Depth $jsonDepth | Set-Content -Path $departmentOutputFilePath -Encoding UTF8
            Write-MandALog "Successfully exported $($powerAppsDepartments.Count) department summaries to '$departmentOutputFilePath'" -Level "SUCCESS"
            $metadata.TotalDepartments = $powerAppsDepartments.Count
        } else {
            Write-MandALog "No users with department information found to derive department summaries." -Level "WARN"
        }
        
        # --- Process Applications (from AggregatedDataStore if available) ---
        $powerAppsApplications = @()
        # Path to applications might vary based on DataAggregation.psm1 output structure.
        # Common paths: $ProcessedData.AggregatedDataStore.Graph.Applications or $ProcessedData.AggregatedDataStore.Applications
        $applicationsSource = $null
        if ($ProcessedData.AggregatedDataStore.PSObject.Properties.Name -contains 'Graph' -and $ProcessedData.AggregatedDataStore.Graph.PSObject.Properties.Name -contains 'Applications') {
            $applicationsSource = $ProcessedData.AggregatedDataStore.Graph.Applications
        } elseif ($ProcessedData.AggregatedDataStore.PSObject.Properties.Name -contains 'Applications') {
            $applicationsSource = $ProcessedData.AggregatedDataStore.Applications
        }

        if ($applicationsSource -and $applicationsSource.Count -gt 0) {
            Write-MandALog "Processing $($applicationsSource.Count) applications for PowerApps export..." -Level "INFO"
            foreach ($app in $applicationsSource) {
                $paApp = [PSCustomObject]@{
                    ApplicationID = $app.appId # Graph API's appId
                    DisplayName = $app.displayName
                    PublisherDomain = $app.publisherDomain
                    SignInAudience = $app.signInAudience
                    # Potentially add more fields like createdDateTime, tags, owners if available and simple
                    # For PowerApps, avoid deeply nested objects like 'owners' directly; extract key info.
                    # Example: OwnersUPN = ($app.owners | ForEach-Object { $_.userPrincipalName }) -join ", "
                }
                $powerAppsApplications += $paApp
            }
            $applicationOutputFilePath = Join-Path -Path $powerAppsOutputPath -ChildPath "powerapps_applications.json"
            $powerAppsApplications | ConvertTo-Json -Depth $jsonDepth | Set-Content -Path $applicationOutputFilePath -Encoding UTF8
            Write-MandALog "Successfully exported $($powerAppsApplications.Count) applications to '$applicationOutputFilePath'" -Level "SUCCESS"
            $metadata.TotalApplications = $powerAppsApplications.Count
        } else {
            Write-MandALog "No application data found in AggregatedDataStore (expected at .Graph.Applications or .Applications) to export for PowerApps." -Level "WARN"
        }

        # --- Process Infrastructure (Placeholder - Requires more specific input structure) ---
        # For now, this section will be a placeholder.
        # If Azure resources (VMs, etc.) are aggregated into $ProcessedData.AggregatedDataStore.Azure.Resources,
        # a similar processing loop could be added here.
        # Example:
        # $azureResources = $ProcessedData.AggregatedDataStore.Azure.Resources
        # if ($azureResources) { ... process and save powerapps_azure_resources.json ... }
        Write-MandALog "Infrastructure export for PowerApps is currently a placeholder. To implement, ensure ProcessedData.AggregatedDataStore contains summarized infrastructure data (e.g., Azure VMs, Servers)." -Level "INFO"


        # --- Save Metadata ---
        $metadataOutputFilePath = Join-Path -Path $powerAppsOutputPath -ChildPath "powerapps_metadata.json"
        $metadata | ConvertTo-Json -Depth 2 | Set-Content -Path $metadataOutputFilePath -Encoding UTF8
        Write-MandALog "Successfully exported PowerApps metadata to '$metadataOutputFilePath'" -Level "SUCCESS"

        Write-MandALog "PowerApps Export Process Completed Successfully." -Level "SUCCESS"
        return $true
    }
    catch {
        Write-MandALog "Error during PowerApps Export: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack Trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        # Optionally, re-throw the exception if the orchestrator should handle it as a phase failure
        # throw $_ 
        return $false # Indicate failure
    }
}

# Export the function to make it available for the orchestrator
Export-ModuleMember -Function Export-ForPowerApps

Write-MandALog "PowerAppsExporter.psm1 module loaded." -Level "DEBUG"
