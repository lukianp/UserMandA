using System.Windows.Controls;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for EnvironmentRiskAssessmentView.xaml
    /// </summary>
    public partial class EnvironmentRiskAssessmentView : UserControl
    {
        public EnvironmentRiskAssessmentView()
        {
            InitializeComponent();
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new EnvironmentRiskAssessmentView();
        }
    }
}