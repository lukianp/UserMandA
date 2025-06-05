📁 Path: Modules/Utilities/ConfigurationValidation.psm1
🔧 Purpose: Provides configuration validation against a JSON schema for the M&A Discovery Suite | This module includes functions to test a loaded configuration object (hashtable) against a defined JSON schema file (config.schema.json). It reports validation errors and warnings.
📌 Declared Functions:

function Test-SuiteConfigurationAgainstSchema {
function Test-ConfigurationNodeInternal {
📦 Variables Used:
$script:CREDENTIAL_FORMAT_VERSION = "2.1"
$validationErrorsList = [System.Collections.Generic.List[string]]::new()
$validationWarningsList = [System.Collections.Generic.List[string]]::new()
validationErrorsRef=[ref]validationErrorsRef = [ref]
validationErrorsRef=[ref]validationErrorsList

validationWarningsRef=[ref]validationWarningsRef = [ref]
validationWarningsRef=[ref]validationWarningsList

$schemaJsonContent = $null
$debugMode = $false
expectedSchemaTypes=@(expectedSchemaTypes = @(
expectedSchemaTypes=@(NodeSchema.type)

$actualDataType = ""
$typeMatch = $false
isValid=(isValid = (
isValid=(validationErrorsList.Count -eq 0)


📁 Path: Modules/Utilities/CredentialFormatHandler.psm1
🔧 Purpose: Handles the formatting, saving, and reading of credential files for the M&A Discovery Suite | This module provides functions to convert credential data to a standard format, save it securely using DPAPI encryption, and read it back. It ensures UTF-8 encoding for the JSON data before encryption and after decryption.
📌 Declared Functions:

function ConvertTo-StandardCredentialFormat {
function Test-CredentialFormat {
function Save-CredentialFile {
function Read-CredentialFile {
📦 Variables Used:
$script:CREDENTIAL_FORMAT_VERSION = "2.1"
$standardOutput = $CredentialData.Clone()
$requiredFields = @('ClientId', 'ClientSecret', 'TenantId')
$issues = [System.Collections.Generic.List[string]]::new()
$standardDataToSave = ConvertTo-StandardCredentialFormat -CredentialData $CredentialData -Context $Context
$jsonCredentialData = $standardDataToSave | ConvertTo-Json -Depth 10 -Compress -ErrorAction Stop
$secureString = ConvertTo-SecureString -String $jsonCredentialData -AsPlainText -Force -ErrorAction Stop
$encryptedString = ConvertFrom-SecureString -SecureString $secureString -ErrorAction Stop
encryptedContent=[System.IO.File]::ReadAllText(encryptedContent = [System.IO.File]::ReadAllText(
encryptedContent=[System.IO.File]::ReadAllText(Path, [System.Text.Encoding]::UTF8)

bstr=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(
bstr=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR(secureString)

$credentialData = $jsonCredentialData | ConvertFrom-Json -ErrorAction Stop

📁 Path: Modules/Utilities/EnhancedLogging.psm1
🔧 Purpose: Provides enhanced logging capabilities for the M&A Discovery Suite | This module offers functions for initializing the logging system, writing formatted log messages to both console and file, with support for log levels, timestamps, component names, colors, and emojis. It's designed to work with the $global:MandA context for configuration or a passed context object.
📌 Declared Functions:

function Initialize-Logging {
function Write-MandALog {
function Move-LogFile {
function Clear-OldLogFiles {
function Get-EffectiveLoggingSetting {
function Get-LogColorInternal {
function Get-LogEmojiInternal {
📦 Variables Used:
$script:LoggingConfig = @{
$effectiveConfig = $null
$effectivePaths = $null
$currentCompanyNameForLog = "General"
logFileBaseName = "MandADiscoverySuite_
{currentCompanyNameForLog}"

$timestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
initialLogContext=if(initialLogContext = if (
initialLogContext=if(null -ne Context) {
Context} elseif ($null -ne $global
:MandA) {$global:MandA} else {[PSCustomObject]@{Config = $effectiveConfig}}
$cleanupContext = $initialLogContext
$effectiveContext = $Context | global:Get-OrElse $script:LoggingConfig.DefaultContext
timestamp = if (-not $NoTimestamp) { "[
(Get-Date -Format 'yyyy-MM-dd HH:mm
:ss')] " } else { "" }
$cleanedMessage = $Message -replace "[\r\n]+", " "
logMessage="logMessage = "
logMessage="timestamp[$Level] $cleanedMessage"

$consoleMessage = $Message
$logColor = Get-LogColorInternal -Level $Level -ForContext $effectiveContext
$emoji = Get-LogEmojiInternal -Level $Level -ForContext $effectiveContext
displayMessage="displayMessage = "
displayMessage="emoji $consoleMessage"

$separator = "=" * $separatorLength
$fileMessage = $Message
$fileLogEntry = ""
$logFileItem = Get-Item -Path $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
$maxLogSizeConfig = Get-EffectiveLoggingSetting -SettingName 'MaxLogSizeMB' -Context $effectiveContext -DefaultValue 50
$currentLogFile = $script:LoggingConfig.LogFile
$logDir = Split-Path $currentLogFile -Parent
logNameBaseOriginal=[System.IO.Path]::GetFileNameWithoutExtension(logNameBaseOriginal = [System.IO.Path]::GetFileNameWithoutExtension(
logNameBaseOriginal=[System.IO.Path]::GetFileNameWithoutExtension(currentLogFile)

logExtension=[System.IO.Path]::GetExtension(logExtension = [System.IO.Path]::GetExtension(
logExtension=[System.IO.Path]::GetExtension(currentLogFile)

logNameClean = $logNameBaseOriginal -replace '_\d{8}_\d{6}_ROTATED_\d{17}
',''

$rotationTimestamp = Get-Date -Format "yyyyMMddHHmmssfff"
rotatedLogFileName="rotatedLogFileName = "
rotatedLogFileName="(logNameClean)_ROTATED_
rotationTimestamp$logExtension"

$rotatedLogFilePath = Join-Path $logDir $rotatedLogFileName
newLogFileBase = "MandADiscoverySuite_
{companyNameForNewLog}"

$newTimestampForFile = Get-Date -Format "yyyyMMdd_HHmmss"
$logPathForClear = $Context.Paths.LogOutput | global:Get-OrElse $script:LoggingConfig.LogPath
$retentionDays = Get-EffectiveLoggingSetting -SettingName 'LogRetentionDays' -Context $Context -DefaultValue 30
cutoffDate=(Get−Date).AddDays(−cutoffDate = (Get-Date).AddDays(-
cutoffDate=(Get−Date).AddDays(−retentionDays)

$oldLogFiles = Get-ChildItem -Path $logPathForClear -Filter "*.log" -File -ErrorAction Stop | Where-Object { $_.LastWriteTime -lt $cutoffDate }

📁 Path: Modules/Utilities/ErrorHandling.psm1
🔧 Purpose: Provides standardized error handling and retry mechanisms for the M&A Discovery Suite | This module includes functions to invoke script blocks with retry logic, get user-friendly error messages, and manage error summaries. It integrates with the EnhancedLogging module for output.
📌 Declared Functions:

function Invoke-WithRetry {
function Get-FriendlyErrorMessage {
function Write-ErrorSummary {
function Test-CriticalError {
📦 Variables Used:
$effectiveMaxRetries = $MaxRetries
$effectiveDelaySeconds = $DelaySeconds
$effectiveConfig = $Context.Config | Global:Get-OrElse $script:LoggingConfig.DefaultContext.Config | Global:Get-OrElse $global:MandA.Config
$attempt = 0
$lastError = $null
$operationSuccessful = $false
$result = $null
$errorType = $_.Exception.GetType().FullName
$errorMessage = $_.Exception.Message
$isRetryableBySpecificType = $false
$waitTime = $effectiveDelaySeconds * $attempt
$exception = $ErrorRecord.Exception
$baseMessage = $exception.Message
$exceptionType = $exception.GetType().FullName
$targetObject = $ErrorRecord.TargetObject
$categoryInfo = $ErrorRecord.CategoryInfo
$invocationInfo = $ErrorRecord.InvocationInfo
$friendlyMessage = "An error occurred: "$baseMessage" (Type: $exceptionType)."
$statusCode = ""
$oDataError = $exception.Error
$graphErrorCode = $oDataError.Code
$graphErrorMessage = $oDataError.Message
$errorGroups = $ErrorCollector.Errors | Group-Object Source | Sort-Object Count -Descending
$criticalErrorPatterns = @(

📁 Path: Modules/Utilities/FileOperations.psm1
🔧 Purpose: Provides common file and directory operation utilities for the M&A Discovery Suite | This module includes functions for importing/exporting CSV data, testing file write access, backing up files, and other file system tasks. It standardizes on UTF-8 encoding and integrates with EnhancedLogging.
📌 Declared Functions:

function Ensure-DirectoryExists {
function Import-DataFromCSV {
function Export-DataToCSV {
function Test-FileWriteAccess {
function Backup-File {
function Clear-OldFiles {
function Get-DirectorySizeFormatted {
function Get-RandomInt {
📦 Variables Used:
$data = Import-Csv -Path $FilePath -Delimiter $Delimiter -Encoding Default -ErrorAction Stop
$directory = Split-Path $FilePath -Parent
$exportParams = @{
$testFilePath = ""
$isDirectory = Test-Path -Path $Path -PathType Container
testFileName = "write_test_
(Get-RandomInt -Min 10000 -Max 99999).tmp"

$parentDir = Split-Path $Path -Parent
$fileInfo = Get-Item $FilePath
backupFileName="backupFileName = "
backupFileName="(fileInfo.BaseName)fileInfo.BaseName)
fileInfo.BaseName)BackupSuffix((
(fileInfo.Extension)"

$backupPath = Join-Path $fileInfo.DirectoryName $backupFileName
cutoffDate=(Get−Date).AddDays(−cutoffDate = (Get-Date).AddDays(-
cutoffDate=(Get−Date).AddDays(−RetentionDays)

$getChildItemParams = @{
$filesToRemove = Get-ChildItem @getChildItemParams | Where-Object { $_.LastWriteTime -lt $cutoffDate }
$totalSize = (Get-ChildItem $DirectoryPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum

📁 Path: Modules/Utilities/ModuleHelpers.psm1
🔧 Purpose: Helper functions for M&A Discovery Suite modules | Provides standardized initialization and path resolution
📌 Declared Functions:

function Initialize-MandAModuleContext {
function Get-MandAModulePath {
📦 Variables Used:
$suiteRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

📁 Path: Modules/Utilities/ModulesHelper.psm1
🔧 Purpose: Helper functions for M&A Discovery Suite modules | Provides standardized initialization and path resolution
📌 Declared Functions:

function Initialize-MandAModuleContext {
function Get-MandAModulePath {
📦 Variables Used:
$suiteRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

📁 Path: Modules/Utilities/ProgressDisplay.psm1
🔧 Purpose: Provides utility functions for displaying progress and status information in the M&A Discovery Suite | This module contains functions to render visual progress indicators, status tables, and section headers to the console, enhancing the user experience during suite execution. It integrates with EnhancedLogging for consistent output styling where appropriate.
📌 Declared Functions:

function Show-SectionHeader {
function Show-StatusTable {
function Update-TaskProgress {
function Complete-TaskProgress {
📦 Variables Used:
$useEmojis = $true
displayIcon=if(displayIcon = if (
displayIcon=if(useEmojis) { "$Icon " } else { "" }

headerMessage="headerMessage = "
headerMessage="displayIcon$Title"

separator="="∗(separator = "=" * (
separator="="∗(headerMessage.Length + 4 | Out-String | Select-Object -First 1).Trim().Length

icon=if(icon = if (
icon=if(Success) { "[OK]" } else { "[X]" }

level=if(level = if (
level=if(Success) { "SUCCESS" } else { "ERROR" }

durationText=if(durationText = if (
durationText=if(Duration) { " ([TIME] $('{0
:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
message="message = "
message="Operation$durationText"

$percent = 0
$logProgress = $false
$logLevelForProgress = "DEBUG"
$logInterval = 10
progressPoint=[Math]::Max(1,[Math]::Floor(progressPoint = [Math]::Max(1, [Math]::Floor(
progressPoint=[Math]::Max(1,[Math]::Floor(TotalOperations / (100 / $logInterval)))

$debugMode = $false

📁 Path: Modules/Utilities/ProgressTracking.psm1
🔧 Purpose: Provides functions for tracking the progress and performance metrics of operations within the M&A Discovery Suite | This module allows for initializing progress trackers, starting and stopping operation timers, updating step-based progress, and retrieving/exporting collected metrics. It's designed to be used by various components of the suite to monitor execution duration and status of different phases and operations.
📌 Declared Functions:

function Initialize-ProgressTracker {
function Start-OperationTimer {
function Stop-OperationTimer {
function Update-StepProgress {
function Complete-ProgressTracker {
function Get-ProgressMetrics {
function Export-ProgressMetricsReport {
function Show-ProgressSummaryReport {
function Reset-ProgressTrackerInternal {
📦 Variables Used:
$script:ProgressState = $null
$script:ProgressState = @{
$script:ProgressState.MetricsLog.Add(@{Timestamp = Get-Date; Event = "TrackerInitialized"; Phase = $OverallPhaseName })
$script:ProgressState.Operations[$OperationName] = @{
$operationEntry = $script:ProgressState.Operations[$OperationName]
$script:ProgressState.CurrentStep += $IncrementStepCountBy
$script:ProgressState.LastStepMessage = $StepMessage
progressText = "Step $(
script
:ProgressState.CurrentStep)"
$script:ProgressState.EndTime = Get-Date
$script:ProgressState.IsActive = $false
$totalDuration = $script:ProgressState.EndTime - $script:ProgressState.StartTime
completionMsg="ProgressTrackingfor′completionMsg = "Progress Tracking for '
completionMsg="ProgressTrackingfor′($script
:ProgressState.OverallPhase)' COMPLETED."
finalLogMsg="finalLogMsg = "
finalLogMsg="FinalStatusMessage Total Duration: ((
(totalDuration.ToString('hh\:mm\:ss\.fff'))"

durationInSeconds=if(durationInSeconds = if(
durationInSeconds=if(totalDuration){$totalDuration.TotalSeconds}else{0}

$reportData = Get-ProgressMetrics
$reportData.ExecutionSummary = @{
$parentDir = Split-Path $FilePath -Parent
$summaryData = @{
$summaryPath = Join-Path $encryptedDir "credential_summary.json"
$metrics = Get-ProgressMetrics
$summaryData = [ordered]@{
$activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
$disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
$opTableData = [System.Collections.Generic.List[PSCustomObject]]::new()
$tableOutput = $opTableData | Format-Table -AutoSize | Out-String

📁 Path: Modules/Utilities/Setup-AppRegistrationOnce.ps1
🔧 Purpose: Creates Azure AD app registration with comprehensive read-only permissions for M&A environment discovery | This foundational script creates a service principal with read-only Microsoft Graph, Azure, and Exchange Online permissions, grants admin consent, assigns Cloud Application Administrator, Reader, and Exchange View-Only Administrator roles, creates a client secret, and encrypts credentials for secure use by discovery and aggregation scripts.
📌 Declared Functions:

function Write-EnhancedLog {
function Write-ProgressHeader {
function Write-OperationResult {
function Start-OperationTimer {
function Stop-OperationTimer {
function Test-Prerequisites {
function Initialize-RequiredModules {
function Connect-EnhancedGraph {
function Connect-EnhancedAzure {
function Connect-EnhancedExchange {
function New-EnhancedAppRegistration {
function Grant-EnhancedAdminConsent {
function Set-EnhancedRoleAssignments {
function Set-ExchangeRoleAssignment {
function New-EnhancedClientSecret {
function Save-EnhancedCredentials {
📦 Variables Used:
$script:ScriptInfo = @{
$script:AppConfig = @{
$script:ColorScheme = @{
$script:ConnectionStatus = @{
$script:Metrics = @{
timestamp = if (-not $NoTimestamp) { "[
(Get-Date -Format 'yyyy-MM-dd HH:mm
:ss')] " } else { "" }
$cleanedMessage = $Message -replace "[\r\n]+", " "
logMessage="logMessage = "
logMessage="timestamp[$Level] $cleanedMessage"

colorParams=switch(colorParams = switch (
colorParams=switch(Level) {

icon=switch(icon = switch (
icon=switch(Level) {

displayMessage="displayMessage = "
displayMessage="icon $logMessage"

$separator = "═" * 90
icon=if(icon = if (
icon=if(Success) { "[OK]" } else { "[X]" }

level=if(level = if (
level=if(Success) { "SUCCESS" } else { "ERROR" }

durationText=if(durationText = if (
durationText=if(Duration) { " ([TIME] $('{0
:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
message="message = "
message="Operation$durationText"

$issues = @()
$warnings = @()
$psVersion = $PSVersionTable.PSVersion
requiredVersion=[version]requiredVersion = [version]
requiredVersion=[version]script
:ScriptInfo.RequiredPSVersion
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
principal=New−ObjectSecurity.Principal.WindowsPrincipal(principal = New-Object Security.Principal.WindowsPrincipal(
principal=New−ObjectSecurity.Principal.WindowsPrincipal(currentUser)

$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$connectivityTests = @(
$connectionResults = @()
successfulConnections=(successfulConnections = (
successfulConnections=(connectionResults | Where-Object { $_ }).Count

$availableMemory = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
$minMemoryGB = 2
$encryptedDir = Split-Path $EncryptedOutputPath -Parent
$drive = if (Test-Path $encryptedDir -ErrorAction SilentlyContinue) {
$freeSpace = [math]::Round((Get-CimInstance Win32_LogicalDisk | Where-Object DeviceID -eq $drive.Root.Name.TrimEnd('')).FreeSpace / 1GB, 2)
$minSpaceGB = 0.5
testFile = Join-Path $encryptedDir "write_test_
(Get-Random).tmp"

$installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue |
$loadedModules = Get-Module -Name "Az.", "Microsoft.Graph.", "ExchangeOnlineManagement" -ErrorAction SilentlyContinue
$unloadCount = 0
$totalModules = $script:ScriptInfo.Dependencies.Count
$processedModules = 0
$minVersion = $script:ScriptInfo.MinimumModuleVersions[$moduleName]
$installedVersion = $installedModule.Version.ToString()
$latestModule = Find-Module -Name $moduleName -Repository PSGallery -ErrorAction Stop
$latestVersion = $latestModule.Version.ToString()
$latestInstalled = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue |
$maxRetries = 3
$retryDelay = 5
$requiredScopes = @(
$existingContext = Get-MgContext -ErrorAction SilentlyContinue
$hasAllScopes = $requiredScopes | ForEach-Object { $_ -in $existingContext.Scopes } | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count
$connectParams = @{
$context = Get-MgContext -ErrorAction Stop
$org = Get-MgOrganization -Top 1 -ErrorAction Stop
$testApps = Get-MgApplication -Top 1 -ErrorAction Stop
$errorMessage = $_.Exception.Message
$errorCode = $matches[1]
$existingContext = Get-AzContext -ErrorAction SilentlyContinue
$subscriptions = Get-AzSubscription -ErrorAction Stop
$result = Connect-AzAccount -Scope CurrentUser -ErrorAction Stop
$context = Get-AzContext -ErrorAction Stop
$activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
$disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
$existingSession = Get-PSSession | Where-Object {
$connectionParams = @{
$orgConfig = Get-OrganizationConfig -ErrorAction Stop
$appName = $script:AppConfig.DisplayName
existingApp=Get−MgApplication−Filter"displayNameeq′existingApp = Get-MgApplication -Filter "displayName eq '
existingApp=Get−MgApplication−Filter"displayNameeq′appName'" -ErrorAction SilentlyContinue

$graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
$resourceAccess = @()
$foundPermissions = @()
$missingPermissions = @()
$totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count
$processedPermissions = 0
$permissionName = $permission.Key
$appRole = $graphSp.AppRoles | Where-Object { $_.Value -eq $permissionName }
$requiredResourceAccess = @(
$appParams = @{
$appRegistration = New-MgApplication @appParams -ErrorAction Stop
$servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
$graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
appSp=Get−MgServicePrincipal−Filter"AppIdeq′appSp = Get-MgServicePrincipal -Filter "AppId eq '
appSp=Get−MgServicePrincipal−Filter"AppIdeq′($AppRegistration.AppId)'" -ErrorAction Stop

$grantedCount = 0
$skippedCount = 0
$failedCount = 0
$currentPermission = 0
$permissionId = $resourceAccess.Id
$permissionName = $null
$matchingRole = $graphSp.AppRoles | Where-Object { $_.Id -eq $permissionId }
$existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue |
$assignmentParams = @{
$azureRoleAssignmentSuccess = $false
$azureRoleDetails = @{
$adRoleResults = @{
$roleName = $script:AppConfig.AzureADRoles
roleDefinition=Get−MgDirectoryRole−Filter"DisplayNameeq′roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '
roleDefinition=Get−MgDirectoryRole−Filter"DisplayNameeq′roleName'" -ErrorAction SilentlyContinue

roleTemplate=Get−MgDirectoryRoleTemplate−Filter"DisplayNameeq′roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '
roleTemplate=Get−MgDirectoryRoleTemplate−Filter"DisplayNameeq′roleName'" -ErrorAction Stop

$existingAssignment = Get-MgDirectoryRoleMember -DirectoryRoleId $roleDefinition.Id -ErrorAction SilentlyContinue |
$memberRef = "https://graph.microsoft.com/v1.0/directoryObjects/((
(ServicePrincipal.Id)
"
$originalWarning = $WarningPreference
$WarningPreference = "SilentlyContinue"
$subscriptions = Get-AzSubscription -ErrorAction Stop
$enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
subscription = $enabledSubscriptions[
i]

$subscriptionName = $subscription.Name
$subscriptionId = $subscription.Id
scope="/subscriptions/scope = "/subscriptions/
scope="/subscriptions/subscriptionId"

$contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop
$existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
$hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName }
$roleAssignmentParams = @{
$roleAssignment = New-AzRoleAssignment @roleAssignmentParams
$finalRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
$readerRole = $finalRoles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
$totalVerified = 0
$subscription = $enabledSubscriptions | Where-Object { $_.Name -eq $subscriptionName }
roles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope "/subscriptions/
($subscription.Id)" -ErrorAction SilentlyContinue

$exchangeRoleResults = @{
$role = Get-RoleGroup -Identity $roleName -ErrorAction SilentlyContinue
$currentMembers = Get-RoleGroupMember -Identity $roleName -ErrorAction SilentlyContinue
$isAssigned = $currentMembers | Where-Object { $.Identity -eq $AppId -or $.Identity -eq $ServicePrincipalId }
$verifyMembers = Get-RoleGroupMember -Identity $roleName -ErrorAction SilentlyContinue
$verified = $verifyMembers | Where-Object { $.Identity -eq $AppId -or $.Identity -eq $ServicePrincipalId }
$secretDescription = "M&A Discovery Secret - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
secretEndDate=(Get−Date).AddYears(secretEndDate = (Get-Date).AddYears(
secretEndDate=(Get−Date).AddYears(SecretValidityYears)

$secretParams = @{
$clientSecret = Add-MgApplicationPassword @secretParams -ErrorAction Stop
daysUntilExpiry=(daysUntilExpiry = (
daysUntilExpiry=(secretEndDate - (Get-Date)).Days

$credentialData = @{
$jsonData = $credentialData | ConvertTo-Json -Depth 4
$secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
$encryptedData = $secureString | ConvertFrom-SecureString
$fileSize = [math]::Round((Get-Item $EncryptedOutputPath).Length / 1KB, 2)
$acl = Get-Acl $EncryptedOutputPath
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
$systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
$backupPath = $null
$backupDir = Join-Path $encryptedDir "Backups"
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
backupPath = Join-Path $backupDir "credentials_backup_
timestamp.config"

$backupFiles = Get-ChildItem -Path $backupDir -Filter "credentials_backup_*.config" | Sort-Object CreationTime -Descending
$summaryData = @{
$summaryPath = Join-Path $encryptedDir "credential_summary.json"
$script:Metrics.StartTime = Get-Date
$logDir = Split-Path $LogPath -Parent
$headerContent = @"
$SuiteRoot = $PSScriptRoot
$EnvScriptPath = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
$OrchestratorPath = $global:MandA.Paths.OrchestratorScript
$OrchestratorParams = @{
$ExitCode = $LASTEXITCODE
$Duration = (Get-Date) - $script:QuickStartTime
$script:Metrics.EndTime = Get-Date
$totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
successfulOperations=(successfulOperations = (
successfulOperations=(script
:Metrics.Operations.Values | Where-Object { $_.Success }).Count
$totalOperations = $script:Metrics.Operations.Count
$tenantId = $context.TenantId
$tenantInfo = Get-MgOrganization | Select-Object -First 1
$appRegistration = New-EnhancedAppRegistration
$servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
$clientSecret = New-EnhancedClientSecret -AppRegistration $appRegistration
$roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
metricsPath = $LogPath -replace '\.txt
', '_metrics.json'


📁 Path: Modules/Utilities/ValidationHelpers.psm1
🔧 Purpose: Provides common validation helper functions for the M&A Discovery Suite | This module includes functions for validating prerequisites, data formats (GUID, email, UPN), configuration files, directory write access, module availability, network connectivity, and data quality. It integrates with EnhancedLogging.
📌 Declared Functions:

function Test-Prerequisites {
function Test-GuidFormat {
function Test-EmailFormat {
function Test-UPNFormat {
function Test-ConfigurationFileStructure {
function Test-DirectoryWriteAccessRedux {
function Test-ModuleAvailabilityByName {
function Test-BasicNetworkConnectivity {
function Test-DataQualitySimple {
function Export-ValidationReportSimple {
📦 Variables Used:
$allChecksPass = $true
$validationIssues = [System.Collections.Generic.List[string]]::new()
$criticalPaths = @("SuiteRoot", "CompanyProfileRoot", "LogOutput", "RawDataOutput", "ProcessedDataOutput", "Modules", "Utilities")
null=[System.Net.Mail.MailAddress]::new(null = [System.Net.Mail.MailAddress]::new(
null=[System.Net.Mail.MailAddress]::new(EmailString)

$requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
$missingSections = @()
testFileName = "access_test_
(Get-Random -Minimum 100000 -Maximum 999999).tmp"

$testFilePath = Join-Path $DirectoryPath $testFileName
$allAvailable = $true
$unavailableModules = [System.Collections.Generic.List[string]]::new()
$allConnected = $true
$failedEndpoints = [System.Collections.Generic.List[string]]::new()
$computerName = $endpointSpec
$port = 443
$connectionResult = Test-NetConnection -ComputerName $computerName -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
$issuesFound = [System.Collections.Generic.List[string]]::new()
$invalidRecordCount = 0
$totalRecords = $DataCollection.Count
record = $DataCollection[
i]

recordIdentifier=if(recordIdentifier = if (
recordIdentifier=if(record.PSObject.Properties["UserPrincipalName"]) { record.UserPrincipalName } elseif (
record.PSObject.Properties["Id"]) { $record.Id } else { "Record Index $i" }

$currentRecordIssues = 0
$reportPathBase = $Context.Paths.LogOutput | global:Get-OrElse "."
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
reportFilePath = Join-Path $reportPathBase "
{ReportName}_ValidationReport_$timestamp.txt"

$reportContent = [System.Collections.Generic.List[string]]::new()

📁 Path: Modules/Utilities/logging.psm1
🔧 Purpose: Enhanced logging with improved visual output for M&A Discovery Suite | Provides structured logging with enhanced visual indicators, emojis, and better formatting
📌 Declared Functions:

function Initialize-Logging {
function Write-MandALog {
function Test-LogMessage {
function Get-LogColor {
function Get-LogEmoji {
function Write-ProgressBar {
function Write-StatusTable {
function Write-SectionHeader {
function Write-CompletionSummary {
function Move-LogFile {
function Clear-OldLogFiles {
function Get-LoggingConfiguration {
function Set-LogLevel {
function Set-LoggingOptions {
📦 Variables Used:
$script:LoggingConfig = @{
$logPath = Join-Path $Configuration.environment.outputPath "Logs"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
logFileName = "MandA_Discovery_
timestamp.log"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
logEntry="[logEntry = "[
logEntry="[timestamp] [Level][Level] [
Level][Component] $Message"

$color = Get-LogColor -Level $Level
$emoji = Get-LogEmoji -Level $Level
progressMessage=if(progressMessage = if (
progressMessage=if(script
:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
importantMessage=if(importantMessage = if (
importantMessage=if(script
:LoggingConfig.UseEmojis) { "$emoji $Message" } else { "! $Message" }
displayMessage=if(displayMessage = if (
displayMessage=if(script
:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
$fileMessage = $Message -replace '[\uD83C-\uDBFF\uDC00-\uDFFF]+', ''
fileLogEntry="[fileLogEntry = "[
fileLogEntry="[timestamp] [Level][Level] [
Level][Component] $fileMessage"

$logFile = Get-Item $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
$levelHierarchy = @{
currentLevel = $levelHierarchy[
script
:LoggingConfig.LogLevel]
messageLevel = $levelHierarchy[
Level]

percentComplete=[math]::Round((percentComplete = [math]::Round((
percentComplete=[math]::Round((Current / $Total) * 100, 1)

completed=[math]::Floor((completed = [math]::Floor((
completed=[math]::Floor((Current / $Total) * $Width)

$remaining = $Width - $completed
$progressBar = "#" * $completed + "-" * $remaining
progressText="progressText = "
progressText="Activity [$progressBar] $percentComplete% $Status"

maxKeyLength=(maxKeyLength = (
maxKeyLength=(StatusData.Keys | Measure-Object -Property Length -Maximum).Maximum

tableWidth=[math]::Max(tableWidth = [math]::Max(
tableWidth=[math]::Max(maxKeyLength + 20, 60)

key = $item.Key.PadRight(
maxKeyLength)

$value = $item.Value
$statusColor = "White"
$padding = $tableWidth - $key.Length - $value.ToString().Length - 7
headerText=if(headerText = if (
headerText=if(Subtitle) { "Icon $Title - $Subtitle" } else { "
Icon $Title" }

$logDir = Split-Path $script:LoggingConfig.LogFile -Parent
$logName = Split-Path $script:LoggingConfig.LogFile -LeafBase
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
rotatedLogFile = Join-Path $logDir "
logName`_$timestamp.log"

cutoffDate=(Get−Date).AddDays(−cutoffDate = (Get-Date).AddDays(-
cutoffDate=(Get−Date).AddDays(−script
:LoggingConfig.LogRetentionDays)
$oldLogFiles = Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

📁 Path: QuickStart.ps1
🔧 Purpose: M&A Discovery Suite - Quick Start Entry Point (Rewritten v6.0.0) | User-friendly entry point to initialize the M&A Discovery Suite environment for a specific company and then launch the main orchestrator. This script ensures the environment is correctly set up before any operations begin.
📌 Declared Functions:

(No functions declared - this is a script)
📦 Variables Used:
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"
$script:QuickStartTime = Get-Date
$script:QuickStartVersion = "6.0.0 (Rewritten)"
$SuiteRoot = $PSScriptRoot
$ProfilesBasePath = Join-Path $SuiteRoot "Profiles"
$ExistingProfiles = @()
$ExistingProfiles = Get-ChildItem -Path $ProfilesBasePath -Directory -ErrorAction SilentlyContinue |
$Selection = Read-Host "`n[QuickStart] Select a profile number or 'N' for new"
Index=[int]Index = [int]
Index=[int]Selection - 1

CompanyName = $ExistingProfiles[
Index]

$CompanyName = Read-Host "[QuickStart] Enter new company name"
$CompanyName = $CompanyName -replace '[<>:"/\|?*]', '_'
$EnvScriptPath = Join-Path $SuiteRoot "Scripts\Set-SuiteEnvironment.ps1"
$OrchestratorPath = $global:MandA.Paths.OrchestratorScript
$OrchestratorParams = @{
$ExitCode = $LASTEXITCODE
$Duration = (Get-Date) - $script:QuickStartTime