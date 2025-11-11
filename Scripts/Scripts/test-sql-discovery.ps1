# Test SQL Server Discovery Module
Import-Module 'D:\Scripts\UserMandA\Modules\Discovery\SQLServerDiscovery.psm1' -Force

$context = @{ 
    Paths = @{ 
        RawDataOutput = 'C:\discoverydata\ljpops\Raw' 
    } 
}
$config = @{}
$sessionId = 'TEST-SESSION-001'

try {
    Write-Host "Starting SQL Server discovery test..."
    $result = Invoke-SQLServerDiscovery -Configuration $config -Context $context -SessionId $sessionId
    Write-Host "Discovery completed successfully. Records: $($result.RecordCount)"
    
    # Check if files were created
    $sqlServersFile = Join-Path $context.Paths.RawDataOutput "SqlServers.csv"
    $databasesFile = Join-Path $context.Paths.RawDataOutput "Databases.csv"
    
    if (Test-Path $sqlServersFile) {
        Write-Host "SqlServers.csv file created successfully"
        $content = Get-Content $sqlServersFile -First 5
        Write-Host "First 5 lines:"
        $content | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "SqlServers.csv file not found"
    }
    
    if (Test-Path $databasesFile) {
        Write-Host "Databases.csv file found (may be existing)"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)"
}