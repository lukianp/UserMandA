using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Handles file transfers with ACL preservation.
    /// </summary>
    public interface IFileTransferClient
    {
        Task CopyAsync(FileItemDto file);
    }

    /// <summary>
    /// Implements file migration using the provided transfer client.
    /// </summary>
    public class FileServerMigrator : IFileMigrator
    {
        private readonly IFileTransferClient _client;

        public FileServerMigrator(IFileTransferClient client)
        {
            _client = client;
        }

        public async Task<MigrationResult> MigrateFileAsync(FileItemDto file, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress> progress = null)
        {
            try
            {
                progress?.Report(new MigrationProgress { Percentage = 0, Message = $"Copying {file.SourcePath}" });
                await _client.CopyAsync(file);
                progress?.Report(new MigrationProgress { Percentage = 100, Message = $"Copied {file.SourcePath}" });
                return MigrationResult.Succeeded();
            }
            catch (Exception ex)
            {
                return MigrationResult.Failed(ex.Message);
            }
        }

        public async Task<RollbackResult> RollbackFileAsync(FileItemDto file, TargetContext target, IProgress<MigrationProgress> progress = null)
        {
            try
            {
                progress?.Report(new MigrationProgress { Percentage = 0, Message = $"Rolling back {file.TargetPath}" });
                
                // Simple rollback implementation - delete target file if it exists
                if (System.IO.File.Exists(file.TargetPath))
                {
                    System.IO.File.Delete(file.TargetPath);
                }
                else if (System.IO.Directory.Exists(file.TargetPath))
                {
                    System.IO.Directory.Delete(file.TargetPath, true);
                }

                progress?.Report(new MigrationProgress { Percentage = 100, Message = $"Rolled back {file.TargetPath}" });
                return RollbackResult.Succeeded("File rollback completed successfully");
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"File rollback failed: {ex.Message}");
            }
        }
    }
}
