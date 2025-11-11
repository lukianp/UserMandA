# Test script to verify DatabaseSchemaDiscovery fix
Import-Module 'D:\Scripts\UserMandA\Modules\Discovery\DatabaseSchemaDiscovery.psm1' -Force

$context = @{
    Paths = @{ RawDataOutput = 'C:\discoverydata\ljpops\Raw' }
}
$config = @{}
$sessionId = 'TEST-SESSION-' + (Get-Date -Format 'yyyy-MM-dd-HHmmss')

try {
    Write-Host "Testing DatabaseSchemaDiscovery fix..."
    $result = Invoke-DatabaseSchemaDiscovery -Configuration $config -Context $context -SessionId $sessionId

    if ($result.EndTime -ne $null) {
        Write-Host "SUCCESS: Database discovery completed successfully!"
        Write-Host "EndTime: $($result.EndTime)"
        Write-Host "Records: $($result.RecordCount)"
        Write-Host "Success: $($result.Success)"
    } else {
        Write-Host "ERROR: EndTime is null - Complete method didn't work properly"
    }

} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)"
}