#nullable enable
using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Immutable record representing network infrastructure device data from CSV files
    /// </summary>
    public record NetworkDeviceData(
        string DeviceName,
        string DeviceType,
        string Manufacturer,
        string Model,
        string SerialNumber,
        string IPAddress,
        string MACAddress,
        string Subnet,
        string VLAN,
        string Location,
        string Building,
        string Floor,
        string Room,
        string Rack,
        string Status,
        string Firmware,
        string ConfigVersion,
        int PortCount,
        int PortsUsed,
        string Uptime,
        DateTime? LastScan,
        DateTime? LastSeen,
        DateTime? InstallDate,
        DateTime? WarrantyExpiry
    )
    {
        // Computed properties
        public string TypeIcon => DeviceType?.ToLower() switch
        {
            "router" => "🔀",
            "switch" => "🔌",
            "firewall" => "🛡️",
            "access point" or "ap" => "📡",
            "load balancer" => "⚖️",
            "wireless controller" => "📶",
            "gateway" => "🚪",
            _ => "🖥️"
        };
        
        public string StatusIcon => Status?.ToLower() switch
        {
            "up" or "online" => "🟢",
            "down" or "offline" => "🔴",
            "warning" => "🟡",
            "maintenance" => "🔧",
            "unknown" => "❓",
            _ => "⚫"
        };
        
        public string PortUtilization => PortCount > 0 ? $"{PortsUsed}/{PortCount} ({(PortsUsed * 100 / PortCount):0}%)" : "N/A";
        
        public string PortUtilizationColor => PortCount > 0 ? (PortsUsed * 100 / PortCount) switch
        {
            >= 90 => "#DC2626", // Red - Critical
            >= 80 => "#EA580C", // Orange - High
            >= 70 => "#D97706", // Yellow - Medium
            _ => "#059669"       // Green - Normal
        } : "#6B7280";
        
        public bool IsWarrantyExpiring => WarrantyExpiry.HasValue && 
                                         WarrantyExpiry.Value > DateTime.Now && 
                                         WarrantyExpiry.Value <= DateTime.Now.AddDays(90);
        
        public bool IsWarrantyExpired => WarrantyExpiry.HasValue && WarrantyExpiry.Value < DateTime.Now;
        
        public string WarrantyStatus => WarrantyExpiry switch
        {
            null => "Unknown",
            var date when date < DateTime.Now => "Expired",
            var date when date <= DateTime.Now.AddDays(90) => "Expiring Soon",
            _ => "Active"
        };
    }
}