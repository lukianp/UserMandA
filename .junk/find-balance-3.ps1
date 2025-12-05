$content = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'
$balance = 0

Write-Host "Finding where balance increases from 2 to 3..."
Write-Host ""

for($i=0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    $lineNum = $i + 1

    $openCount = ([regex]::Matches($line, '\{')).Count
    $closeCount = ([regex]::Matches($line, '\}')).Count

    $prevBalance = $balance
    $balance += $openCount
    $balance -= $closeCount

    if ($prevBalance -eq 2 -and $balance -eq 3 -and $lineNum -gt 175) {
        Write-Host "Line $lineNum (balance 2->3): $($line.Trim())"
        break
    }
}
