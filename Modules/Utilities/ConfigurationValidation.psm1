# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Configuration validation against JSON schema for the M&A Discovery Suite
.DESCRIPTION
    This module provides functions to test a loaded configuration object (hashtable) against a defined JSON schema file 
    (config.schema.json). It reports validation errors and warnings with detailed context information. The module 
    supports recursive validation of configuration nodes against schema definitions and handles basic JSON schema types 
    including string, integer, boolean, array, and object with properties like 'required', 'enum', 'pattern', 
    'minimum', and 'maximum'.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, EnhancedLogging module
#>
    - PowerShell 5.1 compatible.
#>

Export-ModuleMember -Function Test-SuiteConfigurationAgainstSchema

# --- Module-scope context variable ---
$script:ModuleContext = $null

function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        [Parameter(Mandatory=$false)]
        $Context
    )
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    return $result
}

function Test-ConfigurationNodeInternal {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object]$NodeData,
        [Parameter(Mandatory=$true)]
        [PSCustomObject]$NodeSchema,
        [Parameter(Mandatory=$true)]
        [string]$CurrentPath,
        [Parameter(Mandatory=$true)]
        [ref]$ValidationErrors,
        [Parameter(Mandatory=$true)]
        [ref]$ValidationWarnings,
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$RootSchema,
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )

    try {
        $debugMode = $false
        if ($Context -and $Context.Config -and $Context.Config.advancedSettings) {
            $debugMode = $Context.Config.advancedSettings.debugMode
            if ($null -eq $debugMode) { $debugMode = $false }
        }

        if ($debugMode) {
            Write-MandALog -Message "Validating path: '$CurrentPath'. Schema type: '$($NodeSchema.type)'. Data type: '$($NodeData.GetType().Name)'" -Level "DEBUG" -Component "SchemaValidation" -Context $Context
        }

        # 1. Type Validation
        $expectedSchemaTypes = @()
        if ($NodeSchema.type -is [System.Collections.IEnumerable] -and -not ($NodeSchema.type -is [string])) {
            $expectedSchemaTypes = @($NodeSchema.type | ForEach-Object { $_ })
        } else {
            $expectedSchemaTypes = @($NodeSchema.type)
        }

        $actualDataType = ""
        if ($null -eq $NodeData) {
            $actualDataType = "null"
        } elseif ($NodeData -is [string]) {
            $actualDataType = "string"
        } elseif ($NodeData -is [int] -or $NodeData -is [long] -or $NodeData -is [double]) {
            $actualDataType = "integer"
            if ($NodeData -isnot [int] -and $NodeData -isnot [long]) { $actualDataType = "number" }
        } elseif ($NodeData -is [bool]) {
            $actualDataType = "boolean"
        } elseif ($NodeData -is [array]) {
            $actualDataType = "array"
        } elseif ($NodeData -is [hashtable] -or $NodeData -is [PSCustomObject]) {
            $actualDataType = "object"
        } else {
            $actualDataType = $NodeData.GetType().Name.ToLower()
        }

        $typeMatch = $false
        foreach ($expectedType in $expectedSchemaTypes) {
            if ($expectedType -eq "number" -and ($actualDataType -eq "integer" -or $actualDataType -eq "number")) {
                $typeMatch = $true; break
            }
            if ($actualDataType -eq $expectedType.ToLower()) {
                $typeMatch = $true; break
            }
        }
        if (-not $typeMatch) {
            $ValidationErrors.Value.Add("Path '$CurrentPath': Type mismatch. Expected type(s) '$($expectedSchemaTypes -join "' or '")' but found '$actualDataType'.")
            return
        }

        # 2. Enum Validation
        if ($NodeSchema.PSObject.Properties['enum']) {
            if (-not ($NodeSchema.enum -contains $NodeData)) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': Value '$NodeData' is not in the allowed enum list: $($NodeSchema.enum -join ', ').")
            }
        }

        # 3. Pattern Validation
        if ($actualDataType -eq "string" -and $NodeSchema.PSObject.Properties['pattern']) {
            if ($NodeData -notmatch $NodeSchema.pattern) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': Value '$NodeData' does not match pattern '$($NodeSchema.pattern)'.")
            }
        }

        # 4. Minimum/Maximum Validation
        if ($actualDataType -eq "integer" -or $actualDataType -eq "number") {
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

        # 5. MinLength/MaxLength Validation
        if ($actualDataType -eq "string") {
            if ($NodeSchema.PSObject.Properties['minLength'] -and $NodeData.Length -lt $NodeSchema.minLength) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': String length $($NodeData.Length) is less than minLength of $($NodeSchema.minLength).")
            }
            if ($NodeSchema.PSObject.Properties['maxLength'] -and $NodeData.Length -gt $NodeSchema.maxLength) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': String length $($NodeData.Length) is greater than maxLength of $($NodeSchema.maxLength).")
            }
        }

        # 6. MinItems/MaxItems Validation
        if ($actualDataType -eq "array") {
            if ($NodeSchema.PSObject.Properties['minItems'] -and $NodeData.Count -lt $NodeSchema.minItems) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': Array contains $($NodeData.Count) items, less than minItems of $($NodeSchema.minItems).")
            }
            if ($NodeSchema.PSObject.Properties['maxItems'] -and $NodeData.Count -gt $NodeSchema.maxItems) {
                $ValidationErrors.Value.Add("Path '$CurrentPath': Array contains $($NodeData.Count) items, more than maxItems of $($NodeSchema.maxItems).")
            }
        }

        # 7. Object-specific validations
        if ($actualDataType -eq "object") {
            # 7a. Required Properties
            if ($NodeSchema.PSObject.Properties['required'] -and $NodeSchema.required -is [array]) {
                foreach ($requiredProp in $NodeSchema.required) {
                    $hasProp = $false
                    if ($NodeData -is [hashtable]) {
                        $hasProp = $NodeData.ContainsKey($requiredProp)
                    } elseif ($NodeData.PSObject.Properties[$requiredProp]) {
                        $hasProp = $true
                    }
                    if (-not $hasProp) {
                        $ValidationErrors.Value.Add("Path '$CurrentPath': Missing required property '$requiredProp'.")
                    }
                }
            }

            # 7b. Validate defined properties
            if ($NodeSchema.PSObject.Properties['properties'] -and ($NodeSchema.properties -is [hashtable] -or $NodeSchema.properties -is [PSCustomObject])) {
                $propNames = @()
                if ($NodeSchema.properties -is [hashtable]) {
                    $propNames = $NodeSchema.properties.Keys
                } else {
                    $propNames = $NodeSchema.properties.PSObject.Properties.Name
                }
                foreach ($propKey in $propNames) {
                    $propSchema = $NodeSchema.properties.$propKey
                    $hasProp = $false
                    if ($NodeData -is [hashtable]) {
                        $hasProp = $NodeData.ContainsKey($propKey)
                    } elseif ($NodeData.PSObject.Properties[$propKey]) {
                        $hasProp = $true
                    }
                    if ($hasProp) {
                        Test-ConfigurationNodeInternal -NodeData $NodeData.$propKey -NodeSchema $propSchema -CurrentPath "$CurrentPath.$propKey" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
                    }
                }
            }

            # 7c. Additional Properties
            $allowAdditionalProperties = $true
            if ($NodeSchema.PSObject.Properties['additionalProperties']) {
                $allowAdditionalProperties = $NodeSchema.additionalProperties
            }
            $schemaDefinedProps = @()
            if ($NodeSchema.PSObject.Properties['properties']) {
                if ($NodeSchema.properties -is [hashtable]) {
                    $schemaDefinedProps = $NodeSchema.properties.Keys
                } else {
                    $schemaDefinedProps = $NodeSchema.properties.PSObject.Properties.Name
                }
            }
            $dataPropNames = @()
            if ($NodeData -is [hashtable]) {
                $dataPropNames = $NodeData.Keys
            } else {
                $dataPropNames = $NodeData.PSObject.Properties.Name
            }
            if ($allowAdditionalProperties -is [bool] -and -not $allowAdditionalProperties) {
                foreach ($dataPropKey in $dataPropNames) {
                    if (-not ($schemaDefinedProps -contains $dataPropKey)) {
                        $ValidationWarnings.Value.Add("Path '$CurrentPath': Property '$dataPropKey' is not defined in schema and additionalProperties is false.")
                    }
                }
            } elseif ($allowAdditionalProperties -is [hashtable] -or $allowAdditionalProperties -is [PSCustomObject]) {
                foreach ($dataPropKey in $dataPropNames) {
                    if (-not ($schemaDefinedProps -contains $dataPropKey)) {
                        Test-ConfigurationNodeInternal -NodeData $NodeData.$dataPropKey -NodeSchema $allowAdditionalProperties -CurrentPath "$CurrentPath.$dataPropKey (additional)" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
                    }
                }
            }
        }

        # 8. Array-specific validations (items)
        if ($actualDataType -eq "array" -and ($NodeSchema.PSObject.Properties['items'] -and ($NodeSchema.items -is [hashtable] -or $NodeSchema.items -is [PSCustomObject]))) {
            $itemSchema = $NodeSchema.items
            for ($i = 0; $i -lt $NodeData.Count; $i++) {
                Test-ConfigurationNodeInternal -NodeData $NodeData[$i] -NodeSchema $itemSchema -CurrentPath "$CurrentPath[$i]" -ValidationErrors $ValidationErrors -ValidationWarnings $ValidationWarnings -RootSchema $RootSchema -Context $Context
            }
        }
    } catch {
        Write-MandALog "Error in function 'Test-ConfigurationNodeInternal': $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-SuiteConfigurationAgainstSchema {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ConfigurationObject,
        [Parameter(Mandatory=$true)]
        [string]$SchemaPath,
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )

    $validationErrorsList = [System.Collections.Generic.List[string]]::new()
    $validationWarningsList = [System.Collections.Generic.List[string]]::new()
    $validationErrorsRef = [ref]$validationErrorsList
    $validationWarningsRef = [ref]$validationWarningsList

    Write-MandALog -Message "Starting configuration validation against schema: '$SchemaPath'" -Level "INFO" -Component "ConfigSchemaValidation" -Context $Context

    if (-not (Test-Path $SchemaPath -PathType Leaf)) {
        $validationErrorsList.Add("JSON Schema file not found at path: '$SchemaPath'. Cannot perform validation.")
        Write-MandALog -Message "JSON Schema file not found at: '$SchemaPath'." -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }

    $schemaJsonContent = $null
    try {
        $schemaJsonContent = Get-Content $SchemaPath -Raw | ConvertFrom-Json -ErrorAction Stop
    } catch {
        $validationErrorsList.Add("Failed to parse JSON Schema file '$SchemaPath'. Error: $($_.Exception.Message)")
        Write-MandALog -Message "Failed to parse JSON Schema file '$SchemaPath'. Error: $($_.Exception.Message)" -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }
    
    if ($null -eq $schemaJsonContent) {
        $validationErrorsList.Add("Parsed JSON Schema content is null from '$SchemaPath'.")
        Write-MandALog -Message "Parsed JSON Schema content is null from '$SchemaPath'." -Level "ERROR" -Component "ConfigSchemaValidation" -Context $Context
        return [PSCustomObject]@{ IsValid = $false; Errors = $validationErrorsList; Warnings = $validationWarningsList }
    }

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