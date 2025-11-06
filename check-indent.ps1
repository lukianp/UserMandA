$lines = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1'

@(175, 1743, 1746, 1747, 1748, 1755, 1756) | ForEach-Object {
    $lineNum = $_
    $line = $lines[$lineNum - 1]

    # Count leading spaces
    $spaces = 0
    for ($i = 0; $i -lt $line.Length; $i++) {
        if ($line[$i] -eq ' ') {
            $spaces++
        } elseif ($line[$i] -eq "`t") {
            $spaces += 4
        } else {
            break
        }
    }

    $preview = $line.Trim()
    if ($preview.Length > 50) {
        $preview = $preview.Substring(0, 50) + "..."
    }

    Write-Host ("{0,4}: {1,2} spaces | {2}" -f $lineNum, $spaces, $preview)
}
