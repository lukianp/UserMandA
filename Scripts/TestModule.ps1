# Import and test the module directly
Import-Module ".\Modules\Discovery\AzureDiscovery.psm1" -Force -Verbose

# Check if the function exists
Get-Command Invoke-AzureDiscovery

# Try to run with minimal context
$testConfig = @{
    azure = @{
        subscriptionFilter = @()
        resourceGroupFilter = @()
    }
}

$testContext = @{
    Paths = @{
        RawDataOutput = "C:\Temp\TestOutput"
    }
}

# Run the discovery
$result = Invoke-AzureDiscovery -Configuration $testConfig -Context $testContext -Verbose
$result