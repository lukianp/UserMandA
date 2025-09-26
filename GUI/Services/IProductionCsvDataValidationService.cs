// Version: 1.0.0
// Author: Generated for ProductionCsvDataValidationService
// Date Modified: 2025-09-24
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for production CSV data validation service
    /// </summary>
    public interface IProductionCsvDataValidationService
    {
        /// <summary>
        /// Event raised when validation progress changes
        /// </summary>
        event EventHandler<ValidationProgressEventArgs> ValidationProgress;

        /// <summary>
        /// Validates all CSV files in the specified directory
        /// </summary>
        Task<ProductionCsvValidationResult> ValidateDirectoryAsync(string directoryPath, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates a single CSV file against its schema
        /// </summary>
        Task<ProductionFileValidationResult> ValidateFileAsync(string filePath, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validates multiple files with the same schema
        /// </summary>
        Task<ProductionMultiFileValidationResult> ValidateMultipleFilesAsync(string[] filePaths, string schemaName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gets schema information for a specific data type
        /// </summary>
        CsvSchema GetSchema(string schemaName);

        /// <summary>
        /// Gets all available schemas
        /// </summary>
        IReadOnlyDictionary<string, CsvSchema> GetAllSchemas();
    }


    /// <summary>
    /// Result of CSV validation operation
    /// </summary>
    public class ProductionCsvValidationResult
    {
        public bool IsValid { get; set; }
        public int ValidFileCount { get; set; }
        public int InvalidFileCount { get; set; }
        public int TotalRecords { get; set; }
        public int ValidRecords { get; set; }
        public int InvalidRecords { get; set; }
        public DateTime ValidationTime { get; set; }
        public List<ProductionFileValidationResult> FileValidations { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// Result of individual file validation
    /// </summary>
    public class ProductionFileValidationResult
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public DateTime ValidationTime { get; set; }
        public bool IsValid { get; set; }
        public CsvSchema DetectedSchema { get; set; }
        public int RecordCount { get; set; }
        public int ValidRecordCount { get; set; }
        public int InvalidRecordCount { get; set; }
        public int MissingValueCount { get; set; }
        public List<string> MissingColumns { get; set; } = new();
        public List<string> FoundColumns { get; set; } = new();
        public List<string> DataTypeErrors { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// Result of multi-file validation operation
    /// </summary>
    public class ProductionMultiFileValidationResult
    {
        public bool IsValid { get; set; }
        public int ValidFileCount { get; set; }
        public int InvalidFileCount { get; set; }
        public List<ProductionFileValidationResult> FileResults { get; set; } = new();
    }

}