# Theme Overhaul Guide

This document describes the structure of the theme system after the dynamic resource overhaul.

## Theme Dictionaries

Each theme is defined in a XAML resource dictionary located in `GUI/Themes`:

- `LightTheme.xaml`
- `DarkTheme.xaml`
- `HighContrastTheme.xaml`

Every dictionary contains the complete set of brush keys used by the application.  When adding a new theme, copy one of the existing dictionaries and update the brush values while keeping the keys unchanged.

## Required Resource Keys

The following keys **must** be present in every theme dictionary:

- `BackgroundBrush`
- `SurfaceBrush`
- `CardBrush`
- `ForegroundBrush`
- `SecondaryForegroundBrush`
- `MutedForegroundBrush`
- `DisabledForegroundBrush`
- `BorderBrush`
- `FocusBorderBrush`
- `HoverBorderBrush`
- `AccentBrush`
- `AccentLightBrush`
- `AccentDarkBrush`
- `AccentHoverBrush`
- `AccentPressedBrush`
- `SuccessBrush`
- `WarningBrush`
- `ErrorBrush`
- `InfoBrush`
- `HoverBrush`
- `PressedBrush`
- `SelectedBrush`
- `FocusBrush`
- `InputBackgroundBrush`
- `InputBorderBrush`
- `InputFocusBrush`
- `InputDisabledBrush`
- `PrimaryTextBrush`
- `SecondaryTextBrush`
- `ButtonHoverBrush`
- `ValidBorderBrush`
- `InvalidBorderBrush`

## Accent Colours

Accent colours are applied at runtime by `ThemeService`.  Supported accents are **Blue**, **Green**, **Purple**, **Orange** and **Red**.  Each theme dictionary supplies a default accent which is replaced when the user selects a different accent.

## Adding a New Theme

1. Create a new XAML file in `GUI/Themes` following the naming convention `YourThemeName.xaml`.
2. Populate the file with all required resource keys.
3. Update `ThemeService` if the theme should be selectable at runtime.

## Theme Application

`ThemeService` loads the appropriate dictionary at startup and whenever the theme changes.  All theme-sensitive XAML elements should reference brushes using `DynamicResource` so that updates propagate instantly across the UI.
