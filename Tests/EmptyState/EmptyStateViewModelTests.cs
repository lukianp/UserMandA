using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.EmptyState
{
    /// <summary>
    /// Comprehensive test suite for validating ViewModel behavior with empty/null data
    /// </summary>
    [TestClass]
    public class EmptyStateViewModelTests
    {
        private string _testProfile = "EmptyStateTest";
        private string _emptyDataPath = @"C:\discoverydata\EmptyStateTest\RawData";

        [TestInitialize]
        public void Setup()
        {
            // Ensure test directory exists but is empty
            if (System.IO.Directory.Exists(_emptyDataPath))
            {
                foreach (var file in System.IO.Directory.GetFiles(_emptyDataPath, "*.csv"))
                {
                    System.IO.File.Delete(file);
                }
            }
            else
            {
                System.IO.Directory.CreateDirectory(_emptyDataPath);
            }
        }

        #region User ViewModels

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ViewModels")]
        public void UsersViewModel_InitializesWithEmptyCollection()
        {
            // Arrange & Act
            var vm = new UsersViewModel();

            // Assert
            Assert.IsNotNull(vm.Users, "Users collection should not be null");
            Assert.AreEqual(0, vm.Users.Count, "Users collection should be empty");
            Assert.IsInstanceOfType(vm.Users, typeof(ObservableCollection<User>), 
                "Users should be ObservableCollection");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        public void UsersViewModel_LoadDataWithMissingCsv_HandlesGracefully()
        {
            // Arrange
            var vm = new UsersViewModel();
            var csvPath = System.IO.Path.Combine(_emptyDataPath, "Users.csv");

            // Act
            Exception caughtException = null;
            try
            {
                vm.LoadData(csvPath);
            }
            catch (Exception ex)
            {
                caughtException = ex;
            }

            // Assert
            Assert.IsNull(caughtException, "Loading missing CSV should not throw exception");
            Assert.AreEqual(0, vm.Users.Count, "Users collection should remain empty");
            Assert.IsTrue(vm.IsDataLoaded, "IsDataLoaded should be true even with no data");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        public void UsersViewModel_EmptyStateMessage_IsCorrect()
        {
            // Arrange
            var vm = new UsersViewModel();

            // Act
            vm.LoadData(_emptyDataPath);
            var message = vm.EmptyStateMessage;

            // Assert
            Assert.IsFalse(string.IsNullOrEmpty(message), "Empty state message should be set");
            Assert.IsTrue(message.Contains("No users found") || message.Contains("No data"), 
                "Message should indicate no data");
        }

        #endregion

        #region Group ViewModels

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ViewModels")]
        public void GroupsViewModel_InitializesWithEmptyCollection()
        {
            // Arrange & Act
            var vm = new GroupsViewModel();

            // Assert
            Assert.IsNotNull(vm.Groups, "Groups collection should not be null");
            Assert.AreEqual(0, vm.Groups.Count, "Groups collection should be empty");
            Assert.IsNull(vm.SelectedGroup, "SelectedGroup should be null initially");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        public void GroupsViewModel_FilteringEmptyCollection_DoesNotThrow()
        {
            // Arrange
            var vm = new GroupsViewModel();

            // Act & Assert
            Assert.DoesNotThrow(() => vm.FilterGroups("test"), 
                "Filtering empty collection should not throw");
            Assert.AreEqual(0, vm.FilteredGroups?.Count ?? 0, 
                "Filtered collection should also be empty");
        }

        #endregion

        #region Mailbox ViewModels

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ViewModels")]
        public void MailboxesViewModel_InitializesWithEmptyCollection()
        {
            // Arrange & Act
            var vm = new MailboxesViewModel();

            // Assert
            Assert.IsNotNull(vm.Mailboxes, "Mailboxes collection should not be null");
            Assert.AreEqual(0, vm.Mailboxes.Count, "Mailboxes collection should be empty");
            Assert.AreEqual(0, vm.TotalMailboxSize, "TotalMailboxSize should be 0");
            Assert.AreEqual(0, vm.TotalItemCount, "TotalItemCount should be 0");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        public void MailboxesViewModel_StatisticsWithNoData_ReturnsZeros()
        {
            // Arrange
            var vm = new MailboxesViewModel();

            // Act
            var stats = vm.GetMailboxStatistics();

            // Assert
            Assert.IsNotNull(stats, "Statistics should not be null");
            Assert.AreEqual(0, stats.TotalCount, "Total count should be 0");
            Assert.AreEqual(0, stats.TotalSize, "Total size should be 0");
            Assert.AreEqual(0, stats.AverageSize, "Average size should be 0");
        }

        #endregion

        #region SharePoint ViewModels

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ViewModels")]
        public void SharePointViewModel_InitializesWithEmptyCollections()
        {
            // Arrange & Act
            var vm = new SharePointViewModel();

            // Assert
            Assert.IsNotNull(vm.Sites, "Sites collection should not be null");
            Assert.IsNotNull(vm.Libraries, "Libraries collection should not be null");
            Assert.AreEqual(0, vm.Sites.Count, "Sites collection should be empty");
            Assert.AreEqual(0, vm.Libraries.Count, "Libraries collection should be empty");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        public void SharePointViewModel_LoadDataWithEmptyCsv_SetsEmptyState()
        {
            // Arrange
            var vm = new SharePointViewModel();
            var csvPath = System.IO.Path.Combine(_emptyDataPath, "SharePointSites.csv");
            
            // Create empty CSV with headers only
            System.IO.File.WriteAllText(csvPath, "SiteUrl,Title,StorageUsed,LastModified");

            // Act
            vm.LoadData(csvPath);

            // Assert
            Assert.AreEqual(0, vm.Sites.Count, "Sites should remain empty");
            Assert.IsTrue(vm.ShowEmptyState, "ShowEmptyState should be true");
        }

        #endregion

        #region Teams ViewModels

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ViewModels")]
        public void TeamsViewModel_InitializesWithEmptyCollection()
        {
            // Arrange & Act
            var vm = new TeamsViewModel();

            // Assert
            Assert.IsNotNull(vm.Teams, "Teams collection should not be null");
            Assert.IsNotNull(vm.Channels, "Channels collection should not be null");
            Assert.AreEqual(0, vm.Teams.Count, "Teams collection should be empty");
            Assert.AreEqual(0, vm.TotalMemberCount, "TotalMemberCount should be 0");
        }

        #endregion

        #region Export Functionality

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Export")]
        public void ExportService_ExportEmptyCollection_CreatesHeaderOnlyFile()
        {
            // Arrange
            var exportService = new CsvExportService();
            var emptyUsers = new List<User>();
            var exportPath = System.IO.Path.Combine(_emptyDataPath, "Export_Empty.csv");

            // Act
            var result = exportService.ExportToCsv(emptyUsers, exportPath);

            // Assert
            Assert.IsTrue(result.Success, "Export should succeed even with empty data");
            Assert.IsTrue(System.IO.File.Exists(exportPath), "Export file should be created");
            
            var lines = System.IO.File.ReadAllLines(exportPath);
            Assert.AreEqual(1, lines.Length, "File should contain only header row");
            Assert.IsTrue(lines[0].Contains(","), "Header should contain column delimiters");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Export")]
        public void ExportService_ExportNull_ReturnsError()
        {
            // Arrange
            var exportService = new CsvExportService();
            var exportPath = System.IO.Path.Combine(_emptyDataPath, "Export_Null.csv");

            // Act
            var result = exportService.ExportToCsv<User>(null, exportPath);

            // Assert
            Assert.IsFalse(result.Success, "Export should fail with null data");
            Assert.IsFalse(System.IO.File.Exists(exportPath), "No file should be created");
            Assert.IsFalse(string.IsNullOrEmpty(result.ErrorMessage), "Error message should be provided");
        }

        #endregion

        #region Data Binding

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("DataBinding")]
        public void DataBinding_EmptyCollection_NotifiesPropertyChange()
        {
            // Arrange
            var vm = new UsersViewModel();
            bool propertyChanged = false;
            string changedProperty = null;

            vm.PropertyChanged += (sender, e) =>
            {
                propertyChanged = true;
                changedProperty = e.PropertyName;
            };

            // Act
            vm.Users = new ObservableCollection<User>();

            // Assert
            Assert.IsTrue(propertyChanged, "PropertyChanged should be raised");
            Assert.AreEqual("Users", changedProperty, "Users property should notify change");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("DataBinding")]
        public void DataBinding_ItemCount_UpdatesWithEmptyCollection()
        {
            // Arrange
            var vm = new GroupsViewModel();
            bool countChanged = false;

            vm.PropertyChanged += (sender, e) =>
            {
                if (e.PropertyName == "ItemCount")
                    countChanged = true;
            };

            // Act
            vm.Groups.Clear(); // Ensure it's empty
            vm.UpdateItemCount();

            // Assert
            Assert.AreEqual(0, vm.ItemCount, "ItemCount should be 0");
            Assert.IsTrue(countChanged, "ItemCount property should notify change");
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Performance")]
        [Timeout(1000)] // Should complete within 1 second
        public void Performance_InitializeMultipleEmptyViewModels_CompletesFast()
        {
            // Arrange
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            for (int i = 0; i < 100; i++)
            {
                var userVm = new UsersViewModel();
                var groupVm = new GroupsViewModel();
                var mailboxVm = new MailboxesViewModel();
                var spVm = new SharePointViewModel();
                var teamsVm = new TeamsViewModel();
            }

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 500, 
                $"Initialization took {stopwatch.ElapsedMilliseconds}ms, should be under 500ms");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Performance")]
        public void Performance_FilterLargeEmptyCollection_CompletesFast()
        {
            // Arrange
            var vm = new UsersViewModel();
            vm.Users = new ObservableCollection<User>();
            
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            for (int i = 0; i < 1000; i++)
            {
                vm.FilterUsers($"search{i}");
            }

            stopwatch.Stop();

            // Assert
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 100,
                $"Filtering took {stopwatch.ElapsedMilliseconds}ms, should be under 100ms");
        }

        #endregion

        #region Error Handling

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ErrorHandling")]
        public void ErrorHandling_LoadCorruptedCsv_DoesNotCrash()
        {
            // Arrange
            var vm = new ApplicationsViewModel();
            var csvPath = System.IO.Path.Combine(_emptyDataPath, "Applications_Corrupted.csv");
            
            // Create corrupted CSV
            System.IO.File.WriteAllText(csvPath, "This is not, valid CSV\n@#$%^&*()");

            // Act & Assert
            Exception caughtException = null;
            try
            {
                vm.LoadData(csvPath);
            }
            catch (Exception ex)
            {
                caughtException = ex;
            }

            Assert.IsNull(caughtException, "Should handle corrupted CSV gracefully");
            Assert.AreEqual(0, vm.Applications.Count, "Collection should remain empty");
            Assert.IsFalse(string.IsNullOrEmpty(vm.LastError), "Error should be logged");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("ErrorHandling")]
        public void ErrorHandling_AccessDeniedPath_ReturnsEmptyCollection()
        {
            // Arrange
            var vm = new ComputersViewModel();
            var protectedPath = @"C:\Windows\System32\config\Users.csv";

            // Act
            vm.LoadData(protectedPath);

            // Assert
            Assert.AreEqual(0, vm.Computers.Count, "Should return empty collection on access denied");
            Assert.IsTrue(vm.HasError, "HasError flag should be set");
        }

        #endregion

        #region Cleanup

        [TestCleanup]
        public void Cleanup()
        {
            // Clean up test files
            if (System.IO.Directory.Exists(_emptyDataPath))
            {
                foreach (var file in System.IO.Directory.GetFiles(_emptyDataPath, "*.csv"))
                {
                    try { System.IO.File.Delete(file); } catch { }
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// Helper class to assert no exceptions are thrown
    /// </summary>
    public static class AssertExtensions
    {
        public static void DoesNotThrow(Action action, string message = null)
        {
            try
            {
                action();
            }
            catch (Exception ex)
            {
                Assert.Fail(message ?? $"Expected no exception, but got: {ex.GetType().Name}: {ex.Message}");
            }
        }
    }
}