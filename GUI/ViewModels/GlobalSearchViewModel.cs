using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Global Search functionality
    /// </summary>
    public class GlobalSearchViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        private readonly SearchFilterParser _filterParser;
        
        private string _searchText = string.Empty;
        private bool _showResults = false;
        private bool _isSearching = false;
        private SearchResultItem _selectedResult;
        private int _selectedIndex = -1;
        private CancellationTokenSource _searchCancellation;

        public GlobalSearchViewModel(
            ILogger<GlobalSearchViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            _filterParser = new SearchFilterParser();

            SearchResults = new ObservableCollection<SearchResultItem>();
            FilteredResults = CollectionViewSource.GetDefaultView(SearchResults);
            FilterSuggestions = new ObservableCollection<FilterSuggestion>();

            InitializeCommands();
            LoadFilterSuggestions();
        }

        #region Properties

        public ObservableCollection<SearchResultItem> SearchResults { get; }
        public ICollectionView FilteredResults { get; }
        public ObservableCollection<FilterSuggestion> FilterSuggestions { get; }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    OnPropertyChanged(nameof(HasSearchText));
                    OnPropertyChanged(nameof(HasActiveFilters));
                    OnPropertyChanged(nameof(ActiveFilterCount));
                    _ = PerformSearchAsync();
                }
            }
        }

        public bool ShowResults
        {
            get => _showResults;
            set => SetProperty(ref _showResults, value);
        }

        public bool IsSearching
        {
            get => _isSearching;
            set => SetProperty(ref _isSearching, value);
        }

        public SearchResultItem SelectedResult
        {
            get => _selectedResult;
            set => SetProperty(ref _selectedResult, value);
        }

        public int SelectedIndex
        {
            get => _selectedIndex;
            set
            {
                if (SetProperty(ref _selectedIndex, value))
                {
                    UpdateSelectedResult();
                }
            }
        }

        public bool HasSearchText => !string.IsNullOrWhiteSpace(SearchText);
        public bool HasActiveFilters => _filterParser.GetActiveFilters(SearchText).Any();
        public int ActiveFilterCount => _filterParser.GetActiveFilters(SearchText).Count();
        public bool ShowFilterSuggestions => !HasSearchText && FilterSuggestions.Any();
        public bool ShowNoResults => !IsSearching && SearchResults.Count == 0 && HasSearchText;
        public bool ShowBothSuggestionsAndResults => ShowFilterSuggestions && SearchResults.Any();

        #endregion

        #region Commands

        public ICommand ExecuteSearchCommand { get; private set; }
        public ICommand ClearSearchCommand { get; private set; }
        public ICommand MoveSelectionDownCommand { get; private set; }
        public ICommand MoveSelectionUpCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            ExecuteSearchCommand = new AsyncRelayCommand(ExecuteSelectedResultAsync);
            ClearSearchCommand = new RelayCommand(ClearSearch);
            MoveSelectionDownCommand = new RelayCommand(MoveSelectionDown);
            MoveSelectionUpCommand = new RelayCommand(MoveSelectionUp);
        }

        #endregion

        #region Public Methods

        public async Task PerformSearchAsync()
        {
            // Cancel previous search
            _searchCancellation?.Cancel();
            _searchCancellation = new CancellationTokenSource();

            if (string.IsNullOrWhiteSpace(SearchText))
            {
                SearchResults.Clear();
                ShowResults = false;
                OnPropertyChanged(nameof(ShowFilterSuggestions));
                OnPropertyChanged(nameof(ShowNoResults));
                return;
            }

            await ExecuteAsync(async () =>
            {
                IsSearching = true;
                ShowResults = true;

                try
                {
                    var filters = _filterParser.ParseFilters(SearchText);
                    var freeText = _filterParser.GetFreeText(SearchText);

                    var profile = await _profileService.GetCurrentProfileAsync();
                    if (profile == null) return;

                    var results = new List<SearchResultItem>();

                    // Search Users
                    if (!filters.ContainsKey("type") || filters["type"].Contains("user"))
                    {
                        var users = await _dataService.LoadUsersAsync(profile.Name);
                        results.AddRange(SearchUsers(users, filters, freeText));
                    }

                    // Search Infrastructure
                    if (!filters.ContainsKey("type") || filters["type"].Contains("computer") || filters["type"].Contains("infrastructure"))
                    {
                        var infrastructure = await _dataService.LoadInfrastructureAsync(profile.Name);
                        results.AddRange(SearchInfrastructure(infrastructure, filters, freeText));
                    }

                    // Search Groups
                    if (!filters.ContainsKey("type") || filters["type"].Contains("group"))
                    {
                        var groups = await _dataService.LoadGroupsAsync(profile.Name);
                        results.AddRange(SearchGroups(groups, filters, freeText));
                    }

                    // Search Applications (if available)
                    if (!filters.ContainsKey("type") || filters["type"].Contains("application"))
                    {
                        var applications = await _dataService.LoadApplicationsAsync(profile.Name);
                        results.AddRange(SearchApplications(applications, filters, freeText));
                    }

                    if (!_searchCancellation.Token.IsCancellationRequested)
                    {
                        SearchResults.Clear();
                        foreach (var result in results.OrderBy(r => r.RelevanceScore).Take(50))
                        {
                            SearchResults.Add(result);
                        }

                        SelectedIndex = SearchResults.Any() ? 0 : -1;
                    }
                }
                finally
                {
                    IsSearching = false;
                    OnPropertyChanged(nameof(ShowFilterSuggestions));
                    OnPropertyChanged(nameof(ShowNoResults));
                    OnPropertyChanged(nameof(ShowBothSuggestionsAndResults));
                }

            }, "Performing search");
        }

        public void SelectResult(SearchResultItem result)
        {
            if (result == null) return;

            Logger?.LogInformation("Selected search result: {Title} ({Type})", result.Title, result.ResultType);

            // Navigate to the appropriate view based on result type
            switch (result.ResultType.ToLower())
            {
                case "user":
                    SendMessage(new NavigationMessage("UserDetail", result.Data));
                    break;
                case "computer":
                case "infrastructure":
                    SendMessage(new NavigationMessage("InfrastructureDetail", result.Data));
                    break;
                case "group":
                    SendMessage(new NavigationMessage("GroupDetail", result.Data));
                    break;
                case "application":
                    SendMessage(new NavigationMessage("ApplicationDetail", result.Data));
                    break;
                default:
                    SendMessage(new NavigationMessage("SearchResults", result));
                    break;
            }

            ClearSearch();
        }

        public void HighlightResult(SearchResultItem result)
        {
            var index = SearchResults.IndexOf(result);
            if (index >= 0)
            {
                SelectedIndex = index;
            }
        }

        public void ApplyFirstSuggestion()
        {
            var firstSuggestion = FilterSuggestions.FirstOrDefault();
            if (firstSuggestion != null)
            {
                SearchText = firstSuggestion.Example.Split('\'')[1]; // Extract the example filter
            }
        }

        public void OnSearchBoxFocused()
        {
            if (HasSearchText || ShowFilterSuggestions)
            {
                ShowResults = true;
            }
        }

        public void OnSearchBoxLostFocus()
        {
            ShowResults = false;
        }

        public void ClearSearch()
        {
            SearchText = string.Empty;
            ShowResults = false;
            SelectedIndex = -1;
        }

        public void MoveSelectionDown()
        {
            if (SearchResults.Count > 0)
            {
                SelectedIndex = Math.Min(SelectedIndex + 1, SearchResults.Count - 1);
            }
        }

        public void MoveSelectionUp()
        {
            if (SearchResults.Count > 0)
            {
                SelectedIndex = Math.Max(0, SelectedIndex - 1);
            }
        }

        #endregion

        #region Private Methods

        private async Task ExecuteSelectedResultAsync()
        {
            if (SelectedResult != null)
            {
                SelectResult(SelectedResult);
            }
        }

        private void UpdateSelectedResult()
        {
            if (SelectedIndex >= 0 && SelectedIndex < SearchResults.Count)
            {
                SelectedResult = SearchResults[SelectedIndex];
            }
            else
            {
                SelectedResult = null;
            }
        }

        private void LoadFilterSuggestions()
        {
            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "user:",
                Description = "Search users by name or email",
                Example = "user: 'john doe'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "computer:",
                Description = "Search computers by name",
                Example = "computer: 'server'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "os:",
                Description = "Filter by operating system",
                Example = "os: 'windows server 2019'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "domain:",
                Description = "Filter by domain",
                Example = "domain: 'contoso.com'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "type:",
                Description = "Filter by data type",
                Example = "type: 'user' or 'computer'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "department:",
                Description = "Filter users by department",
                Example = "department: 'IT'"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "enabled:",
                Description = "Filter by enabled status",
                Example = "enabled: true"
            });

            FilterSuggestions.Add(new FilterSuggestion
            {
                FilterType = "lastlogon:",
                Description = "Filter by last logon date",
                Example = "lastlogon: '>30 days'"
            });
        }

        private IEnumerable<SearchResultItem> SearchUsers(IEnumerable<UserData> users, Dictionary<string, List<string>> filters, string freeText)
        {
            var results = new List<SearchResultItem>();

            foreach (var user in users)
            {
                var score = CalculateUserRelevance(user, filters, freeText);
                if (score > 0)
                {
                    results.Add(new SearchResultItem
                    {
                        Title = user.Name ?? user.UserPrincipalName,
                        Description = $"{user.UserPrincipalName} - {user.Department}",
                        ResultType = "User",
                        TypeColor = "#FF4F46E5",
                        Icon = "\uE716",
                        MatchType = GetMatchType(score),
                        RelevanceScore = score,
                        Tags = new[] { user.Domain, user.Department, user.Enabled ? "Enabled" : "Disabled" }.Where(t => !string.IsNullOrEmpty(t)).ToArray(),
                        Data = user
                    });
                }
            }

            return results;
        }

        private IEnumerable<SearchResultItem> SearchInfrastructure(IEnumerable<InfrastructureData> infrastructure, Dictionary<string, List<string>> filters, string freeText)
        {
            var results = new List<SearchResultItem>();

            foreach (var computer in infrastructure)
            {
                var score = CalculateInfrastructureRelevance(computer, filters, freeText);
                if (score > 0)
                {
                    results.Add(new SearchResultItem
                    {
                        Title = computer.Name,
                        Description = $"{computer.OperatingSystem} - {computer.Domain}",
                        ResultType = "Computer",
                        TypeColor = "#FF059669",
                        Icon = "\uE977",
                        MatchType = GetMatchType(score),
                        RelevanceScore = score,
                        Tags = new[] { computer.Domain, computer.OperatingSystem, computer.IsServer ? "Server" : "Workstation" }.Where(t => !string.IsNullOrEmpty(t)).ToArray(),
                        Data = computer
                    });
                }
            }

            return results;
        }

        private IEnumerable<SearchResultItem> SearchGroups(IEnumerable<GroupData> groups, Dictionary<string, List<string>> filters, string freeText)
        {
            var results = new List<SearchResultItem>();

            foreach (var group in groups)
            {
                var score = CalculateGroupRelevance(group, filters, freeText);
                if (score > 0)
                {
                    results.Add(new SearchResultItem
                    {
                        Title = group.Name,
                        Description = $"{group.Type} - {group.MemberCount} members",
                        ResultType = "Group",
                        TypeColor = "#FFDC2626",
                        Icon = "\uE902",
                        MatchType = GetMatchType(score),
                        RelevanceScore = score,
                        Tags = new[] { group.Domain, group.Type, $"{group.MemberCount} members" }.Where(t => !string.IsNullOrEmpty(t)).ToArray(),
                        Data = group
                    });
                }
            }

            return results;
        }

        private IEnumerable<SearchResultItem> SearchApplications(IEnumerable<ApplicationData> applications, Dictionary<string, List<string>> filters, string freeText)
        {
            var results = new List<SearchResultItem>();

            foreach (var app in applications)
            {
                var score = CalculateApplicationRelevance(app, filters, freeText);
                if (score > 0)
                {
                    results.Add(new SearchResultItem
                    {
                        Title = app.Name,
                        Description = $"{app.Version} - {app.Publisher}",
                        ResultType = "Application",
                        TypeColor = "#FF7C3AED",
                        Icon = "\uE8B7",
                        MatchType = GetMatchType(score),
                        RelevanceScore = score,
                        Tags = new[] { app.Publisher, app.Version, app.InstallLocation }.Where(t => !string.IsNullOrEmpty(t)).ToArray(),
                        Data = app
                    });
                }
            }

            return results;
        }

        private int CalculateUserRelevance(UserData user, Dictionary<string, List<string>> filters, string freeText)
        {
            int score = 0;

            // Check specific filters
            if (filters.ContainsKey("user"))
            {
                if (filters["user"].Any(f => ContainsIgnoreCase(user.Name, f) || ContainsIgnoreCase(user.UserPrincipalName, f)))
                    score += 100;
            }

            if (filters.ContainsKey("domain"))
            {
                if (filters["domain"].Any(f => ContainsIgnoreCase(user.Domain, f)))
                    score += 50;
            }

            if (filters.ContainsKey("department"))
            {
                if (filters["department"].Any(f => ContainsIgnoreCase(user.Department, f)))
                    score += 50;
            }

            if (filters.ContainsKey("enabled"))
            {
                if (filters["enabled"].Any(f => f.ToLower() == user.Enabled.ToString().ToLower()))
                    score += 30;
            }

            // Check free text
            if (!string.IsNullOrWhiteSpace(freeText))
            {
                if (ContainsIgnoreCase(user.Name, freeText) || ContainsIgnoreCase(user.UserPrincipalName, freeText))
                    score += 80;
                else if (ContainsIgnoreCase(user.Department, freeText) || ContainsIgnoreCase(user.Title, freeText))
                    score += 40;
            }

            return score;
        }

        private int CalculateInfrastructureRelevance(InfrastructureData computer, Dictionary<string, List<string>> filters, string freeText)
        {
            int score = 0;

            // Check specific filters
            if (filters.ContainsKey("computer"))
            {
                if (filters["computer"].Any(f => ContainsIgnoreCase(computer.Name, f)))
                    score += 100;
            }

            if (filters.ContainsKey("os"))
            {
                if (filters["os"].Any(f => ContainsIgnoreCase(computer.OperatingSystem, f)))
                    score += 80;
            }

            if (filters.ContainsKey("domain"))
            {
                if (filters["domain"].Any(f => ContainsIgnoreCase(computer.Domain, f)))
                    score += 50;
            }

            // Check free text
            if (!string.IsNullOrWhiteSpace(freeText))
            {
                if (ContainsIgnoreCase(computer.Name, freeText))
                    score += 80;
                else if (ContainsIgnoreCase(computer.OperatingSystem, freeText))
                    score += 60;
            }

            return score;
        }

        private int CalculateGroupRelevance(GroupData group, Dictionary<string, List<string>> filters, string freeText)
        {
            int score = 0;

            // Check specific filters
            if (filters.ContainsKey("group"))
            {
                if (filters["group"].Any(f => ContainsIgnoreCase(group.Name, f)))
                    score += 100;
            }

            if (filters.ContainsKey("domain"))
            {
                if (filters["domain"].Any(f => ContainsIgnoreCase(group.Domain, f)))
                    score += 50;
            }

            // Check free text
            if (!string.IsNullOrWhiteSpace(freeText))
            {
                if (ContainsIgnoreCase(group.Name, freeText))
                    score += 80;
                else if (ContainsIgnoreCase(group.Description, freeText))
                    score += 40;
            }

            return score;
        }

        private int CalculateApplicationRelevance(ApplicationData app, Dictionary<string, List<string>> filters, string freeText)
        {
            int score = 0;

            // Check specific filters
            if (filters.ContainsKey("application"))
            {
                if (filters["application"].Any(f => ContainsIgnoreCase(app.Name, f)))
                    score += 100;
            }

            // Check free text
            if (!string.IsNullOrWhiteSpace(freeText))
            {
                if (ContainsIgnoreCase(app.Name, freeText))
                    score += 80;
                else if (ContainsIgnoreCase(app.Publisher, freeText))
                    score += 60;
            }

            return score;
        }

        private static bool ContainsIgnoreCase(string source, string value)
        {
            return !string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(value) && 
                   source.Contains(value, StringComparison.OrdinalIgnoreCase);
        }

        private static string GetMatchType(int score)
        {
            return score switch
            {
                >= 100 => "Exact",
                >= 80 => "High",
                >= 50 => "Medium",
                _ => "Low"
            };
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _searchCancellation?.Cancel();
                _searchCancellation?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    /// <summary>
    /// Parses search filters from search text
    /// </summary>
    public class SearchFilterParser
    {
        private static readonly Regex FilterRegex = new(@"(\w+):\s*['""]?([^'""]+)['""]?", RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public Dictionary<string, List<string>> ParseFilters(string searchText)
        {
            var filters = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

            if (string.IsNullOrWhiteSpace(searchText))
                return filters;

            var matches = FilterRegex.Matches(searchText);
            foreach (Match match in matches)
            {
                var key = match.Groups[1].Value.ToLowerInvariant();
                var value = match.Groups[2].Value.Trim();

                if (!filters.ContainsKey(key))
                    filters[key] = new List<string>();

                filters[key].Add(value);
            }

            return filters;
        }

        public string GetFreeText(string searchText)
        {
            if (string.IsNullOrWhiteSpace(searchText))
                return string.Empty;

            // Remove all filter patterns and return remaining text
            var result = FilterRegex.Replace(searchText, string.Empty).Trim();
            return result;
        }

        public IEnumerable<string> GetActiveFilters(string searchText)
        {
            return ParseFilters(searchText).Keys;
        }
    }

    /// <summary>
    /// Represents a search result item
    /// </summary>
    public class SearchResultItem
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ResultType { get; set; }
        public string TypeColor { get; set; }
        public string Icon { get; set; }
        public string MatchType { get; set; }
        public int RelevanceScore { get; set; }
        public string[] Tags { get; set; } = Array.Empty<string>();
        public object Data { get; set; }
    }

    /// <summary>
    /// Represents a filter suggestion
    /// </summary>
    public class FilterSuggestion
    {
        public string FilterType { get; set; }
        public string Description { get; set; }
        public string Example { get; set; }
    }
}