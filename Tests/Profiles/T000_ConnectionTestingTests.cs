using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Moq;
using Moq.Protected;

namespace MandADiscoverySuite.Tests.Profiles
{
    /// <summary>
    /// Connection testing validation tests for T-000 implementation
    /// Tests source/target connection validation with various credential scenarios
    /// </summary>
    [TestClass]
    public class T000_ConnectionTestingTests
    {
        private Mock<HttpMessageHandler> _mockHttpHandler;
        private HttpClient _httpClient;
        private string _testDataPath;
        
        [TestInitialize]
        public void Initialize()
        {
            _testDataPath = Path.Combine(Path.GetTempPath(), "T000_ConnTests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            // Setup mock HTTP handler for connection testing
            _mockHttpHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpHandler.Object);
        }
        
        [TestCleanup]
        public void Cleanup()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
            _httpClient?.Dispose();
        }
        
        #region Source Connection Validation Tests
        
        [TestMethod]
        public async Task Test_SourceConnection_ValidDiscoveryData()
        {
            // Arrange - Create valid discovery data
            CreateValidSourceDiscoveryData();
            var connectionTester = new SourceConnectionTester(_testDataPath);
            
            // Act
            var result = await connectionTester.TestConnectionAsync("test-company");
            
            // Assert
            Assert.IsTrue(result.Success, "Valid discovery data should pass connection test");
            Assert.AreEqual("Connected", result.Message);
            Assert.IsTrue(result.Details.ContainsKey("DataFiles"));
            Assert.IsTrue(result.Details.ContainsKey("LastUpdate"));
        }
        
        [TestMethod]
        public async Task Test_SourceConnection_MissingDiscoveryData()
        {
            // Arrange - No discovery data created
            var connectionTester = new SourceConnectionTester(_testDataPath);
            
            // Act
            var result = await connectionTester.TestConnectionAsync("missing-company");
            
            // Assert
            Assert.IsFalse(result.Success, "Missing discovery data should fail connection test");
            Assert.IsTrue(result.Message.Contains("not found") || result.Message.Contains("No data"));
        }
        
        [TestMethod]
        public async Task Test_SourceConnection_CorruptedData()
        {
            // Arrange - Create corrupted data
            CreateCorruptedSourceData();
            var connectionTester = new SourceConnectionTester(_testDataPath);
            
            // Act
            var result = await connectionTester.TestConnectionAsync("corrupted-company");
            
            // Assert
            Assert.IsFalse(result.Success, "Corrupted data should fail validation");
            Assert.IsTrue(result.Message.Contains("Invalid") || result.Message.Contains("Corrupted"));
        }
        
        [TestMethod]
        public async Task Test_SourceConnection_StaleData()
        {
            // Arrange - Create old discovery data
            CreateStaleSourceData();
            var connectionTester = new SourceConnectionTester(_testDataPath);
            
            // Act
            var result = await connectionTester.TestConnectionAsync("stale-company");
            
            // Assert
            Assert.IsTrue(result.Success, "Stale data should still connect but with warning");
            Assert.IsTrue(result.Details.ContainsKey("Warning"));
            var warning = result.Details["Warning"].ToString();
            Assert.IsTrue(warning.Contains("stale") || warning.Contains("old"));
        }
        
        #endregion
        
        #region Target Connection Validation Tests
        
        [TestMethod]
        public async Task Test_TargetConnection_ValidCredentials()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            SetupMockHttpResponse(HttpStatusCode.OK, "{\"value\":\"success\"}");
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsTrue(result.Success, "Valid credentials should succeed");
            Assert.AreEqual("Connected", result.Message);
            Assert.IsTrue(result.Duration.TotalMilliseconds > 0);
        }
        
        [TestMethod]
        public async Task Test_TargetConnection_InvalidCredentials()
        {
            // Arrange
            var profile = CreateInvalidCredentialsProfile();
            SetupMockHttpResponse(HttpStatusCode.Unauthorized, "{\"error\":\"invalid_client\"}");
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success, "Invalid credentials should fail");
            Assert.IsTrue(result.Message.Contains("Authentication failed") || 
                         result.Message.Contains("Unauthorized"));
        }
        
        [TestMethod]
        public async Task Test_TargetConnection_ExpiredToken()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            SetupMockHttpResponse(HttpStatusCode.Unauthorized, 
                "{\"error\":\"invalid_token\",\"error_description\":\"Token expired\"}");
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success, "Expired token should fail");
            Assert.IsTrue(result.Message.Contains("expired") || 
                         result.Message.Contains("Token"));
        }
        
        [TestMethod]
        public async Task Test_TargetConnection_MissingCredentials()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Test Profile",
                TenantId = "12345678-1234-1234-1234-123456789012"
                // No credentials set
            };
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success, "Missing credentials should fail");
            Assert.IsTrue(result.Message.Contains("No credentials") || 
                         result.Message.Contains("Missing"));
        }
        
        [TestMethod]
        public async Task Test_TargetConnection_NetworkTimeout()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            SetupMockHttpTimeout();
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success, "Network timeout should fail");
            Assert.IsTrue(result.Message.Contains("timeout") || 
                         result.Message.Contains("Timeout"));
            Assert.IsTrue(result.Duration.TotalSeconds >= 5, "Should respect timeout duration");
        }
        
        [TestMethod]
        public async Task Test_TargetConnection_InsufficientPermissions()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            SetupMockHttpResponse(HttpStatusCode.Forbidden, 
                "{\"error\":\"insufficient_scope\",\"error_description\":\"Missing required permissions\"}");
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success, "Insufficient permissions should fail");
            Assert.IsTrue(result.Message.Contains("permissions") || 
                         result.Message.Contains("Forbidden"));
            Assert.IsTrue(result.Details.ContainsKey("RequiredScopes"));
        }
        
        #endregion
        
        #region Graceful Error Handling Tests
        
        [TestMethod]
        public async Task Test_ConnectionTesting_HandlesNullProfile()
        {
            // Arrange
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act & Assert - Should not throw
            var result = await connectionTester.TestConnectionAsync(null);
            
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Invalid profile"));
        }
        
        [TestMethod]
        public async Task Test_ConnectionTesting_HandlesNetworkError()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            SetupMockHttpException(new HttpRequestException("Network error"));
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Act
            var result = await connectionTester.TestConnectionAsync(profile);
            
            // Assert
            Assert.IsFalse(result.Success);
            Assert.IsTrue(result.Message.Contains("Network error") || 
                         result.Message.Contains("Connection failed"));
            Assert.IsNotNull(result.Details["Error"]);
        }
        
        [TestMethod]
        public async Task Test_ConnectionTesting_RecoverFromTransientError()
        {
            // Arrange
            var profile = CreateValidTargetProfile();
            var connectionTester = new TargetConnectionTester(_httpClient);
            
            // Setup mock to fail first, then succeed (simulating retry)
            var callCount = 0;
            _mockHttpHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() =>
                {
                    callCount++;
                    if (callCount == 1)
                    {
                        return new HttpResponseMessage(HttpStatusCode.ServiceUnavailable);
                    }
                    return new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent("{\"value\":\"success\"}")
                    };
                });
            
            // Act - with retry logic
            var result = await connectionTester.TestConnectionWithRetryAsync(profile, maxRetries: 2);
            
            // Assert
            Assert.IsTrue(result.Success, "Should succeed after retry");
            Assert.AreEqual(2, callCount, "Should have retried once");
        }
        
        #endregion
        
        #region Helper Methods
        
        private void CreateValidSourceDiscoveryData()
        {
            var companyPath = Path.Combine(_testDataPath, "test-company");
            var rawPath = Path.Combine(companyPath, "Raw");
            Directory.CreateDirectory(rawPath);
            
            File.WriteAllText(Path.Combine(rawPath, "Users.csv"),
                "Username,Email,Department\nuser1,user1@test.com,IT\nuser2,user2@test.com,HR");
            
            File.WriteAllText(Path.Combine(rawPath, "Computers.csv"),
                "Name,OS,LastSeen\nPC001,Windows 10," + DateTime.Now.ToString("yyyy-MM-dd"));
            
            File.WriteAllText(Path.Combine(companyPath, "Project.json"),
                "{\"ProjectName\":\"Test Company\",\"LastUpdate\":\"" + DateTime.Now.ToString("o") + "\"}");
        }
        
        private void CreateCorruptedSourceData()
        {
            var companyPath = Path.Combine(_testDataPath, "corrupted-company");
            var rawPath = Path.Combine(companyPath, "Raw");
            Directory.CreateDirectory(rawPath);
            
            // Create corrupted CSV
            File.WriteAllText(Path.Combine(rawPath, "Users.csv"),
                "Username,Email,Department\nuser1,user1@test.com\nuser2"); // Malformed CSV
            
            // Create corrupted JSON
            File.WriteAllText(Path.Combine(companyPath, "Project.json"),
                "{\"ProjectName\":\"Corrupted\","); // Invalid JSON
        }
        
        private void CreateStaleSourceData()
        {
            var companyPath = Path.Combine(_testDataPath, "stale-company");
            var rawPath = Path.Combine(companyPath, "Raw");
            Directory.CreateDirectory(rawPath);
            
            var oldDate = DateTime.Now.AddDays(-60);
            
            File.WriteAllText(Path.Combine(rawPath, "Users.csv"),
                "Username,Email\nuser1,user1@stale.com");
            
            File.WriteAllText(Path.Combine(companyPath, "Project.json"),
                "{\"ProjectName\":\"Stale Company\",\"LastUpdate\":\"" + oldDate.ToString("o") + "\"}");
            
            // Set file dates to old
            File.SetLastWriteTime(Path.Combine(rawPath, "Users.csv"), oldDate);
        }
        
        private TargetProfile CreateValidTargetProfile()
        {
            var profile = new TargetProfile
            {
                Name = "Valid Target",
                TenantId = "12345678-1234-1234-1234-123456789012",
                ClientId = "client-123",
                Environment = "Azure"
            };
            profile.SetClientSecret("valid-secret-123");
            return profile;
        }
        
        private TargetProfile CreateInvalidCredentialsProfile()
        {
            var profile = new TargetProfile
            {
                Name = "Invalid Target",
                TenantId = "87654321-4321-4321-4321-210987654321",
                ClientId = "invalid-client",
                Environment = "Azure"
            };
            profile.SetClientSecret("wrong-secret");
            return profile;
        }
        
        private void SetupMockHttpResponse(HttpStatusCode statusCode, string content)
        {
            _mockHttpHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = statusCode,
                    Content = new StringContent(content)
                });
        }
        
        private void SetupMockHttpTimeout()
        {
            _mockHttpHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(new TaskCanceledException("Request timeout"));
        }
        
        private void SetupMockHttpException(Exception exception)
        {
            _mockHttpHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ThrowsAsync(exception);
        }
        
        #endregion
    }
    
    #region Mock Connection Testers
    
    public class SourceConnectionTester
    {
        private readonly string _dataPath;
        
        public SourceConnectionTester(string dataPath)
        {
            _dataPath = dataPath;
        }
        
        public async Task<ConnectionTestResult> TestConnectionAsync(string companyName)
        {
            var result = new ConnectionTestResult { TestedAt = DateTime.UtcNow };
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                var companyPath = Path.Combine(_dataPath, companyName);
                if (!Directory.Exists(companyPath))
                {
                    result.Success = false;
                    result.Message = $"Company data not found: {companyName}";
                    return result;
                }
                
                var rawPath = Path.Combine(companyPath, "Raw");
                if (!Directory.Exists(rawPath))
                {
                    result.Success = false;
                    result.Message = "No discovery data found";
                    return result;
                }
                
                var dataFiles = Directory.GetFiles(rawPath, "*.csv");
                if (dataFiles.Length == 0)
                {
                    result.Success = false;
                    result.Message = "No data files found";
                    return result;
                }
                
                // Check for Project.json
                var projectFile = Path.Combine(companyPath, "Project.json");
                if (File.Exists(projectFile))
                {
                    try
                    {
                        var projectContent = await File.ReadAllTextAsync(projectFile);
                        var projectData = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(projectContent);
                        
                        if (projectData?.LastUpdate != null)
                        {
                            var lastUpdate = DateTime.Parse(projectData.LastUpdate.ToString());
                            var age = DateTime.Now - lastUpdate;
                            
                            result.Details["LastUpdate"] = lastUpdate.ToString("yyyy-MM-dd HH:mm:ss");
                            
                            if (age.TotalDays > 30)
                            {
                                result.Details["Warning"] = $"Data is {age.TotalDays:F0} days old and may be stale";
                            }
                        }
                    }
                    catch
                    {
                        result.Success = false;
                        result.Message = "Corrupted project configuration";
                        return result;
                    }
                }
                
                // Validate CSV files
                foreach (var file in dataFiles.Take(5)) // Check first 5 files
                {
                    try
                    {
                        var lines = await File.ReadAllLinesAsync(file);
                        if (lines.Length == 0)
                        {
                            result.Success = false;
                            result.Message = $"Empty data file: {Path.GetFileName(file)}";
                            return result;
                        }
                        
                        // Check if CSV is properly formatted
                        var headers = lines[0].Split(',');
                        if (lines.Length > 1)
                        {
                            var firstRow = lines[1].Split(',');
                            if (firstRow.Length != headers.Length)
                            {
                                result.Success = false;
                                result.Message = $"Invalid CSV format in {Path.GetFileName(file)}";
                                return result;
                            }
                        }
                    }
                    catch
                    {
                        result.Success = false;
                        result.Message = $"Corrupted data file: {Path.GetFileName(file)}";
                        return result;
                    }
                }
                
                result.Success = true;
                result.Message = "Connected";
                result.Details["DataFiles"] = dataFiles.Length;
                result.Details["CompanyPath"] = companyPath;
            }
            finally
            {
                stopwatch.Stop();
                result.Duration = stopwatch.Elapsed;
            }
            
            return result;
        }
    }
    
    public class TargetConnectionTester
    {
        private readonly HttpClient _httpClient;
        
        public TargetConnectionTester(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        
        public async Task<ConnectionTestResult> TestConnectionAsync(TargetProfile profile)
        {
            var result = new ConnectionTestResult { TestedAt = DateTime.UtcNow };
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                if (profile == null)
                {
                    result.Success = false;
                    result.Message = "Invalid profile";
                    return result;
                }
                
                if (!profile.IsValid())
                {
                    result.Success = false;
                    result.Message = "Profile validation failed";
                    return result;
                }
                
                // Check for credentials
                var hasSecret = !string.IsNullOrEmpty(profile.GetClientSecret());
                var hasCert = !string.IsNullOrEmpty(profile.CertificateThumbprint);
                
                if (!hasSecret && !hasCert)
                {
                    result.Success = false;
                    result.Message = "No credentials configured";
                    return result;
                }
                
                // Simulate Graph API call
                var request = new HttpRequestMessage(HttpMethod.Get, 
                    $"https://graph.microsoft.com/v1.0/organization");
                
                // Add auth header (simplified)
                if (hasSecret)
                {
                    request.Headers.Add("Authorization", $"Bearer {profile.GetClientSecret()}");
                }
                
                var response = await _httpClient.SendAsync(request);
                
                if (response.IsSuccessStatusCode)
                {
                    result.Success = true;
                    result.Message = "Connected";
                    result.Details["StatusCode"] = response.StatusCode.ToString();
                }
                else if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    result.Success = false;
                    result.Message = "Authentication failed";
                    
                    var content = await response.Content.ReadAsStringAsync();
                    if (content.Contains("expired"))
                    {
                        result.Message = "Token expired";
                    }
                }
                else if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    result.Success = false;
                    result.Message = "Insufficient permissions";
                    result.Details["RequiredScopes"] = profile.Scopes;
                }
                else
                {
                    result.Success = false;
                    result.Message = $"Connection failed: {response.StatusCode}";
                }
            }
            catch (TaskCanceledException)
            {
                result.Success = false;
                result.Message = "Connection timeout";
            }
            catch (HttpRequestException ex)
            {
                result.Success = false;
                result.Message = "Connection failed";
                result.Details["Error"] = ex.Message;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = "Unexpected error";
                result.Details["Error"] = ex.Message;
            }
            finally
            {
                stopwatch.Stop();
                result.Duration = stopwatch.Elapsed;
            }
            
            return result;
        }
        
        public async Task<ConnectionTestResult> TestConnectionWithRetryAsync(
            TargetProfile profile, int maxRetries = 3)
        {
            ConnectionTestResult lastResult = null;
            
            for (int i = 0; i <= maxRetries; i++)
            {
                lastResult = await TestConnectionAsync(profile);
                
                if (lastResult.Success)
                    return lastResult;
                
                // Don't retry on auth errors
                if (lastResult.Message.Contains("Authentication") || 
                    lastResult.Message.Contains("permissions"))
                    return lastResult;
                
                // Wait before retry
                if (i < maxRetries)
                    await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, i))); // Exponential backoff
            }
            
            return lastResult;
        }
    }
    
    #endregion
}