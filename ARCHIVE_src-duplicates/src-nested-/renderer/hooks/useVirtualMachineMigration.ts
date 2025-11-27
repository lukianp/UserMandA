import { useCallback, useEffect, useRef, useState } from "react";
declare global { interface Window { electronAPI: any } }
export function useVirtualMachineMigration(profileId: string){
  const [runId, setRunId] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const buffer = useRef<any[]>([]);

  const plan = useCallback(async (args: any) => {
    const { runId } = await window.electronAPI.planMigration({ provider: "VirtualMachine", profileId, args });
    setRunId(runId);
  }, [profileId]);

  const execute = useCallback(async (args: any) => {
    const { runId } = await window.electronAPI.executeMigration({ provider: "VirtualMachine", profileId, args });
    setRunId(runId);
  }, [profileId]);

  useEffect(() => {
    const onP = (e:any)=>{ if(e.runId!==runId) return; if(e.pct!==undefined) setProgress(e.pct); if(e.row){ buffer.current.push(e.row); if(buffer.current.length>=200){ setRows(p=>p.concat(buffer.current)); buffer.current=[]; } } };
    const onR = ()=>{ if(buffer.current.length){ setRows(p=>p.concat(buffer.current)); buffer.current=[]; } };
    window.electronAPI.onMigrationProgress(onP);
    window.electronAPI.onMigrationResult(onR);
  }, [runId]);

  useEffect(()=>{ const t=setInterval(()=>{ if(buffer.current.length){ setRows(p=>p.concat(buffer.current)); buffer.current=[]; } },500); return ()=>clearInterval(t); }, []);

  return { plan, execute, progress, rows, runId };
}
