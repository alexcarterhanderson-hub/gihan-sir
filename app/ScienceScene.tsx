'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export default function ScienceScene({mode=0,small=false}:{mode?:number;small?:boolean}){
 const host=useRef<HTMLDivElement>(null);const modeRef=useRef(mode);const [failed,setFailed]=useState(false);
 useEffect(()=>{modeRef.current=mode},[mode]);
 useEffect(()=>{const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{setFailed(true);return}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;el.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,9.7);
 const pmrem=new THREE.PMREMGenerator(renderer);const environment=new RoomEnvironment();const env=pmrem.fromScene(environment,.04);scene.environment=env.texture;environment.dispose();
 scene.add(new THREE.AmbientLight(0xffffff,1.2));const key=new THREE.DirectionalLight(0xd4e5ff,5);key.position.set(-3,4,6);scene.add(key);const rim=new THREE.PointLight(0x789dff,45);rim.position.set(3,-1,3);scene.add(rim);
 const root=new THREE.Group();scene.add(root);const groups=[new THREE.Group(),new THREE.Group(),new THREE.Group()];groups.forEach(g=>root.add(g));
 const yellow=new THREE.MeshPhysicalMaterial({color:'#ebff65',metalness:.62,roughness:.17,clearcoat:1});const blue=new THREE.MeshPhysicalMaterial({color:'#436bff',metalness:.8,roughness:.17,clearcoat:1});const coral=new THREE.MeshPhysicalMaterial({color:'#ff896f',metalness:.42,roughness:.2,clearcoat:1});const silver=new THREE.MeshPhysicalMaterial({color:'#c0ceff',metalness:.95,roughness:.15});
 const sphere=new THREE.SphereGeometry(1,48,32);
 function ball(g:THREE.Group,r:number,pos:number[],mat:THREE.Material){let m=new THREE.Mesh(sphere,mat);m.scale.setScalar(r);m.position.set(...pos as [number,number,number]);g.add(m);return m}
 function bond(g:THREE.Group,a:THREE.Vector3,b:THREE.Vector3,mat:THREE.Material,r=.07){const d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),16),mat);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m)}
 const nucleus=ball(groups[0],.87,[0,0,0],yellow);const orbits:THREE.Group[]=[];
 for(let i=0;i<3;i++){const orbit=new THREE.Group();orbit.rotation.set(i*.83,.55+i*.9,i*.7);const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.052,16,160),i===1?silver:blue);orbit.add(ring);ball(orbit,.25,[2,0,0],i===1?coral:yellow);ball(orbit,.14,[-2,0,0],silver);groups[0].add(orbit);orbits.push(orbit)}
 const positions=[[-.7,.1,0],[.85,.35,.3],[-1.6,1.1,.5],[-1.5,-1,-.5],[1.55,1.45,-.1],[1.6,-.9,.5]];positions.forEach((p,i)=>ball(groups[1],i<2?.72:.4,p,i<2?coral:yellow));[[0,1],[0,2],[0,3],[1,4],[1,5]].forEach(([a,b])=>bond(groups[1],new THREE.Vector3(...positions[a] as [number,number,number]),new THREE.Vector3(...positions[b] as [number,number,number]),silver,.13));
 for(let i=0;i<13;i++){const a=i*.59;const y=(i-6)*.32;const p=new THREE.Vector3(Math.cos(a)*.93,y,Math.sin(a)*.93);const q=new THREE.Vector3(-p.x,y,-p.z);ball(groups[2],.21,p.toArray(),blue);ball(groups[2],.21,q.toArray(),yellow);bond(groups[2],p,q,i%2?coral:silver,.075);if(i){const prev=(i-1)*.59;bond(groups[2],new THREE.Vector3(Math.cos(prev)*.93,y-.32,Math.sin(prev)*.93),p,blue,.1);bond(groups[2],new THREE.Vector3(-Math.cos(prev)*.93,y-.32,-Math.sin(prev)*.93),q,yellow,.1)}}
 const dust=new THREE.Group();root.add(dust);for(let i=0;i<13;i++){const p=[Math.sin(i*4.2)*3.0,Math.cos(i*2.3)*2.7,Math.sin(i)*1.7];ball(dust,.025+(i%3)*.012,p,i%2?blue:yellow)}
 let mx=0,my=0,drag=false,last=0,rotation=0,raf=0,visible=true;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=w/h<.85?11.2:9.7;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(el);resize();
 const onMove=(e:PointerEvent)=>{const b=el.getBoundingClientRect();mx=((e.clientX-b.left)/b.width-.5)*.6;my=((e.clientY-b.top)/b.height-.5)*.4;if(drag){rotation+=(e.clientX-last)*.009;last=e.clientX}};
 const down=(e:PointerEvent)=>{drag=true;last=e.clientX;el.setPointerCapture(e.pointerId)};const up=()=>drag=false;el.addEventListener('pointermove',onMove);el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 const io=new IntersectionObserver(entries=>visible=entries[0].isIntersecting);io.observe(el);
 const clock=new THREE.Clock();const animate=()=>{raf=requestAnimationFrame(animate);if(!visible)return;const t=clock.getElapsedTime();const scroll=small?0:Math.min(window.scrollY/window.innerHeight,1);root.rotation.y+=(mx+rotation+scroll*.8-root.rotation.y)*.035;root.rotation.x+=(-my+.15-root.rotation.x)*.035;root.rotation.z=small?-.12:-.16+scroll*.17;root.position.y=reduced?0:Math.sin(t*.7)*.07;groups.forEach((g,i)=>{const target=i===modeRef.current?1:0;g.scale.lerp(new THREE.Vector3(target,target,target),.085);g.visible=g.scale.x>.005;if(!reduced)g.rotation.y=t*.1});if(!reduced){orbits.forEach((o,i)=>o.rotation.z+=.002*(i+1));dust.rotation.y=t*.06;nucleus.rotation.y=t*.15}renderer.render(scene,camera)};animate();
 return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose()}});[yellow,blue,coral,silver].forEach(m=>m.dispose());env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove()}
 },[small]);
 return <div ref={host} className="science-scene" role="img" aria-label={['Interactive three-dimensional atom model. Drag to rotate.','Three-dimensional molecular model','Three-dimensional DNA model'][mode]}>{failed&&<div className="scene-fallback">⚛<span>විද්‍යාව ගවේෂණය කරන්න</span></div>}</div>
}
