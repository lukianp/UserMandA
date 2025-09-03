using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models.Migration
{
    /// <summary>
    /// Represents a migration wave containing batched migration operations
    /// </summary>
    public class MigrationWave : INotifyPropertyChanged
    {
        private string _name = string.Empty;
        private string _description = string.Empty;
        private MigrationWaveStatus _status = MigrationWaveStatus.Pending;
        private DateTime? _scheduledStart;
        private DateTime? _actualStart;
        private DateTime? _actualEnd;
        private int _priority = 1;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public MigrationWaveStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public DateTime? ScheduledStart
        {
            get => _scheduledStart;
            set => SetProperty(ref _scheduledStart, value);
        }

        public DateTime? ActualStart
        {
            get => _actualStart;
            set => SetProperty(ref _actualStart, value);
        }

        public DateTime? ActualEnd
        {
            get => _actualEnd;
            set => SetProperty(ref _actualEnd, value);
        }

        public int Priority
        {
            get => _priority;
            set => SetProperty(ref _priority, value);
        }

        public TimeSpan? Duration => ActualEnd.HasValue && ActualStart.HasValue 
            ? ActualEnd.Value - ActualStart.Value 
            : null;

        // Migration items in this wave
        public List<UserItem> Users { get; set; } = new List<UserItem>();
        public List<MailboxItem> Mailboxes { get; set; } = new List<MailboxItem>();
        public List<GroupItem> Groups { get; set; } = new List<GroupItem>();
        public List<FileShareItem> FileShares { get; set; } = new List<FileShareItem>();
        public List<FileShareItem> Files { get; set; } = new List<FileShareItem>(); // Alias for FileShares
        public List<DatabaseItem> Databases { get; set; } = new List<DatabaseItem>();
        public List<object> CustomItems { get; set; } = new List<object>();

        // Wave configuration
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public List<string> Dependencies { get; set; } = new List<string>(); // Other wave IDs this depends on
        public List<string> Tags { get; set; } = new List<string>();
        
        // Progress tracking
        public int TotalItems => Users.Count + Mailboxes.Count + Groups.Count + FileShares.Count + Databases.Count + CustomItems.Count;
        public int ProcessedItems { get; set; }
        public int SuccessfulItems { get; set; }
        public int FailedItems { get; set; }
        
        public double ProgressPercentage => TotalItems > 0 ? (double)ProcessedItems / TotalItems * 100 : 0;
        public double SuccessRate => ProcessedItems > 0 ? (double)SuccessfulItems / ProcessedItems * 100 : 0;

        // Metadata
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string LastModifiedBy { get; set; } = string.Empty;
        public DateTime LastModifiedDate { get; set; } = DateTime.Now;

        // Validation
        public bool IsValid => !string.IsNullOrEmpty(Name) && TotalItems > 0;
        public List<string> ValidationErrors { get; set; } = new List<string>();

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (EqualityComparer<T>.Default.Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        public void Validate()
        {
            ValidationErrors.Clear();

            if (string.IsNullOrWhiteSpace(Name))
                ValidationErrors.Add("Wave name is required");

            if (TotalItems == 0)
                ValidationErrors.Add("Wave must contain at least one migration item");

            if (ScheduledStart.HasValue && ScheduledStart.Value < DateTime.Now)
                ValidationErrors.Add("Scheduled start time cannot be in the past");

            foreach (var dependencyId in Dependencies)
            {
                if (dependencyId == Id)
                    ValidationErrors.Add("Wave cannot depend on itself");
            }
        }
    }

    /// <summary>
    /// Status enumeration for migration waves
    /// </summary>
    public enum MigrationWaveStatus
    {
        Pending,
        Scheduled,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Paused
    }

    // Item types for migration waves
    public class UserItem
    {
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class MailboxItem
    {
        public string UserPrincipalName { get; set; }
        public string PrimarySmtpAddress { get; set; }
        public long SizeBytes { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class GroupItem
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string GroupType { get; set; }
        public string Sid { get; set; } = string.Empty;
        public List<string> Members { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class FileShareItem
    {
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public long SizeBytes { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class DatabaseItem
    {
        public string Name { get; set; }
        public string SourceServer { get; set; }
        public string TargetServer { get; set; }
        public long SizeMB { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }
}