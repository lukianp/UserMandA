# Version: 1.0.0
# Author: Lukian Poleschtschuk
# Date Modified: 2025-09-16
# PowerShell script to add #pragma warning disable CS0618 to C# files containing SimpleServiceLocator

$files = @(
    "GUI\App.xaml.cs",
    "GUI\Behaviors\DataGridColumnCustomizationBehavior.cs",
    "GUI\Controls\FilterableDataGrid.xaml.cs",
    "GUI\Extensions\DetailWindowExtensions.cs",
    "GUI\MandADiscoverySuite.xaml.cs",
    "GUI\ViewModels\CommandPaletteViewModel.cs",
    "GUI\ViewModels\CreateProfileDialogViewModel.cs",
    "GUI\ViewModels\DataExportManagerViewModel.cs",
    "GUI\ViewModels\ExchangeMigrationPlanningViewModelSimple.cs",
    "GUI\ViewModels\FilterPresetManagerViewModel.cs",
    "GUI\ViewModels\KeyboardShortcutsViewModel.cs",
    "GUI\ViewModels\MainViewModel.cs",
    "GUI\ViewModels\ManagementViewModel.cs",
    "GUI\ViewModels\MigrateViewModel.cs",
    "GUI\ViewModels\MigrationExecutionViewModel.cs",
    "GUI\ViewModels\OneDriveMigrationPlanningViewModel.cs",
    "GUI\ViewModels\ReportBuilderViewModel.cs",
    "GUI\ViewModels\ReportsViewModel.cs",
    "GUI\ViewModels\RiskAnalysisViewModel.cs",
    "GUI\ViewModels\SecurityPolicyViewModel.cs",
    "GUI\ViewModels\SharePointMigrationPlanningViewModel.cs",
    "GUI\ViewModels\ThemeToggleButtonViewModel.cs",
    "GUI\ViewModels\Widgets\SystemOverviewWidget.cs",
    "GUI\Views\ApplicationInventoryView.xaml.cs",
    "GUI\Views\InfrastructureAssetsView.xaml.cs",
    "GUI\Views\LogsAuditView.xaml.cs",
    "GUI\Views\ReportsView.xaml.cs",
    "GUI\Views\SecurityGroupsView.xaml.cs"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "SimpleServiceLocator" -and $content -notmatch "#pragma warning disable CS0618") {
            # Find the namespace line and insert pragma before it
            $lines = Get-Content $file
            $namespaceIndex = $lines | Select-String -Pattern "^namespace" | Select-Object -First 1 -ExpandProperty LineNumber
            if ($namespaceIndex -gt 0) {
                $pragmaLine = "#pragma warning disable CS0618 // SimpleServiceLocator is obsolete"
                $lines = $lines[0..($namespaceIndex-2)] + $pragmaLine + $lines[($namespaceIndex-1)..($lines.Length-1)]
                $lines | Set-Content $file
                Write-Host "Added pragma to $file"
            }
        }
    }
}

Write-Host "Script completed"