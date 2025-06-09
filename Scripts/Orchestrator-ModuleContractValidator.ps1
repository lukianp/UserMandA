# Orchestrator-Module Contract Validation System
# Analyzes orchestrator invocation patterns and validates module interface contracts

param(
    [string]$OrchestratorPath = "Core/MandA-Orchestrator.ps1",
    [string]$ModulesPath = "Modules",
    [switch]$DetailedAnalysis,
    [switch]$ExportReport
)

# Contract validation classes
class ModuleContract {
    [string]$ModuleName
    [string]$ModuleType
    [hashtable]$RequiredFunctions
    [hashtable]$ExpectedParameters
    [hashtable]$ReturnValueContract
    [hashtable]$ErrorHandlingContract
    [array]$ConfigurationDependencies
}

class InvocationPattern {
    [string]$FunctionName
    [hashtable]$Parameters
    [string]$ErrorHandling
    [string]$ReturnValueUsage
    [int]$LineNumber
    [string]$Context
}

class ContractViolation {
    [string]$Severity
    [string]$Type
    [string]$ModuleName
    [string]$FunctionName
    [string]$Description
    [string]$ExpectedContract
    [string]$ActualUsage
    [string]$Recommendation
    [int]$LineNumber
}

# Global validation context
$script:ContractContext = @{
    ModuleContracts = @{}
    InvocationPatterns = @{}
    Violations = [System.Collections.Generic.List[ContractViolation]]::new()
    OrchestratorAST = $null
}

function Write-ContractLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Add-ContractViolation {
    param(
        [string]$Severity,
        [string]$Type,
        [string]$ModuleName,
        [string]$FunctionName = "",
        [string]$Description,
        [string]$ExpectedContract = "",
        [string]$ActualUsage = "",
        [string]$Recommendation = "",
        [int]$LineNumber = 0
    )
    
    $violation = [ContractViolation]@{
        Severity = $Severity
        Type = $Type
        ModuleName = $ModuleName
        FunctionName = $FunctionName
        Description = $Description
        ExpectedContract = $ExpectedContract
        ActualUsage = $ActualUsage
        Recommendation = $Recommendation
        LineNumber = $LineNumber
    }
    
    $script:ContractContext.Violations.Add($violation)
}

function Initialize-ModuleContracts {
    Write-ContractLog "Initializing module contracts" "INFO"
    
    # Discovery Module Contract
    $script:ContractContext.ModuleContracts["Discovery"] = [ModuleContract]@{
        ModuleName = "Discovery"
        ModuleType = "Discovery"
        RequiredFunctions = @{
            "Invoke-Discovery" = @{
                Required = $true
                Parameters = @("Context", "ModuleName")
                ReturnType = "DiscoveryResult"
            }
            "Get-DiscoveryInfo" = @{
                Required = $true
                Parameters = @()
                ReturnType = "Hashtable"
            }
        }
        ExpectedParameters = @{
            "Context" = @{ Type = "Hashtable"; Required = $true }
            "ModuleName" = @{ Type = "String"; Required = $true }
            "Force" = @{ Type = "Switch"; Required = $false }
        }
        ReturnValueContract = @{
            "Invoke-Discovery" = @{
                Type = "DiscoveryResult"
                Properties = @("ModuleName", "Success", "Data", "ErrorInfo", "StartTime", "EndTime", "Duration")
            }
        }
        ErrorHandlingContract = @{
            "ExceptionPropagation" = "Must catch and wrap in DiscoveryResult"
            "ErrorLogging" = "Must log errors using Write-MandALog"
            "GracefulFailure" = "Must return valid DiscoveryResult even on failure"
        }
        ConfigurationDependencies = @("discovery", "authentication", "connectivity")
    }
    
    # Processing Module Contract
    $script:ContractContext.ModuleContracts["Processing"] = [ModuleContract]@{
        ModuleName = "Processing"
        ModuleType = "Processing"
        RequiredFunctions = @{
            "Process-Data" = @{
                Required = $true
                Parameters = @("InputData", "Configuration")
                ReturnType = "ProcessingResult"
            }
        }
        ExpectedParameters = @{
            "InputData" = @{ Type = "Object"; Required = $true }
            "Configuration" = @{ Type = "Hashtable"; Required = $true }
        }
        ReturnValueContract = @{
            "Process-Data" = @{
                Type = "Object"
                Properties = @("Success", "Data", "ErrorInfo")
            }
        }
        ErrorHandlingContract = @{
            "ExceptionPropagation" = "Must handle exceptions gracefully"
            "ErrorLogging" = "Must log processing errors"
        }
        ConfigurationDependencies = @("processing")
    }
    
    # Export Module Contract
    $script:ContractContext.ModuleContracts["Export"] = [ModuleContract]@{
        ModuleName = "Export"
        ModuleType = "Export"
        RequiredFunctions = @{
            "Export-Data" = @{
                Required = $true
                Parameters = @("Data", "OutputPath", "Format")
                ReturnType = "ExportResult"
            }
        }
        ExpectedParameters = @{
            "Data" = @{ Type = "Object"; Required = $true }
            "OutputPath" = @{ Type = "String"; Required = $true }
            "Format" = @{ Type = "String"; Required = $false }
        }
        ReturnValueContract = @{
            "Export-Data" = @{
                Type = "Object"
                Properties = @("Success", "FilePath", "ErrorInfo")
            }
        }
        ErrorHandlingContract = @{
            "FileOperations" = "Must handle file I/O errors"
            "PathValidation" = "Must validate output paths"
        }
        ConfigurationDependencies = @("export", "output")
    }
}

function Analyze-OrchestratorInvocations {
    param([string]$OrchestratorPath)
    
    Write-ContractLog "Analyzing orchestrator invocation patterns" "INFO"
    
    if (-not (Test-Path $OrchestratorPath)) {
        Add-ContractViolation -Severity "ERROR" -Type "FileNotFound" -ModuleName "Orchestrator" -Description "Orchestrator file not found at $OrchestratorPath"
        return
    }
    
    try {
        $content = Get-Content $OrchestratorPath -Raw -Encoding UTF8
        $tokens = $null
        $parseErrors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput($content, [ref]$tokens, [ref]$parseErrors)
        
        if ($parseErrors.Count -gt 0) {
            foreach ($error in $parseErrors) {
                Add-ContractViolation -Severity "ERROR" -Type "SyntaxError" -ModuleName "Orchestrator" -Description $error.Message -LineNumber $error.Extent.StartLineNumber
            }
            return
        }
        
        $script:ContractContext.OrchestratorAST = $ast
        
        # Analyze function calls
        Analyze-FunctionCalls -AST $ast
        
        # Analyze module loading patterns
        Analyze-ModuleLoadingPatterns -AST $ast
        
        # Analyze error handling patterns
        Analyze-ErrorHandlingPatterns -AST $ast
        
        # Analyze return value usage
        Analyze-ReturnValueUsage -AST $ast
        
    } catch {
        Add-ContractViolation -Severity "ERROR" -Type "AnalysisError" -ModuleName "Orchestrator" -Description "Failed to analyze orchestrator: $($_.Exception.Message)"
    }
}

function Analyze-FunctionCalls {
    param($AST)
    
    Write-ContractLog "Analyzing function call patterns" "INFO"
    
    $commandCalls = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst]}, $true)
    
    foreach ($call in $commandCalls) {
        $commandName = $call.GetCommandName()
        
        # Look for discovery module invocations
        if ($commandName -match '^(Invoke-.*Discovery|.*Discovery\.psm1)') {
            $invocation = Analyze-DiscoveryInvocation -CommandAst $call
            $script:ContractContext.InvocationPatterns[$commandName] = $invocation
            
            # Validate against contract
            Validate-DiscoveryInvocation -Invocation $invocation -CommandAst $call
        }
        
        # Look for processing module invocations
        if ($commandName -match '^(New-UserProfiles|Measure-MigrationComplexity|New-MigrationWaves)') {
            $invocation = Analyze-ProcessingInvocation -CommandAst $call
            $script:ContractContext.InvocationPatterns[$commandName] = $invocation
            
            # Validate against contract
            Validate-ProcessingInvocation -Invocation $invocation -CommandAst $call
        }
        
        # Look for export module invocations
        if ($commandName -match '^(Export-.*|.*Export)') {
            $invocation = Analyze-ExportInvocation -CommandAst $call
            $script:ContractContext.InvocationPatterns[$commandName] = $invocation
            
            # Validate against contract
            Validate-ExportInvocation -Invocation $invocation -CommandAst $call
        }
    }
}

function Analyze-DiscoveryInvocation {
    param($CommandAst)
    
    $invocation = [InvocationPattern]@{
        FunctionName = $CommandAst.GetCommandName()
        Parameters = @{}
        ErrorHandling = "None"
        ReturnValueUsage = "Unknown"
        LineNumber = $CommandAst.Extent.StartLineNumber
        Context = Get-InvocationContext -CommandAst $CommandAst
    }
    
    # Extract parameters
    for ($i = 1; $i -lt $CommandAst.CommandElements.Count; $i++) {
        $element = $CommandAst.CommandElements[$i]
        if ($element.ToString().StartsWith('-')) {
            $paramName = $element.ToString().TrimStart('-')
            $paramValue = if ($i + 1 -lt $CommandAst.CommandElements.Count) { $CommandAst.CommandElements[$i + 1].ToString() } else { $null }
            $invocation.Parameters[$paramName] = $paramValue
            $i++ # Skip the value element
        }
    }
    
    # Check error handling context
    $invocation.ErrorHandling = Get-ErrorHandlingContext -CommandAst $CommandAst
    
    # Check return value usage
    $invocation.ReturnValueUsage = Get-ReturnValueUsage -CommandAst $CommandAst
    
    return $invocation
}

function Analyze-ProcessingInvocation {
    param($CommandAst)
    
    return Analyze-DiscoveryInvocation -CommandAst $CommandAst
}

function Analyze-ExportInvocation {
    param($CommandAst)
    
    return Analyze-DiscoveryInvocation -CommandAst $CommandAst
}

function Get-InvocationContext {
    param($CommandAst)
    
    # Determine the context (runspace, try-catch, function, etc.)
    $parent = $CommandAst.Parent
    $context = "Direct"
    
    while ($parent) {
        if ($parent -is [System.Management.Automation.Language.ScriptBlockAst] -and $parent.Parent -is [System.Management.Automation.Language.CommandAst]) {
            $parentCommand = $parent.Parent.GetCommandName()
            if ($parentCommand -match "Start-Job|Invoke-Command") {
                $context = "Runspace"
                break
            }
        }
        if ($parent -is [System.Management.Automation.Language.TryStatementAst]) {
            $context = "TryCatch"
            break
        }
        $parent = $parent.Parent
    }
    
    return $context
}

function Get-ErrorHandlingContext {
    param($CommandAst)
    
    # Check if command is in try-catch block
    $parent = $CommandAst.Parent
    while ($parent) {
        if ($parent -is [System.Management.Automation.Language.TryStatementAst]) {
            return "TryCatch"
        }
        $parent = $parent.Parent
    }
    
    # Check for -ErrorAction parameter
    $errorActionParam = $CommandAst.CommandElements | Where-Object {$_.ToString() -eq "-ErrorAction"}
    if ($errorActionParam) {
        return "ErrorAction"
    }
    
    return "None"
}

function Get-ReturnValueUsage {
    param($CommandAst)
    
    # Check if return value is assigned to variable
    $parent = $CommandAst.Parent
    if ($parent -is [System.Management.Automation.Language.AssignmentStatementAst]) {
        return "Assigned"
    }
    
    # Check if used in pipeline
    if ($parent -is [System.Management.Automation.Language.PipelineAst] -and $parent.PipelineElements.Count -gt 1) {
        return "Piped"
    }
    
    # Check if used in conditional
    if ($parent -is [System.Management.Automation.Language.IfStatementAst] -or 
        $parent -is [System.Management.Automation.Language.WhileStatementAst]) {
        return "Conditional"
    }
    
    return "Ignored"
}

function Validate-DiscoveryInvocation {
    param($Invocation, $CommandAst)
    
    $contract = $script:ContractContext.ModuleContracts["Discovery"]
    
    # Validate required parameters
    foreach ($requiredParam in @("Context", "ModuleName")) {
        if (-not $Invocation.Parameters.ContainsKey($requiredParam)) {
            Add-ContractViolation -Severity "ERROR" -Type "MissingParameter" -ModuleName "Discovery" -FunctionName $Invocation.FunctionName -Description "Missing required parameter: $requiredParam" -ExpectedContract "Parameter '$requiredParam' is required" -ActualUsage "Parameter not provided" -Recommendation "Add -$requiredParam parameter to function call" -LineNumber $Invocation.LineNumber
        }
    }
    
    # Validate error handling
    if ($Invocation.ErrorHandling -eq "None") {
        Add-ContractViolation -Severity "WARN" -Type "ErrorHandling" -ModuleName "Discovery" -FunctionName $Invocation.FunctionName -Description "Discovery invocation lacks error handling" -ExpectedContract "Must be wrapped in try-catch or use -ErrorAction" -ActualUsage "No error handling detected" -Recommendation "Wrap in try-catch block or add -ErrorAction parameter" -LineNumber $Invocation.LineNumber
    }
    
    # Validate return value usage
    if ($Invocation.ReturnValueUsage -eq "Ignored") {
        Add-ContractViolation -Severity "WARN" -Type "ReturnValue" -ModuleName "Discovery" -FunctionName $Invocation.FunctionName -Description "Discovery result not captured or used" -ExpectedContract "Return value should be captured and processed" -ActualUsage "Return value ignored" -Recommendation "Assign return value to variable for processing" -LineNumber $Invocation.LineNumber
    }
    
    # Validate context parameter
    if ($Invocation.Parameters.ContainsKey("Context")) {
        $contextValue = $Invocation.Parameters["Context"]
        if ($contextValue -notmatch '\$.*Context|\$global:MandA') {
            Add-ContractViolation -Severity "WARN" -Type "ParameterValue" -ModuleName "Discovery" -FunctionName $Invocation.FunctionName -Description "Context parameter may not be valid" -ExpectedContract "Should pass global context or validated context object" -ActualUsage "Context value: $contextValue" -Recommendation "Ensure context parameter references valid context object" -LineNumber $Invocation.LineNumber
        }
    }
}

function Validate-ProcessingInvocation {
    param($Invocation, $CommandAst)
    
    $contract = $script:ContractContext.ModuleContracts["Processing"]
    
    # Validate data flow
    if ($Invocation.FunctionName -eq "New-UserProfiles") {
        if (-not $Invocation.Parameters.ContainsKey("AggregatedDataStore")) {
            Add-ContractViolation -Severity "ERROR" -Type "DataFlow" -ModuleName "Processing" -FunctionName $Invocation.FunctionName -Description "Missing aggregated data input" -ExpectedContract "Requires AggregatedDataStore parameter" -ActualUsage "Parameter not provided" -Recommendation "Ensure data aggregation output is passed to user profile builder" -LineNumber $Invocation.LineNumber
        }
    }
    
    # Validate configuration
    if (-not $Invocation.Parameters.ContainsKey("Configuration")) {
        Add-ContractViolation -Severity "WARN" -Type "Configuration" -ModuleName "Processing" -FunctionName $Invocation.FunctionName -Description "Missing configuration parameter" -ExpectedContract "Should receive configuration for processing parameters" -ActualUsage "No configuration parameter" -Recommendation "Pass configuration object to processing function" -LineNumber $Invocation.LineNumber
    }
}

function Validate-ExportInvocation {
    param($Invocation, $CommandAst)
    
    $contract = $script:ContractContext.ModuleContracts["Export"]
    
    # Validate output path
    if ($Invocation.Parameters.ContainsKey("OutputPath")) {
        $outputPath = $Invocation.Parameters["OutputPath"]
        if ($outputPath -match '^[A-Z]:\\|^/[a-z]+/') {
            Add-ContractViolation -Severity "WARN" -Type "Portability" -ModuleName "Export" -FunctionName $Invocation.FunctionName -Description "Hardcoded output path detected" -ExpectedContract "Should use relative paths or configuration-based paths" -ActualUsage "Hardcoded path: $outputPath" -Recommendation "Use relative paths or configuration parameters" -LineNumber $Invocation.LineNumber
        }
    }
    
    # Validate data input
    if (-not $Invocation.Parameters.ContainsKey("Data")) {
        Add-ContractViolation -Severity "ERROR" -Type "DataFlow" -ModuleName "Export" -FunctionName $Invocation.FunctionName -Description "Missing data input for export" -ExpectedContract "Requires data parameter" -ActualUsage "No data parameter" -Recommendation "Ensure processed data is passed to export function" -LineNumber $Invocation.LineNumber
    }
}

function Analyze-ModuleLoadingPatterns {
    param($AST)
    
    Write-ContractLog "Analyzing module loading patterns" "INFO"
    
    $importCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Import-Module"}, $true)
    $removeCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -eq "Remove-Module"}, $true)
    
    # Check for proper module lifecycle management
    if ($importCommands.Count -gt 0 -and $removeCommands.Count -eq 0) {
        Add-ContractViolation -Severity "INFO" -Type "Lifecycle" -ModuleName "Orchestrator" -Description "Modules imported but not explicitly removed" -ExpectedContract "Consider implementing module cleanup" -ActualUsage "Import without explicit removal" -Recommendation "Add Remove-Module calls for better resource management"
    }
    
    # Check for dynamic module loading
    foreach ($import in $importCommands) {
        $moduleParam = $import.CommandElements | Where-Object {$_ -ne $import.CommandElements[0]}
        if ($moduleParam -and $moduleParam[0].ToString() -match '\$') {
            Add-ContractViolation -Severity "INFO" -Type "DynamicLoading" -ModuleName "Orchestrator" -Description "Dynamic module loading detected" -ExpectedContract "Ensure module paths are validated" -ActualUsage "Variable-based module path" -Recommendation "Validate module paths before loading" -LineNumber $import.Extent.StartLineNumber
        }
    }
}

function Analyze-ErrorHandlingPatterns {
    param($AST)
    
    Write-ContractLog "Analyzing error handling patterns" "INFO"
    
    $tryBlocks = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.TryStatementAst]}, $true)
    
    foreach ($tryBlock in $tryBlocks) {
        # Check for proper catch handling
        if (-not $tryBlock.CatchClauses -or $tryBlock.CatchClauses.Count -eq 0) {
            Add-ContractViolation -Severity "WARN" -Type "ErrorHandling" -ModuleName "Orchestrator" -Description "Try block without catch clause" -ExpectedContract "Try blocks should have corresponding catch handling" -ActualUsage "Try without catch" -Recommendation "Add appropriate catch clause" -LineNumber $tryBlock.Extent.StartLineNumber
        }
        
        # Check for finally blocks for resource cleanup
        if (-not $tryBlock.Finally) {
            $hasResourceAllocation = $tryBlock.Body.ToString() -match '(New-Object|Get-WmiObject|Invoke-RestMethod)'
            if ($hasResourceAllocation) {
                Add-ContractViolation -Severity "INFO" -Type "ResourceCleanup" -ModuleName "Orchestrator" -Description "Resource allocation in try block without finally clause" -ExpectedContract "Consider adding finally block for cleanup" -ActualUsage "Try block with resources but no finally" -Recommendation "Add finally block for resource cleanup" -LineNumber $tryBlock.Extent.StartLineNumber
            }
        }
    }
}

function Analyze-ReturnValueUsage {
    param($AST)
    
    Write-ContractLog "Analyzing return value usage patterns" "INFO"
    
    # Look for function calls that should return DiscoveryResult
    $discoveryCommands = $AST.FindAll({$args[0] -is [System.Management.Automation.Language.CommandAst] -and $args[0].GetCommandName() -match 'Discovery'}, $true)
    
    foreach ($command in $discoveryCommands) {
        $parent = $command.Parent
        $isAssigned = $parent -is [System.Management.Automation.Language.AssignmentStatementAst]
        $isUsedInPipeline = $parent -is [System.Management.Automation.Language.PipelineAst] -and $parent.PipelineElements.Count -gt 1
        
        if (-not $isAssigned -and -not $isUsedInPipeline) {
            Add-ContractViolation -Severity "WARN" -Type "ReturnValue" -ModuleName "Orchestrator" -Description "Discovery result not captured" -ExpectedContract "Discovery results should be captured and processed" -ActualUsage "Return value ignored" -Recommendation "Assign result to variable for processing" -LineNumber $command.Extent.StartLineNumber
        }
    }
}

function Show-ContractValidationSummary {
    $totalViolations = $script:ContractContext.Violations.Count
    $errorCount = ($script:ContractContext.Violations | Where-Object {$_.Severity -eq "ERROR"}).Count
    $warnCount = ($script:ContractContext.Violations | Where-Object {$_.Severity -eq "WARN"}).Count
    $infoCount = ($script:ContractContext.Violations | Where-Object {$_.Severity -eq "INFO"}).Count
    
    Write-Host "`n" + ("="*80) -ForegroundColor Cyan
    Write-Host "ORCHESTRATOR-MODULE CONTRACT VALIDATION SUMMARY" -ForegroundColor Cyan
    Write-Host ("="*80) -ForegroundColor Cyan
    
    Write-Host "Total Contract Violations: $totalViolations" -ForegroundColor White
    Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
    Write-Host "  Warnings: $warnCount" -ForegroundColor $(if ($warnCount -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  Info: $infoCount" -ForegroundColor Gray
    Write-Host ""
    
    if ($DetailedAnalysis -and $totalViolations -gt 0) {
        Write-Host "DETAILED VIOLATIONS:" -ForegroundColor White
        
        $violationsByType = $script:ContractContext.Violations | Group-Object Type
        foreach ($group in $violationsByType) {
            Write-Host "  $($group.Name): $($group.Count)" -ForegroundColor Gray
        }
        Write-Host ""
        
        if ($errorCount -gt 0) {
            Write-Host "CRITICAL CONTRACT VIOLATIONS:" -ForegroundColor Red
            $errors = $script:ContractContext.Violations | Where-Object {$_.Severity -eq "ERROR"}
            foreach ($error in $errors) {
                Write-Host "  [$($error.ModuleName)] Line $($error.LineNumber): $($error.Description)" -ForegroundColor Red
                if ($error.Recommendation) {
                    Write-Host "    → $($error.Recommendation)" -ForegroundColor Yellow
                }
            }
            Write-Host ""
        }
    }
    
    # Overall contract compliance status
    if ($errorCount -eq 0) {
        Write-Host "✅ CONTRACT VALIDATION PASSED" -ForegroundColor Green
        if ($warnCount -gt 0) {
            Write-Host "⚠️  $warnCount contract warnings found - review recommended" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ CONTRACT VALIDATION FAILED" -ForegroundColor Red
        Write-Host "$errorCount critical contract violations must be resolved" -ForegroundColor Red
    }
    
    Write-Host ("="*80) -ForegroundColor Cyan
}

function Export-ContractValidationReport {
    param([string]$OutputPath = "ContractValidationResults")
    
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    # Export violations report
    $violationsPath = Join-Path $OutputPath "ContractViolations_$timestamp.csv"
    $script:ContractContext.Violations | Export-Csv $violationsPath -NoTypeInformation
    
    # Export invocation patterns
    $patternsPath = Join-Path $OutputPath "InvocationPatterns_$timestamp.json"
    $script:ContractContext.InvocationPatterns | ConvertTo-Json -Depth 3 | Set-Content $patternsPath
    
    # Export summary report
    $summaryPath = Join-Path $OutputPath "ContractValidationSummary_$timestamp.json"
    $summary = @{
        Timestamp = Get-Date
        TotalViolations = $script:ContractContext.Violations.Count
        ViolationsBySeverity = $script:ContractContext.Violations | Group-Object Severity | ForEach-Object { @{$_.Name = $_.Count} }
        ViolationsByType = $script:ContractContext.Violations | Group-Object Type | ForEach-Object { @{$_.Name = $_.Count} }
        InvocationPatternsCount = $script:ContractContext.InvocationPatterns.Count
    }
    $summary | ConvertTo-Json -Depth 3 | Set-Content $summaryPath
    
    Write-ContractLog "Contract validation report exported to $OutputPath" "SUCCESS"
}

# Main execution
function Start-ContractValidation {
    Write-ContractLog "Starting orchestrator-module contract validation" "INFO"
    
    # Initialize module contracts
    Initialize-ModuleContracts
    
    # Analyze orchestrator invocations
    Analyze-OrchestratorInvocations -OrchestratorPath $OrchestratorPath
    
    # Show summary
    Show-ContractValidationSummary
    
    # Export results if requested
    if ($ExportReport) {
        Export-ContractValidationReport
    }
    
    # Return exit code
    $errorCount = ($script:ContractContext.Violations | Where-Object {$_.Severity -eq "ERROR"}).Count
    if ($errorCount -gt 0) {
        exit 1
    } else {
        exit 0
    }
}

# Execute contract validation
Start-ContractValidation