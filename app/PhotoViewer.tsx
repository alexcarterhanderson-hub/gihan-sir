'use client';
import {useRef,useState} from 'react';
import {ZoomIn,ZoomOut,RotateCcw,Move} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Slider} from '@/components/ui/slider';
export type Photo={url:string;caption:string};
export const clampZoom=(v:number)=>Math.max(1,Math.min(5,v));
export function publicPhoto(target:EventTarget|null):Photo|null{
 if(!(target instanceof Element)||target.closest('[role="dialog"], [data-slot="sheet-content"], .studio-sheet, .video-card, .brand-mark'))return null;
 const image=target instanceof HTMLImageElement?target:target.closest('a, [data-photo]')?.querySelector('img');
 if(!(image instanceof HTMLImageElement)||target.closest('button')&&!target.closest('[data-photo]'))return null;
 return {url:image.dataset.original||image.currentSrc||image.src,caption:image.alt||'Photo'};
}
export default function PhotoViewer({photo,onClose}:{photo:Photo|null;onClose:()=>void}){
 const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0});
 const pointers=useRef(new Map<number,{x:number;y:number}>());
 const gesture=useRef({distance:0,zoom:1});
 const reset=()=>{setZoom(1);setPan({x:0,y:0});pointers.current.clear()};
 const change=(v:number)=>{const next=clampZoom(v);setZoom(next);if(next===1)setPan({x:0,y:0})};
 return <Dialog open={!!photo} onOpenChange={v=>{if(!v){reset();onClose()}}}>
 <DialogContent className="photo-viewer" onKeyDown={e=>{
  if(e.key==='+'||e.key==='='){e.preventDefault();change(zoom+.25)}
  if(e.key==='-'){e.preventDefault();change(zoom-.25)}
  if(e.key==='0')reset();
  if(zoom>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();setPan(p=>({x:p.x+(e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0),y:p.y+(e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0)}));
  }
 }}>
 <div className="photo-viewer-heading"><DialogTitle>{photo?.caption}</DialogTitle><DialogDescription><Move size={14}/> Zoom, drag or pinch to explore</DialogDescription></div>
 <div className="photo-viewer-stage" tabIndex={0} aria-label="Photo zoom and pan area" onWheel={e=>{e.preventDefault();change(zoom-e.deltaY*.002)}} onDoubleClick={()=>change(zoom>1?1:2)}
 onPointerDown={e=>{
  e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];gesture.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoom}}
 }}
 onPointerMove={e=>{
  const previous=pointers.current.get(e.pointerId);if(!previous)return;
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.current.size===2){
   const [a,b]=[...pointers.current.values()];if(gesture.current.distance)change(gesture.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.current.distance);
  }else if(zoom>1){
   const limit=1000*(zoom-1);setPan(p=>({x:Math.max(-limit,Math.min(limit,p.x+e.clientX-previous.x)),y:Math.max(-limit,Math.min(limit,p.y+e.clientY-previous.y))}));
  }
 }}
 onPointerUp={e=>pointers.current.delete(e.pointerId)} onPointerCancel={e=>pointers.current.delete(e.pointerId)}>
 {photo&&<img draggable={false} src={photo.url} alt={photo.caption} style={{transform:'translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}}/>}
 </div>
 <div className="photo-viewer-tools"><button aria-label="Zoom out" disabled={zoom<=1} onClick={()=>change(zoom-.25)}><ZoomOut size={20}/></button><Slider aria-label="Photo zoom" min={1} max={5} step={.05} value={[zoom]} onValueChange={v=>change(v[0])}/><span aria-live="polite">{Math.round(zoom*100)}%</span><button aria-label="Zoom in" disabled={zoom>=5} onClick={()=>change(zoom+.25)}><ZoomIn size={20}/></button><button aria-label="Reset photo view" onClick={reset}><RotateCcw size={20}/></button></div>
 </DialogContent></Dialog>;
}
