# PowerShell script to remove the ReportsView and AnalyticsView sections from MandADiscoverySuite.xaml
# This handles the large content sections that are too big for single edit operations

$xamlFile = "D:\Scripts\UserMandA\GUI\MandADiscoverySuite.xaml"
Write-Host "Removing ReportsView and AnalyticsView sections from $xamlFile"

# Read all lines
$lines = Get-Content $xamlFile

# Find start and end lines for removal
$startLine = -1
$endLine = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '<Grid Grid.Row="1" x:Name="ReportsView"') {
        $startLine = $i
        Write-Host "Found ReportsView start at line $($i + 1)"
    }
    if ($lines[$i] -match '</Grid>' -and $startLine -ne -1 -and $endLine -eq -1) {
        # Look ahead to see if this is followed by Settings View (within next few lines)
        for ($j = $i + 1; $j -lt $i + 5 -and $j -lt $lines.Count; $j++) {
            if ($lines[$j] -match 'Settings View.*DISABLED') {
                $endLine = $i
                Write-Host "Found ReportsView end at line $($i + 1)"
                break
            }
        }
        if ($endLine -ne -1) { break }
    }
}

if ($startLine -ne -1 -and $endLine -ne -1) {
    Write-Host "Removing lines $($startLine + 1) to $($endLine + 1) (total: $($endLine - $startLine + 1) lines)"

    # Create new content without the ReportsView/AnalyticsView sections
    $newLines = @()
    $newLines += $lines[0..($startLine - 1)]  # Before ReportsView
    $newLines += $lines[($endLine + 1)..($lines.Count - 1)]  # After ReportsView

    # Write back to file
    $newLines | Set-Content $xamlFile -Encoding UTF8

    $originalCount = $lines.Count
    $newCount = $newLines.Count
    $removedCount = $originalCount - $newCount

    Write-Host "Success! Removed $removedCount lines from XAML file"
    Write-Host "Original: $originalCount lines -> New: $newCount lines"
} else {
    Write-Host "Could not find ReportsView section boundaries"
    Write-Host "Start line: $startLine, End line: $endLine"
}

Write-Host "Script completed"