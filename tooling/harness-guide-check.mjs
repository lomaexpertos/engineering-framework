import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {markdownLinks,markdownAnchors} from './harness-markdown.mjs';
import {validatePersonal,validateProject} from './agent-profiles.mjs';
import {validateTask,validateResult} from './agent-execution.mjs';
import {validateWorkflow,draftWorkflow} from './agent-workflow.mjs';
import {validateCompactClosure} from './harness-work.mjs';
import {buildSkillAdapters} from './harness-profiles.mjs';
import {validateRunnerConfiguration} from './harness-runner-plan.mjs';
import {agentCommandContracts,agentValueOptions} from './harness-agents.mjs';
import {workCommandContracts,workValueOptions,validateWorkRequirements} from './harness-work.mjs';

const guides={
  'coordinate-work':['profiles-and-start.md','workflow-operations.md','individual-tasks.md','delivery-tracks.md'],
  'close-initiative':['closure-and-retention.md'],
  'spec-documentar':['domain-investigation.md'],
};
const fail=message=>{throw new Error(message);};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function walk(directory) {
  if(!fs.existsSync(directory))return [];
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(directory,entry.name);
    if(entry.isSymbolicLink())fail(`Symbolic resource: ${file}`);
    return entry.isDirectory()?walk(file):entry.isFile()?[file]:[];
  });
}
// Local schema checks cover the keywords present in the distributed JSON contracts.
// They validate examples, not the truth of evidence or the existence of example paths.
function schemaCheck(schema,value,document=schema,label='example') {
  if(schema.$ref) {
    if(!schema.$ref.startsWith('#/'))fail(`Unsupported schema reference: ${schema.$ref}`);
    return schemaCheck(schema.$ref.slice(2).split('/').reduce((node,key)=>node?.[key],document),value,document,label);
  }
  const matches=part=>{try{schemaCheck(part,value,document,label);return true;}catch{return false;}};
  if(schema.allOf&&!schema.allOf.every(matches)||schema.oneOf&&schema.oneOf.filter(matches).length!==1||schema.not&&matches(schema.not))fail(`Invalid ${label} alternatives`);
  if(schema.if&&matches(schema.if)) {if(schema.then)schemaCheck(schema.then,value,document,label);} else if(schema.else)schemaCheck(schema.else,value,document,label);
  if(schema.const!==undefined&&value!==schema.const||schema.enum&&!schema.enum.includes(value))fail(`Invalid ${label} value`);
  const type=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(schema.type&&!([schema.type].flat().includes(type)||schema.type==='integer'&&Number.isInteger(value)))fail(`Invalid ${label} type`);
  if(type==='string'&&(schema.minLength&&value.length<schema.minLength||schema.pattern&&!new RegExp(schema.pattern).test(value)||schema.format==='date-time'&&!Number.isFinite(Date.parse(value))))fail(`Invalid ${label} text`);
  if(type==='number'&&(schema.minimum!==undefined&&value<schema.minimum||schema.maximum!==undefined&&value>schema.maximum))fail(`Invalid ${label} range`);
  if(type==='array') {
    if(schema.minItems&&value.length<schema.minItems||schema.maxItems!==undefined&&value.length>schema.maxItems||schema.uniqueItems&&new Set(value.map(item=>JSON.stringify(item))).size!==value.length)fail(`Invalid ${label} items`);
    if(schema.items)value.forEach((item,index)=>schemaCheck(schema.items,item,document,`${label}[${index}]`));
  }
  if(type==='object') {
    for(const key of schema.required||[])if(!Object.hasOwn(value,key))fail(`Missing ${label}.${key}`);
    for(const [key,item] of Object.entries(value)) {
      if(schema.properties?.[key])schemaCheck(schema.properties[key],item,document,`${label}.${key}`);
      else if(schema.additionalProperties===false)fail(`Unknown ${label}.${key}`);
      else if(object(schema.additionalProperties))schemaCheck(schema.additionalProperties,item,document,`${label}.${key}`);
    }
  }
}
function tokenize(line) {
  // Literal argv only: expansions/compound shell examples are syntax checked but
  // never evaluated. Quoted values are retained as a single positional argument.
  return [...line.matchAll(/"(?:\\.|[^"\\])*"|'[^']*'|[^\s]+/g)].map(match=>match[0].replace(/^(['"])(.*)\1$/,'$2'));
}
function cliCheck(wrapper,args,wrapperText) {
  const branches=[...wrapperText.matchAll(/^\s*(--[a-z][a-z-]*(?:\s*\|\s*--[a-z][a-z-]*)*)\)([\s\S]*?)^\s*;;/gm)];
  const branchFlags=branch=>[...branch[1].matchAll(/--([a-z][a-z-]*)/g)].map(match=>match[1]);
  let helpRequested=false;
  const positionals=[],flags=[],valued=wrapper==='agents'?agentValueOptions:wrapper==='work'?workValueOptions:branches.filter(branch=>/\bshift\s+2\b/.test(branch[2])).flatMap(branchFlags);
  for(let index=0;index<args.length;index++) {
    const value=args[index];
    if(value==='--help'||value==='-h'){if(helpRequested)fail('Duplicate documented help flag');helpRequested=true;flags.push('help');continue;}
    if(value.startsWith('--')) {
      const flag=value.slice(2);
      if(flags.includes(flag))fail(`Duplicate documented flag --${flag}`);flags.push(flag);
      if(valued.includes(flag)) {if(!args[index+1]||args[index+1].startsWith('--'))fail(`Missing documented --${flag} value`);index++;}
    } else positionals.push(value);
  }
  let allowed,min=0,max=0,required=[];
  if(wrapper==='agents') {
    const key=positionals[0]==='workflow'?positionals.slice(0,2).join(' '):positionals[0];
    if(helpRequested&&(!positionals.length||positionals.length===1&&positionals[0]==='workflow')) {for(const flag of flags)if(!['help','root','json'].includes(flag))fail(`Unknown documented agents flag --${flag}`);return;}
    const contract=agentCommandContracts[key];if(!contract)fail(`Unknown documented agents command ${key}`);
    min=max=contract.arity;positionals.splice(0,key.startsWith('workflow ')?2:1);allowed=['root','json','help',...contract.flags];required=contract.required||[];
  } else if(wrapper==='work') {
    const command=positionals.shift()||'status';const contract=workCommandContracts[command];if(!contract)fail(`Unknown documented work command ${command}`);
    [min,max,allowed,required=[]]=contract;allowed=['root','json','help',...allowed];if(command==='purge'&&flags.includes('eligible'))min=max=0;
    if(!helpRequested)validateWorkRequirements(command,positionals,Object.fromEntries(flags.map(flag=>[flag,true])));
  } else {
    // Wrapper options are derived from its actual case/guard branches, avoiding a
    // second manually maintained list. No wrapper/help command is executed.
    allowed=branches.flatMap(branchFlags);
    if(helpRequested&&args.length===1)allowed.push('help');
  }
  for(const flag of required)if(!helpRequested&&!flags.includes(flag))fail(`Missing required documented --${flag}`);
  for(const flag of flags)if(!allowed.includes(flag))fail(`Unknown documented ${wrapper} flag --${flag}`);
  if(!helpRequested&&(positionals.length<min||positionals.length>max))fail(`Invalid documented ${wrapper} positional arguments`);
}
export function checkOperationalGuides(root,{layout='consumer'}={}) {
  root=path.resolve(root);
  const results=[];
  const add=(id,file,action)=>{try{action();results.push({id,status:'passed',message:'Operational contract checked',file});}catch(error){results.push({id,status:'failed',message:error.message,file});}};
  const core=layout==='source'?'':'.harness/core/';
  const physical=relative=>path.join(root,core,relative);
  const read=relative=>fs.readFileSync(physical(relative),'utf8');
  const installedRouter=layout==='source'?'templates/project/.harness/README.md':'.harness/README.md';
  const routerRead=()=>fs.readFileSync(path.join(root,installedRouter),'utf8');
  const required=['policies/ai-assisted-development/domain-documentation.md','templates/context/docs/domain.md','policies/ai-assisted-development/proportional-delivery.md','policies/README.md','skills/README.md','checks/README.md','templates/context/README.md','templates/project/AGENTS.md','checks/repository-compliance/operations.md',
    ...['agent-profiles','agent-project','agent-task','agent-result','agent-workflow','closure','compact-closure','project-config','manifest','initiative-state'].map(name=>`schemas/${name}.schema.json`),
    ...Object.entries(guides).flatMap(([skill,names])=>[`skills/${skill}/SKILL.md`,...names.map(name=>`skills/${skill}/references/${name}`)])];
  for(const file of required)add('guide-inventory',core+file,()=>{if(!fs.existsSync(physical(file))||!fs.statSync(physical(file)).size)fail(`Required operational resource missing or empty: ${file}`);});
  add('guide-router',installedRouter,()=>{
    const targets=markdownLinks(routerRead());
    for(const target of ['core/policies/README.md','core/skills/README.md','core/skills/coordinate-work/SKILL.md','core/skills/close-initiative/SKILL.md','core/checks/repository-compliance/operations.md','core/templates/context/README.md'])if(!targets.includes(target))fail(`Required installed router link missing: ${target}`);
  });
  const agentsFile=layout==='source'?'templates/project/AGENTS.md':'AGENTS.md';
  add('guide-entrypoint',agentsFile,()=>{
    const content=fs.readFileSync(path.join(root,agentsFile),'utf8');
    if(content.replace(/\n$/,'').split('\n').length>100)fail('AGENTS exceeds 100 physical lines');
    for(const target of ['.harness/core/policies/README.md','.harness/core/skills/coordinate-work/SKILL.md','.harness/core/skills/spec-documentar/SKILL.md','.harness/core/policies/ai-assisted-development/domain-documentation.md'])if(!content.includes(target))fail(`Required AGENTS routing missing: ${target}`);
  });
  if(layout==='consumer')add('guide-entrypoint','CLAUDE.md',()=>{
    if(!/^@(?:\.\/)?AGENTS\.md\s*$/m.test(fs.readFileSync(path.join(root,'CLAUDE.md'),'utf8')))fail('CLAUDE does not import AGENTS');
  });
  add('guide-catalog',core+'skills/README.md',()=>{
    const targets=markdownLinks(read('skills/README.md'));
    for(const entry of fs.readdirSync(physical('skills'),{withFileTypes:true}).filter(entry=>entry.isDirectory()))if(!targets.includes(`${entry.name}/SKILL.md`))fail(`Skill missing from installed catalog: ${entry.name}`);
  });
  for(const [skill,names] of Object.entries(guides))add('guide-routing',core+`skills/${skill}/SKILL.md`,()=>{
    const targets=markdownLinks(read(`skills/${skill}/SKILL.md`));
    for(const name of names)if(!targets.includes(`references/${name}`))fail(`Required operational reference missing: ${name}`);
  });
  add('guide-routing',core+'policies/ai-assisted-development/README.md',()=>{
    if(!markdownLinks(read('policies/ai-assisted-development/README.md')).includes('domain-documentation.md'))fail('Required domain documentation policy routing missing');
  });
  let managed=[];
  add('guide-resource-tree',core,()=>{managed=['policies','skills','checks','templates','schemas'].flatMap(directory=>walk(physical(directory)));});
  if(layout==='consumer') {
    for(const platform of ['.agents/skills','.claude/skills'])add('guide-adapters',platform,()=>{
      const directory=path.join(root,platform);if(!fs.existsSync(directory))fail(`Missing skill discovery directory ${platform}`);
      const selection=buildSkillAdapters(path.join(root,'.harness/core'),root);
      for(const name of selection.skills)if(!fs.existsSync(path.join(directory,name,'SKILL.md')))fail(`Missing selected skill adapter ${name}`);
      for(const name of selection.skills) {
        const entry={name};
        const original=physical(`skills/${entry.name}`);
        const expected=walk(original).map(file=>path.relative(original,file)).sort(),actual=walk(path.join(directory,entry.name)).map(file=>path.relative(path.join(directory,entry.name),file)).sort();
        if(JSON.stringify(expected)!==JSON.stringify(actual))fail(`Adapter resources diverge: ${entry.name}`);
        for(const relative of expected)if(!fs.readFileSync(path.join(original,relative)).equals(fs.readFileSync(path.join(directory,entry.name,relative))))fail(`Adapter content diverges: ${entry.name}/${relative}`);
      }
      for(const skill of Object.keys(guides))if(!fs.existsSync(path.join(directory,skill,'SKILL.md')))fail(`Required discovery skill missing: ${skill}`);
    });
    for(const platform of ['.agents/skills','.claude/skills'])add('guide-adapter-tree',platform,()=>{
      const selection=buildSkillAdapters(path.join(root,'.harness/core'),root);
      for(const skill of selection.skills)managed.push(...walk(path.join(root,platform,skill)));
    });
  }
  managed.push(path.join(root,installedRouter));
  if(layout==='consumer')managed.push(path.join(root,'.harness/core/README.md'));
  const jsonSchema=name=>JSON.parse(read(`schemas/${name}.schema.json`));
  function example(value,file) {
    if(Array.isArray(value)) {
      if(value.every(item=>typeof item==='string'&&item.trim()))return;
      for(const item of value)if(!object(item)||Object.keys(item).some(key=>!['task_id','finding_id','decision','reason','evidence'].includes(key))||!['accepted','resolved'].includes(item.decision)||['task_id','finding_id','reason','evidence'].some(key=>typeof item[key]!=='string'||!item[key].trim()))fail('Invalid recommendation disposition example');
      return;
    }
    if(!object(value))fail('JSON example must be an object or array');
    if('profiles' in value&&object(value.profiles)&&'roles' in value)return validatePersonal(value);
    if('permissions' in value||'role' in value)return validateTask(value);
    if('task_id' in value)return validateResult(value,value.task_id);
    if('reviewed_at' in value&&'summary' in value&&Array.isArray(value.validation)) {schemaCheck(jsonSchema('compact-closure'),value);return validateCompactClosure(value);}
    if('reviewed_at' in value)return schemaCheck(jsonSchema('closure'),value);
    if('initiative' in value&&'objective' in value)return validateWorkflow(draftWorkflow(value));
    if('runners' in value||'checks' in value||Array.isArray(value.profiles)) {schemaCheck(jsonSchema('project-config'),value);return validateRunnerConfiguration(value);}
    if('reason' in value&&'reviewer' in value) {if(Object.keys(value).some(key=>!['reason','reviewer'].includes(key))||[value.reason,value.reviewer].some(item=>typeof item!=='string'||!item.trim()))fail('Invalid escalation example');return;}
    if('schema_version' in value)return validateProject(value);
    fail(`Unrecognized operational JSON example in ${file}`);
  }
  for(const file of managed) {
    const relative=path.relative(root,file).split(path.sep).join('/');
    if(file.endsWith('.json'))add('guide-json-resource',relative,()=>{
      const value=JSON.parse(fs.readFileSync(file,'utf8'));
      if(relative.startsWith(core+'schemas/')&&(!object(value)||typeof value.$schema!=='string'||value.type!=='object'||!object(value.properties)))fail('Invalid schema document shape');
      if(relative===core+'templates/context/work/closure.example.json') {
        const filled=structuredClone(value);filled.reviewer||='Template reviewer';filled.reviewed_at||='2026-10-28T00:00:00.000Z';
        for(const entry of Object.values(filled))if(object(entry)){if(entry.status==='pending')entry.status='not_applicable';entry.reason||='Template reason';}
        schemaCheck(jsonSchema('closure'),filled);
      }
    });
    if(!file.endsWith('.md'))continue;
    let content;add('guide-readable',relative,()=>{content=fs.readFileSync(file,'utf8');});if(content===undefined)continue;
    add('guide-links',relative,()=>{
      for(const target of markdownLinks(content)) {
        if(/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target))continue;
        const decoded=decodeURIComponent(target),[raw,fragment]=decoded.split('#');
        let destination;
        if(relative===installedRouter&&raw.startsWith('core/'))destination=physical(raw.slice(5));
        else if(relative===core+'templates/project/.harness/README.md'&&raw.startsWith('core/'))destination=physical(raw.slice(5));
        else destination=path.resolve(path.dirname(file),raw.split('?')[0]||path.basename(file));
        if(!destination.startsWith(root+path.sep))fail(`Link escapes repository: ${target}`);
        if(!fs.existsSync(destination))fail(`Missing relative link: ${target}`);
        if(fragment&&destination.endsWith('.md')&&!markdownAnchors(fs.readFileSync(destination,'utf8')).has(fragment))fail(`Missing anchor: ${target}`);
      }
    });
    // Adapter bytes are checked against the canonical skill above. Keep relocated
    // links checked here, and parse identical example bodies only once in core.
    if(relative.startsWith('.agents/skills/')||relative.startsWith('.claude/skills/'))continue;
    const prose=content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm,'');
    for(const inline of prose.matchAll(/`(bash\s+\.harness\/([a-z][a-z-]*)\.sh[^`\n]*)`/g))add('guide-cli-example',relative,()=>{
      const args=tokenize(inline[1]).slice(2),wrapper=inline[2];
      if(!['agents','work','check','update'].includes(wrapper))fail(`Unknown documented harness wrapper ${wrapper}`);
      const wrapperFile=layout==='source'?path.join(root,`templates/project/.harness/${wrapper}.sh`):path.join(root,`.harness/${wrapper}.sh`);
      cliCheck(wrapper,args,fs.readFileSync(wrapperFile,'utf8'));
    });
    for(const [index,match] of [...content.matchAll(/^```(json|bash|sh)\s*\n([\s\S]*?)^```\s*$/gm)].entries()) {
      const language=match[1],body=match[2];
      if(language==='json')add('guide-json-example',relative,()=>{
        const value=JSON.parse(body);
        const operational=Object.entries(guides).some(([skill,names])=>skill!=='spec-documentar'&&names.some(name=>relative.endsWith(`skills/${skill}/references/${name}`)))||relative.endsWith('checks/repository-compliance/operations.md');
        if(operational)example(value,relative);
      });
      else {
        add('guide-shell-syntax',relative,()=>{const result=spawnSync('bash',['--noprofile','--norc','-n'],{input:body,encoding:'utf8',timeout:5000,env:{PATH:process.env.PATH||'/usr/bin:/bin',LC_ALL:'C'}});if(result.error||result.status!==0)fail(`Bash block ${index+1}: ${result.error?.message||result.stderr}`);});
        add('guide-cli-example',relative,()=>{
          for(const line of body.replace(/\\\n/g,' ').split('\n')) {
            const match=/^\s*(?:\$\s*)?bash\s+\.harness\/([a-z][a-z-]*)\.sh(?:\s+(.*))?$/.exec(line);
            if(!match)continue;
            const wrapper=match[1],args=tokenize(match[2]||'');
            if(!['agents','work','check','update'].includes(wrapper))fail(`Unknown documented harness wrapper ${wrapper}`);
            if(args.some(arg=>/[;&|`]|\$\(/.test(arg)))fail('Documented harness CLI requires literal argv');
            const wrapperFile=layout==='source'?path.join(root,`templates/project/.harness/${wrapper}.sh`):path.join(root,`.harness/${wrapper}.sh`);
            cliCheck(wrapper,args,fs.readFileSync(wrapperFile,'utf8'));
          }
        });
      }
    }
  }
  return results;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  process.stderr.write('Internal guide validator: use bash .harness/check.sh --scope context (consumer) or node tooling/validate-framework.mjs (source).\n');
  process.exitCode=2;
}
