# T-000-DualProfile-EnvironmentDetection: Sidebar Company Profile Selector Architecture

## Overview
The M&A Discovery Suite implements a dual-profile environment system with dedicated container sections for Source Company Profile and Target Company Profile selectors in the left sidebar.

## Grid Layout Architecture

### Row Definitions
The main sidebar uses a 7-row Grid layout:
- **Row 0**: Logo/Title section (`Height="Auto"`)
- **Row 1**: Source Company Profile section
- **Row 2**: Target Company Profile section
- **Row 3**: Spacer/Navigation area
- **Row 4**: Theme toggle section
- **Row 5**: Diagnostic section
- **Rows 6-7**: Footer elements

### Section Container Pattern
Each major profile selector section follows this architecture:

```xaml
<!-- Standard Section Container -->
<Border Grid.Row="[ROW_NUMBER]"
        Padding="24,0,24,24"
        Visibility="Visible"
        MinHeight="150"
        Background="[DIAGNOSTIC_COLOR]"
        BorderBrush="Red"
        BorderThickness="2">
    <StackPanel>
        <!-- Section header -->
        <TextBlock Text="[SECTION_TITLE]"
                   Foreground="#FFA0AEC0"
                   FontSize="12"
                   FontWeight="Medium"
                   Margin="0,0,0,8"/>

        <!-- Profile selection elements -->
        <!-- Status indicators -->

    </StackPanel>
</Border>
```

## Color Coding System
- **Orange**: Main sidebar container
- **LimeGreen**: Source Company Profile section (Row 1)
- **Pink**: Target Company Profile section (Row 2)
- **Teal**: Navigation area (#FF2DD4BF)

## Key Technical Patterns
1. **Dedicated Border Containers**: Each section is wrapped in its own Border with explicit Grid.Row assignment
2. **StackPanel Containment**: Content within each section uses base StackPanel for vertical layout
3. **Grid Row Separation**: Row 1 handles source profile, Row 2 handles target profile with clear separation
4. **Dependency Property Cascade**: Visibility and background inheritance through WPF parent-child relationships
5. **Diagnostic Coloring**: Bright contrasting backgrounds for visibility debugging during development

## Current Implementation Status
- ✅ Source Company Profile section (Row 1) - LimeGreen background rendering correctly
- ✅ Target Company Profile section (Row 2) - Pink background container properly closed and validated
- ✅ Navigation area theming - Teal background applied (#FF2DD4BF)
- 🔄 UI Testing - Pending verification of target section visibility
- 🔄 Final Cleanup - Remove diagnostic coloring once functionality confirmed

## WPF Layout Optimization
The dual-profile system ensures:
- **Visual Isolation**: Each profile section has dedicated rendering context
- **Layout Independence**: Grid.Row assignments prevent z-index conflicts
- **Background Inheritance**: Border containers provide solid background surfaces
- **Adaptive Sizing**: MinHeight ensures consistent visual proportions
- **Responsive Padding**: Consistent padding maintains visual hierarchy