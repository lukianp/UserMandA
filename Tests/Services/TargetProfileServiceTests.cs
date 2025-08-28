using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Xunit;

namespace MandADiscoverySuite.Tests.Services
{
    public class TargetProfileServiceTests
    {
        [Fact]
        public async Task Create_Load_Profile_With_Encrypted_Secret()
        {
            // Arrange: point discovery root to temp
            var tempRoot = Path.Combine(Path.GetTempPath(), "MandA_Test_" + Guid.NewGuid());
            Directory.CreateDirectory(tempRoot);
            ConfigurationService.Instance.DiscoveryDataRootPath = tempRoot;

            var company = "UnitTestCompany";
            var svc = TargetProfileService.Instance;
            var profile = new TargetProfile
            {
                Name = "Target A",
                TenantId = Guid.NewGuid().ToString(),
                ClientId = Guid.NewGuid().ToString(),
                Scopes = new() { "User.Read.All", "Group.Read.All" }
            };

            // Act
            await svc.CreateOrUpdateAsync(company, profile, "super-secret");
            var list = await svc.GetProfilesAsync(company);
            var reloaded = list.FirstOrDefault(p => p.Id == profile.Id);

            // Assert
            Assert.NotNull(reloaded);
            Assert.False(string.IsNullOrWhiteSpace(reloaded.ClientSecretEncrypted));
            Assert.NotEqual("super-secret", reloaded.ClientSecretEncrypted);
            var secret = await svc.GetClientSecretAsync(company, reloaded.Id);
            Assert.Equal("super-secret", secret);
        }

        [Fact]
        public void MigratorFactory_Builds_TargetContext()
        {
            var p = new TargetProfile
            {
                Name = "Target B",
                TenantId = "tenant-123",
                ClientId = "client-abc",
                Scopes = new() { "Scope.One", "Scope.Two" }
            };

            var ctx = MigratorFactory.Instance.CreateTargetContext(p);
            Assert.Equal("tenant-123", ctx.TenantId);
            Assert.Equal("client-abc", ctx.ClientId);
            Assert.Equal(2, ctx.AccessScopes.Length);
        }
    }
}

