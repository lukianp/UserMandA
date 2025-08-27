using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using MandADiscoverySuite.Collections;

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

        public DateTime? LastModified { get; set; }

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
    public partial class ProjectPhase : INotifyPropertyChanged
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

    // =====================================================
    // NEW MIGRATION MANAGEMENT MODELS
    // =====================================================

    /// <summary>
    /// Represents a complete migration project with project management phases
    /// </summary>
    public class MigrationProject : INotifyPropertyChanged
    {
        private string _projectName;
        private string _description;
        private double _overallProgress;
        private DateTime _startDate;
        private DateTime _endDate;

        public string ProjectName
        {
            get => _projectName;
            set { _projectName = value; OnPropertyChanged(); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public ObservableCollection<ProjectPhase> Phases { get; set; } = new ObservableCollection<ProjectPhase>();

        public double OverallProgress
        {
            get => _overallProgress;
            set { _overallProgress = value; OnPropertyChanged(); }
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

        public OptimizedObservableCollection<string> Stakeholders { get; set; } = new OptimizedObservableCollection<string>();
        
        public OptimizedObservableCollection<RiskItem> Risks { get; set; } = new OptimizedObservableCollection<RiskItem>();

        public ObservableCollection<MigrationProjectWave> Waves { get; set; } = new ObservableCollection<MigrationProjectWave>();

        /// <summary>
        /// Calculates overall progress as average of phase progresses
        /// </summary>
        public void CalculateOverallProgress()
        {
            if (Phases == null || Phases.Count == 0)
            {
                OverallProgress = 0;
                return;
            }

            double totalProgress = 0;
            foreach (var phase in Phases)
            {
                phase.CalculatePhaseProgress();
                totalProgress += phase.Progress;
            }
            
            OverallProgress = totalProgress / Phases.Count;
        }

        /// <summary>
        /// Initializes project with standard PM phases from flowchart
        /// </summary>
        public void InitializeWithStandardPhases()
        {
            Phases.Clear();
            
            // Initiation Phase
            var initiation = new ProjectPhase
            {
                Name = "Initiation",
                Description = "Project initiation and setup phase",
                StartDate = StartDate,
                EndDate = StartDate.AddDays(14)
            };
            initiation.Tasks.Add(new MigrationProjectTask { Name = "Concept Development", Description = "Develop project concept and vision", StartDate = StartDate, EndDate = StartDate.AddDays(3), Owner = "Project Manager", Status = MigrationProjectTaskStatus.Completed, Progress = 100 });
            initiation.Tasks.Add(new MigrationProjectTask { Name = "Feasibility Study", Description = "Conduct feasibility analysis", StartDate = StartDate.AddDays(2), EndDate = StartDate.AddDays(7), Owner = "Business Analyst", Status = MigrationProjectTaskStatus.Completed, Progress = 100 });
            initiation.Tasks.Add(new MigrationProjectTask { Name = "Stakeholder Identification", Description = "Identify and engage key stakeholders", StartDate = StartDate.AddDays(5), EndDate = StartDate.AddDays(10), Owner = "Project Manager", Status = MigrationProjectTaskStatus.InProgress, Progress = 75 });
            initiation.Tasks.Add(new MigrationProjectTask { Name = "Project Charter Development", Description = "Create project charter document", StartDate = StartDate.AddDays(8), EndDate = StartDate.AddDays(12), Owner = "Project Manager", Status = MigrationProjectTaskStatus.InProgress, Progress = 50 });
            initiation.Tasks.Add(new MigrationProjectTask { Name = "Approval & Authorization", Description = "Obtain project approval and authorization", StartDate = StartDate.AddDays(10), EndDate = StartDate.AddDays(14), Owner = "Executive Sponsor", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            Phases.Add(initiation);

            // Planning Phase
            var planning = new ProjectPhase
            {
                Name = "Planning",
                Description = "Comprehensive project planning phase",
                StartDate = StartDate.AddDays(14),
                EndDate = StartDate.AddDays(30)
            };
            planning.Tasks.Add(new MigrationProjectTask { Name = "Scope Definition", Description = "Define project scope and boundaries", StartDate = StartDate.AddDays(14), EndDate = StartDate.AddDays(18), Owner = "Business Analyst", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Work Breakdown Structure (WBS)", Description = "Create detailed WBS", StartDate = StartDate.AddDays(16), EndDate = StartDate.AddDays(20), Owner = "Project Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Scheduling", Description = "Develop project schedule", StartDate = StartDate.AddDays(18), EndDate = StartDate.AddDays(25), Owner = "Project Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0, IsCriticalPath = true });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Resource Allocation", Description = "Allocate resources to tasks", StartDate = StartDate.AddDays(22), EndDate = StartDate.AddDays(26), Owner = "Resource Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Risk Management Planning", Description = "Identify and plan for risks", StartDate = StartDate.AddDays(20), EndDate = StartDate.AddDays(28), Owner = "Risk Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Communication Planning", Description = "Develop communication strategy", StartDate = StartDate.AddDays(24), EndDate = StartDate.AddDays(28), Owner = "Communications Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            planning.Tasks.Add(new MigrationProjectTask { Name = "Procurement Planning", Description = "Plan procurement activities", StartDate = StartDate.AddDays(26), EndDate = StartDate.AddDays(30), Owner = "Procurement Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            Phases.Add(planning);

            // Execution Phase
            var execution = new ProjectPhase
            {
                Name = "Execution",
                Description = "Project execution and implementation phase",
                StartDate = StartDate.AddDays(30),
                EndDate = StartDate.AddDays(120)
            };
            execution.Tasks.Add(new MigrationProjectTask { Name = "Team Coordination", Description = "Coordinate team activities", StartDate = StartDate.AddDays(30), EndDate = StartDate.AddDays(120), Owner = "Project Manager", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0, IsCriticalPath = true });
            execution.Tasks.Add(new MigrationProjectTask { Name = "Infrastructure Migration", Description = "Migrate core infrastructure components", StartDate = StartDate.AddDays(35), EndDate = StartDate.AddDays(60), Owner = "Infrastructure Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0, IsCriticalPath = true });
            execution.Tasks.Add(new MigrationProjectTask { Name = "Application Migration", Description = "Migrate business applications", StartDate = StartDate.AddDays(45), EndDate = StartDate.AddDays(90), Owner = "Application Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0, IsCriticalPath = true });
            execution.Tasks.Add(new MigrationProjectTask { Name = "Data Migration", Description = "Migrate user and business data", StartDate = StartDate.AddDays(60), EndDate = StartDate.AddDays(100), Owner = "Data Migration Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0, IsCriticalPath = true });
            execution.Tasks.Add(new MigrationProjectTask { Name = "Quality Assurance & Control", Description = "Ensure quality standards", StartDate = StartDate.AddDays(40), EndDate = StartDate.AddDays(110), Owner = "QA Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            execution.Tasks.Add(new MigrationProjectTask { Name = "User Training", Description = "Train users on new systems", StartDate = StartDate.AddDays(80), EndDate = StartDate.AddDays(115), Owner = "Training Lead", Status = MigrationProjectTaskStatus.NotStarted, Progress = 0 });
            Phases.Add(execution);

            // Monitoring & Controlling Phase
            var monitoring = new ProjectPhase
            {
                Name = "Monitoring & Controlling",
                Description = "Continuous monitoring and control phase",
                StartDate = StartDate.AddDays(30),
                EndDate = StartDate.AddDays(120)
            };
            monitoring.Tasks.Add(new MigrationProjectTask { Name = "Performance Measurement", Description = "Measure project performance" });
            monitoring.Tasks.Add(new MigrationProjectTask { Name = "Risk Monitoring", Description = "Monitor and manage risks" });
            monitoring.Tasks.Add(new MigrationProjectTask { Name = "Scope Control", Description = "Control project scope" });
            monitoring.Tasks.Add(new MigrationProjectTask { Name = "Cost Control", Description = "Monitor and control costs" });
            monitoring.Tasks.Add(new MigrationProjectTask { Name = "Quality Control", Description = "Ensure quality compliance" });
            Phases.Add(monitoring);

            // Closure Phase
            var closure = new ProjectPhase
            {
                Name = "Closure",
                Description = "Project closure and handover phase",
                StartDate = StartDate.AddDays(120),
                EndDate = EndDate
            };
            closure.Tasks.Add(new MigrationProjectTask { Name = "Final Deliverable Handover", Description = "Hand over final deliverables" });
            closure.Tasks.Add(new MigrationProjectTask { Name = "Client Approval & Sign-Off", Description = "Obtain client approval" });
            closure.Tasks.Add(new MigrationProjectTask { Name = "Project Documentation", Description = "Complete project documentation" });
            closure.Tasks.Add(new MigrationProjectTask { Name = "Team Evaluation & Recognition", Description = "Evaluate and recognize team" });
            closure.Tasks.Add(new MigrationProjectTask { Name = "Post-Mortem Analysis", Description = "Conduct lessons learned session" });
            Phases.Add(closure);
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Extended ProjectPhase with migration-specific features
    /// </summary>
    public partial class ProjectPhase
    {
        public ObservableCollection<MigrationProjectTask> Tasks { get; set; } = new ObservableCollection<MigrationProjectTask>();

        /// <summary>
        /// Calculates phase progress as percentage of completed tasks
        /// </summary>
        public void CalculatePhaseProgress()
        {
            if (Tasks == null || Tasks.Count == 0)
            {
                Progress = 0;
                return;
            }

            int completedTasks = Tasks.Count(t => t.Status == MigrationProjectTaskStatus.Completed);
            Progress = (double)completedTasks / Tasks.Count * 100;
        }
    }

    /// <summary>
    /// Represents a migration task with dependencies
    /// </summary>
    public class MigrationProjectTask : INotifyPropertyChanged
    {
        private static int _nextId = 1;
        private int _id;
        private string _name;
        private string _description;
        private string _owner;
        private DateTime _startDate;
        private DateTime _endDate;
        private MigrationProjectTaskStatus _status;
        private double _progress;
        private string _notes;
        private bool _isCriticalPath;

        public int Id
        {
            get => _id;
            set { _id = value; OnPropertyChanged(); }
        }

        public MigrationProjectTask()
        {
            Id = _nextId++;
            Status = MigrationProjectTaskStatus.NotStarted;
            Progress = 0;
            Dependencies = new List<int>();
        }

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

        public string Owner
        {
            get => _owner;
            set { _owner = value; OnPropertyChanged(); }
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

        public MigrationProjectTaskStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); OnPropertyChanged(nameof(StatusColor)); }
        }

        public List<int> Dependencies { get; set; }

        public double Progress
        {
            get => _progress;
            set { _progress = Math.Max(0, Math.Min(100, value)); OnPropertyChanged(); }
        }

        public string Notes
        {
            get => _notes;
            set { _notes = value; OnPropertyChanged(); }
        }

        public bool IsCriticalPath
        {
            get => _isCriticalPath;
            set { _isCriticalPath = value; OnPropertyChanged(); }
        }

        public string StatusColor => Status switch
        {
            MigrationProjectTaskStatus.NotStarted => "#FF6B7280",
            MigrationProjectTaskStatus.InProgress => "#FF3B82F6",
            MigrationProjectTaskStatus.Completed => "#FF10B981",
            MigrationProjectTaskStatus.AtRisk => "#FFF59E0B",
            MigrationProjectTaskStatus.Blocked => "#FFEF4444",
            _ => "#FF6B7280"
        };

        // Additional properties for Gantt chart display
        public double Width { get; set; }
        public string Fill => StatusColor;
        public string Stroke => IsCriticalPath ? "#FFDC2626" : "#FF334155";
        public double StrokeThickness => IsCriticalPath ? 2 : 1;
        public double LeftPosition { get; set; }
        public double TopPosition { get; set; }
        public int Duration => Math.Max(1, (EndDate - StartDate).Days);

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a migration wave
    /// </summary>
    public class MigrationProjectWave : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private DateTime _startDate;
        private DateTime _endDate;
        private WaveStatus _status;
        private double _progress;

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

        public WaveStatus Status
        {
            get => _status;
            set { _status = value; OnPropertyChanged(); }
        }

        public OptimizedObservableCollection<User> AssignedUsers { get; set; } = new OptimizedObservableCollection<User>();

        public double Progress
        {
            get => _progress;
            set { _progress = value; OnPropertyChanged(); }
        }

        public List<string> AssociatedPhases { get; set; } = new List<string>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a risk item
    /// </summary>
    public class RiskItem : INotifyPropertyChanged
    {
        private string _description;
        private RiskSeverity _severity;
        private string _mitigation;

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(); }
        }

        public RiskSeverity Severity
        {
            get => _severity;
            set { _severity = value; OnPropertyChanged(); }
        }

        public string Mitigation
        {
            get => _mitigation;
            set { _mitigation = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Represents a user with ShareGate-inspired complexity scoring and dependency tracking
    /// </summary>
    public class User : INotifyPropertyChanged
    {
        private string _name;
        private string _role;
        private string _department;
        private int _complexityScore;
        private string _complexityLevel;
        private System.Windows.Media.SolidColorBrush _complexityColor;
        private int _dependencyCount;
        private bool _hasDependencies;

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
        
        public string Department
        {
            get => _department;
            set { _department = value; OnPropertyChanged(); }
        }
        
        /// <summary>
        /// Complexity score from 1-100 based on user attributes and migration requirements
        /// </summary>
        public int ComplexityScore
        {
            get => _complexityScore;
            set { _complexityScore = value; OnPropertyChanged(); }
        }
        
        /// <summary>
        /// Human-readable complexity level: "Low", "Med", "High"
        /// </summary>
        public string ComplexityLevel
        {
            get => _complexityLevel;
            set { _complexityLevel = value; OnPropertyChanged(); }
        }
        
        /// <summary>
        /// Color brush for complexity visualization
        /// </summary>
        public System.Windows.Media.SolidColorBrush ComplexityColor
        {
            get => _complexityColor;
            set { _complexityColor = value; OnPropertyChanged(); }
        }
        
        /// <summary>
        /// Number of dependencies this user has
        /// </summary>
        public int DependencyCount
        {
            get => _dependencyCount;
            set { _dependencyCount = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasDependencies)); }
        }
        
        /// <summary>
        /// Whether this user has any dependencies
        /// </summary>
        public bool HasDependencies
        {
            get => _dependencyCount > 0;
            set { _hasDependencies = value; OnPropertyChanged(); }
        }
        
        // Additional ShareGate-inspired properties for advanced scenarios
        public string UserPrincipalName { get; set; }
        public string EmailAddress { get; set; }
        public string ManagerName { get; set; }
        public DateTime? LastLogonDate { get; set; }
        public bool IsServiceAccount { get; set; }
        public bool IsAdminAccount { get; set; }
        public List<string> SecurityGroups { get; set; } = new List<string>();
        public double MailboxSizeGB { get; set; }
        public int ApplicationCount { get; set; }
        public string MigrationNotes { get; set; }
        public DateTime? PlannedMigrationDate { get; set; }
        public string MigrationStatus { get; set; } = "Planned";

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Wave status item for charts
    /// </summary>
    public class WaveStatusItem
    {
        public string WaveName { get; set; }
        public double Completion { get; set; }
    }

    // New Enumerations
    public enum MigrationProjectTaskStatus
    {
        NotStarted,
        InProgress,
        Completed,
        AtRisk,
        Blocked
    }

    public enum WaveStatus
    {
        Planned,
        Active,
        Completed
    }

    public enum RiskSeverity
    {
        Low,
        Medium,
        High
    }
}