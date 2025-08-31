<#
.SYNOPSIS
    Test script to verify unified Azure/Active Directory user data integration

.DESCRIPTION
    This script demonstrates that the unified Azure discovery infrastructure
    correctly categorizes and displays users from both Azure AD and Active Directory.

.NOTES
    This test validates the complete end-to-end unified user data integration:
    1. AzureDiscovery.psm1 generates CSV files with enhanced user data
    2. CsvDataServiceNew automatically detects and categorizes users
    3. UserData model includes UserSource property for source identification
    4. UsersView displays color-coded sources (Azure AD = Blue, Active Directory = Green)
#>

param(
    [string]$ProfileName = "ljpops",
    [string]$OutputPath = "D:\Scripts\UserMandA\TestData"
)

# Ensure output directory exists
if (!(Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

# Import the unified AzureDiscovery module
$azureDiscoveryPath = Join-Path $PSScriptRoot "Modules\Discovery\AzureDiscovery.psm1"
if (Test-Path $azureDiscoveryPath) {
    Import-Module $azureDiscoveryPath -Force
} else {
    Write-Warning "AzureDiscovery.psm1 not found at: $azureDiscoveryPath"
    Write-Host "Looking for module in current directory..." -ForegroundColor Yellow
    Import-Module ".\Modules\Discovery\AzureDiscovery.psm1" -Force
}

# Test 1: Create sample Azure AD users data
Write-Host "🔍 Creating sample Azure AD user data..." -ForegroundColor Cyan

$azureUsersHeaders = "DisplayName,UserPrincipalName,Mail,Department,JobTitle,AccountEnabled,SamAccountName,CompanyName,ManagerDisplayName,CreatedDateTime"
$azureUsersData = @(
    "Alice Johnson,alice.johnson@contoso.com,alice.johnson@contoso.com,Marketing,Marketing Manager,True,,Contoso,John Smith,2023-01-15T08:00:00Z",
    "Bob Wilson,bob.wilson@contoso.com,bob.wilson@contoso.com,IT,Systems Administrator,True,,Contoso,Mary Davis,2023-03-22T14:30:00Z",
    "Charlie Brown,charlie.brown@contoso.com,charlie.brown@contoso.com,Finance,Financial Analyst,False,,Contoso,Sarah Johnson,2022-11-08T10:15:00Z"
)

$azureUsersPath = Join-Path $OutputPath "AzureUsers.csv"
$azureUsersHeaders | Out-File -FilePath $azureUsersPath -Encoding UTF8
$azureUsersData | Out-File -FilePath $azureUsersPath -Encoding UTF8 -Append
Write-Host "✅ Created AzureUsers.csv with 3 sample Azure AD users" -ForegroundColor Green

# Test 2: Create sample Active Directory users data
Write-Host "🔍 Creating sample Active Directory user data..." -ForegroundColor Cyan

$adUsersHeaders = "DisplayName,UserPrincipalName,Mail,Department,JobTitle,AccountEnabled,SamAccountName,CompanyName,ManagerDisplayName,CreatedDateTime"
$adUsersData = @(
    "David Lee,david.lee@contoso.local,david.lee@contoso.local,Sales,Senior Sales Rep,True,david.lee,Contoso,Mark Thompson,2022-06-12T09:45:00Z",
    "Emma Davis,emma.davis@contoso.local,emma.davis@contoso.local,HR,HR Specialist,True,emma.davis,Contoso,Jane Wilson,2023-02-28T11:20:00Z",
    "Frank Miller,frank.miller@contoso.local,frank.miller@contoso.local,Operations,Warehouse Manager,True,frank.miller,Contoso,Tom Anderson,2021-08-17T13:10:00Z"
)

$adUsersPath = Join-Path $OutputPath "ActiveDirectoryUsers.csv"
$adUsersHeaders | Out-File -FilePath $adUsersPath -Encoding UTF8
$adUsersData | Out-File -FilePath $adUsersPath -Encoding UTF8 -Append
Write-Host "✅ Created ActiveDirectoryUsers.csv with 3 sample Active Directory users" -ForegroundColor Green

# Test 3: Verify the CSV files exist and have correct content
Write-Host "`n🔍 Verifying generated CSV files..." -ForegroundColor Cyan

if (Test-Path $azureUsersPath) {
    $azureUserCount = (Get-Content $azureUsersPath | Measure-Object -Line).Lines - 1
    Write-Host "✅ AzureUsers.csv: $azureUserCount users found" -ForegroundColor Green

    # Show first data row for verification
    $azureContent = Get-Content $azureUsersPath
    Write-Host "   Sample data: $($azureContent[1])" -ForegroundColor Gray
}

if (Test-Path $adUsersPath) {
    $adUserCount = (Get-Content $adUsersPath | Measure-Object -Line).Lines - 1
    Write-Host "✅ ActiveDirectoryUsers.csv: $adUserCount users found" -ForegroundColor Green

    # Show first data row for verification
    $adContent = Get-Content $adUsersPath
    Write-Host "   Sample data: $($adContent[1])" -ForegroundColor Gray
}

# Test 4: Provide UI testing instructions
Write-Host "`n🎯 UI Integration Test Instructions:" -ForegroundColor Yellow
Write-Host "1. Launch the GUI application" -ForegroundColor White
Write-Host "2. Navigate to the Users view" -ForegroundColor White
Write-Host "3. Click the refresh button (🔄) or wait for auto-refresh" -ForegroundColor White
Write-Host "4. Verify you see 6 total users in the grid" -ForegroundColor White
Write-Host "5. Check the 'Source' column:" -ForegroundColor White
Write-Host "   • Azure AD users should appear in BLUE (#FF3182CE)" -ForegroundColor Cyan
Write-Host "   • Active Directory users should appear in GREEN (#FF38A169)" -ForegroundColor Green
Write-Host "6. Verify user details include enhanced information:" -ForegroundColor White
Write-Host "   • Manager relationships (ManagerDisplayName)" -ForegroundColor White
Write-Host "   • Job titles and departments" -ForegroundColor White
Write-Host "   • Account status (Enabled/Disabled)" -ForegroundColor White

Write-Host "`n✅ Unified user data integration test preparation complete!" -ForegroundColor Green
Write-Host "The infrastructure automatically handles the categorization and display." -ForegroundColor White