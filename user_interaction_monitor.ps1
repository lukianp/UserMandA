# User Interaction Monitoring Script
$logPath = "D:\Scripts\UserMandA\user_interactions.log"

# Function to log interactions
function Log-Interaction {
    param($interaction)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp | $interaction"
    Add-Content -Path $logPath -Value $logEntry
}

# Watch for specific log patterns indicating user interactions
Get-Content -Path 'C:\DiscoveryData\ljpops\Logs\gui-clicks.log' -Wait | ForEach-Object {
    switch -Regex ($_) {
        'ViewChanged:(\w+)' { 
            Log-Interaction "View Navigation: $($matches[1])"
        }
        'ButtonClicked:(\w+)' { 
            Log-Interaction "Button Click: $($matches[1])"
        }
        'DataLoaded:(\w+)' { 
            Log-Interaction "Data Loaded: $($matches[1])"
        }
        'Error:(.+)' { 
            Log-Interaction "UI Error: $($matches[1])"
        }
    }
}