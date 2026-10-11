// Scene renderers for "Codex Skills". Each returns SVG markup for the 1728x610 visual area as a pure
// function of (scene, time, variant). Main style: paper collage (index cards, kraft, tape, stamps);
// auxiliary: vector-rebuilt Codex UI. Custom geometry goes to B for the automated overlap check
// (same overlapGroup = intentional layering).
const C={ink:'#26221d',sub:'#5b5146',muted:'#958878',paper:'#fffdf7',paper2:'#f6f0e2',line:'#e1d7c5',kraft:'#c8a476',kraftD:'#a9875a',kraftL:'#dcc29b',
 stamp:'#c23b2c',teal:'#16707a',tealL:'#d6ecec',sticky:'#f6d35b',stickyD:'#e2b93a',pen:'#2a4f9e',green:'#2b7d4f',greenL:'#dcefe2',marker:'#ffe680',term:'#22262e',tape:'#efe2b8'};
const clamp=x=>Math.min(1,Math.max(0,x)),lerp=(a,b,u)=>a+(b-a)*u;
const E={out:x=>1-Math.pow(1-clamp(x),3),inout:x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},back:x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function attrs(a){return Object.entries(a).filter(([,v])=>v!==undefined&&v!==null).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')}
const S={rect:a=>'<rect '+attrs(a)+'/>',text:(x,y,s,a={})=>'<text '+attrs({x,y,...a})+'>'+esc(s)+'</text>',g:(a,inner)=>'<g '+attrs(a)+'>'+inner+'</g>',path:a=>'<path '+attrs(a)+'/>',circle:a=>'<circle '+attrs(a)+'/>',line:a=>'<line '+attrs(a)+'/>',poly:(pts,a)=>'<polygon '+attrs({points:pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),...a})+'/>'};
function phaser(scene,t){const map={};for(const p of scene.phases)map[p.name]=p;return n=>{const p=map[n];if(!p)return 0;return clamp((t-p.start)/(p.end-p.start))}}
const tw=(s,size)=>[...String(s)].reduce((w,ch)=>w+(/[　-鿿＀-￯]/.test(ch)?size:size*.56),0);
const fit=(s,maxW,size)=>Math.min(size,size*maxW/Math.max(1,tw(s,size)));
const isEn=v=>String(v).startsWith('en');
const pick=(v,zh,en)=>isEn(v)?en:zh;
const fade=(u,inner,dy=10)=>u<=0?'':S.g({opacity:clamp(u).toFixed(3),transform:`translate(0 ${((1-E.out(u))*dy).toFixed(1)})`},inner);
const rot=(deg,cx,cy,inner)=>S.g({transform:`rotate(${deg} ${cx} ${cy})`},inner);
const drop=(u,cx,cy,deg,inner,dy=-40)=>{if(u<=0)return '';const k=E.back(u);return S.g({opacity:clamp(u*2.5).toFixed(3),transform:`translate(0 ${((1-E.out(u))*dy).toFixed(1)}) rotate(${(deg*(1-k)*3).toFixed(2)} ${cx} ${cy})`},inner)};
function wrap(s,maxW,size){const out=[];let cur='';const toks=String(s).match(/[A-Za-z0-9@&.'’\-\/+_$:%]+|\s+|./g)||[];
 for(const tk of toks){if(tk.trim()===''&&!cur)continue;if(tw(cur+tk,size)>maxW&&cur){out.push(cur.trim());cur=tk.trim()===''?'':tk}else cur+=tk}if(cur.trim())out.push(cur.trim());return out}
function para(x,y,s,maxW,size,a={},lh=1.32){return wrap(s,maxW,size).map((ln,i)=>S.text(x,y+i*size*lh,ln,{'font-size':size,...a})).join('')}

// ── paper primitives ──
// deterministic jitter so torn edges stay identical on every frame
const rnd=seed=>{let s=seed*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280}};
function torn(x,y,w,h,seed,a={}){const r=rnd(seed),pts=[];const n=Math.max(6,Math.round(w/26));
 for(let i=0;i<=n;i++)pts.push([x+w*i/n,y+(r()-.5)*5]);for(let i=n;i>=0;i--)pts.push([x+w*i/n,y+h+(r()-.5)*5]);return S.poly(pts,a)}
const shadow=(x,y,w,h,o={})=>S.rect({x:x+(o.dx??7),y:y+(o.dy??9),width:w,height:h,rx:o.rx??3,fill:'#26221d',opacity:o.op??.13});
function card(x,y,w,h,o={}){return shadow(x,y,w,h,o)+S.rect({x,y,width:w,height:h,rx:o.rx??4,fill:o.fill||C.paper,stroke:o.stroke||'#d8ccb6','stroke-width':1.5})}
function tape(cx,cy,w,deg=0,h=30){return rot(deg,cx,cy,S.rect({x:cx-w/2,y:cy-h/2,width:w,height:h,fill:C.tape,opacity:.82})+S.rect({x:cx-w/2,y:cy-h/2,width:w,height:3,fill:'#fff',opacity:.35}))}
function clip(x,y,s=1,color='#8c8c94'){return S.path({d:`M${x} ${y+40*s} V${y+8*s} Q${x} ${y} ${x+7*s} ${y} Q${x+14*s} ${y} ${x+14*s} ${y+8*s} V${y+34*s} Q${x+14*s} ${y+38*s} ${x+10*s} ${y+38*s} Q${x+6*s} ${y+38*s} ${x+6*s} ${y+34*s} V${y+12*s}`,fill:'none',stroke:color,'stroke-width':3*s,'stroke-linecap':'round'})}
function stamp(cx,cy,s,size,deg=-6,color=C.stamp){const w=tw(s,size)+34,h=size+22;return rot(deg,cx,cy,S.rect({x:cx-w/2,y:cy-h/2,width:w,height:h,rx:6,fill:'none',stroke:color,'stroke-width':3.5,opacity:.9})+S.text(cx,cy+size*.36,s,{'font-size':size,'font-weight':800,fill:color,'text-anchor':'middle','letter-spacing':1,opacity:.9}))}
function sticky(x,y,w,h,deg,inner){return rot(deg,x+w/2,y+h/2,S.rect({x:x+6,y:y+10,width:w,height:h,fill:'#26221d',opacity:.12})+S.rect({x,y,width:w,height:h,fill:C.sticky})+S.path({d:`M${x} ${y+h-26} L${x+26} ${y+h} L${x} ${y+h} Z`,fill:C.stickyD})+inner)}
// envelope whose content (sheet / terminal) slides out between the opened flap (behind) and the pocket (front)
function envelope(x,y,w,h,flapU,label,size,content=''){
 const open=E.inout(flapU),tip=lerp(y+h*.55,y-h*.5,open),flap=S.poly([[x,y],[x+w,y],[x+w/2,tip]],{fill:open>.5?C.kraftD:C.kraftL,stroke:C.kraftD,'stroke-width':2});
 return shadow(x,y,w,h)+(open>.5?flap:'')+content+S.rect({x,y,width:w,height:h,rx:3,fill:C.kraft})+
  S.path({d:`M${x} ${y+h} L${x+w/2} ${y+h*.48} L${x+w} ${y+h}`,fill:'none',stroke:C.kraftD,'stroke-width':2})+
  (open>.5?S.rect({x,y,width:w,height:3,fill:C.kraftD}):flap)+
  S.rect({x:x+18,y:y+h-52,width:w-36,height:38,rx:3,fill:C.paper,opacity:.94})+S.text(x+w/2,y+h-26,label,{'font-size':fit(label,w-56,size),'font-weight':700,fill:C.ink,'text-anchor':'middle'})}

