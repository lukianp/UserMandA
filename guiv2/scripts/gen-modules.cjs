/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MODULES_ROOT = "D:\\Scripts\\UserMandA\\modules";
const DISC_DIR = path.join(MODULES_ROOT, "Discovery");
const MIG_DIR = path.join(MODULES_ROOT, "Migration");

function pascalCase(s) {
  return s.replace(/(^|[-_.\s]+)([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
}
function safeEnumKey(s) {
  return pascalCase(s).replace(/^\d/, (d) => "_" + d);
}
function inferArgsFromPs1(psPath) {
  const txt = fs.readFileSync(psPath, "utf8");
  const m = txt.match(/param\s*\(([\s\S]*?)\)/im);
  if (!m) return {};
  const block = m[1];
  // naive parse: lines like [string]$Scope, [int]$PageSize = 100, [switch]$Verbose
  const args = {};
  for (const line of block.split(/[\r\n]+/)) {
    const mm = line.match(/\[\s*([a-zA-Z]+)\s*\]\s*\$\s*([a-zA-Z0-9_]+)/);
    if (!mm) continue;
    const psType = mm[1].toLowerCase();
    const name = mm[2];
    let t = "string";
    if (psType.includes("int")) t = "number";
    else if (psType.includes("bool") || psType.includes("switch")) t = "boolean";
    args[name] = t;
  }
  return args;
}
function trySchema(psPath) {
  const schemaPath = psPath.replace(/\.psm1$/i, ".schema.json");
  if (fs.existsSync(schemaPath)) {
    try { return JSON.parse(fs.readFileSync(schemaPath, "utf8")); }
    catch { /* ignore */ }
  }
  return null;
}
function listPsm1(dir) {
  console.log(`Scanning directory: ${dir}`);
  if (!fs.existsSync(dir)) {
    console.log(`  Directory does not exist!`);
    return [];
  }
  const files = fs.readdirSync(dir);
  console.log(`  Found ${files.length} files/dirs total`);
  const psm1Files = files.filter(f => f.toLowerCase().endsWith(".psm1"));
  console.log(`  Found ${psm1Files.length} .psm1 files`);
  return psm1Files.map(f => path.join(dir, f));
}

const discoveryPs = listPsm1(DISC_DIR);
const migrationPs = listPsm1(MIG_DIR);

console.log(`\nTotal: ${discoveryPs.length} discovery modules, ${migrationPs.length} migration modules`);

if (!discoveryPs.length && !migrationPs.length) {
  console.error("No modules found under D:\\Scripts\\UserMandA\\modules\\{Discovery,Migration}");
  process.exit(2);
}

const registryOut = path.join(ROOT, "src", "main", "modules", "registry.ts");
const hooksDir = path.join(ROOT, "src", "renderer", "hooks");
const viewsDiscDir = path.join(ROOT, "src", "renderer", "views", "discovery");
const viewsMigDir = path.join(ROOT, "src", "renderer", "views", "migration");
const routesAuto = path.join(ROOT, "src", "renderer", "AppRoutes.autogen.tsx");

// ensure dirs
for (const d of [path.dirname(registryOut), hooksDir, viewsDiscDir, viewsMigDir]) {
  fs.mkdirSync(d, { recursive: true });
}

const discoveryEntries = [];
const migrationEntries = [];
const discRoutes = [];
const migRoutes = [];

// Track seen provider names to handle duplicates
const seenDiscoveryProviders = new Set();
const seenMigrationProviders = new Set();

for (const ps of discoveryPs) {
  const base = path.basename(ps, ".psm1");     // e.g., ActiveDirectoryDiscovery
  let Provider = pascalCase(base.replace(/Discovery$/i, "")); // ActiveDirectory

  // If duplicate, use full basename instead
  if (seenDiscoveryProviders.has(Provider)) {
    Provider = pascalCase(base); // Use full name like ApplicationDiscovery
    console.log(`  Duplicate detected, using full name: ${Provider}`);
  }
  seenDiscoveryProviders.add(Provider);

  const enumKey = safeEnumKey(Provider);
  const schema = trySchema(ps) || inferArgsFromPs1(ps);

  discoveryEntries.push({ Provider, enumKey, ps, schema });

  // Hook
  const hookName = `use${Provider}Discovery`;
  const hookPath = path.join(hooksDir, `${hookName}.ts`);
  if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, `import { useDiscovery } from "./useDiscovery";
export function ${hookName}(profileId: string){
  return useDiscovery("${Provider}", profileId);
}
`);
  }

  // View
  const viewName = `${Provider}DiscoveryView`;
  const viewPath = path.join(viewsDiscDir, `${viewName}.tsx`);
  if (!fs.existsSync(viewPath)) {
    const fields = Object.entries(schema).map(([k,t]) => {
      const type = t === "number" ? "number" : "text";
      return `
        <label className="text-sm">${k}</label>
        <input className="border p-2" type="${type}" value={(config as any)["${k}"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, ${k}: ${type==="number" ? "+e.target.value" : "e.target.value"}}))} />`;
    }).join("\n");

    fs.writeFileSync(viewPath, `import { useState } from "react";
import { useProfileStore } from "../../store/useProfileStore";
import { ${hookName} } from "../../hooks/${hookName}";
import DataTable from "../../components/DataTable";

export default function ${viewName}(){
  const { selectedSourceProfile } = useProfileStore();
  const { start, progress, rows } = ${hookName}(selectedSourceProfile?.id || "");
  const [config, setConfig] = useState<Record<string, any>>({});

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">${Provider} Discovery</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); start(config); }}>
        ${fields || `<div className="col-span-3 text-sm text-neutral-600">No parameters</div>`}
        <div className="col-span-3"><button className="border rounded p-2" type="submit" disabled={!selectedSourceProfile}>Start</button></div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: \`\${progress||0}%\` }} /></div>
      <DataTable rows={rows} />
    </div>
  );
}
`);
  }

  // Route
  const routePath = `/discovery/${Provider.toLowerCase()}`;
  discRoutes.push(`{ path: "${routePath}", element: <${Provider}DiscoveryView /> }`);
}

for (const ps of migrationPs) {
  const base = path.basename(ps, ".psm1");  // e.g., ExchangeMailboxMigration
  let Provider = pascalCase(base.replace(/Migration$/i, "")); // ExchangeMailbox

  // If duplicate, use full basename instead
  if (seenMigrationProviders.has(Provider)) {
    Provider = pascalCase(base); // Use full name like MailboxMigrationBackup
    console.log(`  Duplicate detected, using full name: ${Provider}`);
  }
  seenMigrationProviders.add(Provider);

  const enumKey = safeEnumKey(Provider);
  const schema = trySchema(ps) || inferArgsFromPs1(ps);

  migrationEntries.push({ Provider, enumKey, ps, schema });

  // Hook
  const hookName = `use${Provider}Migration`;
  const hookPath = path.join(hooksDir, `${hookName}.ts`);
  if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, `import { useCallback, useEffect, useRef, useState } from "react";
declare global { interface Window { electronAPI: any } }
export function ${hookName}(profileId: string){
  const [runId, setRunId] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const buffer = useRef<any[]>([]);

  const plan = useCallback(async (args: any) => {
    const { runId } = await window.electronAPI.planMigration({ provider: "${Provider}", profileId, args });
    setRunId(runId);
  }, [profileId]);

  const execute = useCallback(async (args: any) => {
    const { runId } = await window.electronAPI.executeMigration({ provider: "${Provider}", profileId, args });
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
`);
  }

  // View
  const viewName = `${Provider}MigrationView`;
  const viewPath = path.join(viewsMigDir, `${viewName}.tsx`);
  if (!fs.existsSync(viewPath)) {
    const fields = Object.entries(schema).map(([k,t]) => {
      const type = t === "number" ? "number" : "text";
      return `
        <label className="text-sm">${k}</label>
        <input className="border p-2" type="${type}" value={(config as any)["${k}"] ?? ""} onChange={(e)=>setConfig((c:any)=>({...c, ${k}: ${type==="number" ? "+e.target.value" : "e.target.value"}}))} />`;
    }).join("\n");

    fs.writeFileSync(viewPath, `import { useState } from "react";
import { useProfileStore } from "../../store/useProfileStore";
import { ${hookName} } from "../../hooks/${hookName}";
import DataTable from "../../components/DataTable";

export default function ${viewName}(){
  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();
  const { plan, execute, progress, rows } = ${hookName}(selectedTargetProfile?.id || selectedSourceProfile?.id || "");
  const [config, setConfig] = useState<Record<string, any>>({});

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">${Provider} Migration</h1>
      <form className="grid grid-cols-3 gap-2" onSubmit={(e)=>{ e.preventDefault(); }}>
        ${fields || `<div className="col-span-3 text-sm text-neutral-600">No parameters</div>`}
        <div className="col-span-3 flex gap-2">
          <button className="border rounded p-2" type="button" disabled={!selectedSourceProfile} onClick={()=>plan(config)}>Plan</button>
          <button className="border rounded p-2" type="button" disabled={!selectedTargetProfile && !selectedSourceProfile} onClick={()=>execute(config)}>Execute</button>
        </div>
      </form>
      <div className="h-2 bg-neutral-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: \`\${progress||0}%\` }} /></div>
      <DataTable rows={rows} />
    </div>
  );
}
`);
  }

  // Route
  const routePath = `/migration/${Provider.toLowerCase()}`;
  migRoutes.push(`{ path: "${routePath}", element: <${Provider}MigrationView /> }`);
}

// REGISTRY
const registryHeader = `import * as path from "path";
export type JsType = "string" | "number" | "boolean";
export interface ModuleSpec { script: string; argsSchema: Record<string, JsType>; timeoutSec?: number; }
const ROOT = "D:\\\\Scripts\\\\UserMandA\\\\modules";
`;

let discMap = "export const DiscoveryModules: Record<string, ModuleSpec> = {\n";
for (const e of discoveryEntries) {
  discMap += `  ${e.enumKey}: { script: path.join(ROOT, "Discovery", "${path.basename(e.ps)}"), argsSchema: ${JSON.stringify(e.schema)} },\n`;
}
discMap += "};\n";

let migMap = "export const MigrationModules: Record<string, ModuleSpec> = {\n";
for (const e of migrationEntries) {
  migMap += `  ${e.enumKey}: { script: path.join(ROOT, "Migration", "${path.basename(e.ps)}"), argsSchema: ${JSON.stringify(e.schema)} },\n`;
}
migMap += "};\n";

fs.writeFileSync(registryOut, registryHeader + "\n" + discMap + "\n" + migMap);

// ROUTES AUTOGEN
const imports = [
  ...discoveryEntries.map(e => `import ${e.Provider}DiscoveryView from "./views/discovery/${e.Provider}DiscoveryView";`),
  ...migrationEntries.map(e => `import ${e.Provider}MigrationView from "./views/migration/${e.Provider}MigrationView";`),
].join("\n");

const routesFile = `${imports}

export const AUTO_DISCOVERY_ROUTES = [
  ${discRoutes.join(",\n  ")}
];

export const AUTO_MIGRATION_ROUTES = [
  ${migRoutes.join(",\n  ")}
];
`;

fs.writeFileSync(routesAuto, routesFile);

console.log("Generated:");
console.log(" - registry:", path.relative(ROOT, registryOut));
console.log(" - routes:  ", path.relative(ROOT, routesAuto));
console.log(" - hooks/views for", discoveryEntries.length, "discovery and", migrationEntries.length, "migration modules");
