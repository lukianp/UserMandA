M&A Discovery Suite - Log Monitoring Tools

Usage:
1. Run start-log-monitor.ps1 to begin continuous log monitoring
2. Outputs will be tracked in:
   - defect-tracking.json (real-time defect log)
   - monitor-errors.log (script execution errors)

Monitoring Targets:
- MandADiscovery_*.log
- gui-clicks.log
- structured_log_*.log

Tracked Defect Types:
- XAML Binding Errors
- Module Loading Failures
- Navigation Exceptions
- Performance Issues
- Resource Loading Problems

Recommendation:
Run this script before starting the M&A Discovery application to capture all real-time logs.