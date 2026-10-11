// Scene renderers for "Codex × Blender". Each returns SVG markup for the 1728x610 visual area as a pure
// function of (scene, time, variant) and may set G3 (the 3D viewport state rendered by view3d.js).
// Main style: paper collage (prims.js); auxiliary: simplified Three.js "Blender viewport" (illustrative).
let G3=null,PHOTOS=[];
const PRELOAD=['img/study_v1.jpg','img/study_v2.jpg'];
const MONO='Consolas,"Lesson Latin","Lesson TC",monospace';

// ── shared pieces ──
// Blender-like window frame. Returns {svg, vp:[x,y,w,h]} where vp is the 3D canvas rect in visual coords.
function blenderWin(x,y,w,h,v,o={}){
 const side=o.side??250,bar=44,tool=o.tool??0;
 const vx=x+10,vy=y+bar+10+tool,vw=w-20-side-(side?10:0),vh=h-bar-20-tool;
 // the 3D canvas sits *under* the SVG, so window + shadow are drawn with a hole where the viewport is
 const R=(a,b,c,d)=>`M${a} ${b} H${a+c} V${b+d} H${a} Z`,hole=R(vx,vy,vw,vh);
 let s=S.path({d:R(x+7,y+9,w,h)+R(x,y,w,h),fill:'#26221d',opacity:.18,'fill-rule':'evenodd'})+
  S.path({d:R(x,y,w,h)+hole,fill:'#2b2b2b','fill-rule':'evenodd'})+S.rect({x,y,width:w,height:h,rx:8,fill:'none',stroke:'#1d1d1d','stroke-width':2});
 s+=S.rect({x,y,width:w,height:bar,rx:8,fill:'#1f1f1f'})+S.rect({x,y:y+bar-8,width:w,height:8,fill:'#1f1f1f'});
 s+=[0,1,2].map(i=>S.circle({cx:x+24+i*22,cy:y+bar/2,r:7,fill:['#e0574c','#e8b33a','#5aae4e'][i]})).join('');
 s+=S.text(x+100,y+30,pick(v,'Blender（示意畫面）','Blender (illustration)'),{'font-size':22,'font-weight':700,fill:'#e6e6e6'});
 s+=S.rect({x:vx-1,y:vy-1,width:vw+2,height:vh+2,fill:'none',stroke:'#1d1d1d','stroke-width':2});
 if(side)s+=S.rect({x:vx+vw+10,y:vy,width:side,height:vh,rx:4,fill:'#333'});
 return {svg:s,vp:[vx,vy,vw,vh],side:[vx+vw+10,vy,side,vh]};
}
function outliner(x,y,w,rows,v){
 let s=S.text(x+14,y+32,pick(v,'物件清單','Outliner'),{'font-size':22,'font-weight':700,fill:'#cfcfcf'})+S.rect({x:x+10,y:y+44,width:w-20,height:2,fill:'#4a4a4a'});
 rows.forEach((r,i)=>{if(r.u<=0)return;const yy=y+58+i*46;
  s+=S.g({opacity:clamp(r.u*3).toFixed(3)},S.rect({x:x+8,y:yy,width:w-16,height:38,rx:4,fill:r.sel?'#4772b3':'#3a3a3a'})+
   S.rect({x:x+20,y:yy+11,width:16,height:16,rx:3,fill:'#f0a35a'})+S.text(x+46,yy+27,r.name,{'font-size':21,fill:'#eee','font-family':MONO}))});
 return s;
}
function codeBlock(x,y,lines,size,reveal,hl={}){
 // reveal = number of characters typed so far across all lines
 let s='',left=reveal;
 lines.forEach((ln,i)=>{const yy=y+i*size*1.5,n=Math.max(0,Math.min(ln.length,Math.floor(left)));left-=ln.length;
  if(hl[i])s+=S.rect({x:x-8,y:yy-size*1.05,width:hl[i].w,height:size*1.42,rx:3,fill:hl[i].c,opacity:hl[i].o??1});
  if(n>0)s+=S.text(x,yy,ln.slice(0,n),{'font-size':size,fill:hl[i]?.tc||'#e8e6df','font-family':MONO,'xml:space':'preserve'})});
 return s;
}
const chars=lines=>lines.reduce((n,l)=>n+l.length,0);
function packet(x,y,label,size=20,fill=C.sticky){const w=tw(label,size)*1.05+30;return S.g({},S.rect({x:x-w/2+3,y:y-20,width:w,height:40,rx:6,fill:'#26221d',opacity:.18})+S.rect({x:x-w/2,y:y-23,width:w,height:40,rx:6,fill,stroke:C.stickyD,'stroke-width':1.5})+S.text(x,y+4,label,{'font-size':size,'font-weight':700,fill:C.ink,'text-anchor':'middle','font-family':MONO}))}
function penCircle(cx,cy,rx,ry,u,color=C.stamp){const len=2*Math.PI*Math.max(rx,ry)*1.1;return S.path({d:`M${cx+rx} ${cy} A${rx} ${ry} 0 1 1 ${cx+rx*.96} ${cy-ry*.28}`,fill:'none',stroke:color,'stroke-width':5,'stroke-linecap':'round','stroke-dasharray':len,'stroke-dashoffset':(len*(1-E.out(u))).toFixed(1)})}

// Stool model shared by the loop scene (and later scenes). Blender units; matches the code on screen:
// cube scaled (.5,.5,.05) at z .9 → 1×1×0.1 seat; cylinders r .05, depth .85 at z .43.
const WOOD=0xb98a55,LEG=0x9a6b3c;
const STOOL_LEGS=[[.4,.4],[-.4,.4],[.4,-.4],[-.4,-.4]];
function stoolObjs(seatU,legU,sel=-1){
 const o=[{id:'seat',type:'box',size:[1,1,.1],pos:[0,0,.9],color:WOOD,grow:seatU,sel:sel===0}];
 STOOL_LEGS.forEach(([x,y],i)=>o.push({id:'leg'+i,type:'cyl',r:.05,size:[1,1,.85],pos:[x,y,.425],color:LEG,grow:legU[i]??0,growMode:'up',sel:sel===i+1}));
 return o;
}

// ── scene: the MCP loop (sample / principle) ──
function loop(scene,t,B,v){
 const ph=phaser(scene,t),intro=ph('intro'),ask=ph('ask'),pipe=ph('pipe'),run=ph('run'),look=ph('look'),fix=ph('fix');
 const T=scene.end-scene.start,g=clamp((t-scene.start)/T);
 let s='';
 // ① Codex column
 const CX=0,CY=10,CW=520,CH=590;
 s+=card(CX,CY,CW,CH,{fill:C.paper});
 s+=S.rect({x:CX,y:CY,width:CW,height:46,rx:4,fill:C.teal})+S.text(CX+20,CY+32,'Codex',{'font-size':24,'font-weight':800,fill:'#fff'});
 const prompt=pick(v,'放一張四腳木凳在場景中央','Put a four-legged wooden stool in the middle');
 const bu=E.out(clamp(ask/.22)),bsz=isEn(v)?24:26;
 if(bu>0)s+=S.g({opacity:bu.toFixed(3),transform:`translate(0 ${((1-bu)*14).toFixed(1)})`},
  S.rect({x:CX+70,y:CY+62,width:CW-90,height:isEn(v)?96:66,rx:18,fill:C.tealL})+para(CX+92,CY+104,prompt,CW-130,bsz,{'font-weight':700,fill:C.ink}));
 // code terminal
 const TY=CY+(isEn(v)?172:142),TH=CY+CH-14-TY;
 s+=S.rect({x:CX+16,y:TY,width:CW-32,height:TH,rx:8,fill:C.term});
 const legs2=fix>.15?'        (.4,-.4), (-.4,-.4)]':'        (.4,-.4)]';
 const LINES=['import bpy','mesh = bpy.ops.mesh','mesh.primitive_cube_add(location=(0,0,.9))','bpy.context.object.scale = (.5,.5,.05)',
  'LEGS = [(.4,.4), (-.4,.4),',legs2,'for x, y in LEGS:','    mesh.primitive_cylinder_add(','        radius=.05, depth=.85,','        location=(x, y, .43))'];
 const total=chars(LINES),typed=ask<=0?0:total*E.inout(clamp((ask-.2)/.8))+(pipe>0?total:0);
 // while running, highlight the line being executed; on fix highlight the corrected line
 const hl={};
 if(run>0&&run<1){const li=run<.35?2:run<.5?3:7;hl[li]={w:CW-48,c:'#3c5a8a',o:.9}}
 if(fix>.15)hl[5]={w:CW-48,c:C.green,o:clamp((fix-.15)/.2),tc:'#fff'};
 s+=codeBlock(CX+34,TY+38,LINES,18,typed,hl);
 if(ask>0&&ask<1&&Math.floor(t*2.5)%2===0){const done=Math.min(total,typed);let acc=0,li=0;while(li<LINES.length-1&&acc+LINES[li].length<done){acc+=LINES[li].length;li++}
  s+=S.rect({x:CX+34+(done-acc)*10.1,y:TY+38+li*27-16,width:9,height:20,fill:'#e8e6df'})}
 B.push({id:'codex-card',x:CX,y:CY,width:CW+8,height:CH+10,overlapGroup:'codex'});

 // ② middle: MCP server + transport labels
 const MX=548,MY=CY+5,MW=250,MH=124;
 const mu=E.back(clamp(pipe/.18))*(pipe>0?1:0);
 const showM=Math.max(mu,run>0||look>0||fix>0?1:0);
 s+=S.path({d:`M${CX+CW} ${MY+MH/2} H${MX}`,stroke:C.kraftD,'stroke-width':10,'stroke-linecap':'round',opacity:.85});
 s+=S.path({d:`M${MX+MW} ${MY+MH/2} H${836}`,stroke:C.kraftD,'stroke-width':10,'stroke-linecap':'round',opacity:.85});
 if(showM>0)s+=S.g({opacity:clamp(showM).toFixed(3),transform:`translate(${MX+MW/2} ${MY+MH/2}) scale(${(.85+.15*showM).toFixed(3)}) translate(${-MX-MW/2} ${-MY-MH/2})`},
  card(MX,MY,MW,MH,{fill:C.paper2})+tape(MX+MW/2,MY,70,-3,20)+S.text(MX+MW/2,MY+44,pick(v,'MCP 伺服器','MCP server'),{'font-size':26,'font-weight':800,fill:C.ink,'text-anchor':'middle'})+
  S.text(MX+MW/2,MY+76,'uvx mcp-for-blender',{'font-size':19,fill:C.sub,'text-anchor':'middle','font-family':MONO})+
  S.text(MX+MW/2,MY+108,'← STDIO   TCP →',{'font-size':19,'font-weight':700,fill:C.teal,'text-anchor':'middle','font-family':MONO}));
 B.push({id:'mcp-box',x:MX,y:MY,width:MW+8,height:MH+10});
 // JSON slip under the MCP box: request during pipe/run, response during look
 const slipU=clamp((pipe-.25)/.25),SX=MX-6,SY=MY+MH+40;
 if(slipU>0&&look<.05){
  s+=drop(slipU,SX+130,SY+90,-2,card(SX,SY,262,186,{fill:'#fffef8'})+tape(SX+131,SY,80,4,20)+
   S.text(SX+16,SY+40,pick(v,'送出的指令','Command sent'),{'font-size':22,'font-weight':800,fill:C.stamp})+
   ['{"type":','  "execute_code",','"params": {"code":','  "import bpy …"}}'].map((l,i)=>S.text(SX+16,SY+78+i*26,l,{'font-size':18,fill:C.ink,'font-family':MONO,'xml:space':'preserve'})).join(''),-16);
  B.push({id:'json-slip',x:SX,y:SY-4,width:270,height:200});
 }
 const tools=ph('tools'),port=ph('port');
 if(look>=.05&&tools<=0){const ru=clamp((look-.05)/.2)+(fix>0?1:0);
  s+=drop(ru,SX+130,SY+90,2,card(SX,SY,262,150,{fill:'#fffef8'})+tape(SX+131,SY,80,-4,20)+
   S.text(SX+16,SY+40,pick(v,'回傳','Returned'),{'font-size':22,'font-weight':800,fill:C.green})+
   ['{"status":"success"}',pick(v,'＋ 視窗截圖','+ viewport screenshot')].map((l,i)=>S.text(SX+16,SY+80+i*32,l,{'font-size':19,fill:C.ink,'font-family':i?undefined:MONO})).join(''),-16);
  B.push({id:'json-back',x:SX,y:SY-4,width:270,height:164});
 }
 // packet travelling along the tube (pipe) and a small one again on fix
 const tube=u=>{const p0=CX+CW-10,p1=836+34;return p0+(p1-p0)*E.inout(u)};
 if(pipe>.15&&pipe<.98){const u=clamp((pipe-.15)/.8);s+=packet(tube(u),MY+MH/2,'bpy',20)}
 if(fix>.2&&fix<.62){const u=clamp((fix-.2)/.4);s+=packet(tube(u),MY+MH/2,'+1',20,C.greenL)}

 // ③ Blender window with the 3D viewport
 const BX=836,BY=CY,BW=884,BH=590;
 const win=blenderWin(BX,BY,BW,BH,v,{side:240,tool:56});
 s+=win.svg;
 // add-on status strip
 const conn=pipe>.6||run>0||look>0||fix>0;
 s+=S.rect({x:BX+10,y:BY+54,width:BW-20,height:46,rx:4,fill:'#333'})+S.circle({cx:BX+34,cy:BY+77,r:9,fill:conn?'#5aae4e':'#777'})+
  S.text(BX+54,BY+85,pick(v,'MCP 外掛','MCP add-on')+(conn?pick(v,'：已連線 · localhost:9876','  connected · localhost:9876'):pick(v,'：等待連線','  waiting')),{'font-size':21,fill:'#e6e6e6'});
 if(pipe>.7&&pipe<1){const fl=Math.sin(clamp((pipe-.7)/.3)*Math.PI);s+=S.rect({x:BX+10,y:BY+54,width:BW-20,height:46,rx:4,fill:'#f6d35b',opacity:(fl*.35).toFixed(3)})}
 B.push({id:'blender-win',x:BX,y:BY,width:BW+8,height:BH+10,overlapGroup:'blender'});
 // objects appear during run: seat, then legs 1–3 (leg 4 missing until fix)
 const seatU=clamp(run/.3),legU=[0,1,2].map(i=>clamp((run-.38-i*.17)/.2)).concat([clamp((fix-.5)/.35)]);
 const sel=fix>.5?4:run>.38?1+Math.min(2,Math.floor((run-.38)/.17)):run>0?0:-1;
 const st={rect:win.vp,cam:{az:24+g*22,el:22,dist:4.4,target:[0,0,.5]},objs:stoolObjs(seatU,legU,look>0&&fix<=.5?-1:sel)};
 G3=st;
 const names=['Cube','Cylinder','Cylinder.001','Cylinder.002','Cylinder.003'];
 s+=outliner(...win.side.slice(0,3),names.map((n,i)=>({name:n,u:i?legU[i-1]:seatU,sel:i===sel&&!(look>0&&fix<=.5)})),v);
 // ④ look: shutter flash, polaroid back to Codex, red pen on the missing leg
 const [vx,vy,vw,vh]=win.vp;
 if(look>0&&look<.3)s+=S.rect({x:vx,y:vy,width:vw,height:vh,fill:'#fff',opacity:(Math.sin(clamp(look/.3)*Math.PI)*.75).toFixed(3)});
 if(look>.05){
  const [px,py]=window.view3d?window.view3d.project(st,[-.4,-.4,.43]):[vw*.4,vh*.6];
  const cu=clamp((look-.25)/.4)*(1-clamp((fix-.55)/.3));
  if(cu>0){s+=penCircle(vx+px,vy+py,46,78,cu);
   const note=pick(v,'少一隻腳！','A leg is missing!');
   s+=fade(clamp((look-.5)/.25)*(1-clamp((fix-.55)/.3)),S.rect({x:vx+px-tw(note,26)/2-14,y:vy+py+86,width:tw(note,26)+28,height:40,rx:4,fill:C.paper})+S.text(vx+px,vy+py+115,note,{'font-size':26,'font-weight':800,fill:C.stamp,'text-anchor':'middle'}),6)}
  // polaroid: flies from the viewport to the Codex column and stays there until fix
  const fu=E.inout(clamp((look-.08)/.5)),out=clamp((fix-.1)/.25);
  if(out<1){const x0=vx+vw/2-110,y0=vy+vh/2-90,x1=CX+240,y1=CY+330,x=lerp(x0,x1,fu),y=lerp(y0,y1,fu)-Math.sin(fu*Math.PI)*120;
   s+=S.g({opacity:(1-out).toFixed(3),transform:`rotate(${(-7*fu).toFixed(2)} ${x+110} ${y+95})`},shadow(x,y,220,190)+S.rect({x,y,width:220,height:190,fill:'#fff',stroke:'#ddd'})+S.rect({x:x+12,y:y+12,width:196,height:136,fill:'#3a3a3a'})+
    S.rect({x:x+62,y:y+50,width:96,height:12,fill:'#b98a55'})+[[70,0],[146,0],[100,-12]].map(([lx,dy])=>S.rect({x:x+lx-2,y:y+62+dy,width:7,height:62-dy,fill:'#9a6b3c'})).join('')+
    S.text(x+110,y+176,pick(v,'截圖','screenshot'),{'font-size':18,fill:C.sub,'text-anchor':'middle'}))}
 }
 // ⑥ tools: the MCP tools as Codex's hands and eyes (replaces the response slip)
 if(tools>0){
  const rows=[[pick(v,'手','hand'),'execute_blender_code',C.stamp],[pick(v,'眼','eye'),'get_scene_info',C.teal],[pick(v,'眼','eye'),'look',C.teal]];
  s+=drop(clamp(tools/.2),SX+130,SY+110,-2,card(SX,SY,262,226,{fill:'#fffef8'})+tape(SX+131,SY,80,3,20)+
   S.text(SX+16,SY+40,pick(v,'MCP 工具','MCP tools'),{'font-size':22,'font-weight':800,fill:C.ink})+
   rows.map(([b,n,col],i)=>{const u=clamp((tools-.12-i*.16)/.15),yy=SY+82+i*48;return u<=0?'':S.g({opacity:u.toFixed(3)},
    S.rect({x:SX+14,y:yy-24,width:isEn(v)?50:34,height:34,rx:17,fill:col})+S.text(SX+14+(isEn(v)?25:17),yy-1,b,{'font-size':isEn(v)?16:20,'font-weight':800,fill:'#fff','text-anchor':'middle'})+
    S.text(SX+(isEn(v)?72:56),yy-1,n,{'font-size':fit(n,262-(isEn(v)?84:68),17),fill:C.ink,'font-family':MONO}))}).join(''),-16);
  B.push({id:'tool-card',x:SX,y:SY-4,width:270,height:240});
 }
 // ⑦ port: the add-on socket has no password
 if(port>0){const u=clamp(port/.15);
  s+=S.rect({x:BX+10,y:BY+54,width:BW-20,height:46,rx:4,fill:'none',stroke:C.stamp,'stroke-width':4,opacity:u.toFixed(3)});
  const wx=vx+18,wy=vy+18,ww=Math.min(vw-36,isEn(v)?600:560),l1=pick(v,'localhost:9876 沒有密碼','localhost:9876 has no password'),l2=pick(v,'連得上這個埠 → 就能在 Blender 執行 Python','Reach the port → run Python in Blender');
  s+=drop(clamp((port-.08)/.25),wx+ww/2,wy+50,-1,card(wx,wy,ww,104,{fill:'#fff6e8',stroke:C.stamp})+
   S.poly([[wx+38,wy+22],[wx+62,wy+64],[wx+14,wy+64]],{fill:C.stamp})+S.text(wx+38,wy+59,'!',{'font-size':26,'font-weight':900,fill:'#fff','text-anchor':'middle'})+
   S.text(wx+80,wy+44,l1,{'font-size':fit(l1,ww-96,26),'font-weight':800,fill:C.stamp,'font-family':MONO})+S.text(wx+80,wy+82,l2,{'font-size':fit(l2,ww-96,22),fill:C.ink}),-14);
 }
 // ⑤ fix: result stamp
 if(fix>.82||ph('hold')>0)s+=fade(clamp((fix-.82)/.18)+(ph('hold')>0?1:0),S.rect({x:vx+vw/2-170,y:vy+vh-84,width:340,height:76,rx:6,fill:C.paper,opacity:.94})+stamp(vx+vw/2,vy+vh-46,pick(v,'✓ 四隻腳都在','✓ All four legs'),28,-3,C.green),0);
 return s;
}

