# GCP Prerequisites Installation Script
# This script helps install the Google Cloud SDK and set up prerequisites for GCP Discovery

param(
    [switch]$Force
)

Write-Host "=== GCP Prerequisites Installation Script ===" -ForegroundColor Cyan

# Function to test internet connectivity
function Test-InternetConnection {
    try {
        $test = Test-Connection -ComputerName "cloud.google.com" -Count 1 -Quiet -TimeoutSeconds 5
        return $test
    } catch {
        return $false
    }
}

# Function to get system architecture
function Get-SystemArchitecture {
    try {
        $arch = (Get-WmiObject -Class Win32_OperatingSystem).OSArchitecture
        if ($arch -like "*64*") {
            return "x64"
        } else {
            return "x86"
        }
    } catch {
        # Fallback to PowerShell environment
        if ([Environment]::Is64BitOperatingSystem) {
            return "x64"
        } else {
            return "x86"
        }
    }
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Green

# Check internet connectivity
$hasInternet = Test-InternetConnection
if (-not $hasInternet) {
    Write-Host "ERROR: No internet connection detected. GCP SDK installation requires internet access." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✓ Internet connection available" -ForegroundColor Green
}

# Check if running as administrator
$adminCheck = Test-AdministratorPrivileges
if (-not $adminCheck.Installed) {
    Write-Host "WARNING: Not running as administrator. Some installation steps may fail." -ForegroundColor Yellow
}

# Check architecture
$architecture = Get-SystemArchitecture
Write-Host "✓ System architecture detected: $architecture" -ForegroundColor Green

# Check if GCP SDK is already installed
Write-Host "Checking for existing GCP SDK installation..." -ForegroundColor Green

# Check for gcloud command in PATH
try {
    $gcloudTest = & gcloud --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ GCP SDK is already installed in PATH:" -ForegroundColor Green
        Write-Host "$gcloudTest" -ForegroundColor White

        if (-not $Force) {
            Write-Host "Use -Force parameter to reinstall GCP SDK" -ForegroundColor Cyan
        } else {
            Write-Host "FORCE reinstallation requested. Proceeding with installation..." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠ GCP SDK not found in PATH or not functional" -ForegroundColor Yellow
}

# Download and install GCP SDK
if ($Force -or -not (& gcloud --version 2>$null) -or $LASTEXITCODE -ne 0) {

    Write-Host "Installing GCP SDK..." -ForegroundColor Green

    $installerUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"

    try {
        # Create temp directory
        $tempDir = Join-Path $env:TEMP "gcp-sdk-install-$(Get-Random)"
        if (-not (Test-Path $tempDir)) {
            New-Item -Path $tempDir -ItemType Directory -Force | Out-Null
        }

        $installerPath = Join-Path $tempDir "gcloud-installer.exe"
        Write-Host "Downloading GCP SDK installer from $installerUrl..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing

        if (Test-Path $installerPath) {
            Write-Host "✓ GCP SDK installer downloaded successfully" -ForegroundColor Green

            # Install GCP SDK
            Write-Host "Installing GCP SDK..." -ForegroundColor Yellow

            # Run installer silently
            Start-Process -FilePath $installerPath -ArgumentList "/S", "/norestart" -Wait -PassThru | Out-Null

            if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 3010) { # 3010 = reboot required
                Write-Host "✓ GCP SDK installation completed" -ForegroundColor Green

                # Add to PATH
                Write-Host "Adding GCP SDK to system PATH..." -ForegroundColor Yellow

                # Get GCP SDK path (usually in Program Files)
                $gcpSdkPath = "${env:ProgramFiles}\Google\Cloud SDK"
                if ($architecture -eq "x86") {
                    $gcpSdkPath = "${env:ProgramFiles(x86)}\Google\Cloud SDK"
                }

                # Add to system PATH
                $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
                if ($currentPath -notlike "*$gcpSdkPath*") {
                    $newPath = "$currentPath;$gcpSdkPath\bin"
                    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
                    Write-Host "✓ GCP SDK added to system PATH" -ForegroundColor Green

                    # Also add to current session
                    $env:Path = $newPath
                } else {
                    Write-Host "✓ GCP SDK already in system PATH" -ForegroundColor Green
                }

                # Test installation
                Write-Host "Testing GCP SDK installation..." -ForegroundColor Yellow
                try {
                    $version = & gcloud --version 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ GCP SDK installation successful!" -ForegroundColor Green
                        Write-Host "Installed version:" -ForegroundColor White
                        Write-Host $version -ForegroundColor Cyan

                        Write-Host "`nNext steps:" -ForegroundColor Cyan
                        Write-Host "1. Authenticate: gcloud auth login" -ForegroundColor White
                        Write-Host "2. Set project: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor White
                        Write-Host "3. Test.M&A discovery: Run GCP discovery module" -ForegroundColor White

                    } else {
                        Write-Host "❌ GCP SDK installation failed (command not found in PATH)" -ForegroundColor Red
                        Write-Host "Try restarting PowerShell/console and verify PATH includes:" -ForegroundColor Red
                        Write-Host "$gcpSdkPath\bin" -ForegroundColor Yellow
                    }
                } catch {
                    Write-Host "❌ GCP SDK installation verification failed: $($_.Exception.Message)" -ForegroundColor Red
                    Write-Host "Try restarting the console to refresh PATH" -ForegroundColor Yellow
                }

            } else {
                Write-Host "❌ GCP SDK installation failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
            }

        } else {
            Write-Host "❌ Failed to download GCP SDK installer" -ForegroundColor Red
        }

    } catch {
        Write-Host "❌ GCP SDK installation failed: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        # Cleanup
        if (Test-Path $tempDir) {
            try {
                Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "✓ Cleanup completed" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }

} else {
    Write-Host "✅ GCP SDK is already installed and functional" -ForegroundColor Green
}

# Provide final instructions
Write-Host "`n=== GCP Prerequisites Installation Complete ===" -ForegroundColor Cyan

Write-Host "To complete GCP discovery setup:" -ForegroundColor Green
Write-Host "1. Open PowerShell/CMD as Administrator" -ForegroundColor White
Write-Host "2. Run: gcloud auth login" -ForegroundColor White
Write-Host "3. Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor White
Write-Host "4. Run: gcloud auth application-default login  (for application default credentials)" -ForegroundColor White

Write-Host "`nThe GCP discovery module should now work without the SDK prerequisite error." -ForegroundColor Cyan

# Return success/failure
if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 3010) {
    exit 0
} else {
    exit 1
}