function Test-SimpleNmapInstallation {
    Write-Host "Testing nmap installation..." -ForegroundColor Cyan
    
    # Check if nmap is in PATH
    $nmapPath = Get-Command nmap -ErrorAction SilentlyContinue
    if ($nmapPath) {
        try {
            $versionOutput = & $nmapPath.Source --version 2>$null
            if ($versionOutput -match "Nmap version (\d+\.\d+)") {
                Write-Host "Found nmap in PATH: $($nmapPath.Source) version $($matches[1])" -ForegroundColor Green
                return @{
                    Installed = $true
                    Version = $matches[1]
                    Path = $nmapPath.Source
                    Status = "Found in PATH"
                }
            }
        } catch {
            Write-Host "nmap in PATH failed version test: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "No nmap found in PATH" -ForegroundColor Yellow
    return @{
        Installed = $false
        Version = ""
        Path = ""
        Status = "Not found"
    }
}

# Test the function
Test-SimpleNmapInstallation