$files = @(
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useVirtualMachineMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useUserMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useSharePointMigrationEnhancedMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useServerMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useMailboxMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useMailboxMigrationBackupMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useFileSystemMigration.ts',
  'D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useApplicationMigration.ts'
)

$count = 0
foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $newContent = $content -replace 'onMigrationResult', 'onMigrationComplete'
    Set-Content -Path $file -Value $newContent -NoNewline
    Write-Host "Fixed: $(Split-Path $file -Leaf)"
    $count++
  }
}
Write-Host "`nTotal files fixed: $count"
