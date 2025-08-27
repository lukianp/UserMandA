#Requires -Version 5.1

<#
.SYNOPSIS
    Simple Discovery Data Refresh Script for M&A Discovery Suite
.DESCRIPTION
    Generates test/sample data for all required CSV files to refresh stale discovery data.
    This ensures the GUI has current data for testing and demonstrations.
#>

[CmdletBinding()]
param(
    [string]$CompanyProfile = "ljpops",
    [string]$OutputPath = "C:\discoverydata\ljpops\Raw",
    [switch]$Force
)

$SessionId = [Guid]::NewGuid().ToString()
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$StartTime = Get-Date

Write-Host "==================================================================" -ForegroundColor Green
Write-Host "M&A Discovery Suite - Simple Data Refresh" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan
Write-Host "Start Time: $($StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan
Write-Host "Output Path: $OutputPath" -ForegroundColor Cyan
Write-Host ""

# Ensure output directory exists
if (!(Test-Path $OutputPath)) {
    Write-Host "Creating output directory: $OutputPath" -ForegroundColor Yellow
    New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
}

# Define CSV files to refresh with sample data
$CSVFiles = @{
    "Users.csv" = @"
UserPrincipalName,DisplayName,Department,JobTitle,Manager,LastLogonDate,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
john.doe@ljpops.com,John Doe,IT,Senior Developer,jane.smith@ljpops.com,2025-08-22 14:30:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
jane.smith@ljpops.com,Jane Smith,IT,IT Manager,,2025-08-23 09:15:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
mike.johnson@ljpops.com,Mike Johnson,HR,HR Specialist,sarah.wilson@ljpops.com,2025-08-23 08:45:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
sarah.wilson@ljpops.com,Sarah Wilson,HR,HR Director,,2025-08-23 09:00:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
alex.brown@ljpops.com,Alex Brown,Finance,Financial Analyst,tom.davis@ljpops.com,2025-08-22 16:20:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
tom.davis@ljpops.com,Tom Davis,Finance,Finance Manager,,2025-08-23 08:30:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
"@

    "Groups.csv" = @"
Name,GroupType,Description,MemberCount,Members,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
IT-Admins,Security,IT Administrators Group,2,"john.doe@ljpops.com;jane.smith@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
HR-Team,Security,Human Resources Team,2,"mike.johnson@ljpops.com;sarah.wilson@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
Finance-Users,Security,Finance Department Users,2,"alex.brown@ljpops.com;tom.davis@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
All-Employees,Distribution,All Company Employees,6,"john.doe@ljpops.com;jane.smith@ljpops.com;mike.johnson@ljpops.com;sarah.wilson@ljpops.com;alex.brown@ljpops.com;tom.davis@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
"@

    "Applications.csv" = @"
ApplicationName,Version,Publisher,InstallDate,UsageCount,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Microsoft Office 365,2023,Microsoft Corporation,2024-01-15,150,$Timestamp,ApplicationDiscovery,$SessionId
Adobe Acrobat Pro,2023,Adobe Inc.,2024-02-20,75,$Timestamp,ApplicationDiscovery,$SessionId
Visual Studio Code,1.92,Microsoft Corporation,2024-01-10,45,$Timestamp,ApplicationDiscovery,$SessionId
Slack Desktop,4.35,Slack Technologies Inc.,2024-03-01,120,$Timestamp,ApplicationDiscovery,$SessionId
Zoom Client,5.16,Zoom Video Communications,2024-01-08,98,$Timestamp,ApplicationDiscovery,$SessionId
"@

    "ExchangeDistributionGroups.csv" = @"
Name,DisplayName,PrimarySmtpAddress,MemberCount,GroupType,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
all-company,All Company,all-company@ljpops.com,6,Universal,$Timestamp,ExchangeDiscovery,$SessionId
it-team,IT Team,it-team@ljpops.com,2,Universal,$Timestamp,ExchangeDiscovery,$SessionId
hr-notifications,HR Notifications,hr-notifications@ljpops.com,2,Universal,$Timestamp,ExchangeDiscovery,$SessionId
finance-alerts,Finance Alerts,finance-alerts@ljpops.com,2,Universal,$Timestamp,ExchangeDiscovery,$SessionId
"@

    "ExchangeMailContacts.csv" = @"
Name,DisplayName,ExternalEmailAddress,ContactType,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
external-partner1,External Partner 1,partner1@external.com,MailContact,$Timestamp,ExchangeDiscovery,$SessionId
vendor-support,Vendor Support,support@vendor.com,MailContact,$Timestamp,ExchangeDiscovery,$SessionId
legal-counsel,Legal Counsel,legal@lawfirm.com,MailContact,$Timestamp,ExchangeDiscovery,$SessionId
"@

    "SharePointSites.csv" = @"
SiteUrl,Title,Template,Owner,StorageUsedMB,LastActivityDate,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
https://ljpops.sharepoint.com/sites/ITDepartment,IT Department,STS#3,jane.smith@ljpops.com,1250,2025-08-23,$Timestamp,SharePointDiscovery,$SessionId
https://ljpops.sharepoint.com/sites/HRResources,HR Resources,STS#3,sarah.wilson@ljpops.com,850,2025-08-22,$Timestamp,SharePointDiscovery,$SessionId
https://ljpops.sharepoint.com/sites/FinanceReports,Finance Reports,STS#3,tom.davis@ljpops.com,2100,2025-08-23,$Timestamp,SharePointDiscovery,$SessionId
https://ljpops.sharepoint.com/sites/CompanyWiki,Company Wiki,WIKI#0,jane.smith@ljpops.com,450,2025-08-21,$Timestamp,SharePointDiscovery,$SessionId
"@

    "MicrosoftTeams.csv" = @"
TeamName,TeamId,Description,MemberCount,Privacy,CreatedDate,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
IT Support Team,12345678-1234-1234-1234-123456789012,Internal IT support and maintenance,3,Private,2024-01-15,$Timestamp,TeamsDiscovery,$SessionId
HR Announcements,12345678-1234-1234-1234-123456789013,Human resources company-wide announcements,25,Public,2024-01-20,$Timestamp,TeamsDiscovery,$SessionId
Finance Planning,12345678-1234-1234-1234-123456789014,Financial planning and budgeting discussions,5,Private,2024-02-01,$Timestamp,TeamsDiscovery,$SessionId
All Hands,12345678-1234-1234-1234-123456789015,Company-wide meetings and updates,50,Public,2024-01-10,$Timestamp,TeamsDiscovery,$SessionId
"@

    "ServicePrincipals.csv" = @"
DisplayName,AppId,ObjectId,ServicePrincipalType,ApplicationType,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Microsoft Graph,00000003-0000-0000-c000-000000000000,12345678-1234-1234-1234-123456789001,Application,Microsoft,$Timestamp,GraphDiscovery,$SessionId
SharePoint Online,00000003-0000-0ff1-ce00-000000000000,12345678-1234-1234-1234-123456789002,Application,Microsoft,$Timestamp,GraphDiscovery,$SessionId
Exchange Online,00000002-0000-0ff1-ce00-000000000000,12345678-1234-1234-1234-123456789003,Application,Microsoft,$Timestamp,GraphDiscovery,$SessionId
Custom App 1,12345678-abcd-1234-5678-123456789abc,12345678-1234-1234-1234-123456789004,Application,Custom,$Timestamp,GraphDiscovery,$SessionId
"@

    "DirectoryRoles.csv" = @"
DisplayName,RoleTemplateId,Description,MemberCount,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Global Administrator,62e90394-69f5-4237-9190-012177145e10,Full access to manage all aspects of Azure AD and Microsoft services,2,$Timestamp,GraphDiscovery,$SessionId
User Administrator,fe930be7-5e62-47db-91af-98c3a49a38b1,Can create and manage users and groups,1,$Timestamp,GraphDiscovery,$SessionId
Exchange Administrator,29232cdf-9323-42fd-ade2-1d097af3e4de,Can manage Exchange Online service settings,1,$Timestamp,GraphDiscovery,$SessionId
SharePoint Administrator,f28a1f50-f6e7-4571-818b-6a12f2af6b6c,Can manage SharePoint Online service settings,1,$Timestamp,GraphDiscovery,$SessionId
"@

    "Tenant.csv" = @"
TenantId,DisplayName,Domain,CountryCode,TechnicalContact,CreatedDate,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
12345678-1234-1234-1234-123456789000,LJPOPS Corporation,ljpops.com,US,admin@ljpops.com,2023-06-15,$Timestamp,GraphDiscovery,$SessionId
"@

    "IntuneManagedApps.csv" = @"
AppName,AppId,Publisher,Version,AssignmentCount,LastUpdated,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Microsoft Office Mobile,com.microsoft.office.office,Microsoft Corporation,2.75,45,2025-08-20,$Timestamp,IntuneDiscovery,$SessionId
Microsoft Outlook,com.microsoft.office.outlook,Microsoft Corporation,4.2428,50,2025-08-22,$Timestamp,IntuneDiscovery,$SessionId
Microsoft Teams,com.microsoft.skype.teams,Microsoft Corporation,5.6.0,48,2025-08-21,$Timestamp,IntuneDiscovery,$SessionId
Adobe Acrobat Reader,com.adobe.reader,Adobe Inc.,23.8.20459,35,$Timestamp,IntuneDiscovery,$SessionId
"@

    "PhysicalServer_Hardware.csv" = @"
ServerName,Manufacturer,Model,SerialNumber,ProcessorCount,TotalMemoryGB,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
SRV-DC01,Dell,PowerEdge R740,ABC123DEF456,2,64,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-EX01,HP,ProLiant DL380,XYZ789GHI012,2,128,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-FILE01,Dell,PowerEdge R640,JKL345MNO678,1,32,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-SQL01,HP,ProLiant DL580,PQR901STU234,4,256,$Timestamp,PhysicalServerDiscovery,$SessionId
"@

    "PhysicalServer_BIOS.csv" = @"
ServerName,BIOSVersion,BIOSDate,BIOSManufacturer,SecureBootEnabled,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
SRV-DC01,2.15.2,2024-03-15,Dell Inc.,True,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-EX01,U46 v2.64,2024-02-28,HP Inc.,True,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-FILE01,2.18.1,2024-04-10,Dell Inc.,True,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-SQL01,U46 v2.68,2024-05-15,HP Inc.,True,$Timestamp,PhysicalServerDiscovery,$SessionId
"@

    "PhysicalServer_Storage.csv" = @"
ServerName,DiskNumber,Size,FreeSpace,DiskType,FileSystem,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
SRV-DC01,0,500,250,SSD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-DC01,1,1000,800,HDD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-EX01,0,500,100,SSD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-EX01,1,2000,1200,HDD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-FILE01,0,500,300,SSD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-FILE01,1,4000,2500,HDD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-SQL01,0,1000,200,SSD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-SQL01,1,8000,4000,HDD,NTFS,$Timestamp,PhysicalServerDiscovery,$SessionId
"@

    "PhysicalServer_NetworkHardware.csv" = @"
ServerName,NetworkAdapter,MACAddress,IPAddress,Speed,Status,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
SRV-DC01,Intel Ethernet Connection,00:15:5D:FF:01:01,10.1.1.10,1000,Up,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-EX01,Broadcom NetXtreme,00:15:5D:FF:01:02,10.1.1.20,1000,Up,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-FILE01,Intel Ethernet Connection,00:15:5D:FF:01:03,10.1.1.30,1000,Up,$Timestamp,PhysicalServerDiscovery,$SessionId
SRV-SQL01,HP Ethernet 1Gb,00:15:5D:FF:01:04,10.1.1.40,1000,Up,$Timestamp,PhysicalServerDiscovery,$SessionId
"@

    "GPO_PlaceholderData.csv" = @"
GPOName,GPOID,Domain,CreatedTime,ModifiedTime,LinkedOUs,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Default Domain Policy,{31B2F340-016D-11D2-945F-00C04FB984F9},ljpops.com,2023-06-15 10:00:00,2025-07-15 14:30:00,DC=ljpops,DC=com,$Timestamp,GPODiscovery,$SessionId
Password Policy,{12345678-1234-1234-1234-123456789001},ljpops.com,2024-01-20 09:15:00,2025-08-01 11:20:00,DC=ljpops,DC=com,$Timestamp,GPODiscovery,$SessionId
Software Installation,{12345678-1234-1234-1234-123456789002},ljpops.com,2024-03-10 13:45:00,2025-08-10 16:10:00,OU=Workstations,$Timestamp,GPODiscovery,$SessionId
"@

    "Users_TestData.csv" = @"
UserPrincipalName,DisplayName,Department,JobTitle,Manager,LastLogonDate,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
test.user1@ljpops.com,Test User 1,Test Dept,Test Role,test.manager@ljpops.com,2025-08-23 10:00:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
test.user2@ljpops.com,Test User 2,Test Dept,Test Role,test.manager@ljpops.com,2025-08-23 10:30:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
test.manager@ljpops.com,Test Manager,Test Dept,Test Manager,,2025-08-23 09:00:00,$Timestamp,ActiveDirectoryDiscovery,$SessionId
"@

    "Groups_TestData.csv" = @"
Name,GroupType,Description,MemberCount,Members,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Test-Group-1,Security,Test Security Group 1,2,"test.user1@ljpops.com;test.user2@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
Test-Group-2,Distribution,Test Distribution Group 2,3,"test.user1@ljpops.com;test.user2@ljpops.com;test.manager@ljpops.com",$Timestamp,ActiveDirectoryDiscovery,$SessionId
"@

    "Applications_TestData.csv" = @"
ApplicationName,Version,Publisher,InstallDate,UsageCount,_DiscoveryTimestamp,_DiscoveryModule,_SessionId
Test Application 1,1.0,Test Publisher,2025-08-01,25,$Timestamp,ApplicationDiscovery,$SessionId
Test Application 2,2.5,Test Publisher,2025-08-15,15,$Timestamp,ApplicationDiscovery,$SessionId
Test Utility,1.2,Test Corp,2025-08-10,8,$Timestamp,ApplicationDiscovery,$SessionId
"@
}

# Generate all CSV files
$GeneratedFiles = @()
$FailedFiles = @()

Write-Host "Generating fresh CSV data files..." -ForegroundColor Yellow
Write-Host ""

foreach ($File in $CSVFiles.Keys) {
    try {
        $FilePath = Join-Path $OutputPath $File
        $Content = $CSVFiles[$File]
        
        Write-Host "▶ Generating: $File" -ForegroundColor Green
        $Content | Out-File -FilePath $FilePath -Encoding UTF8 -Force
        
        # Verify file was created successfully
        if (Test-Path $FilePath) {
            $FileInfo = Get-Item $FilePath
            $RecordCount = (Import-Csv $FilePath).Count
            Write-Host "  ✓ Created: $File ($($FileInfo.Length) bytes, $RecordCount records)" -ForegroundColor Green
            $GeneratedFiles += $File
        } else {
            Write-Host "  ✗ Failed to create: $File" -ForegroundColor Red
            $FailedFiles += $File
        }
    }
    catch {
        Write-Host "  ✗ Error generating $File : $($_.Exception.Message)" -ForegroundColor Red
        $FailedFiles += $File
    }
}

# Summary
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "DATA REFRESH COMPLETE" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Total Duration: $([math]::Round($Duration.TotalSeconds, 2)) seconds" -ForegroundColor Cyan
Write-Host "Files Generated: $($GeneratedFiles.Count)" -ForegroundColor Green
Write-Host "Files Failed: $($FailedFiles.Count)" -ForegroundColor $(if ($FailedFiles.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($GeneratedFiles.Count -gt 0) {
    Write-Host "✓ SUCCESSFULLY GENERATED FILES:" -ForegroundColor Green
    $GeneratedFiles | ForEach-Object { Write-Host "  • $_" -ForegroundColor Green }
    Write-Host ""
}

if ($FailedFiles.Count -gt 0) {
    Write-Host "✗ FAILED TO GENERATE:" -ForegroundColor Red
    $FailedFiles | ForEach-Object { Write-Host "  • $_" -ForegroundColor Red }
    Write-Host ""
}

# Validate all files
Write-Host "🔍 VALIDATING GENERATED FILES:" -ForegroundColor Yellow
$AllFiles = Get-ChildItem "$OutputPath\*.csv" | Sort-Object LastWriteTime -Descending

$FreshFiles = $AllFiles | Where-Object { $_.LastWriteTime -ge $StartTime }
$ValidRecordCount = 0

foreach ($File in $FreshFiles) {
    try {
        $Records = Import-Csv $File.FullName
        $ValidRecordCount += $Records.Count
        Write-Host "  ✓ $($File.Name) - $($Records.Count) records" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ $($File.Name) - Invalid format" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "FINAL SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Fresh CSV Files: $($FreshFiles.Count)" -ForegroundColor Green
Write-Host "Total Records: $ValidRecordCount" -ForegroundColor Green
Write-Host "Session ID: $SessionId" -ForegroundColor Cyan

if ($FreshFiles.Count -ge 15 -and $ValidRecordCount -gt 50) {
    Write-Host "🎉 REFRESH SUCCESSFUL - All data files updated with current timestamps!" -ForegroundColor Green
} elseif ($FreshFiles.Count -ge 10) {
    Write-Host "⚠ PARTIAL SUCCESS - Most data files updated" -ForegroundColor Yellow
} else {
    Write-Host "❌ REFRESH INCOMPLETE - Check for errors above" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔄 Data refresh completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "Ready for GUI testing and demonstrations!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green