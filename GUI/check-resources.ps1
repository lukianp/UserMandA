# Check all resource files referenced in App.xaml
$basePath = "D:\Scripts\UserMandA\GUI"

Write-Host "========================================="
Write-Host "Checking Resource Files"
Write-Host "========================================="

$resources = @(
    "Resources\Converters.xaml",
    "Resources\Converters\Converters.xaml",
    "Resources\Templates\DataTemplates.xaml",
    "Resources\Styles\MainStyles.xaml",
    "Themes\Colors.xaml",
    "Themes\OptimizedResources.xaml",
    "Themes\OptimizedAnimations.xaml",
    "Themes\OptimizedGridLayouts.xaml",
    "Themes\ThemeStyles.xaml",
    "Themes\FluentDesign.xaml",
    "Themes\RefinedColorPalette.xaml",
    "Themes\SpacingSystem.xaml",
    "Themes\CustomTooltips.xaml",
    "Themes\DashboardWidgets.xaml",
    "Themes\HighContrastTheme.xaml",
    "Resources\DataGridTheme.xaml",
    "Resources\ButtonStyles.xaml",
    "Styles\ModernButtonStyle.xaml",
    "Resources\DiscoveryViewStyles.xaml"
)

$missing = @()

foreach ($resource in $resources) {
    $fullPath = Join-Path $basePath $resource
    if (Test-Path $fullPath) {
        Write-Host "[OK] $resource"
    } else {
        Write-Host "[MISSING] $resource"
        $missing += $resource
    }
}

Write-Host ""
if ($missing.Count -gt 0) {
    Write-Host "WARNING: $($missing.Count) resource files are MISSING!"
    Write-Host "Missing files:"
    $missing | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "All resource files exist"
}

Write-Host ""
Write-Host "========================================="