# -*- coding: utf-8 -*-
#Requires -Version 5.1

# Author: Claude Code Assistant
# Version: 1.0.0
# Created: 2025-12-29

<#
.SYNOPSIS
    Office 365 Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive Office 365 discovery module providing capabilities for discovering
    and analyzing Microsoft 365 environments including users, services, compliance,
    and security settings.
.NOTES
    Version: 1.0.0
    Author: Claude Code Assistant
    Created: 2025-12-29
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-Office365Discovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allData = [System.Collections.ArrayList]::new()

        try {
            # Initialize Office 365 data structure
            $office365Data = [PSCustomObject]@{
                Users = @()
                Groups = @()
                Applications = @()
                Devices = @()
                Licenses = @()
                SecuritySettings = @()
                ComplianceSettings = @()
                ServiceHealth = @()
                AdminRoles = @()
                MFAStatus = @()
            }

            # Discover Users
            if ($Configuration.IncludeUsers) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering users..." -Level "INFO"
                try {
                    $users = Get-MgUser -All -Property "id,userPrincipalName,displayName,mail,accountEnabled,userType,createdDateTime,lastPasswordChangeDateTime" -ErrorAction Stop
                    $office365Data.Users = $users | ForEach-Object {
                        [PSCustomObject]@{
                            id = $_.Id
                            userPrincipalName = $_.UserPrincipalName
                            displayName = $_.DisplayName
                            mail = $_.Mail
                            accountEnabled = $_.AccountEnabled
                            userType = $_.UserType
                            createdDateTime = $_.CreatedDateTime
                            lastPasswordChangeDateTime = $_.LastPasswordChangeDateTime
                            _DataType = 'User'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($users.Count) users" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover users: $($_.Exception.Message)")
                }
            }

            # Discover Groups
            if ($Configuration.IncludeGroups) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering groups..." -Level "INFO"
                try {
                    $groups = Get-MgGroup -All -Property "id,displayName,mailEnabled,securityEnabled,groupTypes,description,createdDateTime" -ErrorAction Stop
                    $office365Data.Groups = $groups | ForEach-Object {
                        [PSCustomObject]@{
                            id = $_.Id
                            displayName = $_.DisplayName
                            mailEnabled = $_.MailEnabled
                            securityEnabled = $_.SecurityEnabled
                            groupTypes = $_.GroupTypes -join ';'
                            description = $_.Description
                            createdDateTime = $_.CreatedDateTime
                            _DataType = 'Group'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($groups.Count) groups" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover groups: $($_.Exception.Message)")
                }
            }

            # Discover Applications
            if ($Configuration.IncludeApplications) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering applications..." -Level "INFO"
                try {
                    $apps = Get-MgApplication -All -Property "id,displayName,appId,createdDateTime,signInAudience" -ErrorAction Stop
                    $office365Data.Applications = $apps | ForEach-Object {
                        [PSCustomObject]@{
                            id = $_.Id
                            displayName = $_.DisplayName
                            appId = $_.AppId
                            createdDateTime = $_.CreatedDateTime
                            signInAudience = $_.SignInAudience
                            _DataType = 'Application'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($apps.Count) applications" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover applications: $($_.Exception.Message)")
                }
            }

            # Discover Devices
            if ($Configuration.IncludeDevices) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering devices..." -Level "INFO"
                try {
                    $devices = Get-MgDevice -All -Property "id,displayName,deviceId,operatingSystem,operatingSystemVersion,trustType,accountEnabled,approximateLastSignInDateTime" -ErrorAction Stop
                    $office365Data.Devices = $devices | ForEach-Object {
                        [PSCustomObject]@{
                            id = $_.Id
                            displayName = $_.DisplayName
                            deviceId = $_.DeviceId
                            operatingSystem = $_.OperatingSystem
                            operatingSystemVersion = $_.OperatingSystemVersion
                            trustType = $_.TrustType
                            accountEnabled = $_.AccountEnabled
                            approximateLastSignInDateTime = $_.ApproximateLastSignInDateTime
                            _DataType = 'Device'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($devices.Count) devices" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover devices: $($_.Exception.Message)")
                }
            }

            # Discover Licenses
            if ($Configuration.IncludeLicenses) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering licenses..." -Level "INFO"
                try {
                    $subscribedSkus = Get-MgSubscribedSku -All -Property "skuId,skuPartNumber,capabilityStatus,consumedUnits,totalUnits" -ErrorAction Stop
                    $office365Data.Licenses = $subscribedSkus | ForEach-Object {
                        [PSCustomObject]@{
                            skuId = $_.SkuId
                            skuPartNumber = $_.SkuPartNumber
                            capabilityStatus = $_.CapabilityStatus
                            consumedUnits = $_.ConsumedUnits
                            totalUnits = $_.TotalUnits
                            availableUnits = $_.TotalUnits - $_.ConsumedUnits
                            _DataType = 'License'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($subscribedSkus.Count) license SKUs" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover licenses: $($_.Exception.Message)")
                }
            }

            # Discover Admin Roles
            if ($Configuration.IncludeAdminRoles) {
                Write-ModuleLog -ModuleName "Office365" -Message "Discovering admin roles..." -Level "INFO"
                try {
                    $directoryRoles = Get-MgDirectoryRole -All -Property "id,displayName,description" -ErrorAction Stop
                    $office365Data.AdminRoles = $directoryRoles | ForEach-Object {
                        [PSCustomObject]@{
                            id = $_.Id
                            displayName = $_.DisplayName
                            description = $_.Description
                            _DataType = 'AdminRole'
                        }
                    }
                    Write-ModuleLog -ModuleName "Office365" -Message "Discovered $($directoryRoles.Count) admin roles" -Level "SUCCESS"
                } catch {
                    $Result.AddWarning("Failed to discover admin roles: $($_.Exception.Message)")
                }
            }

            # Flatten data for export
            foreach ($category in $office365Data.PSObject.Properties) {
                if ($category.Value -and $category.Value.Count -gt 0) {
                    foreach ($item in $category.Value) {
                        $null = $allData.Add($item)
                    }
                }
            }

            # Export results
            if ($allData.Count -gt 0) {
                Export-DiscoveryResults -Data $allData `
                    -FileName "Office365Discovery.csv" `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Office365" `
                    -SessionId $SessionId
            }

        } catch {
            $Result.AddError("Error during Office 365 discovery", $_.Exception, @{Phase = "Discovery"})
        }

        return $allData
    }

    # Initialize result object
    $result = [PSCustomObject]@{
        Success = $true
        Message = "Office 365 discovery completed successfully"
        Data = @()
        Errors = @()
        Warnings = @()
        RecordCount = 0
    }

    # Helper methods for error/warning tracking
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $context)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Office365" -Message $message -Level "ERROR"
    }

    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message, $context)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Context = $context
            Timestamp = Get-Date
        }
        Write-ModuleLog -ModuleName "Office365" -Message $message -Level "WARN"
    }

    try {
        # Connect to Microsoft Graph
        Write-ModuleLog -ModuleName "Office365" -Message "Connecting to Microsoft Graph..." -Level "INFO"

        # Try authentication strategies
        $connected = $false

        # Strategy 1: Client Secret
        if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
            try {
                $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
                $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)
                Connect-MgGraph -ClientSecretCredential $credential -TenantId $Configuration.TenantId -NoWelcome -ErrorAction Stop
                $connected = $true
            } catch {
                Write-ModuleLog -ModuleName "Office365" -Message "Client Secret auth failed: $($_.Exception.Message)" -Level "WARN"
            }
        }

        # Strategy 2: Interactive fallback
        if (-not $connected) {
            try {
                Connect-MgGraph -Scopes "User.Read.All", "Group.Read.All", "Application.Read.All", "Device.Read.All", "Directory.Read.All", "Organization.Read.All" -NoWelcome -ErrorAction Stop
                $connected = $true
            } catch {
                $result.AddError("All authentication methods failed", $_.Exception, @{Section="Authentication"})
                return $result
            }
        }

        # Execute discovery script
        Write-ModuleLog -ModuleName "Office365" -Message "Executing Office 365 discovery..." -Level "INFO"

        $connections = @{
            Graph = Get-MgContext
        }

        $discoveryData = & $discoveryScript $Configuration $Context $SessionId $connections $result

        if ($result.Success) {
            $result.Data = $discoveryData
            $result.RecordCount = $discoveryData.Count
            Write-ModuleLog -ModuleName "Office365" -Message "Discovery completed successfully. Discovered $($discoveryData.Count) items." -Level "SUCCESS"
        }

    } catch {
        $result.AddError("Critical error during Office 365 discovery: $($_.Exception.Message)", $_.Exception, @{Phase="Execution"})
    } finally {
        # Disconnect from Graph
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
        } catch {
            # Ignore disconnect errors
        }
    }

    return $result
}

Export-ModuleMember -Function Invoke-Office365Discovery