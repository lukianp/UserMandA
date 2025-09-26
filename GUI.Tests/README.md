# M&A Discovery Suite - GUI Tests

## Overview

This comprehensive test suite provides robust testing coverage for the M&A Discovery Suite GUI application. The tests are organized into multiple categories to ensure thorough validation of functionality, performance, and reliability.

## Test Categories

### 1. Unit Tests (`ViewModels/`, `Services/`)

**Purpose**: Test individual components in isolation
**Coverage**: Business logic, property change notifications, command execution
**Framework**: MSTest with Moq for mocking

#### Key Test Files:
- `BaseViewModelTests.cs` - Core ViewModel functionality
- `DataExportServiceTests.cs` - Data export operations
- `LogicEngineServiceTests.cs` - Data processing logic

### 2. Integration Tests (`Integration/`)

**Purpose**: Test interactions between components
**Coverage**: ViewModel-Service interactions, data flow, error handling
**Framework**: MSTest with real dependencies where appropriate

#### Key Test Files:
- `ViewModelServiceIntegrationTests.cs` - End-to-end component interactions

### 3. Performance Tests (`Performance/`)

**Purpose**: Ensure application performs well under load
**Coverage**: Large dataset handling, memory usage, async operations
**Framework**: MSTest with timing assertions

#### Key Test Files:
- `PerformanceTests.cs` - Performance benchmarking and optimization validation

### 4. Edge Case Tests (`EdgeCases/`)

**Purpose**: Test boundary conditions and error scenarios
**Coverage**: Null values, extreme inputs, special characters, Unicode
**Framework**: MSTest with edge case data generation

#### Key Test Files:
- `EdgeCaseTests.cs` - Comprehensive edge case validation

## Test Execution

### Running All Tests

```powershell
# Run all test categories
.\Run-AllTests.ps1

# Run with verbose output
.\Run-AllTests.ps1 -Verbose

# Run with code coverage
.\Run-AllTests.ps1 -Coverage

# Run specific category
.\Run-AllTests.ps1 -Filter Unit
.\Run-AllTests.ps1 -Filter Integration
.\Run-AllTests.ps1 -Filter Performance
.\Run-AllTests.ps1 -Filter EdgeCases
```

### Running Tests with dotnet CLI

```bash
# Run all tests
dotnet test

# Run specific test category
dotnet test --filter "FullyQualifiedName~GUI.Tests.ViewModels"

# Run with coverage
dotnet test --collect "Code Coverage"

# Run with detailed output
dotnet test --verbosity detailed
```

## Test Coverage Goals

### Minimum Coverage Targets:
- **ViewModels**: 85% coverage
- **Services**: 90% coverage
- **Models**: 95% coverage
- **Overall**: 80% minimum

### Coverage Exclusions:
- Generated code (`.g.cs` files)
- Third-party libraries
- Test assemblies
- Compiler-generated code

## Test Best Practices

### 1. Test Organization
- **Arrange-Act-Assert** pattern
- **One assertion per test method**
- **Descriptive test method names**
- **Comprehensive test data**

### 2. Mocking Strategy
- **Mock external dependencies**
- **Use interfaces for testability**
- **Avoid over-mocking**
- **Focus on behavior verification**

### 3. Async Testing
- **Use `async/await` properly**
- **Test both success and failure paths**
- **Handle concurrency correctly**
- **Use appropriate timeouts**

### 4. Data Management
- **Use test-specific data**
- **Clean up test artifacts**
- **Avoid shared state**
- **Use realistic test data**

## Test Data Strategy

### 1. Test Data Generation
- **Realistic datasets** for performance testing
- **Edge case data** for boundary testing
- **Invalid data** for error path testing
- **Large datasets** for scalability testing

### 2. Test Data Sources
- **Embedded test files** for static data
- **Generated data** for dynamic scenarios
- **Mock data services** for isolated testing
- **Real data samples** for integration testing

## Continuous Integration

### CI/CD Integration:
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    dotnet restore
    dotnet build --configuration Release
    dotnet test --configuration Release --collect "Code Coverage"

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./GUI.Tests/TestResults/coverage.coverage
```

### Quality Gates:
- **Minimum coverage**: 80%
- **Zero failing tests** in main branch
- **Performance benchmarks** must pass
- **Security tests** must pass

## Troubleshooting

### Common Issues:

#### 1. Test Discovery Issues
```bash
# Clear test cache
dotnet test --filter "FullyQualifiedName~GUI" --verbosity detailed
```

#### 2. Coverage Issues
- Ensure `CodeCoverage.runsettings` is properly configured
- Check assembly paths in coverage settings
- Verify exclusions don't exclude important code

#### 3. Performance Test Timeouts
- Increase timeout values for slow operations
- Optimize test data size for CI environments
- Use appropriate assertions for performance tests

#### 4. Integration Test Failures
- Ensure test dependencies are available
- Check test isolation
- Verify mock configurations

## Extending the Test Suite

### Adding New Tests:

1. **Create test class** in appropriate directory
2. **Inherit from base test class** if applicable
3. **Follow naming conventions**:
   - `[Component]Tests.cs` for unit tests
   - `[Component]IntegrationTests.cs` for integration tests
   - `[Component]PerformanceTests.cs` for performance tests

4. **Add test methods** with descriptive names
5. **Update run settings** if needed
6. **Update this documentation**

### Example Test Method:
```csharp
[TestMethod]
public async Task ExportService_WithValidData_CreatesFile()
{
    // Arrange
    var testData = CreateTestData();
    var service = CreateService();

    // Act
    var result = await service.ExportAsync(testData, "test.csv");

    // Assert
    Assert.IsTrue(result.Success);
    Assert.IsTrue(File.Exists("test.csv"));
}
```

## Architecture Validation

The test suite validates the following architectural patterns:

### MVVM Pattern:
- ViewModel independence from UI
- Proper property change notifications
- Command pattern implementation
- Service layer abstraction

### Service Layer:
- Dependency injection compatibility
- Error handling strategies
- Async operation patterns
- Resource management

### Data Layer:
- Data export/import functionality
- Data validation and sanitization
- Large dataset handling
- Unicode and special character support

## Performance Benchmarks

### Current Benchmarks:
- **Large dataset export**: < 10 seconds for 10k records
- **Property notifications**: < 5 seconds for 1000 rapid changes
- **Memory usage**: < 50KB per ViewModel with 100 items
- **Async operations**: < 3 seconds for 1000 concurrent operations

### Monitoring:
- Regular benchmark updates
- Performance regression detection
- Memory leak identification
- UI responsiveness validation

## Security Testing

The test suite includes validation for:

- **Input sanitization**
- **XSS prevention** in data export
- **Path traversal protection**
- **Resource access control**
- **Error message safety**

## Accessibility Testing

Future enhancements include:

- **Screen reader compatibility**
- **Keyboard navigation**
- **High contrast mode support**
- **Focus management**

## Maintenance

### Regular Tasks:
- **Update test data** to match schema changes
- **Review and update** performance benchmarks
- **Add tests** for new features
- **Remove obsolete** tests
- **Update documentation** as needed

### Code Quality:
- **Regular code reviews** of test code
- **Test refactoring** for maintainability
- **Documentation updates**
- **Performance optimization**

---

## Contact

For questions about the test suite or to contribute tests, please refer to the development team documentation or contact the testing lead.