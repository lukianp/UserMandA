# Create a minimal WPF test app
Write-Host "Creating minimal WPF test..." -ForegroundColor Cyan

$testDir = "C:\Temp\WpfTest"
New-Item -ItemType Directory -Path $testDir -Force | Out-Null

# Minimal csproj
@"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net6.0-windows</TargetFramework>
    <UseWPF>true</UseWPF>
  </PropertyGroup>
</Project>
"@ | Out-File "$testDir\TestApp.csproj" -Encoding UTF8

# Minimal App.xaml
@"
<Application x:Class="TestApp.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
</Application>
"@ | Out-File "$testDir\App.xaml" -Encoding UTF8

# Minimal App.xaml.cs
@"
using System.Windows;
namespace TestApp
{
    public partial class App : Application
    {
    }
}
"@ | Out-File "$testDir\App.xaml.cs" -Encoding UTF8

# Minimal MainWindow.xaml
@"
<Window x:Class="TestApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Test" Height="200" Width="300">
    <TextBlock Text="If you see this, WPF works!" HorizontalAlignment="Center" VerticalAlignment="Center"/>
</Window>
"@ | Out-File "$testDir\MainWindow.xaml" -Encoding UTF8

# Minimal MainWindow.xaml.cs
@"
using System.Windows;
namespace TestApp
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }
    }
}
"@ | Out-File "$testDir\MainWindow.xaml.cs" -Encoding UTF8

# Build and run
Write-Host "Building minimal WPF app..." -ForegroundColor Yellow
dotnet build "$testDir\TestApp.csproj" --configuration Release | Out-Null

Write-Host "Running minimal WPF app..." -ForegroundColor Yellow
$testApp = Start-Process "dotnet" -ArgumentList "run --project $testDir\TestApp.csproj --configuration Release" -PassThru
Start-Sleep -Seconds 3

if (Get-Process -Id $testApp.Id -ErrorAction SilentlyContinue) {
    Write-Host "SUCCESS: Minimal WPF app is RUNNING!" -ForegroundColor Green
    Write-Host "  This means .NET and WPF runtime work correctly" -ForegroundColor Green
    Write-Host "  The issue is SPECIFIC to your application code" -ForegroundColor Yellow
    Stop-Process -Id $testApp.Id -Force
} else {
    Write-Host "FAILED: Even minimal WPF app crashes" -ForegroundColor Red
    Write-Host "  This indicates a .NET/WPF runtime or system issue" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
