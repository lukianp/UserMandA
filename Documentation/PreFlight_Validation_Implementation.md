# Pre-flight Validation Implementation

## Overview

The M&A Discovery Suite now includes comprehensive pre-flight validation to ensure the environment meets all prerequisites before attempting to run discovery operations. This validation checks critical system requirements and provides clear guidance when issues are detected.

## Implementation Details

### Components Added

1. **Enhanced Validation Script**: [`Scripts/Validate-Installation.ps1`](../Scripts/Validate-Installation.ps1)
   - Added `Test-SuitePrerequisites` function
   - Integrated into main validation flow as the first check
   - Provides detailed feedback and recommendations

2. **Standalone Pre-flight Module**: [`Modules/Utilities/PreFlightValidation.psm1`](../Modules/Utilities/PreFlightValidation.psm1)
   - Reusable module for pre-flight validation
   - Supports quiet mode and programmatic access
   - Provides structured results for automation

3. **Standalone Pre-flight Script**: [`Scripts/Test-PreFlightValidation.ps1`](../Scripts/Test-PreFlightValidation.ps1)
   - Independent script that can run without full suite setup
   - Includes fallback validation if module is unavailable
   - Supports command-line parameters for automation

4. **QuickStart Integration**: [`QuickStart.ps1`](../QuickStart.ps1)
   - Runs pre-flight validation before environment initialization
   - Provides early warning of potential issues
   - Continues with warnings rather than failing completely

## Validation Checks

### 1. PowerShell Version Check
- **Requirement**: PowerShell 5.1 or higher
- **Action**: Throws exception if requirement not met (critical failure)
- **Recommendation**: Upgrade to PowerShell 5.1 or higher

### 2. Execution Policy Check
- **Requirement**: Execution policy not set to 'Restricted'
- **Action**: Warns if restricted but continues execution
- **Recommendation**: Set execution policy to RemoteSigned or Bypass
- **Command**: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### 3. Administrator Rights Check
- **Requirement**: Administrator privileges (recommended, not required)
- **Action**: Informational check, warns if not running as admin
- **Recommendation**: Consider running as administrator if issues occur

## Usage Examples

### Standalone Pre-flight Validation
```powershell
# Run with full output
.\Scripts\Test-PreFlightValidation.ps1

# Run in quiet mode (for automation)
.\Scripts\Test-PreFlightValidation.ps1 -Quiet

# Run with exception on failure
.\Scripts\Test-PreFlightValidation.ps1 -ThrowOnFailure
```

### Using the Module
```powershell
# Import the module
Import-Module .\Modules\Utilities\PreFlightValidation.psm1

# Run validation
$isReady = Test-SuitePrerequisites

# Run quietly
$isReady = Test-SuitePrerequisites -Quiet

# Access detailed results
$result = Test-SuitePrerequisites
$validationResults = $PSCmdlet.ValidationResults
```

### Integration in Scripts
```powershell
# Quick check before operations
if (-not (Test-SuitePrerequisites -Quiet)) {
    Write-Warning "Prerequisites not met. Run Test-PreFlightValidation.ps1 for details."
    exit 1
}
```

## Integration Points

### 1. QuickStart.ps1
- Runs pre-flight validation immediately after determining suite root
- Uses quiet mode to avoid verbose output during normal operations
- Provides warnings but continues execution to allow for manual intervention

### 2. Validate-Installation.ps1
- Runs `Test-SuitePrerequisites` as the first validation step
- Integrates with existing validation framework
- Uses consistent output formatting and error handling

### 3. Future Integration Opportunities
- **Orchestrator**: Could run pre-flight check before starting discovery
- **Module Loading**: Individual modules could verify prerequisites
- **CI/CD**: Automated testing can use quiet mode for validation

## Exit Codes

The standalone script uses standard exit codes:
- **0**: All prerequisites met successfully
- **1**: Some prerequisites failed (warnings)
- **2**: Critical error (module import failure, etc.)

## Error Handling

### Critical Failures
- PowerShell version below 5.1 → Throws exception
- Module import failures → Returns error code 2

### Warnings
- Restricted execution policy → Warns but continues
- Not running as administrator → Informational note

### Graceful Degradation
- If PreFlightValidation module unavailable → Falls back to inline validation
- If Test-PreFlightValidation.ps1 unavailable → QuickStart runs basic checks

## Benefits

1. **Early Problem Detection**: Identifies issues before they cause failures
2. **Clear Guidance**: Provides specific recommendations for resolving issues
3. **Automation Friendly**: Supports quiet mode and exit codes for scripting
4. **Flexible Integration**: Can be used standalone or integrated into workflows
5. **Consistent Experience**: Standardized validation across all entry points

## Future Enhancements

1. **Additional Checks**: Could be extended to check:
   - Required PowerShell modules availability
   - Network connectivity to critical endpoints
   - Disk space requirements
   - Memory requirements

2. **Configuration-Based Validation**: Could read requirements from configuration files

3. **Remediation Actions**: Could automatically fix common issues (with user consent)

4. **Detailed Reporting**: Could generate detailed validation reports for compliance

## Testing

The implementation has been tested with:
- PowerShell 5.1 on Windows Server 2019
- Various execution policy settings
- Both administrator and non-administrator contexts
- Quiet and verbose modes
- Integration with existing validation framework

All tests pass successfully and the validation provides appropriate feedback for each scenario.