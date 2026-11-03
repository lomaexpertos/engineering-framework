import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {installTool,toolPins} from './harness-tool-install.mjs';

const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const exists=file=>fs.lstatSync(file,{throwIfNoEntry:false});
function safeDirectory(directory,{create=false,privateDirectory=false}={}) {
  const absolute=path.resolve(directory);let current=path.parse(absolute).root;
  for(const component of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current=path.join(current,component);let stat=exists(current);
    if(!stat&&create){fs.mkdirSync(current,{mode:0o700});stat=exists(current);}
    if(stat&&(!stat.isDirectory()||stat.isSymbolicLink()))throw new Error('Managed tool cache contains an unsafe directory');
    if(stat) {
      const uid=typeof process.getuid==='function'?process.getuid():null;
      const systemSticky=stat.uid===0&&Boolean(stat.mode&0o1000);
      if(!systemSticky&&((stat.mode&0o022)!==0||uid!==null&&stat.uid!==uid&&stat.uid!==0))throw new Error('Managed tool cache contains an unsafe directory owner or permissions');
    }
  }
  const stat=exists(absolute);
  if(stat&&privateDirectory&&((stat.mode&0o022)!==0||typeof process.getuid==='function'&&stat.uid!==process.getuid()))throw new Error('Managed tool cache must be owned by the current user and not writable by others');
  return absolute;
}
function cacheDirectory(name,cacheRoot) {
  if(!Object.hasOwn(toolPins,name))throw new Error('Unknown harness tool');
  if(!toolPins[name].assets[`${process.platform}-${process.arch}`])throw new Error('Unsupported tool platform');
  const base=cacheRoot||process.env.HARNESS_TOOLS_HOME||path.join(os.homedir(),'.engineering-harness/cache/tools');
  let directory=safeDirectory(base,{privateDirectory:true});
  for(const component of [name,toolPins[name].version,`${process.platform}-${process.arch}`])directory=safeDirectory(path.join(directory,component),{privateDirectory:true});
  return directory;
}
function compatible(name,executable) {
  const result=spawnSync(executable,name==='gitleaks'?['version']:['--version','--disable-version-check'],{encoding:'utf8',timeout:5000,maxBuffer:8192,env:{PATH:process.env.PATH||'/usr/bin:/bin',HOME:os.homedir(),LC_ALL:'C'}});
  return !result.error&&result.status===0&&(name==='gitleaks'?result.stdout.trim()===toolPins[name].version:new RegExp('^sops '+toolPins[name].version.replaceAll('.','\\.')+'(?:\\s|$)').test(result.stdout.trim()));
}
function cachedTool(name,directory) {
  safeDirectory(directory,{privateDirectory:true});
  if(!exists(directory))return null;
  const executable=path.join(directory,name),record=path.join(directory,'receipt.json');
  for(const file of [executable,record]) {
    const stat=exists(file);
    if(!stat?.isFile()||stat.isSymbolicLink()||(stat.mode&0o022)!==0||typeof process.getuid==='function'&&stat.uid!==process.getuid())throw new Error('Managed tool cache is incomplete or unsafe; preserve it and inspect before retrying');
  }
  let receipt;try {receipt=JSON.parse(fs.readFileSync(record,'utf8'));}catch {throw new Error('Managed tool receipt is invalid');}
  if(receipt.tool!==name||receipt.version!==toolPins[name].version||receipt.asset_sha256!==toolPins[name].assets[`${process.platform}-${process.arch}`].sha256||receipt.binary_sha256!==digest(executable)||!(exists(executable).mode&0o111)||!compatible(name,executable))throw new Error('Managed tool integrity/version mismatch; preserve it and inspect before retrying');
  return executable;
}
export function resolvedTool(name,{cacheRoot}={}) {
  const cached=cachedTool(name,cacheDirectory(name,cacheRoot));
  if(cached)return cached;
  for(const entry of (process.env.PATH||'').split(path.delimiter).filter(Boolean)) {
    if(!path.isAbsolute(entry))continue;
    const candidate=path.join(entry,name);
    try {if(fs.statSync(candidate).isFile()&&compatible(name,candidate))return candidate;}catch { /* Try other installed candidates without installing anything. */ }
  }
  return null;
}
export function setupTools({install=false,cacheRoot,tools=['gitleaks','sops'],installer=installTool}={}) {
  if(!Array.isArray(tools)||!tools.length||new Set(tools).size!==tools.length||tools.some(name=>!Object.hasOwn(toolPins,name)))throw new Error('Select known unique harness tools');
  const records=[];
  for(const name of tools) {
    let staging,lock,locked=false;
    try {
      let executable=resolvedTool(name,{cacheRoot});
      if(executable){records.push({tool:name,status:'ready',path:executable});continue;}
      if(!install){records.push({tool:name,status:'missing',message:'Run bash .harness/setup.sh or bash .harness/check.sh --setup'});continue;}
      const directory=cacheDirectory(name,cacheRoot),parent=path.dirname(directory);
      safeDirectory(parent,{create:true,privateDirectory:true});
      lock=directory+'.lock';fs.mkdirSync(lock,{mode:0o700});locked=true;
      executable=cachedTool(name,directory);
      if(executable){records.push({tool:name,status:'ready',path:executable});continue;}
      staging=fs.mkdtempSync(path.join(parent,'.install-'));fs.chmodSync(staging,0o700);
      installer(name,staging);
      const binary=path.join(staging,name),stat=exists(binary);
      if(!stat?.isFile()||stat.isSymbolicLink()||!(stat.mode&0o111)||!compatible(name,binary))throw new Error('Downloaded tool has an unexpected version or type');
      const receipt={tool:name,version:toolPins[name].version,asset_sha256:toolPins[name].assets[`${process.platform}-${process.arch}`].sha256,binary_sha256:digest(binary)};
      fs.writeFileSync(path.join(staging,'receipt.json'),JSON.stringify(receipt)+'\n',{flag:'wx',mode:0o600});
      if(exists(directory))throw new Error('Concurrent cache publication; retry after inspecting it');
      fs.renameSync(staging,directory);staging=null;
      records.push({tool:name,status:'installed',path:cachedTool(name,directory)});
    }catch {records.push({tool:name,status:'error',message:'Setup could not verify or prepare tool: inspect cache ownership/integrity, concurrent setup, network and curl/tar; personal tools are preserved'});}
    finally {if(staging)fs.rmSync(staging,{recursive:true,force:true});if(locked)fs.rmdirSync(lock);}
  }
  return {ok:records.every(record=>['ready','installed'].includes(record.status)),tools:records,bin_dirs:[...new Set(records.filter(record=>record.path).map(record=>path.dirname(record.path)))]};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  try {
    const args=process.argv.slice(2);
    if(args.length===1&&['--help','-h'].includes(args[0]))console.log('Usage: node harness-setup.mjs --install|--check [--json] [--paths]\n--install prepares missing Gitleaks/SOPS; --check is read-only. --paths emits NUL-delimited executable directories.');
    else {
      if(new Set(args).size!==args.length||args.some(arg=>!['--install','--check','--json','--paths'].includes(arg))||args.includes('--install')===args.includes('--check'))throw new Error();
      const result=setupTools({install:args.includes('--install')});
      if(args.includes('--paths')){if(result.ok)process.stdout.write(result.bin_dirs.join('\0')+'\0');}
      else if(args.includes('--json'))console.log(JSON.stringify(result,null,2));
      else for(const record of result.tools)console.log(`${record.tool}: ${record.status}${record.message?' — '+record.message:''}`);
      process.exitCode=result.ok?0:2;
    }
  }catch {console.error('Invalid setup invocation; use --help');process.exitCode=2;}
}
