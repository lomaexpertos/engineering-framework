import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {operate} from './harness-work.mjs';
import {checkRepository} from './harness-check.mjs';
import {syncConsumer,planConsumer} from './sync-consumer.mjs';
import {setup,agentRoles} from './agent-profiles.mjs';
import {createWorkflow,cancelWorkflow} from './agent-workflow.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-agent-integration-'));
const root=path.join(temporary,'project');fs.mkdirSync(root);
const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
const id='20261028_agent_integration';
const directory=path.join(root,'.harness_work/initiatives',id);
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');};
process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';
process.env.GITHUB_SHA='a'.repeat(40);
try {
  git('init','-b','feature/agents');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','fixture');
  const personal=path.join(temporary,'personal/profiles.json');
  await setup(root,{configPath:personal,configuration:{schema_version:1,profiles:{reviewer:{adapter:'codex',model:'fixture-model'}},roles:Object.fromEntries(agentRoles.map(role=>[role,'reviewer']))},interactive:false});
  const before=fs.readFileSync(personal);
  syncConsumer(root);
  for(const module of ['harness-agents','agent-execution','agent-profiles','agent-adapters','agent-workflow'])assert.ok(fs.existsSync(path.join(root,`.harness/core/runtime/tooling/${module}.mjs`)),module);
  assert.ok(fs.existsSync(path.join(root,'.harness/agents.sh')));
  assert.deepEqual(fs.readFileSync(personal),before);
  write(path.join(root,'.harness/project/agents.json'),{schema_version:1,allowed_adapters:['unknown']});
  assert.equal(checkRepository(root,{scope:'extensions'}).ok,false);
  write(path.join(root,'.harness/project/agents.json'),{schema_version:1});
  assert.equal(checkRepository(root,{scope:'extensions'}).ok,true);
  operate(root,'create',[id],{title:'Agent lifecycle',owner:'coordinator'});
  operate(root,'transition',[id,'ready'],{confirm:true});operate(root,'transition',[id,'active'],{confirm:true});
  const execution=path.join(directory,'agents/reviewer/execution.json');
  write(execution,{schema_version:1,status:'prepared'});
  // Even a missing active_tasks entry cannot conceal an uncollected worker.
  assert.throws(()=>operate(root,'transition',[id,'validating'],{confirm:true}),/Uncollected/);
  assert.throws(()=>planConsumer(root),/Uncollected/);
  write(execution,{schema_version:1,status:'completed',collected_at:new Date().toISOString()});
  createWorkflow(root,{id:'integration',initiative:id,objective:'Exercise lifecycle guards',scope:['fixture'],exclusions:[],ownership:['product.txt'],references:[],acceptance:['Explicit cancellation closes workflow'],applicability:{ui:{applies:false,reason:'No interface'},ux:{applies:false,reason:'No interaction'}}},{configPath:personal});
  assert.throws(()=>operate(root,'transition',[id,'validating'],{confirm:true}),/workflow/);
  await cancelWorkflow(root,id);
  assert.equal(operate(root,'transition',[id,'validating'],{confirm:true}).status,'validating');
  assert.deepEqual(fs.readFileSync(personal),before);
  console.log('Agent integration passed: distributed runtime, preserved personal configuration, uncollected tasks and workflow block lifecycle/update.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
