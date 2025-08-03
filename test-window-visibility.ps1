Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern int GetWindowRect(IntPtr hWnd, out RECT lpRect);
        
        [StructLayout(LayoutKind.Sequential)]
        public struct RECT {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }
    }
"@

Write-Host "Testing window visibility..." -ForegroundColor Green

# Start the application
$process = Start-Process -FilePath "C:\EnterpriseDiscovery\MandADiscoverySuite.exe" -PassThru
Start-Sleep -Seconds 3

if ($process.HasExited) {
    Write-Host "Application crashed!" -ForegroundColor Red
    exit
}

$mainWindowHandle = $process.MainWindowHandle
if ($mainWindowHandle -eq 0) {
    Write-Host "No main window handle found" -ForegroundColor Red
} else {
    Write-Host "Main window handle: $mainWindowHandle" -ForegroundColor Cyan
    
    # Check if window is visible
    $isVisible = [Win32]::IsWindowVisible($mainWindowHandle)
    Write-Host "Window visible: $isVisible" -ForegroundColor $(if($isVisible){"Green"}else{"Red"})
    
    # Get window position
    $rect = New-Object Win32+RECT
    [Win32]::GetWindowRect($mainWindowHandle, [ref]$rect) | Out-Null
    Write-Host "Window position: Left=$($rect.Left), Top=$($rect.Top), Right=$($rect.Right), Bottom=$($rect.Bottom)" -ForegroundColor Cyan
    
    # Try to bring window to front
    [Win32]::ShowWindow($mainWindowHandle, 9) # SW_RESTORE
    [Win32]::SetForegroundWindow($mainWindowHandle)
    Write-Host "Attempted to bring window to foreground" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2
$process.Kill()