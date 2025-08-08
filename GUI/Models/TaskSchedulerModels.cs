using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a scheduled task in the Windows Task Scheduler
    /// </summary>
    public class ScheduledTask : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private ScheduledTaskStatus _status;
        private DateTime _nextRunTime;
        private DateTime _lastRunTime;
        private TaskResult _lastRunResult;
        private bool _isEnabled;

        public string Id { get; set; }
        
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
        
        public ScheduledTaskStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }
        
        public DateTime NextRunTime
        {
            get => _nextRunTime;
            set => SetProperty(ref _nextRunTime, value);
        }
        
        public DateTime LastRunTime
        {
            get => _lastRunTime;
            set => SetProperty(ref _lastRunTime, value);
        }
        
        public TaskResult LastRunResult
        {
            get => _lastRunResult;
            set => SetProperty(ref _lastRunResult, value);
        }
        
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public string TaskPath { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public TaskTrigger Trigger { get; set; }
        public TaskAction Action { get; set; }
        public TaskSettings Settings { get; set; }

        public ScheduledTask()
        {
            Id = Guid.NewGuid().ToString();
            CreatedDate = DateTime.Now;
            Status = ScheduledTaskStatus.Ready;
            IsEnabled = true;
            Settings = new TaskSettings();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents a task trigger that defines when a task should run
    /// </summary>
    public class TaskTrigger : INotifyPropertyChanged
    {
        private TriggerType _type;
        private DateTime _startDate;
        private DateTime _endDate;
        private bool _hasEndDate;
        private bool _isEnabled;

        public string Id { get; set; }
        
        public TriggerType Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }
        
        public DateTime StartDate
        {
            get => _startDate;
            set => SetProperty(ref _startDate, value);
        }
        
        public DateTime EndDate
        {
            get => _endDate;
            set => SetProperty(ref _endDate, value);
        }
        
        public bool HasEndDate
        {
            get => _hasEndDate;
            set => SetProperty(ref _hasEndDate, value);
        }
        
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        // Schedule-specific properties
        public DaysOfWeek DaysOfWeek { get; set; }
        public int IntervalMinutes { get; set; }
        public int IntervalHours { get; set; }
        public int IntervalDays { get; set; }
        public TimeSpan TimeOfDay { get; set; }
        public int DayOfMonth { get; set; }
        public MonthsOfYear MonthsOfYear { get; set; }

        public TaskTrigger()
        {
            Id = Guid.NewGuid().ToString();
            Type = TriggerType.Once;
            StartDate = DateTime.Now;
            IsEnabled = true;
            TimeOfDay = new TimeSpan(9, 0, 0); // Default to 9 AM
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents an action to be executed by a scheduled task
    /// </summary>
    public class TaskAction : INotifyPropertyChanged
    {
        private ActionType _type;
        private string _executable;
        private string _arguments;
        private string _workingDirectory;

        public string Id { get; set; }
        
        public ActionType Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }
        
        public string Executable
        {
            get => _executable;
            set => SetProperty(ref _executable, value);
        }
        
        public string Arguments
        {
            get => _arguments;
            set => SetProperty(ref _arguments, value);
        }
        
        public string WorkingDirectory
        {
            get => _workingDirectory;
            set => SetProperty(ref _workingDirectory, value);
        }

        // Email action properties (if ActionType.SendEmail)
        public string EmailTo { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string SmtpServer { get; set; }

        // Message action properties (if ActionType.ShowMessage)
        public string MessageTitle { get; set; }
        public string MessageBody { get; set; }

        public TaskAction()
        {
            Id = Guid.NewGuid().ToString();
            Type = ActionType.Execute;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents task settings and constraints
    /// </summary>
    public class TaskSettings : INotifyPropertyChanged
    {
        private bool _allowDemandStart;
        private bool _allowHardTerminate;
        private bool _startWhenAvailable;
        private bool _runOnlyIfNetworkAvailable;
        private bool _runOnlyIfIdle;
        private bool _wakeToRun;
        private bool _runOnlyWhenLoggedOn;
        private ScheduledTaskPriority _priority;

        public bool AllowDemandStart
        {
            get => _allowDemandStart;
            set => SetProperty(ref _allowDemandStart, value);
        }
        
        public bool AllowHardTerminate
        {
            get => _allowHardTerminate;
            set => SetProperty(ref _allowHardTerminate, value);
        }
        
        public bool StartWhenAvailable
        {
            get => _startWhenAvailable;
            set => SetProperty(ref _startWhenAvailable, value);
        }
        
        public bool RunOnlyIfNetworkAvailable
        {
            get => _runOnlyIfNetworkAvailable;
            set => SetProperty(ref _runOnlyIfNetworkAvailable, value);
        }
        
        public bool RunOnlyIfIdle
        {
            get => _runOnlyIfIdle;
            set => SetProperty(ref _runOnlyIfIdle, value);
        }
        
        public bool WakeToRun
        {
            get => _wakeToRun;
            set => SetProperty(ref _wakeToRun, value);
        }
        
        public bool RunOnlyWhenLoggedOn
        {
            get => _runOnlyWhenLoggedOn;
            set => SetProperty(ref _runOnlyWhenLoggedOn, value);
        }
        
        public ScheduledTaskPriority Priority
        {
            get => _priority;
            set => SetProperty(ref _priority, value);
        }

        public TimeSpan ExecutionTimeLimit { get; set; }
        public TimeSpan DeleteExpiredTaskAfter { get; set; }
        public int RestartCount { get; set; }
        public TimeSpan RestartInterval { get; set; }
        public IdleSettings IdleSettings { get; set; }
        public NetworkSettings NetworkSettings { get; set; }

        public TaskSettings()
        {
            AllowDemandStart = true;
            AllowHardTerminate = true;
            StartWhenAvailable = false;
            RunOnlyIfNetworkAvailable = false;
            RunOnlyIfIdle = false;
            WakeToRun = false;
            RunOnlyWhenLoggedOn = true;
            Priority = ScheduledTaskPriority.Normal;
            ExecutionTimeLimit = TimeSpan.FromHours(72);
            RestartCount = 0;
            RestartInterval = TimeSpan.FromMinutes(1);
            IdleSettings = new IdleSettings();
            NetworkSettings = new NetworkSettings();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents idle-related task settings
    /// </summary>
    public class IdleSettings
    {
        public TimeSpan IdleDuration { get; set; }
        public TimeSpan WaitTimeout { get; set; }
        public bool RestartOnIdle { get; set; }
        public bool StopOnIdleEnd { get; set; }

        public IdleSettings()
        {
            IdleDuration = TimeSpan.FromMinutes(10);
            WaitTimeout = TimeSpan.FromMinutes(60);
            RestartOnIdle = false;
            StopOnIdleEnd = true;
        }
    }

    /// <summary>
    /// Represents network-related task settings
    /// </summary>
    public class NetworkSettings
    {
        public string NetworkName { get; set; }
        public Guid NetworkId { get; set; }

        public NetworkSettings()
        {
            NetworkName = string.Empty;
            NetworkId = Guid.Empty;
        }
    }

    /// <summary>
    /// Represents a task execution history entry
    /// </summary>
    public class TaskHistory
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TaskResult Result { get; set; }
        public int ExitCode { get; set; }
        public string ResultMessage { get; set; }
        public TimeSpan Duration => EndTime - StartTime;

        public TaskHistory()
        {
            Result = TaskResult.Success;
            ExitCode = 0;
            ResultMessage = string.Empty;
        }
    }

    /// <summary>
    /// Represents a template for creating common discovery tasks
    /// </summary>
    public class TaskTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public TaskAction DefaultAction { get; set; }
        public TaskTrigger DefaultTrigger { get; set; }
        public TaskSettings DefaultSettings { get; set; }
        public Dictionary<string, object> Parameters { get; set; }

        public TaskTemplate()
        {
            Id = Guid.NewGuid().ToString();
            Parameters = new Dictionary<string, object>();
        }
    }

    #region Enums

    public enum ScheduledTaskStatus
    {
        Unknown,
        Disabled,
        Queued,
        Ready,
        Running
    }

    public enum TaskResult
    {
        None,
        Success,
        Failure,
        Terminated,
        Cancelled
    }

    public enum TriggerType
    {
        Once,
        Daily,
        Weekly,
        Monthly,
        MonthlyDayOfWeek,
        OnIdle,
        OnTaskCreation,
        OnBoot,
        OnLogon,
        OnSessionStateChange
    }

    public enum ActionType
    {
        Execute,
        ComHandler,
        SendEmail,
        ShowMessage
    }

    public enum ScheduledTaskPriority
    {
        Idle = 1,
        BelowNormal = 3,
        Normal = 5,
        AboveNormal = 7,
        High = 9,
        Realtime = 10
    }

    [Flags]
    public enum DaysOfWeek
    {
        None = 0,
        Sunday = 1,
        Monday = 2,
        Tuesday = 4,
        Wednesday = 8,
        Thursday = 16,
        Friday = 32,
        Saturday = 64,
        All = 127
    }

    [Flags]
    public enum MonthsOfYear
    {
        None = 0,
        January = 1,
        February = 2,
        March = 4,
        April = 8,
        May = 16,
        June = 32,
        July = 64,
        August = 128,
        September = 256,
        October = 512,
        November = 1024,
        December = 2048,
        All = 4095
    }

    #endregion
}