using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model for network infrastructure device data from CSV files
    /// </summary>
    public class NetworkDeviceData
    {
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string IPAddress { get; set; } = string.Empty;
        public string MACAddress { get; set; } = string.Empty;
        public string Subnet { get; set; } = string.Empty;
        public string VLAN { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Building { get; set; } = string.Empty;
        public string Floor { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string Rack { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Firmware { get; set; } = string.Empty;
        public string ConfigVersion { get; set; } = string.Empty;
        public int PortCount { get; set; }
        public int PortsUsed { get; set; }
        public string Uptime { get; set; } = string.Empty;
        public DateTime? LastScan { get; set; }
        public DateTime? LastSeen { get; set; }
        public DateTime? InstallDate { get; set; }
        public DateTime? WarrantyExpiry { get; set; }
        
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