# PowerShell Verb Remediation Plan for M&A Discovery Suite

## Summary
Found 29 functions with unapproved verbs across 10 modules that need to be updated to use approved PowerShell verbs.

## ✅ COMPLETED MODULES
- **Authentication.psm1** - Fixed `Refresh-AuthenticationTokens` → `Update-AuthenticationTokens`
- **Logging.psm1** - Fixed 3 functions: `Should-LogMessage` → `Test-LogMessage`, `Rotate-LogFile` → `Move-LogFile`, `Cleanup-OldLogFiles` → `Clear-OldLogFiles`
- **EnhancedLogging.psm1** - Fixed 3 functions: `Should-LogMessage` → `Test-LogMessage`, `Rotate-LogFile` → `Move-LogFile`, `Cleanup-OldLogFiles` → `Clear-OldLogFiles`

**Status**: 3 of 10 modules completed (7 functions fixed)

## Verb Mapping Strategy

| Unapproved Verb | Approved Alternative | Rationale |
|-----------------|---------------------|-----------|
| `Parse-` | `ConvertFrom-` | Standard for parsing/converting data |
| `Create-` | `New-` | Standard for creating new objects |
| `Generate-` | `New-` | Standard for generating/creating content |
| `Build-` | `New-` | Standard for building/creating objects |
| `Analyze-` | `Test-` | Standard for analysis/testing operations |
| `Assess-` | `Test-` | Standard for assessment/evaluation |
| `Calculate-` | `Measure-` | Standard for calculations/measurements |
| `Should-` | `Test-` | Standard for conditional checks |
| `Rotate-` | `Move-` | Standard for moving/rotating files |
| `Cleanup-` | `Clear-` | Standard for cleanup operations |
| `Clean-` | `Clear-` | Standard for cleaning operations |
| `Secure-` | `Protect-` | Standard for security operations |
| `Rebalance-` | `Update-` | Standard for rebalancing/updating |

## Functions to Update

### EnhancedGPODiscovery.psm1
- `Parse-GPOXMLReportEnhanced` → `ConvertFrom-GPOXMLReportEnhanced`
- `Create-MinimalGPOXML` → `New-MinimalGPOXML`

### GPODiscovery.psm1
- `Parse-GPOXMLReport` → `ConvertFrom-GPOXMLReport`

### CSVExport.psm1
- `Generate-SummaryStatistics` → `New-SummaryStatistics`

### JSONExport.psm1
- `Create-ComprehensiveSummary` → `New-ComprehensiveSummary`
- `Generate-MigrationRecommendations` → `New-MigrationRecommendations`

### DataAggregation.psm1
- `Create-CorrelationMappings` → `New-CorrelationMappings`

### DataValidation.psm1
- `Generate-QualityReport` → `New-QualityReport`

### UserProfileBuilder.psm1
- `Build-UserProfiles` → `New-UserProfiles`
- `Build-IndividualUserProfile` → `New-IndividualUserProfile`
- `Analyze-UserComplexity` → `Test-UserComplexity`
- `Assess-MigrationReadiness` → `Test-MigrationReadiness`
- `Calculate-ComplexityScores` → `Measure-ComplexityScores`
- `Calculate-MigrationComplexity` → `Measure-MigrationComplexity`

### WaveGeneration.psm1
- `Generate-MigrationWaves` → `New-MigrationWaves`
- `Generate-WavesByDepartment` → `New-WavesByDepartment`
- `Generate-WavesByComplexity` → `New-WavesByComplexity`
- `Create-MigrationWave` → `New-MigrationWave`
- `Rebalance-Waves` → `Update-Waves`
- `Generate-WaveSummary` → `New-WaveSummary`

### EnhancedLogging.psm1
- `Should-LogMessage` → `Test-LogMessage`
- `Rotate-LogFile` → `Move-LogFile`
- `Cleanup-OldLogFiles` → `Clear-OldLogFiles`

### FileOperations.psm1
- `Clean-OldFiles` → `Clear-OldFiles`
- `Secure-DeleteFile` → `Protect-DeleteFile`

### Logging.psm1
- `Should-LogMessage` → `Test-LogMessage`
- `Rotate-LogFile` → `Move-LogFile`
- `Cleanup-OldLogFiles` → `Clear-OldLogFiles`

### ProgressTracking.psm1
- `Cleanup-TempFiles` → `Clear-TempFiles`

## Implementation Order
1. Start with utility modules (Logging, FileOperations, ProgressTracking)
2. Move to processing modules (DataValidation, DataAggregation, UserProfileBuilder)
3. Handle export modules (CSVExport, JSONExport)
4. Update discovery modules (GPODiscovery, EnhancedGPODiscovery)
5. Finish with wave generation module

## Testing Strategy
After each module update:
1. Test module import with `Import-Module -Force -Verbose`
2. Run validation script to ensure no breaking changes
3. Search for any remaining function calls that need updating