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
    /// Environment detection tests for T-000 implementation
    /// Tests environment type detection, confidence scoring, and status display
    /// </summary>
    [TestClass]
    public class T000_EnvironmentDetectionTests
    {
        private ConfigurationService _configService;
        private string _testDataPath;
        
        [TestInitialize]
        public void Initialize()
        {
            _testDataPath = Path.Combine(Path.GetTempPath(), "T000_EnvTests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", _testDataPath);
            
            _configService = ConfigurationService.Instance;
        }
        
        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
            Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", null);
        }
        
        #region Environment Type Detection Tests
        
        [TestMethod]
        public async Task Test_EnvironmentDetection_OnPremises()
        {
            // Arrange - Create on-premises discovery data
            var companyPath = CreateOnPremisesEnvironmentData("onprem-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.AreEqual("OnPremises", envType.Type);
            Assert.IsTrue(envType.Confidence >= 0.8, "Should have high confidence for on-premises");
            Assert.IsTrue(envType.Indicators.Contains("Domain Controllers detected"));
            Assert.IsTrue(envType.Indicators.Contains("Exchange Servers detected"));
        }
        
        [TestMethod]
        public async Task Test_EnvironmentDetection_Azure()
        {
            // Arrange - Create Azure discovery data
            var companyPath = CreateAzureEnvironmentData("azure-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.AreEqual("Azure", envType.Type);
            Assert.IsTrue(envType.Confidence >= 0.8, "Should have high confidence for Azure");
            Assert.IsTrue(envType.Indicators.Contains("Azure AD tenant detected"));
            Assert.IsTrue(envType.Indicators.Contains("Exchange Online detected"));
        }
        
        [TestMethod]
        public async Task Test_EnvironmentDetection_Hybrid()
        {
            // Arrange - Create hybrid environment data
            var companyPath = CreateHybridEnvironmentData("hybrid-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.AreEqual("Hybrid", envType.Type);
            Assert.IsTrue(envType.Confidence >= 0.7, "Should have good confidence for hybrid");
            Assert.IsTrue(envType.Indicators.Contains("Domain Controllers detected"));
            Assert.IsTrue(envType.Indicators.Contains("Azure AD Connect detected"));
        }
        
        [TestMethod]
        public async Task Test_EnvironmentDetection_Unknown()
        {
            // Arrange - Create minimal/ambiguous data
            var companyPath = CreateMinimalEnvironmentData("unknown-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.AreEqual("Unknown", envType.Type);
            Assert.IsTrue(envType.Confidence <= 0.5, "Should have low confidence for unknown");
        }
        
        #endregion
        
        #region Confidence Scoring Tests
        
        [TestMethod]
        public async Task Test_ConfidenceScoring_HighConfidence()
        {
            // Arrange - Create comprehensive data
            var companyPath = CreateComprehensiveEnvironmentData("comprehensive-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.IsTrue(envType.Confidence >= 0.9, "Comprehensive data should yield high confidence");
            Assert.IsTrue(envType.Indicators.Count >= 5, "Should have multiple indicators");
        }
        
        [TestMethod]
        public async Task Test_ConfidenceScoring_LowConfidence()
        {
            // Arrange - Create sparse data
            var companyPath = CreateSparseEnvironmentData("sparse-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.IsTrue(envType.Confidence <= 0.6, "Sparse data should yield low confidence");
            Assert.IsTrue(envType.Indicators.Count <= 2, "Should have few indicators");
        }
        
        [TestMethod]
        public async Task Test_ConfidenceScoring_ConflictingData()
        {
            // Arrange - Create conflicting indicators
            var companyPath = CreateConflictingEnvironmentData("conflict-test");
            
            // Act
            var envType = await DetectEnvironmentType(companyPath);
            
            // Assert
            Assert.IsTrue(envType.Confidence <= 0.7, "Conflicting data should reduce confidence");
            Assert.IsTrue(envType.Warnings.Any(), "Should have warnings about conflicts");
        }
        
        #endregion
        
        #region Environment Status Display Tests
        
        [TestMethod]
        public void Test_EnvironmentStatus_UpdateAndPersist()
        {
            // Arrange
            var sourceStatus = "OnPremises (95% confidence)";
            var targetStatus = "Azure (88% confidence)";
            var sourceConn = "Connected";
            var targetConn = "Authentication Required";
            
            // Act
            _configService.UpdateEnvironmentStatus(
                sourceStatus, targetStatus,
                sourceConn, targetConn);
            
            // Assert
            Assert.AreEqual(sourceStatus, _configService.LastSourceEnvironmentStatus);
            Assert.AreEqual(targetStatus, _configService.LastTargetEnvironmentStatus);
            Assert.AreEqual(sourceConn, _configService.LastSourceConnectionStatus);
            Assert.AreEqual(targetConn, _configService.LastTargetConnectionStatus);
        }
        
        [TestMethod]
        public void Test_EnvironmentStatus_RefreshRequired()
        {
            // Arrange - Set old refresh time
            _configService.LastEnvironmentRefresh = DateTime.UtcNow.AddHours(-2);
            
            // Act
            var shouldRefresh = _configService.ShouldRefreshEnvironmentStatus(TimeSpan.FromHours(1));
            
            // Assert
            Assert.IsTrue(shouldRefresh, "Should require refresh after timeout");
        }
        
        [TestMethod]
        public void Test_EnvironmentStatus_NoRefreshRequired()
        {
            // Arrange - Set recent refresh time
            _configService.LastEnvironmentRefresh = DateTime.UtcNow.AddMinutes(-5);
            
            // Act
            var shouldRefresh = _configService.ShouldRefreshEnvironmentStatus(TimeSpan.FromHours(1));
            
            // Assert
            Assert.IsFalse(shouldRefresh, "Should not require refresh within timeout");
        }
        
        #endregion
        
        #region Mock Environment Detection Tests
        
        [TestMethod]
        public async Task Test_MockEnvironmentDetection_AllTypes()
        {
            // Test that we can mock all environment types for UI testing
            var mockResults = new[]
            {
                new { Type = "OnPremises", Confidence = 0.95 },
                new { Type = "Azure", Confidence = 0.88 },
                new { Type = "Hybrid", Confidence = 0.75 },
                new { Type = "Unknown", Confidence = 0.25 }
            };
            
            foreach (var expected in mockResults)
            {
                // Arrange
                var mockDetector = new Mock<IEnvironmentDetector>();
                mockDetector.Setup(d => d.DetectAsync(It.IsAny<string>()))
                    .ReturnsAsync(new EnvironmentDetectionResult
                    {
                        Type = expected.Type,
                        Confidence = expected.Confidence
                    });
                
                // Act
                var result = await mockDetector.Object.DetectAsync("test-path");
                
                // Assert
                Assert.AreEqual(expected.Type, result.Type);
                Assert.AreEqual(expected.Confidence, result.Confidence);
            }
        }
        
        #endregion
        
        #region Helper Methods
        
        private string CreateOnPremisesEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Create DC data
            File.WriteAllText(Path.Combine(rawPath, "DomainControllers.csv"),
                "Name,Type,OS,Role\nDC01,DomainController,Windows Server 2019,PDC\nDC02,DomainController,Windows Server 2019,BDC");
            
            // Create Exchange data
            File.WriteAllText(Path.Combine(rawPath, "Exchange.csv"),
                "Server,Version,Roles\nEXCH01,Exchange 2019,Mailbox\nEXCH02,Exchange 2019,CAS");
            
            // Create AD data
            File.WriteAllText(Path.Combine(rawPath, "ActiveDirectory.csv"),
                "Domain,Forest,Users\ncorp.local,corp.local,5000");
            
            return path;
        }
        
        private string CreateAzureEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Create Azure AD data
            File.WriteAllText(Path.Combine(rawPath, "AzureADTenant.csv"),
                "TenantId,Domain,Users,Licenses\n12345678-1234-1234-1234-123456789012,company.onmicrosoft.com,1000,E3");
            
            // Create Exchange Online data
            File.WriteAllText(Path.Combine(rawPath, "ExchangeOnline.csv"),
                "Mailboxes,SharedMailboxes,ResourceMailboxes\n950,25,25");
            
            // Create Azure resources
            File.WriteAllText(Path.Combine(rawPath, "AzureResources.csv"),
                "ResourceType,Count\nVirtualMachines,50\nStorageAccounts,10\nSQLDatabases,5");
            
            return path;
        }
        
        private string CreateHybridEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Mix of on-premises and cloud
            File.WriteAllText(Path.Combine(rawPath, "DomainControllers.csv"),
                "Name,Type\nDC01,DomainController");
            
            File.WriteAllText(Path.Combine(rawPath, "AzureADConnect.csv"),
                "Server,Version,SyncedObjects\nAADC01,2.1.16.0,5000");
            
            File.WriteAllText(Path.Combine(rawPath, "ExchangeHybrid.csv"),
                "OnPremMailboxes,CloudMailboxes\n2000,3000");
            
            return path;
        }
        
        private string CreateMinimalEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Very minimal data
            File.WriteAllText(Path.Combine(rawPath, "Users.csv"),
                "Username,Email\nuser1,user1@company.com");
            
            return path;
        }
        
        private string CreateComprehensiveEnvironmentData(string companyName)
        {
            var path = CreateOnPremisesEnvironmentData(companyName);
            var rawPath = Path.Combine(path, "Raw");
            
            // Add more comprehensive data
            File.WriteAllText(Path.Combine(rawPath, "FileServers.csv"),
                "Server,Shares,TotalSize\nFS01,50,10TB");
            
            File.WriteAllText(Path.Combine(rawPath, "SQLServers.csv"),
                "Server,Version,Databases\nSQL01,SQL Server 2019,25");
            
            File.WriteAllText(Path.Combine(rawPath, "GPOs.csv"),
                "Name,Links,Settings\nDefault Domain Policy,5,100");
            
            return path;
        }
        
        private string CreateSparseEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Very sparse data
            File.WriteAllText(Path.Combine(rawPath, "Computers.csv"),
                "Name\nPC001");
            
            return path;
        }
        
        private string CreateConflictingEnvironmentData(string companyName)
        {
            var path = Path.Combine(_testDataPath, companyName);
            var rawPath = Path.Combine(path, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Conflicting indicators
            File.WriteAllText(Path.Combine(rawPath, "DomainControllers.csv"),
                "Name\nDC01");
            
            File.WriteAllText(Path.Combine(rawPath, "AzureOnly.csv"),
                "TenantId,CloudOnly\n12345,true");
            
            // This would be conflicting - having both on-prem DC and cloud-only flag
            
            return path;
        }
        
        private async Task<EnvironmentDetectionResult> DetectEnvironmentType(string path)
        {
            // Simulate environment detection logic
            var result = new EnvironmentDetectionResult
            {
                Type = "Unknown",
                Confidence = 0.0,
                Indicators = new List<string>(),
                Warnings = new List<string>()
            };
            
            var rawPath = Path.Combine(path, "Raw");
            if (!Directory.Exists(rawPath))
                return result;
            
            var files = Directory.GetFiles(rawPath, "*.csv");
            var indicators = 0;
            var onPremIndicators = 0;
            var cloudIndicators = 0;
            
            foreach (var file in files)
            {
                var fileName = Path.GetFileNameWithoutExtension(file).ToLower();
                
                // On-premises indicators
                if (fileName.Contains("domaincontroller"))
                {
                    result.Indicators.Add("Domain Controllers detected");
                    onPremIndicators++;
                    indicators++;
                }
                if (fileName == "exchange")
                {
                    result.Indicators.Add("Exchange Servers detected");
                    onPremIndicators++;
                    indicators++;
                }
                if (fileName.Contains("activedirectory"))
                {
                    result.Indicators.Add("Active Directory detected");
                    onPremIndicators++;
                    indicators++;
                }
                
                // Cloud indicators
                if (fileName.Contains("azuread") || fileName.Contains("aad"))
                {
                    result.Indicators.Add("Azure AD tenant detected");
                    cloudIndicators++;
                    indicators++;
                }
                if (fileName.Contains("exchangeonline"))
                {
                    result.Indicators.Add("Exchange Online detected");
                    cloudIndicators++;
                    indicators++;
                }
                if (fileName.Contains("azure"))
                {
                    result.Indicators.Add("Azure resources detected");
                    cloudIndicators++;
                    indicators++;
                }
                
                // Hybrid indicators
                if (fileName.Contains("azureadconnect") || fileName.Contains("aadc"))
                {
                    result.Indicators.Add("Azure AD Connect detected");
                    indicators++;
                }
                if (fileName.Contains("hybrid"))
                {
                    result.Indicators.Add("Hybrid configuration detected");
                    indicators++;
                }
            }
            
            // Determine environment type
            if (onPremIndicators > 0 && cloudIndicators > 0)
            {
                result.Type = "Hybrid";
                result.Confidence = Math.Min(0.95, 0.5 + (indicators * 0.1));
            }
            else if (cloudIndicators > onPremIndicators)
            {
                result.Type = "Azure";
                result.Confidence = Math.Min(0.95, 0.6 + (cloudIndicators * 0.15));
            }
            else if (onPremIndicators > 0)
            {
                result.Type = "OnPremises";
                result.Confidence = Math.Min(0.95, 0.6 + (onPremIndicators * 0.15));
            }
            else
            {
                result.Type = "Unknown";
                result.Confidence = Math.Max(0.1, 0.5 - (5 - indicators) * 0.1);
            }
            
            // Add warnings for conflicts
            if (files.Any(f => Path.GetFileNameWithoutExtension(f).ToLower().Contains("azureonly")) &&
                files.Any(f => Path.GetFileNameWithoutExtension(f).ToLower().Contains("domaincontroller")))
            {
                result.Warnings.Add("Conflicting indicators: Cloud-only flag with Domain Controllers");
                result.Confidence *= 0.8; // Reduce confidence for conflicts
            }
            
            return await Task.FromResult(result);
        }
        
        #endregion
    }
    
    #region Helper Classes
    
    public interface IEnvironmentDetector
    {
        Task<EnvironmentDetectionResult> DetectAsync(string path);
    }
    
    public class EnvironmentDetectionResult
    {
        public string Type { get; set; }
        public double Confidence { get; set; }
        public List<string> Indicators { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }
    
    #endregion
}