using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Production CSV data validation service converted from test code
    /// Provides comprehensive CSV validation, schema checking, and data integrity validation
    /// </summary>
    public class CsvDataValidationService
    {
        private readonly ILogger<CsvDataValidationService> _logger;
        private readonly Dictionary<string, CsvSchema> _schemas;

        public CsvDataValidationService(ILogger<CsvDataValidationService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _schemas = InitializeSchemas();
        }

        /// <summary>
        /// Validates a CSV file against its schema
        /// </summary>
        /// <param name="filePath">Path to the CSV file</param>
        /// <param name="schemaName">Name of the schema to validate against</param>
        /// <returns>Validation result with detailed information</returns>
        public async Task<DataValidationResult> ValidateCsvFileAsync(string filePath, string schemaName)
        {
            if (!File.Exists(filePath))
            {
                return new DataValidationResult
                {
                    FileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    IsValid = false,
                    Errors = { $"File not found: {filePath}" }
                };
            }

            if (!_schemas.TryGetValue(schemaName, out var schema))
            {
                return new DataValidationResult
                {
                    FileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    IsValid = false,
                    Errors = { $"Unknown schema: {schemaName}" }
                };
            }

            try
            {
                return await ValidateCsvFile(filePath, schema);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating CSV file {FilePath}", filePath);
                return new DataValidationResult
                {
                    FileName = Path.GetFileName(filePath),
                    FilePath = filePath,
                    IsValid = false,
                    Errors = { $"Validation error: {ex.Message}" }
                };
            }
        }

        /// <summary>
        /// Validates multiple CSV files of the same type
        /// </summary>
        /// <param name="filePaths">Array of file paths to validate</param>
        /// <param name="schemaName">Name of the schema to validate against</param>
        /// <returns>List of validation results</returns>
        public async Task<List<DataValidationResult>> ValidateMultipleFilesAsync(string[] filePaths, string schemaName)
        {
            var results = new List<DataValidationResult>();

            if (!_schemas.TryGetValue(schemaName, out var schema))
            {
                var errorResult = new DataValidationResult
                {
                    IsValid = false,
                    Errors = { $"Unknown schema: {schemaName}" }
                };
                return filePaths.Select(path => errorResult).ToList();
            }

            foreach (var filePath in filePaths.Where(File.Exists))
            {
                var result = await ValidateCsvFile(filePath, schema);
                results.Add(result);
            }

            return results;
        }

        /// <summary>
        /// Performs cross-file consistency validation
        /// </summary>
        /// <param name="usersFile">Path to users CSV file</param>
        /// <param name="groupsFile">Path to groups CSV file</param>
        /// <param name="devicesFile">Path to devices CSV file</param>
        /// <returns>Consistency validation results</returns>
        public async Task<DataConsistencyResult> ValidateCrossFileConsistencyAsync(string usersFile, string groupsFile, string devicesFile)
        {
            var result = new DataConsistencyResult();

            try
            {
                var users = await ExtractColumn(usersFile, "UserPrincipalName");
                var groups = await ExtractColumn(groupsFile, "Members");
                var devices = await ExtractColumn(devicesFile, "PrimaryUser");

                // Find orphaned references
                var allGroupMembers = groups.SelectMany(g => g.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    .Select(m => m.Trim()).Distinct().ToList();
                var allDeviceOwners = devices.Where(o => !string.IsNullOrEmpty(o)).Distinct().ToList();

                result.OrphanedGroupMembers = allGroupMembers.Except(users).ToList();
                result.OrphanedDeviceOwners = allDeviceOwners.Except(users).ToList();

                result.TotalUsers = users.Count;
                result.TotalGroupReferences = allGroupMembers.Count;
                result.TotalDeviceReferences = allDeviceOwners.Count;
                result.ValidGroupReferences = allGroupMembers.Intersect(users).Count();
                result.ValidDeviceReferences = allDeviceOwners.Intersect(users).Count();

                result.IsConsistent = result.OrphanedGroupMembers.Count == 0 && result.OrphanedDeviceOwners.Count == 0;

                _logger.LogInformation("Cross-file consistency validation completed: {TotalUsers} users, {TotalGroupReferences} group references, {TotalDeviceReferences} device references",
                    result.TotalUsers, result.TotalGroupReferences, result.TotalDeviceReferences);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing cross-file consistency validation");
                result.IsConsistent = false;
                result.Errors.Add($"Consistency validation error: {ex.Message}");
            }

            return result;
        }

        /// <summary>
        /// Generates sample CSV files for testing and demonstration
        /// </summary>
        /// <param name="outputDirectory">Directory to create sample files in</param>
        /// <returns>Dictionary mapping file types to file paths</returns>
        public Dictionary<string, string> GenerateSampleData(string outputDirectory)
        {
            var generatedFiles = new Dictionary<string, string>();

            try
            {
                Directory.CreateDirectory(outputDirectory);

                // Generate Users.csv
                var usersFile = Path.Combine(outputDirectory, "Users.csv");
                generatedFiles["Users"] = CreateSampleUsersCsv(usersFile, 100);

                // Generate Groups.csv
                var groupsFile = Path.Combine(outputDirectory, "Groups.csv");
                generatedFiles["Groups"] = CreateSampleGroupsCsv(groupsFile);

                // Generate Devices.csv
                var devicesFile = Path.Combine(outputDirectory, "Devices.csv");
                generatedFiles["Devices"] = CreateSampleDevicesCsv(devicesFile, 50);

                // Generate Mailboxes.csv
                var mailboxesFile = Path.Combine(outputDirectory, "Mailboxes.csv");
                generatedFiles["Mailboxes"] = CreateSampleMailboxesCsv(mailboxesFile, 50);

                _logger.LogInformation("Generated {FileCount} sample CSV files in {Directory}",
                    generatedFiles.Count, outputDirectory);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating sample data in directory {Directory}", outputDirectory);
            }

            return generatedFiles;
        }

        private async Task<DataValidationResult> ValidateCsvFile(string filePath, CsvSchema schema)
        {
            var result = new DataValidationResult
            {
                FileName = Path.GetFileName(filePath),
                FilePath = filePath,
                Schema = schema,
                ValidationTime = DateTime.UtcNow
            };

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

        private string CreateSampleUsersCsv(string filePath, int count = 100)
        {
            var csv = "DisplayName,UserPrincipalName,Mail,Department,AccountEnabled,SID,SamAccountName\n";

            for (int i = 0; i < count; i++)
            {
                csv += $"User {i},user{i}@test.com,user{i}@test.com,Dept{i % 10},TRUE,S-1-5-21-{i},user{i}\n";
            }

            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateSampleGroupsCsv(string filePath)
        {
            var csv = "GroupName,Description,SID,GroupType,Members\n";

            for (int i = 0; i < 50; i++)
            {
                var groupType = i % 3 == 0 ? "Security" : i % 3 == 1 ? "Distribution" : "Microsoft365";
                csv += $"Group {i},Test Group {i},S-1-5-32-{i},{groupType},\"S-1-5-21-{i};S-1-5-21-{i+1}\"\n";
            }

            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateSampleDevicesCsv(string filePath, int count)
        {
            var csv = "DeviceName,OperatingSystem,LastSeen,PrimaryUser\n";

            for (int i = 0; i < count; i++)
            {
                var userIndex = i % 100;
                csv += $"DEVICE{i:D4},Windows 10,2024-01-01,user{userIndex}@test.com\n";
            }

            File.WriteAllText(filePath, csv);
            return filePath;
        }

        private string CreateSampleMailboxesCsv(string filePath, int count)
        {
            var csv = "UserPrincipalName,MailboxSize,ItemCount,LastLogon\n";

            for (int i = 0; i < count; i++)
            {
                csv += $"user{i}@test.com,{Random.Shared.Next(100, 50000)},{Random.Shared.Next(100, 10000)},2024-01-01\n";
            }

            File.WriteAllText(filePath, csv);
            return filePath;
        }

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
                }
            };
        }
    }

    #region Supporting Classes

    /// <summary>
    /// Result of CSV validation operation
    /// </summary>
    public class DataValidationResult
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

    /// <summary>
    /// Result of cross-file consistency validation
    /// </summary>
    public class DataConsistencyResult
    {
        public bool IsConsistent { get; set; }
        public List<string> Errors { get; set; } = new();
        public int TotalUsers { get; set; }
        public int TotalGroupReferences { get; set; }
        public int TotalDeviceReferences { get; set; }
        public int ValidGroupReferences { get; set; }
        public int ValidDeviceReferences { get; set; }
        public List<string> OrphanedGroupMembers { get; set; } = new();
        public List<string> OrphanedDeviceOwners { get; set; } = new();
    }

    #endregion
}