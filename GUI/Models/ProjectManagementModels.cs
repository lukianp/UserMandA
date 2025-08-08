using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a complete M&A integration project
    /// </summary>
    public class IntegrationProject : INotifyPropertyChanged
    {
        private string _name;
        private string _companyName;
        private DateTime _startDate;
        private DateTime _targetEndDate;
        private ProjectStatus _status;
        private double _healthScore;
        private double _overallProgress;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }
        
        public string CompanyName
        {
            get => _companyName;
            set { _companyName = value; OnPropertyChanged(); }
        }

        public DateTime StartDate
        {
            get => _startDate;
            set { _startDate = value; OnPropertyChanged(); }
        }

        public DateTime TargetEndDate
        {
            get => _targetEndDate;
            set { _targetEndDate = value; OnPropertyChanged(); }
        }

        public ProjectStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public double HealthScore
        {
            get => _healthScore;
            set { _healthScore = value; OnPropertyChanged(); OnPropertyChanged(nameof(HealthScoreColor)); }
        }

        public double OverallProgress
        {
            get => _overallProgress;
            set { _overallProgress = value; OnPropertyChanged(); }
        }

        public string HealthScoreColor => HealthScore >= 80 ? "#FF10B981" : HealthScore >= 60 ? "#FFF59E0B" : "#FFEF4444";

        public ObservableCollection<ProjectPhase> Phases { get; set; } = new ObservableCollection<ProjectPhase>();
        public ObservableCollection<ProjectMilestone> Milestones { get; set; } = new ObservableCollection<ProjectMilestone>();
        public ObservableCollection<ProjectRisk> Risks { get; set; } = new ObservableCollection<ProjectRisk>();
        public ObservableCollection<ProjectStakeholder> Stakeholders { get; set; } = new ObservableCollection<ProjectStakeholder>();
        public ObservableCollection<ProjectDocument> Documents { get; set; } = new ObservableCollection<ProjectDocument>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a project phase (e.g., Discovery, Service Transition, Design)
    /// </summary>
    public class ProjectPhase : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private DateTime _startDate;
        private DateTime _endDate;
        private PhaseStatus _status;
        private double _progress;
        private bool _isExpanded;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public DateTime StartDate
        {
            get => _startDate;
            set { _startDate = value; OnPropertyChanged(); }
        }

        public DateTime EndDate
        {
            get => _endDate;
            set { _endDate = value; OnPropertyChanged(); }
        }

        public PhaseStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public double Progress
        {
            get => _progress;
            set { _progress = value; OnPropertyChanged(); }
        }

        public bool IsExpanded
        {
            get => _isExpanded;
            set { _isExpanded = value; OnPropertyChanged(); }
        }

        public int Order { get; set; }
        public ObservableCollection<ProjectComponent> Components { get; set; } = new ObservableCollection<ProjectComponent>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a component within a phase (e.g., Infrastructure Assessment, Domain Transition)
    /// </summary>
    public class ProjectComponent : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private ComponentStatus _status;
        private double _progress;
        private bool _isExpanded;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public ComponentStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public double Progress
        {
            get => _progress;
            set { _progress = value; OnPropertyChanged(); }
        }

        public bool IsExpanded
        {
            get => _isExpanded;
            set { _isExpanded = value; OnPropertyChanged(); }
        }

        public int Order { get; set; }
        public ObservableCollection<ProjectTask> Tasks { get; set; } = new ObservableCollection<ProjectTask>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents an individual task within a component
    /// </summary>
    public class ProjectTask : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private TaskStatus _status;
        private TaskPriority _priority;
        private string _assignedTo;
        private DateTime? _dueDate;
        private DateTime? _completedDate;
        private string _notes;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public TaskStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); OnPropertyChanged(nameof(StatusColor)); }
        }

        public TaskPriority Priority
        {
            get => _priority;
            set { _priority = value; OnPropertyChanged(); OnPropertyChanged(nameof(PriorityColor)); }
        }

        public string AssignedTo
        {
            get => _assignedTo;
            set { _assignedTo = value; OnPropertyChanged(); }
        }

        public DateTime? DueDate
        {
            get => _dueDate;
            set { _dueDate = value; OnPropertyChanged(); OnPropertyChanged(nameof(IsOverdue)); }
        }

        public DateTime? CompletedDate
        {
            get => _completedDate;
            set { _completedDate = value; OnPropertyChanged(); }
        }

        public string Notes
        {
            get => _notes;
            set { _notes = value; OnPropertyChanged(); }
        }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.Now && Status != TaskStatus.Completed;

        public string StatusColor => Status switch
        {
            TaskStatus.NotStarted => "#FF6B7280",
            TaskStatus.InProgress => "#FFF59E0B",
            TaskStatus.Completed => "#FF10B981",
            TaskStatus.Blocked => "#FFEF4444",
            _ => "#FF6B7280"
        };

        public string PriorityColor => Priority switch
        {
            TaskPriority.High => "#FFEF4444",
            TaskPriority.Medium => "#FFF59E0B",
            TaskPriority.Low => "#FF10B981",
            _ => "#FF6B7280"
        };

        public ObservableCollection<string> Dependencies { get; set; } = new ObservableCollection<string>();
        public ObservableCollection<TaskComment> Comments { get; set; } = new ObservableCollection<TaskComment>();
        public ObservableCollection<TaskAttachment> Attachments { get; set; } = new ObservableCollection<TaskAttachment>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a project milestone
    /// </summary>
    public class ProjectMilestone : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private DateTime _targetDate;
        private DateTime? _actualDate;
        private MilestoneStatus _status;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public DateTime TargetDate
        {
            get => _targetDate;
            set { _targetDate = value; OnPropertyChanged(); }
        }

        public DateTime? ActualDate
        {
            get => _actualDate;
            set { _actualDate = value; OnPropertyChanged(); }
        }

        public MilestoneStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); OnPropertyChanged(nameof(StatusColor)); }
        }

        public string StatusColor => Status switch
        {
            MilestoneStatus.NotStarted => "#FF6B7280",
            MilestoneStatus.InProgress => "#FFF59E0B",
            MilestoneStatus.Achieved => "#FF10B981",
            MilestoneStatus.AtRisk => "#FFEF4444",
            _ => "#FF6B7280"
        };

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a project risk
    /// </summary>
    public class ProjectRisk : INotifyPropertyChanged
    {
        private string _description;
        private RiskCategory _category;
        private int _likelihood;
        private int _impact;
        private string _mitigationPlan;
        private string _owner;
        private RiskStatus _status;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public RiskCategory Category
        {
            get => _category;
            set { _category = value; OnPropertyChanged(); }
        }

        public int Likelihood
        {
            get => _likelihood;
            set { _likelihood = Math.Max(1, Math.Min(5, value)); OnPropertyChanged(); OnPropertyChanged(nameof(RiskScore)); OnPropertyChanged(nameof(RiskScoreColor)); }
        }

        public int Impact
        {
            get => _impact;
            set { _impact = Math.Max(1, Math.Min(5, value)); OnPropertyChanged(); OnPropertyChanged(nameof(RiskScore)); OnPropertyChanged(nameof(RiskScoreColor)); }
        }

        public int RiskScore => Likelihood * Impact;

        public string RiskScoreColor => RiskScore switch
        {
            >= 16 => "#FFEF4444", // High Risk (Red)
            >= 9 => "#FFF59E0B",  // Medium Risk (Yellow)
            _ => "#FF10B981"      // Low Risk (Green)
        };

        public string MitigationPlan
        {
            get => _mitigationPlan;
            set { _mitigationPlan = value; OnPropertyChanged(); }
        }

        public string Owner
        {
            get => _owner;
            set { _owner = value; OnPropertyChanged(); }
        }

        public RiskStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ResolvedDate { get; set; }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a project stakeholder
    /// </summary>
    public class ProjectStakeholder : INotifyPropertyChanged
    {
        private string _name;
        private string _role;
        private string _email;
        private string _phone;
        private string _department;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Role
        {
            get => _role;
            set { _role = value; OnPropertyChanged(); }
        }

        public string Email
        {
            get => _email;
            set { _email = value; OnPropertyChanged(); }
        }

        public string Phone
        {
            get => _phone;
            set { _phone = value; OnPropertyChanged(); }
        }

        public string Department
        {
            get => _department;
            set { _department = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a project document
    /// </summary>
    public class ProjectDocument : INotifyPropertyChanged
    {
        private string _name;
        private string _category;
        private string _filePath;
        private string _version;
        private string _description;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(); }
        }

        public string Category
        {
            get => _category;
            set { _category = value; OnPropertyChanged(); }
        }

        public string FilePath
        {
            get => _filePath;
            set { _filePath = value; OnPropertyChanged(); }
        }

        public string Version
        {
            get => _version;
            set { _version = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public long FileSize { get; set; }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a comment on a task
    /// </summary>
    public class TaskComment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Author { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Represents an attachment on a task
    /// </summary>
    public class TaskAttachment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedDate { get; set; } = DateTime.Now;
        public string UploadedBy { get; set; }
    }

    /// <summary>
    /// Assignment of a user to a migration wave
    /// </summary>
    public class WaveAssignment : BaseEntity<string>, INotifyPropertyChanged
    {
        private string _userId;
        private string _waveId;
        private string _displayName;

        public string UserId
        {
            get => _userId;
            set { _userId = value; OnPropertyChanged(); }
        }

        public string WaveId
        {
            get => _waveId;
            set { _waveId = value; OnPropertyChanged(); }
        }

        public string DisplayName
        {
            get => _displayName;
            set { _displayName = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a migration wave and its assignments
    /// </summary>
    public partial class MigrationWave
    {
        private ObservableCollection<WaveAssignment> _assignments = new ObservableCollection<WaveAssignment>();

        public ObservableCollection<WaveAssignment> Assignments
        {
            get => _assignments;
            set
            {
                if (_assignments != null)
                    _assignments.CollectionChanged -= Assignments_CollectionChanged;
                _assignments = value;
                if (_assignments != null)
                    _assignments.CollectionChanged += Assignments_CollectionChanged;
                OnPropertyChanged();
                OnPropertyChanged(nameof(AssignedUserCount));
            }
        }

        public int AssignedUserCount => Assignments?.Count ?? 0;

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private void Assignments_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            OnPropertyChanged(nameof(AssignedUserCount));
        }
    }

    // Enumerations
    public enum ProjectStatus
    {
        Planning,
        Active,
        OnHold,
        Completed,
        Cancelled
    }

    public enum PhaseStatus
    {
        NotStarted,
        InProgress,
        Completed,
        OnHold
    }

    public enum ComponentStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Blocked
    }

    public enum TaskStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Blocked
    }

    public enum TaskPriority
    {
        Low,
        Medium,
        High
    }

    public enum MilestoneStatus
    {
        NotStarted,
        InProgress,
        Achieved,
        AtRisk
    }

    public enum RiskCategory
    {
        Technical,
        Business,
        Operational,
        Financial,
        Legal
    }

    public enum RiskStatus
    {
        Open,
        InProgress,
        Mitigated,
        Closed
    }
}