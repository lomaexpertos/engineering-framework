import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {syncConsumer} from './sync-consumer.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-setup-integration-'));
const root=path.join(temporary,'consumer'),home=path.join(temporary,'home'),bin=path.join(temporary,'bin');
const previous={repo:process.env.GITHUB_REPOSITORY,sha:process.env.GITHUB_SHA};
try {
  for(const directory of [root,home,bin])fs.mkdirSync(directory,{mode:0o700});
  const command=name=>execFileSync('/bin/bash',['-c','command -v "$1"','fixture',name],{encoding:'utf8'}).trim();
  for(const name of ['bash','cat','basename','dirname','git','mkdir','mktemp','rm','mv','chmod','uname','rmdir','stat','id','curl','tar','gzip','sha256sum'])fs.symlinkSync(command(name),path.join(bin,name));
  const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git(['init','-q','-b','feature/setup']);git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-qm','fixture']);
  process.env.GITHUB_REPOSITORY='lomaexpertos/engineering-framework';process.env.GITHUB_SHA=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  syncConsumer(root);
  const env={...process.env,HOME:home,PATH:bin};delete env.HARNESS_TOOLS_HOME;
  const run=(script,args=[])=>spawnSync('/bin/bash',[script,...args],{cwd:root,env,encoding:'utf8',timeout:240000,maxBuffer:4*1024*1024});
  const success=result=>assert.equal(result.status,0,result.stderr||result.stdout);
  success(run('.harness/setup.sh',['--help']));
  assert.equal(run('.harness/setup.sh',['--check','--json']).status,2);assert.deepEqual(fs.readdirSync(home),[]);
  assert.equal(run('.harness/check.sh',['--setup','--bogus']).status,2);assert.deepEqual(fs.readdirSync(home),[]);
  assert.equal(run('.harness/check.sh',['--setup','--setup']).status,2);assert.deepEqual(fs.readdirSync(home),[]);
  if(process.env.HARNESS_SETUP_REAL==='1') {
    const prepared=run('.harness/check.sh',['--setup','--scope','context','--json']);success(prepared);assert.equal(JSON.parse(prepared.stdout).ok,true);
    const diagnosed=run('.harness/setup.sh',['--check','--json']);success(diagnosed);assert.equal(JSON.parse(diagnosed.stdout).ok,true);
    const security=run('.harness/check.sh',['--scope','security','--json']);success(security);assert.equal(JSON.parse(security.stdout).ok,true,'Prepared tools must resolve without PATH edits');
    const manifestFile=path.join(root,'.harness/core/manifest.json'),original=fs.readFileSync(manifestFile,'utf8');
    const canary='ghp_'+'aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5';
    fs.writeFileSync(manifestFile,JSON.stringify({...JSON.parse(original),api_token:canary},null,2));
    const tampered=run('.harness/check.sh',['--scope','security','--json']);assert.equal(tampered.status,1);assert.ok(!tampered.stdout.includes(canary));
    fs.writeFileSync(manifestFile,original.replace('"source_commit":','"source_commit": "'+canary+'",\n  "source_commit":'));
    const duplicate=run('.harness/check.sh',['--scope','security','--json']);assert.equal(duplicate.status,1);assert.ok(!duplicate.stdout.includes(canary));
    fs.writeFileSync(manifestFile,original);
    const managedNode=path.join(home,'.engineering-harness/cache/node/24.18.0',process.platform+'-'+process.arch,'bin/node');
    assert.ok(fs.existsSync(managedNode));
    for(const tool of ['curl','tar']) {
      fs.unlinkSync(path.join(bin,tool));fs.writeFileSync(path.join(bin,tool),'#!/bin/bash\nexit 99\n',{mode:0o755});
    }
    const repeated=run('.harness/check.sh',['--setup','--scope','context','--json']);success(repeated);assert.equal(JSON.parse(repeated.stdout).ok,true,'Repeated setup must not download');
    console.log('Real installed setup passed: absent Node/Gitleaks/SOPS, verified official downloads, JSON check, automatic cache resolution, security check and offline idempotent reuse.');
  }else console.log('Installed setup passed: help and read-only no-Node diagnosis, rejected flags before mutation; real downloads opt-in HARNESS_SETUP_REAL=1.');
}finally {
  for(const [key,value] of [['GITHUB_REPOSITORY',previous.repo],['GITHUB_SHA',previous.sha]])if(value===undefined)delete process.env[key];else process.env[key]=value;
  fs.rmSync(temporary,{recursive:true,force:true});
}
