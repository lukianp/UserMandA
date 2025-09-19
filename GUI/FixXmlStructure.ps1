# PowerShell script to fix XML Grid tag imbalance in MandADiscoverySuite.xaml

$xamlFile = "D:\Scripts\UserMandA\GUI\MandADiscoverySuite.xaml"
Write-Host "Analyzing XML structure in $xamlFile"

# Read all lines
$lines = Get-Content $xamlFile

# Count opening and closing Grid tags
$openGrids = 0
$closeGrids = 0

foreach ($line in $lines) {
    $openGrids += ($line | Select-String -Pattern "<Grid" -AllMatches).Matches.Count
    $closeGrids += ($line | Select-String -Pattern "</Grid>" -AllMatches).Matches.Count
}

Write-Host "Opening Grid tags: $openGrids"
Write-Host "Closing Grid tags: $closeGrids"
$imbalance = $openGrids - $closeGrids

if ($imbalance -gt 0) {
    Write-Host "Missing $imbalance closing Grid tags - will add them before the final Window closing tag"

    # Find the line with </Window>
    $windowCloseLine = -1
    for ($i = $lines.Count - 1; $i -ge 0; $i--) {
        if ($lines[$i] -match "</Window>") {
            $windowCloseLine = $i
            break
        }
    }

    if ($windowCloseLine -ne -1) {
        # Insert missing closing Grid tags before </Window>
        $newLines = @()
        $newLines += $lines[0..($windowCloseLine - 1)]

        # Add missing closing Grid tags with proper indentation
        for ($i = 0; $i -lt $imbalance; $i++) {
            $newLines += "            </Grid>"
        }

        $newLines += $lines[$windowCloseLine..($lines.Count - 1)]

        # Write back to file
        $newLines | Set-Content $xamlFile -Encoding UTF8

        Write-Host "Added $imbalance closing Grid tags"
        Write-Host "New line count: $($newLines.Count)"
    } else {
        Write-Host "Could not find </Window> tag"
    }
} elseif ($imbalance -lt 0) {
    Write-Host "Too many closing Grid tags (excess: $(-$imbalance))"
} else {
    Write-Host "Grid tags are balanced"
}

Write-Host "XML structure fix completed"