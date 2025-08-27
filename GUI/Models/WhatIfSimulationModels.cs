using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a What-If simulation scenario
    /// </summary>
    public class WhatIfSimulation : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private SimulationStatus _status;
        private DateTime _createdDate;
        private DateTime _lastModified;
        private TimeSpan _duration;
        private double _progressPercentage;

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
        
        public SimulationStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }
        
        public DateTime CreatedDate
        {
            get => _createdDate;
            set => SetProperty(ref _createdDate, value);
        }
        
        public DateTime LastModified
        {
            get => _lastModified;
            set => SetProperty(ref _lastModified, value);
        }
        
        public TimeSpan Duration
        {
            get => _duration;
            set => SetProperty(ref _duration, value);
        }
        
        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public string CreatedBy { get; set; }
        public List<SimulationParameter> Parameters { get; set; }
        public List<SimulationScenario> Scenarios { get; set; }
        public SimulationResults Results { get; set; }
        public string Version { get; set; }
        public Dictionary<string, object> Metadata { get; set; }

        public WhatIfSimulation()
        {
            Id = Guid.NewGuid().ToString();
            Parameters = new List<SimulationParameter>();
            Scenarios = new List<SimulationScenario>();
            Metadata = new Dictionary<string, object>();
            CreatedDate = DateTime.Now;
            LastModified = DateTime.Now;
            Status = SimulationStatus.Draft;
            Version = "1.0";
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
    /// Represents a parameter that can be adjusted in the simulation
    /// </summary>
    public class SimulationParameter : INotifyPropertyChanged
    {
        private string _displayName;
        private object _value;
        private object _defaultValue;
        private bool _isEnabled;

        public string Id { get; set; }
        public string Key { get; set; }
        
        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public string Description { get; set; }
        public ParameterType Type { get; set; }
        public string Category { get; set; }
        
        public object Value
        {
            get => _value;
            set => SetProperty(ref _value, value);
        }
        
        public object DefaultValue
        {
            get => _defaultValue;
            set => SetProperty(ref _defaultValue, value);
        }
        
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public object MinValue { get; set; }
        public object MaxValue { get; set; }
        public List<object> AllowedValues { get; set; }
        public string Unit { get; set; }
        public string ValidationRegex { get; set; }
        public Dictionary<string, object> Options { get; set; }

        public SimulationParameter()
        {
            Id = Guid.NewGuid().ToString();
            IsEnabled = true;
            AllowedValues = new List<object>();
            Options = new Dictionary<string, object>();
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
    /// Represents a scenario within the simulation
    /// </summary>
    public class SimulationScenario : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private bool _isBaseline;
        private bool _isEnabled;
        private double _probability;

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
        
        public bool IsBaseline
        {
            get => _isBaseline;
            set => SetProperty(ref _isBaseline, value);
        }
        
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }
        
        public double Probability
        {
            get => _probability;
            set => SetProperty(ref _probability, Math.Max(0, Math.Min(1, value)));
        }

        public ScenarioType Type { get; set; }
        public Dictionary<string, object> ParameterOverrides { get; set; }
        public List<SimulationConstraint> Constraints { get; set; }
        public List<SimulationEvent> Events { get; set; }
        public SimulationOutcome PredictedOutcome { get; set; }

        public SimulationScenario()
        {
            Id = Guid.NewGuid().ToString();
            IsEnabled = true;
            Probability = 1.0;
            ParameterOverrides = new Dictionary<string, object>();
            Constraints = new List<SimulationConstraint>();
            Events = new List<SimulationEvent>();
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
    /// Represents simulation results and outcomes
    /// </summary>
    public class SimulationResults
    {
        public string Id { get; set; }
        public DateTime GeneratedDate { get; set; }
        public TimeSpan ExecutionTime { get; set; }
        public List<SimulationOutcome> Outcomes { get; set; }
        public Dictionary<string, double> Metrics { get; set; }
        public List<SimulationComparison> Comparisons { get; set; }
        public List<SimulationRisk> IdentifiedRisks { get; set; }
        public List<SimulationRecommendation> Recommendations { get; set; }
        public Dictionary<string, object> RawData { get; set; }

        public SimulationResults()
        {
            Id = Guid.NewGuid().ToString();
            GeneratedDate = DateTime.Now;
            Outcomes = new List<SimulationOutcome>();
            Metrics = new Dictionary<string, double>();
            Comparisons = new List<SimulationComparison>();
            IdentifiedRisks = new List<SimulationRisk>();
            Recommendations = new List<SimulationRecommendation>();
            RawData = new Dictionary<string, object>();
        }
    }

    /// <summary>
    /// Represents an outcome of a simulation scenario
    /// </summary>
    public class SimulationOutcome
    {
        public string Id { get; set; }
        public string ScenarioId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public OutcomeType Type { get; set; }
        public double Confidence { get; set; }
        public Dictionary<string, double> ImpactMetrics { get; set; }
        public List<string> AffectedEntities { get; set; }
        public RiskLevel RiskLevel { get; set; }
        public string Details { get; set; }

        public SimulationOutcome()
        {
            Id = Guid.NewGuid().ToString();
            ImpactMetrics = new Dictionary<string, double>();
            AffectedEntities = new List<string>();
        }
    }

    /// <summary>
    /// Represents a constraint in the simulation
    /// </summary>
    public class SimulationConstraint
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ConstraintType Type { get; set; }
        public string Expression { get; set; }
        public double Tolerance { get; set; }
        public bool IsHard { get; set; }
        public Dictionary<string, object> Parameters { get; set; }

        public SimulationConstraint()
        {
            Id = Guid.NewGuid().ToString();
            Parameters = new Dictionary<string, object>();
            IsHard = true;
        }
    }

    /// <summary>
    /// Represents an event in the simulation timeline
    /// </summary>
    public class SimulationEvent
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public EventType Type { get; set; }
        public DateTime ScheduledTime { get; set; }
        public TimeSpan Duration { get; set; }
        public double ImpactFactor { get; set; }
        public List<string> AffectedParameters { get; set; }
        public Dictionary<string, object> EventData { get; set; }

        public SimulationEvent()
        {
            Id = Guid.NewGuid().ToString();
            AffectedParameters = new List<string>();
            EventData = new Dictionary<string, object>();
            ImpactFactor = 1.0;
        }
    }

    /// <summary>
    /// Represents a comparison between scenarios
    /// </summary>
    public class SimulationComparison
    {
        public string Id { get; set; }
        public string BaselineScenarioId { get; set; }
        public string ComparisonScenarioId { get; set; }
        public string MetricName { get; set; }
        public double BaselineValue { get; set; }
        public double ComparisonValue { get; set; }
        public double PercentageChange { get; set; }
        public double AbsoluteChange { get; set; }
        public ComparisonResult Result { get; set; }
        public string Analysis { get; set; }

        public SimulationComparison()
        {
            Id = Guid.NewGuid().ToString();
        }
    }

    /// <summary>
    /// Represents a risk identified by the simulation
    /// </summary>
    public class SimulationRisk
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public SimulationRiskCategory Category { get; set; }
        public RiskLevel Level { get; set; }
        public double Probability { get; set; }
        public double Impact { get; set; }
        public List<string> AffectedScenarios { get; set; }
        public List<string> MitigationStrategies { get; set; }
        public string RecommendedAction { get; set; }

        public SimulationRisk()
        {
            Id = Guid.NewGuid().ToString();
            AffectedScenarios = new List<string>();
            MitigationStrategies = new List<string>();
        }
    }

    /// <summary>
    /// Represents a recommendation from the simulation
    /// </summary>
    public class SimulationRecommendation
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public RecommendationType Type { get; set; }
        public RecommendationPriority Priority { get; set; }
        public double ConfidenceScore { get; set; }
        public List<string> Benefits { get; set; }
        public List<string> Considerations { get; set; }
        public string ActionItems { get; set; }

        public SimulationRecommendation()
        {
            Id = Guid.NewGuid().ToString();
            Benefits = new List<string>();
            Considerations = new List<string>();
        }
    }

    #region Enums

    public enum SimulationStatus
    {
        Draft,
        Ready,
        Running,
        Completed,
        Failed,
        Cancelled,
        Archived
    }

    public enum ParameterType
    {
        String,
        Integer,
        Decimal,
        Boolean,
        DateTime,
        TimeSpan,
        Percentage,
        Currency,
        List,
        Dictionary
    }

    public enum ScenarioType
    {
        Baseline,
        Optimistic,
        Pessimistic,
        Conservative,
        Aggressive,
        Custom
    }

    public enum OutcomeType
    {
        Cost,
        Time,
        Risk,
        Performance,
        Capacity,
        Efficiency,
        Quality,
        Compliance
    }

    public enum RiskLevel
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum ConstraintType
    {
        Budget,
        Time,
        Resource,
        Capacity,
        Performance,
        Compliance,
        Quality,
        Custom
    }

    public enum EventType
    {
        Milestone,
        Issue,
        Change,
        Risk,
        Opportunity,
        External
    }

    public enum ComparisonResult
    {
        Better,
        Worse,
        Same,
        Mixed
    }

    public enum SimulationRiskCategory
    {
        Technical,
        Financial,
        Operational,
        Strategic,
        Compliance,
        Security,
        Performance
    }

    public enum RecommendationType
    {
        Optimization,
        RiskMitigation,
        CostReduction,
        Performance,
        Process,
        Technology,
        Strategy
    }

    public enum RecommendationPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    #endregion
}