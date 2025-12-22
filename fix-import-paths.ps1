$files = @(
  'D:\Scripts\UserMandA-1\guiv2\src\main\ipcHandlers.migration.ts',
  'C:\enterprisediscovery\guiv2\src\main\ipcHandlers.migration.ts'
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $newContent = $content -replace "import\('\.\/services\/powershellExecutionService'\)", "import('./services/powerShellService')"
    Set-Content -Path $file -Value $newContent -NoNewline
    Write-Host "Fixed: $file"
  }
}
