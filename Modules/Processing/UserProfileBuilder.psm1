# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

function Invoke-UserProfileBuilder {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$InputPath,
        [Parameter(Mandatory=$true)][hashtable]$Configuration,
        [Parameter(Mandatory=$true)][hashtable]$Context
    )

    Write-MandALog -Message "[UserProfileBuilder] Building user profiles from '$InputPath'..." -Level "INFO"
    $allUsers = Import-Csv -Path $InputPath
    $complexityThresholds = $Configuration.processing.complexityThresholds

    foreach ($user in $allUsers) {
        $complexityScore = 0
        # Example complexity logic
        if ($user.MailboxSizeGB -as [double] -gt 10) { $complexityScore++ }
        if ($user.memberOf -and ($user.memberOf -split ';').Count -gt 50) { $complexityScore++ }
        if ($user.IntuneDeviceManaged) { $complexityScore++ }

        $user | Add-Member -NotePropertyName "ComplexityScore" -Value $complexityScore -Force
        $complexityCategory = "Low"
        if ($complexityScore -gt $complexityThresholds.high) { $complexityCategory = "High" }
        elseif ($complexityScore -gt $complexityThresholds.medium) { $complexityCategory = "Medium" }
        $user | Add-Member -NotePropertyName "ComplexityCategory" -Value $complexityCategory -Force
    }

    Write-MandALog -Message "[UserProfileBuilder] Finished building profiles for $($allUsers.Count) users." -Level "SUCCESS"
    return $allUsers
}

Export-ModuleMember -Function Invoke-UserProfileBuilder