# GuiV2 Testing Architecture - Comprehensive Design

## Executive Summary
This document outlines a complete testing strategy to achieve 100% coverage of the /guiv2/ Electron application.

## Current State Analysis

### Coverage Statistics
- **Total Source Files**: 755 TypeScript files
- **Existing Test Files**: 113 (15% coverage)
- **Passing Tests**: 258 / 1505 total tests
- **Failing Test Suites**: 110 / 112 suites

### Gap Analysis
| Layer | Total Files | Tested | Coverage | Gap |
|-------|------------|--------|----------|-----|
| Hooks | ~200 | 1 | <1% | 199 |
| Components | 68 | 1 | 1.5% | 67 |
| Main Services | 46 | 2 | 4.3% | 44 |
| Renderer Services | 36 | 4 | 11.1% | 32 |
| Stores | 10 | 1 | 10% | 9 |
| Views | 112 | 112 | 100% | 0* |

*Views have tests but 98% are failing due to structural issues

## Comprehensive Testing Strategy

### 1. Test Pyramid Structure

```
        /\
       /  \      E2E Tests (5%)
      /    \     - Critical user journeys
     /------\    - 10-15 scenarios
    /        \
   /          \  Integration Tests (15%)
  /            \ - Multi-component workflows
 /              \- IPC communication
/----------------\
|                | Unit Tests (80%)
|                | - Hooks, Components, Services
|                | - Stores, Utilities
\________________/
```

### 2. Testing Layers

#### Layer 1: Unit Tests (Target: 80% of total tests)

##### A. Hook Tests
**Pattern**: Test each hook independently
- State management
- Side effects
- Event handlers
- IPC communication
- Data transformations
- Error handling

**Coverage Goal**: 100% of hooks (~200 hooks)

**Standard Template**:
```typescript
describe('useXxxLogic', () => {
  it('should initialize with default state')
  it('should handle data fetching')
  it('should handle errors')
  it('should cleanup on unmount')
  it('should filter/transform data')
  it('should export data')
})
```

##### B. Component Tests
**Pattern**: Test rendering, props, user interactions
- Render with various prop combinations
- User interactions (clicks, inputs, etc.)
- Accessibility
- Conditional rendering
- Error boundaries

**Coverage Goal**: 100% of components (68 components)

**Component Categories**:
- **Atoms** (11): Basic UI elements
- **Molecules** (16): Composite UI components
- **Organisms** (17): Complex components
- **Dialogs** (13): Modal dialogs
- **Layouts** (2): Page layouts

##### C. Service Tests
**Pattern**: Test business logic, transformations
- Function inputs/outputs
- Error handling
- Edge cases
- Async operations

**Coverage Goal**: 100% of services (82 services)

##### D. Store Tests
**Pattern**: Test state management
- Initial state
- Actions/mutations
- Selectors
- State persistence
- State synchronization

**Coverage Goal**: 100% of stores (10 stores)

#### Layer 2: Integration Tests (Target: 15% of total tests)

##### A. Multi-Component Integration
- View + Hooks + Store
- IPC communication flows
- Data fetching → display → export pipelines
- Form submission workflows

##### B. Service Integration
- Multiple services working together
- File system operations
- PowerShell execution flows
- Cache + Data loading

**Coverage Goal**: 50+ integration test suites

#### Layer 3: E2E Tests (Target: 5% of total tests)

##### A. Critical User Journeys
1. **Discovery Flow**
   - Launch app → Select discovery type → Run discovery → View results → Export
2. **Migration Flow**
   - Plan migration → Map resources → Validate → Execute → Monitor
3. **User Management**
   - View users → Filter → Sort → Export → Detail view
4. **Configuration**
   - Settings → Profile management → Credentials

**Coverage Goal**: 15-20 E2E scenarios

### 3. Test Infrastructure

#### A. Test Utilities (New/Enhanced)

```
src/test-utils/
├── setupTests.ts          # Global setup (exists, enhance)
├── testWrappers.tsx       # Render utilities (exists, enhance)
├── mockDataFactory.ts     # Mock data generators (NEW)
├── testHelpers.ts         # Common test helpers (NEW)
├── mockServices.ts        # Service mocks (NEW)
├── mockElectronAPI.ts     # Enhanced electron API mock (NEW)
├── testFixtures.ts        # Test data fixtures (NEW)
└── customMatchers.ts      # Custom Jest matchers (NEW)
```

#### B. Mock Data Factory Pattern

```typescript
// mockDataFactory.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  userPrincipalName: faker.internet.email(),
  displayName: faker.person.fullName(),
  department: faker.commerce.department(),
  ...overrides
});

export const createMockUsers = (count: number, overrides?: Partial<User>): User[] =>
  Array.from({ length: count }, () => createMockUser(overrides));
```

#### C. Test Generators

**Automated test generation for systematic coverage**:

```bash
# Generate hook tests
npm run test:generate:hooks

# Generate component tests
npm run test:generate:components

# Generate service tests
npm run test:generate:services
```

#### D. Enhanced Jest Configuration

```javascript
// jest.config.js updates
{
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/test-utils/**',
    '!src/**/*.stories.tsx'
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
}
```

### 4. Testing Standards & Patterns

#### A. Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx` (same directory as source)
- Test describe blocks: Use component/hook/service name
- Test cases: Use "should" format

#### B. AAA Pattern (Arrange-Act-Assert)
```typescript
it('should filter users by department', () => {
  // Arrange
  const users = createMockUsers(10);
  const { result } = renderHook(() => useUsersLogic());

  // Act
  act(() => {
    result.current.setFilter({ department: 'IT' });
  });

  // Assert
  expect(result.current.filteredUsers).toHaveLength(2);
});
```

#### C. Test Isolation
- Each test is independent
- No shared state between tests
- Proper cleanup in afterEach

#### D. Mock Management
- Mock at the boundary (IPC, file system, network)
- Don't mock internal business logic
- Use realistic mock data

### 5. Coverage Goals

| Phase | Timeline | Unit % | Integration % | E2E % | Total Coverage |
|-------|----------|--------|---------------|-------|----------------|
| Phase 1 | Week 1 | 40% | 10% | 0% | 35% |
| Phase 2 | Week 2 | 65% | 20% | 5% | 55% |
| Phase 3 | Week 3 | 85% | 30% | 10% | 75% |
| Phase 4 | Week 4 | 95% | 40% | 15% | 85% |
| **Target** | **Final** | **95%** | **50%** | **20%** | **90%+** |

### 6. Testing Tools & Libraries

#### Current Stack
- **Jest**: Unit/integration test runner
- **React Testing Library**: Component testing
- **@testing-library/react-hooks**: Hook testing
- **@testing-library/user-event**: User interaction simulation
- **Playwright**: E2E testing (configured, not implemented)

#### Additions Needed
- **@faker-js/faker**: Mock data generation
- **msw**: API mocking (if needed)
- **axe-core**: Accessibility testing
- **jest-axe**: A11y matchers
- **@testing-library/jest-dom**: Enhanced matchers (exists)

### 7. CI/CD Integration

#### Pre-commit Hooks
```json
{
  "pre-commit": [
    "test:changed",
    "lint"
  ],
  "pre-push": [
    "test:coverage"
  ]
}
```

#### CI Pipeline
```yaml
test:
  - unit-tests (parallel)
  - integration-tests
  - e2e-tests (critical only)
  - coverage-report
  - coverage-gate (85% minimum)
```

### 8. Implementation Plan

#### Phase 1: Infrastructure (Days 1-2)
1. Create mock data factories
2. Create test helpers and utilities
3. Enhance setupTests.ts
4. Create test generators
5. Update Jest configuration

#### Phase 2: Unit Tests - Core (Days 3-7)
1. Generate and implement hook tests (priority: discovery, migration)
2. Implement store tests
3. Implement service tests (critical services first)
4. Fix failing view tests

#### Phase 3: Unit Tests - Components (Days 8-10)
1. Test atoms
2. Test molecules
3. Test organisms
4. Test dialogs

#### Phase 4: Integration Tests (Days 11-13)
1. Discovery flow integration
2. Migration flow integration
3. IPC communication tests
4. Multi-store interactions

#### Phase 5: E2E Tests (Days 14-15)
1. Implement critical user journeys
2. Add smoke tests
3. Add regression test suite

#### Phase 6: Polish & Documentation (Days 16-17)
1. Achieve 90%+ coverage
2. Document testing patterns
3. Create testing guidelines
4. Set up coverage reporting

### 9. Maintenance & Governance

#### Test Ownership
- Each feature requires tests before merge
- PR reviews must include test review
- Coverage cannot decrease

#### Test Quality Metrics
- Coverage: >85% lines, branches, functions
- Performance: Test suite runs in <5 minutes
- Reliability: <1% flaky tests
- Maintainability: Tests updated with features

#### Documentation
- Testing guidelines in TESTING.md
- Pattern examples in test-utils/examples/
- Video tutorials for common patterns

### 10. Success Criteria

✅ **Coverage**: 90%+ code coverage across all layers
✅ **Quality**: All critical paths tested
✅ **Performance**: Test suite runs in <5 minutes
✅ **Reliability**: <1% flaky tests
✅ **CI/CD**: Automated testing in pipeline
✅ **Documentation**: Complete testing guide
✅ **Adoption**: All new features include tests
✅ **Maintainability**: Tests are readable and maintainable

## Appendix A: Test File Structure

```
guiv2/
├── src/
│   ├── renderer/
│   │   ├── hooks/
│   │   │   ├── useXxxLogic.ts
│   │   │   └── useXxxLogic.test.ts          # Hook test
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx         # Component test
│   │   ├── services/
│   │   │   ├── xxxService.ts
│   │   │   └── xxxService.test.ts          # Service test
│   │   ├── store/
│   │   │   ├── useXxxStore.ts
│   │   │   └── useXxxStore.test.ts         # Store test
│   │   └── views/
│   │       ├── XxxView.tsx
│   │       └── XxxView.test.tsx            # View test
│   ├── main/
│   │   └── services/
│   │       ├── xxxService.ts
│   │       └── xxxService.test.ts          # Main service test
│   └── test-utils/                         # Shared test utilities
├── tests/
│   ├── integration/                        # Integration tests
│   │   ├── discovery-flow.test.ts
│   │   └── migration-flow.test.ts
│   └── e2e/                               # E2E tests
│       ├── discovery.spec.ts
│       └── migration.spec.ts
└── coverage/                              # Coverage reports
```

## Appendix B: Quick Reference

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific file
npm test -- useXxxLogic.test.ts

# E2E tests
npm run test:e2e

# Integration tests
npm test -- tests/integration
```

### Generating Tests
```bash
# Generate hook test
npm run test:generate -- --type hook --name useXxxLogic

# Generate component test
npm run test:generate -- --type component --name Button

# Generate service test
npm run test:generate -- --type service --name xxxService
```

### Coverage Reports
- HTML: `coverage/lcov-report/index.html`
- JSON: `coverage/coverage-summary.json`
- LCOV: `coverage/lcov.info`

---

**Document Version**: 1.0
**Last Updated**: 2025-10-17
**Owner**: Development Team
