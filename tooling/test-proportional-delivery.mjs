import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {checkOperationalGuides} from './harness-guide-check.mjs';

// Installed wrapper acceptance with a synthetic protocol client. This checks local
// orchestration and safeguards, not model reasoning or application correctness.
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-proportional-'));
const previous={repository:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
const environment={...process.env,HOME:path.join(temporary,'home'),XDG_CONFIG_HOME:path.join(temporary,'personal')};
const roles=['definition','implementation','functional','security','logging','ui','ux'];
const fixture=path.join(temporary,'protocol-client.mjs');
let sequence=0;
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const workDirectory=(root,id)=>path.join(root,'.harness_work/initiatives',id);
function command(root,executable,args,expected=0) {
  const result=spawnSync(executable,args,{cwd:root,env:environment,encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  assert.equal(result.error,undefined,result.error?.message);
  assert.equal(result.status,expected,`${executable} ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);
  return result;
}
function cli(root,wrapper,args,expected=0) {
  const result=command(root,'bash',[path.join(root,`.harness/${wrapper}.sh`),...args],expected);
  return expected===0?JSON.parse(result.stdout):result;
}
function rejected(root,wrapper,args,diagnostic) {
  const result=cli(root,wrapper,args,wrapper==='work'?1:2);
  if(diagnostic)assert.match(result.stderr,diagnostic);
}
function externalJSON(label,value) {
  const file=path.join(temporary,`${++sequence}-${label}.json`);write(file,value);return file;
}
function installed(name) {
  const root=path.join(temporary,name);fs.mkdirSync(root);
  command(root,'git',['init','-q','-b','feature/proportional']);
  fs.writeFileSync(path.join(root,'fixture.txt'),'before\n');
  command(root,'git',['add','fixture.txt']);
  command(root,'git',['-c','user.name=Harness Fixture','-c','user.email=fixture@example.invalid','commit','-qm','fixture baseline']);
  syncConsumer(root);
  assert.ok(fs.existsSync(path.join(root,'.harness/core/runtime/tooling/harness-tracks.mjs')),'Fresh consumers must receive track resolver');
  return root;
}
function configure(root,active=roles,broken=false) {
  const config=path.join(temporary,`${path.basename(root)}-profiles.json`);
  const profiles={fixture:{adapter:'codex',model:'synthetic-protocol-fixture',permission:'workspace-write',executable:fixture}};
  if(broken)profiles.unused={adapter:'codex',model:'unusable-fixture',executable:path.join(temporary,'missing-client')};
  cli(root,'agents',['setup','--config',config,'--input',externalJSON('profiles',{schema_version:1,profiles,roles:Object.fromEntries(active.map(role=>[role,'fixture'])),limits:{max_concurrency:2,timeout_seconds:10,max_correction_rounds:1}})]);
  return config;
}
function create(root,id,track='minimal',risks=[]) {
  return cli(root,'work',['create',id,'--title','Proportional protocol fixture','--owner','fixture coordinator','--track',track,'--reason','Bounded local fixture with explicit risk assessment',...(risks.length?['--risk',risks.join(',')]:[])]);
}
function input(id,track,extra={}) {
  const guide=fs.readFileSync(path.join(source,'skills/coordinate-work/references',track==='reinforced'?'workflow-operations.md':'delivery-tracks.md'),'utf8');
  const examples=[...guide.matchAll(/^```json\s*\n([\s\S]*?)^```\s*$/gm)].map(match=>JSON.parse(match[1]));
  const template=examples.find(value=>value.initiative&&(value.track??'reinforced')===track);
  assert.ok(template,`Missing executable ${track} guide example`);
  return {...template,id:'delivery',initiative:id,objective:'Exercise installed orchestration using a synthetic protocol client',scope:['fixture.txt'],exclusions:['Model reasoning certification'],ownership:['fixture.txt'],references:['AGENTS.md','fixture.txt'],acceptance:['Return collected evidence from the synthetic client'],...extra};
}
function workflow(root,id,config,value) {
  return cli(root,'agents',['workflow','create','--input',externalJSON('workflow',value),'--config',config]);
}
function finish(root,id,config,expectedStages,counts,inspect=()=>{}) {
  const stages=[],executions=[];
  while(cli(root,'agents',['workflow','status',id]).stage!=='ready_to_close') {
    const current=cli(root,'agents',['workflow','status',id]);
    assert.ok(stages.length<8,'Workflow must terminate without unlimited correction');
    stages.push(current.stage);
    const result=cli(root,'agents',['workflow','run',id,'--config',config]);
    assert.equal(result.results.length,counts[current.stage],current.stage);
    for(const execution of result.results) {
      assert.equal(execution.status,'completed',execution.error);
      assert.ok(execution.collected_at,'Completed subprocess is not an integrated result until collected');
      executions.push(execution);
    }
    inspect(current.stage,result.results);
    cli(root,'agents',['workflow','advance',id,'--confirm','--reviewer','fixture coordinator']);
  }
  assert.deepEqual(stages,expectedStages);
  return executions;
}
function closure(root,id) {
  command(root,'git',['diff','--check']);
  const value={reviewer:'fixture coordinator',reviewed_at:new Date().toISOString(),summary:'Local protocol fixture validated. No durable behavior, decision, invariant or roadmap changed.',validation:[{command:'git diff --check',outcome:'passed',evidence:'Executed by the acceptance test on this temporary consumer; exited 0.'}],sources:[]};
  write(path.join(workDirectory(root,id),'closure.json'),value);
  return value;
}
function mutateJSON(file,change,check) {
  const original=fs.readFileSync(file);
  try {const value=read(file);change(value);write(file,value);check();}
  finally {fs.writeFileSync(file,original);}
}
function guideFailures(root,layout) {return checkOperationalGuides(root,{layout}).filter(result=>result.status==='failed');}
function mutateGuide(root,change) {
  const relative='coordinate-work/references/delivery-tracks.md';
  const files=['.harness/core/skills','.agents/skills','.claude/skills'].map(prefix=>path.join(root,prefix,relative));
  const originals=files.map(file=>fs.readFileSync(file));
  try {
    files.forEach((file,index)=>fs.writeFileSync(file,change(originals[index].toString())));
    assert.ok(guideFailures(root,'consumer').some(result=>result.id==='guide-json-example'),'Invalid track guide example was accepted');
  } finally {files.forEach((file,index)=>fs.writeFileSync(file,originals[index]));}
}

try {
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA='a'.repeat(40);
  fs.mkdirSync(environment.HOME,{recursive:true});
  fs.writeFileSync(fixture,`#!/usr/bin/env node
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
if(process.argv.includes('--version')){console.log('codex-cli synthetic fixture');process.exit(0);}
if(process.argv.includes('--help')){console.log('--sandbox --json --output-last-message');process.exit(0);}
let prompt='';for await(const chunk of process.stdin)prompt+=chunk;
const task=JSON.parse(prompt.split('TASK\\n')[1].split('\\nINITIATIVE SUMMARY')[0]);
if(task.role==='implementation')fs.writeFileSync('fixture.txt','delivered by synthetic protocol fixture\\n');
execFileSync('git',['diff','--check'],{stdio:'pipe'});
console.log(JSON.stringify({schema_version:1,task_id:task.id,status:'completed',summary:'Synthetic protocol fixture; no provider or model invoked',changes:task.role==='implementation'?['fixture.txt']:[],verification:[{command:'git diff --check',outcome:'passed',evidence:'Executed inside the synthetic protocol client; exited 0. This is fixture validation only.'}],findings:[],questions:[],pending:[],durable_candidates:[]}));
`,{mode:0o755});

  const direct=installed('direct-minimal');
  fs.writeFileSync(path.join(direct,'fixture.txt'),'small direct correction\n');
  command(direct,'git',['diff','--check']);
  assert.equal(fs.existsSync(path.join(direct,'.harness_work/initiatives')),false,'Direct minimum must not require an initiative record');
  assert.equal(fs.existsSync(environment.XDG_CONFIG_HOME),false,'Direct minimum needs no personal profile');

  const minimal=installed('delegated-minimal'),mid='20261029_minimal';
  assert.equal(create(minimal,mid).status,'active');
  assert.deepEqual(fs.readdirSync(workDirectory(minimal,mid)),['state.json'],'Minimum creation must not produce ceremonial files');
  const minimalConfig=configure(minimal,['implementation'],true);
  assert.equal(cli(minimal,'agents',['doctor','--roles','implementation','--config',minimalConfig]).ok,true);
  assert.equal(cli(minimal,'agents',['doctor','--config',minimalConfig],2).status,2,'General diagnosis still reports unused broken profiles');
  const minimalWorkflow=workflow(minimal,mid,minimalConfig,input(mid,'minimal'));
  assert.equal(minimalWorkflow.stage,'implementation');assert.deepEqual(minimalWorkflow.required_reviews,[]);
  cli(minimal,'agents',['workflow','next',mid]);
  rejected(minimal,'work',['close',mid],/agent|workflow|closure|task/i);
  const executions=finish(minimal,mid,minimalConfig,['implementation'],{implementation:1},(stage,results)=>{
    const file=path.join(workDirectory(minimal,mid),'agents',results[0].task_id,'result.json');
    for(const verification of [[],[{command:'git diff --check',outcome:'not_run',evidence:'Explicit unexecuted fixture check'}]])mutateJSON(file,value=>value.verification=verification,()=>rejected(minimal,'agents',['workflow','advance',mid,'--confirm'],/evidence|passed|verification|test/i));
  });
  assert.equal(executions.length,1,'Delegated minimum needs one worker');
  const compact=closure(minimal,mid),closureFile=path.join(workDirectory(minimal,mid),'closure.json');
  for(const invalid of [[],[{command:'git diff --check',outcome:'not_run',evidence:'not executed'}],[{command:'git diff --check',outcome:'failed',evidence:'failed'}],[{command:'',outcome:'passed',evidence:'no command'}],[{command:'git diff --check',outcome:'passed',evidence:''}]]) {
    write(closureFile,{...compact,validation:invalid});rejected(minimal,'work',['close',mid,'--check']);
  }
  write(closureFile,{...compact,sources:['docs/missing.md']});rejected(minimal,'work',['close',mid,'--check'],/source|exist/i);
  write(closureFile,compact);
  mutateJSON(path.join(workDirectory(minimal,mid),'state.json'),state=>state.blockers.push('Unresolved fixture blocker'),()=>rejected(minimal,'work',['close',mid,'--check'],/blocker/i));
  assert.equal(cli(minimal,'work',['close',mid,'--check']).ready,true);
  assert.equal(cli(minimal,'work',['close',mid]).status,'closed');
  assert.equal(fs.existsSync(path.join(minimal,'docs')),false,'No canonical file is required when no durable knowledge changed');
  assert.equal(fs.existsSync(path.join(workDirectory(minimal,mid),'closure.md')),false,'Compact closure is sufficient');

  const standard=installed('standard'),sid='20261029_standard';
  create(standard,sid,'standard');const standardConfig=configure(standard,['implementation','functional']);
  const standardWorkflow=workflow(standard,sid,standardConfig,input(sid,'standard',{needs_definition:false}));
  assert.deepEqual(standardWorkflow.required_reviews,['functional']);
  const workflowFile=path.join(workDirectory(standard,sid),'workflow.json');
  mutateJSON(workflowFile,value=>value.required_reviews=[],()=>rejected(standard,'agents',['workflow','status',sid],/review|coverage/i));
  finish(standard,sid,standardConfig,['implementation','review'],{implementation:1,review:1},(stage,results)=>{
    if(stage!=='review')return;
    const directory=path.join(workDirectory(standard,sid),'agents',results[0].task_id);
    const task=read(path.join(directory,'task.json'));
    for(const dimension of ['security','logging','UI','UX'])assert.ok(task.objective.includes(dimension),`Grouped review must include ${dimension}`);
    const file=path.join(directory,'result.json');
    for(const verification of [[],[{command:'git diff --check',outcome:'not_run',evidence:'No review control was performed'}],[{command:'Inspect delivered fixture',outcome:'failed',evidence:'Synthetic failed review control'}]])mutateJSON(file,value=>value.verification=verification,()=>rejected(standard,'agents',['workflow','advance',sid,'--confirm'],/evidence|passed|verification|test|failure/i));
    const result=read(file);
    assert.equal(fs.readFileSync(path.join(standard,'fixture.txt'),'utf8'),'delivered by synthetic protocol fixture\n');
    const implementation=read(path.join(workDirectory(standard,sid),'agents',task.dependencies[0],'result.json'));
    assert.equal(implementation.verification[0].outcome,'passed');
    result.verification=[{command:'Acceptance fixture inspects delivered content and collected implementation evidence',outcome:'passed',evidence:'This test read fixture.txt, the review task and the implementation result; the expected fixture content and passing implementation check were observed.'},{command:'Application semantic tests',outcome:'not_run',evidence:'Not part of this protocol fixture. The reviewer uses observed implementation validation instead of claiming model or application certification.'}];
    write(file,result);
  });
  closure(standard,sid);
  const delivered=fs.readFileSync(path.join(standard,'fixture.txt'));
  try {
    fs.writeFileSync(path.join(standard,'fixture.txt'),'Changed after the final review\n');
    rejected(standard,'work',['close',sid,'--check'],/baseline|changed|review|version/i);
  } finally {fs.writeFileSync(path.join(standard,'fixture.txt'),delivered);}
  assert.equal(cli(standard,'work',['close',sid]).status,'closed');

  const defined=installed('standard-definition'),did='20261029_defined';
  create(defined,did,'standard');const definedConfig=configure(defined,['definition','implementation','functional']);
  workflow(defined,did,definedConfig,input(did,'standard',{needs_definition:true}));
  finish(defined,did,definedConfig,['definition','implementation','review'],{definition:1,implementation:1,review:1});

  const reinforced=installed('reinforced'),rid='20261029_reinforced';
  const legacy=cli(reinforced,'work',['create',rid,'--title','Legacy fixture','--owner','fixture coordinator']);
  assert.equal(legacy.status,'draft');assert.ok(fs.existsSync(path.join(workDirectory(reinforced,rid),'brief.md')));
  const reinforcedConfig=configure(reinforced);
  const legacyInput=input(rid,'reinforced',{applicability:{ui:{applies:true,reason:'Exercise legacy review coverage'},ux:{applies:true,reason:'Exercise legacy review coverage'}}});
  delete legacyInput.track;delete legacyInput.assessment;
  assert.equal(workflow(reinforced,rid,reinforcedConfig,legacyInput).stage,'definition');
  const legacyExecutions=finish(reinforced,rid,reinforcedConfig,['definition','implementation','review','verification'],{definition:1,implementation:1,review:5,verification:1});
  assert.equal(legacyExecutions.length,8,'Unclassified legacy route preserves the complete review set');
  mutateJSON(path.join(workDirectory(reinforced,rid),'workflow.json'),value=>value.required_reviews=['functional'],()=>rejected(reinforced,'agents',['workflow','status',rid],/review|coverage/i));

  const guarded=installed('track-guards'),guardConfig=configure(guarded);
  for(const risk of ['security','data_integrity','financial','migration','public_contract','production','irreversible']) {
    const id=`20261029_risk_${risk}`;assert.equal(create(guarded,id,'minimal',[risk]).track,'reinforced',risk);
  }
  for(const risk of ['shared_surface','uncertainty']) {
    const id=`20261029_risk_${risk}`;assert.equal(create(guarded,id,'minimal',[risk]).track,'standard',risk);
  }
  const uncertain='20261029_uncertain_definition';create(guarded,uncertain,'minimal',['uncertainty']);
  const inherited=input(uncertain,'minimal');delete inherited.assessment;
  assert.equal(workflow(guarded,uncertain,guardConfig,inherited).stage,'definition','Inherited uncertainty requires definition');
  const applicability={ui:{applies:false,reason:'Fixture has no interface'},ux:{applies:false,reason:'Fixture has no user interaction'}};
  const workflowRisk='20261029_workflow_risk';create(guarded,workflowRisk);
  assert.equal(workflow(guarded,workflowRisk,guardConfig,input(workflowRisk,'minimal',{assessment:{reason:'Synthetic security risk requires complete controls',risks:['security']},applicability})).track,'reinforced','Workflow risk cannot bypass elevation');
  write(path.join(guarded,'.harness/project/agents.json'),{schema_version:1,minimum_track:'standard'});
  assert.equal(create(guarded,'20261029_project_floor').track,'standard');
  write(path.join(guarded,'.harness/project/agents.json'),{schema_version:1,required_roles:['security']});
  const security='20261029_project_security';assert.equal(create(guarded,security).track,'reinforced');
  assert.ok(workflow(guarded,security,guardConfig,input(security,'minimal',{applicability})).required_reviews.includes('security'));
  write(path.join(guarded,'.harness/project/agents.json'),{schema_version:1,required_roles:['ui']});
  const ui='20261029_project_ui';create(guarded,ui);
  rejected(guarded,'agents',['workflow','create','--input',externalJSON('required-ui',input(ui,'minimal',{applicability})),'--config',guardConfig],/requires ui|applicability/i);
  fs.unlinkSync(path.join(guarded,'.harness/project/agents.json'));
  const retained='20261029_retained_track';create(guarded,retained,'standard');
  assert.equal(workflow(guarded,retained,guardConfig,input(retained,'minimal')).track,'standard','Requested workflow cannot lower the initiative track');
  assert.equal(cli(guarded,'work',['status',retained]).track,'standard');

  assert.deepEqual(guideFailures(source,'source'),[],'Source operational guides must support all tracks');
  assert.deepEqual(guideFailures(standard,'consumer'),[],'Fresh consumer operational guides must support all tracks');
  mutateGuide(standard,text=>text.replace('"track": "minimal"','"track": "unknown"'));
  mutateGuide(standard,text=>text.replace('"risks": []','"risks": ["unclassified-risk"]'));
  mutateGuide(standard,text=>text.replace('"needs_definition": false','"needs_definition": "false"'));
  console.log('Proportional delivery passed: direct and delegated minimum, compact truthful closure, standard with optional definition and one grouped reviewer, unchanged legacy full route, risk/project floors, no lowering, review coverage and installed guides. Synthetic protocol client only; no model invoked.');
} finally {
  if(previous.repository===undefined)delete process.env.GITHUB_REPOSITORY;else process.env.GITHUB_REPOSITORY=previous.repository;
  if(previous.sha===undefined)delete process.env.GITHUB_SHA;else process.env.GITHUB_SHA=previous.sha;
  fs.rmSync(temporary,{recursive:true,force:true});
}
