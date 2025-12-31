**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0
# M&A Discovery Suite GUI v2 - Migration Guide

## Migrating from C# WPF Version

This guide helps you transition from the legacy C#/WPF application to the new TypeScript/Electron version.

## Table of Contents

1. [Overview](#overview)
2. [Feature Comparison](#feature-comparison)
3. [Data Migration](#data-migration)
4. [Configuration Migration](#configuration-migration)
5. [Workflow Changes](#workflow-changes)
6. [Training Resources](#training-resources)

## Overview

### Why Migrate?

The new TypeScript/Electron version provides:

- **Better Performance:** Handles 100,000+ rows at 60 FPS
- **Modern UI:** React-based responsive interface
- **Enhanced Features:** Advanced reporting, real-time updates, better export options
- **Cross-Platform:** Windows, macOS, Linux support (future)
- **Better Maintainability:** TypeScript codebase, modern tooling
- **Active Development:** Continuous improvements and updates

### Migration Timeline

1. **Phase 1:** Install GUI v2 alongside existing application
2. **Phase 2:** Import profiles and settings
3. **Phase 3:** Familiarize with new interface
4. **Phase 4:** Migrate workflows and processes
5. **Phase 5:** Decommission old application

## Feature Comparison

| Feature | C# WPF | TypeScript/Electron | Status |
|---------|--------|---------------------|--------|
| Active Directory Discovery | ✅ | ✅ | **Feature Parity** |
| Exchange Discovery | ✅ | ✅ | **Feature Parity** |
| SharePoint Discovery | ✅ | ✅ | **Feature Parity** |
| Teams Discovery | ✅ | ✅ | **Feature Parity** |
| OneDrive Discovery | ✅ | ✅ | **Feature Parity** |
| User Management | ✅ | ✅ | **Enhanced** |
| Migration Planning | ✅ | ✅ | **Enhanced** |
| Multi-Wave Migration | ✅ | ✅ | **Feature Parity** |
| Resource Mapping | ✅ | ✅ | **Enhanced** |
| Conflict Resolution | ✅ | ✅ | **Enhanced** |
| Rollback Support | ✅ | ✅ | **Feature Parity** |
| Executive Dashboard | ✅ | ✅ | **Enhanced** |
| Custom Reports | ❌ | ✅ | **New Feature** |
| Report Scheduling | ❌ | ✅ | **New Feature** |
| Data Visualization | Basic | ✅ | **Enhanced** |
| Export to CSV | ✅ | ✅ | **Feature Parity** |
| Export to Excel | ✅ | ✅ | **Enhanced** |
| Export to PDF | ❌ | ✅ | **New Feature** |
| Real-time Updates | ❌ | ✅ | **New Feature** |
| Command Palette | ❌ | ✅ | **New Feature** |
| Dark Mode | ❌ | ✅ | **New Feature** |
| Keyboard Shortcuts | Basic | ✅ | **Enhanced** |
| Performance (Large Datasets) | ⚠️ | ✅ | **Enhanced** |

## Data Migration

### Exporting Data from C# Version

1. **Export Profiles:**
   - Settings > Export > Profiles
   - Save to: `C:\Users\<username>\Documents\M&A-Profiles.json`

2. **Export Discovery Results:**
   - For each discovery run, click Export > JSON
   - Save to: `C:\Users\<username>\Documents\M&A-Discovery\`

3. **Export Migration Projects:**
   - Migration > Projects > Export All
   - Save to: `C:\Users\<username>\Documents\M&A-Projects.json`

4. **Export Settings:**
   - Settings > Export Settings
   - Save to: `C:\Users\<username>\Documents\M&A-Settings.json`

### Importing Data to GUI v2

1. **Import Profiles:**
   ```typescript
   // In GUI v2
   Settings > Import > Profiles
   Select: C:\Users\<username>\Documents\M&A-Profiles.json
   ```

2. **Import Discovery Results:**
   ```typescript
   Discovery > History > Import
   Select directory: C:\Users\<username>\Documents\M&A-Discovery\
   ```

3. **Import Migration Projects:**
   ```typescript
   Migration > Projects > Import
   Select: C:\Users\<username>\Documents\M&A-Projects.json
   ```

4. **Import Settings:**
   ```typescript
   Settings > Import Settings
   Select: C:\Users\<username>\Documents\M&A-Settings.json
   ```

### Manual Data Migration

If automatic import fails, manually configure:

**Profiles (example):**

C# Format:
```xml
<Profile>
  <Name>Production</Name>
  <TenantId>...</TenantId>
  <Domain>contoso.com</Domain>
</Profile>
```

TypeScript Format:
```json
{
  "id": "profile-1",
  "name": "Production",
  "tenantId": "...",
  "domain": "contoso.com",
  "connectionType": "microsoft365"
}
```

## Configuration Migration

### Application Settings

| C# Setting | GUI v2 Equivalent | Notes |
|------------|-------------------|-------|
| Theme | Settings > Appearance > Theme | Now supports dark mode |
| Auto-refresh | Settings > General > Auto-refresh | Same functionality |
| Log Level | Settings > Logging > Level | Same functionality |
| PowerShell Path | Settings > PowerShell > Executable Path | Same functionality |
| Data Directory | Settings > Advanced > Data Path | New location |

### PowerShell Module Paths

C# Version:
```
C:\Program Files\M&A Discovery\Modules
```

GUI v2:
```
D:\Scripts\UserMandA\Modules
```

Update scripts referencing modules to use new paths.

### Configuration File Locations

| Item | C# Version | GUI v2 |
|------|------------|--------|
| Profiles | `%APPDATA%\M&A Discovery\profiles.xml` | `%APPDATA%\M&A Discovery Suite\config.json` |
| Settings | `%APPDATA%\M&A Discovery\settings.xml` | `%APPDATA%\M&A Discovery Suite\config.json` |
| Logs | `%APPDATA%\M&A Discovery\Logs` | `%APPDATA%\M&A Discovery Suite\logs` |
| Cache | `%APPDATA%\M&A Discovery\Cache` | `%APPDATA%\M&A Discovery Suite\cache` |

## Workflow Changes

### Discovery Workflow

**C# Version:**
1. Select profile dropdown
2. Click Discovery > AD Discovery
3. Configure options in new window
4. Click "Start"
5. Wait for modal to close
6. Results appear in grid

**GUI v2:**
1. Select profile dropdown
2. Click Discovery > AD Discovery (opens in tab)
3. Configure options inline
4. Click "Start Discovery"
5. Real-time progress updates
6. Results appear immediately in grid

**Key Differences:**
- Tabbed interface (no modal windows)
- Real-time progress
- Faster response times

### Migration Workflow

**C# Version:**
1. Create project (modal dialog)
2. Create waves (modal dialog)
3. Assign users (separate screen)
4. Map resources (separate screen)
5. Validate (separate screen)
6. Execute (modal dialog)

**GUI v2:**
1. Create project (inline form)
2. Create waves (inline form)
3. Assign users (drag-and-drop)
4. Map resources (inline mapping)
5. Validate (real-time validation)
6. Execute (inline with progress)

**Key Differences:**
- All operations in single tab
- Drag-and-drop support
- Real-time validation
- Visual progress tracking

### Export Workflow

**C# Version:**
1. Select rows
2. File > Export
3. Choose format (CSV/Excel)
4. Save dialog
5. Wait for completion

**GUI v2:**
1. Select rows (or leave unselected for all)
2. Click Export button
3. Choose format (CSV/Excel/PDF/JSON)
4. Export dialog with preview
5. Progress indicator
6. Success toast notification

**Key Differences:**
- More export formats
- Export preview
- Progress indication
- Non-blocking operation

## Training Resources

### Video Tutorials

(To be created)

- Getting Started with GUI v2 (10 min)
- Migrating from C# Version (15 min)
- Advanced Features Tour (20 min)
- Custom Report Building (15 min)
- Migration Planning Best Practices (30 min)

### Documentation

- [User Guide](USER_GUIDE.md) - Comprehensive user documentation
- [Developer Guide](DEVELOPER_GUIDE.md) - For customizations
- [API Reference](API_REFERENCE.md) - API documentation
- [Architecture](ARCHITECTURE.md) - System architecture

### Quick Reference Cards

**Keyboard Shortcuts:**

| Action | C# Version | GUI v2 |
|--------|------------|--------|
| New Tab | N/A | `Ctrl+N` |
| Close Tab | N/A | `Ctrl+W` |
| Refresh | `F5` | `F5` or `Ctrl+R` |
| Export | `Ctrl+E` | `Ctrl+E` |
| Find | `Ctrl+F` | `Ctrl+F` |
| Settings | `Ctrl+,` | `Ctrl+,` |
| Command Palette | N/A | `Ctrl+P` |

## Common Migration Issues

### Issue: Profiles Don't Import

**Solution:**
1. Verify JSON format is valid
2. Check file permissions
3. Manually create profiles using UI

### Issue: Discovery Results Missing

**Solution:**
1. Export results from C# version to JSON
2. Import JSON files individually
3. Verify data format matches expected schema

### Issue: PowerShell Scripts Fail

**Solution:**
1. Update module paths in scripts
2. Verify PowerShell 7+ installed
3. Check execution policy
4. Test scripts manually first

### Issue: Performance Slower Than Expected

**Solution:**
1. Check system resources (RAM, CPU)
2. Adjust data grid page size
3. Enable pagination
4. Clear cache
5. Restart application

## Rollback Plan

If you need to revert to the C# version:

1. C# version remains installed during migration
2. No data loss (both versions use separate data stores)
3. Export GUI v2 data before rollback
4. Uninstall GUI v2
5. Continue using C# version

## Support During Migration

- Email: support@example.com
- Migration assistance: Available
- Training sessions: Available upon request
- Documentation: This guide

---

For more information, see:
- [User Guide](USER_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Architecture](ARCHITECTURE.md)

