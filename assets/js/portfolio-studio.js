import { t, getLang } from './render.js';
let data;
let filter = 'all';
let initialized = false;
const $ = selector => document.querySelector(selector);
const node = (tag, className, text) => { const n=document.createElement(tag);n.className=className;if(text!==undefined)n.textContent=text;return n; };
const local = (en,ko) => getLang()==='ko'?ko:en;
const group = project => /Research|Synthesis/.test(project.category.en)?'research':'engineering';
function openDossier(index) {
 const project=data.projects[index];const dialog=$('#studio-dialog');const body=$('#studio-dialog-body');
 body.replaceChildren();$('#studio-dialog-title').textContent=t(project.title);
 const image=node('img','dossier-image');image.src=project.image;image.alt=t(project.title);image.style.objectFit=project.imageFit||'cover';
 body.append(node('p','dossier-kicker',`${t(project.category)} / ${project.start} — ${project.end}`),image,node('p','dossier-summary',t(project.summary)));
 for(const [label,value] of [[local('CONTEXT','프로젝트 배경'),t(project.organization)],[local('MY ROLE','담당 역할'),t(project.role)]]) {body.append(node('h3','dossier-label',label),node('p','',value));}
 body.append(node('h3','dossier-label',local('APPROACH & CONTRIBUTIONS','접근 방법과 기여')));const list=node('ul','dossier-list');project.highlights.forEach(h=>list.append(node('li','',t(h))));body.append(list,node('h3','dossier-label',local('TECHNOLOGIES','사용 기술')),node('p','',project.skills.join(' · ')));
 dialog.showModal();
}
function openCertificate(index) {
 const records=[...data.awards,...data.certificates],record=records[index];const dialog=$('#studio-dialog');$('#studio-dialog-title').textContent=t(record.title);const body=$('#studio-dialog-body');body.replaceChildren();
 const image=node('img','document-image');image.src=record.image;image.alt=t(record.title);body.append(image,node('p','document-description',t(record.description)));
 const original=node('a','studio-link',local('Open original image ↗','원본 이미지 보기 ↗'));original.href=record.image;original.target='_blank';original.rel='noopener';body.append(original);dialog.showModal();
}
function applyFilter() {
 document.querySelectorAll('#pcards .pcard').forEach((card,index)=>card.hidden=filter!=='all'&&group(data.projects[index])!==filter);
 document.querySelectorAll('.project-filter').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
 const count=data.projects.filter(p=>filter==='all'||group(p)===filter).length;$('#project-result-count').textContent=local(`${String(count).padStart(2,'0')} projects`,`${String(count).padStart(2,'0')}개 프로젝트`);
 dispatchEvent(new Event('scroll'));
}
export function upgradePortfolio(source) {
 data=source;
 if(!initialized) {
  initialized=true;
  const dialog=node('dialog','studio-dialog');dialog.id='studio-dialog';dialog.setAttribute('aria-labelledby','studio-dialog-title');
  const head=node('header','studio-dialog-head');const title=node('h2','');title.id='studio-dialog-title';const close=node('button','studio-dialog-close','×');close.type='button';close.setAttribute('aria-label','Close details');close.onclick=()=>dialog.close();head.append(title,close);const body=node('div','studio-dialog-body');body.id='studio-dialog-body';dialog.append(head,body);document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  const filters=node('div','project-filters');filters.id='project-filters';filters.setAttribute('aria-label','Project categories');$('#pcards').before(filters);
  const gallery=node('div','credential-gallery');gallery.id='credential-gallery';$('#awardList').after(gallery);
  const heroTop=node('div','hero-eyebrow');heroTop.id='hero-eyebrow';$('.hero__l').prepend(heroTop);
  const actions=node('div','hero-actions');actions.id='hero-actions';$('.hero__roles').after(actions);
  const caption=node('div','portrait-caption');caption.id='portrait-caption';$('.hero__ph').after(caption);
  const map=node('div','research-map');map.id='research-map';$('.hero__l').append(map);
  document.addEventListener('click',event=>{const dossier=event.target.closest('[data-dossier]');if(dossier)openDossier(Number(dossier.dataset.dossier));const certificate=event.target.closest('[data-certificate]');if(certificate)openCertificate(Number(certificate.dataset.certificate));});
 }
 $('.nav__brand').textContent='LJH.';
 $('#hero-eyebrow').replaceChildren(node('span','status-dot'),node('span','',local('RESEARCHER / ENGINEER','연구자 / 엔지니어')));
 $('#hero-actions').replaceChildren();const work=node('a','studio-button primary',local('Explore selected work','주요 프로젝트 보기'));work.href='#projects';work.append(node('span','','↗'));const resume=node('a','studio-button secondary',local('Download CV ↓','CV 다운로드 ↓'));resume.href='minecraft/Jeonghun-Lee-CV.pdf';resume.download='Lee-Jeong-Hoon-CV.pdf';$('#hero-actions').append(work,resume);
 $('#portrait-caption').replaceChildren(node('span','',local('HANYANG UNIVERSITY','한양대학교')),node('span','',local('PROGRAMMING SYSTEMS LAB','프로그램 시스템 연구실')));
 const map=$('#research-map');map.replaceChildren();map.setAttribute('aria-label',local('Research focus','연구 분야'));
 const line=node('div','map-heading',local('AT THE INTERSECTION OF','연구와 제작이 만나는 지점'));map.append(line);
 const tracks=[['01','Code intelligence','코드 인텔리전스'],['02','Static analysis','정적 분석'],['03','Robotics','로보틱스']];tracks.forEach(([number,en,ko])=>{const link=node('a','research-track');link.href='#projects';link.addEventListener('click',()=>{filter=number==='03'?'engineering':'research';applyFilter();});link.append(node('span','track-number',number),node('span','',local(en,ko)),node('span','track-arrow','↗'));map.append(link);});
 const filters=$('#project-filters');filters.replaceChildren();for(const [key,en,ko] of [['all','All work','전체'],['research','Research & code','연구 · 코드'],['engineering','Robotics & systems','로봇 · 시스템']]) {const button=node('button','project-filter',local(en,ko));button.type='button';button.dataset.filter=key;button.onclick=()=>{filter=key;applyFilter();};filters.append(button);}const count=node('span','project-result-count');count.id='project-result-count';count.setAttribute('aria-live','polite');filters.append(count);
 document.querySelectorAll('#pcards .pcard').forEach((card,index)=>{card.dataset.project=String(index);const button=node('button','dossier-trigger',local('Open project dossier','프로젝트 자세히 보기'));button.type='button';button.dataset.dossier=String(index);button.append(node('span','','↗'));card.querySelector('.pcard__txt').append(button);const image=card.querySelector('.pcard__img');image.removeAttribute('data-cursor');image.tabIndex=0;image.setAttribute('role','button');image.setAttribute('aria-label',local('View project image: ','프로젝트 이미지 보기: ')+t(data.projects[index].title));image.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();image.click();}});});
 const gallery=$('#credential-gallery');gallery.replaceChildren();[...data.awards,...data.certificates].forEach((record,index)=>{const button=node('button','credential');button.type='button';button.dataset.certificate=String(index);button.setAttribute('aria-label',local('View certificate: ','증서 보기: ')+t(record.title));const image=node('img','');image.src=record.image;image.alt=t(record.title);image.loading='lazy';const frame=node('div','credential-frame');frame.append(image,node('span','credential-open','↗'));button.append(frame,node('span','credential-index',`0${index+1} / ${local('VERIFIED DOCUMENT','증빙 자료')}`),node('strong','',t(record.title)));gallery.append(button);});
 applyFilter();
}
