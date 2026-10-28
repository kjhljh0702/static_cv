import {cv, t, ui, type Item} from '../data';
import {el,button} from './dom';
import {sprite} from './inventory';
export function inspection(activate:(item:Item)=>void) {
 const root=el('aside','inspection-window');root.setAttribute('aria-label',ui('Item inspection','아이템 살펴보기'));
 const label=el('div','inspection-label',ui('Item details','아이템 정보'));
 const content=el('div','inspection-content');
 const show=(item?:Item)=>{
  content.replaceChildren();
  if(!item) {
   content.append(sprite({sprite:'spyglass'}),el('h2','',ui('Researcher’s inventory','연구자의 인벤토리')),el('p','',t(cv.profile.headline)),el('p','inspection-muted',ui('Select a numbered tab. Hover over an item to inspect it.','번호 탭으로 이동하세요. 아이템에 마우스를 올려 정보를 확인할 수 있습니다.')));
   const counts=el('div','inspection-counts');for(const [number,label] of [[cv.projects.length,ui('Projects','프로젝트')],[cv.publications.length,ui('Papers & posters','논문 · 포스터')],[cv.awards.length+cv.certificates.length,ui('Certificates','증서')]]) counts.append(el('span','',`${number} ${label}`));content.append(counts);
  } else {
   content.append(sprite(item),el('h2',item.rarity??'white',item.name),el('p','',item.category));
   item.lines?.slice(0,3).forEach(line=>content.append(el('p','inspection-muted',line)));
   content.append(button(ui('Inspect item','자세히 보기'),()=>activate(item),'pixel-button inspect-action'));
  }
 };
 show();
 root.append(label,content);
 // Use the panel's lifetime to avoid accumulating hover subscriptions on navigation.
 const listener=(event:Event)=>{if(!root.isConnected){document.removeEventListener('cv-inspect-item',listener);return;}show((event as CustomEvent<Item>).detail);};
 document.addEventListener('cv-inspect-item',listener);
 return root;
}
