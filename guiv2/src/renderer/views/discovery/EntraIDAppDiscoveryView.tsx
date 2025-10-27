import { useState } from "react";

import { useProfileStore } from "../../store/useProfileStore";
import { useEntraIDAppDiscovery } from "../../hooks/useEntraIDAppDiscovery";
import DataTable from "../../components/DataTable";

export default function EntraIDAppDiscoveryView(){
  const { selectedSourceProfile } = useProfileStore();
  const { start, progress, rows } = useEntraIDAppDiscovery(selectedSourceProfile?.id || "");
  const [config, setConfig] = useState<Record<string, any>>({});

  return (
    <div className="p-4 space-y-3" data-testid="entra-i-d-app-discovery-view" data-cy="entra-i-d-app-discovery-view">
      <h1 className="text-xl font-semibold">EntraIDApp Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); start(config); }}>
        <div className="col-span-3 text-sm text-neutral-600">No parameters</div>
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile}>Start</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress||0}%` }} /></div>
      <DataTable rows={rows} />
    </div>
  );
}
