using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models.Migration;

namespace MandADiscoverySuite.Tests.Migration.ValidationProviders
{
    /// <summary>
    /// Comprehensive tests for SqlValidationProvider - validates database migrations including DBCC checks, schema validation, and rollback operations
    /// </summary>
    [TestClass]
    public class SqlValidationProviderTests
    {
        private SqlValidationProvider _sqlValidator;
        private Mock<ISqlConnectionService> _mockSqlService;
        private Mock<IDbccService> _mockDbccService;
        private Mock<ISchemaComparisonService> _mockSchemaService;
        private MandADiscoverySuite.Migration.TargetContext _testTargetContext;
        private MandADiscoverySuite.Models.Migration.DatabaseDto _testDatabase;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockSqlService = new Mock<ISqlConnectionService>();
            _mockDbccService = new Mock<IDbccService>();
            _mockSchemaService = new Mock<ISchemaComparisonService>();
            _auditRecords = new List<string>();

            _sqlValidator = new SqlValidationProvider();

            _testTargetContext = new MandADiscoverySuite.Migration.TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };

            _testDatabase = new DatabaseDto
            {
                Name = "ProductionDB",
                ServerName = "sql-target-01.contoso.com",
                SizeMB = 1024 * 1024 * 1024 * 5 / (1024 * 1024), // Convert bytes to MB
                CompatibilityLevel = "150",
                CollationName = "SQL_Latin1_General_CP1_CI_AS",
                RecoveryModel = "FULL"
            };
        }

        #region Database Existence Tests

        [TestMethod]
        public async Task ValidateSqlAsync_DatabaseExists_ReturnsSuccess()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });
            SetupDataConsistencyMock(new DataConsistencyResult { Success = true });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual(_testDatabase.Name, result.ObjectName);
            Assert.AreEqual(0, result.Issues.Count);
            RecordAuditEvent("Database validation passed", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_DatabaseNotFound_ReturnsError()
        {
            // Arrange
            SetupDatabaseExistsMock(false);

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Database Existence"));
            Assert.IsTrue(result.GetIssueByCategory("Database Existence").Description.Contains("not found"));
            RecordAuditEvent("Database validation failed - not found", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_ConnectionFailure_ReturnsError()
        {
            // Arrange
            _mockSqlService
                .Setup(sql => sql.TestConnectionAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ThrowsAsync(new Exception("Network-related or instance-specific error"));

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Connection"));
            Assert.IsTrue(result.GetIssueByCategory("Connection").Description.Contains("Network-related"));
            RecordAuditEvent("Database validation failed - connection error", _testDatabase.Name);
        }

        #endregion

        #region DBCC CHECKDB Tests

        [TestMethod]
        public async Task ValidateSqlAsync_DbccCheckDbSuccess_ReturnsSuccess()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult 
            { 
                Success = true, 
                Errors = new List<string>(),
                ExecutionTime = TimeSpan.FromMinutes(5),
                Message = "CHECKDB found 0 allocation errors and 0 consistency errors in database 'ProductionDB'."
            });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Data Consistency"));
            RecordAuditEvent("Database validation - DBCC CHECKDB passed", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_DbccCheckDbErrors_ReturnsError()
        {
            // Arrange
            var dbccErrors = new List<string>
            {
                "Page (1:256) could not be processed. See other errors for details.",
                "Table 'Customers' has 3 allocation errors and 2 consistency errors."
            };

            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult 
            { 
                Success = false, 
                Errors = dbccErrors,
                ExecutionTime = TimeSpan.FromMinutes(8),
                Message = "CHECKDB found 3 allocation errors and 2 consistency errors in database 'ProductionDB'."
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Data Consistency"));
            var issue = result.GetIssueByCategory("Data Consistency");
            Assert.IsTrue(issue.Description.Contains("3 allocation errors"));
            Assert.IsTrue(issue.Description.Contains("2 consistency errors"));
            RecordAuditEvent("Database validation failed - DBCC errors", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_DbccTimeoutError_ReturnsError()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            _mockDbccService
                .Setup(dbcc => dbcc.RunCheckDbAsync(_testDatabase.Name, _testDatabase.ServerName))
                .ThrowsAsync(new TimeoutException("DBCC CHECKDB operation timed out after 30 minutes"));

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Data Consistency"));
            Assert.IsTrue(result.GetIssueByCategory("Data Consistency").Description.Contains("timed out"));
            RecordAuditEvent("Database validation failed - DBCC timeout", _testDatabase.Name);
        }

        #endregion

        #region Schema Validation Tests

        [TestMethod]
        public async Task ValidateSqlAsync_SchemaMatch_ReturnsSuccess()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult 
            { 
                Match = true,
                SourceTables = 25,
                TargetTables = 25,
                SourceStoredProcedures = 15,
                TargetStoredProcedures = 15
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Schema Validation"));
            RecordAuditEvent("Database validation - schema matches", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_MissingTables_ReturnsError()
        {
            // Arrange
            var missingTables = new List<string> { "Customers", "Orders", "Products" };
            
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult 
            { 
                Match = false,
                SourceTables = 25,
                TargetTables = 22,
                MissingTables = missingTables,
                Differences = missingTables.Select(t => $"Table '{t}' not found in target database").ToList()
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Schema Validation"));
            var issue = result.GetIssueByCategory("Schema Validation");
            Assert.IsTrue(issue.Description.Contains("3 tables missing"));
            Assert.IsTrue(issue.TechnicalDetails.Contains("Customers"));
            RecordAuditEvent("Database validation failed - missing tables", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_MissingStoredProcedures_ReturnsWarning()
        {
            // Arrange
            var missingProcs = new List<string> { "sp_GetCustomerOrders", "sp_UpdateInventory" };
            
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult 
            { 
                Match = false,
                SourceStoredProcedures = 15,
                TargetStoredProcedures = 13,
                MissingStoredProcedures = missingProcs,
                Differences = missingProcs.Select(p => $"Stored procedure '{p}' not found in target database").ToList()
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("Schema Validation"));
            var issue = result.GetIssueByCategory("Schema Validation");
            Assert.IsTrue(issue.Description.Contains("stored procedures missing"));
            RecordAuditEvent("Database validation - missing stored procedures", _testDatabase.Name);
        }

        #endregion

        #region Data Consistency Tests

        [TestMethod]
        public async Task ValidateSqlAsync_DataConsistency_ValidatesRowCounts()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });
            SetupDataConsistencyMock(new DataConsistencyResult 
            { 
                Success = true,
                TableComparisons = new List<TableComparison>
                {
                    new TableComparison { TableName = "Customers", SourceRows = 1000, TargetRows = 1000, Match = true },
                    new TableComparison { TableName = "Orders", SourceRows = 5000, TargetRows = 5000, Match = true },
                    new TableComparison { TableName = "Products", SourceRows = 250, TargetRows = 250, Match = true }
                }
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Data Consistency"));
            RecordAuditEvent("Database validation - row counts match", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_RowCountMismatch_ReturnsError()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });
            SetupDataConsistencyMock(new DataConsistencyResult 
            { 
                Success = false,
                TableComparisons = new List<TableComparison>
                {
                    new TableComparison { TableName = "Customers", SourceRows = 1000, TargetRows = 995, Match = false },
                    new TableComparison { TableName = "Orders", SourceRows = 5000, TargetRows = 4980, Match = false }
                },
                Errors = new List<string>
                {
                    "Table 'Customers': Expected 1000 rows, found 995 rows (5 rows missing)",
                    "Table 'Orders': Expected 5000 rows, found 4980 rows (20 rows missing)"
                }
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Data Consistency"));
            var issue = result.GetIssueByCategory("Data Consistency");
            Assert.IsTrue(issue.Description.Contains("row count mismatches"));
            Assert.IsTrue(issue.TechnicalDetails.Contains("5 rows missing"));
            RecordAuditEvent("Database validation failed - row count mismatches", _testDatabase.Name);
        }

        #endregion

        #region Database Configuration Tests

        [TestMethod]
        public async Task ValidateSqlAsync_ConfigurationValidation_ChecksCompatibilityLevel()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDatabaseConfigurationMock(new DatabaseConfiguration
            {
                CompatibilityLevel = 140, // Different from expected 150
                Collation = _testDatabase.Collation,
                RecoveryModel = _testDatabase.RecoveryModel
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("Database Configuration"));
            var issue = result.GetIssueByCategory("Database Configuration");
            Assert.IsTrue(issue.Description.Contains("compatibility level"));
            RecordAuditEvent("Database validation - compatibility level mismatch", _testDatabase.Name);
        }

        [TestMethod]
        public async Task ValidateSqlAsync_CollationMismatch_ReturnsWarning()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDatabaseConfigurationMock(new DatabaseConfiguration
            {
                CompatibilityLevel = int.Parse(_testDatabase.CompatibilityLevel),
                Collation = "SQL_Latin1_General_CP1_CS_AS", // Case-sensitive, different from expected
                RecoveryModel = _testDatabase.RecoveryModel
            });

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("Database Configuration"));
            var issue = result.GetIssueByCategory("Database Configuration");
            Assert.IsTrue(issue.Description.Contains("collation"));
            RecordAuditEvent("Database validation - collation mismatch", _testDatabase.Name);
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task RollbackSqlAsync_Success_DropsDatabase()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            _mockSqlService
                .Setup(sql => sql.DropDatabaseAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ReturnsAsync(true);

            _mockSqlService
                .Setup(sql => sql.DatabaseExistsAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ReturnsAsync(false); // Confirmed deleted

            // Act
            var result = await _sqlValidator.RollbackSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(result.Message.Contains("successfully"));
            _mockSqlService.Verify(sql => sql.DropDatabaseAsync(_testDatabase.ServerName, _testDatabase.Name), Times.Once);
            RecordAuditEvent("Database rollback successful", _testDatabase.Name);
        }

        [TestMethod]
        public async Task RollbackSqlAsync_DatabaseInUse_ReturnsFailure()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            _mockSqlService
                .Setup(sql => sql.DropDatabaseAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ThrowsAsync(new SqlException("Cannot drop database because it is currently in use", new SqlError(547, (byte)1, (byte)1, "server", "Cannot drop database because it is currently in use", "", 1)));

            // Act
            var result = await _sqlValidator.RollbackSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("currently in use"));
            Assert.AreEqual(1, result.Errors.Count);
            RecordAuditEvent("Database rollback failed", _testDatabase.Name, errors: result.Errors);
        }

        [TestMethod]
        public async Task RollbackSqlAsync_ForceDropWithKillConnections_Success()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            
            _mockSqlService
                .SetupSequence(sql => sql.DropDatabaseAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ThrowsAsync(new SqlException("Cannot drop database because it is currently in use", new SqlError(547, (byte)1, (byte)1, "server", "Cannot drop database because it is currently in use", "", 1)))
                .ReturnsAsync(true); // Second attempt succeeds

            _mockSqlService
                .Setup(sql => sql.KillConnectionsAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ReturnsAsync(5); // Killed 5 connections

            // Act
            var result = await _sqlValidator.RollbackSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(1, result.Warnings.Count);
            Assert.IsTrue(result.Warnings[0].Contains("5 connections"));
            _mockSqlService.Verify(sql => sql.KillConnectionsAsync(_testDatabase.ServerName, _testDatabase.Name), Times.Once);
            RecordAuditEvent("Database rollback successful with force", _testDatabase.Name, warnings: result.Warnings);
        }

        [TestMethod]
        public async Task RollbackSqlAsync_DatabaseNotFound_ReturnsSuccess()
        {
            // Arrange
            SetupDatabaseExistsMock(false);

            // Act
            var result = await _sqlValidator.RollbackSqlAsync(_testDatabase, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(result.Message.Contains("already removed"));
            _mockSqlService.Verify(sql => sql.DropDatabaseAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            RecordAuditEvent("Database rollback - already removed", _testDatabase.Name);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task ValidateSqlAsync_LargeDatabase_HandlesPerformantly()
        {
            // Arrange
            var largeDatabase = new MandADiscoverySuite.Models.Migration.DatabaseDto
            {
                Name = "LargeProductionDB",
                ServerName = _testDatabase.ServerName,
                SizeMB = 1024L * 1024L * 1024L * 100, // 100 GB
                CompatibilityLevel = _testDatabase.CompatibilityLevel
            };

            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult 
            { 
                Success = true, 
                Errors = new List<string>(),
                ExecutionTime = TimeSpan.FromMinutes(45) // Longer execution time
            });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(largeDatabase, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 60000, "Large database validation should complete within 1 minute (excluding DBCC time)");
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            RecordAuditEvent("Large database validation completed", largeDatabase.Name, additionalInfo: $"Duration: {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Progress Reporting Tests

        [TestMethod]
        public async Task ValidateSqlAsync_WithProgressReporting_ReportsCorrectSteps()
        {
            // Arrange
            SetupDatabaseExistsMock(true);
            SetupDbccCheckDbMock(new DbccResult { Success = true, Errors = new List<string>() });
            SetupSchemaValidationMock(new SchemaComparisonResult { Match = true });
            SetupDataConsistencyMock(new DataConsistencyResult { Success = true });

            var progressReports = new List<ValidationProgress>();
            var progress = new Progress<ValidationProgress>(p => progressReports.Add(p));

            // Act
            var result = await _sqlValidator.ValidateSqlAsync(_testDatabase, _testTargetContext, progress);

            // Assert
            Assert.IsTrue(progressReports.Count >= 4); // Start, DBCC, Schema, Completion
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("Validating database")));
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("DBCC CHECKDB")));
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("schema")));
            Assert.IsTrue(progressReports.Any(p => p.PercentageComplete == 100));
            RecordAuditEvent("Database validation with progress tracking", _testDatabase.Name);
        }

        #endregion

        #region Helper Methods

        private void SetupDatabaseExistsMock(bool exists)
        {
            _mockSqlService
                .Setup(sql => sql.DatabaseExistsAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ReturnsAsync(exists);

            if (exists)
            {
                _mockSqlService
                    .Setup(sql => sql.TestConnectionAsync(_testDatabase.ServerName, _testDatabase.Name))
                    .Returns(Task.CompletedTask);
            }
        }

        private void SetupDbccCheckDbMock(DbccResult result)
        {
            _mockDbccService
                .Setup(dbcc => dbcc.RunCheckDbAsync(_testDatabase.Name, _testDatabase.ServerName))
                .ReturnsAsync(result);
        }

        private void SetupSchemaValidationMock(SchemaComparisonResult result)
        {
            _mockSchemaService
                .Setup(schema => schema.CompareSchemaAsync(_testDatabase.ServerName, _testDatabase.Name, It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(result);
        }

        private void SetupDataConsistencyMock(DataConsistencyResult result)
        {
            _mockSqlService
                .Setup(sql => sql.ValidateDataConsistencyAsync(_testDatabase.ServerName, _testDatabase.Name, It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(result);
        }

        private void SetupDatabaseConfigurationMock(DatabaseConfiguration config)
        {
            _mockSqlService
                .Setup(sql => sql.GetDatabaseConfigurationAsync(_testDatabase.ServerName, _testDatabase.Name))
                .ReturnsAsync(config);
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<string> errors = null, List<string> warnings = null, string additionalInfo = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";
            
            if (warnings?.Count > 0)
            {
                auditRecord += $" - Warnings: {warnings.Count}";
            }
            
            if (errors?.Count > 0)
            {
                auditRecord += $" - Errors: {errors.Count}";
            }

            if (!string.IsNullOrEmpty(additionalInfo))
            {
                auditRecord += $" - Info: {additionalInfo}";
            }

            _auditRecords.Add(auditRecord);
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for SQL validation operations");
            
            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"SQL_VALIDATION_AUDIT: {record}");
            }
        }
    }

    #region Test Support Classes

    public interface ISqlConnectionService
    {
        Task<bool> DatabaseExistsAsync(string server, string databaseName);
        Task TestConnectionAsync(string server, string databaseName);
        Task<bool> DropDatabaseAsync(string server, string databaseName);
        Task<int> KillConnectionsAsync(string server, string databaseName);
        Task<DataConsistencyResult> ValidateDataConsistencyAsync(string sourceServer, string sourceDatabase, string targetServer, string targetDatabase);
        Task<DatabaseConfiguration> GetDatabaseConfigurationAsync(string server, string databaseName);
    }

    public interface IDbccService
    {
        Task<DbccResult> RunCheckDbAsync(string databaseName, string server);
    }

    public interface ISchemaComparisonService
    {
        Task<SchemaComparisonResult> CompareSchemaAsync(string sourceServer, string sourceDatabase, string targetServer, string targetDatabase);
    }

    public class DbccResult
    {
        public bool Success { get; set; }
        public List<string> Errors { get; set; } = new();
        public string Message { get; set; } = string.Empty;
        public TimeSpan ExecutionTime { get; set; }
    }

    public class SchemaComparisonResult
    {
        public bool Match { get; set; }
        public int SourceTables { get; set; }
        public int TargetTables { get; set; }
        public int SourceStoredProcedures { get; set; }
        public int TargetStoredProcedures { get; set; }
        public List<string> MissingTables { get; set; } = new();
        public List<string> MissingStoredProcedures { get; set; } = new();
        public List<string> Differences { get; set; } = new();
    }

    public class DataConsistencyResult
    {
        public bool Success { get; set; }
        public List<TableComparison> TableComparisons { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class TableComparison
    {
        public string TableName { get; set; } = string.Empty;
        public long SourceRows { get; set; }
        public long TargetRows { get; set; }
        public bool Match { get; set; }
    }

    public class DatabaseConfiguration
    {
        public int CompatibilityLevel { get; set; }
        public string Collation { get; set; } = string.Empty;
        public string RecoveryModel { get; set; } = string.Empty;
    }

    #endregion
}