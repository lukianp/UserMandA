# Test script to debug the configuration hashtable issue
param(
    [string]$CompanyName = "Zedra"
)

$ErrorActionPreference = "Stop"

# Determine Suite Root
$SuiteRoot = $PSScriptRoot
Write-Host "SuiteRoot: $SuiteRoot" -ForegroundColor Green

# Load configuration manually to test
$configFilePath = Join-Path $SuiteRoot "Configuration\default-config.json"
Write-Host "ConfigFilePath: $configFilePath" -ForegroundColor Green

if (Test-Path $configFilePath) {
    Write-Host "Config file exists" -ForegroundColor Green
    
    # Read and parse JSON
    $jsonContent = Get-Content $configFilePath -Raw -Encoding UTF8
    $configContent = $jsonContent | ConvertFrom-Json
    
    Write-Host "JSON parsed successfully" -ForegroundColor Green
    Write-Host "credentialFileName from JSON: '$($configContent.authentication.credentialFileName)'" -ForegroundColor Yellow
    
    # Test Get-OrElse function
    function Test-GetOrElse {
        param($Value, $Default)
        if ($null -ne $Value) { return $Value } else { return $Default }
    }
    
    $testResult = Test-GetOrElse $configContent.authentication.credentialFileName "credentials.config"
    Write-Host "Get-OrElse test result: '$testResult'" -ForegroundColor Yellow
    
    # Test path construction
    $companyProfileRootPath = "C:\MandADiscovery\Profiles\$CompanyName"
    $credentialFile = Join-Path $companyProfileRootPath $testResult
    Write-Host "Constructed CredentialFile path: '$credentialFile'" -ForegroundColor Yellow
    
    # Test the actual conversion function from Set-SuiteEnvironment
    function ConvertTo-HashtableRecursiveSSE {
        param($InputObject)
        
        if ($null -eq $InputObject) {
            return $null
        }
        
        # Handle arrays and collections (but not strings or hashtables)
        if ($InputObject -is [System.Collections.IEnumerable] -and
            $InputObject -isnot [string] -and
            $InputObject -isnot [hashtable] -and
            $InputObject -isnot [System.Collections.IDictionary]) {
            
            # Convert to array and process each element
            $array = @()
            foreach ($item in $InputObject) {
                if ($item -is [PSCustomObject] -or $item -is [hashtable]) {
                    $array += ConvertTo-HashtableRecursiveSSE $item
                } else {
                    # Keep primitive values (strings, numbers, booleans) as-is
                    $array += $item
                }
            }
            
            # Return as array (the comma operator ensures it stays an array)
            return ,$array
        }
        
        # Handle PSCustomObject - convert to hashtable
        if ($InputObject -is [PSCustomObject]) {
            $hash = @{}
            foreach ($property in $InputObject.PSObject.Properties) {
                $hash[$property.Name] = ConvertTo-HashtableRecursiveSSE $property.Value
            }
            return $hash
        }
        
        # Handle existing hashtables - process their values
        if ($InputObject -is [hashtable] -or $InputObject -is [System.Collections.IDictionary]) {
            $hash = @{}
            foreach ($key in $InputObject.Keys) {
                $hash[$key] = ConvertTo-HashtableRecursiveSSE $InputObject[$key]
            }
            return $hash
        }
        
        # Return all other types as-is (strings, numbers, booleans, etc.)
        return $InputObject
    }
    
    # Convert to hashtable
    $configurationHashtable = ConvertTo-HashtableRecursiveSSE -InputObject $configContent
    Write-Host "Converted to hashtable" -ForegroundColor Green
    Write-Host "credentialFileName from hashtable: '$($configurationHashtable.authentication.credentialFileName)'" -ForegroundColor Yellow
    
    # Test hashtable access
    if ($configurationHashtable.authentication) {
        Write-Host "Authentication section exists in hashtable" -ForegroundColor Green
        if ($configurationHashtable.authentication.credentialFileName) {
            Write-Host "credentialFileName exists: '$($configurationHashtable.authentication.credentialFileName)'" -ForegroundColor Green
        } else {
            Write-Host "credentialFileName is NULL or empty in hashtable" -ForegroundColor Red
        }
    } else {
        Write-Host "Authentication section is NULL in hashtable" -ForegroundColor Red
    }
    
} else {
    Write-Host "Config file does NOT exist" -ForegroundColor Red
}