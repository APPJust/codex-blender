// Interactive checks tied to the learning goal: (1) pick the road (background script vs. live MCP) for a need;
// (2) put the MCP loop in order.
(function(){
 const KEYS={bg:'背景腳本',mcp:'MCP 即時連線'};
 const TASKS=[
  {q:'每天晚上自動把 50 個 .blend 檔各算一張縮圖。',a:'bg',why:'批次、可重複、不需要看過程：用 blender -b -P 跑腳本最合適。'},
  {q:'一邊看視窗，一邊請 AI 把燈光調暖一點。',a:'mcp',why:'要即時看到結果再調整，Blender 開著、用 MCP 連線。'},
  {q:'每次提交程式，CI 自動把場景匯出成 GLB。',a:'bg',why:'放進自動化流程、沒有人在看畫面，背景腳本不需要外掛也不用開視窗。'},
  {q:'請 AI 看看場景哪裡怪，再動手修正。',a:'mcp',why:'需要截圖回饋（look）與多輪修正，正是 MCP 迴路。'}];
 const lab=document.getElementById('lab');if(!lab)return;
 let h='<h2>互動練習：這個需求該走哪條路？</h2><p class="fine">兩條路的核心都是讓 Blender 執行 bpy 程式；差別在 Blender 要不要開著、能不能即時看到結果。每題可重選。</p><div class="lab-grid">';
 TASKS.forEach((t,i)=>{h+=`<div class="lab-card"><p><strong>${i+1}.</strong> ${t.q}</p><div class="choices" role="group" aria-label="第 ${i+1} 題選項">`+
  Object.entries(KEYS).map(([k,l])=>`<button type="button" data-i="${i}" data-k="${k}" aria-pressed="false">${l}</button>`).join('')+`</div><p class="feedback" id="fb${i}" aria-live="polite"></p></div>`});
 lab.innerHTML=h+'</div>';
 lab.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const i=+b.dataset.i,t=TASKS[i],fb=document.getElementById('fb'+i);
  lab.querySelectorAll(`button[data-i="${i}"]`).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const ok=b.dataset.k===t.a;fb.className='feedback '+(ok?'ok':'bad');fb.textContent=ok?'正確！'+t.why:'再想想：需要即時看畫面嗎？要批次重複跑嗎？'});
 window.labInfo={keys:Object.keys(KEYS),answers:TASKS.map(t=>t.a)};
})();
// Second check: click the six steps of the MCP loop in order.
(function(){
 const ORDER=['一句話','Codex 寫成 Python','MCP 送進 Blender 外掛','外掛執行 bpy','看截圖檢查','再修正'];
 const SHUFFLED=[4,0,3,5,1,2];
 const lab=document.getElementById('lab');if(!lab)return;
 const box=document.createElement('div');
 box.innerHTML='<h2 style="margin-top:22px">互動練習二：排出 MCP 迴路</h2><p class="fine">依照發生順序點選六個步驟；點錯會提示，按「重來」可重新排。</p>'+
  '<div class="choices" id="loopChoices" role="group" aria-label="MCP 迴路步驟">'+SHUFFLED.map(i=>`<button type="button" data-o="${i}" aria-pressed="false">${ORDER[i]}</button>`).join('')+'</div>'+
  '<p class="lab-desc" id="loopSeq" aria-live="polite">（尚未選擇）</p><p class="feedback" id="loopFb" aria-live="polite"></p><button type="button" id="loopReset">重來</button>';
 lab.append(box);let seq=[];
 const seqEl=box.querySelector('#loopSeq'),fb=box.querySelector('#loopFb');
 function show(){seqEl.textContent=seq.length?seq.map(i=>ORDER[i]).join(' → '):'（尚未選擇）'}
 box.addEventListener('click',e=>{const b=e.target.closest('button[data-o]');if(!b||b.disabled)return;const o=+b.dataset.o;
  if(o!==seq.length){fb.className='feedback bad';fb.textContent=`再想想：第 ${seq.length+1} 步不是「${ORDER[o]}」。`;return}
  seq.push(o);b.disabled=true;b.setAttribute('aria-pressed','true');show();
  if(seq.length===ORDER.length){fb.className='feedback ok';fb.textContent='正確！說一句話 → 寫成 Python → MCP 傳送 → Blender 執行 → 看截圖 → 修正，然後再繞一圈。'}else{fb.className='feedback';fb.textContent=''}});
 box.querySelector('#loopReset').onclick=()=>{seq=[];box.querySelectorAll('button[data-o]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed','false')});fb.textContent='';show()};
})();
