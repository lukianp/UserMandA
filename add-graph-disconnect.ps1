# Add Graph disconnection to cleanup section

$sourcePath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1"

$lines = Get-Content -Path $sourcePath -Encoding UTF8

# Find the cleanup section
$cleanupLineIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "# 8\. CLEANUP & COMPLETE") {
        $cleanupLineIndex = $i
        break
    }
}

if ($cleanupLineIndex -ge 0) {
    # Insert the Graph disconnection code after "Cleaning up..." line
    $insertIndex = $cleanupLineIndex + 3  # After comment, write log, and empty line

    $disconnectCode = @(
        "        # Disconnect from Microsoft Graph if connected",
        "        try {",
        "            if (Get-Command -Name Disconnect-MgGraph -ErrorAction SilentlyContinue) {",
        "                Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null",
        "                Write-ActiveDirectoryLog -Level `"DEBUG`" -Message `"Disconnected from Microsoft Graph`" -Context `$Context",
        "            }",
        "        } catch {",
        "            # Ignore disconnection errors",
        "        }",
        ""
    )

    $newLines = @()
    $newLines += $lines[0..($insertIndex - 1)]
    $newLines += $disconnectCode
    $newLines += $lines[$insertIndex..($lines.Count - 1)]

    # Write back
    $newLines | Set-Content -Path $sourcePath -Encoding UTF8

    Write-Host "[SUCCESS] Added Graph disconnection to cleanup section" -ForegroundColor Green

    # Copy to workspace
    Copy-Item -Path $sourcePath -Destination "D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1" -Force
    Write-Host "[SUCCESS] Copied to workspace" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Could not find cleanup section" -ForegroundColor Red
}
