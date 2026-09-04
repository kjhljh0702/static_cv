import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, MoveUpRight } from 'lucide-react';
export default function FormScene({ running, lang }) {
 const host=useRef(null), frame=useRef(null);
 const controller=useRef({ active:running, pointerX:0, pointerY:0, drag:0, scroll:0, mode:0 });
 const runningRef=useRef(running); runningRef.current=running;
 const visibleRef=useRef(true);
 const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);const [mode,setMode]=useState(0);
 useEffect(()=>{let instance,disposed=false,unmount;const c=controller.current;let visible=true;let loadStarted=false;
  const update=()=>{c.active=runningRef.current && visible && !document.hidden;c.onChange?.();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visibleRef.current=visible;update();},{rootMargin:'100px'});observer.observe(frame.current);
  const visibility=()=>update();document.addEventListener('visibilitychange',visibility);
  async function load(){if(loadStarted)return;loadStarted=true;try{const [{mount,unmount:um},{default:Scene}]=await Promise.all([import('svelte'),import('../scene/Canvas.svelte')]);unmount=um;if(!disposed)instance=mount(Scene,{target:host.current,props:{controller:c,onReady:()=>setReady(true),onError:()=>{setReady(false);setFailed(true);}}});}catch(e){console.warn('3D scene unavailable; showing static form.',e);setFailed(true);}}
  load();
  return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',visibility);if(instance)unmount(instance);};
 },[]);
 useEffect(()=>{const c=controller.current;c.active=running && visibleRef.current && !document.hidden;c.onChange?.();},[running]);
 useEffect(()=>{let raf;const tick=()=>{controller.current.scroll=Math.min(window.scrollY/Math.max(1,(document.querySelector('.hero-sequence')?.offsetHeight || window.innerHeight)-window.innerHeight+88),1);raf=null;};const scroll=()=>{if(!raf)raf=requestAnimationFrame(tick);};tick();window.addEventListener('scroll',scroll,{passive:true});return()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(raf);};},[]);
 const select=(i)=>{setMode(i);controller.current.mode=i;controller.current.invalidate?.();};
 const pointer=(e)=>{const r=frame.current.getBoundingClientRect();controller.current.pointerX=(e.clientX-r.left)/r.width-.5;controller.current.pointerY=(e.clientY-r.top)/r.height-.5;if(e.buttons===1&&e.pointerType==='mouse')controller.current.drag+=e.movementX*.012;};
 return <div className="scene-frame" ref={frame} onPointerMove={pointer} onPointerLeave={()=>{controller.current.pointerX=0;controller.current.pointerY=0;}}>
  <div className="scene-axis axis-x"/><div className="scene-axis axis-y"/><span className="scene-coordinate mono">{lang==='en'?'EXPLORE THE CONNECTION':'연결을 탐색하다'}<br/>37.3009° N / 126.8378° E</span>
  <div className="scene-shadow"/>
  {!ready&&<div className="scene-placeholder" aria-hidden="true"><span>∿</span></div>}
  <div ref={host} className="canvas-host" role="img" aria-label={lang==='en'?'Interactive blue sculptural knot representing connected thinking':'연결된 사고를 표현한 파란색 3D 매듭'}/>
  <span className="scene-orbit-note mono"><i/>{lang==='en'?'CONNECTED THINKING':'연결된 사고'}</span>
  <div className="scene-caption mono"><span>{failed?'FORM / STATIC':lang==='en'?'MOVE YOUR CURSOR TO EXPLORE':'마우스를 움직여 탐색하세요'}</span><MoveUpRight size={13}/></div>
  <div className="form-controls" aria-label={lang==='en'?'Choose a 3D form':'3D 형태 선택'}>{['Knot','Flow','Orbit'].map((label,i)=><button key={label} className={mode===i?'selected':''} aria-pressed={mode===i} onClick={()=>select(i)}>{['01','02','03'][i]}<span>{lang==='en'?label:['매듭','흐름','궤도'][i]}</span></button>)}<button className="form-reset" onClick={()=>{controller.current.drag=0;select(0);}} aria-label={lang==='en'?'Reset sculpture':'조형물 초기화'}><RotateCcw size={12}/></button></div>
 </div>;
}
