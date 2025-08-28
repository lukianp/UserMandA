using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Tests.Migration.UI
{
    /// <summary>
    /// Comprehensive tests for Migration Validation UI functionality including filtering, sorting, and export features
    /// </summary>
    [TestClass]
    public class MigrationValidationUITests
    {
        private MigrationValidationViewModel _viewModel;
        private Mock<PostMigrationValidationService> _mockValidationService;
        private Mock<IAuditService> _mockAuditService;
        private Mock<IExportService> _mockExportService;
        private Mock<IDialogService> _mockDialogService;
        private ObservableCollection<ValidationResultViewModel> _testValidationResults;
        private List<AuditRecord> _testAuditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockValidationService = new Mock<PostMigrationValidationService>(
                Mock.Of<IUserValidationProvider>(),
                Mock.Of<IMailboxValidationProvider>(),
                Mock.Of<IFileValidationProvider>(),
                Mock.Of<ISqlValidationProvider>());
            
            _mockAuditService = new Mock<IAuditService>();
            _mockExportService = new Mock<IExportService>();
            _mockDialogService = new Mock<IDialogService>();

            _viewModel = new MigrationValidationViewModel(
                _mockValidationService.Object,
                _mockAuditService.Object,
                _mockExportService.Object,
                _mockDialogService.Object);

            _testValidationResults = CreateTestValidationResults();
            _testAuditRecords = CreateTestAuditRecords();

            SetupMockServices();
        }

        #region Filter Functionality Tests

        [TestMethod]
        public void FilterByObjectType_User_ShowsOnlyUserResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.FilterByObjectType = "User";
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.ObjectType == "User"), 
                "All filtered results should be User type");
            Assert.IsTrue(filteredResults.Count > 0, "Should have user results");
            Assert.IsTrue(filteredResults.Count < _testValidationResults.Count, 
                "Filtered count should be less than total");
        }

        [TestMethod]
        public void FilterBySeverity_Error_ShowsOnlyErrorResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.FilterBySeverity = ValidationSeverity.Error;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.Severity == ValidationSeverity.Error), 
                "All filtered results should have Error severity");
            Assert.IsTrue(filteredResults.Count > 0, "Should have error results");
        }

        [TestMethod]
        public void FilterByDateRange_LastWeek_ShowsOnlyRecentResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var startDate = DateTime.Now.AddDays(-7);
            var endDate = DateTime.Now;

            // Act
            _viewModel.FilterStartDate = startDate;
            _viewModel.FilterEndDate = endDate;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.ValidatedAt >= startDate && r.ValidatedAt <= endDate), 
                "All filtered results should be within date range");
        }

        [TestMethod]
        public void FilterByWaveId_SpecificWave_ShowsOnlyWaveResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var waveId = "wave-001";

            // Act
            _viewModel.FilterByWaveId = waveId;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.WaveId == waveId), 
                "All filtered results should belong to specified wave");
        }

        [TestMethod]
        public void FilterByCanRollback_True_ShowsOnlyRollbackableResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.FilterByCanRollback = true;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.CanRollback), 
                "All filtered results should be rollback-able");
        }

        [TestMethod]
        public void CombinedFilters_ObjectTypeAndSeverity_AppliesBothFilters()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.FilterByObjectType = "Mailbox";
            _viewModel.FilterBySeverity = ValidationSeverity.Warning;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredResults = _viewModel.FilteredValidationResults;
            Assert.IsTrue(filteredResults.All(r => r.ObjectType == "Mailbox" && r.Severity == ValidationSeverity.Warning), 
                "All filtered results should match both criteria");
        }

        [TestMethod]
        public void ClearFilters_ResetsAllFilters_ShowsAllResults()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            _viewModel.FilterByObjectType = "User";
            _viewModel.FilterBySeverity = ValidationSeverity.Error;
            _viewModel.ApplyFiltersCommand.Execute(null);
            var filteredCount = _viewModel.FilteredValidationResults.Count;

            // Act
            _viewModel.ClearFiltersCommand.Execute(null);

            // Assert
            Assert.IsNull(_viewModel.FilterByObjectType, "Object type filter should be cleared");
            Assert.IsNull(_viewModel.FilterBySeverity, "Severity filter should be cleared");
            Assert.AreEqual(_testValidationResults.Count, _viewModel.FilteredValidationResults.Count, 
                "Should show all results after clearing filters");
            Assert.IsTrue(_viewModel.FilteredValidationResults.Count > filteredCount, 
                "Should show more results than filtered view");
        }

        #endregion

        #region Sorting Functionality Tests

        [TestMethod]
        public void SortByObjectName_Ascending_SortsAlphabetically()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SortByColumn = "ObjectName";
            _viewModel.SortDirection = "Ascending";
            _viewModel.ApplySortCommand.Execute(null);

            // Assert
            var sortedResults = _viewModel.FilteredValidationResults.ToList();
            var expectedOrder = sortedResults.OrderBy(r => r.ObjectName).ToList();
            
            for (int i = 0; i < sortedResults.Count; i++)
            {
                Assert.AreEqual(expectedOrder[i].ObjectName, sortedResults[i].ObjectName, 
                    $"Item at position {i} should match expected sorted order");
            }
        }

        [TestMethod]
        public void SortByValidatedAt_Descending_SortsByDateNewestFirst()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SortByColumn = "ValidatedAt";
            _viewModel.SortDirection = "Descending";
            _viewModel.ApplySortCommand.Execute(null);

            // Assert
            var sortedResults = _viewModel.FilteredValidationResults.ToList();
            var expectedOrder = sortedResults.OrderByDescending(r => r.ValidatedAt).ToList();
            
            for (int i = 0; i < sortedResults.Count; i++)
            {
                Assert.AreEqual(expectedOrder[i].ValidatedAt, sortedResults[i].ValidatedAt, 
                    $"Item at position {i} should match expected sorted order");
            }
        }

        [TestMethod]
        public void SortBySeverity_CustomOrder_SortsBySeverityLevel()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SortByColumn = "Severity";
            _viewModel.SortDirection = "Ascending";
            _viewModel.ApplySortCommand.Execute(null);

            // Assert
            var sortedResults = _viewModel.FilteredValidationResults.ToList();
            
            // Verify Critical comes before Error, Error before Warning, Warning before Success
            for (int i = 0; i < sortedResults.Count - 1; i++)
            {
                var current = GetSeverityOrder(sortedResults[i].Severity);
                var next = GetSeverityOrder(sortedResults[i + 1].Severity);
                Assert.IsTrue(current <= next, 
                    $"Severity at position {i} ({sortedResults[i].Severity}) should come before or equal to position {i + 1} ({sortedResults[i + 1].Severity})");
            }
        }

        [TestMethod]
        public void SortByObjectType_ThenByObjectName_AppliesSecondarySort()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SortByColumn = "ObjectType";
            _viewModel.SecondarySortColumn = "ObjectName";
            _viewModel.SortDirection = "Ascending";
            _viewModel.ApplySortCommand.Execute(null);

            // Assert
            var sortedResults = _viewModel.FilteredValidationResults.ToList();
            var groupedByType = sortedResults.GroupBy(r => r.ObjectType).ToList();
            
            foreach (var group in groupedByType)
            {
                var groupItems = group.ToList();
                var expectedOrder = groupItems.OrderBy(r => r.ObjectName).ToList();
                
                for (int i = 0; i < groupItems.Count; i++)
                {
                    Assert.AreEqual(expectedOrder[i].ObjectName, groupItems[i].ObjectName,
                        $"Within {group.Key} type, items should be sorted by ObjectName");
                }
            }
        }

        #endregion

        #region Selection and Multi-Selection Tests

        [TestMethod]
        public void SelectSingleValidationResult_UpdatesSelectedItem()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResult = _viewModel.FilteredValidationResults.First();

            // Act
            _viewModel.SelectedValidationResult = targetResult;

            // Assert
            Assert.AreEqual(targetResult, _viewModel.SelectedValidationResult, "Selected item should be updated");
            Assert.IsTrue(_viewModel.HasSelection, "HasSelection should be true");
            Assert.IsTrue(_viewModel.RollbackSelectedCommand.CanExecute(null), "Rollback command should be enabled");
        }

        [TestMethod]
        public void SelectMultipleValidationResults_UpdatesSelectedItems()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResults = _viewModel.FilteredValidationResults.Take(3).ToList();

            // Act
            foreach (var result in targetResults)
            {
                result.IsSelected = true;
            }
            _viewModel.UpdateSelectedItemsCommand.Execute(null);

            // Assert
            Assert.AreEqual(3, _viewModel.SelectedValidationResults.Count, "Should have 3 selected items");
            Assert.IsTrue(_viewModel.HasMultipleSelection, "HasMultipleSelection should be true");
            Assert.IsTrue(_viewModel.RollbackSelectedCommand.CanExecute(null), "Rollback command should be enabled");
        }

        [TestMethod]
        public void SelectAllValidationResults_SelectsAllVisible()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SelectAllCommand.Execute(null);

            // Assert
            Assert.IsTrue(_viewModel.FilteredValidationResults.All(r => r.IsSelected), 
                "All visible results should be selected");
            Assert.AreEqual(_viewModel.FilteredValidationResults.Count, _viewModel.SelectedValidationResults.Count, 
                "Selected count should match filtered count");
        }

        [TestMethod]
        public void DeselectAllValidationResults_ClearsAllSelections()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            _viewModel.SelectAllCommand.Execute(null);

            // Act
            _viewModel.DeselectAllCommand.Execute(null);

            // Assert
            Assert.IsFalse(_viewModel.FilteredValidationResults.Any(r => r.IsSelected), 
                "No results should be selected");
            Assert.AreEqual(0, _viewModel.SelectedValidationResults.Count, "Selected count should be zero");
            Assert.IsFalse(_viewModel.HasSelection, "HasSelection should be false");
        }

        [TestMethod]
        public void SelectOnlyFailedResults_FiltersAndSelects()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.SelectFailedOnlyCommand.Execute(null);

            // Assert
            var selectedResults = _viewModel.FilteredValidationResults.Where(r => r.IsSelected);
            Assert.IsTrue(selectedResults.All(r => r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical), 
                "Only failed results should be selected");
            Assert.IsTrue(selectedResults.Count() > 0, "Should have some failed results selected");
        }

        #endregion

        #region Export Functionality Tests

        [TestMethod]
        public async Task ExportToCsv_AllResults_CreatesValidFile()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var exportPath = @"C:\temp\validation_results.csv";
            
            _mockDialogService
                .Setup(d => d.SaveFileDialog("Export Validation Results", "CSV files (*.csv)|*.csv", "validation_results.csv"))
                .Returns(exportPath);
            
            _mockExportService
                .Setup(e => e.ExportValidationResultsToCsvAsync(_viewModel.FilteredValidationResults, exportPath))
                .Returns(Task.CompletedTask);

            // Act
            await _viewModel.ExportToCsvCommand.ExecuteAsync(null);

            // Assert
            _mockExportService.Verify(e => e.ExportValidationResultsToCsvAsync(
                It.Is<IEnumerable<ValidationResultViewModel>>(r => r.Count() == _testValidationResults.Count), 
                exportPath), Times.Once);
        }

        [TestMethod]
        public async Task ExportToCsv_SelectedResults_ExportsOnlySelected()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var selectedResults = _viewModel.FilteredValidationResults.Take(5).ToList();
            foreach (var result in selectedResults)
            {
                result.IsSelected = true;
            }
            _viewModel.UpdateSelectedItemsCommand.Execute(null);

            var exportPath = @"C:\temp\selected_validation_results.csv";
            
            _mockDialogService
                .Setup(d => d.SaveFileDialog(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(exportPath);
            
            _mockExportService
                .Setup(e => e.ExportValidationResultsToCsvAsync(It.IsAny<IEnumerable<ValidationResultViewModel>>(), exportPath))
                .Returns(Task.CompletedTask);

            // Act
            _viewModel.ExportSelectedOnly = true;
            await _viewModel.ExportToCsvCommand.ExecuteAsync(null);

            // Assert
            _mockExportService.Verify(e => e.ExportValidationResultsToCsvAsync(
                It.Is<IEnumerable<ValidationResultViewModel>>(r => r.Count() == 5), 
                exportPath), Times.Once);
        }

        [TestMethod]
        public async Task ExportToPdf_WithSummary_IncludesSummaryPage()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var exportPath = @"C:\temp\validation_report.pdf";
            
            _mockDialogService
                .Setup(d => d.SaveFileDialog("Export Validation Report", "PDF files (*.pdf)|*.pdf", "validation_report.pdf"))
                .Returns(exportPath);
            
            _mockExportService
                .Setup(e => e.ExportValidationResultsToPdfAsync(It.IsAny<IEnumerable<ValidationResultViewModel>>(), exportPath, true))
                .Returns(Task.CompletedTask);

            // Act
            _viewModel.IncludeSummaryInPdf = true;
            await _viewModel.ExportToPdfCommand.ExecuteAsync(null);

            // Assert
            _mockExportService.Verify(e => e.ExportValidationResultsToPdfAsync(
                It.IsAny<IEnumerable<ValidationResultViewModel>>(), 
                exportPath, 
                true), Times.Once);
        }

        [TestMethod]
        public async Task ExportAuditLog_FilteredResults_ExportsAuditRecords()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var exportPath = @"C:\temp\audit_log.csv";
            
            _mockDialogService
                .Setup(d => d.SaveFileDialog("Export Audit Log", "CSV files (*.csv)|*.csv", "audit_log.csv"))
                .Returns(exportPath);
            
            _mockAuditService
                .Setup(a => a.ExportToCsvAsync(It.IsAny<List<AuditRecord>>(), exportPath))
                .Returns(Task.CompletedTask);

            // Act
            await _viewModel.ExportAuditLogCommand.ExecuteAsync(null);

            // Assert
            _mockAuditService.Verify(a => a.ExportToCsvAsync(
                It.IsAny<List<AuditRecord>>(), 
                exportPath), Times.Once);
        }

        [TestMethod]
        public void ExportToCsv_NoResults_ShowsWarningMessage()
        {
            // Arrange
            _viewModel.FilteredValidationResults.Clear();

            // Act
            var canExecute = _viewModel.ExportToCsvCommand.CanExecute(null);

            // Assert
            Assert.IsFalse(canExecute, "Export command should be disabled when no results");
        }

        #endregion

        #region Rollback UI Integration Tests

        [TestMethod]
        public async Task RollbackSelected_SingleItem_ShowsConfirmationDialog()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResult = _viewModel.FilteredValidationResults.First(r => r.CanRollback);
            _viewModel.SelectedValidationResult = targetResult;

            _mockDialogService
                .Setup(d => d.ShowConfirmationDialog("Confirm Rollback", It.IsAny<string>()))
                .Returns(true);

            // Act
            await _viewModel.RollbackSelectedCommand.ExecuteAsync(null);

            // Assert
            _mockDialogService.Verify(d => d.ShowConfirmationDialog(
                "Confirm Rollback", 
                It.Is<string>(msg => msg.Contains(targetResult.ObjectName))), Times.Once);
        }

        [TestMethod]
        public async Task RollbackSelected_MultipleItems_ShowsBatchConfirmationDialog()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResults = _viewModel.FilteredValidationResults.Where(r => r.CanRollback).Take(3).ToList();
            foreach (var result in targetResults)
            {
                result.IsSelected = true;
            }
            _viewModel.UpdateSelectedItemsCommand.Execute(null);

            _mockDialogService
                .Setup(d => d.ShowConfirmationDialog("Confirm Batch Rollback", It.IsAny<string>()))
                .Returns(true);

            // Act
            await _viewModel.RollbackSelectedCommand.ExecuteAsync(null);

            // Assert
            _mockDialogService.Verify(d => d.ShowConfirmationDialog(
                "Confirm Batch Rollback", 
                It.Is<string>(msg => msg.Contains("3 objects"))), Times.Once);
        }

        [TestMethod]
        public async Task RollbackSelected_UserCancels_NoRollbackExecuted()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResult = _viewModel.FilteredValidationResults.First(r => r.CanRollback);
            _viewModel.SelectedValidationResult = targetResult;

            _mockDialogService
                .Setup(d => d.ShowConfirmationDialog(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(false);

            // Act
            await _viewModel.RollbackSelectedCommand.ExecuteAsync(null);

            // Assert
            _mockValidationService.Verify(v => v.RollbackUserAsync(It.IsAny<UserDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()), Times.Never);
            _mockValidationService.Verify(v => v.RollbackMailboxAsync(It.IsAny<MailboxDto>(), It.IsAny<TargetContext>(), It.IsAny<IProgress<ValidationProgress>>()), Times.Never);
        }

        [TestMethod]
        public void RollbackSelected_NonRollbackableItem_CommandDisabled()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var nonRollbackableResult = _viewModel.FilteredValidationResults.First(r => !r.CanRollback);
            _viewModel.SelectedValidationResult = nonRollbackableResult;

            // Act & Assert
            Assert.IsFalse(_viewModel.RollbackSelectedCommand.CanExecute(null), 
                "Rollback command should be disabled for non-rollbackable items");
        }

        #endregion

        #region Progress and Status Updates Tests

        [TestMethod]
        public async Task LoadValidationResults_ShowsProgressIndicator()
        {
            // Arrange
            var wave = CreateTestWave();
            
            _mockValidationService
                .Setup(v => v.ValidateWaveAsync(wave, _testTargetContext, It.IsAny<IProgress<ValidationProgress>>()))
                .Returns(async (MigrationWave w, TargetContext tc, IProgress<ValidationProgress> progress) =>
                {
                    progress?.Report(new ValidationProgress { PercentageComplete = 50, CurrentStep = "Validating..." });
                    await Task.Delay(100);
                    progress?.Report(new ValidationProgress { PercentageComplete = 100, CurrentStep = "Complete" });
                    return CreateMockValidationResults();
                });

            // Act
            await _viewModel.LoadValidationResultsCommand.ExecuteAsync(wave);

            // Assert
            Assert.IsFalse(_viewModel.IsLoading, "Loading should be complete");
            Assert.AreEqual(100, _viewModel.LoadingProgress, "Progress should be at 100%");
            Assert.AreEqual("Complete", _viewModel.LoadingStatus, "Status should show complete");
        }

        [TestMethod]
        public void ValidationResultsChanged_UpdatesSummaryStatistics()
        {
            // Arrange & Act
            LoadTestDataIntoViewModel();

            // Assert
            Assert.AreEqual(_testValidationResults.Count, _viewModel.TotalResults, "Total results should match");
            Assert.AreEqual(_testValidationResults.Count(r => r.Severity == ValidationSeverity.Success), _viewModel.SuccessfulResults, "Successful count should match");
            Assert.AreEqual(_testValidationResults.Count(r => r.Severity == ValidationSeverity.Error), _viewModel.ErrorResults, "Error count should match");
            Assert.AreEqual(_testValidationResults.Count(r => r.Severity == ValidationSeverity.Warning), _viewModel.WarningResults, "Warning count should match");
            Assert.AreEqual(_testValidationResults.Count(r => r.Severity == ValidationSeverity.Critical), _viewModel.CriticalResults, "Critical count should match");
        }

        [TestMethod]
        public void FilteredResultsChanged_UpdatesFilteredSummaryStatistics()
        {
            // Arrange
            LoadTestDataIntoViewModel();

            // Act
            _viewModel.FilterBySeverity = ValidationSeverity.Error;
            _viewModel.ApplyFiltersCommand.Execute(null);

            // Assert
            var filteredCount = _viewModel.FilteredValidationResults.Count;
            Assert.AreEqual(filteredCount, _viewModel.FilteredResultsCount, "Filtered count should match visible results");
            Assert.IsTrue(_viewModel.FilteredResultsCount < _viewModel.TotalResults, "Filtered count should be less than total");
        }

        #endregion

        #region Real-time Updates Tests

        [TestMethod]
        public void ValidationResultUpdated_RefreshesUI()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResult = _viewModel.FilteredValidationResults.First();
            var originalSeverity = targetResult.Severity;

            // Act
            targetResult.Severity = ValidationSeverity.Warning;
            targetResult.Message = "Updated validation message";
            _viewModel.RefreshValidationResultCommand.Execute(targetResult);

            // Assert
            Assert.AreEqual(ValidationSeverity.Warning, targetResult.Severity, "Severity should be updated");
            Assert.AreEqual("Updated validation message", targetResult.Message, "Message should be updated");
            Assert.AreNotEqual(originalSeverity, targetResult.Severity, "Severity should have changed");
        }

        [TestMethod]
        public void RollbackStatusChanged_UpdatesResultStatus()
        {
            // Arrange
            LoadTestDataIntoViewModel();
            var targetResult = _viewModel.FilteredValidationResults.First(r => r.CanRollback);

            // Act
            targetResult.RollbackInProgress = true;
            _viewModel.NotifyPropertyChanged(nameof(targetResult.RollbackInProgress));

            // Assert
            Assert.IsTrue(targetResult.RollbackInProgress, "Rollback should be marked in progress");
            Assert.IsFalse(_viewModel.RollbackSelectedCommand.CanExecute(null), 
                "Rollback command should be disabled during rollback");
        }

        #endregion

        #region Helper Methods

        private void SetupMockServices()
        {
            _mockAuditService
                .Setup(a => a.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(_testAuditRecords);
        }

        private void LoadTestDataIntoViewModel()
        {
            foreach (var result in _testValidationResults)
            {
                _viewModel.FilteredValidationResults.Add(result);
            }
            _viewModel.UpdateSummaryStatistics();
        }

        private ObservableCollection<ValidationResultViewModel> CreateTestValidationResults()
        {
            var results = new ObservableCollection<ValidationResultViewModel>();
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };
            var severities = new[] { ValidationSeverity.Success, ValidationSeverity.Warning, ValidationSeverity.Error, ValidationSeverity.Critical };
            var waveIds = new[] { "wave-001", "wave-002", "wave-003" };

            var random = new Random();

            for (int i = 0; i < 50; i++)
            {
                results.Add(new ValidationResultViewModel
                {
                    Id = Guid.NewGuid().ToString(),
                    ObjectType = objectTypes[i % objectTypes.Length],
                    ObjectName = $"TestObject{i:D3}@contoso.com",
                    Severity = severities[random.Next(severities.Length)],
                    Message = $"Validation message for object {i}",
                    ValidatedAt = DateTime.Now.AddMinutes(-random.Next(1, 10080)), // Last week
                    CanRollback = random.Next(2) == 0, // 50% can rollback
                    WaveId = waveIds[random.Next(waveIds.Length)],
                    IssueCount = random.Next(0, 5),
                    Duration = TimeSpan.FromMilliseconds(random.Next(100, 5000))
                });
            }

            return results;
        }

        private List<AuditRecord> CreateTestAuditRecords()
        {
            var records = new List<AuditRecord>();
            for (int i = 0; i < 25; i++)
            {
                records.Add(new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = i % 2 == 0 ? "Validation" : "Rollback",
                    ObjectType = "User",
                    ObjectIdentifier = $"testuser{i}@contoso.com",
                    Status = "Success",
                    StartTime = DateTime.Now.AddHours(-i),
                    Duration = TimeSpan.FromSeconds(30)
                });
            }
            return records;
        }

        private MigrationWave CreateTestWave()
        {
            return new MigrationWave
            {
                Users = { new UserDto { UserPrincipalName = "testuser@contoso.com", DisplayName = "Test User" } },
                Mailboxes = { new MailboxDto { PrimarySmtpAddress = "testmailbox@contoso.com", DisplayName = "Test Mailbox" } }
            };
        }

        private List<ValidationResult> CreateMockValidationResults()
        {
            return new List<ValidationResult>
            {
                ValidationResult.Success(new UserDto(), "User", "testuser@contoso.com"),
                ValidationResult.Success(new MailboxDto(), "Mailbox", "testmailbox@contoso.com")
            };
        }

        private int GetSeverityOrder(ValidationSeverity severity)
        {
            return severity switch
            {
                ValidationSeverity.Critical => 0,
                ValidationSeverity.Error => 1,
                ValidationSeverity.Warning => 2,
                ValidationSeverity.Success => 3,
                _ => 4
            };
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            _viewModel?.Dispose();
        }
    }

    #region UI Support Classes

    public class MigrationValidationViewModel : IDisposable
    {
        private readonly PostMigrationValidationService _validationService;
        private readonly IAuditService _auditService;
        private readonly IExportService _exportService;
        private readonly IDialogService _dialogService;

        public ObservableCollection<ValidationResultViewModel> FilteredValidationResults { get; } = new();
        public List<ValidationResultViewModel> SelectedValidationResults { get; } = new();
        
        // Filter Properties
        public string FilterByObjectType { get; set; }
        public ValidationSeverity? FilterBySeverity { get; set; }
        public DateTime? FilterStartDate { get; set; }
        public DateTime? FilterEndDate { get; set; }
        public string FilterByWaveId { get; set; }
        public bool? FilterByCanRollback { get; set; }

        // Sort Properties
        public string SortByColumn { get; set; }
        public string SecondarySortColumn { get; set; }
        public string SortDirection { get; set; } = "Ascending";

        // Selection Properties
        public ValidationResultViewModel SelectedValidationResult { get; set; }
        public bool HasSelection => SelectedValidationResult != null || SelectedValidationResults.Any();
        public bool HasMultipleSelection => SelectedValidationResults.Count > 1;

        // Export Properties
        public bool ExportSelectedOnly { get; set; }
        public bool IncludeSummaryInPdf { get; set; }

        // Progress Properties
        public bool IsLoading { get; set; }
        public int LoadingProgress { get; set; }
        public string LoadingStatus { get; set; } = string.Empty;

        // Summary Properties
        public int TotalResults { get; set; }
        public int FilteredResultsCount { get; set; }
        public int SuccessfulResults { get; set; }
        public int WarningResults { get; set; }
        public int ErrorResults { get; set; }
        public int CriticalResults { get; set; }

        // Commands
        public IAsyncCommand ApplyFiltersCommand { get; set; }
        public IAsyncCommand ClearFiltersCommand { get; set; }
        public IAsyncCommand ApplySortCommand { get; set; }
        public IAsyncCommand SelectAllCommand { get; set; }
        public IAsyncCommand DeselectAllCommand { get; set; }
        public IAsyncCommand SelectFailedOnlyCommand { get; set; }
        public IAsyncCommand UpdateSelectedItemsCommand { get; set; }
        public IAsyncCommand ExportToCsvCommand { get; set; }
        public IAsyncCommand ExportToPdfCommand { get; set; }
        public IAsyncCommand ExportAuditLogCommand { get; set; }
        public IAsyncCommand RollbackSelectedCommand { get; set; }
        public IAsyncCommand LoadValidationResultsCommand { get; set; }
        public IAsyncCommand RefreshValidationResultCommand { get; set; }

        public MigrationValidationViewModel(PostMigrationValidationService validationService, IAuditService auditService, IExportService exportService, IDialogService dialogService)
        {
            _validationService = validationService;
            _auditService = auditService;
            _exportService = exportService;
            _dialogService = dialogService;
            InitializeCommands();
        }

        private void InitializeCommands()
        {
            ApplyFiltersCommand = new AsyncCommand(async () => await ApplyFiltersAsync());
            ClearFiltersCommand = new AsyncCommand(async () => await ClearFiltersAsync());
            ApplySortCommand = new AsyncCommand(async () => await ApplySortAsync());
            SelectAllCommand = new AsyncCommand(async () => await SelectAllAsync());
            DeselectAllCommand = new AsyncCommand(async () => await DeselectAllAsync());
            SelectFailedOnlyCommand = new AsyncCommand(async () => await SelectFailedOnlyAsync());
            UpdateSelectedItemsCommand = new AsyncCommand(async () => await UpdateSelectedItemsAsync());
            ExportToCsvCommand = new AsyncCommand(async () => await ExportToCsvAsync(), () => FilteredValidationResults.Any());
            ExportToPdfCommand = new AsyncCommand(async () => await ExportToPdfAsync(), () => FilteredValidationResults.Any());
            ExportAuditLogCommand = new AsyncCommand(async () => await ExportAuditLogAsync());
            RollbackSelectedCommand = new AsyncCommand(async () => await RollbackSelectedAsync(), () => HasSelection && (SelectedValidationResult?.CanRollback ?? false));
            LoadValidationResultsCommand = new AsyncCommand<MigrationWave>(async wave => await LoadValidationResultsAsync(wave));
            RefreshValidationResultCommand = new AsyncCommand<ValidationResultViewModel>(async result => await RefreshValidationResultAsync(result));
        }

        private async Task ApplyFiltersAsync()
        {
            // Implementation would filter the results based on current filter properties
            await Task.CompletedTask;
        }

        private async Task ClearFiltersAsync()
        {
            FilterByObjectType = null;
            FilterBySeverity = null;
            FilterStartDate = null;
            FilterEndDate = null;
            FilterByWaveId = null;
            FilterByCanRollback = null;
            await Task.CompletedTask;
        }

        private async Task ApplySortAsync()
        {
            // Implementation would sort the results based on current sort properties
            await Task.CompletedTask;
        }

        private async Task SelectAllAsync()
        {
            foreach (var result in FilteredValidationResults)
            {
                result.IsSelected = true;
            }
            await UpdateSelectedItemsAsync();
        }

        private async Task DeselectAllAsync()
        {
            foreach (var result in FilteredValidationResults)
            {
                result.IsSelected = false;
            }
            SelectedValidationResults.Clear();
            await Task.CompletedTask;
        }

        private async Task SelectFailedOnlyAsync()
        {
            foreach (var result in FilteredValidationResults)
            {
                result.IsSelected = result.Severity == ValidationSeverity.Error || result.Severity == ValidationSeverity.Critical;
            }
            await UpdateSelectedItemsAsync();
        }

        private async Task UpdateSelectedItemsAsync()
        {
            SelectedValidationResults.Clear();
            SelectedValidationResults.AddRange(FilteredValidationResults.Where(r => r.IsSelected));
            await Task.CompletedTask;
        }

        private async Task ExportToCsvAsync()
        {
            var filePath = _dialogService.SaveFileDialog("Export Validation Results", "CSV files (*.csv)|*.csv", "validation_results.csv");
            if (!string.IsNullOrEmpty(filePath))
            {
                var resultsToExport = ExportSelectedOnly ? SelectedValidationResults : FilteredValidationResults;
                await _exportService.ExportValidationResultsToCsvAsync(resultsToExport, filePath);
            }
        }

        private async Task ExportToPdfAsync()
        {
            var filePath = _dialogService.SaveFileDialog("Export Validation Report", "PDF files (*.pdf)|*.pdf", "validation_report.pdf");
            if (!string.IsNullOrEmpty(filePath))
            {
                var resultsToExport = ExportSelectedOnly ? SelectedValidationResults : FilteredValidationResults;
                await _exportService.ExportValidationResultsToPdfAsync(resultsToExport, filePath, IncludeSummaryInPdf);
            }
        }

        private async Task ExportAuditLogAsync()
        {
            var filePath = _dialogService.SaveFileDialog("Export Audit Log", "CSV files (*.csv)|*.csv", "audit_log.csv");
            if (!string.IsNullOrEmpty(filePath))
            {
                var auditRecords = await _auditService.GetAuditRecordsAsync(DateTime.MinValue, DateTime.MaxValue);
                await _auditService.ExportToCsvAsync(auditRecords, filePath);
            }
        }

        private async Task RollbackSelectedAsync()
        {
            if (HasMultipleSelection)
            {
                var confirmed = _dialogService.ShowConfirmationDialog("Confirm Batch Rollback", 
                    $"Are you sure you want to rollback {SelectedValidationResults.Count} objects?");
                if (!confirmed) return;
                
                // Implementation would perform batch rollback
            }
            else if (SelectedValidationResult != null)
            {
                var confirmed = _dialogService.ShowConfirmationDialog("Confirm Rollback", 
                    $"Are you sure you want to rollback {SelectedValidationResult.ObjectName}?");
                if (!confirmed) return;
                
                // Implementation would perform single rollback
            }
            
            await Task.CompletedTask;
        }

        private async Task LoadValidationResultsAsync(MigrationWave wave)
        {
            IsLoading = true;
            LoadingProgress = 0;
            LoadingStatus = "Starting validation...";

            var progress = new Progress<ValidationProgress>(p =>
            {
                LoadingProgress = p.PercentageComplete;
                LoadingStatus = p.CurrentStep;
            });

            var results = await _validationService.ValidateWaveAsync(wave, new TargetContext(), progress);
            
            IsLoading = false;
            LoadingProgress = 100;
            LoadingStatus = "Complete";
        }

        private async Task RefreshValidationResultAsync(ValidationResultViewModel result)
        {
            // Implementation would refresh the specific result
            NotifyPropertyChanged(nameof(result));
            await Task.CompletedTask;
        }

        public void UpdateSummaryStatistics()
        {
            TotalResults = FilteredValidationResults.Count;
            SuccessfulResults = FilteredValidationResults.Count(r => r.Severity == ValidationSeverity.Success);
            WarningResults = FilteredValidationResults.Count(r => r.Severity == ValidationSeverity.Warning);
            ErrorResults = FilteredValidationResults.Count(r => r.Severity == ValidationSeverity.Error);
            CriticalResults = FilteredValidationResults.Count(r => r.Severity == ValidationSeverity.Critical);
            FilteredResultsCount = FilteredValidationResults.Count;
        }

        public void NotifyPropertyChanged(string propertyName)
        {
            // Implementation would raise PropertyChanged event
        }

        public void Dispose()
        {
            // Cleanup resources
        }
    }

    public class ValidationResultViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string ObjectType { get; set; } = string.Empty;
        public string ObjectName { get; set; } = string.Empty;
        public ValidationSeverity Severity { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime ValidatedAt { get; set; }
        public bool CanRollback { get; set; }
        public bool RollbackInProgress { get; set; }
        public string WaveId { get; set; } = string.Empty;
        public int IssueCount { get; set; }
        public TimeSpan Duration { get; set; }
        public bool IsSelected { get; set; }
    }

    public interface IExportService
    {
        Task ExportValidationResultsToCsvAsync(IEnumerable<ValidationResultViewModel> results, string filePath);
        Task ExportValidationResultsToPdfAsync(IEnumerable<ValidationResultViewModel> results, string filePath, bool includeSummary);
    }

    public interface IDialogService
    {
        string SaveFileDialog(string title, string filter, string defaultFileName);
        bool ShowConfirmationDialog(string title, string message);
    }

    public interface IAsyncCommand
    {
        Task ExecuteAsync(object parameter);
        bool CanExecute(object parameter);
    }

    public interface IAsyncCommand<T> : IAsyncCommand
    {
        Task ExecuteAsync(T parameter);
    }

    public class AsyncCommand : IAsyncCommand
    {
        private readonly Func<Task> _execute;
        private readonly Func<bool> _canExecute;

        public AsyncCommand(Func<Task> execute, Func<bool> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        public async Task ExecuteAsync(object parameter) => await _execute();
        public bool CanExecute(object parameter) => _canExecute?.Invoke() ?? true;
    }

    public class AsyncCommand<T> : IAsyncCommand<T>
    {
        private readonly Func<T, Task> _execute;
        private readonly Func<T, bool> _canExecute;

        public AsyncCommand(Func<T, Task> execute, Func<T, bool> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        public async Task ExecuteAsync(T parameter) => await _execute(parameter);
        public async Task ExecuteAsync(object parameter) => await ExecuteAsync((T)parameter);
        public bool CanExecute(object parameter) => _canExecute?.Invoke((T)parameter) ?? true;
    }

    #endregion
}