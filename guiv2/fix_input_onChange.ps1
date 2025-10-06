# PowerShell script to revert Input onChange fixes (Input uses events, not values)

$guiv2Path = "D:\Scripts\UserMandA\guiv2\src\renderer\views"

Write-Host "Reverting Input onChange fixes..." -ForegroundColor Green

$files = Get-ChildItem -Path $guiv2Path -Recurse -Include *.tsx,*.ts

$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    $percentComplete = [math]::Round(($currentFile / $totalFiles) * 100, 2)
    Write-Progress -Activity "Reverting Input onChange" -Status "Processing $($file.Name)" -PercentComplete $percentComplete

    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false

    # Revert Input onChange that was incorrectly changed
    # Pattern: Input with onChange={(value) => ...}
    # Change back to: onChange={e => ...e.target.value...}

    # This is complex, so let's just revert the specific pattern in Input components
    # Look for: <Input ... onChange={(value) => setState(value)} />
    # Change to: <Input ... onChange={e => setState(e.target.value)} />

    $content = $content -replace '(<Input[^>]*onChange=\{)\(value\) => ([^\(]+)\(value\)', '$1e => $2(e.target.value)'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Reverted: $($file.Name)" -ForegroundColor Yellow
        $changed = $true
    }
}

Write-Progress -Activity "Reverting Input onChange" -Completed
Write-Host "Completed!" -ForegroundColor Green
