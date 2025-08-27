#nullable enable
using System;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Dashboard metrics for the Group Policy & Security view
    /// </summary>
    public class SecurityDashboardMetrics
    {
        public int GroupPolicyCount { get; set; }
        public int SecurityGroupCount { get; set; }
        public int InfrastructureItemCount { get; set; }
        public int ThreatIndicatorCount { get; set; }
        public double ComplianceScore { get; set; }
        public int PassedControls { get; set; }
        public int FailedControls { get; set; }
        public int TotalControls { get; set; }
        public int ActiveThreats { get; set; }
        public int CriticalRisks { get; set; }
        public int HighRisks { get; set; }
        public DateTimeOffset? LastUpdated { get; set; }
        
        // Computed properties
        public int PendingControls => TotalControls - PassedControls - FailedControls;
        
        public string ComplianceStatus => ComplianceScore switch
        {
            >= 90 => "Excellent",
            >= 80 => "Good",
            >= 70 => "Fair",
            >= 60 => "Poor",
            _ => "Critical"
        };
        
        public string ComplianceColor => ComplianceScore switch
        {
            >= 90 => "#10B981",
            >= 80 => "#059669",
            >= 70 => "#F59E0B",
            >= 60 => "#EA580C",
            _ => "#EF4444"
        };
        
        public string ThreatStatus => ActiveThreats switch
        {
            0 => "Clean",
            <= 5 => "Low",
            <= 15 => "Moderate",
            <= 30 => "High",
            _ => "Critical"
        };
        
        public string SecurityPosture => (ComplianceScore, ActiveThreats, CriticalRisks) switch
        {
            (>= 90, 0, 0) => "Strong",
            (>= 80, <= 5, <= 2) => "Good",
            (>= 70, <= 15, <= 5) => "Moderate",
            (>= 60, <= 30, <= 10) => "Weak",
            _ => "Poor"
        };
    }
}