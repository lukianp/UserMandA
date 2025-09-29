using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Migration.UI
{
    /// <summary>
    /// Comprehensive tests for MigrationValidationViewModel functionality
    /// </summary>
    [TestClass]
    public class MigrationValidationUITests
    {
        private MigrationValidationViewModel _viewModel;
        private Mock<PostMigrationValidationService> _mockValidationService;

        [TestInitialize]
        public void Setup()
        {
            _mockValidationService = new Mock<PostMigrationValidationService>(
                Mock.Of<IUserValidationProvider>(),
                Mock.Of<IMailboxValidationProvider>(),
                Mock.Of<IFileValidationProvider>(),
                Mock.Of<ISqlValidationProvider>());

            _viewModel = new MigrationValidationViewModel(_mockValidationService.Object);
        }

        #region Constructor and Initialization Tests

        [TestMethod]
        public void Constructor_WithValidService_InitializesCorrectly()
        {
            // Assert
            Assert.IsNotNull(_viewModel, "ViewModel should be created");
            Assert.IsNotNull(_viewModel.ValidationResults, "ValidationResults collection should be initialized");
            Assert.IsNotNull(_viewModel.FilteredValidationResults, "FilteredValidationResults should be initialized");
            Assert.IsNotNull(_viewModel.ObjectTypeFilters, "ObjectTypeFilters should be initialized");
            Assert.IsNotNull(_viewModel.SeverityFilters, "SeverityFilters should be initialized");
            Assert.AreEqual("All", _viewModel.SelectedObjectTypeFilter, "Default object type filter should be 'All'");
            Assert.AreEqual("All", _viewModel.SelectedSeverityFilter, "Default severity filter should be 'All'");
        }

        [TestMethod]
        public void Constructor_InitializesCommands()
        {
            // Assert
            Assert.IsNotNull(_viewModel.RefreshCommand, "RefreshCommand should be initialized");
            Assert.IsNotNull(_viewModel.ValidateWaveCommand, "ValidateWaveCommand should be initialized");
            Assert.IsNotNull(_viewModel.ExportReportCommand, "ExportReportCommand should be initialized");
            Assert.IsNotNull(_viewModel.ShowDetailsCommand, "ShowDetailsCommand should be initialized");
            Assert.IsNotNull(_viewModel.RollbackCommand, "RollbackCommand should be initialized");
            Assert.IsNotNull(_viewModel.ClearFiltersCommand, "ClearFiltersCommand should be initialized");
        }

        #endregion

        #region Load Validation Results Tests

        [TestMethod]
        public async Task LoadValidationResultsAsync_WithValidWave_LoadsResults()
        {
            // Arrange
            var wave = CreateTestWave();
            var expectedResults = CreateTestValidationResults();
            var targetContext = new MandADiscoverySuite.Migration.TargetContext();

            _mockValidationService
                .Setup(s => s.ValidateWaveAsync(wave, targetContext, It.IsAny<IProgress<MandADiscoverySuite.Migration.ValidationProgress>>()))
                .ReturnsAsync(expectedResults);

            // Act
            await _viewModel.LoadValidationResultsAsync(wave, targetContext);

            // Assert
            Assert.AreEqual(expectedResults.Count, _viewModel.ValidationResults.Count, "All results should be loaded");
            _mockValidationService.Verify(s => s.ValidateWaveAsync(wave, targetContext, It.IsAny<IProgress<MandADiscoverySuite.Migration.ValidationProgress>>()), Times.Once);
            Assert.IsTrue(_viewModel.StatusMessage.Contains("validation results"), "Status message should indicate results loaded");
        }

        [TestMethod]
        public async Task LoadValidationResultsAsync_Exception_HandlesError()
        {
            // Arrange
            var wave = CreateTestWave();
            var targetContext = new MandADiscoverySuite.Migration.TargetContext();
            var expectedException = new InvalidOperationException("Validation service error");

            _mockValidationService
                .Setup(s => s.ValidateWaveAsync(It.IsAny<MandADiscoverySuite.Models.Migration.MigrationWave>(),
                                                It.IsAny<MandADiscoverySuite.Migration.TargetContext>(),
                                                It.IsAny<IProgress<MandADiscoverySuite.Migration.ValidationProgress>>()))
                .ThrowsAsync(expectedException);

            // Act
            await _viewModel.LoadValidationResultsAsync(wave, targetContext);

            // Assert
            Assert.IsTrue(_viewModel.StatusMessage.Contains("Failed to load"), "Should show error message");
            Assert.IsFalse(_viewModel.IsValidating, "Should not be validating after error");
            Assert.AreEqual(0, _viewModel.ProgressPercentage, "Progress should be reset");
        }

        #endregion

        #region Add/Update Validation Result Tests

        [TestMethod]
        public void AddValidationResult_WithValidResult_AddsToCollection()
        {
            // Arrange
            var result = CreateTestValidationResult();

            // Act
            _viewModel.AddValidationResult(result);

            // Assert
            Assert.AreEqual(1, _viewModel.ValidationResults.Count, "Result should be added");
            Assert.AreEqual(result, _viewModel.ValidationResults[0], "Same result should be added");
            Assert.IsTrue(_viewModel.HasFailedItems, "Should detect failed items");
        }

        [TestMethod]
        public void UpdateValidationResult_WithExistingResult_UpdatesCollection()
        {
            // Arrange
            var originalResult = CreateTestValidationResult("original", "User", ValidationSeverity.Error);
            var updatedResult = CreateTestValidationResult("updated", "User", ValidationSeverity.Success);
            updatedResult.Id = originalResult.Id;
            _viewModel.AddValidationResult(originalResult);

            // Act
            _viewModel.UpdateValidationResult(updatedResult);

            // Assert
            Assert.AreEqual(1, _viewModel.ValidationResults.Count, "Should still have one result");
            Assert.AreEqual("updated", _viewModel.ValidationResults[0].ObjectName, "Result should be updated");
            Assert.AreEqual(ValidationSeverity.Success, _viewModel.ValidationResults[0].Severity, "Severity should be updated");
        }

        #endregion

        #region Filtering Tests

        [TestMethod]
        public void SearchText_Filter_AppliesCorrectly()
        {
            // Arrange
            var results = new List<ValidationResult>
            {
                CreateTestValidationResult("user1@contoso.com", "User", ValidationSeverity.Success),
                CreateTestValidationResult("user2@contoso.com", "User", ValidationSeverity.Error),
                CreateTestValidationResult("mailbox1@contoso.com", "Mailbox", ValidationSeverity.Warning)
            };

            foreach (var result in results)
            {
                _viewModel.AddValidationResult(result);
            }

            // Act
            _viewModel.SearchText = "user1";

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults.Cast<ValidationResult>().ToList();
            Assert.AreEqual(1, filteredResults.Count, "Should filter to one result");
            Assert.AreEqual("user1@contoso.com", filteredResults[0].ObjectName, "Should find the correct result");
        }

        [TestMethod]
        public void ObjectTypeFilter_Filter_AppliesCorrectly()
        {
            // Arrange
            var results = new List<ValidationResult>
            {
                CreateTestValidationResult("user1@contoso.com", "User", ValidationSeverity.Success),
                CreateTestValidationResult("mailbox1@contoso.com", "Mailbox", ValidationSeverity.Warning)
            };

            foreach (var result in results)
            {
                _viewModel.AddValidationResult(result);
            }

            // Act
            _viewModel.SelectedObjectTypeFilter = "User";

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults.Cast<ValidationResult>().ToList();
            Assert.AreEqual(1, filteredResults.Count, "Should filter to one result");
            Assert.AreEqual("User", filteredResults[0].ObjectType, "Should find the correct result");
        }

        [TestMethod]
        public void SeverityFilter_Filter_AppliesCorrectly()
        {
            // Arrange
            var results = new List<ValidationResult>
            {
                CreateTestValidationResult("user1@contoso.com", "User", ValidationSeverity.Success),
                CreateTestValidationResult("user2@contoso.com", "User", ValidationSeverity.Error)
            };

            foreach (var result in results)
            {
                _viewModel.AddValidationResult(result);
            }

            // Act
            _viewModel.SelectedSeverityFilter = "Error";

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults.Cast<ValidationResult>().ToList();
            Assert.AreEqual(1, filteredResults.Count, "Should filter to one result");
            Assert.AreEqual(ValidationSeverity.Error, filteredResults[0].Severity, "Should find the correct result");
        }

        [TestMethod]
        public void ClearFiltersCommand_ResetsAllFilters()
        {
            // Arrange
            _viewModel.SearchText = "test";
            _viewModel.SelectedObjectTypeFilter = "User";
            _viewModel.SelectedSeverityFilter = "Error";

            // Act
            _viewModel.ClearFiltersCommand.Execute(null);

            // Assert
            Assert.AreEqual(string.Empty, _viewModel.SearchText, "Search text should be cleared");
            Assert.AreEqual("All", _viewModel.SelectedObjectTypeFilter, "Object type filter should be reset");
            Assert.AreEqual("All", _viewModel.SelectedSeverityFilter, "Severity filter should be reset");
            Assert.IsTrue(_viewModel.StatusMessage.Contains("cleared"), "Status should indicate filters cleared");
        }

        #endregion

        #region Command Tests

        [TestMethod]
        public async Task RefreshCommand_ExecutesSuccessfully()
        {
            // Act
            await ((dynamic)_viewModel.RefreshCommand).ExecuteAsync();

            // Assert
            Assert.IsTrue(_viewModel.StatusMessage.Contains("refreshed"), "Should show refresh completed message");
        }

        [TestMethod]
        public async Task ValidateWaveCommand_ExecutesSuccessfully()
        {
            // Act
            await ((dynamic)_viewModel.ValidateWaveCommand).ExecuteAsync();

            // Assert
            Assert.IsTrue(_viewModel.StatusMessage.Contains("completed"), "Should show validation completed message");
            Assert.IsFalse(_viewModel.IsValidating, "Should not be validating after completion");
        }

        [TestMethod]
        public void ShowDetailsCommand_WithValidResult_SelectsResult()
        {
            // Arrange
            var result = CreateTestValidationResult();
            _viewModel.AddValidationResult(result);

            // Act
            _viewModel.ShowDetailsCommand.Execute(result);

            // Assert
            Assert.AreEqual(result, _viewModel.SelectedValidationResult, "Result should be selected");
            Assert.IsTrue(_viewModel.StatusMessage.Contains("details"), "Should show details message");
        }

        #endregion

        #region Helper Methods

        private void LoadTestData()
        {
            var results = CreateTestValidationResults();
            foreach (var result in results)
            {
                _viewModel.AddValidationResult(result);
            }
        }

        private MandADiscoverySuite.Models.Migration.MigrationWave CreateTestWave()
        {
            return new MandADiscoverySuite.Models.Migration.MigrationWave
            {
                Name = "Test Wave",
                Description = "Test migration wave",
                Users = new List<MandADiscoverySuite.Models.Migration.UserItem> { CreateTestUserItem() },
                Mailboxes = new List<MandADiscoverySuite.Models.Migration.MailboxItem> { CreateTestMailboxItem() },
                Files = new List<MandADiscoverySuite.Models.Migration.FileShareItem> { CreateTestFileShareItem() },
                Databases = new List<MandADiscoverySuite.Models.Migration.DatabaseItem> { CreateTestDatabaseItem() }
            };
        }

        private List<ValidationResult> CreateTestValidationResults()
        {
            return new List<ValidationResult>
            {
                CreateTestValidationResult("user1@contoso.com", "User", ValidationSeverity.Success),
                CreateTestValidationResult("user2@contoso.com", "User", ValidationSeverity.Error),
                CreateTestValidationResult("mailbox1@contoso.com", "Mailbox", ValidationSeverity.Warning),
                CreateTestValidationResult("file1", "File", ValidationSeverity.Error),
                CreateTestValidationResult("db1", "Database", ValidationSeverity.Success)
            };
        }

        private ValidationResult CreateTestValidationResult(string objectName = "testobject", string objectType = "User", ValidationSeverity severity = ValidationSeverity.Success)
        {
            var result = new ValidationResult
            {
                Id = Guid.NewGuid().ToString(),
                ObjectName = objectName,
                ObjectType = objectType,
                Severity = severity,
                Message = $"Validation result for {objectName}",
                ValidatedAt = DateTime.Now,
                CanRollback = severity == ValidationSeverity.Error,
                ValidatedObject = CreateMockValidatedObject(objectType)
            };

            if (severity != ValidationSeverity.Success)
            {
                result.Issues.Add(new ValidationIssue { Severity = severity, Description = "Test issue", Category = "Test" });
            }

            return result;
        }

        private object CreateMockValidatedObject(string objectType)
        {
            return objectType.ToLowerInvariant() switch
            {
                "user" => CreateTestUserItem(),
                "mailbox" => CreateTestMailboxItem(),
                "file" => CreateTestFileShareItem(),
                "database" => CreateTestDatabaseItem(),
                _ => new object()
            };
        }

        private MandADiscoverySuite.Models.Migration.UserItem CreateTestUserItem()
        {
            return new MandADiscoverySuite.Models.Migration.UserItem
            {
                DisplayName = "Test User",
                UserPrincipalName = "testuser@contoso.com",
                Properties = new Dictionary<string, object>
                {
                    ["Department"] = "IT",
                    ["JobTitle"] = "Test Engineer"
                }
            };
        }

        private MandADiscoverySuite.Models.Migration.MailboxItem CreateTestMailboxItem()
        {
            return new MandADiscoverySuite.Models.Migration.MailboxItem
            {
                UserPrincipalName = "testuser@contoso.com",
                PrimarySmtpAddress = "testmailbox@contoso.com",
                SizeBytes = 1024 * 1024 * 100, // 100 MB
                Properties = new Dictionary<string, object>
                {
                    ["ItemCount"] = 1500,
                    ["Database"] = "TestDB01"
                }
            };
        }

        private MandADiscoverySuite.Models.Migration.FileShareItem CreateTestFileShareItem()
        {
            return new MandADiscoverySuite.Models.Migration.FileShareItem
            {
                SourcePath = @"\\source\share\TestFolder",
                TargetPath = @"\\target\share\TestFolder",
                SizeBytes = 1024 * 1024 * 500, // 500 MB
                Properties = new Dictionary<string, object>
                {
                    ["FileCount"] = 250
                }
            };
        }

        private MandADiscoverySuite.Models.Migration.DatabaseItem CreateTestDatabaseItem()
        {
            return new MandADiscoverySuite.Models.Migration.DatabaseItem
            {
                Name = "TestDatabase",
                SourceServer = "SourceSQLServer",
                TargetServer = "TargetSQLServer",
                SizeMB = 1024, // 1 GB
                Properties = new Dictionary<string, object>
                {
                    ["CompatibilityLevel"] = 150
                }
            };
        }

        #endregion
    }
}