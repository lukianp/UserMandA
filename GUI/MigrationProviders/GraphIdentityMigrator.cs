using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// Uses Microsoft Graph to create users in the target tenant.
    /// </summary>
    public interface IGraphUserClient
    {
        Task CreateUserAsync(UserDto user);
    }

    /// <summary>
    /// Implements user migration via Microsoft Graph.
    /// </summary>
    public class GraphIdentityMigrator : IIdentityMigrator
    {
        private readonly IGraphUserClient _client;

        public GraphIdentityMigrator(IGraphUserClient client)
        {
            _client = client;
        }

        public async Task<MigrationResult> MigrateUserAsync(UserDto user, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            try
            {
                progress?.Report(new MigrationProgress { Percentage = 0, Message = $"Creating user {user.DisplayName}" });
                await _client.CreateUserAsync(user);
                progress?.Report(new MigrationProgress { Percentage = 100, Message = $"User {user.DisplayName} created" });
                return MigrationResult.Succeeded();
            }
            catch (Exception ex)
            {
                return MigrationResult.Failed(ex.Message);
            }
        }
    }
}
