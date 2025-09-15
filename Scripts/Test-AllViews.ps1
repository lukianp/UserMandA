Write-Host "=== All Views Test ===" -ForegroundColor Green

$viewPath = "D:\Scripts\UserMandA\GUI\Views"
$viewModelPath = "D:\Scripts\UserMandA\GUI\ViewModels"

if (Test-Path $viewPath) {
    Write-Host "Checking view files in: $viewPath" -ForegroundColor Yellow
    $viewFiles = Get-ChildItem -Path $viewPath -Filter "*.xaml" -ErrorAction SilentlyContinue
    Write-Host "Found $($viewFiles.Count) view files" -ForegroundColor White
} else {
    Write-Host "❌ View path not found: $viewPath" -ForegroundColor Red
}

if (Test-Path $viewModelPath) {
    Write-Host "Checking ViewModel files in: $viewModelPath" -ForegroundColor Yellow
    $viewModelFiles = Get-ChildItem -Path $viewModelPath -Filter "*.cs" -ErrorAction SilentlyContinue
    Write-Host "Found $($viewModelFiles.Count) ViewModel files" -ForegroundColor White
} else {
    Write-Host "❌ ViewModel path not found: $viewModelPath" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green