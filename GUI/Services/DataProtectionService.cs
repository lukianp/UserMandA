#pragma warning disable CA1416 // Platform compatibility
using System;
using System.Security.Cryptography;
using System.Text;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Provides DPAPI-based string encryption/decryption for secrets at rest.
    /// Uses CurrentUser scope so only the same Windows user can decrypt.
    /// </summary>
    public static class DataProtectionService
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("MandA-DiscoverySuite-TargetProfile-v1");

        public static string ProtectToBase64(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return string.Empty;
            var bytes = Encoding.UTF8.GetBytes(plainText);
            var protectedBytes = ProtectedData.Protect(bytes, Entropy, DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(protectedBytes);
        }

        public static string UnprotectFromBase64(string protectedBase64)
        {
            if (string.IsNullOrWhiteSpace(protectedBase64)) return string.Empty;
            var protectedBytes = Convert.FromBase64String(protectedBase64);
            var unprotected = ProtectedData.Unprotect(protectedBytes, Entropy, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(unprotected);
        }
    }
}

