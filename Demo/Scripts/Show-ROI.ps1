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
