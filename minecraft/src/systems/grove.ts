import * as THREE from 'three';
import { BASE } from '../data';
export type WorldTime = 'noon'|'dusk'|'night';
export class CherryGrove {
  renderer:THREE.WebGLRenderer;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(62,1,.1,180);
  ambient=new THREE.HemisphereLight(0xcbdfff,0x537440,2);
  sun=new THREE.DirectionalLight(0xffffff,2.4);
  disc=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({color:0xfff5cc}));
  reduced=matchMedia('(prefers-reduced-motion: reduce)');
  constructor(public host:HTMLElement) {
    this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.domElement.className='grove-canvas';host.append(this.renderer.domElement);
    const loader=new THREE.TextureLoader();
    const texture=(name:string)=>{const t=loader.load(BASE+'minecraft/blocks/'+name+'.png');t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;};
    const leaves=new THREE.MeshLambertMaterial({map:texture('cherry_leaves'),alphaTest:.5,side:THREE.DoubleSide});
    const wood=new THREE.MeshLambertMaterial({map:texture('cherry_log')});
    const dirt=new THREE.MeshLambertMaterial({map:texture('dirt')});
    const grass=new THREE.MeshLambertMaterial({map:texture('grass_block_top'),color:0x8ab651});
    const cubes=new THREE.BoxGeometry(1,1,1);
    const matrix=new THREE.Matrix4();
    const trunks:THREE.Vector3[]=[], crowns:THREE.Vector3[]=[];
    for(const [x,z,h] of [[-12,5,6],[12,3,7],[-8,-5,6],[7,-8,7],[-16,-14,6],[15,-17,7],[0,-20,6],[-9,-28,7],[10,-32,6]]) {
      for(let y=0;y<h;y++)trunks.push(new THREE.Vector3(x,y+.5,z));
      for(const side of [-1,1]) {
        trunks.push(new THREE.Vector3(x+side,h-1.5,z));
        trunks.push(new THREE.Vector3(x+side*2,h-.5,z));
      }
      for(let dy=0;dy<3;dy++)for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++) {
        if(Math.abs(dx)+Math.abs(dz)>5 || (dy===2 && Math.abs(dx)+Math.abs(dz)>3))continue;
        crowns.push(new THREE.Vector3(x+dx,h+dy+.5,z+dz));
      }
    }
    const instances=(positions:THREE.Vector3[],material:THREE.Material)=>{
      const mesh=new THREE.InstancedMesh(cubes,material,positions.length);
      positions.forEach((v,i)=>mesh.setMatrixAt(i,matrix.makeTranslation(v.x,v.y,v.z)));mesh.instanceMatrix.needsUpdate=true;this.scene.add(mesh);
    };
    instances(trunks,wood);instances(crowns,leaves);
    const floor=new THREE.Mesh(new THREE.BoxGeometry(110,1,110),[dirt,dirt,grass,dirt,dirt,dirt]);floor.position.set(0,-.5,-25);
    // World-space UVs keep each top-face tile one Minecraft block wide.
    const uv=floor.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*110,uv.getY(i)*110);
    for(const m of [grass,dirt]) {m.map!.wrapS=m.map!.wrapT=THREE.RepeatWrapping;}
    this.scene.add(floor,this.ambient,this.sun,this.disc);
    const cloud=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8});
    for(let i=0;i<8;i++) {const c=new THREE.Mesh(new THREE.BoxGeometry(8+i%3*3,.35,3),cloud);c.position.set(-35+i*11,19,-30-i%3*12);this.scene.add(c);}
    const resize=()=>{this.renderer.setSize(Math.ceil(innerWidth/3),Math.ceil(innerHeight/3),false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();};
    resize();addEventListener('resize',resize);
    const tick=(t:number)=>{requestAnimationFrame(tick);if(document.hidden)return;
      this.camera.position.set((innerWidth<600?5:0)+(this.reduced.matches?0:Math.sin(t*.000045)*1.3),5.2,innerWidth<600?12:19);
      this.camera.lookAt(0,8,-9);this.disc.lookAt(this.camera.position);this.renderer.render(this.scene,this.camera);
    };requestAnimationFrame(tick);
  }
  setTime(time:WorldTime) {
    const colors={noon:0x78aaff,dusk:0xd58c81,night:0x101c3b};
    this.scene.background=new THREE.Color(colors[time]);this.scene.fog=new THREE.Fog(colors[time],45,110);
    this.sun.color.setHex(time==='dusk'?0xffb078:time==='night'?0x8eafff:0xffffff);
    this.sun.intensity=time==='noon'?2.5:time==='dusk'?1.4:.35;
    this.ambient.intensity=time==='noon'?2:time==='dusk'?1.2:.48;
    this.ambient.color.setHex(time==='noon'?0xd7e8ff:time==='dusk'?0xe4b3b8:0x6e8fc9);
    this.sun.position.set(20,time==='dusk'?7:50,-25);
    this.disc.position.set(time==='dusk'?24:18,time==='dusk'?9:29,-55);
    this.disc.material.color.setHex(time==='night'?0xdceaff:time==='dusk'?0xffb46c:0xfff9df);
    this.disc.scale.setScalar(time==='night'?.65:1);
  }
}
