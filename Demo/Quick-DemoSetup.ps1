Write-Host "=== M&A Discovery Suite - Customer Demo Setup ===" -ForegroundColor Cyan

# Create demo directories
$demoRoot = "D:\Scripts\UserMandA\Demo"
$directories = @(
    "$demoRoot\Data",
    "$demoRoot\Scenarios", 
    "$demoRoot\Scripts"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Create sample demo data for Technology industry
Write-Host "Creating demo data for TechCorp Industries (5000 users)..." -ForegroundColor Yellow

$sampleData = @"
Id,Name,Department,Email,SourceDomain,TargetDomain
USER0001,Alex Chen,Engineering,alex.chen@techcorp.com,contoso.local,techcorp.com
USER0002,Maria Gonzalez,Product,maria.gonzalez@techcorp.com,contoso.local,techcorp.com
USER0003,James Kim,DevOps,james.kim@techcorp.com,contoso.local,techcorp.com
USER0004,Rebecca Zhang,Data Science,rebecca.zhang@techcorp.com,contoso.local,techcorp.com
USER0005,Thomas Anderson,Security,thomas.anderson@techcorp.com,contoso.local,techcorp.com
"@

$sampleData | Out-File -FilePath "$demoRoot\Data\demo_users.csv" -Encoding UTF8
Write-Host "   Created demo user data" -ForegroundColor Green

# Create demo scenario
$scenario = @"
# TechCorp Industries Migration Scenario
Description: Enterprise technology company acquisition
User Count: 5000
Duration: 5 days
Industry: Technology

Source: contoso.local (Legacy IT infrastructure)
Target: techcorp.com (Modern cloud infrastructure)

Migration Components:
- User Accounts (5000 users)
- Exchange Online mailboxes
- SharePoint sites and libraries  
- OneDrive for Business
- Security groups and permissions
- Microsoft Teams
"@

$scenario | Out-File -FilePath "$demoRoot\Scenarios\TechCorp_Migration.txt" -Encoding UTF8
Write-Host "   Created migration scenario" -ForegroundColor Green

# Create simple ROI script
$roi = @'
Write-Host "=== TechCorp Industries ROI Analysis ===" -ForegroundColor Cyan

$userCount = 5000
$manualCost = $userCount * 4 * 150  # 4 hours per user at $150/hour
$sharegateCost = ($userCount * 0.15) + 50000  # ShareGate pricing
$mandaCost = 250000  # Fortune 500 package

Write-Host "Migration Cost Comparison:" -ForegroundColor Yellow
Write-Host "  Manual Migration: $($manualCost.ToString('C'))" -ForegroundColor Red
Write-Host "  ShareGate/Quest:  $($sharegateCost.ToString('C'))" -ForegroundColor Yellow  
Write-Host "  M&A Discovery:   $($mandaCost.ToString('C'))" -ForegroundColor Green

$savings = $sharegateCost - $mandaCost
$percentage = [math]::Round($savings/$sharegateCost*100,0)

Write-Host ""
Write-Host "Cost Savings: $($savings.ToString('C')) ($percentage% reduction)" -ForegroundColor Green
Write-Host "Time to Value: 5 days vs 4 weeks (ShareGate)" -ForegroundColor Green
Write-Host ""
'@

$roi | Out-File -FilePath "$demoRoot\Scripts\Show-ROI.ps1" -Encoding UTF8
Write-Host "   Created ROI calculator" -ForegroundColor Green

Write-Host ""
Write-Host "Demo environment ready!" -ForegroundColor Green
Write-Host "Location: $demoRoot" -ForegroundColor Cyan