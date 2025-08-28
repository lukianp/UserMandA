using MandADiscoverySuite.Migration;
using MandADiscoverySuite.MigrationProviders;
using MandADiscoverySuite.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Creates migrators and resolves TargetContext from a selected TargetProfile.
    /// </summary>
    public class MigratorFactory
    {
        public static MigratorFactory Instance { get; } = new MigratorFactory();

        private MigratorFactory() { }

        public IIdentityMigrator CreateIdentityMigrator(TargetProfile profile)
        {
            // For Microsoft 365 targets use Graph-based migrator
            return new GraphIdentityMigrator(null); // TODO: Implement proper client injection
        }

        public IMailMigrator CreateMailMigrator(TargetProfile profile)
        {
            // For Microsoft 365 targets use Exchange Online migrator
            return new ExchangeMailMigrator(null); // TODO: Implement proper client injection
        }

        public IFileMigrator CreateFileMigrator(TargetProfile profile)
        {
            return new FileServerMigrator(null); // TODO: Implement proper client injection
        }

        public ISqlMigrator CreateSqlMigrator(TargetProfile profile)
        {
            return new SqlMigrator(null); // TODO: Implement proper client injection
        }

        public TargetContext CreateTargetContext(TargetProfile profile)
        {
            if (profile == null) throw new ArgumentNullException(nameof(profile));
            return new TargetContext
            {
                TenantId = profile.TenantId,
                ClientId = profile.ClientId,
                AccessScopes = profile.Scopes?.ToArray() ?? Array.Empty<string>()
            };
        }

        public async Task<string> GetClientSecretAsync(TargetProfile profile)
        {
            if (profile == null) return string.Empty;
            var company = (await ProfileService.Instance.GetCurrentProfileAsync())?.CompanyName ?? "default";
            return await TargetProfileService.Instance.GetClientSecretAsync(company, profile.Id);
        }
    }
}

