using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration.ValidationProviders
{
    /// <summary>
    /// Comprehensive tests for FileValidationProvider - validates file migrations including checksums, ACLs, and rollback operations
    /// </summary>
    [TestClass]
    public class FileValidationProviderTests
    {
        private FileValidationProvider _fileValidator;
        private Mock<IFileSystemService> _mockFileSystemService;
        private Mock<IChecksumService> _mockChecksumService;
        private Mock<IAclService> _mockAclService;
        private TargetContext _testTargetContext;
        private FileItemDto _testFileItem;
        private List<string> _auditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockFileSystemService = new Mock<IFileSystemService>();
            _mockChecksumService = new Mock<IChecksumService>();
            _mockAclService = new Mock<IAclService>();
            _auditRecords = new List<string>();

            _fileValidator = new FileValidationProvider(_mockFileSystemService.Object, _mockChecksumService.Object, _mockAclService.Object);

            _testTargetContext = new TargetContext
            {
                TenantId = "test-tenant-123",
                Environment = "Test"
            };

            _testFileItem = new FileItemDto
            {
                SourcePath = @"\\source-server\share\ProjectFiles",
                TargetPath = @"\\target-server\share\ProjectFiles",
                FileCount = 1250,
                TotalSize = 1024 * 1024 * 750, // 750 MB
                FolderCount = 45
            };
        }

        #region File Existence Tests

        [TestMethod]
        public async Task ValidateFilesAsync_AllFilesExist_ReturnsSuccess()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(1250);
            var targetFiles = CreateTestFileList(1250); // All files copied

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupAclMocks(sourceFiles, targetFiles, allMatch: true);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            Assert.AreEqual(_testFileItem.SourcePath, result.ObjectName);
            Assert.AreEqual(0, result.Issues.Count);
            RecordAuditEvent("File validation passed", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_MissingFiles_ReturnsError()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(1250);
            var targetFiles = CreateTestFileList(1200); // Missing 50 files

            SetupFileSystemMocks(sourceFiles, targetFiles);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("File Count"));
            var issue = result.GetIssueByCategory("File Count");
            Assert.IsTrue(issue.Description.Contains("50 files missing"));
            RecordAuditEvent("File validation failed - missing files", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_TargetPathNotAccessible_ReturnsError()
        {
            // Arrange
            _mockFileSystemService
                .Setup(fs => fs.DirectoryExistsAsync(_testFileItem.TargetPath))
                .ReturnsAsync(false);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Target Access"));
            Assert.IsTrue(result.GetIssueByCategory("Target Access").Description.Contains("not accessible"));
            RecordAuditEvent("File validation failed - target not accessible", _testFileItem.TargetPath);
        }

        #endregion

        #region Checksum Validation Tests

        [TestMethod]
        public async Task ValidateFilesAsync_ChecksumMatch_ReturnsSuccess()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupAclMocks(sourceFiles, targetFiles, allMatch: true);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("File Integrity"));
            RecordAuditEvent("File validation - all checksums match", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_ChecksumMismatch_ReturnsError()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: false, mismatchCount: 5);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("File Integrity"));
            var issue = result.GetIssueByCategory("File Integrity");
            Assert.IsTrue(issue.Description.Contains("5 files with checksum mismatches"));
            RecordAuditEvent("File validation failed - checksum mismatches", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_CorruptedFile_ReturnsError()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(10);
            var targetFiles = CreateTestFileList(10);
            var corruptedFile = "important-document.docx";

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupCorruptedFileMock(corruptedFile);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("File Integrity"));
            var issue = result.GetIssueByCategory("File Integrity");
            Assert.IsTrue(issue.Description.Contains(corruptedFile));
            RecordAuditEvent("File validation failed - corrupted file detected", corruptedFile);
        }

        #endregion

        #region ACL Validation Tests

        [TestMethod]
        public async Task ValidateFilesAsync_AclsPreserved_ReturnsSuccess()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(50);
            var targetFiles = CreateTestFileList(50);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupAclMocks(sourceFiles, targetFiles, allMatch: true);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("ACL Preservation"));
            RecordAuditEvent("File validation - ACLs preserved", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_AclMismatch_ReturnsWarning()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(50);
            var targetFiles = CreateTestFileList(50);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupAclMocks(sourceFiles, targetFiles, allMatch: false, mismatchCount: 3);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("ACL Preservation"));
            var issue = result.GetIssueByCategory("ACL Preservation");
            Assert.IsTrue(issue.Description.Contains("3 files"));
            RecordAuditEvent("File validation - ACL mismatches found", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_OrphanedSids_ReturnsWarning()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(20);
            var targetFiles = CreateTestFileList(20);
            var orphanedSids = new List<string> { "S-1-5-21-123456789-123456789-123456789-1001" };

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupOrphanedSidsMock(orphanedSids);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.HasIssueWithSeverity(ValidationSeverity.Warning));
            Assert.IsTrue(result.HasIssueWithCategory("ACL Preservation"));
            var issue = result.GetIssueByCategory("ACL Preservation");
            Assert.IsTrue(issue.Description.Contains("orphaned SIDs"));
            RecordAuditEvent("File validation - orphaned SIDs found", _testFileItem.SourcePath);
        }

        #endregion

        #region Size Validation Tests

        [TestMethod]
        public async Task ValidateFilesAsync_SizeMatch_ReturnsSuccess()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);
            var totalSize = sourceFiles.Sum(f => f.Size);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupSizeValidationMocks(totalSize, totalSize); // Exact match

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Size Validation"));
            RecordAuditEvent("File validation - sizes match", _testFileItem.SourcePath);
        }

        [TestMethod]
        public async Task ValidateFilesAsync_SizeMismatch_ReturnsError()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);
            var sourceSize = sourceFiles.Sum(f => f.Size);
            var targetSize = sourceSize - (1024 * 50); // 50KB missing

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupSizeValidationMocks(sourceSize, targetSize);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.AreEqual(ValidationSeverity.Error, result.Severity);
            Assert.IsTrue(result.HasIssueWithCategory("Size Validation"));
            var issue = result.GetIssueByCategory("Size Validation");
            Assert.IsTrue(issue.Description.Contains("size mismatch"));
            RecordAuditEvent("File validation failed - size mismatch", _testFileItem.SourcePath);
        }

        #endregion

        #region Rollback Tests

        [TestMethod]
        public async Task RollbackFilesAsync_Success_DeletesTargetFiles()
        {
            // Arrange
            _mockFileSystemService
                .Setup(fs => fs.DeleteDirectoryAsync(_testFileItem.TargetPath, true))
                .ReturnsAsync(true);

            _mockFileSystemService
                .Setup(fs => fs.DirectoryExistsAsync(_testFileItem.TargetPath))
                .ReturnsAsync(false); // Confirmed deleted

            // Act
            var result = await _fileValidator.RollbackFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.IsTrue(result.Message.Contains("successfully"));
            _mockFileSystemService.Verify(fs => fs.DeleteDirectoryAsync(_testFileItem.TargetPath, true), Times.Once);
            RecordAuditEvent("File rollback successful", _testFileItem.TargetPath);
        }

        [TestMethod]
        public async Task RollbackFilesAsync_PartialDeletion_ReturnsWarning()
        {
            // Arrange
            var remainingFiles = new List<string> { "locked-file.txt", "in-use-file.docx" };

            _mockFileSystemService
                .Setup(fs => fs.DeleteDirectoryAsync(_testFileItem.TargetPath, true))
                .ReturnsAsync(false);

            _mockFileSystemService
                .Setup(fs => fs.GetRemainingFilesAsync(_testFileItem.TargetPath))
                .ReturnsAsync(remainingFiles);

            // Act
            var result = await _fileValidator.RollbackFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            Assert.AreEqual(1, result.Warnings.Count);
            Assert.IsTrue(result.Warnings[0].Contains("2 files could not be deleted"));
            RecordAuditEvent("File rollback partial success", _testFileItem.TargetPath, warnings: result.Warnings);
        }

        [TestMethod]
        public async Task RollbackFilesAsync_AccessDenied_ReturnsFailure()
        {
            // Arrange
            _mockFileSystemService
                .Setup(fs => fs.DeleteDirectoryAsync(_testFileItem.TargetPath, true))
                .ThrowsAsync(new UnauthorizedAccessException("Access denied to target directory"));

            // Act
            var result = await _fileValidator.RollbackFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Access denied"));
            Assert.AreEqual(1, result.Errors.Count);
            RecordAuditEvent("File rollback failed", _testFileItem.TargetPath, errors: result.Errors);
        }

        [TestMethod]
        public async Task RollbackFilesAsync_ForceDelete_OvercomesLocks()
        {
            // Arrange
            _mockFileSystemService
                .SetupSequence(fs => fs.DeleteDirectoryAsync(_testFileItem.TargetPath, true))
                .ReturnsAsync(false) // First attempt fails
                .ReturnsAsync(true); // Second attempt with force succeeds

            _mockFileSystemService
                .Setup(fs => fs.ForceDeleteDirectoryAsync(_testFileItem.TargetPath))
                .ReturnsAsync(true);

            // Act
            var result = await _fileValidator.RollbackFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsTrue(result.Success);
            _mockFileSystemService.Verify(fs => fs.ForceDeleteDirectoryAsync(_testFileItem.TargetPath), Times.Once);
            RecordAuditEvent("File rollback successful with force delete", _testFileItem.TargetPath);
        }

        #endregion

        #region Performance Tests

        [TestMethod]
        public async Task ValidateFilesAsync_LargeFileSet_HandlesPerformantly()
        {
            // Arrange
            var largeFileSet = new FileItemDto
            {
                SourcePath = @"\\source\share\LargeDataSet",
                TargetPath = @"\\target\share\LargeDataSet",
                FileCount = 50000,
                TotalSize = 1024L * 1024L * 1024L * 50, // 50 GB
                FolderCount = 500
            };

            var sourceFiles = CreateTestFileList(50000);
            var targetFiles = CreateTestFileList(50000);

            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true, batchSize: 1000); // Process in batches

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            // Act
            var result = await _fileValidator.ValidateFilesAsync(largeFileSet, _testTargetContext);

            // Assert
            stopwatch.Stop();
            Assert.IsTrue(stopwatch.ElapsedMilliseconds < 120000, "Large file set validation should complete within 2 minutes");
            Assert.AreEqual(ValidationSeverity.Success, result.Severity);
            RecordAuditEvent("Large file set validation completed", largeFileSet.SourcePath, additionalInfo: $"Duration: {stopwatch.ElapsedMilliseconds}ms");
        }

        [TestMethod]
        public async Task ValidateFilesAsync_DeepFolderStructure_HandlesCorrectly()
        {
            // Arrange
            var deepStructure = CreateDeepFolderStructure(10); // 10 levels deep
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);

            SetupFileSystemMocks(sourceFiles, targetFiles, deepStructure);

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext);

            // Assert
            Assert.IsFalse(result.HasIssueWithCategory("Folder Structure"));
            RecordAuditEvent("Deep folder structure validation completed", _testFileItem.SourcePath);
        }

        #endregion

        #region Progress Reporting Tests

        [TestMethod]
        public async Task ValidateFilesAsync_WithProgressReporting_ReportsCorrectSteps()
        {
            // Arrange
            var sourceFiles = CreateTestFileList(100);
            var targetFiles = CreateTestFileList(100);
            
            SetupFileSystemMocks(sourceFiles, targetFiles);
            SetupChecksumMocks(sourceFiles, targetFiles, allMatch: true);
            SetupAclMocks(sourceFiles, targetFiles, allMatch: true);

            var progressReports = new List<ValidationProgress>();
            var progress = new Progress<ValidationProgress>(p => progressReports.Add(p));

            // Act
            var result = await _fileValidator.ValidateFilesAsync(_testFileItem, _testTargetContext, progress);

            // Assert
            Assert.IsTrue(progressReports.Count >= 3); // Start, progress, completion
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("Validating files")));
            Assert.IsTrue(progressReports.Any(p => p.CurrentStep.Contains("checksums")));
            Assert.IsTrue(progressReports.Any(p => p.PercentageComplete == 100));
            RecordAuditEvent("File validation with progress tracking", _testFileItem.SourcePath);
        }

        #endregion

        #region Helper Methods

        private List<FileInfo> CreateTestFileList(int count)
        {
            var files = new List<FileInfo>();
            for (int i = 0; i < count; i++)
            {
                files.Add(new FileInfo
                {
                    Name = $"file_{i:D4}.txt",
                    Size = 1024 * (i % 100 + 1), // Variable sizes
                    Path = $@"\folder_{i % 10}\file_{i:D4}.txt",
                    Hash = GenerateTestHash(i)
                });
            }
            return files;
        }

        private List<string> CreateDeepFolderStructure(int levels)
        {
            var folders = new List<string>();
            var path = "";
            for (int i = 0; i < levels; i++)
            {
                path = Path.Combine(path, $"Level{i}");
                folders.Add(path);
            }
            return folders;
        }

        private string GenerateTestHash(int seed)
        {
            using (var sha256 = SHA256.Create())
            {
                var data = System.Text.Encoding.UTF8.GetBytes($"test-file-{seed}");
                var hash = sha256.ComputeHash(data);
                return Convert.ToBase64String(hash);
            }
        }

        private void SetupFileSystemMocks(List<FileInfo> sourceFiles, List<FileInfo> targetFiles, List<string> folders = null)
        {
            _mockFileSystemService
                .Setup(fs => fs.DirectoryExistsAsync(_testFileItem.SourcePath))
                .ReturnsAsync(true);

            _mockFileSystemService
                .Setup(fs => fs.DirectoryExistsAsync(_testFileItem.TargetPath))
                .ReturnsAsync(true);

            _mockFileSystemService
                .Setup(fs => fs.GetFilesAsync(_testFileItem.SourcePath, true))
                .ReturnsAsync(sourceFiles);

            _mockFileSystemService
                .Setup(fs => fs.GetFilesAsync(_testFileItem.TargetPath, true))
                .ReturnsAsync(targetFiles);

            if (folders != null)
            {
                _mockFileSystemService
                    .Setup(fs => fs.GetDirectoriesAsync(_testFileItem.TargetPath, true))
                    .ReturnsAsync(folders);
            }
        }

        private void SetupChecksumMocks(List<FileInfo> sourceFiles, List<FileInfo> targetFiles, bool allMatch, int mismatchCount = 0, int batchSize = 100)
        {
            if (allMatch)
            {
                foreach (var file in sourceFiles)
                {
                    var targetFile = targetFiles.FirstOrDefault(t => t.Name == file.Name);
                    if (targetFile != null)
                    {
                        _mockChecksumService
                            .Setup(cs => cs.CalculateHashAsync(It.Is<string>(path => path.Contains(file.Name))))
                            .ReturnsAsync(file.Hash);
                    }
                }
            }
            else
            {
                var mismatchFiles = sourceFiles.Take(mismatchCount).ToList();
                foreach (var file in mismatchFiles)
                {
                    _mockChecksumService
                        .Setup(cs => cs.CalculateHashAsync(It.Is<string>(path => path.Contains(file.Name) && path.Contains("target"))))
                        .ReturnsAsync("different-hash");
                    
                    _mockChecksumService
                        .Setup(cs => cs.CalculateHashAsync(It.Is<string>(path => path.Contains(file.Name) && path.Contains("source"))))
                        .ReturnsAsync(file.Hash);
                }

                // Set up matching files
                var matchingFiles = sourceFiles.Skip(mismatchCount).ToList();
                foreach (var file in matchingFiles)
                {
                    _mockChecksumService
                        .Setup(cs => cs.CalculateHashAsync(It.Is<string>(path => path.Contains(file.Name))))
                        .ReturnsAsync(file.Hash);
                }
            }
        }

        private void SetupCorruptedFileMock(string corruptedFileName)
        {
            _mockChecksumService
                .Setup(cs => cs.CalculateHashAsync(It.Is<string>(path => path.Contains(corruptedFileName))))
                .ThrowsAsync(new InvalidDataException($"File appears to be corrupted: {corruptedFileName}"));
        }

        private void SetupAclMocks(List<FileInfo> sourceFiles, List<FileInfo> targetFiles, bool allMatch, int mismatchCount = 0)
        {
            if (allMatch)
            {
                _mockAclService
                    .Setup(acl => acl.CompareAclsAsync(It.IsAny<string>(), It.IsAny<string>()))
                    .ReturnsAsync(new AclComparisonResult { Match = true });
            }
            else
            {
                var mismatchFiles = sourceFiles.Take(mismatchCount).ToList();
                foreach (var file in mismatchFiles)
                {
                    _mockAclService
                        .Setup(acl => acl.CompareAclsAsync(
                            It.Is<string>(path => path.Contains("source") && path.Contains(file.Name)),
                            It.Is<string>(path => path.Contains("target") && path.Contains(file.Name))))
                        .ReturnsAsync(new AclComparisonResult
                        {
                            Match = false,
                            Differences = new List<string> { "Permission mismatch for DOMAIN\\User1" }
                        });
                }

                // Set up matching files
                var matchingFiles = sourceFiles.Skip(mismatchCount).ToList();
                foreach (var file in matchingFiles)
                {
                    _mockAclService
                        .Setup(acl => acl.CompareAclsAsync(It.IsAny<string>(), It.IsAny<string>()))
                        .ReturnsAsync(new AclComparisonResult { Match = true });
                }
            }
        }

        private void SetupOrphanedSidsMock(List<string> orphanedSids)
        {
            _mockAclService
                .Setup(acl => acl.FindOrphanedSidsAsync(_testFileItem.TargetPath))
                .ReturnsAsync(orphanedSids);
        }

        private void SetupSizeValidationMocks(long sourceSize, long targetSize)
        {
            _mockFileSystemService
                .Setup(fs => fs.GetDirectorySizeAsync(_testFileItem.SourcePath))
                .ReturnsAsync(sourceSize);

            _mockFileSystemService
                .Setup(fs => fs.GetDirectorySizeAsync(_testFileItem.TargetPath))
                .ReturnsAsync(targetSize);
        }

        private void RecordAuditEvent(string action, string objectIdentifier, List<string> warnings = null, List<string> errors = null, string additionalInfo = null)
        {
            var timestamp = DateTime.Now;
            var auditRecord = $"{timestamp:yyyy-MM-dd HH:mm:ss} - {action} - Object: {objectIdentifier}";
            
            if (warnings?.Count > 0)
            {
                auditRecord += $" - Warnings: {warnings.Count}";
            }
            
            if (errors?.Count > 0)
            {
                auditRecord += $" - Errors: {errors.Count}";
            }

            if (!string.IsNullOrEmpty(additionalInfo))
            {
                auditRecord += $" - Info: {additionalInfo}";
            }

            _auditRecords.Add(auditRecord);
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            Assert.IsTrue(_auditRecords.Count > 0, "Audit records should be created for file validation operations");
            
            foreach (var record in _auditRecords)
            {
                System.Diagnostics.Debug.WriteLine($"FILE_VALIDATION_AUDIT: {record}");
            }
        }
    }

    #region Test Support Classes

    public class FileInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public long Size { get; set; }
        public string Hash { get; set; } = string.Empty;
    }

    public interface IFileSystemService
    {
        Task<bool> DirectoryExistsAsync(string path);
        Task<List<FileInfo>> GetFilesAsync(string path, bool recursive);
        Task<List<string>> GetDirectoriesAsync(string path, bool recursive);
        Task<long> GetDirectorySizeAsync(string path);
        Task<bool> DeleteDirectoryAsync(string path, bool recursive);
        Task<bool> ForceDeleteDirectoryAsync(string path);
        Task<List<string>> GetRemainingFilesAsync(string path);
    }

    public interface IChecksumService
    {
        Task<string> CalculateHashAsync(string filePath);
    }

    public interface IAclService
    {
        Task<AclComparisonResult> CompareAclsAsync(string sourcePath, string targetPath);
        Task<List<string>> FindOrphanedSidsAsync(string path);
    }

    public class AclComparisonResult
    {
        public bool Match { get; set; }
        public List<string> Differences { get; set; } = new();
    }

    #endregion
}