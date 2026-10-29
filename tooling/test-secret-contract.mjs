import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {checkSecretContracts} from './harness-secret-contract.mjs';

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-secret-contract-'));
const root=path.join(temporary,'repo');fs.mkdirSync(root);
const environment='infra/deploy/production';
const recipient='age1lzd99uklcjnc0e7d860axevet2cz99ce9pq6tzuzd05l5nr28ams36nvun';
const other='age1tmaae3ld5vpevmsh5yacsauzx8jetg300mpvc4ugp5zr5l6ssq9sla97ep';
const cipher='ENC[AES256_GCM,data:Zml4dHVyZQ==,iv:Zml4dHVyZQ==,tag:Zml4dHVyZQ==,type:str]';
const files={
  '.sops.yaml':`creation_rules:\n  - path_regex: '^infra/deploy/production/secrets/.*\\.sops\\.env$'\n    age: ${recipient}\n`,
  [environment+'/config/secret-files.conf']:'app|secrets/app.sops.env|app.env|DATABASE_PASSWORD\n',
  [environment+'/config/sanitized/app.env']:'DATABASE_PASSWORD=<REDACTED>\n',
  [environment+'/secrets/app.sops.env']:`DATABASE_PASSWORD=${cipher}\nsops_age__list_0__map_recipient=${recipient}\nsops_age__list_0__map_enc=synthetic-not-a-real-ciphertext\nsops_mac=${cipher}\nsops_version=3.10.2\n`,
};
const stub=path.join(temporary,'synthetic-sops.mjs');
fs.writeFileSync(stub,"#!/usr/bin/env node\nif(JSON.stringify(process.argv.slice(2,5))!==JSON.stringify(['filestatus','--input-type','dotenv']))process.exit(8);console.log(JSON.stringify({encrypted:true}));\n",{mode:0o755});
const contract={root:environment,runtime_files:['app.env']};
const options={sopsExecutable:stub};
function put(file,text) {const destination=path.join(root,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,text);}
function reset() {fs.rmSync(root,{recursive:true,force:true});fs.mkdirSync(root);for(const [file,text] of Object.entries(files))put(file,text);}
function result(configuration=contract,settings=options) {return checkSecretContracts(root,[configuration],settings)[0];}
function mutate(file,change,expected='failed') {
  reset();put(file,change(files[file]));const report=result();
  assert.equal(report.status,expected,JSON.stringify(report));
  assert.ok(!JSON.stringify(report).includes('PRIVATE_FIXTURE_PAYLOAD'),'Sensitive values leaked in diagnostic');
}
try {
  reset();assert.equal(result().status,'passed');
  assert.equal(checkSecretContracts(root,[])[0].status,'not_applicable');
  assert.equal(result({...contract,runtime_files:['app.env','app.env']}).status,'failed');
  assert.equal(result({...contract,runtime_files:['../escape']}).status,'failed');
  assert.equal(result({...contract,root:'../escape'}).status,'failed');
  mutate(environment+'/config/secret-files.conf',text=>text+text);
  mutate(environment+'/config/secret-files.conf',text=>text.replace('DATABASE_PASSWORD','DATABASE_PASSWORD,DATABASE_PASSWORD'));
  mutate(environment+'/config/secret-files.conf',text=>text.replace('app.env','unlisted.env'));
  mutate(environment+'/config/secret-files.conf',text=>text.replace('secrets/app.sops.env','../escape.sops.env'));
  mutate(environment+'/config/sanitized/app.env',()=> 'DATABASE_PASSWORD=PRIVATE_FIXTURE_PAYLOAD\n');
  mutate(environment+'/config/sanitized/app.env',text=>text+text);
  mutate(environment+'/config/sanitized/app.env',text=>text.replace('DATABASE_PASSWORD','EXTRA_KEY'));
  mutate(environment+'/secrets/app.sops.env',text=>text.replace(cipher,'PRIVATE_FIXTURE_PAYLOAD'));
  mutate(environment+'/secrets/app.sops.env',text=>text+`DATABASE_PASSWORD=${cipher}\n`);
  mutate(environment+'/secrets/app.sops.env',text=>text+`OTHER_KEY=${cipher}\n`);
  mutate(environment+'/secrets/app.sops.env',text=>text.replace(recipient,other));
  mutate(environment+'/secrets/app.sops.env',text=>text.replace(/^sops_mac=.*\n/m,''));
  mutate(environment+'/secrets/app.sops.env',text=>text+'sops_password=PRIVATE_FIXTURE_PAYLOAD\n');
  mutate('.sops.yaml',()=>`creation_rules:\n  - path_regex: '.*'\n    age: ${other}\n  - path_regex: '.*'\n    age: ${recipient}\n`);
  mutate('.sops.yaml',()=>`creation_rules:\n  - path_regex: '^unrelated/'\n    age: ${recipient}\n`);
  mutate('.sops.yaml',text=>text+'    key_groups: []\n');
  mutate('.sops.yaml',text=>text.replace("'^infra/deploy/production/secrets/.*\\.sops\\.env$'","'(?=unsafe).*'"));
  for(const pattern of ['\\Ainfra/deploy/production/secrets/.*','.*\\z','[[:alpha:]]','\\p{L}+','\\s+','\\Qliteral\\E','[]]','.{1}','café']) {
    // Go may select the first rule while JS silently selects the second. Never approve it.
    mutate('.sops.yaml',()=>`creation_rules:\n  - path_regex: '${pattern}'\n    age: ${other}\n  - path_regex: '.*'\n    age: ${recipient}\n`);
  }
  mutate('.sops.yaml',()=>`creation_rules:\n  - path_regex: '^infra/[a-z]+/production/secrets/[^/]+\\.sops\\.env$'\n    age: ${recipient}\n`,'passed');
  reset();put(environment+'/.sops.yaml',files['.sops.yaml']);assert.equal(result().status,'failed');
  reset();put(environment+'/secrets/unlisted.sops.env',files[environment+'/secrets/app.sops.env']);assert.equal(result().status,'failed');
  reset();fs.unlinkSync(path.join(root,environment+'/config/sanitized/app.env'));assert.equal(result().status,'failed');
  reset();fs.unlinkSync(path.join(root,environment+'/secrets/app.sops.env'));fs.symlinkSync(stub,path.join(root,environment+'/secrets/app.sops.env'));assert.equal(result().status,'failed');
  reset();put(environment+'/deployment.yaml','units:\n  - id: different\n');assert.equal(result().status,'failed');
  reset();assert.equal(result(contract,{sopsExecutable:path.join(temporary,'absent')}).status,'error');
  const noisy=path.join(temporary,'noisy-sops.mjs');fs.writeFileSync(noisy,"#!/usr/bin/env node\nconsole.error('PRIVATE_FIXTURE_PAYLOAD');process.exit(1);\n",{mode:0o755});
  assert.equal(result(contract,{sopsExecutable:noisy}).status,'error');assert.ok(!JSON.stringify(result(contract,{sopsExecutable:noisy})).includes('PRIVATE_FIXTURE_PAYLOAD'));
  fs.writeFileSync(noisy,"#!/usr/bin/env node\nconsole.log('{\"encrypted\":false}');\n");assert.equal(result(contract,{sopsExecutable:noisy}).status,'failed');
  fs.writeFileSync(noisy,"#!/usr/bin/env node\nconsole.log('PRIVATE_FIXTURE_PAYLOAD');\n");assert.equal(result(contract,{sopsExecutable:noisy}).status,'error');
  fs.writeFileSync(noisy,"#!/usr/bin/env node\nsetTimeout(()=>{},10000);\n");assert.equal(result(contract,{sopsExecutable:noisy,timeoutMs:20}).status,'error');

  // Public recipient from SOPS' own test suite; no private identity is needed or stored.
  if(process.env.HARNESS_TEST_SOPS) {
    reset();const plain=path.join(temporary,'input.env');fs.writeFileSync(plain,'DATABASE_PASSWORD=SYNTHETIC_DISPOSABLE_FIXTURE\n',{mode:0o600});
    const encrypted=spawnSync(process.env.HARNESS_TEST_SOPS,['--encrypt','--input-type','dotenv','--output-type','dotenv','--age',recipient,plain],{encoding:'utf8',timeout:10000,env:{PATH:process.env.PATH,LC_ALL:'C'}});
    assert.equal(encrypted.status,0,'Real SOPS synthetic encryption failed; output suppressed');fs.unlinkSync(plain);
    put(environment+'/secrets/app.sops.env',encrypted.stdout);
    assert.equal(result(contract,{sopsExecutable:process.env.HARNESS_TEST_SOPS}).status,'passed');
    console.log('Real SOPS checked: disposable fixture encrypted to public recipient, filestatus and metadata checked without private identity or decrypt.');
  }
  console.log('Secret contracts passed: synthetic SOPS protocol, closed allowlists, keys/placeholders/recipients, first matching rule, safe paths, missing tool/timeout and redacted failures.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
