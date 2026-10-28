import {el,button,image} from './dom';
import {ui} from '../data';
export function viewArtifact(src:string,title:string) {
 document.querySelector('.artifact-viewer')?.remove();
 const dialog=el('dialog','artifact-viewer');
 dialog.setAttribute('aria-label',title);
 const heading=el('header','artifact-heading');heading.append(el('h2','',title),button('×',()=>dialog.close(),'pixel-button artifact-close'));
 heading.lastElementChild!.setAttribute('aria-label',ui('Close image','이미지 닫기'));
 const viewport=el('div','artifact-viewport');const photo=image(src,title,'artifact-image');viewport.append(photo);
 let zoom=1;
 const change=(amount:number)=>{zoom=Math.max(1,Math.min(3,zoom+amount));photo.style.width=`${zoom*100}%`;status.textContent=`${Math.round(zoom*100)}%`;};
 const status=el('span','','100%');const controls=el('div','artifact-controls');controls.append(button('−',()=>change(-.5),'pixel-button'),status,button('+',()=>change(.5),'pixel-button'),button(ui('Reset','초기화'),()=>{zoom=1;change(0);},'pixel-button'));
 controls.firstElementChild!.setAttribute('aria-label',ui('Zoom out','축소'));controls.children[2].setAttribute('aria-label',ui('Zoom in','확대'));
 dialog.append(heading,viewport,controls);dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('keydown',event=>event.stopPropagation());document.body.append(dialog);dialog.showModal();
}
