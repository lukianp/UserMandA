using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Shimmer loading animation for displaying placeholder content while data loads
    /// </summary>
    public partial class ShimmerLoadingView : UserControl
    {
        public ShimmerLoadingView()
        {
            InitializeComponent();
            UpdateShimmerContent();
        }

        #region Dependency Properties

        public static readonly DependencyProperty ShimmerTypeProperty =
            DependencyProperty.Register("ShimmerType", typeof(ShimmerType), typeof(ShimmerLoadingView),
                new PropertyMetadata(ShimmerType.ListItems, OnShimmerTypeChanged));

        public static readonly DependencyProperty ItemCountProperty =
            DependencyProperty.Register("ItemCount", typeof(int), typeof(ShimmerLoadingView),
                new PropertyMetadata(5, OnItemCountChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Type of shimmer animation to display
        /// </summary>
        public ShimmerType ShimmerType
        {
            get { return (ShimmerType)GetValue(ShimmerTypeProperty); }
            set { SetValue(ShimmerTypeProperty, value); }
        }

        /// <summary>
        /// Number of shimmer items to display
        /// </summary>
        public int ItemCount
        {
            get { return (int)GetValue(ItemCountProperty); }
            set { SetValue(ItemCountProperty, value); }
        }

        #endregion

        #region Event Handlers

        private static void OnShimmerTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ShimmerLoadingView shimmerView)
            {
                shimmerView.UpdateShimmerContent();
            }
        }

        private static void OnItemCountChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ShimmerLoadingView shimmerView)
            {
                shimmerView.UpdateShimmerContent();
            }
        }

        #endregion

        #region Private Methods

        private void UpdateShimmerContent()
        {
            if (ShimmerItemsControl == null) return;

            // Clear existing items
            ShimmerItemsControl.ItemsSource = null;

            // Set appropriate template based on shimmer type
            DataTemplate template = ShimmerType switch
            {
                ShimmerType.ListItems => (DataTemplate)Resources["ListItemShimmerTemplate"],
                ShimmerType.Cards => (DataTemplate)Resources["CardShimmerTemplate"],
                ShimmerType.TableRows => (DataTemplate)Resources["TableRowShimmerTemplate"],
                _ => (DataTemplate)Resources["ListItemShimmerTemplate"]
            };

            ShimmerItemsControl.ItemTemplate = template;

            // Create placeholder items
            var placeholders = Enumerable.Range(0, ItemCount).Select(i => new object()).ToList();
            ShimmerItemsControl.ItemsSource = placeholders;

            // Update layout panel based on type
            UpdateItemsPanelTemplate();
        }

        private void UpdateItemsPanelTemplate()
        {
            ItemsPanelTemplate panelTemplate = ShimmerType switch
            {
                ShimmerType.Cards => CreateGridPanelTemplate(),
                ShimmerType.TableRows => CreateStackPanelTemplate(),
                ShimmerType.ListItems => CreateStackPanelTemplate(),
                _ => CreateStackPanelTemplate()
            };

            ShimmerItemsControl.ItemsPanel = panelTemplate;
        }

        private ItemsPanelTemplate CreateStackPanelTemplate()
        {
            var factory = new FrameworkElementFactory(typeof(StackPanel));
            factory.SetValue(StackPanel.OrientationProperty, Orientation.Vertical);
            return new ItemsPanelTemplate(factory);
        }

        private ItemsPanelTemplate CreateGridPanelTemplate()
        {
            var factory = new FrameworkElementFactory(typeof(UniformGrid));
            factory.SetValue(UniformGrid.ColumnsProperty, 3);
            return new ItemsPanelTemplate(factory);
        }

        #endregion

        #region Static Factory Methods

        /// <summary>
        /// Creates a shimmer for loading user list
        /// </summary>
        public static ShimmerLoadingView CreateUserListShimmer(int itemCount = 8)
        {
            return new ShimmerLoadingView
            {
                ShimmerType = ShimmerType.ListItems,
                ItemCount = itemCount
            };
        }

        /// <summary>
        /// Creates a shimmer for loading dashboard cards
        /// </summary>
        public static ShimmerLoadingView CreateDashboardShimmer(int cardCount = 6)
        {
            return new ShimmerLoadingView
            {
                ShimmerType = ShimmerType.Cards,
                ItemCount = cardCount
            };
        }

        /// <summary>
        /// Creates a shimmer for loading table data
        /// </summary>
        public static ShimmerLoadingView CreateTableShimmer(int rowCount = 10)
        {
            return new ShimmerLoadingView
            {
                ShimmerType = ShimmerType.TableRows,
                ItemCount = rowCount
            };
        }

        /// <summary>
        /// Creates a shimmer for loading computer list
        /// </summary>
        public static ShimmerLoadingView CreateComputerListShimmer(int itemCount = 8)
        {
            return new ShimmerLoadingView
            {
                ShimmerType = ShimmerType.ListItems,
                ItemCount = itemCount
            };
        }

        /// <summary>
        /// Creates a shimmer for loading group list
        /// </summary>
        public static ShimmerLoadingView CreateGroupListShimmer(int itemCount = 6)
        {
            return new ShimmerLoadingView
            {
                ShimmerType = ShimmerType.ListItems,
                ItemCount = itemCount
            };
        }

        #endregion
    }

    /// <summary>
    /// Types of shimmer animations available
    /// </summary>
    public enum ShimmerType
    {
        /// <summary>
        /// Shimmer for list items with avatar, title, and subtitle
        /// </summary>
        ListItems,

        /// <summary>
        /// Shimmer for dashboard cards
        /// </summary>
        Cards,

        /// <summary>
        /// Shimmer for table rows
        /// </summary>
        TableRows
    }
}