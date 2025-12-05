using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GanttChartView.xaml
    /// </summary>
    public partial class GanttChartView : UserControl
    {
        public GanttChartView()
        {
            InitializeComponent();
            
            // Initialize with empty project - should be populated by dependency injection
            var emptyProject = CreateEmptyProject();
            var viewModel = new GanttViewModel(emptyProject);
            DataContext = viewModel;
        }
        
        private MigrationProject CreateEmptyProject()
        {
            var project = new MigrationProject
            {
                ProjectName = "No Project Loaded",
                StartDate = System.DateTime.Today,
                EndDate = System.DateTime.Today.AddDays(90),
                OverallProgress = 0.0
            };
            
            return project;
        }
    }
}