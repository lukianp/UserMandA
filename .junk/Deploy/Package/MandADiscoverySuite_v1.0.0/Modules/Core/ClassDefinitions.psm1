# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Centralized class definitions for M&A Discovery Suite
.DESCRIPTION
    This module provides centralized class definitions for the M&A Discovery Suite, serving as the single source of truth 
    for all custom classes to prevent type conflicts and ensure consistency across all discovery modules. It includes the 
    core DiscoveryResult class with comprehensive error handling, warning management, and metadata tracking capabilities.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+
#>

# Only define if not already loaded
if (-not $global:MandAClassesLoaded) {
    
    # DiscoveryResult Class - Used by all discovery modules
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public int RecordCount { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.RecordCount = 0;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception) {
        AddError(message, exception, new System.Collections.Hashtable());
    }
    
    public void AddError(string message, System.Exception exception, System.Collections.Hashtable context) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        
        if (exception != null) {
            errorEntry["Exception"] = exception.ToString();
            errorEntry["ExceptionType"] = exception.GetType().FullName;
            errorEntry["StackTrace"] = exception.StackTrace;
            errorEntry["InnerException"] = exception.InnerException != null ? exception.InnerException.Message : null;
        } else {
            errorEntry["Exception"] = null;
            errorEntry["ExceptionType"] = null;
            errorEntry["StackTrace"] = System.Environment.StackTrace;
        }
        
        errorEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void AddWarning(string message) {
        AddWarning(message, new System.Collections.Hashtable());
    }
    
    public void AddWarning(string message, System.Collections.Hashtable context) {
        var warningEntry = new System.Collections.Hashtable();
        warningEntry["Timestamp"] = System.DateTime.Now;
        warningEntry["Message"] = message;
        warningEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Warnings.Add(warningEntry);
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
            this.Metadata["DurationSeconds"] = duration.TotalSeconds;
        }
        
        // Auto-calculate record count if Data is collection
        if (this.Data != null) {
            var dataType = this.Data.GetType();
            if (dataType.IsArray) {
                this.RecordCount = ((System.Array)this.Data).Length;
            } else if (this.Data is System.Collections.ICollection) {
                this.RecordCount = ((System.Collections.ICollection)this.Data).Count;
            }
        }
        
        // Mark as failed if there are any errors
        if (this.Errors.Count > 0) {
            this.Success = false;
        }
    }
    
    public string ToJsonString() {
        var json = new System.Text.StringBuilder();
        json.AppendLine("{");
        json.AppendLine(string.Format("  \"Success\": {0},", this.Success.ToString().ToLower()));
        json.AppendLine(string.Format("  \"ModuleName\": \"{0}\",", this.ModuleName));
        json.AppendLine(string.Format("  \"RecordCount\": {0},", this.RecordCount));
        json.AppendLine(string.Format("  \"ExecutionId\": \"{0}\",", this.ExecutionId));
        json.AppendLine(string.Format("  \"StartTime\": \"{0}\",", this.StartTime.ToString("yyyy-MM-dd HH:mm:ss")));
        json.AppendLine(string.Format("  \"EndTime\": \"{0}\",", this.EndTime.ToString("yyyy-MM-dd HH:mm:ss")));
        json.AppendLine(string.Format("  \"DurationSeconds\": {0},", this.Metadata.ContainsKey("DurationSeconds") ? this.Metadata["DurationSeconds"].ToString() : "0"));
        json.AppendLine(string.Format("  \"ErrorCount\": {0},", this.Errors.Count));
        json.AppendLine(string.Format("  \"WarningCount\": {0}", this.Warnings.Count));
        json.AppendLine("}");
        return json.ToString();
    }
}
'@ -Language CSharp
    }
    
    # Mark classes as loaded
    $global:MandAClassesLoaded = $true
}

# Export initialization function
function Initialize-MandAClasses {
    # This function ensures classes are loaded
    return $global:MandAClassesLoaded
}

Export-ModuleMember -Function Initialize-MandAClasses