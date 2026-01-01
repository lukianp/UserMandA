import { useState } from "react";

import { useProfileStore } from "../../store/useProfileStore";
import { usePhysicalServerDiscoveryLogic } from "../../hooks/usePhysicalServerDiscoveryLogic";
import DataTable from "../../components/DataTable";
import PowerShellExecutionDialog from "../../components/molecules/PowerShellExecutionDialog";
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

export default function PhysicalServerDiscoveryView(){
  const { selectedSourceProfile } = useProfileStore();
  const {
    isDiscovering,
    progress,
    result,
    startDiscovery,
    cancelDiscovery,
    isCancelling,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = usePhysicalServerDiscoveryLogic();
  const [config, setConfig] = useState<Record<string, any>>({});

  // Extract rows from result
  const rows = result?.servers || result?.hardwareInfo || [];

  return (
    <div className="p-4 space-y-3" data-testid="physical-server-discovery-view" data-cy="physical-server-discovery-view">
      <h1 className="text-xl font-semibold">PhysicalServer Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); startDiscovery(); }}>
        <div className="col-span-3 text-sm text-neutral-600">No parameters</div>
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile || isDiscovering}>Start</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress?.percentage || 0}%` }} /></div>
      <DataTable rows={rows} />

      <ViewDiscoveredDataButton
        moduleId="physical-server"
        recordCount={rows?.length || 0}
        disabled={!result || rows.length === 0}
      />

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Physical Server Discovery"
        scriptDescription="Discovering physical servers, hardware info, CPU, memory, storage, and network adapters"
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
