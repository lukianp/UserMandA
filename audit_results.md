# Discovery UI Audit Results

## Summary of Findings

This audit examined the discovery UI components in the GUI/ directory, focusing on "View Details" functionality implementation and false-positive red banner issues.

## View Details Implementation Status

| Discovery Module | View Details Implemented | Notes |
|------------------|-------------------------|-------|
| ActiveDirectoryDiscoveryView | No | Uses side-panel details on selection |
| AWSCloudInfrastructureDiscoveryView | No | Uses side-panel details on selection |
| AzureDiscoveryView | No | Uses side-panel details on selection |
| AzureInfrastructureDiscoveryView | No | Uses side-panel details on selection |
| ConditionalAccessPoliciesDiscoveryView | No | Uses side-panel details on selection |
| ExchangeDiscoveryView | No | Uses side-panel details on selection |
| MicrosoftTeamsDiscoveryView | No | Uses side-panel details on selection |
| NetworkInfrastructureDiscoveryView | No | Uses side-panel details on selection |
| OneDriveBusinessDiscoveryView | No | Uses side-panel details on selection |
| PhysicalServerDiscoveryView | No | Uses side-panel details on selection |
| PowerBIDiscoveryView | No | Uses side-panel details on selection |
| SharePointDiscoveryView | No | Uses side-panel details on selection |
| VMwareDiscoveryView | No | Uses side-panel details on selection |

## False-Positive Red Banner Issues

### Affected ViewModels

The following discovery ViewModels incorrectly set `HasErrors = true` and `ErrorMessage` from `HeaderWarnings`, causing warnings to display as red error banners:

- ActiveDirectoryDiscoveryViewModel.cs (lines 150-152)
- AWSCloudInfrastructureDiscoveryViewModel.cs (lines 218-220)
- AzureInfrastructureDiscoveryViewModel.cs (lines 131-133)
- ConditionalAccessPoliciesDiscoveryViewModel.cs (lines 171-173)
- DataLossPreventionDiscoveryViewModel.cs (lines 85-87)
- EnvironmentDetectionViewModel.cs (lines 152-154)
- EnvironmentRiskAssessmentViewModel.cs (lines 92-94)
- FileServerDiscoveryViewModel.cs (lines 146-148)
- OneDriveBusinessDiscoveryViewModel.cs (lines 168-170)
- PowerBIDiscoveryViewModel.cs (lines 157-159)
- SharePointDiscoveryViewModel.cs (lines 143-145)
- SQLServerDiscoveryViewModel.cs (lines 227-229)
- VMwareDiscoveryViewModel.cs (lines 145-147)
- WebServerConfigurationDiscoveryViewModel.cs (lines 76-78)

### Exception

NetworkInfrastructureDiscoveryViewModel.cs correctly handles warnings without setting `HasErrors` (lines 160-162 comment).

### Impact

This causes non-critical CSV header warnings (e.g., missing optional columns) to appear as red error banners instead of yellow/orange warning banners, creating false-positive error states in the UI.

## Key Findings

1. **No "View Details" Buttons**: None of the discovery views have implemented "View Details" buttons in their DataGrid. All rely on selection-based side-panel details.

2. **Inconsistent Warning Handling**: Most discovery ViewModels treat header warnings as errors, while some handle them appropriately as warnings.

3. **Pattern of Implementation**: Discovery views follow a consistent pattern with toolbar buttons, summary cards, warning banners, error banners, and side-panel details.

4. **Proper Implementation Example**: NetworkInfrastructureDiscoveryViewModel demonstrates correct handling of warnings vs errors.

## Recommendations

1. Implement "View Details" buttons in discovery DataGrids for consistent UX
2. Fix false-positive red banners by separating warning and error handling
3. Standardize the warning banner implementation across all discovery ViewModels
4. Consider yellow/orange styling for warning banners vs red for errors