param(
    [string]$WorkDir = (Get-Location).Path
)

# Function to update a single discovery view
function Update-DiscoveryView {
    param(
        [string]$ViewPath
    )

    Write-Host "Processing $ViewPath..."

    if (-not (Test-Path $ViewPath)) {
        Write-Host "  File not found: $ViewPath" -ForegroundColor Yellow
        return 0
    }

    $content = Get-Content $ViewPath -Raw -Encoding UTF8

    # Pattern to find the merged dictionaries section
    $pattern = '(?s)<UserControl\.Resources>\s*<ResourceDictionary>\s*<ResourceDictionary\.MergedDictionaries>(.*?)<\/ResourceDictionary\.MergedDictionaries>\s*<\/ResourceDictionary>\s*<\/UserControl\.Resources>'

    $replacement = @'
    <UserControl.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="/Themes/ThemeResources.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </UserControl.Resources>
'@

    $updatedContent = $content -replace $pattern, $replacement

    # Also replace hard-coded "Gray" with dynamic resource
    $updatedContent = $updatedContent -replace 'Foreground="Gray"', 'Foreground="{DynamicResource MutedForegroundBrush}"'
    $updatedContent = $updatedContent -replace 'Foreground="gray"', 'Foreground="{DynamicResource MutedForegroundBrush}"'

    # Write back to file
    $updatedContent | Set-Content $ViewPath -Encoding UTF8

    Write-Host "  Updated $ViewPath" -ForegroundColor Green
    return 1
}

# Main logic
$discoveryViews = @(
    "ActiveDirectoryDiscoveryView.xaml",
    "AWSCloudInfrastructureDiscoveryView.xaml",
    "AzureDiscoveryView.xaml",
    "AzureInfrastructureDiscoveryView.xaml",
    "ConditionalAccessPoliciesDiscoveryView.xaml",
    "DataLossPreventionDiscoveryView.xaml",
    "DomainDiscoveryView.xaml",
    "EnvironmentDetectionView.xaml",
    "ExchangeDiscoveryView.xaml",
    "FileServerDiscoveryView.xaml",
    "MicrosoftTeamsDiscoveryView.xaml",
    "NetworkInfrastructureDiscoveryView.xaml",
    "OneDriveBusinessDiscoveryView.xaml",
    "PowerBIDiscoveryView.xaml",
    "SharePointDiscoveryView.xaml",
    "SQLServerDiscoveryView.xaml",
    "TeamsDiscoveryView.xaml",
    "VMwareDiscoveryView.xaml",
    "WebServerConfigurationDiscoveryView.xaml"
)

$viewsDir = Join-Path $WorkDir "GUI/Views"
$updatedCount = 0

Write-Host "Starting batch update of discovery views..." -ForegroundColor Cyan
Write-Host "Views directory: $viewsDir"
Write-Host ""

foreach ($view in $discoveryViews) {
    $viewPath = Join-Path $viewsDir $view
    try {
        $result = Update-DiscoveryView -ViewPath $viewPath
        $updatedCount += $result
    } catch {
        Write-Host "  Error processing $viewPath : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Batch update completed!" -ForegroundColor Cyan
Write-Host "Updated $updatedCount discovery views" -ForegroundColor Green