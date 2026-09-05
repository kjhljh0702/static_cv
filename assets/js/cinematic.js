/* A lightweight projected orbital sculpture; no additional rendering library. */
export function cinematic() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('#hero');
  const field = document.createElement('div');
  field.className = 'hero-field'; field.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas'); field.append(canvas); hero.prepend(field);
  const coordinate = document.createElement('div'); coordinate.className = 'hero-coordinate';
  coordinate.setAttribute('aria-hidden', 'true');
  coordinate.innerHTML = 'RESEARCH PORTFOLIO <b>SEOUL, KR</b>'; hero.append(coordinate);
  const orbit = document.createElement('div'); orbit.className = 'contact-orbit';
  orbit.setAttribute('aria-hidden', 'true'); document.querySelector('#contact').prepend(orbit);
  const ids = ['hero','about','experience','education','projects','skills','publications','awards','contact'];
  const sections = ids.map(id => document.getElementById(id));
  const rail = document.createElement('nav'); rail.className = 'chapter-rail'; rail.setAttribute('aria-label','Page chapters');
  ids.forEach((id, i) => {
    const a = document.createElement('a'); a.href = id === 'hero' ? '#top' : `#${id}`;
    const label = document.createElement('span'); label.textContent = `${String(i+1).padStart(2,'0')} / ${id}`;
    a.append(label); a.setAttribute('aria-label', id); rail.append(a);
    if(i > 2 && i < 8) { const line = document.createElement('div'); line.className='section-trace'; line.setAttribute('aria-hidden','true'); sections[i].prepend(line); }
  });
  document.querySelector('#cv-shell').append(rail);
  const ctx = canvas.getContext('2d');
  let width=0, height=0, dpr=1, visible=true, frame=0, lastTime=0;
  let mx=0, my=0, px=0, py=0;
  const clamp = n => Math.max(0, Math.min(1,n));
  function size() { width=hero.clientWidth; height=hero.clientHeight; dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx?.setTransform(dpr,0,0,dpr,0,0); }
  new ResizeObserver(() => { size(); draw(lastTime); }).observe(hero); size();
  hero.addEventListener('pointermove',e=>{mx=(e.clientX/width-.5)*.24;my=(e.clientY/height-.5)*.18;},{passive:true});
  hero.addEventListener('pointerleave',()=>{mx=0;my=0;});
  const observer = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting; if(visible) schedule();});observer.observe(hero);
  const dots=Array.from({length:100},(_,i)=>{const y=1-2*(i+.5)/100;const r=Math.sqrt(1-y*y),a=i*2.39996323;return [Math.cos(a)*r,y,Math.sin(a)*r];});
  function draw(time=0) {
    if(!ctx) return;
    ctx.clearRect(0,0,width,height);
    px+=(mx-px)*.045; py+=(my-py)*.045;
    const t=reduced? .4:time*.00009;
    const radius=Math.min(width*.36,height*.44),cx=width*(width<900?.63:.64),cy=height*.45;
    const angle=t+px+scrollY*.00045,tilt=.35+py;
    const project=([x,y,z])=>{const X=x*Math.cos(angle)-z*Math.sin(angle),Z=x*Math.sin(angle)+z*Math.cos(angle); const Y=y*Math.cos(tilt)-Z*Math.sin(tilt),depth=y*Math.sin(tilt)+Z*Math.cos(tilt);const s=3/(3-depth*.4);return [cx+X*radius*s,cy+Y*radius*s,depth];};
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.3);glow.addColorStop(0,'#2464c916');glow.addColorStop(.6,'#254fff0d');glow.addColorStop(1,'#254fff00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let ring=0;ring<9;ring++) {
      ctx.beginPath();
      for(let j=0;j<=100;j++){const a=j/100*Math.PI*2,b=ring/9*Math.PI;const p=project([Math.cos(a)*Math.cos(b),Math.sin(a),Math.cos(a)*Math.sin(b)]);j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}
      ctx.strokeStyle=ring%3===0?'#8ebcff30':'#699dff16';ctx.lineWidth=.8;ctx.stroke();
    }
    const points=dots.map(project);
    points.forEach((p,i)=>{
      for(let j=i+1;j<points.length;j++){const q=points[j],dist=Math.hypot(p[0]-q[0],p[1]-q[1]);if(dist<radius*.21&&p[2]>0&&q[2]>0){ctx.strokeStyle=`rgba(122,180,255,${(1-dist/(radius*.21))*.17})`;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}}
      const alpha=.15+(p[2]+1)*.3;ctx.fillStyle=`rgba(170,214,255,${alpha})`;ctx.beginPath();ctx.arc(p[0],p[1],p[2]>0?1.7:1,0,Math.PI*2);ctx.fill();
    });
    for(let k=0;k<3;k++){const a=t*(2+k*.3)+k*2.1;const p=project([Math.cos(a)*1.12,Math.sin(a)*.7,Math.sin(a)*.85]);ctx.shadowColor='#72b6ff';ctx.shadowBlur=18;ctx.fillStyle='#d5ebff';ctx.beginPath();ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  }
  function tick(time){frame=0;if(document.hidden||!visible||reduced)return;if(time-lastTime>32){draw(time);lastTime=time;}schedule();}
  function schedule(){if(!frame&&!document.hidden&&visible&&!reduced)frame=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  let pending=false;
  function update(){pending=false;const vh=innerHeight;let active=0;
    sections.forEach((section,i)=>{const r=section.getBoundingClientRect();if(r.top<vh*.55)active=i;section.style.setProperty('--section-fill', reduced?1:clamp((vh-r.top)/(vh*.7)));});
    [...rail.children].forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const about=sections[1].getBoundingClientRect(),p=reduced?0:clamp(-about.top/Math.max(1,about.height-vh));
    sections[1].style.setProperty('--about-scale',.65+p*.75);sections[1].style.setProperty('--about-turn',`${p*100}deg`);
    const c=reduced?0:clamp((vh-sections[8].getBoundingClientRect().top)/(vh*1.5));orbit.style.setProperty('--contact-scale',.65+c*.5);orbit.style.setProperty('--contact-turn',`${c*70}deg`);
  }
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update,{passive:true});
  if(!reduced&&matchMedia('(pointer:fine)').matches)document.addEventListener('pointermove',e=>{const card=e.target.closest('.xcard,.edu__item,.sk,.pub,.award');if(!card)return;const b=card.getBoundingClientRect();card.style.setProperty('--light-x',`${e.clientX-b.left}px`);card.style.setProperty('--light-y',`${e.clientY-b.top}px`);},{passive:true});
  update();draw();schedule();
}
