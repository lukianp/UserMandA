# Advanced Discovery Module Validation System
# Comprehensive syntax validation, logical consistency checking, and structural analysis
# for all M&A Discovery Suite modules

param(
    [string]$ModulesPath = "Modules",
    [string]$CorePath = "Core",
    [string]$ConfigPath = "Configuration",
    [switch]$DetailedReport,
    [switch]$ExportResults
)

# Import required assemblies for advanced analysis
Add-Type -AssemblyName System.Management.Automation

# Validation result classes
class ValidationIssue {
    [string]$Severity
    [string]$Category
    [string]$File
    [int]$Line
    [string]$Message
    [string]$Recommendation
    [string]$Impact
}

class ModuleAnalysis {
    [string]$ModuleName
    [string]$ModulePath
    [string]$ModuleType
    [hashtable]$ExportedFunctions
    [hashtable]$Dependencies
    [hashtable]$ConfigurationParameters
    [array]$ValidationIssues
    [hashtable]$InterfaceContract
    [bool]$IsValid
}

class OrchestratorAnalysis {
    [string]$OrchestratorPath
    [hashtable]$ModuleInvocations
    [hashtable]$ErrorHandlingPatterns
    [hashtable]$ResourceManagement
    [array]$ValidationIssues
    [bool]$IsValid
}

# Global validation context
$script:ValidationContext = @{
    Issues = [System.Collections.Generic.List[ValidationIssue]]::new()
    ModuleAnalyses = @{}
    OrchestratorAnalysis = $null
    ConfigurationSchema = $null
    StartTime = Get-Date
}

function Write-ValidationLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Validator"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] [$Component] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARN" { Write-Host $logMessage -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        default { Write-Host $logMessage -ForegroundColor Gray }
    }
}

function Add-ValidationIssue {
    param(
        [string]$Severity,
        [string]$Category,
        [string]$File,
        [int]$Line = 0,
        [string]$Message,
        [string]$Recommendation = "",
        [string]$Impact = ""
    )
    
    $issue = [ValidationIssue]@{
        Severity = $Severity
        Category = $Category
        File = $File
        Line = $Line
        Message = $Message
        Recommendation = $Recommendation
        Impact = $Impact
    }
    
    $script:ValidationContext.Issues.Add($issue)
}

function Test-PowerShellSyntax {
    param([string]$FilePath, [string]$Content)
    
    Write-ValidationLog "Analyzing PowerShell syntax for $FilePath" "INFO" "SyntaxChecker"
    
    try {
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($Content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -gt 0) {
            foreach ($error in $parseErrors) {
                Add-ValidationIssue -Severity "ERROR" -Category "Syntax" -File $FilePath -Line $error.Extent.StartLineNumber -Message $error.Message -Recommendation "Fix syntax error before deployment" -Impact "Module will fail to load"
            }
            return $false
        }
        
        # Advanced AST analysis
        Test-ASTStructure -AST $ast -FilePath $FilePath
        
        return $true
    } catch {
        Add-ValidationIssue -Severity "ERROR" -Category "Syntax" -File $FilePath -Message "Failed to parse PowerShell syntax: $($_.Exception.Message)" -Impact "Module cannot be analyzed"
        return $false
    }
}

function Test-ASTStructure {
    param($AST, [string]$FilePath)
    
    # Check for potential infinite loops
    $whileLoops = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.WhileStatementAst]}, $true)
    foreach ($loop in $whileLoops) {
        if (-not (Test-LoopTermination -LoopAst $loop)) {
            Add-ValidationIssue -Severity "WARN" -Category "Logic" -File $FilePath -Line $loop.Extent.StartLineNumber -Message "Potential infinite loop detected" -Recommendation "Ensure loop has proper termination condition" -Impact "May cause module to hang"
        }
    }
    
    # Check for proper error handling
    $tryBlocks = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
    $functionDefs = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst]}, $true)
    
    foreach ($func in $functionDefs) {
        $funcTryBlocks = $func.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
        if ($funcTryBlocks.Count -eq 0 -and $func.Name -notmatch "^(Get-|Test-|New-)" -and $func.Body.ToString().Length -gt 500) {
            Add-ValidationIssue -Severity "WARN" -Category "ErrorHandling" -File $FilePath -Line $func.Extent.StartLineNumber -Message "Function '$($func.Name)' lacks error handling" -Recommendation "Add try-catch blocks for robust error handling" -Impact "Unhandled exceptions may crash discovery process"
        }
    }
    
    # Check for resource cleanup
    Test-ResourceCleanup -AST $AST -FilePath $FilePath
}

function Test-LoopTermination {
    param($LoopAst)
    
    # Basic heuristic: check if loop condition contains variables that are modified in loop body
    $condition = $LoopAst.Condition.ToString()
    $body = $LoopAst.Body.ToString()
    
    # Look for common termination patterns
    if ($condition -match '\$\w+' -and $body -match '(\$\w+\+\+|\$\w+\-\-|\$\w+\s*=|\$\w+\s*\+=|\$\w+\s*\-=)') {
        return $true
    }
    
    # Check for break statements
    if ($body -match '\bbreak\b') {
        return $true
    }
    
    return $false
}

function Test-ResourceCleanup {
    param($AST, [string]$FilePath)
    
    # Look for resource allocation patterns
    $resourcePatterns = @(
        'New-Object\s+System\.IO\.'
        'New-Object\s+System\.Net\.'
        '\[System\.IO\.File\]::',
        'Get-WmiObject',
        'Get-CimInstance',
        'Invoke-RestMethod',
        'Invoke-WebRequest'
    )
    
    $content = $AST.ToString()
    foreach ($pattern in $resourcePatterns) {
        if ($content -match $pattern) {
            # Check if there's corresponding cleanup
            $hasFinally = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst] -and $args[0].Finally}, $true).Count -gt 0
            $hasUsing = $content -match '\busing\s*\('
            $hasDispose = $content -match '\.Dispose\(\)'
            
            if (-not ($hasFinally -or $hasUsing -or $hasDispose)) {
                Add-ValidationIssue -Severity "WARN" -Category "ResourceManagement" -File $FilePath -Message "Resource allocation detected without explicit cleanup" -Recommendation "Implement proper resource disposal in finally blocks" -Impact "Potential memory leaks"
            }
        }
    }
}

function Test-ModuleInterface {
    param([string]$ModulePath, [string]$Content)
    
    Write-ValidationLog "Analyzing module interface for $ModulePath" "INFO" "InterfaceChecker"
    
    $analysis = [ModuleAnalysis]@{
        ModuleName = [System.IO.Path]::GetFileNameWithoutExtension($ModulePath)
        ModulePath = $ModulePath
        ModuleType = Get-ModuleType -ModulePath $ModulePath
        ExportedFunctions = @{}
        Dependencies = @{}
        ConfigurationParameters = @{}
        ValidationIssues = @()
        InterfaceContract = @{}
        IsValid = $true
    }
    
    try {
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($Content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -eq 0) {
            # Analyze exported functions
            $exportStatements = $ast.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Export-ModuleMember"}, $true)
            foreach ($export in $exportStatements) {
                $functionParam = $export.CommandElements | Where-Object {$_.ToString() -like "*Function*"}
                if ($functionParam) {
                    $functions = $functionParam.ToString() -replace '.*-Function\s+', '' -split ','
                    foreach ($func in $functions) {
                        $funcName = $func.Trim()
                        $analysis.ExportedFunctions[$funcName] = @{
                            Name = $funcName
                            Parameters = @()
                            ReturnType = "Unknown"
                            ErrorHandling = $false
                        }
                    }
                }
            }
            
            # Analyze function definitions
            $functionDefs = $ast.FindAll({$args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst]}, $true)
            foreach ($func in $functionDefs) {
                if ($analysis.ExportedFunctions.ContainsKey($func.Name)) {
                    $analysis.ExportedFunctions[$func.Name].Parameters = Get-FunctionParameters -FunctionAst $func
                    $analysis.ExportedFunctions[$func.Name].ErrorHandling = Test-FunctionErrorHandling -FunctionAst $func
                }
            }
            
            # Analyze dependencies
            $analysis.Dependencies = Get-ModuleDependencies -AST $ast -ModulePath $ModulePath
            
            # Analyze configuration parameters
            $analysis.ConfigurationParameters = Get-ConfigurationUsage -AST $ast
            
            # Validate interface contract
            Test-InterfaceContract -Analysis $analysis
        }
        
    } catch {
        Add-ValidationIssue -Severity "ERROR" -Category "Interface" -File $ModulePath -Message "Failed to analyze module interface: $($_.Exception.Message)" -Impact "Cannot validate module compatibility"
        $analysis.IsValid = $false
    }
    
    return $analysis
}

function Get-ModuleType {
    param([string]$ModulePath)
    
    $pathParts = $ModulePath -split [System.IO.Path]::DirectorySeparatorChar
    if ($pathParts -contains "Discovery") { return "Discovery" }
    if ($pathParts -contains "Processing") { return "Processing" }
    if ($pathParts -contains "Export") { return "Export" }
    if ($pathParts -contains "Utilities") { return "Utilities" }
    if ($pathParts -contains "Authentication") { return "Authentication" }
    if ($pathParts -contains "Connectivity") { return "Connectivity" }
    return "Unknown"
}

function Get-FunctionParameters {
    param($FunctionAst)
    
    $parameters = @()
    if ($FunctionAst.Body.ParamBlock) {
        foreach ($param in $FunctionAst.Body.ParamBlock.Parameters) {
            $parameters += @{
                Name = $param.Name.VariablePath.UserPath
                Type = if ($param.StaticType) { $param.StaticType.Name } else { "Object" }
                Mandatory = $param.Attributes | Where-Object {$_.TypeName.Name -eq "Parameter" -and $_.NamedArguments | Where-Object {$_.ArgumentName -eq "Mandatory" -and $_.Argument.Value -eq $true}}
                DefaultValue = if ($param.DefaultValue) { $param.DefaultValue.ToString() } else { $null }
            }
        }
    }
    return $parameters
}

function Test-FunctionErrorHandling {
    param($FunctionAst)
    
    $tryBlocks = $FunctionAst.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
    return $tryBlocks.Count -gt 0
}

function Get-ModuleDependencies {
    param($AST, [string]$ModulePath)
    
    $dependencies = @{}
    
    # Look for Import-Module statements
    $importCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Import-Module"}, $true)
    foreach ($import in $importCommands) {
        $moduleNameElement = $import.CommandElements[1]
        if ($moduleNameElement) {
            $moduleName = $moduleNameElement.ToString().Trim('"', "'")
            $dependencies[$moduleName] = @{
                Type = "Import"
                Required = $true
                Source = "Import-Module"
            }
        }
    }
    
    # Look for function calls to other modules
    $commandCalls = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst]}, $true)
    foreach ($call in $commandCalls) {
        $commandName = $call.GetCommandName()
        if ($commandName -and $commandName -match '^(Write-MandALog|Get-MandAConfig|New-DiscoveryResult)') {
            $dependencies[$commandName] = @{
                Type = "Function"
                Required = $true
                Source = "Function Call"
            }
        }
    }
    
    return $dependencies
}

function Get-ConfigurationUsage {
    param($AST)
    
    $configUsage = @{}
    
    # Look for configuration access patterns
    $variableRefs = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.VariableExpressionAst]}, $true)
    foreach ($var in $variableRefs) {
        if ($var.VariablePath.UserPath -match '^(Config|Configuration|Context)') {
            $configUsage[$var.VariablePath.UserPath] = @{
                Usage = "Variable Access"
                Required = $true
            }
        }
    }
    
    return $configUsage
}

function Test-InterfaceContract {
    param([ModuleAnalysis]$Analysis)
    
    # Validate discovery module contract
    if ($Analysis.ModuleType -eq "Discovery") {
        $requiredFunctions = @("Invoke-Discovery", "Get-DiscoveryInfo")
        foreach ($required in $requiredFunctions) {
            if (-not $Analysis.ExportedFunctions.ContainsKey($required)) {
                Add-ValidationIssue -Severity "ERROR" -Category "Interface" -File $Analysis.ModulePath -Message "Discovery module missing required function: $required" -Recommendation "Implement required discovery interface functions" -Impact "Module cannot be invoked by orchestrator"
                $Analysis.IsValid = $false
            }
        }
    }
    
    # Validate processing module contract
    if ($Analysis.ModuleType -eq "Processing") {
        # Check for proper parameter patterns
        foreach ($func in $Analysis.ExportedFunctions.Values) {
            if ($func.Parameters.Count -eq 0) {
                Add-ValidationIssue -Severity "WARN" -Category "Interface" -File $Analysis.ModulePath -Message "Function '$($func.Name)' has no parameters" -Recommendation "Consider if function needs input parameters" -Impact "May indicate incomplete implementation"
            }
        }
    }
}

function Test-OrchestratorPatterns {
    param([string]$OrchestratorPath, [string]$Content)
    
    Write-ValidationLog "Analyzing orchestrator patterns in $OrchestratorPath" "INFO" "OrchestratorChecker"
    
    $analysis = [OrchestratorAnalysis]@{
        OrchestratorPath = $OrchestratorPath
        ModuleInvocations = @{}
        ErrorHandlingPatterns = @{}
        ResourceManagement = @{}
        ValidationIssues = @()
        IsValid = $true
    }
    
    try {
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($Content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -eq 0) {
            # Analyze module invocation patterns
            Test-ModuleInvocations -AST $ast -Analysis $analysis
            
            # Analyze error handling patterns
            Test-OrchestratorErrorHandling -AST $ast -Analysis $analysis
            
            # Analyze resource management
            Test-OrchestratorResourceManagement -AST $ast -Analysis $analysis
            
            # Analyze lifecycle management
            Test-ModuleLifecycleManagement -AST $ast -Analysis $analysis
        }
        
    } catch {
        Add-ValidationIssue -Severity "ERROR" -Category "Orchestrator" -File $OrchestratorPath -Message "Failed to analyze orchestrator: $($_.Exception.Message)" -Impact "Cannot validate orchestrator patterns"
        $analysis.IsValid = $false
    }
    
    $script:ValidationContext.OrchestratorAnalysis = $analysis
    return $analysis
}

function Test-ModuleInvocations {
    param($AST, [OrchestratorAnalysis]$Analysis)
    
    # Look for module invocation patterns
    $commandCalls = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst]}, $true)
    
    foreach ($call in $commandCalls) {
        $commandName = $call.GetCommandName()
        if ($commandName -and $commandName -match '^(Invoke-|Start-|New-).*Discovery') {
            $Analysis.ModuleInvocations[$commandName] = @{
                CallCount = ($commandCalls | Where-Object {$_.GetCommandName() -eq $commandName}).Count
                Parameters = Get-CommandParameters -CommandAst $call
                ErrorHandling = Test-CommandErrorHandling -CommandAst $call
            }
            
            # Validate parameter usage
            if (-not (Test-CommandParameterValidation -CommandAst $call)) {
                Add-ValidationIssue -Severity "WARN" -Category "Orchestrator" -File $Analysis.OrchestratorPath -Line $call.Extent.StartLineNumber -Message "Module invocation '$commandName' may have parameter issues" -Recommendation "Verify parameter names and types match module interface" -Impact "Module calls may fail at runtime"
            }
        }
    }
}

function Get-CommandParameters {
    param($CommandAst)
    
    $parameters = @{}
    for ($i = 1; $i -lt $CommandAst.CommandElements.Count; $i++) {
        $element = $CommandAst.CommandElements[$i]
        if ($element.ToString().StartsWith('-')) {
            $paramName = $element.ToString().TrimStart('-')
            $paramValue = if ($i + 1 -lt $CommandAst.CommandElements.Count) { $CommandAst.CommandElements[$i + 1].ToString() } else { $null }
            $parameters[$paramName] = $paramValue
            $i++ # Skip the value element
        }
    }
    return $parameters
}

function Test-CommandErrorHandling {
    param($CommandAst)
    
    # Check if command is within try-catch block
    $parent = $CommandAst.Parent
    while ($parent) {
        if ($parent -is [System.Management.Automation.Language.TryStatementAst]) {
            return $true
        }
        $parent = $parent.Parent
    }
    
    # Check for -ErrorAction parameter
    $errorActionParam = $CommandAst.CommandElements | Where-Object {$_.ToString() -eq "-ErrorAction"}
    return $null -ne $errorActionParam
}

function Test-CommandParameterValidation {
    param($CommandAst)
    
    # Basic validation - check for common parameter patterns
    $hasValidParams = $false
    foreach ($element in $CommandAst.CommandElements) {
        if ($element.ToString() -match '^-(Context|Config|ModuleName|Force)$') {
            $hasValidParams = $true
            break
        }
    }
    
    return $hasValidParams
}

function Test-OrchestratorErrorHandling {
    param($AST, [OrchestratorAnalysis]$Analysis)
    
    $tryBlocks = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
    $Analysis.ErrorHandlingPatterns["TryBlockCount"] = $tryBlocks.Count
    
    foreach ($tryBlock in $tryBlocks) {
        if (-not $tryBlock.CatchClauses -or $tryBlock.CatchClauses.Count -eq 0) {
            Add-ValidationIssue -Severity "WARN" -Category "ErrorHandling" -File $Analysis.OrchestratorPath -Line $tryBlock.Extent.StartLineNumber -Message "Try block without catch clause" -Recommendation "Add appropriate catch handling" -Impact "Errors may not be properly handled"
        }
    }
}

function Test-OrchestratorResourceManagement {
    param($AST, [OrchestratorAnalysis]$Analysis)
    
    # Look for runspace management
    $runspacePatterns = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -match "Runspace"}, $true)
    $Analysis.ResourceManagement["RunspaceUsage"] = $runspacePatterns.Count
    
    # Check for proper cleanup
    $disposePatterns = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.MemberExpressionAst] -and $args[0].Member.Value -eq "Dispose"}, $true)
    $Analysis.ResourceManagement["DisposeCallCount"] = $disposePatterns.Count
    
    if ($runspacePatterns.Count -gt 0 -and $disposePatterns.Count -eq 0) {
        Add-ValidationIssue -Severity "WARN" -Category "ResourceManagement" -File $Analysis.OrchestratorPath -Message "Runspace usage detected without explicit disposal" -Recommendation "Implement proper runspace cleanup" -Impact "Potential resource leaks"
    }
}

function Test-ModuleLifecycleManagement {
    param($AST, [OrchestratorAnalysis]$Analysis)
    
    # Look for module loading/unloading patterns
    $importCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Import-Module"}, $true)
    $removeCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Remove-Module"}, $true)
    
    if ($importCommands.Count -gt 0 -and $removeCommands.Count -eq 0) {
        Add-ValidationIssue -Severity "INFO" -Category "Lifecycle" -File $Analysis.OrchestratorPath -Message "Modules imported but not explicitly removed" -Recommendation "Consider implementing module cleanup for better resource management" -Impact "Minor - modules will be cleaned up at session end"
    }
}

function Test-InterModuleDependencies {
    Write-ValidationLog "Analyzing inter-module dependencies" "INFO" "DependencyChecker"
    
    $allModules = $script:ValidationContext.ModuleAnalyses.Values
    
    foreach ($module in $allModules) {
        foreach ($dependency in $module.Dependencies.Keys) {
            $dependencyFound = $false
            
            # Check if dependency is satisfied by another module
            foreach ($otherModule in $allModules) {
                if ($otherModule.ExportedFunctions.ContainsKey($dependency) -or $otherModule.ModuleName -eq $dependency) {
                    $dependencyFound = $true
                    break
                }
            }
            
            # Check if it's a built-in or external dependency
            if (-not $dependencyFound -and $dependency -notmatch '^(Microsoft\.|System\.|Write-Host|Get-Date)') {
                Add-ValidationIssue -Severity "WARN" -Category "Dependencies" -File $module.ModulePath -Message "Unresolved dependency: $dependency" -Recommendation "Ensure required module is available or implement missing function" -Impact "Module may fail at runtime"
            }
        }
    }
}

function Test-ConfigurationCompatibility {
    Write-ValidationLog "Analyzing configuration compatibility" "INFO" "ConfigChecker"
    
    # Load configuration schema if available
    $configSchemaPath = Join-Path $ConfigPath "config.schema.json"
    if (Test-Path $configSchemaPath) {
        try {
            $configSchema = Get-Content $configSchemaPath | ConvertFrom-Json
            $script:ValidationContext.ConfigurationSchema = $configSchema
            
            # Validate configuration usage against schema
            foreach ($module in $script:ValidationContext.ModuleAnalyses.Values) {
                foreach ($configParam in $module.ConfigurationParameters.Keys) {
                    # Basic validation - could be enhanced with JSON schema validation
                    if ($configParam -notmatch '^(Config|Configuration|Context)') {
                        Add-ValidationIssue -Severity "INFO" -Category "Configuration" -File $module.ModulePath -Message "Non-standard configuration parameter: $configParam" -Recommendation "Use standard configuration access patterns" -Impact "May indicate configuration inconsistency"
                    }
                }
            }
        } catch {
            Add-ValidationIssue -Severity "WARN" -Category "Configuration" -File $configSchemaPath -Message "Failed to load configuration schema: $($_.Exception.Message)" -Impact "Cannot validate configuration compatibility"
        }
    }
}

function Invoke-StaticCodeAnalysis {
    Write-ValidationLog "Performing static code analysis" "INFO" "StaticAnalyzer"
    
    foreach ($module in $script:ValidationContext.ModuleAnalyses.Values) {
        if (Test-Path $module.ModulePath) {
            $content = Get-Content $module.ModulePath -Raw
            
            # Check for potential race conditions
            if ($content -match '\$global:' -and $content -match 'Start-Job|Invoke-Parallel') {
                Add-ValidationIssue -Severity "WARN" -Category "Concurrency" -File $module.ModulePath -Message "Global variable usage in concurrent context" -Recommendation "Use thread-safe patterns or local variables" -Impact "Potential race conditions"
            }
            
            # Check for hardcoded paths
            if ($content -match '[A-Z]:\\\\|/[a-z]+/') {
                Add-ValidationIssue -Severity "WARN" -Category "Portability" -File $module.ModulePath -Message "Hardcoded file paths detected" -Recommendation "Use relative paths or configuration parameters" -Impact "Reduced portability"
            }
            
            # Check for potential memory leaks
            if ($content -match 'New-Object.*\[\]' -and $content -notmatch '\.Dispose\(\)') {
                Add-ValidationIssue -Severity "INFO" -Category "Memory" -File $module.ModulePath -Message "Large object allocation without explicit disposal" -Recommendation "Consider implementing disposal pattern" -Impact "Potential memory usage"
            }
        }
    }
}

function Export-ValidationResults {
    param([string]$OutputPath = "ValidationResults")
    
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # Export summary report
    $summaryPath = Join-Path $OutputPath "ValidationSummary_$timestamp.json"
    $summary = @{
        Timestamp = Get-Date
        TotalIssues = $script:ValidationContext.Issues.Count
        IssuesBySeverity = $script:ValidationContext.Issues | Group-Object Severity | ForEach-Object { @{$_.Name = $_.Count} }
        IssuesByCategory = $script:ValidationContext.Issues | Group-Object Category | ForEach-Object { @{$_.Name = $_.Count} }
        ModulesAnalyzed = $script:ValidationContext.ModuleAnalyses.Count
        ValidationDuration = (Get-Date) - $script:ValidationContext.StartTime
    }
    $summary | ConvertTo-Json -Depth 3 | Set-Content $summaryPath
    
    # Export detailed issues
    $issuesPath = Join-Path $OutputPath "ValidationIssues_$timestamp.csv"
    $script:ValidationContext.Issues | Export-Csv $issuesPath -NoTypeInformation
    
    # Export module analysis
    $modulesPath = Join-Path $OutputPath "ModuleAnalysis_$timestamp.json"
    $script:ValidationContext.ModuleAnalyses | ConvertTo-Json -Depth 5 | Set-Content $modulesPath
    
    Write-ValidationLog "Validation results exported to $OutputPath" "SUCCESS" "Exporter"
}

function Show-ValidationSummary {
    $totalIssues = $script:ValidationContext.Issues.Count
    $errorCount = ($script:ValidationContext.Issues | Where-Object {$_.Severity -eq "ERROR"}).Count
    $warnCount = ($script:ValidationContext.Issues | Where-Object {$_.Severity -eq "WARN"}).Count
    $infoCount = ($script:ValidationContext.Issues | Where-Object {$_.Severity -eq "INFO"}).Count
    
    Write-Host "`n" + ("="*80) -ForegroundColor Cyan
    Write-Host "COMPREHENSIVE VALIDATION SUMMARY" -ForegroundColor Cyan
    Write-Host ("="*80) -ForegroundColor Cyan
    
    Write-Host "Validation Duration: $((Get-Date) - $script:ValidationContext.StartTime)" -ForegroundColor Gray
    Write-Host "Modules Analyzed: $($script:ValidationContext.ModuleAnalyses.Count)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "ISSUE SUMMARY:" -ForegroundColor White
    Write-Host "  Total Issues: $totalIssues" -ForegroundColor White
    Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
    Write-Host "  Warnings: $warnCount" -ForegroundColor $(if ($warnCount -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  Info: $infoCount" -ForegroundColor Gray
    Write-Host ""
    
    if ($DetailedReport) {
        Write-Host "ISSUES BY CATEGORY:" -ForegroundColor White
        $categoryGroups = $script:ValidationContext.Issues | Group-Object Category
        foreach ($group in $categoryGroups) {
            Write-Host "  $($group.Name): $($group.Count)" -ForegroundColor Gray
        }
        Write-Host ""
        
        if ($errorCount -gt 0) {
            Write-Host "CRITICAL ERRORS:" -ForegroundColor Red
            $errors = $script:ValidationContext.Issues | Where-Object {$_.Severity -eq "ERROR"}
            foreach ($error in $errors) {
                Write-Host "  [$($error.File):$($error.Line)] $($error.Message)" -ForegroundColor Red
            }
            Write-Host ""
        }
    }
    
    # Overall status
    if ($errorCount -eq 0) {
        Write-Host "âœ… VALIDATION PASSED" -ForegroundColor Green
        if ($warnCount -gt 0) {
            Write-Host "âš ï¸  $warnCount warnings found - review recommended" -ForegroundColor Yellow
        }
    } else {
        Write-Host "âŒ VALIDATION FAILED" -ForegroundColor Red
        Write-Host "$errorCount critical errors must be resolved before deployment" -ForegroundColor Red
    }
    
    Write-Host ("="*80) -ForegroundColor Cyan
}

# Main execution function
function Start-ComprehensiveValidation {
    Write-ValidationLog "Starting comprehensive discovery module validation" "INFO" "Main"
    
    # Discover all modules
    $discoveryModules = Get-ChildItem -Path (Join-Path $ModulesPath "Discovery") -Filter "*.psm1" -ErrorAction SilentlyContinue
    $processingModules = Get-ChildItem -Path (Join-Path $ModulesPath "Processing") -Filter "*.psm1" -ErrorAction SilentlyContinue
    $exportModules = Get-ChildItem -Path (Join-Path $ModulesPath "Export") -Filter "*.psm1" -ErrorAction SilentlyContinue
    $utilityModules = Get-ChildItem -Path (Join-Path $ModulesPath "Utilities") -Filter "*.psm1" -ErrorAction SilentlyContinue
    $authModules = Get-ChildItem -Path (Join-Path $ModulesPath "Authentication") -Filter "*.psm1" -ErrorAction SilentlyContinue
    $connectivityModules = Get-ChildItem -Path (Join-Path $ModulesPath "Connectivity") -Filter "*.psm1" -ErrorAction SilentlyContinue
    
    $allModules = @()
    $allModules += $discoveryModules
    $allModules += $processingModules
    $allModules += $exportModules
    $allModules += $utilityModules
    $allModules += $authModules
    $allModules += $connectivityModules
    
    Write-ValidationLog "Found $($allModules.Count) modules to validate" "INFO" "Main"
    
    # Phase 1: Syntax and structure validation
    Write-ValidationLog "Phase 1: Syntax and structure validation" "INFO" "Main"
    foreach ($module in $allModules) {
        try {
            $content = Get-Content $module.FullName -Raw -Encoding UTF8
            
            # Test PowerShell syntax
            $syntaxValid = Test-PowerShellSyntax -FilePath $module.FullName -Content $content
            
            # Analyze module interface
            if ($syntaxValid) {
                $moduleAnalysis = Test-ModuleInterface -ModulePath $module.FullName -Content $content
                $script:ValidationContext.ModuleAnalyses[$module.Name] = $moduleAnalysis
            }
            
        } catch {
            Add-ValidationIssue -Severity "ERROR" -Category "General" -File $module.FullName -Message "Failed to process module: $($_.Exception.Message)" -Impact "Module cannot be validated"
        }
    }
    
    # Phase 2: Orchestrator analysis
    Write-ValidationLog "Phase 2: Orchestrator analysis" "INFO" "Main"
    $orchestratorPath = Join-Path $CorePath "MandA-Orchestrator.ps1"
    if (Test-Path $orchestratorPath) {
        $orchestratorContent = Get-Content $orchestratorPath -Raw -Encoding UTF8
        Test-OrchestratorPatterns -OrchestratorPath $orchestratorPath -Content $orchestratorContent
    } else {
        Add-ValidationIssue -Severity "ERROR" -Category "Orchestrator" -File $orchestratorPath -Message "Orchestrator file not found" -Impact "Cannot validate orchestrator patterns"
    }
    
    # Phase 3: Inter-module dependency analysis
    Write-ValidationLog "Phase 3: Inter-module dependency analysis" "INFO" "Main"
    Test-InterModuleDependencies
    
    # Phase 4: Configuration compatibility
    Write-ValidationLog "Phase 4: Configuration compatibility analysis" "INFO" "Main"
    Test-ConfigurationCompatibility
    
    # Phase 5: Static code analysis
    Write-ValidationLog "Phase 5: Static code analysis" "INFO" "Main"
    Invoke-StaticCodeAnalysis
    
    # Generate results
    Show-ValidationSummary
    
    if ($ExportResults) {
        Export-ValidationResults
    }
    
    # Return exit code based on validation results
    $errorCount = ($script:ValidationContext.Issues | Where-Object {$_.Severity -eq "ERROR"}).Count
    if ($errorCount -gt 0) {
        exit 1
    } else {
        exit 0
    }
}

# Execute main validation
Start-ComprehensiveValidation
