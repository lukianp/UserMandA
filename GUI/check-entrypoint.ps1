# Check Entry Point
$exePath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.exe"

Write-Host "========================================="
Write-Host "Checking Assembly Entry Point"
Write-Host "========================================="

if (Test-Path $exePath) {
    try {
        $assembly = [System.Reflection.Assembly]::LoadFrom($exePath)
        $entryPoint = $assembly.EntryPoint

        if ($entryPoint) {
            Write-Host "Entry Point FOUND:"
            Write-Host "  Declaring Type: $($entryPoint.DeclaringType.FullName)"
            Write-Host "  Method Name: $($entryPoint.Name)"
            Write-Host "  Is Static: $($entryPoint.IsStatic)"
            Write-Host "  Is Public: $($entryPoint.IsPublic)"
        } else {
            Write-Host "ERROR: No entry point found in assembly!"
        }

        Write-Host ""
        Write-Host "Checking for App class..."
        $appType = $assembly.GetType("MandADiscoverySuite.App")
        if ($appType) {
            Write-Host "App class FOUND"
            Write-Host "  Full Name: $($appType.FullName)"
            Write-Host "  Base Type: $($appType.BaseType.FullName)"

            Write-Host ""
            Write-Host "Checking for Main method..."
            $mainMethods = $appType.GetMethods([System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static) | Where-Object { $_.Name -eq "Main" }
            if ($mainMethods) {
                Write-Host "Main method(s) found: $($mainMethods.Count)"
                foreach ($method in $mainMethods) {
                    Write-Host "  - $($method.ToString())"
                }
            } else {
                Write-Host "No Main method found in App class"
            }
        } else {
            Write-Host "ERROR: App class not found!"
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
} else {
    Write-Host "ERROR: Executable not found at $exePath"
}

Write-Host ""
Write-Host "========================================="