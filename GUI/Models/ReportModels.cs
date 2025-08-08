using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    public class ReportDefinition : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private ReportType _reportType;
        private bool _isTemplate;

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

        public ReportType ReportType
        {
            get => _reportType;
            set => SetProperty(ref _reportType, value);
        }

        public bool IsTemplate
        {
            get => _isTemplate;
            set => SetProperty(ref _isTemplate, value);
        }

        public List<ReportDataSource> DataSources { get; set; }
        public List<ReportColumn> Columns { get; set; }
        public List<ReportFilter> Filters { get; set; }
        public List<ReportGrouping> Groupings { get; set; }
        public List<ReportSorting> Sorting { get; set; }
        public ReportFormatting Formatting { get; set; }
        public ReportLayout Layout { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string Category { get; set; }
        public List<string> Tags { get; set; }

        public ReportDefinition()
        {
            Id = Guid.NewGuid().ToString();
            DataSources = new List<ReportDataSource>();
            Columns = new List<ReportColumn>();
            Filters = new List<ReportFilter>();
            Groupings = new List<ReportGrouping>();
            Sorting = new List<ReportSorting>();
            Tags = new List<string>();
            CreatedDate = DateTime.Now;
            ModifiedDate = DateTime.Now;
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

    public enum ReportType
    {
        Table,
        Chart,
        Dashboard,
        Summary,
        Detail,
        Comparison,
        Timeline,
        Matrix,
        KPI
    }

    public class ReportDataSource
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DataSourceType Type { get; set; }
        public string ConnectionString { get; set; }
        public string Query { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public bool IsActive { get; set; }

        public ReportDataSource()
        {
            Id = Guid.NewGuid().ToString();
            Parameters = new Dictionary<string, object>();
            IsActive = true;
        }
    }

    public enum DataSourceType
    {
        Users,
        Groups,
        Computers,
        Applications,
        Infrastructure,
        MigrationWaves,
        DiscoveryResults,
        Custom
    }

    public class ReportColumn : INotifyPropertyChanged
    {
        private string _displayName;
        private bool _isVisible;
        private int _width;
        private int _order;

        public string Id { get; set; }
        public string FieldName { get; set; }
        
        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public ReportColumnType ColumnType { get; set; }
        public string DataType { get; set; }
        
        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        public int Width
        {
            get => _width;
            set => SetProperty(ref _width, value);
        }

        public int Order
        {
            get => _order;
            set => SetProperty(ref _order, value);
        }

        public string Format { get; set; }
        public ReportColumnAlignment Alignment { get; set; }
        public ReportAggregationType AggregationType { get; set; }
        public string Expression { get; set; }
        public ReportColumnFormatting Formatting { get; set; }

        public ReportColumn()
        {
            Id = Guid.NewGuid().ToString();
            IsVisible = true;
            Width = 100;
            Alignment = ReportColumnAlignment.Left;
            AggregationType = ReportAggregationType.None;
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

    public enum ReportColumnType
    {
        Data,
        Calculated,
        Aggregated,
        Index,
        Image,
        Hyperlink
    }

    public enum ReportColumnAlignment
    {
        Left,
        Center,
        Right,
        Justify
    }

    public enum ReportAggregationType
    {
        None,
        Count,
        Sum,
        Average,
        Min,
        Max,
        First,
        Last,
        CountDistinct
    }

    public class ReportColumnFormatting
    {
        public string FontFamily { get; set; }
        public double FontSize { get; set; }
        public bool IsBold { get; set; }
        public bool IsItalic { get; set; }
        public string ForegroundColor { get; set; }
        public string BackgroundColor { get; set; }
        public List<ReportConditionalFormatting> ConditionalFormats { get; set; }

        public ReportColumnFormatting()
        {
            ConditionalFormats = new List<ReportConditionalFormatting>();
        }
    }

    public class ReportConditionalFormatting
    {
        public string Condition { get; set; }
        public object Value { get; set; }
        public string ForegroundColor { get; set; }
        public string BackgroundColor { get; set; }
        public bool IsBold { get; set; }
        public bool IsItalic { get; set; }
    }

    public class ReportFilter : INotifyPropertyChanged
    {
        private bool _isEnabled;
        private string _value;

        public string Id { get; set; }
        public string FieldName { get; set; }
        public string DisplayName { get; set; }
        public ReportFilterOperator Operator { get; set; }
        
        public string Value
        {
            get => _value;
            set => SetProperty(ref _value, value);
        }

        public string Value2 { get; set; } // For between operations
        public ReportFilterType FilterType { get; set; }
        public List<object> AvailableValues { get; set; }
        
        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public bool IsUserEditable { get; set; }
        public bool IsRequired { get; set; }
        public string DefaultValue { get; set; }

        public ReportFilter()
        {
            Id = Guid.NewGuid().ToString();
            AvailableValues = new List<object>();
            IsEnabled = true;
            IsUserEditable = true;
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

    public enum ReportFilterOperator
    {
        Equals,
        NotEquals,
        Contains,
        NotContains,
        StartsWith,
        EndsWith,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
        Between,
        In,
        NotIn,
        IsNull,
        IsNotNull
    }

    public enum ReportFilterType
    {
        TextBox,
        DropDown,
        MultiSelect,
        DatePicker,
        DateRange,
        Checkbox,
        RadioButton,
        Slider
    }

    public class ReportGrouping
    {
        public string Id { get; set; }
        public string FieldName { get; set; }
        public string DisplayName { get; set; }
        public int Level { get; set; }
        public ReportSortDirection SortDirection { get; set; }
        public bool ShowGroupHeader { get; set; }
        public bool ShowGroupFooter { get; set; }
        public List<ReportAggregation> Aggregations { get; set; }

        public ReportGrouping()
        {
            Id = Guid.NewGuid().ToString();
            ShowGroupHeader = true;
            Aggregations = new List<ReportAggregation>();
        }
    }

    public class ReportAggregation
    {
        public string FieldName { get; set; }
        public ReportAggregationType AggregationType { get; set; }
        public string DisplayName { get; set; }
        public string Format { get; set; }
    }

    public class ReportSorting
    {
        public string Id { get; set; }
        public string FieldName { get; set; }
        public ReportSortDirection Direction { get; set; }
        public int Priority { get; set; }

        public ReportSorting()
        {
            Id = Guid.NewGuid().ToString();
        }
    }

    public enum ReportSortDirection
    {
        Ascending,
        Descending
    }

    public class ReportFormatting
    {
        public string Title { get; set; }
        public string FontFamily { get; set; }
        public double TitleFontSize { get; set; }
        public double HeaderFontSize { get; set; }
        public double DataFontSize { get; set; }
        public string Theme { get; set; }
        public bool ShowGridLines { get; set; }
        public bool AlternateRowColors { get; set; }
        public string HeaderBackgroundColor { get; set; }
        public string EvenRowColor { get; set; }
        public string OddRowColor { get; set; }
        public ReportPageSettings PageSettings { get; set; }

        public ReportFormatting()
        {
            FontFamily = "Segoe UI";
            TitleFontSize = 16;
            HeaderFontSize = 12;
            DataFontSize = 10;
            ShowGridLines = true;
            AlternateRowColors = true;
            PageSettings = new ReportPageSettings();
        }
    }

    public class ReportPageSettings
    {
        public ReportPageSize PageSize { get; set; }
        public ReportPageOrientation Orientation { get; set; }
        public double MarginTop { get; set; }
        public double MarginBottom { get; set; }
        public double MarginLeft { get; set; }
        public double MarginRight { get; set; }
        public bool ShowHeader { get; set; }
        public bool ShowFooter { get; set; }
        public string HeaderText { get; set; }
        public string FooterText { get; set; }

        public ReportPageSettings()
        {
            PageSize = ReportPageSize.A4;
            Orientation = ReportPageOrientation.Portrait;
            MarginTop = 1.0;
            MarginBottom = 1.0;
            MarginLeft = 1.0;
            MarginRight = 1.0;
            ShowHeader = true;
            ShowFooter = true;
        }
    }

    public enum ReportPageSize
    {
        A4,
        A3,
        Letter,
        Legal,
        Tabloid,
        Custom
    }

    public enum ReportPageOrientation
    {
        Portrait,
        Landscape
    }

    public class ReportLayout
    {
        public ReportLayoutType LayoutType { get; set; }
        public int ColumnsPerPage { get; set; }
        public bool RepeatHeaders { get; set; }
        public bool KeepGroupsTogether { get; set; }
        public double RowHeight { get; set; }
        public double GroupHeaderHeight { get; set; }
        public double GroupFooterHeight { get; set; }

        public ReportLayout()
        {
            LayoutType = ReportLayoutType.Tabular;
            ColumnsPerPage = 1;
            RepeatHeaders = true;
            RowHeight = 20;
            GroupHeaderHeight = 25;
            GroupFooterHeight = 20;
        }
    }

    public enum ReportLayoutType
    {
        Tabular,
        Columnar,
        Matrix,
        Freeform,
        Chart
    }

    public class ReportExecution
    {
        public string Id { get; set; }
        public string ReportId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public ReportExecutionStatus Status { get; set; }
        public string ErrorMessage { get; set; }
        public int RecordCount { get; set; }
        public long FileSizeBytes { get; set; }
        public string OutputFormat { get; set; }
        public string OutputPath { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
        public string ExecutedBy { get; set; }

        public ReportExecution()
        {
            Id = Guid.NewGuid().ToString();
            Parameters = new Dictionary<string, object>();
            StartTime = DateTime.Now;
        }
    }

    public enum ReportExecutionStatus
    {
        Queued,
        Running,
        Completed,
        Failed,
        Cancelled
    }

    public class ReportTemplate
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public ReportDefinition Definition { get; set; }
        public string PreviewImagePath { get; set; }
        public bool IsBuiltIn { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<string> Tags { get; set; }

        public ReportTemplate()
        {
            Id = Guid.NewGuid().ToString();
            Tags = new List<string>();
            CreatedDate = DateTime.Now;
        }
    }

    public class ReportSchedule
    {
        public string Id { get; set; }
        public string ReportId { get; set; }
        public string Name { get; set; }
        public bool IsEnabled { get; set; }
        public ReportScheduleType ScheduleType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public TimeSpan ExecutionTime { get; set; }
        public int IntervalValue { get; set; }
        public List<DayOfWeek> DaysOfWeek { get; set; }
        public List<int> DaysOfMonth { get; set; }
        public List<string> Recipients { get; set; }
        public ReportOutputFormat OutputFormat { get; set; }
        public string OutputPath { get; set; }
        public DateTime? LastExecution { get; set; }
        public DateTime? NextExecution { get; set; }

        public ReportSchedule()
        {
            Id = Guid.NewGuid().ToString();
            DaysOfWeek = new List<DayOfWeek>();
            DaysOfMonth = new List<int>();
            Recipients = new List<string>();
            OutputFormat = ReportOutputFormat.PDF;
        }
    }

    public enum ReportScheduleType
    {
        Once,
        Daily,
        Weekly,
        Monthly,
        Quarterly,
        Yearly
    }

    public enum ReportOutputFormat
    {
        PDF,
        Excel,
        CSV,
        Word,
        HTML,
        XML,
        JSON
    }

    public class ReportParameter : INotifyPropertyChanged
    {
        private object _value;
        private bool _isRequired;

        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public ReportParameterType ParameterType { get; set; }
        
        public object Value
        {
            get => _value;
            set => SetProperty(ref _value, value);
        }

        public object DefaultValue { get; set; }
        public List<object> AvailableValues { get; set; }
        
        public bool IsRequired
        {
            get => _isRequired;
            set => SetProperty(ref _isRequired, value);
        }

        public bool IsVisible { get; set; }
        public int DisplayOrder { get; set; }

        public ReportParameter()
        {
            AvailableValues = new List<object>();
            IsVisible = true;
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

    public enum ReportParameterType
    {
        String,
        Integer,
        Decimal,
        Boolean,
        DateTime,
        DropDown,
        MultiSelect
    }
}