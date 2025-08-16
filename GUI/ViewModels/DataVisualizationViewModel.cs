using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Constants;

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
        public List<string> TimePeriods { get; } = AppConstants.TimePeriods.ToList();

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

            // Execute heavy data processing on background thread to avoid blocking UI
            Task.Run(() =>
            {
                try
                {
                    // Capture current state to avoid collection modification issues
                    var dataSnapshot = DataSource?.ToList() ?? new List<DiscoveryResult>();
                    var chartType = SelectedChartType;
                    
                    var filteredData = FilterDataByTimePeriod(dataSnapshot);
                    
                    // Process chart data on background thread
                    switch (chartType)
                    {
                        case AppConstants.ChartTypes.ModuleBreakdown:
                            GenerateModuleBreakdownChart(filteredData);
                            break;

                        case AppConstants.ChartTypes.ItemDistribution:
                            GenerateItemDistributionChart(filteredData);
                            break;

                        case AppConstants.ChartTypes.Timeline:
                            GenerateTimelineChart(filteredData);
                            break;

                        case AppConstants.ChartTypes.StatusOverview:
                            GenerateStatusOverviewChart(filteredData);
                            break;

                        case AppConstants.ChartTypes.Performance:
                            GeneratePerformanceChart(filteredData);
                            break;

                        case AppConstants.ChartTypes.Trends:
                            GenerateTrendsChart(filteredData);
                            break;
                    }

                    UpdateStatistics(filteredData);
                }
                catch (Exception ex)
                {
                    ErrorHandlingService.Instance.HandleException(ex, "Updating data visualization");
                }
            });
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
            var moduleGroups = data.GroupBy(r => r.DisplayName)
                                  .Select(g => new ChartDataPoint
                                  {
                                      Label = g.Key,
                                      Value = g.Sum(r => r.ItemCount),
                                      Color = GetModuleColor(g.Key),
                                      Category = "Module"
                                  })
                                  .OrderByDescending(p => p.Value)
                                  .Take(10)
                                  .ToList();

            if (ShowPercentages)
            {
                var total = moduleGroups.Sum(p => p.Value);
                foreach (var point in moduleGroups)
                {
                    point.Percentage = total > 0 ? (point.Value / total) * 100 : 0;
                }
            }

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                ChartData.Clear();
                foreach (var point in moduleGroups)
                {
                    ChartData.Add(point);
                }
            });
        }

        private void GenerateItemDistributionChart(IEnumerable<DiscoveryResult> data)
        {
            var ranges = AppConstants.DataRanges.ItemDistributionRanges;

            var chartPoints = new List<ChartDataPoint>();
            foreach (var range in ranges)
            {
                var count = data.Count(r => r.ItemCount >= range.Min && r.ItemCount <= range.Max);
                if (count > 0)
                {
                    chartPoints.Add(new ChartDataPoint
                    {
                        Label = range.Label,
                        Value = count,
                        Color = GetRangeColor(range.Label),
                        Category = "Range"
                    });
                }
            }

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                ChartData.Clear();
                foreach (var point in chartPoints)
                {
                    ChartData.Add(point);
                }
            });
        }

        private void GenerateTimelineChart(IEnumerable<DiscoveryResult> data)
        {
            var dailyData = data.GroupBy(r => r.DiscoveryTime.Date)
                               .Select(g => new TimeSeriesDataPoint
                               {
                                   Date = g.Key,
                                   Value = g.Sum(r => r.ItemCount),
                                   Count = g.Count()
                               })
                               .OrderBy(p => p.Date)
                               .ToList();

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                TimeSeriesData.Clear();
                foreach (var point in dailyData)
                {
                    TimeSeriesData.Add(point);
                }
            });
        }

        private void GenerateStatusOverviewChart(IEnumerable<DiscoveryResult> data)
        {
            var statusGroups = data.GroupBy(r => r.Status)
                                  .Select(g => new ChartDataPoint
                                  {
                                      Label = g.Key,
                                      Value = g.Count(),
                                      Color = GetStatusColor(g.Key),
                                      Category = "Status"
                                  })
                                  .ToList();

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                ChartData.Clear();
                foreach (var point in statusGroups)
                {
                    ChartData.Add(point);
                }
            });
        }

        private void GeneratePerformanceChart(IEnumerable<DiscoveryResult> data)
        {
            var performanceData = data.Where(r => r.Duration.TotalSeconds > 0)
                                     .Select(r => new ChartDataPoint
                                     {
                                         Label = r.DisplayName,
                                         Value = r.Duration.TotalMinutes,
                                         SecondaryValue = r.ItemCount / Math.Max(1, r.Duration.TotalMinutes), // Items per minute
                                         Color = GetModuleColor(r.DisplayName),
                                         Category = "Performance"
                                     })
                                     .OrderByDescending(p => p.SecondaryValue)
                                     .ToList();

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                ChartData.Clear();
                foreach (var point in performanceData)
                {
                    ChartData.Add(point);
                }
            });
        }

        private void GenerateTrendsChart(IEnumerable<DiscoveryResult> data)
        {
            var weeklyData = data.GroupBy(r => GetWeekStartDate(r.DiscoveryTime))
                                .Select(g => new TimeSeriesDataPoint
                                {
                                    Date = g.Key,
                                    Value = g.Sum(r => r.ItemCount),
                                    Count = g.Count(),
                                    AverageValue = g.Average(r => r.ItemCount)
                                })
                                .OrderBy(p => p.Date)
                                .ToList();

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                TimeSeriesData.Clear();
                foreach (var point in weeklyData)
                {
                    TimeSeriesData.Add(point);
                }
            });
        }

        private void UpdateStatistics(IEnumerable<DiscoveryResult> data)
        {
            var dataList = data.ToList();
            
            var statisticItems = new List<StatisticItem>
            {
                new StatisticItem("Total Items", dataList.Sum(r => r.ItemCount).ToString("N0"), "📊"),
                new StatisticItem("Total Modules", dataList.Count.ToString(), "🔧"),
                new StatisticItem("Avg Items/Module", dataList.Count > 0 ? (dataList.Sum(r => r.ItemCount) / (double)dataList.Count).ToString("N0") : "0", "📈"),
                new StatisticItem("Success Rate", dataList.Count > 0 ? $"{(dataList.Count(r => r.Status == "Completed") / (double)dataList.Count * 100):F1}%" : "0%", "✅")
            };
            
            if (dataList.Any())
            {
                statisticItems.Add(new StatisticItem("Latest Discovery", dataList.Max(r => r.DiscoveryTime).ToString("yyyy-MM-dd HH:mm"), "🕐"));
                var largestModule = dataList.OrderByDescending(r => r.ItemCount).FirstOrDefault();
                if (largestModule != null)
                    statisticItems.Add(new StatisticItem("Largest Module", largestModule.DisplayName, "🎯"));
            }

            // Update UI on main thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                Statistics.Clear();
                foreach (var item in statisticItems)
                {
                    Statistics.Add(item);
                }
            });
        }

        private string GetModuleColor(string moduleName)
        {
            var colors = AppConstants.Colors.ChartPalette;
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
                "Completed" => AppConstants.Colors.StatusCompleted,
                "Failed" => AppConstants.Colors.StatusFailed,
                "Running" => AppConstants.Colors.StatusRunning,
                "Cancelled" => AppConstants.Colors.StatusCancelled,
                _ => AppConstants.Colors.StatusDisabled
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
            try
            {
                var saveDialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "CSV files (*.csv)|*.csv|JSON files (*.json)|*.json|All files (*.*)|*.*",
                    FileName = $"ChartData_{DateTime.Now:yyyyMMdd_HHmmss}"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    var extension = System.IO.Path.GetExtension(saveDialog.FileName).ToLower();
                    if (extension == ".json")
                    {
                        ExportToJson(saveDialog.FileName);
                    }
                    else
                    {
                        ExportToCsv(saveDialog.FileName);
                    }
                    
                    MessageBox.Show("Chart data exported successfully!", "Export Complete", 
                                  MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Exporting chart data", true);
            }
        }
        
        private void ExportToCsv(string filePath)
        {
            var lines = new List<string> { "Label,Value,Category,Percentage" };
            
            foreach (var point in ChartData)
            {
                lines.Add($"{EscapeCsv(point.Label)},{point.Value},{EscapeCsv(point.Category)},{point.Percentage:F2}");
            }
            
            System.IO.File.WriteAllLines(filePath, lines);
        }
        
        private void ExportToJson(string filePath)
        {
            var data = ChartData.Select(p => new
            {
                Label = p.Label,
                Value = p.Value,
                Category = p.Category,
                Percentage = p.Percentage,
                Color = p.Color
            }).ToList();
            
            var json = System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });
            
            System.IO.File.WriteAllText(filePath, json);
        }
        
        private string EscapeCsv(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\";";
            }
            return value;
        }

        private void DrillDown(ChartDataPoint dataPoint)
        {
            if (dataPoint == null) return;
            
            try
            {
                // Filter data source to show only items related to the selected data point
                var filteredResults = new List<DiscoveryResult>();
                
                if (DataSource != null)
                {
                    switch (dataPoint.Category)
                    {
                        case "Module":
                            filteredResults = DataSource.Where(r => r.DisplayName == dataPoint.Label).ToList();
                            break;
                        case "Status":
                            filteredResults = DataSource.Where(r => r.Status == dataPoint.Label).ToList();
                            break;
                        case "Range":
                            // Parse range and filter by item count
                            var (min, max) = ParseRange(dataPoint.Label);
                            filteredResults = DataSource.Where(r => r.ItemCount >= min && r.ItemCount <= max).ToList();
                            break;
                        default:
                            filteredResults = DataSource.ToList();
                            break;
                    }
                }
                
                // Show filtered results in a message box for now
                // In a full implementation, this would open a detailed view window
                var message = $"Drill-down for {dataPoint.Label}:\n\n";
                message += $"Total Results: {filteredResults.Count}\n";
                message += $"Total Items: {filteredResults.Sum(r => r.ItemCount):N0}\n\n";
                
                if (filteredResults.Any())
                {
                    message += "Top 5 Results:\n";
                    foreach (var result in filteredResults.OrderByDescending(r => r.ItemCount).Take(5))
                    {
                        message += $"- {result.DisplayName}: {result.ItemCount:N0} items\n";
                    }
                }
                
                MessageBox.Show(message, $"Drill-down: {dataPoint.Label}", 
                              MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                ErrorHandlingService.Instance.HandleException(ex, "Chart drill-down", true);
            }
        }
        
        private (int min, int max) ParseRange(string range)
        {
            var rangeData = AppConstants.DataRanges.ItemDistributionRanges
                .FirstOrDefault(r => r.Label == range);
            
            return rangeData.Label != null ? (rangeData.Min, rangeData.Max) : (0, int.MaxValue);
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