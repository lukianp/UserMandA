# Create Demo ZIP
$source = "D:\Scripts\UserMandA\DemoPackage"
$dest = "D:\Scripts\UserMandA\enterprise-discovery-demo.zip"

if (Test-Path $dest) { Remove-Item $dest -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($source, $dest, [System.IO.Compression.CompressionLevel]::Optimal, $false)

$file = Get-Item $dest
$sizeMB = [math]::Round($file.Length / 1MB, 2)
Write-Host "Created: $dest"
Write-Host "Size: $sizeMB MB"
Write-Host "Last Modified: $($file.LastWriteTime)"
