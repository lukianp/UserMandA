using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MigrationTestSuite.Unit.Services
{
    /// <summary>
    /// CSV Data Validation Tests for T-031 Pre-Migration Checks
    /// Validates CSV data integrity, mandatory columns, and data types
    /// </summary>
    [TestClass]
    public class CsvDataValidationTests
    {
        private string _testDataPath;
        private readonly string[] _usersMandatoryColumns = 
        {
            "Sid", "DisplayName", "UPN", "Enabled", "Sam", "Department", "Title"
        };
        
        private readonly string[] _mailboxesMandatoryColumns = 
        {
            "UPN", "SizeMB", "Type", "PrimarySMTP", "Aliases"
        };
        
        private readonly string[] _fileSharesMandatoryColumns = 
        {
            "Path", "Name", "SizeGB", "Owner", "Permissions"
        };
        
        private readonly string[] _databasesMandatoryColumns = 
        {
            "Server", "Instance", "Database", "SizeGB", "Owner"
        };

        [TestInitialize]
        public void Setup()
        {
            _testDataPath = Path.Combine(Path.GetTempPath(), $"CsvTestData_{Guid.NewGuid()}");
            Directory.CreateDirectory(_testDataPath);
        }

        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
        }

        #region Users CSV Validation

        [TestMethod]
        public async Task ValidateUsersCsv_ValidData_ShouldPass()
        {
            // Arrange
            var csvContent = CreateValidUsersCsv();
            var csvFile = Path.Combine(_testDataPath, "Users.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeTrue();
            validationResult.MissingColumns.Should().BeEmpty();
            validationResult.RecordCount.Should().Be(3);
            validationResult.DataTypeErrors.Should().BeEmpty();
        }

        [TestMethod]
        public async Task ValidateUsersCsv_MissingMandatoryColumns_ShouldFail()
        {
            // Arrange - Missing "Enabled" and "Department" columns
            var csvContent = "Sid,DisplayName,UPN,Sam,Title\n" +
                           "S-1-5-21-1,John Doe,john.doe@contoso.com,johndoe,Manager\n" +
                           "S-1-5-21-2,Jane Smith,jane.smith@contoso.com,jsmith,Developer";
            
            var csvFile = Path.Combine(_testDataPath, "UsersIncomplete.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeFalse();
            validationResult.MissingColumns.Should().Contain("Enabled");
            validationResult.MissingColumns.Should().Contain("Department");
            validationResult.MissingColumns.Should().HaveCount(2);
        }

        [TestMethod]
        public async Task ValidateUsersCsv_InvalidDataTypes_ShouldDetectErrors()
        {
            // Arrange - Invalid boolean value for "Enabled" column
            var csvContent = "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                           "S-1-5-21-1,John Doe,john.doe@contoso.com,yes,johndoe,IT,Manager\n" +
                           "S-1-5-21-2,Jane Smith,jane.smith@contoso.com,maybe,jsmith,HR,Developer\n" +
                           "S-1-5-21-3,Bob Johnson,bob.johnson@contoso.com,true,bjohnson,Finance,Analyst";
            
            var csvFile = Path.Combine(_testDataPath, "UsersInvalidTypes.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeFalse();
            validationResult.DataTypeErrors.Should().HaveCount(2); // "yes" and "maybe" are invalid booleans
            validationResult.DataTypeErrors[0].Should().Contain("Row 2"); // "yes"
            validationResult.DataTypeErrors[1].Should().Contain("Row 3"); // "maybe"
        }

        [TestMethod]
        public async Task ValidateUsersCsv_EmptyFile_ShouldFail()
        {
            // Arrange
            var csvFile = Path.Combine(_testDataPath, "Empty.csv");
            await File.WriteAllTextAsync(csvFile, string.Empty);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeFalse();
            validationResult.RecordCount.Should().Be(0);
            validationResult.MissingColumns.Should().HaveCount(_usersMandatoryColumns.Length);
        }

        [TestMethod]
        public async Task ValidateUsersCsv_HeaderOnlyFile_ShouldFail()
        {
            // Arrange
            var csvContent = string.Join(",", _usersMandatoryColumns);
            var csvFile = Path.Combine(_testDataPath, "HeaderOnly.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeFalse();
            validationResult.RecordCount.Should().Be(0);
            validationResult.MissingColumns.Should().BeEmpty(); // Headers are present
        }

        [TestMethod]
        public async Task ValidateUsersCsv_DuplicateSids_ShouldDetectDuplicates()
        {
            // Arrange
            var csvContent = CreateUsersCsvWithDuplicates();
            var csvFile = Path.Combine(_testDataPath, "UsersDuplicates.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.DuplicateKeys.Should().NotBeEmpty();
            validationResult.DuplicateKeys.Should().Contain("S-1-5-21-1");
        }

        #endregion

        #region Mailboxes CSV Validation

        [TestMethod]
        public async Task ValidateMailboxesCsv_ValidData_ShouldPass()
        {
            // Arrange
            var csvContent = CreateValidMailboxesCsv();
            var csvFile = Path.Combine(_testDataPath, "Mailboxes.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _mailboxesMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeTrue();
            validationResult.MissingColumns.Should().BeEmpty();
            validationResult.RecordCount.Should().Be(3);
        }

        [TestMethod]
        public async Task ValidateMailboxesCsv_InvalidSizeValues_ShouldDetectErrors()
        {
            // Arrange - Invalid numeric values for "SizeMB" column
            var csvContent = "UPN,SizeMB,Type,PrimarySMTP,Aliases\n" +
                           "user1@contoso.com,not-a-number,UserMailbox,user1@contoso.com,alias1@contoso.com\n" +
                           "user2@contoso.com,-500,UserMailbox,user2@contoso.com,alias2@contoso.com\n" +
                           "user3@contoso.com,50000,UserMailbox,user3@contoso.com,alias3@contoso.com";
            
            var csvFile = Path.Combine(_testDataPath, "MailboxesInvalidSize.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _mailboxesMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeFalse();
            validationResult.DataTypeErrors.Should().HaveCount(2); // "not-a-number" and negative value
        }

        [TestMethod]
        public async Task ValidateMailboxesCsv_UnsupportedMailboxTypes_ShouldDetectInvalidTypes()
        {
            // Arrange
            var csvContent = "UPN,SizeMB,Type,PrimarySMTP,Aliases\n" +
                           "user1@contoso.com,25000,UserMailbox,user1@contoso.com,alias1@contoso.com\n" +
                           "user2@contoso.com,30000,InvalidType,user2@contoso.com,alias2@contoso.com\n" +
                           "user3@contoso.com,35000,AnotherInvalidType,user3@contoso.com,alias3@contoso.com";
            
            var csvFile = Path.Combine(_testDataPath, "MailboxesInvalidTypes.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _mailboxesMandatoryColumns);

            // Assert
            validationResult.BusinessRuleViolations.Should().HaveCount(2);
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("InvalidType"));
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("AnotherInvalidType"));
        }

        #endregion

        #region File Shares CSV Validation

        [TestMethod]
        public async Task ValidateFileSharesCsv_ValidData_ShouldPass()
        {
            // Arrange
            var csvContent = CreateValidFileSharesCsv();
            var csvFile = Path.Combine(_testDataPath, "FileShares.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _fileSharesMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeTrue();
            validationResult.MissingColumns.Should().BeEmpty();
            validationResult.RecordCount.Should().Be(3);
        }

        [TestMethod]
        public async Task ValidateFileSharesCsv_InvalidPaths_ShouldDetectPathIssues()
        {
            // Arrange - Paths with invalid characters and excessive length
            var longPath = new string('x', 300); // Path too long
            var csvContent = "Path,Name,SizeGB,Owner,Permissions\n" +
                           $@"C:\Valid\Path,ValidShare,100,DOMAIN\Admin,FullControl" + "\n" +
                           $@"C:\Invalid|Path,InvalidCharShare,50,DOMAIN\Admin,FullControl" + "\n" +
                           $@"C:\{longPath},LongPathShare,75,DOMAIN\Admin,FullControl";
            
            var csvFile = Path.Combine(_testDataPath, "FileSharesInvalidPaths.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _fileSharesMandatoryColumns);

            // Assert
            validationResult.BusinessRuleViolations.Should().HaveCount(2);
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("invalid characters"));
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("exceeds maximum length"));
        }

        #endregion

        #region Databases CSV Validation

        [TestMethod]
        public async Task ValidateDatabasesCsv_ValidData_ShouldPass()
        {
            // Arrange
            var csvContent = CreateValidDatabasesCsv();
            var csvFile = Path.Combine(_testDataPath, "Databases.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _databasesMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeTrue();
            validationResult.MissingColumns.Should().BeEmpty();
            validationResult.RecordCount.Should().Be(3);
        }

        [TestMethod]
        public async Task ValidateDatabasesCsv_InvalidDatabaseNames_ShouldDetectNamingIssues()
        {
            // Arrange - Database names with invalid characters
            var csvContent = "Server,Instance,Database,SizeGB,Owner\n" +
                           "SQL01,DEFAULT,ValidDB,50,sa\n" +
                           "SQL02,DEFAULT,Invalid<DB>,75,sa\n" +
                           "SQL03,DEFAULT,Another|Invalid|DB,100,sa";
            
            var csvFile = Path.Combine(_testDataPath, "DatabasesInvalidNames.csv");
            await File.WriteAllTextAsync(csvFile, csvContent);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _databasesMandatoryColumns);

            // Assert
            validationResult.BusinessRuleViolations.Should().HaveCount(2);
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("Invalid<DB>"));
            validationResult.BusinessRuleViolations.Should().Contain(v => v.Contains("Another|Invalid|DB"));
        }

        #endregion

        #region Record Count Delta Tests

        [TestMethod]
        public async Task ValidateRecordCountDelta_CompareVersions_ShouldDetectChanges()
        {
            // Arrange - Create initial CSV
            var initialCsvContent = CreateValidUsersCsv();
            var initialCsvFile = Path.Combine(_testDataPath, "Users_V1.csv");
            await File.WriteAllTextAsync(initialCsvFile, initialCsvContent);

            // Create updated CSV with additional records
            var updatedCsvContent = initialCsvContent + "\n" +
                                  "S-1-5-21-4,New User,new.user@contoso.com,true,newuser,IT,Specialist";
            var updatedCsvFile = Path.Combine(_testDataPath, "Users_V2.csv");
            await File.WriteAllTextAsync(updatedCsvFile, updatedCsvContent);

            // Act
            var initialResult = await ValidateCsvFile(initialCsvFile, _usersMandatoryColumns);
            var updatedResult = await ValidateCsvFile(updatedCsvFile, _usersMandatoryColumns);
            var deltaCount = updatedResult.RecordCount - initialResult.RecordCount;

            // Assert
            initialResult.RecordCount.Should().Be(3);
            updatedResult.RecordCount.Should().Be(4);
            deltaCount.Should().Be(1);
        }

        [TestMethod]
        public async Task ValidateRecordCountDelta_RemovedRecords_ShouldDetectDecrease()
        {
            // Arrange
            var fullCsvContent = CreateValidUsersCsv();
            var fullCsvFile = Path.Combine(_testDataPath, "Users_Full.csv");
            await File.WriteAllTextAsync(fullCsvFile, fullCsvContent);

            // Create reduced CSV
            var reducedCsvContent = "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                                  "S-1-5-21-1,John Doe,john.doe@contoso.com,true,johndoe,IT,Manager";
            var reducedCsvFile = Path.Combine(_testDataPath, "Users_Reduced.csv");
            await File.WriteAllTextAsync(reducedCsvFile, reducedCsvContent);

            // Act
            var fullResult = await ValidateCsvFile(fullCsvFile, _usersMandatoryColumns);
            var reducedResult = await ValidateCsvFile(reducedCsvFile, _usersMandatoryColumns);
            var deltaCount = reducedResult.RecordCount - fullResult.RecordCount;

            // Assert
            fullResult.RecordCount.Should().Be(3);
            reducedResult.RecordCount.Should().Be(1);
            deltaCount.Should().Be(-2);
        }

        #endregion

        #region Unicode and Special Characters Tests

        [TestMethod]
        public async Task ValidateCsv_UnicodeCharacters_ShouldHandleCorrectly()
        {
            // Arrange - CSV with Unicode characters
            var csvContent = "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                           "S-1-5-21-1,José García,jose.garcia@contoso.com,true,jgarcia,Administración,Gerente\n" +
                           "S-1-5-21-2,张伟,zhang.wei@contoso.com,true,zwei,工程部,工程师\n" +
                           "S-1-5-21-3,Müller Schmidt,muller.schmidt@contoso.com,true,mschmidt,Entwicklung,Entwickler";
            
            var csvFile = Path.Combine(_testDataPath, "UsersUnicode.csv");
            await File.WriteAllTextAsync(csvFile, csvContent, Encoding.UTF8);

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.IsValid.Should().BeTrue();
            validationResult.RecordCount.Should().Be(3);
            validationResult.UnicodeIssues.Should().BeEmpty();
        }

        [TestMethod]
        public async Task ValidateCsv_InvalidEncoding_ShouldDetectEncodingIssues()
        {
            // Arrange - Create file with mixed encoding issues
            var csvContent = "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                           "S-1-5-21-1,Test\xFF\xFEUser,test@contoso.com,true,testuser,IT,Manager";
            
            var csvFile = Path.Combine(_testDataPath, "UsersInvalidEncoding.csv");
            await File.WriteAllBytesAsync(csvFile, Encoding.ASCII.GetBytes(csvContent));

            // Act
            var validationResult = await ValidateCsvFile(csvFile, _usersMandatoryColumns);

            // Assert
            validationResult.EncodingIssues.Should().NotBeEmpty();
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task ValidateLargeCsv_Performance_ShouldCompleteWithinTimeLimit()
        {
            // Arrange - Generate large CSV file (10K records)
            var largeCsvContent = GenerateLargeUsersCsv(10000);
            var largeCsvFile = Path.Combine(_testDataPath, "LargeUsers.csv");
            await File.WriteAllTextAsync(largeCsvFile, largeCsvContent);

            // Act
            var startTime = DateTime.UtcNow;
            var validationResult = await ValidateCsvFile(largeCsvFile, _usersMandatoryColumns);
            var endTime = DateTime.UtcNow;
            var duration = endTime - startTime;

            // Assert
            duration.Should().BeLessThan(TimeSpan.FromSeconds(30), "Large CSV validation should complete within 30 seconds");
            validationResult.RecordCount.Should().Be(10000);
        }

        #endregion

        #region Helper Methods

        private string CreateValidUsersCsv()
        {
            return "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                   "S-1-5-21-1,John Doe,john.doe@contoso.com,true,johndoe,IT,Manager\n" +
                   "S-1-5-21-2,Jane Smith,jane.smith@contoso.com,true,jsmith,HR,Developer\n" +
                   "S-1-5-21-3,Bob Johnson,bob.johnson@contoso.com,false,bjohnson,Finance,Analyst";
        }

        private string CreateUsersCsvWithDuplicates()
        {
            return "Sid,DisplayName,UPN,Enabled,Sam,Department,Title\n" +
                   "S-1-5-21-1,John Doe,john.doe@contoso.com,true,johndoe,IT,Manager\n" +
                   "S-1-5-21-2,Jane Smith,jane.smith@contoso.com,true,jsmith,HR,Developer\n" +
                   "S-1-5-21-1,John Doe Duplicate,john.doe2@contoso.com,true,johndoe2,IT,Manager";
        }

        private string CreateValidMailboxesCsv()
        {
            return "UPN,SizeMB,Type,PrimarySMTP,Aliases\n" +
                   "user1@contoso.com,25000,UserMailbox,user1@contoso.com,alias1@contoso.com\n" +
                   "user2@contoso.com,30000,SharedMailbox,user2@contoso.com,alias2@contoso.com\n" +
                   "room1@contoso.com,5000,RoomMailbox,room1@contoso.com,conference@contoso.com";
        }

        private string CreateValidFileSharesCsv()
        {
            return "Path,Name,SizeGB,Owner,Permissions\n" +
                   @"C:\Shares\Finance,FinanceShare,100,DOMAIN\FinanceAdmin,FullControl" + "\n" +
                   @"C:\Shares\HR,HRShare,75,DOMAIN\HRAdmin,FullControl" + "\n" +
                   @"C:\Shares\Public,PublicShare,50,DOMAIN\Everyone,ReadOnly";
        }

        private string CreateValidDatabasesCsv()
        {
            return "Server,Instance,Database,SizeGB,Owner\n" +
                   "SQL01,DEFAULT,ProductionDB,500,sa\n" +
                   "SQL02,NAMED01,TestDB,100,testuser\n" +
                   "SQL03,DEFAULT,ArchiveDB,1000,archiveuser";
        }

        private string GenerateLargeUsersCsv(int recordCount)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Sid,DisplayName,UPN,Enabled,Sam,Department,Title");
            
            for (int i = 1; i <= recordCount; i++)
            {
                sb.AppendLine($"S-1-5-21-{i},TestUser{i:D6},testuser{i:D6}@contoso.com,{(i % 2 == 0).ToString().ToLower()},testuser{i:D6},IT,User{i:D6}");
            }
            
            return sb.ToString();
        }

        private async Task<CsvValidationResult> ValidateCsvFile(string filePath, string[] mandatoryColumns)
        {
            var result = new CsvValidationResult();
            
            try
            {
                if (!File.Exists(filePath))
                {
                    result.IsValid = false;
                    result.Errors.Add($"File not found: {filePath}");
                    return result;
                }

                var lines = await File.ReadAllLinesAsync(filePath);
                
                if (lines.Length == 0)
                {
                    result.IsValid = false;
                    result.RecordCount = 0;
                    result.MissingColumns.AddRange(mandatoryColumns);
                    return result;
                }

                // Validate headers
                var headers = lines[0].Split(',').Select(h => h.Trim()).ToArray();
                var missingColumns = mandatoryColumns.Where(col => !headers.Contains(col)).ToList();
                result.MissingColumns.AddRange(missingColumns);

                // Count records (excluding header)
                result.RecordCount = lines.Length - 1;

                if (result.RecordCount == 0)
                {
                    result.IsValid = false;
                    return result;
                }

                // Validate data types and business rules
                await ValidateDataTypes(filePath, headers, result);
                await ValidateBusinessRules(filePath, headers, result);

                result.IsValid = result.MissingColumns.Count == 0 && 
                                result.DataTypeErrors.Count == 0 && 
                                result.BusinessRuleViolations.Count == 0 &&
                                result.EncodingIssues.Count == 0;
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add($"Validation error: {ex.Message}");
            }

            return result;
        }

        private async Task ValidateDataTypes(string filePath, string[] headers, CsvValidationResult result)
        {
            var lines = await File.ReadAllLinesAsync(filePath);
            
            for (int i = 1; i < lines.Length; i++) // Skip header
            {
                var values = lines[i].Split(',');
                var rowNumber = i + 1;

                for (int j = 0; j < headers.Length && j < values.Length; j++)
                {
                    var columnName = headers[j];
                    var value = values[j].Trim();

                    // Validate specific data types
                    if (columnName.Equals("Enabled", StringComparison.OrdinalIgnoreCase))
                    {
                        if (!bool.TryParse(value, out _) && !string.IsNullOrEmpty(value))
                        {
                            result.DataTypeErrors.Add($"Row {rowNumber}, Column '{columnName}': Invalid boolean value '{value}'");
                        }
                    }
                    else if (columnName.EndsWith("MB", StringComparison.OrdinalIgnoreCase) ||
                             columnName.EndsWith("GB", StringComparison.OrdinalIgnoreCase))
                    {
                        if (!int.TryParse(value, out var numericValue) && !string.IsNullOrEmpty(value))
                        {
                            result.DataTypeErrors.Add($"Row {rowNumber}, Column '{columnName}': Invalid numeric value '{value}'");
                        }
                        else if (numericValue < 0)
                        {
                            result.DataTypeErrors.Add($"Row {rowNumber}, Column '{columnName}': Negative value not allowed '{value}'");
                        }
                    }
                }
            }
        }

        private async Task ValidateBusinessRules(string filePath, string[] headers, CsvValidationResult result)
        {
            var lines = await File.ReadAllLinesAsync(filePath);
            var sidIndex = Array.IndexOf(headers, "Sid");
            var upnIndex = Array.IndexOf(headers, "UPN");
            var pathIndex = Array.IndexOf(headers, "Path");
            var typeIndex = Array.IndexOf(headers, "Type");
            var databaseIndex = Array.IndexOf(headers, "Database");

            var seenSids = new HashSet<string>();
            var supportedMailboxTypes = new[] { "UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox" };
            var invalidPathChars = Path.GetInvalidPathChars();

            for (int i = 1; i < lines.Length; i++)
            {
                var values = lines[i].Split(',');
                var rowNumber = i + 1;

                // Check for duplicate SIDs
                if (sidIndex >= 0 && sidIndex < values.Length)
                {
                    var sid = values[sidIndex].Trim();
                    if (!string.IsNullOrEmpty(sid))
                    {
                        if (seenSids.Contains(sid))
                        {
                            result.DuplicateKeys.Add(sid);
                        }
                        else
                        {
                            seenSids.Add(sid);
                        }
                    }
                }

                // Validate mailbox types
                if (typeIndex >= 0 && typeIndex < values.Length)
                {
                    var type = values[typeIndex].Trim();
                    if (!string.IsNullOrEmpty(type) && !supportedMailboxTypes.Contains(type))
                    {
                        result.BusinessRuleViolations.Add($"Row {rowNumber}: Unsupported mailbox type '{type}'");
                    }
                }

                // Validate file paths
                if (pathIndex >= 0 && pathIndex < values.Length)
                {
                    var path = values[pathIndex].Trim();
                    if (!string.IsNullOrEmpty(path))
                    {
                        if (path.Length > 260)
                        {
                            result.BusinessRuleViolations.Add($"Row {rowNumber}: Path exceeds maximum length (260 characters)");
                        }
                        if (path.IndexOfAny(invalidPathChars) >= 0)
                        {
                            result.BusinessRuleViolations.Add($"Row {rowNumber}: Path contains invalid characters");
                        }
                    }
                }

                // Validate database names
                if (databaseIndex >= 0 && databaseIndex < values.Length)
                {
                    var database = values[databaseIndex].Trim();
                    if (!string.IsNullOrEmpty(database))
                    {
                        var invalidDbChars = new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' };
                        if (database.IndexOfAny(invalidDbChars) >= 0)
                        {
                            result.BusinessRuleViolations.Add($"Row {rowNumber}: Database name '{database}' contains invalid characters");
                        }
                    }
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// CSV Validation Result containing all validation outcomes
    /// </summary>
    public class CsvValidationResult
    {
        public bool IsValid { get; set; } = true;
        public int RecordCount { get; set; }
        public List<string> MissingColumns { get; set; } = new List<string>();
        public List<string> DataTypeErrors { get; set; } = new List<string>();
        public List<string> BusinessRuleViolations { get; set; } = new List<string>();
        public List<string> DuplicateKeys { get; set; } = new List<string>();
        public List<string> UnicodeIssues { get; set; } = new List<string>();
        public List<string> EncodingIssues { get; set; } = new List<string>();
        public List<string> Errors { get; set; } = new List<string>();
    }
}