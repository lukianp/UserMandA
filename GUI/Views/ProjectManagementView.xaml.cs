using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ProjectManagementView.xaml
    /// </summary>
    public partial class ProjectManagementView : UserControl
    {
        private readonly GridLayoutOptimizationService _gridService;

        public ProjectManagementView()
        {
            InitializeComponent();
            DataContext = new ProjectManagementViewModel();
            
            _gridService = ServiceLocator.GetService<GridLayoutOptimizationService>() ?? new GridLayoutOptimizationService();
            
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            // Demonstrate SharedSizeGroup optimization by adding form fields dynamically
            SetupProjectOverviewForm();
            
            // Apply SharedSizeGroup optimization to improve layout consistency
            OptimizeGridLayouts();
        }

        private void SetupProjectOverviewForm()
        {
            // Add form fields to demonstrate SharedSizeGroup alignment
            var projectNameTextBox = new TextBox { Style = FindResource("ModernTextBoxStyle") as Style };
            var descriptionTextBox = new TextBox 
            { 
                Style = FindResource("ModernTextBoxStyle") as Style,
                AcceptsReturn = true,
                Height = 60
            };
            var managerComboBox = new ComboBox { Style = FindResource("ModernComboBoxStyle") as Style };
            managerComboBox.Items.Add("John Smith");
            managerComboBox.Items.Add("Jane Doe");
            managerComboBox.Items.Add("Mike Johnson");
            
            var budgetTextBox = new TextBox { Style = FindResource("ModernTextBoxStyle") as Style };
            var departmentComboBox = new ComboBox { Style = FindResource("ModernComboBoxStyle") as Style };
            departmentComboBox.Items.Add("IT");
            departmentComboBox.Items.Add("Finance");
            departmentComboBox.Items.Add("Operations");

            // Add fields using the OptimizedFormPanel with SharedSizeGroup
            ProjectOverviewForm.AddFields(
                ("Project Name:", projectNameTextBox, null),
                ("Description:", descriptionTextBox, null),
                ("Project Manager:", managerComboBox, null),
                ("Budget:", budgetTextBox, null),
                ("Department:", departmentComboBox, null)
            );
        }

        private void OptimizeGridLayouts()
        {
            // Register all grids with SharedSizeGroup for consistent alignment
            _gridService.RegisterGrid(ProjectOverviewForm.MainGrid, "ProjectFormGroup", GridSizeScope.Global);
            
            // Apply consistent form layout patterns
            _gridService.ApplyFormLayoutPattern(ProjectOverviewForm.MainGrid, FormLayoutType.TwoColumn);
            
            // Optimize grid performance
            _gridService.OptimizeGridPerformance(ProjectOverviewForm.MainGrid);
        }
    }
}