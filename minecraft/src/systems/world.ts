import { BASE, ui } from '../data';
import { el, button, image } from '../components/dom';
type Time = 'noon' | 'dusk' | 'night';
export class CherryWorld {
  time: Time = 'dusk';
  canvas = el('canvas', 'cherry-petals');
  context = this.canvas.getContext('2d')!;
  petals: {x:number;y:number;vx:number;vy:number;life:number;size:number}[] = [];
  pointer = {x:-1000,y:-1000};
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
    addEventListener('pointermove',e=>{this.pointer={x:e.clientX/3,y:e.clientY/3};});
    addEventListener('pointerdown',e=>{
      if ((e.target as HTMLElement).closest('button,a,input,.mc-window,.book-window,.section-sidebar,.toolbar')) return;
      this.burst(e.clientX/3,e.clientY/3);
    });
    this.setTime(this.time);
    this.reduced.addEventListener('change',()=>{this.petals=[];this.context.clearRect(0,0,this.canvas.width,this.canvas.height);});
    const tick=(now:number)=>{
      this.frame=requestAnimationFrame(tick);
      if(document.hidden) {this.last=now;return;}
      const dt=Math.min((now-this.last)/1000,.04);this.last=now;
      if(!this.reduced.matches && this.petals.length<45 && Math.random()<.13) this.spawn(Math.random()*this.canvas.width,-5);
      this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
      if (this.time==='night') {
        this.context.fillStyle='#dce4ff';
        for(let i=0;i<32;i++) this.context.fillRect(Math.round((i*137%997)/997*this.canvas.width),Math.round((i*73%331)/331*this.canvas.height*.42),1,1);
      }
      this.petals=this.petals.filter(p=>p.life>0 && p.y<this.canvas.height+10);
      for(const p of this.petals) {
        const dx=p.x-this.pointer.x,dy=p.y-this.pointer.y,d=Math.hypot(dx,dy);
        if(d<25 && d>0) {p.vx+=dx/d*dt*35;p.vy+=dy/d*dt*25;}
        if(this.reduced.matches) continue;
        p.x+=(p.vx+Math.sin(now*.0006+p.y)*3)*dt;p.y+=p.vy*dt;p.life-=dt;
        this.context.fillStyle=this.time==='night'?'#d4a3df':'#ffc6e0';
        this.context.fillRect(Math.round(p.x),Math.round(p.y),p.size,1);
        this.context.fillStyle='#e599b8';this.context.fillRect(Math.round(p.x)+1,Math.round(p.y)+1,1,1);
      }
    };
    requestAnimationFrame(tick);
  }
  spawn(x:number,y:number) {if(this.petals.length<110)this.petals.push({x,y,vx:4+Math.random()*12,vy:6+Math.random()*10,life:35,size:2+Math.round(Math.random())});}
  burst(x=this.canvas.width*.2,y=this.canvas.height*.18) {
    if(this.reduced.matches) {this.spawn(x,y);return;}
    for(let i=0;i<28;i++){this.spawn(x+(Math.random()-.5)*18,y+(Math.random()-.5)*12);}
  }
  setTime(time:Time) {this.time=time;document.documentElement.dataset.worldTime=time;localStorage.setItem('cv-world-time',time);}
  controls() {
    const root=el('div','world-controls');root.setAttribute('role','group');root.setAttribute('aria-label',ui('World time and cherry blossoms','시간과 벚꽃'));
    for(const [time,en,ko] of [['noon','Noon','정오'],['dusk','Dusk','노을'],['night','Night','밤']] as const) {
      const b=button('',()=>{this.setTime(time);root.replaceWith(this.controls());},'pixel-button time-button');
      b.append(image(BASE+'minecraft/items/clock.png','','time-clock'),el('span','',ui(en,ko)));
      b.setAttribute('aria-label',ui(en,ko));b.setAttribute('aria-pressed',String(time===this.time));root.append(b);
    }
    root.append(button(ui('Shake blossoms','벚꽃 흔들기'),()=>this.burst(),'pixel-button blossom-button'));
    return root;
  }
}
