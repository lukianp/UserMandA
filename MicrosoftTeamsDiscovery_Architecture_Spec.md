# Microsoft Teams Discovery View Architecture Specification

## Overview
The MicrosoftTeamsDiscovery View module provides a comprehensive interface for discovering and displaying Microsoft Teams organizational data including teams, channels, memberships, and guest users. This specification defines the complete architectural design for the view, including UI structure, data bindings, navigation integration, and thematic consistency with the Migration aesthetic.

## Architectural Inheritance
- **Base Class**: TeamsDiscoveryViewModel inherits from ModuleViewModel (which inherits from BaseViewModel)
- **Key Properties Inherited**: Results, IsProcessing, HasErrors, StatusText, LastUpdated, RunModuleCommand
- **Service Integration**: CsvDataServiceNew for data loading with LoadTeamsDiscoveryAsync method

## Summary Metrics Design

### Current Implementation Analysis
- Total Teams: Count of discovered teams
- Total Channels: Count of channels across all teams
- Total Members: Count of team members (excluding guests)
- Last Discovery: Timestamp of most recent discovery execution

### Updated Summary Metrics (per task specification)
```csharp
// ViewModel Properties
public int TotalTeams { get; set; }          // Count of discovered teams
public int TotalChannels { get; set; }       // Count of channels across all teams
public int TotalGuests { get; set; }         // Count of guest users
public DateTime LastDiscovery { get; set; }  // Timestamp of last discovery
```

### UI Structure for Summary Cards
- **Layout**: Horizontal WrapPanel with 4 cards
- **Style**: ModernCardStyle with SurfaceBrush background, CornerRadius 8, drop shadow
- **Content**: Icon + Label + Value per card
- **Icons**: 👥 (Teams), 📺 (Channels), 👤 (Guests), 📅 (Last Discovery)

## Data Grid Design

### Column Definitions (task specification)
```xaml
<DataGrid.Columns>
    <DataGridTextColumn Header="Team Name" Binding="{Binding TeamName}" Width="*" />
    <DataGridTextColumn Header="Description" Binding="{Binding Description}" Width="200" />
    <DataGridTextColumn Header="Owner" Binding="{Binding Owner}" Width="150" />
    <DataGridTextColumn Header="Channel Count" Binding="{Binding ChannelCount}" Width="100" />
    <DataGridTextColumn Header="Member Count" Binding="{Binding MemberCount}" Width="100" />
    <DataGridTextColumn Header="Created Date" Binding="{Binding CreatedDate, StringFormat=yyyy-MM-dd}" Width="120" />
    <DataGridTextColumn Header="Visibility" Binding="{Binding Visibility}" Width="100" />
</DataGrid.Columns>
```

### Data Grid Features
- **Selection Mode**: Extended (multiple selection support)
- **Grid Lines**: Horizontal only
- **Background**: Transparent
- **Row Styling**: Zebra stripes, hover effects
- **Sorting**: Enabled on all columns
- **Filtering**: Search box for real-time filtering

## Details Panel Design

### Panel Layout Structure
- **Position**: Right side of grid with GridSplitter
- **Width**: Minimum 250px, default 300px
- **Background**: SurfaceBrush with CornerRadius 8
- **Content**: Scrollable StackPanel with key-value pairs

### Details Panel Fields (proposed based on Teams data)
```
Team Details:
- Team ID: [Guid]
- Display Name: [string]
- Description: [string]
- Owner: [string]
- Created Date: [DateTime]
- Visibility: Public/Private
- Channel Count: [int]
- Member Count: [int]
- Guest Count: [int]

Owner Information:
- Owner Name: [string]
- Owner Email: [string]

Channel Summary:
- Total Channels: [int]
- Standard Channels: [int]
- Private Channels: [int]

Membership Details:
- Total Members: [int]
- Active Members: [int] (if available)
- Guest Users: [int]
- External Guests: [int] (if available)
```

### Implementation
```xaml
<Border Background="{DynamicResource SurfaceBrush}" CornerRadius="8" Margin="0,10,10,10">
    <ScrollViewer VerticalScrollBarVisibility="Auto">
        <StackPanel>
            <TextBlock Text="Team Details" FontSize="18" FontWeight="Bold" Margin="15,15,15,10"/>
            <ItemsControl ItemsSource="{Binding SelectedItemDetails}">
                <ItemsControl.ItemTemplate>
                    <DataTemplate>
                        <StackPanel Margin="15,0,15,10">
                            <TextBlock Text="{Binding Key}" FontWeight="SemiBold" Foreground="{DynamicResource SecondaryTextBrush}"/>
                            <TextBlock Text="{Binding Value}" Foreground="{DynamicResource MutedForegroundBrush}" TextWrapping="Wrap" Margin="0,2,0,0"/>
                        </StackPanel>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </StackPanel>
    </ScrollViewer>
</Border>
```

## Data Integration Architecture

### Service Integration
```csharp
// Core integration point
private readonly CsvDataServiceNew _csvService;
public async Task LoadTeamsDiscoveryAsync()
{
    var teamsData = await _csvService.LoadTeamsDiscoveryAsync();
    // Process and bind data...
}
```

### ViewModel Data Flow
1. **Initialization**: LoadTeamsDiscoveryAsync called on view load
2. **Data Processing**: Parse CSV data into Team models
3. **Summary Calculation**: Update TotalTeams, TotalChannels, TotalGuests
4. **Data Binding**: Populate SelectedResults collection for DataGrid
5. **Error Handling**: Display any loading errors in error banner

### Navigation Registration
- **View Registry Key**: `MicrosoftTeamsDiscovery`
- **Navigation Method**: `NavigationService.NavigateToTabAsync("MicrosoftTeamsDiscovery", "Teams Discovery")`
- **Command**: `ShowTeamsDiscoveryCommand` in MainViewModel

## Thematic Consistency with Migration Aesthetic

### Color Scheme
- **Primary Backgrounds**: SurfaceBrush (#FF2D3748 dark blue-gray)
- **Cards**: SurfaceBrush with drop shadows (10px blur, 0.1 opacity)
- **Text Colors**:
  - Primary: PrimaryTextBrush (#FFE2E8F0 white-gray)
  - Secondary: SecondaryTextBrush
  - Muted: MutedForegroundBrush (#FFA0AEC0 gray)
- **Accents**: AccentBrush (#FF38B2AC teal) for buttons and highlights

### Visual Elements
- **Corner Radius**: 8px consistent throughout
- **Drop Shadows**: Subtle blur effects on cards and borders
- **Button Style**: Modern button template with hover/press states
- **Progress Indicators**: Animated progress bars with gradient fills
- **Icons**: Consistent use of emojis and custom icons

### Layout Consistency
- **Grid Structure**: 7-row main grid for modular sections
- **Spacing**: 10px margins throughout
- **Typography**: FontSize 24 for headers, 14-16 for content
- **Responsive**: GridSplitter support for resizable panels

## Complete UI Structure Hierarchy

```
Main Grid (7 rows)
├── Header Section (Row 0)
│   ├── Title: "Microsoft Teams Discovery"
│   └── Item Count: "({Binding TotalTeams} items)"
├── Toolbar Section (Row 1)
│   └── Buttons: Run Discovery, Refresh, Export
├── Summary Cards Section (Row 2)
│   ├── Total Teams Card
│   ├── Total Channels Card
│   ├── Total Guests Card
│   └── Last Discovery Card
├── Warning Banners (Row 3)
├── Error Banner (Row 4)
├── Loading Spinner (Row 5)
└── Data Section (Row 6)
    ├── DataGrid (Left panel)
    ├── GridSplitter (Center)
    └── Details Panel (Right panel)
        ├── Team Details Section
        ├── Owner Information
        └── Membership Summary
```

## Performance Considerations

### Data Virtualization
- **Large Datasets**: Implement virtual scrolling for DataGrid
- **Incremental Loading**: Load data in chunks for better responsiveness
- **Background Processing**: Use async operations with progress updates

### Memory Management
- **ObservableCollections**: Properly implemented for change notifications
- **Data Cleanup**: Dispose resources in ViewModel lifecycle
- **Image Optimization**: Efficient icon and image loading

## Error Handling and User Feedback

### Error States
- **Loading Errors**: Red banner for CSV parse errors
- **Network Issues**: Connection error indicators
- **Data Validation**: Header warning banners
- **Processing States**: Progress indicators and status messages

### User Feedback Mechanisms
- **Status Text**: Real-time processing updates
- **Progress Bars**: Visual completion indicators
- **Toast Notifications**: Non-intrusive success/error messages
- **Tooltip Support**: Context-sensitive help information

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical focus movement through controls
- **Enter/Escape**: Standard keyboard actions
- **Arrow Keys**: DataGrid navigation

### Screen Reader Support
- **ARIA Labels**: Proper labeling for assistive technologies
- **Semantic Structure**: Clear heading hierarchy
- **Status Announcements**: Screen reader updates for dynamic content

---

*This specification provides the complete architectural blueprint for the MicrosoftTeamsDiscovery View module, ensuring consistency with the application's design patterns and the Migration aesthetic while meeting all functional requirements.*