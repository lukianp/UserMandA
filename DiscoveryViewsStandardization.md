# Discovery Views Standardization Documentation

## Overview
This document outlines the standardized architecture for discovery views in the MandA Discovery Suite application. The implementation uses a shared BaseDiscoveryViewTemplate architecture with consistent styling, layout patterns, and responsive behavior across all discovery modules.

**All 14 standardized discovery modules have been successfully implemented and validated:**
- ActiveDirectory, AzureInfrastructure, Exchange, MicrosoftTeams, SharePoint
- NetworkInfrastructure, FileServer, PhysicalServer, SQLServer, VMware
- WebServer, PowerBI, DataLossPrevention, SecurityInfrastructure

Each module follows the BaseDiscoveryViewTemplate pattern with consistent data loading, summary cards, DataGrid functionality, detail panels, and responsive layouts.

## BaseDiscoveryViewTemplate Architecture

### Template Structure
The `GUI/Templates/StandardDiscoveryViewTemplate.xaml` serves as the foundational template for all discovery views, implementing a consistent layout structure:

#### Layout Grid Hierarchy
```xaml
<Grid Margin="16">
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>  <!-- Header Section -->
        <RowDefinition Height="Auto"/>  <!-- Warnings/Error Banners -->
        <RowDefinition Height="Auto"/>  <!-- Error Banner -->
        <RowDefinition Height="Auto"/>  <!-- Summary Cards -->
        <RowDefinition Height="*"/>    <!-- Data/Controls Area -->
    </Grid.RowDefinitions>
    <!-- Content sections -->
</Grid>
```

#### Key Template Elements

1. **Header Section (Row 0)**
   - Module title and description
   - Optional icon/badge elements
   - Consistent spacing with `Margin="20,20,20,10"`

2. **Banner Sections (Rows 1-2)**
   - Header warnings using `ItemsControl` with red background/opacity
   - Error messages with consistent styling
   - Collapsible via `Visibility` bindings

3. **Summary Cards (Row 3)**
   - `UniformGrid Columns="4"` for 4 summary statistic cards
   - Each card: `Border` with `Padding="16" Margin="4" CornerRadius="12"`
   - Standard `MetricLabelStyle` and `MetricNumberStyle` for consistent typography

4. **Action Controls (Row 4)**
   - `ToolBar` for action buttons (`Refresh`, `Export`, `Clear Filters`)
   - Consistent button styling with `RoundedButtonStyle`

5. **Data Area (Row 4)**
   - `Grid` with `GridSplitter` separating DataGrid from details panel
   - Left: DataGrid area (Width="*")
   - Center: `GridSplitter` (Width="5")
   - Right: Details panel area (Width="*")

6. **Footer (Row 5)**
   - Empty state or additional information
   - Consistent background and padding

### Responsive Behavior
- **GridSplitter**: Allows user adjustment of DataGrid vs Details panel width
- **MinWidth Constraints**: DataGrid minimum 600px, Details panel minimum 300px
- **Visibility Triggers**: Details panels collapse on narrow screens (<1200px width)
- **SplitterPosition Binding**: Some views implement persistent splitter position

## Shared DiscoveryViewStyles

### Button Styles
- **PrimaryButtonStyle**: Used for main actions (Run Discovery)
- **SecondaryButtonStyle**: Used for secondary actions (Refresh Data)
- **OutlineButtonStyle**: Used for tertiary actions (Export)
- **GhostButtonStyle**: Used for auxiliary actions (Show Logs)
- **RoundedButtonStyle**: Template buttons with consistent corner radius

### Card Styles
- **SummaryCardStyle**: Base style for summary statistic cards
- **ModernCardStyle**: Enhanced card style with additional visual elements
- **CardBrush**: Consistent background for card elements

### Text Styles
- **HeaderTextStyle**: For main headings (`FontSize="24" FontWeight="SemiBold"`)
- **MetricLabelStyle**: For summary card labels (`FontWeight="SemiBold" Foreground="{DynamicResource MutedForegroundBrush}"`)
- **MetricNumberStyle**: For summary card values (`FontSize="32" FontWeight="Bold"`)

### DataGrid Styles
- **DataGridColumnHeaderStyle**: Consistent header styling with icons and labels
- **DataGridRowStyle**: Alternating row colors and hover effects
- **Status indicators**: Colored borders/badges for status columns

### Color Resources
- **DynamicResource References**: Consistent use of theme-aware resources
  - `AccentBrush`, `SecondaryBrush`, `TertiaryBrush`
  - `CardBrush`, `SurfaceBrush`, `BorderBrush`
  - `ForegroundBrush`, `MutedForegroundBrush`
  - `ErrorBrush`, `SuccessBrush`, `WarningBrush`

## View-Specific Customizations

### Inheritance Pattern
Each discovery view inherits from the base template and customizes specific sections for domain-specific requirements:

#### Infrastructure & Cloud Views
1. **ActiveDirectory**: Domain object discovery with user/computer/group hierarchies and permission structures
2. **AzureInfrastructure**: Enhanced with cost information, resource tagging, and subscription management
3. **Exchange**: Mailbox and distribution group management with compliance and migration data
4. **NetworkInfrastructure**: Network device monitoring with interface details and configuration management
5. **FileServer**: File share permissions and NTFS ACL management with storage analytics
6. **PhysicalServer**: Hardware inventory with component details, warranty, and maintenance tracking
7. **SQLServer**: Database instance and schema discovery with performance and backup information
8. **VMware**: Virtual infrastructure management with cluster/host/VM relationships and resource allocation
9. **WebServer**: IIS/SharePoint site configuration with SSL certificates and application pools
10. **SecurityInfrastructure**: Firewall and endpoint protection with policy compliance and threat detection

#### Collaboration & Productivity Views
11. **MicrosoftTeams**: Team and channel management with governance and compliance monitoring
12. **SharePoint**: Site collection and content management with permission inheritance
13. **PowerBI**: Workspace and report governance with data source tracking and refresh monitoring

#### Compliance & Security Views
14. **DataLossPrevention**: Policy management and incident tracking with sensitive data classification

### DataGrid Column Patterns
- **Standard Columns**: Name/ID, Type, Status, Created Date, Actions
- **Domain-Specific Columns**: Service-specific fields (AMI, VPC ID, Grant Controls, etc.)
- **Action Columns**: Consistent "View Details" buttons with command bindings
- **Status Columns**: Visual indicators (colors, badges) for operational status

### Details Panel Variations
- **Simple Key-Value**: Basic property display with ScrollViewer
- **Structured Details**: Grouped sections (Tags, Cost Information, Conditions)
- **Async Loading**: Loading states for complex data processing
- **Tab Navigation**: External detail windows for complex objects

## Implementation Guidelines

### ViewModel Base Class
All discovery ViewModels inherit from `ModuleViewModel` and implement:
- `ExecuteModuleAsync()`: Initial data loading
- `LoadFromCsvAsync()`: Data source integration
- `CalculateSummaryStatistics()`: Metric calculations
- Command implementations for Run/Refresh/Export operations

### Data Loading Pattern
```csharp
protected override async Task LoadFromCsvAsync(List<dynamic> csvData)
{
    IsProcessing = true;
    ProcessingMessage = "Loading data...";

    var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);
    var results = loadedCsvData.Select(item => (dynamic)item).ToList();

    SelectedResults.Clear();
    foreach (var item in results) SelectedResults.Add(item);

    CalculateSummaryStatistics(results);
    LastUpdated = DateTime.Now;
}
```

### Responsive Design Patterns
- **Splitter Binding**: `Width="{Binding SplitterPosition, Mode=TwoWay}"`
- **Min/Max Widths**: Prevent layout collapse
- **Visibility Triggers**: `DataTrigger` on window width for panel collapse
- **ScrollViewer Fallback**: Vertical scrolling for narrow layouts

## Screenshots Reference

### Template Architecture
- **[Screenshot: StandardDiscoveryViewTemplate-Layout.png]** - Base template grid structure
- **[Screenshot: StandardDiscoveryViewTemplate-SummaryCards.png]** - 4-card summary layout
- **[Screenshot: StandardDiscoveryViewTemplate-DataArea.png]** - DataGrid with GridSplitter and details panel

### Individual View Implementations
#### Infrastructure & Cloud Discovery Views
- **[Screenshot: ActiveDirectoryDiscoveryView-FullView.png]** - Complete Active Directory domain discovery view
- **[Screenshot: AzureInfrastructureDiscoveryView-Summary.png]** - Enhanced Azure summary cards with cost information
- **[Screenshot: ExchangeDiscoveryView-Mailboxes.png]** - Exchange mailbox management interface
- **[Screenshot: NetworkInfrastructureDiscoveryView-Devices.png]** - Network device inventory with status indicators
- **[Screenshot: FileServerDiscoveryView-Permissions.png]** - File server share permissions and ACLs
- **[Screenshot: PhysicalServerDiscoveryView-Hardware.png]** - Physical server hardware inventory
- **[Screenshot: SQLServerDiscoveryView-Databases.png]** - SQL Server instances and database schema
- **[Screenshot: VMwareDiscoveryView-StatusIndicators.png]** - VMware infrastructure with color-coded status
- **[Screenshot: WebServerDiscoveryView-Configuration.png]** - Web server configuration and SSL certificates
- **[Screenshot: SecurityInfrastructureDiscoveryView-Policies.png]** - Security policies and compliance status

#### Collaboration & Productivity Discovery Views
- **[Screenshot: MicrosoftTeamsDiscoveryView-Teams.png]** - Teams and channels governance interface
- **[Screenshot: SharePointDiscoveryView-Sites.png]** - SharePoint site collections and content
- **[Screenshot: PowerBIDiscoveryView-Workspaces.png]** - Power BI workspace and report governance

#### Compliance & Security Discovery Views
- **[Screenshot: DataLossPreventionDiscoveryView-Incidents.png]** - DLP policy incidents and data classification

### Responsive Behavior
- **[Screenshot: DiscoveryViews-MobileLayout.png]** - Narrow screen responsive behavior
- **[Screenshot: DiscoveryViews-SplitterInteraction.png]** - GridSplitter user interaction
- **[Screenshot: DiscoveryViews-DetailPanelCollapse.png]** - Automatic panel collapse on small screens

## Maintenance Notes

### Style Consistency
- All views reference shared `ThemeStyles.xaml` and `Colors.xaml`
- Button styles ensure consistent interaction patterns
- Color resources support dark/light theme switching

### Performance Considerations
- Async data loading prevents UI blocking
- Virtualized DataGrids for large datasets
- Lazy loading for complex details panels

### Extensibility
- Template allows easy addition of new summary cards or action buttons
- ViewModel pattern supports new discovery modules
- Shared styles ensure consistent appearance across modules

## Testing Validation
See `test_results_standardized.md` for comprehensive validation results confirming all views meet the standardization requirements for data loading, UI components, and responsive behavior.