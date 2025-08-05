using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MandADiscoverySuite.Services
{
    public enum FilterOperator
    {
        Contains,
        Equals,
        StartsWith,
        EndsWith,
        NotContains,
        NotEquals,
        GreaterThan,
        LessThan,
        GreaterThanOrEqual,
        LessThanOrEqual,
        IsEmpty,
        IsNotEmpty,
        Regex
    }

    public enum LogicalOperator
    {
        And,
        Or
    }

    public class SearchCriteria : INotifyPropertyChanged
    {
        private string _field;
        private FilterOperator _operator;
        private string _value;
        private bool _isEnabled = true;

        public string Field
        {
            get => _field;
            set { _field = value; OnPropertyChanged(nameof(Field)); }
        }

        public FilterOperator Operator
        {
            get => _operator;
            set { _operator = value; OnPropertyChanged(nameof(Operator)); }
        }

        public string Value
        {
            get => _value;
            set { _value = value; OnPropertyChanged(nameof(Value)); }
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set { _isEnabled = value; OnPropertyChanged(nameof(IsEnabled)); }
        }

        public string DisplayText => IsEnabled ? $"{Field} {GetOperatorDisplay()} '{Value}'" : $"[Disabled] {Field} {GetOperatorDisplay()} '{Value}'";

        private string GetOperatorDisplay()
        {
            return Operator switch
            {
                FilterOperator.Contains => "contains",
                FilterOperator.Equals => "equals",
                FilterOperator.StartsWith => "starts with",
                FilterOperator.EndsWith => "ends with",
                FilterOperator.NotContains => "does not contain",
                FilterOperator.NotEquals => "does not equal",
                FilterOperator.GreaterThan => ">",
                FilterOperator.LessThan => "<",
                FilterOperator.GreaterThanOrEqual => ">=",
                FilterOperator.LessThanOrEqual => "<=",
                FilterOperator.IsEmpty => "is empty",
                FilterOperator.IsNotEmpty => "is not empty",
                FilterOperator.Regex => "matches regex",
                _ => "unknown"
            };
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class SearchFilter : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private List<SearchCriteria> _criteria;
        private LogicalOperator _logicalOperator;
        private bool _isFavorite;
        private DateTime _created;
        private DateTime _lastUsed;

        public string Name
        {
            get => _name;
            set { _name = value; OnPropertyChanged(nameof(Name)); }
        }

        public string Description
        {
            get => _description;
            set { _description = value; OnPropertyChanged(nameof(Description)); }
        }

        public List<SearchCriteria> Criteria
        {
            get => _criteria ??= new List<SearchCriteria>();
            set { _criteria = value; OnPropertyChanged(nameof(Criteria)); }
        }

        public LogicalOperator LogicalOperator
        {
            get => _logicalOperator;
            set { _logicalOperator = value; OnPropertyChanged(nameof(LogicalOperator)); }
        }

        public bool IsFavorite
        {
            get => _isFavorite;
            set { _isFavorite = value; OnPropertyChanged(nameof(IsFavorite)); }
        }

        public DateTime Created
        {
            get => _created;
            set { _created = value; OnPropertyChanged(nameof(Created)); }
        }

        public DateTime LastUsed
        {
            get => _lastUsed;
            set { _lastUsed = value; OnPropertyChanged(nameof(LastUsed)); }
        }

        public string Summary => $"{Criteria.Count(c => c.IsEnabled)} active filter(s)";

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class AdvancedSearchService : INotifyPropertyChanged
    {
        private static AdvancedSearchService _instance;
        private readonly Dictionary<string, List<SearchFilter>> _savedFilters;
        private readonly Dictionary<string, List<string>> _fieldMappings;
        private readonly string _settingsPath;

        public static AdvancedSearchService Instance => _instance ??= new AdvancedSearchService();

        public Dictionary<string, List<SearchFilter>> SavedFilters => _savedFilters;
        public Dictionary<string, List<string>> FieldMappings => _fieldMappings;

        private AdvancedSearchService()
        {
            _settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite", "AdvancedSearch.json");
            _savedFilters = new Dictionary<string, List<SearchFilter>>();
            _fieldMappings = new Dictionary<string, List<string>>();

            InitializeFieldMappings();
            LoadSettings();
        }

        private void InitializeFieldMappings()
        {
            // Users field mappings
            _fieldMappings["Users"] = new List<string>
            {
                "Name", "Email", "UserPrincipalName", "Department", "JobTitle", 
                "City", "Status", "ManagerDisplayName", "LastSignInDateTime", 
                "GroupMembershipCount", "AccountEnabled"
            };

            // Infrastructure field mappings
            _fieldMappings["Infrastructure"] = new List<string>
            {
                "Name", "Type", "Status", "Location", "IPAddress", 
                "OperatingSystem", "Version", "LastSeen", "Description"
            };

            // Groups field mappings
            _fieldMappings["Groups"] = new List<string>
            {
                "DisplayName", "Description", "Type", "Mail", "MemberCount", 
                "OwnerCount", "CreatedDateTime", "Visibility"
            };
        }

        public IEnumerable<T> ApplyFilter<T>(IEnumerable<T> data, SearchFilter filter)
        {
            if (filter?.Criteria == null || !filter.Criteria.Any(c => c.IsEnabled))
                return data;

            return data.Where(item => EvaluateFilter(item, filter));
        }

        private bool EvaluateFilter<T>(T item, SearchFilter filter)
        {
            var enabledCriteria = filter.Criteria.Where(c => c.IsEnabled).ToList();
            if (!enabledCriteria.Any())
                return true;

            var results = enabledCriteria.Select(criteria => EvaluateCriteria(item, criteria)).ToList();

            return filter.LogicalOperator == LogicalOperator.And 
                ? results.All(r => r) 
                : results.Any(r => r);
        }

        private bool EvaluateCriteria<T>(T item, SearchCriteria criteria)
        {
            try
            {
                var property = typeof(T).GetProperty(criteria.Field);
                if (property == null)
                    return false;

                var value = property.GetValue(item)?.ToString() ?? "";
                var searchValue = criteria.Value ?? "";

                return criteria.Operator switch
                {
                    FilterOperator.Contains => value.Contains(searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.Equals => string.Equals(value, searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.StartsWith => value.StartsWith(searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.EndsWith => value.EndsWith(searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.NotContains => !value.Contains(searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.NotEquals => !string.Equals(value, searchValue, StringComparison.OrdinalIgnoreCase),
                    FilterOperator.GreaterThan => CompareNumericOrDate(value, searchValue, (a, b) => a > b),
                    FilterOperator.LessThan => CompareNumericOrDate(value, searchValue, (a, b) => a < b),
                    FilterOperator.GreaterThanOrEqual => CompareNumericOrDate(value, searchValue, (a, b) => a >= b),
                    FilterOperator.LessThanOrEqual => CompareNumericOrDate(value, searchValue, (a, b) => a <= b),
                    FilterOperator.IsEmpty => string.IsNullOrWhiteSpace(value),
                    FilterOperator.IsNotEmpty => !string.IsNullOrWhiteSpace(value),
                    FilterOperator.Regex => EvaluateRegex(value, searchValue),
                    _ => false
                };
            }
            catch
            {
                return false;
            }
        }

        private bool CompareNumericOrDate(string value, string searchValue, Func<double, double, bool> comparer)
        {
            // Try numeric comparison first
            if (double.TryParse(value, out var numValue) && double.TryParse(searchValue, out var numSearch))
            {
                return comparer(numValue, numSearch);
            }

            // Try date comparison
            if (DateTime.TryParse(value, out var dateValue) && DateTime.TryParse(searchValue, out var dateSearch))
            {
                return comparer(dateValue.Ticks, dateSearch.Ticks);
            }

            // Fallback to string comparison
            return comparer(string.Compare(value, searchValue, StringComparison.OrdinalIgnoreCase), 0);
        }

        private bool EvaluateRegex(string value, string pattern)
        {
            try
            {
                return Regex.IsMatch(value, pattern, RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        public void SaveFilter(string viewName, SearchFilter filter)
        {
            if (!_savedFilters.ContainsKey(viewName))
                _savedFilters[viewName] = new List<SearchFilter>();

            var existing = _savedFilters[viewName].FirstOrDefault(f => f.Name == filter.Name);
            if (existing != null)
            {
                _savedFilters[viewName].Remove(existing);
            }

            filter.Created = filter.Created == default ? DateTime.Now : filter.Created;
            filter.LastUsed = DateTime.Now;
            _savedFilters[viewName].Add(filter);
            
            SaveSettings();
            OnPropertyChanged(nameof(SavedFilters));
        }

        public void DeleteFilter(string viewName, string filterName)
        {
            if (_savedFilters.TryGetValue(viewName, out var filters))
            {
                filters.RemoveAll(f => f.Name == filterName);
                SaveSettings();
                OnPropertyChanged(nameof(SavedFilters));
            }
        }

        public SearchFilter GetFilter(string viewName, string filterName)
        {
            return _savedFilters.TryGetValue(viewName, out var filters) 
                ? filters.FirstOrDefault(f => f.Name == filterName) 
                : null;
        }

        public List<SearchFilter> GetFiltersForView(string viewName)
        {
            return _savedFilters.TryGetValue(viewName, out var filters) ? filters : new List<SearchFilter>();
        }

        public SearchFilter CreateQuickFilter(string field, FilterOperator op, string value)
        {
            return new SearchFilter
            {
                Name = $"Quick: {field} {op} {value}",
                Description = "Quick filter",
                LogicalOperator = LogicalOperator.And,
                Criteria = new List<SearchCriteria>
                {
                    new SearchCriteria { Field = field, Operator = op, Value = value, IsEnabled = true }
                }
            };
        }

        private void LoadSettings()
        {
            try
            {
                if (File.Exists(_settingsPath))
                {
                    var json = File.ReadAllText(_settingsPath);
                    var settings = JsonSerializer.Deserialize<Dictionary<string, List<SearchFilter>>>(json);
                    if (settings != null)
                    {
                        foreach (var kvp in settings)
                        {
                            _savedFilters[kvp.Key] = kvp.Value;
                        }
                    }
                }
            }
            catch
            {
                // Ignore load errors, use defaults
            }
        }

        private void SaveSettings()
        {
            try
            {
                var directory = Path.GetDirectoryName(_settingsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonSerializer.Serialize(_savedFilters, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_settingsPath, json);
            }
            catch
            {
                // Ignore save errors
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}