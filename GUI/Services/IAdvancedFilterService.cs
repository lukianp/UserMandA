using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    public interface IAdvancedFilterService
    {
        Task<IEnumerable<T>> ApplyFiltersAsync<T>(IEnumerable<T> data, FilterConfiguration filterConfig);
        Task<FilterConfiguration> SaveFilterAsync(string name, FilterConfiguration config);
        Task<List<FilterConfiguration>> GetSavedFiltersAsync();
        Task DeleteFilterAsync(string filterId);
        FilterConfiguration CreateEmptyFilter();
        List<FilterOperator> GetAvailableOperators();
        List<string> GetFilterableProperties<T>();
    }

    public class FilterConfiguration
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<FilterRule> Rules { get; set; }
        public FilterLogic Logic { get; set; } // AND or OR
        public bool IsQuickFilter { get; set; }
        public Dictionary<string, object> Metadata { get; set; }

        public FilterConfiguration()
        {
            Id = Guid.NewGuid().ToString();
            Rules = new List<FilterRule>();
            Logic = FilterLogic.And;
            Metadata = new Dictionary<string, object>();
            CreatedDate = DateTime.Now;
        }
    }

    public class FilterRule
    {
        public string Id { get; set; }
        public string PropertyName { get; set; }
        public FilterOperator Operator { get; set; }
        public object Value { get; set; }
        public object SecondaryValue { get; set; } // For Between operator
        public bool IsEnabled { get; set; }
        public FilterDataType DataType { get; set; }

        public FilterRule()
        {
            Id = Guid.NewGuid().ToString();
            IsEnabled = true;
        }
    }

    public enum FilterLogic
    {
        And,
        Or
    }

    // Using existing FilterOperator from AdvancedSearchService

    public enum FilterDataType
    {
        Text,
        Number,
        Date,
        Boolean,
        Collection,
        Enum
    }

    public class QuickFilter
    {
        public string PropertyName { get; set; }
        public string DisplayName { get; set; }
        public FilterDataType DataType { get; set; }
        public List<object> PredefinedValues { get; set; }
        public bool IsMultiSelect { get; set; }

        public QuickFilter()
        {
            PredefinedValues = new List<object>();
        }
    }
}