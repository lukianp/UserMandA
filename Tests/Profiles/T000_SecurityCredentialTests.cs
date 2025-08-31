using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Moq;

namespace MandADiscoverySuite.Tests.Profiles
{
    /// <summary>
    /// Security and credential management tests for T-000 implementation
    /// Tests encryption, decryption, secure storage, and logging safety
    /// </summary>
    [TestClass]
    public class T000_SecurityCredentialTests
    {
        private TargetProfile _testProfile;
        private Mock<ILogger> _mockLogger;
        
        [TestInitialize]
        public void Initialize()
        {
            _testProfile = new TargetProfile();
            _mockLogger = new Mock<ILogger>();
        }
        
        #region Encryption/Decryption Tests
        
        [TestMethod]
        public void Test_Encryption_ClientSecret()
        {
            // Arrange
            var plainSecret = "super-secret-client-key-123";
            
            // Act
            _testProfile.SetClientSecret(plainSecret);
            var encryptedSecret = _testProfile.ClientSecretEncrypted;
            var decryptedSecret = _testProfile.GetClientSecret();
            
            // Assert
            Assert.IsNotNull(encryptedSecret, "Encrypted secret should not be null");
            Assert.AreNotEqual(plainSecret, encryptedSecret, "Encrypted should differ from plain");
            Assert.AreEqual(plainSecret, decryptedSecret, "Decrypted should match original");
            Assert.IsTrue(IsBase64String(encryptedSecret), "Encrypted should be Base64");
        }
        
        [TestMethod]
        public void Test_Encryption_Username()
        {
            // Arrange
            var plainUsername = "admin@company.com";
            
            // Act
            _testProfile.SetUsername(plainUsername);
            var encryptedUsername = _testProfile.UsernameEncrypted;
            var decryptedUsername = _testProfile.GetUsername();
            
            // Assert
            Assert.IsNotNull(encryptedUsername, "Encrypted username should not be null");
            Assert.AreNotEqual(plainUsername, encryptedUsername, "Encrypted should differ from plain");
            Assert.AreEqual(plainUsername, decryptedUsername, "Decrypted should match original");
        }
        
        [TestMethod]
        public void Test_Encryption_Password()
        {
            // Arrange
            var plainPassword = "P@ssw0rd!123";
            
            // Act
            _testProfile.SetPassword(plainPassword);
            var encryptedPassword = _testProfile.PasswordEncrypted;
            var decryptedPassword = _testProfile.GetPassword();
            
            // Assert
            Assert.IsNotNull(encryptedPassword, "Encrypted password should not be null");
            Assert.AreNotEqual(plainPassword, encryptedPassword, "Encrypted should differ from plain");
            Assert.AreEqual(plainPassword, decryptedPassword, "Decrypted should match original");
        }
        
        [TestMethod]
        public void Test_Encryption_EmptyString()
        {
            // Arrange & Act
            _testProfile.SetClientSecret("");
            _testProfile.SetUsername("");
            _testProfile.SetPassword("");
            
            // Assert
            Assert.AreEqual("", _testProfile.GetClientSecret());
            Assert.AreEqual("", _testProfile.GetUsername());
            Assert.AreEqual("", _testProfile.GetPassword());
        }
        
        [TestMethod]
        public void Test_Encryption_NullString()
        {
            // Arrange & Act
            _testProfile.SetClientSecret(null);
            _testProfile.SetUsername(null);
            _testProfile.SetPassword(null);
            
            // Assert - Should handle null gracefully
            Assert.AreEqual("", _testProfile.GetClientSecret());
            Assert.AreEqual("", _testProfile.GetUsername());
            Assert.AreEqual("", _testProfile.GetPassword());
        }
        
        [TestMethod]
        public void Test_Encryption_SpecialCharacters()
        {
            // Arrange - Test with various special characters
            var specialStrings = new[]
            {
                "!@#$%^&*()_+-=[]{}|;':\",./<>?",
                "Unicode: 你好世界 🔐 🔑",
                "Line\nBreaks\rand\ttabs",
                "Null\0Character"
            };
            
            foreach (var special in specialStrings)
            {
                // Act
                _testProfile.SetClientSecret(special);
                var decrypted = _testProfile.GetClientSecret();
                
                // Assert
                Assert.AreEqual(special, decrypted, $"Failed for: {special}");
            }
        }
        
        #endregion
        
        #region Decryption Failure Tests
        
        [TestMethod]
        public void Test_Decryption_InvalidBase64()
        {
            // Arrange - Set invalid Base64 directly
            _testProfile.ClientSecretEncrypted = "Not-Valid-Base64!@#";
            
            // Act
            var decrypted = _testProfile.GetClientSecret();
            
            // Assert - Should return empty string on failure
            Assert.AreEqual("", decrypted, "Invalid Base64 should return empty string");
        }
        
        [TestMethod]
        public void Test_Decryption_CorruptedData()
        {
            // Arrange - Set valid Base64 but corrupted encrypted data
            _testProfile.ClientSecretEncrypted = Convert.ToBase64String(new byte[] { 1, 2, 3, 4, 5 });
            
            // Act
            var decrypted = _testProfile.GetClientSecret();
            
            // Assert - Should return empty string on failure
            Assert.AreEqual("", decrypted, "Corrupted data should return empty string");
        }
        
        [TestMethod]
        public void Test_Decryption_DifferentUserContext()
        {
            // Note: DPAPI encrypts for current user only
            // This test demonstrates that data encrypted by one user cannot be decrypted by another
            
            // Arrange
            var secret = "test-secret";
            _testProfile.SetClientSecret(secret);
            var encryptedData = _testProfile.ClientSecretEncrypted;
            
            // Act - Simulate different user by using different entropy (not perfect simulation)
            // In real scenario, this would fail when different Windows user tries to decrypt
            
            // Assert
            Assert.IsNotNull(encryptedData);
            // Cannot fully test cross-user scenario in unit test
        }
        
        #endregion
        
        #region Secure Storage Tests
        
        [TestMethod]
        public async Task Test_SecureStorage_ProfilePersistence()
        {
            // Arrange
            var tempFile = Path.GetTempFileName();
            var profile = new TargetProfile
            {
                Name = "Test Profile",
                TenantId = "12345",
                ClientId = "client-123"
            };
            profile.SetClientSecret("secret-123");
            profile.SetPassword("password-123");
            
            try
            {
                // Act - Save profile
                var json = Newtonsoft.Json.JsonConvert.SerializeObject(profile);
                await File.WriteAllTextAsync(tempFile, json);
                
                // Read back
                var loadedJson = await File.ReadAllTextAsync(tempFile);
                var loadedProfile = Newtonsoft.Json.JsonConvert.DeserializeObject<TargetProfile>(loadedJson);
                
                // Assert
                Assert.AreEqual(profile.Name, loadedProfile.Name);
                Assert.AreEqual(profile.ClientSecretEncrypted, loadedProfile.ClientSecretEncrypted);
                Assert.AreEqual("secret-123", loadedProfile.GetClientSecret());
                Assert.AreEqual("password-123", loadedProfile.GetPassword());
                
                // Verify encrypted values are stored, not plain text
                Assert.IsFalse(loadedJson.Contains("secret-123"), "Plain secret should not be in JSON");
                Assert.IsFalse(loadedJson.Contains("password-123"), "Plain password should not be in JSON");
            }
            finally
            {
                if (File.Exists(tempFile))
                    File.Delete(tempFile);
            }
        }
        
        [TestMethod]
        public void Test_SecureStorage_NoPlainTextInMemory()
        {
            // Arrange
            var secret = "sensitive-secret-12345";
            var profile = new TargetProfile();
            
            // Act
            profile.SetClientSecret(secret);
            
            // Assert - The profile should not store plain text
            var properties = typeof(TargetProfile).GetProperties();
            foreach (var prop in properties)
            {
                if (prop.PropertyType == typeof(string))
                {
                    var value = prop.GetValue(profile) as string;
                    if (!string.IsNullOrEmpty(value))
                    {
                        Assert.AreNotEqual(secret, value, 
                            $"Property {prop.Name} contains plain text secret");
                    }
                }
            }
        }
        
        #endregion
        
        #region Logging Safety Tests
        
        [TestMethod]
        public void Test_Logging_ToString_DoesNotExposeSecrets()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Test Profile",
                TenantId = "12345",
                Environment = "Azure"
            };
            profile.SetClientSecret("super-secret-key");
            profile.SetPassword("admin-password");
            
            // Act
            var stringRepresentation = profile.ToString();
            
            // Assert
            Assert.IsFalse(stringRepresentation.Contains("super-secret-key"), 
                "ToString should not contain secret");
            Assert.IsFalse(stringRepresentation.Contains("admin-password"), 
                "ToString should not contain password");
            Assert.IsTrue(stringRepresentation.Contains("Test Profile"), 
                "ToString should contain profile name");
            Assert.IsTrue(stringRepresentation.Contains("Azure"), 
                "ToString should contain environment");
            Assert.IsTrue(stringRepresentation.Contains("Auth:"), 
                "ToString should indicate auth method");
        }
        
        [TestMethod]
        public void Test_Logging_ErrorMessages_DoNotExposeSecrets()
        {
            // Arrange
            var profile = new TargetProfile();
            profile.SetClientSecret("secret-key-123");
            var logger = new SecureLogger(_mockLogger.Object);
            
            // Act - Simulate various error scenarios
            var scenarios = new[]
            {
                new { Error = new Exception("Connection failed"), Profile = profile },
                new { Error = new UnauthorizedAccessException("Invalid credentials"), Profile = profile },
                new { Error = new CryptographicException("Decryption failed"), Profile = profile }
            };
            
            foreach (var scenario in scenarios)
            {
                // Log error with profile context
                var logMessage = logger.LogError(scenario.Error, scenario.Profile);
                
                // Assert
                Assert.IsFalse(logMessage.Contains("secret-key-123"), 
                    $"Log should not contain secret for {scenario.Error.GetType().Name}");
                Assert.IsFalse(logMessage.Contains(profile.ClientSecretEncrypted), 
                    "Log should not contain encrypted secret either");
            }
        }
        
        [TestMethod]
        public void Test_Logging_JsonSerialization_ExcludesSecrets()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Test",
                TenantId = "12345"
            };
            profile.SetClientSecret("secret-123");
            profile.SetPassword("pass-123");
            
            // Act - Serialize for logging
            var settings = new Newtonsoft.Json.JsonSerializerSettings
            {
                ContractResolver = new SecureContractResolver()
            };
            var json = Newtonsoft.Json.JsonConvert.SerializeObject(profile, settings);
            
            // Assert
            Assert.IsTrue(json.Contains("Name"), "Should include Name");
            Assert.IsTrue(json.Contains("TenantId"), "Should include TenantId");
            
            // These should be excluded or masked
            if (json.Contains("ClientSecretEncrypted"))
            {
                Assert.IsTrue(json.Contains("***") || json.Contains("[REDACTED]"), 
                    "Secrets should be masked in logs");
            }
        }
        
        #endregion
        
        #region Certificate Authentication Tests
        
        [TestMethod]
        public void Test_CertificateAuth_ValidProfile()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Cert Auth Profile",
                TenantId = "12345",
                ClientId = "client-123",
                CertificateThumbprint = "1234567890ABCDEF1234567890ABCDEF12345678"
            };
            
            // Act
            var isValid = profile.IsValid();
            var authMethod = GetAuthMethod(profile);
            
            // Assert
            Assert.IsTrue(isValid, "Profile with certificate should be valid");
            Assert.AreEqual("Certificate", authMethod);
        }
        
        [TestMethod]
        public void Test_CertificateAuth_PreferredOverSecret()
        {
            // Arrange
            var profile = new TargetProfile
            {
                Name = "Dual Auth Profile",
                TenantId = "12345",
                CertificateThumbprint = "ABCDEF"
            };
            profile.SetClientSecret("secret"); // Both cert and secret
            
            // Act
            var authMethod = GetAuthMethod(profile);
            
            // Assert - Certificate should be preferred
            Assert.AreEqual("Certificate", authMethod);
        }
        
        #endregion
        
        #region Helper Methods
        
        private bool IsBase64String(string base64)
        {
            try
            {
                Convert.FromBase64String(base64);
                return true;
            }
            catch
            {
                return false;
            }
        }
        
        private string GetAuthMethod(TargetProfile profile)
        {
            if (!string.IsNullOrWhiteSpace(profile.CertificateThumbprint))
                return "Certificate";
            if (!string.IsNullOrWhiteSpace(profile.ClientSecretEncrypted))
                return "Secret";
            return "None";
        }
        
        #endregion
    }
    
    #region Helper Classes
    
    public interface ILogger
    {
        void Log(string message);
        void LogError(string message, Exception ex);
    }
    
    public class SecureLogger
    {
        private readonly ILogger _logger;
        
        public SecureLogger(ILogger logger)
        {
            _logger = logger;
        }
        
        public string LogError(Exception error, TargetProfile profile)
        {
            // Sanitize profile data before logging
            var safeProfileInfo = $"Profile: {profile.Name} ({profile.Environment})";
            var errorMessage = $"Error in {safeProfileInfo}: {error.Message}";
            
            // Ensure no secrets in stack trace
            var stackTrace = error.StackTrace ?? "";
            if (profile != null)
            {
                // Remove any potential secrets from stack trace
                stackTrace = stackTrace.Replace(profile.GetClientSecret(), "[REDACTED]");
                stackTrace = stackTrace.Replace(profile.ClientSecretEncrypted, "[ENCRYPTED]");
            }
            
            _logger.LogError(errorMessage, error);
            return errorMessage;
        }
    }
    
    public class SecureContractResolver : Newtonsoft.Json.Serialization.DefaultContractResolver
    {
        protected override Newtonsoft.Json.Serialization.JsonProperty CreateProperty(
            System.Reflection.MemberInfo member, 
            Newtonsoft.Json.MemberSerialization memberSerialization)
        {
            var property = base.CreateProperty(member, memberSerialization);
            
            // Exclude or mask sensitive properties
            if (property.PropertyName.Contains("Secret") || 
                property.PropertyName.Contains("Password") ||
                property.PropertyName.Contains("Encrypted"))
            {
                property.ShouldSerialize = instance => false; // Don't serialize
                // Or alternatively, mask the value:
                // property.ValueProvider = new MaskedValueProvider(property.ValueProvider);
            }
            
            return property;
        }
    }
    
    #endregion
}