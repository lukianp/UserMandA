$lines = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'
$balance = 0

Write-Host "Finding all brace transitions from line 160 to end..."
Write-Host ""

for($i=0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    $line = $lines[$i]

    $openCount = ([regex]::Matches($line, '\{')).Count
    $closeCount = ([regex]::Matches($line, '\}')).Count

    $prevBalance = $balance
    $balance += $openCount
    $balance -= $closeCount

    # Show transitions after line 175 where balance changes
    if ($lineNum -gt 175 -and $lineNum -lt 1760 -and ($openCount -gt 0 -or $closeCount -gt 0)) {
        $marker = ""
        if ($openCount -gt 0) { $marker += " OPEN" }
        if ($closeCount -gt 0) { $marker += " CLOSE" }

        $preview = $line.Trim()
        if ($preview.Length > 60) {
            $preview = $preview.Substring(0, 60) + "..."
        }

        Write-Host ("{0,4}: {1}->{2}{3} | {4}" -f $lineNum, $prevBalance, $balance, $marker, $preview)
    }
}

Write-Host ""
Write-Host "Final balance: $balance (should be 0)"
