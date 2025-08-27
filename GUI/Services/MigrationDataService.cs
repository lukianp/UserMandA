using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Comprehensive service for managing migration data with validation and progress tracking
    /// </summary>
    public class MigrationDataService
    {
        private readonly CsvDataServiceNew _csvDataService;
        private readonly CsvValidationService _validationService;
        private readonly ILogger<MigrationDataService> _logger;
        
        public event EventHandler<MigrationDataProgressEventArgs> DataLoadProgress;
        public event EventHandler<ValidationProgressEventArgs> ValidationProgress;

        public MigrationDataService(
            CsvDataServiceNew csvDataService = null,
            CsvValidationService validationService = null,
            ILogger<MigrationDataService> logger = null)
        {
            _csvDataService = csvDataService ?? new CsvDataServiceNew(null);
            _validationService = validationService ?? new CsvValidationService(null);
            _logger = logger;

            // Forward validation events
            _validationService.ValidationProgress += (sender, args) => ValidationProgress?.Invoke(sender, args);
        }

        /// <summary>
        /// Load and validate migration items with comprehensive error handling
        /// </summary>
        public async Task<MigrationDataLoadResult<MigrationItem>> LoadMigrationItemsAsync(
            string profileName, 
            bool validateData = true, 
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationDataLoadResult<MigrationItem>();
            
            try
            {
                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Loading CSV Files",
                    ProgressPercentage = 10
                });

                // Load data from CSV files
                var loadResult = await _csvDataService.LoadMigrationItemsAsync(profileName, cancellationToken);
                result.Data = loadResult.Data;
                result.LoadWarnings.AddRange(loadResult.HeaderWarnings);

                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Data Loaded",
                    ProgressPercentage = 50,
                    RecordsLoaded = result.Data.Count
                });

                if (validateData && result.Data.Any())
                {
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Validating Migration Items",
                        ProgressPercentage = 75
                    });

                    // Validate business logic
                    var validationResult = _validationService.ValidateMigrationItems(result.Data);
                    result.ValidationErrors.AddRange(validationResult.Errors);
                    result.ValidationWarnings.AddRange(validationResult.Warnings);
                    result.IsValid = validationResult.IsValid;
                }

                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Complete",
                    ProgressPercentage = 100,
                    RecordsLoaded = result.Data.Count,
                    ValidationErrors = result.ValidationErrors.Count,
                    ValidationWarnings = result.ValidationWarnings.Count
                });

                result.IsSuccess = loadResult.IsSuccess;
                _logger?.LogInformation($"Migration items loaded successfully: {result.Data.Count} items, Valid: {result.IsValid}");
                
                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ValidationErrors.Add($"Critical error loading migration items: {ex.Message}");
                _logger?.LogError(ex, "Critical error in LoadMigrationItemsAsync");
                return result;
            }
        }

        /// <summary>
        /// Load and validate migration batches with comprehensive error handling
        /// </summary>
        public async Task<MigrationDataLoadResult<MigrationBatch>> LoadMigrationBatchesAsync(
            string profileName,
            bool validateData = true,
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationDataLoadResult<MigrationBatch>();

            try
            {
                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Loading Batch CSV Files",
                    ProgressPercentage = 10
                });

                // Load data from CSV files
                var loadResult = await _csvDataService.LoadMigrationBatchesAsync(profileName, cancellationToken);
                result.Data = loadResult.Data;
                result.LoadWarnings.AddRange(loadResult.HeaderWarnings);

                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Batch Data Loaded",
                    ProgressPercentage = 50,
                    RecordsLoaded = result.Data.Count
                });

                if (validateData && result.Data.Any())
                {
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Validating Migration Batches",
                        ProgressPercentage = 75
                    });

                    // Basic validation for batches
                    foreach (var batch in result.Data)
                    {
                        if (string.IsNullOrWhiteSpace(batch.Name))
                        {
                            result.ValidationErrors.Add("Migration batch missing required Name field");
                        }

                        if (batch.PlannedStartDate.HasValue && batch.PlannedEndDate.HasValue &&
                            batch.PlannedStartDate >= batch.PlannedEndDate)
                        {
                            result.ValidationWarnings.Add($"Batch '{batch.Name}': Planned end date is before or equal to start date");
                        }
                    }

                    result.IsValid = result.ValidationErrors.Count == 0;
                }

                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Complete",
                    ProgressPercentage = 100,
                    RecordsLoaded = result.Data.Count,
                    ValidationErrors = result.ValidationErrors.Count,
                    ValidationWarnings = result.ValidationWarnings.Count
                });

                result.IsSuccess = loadResult.IsSuccess;
                _logger?.LogInformation($"Migration batches loaded successfully: {result.Data.Count} batches, Valid: {result.IsValid}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ValidationErrors.Add($"Critical error loading migration batches: {ex.Message}");
                _logger?.LogError(ex, "Critical error in LoadMigrationBatchesAsync");
                return result;
            }
        }

        /// <summary>
        /// Load comprehensive discovery data (users, groups, infrastructure) for migration planning
        /// </summary>
        public async Task<ComprehensiveDataLoadResult> LoadDiscoveryDataAsync(
            string profileName,
            bool loadUsers = true,
            bool loadGroups = true,
            bool loadInfrastructure = true,
            bool loadApplications = true,
            CancellationToken cancellationToken = default)
        {
            var result = new ComprehensiveDataLoadResult();
            var totalSteps = (loadUsers ? 1 : 0) + (loadGroups ? 1 : 0) + (loadInfrastructure ? 1 : 0) + (loadApplications ? 1 : 0);
            var currentStep = 0;

            try
            {
                if (loadUsers)
                {
                    currentStep++;
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Loading Users",
                        ProgressPercentage = (double)currentStep / totalSteps * 100
                    });

                    var usersResult = await _csvDataService.LoadUsersAsync(profileName);
                    result.Users = usersResult.Data;
                    result.LoadWarnings.AddRange(usersResult.HeaderWarnings);
                    result.UsersLoaded = usersResult.Data.Count;
                }

                if (loadGroups)
                {
                    currentStep++;
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Loading Groups",
                        ProgressPercentage = (double)currentStep / totalSteps * 100
                    });

                    var groupsResult = await _csvDataService.LoadGroupsAsync(profileName);
                    result.Groups = groupsResult.Data;
                    result.LoadWarnings.AddRange(groupsResult.HeaderWarnings);
                    result.GroupsLoaded = groupsResult.Data.Count;
                }

                if (loadInfrastructure)
                {
                    currentStep++;
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Loading Infrastructure",
                        ProgressPercentage = (double)currentStep / totalSteps * 100
                    });

                    var infraResult = await _csvDataService.LoadInfrastructureAsync(profileName);
                    result.Infrastructure = infraResult.Data;
                    result.LoadWarnings.AddRange(infraResult.HeaderWarnings);
                    result.InfrastructureLoaded = infraResult.Data.Count;
                }

                if (loadApplications)
                {
                    currentStep++;
                    OnDataLoadProgress(new MigrationDataProgressEventArgs
                    {
                        Stage = "Loading Applications",
                        ProgressPercentage = (double)currentStep / totalSteps * 100
                    });

                    var appsResult = await _csvDataService.LoadApplicationsAsync(profileName);
                    result.Applications = appsResult.Data;
                    result.LoadWarnings.AddRange(appsResult.HeaderWarnings);
                    result.ApplicationsLoaded = appsResult.Data.Count;
                }

                OnDataLoadProgress(new MigrationDataProgressEventArgs
                {
                    Stage = "Discovery Data Load Complete",
                    ProgressPercentage = 100,
                    RecordsLoaded = result.UsersLoaded + result.GroupsLoaded + result.InfrastructureLoaded + result.ApplicationsLoaded
                });

                result.IsSuccess = true;
                _logger?.LogInformation($"Discovery data loaded: Users={result.UsersLoaded}, Groups={result.GroupsLoaded}, Infrastructure={result.InfrastructureLoaded}, Applications={result.ApplicationsLoaded}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.LoadWarnings.Add($"Critical error loading discovery data: {ex.Message}");
                _logger?.LogError(ex, "Critical error in LoadDiscoveryDataAsync");
                return result;
            }
        }

        /// <summary>
        /// Generate migration items from discovery data using intelligent mapping
        /// </summary>
        public List<MigrationItem> GenerateMigrationItemsFromDiscovery(
            ComprehensiveDataLoadResult discoveryData,
            MigrationGenerationOptions options = null)
        {
            options = options ?? new MigrationGenerationOptions();
            var items = new List<MigrationItem>();

            try
            {
                // Generate user migration items
                if (options.IncludeUsers && discoveryData.Users?.Any() == true)
                {
                    foreach (var user in discoveryData.Users)
                    {
                        var item = new MigrationItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            Type = MigrationType.User,
                            SourceIdentity = user.UserPrincipalName ?? user.SamAccountName,
                            TargetIdentity = MapTargetIdentity(user.UserPrincipalName, options.TargetDomain),
                            DisplayName = user.DisplayName,
                            Status = MigrationStatus.NotStarted,
                            Priority = DeterminePriority(user),
                            Complexity = DetermineComplexity(user),
                            EstimatedDuration = TimeSpan.FromHours(0.5), // Default user migration time
                            IsValidationRequired = true,
                            SupportsRollback = true,
                            AllowConcurrentMigration = true
                        };
                        items.Add(item);
                    }
                }

                // Generate mailbox migration items (if users have mailboxes)
                if (options.IncludeMailboxes && discoveryData.Users?.Any() == true)
                {
                    foreach (var user in discoveryData.Users.Where(u => !string.IsNullOrWhiteSpace(u.Mail)))
                    {
                        var item = new MigrationItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            Type = MigrationType.Mailbox,
                            SourceIdentity = user.Mail,
                            TargetIdentity = MapTargetIdentity(user.Mail, options.TargetDomain),
                            DisplayName = $"{user.DisplayName} - Mailbox",
                            Status = MigrationStatus.NotStarted,
                            Priority = MigrationPriority.High, // Mailboxes are typically high priority
                            Complexity = MigrationComplexity.Moderate,
                            EstimatedDuration = TimeSpan.FromHours(2), // Default mailbox migration time
                            IsValidationRequired = true,
                            SupportsRollback = false, // Mailbox migrations typically don't support easy rollback
                            AllowConcurrentMigration = false // Mailbox migrations often need to be sequential
                        };
                        items.Add(item);
                    }
                }

                // Generate group migration items
                if (options.IncludeGroups && discoveryData.Groups?.Any() == true)
                {
                    foreach (var group in discoveryData.Groups)
                    {
                        var item = new MigrationItem
                        {
                            Id = Guid.NewGuid().ToString(),
                            Type = group.MailEnabled == true ? MigrationType.DistributionList : MigrationType.SecurityGroup,
                            SourceIdentity = group.DisplayName,
                            TargetIdentity = MapTargetIdentity(group.DisplayName, options.TargetDomain),
                            DisplayName = group.DisplayName,
                            Status = MigrationStatus.NotStarted,
                            Priority = MigrationPriority.Normal,
                            Complexity = MigrationComplexity.Simple,
                            EstimatedDuration = TimeSpan.FromMinutes(15),
                            IsValidationRequired = true,
                            SupportsRollback = true,
                            AllowConcurrentMigration = true
                        };
                        items.Add(item);
                    }
                }

                _logger?.LogInformation($"Generated {items.Count} migration items from discovery data");
                return items;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error generating migration items from discovery data");
                return items;
            }
        }

        private string MapTargetIdentity(string sourceIdentity, string targetDomain)
        {
            if (string.IsNullOrWhiteSpace(sourceIdentity) || string.IsNullOrWhiteSpace(targetDomain))
                return sourceIdentity;

            // Simple domain mapping - replace domain part
            if (sourceIdentity.Contains("@"))
            {
                var localPart = sourceIdentity.Split('@')[0];
                return $"{localPart}@{targetDomain}";
            }

            return sourceIdentity;
        }

        private MigrationPriority DeterminePriority(UserData user)
        {
            // Business logic for determining migration priority
            if (user.JobTitle?.ToLowerInvariant().Contains("manager") == true ||
                user.JobTitle?.ToLowerInvariant().Contains("director") == true ||
                user.JobTitle?.ToLowerInvariant().Contains("executive") == true)
            {
                return MigrationPriority.High;
            }

            if (user.AccountEnabled == false)
            {
                return MigrationPriority.Low;
            }

            return MigrationPriority.Normal;
        }

        private MigrationComplexity DetermineComplexity(UserData user)
        {
            // Simple complexity determination
            if (user.JobTitle?.ToLowerInvariant().Contains("admin") == true)
            {
                return MigrationComplexity.HighRisk; // Admin accounts need special handling
            }

            return MigrationComplexity.Simple;
        }

        protected virtual void OnDataLoadProgress(MigrationDataProgressEventArgs e)
        {
            DataLoadProgress?.Invoke(this, e);
        }
    }

    /// <summary>
    /// Result of migration data loading operation
    /// </summary>
    public class MigrationDataLoadResult<T>
    {
        public bool IsSuccess { get; set; }
        public bool IsValid { get; set; }
        public List<T> Data { get; set; } = new();
        public List<string> LoadWarnings { get; set; } = new();
        public List<string> ValidationErrors { get; set; } = new();
        public List<string> ValidationWarnings { get; set; } = new();
    }

    /// <summary>
    /// Result of comprehensive discovery data loading
    /// </summary>
    public class ComprehensiveDataLoadResult
    {
        public bool IsSuccess { get; set; }
        public List<UserData> Users { get; set; } = new();
        public List<GroupData> Groups { get; set; } = new();
        public List<InfrastructureData> Infrastructure { get; set; } = new();
        public List<ApplicationData> Applications { get; set; } = new();
        public List<string> LoadWarnings { get; set; } = new();
        
        public int UsersLoaded { get; set; }
        public int GroupsLoaded { get; set; }
        public int InfrastructureLoaded { get; set; }
        public int ApplicationsLoaded { get; set; }
    }

    /// <summary>
    /// Options for generating migration items from discovery data
    /// </summary>
    public class MigrationGenerationOptions
    {
        public bool IncludeUsers { get; set; } = true;
        public bool IncludeMailboxes { get; set; } = true;
        public bool IncludeGroups { get; set; } = true;
        public bool IncludeInfrastructure { get; set; } = false;
        public string TargetDomain { get; set; } = string.Empty;
    }

    /// <summary>
    /// Progress event arguments for migration data operations
    /// </summary>
    public class MigrationDataProgressEventArgs : EventArgs
    {
        public string Stage { get; set; } = string.Empty;
        public double ProgressPercentage { get; set; }
        public int RecordsLoaded { get; set; }
        public int ValidationErrors { get; set; }
        public int ValidationWarnings { get; set; }
    }
}