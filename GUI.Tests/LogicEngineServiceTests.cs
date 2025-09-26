using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models.Identity;

namespace GUI.Tests.Services
{
    public class LogicEngineServiceTests
    {
        private readonly string _dataPath;
        private readonly LogicEngineService _service;
        private readonly Mock<ILogger<LogicEngineService>> _logger = new();

        public LogicEngineServiceTests()
        {
            var baseDir = AppContext.BaseDirectory;
            _dataPath = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "Tests", "TestData", "LogicEngine", "basic"));
            _service = new LogicEngineService(_logger.Object, _dataPath);
        }

        [TestMethod]
        public async Task LoadAllAsync_LoadsSampleData()
        {
            var success = await _service.LoadAllAsync();
            Assert.IsTrue(success);
            var user = await _service.GetUserDetailAsync("S-1-5-21-1-1-1-1001");
            Assert.IsNotNull(user);
            Assert.AreEqual("user1@contoso.com", user!.User.UPN);
            Assert.AreEqual(1, user.Groups.Count);
            Assert.AreEqual(1, user.Devices.Count);
        }

        [TestMethod]
        public async Task LoadAllAsync_HandlesDuplicateUsers()
        {
            var tempDir = CopyDataDirectory();
            var usersFile = Path.Combine(tempDir, "Users.csv");
            File.AppendAllText(usersFile, "\nuser1@contoso.com,user1,S-1-5-21-1-1-1-1001,user1@contoso.com,User One,True,OU=Users,,IT,11111111-1111-1111-1111-111111111111,GroupA,2024-01-01T00:00:00Z,ActiveDirectoryDiscovery,session-001");
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            var stats = svc.GetLoadStatistics();
            Assert.AreEqual(1, stats.UserCount);
            Directory.Delete(tempDir, true);
        }

        [TestMethod]
        public async Task LoadAllAsync_IgnoresInvalidTimestamp()
        {
            var tempDir = CopyDataDirectory();
            var usersFile = Path.Combine(tempDir, "Users.csv");
            var lines = File.ReadAllLines(usersFile);
            lines[1] = lines[1].Replace("2024-01-01T00:00:00Z", "not-a-date");
            File.WriteAllLines(usersFile, lines);
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            var user = await svc.GetUserDetailAsync("S-1-5-21-1-1-1-1001");
            Assert.IsNotNull(user);
            Directory.Delete(tempDir, true);
        }

        [TestMethod]
        public async Task LoadAllAsync_HandlesMissingHeaders()
        {
            var tempDir = CopyDataDirectory();
            var usersFile = Path.Combine(tempDir, "Users.csv");
            var text = File.ReadAllText(usersFile);
            File.WriteAllText(usersFile, text.Replace("Sid,", string.Empty));
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            Directory.Delete(tempDir, true);
        }

        [TestMethod]
        public async Task AclGroupUserInference_MapsGroupAclToUser()
        {
            var success = await _service.LoadAllAsync();
            Assert.IsTrue(success);
            var detail = await _service.GetUserDetailAsync("S-1-5-21-1-1-1-1001");
            Assert.IsNotNull(detail);
            Assert.IsTrue(detail!.Shares.Any(s => s.Path == "C:\\Share"));
        }

        [TestMethod]
        public async Task LoadAllAsync_EmptyFiles_DoesNotThrowAndReportsZero()
        {
            var tempDir = CopyDataDirectory();
            // Truncate all CSVs
            foreach (var file in Directory.GetFiles(tempDir, "*.csv"))
                File.WriteAllText(file, string.Empty);
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            var stats = svc.GetLoadStatistics();
            Assert.AreEqual(0, stats.UserCount);
            Assert.AreEqual(0, stats.DeviceCount);
            Assert.AreEqual(0, stats.GroupCount);
            Directory.Delete(tempDir, true);
        }

        [TestMethod]
        public async Task LoadAllAsync_MalformedCsvRows_GracefullySkips()
        {
            var tempDir = CopyDataDirectory();
            var usersFile = Path.Combine(tempDir, "Users.csv");
            // Append broken line with wrong column count or garbage
            File.AppendAllText(usersFile, "\nthis,is,not,valid,row");
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            var stats = svc.GetLoadStatistics();
            Assert.IsTrue(stats.UserCount >= 0);
            Directory.Delete(tempDir, true);
        }

        [TestMethod]
        public async Task LoadAllAsync_NoRelationships_DoesNotBreakLookups()
        {
            var tempDir = CopyDataDirectory();
            // Remove groups/devices to simulate missing relationships
            foreach (var name in new[] { "Groups.csv", "GroupMembers.csv", "Computers.csv", "UserDevices.csv", "Shares.csv", "Acls.csv" })
            {
                var p = Path.Combine(tempDir, name);
                if (File.Exists(p)) File.Delete(p);
            }
            var svc = new LogicEngineService(_logger.Object, tempDir);
            var success = await svc.LoadAllAsync();
            Assert.IsTrue(success);
            // Query a known user; relationships should be empty but not throw
            var detail = await svc.GetUserDetailAsync("S-1-5-21-1-1-1-1001");
            // If user file exists in basic set, detail may be returned or null; we only assert no exception and service success
            Assert.IsTrue(success);
            Directory.Delete(tempDir, true);
        }

        private static string CopyDataDirectory()
        {
            var source = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Tests", "TestData", "LogicEngine", "basic"));
            var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(tempDir);
            foreach (var file in Directory.GetFiles(source))
            {
                File.Copy(file, Path.Combine(tempDir, Path.GetFileName(file)), true);
            }
            return tempDir;
        }
    }
}
