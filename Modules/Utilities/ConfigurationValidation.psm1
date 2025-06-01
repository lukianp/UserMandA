<#
.SYNOPSIS
    Provides functions to validate the M&A Discovery Suite configuration object
    against a JSON schema. Uses Write-Host for internal logging.
.DESCRIPTION
    This module is crucial for ensuring the integrity and correctness of the 
    `default-config.json` file at runtime, preventing errors due to misconfiguration.
.NOTES
    Version: 1.0.2
    Author: Gemini
    Date: 2025-06-01
#>

function Test-SuiteConfigurationAgainstSchema {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ConfigurationObject, # The loaded config from default-config.json
        [Parameter(Mandatory=$true)]
        [string]$SchemaPath # Path to config.schema.json
    )

    Write-Host "INFO: Validating configuration against schema: $SchemaPath" -ForegroundColor Gray
    $validationErrors = [System.Collections.Generic.List[string]]::new()
    $validationWarnings = [System.Collections.Generic.List[string]]::new()

    if (-not (Test-Path $SchemaPath -PathType Leaf)) {
        $validationErrors.Add("Configuration schema file not found at '$SchemaPath'. Cannot perform schema validation.")
        return @{ IsValid = $false; Errors = $validationErrors; Warnings = $validationWarnings }
    }

    $schemaJson = $null
    try {
        $schemaJson = Get-Content $SchemaPath -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
        $validationErrors.Add("Failed to parse configuration schema file at '$SchemaPath': $($_.Exception.Message). Schema validation skipped.")
        return @{ IsValid = $false; Errors = $validationErrors; Warnings = $validationWarnings }
    }
     if ($null -eq $schemaJson) { # Check if ConvertFrom-Json failed silently
        $validationErrors.Add("Failed to parse configuration schema file at '$SchemaPath' (result was null). Schema validation skipped.")
        return @{ IsValid = $false; Errors = $validationErrors; Warnings = $validationWarnings }
    }


    # Recursive validation helper function (internal to this function's scope)
    function Test-ConfigurationNodeInternal {
        param(
            [object]$NodeData, 
            [object]$NodeSchema, 
            [string]$CurrentPath = "$" 
        )

        if ($null -eq $NodeSchema) {
            $validationWarnings.Add("Path '$CurrentPath': No schema definition found. Config might have extra properties.")
            return
        }

        if ($NodeSchema.required -is [array]) {
            foreach ($requiredProp in $NodeSchema.required) {
                if ($NodeData -isnot [hashtable] -or (-not $NodeData.ContainsKey($requiredProp))) { # Ensure NodeData is a hashtable before ContainsKey
                    $validationErrors.Add("Path '$CurrentPath': Missing required property '$requiredProp'.")
                }
            }
        }

        if ($NodeSchema.type -eq "object" -and $NodeData -is [hashtable]) {
            if ($null -ne $NodeSchema.properties) {
                foreach ($propKey in $NodeData.Keys) {
                    $propPath = "$CurrentPath.$propKey"
                    if ($NodeSchema.properties.ContainsKey($propKey)) { 
                        Test-ConfigurationNodeInternal -NodeData $NodeData.$propKey -NodeSchema $NodeSchema.properties.$propKey -CurrentPath $propPath
                    } else {
                        $allowAdditional = $false 
                        if ($NodeSchema.PSObject.Properties.ContainsKey('additionalProperties')) {
                           if ($NodeSchema.additionalProperties -is [boolean] -and $NodeSchema.additionalProperties -eq $true) {
                               $allowAdditional = $true
                           } elseif ($NodeSchema.additionalProperties -is [hashtable]) { 
                               $allowAdditional = $true 
                           }
                        } elseif ($NodeSchema.PSObject.Properties.ContainsKey('$ref')) {
                            $allowAdditional = $true 
                        }
                        if (-not $allowAdditional) {
                             $validationWarnings.Add("Path '$propPath': Property exists in configuration but not defined in schema, and 'additionalProperties' is not explicitly true or is absent.")
                        }
                    }
                }
            }
        } elseif ($NodeSchema.type -eq "array" -and $NodeData -is [array]) {
            if ($null -ne $NodeSchema.items) {
                for ($i = 0; $i -lt $NodeData.Count; $i++) {
                    Test-ConfigurationNodeInternal -NodeData $NodeData[$i] -NodeSchema $NodeSchema.items -CurrentPath "$CurrentPath[$i]"
                }
            }
             if (($null -ne $NodeSchema.minItems) -and ($NodeData.Count -lt $NodeSchema.minItems)) {
                $validationErrors.Add("Path '$CurrentPath': Array has $($NodeData.Count) items, but minimum is $($NodeSchema.minItems).")
            }
        } elseif ($null -ne $NodeData) { 
            $expectedType = $NodeSchema.type
            $actualType = $NodeData.GetType().Name.ToLower()
            
            $typeMatch = $false
            if ($expectedType -is [array]) { 
                if (($expectedType -contains $actualType) -or ($expectedType -contains "null" -and $null -eq $NodeData)) {
                    $typeMatch = $true
                }
            } elseif ($actualType -eq $expectedType -or ($expectedType -eq "null" -and $null -eq $NodeData)) {
                $typeMatch = $true
            } elseif ($expectedType -eq "integer" -and ($actualType -eq "int32" -or $actualType -eq "int64")) { # Handle int64 as well
                $typeMatch = $true
            } elseif ($expectedType -eq "number" -and ($actualType -in @("double", "decimal", "int32", "int64", "single"))) {
                 $typeMatch = $true
            }

            if (-not $typeMatch) {
                $validationErrors.Add("Path '$CurrentPath': Type mismatch. Expected '$($expectedType -join "' or '")', but got '$actualType'. Value: '$NodeData'")
            }

            if ($null -ne $NodeSchema.enum -and $NodeData -notin $NodeSchema.enum) {
                $validationErrors.Add("Path '$CurrentPath': Value '$NodeData' is not in the allowed list: $($NodeSchema.enum -join ', ').")
            }
            if ($expectedType -eq "string" -and $null -ne $NodeSchema.pattern -and $NodeData -notmatch $NodeSchema.pattern) {
                $validationErrors.Add("Path '$CurrentPath': Value '$NodeData' does not match pattern '$($NodeSchema.pattern)'.")
            }
            if ($null -ne $NodeSchema.minLength -and $NodeData.ToString().Length -lt $NodeSchema.minLength) { # Ensure it's a string for Length
                 $validationErrors.Add("Path '$CurrentPath': Length $($NodeData.ToString().Length) is less than minLength $($NodeSchema.minLength).")
            }
             if ($null -ne $NodeSchema.minimum -and $NodeData -lt $NodeSchema.minimum) {
                 $validationErrors.Add("Path '$CurrentPath': Value $NodeData is less than minimum $($NodeSchema.minimum).")
            }
             if ($null -ne $NodeSchema.maximum -and $NodeData -gt $NodeSchema.maximum) {
                 $validationErrors.Add("Path '$CurrentPath': Value $NodeData is greater than maximum $($NodeSchema.maximum).")
            }
        }
    }

    Test-ConfigurationNodeInternal -NodeData $ConfigurationObject -NodeSchema $schemaJson

    $isValid = $validationErrors.Count -eq 0
    if (-not $isValid) {
        Write-Host "ERROR: Configuration validation failed with $($validationErrors.Count) errors." -ForegroundColor Red
        $validationErrors | ForEach-Object { Write-Host "  VALIDATION ERROR: $_" -ForegroundColor Red }
    }
    if ($validationWarnings.Count -gt 0) {
         Write-Host "WARNING: Configuration validation has $($validationWarnings.Count) warnings." -ForegroundColor Yellow
        $validationWarnings | ForEach-Object { Write-Host "  VALIDATION WARNING: $_" -ForegroundColor Yellow }
    }

    if ($isValid) {
        Write-Host "INFO: Configuration successfully validated against schema." -ForegroundColor Green
    }
    
    return @{ IsValid = $isValid; Errors = $validationErrors; Warnings = $validationWarnings }
}

Export-ModuleMember -Function Test-SuiteConfigurationAgainstSchema
