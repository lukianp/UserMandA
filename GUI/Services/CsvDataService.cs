using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for loading and parsing CSV discovery data
    /// </summary>
    public class CsvDataService
    {
        /// <summary>
        /// Loads user data from CSV files
        /// </summary>
        public async Task<List<UserData>> LoadUsersAsync(string rawDataPath)
        {
            var users = new List<UserData>();

            try
            {
                // Look for user CSV files
                var userFiles = new[]
                {
                    Path.Combine(rawDataPath, "Users.csv"),
                    Path.Combine(rawDataPath, "AzureUsers.csv"),
                    Path.Combine(rawDataPath, "ActiveDirectoryUsers.csv")
                };

                foreach (var filePath in userFiles.Where(File.Exists))
                {
                    var fileUsers = await LoadUsersFromCsvAsync(filePath);
                    users.AddRange(fileUsers);
                }

                // Remove duplicates based on UserPrincipalName or SamAccountName
                users = users
                    .GroupBy(u => u.UserPrincipalName ?? u.SamAccountName ?? u.Id)
                    .Select(g => g.First())
                    .ToList();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading user data from CSV");
            }

            return users;
        }

        /// <summary>
        /// Loads infrastructure data from CSV files
        /// </summary>
        public async Task<List<InfrastructureData>> LoadInfrastructureAsync(string rawDataPath)
        {
            var infrastructure = new List<InfrastructureData>();

            try
            {
                // Look for infrastructure CSV files
                var infrastructureFiles = Directory.GetFiles(rawDataPath, "*.csv", SearchOption.TopDirectoryOnly)
                    .Where(f => IsInfrastructureFile(Path.GetFileName(f)))
                    .ToArray();

                foreach (var filePath in infrastructureFiles)
                {
                    var fileInfrastructure = await LoadInfrastructureFromCsvAsync(filePath);
                    infrastructure.AddRange(fileInfrastructure);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading infrastructure data from CSV");
            }

            return infrastructure;
        }

        /// <summary>
        /// Loads group data from CSV files
        /// </summary>
        public async Task<List<GroupData>> LoadGroupsAsync(string rawDataPath)
        {
            var groups = new List<GroupData>();

            try
            {
                // Look for group CSV files
                var groupFiles = new[]
                {
                    Path.Combine(rawDataPath, "Groups.csv"),
                    Path.Combine(rawDataPath, "AzureGroups.csv"),
                    Path.Combine(rawDataPath, "ActiveDirectoryGroups.csv"),
                    Path.Combine(rawDataPath, "ExchangeDistributionGroups.csv")
                };

                foreach (var filePath in groupFiles.Where(File.Exists))
                {
                    var fileGroups = await LoadGroupsFromCsvAsync(filePath);
                    groups.AddRange(fileGroups);
                }

                // Remove duplicates
                groups = groups
                    .GroupBy(g => g.Id ?? g.DisplayName)
                    .Select(g => g.First())
                    .ToList();
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Loading group data from CSV");
            }

            return groups;
        }

        private async Task<List<UserData>> LoadUsersFromCsvAsync(string filePath)
        {
            var users = new List<UserData>();

            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return users; // No data

                var headers = ParseCsvLine(lines[0]);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var user = new UserData();
                        
                        // Map CSV columns to user properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                    user.Id = value;
                                    break;
                                case "objecttype":
                                    user.ObjectType = value;
                                    break;
                                case "displayname":
                                    user.DisplayName = value;
                                    break;
                                case "userprincipalname":
                                    user.UserPrincipalName = value;
                                    break;
                                case "mail":
                                case "email":
                                    user.Mail = value;
                                    break;
                                case "department":
                                    user.Department = value;
                                    break;
                                case "jobtitle":
                                    user.JobTitle = value;
                                    break;
                                case "accountenabled":
                                    user.AccountEnabled = ParseBool(value);
                                    break;
                                case "onpremisessamaccountname":
                                case "samaccountname":
                                    user.SamAccountName = value;
                                    break;
                                case "givenname":
                                    user.GivenName = value;
                                    break;
                                case "surname":
                                    user.Surname = value;
                                    break;
                                case "companyname":
                                    user.CompanyName = value;
                                    break;
                                case "city":
                                    user.City = value;
                                    break;
                                case "country":
                                    user.Country = value;
                                    break;
                                case "mobilephone":
                                    user.MobilePhone = value;
                                    break;
                                case "managerdisplayname":
                                    user.ManagerDisplayName = value;
                                    break;
                                case "createddatetime":
                                    user.CreatedDateTime = value;
                                    break;
                                case "lastsignindatetime":
                                    user.LastSignInDateTime = value;
                                    break;
                                case "groupmembershipcount":
                                    user.GroupMembershipCount = value;
                                    break;
                                case "assignedlicenses":
                                    user.AssignedLicenses = value;
                                    break;
                            }
                        }

                        // Only add users with meaningful data
                        if (!string.IsNullOrWhiteSpace(user.DisplayName) || 
                            !string.IsNullOrWhiteSpace(user.UserPrincipalName) ||
                            !string.IsNullOrWhiteSpace(user.SamAccountName))
                        {
                            users.Add(user);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Skip malformed rows but continue processing
                        System.Diagnostics.Debug.WriteLine($"Error parsing user row {i}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, $"Loading users from {filePath}");
            }

            return users;
        }

        private async Task<List<InfrastructureData>> LoadInfrastructureFromCsvAsync(string filePath)
        {
            var infrastructure = new List<InfrastructureData>();

            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return infrastructure;

                var headers = ParseCsvLine(lines[0]);
                var fileName = Path.GetFileNameWithoutExtension(filePath);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var device = new InfrastructureData
                        {
                            Type = DetermineInfrastructureType(fileName)
                        };
                        
                        // Map CSV columns to infrastructure properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                case "deviceid":
                                case "computername":
                                case "hostname":
                                    device.Id = value;
                                    device.Name = device.Name ?? value;
                                    break;
                                case "name":
                                case "displayname":
                                case "devicename":
                                    device.Name = value;
                                    break;
                                case "description":
                                    device.Description = value;
                                    break;
                                case "ipaddress":
                                case "ip":
                                    device.IPAddress = value;
                                    break;
                                case "operatingsystem":
                                case "os":
                                    device.OperatingSystem = value;
                                    break;
                                case "version":
                                case "osversion":
                                    device.Version = value;
                                    break;
                                case "location":
                                case "site":
                                    device.Location = value;
                                    break;
                                case "status":
                                case "state":
                                    device.Status = value;
                                    break;
                                case "manufacturer":
                                    device.Manufacturer = value;
                                    break;
                                case "model":
                                    device.Model = value;
                                    break;
                                case "lastseen":
                                case "lastcontacttime":
                                    device.LastSeen = value;
                                    break;
                            }
                        }

                        // Set default values
                        device.Status = device.Status ?? "Unknown";
                        device.Name = device.Name ?? device.Id ?? "Unknown Device";

                        infrastructure.Add(device);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error parsing infrastructure row {i}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, $"Loading infrastructure from {filePath}");
            }

            return infrastructure;
        }

        private async Task<List<GroupData>> LoadGroupsFromCsvAsync(string filePath)
        {
            var groups = new List<GroupData>();

            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length < 2) return groups;

                var headers = ParseCsvLine(lines[0]);
                
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var values = ParseCsvLine(lines[i]);
                        if (values.Length < headers.Length) continue;

                        var group = new GroupData();
                        
                        // Map CSV columns to group properties
                        for (int j = 0; j < headers.Length && j < values.Length; j++)
                        {
                            var header = headers[j].ToLowerInvariant();
                            var value = values[j];

                            switch (header)
                            {
                                case "id":
                                    group.Id = value;
                                    break;
                                case "objecttype":
                                    group.ObjectType = value;
                                    break;
                                case "displayname":
                                    group.DisplayName = value;
                                    break;
                                case "description":
                                    group.Description = value;
                                    break;
                                case "grouptypes":
                                    group.GroupType = value;
                                    break;
                                case "mailenabled":
                                    group.MailEnabled = ParseBool(value);
                                    break;
                                case "securityenabled":
                                    group.SecurityEnabled = ParseBool(value);
                                    break;
                                case "mail":
                                    group.Mail = value;
                                    break;
                                case "createddatetime":
                                    group.CreatedDateTime = value;
                                    break;
                                case "membercount":
                                    group.MemberCount = value;
                                    break;
                                case "ownercount":
                                    group.OwnerCount = value;
                                    break;
                                case "visibility":
                                    group.Visibility = value;
                                    break;
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(group.DisplayName))
                        {
                            groups.Add(group);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine($"Error parsing group row {i}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, $"Loading groups from {filePath}");
            }

            return groups;
        }

        private bool IsInfrastructureFile(string fileName)
        {
            var infrastructureFiles = new[]
            {
                "PhysicalServer_", "Security_", "NetworkInfrastructure", "VMware", "Intune",
                "SQLServer_", "Certificate_", "Applications.csv", "ServicePrincipals.csv"
            };

            return infrastructureFiles.Any(pattern => fileName.StartsWith(pattern, StringComparison.OrdinalIgnoreCase));
        }

        private string DetermineInfrastructureType(string fileName)
        {
            if (fileName.StartsWith("PhysicalServer", StringComparison.OrdinalIgnoreCase))
                return "Physical Server";
            if (fileName.StartsWith("Security_", StringComparison.OrdinalIgnoreCase))
                return "Security Device";
            if (fileName.StartsWith("NetworkInfrastructure", StringComparison.OrdinalIgnoreCase))
                return "Network Device";
            if (fileName.StartsWith("VMware", StringComparison.OrdinalIgnoreCase))
                return "Virtual Machine";
            if (fileName.StartsWith("SQLServer", StringComparison.OrdinalIgnoreCase))
                return "Database Server";
            if (fileName.StartsWith("Certificate", StringComparison.OrdinalIgnoreCase))
                return "Certificate";
            if (fileName.Contains("Application", StringComparison.OrdinalIgnoreCase))
                return "Application";
            if (fileName.Contains("ServicePrincipal", StringComparison.OrdinalIgnoreCase))
                return "Service Principal";

            return "Unknown";
        }

        private string[] ParseCsvLine(string line)
        {
            var values = new List<string>();
            bool inQuotes = false;
            var currentValue = "";

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"' && (i == 0 || line[i - 1] != '\\'))
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    values.Add(currentValue.Trim('"'));
                    currentValue = "";
                }
                else
                {
                    currentValue += c;
                }
            }

            values.Add(currentValue.Trim('"'));
            return values.ToArray();
        }

        private bool ParseBool(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return false;
            
            return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("yes", StringComparison.OrdinalIgnoreCase) ||
                   value.Equals("1", StringComparison.OrdinalIgnoreCase);
        }
    }
}