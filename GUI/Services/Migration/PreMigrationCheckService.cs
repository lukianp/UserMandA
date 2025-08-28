#nullable enable
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Pre-migration eligibility check service that validates objects before migration
    /// and provides mapping capabilities for unmapped objects
    /// </summary>
    public class PreMigrationCheckService
    {
        private readonly ILogger<PreMigrationCheckService> _logger;
        private readonly ILogicEngineService _logicEngineService;
        private readonly string _mappingsPath;
        private readonly FuzzyMatchingAlgorithm _fuzzyMatcher;

        public PreMigrationCheckService(
            ILogger<PreMigrationCheckService> logger,
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
        public async Task<EligibilityReport> GetEligibilityReportAsync()
        {
            try
            {
                _logger.LogInformation("Starting pre-migration eligibility checks");
                
                var report = new EligibilityReport
                {
                    GeneratedAt = DateTime.UtcNow,
                    Users = await CheckUserEligibilityAsync(),
                    Mailboxes = await CheckMailboxEligibilityAsync(),
                    Files = await CheckFileEligibilityAsync(),
                    Databases = await CheckDatabaseEligibilityAsync()
                };

                await PerformObjectMappingAsync(report);
                
                _logger.LogInformation($"Pre-migration checks completed. Eligible: {report.TotalEligible}, Blocked: {report.TotalBlocked}, Unmapped: {report.TotalUnmapped}");
                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during pre-migration eligibility checks");
                throw;
            }
        }

        /// <summary>
        /// Checks user eligibility based on comprehensive rules
        /// </summary>
        private async Task<List<EligibilityItem>> CheckUserEligibilityAsync()
        {
            var eligibilityItems = new List<EligibilityItem>();
            
            try
            {
                var users = await _logicEngineService.GetAllUsersAsync();
                
                foreach (var user in users)
                {
                    var item = new EligibilityItem
                    {
                        Id = user.Sid,
                        Name = user.DisplayName ?? user.UPN,
                        Type = "User",
                        SourceObject = user,
                        Issues = new List<string>()
                    };

                    // Rule 1: Source account must be enabled
                    if (!user.Enabled)
                    {
                        item.Issues.Add("Source account is disabled");
                    }

                    // Rule 2: UPN must be unique (check against target if available)
                    if (string.IsNullOrEmpty(user.UPN))
                    {
                        item.Issues.Add("User Principal Name is missing");
                    }
                    else if (user.UPN.Contains(" ") || user.UPN.Contains("'") || user.UPN.Contains("\""))
                    {
                        item.Issues.Add("UPN contains invalid characters");
                    }

                    // Rule 3: Check for required licenses (placeholder - would need target tenant info)
                    // This would typically check against available license SKUs in target tenant
                    
                    // Rule 4: Mailbox size validation (if mailbox exists)
                    var mailbox = await _logicEngineService.GetMailboxByUpnAsync(user.UPN);
                    if (mailbox != null && mailbox.SizeMB > 100000) // 100GB limit
                    {
                        item.Issues.Add($"Mailbox size ({mailbox.SizeMB:N0} MB) exceeds 100GB limit");
                    }

                    // Rule 5: Check for blocked characters in DisplayName
                    if (!string.IsNullOrEmpty(user.DisplayName))
                    {
                        var blockedChars = new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' };
                        if (user.DisplayName.IndexOfAny(blockedChars) >= 0)
                        {
                            item.Issues.Add("Display name contains blocked characters");
                        }
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    eligibilityItems.Add(item);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking user eligibility");
            }

            return eligibilityItems;
        }

        /// <summary>
        /// Checks mailbox eligibility based on comprehensive rules
        /// </summary>
        private async Task<List<EligibilityItem>> CheckMailboxEligibilityAsync()
        {
            var eligibilityItems = new List<EligibilityItem>();
            
            try
            {
                var mailboxes = await _logicEngineService.GetAllMailboxesAsync();
                
                foreach (var mailbox in mailboxes)
                {
                    var item = new EligibilityItem
                    {
                        Id = mailbox.UPN,
                        Name = $"Mailbox for {mailbox.UPN}",
                        Type = "Mailbox",
                        SourceObject = mailbox,
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

                    // Rule 3: Check if mailbox is not in litigation hold (placeholder)
                    // Would need to query actual mailbox properties from Exchange
                    
                    // Rule 4: Check for archive mailbox issues (placeholder)
                    // Would check if archive is enabled and properly configured

                    // Rule 5: Validate UPN format
                    if (string.IsNullOrEmpty(mailbox.UPN) || !mailbox.UPN.Contains('@'))
                    {
                        item.Issues.Add("Invalid or missing UPN");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    eligibilityItems.Add(item);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking mailbox eligibility");
            }

            return eligibilityItems;
        }

        /// <summary>
        /// Checks file/share eligibility based on comprehensive rules  
        /// </summary>
        private async Task<List<EligibilityItem>> CheckFileEligibilityAsync()
        {
            var eligibilityItems = new List<EligibilityItem>();
            
            try
            {
                var fileShares = await _logicEngineService.GetAllFileSharesAsync();
                
                foreach (var share in fileShares)
                {
                    var item = new EligibilityItem
                    {
                        Id = share.Path,
                        Name = share.Name,
                        Type = "FileShare",
                        SourceObject = share,
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

                    // Rule 3: Check for blocked file extensions (placeholder)
                    var blockedExtensions = new[] { ".exe", ".bat", ".cmd", ".scr", ".pif", ".com" };
                    // Would need to scan actual files in the share

                    // Rule 4: Check for open file locks (placeholder)
                    // Would need to query file system for locked files

                    // Rule 5: Verify share is accessible
                    if (!Directory.Exists(share.Path) && !File.Exists(share.Path))
                    {
                        item.Issues.Add("Share path is not accessible");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    eligibilityItems.Add(item);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking file eligibility");
            }

            return eligibilityItems;
        }

        /// <summary>
        /// Checks SQL database eligibility based on comprehensive rules
        /// </summary>
        private async Task<List<EligibilityItem>> CheckDatabaseEligibilityAsync()
        {
            var eligibilityItems = new List<EligibilityItem>();
            
            try
            {
                var databases = await _logicEngineService.GetAllSqlDatabasesAsync();
                
                foreach (var db in databases)
                {
                    var item = new EligibilityItem
                    {
                        Id = $"{db.Server}\\{db.Instance}\\{db.Database}",
                        Name = db.Database,
                        Type = "Database",
                        SourceObject = db,
                        Issues = new List<string>()
                    };

                    // Rule 1: Database must not be in use during migration window (placeholder)
                    // Would need to check active connections

                    // Rule 2: Check compatibility level (placeholder)
                    // Would need to query SQL Server for compatibility level

                    // Rule 3: Verify no encryption or special features that can't be migrated (placeholder)
                    // Would need to check database properties

                    // Rule 4: Check target has enough storage (placeholder)
                    // Would need target environment information

                    // Rule 5: Validate database name doesn't conflict with target
                    if (string.IsNullOrEmpty(db.Database))
                    {
                        item.Issues.Add("Database name is missing");
                    }
                    else if (db.Database.IndexOfAny(new[] { '<', '>', '"', '|', '\0', '\n', '\r', '\t' }) >= 0)
                    {
                        item.Issues.Add("Database name contains invalid characters");
                    }

                    item.IsEligible = item.Issues.Count == 0;
                    eligibilityItems.Add(item);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking database eligibility");
            }

            return eligibilityItems;
        }

        /// <summary>
        /// Performs object mapping using exact match and fuzzy matching algorithms
        /// </summary>
        private async Task PerformObjectMappingAsync(EligibilityReport report)
        {
            try
            {
                // Load existing manual mappings
                var existingMappings = await LoadManualMappingsAsync();
                
                // Process each object type for mapping
                await MapUsersAsync(report.Users, existingMappings);
                await MapMailboxesAsync(report.Mailboxes, existingMappings);
                await MapFilesAsync(report.Files, existingMappings);
                await MapDatabasesAsync(report.Databases, existingMappings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during object mapping");
            }
        }

        /// <summary>
        /// Maps users using exact match and fuzzy matching
        /// </summary>
        private async Task MapUsersAsync(List<EligibilityItem> users, Dictionary<string, ObjectMapping> existingMappings)
        {
            // For demo purposes, we'll simulate target users
            // In real implementation, this would query the target tenant
            var targetUsers = await GetTargetUsersAsync(); // Placeholder method
            
            foreach (var user in users.Where(u => u.IsEligible))
            {
                var sourceUser = (UserDto)user.SourceObject;
                
                // Check for existing manual mapping
                if (existingMappings.TryGetValue(sourceUser.Sid, out var existingMapping))
                {
                    user.TargetMapping = existingMapping;
                    user.MappingStatus = "Manually Mapped";
                    continue;
                }

                // Try exact match by UPN
                var exactMatch = targetUsers.FirstOrDefault(t => 
                    string.Equals(t.UPN, sourceUser.UPN, StringComparison.OrdinalIgnoreCase));
                
                if (exactMatch != null)
                {
                    user.TargetMapping = new ObjectMapping
                    {
                        SourceId = sourceUser.Sid,
                        TargetId = exactMatch.Sid,
                        TargetName = exactMatch.DisplayName ?? exactMatch.UPN,
                        MappingType = "Exact Match",
                        Confidence = 1.0
                    };
                    user.MappingStatus = "Exact Match";
                    continue;
                }

                // Try fuzzy matching on DisplayName and SamAccountName
                var fuzzyMatches = new List<(UserDto target, double confidence)>();
                
                foreach (var targetUser in targetUsers)
                {
                    // Check DisplayName similarity
                    if (!string.IsNullOrEmpty(sourceUser.DisplayName) && !string.IsNullOrEmpty(targetUser.DisplayName))
                    {
                        var nameConfidence = _fuzzyMatcher.CalculateJaroWinklerSimilarity(
                            sourceUser.DisplayName, targetUser.DisplayName);
                        if (nameConfidence >= 0.8)
                        {
                            fuzzyMatches.Add((targetUser, nameConfidence));
                        }
                    }
                    
                    // Check SamAccountName similarity
                    if (!string.IsNullOrEmpty(sourceUser.Sam) && !string.IsNullOrEmpty(targetUser.Sam))
                    {
                        var samConfidence = _fuzzyMatcher.CalculateJaroWinklerSimilarity(
                            sourceUser.Sam, targetUser.Sam);
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
                    user.TargetMapping = new ObjectMapping
                    {
                        SourceId = sourceUser.Sid,
                        TargetId = bestMatch.target.Sid,
                        TargetName = bestMatch.target.DisplayName ?? bestMatch.target.UPN,
                        MappingType = "Fuzzy Match",
                        Confidence = bestMatch.confidence
                    };
                    user.MappingStatus = $"Fuzzy Match ({bestMatch.confidence:P1})";
                }
                else
                {
                    user.MappingStatus = "Unmapped";
                }
            }
        }

        /// <summary>
        /// Maps mailboxes to target environment
        /// </summary>
        private async Task MapMailboxesAsync(List<EligibilityItem> mailboxes, Dictionary<string, ObjectMapping> existingMappings)
        {
            // Similar logic to user mapping but for mailboxes
            // Would typically map based on UPN or primary SMTP address
            await Task.CompletedTask; // Placeholder for async operation
        }

        /// <summary>
        /// Maps files and shares to target locations
        /// </summary>
        private async Task MapFilesAsync(List<EligibilityItem> files, Dictionary<string, ObjectMapping> existingMappings)
        {
            // File mapping would typically involve mapping to target file server paths
            // or cloud storage locations
            await Task.CompletedTask; // Placeholder for async operation
        }

        /// <summary>
        /// Maps databases to target SQL servers
        /// </summary>
        private async Task MapDatabasesAsync(List<EligibilityItem> databases, Dictionary<string, ObjectMapping> existingMappings)
        {
            // Database mapping would involve mapping to target SQL Server instances
            await Task.CompletedTask; // Placeholder for async operation
        }

        /// <summary>
        /// Saves manual object mappings to JSON file
        /// </summary>
        public async Task SaveManualmappingsAsync(List<ObjectMapping> mappings)
        {
            try
            {
                var mappingsFile = Path.Combine(_mappingsPath, "manual-mappings.json");
                var mappingDict = mappings.ToDictionary(m => m.SourceId, m => m);
                
                var json = JsonSerializer.Serialize(mappingDict, new JsonSerializerOptions 
                { 
                    WriteIndented = true 
                });
                
                await File.WriteAllTextAsync(mappingsFile, json);
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
        private async Task<Dictionary<string, ObjectMapping>> LoadManualMappingsAsync()
        {
            try
            {
                var mappingsFile = Path.Combine(_mappingsPath, "manual-mappings.json");
                if (!File.Exists(mappingsFile))
                {
                    return new Dictionary<string, ObjectMapping>();
                }

                var json = await File.ReadAllTextAsync(mappingsFile);
                var mappings = JsonSerializer.Deserialize<Dictionary<string, ObjectMapping>>(json);
                
                _logger.LogInformation($"Loaded {mappings?.Count ?? 0} manual mappings");
                return mappings ?? new Dictionary<string, ObjectMapping>();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error loading manual mappings, using empty collection");
                return new Dictionary<string, ObjectMapping>();
            }
        }

        /// <summary>
        /// Placeholder method to simulate getting target users
        /// In real implementation, this would query the target tenant/domain
        /// </summary>
        private async Task<List<UserDto>> GetTargetUsersAsync()
        {
            // Placeholder implementation
            await Task.Delay(100);
            return new List<UserDto>();
        }
    }

    /// <summary>
    /// Jaro-Winkler fuzzy matching algorithm implementation
    /// </summary>
    public class FuzzyMatchingAlgorithm
    {
        /// <summary>
        /// Calculates Jaro-Winkler similarity between two strings
        /// </summary>
        public double CalculateJaroWinklerSimilarity(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2))
                return 1.0;
            
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return 0.0;

            if (s1.Equals(s2, StringComparison.OrdinalIgnoreCase))
                return 1.0;

            var jaroSimilarity = CalculateJaroSimilarity(s1, s2);
            
            if (jaroSimilarity < 0.7)
                return jaroSimilarity;

            // Calculate common prefix (up to 4 characters)
            var prefixLength = 0;
            var maxPrefix = Math.Min(4, Math.Min(s1.Length, s2.Length));
            
            for (int i = 0; i < maxPrefix; i++)
            {
                if (char.ToLowerInvariant(s1[i]) == char.ToLowerInvariant(s2[i]))
                    prefixLength++;
                else
                    break;
            }

            // Jaro-Winkler similarity = Jaro similarity + (prefix scaling factor * prefix length * (1 - Jaro similarity))
            return jaroSimilarity + (0.1 * prefixLength * (1 - jaroSimilarity));
        }

        /// <summary>
        /// Calculates Jaro similarity between two strings
        /// </summary>
        private double CalculateJaroSimilarity(string s1, string s2)
        {
            var len1 = s1.Length;
            var len2 = s2.Length;

            if (len1 == 0 && len2 == 0)
                return 1.0;

            var matchWindow = Math.Max(len1, len2) / 2 - 1;
            if (matchWindow < 0)
                matchWindow = 0;

            var s1Matches = new bool[len1];
            var s2Matches = new bool[len2];

            var matches = 0;
            var transpositions = 0;

            // Identify matches
            for (int i = 0; i < len1; i++)
            {
                var start = Math.Max(0, i - matchWindow);
                var end = Math.Min(i + matchWindow + 1, len2);

                for (int j = start; j < end; j++)
                {
                    if (s2Matches[j] || char.ToLowerInvariant(s1[i]) != char.ToLowerInvariant(s2[j]))
                        continue;

                    s1Matches[i] = true;
                    s2Matches[j] = true;
                    matches++;
                    break;
                }
            }

            if (matches == 0)
                return 0.0;

            // Count transpositions
            var k = 0;
            for (int i = 0; i < len1; i++)
            {
                if (!s1Matches[i])
                    continue;

                while (!s2Matches[k])
                    k++;

                if (char.ToLowerInvariant(s1[i]) != char.ToLowerInvariant(s2[k]))
                    transpositions++;
                
                k++;
            }

            return (matches / (double)len1 + matches / (double)len2 + 
                   (matches - transpositions / 2.0) / matches) / 3.0;
        }
    }

    /// <summary>
    /// Pre-migration eligibility report containing all object types
    /// </summary>
    public class EligibilityReport
    {
        public DateTime GeneratedAt { get; set; }
        public List<EligibilityItem> Users { get; set; } = new List<EligibilityItem>();
        public List<EligibilityItem> Mailboxes { get; set; } = new List<EligibilityItem>();
        public List<EligibilityItem> Files { get; set; } = new List<EligibilityItem>();
        public List<EligibilityItem> Databases { get; set; } = new List<EligibilityItem>();

        public int TotalEligible => Users.Count(u => u.IsEligible) + Mailboxes.Count(m => m.IsEligible) + 
                                   Files.Count(f => f.IsEligible) + Databases.Count(d => d.IsEligible);

        public int TotalBlocked => Users.Count(u => !u.IsEligible) + Mailboxes.Count(m => !m.IsEligible) + 
                                  Files.Count(f => !f.IsEligible) + Databases.Count(d => !d.IsEligible);

        public int TotalUnmapped => Users.Count(u => u.IsEligible && u.MappingStatus == "Unmapped") + 
                                   Mailboxes.Count(m => m.IsEligible && m.MappingStatus == "Unmapped") + 
                                   Files.Count(f => f.IsEligible && f.MappingStatus == "Unmapped") + 
                                   Databases.Count(d => d.IsEligible && d.MappingStatus == "Unmapped");
    }

    /// <summary>
    /// Individual eligibility item with mapping information
    /// </summary>
    public class EligibilityItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsEligible { get; set; }
        public List<string> Issues { get; set; } = new List<string>();
        public object SourceObject { get; set; } = null!;
        public ObjectMapping? TargetMapping { get; set; }
        public string MappingStatus { get; set; } = "Not Processed";

        public string IssuesSummary => string.Join("; ", Issues);
        public string EligibilityStatus => IsEligible ? "Eligible" : "Blocked";
    }

    /// <summary>
    /// Object mapping between source and target environments
    /// </summary>
    public class ObjectMapping
    {
        public string SourceId { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string TargetName { get; set; } = string.Empty;
        public string MappingType { get; set; } = string.Empty; // "Exact Match", "Fuzzy Match", "Manual"
        public double Confidence { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = Environment.UserName;
        public string? Notes { get; set; }
    }
}