#Requires -Version 5.1
<#
.SYNOPSIS
    Provides configuration validation against a JSON schema for the M&A Discovery Suite.
.DESCRIPTION
    This module includes functions to test a loaded configuration object (hashtable)
    against a defined JSON schema file (config.schema.json). It reports validation
    errors and warnings.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Uses Write-MandALog for logging.
    - Relies on $global:MandA or a passed -Context for logging context.
    - Recursively validates configuration nodes against schema definitions.
    - Handles basic JSON schema types (string, integer, boolean, array, object) and properties like 'required', 'enum', 'pattern', 'minimum', 'maximum'.
    - PowerShell 5.1 compatible.
#>

Export-ModuleMember -Function Test-SuiteConfigurationAgainstSchema

# --- Private Recursive Validation Function ---

function Test-ConfigurationNodeInternal {
    param(
        [Parameter(Mandatory=$true)]
        [object]$NodeData, # The actual data node from the configuration

        [Parameter(Mandatory=$true)]
        [PSCustomObject]$NodeSchema, # The schema definition for this node

        [Parameter(Mandatory=$true)]
        [string]$CurrentPath, # Dot-notation path for error reporting (e.g., "environment.logging")

        [Parameter(Mandatory=$true)]
        [ref]$ValidationErrors, # Pass by reference to collect errors

        [Parameter(Mandatory=$true)]
        [ref]$ValidationWarnings, # Pass by reference to collect warnings
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$RootSchema, # The entire root schema object, for resolving $ref if implemented

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging
    )

    # Get-OrElse should be globally defined
    $debugMode = $false
    if ($Context -and $Context.Config -and $Context.Config.advancedSettings) {
        $debugMode = $Context.Config.advancedSettings.debugMode | global:Get-OrElse $false
    }

    if ($debugMode) {
        Write-MandALog -Message "Validating path: '$CurrentPath'. Schema type: '$($NodeSchema.type)'. Data type: '$($NodeData.GetType().Name)'" -Level "DEBUG" -Component "SchemaValidation" -Context $Context
    }

    # 1. Type Validation
    $expectedSchemaTypes = @($NodeSchema.type) # Schema 'type' can be a string or an array of strings
    $actualDataType = ""
    if ($null -eq $NodeData) {
        $actualDataType = "null"
    } elseif ($NodeData -is [string]) {
        $actualDataType = "string"
    } elseif ($NodeData -is [int] -or $NodeData -is [long] -or $NodeData -is [double]) { # Consider float/double as number for JSON schema
        $actualDataType = "integer" # JSON schema 'integer' and 'number'
        if ($NodeData -isnot [int] -and $NodeData -isnot [long]) { $actualDataType = "number"}
    } elseif ($NodeData -is [bool]) {
        $actualDataType = "boolean"
    } elseif ($NodeData -is [array]) {
        $actualDataType = "array"
    } elseif ($NodeData -is [hashtable] -or $NodeData -is [PSCustomObject]) { # PSCustomObject from ConvertFrom-Json becomes Hashtable via ConvertTo-HashtableRecursiveSSE
        $actualDataType = "object"
    } else {
        $actualDataType = $NodeData.GetType().Name.ToLower() # Fallback, might not match JSON schema types
    }

    $typeMatch = $false
    foreach($expectedType in $expectedSchemaTypes){
        if($expectedType -eq "number" -and ($actualDataType -eq "integer" -or $actualDataType -eq "number")){
            $typeMatch = $true; break
        }
        if ($actualDataType -eq $expectedType.ToLower()) {
            $typeMatch = $true; break
        }
    }
    
    if (-not $typeMatch) {
        $ValidationErrors.Value.Add("Path '$CurrentPath': Type mismatch. Expected type(s) '$($expectedSchemaTypes -join "' or '")' but found '$actualDataType'.")
        return # Stop further validation for this node if type is wrong
    }

    # 2. Enum Validation (if applicable)
    if ($NodeSchema.PSObject.Properties['enum']) {
        if (-not ($NodeSchema.enum -contains $NodeData)) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value '$NodeData' is not in the allowed enum list: $($NodeSchema.enum -join ', ').")
        }
    }

    # 3. Pattern Validation (for strings)
    if ($actualDataType -eq "string" -and $NodeSchema.PSObject.Properties['pattern']) {
        if ($NodeData -notmatch $NodeSchema.pattern) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value '$NodeData' does not match pattern '$($NodeSchema.pattern)'.")
        }
    }
    
    # 4. Minimum/Maximum Validation (for numbers/integers)
    if (($actualDataType -eq "integer" -or $actualDataType -eq "number")) {
        if ($NodeSchema.PSObject.Properties['minimum'] -and $NodeData -lt $NodeSchema.minimum) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value $NodeData is less than minimum of $($NodeSchema.minimum).")
        }
        if ($NodeSchema.PSObject.Properties['maximum'] -and $NodeData -gt $NodeSchema.maximum) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value $NodeData is greater than maximum of $($NodeSchema.maximum).")
        }
         if ($NodeSchema.PSObject.Properties['exclusiveMinimum'] -and $NodeData -le $NodeSchema.exclusiveMinimum) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value $NodeData must be greater than $($NodeSchema.exclusiveMinimum).")
        }
        if ($NodeSchema.PSObject.Properties['exclusiveMaximum'] -and $NodeData -ge $NodeSchema.exclusiveMaximum) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Value $NodeData must be less than $($NodeSchema.exclusiveMaximum).")
        }
    }
    
    # 5. MinLength/MaxLength Validation (for strings)
    if ($actualDataType -eq "string") {
        if ($NodeSchema.PSObject.Properties['minLength'] -and $NodeData.Length -lt $NodeSchema.minLength) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': String length $($NodeData.Length) is less than minLength of $($NodeSchema.minLength).")
        }
        if ($NodeSchema.PSObject.Properties['maxLength'] -and $NodeData.Length -gt $NodeSchema.maxLength) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': String length $($NodeData.Length) is greater than maxLength of $($NodeSchema.maxLength).")
        }
    }

    # 6. MinItems/MaxItems Validation (for arrays)
    if ($actualDataType -eq "array") {
        if ($NodeSchema.PSObject.Properties['minItems'] -and $NodeData.Count -lt $NodeSchema.minItems) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Array contains $($NodeData.Count) items, less than minItems of $($NodeSchema.minItems).")
        }
        if ($NodeSchema.PSObject.Properties['maxItems'] -and $NodeData.Count -gt $NodeSchema.maxItems) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Array contains $($NodeData.Count) items, more than maxItems of $($NodeSchema.maxItems).")
        }
    }


    # 7. Object-specific validations (properties, required, additionalProperties)
    if ($actualDataType -eq "object") {
        # 7a. Required Properties
        if ($NodeSchema.PSObject.Properties['required'] -is [array]) {
            foreach ($requiredProp in $NodeSchema.required) {
                if (-not $NodeData.HashtableContains($requiredProp)) { # Use HashtableContains for reliability with PS 5.1
                    $ValidationErrors.Value.Add("Path '$CurrentPath': Missing required property '$requiredProp'.")
                }
            }
        }

        # 7b. Validate defined properties
        if ($NodeSchema.PSObject.Properties['properties'] -is [hashtable] -or $NodeSchema.PSObject.Properties['properties'] -is [PSCustomObject]) {
            # Iterate over properties defined in the schema for this object
            foreach ($propKey in $NodeSchema.properties.PSObject.Properties.Name) {
                $propSchema = $NodeSchema.properties.$propKey
                if ($NodeData.HashtableContains($propKey)) {
                    # Property exists in data, validate it recursively
                    Test-ConfigurationNodeInternal -NodeData $NodeData.$propKey -NodeSchema $propSchema -CurrentPath "$CurrentPath.$propKey" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
                }
                # If not required and not present, it's fine. Required check already done.
            }
        }
        
        # 7c. Additional Properties
        # Get-OrElse should be available globally
        $allowAdditionalProperties = $NodeSchema.additionalProperties | global:Get-OrElse $true # Default to true if not specified
        
        if ($allowAdditionalProperties -is [bool] -and -not $allowAdditionalProperties) {
            # additionalProperties is false, so no extra properties are allowed
            $schemaDefinedProps = @()
            if ($NodeSchema.PSObject.Properties['properties']) {$schemaDefinedProps = $NodeSchema.properties.PSObject.Properties.Name}
            
            foreach ($dataPropKey in $NodeData.Keys) {
                if (-not ($schemaDefinedProps -contains $dataPropKey)) {
                    $ValidationWarnings.Value.Add("Path '$CurrentPath': Property '$dataPropKey' is not defined in schema and additionalProperties is false.")
                }
            }
        } elseif ($allowAdditionalProperties -is [hashtable] -or $allowAdditionalProperties -is [PSCustomObject]) {
            # additionalProperties is a schema, validate extra properties against it
            $schemaDefinedProps = @()
            if ($NodeSchema.PSObject.Properties['properties']) {$schemaDefinedProps = $NodeSchema.properties.PSObject.Properties.Name}
            
            foreach ($dataPropKey in $NodeData.Keys) {
                if (-not ($schemaDefinedProps -contains $dataPropKey)) {
                    Test-ConfigurationNodeInternal -NodeData $NodeData.$dataPropKey -NodeSchema $allowAdditionalProperties -CurrentPath "$CurrentPath.$dataPropKey (additional)" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
                }
            }
        }
        # If $allowAdditionalProperties is true (boolean) or not present, any additional properties are allowed and not validated further by this rule.
    }

    # 8. Array-specific validations (items)
    if ($actualDataType -eq "array" -and ($NodeSchema.PSObject.Properties['items'] -is [hashtable] -or $NodeSchema.PSObject.Properties['items'] -is [PSCustomObject])) {
        $itemSchema = $NodeSchema.items
        for ($i = 0; $i -lt $NodeData.Count; $i++) {
            Test-ConfigurationNodeInternal -NodeData $NodeData[$i] -NodeSchema $itemSchema -CurrentPath "$CurrentPath[$i]" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
        }
    }
    # Note: Does not currently support tuple validation (where 'items' is an array of schemas)
    # or complex 'allOf', 'anyOf', 'oneOf', 'not' keywords from JSON Schema.
}


# --- Public Function ---

function Test-SuiteConfigurationAgainstSchema {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ConfigurationObject, # The configuration loaded as a PowerShell hashtable

        [Parameter(Mandatory=$true)]
        [string]$SchemaPath, # Path to the config.schema.json file

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging, assumes $Context.Config and $Context.Paths might exist
    )

    $validationErrorsList = [System.Collections.Generic.List[string]]::new()
    $validationWarningsList = [System.Collections.Generic.List[string]]::new()
    $validationErrorsRef = [ref]$validationErrorsList
    $validationWarningsRef = [ref]$validationWarningsList

    Write-MandALog -Message "Starting configuration validation against schema: '$SchemaPath'" -Level "INFO" -Component "ConfigSchemaValidation" -Context $Context

    if (-not (Test-Path $SchemaPath -PathType Leaf)) {
        $ValidationErrors.Value.Add("JSON Schema file not found at path: '$SchemaPath'. Cannot perform validation.")
        Write-MandALog -Message "JSON Schema file not found at: '$SchemaPath'." -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }

    $schemaJsonContent = $null
    try {
        $schemaJsonContent = Get-Content $SchemaPath -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
        $ValidationErrors.Value.Add("Failed to parse JSON Schema file '$SchemaPath'. Error: $($_.Exception.Message)")
        Write-MandALog -Message "Failed to parse JSON Schema file '$SchemaPath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }
    
    if ($null -eq $schemaJsonContent) {
         $ValidationErrors.Value.Add("Parsed JSON Schema content is null from '$SchemaPath'.")
        Write-MandALog -Message "Parsed JSON Schema content is null from '$SchemaPath'." -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }

    # Start recursive validation from the root
    Test-ConfigurationNodeInternal -NodeData $ConfigurationObject -NodeSchema $schemaJsonContent -CurrentPath "root" -ValidationErrors $validationErrorsRef -ValidationWarnings $validationWarningsRef -RootSchema $schemaJsonContent -Context $Context
    
    $isValid = ($validationErrorsList.Count -eq 0)

    if ($isValid) {
        Write-MandALog -Message "Configuration successfully validated against schema '$SchemaPath'." -Level "SUCCESS" -Component "ConfigSchemaValidation" -Context $Context
        if ($validationWarningsList.Count -gt 0) {
            Write-MandALog -Message "Validation completed with $($validationWarningsList.Count) warning(s):" -Level "WARN" -Component "ConfigSchemaValidation" -Context $Context
            $validationWarningsList | ForEach-Object { Write-MandALog -Message "  - $_" -Level "WARN" -Component "ConfigSchemaValidation" -Context $Context }
        }
    } else {
        Write-MandALog -Message "Configuration FAILED validation against schema '$SchemaPath'. $($validationErrorsList.Count) error(s) found." -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        $validationErrorsList | ForEach-Object { Write-MandALog -Message "  - $_" -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context }
        if ($validationWarningsList.Count -gt 0) {
            Write-MandALog -Message "Additionally, there are $($validationWarningsList.Count) warning(s):" -Level "WARN" -Component "ConfigSchemaValidation" -Context $Context
            $validationWarningsList | ForEach-Object { Write-MandALog -Message "  - $_" -Level "WARN" -Component "ConfigSchemaValidation" -Context $Context }
        }
    }

    return [PSCustomObject]@{
        IsValid  = $isValid
        Errors   = $validationErrorsList
        Warnings = $validationWarningsList
    }
}

Write-Host "[ConfigurationValidation.psm1] Module loaded." -ForegroundColor DarkGray

