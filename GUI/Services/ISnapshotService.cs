using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface ISnapshotService
    {
        Task<Snapshot> CreateSnapshotAsync(string name = null);
        Task<List<Snapshot>> GetSnapshotsAsync();
        Task<Snapshot> LoadSnapshotAsync(string snapshotId);
        Task DeleteSnapshotAsync(string snapshotId);
        Task<ComparisonResult> CompareSnapshotsAsync(string baselineSnapshotId, string compareSnapshotId);
        Task<string> ExportSnapshotAsync(string snapshotId, string filePath);
        Task<Snapshot> ImportSnapshotAsync(string filePath);
    }

    public class Snapshot
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ProfileName { get; set; }
        public SnapshotData Data { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
    }

    public class SnapshotData
    {
        public List<UserData> Users { get; set; }
        public List<InfrastructureData> Infrastructure { get; set; }
        public List<GroupData> Groups { get; set; }
        public List<ApplicationData> Applications { get; set; }
        public Dictionary<string, object> CustomData { get; set; }
    }

    public class ComparisonResult
    {
        public string BaselineSnapshotId { get; set; }
        public string CompareSnapshotId { get; set; }
        public DateTime ComparisonDate { get; set; }
        public ComparisonSummary Summary { get; set; }
        public List<ChangeItem> Changes { get; set; }
    }

    public class ComparisonSummary
    {
        public int TotalChanges { get; set; }
        public int AddedItems { get; set; }
        public int RemovedItems { get; set; }
        public int ModifiedItems { get; set; }
        public Dictionary<string, int> ChangesByCategory { get; set; }
    }

    public class ChangeItem
    {
        public string Id { get; set; }
        public string Category { get; set; }
        public string Type { get; set; } // Added, Removed, Modified
        public string ItemName { get; set; }
        public string PropertyName { get; set; }
        public object OldValue { get; set; }
        public object NewValue { get; set; }
        public DateTime DetectedAt { get; set; }
        public string Description { get; set; }
    }
}