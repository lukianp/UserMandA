# Test Structure Overview and Jest Integration

## Current Test Structure

### Test Locations
The project has tests organized in two main directories:
- `guiv2/src/` - Main GUIv2 application tests (React/TypeScript)
- `src/` - Legacy application tests (React/TypeScript)
- `GUI.Tests/` - C# unit tests (separate project)

### Test Types Found

#### guiv2/src Tests
- **Renderer Tests**: React components and hooks in `guiv2/src/renderer/`
- **Main Tests**: Electron main process services in `guiv2/src/main/`
- **Shared Tests**: Shared utilities and types

#### src Tests
- **Renderer Tests**: Legacy React components in `src/renderer/`
- **Main Tests**: Legacy Electron main process in `src/main/`
- **Shared Tests**: Legacy shared utilities

## Jest Configuration Issues Fixed

### Path Resolution Problems
**Issue**: Jest setupFiles and setupFilesAfterEnv pointed to `src/test-utils/` but actual files were in `guiv2/src/test-utils/`

**Solution**: Updated jest.config.js to use correct paths:
```javascript
setupFiles: ['<rootDir>/guiv2/src/test-utils/polyfills.js'],
setupFilesAfterEnv: ['<rootDir>/guiv2/src/test-utils/setupTests.ts'],
```

### Test Discovery Issues
**Issue**: Jest only looked for tests in `src/` directory, missing `guiv2/src/` tests

**Solution**: Updated testMatch patterns to include both locations:
```javascript
testMatch: [
  '<rootDir>/guiv2/src/renderer/**/*.(test|spec).(ts|tsx)',
  '<rootDir>/guiv2/src/main/**/*.(test|spec).(ts|tsx)',
  '<rootDir>/guiv2/src/shared/**/*.(test|spec).(ts|tsx)',
  '<rootDir>/src/renderer/**/*.(test|spec).(ts|tsx)',
  '<rootDir>/src/main/**/*.(test|spec).(ts|tsx)',
  '<rootDir>/src/shared/**/*.(test|spec).(ts|tsx)'
],
```

### Coverage Collection Updates
Added coverage collection for both directory structures to ensure comprehensive code coverage reporting.

## VSCode Integration

### Jest Extension Configuration
The VS Code Jest extension should now properly discover and run tests from both locations. Key settings:

```json
{
  "jest.runMode": {
    "type": "on-demand"
  },
  "jest.outputConfig": {
    "revealOn": "run",
    "revealWithFocus": "test-results",
    "clearOnRun": "none"
  },
  "testing.automaticallyOpenTestResults": "openOnTestStart"
}
```

### Test Organization Structure

```
guiv2/src/
├── renderer/
│   ├── hooks/           # Custom React hooks tests
│   ├── views/           # React component tests
│   └── services/        # Service layer tests
├── main/
│   └── services/        # Electron main process tests
└── test-utils/          # Shared test utilities

src/
├── renderer/
│   ├── hooks/           # Legacy hook tests
│   ├── views/           # Legacy component tests
│   └── services/        # Legacy service tests
├── main/
│   └── services/        # Legacy main process tests
└── test-utils/          # Legacy test utilities
```

## Test Categories

### Passing Tests (Sample)
- Discovery Logic Hooks (Azure, Exchange, Teams, etc.)
- Basic View Rendering Tests
- Service Integration Tests

### Failing Tests (Common Issues)
- Tests failing to run due to missing dependencies
- Component rendering issues
- Mock setup problems
- Import path resolution issues

## Recommendations

1. **Consolidate Test Utilities**: Consider merging `guiv2/src/test-utils` and `src/test-utils` to avoid duplication
2. **Standardize Test Patterns**: Ensure consistent test structure across both codebases
3. **CI/CD Integration**: Configure Jest to run all tests in both directories
4. **Coverage Reporting**: Set up combined coverage reports for both codebases

## Next Steps

1. Verify all tests are now discovered by Jest
2. Address any remaining failing test configurations
3. Set up automated test running in VSCode
4. Configure test coverage reporting