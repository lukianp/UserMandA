param(
    [string]$WorkDir = (Get-Location).Path,
    [string]$FilePattern = "*.xaml"
)

# Function to update hard-coded colors in a single file
function Fix-HardCodedColors {
    param(
        [string]$FilePath
    )

    Write-Host "Processing hard-coded colors in $FilePath..."

    if (-not (Test-Path $FilePath)) {
        Write-Host "  File not found: $FilePath" -ForegroundColor Yellow
        return 0
    }

    $content = Get-Content $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    $changesMade = 0

    # Array of color mappings (from, to)
    $colorMappings = @(
        @('Foreground="White"', 'Foreground="{DynamicResource WhiteBrush}"'),
        @('Foreground="Black"', 'Foreground="{DynamicResource BlackBrush}"'),
        @('Foreground="Gray"', 'Foreground="{DynamicResource MutedForegroundBrush}"'),
        @('Foreground="LightGray"', 'Foreground="{DynamicResource LightMutedForegroundBrush}"'),
        @('Foreground="DarkGray"', 'Foreground="{DynamicResource DarkMutedForegroundBrush}"'),
        @('Background="White"', 'Background="{DynamicResource WhiteBrush}"'),
        @('Background="Black"', 'Background="{DynamicResource BlackBrush}"'),
        @('Background="Gray"', 'Background="{DynamicResource MutedForegroundBrush}"'),
        @('Color="White"', 'Color="{DynamicResource WhiteColor}"'),
        @('Color="Black"', 'Color="{DynamicResource BlackColor}"'),
        @('Color="Gray"', 'Color="{DynamicResource GrayColor}"')
    )

    # Apply all color mappings
    foreach ($mapping in $colorMappings) {
        $oldText = $mapping[0]
        $newText = $mapping[1]

        if ($content -match $oldText) {
            $content = $content -replace $oldText, $newText
            $changesMade++
        }
    }

    # Write back to file if changes were made
    if ($content -ne $originalContent) {
        $content | Set-Content $FilePath -Encoding UTF8
        Write-Host "  Made $changesMade color replacements" -ForegroundColor Green
        return 1
    } else {
        Write-Host "  No hard-coded colors found" -ForegroundColor Blue
        return 0
    }
}

# Find all XAML files in the Views directory
$viewsDir = Join-Path $WorkDir "GUI/Views"
$discoveryViews = Get-ChildItem -Path $viewsDir -Filter "*.xaml" | Where-Object {
    $_.Name -match "Discovery"
}

$totalFixed = 0

Write-Host "Starting hard-coded color replacement in discovery views..." -ForegroundColor Cyan
Write-Host "Views directory: $viewsDir"
Write-Host ""

foreach ($view in $discoveryViews) {
    try {
        $result = Fix-HardCodedColors -FilePath $view.FullName
        $totalFixed += $result
    } catch {
        Write-Host "  Error processing $($view.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Hard-coded color replacement completed!" -ForegroundColor Cyan
Write-Host "Fixed colors in $totalFixed discovery views" -ForegroundColor Green

# Also check for SolidColorBrush.Color=.member syntax issues
Write-Host ""
Write-Host "Checking for SolidColorBrush.Color mismatches..."
$regexPattern = 'SolidColorBrush\.Color\s*=\s*[^{]'
$foundIssues = 0

foreach ($view in $discoveryViews) {
    $content = Get-Content $view.FullName -Raw
    if ($content -match $regexPattern) {
        Write-Host "  WARNING: Potential SolidColorBrush.Color mismatch in $($view.Name)" -ForegroundColor Yellow
        $foundIssues++
    }
}

if ($foundIssues -eq 0) {
    Write-Host "No SolidColorBrush.Color mismatches found!" -ForegroundColor Green
}