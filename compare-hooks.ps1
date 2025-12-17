$workspace = (Get-ChildItem 'D:\Scripts\UserMandA\guiv2\src\renderer\hooks\use*DiscoveryLogic.ts').Name | Sort-Object
$deploy = (Get-ChildItem 'C:\enterprisediscovery\guiv2\src\renderer\hooks\use*DiscoveryLogic.ts').Name | Sort-Object

Write-Host "=== Hooks in workspace but NOT in deployment ==="
Compare-Object $workspace $deploy | Where-Object { $_.SideIndicator -eq '<=' } | ForEach-Object {
    Write-Host $_.InputObject
}

Write-Host "`n=== Hooks in deployment but NOT in workspace ==="
Compare-Object $workspace $deploy | Where-Object { $_.SideIndicator -eq '=>' } | ForEach-Object {
    Write-Host $_.InputObject
}

Write-Host "`n=== Summary ==="
Write-Host "Workspace hooks: $($workspace.Count)"
Write-Host "Deployment hooks: $($deploy.Count)"
