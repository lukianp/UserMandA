# Emergency Log Check Script
Write-Host "========================================="
Write-Host "Emergency Diagnostic Check"
Write-Host "========================================="

# Check if log directory exists
$logPath = "C:\discoverydata\ljpops\Logs"
if (Test-Path $logPath) {
    Write-Host "OK: Log directory exists at $logPath"
    $acl = Get-Acl $logPath
    Write-Host "Permissions: $($acl.Access | Select-Object -First 3 | Format-Table | Out-String)"
} else {
    Write-Host "WARNING: Log directory does not exist!"
    Write-Host "Creating log directory..."
    New-Item -Path $logPath -ItemType Directory -Force
}

# Check for all resource XAML files
$resourcePath = "D:\Scripts\UserMandA\GUI"
Write-Host ""
Write-Host "Checking critical resource files..."
$criticalFiles = @(
    "App.xaml",
    "MandADiscoverySuite.xaml",
    "Resources\Converters.xaml",
    "Resources\Converters\Converters.xaml",
    "Resources\Templates\DataTemplates.xaml",
    "Resources\Styles\MainStyles.xaml",
    "Themes\Colors.xaml"
)

foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $resourcePath $file
    if (Test-Path $fullPath) {
        Write-Host "OK: $file"
    } else {
        Write-Host "ERROR: MISSING - $file"
    }
}

# Check MandADiscoverySuite.xaml exists
Write-Host ""
Write-Host "Checking StartupUri target..."
if (Test-Path "$resourcePath\MandADiscoverySuite.xaml") {
    Write-Host "OK: MandADiscoverySuite.xaml exists"
} else {
    Write-Host "CRITICAL: MandADiscoverySuite.xaml NOT FOUND!"
}

# Try to run with detailed error catching
Write-Host ""
Write-Host "Attempting to launch application with error capture..."
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"

if (Test-Path $exePath) {
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $exePath
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $pinfo.CreateNoWindow = $false

        $p = New-Object System.Diagnostics.Process
        $p.StartInfo = $pinfo
        $p.Start() | Out-Null

        Start-Sleep -Seconds 3

        $stdout = $p.StandardOutput.ReadToEnd()
        $stderr = $p.StandardError.ReadToEnd()

        if ($stdout) {
            Write-Host "STDOUT:"
            Write-Host $stdout
        }

        if ($stderr) {
            Write-Host "STDERR:"
            Write-Host $stderr
        }

        if (!$p.HasExited) {
            Write-Host "Application is running!"
            $p.Kill()
        } else {
            Write-Host "Application exited with code: $($p.ExitCode)"
        }
    } catch {
        Write-Host "ERROR launching: $($_.Exception.Message)"
    }
} else {
    Write-Host "ERROR: Executable not found"
}

Write-Host ""
Write-Host "========================================="