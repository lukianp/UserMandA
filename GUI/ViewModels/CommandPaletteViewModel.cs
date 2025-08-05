using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Command Palette
    /// </summary>
    public class CommandPaletteViewModel : BaseViewModel
    {
        private readonly IProfileService _profileService;
        private readonly IDiscoveryService _discoveryService;
        private readonly IDataService _dataService;
        
        private string _searchText = string.Empty;
        private CommandItem _selectedCommand;
        private int _selectedIndex = 0;

        public CommandPaletteViewModel(
            ILogger<CommandPaletteViewModel> logger,
            IMessenger messenger,
            IProfileService profileService,
            IDiscoveryService discoveryService,
            IDataService dataService) : base(logger, messenger)
        {
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            _discoveryService = discoveryService ?? throw new ArgumentNullException(nameof(discoveryService));
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));

            Commands = new ObservableCollection<CommandItem>();
            FilteredCommands = CollectionViewSource.GetDefaultView(Commands);
            FilteredCommands.Filter = FilterCommands;

            InitializeCommands();
            LoadCommands();
        }

        #region Properties

        public ObservableCollection<CommandItem> Commands { get; }
        public ICollectionView FilteredCommands { get; }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    FilteredCommands.Refresh();
                    ResetSelection();
                }
            }
        }

        public CommandItem SelectedCommand
        {
            get => _selectedCommand;
            set => SetProperty(ref _selectedCommand, value);
        }

        public int SelectedIndex
        {
            get => _selectedIndex;
            set
            {
                if (SetProperty(ref _selectedIndex, value))
                {
                    UpdateSelectedCommand();
                }
            }
        }

        #endregion

        #region Commands

        public ICommand MoveSelectionDownCommand { get; private set; }
        public ICommand MoveSelectionUpCommand { get; private set; }
        public ICommand ExecuteSelectedCommandCommand { get; private set; }
        public ICommand CloseCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            MoveSelectionDownCommand = new RelayCommand(MoveSelectionDown);
            MoveSelectionUpCommand = new RelayCommand(MoveSelectionUp);
            ExecuteSelectedCommandCommand = new RelayCommand(ExecuteSelectedCommand);
            CloseCommand = new RelayCommand(Close);
        }

        #endregion

        #region Public Methods

        public void MoveSelectionDown()
        {
            var filteredCount = FilteredCommands.Cast<CommandItem>().Count();
            if (filteredCount > 0)
            {
                SelectedIndex = (SelectedIndex + 1) % filteredCount;
            }
        }

        public void MoveSelectionUp()
        {
            var filteredCount = FilteredCommands.Cast<CommandItem>().Count();
            if (filteredCount > 0)
            {
                SelectedIndex = SelectedIndex == 0 ? filteredCount - 1 : SelectedIndex - 1;
            }
        }

        public void ExecuteSelectedCommand()
        {
            if (SelectedCommand?.Action != null)
            {
                try
                {
                    SelectedCommand.Action.Invoke();
                    Logger?.LogInformation("Executed command: {CommandTitle}", SelectedCommand.Title);
                    Close();
                }
                catch (Exception ex)
                {
                    Logger?.LogError(ex, "Error executing command: {CommandTitle}", SelectedCommand.Title);
                    SendMessage(new ErrorMessage("Command Execution Failed", ex, SelectedCommand.Title));
                }
            }
        }

        public void Close()
        {
            SendMessage(new NavigationMessage("CloseCommandPalette"));
        }

        #endregion

        #region Private Methods

        private bool FilterCommands(object item)
        {
            if (item is CommandItem command)
            {
                if (string.IsNullOrWhiteSpace(SearchText))
                    return true;

                var searchLower = SearchText.ToLowerInvariant();
                return command.Title.ToLowerInvariant().Contains(searchLower) ||
                       command.Description.ToLowerInvariant().Contains(searchLower) ||
                       command.Category.ToLowerInvariant().Contains(searchLower) ||
                       (command.Keywords?.Any(k => k.ToLowerInvariant().Contains(searchLower)) == true);
            }
            return false;
        }

        private void ResetSelection()
        {
            SelectedIndex = 0;
            UpdateSelectedCommand();
        }

        private void UpdateSelectedCommand()
        {
            var filteredItems = FilteredCommands.Cast<CommandItem>().ToList();
            if (filteredItems.Count > 0 && SelectedIndex >= 0 && SelectedIndex < filteredItems.Count)
            {
                SelectedCommand = filteredItems[SelectedIndex];
            }
            else
            {
                SelectedCommand = null;
            }
        }

        private void LoadCommands()
        {
            Commands.Clear();

            // Navigation Commands
            AddNavigationCommands();
            
            // Discovery Commands
            AddDiscoveryCommands();
            
            // Data Commands
            AddDataCommands();
            
            // View Commands
            AddViewCommands();
            
            // Profile Commands
            AddProfileCommands();
            
            // Utility Commands
            AddUtilityCommands();
        }

        private void AddNavigationCommands()
        {
            var categoryColor = "#FF2563EB"; // Blue

            Commands.Add(new CommandItem
            {
                Title = "Go to Dashboard",
                Description = "Navigate to the main dashboard view",
                Category = "Navigation",
                CategoryColor = categoryColor,
                Icon = "\uE80F", // Home icon
                KeyboardShortcut = "Ctrl+1",
                Keywords = new[] { "dashboard", "home", "main" },
                Action = () => SendMessage(new NavigationMessage("Dashboard"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Go to Discovery Modules",
                Description = "Navigate to discovery modules configuration",
                Category = "Navigation",
                CategoryColor = categoryColor,
                Icon = "\uE8B5", // Settings icon
                KeyboardShortcut = "Ctrl+2",
                Keywords = new[] { "discovery", "modules", "configuration" },
                Action = () => SendMessage(new NavigationMessage("Discovery"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Go to Users View",
                Description = "Navigate to users data view",
                Category = "Navigation",
                CategoryColor = categoryColor,
                Icon = "\uE716", // People icon
                KeyboardShortcut = "Ctrl+3",
                Keywords = new[] { "users", "people", "accounts" },
                Action = () => SendMessage(new NavigationMessage("Users"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Go to Infrastructure View",
                Description = "Navigate to infrastructure data view",
                Category = "Navigation",
                CategoryColor = categoryColor,
                Icon = "\uE968", // Server icon
                KeyboardShortcut = "Ctrl+4",
                Keywords = new[] { "infrastructure", "servers", "computers" },
                Action = () => SendMessage(new NavigationMessage("Infrastructure"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Go to Project Management",
                Description = "Navigate to M&A project management runbook",
                Category = "Navigation",
                CategoryColor = categoryColor,
                Icon = "\uE8F4", // Project icon
                KeyboardShortcut = "Ctrl+5",
                Keywords = new[] { "project", "management", "runbook", "migration" },
                Action = () => SendMessage(new NavigationMessage("ProjectManagement"))
            });
        }

        private void AddDiscoveryCommands()
        {
            var categoryColor = "#FF059669"; // Green

            Commands.Add(new CommandItem
            {
                Title = "Start Full Discovery",
                Description = "Start discovery for all enabled modules",
                Category = "Discovery",
                CategoryColor = categoryColor,
                Icon = "\uE768", // Play icon
                Keywords = new[] { "start", "run", "discovery", "scan" },
                Action = () => SendMessage(new NavigationMessage("StartDiscovery"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Stop Discovery",
                Description = "Stop the currently running discovery process",
                Category = "Discovery",
                CategoryColor = categoryColor,
                Icon = "\uE769", // Stop icon
                Keywords = new[] { "stop", "cancel", "discovery" },
                Action = () => SendMessage(new NavigationMessage("StopDiscovery"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Refresh Discovery Results",
                Description = "Reload discovery data from files",
                Category = "Discovery",
                CategoryColor = categoryColor,
                Icon = "\uE72C", // Refresh icon
                KeyboardShortcut = "F5",
                Keywords = new[] { "refresh", "reload", "update" },
                Action = () => SendMessage(new DataRefreshRequestMessage("All", "Current", true))
            });
        }

        private void AddDataCommands()
        {
            var categoryColor = "#FF7C3AED"; // Purple

            Commands.Add(new CommandItem
            {
                Title = "Export All Data",
                Description = "Export all discovered data to CSV files",
                Category = "Data",
                CategoryColor = categoryColor,
                Icon = "\uE78C", // Download icon
                Keywords = new[] { "export", "download", "csv", "data" },
                Action = () => SendMessage(new NavigationMessage("ExportData"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Clear Data Cache",
                Description = "Clear all cached discovery data",
                Category = "Data",
                CategoryColor = categoryColor,
                Icon = "\uE74D", // Delete icon
                Keywords = new[] { "clear", "cache", "memory" },
                Action = async () => 
                {
                    var profile = await _profileService.GetCurrentProfileAsync();
                    if (profile != null)
                    {
                        await _dataService.ClearCacheAsync(profile.Name);
                        SendMessage(new StatusMessage("Data cache cleared successfully", StatusType.Success));
                    }
                }
            });

            Commands.Add(new CommandItem
            {
                Title = "View Data Summary",
                Description = "Show summary statistics for current profile",
                Category = "Data",
                CategoryColor = categoryColor,
                Icon = "\uE9A9", // Chart icon
                Keywords = new[] { "summary", "statistics", "overview" },
                Action = () => SendMessage(new NavigationMessage("DataSummary"))
            });
        }

        private void AddViewCommands()
        {
            var categoryColor = "#FFDC2626"; // Red

            Commands.Add(new CommandItem
            {
                Title = "Toggle Dark Theme",
                Description = "Switch between dark and light themes",
                Category = "View",
                CategoryColor = categoryColor,
                Icon = "\uE706", // Sun/Moon icon
                KeyboardShortcut = "Ctrl+Shift+T",
                Keywords = new[] { "theme", "dark", "light", "appearance" },
                Action = () => SendMessage(new NavigationMessage("ToggleTheme"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Focus Search",
                Description = "Focus the main search box",
                Category = "View",
                CategoryColor = categoryColor,
                Icon = "\uE721", // Search icon
                KeyboardShortcut = "Ctrl+F",
                Keywords = new[] { "search", "find", "filter" },
                Action = () => SendMessage(new NavigationMessage("FocusSearch"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Show/Hide Status Bar",
                Description = "Toggle the status bar visibility",
                Category = "View",
                CategoryColor = categoryColor,
                Icon = "\uE8A7", // View icon
                Keywords = new[] { "status", "bar", "show", "hide" },
                Action = () => SendMessage(new NavigationMessage("ToggleStatusBar"))
            });
        }

        private void AddProfileCommands()
        {
            var categoryColor = "#FFEA580C"; // Orange

            Commands.Add(new CommandItem
            {
                Title = "Create New Profile",
                Description = "Create a new company discovery profile",
                Category = "Profile",
                CategoryColor = categoryColor,
                Icon = "\uE710", // Add icon
                KeyboardShortcut = "Ctrl+N",
                Keywords = new[] { "create", "new", "profile", "company" },
                Action = () => SendMessage(new NavigationMessage("CreateProfile"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Switch Profile",
                Description = "Switch to a different company profile",
                Category = "Profile",
                CategoryColor = categoryColor,
                Icon = "\uE8AB", // Switch icon
                Keywords = new[] { "switch", "profile", "company", "change" },
                Action = () => SendMessage(new NavigationMessage("SwitchProfile"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Edit Current Profile",
                Description = "Edit the current company profile settings",
                Category = "Profile",
                CategoryColor = categoryColor,
                Icon = "\uE70F", // Edit icon
                Keywords = new[] { "edit", "profile", "settings", "configure" },
                Action = () => SendMessage(new NavigationMessage("EditProfile"))
            });
        }

        private void AddUtilityCommands()
        {
            var categoryColor = "#FF6B7280"; // Gray

            Commands.Add(new CommandItem
            {
                Title = "Show Keyboard Shortcuts",
                Description = "Display all available keyboard shortcuts",
                Category = "Help",
                CategoryColor = categoryColor,
                Icon = "\uE765", // Keyboard icon
                KeyboardShortcut = "F1",
                Keywords = new[] { "help", "shortcuts", "keyboard", "hotkeys" },
                Action = () => SendMessage(new NavigationMessage("ShowShortcuts"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Show About Dialog",
                Description = "Show application version and information",
                Category = "Help",
                CategoryColor = categoryColor,
                Icon = "\uE946", // Info icon
                Keywords = new[] { "about", "version", "info", "help" },
                Action = () => SendMessage(new NavigationMessage("ShowAbout"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Open Data Directory",
                Description = "Open the discovery data directory in File Explorer",
                Category = "Utility",
                CategoryColor = categoryColor,
                Icon = "\uE8DA", // Folder icon
                Keywords = new[] { "open", "folder", "directory", "explorer" },
                Action = () => SendMessage(new NavigationMessage("OpenDataDirectory"))
            });

            Commands.Add(new CommandItem
            {
                Title = "Exit Application",
                Description = "Close the M&A Discovery Suite application",
                Category = "Utility",
                CategoryColor = categoryColor,
                Icon = "\uE8BB", // Close icon
                KeyboardShortcut = "Alt+F4",
                Keywords = new[] { "exit", "quit", "close", "shutdown" },
                Action = () => SendMessage(new NavigationMessage("ExitApplication"))
            });
        }

        #endregion
    }

    /// <summary>
    /// Represents a command item in the command palette
    /// </summary>
    public class CommandItem
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string CategoryColor { get; set; }
        public string Icon { get; set; }
        public string KeyboardShortcut { get; set; }
        public string[] Keywords { get; set; }
        public Action Action { get; set; }
    }
}