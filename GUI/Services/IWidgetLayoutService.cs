using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Services
{
    public interface IWidgetLayoutService
    {
        Task<List<WidgetConfiguration>> LoadWidgetLayoutAsync();
        Task SaveWidgetLayoutAsync(IEnumerable<WidgetViewModel> widgets);
        Task<List<WidgetViewModel>> CreateDefaultWidgetsAsync();
        Task ResetToDefaultLayoutAsync();
    }

    public class WidgetConfiguration
    {
        public string WidgetType { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public bool IsVisible { get; set; }
        public int Row { get; set; }
        public int Column { get; set; }
        public int RowSpan { get; set; }
        public int ColumnSpan { get; set; }
    }
}