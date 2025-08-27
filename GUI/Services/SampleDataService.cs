using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for creating sample CSV data for demonstration purposes
    /// </summary>
    public class SampleDataService
    {
        private readonly ILogger<SampleDataService> _logger;

        public SampleDataService(ILogger<SampleDataService> logger = null)
        {
            _logger = logger;
        }

        /// <summary>
        /// Creates sample CSV data files for a profile if they don't exist
        /// </summary>
        public async Task CreateSampleDataIfMissingAsync(string profileName)
        {
            try
            {
                var dataPath = Path.Combine(@"C:\DiscoveryData", profileName, "Raw");
                
                // Create directory if it doesn't exist
                Directory.CreateDirectory(dataPath);

                // Create sample CSV files if they don't exist
                await CreateSampleUsersFileAsync(Path.Combine(dataPath, "Users.csv"));
                await CreateSampleGroupsFileAsync(Path.Combine(dataPath, "Groups.csv"));
                await CreateSampleInfrastructureFileAsync(Path.Combine(dataPath, "Infrastructure.csv"));
                await CreateSampleApplicationsFileAsync(Path.Combine(dataPath, "Applications.csv"));

                _logger?.LogInformation($"Sample data created for profile: {profileName}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error creating sample data for profile: {profileName}");
            }
        }

        private async Task CreateSampleUsersFileAsync(string filePath)
        {
            if (File.Exists(filePath)) return;

            var sampleData = @"Id,DisplayName,UserPrincipalName,Mail,Department,JobTitle,AccountEnabled,SamAccountName,GivenName,Surname,CompanyName,City,Country,MobilePhone,ManagerDisplayName,CreatedDateTime
1,John Smith,john.smith@ljpops.com,john.smith@ljpops.com,IT,Systems Administrator,True,jsmith,John,Smith,LJPOPS,Seattle,USA,+1-206-555-0123,Jane Wilson,2023-01-15T09:00:00Z
2,Jane Wilson,jane.wilson@ljpops.com,jane.wilson@ljpops.com,IT,IT Manager,True,jwilson,Jane,Wilson,LJPOPS,Seattle,USA,+1-206-555-0124,,2022-05-20T10:30:00Z
3,Mike Johnson,mike.johnson@ljpops.com,mike.johnson@ljpops.com,Sales,Sales Manager,True,mjohnson,Mike,Johnson,LJPOPS,Portland,USA,+1-503-555-0125,Sarah Davis,2023-03-10T14:15:00Z
4,Sarah Davis,sarah.davis@ljpops.com,sarah.davis@ljpops.com,Sales,VP Sales,True,sdavis,Sarah,Davis,LJPOPS,Portland,USA,+1-503-555-0126,,2021-08-12T11:45:00Z
5,Bob Anderson,bob.anderson@ljpops.com,bob.anderson@ljpops.com,HR,HR Specialist,True,banderson,Bob,Anderson,LJPOPS,Vancouver,Canada,+1-604-555-0127,Lisa Brown,2023-02-28T13:20:00Z
6,Lisa Brown,lisa.brown@ljpops.com,lisa.brown@ljpops.com,HR,HR Director,True,lbrown,Lisa,Brown,LJPOPS,Vancouver,Canada,+1-604-555-0128,,2020-11-05T09:10:00Z
7,Tom White,tom.white@ljpops.com,tom.white@ljpops.com,Finance,Financial Analyst,True,twhite,Tom,White,LJPOPS,San Francisco,USA,+1-415-555-0129,Jennifer Green,2023-04-18T16:00:00Z
8,Jennifer Green,jennifer.green@ljpops.com,jennifer.green@ljpops.com,Finance,CFO,True,jgreen,Jennifer,Green,LJPOPS,San Francisco,USA,+1-415-555-0130,,2019-07-22T08:30:00Z
9,David Miller,david.miller@ljpops.com,david.miller@ljpops.com,Engineering,Software Engineer,True,dmiller,David,Miller,LJPOPS,Austin,USA,+1-512-555-0131,Robert Taylor,2023-06-01T12:45:00Z
10,Robert Taylor,robert.taylor@ljpops.com,robert.taylor@ljpops.com,Engineering,Engineering Manager,True,rtaylor,Robert,Taylor,LJPOPS,Austin,USA,+1-512-555-0132,,2021-12-03T15:25:00Z";

            await File.WriteAllTextAsync(filePath, sampleData);
        }

        private async Task CreateSampleGroupsFileAsync(string filePath)
        {
            if (File.Exists(filePath)) return;

            var sampleData = @"Id,Name,DisplayName,Description,Type,SecurityEnabled,MailEnabled
1,IT-Admins,IT Administrators,IT Administration Group,Security,True,False
2,HR-Team,HR Team,Human Resources Team,Security,True,True
3,Sales-Team,Sales Team,Sales Department Team,Security,True,True
4,Finance-Users,Finance Users,Finance Department Access,Security,True,False
5,Engineering-Dev,Engineering Developers,Software Development Team,Security,True,True
6,All-Employees,All Employees,Company Wide Distribution List,Distribution,False,True
7,Executive-Team,Executive Team,Executive Leadership,Security,True,True
8,Remote-Workers,Remote Workers,Remote Access Group,Security,True,False
9,Contractors,Contractors,External Contractors,Security,True,False
10,Backup-Admins,Backup Administrators,Backup System Administrators,Security,True,False";

            await File.WriteAllTextAsync(filePath, sampleData);
        }

        private async Task CreateSampleInfrastructureFileAsync(string filePath)
        {
            if (File.Exists(filePath)) return;

            var sampleData = @"Name,Type,IPAddress,Domain,OperatingSystem,LastSeen,Status,Location,Owner
DC01,Domain Controller,192.168.1.10,ljpops.local,Windows Server 2019,2024-01-08T10:30:00Z,Online,Seattle Datacenter,IT Department
SQL01,Database Server,192.168.1.15,ljpops.local,Windows Server 2019,2024-01-08T10:25:00Z,Online,Seattle Datacenter,IT Department
WEB01,Web Server,192.168.1.20,ljpops.local,Windows Server 2022,2024-01-08T10:20:00Z,Online,Seattle Datacenter,IT Department
FILE01,File Server,192.168.1.25,ljpops.local,Windows Server 2019,2024-01-08T10:15:00Z,Online,Seattle Datacenter,IT Department
BACKUP01,Backup Server,192.168.1.30,ljpops.local,Windows Server 2022,2024-01-08T10:10:00Z,Online,Portland Office,IT Department
LAPTOP-001,Workstation,192.168.1.100,ljpops.local,Windows 11 Pro,2024-01-08T09:45:00Z,Online,Seattle Office,John Smith
LAPTOP-002,Workstation,192.168.1.101,ljpops.local,Windows 11 Pro,2024-01-08T09:40:00Z,Online,Portland Office,Mike Johnson
DESKTOP-001,Desktop,192.168.1.110,ljpops.local,Windows 10 Pro,2024-01-08T08:30:00Z,Online,Vancouver Office,Bob Anderson
PRINTER-001,Printer,192.168.1.200,ljpops.local,N/A,2024-01-08T07:00:00Z,Online,Seattle Office,IT Department
SWITCH-001,Network Switch,192.168.1.250,ljpops.local,N/A,2024-01-08T10:35:00Z,Online,Seattle Datacenter,IT Department";

            await File.WriteAllTextAsync(filePath, sampleData);
        }

        private async Task CreateSampleApplicationsFileAsync(string filePath)
        {
            if (File.Exists(filePath)) return;

            var sampleData = @"Name,Version,Publisher,InstallDate,Size,Location,Users
Microsoft Office 365,2023,Microsoft Corporation,2023-01-15,2.1 GB,C:\Program Files\Microsoft Office,All Users
Adobe Acrobat Reader DC,23.006.20320,Adobe Systems Incorporated,2023-10-12,340 MB,C:\Program Files\Adobe,All Users
Google Chrome,120.0.6099.109,Google LLC,2023-12-08,180 MB,C:\Program Files\Google,All Users
Visual Studio Code,1.85.1,Microsoft Corporation,2023-11-20,350 MB,C:\Users\%USERNAME%\AppData\Local\Programs,Developers
Slack,4.36.140,Slack Technologies,2023-09-15,180 MB,C:\Users\%USERNAME%\AppData\Local,All Users
Zoom,5.17.0,Zoom Video Communications,2023-11-30,210 MB,C:\Program Files\Zoom,All Users
SQL Server Management Studio,19.2,Microsoft Corporation,2023-08-10,850 MB,C:\Program Files (x86)\Microsoft SQL Server,Database Admins
AutoCAD 2024,24.0,Autodesk Inc,2023-04-25,8.2 GB,C:\Program Files\Autodesk,Engineering Team
Salesforce Desktop,2.0.1,Salesforce.com,2023-07-18,120 MB,C:\Program Files (x86)\Salesforce,Sales Team
QuickBooks Enterprise,23.0,Intuit Inc,2023-02-28,1.8 GB,C:\Program Files\Intuit,Finance Team";

            await File.WriteAllTextAsync(filePath, sampleData);
        }
    }
}