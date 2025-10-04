# E2E Test Suite for M&A Discovery Suite GUI v2

This directory contains comprehensive End-to-End (E2E) tests for the Electron application using Playwright.

## Test Structure

```
tests/
├── e2e/                           # E2E test specifications
│   ├── user-discovery.spec.ts     # User discovery workflow (191 lines)
│   ├── migration-journey.spec.ts  # Migration end-to-end tests (296 lines)
│   ├── navigation.spec.ts         # Routing and navigation (273 lines)
│   ├── error-handling.spec.ts     # Error boundaries & recovery (377 lines)
│   └── accessibility.spec.ts      # Keyboard & a11y tests (447 lines)
├── fixtures/                      # Test data fixtures
│   ├── test-mappings.csv         # Sample user mappings
│   └── test-profile.json         # Sample profile configuration
└── README.md                      # This file
```

## Test Coverage

### 1. User Discovery Journey (`user-discovery.spec.ts`)
- Complete user discovery workflow
- Search and filter functionality
- Data grid interactions
- User selection (single and multiple)
- Export to CSV
- Empty state handling
- Search clearing

### 2. Migration Journey (`migration-journey.spec.ts`)
- Create migration wave
- Import/export user mappings
- Migration validation
- Migration execution with progress tracking
- Pause/resume migration
- Rollback functionality
- Migration statistics
- Conflict resolution

### 3. Navigation & Routing (`navigation.spec.ts`)
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

### 4. Error Handling (`error-handling.spec.ts`)
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

### 5. Accessibility (`accessibility.spec.ts`)
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

## Test Statistics

- **Total Test Files:** 5
- **Total Lines of Code:** 1,584 lines (excluding fixtures)
- **Test Fixtures:** 2 files (55 lines)
- **Total Coverage:** 6 critical user journeys
- **Estimated Runtime:** 5-8 minutes (sequential)

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
