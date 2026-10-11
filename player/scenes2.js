// Remaining scenes of "Codex × Blender" (loop lives in scenes.js). Same contract: SVG for the 1728x610 visual,
// optional G3 (3D viewport) and PHOTOS (persistent <img> layer under the SVG), custom bounds into B.
const after=(ph,names)=>names.some(n=>ph(n)>0)?1:0; // 1 once any later phase has started
function codexChip(x,y,w=230,h=86,label='Codex'){return card(x,y,w,h,{fill:C.teal,stroke:'#0f5359'})+S.text(x+w/2,y+h/2+12,label,{'font-size':34,'font-weight':800,fill:'#fff','text-anchor':'middle'})}
function miniBlender(x,y,w,h,v,lit=false){return shadow(x,y,w,h,{op:.18})+S.rect({x,y,width:w,height:h,rx:8,fill:'#2b2b2b'})+S.rect({x,y,width:w,height:38,rx:8,fill:'#1f1f1f'})+
 [0,1,2].map(i=>S.circle({cx:x+20+i*18,cy:y+19,r:6,fill:['#e0574c','#e8b33a','#5aae4e'][i]})).join('')+S.text(x+80,y+27,'Blender',{'font-size':20,'font-weight':700,fill:'#e6e6e6'})+
 S.rect({x:x+12,y:y+50,width:w-24,height:h-62,rx:4,fill:lit?'#3d4a3f':'#3a3a3a'})+
 // tiny stool silhouette in the viewport
 S.poly([[x+w/2-50,y+h/2+4],[x+w/2,y+h/2-18],[x+w/2+50,y+h/2+4],[x+w/2,y+h/2+26]],{fill:'#b98a55'})+
 [[-38,0],[38,0],[0,20]].map(([dx,dy])=>S.rect({x:x+w/2+dx-3,y:y+h/2+6+dy,width:6,height:40,fill:'#9a6b3c'})).join('')}
function term(x,y,w,h,lines,size=22,title){let s=shadow(x,y,w,h,{op:.16})+S.rect({x,y,width:w,height:h,rx:8,fill:C.term})+S.rect({x,y,width:w,height:34,rx:8,fill:'#33373f'})+S.rect({x,y:y+26,width:w,height:8,fill:'#33373f'})+
 [0,1,2].map(i=>S.circle({cx:x+18+i*18,cy:y+17,r:5,fill:'#6b7079'})).join('')+(title?S.text(x+80,y+24,title,{'font-size':17,fill:'#c9ccd2','font-family':MONO}):'');
 lines.forEach((l,i)=>{if(!l)return;const [txt,col,u=1]=l;if(u<=0)return;const n=Math.ceil(txt.length*clamp(u));s+=S.text(x+20,y+70+i*size*1.55,txt.slice(0,n),{'font-size':size,fill:col||'#e8e6df','font-family':MONO,'xml:space':'preserve'})});return s}
const typeU=(u,a=0,b=1)=>clamp((u-a)/(b-a));

// ── 01 origin: Codex vs. a glass wall → the MCP bridge; timeline with the origin date ──
function origin(scene,t,B,v){
 const ph=phaser(scene,t),wall=ph('wall'),need=ph('need'),mcp=ph('mcp'),bmcp=ph('bmcp'),off=ph('official'),cx=ph('codex');
 const built=Math.max(mcp>0?1:0,0);let s='';
 const CX=30,CY=150,BXX=1380,BY=86;
 s+=fade(Math.max(ph('intro'),wall>0?1:0)*1,codexChip(CX,CY,290,116),0);
 s+=fade(Math.max(ph('intro'),wall>0?1:0),miniBlender(BXX,BY,330,236,v,cx>.5),0);
 B.push({id:'codex',x:CX,y:CY,width:298,height:126});B.push({id:'blender',x:BXX,y:BY,width:338,height:246});
 // the glass wall (fades once the bridge exists)
 const wallO=clamp(wall/.2)*(1-clamp(mcp/.4));
 if(wallO>0){s+=S.g({opacity:wallO.toFixed(3)},S.rect({x:830,y:40,width:34,height:330,fill:'#bcd8dc',opacity:.55,stroke:'#7fa9ae','stroke-width':2})+
  S.path({d:'M836 120 L852 160 L840 190 L858 230',stroke:'#fff','stroke-width':3,fill:'none'})+
  S.text(847,32,pick(v,'看不到・按不到','can\'t see · can\'t click'),{'font-size':26,'font-weight':800,fill:C.stamp,'text-anchor':'middle'}));
  // the request note flies from Codex and bounces off the wall
  const fu=clamp((wall-.25)/.55);if(fu>0&&fu<1){const k=fu<.6?fu/.6:1-(fu-.6)/.4*.5,x=lerp(300,760,E.out(k)),y=CY+30-Math.sin(fu*Math.PI)*60;
   s+=sticky(x,y,250,70,-4+fu*10,S.text(x+16,y+44,pick(v,'放一張木凳','Add a stool'),{'font-size':28,'font-weight':800,fill:C.ink}))}}
 // dashed bridge outline (need) → deck (mcp) → Blender-side pier (bmcp) → second lane (official)
 const by=CY+58,bx0=CX+298,bx1=BXX-8;
 if(need>0||built)s+=S.path({d:`M${bx0} ${by} Q ${(bx0+bx1)/2} ${by-90} ${bx1} ${by}`,fill:'none',stroke:C.ink,'stroke-width':3,'stroke-dasharray':'12 10',opacity:(clamp(need/.3)*(1-clamp(mcp/.3))).toFixed(3)});
 if(mcp>0){const u=E.out(clamp((mcp-.1)/.6)),len=1200;
  s+=S.path({d:`M${bx0} ${by} Q ${(bx0+bx1)/2} ${by-90} ${bx1} ${by}`,fill:'none',stroke:C.kraftD,'stroke-width':18,'stroke-linecap':'round','stroke-dasharray':len,'stroke-dashoffset':(len*(1-u)).toFixed(1)});
  s+=fade(clamp((mcp-.5)/.3),S.rect({x:(bx0+bx1)/2-60,y:by-82,width:120,height:44,rx:6,fill:C.paper,stroke:C.kraftD,'stroke-width':2})+S.text((bx0+bx1)/2,by-50,'MCP',{'font-size':30,'font-weight':800,fill:C.ink,'text-anchor':'middle'}),0)}
 if(bmcp>0)s+=fade(clamp(bmcp/.3),S.rect({x:bx1-150,y:by+14,width:142,height:40,rx:5,fill:C.sticky})+S.text(bx1-79,by+42,pick(v,'外掛','add-on'),{'font-size':24,'font-weight':800,fill:C.ink,'text-anchor':'middle'}),6);
 if(off>0){const u=E.out(clamp((off-.1)/.6)),len=1200;s+=S.path({d:`M${bx0} ${by+70} Q ${(bx0+bx1)/2} ${by-10} ${bx1} ${by+70}`,fill:'none',stroke:C.teal,'stroke-width':10,'stroke-linecap':'round','stroke-dasharray':len,'stroke-dashoffset':(len*(1-u)).toFixed(1),opacity:.8});
  s+=fade(clamp((off-.5)/.3),S.text((bx0+bx1)/2,by+20,pick(v,'官方路線','official lane'),{'font-size':22,'font-weight':700,fill:C.teal,'text-anchor':'middle'}),0)}
 // Codex packet crosses the bridge
 if(cx>0){const u=E.inout(clamp(cx/.6)),qx=(1-u)*(1-u)*bx0+2*u*(1-u)*((bx0+bx1)/2)+u*u*bx1,qy=(1-u)*(1-u)*by+2*u*(1-u)*(by-90)+u*u*by;
  s+=packet(qx,qy-20,'bpy',22);if(cx>.6)s+=fade(clamp((cx-.6)/.2),stamp(BXX+165,BY+278,pick(v,'接通！','Connected!'),26,-4,C.green),0)}
 // timeline strip
 const TY=420;s+=fade(clamp(mcp/.2)+(mcp>0?0:0),S.rect({x:20,y:TY+40,width:1690,height:12,fill:C.kraft})+'',0);
 const items=[[mcp,'2024-11',pick(v,'Anthropic 提出 MCP 開放標準','Anthropic introduces MCP'),C.ink,240],
  [bmcp,pick(v,'2025 年 3 月','March 2025'),pick(v,'社群 BlenderMCP（Siddharth Ahuja）','Community BlenderMCP (Siddharth Ahuja)'),C.stamp,860],
  [off,pick(v,'2026 年 4 月','April 2026'),pick(v,'Blender Lab 官方 MCP','Official Blender Lab MCP'),C.teal,1440]];
 items.forEach(([u,d,lbl,col,x],i)=>{if(u<=0)return;const big=i===1,w=big?560:440;
  s+=drop(clamp(u/.3),x,TY+60,i===1?-1:1.5,card(x-w/2,TY,w,big?150:122,{fill:big?'#fff8ea':C.paper})+tape(x,TY,70,-4,20)+
   S.text(x,TY+(big?62:52),d,{'font-size':big?44:32,'font-weight':900,fill:col,'text-anchor':'middle'})+S.text(x,TY+(big?112:96),lbl,{'font-size':fit(lbl,w-36,big?27:23),'font-weight':700,fill:C.ink,'text-anchor':'middle'}),-20);
  B.push({id:'tl'+i,x:x-w/2,y:TY-4,width:w+8,height:(big?150:122)+12})});
 return s;
}

// ── 02 two roads ──
function twoways(scene,t,B,v){
 const ph=phaser(scene,t),road=ph('road'),bg=ph('bg'),bgpro=ph('bgpro'),live=ph('live'),livepro=ph('livepro'),core=ph('core');
 let s='';const show=u=>Math.max(u,0);
 s+=codexChip(10,262,200,86);B.push({id:'codex',x:10,y:262,width:208,height:96});
 const ru=E.out(clamp(road/.6))+(after(ph,['bg','bgpro','live','livepro','core']));const len=600;
 s+=S.path({d:'M210 290 C 300 290, 300 120, 400 120',fill:'none',stroke:C.kraftD,'stroke-width':14,'stroke-linecap':'round','stroke-dasharray':len,'stroke-dashoffset':(len*(1-clamp(ru))).toFixed(1)});
 s+=S.path({d:'M210 320 C 300 320, 300 470, 400 470',fill:'none',stroke:C.teal,'stroke-width':14,'stroke-linecap':'round','stroke-dasharray':len,'stroke-dashoffset':(len*(1-clamp(ru))).toFixed(1)});
 // road 1: background script panel
 const P1=[410,10,700,290],P2=[410,316,700,290];
 const b1=clamp(bg/.15)+after(ph,['bgpro','live','livepro','core']);
 if(b1>0){const [x,y,w,h]=P1;const tu=typeU(bg,.15,.55)+after(ph,['bgpro','live','livepro','core']);
  s+=fade(clamp(b1),S.text(x,y+30,pick(v,'① 背景腳本','① Background script'),{'font-size':30,'font-weight':800,fill:C.kraftD})+
   term(x,y+46,w-250,150,[['$ blender -b -P build.py','#f6d35b',tu],[pick(v,'# -b 背景執行、-P 執行 Python 檔','# -b background, -P run a .py'),'#8fa3b8',typeU(tu,.6,1)]],20,'terminal')+
   S.path({d:`M${x+w-240} ${y+120} H${x+w-200}`,stroke:C.ink,'stroke-width':4})+S.poly([[x+w-200,y+112],[x+w-186,y+120],[x+w-200,y+128]],{fill:C.ink})+
   card(x+w-180,y+56,180,130,{fill:'#f0ece2'})+S.text(x+w-90,y+96,pick(v,'無視窗','no window'),{'font-size':22,'font-weight':700,fill:C.sub,'text-anchor':'middle'})+
   S.text(x+w-90,y+136,'stool.png',{'font-size':20,fill:C.ink,'text-anchor':'middle','font-family':MONO})+S.text(x+w-90,y+170,pick(v,'跑完就結束','then exits'),{'font-size':20,fill:C.green,'text-anchor':'middle','font-weight':700}),8);
  B.push({id:'road1',x,y,width:w+8,height:200})}
 const bp=clamp(bgpro/.2)+after(ph,['live','livepro','core']);
 if(bp>0){const [x,y]=P1;s+=fade(clamp(bp),pro(x,y+220,pick(v,'✓ 批次、可重複','✓ batch & repeatable'),true)+pro(x+330,y+220,pick(v,'✗ 看不到過程','✗ can\'t watch it'),false),6)}
 // road 2: live MCP panel
 const l1=clamp(live/.15)+after(ph,['livepro','core']);
 if(l1>0){const [x,y,w]=P2;const spin=(t*90)%360;
  s+=fade(clamp(l1),S.text(x,y+30,pick(v,'② MCP 即時連線','② Live MCP connection'),{'font-size':30,'font-weight':800,fill:C.teal})+
   codexChip(x,y+70,170,70)+miniBlender(x+w-300,y+46,300,170,v,true)+
   S.path({d:`M${x+180} ${y+92} H${x+w-312}`,stroke:C.teal,'stroke-width':5,fill:'none'})+S.poly([[x+w-312,y+84],[x+w-298,y+92],[x+w-312,y+100]],{fill:C.teal})+
   S.path({d:`M${x+w-312} ${y+122} H${x+180}`,stroke:C.stamp,'stroke-width':5,fill:'none'})+S.poly([[x+180,y+114],[x+166,y+122],[x+180,y+130]],{fill:C.stamp})+
   S.text(x+(w-130)/2+40,y+82,pick(v,'指令','command'),{'font-size':20,'font-weight':700,fill:C.teal,'text-anchor':'middle'})+
   S.text(x+(w-130)/2+40,y+152,pick(v,'截圖・結果','screenshot · result'),{'font-size':20,'font-weight':700,fill:C.stamp,'text-anchor':'middle'}),8);
  B.push({id:'road2',x,y,width:w+8,height:226})}
 const lp=clamp(livepro/.2)+after(ph,['core']);
 if(lp>0){const [x,y]=P2;s+=fade(clamp(lp),pro(x,y+240,pick(v,'✓ 邊做邊調整','✓ adjust as you go'),true)+pro(x+330,y+240,pick(v,'✗ Blender 要開著＋外掛','✗ Blender open + add-on'),false),6)}
 // core: both roads end in bpy
 if(core>0){const u=E.out(clamp(core/.4)),x=1170,y=150,w=540,h=300;
  s+=S.path({d:`M1112 145 C 1140 145, 1140 ${y+h/2}, ${x} ${y+h/2-20}`,fill:'none',stroke:C.kraftD,'stroke-width':10,opacity:u.toFixed(3)});
  s+=S.path({d:`M1112 470 C 1140 470, 1140 ${y+h/2}, ${x} ${y+h/2+20}`,fill:'none',stroke:C.teal,'stroke-width':10,opacity:u.toFixed(3)});
  s+=drop(u,x+w/2,y+h/2,-2,card(x,y,w,h,{fill:C.paper})+tape(x+w/2,y,90,3,24)+S.text(x+w/2,y+70,pick(v,'核心都一樣','Same core'),{'font-size':32,'font-weight':800,fill:C.ink,'text-anchor':'middle'})+
   flow(x+30,y+150,[[pick(v,'Codex 寫','Codex writes'),'Python'],['Blender','bpy'],[pick(v,'場景','scene'),pick(v,'改變','changes')]],w-60)+
   S.text(x+w/2,y+262,pick(v,'bpy＝Blender 內建的 Python API','bpy = Blender\'s built-in Python API'),{'font-size':22,fill:C.sub,'text-anchor':'middle'}),-20);
  B.push({id:'core',x,y:y-6,width:w+8,height:h+16})}
 return s;
}
function pro(x,y,txt,good){const w=Math.min(320,tw(txt,23)+30);return S.rect({x,y,width:w,height:44,rx:22,fill:good?C.greenL:'#f6dcd6'})+S.text(x+w/2,y+30,txt,{'font-size':fit(txt,w-24,23),'font-weight':700,fill:good?C.green:C.stamp,'text-anchor':'middle'})}
function flow(x,y,items,w){const n=items.length,bw=(w-(n-1)*40)/n;return items.map(([a,b],i)=>{const bx=x+i*(bw+40);return S.rect({x:bx,y:y-44,width:bw,height:84,rx:8,fill:i===1?C.tealL:C.paper2,stroke:'#d8ccb6'})+
 S.text(bx+bw/2,y-12,a,{'font-size':fit(a,bw-16,22),fill:C.sub,'text-anchor':'middle'})+S.text(bx+bw/2,y+24,b,{'font-size':fit(b,bw-16,28),'font-weight':800,fill:C.ink,'text-anchor':'middle','font-family':i===1?MONO:undefined})+
 (i<n-1?S.poly([[bx+bw+10,y-12],[bx+bw+30,y],[bx+bw+10,y+12]],{fill:C.ink}):'')}).join('')}

// ── 04 four steps ──
function steps(scene,t,B,v){
 const ph=phaser(scene,t),P=['s1','s2','s3','s4'].map(ph),cfg=ph('cfg'),first=ph('first'),why=ph('why'),part2=Math.max(cfg,first,why)>0;
 let s='';
 const L=[pick(v,'安裝 uv','Install uv'),pick(v,'Blender 裝外掛、啟動伺服器','Add-on: install & start'),'codex mcp add …','codex mcp list → enabled'];
 const lx=0,ly=10,lw=560;
 s+=card(lx,ly,lw,590,{fill:C.paper})+S.text(lx+28,ly+52,pick(v,'四個步驟','Four steps'),{'font-size':32,'font-weight':800,fill:C.ink});
 L.forEach((l,i)=>{const u=P[i],done=after(ph,[['s2','s3','s4','cfg'],['s3','s4','cfg'],['s4','cfg'],['cfg']][i])||(i===3&&P[3]>.7);const y=ly+120+i*112,on=u>0||done;
  s+=S.g({opacity:on?1:.38},S.circle({cx:lx+56,cy:y,r:30,fill:u>0&&!done?C.teal:on?C.ink:'#b8ad9c'})+S.text(lx+56,y+11,String(i+1),{'font-size':30,'font-weight':900,fill:'#fff','text-anchor':'middle'})+
   S.text(lx+104,y+10,l,{'font-size':fit(l,lw-190,28),'font-weight':700,fill:C.ink,'font-family':i>1?MONO:undefined})+
   S.rect({x:lx+lw-66,y:y-20,width:40,height:40,rx:6,fill:'none',stroke:C.ink,'stroke-width':3})+
   (done?S.path({d:`M${lx+lw-60} ${y} L${lx+lw-48} ${y+12} L${lx+lw-28} ${y-16}`,stroke:C.green,'stroke-width':6,fill:'none'}):''))});
 B.push({id:'checklist',x:lx,y:ly,width:lw+8,height:600});
 const RX=600,RW=1120;
 if(!part2){
  // terminal accumulating commands (s1, s3, s4)
  const tl=[];
  if(P[0]>0||after(ph,['s2','s3','s4'])){const u=typeU(P[0],.1,.6)+after(ph,['s2','s3','s4']);tl.push([pick(v,'# macOS／Linux','# macOS / Linux'),'#8fa3b8',u],['$ curl -LsSf https://astral.sh/uv/install.sh | sh','#f6d35b',u],[pick(v,'# Windows（PowerShell）','# Windows (PowerShell)'),'#8fa3b8',u],['> irm https://astral.sh/uv/install.ps1 | iex','#f6d35b',u])}
  if(P[2]>0||P[3]>0){const u=typeU(P[2],.15,.75)+(P[3]>0?1:0);tl.push(['$ codex mcp add blender -- uvx mcp-for-blender','#f6d35b',u],[P[2]>.8||P[3]>0?pick(v,'# 設定寫進 ~/.codex/config.toml','# saved to ~/.codex/config.toml'):'','#8fa3b8',1])}
  if(P[3]>0){const u=typeU(P[3],.05,.35);tl.push(['$ codex mcp list','#f6d35b',u],['  Name     Command  Args             …  Status','#c9ccd2',typeU(P[3],.35,.4)],['  blender  uvx      mcp-for-blender  …  enabled','#e8e6df',typeU(P[3],.45,.5)])}
  if(tl.length){const th=P[1]>0&&P[2]<=0?250:584;s+=term(RX,10,RW,th,tl.slice(-9),21,'Terminal');B.push({id:'term',x:RX,y:10,width:RW+8,height:th+8})}
  if(P[3]>.5)s+=S.rect({x:RX+14,y:10+70+(tl.length-1)*21*1.55-26,width:RW-28,height:34,rx:4,fill:C.green,opacity:.28});
  // s2: Blender window with the sidebar tab and the start button
  if(P[1]>0&&P[2]<=0){const u=clamp(P[1]/.2),x=RX,y=286,w=RW,h=314;
   s+=fade(u,S.rect({x,y,width:w,height:h,rx:8,fill:'#2b2b2b'})+S.rect({x,y,width:w,height:40,rx:8,fill:'#1f1f1f'})+S.text(x+20,y+28,pick(v,'Blender 3D 視窗 → 按 N 開側邊欄','Blender 3D viewport → press N for the sidebar'),{'font-size':21,fill:'#e6e6e6','font-weight':700})+
    S.rect({x:x+16,y:y+54,width:w-420,height:h-70,fill:'#3a3a3a'})+
    S.rect({x:x+w-396,y:y+54,width:340,height:h-70,rx:4,fill:'#333'})+S.text(x+w-376,y+92,'MCP for Blender',{'font-size':24,'font-weight':800,fill:'#eee'})+
    S.text(x+w-376,y+130,'Port: 9876',{'font-size':20,fill:'#bbb','font-family':MONO})+
    S.rect({x:x+w-376,y:y+156,width:300,height:50,rx:6,fill:P[1]>.6?'#5aae4e':'#4772b3'})+S.text(x+w-226,y+189,P[1]>.6?pick(v,'執行中…','Running…'):'Start MCP Server',{'font-size':22,'font-weight':700,fill:'#fff','text-anchor':'middle'})+
    S.rect({x:x+w-56,y:y+54,width:40,height:150,rx:4,fill:'#444'})+S.text(x+w-30,y+130,'MCP',{'font-size':16,fill:'#eee','text-anchor':'middle',transform:`rotate(90 ${x+w-30} ${y+130})`})+
    S.text(x+40,y+h-30,pick(v,'或：uvx mcp-for-blender install-addon','or: uvx mcp-for-blender install-addon'),{'font-size':20,fill:'#cfcfcf','font-family':MONO}),8);
   if(P[1]>.35&&P[1]<.7){const k=(P[1]-.35)/.35;s+=S.circle({cx:x+w-226,cy:y+181,r:20+k*30,fill:'none',stroke:C.sticky,'stroke-width':4,opacity:(1-k).toFixed(3)})}
   B.push({id:'bl-side',x,y,width:w+8,height:h})}
  if(P[0]<=0&&!after(ph,['s1','s2','s3','s4']))s+=fade(clamp(ph('s0')/.3),S.text(RX+RW/2,300,pick(v,'四步，接上 Blender','Four steps to Blender'),{'font-size':52,'font-weight':800,fill:C.kraftD,'text-anchor':'middle'}),10);
 }else{
  // part 2: config.toml + first read-only question
  const cu=clamp(cfg/.2)+after(ph,['first','why']);
  s+=fade(clamp(cu),term(RX,10,560,250,[['[mcp_servers.blender]','#f6d35b'],['command = "uvx"','#e8e6df'],['args = ["mcp-for-blender"]','#e8e6df']],22,'~/.codex/config.toml'),8);
  B.push({id:'cfg',x:RX,y:10,width:568,height:260});
  const ap=[pick(v,'桌面版','Desktop app'),'CLI',pick(v,'IDE 擴充','IDE extension')];
  ap.forEach((a,i)=>{const u=clamp((cfg-.45-i*.12)/.2)+after(ph,['first','why']);if(u<=0)return;const x=RX+600+i*180,y=40;
   s+=fade(clamp(u),card(x,y,160,96,{fill:C.tealL})+S.text(x+80,y+58,a,{'font-size':fit(a,140,24),'font-weight':700,fill:C.ink,'text-anchor':'middle'}),8)});
  if(cfg>.6||first>0)s+=fade(clamp((cfg-.6)/.3)+(first>0?1:0),S.text(RX+860,180,pick(v,'↑ 共用同一份設定','↑ all share one config'),{'font-size':26,'font-weight':800,fill:C.teal,'text-anchor':'middle'}),0);
  B.push({id:'apps',x:RX+600,y:30,width:520,height:170});
  if(first>0||why>0){const x=RX,y=300,w=RW,h=300,q=pick(v,'場景裡現在有哪些物件？','What objects are in the scene right now?');
   s+=card(x,y,w,h,{fill:C.paper})+S.rect({x,y,width:w,height:42,rx:4,fill:C.teal})+S.text(x+20,y+30,'Codex',{'font-size':22,'font-weight':800,fill:'#fff'});
   s+=fade(clamp(first/.2)+(why>0?1:0),S.rect({x:x+w-tw(q,28)-80,y:y+64,width:tw(q,28)+50,height:58,rx:18,fill:C.tealL})+S.text(x+w-55,y+103,q,{'font-size':28,'font-weight':700,fill:C.ink,'text-anchor':'end'}),8);
   const ans=pick(v,'場景有 3 個物件：Cube、Camera、Light','3 objects: Cube, Camera, Light');
   s+=fade(clamp((first-.55)/.25)+(why>0?1:0),S.rect({x:x+24,y:y+142,width:tw(ans,26)+50,height:56,rx:18,fill:C.paper2,stroke:'#d8ccb6'})+S.text(x+48,y+180,ans,{'font-size':26,fill:C.ink})+
    S.text(x+48,y+232,pick(v,'（Blender 預設場景，唯讀查詢，不改任何東西）','(Blender default scene — read-only, nothing changed)'),{'font-size':20,fill:C.muted}),8);
   if(why>0)s+=fade(clamp(why/.25),stamp(x+w-200,y+240,pick(v,'先看，再動手','Look first, then act'),30,-4,C.green),0);
   B.push({id:'chat',x,y,width:w+8,height:h+10})}
 }
 return s;
}

// ── 05 comparison table ──
function compare(scene,t,B,v){
 const ph=phaser(scene,t),task=ph('task'),cb=ph('colbg'),cc=ph('colcomm'),co=ph('coloff'),same=ph('same'),pick2=ph('pick');
 let s='';const X0=0,HW=250,CW=490,RH=64,Y0=8;
 const heads=[[pick(v,'背景腳本','Background script'),C.kraftD],[pick(v,'MCP for Blender（社群）','MCP for Blender (community)'),C.stamp],[pick(v,'Blender Lab MCP（官方）','Blender Lab MCP (official)'),C.teal]];
 const rows=[[pick(v,'Blender 開著？','Blender open?'),[pick(v,'不用（-b 背景）','No (-b background)'),pick(v,'要','Yes'),pick(v,'要','Yes')]],
  [pick(v,'外掛','Add-on'),[pick(v,'不需要','None'),pick(v,'社群外掛 + uvx','Community add-on + uvx'),pick(v,'官方擴充（v1.0.3）','Official extension (v1.0.3)')]],
  [pick(v,'Blender 版本','Blender version'),[pick(v,'依腳本用到的 API','Depends on the API used'),pick(v,'3.0 以上','3.0+'),pick(v,'5.1 以上','5.1+')]],
  [pick(v,'即時看見','See it live'),[pick(v,'否，看輸出檔','No — check output files'),pick(v,'是（look 截圖）','Yes (look screenshots)'),pick(v,'是','Yes')]],
  [pick(v,'維護者','Maintainer'),[pick(v,'你自己','You'),'Siddharth Ahuja',pick(v,'Blender 團隊','Blender team')]],
  [pick(v,'注意','Watch out'),[pick(v,'看不到過程','No live view'),pick(v,'9876 埠無密碼；先存檔','Port 9876 has no password'),pick(v,'執行 AI 程式無防護','Runs AI code unguarded')]]];
 const ty=Y0+70+rows.length*RH;
 const tu=clamp(task/.25)+after(ph,['colbg','colcomm','coloff','same','pick']);
 if(tu>0){s+=fade(clamp(tu),card(X0,Y0,HW+3*CW,ty-Y0+6,{fill:C.paper})+rows.map(([r],i)=>S.text(X0+20,Y0+70+i*RH+42,r,{'font-size':fit(r,HW-30,26),'font-weight':700,fill:C.sub})+(i?S.rect({x:X0+12,y:Y0+70+i*RH,width:HW+3*CW-24,height:1.5,fill:C.line}):'')).join(''),0);
  B.push({id:'table',x:X0,y:Y0,width:HW+3*CW+8,height:ty-Y0+14})}
 [cb,cc,co].forEach((u0,c)=>{const u=clamp(u0/.2)+after(ph,[['colcomm','coloff','same','pick'],['coloff','same','pick'],['same','pick']][c]);if(u<=0)return;const x=X0+HW+c*CW;
  const active=u0>0&&u0<1;
  s+=fade(clamp(u),(active?S.rect({x:x+4,y:Y0+6,width:CW-8,height:ty-Y0-6,rx:6,fill:C.marker,opacity:.35}):'')+
   S.rect({x:x+10,y:Y0+12,width:CW-20,height:50,rx:6,fill:heads[c][1]})+S.text(x+CW/2,Y0+46,heads[c][0],{'font-size':fit(heads[c][0],CW-40,26),'font-weight':800,fill:'#fff','text-anchor':'middle'})+
   rows.map(([,vals],i)=>S.text(x+CW/2,Y0+70+i*RH+42,vals[c],{'font-size':fit(vals[c],CW-30,26),fill:i===5?C.stamp:C.ink,'text-anchor':'middle','font-weight':i===5?700:400})).join(''),8)});
 // same: highlight the shared core; pick: rule of thumb
 if(same>0||pick2>0){const u=clamp(same/.2)+(pick2>0?1:0),txt=pick(v,'三種做法，最後都是執行 bpy；差別在 Blender 開不開、看不看得到','All three run bpy; they differ in whether Blender is open and visible');
  s+=fade(clamp(u),S.rect({x:X0+20,y:ty+18,width:HW+3*CW-40,height:54,rx:8,fill:C.tealL})+S.text(X0+(HW+3*CW)/2,ty+54,txt,{'font-size':fit(txt,HW+3*CW-80,26),'font-weight':700,fill:C.ink,'text-anchor':'middle'}),6);
  B.push({id:'same',x:X0+20,y:ty+18,width:HW+3*CW-40,height:54})}
 if(pick2>0){const a=pick(v,'重複跑、批次 → 背景腳本','Repeat & batch → background script'),b=pick(v,'邊看邊改 → MCP','Watch & tweak → MCP');
  s+=fade(clamp(pick2/.25),stamp(X0+HW+CW/2+60,ty+102,a,24,-2,C.kraftD),4)+fade(clamp((pick2-.3)/.25),stamp(X0+HW+CW*2+60,ty+102,b,24,-2,C.teal),4)}
 return s;
}

// ── 06 application 1: one sentence → actual Blender renders (demo) ──
function app1(scene,t,B,v){
 const ph=phaser(scene,t),pr=ph('problem'),pc=ph('process'),rs=ph('result'),it=ph('iter'),lm=ph('limit');
 let s='';
 const req=pick(v,'做一個低多邊形的書房角落：木桌、木凳、檯燈，暖色燈光，算一張圖','A low-poly study corner: wooden desk, stool, desk lamp, warm light — render one image');
 s+=drop(clamp(pr/.15)+after(ph,['process','result','iter','limit']),250,80,-2,sticky(0,0,520,190,-1.5,S.text(20,38,pick(v,'需求','Request'),{'font-size':24,'font-weight':800,fill:C.stamp})+para(20,82,req,480,isEn(v)?24:27,{'font-weight':700,fill:C.ink})),-20);
 B.push({id:'req',x:0,y:0,width:536,height:206});
 const parts=[[pick(v,'物件','Objects'),'primitive_cube_add(…)'],[pick(v,'材質','Materials'),'materials.new("Wood")'],[pick(v,'燈光','Lights'),'light_add(type="POINT")'],[pick(v,'相機','Camera'),'camera_add(…)']];
 parts.forEach(([a,b],i)=>{const u=clamp((pc-.08-i*.17)/.2)+after(ph,['result','iter','limit']);if(u<=0)return;const x=(i%2)*262,y=236+Math.floor(i/2)*124;
  s+=fade(clamp(u),card(x,y,250,108,{fill:C.paper})+S.text(x+16,y+40,`${i+1}. ${a}`,{'font-size':26,'font-weight':800,fill:C.ink})+S.text(x+16,y+80,b,{'font-size':fit(b,220,17),fill:C.teal,'font-family':MONO}),10)});
 if(pc>0||after(ph,['result','iter','limit']))B.push({id:'parts',x:0,y:236,width:520,height:240});
 if(pc>.5||after(ph,['result','iter','limit']))s+=fade(clamp((pc-.5)/.3)+after(ph,['result','iter','limit']),S.text(0,530,pick(v,'示範：腳本由本片撰寫，','Demo: script written for this video,'),{'font-size':21,fill:C.muted})+S.text(0,560,pick(v,'結果為 Blender 5.2.1 實際執行','results actually rendered in Blender 5.2.1'),{'font-size':21,fill:C.muted}),0);
 // the two renders: v1 on the left, v2 on the right (persistent <img> layer; frames drawn in SVG)
 const W=550,H=309,X1=572,X2=1162,Y=60;
 const p1=clamp(rs/.2)+after(ph,['iter','limit']),p2=clamp((it-.35)/.25)+after(ph,['limit']);
 // the photo sits under the SVG, so the white mat is a frame with a hole
 const R=(a,b,w,h)=>`M${a} ${b} H${a+w} V${b+h} H${a} Z`;
 const frame=(x,y,u,lab,col)=>u<=0?'':fade(clamp(u),S.path({d:R(x-10,y-10,W+20,H+64)+R(x,y,W,H),fill:'#fff','fill-rule':'evenodd',stroke:'#ddd'})+S.text(x+W/2,y+H+40,lab,{'font-size':fit(lab,W-20,22),'font-weight':700,fill:col,'text-anchor':'middle'}),0);
 s+=frame(X1,Y,p1,pick(v,'第一版：物件對了，光線偏冷、檯燈沒亮','v1: right objects, cool light, lamp off'),C.ink);
 s+=frame(X2,Y,p2,pick(v,'第二版：「燈光暖一點，檯燈要亮」','v2: "warmer light, lamp on"'),C.green);
 if(p1>0){PHOTOS.push({src:'img/study_v1.jpg',x:X1,y:Y,w:W,h:H,o:clamp(p1)});B.push({id:'v1',x:X1-10,y:Y-10,width:W+20,height:H+64})}
 if(p2>0){PHOTOS.push({src:'img/study_v2.jpg',x:X2,y:Y,w:W,h:H,o:clamp(p2)});B.push({id:'v2',x:X2-10,y:Y-10,width:W+20,height:H+64})}
 if(it>0&&it<.6||(it>0&&p2<=0)){const u=clamp(it/.2);s+=fade(u,sticky(X2+80,Y+90,400,110,3,S.text(X2+100,Y+138,pick(v,'燈光暖一點，','Warmer light,'),{'font-size':30,'font-weight':800,fill:C.ink})+S.text(X2+100,Y+178,pick(v,'檯燈要亮','lamp on'),{'font-size':30,'font-weight':800,fill:C.ink})),-10)}
 // limit: red pen around the odd shade shadow on the wall (render px 490–840 × 0–170 → scaled)
 if(lm>0){const k=W/1280,cx=X2+665*k,cy=Y+80*k;s+=penCircle(cx,cy,190*k+20,95*k+14,clamp(lm/.35));
  const n=pick(v,'牆上一大片怪影子','Odd shadow on the wall');s+=fade(clamp((lm-.25)/.25),S.rect({x:cx-tw(n,26)/2-14,y:Y+H+80,width:tw(n,26)+28,height:44,rx:4,fill:C.paper,stroke:C.stamp})+S.text(cx,Y+H+111,n,{'font-size':26,'font-weight':800,fill:C.stamp,'text-anchor':'middle'}),6);
  s+=fade(clamp((lm-.55)/.3),stamp(X1+W/2,Y+H+102,pick(v,'比例、美感、細節：要人判斷','Proportion, taste, detail: human call'),26,-2,C.ink),0)}
 return s;
}

// ── 07 application 2: batch rename (measured) + safety ──
function app2(scene,t,B,v){
 const ph=phaser(scene,t),me=ph('messy'),ak=ph('ask'),rs=ph('result'),sf=ph('safe');
 let s='';
 // outliner column (left) with names that flip from Cube.### to Book_### in a wave
 const OX=0,OY=0,OW=330,OH=600;
 s+=S.rect({x:OX,y:OY,width:OW,height:OH,rx:8,fill:'#2b2b2b'})+S.text(OX+18,OY+38,pick(v,'物件清單（120）','Outliner (120)'),{'font-size':24,'font-weight':700,fill:'#e6e6e6'});
 const wave=E.inout(clamp((ak-.35)/.6))+after(ph,['result','safe']);
 const scroll=lerp(0,22*46,E.inout(clamp(me/.9)))*(1-clamp(wave))+0;
 for(let i=0;i<11;i++){const idx=Math.floor(scroll/46)+i,yy=OY+64+i*48-(scroll%46);if(yy<OY+56||yy>OY+OH-48)continue;
  const renamed=wave*12>i;const name=renamed?`Book_${String(idx+1).padStart(3,'0')}`:(idx?`Cube.${String(idx).padStart(3,'0')}`:'Cube');
  s+=S.rect({x:OX+10,y:yy,width:OW-20,height:40,rx:4,fill:renamed?'#3d4a3f':'#3a3a3a'})+S.rect({x:OX+22,y:yy+12,width:16,height:16,rx:3,fill:renamed?'#c2483a':'#f0a35a'})+S.text(OX+50,yy+28,name,{'font-size':22,fill:'#eee','font-family':MONO})}
 B.push({id:'outliner',x:OX,y:OY,width:OW+8,height:OH+8});
 // book grid: 12 × 10 spines, grey → red cover as the wave passes
 const GX=372,GY=10,cw=30,chh=44;
 for(let i=0;i<120;i++){const c=i%12,r=Math.floor(i/12),x=GX+c*(cw+6),y=GY+r*(chh+8),on=wave*120>i;
  s+=S.rect({x,y,width:cw,height:chh-(i*7%9),rx:2,fill:on?'#9e2f24':'#9a9a9a',opacity:me>0||ak>0||rs>0||sf>0?1:.5})}
 B.push({id:'grid',x:GX,y:GY,width:12*(cw+6),height:10*(chh+8)});
 // request note
 const rq=pick(v,'依位置排序 → Book_001–Book_120，同一材質，匯出 GLB','Sort by position → Book_001–120, one material, export GLB');
 if(ak>0||after(ph,['result','safe'])){const u=clamp(ak/.2)+after(ph,['result','safe']);s+=drop(clamp(u),1110,80,2,sticky(830,34,560,140,1.5,S.text(850,72,pick(v,'請 Codex','Ask Codex'),{'font-size':24,'font-weight':800,fill:C.stamp})+para(850,116,rq,520,isEn(v)?23:26,{'font-weight':700,fill:C.ink})),-6);B.push({id:'ask',x:826,y:28,width:576,height:150})}
 // measured result
 if(rs>0||sf>0){const u=clamp(rs/.2)+(sf>0?1:0),x=830,y=186,w=880,h=170;
  const stats=[['13.4 s',pick(v,'背景模式（含啟動）','background mode incl. startup')],['120',pick(v,'個物件改名','objects renamed')],['176 KB','books.glb']];
  s+=fade(clamp(u),card(x,y,w,h,{fill:C.paper})+stats.map(([a,b],i)=>{const sx=x+30+i*290;return S.text(sx,y+80,a,{'font-size':52,'font-weight':900,fill:C.teal})+S.text(sx,y+122,b,{'font-size':fit(b,270,22),fill:C.sub})}).join('')+
   S.text(x+30,y+156,pick(v,'實測：Blender 5.2.1 LTS，2026-10-11，本機 Windows','Measured: Blender 5.2.1 LTS, 2026-10-11, local Windows'),{'font-size':19,fill:C.muted}),8);B.push({id:'stats',x,y,width:w+8,height:h+10})}
 // three safety habits
 if(sf>0){const items=[[pick(v,'① 先存檔','① Save first'),'Ctrl + S'],[pick(v,'② 社群版 safe mode','② Community safe mode'),'BLENDER_MCP_SAFE_MODE=1'],[pick(v,'③ Codex 核准模式','③ Codex approval mode'),'default_tools_approval_mode = "writes"']];
  items.forEach(([a,b],i)=>{const u=clamp((sf-.1-i*.22)/.18);if(u<=0)return;const x=830,y=384+i*74,w=880;
   s+=fade(u,S.rect({x,y,width:w,height:62,rx:8,fill:i===2?C.tealL:C.paper2,stroke:'#d8ccb6'})+S.text(x+18,y+41,a,{'font-size':fit(a,300,25),'font-weight':800,fill:C.ink})+S.text(x+330,y+40,b,{'font-size':fit(b,w-350,21),fill:C.stamp,'font-family':MONO}),8)});
  B.push({id:'safe',x:830,y:384,width:888,height:214})}
 return s;
}

// ── 08 outlook + recap ──
function outlook(scene,t,B,v){
 const ph=phaser(scene,t),an=ph('ann'),op=ph('open'),inf=ph('infer'),rc=ph('recap'),tr=ph('try');
 let s='';const W=544,G=44;
 const cols=[[an,pick(v,'已公布','Announced'),C.green,[pick(v,'Blender 官方 MCP 已上架','Official Blender MCP is out'),pick(v,'Anthropic 捐款支持','Anthropic donated to support'),pick(v,'Blender 的 Python API','Blender\'s Python API')],'2026-04'],
  [op,pick(v,'未解問題','Open problems'),C.stamp,[pick(v,'靠截圖、文字理解 3D','3D seen via screenshots & text'),pick(v,'深度、比例易誤判','depth & scale misjudged'),pick(v,'直接執行程式的安全風險','risk of running code directly')],''],
  [inf,pick(v,'推測','Inference'),C.pen,[pick(v,'更多創作軟體開放 MCP','More creative tools add MCP'),pick(v,'「說、看、改」','"say, see, fix"'),pick(v,'成為常見工作方式','becomes a common workflow')],pick(v,'截至 2026-10','as of 2026-10')]];
 cols.forEach(([u0,h,col,lines,note],i)=>{const u=clamp(u0/.2)+after(ph,[['open','infer','recap','try'],['infer','recap','try'],['recap','try']][i]);if(u<=0)return;const x=i*(W+G),y=34,hh=280;
  s+=drop(clamp(u),x+W/2,y+hh/2,i===1?1:-1,card(x,y,W,hh,{fill:C.paper,stroke:i===2?col:undefined})+S.rect({x,y,width:W,height:54,rx:4,fill:col,opacity:i===2?.85:1})+S.text(x+22,y+38,h,{'font-size':28,'font-weight':800,fill:'#fff'})+
   (note?S.text(x+W-18,y+37,note,{'font-size':20,fill:'#fff','text-anchor':'end'}):'')+lines.map((l,j)=>S.text(x+26,y+112+j*58,l,{'font-size':fit(l,W-52,28),fill:C.ink,'font-weight':j===1&&i===2?800:500})).join(''),-20);
  B.push({id:'col'+i,x,y:y-4,width:W+8,height:hh+14})});
 // recap: the loop as a strip of six chips
 if(rc>0||tr>0){const items=pick(v,['一句話','Python','MCP','Blender 執行','看截圖','再修正'],['One sentence','Python','MCP','Blender runs','Screenshot','Fix']);
  const y=340,cw=230,gap=46,x0=(1728-(6*cw+5*gap))/2;
  items.forEach((it,i)=>{const u=clamp((rc-i*.12)/.15)+(tr>0?1:0);if(u<=0)return;const x=x0+i*(cw+gap);
   s+=fade(clamp(u),S.rect({x,y,width:cw,height:76,rx:38,fill:i===5?C.tealL:C.paper,stroke:C.ink,'stroke-width':2.5})+S.text(x+cw/2,y+48,it,{'font-size':fit(it,cw-30,28),'font-weight':800,fill:C.ink,'text-anchor':'middle'})+
    (i<5?S.poly([[x+cw+10,y+30],[x+cw+34,y+38],[x+cw+10,y+46]],{fill:C.ink}):''),6)});
  if(rc>.75||tr>0)s+=fade(clamp((rc-.75)/.2)+(tr>0?1:0),S.path({d:`M${x0+5*(cw+gap)+cw/2} ${y+80} C ${x0+5*(cw+gap)+cw/2} ${y+128}, ${x0+cw/2} ${y+128}, ${x0+cw/2} ${y+84}`,fill:'none',stroke:C.stamp,'stroke-width':4,'stroke-dasharray':'10 8'})+S.poly([[x0+cw/2-9,y+96],[x0+cw/2,y+80],[x0+cw/2+9,y+96]],{fill:C.stamp}),0);
  B.push({id:'recap',x:x0,y,width:6*cw+5*gap,height:140})}
 if(tr>0){const q=pick(v,'試試看：「場景裡有幾個物件？」','Try it: "How many objects are in my scene?"');
  s+=drop(clamp(tr/.25),864,530,-1,sticky(864-tw(q,32)/2-40,490,tw(q,32)+80,96,-1,S.text(864,550,q,{'font-size':32,'font-weight':800,fill:C.ink,'text-anchor':'middle'})),-14);B.push({id:'try',x:864-tw(q,32)/2-44,y:484,width:tw(q,32)+96,height:112})}
 return s;
}

function title(scene,t){return S.text(864,300,scene.title||'',{'font-size':60,'font-weight':800,fill:C.ink,'text-anchor':'middle'})}
const SCENES={origin,twoways,loop,steps,compare,app1,app2,outlook,title};
