// Simplified "Blender 3D viewport" (illustrative, not Blender's real UI) drawn with Three.js r170.
// render(state) is a pure function of the state object a scene builds for the current frame, so every
// frame is reproducible. Coordinates in state use Blender's convention (Z up); converted to Three's Y up.
import * as THREE from './vendor/three.module.min.js';

const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,16/9,.05,100);
scene.add(new THREE.HemisphereLight(0xfff4e0,0x4a4a52,1.6));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(3,6,4);scene.add(sun);
// floor grid + Blender-like red (X) / green (Y) axis lines
const grid=new THREE.GridHelper(12,24,0x5c5c5c,0x4b4b4b);scene.add(grid);
const axis=(color,a,b)=>{const g=new THREE.BufferGeometry().setFromPoints([a,b]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color}));l.position.y=.002;scene.add(l)};
axis(0xc0393b,new THREE.Vector3(-6,0,0),new THREE.Vector3(6,0,0));axis(0x6b9a1f,new THREE.Vector3(0,0,-6),new THREE.Vector3(0,0,6));

const pool=new Map();
function geo(o){
 if(o.type==='cyl')return new THREE.CylinderGeometry(o.r??.05,o.r??.05,1,24);
 if(o.type==='sphere')return new THREE.SphereGeometry(.5,32,16);
 if(o.type==='cone')return new THREE.ConeGeometry(.5,1,24);
 return new THREE.BoxGeometry(1,1,1);
}
function get(o){
 let m=pool.get(o.id);
 if(!m||m.userData.type!==o.type){
  if(m)scene.remove(m);
  const g=geo(o),mat=new THREE.MeshStandardMaterial({color:0xb0b0b0,roughness:.7,metalness:0});
  m=new THREE.Mesh(g,mat);m.userData.type=o.type;
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g,30),new THREE.LineBasicMaterial({color:0xffa033}));
  m.add(edges);m.userData.edges=edges;pool.set(o.id,m);scene.add(m);
 }
 return m;
}
let lastSize='';
function render(st){
 if(!st){canvas.style.display='none';return}
 const [x,y,w,h]=st.rect;canvas.style.display='block';
 Object.assign(canvas.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
 const key=w+'x'+h;if(key!==lastSize){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();lastSize=key}
 scene.background=new THREE.Color(st.bg??0x3a3a3a);
 const live=new Set();
 for(const o of st.objs||[]){
  const grow=Math.max(0,Math.min(1,o.grow??1));if(grow<=0)continue;
  const m=get(o);live.add(o.id);m.visible=true;
  const [sx,sy,sz]=o.size,[px,py,pz]=o.pos;
  // grow from the floor up for legs ("up"), or pop uniformly
  if(o.growMode==='up'){m.scale.set(sx,sz*grow,sy);m.position.set(px,pz-sz/2*(1-grow),-py)}
  else{const k=grow<1?1.12*Math.sin(grow*Math.PI/2)-.12*Math.sin(grow*Math.PI*2.2)*(1-grow):1;m.scale.set(sx*k,sz*k,sy*k);m.position.set(px,pz,-py)}
  m.rotation.set(0,o.rotZ??0,0);
  m.material.color.set(o.color??0xb0b0b0);m.material.opacity=o.opacity??1;m.material.transparent=(o.opacity??1)<1;
  m.userData.edges.visible=!!o.sel;
 }
 for(const [id,m] of pool)if(!live.has(id))m.visible=false;
 const c=st.cam||{},az=(c.az??35)*Math.PI/180,el=(c.el??24)*Math.PI/180,d=c.dist??5,tg=c.target||[0,0,.5];
 camera.fov=c.fov??32;camera.updateProjectionMatrix();
 camera.position.set(tg[0]+d*Math.cos(el)*Math.sin(az),tg[2]+d*Math.sin(el),-tg[1]+d*Math.cos(el)*Math.cos(az));
 camera.lookAt(tg[0],tg[2],-tg[1]);
 renderer.render(scene,camera);
}
// project a Blender-space point to canvas pixels (for SVG annotations that must sit on a 3D object)
function project(st,p){
 render(st);const v=new THREE.Vector3(p[0],p[2],-p[1]).project(camera),[,,w,h]=st.rect;
 return [(v.x+1)/2*w,(1-v.y)/2*h];
}
window.view3d={render,project};
window.__v3r&&window.__v3r();
