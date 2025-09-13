# M&A Discovery Application

This is the main repository for the M&A Discovery application, a comprehensive tool for discovery and migration workflows in enterprise environments.

## Overview

The M&A Discovery application provides a unified interface for discovering, analyzing, and migrating various enterprise assets including users, computers, Azure resources, VMware environments, and more.

## Features

- Multi-platform discovery (Azure, VMware, SharePoint, Teams, etc.)
- Real-time monitoring and validation
- Comprehensive reporting and auditing
- Migration workflow management
- User interface standardization

## GUI Standards

### New GUI Standards Implementation

The application has adopted standardized GUI components to ensure consistency across all views and modules:

#### RoundedButtonStyle
All buttons throughout the application now utilize the `RoundedButtonStyle`, which provides:
- Consistent rounded corners for a modern appearance
- Unified hover and focus states
- Responsive sizing that adapts to content
- Accessibility-compliant color contrast

To apply the RoundedButtonStyle:
```xaml
<Button Style="{StaticResource RoundedButtonStyle}"
        Content="Click Me"
        Command="{Binding SomeCommand}" />
```

#### Standard View Template
All views now follow a standard template that includes:
- Consistent header layout with title and navigation
- Standardized spacing and margins using predefined resources
- Unified grid layouts with responsive columns
- Consistent error handling and loading state presentations

The standard view template ensures that:
- All views have a cohesive look and feel
- Maintenance is simplified through shared resources
- User experience is predictable across modules
- Future updates can be applied globally

For more details on the standardization effort, see [`GUI_STANDARDIZATION_COMPLETE.md`](GUI_STANDARDIZATION_COMPLETE.md).

## Getting Started

### Prerequisites

- .NET Framework 4.8 or later
- Windows PowerShell 5.1 or later
- Azure CLI (for Azure discovery modules)

### Installation

1. Clone the repository
2. Run the QuickStart.ps1 script
3. Configure your environment settings

## Documentation

- [Technical Documentation](Documentation/)
- [API Reference](Documentation/API/)
- [Migration Guides](Documentation/Migration/)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.