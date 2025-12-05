using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Stub control for OptimizedImages.xaml compatibility
    /// </summary>
    public partial class OptimizedImage : UserControl
    {
        public OptimizedImage()
        {
            InitializeComponent();
        }

        public static readonly DependencyProperty StretchProperty =
            DependencyProperty.Register(
                "Stretch",
                typeof(Stretch),
                typeof(OptimizedImage),
                new PropertyMetadata(Stretch.Uniform));

        public static readonly DependencyProperty StretchDirectionProperty =
            DependencyProperty.Register(
                "StretchDirection",
                typeof(StretchDirection),
                typeof(OptimizedImage),
                new PropertyMetadata(StretchDirection.Both));

        public Stretch Stretch
        {
            get { return (Stretch)GetValue(StretchProperty); }
            set { SetValue(StretchProperty, value); }
        }

        public StretchDirection StretchDirection
        {
            get { return (StretchDirection)GetValue(StretchDirectionProperty); }
            set { SetValue(StretchDirectionProperty, value); }
        }

        public static readonly DependencyProperty ShowLoadingIndicatorProperty =
            DependencyProperty.Register(
                "ShowLoadingIndicator",
                typeof(bool),
                typeof(OptimizedImage),
                new PropertyMetadata(true));

        public bool ShowLoadingIndicator
        {
            get { return (bool)GetValue(ShowLoadingIndicatorProperty); }
            set { SetValue(ShowLoadingIndicatorProperty, value); }
        }

        public static readonly DependencyProperty EnableCachingProperty =
            DependencyProperty.Register(
                "EnableCaching",
                typeof(bool),
                typeof(OptimizedImage),
                new PropertyMetadata(true));

        public bool EnableCaching
        {
            get { return (bool)GetValue(EnableCachingProperty); }
            set { SetValue(EnableCachingProperty, value); }
        }

        public static readonly DependencyProperty PlaceholderTextProperty =
            DependencyProperty.Register(
                "PlaceholderText",
                typeof(string),
                typeof(OptimizedImage),
                new PropertyMetadata(string.Empty));

        public string PlaceholderText
        {
            get { return (string)GetValue(PlaceholderTextProperty); }
            set { SetValue(PlaceholderTextProperty, value); }
        }

        public static readonly DependencyProperty MaxWidthPixelsProperty =
            DependencyProperty.Register(
                "MaxWidthPixels",
                typeof(int),
                typeof(OptimizedImage),
                new PropertyMetadata(0));

        public int MaxWidthPixels
        {
            get { return (int)GetValue(MaxWidthPixelsProperty); }
            set { SetValue(MaxWidthPixelsProperty, value); }
        }

        public static readonly DependencyProperty MaxHeightPixelsProperty =
            DependencyProperty.Register(
                "MaxHeightPixels",
                typeof(int),
                typeof(OptimizedImage),
                new PropertyMetadata(0));

        public int MaxHeightPixels
        {
            get { return (int)GetValue(MaxHeightPixelsProperty); }
            set { SetValue(MaxHeightPixelsProperty, value); }
        }

        public static readonly DependencyProperty SourceProperty =
            DependencyProperty.Register(
                "Source",
                typeof(object),
                typeof(OptimizedImage),
                new PropertyMetadata(null));

        public object Source
        {
            get { return GetValue(SourceProperty); }
            set { SetValue(SourceProperty, value); }
        }
    }
}