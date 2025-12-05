$env:MANDA_DISCOVERY_PATH = "C:\DiscoveryData"
Write-Host "MANDA_DISCOVERY_PATH set to: $env:MANDA_DISCOVERY_PATH"
& "C:\enterprisediscovery\node_modules\.bin\electron.cmd" "C:\enterprisediscovery\.webpack\main\main.js"
