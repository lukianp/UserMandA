# Ultra Diagnostic - Check .NET Runtime
Write-Host "========================================="
Write-Host "Ultra Diagnostic - .NET Runtime Check"
Write-Host "========================================="

# Check .NET runtime
Write-Host ""
Write-Host "Checking .NET Runtime..."
dotnet --list-runtimes | Select-String "Microsoft.WindowsDesktop.App"

# Check if the exe requires specific runtime
Write-Host ""
Write-Host "Checking executable dependencies..."
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"
$runtimeConfig = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.runtimeconfig.json"

if (Test-Path $runtimeConfig) {
    Write-Host "Runtime config found:"
    Get-Content $runtimeConfig
} else {
    Write-Host "WARNING: No runtime config found"
}

# Try to get more error details from Event Viewer
Write-Host ""
Write-Host "Checking Event Viewer (last 2 minutes)..."
$startTime = (Get-Date).AddMinutes(-2)
$events = Get-WinEvent -FilterHashtable @{
    LogName = 'Application'
    Level = 2  # Error
    StartTime = $startTime
} -ErrorAction SilentlyContinue

if ($events) {
    $events | Where-Object { $_.ProviderName -like "*.NET*" -or $_.Message -like "*MandA*" } |
        Select-Object TimeCreated, ProviderName, Id, Message | Format-List
} else {
    Write-Host "No recent errors found in Event Viewer"
}

# Check for missing resource DLLs
Write-Host ""
Write-Host "Checking for XAML resource compilation..."
$bamlFiles = Get-ChildItem "D:\Scripts\UserMandA\GUI\obj\Debug\net6.0-windows" -Filter "*.baml" -Recurse -ErrorAction SilentlyContinue
if ($bamlFiles) {
    Write-Host "BAML files found: $($bamlFiles.Count)"
} else {
    Write-Host "WARNING: No BAML files found - XAML may not be compiled"
}

# Check MandADiscoverySuite.g.resources
$resourcesFile = "D:\Scripts\UserMandA\GUI\obj\Debug\net6.0-windows\MandADiscoverySuite.g.resources"
if (Test-Path $resourcesFile) {
    Write-Host "OK: Generated resources file exists"
    $info = Get-Item $resourcesFile
    Write-Host "  Size: $($info.Length) bytes"
    Write-Host "  Modified: $($info.LastWriteTime)"
} else {
    Write-Host "ERROR: Generated resources file NOT FOUND!"
}

Write-Host ""
Write-Host "========================================="