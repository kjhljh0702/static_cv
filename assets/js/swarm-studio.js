import {visualCopy,describeSource,introBlueprint} from './swarm-blueprint.js?v=20261111.1';

/* Original DOM build choreography; no third-party swarm engine is bundled. */
export function initSwarm() {
  const root=document.documentElement,shell=document.querySelector('#cv-shell');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  const surface=document.createElement('div');surface.className='swarm-surface';surface.setAttribute('aria-hidden','true');surface.inert=true;
  const canvas=document.createElement('canvas');canvas.className='swarm-stage';canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const skip=document.createElement('button');skip.className='swarm-skip';skip.type='button';
  document.body.append(surface,canvas,skip);
  const controls=document.createElement('details');controls.className='swarm-controls';
  const summary=document.createElement('summary'),panel=document.createElement('div');panel.className='swarm-controls-panel';
  const caption=document.createElement('p'),toggle=document.createElement('button'),replay=document.createElement('button'),credit=document.createElement('a');
  toggle.type=replay.type='button';credit.href='https://github.com/DhvanilPatel/swarm-cursors';credit.target='_blank';credit.rel='noopener noreferrer';
  panel.append(caption,toggle,replay,credit);controls.append(summary,panel);shell.append(controls);

  let enabled=localStorage.getItem('cv-swarm-enabled')!=='false',ready=false,frame=0,last=0,intro=false,introEnd=0,scan=true,serial=0;
  let sources=[],completed=new WeakSet();const jobs=[];
  const colors=['#8fc6ff','#a8dfce','#c6b4f3','#e6c08c','#a1bddb','#b8cfff'];
  const agents=colors.map((color,index)=>({color,x:innerWidth*.5+index*15,y:innerHeight*.42,alpha:0}));
  const local=(en,ko)=>root.dataset.lang==='ko'?ko:en;
  const allowed=()=>enabled&&!reduced.matches&&root.dataset.view!=='metaverse'&&!document.hidden;
  const clamp=value=>Math.max(0,Math.min(1,value));
  function labels() {
    const on=enabled&&!reduced.matches;root.dataset.swarm=on?'on':'off';
    summary.textContent=local(`Swarm · ${on?'On':'Off'}`,`커서 스웜 · ${on?'켜짐':'꺼짐'}`);
    caption.textContent=local('Watch the CV assemble: layout, type, fonts, images.','레이아웃, 글자, 서체, 이미지가 빠르게 조립됩니다.');
    toggle.textContent=local(on?'Turn off':'Turn on',on?'끄기':'켜기');toggle.setAttribute('aria-pressed',String(on));toggle.disabled=reduced.matches;
    replay.textContent=local('Replay this view ↻','현재 화면 다시 그리기 ↻');replay.disabled=!on;
    credit.textContent=local('Inspired by swarm-cursors ↗','swarm-cursors에서 영감 ↗');skip.textContent=local('Skip build →','바로 보기 →');
  }
  function reveal(source) {source.removeAttribute('data-build-pending');source.dataset.buildComplete='true';}
  function removeJob(job) {job.node.remove();job.element.removeAttribute('data-swarm-building');}
  function stop(revealAll=true) {
    cancelAnimationFrame(frame);frame=0;intro=false;root.dataset.swarmPhase='ready';
    jobs.splice(0).forEach(removeJob);surface.replaceChildren();surface.hidden=canvas.hidden=skip.hidden=true;surface.removeAttribute('data-mode');
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(revealAll)sources.forEach(source=>{reveal(source);completed.add(source);});
  }
  function finishCurrent() {
    const owners=new Set(jobs.filter(job=>job.owner).map(job=>job.owner));
    owners.forEach(reveal);stop(false);scan=true;
  }
  function collect() {
    sources=[...document.querySelectorAll('#aboutScrub,#cv-shell .title,#cv-shell .xcard,#cv-shell .edu__item,#pcards .pcard,#skGrid .sk,#pubList .pub,#awardList .award,.credential-gallery .credential,#contactH,#mailBtn')];
    if(allowed())for(const source of sources) {
      if(completed.has(source))continue;
      if(source.getBoundingClientRect().bottom<0){completed.add(source);reveal(source);}else source.dataset.buildPending='true';
    }
    scan=true;
  }
  function resize() {
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    if(jobs.length)stop();
  }
  function makeJob(descriptor,owner,start,slot) {
    const {element,kind}=descriptor;
    const node=document.createElement('div');node.className='swarm-piece';node.dataset.kind=kind;node.dataset.source=element.id||element.tagName.toLowerCase();
    const final=visualCopy(element,descriptor.empty);final.style.opacity='0';node.append(final);
    let draft,caret;
    const computed=getComputedStyle(element),font=parseFloat(computed.fontSize)||14;
    if(kind==='text') {
      draft=document.createElement('div');draft.className='swarm-draft';caret=document.createElement('span');caret.className='swarm-caret';caret.textContent='▏';
      const typed=document.createElement('span');typed.className='swarm-typed';draft.append(typed,caret);draft.hidden=true;node.append(draft);
      Object.assign(draft.style,{color:computed.color,whiteSpace:'pre-wrap',lineHeight:String(Math.max(.95,Math.min(2,(parseFloat(computed.lineHeight)||font*1.4)/font))),fontWeight:computed.fontWeight});
    }
    surface.append(node);element.dataset.swarmBuilding='true';
    const duration=kind==='text'?(font>35?810:650):kind==='image'?720:480;
    const job={...descriptor,owner,node,final,draft,caret,font,family:computed.fontFamily,text:element.innerText||element.textContent||'',spacing:(parseFloat(computed.letterSpacing)||0)/font,start,duration,slot,done:false};
    jobs.push(job);return job;
  }
  function beginIntro() {
    if(!ready||!allowed())return;
    stop(false);collect();intro=true;surface.hidden=false;surface.dataset.mode='intro';root.dataset.swarmPhase='background';skip.hidden=false;
    const actors=coarse.matches?3:6;
    introBlueprint().forEach((descriptor,index)=>makeJob(descriptor,null,170+Math.floor(index/actors)*365+(index%actors)*38,index%actors));
    const now=performance.now();jobs.forEach(job=>job.start+=now);
    introEnd=Math.max(...jobs.map(job=>job.start+job.duration),now+500)+140;
    frame=requestAnimationFrame(tick);
  }
  function queueVisible(now) {
    if(!scan||intro)return;scan=false;
    const busyOwners=new Set(jobs.filter(job=>job.owner&&!job.done).map(job=>job.owner));
    const prepared=[];
    for(const source of sources) {
      if(completed.has(source)||source.closest('[hidden]')||!source.isConnected)continue;
      const r=source.getBoundingClientRect();
      if(r.bottom<0){completed.add(source);reveal(source);continue;}
      if(r.top>innerHeight*.92||r.bottom<70||r.width<3||r.height<3)continue;
      if(busyOwners.size>=(coarse.matches?1:2))break;
      completed.add(source);busyOwners.add(source);
      describeSource(source).forEach((descriptor,index)=>prepared.push(makeJob(descriptor,source,Math.floor(index/6)*280+index%6*45,(serial++)%agents.length)));
      root.dataset.swarmPhase='building';
    }
    const start=Math.max(now,performance.now())+40;prepared.forEach(job=>job.start+=start);
  }
  function drawBounds(r,progress,color) {
    const left=r.left-2,top=r.top-2,w=r.width+4,h=r.height+4,perimeter=2*(w+h),distance=clamp(progress)*perimeter;
    ctx.strokeStyle=color;ctx.lineWidth=1;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(left,top);
    let x=left,y=top;
    if(distance<=w){x+=distance;}else if(distance<=w+h){ctx.lineTo(left+w,top);x+=w;y+=distance-w;}else if(distance<=2*w+h){ctx.lineTo(left+w,top);ctx.lineTo(left+w,top+h);x+=w-(distance-w-h);y+=h;}else{ctx.lineTo(left+w,top);ctx.lineTo(left+w,top+h);ctx.lineTo(left,top+h);y+=h-(distance-2*w-h);}
    ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=1;return{x,y};
  }
  function badge(r,text,color) {
    if(innerWidth<600)return;
    ctx.font='10px ui-monospace,monospace';const width=ctx.measureText(text).width+16;
    const x=Math.min(innerWidth-width-8,Math.max(8,r.left)),y=Math.max(30,r.top-28);
    ctx.fillStyle='#102b45';ctx.fillRect(x,y,width,21);ctx.strokeStyle=color;ctx.globalAlpha=.7;ctx.strokeRect(x,y,width,21);ctx.globalAlpha=1;ctx.fillStyle=color;ctx.fillText(text,x+8,y+14);
  }
  function paintJob(job,now) {
    const r=job.element.getBoundingClientRect();
    if(job.element.closest('[hidden]')||r.bottom<0||r.top>innerHeight||!job.element.isConnected){job.done=true;job.final.style.opacity='1';return null;}
    Object.assign(job.node.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
    if(now<job.start)return null;
    const progress=clamp((now-job.start)/job.duration),color=colors[job.slot],edge=drawBounds(r,Math.min(1,progress*1.7),color);
    let target={...edge,role:'Layout',kind:'arrow'};
    if(job.kind==='text') {
      job.draft.hidden=false;
      const typed=Math.floor(job.text.length*clamp(progress/.48));job.draft.firstChild.textContent=job.text.slice(0,typed);
      const fontProgress=clamp((progress-.43)/.4),steps=[Math.min(14,job.font),job.font*.55,job.font*.78,job.font];
      const size=steps[Math.min(3,Math.floor(fontProgress*4))];
      job.draft.style.fontSize=`${Math.max(10,size)}px`;job.draft.style.letterSpacing=`${Math.max(10,size)*job.spacing}px`;job.draft.style.fontFamily=progress<.56?'ui-monospace,monospace':job.family;
      job.draft.firstChild.style.background=progress>.43&&progress<.57?'#417ce958':'transparent';
      job.caret.hidden=progress>.88;
      if(progress<.88){const caret=job.caret.getBoundingClientRect();target={x:caret.left,y:caret.top+Math.min(caret.height,24)/2,role:progress<.48?'Typing':'Typography',kind:progress<.48?'ibeam':'arrow'};}
      else {job.draft.hidden=true;job.final.style.opacity='1';target={x:r.right,y:r.bottom,role:'Align',kind:'arrow'};}
      badge(r,progress<.48?'Text · typing':`${progress<.56?'Monospace':job.family.split(',')[0].replace(/['"]/g,'')} · ${Math.round(size)} px`,color);
    } else if(job.kind==='image') {
      job.node.style.background=progress<.4?'#8ba9c315':'transparent';
      job.final.style.opacity=progress>.38?'1':'0';job.final.style.clipPath=`inset(0 0 ${(1-clamp((progress-.38)/.5))*100}% 0)`;
      badge(r,progress<.4?`Frame · ${Math.round(r.width*clamp(progress/.4))} × ${Math.round(r.height*clamp(progress/.4))}`:'Place image',color);target.role='Media';
    } else {
      job.final.style.opacity=progress>.45?'1':'0';
      badge(r,`${job.kind==='frame'?'Layout':'Component'} · ${Math.round(r.width)} × ${Math.round(r.height)}`,color);
    }
    if(progress>=1){job.done=true;job.final.style.opacity='1';job.final.style.clipPath='none';if(job.draft)job.draft.hidden=true;return null;}
    return target;
  }
  function cursor(agent,target,delta,index) {
    const damping=1-Math.exp(-delta*.023);agent.x+=(target.x-agent.x)*damping;agent.y+=(target.y-agent.y)*damping;
    ctx.save();ctx.translate(agent.x,agent.y);ctx.fillStyle=agent.color;ctx.strokeStyle='#061320';ctx.lineWidth=1.3;
    if(target.kind==='ibeam'){ctx.strokeStyle=agent.color;ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(4,-8);ctx.moveTo(0,-8);ctx.lineTo(0,9);ctx.moveTo(-4,9);ctx.lineTo(4,9);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1,18);ctx.lineTo(6,13);ctx.lineTo(10,21);ctx.lineTo(14,19);ctx.lineTo(10,11);ctx.lineTo(17,10);ctx.closePath();ctx.fill();ctx.stroke();}
    if(innerWidth>600){ctx.font='9px ui-monospace,monospace';const label=`${target.role} ${String(index+1).padStart(2,'0')}`;ctx.fillRect(15,20,ctx.measureText(label).width+12,18);ctx.fillStyle='#092039';ctx.fillText(label,21,32);}
    ctx.restore();
  }
  function tick(now) {
    frame=0;if(!allowed()){stop();return;}
    const delta=Math.min(50,now-last||16);last=now;
    ctx.clearRect(0,0,innerWidth,innerHeight);surface.hidden=canvas.hidden=false;
    queueVisible(now);
    const assigned=new Map();
    for(const job of jobs){if(job.done)continue;const target=paintJob(job,now);if(target)assigned.set(job.slot,target);}
    if(intro){root.dataset.swarmPhase=now<jobs[0]?.start?'background':'building';
      if(now>=introEnd){intro=false;surface.removeAttribute('data-mode');skip.hidden=true;jobs.filter(job=>!job.owner).forEach(job=>job.done=true);scan=true;}
    }
    for(const [index,target]of assigned)cursor(agents[index],target,delta,index);
    const owners=new Set(jobs.filter(job=>job.owner).map(job=>job.owner));
    for(const owner of owners)if(jobs.filter(job=>job.owner===owner).every(job=>job.done)){
      reveal(owner);for(let index=jobs.length-1;index>=0;index--)if(jobs[index].owner===owner)removeJob(jobs.splice(index,1)[0]);scan=true;
    }
    if(!intro)for(let index=jobs.length-1;index>=0;index--)if(!jobs[index].owner)removeJob(jobs.splice(index,1)[0]);
    if(jobs.length||intro||scan){frame=requestAnimationFrame(tick);}else{root.dataset.swarmPhase='ready';ctx.clearRect(0,0,innerWidth,innerHeight);canvas.hidden=surface.hidden=true;}
  }
  function wake() {if(ready&&allowed()&&!frame)frame=requestAnimationFrame(tick);}
  function reset() {stop();completed=new WeakSet();sources.forEach(source=>source.removeAttribute('data-build-complete'));collect();beginIntro();}
  toggle.onclick=()=>{enabled=!enabled;localStorage.setItem('cv-swarm-enabled',String(enabled));labels();if(enabled)reset();else stop();};
  replay.onclick=()=>{controls.open=false;reset();};skip.onclick=finishCurrent;
  addEventListener('portfolio-ready',()=>{ready=true;collect();if(allowed())beginIntro();else stop();});
  addEventListener('portfolio-rendered',()=>{stop();completed=new WeakSet();collect();labels();if(ready)beginIntro();});
  addEventListener('scroll',()=>{if(intro){intro=false;surface.removeAttribute('data-mode');skip.hidden=true;jobs.splice(0).forEach(removeJob);}scan=true;wake();},{passive:true});
  addEventListener('resize',()=>{resize();scan=true;wake();},{passive:true});
  document.addEventListener('pointerdown',event=>{if(controls.contains(event.target)||event.target===skip)return;if(jobs.length||intro)finishCurrent();},{capture:true,passive:true});
  document.addEventListener('focusin',event=>{const source=event.target.closest?.('[data-build-pending]');if(source){completed.add(source);reveal(source);jobs.filter(job=>job.owner===source).forEach(job=>job.done=true);}if(intro&&!controls.contains(event.target))finishCurrent();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else{scan=true;wake();}});
  reduced.addEventListener('change',()=>{labels();if(reduced.matches)stop();});
  new MutationObserver(()=>{labels();if(root.dataset.view==='metaverse')stop();else if(ready){scan=true;wake();}}).observe(root,{attributes:true,attributeFilter:['data-view','data-lang']});
  labels();resize();collect();surface.hidden=canvas.hidden=skip.hidden=true;
}
