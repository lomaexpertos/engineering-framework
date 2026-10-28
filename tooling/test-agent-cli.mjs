import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-agent-cli-'));
const source=fileURLToPath(new URL('./harness-agents.mjs',import.meta.url));
const run=(...args)=>spawnSync(process.execPath,[source,...args],{cwd:temporary,encoding:'utf8',env:{...process.env,HOME:temporary,XDG_CONFIG_HOME:temporary}});
try {
  for(const args of [['--help'],['workflow','--help'],['workflow','run','--help'],['--help','--root','/does/not/exist']]) {
    const result=run(...args);assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/workflow escalate/);assert.match(result.stdout,/needs_input/);
  }
  assert.deepEqual(fs.readdirSync(temporary),[],'help must not create configuration or runtime files');
  for(const [args,diagnostic] of [
    [[],/Unknown command/],[['status'],/requires 2/],
    [['run','initiative','task','extra'],/requires 2/],
    [['setup','ignored'],/requires 0/],
    [['status','initiative','task','--config','missing'],/not supported/],
    [['workflow','run','initiative','--background'],/not supported/],
    [['workflow','advance','initiative','--answers','missing'],/not supported/],
    [['run','initiative','task','--config'],/Missing/],
    [['run','initiative','task','--background','--background'],/Duplicate/],
    [['doctor','--unknown'],/Unknown option/],
    [['workflow','unknown','--help'],/Unknown command/]
  ]) {
    const result=run(...args);assert.equal(result.status,2,JSON.stringify(args));assert.match(result.stderr,diagnostic);
  }
  assert.deepEqual(fs.readdirSync(temporary),[],'invalid usage must not create configuration or runtime files');
  console.log('Agent CLI: discoverable help without configuration/mutation, exact arity and command-scoped options passed.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
