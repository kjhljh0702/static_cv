import {visualCopy,describeSource,introBlueprint} from './swarm-blueprint.js?v=20261111.1';
import {scheduleJobs} from './swarm-scheduler.js?v=20261118.1';

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

  let enabled=localStorage.getItem('cv-swarm-enabled')!=='false',ready=false,frame=0,intro=false,introEnd=0,scan=true;
  let sources=[],completed=new WeakSet();const jobs=[];
  const colors=['#8fc6ff','#a8dfce','#c6b4f3','#e6c08c','#a1bddb','#b8cfff'];
  const agents=colors.map(color=>({color}));
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
  function makeJob(descriptor,owner) {
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
    const duration=Math.round((kind==='text'?(font>35?810:650):kind==='image'?720:480)*1.2);
    const job={...descriptor,owner,node,final,draft,caret,font,family:computed.fontFamily,text:element.innerText||element.textContent||'',spacing:(parseFloat(computed.letterSpacing)||0)/font,start:Infinity,duration,slot:-1,done:false,step:-1,pressAt:-Infinity};
    jobs.push(job);return job;
  }
  function recordSchedule(prepared) {
    for(const job of prepared){job.node.dataset.worker=String(job.slot);job.node.dataset.start=String(job.start);job.node.dataset.end=String(job.start+job.duration);}
  }
  function beginIntro() {
    if(!ready||!allowed())return;
    stop(false);collect();intro=true;surface.hidden=false;surface.dataset.mode='intro';root.dataset.swarmPhase='background';skip.hidden=false;
    const actors=coarse.matches?3:6;
    introBlueprint().forEach(descriptor=>makeJob(descriptor,null));
    const now=performance.now();scheduleJobs(jobs,[],now+140,actors);recordSchedule(jobs);
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
      describeSource(source).forEach(descriptor=>prepared.push(makeJob(descriptor,source)));
      root.dataset.swarmPhase='building';
    }
    const start=Math.max(now,performance.now())+40;
    scheduleJobs(prepared,jobs.filter(job=>!prepared.includes(job)),start,coarse.matches?3:6);recordSchedule(prepared);
  }
  function drawFrame(r,progress,color) {
    const p=clamp(progress),x=r.left,y=r.top,width=r.width*p,height=r.height*p;
    ctx.strokeStyle=color;ctx.lineWidth=1;ctx.globalAlpha=.8;
    ctx.strokeRect(x,y,width,height);
    ctx.fillStyle=color;
    for(const [cx,cy] of [[x,y],[x+width,y],[x,y+height],[x+width,y+height]])ctx.fillRect(cx-2,cy-2,4,4);
    ctx.globalAlpha=1;return{x:x+width,y:y+height};
  }
  function editBounds(r,color) {
    ctx.strokeStyle=color;ctx.lineWidth=1;ctx.globalAlpha=.55;ctx.strokeRect(r.left,r.top,r.width,r.height);ctx.globalAlpha=1;
  }
  function markStep(job,step,now) {
    if(step!==job.step){job.step=step;job.pressAt=now;}
  }
  function badge(r,text,color) {
    if(innerWidth<600)return null;
    ctx.font='10px ui-monospace,monospace';const width=ctx.measureText(text).width+16;
    const x=Math.min(innerWidth-width-8,Math.max(8,r.left)),y=Math.max(30,r.top-28);
    ctx.fillStyle='#102b45';ctx.fillRect(x,y,width,21);ctx.strokeStyle=color;ctx.globalAlpha=.7;ctx.strokeRect(x,y,width,21);ctx.globalAlpha=1;ctx.fillStyle=color;ctx.fillText(text,x+8,y+14);
    return{x:x+width-9,y:y+11};
  }
  function paintJob(job,now) {
    const r=job.element.getBoundingClientRect();
    if(job.element.closest('[hidden]')||r.bottom<0||r.top>innerHeight||!job.element.isConnected){job.done=true;job.final.style.opacity='1';return null;}
    Object.assign(job.node.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
    if(now<job.start)return null;
    const progress=clamp((now-job.start)/job.duration),color=colors[job.slot];
    let target;
    if(job.kind==='text') {
      job.draft.hidden=false;
      const large=job.font>24,typeEnd=large?.48:.72,fontSwitch=large?.62:.85;
      const typeProgress=clamp(progress/typeEnd),typed=Math.floor(job.text.length*typeProgress);
      job.draft.firstChild.textContent=job.text.slice(0,typed);
      const fontProgress=clamp((progress-.5)/.44),sizes=[Math.min(14,job.font),job.font*.55,job.font*.78,job.font];
      const step=Math.min(3,Math.floor(fontProgress*4)),size=Math.max(10,large?sizes[step]:job.font);
      job.draft.style.fontSize=`${size}px`;job.draft.style.letterSpacing=`${size*job.spacing}px`;job.draft.style.fontFamily=progress<fontSwitch?'ui-monospace,monospace':job.family;
      job.draft.firstChild.style.background=progress>typeEnd&&progress<fontSwitch+.05?'#417ce958':'transparent';
      job.caret.hidden=progress>=typeEnd;
      if(progress<typeEnd){
        const caret=job.caret.getBoundingClientRect();
        target={x:Math.min(r.right,caret.left),y:Math.min(r.bottom,caret.top+Math.min(caret.height,24)/2),role:'Type text',kind:'ibeam'};
        badge(r,'Text · typing',color);
      } else {
        const textBox=job.draft.firstChild.getBoundingClientRect();
        const bounds={left:r.left,top:r.top,width:Math.min(r.width,textBox.width),height:Math.min(r.height,textBox.height)};
        editBounds(bounds,color);ctx.fillStyle=color;ctx.fillRect(bounds.left+bounds.width-3,bounds.top+bounds.height-3,6,6);
        target={x:bounds.left+bounds.width,y:bounds.top+bounds.height,role:'Resize type',kind:'resize'};
        const tool=badge(r,`${progress<fontSwitch?'Monospace':job.family.split(',')[0].replace(/['"]/g,'')} · ${Math.round(size)} px`,color);
        if((!large||progress<.64)&&tool)target={...tool,role:'Set font',kind:'arrow'};
        markStep(job,(large?step:0)+(progress<fontSwitch?0:4),now);
      }
      if(progress>=1){job.draft.hidden=true;job.final.style.opacity='1';}
    } else if(job.kind==='image') {
      const drag=clamp(progress/.4);
      if(progress<.4){
        target={...drawFrame(r,drag,color),role:'Draw image frame',kind:'crosshair'};
        badge(r,`Frame · ${Math.round(r.width*drag)} × ${Math.round(r.height*drag)}`,color);
      } else {
        editBounds(r,color);
        const drop=clamp((progress-.4)/.18),start={x:r.left+Math.min(r.width,80),y:Math.max(20,r.top-16)};
        const x=start.x+(r.width*.5+r.left-start.x)*drop,y=start.y+(r.height*.5+r.top-start.y)*drop;
        target={x,y,role:progress<.58?'Place image':'Fit image',kind:progress<.58?'arrow':'resize'};
        if(progress<.58){ctx.fillStyle=color;ctx.fillRect(x+14,y+10,44,22);ctx.fillStyle='#102238';ctx.font='10px ui-monospace,monospace';ctx.fillText('IMAGE',x+20,y+25);}
        const fit=clamp((progress-.58)/.42);
        if(progress>=.58){
          job.final.style.opacity='1';job.final.style.clipPath='none';job.final.style.transformOrigin='top left';job.final.style.transform=`scale(${.9+fit*.1})`;
          target={x:r.left+r.width*(.9+fit*.1),y:r.top+r.height*(.9+fit*.1),role:'Fit image',kind:'resize'};
          markStep(job,1,now);
        }
        badge(r,progress<.58?'Place image':'Fit to frame',color);
      }
    } else {
      target={...drawFrame(r,progress,color),role:job.kind==='frame'?'Draw layout':'Build component',kind:'crosshair'};
      job.final.style.opacity='1';job.final.style.clipPath=`inset(0 ${(1-progress)*100}% ${(1-progress)*100}% 0)`;
      badge(r,`${job.kind==='frame'?'Layout':'Component'} · ${Math.round(r.width*progress)} × ${Math.round(r.height*progress)}`,color);
    }
    if(progress>=1){job.done=true;job.final.style.opacity='1';job.final.style.clipPath='none';job.final.style.transform='none';if(job.draft)job.draft.hidden=true;return null;}
    return {...target,pressAge:now-job.pressAt,job};
  }
  function cursor(agent,target,index) {
    const {x,y}=target;
    // Cursor and the edit share an exact position, rather than chasing a separate animation.
    ctx.save();ctx.translate(x,y);ctx.fillStyle=agent.color;ctx.strokeStyle='#061320';ctx.lineWidth=1.3;
    if(target.kind==='ibeam'){ctx.strokeStyle=agent.color;ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(4,-8);ctx.moveTo(0,-8);ctx.lineTo(0,9);ctx.moveTo(-4,9);ctx.lineTo(4,9);ctx.stroke();}
    else if(target.kind==='crosshair'){ctx.strokeStyle=agent.color;ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.moveTo(0,-7);ctx.lineTo(0,7);ctx.stroke();}
    else if(target.kind==='resize'){ctx.strokeStyle=agent.color;ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.moveTo(-6,-1);ctx.lineTo(-6,-6);ctx.lineTo(-1,-6);ctx.moveTo(1,6);ctx.lineTo(6,6);ctx.lineTo(6,1);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(1,18);ctx.lineTo(6,13);ctx.lineTo(10,21);ctx.lineTo(14,19);ctx.lineTo(10,11);ctx.lineTo(17,10);ctx.closePath();ctx.fill();ctx.stroke();}
    if(target.pressAge>=0&&target.pressAge<100){ctx.strokeStyle=agent.color;ctx.globalAlpha=1-target.pressAge/100;ctx.beginPath();ctx.arc(0,0,3+target.pressAge*.05,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(innerWidth>600){ctx.font='9px ui-monospace,monospace';const label=`${target.role} ${String(index+1).padStart(2,'0')}`;ctx.fillRect(13,19,ctx.measureText(label).width+12,18);ctx.fillStyle='#092039';ctx.fillText(label,19,31);}
    ctx.restore();
  }
  function tick(now) {
    frame=0;if(!allowed()){stop();return;}
    ctx.clearRect(0,0,innerWidth,innerHeight);surface.hidden=canvas.hidden=false;
    queueVisible(now);
    const assigned=new Map();
    for(const job of jobs){if(job.done)continue;const target=paintJob(job,now);if(target)assigned.set(job.slot,target);}
    if(intro){root.dataset.swarmPhase=now<jobs[0]?.start?'background':'building';
      if(now>=introEnd){intro=false;surface.removeAttribute('data-mode');skip.hidden=true;jobs.filter(job=>!job.owner).forEach(job=>job.done=true);scan=true;}
    }
    for(const [index,target]of assigned)cursor(agents[index],target,index);
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
