import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {runnerPlan,results} from './harness-runner-plan.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'harness-runner-'));
try {
  assert.deepEqual(runnerPlan(root).checks,[]);
  fs.mkdirSync(path.join(root,'.harness/project'),{recursive:true});
  const file=path.join(root,'.harness/project/config.json');
  const config={schema_version:1,runners:{node:{image:'node:22.19.0-alpine3.22'}},checks:[{id:'unit',scope:'code',required:true,runner:'node',timeout_seconds:10,argv:['node','-e','console.log("literal $(do not execute)")'],evidence:'unit results',applicability:'Code changes'}]};
  const save=()=>fs.writeFileSync(file,JSON.stringify(config));save();
  assert.equal(runnerPlan(root).checks[0].argv[2],config.checks[0].argv[2]);
  assert.deepEqual(runnerPlan(root,{scope:'docs'}).checks,[]);
  fs.writeFileSync(path.join(root,'ledger'),'unit\x000\x00');
  assert.equal(results(root,path.join(root,'ledger')).checks[0].exit_code,0);
  config.runners.node.image='node:latest';save();assert.throws(()=>runnerPlan(root),/explicit image/);
  config.runners.node.image='node';save();assert.throws(()=>runnerPlan(root),/explicit image/);
  config.runners.node.image='node:22';config.checks[0].timeout_seconds=0;save();assert.throws(()=>runnerPlan(root),/Timeout/);
  config.checks[0].timeout_seconds=10;config.checks.push({...config.checks[0]});save();assert.throws(()=>runnerPlan(root),/duplicate/);
  config.checks.pop();save();fs.writeFileSync(path.join(root,'ledger'),'other\x000\x00');assert.throws(()=>results(root,path.join(root,'ledger')),/Invalid check result/);
  const validChecks=config.checks;
  for(const malformed of [null,false,0]) {
    config.checks=malformed;save();assert.throws(()=>runnerPlan(root),/Invalid project config/);
  }
  config.checks=validChecks;save();
  console.log('Runner plan tests passed: literal argv, tagged image, scoped execution, bounded timeout, duplicates and execution results.');
} finally {fs.rmSync(root,{recursive:true,force:true});}
