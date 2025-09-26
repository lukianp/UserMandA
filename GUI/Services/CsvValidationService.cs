// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for validating CSV files and migration data before processing
    /// </summary>
    public class CsvValidationService
    {
        private readonly ILogger<CsvValidationService> _logger;
        
        public event EventHandler<ValidationProgressEventArgs>? ValidationProgress;

        public CsvValidationService(ILogger<CsvValidationService> logger = null)
        {
            _logger = logger;
        }

        /// <summary>
        /// Validates CSV files before processing
        /// </summary>
        public async Task<CsvValidationResult> ValidateFilesAsync(IEnumerable<string> filePaths, CancellationToken cancellationToken = default)
        {
            var result = new CsvValidationResult();
            var files = filePaths.ToList();
            
            for (int i = 0; i < files.Count; i++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var filePath = files[i];
                
                OnValidationProgress(new ValidationProgressEventArgs
                {
                    CurrentFile = Path.GetFileName(filePath),
                    FileIndex = i + 1,
                    TotalFiles = files.Count,
                    ProgressPercentage = (double)(i + 1) / files.Count * 100
                });

                try
                {
                    var fileValidation = await ValidateFileAsync(filePath, cancellationToken);
                    result.FileValidations.Add(fileValidation);
                    
                    if (fileValidation.IsValid)
                        result.ValidFileCount++;
                    else
                        result.InvalidFileCount++;
                        
                    result.Errors.AddRange(fileValidation.Errors);
                    result.Warnings.AddRange(fileValidation.Warnings);
                }
                catch (Exception ex)
                {
                    result.InvalidFileCount++;
                    result.Errors.Add($"Critical validation error for {Path.GetFileName(filePath)}: {ex.Message}");
                    _logger?.LogError(ex, $"Critical validation error for file {filePath}");
                }
            }

            result.IsValid = result.InvalidFileCount == 0 && result.Errors.Count == 0;
            return result;
        }

        /// <summary>
        /// Validates a single CSV file
        /// </summary>
        private async Task<FileValidationResult> ValidateFileAsync(string filePath, CancellationToken cancellationToken)
        {
            var result = new FileValidationResult
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath)
            };

            try
            {
                // Check file existence and accessibility
                if (!File.Exists(filePath))
                {
                    result.Errors.Add($"File does not exist: {result.FileName}");
                    return result;
                }

                var fileInfo = new FileInfo(filePath);
                if (fileInfo.Length == 0)
                {
                    result.Warnings.Add($"File is empty: {result.FileName}");
                    return result;
                }

                if (fileInfo.Length > 500 * 1024 * 1024) // 500MB
                {
                    result.Warnings.Add($"Large file detected ({fileInfo.Length / (1024 * 1024)}MB): {result.FileName}");
                }

                // Validate file format and headers
                using var reader = new StreamReader(filePath);
                var headerLine = await reader.ReadLineAsync();
                
                if (string.IsNullOrWhiteSpace(headerLine))
                {
                    result.Errors.Add($"No header row found: {result.FileName}");
                    return result;
                }

                result.Headers = ParseCsvLine(headerLine);
                result.HeaderCount = result.Headers.Length;

                // Validate CSV structure
                var lineCount = 1; // Already read header
                var maxLinesToCheck = 1000; // Sample check for performance
                var inconsistentColumnCounts = 0;
                
                while (!reader.EndOfStream && lineCount < maxLinesToCheck)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    var line = await reader.ReadLineAsync();
                    lineCount++;
                    
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    
                    var columns = ParseCsvLine(line);
                    if (columns.Length != result.HeaderCount)
                    {
                        inconsistentColumnCounts++;
                        if (inconsistentColumnCounts <= 5) // Only report first 5 instances
                        {
                            result.Warnings.Add($"Line {lineCount} has {columns.Length} columns, expected {result.HeaderCount}: {result.FileName}");
                        }
                    }
                }

                if (inconsistentColumnCounts > 5)
                {
                    result.Warnings.Add($"Additional {inconsistentColumnCounts - 5} rows with column count mismatches: {result.FileName}");
                }

                result.SampleRowCount = lineCount - 1; // Exclude header
                result.IsValid = result.Errors.Count == 0;

                // Detect file type based on headers and filename
                result.DetectedFileType = DetectFileType(result.FileName, result.Headers);
                
                _logger?.LogDebug($"Validated CSV file: {result.FileName}, Valid: {result.IsValid}, Type: {result.DetectedFileType}, Headers: {result.HeaderCount}, Sample Rows: {result.SampleRowCount}");
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Validation failed: {ex.Message}");
                _logger?.LogError(ex, $"Error validating file {filePath}");
            }

            return result;
        }

        /// <summary>
        /// Validates migration items for business logic consistency
        /// </summary>
        public MigrationValidationResult ValidateMigrationItems(IEnumerable<MigrationItem> items)
        {
            var result = new MigrationValidationResult();
            var itemList = items.ToList();

            if (!itemList.Any())
            {
                result.Warnings.Add("No migration items to validate");
                return result;
            }

            // Check for duplicate IDs
            var duplicateIds = itemList
                .GroupBy(i => i.Id)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            foreach (var duplicateId in duplicateIds)
            {
                result.Errors.Add($"Duplicate migration item ID found: {duplicateId}");
            }

            // Validate individual items
            foreach (var item in itemList)
            {
                ValidateMigrationItem(item, result);
            }

            // Check for dependency loops (simplified check)
            var dependencyErrors = ValidateDependencies(itemList);
            result.Errors.AddRange(dependencyErrors);

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        private void ValidateMigrationItem(MigrationItem item, MigrationValidationResult result)
        {
            // Required field validation
            if (string.IsNullOrWhiteSpace(item.SourceIdentity))
            {
                result.Errors.Add($"Migration item {item.Id}: SourceIdentity is required");
            }

            // Business logic validation
            if (item.Type == MigrationType.Mailbox && string.IsNullOrWhiteSpace(item.TargetIdentity))
            {
                result.Errors.Add($"Migration item {item.Id}: TargetIdentity is required for mailbox migrations");
            }

            if (item.Priority == MigrationPriority.Critical && item.Complexity == MigrationComplexity.Simple)
            {
                result.Warnings.Add($"Migration item {item.Id}: Critical priority with simple complexity is unusual");
            }

            if (item.EstimatedDuration.HasValue && item.EstimatedDuration.Value.TotalHours > 72)
            {
                result.Warnings.Add($"Migration item {item.Id}: Very long estimated duration ({item.EstimatedDuration.Value.TotalHours:F1} hours)");
            }

            // Size validation
            if (item.SizeBytes.HasValue && item.SizeBytes.Value > 1_000_000_000_000L) // 1TB
            {
                result.Warnings.Add($"Migration item {item.Id}: Very large size ({FormatBytes(item.SizeBytes.Value)})");
            }
        }

        private List<string> ValidateDependencies(List<MigrationItem> items)
        {
            var errors = new List<string>();
            var itemLookup = items.ToDictionary(i => i.Id);

            foreach (var item in items)
            {
                if (item.Dependencies?.Any() == true)
                {
                    foreach (var dependency in item.Dependencies)
                    {
                        if (!itemLookup.ContainsKey(dependency))
                        {
                            errors.Add($"Migration item {item.Id}: Dependency '{dependency}' not found");
                        }
                    }
                }
            }

            return errors;
        }

        private string DetectFileType(string fileName, string[] headers)
        {
            var lowerFileName = fileName.ToLowerInvariant();
            var lowerHeaders = headers.Select(h => h.ToLowerInvariant()).ToArray();

            if (lowerFileName.Contains("user") || lowerHeaders.Any(h => h.Contains("userprincipalname")))
                return "Users";
            if (lowerFileName.Contains("group") || lowerHeaders.Any(h => h.Contains("grouptype")))
                return "Groups";
            if (lowerFileName.Contains("computer") || lowerFileName.Contains("vm") || lowerHeaders.Any(h => h.Contains("operatingsystem")))
                return "Infrastructure";
            if (lowerFileName.Contains("application") || lowerHeaders.Any(h => h.Contains("publisher")))
                return "Applications";
            if (lowerFileName.Contains("migration") || lowerHeaders.Any(h => h.Contains("migrationtype")))
                return "Migration";
            if (lowerFileName.Contains("batch") || lowerHeaders.Any(h => h.Contains("batchname")))
                return "MigrationBatch";

            return "Unknown";
        }

        private string[] ParseCsvLine(string line)
        {
            var values = new List<string>();
            bool inQuotes = false;
            var currentValue = new System.Text.StringBuilder();
            
            var delimiter = line.Contains(';') && !line.Contains(',') ? ';' : ',';

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentValue.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == delimiter && !inQuotes)
                {
                    values.Add(currentValue.ToString().Trim());
                    currentValue.Clear();
                }
                else
                {
                    currentValue.Append(c);
                }
            }

            values.Add(currentValue.ToString().Trim());
            return values.ToArray();
        }

        private string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }

        protected virtual void OnValidationProgress(ValidationProgressEventArgs e)
        {
            ValidationProgress?.Invoke(this, e);
        }
    }

    /// <summary>
    /// Result of CSV file validation
    /// </summary>
    public class CsvValidationResult
    {
        public bool IsValid { get; set; }
        public int ValidFileCount { get; set; }
        public int InvalidFileCount { get; set; }
        public List<FileValidationResult> FileValidations { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// Result of individual file validation
    /// </summary>
    public class FileValidationResult
    {
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public string[] Headers { get; set; } = Array.Empty<string>();
        public int HeaderCount { get; set; }
        public int SampleRowCount { get; set; }
        public string DetectedFileType { get; set; } = "Unknown";
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// General validation result for business logic validation
    /// </summary>
    public class MigrationValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

}