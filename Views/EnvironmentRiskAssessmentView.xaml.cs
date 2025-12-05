using System.Windows.Controls;
using System;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for EnvironmentRiskAssessmentView.xaml
    /// </summary>
    public partial class EnvironmentRiskAssessmentView : UserControl
    {
        public EnvironmentRiskAssessmentView()
        {
            try
            {
                InitializeComponent();
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Exception initializing EnvironmentRiskAssessmentView: {ex.Message}");
                throw;
            }

            // Log successful loading
            Loaded += (s, e) =>
            {
                System.Diagnostics.Debug.WriteLine("EnvironmentRiskAssessmentView loaded successfully");
            };
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new EnvironmentRiskAssessmentView();
        }
    }
}