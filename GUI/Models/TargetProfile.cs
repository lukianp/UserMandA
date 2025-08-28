using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a target tenant/profile used for migrations.
    /// Secrets are stored encrypted on disk and never logged.
    /// </summary>
    public class TargetProfile
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;

        // Encrypted client secret persisted as Base64; do not log or expose.
        public string ClientSecretEncrypted { get; set; } = string.Empty;

        // Comma-separated scopes persisted; exposed as list via helper.
        public List<string> Scopes { get; set; } = new();

        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
    }
}

