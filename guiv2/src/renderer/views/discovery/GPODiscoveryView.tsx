import { useState } from "react";
import { useProfileStore } from "../../store/useProfileStore";
import { useGPODiscovery } from "../../hooks/useGPODiscovery";
import DataTable from "../../components/DataTable";

export default function GPODiscoveryView(){
  const { source } = useProfileStore();
  const { start, progress, rows } = useGPODiscovery(selectedSourceProfile?.id || "");
  const [config, setConfig] = useState<Record<string, any>>({});

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">GPO Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); start(config); }}>
        
        <label className="text-sm">Message</label>
        <input className="border p-2" type="text" value={(config as any)["Message"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Message: e.target.value}))} />

        <label className="text-sm">Level</label>
        <input className="border p-2" type="text" value={(config as any)["Level"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Level: e.target.value}))} />

        <label className="text-sm">Component</label>
        <input className="border p-2" type="text" value={(config as any)["Component"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Component: e.target.value}))} />

        <label className="text-sm">Context</label>
        <input className="border p-2" type="text" value={(config as any)["Context"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, Context: e.target.value}))} />
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile}>Start</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${progress||0}%` }} /></div>
      <DataTable rows={rows} />
    </div>
  );
}
