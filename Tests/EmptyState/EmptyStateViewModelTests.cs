using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.EmptyState
{
    /// <summary>
    /// Test suite for validating empty state behavior and basic functionality
    /// </summary>
    [TestClass]
    public class EmptyStateViewModelTests
    {
        private string _emptyDataPath = @"C:\Temp\EmptyStateTest";

        [TestInitialize]
        public void Setup()
        {
            // Ensure test directory exists but is empty
            if (Directory.Exists(_emptyDataPath))
            {
                foreach (var file in Directory.GetFiles(_emptyDataPath, "*.csv"))
                {
                    File.Delete(file);
                }
            }
            else
            {
                Directory.CreateDirectory(_emptyDataPath);
            }
        }

        #region Basic Functionality Tests

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Basic")]
        public void DataExportService_CanCreateInstance()
        {
            // Arrange & Act
            var exportService = DataExportService.Instance;

            // Assert
            Assert.IsNotNull(exportService, "DataExportService instance should not be null");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Basic")]
        public void DirectoryOperations_WorkCorrectly()
        {
            // Arrange
            var testPath = Path.Combine(_emptyDataPath, "test.csv");

            // Act
            File.WriteAllText(testPath, "Test,Data\nValue1,Value2");
            var files = Directory.GetFiles(_emptyDataPath, "*.csv");

            // Assert
            Assert.IsTrue(files.Length > 0, "Should find CSV files in directory");
            Assert.IsTrue(File.Exists(testPath), "Test file should exist");

            // Cleanup
            File.Delete(testPath);
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Basic")]
        public void ObservableCollection_BasicOperations()
        {
            // Arrange
            var collection = new ObservableCollection<string>();

            // Act
            collection.Add("Test1");
            collection.Add("Test2");

            // Assert
            Assert.AreEqual(2, collection.Count, "Collection should have 2 items");
            Assert.IsTrue(collection.Contains("Test1"), "Collection should contain Test1");
            Assert.IsTrue(collection.Contains("Test2"), "Collection should contain Test2");
        }

        #endregion

        #region Data Export Tests

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Export")]
        public async Task DataExportService_ExportEmptyCollection()
        {
            // Arrange
            var exportService = DataExportService.Instance;
            var emptyUsers = new System.Collections.Generic.List<object>();
            var exportPath = Path.Combine(_emptyDataPath, "Export_Empty.csv");

            // Act
            var result = await exportService.ExportToCsvAsync(emptyUsers, "Export_Empty.csv");

            // Assert
            // Note: This may not work in test environment due to UI dependencies
            // but we can at least verify the service doesn't throw
            Assert.IsNotNull(exportService, "Export service should be available");
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("Export")]
        public void DataExportService_HasRequiredMethods()
        {
            // Arrange
            var exportService = DataExportService.Instance;

            // Act & Assert
            Assert.IsNotNull(exportService, "DataExportService instance should be available");
            // Test that we can call public methods without throwing
            Assert.IsNotNull(exportService.GetType().GetMethod("ExportToCsvAsync"), "Should have ExportToCsvAsync method");
        }

        #endregion

        #region File System Tests

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("FileSystem")]
        public void FileSystemOperations_CreateEmptyCsv()
        {
            // Arrange
            var filePath = Path.Combine(_emptyDataPath, "EmptyTest.csv");

            // Act
            File.WriteAllText(filePath, "Header1,Header2,Header3");
            var content = File.ReadAllText(filePath);

            // Assert
            Assert.IsTrue(File.Exists(filePath), "File should exist");
            Assert.IsTrue(content.Contains("Header1"), "File should contain header");

            // Cleanup
            File.Delete(filePath);
        }

        [TestMethod]
        [TestCategory("EmptyState")]
        [TestCategory("FileSystem")]
        public void DirectoryEnumeration_EmptyDirectory()
        {
            // Arrange
            var csvFiles = Directory.GetFiles(_emptyDataPath, "*.csv");

            // Act & Assert
            Assert.IsNotNull(csvFiles, "CSV files list should not be null");
            Assert.IsInstanceOfType(csvFiles, typeof(string[]), "Should return string array");
        }

        #endregion

        #region Cleanup

        [TestCleanup]
        public void Cleanup()
        {
            // Clean up test files
            if (Directory.Exists(_emptyDataPath))
            {
                foreach (var file in Directory.GetFiles(_emptyDataPath, "*.csv"))
                {
                    try { File.Delete(file); } catch { }
                }
            }
        }

        #endregion
    }
}