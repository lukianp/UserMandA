// Version: 1.0.0
// Author: Generated to resolve namespace conflicts
// Date Modified: 2025-09-26
using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Schema definition for CSV validation - shared across all CSV validation services
    /// </summary>
    public class CsvSchema
    {
        public string Name { get; set; }
        public string[] MandatoryColumns { get; set; }
        public string[] OptionalColumns { get; set; }
        public Dictionary<string, DataType> DataTypes { get; set; }
        public Dictionary<string, string[]> ValidValues { get; set; }
        }
    
        /// <summary>
        /// Progress event arguments for validation operations - shared across all validation services
        /// </summary>
        public class ValidationProgressEventArgs : EventArgs
        {
            public string CurrentFile { get; set; } = string.Empty;
            public int FileIndex { get; set; }
            public int TotalFiles { get; set; }
            public double ProgressPercentage { get; set; }
    }

    /// <summary>
    /// Supported data types for validation - shared across all CSV validation services
    /// </summary>
    public enum DataType
    {
        String,
        Integer,
        Decimal,
        Boolean,
        DateTime,
        Email
    }

}