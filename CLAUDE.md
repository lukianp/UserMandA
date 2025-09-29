- The M&A Discovery Suite GUI is a WPF application designed to present data collected from various discovery modules (Active Directory, Azure AD, Exchange, File Servers, etc.) in a unified interface. It follows a classic MVVM (Model-View-ViewModel) pattern with a strong emphasis on modularity, performance, and user experience. The application is structured into multiple sections (Users, Groups, Infrastructure, Applications, Databases, Policies, Security, Migrations, etc.), each backed by its own data model and viewmodel, but all following a consistent design philosophy.

Key features of the design include:

Dynamic Data Loading from CSVs: The GUI does not use a direct database. Instead, it loads data from CSV files produced by external discovery scripts. A robust CSV loading service maps raw data into in-memory models, handling differences in columns and formats gracefully.

Tab-Based Navigation: The main interface uses a TabControl paradigm where each opened section (e.g., Users, Groups, Reports) appears as a tab. Users can open multiple tabs, and the system prevents duplicates (reusing an existing tab if the user reopens the same section).

Unified Error and Status Handling: All views provide consistent feedback via on-screen banners for warnings (e.g., missing data columns) and errors (exceptions during load), and an interactive loading spinner during data fetch.

Theming and Styles: A comprehensive theming system allows for Light/Dark/High-Contrast modes with centralized resource dictionaries for colors, styles, and control templates. This ensures a uniform look and accessibility compliance across the entire app.

Extensibility: The design is highly modular – adding a new discovery module mostly involves creating a new data model, a viewmodel with the standard loading logic, and a view XAML following the established pattern, then registering it in one place (the ViewRegistry).

Project Structure

The GUI project is organized into folders by function:

Views/ – XAML UI layouts for each screen or component (e.g., UsersView.xaml, GroupsView.xaml, DashboardView.xaml, etc.). These are primarily UserControl files that represent the content of each tab or dialog.

ViewModels/ – C# classes implementing the presentation logic for each view (e.g., UsersViewModel.cs, SecurityPolicyViewModel.cs). They handle loading data, exposing observable properties/collections, and commanding (ICommand implementations for user actions).

Models/ – Data model classes, often defined as immutable records, that represent a row or entity of data (for example, UserData, GroupData, ComputerData, etc.). These are populated from CSVs. Immutability ensures data integrity once loaded
GitHub
.

Services/ – Singleton or utility classes that provide shared functionality:

CsvDataServiceNew (and related interfaces) for reading CSV files and mapping columns.

LogicEngineService for higher-level data aggregation and inference across modules (e.g., correlating users to groups, etc.).

ConfigurationService for managing paths and application settings (e.g., where data files are located)
GitHub
GitHub
.

ProfileService for handling active profile selection (e.g., to support multi-tenant or multi-company data).

NavigationService, TabsService for controlling the tabbed UI navigation logic.

AuditService, LogManagementService for structured logging and audit trail recording.

Others include ThemeService, KeyboardShortcutService, and various migration-related services (which handle business logic for moving data between systems in an M&A scenario).

Resources/ and Themes/ – XAML resource dictionaries for styling (colors, brushes, control styles, data templates, animations, etc.). For example, Themes/HighContrastTheme.xaml defines the high-contrast color palette, while Resources/DataGridTheme.xaml might adjust DataGrid styles globally.

Dialogs/ or Windows/ – XAML and code for secondary windows or dialog popups (e.g., a detailed view dialog, or a confirmation dialog). (If not present as a folder, these might be grouped under Views as well.)

.claude/ – (If present) configuration files for AI agents (this is meta and not part of runtime, but used in development automation).

Additionally, outside the GUI folder:

Scripts/ – PowerShell scripts that the GUI or backend might call (e.g., to launch discovery modules, or build/deploy the app).

Modules/ – PowerShell modules implementing the actual discovery logic (not directly part of the GUI, but the GUI’s data corresponds to output from these).

Application Startup

When the application launches, it goes through the following startup sequence:

App Initialization: App.xaml is the WPF application definition. It merges some base resource dictionaries (converters, basic styles, theme definitions) and specifies StartupUri="MandADiscoverySuite.xaml"
GitHub
, which means the main window is defined in MandADiscoverySuite.xaml (also referred to as MainWindow).

Dependency Injection Configuration: In App.xaml.cs (the code-behind for the App), the OnStartup override configures the DI container and global exception handling. The code uses Microsoft.Extensions.DependencyInjection to register services and viewmodels at startup
GitHub
GitHub
. This provides a central IServiceProvider (App.ServiceProvider) for resolving dependencies. For example, it registers MainViewModel as a singleton, so that the main window can obtain its viewmodel from the container
GitHub
. Basic services like logging, configuration, and the WeakReferenceMessenger (for MVVM messaging) are also set up here
GitHub
GitHub
.

Main Window Creation: WPF automatically instantiates the MandADiscoverySuite.xaml window after OnStartup. The window’s code-behind (MandADiscoverySuite.xaml.cs) acts as the MainWindow of the app. In the constructor, it initializes UI components (InitializeComponent()), sets up a global keyboard shortcut manager, and retrieves the MainViewModel from the DI container
GitHub
. It then assigns DataContext = ViewModel
GitHub
, so that all data-binding in XAML is wired to the MainViewModel. Any failure in this process is caught and logged – the app is designed to catch startup exceptions and show a “Critical error” message box rather than just crashing
GitHub
GitHub
.

Showing the Window: The main window is explicitly shown via this.Show() in code (after initialization)
GitHub
. At this point, the UI is up and running, but the content of each section/tab might still be loading data asynchronously.

Main Window Layout and Navigation

The main window (MandADiscoverySuite.xaml) is structured as a two-column layout:

Left Sidebar: A fixed-width panel containing the navigation menu and context controls (such as profile selectors). In the current design, this sidebar shows:

The application title and logo (top section)
GitHub
.

Profile selection for “Source” and “Target” companies in an M&A scenario, with combo-boxes to select profiles and status indicators for environment/connection health
GitHub
GitHub
. There are also buttons for testing connections (🔗), switching profiles (→), creating/deleting profiles (+ / ×), and performing tenant app registration (🔐)
GitHub
GitHub
.

A series of navigation buttons (or sometimes menu items) for each major view. For example, buttons for Dashboard, Discovery, Users, Groups, Infrastructure, Applications, Security, Reports, Settings, etc., each bound to a command on the MainViewModel (like ShowUsersViewCommand, ShowReportsViewCommand, etc.). These commands ultimately invoke the navigation logic (see NavigateCommand in MainViewModel).

Optionally, below that, status info or shortcuts can be listed (the design supports adding more entries like shortcuts guide, etc.).

Main Content Area (Tabs): The right side (the * column) contains a TabControl where each tab is a section opened by the user
GitHub
. The TabControl itself is part of the main window XAML, but it typically does not have hardcoded TabItems in XAML; instead, tabs are added dynamically via code. The MainViewModel (with help of TabsService) manages an observable collection of open tabs
GitHub
. Each tab’s content is a UserControl for the respective view, and its header is the title (e.g., “Users” or “File Servers”).

Initially, the TabControl may start empty or with a default Dashboard tab. The user triggers navigation (either by clicking a sidebar button or via a keyboard shortcut like Ctrl+1 for Dashboard). This executes a command bound to MainViewModel, which in turn calls NavigationService.NavigateTo(<ViewKey>). The navigation service uses the ViewRegistry to map a string key to a UserControl instance.

ViewRegistry: This is essentially a factory registry that knows how to instantiate each view. It’s a singleton (ViewRegistry.Instance) containing a dictionary of keys to lambda constructors
GitHub
. For example, "users" maps to () => new UsersViewNew(), "groups" to new GroupsViewNew(), "securitypolicy" to new SecurityPolicyView(), etc.
GitHub
GitHub
. It also includes some aliases and legacy keys for convenience. When NavigateTo("users") is called, the registry creates the UsersViewNew UserControl. Each UserControl on creation will typically also instantiate its corresponding ViewModel (usually via XAML DataContext or code-behind). In some cases, the ViewRegistry uses a static factory if the view requires parameters (e.g., ActiveDirectoryDiscoveryView.CreateView(null, null) is used to inject services)
GitHub
.

TabsService: Once the view is created, it’s handed to TabsService.OpenTabAsync(key) to either show an existing tab or create a new tab item with that content
GitHub
GitHub
. The TabsService ensures only one tab per view “key” exists – if you navigate to an already open section, it will just activate that tab instead of opening another
GitHub
. Opening a new tab involves:

Initializing the view (setting its DataContext to a new ViewModel, if not already set).

Optionally calling an async load method on the ViewModel to fetch data (done in the background after the tab is added, to keep UI responsive)
GitHub
.

Wrapping the UserControl in a TabItem with appropriate header and adding it to the observable Tabs collection
GitHub
. The TabControl in XAML is data-bound to this collection (e.g., ItemsSource="{Binding OpenTabs}"), so it updates automatically.

Selecting the new tab in the UI.

Lazy Loading Pattern: To improve performance and UX, the application employs lazy loading for heavy views. In the MainWindow code-behind, after initial show, it hooks the window’s Loaded event (MainWindow_Loaded)
GitHub
. This event handler finds certain UI elements by name (DashboardView, UsersView, etc.) that are pre-defined in XAML and calls MainViewModel.SetupLazyView("ViewName", element, onFirstActivate) for each
GitHub
GitHub
. The SetupLazyView method in MainViewModel likely records the mapping and maybe prepares the command such that the actual data loading for a view only happens the first time the tab is shown. For example, SetupLazyView("Users", usersViewElement, callback) will attach an action so that when the “Users” view is first activated, it triggers RefreshUsersCommand to load the data
GitHub
. Subsequent navigations to that tab won’t reload unless explicitly requested. This is a trade-off: some views might actually be pre-initialized but hidden, allowing instant display on click, while their data is still loaded on demand.

(Note: The exact mechanism of SetupLazyView can be confirmed in MainViewModel; the concept is that heavy data queries run only when needed, not all at startup. Also, the code hints at a PreInitializeCriticalViewsAsync() that, after 2 seconds idle, will load certain key views in the background
GitHub
 to make them ready
GitHub
.)

Unified Data Loading Pipeline

All data-oriented ViewModels in the application share a unified approach to loading their content, encapsulated in a base class (often a BaseViewModel or simply each ViewModel overriding a standard pattern). The LoadAsync() method is central to this. For example, a simplified version of a typical load routine (from the BaseViewModel) is:

public override async Task LoadAsync() {
    IsLoading = true;
    HasData = false;
    LastError = null;
    HeaderWarnings.Clear();

    try {
        _log.Debug($"[{GetType().Name}] Load start");
        var result = await _csvService.LoadDataAsync(_profile);
        
        foreach (var w in result.HeaderWarnings)
            HeaderWarnings.Add(w);
        
        Items.Clear();
        foreach (var item in result.Data)
            Items.Add(item);
        
        HasData = Items.Count > 0;
        _log.Info($"[{GetType().Name}] Load ok rows={Items.Count}");
    }
    catch (Exception ex) {
        LastError = $"Unexpected error: {ex.Message}";
        _log.Error($"[{GetType().Name}] Load fail ex={ex}");
    }
    finally {
        IsLoading = false;
    }
}


(Actual code is in the BaseViewModel and CsvDataServiceNew implementations)
GitHub
GitHub
GitHub
.

Key points in this pattern:

Loading State: IsLoading is a bool property that ViewModels set true during data fetch, and false when done
GitHub
GitHub
. The XAML uses this to display a loading animation (e.g., a spinner overlay) bound via a converter (visible when true)
GitHub
.

Data and Error Indicators: HasData is set to true if any items were loaded, and is bound to the visibility of the main DataGrid (to auto-hide it when empty)
GitHub
. LastError is set if an exception occurs, and is bound to an error banner UI element to alert the user
GitHub
. HeaderWarnings is a collection of strings for non-fatal issues (like missing CSV columns). In XAML, an ItemsControl will display each warning in a red banner area if present
GitHub
.

CSV Service: _csvService.LoadDataAsync(_profile) is invoked to get the data. Here _csvService is typically an instance of CsvDataServiceNew and _profile identifies the active profile or dataset (e.g., “ljpops” by default). This service abstracts reading different CSV files and combining them into strongly-typed records for the view. It returns a DataLoaderResult<T> containing a list of T (the data records) and a list of any header warnings
GitHub
GitHub
.

Header Mapping & Warnings: The CSV loader is intelligent about headers. It performs case-insensitive matching, ignores extra whitespace/underscores, tolerates different delimiters, etc. It also identifies required columns and if they are missing in the input, it adds a warning message but does not throw an error
GitHub
. For example, if the Users CSV is missing “Department” and “JobTitle” columns, a warning like “[Users] File 'AzureUsers.csv': Missing required columns: Department, JobTitle. Values defaulted.” is produced
GitHub
. The GUI will show this in the HeaderWarnings banner but still display whatever data is available. This makes the data loading resilient to slight schema differences across data sources.

Immutable Models: The data records are defined as record types (immutable) for thread-safety and simplicity
GitHub
. E.g., UserData might have properties like DisplayName, Email, Department, etc. Because they are immutable, the viewmodels instead maintain observable collections of these records (ObservableCollection<UserData> Items) which they replace or refill on each load. There’s no in-place editing of these items in the current design (the suite is mostly read-only data presentation with separate tools for changes).

Threading: The data loading is done asynchronously (await LoadDataAsync) to keep the UI responsive. WPF binding will update the UI when Items collection changes and when IsLoading/HasData flip states, because these properties are likely implemented with INotifyPropertyChanged (the BaseViewModel or use of CommunityToolkit.Mvvm ensures this). Also, TabsService runs the load in a background task and marshals updates back to the UI thread as needed
GitHub
GitHub
.

Logging: The snippet above references _log.Info and _log.Error. Each viewmodel and service uses a logger (from Microsoft.Extensions.Logging) to record structured messages. Logging is heavily used throughout the app for debugging and audit. For instance, when data is loaded successfully, it logs how many rows were loaded and from which source
GitHub
, and on failure, it logs the exception details
GitHub
. These logs go to both console and a file (gui-debug.log for debug/info, and gui-binding.log for WPF binding issues, as configured)
GitHub
. The log format includes timestamps and source context, for example:

[2024-08-15 10:30:45.123] [INFO] [CsvDataServiceNew] loader=Users ... total=168 ms=830
[2024-08-15 10:30:45.234] [WARN] [CsvDataServiceNew] [Users] File 'Users.csv': Missing required columns: Department, JobTitle. Values defaulted.
[2024-08-15 10:30:45.345] [INFO] [UsersViewModel] Load ok rows=168 warnings=1 ms=950


This shows how many rows were loaded, any warnings, and how long it took
GitHub
.

View and ViewModel Examples

To illustrate the MVVM structure, consider the Users section as an example:

Model: UserData (immutable) with properties like Name, Email, Department, etc.

ViewModel: UsersViewModel inherits from a BaseViewModel (perhaps providing the LoadAsync base implementation). It likely doesn’t even need its own properties beyond what the base provides (an Items collection of UserData, since all logic for loading is standardized). It may define additional commands, e.g., ExportCommand or filtering commands, if the UI supports exporting user lists or filtering them.

View: UsersView.xaml is a UserControl defining the UI. Thanks to the consistent approach, we know it will contain:

A header (maybe a title text “Users” and some action buttons like refresh, export).

A banner area for HeaderWarnings bound to an ItemsControl with red highlight (visible only if HeaderWarnings.Count > 0)
GitHub
.

A banner for errors bound to LastError (visible if LastError != null)
GitHub
.

A loading overlay (perhaps a semi-transparent panel with a ProgressBar) bound to IsLoading
GitHub
.

The main data grid, bound to Items (Users list) and only visible when HasData is true
GitHub
. The DataGrid’s columns are likely generated via data templates or auto-generated based on the model properties. Since the CSV columns can vary, the UI might define generic columns (like showing all properties of the record) or use a template selector for known fields.

The XAML for a typical view (referencing snippet from the design) looks like:

<Grid>
    <!-- Header (simplified) -->
    <StackPanel Orientation="Horizontal">
        <TextBlock Text="Users" FontSize="16" FontWeight="Bold"/>
        <Button Content="Refresh" Command="{Binding RefreshUsersCommand}" />
        <!-- ... other header buttons ... -->
    </StackPanel>

    <!-- Warnings Banner -->
    <ItemsControl ItemsSource="{Binding HeaderWarnings}" 
                  Visibility="{Binding HeaderWarnings.Count, Converter={StaticResource CountToVisibility}}">
        <Border Background="#55FF0000">
            <TextBlock Text="{Binding}" Foreground="White"/>
        </Border>
    </ItemsControl>

    <!-- Error Banner -->
    <Border Background="#FF0000" 
            Visibility="{Binding LastError, Converter={StaticResource NullToVisibility}}">
        <TextBlock Text="{Binding LastError}" Foreground="White"/>
    </Border>

    <!-- Loading Spinner -->
    <Border Visibility="{Binding IsLoading, Converter={StaticResource BoolToVisibility}}">
        <ProgressBar IsIndeterminate="True" />
    </Border>

    <!-- Data Grid -->
    <DataGrid ItemsSource="{Binding Items}" AutoGenerateColumns="True"
              Visibility="{Binding HasData, Converter={StaticResource BoolToVisibility}}"/>
</Grid>


Every section’s view follows this general structure, ensuring a uniform user experience
GitHub
GitHub
. Converters like CountToVisibility, NullToVisibility, BoolToVisibility are defined in the resource dictionaries (they turn a value into Visible/Collapsed for the UI).

Services and Infrastructure

Beyond the core MVVM, the application includes several supporting services:

ViewRegistry and NavigationService: As mentioned, ViewRegistry maps string keys to views. NavigationService likely provides high-level functions like NavigateToTabAsync(string key, string title), which under the hood use TabsService and ViewRegistry to open the requested view. This abstraction means ViewModels can request navigation without needing to know UI details. For example, MainViewModel.NavigateCommand might call NavigationService.NavigateToTabAsync(targetViewKey).

TabsService: Manages the open tabs collection and interacts with the TabControl UI element. It ensures only one tab per key, selects tabs, and handles closing tabs. When opening a tab, TabsService also kicks off the asynchronous data load for that tab’s ViewModel in a fire-and-forget manner (logging any errors)
GitHub
. It logs tab opens, activations, and closures to a separate log file for click telemetry (e.g., gui-clicks.log)
GitHub
GitHub
.

ProfileService: Manages which data profile is active. A “profile” corresponds to a dataset (often per company or per environment). Currently, it is hardcoded to "ljpops" in many places (meaning the app is pointing to a directory like C:\discoverydata\ljpops\Raw\ for input files by default
GitHub
). In the GUI, the profile selectors in the sidebar allow the user to switch the source/target profiles, which would update ProfileService and subsequently the paths from which CSVs are loaded. ProfileService is a singleton and likely provides the current profile name to other services (e.g., CsvDataServiceNew uses it to locate files).

CsvDataServiceNew: This service encapsulates loading CSV files for each domain. It likely uses a configuration of expected file name patterns and required columns for each type of data. For example, it might know that “Users” data can come from files matching *Users*.csv (like AzureUsers.csv, ActiveDirectoryUsers.csv)
GitHub
. It will open these files, read them (possibly via CsvHelper library, as indicated by the package reference
GitHub
), and map columns to the properties of the data model. It outputs a combined list of objects and any warnings about missing columns or malformed data. This service ensures that even if, say, one source doesn’t provide “JobTitle” for a user, the app still loads the user and just notes the absence. The service is registered as a singleton implementing ICsvDataLoader, meaning the same instance (or at least same config) is used throughout the app, and it likely caches some results or uses the FileWatcher service (CsvFileWatcherService) to watch for CSV updates in real-time.

LogicEngineService: A complex service that builds an in-memory representation of all the data for analysis. It reads from CsvDataService or directly from files and populates various dictionaries and graphs (as seen by the many ConcurrentDictionary fields in its code)
GitHub
GitHub
. It correlates data across domains (e.g., linking users to groups, or building a graph of who has access to what). This service can answer queries like “how many GPOs were discovered” or provide summaries to the UI. In some ViewModels, an instance of LogicEngineService is used to compute aggregates or provide data that isn’t directly from a single CSV (for instance, summarizing risk or compliance data across sources). It’s a singleton in practice (often accessed via LogicEngineService.Instance or via the service locator). The logic engine is also used in migration planning to check prerequisites or to generate lists of objects to migrate.

ModuleRegistryService: This likely holds a list of available discovery modules (scripts). Since the application mentions 60 PowerShell modules and 49 configured discovery operations
GitHub
, the GUI provides a way to execute them. The ModuleRegistry might provide metadata about each module (name, category, description, etc.), which is shown in a “Discovery” view where users can select modules to run. Indeed, there is a DiscoveryModulesUserControl.xaml mentioned
GitHub
. The Discovery view would list all modules from ModuleRegistry and allow the user to run them (perhaps via StartDiscoveryCommand). When a module runs, it outputs data to CSV which the GUI can then refresh and display.

Audit and Logging Services:

AuditService likely records user actions, system events to an audit log (maybe in combination with AuditService in Core).

UIInteractionLoggingService might log every button click or navigation (the text mentions a separate gui-clicks.log for telemetry of UI interactions)
GitHub
.

EnhancedLoggingService could be an extension that adds more context or writes logs to multiple targets.

There’s mention of ProductionTelemetryService in the audit list with TODOs
GitHub
 – this suggests future integration with Application Insights or similar, but currently it’s not implemented (and does not affect runtime).

KeyboardShortcutService: Handles global hotkeys and possibly an in-app command palette. The MainWindow registers some application-level shortcuts (like Alt+F4 to exit, Ctrl+Comma for settings) via this service
GitHub
GitHub
. It likely uses a low-level hook or simply WPF input gestures to route key presses to commands. The design allows for context-specific shortcuts as well (e.g., DataGrid shortcuts, search shortcuts as hinted by commented code
GitHub
).

ThemeService and IconThemeService: These manage application theme switching (dark/light). For example, ThemeService.ApplyTheme(ThemeType.Dark) would merge the Dark theme resources, and the MainViewModel has an IsDarkTheme property bound to a toggle UI (possibly the Ctrl+Alt+T shortcut) which triggers theme change by calling ThemeService
GitHub
. IconThemeService might supply appropriate icons depending on theme (e.g., light vs dark mode icons).

EnvironmentDetectionService & ConnectionTestService: These are used in the Security/Compliance area and migration planning. They test if the source/target environments are reachable and gather info. For instance, ConnectionTestService might verify credentials or network access to the systems that will be migrated or discovered (like test connecting to Azure AD, Exchange, etc.). In the UI, the results of these appear as “Environment: OK/Not OK” and “Connection: Tested/Not Tested” fields in the profile section of the sidebar
GitHub
GitHub
. The MainViewModel binds properties like SourceEnvironmentStatus, SourceConnectionStatus to these services’ outputs.

Migration Services: The application has an entire suite of migration planning and tracking (for IT migrations during M&A). Classes like MigrationPlanningViewModel, MigrationExecutionViewModel, WaveViewModel, BatchViewModel etc. handle orchestrating batches of items to migrate. They interact with services like MigratorFactory (which chooses the correct migrator for a given item, e.g., Exchange mailbox vs file share)
GitHub
. Some parts were incomplete or disabled (SharePoint migrator), but core migration for Exchange mail, File servers, SQL, OneDrive, Teams, etc., are present.

The UI likely has views like WavesView (list of migration waves), MigrateView (overall migration dashboard), and specific planning dialogs (e.g., for mapping accounts, scheduling cutovers).

The migration viewmodels rely on the data collected during discovery (e.g., the LogicEngineService’s data about users/groups) to ensure all prerequisites are in place.

Many migration-related commands are stubbed (pause/resume migration, export logs, etc. are TODOs)
GitHub
, but the structure is in place.

The migration components are integrated into the same TabsService navigation. For example, the “Migrate” button in the UI opens the MigrateView, which shows perhaps a multi-step interface for performing migrations.

Logging and Error Handling

As a recap, the application employs robust logging:

Structured Logs: Each log entry includes timestamp, severity, and source. Many log entries also include key-value details (like how many records loaded, how long an operation took). This helps in troubleshooting performance and data issues
GitHub
.

Log Files: By default, logs are written under the profile’s “Logs” directory (e.g., C:\discoverydata\ljpops\Logs\). The log file names are configured (e.g., gui-debug.log for debug/info, gui-binding.log for binding warnings)
GitHub
. There is likely a rolling mechanism or one log per run.

Error Display: Instead of crashing, errors are caught and either logged as warnings (if non-critical) or displayed. For instance, if a data load fails due to file not found, that exception message is stored in LastError and shown in the UI (and the log will have the stack trace)
GitHub
. Critical startup failures (like DI misconfiguration) trigger a MessageBox in App.OnStartup informing the user that the app failed to start and that an error log was saved
GitHub
. This makes the system more user-friendly and maintainable in production.

Accessibility & UX Considerations

The GUI design took into account enterprise UX needs:

Keyboard Navigation: Through the KeyboardShortcutService, common actions have shortcuts (e.g., F5 to refresh, Ctrl+Shift+L for log viewer, etc., as defined in XAML input bindings
GitHub
GitHub
). Tab navigation is likely fully keyboard-accessible, and there’s even a mention of a “Command Palette” (bound to Ctrl+Shift+P perhaps
GitHub
) which could bring up a quick action dialog.

Screen Reader / Automation: XAML uses AutomationProperties.Name and HelpText on UI elements where appropriate (e.g., the main window)
GitHub
. This suggests screen readers will announce those strings, making the app usable by visually impaired users.

Responsive Layout: The XAML includes a ResponsiveLayoutBehavior (possibly attached property) that could adjust the UI based on window size
GitHub
. While currently set to false on the main window, the infrastructure exists to enable responsive resizing if needed in future.

Performance Optimizations: Virtualization is used for large lists (WPF DataGrid by default virtualizes rows; also the design mentions "Virtualization behaviors for large datasets" as a performance feature). Objects like SolidColorBrushes are likely frozen (immutable) for efficiency (mentioned as “Resource Freezing”)
GitHub
. Also, the heavy use of async and background tasks ensures the UI thread remains free to respond.

Current State and Future Work

After recent refactoring:

The codebase underwent a major XAML cleanup: The main window XAML was reduced from ~4400 lines of a monolithic window to ~745 lines by extracting components into separate UserControls
GitHub
GitHub
. This has made the XAML structure more manageable and load faster (78% reduction in main XAML size). For example, sections for Dashboard metrics, Discovery module launcher, Migration controls, etc., were moved to DashboardSummaryUserControl, DiscoveryModulesUserControl, MigrationControlsUserControl, etc. These are composed in the main window or loaded on demand
GitHub
. The result is improved clarity and maintainability.

All critical null-reference and similar build issues have been resolved. The project now builds with 0 errors (nullable warnings have been addressed or suppressed appropriately)
GitHub
GitHub
. At runtime, tests confirmed successful launch and stable operation under typical usage.

Some advanced features are still in progress (marked with TODO in code):

Telemetry Integration: Hooking up ProductionTelemetryService to send app usage data to a monitoring service is planned
GitHub
.

Full Module Execution UI: The foundation for running discovery modules from the GUI is in place, but the UI/UX might be expanded (like progress bars for running scripts, or scheduling recurring discovery).

Migration Workflow Enhancements: Functions like pause/resume migrations, batch reordering, and detailed error viewers for migrations are stubbed
GitHub
GitHub
. These will be implemented in future iterations, but their placeholders do not break the app’s current functionality. They are hidden behind UI elements that either do nothing or are disabled until implemented.

Settings and Profiles: Multi-profile management (especially target profiles) is partially implemented. For now, the app assumes a default profile unless changed. Future improvements might include a profile manager dialog (accessible via the "Manage Target Profiles" button in UI) – currently that command exists (ShowTargetProfilesCommand) but its dialog might be minimal or not fully functional yet.

Data Export/Reporting: Several viewmodels have Export...Command to export data to CSV/Excel and similar for reports
GitHub
. If invoked, they might currently do nothing (to be implemented). The architecture is in place to add these easily using the existing data in memory and EPPlus library (which is included as a reference
GitHub
).

The application’s architecture quality is high. Internal reviews rate it as enterprise-grade (MVVM: A+, DI: A+, Performance: A+)
GitHub
GitHub
. The separation of concerns is clear: viewmodels do not directly manipulate UI elements, and services abstract away external dependencies (files, network calls). This makes maintenance and extension relatively straightforward. New views can be added by creating a ViewModel, a UserControl, and adding an entry to ViewRegistry (and Navigation menu), following the established patterns.

How to Extend or Modify

For developers (or AI coding assistants like Claude) working on this codebase, here are some tips:

Follow the Patterns: When adding a new data view, mimic an existing one such as Users or Applications. Create a <YourData>ViewModel with properties for the data collection and possibly commands for refresh/export. Use the BaseViewModel loading pattern to implement LoadAsync() (you can call into CsvDataService if it’s a CSV-based data, or another service if needed).

Register Everything: After creating a new View and ViewModel, register the ViewModel in DI (if it needs constructor injection or to be a singleton) and add the view to ViewRegistry.Instance with a unique key. Also create a navigation command in MainViewModel and a button in the sidebar for it, bound to that command.

Keep UI Responsive: If you perform any heavy computation (e.g., generating a large report), use async/await and do it off the UI thread (as is done for data loading). The UI should always remain snappy.

Logging and Error Handling: Continue the practice of wrapping operations in try/catch and logging errors instead of letting exceptions crash the app. Provide user feedback when appropriate (setting LastError for view-level issues, or MessageBox for truly critical failures).

Testing: Use sample CSV data in the expected directory (by default C:\discoverydata\ljpops\Raw\) to test the views. The app is designed to automatically pick up files in those locations. If you add new data columns or new files, update CsvDataServiceNew to recognize them and map to your model.

Temporary Code Cleanup: As features get implemented (e.g., a TODO becomes done), remove or update the placeholder comments and any related conditional logic. For example, once PauseMigration() is implemented, the TODO in MigrationExecutionViewModel can be removed and the button enabled.

By adhering to the above, the codebase will remain consistent and robust. The existing design already accounts for most requirements, so extending it is usually a matter of adding new classes and plugging them into the framework that’s in place, rather than modifying core logic.

Conclusion

The M&A Discovery Suite GUI provides a unified, performant interface for complex IT discovery and migration tasks. Its low-level design balances flexibility (data-driven UI that adapts to available CSV schema) with reliability (extensive error handling and logging). Now that structural issues have been fixed and the UI is stable, the focus can shift to completing remaining features and improving the user experience even further. The architecture in place will support those future enhancements with minimal friction.