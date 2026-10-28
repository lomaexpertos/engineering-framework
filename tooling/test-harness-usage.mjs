import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';
import {runnerPlan} from './harness-runner-plan.mjs';
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-usage-'));
const root=path.join(temporary,'consumer');fs.mkdirSync(root);
const git=(...args)=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
const call=(name,args=[],code=0)=>{
  const result=spawnSync('bash',[path.join(root,`.harness/${name}.sh`),...args],{cwd:temporary,encoding:'utf8',timeout:15000});
  assert.equal(result.status,code,`${name} ${args.join(' ')}: ${result.stderr}\n${result.stdout}`);return result.stdout;
};
const snapshot=()=>execFileSync('git',['status','--porcelain','--untracked-files=all'],{cwd:root,encoding:'utf8'});
try {
  git('init','-b','feature/usage');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','fixture');
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA='a'.repeat(40);
  syncConsumer(root);
  const initial=snapshot();
  for(const name of ['agents','work','check','update'])assert.match(call(name,['--help']),/Usage:/);
  assert.equal(snapshot(),initial,'Help must not change project state');
  assert.deepEqual(JSON.parse(call('work',['status','--root',root])),[]);
  for(const args of [['create','20261028_bad','--title','Bad','--owner','fixture','--cancelled'],['purge','20261028_bad','--eligible'],['status','one','two'],['hold','20261028_bad','--release','--reason','both'],['create','20261028_bad','--owner','a','--owner','b']])call('work',args,2);
  assert.ok(!fs.existsSync(path.join(root,'.harness_work/initiatives/20261028_bad')));
  call('check',['--scope','context','--scope','installation'],2);
  call('check',['--json','--json'],2);
  call('update',['--ref','main','--ref','other'],2);
  call('update',['--check','--check'],2);
  assert.equal(snapshot(),initial,'Invalid CLI usage must not create project state');
  const source=fs.readFileSync(path.join(root,'.harness/core/checks/repository-compliance/operations.md'),'utf8');
  const configuration=JSON.parse(source.match(/```json\n([\s\S]*?)\n```/)[1]);
  fs.mkdirSync(path.join(root,'.harness/project'),{recursive:true});fs.writeFileSync(path.join(root,'.harness/project/config.json'),JSON.stringify(configuration));
  const plan=runnerPlan(root,{scope:'quality'});assert.equal(plan.checks.length,1);assert.deepEqual(plan.checks[0].argv,['/usr/local/bin/run-project-tests']);
  assert.equal(runnerPlan(root,{scope:'context'}).checks.length,0);
  console.log('Harness usage passed: installed help without mutation, explicit --root, rejected ignored flags/duplicates, documented runner contract.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
