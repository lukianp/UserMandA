using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Production service for pre-migration validation and object mapping
    /// Converted from PreMigrationCheckFunctionalTests.cs
    /// </summary>
    public class PreMigrationValidationService : IPreMigrationValidationService
    {
        private readonly ILogger<PreMigrationValidationService> _logger;
        private readonly ILogicEngineService _logicEngineService;
        private readonly string _mappingsPath;
        private readonly FuzzyMatchingAlgorithm _fuzzyMatcher;

        public event EventHandler<ValidationProgressEventArgs>? ValidationProgress;

        public PreMigrationValidationService(
            ILogger<PreMigrationValidationService> logger,
            ILogicEngineService logicEngineService,
            string? profilePath = null)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _mappingsPath = Path.Combine(profilePath ?? @"C:\discoverydata\DefaultProfile", "Mappings");
            _fuzzyMatcher = new FuzzyMatchingAlgorithm();

            // Ensure mappings directory exists
            Directory.CreateDirectory(_mappingsPath);
        }

        /// <summary>
        /// Performs comprehensive pre-migration eligibility checks and returns detailed report
        /// </summary>
        public async Task<PreMigrationValidationResult> ValidateMigrationEligibilityAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting pre-migration eligibility validation");

                var result = new PreMigrationValidationResult
                {
                    GeneratedAt = DateTime.UtcNow,
                    Users = await ValidateUsersAsync(cancellationToken),
                    Mailboxes = await ValidateMailboxesAsync(cancellationToken),
                    FileShares = await ValidateFileSharesAsync(cancellationToken),
                    Databases = await ValidateDatabasesAsync(cancellationToken)
                };

                await PerformObjectMappingAsync(result.Users.Cast<ValidationItemBase>().Concat(result.Mailboxes.Cast<ValidationItemBase>()).ToList(), cancellationToken);

                _logger.LogInformation($"Pre-migration validation completed. Eligible: {result.TotalEligible}, Blocked: {result.TotalBlocked}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during pre-migration validation");
                throw;
            }
        }

        /// <summary>
        /// Validates users for migration eligibility
        /// </summary>
        public async Task<List<UserValidationItem>> ValidateUsersAsync(CancellationToken cancellationToken = default)
        {
            var userItems = new List<UserValidationItem>();

            try
            {
                OnValidationProgress("Validating users", "Starting user validation", 0, 1);

                var users = await _logicEngineService.GetAllUsersAsync();

                for (int i = 0; i < users.Count; i++)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    var user = users[i];
                    var item = new UserValidationItem
                    {
                        Id = user.Sid,
                        Name = user.DisplayName ?? user.UPN,
                        Type = "User",
                        SourceObject = user,
                        User = user,
                        Issues = new List<string>()
                    };

                    // Rule 1: Source account must be enabled
                    if (!user.Enabled)
                    {
                        item.Issues.Add("Source account is disabled");
                    }

                    // Rule 2: UPN must be unique and valid
                    if (string.IsNullOrEmpty(user.UPN))
                    {
                        item.Issues.Add("User Principal Name is missing");
                    }
                    else if (user.UPN.Contains(" ") || user.UPN.Contains("'") || user.UPN.Contains("\""))
                    {
                        item.Issues.Add("UPN contains invalid characters");
                    }

                    // Rule 3: Mailbox size validation (if mailbox exists)
                    var mailbox = await _logicEngineService.GetMailboxByUpnAsync(user.UPN);
                    if (mailbox != null && mailbox.SizeMB > 100000) // 100GB limit
                    {
                        item.Issues.Add($"Mailbox size ({mailbox.SizeMB:N0} MB) exceeds 100GB limit");
                    }

                    // Rule 4: Check for blocked characters in DisplayName
                    if (!string.IsNullOrEmpty(user.DisplayName))
                    {
                        var blockedChars = new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' };
                        if (user.DisplayName.IndexOfAny(blockedChars) >= 0)
                        {
                            item.Issues.Add("Display name contains blocked characters");
                        }
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    userItems.Add(item);

                    OnValidationProgress("Validating users", $"User {user.DisplayName ?? user.UPN}", i + 1, users.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating users");
            }

            return userItems;
        }

        /// <summary>
        /// Validates mailboxes for migration eligibility
        /// </summary>
        public async Task<List<MailboxValidationItem>> ValidateMailboxesAsync(CancellationToken cancellationToken = default)
        {
            var mailboxItems = new List<MailboxValidationItem>();

            try
            {
                OnValidationProgress("Validating mailboxes", "Starting mailbox validation", 0, 1);

                var mailboxes = await _logicEngineService.GetAllMailboxesAsync();

                for (int i = 0; i < mailboxes.Count; i++)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    var mailbox = mailboxes[i];
                    var item = new MailboxValidationItem
                    {
                        Id = mailbox.UPN,
                        Name = $"Mailbox for {mailbox.UPN}",
                        Type = "Mailbox",
                        SourceObject = mailbox,
                        Mailbox = mailbox,
                        Issues = new List<string>()
                    };

                    // Rule 1: Mailbox size must be under tenant limit
                    if (mailbox.SizeMB > 100000) // 100GB default limit
                    {
                        item.Issues.Add($"Mailbox size ({mailbox.SizeMB:N0} MB) exceeds 100GB limit");
                    }

                    // Rule 2: Check for supported mailbox type
                    var supportedTypes = new[] { "UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox" };
                    if (!supportedTypes.Contains(mailbox.Type))
                    {
                        item.Issues.Add($"Unsupported mailbox type: {mailbox.Type}");
                    }

                    // Rule 3: Validate UPN format
                    if (string.IsNullOrEmpty(mailbox.UPN) || !mailbox.UPN.Contains('@'))
                    {
                        item.Issues.Add("Invalid or missing UPN");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    mailboxItems.Add(item);

                    OnValidationProgress("Validating mailboxes", $"Mailbox {mailbox.UPN}", i + 1, mailboxes.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating mailboxes");
            }

            return mailboxItems;
        }

        /// <summary>
        /// Validates file shares for migration eligibility
        /// </summary>
        public async Task<List<FileShareValidationItem>> ValidateFileSharesAsync(CancellationToken cancellationToken = default)
        {
            var fileShareItems = new List<FileShareValidationItem>();

            try
            {
                OnValidationProgress("Validating file shares", "Starting file share validation", 0, 1);

                var fileShares = await _logicEngineService.GetAllFileSharesAsync();

                for (int i = 0; i < fileShares.Count; i++)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    var share = fileShares[i];
                    var item = new FileShareValidationItem
                    {
                        Id = share.Path,
                        Name = share.Name,
                        Type = "FileShare",
                        SourceObject = share,
                        FileShare = share,
                        Issues = new List<string>()
                    };

                    // Rule 1: Path length must be under 260 characters
                    if (share.Path.Length > 260)
                    {
                        item.Issues.Add($"Path length ({share.Path.Length}) exceeds 260 character limit");
                    }

                    // Rule 2: Check for invalid characters in path
                    var invalidChars = Path.GetInvalidPathChars();
                    if (share.Path.IndexOfAny(invalidChars) >= 0)
                    {
                        item.Issues.Add("Path contains invalid characters");
                    }

                    // Rule 3: Verify share is accessible
                    if (!Directory.Exists(share.Path) && !File.Exists(share.Path))
                    {
                        item.Issues.Add("Share path is not accessible");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    fileShareItems.Add(item);

                    OnValidationProgress("Validating file shares", $"File share {share.Name}", i + 1, fileShares.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating file shares");
            }

            return fileShareItems;
        }

        /// <summary>
        /// Validates databases for migration eligibility
        /// </summary>
        public async Task<List<DatabaseValidationItem>> ValidateDatabasesAsync(CancellationToken cancellationToken = default)
        {
            var databaseItems = new List<DatabaseValidationItem>();

            try
            {
                OnValidationProgress("Validating databases", "Starting database validation", 0, 1);

                var databases = await _logicEngineService.GetAllSqlDatabasesAsync();

                for (int i = 0; i < databases.Count; i++)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    var db = databases[i];
                    var item = new DatabaseValidationItem
                    {
                        Id = $"{db.Server}\\{db.Instance}\\{db.Database}",
                        Name = db.Database,
                        Type = "Database",
                        SourceObject = db,
                        Database = db,
                        Issues = new List<string>()
                    };

                    // Rule 1: Validate database name
                    if (string.IsNullOrEmpty(db.Database))
                    {
                        item.Issues.Add("Database name is missing");
                    }
                    else if (db.Database.IndexOfAny(new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' }) >= 0)
                    {
                        item.Issues.Add("Database name contains invalid characters");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    databaseItems.Add(item);

                    OnValidationProgress("Validating databases", $"Database {db.Database}", i + 1, databases.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating databases");
            }

            return databaseItems;
        }

        /// <summary>
        /// Performs object mapping using exact match and fuzzy matching algorithms
        /// </summary>
        public async Task<List<ObjectMapping>> PerformObjectMappingAsync(List<ValidationItemBase> items, CancellationToken cancellationToken = default)
        {
            var mappings = new List<ObjectMapping>();

            try
            {
                // Load existing manual mappings
                var existingMappings = await LoadManualMappingsAsync(cancellationToken);

                // Process each item for mapping
                foreach (var item in items.Where(i => i.IsEligible))
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    // Check for existing manual mapping
                    var existingMapping = existingMappings.FirstOrDefault(m => m.SourceId == item.Id);
                    if (existingMapping != null)
                    {
                        item.TargetMapping = existingMapping;
                        item.MappingStatus = "Manually Mapped";
                        mappings.Add(existingMapping);
                        continue;
                    }

                    // Try exact match by UPN/name
                    var exactMatch = await FindExactMatchAsync(item);
                    if (exactMatch != null)
                    {
                        item.TargetMapping = exactMatch;
                        item.MappingStatus = "Exact Match";
                        mappings.Add(exactMatch);
                        continue;
                    }

                    // Try fuzzy matching
                    var fuzzyMatch = await FindFuzzyMatchAsync(item);
                    if (fuzzyMatch != null)
                    {
                        item.TargetMapping = fuzzyMatch;
                        item.MappingStatus = $"Fuzzy Match ({fuzzyMatch.Confidence:P1})";
                        mappings.Add(fuzzyMatch);
                        continue;
                    }

                    item.MappingStatus = "Unmapped";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during object mapping");
            }

            return mappings;
        }

        /// <summary>
        /// Saves manual object mappings to JSON file
        /// </summary>
        public async Task SaveManualMappingsAsync(List<ObjectMapping> mappings, CancellationToken cancellationToken = default)
        {
            try
            {
                var mappingsFile = Path.Combine(_mappingsPath, "manual-mappings.json");
                var mappingDict = mappings.ToDictionary(m => m.SourceId, m => m);

                var json = JsonSerializer.Serialize(mappingDict, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await File.WriteAllTextAsync(mappingsFile, json, cancellationToken);
                _logger.LogInformation($"Saved {mappings.Count} manual mappings to {mappingsFile}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving manual mappings");
                throw;
            }
        }

        /// <summary>
        /// Loads manual object mappings from JSON file
        /// </summary>
        public async Task<List<ObjectMapping>> LoadManualMappingsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var mappingsFile = Path.Combine(_mappingsPath, "manual-mappings.json");
                if (!File.Exists(mappingsFile))
                {
                    return new List<ObjectMapping>();
                }

                var json = await File.ReadAllTextAsync(mappingsFile, cancellationToken);
                var mappings = JsonSerializer.Deserialize<Dictionary<string, ObjectMapping>>(json);

                _logger.LogInformation($"Loaded {mappings?.Count ?? 0} manual mappings");
                return mappings?.Values.ToList() ?? new List<ObjectMapping>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error loading manual mappings, using empty collection");
                return new List<ObjectMapping>();
            }
        }

        private void OnValidationProgress(string operation, string currentItem, int currentCount, int totalCount)
        {
            ValidationProgress?.Invoke(this, new ValidationProgressEventArgs
            {
                Operation = operation,
                CurrentItem = currentItem,
                CurrentCount = currentCount,
                TotalCount = totalCount
            });
        }

        private async Task<ObjectMapping?> FindExactMatchAsync(ValidationItemBase item)
        {
            // For demo purposes, we'll simulate target objects
            // In real implementation, this would query the target tenant
            var targetObjects = await GetTargetObjectsAsync();

            if (item is UserValidationItem userItem)
            {
                var targetUser = targetObjects.FirstOrDefault(t =>
                    string.Equals(t.UPN, userItem.User?.UPN, StringComparison.OrdinalIgnoreCase));
                if (targetUser != null)
                {
                    return new ObjectMapping
                    {
                        SourceId = item.Id,
                        TargetId = targetUser.Sid,
                        TargetName = targetUser.DisplayName ?? targetUser.UPN,
                        MappingType = "Exact Match",
                        Confidence = 1.0
                    };
                }
            }

            return null;
        }

        private async Task<ObjectMapping?> FindFuzzyMatchAsync(ValidationItemBase item)
        {
            var targetObjects = await GetTargetObjectsAsync();
            var fuzzyMatches = new List<(MandADiscoverySuite.Models.UserDto target, double confidence)>();

            if (item is UserValidationItem userItem && userItem.User != null)
            {
                foreach (var targetUser in targetObjects)
                {
                    // Check DisplayName similarity
                    if (!string.IsNullOrEmpty(userItem.User.DisplayName) && !string.IsNullOrEmpty(targetUser.DisplayName))
                    {
                        var nameConfidence = _fuzzyMatcher.CalculateJaroWinklerSimilarity(
                            userItem.User.DisplayName, targetUser.DisplayName);
                        if (nameConfidence >= 0.8)
                        {
                            fuzzyMatches.Add((targetUser, nameConfidence));
                        }
                    }

                    // Check SamAccountName similarity
                    if (!string.IsNullOrEmpty(userItem.User.Sam) && !string.IsNullOrEmpty(targetUser.Sam))
                    {
                        var samConfidence = _fuzzyMatcher.CalculateJaroWinklerSimilarity(
                            userItem.User.Sam, targetUser.Sam);
                        if (samConfidence >= 0.85)
                        {
                            fuzzyMatches.Add((targetUser, samConfidence));
                        }
                    }
                }

                // Select best fuzzy match
                var bestMatch = fuzzyMatches
                    .GroupBy(m => m.target.Sid)
                    .Select(g => g.OrderByDescending(m => m.confidence).First())
                    .OrderByDescending(m => m.confidence)
                    .FirstOrDefault();

                if (bestMatch.target != null)
                {
                    return new ObjectMapping
                    {
                        SourceId = item.Id,
                        TargetId = bestMatch.target.Sid,
                        TargetName = bestMatch.target.DisplayName ?? bestMatch.target.UPN,
                        MappingType = "Fuzzy Match",
                        Confidence = bestMatch.confidence
                    };
                }
            }

            return null;
        }

        /// <summary>
        /// Placeholder method to simulate getting target objects
        /// In real implementation, this would query the target tenant/domain
        /// </summary>
        private async Task<List<MandADiscoverySuite.Models.UserDto>> GetTargetObjectsAsync()
        {
            // Placeholder implementation - in real implementation this would query target environment
            await Task.Delay(10);
            return new List<MandADiscoverySuite.Models.UserDto>();
        }
    }
}