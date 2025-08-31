using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Moq;
using Newtonsoft.Json;

namespace MandADiscoverySuite.Tests.Profiles
{
    /// <summary>
    /// Comprehensive test suite for T-000: Source and Target Company Profiles & Environment Detection
    /// Tests profile enumeration, selection persistence, and validation
    /// </summary>
    [TestClass]
    public class T000_ProfileManagementTests
    {
        private ConfigurationService _configService;
        private ProfileService _profileService;
        private string _testDataPath;
        private string _testProfilesPath;
        
        [TestInitialize]
        public void Initialize()
        {
            // Setup test environment
            _testDataPath = Path.Combine(Path.GetTempPath(), "T000_Tests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            // Set environment variable for test discovery data
            Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", _testDataPath);
            
            _configService = ConfigurationService.Instance;
            _profileService = ProfileService.Instance;
            
            // Create test discovery data structure
            CreateTestDiscoveryData();
        }
        
        [TestCleanup]
        public void Cleanup()
        {
            // Clean up test data
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
            
            Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", null);
        }
        
        #region Profile Enumeration Tests
        
        [TestMethod]
        public async Task Test_ProfileEnumeration_FromDiscoveryDirectory()
        {
            // Arrange - test data created in Initialize
            
            // Act
            var profiles = await _profileService.GetAvailableProfilesAsync();
            
            // Assert
            Assert.IsNotNull(profiles);
            var profileList = profiles.ToList();
            Assert.IsTrue(profileList.Contains("ljpops"), "Should find ljpops profile");
            Assert.IsTrue(profileList.Contains("contoso"), "Should find contoso profile");
            Assert.IsTrue(profileList.Contains("fabrikam"), "Should find fabrikam profile");
        }
        
        [TestMethod]
        public async Task Test_ProfileEnumeration_HandlesEmptyDirectory()
        {
            // Arrange - create empty discovery directory
            var emptyPath = Path.Combine(_testDataPath, "empty");
            Directory.CreateDirectory(emptyPath);
            Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", emptyPath);
            
            // Act
            var profiles = await _profileService.GetAvailableProfilesAsync();
            
            // Assert
            Assert.IsNotNull(profiles);
            Assert.IsTrue(profiles.Any(), "Should return at least default profiles");
        }
        
        [TestMethod]
        public async Task Test_ProfileEnumeration_HandlesCorruptedProfiles()
        {
            // Arrange - create corrupted profile
            var corruptPath = Path.Combine(_testDataPath, "corrupt");
            Directory.CreateDirectory(corruptPath);
            File.WriteAllText(Path.Combine(corruptPath, "Project.json"), "{ invalid json }");
            
            // Act & Assert - should not throw, should handle gracefully
            var profiles = await _profileService.GetAvailableProfilesAsync();
            Assert.IsNotNull(profiles);
        }
        
        #endregion
        
        #region Profile Selection and Persistence Tests
        
        [TestMethod]
        public async Task Test_ProfileSelection_PersistsAcrossSessions()
        {
            // Arrange
            var sourceProfileId = "source-test-" + Guid.NewGuid();
            var targetProfileId = "target-test-" + Guid.NewGuid();
            
            // Act - Set profiles
            _configService.SelectedSourceProfileId = sourceProfileId;
            _configService.SelectedTargetProfileId = targetProfileId;
            
            // Save session
            await _configService.SaveSessionAsync();
            
            // Simulate new session by reloading
            _configService.LoadSession();
            
            // Assert - Values should persist
            Assert.AreEqual(sourceProfileId, _configService.SelectedSourceProfileId);
            Assert.AreEqual(targetProfileId, _configService.SelectedTargetProfileId);
        }
        
        [TestMethod]
        public async Task Test_ProfileSelection_ValidatesProfileExists()
        {
            // Arrange
            var profile = new CompanyProfile
            {
                Id = Guid.NewGuid().ToString(),
                CompanyName = "TestCompany",
                IsActive = true
            };
            
            // Act
            var createdProfile = await _profileService.CreateProfileAsync(profile);
            var retrievedProfile = await _profileService.GetProfileAsync(createdProfile.Id);
            
            // Assert
            Assert.IsNotNull(retrievedProfile);
            Assert.AreEqual(profile.CompanyName, retrievedProfile.CompanyName);
        }
        
        [TestMethod]
        public void Test_ProfileSelection_HandlesNullProfileGracefully()
        {
            // Act
            _configService.SelectedSourceProfileId = null;
            _configService.SelectedTargetProfileId = null;
            
            // Assert - Should default to empty string
            Assert.AreEqual(string.Empty, _configService.SelectedSourceProfileId);
            Assert.AreEqual(string.Empty, _configService.SelectedTargetProfileId);
        }
        
        #endregion
        
        #region Profile Validation Tests
        
        [TestMethod]
        public void Test_ProfileValidation_ValidProfile()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Valid Profile",
                TenantId = "12345678-1234-1234-1234-123456789012",
                ClientId = "client-id",
                Environment = "Azure"
            };
            profile.SetClientSecret("test-secret");
            
            // Act
            var isValid = profile.IsValid();
            
            // Assert
            Assert.IsTrue(isValid, "Profile with required fields should be valid");
        }
        
        [TestMethod]
        public void Test_ProfileValidation_InvalidProfile_MissingName()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "", // Missing name
                TenantId = "12345678-1234-1234-1234-123456789012"
            };
            
            // Act
            var isValid = profile.IsValid();
            
            // Assert
            Assert.IsFalse(isValid, "Profile without name should be invalid");
        }
        
        [TestMethod]
        public void Test_ProfileValidation_InvalidProfile_MissingTenant()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Test Profile",
                TenantId = "" // Missing tenant
            };
            
            // Act
            var isValid = profile.IsValid();
            
            // Assert
            Assert.IsFalse(isValid, "Profile without tenant ID should be invalid");
        }
        
        [TestMethod]
        public void Test_ProfileValidation_ValidWithCertificate()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Cert Profile",
                TenantId = "12345678-1234-1234-1234-123456789012",
                CertificateThumbprint = "ABCDEF1234567890" // Using certificate instead of secret
            };
            
            // Act
            var isValid = profile.IsValid();
            
            // Assert
            Assert.IsTrue(isValid, "Profile with certificate should be valid");
        }
        
        #endregion
        
        #region Helper Methods
        
        private void CreateTestDiscoveryData()
        {
            // Create ljpops profile
            var ljpopsPath = Path.Combine(_testDataPath, "ljpops");
            Directory.CreateDirectory(ljpopsPath);
            Directory.CreateDirectory(Path.Combine(ljpopsPath, "Raw"));
            Directory.CreateDirectory(Path.Combine(ljpopsPath, "Exports"));
            File.WriteAllText(Path.Combine(ljpopsPath, "Project.json"), 
                JsonConvert.SerializeObject(new { ProjectName = "M&A - ljpops", Environment = "Hybrid" }));
            
            // Create contoso profile
            var contosoPath = Path.Combine(_testDataPath, "contoso");
            Directory.CreateDirectory(contosoPath);
            Directory.CreateDirectory(Path.Combine(contosoPath, "Raw"));
            File.WriteAllText(Path.Combine(contosoPath, "Project.json"),
                JsonConvert.SerializeObject(new { ProjectName = "Contoso Corp", Environment = "Azure" }));
            
            // Create fabrikam profile
            var fabrikamPath = Path.Combine(_testDataPath, "fabrikam");
            Directory.CreateDirectory(fabrikamPath);
            Directory.CreateDirectory(Path.Combine(fabrikamPath, "Raw"));
            File.WriteAllText(Path.Combine(fabrikamPath, "Project.json"),
                JsonConvert.SerializeObject(new { ProjectName = "Fabrikam Inc", Environment = "OnPremises" }));
        }
        
        #endregion
    }
}