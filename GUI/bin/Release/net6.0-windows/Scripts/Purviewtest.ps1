# Test script to verify permissions
Write-Host "Testing Compliance Center Permissions..." -ForegroundColor Yellow

# Connect to Security & Compliance
try {
    Connect-IPPSSession -UserPrincipalName your-admin@domain.com
    Write-Host "✓ Successfully connected to Security & Compliance Center" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to connect to Security & Compliance Center" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test creating a compliance search
try {
    $testSearchName = "PermissionTest_$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-ComplianceSearch -Name $testSearchName -ExchangeLocation All -SearchQuery "subject:thisisatestquery123456789"
    Write-Host "✓ Can create compliance searches" -ForegroundColor Green
    
    # Clean up
    Remove-ComplianceSearch -Identity $testSearchName -Confirm:$false
} catch {
    Write-Host "✗ Cannot create compliance searches" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Check role assignments
Write-Host "`nYour Role Assignments:" -ForegroundColor Yellow
Get-RoleGroupMember "Organization Management" | Where-Object {$_.Name -like "*$env:USERNAME*"}
Get-RoleGroupMember "Compliance Management" | Where-Object {$_.Name -like "*$env:USERNAME*"}
Get-RoleGroupMember "eDiscovery Manager" | Where-Object {$_.Name -like "*$env:USERNAME*"}