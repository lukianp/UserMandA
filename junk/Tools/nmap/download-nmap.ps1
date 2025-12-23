# Download and extract nmap for embedding
Write-Host "🔽 Downloading nmap portable for embedding..."

$ProgressPreference = 'SilentlyContinue'

try {
    # Download nmap
    $nmapUrl = "https://nmap.org/dist/nmap-7.95-win32.zip" 
    $nmapZip = "nmap-7.95-win32.zip"
    
    Write-Host "📥 Downloading from $nmapUrl..."
    Invoke-WebRequest -Uri $nmapUrl -OutFile $nmapZip -UseBasicParsing -TimeoutSec 120
    
    $fileSize = (Get-Item $nmapZip).Length / 1MB
    Write-Host "✅ Downloaded $([math]::Round($fileSize, 2)) MB"
    
    # Extract
    Write-Host "📦 Extracting nmap archive..."
    Expand-Archive -Path $nmapZip -DestinationPath "." -Force
    
    # Clean up zip
    Remove-Item $nmapZip -Force
    
    # List contents
    Write-Host "📋 Extracted contents:"
    Get-ChildItem -Recurse | Select-Object Name, Length | Format-Table
    
    Write-Host "✅ nmap embedding preparation complete"
} catch {
    Write-Host "❌ Error downloading nmap: $($_.Exception.Message)"
    Write-Host "💡 Will fallback to runtime download during discovery"
}