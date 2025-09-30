# Launch with WPF Binding Trace
$env:COMPLUS_LogLevel = "4"
$env:COMPLUS_LogFacility = "0x10"

Write-Host "Launching with verbose tracing..." -ForegroundColor Cyan

# Create a temporary wrapper to capture stdout/stderr
$output = & "C:\enterprisediscovery\MandADiscoverySuite.exe" 2>&1

Write-Host "`n=== APPLICATION OUTPUT ===" -ForegroundColor Yellow
$output | ForEach-Object { Write-Host $_ }
Write-Host "=== END OUTPUT ===" -ForegroundColor Yellow
