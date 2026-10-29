import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {setupTools,resolvedTool} from './harness-setup.mjs';
import {toolPins} from './harness-tool-install.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-setup-test-'));
const before=process.env.PATH;
const beforeHome=process.env.HOME,beforeOverride=process.env.HARNESS_TOOLS_HOME;
const cacheRoot=path.join(temporary,'cache');let downloads=0;
const installer=(name,directory)=>{
  downloads++;
  const value=name==='gitleaks'?toolPins[name].version:'sops '+toolPins[name].version;
  fs.writeFileSync(path.join(directory,name),'#!'+process.execPath+'\nconsole.log('+JSON.stringify(value)+');\n',{mode:0o755});
};
try {
  process.env.PATH='';
  const missing=setupTools({cacheRoot});assert.equal(missing.ok,false);assert.ok(missing.tools.every(tool=>tool.status==='missing'));assert.equal(fs.existsSync(cacheRoot),false);
  const installed=setupTools({cacheRoot,install:true,installer});assert.equal(installed.ok,true);assert.equal(downloads,2);assert.ok(installed.tools.every(tool=>tool.status==='installed'));
  for(const tool of installed.tools){assert.equal(resolvedTool(tool.tool,{cacheRoot}),tool.path);assert.ok(tool.path.includes(toolPins[tool.tool].version));}
  const repeated=setupTools({cacheRoot,install:true,installer});assert.equal(repeated.ok,true);assert.equal(downloads,2);
  const binary=installed.tools.find(tool=>tool.tool==='gitleaks').path,original=fs.readFileSync(binary);
  fs.appendFileSync(binary,'// tampered');assert.throws(()=>resolvedTool('gitleaks',{cacheRoot}),/integrity/);
  assert.equal(setupTools({cacheRoot,install:true,installer}).ok,false);assert.equal(downloads,2,'Corruption must not be replaced implicitly');fs.writeFileSync(binary,original);
  fs.chmodSync(binary,0o644);assert.throws(()=>resolvedTool('gitleaks',{cacheRoot}),/integrity/);fs.chmodSync(binary,0o755);
  const parent=path.dirname(binary),moved=parent+'.saved';fs.renameSync(parent,moved);fs.symlinkSync(moved,parent);
  assert.throws(()=>resolvedTool('gitleaks',{cacheRoot}),/unsafe/);fs.unlinkSync(parent);fs.renameSync(moved,parent);
  fs.chmodSync(temporary,0o777);assert.throws(()=>resolvedTool('gitleaks',{cacheRoot}),/unsafe/);fs.chmodSync(temporary,0o700);
  const missingCache=path.join(temporary,'missing-cache'),toolPath=path.join(temporary,'personal');fs.mkdirSync(toolPath);
  installer('gitleaks',toolPath);const personal=fs.readFileSync(path.join(toolPath,'gitleaks'));
  process.env.PATH=toolPath;
  assert.equal(setupTools({cacheRoot:missingCache,install:true,tools:['gitleaks'],installer}).tools[0].status,'ready');assert.equal(fs.existsSync(missingCache),false);assert.deepEqual(fs.readFileSync(path.join(toolPath,'gitleaks')),personal);
  process.env.PATH='';
  const failedCache=path.join(temporary,'failed');
  const failed=setupTools({cacheRoot:failedCache,install:true,tools:['gitleaks'],installer(){throw new Error('Sensitive transport output');}});
  assert.equal(failed.ok,false);assert.ok(!JSON.stringify(failed).includes('Sensitive'));assert.equal(resolvedTool('gitleaks',{cacheRoot:failedCache}),null);
  const lockCache=path.join(temporary,'locked'),versionDir=path.join(lockCache,'gitleaks',toolPins.gitleaks.version);fs.mkdirSync(versionDir,{recursive:true,mode:0o700});
  const lock=path.join(versionDir,`${process.platform}-${process.arch}.lock`);fs.mkdirSync(lock,{mode:0o700});
  const locked=setupTools({cacheRoot:lockCache,install:true,tools:['gitleaks'],installer});assert.equal(locked.ok,false);assert.ok(fs.existsSync(lock),'Unknown lock is preserved');
  assert.throws(()=>setupTools({tools:['unknown']}));
  const home=path.join(temporary,'home');fs.mkdirSync(home,{mode:0o700});fs.mkdirSync(path.join(home,'.cache'),{mode:0o775});fs.chmodSync(path.join(home,'.cache'),0o775);
  process.env.HOME=home;delete process.env.HARNESS_TOOLS_HOME;
  const dedicated=setupTools({install:true,tools:['gitleaks'],installer});assert.equal(dedicated.ok,true);assert.ok(dedicated.tools[0].path.startsWith(path.join(home,'.engineering-harness/cache/tools')));assert.equal(fs.statSync(path.join(home,'.cache')).mode&0o777,0o775,'Unrelated cache permissions must remain unchanged');
  console.log('Harness setup passed: read-only diagnosis, idempotent versioned cache, compatible personal tools, corruption/symlink/mode rejection, failed download cleanup and concurrent lock preservation.');
}finally {process.env.PATH=before;if(beforeHome===undefined)delete process.env.HOME;else process.env.HOME=beforeHome;if(beforeOverride===undefined)delete process.env.HARNESS_TOOLS_HOME;else process.env.HARNESS_TOOLS_HOME=beforeOverride;fs.rmSync(temporary,{recursive:true,force:true});}
