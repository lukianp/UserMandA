import { useState } from "react";

import { useProfileStore } from "../../store/useProfileStore";
import { useCertificateAuthorityDiscoveryLogic } from "../../hooks/useCertificateAuthorityDiscoveryLogic";
import DataTable from "../../components/DataTable";
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

export default function CertificateAuthorityDiscoveryView(){
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
  } = useCertificateAuthorityDiscoveryLogic();
  const [config, setConfig] = useState<Record<string, any>>({});

  // Convert result to rows for DataTable
  const rows = result?.certificateAuthorities || [];

  return (
    <div className="p-4 space-y-3" data-testid="certificate-authority-discovery-view" data-cy="certificate-authority-discovery-view">
      <h1 className="text-xl font-semibold">CertificateAuthority Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); startDiscovery(); }}>
        <div className="col-span-3 text-sm text-neutral-600">No parameters</div>
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile || isDiscovering}>{isDiscovering ? 'Discovering...' : 'Start'}</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress?.percentage || 0}%` }} /></div>
      <DataTable rows={rows} />

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Certificate Authority Discovery"
        scriptDescription="Discovering Certificate Authorities and templates"
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
