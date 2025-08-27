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

        public async Task<MigrationResult> MigrateFileAsync(FileItemDto file, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
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
    }
}
