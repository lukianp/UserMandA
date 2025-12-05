using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Empty state view for displaying helpful messages when data is not available
    /// </summary>
    public partial class EmptyStateView : UserControl
    {
        public EmptyStateView()
        {
#pragma warning disable CS0103 // The name 'InitializeComponent' does not exist in the current context
            InitializeComponent();
#pragma warning restore CS0103
        }

        #region Dependency Properties

        public static readonly DependencyProperty IconProperty =
            DependencyProperty.Register("Icon", typeof(string), typeof(EmptyStateView), 
                new PropertyMetadata("&#xE7C3;")); // Default folder icon

        public static readonly DependencyProperty TitleProperty =
            DependencyProperty.Register("Title", typeof(string), typeof(EmptyStateView),
                new PropertyMetadata("No Data Available"));

        public static readonly DependencyProperty DescriptionProperty =
            DependencyProperty.Register("Description", typeof(string), typeof(EmptyStateView),
                new PropertyMetadata("There is no data to display at the moment."));

        public static readonly DependencyProperty PrimaryActionTextProperty =
            DependencyProperty.Register("PrimaryActionText", typeof(string), typeof(EmptyStateView),
                new PropertyMetadata("Get Started"));

        public static readonly DependencyProperty PrimaryActionCommandProperty =
            DependencyProperty.Register("PrimaryActionCommand", typeof(ICommand), typeof(EmptyStateView),
                new PropertyMetadata(null));

        public static readonly DependencyProperty SecondaryActionTextProperty =
            DependencyProperty.Register("SecondaryActionText", typeof(string), typeof(EmptyStateView),
                new PropertyMetadata("Learn More"));

        public static readonly DependencyProperty SecondaryActionCommandProperty =
            DependencyProperty.Register("SecondaryActionCommand", typeof(ICommand), typeof(EmptyStateView),
                new PropertyMetadata(null));

        public static readonly DependencyProperty HasPrimaryActionProperty =
            DependencyProperty.Register("HasPrimaryAction", typeof(bool), typeof(EmptyStateView),
                new PropertyMetadata(false));

        public static readonly DependencyProperty HasSecondaryActionProperty =
            DependencyProperty.Register("HasSecondaryAction", typeof(bool), typeof(EmptyStateView),
                new PropertyMetadata(false));

        #endregion

        #region Properties

        /// <summary>
        /// Icon to display (Segoe MDL2 Assets character code)
        /// </summary>
        public string Icon
        {
            get { return (string)GetValue(IconProperty); }
            set { SetValue(IconProperty, value); }
        }

        /// <summary>
        /// Title text to display
        /// </summary>
        public string Title
        {
            get { return (string)GetValue(TitleProperty); }
            set { SetValue(TitleProperty, value); }
        }

        /// <summary>
        /// Description text to display
        /// </summary>
        public string Description
        {
            get { return (string)GetValue(DescriptionProperty); }
            set { SetValue(DescriptionProperty, value); }
        }

        /// <summary>
        /// Primary action button text
        /// </summary>
        public string PrimaryActionText
        {
            get { return (string)GetValue(PrimaryActionTextProperty); }
            set { SetValue(PrimaryActionTextProperty, value); }
        }

        /// <summary>
        /// Primary action button command
        /// </summary>
        public ICommand PrimaryActionCommand
        {
            get { return (ICommand)GetValue(PrimaryActionCommandProperty); }
            set 
            { 
                SetValue(PrimaryActionCommandProperty, value);
                HasPrimaryAction = value != null;
            }
        }

        /// <summary>
        /// Secondary action button text
        /// </summary>
        public string SecondaryActionText
        {
            get { return (string)GetValue(SecondaryActionTextProperty); }
            set { SetValue(SecondaryActionTextProperty, value); }
        }

        /// <summary>
        /// Secondary action button command
        /// </summary>
        public ICommand SecondaryActionCommand
        {
            get { return (ICommand)GetValue(SecondaryActionCommandProperty); }
            set 
            { 
                SetValue(SecondaryActionCommandProperty, value);
                HasSecondaryAction = value != null;
            }
        }

        /// <summary>
        /// Whether to show the primary action button
        /// </summary>
        public bool HasPrimaryAction
        {
            get { return (bool)GetValue(HasPrimaryActionProperty); }
            set { SetValue(HasPrimaryActionProperty, value); }
        }

        /// <summary>
        /// Whether to show the secondary action button
        /// </summary>
        public bool HasSecondaryAction
        {
            get { return (bool)GetValue(HasSecondaryActionProperty); }
            set { SetValue(HasSecondaryActionProperty, value); }
        }

        #endregion

        #region Static Factory Methods

        /// <summary>
        /// Creates an empty state for when no users are found
        /// </summary>
        public static EmptyStateView CreateNoUsersState(ICommand? runDiscoveryCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE77B;", // Person icon
                Title = "No Users Found",
                Description = "No users have been discovered yet. Run the Active Directory or Entra ID discovery module to populate user data.",
                PrimaryActionText = "Run Discovery",
                PrimaryActionCommand = runDiscoveryCommand,
                SecondaryActionText = "View Modules",
                HasPrimaryAction = runDiscoveryCommand != null
            };
        }

        /// <summary>
        /// Creates an empty state for when no computers are found
        /// </summary>
        public static EmptyStateView CreateNoComputersState(ICommand runDiscoveryCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE7F8;", // Computer icon
                Title = "No Computers Found",
                Description = "No computers have been discovered yet. Run the infrastructure discovery modules to populate device data.",
                PrimaryActionText = "Run Discovery",
                PrimaryActionCommand = runDiscoveryCommand,
                SecondaryActionText = "View Modules",
                HasPrimaryAction = runDiscoveryCommand != null
            };
        }

        /// <summary>
        /// Creates an empty state for when no groups are found
        /// </summary>
        public static EmptyStateView CreateNoGroupsState(ICommand runDiscoveryCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE902;", // Group icon
                Title = "No Groups Found",
                Description = "No groups have been discovered yet. Run the Active Directory or Entra ID discovery module to populate group data.",
                PrimaryActionText = "Run Discovery",
                PrimaryActionCommand = runDiscoveryCommand,
                SecondaryActionText = "View Modules",
                HasPrimaryAction = runDiscoveryCommand != null
            };
        }

        /// <summary>
        /// Creates an empty state for search results
        /// </summary>
        public static EmptyStateView CreateNoSearchResultsState(string searchTerm, ICommand clearSearchCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE721;", // Search icon
                Title = "No Results Found",
                Description = $"No items match your search for '{searchTerm}'. Try adjusting your search terms or clearing the current filter.",
                PrimaryActionText = "Clear Search",
                PrimaryActionCommand = clearSearchCommand,
                SecondaryActionText = "Advanced Search",
                HasPrimaryAction = clearSearchCommand != null
            };
        }

        /// <summary>
        /// Creates an empty state for when data is loading
        /// </summary>
        public static EmptyStateView CreateLoadingState()
        {
            return new EmptyStateView
            {
                Icon = "&#xE895;", // Progress ring icon
                Title = "Loading Data",
                Description = "Please wait while we load your data...",
                HasPrimaryAction = false,
                HasSecondaryAction = false
            };
        }

        /// <summary>
        /// Creates an empty state for errors
        /// </summary>
        public static EmptyStateView CreateErrorState(string errorMessage, ICommand retryCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE783;", // Error icon
                Title = "Unable to Load Data",
                Description = errorMessage ?? "An error occurred while loading data. Please try again.",
                PrimaryActionText = "Retry",
                PrimaryActionCommand = retryCommand,
                SecondaryActionText = "Contact Support",
                HasPrimaryAction = retryCommand != null
            };
        }

        /// <summary>
        /// Creates an empty state for when no profile is selected
        /// </summary>
        public static EmptyStateView CreateNoProfileState(ICommand createProfileCommand = null)
        {
            return new EmptyStateView
            {
                Icon = "&#xE8B7;", // Folder open icon
                Title = "No Profile Selected",
                Description = "Select a company profile to view discovery data, or create a new profile to get started.",
                PrimaryActionText = "Create Profile",
                PrimaryActionCommand = createProfileCommand,
                SecondaryActionText = "Select Profile",
                HasPrimaryAction = createProfileCommand != null
            };
        }

        #endregion
    }
}