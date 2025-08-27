# Theme System Guide

## Overview

The MandADiscoverySuite application features a comprehensive theming system that supports dynamic theme switching, persistence, and custom accent colors. This guide documents the architecture and usage of the theme system implemented in T-026.

## Architecture

### Theme Dictionaries

The theme system is built around two primary resource dictionaries:

- **`GUI/Themes/DarkTheme.xaml`** - Complete dark theme color palette
- **`GUI/Themes/LightTheme.xaml`** - Complete light theme color palette

Each theme dictionary defines 52 brush resources covering all UI elements:

#### Background Colors
- `BackgroundBrush` - Main application background
- `SurfaceBrush` - Secondary surface areas
- `CardBrush` - Card and panel backgrounds
- `ElevatedBrush` - Elevated surface elements

#### Text Colors
- `ForegroundBrush` / `PrimaryTextBrush` - Primary text color
- `SecondaryForegroundBrush` / `SecondaryTextBrush` - Secondary text
- `MutedForegroundBrush` - Muted text elements
- `DisabledForegroundBrush` - Disabled text

#### Accent Colors
- `AccentBrush` - Primary accent color
- `AccentLightBrush` - Light accent variant
- `AccentDarkBrush` - Dark accent variant
- `AccentHoverBrush` / `ButtonHoverBrush` - Hover states

#### State Colors
- `SuccessBrush` - Success indicators
- `WarningBrush` - Warning indicators
- `ErrorBrush` - Error indicators
- `InfoBrush` - Information indicators

#### Interactive States
- `HoverBrush` - General hover overlays
- `PressedBrush` - Pressed state overlays
- `SelectedBrush` - Selected item backgrounds
- `FocusBrush` - Focus indicators

#### Input Controls
- `InputBackgroundBrush` - Input field backgrounds
- `InputBorderBrush` - Input field borders
- `InputFocusBrush` - Focused input borders
- `InputDisabledBrush` - Disabled input backgrounds

#### Validation
- `ValidBorderBrush` - Valid input borders
- `InvalidBorderBrush` - Invalid input borders

### Theme Styles

**`GUI/Themes/ThemeStyles.xaml`** contains pre-built control styles that use DynamicResource bindings:

- `ThemedButtonStyle` - Base button styling
- `ThemedSecondaryButtonStyle` - Secondary button variant
- `ThemedSuccessButtonStyle` - Success button variant
- `ThemedDangerButtonStyle` - Danger button variant
- `ThemedTextBoxStyle` - Text input styling
- `ThemedTextBlockStyle` - Text display styling
- `ThemedCardStyle` - Card container styling
- And more...

All style inheritance uses `BasedOn="{DynamicResource ...}"` to support runtime theme switching.

## Theme Service

### ThemeService Class

**Location:** `GUI/Services/ThemeService.cs`

The `ThemeService` class manages theme switching, persistence, and application:

#### Key Methods

```csharp
// Initialize theme system at startup
public void Initialize()

// Toggle between dark and light themes
public void ToggleTheme()

// Set specific theme
public void SetTheme(ThemeMode theme, bool saveSettings = true)

// Set accent color
public void SetAccentColor(AccentColor accentColor, bool saveSettings = true)

// Apply complete theme configuration
public void ApplyThemeSettings(ThemeSettings settings, bool saveSettings = true)
```

#### Supported Features

- **Theme Modes:** Light, Dark
- **Accent Colors:** Blue, Green, Purple, Orange, Red
- **System Theme Following:** Automatic light/dark based on Windows settings
- **High Contrast Mode:** Enhanced contrast for accessibility
- **Font Size Scaling:** Adjustable font size multiplier (0.8x to 2.0x)
- **Reduced Motion:** Disable animations for accessibility

### Theme Persistence

Themes are automatically persisted to:
```
%APPDATA%\MandADiscoverySuite\theme-settings.json
```

The settings file contains:
```json
{
  "Theme": "Dark",
  "AccentColor": "Blue",
  "UseSystemTheme": false,
  "FontSize": 1.0,
  "ReducedMotion": false,
  "HighContrast": false
}
```

## Usage Guidelines

### For Developers

#### Using Theme Resources in XAML

**✅ Correct - Use DynamicResource:**
```xml
<Border Background="{DynamicResource BackgroundBrush}"
        BorderBrush="{DynamicResource BorderBrush}">
    <TextBlock Text="Example" 
               Foreground="{DynamicResource PrimaryTextBrush}"/>
</Border>
```

**❌ Incorrect - Avoid hard-coded colors:**
```xml
<Border Background="#FF1F2937"
        BorderBrush="#FF6B7280">
    <TextBlock Text="Example" 
               Foreground="#FFF9FAFB"/>
</Border>
```

#### Style Inheritance

**✅ Correct - Use DynamicResource for BasedOn:**
```xml
<Style x:Key="CustomButtonStyle" 
       TargetType="Button" 
       BasedOn="{DynamicResource ThemedButtonStyle}">
    <Setter Property="Margin" Value="4"/>
</Style>
```

**❌ Incorrect - Avoid StaticResource:**
```xml
<Style x:Key="CustomButtonStyle" 
       TargetType="Button" 
       BasedOn="{StaticResource ThemedButtonStyle}">
    <Setter Property="Margin" Value="4"/>
</Style>
```

### For UI/UX Design

#### Color Selection

When creating new UI elements:

1. **Check existing brushes first** - Use predefined theme brushes when possible
2. **Follow semantic meaning** - Use `SuccessBrush` for success states, `ErrorBrush` for errors
3. **Maintain contrast ratios** - Ensure accessibility standards are met
4. **Test both themes** - Verify appearance in both light and dark themes

#### Creating New Theme Resources

If new colors are needed:

1. **Add to both theme dictionaries** with identical keys
2. **Use semantic names** (e.g., `WarningBackgroundBrush` not `YellowBrush`)
3. **Document the purpose** in code comments
4. **Test theme switching** to ensure proper application

## Implementation Status

### ✅ Completed (T-026)

- **Theme Dictionary Enhancement:** Complete 52-brush palettes for both themes
- **Style Conversion:** 10 style inheritance references converted to DynamicResource
- **Dashboard Integration:** Core dashboard styles converted to use theme brushes
- **Service Infrastructure:** Full ThemeService functionality with persistence
- **Validation Suite:** Comprehensive test script for theme system validation

### ⚠️ Future Enhancements

- **Complete Hard-coded Color Elimination:** Convert remaining 16+ hard-coded colors in DashboardView.xaml
- **Comprehensive View Conversion:** Review and convert hard-coded colors across all 125 XAML files
- **Theme Designer UI:** Visual theme customization interface
- **Custom Theme Support:** User-defined color schemes

## Troubleshooting

### Common Issues

#### Resource Not Found Errors

If you see errors like "Resource 'SomeBrush' could not be resolved":

1. **Check key name spelling** in both theme dictionaries
2. **Verify DynamicResource usage** instead of StaticResource
3. **Ensure theme initialization** - ThemeService.Initialize() called at startup

#### Theme Not Applying

If theme changes don't take effect:

1. **Check for StaticResource bindings** - these won't update at runtime
2. **Verify resource dictionary loading** - themes must be in merged dictionaries
3. **Check for hard-coded colors** - these override theme settings

#### Performance Issues

If theme switching is slow:

1. **Minimize DynamicResource usage** - use only where theme switching is needed
2. **Cache brush instances** - avoid repeated resource lookups
3. **Profile theme switching** - identify bottlenecks in large views

## Testing

### Validation Script

Run the comprehensive theme validation:

```powershell
.\Test-ThemeIntegration.ps1 -Detailed
```

This validates:
- Theme dictionary completeness
- StaticResource to DynamicResource conversion
- Dashboard theme integration
- ThemeService infrastructure
- Theme persistence support

### Manual Testing Checklist

- [ ] Theme toggle works in UI
- [ ] Theme preference persists across app restarts
- [ ] All UI elements update when theme changes
- [ ] No resource-not-found errors in logs
- [ ] Accent color changes apply correctly
- [ ] High contrast mode functions properly
- [ ] Font size scaling works as expected

## Best Practices

### Do's
- ✅ Use DynamicResource for all theme-related bindings
- ✅ Follow semantic naming for theme resources
- ✅ Test both light and dark themes
- ✅ Maintain consistent contrast ratios
- ✅ Use pre-built themed control styles

### Don'ts
- ❌ Hard-code colors in XAML
- ❌ Use StaticResource for theme bindings
- ❌ Create theme-specific logic in code-behind
- ❌ Override system colors without fallbacks
- ❌ Ignore accessibility considerations

## References

- **Theme Dictionaries:** `GUI/Themes/DarkTheme.xaml`, `GUI/Themes/LightTheme.xaml`
- **Theme Styles:** `GUI/Themes/ThemeStyles.xaml`
- **Theme Service:** `GUI/Services/ThemeService.cs`
- **Validation Tests:** `Test-ThemeIntegration.ps1`
- **Implementation Task:** T-026 in CLAUDE.local.md