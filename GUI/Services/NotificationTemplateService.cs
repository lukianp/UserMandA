using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing notification templates with storage, token replacement, and preview capabilities.
    /// Implements T-033 notification template management requirements.
    /// </summary>
    public class NotificationTemplateService
    {
        #region Private Fields

        private readonly ILogger<NotificationTemplateService> _logger;
        private readonly string _templatesBasePath;
        private readonly Dictionary<string, NotificationTemplate> _templateCache;
        private readonly object _cacheLock = new object();

        // Default template directory structure
        private const string TEMPLATES_FOLDER = "Notifications";
        private const string PRE_MIGRATION_FOLDER = "PreMigration";
        private const string POST_MIGRATION_FOLDER = "PostMigration";
        private const string ALERTS_FOLDER = "Alerts";

        #endregion

        #region Constructor

        public NotificationTemplateService(
            string profilePath = null,
            ILogger<NotificationTemplateService> logger = null)
        {
            _logger = logger;
            _templateCache = new Dictionary<string, NotificationTemplate>();

            // Default to C:\discoverydata\{profile}\Notifications\ as per T-033 spec
            var basePath = profilePath ?? @"C:\discoverydata\ljpops";
            _templatesBasePath = Path.Combine(basePath, TEMPLATES_FOLDER);

            EnsureDirectoriesExist();
            _ = InitializeDefaultTemplates();

            _logger?.LogInformation("NotificationTemplateService initialized with base path: {BasePath}", _templatesBasePath);
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Loads all available notification templates
        /// </summary>
        public async Task<List<NotificationTemplate>> LoadTemplatesAsync()
        {
            try
            {
                var templates = new List<NotificationTemplate>();
                
                // Load templates from each category folder
                await LoadTemplatesFromFolderAsync(Path.Combine(_templatesBasePath, PRE_MIGRATION_FOLDER), 
                    NotificationTemplateType.PreMigration, templates);
                await LoadTemplatesFromFolderAsync(Path.Combine(_templatesBasePath, POST_MIGRATION_FOLDER), 
                    NotificationTemplateType.PostMigration, templates);
                await LoadTemplatesFromFolderAsync(Path.Combine(_templatesBasePath, ALERTS_FOLDER), 
                    NotificationTemplateType.Alert, templates);
                
                // Update cache
                lock (_cacheLock)
                {
                    _templateCache.Clear();
                    foreach (var template in templates)
                    {
                        _templateCache[template.Id] = template;
                    }
                }

                _logger?.LogInformation("Loaded {Count} notification templates", templates.Count);
                return templates;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading notification templates");
                return new List<NotificationTemplate>();
            }
        }

        /// <summary>
        /// Gets a specific template by ID
        /// </summary>
        public async Task<NotificationTemplate> GetTemplateAsync(string templateId)
        {
            try
            {
                lock (_cacheLock)
                {
                    if (_templateCache.TryGetValue(templateId, out var cachedTemplate))
                    {
                        return cachedTemplate;
                    }
                }

                // If not in cache, reload templates
                await LoadTemplatesAsync();
                
                lock (_cacheLock)
                {
                    _templateCache.TryGetValue(templateId, out var template);
                    return template;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting template {TemplateId}", templateId);
                return null;
            }
        }

        /// <summary>
        /// Saves a notification template
        /// </summary>
        public async Task<bool> SaveTemplateAsync(NotificationTemplate template)
        {
            try
            {
                if (template == null)
                {
                    _logger?.LogError("Cannot save null template");
                    return false;
                }

                // Validate template
                var validationResult = ValidateTemplate(template);
                if (!validationResult.IsValid)
                {
                    _logger?.LogError("Template validation failed: {Errors}", 
                        string.Join("; ", validationResult.Errors));
                    return false;
                }

                // Determine file path based on template type
                var folderPath = GetFolderPathForType(template.Type);
                var fileName = $"{template.Id}.json";
                var filePath = Path.Combine(folderPath, fileName);

                // Ensure directory exists
                Directory.CreateDirectory(folderPath);

                // Serialize and save
                var json = JsonSerializer.Serialize(template, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                
                await File.WriteAllTextAsync(filePath, json);

                // Update cache
                lock (_cacheLock)
                {
                    _templateCache[template.Id] = template;
                }

                _logger?.LogInformation("Saved template {TemplateId} to {FilePath}", template.Id, filePath);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving template {TemplateId}", template?.Id);
                return false;
            }
        }

        /// <summary>
        /// Deletes a notification template
        /// </summary>
        public async Task<bool> DeleteTemplateAsync(string templateId)
        {
            try
            {
                var template = await GetTemplateAsync(templateId);
                if (template == null)
                {
                    _logger?.LogWarning("Template {TemplateId} not found for deletion", templateId);
                    return false;
                }

                // Determine file path
                var folderPath = GetFolderPathForType(template.Type);
                var fileName = $"{templateId}.json";
                var filePath = Path.Combine(folderPath, fileName);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                // Remove from cache
                lock (_cacheLock)
                {
                    _templateCache.Remove(templateId);
                }

                _logger?.LogInformation("Deleted template {TemplateId}", templateId);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting template {TemplateId}", templateId);
                return false;
            }
        }

        /// <summary>
        /// Creates a preview of a template with token replacement
        /// </summary>
        public NotificationPreview CreatePreview(NotificationTemplate template, object tokenData)
        {
            try
            {
                if (template == null)
                    throw new ArgumentNullException(nameof(template));

                var preview = new NotificationPreview
                {
                    TemplateId = template.Id,
                    TemplateName = template.Name,
                    Subject = ReplaceTokens(template.Subject, tokenData),
                    Body = ReplaceTokens(template.Body, tokenData),
                    Recipients = template.Recipients?.ToList() ?? new List<string>(),
                    CreatedAt = DateTime.Now
                };

                // Extract used tokens
                preview.UsedTokens = ExtractUsedTokens(template.Subject + " " + template.Body);
                
                // Validate recipients
                preview.ValidRecipients = preview.Recipients.Where(IsValidEmail).ToList();
                preview.InvalidRecipients = preview.Recipients.Except(preview.ValidRecipients).ToList();

                return preview;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating template preview for {TemplateId}", template?.Id);
                return new NotificationPreview 
                { 
                    TemplateId = template?.Id ?? "unknown",
                    TemplateName = template?.Name ?? "Unknown",
                    HasError = true,
                    ErrorMessage = ex.Message
                };
            }
        }

        /// <summary>
        /// Replaces tokens in a template string with actual values
        /// </summary>
        public string ReplaceTokens(string template, object tokenData)
        {
            if (string.IsNullOrEmpty(template) || tokenData == null)
                return template ?? string.Empty;

            try
            {
                var result = template;
                var tokenRegex = new Regex(@"\{(\w+)\}", RegexOptions.IgnoreCase);
                var properties = tokenData.GetType().GetProperties();

                var matches = tokenRegex.Matches(template);
                foreach (Match match in matches)
                {
                    var tokenName = match.Groups[1].Value;
                    var property = properties.FirstOrDefault(p => 
                        string.Equals(p.Name, tokenName, StringComparison.OrdinalIgnoreCase));

                    if (property != null)
                    {
                        var value = property.GetValue(tokenData)?.ToString() ?? string.Empty;
                        result = result.Replace(match.Value, value);
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error replacing tokens in template");
                return template;
            }
        }

        /// <summary>
        /// Gets available token definitions for template editing
        /// </summary>
        public List<TemplateToken> GetAvailableTokens(NotificationTemplateType templateType)
        {
            var tokens = new List<TemplateToken>();

            // Common tokens for all templates
            tokens.AddRange(new[]
            {
                new TemplateToken { Name = "UserDisplayName", Description = "User's display name", Example = "John Smith" },
                new TemplateToken { Name = "UserEmail", Description = "User's email address", Example = "john.smith@company.com" },
                new TemplateToken { Name = "UserPrincipalName", Description = "User's UPN", Example = "john.smith@company.com" },
                new TemplateToken { Name = "CompanyName", Description = "Company name", Example = "Acme Corporation" },
                new TemplateToken { Name = "CurrentDate", Description = "Current date", Example = DateTime.Now.ToString("yyyy-MM-dd") },
                new TemplateToken { Name = "CurrentTime", Description = "Current time", Example = DateTime.Now.ToString("HH:mm") }
            });

            // Template-specific tokens
            switch (templateType)
            {
                case NotificationTemplateType.PreMigration:
                    tokens.AddRange(new[]
                    {
                        new TemplateToken { Name = "MigrationDate", Description = "Planned migration date", Example = "2024-03-15" },
                        new TemplateToken { Name = "MigrationTime", Description = "Planned migration time", Example = "09:00 AM" },
                        new TemplateToken { Name = "WaveName", Description = "Migration wave name", Example = "Wave-01" },
                        new TemplateToken { Name = "EstimatedDuration", Description = "Estimated migration duration", Example = "4 hours" },
                        new TemplateToken { Name = "ItemsToMigrate", Description = "Number of items to migrate", Example = "150" }
                    });
                    break;

                case NotificationTemplateType.PostMigration:
                    tokens.AddRange(new[]
                    {
                        new TemplateToken { Name = "MigrationStatus", Description = "Migration completion status", Example = "Completed Successfully" },
                        new TemplateToken { Name = "MigrationStartTime", Description = "Actual migration start time", Example = "09:15 AM" },
                        new TemplateToken { Name = "MigrationEndTime", Description = "Actual migration end time", Example = "12:45 PM" },
                        new TemplateToken { Name = "ItemsMigrated", Description = "Number of items successfully migrated", Example = "148" },
                        new TemplateToken { Name = "ItemsFailed", Description = "Number of items that failed", Example = "2" },
                        new TemplateToken { Name = "NextSteps", Description = "Post-migration next steps", Example = "Please update your bookmarks" }
                    });
                    break;

                case NotificationTemplateType.Alert:
                    tokens.AddRange(new[]
                    {
                        new TemplateToken { Name = "AlertType", Description = "Type of alert", Example = "Error" },
                        new TemplateToken { Name = "AlertMessage", Description = "Alert message", Example = "Migration failed due to network timeout" },
                        new TemplateToken { Name = "AlertTime", Description = "Time alert was generated", Example = "10:30 AM" },
                        new TemplateToken { Name = "AffectedItems", Description = "Number of affected items", Example = "25" },
                        new TemplateToken { Name = "RecommendedAction", Description = "Recommended action to take", Example = "Contact IT support" }
                    });
                    break;
            }

            return tokens.OrderBy(t => t.Name).ToList();
        }

        /// <summary>
        /// Duplicates an existing template with a new ID and name
        /// </summary>
        public async Task<NotificationTemplate> DuplicateTemplateAsync(string templateId, string newName)
        {
            try
            {
                var originalTemplate = await GetTemplateAsync(templateId);
                if (originalTemplate == null)
                {
                    _logger?.LogError("Template {TemplateId} not found for duplication", templateId);
                    return null;
                }

                var duplicatedTemplate = new NotificationTemplate
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = newName,
                    Description = $"Copy of {originalTemplate.Name}",
                    Type = originalTemplate.Type,
                    Subject = originalTemplate.Subject,
                    Body = originalTemplate.Body,
                    Recipients = originalTemplate.Recipients?.ToList() ?? new List<string>(),
                    IsActive = false, // New templates start inactive
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    CreatedBy = originalTemplate.CreatedBy,
                    Tags = originalTemplate.Tags?.ToList() ?? new List<string>()
                };

                var saved = await SaveTemplateAsync(duplicatedTemplate);
                if (saved)
                {
                    _logger?.LogInformation("Duplicated template {OriginalId} to {NewId}", templateId, duplicatedTemplate.Id);
                    return duplicatedTemplate;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error duplicating template {TemplateId}", templateId);
                return null;
            }
        }

        /// <summary>
        /// Exports templates to a backup file
        /// </summary>
        public async Task<bool> ExportTemplatesAsync(string filePath, List<string> templateIds = null)
        {
            try
            {
                var templates = await LoadTemplatesAsync();
                
                if (templateIds?.Any() == true)
                {
                    templates = templates.Where(t => templateIds.Contains(t.Id)).ToList();
                }

                var exportData = new TemplateExportData
                {
                    ExportedAt = DateTime.Now,
                    Templates = templates,
                    Version = "1.0"
                };

                var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions 
                { 
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                await File.WriteAllTextAsync(filePath, json);
                
                _logger?.LogInformation("Exported {Count} templates to {FilePath}", templates.Count, filePath);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting templates to {FilePath}", filePath);
                return false;
            }
        }

        /// <summary>
        /// Imports templates from a backup file
        /// </summary>
        public async Task<TemplateImportResult> ImportTemplatesAsync(string filePath, bool overwriteExisting = false)
        {
            var result = new TemplateImportResult();

            try
            {
                if (!File.Exists(filePath))
                {
                    result.Success = false;
                    result.ErrorMessage = "Import file does not exist";
                    return result;
                }

                var json = await File.ReadAllTextAsync(filePath);
                var exportData = JsonSerializer.Deserialize<TemplateExportData>(json, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                if (exportData?.Templates?.Any() != true)
                {
                    result.Success = false;
                    result.ErrorMessage = "No templates found in import file";
                    return result;
                }

                var existingTemplates = await LoadTemplatesAsync();
                var existingIds = existingTemplates.Select(t => t.Id).ToHashSet();

                foreach (var template in exportData.Templates)
                {
                    try
                    {
                        if (existingIds.Contains(template.Id) && !overwriteExisting)
                        {
                            result.SkippedTemplates.Add(template.Id);
                            continue;
                        }

                        var saved = await SaveTemplateAsync(template);
                        if (saved)
                        {
                            if (existingIds.Contains(template.Id))
                                result.UpdatedTemplates.Add(template.Id);
                            else
                                result.ImportedTemplates.Add(template.Id);
                        }
                        else
                        {
                            result.FailedTemplates.Add(new FailedTemplateImport 
                            { 
                                TemplateId = template.Id, 
                                Error = "Failed to save template" 
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailedTemplates.Add(new FailedTemplateImport 
                        { 
                            TemplateId = template.Id, 
                            Error = ex.Message 
                        });
                    }
                }

                result.Success = true;
                result.TotalProcessed = exportData.Templates.Count;
                
                _logger?.LogInformation("Template import completed: {Imported} imported, {Updated} updated, {Skipped} skipped, {Failed} failed",
                    result.ImportedTemplates.Count, result.UpdatedTemplates.Count, 
                    result.SkippedTemplates.Count, result.FailedTemplates.Count);

                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                _logger?.LogError(ex, "Error importing templates from {FilePath}", filePath);
                return result;
            }
        }

        #endregion

        #region Private Methods

        private void EnsureDirectoriesExist()
        {
            try
            {
                Directory.CreateDirectory(_templatesBasePath);
                Directory.CreateDirectory(Path.Combine(_templatesBasePath, PRE_MIGRATION_FOLDER));
                Directory.CreateDirectory(Path.Combine(_templatesBasePath, POST_MIGRATION_FOLDER));
                Directory.CreateDirectory(Path.Combine(_templatesBasePath, ALERTS_FOLDER));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating template directories");
                throw;
            }
        }

        private async Task InitializeDefaultTemplates()
        {
            try
            {
                // Check if any templates already exist
                var existingTemplates = await LoadTemplatesAsync();
                if (existingTemplates.Any())
                {
                    _logger?.LogInformation("Found {Count} existing templates, skipping default template creation", 
                        existingTemplates.Count);
                    return;
                }

                // Create default templates
                var defaultTemplates = CreateDefaultTemplates();
                
                foreach (var template in defaultTemplates)
                {
                    await SaveTemplateAsync(template);
                }

                _logger?.LogInformation("Created {Count} default notification templates", defaultTemplates.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing default templates");
            }
        }

        private List<NotificationTemplate> CreateDefaultTemplates()
        {
            var templates = new List<NotificationTemplate>();

            // Default pre-migration template
            templates.Add(new NotificationTemplate
            {
                Id = "default-pre-migration",
                Name = "Default Pre-Migration Notification",
                Description = "Standard notification sent before migration starts",
                Type = NotificationTemplateType.PreMigration,
                Subject = "Migration Scheduled: {UserDisplayName} - {MigrationDate}",
                Body = @"Dear {UserDisplayName},

This email is to notify you that your account migration has been scheduled for {MigrationDate} at {MigrationTime}.

Migration Details:
- Wave: {WaveName}
- Estimated Duration: {EstimatedDuration}
- Items to Migrate: {ItemsToMigrate}

What to expect:
- Your account and data will be moved to our new system
- You may experience brief service interruptions during the migration
- All your emails, files, and settings will be preserved

Please ensure you:
- Save any open documents before the migration starts
- Log out of all applications at the end of your work day on {MigrationDate}
- Do not schedule important meetings during the migration window

If you have any questions or concerns, please contact our IT support team.

Thank you for your cooperation.

Best regards,
IT Migration Team
{CompanyName}",
                Recipients = new List<string>(),
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CreatedBy = "System"
            });

            // Default post-migration template
            templates.Add(new NotificationTemplate
            {
                Id = "default-post-migration",
                Name = "Default Post-Migration Notification",
                Description = "Standard notification sent after migration completes",
                Type = NotificationTemplateType.PostMigration,
                Subject = "Migration Complete: {UserDisplayName} - {MigrationStatus}",
                Body = @"Dear {UserDisplayName},

We are pleased to inform you that your account migration has been completed successfully.

Migration Summary:
- Status: {MigrationStatus}
- Started: {MigrationStartTime}
- Completed: {MigrationEndTime}
- Items Migrated: {ItemsMigrated}
- Items Failed: {ItemsFailed}

Next Steps:
{NextSteps}

Important Notes:
- Please update your bookmarks and saved passwords
- Your old account will remain accessible for 30 days as backup
- If you experience any issues, please contact IT support immediately

Welcome to our new system!

Best regards,
IT Migration Team
{CompanyName}",
                Recipients = new List<string>(),
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CreatedBy = "System"
            });

            // Default alert template
            templates.Add(new NotificationTemplate
            {
                Id = "default-migration-alert",
                Name = "Default Migration Alert",
                Description = "Standard alert template for migration issues",
                Type = NotificationTemplateType.Alert,
                Subject = "Migration Alert: {AlertType} - {UserDisplayName}",
                Body = @"Migration Alert

Alert Details:
- Type: {AlertType}
- User: {UserDisplayName}
- Time: {AlertTime}
- Affected Items: {AffectedItems}

Message:
{AlertMessage}

Recommended Action:
{RecommendedAction}

This is an automated alert from the migration system.

IT Migration Team
{CompanyName}",
                Recipients = new List<string> { "it-support@company.com" },
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CreatedBy = "System"
            });

            return templates;
        }

        private async Task LoadTemplatesFromFolderAsync(
            string folderPath, 
            NotificationTemplateType templateType, 
            List<NotificationTemplate> templates)
        {
            try
            {
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                    return;
                }

                var jsonFiles = Directory.GetFiles(folderPath, "*.json");
                
                foreach (var filePath in jsonFiles)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(filePath);
                        var template = JsonSerializer.Deserialize<NotificationTemplate>(json, new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        });

                        if (template != null)
                        {
                            template.Type = templateType; // Ensure type matches folder
                            templates.Add(template);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Error loading template from {FilePath}", filePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading templates from folder {FolderPath}", folderPath);
            }
        }

        private string GetFolderPathForType(NotificationTemplateType templateType)
        {
            return templateType switch
            {
                NotificationTemplateType.PreMigration => Path.Combine(_templatesBasePath, PRE_MIGRATION_FOLDER),
                NotificationTemplateType.PostMigration => Path.Combine(_templatesBasePath, POST_MIGRATION_FOLDER),
                NotificationTemplateType.Alert => Path.Combine(_templatesBasePath, ALERTS_FOLDER),
                _ => _templatesBasePath
            };
        }

        private TemplateValidationResult ValidateTemplate(NotificationTemplate template)
        {
            var result = new TemplateValidationResult { IsValid = true };

            if (string.IsNullOrWhiteSpace(template.Id))
            {
                result.IsValid = false;
                result.Errors.Add("Template ID is required");
            }

            if (string.IsNullOrWhiteSpace(template.Name))
            {
                result.IsValid = false;
                result.Errors.Add("Template name is required");
            }

            if (string.IsNullOrWhiteSpace(template.Subject))
            {
                result.IsValid = false;
                result.Errors.Add("Template subject is required");
            }

            if (string.IsNullOrWhiteSpace(template.Body))
            {
                result.IsValid = false;
                result.Errors.Add("Template body is required");
            }

            // Validate recipients if provided
            if (template.Recipients?.Any() == true)
            {
                var invalidEmails = template.Recipients.Where(email => !IsValidEmail(email)).ToList();
                if (invalidEmails.Any())
                {
                    result.Warnings.Add($"Invalid email addresses: {string.Join(", ", invalidEmails)}");
                }
            }

            return result;
        }

        private List<string> ExtractUsedTokens(string text)
        {
            if (string.IsNullOrEmpty(text))
                return new List<string>();

            var tokenRegex = new Regex(@"\{(\w+)\}", RegexOptions.IgnoreCase);
            var matches = tokenRegex.Matches(text);
            
            return matches.Cast<Match>()
                .Select(m => m.Groups[1].Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(t => t)
                .ToList();
        }

        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }

    #region Supporting Classes and Enums

    public class NotificationTemplate
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public NotificationTemplateType Type { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
    }

    public enum NotificationTemplateType
    {
        PreMigration,
        PostMigration,
        Alert,
        Custom
    }

    public class NotificationPreview
    {
        public string TemplateId { get; set; }
        public string TemplateName { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public List<string> Recipients { get; set; } = new List<string>();
        public List<string> ValidRecipients { get; set; } = new List<string>();
        public List<string> InvalidRecipients { get; set; } = new List<string>();
        public List<string> UsedTokens { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
        public bool HasError { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class TemplateToken
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Example { get; set; }
        public bool IsRequired { get; set; }
    }

    public class TemplateValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    public class TemplateExportData
    {
        public DateTime ExportedAt { get; set; }
        public string Version { get; set; }
        public List<NotificationTemplate> Templates { get; set; } = new List<NotificationTemplate>();
    }

    public class TemplateImportResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public int TotalProcessed { get; set; }
        public List<string> ImportedTemplates { get; set; } = new List<string>();
        public List<string> UpdatedTemplates { get; set; } = new List<string>();
        public List<string> SkippedTemplates { get; set; } = new List<string>();
        public List<FailedTemplateImport> FailedTemplates { get; set; } = new List<FailedTemplateImport>();
    }

    public class FailedTemplateImport
    {
        public string TemplateId { get; set; }
        public string Error { get; set; }
    }

    #endregion
}