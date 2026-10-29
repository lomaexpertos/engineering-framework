import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

const quote=value=>String.fromCharCode(39)+value.replaceAll(String.fromCharCode(39),String.fromCharCode(39,92,39,39))+String.fromCharCode(39);
const source=process.cwd(),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-node-setup-'));
const root=path.join(temporary,'consumer'),bin=path.join(temporary,'bin');
const wrapper=path.join(root,'.harness/setup.sh'),runtime=path.join(root,'.harness/core/runtime/tooling');
const pins=JSON.parse(fs.readFileSync(path.join(source,'tooling/harness-node.json')));
const command=name=>execFileSync('/bin/bash',['-c','command -v "$1"','fixture',name],{encoding:'utf8'}).trim();
function script(name,content) {fs.writeFileSync(path.join(bin,name),'#!/bin/bash\n'+content,{mode:0o755});}
function run(home,args=[],extra={}) {return spawnSync('/bin/bash',[wrapper,...args],{encoding:'utf8',env:{...process.env,HOME:home,PATH:bin,...extra}});}
try {
  fs.mkdirSync(runtime,{recursive:true});fs.mkdirSync(bin);
  for(const name of ['setup.sh','environment.sh'])fs.copyFileSync(path.join(source,'templates/project/.harness',name),path.join(root,'.harness',name));
  fs.writeFileSync(path.join(runtime,'harness-setup.mjs'),'console.log(JSON.stringify({mode:process.argv[2],args:process.argv.slice(2),ready:true}));\n');
  for(const name of ['bash','cat','dirname','git','mkdir','mktemp','rm','mv','chmod','uname','rmdir','stat','id'])fs.symlinkSync(command(name),path.join(bin,name));
  script('node','printf "v20.0.0\\n"\n');
  const home=path.join(temporary,'home');fs.mkdirSync(home,{mode:0o700});
  const check=run(home,['--check']);assert.equal(check.status,2);assert.deepEqual(fs.readdirSync(home),[],'Diagnostic must not create directories');
  const jsonCheck=run(home,['--check','--json']);assert.equal(jsonCheck.status,2);assert.equal(JSON.parse(jsonCheck.stdout).ok,false);
  assert.equal(run(home,['--help']).status,0);assert.deepEqual(fs.readdirSync(home),[]);
  const platform=process.platform==='darwin'?'darwin':'linux',arch=process.arch==='arm64'?'arm64':'x64',asset=pins.assets[platform+'-'+arch];
  assert.ok(asset);for(const entry of Object.values(pins.assets))assert.ok(fs.readFileSync(wrapper,'utf8').includes(entry.sha256),'Shell/bootstrap pins must match provenance JSON');
  const nodeScript='#!/bin/bash\nif [[ ${1:-} == --version ]]; then printf "v24.18.0\\n"; else exec '+quote(process.execPath)+' "$@"; fi\n';
  script('curl','while (($#)); do if [[ $1 == --output ]]; then printf archive >"$2"; exit 0; fi; shift; done\nexit 1\n');
  const nodeFixture=path.join(temporary,'node-script');fs.writeFileSync(nodeFixture,nodeScript);
  script('tar','exec /bin/cat '+quote(nodeFixture)+'\n');
  const sha=command('sha256sum');
  script('sha256sum','if [[ ${@: -1} == */download.tar.gz ]]; then printf "%s  archive\\n" "${FIXTURE_CHECKSUM}"; else exec '+quote(sha)+' "$@"; fi\n');
  const bad=run(home,[],{FIXTURE_CHECKSUM:'0'.repeat(64)});assert.equal(bad.status,2);assert.match(bad.stderr,/checksum mismatch/);
  const cache=path.join(home,'.engineering-harness/cache/node',pins.version,platform+'-'+arch);
  assert.ok(!fs.existsSync(cache),'Failed checksum must not publish executable');
  fs.mkdirSync(path.join(home,'.cache'),{mode:0o775});fs.chmodSync(path.join(home,'.cache'),0o775);
  const installed=run(home,['--json'],{FIXTURE_CHECKSUM:asset.sha256});assert.equal(installed.status,0,installed.stderr);assert.equal(JSON.parse(installed.stdout).mode,'--install');
  assert.ok(fs.existsSync(path.join(cache,'bin/node')));assert.equal(fs.statSync(path.join(home,'.cache')).mode&0o777,0o775,'Personal cache permissions remain unchanged');assert.equal(fs.readdirSync(path.dirname(cache)).some(name=>name.endsWith('.lock')||name.startsWith('.node-setup.')),false);
  script('curl','printf unexpected-download >&2\nexit 99\n');
  const reused=run(home,['--check','--json']);assert.equal(reused.status,0,reused.stderr);assert.equal(JSON.parse(reused.stdout).mode,'--check');
  const selected=spawnSync('/bin/bash',['-c','source "$1"; harness_require_tools node; harness_require_node; command -v node','fixture',path.join(root,'.harness/environment.sh')],{encoding:'utf8',env:{...process.env,HOME:home,PATH:bin}});
  assert.equal(selected.status,0,selected.stderr);assert.equal(selected.stdout.trim(),path.join(cache,'bin/node'));
  for(const relative of ['', 'bin', 'bin/node', 'node.sha256']) {
    const entry=path.join(cache,relative),mode=fs.statSync(entry).mode&0o777;
    fs.chmodSync(entry,0o777);
    assert.equal(run(home,['--check']).status,2,'Writable managed cache must be rejected before execution: '+relative);
    fs.chmodSync(entry,mode);
  }
  if(process.getuid?.()===0) {
    const binaryFile=path.join(cache,'bin/node');fs.chownSync(binaryFile,1,1);
    try {assert.equal(run(home,['--check']).status,2,'Foreign-owned binary must not execute');}
    finally {fs.chownSync(binaryFile,process.getuid(),process.getgid());}
  }
  fs.appendFileSync(path.join(cache,'bin/node'),'# tampered\n');
  assert.equal(run(home,['--check']).status,2,'Corrupt managed runtime must not execute');
  assert.equal(run(home).status,2,'Unknown cache content must not be replaced');
  const otherHome=path.join(temporary,'linked-home'),outside=path.join(temporary,'outside');fs.mkdirSync(otherHome,{mode:0o700});fs.mkdirSync(outside,{mode:0o700});fs.symlinkSync(outside,path.join(otherHome,'.engineering-harness'));
  assert.equal(run(otherHome).status,2);assert.deepEqual(fs.readdirSync(outside),[],'Symlink cache must not write outside selected home');
  console.log('Setup bootstrap passed: no-Node diagnostic without writes, pinned bootstrap, checksum rejection, cache reuse/integrity, wrapper resolution and symlink preservation; downloads are synthetic fixtures.');
}finally {fs.rmSync(temporary,{recursive:true,force:true});}
