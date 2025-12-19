# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure Device Discovery Module - Azure AD Devices and Intune Managed Devices
.DESCRIPTION
    Extracts device information for migration planning and device management audit.
    Discovers:
    - Azure AD Devices (joined, registered, hybrid)
    - Intune Managed Devices with compliance status

    Part of the Azure Discovery refactoring initiative to break monolithic
    AzureDiscovery.psm1 into focused, maintainable modules.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-12-19
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureDeviceDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Starting Azure Device Discovery (Azure AD Devices, Intune Devices)..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        #region Azure AD Devices Discovery
        Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Discovering Azure AD Devices..." -Level "INFO"

        try {
            $devices = @()
            $deviceUri = "https://graph.microsoft.com/v1.0/devices?`$select=id,displayName,operatingSystem,operatingSystemVersion,deviceId,accountEnabled,approximateLastSignInDateTime,complianceExpirationDateTime,createdDateTime,deviceOwnership,enrollmentType,isCompliant,isManaged,isRooted,managementType,manufacturer,model,onPremisesSyncEnabled,profileType,registrationDateTime,trustType&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $deviceUri -Method GET
                $devices += $response.value
                $deviceUri = $response.'@odata.nextLink'
            } while ($deviceUri)

            foreach ($device in $devices) {
                # Get registered owners
                $owners = @()
                $ownerCount = 0
                try {
                    $ownersUri = "https://graph.microsoft.com/v1.0/devices/$($device.id)/registeredOwners?`$select=id,displayName,userPrincipalName"
                    $ownersResponse = Invoke-MgGraphRequest -Uri $ownersUri -Method GET
                    $owners = $ownersResponse.value
                    $ownerCount = @($owners).Count
                } catch {
                    # Owners may not be accessible
                }

                # Determine device join type
                $joinType = 'Unknown'
                switch ($device.trustType) {
                    'AzureAd' { $joinType = 'Azure AD Joined' }
                    'ServerAd' { $joinType = 'Hybrid Azure AD Joined' }
                    'Workplace' { $joinType = 'Azure AD Registered' }
                    default { $joinType = $device.trustType }
                }

                # Calculate days since last sign-in
                $daysSinceLastSignIn = $null
                if ($device.approximateLastSignInDateTime) {
                    $lastSignIn = [datetime]$device.approximateLastSignInDateTime
                    $daysSinceLastSignIn = [math]::Round(((Get-Date) - $lastSignIn).TotalDays)
                }

                # Migration assessment
                $migrationNotes = @()
                $migrationReadiness = 'Ready'

                if ($device.trustType -eq 'ServerAd') {
                    $migrationNotes += 'Hybrid joined device - requires AD migration coordination'
                    $migrationReadiness = 'Dependent'
                }
                if (-not $device.accountEnabled) {
                    $migrationNotes += 'Device disabled - verify if migration needed'
                    $migrationReadiness = 'Review'
                }
                if ($device.isCompliant -eq $false) {
                    $migrationNotes += 'Non-compliant device - resolve compliance before migration'
                    if ($migrationReadiness -eq 'Ready') { $migrationReadiness = 'Review' }
                }
                if ($daysSinceLastSignIn -and $daysSinceLastSignIn -gt 90) {
                    $migrationNotes += "Stale device (inactive $daysSinceLastSignIn days) - may not need migration"
                    if ($migrationReadiness -eq 'Ready') { $migrationReadiness = 'Review' }
                }
                if ($device.operatingSystem -like '*Windows*' -and $device.operatingSystemVersion -lt '10.0.19041') {
                    $migrationNotes += 'Older Windows version - consider upgrade during migration'
                }

                $deviceData = [PSCustomObject]@{
                    ObjectType = "AzureDevice"
                    Id = $device.id
                    DeviceId = $device.deviceId
                    DisplayName = $device.displayName

                    # Operating System
                    OperatingSystem = $device.operatingSystem
                    OperatingSystemVersion = $device.operatingSystemVersion
                    Manufacturer = $device.manufacturer
                    Model = $device.model

                    # Status
                    AccountEnabled = $device.accountEnabled
                    IsCompliant = $device.isCompliant
                    IsManaged = $device.isManaged
                    IsRooted = $device.isRooted

                    # Join Information
                    TrustType = $device.trustType
                    JoinType = $joinType
                    ProfileType = $device.profileType
                    DeviceOwnership = $device.deviceOwnership
                    EnrollmentType = $device.enrollmentType
                    ManagementType = $device.managementType

                    # Sync Status
                    OnPremisesSyncEnabled = $device.onPremisesSyncEnabled

                    # Timestamps
                    CreatedDateTime = $device.createdDateTime
                    RegistrationDateTime = $device.registrationDateTime
                    ApproximateLastSignInDateTime = $device.approximateLastSignInDateTime
                    DaysSinceLastSignIn = $daysSinceLastSignIn
                    ComplianceExpirationDateTime = $device.complianceExpirationDateTime

                    # Ownership
                    OwnerCount = $ownerCount
                    Owners = ($owners | ForEach-Object { $_.userPrincipalName }) -join '; '

                    # Migration Assessment
                    MigrationReadiness = $migrationReadiness
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'AzureDevices'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($deviceData)
            }

            $deviceCount = $devices.Count
            $Result.Metadata["AzureDeviceCount"] = $deviceCount
            $Result.Metadata["AzureADJoinedCount"] = @($devices | Where-Object { $_.trustType -eq 'AzureAd' }).Count
            $Result.Metadata["HybridJoinedCount"] = @($devices | Where-Object { $_.trustType -eq 'ServerAd' }).Count
            $Result.Metadata["RegisteredCount"] = @($devices | Where-Object { $_.trustType -eq 'Workplace' }).Count
            $Result.Metadata["CompliantDevices"] = @($devices | Where-Object { $_.isCompliant -eq $true }).Count

            Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Azure AD Device Discovery - Found $deviceCount devices (AAD Joined: $($Result.Metadata['AzureADJoinedCount']), Hybrid: $($Result.Metadata['HybridJoinedCount']), Registered: $($Result.Metadata['RegisteredCount']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Azure AD Devices: $($_.Exception.Message)", $_.Exception, @{Section="AzureDevices"})
        }
        #endregion

        #region Intune Managed Devices Discovery
        Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Discovering Intune Managed Devices..." -Level "INFO"

        try {
            $managedDevices = @()
            $managedUri = "https://graph.microsoft.com/v1.0/deviceManagement/managedDevices?`$select=id,deviceName,managedDeviceOwnerType,operatingSystem,osVersion,complianceState,enrolledDateTime,lastSyncDateTime,azureADDeviceId,azureADRegistered,deviceEnrollmentType,deviceRegistrationState,emailAddress,model,manufacturer,serialNumber,userDisplayName,userPrincipalName,managementAgent,isEncrypted,isSupervised,deviceCategoryDisplayName,freeStorageSpaceInBytes,totalStorageSpaceInBytes&`$top=999"

            do {
                $response = Invoke-MgGraphRequest -Uri $managedUri -Method GET
                $managedDevices += $response.value
                $managedUri = $response.'@odata.nextLink'
            } while ($managedUri)

            foreach ($device in $managedDevices) {
                # Calculate days since last sync
                $daysSinceLastSync = $null
                if ($device.lastSyncDateTime) {
                    $lastSync = [datetime]$device.lastSyncDateTime
                    $daysSinceLastSync = [math]::Round(((Get-Date) - $lastSync).TotalDays)
                }

                # Calculate storage
                $storageUsedPercent = $null
                if ($device.totalStorageSpaceInBytes -and $device.freeStorageSpaceInBytes) {
                    $usedStorage = $device.totalStorageSpaceInBytes - $device.freeStorageSpaceInBytes
                    $storageUsedPercent = [math]::Round(($usedStorage / $device.totalStorageSpaceInBytes) * 100, 1)
                }

                # Migration assessment
                $migrationNotes = @()
                $migrationReadiness = 'Ready'

                if ($device.complianceState -ne 'compliant') {
                    $migrationNotes += "Compliance state: $($device.complianceState) - resolve before migration"
                    $migrationReadiness = 'Review'
                }
                if ($daysSinceLastSync -and $daysSinceLastSync -gt 30) {
                    $migrationNotes += "Stale device (no sync for $daysSinceLastSync days)"
                    $migrationReadiness = 'Review'
                }
                if ($device.isEncrypted -eq $false) {
                    $migrationNotes += 'Device not encrypted - security consideration'
                }
                if ($storageUsedPercent -and $storageUsedPercent -gt 90) {
                    $migrationNotes += 'Low storage space - may affect migration'
                }
                if ($device.managedDeviceOwnerType -eq 'personal') {
                    $migrationNotes += 'Personal device (BYOD) - different migration approach needed'
                }

                $managedData = [PSCustomObject]@{
                    ObjectType = "IntuneManagedDevice"
                    Id = $device.id
                    DeviceName = $device.deviceName
                    AzureADDeviceId = $device.azureADDeviceId

                    # Operating System
                    OperatingSystem = $device.operatingSystem
                    OsVersion = $device.osVersion
                    Manufacturer = $device.manufacturer
                    Model = $device.model
                    SerialNumber = $device.serialNumber

                    # Enrollment
                    DeviceEnrollmentType = $device.deviceEnrollmentType
                    DeviceRegistrationState = $device.deviceRegistrationState
                    ManagementAgent = $device.managementAgent
                    ManagedDeviceOwnerType = $device.managedDeviceOwnerType
                    AzureADRegistered = $device.azureADRegistered

                    # Status
                    ComplianceState = $device.complianceState
                    IsEncrypted = $device.isEncrypted
                    IsSupervised = $device.isSupervised
                    DeviceCategoryDisplayName = $device.deviceCategoryDisplayName

                    # User Information
                    UserPrincipalName = $device.userPrincipalName
                    UserDisplayName = $device.userDisplayName
                    EmailAddress = $device.emailAddress

                    # Storage
                    TotalStorageGB = if ($device.totalStorageSpaceInBytes) { [math]::Round($device.totalStorageSpaceInBytes / 1GB, 2) } else { $null }
                    FreeStorageGB = if ($device.freeStorageSpaceInBytes) { [math]::Round($device.freeStorageSpaceInBytes / 1GB, 2) } else { $null }
                    StorageUsedPercent = $storageUsedPercent

                    # Timestamps
                    EnrolledDateTime = $device.enrolledDateTime
                    LastSyncDateTime = $device.lastSyncDateTime
                    DaysSinceLastSync = $daysSinceLastSync

                    # Migration Assessment
                    MigrationReadiness = $migrationReadiness
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'IntuneManagedDevices'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($managedData)
            }

            $managedCount = $managedDevices.Count
            $Result.Metadata["IntuneManagedDeviceCount"] = $managedCount
            $Result.Metadata["IntuneCompliantDevices"] = @($managedDevices | Where-Object { $_.complianceState -eq 'compliant' }).Count
            $Result.Metadata["IntuneCorporateDevices"] = @($managedDevices | Where-Object { $_.managedDeviceOwnerType -eq 'company' }).Count
            $Result.Metadata["IntunePersonalDevices"] = @($managedDevices | Where-Object { $_.managedDeviceOwnerType -eq 'personal' }).Count

            Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Intune Device Discovery - Found $managedCount managed devices (Compliant: $($Result.Metadata['IntuneCompliantDevices']), Corporate: $($Result.Metadata['IntuneCorporateDevices']), Personal: $($Result.Metadata['IntunePersonalDevices']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Intune Managed Devices: $($_.Exception.Message)", $_.Exception, @{Section="IntuneManagedDevices"})
        }
        #endregion

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureDeviceDiscovery" -Message "Device Discovery Complete - Total Records: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Group by data type for CSV export
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using base module
    Start-DiscoveryModule `
        -ModuleName "AzureDeviceDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

Export-ModuleMember -Function Invoke-AzureDeviceDiscovery
