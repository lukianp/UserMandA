// Version: 1.0.0
// Author: Converted from CsvDataValidationTests.cs
// Date Modified: 2025-09-24
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Production service for validating CSV data files with comprehensive schema validation
    /// </summary>
    public class ProductionCsvDataValidationService : IProductionCsvDataValidationService
    {
        private readonly ILogger<ProductionCsvDataValidationService> _logger;
        private readonly Dictionary<string, CsvSchema> _schemas;

        public event EventHandler<CsvValidationProgressEventArgs>? ValidationProgress;

        public ProductionCsvDataValidationService(ILogger<ProductionCsvDataValidationService> logger = null)
        {
            _logger = logger;
            _schemas = InitializeSchemas();
        }

        /// <summary>
        /// Validates all CSV files in the specified directory
        /// </summary>
        public async Task<ProductionCsvValidationResult> ValidateDirectoryAsync(string directoryPath, CancellationToken cancellationToken = default)
        {
            var result = new ProductionCsvValidationResult();

            if (!Directory.Exists(directoryPath))
            {
                result.Errors.Add($"Directory not found: {directoryPath}");
                result.IsValid = false;
                return result;
            }

            var csvFiles = Directory.GetFiles(directoryPath, "*.csv", SearchOption.TopDirectoryOnly);
            _logger?.LogInformation($"Found {csvFiles.Length} CSV files to validate in {directoryPath}");

            var files = csvFiles.ToList();
            for (int i = 0; i < files.Count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var filePath = files[i];

                OnValidationProgress(new CsvValidationProgressEventArgs
                {
                    CurrentFile = Path.GetFileName(filePath),
                    FileIndex = i + 1,
                    TotalFiles = files.Count,
                    ProgressPercentage = (double)(i + 1) / files.Count * 100
                });

                try
                {
                    var fileResult = await ValidateFileAsync(filePath, cancellationToken);
                    result.FileValidations.Add(fileResult);

                    if (fileResult.IsValid)
                        result.ValidFileCount++;
                    else
                        result.InvalidFileCount++;

                    result.TotalRecords += fileResult.RecordCount;
                    result.ValidRecords += fileResult.ValidRecordCount;
                    result.Errors.AddRange(fileResult.Errors);
                    result.Warnings.AddRange(fileResult.Warnings);
                }
                catch (Exception ex)
                {
                    result.InvalidFileCount++;
                    result.Errors.Add($"Critical validation error for {Path.GetFileName(filePath)}: {ex.Message}");
                    _logger?.LogError(ex, $"Critical validation error for file {filePath}");
                }
            }

            result.IsValid = result.InvalidFileCount == 0 && result.Errors.Count == 0;
            result.ValidationTime = DateTime.UtcNow;

            _logger?.LogInformation($"Directory validation completed: {result.ValidFileCount}/{files.Count} valid files, {result.ValidRecords}/{result.TotalRecords} valid records");

            return result;
        }

        /// <summary>
        /// Validates a single CSV file against its schema
        /// </summary>
        public async Task<ProductionFileValidationResult> ValidateFileAsync(string filePath, CancellationToken cancellationToken = default)
        {
            var result = new ProductionFileValidationResult
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath),
                ValidationTime = DateTime.UtcNow
            };

            try
            {
                if (!File.Exists(filePath))
                {
                    result.Errors.Add($"File not found: {filePath}");
                    result.IsValid = false;
                    return result;
                }

                // Detect schema based on filename
                result.DetectedSchema = DetectSchema(result.FileName);
                if (result.DetectedSchema == null)
                {
                    result.Errors.Add($"Cannot determine schema for file: {result.FileName}");
                    result.IsValid = false;
                    return result;
                }

                // Validate file structure and content
                var validationResult = await ValidateCsvFile(filePath, result.DetectedSchema, cancellationToken);

                result.IsValid = validationResult.IsValid;
                result.RecordCount = validationResult.RecordCount;
                result.ValidRecordCount = validationResult.ValidRecordCount;
                result.InvalidRecordCount = validationResult.InvalidRecordCount;
                result.MissingValueCount = validationResult.MissingValueCount;
                result.MissingColumns = validationResult.MissingColumns;
                result.FoundColumns = validationResult.FoundColumns;
                result.DataTypeErrors = validationResult.DataTypeErrors;
                result.Errors = validationResult.Errors;
                result.Warnings = validationResult.Warnings;

                _logger?.LogDebug($"Validated file: {result.FileName}, Valid: {result.IsValid}, Records: {result.RecordCount}");

            }
            catch (Exception ex)
            {
                result.Errors.Add($"Validation failed: {ex.Message}");
                result.IsValid = false;
                _logger?.LogError(ex, $"Error validating file {filePath}");
            }

            return result;
        }

        /// <summary>
        /// Validates multiple files with the same schema
        /// </summary>
        public async Task<ProductionMultiFileValidationResult> ValidateMultipleFilesAsync(string[] filePaths, string schemaName, CancellationToken cancellationToken = default)
        {
            var result = new ProductionMultiFileValidationResult();
            var schema = _schemas[schemaName];

            var files = filePaths.Where(File.Exists).ToList();
            _logger?.LogInformation($"Validating {files.Count} files with {schemaName} schema");

            for (int i = 0; i < files.Count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var filePath = files[i];

                OnValidationProgress(new CsvValidationProgressEventArgs
                {
                    CurrentFile = Path.GetFileName(filePath),
                    FileIndex = i + 1,
                    TotalFiles = files.Count,
                    ProgressPercentage = (double)(i + 1) / files.Count * 100
                });

                try
                {
                    var fileResult = await ValidateFileAsync(filePath, cancellationToken);
                    result.FileResults.Add(fileResult);

                    if (fileResult.IsValid)
                        result.ValidFileCount++;
                    else
                        result.InvalidFileCount++;
                }
                catch (Exception ex)
                {
                    result.InvalidFileCount++;
                    var errorResult = new ProductionFileValidationResult
                    {
                        FilePath = filePath,
                        FileName = Path.GetFileName(filePath),
                        IsValid = false,
                        Errors = { $"Validation error: {ex.Message}" }
                    };
                    result.FileResults.Add(errorResult);
                    _logger?.LogError(ex, $"Error validating file {filePath}");
                }
            }

            result.IsValid = result.InvalidFileCount == 0;
            return result;
        }

        /// <summary>
        /// Gets schema information for a specific data type
        /// </summary>
        public CsvSchema GetSchema(string schemaName)
        {
            return _schemas.TryGetValue(schemaName, out var schema) ? schema : null;
        }

        /// <summary>
        /// Gets all available schemas
        /// </summary>
        public IReadOnlyDictionary<string, CsvSchema> GetAllSchemas()
        {
            return _schemas;
        }

        private CsvSchema DetectSchema(string fileName)
        {
            var lowerFileName = fileName.ToLowerInvariant();

            if (lowerFileName.Contains("user") || lowerFileName.Contains("azureuser") || lowerFileName.Contains("active"))
                return _schemas["Users"];
            if (lowerFileName.Contains("group") || lowerFileName.Contains("security") || lowerFileName.Contains("distribution"))
                return _schemas["Groups"];
            if (lowerFileName.Contains("device") || lowerFileName.Contains("computer") || lowerFileName.Contains("inventory"))
                return _schemas["Devices"];
            if (lowerFileName.Contains("mailbox") || lowerFileName.Contains("exchange"))
                return _schemas["Mailboxes"];
            if (lowerFileName.Contains("application"))
                return _schemas["Applications"];

            // Default to Users schema if unsure
            return _schemas["Users"];
        }

        private async Task<ValidationResult> ValidateCsvFile(string filePath, CsvSchema schema, CancellationToken cancellationToken)
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

            try
            {
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
                    cancellationToken.ThrowIfCancellationRequested();
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
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add($"Validation error: {ex.Message}");
                _logger?.LogError(ex, $"Error validating CSV file {filePath}");
                return result;
            }
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

        private string[] ParseCsvLine(string line)
        {
            var result = new List<string>();
            var inQuotes = false;
            var currentField = new System.Text.StringBuilder();

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

        protected virtual void OnValidationProgress(CsvValidationProgressEventArgs e)
        {
            ValidationProgress?.Invoke(this, e);
        }
    }

}