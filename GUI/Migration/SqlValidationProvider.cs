using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Validates SQL database migrations and provides rollback functionality.
    /// </summary>
    public class SqlValidationProvider : ISqlValidationProvider
    {
        private readonly string? _sourceConnectionString;
        private readonly string? _targetConnectionString;

        public string ObjectType => "Database";
        public bool SupportsRollback => true;

        public SqlValidationProvider(string? sourceConnectionString = null, string? targetConnectionString = null)
        {
            _sourceConnectionString = sourceConnectionString;
            _targetConnectionString = targetConnectionString;
        }

        public async Task<ValidationResult> ValidateSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Validating database {database.Name}",
                StatusMessage = "Checking database existence, consistency, and data integrity"
            });

            var issues = new List<ValidationIssue>();

            try
            {
                // Validate target database exists
                await ValidateDatabaseExistence(database, target, issues);

                // Validate database consistency
                await ValidateDatabaseConsistency(database, target, issues, progress);

                // Validate schema structure
                await ValidateSchemaStructure(database, target, issues);

                // Validate data integrity
                await ValidateDataIntegrity(database, target, issues, progress);

                // Validate security and permissions
                await ValidateSecuritySettings(database, target, issues);

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Validation complete for {database.Name}",
                    StatusMessage = $"Found {issues.Count} validation issues",
                    PercentageComplete = 100
                });

                var severity = DetermineSeverity(issues);
                var message = issues.Count == 0
                    ? "Database validation passed successfully"
                    : $"Database validation completed with {issues.Count} issues";

                return new ValidationResult
                {
                    ValidatedObject = database,
                    ObjectType = ObjectType,
                    ObjectName = database.Name,
                    Severity = severity,
                    Message = message,
                    Issues = { issues }
                };
            }
            catch (Exception ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Critical,
                    Category = "System Error",
                    Description = $"Failed to validate database: {ex.Message}",
                    RecommendedAction = "Check database connectivity and permissions",
                    TechnicalDetails = ex.ToString()
                });

                return ValidationResult.Failed(database, ObjectType, database.Name,
                    "Database validation failed due to system error", issues);
            }
        }

        private async Task ValidateDatabaseExistence(DatabaseDto database, TargetContext target, List<ValidationIssue> issues)
        {
            if (string.IsNullOrEmpty(_targetConnectionString))
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Configuration",
                    Description = "Target connection string not configured - cannot verify database existence",
                    RecommendedAction = "Configure target database connection string for validation"
                });
                return;
            }

            try
            {
                using var connection = new SqlConnection(_targetConnectionString);
                await connection.OpenAsync();

                var query = "SELECT database_id FROM sys.databases WHERE name = @DatabaseName";
                using var command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@DatabaseName", database.Name);

                var result = await command.ExecuteScalarAsync();
                
                if (result == null)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Database Existence",
                        Description = $"Database '{database.Name}' not found in target environment",
                        RecommendedAction = "Verify database migration completed successfully"
                    });
                }
            }
            catch (SqlException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Error,
                    Category = "Database Connectivity",
                    Description = $"Cannot connect to target database: {ex.Message}",
                    RecommendedAction = "Check target database server connectivity and credentials"
                });
            }
        }

        private async Task ValidateDatabaseConsistency(DatabaseDto database, TargetContext target, List<ValidationIssue> issues, IProgress<ValidationProgress>? progress)
        {
            if (string.IsNullOrEmpty(_targetConnectionString)) return;

            try
            {
                progress?.Report(new ValidationProgress
                {
                    CurrentStep = "Running DBCC CHECKDB",
                    StatusMessage = "Checking database consistency and integrity",
                    PercentageComplete = 25
                });

                using var connection = new SqlConnection(_targetConnectionString);
                await connection.OpenAsync();

                // Change to the target database
                var useDbQuery = $"USE [{database.Name}]";
                using var useDbCommand = new SqlCommand(useDbQuery, connection);
                await useDbCommand.ExecuteNonQueryAsync();

                // Run DBCC CHECKDB
                var checkQuery = $"DBCC CHECKDB('{database.Name}') WITH NO_INFOMSGS";
                using var checkCommand = new SqlCommand(checkQuery, connection);
                checkCommand.CommandTimeout = 300; // 5 minutes timeout

                using var reader = await checkCommand.ExecuteReaderAsync();
                var hasErrors = false;
                var errorMessages = new List<string>();

                while (await reader.ReadAsync())
                {
                    // DBCC CHECKDB returns results - parse for errors
                    var message = reader.GetString(0);
                    if (message.Contains("error", StringComparison.OrdinalIgnoreCase) ||
                        message.Contains("corruption", StringComparison.OrdinalIgnoreCase))
                    {
                        hasErrors = true;
                        errorMessages.Add(message);
                    }
                }

                if (hasErrors)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Critical,
                        Category = "Database Consistency",
                        Description = "Database consistency check failed",
                        RecommendedAction = "Run database repair operations and consider re-migration",
                        TechnicalDetails = string.Join("\n", errorMessages)
                    });
                }
            }
            catch (SqlException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Consistency Check",
                    Description = $"Could not run consistency check: {ex.Message}",
                    RecommendedAction = "Manually run DBCC CHECKDB to verify database integrity"
                });
            }
        }

        private async Task ValidateSchemaStructure(DatabaseDto database, TargetContext target, List<ValidationIssue> issues)
        {
            if (string.IsNullOrEmpty(_sourceConnectionString) || string.IsNullOrEmpty(_targetConnectionString))
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Configuration",
                    Description = "Source or target connection string missing - cannot compare schema structure",
                    RecommendedAction = "Configure both source and target connection strings for schema validation"
                });
                return;
            }

            try
            {
                var sourceSchema = await GetSchemaInfo(_sourceConnectionString, database.Name);
                var targetSchema = await GetSchemaInfo(_targetConnectionString, database.Name);

                // Compare table counts
                if (sourceSchema.TableCount != targetSchema.TableCount)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Schema Structure",
                        Description = $"Table count mismatch - Source: {sourceSchema.TableCount}, Target: {targetSchema.TableCount}",
                        RecommendedAction = "Verify all tables were migrated successfully"
                    });
                }

                // Compare view counts
                if (sourceSchema.ViewCount != targetSchema.ViewCount)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Schema Structure",
                        Description = $"View count mismatch - Source: {sourceSchema.ViewCount}, Target: {targetSchema.ViewCount}",
                        RecommendedAction = "Verify all views were migrated successfully"
                    });
                }

                // Compare stored procedure counts
                if (sourceSchema.ProcedureCount != targetSchema.ProcedureCount)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Schema Structure",
                        Description = $"Stored procedure count mismatch - Source: {sourceSchema.ProcedureCount}, Target: {targetSchema.ProcedureCount}",
                        RecommendedAction = "Verify all stored procedures were migrated successfully"
                    });
                }
            }
            catch (SqlException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Schema Validation",
                    Description = $"Could not validate schema structure: {ex.Message}",
                    RecommendedAction = "Manually compare database schemas between source and target"
                });
            }
        }

        private async Task<SchemaInfo> GetSchemaInfo(string connectionString, string databaseName)
        {
            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var useDbQuery = $"USE [{databaseName}]";
            using var useDbCommand = new SqlCommand(useDbQuery, connection);
            await useDbCommand.ExecuteNonQueryAsync();

            var schema = new SchemaInfo();

            // Get table count
            var tableQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
            using var tableCommand = new SqlCommand(tableQuery, connection);
            schema.TableCount = (int)await tableCommand.ExecuteScalarAsync();

            // Get view count
            var viewQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS";
            using var viewCommand = new SqlCommand(viewQuery, connection);
            schema.ViewCount = (int)await viewCommand.ExecuteScalarAsync();

            // Get stored procedure count
            var procQuery = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE'";
            using var procCommand = new SqlCommand(procQuery, connection);
            schema.ProcedureCount = (int)await procCommand.ExecuteScalarAsync();

            return schema;
        }

        private class SchemaInfo
        {
            public int TableCount { get; set; }
            public int ViewCount { get; set; }
            public int ProcedureCount { get; set; }
        }

        private async Task ValidateDataIntegrity(DatabaseDto database, TargetContext target, List<ValidationIssue> issues, IProgress<ValidationProgress>? progress)
        {
            if (string.IsNullOrEmpty(_sourceConnectionString) || string.IsNullOrEmpty(_targetConnectionString))
                return;

            try
            {
                progress?.Report(new ValidationProgress
                {
                    CurrentStep = "Validating data integrity",
                    StatusMessage = "Comparing row counts between source and target",
                    PercentageComplete = 60
                });

                var sourceRowCounts = await GetRowCounts(_sourceConnectionString, database.Name);
                var targetRowCounts = await GetRowCounts(_targetConnectionString, database.Name);

                var mismatchedTables = new List<string>();

                foreach (var sourceTable in sourceRowCounts)
                {
                    if (targetRowCounts.TryGetValue(sourceTable.Key, out var targetCount))
                    {
                        if (sourceTable.Value != targetCount)
                        {
                            mismatchedTables.Add($"{sourceTable.Key} (Source: {sourceTable.Value}, Target: {targetCount})");
                        }
                    }
                    else
                    {
                        mismatchedTables.Add($"{sourceTable.Key} (Missing in target)");
                    }
                }

                if (mismatchedTables.Any())
                {
                    var sampleMismatches = string.Join(", ", mismatchedTables.Take(5));
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = $"{mismatchedTables.Count} tables have row count mismatches. Sample: {sampleMismatches}",
                        RecommendedAction = "Verify data migration completed successfully and re-sync affected tables"
                    });
                }
            }
            catch (SqlException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Data Validation",
                    Description = $"Could not validate data integrity: {ex.Message}",
                    RecommendedAction = "Manually verify data completeness between source and target"
                });
            }
        }

        private async Task<Dictionary<string, int>> GetRowCounts(string connectionString, string databaseName)
        {
            var rowCounts = new Dictionary<string, int>();

            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var useDbQuery = $"USE [{databaseName}]";
            using var useDbCommand = new SqlCommand(useDbQuery, connection);
            await useDbCommand.ExecuteNonQueryAsync();

            // Get all table names
            var tablesQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
            using var tablesCommand = new SqlCommand(tablesQuery, connection);
            using var tablesReader = await tablesCommand.ExecuteReaderAsync();

            var tableNames = new List<string>();
            while (await tablesReader.ReadAsync())
            {
                tableNames.Add(tablesReader.GetString(0));
            }
            tablesReader.Close();

            // Get row count for each table
            foreach (var tableName in tableNames)
            {
                try
                {
                    var countQuery = $"SELECT COUNT(*) FROM [{tableName}]";
                    using var countCommand = new SqlCommand(countQuery, connection);
                    var count = (int)await countCommand.ExecuteScalarAsync();
                    rowCounts[tableName] = count;
                }
                catch (SqlException)
                {
                    // Skip tables that can't be counted (permissions, etc.)
                    rowCounts[tableName] = -1;
                }
            }

            return rowCounts;
        }

        private async Task ValidateSecuritySettings(DatabaseDto database, TargetContext target, List<ValidationIssue> issues)
        {
            if (string.IsNullOrEmpty(_targetConnectionString)) return;

            try
            {
                using var connection = new SqlConnection(_targetConnectionString);
                await connection.OpenAsync();

                var useDbQuery = $"USE [{database.Name}]";
                using var useDbCommand = new SqlCommand(useDbQuery, connection);
                await useDbCommand.ExecuteNonQueryAsync();

                // Check database users
                var usersQuery = "SELECT COUNT(*) FROM sys.database_principals WHERE type IN ('S', 'U', 'G')";
                using var usersCommand = new SqlCommand(usersQuery, connection);
                var userCount = (int)await usersCommand.ExecuteScalarAsync();

                if (userCount == 0)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Database Security",
                        Description = "No database users found - security settings may not be migrated",
                        RecommendedAction = "Verify database users and permissions are properly configured"
                    });
                }

                // Check database roles
                var rolesQuery = "SELECT COUNT(*) FROM sys.database_role_members";
                using var rolesCommand = new SqlCommand(rolesQuery, connection);
                var roleCount = (int)await rolesCommand.ExecuteScalarAsync();

                if (roleCount == 0)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Database Security",
                        Description = "No role memberships found - review security configuration",
                        RecommendedAction = "Configure appropriate database role memberships"
                    });
                }
            }
            catch (SqlException ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Security Validation",
                    Description = $"Could not validate security settings: {ex.Message}",
                    RecommendedAction = "Manually verify database security configuration"
                });
            }
        }

        private ValidationSeverity DetermineSeverity(List<ValidationIssue> issues)
        {
            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Critical)
                    return ValidationSeverity.Critical;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Error)
                    return ValidationSeverity.Error;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Warning)
                    return ValidationSeverity.Warning;
            }

            return ValidationSeverity.Success;
        }

        public async Task<RollbackResult> RollbackSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Rolling back database {database.Name}",
                StatusMessage = "Dropping target database and cleaning up"
            });

            var errors = new List<string>();
            var warnings = new List<string>();

            try
            {
                if (string.IsNullOrEmpty(_targetConnectionString))
                {
                    errors.Add("Target connection string not configured - cannot perform rollback");
                    return RollbackResult.Failed("Rollback failed due to missing connection string", errors);
                }

                using var connection = new SqlConnection(_targetConnectionString);
                await connection.OpenAsync();

                // First, force close any active connections to the database
                var killConnectionsQuery = $@"
                    ALTER DATABASE [{database.Name}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    DROP DATABASE [{database.Name}];";

                using var rollbackCommand = new SqlCommand(killConnectionsQuery, connection);
                rollbackCommand.CommandTimeout = 300; // 5 minutes timeout

                await rollbackCommand.ExecuteNonQueryAsync();

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Rollback complete for {database.Name}",
                    StatusMessage = "Target database dropped successfully",
                    PercentageComplete = 100
                });

                warnings.Add("Database rollback is irreversible - ensure source database is available");
                warnings.Add("Any connections to the target database have been forcibly terminated");

                return new RollbackResult
                {
                    Success = true,
                    Message = "Database rollback completed successfully",
                    Warnings = warnings
                };
            }
            catch (SqlException ex)
            {
                errors.Add($"SQL error during rollback: {ex.Message}");
                return RollbackResult.Failed($"Database rollback failed: {ex.Message}", errors);
            }
            catch (Exception ex)
            {
                errors.Add($"Unexpected error during rollback: {ex.Message}");
                return RollbackResult.Failed($"Database rollback failed: {ex.Message}", errors);
            }
        }
    }
}