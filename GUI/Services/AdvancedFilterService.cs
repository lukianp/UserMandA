using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    public class AdvancedFilterService : IAdvancedFilterService
    {
        private readonly ILogger<AdvancedFilterService> _logger;
        private readonly string _filtersDirectory;
        private readonly JsonSerializerOptions _jsonOptions;

        public AdvancedFilterService(ILogger<AdvancedFilterService> logger = null)
        {
            _logger = logger;
            _filtersDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                "MandADiscoverySuite", "Filters");
            
            EnsureFiltersDirectoryExists();
            
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<IEnumerable<T>> ApplyFiltersAsync<T>(IEnumerable<T> data, FilterConfiguration filterConfig)
        {
            if (data == null || !data.Any() || filterConfig == null || !filterConfig.Rules.Any(r => r.IsEnabled))
            {
                return data ?? Enumerable.Empty<T>();
            }

            try
            {
                var enabledRules = filterConfig.Rules.Where(r => r.IsEnabled).ToList();
                if (!enabledRules.Any())
                {
                    return data;
                }

                var filteredData = data.AsQueryable();

                // Build the predicate based on filter logic
                var predicate = BuildPredicate<T>(enabledRules, filterConfig.Logic);
                
                if (predicate != null)
                {
                    filteredData = filteredData.Where(predicate);
                }

                return await Task.FromResult(filteredData.AsEnumerable());
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error applying filters");
                return data; // Return original data if filtering fails
            }
        }

        private Expression<Func<T, bool>> BuildPredicate<T>(List<FilterRule> rules, FilterLogic logic)
        {
            if (!rules.Any())
                return null;

            var parameter = Expression.Parameter(typeof(T), "x");
            Expression combinedExpression = null;

            foreach (var rule in rules)
            {
                var ruleExpression = BuildRuleExpression<T>(parameter, rule);
                if (ruleExpression == null) continue;

                if (combinedExpression == null)
                {
                    combinedExpression = ruleExpression;
                }
                else
                {
                    combinedExpression = logic == FilterLogic.And
                        ? Expression.AndAlso(combinedExpression, ruleExpression)
                        : Expression.OrElse(combinedExpression, ruleExpression);
                }
            }

            return combinedExpression != null ? Expression.Lambda<Func<T, bool>>(combinedExpression, parameter) : null;
        }

        private Expression BuildRuleExpression<T>(ParameterExpression parameter, FilterRule rule)
        {
            try
            {
                var property = Expression.Property(parameter, rule.PropertyName);
                var propertyType = property.Type;

                // Handle nullable types
                var underlyingType = Nullable.GetUnderlyingType(propertyType);
                var targetType = underlyingType ?? propertyType;

                return rule.Operator switch
                {
                    // String operations (using existing FilterOperator)
                    FilterOperator.Contains => BuildStringContainsExpression(property, rule.Value),
                    FilterOperator.NotContains => BuildStringNotContainsExpression(property, rule.Value),
                    FilterOperator.StartsWith => BuildStringStartsWithExpression(property, rule.Value),
                    FilterOperator.EndsWith => BuildStringEndsWithExpression(property, rule.Value),
                    FilterOperator.Equals => BuildEqualsExpression(property, rule.Value, targetType),
                    FilterOperator.NotEquals => Expression.Not(BuildEqualsExpression(property, rule.Value, targetType)),
                    FilterOperator.IsEmpty => BuildIsEmptyExpression(property),
                    FilterOperator.IsNotEmpty => Expression.Not(BuildIsEmptyExpression(property)),

                    // Numeric operations
                    FilterOperator.GreaterThan => BuildComparisonExpression(property, rule.Value, targetType, Expression.GreaterThan),
                    FilterOperator.GreaterThanOrEqual => BuildComparisonExpression(property, rule.Value, targetType, Expression.GreaterThanOrEqual),
                    FilterOperator.LessThan => BuildComparisonExpression(property, rule.Value, targetType, Expression.LessThan),
                    FilterOperator.LessThanOrEqual => BuildComparisonExpression(property, rule.Value, targetType, Expression.LessThanOrEqual),

                    // Advanced operations
                    FilterOperator.Regex => BuildRegexExpression(property, rule.Value),

                    _ => null
                };
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Error building expression for rule {PropertyName} {Operator}", 
                    rule.PropertyName, rule.Operator);
                return null;
            }
        }

        private Expression BuildStringContainsExpression(MemberExpression property, object value)
        {
            var valueStr = value?.ToString() ?? "";
            var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
            return Expression.Call(property, containsMethod, Expression.Constant(valueStr));
        }

        private Expression BuildStringNotContainsExpression(MemberExpression property, object value)
        {
            var containsExpression = BuildStringContainsExpression(property, value);
            return Expression.Not(containsExpression);
        }

        private Expression BuildStringStartsWithExpression(MemberExpression property, object value)
        {
            var valueStr = value?.ToString() ?? "";
            var startsWithMethod = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
            return Expression.Call(property, startsWithMethod, Expression.Constant(valueStr));
        }

        private Expression BuildStringEndsWithExpression(MemberExpression property, object value)
        {
            var valueStr = value?.ToString() ?? "";
            var endsWithMethod = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
            return Expression.Call(property, endsWithMethod, Expression.Constant(valueStr));
        }

        private Expression BuildEqualsExpression(MemberExpression property, object value, Type targetType)
        {
            var convertedValue = ConvertValue(value, targetType);
            var constantExpression = Expression.Constant(convertedValue, targetType);
            return Expression.Equal(property, constantExpression);
        }

        private Expression BuildComparisonExpression(MemberExpression property, object value, Type targetType, 
            Func<Expression, Expression, BinaryExpression> comparisonFunc)
        {
            var convertedValue = ConvertValue(value, targetType);
            var constantExpression = Expression.Constant(convertedValue, targetType);
            return comparisonFunc(property, constantExpression);
        }

        private Expression BuildIsEmptyExpression(MemberExpression property)
        {
            var isNullOrEmptyMethod = typeof(string).GetMethod("IsNullOrEmpty", new[] { typeof(string) });
            return Expression.Call(isNullOrEmptyMethod, property);
        }

        private Expression BuildRegexExpression(MemberExpression property, object value)
        {
            var pattern = value?.ToString() ?? "";
            var regexType = typeof(Regex);
            var isMatchMethod = regexType.GetMethod("IsMatch", new[] { typeof(string), typeof(string) });
            return Expression.Call(isMatchMethod, property, Expression.Constant(pattern));
        }

        private object ConvertValue(object value, Type targetType)
        {
            if (value == null) return null;
            if (targetType.IsAssignableFrom(value.GetType())) return value;

            try
            {
                if (targetType == typeof(DateTime) && value is string dateStr)
                {
                    return DateTime.Parse(dateStr);
                }
                return Convert.ChangeType(value, targetType);
            }
            catch
            {
                return null;
            }
        }

        public async Task<FilterConfiguration> SaveFilterAsync(string name, FilterConfiguration config)
        {
            try
            {
                var isNew = string.IsNullOrEmpty(config.Id) || !await FilterExistsAsync(config.Id);
                
                if (isNew)
                {
                    config.Id = Guid.NewGuid().ToString();
                    config.CreatedDate = DateTime.Now;
                    config.CreatedBy = Environment.UserName;
                }
                
                config.Name = name;
                config.LastModified = DateTime.Now;
                
                var filePath = Path.Combine(_filtersDirectory, $"{config.Id}.json");
                var json = JsonSerializer.Serialize(config, _jsonOptions);
                await File.WriteAllTextAsync(filePath, json);
                
                _logger?.LogInformation("Saved filter: {FilterName}", name);
                return config;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving filter: {FilterName}", name);
                throw;
            }
        }

        private async Task<bool> FilterExistsAsync(string filterId)
        {
            var filePath = Path.Combine(_filtersDirectory, $"{filterId}.json");
            return File.Exists(filePath);
        }

        public async Task<FilterConfiguration> SaveFilterPresetAsync(FilterConfiguration config, string category = "Custom", List<string> tags = null, string description = null)
        {
            try
            {
                config.Category = category ?? "Custom";
                config.Tags = tags ?? new List<string>();
                config.Description = description ?? string.Empty;
                config.LastModified = DateTime.Now;
                
                var filePath = Path.Combine(_filtersDirectory, $"{config.Id}.json");
                var json = JsonSerializer.Serialize(config, _jsonOptions);
                await File.WriteAllTextAsync(filePath, json);

                _logger?.LogInformation("Filter preset saved: {Name} in category {Category}", config.Name, config.Category);
                return config;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving filter preset: {Name}", config.Name);
                throw;
            }
        }

        public async Task<List<FilterConfiguration>> GetFilterPresetsByCategoryAsync(string category = null)
        {
            try
            {
                var allFilters = await GetSavedFiltersAsync();
                
                if (!string.IsNullOrEmpty(category))
                {
                    return allFilters.Where(f => f.Category?.Equals(category, StringComparison.OrdinalIgnoreCase) == true)
                                   .OrderBy(f => f.Name)
                                   .ToList();
                }
                
                return allFilters.OrderBy(f => f.Category)
                                .ThenBy(f => f.Name)
                                .ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting filter presets by category: {Category}", category);
                return new List<FilterConfiguration>();
            }
        }

        public async Task<List<string>> GetFilterCategoriesAsync()
        {
            try
            {
                var filters = await GetSavedFiltersAsync();
                return filters.Select(f => f.Category)
                             .Where(c => !string.IsNullOrEmpty(c))
                             .Distinct()
                             .OrderBy(c => c)
                             .ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting filter categories");
                return new List<string> { "Custom" };
            }
        }

        public async Task MarkFilterAsUsedAsync(string filterId)
        {
            try
            {
                var filePath = Path.Combine(_filtersDirectory, $"{filterId}.json");
                if (!File.Exists(filePath)) return;

                var json = await File.ReadAllTextAsync(filePath);
                var filter = JsonSerializer.Deserialize<FilterConfiguration>(json, _jsonOptions);
                
                if (filter != null)
                {
                    filter.UsageCount++;
                    filter.LastUsed = DateTime.Now;
                    
                    var updatedJson = JsonSerializer.Serialize(filter, _jsonOptions);
                    await File.WriteAllTextAsync(filePath, updatedJson);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error marking filter as used: {FilterId}", filterId);
            }
        }

        public async Task ToggleFavoriteAsync(string filterId)
        {
            try
            {
                var filePath = Path.Combine(_filtersDirectory, $"{filterId}.json");
                if (!File.Exists(filePath)) return;

                var json = await File.ReadAllTextAsync(filePath);
                var filter = JsonSerializer.Deserialize<FilterConfiguration>(json, _jsonOptions);
                
                if (filter != null)
                {
                    filter.IsFavorite = !filter.IsFavorite;
                    filter.LastModified = DateTime.Now;
                    
                    var updatedJson = JsonSerializer.Serialize(filter, _jsonOptions);
                    await File.WriteAllTextAsync(filePath, updatedJson);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error toggling favorite for filter: {FilterId}", filterId);
            }
        }

        public async Task<List<FilterConfiguration>> GetSavedFiltersAsync()
        {
            try
            {
                var filters = new List<FilterConfiguration>();
                var filterFiles = Directory.GetFiles(_filtersDirectory, "*.json");

                foreach (var file in filterFiles)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(file);
                        var filter = JsonSerializer.Deserialize<FilterConfiguration>(json, _jsonOptions);
                        if (filter != null)
                        {
                            filters.Add(filter);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Failed to load filter from file: {File}", file);
                    }
                }

                return filters.OrderByDescending(f => f.CreatedDate).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading saved filters");
                return new List<FilterConfiguration>();
            }
        }

        public async Task DeleteFilterAsync(string filterId)
        {
            try
            {
                var filePath = Path.Combine(_filtersDirectory, $"{filterId}.json");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger?.LogInformation("Deleted filter: {FilterId}", filterId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting filter: {FilterId}", filterId);
                throw;
            }
        }

        public FilterConfiguration CreateEmptyFilter()
        {
            return new FilterConfiguration
            {
                Name = $"New Filter {DateTime.Now:HH:mm:ss}",
                Logic = FilterLogic.And,
                Rules = new List<FilterRule>()
            };
        }

        public List<FilterOperator> GetAvailableOperators()
        {
            return Enum.GetValues<FilterOperator>().ToList();
        }

        public List<string> GetFilterableProperties<T>()
        {
            return typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanRead && IsFilterableType(p.PropertyType))
                .Select(p => p.Name)
                .OrderBy(name => name)
                .ToList();
        }

        private bool IsFilterableType(Type type)
        {
            var underlyingType = Nullable.GetUnderlyingType(type) ?? type;
            
            return underlyingType.IsPrimitive ||
                   underlyingType == typeof(string) ||
                   underlyingType == typeof(DateTime) ||
                   underlyingType == typeof(decimal) ||
                   underlyingType == typeof(Guid) ||
                   underlyingType.IsEnum;
        }

        private void EnsureFiltersDirectoryExists()
        {
            try
            {
                if (!Directory.Exists(_filtersDirectory))
                {
                    Directory.CreateDirectory(_filtersDirectory);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create filters directory");
            }
        }
    }
}