using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface IGlobalSearchService
    {
        // Core search functionality
        Task<List<SearchResultItem>> SearchAsync(SearchQuery query, CancellationToken cancellationToken = default);
        Task<List<SearchResultItem>> SearchAsync(string queryText, SearchScope scope = SearchScope.All, CancellationToken cancellationToken = default);
        
        // Quick search for specific types
        Task<List<SearchResultItem>> SearchUsersAsync(string query, CancellationToken cancellationToken = default);
        Task<List<SearchResultItem>> SearchGroupsAsync(string query, CancellationToken cancellationToken = default);
        Task<List<SearchResultItem>> SearchComputersAsync(string query, CancellationToken cancellationToken = default);
        Task<List<SearchResultItem>> SearchApplicationsAsync(string query, CancellationToken cancellationToken = default);
        Task<List<SearchResultItem>> SearchMigrationWavesAsync(string query, CancellationToken cancellationToken = default);
        
        // Search suggestions and autocomplete
        Task<List<string>> GetSearchSuggestionsAsync(string partialQuery, int maxSuggestions = 10);
        Task<List<FilterSuggestion>> GetFilterSuggestionsAsync(string currentQuery = null);
        
        // Search history and saved searches
        Task<List<SearchHistoryItem>> GetSearchHistoryAsync(int maxItems = 20);
        Task SaveSearchHistoryAsync(SearchHistoryItem historyItem);
        Task ClearSearchHistoryAsync();
        
        Task<List<SavedSearch>> GetSavedSearchesAsync();
        Task<SavedSearch> SaveSearchAsync(SavedSearch savedSearch);
        Task DeleteSavedSearchAsync(string savedSearchId);
        
        // Search indexing and management
        Task RebuildSearchIndexAsync();
        Task<bool> IsIndexingInProgressAsync();
        Task<DateTime> GetLastIndexUpdateAsync();
        
        // Advanced search features
        Task<SearchStatistics> GetSearchStatisticsAsync(SearchQuery query);
        Task<List<SearchResultItem>> GetSimilarItemsAsync(string itemId, string itemType, int maxResults = 10);
        
        // Search configuration
        Task<Dictionary<string, object>> GetSearchConfigurationAsync();
        Task UpdateSearchConfigurationAsync(Dictionary<string, object> configuration);
        
        // Real-time search
        IAsyncEnumerable<SearchResultItem> SearchStreamAsync(string query, CancellationToken cancellationToken = default);
    }
}