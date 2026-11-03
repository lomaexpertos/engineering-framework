import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function validateRunnerConfiguration(config,{scope}={}) {
  if(!config || Array.isArray(config) || config.schema_version!==1 || config.checks!==undefined && !Array.isArray(config.checks) || config.runners!==undefined && (!config.runners || typeof config.runners!=='object' || Array.isArray(config.runners))) throw new Error('Invalid project config');
  const ids=new Set();
  const checks=(config.checks===undefined?[]:config.checks).filter(check=>!scope || check.scope===scope).map(check=> {
    const runner=config.runners?.[check.runner];
    if(!/^[a-z0-9][a-z0-9_-]*$/.test(check.id||'') || ids.has(check.id)) throw new Error('Invalid/duplicate check id');ids.add(check.id);
    if(!runner || typeof runner.image!=='string' || !/^[a-zA-Z0-9][a-zA-Z0-9._/:@-]*$/.test(runner.image) || /:latest$/.test(runner.image) || !(runner.image.includes('@') ? /@sha256:[a-f0-9]{64}$/.test(runner.image) : /:[^/:]+$/.test(runner.image))) throw new Error(`Runner ${check.runner} requires an explicit image tag/digest`);
    if(!Number.isInteger(check.timeout_seconds) || check.timeout_seconds<1 || check.timeout_seconds>86400) throw new Error('Timeout must be 1..86400 seconds');
    if(!Array.isArray(check.argv) || !check.argv.length || check.argv.some(arg=>typeof arg!=='string' || arg.includes('\0')) || !check.argv[0]) throw new Error('Invalid check argv');
    if(typeof check.scope!=='string' || !check.scope || typeof check.required!=='boolean' || typeof check.evidence!=='string' || !check.evidence || typeof check.applicability!=='string' || !check.applicability) throw new Error('Check requires scope/required/evidence/applicability');
    return {...check,image:runner.image};
  });
  return checks;
}
export function runnerPlan(root,{scope}={}) {
  const file=path.join(root,'.harness/project/config.json');
  if(!fs.existsSync(file)) return {schema_version:1,config_sha256:null,checks:[]};
  if(fs.lstatSync(file).isSymbolicLink()) throw new Error('Config symlink prohibited');
  const content=fs.readFileSync(file,'utf8'),config=JSON.parse(content);
  const checks=validateRunnerConfiguration(config,{scope});
  return {schema_version:1,config_sha256:crypto.createHash('sha256').update(content).digest('hex'),checks};
}
export function results(root,ledger,{scope}={}) {
  const plan=runnerPlan(root,{scope});
  const parts=fs.readFileSync(ledger,'utf8').split('\0');
  if(parts.pop()!=='' || parts.length%2) throw new Error('Invalid execution ledger');
  const seen=new Set();
  const checks=[];
  for(let i=0;i<parts.length;i+=2) {
    const id=parts[i],code=parts[i+1];
    if(seen.has(id) || !plan.checks.some(check=>check.id===id) || !/^\d+$/.test(code) || Number(code)>255) throw new Error('Invalid check result');
    seen.add(id);checks.push({id,exit_code:Number(code),executed_at:new Date().toISOString()});
  }
  return {schema_version:1,config_sha256:plan.config_sha256,checks};
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const argv=process.argv.slice(2),command=argv.shift();
    const option=name=> {const index=argv.indexOf(`--${name}`);return index>=0?argv[index+1]:undefined;};
    const root=option('root')||process.cwd(),scope=option('scope');
    if(command==='plan') {
      const plan=runnerPlan(root,{scope});
      process.stdout.write((plan.config_sha256||'none')+'\0');
      for(const check of plan.checks) process.stdout.write([check.id,check.image,String(check.timeout_seconds),String(check.argv.length),...check.argv].join('\0')+'\0');
    } else if(command==='results') {
      if((runnerPlan(root,{scope}).config_sha256||'none')!==option('config-sha')) throw new Error('Config changed during check execution; rerun checks');
      fs.writeFileSync(option('destination'),JSON.stringify(results(root,option('ledger'),{scope}),null,2)+'\n');
    } else throw new Error('Expected plan or results command');
  } catch(error) {console.error(error.message);process.exitCode=2;}
}
