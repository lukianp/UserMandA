import { useState } from "react";
import { useProfileStore } from "../../store/useProfileStore";
import { useSharePointMigration } from "../../hooks/useSharePointMigration";
import DataTable from "../../components/DataTable";

export default function SharePointMigrationView(){
  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();
  const { plan, execute, progress, rows } = useSharePointMigration(selectedTargetProfile?.id || selectedSourceProfile?.id || "");
  const [config, setConfig] = useState<Record<string, any>>({});

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">SharePoint Migration</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); }}>
        <div className="col-span-3 text-sm text-neutral-600">No parameters</div>
        <div className="col-span-3 flex gap-2">
          <button className="border rounded p-2" type="button" disabled={!selectedSourceProfile} onClick={()=>plan(config)}>Plan</button>
          <button className="border rounded p-2" type="button" disabled={!selectedTargetProfile && !selectedSourceProfile} onClick={()=>execute(config)}>Execute</button>
        </div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress||0}%` }} /></div>
      <DataTable rows={rows} />
    </div>
  );
}
