$viewsPath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$files = Get-ChildItem "$viewsPath\*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'overflow-hidden overflow-hidden', 'overflow-hidden'
    $content = $content -replace 'flex-shrink-0 flex-shrink-0', 'flex-shrink-0'
    Set-Content $file.FullName -Value $content -NoNewline
}

Write-Host "Fixed duplicate classes in all view files"
