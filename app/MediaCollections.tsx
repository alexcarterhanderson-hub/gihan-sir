'use client';
import {useState,useEffect,useRef} from 'react';
import {motion,useInView,useReducedMotion} from 'framer-motion';
import {FlaskConical,ShieldCheck,Compass,GraduationCap,BookOpen,CalendarDays,ArrowUpRight,ChevronLeft,ChevronRight,Upload,Plus,Trash2} from 'lucide-react';
import {mediaDisplayUrl} from './media-display';
export type MediaItem={id:string;url:string;type:string;name:string;caption:string;previewUrl?:string};
export type Album={id:string;title:string;label:string;description:string;items:MediaItem[]};
export const defaultAlbums:Album[]=[
{id:'practicals',title:'අත්දැකීමෙන් විද්‍යාව.',label:'Practical Activities',description:'අහන්න. අත්හදා බලන්න. සොයාගන්න.',items:[{id:'lab',url:'/science-lab.png',type:'image',name:'Curiosity Lab',caption:'විද්‍යාගාර සංකල්ප නිදර්ශනය'}]},
{id:'safety',title:'ආරක්ෂාවට මුල් තැන.',label:'Safety & Supervision',description:'ගුරු අධීක්ෂණය සමඟ විශ්වාසයෙන් ඉගෙන ගමු.',items:[]},
{id:'trips',title:'ලෝකයම පන්ති කාමරයක්.',label:'Field Trips',description:'පොතෙන් එහා සොයාගැනීම් සඳහා අපේ ගමන්.',items:[]},
{id:'seminars',title:'අලුත් අදහස්. අලුත් ඉලක්ක.',label:'Special Seminars',description:'දැනුම බෙදාගන්නා විශේෂ හමුවීම්.',items:[]},
{id:'materials',title:'දැනුම ඔබේ අතේ.',label:'Study Materials',description:'පාඩම් සටහන්, ප්‍රශ්න පත්‍ර හා ඉගෙනුම් සම්පත්.',items:[]},
{id:'timetable',title:'ඔබේ ඊළඟ පන්තිය.',label:'Timetable Gallery',description:'පන්ති කාලසටහන් හා නව දැනුම්දීම්.',items:[]}];
const icons=[FlaskConical,ShieldCheck,Compass,GraduationCap,BookOpen,CalendarDays];
async function uploadPreview(file:File):Promise<Blob|null>{
 if(!file.type.startsWith('image/')||file.type==='image/gif')return null;
 const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
 canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.87));return blob&&blob.size<file.size?blob:null;
}
export function UploadBox({onUpload,accept='image/*,video/mp4,video/webm,application/pdf',preview=false}:{onUpload:(m:MediaItem)=>void;accept?:string;preview?:boolean}){const [status,setStatus]=useState('');const [busy,setBusy]=useState(false);async function upload(files:File[]){setBusy(true);for(const file of files){try{if(file.size>32*1024*1024)throw Error('Maximum 32 MB per file');setStatus(`Uploading ${file.name}…`);let item:MediaItem;if(preview)item={id:crypto.randomUUID(),url:URL.createObjectURL(file),type:file.type.startsWith('video')?'video':file.type==='application/pdf'?'document':'image',name:file.name,caption:file.name};else{const r=await fetch('/api/upload',{method:'POST',headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name)},body:file});const d=await r.json() as MediaItem & {error:string};if(!r.ok)throw Error(d.error);item=d;if(item.type==='image'){try{const small=await uploadPreview(file);if(small){const pr=await fetch('/api/upload',{method:'POST',headers:{'Content-Type':small.type,'X-File-Name':encodeURIComponent('Preview '+file.name)},body:small});if(pr.ok){const preview=await pr.json() as MediaItem;item={...item,previewUrl:preview.url}}}}catch{}}}onUpload(item);setStatus(`${file.name} added`)}catch(e){setStatus(e instanceof Error?e.message:'Upload failed');break}}setBusy(false)}return <div className="upload-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)void upload(Array.from(e.dataTransfer.files))}}><Upload size={26}/><b>{busy?'Adding your files…':'Drop something wonderful here'}</b><span>Photos, videos & PDF • up to 32 MB each</span><label className="upload-pick">{busy?'Uploading…':'Choose files'}<input disabled={busy} type="file" accept={accept} multiple onChange={e=>{void upload(Array.from(e.target.files||[]));e.target.value=''}}/></label><small role="status">{status||'Upload directly from your device'}</small></div>}
function AlbumCard({album,index,editing,onEdit}:{album:Album;index:number;editing:boolean;onEdit:()=>void}){
 const [cursor,setCursor]=useState(0),[shown,setShown]=useState(0),[error,setError]=useState('');
 const ready=useRef(new Set<string>()),node=useRef<HTMLDivElement>(null);
 const visible=useInView(node,{margin:'500px',once:true}),reduced=useReducedMotion();
 const i=Math.min(cursor,Math.max(0,album.items.length-1)),active=Math.min(shown,Math.max(0,album.items.length-1));
 const selected=album.items[i],item=album.items[active],Icon=icons[index]||BookOpen;
 useEffect(()=>{
  if(!visible||!selected)return;
  setError('');let cancelled=false;
  if(selected.type!=='image'){setShown(i);return}
  const url=selected.previewUrl||mediaDisplayUrl(selected.url);
  const existing=node.current?.querySelector<HTMLImageElement>('img[data-gallery-index="'+i+'"]');
  if(ready.current.has(url)&&existing?.complete&&existing.naturalWidth){setShown(i);return}
  const image=node.current?.querySelector<HTMLImageElement>('img[data-gallery-index="'+i+'"]')||new Image();image.loading='eager';image.decoding='async';
  image.onload=()=>{void (image.decode?image.decode().catch(()=>{}):Promise.resolve()).then(()=>{ready.current.add(url);if(!cancelled)setShown(i)})};
  image.onerror=()=>{if(!cancelled)setError('Photo could not load. Please try again.')};image.src=url;if(image.complete&&image.naturalWidth)image.onload?.(new Event('load'));
  return()=>{cancelled=true};
 },[visible,selected?.url,selected?.previewUrl,i]);
 useEffect(()=>{if(!visible||album.items.length<2)return;for(const j of [(i+1)%album.items.length,(i+album.items.length-1)%album.items.length]){const m=album.items[j];if(m?.type==='image'){const url=m.previewUrl||mediaDisplayUrl(m.url);if(!ready.current.has(url)){const image=new Image();image.src=url;image.onload=()=>ready.current.add(url)}}}},[visible,i,album.items]);
 return <motion.article className={`collection-card collection-${index}`} initial={reduced?false:{opacity:0,y:35}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.55,delay:index%2*.08}}>
 <div className="collection-top"><span><Icon size={17}/>{album.label}</span><small>0{index+1}</small></div>
 <div ref={node} className="collection-stage">
 {album.items.length?<div className="collection-media-stack">{album.items.map((m,j)=><div key={m.id} className={'collection-media collection-frame'+(active===j?' frame-active':'')} aria-hidden={active!==j} inert={active!==j}>
 {m.type==='image'?<a href={m.url} aria-label={`View ${m.caption}`}><img src={m.previewUrl||mediaDisplayUrl(m.url)} data-original={m.url} data-gallery-index={j} alt={m.caption} decoding="async" loading={visible&&(j===i||j===active)?'eager':'lazy'}/></a>:m.type==='video'?<video src={active===j?m.url:undefined} controls playsInline preload="metadata"/>:<a className="document-art" href={m.url} target="_blank" rel="noreferrer"><BookOpen size={64}/><strong>{m.name}</strong><span>Open / Download PDF <ArrowUpRight size={16}/></span></a>}
 </div>)}</div>:<div className="collection-art"><div className="sculpture-orbit"/><div className="sculpture-orbit second"/><div className="sculpture-core"><Icon size={76} strokeWidth={1.2}/></div><span className="art-coordinate">DISCOVER / EXPLORE / GROW</span></div>}
 {editing&&<button className="collection-edit" onClick={onEdit}><Plus size={15}/> Add media</button>}
 {album.items.length>1&&<div className="collection-side-controls" aria-label={album.label+' gallery navigation'}><button className="collection-prev" aria-label="Previous item" onClick={()=>setCursor((i+album.items.length-1)%album.items.length)}><ChevronLeft size={21}/></button><button className="collection-next" aria-label="Next item" onClick={()=>setCursor((i+1)%album.items.length)}><ChevronRight size={21}/></button><span className="sr-only" aria-live="polite">{active+1} / {album.items.length}</span></div>}
 {album.items.length>1&&<span className="gallery-position" role="status" aria-label={`Item ${active+1} of ${album.items.length}`}><b>{String(active+1).padStart(2,'0')}</b><span>/</span>{String(album.items.length).padStart(2,'0')}</span>}
 {i!==active&&!error&&<span className="gallery-loading" role="status">Loading photo…</span>}{error&&<button className="gallery-error" onClick={()=>{ready.current.clear();setCursor(active);setError('')}}>{error}</button>}
 </div>
 <div className="collection-copy"><div><h3>{album.title}</h3><p>{item?.caption||album.description}</p></div><span className="collection-arrow"><ArrowUpRight/></span></div>
 </motion.article>;
}
export function MediaCollections({albums,editing,onEdit}:{albums:Album[];editing:boolean;onEdit:(id:string)=>void}){return <div className="collections-grid">{albums.map((a,i)=><AlbumCard key={a.id} album={a} index={i} editing={editing} onEdit={()=>onEdit(a.id)}/>)}</div>}
export function AlbumEditor({albums,setAlbums,selected,setSelected,preview=false}:{albums:Album[];setAlbums:React.Dispatch<React.SetStateAction<Album[]>>;selected:string;setSelected:(v:string)=>void;preview?:boolean}){const a=albums.find(x=>x.id===selected)||albums[0];const change=(value:Partial<Album>)=>setAlbums(old=>old.map(x=>x.id===a.id?{...x,...value}:x));return <div className="studio-fields"><div className="album-selector">{albums.map((x,i)=>{const Icon=icons[i];return <button className={a.id===x.id?'active':''} key={x.id} onClick={()=>setSelected(x.id)}><Icon size={18}/>{x.label}<small>{x.items.length}</small></button>})}</div><h3>{a.label}</h3>{(['title','description'] as const).map(k=><label className="form-label" key={k}>{k}<input value={a[k]} onChange={e=>change({[k]:e.target.value})}/></label>)}<UploadBox preview={preview} onUpload={item=>setAlbums(old=>old.map(x=>x.id===a.id?{...x,items:[...x.items,item]}:x))}/>{a.items.map((m,i)=><div className="media-edit-row" key={m.id}>{m.type==='image'?<img src={m.url} alt=""/>:<BookOpen/>}<label className="form-label">Caption<input value={m.caption} onChange={e=>change({items:a.items.map(x=>x.id===m.id?{...x,caption:e.target.value}:x)})}/></label><button aria-label="Move earlier" disabled={i===0} onClick={()=>{const items=[...a.items];[items[i-1],items[i]]=[items[i],items[i-1]];change({items})}}><ChevronLeft size={16}/></button><button aria-label="Remove media" onClick={()=>change({items:a.items.filter(x=>x.id!==m.id)})}><Trash2 size={16}/></button></div>)}</div>}
