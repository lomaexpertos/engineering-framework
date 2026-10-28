import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {operate} from './harness-work.mjs';
import {setup} from './agent-profiles.mjs';
import {prepareTask,runTask,statusTask,collectTask,cancelTask,assertNoOpenAgents,readJSON,validateTask,validateResult} from './agent-execution.mjs';
import {createWorkflow,workflowNext,runWorkflow,advanceWorkflow,workflowStatus,cancelWorkflow} from './agent-workflow.mjs';
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-agents-test-'));
const root=path.join(temporary,'repo');fs.mkdirSync(root);
const configPath=path.join(temporary,'profiles.json');
const mock=path.join(temporary,'mock-client.mjs');
fs.writeFileSync(mock,`#!/usr/bin/env node
import fs from 'node:fs';
if(process.argv.includes('--version')){console.log('codex-cli 0.165.0');process.exit(0);}
if(process.argv.includes('--help')){console.log('--sandbox --json --output-last-message');process.exit(0);}
let prompt='';for await(const chunk of process.stdin)prompt+=chunk;
const task=JSON.parse(prompt.split('TASK\\n')[1].split('\\nINITIATIVE SUMMARY')[0]);
if(task.objective.includes('QUESTION')&&prompt.includes('answer supplied')&&!prompt.includes('"questions":["What is required?"]'))process.exit(3);
if(task.objective.includes('FAIL_ONCE')&&!fs.existsSync('.harness_work/runtime/failed-once')){fs.writeFileSync('.harness_work/runtime/failed-once','fixture');process.exit(1);}
if(task.objective.includes('WAIT'))await new Promise(resolve=>setTimeout(resolve,60000));
const questions=task.objective.includes('QUESTION')&&!prompt.includes('answer supplied')?['What is required?']:[];
const findings=[];
if(task.objective.includes('OUTSIDE'))fs.writeFileSync('outside.txt','invalid ownership');
if(task.role==='implementation')fs.writeFileSync('product.txt',task.objective.includes('Correct the consolidated')?'fixed':'flawed');
if(task.role==='security'&&fs.readFileSync('product.txt','utf8')==='flawed')findings.push({id:'S1',severity:'blocker',dimension:'security',location:'product.txt:1',evidence:'fixture flawed state',impact:'fixture failure',resolution:'fixture fixed state',status:'open'});
console.log(JSON.stringify({schema_version:1,task_id:task.id,status:questions.length?'needs_input':'completed',summary:'Synthetic harness protocol test; no real model invoked',changes:task.role==='implementation'?['product.txt']:[],verification:[{command:'fixture inspection',outcome:'passed',evidence:'Synthetic fixture evidence'}],findings,questions,pending:[],durable_candidates:[]}));
`,{mode:0o755});
const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
const initiative='20261028_agents_test';
const configuration={schema_version:1,profiles:{local:{adapter:'codex',model:'fixture',permission:'workspace-write',executable:mock}},roles:Object.fromEntries(['definition','implementation','functional','security','logging','ui','ux'].map(r=>[r,'local'])),limits:{max_concurrency:2,timeout_seconds:10,max_correction_rounds:2}};
const cli=(...args)=>JSON.parse(execFileSync(process.execPath,[fileURLToPath(new URL('./harness-agents.mjs',import.meta.url)),...args,'--root',root],{encoding:'utf8'}));
try {
  git(['init','-q']);git(['config','user.email','test@example.invalid']);git(['config','user.name','Harness Test']);
  fs.writeFileSync(path.join(root,'AGENTS.md'),'# Test fixture\n');fs.writeFileSync(path.join(root,'product.txt'),'fixed');fs.writeFileSync(path.join(root,'.gitignore'),'.harness_work/runtime/\n');
  git(['add','AGENTS.md','product.txt','.gitignore']);git(['commit','-qm','fixture']);
  operate(root,'create',[initiative],{title:'Agent executor fixture',owner:'test'});
  await setup(root,{configPath,configuration});
  const base={schema_version:1,id:'first',initiative,role:'functional',objective:'Inspect fixture',scope:['product.txt'],exclusions:[],ownership:[],references:['AGENTS.md'],acceptance:['Report fixture evidence'],dependencies:[],permissions:'read-only'};
  assert.throws(()=>validateTask({...base,unknown:true}),/Unknown/);
  assert.throws(()=>validateTask({...base,id:123}),/identity/);
  assert.throws(()=>validateTask({...base,initiative:'../escape'}),/initiative/);
  assert.throws(()=>validateTask({...base,workspace:3}),/workspace/);
  assert.throws(()=>prepareTask(root,{...base,id:'unsafe',permissions:'workspace-write',role:'implementation',ownership:['src/./file']}),/Unsafe/);
  prepareTask(root,base);assert.throws(()=>assertNoOpenAgents(root,initiative),/Uncollected/);
  const first=await runTask(root,initiative,'first',{configPath});assert.equal(first.status,'completed');
  assert.equal(collectTask(root,initiative,'first').status,'completed');assertNoOpenAgents(root,initiative);
  assert.equal((await cancelTask(root,initiative,'first')).status,'completed','cancellation must preserve completed delivery evidence');
  assert.throws(()=>validateResult({...readJSON(path.join(root,'.harness_work','initiatives',initiative,'agents/first/result.json')),unknown:1},'first'),/Unknown/);
  assert.throws(()=>validateResult({...readJSON(path.join(root,'.harness_work','initiatives',initiative,'agents/first/result.json')),task_id:'../invalid'},'../invalid'),/Invalid agent result/);
  prepareTask(root,{...base,id:'question',role:'definition',objective:'QUESTION'});
  assert.equal((await runTask(root,initiative,'question',{configPath})).status,'needs_input');
  collectTask(root,initiative,'question');
  await assert.rejects(runTask(root,initiative,'question',{configPath}),/answers/);
  const answersFile=path.join(temporary,'answers.json');fs.writeFileSync(answersFile,JSON.stringify(['answer supplied']));
  assert.equal(cli('run',initiative,'question','--config',configPath,'--answers',answersFile).status,'completed');collectTask(root,initiative,'question');
  assert(fs.readdirSync(path.join(root,'.harness_work','initiatives',initiative,'agents/question')).some(x=>x.startsWith('answers-')));
  assert(fs.readdirSync(path.join(root,'.harness_work','initiatives',initiative,'agents/question')).some(x=>x.startsWith('result-')),'retry must preserve the previous questions as attempt evidence');
  prepareTask(root,{...base,id:'cancel',objective:'WAIT'});await runTask(root,initiative,'cancel',{configPath,background:true});
  await new Promise(resolve=>setTimeout(resolve,300));assert.equal((await cancelTask(root,initiative,'cancel')).status,'cancelled');
  prepareTask(root,{...base,id:'orphan',objective:'WAIT'});await runTask(root,initiative,'orphan',{configPath,background:true});
  let orphan;
  for(let attempt=0;attempt<100;attempt++){orphan=statusTask(root,initiative,'orphan');if(orphan.child)break;await new Promise(resolve=>setTimeout(resolve,20));}
  assert(orphan.child,'fixture client must start before supervisor is killed');
  process.kill(orphan.supervisor.pid,'SIGKILL');await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(statusTask(root,initiative,'orphan').status,'orphaned');
  assert.equal((await cancelTask(root,initiative,'orphan')).status,'cancelled');
  prepareTask(root,{...base,id:'stale'});fs.writeFileSync(path.join(root,'product.txt'),'changed');await assert.rejects(runTask(root,initiative,'stale',{configPath}),/baseline changed/);await cancelTask(root,initiative,'stale');
  fs.writeFileSync(path.join(root,'product.txt'),'fixed');
  prepareTask(root,{...base,id:'obsolete-delivery'});
  assert.equal((await runTask(root,initiative,'obsolete-delivery',{configPath})).status,'completed');
  fs.writeFileSync(path.join(root,'product.txt'),'new baseline');
  assert.throws(()=>collectTask(root,initiative,'obsolete-delivery'),/baseline changed/);
  assert.equal((await cancelTask(root,initiative,'obsolete-delivery')).status,'cancelled');
  fs.writeFileSync(path.join(root,'product.txt'),'fixed');
  prepareTask(root,{...base,id:'outside',role:'implementation',permissions:'workspace-write',ownership:['product.txt'],objective:'OUTSIDE'});
  assert.equal((await runTask(root,initiative,'outside',{configPath})).status,'failed');
  collectTask(root,initiative,'outside');fs.unlinkSync(path.join(root,'outside.txt'));
  prepareTask(root,{...base,id:'other-writer',role:'implementation',permissions:'workspace-write',ownership:['product.txt']});
  await assert.rejects(runTask(root,initiative,'outside',{configPath}),/Ownership overlaps/);
  await cancelTask(root,initiative,'other-writer');
  await setup(root,{configPath,configuration:{...configuration,limits:{...configuration.limits,timeout_seconds:1}}});
  prepareTask(root,{...base,id:'timeout',objective:'WAIT'});assert.equal((await runTask(root,initiative,'timeout',{configPath})).status,'timed_out');collectTask(root,initiative,'timeout');
  await setup(root,{configPath,configuration});
  await setup(root,{configPath,configuration:{...configuration,limits:{...configuration.limits,max_correction_rounds:0}}});
  const workflow=createWorkflow(root,{id:'delivery',initiative,objective:'Deliver fixture FAIL_ONCE',scope:['product.txt'],exclusions:[],ownership:['product.txt'],references:['AGENTS.md'],acceptance:['Fix synthetic security defect'],applicability:{ui:{applies:true,reason:'Synthetic review coverage'},ux:{applies:true,reason:'Synthetic review coverage'}}},{configPath});
  assert.equal(workflow.stage,'definition');assert.throws(()=>assertNoOpenAgents(root,initiative),/workflow/);
  assert.throws(()=>advanceWorkflow(root,initiative),/confirm/);
  const failedNext=workflowNext(root,initiative);
  assert.equal((await runWorkflow(root,initiative,{configPath})).results[0].status,'failed');
  collectTask(root,initiative,failedNext.tasks[0]);
  for(let stage=0;stage<9&&workflowStatus(root,initiative).stage!=='ready_to_close';stage++) {
    if(workflowStatus(root,initiative).stage==='blocked') {
      const escalation=path.join(temporary,'escalation.json');fs.writeFileSync(escalation,JSON.stringify({reason:'Fixture coordinator authorizes another correction round',reviewer:'fixture coordinator'}));
      await setup(root,{configPath,configuration});
      assert.equal(cli('workflow','escalate',initiative,'--input',escalation,'--confirm','--config',configPath).stage,'correction');
    }
    const next=workflowNext(root,initiative);if(next.workflow.stage==='review')assert.equal(next.tasks.length,5);
    if(next.workflow.stage==='definition')await runTask(root,initiative,next.tasks[0],{configPath,background:true});
    const results=await runWorkflow(root,initiative,{configPath});assert(results.results.every(r=>r.status==='completed'),JSON.stringify(results));
    advanceWorkflow(root,initiative,{confirm:true,reviewer:'fixture coordinator'});
  }
  const final=workflowStatus(root,initiative);assert.equal(final.stage,'ready_to_close');assert.equal(final.round,1);assert.equal(fs.readFileSync(path.join(root,'product.txt'),'utf8'),'fixed');assertNoOpenAgents(root,initiative);
  const another='20261028_cancel_test';operate(root,'create',[another],{title:'Cancellation fixture',owner:'test'});
  createWorkflow(root,{...workflow,id:'cancel-flow',initiative:another},{configPath});workflowNext(root,another);assert.equal((await cancelWorkflow(root,another)).stage,'cancelled');assertNoOpenAgents(root,another);
  console.log('Agent execution: synthetic adapter lifecycle, questions, durable answers, cancellation/timeouts, live-session rejoin, ownership enforcement, baseline protection, five reviewers, correction loop, final verification and closure guards passed.');
} finally {
  // Tests own only this temporary fixture. Ensure no known subprocess survives cleanup.
  for(const iid of [initiative,'20261028_cancel_test']) {
    const agents=path.join(root,'.harness_work/initiatives',iid,'agents');
    if(fs.existsSync(agents))for(const id of fs.readdirSync(agents))try{if(!statusTask(root,iid,id).collected_at)await cancelTask(root,iid,id);}catch{/* Preserve test failure. */}
  }
  fs.rmSync(temporary,{recursive:true,force:true});
}
