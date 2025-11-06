Import-Module 'C:\enterprisediscovery\Modules\Discovery\AzureDiscovery.psm1' -Force -ErrorAction Stop
$params = '{"CompanyName":"ljpops","TenantId":"test","ClientId":"test","ClientSecret":"test","OutputPath":"C:\\DiscoveryData\\ljpops\\Raw"}' | ConvertFrom-Json -AsHashtable
Write-Host "Testing Start-AzureDiscovery with parameters:"
$params | Format-Table -AutoSize
Write-Host "Calling Start-AzureDiscovery..."
$result = Start-AzureDiscovery @params
if ($null -eq $result) {
  Write-Host "Result is null, converting to empty JSON"
  @{} | ConvertTo-Json -Compress
} else {
  Write-Host "Result type: $($result.GetType().FullName)"
  $result | ConvertTo-Json -Depth 10 -Compress
}
