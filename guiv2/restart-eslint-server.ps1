# PowerShell script to restart VS Code ESLint server
# Run this when ESLint configuration changes aren't being picked up

Write-Host "Restarting VS Code ESLint server..." -ForegroundColor Green

# Method 1: Using VS Code Command Palette
Write-Host "Please run the following command in VS Code:" -ForegroundColor Yellow
Write-Host "1. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)" -ForegroundColor Cyan
Write-Host "2. Type 'ESLint: Restart ESLint Server'" -ForegroundColor Cyan
Write-Host "3. Press Enter" -ForegroundColor Cyan

# Method 2: Reload VS Code Window
Write-Host "Alternatively, you can:" -ForegroundColor Yellow
Write-Host "1. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)" -ForegroundColor Cyan
Write-Host "2. Type 'Developer: Reload Window'" -ForegroundColor Cyan
Write-Host "3. Press Enter" -ForegroundColor Cyan

Write-Host ""
Write-Host "After restarting the ESLint server, the parsing errors should be resolved!" -ForegroundColor Green