import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {resolveTrack,trackOf,maxTrack,riskFlags} from './harness-tracks.mjs';
import {operate} from './harness-work.mjs';
import {doctor} from './agent-profiles.mjs';
import {createWorkflow,draftWorkflow,workflowNext,runWorkflow,advanceWorkflow,workflowStatus,cancelWorkflow,validateWorkflow} from './agent-workflow.mjs';
import {assertNoOpenAgents,assertFinalDelivery,readJSON,statusTask,cancelTask} from './agent-execution.mjs';

const assessment={reason:'Bounded task with no material risk',risks:[]};
assert.equal(resolveTrack(), 'reinforced');
assert.equal(trackOf({}), 'reinforced');
assert.throws(()=>trackOf({track:null}),/Invalid track/);
assert.equal(resolveTrack('minimal',assessment),'minimal');
for(const risk of riskFlags)assert.equal(resolveTrack('minimal',{reason:'Coordinator risk assessment',risks:[risk]}),['shared_surface','uncertainty'].includes(risk)?'standard':'reinforced');
assert.equal(resolveTrack('minimal',assessment,{minimum_track:'standard'}),'standard');
assert.equal(resolveTrack('minimal',assessment,{required_roles:['functional']}),'standard');
assert.equal(resolveTrack('minimal',assessment,{required_roles:['security']}),'reinforced');
assert.equal(maxTrack('minimal','reinforced','standard'),'reinforced');
for(const value of [undefined,{reason:'',risks:[]},{reason:'reason',risks:['unknown']},{reason:'reason',risks:['security','security']},{...assessment,extra:true}])assert.throws(()=>resolveTrack('minimal',value),/assessment|Track selection/);

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-agent-tracks-'));
const root=path.join(temporary,'repo');fs.mkdirSync(root);
const configPath=path.join(temporary,'profiles.json');
const mock=path.join(temporary,'client.mjs');
fs.writeFileSync(mock,`#!/usr/bin/env node
import fs from 'node:fs';
if(process.argv.includes('--version')){console.log('codex-cli 0.165.0');process.exit(0);}
if(process.argv.includes('--help')){console.log('--sandbox --json --output-last-message');process.exit(0);}
let prompt='';for await(const chunk of process.stdin)prompt+=chunk;
const task=JSON.parse(prompt.split('TASK\\n')[1].split('\\nINITIATIVE SUMMARY')[0]);
const findings=[];
if(task.role==='implementation')fs.writeFileSync('product.txt',task.objective.includes('BLOCK_ONCE')&&!task.objective.includes('Correct the consolidated')?'flawed':'fixed');
if(task.role==='functional'&&task.objective.includes('BLOCK_ONCE')&&fs.readFileSync('product.txt','utf8')==='flawed')findings.push({id:'F1',severity:'blocker',dimension:'functional',location:'product.txt:1',evidence:'fixture flawed state',impact:'fixture acceptance not met',resolution:'fixture fixed state',status:'open'});
if(task.role==='implementation'&&task.objective.includes('RECOMMENDATION'))findings.push({id:'R1',severity:'recommendation',dimension:'comments',location:'product.txt:1',evidence:'fixture recommendation',impact:'fixture clarity',resolution:'explicit disposition',status:'open'});
const verification=task.objective.includes('NO_EVIDENCE')?[]:[{command:'fixture inspection',outcome:'passed',evidence:'Synthetic protocol fixture; no product/model claims'}];
console.log(JSON.stringify({schema_version:1,task_id:task.id,status:'completed',summary:'Synthetic track fixture only',changes:task.role==='implementation'?['product.txt']:[],verification,findings,questions:[],pending:[],durable_candidates:[]}));
`,{mode:0o755});
const configuration={schema_version:1,profiles:{worker:{adapter:'codex',model:'fixture-worker',executable:mock},reviewer:{adapter:'codex',model:'fixture-reviewer',executable:mock,permission:'read-only'},unused:{adapter:'codex',model:'unused',executable:path.join(temporary,'unavailable')}},roles:{implementation:'worker',functional:'reviewer',definition:'reviewer',security:'unused'},limits:{max_correction_rounds:1}};
fs.writeFileSync(configPath,JSON.stringify(configuration));
const ids=[];
const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
const input=(initiative,extra={})=>({id:'delivery',initiative,objective:'Deliver bounded fixture',scope:['product.txt'],exclusions:[],ownership:['product.txt'],references:['AGENTS.md'],acceptance:['Report observed validation'],...extra});
function initiative(name,track='minimal') {
  const id=`20261029_${name}`;ids.push(id);
  operate(root,'create',[id],{title:'Track fixture',owner:'test',...(track?{track,reason:assessment.reason}:{})});
  return id;
}
async function runStage(id) {const result=await runWorkflow(root,id,{configPath});assert.ok(result.results.length);assert.ok(result.results.every(item=>item.status==='completed'),JSON.stringify(result));return result;}
try {
  git(['init','-q']);git(['config','user.email','test@example.invalid']);git(['config','user.name','Harness Test']);
  fs.writeFileSync(path.join(root,'AGENTS.md'),'# Synthetic track fixture\n');fs.writeFileSync(path.join(root,'product.txt'),'initial');fs.writeFileSync(path.join(root,'.gitignore'),'.harness_work/runtime/\n');
  git(['add','.']);git(['commit','-qm','fixture']);
  assert.equal(doctor(root,{configPath,roles:['implementation']}).ok,true);
  assert.equal(doctor(root,{configPath}).ok,false);

  const minimal=initiative('minimal');
  const created=createWorkflow(root,input(minimal),{configPath});
  assert.equal(created.track,'minimal');assert.equal(created.stage,'implementation');assert.deepEqual(created.required_reviews,[]);assert.ok(!created.applicability);
  assert.deepEqual(workflowNext(root,minimal).tasks,['delivery-implementation-0-implementation']);
  await runStage(minimal);
  assert.throws(()=>advanceWorkflow(root,minimal),/confirm/);
  fs.writeFileSync(path.join(root,'product.txt'),'changed after validation');
  assert.throws(()=>advanceWorkflow(root,minimal,{confirm:true}),/delivered baseline/);
  fs.writeFileSync(path.join(root,'product.txt'),'fixed');
  const minimalFinal=advanceWorkflow(root,minimal,{confirm:true});
  assert.equal(minimalFinal.stage,'ready_to_close');assert.deepEqual(minimalFinal.history.map(item=>item.stage),['implementation']);assert.equal(Object.values(minimalFinal.tasks).flat().length,1);assertNoOpenAgents(root,minimal);
  assertFinalDelivery(root,minimal);
  fs.writeFileSync(path.join(root,'product.txt'),'Changed after final acceptance');assert.throws(()=>assertFinalDelivery(root,minimal),/baseline changed/);fs.writeFileSync(path.join(root,'product.txt'),'fixed');
  fs.mkdirSync(path.join(root,'docs'));fs.writeFileSync(path.join(root,'docs/knowledge.md'),'Consolidated knowledge\n');assertFinalDelivery(root,minimal);
  const minimalWorkflowFile=path.join(root,'.harness_work/initiatives',minimal,'workflow.json');
  fs.writeFileSync(minimalWorkflowFile,JSON.stringify({...minimalFinal,ownership:['product.txt','docs']}));assert.throws(()=>assertFinalDelivery(root,minimal),/docs\/knowledge/);fs.writeFileSync(minimalWorkflowFile,JSON.stringify(minimalFinal));
  git(['add','docs/knowledge.md']);git(['commit','-qm','fixture knowledge consolidation']);assertFinalDelivery(root,minimal);

  const noEvidence=initiative('no_evidence');createWorkflow(root,input(noEvidence,{objective:'NO_EVIDENCE'}),{configPath});await runStage(noEvidence);
  assert.throws(()=>advanceWorkflow(root,noEvidence,{confirm:true}),/passing evidence/);
  await cancelWorkflow(root,noEvidence);

  const recommendation=initiative('recommendation');createWorkflow(root,input(recommendation,{objective:'RECOMMENDATION'}),{configPath});await runStage(recommendation);
  assert.throws(()=>advanceWorkflow(root,recommendation,{confirm:true}),/Missing recommendation disposition/);
  advanceWorkflow(root,recommendation,{confirm:true,decisions:[{task_id:'delivery-implementation-0-implementation',finding_id:'R1',decision:'accepted',reason:'Coordinator accepted bounded recommendation',evidence:'Synthetic reviewed fixture'}]});

  const standard=initiative('standard','standard');createWorkflow(root,input(standard),{configPath});await runStage(standard);
  assert.equal(advanceWorkflow(root,standard,{confirm:true}).stage,'review');
  const review=workflowNext(root,standard);assert.equal(review.tasks.length,1);
  const reviewer=readJSON(path.join(root,'.harness_work/initiatives',standard,'agents',review.tasks[0],'task.json'));assert.equal(reviewer.role,'functional');assert.match(reviewer.objective,/security, logging, comments, UI and UX/);
  await runStage(standard);const standardFinal=advanceWorkflow(root,standard,{confirm:true});
  assert.equal(standardFinal.stage,'ready_to_close');assert.deepEqual(standardFinal.history.map(item=>item.stage),['implementation','review']);assert.equal(Object.values(standardFinal.tasks).flat().length,2);assertNoOpenAgents(root,standard);
  const reviewExecutionFile=path.join(root,'.harness_work/initiatives',standard,'agents',review.tasks[0],'execution.json');const reviewExecution=readJSON(reviewExecutionFile);delete reviewExecution.final_files;fs.writeFileSync(reviewExecutionFile,JSON.stringify(reviewExecution));assertFinalDelivery(root,standard);
  assert.throws(()=>validateWorkflow({...standardFinal,required_reviews:[]}),/coverage/);

  const correction=initiative('correction','standard');createWorkflow(root,input(correction,{objective:'BLOCK_ONCE'}),{configPath});await runStage(correction);advanceWorkflow(root,correction,{confirm:true});await runStage(correction);
  assert.equal(advanceWorkflow(root,correction,{confirm:true}).stage,'correction');await runStage(correction);advanceWorkflow(root,correction,{confirm:true});await runStage(correction);assert.equal(advanceWorkflow(root,correction,{confirm:true}).stage,'ready_to_close');
  assert.equal(workflowStatus(root,correction).round,1);

  const prototype=input('20261029_draft',{track:'minimal',assessment});
  assert.throws(()=>draftWorkflow({...prototype,track:null}),/Invalid track/);
  assert.throws(()=>draftWorkflow({...prototype,assessment:null},{track:'minimal',assessment}),/assessment/);
  assert.throws(()=>draftWorkflow({...prototype,unrecognized:true}),/Unknown workflow input/);
  assert.equal(draftWorkflow({...prototype,needs_definition:true}).track,'standard');
  assert.equal(draftWorkflow({...prototype,needs_definition:true}).stage,'definition');
  assert.equal(draftWorkflow({...prototype,assessment:{reason:'Unknown acceptance',risks:['uncertainty']}}).stage,'definition');
  assert.equal(draftWorkflow(prototype,{track:'standard',assessment}).track,'standard');
  assert.throws(()=>draftWorkflow(prototype,{}),/applicability/,'legacy initiative floor cannot silently become minimal');
  const applicability={ui:{applies:false,reason:'No UI fixture'},ux:{applies:false,reason:'No UX fixture'}};
  const elevated=draftWorkflow({...prototype,applicability,assessment:{reason:'Touches auth',risks:['security']}});assert.equal(elevated.track,'reinforced');assert.equal(elevated.stage,'definition');assert.deepEqual(elevated.required_reviews,['functional','security','logging']);
  const fullConfigPath=path.join(temporary,'full-profiles.json');fs.writeFileSync(fullConfigPath,JSON.stringify({...configuration,roles:Object.fromEntries(['definition','implementation','functional','security','logging','ui','ux'].map(role=>[role,role==='implementation'?'worker':'reviewer']))}));
  const legacy=initiative('legacy',null);const legacyFlow=createWorkflow(root,input(legacy,{applicability}),{configPath:fullConfigPath});
  assert.equal(trackOf(legacyFlow),'reinforced');
  console.log('Agent tracks: minimal one worker, standard one reviewer/corrections, final baseline evidence, disposition, risk/project floors, optional definition and legacy defaults passed.');
} finally {
  for(const id of ids) {
    const agents=path.join(root,'.harness_work/initiatives',id,'agents');
    if(fs.existsSync(agents))for(const task of fs.readdirSync(agents))try{if(!statusTask(root,id,task).collected_at)await cancelTask(root,id,task);}catch{/* Preserve the test failure. */}
  }
  fs.rmSync(temporary,{recursive:true,force:true});
}
