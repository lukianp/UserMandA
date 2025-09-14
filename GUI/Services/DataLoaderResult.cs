using System.Collections.Generic;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Represents the result of a data loading operation with validation warnings
    /// </summary>
    /// <typeparam name="T">The type of data being loaded</typeparam>
    public sealed class DataLoaderResult<T>
    {
        /// <summary>
        /// Indicates whether the load operation was successful
        /// </summary>
        public bool IsSuccess { get; init; } = true;

        /// <summary>
        /// The loaded data items
        /// </summary>
        public List<T> Data { get; init; } = new List<T>();

        /// <summary>
        /// Header validation warnings (e.g., missing columns, file issues)
        /// </summary>
        public List<string> HeaderWarnings { get; init; } = new List<string>();

        /// <summary>
        /// Creates a successful result with data
        /// </summary>
        public static DataLoaderResult<T> Success(List<T> data, List<string>? warnings = null)
        {
            return new DataLoaderResult<T>
            {
                IsSuccess = true,
                Data = data ?? new List<T>(),
                HeaderWarnings = warnings ?? new List<string>()
            };
        }

        /// <summary>
        /// Creates a failed result with warnings
        /// </summary>
        public static DataLoaderResult<T> Failure(List<string>? warnings)
        {
            return new DataLoaderResult<T>
            {
                IsSuccess = false,
                Data = new List<T>(),
                HeaderWarnings = warnings ?? new List<string>()
            };
        }
    }
}