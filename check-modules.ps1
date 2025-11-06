$modules = @('ConditionalAccessDiscovery', 'LicensingDiscovery', 'IntuneDiscovery', 'ExchangeDiscovery')

foreach ($mod in $modules) {
    try {
        Import-Module "D:\Scripts\UserMandA\Modules\Discovery\$mod.psm1" -Force -ErrorAction Stop
        $cmd = Get-Command "Invoke-$mod" -ErrorAction Stop
        $count = $cmd.ScriptBlock.Ast.Body.EndBlock.Statements.Count
        Write-Host "$mod : $count statements"
    } catch {
        Write-Host "$mod : ERROR - $($_.Exception.Message)"
    }
}
