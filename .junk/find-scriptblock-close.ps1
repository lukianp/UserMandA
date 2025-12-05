$lines = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'
$balance = 0

Write-Host "Finding where scriptblock closes (balance 2->1 after line 175)..."
Write-Host ""

for($i=0; $i -lt $lines.Count; $i++) {
    $lineNum = $i + 1
    $line = $lines[$i]

    $openCount = ([regex]::Matches($line, '\{')).Count
    $closeCount = ([regex]::Matches($line, '\}')).Count

    $prevBalance = $balance
    $balance += $openCount
    $balance -= $closeCount

    if ($lineNum -gt 175 -and $prevBalance -eq 2 -and $balance -eq 1) {
        # Count spaces
        $spaces = 0
        for ($j = 0; $j -lt $line.Length; $j++) {
            if ($line[$j] -eq ' ') { $spaces++ }
            elseif ($line[$j] -eq "`t") { $spaces += 4 }
            else { break }
        }

        Write-Host ("Line {0,4} (balance 2->1, {1} spaces): {2}" -f $lineNum, $spaces, $line.Trim())
        break
    }
}
