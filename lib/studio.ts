import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
export function db(){if(!env.DB)throw Error('Storage unavailable');return env.DB}
export async function read(id:string){return db().prepare('SELECT value, expires FROM studio WHERE id = ?').bind(id).first<{value:string;expires:number}>()}
export async function put(id:string,value:string,expires=0){await db().prepare('INSERT INTO studio (id,value,expires) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,expires=excluded.expires').bind(id,value,expires).run()}
export function standalonePassword(){const password=(env as unknown as {STANDALONE_ADMIN_PASSWORD?:string}).STANDALONE_ADMIN_PASSWORD;return password&&password.length>=16?password:null}
export async function owner(){if(standalonePassword())return {userId:'standalone-owner',email:'',displayName:'Owner',fullName:null};const u=await getChatGPTUser();return u&&u.email.toLowerCase()===(env as unknown as {SITE_OWNER_EMAIL?:string}).SITE_OWNER_EMAIL?.toLowerCase()?u:null}
export async function digest(v:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function authorized(req:Request){const u=await owner();if(!u)return false;const token=req.headers.get('cookie')?.match(/(?:^|; )studio_session=([^;]+)/)?.[1];if(!token)return false;const row=await read('session:'+await digest(token));return !!row&&row.value===u.userId&&row.expires>Date.now()}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin}
export const fail=(message:string,status=400)=>Response.json({error:message},{status});
