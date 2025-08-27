using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a risk assessment item
    /// </summary>
    public class RiskAssessment : INotifyPropertyChanged
    {
        private string _title;
        private string _description;
        private RiskCategory _category;
        private RiskLevel _currentLevel;
        private RiskLevel _residualLevel;
        private double _probability;
        private double _impact;
        private RiskStatus _status;
        private DateTime _lastAssessed;
        private string _owner;

        public string Id { get; set; }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public RiskCategory Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public RiskLevel CurrentLevel
        {
            get => _currentLevel;
            set => SetProperty(ref _currentLevel, value);
        }

        public RiskLevel ResidualLevel
        {
            get => _residualLevel;
            set => SetProperty(ref _residualLevel, value);
        }

        public double Probability
        {
            get => _probability;
            set => SetProperty(ref _probability, Math.Max(0, Math.Min(1, value)));
        }

        public double Impact
        {
            get => _impact;
            set => SetProperty(ref _impact, Math.Max(0, Math.Min(1, value)));
        }

        public RiskStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public DateTime LastAssessed
        {
            get => _lastAssessed;
            set => SetProperty(ref _lastAssessed, value);
        }

        public string Owner
        {
            get => _owner;
            set => SetProperty(ref _owner, value);
        }

        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public List<string> AffectedSystems { get; set; }
        public List<RiskMitigationAction> MitigationActions { get; set; }
        public List<RiskIndicator> Indicators { get; set; }
        public Dictionary<string, object> CustomFields { get; set; }

        public RiskAssessment()
        {
            Id = Guid.NewGuid().ToString();
            CreatedDate = DateTime.Now;
            CreatedBy = Environment.UserName;
            LastAssessed = DateTime.Now;
            AffectedSystems = new List<string>();
            MitigationActions = new List<RiskMitigationAction>();
            Indicators = new List<RiskIndicator>();
            CustomFields = new Dictionary<string, object>();
            Status = RiskStatus.Open;
        }

        // Calculated risk score (0-1)
        public double RiskScore => Probability * Impact;

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            LastAssessed = DateTime.Now;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents a mitigation action for a risk
    /// </summary>
    public class RiskMitigationAction : INotifyPropertyChanged
    {
        private string _action;
        private string _description;
        private MitigationType _type;
        private ActionStatus _status;
        private DateTime? _dueDate;
        private string _assignedTo;
        private double _effectivenessRating;

        public string Id { get; set; }
        public string RiskId { get; set; }

        public string Action
        {
            get => _action;
            set => SetProperty(ref _action, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public MitigationType Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }

        public ActionStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public DateTime? DueDate
        {
            get => _dueDate;
            set => SetProperty(ref _dueDate, value);
        }

        public string AssignedTo
        {
            get => _assignedTo;
            set => SetProperty(ref _assignedTo, value);
        }

        public double EffectivenessRating
        {
            get => _effectivenessRating;
            set => SetProperty(ref _effectivenessRating, Math.Max(0, Math.Min(1, value)));
        }

        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public double EstimatedCost { get; set; }
        public int EstimatedDurationDays { get; set; }

        public RiskMitigationAction()
        {
            Id = Guid.NewGuid().ToString();
            CreatedDate = DateTime.Now;
            CreatedBy = Environment.UserName;
            Status = ActionStatus.NotStarted;
            Type = MitigationType.Preventive;
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
    /// Represents a risk indicator or metric
    /// </summary>
    public class RiskIndicator : INotifyPropertyChanged
    {
        private string _name;
        private double _currentValue;
        private double _threshold;
        private IndicatorTrend _trend;
        private IndicatorStatus _status;

        public string Id { get; set; }
        public string RiskId { get; set; }

        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public double CurrentValue
        {
            get => _currentValue;
            set => SetProperty(ref _currentValue, value);
        }

        public double Threshold
        {
            get => _threshold;
            set => SetProperty(ref _threshold, value);
        }

        public IndicatorTrend Trend
        {
            get => _trend;
            set => SetProperty(ref _trend, value);
        }

        public IndicatorStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public string Unit { get; set; }
        public string Description { get; set; }
        public DateTime LastUpdated { get; set; }
        public List<IndicatorDataPoint> History { get; set; }

        public RiskIndicator()
        {
            Id = Guid.NewGuid().ToString();
            LastUpdated = DateTime.Now;
            History = new List<IndicatorDataPoint>();
            Status = IndicatorStatus.Normal;
            Trend = IndicatorTrend.Stable;
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
            LastUpdated = DateTime.Now;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents a data point for risk indicators
    /// </summary>
    public class IndicatorDataPoint
    {
        public DateTime Timestamp { get; set; }
        public double Value { get; set; }
        public string Note { get; set; }

        public IndicatorDataPoint()
        {
            Timestamp = DateTime.Now;
        }
    }

    /// <summary>
    /// Represents aggregated risk statistics
    /// </summary>
    public class RiskStatistics
    {
        public int TotalRisks { get; set; }
        public Dictionary<RiskLevel, int> RisksByLevel { get; set; }
        public Dictionary<RiskCategory, int> RisksByCategory { get; set; }
        public Dictionary<RiskStatus, int> RisksByStatus { get; set; }
        public double AverageRiskScore { get; set; }
        public List<RiskAssessment> TopRisks { get; set; }
        public List<RiskTrendData> Trends { get; set; }
        public DateTime LastUpdated { get; set; }

        public RiskStatistics()
        {
            RisksByLevel = new Dictionary<RiskLevel, int>();
            RisksByCategory = new Dictionary<RiskCategory, int>();
            RisksByStatus = new Dictionary<RiskStatus, int>();
            TopRisks = new List<RiskAssessment>();
            Trends = new List<RiskTrendData>();
            LastUpdated = DateTime.Now;
        }
    }

    /// <summary>
    /// Represents trend data for risk metrics
    /// </summary>
    public class RiskTrendData
    {
        public DateTime Period { get; set; }
        public int NewRisks { get; set; }
        public int ClosedRisks { get; set; }
        public double AverageScore { get; set; }
        public int HighRisks { get; set; }
        public int CriticalRisks { get; set; }
    }

    /// <summary>
    /// Represents a risk heatmap cell
    /// </summary>
    public class RiskHeatmapCell
    {
        public double Probability { get; set; }
        public double Impact { get; set; }
        public int RiskCount { get; set; }
        public List<RiskAssessment> Risks { get; set; }
        public RiskLevel Level { get; set; }

        public RiskHeatmapCell()
        {
            Risks = new List<RiskAssessment>();
        }
    }

    #region Enums

    public enum MitigationType
    {
        Preventive,
        Detective,
        Corrective,
        Compensating,
        Directive
    }

    public enum ActionStatus
    {
        NotStarted,
        InProgress,
        OnHold,
        Completed,
        Cancelled,
        Overdue
    }

    public enum IndicatorTrend
    {
        Improving,
        Stable,
        Deteriorating,
        Unknown
    }

    public enum IndicatorStatus
    {
        Normal,
        Warning,
        Critical,
        Unknown
    }


    #endregion
}