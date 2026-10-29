import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {readYaml,safePath} from './harness-yaml.mjs';

const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const keyPattern=/^[A-Za-z_][A-Za-z0-9_]*$/;
const recipientPattern=/^age1[0-9a-z]{58}$/;
const encrypted=/^ENC\[AES256_GCM,data:[A-Za-z0-9+/=]*,iv:[A-Za-z0-9+/=]+,tag:[A-Za-z0-9+/=]+,type:str\]$/;
function fail(message,status='failed') {const error=new Error(message);error.contractStatus=status;throw error;}
function relative(value) {
  if(typeof value!=='string'||!value||value.length>1024||/^[A-Za-z]:|[\\\x00-\x1f]|^\//.test(value)||value.split('/').some(part=>!part||part==='.'||part==='..'))fail('Ruta relativa inválida en contrato de secretos');
  return value;
}
function contents(root,file) {
  const target=safePath(root,relative(file)),stat=fs.statSync(target);
  if(!stat.isFile()||stat.size>1024*1024)fail('Recurso de secretos ausente, no regular o demasiado grande');
  return fs.readFileSync(target,'utf8');
}
function dotenv(text) {
  const values=new Map();
  for(const line of text.split(/\r?\n/)) {
    if(!line.trim()||line.startsWith('#'))continue;
    const split=line.indexOf('=');
    if(split<1||!keyPattern.test(line.slice(0,split)))fail('Dotenv inválido: usar asignaciones literales CLAVE=valor, sin export ni expansión');
    const key=line.slice(0,split);
    if(values.has(key))fail('Claves duplicadas en dotenv');
    values.set(key,line.slice(split+1));
  }
  return values;
}
const same=(a,b)=>a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(value=>b.includes(value));
function walk(root,relativeDirectory) {
  const directory=safePath(root,relativeDirectory);
  if(!fs.statSync(directory).isDirectory())fail('El directorio de ciphertext no es válido');
  const files=[];
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const file=relativeDirectory+'/'+entry.name;
    safePath(root,file);
    if(entry.isDirectory())files.push(...walk(root,file));
    else if(entry.isFile())files.push(file);
    else fail('Tipo de recurso no permitido en secretos');
    if(files.length>1000)fail('Demasiados recursos de secretos para una comprobación');
  }
  return files;
}
function expectedRecipients(rule) {
  if(Object.keys(rule).some(key=>!['path_regex','age','unencrypted_suffix','encrypted_suffix','unencrypted_regex','encrypted_regex','unencrypted_comment_regex','encrypted_comment_regex','mac_only_encrypted'].includes(key)))fail('Creation rule SOPS no soportada: el control admite age directo, sin key_groups ni otros proveedores');
  const recipients=typeof rule.age==='string'?rule.age.split(',').map(value=>value.trim()):rule.age;
  if(!Array.isArray(recipients)||!recipients.length||recipients.some(value=>typeof value!=='string'||!recipientPattern.test(value))||new Set(recipients).size!==recipients.length)fail('Recipients age ausentes, inválidos o duplicados en regla SOPS');
  return recipients;
}
function portableRegex(pattern) {
  if(/[^\x20-\x7e]/.test(pattern)||pattern.includes('(?'))return false;
  let inClass=false,classSize=0;
  for(let index=0;index<pattern.length;index++) {
    const character=pattern[index];
    if(character==='\\') {
      if(!'.^$*+?()[]{}|/\\-'.includes(pattern[++index]||'\0'))return false;
      if(inClass)classSize++;
    } else if(character==='[') {
      if(inClass)return false;
      inClass=true;classSize=0;
    } else if(character===']') {
      if(!inClass||!classSize)return false;
      inClass=false;
    } else if(character==='{'||character==='}')return false;
    else if(inClass&&!(character==='^'&&classSize===0))classSize++;
  }
  return !inClass;
}
function policyRules(root,files) {
  if(files.some(file=>/[^\x20-\x7e]/.test(file)))fail('Rutas de ciphertext fuera del perfil ASCII portable');
  for(const file of files) {
    let directory=path.posix.dirname(file);
    while(directory!=='.') {
      if(fs.existsSync(safePath(root,directory+'/.sops.yaml')))fail('Política SOPS anidada no soportada: el perfil exige autoridad en la raíz del repositorio');
      directory=path.posix.dirname(directory);
    }
  }
  const config=readYaml(safePath(root,'.sops.yaml'));
  if(!object(config)||!Array.isArray(config.creation_rules)||!config.creation_rules.length||config.creation_rules.length>1000)fail('Faltan creation_rules en .sops.yaml');
  const rules=config.creation_rules;
  for(const rule of rules) {
    if(!object(rule)||rule.path_regex!==undefined&&(typeof rule.path_regex!=='string'||rule.path_regex.length>1024))fail('Creation rule SOPS inválida');
    // Restrict rather than translate RE2/JS: mismatching dialects can select the wrong rule.
    if(rule.path_regex&&!portableRegex(rule.path_regex))fail('path_regex SOPS fuera del subconjunto ASCII portable soportado');
  }
  // Bound regexp evaluation separately: repository regexes must not hang check.
  const code=`let input='';for await(const c of process.stdin)input+=c;const {patterns,files}=JSON.parse(input);const expressions=patterns.map(p=>p===null?null:new RegExp(p));console.log(JSON.stringify(files.map(file=>expressions.findIndex(r=>r===null||r.test(file)))));`;
  const result=spawnSync(process.execPath,['--max-old-space-size=32','--input-type=module','-e',code],{input:JSON.stringify({patterns:rules.map(rule=>rule.path_regex??null),files}),encoding:'utf8',timeout:2000,maxBuffer:65536,env:{PATH:process.env.PATH||'/usr/bin:/bin',LC_ALL:'C'}});
  if(result.error||result.status!==0)fail('path_regex SOPS inválido o excedió el límite de evaluación');
  let indices;try{indices=JSON.parse(result.stdout);}catch{fail('No se pudo resolver creation_rules');}
  return indices.map(index=>{if(index<0)fail('Ciphertext sin creation_rule SOPS aplicable');return expectedRecipients(rules[index]);});
}
function ciphertext(values,keys,recipients) {
  const variables=[...values.keys()].filter(key=>!key.startsWith('sops_'));
  if(!same(variables,keys))fail('Las claves del ciphertext no coinciden con el manifest');
  for(const key of variables)if(!encrypted.test(values.get(key)))fail('Valor de variable sin cifrado SOPS válido');
  const allowedMetadata=/^sops_(?:age__list_\d+__map_(?:recipient|enc)|lastmodified|mac|version|(?:un)?encrypted_(?:suffix|regex|comment_regex)|mac_only_encrypted)$/;
  for(const key of values.keys())if(key.startsWith('sops_')&&!allowedMetadata.test(key))fail('Metadata SOPS no soportada; no se omite su comprobación');
  if(!encrypted.test(values.get('sops_mac')||'')||!/^\d+\.\d+\.\d+/.test(values.get('sops_version')||''))fail('Falta metadata SOPS de versión o MAC');
  const actual=[];
  const encryptedKeys=[...values.keys()].filter(key=>/^sops_age__list_\d+__map_enc$/.test(key));
  for(const [key,value] of values)if(/^sops_age__list_\d+__map_recipient$/.test(key)) {
    if(!recipientPattern.test(value)||!values.get(key.replace(/recipient$/,'enc')))fail('Metadata de recipient age incompleta');
    actual.push(value);
  }
  if(encryptedKeys.length!==actual.length||!same(actual,recipients))fail('Recipients del ciphertext distintos de la primera creation_rule aplicable');
}
function filestatus(root,file,options) {
  const execution=spawnSync(options.sopsExecutable||'sops',['filestatus','--input-type','dotenv',safePath(root,file)],{cwd:root,encoding:'utf8',timeout:options.timeoutMs||10000,maxBuffer:65536,env:{PATH:process.env.PATH||'/usr/bin:/bin',LC_ALL:'C'}});
  if(execution.error||execution.status!==0)fail('No se pudo ejecutar sops filestatus; comprobar instalación, versión y archivo sin mostrar su contenido','error');
  let result;try{result=JSON.parse(execution.stdout);}catch{fail('Respuesta de sops filestatus inválida','error');}
  if(!object(result)||result.encrypted!==true)fail('sops filestatus no acredita encrypted:true');
}
function inspect(root,contract,options) {
  if(!object(contract)||Object.keys(contract).some(key=>!['root','runtime_files'].includes(key))||!Array.isArray(contract.runtime_files)||!contract.runtime_files.length||contract.runtime_files.length>1000)fail('Contrato de secretos requiere root y runtime_files no vacíos');
  const base=relative(contract.root);safePath(root,base);
  const runtime=contract.runtime_files.map(relative);
  if(new Set(runtime).size!==runtime.length)fail('Destinos runtime duplicados en contrato');
  const manifest=contents(root,base+'/config/secret-files.conf');
  const records=[],destinations=new Set(),ciphertexts=new Set();
  for(const line of manifest.split(/\r?\n/)) {
    if(!line.trim()||line.trimStart().startsWith('#'))continue;
    const fields=line.split('|');
    if(fields.length!==4||fields.some(field=>!field||field!==field.trim()))fail('Manifest de secretos inválido; se esperan cuatro campos literales');
    const [unit,cipher,runtimeFile,csv]=fields;
    if(!/^[a-z0-9][a-z0-9_-]*$/.test(unit))fail('Unidad inválida en manifest de secretos');
    relative(cipher);relative(runtimeFile);
    if(!cipher.startsWith('secrets/')||!cipher.endsWith('.sops.env'))fail('Ciphertext fuera de secrets/ o sin sufijo .sops.env');
    if(destinations.has(runtimeFile)||ciphertexts.has(cipher))fail('Destino runtime o ciphertext duplicado en manifest');
    const keys=csv.split(',');
    if(keys.some(key=>!keyPattern.test(key)||key.startsWith('sops_'))||new Set(keys).size!==keys.length)fail('Claves inválidas o duplicadas en manifest');
    destinations.add(runtimeFile);ciphertexts.add(cipher);
    records.push({unit,cipher:base+'/'+cipher,runtimeFile,keys});
    if(records.length>1000)fail('Demasiadas entradas en manifest de secretos');
  }
  if(!records.length||!same([...destinations],runtime))fail('Manifest y lista cerrada runtime_files no coinciden');
  const declared=records.map(record=>record.cipher);
  if(!same(walk(root,base+'/secrets'),declared))fail('Archivo de secretos no declarado o ciphertext ausente en allowlist');
  const deployment=safePath(root,base+'/deployment.yaml');
  if(fs.existsSync(deployment)) {
    const units=readYaml(deployment)?.units;
    if(!Array.isArray(units)||records.some(record=>!units.some(unit=>unit.id===record.unit)))fail('Manifest de secretos referencia unidad desconocida de deployment');
  }
  const recipients=policyRules(root,declared);
  for(const [index,record] of records.entries()) {
    const sanitized=base+'/config/sanitized/'+record.runtimeFile+(record.runtimeFile.endsWith('.env')?'':'.env');
    const values=dotenv(contents(root,sanitized));
    if(!same([...values.keys()],record.keys)||[...values.values()].some(value=>value!=='<REDACTED>'))fail('Esquema sanitizado no coincide o contiene valores distintos de <REDACTED>');
    ciphertext(dotenv(contents(root,record.cipher)),record.keys,recipients[index]);
    filestatus(root,record.cipher,options);
  }
  return base+'/config/secret-files.conf';
}
export function checkSecretContracts(root,contracts,options={}) {
  if(!Array.isArray(contracts))return [{id:'secret-contract',status:'error',message:'Configuración de contratos de secretos inválida'}];
  if(!contracts.length)return [{id:'secret-contract',status:'not_applicable',message:'Sin contratos dotenv cifrados seleccionados'}];
  return contracts.map(contract=> {
    try {const file=inspect(root,contract,options);return {id:'secret-contract',status:'passed',message:'Allowlist, claves, placeholders, recipients y encrypted:true comprobados; sin descifrar ni acreditar activación',file};}
    catch(error) {
      let file;try{file=relative(contract?.root)+'/config/secret-files.conf';}catch{/* Invalid paths are never rendered. */}
      return {id:'secret-contract',status:error.contractStatus||'failed',message:error.contractStatus?error.message:'No se pudo inspeccionar el contrato de secretos; comprobar rutas y YAML sin mostrar contenido',...(file?{file}:{})};
    }
  });
}
