$content = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'
$balance = 0

Write-Host "Tracing brace transitions..."
Write-Host ""

for($i=0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    $lineNum = $i + 1

    $openCount = ([regex]::Matches($line, '\{')).Count
    $closeCount = ([regex]::Matches($line, '\}')).Count

    $prevBalance = $balance
    $balance += $openCount
    $balance -= $closeCount

    # Show transitions related to our problem area
    if ($lineNum -in @(160, 175, 1746, 1755, 1756)) {
        Write-Host ("{0,4}: {1} -> {2} | {3}" -f $lineNum, $prevBalance, $balance, $line.Trim().Substring(0, [Math]::Min(60, $line.Trim().Length)))
    }

    # Show where balance goes from 1 to 2 (after line 175)
    if ($lineNum -gt 175 -and $lineNum -lt 1750 -and $prevBalance -eq 1 -and $balance -eq 2 -and $lineNum -ne 175) {
        Write-Host "**ALERT: Line $lineNum goes 1->2: $($line.Trim())"
    }
}
