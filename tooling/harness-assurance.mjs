import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {checkDeployments} from './harness-deployment.mjs';
import {checkSecretContracts} from './harness-secret-contract.mjs';
import {checkSecretScan} from './harness-secret-scan.mjs';
import {safePath} from './harness-yaml.mjs';

export const assuranceScopes=['security','deployment','secrets'];
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const strings=value=>Array.isArray(value)&&value.every(item=>typeof item==='string'&&item.trim())&&new Set(value).size===value.length;
export function validateAssurance(config) {
  if(!object(config)||config.schema_version!==1||Object.keys(config).some(key=>!['schema_version','secret_scan','deployments','secret_contracts'].includes(key)))throw new Error('Invalid assurance configuration');
  if(config.secret_scan!==undefined) {
    const scan=config.secret_scan;
    if(!object(scan)||Object.keys(scan).some(key=>!['mode','base_ref'].includes(key))||!['worktree','changes','history'].includes(scan.mode)||scan.mode==='changes'&&(typeof scan.base_ref!=='string'||!scan.base_ref.trim())||scan.mode!=='changes'&&scan.base_ref!==undefined)throw new Error('Invalid secret scan configuration');
  }
  if(config.deployments!==undefined&&!strings(config.deployments))throw new Error('Invalid deployment paths');
  if(config.secret_contracts!==undefined&&(!Array.isArray(config.secret_contracts)||config.secret_contracts.some(contract=>!object(contract)||Object.keys(contract).some(key=>!['root','runtime_files'].includes(key))||typeof contract.root!=='string'||!contract.root.trim()||!strings(contract.runtime_files)||!contract.runtime_files.length)||new Set(config.secret_contracts.map(item=>item.root)).size!==config.secret_contracts.length))throw new Error('Invalid secret contracts');
  return config;
}
function discover(root) {
  const deployments=[],contracts=[];
  if(!fs.existsSync(safePath(root,'infra/deploy')))return {deployments,contracts};
  // Generated state/caches are not source contracts. Explicit selections below
  // remain authoritative even if a project ignores their paths.
  const files=[...new Set(execFileSync('git',['ls-files','-co','--exclude-standard','-z','--','infra/deploy/'],{cwd:root,encoding:'utf8',timeout:10000,maxBuffer:4*1024*1024}).split('\0').filter(Boolean))];
  if(files.length>10000)throw new Error('Infrastructure discovery exceeds 10000 files');
  for(const file of files) {
    if(path.posix.basename(file)==='deployment.yaml') {safePath(root,file);deployments.push(file);}
    if(path.posix.basename(file)==='secret-files.conf'&&path.posix.basename(path.posix.dirname(file))==='config') {safePath(root,file);contracts.push(path.posix.dirname(path.posix.dirname(file)));}
  }
  return {deployments,contracts};
}
export function checkAssurance(root,{scope,tools={}}={}) {
  if(scope&&!assuranceScopes.includes(scope))return [];
  root=fs.realpathSync(root);
  const rows=[],selected=name=>!scope||scope===name;
  let config={},configured=false;
  try {
    const file=safePath(root,'.harness/project/assurance.json');
    if(fs.existsSync(file)) {
      const stat=fs.lstatSync(file);if(!stat.isFile()||stat.size>1024*1024)throw new Error('Assurance configuration must be a bounded regular file');
      configured=true;config=validateAssurance(JSON.parse(fs.readFileSync(file,'utf8')));
    }
  } catch {
    return [{scope:scope||'security',id:'assurance-configuration',status:'error',message:'Invalid .harness/project/assurance.json; consult the assurance schema',file:'.harness/project/assurance.json'}];
  }
  if(selected('security')) {
    if(scope==='security'||configured)rows.push(...checkSecretScan(root,config.secret_scan||{mode:'worktree'},tools).map(row=>({...row,scope:'security'})));
    else rows.push({scope:'security',id:'secret-scan-adoption',status:'not_applicable',message:'Secret scanning not adopted: create .harness/project/assurance.json or select --scope security'});
  }
  if(selected('deployment')||selected('secrets')) {
    let found;
    try {found=discover(root);}catch {return [...rows,{scope:scope||'deployment',id:'assurance-discovery',status:'error',message:'Unsafe or excessive infrastructure tree; no symlinks are allowed'}];}
    if(selected('deployment')) {
      const paths=[...new Set([...found.deployments,...config.deployments||[]])];
      rows.push(...checkDeployments(root,paths).map(row=>({...row,scope:'deployment'})));
      if(!paths.length)rows.push({scope:'deployment',id:'deployment-applicability',status:'not_applicable',message:'No deployment manifests discovered or declared'});
    }
    if(selected('secrets')) {
      const contracts=config.secret_contracts||[];
      for(const environment of found.contracts)if(!contracts.some(contract=>contract.root===environment))rows.push({scope:'secrets',id:'secret-contract-adoption',status:'failed',message:'Declare runtime_files for this discovered secret contract in assurance.json',file:environment+'/config/secret-files.conf'});
      rows.push(...checkSecretContracts(root,contracts,tools).map(row=>({...row,scope:'secrets'})));
      if(!contracts.length&&!found.contracts.length)rows.push({scope:'secrets',id:'secret-contract-applicability',status:'not_applicable',message:'No encrypted dotenv contracts discovered or declared'});
    }
  }
  return rows;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args=process.argv.slice(2),options={};
    while(args.length) {const flag=args.shift();if(!['--root','--scope'].includes(flag)||options[flag]!==undefined||!args[0]||args[0].startsWith('--'))throw new Error('Usage: harness-assurance.mjs --root ROOT --scope security|deployment|secrets');options[flag]=args.shift();}
    if(!options['--scope']||!assuranceScopes.includes(options['--scope']))throw new Error('Select security, deployment or secrets');
    const results=checkAssurance(options['--root']||process.cwd(),{scope:options['--scope']});
    console.log(JSON.stringify({schema_version:1,results,ok:results.every(row=>!['failed','error'].includes(row.status))},null,2));
    process.exitCode=results.some(row=>row.status==='error')?2:results.some(row=>row.status==='failed')?1:0;
  }catch {console.error('Invalid assurance invocation or configuration; no content is printed');process.exitCode=2;}
}
