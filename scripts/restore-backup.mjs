import {readFileSync,existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';

const root=fileURLToPath(new URL('../',import.meta.url));
const backup=path.join(root,'backup');
const args=new Set(process.argv.slice(2));
const manifest=JSON.parse(readFileSync(path.join(backup,'manifest.json'),'utf8'));
const content=JSON.parse(readFileSync(path.join(backup,'content.json'),'utf8'));
if(!content?.profile||!Array.isArray(content.albums)||!Array.isArray(manifest.files))throw Error('Invalid backup');
const ids=new Set();
for(const item of manifest.files){
 if(!/^[0-9a-f-]{36}$/.test(item.id)||item.file!=='media/'+item.id||ids.has(item.id))throw Error('Invalid or duplicate backup media ID');
 const bytes=readFileSync(path.join(backup,item.file));
 if(bytes.length!==item.size||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Backup media checksum failed: '+item.id);
 ids.add(item.id);
}
function verifyReferences(v){
 if(Array.isArray(v))return v.forEach(verifyReferences);
 if(v&&typeof v==='object')return Object.values(v).forEach(verifyReferences);
 if(typeof v==='string'&&v.startsWith('/api/media/')&&!ids.has(v.slice(11)))throw Error('Referenced media missing from backup');
}
verifyReferences(content);
console.log('Backup verified: '+ids.size+' media files and all content references.');
if(args.has('--check'))process.exit(0);
if(args.has('--local')===args.has('--remote')||!args.has('--confirm'))throw Error('Choose --local or --remote and add --confirm. This replaces content in the selected database.');
const remote=args.has('--remote');
const config=JSON.parse(readFileSync(path.join(root,'wrangler.standalone.json'),'utf8'));
const database=config.d1_databases?.find(x=>x.binding==='DB');
const endpoint=config.vars?.IMAGEKIT_URL_ENDPOINT;
const devVarsPath=path.join(root,'.dev.vars');
const devVars=existsSync(devVarsPath)?readFileSync(devVarsPath,'utf8'):'';
const secretLine=devVars.split(/\r?\n/).find(line=>/^\s*SCIENCE_MEDIA\s*=/.test(line));
const imageKitKey=process.env.SCIENCE_MEDIA??secretLine?.replace(/^\s*SCIENCE_MEDIA\s*=\s*/,'').trim().replace(/^(['"])(.*)\1$/,'$2');
if(!database||!endpoint)throw Error('Configure DB and IMAGEKIT_URL_ENDPOINT in wrangler.standalone.json');
if(!imageKitKey)throw Error('Set SCIENCE_MEDIA in .dev.vars before restoring media to ImageKit.');
if(remote&&database.database_id==='00000000-0000-4000-8000-000000000000')throw Error('Set your real Cloudflare database ID first');
const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
if(!existsSync(wrangler))throw Error('Run pnpm install first');
const mode=remote?['--remote']:['--local','--persist-to',path.join(root,'.wrangler/state')];
function run(command){const r=spawnSync(process.execPath,[wrangler,...command,'--config',path.join(root,'wrangler.standalone.json'),...mode],{cwd:root,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw Error('Restore stopped. You may retry after fixing the reported error.');}
if(!stdin.isTTY)throw Error('Restore requires an interactive terminal so it can confirm before uploading media.');
const prompt=createInterface({input:stdin,output:stdout});
try{
 const answer=await prompt.question('This will upload the packaged snapshot to ImageKit and replace selected D1 content. Type RESTORE to continue: ');
 if(answer!=='RESTORE'){
  console.log('Restore cancelled. No media was uploaded and no database was changed.');
  process.exit(0);
 }
}finally{prompt.close()}
for(const item of manifest.files){
 const form=new FormData();
 form.append('file',new Blob([readFileSync(path.join(backup,item.file))],{type:item.contentType}),item.id);
 form.append('fileName',item.id);
 form.append('folder','/science-with-gihan');
 form.append('useUniqueFileName','false');
 const response=await fetch('https://upload.imagekit.io/api/v1/files/upload',{
  method:'POST',
  headers:{Authorization:'Basic '+Buffer.from(imageKitKey+':').toString('base64')},
  body:form,
 });
 if(!response.ok)throw Error('ImageKit upload failed for '+item.id+' ('+response.status+'): '+await response.text());
}
const temporary=mkdtempSync(path.join(tmpdir(),'science-backup-'));
try{
 const schema=readFileSync(path.join(root,'drizzle/0000_cooing_maestro.sql'),'utf8').replace(/CREATE TABLE /g,'CREATE TABLE IF NOT EXISTS ');
 const value=JSON.stringify(content).replaceAll("'","''");
 const sql=schema+"\nINSERT INTO studio (id,value,expires) VALUES ('content','"+value+"',0) ON CONFLICT(id) DO UPDATE SET value=excluded.value,expires=excluded.expires;\n";
 const file=path.join(temporary,'restore.sql');writeFileSync(file,sql);
 run(['d1','execute','DB','--file',file,'--yes']);
}finally{rmSync(temporary,{recursive:true,force:true})}
console.log('Content and media restored into your '+(remote?'Cloudflare account.':'persistent local database and file storage.'));
