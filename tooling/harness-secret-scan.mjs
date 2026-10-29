import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

export const gitleaksVersion='8.30.1';
const scanLimit=256*1024*1024;
const fileLimit=32*1024*1024;
class ScanError extends Error {}
const failure=message=>{throw new ScanError(message);};
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function environment() {
  const env={...process.env,GIT_OPTIONAL_LOCKS:'0',GIT_TERMINAL_PROMPT:'0',LC_ALL:'C'};
  for(const key of Object.keys(env))if(key.startsWith('GITLEAKS_')||key.startsWith('GIT_'))delete env[key];
  return {...env,GIT_OPTIONAL_LOCKS:'0',GIT_TERMINAL_PROMPT:'0',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:os.devNull,GIT_NO_REPLACE_OBJECTS:'1'};
}
function command(executable,args,options={}) {
  const result=spawnSync(executable,args,{...options,env:environment(),timeout:125000,maxBuffer:16*1024*1024});
  if(result.error||result.signal||result.status!==0)failure('No fue posible completar una operación Git del escaneo.');
  return result.stdout;
}
function git(root,args) {return command('git',args,{cwd:root,encoding:'utf8'});}
function paths(value) {return value.split('\0').filter(Boolean);}
function validPath(relative) {
  if(!relative||path.isAbsolute(relative)||relative.includes('\\')||relative.includes('\uFFFD')||relative.split('/').some(part=>!part||part==='.'||part==='..')||/[\x00-\x1f\x7f]/.test(relative))failure('Ruta Git no compatible con el escaneo seguro; requiere UTF-8 sin caracteres de reemplazo.');
  return relative;
}
function workingContent(root,relative) {
  let current=root;
  const parts=relative.split('/');
  for(const [index,part] of parts.entries()) {
    current=path.join(current,part);
    const stat=fs.lstatSync(current,{throwIfNoEntry:false});
    if(!stat)return null;
    if(stat.isSymbolicLink()) {
      if(index!==parts.length-1)failure('El escaneo no sigue directorios enlazados.');
      return Buffer.from(fs.readlinkSync(current));
    }
    if(index===parts.length-1) {
      if(!stat.isFile())failure('Submódulo o tipo de archivo no cubierto; revisar su repositorio por separado.');
      if(stat.size>fileLimit)failure('Archivo excede el límite del escaneo; no se acredita cobertura parcial.');
      return fs.readFileSync(current);
    }
    if(!stat.isDirectory())failure('Ruta Git incompatible con su árbol de trabajo.');
  }
}
function inventory(root,mode) {
  if(mode==='changes') {
    // These index flags can conceal worktree modifications from git diff.
    if(paths(git(root,['ls-files','-v','-z'])).some(entry=>entry[0]==='S'||/^[a-z]/.test(entry)))failure('El escaneo de cambios rechaza flags Git assume-unchanged o skip-worktree; resolverlos explícitamente antes de reintentar.');
    return [...new Set([
    ...paths(git(root,['diff','--name-only','-z','--'])),
    ...paths(git(root,['diff','--cached','--name-only','-z','--'])),
    ...paths(git(root,['ls-files','--others','--exclude-standard','-z'])),
    ])].sort().map(validPath);
  }
  return [...new Set(paths(git(root,['ls-files','-co','--exclude-standard','-z'])))].sort().map(validPath);
}
function workingSnapshot(root,mode,destination) {
  const entries=inventory(root,mode),digest=crypto.createHash('sha256');let bytes=0;
  for(const relative of entries) {
    const content=workingContent(root,relative);
    digest.update(relative+'\0').update(content===null?'deleted':hash(content)).update('\0');
    if(content===null)continue;
    bytes+=content.length;if(bytes>scanLimit)failure('El árbol excede el límite del escaneo; no se acredita cobertura parcial.');
    if(destination) {
      const file=path.join(destination,'files',relative);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,content,{mode:0o600});
    }
  }
  return digest.digest('hex');
}
function indexSnapshot(root,selected,destination) {
  let bytes=0;
  for(const line of paths(git(root,['ls-files','--stage','-z']))) {
    const match=/^(\d+) ([0-9a-f]+) (\d)\t([\s\S]+)$/.exec(line);
    if(!match)failure('Índice Git no interpretable.');
    const [,mode,oid,stage,relative]=match;
    if(selected&&!selected.has(relative))continue;
    validPath(relative);
    if(stage!=='0')failure('Resolver conflictos de índice antes del escaneo.');
    if(!['100644','100755','120000'].includes(mode))failure('Submódulo o tipo de índice no cubierto.');
    const size=Number(git(root,['cat-file','-s',oid]).trim());
    if(!Number.isFinite(size)||size>fileLimit||(bytes+=size)>scanLimit)failure('Índice excede límites del escaneo.');
    const content=command('git',['cat-file','blob',oid],{cwd:root});
    const file=path.join(destination,'files',relative);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,content,{mode:0o600});
  }
}
function headCommit(root) {
  const head=spawnSync('git',['rev-parse','--verify','--quiet','HEAD'],{cwd:root,env:environment(),encoding:'utf8',timeout:5000,maxBuffer:4096});
  if(head.error||head.signal||![0,1].includes(head.status))failure('No fue posible identificar HEAD para el escaneo.');
  return head.status===0?head.stdout.trim():null;
}
function gitIdentity(root) {
  return hash(git(root,['ls-files','--stage','-z'])+'\0'+git(root,['for-each-ref','--format=%(refname) %(objectname)'])+'\0'+(headCommit(root)||'unborn'));
}
function reportRows(file,source,stage,snapshot) {
  const stat=fs.lstatSync(file,{throwIfNoEntry:false});
  if(!stat?.isFile()||stat.isSymbolicLink()||stat.size>16*1024*1024)failure('Gitleaks no entregó un reporte completo y acotado.');
  fs.chmodSync(file,0o600);
  let report;try{report=JSON.parse(fs.readFileSync(file,'utf8'));}catch{failure('Gitleaks entregó un reporte no interpretable.');}
  if(!Array.isArray(report))failure('Gitleaks entregó un reporte inválido.');
  return report.map(finding=>{
    if(!finding||typeof finding.RuleID!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(finding.RuleID)||typeof finding.File!=='string'||!Number.isSafeInteger(finding.StartLine)||finding.StartLine<1)failure('Gitleaks entregó un hallazgo inválido.');
    let relative=path.isAbsolute(finding.File)?path.relative(source,finding.File):finding.File;
    if(snapshot) {if(!relative.startsWith('files/'))failure('Gitleaks entregó una ruta fuera del snapshot.');relative=relative.slice(6);}
    validPath(relative);
    return {id:'secret-scan-finding',status:'failed',message:`Gitleaks ${finding.RuleID}; línea ${finding.StartLine}; ${stage}.`,file:relative};
  });
}

// This entry point never returns process output, report matches, secret values or Git patches.
export function checkSecretScan(root,config={mode:'worktree'},{executable='gitleaks',timeoutSeconds=120}={}) {
  let temporary;
  try {
    if(!config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).some(key=>!['mode','base_ref'].includes(key))||!['worktree','changes','history'].includes(config.mode))failure('Configuración de escaneo inválida.');
    if(config.mode==='changes'&&(typeof config.base_ref!=='string'||!config.base_ref.trim()||config.base_ref.startsWith('-')||/[\s\x00]/.test(config.base_ref)))failure('changes requiere base_ref explícita y válida.');
    if(config.mode!=='changes'&&config.base_ref!==undefined)failure('base_ref solo aplica al modo changes.');
    root=fs.realpathSync(root);
    if(fs.realpathSync(git(root,['rev-parse','--show-toplevel']).trim())!==root)failure('El escaneo requiere la raíz Git.');
    const version=spawnSync(executable,['version'],{env:environment(),encoding:'utf8',timeout:5000,maxBuffer:4096});
    if(version.error||version.signal||version.status!==0)failure('Gitleaks no está disponible; instalar la versión documentada antes de reintentar.');
    if(version.stdout.trim()!==gitleaksVersion)failure(`Gitleaks requiere la versión comprobada ${gitleaksVersion}.`);
    if(config.mode!=='worktree'&&git(root,['rev-parse','--is-shallow-repository']).trim()!=='false')failure('El historial Git es superficial; completar el historial antes del escaneo.');
    const currentHead=headCommit(root);let range;
    if(config.mode==='changes') {
      const base=git(root,['rev-parse','--verify','--end-of-options',config.base_ref+'^{commit}']).trim();
      const head=currentHead||failure('No fue posible resolver HEAD para el modo changes.');
      if(!/^[0-9a-f]{40,64}$/.test(base)||!/^[0-9a-f]{40,64}$/.test(head))failure('No fue posible resolver base_ref y HEAD.');
      range=base+'..'+head;
    }
    const initialIdentity=gitIdentity(root);
    temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-gitleaks-'));fs.chmodSync(temporary,0o700);
    const configFile=path.join(temporary,'rules.toml'),ignoreFile=path.join(temporary,'empty.ignore');
    fs.writeFileSync(configFile,'title = "Harness defaults"\n[extend]\nuseDefault = true\n',{mode:0o600});fs.writeFileSync(ignoreFile,'',{mode:0o600});
    const work=path.join(temporary,'worktree');fs.mkdirSync(work,{mode:0o700});
    const initialWork=workingSnapshot(root,config.mode==='changes'?'changes':'worktree',work);
    const stages=[{command:'dir',source:work,stage:'árbol de trabajo'}];
    {
      const index=path.join(temporary,'index');fs.mkdirSync(index,{mode:0o700});indexSnapshot(root,config.mode==='changes'?new Set(inventory(root,'changes')):null,index);
      stages.push({command:'dir',source:index,stage:'índice'});
    }
    if(config.mode==='changes'||config.mode==='history'&&(currentHead||git(root,['for-each-ref','--format=%(objectname)']).trim())) {
      const history=path.join(temporary,'history');fs.mkdirSync(history,{mode:0o700});
      fs.writeFileSync(path.join(history,'.git'),'gitdir: '+git(root,['rev-parse','--absolute-git-dir']).trim()+'\n',{mode:0o600});
      stages.push({command:'git',source:history,stage:config.mode==='history'?'historial completo':'commits desde base_ref',logOpts:config.mode==='history'?'--all --full-history'+(currentHead?' '+currentHead:''):range});
    }
    const rows=[];
    for(const [index,stage] of stages.entries()) {
      const reportFile=path.join(temporary,`report-${index}.json`);
      const args=[stage.command,'--config',configFile,'--gitleaks-ignore-path',ignoreFile,'--ignore-gitleaks-allow','--redact=100','--report-format','json','--report-path',reportFile,'--exit-code','42','--no-banner','--no-color','--log-level','error','--timeout',String(timeoutSeconds),...(stage.logOpts?['--log-opts',stage.logOpts]:[]),stage.source];
      // Gitleaks recreates reports; a private umask also protects their file mode.
      const previousMask=process.umask(0o077);let result;
      try {result=spawnSync(executable,args,{cwd:temporary,env:environment(),encoding:'utf8',timeout:(timeoutSeconds+2)*1000,maxBuffer:1024*1024});}
      finally {process.umask(previousMask);}
      if(result.error||result.signal||![0,42].includes(result.status))failure('Gitleaks no completó el escaneo; salida del proceso retenida para evitar exposición.');
      const findings=reportRows(reportFile,stage.source,stage.stage,stage.command==='dir');
      if((result.status===42)!==Boolean(findings.length))failure('Estado y reporte Gitleaks no concuerdan; escaneo no acreditado.');
      rows.push(...findings);
    }
    if(initialIdentity!==gitIdentity(root)||initialWork!==workingSnapshot(root,config.mode==='changes'?'changes':'worktree'))failure('El repositorio cambió durante el escaneo; repetir sobre una versión estable.');
    return rows.length?rows:[{id:'secret-scan',status:'passed',message:`Gitleaks ${gitleaksVersion}; modo ${config.mode}; sin hallazgos en el alcance declarado.`}];
  } catch(error) {
    // Only messages authored here are allowed; filesystem/process errors can include values or paths.
    return [{id:'secret-scan',status:'error',message:error instanceof ScanError?error.message:'No fue posible completar el escaneo de secretos; revisar herramientas, permisos y configuración sin imprimir contenido.'}];
  } finally {if(temporary)fs.rmSync(temporary,{recursive:true,force:true});}
}
