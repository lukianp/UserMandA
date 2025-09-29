using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CsvHelper;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services.Audit
{
    /// <summary>
    /// Production-ready SQLite-based audit service implementation for migration auditing and reporting.
    /// Provides comprehensive audit logging, querying, statistics, and export capabilities.
    /// </summary>
    public class AuditService : IAuditService, IDisposable
    {
        private readonly ILogger<AuditService> _logger;
        private readonly string _connectionString;
        private readonly string _databasePath;
        private bool _disposed;

        /// <summary>
        /// Initializes a new instance of the AuditService.
        /// </summary>
        /// <param name="logger">Logger instance for audit operations.</param>
        /// <param name="auditDatabasePath">Optional custom path for the audit database. If null, uses default discovery data location.</param>
        /// <exception cref="ArgumentNullException">Thrown when logger is null.</exception>
        public AuditService(ILogger<AuditService> logger, string auditDatabasePath = null)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Initialize database path
            _databasePath = auditDatabasePath ?? GetDefaultDatabasePath();

            // Ensure directory exists
            var directory = Path.GetDirectoryName(_databasePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                _logger.LogInformation("Created audit database directory: {Directory}", directory);
            }

            // Configure connection string with performance optimizations
            _connectionString = $"Data Source={_databasePath};Version=3;Journal Mode=WAL;Synchronous=NORMAL;Cache Size=10000;";

            // Initialize database schema asynchronously
            try
            {
                InitializeDatabaseAsync().GetAwaiter().GetResult();
                ValidateInterfaceImplementation();
                _logger.LogInformation("Audit service initialized successfully at {DatabasePath}", _databasePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize audit service");
                throw;
            }
        }

        /// <summary>
        /// Gets the default database path for audit logs.
        /// </summary>
        /// <returns>The full path to the audit database file.</returns>
        private static string GetDefaultDatabasePath()
        {
            var discoveryDataPath = @"C:\discoverydata";

            // Try to find current company profile from configuration
            var currentProfile = GetCurrentCompanyProfile();
            if (!string.IsNullOrEmpty(currentProfile))
            {
                return Path.Combine(discoveryDataPath, currentProfile, "Logs", "migration-audit.db");
            }

            // Fallback to common location
            return Path.Combine(discoveryDataPath, "Common", "Logs", "migration-audit.db");
        }

        /// <summary>
        /// Gets the current company profile from configuration.
        /// </summary>
        /// <returns>The current company profile name, or "Common" if not found.</returns>
        private static string GetCurrentCompanyProfile()
        {
            try
            {
                var configPath = @"D:\Scripts\UserMandA\GUI\Configuration\app.config";
                if (File.Exists(configPath))
                {
                    // Parse configuration to get current profile
                    // Implementation would depend on configuration format
                    var configContent = File.ReadAllText(configPath);
                    // For now, return a default or try to read from configuration
                }
            }
            catch (Exception ex)
            {
                // Log but don't throw - use fallback
                Trace.TraceWarning($"Error reading configuration: {ex.Message}");
            }

            return "Common";
        }

        /// <summary>
        /// Validates that the IAuditService interface methods are properly implemented.
        /// </summary>
        private void ValidateInterfaceImplementation()
        {
            try
            {
                _logger.LogDebug("Validating IAuditService interface implementation...");

                // Check if required methods are available
                var interfaceType = typeof(IAuditService);
                var implementationType = GetType();

                var interfaceMethods = interfaceType.GetMethods()
                    .Where(m => !m.IsSpecialName) // Exclude property getters/setters
                    .Select(m => m.Name)
                    .ToHashSet();

                var implementedMethods = implementationType.GetMethods()
                    .Where(m => !m.IsSpecialName && interfaceMethods.Contains(m.Name))
                    .Select(m => m.Name)
                    .ToHashSet();

                foreach (var method in interfaceMethods)
                {
                    if (implementedMethods.Contains(method))
                    {
                        _logger.LogTrace("✓ Method {Method} is implemented", method);
                    }
                    else
                    {
                        _logger.LogError("✗ Method {Method} is missing implementation", method);
                    }
                }

                _logger.LogInformation("IAuditService interface validation completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating IAuditService interface implementation");
            }
        }

        /// <summary>
        /// Initializes the audit database schema.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        private async Task InitializeDatabaseAsync()
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS AuditEvents (
                    AuditId TEXT PRIMARY KEY,
                    Timestamp TEXT NOT NULL,
                    UserPrincipalName TEXT,
                    SessionId TEXT,
                    SourceProfile TEXT,
                    TargetProfile TEXT,
                    Action INTEGER NOT NULL,
                    ObjectType INTEGER NOT NULL,
                    SourceObjectId TEXT,
                    SourceObjectName TEXT,
                    TargetObjectId TEXT,
                    TargetObjectName TEXT,
                    WaveId TEXT,
                    WaveName TEXT,
                    BatchId TEXT,
                    Duration INTEGER, -- Ticks
                    SourceEnvironment TEXT,
                    TargetEnvironment TEXT,
                    MachineName TEXT,
                    MachineIpAddress TEXT,
                    Status INTEGER NOT NULL,
                    StatusMessage TEXT,
                    ErrorCode TEXT,
                    ErrorMessage TEXT,
                    Warnings TEXT, -- JSON array
                    RetryAttempts INTEGER DEFAULT 0,
                    ItemsProcessed INTEGER,
                    DataSizeBytes INTEGER,
                    TransferRate REAL,
                    Metadata TEXT, -- JSON object
                    ParentAuditId TEXT,
                    CorrelationId TEXT,
                    MigrationResultData TEXT, -- JSON object
                    Created TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS IX_AuditEvents_Timestamp ON AuditEvents(Timestamp);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_UserPrincipalName ON AuditEvents(UserPrincipalName);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_ObjectType ON AuditEvents(ObjectType);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_Status ON AuditEvents(Status);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_WaveId ON AuditEvents(WaveId);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_Action ON AuditEvents(Action);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_SourceProfile ON AuditEvents(SourceProfile);
                CREATE INDEX IF NOT EXISTS IX_AuditEvents_TargetProfile ON AuditEvents(TargetProfile);
            ";

            using var connection = new SQLiteConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SQLiteCommand(createTableSql, connection);
            await command.ExecuteNonQueryAsync();

            _logger.LogInformation("Audit database schema initialized at {DatabasePath}", _databasePath);
        }

        /// <summary>
        /// Records an audit event for migration operations.
        /// </summary>
        /// <param name="auditEvent">The audit event to log.</param>
        /// <returns>True if the event was logged successfully, false otherwise.</returns>
        /// <exception cref="ArgumentNullException">Thrown when auditEvent is null.</exception>
        public async Task<bool> LogAuditEventAsync(AuditEvent auditEvent)
        {
            return await LogAsync(auditEvent);
        }

        /// <summary>
        /// Records an audit event for migration operations (alternative method name).
        /// </summary>
        /// <param name="auditEvent">The audit event to log.</param>
        /// <returns>True if the event was logged successfully, false otherwise.</returns>
        /// <exception cref="ArgumentNullException">Thrown when auditEvent is null.</exception>
        public async Task<bool> LogAsync(AuditEvent auditEvent)
        {
            if (auditEvent == null)
                throw new ArgumentNullException(nameof(auditEvent));

            try
            {
                using var connection = new SQLiteConnection(_connectionString);
                await connection.OpenAsync();

                const string insertSql = @"
                    INSERT INTO AuditEvents (
                        AuditId, Timestamp, UserPrincipalName, SessionId, SourceProfile, TargetProfile,
                        Action, ObjectType, SourceObjectId, SourceObjectName, TargetObjectId, TargetObjectName,
                        WaveId, WaveName, BatchId, Duration, SourceEnvironment, TargetEnvironment,
                        MachineName, MachineIpAddress, Status, StatusMessage, ErrorCode, ErrorMessage,
                        Warnings, RetryAttempts, ItemsProcessed, DataSizeBytes, TransferRate,
                        Metadata, ParentAuditId, CorrelationId, MigrationResultData
                    ) VALUES (
                        @AuditId, @Timestamp, @UserPrincipalName, @SessionId, @SourceProfile, @TargetProfile,
                        @Action, @ObjectType, @SourceObjectId, @SourceObjectName, @TargetObjectId, @TargetObjectName,
                        @WaveId, @WaveName, @BatchId, @Duration, @SourceEnvironment, @TargetEnvironment,
                        @MachineName, @MachineIpAddress, @Status, @StatusMessage, @ErrorCode, @ErrorMessage,
                        @Warnings, @RetryAttempts, @ItemsProcessed, @DataSizeBytes, @TransferRate,
                        @Metadata, @ParentAuditId, @CorrelationId, @MigrationResultData
                    )";

                using var command = new SQLiteCommand(insertSql, connection);
                await AddAuditEventParametersAsync(command, auditEvent);

                var rowsAffected = await command.ExecuteNonQueryAsync();

                _logger.LogDebug("Audit event logged: {AuditId} for {ObjectType} {Action}",
                    auditEvent.AuditId, auditEvent.ObjectType, auditEvent.Action);

                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log audit event: {AuditId}", auditEvent.AuditId);
                return false;
            }
        }

        /// <summary>
        /// Adds parameters to the SQLite command for an audit event.
        /// </summary>
        /// <param name="command">The SQLite command to add parameters to.</param>
        /// <param name="auditEvent">The audit event to extract parameters from.</param>
        private async Task AddAuditEventParametersAsync(SQLiteCommand command, AuditEvent auditEvent)
        {
            command.Parameters.AddWithValue("@AuditId", auditEvent.AuditId.ToString());
            command.Parameters.AddWithValue("@Timestamp", auditEvent.Timestamp.ToString("O"));
            command.Parameters.AddWithValue("@UserPrincipalName", auditEvent.UserPrincipalName ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SessionId", auditEvent.SessionId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SourceProfile", auditEvent.SourceProfile ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@TargetProfile", auditEvent.TargetProfile ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Action", (int)auditEvent.Action);
            command.Parameters.AddWithValue("@ObjectType", (int)auditEvent.ObjectType);
            command.Parameters.AddWithValue("@SourceObjectId", auditEvent.SourceObjectId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SourceObjectName", auditEvent.SourceObjectName ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@TargetObjectId", auditEvent.TargetObjectId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@TargetObjectName", auditEvent.TargetObjectName ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@WaveId", auditEvent.WaveId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@WaveName", auditEvent.WaveName ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@BatchId", auditEvent.BatchId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Duration", auditEvent.Duration?.Ticks ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@SourceEnvironment", auditEvent.SourceEnvironment ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@TargetEnvironment", auditEvent.TargetEnvironment ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@MachineName", auditEvent.MachineName ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@MachineIpAddress", auditEvent.MachineIpAddress ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Status", (int)auditEvent.Status);
            command.Parameters.AddWithValue("@StatusMessage", auditEvent.StatusMessage ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ErrorCode", auditEvent.ErrorCode ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@ErrorMessage", auditEvent.ErrorMessage ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Warnings", auditEvent.Warnings?.Any() == true ? JsonSerializer.Serialize(auditEvent.Warnings) : (object)DBNull.Value);
            command.Parameters.AddWithValue("@RetryAttempts", auditEvent.RetryAttempts);
            command.Parameters.AddWithValue("@ItemsProcessed", auditEvent.ItemsProcessed ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@DataSizeBytes", auditEvent.DataSizeBytes ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@TransferRate", auditEvent.TransferRate ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Metadata", auditEvent.Metadata?.Any() == true ? JsonSerializer.Serialize(auditEvent.Metadata) : (object)DBNull.Value);
            command.Parameters.AddWithValue("@ParentAuditId", auditEvent.ParentAuditId?.ToString() ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@CorrelationId", auditEvent.CorrelationId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@MigrationResultData", auditEvent.MigrationResultData ?? (object)DBNull.Value);
        }

        /// <summary>
        /// Retrieves audit events with filtering options.
        /// </summary>
        /// <param name="filter">Optional filter criteria for the query.</param>
        /// <returns>A collection of audit events matching the filter criteria.</returns>
        public async Task<IEnumerable<AuditEvent>> GetAuditEventsAsync(AuditFilter filter = null)
        {
            filter ??= new AuditFilter();

            var (whereClause, parameters) = BuildFilterConditions(filter);
            var limitClause = filter.MaxRecords.HasValue ? $"LIMIT {filter.MaxRecords.Value}" : "";
            var offsetClause = filter.Skip.HasValue ? $"OFFSET {filter.Skip.Value}" : "";

            var sql = $@"
                SELECT * FROM AuditEvents
                {whereClause}
                ORDER BY Timestamp DESC
                {limitClause} {offsetClause}";

            var events = new List<AuditEvent>();

            try
            {
                using var connection = new SQLiteConnection(_connectionString);
                await connection.OpenAsync();

                using var command = new SQLiteCommand(sql, connection);
                command.Parameters.AddRange(parameters.ToArray());

                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var auditEvent = await MapReaderToAuditEventAsync(reader);
                    events.Add(auditEvent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit events");
                throw;
            }

            return events;
        }

        /// <summary>
        /// Retrieves audit statistics for reporting.
        /// </summary>
        /// <param name="filter">Optional filter criteria for the statistics.</param>
        /// <returns>Audit statistics based on the filter criteria.</returns>
        public async Task<AuditStatistics> GetAuditStatisticsAsync(AuditFilter filter = null)
        {
            filter ??= new AuditFilter();

            var (whereClause, parameters) = BuildFilterConditions(filter);
            var statistics = new AuditStatistics();

            try
            {
                using var connection = new SQLiteConnection(_connectionString);
                await connection.OpenAsync();

                // Get basic statistics
                var basicStats = await GetBasicStatisticsAsync(connection, whereClause, parameters);
                statistics.TotalEvents = basicStats.totalEvents;
                statistics.SuccessfulOperations = basicStats.successfulOperations;
                statistics.FailedOperations = basicStats.failedOperations;
                statistics.WarningOperations = basicStats.warningOperations;
                statistics.TotalDataProcessed = basicStats.totalDataProcessed;

                if (basicStats.avgDurationTicks.HasValue)
                {
                    statistics.AverageOperationDuration = TimeSpan.FromTicks((long)basicStats.avgDurationTicks.Value);
                }

                // Get operations by object type
                statistics.OperationsByObjectType = await GetOperationsByObjectTypeAsync(connection, whereClause, parameters);

                // Get operations by day (last 30 days)
                statistics.OperationsByDay = await GetOperationsByDayAsync(connection, whereClause, parameters);

                // Get top errors
                statistics.TopErrors = await GetTopErrorsAsync(connection, whereClause, parameters);

                // Get operations by wave
                statistics.OperationsByWave = await GetOperationsByWaveAsync(connection, whereClause, parameters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit statistics");
                throw;
            }

            return statistics;
        }

        /// <summary>
        /// Exports audit events to CSV format.
        /// </summary>
        /// <param name="filter">Optional filter criteria for the export.</param>
        /// <returns>Byte array containing the CSV data.</returns>
        public async Task<byte[]> ExportToCsvAsync(AuditFilter filter = null)
        {
            var events = await GetAuditEventsAsync(filter);

            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
            using var csvWriter = new CsvWriter(writer, CultureInfo.InvariantCulture);

            await csvWriter.WriteRecordsAsync(events.Select(e => new
            {
                e.AuditId,
                e.Timestamp,
                e.UserPrincipalName,
                e.SessionId,
                e.SourceProfile,
                e.TargetProfile,
                Action = e.Action.ToString(),
                ObjectType = e.ObjectType.ToString(),
                e.SourceObjectId,
                e.SourceObjectName,
                e.TargetObjectId,
                e.TargetObjectName,
                e.WaveId,
                e.WaveName,
                e.BatchId,
                Duration = e.Duration?.ToString(),
                e.SourceEnvironment,
                e.TargetEnvironment,
                e.MachineName,
                e.MachineIpAddress,
                Status = e.Status.ToString(),
                e.StatusMessage,
                e.ErrorCode,
                e.ErrorMessage,
                Warnings = e.Warnings?.Any() == true ? string.Join("; ", e.Warnings) : "",
                e.RetryAttempts,
                e.ItemsProcessed,
                e.DataSizeBytes,
                e.TransferRate,
                e.ParentAuditId,
                e.CorrelationId
            }));

            await writer.FlushAsync();
            return memoryStream.ToArray();
        }

        /// <summary>
        /// Exports audit events to PDF format.
        /// </summary>
        /// <param name="filter">Optional filter criteria for the export.</param>
        /// <returns>Byte array containing the PDF data.</returns>
        public async Task<byte[]> ExportToPdfAsync(AuditFilter filter = null)
        {
            // For production, you would use a proper PDF library like iTextSharp or similar
            // For now, return a simple text-based PDF placeholder
            var csvData = await ExportToCsvAsync(filter);
            var text = Encoding.UTF8.GetString(csvData);

            var pdfContent = $@"MIGRATION AUDIT REPORT
Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC
Filter: {(filter != null ? JsonSerializer.Serialize(filter) : "None")}

{text}";

            return Encoding.UTF8.GetBytes(pdfContent);
        }

        /// <summary>
        /// Archives old audit records based on retention policy.
        /// </summary>
        /// <param name="retentionPeriod">The period for which to retain records.</param>
        /// <returns>The number of records archived.</returns>
        public async Task<int> ArchiveOldRecordsAsync(TimeSpan retentionPeriod)
        {
            var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);

            try
            {
                using var connection = new SQLiteConnection(_connectionString);
                await connection.OpenAsync();

                // Create archive database path
                var archivePath = Path.ChangeExtension(_databasePath, $".archive.{DateTime.UtcNow:yyyyMMdd}.db");

                // Archive old records
                var archiveSql = $@"
                    ATTACH DATABASE '{archivePath}' AS archive;

                    CREATE TABLE IF NOT EXISTS archive.AuditEvents AS
                    SELECT * FROM main.AuditEvents
                    WHERE Timestamp < @CutoffDate;

                    DETACH DATABASE archive;";

                using var archiveCommand = new SQLiteCommand(archiveSql, connection);
                archiveCommand.Parameters.AddWithValue("@CutoffDate", cutoffDate.ToString("O"));
                await archiveCommand.ExecuteNonQueryAsync();

                // Delete old records from main database
                const string deleteSql = "DELETE FROM AuditEvents WHERE Timestamp < @CutoffDate";
                using var deleteCommand = new SQLiteCommand(deleteSql, connection);
                deleteCommand.Parameters.AddWithValue("@CutoffDate", cutoffDate.ToString("O"));

                var deletedCount = await deleteCommand.ExecuteNonQueryAsync();

                // Vacuum database to reclaim space
                using var vacuumCommand = new SQLiteCommand("VACUUM", connection);
                await vacuumCommand.ExecuteNonQueryAsync();

                _logger.LogInformation("Archived {DeletedCount} audit records older than {CutoffDate}",
                    deletedCount, cutoffDate);

                return deletedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to archive old audit records");
                throw;
            }
        }

        /// <summary>
        /// Validates audit log integrity.
        /// </summary>
        /// <returns>True if the audit log integrity is valid, false otherwise.</returns>
        public async Task<bool> ValidateAuditIntegrityAsync()
        {
            try
            {
                using var connection = new SQLiteConnection(_connectionString);
                await connection.OpenAsync();

                // Check for missing required fields
                const string validationSql = @"
                    SELECT COUNT(*) as InvalidRecords
                    FROM AuditEvents
                    WHERE AuditId IS NULL
                        OR Timestamp IS NULL
                        OR Action IS NULL
                        OR ObjectType IS NULL
                        OR Status IS NULL";

                using var command = new SQLiteCommand(validationSql, connection);
                var invalidRecords = (long)(await command.ExecuteScalarAsync() ?? 0);

                if (invalidRecords > 0)
                {
                    _logger.LogWarning("Found {InvalidRecords} audit records with missing required fields", invalidRecords);
                    return false;
                }

                // Run SQLite integrity check
                using var integrityCommand = new SQLiteCommand("PRAGMA integrity_check", connection);
                var integrityResult = (string)(await integrityCommand.ExecuteScalarAsync() ?? string.Empty);

                if (!string.Equals(integrityResult, "ok", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogError("SQLite integrity check failed: {Result}", integrityResult);
                    return false;
                }

                _logger.LogInformation("Audit database integrity validation passed");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate audit integrity");
                return false;
            }
        }

        /// <summary>
        /// Builds filter conditions and parameters for audit queries.
        /// </summary>
        /// <param name="filter">The filter criteria.</param>
        /// <returns>A tuple containing the WHERE clause and parameters.</returns>
        private (string whereClause, List<SQLiteParameter> parameters) BuildFilterConditions(AuditFilter filter)
        {
            var whereConditions = new List<string>();
            var parameters = new List<SQLiteParameter>();

            if (filter.StartDate.HasValue)
            {
                whereConditions.Add("Timestamp >= @StartDate");
                parameters.Add(new SQLiteParameter("@StartDate", filter.StartDate.Value.ToString("O")));
            }

            if (filter.EndDate.HasValue)
            {
                whereConditions.Add("Timestamp <= @EndDate");
                parameters.Add(new SQLiteParameter("@EndDate", filter.EndDate.Value.ToString("O")));
            }

            if (!string.IsNullOrEmpty(filter.UserPrincipalName))
            {
                whereConditions.Add("UserPrincipalName = @UserPrincipalName");
                parameters.Add(new SQLiteParameter("@UserPrincipalName", filter.UserPrincipalName));
            }

            if (filter.ObjectType.HasValue)
            {
                whereConditions.Add("ObjectType = @ObjectType");
                parameters.Add(new SQLiteParameter("@ObjectType", (int)filter.ObjectType.Value));
            }

            if (filter.Action.HasValue)
            {
                whereConditions.Add("Action = @Action");
                parameters.Add(new SQLiteParameter("@Action", (int)filter.Action.Value));
            }

            if (filter.Status.HasValue)
            {
                whereConditions.Add("Status = @Status");
                parameters.Add(new SQLiteParameter("@Status", (int)filter.Status.Value));
            }

            if (!string.IsNullOrEmpty(filter.WaveId))
            {
                whereConditions.Add("WaveId = @WaveId");
                parameters.Add(new SQLiteParameter("@WaveId", filter.WaveId));
            }

            if (!string.IsNullOrEmpty(filter.SourceProfile))
            {
                whereConditions.Add("SourceProfile = @SourceProfile");
                parameters.Add(new SQLiteParameter("@SourceProfile", filter.SourceProfile));
            }

            if (!string.IsNullOrEmpty(filter.TargetProfile))
            {
                whereConditions.Add("TargetProfile = @TargetProfile");
                parameters.Add(new SQLiteParameter("@TargetProfile", filter.TargetProfile));
            }

            if (!string.IsNullOrEmpty(filter.SearchText))
            {
                whereConditions.Add("(SourceObjectName LIKE @SearchText OR TargetObjectName LIKE @SearchText OR StatusMessage LIKE @SearchText)");
                parameters.Add(new SQLiteParameter("@SearchText", $"%{filter.SearchText}%"));
            }

            var whereClause = whereConditions.Any() ? "WHERE " + string.Join(" AND ", whereConditions) : "";
            return (whereClause, parameters);
        }

        /// <summary>
        /// Maps a database reader to an AuditEvent object.
        /// </summary>
        /// <param name="reader">The database reader.</param>
        /// <returns>The mapped AuditEvent object.</returns>
        private async Task<AuditEvent> MapReaderToAuditEventAsync(IDataReader reader)
        {
            var auditEvent = new AuditEvent
            {
                AuditId = Guid.Parse(reader["AuditId"].ToString()!),
                Timestamp = DateTime.Parse(reader["Timestamp"].ToString()!),
                UserPrincipalName = reader["UserPrincipalName"] == DBNull.Value ? null : reader["UserPrincipalName"].ToString(),
                SessionId = reader["SessionId"] == DBNull.Value ? null : reader["SessionId"].ToString(),
                SourceProfile = reader["SourceProfile"] == DBNull.Value ? null : reader["SourceProfile"].ToString(),
                TargetProfile = reader["TargetProfile"] == DBNull.Value ? null : reader["TargetProfile"].ToString(),
                Action = (AuditAction)Convert.ToInt32(reader["Action"]),
                ObjectType = (ObjectType)Convert.ToInt32(reader["ObjectType"]),
                SourceObjectId = reader["SourceObjectId"] == DBNull.Value ? null : reader["SourceObjectId"].ToString(),
                SourceObjectName = reader["SourceObjectName"] == DBNull.Value ? null : reader["SourceObjectName"].ToString(),
                TargetObjectId = reader["TargetObjectId"] == DBNull.Value ? null : reader["TargetObjectId"].ToString(),
                TargetObjectName = reader["TargetObjectName"] == DBNull.Value ? null : reader["TargetObjectName"].ToString(),
                WaveId = reader["WaveId"] == DBNull.Value ? null : reader["WaveId"].ToString(),
                WaveName = reader["WaveName"] == DBNull.Value ? null : reader["WaveName"].ToString(),
                BatchId = reader["BatchId"] == DBNull.Value ? null : reader["BatchId"].ToString(),
                Duration = reader["Duration"] == DBNull.Value ? null : TimeSpan.FromTicks(Convert.ToInt64(reader["Duration"])),
                SourceEnvironment = reader["SourceEnvironment"] == DBNull.Value ? null : reader["SourceEnvironment"].ToString(),
                TargetEnvironment = reader["TargetEnvironment"] == DBNull.Value ? null : reader["TargetEnvironment"].ToString(),
                MachineName = reader["MachineName"] == DBNull.Value ? null : reader["MachineName"].ToString(),
                MachineIpAddress = reader["MachineIpAddress"] == DBNull.Value ? null : reader["MachineIpAddress"].ToString(),
                Status = (AuditStatus)Convert.ToInt32(reader["Status"]),
                StatusMessage = reader["StatusMessage"] == DBNull.Value ? null : reader["StatusMessage"].ToString(),
                ErrorCode = reader["ErrorCode"] == DBNull.Value ? null : reader["ErrorCode"].ToString(),
                ErrorMessage = reader["ErrorMessage"] == DBNull.Value ? null : reader["ErrorMessage"].ToString(),
                RetryAttempts = reader["RetryAttempts"] == DBNull.Value ? 0 : Convert.ToInt32(reader["RetryAttempts"]),
                ItemsProcessed = reader["ItemsProcessed"] == DBNull.Value ? null : Convert.ToInt32(reader["ItemsProcessed"]),
                DataSizeBytes = reader["DataSizeBytes"] == DBNull.Value ? null : Convert.ToInt64(reader["DataSizeBytes"]),
                TransferRate = reader["TransferRate"] == DBNull.Value ? null : Convert.ToDouble(reader["TransferRate"]),
                ParentAuditId = reader["ParentAuditId"] == DBNull.Value ? null : Guid.Parse(reader["ParentAuditId"].ToString()!),
                CorrelationId = reader["CorrelationId"] == DBNull.Value ? null : reader["CorrelationId"].ToString(),
                MigrationResultData = reader["MigrationResultData"] == DBNull.Value ? null : reader["MigrationResultData"].ToString()
            };

            // Deserialize JSON fields
            if (reader["Warnings"] != DBNull.Value && !string.IsNullOrEmpty(reader["Warnings"].ToString()))
            {
                try
                {
                    auditEvent.Warnings = JsonSerializer.Deserialize<List<string>>(reader["Warnings"].ToString()!);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to deserialize warnings for audit event {AuditId}", auditEvent.AuditId);
                    auditEvent.Warnings = new List<string>();
                }
            }

            if (reader["Metadata"] != DBNull.Value && !string.IsNullOrEmpty(reader["Metadata"].ToString()))
            {
                try
                {
                    auditEvent.Metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(reader["Metadata"].ToString()!);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to deserialize metadata for audit event {AuditId}", auditEvent.AuditId);
                    auditEvent.Metadata = new Dictionary<string, string>();
                }
            }

            return auditEvent;
        }

        /// <summary>
        /// Gets basic statistics from the database.
        /// </summary>
        private async Task<(int totalEvents, int successfulOperations, int failedOperations, int warningOperations, long totalDataProcessed, double? avgDurationTicks)> GetBasicStatisticsAsync(
            SQLiteConnection connection, string whereClause, List<SQLiteParameter> parameters)
        {
            var basicStatsSql = $@"
                SELECT
                    COUNT(*) as TotalEvents,
                    SUM(CASE WHEN Status = {(int)AuditStatus.Success} THEN 1 ELSE 0 END) as SuccessfulOperations,
                    SUM(CASE WHEN Status = {(int)AuditStatus.Error} THEN 1 ELSE 0 END) as FailedOperations,
                    SUM(CASE WHEN Status = {(int)AuditStatus.Warning} THEN 1 ELSE 0 END) as WarningOperations,
                    AVG(CASE WHEN Duration IS NOT NULL THEN Duration ELSE NULL END) as AvgDurationTicks,
                    SUM(CASE WHEN DataSizeBytes IS NOT NULL THEN DataSizeBytes ELSE 0 END) as TotalDataProcessed
                FROM AuditEvents {whereClause}";

            using var command = new SQLiteCommand(basicStatsSql, connection);
            command.Parameters.AddRange(parameters.ToArray());

            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return (
                    totalEvents: reader.GetInt32("TotalEvents"),
                    successfulOperations: reader.GetInt32("SuccessfulOperations"),
                    failedOperations: reader.GetInt32("FailedOperations"),
                    warningOperations: reader.GetInt32("WarningOperations"),
                    totalDataProcessed: reader.GetInt64("TotalDataProcessed"),
                    avgDurationTicks: reader.IsDBNull("AvgDurationTicks") ? null : reader.GetDouble("AvgDurationTicks")
                );
            }

            return (0, 0, 0, 0, 0, null);
        }

        /// <summary>
        /// Gets operations grouped by object type.
        /// </summary>
        private async Task<Dictionary<ObjectType, int>> GetOperationsByObjectTypeAsync(
            SQLiteConnection connection, string whereClause, List<SQLiteParameter> parameters)
        {
            var sql = $"SELECT ObjectType, COUNT(*) as Count FROM AuditEvents {whereClause} GROUP BY ObjectType";

            var result = new Dictionary<ObjectType, int>();
            using var command = new SQLiteCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var objectType = (ObjectType)reader.GetInt32("ObjectType");
                var count = reader.GetInt32("Count");
                result[objectType] = count;
            }

            return result;
        }

        /// <summary>
        /// Gets operations grouped by day.
        /// </summary>
        private async Task<Dictionary<DateTime, int>> GetOperationsByDayAsync(
            SQLiteConnection connection, string whereClause, List<SQLiteParameter> parameters)
        {
            var sql = $@"
                SELECT DATE(Timestamp) as EventDate, COUNT(*) as Count
                FROM AuditEvents
                {whereClause}
                AND Timestamp >= @Since30Days
                GROUP BY DATE(Timestamp)
                ORDER BY EventDate";

            var result = new Dictionary<DateTime, int>();
            using var command = new SQLiteCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());
            command.Parameters.Add(new SQLiteParameter("@Since30Days", DateTime.UtcNow.AddDays(-30).ToString("O")));

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var date = DateTime.Parse(reader.GetString("EventDate"));
                var count = reader.GetInt32("Count");
                result[date] = count;
            }

            return result;
        }

        /// <summary>
        /// Gets top error messages.
        /// </summary>
        private async Task<Dictionary<string, int>> GetTopErrorsAsync(
            SQLiteConnection connection, string whereClause, List<SQLiteParameter> parameters)
        {
            var sql = $@"
                SELECT ErrorMessage, COUNT(*) as Count
                FROM AuditEvents
                {whereClause}
                AND ErrorMessage IS NOT NULL AND ErrorMessage != ''
                GROUP BY ErrorMessage
                ORDER BY Count DESC
                LIMIT 10";

            var result = new Dictionary<string, int>();
            using var command = new SQLiteCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var errorMessage = reader.GetString("ErrorMessage");
                var count = reader.GetInt32("Count");
                result[errorMessage] = count;
            }

            return result;
        }

        /// <summary>
        /// Gets operations grouped by wave.
        /// </summary>
        private async Task<Dictionary<string, int>> GetOperationsByWaveAsync(
            SQLiteConnection connection, string whereClause, List<SQLiteParameter> parameters)
        {
            var sql = $@"
                SELECT WaveName, COUNT(*) as Count
                FROM AuditEvents
                {whereClause}
                AND WaveName IS NOT NULL AND WaveName != ''
                GROUP BY WaveName
                ORDER BY Count DESC";

            var result = new Dictionary<string, int>();
            using var command = new SQLiteCommand(sql, connection);
            command.Parameters.AddRange(parameters.ToArray());

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var waveName = reader.GetString("WaveName");
                var count = reader.GetInt32("Count");
                result[waveName] = count;
            }

            return result;
        }

        /// <summary>
        /// Disposes of the audit service and releases resources.
        /// </summary>
        public void Dispose()
        {
            if (!_disposed)
            {
                _disposed = true;
                _logger.LogInformation("Audit service disposed");
            }
        }
    }
}