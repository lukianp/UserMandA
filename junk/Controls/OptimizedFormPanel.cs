using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Stub control for ProjectManagementView.xaml compatibility
    /// </summary>
    public partial class OptimizedFormPanel : UserControl
    {
        public OptimizedFormPanel()
        {
            InitializeComponent();
        }

        public static readonly DependencyProperty FormLayoutTypeProperty =
            DependencyProperty.Register(
                "FormLayoutType",
                typeof(string),
                typeof(OptimizedFormPanel),
                new PropertyMetadata("TwoColumn"));

        public string FormLayoutType
        {
            get { return (string)GetValue(FormLayoutTypeProperty); }
            set { SetValue(FormLayoutTypeProperty, value); }
        }

        public string SizeGroupName { get; set; }
        public bool IsOptimized { get; set; }
    }
}