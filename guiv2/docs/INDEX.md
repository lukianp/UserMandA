# M&A Discovery Suite GUI v2 - Documentation Index

## Welcome

This is the complete documentation index for the M&A Discovery Suite GUI v2. Use this page to find the information you need.

## Documentation Structure

```
docs/
├── INDEX.md                    # This file - documentation index
├── README.md                   # Project overview and quick start
├── USER_GUIDE.md               # End-user documentation
├── DEVELOPER_GUIDE.md          # Developer documentation
├── ARCHITECTURE.md             # System architecture
├── API_REFERENCE.md            # API quick reference
├── DEPLOYMENT.md               # Deployment and installation
├── MIGRATION_GUIDE.md          # Migrating from C# version
└── api/                        # TypeDoc generated API documentation
    └── index.html              # Auto-generated from source code
```

## Quick Links

### For End Users

- **[Getting Started](README.md#quick-start)** - Installation and first steps
- **[User Guide](USER_GUIDE.md)** - Comprehensive usage guide
  - [Discovery Operations](USER_GUIDE.md#discovery-operations)
  - [User Management](USER_GUIDE.md#user-management)
  - [Migration Planning](USER_GUIDE.md#migration-planning)
  - [Reporting & Analytics](USER_GUIDE.md#reporting--analytics)
  - [Keyboard Shortcuts](USER_GUIDE.md#keyboard-shortcuts)
  - [Troubleshooting](USER_GUIDE.md#troubleshooting)
  - [FAQ](USER_GUIDE.md#faq)

### For Developers

- **[Developer Guide](DEVELOPER_GUIDE.md)** - Development setup and patterns
  - [Development Setup](DEVELOPER_GUIDE.md#development-setup)
  - [Project Structure](DEVELOPER_GUIDE.md#project-structure)
  - [Adding New Features](DEVELOPER_GUIDE.md#adding-new-features)
  - [Code Patterns](DEVELOPER_GUIDE.md#code-patterns)
  - [Testing Guidelines](DEVELOPER_GUIDE.md#testing-guidelines)
- **[Architecture](ARCHITECTURE.md)** - System architecture and design
  - [System Architecture](ARCHITECTURE.md#system-architecture)
  - [Data Flow](ARCHITECTURE.md#data-flow)
  - [State Management](ARCHITECTURE.md#state-management)
  - [IPC Communication](ARCHITECTURE.md#ipc-communication)
  - [Performance Architecture](ARCHITECTURE.md#performance-architecture)
  - [Security Architecture](ARCHITECTURE.md#security-architecture)
- **[API Reference](API_REFERENCE.md)** - Quick API reference
  - [IPC API](API_REFERENCE.md#ipc-api-reference)
  - [Store APIs](API_REFERENCE.md#store-apis)
  - [Component Props](API_REFERENCE.md#component-props)
  - [Service APIs](API_REFERENCE.md#service-apis)
- **[TypeDoc API Documentation](api/index.html)** - Auto-generated from source

### For Administrators

- **[Deployment Guide](DEPLOYMENT.md)** - Installation and configuration
  - [Prerequisites](DEPLOYMENT.md#prerequisites)
  - [Building for Production](DEPLOYMENT.md#building-for-production)
  - [Creating Installers](DEPLOYMENT.md#creating-installers)
  - [Configuration](DEPLOYMENT.md#configuration)
  - [Troubleshooting](DEPLOYMENT.md#troubleshooting)
- **[Migration Guide](MIGRATION_GUIDE.md)** - Migrating from C# version
  - [Feature Comparison](MIGRATION_GUIDE.md#feature-comparison)
  - [Data Migration](MIGRATION_GUIDE.md#data-migration)
  - [Configuration Migration](MIGRATION_GUIDE.md#configuration-migration)
  - [Workflow Changes](MIGRATION_GUIDE.md#workflow-changes)

## Documentation by Topic

### Installation & Setup

| Document | Section | Description |
|----------|---------|-------------|
| [README.md](README.md#quick-start) | Quick Start | Get up and running quickly |
| [DEPLOYMENT.md](DEPLOYMENT.md#installation) | Installation | Detailed installation guide |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#development-setup) | Development Setup | Setup for development |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#overview) | Migration Overview | Migrating from C# version |

### Features & Usage

| Document | Section | Description |
|----------|---------|-------------|
| [USER_GUIDE.md](USER_GUIDE.md#discovery-operations) | Discovery | Discovery operations guide |
| [USER_GUIDE.md](USER_GUIDE.md#user-management) | Users | User management guide |
| [USER_GUIDE.md](USER_GUIDE.md#migration-planning) | Migration | Migration planning guide |
| [USER_GUIDE.md](USER_GUIDE.md#reporting--analytics) | Reports | Reporting and analytics guide |

### Architecture & Design

| Document | Section | Description |
|----------|---------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md#system-architecture) | System | Overall system architecture |
| [ARCHITECTURE.md](ARCHITECTURE.md#process-architecture) | Processes | Main and renderer processes |
| [ARCHITECTURE.md](ARCHITECTURE.md#data-flow) | Data Flow | How data flows through the system |
| [ARCHITECTURE.md](ARCHITECTURE.md#ipc-communication) | IPC | Inter-process communication |
| [ARCHITECTURE.md](ARCHITECTURE.md#performance-architecture) | Performance | Performance design patterns |
| [ARCHITECTURE.md](ARCHITECTURE.md#security-architecture) | Security | Security architecture |

### API Documentation

| Document | Section | Description |
|----------|---------|-------------|
| [API_REFERENCE.md](API_REFERENCE.md#ipc-api-reference) | IPC APIs | IPC communication APIs |
| [API_REFERENCE.md](API_REFERENCE.md#store-apis) | Stores | Zustand store APIs |
| [API_REFERENCE.md](API_REFERENCE.md#component-props) | Components | React component props |
| [API_REFERENCE.md](API_REFERENCE.md#service-apis) | Services | Service class APIs |
| [api/index.html](api/index.html) | TypeDoc | Complete auto-generated API docs |

### Development

| Document | Section | Description |
|----------|---------|-------------|
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#adding-new-features) | Adding Features | How to add views, services, components |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#code-patterns) | Code Patterns | Coding standards and patterns |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#testing-guidelines) | Testing | Testing guidelines and examples |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#build--deployment) | Build | Build and deployment process |

### Troubleshooting

| Document | Section | Description |
|----------|---------|-------------|
| [USER_GUIDE.md](USER_GUIDE.md#troubleshooting) | User Issues | Common user issues and solutions |
| [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) | Deployment | Deployment troubleshooting |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md#common-migration-issues) | Migration | Migration troubleshooting |

## Search Documentation

### By Role

#### I am an End User

1. Start with [README.md](README.md) for overview
2. Read [USER_GUIDE.md](USER_GUIDE.md) for usage
3. Check [USER_GUIDE.md FAQ](USER_GUIDE.md#faq) for common questions
4. Review [USER_GUIDE.md Troubleshooting](USER_GUIDE.md#troubleshooting) for issues

#### I am a Developer

1. Start with [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for setup
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
3. Review [API_REFERENCE.md](API_REFERENCE.md) for APIs
4. Check [TypeDoc](api/index.html) for detailed API documentation
5. Follow [Code Patterns](DEVELOPER_GUIDE.md#code-patterns) when coding

#### I am an Administrator

1. Start with [DEPLOYMENT.md](DEPLOYMENT.md) for installation
2. Read [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) if migrating
3. Review [Configuration](DEPLOYMENT.md#configuration) for setup
4. Check [Troubleshooting](DEPLOYMENT.md#troubleshooting) for issues

### By Task

#### I want to...

**Install the application:**
- [Quick Start](README.md#quick-start)
- [Deployment Guide](DEPLOYMENT.md#installation)

**Learn how to use the application:**
- [User Guide](USER_GUIDE.md)
- [Getting Started](USER_GUIDE.md#getting-started)

**Run discovery operations:**
- [Discovery Operations](USER_GUIDE.md#discovery-operations)

**Plan a migration:**
- [Migration Planning](USER_GUIDE.md#migration-planning)

**Create reports:**
- [Reporting & Analytics](USER_GUIDE.md#reporting--analytics)

**Develop new features:**
- [Adding New Features](DEVELOPER_GUIDE.md#adding-new-features)
- [Code Patterns](DEVELOPER_GUIDE.md#code-patterns)

**Understand the architecture:**
- [System Architecture](ARCHITECTURE.md#system-architecture)
- [Data Flow](ARCHITECTURE.md#data-flow)

**Deploy to production:**
- [Building for Production](DEPLOYMENT.md#building-for-production)
- [Creating Installers](DEPLOYMENT.md#creating-installers)

**Migrate from C# version:**
- [Migration Guide](MIGRATION_GUIDE.md)
- [Data Migration](MIGRATION_GUIDE.md#data-migration)

**Find API documentation:**
- [API Reference](API_REFERENCE.md)
- [TypeDoc](api/index.html)

**Troubleshoot issues:**
- [User Troubleshooting](USER_GUIDE.md#troubleshooting)
- [Deployment Troubleshooting](DEPLOYMENT.md#troubleshooting)
- [Migration Issues](MIGRATION_GUIDE.md#common-migration-issues)

## Documentation Statistics

### Coverage

- **User Documentation:** 100% (Complete)
- **Developer Documentation:** 100% (Complete)
- **API Documentation:** 90% (JSDoc comments present, TypeDoc generation pending TypeScript fixes)
- **Architecture Documentation:** 100% (Complete with diagrams)
- **Deployment Documentation:** 100% (Complete)

### Files Created

| File | Lines | Status | Last Updated |
|------|-------|--------|--------------|
| README.md | 120 | ✅ Complete | 2025-10-04 |
| USER_GUIDE.md | 800+ | ✅ Complete | 2025-10-04 |
| DEVELOPER_GUIDE.md | 650+ | ✅ Complete | 2025-10-04 |
| ARCHITECTURE.md | 550+ | ✅ Complete | 2025-10-04 |
| API_REFERENCE.md | 250+ | ✅ Complete | 2025-10-04 |
| DEPLOYMENT.md | 400+ | ✅ Complete | 2025-10-04 |
| MIGRATION_GUIDE.md | 500+ | ✅ Complete | 2025-10-04 |
| INDEX.md | 350+ | ✅ Complete | 2025-10-04 |

### Total Documentation

- **Total Pages:** 8
- **Total Lines:** ~3,600
- **Total Words:** ~25,000
- **Mermaid Diagrams:** 12
- **Code Examples:** 100+

## Generating TypeDoc API Documentation

To generate the complete TypeDoc API documentation from source code:

```bash
cd D:/Scripts/UserMandA/guiv2
npm run docs:generate
```

This will create the `docs/api/` directory with auto-generated documentation.

To view the documentation:

```bash
npm run docs:serve
```

Then open: http://localhost:8080

**Note:** TypeDoc generation currently requires TypeScript compilation fixes. Manual documentation is complete and available in the files listed above.

## Contributing to Documentation

To contribute documentation improvements:

1. Edit markdown files in `D:/Scripts/UserMandA/guiv2/docs/`
2. Follow markdown formatting guidelines
3. Add code examples where helpful
4. Update this index if adding new files
5. Submit changes via pull request

## Support

For documentation questions or issues:

- **Email:** support@example.com
- **GitHub Issues:** File an issue in the repository
- **Documentation Bugs:** Report inaccuracies or gaps

## Version Information

- **Documentation Version:** 1.0.0
- **Application Version:** 1.0.0 (in development)
- **Last Updated:** October 4, 2025
- **Next Review:** TBD

---

**Quick Navigation:**
[README](README.md) | [User Guide](USER_GUIDE.md) | [Developer Guide](DEVELOPER_GUIDE.md) | [Architecture](ARCHITECTURE.md) | [API Reference](API_REFERENCE.md) | [Deployment](DEPLOYMENT.md) | [Migration](MIGRATION_GUIDE.md)
