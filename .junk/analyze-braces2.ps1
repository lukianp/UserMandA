$content = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'
$openBraces = 0
$closeBraces = 0

Write-Host "Analyzing brace balance around function start (lines 155-180)..."
Write-Host ""

for($i=0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    $lineNum = $i + 1

    $openCount = ([regex]::Matches($line, '\{')).Count
    $closeCount = ([regex]::Matches($line, '\}')).Count

    $openBraces += $openCount
    $closeBraces += $closeCount
    $balance = $openBraces - $closeBraces

    if ($lineNum -ge 155 -and $lineNum -le 180) {
        $marker = ""
        if ($openCount -gt 0) { $marker += " [+$openCount]" }
        if ($closeCount -gt 0) { $marker += " [-$closeCount]" }

        Write-Host ("{0,4}: Balance={1,3}{2,-10} | {3}" -f $lineNum, $balance, $marker, $line.Trim())
    }
}
