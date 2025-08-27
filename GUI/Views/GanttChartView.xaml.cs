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
            
            // Create a sample project for now - this would normally come from a service
            var sampleProject = CreateSampleProject();
            var viewModel = new GanttViewModel(sampleProject);
            DataContext = viewModel;
        }
        
        private MigrationProject CreateSampleProject()
        {
            var project = new MigrationProject
            {
                ProjectName = "Sample Migration Project",
                StartDate = System.DateTime.Today,
                EndDate = System.DateTime.Today.AddDays(90),
                OverallProgress = 25.0
            };
            
            // The MigrationProject already initializes phases in its constructor
            // We can add additional phases or customize existing ones here if needed
            
            return project;
        }
    }
}