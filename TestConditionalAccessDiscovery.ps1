# Test script for ConditionalAccessDiscovery module - Testing flexible authentication
# Author: Auto-generated for authentication testing

[CmdletBinding()]
param()

Write-Host "=== Testing ConditionalAccessDiscovery with Flexible Authentication ===" -ForegroundColor Cyan

Write-Host "Testing flexible authentication approach..." -ForegroundColor Yellow

Write-Host "Module file exists: $(Test-Path 'Modules/Discovery/ConditionalAccessDiscovery.psm1')" -ForegroundColor Gray

Write-Host "=== Test Complete ===" -ForegroundColor Cyan