import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const toolPins=JSON.parse(fs.readFileSync(new URL('./harness-tools.json',import.meta.url),'utf8'));
export function installTool(name,destination=path.join(os.homedir(),'.local/bin')) {
  const pin=toolPins[name],asset=pin?.assets[`${process.platform}-${process.arch}`];
  if(!asset)throw new Error('Supported tools: gitleaks, sops; platforms: Linux/macOS x64/arm64');
  const directory=path.resolve(destination),target=path.join(directory,name);
  // Explicit setup never silently replaces a personal executable.
  if(fs.lstatSync(target,{throwIfNoEntry:false}))throw new Error('Destination already exists; inspect it or choose a separate --destination');
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'harness-tool-install-'));
  try {
    const archive=path.join(temporary,'download');
    const url=`https://github.com/${pin.repository}/releases/download/v${pin.version}/${asset.file}`;
    execFileSync('curl',['--fail','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--max-time','180','--output',archive,url],{stdio:'pipe',timeout:190000});
    if(crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex')!==asset.sha256)throw new Error('Downloaded asset checksum does not match the pinned release');
    const binary=name==='gitleaks'?execFileSync('tar',['-xzOf',archive,'gitleaks'],{maxBuffer:100*1024*1024,timeout:10000}):fs.readFileSync(archive);
    fs.mkdirSync(directory,{recursive:true});
    fs.writeFileSync(target,binary,{flag:'wx',mode:0o755});
    return {tool:name,version:pin.version,path:target};
  }finally {fs.rmSync(temporary,{recursive:true,force:true});}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  try {
    const args=process.argv.slice(2);
    if(args.length===1&&['--help','-h'].includes(args[0]))console.log('Usage: node .harness/core/runtime/tooling/harness-tool-install.mjs gitleaks|sops [--destination DIR]\nExplicit download with pinned SHA256; requires curl and tar (Gitleaks). Default: ~/.local/bin. Existing files are never replaced. Add the destination to PATH.');
    else {
      if(![1,3].includes(args.length)||args.length===3&&(args[1]!=='--destination'||!args[2])||!Object.hasOwn(toolPins,args[0]))throw new Error('Invalid arguments; use --help');
      console.log(JSON.stringify(installTool(args[0],args[2])));
    }
  }catch {console.error('Tool installation failed: verify arguments, curl/tar, network, destination ownership and pinned release availability; existing binaries are preserved.');process.exitCode=2;}
}
