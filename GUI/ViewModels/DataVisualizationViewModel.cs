using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// View model for data visualization and analytics
    /// </summary>
    public class DataVisualizationViewModel : BaseViewModel
    {
        #region Private Fields

        private string _selectedChartType = "ModuleBreakdown";
        private string _selectedTimePeriod = "All";
        private bool _showPercentages = true;
        private ObservableCollection<DiscoveryResult> _dataSource;

        #endregion

        #region Properties

        /// <summary>
        /// Data source for visualizations
        /// </summary>
        public ObservableCollection<DiscoveryResult> DataSource
        {
            get => _dataSource;
            set => SetProperty(ref _dataSource, value, OnDataSourceChanged);
        }

        /// <summary>
        /// Selected chart type
        /// </summary>
        public string SelectedChartType
        {
            get => _selectedChartType;
            set => SetProperty(ref _selectedChartType, value, OnVisualizationChanged);
        }

        /// <summary>
        /// Selected time period for filtering
        /// </summary>
        public string SelectedTimePeriod
        {
            get => _selectedTimePeriod;
            set => SetProperty(ref _selectedTimePeriod, value, OnVisualizationChanged);
        }

        /// <summary>
        /// Whether to show percentages in charts
        /// </summary>
        public bool ShowPercentages
        {
            get => _showPercentages;
            set => SetProperty(ref _showPercentages, value, OnVisualizationChanged);
        }

        /// <summary>
        /// Chart data for current visualization
        /// </summary>
        public ObservableCollection<ChartDataPoint> ChartData { get; } = new ObservableCollection<ChartDataPoint>();

        /// <summary>
        /// Time series data for trend analysis
        /// </summary>
        public ObservableCollection<TimeSeriesDataPoint> TimeSeriesData { get; } = new ObservableCollection<TimeSeriesDataPoint>();

        /// <summary>
        /// Summary statistics
        /// </summary>
        public ObservableCollection<StatisticItem> Statistics { get; } = new ObservableCollection<StatisticItem>();

        /// <summary>
        /// Available chart types
        /// </summary>
        public List<ChartTypeOption> ChartTypes { get; } = new List<ChartTypeOption>
        {
            new ChartTypeOption("Module Breakdown", "ModuleBreakdown", "📊"),
            new ChartTypeOption("Item Count Distribution", "ItemDistribution", "📈"),
            new ChartTypeOption("Discovery Timeline", "Timeline", "📅"),
            new ChartTypeOption("Status Overview", "StatusOverview", "🔍"),
            new ChartTypeOption("Performance Analysis", "Performance", "⚡"),
            new ChartTypeOption("Trends Over Time", "Trends", "📉")
        };

        /// <summary>
        /// Available time periods
        /// </summary>
        public List<string> TimePeriods { get; } = new List<string>
        {
            "All",
            "Last 24 Hours",
            "Last 7 Days",
            "Last 30 Days",
            "Last 90 Days"
        };

        /// <summary>
        /// Total items discovered
        /// </summary>
        public int TotalItems => DataSource?.Sum(r => r.ItemCount) ?? 0;

        /// <summary>
        /// Total modules run
        /// </summary>
        public int TotalModules => DataSource?.Count ?? 0;

        /// <summary>
        /// Average items per module
        /// </summary>
        public double AverageItemsPerModule => TotalModules > 0 ? (double)TotalItems / TotalModules : 0;

        /// <summary>
        /// Most recent discovery time
        /// </summary>
        public DateTime? LastDiscoveryTime => DataSource?.Max(r => r.DiscoveryTime);

        #endregion

        #region Commands

        public ICommand RefreshDataCommand { get; }
        public ICommand ExportChartCommand { get; }
        public ICommand DrillDownCommand { get; }

        #endregion

        #region Constructor

        public DataVisualizationViewModel()
        {
            RefreshDataCommand = new RelayCommand(RefreshData);
            ExportChartCommand = new RelayCommand(ExportChart);
            DrillDownCommand = new RelayCommand<ChartDataPoint>(DrillDown);
        }

        #endregion

        #region Methods

        /// <summary>
        /// Updates the visualization with new data
        /// </summary>
        public void UpdateVisualization()
        {
            if (DataSource == null || !DataSource.Any())
            {
                ChartData.Clear();
                TimeSeriesData.Clear();
                Statistics.Clear();
                return;
            }

            var filteredData = FilterDataByTimePeriod(DataSource);
            
            switch (SelectedChartType)
            {
                case "ModuleBreakdown":
                    GenerateModuleBreakdownChart(filteredData);
                    break;

                case "ItemDistribution":
                    GenerateItemDistributionChart(filteredData);
                    break;

                case "Timeline":
                    GenerateTimelineChart(filteredData);
                    break;

                case "StatusOverview":
                    GenerateStatusOverviewChart(filteredData);
                    break;

                case "Performance":
                    GeneratePerformanceChart(filteredData);
                    break;

                case "Trends":
                    GenerateTrendsChart(filteredData);
                    break;
            }

            UpdateStatistics(filteredData);
        }

        private IEnumerable<DiscoveryResult> FilterDataByTimePeriod(IEnumerable<DiscoveryResult> data)
        {
            var cutoffDate = SelectedTimePeriod switch
            {
                "Last 24 Hours" => DateTime.Now.AddDays(-1),
                "Last 7 Days" => DateTime.Now.AddDays(-7),
                "Last 30 Days" => DateTime.Now.AddDays(-30),
                "Last 90 Days" => DateTime.Now.AddDays(-90),
                _ => DateTime.MinValue
            };

            return cutoffDate == DateTime.MinValue 
                ? data 
                : data.Where(r => r.DiscoveryTime >= cutoffDate);
        }

        private void GenerateModuleBreakdownChart(IEnumerable<DiscoveryResult> data)
        {
            ChartData.Clear();
            
            var moduleGroups = data.GroupBy(r => r.DisplayName)
                                  .Select(g => new ChartDataPoint
                                  {
                                      Label = g.Key,
                                      Value = g.Sum(r => r.ItemCount),
                                      Color = GetModuleColor(g.Key),
                                      Category = "Module"
                                  })
                                  .OrderByDescending(p => p.Value)
                                  .Take(10);

            foreach (var point in moduleGroups)
            {
                ChartData.Add(point);
            }

            if (ShowPercentages)
            {
                var total = ChartData.Sum(p => p.Value);
                foreach (var point in ChartData)
                {
                    point.Percentage = total > 0 ? (point.Value / total) * 100 : 0;
                }
            }
        }

        private void GenerateItemDistributionChart(IEnumerable<DiscoveryResult> data)
        {
            ChartData.Clear();
            
            var ranges = new[]
            {
                new { Label = "0-100", Min = 0, Max = 100 },
                new { Label = "101-1K", Min = 101, Max = 1000 },
                new { Label = "1K-10K", Min = 1001, Max = 10000 },
                new { Label = "10K-100K", Min = 10001, Max = 100000 },
                new { Label = "100K+", Min = 100001, Max = int.MaxValue }
            };

            foreach (var range in ranges)
            {
                var count = data.Count(r => r.ItemCount >= range.Min && r.ItemCount <= range.Max);
                if (count > 0)
                {
                    ChartData.Add(new ChartDataPoint
                    {
                        Label = range.Label,
                        Value = count,
                        Color = GetRangeColor(range.Label),
                        Category = "Range"
                    });
                }
            }
        }

        private void GenerateTimelineChart(IEnumerable<DiscoveryResult> data)
        {
            TimeSeriesData.Clear();
            
            var dailyData = data.GroupBy(r => r.DiscoveryTime.Date)
                               .Select(g => new TimeSeriesDataPoint
                               {
                                   Date = g.Key,
                                   Value = g.Sum(r => r.ItemCount),
                                   Count = g.Count()
                               })
                               .OrderBy(p => p.Date);

            foreach (var point in dailyData)
            {
                TimeSeriesData.Add(point);
            }
        }

        private void GenerateStatusOverviewChart(IEnumerable<DiscoveryResult> data)
        {
            ChartData.Clear();
            
            var statusGroups = data.GroupBy(r => r.Status)
                                  .Select(g => new ChartDataPoint
                                  {
                                      Label = g.Key,
                                      Value = g.Count(),
                                      Color = GetStatusColor(g.Key),
                                      Category = "Status"
                                  });

            foreach (var point in statusGroups)
            {
                ChartData.Add(point);
            }
        }

        private void GeneratePerformanceChart(IEnumerable<DiscoveryResult> data)
        {
            ChartData.Clear();
            
            var performanceData = data.Where(r => r.Duration.TotalSeconds > 0)
                                     .Select(r => new ChartDataPoint
                                     {
                                         Label = r.DisplayName,
                                         Value = r.Duration.TotalMinutes,
                                         SecondaryValue = r.ItemCount / Math.Max(1, r.Duration.TotalMinutes), // Items per minute
                                         Color = GetModuleColor(r.DisplayName),
                                         Category = "Performance"
                                     })
                                     .OrderByDescending(p => p.SecondaryValue);

            foreach (var point in performanceData)
            {
                ChartData.Add(point);
            }
        }

        private void GenerateTrendsChart(IEnumerable<DiscoveryResult> data)
        {
            TimeSeriesData.Clear();
            
            var weeklyData = data.GroupBy(r => GetWeekStartDate(r.DiscoveryTime))
                                .Select(g => new TimeSeriesDataPoint
                                {
                                    Date = g.Key,
                                    Value = g.Sum(r => r.ItemCount),
                                    Count = g.Count(),
                                    AverageValue = g.Average(r => r.ItemCount)
                                })
                                .OrderBy(p => p.Date);

            foreach (var point in weeklyData)
            {
                TimeSeriesData.Add(point);
            }
        }

        private void UpdateStatistics(IEnumerable<DiscoveryResult> data)
        {
            Statistics.Clear();
            
            var dataList = data.ToList();
            
            Statistics.Add(new StatisticItem("Total Items", dataList.Sum(r => r.ItemCount).ToString("N0"), "📊"));
            Statistics.Add(new StatisticItem("Total Modules", dataList.Count.ToString(), "🔧"));
            Statistics.Add(new StatisticItem("Avg Items/Module", dataList.Count > 0 ? (dataList.Sum(r => r.ItemCount) / (double)dataList.Count).ToString("N0") : "0", "📈"));
            Statistics.Add(new StatisticItem("Success Rate", dataList.Count > 0 ? $"{(dataList.Count(r => r.Status == "Completed") / (double)dataList.Count * 100):F1}%" : "0%", "✅"));
            
            if (dataList.Any())
            {
                Statistics.Add(new StatisticItem("Latest Discovery", dataList.Max(r => r.DiscoveryTime).ToString("yyyy-MM-dd HH:mm"), "🕐"));
                Statistics.Add(new StatisticItem("Largest Module", dataList.OrderByDescending(r => r.ItemCount).First().DisplayName, "🎯"));
            }
        }

        private string GetModuleColor(string moduleName)
        {
            var colors = new[]
            {
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                "#FF9F40", "#FF6384", "#C9CBCF", "#4BC0C0", "#FF6384"
            };
            
            return colors[Math.Abs(moduleName.GetHashCode()) % colors.Length];
        }

        private string GetRangeColor(string range)
        {
            return range switch
            {
                "0-100" => "#36A2EB",
                "101-1K" => "#FFCE56",
                "1K-10K" => "#4BC0C0",
                "10K-100K" => "#9966FF",
                "100K+" => "#FF6384",
                _ => "#C9CBCF"
            };
        }

        private string GetStatusColor(string status)
        {
            return status switch
            {
                "Completed" => "#4BC0C0",
                "Failed" => "#FF6384",
                "Running" => "#36A2EB",
                "Cancelled" => "#FFCE56",
                _ => "#C9CBCF"
            };
        }

        private DateTime GetWeekStartDate(DateTime date)
        {
            var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.AddDays(-1 * diff).Date;
        }

        private void OnDataSourceChanged()
        {
            UpdateVisualization();
            OnPropertiesChanged(nameof(TotalItems), nameof(TotalModules), nameof(AverageItemsPerModule), nameof(LastDiscoveryTime));
        }

        private void OnVisualizationChanged()
        {
            UpdateVisualization();
        }

        private void RefreshData()
        {
            UpdateVisualization();
        }

        private void ExportChart()
        {
            // TODO: Implement chart export functionality
            // This could export to PNG, PDF, or Excel formats
        }

        private void DrillDown(ChartDataPoint dataPoint)
        {
            if (dataPoint != null)
            {
                // TODO: Implement drill-down functionality
                // This could show detailed data for the selected point
            }
        }

        #endregion
    }

    /// <summary>
    /// Chart data point for visualizations
    /// </summary>
    public class ChartDataPoint : BaseViewModel
    {
        private string _label;
        private double _value;
        private double _secondaryValue;
        private string _color;
        private string _category;
        private double _percentage;

        public string Label
        {
            get => _label;
            set => SetProperty(ref _label, value);
        }

        public double Value
        {
            get => _value;
            set => SetProperty(ref _value, value);
        }

        public double SecondaryValue
        {
            get => _secondaryValue;
            set => SetProperty(ref _secondaryValue, value);
        }

        public string Color
        {
            get => _color;
            set => SetProperty(ref _color, value);
        }

        public string Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public double Percentage
        {
            get => _percentage;
            set => SetProperty(ref _percentage, value);
        }

        public string DisplayText => $"{Label}: {Value:N0}";
        public string PercentageText => $"{Percentage:F1}%";
    }

    /// <summary>
    /// Time series data point for trend analysis
    /// </summary>
    public class TimeSeriesDataPoint : BaseViewModel
    {
        private DateTime _date;
        private double _value;
        private int _count;
        private double _averageValue;

        public DateTime Date
        {
            get => _date;
            set => SetProperty(ref _date, value);
        }

        public double Value
        {
            get => _value;
            set => SetProperty(ref _value, value);
        }

        public int Count
        {
            get => _count;
            set => SetProperty(ref _count, value);
        }

        public double AverageValue
        {
            get => _averageValue;
            set => SetProperty(ref _averageValue, value);
        }

        public string DateText => Date.ToString("yyyy-MM-dd");
    }

    /// <summary>
    /// Statistic item for summary display
    /// </summary>
    public class StatisticItem
    {
        public string Name { get; }
        public string Value { get; }
        public string Icon { get; }

        public StatisticItem(string name, string value, string icon)
        {
            Name = name;
            Value = value;
            Icon = icon;
        }
    }

    /// <summary>
    /// Chart type option for dropdown
    /// </summary>
    public class ChartTypeOption
    {
        public string DisplayName { get; }
        public string Key { get; }
        public string Icon { get; }

        public ChartTypeOption(string displayName, string key, string icon)
        {
            DisplayName = displayName;
            Key = key;
            Icon = icon;
        }

        public override string ToString() => $"{Icon} {DisplayName}";
    }
}