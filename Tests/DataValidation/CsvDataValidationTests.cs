using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MandADiscoverySuite.Tests.DataValidation
{
    /// <summary>
    /// T-030: CSV data validation tests for RawData directory
    /// Validates mandatory columns, data types, and record consistency
    /// </summary>
    [TestClass]
    public class CsvDataValidationTests
    {
        private readonly string _primaryDataPath = @"C:\discoverydata\ljpops\RawData";
        private readonly string _testDataPath = Path.Combine(Path.GetTempPath(), $"CsvValidation_{Guid.NewGuid():N}");
        private readonly Dictionary<string, CsvSchema> _schemas;

        public CsvDataValidationTests()
        {
            _schemas = InitializeSchemas();
        }

        [TestInitialize]
        public void Setup()
        {
            Directory.CreateDirectory(_testDataPath);
        }

        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testDataPath))
            {
                try
                {
                    Directory.Delete(_testDataPath, true);
                }
                catch { }
            }
        }

        #region Schema Validation Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataValidation")]
        public async Task ValidateUsersCsv_MandatoryColumns()
        {
            // Arrange
            var schema = _schemas["Users"];
            var validationResults = new List<ValidationResult>();
            
            // Check both production and test paths
            var paths = new[]
            {
                Path.Combine(_primaryDataPath, "Users.csv"),
                Path.Combine(_primaryDataPath, "AzureUsers.csv"),
                Path.Combine(_primaryDataPath, "ActiveDirectoryUsers.csv")
            };

            // Act
            foreach (var path in paths.Where(File.Exists))
            {
                var result = await ValidateCsvFile(path, schema);
                validationResults.Add(result);
            }

            // If no production files exist, create and validate test file
            if (!validationResults.Any())
            {
                var testFile = CreateTestUsersCsv();
                var result = await ValidateCsvFile(testFile, schema);
                validationResults.Add(result);
            }

            // Assert
            foreach (var result in validationResults)
            {
                Assert.IsTrue(result.IsValid, $"File {result.FileName} validation failed: {string.Join(", ", result.Errors)}");
                Assert.IsTrue(result.MissingColumns.Count == 0, 
                    $"File {result.FileName} missing mandatory columns: {string.Join(", ", result.MissingColumns)}");
                
                Console.WriteLine($"Validated {result.FileName}:");
                Console.WriteLine($"  Records: {result.RecordCount}");
                Console.WriteLine($"  Valid Records: {result.ValidRecordCount}");
                Console.WriteLine($"  Invalid Records: {result.InvalidRecordCount}");
                Console.WriteLine($"  Missing Values: {result.MissingValueCount}");
            }
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataValidation")]
        public async Task ValidateGroupsCsv_MandatoryColumns()
        {
            // Arrange
            var schema = _schemas["Groups"];
            var paths = new[]
            {
                Path.Combine(_primaryDataPath, "Groups.csv"),
                Path.Combine(_primaryDataPath, "SecurityGroups.csv"),
                Path.Combine(_primaryDataPath, "DistributionGroups.csv")
            };

            // Act
            var validationResults = new List<ValidationResult>();
            foreach (var path in paths.Where(File.Exists))
            {
                var result = await ValidateCsvFile(path, schema);
                validationResults.Add(result);
            }

            if (!validationResults.Any())
            {
                var testFile = CreateTestGroupsCsv();
                var result = await ValidateCsvFile(testFile, schema);
                validationResults.Add(result);
            }

            // Assert
            foreach (var result in validationResults)
            {
                Assert.IsTrue(result.IsValid, $"Groups CSV validation failed: {string.Join(", ", result.Errors)}");
                Assert.AreEqual(0, result.MissingColumns.Count, "All mandatory columns should be present");
                
                // Validate group type values
                Assert.IsTrue(result.InvalidRecordCount == 0 || result.Warnings.Any(w => w.Contains("GroupType")),
                    "Invalid GroupType values should be warned");
            }
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataValidation")]
        public async Task ValidateDevicesCsv_MandatoryColumns()
        {
            // Arrange
            var schema = _schemas["Devices"];
            var paths = new[]
            {
                Path.Combine(_primaryDataPath, "Devices.csv"),
                Path.Combine(_primaryDataPath, "ComputerInventory.csv"),
                Path.Combine(_primaryDataPath, "MobileDevices.csv")
            };

            // Act & Assert
            await ValidateMultipleFiles(paths, schema, "Devices");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataValidation")]
        public async Task ValidateMailboxesCsv_MandatoryColumns()
        {
            // Arrange
            var schema = _schemas["Mailboxes"];
            var paths = new[]
            {
                Path.Combine(_primaryDataPath, "Mailboxes.csv"),
                Path.Combine(_primaryDataPath, "ExchangeMailboxes.csv"),
                Path.Combine(_primaryDataPath, "MailboxStatistics.csv")
            };

            // Act & Assert
            await ValidateMultipleFiles(paths, schema, "Mailboxes");
        }

        #endregion

        #region Data Type Validation Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataTypeValidation")]
        public async Task ValidateDataTypes_NumericFields()
        {
            // Arrange
            var testFile = CreateTestMailboxesCsvWithDataTypes();
            var schema = _schemas["Mailboxes"];
            
            // Act
            var result = await ValidateCsvFile(testFile, schema);
            
            // Assert
            Assert.IsTrue(result.DataTypeErrors.Count == 0, 
                $"Data type errors found: {string.Join(", ", result.DataTypeErrors)}");
            
            // Test with invalid data
            var invalidFile = CreateInvalidDataTypeCsv();
            var invalidResult = await ValidateCsvFile(invalidFile, _schemas["Mailboxes"]);
            
            Assert.IsTrue(invalidResult.DataTypeErrors.Count > 0, 
                "Should detect invalid numeric data types");
            Console.WriteLine($"Detected {invalidResult.DataTypeErrors.Count} data type errors as expected");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataTypeValidation")]
        public async Task ValidateDataTypes_DateTimeFields()
        {
            // Arrange
            var testFile = CreateTestCsvWithDates();
            var schema = new CsvSchema
            {
                Name = "TestDates",
                MandatoryColumns = new[] { "Id", "CreatedDate", "ModifiedDate" },
                OptionalColumns = new[] { "LastAccessDate" },
                DataTypes = new Dictionary<string, DataType>
                {
                    ["CreatedDate"] = DataType.DateTime,
                    ["ModifiedDate"] = DataType.DateTime,
                    ["LastAccessDate"] = DataType.DateTime
                }
            };
            
            // Act
            var result = await ValidateCsvFile(testFile, schema);
            
            // Assert
            Assert.IsTrue(result.IsValid, "Date validation should pass for valid dates");
            Assert.AreEqual(0, result.DataTypeErrors.Count, "No date type errors expected");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("DataTypeValidation")]
        public async Task ValidateDataTypes_BooleanFields()
        {
            // Arrange
            var testFile = CreateTestCsvWithBooleans();
            var schema = new CsvSchema
            {
                Name = "TestBooleans",
                MandatoryColumns = new[] { "Id", "IsActive", "IsEnabled" },
                DataTypes = new Dictionary<string, DataType>
                {
                    ["IsActive"] = DataType.Boolean,
                    ["IsEnabled"] = DataType.Boolean
                }
            };
            
            // Act
            var result = await ValidateCsvFile(testFile, schema);
            
            // Assert
            Assert.IsTrue(result.IsValid, "Boolean validation should pass");
            Assert.AreEqual(0, result.DataTypeErrors.Count, "No boolean type errors expected");
        }

        #endregion

        #region Record Count and Delta Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("RecordCount")]
        public async Task ValidateRecordCounts_AfterDiscoveryRun()
        {
            // Arrange
            var beforeFile = CreateTestUsersCsv(100);
            var beforeResult = await ValidateCsvFile(beforeFile, _schemas["Users"]);
            
            // Simulate discovery run adding records
            var afterFile = CreateTestUsersCsv(150);
            var afterResult = await ValidateCsvFile(afterFile, _schemas["Users"]);
            
            // Act
            var delta = afterResult.RecordCount - beforeResult.RecordCount;
            var deltaPercentage = (delta / (double)beforeResult.RecordCount) * 100;
            
            // Assert
            Assert.AreEqual(50, delta, "Should detect 50 new records");
            Assert.AreEqual(50.0, deltaPercentage, 0.1, "Should calculate 50% increase");
            
            // Log delta report
            Console.WriteLine($"Record Count Delta Report:");
            Console.WriteLine($"  Before: {beforeResult.RecordCount}");
            Console.WriteLine($"  After: {afterResult.RecordCount}");
            Console.WriteLine($"  Delta: +{delta} ({deltaPercentage:F1}%)");
            
            // Warn if unusual delta
            if (Math.Abs(deltaPercentage) > 100)
            {
                Console.WriteLine($"WARNING: Unusual delta detected (>100% change)");
            }
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("RecordIntegrity")]
        public async Task ValidateRecordIntegrity_NoDuplicateKeys()
        {
            // Arrange
            var testFile = CreateTestCsvWithDuplicates();
            
            // Act
            var duplicates = await FindDuplicateRecords(testFile, "UserPrincipalName");
            
            // Assert
            Assert.IsTrue(duplicates.Count > 0, "Should detect duplicate records in test file");
            
            // Test clean file
            var cleanFile = CreateTestUsersCsv(50);
            var cleanDuplicates = await FindDuplicateRecords(cleanFile, "UserPrincipalName");
            Assert.AreEqual(0, cleanDuplicates.Count, "Clean file should have no duplicates");
        }

        #endregion

        #region Cross-File Consistency Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("Consistency")]
        public async Task ValidateCrossFileConsistency_UserReferences()
        {
            // Arrange
            var usersFile = CreateTestUsersCsv(100);
            var mailboxesFile = CreateTestMailboxesCsv(80); // Some users without mailboxes
            var devicesFile = CreateTestDevicesCsv(120);
            
            // Act
            var userUpns = await ExtractColumn(usersFile, "UserPrincipalName");
            var mailboxUpns = await ExtractColumn(mailboxesFile, "UserPrincipalName");
            var deviceOwners = await ExtractColumn(devicesFile, "PrimaryUser");
            
            var orphanedMailboxes = mailboxUpns.Except(userUpns).ToList();
            var orphanedDevices = deviceOwners.Where(o => !string.IsNullOrEmpty(o))
                .Except(userUpns).ToList();
            
            // Assert
            Assert.AreEqual(0, orphanedMailboxes.Count, 
                $"Found {orphanedMailboxes.Count} orphaned mailboxes");
            
            // Log consistency report
            Console.WriteLine("Cross-File Consistency Report:");
            Console.WriteLine($"  Total Users: {userUpns.Count}");
            Console.WriteLine($"  Total Mailboxes: {mailboxUpns.Count}");
            Console.WriteLine($"  Users with Mailboxes: {mailboxUpns.Intersect(userUpns).Count()}");
            Console.WriteLine($"  Orphaned Mailboxes: {orphanedMailboxes.Count}");
            Console.WriteLine($"  Orphaned Device Owners: {orphanedDevices.Count}");
        }

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("Consistency")]
        public async Task ValidateCrossFileConsistency_GroupMembership()
        {
            // Arrange
            var usersFile = CreateTestUsersCsv(100);
            var groupsFile = CreateTestGroupsCsvWithMembers(50, 100);
            
            // Act
            var userSids = await ExtractColumn(usersFile, "SID");
            var groupMemberships = await ExtractGroupMembers(groupsFile);
            
            var allReferencedSids = groupMemberships.SelectMany(g => g.Value).Distinct().ToList();
            var invalidReferences = allReferencedSids.Except(userSids).ToList();
            
            // Assert
            Console.WriteLine($"Group Membership Validation:");
            Console.WriteLine($"  Total Groups: {groupMemberships.Count}");
            Console.WriteLine($"  Total Member References: {allReferencedSids.Count}");
            Console.WriteLine($"  Valid References: {allReferencedSids.Intersect(userSids).Count()}");
            Console.WriteLine($"  Invalid References: {invalidReferences.Count}");
            
            // Some invalid references are acceptable (external users, service accounts)
            Assert.IsTrue(invalidReferences.Count < allReferencedSids.Count * 0.2, 
                "More than 20% invalid references detected");
        }

        #endregion

        #region Performance Validation Tests

        [TestMethod]
        [TestCategory("T-030")]
        [TestCategory("Performance")]
        public async Task ValidateLargeCsvPerformance()
        {
            // Arrange
            var largeCsvFile = CreateLargeCsvFile(100000); // 100k records
            var schema = _schemas["Users"];
            
            // Act
            var sw = Stopwatch.StartNew();
            var result = await ValidateCsvFile(largeCsvFile, schema);
            sw.Stop();
            
            // Assert
            Assert.IsTrue(sw.ElapsedMilliseconds < 5000, 
                $"Large CSV validation should complete within 5 seconds, took {sw.ElapsedMilliseconds}ms");
            Assert.IsTrue(result.IsValid, "Large CSV should be valid");
            
            Console.WriteLine($"Performance Results for 100k records:");
            Console.WriteLine($"  Validation Time: {sw.ElapsedMilliseconds}ms");
            Console.WriteLine($"  Records/Second: {result.RecordCount / (sw.ElapsedMilliseconds / 1000.0):F0}");
            Console.WriteLine($"  Memory Used: {GC.GetTotalMemory(false) / (1024 * 1024)}MB");
        }

        #endregion

        #region Helper Methods

        private Dictionary<string, CsvSchema> InitializeSchemas()
        {
            return new Dictionary<string, CsvSchema>
            {
                ["Users"] = new CsvSchema
                {
                    Name = "Users",
                    MandatoryColumns = new[] { "DisplayName", "UserPrincipalName" },
                    OptionalColumns = new[] { "Mail", "Department", "JobTitle", "AccountEnabled", "SID", 
                        "SamAccountName", "ManagerDisplayName", "CreatedDateTime", "CompanyName" },
                    DataTypes = new Dictionary<string, DataType>
                    {
                        ["AccountEnabled"] = DataType.Boolean,
                        ["CreatedDateTime"] = DataType.DateTime
                    }
                },
                ["Groups"] = new CsvSchema
                {
                    Name = "Groups",
                    MandatoryColumns = new[] { "GroupName" },
                    OptionalColumns = new[] { "Description", "SID", "GroupType", "Members", "ManagedBy", 
                        "CreatedDateTime", "Mail", "SecurityEnabled" },
                    DataTypes = new Dictionary<string, DataType>
                    {
                        ["SecurityEnabled"] = DataType.Boolean,
                        ["CreatedDateTime"] = DataType.DateTime
                    },
                    ValidValues = new Dictionary<string, string[]>
                    {
                        ["GroupType"] = new[] { "Security", "Distribution", "Microsoft365", "MailEnabled" }
                    }
                },
                ["Devices"] = new CsvSchema
                {
                    Name = "Devices",
                    MandatoryColumns = new[] { "DeviceName" },
                    OptionalColumns = new[] { "OperatingSystem", "LastSeen", "PrimaryUser", "DeviceType", 
                        "ComplianceState", "SerialNumber", "Model", "Manufacturer" },
                    DataTypes = new Dictionary<string, DataType>
                    {
                        ["LastSeen"] = DataType.DateTime
                    }
                },
                ["Mailboxes"] = new CsvSchema
                {
                    Name = "Mailboxes",
                    MandatoryColumns = new[] { "UserPrincipalName" },
                    OptionalColumns = new[] { "MailboxSize", "ItemCount", "LastLogon", "MailboxType", 
                        "ArchiveStatus", "LitigationHoldStatus", "Database" },
                    DataTypes = new Dictionary<string, DataType>
                    {
                        ["MailboxSize"] = DataType.Integer,
                        ["ItemCount"] = DataType.Integer,
                        ["LastLogon"] = DataType.DateTime
                    }
                },
                ["Applications"] = new CsvSchema
                {
                    Name = "Applications",
                    MandatoryColumns = new[] { "AppId", "AppName" },
                    OptionalColumns = new[] { "Publisher", "Version", "InstallCount", "Category", 
                        "RequiresLicense", "LastUpdated" },
                    DataTypes = new Dictionary<string, DataType>
                    {
                        ["InstallCount"] = DataType.Integer,
                        ["RequiresLicense"] = DataType.Boolean,
                        ["LastUpdated"] = DataType.DateTime
                    }
                }
            };
        }

        private async Task<ValidationResult> ValidateCsvFile(string filePath, CsvSchema schema)
        {
            var result = new ValidationResult
            {
                FileName = Path.GetFileName(filePath),
                FilePath = filePath,
                Schema = schema,
                ValidationTime = DateTime.UtcNow
            };

            if (!File.Exists(filePath))
            {
                result.IsValid = false;
                result.Errors.Add($"File not found: {filePath}");
                return result;
            }

            using var reader = new StreamReader(filePath);
            var headerLine = await reader.ReadLineAsync();
            
            if (string.IsNullOrEmpty(headerLine))
            {
                result.IsValid = false;
                result.Errors.Add("File is empty or has no header");
                return result;
            }

            var headers = ParseCsvLine(headerLine);
            result.FoundColumns = headers.ToList();

            // Check mandatory columns
            foreach (var mandatoryCol in schema.MandatoryColumns)
            {
                if (!headers.Any(h => h.Equals(mandatoryCol, StringComparison.OrdinalIgnoreCase)))
                {
                    result.MissingColumns.Add(mandatoryCol);
                }
            }

            if (result.MissingColumns.Any())
            {
                result.IsValid = false;
                result.Errors.Add($"Missing mandatory columns: {string.Join(", ", result.MissingColumns)}");
            }

            // Validate records
            var lineNumber = 1;
            while (!reader.EndOfStream)
            {
                lineNumber++;
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                result.RecordCount++;
                var values = ParseCsvLine(line);
                
                if (values.Length != headers.Length)
                {
                    result.InvalidRecordCount++;
                    result.Warnings.Add($"Line {lineNumber}: Column count mismatch");
                    continue;
                }

                var isValidRecord = true;
                for (int i = 0; i < headers.Length; i++)
                {
                    var header = headers[i];
                    var value = values[i];

                    // Check for missing values in mandatory columns
                    if (schema.MandatoryColumns.Contains(header, StringComparer.OrdinalIgnoreCase) && 
                        string.IsNullOrWhiteSpace(value))
                    {
                        result.MissingValueCount++;
                        isValidRecord = false;
                    }

                    // Validate data types
                    if (schema.DataTypes != null && 
                        schema.DataTypes.TryGetValue(header, out var dataType))
                    {
                        if (!ValidateDataType(value, dataType))
                        {
                            result.DataTypeErrors.Add($"Line {lineNumber}, Column {header}: Invalid {dataType} value '{value}'");
                            isValidRecord = false;
                        }
                    }

                    // Validate against valid values list
                    if (schema.ValidValues != null && 
                        schema.ValidValues.TryGetValue(header, out var validValues))
                    {
                        if (!string.IsNullOrWhiteSpace(value) && 
                            !validValues.Contains(value, StringComparer.OrdinalIgnoreCase))
                        {
                            result.Warnings.Add($"Line {lineNumber}, Column {header}: Invalid value '{value}'");
                        }
                    }
                }

                if (isValidRecord)
                {
                    result.ValidRecordCount++;
                }
                else
                {
                    result.InvalidRecordCount++;
                }
            }

            result.IsValid = result.MissingColumns.Count == 0 && result.Errors.Count == 0;
            return result;
        }

        private async Task ValidateMultipleFiles(string[] paths, CsvSchema schema, string fileType)
        {
            var validationResults = new List<ValidationResult>();
            
            foreach (var path in paths.Where(File.Exists))
            {
                var result = await ValidateCsvFile(path, schema);
                validationResults.Add(result);
            }

            if (!validationResults.Any())
            {
                var testFile = fileType switch
                {
                    "Devices" => CreateTestDevicesCsv(50),
                    "Mailboxes" => CreateTestMailboxesCsv(50),
                    _ => CreateTestUsersCsv(50)
                };
                var result = await ValidateCsvFile(testFile, schema);
                validationResults.Add(result);
            }

            foreach (var result in validationResults)
            {
                Assert.IsTrue(result.IsValid, $"{fileType} CSV validation failed: {string.Join(", ", result.Errors)}");
                Console.WriteLine($"Validated {result.FileName}: {result.RecordCount} records");
            }
        }

        private string[] ParseCsvLine(string line)
        {
            var result = new List<string>();
            var inQuotes = false;
            var currentField = new StringBuilder();

            for (int i = 0; i < line.Length; i++)
            {
                var c = line[i];

                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentField.Append('"');
                        i++; // Skip next quote
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField.ToString());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }

            result.Add(currentField.ToString());
            return result.ToArray();
        }

        private bool ValidateDataType(string value, DataType dataType)
        {
            if (string.IsNullOrWhiteSpace(value))
                return true; // Empty values are allowed

            return dataType switch
            {
                DataType.Integer => int.TryParse(value, out _),
                DataType.Decimal => decimal.TryParse(value, out _),
                DataType.Boolean => value.Equals("TRUE", StringComparison.OrdinalIgnoreCase) ||
                                   value.Equals("FALSE", StringComparison.OrdinalIgnoreCase) ||
                                   value.Equals("1") || value.Equals("0"),
                DataType.DateTime => DateTime.TryParse(value, out _),
                DataType.Email => value.Contains("@") && value.Contains("."),
                _ => true
            };
        }

        private async Task<List<string>> ExtractColumn(string filePath, string columnName)
        {
            var values = new List<string>();
            using var reader = new StreamReader(filePath);
            var headerLine = await reader.ReadLineAsync();
            var headers = ParseCsvLine(headerLine);
            var columnIndex = Array.FindIndex(headers, h => h.Equals(columnName, StringComparison.OrdinalIgnoreCase));

            if (columnIndex < 0) return values;

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                var fields = ParseCsvLine(line);
                if (fields.Length > columnIndex)
                {
                    values.Add(fields[columnIndex]);
                }
            }

            return values;
        }

        private async Task<Dictionary<string, List<string>>> ExtractGroupMembers(string filePath)
        {
            var groupMembers = new Dictionary<string, List<string>>();
            using var reader = new StreamReader(filePath);
            var headerLine = await reader.ReadLineAsync();
            var headers = ParseCsvLine(headerLine);
            var nameIndex = Array.FindIndex(headers, h => h.Equals("GroupName", StringComparison.OrdinalIgnoreCase));
            var membersIndex = Array.FindIndex(headers, h => h.Equals("Members", StringComparison.OrdinalIgnoreCase));

            if (nameIndex < 0 || membersIndex < 0) return groupMembers;

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                var fields = ParseCsvLine(line);
                if (fields.Length > Math.Max(nameIndex, membersIndex))
                {
                    var groupName = fields[nameIndex];
                    var membersStr = fields[membersIndex];
                    var members = membersStr.Split(';', StringSplitOptions.RemoveEmptyEntries)
                        .Select(m => m.Trim()).ToList();
                    groupMembers[groupName] = members;
                }
            }

            return groupMembers;
        }

        private async Task<List<string>> FindDuplicateRecords(string filePath, string keyColumn)
        {
            var values = await ExtractColumn(filePath, keyColumn);
            return values.GroupBy(v => v)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();
        }

        private string CreateTestUsersCsv(int count = 100)
        {
            var filePath = Path.Combine(_testDataPath, $"Users_{Guid.NewGuid():N}.csv");
            var csv = "DisplayName,UserPrincipalName,Mail,Department,AccountEnabled,SID,SamAccountName\n";
            
            for (int i = 0; i < count; i++)
            {
                csv += $"User {i},user{i}@test.com,user{i}@test.com,Dept{i % 10},TRUE,S-1-5-21-{i},user{i}\n";
            }
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestGroupsCsv()
        {
            var filePath = Path.Combine(_testDataPath, $"Groups_{Guid.NewGuid():N}.csv");
            var csv = "GroupName,Description,SID,GroupType,Members\n";
            
            for (int i = 0; i < 50; i++)
            {
                var groupType = i % 3 == 0 ? "Security" : i % 3 == 1 ? "Distribution" : "Microsoft365";
                csv += $"Group {i},Test Group {i},S-1-5-32-{i},{groupType},\"S-1-5-21-{i};S-1-5-21-{i+1}\"\n";
            }
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestGroupsCsvWithMembers(int groupCount, int userCount)
        {
            var filePath = Path.Combine(_testDataPath, $"GroupsWithMembers_{Guid.NewGuid():N}.csv");
            var csv = "GroupName,Description,SID,GroupType,Members\n";
            
            for (int i = 0; i < groupCount; i++)
            {
                var memberCount = Random.Shared.Next(5, 20);
                var members = new List<string>();
                for (int m = 0; m < memberCount; m++)
                {
                    members.Add($"S-1-5-21-{Random.Shared.Next(0, userCount)}");
                }
                csv += $"Group {i},Test Group {i},S-1-5-32-{i},Security,\"{string.Join(";", members)}\"\n";
            }
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestDevicesCsv(int count)
        {
            var filePath = Path.Combine(_testDataPath, $"Devices_{Guid.NewGuid():N}.csv");
            var csv = "DeviceName,OperatingSystem,LastSeen,PrimaryUser\n";
            
            for (int i = 0; i < count; i++)
            {
                var userIndex = i % 100;
                csv += $"DEVICE{i:D4},Windows 10,2024-01-01,user{userIndex}@test.com\n";
            }
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestMailboxesCsv(int count)
        {
            var filePath = Path.Combine(_testDataPath, $"Mailboxes_{Guid.NewGuid():N}.csv");
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon\n";
            
            for (int i = 0; i < count; i++)
            {
                csv += $"user{i}@test.com,{Random.Shared.Next(100, 50000)},{Random.Shared.Next(100, 10000)},2024-01-01\n";
            }
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestMailboxesCsvWithDataTypes()
        {
            var filePath = Path.Combine(_testDataPath, $"MailboxesTyped_{Guid.NewGuid():N}.csv");
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon\n";
            csv += "user1@test.com,1000,5000,2024-01-01\n";
            csv += "user2@test.com,2000,10000,2024-01-02\n";
            csv += "user3@test.com,3000,15000,2024-01-03\n";
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateInvalidDataTypeCsv()
        {
            var filePath = Path.Combine(_testDataPath, $"InvalidTypes_{Guid.NewGuid():N}.csv");
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon\n";
            csv += "user1@test.com,NotANumber,5000,2024-01-01\n";
            csv += "user2@test.com,2000,AlsoNotANumber,InvalidDate\n";
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestCsvWithDates()
        {
            var filePath = Path.Combine(_testDataPath, $"TestDates_{Guid.NewGuid():N}.csv");
            var csv = "Id,CreatedDate,ModifiedDate,LastAccessDate\n";
            csv += "1,2024-01-01,2024-01-15,2024-01-20\n";
            csv += "2,2024-02-01,2024-02-15,2024-02-20\n";
            csv += "3,2024-03-01,2024-03-15,\n"; // Optional date field empty
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestCsvWithBooleans()
        {
            var filePath = Path.Combine(_testDataPath, $"TestBooleans_{Guid.NewGuid():N}.csv");
            var csv = "Id,IsActive,IsEnabled\n";
            csv += "1,TRUE,FALSE\n";
            csv += "2,true,false\n";
            csv += "3,1,0\n";
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateTestCsvWithDuplicates()
        {
            var filePath = Path.Combine(_testDataPath, $"Duplicates_{Guid.NewGuid():N}.csv");
            var csv = "DisplayName,UserPrincipalName,Mail\n";
            csv += "User 1,user1@test.com,user1@test.com\n";
            csv += "User 2,user2@test.com,user2@test.com\n";
            csv += "User 3,user1@test.com,user1@test.com\n"; // Duplicate UPN
            csv += "User 4,user3@test.com,user3@test.com\n";
            
            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateLargeCsvFile(int recordCount)
        {
            var filePath = Path.Combine(_testDataPath, $"LargeFile_{Guid.NewGuid():N}.csv");
            using var writer = new StreamWriter(filePath);
            
            writer.WriteLine("DisplayName,UserPrincipalName,Mail,Department,AccountEnabled,SID,SamAccountName");
            
            for (int i = 0; i < recordCount; i++)
            {
                writer.WriteLine($"User {i},user{i}@test.com,user{i}@test.com,Dept{i % 100},TRUE,S-1-5-21-{i},user{i}");
            }
            
            return filePath;
        }

        #endregion

        #region Helper Classes

        private class CsvSchema
        {
            public string Name { get; set; }
            public string[] MandatoryColumns { get; set; }
            public string[] OptionalColumns { get; set; }
            public Dictionary<string, DataType> DataTypes { get; set; }
            public Dictionary<string, string[]> ValidValues { get; set; }
        }

        private enum DataType
        {
            String,
            Integer,
            Decimal,
            Boolean,
            DateTime,
            Email
        }

        private class ValidationResult
        {
            public string FileName { get; set; }
            public string FilePath { get; set; }
            public CsvSchema Schema { get; set; }
            public DateTime ValidationTime { get; set; }
            public bool IsValid { get; set; } = true;
            public List<string> Errors { get; set; } = new();
            public List<string> Warnings { get; set; } = new();
            public List<string> MissingColumns { get; set; } = new();
            public List<string> FoundColumns { get; set; } = new();
            public List<string> DataTypeErrors { get; set; } = new();
            public int RecordCount { get; set; }
            public int ValidRecordCount { get; set; }
            public int InvalidRecordCount { get; set; }
            public int MissingValueCount { get; set; }
        }

        #endregion
    }
}