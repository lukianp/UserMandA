# Fix Router context issues in test files
# Replaces render() with renderWithRouter() where needed

$testFile = "src/renderer/views/overview/OverviewView.test.tsx"

if (Test-Path $testFile) {
    $content = Get-Content $testFile -Raw

    # Replace all remaining render( calls with renderWithRouter(
    # But be careful not to replace it in imports or comments
    $content = $content -replace '(?<!renderWith)(?<!// )render\(<', 'renderWithRouter(<'
    $content = $content -replace '(?<!renderWith)(?<!// )render\(\s*<', 'renderWithRouter(<'

    # Replace const { rerender } = render( patterns
    $content = $content -replace 'const \{ rerender \} = render\(<', 'const { rerender } = renderWithRouter(<'

    Set-Content -Path $testFile -Value $content -NoNewline
    Write-Host "Fixed OverviewView.test.tsx" -ForegroundColor Green
} else {
    Write-Host "File not found: $testFile" -ForegroundColor Red
}
