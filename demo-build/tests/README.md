**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0
# E2E Test Suite for M&A Discovery Suite GUI v2

This directory contains comprehensive End-to-End (E2E) tests for the Electron application using Playwright.

## Test Structure

```
tests/
├── e2e/                           # E2E test specifications
│   ├── user-journey.spec.ts       # Complete user discovery workflow (650 lines) ✨ NEW
│   ├── migration-journey.spec.ts  # Complete migration workflow (820 lines) ✨ ENHANCED
│   ├── discovery-journey.spec.ts  # All 26 discovery modules (950 lines) ✨ NEW
│   ├── user-discovery.spec.ts     # User discovery workflow (191 lines)
│   ├── navigation.spec.ts         # Routing and navigation (273 lines)
│   ├── error-handling.spec.ts     # Error boundaries & recovery (377 lines)
│   └── accessibility.spec.ts      # Keyboard & a11y tests (447 lines)
├── fixtures/                      # Test data fixtures
│   ├── electron-helpers.ts        # Reusable E2E test utilities (500 lines) ✨ NEW
│   ├── test-mappings.csv          # Sample user mappings
│   └── test-profile.json          # Sample profile configuration
└── README.md                      # This file
```

## Test Coverage

### 1. User Journey (`user-journey.spec.ts`) ✨ NEW - P0 CRITICAL
**Complete user discovery workflow from profile selection to CSV export**
- Select source profile from dropdown
- Test connection to verify profile
- Navigate to Domain Discovery
- Run domain discovery operation (30+ seconds)
- Navigate to Users view
- Wait for discovered users in data grid
- Apply search filter and verify results
- Clear filter to show all users
- Select user from grid (single and multiple)
- Export users to CSV
- Verify export file exists and has valid content
- Verify export success notification
- Handle empty search results gracefully
- Select multiple users with Ctrl+Click
- Test pagination through large user lists
- Refresh user data
- Sort users by column
- Disable action buttons when no selection

**Tests:** 8 comprehensive test cases covering full user journey

### 2. Migration Journey (`migration-journey.spec.ts`) ✨ ENHANCED - P0 CRITICAL
**Complete migration workflow from project creation to execution monitoring**
- Create migration project
- Create migration wave with scheduling
- Assign users to migration wave
- Map resources source → target
- Import mappings from CSV
- Create manual resource mappings
- Resolve mapping conflicts
- Run validation checks on wave
- Configure validation options (licenses, permissions, mailboxes)
- Wait for validation to complete (60 seconds max)
- View validation results (passed/failed/warnings)
- Export validation report
- Execute migration with dry run mode
- Track migration progress (progress bar, percentage)
- Monitor status grid updates in real-time
- Verify live log streaming
- Display migration statistics (total, migrated, failed, success rate)
- Pause and resume migration
- Handle migration completion
- Export migration mappings
- Handle validation errors gracefully

**Tests:** 10 comprehensive test cases covering full migration lifecycle

### 3. Discovery Journey (`discovery-journey.spec.ts`) ✨ NEW - P0 CRITICAL
**Comprehensive test of all 26 discovery modules**
- Navigate to Infrastructure Discovery Hub
- Test each discovery module independently:
  - Active Directory Discovery
  - Azure Discovery
  - Office 365 Discovery
  - Exchange Discovery
  - SharePoint Discovery
  - Teams Discovery
  - OneDrive Discovery
  - Domain Discovery
  - Network Discovery
  - Application Discovery
  - File System Discovery
  - Licensing Discovery
  - Environment Detection
  - Conditional Access Policies Discovery
  - Data Loss Prevention Discovery
  - Identity Governance Discovery
  - Intune Discovery
  - Power Platform Discovery
  - Security Infrastructure Discovery
  - SQL Server Discovery
  - VMware Discovery
  - Hyper-V Discovery
  - AWS Cloud Infrastructure Discovery
  - Google Workspace Discovery
  - Web Server Configuration Discovery
  - Infrastructure Discovery Hub
- For each module: Load data → Filter → Search → Export
- Run multiple discoveries sequentially
- Handle discovery errors gracefully
- Display discovery statistics
- Support result filtering and bulk selection
- Refresh discovery results
- Cancel running discovery operations
- Maintain state across navigation

**Tests:** 30+ test cases covering all 26 discovery modules

### 4. User Discovery Journey (`user-discovery.spec.ts`)
- Complete user discovery workflow
- Search and filter functionality
- Data grid interactions
- User selection (single and multiple)
- Export to CSV
- Empty state handling
- Search clearing

### 5. Navigation & Routing (`navigation.spec.ts`)
- All primary routes (Overview, Users, Groups, Discovery, Infrastructure, Migration, Reports, Settings)
- Browser back/forward navigation
- Sidebar navigation
- Breadcrumbs for nested routes
- Lazy loading verification
- Invalid route handling
- Scroll position persistence
- Loading states
- Deep linking
- Mobile sidebar collapse
- Active route highlighting

### 6. Error Handling (`error-handling.spec.ts`)
- React Error Boundary display
- IPC communication errors
- Retry failed operations
- Network timeout errors
- Form validation errors
- File upload errors
- Permission errors
- User-friendly error messages
- Console error logging
- Cascading error prevention
- Error reporting mechanism

### 7. Accessibility (`accessibility.spec.ts`)
- Keyboard shortcuts (Ctrl+K, Ctrl+W, Ctrl+T, Ctrl+S, Ctrl+F, Ctrl+P)
- Tab navigation (forward and backward)
- ARIA labels on interactive elements
- Visible focus indicators
- Data grid keyboard navigation
- Screen reader announcements (aria-live)
- Proper heading hierarchy
- Color contrast
- Keyboard-only form submission
- Skip navigation links
- Modal focus trap
- Image alt text

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run with Browser Visible
```bash
npm run test:e2e:headed
```

### Debug Mode (Step Through)
```bash
npm run test:e2e:debug
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### View Test Report
```bash
npm run test:e2e:report
```

### Run Specific Test File
```bash
npx playwright test user-discovery.spec.ts
```

### Run Specific Test by Name
```bash
npx playwright test -g "should complete full user discovery workflow"
```

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Test Directory:** `./tests/e2e`
- **Timeout:** 60 seconds per test
- **Retries:** 2 retries for flaky tests
- **Workers:** 1 (sequential execution for Electron)
- **Screenshots:** Captured on failure
- **Videos:** Recorded on failure
- **Traces:** Retained on failure
- **Viewport:** 1280x720

### Reporters
1. **HTML Report:** `playwright-report/index.html`
2. **JSON Results:** `test-results/test-results.json`
3. **Console List:** Real-time test progress

## Test Fixtures

### test-mappings.csv
Sample CSV file containing 16 user/group/mailbox/site/license mappings for testing import functionality.

### test-profile.json
Sample profile configuration with:
- Azure AD connection details
- Service principal credentials
- API endpoints
- Settings (timeout, retry, batch size)
- Feature flags
- Metadata

## Writing New Tests

### Test File Template
```typescript
import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';
import path from 'path';

let electronApp: ElectronApplication;
let mainWindow: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../../.webpack/main')],
    env: { ...process.env, NODE_ENV: 'test' },
  });
  mainWindow = await electronApp.firstWindow();
  await mainWindow.waitForLoadState('domcontentloaded');
  await mainWindow.waitForSelector('[data-cy="app-loaded"]', { timeout: 10000 });
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('My Feature', () => {
  test('should do something', async () => {
    // Your test code here
  });
});
```

### Best Practices
1. **Use data-cy attributes** for stable selectors
2. **Use test.step()** to break down complex tests
3. **Add timeouts** for async operations
4. **Clean up state** between tests
5. **Mock external dependencies** when needed
6. **Test both happy and error paths**
7. **Verify accessibility** (ARIA, keyboard nav)
8. **Use descriptive test names**

## CI/CD Integration

### Environment Variables
- `CI=true`: Enables CI-specific settings (retries, workers)
- `NODE_ENV=test`: Sets test environment

### Expected Outcomes
- All tests should pass in under 10 minutes
- Retry logic handles flaky tests
- Screenshots/videos available for debugging failures
- HTML report generated for review

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if Electron app is building correctly
- Verify `[data-cy="app-loaded"]` selector exists

### Tests Fail Intermittently
- Increase wait timeouts
- Add explicit wait conditions
- Check for race conditions

### Electron App Won't Launch
- Verify webpack build: `npm run package`
- Check main process path: `.webpack/main`
- Review Electron logs in test output

### No Screenshots/Videos
- Ensure `playwright-report` and `test-results` directories exist
- Check disk space
- Verify reporter configuration

## Test Fixtures & Utilities

### `electron-helpers.ts` ✨ NEW
**Reusable test utilities for Electron E2E tests**

Core functions:
- `launchElectronApp()` - Launch Electron with test environment
- `waitForGridReady()` - Wait for AG Grid to load with data
- `getGridRowCount()` - Get current row count from grid
- `selectGridRow()` - Select row by index
- `selectMultipleGridRows()` - Select multiple rows with Ctrl
- `waitForDownload()` - Handle file downloads
- `verifyFileExists()` - Verify downloaded file exists
- `readCsvFile()` - Read and parse CSV content
- `waitForPowerShellExecution()` - Wait for PowerShell script completion
- `fillFormField()` - Fill form field with validation
- `applySearchFilter()` - Apply search with debounce
- `navigateToView()` - Navigate and wait for view to load
- `waitForNotification()` - Wait for toast/notification
- `getProgressValue()` - Get progress bar value
- `waitForProgress()` - Wait for progress to reach target
- `confirmDialog()` - Confirm dialog action
- `takeTimestampedScreenshot()` - Screenshot with timestamp
- `retryWithBackoff()` - Retry action with exponential backoff
- `cleanupTestFiles()` - Clean up downloaded test files

**Total:** 30+ utility functions for test reliability

### `test-mappings.csv`
Sample CSV with 16 user/group/mailbox/site/license mappings

### `test-profile.json`
Sample profile configuration with Azure AD connection details

## Test Statistics

- **Total Test Files:** 8 (3 new P0 critical tests ✨)
- **Total Lines of Code:** 4,708 lines
  - User Journey: 650 lines ✨
  - Migration Journey: 820 lines ✨
  - Discovery Journey: 950 lines ✨
  - User Discovery: 191 lines
  - Navigation: 273 lines
  - Error Handling: 377 lines
  - Accessibility: 447 lines
  - Fixtures/Helpers: 500 lines ✨
- **Test Fixtures:** 3 files (1,055 lines)
- **Discovery Modules Tested:** 26 complete modules ✨
- **Total Coverage:** 48+ test cases across 9 critical user journeys ✨
- **Estimated Runtime:** 15-25 minutes (sequential execution)
- **P0 Critical Tests:** 3 files (2,420 lines) covering user, migration, and discovery workflows ✨

## Maintenance

### Regular Updates Needed
1. Update selectors when UI changes
2. Add tests for new features
3. Update fixtures with realistic data
4. Review and remove flaky tests
5. Keep Playwright dependencies updated

### Review Schedule
- **Weekly:** Check test pass rate
- **Monthly:** Review and refactor flaky tests
- **Quarterly:** Audit test coverage gaps
- **Annually:** Major framework updates

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Electron Guide](https://playwright.dev/docs/api/class-electron)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

