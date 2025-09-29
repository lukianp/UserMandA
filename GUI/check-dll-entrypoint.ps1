# Check DLL Entry Point
$dllPath = "D:\Scripts\UserMandA\GUI\bin\Debug\net6.0-windows\MandADiscoverySuite.dll"

Write-Host "========================================="
Write-Host "Checking DLL Entry Point and App Class"
Write-Host "========================================="

if (Test-Path $dllPath) {
    try {
        # Load with reflection only
        $bytes = [System.IO.File]::ReadAllBytes($dllPath)
        $assembly = [System.Reflection.Assembly]::Load($bytes)

        Write-Host "Assembly loaded: $($assembly.FullName)"

        Write-Host ""
        Write-Host "Checking for App class..."
        $appType = $assembly.GetType("MandADiscoverySuite.App")
        if ($appType) {
            Write-Host "App class FOUND"
            Write-Host "  Full Name: $($appType.FullName)"
            Write-Host "  Base Type: $($appType.BaseType.FullName)"

            Write-Host ""
            Write-Host "Checking constructors..."
            $constructors = $appType.GetConstructors()
            Write-Host "Constructors found: $($constructors.Count)"
            foreach ($ctor in $constructors) {
                Write-Host "  - $($ctor.ToString())"
            }

            Write-Host ""
            Write-Host "Checking for Main method..."
            $mainMethods = $appType.GetMethods([System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static) | Where-Object { $_.Name -eq "Main" }
            if ($mainMethods) {
                Write-Host "Main method(s) found: $($mainMethods.Count)"
                foreach ($method in $mainMethods) {
                    Write-Host "  - $($method.ToString())"
                    Write-Host "    Parameters: $($method.GetParameters().Count)"
                }
            } else {
                Write-Host "No Main method found in App class"
            }
        } else {
            Write-Host "ERROR: App class not found!"
        }

        Write-Host ""
        Write-Host "Listing all types with Main method..."
        $allTypes = $assembly.GetTypes()
        foreach ($type in $allTypes) {
            $mainMethod = $type.GetMethod("Main", [System.Reflection.BindingFlags]::Public -bor [System.Reflection.BindingFlags]::Static)
            if ($mainMethod) {
                Write-Host "Found Main in: $($type.FullName)"
            }
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
        Write-Host "Stack: $($_.Exception.StackTrace)"
    }
} else {
    Write-Host "ERROR: DLL not found at $dllPath"
}

Write-Host ""
Write-Host "========================================="