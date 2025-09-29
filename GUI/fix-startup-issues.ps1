# Fix M&A Discovery Suite GUI Startup Issues
Write-Host "Fixing M&A Discovery Suite GUI startup issues..." -ForegroundColor Green

# Fix 1: EmptyStateValidationViewModel method hiding
$emptyStateFile = "ViewModels/EmptyStateValidationViewModel.cs"
if (Test-Path $emptyStateFile) {
    $content = Get-Content $emptyStateFile -Raw
    $content = $content -replace "private void InitializeCommands\(\)", "protected override void InitializeCommands()"
    $content = $content -replace "RunValidationCommand = new AsyncRelayCommand", "            base.InitializeCommands();`r`n            RunValidationCommand = new AsyncRelayCommand"
    Set-Content $emptyStateFile $content -Encoding UTF8
    Write-Host "✅ Fixed EmptyStateValidationViewModel method hiding" -ForegroundColor Green
}

# Fix 2: Add missing using statements
$viewFiles = @(
    "Views/SQLServerDiscoveryView.xaml.cs",
    "Views/ApplicationDiscoveryView.xaml.cs",
    "Views/MicrosoftTeamsDiscoveryView.xaml.cs"
)

foreach ($file in $viewFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch "using Microsoft\.Extensions\.DependencyInjection;") {
            $content = $content -replace "(using Microsoft\.Extensions\.Logging;)", "`$1`r`nusing Microsoft.Extensions.DependencyInjection;"
            Set-Content $file $content -Encoding UTF8
            Write-Host "✅ Added DependencyInjection using to $file" -ForegroundColor Green
        }
    }
}

# Test build
Write-Host "`nTesting build..." -ForegroundColor Yellow
dotnet build MandADiscoverySuite.csproj --verbosity minimal

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! GUI should now start properly." -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Check output above for remaining issues." -ForegroundColor Red
}