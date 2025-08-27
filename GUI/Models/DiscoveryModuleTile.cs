using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Discovery module tile record as per specification
    /// </summary>
    public record DiscoveryModuleTile(
        string Key,                // e.g. "Users", "Groups", "Infra"
        string DisplayName,        // "User Discovery"
        string Description,
        string IconPath,           // under GUI/Assets/Icons/
        string ScriptPath,         // PS1 path in C:\enterprisediscovery\Modules\...
        string? LastRunIso,        // ISO timestamp
        string Status,             // Pending | Running | Complete | Error
        int? DiscoveredCount       // e.g., rows last run
    );

    /// <summary>
    /// KPI trend point for analytics
    /// </summary>
    public record KpiTrendPoint(DateTimeOffset Timestamp, int Value);
}