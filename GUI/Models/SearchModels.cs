using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    public class SearchResultItem : INotifyPropertyChanged
    {
        private bool _isSelected;
        private double _relevanceScore;

        public string Id { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public string ResultType { get; set; }
        public string IconPath { get; set; }
        public string IconGlyph { get; set; }
        public object Data { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
        public List<SearchHighlight> Highlights { get; set; }
        
        public double RelevanceScore
        {
            get => _relevanceScore;
            set => SetProperty(ref _relevanceScore, value);
        }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }

        // Additional properties needed by GlobalSearchViewModel
        public string MatchType { get; set; }
        public List<string> Tags { get; set; }
        public string TypeColor { get; set; }
        public string Icon { get; set; }

        public string FormattedType => ResultType?.Replace("_", " ");
        public string ToolTip => $"{Title}\n{Description}";

        public SearchResultItem()
        {
            Metadata = new Dictionary<string, string>();
            Highlights = new List<SearchHighlight>();
            Tags = new List<string>();
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

    public class SearchHighlight
    {
        public int StartIndex { get; set; }
        public int Length { get; set; }
        public string MatchedText { get; set; }
        public SearchHighlightType HighlightType { get; set; }
    }

    public enum SearchHighlightType
    {
        ExactMatch,
        PartialMatch,
        FuzzyMatch
    }

    public class FilterSuggestion
    {
        public string DisplayText { get; set; }
        public string FilterKey { get; set; }
        public string FilterValue { get; set; }
        public string Description { get; set; }
        public string IconGlyph { get; set; }
        public bool IsQuickFilter { get; set; }
        public int UsageCount { get; set; }
    }

    public class GlobalSearchFilter
    {
        public string Key { get; set; }
        public List<string> Values { get; set; }
        public SearchFilterOperator Operator { get; set; }
        public bool IsNegated { get; set; }

        public GlobalSearchFilter()
        {
            Values = new List<string>();
            Operator = SearchFilterOperator.Equals;
        }
    }

    public enum SearchFilterOperator
    {
        Equals,
        Contains,
        StartsWith,
        EndsWith,
        GreaterThan,
        LessThan,
        Between,
        In
    }

    public class SearchQuery
    {
        public string FreeText { get; set; }
        public Dictionary<string, GlobalSearchFilter> Filters { get; set; }
        public SearchScope Scope { get; set; }
        public int MaxResults { get; set; }
        public bool IncludeHighlights { get; set; }

        public SearchQuery()
        {
            Filters = new Dictionary<string, GlobalSearchFilter>();
            Scope = SearchScope.All;
            MaxResults = 50;
            IncludeHighlights = true;
        }
    }

    [Flags]
    public enum SearchScope
    {
        None = 0,
        Users = 1,
        Groups = 2,
        Computers = 4,
        Applications = 8,
        MigrationWaves = 16,
        MigrationTasks = 32,
        DiscoveryItems = 64,
        All = Users | Groups | Computers | Applications | MigrationWaves | MigrationTasks | DiscoveryItems
    }

    public class SearchStatistics
    {
        public int TotalResults { get; set; }
        public TimeSpan SearchDuration { get; set; }
        public Dictionary<string, int> ResultsByType { get; set; }
        public List<string> SearchTerms { get; set; }
        public bool HasMoreResults { get; set; }

        public SearchStatistics()
        {
            ResultsByType = new Dictionary<string, int>();
            SearchTerms = new List<string>();
        }
    }

    public class SearchHistoryItem
    {
        public string Id { get; set; }
        public string QueryText { get; set; }
        public DateTime Timestamp { get; set; }
        public int ResultCount { get; set; }
        public bool IsFavorite { get; set; }
        public SearchScope Scope { get; set; }

        public SearchHistoryItem()
        {
            Id = Guid.NewGuid().ToString();
            Timestamp = DateTime.Now;
        }
    }


    public class SearchIndexItem
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public Dictionary<string, object> Properties { get; set; }
        public DateTime LastModified { get; set; }
        public List<string> Tags { get; set; }
        public double Boost { get; set; } = 1.0;

        public SearchIndexItem()
        {
            Properties = new Dictionary<string, object>();
            Tags = new List<string>();
        }
    }
}