# PowerShell script to standardize warning and error icons across discovery views

$discoveryViews = @(
    "GUI/Views/ApplicationsViewNew.xaml",
    "GUI/Views/DatabasesViewNew.xaml",
    "GUI/Views/FileServersViewNew.xaml",
    "GUI/Views/GroupPoliciesViewNew.xaml",
    "GUI/Views/InfrastructureViewNew.xaml",
    "GUI/Views/UsersViewNew.xaml",
    "GUI/Views/ExchangeDiscoveryView.xaml",
    "GUI/Views/SharePointDiscoveryView.xaml",
    "GUI/Views/TeamsDiscoveryView.xaml",
    "GUI/Views/WebServerConfigurationDiscoveryView.xaml"
)

foreach ($view in $discoveryViews) {
    if (Test-Path $view) {
        Write-Host "Processing $view..."

        # Fix warning banner styling
        $content = Get-Content $view -Raw

        # Replace warning banner background and border
        $content = $content -replace 'Border Background="{DynamicResource ErrorBrush}" Opacity="0.33" BorderBrush="{DynamicResource ErrorBrush}" BorderThickness="1"', 'Border Background="{DynamicResource DarkSurfaceBrush}" Opacity="0.8" BorderBrush="{DynamicResource WarningColor}" BorderThickness="2"'

        # Replace warning icon foreground
        $content = $content -replace '<TextBlock Text="⚠" FontSize="16" Foreground="{DynamicResource WhiteBrush}"', '<TextBlock Text="⚠" FontSize="16" Foreground="{DynamicResource WarningColor}"'

        # Replace warning text foreground
        $content = $content -replace '<TextBlock Text="{Binding}" TextWrapping="Wrap" Foreground="{DynamicResource WhiteBrush}"', '<TextBlock Text="{Binding}" TextWrapping="Wrap" Foreground="{DynamicResource DarkForegroundBrush}"'

        # Replace error banner styling
        $content = $content -replace 'Border BorderBrush="{DynamicResource ErrorBrush}" BorderThickness="1".*Opacity="0.33"', 'Border BorderBrush="{DynamicResource ErrorColor}" BorderThickness="2", 'BorderBackground="{DynamicResource DarkSurfaceBrush}
                ", "Border Thickness="2" BorderBrush=" Foreground="{DynamicResource ErrorColor}" ', 'Border Background="{DynamicResource DarkSurfaceBrush}" Opacity="0.8"', 'Border Thickness="2" BorderBrush=" Foreground="{DynamicResource ErrorColor}" ', 'Border Background="{DynamicResource DarkSurfaceBrush}" Opacity="0.8"', 'Border Thickness="2" BorderBrush=" Foreground="{DynamicResource ErrorColor}"

        # Replace error icon foreground
        $content = $content -replace '<TextBlock Text="❌" FontSize="16" Foreground="{DynamicResource WhiteBrush}"', '<TextBlock Text="❌" FontSize="16" Foreground="{DynamicResource ErrorColor}"'

        # Replace error text foreground
        $content = $content -replace '<TextBlock Text="{Binding LastError}" TextWrapping="Wrap" Foreground="{DynamicResource WhiteBrush}"', '<TextBlock Text="{Binding LastError}" TextWrapping="Wrap" Foreground="{DynamicResource DarkForegroundBrush}"'

        # Write back to file
        Set-Content -Path $view -Value $content
        Write-Host "✓ Updated $view"
    }
}

Write-Host "Icon standardization complete!"