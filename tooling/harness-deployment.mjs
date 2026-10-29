import fs from 'node:fs';
import path from 'node:path';
import {readYaml,safePath} from './harness-yaml.mjs';

const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'&&Boolean(value.trim())&&!/[\0\r\n]/.test(value);
const id=value=>text(value)&&/^[a-z0-9][a-z0-9_-]*$/.test(value);
const fail=message=>{throw new Error(message);};
function shape(value,required,optional=[]) {
  if(!object(value)||required.some(key=>!Object.hasOwn(value,key))||Object.keys(value).some(key=>![...required,...optional].includes(key)))fail('Deployment fields missing, unknown or invalid');
}
function unique(values,message) {if(new Set(values).size!==values.length)fail(message);}
function declaredFile(root,manifest,reference) {
  if(!text(reference)||path.isAbsolute(reference)||reference.includes('\\')||/^[a-z]:/i.test(reference))fail('Unsafe declared deployment path');
  let current=path.dirname(manifest);
  // Check before normalization: a link followed by /.. must never hide a symlink.
  for(const segment of reference.split('/')) {
    if(!segment)fail('Unsafe declared deployment path');
    if(segment==='.')continue;
    if(segment==='..') {
      if(current===root)fail('Declared deployment path escapes repository');
      current=path.dirname(current);
    } else {
      current=path.join(current,segment);
      if(fs.lstatSync(current,{throwIfNoEntry:false})?.isSymbolicLink())fail('Symbolic declared deployment path is not allowed');
    }
  }
  safePath(root,path.relative(root,current).split(path.sep).join('/'));
  if(!fs.lstatSync(current,{throwIfNoEntry:false})?.isFile())fail('Declared deployment file is missing or not regular');
}
function validate(root,file,value) {
  shape(value,['schema_version','environment','units','services']);
  if(value.schema_version!==1||value.environment!=='production')fail('Unsupported deployment schema or environment');
  if(!Array.isArray(value.units)||!value.units.length||!Array.isArray(value.services)||!value.services.length)fail('Deployment requires nonempty unit and service lists');
  for(const unit of value.units) {
    shape(unit,['id','topology','runtime','artifact','automation']);
    if(!id(unit.id)||!text(unit.topology)||!text(unit.runtime))fail('Invalid deployment unit identity, topology or runtime');
    declaredFile(root,file,unit.artifact);declaredFile(root,file,unit.automation);
  }
  unique(value.units.map(unit=>unit.id),'Duplicate deployment unit identity');
  const units=new Set(value.units.map(unit=>unit.id));
  for(const service of value.services) {
    shape(service,['id','unit','strategy','health_check','depends_on','modifies_schema','migrations'],['traffic_controller','migration_entrypoint','recovery']);
    if(!id(service.id)||!units.has(service.unit))fail('Invalid service identity or unknown unit reference');
    if(!['blue-green','rolling','recreate','stateful','external'].includes(service.strategy))fail('Unknown deployment strategy');
    if(typeof service.modifies_schema!=='boolean'||!['none','external','automated'].includes(service.migrations))fail('Invalid migration declaration');
    if(service.modifies_schema&&(service.migrations==='none'||!Object.hasOwn(service,'migration_entrypoint')))fail('Schema writer requires migration policy and entrypoint');
    if(!service.modifies_schema&&(service.migrations!=='none'||Object.hasOwn(service,'migration_entrypoint')))fail('Non-schema writer must declare migrations none without entrypoint');
    if(Object.hasOwn(service,'migration_entrypoint'))declaredFile(root,file,service.migration_entrypoint);
    if(!Array.isArray(service.depends_on)||service.depends_on.some(dependency=>!id(dependency)||dependency===service.id))fail('Invalid service dependencies');
    unique(service.depends_on,'Duplicate service dependency');
    const health=service.health_check;
    if(!object(health)||Object.keys(health).length!==1)fail('Health check requires one command or absence reason');
    if(Object.hasOwn(health,'command')) {
      if(!Array.isArray(health.command)||!health.command.length||health.command.some(argument=>!text(argument)))fail('Health command must be nonempty literal argv');
    } else if(!Object.hasOwn(health,'reason')||!text(health.reason))fail('Health check requires command or explicit absence reason');
    if(['blue-green','rolling'].includes(service.strategy)&&!Object.hasOwn(health,'command'))fail('Traffic rollout requires an operational health command');
    if(service.strategy==='blue-green'&&!Object.hasOwn(service,'traffic_controller'))fail('Blue-green requires a traffic controller');
    if(Object.hasOwn(service,'traffic_controller'))declaredFile(root,file,service.traffic_controller);
    if(service.strategy==='stateful'&&!Object.hasOwn(service,'recovery'))fail('Stateful service requires an integrity, backup and recovery procedure');
    if(Object.hasOwn(service,'recovery'))declaredFile(root,file,service.recovery);
  }
  unique(value.services.map(service=>service.id),'Duplicate deployment service identity');
  const services=new Set(value.services.map(service=>service.id));
  if(value.services.some(service=>service.depends_on.some(dependency=>!services.has(dependency))))fail('Unknown service dependency');
}

export function checkDeployments(root,paths=[]) {
  root=fs.realpathSync(root);
  if(!Array.isArray(paths)||paths.some(file=>typeof file!=='string'))return [{id:'deployment-contract',status:'error',message:'Deployment selection must be a list of repository paths'}];
  if(!paths.length)return [{id:'deployment-contract',status:'not_applicable',message:'No deployment manifests selected'}];
  if(new Set(paths).size!==paths.length)return [{id:'deployment-contract',status:'error',message:'Duplicate deployment manifest selection'}];
  return paths.map(relative=>{
    try {
      const file=safePath(root,relative);
      if(path.basename(file)!=='deployment.yaml')fail('Deployment manifest must be named deployment.yaml');
      if(relative.startsWith('apps/'))fail('Deployment manifest must live outside applications');
      const value=readYaml(file);
      validate(root,file,value);
      return {id:'deployment-contract',status:'passed',message:'Deployment contract, references and declared files checked; no deployment executed',file:relative};
    } catch(error) {
      return {id:'deployment-contract',status:'failed',message:error.code?'Deployment file could not be inspected':error.message,file:relative};
    }
  });
}
