# ADR-032: Post-Migration Validation and Rollback Architecture

## Status
**ACCEPTED** - August 28, 2025

## Context

The M&A Discovery Suite requires comprehensive post-migration validation capabilities to ensure migration success and provide rollback mechanisms when issues are detected. The system must validate multiple object types (Users, Mailboxes, Files, Databases) across different target environments while maintaining high performance and reliability.

### Business Requirements
- Validate migration success across all supported object types
- Provide detailed issue reporting with actionable recommendations
- Enable safe rollback operations when validation fails
- Support both individual object and bulk wave validation
- Maintain audit trail for compliance requirements
- Integrate seamlessly with existing migration workflows

### Technical Constraints
- Must integrate with existing Logic Engine Service architecture
- Should leverage Microsoft Graph API for Microsoft 365 validations
- Must support asynchronous operations to maintain UI responsiveness
- Should follow established MVVM patterns for UI integration
- Must handle network failures and API throttling gracefully
- Should support future extension to additional object types

## Decision

We have decided to implement a **Provider Pattern-based Validation Architecture** with the following key components:

### 1. Service Layer Architecture

#### PostMigrationValidationService (Orchestrator)
- **Role**: Central orchestration of validation operations across object types
- **Responsibilities**: 
  - Coordinate validation across multiple providers
  - Aggregate validation results and progress reporting
  - Handle wave-level validation operations
  - Provide unified rollback coordination
- **Pattern**: Facade pattern providing simplified interface to complex validation subsystem

#### Validation Provider Pattern
```csharp
public interface IValidationProvider
{
    string ObjectType { get; }
    bool SupportsRollback { get; }
}

public interface IUserValidationProvider : IValidationProvider
{
    Task<ValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null);
    Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null);
}
```

**Rationale**: Strategy pattern enables clean separation of validation logic by object type, supports easy extension for new object types, and maintains single responsibility principle.

### 2. Data Model Design

#### ValidationResult Structure
```csharp
public class ValidationResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public object ValidatedObject { get; set; } = new();
    public string ObjectType { get; set; } = string.Empty;
    public string ObjectName { get; set; } = string.Empty;
    public ValidationSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<ValidationIssue> Issues { get; } = new();
    public DateTime ValidatedAt { get; set; } = DateTime.Now;
    public bool CanRollback { get; set; } = true;
    public bool RollbackInProgress { get; set; }
}
```

**Rationale**: Rich data structure provides comprehensive validation context, supports UI binding requirements, enables audit trail maintenance, and supports complex issue categorization.

#### Severity Classification
- **Success**: Validation passed completely
- **Warning**: Minor issues that don't impact core functionality
- **Error**: Significant issues that impact functionality but aren't system-critical
- **Critical**: Severe issues requiring immediate attention and likely rollback

**Rationale**: Four-level severity system provides granular issue classification enabling appropriate automated and manual responses.

### 3. Rollback Strategy

#### Non-Destructive Rollback Philosophy
- **Users**: Disable accounts rather than delete to prevent data loss
- **Mailboxes**: Cancel migration requests and revert DNS changes
- **Files**: Remove target copies while preserving source files
- **Databases**: DROP target database (destructive but with confirmation)

**Rationale**: Minimizes irreversible operations while providing effective rollback capabilities. Database rollback is necessarily destructive but includes confirmation safeguards.

#### Rollback Result Tracking
```csharp
public class RollbackResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; } = new();
    public List<string> Warnings { get; } = new();
    public DateTime RolledBackAt { get; set; } = DateTime.Now;
}
```

**Rationale**: Comprehensive rollback outcome tracking supports audit requirements and troubleshooting.

### 4. Integration Architecture

#### Optional Integration with Migration Service
```csharp
public class MigrationService
{
    private readonly PostMigrationValidationService? _validationService;
    
    public async Task<MigrationWithValidationResult> MigrateAndValidateWaveAsync(MigrationWave wave, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
    {
        var migrationResults = await MigrateWaveAsync(wave, settings, target, progress);
        
        IList<ValidationResult>? validationResults = null;
        if (_validationService != null)
        {
            validationResults = await _validationService.ValidateWaveAsync(wave, target, progress);
        }
        
        return new MigrationWithValidationResult
        {
            MigrationResults = migrationResults,
            ValidationResults = validationResults ?? new List<ValidationResult>()
        };
    }
}
```

**Rationale**: Optional integration preserves backward compatibility while enabling enhanced workflow for validation-aware migrations.

## Alternatives Considered

### 1. Monolithic Validation Service
**Approach**: Single large service handling all validation types internally
**Rejected Because**:
- Violates single responsibility principle
- Difficult to test individual validation logic
- Hard to extend for new object types
- Creates tight coupling between different validation mechanisms

### 2. Event-Driven Validation Architecture  
**Approach**: Publish migration events, consume via validation handlers
**Rejected Because**:
- Adds complexity with event infrastructure
- Makes error handling more complex
- Harder to implement synchronous validation workflows
- Complicates progress reporting and cancellation

### 3. External Validation Service
**Approach**: Separate microservice for validation operations
**Rejected Because**:
- Adds deployment complexity
- Network calls increase latency
- Complicates error handling and retry logic
- Over-engineering for current requirements

### 4. Database-First Validation Storage
**Approach**: Store all validation results in persistent database
**Rejected Because**:
- Adds database dependencies
- Session-based validation results are sufficient
- Increases complexity without clear benefit
- May impact performance for large validation sets

## Consequences

### Positive Consequences

#### ✅ Maintainability
- **Provider Pattern**: Clean separation enables focused testing and maintenance
- **Interface Abstraction**: Easy to mock for unit testing
- **Single Responsibility**: Each provider handles one object type completely
- **Extension Support**: New object types require minimal changes to existing code

#### ✅ Performance  
- **Async Operations**: Non-blocking validation preserves UI responsiveness
- **Concurrent Execution**: Multiple objects validated in parallel
- **Progress Reporting**: Real-time progress updates improve user experience
- **Resource Efficiency**: Minimal memory footprint with streaming results

#### ✅ Reliability
- **Comprehensive Error Handling**: Graceful degradation when services unavailable
- **Retry Logic**: Built-in retry mechanisms for transient failures
- **Safe Rollback**: Non-destructive operations minimize data loss risk
- **Audit Trail**: Complete operation logging for troubleshooting

#### ✅ User Experience
- **Rich UI Integration**: Modern WPF interface with filtering and search
- **Clear Issue Reporting**: Categorized issues with resolution guidance  
- **Progress Visibility**: Real-time validation progress with cancellation
- **Actionable Results**: Direct rollback operations from validation results

### Negative Consequences

#### ⚠️ Complexity
- **Multiple Services**: Requires coordination between several service classes
- **Configuration**: Graph API and service principal setup complexity
- **Error Propagation**: Error handling across multiple provider layers
- **Testing**: Comprehensive testing requires multiple mock providers

#### ⚠️ Dependencies
- **Microsoft Graph**: Strong dependency on Graph API for Microsoft 365 validation
- **Network Connectivity**: Requires network access to all target environments
- **Service Accounts**: Requires proper service principal configuration
- **Version Compatibility**: Graph API version dependencies

#### ⚠️ Performance Limitations
- **API Throttling**: Microsoft Graph throttling may slow large validations
- **Network Latency**: Remote validation operations subject to network delays
- **Concurrent Limits**: Semaphore limits prevent excessive concurrent operations
- **Memory Usage**: Large validation result sets may consume significant memory

## Implementation Details

### Service Registration (Dependency Injection)
```csharp
services.AddSingleton<PostMigrationValidationService>();
services.AddSingleton<IUserValidationProvider, UserValidationProvider>();  
services.AddSingleton<IMailboxValidationProvider, MailboxValidationProvider>();
services.AddSingleton<IFileValidationProvider, FileValidationProvider>();
services.AddSingleton<ISqlValidationProvider, SqlValidationProvider>();
```

### Configuration Requirements
```json
{
  "GraphApi": {
    "TenantId": "target-tenant-id",
    "ClientId": "service-principal-client-id", 
    "RequiredScopes": ["User.Read.All", "User.ReadWrite.All", "Group.Read.All", "Mail.Read"]
  },
  "Validation": {
    "TimeoutSeconds": 30,
    "MaxConcurrentOperations": 3,
    "RetryAttempts": 3
  }
}
```

### Error Handling Pattern
```csharp
try 
{
    var result = await validationProvider.ValidateAsync(obj, target, progress);
    return result;
}
catch (ServiceException ex)
{
    var issue = new ValidationIssue
    {
        Severity = ValidationSeverity.Critical,
        Category = "Service Error", 
        Description = ex.Error.Message,
        RecommendedAction = "Check service configuration and permissions",
        TechnicalDetails = ex.ToString()
    };
    return ValidationResult.Failed(obj, objectType, objectName, "Validation failed", new[] { issue });
}
```

## Monitoring and Observability

### Key Metrics
- **Validation Success Rate**: Percentage of objects passing validation
- **Validation Duration**: Time required for validation operations
- **Rollback Frequency**: Rate of rollback operations performed
- **API Error Rate**: Frequency of API-related validation failures
- **User Action Distribution**: Success/Warning/Error/Critical response patterns

### Logging Requirements
- **Validation Start/Complete**: Log all validation operations with duration
- **Issue Detection**: Log all validation issues with severity and category
- **Rollback Operations**: Log all rollback attempts with success/failure status
- **API Errors**: Log Graph API and other service errors with context
- **Performance Metrics**: Log validation timing for performance monitoring

### Alerting Criteria
- **Critical Validation Failures**: > 5% critical issues detected
- **High Rollback Rate**: > 10% of objects requiring rollback
- **API Error Rate**: > 2% API call failures
- **Performance Degradation**: Validation time > 2x baseline
- **Service Availability**: Graph API or validation service unavailability

## Future Evolution

### Planned Enhancements
1. **Caching Layer**: Cache validation results for recently validated objects
2. **Batch API Calls**: Optimize Graph API usage with batch operations  
3. **Cancellation Support**: Add CancellationToken support throughout
4. **Configuration UI**: Admin interface for validation threshold configuration
5. **Custom Validators**: Plugin system for organization-specific validation rules

### Extension Points
1. **New Object Types**: Additional validation providers for SharePoint, Teams, etc.
2. **Custom Actions**: Pluggable remediation actions beyond basic rollback
3. **External Integrations**: Webhook notifications, ITSM system integration
4. **Advanced Analytics**: Machine learning-based issue prediction
5. **Multi-Tenant Support**: Validation across multiple target tenants

### Breaking Changes (Future)
- **Interface Evolution**: May add methods to IValidationProvider interfaces
- **Data Model Changes**: ValidationResult may gain additional properties
- **Configuration Changes**: May require additional Graph API permissions
- **Dependency Updates**: Microsoft Graph SDK updates may affect implementations

## References

### Documentation
- [Post-Migration Validation User Guide](post-migration-validation.md)
- [Validation Decision Guide](validation-decision-guide.md)  
- [Architecture Quality Review](T032_ARCHITECTURE_QUALITY_REVIEW.md)

### Related ADRs
- [ADR-027: Migration Engine Architecture](ADR-027-MIGRATION-ENGINE.md)
- [ADR-031: Pre-Migration Check Architecture](ADR-031-PRE-MIGRATION-CHECK-ARCHITECTURE.md)
- [ADR-030: Async Data Loading Cache Architecture](ADR-030-ASYNC-DATA-LOADING-CACHE-ARCHITECTURE.md)

### External Standards
- [Microsoft Graph Best Practices](https://docs.microsoft.com/en-us/graph/best-practices-concept)
- [.NET Async Programming Patterns](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)

---

## Decision Record Metadata

- **ADR Number**: 032
- **Title**: Post-Migration Validation and Rollback Architecture  
- **Status**: ACCEPTED
- **Date**: August 28, 2025
- **Authors**: Architecture Lead, GUI Module Executor, Documentation & QA Guardian
- **Reviewers**: Master Orchestrator, Build Verifier Integrator, Test Data Validator
- **Supersedes**: None
- **Superseded By**: None (Current)

---

*This ADR documents the architectural decisions for T-032 Post-Migration Validation and Rollback Implementation. It serves as the authoritative record of design rationale and implementation guidance for future development and maintenance.*