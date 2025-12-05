# Compare hooks directories and find files where guiv2 is newer
$srcPath = 'D:\Scripts\UserMandA\src\renderer\hooks'
$guiv2Path = 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks'

Write-Host "=== Files where GUIV2 is NEWER than SRC ===" -ForegroundColor Cyan
Write-Host "(These need to be copied from guiv2 to src)" -ForegroundColor Yellow
Write-Host ""

$srcFiles = Get-ChildItem $srcPath -Filter '*.ts' -ErrorAction SilentlyContinue
$guiv2Files = Get-ChildItem $guiv2Path -Filter '*.ts' -ErrorAction SilentlyContinue

$needsCopy = @()

foreach ($gf in $guiv2Files) {
    $sf = $srcFiles | Where-Object { $_.Name -eq $gf.Name }
    if ($sf) {
        if ($gf.LastWriteTime -gt $sf.LastWriteTime) {
            $needsCopy += [PSCustomObject]@{
                FileName = $gf.Name
                GUIV2_Date = $gf.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
                SRC_Date = $sf.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
                GUIV2_Size = $gf.Length
                SRC_Size = $sf.Length
            }
        }
    } else {
        # File only exists in guiv2
        $needsCopy += [PSCustomObject]@{
            FileName = $gf.Name
            GUIV2_Date = $gf.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
            SRC_Date = "MISSING"
            GUIV2_Size = $gf.Length
            SRC_Size = 0
        }
    }
}

if ($needsCopy.Count -gt 0) {
    $needsCopy | Sort-Object FileName | Format-Table -AutoSize
    Write-Host ""
    Write-Host "Total files to copy from guiv2 to src: $($needsCopy.Count)" -ForegroundColor Green
} else {
    Write-Host "No files in guiv2 are newer than src" -ForegroundColor Green
}
