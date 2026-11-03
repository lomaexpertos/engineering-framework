import fs from 'node:fs';
import path from 'node:path';
import YAML from './vendor/yaml/dist/index.js';

// All callers receive sanitized diagnostics: parser errors can contain input values.
export function readYaml(file) {
  try {
    const stat=fs.lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>1024*1024)throw new Error();
    const documents=YAML.parseAllDocuments(fs.readFileSync(file,'utf8'),{
      strict:true,uniqueKeys:true,stringKeys:true,prettyErrors:false,logLevel:'silent',version:'1.2',merge:false,
    });
    if(documents.length!==1)throw new Error();
    const [document]=documents;
    if(document.errors.length||document.warnings.length)throw new Error();
    YAML.visit(document,{Alias(){throw new Error();}});
    const value=document.toJS({maxAliasCount:0});
    if(value===null||typeof value!=='object'||Array.isArray(value))throw new Error();
    return value;
  } catch {
    throw new Error('Invalid YAML document: require one bounded mapping without duplicate keys, unsupported tags or aliases');
  }
}

export function safePath(root,relative) {
  root=fs.realpathSync(root);
  if(typeof relative!=='string'||!relative||relative.includes('\0')||relative.includes('\\')||path.isAbsolute(relative)||/^[a-z]:/i.test(relative)||relative.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe repository path');
  let current=root;
  for(const part of relative.split('/')) {
    current=path.join(current,part);
    if(fs.lstatSync(current,{throwIfNoEntry:false})?.isSymbolicLink())throw new Error('Symbolic repository path is not allowed');
  }
  return current;
}
