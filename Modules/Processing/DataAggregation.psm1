#Requires -Version 5.1
<#
.SYNOPSIS
    M&A Discovery Suite - Data Aggregation Module
.DESCRIPTION
    This module is responsible for loading all raw data discovered by various
    discovery modules, aggregating it, and building a comprehensive relationship graph.
.NOTES
    Version: 1.1.1 (Verb corrected)
    Author: Gemini
#>

[CmdletBinding()]
param()

# Helper function to load specific CSV files if they exist
function Import-RawDataFile { # Renamed from Load-RawDataFile
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawDataPath,
        [Parameter(Mandatory = $true)]
        [string]$FileName,
        [Parameter(Mandatory = $true)]
        [hashtable]$AggregatedDataStore, # Where to store the loaded data (e.g., $aggregatedData.Users)
        [Parameter(Mandatory = $true)]
        [string]$DataCategoryKey          # Key in $AggregatedDataStore (e.g., "Users", "Groups")
    )

    $filePath = Join-Path $RawDataPath $FileName
    if (Test-Path $filePath) {
        Write-MandALog "Importing raw data file: $FileName" -Level "INFO" # Log message updated
        try {
            $data = Import-DataFromCSV -FilePath $filePath # Assumes Import-DataFromCSV is globally available
            if ($null -ne $data) {
                if ($AggregatedDataStore.ContainsKey($DataCategoryKey)) {
                    $AggregatedDataStore[$DataCategoryKey] += $data
                } else {
                    $AggregatedDataStore[$DataCategoryKey] = $data
                }
                Write-MandALog "Successfully imported $($data.Count) records from $FileName into category '$DataCategoryKey'." -Level "DEBUG"
            } else {
                 Write-MandALog "No data imported from $FileName (file might be empty or Import-DataFromCSV returned null)." -Level "INFO"
            }
        } catch {
            Write-MandALog "Failed to import or process $FileName. Error: $($_.Exception.Message)" -Level "WARN"
        }
    } else {
        Write-MandALog "Raw data file not found: $FileName. Skipping." -Level "INFO"
    }
}

# Placeholder for the function that builds the relationship graph
# This would be a complex function that takes all aggregated data and links entities.
function New-ComprehensiveRelationshipGraph {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$AggregatedData, # Contains all loaded raw data (Users, Groups, Devices etc.)
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Building comprehensive relationship graph..." -Level "INFO"
    # Placeholder logic:
    # - Analyze user-group memberships across AD and Azure AD
    # - Link devices to users
    # - Map application assignments to users/groups
    # - Identify dependencies between entities
    # This would be a significant piece of logic.
    $relationshipGraph = @{
        UserGroupLinks = @()
        UserDeviceLinks = @()
        GroupAppLinks = @()
        Notes = "Relationship graph generation is a placeholder."
    }
    Write-MandALog "Relationship graph building (placeholder) complete." -Level "SUCCESS"
    return $relationshipGraph
}

# Main exported function for this module
function Invoke-DataAggregation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawDataPath, # Path to the directory containing raw CSV files
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )

    Write-MandALog "Starting Data Aggregation Process from path: $RawDataPath" -Level "INFO"

    $aggregatedDataStore = @{
        Users = [System.Collections.Generic.List[object]]::new();
        Groups = [System.Collections.Generic.List[object]]::new();
        Computers = [System.Collections.Generic.List[object]]::new();
        Devices = [System.Collections.Generic.List[object]]::new(); # For Graph/Intune devices
        Applications = [System.Collections.Generic.List[object]]::new();
        ServicePrincipals = [System.Collections.Generic.List[object]]::new();
        DirectoryRoles = [System.Collections.Generic.List[object]]::new();
        Mailboxes = [System.Collections.Generic.List[object]]::new();
        ExternalIdentities = [System.Collections.Generic.List[object]]::new();
        GPOs = [System.Collections.Generic.List[object]]::new();
        AzureResources = [System.Collections.Generic.List[object]]::new(); # Generic Azure resources
        IntunePolicies = [System.Collections.Generic.List[object]]::new(); # Example for Intune
        # Add other categories as needed
    }

    # Define expected raw data files from various discovery sources
    # The DataCategoryKey should match the keys in $aggregatedDataStore
    # This list should be comprehensive based on what your discovery modules produce.
    $filesToLoad = @(
        @{ FileName = "ADUsers.csv"; CategoryKey = "Users" }
        @{ FileName = "ADSecurityGroups.csv"; CategoryKey = "Groups" } # Assuming this filename
        @{ FileName = "ADComputers.csv"; CategoryKey = "Computers" }
        # Add other AD files: ADOrganizationalUnits.csv, etc.

        @{ FileName = "GraphUsers.csv"; CategoryKey = "Users" }
        @{ FileName = "GraphGroups.csv"; CategoryKey = "Groups" }
        @{ FileName = "GraphDevices.csv"; CategoryKey = "Devices" }
        @{ FileName = "GraphApplications.csv"; CategoryKey = "Applications" }
        @{ FileName = "GraphServicePrincipals.csv"; CategoryKey = "ServicePrincipals" }
        @{ FileName = "GraphDirectoryRoles.csv"; CategoryKey = "DirectoryRoles" }
        # Add other Graph files: GraphLicenses.csv, OneDriveUsage.csv, ApplicationProxies.csv

        @{ FileName = "ExchangeMailboxes.csv"; CategoryKey = "Mailboxes" }
        # Add other Exchange files: DistributionLists.csv

        @{ FileName = "ExternalIdentities.csv"; CategoryKey = "ExternalIdentities" } # From ExternalIdentityDiscovery
        
        @{ FileName = "EnhancedGPOData.csv"; CategoryKey = "GPOs" } # Or whatever the output of EnhancedGPODiscovery is
        
        @{ FileName = "AzureVMs.csv"; CategoryKey = "AzureResources" } # Example for Azure Discovery output
        # Add other Azure files

        @{ FileName = "IntuneDevices.csv"; CategoryKey = "Devices" } # Might merge with GraphDevices or be separate
        @{ FileName = "IntuneCompliancePolicies.csv"; CategoryKey = "IntunePolicies" } # Example for Intune
        # Add other Intune files
    )

    Write-MandALog "Attempting to import raw data files..." -Level "INFO" # Log message updated
    foreach ($fileInfo in $filesToLoad) {
        Import-RawDataFile -RawDataPath $RawDataPath -FileName $fileInfo.FileName -AggregatedDataStore $aggregatedDataStore -DataCategoryKey $fileInfo.CategoryKey # Updated function call
    }
    Write-MandALog "Raw data import phase complete." -Level "INFO" # Log message updated

    # Post-loading processing: e.g., deduplicate users if loaded from multiple sources (ADUsers, GraphUsers)
    if ($aggregatedDataStore.Users.Count -gt 0) {
        Write-MandALog "Deduplicating user entries based on UserPrincipalName..." -Level "INFO"
        $uniqueUsers = $aggregatedDataStore.Users | Sort-Object UserPrincipalName -Unique # Simple deduplication
        $originalUserCount = $aggregatedDataStore.Users.Count
        $aggregatedDataStore.Users = [System.Collections.Generic.List[object]]::new()
        $aggregatedDataStore.Users.AddRange($uniqueUsers)
        Write-MandALog "User deduplication complete. Original: $originalUserCount, Unique: $($aggregatedDataStore.Users.Count)" -Level "INFO"
    }
    # Similar deduplication or merging can be done for other categories like Groups if needed.

    # Build the comprehensive relationship graph
    $relationshipGraph = New-ComprehensiveRelationshipGraph -AggregatedData $aggregatedDataStore -Configuration $Configuration
    
    Write-MandALog "Data Aggregation Process completed." -Level "SUCCESS"
    
    # Return a hashtable containing both the aggregated data and the relationship graph
    return @{
        AggregatedDataStore = $aggregatedDataStore # Contains Users, Groups, Devices etc. as lists of objects
        RelationshipGraph = $relationshipGraph
    }
}

# Export the main function for the orchestrator
Export-ModuleMember -Function Invoke-DataAggregation, New-ComprehensiveRelationshipGraph, Import-RawDataFile # Added Import-RawDataFile to exports if it's intended to be callable externally, otherwise it can remain a private helper
