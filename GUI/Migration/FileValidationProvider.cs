using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Validates file migrations and provides rollback functionality.
    /// </summary>
    public class FileValidationProvider : IFileValidationProvider
    {
        public string ObjectType => "File";
        public bool SupportsRollback => true;

        public async Task<ValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Validating files from {fileItem.SourcePath} to {fileItem.TargetPath}",
                StatusMessage = "Checking file existence, integrity, and permissions"
            });

            var issues = new List<ValidationIssue>();

            try
            {
                // Validate target file/directory exists
                await ValidateTargetExistence(fileItem, issues);

                // Validate file integrity using checksums
                await ValidateFileIntegrity(fileItem, issues, progress);

                // Validate ACLs match
                await ValidateFilePermissions(fileItem, issues);

                // Validate file attributes and metadata
                await ValidateFileMetadata(fileItem, issues);

                // Validate nested structure for directories
                await ValidateDirectoryStructure(fileItem, issues, progress);

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Validation complete for {fileItem.SourcePath}",
                    StatusMessage = $"Found {issues.Count} validation issues",
                    PercentageComplete = 100
                });

                var severity = DetermineSeverity(issues);
                var message = issues.Count == 0
                    ? "File validation passed successfully"
                    : $"File validation completed with {issues.Count} issues";

                return new ValidationResult
                {
                    ValidatedObject = fileItem,
                    ObjectType = ObjectType,
                    ObjectName = fileItem.SourcePath,
                    Severity = severity,
                    Message = message,
                    Issues = { issues }
                };
            }
            catch (Exception ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Critical,
                    Category = "System Error",
                    Description = $"Failed to validate files: {ex.Message}",
                    RecommendedAction = "Check file system access and network connectivity",
                    TechnicalDetails = ex.ToString()
                });

                return ValidationResult.Failed(fileItem, ObjectType, fileItem.SourcePath,
                    "File validation failed due to system error", issues);
            }
        }

        private async Task ValidateTargetExistence(FileItemDto fileItem, List<ValidationIssue> issues)
        {
            await Task.Run(() =>
            {
                try
                {
                    var sourceIsFile = File.Exists(fileItem.SourcePath);
                    var sourceIsDirectory = Directory.Exists(fileItem.SourcePath);
                    var targetIsFile = File.Exists(fileItem.TargetPath);
                    var targetIsDirectory = Directory.Exists(fileItem.TargetPath);

                    if (!sourceIsFile && !sourceIsDirectory)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Error,
                            Category = "Source Existence",
                            Description = $"Source path {fileItem.SourcePath} does not exist",
                            RecommendedAction = "Verify the source path is correct and accessible"
                        });
                        return;
                    }

                    if (!targetIsFile && !targetIsDirectory)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Error,
                            Category = "Target Existence",
                            Description = $"Target path {fileItem.TargetPath} does not exist",
                            RecommendedAction = "Verify the file migration completed successfully"
                        });
                        return;
                    }

                    // Check that source and target are the same type (both files or both directories)
                    if (sourceIsFile != targetIsFile || sourceIsDirectory != targetIsDirectory)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Error,
                            Category = "Type Mismatch",
                            Description = "Source and target are different types (file vs directory)",
                            RecommendedAction = "Verify the migration process and target path configuration"
                        });
                    }
                }
                catch (UnauthorizedAccessException)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "Access Denied",
                        Description = "Insufficient permissions to validate file existence",
                        RecommendedAction = "Run with elevated permissions or check file access rights"
                    });
                }
                catch (Exception ex)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Existence Check",
                        Description = $"Error checking file existence: {ex.Message}",
                        RecommendedAction = "Manually verify file existence and accessibility"
                    });
                }
            });
        }

        private async Task ValidateFileIntegrity(FileItemDto fileItem, List<ValidationIssue> issues, IProgress<ValidationProgress>? progress)
        {
            if (!File.Exists(fileItem.SourcePath) || !File.Exists(fileItem.TargetPath))
                return;

            try
            {
                progress?.Report(new ValidationProgress
                {
                    CurrentStep = "Computing file checksums",
                    StatusMessage = "Calculating SHA256 hashes for integrity verification",
                    PercentageComplete = 25
                });

                var sourceHash = await ComputeFileHashAsync(fileItem.SourcePath);
                progress?.Report(new ValidationProgress
                {
                    CurrentStep = "Computing target checksum",
                    StatusMessage = "Verifying target file integrity",
                    PercentageComplete = 50
                });

                var targetHash = await ComputeFileHashAsync(fileItem.TargetPath);

                if (!string.Equals(sourceHash, targetHash, StringComparison.OrdinalIgnoreCase))
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "File Integrity",
                        Description = "Source and target file checksums do not match",
                        RecommendedAction = "Re-migrate the file as it may be corrupted",
                        TechnicalDetails = $"Source hash: {sourceHash}, Target hash: {targetHash}"
                    });
                }

                // Check file sizes
                var sourceInfo = new FileInfo(fileItem.SourcePath);
                var targetInfo = new FileInfo(fileItem.TargetPath);

                if (sourceInfo.Length != targetInfo.Length)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Category = "File Size",
                        Description = $"File size mismatch - Source: {sourceInfo.Length} bytes, Target: {targetInfo.Length} bytes",
                        RecommendedAction = "Re-migrate the file as the copy appears incomplete"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Integrity Check",
                    Description = $"Could not verify file integrity: {ex.Message}",
                    RecommendedAction = "Manually compare source and target files"
                });
            }
        }

        private async Task<string> ComputeFileHashAsync(string filePath)
        {
            using var sha256 = SHA256.Create();
            using var stream = File.OpenRead(filePath);
            var hashBytes = await Task.Run(() => sha256.ComputeHash(stream));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        private async Task ValidateFilePermissions(FileItemDto fileItem, List<ValidationIssue> issues)
        {
            await Task.Run(() =>
            {
                try
                {
                    if (File.Exists(fileItem.SourcePath) && File.Exists(fileItem.TargetPath))
                    {
                        ValidateFileAcl(fileItem.SourcePath, fileItem.TargetPath, issues);
                    }
                    else if (Directory.Exists(fileItem.SourcePath) && Directory.Exists(fileItem.TargetPath))
                    {
                        ValidateDirectoryAcl(fileItem.SourcePath, fileItem.TargetPath, issues);
                    }
                }
                catch (Exception ex)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Permission Validation",
                        Description = $"Could not validate file permissions: {ex.Message}",
                        RecommendedAction = "Manually verify file permissions match source"
                    });
                }
            });
        }

        private void ValidateFileAcl(string sourcePath, string targetPath, List<ValidationIssue> issues)
        {
            try
            {
                var sourceInfo = new FileInfo(sourcePath);
                var targetInfo = new FileInfo(targetPath);

                var sourceSecurity = sourceInfo.GetAccessControl();
                var targetSecurity = targetInfo.GetAccessControl();

                var sourceRules = sourceSecurity.GetAccessRules(true, true, typeof(System.Security.Principal.NTAccount));
                var targetRules = targetSecurity.GetAccessRules(true, true, typeof(System.Security.Principal.NTAccount));

                if (sourceRules.Count != targetRules.Count)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "File Permissions",
                        Description = $"Permission rule count mismatch - Source: {sourceRules.Count}, Target: {targetRules.Count}",
                        RecommendedAction = "Review and adjust file permissions to match source"
                    });
                }

                // This is a simplified check - in practice you'd want to compare specific rules
                var sourceOwner = sourceSecurity.GetOwner(typeof(System.Security.Principal.NTAccount));
                var targetOwner = targetSecurity.GetOwner(typeof(System.Security.Principal.NTAccount));

                if (!sourceOwner.Equals(targetOwner))
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "File Ownership",
                        Description = $"File owner mismatch - Source: {sourceOwner}, Target: {targetOwner}",
                        RecommendedAction = "Update file ownership to match source environment"
                    });
                }
            }
            catch (UnauthorizedAccessException)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Permission Check",
                    Description = "Insufficient permissions to check file ACLs",
                    RecommendedAction = "Run with elevated permissions to validate ACLs"
                });
            }
        }

        private void ValidateDirectoryAcl(string sourcePath, string targetPath, List<ValidationIssue> issues)
        {
            try
            {
                var sourceInfo = new DirectoryInfo(sourcePath);
                var targetInfo = new DirectoryInfo(targetPath);

                var sourceSecurity = sourceInfo.GetAccessControl();
                var targetSecurity = targetInfo.GetAccessControl();

                // Similar ACL validation as file, but for directories
                var sourceRules = sourceSecurity.GetAccessRules(true, true, typeof(System.Security.Principal.NTAccount));
                var targetRules = targetSecurity.GetAccessRules(true, true, typeof(System.Security.Principal.NTAccount));

                if (sourceRules.Count != targetRules.Count)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Directory Permissions",
                        Description = $"Directory permission rule count mismatch - Source: {sourceRules.Count}, Target: {targetRules.Count}",
                        RecommendedAction = "Review and adjust directory permissions to match source"
                    });
                }
            }
            catch (UnauthorizedAccessException)
            {
                issues.Add(new ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Permission Check",
                    Description = "Insufficient permissions to check directory ACLs",
                    RecommendedAction = "Run with elevated permissions to validate directory ACLs"
                });
            }
        }

        private async Task ValidateFileMetadata(FileItemDto fileItem, List<ValidationIssue> issues)
        {
            await Task.Run(() =>
            {
                try
                {
                    if (File.Exists(fileItem.SourcePath) && File.Exists(fileItem.TargetPath))
                    {
                        var sourceInfo = new FileInfo(fileItem.SourcePath);
                        var targetInfo = new FileInfo(fileItem.TargetPath);

                        // Check creation time preservation
                        var timeDifference = Math.Abs((sourceInfo.CreationTime - targetInfo.CreationTime).TotalMinutes);
                        if (timeDifference > 5) // Allow 5-minute variance
                        {
                            issues.Add(new ValidationIssue
                            {
                                Severity = ValidationSeverity.Warning,
                                Category = "File Metadata",
                                Description = $"Creation time not preserved - Source: {sourceInfo.CreationTime}, Target: {targetInfo.CreationTime}",
                                RecommendedAction = "Consider preserving file timestamps during migration"
                            });
                        }

                        // Check file attributes
                        if (sourceInfo.Attributes != targetInfo.Attributes)
                        {
                            issues.Add(new ValidationIssue
                            {
                                Severity = ValidationSeverity.Warning,
                                Category = "File Attributes",
                                Description = $"File attributes differ - Source: {sourceInfo.Attributes}, Target: {targetInfo.Attributes}",
                                RecommendedAction = "Verify file attributes are correctly preserved"
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Metadata Validation",
                        Description = $"Could not validate file metadata: {ex.Message}",
                        RecommendedAction = "Manually compare file properties"
                    });
                }
            });
        }

        private async Task ValidateDirectoryStructure(FileItemDto fileItem, List<ValidationIssue> issues, IProgress<ValidationProgress>? progress)
        {
            if (!Directory.Exists(fileItem.SourcePath) || !Directory.Exists(fileItem.TargetPath))
                return;

            await Task.Run(() =>
            {
                try
                {
                    progress?.Report(new ValidationProgress
                    {
                        CurrentStep = "Validating directory structure",
                        StatusMessage = "Comparing source and target directory contents",
                        PercentageComplete = 75
                    });

                    var sourceFiles = Directory.GetFiles(fileItem.SourcePath, "*", SearchOption.AllDirectories);
                    var sourceDirs = Directory.GetDirectories(fileItem.SourcePath, "*", SearchOption.AllDirectories);

                    var targetFiles = Directory.GetFiles(fileItem.TargetPath, "*", SearchOption.AllDirectories);
                    var targetDirs = Directory.GetDirectories(fileItem.TargetPath, "*", SearchOption.AllDirectories);

                    // Check file count
                    if (sourceFiles.Length != targetFiles.Length)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Error,
                            Category = "Directory Structure",
                            Description = $"File count mismatch - Source: {sourceFiles.Length}, Target: {targetFiles.Length}",
                            RecommendedAction = "Verify all files were migrated successfully"
                        });
                    }

                    // Check directory count
                    if (sourceDirs.Length != targetDirs.Length)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Category = "Directory Structure",
                            Description = $"Directory count mismatch - Source: {sourceDirs.Length}, Target: {targetDirs.Length}",
                            RecommendedAction = "Verify all directories were migrated successfully"
                        });
                    }

                    // Check for specific missing files (sample check)
                    var sourceFileNames = sourceFiles.Select(f => Path.GetRelativePath(fileItem.SourcePath, f)).ToHashSet();
                    var targetFileNames = targetFiles.Select(f => Path.GetRelativePath(fileItem.TargetPath, f)).ToHashSet();

                    var missingFiles = sourceFileNames.Except(targetFileNames).ToList();
                    if (missingFiles.Any())
                    {
                        var sampleMissing = string.Join(", ", missingFiles.Take(5));
                        issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Error,
                            Category = "Missing Files",
                            Description = $"{missingFiles.Count} files missing from target. Sample: {sampleMissing}",
                            RecommendedAction = "Re-migrate missing files"
                        });
                    }
                }
                catch (Exception ex)
                {
                    issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Category = "Structure Validation",
                        Description = $"Could not validate directory structure: {ex.Message}",
                        RecommendedAction = "Manually compare directory structures"
                    });
                }
            });
        }

        private ValidationSeverity DetermineSeverity(List<ValidationIssue> issues)
        {
            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Critical)
                    return ValidationSeverity.Critical;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Error)
                    return ValidationSeverity.Error;
            }

            foreach (var issue in issues)
            {
                if (issue.Severity == ValidationSeverity.Warning)
                    return ValidationSeverity.Warning;
            }

            return ValidationSeverity.Success;
        }

        public async Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            progress?.Report(new ValidationProgress
            {
                CurrentStep = $"Rolling back files from {fileItem.TargetPath}",
                StatusMessage = "Deleting target copy and cleaning up"
            });

            var errors = new List<string>();
            var warnings = new List<string>();

            try
            {
                if (File.Exists(fileItem.TargetPath))
                {
                    await Task.Run(() => File.Delete(fileItem.TargetPath));
                }
                else if (Directory.Exists(fileItem.TargetPath))
                {
                    await Task.Run(() => Directory.Delete(fileItem.TargetPath, true));
                }
                else
                {
                    warnings.Add("Target path does not exist - nothing to roll back");
                }

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Rollback complete for {fileItem.SourcePath}",
                    StatusMessage = "Target copy deleted successfully",
                    PercentageComplete = 100
                });

                var message = warnings.Count > 0
                    ? $"File rollback completed with {warnings.Count} warnings"
                    : "File rollback completed successfully";

                return new RollbackResult
                {
                    Success = true,
                    Message = message,
                    Warnings = warnings
                };
            }
            catch (UnauthorizedAccessException ex)
            {
                errors.Add($"Access denied during rollback: {ex.Message}");
                return RollbackResult.Failed("Rollback failed due to insufficient permissions", errors);
            }
            catch (IOException ex)
            {
                errors.Add($"IO error during rollback: {ex.Message}");
                return RollbackResult.Failed("Rollback failed due to file system error", errors);
            }
            catch (Exception ex)
            {
                errors.Add($"Unexpected error during rollback: {ex.Message}");
                return RollbackResult.Failed($"File rollback failed: {ex.Message}", errors);
            }
        }
    }
}