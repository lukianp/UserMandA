using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Tests.Migration.Notifications
{
    /// <summary>
    /// Comprehensive test suite for T-033 Notification Template System
    /// Tests template management, token replacement, validation, and persistence
    /// </summary>
    [TestClass]
    public class NotificationTemplateTests
    {
        #region Test Setup

        private Mock<ILogger<NotificationTemplateService>> _mockLogger;
        private NotificationTemplateService _templateService;
        private string _testProfilePath;

        [TestInitialize]
        public void TestInitialize()
        {
            _mockLogger = new Mock<ILogger<NotificationTemplateService>>();
            
            // Create a temporary test directory
            _testProfilePath = Path.Combine(Path.GetTempPath(), $"NotificationTemplateTests_{Guid.NewGuid()}");
            Directory.CreateDirectory(_testProfilePath);

            _templateService = new NotificationTemplateService(_testProfilePath, _mockLogger.Object);
        }

        [TestCleanup]
        public void TestCleanup()
        {
            _templateService?.Dispose();
            
            // Clean up test directory
            if (Directory.Exists(_testProfilePath))
            {
                Directory.Delete(_testProfilePath, true);
            }
        }

        #endregion

        #region Template CRUD Tests

        [TestMethod]
        public async Task SaveTemplate_ValidTemplate_SavesSuccessfully()
        {
            // Arrange
            var template = CreateTestTemplate("test-save", NotificationTemplateType.PreMigration);

            // Act
            var result = await _templateService.SaveTemplateAsync(template);

            // Assert
            Assert.IsTrue(result, "Template should save successfully");
            
            var savedTemplate = await _templateService.GetTemplateAsync(template.Id);
            Assert.IsNotNull(savedTemplate);
            Assert.AreEqual(template.Name, savedTemplate.Name);
            Assert.AreEqual(template.Subject, savedTemplate.Subject);
            Assert.AreEqual(template.Body, savedTemplate.Body);
        }

        [TestMethod]
        public async Task SaveTemplate_NullTemplate_ReturnsFalse()
        {
            // Arrange & Act
            var result = await _templateService.SaveTemplateAsync(null);

            // Assert
            Assert.IsFalse(result, "Saving null template should return false");
        }

        [TestMethod]
        public async Task SaveTemplate_InvalidTemplate_ReturnsFalse()
        {
            // Arrange
            var template = CreateTestTemplate("invalid-template", NotificationTemplateType.PreMigration);
            template.Name = null; // Make it invalid
            template.Subject = null; // Make it invalid

            // Act
            var result = await _templateService.SaveTemplateAsync(template);

            // Assert
            Assert.IsFalse(result, "Saving invalid template should return false");
        }

        [TestMethod]
        public async Task GetTemplate_ExistingTemplate_ReturnsTemplate()
        {
            // Arrange
            var template = CreateTestTemplate("get-test", NotificationTemplateType.PostMigration);
            await _templateService.SaveTemplateAsync(template);

            // Act
            var retrievedTemplate = await _templateService.GetTemplateAsync(template.Id);

            // Assert
            Assert.IsNotNull(retrievedTemplate);
            Assert.AreEqual(template.Id, retrievedTemplate.Id);
            Assert.AreEqual(template.Name, retrievedTemplate.Name);
        }

        [TestMethod]
        public async Task GetTemplate_NonExistentTemplate_ReturnsNull()
        {
            // Arrange
            var nonExistentId = "non-existent-template";

            // Act
            var retrievedTemplate = await _templateService.GetTemplateAsync(nonExistentId);

            // Assert
            Assert.IsNull(retrievedTemplate);
        }

        [TestMethod]
        public async Task DeleteTemplate_ExistingTemplate_DeletesSuccessfully()
        {
            // Arrange
            var template = CreateTestTemplate("delete-test", NotificationTemplateType.Alert);
            await _templateService.SaveTemplateAsync(template);

            // Act
            var deleteResult = await _templateService.DeleteTemplateAsync(template.Id);

            // Assert
            Assert.IsTrue(deleteResult, "Template should be deleted successfully");
            
            var retrievedTemplate = await _templateService.GetTemplateAsync(template.Id);
            Assert.IsNull(retrievedTemplate, "Template should no longer exist");
        }

        [TestMethod]
        public async Task DeleteTemplate_NonExistentTemplate_ReturnsFalse()
        {
            // Arrange
            var nonExistentId = "non-existent-template";

            // Act
            var deleteResult = await _templateService.DeleteTemplateAsync(nonExistentId);

            // Assert
            Assert.IsFalse(deleteResult, "Deleting non-existent template should return false");
        }

        [TestMethod]
        public async Task LoadTemplates_MultipleTemplates_LoadsAll()
        {
            // Arrange
            var templates = new[]
            {
                CreateTestTemplate("load-1", NotificationTemplateType.PreMigration),
                CreateTestTemplate("load-2", NotificationTemplateType.PostMigration),
                CreateTestTemplate("load-3", NotificationTemplateType.Alert)
            };

            foreach (var template in templates)
            {
                await _templateService.SaveTemplateAsync(template);
            }

            // Act
            var loadedTemplates = await _templateService.LoadTemplatesAsync();

            // Assert
            Assert.IsTrue(loadedTemplates.Count >= templates.Length, 
                $"Should load at least {templates.Length} templates, but loaded {loadedTemplates.Count}");
            
            foreach (var originalTemplate in templates)
            {
                var loadedTemplate = loadedTemplates.FirstOrDefault(t => t.Id == originalTemplate.Id);
                Assert.IsNotNull(loadedTemplate, $"Template {originalTemplate.Id} should be loaded");
            }
        }

        #endregion

        #region Token Replacement Tests

        [TestMethod]
        public void ReplaceTokens_BasicTokens_ReplacesCorrectly()
        {
            // Arrange
            var template = "Hello {UserDisplayName}, your migration is scheduled for {MigrationDate}.";
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                MigrationDate = "2024-03-15"
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            var expected = "Hello John Smith, your migration is scheduled for 2024-03-15.";
            Assert.AreEqual(expected, result);
        }

        [TestMethod]
        public void ReplaceTokens_CaseSensitiveTokens_ReplacesCorrectly()
        {
            // Arrange
            var template = "Hello {UserDisplayName} and {userdisplayname}.";
            var tokenData = new
            {
                UserDisplayName = "John Smith"
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            var expected = "Hello John Smith and John Smith.";
            Assert.AreEqual(expected, result);
        }

        [TestMethod]
        public void ReplaceTokens_MissingTokens_LeavesTokensUnreplaced()
        {
            // Arrange
            var template = "Hello {UserDisplayName}, your {MigrationDate} is {MissingToken}.";
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                MigrationDate = "2024-03-15"
                // MissingToken is not provided
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            var expected = "Hello John Smith, your 2024-03-15 is {MissingToken}.";
            Assert.AreEqual(expected, result);
        }

        [TestMethod]
        public void ReplaceTokens_NullValues_ReplacesWithEmpty()
        {
            // Arrange
            var template = "Hello {UserDisplayName}, your job title is {UserJobTitle}.";
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                UserJobTitle = (string)null
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            var expected = "Hello John Smith, your job title is .";
            Assert.AreEqual(expected, result);
        }

        [TestMethod]
        public void ReplaceTokens_ComplexTokenData_HandlesAllTypes()
        {
            // Arrange
            var template = "User: {UserDisplayName}, Count: {ItemCount}, Active: {IsActive}, Date: {CurrentDate}";
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                ItemCount = 42,
                IsActive = true,
                CurrentDate = new DateTime(2024, 3, 15)
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            Assert.IsTrue(result.Contains("John Smith"));
            Assert.IsTrue(result.Contains("42"));
            Assert.IsTrue(result.Contains("True"));
            Assert.IsTrue(result.Contains("2024"));
        }

        [TestMethod]
        public void ReplaceTokens_NoTokens_ReturnsOriginal()
        {
            // Arrange
            var template = "This is a plain text message with no tokens.";
            var tokenData = new
            {
                UserDisplayName = "John Smith"
            };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            Assert.AreEqual(template, result);
        }

        [TestMethod]
        public void ReplaceTokens_EmptyTemplate_ReturnsEmpty()
        {
            // Arrange
            var template = "";
            var tokenData = new { UserDisplayName = "John Smith" };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            Assert.AreEqual("", result);
        }

        [TestMethod]
        public void ReplaceTokens_NullTemplate_ReturnsEmpty()
        {
            // Arrange
            string template = null;
            var tokenData = new { UserDisplayName = "John Smith" };

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            Assert.AreEqual("", result);
        }

        [TestMethod]
        public void ReplaceTokens_NullTokenData_ReturnsOriginal()
        {
            // Arrange
            var template = "Hello {UserDisplayName}";
            object tokenData = null;

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            // Assert
            Assert.AreEqual(template, result);
        }

        #endregion

        #region Template Preview Tests

        [TestMethod]
        public void CreatePreview_ValidTemplate_CreatesCorrectPreview()
        {
            // Arrange
            var template = CreateTestTemplate("preview-test", NotificationTemplateType.PreMigration);
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                UserEmail = "john.smith@company.com",
                MigrationDate = "2024-03-15",
                MigrationTime = "09:00 AM",
                WaveName = "Wave-01",
                EstimatedDuration = "4 hours",
                ItemsToMigrate = "150"
            };

            // Act
            var preview = _templateService.CreatePreview(template, tokenData);

            // Assert
            Assert.IsNotNull(preview);
            Assert.AreEqual(template.Id, preview.TemplateId);
            Assert.AreEqual(template.Name, preview.TemplateName);
            Assert.IsFalse(preview.HasError);
            
            // Verify token replacement
            Assert.IsTrue(preview.Subject.Contains("John Smith"));
            Assert.IsTrue(preview.Body.Contains("John Smith"));
            Assert.IsTrue(preview.Body.Contains("2024-03-15"));
            Assert.IsTrue(preview.Body.Contains("09:00 AM"));
        }

        [TestMethod]
        public void CreatePreview_NullTemplate_ReturnsErrorPreview()
        {
            // Arrange
            NotificationTemplate template = null;
            var tokenData = new { UserDisplayName = "John Smith" };

            // Act
            var preview = _templateService.CreatePreview(template, tokenData);

            // Assert
            Assert.IsNotNull(preview);
            Assert.IsTrue(preview.HasError);
            Assert.IsNotNull(preview.ErrorMessage);
        }

        [TestMethod]
        public void CreatePreview_ExtractsUsedTokens()
        {
            // Arrange
            var template = CreateTestTemplate("token-extraction", NotificationTemplateType.PreMigration);
            template.Subject = "Hello {UserDisplayName}";
            template.Body = "Your migration on {MigrationDate} at {MigrationTime} for {WaveName} is ready.";
            
            var tokenData = new
            {
                UserDisplayName = "John Smith",
                MigrationDate = "2024-03-15",
                MigrationTime = "09:00 AM",
                WaveName = "Wave-01"
            };

            // Act
            var preview = _templateService.CreatePreview(template, tokenData);

            // Assert
            Assert.IsNotNull(preview.UsedTokens);
            Assert.IsTrue(preview.UsedTokens.Contains("UserDisplayName"));
            Assert.IsTrue(preview.UsedTokens.Contains("MigrationDate"));
            Assert.IsTrue(preview.UsedTokens.Contains("MigrationTime"));
            Assert.IsTrue(preview.UsedTokens.Contains("WaveName"));
        }

        [TestMethod]
        public void CreatePreview_ValidatesRecipients()
        {
            // Arrange
            var template = CreateTestTemplate("recipient-validation", NotificationTemplateType.Alert);
            template.Recipients = new List<string>
            {
                "valid@company.com",
                "invalid-email",
                "another.valid@company.com",
                "also-invalid"
            };

            var tokenData = new { UserDisplayName = "John Smith" };

            // Act
            var preview = _templateService.CreatePreview(template, tokenData);

            // Assert
            Assert.IsNotNull(preview.ValidRecipients);
            Assert.IsNotNull(preview.InvalidRecipients);
            
            Assert.AreEqual(2, preview.ValidRecipients.Count);
            Assert.IsTrue(preview.ValidRecipients.Contains("valid@company.com"));
            Assert.IsTrue(preview.ValidRecipients.Contains("another.valid@company.com"));
            
            Assert.AreEqual(2, preview.InvalidRecipients.Count);
            Assert.IsTrue(preview.InvalidRecipients.Contains("invalid-email"));
            Assert.IsTrue(preview.InvalidRecipients.Contains("also-invalid"));
        }

        #endregion

        #region Template Validation Tests

        [TestMethod]
        public async Task SaveTemplate_ValidatesRequiredFields()
        {
            // Arrange - Test each required field
            var testCases = new[]
            {
                new { field = "Id", template = CreateInvalidTemplate(id: null) },
                new { field = "Name", template = CreateInvalidTemplate(name: null) },
                new { field = "Subject", template = CreateInvalidTemplate(subject: null) },
                new { field = "Body", template = CreateInvalidTemplate(body: null) }
            };

            // Act & Assert
            foreach (var testCase in testCases)
            {
                var result = await _templateService.SaveTemplateAsync(testCase.template);
                Assert.IsFalse(result, $"Template with null {testCase.field} should not save");
            }
        }

        [TestMethod]
        public async Task SaveTemplate_ValidatesEmailAddresses()
        {
            // Arrange
            var template = CreateTestTemplate("email-validation", NotificationTemplateType.Alert);
            template.Recipients = new List<string>
            {
                "valid@company.com",
                "invalid-email",
                "another-invalid"
            };

            // Act
            var result = await _templateService.SaveTemplateAsync(template);

            // Assert
            // Should still save (warnings, not errors for invalid emails)
            Assert.IsTrue(result, "Template should save even with invalid email warnings");
        }

        #endregion

        #region Available Tokens Tests

        [TestMethod]
        public void GetAvailableTokens_PreMigration_ReturnsCorrectTokens()
        {
            // Arrange & Act
            var tokens = _templateService.GetAvailableTokens(NotificationTemplateType.PreMigration);

            // Assert
            Assert.IsNotNull(tokens);
            Assert.IsTrue(tokens.Count > 0);
            
            // Check for common tokens
            Assert.IsTrue(tokens.Any(t => t.Name == "UserDisplayName"));
            Assert.IsTrue(tokens.Any(t => t.Name == "UserEmail"));
            Assert.IsTrue(tokens.Any(t => t.Name == "CompanyName"));
            Assert.IsTrue(tokens.Any(t => t.Name == "CurrentDate"));
            
            // Check for pre-migration specific tokens
            Assert.IsTrue(tokens.Any(t => t.Name == "MigrationDate"));
            Assert.IsTrue(tokens.Any(t => t.Name == "MigrationTime"));
            Assert.IsTrue(tokens.Any(t => t.Name == "WaveName"));
            Assert.IsTrue(tokens.Any(t => t.Name == "EstimatedDuration"));
        }

        [TestMethod]
        public void GetAvailableTokens_PostMigration_ReturnsCorrectTokens()
        {
            // Arrange & Act
            var tokens = _templateService.GetAvailableTokens(NotificationTemplateType.PostMigration);

            // Assert
            Assert.IsNotNull(tokens);
            Assert.IsTrue(tokens.Count > 0);
            
            // Check for post-migration specific tokens
            Assert.IsTrue(tokens.Any(t => t.Name == "MigrationStatus"));
            Assert.IsTrue(tokens.Any(t => t.Name == "MigrationStartTime"));
            Assert.IsTrue(tokens.Any(t => t.Name == "MigrationEndTime"));
            Assert.IsTrue(tokens.Any(t => t.Name == "ItemsMigrated"));
            Assert.IsTrue(tokens.Any(t => t.Name == "ItemsFailed"));
            Assert.IsTrue(tokens.Any(t => t.Name == "NextSteps"));
        }

        [TestMethod]
        public void GetAvailableTokens_Alert_ReturnsCorrectTokens()
        {
            // Arrange & Act
            var tokens = _templateService.GetAvailableTokens(NotificationTemplateType.Alert);

            // Assert
            Assert.IsNotNull(tokens);
            Assert.IsTrue(tokens.Count > 0);
            
            // Check for alert specific tokens
            Assert.IsTrue(tokens.Any(t => t.Name == "AlertType"));
            Assert.IsTrue(tokens.Any(t => t.Name == "AlertMessage"));
            Assert.IsTrue(tokens.Any(t => t.Name == "AlertTime"));
            Assert.IsTrue(tokens.Any(t => t.Name == "AffectedItems"));
            Assert.IsTrue(tokens.Any(t => t.Name == "RecommendedAction"));
        }

        [TestMethod]
        public void GetAvailableTokens_TokensHaveExamples()
        {
            // Arrange & Act
            var tokens = _templateService.GetAvailableTokens(NotificationTemplateType.PreMigration);

            // Assert
            foreach (var token in tokens)
            {
                Assert.IsNotNull(token.Name, "Token name should not be null");
                Assert.IsNotNull(token.Description, "Token description should not be null");
                Assert.IsNotNull(token.Example, "Token example should not be null");
                Assert.IsFalse(string.IsNullOrWhiteSpace(token.Name), "Token name should not be empty");
                Assert.IsFalse(string.IsNullOrWhiteSpace(token.Description), "Token description should not be empty");
            }
        }

        #endregion

        #region Template Duplication Tests

        [TestMethod]
        public async Task DuplicateTemplate_ExistingTemplate_CreatesCorrectDuplicate()
        {
            // Arrange
            var originalTemplate = CreateTestTemplate("original", NotificationTemplateType.PreMigration);
            await _templateService.SaveTemplateAsync(originalTemplate);

            // Act
            var duplicatedTemplate = await _templateService.DuplicateTemplateAsync(originalTemplate.Id, "Duplicated Template");

            // Assert
            Assert.IsNotNull(duplicatedTemplate);
            Assert.AreNotEqual(originalTemplate.Id, duplicatedTemplate.Id);
            Assert.AreEqual("Duplicated Template", duplicatedTemplate.Name);
            Assert.AreEqual(originalTemplate.Subject, duplicatedTemplate.Subject);
            Assert.AreEqual(originalTemplate.Body, duplicatedTemplate.Body);
            Assert.AreEqual(originalTemplate.Type, duplicatedTemplate.Type);
            Assert.IsFalse(duplicatedTemplate.IsActive); // New templates start inactive
        }

        [TestMethod]
        public async Task DuplicateTemplate_NonExistentTemplate_ReturnsNull()
        {
            // Arrange
            var nonExistentId = "non-existent-template";

            // Act
            var duplicatedTemplate = await _templateService.DuplicateTemplateAsync(nonExistentId, "New Name");

            // Assert
            Assert.IsNull(duplicatedTemplate);
        }

        #endregion

        #region Template Import/Export Tests

        [TestMethod]
        public async Task ExportTemplates_WithTemplates_CreatesValidExportFile()
        {
            // Arrange
            var templates = new[]
            {
                CreateTestTemplate("export-1", NotificationTemplateType.PreMigration),
                CreateTestTemplate("export-2", NotificationTemplateType.PostMigration)
            };

            foreach (var template in templates)
            {
                await _templateService.SaveTemplateAsync(template);
            }

            var exportPath = Path.Combine(_testProfilePath, "export-test.json");

            // Act
            var result = await _templateService.ExportTemplatesAsync(exportPath);

            // Assert
            Assert.IsTrue(result, "Export should succeed");
            Assert.IsTrue(File.Exists(exportPath), "Export file should be created");
            
            var exportContent = await File.ReadAllTextAsync(exportPath);
            Assert.IsTrue(exportContent.Length > 0, "Export file should not be empty");
            Assert.IsTrue(exportContent.Contains("export-1"), "Export should contain first template");
            Assert.IsTrue(exportContent.Contains("export-2"), "Export should contain second template");
        }

        [TestMethod]
        public async Task ImportTemplates_ValidFile_ImportsSuccessfully()
        {
            // Arrange
            var originalTemplates = new[]
            {
                CreateTestTemplate("import-1", NotificationTemplateType.PreMigration),
                CreateTestTemplate("import-2", NotificationTemplateType.PostMigration)
            };

            foreach (var template in originalTemplates)
            {
                await _templateService.SaveTemplateAsync(template);
            }

            var exportPath = Path.Combine(_testProfilePath, "import-test.json");
            await _templateService.ExportTemplatesAsync(exportPath);

            // Clear templates and create new service
            var newTestPath = Path.Combine(Path.GetTempPath(), $"ImportTest_{Guid.NewGuid()}");
            Directory.CreateDirectory(newTestPath);
            var newService = new NotificationTemplateService(newTestPath, _mockLogger.Object);

            // Act
            var importResult = await newService.ImportTemplatesAsync(exportPath);

            // Assert
            Assert.IsTrue(importResult.Success, "Import should succeed");
            Assert.AreEqual(originalTemplates.Length, importResult.ImportedTemplates.Count);
            
            var importedTemplates = await newService.LoadTemplatesAsync();
            Assert.AreEqual(originalTemplates.Length, importedTemplates.Count);

            // Cleanup
            newService.Dispose();
            Directory.Delete(newTestPath, true);
        }

        [TestMethod]
        public async Task ImportTemplates_NonExistentFile_ReturnsFailure()
        {
            // Arrange
            var nonExistentPath = Path.Combine(_testProfilePath, "non-existent.json");

            // Act
            var result = await _templateService.ImportTemplatesAsync(nonExistentPath);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.AreEqual("Import file does not exist", result.ErrorMessage);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task TemplateOperations_LargeNumberOfTemplates_PerformsWell()
        {
            // Arrange
            const int templateCount = 100;
            var templates = Enumerable.Range(1, templateCount)
                                    .Select(i => CreateTestTemplate($"perf-template-{i}", 
                                        (NotificationTemplateType)(i % 3)))
                                    .ToList();

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act - Save all templates
            var saveTasks = templates.Select(t => _templateService.SaveTemplateAsync(t));
            var saveResults = await Task.WhenAll(saveTasks);

            // Load all templates
            var loadedTemplates = await _templateService.LoadTemplatesAsync();

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(saveResults.All(r => r), "All templates should save successfully");
            Assert.IsTrue(loadedTemplates.Count >= templateCount, 
                $"Should load at least {templateCount} templates");
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 10000, // Should complete in under 10 seconds
                $"Operations with {templateCount} templates took {stopwatch.ElapsedMilliseconds}ms");
        }

        [TestMethod]
        public void TokenReplacement_LargeTemplate_PerformsWell()
        {
            // Arrange
            const int tokenCount = 1000;
            var templateParts = new List<string>();
            var tokenData = new Dictionary<string, object>();

            for (int i = 0; i < tokenCount; i++)
            {
                templateParts.Add($"Token{i}: {{Token{i}}} ");
                tokenData[$"Token{i}"] = $"Value{i}";
            }

            var template = string.Join("", templateParts);
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = _templateService.ReplaceTokens(template, tokenData);

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(result.Length > template.Length, "Result should be longer due to replacements");
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 1000, // Should complete in under 1 second
                $"Token replacement with {tokenCount} tokens took {stopwatch.ElapsedMilliseconds}ms");
        }

        #endregion

        #region Helper Methods

        private NotificationTemplate CreateTestTemplate(string id, NotificationTemplateType type)
        {
            return new NotificationTemplate
            {
                Id = id,
                Name = $"Test Template {id}",
                Description = $"Test template for {type}",
                Type = type,
                Subject = GetDefaultSubject(type),
                Body = GetDefaultBody(type),
                Recipients = new List<string> { "test@company.com" },
                IsActive = true,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                CreatedBy = "TestUser"
            };
        }

        private NotificationTemplate CreateInvalidTemplate(
            string id = "test-invalid", 
            string name = "Test Invalid", 
            string subject = "Test Subject", 
            string body = "Test Body")
        {
            return new NotificationTemplate
            {
                Id = id,
                Name = name,
                Subject = subject,
                Body = body,
                Type = NotificationTemplateType.PreMigration
            };
        }

        private string GetDefaultSubject(NotificationTemplateType type)
        {
            return type switch
            {
                NotificationTemplateType.PreMigration => "Migration Scheduled: {UserDisplayName}",
                NotificationTemplateType.PostMigration => "Migration Complete: {UserDisplayName}",
                NotificationTemplateType.Alert => "Migration Alert: {AlertType}",
                _ => "Test Subject"
            };
        }

        private string GetDefaultBody(NotificationTemplateType type)
        {
            return type switch
            {
                NotificationTemplateType.PreMigration => @"Dear {UserDisplayName},
                    Your migration is scheduled for {MigrationDate} at {MigrationTime}.
                    Wave: {WaveName}
                    Estimated Duration: {EstimatedDuration}",
                
                NotificationTemplateType.PostMigration => @"Dear {UserDisplayName},
                    Your migration has been completed.
                    Status: {MigrationStatus}
                    Items Migrated: {ItemsMigrated}",
                
                NotificationTemplateType.Alert => @"Alert: {AlertType}
                    Message: {AlertMessage}
                    Affected Items: {AffectedItems}
                    Action: {RecommendedAction}",
                
                _ => "Test body with {UserDisplayName}"
            };
        }

        #endregion
    }
}