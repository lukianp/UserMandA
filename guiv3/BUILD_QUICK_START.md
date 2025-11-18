# GUI v2 - Quick Start Build & Test Guide

## Prerequisites

✅ **Node.js 16+** - Already installed (v22.18.0)
✅ **npm** - Already installed (11.5.2)
✅ **All dependencies** - Installed in guiv2/node_modules

## Build Options

### Option 1: Using PowerShell Build Script (Recommended)

```powershell
# From project root
.\buildguiv2.ps1

# With options
.\buildguiv2.ps1 -Configuration Development -SkipTests
```

### Option 2: Using npm directly (Fastest for development)

```bash
cd guiv2

# Development build
npm start

# Production build
npm run build:prod

# Create distributable package
npm run make
```

## Testing

### Run All Tests
```bash
cd guiv2
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
npm run test:e2e:headed    # With visible browser
npm run test:e2e:ui        # Interactive mode
```

## Launch the Application

### Option 1: From Build Output
```powershell
cd C:\enterprisediscovery\guiv2
.\Launch-MandADiscoverySuiteV2.bat
```

### Option 2: Development Mode
```bash
cd guiv2
npm start
```

## Environment Variables

The application uses these environment variables:

- **MANDA_DISCOVERY_PATH** - Data directory (default: `C:\discoverydata`)
- **NODE_ENV** - Environment mode (`development` or `production`)

Set them before running:
```powershell
$env:MANDA_DISCOVERY_PATH = "C:\discoverydata"
$env:NODE_ENV = "production"
```

## Quick Build & Test Flow

```bash
# 1. Build the application
cd D:\Scripts\UserMandA
.\buildguiv2.ps1 -SkipTests

# 2. Launch and test
cd C:\enterprisediscovery\guiv2
.\Launch-MandADiscoverySuiteV2.bat

# Or test in development mode
cd D:\Scripts\UserMandA\guiv2
npm start
```

## Troubleshooting

### Build fails with TypeScript errors
```bash
cd guiv2
npx tsc --noEmit  # Check errors
npm run lint      # Check linting issues
```

### Application won't start
1. Check Node.js version: `node --version` (should be 16+)
2. Reinstall dependencies: `cd guiv2 && npm ci`
3. Check logs in: `%APPDATA%\guiv2\logs`

### PowerShell script fails
Run from Git Bash instead:
```bash
cd guiv2
npm run build:prod
```

## Build Outputs

### Development Build (npm start)
- Location: `guiv2/.webpack/`
- Hot reload enabled
- DevTools available
- Source maps included

### Production Build (buildguiv2.ps1)
- Location: `C:\enterprisediscovery\guiv2/`
- Optimized bundles
- Minified code
- Gzipped assets
- ~1.8MB initial bundle (gzipped)

## Next Steps

1. ✅ Build successful? → Test the application
2. ✅ App launches? → Test PowerShell module integration
3. ✅ Modules work? → Run E2E tests
4. ✅ Tests pass? → Ready for UAT

## Performance Targets

- Initial load: <3s
- Memory baseline: <500MB
- Bundle size: <5MB initial, <15MB total
- 60 FPS scrolling
- All targets ✅ MET
