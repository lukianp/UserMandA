import { useState } from "react";

import { useProfileStore } from "../../store/useProfileStore";
import { useFileServerDiscoveryLogic } from "../../hooks/useFileServerDiscoveryLogic";
import DataTable from "../../components/DataTable";
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

export default function FileServerDiscoveryView(){
  const { selectedSourceProfile } = useProfileStore();
  const {
    isDiscovering,
    isCancelling,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    progress,
    result,
    startDiscovery,
    cancelDiscovery,
  } = useFileServerDiscoveryLogic();
  const [config, setConfig] = useState<Record<string, any>>({});

  // Convert result to rows for DataTable
  const rows = result?.shares || [];

  return (
    <div className="p-4 space-y-3" data-testid="file-server-discovery-view" data-cy="file-server-discovery-view">
      <h1 className="text-xl font-semibold">FileServer Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); startDiscovery(); }}>

        <label className="text-sm">Message</label>
        <input className="border p-2" type="text" value={(config as any)["Message"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Message: e.target.value}))} />

        <label className="text-sm">Level</label>
        <input className="border p-2" type="text" value={(config as any)["Level"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Level: e.target.value}))} />

        <label className="text-sm">Component</label>
        <input className="border p-2" type="text" value={(config as any)["Component"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Component: e.target.value}))} />

        <label className="text-sm">Context</label>
        <input className="border p-2" type="text" value={(config as any)["Context"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Context: e.target.value}))} />
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile || isDiscovering}>{isDiscovering ? 'Discovering...' : 'Start'}</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress?.percentage || 0}%` }} /></div>
      <DataTable rows={rows} />

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="File Server Discovery"
        scriptDescription="Discovering file shares, quotas, and shadow copies"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || ''
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
}
