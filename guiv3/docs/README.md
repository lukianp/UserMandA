# M&A Discovery Suite GUI v2 - Documentation

## Overview

The M&A Discovery Suite GUI v2 is an enterprise-grade Electron-based application for managing mergers and acquisitions discovery, user management, and tenant migrations. This is a complete rewrite of the original C#/WPF application in TypeScript/React/Electron.

## Key Features

- **Discovery Operations**: Comprehensive discovery across Active Directory, Microsoft 365, Exchange, SharePoint, Teams, and OneDrive
- **User Management**: Advanced user discovery, filtering, and management capabilities
- **Migration Planning**: Multi-wave migration planning with dependency management
- **Resource Mapping**: Source-to-target resource mapping with conflict resolution
- **Reporting & Analytics**: Executive dashboards, custom reports, and data visualization
- **Real-time Monitoring**: Live progress tracking and system status updates
- **Enterprise Performance**: Handles 100,000+ rows with virtual scrolling at 60 FPS

## Technology Stack

- **Framework**: Electron 38.2.0
- **UI**: React 18 + TypeScript 5.6
- **State Management**: Zustand (with persistence, devtools, immer)
- **Styling**: Tailwind CSS 3.4
- **Data Grid**: AG Grid Enterprise 34.2
- **Icons**: Lucide React
- **Routing**: React Router 7.9
- **Testing**: Jest + Playwright + React Testing Library
- **Build**: Electron Forge + Webpack

## Architecture

### Directory Structure

```
guiv2/
├── src/
│   ├── main/              # Electron main process (Node.js)
│   │   ├── services/      # Backend services
│   │   └── ipcHandlers.ts # IPC communication
│   ├── renderer/          # React frontend
│   │   ├── components/    # UI components
│   │   │   ├── atoms/     # Basic elements
│   │   │   ├── molecules/ # Composed components
│   │   │   ├── organisms/ # Complex components
│   │   │   ├── dialogs/   # Modal dialogs
│   │   │   └── layouts/   # Layout components
│   │   ├── views/         # Page views
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # Frontend services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   └── preload.ts         # Secure IPC bridge
├── docs/                  # Documentation
└── tests/                 # Test files
```

### Key Components

- **PowerShell Service**: Enterprise-grade PowerShell execution with session pooling
- **Discovery Service**: Orchestration of discovery operations
- **Migration Services**: Multi-wave migration orchestration and execution
- **Data Grid**: High-performance virtualized data grid
- **Export Service**: Multi-format export (CSV, Excel, PDF, JSON, XML, HTML)

## Documentation

- [User Guide](USER_GUIDE.md) - End-user documentation
- [Developer Guide](DEVELOPER_GUIDE.md) - Development setup and guidelines
- [API Reference](API_REFERENCE.md) - Quick API reference
- [Architecture](ARCHITECTURE.md) - System architecture and design
- [Migration Guide](MIGRATION_GUIDE.md) - Migrating from C# version
- [Deployment Guide](DEPLOYMENT.md) - Deployment and installation
- [Component Reference](COMPONENTS.md) - UI component documentation

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PowerShell 7+ (for backend scripts)
- Windows 10/11 or Windows Server 2019+

### Installation

```bash
cd D:/Scripts/UserMandA/guiv2
npm install
```

### Development

```bash
npm start         # Start development server
npm run lint      # Run ESLint
npm test          # Run unit tests
npm run test:e2e  # Run end-to-end tests
```

### Building

```bash
npm run package   # Package application
npm run make      # Create distributable
```

## Performance

- Initial load: <3 seconds
- View switching: <100ms
- Data grid: 100,000 rows at 60 FPS
- Memory usage: <500MB baseline, <1GB under load
- Bundle size: <5MB initial, <15MB total

## Testing

- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- Coverage target: 80%

## License

MIT

## Support

For issues and support, please contact the development team or file an issue in the repository.

## Version

Current version: 1.0.0 (in development)
Status: 43% complete (see CLAUDE.md for detailed status)
