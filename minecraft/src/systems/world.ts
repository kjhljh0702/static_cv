import { CherryGrove } from './grove';
import { BASE, ui } from '../data';
import { el, button, image } from '../components/dom';
type Time = 'noon' | 'dusk' | 'night';
export class CherryWorld {
  time: Time = 'noon';
  grove: CherryGrove | null = null;
  textures: HTMLImageElement[] = [];
  spawnClock = 0;
  touch = { x:-999, y:-999, until:0 };
  canvas = el('canvas', 'cherry-petals');
  context = this.canvas.getContext('2d')!;
  petals: {x:number;y:number;vx:number;vy:number;life:number;size:number;frame:number;phase:number}[] = [];
  reduced = matchMedia('(prefers-reduced-motion: reduce)');
  frame = 0;
  last = 0;
  constructor() {
    const saved = localStorage.getItem('cv-world-time');
    if (saved === 'noon' || saved === 'dusk' || saved === 'night') this.time = saved;
    this.canvas.setAttribute('aria-hidden','true');
    document.body.prepend(this.canvas);
    const resize = () => {this.canvas.width=Math.ceil(innerWidth/3);this.canvas.height=Math.ceil(innerHeight/3);};
    resize(); addEventListener('resize',resize);
    for(let i=0;i<12;i++){const img=new Image();img.src=BASE+`minecraft/particles/cherry_${i}.png`;this.textures.push(img);}
    try {this.grove=new CherryGrove(document.querySelector('#world')!);} catch {document.querySelector<HTMLElement>('#world')!.style.backgroundImage='none';}
    for(let i=0;i<28;i++)this.spawn(Math.random()*this.canvas.width,Math.random()*this.canvas.height);
    const stir=(e:PointerEvent)=>{
      if ((e.target as HTMLElement).closest('button,a,input,.mc-window,.book-window,.section-sidebar')) return;
      this.touch={x:e.clientX/3,y:e.clientY/3,until:performance.now()+900};
      if(e.pointerType==='touch' && e.type==='pointerdown') {
        // A touch stirs existing petals; it never creates a burst.
        for(const p of this.petals) if(Math.hypot(p.x-this.touch.x,p.y-this.touch.y)<45) {p.vx+=(p.x-this.touch.x)*.9;p.vy-=14;}
      }
    };
    addEventListener('pointerdown',stir,{passive:true});addEventListener('pointermove',stir,{passive:true});
    this.setTime(this.time);
    this.reduced.addEventListener('change',()=>{this.petals=[];this.context.clearRect(0,0,this.canvas.width,this.canvas.height);});
    const tick=(now:number)=>{
      this.frame=requestAnimationFrame(tick);
      if(document.hidden) {this.last=now;return;}
      const dt=Math.min((now-this.last)/1000,.04);this.last=now;
      this.spawnClock+=dt;
      if(!this.reduced.matches && this.spawnClock>.3) {this.spawn(Math.random()*this.canvas.width,-8);this.spawnClock=0;}
      this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
      if (this.time==='night') {
        this.context.fillStyle='#dce4ff';
        for(let i=0;i<32;i++) this.context.fillRect(Math.round((i*137%997)/997*this.canvas.width),Math.round((i*73%331)/331*this.canvas.height*.42),1,1);
      }
      this.petals=this.petals.filter(p=>p.life>0 && p.y<this.canvas.height+10);
      for(const p of this.petals) {
        if(this.reduced.matches) continue;
        if(now<this.touch.until) {
          const dx=p.x-this.touch.x,dy=p.y-this.touch.y,d=Math.hypot(dx,dy);
          if(d>0 && d<45) {p.vx+=dx/d*dt*100;p.vy+=dy/d*dt*65;this.canvas.dataset.touchReaction='true';}
        }
        p.vx+=(5-p.vx)*dt*.6;p.vy+=(8-p.vy)*dt*.35;
        p.x+=(p.vx+Math.sin(now*.0006+p.y)*3)*dt;p.y+=p.vy*dt;p.life-=dt;
        const sprite=this.textures[p.frame];
        if(sprite.complete && sprite.naturalWidth) {
          this.context.imageSmoothingEnabled=false;
          this.context.drawImage(sprite,Math.round(p.x),Math.round(p.y),p.size,p.size);
        }

      }
    };
    requestAnimationFrame(tick);
  }
  spawn(x:number,y:number) {if(this.petals.length<65)this.petals.push({x,y,vx:2+Math.random()*5,vy:5+Math.random()*6,life:100,size:6,frame:Math.floor(Math.random()*12),phase:Math.random()*6});}
  setTime(time:Time) {this.time=time;document.documentElement.dataset.worldTime=time;localStorage.setItem('cv-world-time',time);this.grove?.setTime(time);}
  controls() {
    const root=el('div','world-controls');root.setAttribute('role','group');root.setAttribute('aria-label',ui('World time and cherry blossoms','시간과 벚꽃'));
    for(const [time,en,ko] of [['noon','Noon','정오'],['dusk','Dusk','노을'],['night','Night','밤']] as const) {
      const b=button('',()=>{this.setTime(time);root.replaceWith(this.controls());},'pixel-button time-button');
      b.append(image(BASE+'minecraft/items/clock.png','','time-clock'),el('span','',ui(en,ko)));
      b.setAttribute('aria-label',ui(en,ko));b.setAttribute('aria-pressed',String(time===this.time));root.append(b);
    }
    return root;
  }
}
