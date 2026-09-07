// Scroll-only transforms augment the CV without hiding factual content.
export function scrollStory() {
  const shell=document.querySelector('#cv-shell');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ids=['hero','about','experience','education','projects','skills','publications','awards','contact'];
  const names={en:['Profile','About','Experience','Education','Projects','Skills','Papers','Awards','Contact'],ko:['프로필','소개','경력','학력','프로젝트','기술','논문','수상','연락처']};
  const sections=ids.map(id=>document.getElementById(id));
  const dock=document.createElement('nav');dock.className='reading-dock';dock.setAttribute('aria-label','Scroll chapters');
  const previous=document.createElement('button');previous.textContent='←';previous.type='button';previous.setAttribute('aria-label','Previous section');
  const status=document.createElement('button');status.type='button';status.className='reading-location';status.setAttribute('aria-label','Choose section');status.setAttribute('aria-expanded','false');
  const next=document.createElement('button');next.type='button';next.textContent='→';next.setAttribute('aria-label','Next section');
  const menu=document.createElement('div');menu.className='reading-menu';menu.hidden=true;
  const links=ids.map((id,i)=>{const a=document.createElement('a');a.href='#'+(id==='hero'?'top':id);a.addEventListener('click',()=>{menu.hidden=true;status.setAttribute('aria-expanded','false');});menu.append(a);return [a,i];});
  dock.append(previous,status,next,menu);shell.append(dock);
  let active=0,pending=false;
  const go=index=>sections[Math.max(0,Math.min(8,index))].scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
  previous.onclick=()=>go(active-1);next.onclick=()=>go(active+1);
  status.onclick=()=>{menu.hidden=!menu.hidden;status.setAttribute('aria-expanded',String(!menu.hidden));};
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;status.setAttribute('aria-expanded','false');status.focus();}});
  function update() {
    pending=false;const vh=innerHeight;
    const lang=document.documentElement.dataset.lang==='ko'?'ko':'en';
    sections.forEach((section,i)=>{if(section.getBoundingClientRect().top<=vh*.4)active=i;});
    status.textContent=`${String(active+1).padStart(2,'0')} / 09 · ${names[lang][active]}`;
    links.forEach(([link,i])=>{link.textContent=`${String(i+1).padStart(2,'0')}  ${names[lang][i]}`;if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    previous.disabled=active===0;next.disabled=active===8;
    const r=sections[active].getBoundingClientRect();
    const p=Math.max(0,Math.min(1,(vh*.4-r.top)/Math.max(1,r.height)));
    dock.style.setProperty('--reading-progress',`${p*100}%`);
    const cards=document.querySelectorAll('#cv-shell .pcard');
    cards.forEach((card,i)=>{
      const rect=card.getBoundingClientRect();
      const reveal=reduced.matches?1:Math.max(0,Math.min(1,(vh-rect.top)/(vh*.8)));
      card.style.setProperty('--photo-progress',String(reveal));
      card.style.setProperty('--photo-shift',`${reduced.matches?0:Math.max(-14,Math.min(14,(rect.top-vh*.18)*-.04))}px`);
      if(!card.querySelector('.project-chapter')) {
        const label=document.createElement('span');label.className='project-chapter';label.textContent=`${String(i+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;label.setAttribute('aria-hidden','true');card.querySelector('.pcard__img')?.append(label);
      }
    });
    document.querySelectorAll('#cv-shell .edu__item,#cv-shell .pub,#cv-shell .sk').forEach(card=>{
      const r=card.getBoundingClientRect();const p=reduced.matches?1:Math.max(0,Math.min(1,(vh*.85-r.top)/(vh*.65)));
      card.style.setProperty('--scroll-edge',`${p*100}%`);
      card.style.setProperty('--detail-light',`${p*100}%`);
    });
  }
  const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang','data-view']});
  reduced.addEventListener('change',schedule);update();
}
