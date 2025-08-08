using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class GlobalSearchService : IGlobalSearchService
    {
        private readonly ILogger<GlobalSearchService> _logger;
        private readonly IDataService _dataService;
        private readonly string _searchDataPath;
        private readonly string _indexPath;
        private readonly JsonSerializerOptions _jsonOptions;
        
        private readonly Dictionary<string, List<SearchIndexItem>> _searchIndex;
        private readonly List<SearchHistoryItem> _searchHistory;
        private readonly List<SavedSearch> _savedSearches;
        private readonly List<FilterSuggestion> _filterSuggestions;
        
        private DateTime _lastIndexUpdate;
        private bool _isIndexing;

        public GlobalSearchService(ILogger<GlobalSearchService> logger = null, IDataService dataService = null)
        {
            _logger = logger;
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            
            _searchDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                "MandADiscoverySuite", "Search");
            _indexPath = Path.Combine(_searchDataPath, "search-index.json");
            
            EnsureDirectoryExists();
            
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            _searchIndex = new Dictionary<string, List<SearchIndexItem>>();
            _searchHistory = new List<SearchHistoryItem>();
            _savedSearches = new List<SavedSearch>();
            _filterSuggestions = new List<FilterSuggestion>();

            _ = Task.Run(InitializeAsync);
        }

        private async Task InitializeAsync()
        {
            try
            {
                await LoadSearchDataAsync();
                InitializeFilterSuggestions();
                
                // Build initial index if it doesn't exist or is old
                if (_searchIndex.Count == 0 || (DateTime.Now - _lastIndexUpdate).TotalHours > 24)
                {
                    await RebuildSearchIndexAsync();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing global search service");
            }
        }

        public async Task<List<SearchResultItem>> SearchAsync(SearchQuery query, CancellationToken cancellationToken = default)
        {
            var stopwatch = Stopwatch.StartNew();
            var results = new List<SearchResultItem>();

            try
            {
                if (string.IsNullOrWhiteSpace(query.FreeText) && !query.Filters.Any())
                    return results;

                // Search in indexed data
                var indexResults = await SearchIndexAsync(query, cancellationToken);
                results.AddRange(indexResults);

                // Apply scope filtering
                results = ApplyScopeFilter(results, query.Scope).ToList();

                // Sort by relevance
                results = results.OrderByDescending(r => r.RelevanceScore)
                                .Take(query.MaxResults)
                                .ToList();

                // Add search highlights if requested
                if (query.IncludeHighlights)
                {
                    AddSearchHighlights(results, query.FreeText);
                }

                _logger?.LogInformation("Search completed: '{Query}' returned {Count} results in {Duration}ms", 
                    query.FreeText, results.Count, stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error performing search: {Query}", query.FreeText);
            }

            return results;
        }

        public async Task<List<SearchResultItem>> SearchAsync(string queryText, SearchScope scope = SearchScope.All, CancellationToken cancellationToken = default)
        {
            var query = ParseQuery(queryText);
            query.Scope = scope;
            return await SearchAsync(query, cancellationToken);
        }

        public async Task<List<SearchResultItem>> SearchUsersAsync(string query, CancellationToken cancellationToken = default)
        {
            return await SearchAsync(query, SearchScope.Users, cancellationToken);
        }

        public async Task<List<SearchResultItem>> SearchGroupsAsync(string query, CancellationToken cancellationToken = default)
        {
            return await SearchAsync(query, SearchScope.Groups, cancellationToken);
        }

        public async Task<List<SearchResultItem>> SearchComputersAsync(string query, CancellationToken cancellationToken = default)
        {
            return await SearchAsync(query, SearchScope.Computers, cancellationToken);
        }

        public async Task<List<SearchResultItem>> SearchApplicationsAsync(string query, CancellationToken cancellationToken = default)
        {
            return await SearchAsync(query, SearchScope.Applications, cancellationToken);
        }

        public async Task<List<SearchResultItem>> SearchMigrationWavesAsync(string query, CancellationToken cancellationToken = default)
        {
            return await SearchAsync(query, SearchScope.MigrationWaves, cancellationToken);
        }

        public async Task<List<string>> GetSearchSuggestionsAsync(string partialQuery, int maxSuggestions = 10)
        {
            try
            {
                await Task.Delay(1); // Simulate async operation
                
                var suggestions = new List<string>();
                
                // Get suggestions from search history
                var historySuggestions = _searchHistory
                    .Where(h => h.QueryText.StartsWith(partialQuery, StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(h => h.Timestamp)
                    .Select(h => h.QueryText)
                    .Take(maxSuggestions / 2)
                    .ToList();
                
                suggestions.AddRange(historySuggestions);

                // Get suggestions from indexed content
                var indexSuggestions = _searchIndex
                    .SelectMany(kv => kv.Value)
                    .Where(item => item.Title.Contains(partialQuery, StringComparison.OrdinalIgnoreCase) ||
                                  item.Content.Contains(partialQuery, StringComparison.OrdinalIgnoreCase))
                    .Select(item => item.Title)
                    .Distinct()
                    .Take(maxSuggestions - suggestions.Count)
                    .ToList();
                
                suggestions.AddRange(indexSuggestions);

                return suggestions.Distinct().Take(maxSuggestions).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting search suggestions");
                return new List<string>();
            }
        }

        public async Task<List<FilterSuggestion>> GetFilterSuggestionsAsync(string currentQuery = null)
        {
            await Task.Delay(1); // Simulate async operation
            
            var suggestions = _filterSuggestions.ToList();
            
            // Filter out already applied filters
            if (!string.IsNullOrEmpty(currentQuery))
            {
                var appliedFilters = ExtractFilters(currentQuery);
                suggestions = suggestions.Where(s => !appliedFilters.ContainsKey(s.FilterKey)).ToList();
            }
            
            return suggestions.OrderBy(s => s.DisplayText).ToList();
        }

        public async Task<List<SearchHistoryItem>> GetSearchHistoryAsync(int maxItems = 20)
        {
            await Task.Delay(1); // Simulate async operation
            return _searchHistory.OrderByDescending(h => h.Timestamp).Take(maxItems).ToList();
        }

        public async Task SaveSearchHistoryAsync(SearchHistoryItem historyItem)
        {
            try
            {
                // Remove duplicate entries
                _searchHistory.RemoveAll(h => h.QueryText.Equals(historyItem.QueryText, StringComparison.OrdinalIgnoreCase));
                
                // Add new entry
                _searchHistory.Insert(0, historyItem);
                
                // Keep only recent entries
                if (_searchHistory.Count > 100)
                {
                    _searchHistory.RemoveRange(100, _searchHistory.Count - 100);
                }
                
                await SaveSearchDataAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving search history");
            }
        }

        public async Task ClearSearchHistoryAsync()
        {
            _searchHistory.Clear();
            await SaveSearchDataAsync();
        }

        public async Task<List<SavedSearch>> GetSavedSearchesAsync()
        {
            await Task.Delay(1); // Simulate async operation
            return _savedSearches.OrderByDescending(s => s.CreatedAt).ToList();
        }

        public async Task<SavedSearch> SaveSearchAsync(SavedSearch savedSearch)
        {
            try
            {
                var existing = _savedSearches.FirstOrDefault(s => s.Id == savedSearch.Id);
                if (existing != null)
                {
                    _savedSearches.Remove(existing);
                }
                
                _savedSearches.Add(savedSearch);
                await SaveSearchDataAsync();
                
                return savedSearch;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving search");
                throw;
            }
        }

        public async Task DeleteSavedSearchAsync(string savedSearchId)
        {
            _savedSearches.RemoveAll(s => s.Id == savedSearchId);
            await SaveSearchDataAsync();
        }

        public async Task RebuildSearchIndexAsync()
        {
            if (_isIndexing) return;
            
            try
            {
                _isIndexing = true;
                _logger?.LogInformation("Starting search index rebuild");
                
                _searchIndex.Clear();
                
                // Index all data types
                await IndexUsersAsync();
                await IndexGroupsAsync();
                await IndexComputersAsync();
                await IndexApplicationsAsync();
                await IndexMigrationWavesAsync();
                await IndexMigrationTasksAsync();
                
                _lastIndexUpdate = DateTime.Now;
                await SaveSearchIndexAsync();
                
                _logger?.LogInformation("Search index rebuild completed. Indexed {Count} items", 
                    _searchIndex.Values.Sum(list => list.Count));
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error rebuilding search index");
            }
            finally
            {
                _isIndexing = false;
            }
        }

        public async Task<bool> IsIndexingInProgressAsync()
        {
            await Task.Delay(1); // Simulate async operation
            return _isIndexing;
        }

        public async Task<DateTime> GetLastIndexUpdateAsync()
        {
            await Task.Delay(1); // Simulate async operation
            return _lastIndexUpdate;
        }

        public async Task<SearchStatistics> GetSearchStatisticsAsync(SearchQuery query)
        {
            var results = await SearchAsync(query);
            
            return new SearchStatistics
            {
                TotalResults = results.Count,
                SearchDuration = TimeSpan.Zero, // Would be measured in real implementation
                ResultsByType = results.GroupBy(r => r.ResultType)
                                      .ToDictionary(g => g.Key, g => g.Count()),
                SearchTerms = ExtractSearchTerms(query.FreeText),
                HasMoreResults = results.Count >= query.MaxResults
            };
        }

        public async Task<List<SearchResultItem>> GetSimilarItemsAsync(string itemId, string itemType, int maxResults = 10)
        {
            try
            {
                await Task.Delay(1); // Simulate async operation
                
                // Find the item in the index
                var typeIndex = _searchIndex.ContainsKey(itemType) ? _searchIndex[itemType] : new List<SearchIndexItem>();
                var sourceItem = typeIndex.FirstOrDefault(item => item.Id == itemId);
                
                if (sourceItem == null)
                    return new List<SearchResultItem>();

                // Find similar items based on tags and content similarity
                var similarItems = typeIndex
                    .Where(item => item.Id != itemId)
                    .Where(item => item.Tags.Any(tag => sourceItem.Tags.Contains(tag)) ||
                                  CalculateContentSimilarity(sourceItem.Content, item.Content) > 0.3)
                    .Take(maxResults)
                    .Select(item => CreateSearchResultFromIndex(item))
                    .ToList();

                return similarItems;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error finding similar items");
                return new List<SearchResultItem>();
            }
        }

        public async Task<Dictionary<string, object>> GetSearchConfigurationAsync()
        {
            await Task.Delay(1); // Simulate async operation
            
            return new Dictionary<string, object>
            {
                ["MaxResults"] = 50,
                ["IncludeHighlights"] = true,
                ["FuzzyMatchThreshold"] = 0.8,
                ["IndexRebuildInterval"] = 24, // hours
                ["SearchHistoryLimit"] = 100
            };
        }

        public async Task UpdateSearchConfigurationAsync(Dictionary<string, object> configuration)
        {
            // In a real implementation, this would save configuration to storage
            await Task.Delay(1);
            _logger?.LogInformation("Search configuration updated");
        }

        public async IAsyncEnumerable<SearchResultItem> SearchStreamAsync(string query, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            var searchQuery = ParseQuery(query);
            var results = await SearchAsync(searchQuery, cancellationToken);
            
            foreach (var result in results)
            {
                if (cancellationToken.IsCancellationRequested)
                    yield break;
                    
                yield return result;
                
                // Add small delay to simulate streaming
                await Task.Delay(50, cancellationToken);
            }
        }

        #region Private Methods

        private async Task<List<SearchResultItem>> SearchIndexAsync(SearchQuery query, CancellationToken cancellationToken)
        {
            var results = new List<SearchResultItem>();
            
            foreach (var typeIndex in _searchIndex)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;
                    
                var typeResults = SearchInTypeIndex(typeIndex.Value, query);
                results.AddRange(typeResults);
            }
            
            return results;
        }

        private List<SearchResultItem> SearchInTypeIndex(List<SearchIndexItem> typeIndex, SearchQuery query)
        {
            var results = new List<SearchResultItem>();
            
            foreach (var item in typeIndex)
            {
                var score = CalculateRelevanceScore(item, query);
                if (score > 0)
                {
                    var result = CreateSearchResultFromIndex(item);
                    result.RelevanceScore = score;
                    results.Add(result);
                }
            }
            
            return results;
        }

        private double CalculateRelevanceScore(SearchIndexItem item, SearchQuery query)
        {
            var score = 0.0;
            var searchTerms = ExtractSearchTerms(query.FreeText);
            
            foreach (var term in searchTerms)
            {
                // Title match (highest weight)
                if (item.Title.Contains(term, StringComparison.OrdinalIgnoreCase))
                {
                    if (item.Title.Equals(term, StringComparison.OrdinalIgnoreCase))
                        score += 10.0; // Exact title match
                    else if (item.Title.StartsWith(term, StringComparison.OrdinalIgnoreCase))
                        score += 5.0; // Title starts with term
                    else
                        score += 3.0; // Title contains term
                }
                
                // Content match (medium weight)
                if (item.Content.Contains(term, StringComparison.OrdinalIgnoreCase))
                {
                    score += 1.0;
                }
                
                // Tags match (high weight)
                if (item.Tags.Any(tag => tag.Contains(term, StringComparison.OrdinalIgnoreCase)))
                {
                    score += 2.0;
                }
            }
            
            // Apply boost factor
            score *= item.Boost;
            
            // Apply filter matching
            foreach (var filter in query.Filters)
            {
                if (item.Properties.ContainsKey(filter.Key))
                {
                    var propertyValue = item.Properties[filter.Key]?.ToString() ?? "";
                    if (filter.Value.Values.Any(v => propertyValue.Contains(v, StringComparison.OrdinalIgnoreCase)))
                    {
                        score += 2.0;
                    }
                }
            }
            
            return score;
        }

        private SearchResultItem CreateSearchResultFromIndex(SearchIndexItem item)
        {
            return new SearchResultItem
            {
                Id = item.Id,
                Title = item.Title,
                Description = TruncateContent(item.Content, 200),
                ResultType = item.Type,
                Data = item.Properties.ContainsKey("OriginalObject") ? item.Properties["OriginalObject"] : null,
                Metadata = item.Properties.ToDictionary(kv => kv.Key, kv => kv.Value?.ToString() ?? ""),
                IconGlyph = GetIconForType(item.Type)
            };
        }

        private IEnumerable<SearchResultItem> ApplyScopeFilter(List<SearchResultItem> results, SearchScope scope)
        {
            if (scope == SearchScope.All)
                return results;

            return results.Where(r => IsInScope(r.ResultType, scope));
        }

        private bool IsInScope(string resultType, SearchScope scope)
        {
            return resultType.ToLower() switch
            {
                "user" => scope.HasFlag(SearchScope.Users),
                "group" => scope.HasFlag(SearchScope.Groups),
                "computer" => scope.HasFlag(SearchScope.Computers),
                "application" => scope.HasFlag(SearchScope.Applications),
                "migrationwave" => scope.HasFlag(SearchScope.MigrationWaves),
                "migrationtask" => scope.HasFlag(SearchScope.MigrationTasks),
                _ => scope.HasFlag(SearchScope.DiscoveryItems)
            };
        }

        private void AddSearchHighlights(List<SearchResultItem> results, string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return;
            
            var terms = ExtractSearchTerms(query);
            
            foreach (var result in results)
            {
                result.Highlights.Clear();
                
                foreach (var term in terms)
                {
                    // Add highlights for title
                    var titleMatch = Regex.Match(result.Title, Regex.Escape(term), RegexOptions.IgnoreCase);
                    if (titleMatch.Success)
                    {
                        result.Highlights.Add(new SearchHighlight
                        {
                            StartIndex = titleMatch.Index,
                            Length = titleMatch.Length,
                            MatchedText = titleMatch.Value,
                            HighlightType = SearchHighlightType.ExactMatch
                        });
                    }
                    
                    // Add highlights for description
                    var descMatch = Regex.Match(result.Description ?? "", Regex.Escape(term), RegexOptions.IgnoreCase);
                    if (descMatch.Success)
                    {
                        result.Highlights.Add(new SearchHighlight
                        {
                            StartIndex = descMatch.Index,
                            Length = descMatch.Length,
                            MatchedText = descMatch.Value,
                            HighlightType = SearchHighlightType.ExactMatch
                        });
                    }
                }
            }
        }

        private SearchQuery ParseQuery(string queryText)
        {
            var query = new SearchQuery();
            
            if (string.IsNullOrWhiteSpace(queryText))
                return query;
            
            // Extract filters (e.g., "type:user status:active")
            var filters = ExtractFilters(queryText);
            query.Filters = filters;
            
            // Remove filter text to get free text
            var freeText = RemoveFilters(queryText);
            query.FreeText = freeText.Trim();
            
            return query;
        }

        private Dictionary<string, GlobalSearchFilter> ExtractFilters(string queryText)
        {
            var filters = new Dictionary<string, GlobalSearchFilter>();
            var filterPattern = @"(\w+):([^\s]+)";
            var matches = Regex.Matches(queryText, filterPattern);
            
            foreach (Match match in matches)
            {
                var key = match.Groups[1].Value.ToLower();
                var value = match.Groups[2].Value;
                
                if (!filters.ContainsKey(key))
                {
                    filters[key] = new GlobalSearchFilter { Key = key };
                }
                
                filters[key].Values.Add(value);
            }
            
            return filters;
        }

        private string RemoveFilters(string queryText)
        {
            var filterPattern = @"\w+:[^\s]+";
            return Regex.Replace(queryText, filterPattern, " ").Trim();
        }

        private List<string> ExtractSearchTerms(string freeText)
        {
            if (string.IsNullOrWhiteSpace(freeText))
                return new List<string>();
            
            return freeText.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                          .Where(term => term.Length >= 2)
                          .ToList();
        }

        private double CalculateContentSimilarity(string content1, string content2)
        {
            if (string.IsNullOrEmpty(content1) || string.IsNullOrEmpty(content2))
                return 0.0;
            
            var words1 = content1.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var words2 = content2.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            
            var intersection = words1.Intersect(words2).Count();
            var union = words1.Union(words2).Count();
            
            return union == 0 ? 0.0 : (double)intersection / union;
        }

        private string TruncateContent(string content, int maxLength)
        {
            if (string.IsNullOrEmpty(content) || content.Length <= maxLength)
                return content ?? "";
            
            var truncated = content.Substring(0, maxLength);
            var lastSpace = truncated.LastIndexOf(' ');
            
            if (lastSpace > 0)
                truncated = truncated.Substring(0, lastSpace);
            
            return truncated + "...";
        }

        private string GetIconForType(string type)
        {
            return type.ToLower() switch
            {
                "user" => "👤",
                "group" => "👥",
                "computer" => "💻",
                "application" => "📱",
                "migrationwave" => "🌊",
                "migrationtask" => "📋",
                _ => "📄"
            };
        }

        private void InitializeFilterSuggestions()
        {
            _filterSuggestions.Clear();
            _filterSuggestions.AddRange(new[]
            {
                new FilterSuggestion { DisplayText = "Type: User", FilterKey = "type", FilterValue = "user", Description = "Search only users", IconGlyph = "👤", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Type: Group", FilterKey = "type", FilterValue = "group", Description = "Search only groups", IconGlyph = "👥", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Type: Computer", FilterKey = "type", FilterValue = "computer", Description = "Search only computers", IconGlyph = "💻", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Type: Application", FilterKey = "type", FilterValue = "application", Description = "Search only applications", IconGlyph = "📱", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Status: Active", FilterKey = "status", FilterValue = "active", Description = "Show only active items", IconGlyph = "✅", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Status: Inactive", FilterKey = "status", FilterValue = "inactive", Description = "Show only inactive items", IconGlyph = "❌", IsQuickFilter = true },
                new FilterSuggestion { DisplayText = "Department", FilterKey = "department", FilterValue = "", Description = "Filter by department", IconGlyph = "🏢", IsQuickFilter = false },
                new FilterSuggestion { DisplayText = "Location", FilterKey = "location", FilterValue = "", Description = "Filter by location", IconGlyph = "📍", IsQuickFilter = false }
            });
        }

        #endregion

        #region Indexing Methods

        private async Task IndexUsersAsync()
        {
            try
            {
                var users = await _dataService?.LoadUsersAsync("") ?? new List<UserData>();
                var userIndex = new List<SearchIndexItem>();
                
                foreach (var user in users)
                {
                    var indexItem = new SearchIndexItem
                    {
                        Id = user.Id,
                        Type = "user",
                        Title = user.Name ?? user.UserPrincipalName,
                        Content = $"{user.Name} {user.UserPrincipalName} {user.Email} {user.Department} {user.JobTitle}",
                        Properties = new Dictionary<string, object>
                        {
                            ["OriginalObject"] = user,
                            ["Department"] = user.Department ?? "",
                            ["JobTitle"] = user.JobTitle ?? "",
                            ["Status"] = user.AccountEnabled ? "active" : "inactive",
                            ["Location"] = user.City ?? ""
                        },
                        Tags = new List<string> { user.Department ?? "", user.JobTitle ?? "", user.City ?? "" },
                        LastModified = DateTime.Now,
                        Boost = 1.0
                    };
                    
                    userIndex.Add(indexItem);
                }
                
                _searchIndex["user"] = userIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing users");
            }
        }

        private async Task IndexGroupsAsync()
        {
            try
            {
                var groups = await _dataService?.LoadGroupsAsync("") ?? new List<GroupData>();
                var groupIndex = new List<SearchIndexItem>();
                
                foreach (var group in groups)
                {
                    var indexItem = new SearchIndexItem
                    {
                        Id = group.Id,
                        Type = "group",
                        Title = group.DisplayName,
                        Content = $"{group.DisplayName} {group.Description} {group.Mail}",
                        Properties = new Dictionary<string, object>
                        {
                            ["OriginalObject"] = group,
                            ["Type"] = group.Type ?? "",
                            ["MemberCount"] = group.MemberCount,
                            ["Status"] = "active"
                        },
                        Tags = new List<string> { group.Type ?? "" },
                        LastModified = DateTime.Now,
                        Boost = 1.0
                    };
                    
                    groupIndex.Add(indexItem);
                }
                
                _searchIndex["group"] = groupIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing groups");
            }
        }

        private async Task IndexComputersAsync()
        {
            try
            {
                var computers = await _dataService?.LoadInfrastructureAsync("") ?? new List<InfrastructureData>();
                var computerIndex = new List<SearchIndexItem>();
                
                foreach (var computer in computers)
                {
                    var indexItem = new SearchIndexItem
                    {
                        Id = computer.Id,
                        Type = "computer",
                        Title = computer.Name,
                        Content = $"{computer.Name} {computer.Type} {computer.OperatingSystem} {computer.Description}",
                        Properties = new Dictionary<string, object>
                        {
                            ["OriginalObject"] = computer,
                            ["Type"] = computer.Type ?? "",
                            ["OperatingSystem"] = computer.OperatingSystem ?? "",
                            ["Status"] = computer.Status ?? "",
                            ["Location"] = computer.Location ?? ""
                        },
                        Tags = new List<string> { computer.Type ?? "", computer.OperatingSystem ?? "" },
                        LastModified = DateTime.Now,
                        Boost = 1.0
                    };
                    
                    computerIndex.Add(indexItem);
                }
                
                _searchIndex["computer"] = computerIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing computers");
            }
        }

        private async Task IndexApplicationsAsync()
        {
            try
            {
                var applications = await _dataService?.LoadApplicationsAsync("") ?? new List<ApplicationData>();
                var appIndex = new List<SearchIndexItem>();
                
                foreach (var app in applications)
                {
                    var indexItem = new SearchIndexItem
                    {
                        Id = app.Id,
                        Type = "application",
                        Title = app.Name,
                        Content = $"{app.Name} {app.Publisher} {app.Version}",
                        Properties = new Dictionary<string, object>
                        {
                            ["OriginalObject"] = app,
                            ["Publisher"] = app.Publisher ?? "",
                            ["Version"] = app.Version ?? "",
                            ["Status"] = "active"
                        },
                        Tags = new List<string> { app.Publisher ?? "" },
                        LastModified = DateTime.Now,
                        Boost = 1.0
                    };
                    
                    appIndex.Add(indexItem);
                }
                
                _searchIndex["application"] = appIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing applications");
            }
        }

        private async Task IndexMigrationWavesAsync()
        {
            try
            {
                var ganttService = SimpleServiceLocator.GetService<IGanttService>();
                if (ganttService == null) return;
                
                var waves = await ganttService.GetMigrationWavesAsync();
                var waveIndex = new List<SearchIndexItem>();
                
                foreach (var wave in waves)
                {
                    var indexItem = new SearchIndexItem
                    {
                        Id = wave.Id,
                        Type = "migrationwave",
                        Title = wave.Name,
                        Content = $"{wave.Name} {wave.Description} {wave.AssignedTo}",
                        Properties = new Dictionary<string, object>
                        {
                            ["OriginalObject"] = wave,
                            ["Status"] = wave.Status,
                            ["Priority"] = wave.Priority,
                            ["AssignedTo"] = wave.AssignedTo ?? ""
                        },
                        Tags = new List<string> { wave.Status, $"Priority{wave.Priority}" },
                        LastModified = DateTime.Now,
                        Boost = 1.2 // Boost migration content
                    };
                    
                    waveIndex.Add(indexItem);
                }
                
                _searchIndex["migrationwave"] = waveIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing migration waves");
            }
        }

        private async Task IndexMigrationTasksAsync()
        {
            try
            {
                var ganttService = SimpleServiceLocator.GetService<IGanttService>();
                if (ganttService == null) return;
                
                var waves = await ganttService.GetMigrationWavesAsync();
                var taskIndex = new List<SearchIndexItem>();
                
                foreach (var wave in waves)
                {
                    foreach (var task in wave.Tasks)
                    {
                        var indexItem = new SearchIndexItem
                        {
                            Id = task.Id,
                            Type = "migrationtask",
                            Title = task.Name,
                            Content = $"{task.Name} {task.Description} {task.AssignedTo}",
                            Properties = new Dictionary<string, object>
                            {
                                ["OriginalObject"] = task,
                                ["Status"] = task.Status,
                                ["AssignedTo"] = task.AssignedTo ?? "",
                                ["WaveId"] = task.WaveId
                            },
                            Tags = new List<string> { task.Status },
                            LastModified = DateTime.Now,
                            Boost = 1.0
                        };
                        
                        taskIndex.Add(indexItem);
                    }
                }
                
                _searchIndex["migrationtask"] = taskIndex;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error indexing migration tasks");
            }
        }

        #endregion

        #region Data Persistence

        private async Task LoadSearchDataAsync()
        {
            try
            {
                // Load search index
                if (File.Exists(_indexPath))
                {
                    var indexJson = await File.ReadAllTextAsync(_indexPath);
                    var indexData = JsonSerializer.Deserialize<Dictionary<string, object>>(indexJson, _jsonOptions);
                    
                    if (indexData.ContainsKey("lastUpdate"))
                    {
                        DateTime.TryParse(indexData["lastUpdate"].ToString(), out _lastIndexUpdate);
                    }
                }
                
                // Load search history
                var historyPath = Path.Combine(_searchDataPath, "search-history.json");
                if (File.Exists(historyPath))
                {
                    var historyJson = await File.ReadAllTextAsync(historyPath);
                    var history = JsonSerializer.Deserialize<List<SearchHistoryItem>>(historyJson, _jsonOptions);
                    if (history != null)
                    {
                        _searchHistory.AddRange(history);
                    }
                }
                
                // Load saved searches
                var savedPath = Path.Combine(_searchDataPath, "saved-searches.json");
                if (File.Exists(savedPath))
                {
                    var savedJson = await File.ReadAllTextAsync(savedPath);
                    var saved = JsonSerializer.Deserialize<List<SavedSearch>>(savedJson, _jsonOptions);
                    if (saved != null)
                    {
                        _savedSearches.AddRange(saved);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading search data");
            }
        }

        private async Task SaveSearchDataAsync()
        {
            try
            {
                // Save search history
                var historyPath = Path.Combine(_searchDataPath, "search-history.json");
                var historyJson = JsonSerializer.Serialize(_searchHistory, _jsonOptions);
                await File.WriteAllTextAsync(historyPath, historyJson);
                
                // Save saved searches
                var savedPath = Path.Combine(_searchDataPath, "saved-searches.json");
                var savedJson = JsonSerializer.Serialize(_savedSearches, _jsonOptions);
                await File.WriteAllTextAsync(savedPath, savedJson);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving search data");
            }
        }

        private async Task SaveSearchIndexAsync()
        {
            try
            {
                var indexData = new Dictionary<string, object>
                {
                    ["lastUpdate"] = _lastIndexUpdate.ToString("O"),
                    ["itemCount"] = _searchIndex.Values.Sum(list => list.Count)
                };
                
                var indexJson = JsonSerializer.Serialize(indexData, _jsonOptions);
                await File.WriteAllTextAsync(_indexPath, indexJson);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving search index");
            }
        }

        private void EnsureDirectoryExists()
        {
            try
            {
                if (!Directory.Exists(_searchDataPath))
                {
                    Directory.CreateDirectory(_searchDataPath);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create search data directory");
            }
        }

        #endregion
    }
}