@echo off
REM M&A Discovery Suite Launcher
REM Ensures PowerShell execution policy allows running the application

echo Starting M&A Discovery Suite...
echo.

REM Check if .NET 6 runtime is available
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET 6 runtime is required but not found.
    echo Please download and install .NET 6 runtime from:
    echo https://dotnet.microsoft.com/download/dotnet/6.0
    echo.
    pause
    exit /b 1
)

REM Set PowerShell execution policy for current user (if needed)
powershell -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue"

REM Launch the application
"MandADiscoverySuite.exe"

if errorlevel 1 (
    echo.
    echo Application exited with an error.
    pause
)
