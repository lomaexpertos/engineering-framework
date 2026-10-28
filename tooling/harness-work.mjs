import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { markdownLinks } from './harness-markdown.mjs';

export const statuses = ['draft','ready','active','blocked','validating','closing','closed','cancelled'];
export const categories = ['validation','reviews','documentation','decisions','invariants','roadmap','backlog','memory'];
const retention = 60 * 86400000;
const idPattern = /^\d{8}_[a-z0-9]+(?:_[a-z0-9]+)*$/;
const fail = message => { throw new Error(message); };
const utcTimestamp = value => typeof value==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,19)===value.slice(0,19);
const exists = file => fs.existsSync(file);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function write(file, value) {
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value,null,2)+'\n', {flag:'wx'});
  fs.renameSync(temporary,file);
}
function safe(root, relative) {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).some(p => p==='..' || !p)) fail(`Unsafe path: ${relative}`);
  let current=root;
  for (const part of relative.split('/')) {
    current=path.join(current,part);
    const stat=fs.lstatSync(current,{throwIfNoEntry:false});
    if(stat?.isSymbolicLink()) fail(`Symlink prohibited: ${relative}`);
  }
  return current;
}
function files(directory) {
  if(!exists(directory)) return [];
  if(fs.lstatSync(directory).isSymbolicLink()) fail(`Symlink prohibited: ${directory}`);
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=> {
    const target=path.join(directory,entry.name);
    if(entry.isSymbolicLink()) fail(`Symlink prohibited: ${target}`);
    return entry.isDirectory()?files(target):entry.isFile()?[target]:[];
  });
}
function snapshot(directory) {
  return Object.fromEntries(files(directory).map(file=>[path.relative(directory,file),crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
}
export function validateState(state) {
  const keys=['schema_version','id','title','owner','status','revision','created_at','updated_at','closed_at','retain_until','hold','active_tasks','blockers','blocked_from','blocked_reason'];
  if(!state || keys.some(key=>!Object.hasOwn(state,key)) || Object.keys(state).some(key=>!keys.includes(key))) fail('Invalid initiative state fields');
  if(state.schema_version!==1 || typeof state.id!=='string' || !idPattern.test(state.id) || !statuses.includes(state.status) || !state.owner || !state.title || !Number.isInteger(state.revision) || state.revision<1) fail('Invalid initiative state');
  for(const key of ['active_tasks','blockers']) if(!Array.isArray(state[key])) fail(`Invalid ${key}`);
  if(typeof state.title!=='string' || typeof state.owner!=='string' || !(state.hold===null || typeof state.hold==='string')) fail('Invalid state fields');
  for(const key of ['created_at','updated_at']) if(!utcTimestamp(state[key])) fail(`Invalid ${key}`);
  if(!(state.blocked_from===null || statuses.includes(state.blocked_from)) || !(state.blocked_reason===null || typeof state.blocked_reason==='string')) fail('Invalid blocked state');
  if(state.status==='blocked' ? !state.blocked_from || !state.blocked_reason : state.blocked_from!==null || state.blocked_reason!==null) fail('Invalid blocked state');
  if(Date.parse(state.updated_at)<Date.parse(state.created_at)) fail('Invalid state chronology');
  if(['closed','cancelled'].includes(state.status)) {
    if(state.active_tasks.length || state.blockers.length) fail('Closed initiative has active tasks or blockers');
    if(!utcTimestamp(state.closed_at) || !utcTimestamp(state.retain_until) || Date.parse(state.closed_at)<Date.parse(state.created_at) || Date.parse(state.retain_until)!==Date.parse(state.closed_at)+retention) fail('Invalid closure retention');
  } else if(state.closed_at!==null || state.retain_until!==null) fail('Open initiative has closure date');
  return state;
}
function references(root, excluded=[]) {
  const candidates=['docs','.harness_work/memory','.harness_work/initiatives'].flatMap(prefix=>files(safe(root,prefix)));
  for(const relative of ['AGENTS.md','README.md','.harness_work/README.md']) {
    const file=safe(root,relative);if(exists(file)) candidates.push(file);
  }
  return candidates.filter(file=>/\.(md|json|ya?ml|txt)$/.test(file) && !excluded.some(dir=>file.startsWith(dir+path.sep)));
}
function incoming(root, ids, excluded) {
  return references(root,excluded).filter(file=> {
    const content=fs.readFileSync(file,'utf8');
    return ids.some(id=>content.includes(id));
  }).map(file=>path.relative(root,file));
}
function verifyClosure(root, directory, state) {
  if(state.active_tasks.length || state.blockers.length) fail('Active tasks or blockers prevent closure');
  const file=safe(root,path.relative(root,path.join(directory,'closure.json')));
  if(!exists(file)) fail('Missing closure.json: coordinator must consolidate and attest the closure');
  const closure=read(file);
  if(Object.keys(closure).some(key=>!['reviewer','reviewed_at',...categories].includes(key)) || typeof closure.reviewer!=='string' || !closure.reviewer || !utcTimestamp(closure.reviewed_at)) fail('Closure needs reviewer and reviewed_at');
  for(const category of categories) {
    const entry=closure[category];
    if(!entry || Object.keys(entry).some(key=>!['status','reason','sources'].includes(key)) || !['complete','not_applicable'].includes(entry.status) || typeof entry.reason!=='string' || !entry.reason || !Array.isArray(entry.sources) || entry.sources.some(source=>typeof source!=='string' || !source)) fail(`Incomplete closure category: ${category}`);
    if(entry.status==='complete' && !entry.sources.length) fail(`Missing closure sources: ${category}`);
    for(const source of entry.sources) {
      if(!exists(safe(root,source))) fail(`Missing closure source: ${source}`);
      if(!['validation','reviews'].includes(category) && !(source.startsWith('docs/') || category==='memory' && source.startsWith('.harness_work/memory/'))) fail(`Noncanonical promotion source: ${source}`);
    }
  }
  for(const file of files(safe(root,'docs')).filter(file=>file.endsWith('.md'))) {
    const content=fs.readFileSync(file,'utf8');
    for(const link of markdownLinks(content)) {
      if(/^[a-z][a-z0-9+.-]*:/i.test(link)) continue;
      const target=path.relative(root,path.resolve(path.dirname(file),decodeURIComponent(link.split('#')[0].split('?')[0]))).split(path.sep).join('/');
      if(/^(?:\.harness_work\/(?:initiatives|runtime)|engineering\/(?:specs|quality-review))\//.test(target)) fail(`Permanent document depends on temporary work: ${path.relative(root,file)}`);
    }
  }
  return closure;
}
function clean(root, relative) {
  let output;
  try { output=execFileSync('git',['status','--porcelain','--untracked-files=all','--',relative],{cwd:root,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}); }
  catch { fail('Purge requires a Git repository with observable status'); }
  if(output.trim()) fail(`Uncommitted changes prevent purge: ${relative}`);
  if(execFileSync('git',['ls-files','--others','--ignored','--exclude-standard','--',relative],{cwd:root,encoding:'utf8'}).trim()) fail(`Ignored local files prevent purge: ${relative}`);
  const hidden=execFileSync('git',['ls-files','-v','--',relative],{cwd:root,encoding:'utf8'});
  if(hidden.split('\n').some(line=>line && (line[0]==='S' || /[a-z]/.test(line[0])))) fail('Hidden Git changes prevent purge');
}
export function operate(root, command, args=[], options={}) {
  root=fs.realpathSync(root);
  const work=safe(root,'.harness_work');
  const initiatives=safe(root,'.harness_work/initiatives');
  const runtime=safe(root,'.harness_work/runtime');
  const now=options.now || new Date().toISOString();
  if(!utcTimestamp(now)) fail('Invalid current time');
  const directory=id=> { if(!idPattern.test(id||'')) fail('Invalid initiative id'); return safe(root,`.harness_work/initiatives/${id}`); };
  const load=id=> { const value=validateState(read(safe(root,path.relative(root,path.join(directory(id),'state.json'))))); if(value.id!==id) fail('Identity mismatch'); return value; };
  const save=state=> {state.revision++;state.updated_at=now;validateState(state);write(path.join(directory(state.id),'state.json'),state);return state;};
  const list=()=> exists(initiatives)?fs.readdirSync(initiatives).filter(id=>idPattern.test(id)).map(load):[];
  if(command==='status') return args.length?load(args[0]):list();
  if(options.check && !['close','purge'].includes(command)) fail('--check supported for close and purge only');
  const perform=()=> {
    if(command==='create') {
      const id=args[0], target=directory(id);
      if(exists(target)) fail('Initiative already exists');
      if(!options.title || !options.owner) fail('create requires --title and --owner');
      const state={schema_version:1,id,title:options.title,owner:options.owner,status:'draft',revision:1,created_at:now,updated_at:now,closed_at:null,retain_until:null,hold:null,active_tasks:[],blockers:[],blocked_from:null,blocked_reason:null};
      validateState(state);
      fs.mkdirSync(target,{recursive:true});write(path.join(target,'state.json'),state);
      fs.writeFileSync(path.join(target,'brief.md'),`# ${options.title}\n\nDescribe el objetivo, alcance, exclusiones y aceptación antes de pasar a ready.\n`);
      fs.writeFileSync(path.join(target,'resume.md'),'# Continuidad\n\nSiguiente acción: definir el brief y sus criterios de aceptación.\n');
      return state;
    }
    if(command==='recover') return recover(args[0],options.restore);
    if(command==='purge') {
      const selected=options.eligible?list().filter(s=>['closed','cancelled'].includes(s.status)&&Date.parse(s.retain_until)<=Date.parse(now)&&!s.hold).map(s=>s.id):args;
      if(!selected.length) return {eligible:[]};
      if(new Set(selected).size!==selected.length) fail('Duplicate purge id');
      const dirs=selected.map(directory);
      for(const id of selected) {
        const state=load(id);
        if(!['closed','cancelled'].includes(state.status)||Date.parse(state.retain_until)>Date.parse(now)||state.hold) fail(`Not eligible for purge: ${id}`);
        verifyClosure(root,directory(id),state); files(directory(id)); clean(root,path.relative(root,directory(id)));
      }
      const refs=incoming(root,selected,dirs);
      if(refs.length) fail(`Incoming references prevent purge: ${refs.join(', ')}`);
      if(options.check) return {eligible:selected};
      const operation=crypto.randomUUID();
      const base=safe(root,`.harness_work/runtime/purge/${operation}`);
      fs.mkdirSync(base,{recursive:true});
      const journal={schema_version:1,operation,status:'preparing',ids:selected,moved:[],snapshots:Object.fromEntries(selected.map(id=>[id,snapshot(directory(id))]))};
      write(path.join(base,'journal.json'),journal);
      for(const id of selected) {
        clean(root,path.relative(root,directory(id)));
        // Persist intent before rename so recovery also recognizes interruption between them.
        journal.pending=id;write(path.join(base,'journal.json'),journal);
        fs.renameSync(directory(id),path.join(base,id));
        journal.moved.push(id);delete journal.pending;write(path.join(base,'journal.json'),journal);
        options.afterMove?.(id);
      }
      journal.status='prepared';write(path.join(base,'journal.json'),journal);
      return recover(operation,false);
    }
    const id=args[0], state=load(id), target=directory(id);
    if(command==='hold') {state.hold=options.release?null:(options.reason || fail('hold requires --reason'));return save(state);}
    if(command==='reopen') {
      if(!['closed','cancelled'].includes(state.status)) fail('Only closed or cancelled initiatives can reopen');
      if(exists(path.join(target,'closure.json'))) fs.renameSync(path.join(target,'closure.json'),path.join(target,`closure.previous.${state.revision}.json`));
      state.status='active';state.closed_at=null;state.retain_until=null;return save(state);
    }
    if(command==='close') {
      const desired=options.cancelled?'cancelled':'closed';
      if(state.status===desired) {verifyClosure(root,target,state);return state;}
      if(state.status!=='closing') fail('Initiative must be closing');
      verifyClosure(root,target,state);
      if(options.check) return {ready:true,id,status:desired};
      fs.writeFileSync(safe(root,path.relative(root,path.join(target,'closure.md'))),`# Cierre\n\nResultado: ${desired}. Revisión: ${read(path.join(target,'closure.json')).reviewer}.\n\nLa consolidación y sus destinos se registran en closure.json. Cierre no equivale a despliegue.\n`);
      state.status=desired;state.closed_at=now;state.retain_until=new Date(Date.parse(now)+retention).toISOString();return save(state);
    }
    if(command==='transition') {
      const next=args[1];
      const allowed={draft:['ready','closing'],ready:['active','closing'],active:['validating','blocked','closing'],blocked:['active','closing'],validating:['active','closing'],closing:['active']};
      if(!allowed[state.status]?.includes(next)) fail(`Invalid transition ${state.status} → ${next}`);
      if(next==='blocked' && !options.reason) fail('blocked requires --reason');
      if(next==='blocked') {state.blocked_from=state.status;state.blocked_reason=options.reason;}
      if(state.status==='blocked' && state.blocked_reason==='paused' && !options.resume) fail('Paused initiative requires --resume');
      if(state.status==='blocked' && next!=='blocked') {state.blocked_from=null;state.blocked_reason=null;}
      if(next==='ready' && (!options.confirm || !fs.readFileSync(path.join(target,'brief.md'),'utf8').trim())) fail('ready requires confirmed scope/acceptance (--confirm)');
      if(next==='validating' && (!options.confirm || state.active_tasks.length)) fail('validating requires integration confirmation and no active tasks');
      if(next==='closing' && (!options.confirm || state.active_tasks.length || state.blockers.length)) fail('closing requires review confirmation and no active tasks/blockers');
      state.status=next;return save(state);
    }
    fail(`Unknown command: ${command}`);
  };
  function recover(operation,restore) {
    if(!/^[a-f0-9-]{36}$/.test(operation||'')) fail('Invalid purge operation');
    const base=safe(root,`.harness_work/runtime/purge/${operation}`), journal=read(path.join(base,'journal.json'));
    if(journal.operation!==operation || !Array.isArray(journal.ids) || journal.ids.some(id=>!idPattern.test(id))) fail('Invalid purge journal');
    if(journal.status==='complete' || journal.status==='restored') return journal;
    for(const id of journal.ids) {
      safe(root,`.harness_work/runtime/purge/${operation}/${id}`);
      const current=snapshot(path.join(base,id)), original=journal.snapshots?.[id];
      if(!original || Object.entries(current).some(([file,hash])=>original[file]!==hash) || journal.status!=='deleting' && exists(path.join(base,id)) && Object.keys(current).length!==Object.keys(original).length) fail(`Prepared initiative changed: ${id}`);
    }
    if(restore) {
      if(journal.status==='deleting') fail('Definitive deletion started; complete recovery instead');
      for(const id of journal.ids) if(exists(path.join(base,id))) {
        if(exists(directory(id))) fail(`Restore conflicts with current initiative: ${id}`);
        fs.renameSync(path.join(base,id),directory(id));
      }
      journal.status='restored';write(path.join(base,'journal.json'),journal);return journal;
    }
    if(journal.status==='preparing') fail('Interrupted preparation: recover --restore before retrying purge');
    for(const id of journal.ids) if(exists(directory(id))) fail(`Initiative recreated after preparation: ${id}`);
    const refs=incoming(root,journal.ids,[]);
    if(refs.length) fail(`New references prevent completion: ${refs.join(', ')}`);
    journal.status='deleting';write(path.join(base,'journal.json'),journal);
    for(const id of journal.ids) { files(path.join(base,id));fs.rmSync(path.join(base,id),{recursive:true,force:true}); }
    journal.status='complete';write(path.join(base,'journal.json'),journal);return journal;
  }
  if(options.check) return perform();
  fs.mkdirSync(runtime,{recursive:true});
  if(exists(path.join(runtime,'update.json'))) fail('Interrupted update; recover the installation before changing initiative state');
  if(exists(path.join(runtime,'update.lock'))) fail('Update operation active; wait for update completion');
  const lock=path.join(runtime,'work.lock');
  let descriptor;
  try {descriptor=fs.openSync(lock,'wx');}catch {fail('Work operation locked; inspect runtime/work.lock before recovery');}
  try {
    fs.writeFileSync(descriptor,JSON.stringify({pid:process.pid,command,created_at:now})+'\n');
    if(exists(path.join(runtime,'update.lock'))) fail('Update operation active; wait for update completion');
    if(exists(path.join(runtime,'update.json'))) fail('Interrupted update; recover the installation before changing initiative state');
    const pending=exists(path.join(runtime,'purge'))?fs.readdirSync(path.join(runtime,'purge')).filter(op=>{
      const journal=read(safe(root,`.harness_work/runtime/purge/${op}/journal.json`));return !['complete','restored'].includes(journal.status);
    }):[];
    if(pending.length && command!=='recover') fail(`Pending purge operation: ${pending.join(', ')}; recover first`);
    return perform();
  } finally {fs.closeSync(descriptor);fs.unlinkSync(lock);}
}
export function main(argv=process.argv.slice(2)) {
  const args=[], options={};let root=process.cwd();
  const valued=new Set(['root','title','owner','reason']);
  for(let i=0;i<argv.length;i++) {
    if(argv[i].startsWith('--')) {
      const key=argv[i].slice(2);
      if(![...valued,'check','eligible','cancelled','release','restore','resume','confirm','json'].includes(key)) fail(`Unknown option: --${key}`);
      if(valued.has(key)) {if(!argv[i+1] || argv[i+1].startsWith('--')) fail(`Missing --${key} value`); const value=argv[++i];if(key==='root')root=value;else options[key]=value;}
      else options[key]=true;
    } else args.push(argv[i]);
  }
  const result=operate(root,args.shift()||'status',args,options);
  console.log(JSON.stringify(result,null,2));
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {main();}catch(error) {console.error(JSON.stringify({error:error.message}));process.exitCode=1;}
}
