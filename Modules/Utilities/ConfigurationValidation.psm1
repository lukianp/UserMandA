<#
.SYNOPSIS
    Provides functions to validate the M&A Discovery Suite configuration object
    against a JSON schema. Uses Write-Host for internal logging.
    Correctly handles property existence checks for PSCustomObjects and $null comparisons.
.DESCRIPTION
    This module is crucial for ensuring the integrity and correctness of the 
    `default-config.json` file at runtime, preventing errors due to misconfiguration.
.NOTES
    Version: 1.0.4
    Author: Gemini & User
    Date: 2025-06-01
#>
$outputPath = $Context.Paths.RawDataOutput
function Test-SuiteConfigurationAgainstSchema {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ConfigurationObject, # The loaded config from default-config.json (already converted to hashtable)
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

    $schemaJson = $null # This will be a PSCustomObject after ConvertFrom-Json
    try {
        $schemaJson = Get-Content $SchemaPath -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
        $validationErrors.Add("Failed to parse configuration schema file at '$SchemaPath': $($_.Exception.Message). Schema validation skipped.")
        return @{ IsValid = $false; Errors = $validationErrors; Warnings = $validationWarnings }
    }
     if ($null -eq $schemaJson) { 
        $validationErrors.Add("Failed to parse configuration schema file at '$SchemaPath' (result was null). Schema validation skipped.")
        return @{ IsValid = $false; Errors = $validationErrors; Warnings = $validationWarnings }
    }

    # Recursive validation helper function
    # $NodeData is a hashtable (from the config)
    # $NodeSchema is a PSCustomObject (from the schema JSON)
    function Test-ConfigurationNodeInternal {
        param(
            [object]$NodeData, 
            [psobject]$NodeSchema, # Explicitly psobject from schema
            [string]$CurrentPath = "$" 
        )

        if ($null -eq $NodeSchema) {
            $validationWarnings.Add("Path '$CurrentPath': No schema definition found. Config might have extra properties.")
            return
        }

        # Check required properties (for objects)
        # $NodeSchema.required will be an array if it exists
        if ($null -ne $NodeSchema.required -and $NodeSchema.required -is [array]) {
            foreach ($requiredProp in $NodeSchema.required) {
                if ($NodeData -isnot [hashtable] -or (-not $NodeData.ContainsKey($requiredProp))) { 
                    $validationErrors.Add("Path '$CurrentPath': Missing required property '$requiredProp'.")
                }
            }
        }

        # Type checking and recursive validation for object properties
        if ($null -ne $NodeSchema.type -and $NodeSchema.type -eq "object" -and $NodeData -is [hashtable]) {
            if ($null -ne $NodeSchema.properties) { # $NodeSchema.properties is a PSCustomObject
                foreach ($propKey in $NodeData.Keys) {
                    $propPath = "$CurrentPath.$propKey"
                    # Check if the property from data exists as a defined property in the schema
                    if ($null -ne $NodeSchema.properties.PSObject.Properties[$propKey]) { # Corrected null check
                        Test-ConfigurationNodeInternal -NodeData $NodeData.$propKey -NodeSchema $NodeSchema.properties.$propKey -CurrentPath $propPath
                    } else {
                        # Property in config data but not explicitly in schema's 'properties'
                        $allowAdditional = $false 
                        # Check 'additionalProperties' in the schema for the current node
                        if ($null -ne $NodeSchema.PSObject.Properties['additionalProperties']) { # Corrected null check
                           if ($NodeSchema.additionalProperties -is [boolean] -and $NodeSchema.additionalProperties -eq $true) {
                               $allowAdditional = $true
                           } elseif ($NodeSchema.additionalProperties -is [psobject]) { # If additionalProperties is a schema itself
                               $allowAdditional = $true # For simplicity, assume if it's a schema, it's allowed (or validate against it)
                           }
                        } elseif ($null -ne $NodeSchema.PSObject.Properties['$ref']) { # Corrected null check
                            # If there's a $ref, additional properties might be defined in the referenced schema.
                            # A full $ref resolver is complex; for now, assume it might be allowed or warn.
                            $validationWarnings.Add("Path '$propPath': Property exists in configuration. Schema uses `$`ref, full validation of additionalProperties depends on resolved schema.")
                            $allowAdditional = $true # Tentatively allow, or implement $ref resolution
                        }

                        if (-not $allowAdditional) {
                             $validationWarnings.Add("Path '$propPath': Property exists in configuration but not defined in schema properties, and 'additionalProperties' is not true or is absent for '$CurrentPath'.")
                        }
                    }
                }
            }
        } elseif ($null -ne $NodeSchema.type -and $NodeSchema.type -eq "array" -and $NodeData -is [array]) {
            if ($null -ne $NodeSchema.items) { # $NodeSchema.items is a PSCustomObject representing the schema for array items
                for ($i = 0; $i -lt $NodeData.Count; $i++) {
                    Test-ConfigurationNodeInternal -NodeData $NodeData[$i] -NodeSchema $NodeSchema.items -CurrentPath "$CurrentPath[$i]"
                }
            }
             if (($null -ne $NodeSchema.minItems) -and ($NodeData.Count -lt $NodeSchema.minItems)) {
                $validationErrors.Add("Path '$CurrentPath': Array has $($NodeData.Count) items, but schema minimum is $($NodeSchema.minItems).")
            }
        } elseif ($null -ne $NodeData) { # Leaf node validation (string, integer, boolean, number)
            $expectedSchemaType = $NodeSchema.type # This can be a string or an array of strings (e.g. ["string", "null"])
            $actualDataType = $NodeData.GetType().Name.ToLower()
            
            $typeMatch = $false
            if ($expectedSchemaType -is [array]) { 
                if (($expectedSchemaType -contains $actualDataType) -or ($expectedSchemaType -contains "null" -and $null -eq $NodeData)) {
                    $typeMatch = $true
                }
            } elseif ($actualDataType -eq $expectedSchemaType -or ($expectedSchemaType -eq "null" -and $null -eq $NodeData)) {
                $typeMatch = $true
            } elseif ($expectedSchemaType -eq "integer" -and ($actualDataType -eq "int32" -or $actualDataType -eq "int64")) { 
                $typeMatch = $true
            } elseif ($expectedSchemaType -eq "number" -and ($actualDataType -in @("double", "decimal", "int32", "int64", "single"))) {
                 $typeMatch = $true
            }

            if (-not $typeMatch) {
                $validationErrors.Add("Path '$CurrentPath': Type mismatch. Schema expected '$($expectedSchemaType -join "' or '")', but data is '$actualDataType'. Value: '$NodeData'")
            }

            if ($null -ne $NodeSchema.enum -and $NodeData -notin $NodeSchema.enum) {
                $validationErrors.Add("Path '$CurrentPath': Value '$NodeData' is not in the allowed list (enum): $($NodeSchema.enum -join ', ').")
            }
            # Corrected: Check $NodeSchema.type before assuming it's "string" or array containing "string"
            if (($null -ne $NodeSchema.type -and (($NodeSchema.type -is [string] -and $NodeSchema.type -eq "string") -or ($NodeSchema.type -is [array] -and $NodeSchema.type -contains "string"))) -and `
                ($null -ne $NodeSchema.pattern) -and ($NodeData -is [string]) -and ($NodeData -notmatch $NodeSchema.pattern)) {
                $validationErrors.Add("Path '$CurrentPath': Value '$NodeData' does not match schema pattern '$($NodeSchema.pattern)'.")
            }
            if (($null -ne $NodeSchema.minLength) -and ($NodeData.ToString().Length -lt $NodeSchema.minLength)) { # Corrected null check
                 $validationErrors.Add("Path '$CurrentPath': Length $($NodeData.ToString().Length) is less than schema minLength $($NodeSchema.minLength).")
            }
             if (($null -ne $NodeSchema.minimum) -and ($NodeData -lt $NodeSchema.minimum)) { # Corrected null check
                 $validationErrors.Add("Path '$CurrentPath': Value $NodeData is less than schema minimum $($NodeSchema.minimum).")
            }
             if (($null -ne $NodeSchema.maximum) -and ($NodeData -gt $NodeSchema.maximum)) { # Corrected null check
                 $validationErrors.Add("Path '$CurrentPath': Value $NodeData is greater than schema maximum $($NodeSchema.maximum).")
            }
        }
    }

    # Start validation from the root: $ConfigurationObject is a Hashtable, $schemaJson is a PSCustomObject
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
