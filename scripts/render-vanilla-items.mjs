import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=process.env.CV_TEST_URL??'http://127.0.0.1:4174/static_cv/';
const models=JSON.parse(readFileSync('minecraft/public/minecraft/blocks/vanilla-models.json','utf8'));
const browser=await chromium.launch({headless:true});
const records=[];
try {
 const page=await browser.newPage();
 // A bare same-origin asset avoids starting either portfolio while rendering sprites.
 await page.goto(base+'minecraft/blocks/glowstone.png');
 for(const [name,model] of [['command','command_block'],['crafting','crafting_table'],['piston','piston_inventory'],['chest','chest']]) {
  const data=await page.evaluate(async({base,models,name,model})=>{
   const THREE=await import(base+'vendor/three.module.min.js');
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true});renderer.setSize(16,16);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);
   const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);
   const camera=new THREE.OrthographicCamera(-8,8,8,-8,.1,100);camera.position.z=40;camera.lookAt(0,0,0);
   const loader=new THREE.TextureLoader();const textures=new Map();
   async function texture(path) {if(textures.has(path))return textures.get(path);const t=await loader.loadAsync(base+'minecraft/blocks/'+path+'.png');t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;
    const height=t.image.height;t.repeat.y=Math.min(1,16/height);t.offset.y=1-t.repeat.y;textures.set(path,t);return t;}
   const order=['east','west','up','down','south','north'];
   function inherit(key) {const entry=models[key];if(!entry)throw Error('Unknown vanilla parent '+key);const parent=entry.parent?inherit(entry.parent.split('/').pop()):{};return {...parent,...entry,textures:{...parent.textures,...entry.textures},elements:entry.elements??parent.elements};}
   if(name!=='chest') {
    const spec=inherit(model);const resolve=key=>{while(key.startsWith('#'))key=spec.textures[key.slice(1)];return key.split('/').pop();};
    for(const element of spec.elements) {
     const size=element.to.map((value,i)=>value-element.from[i]);const geometry=new THREE.BoxGeometry(...size);const uv=geometry.attributes.uv;const materials=[];
     for(let i=0;i<6;i++) {
      const face=element.faces[order[i]];if(!face){materials.push(new THREE.MeshBasicMaterial({visible:false}));continue;}
      const map=await texture(resolve(face.texture));const shade=i===2?1:i<2?.78:.9;materials.push(new THREE.MeshBasicMaterial({map,color:new THREE.Color().setScalar(shade),alphaTest:.1}));
      const bounds=face.uv??[0,0,16,16];const [u,v,u2,v2]=bounds;const corners=[[u,v],[u2,v],[u,v2],[u2,v2]];
      for(let j=0;j<4;j++){let [a,b]=corners[j];for(let turn=0;turn<(face.rotation??0)/90;turn++){const old=a;a=16-b;b=old;}uv.setXY(i*4+j,a/16,1-b/16);}
     }
     const mesh=new THREE.Mesh(geometry,materials);mesh.position.set(...element.from.map((value,i)=>(value+element.to[i])/2-8));root.add(mesh);
    }
    const gui=spec.display.gui;root.rotation.set(...gui.rotation.map(value=>value*Math.PI/180),'XYZ');root.scale.set(...gui.scale);
   } else {
    const map=await loader.loadAsync(base+'minecraft/blocks/chest.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;
    const box=(w,h,d,u,v,y)=>{const geometry=new THREE.BoxGeometry(w,h,d);const faces=[[u,v+d,d,h],[u+d+w,v+d,d,h],[u+d,v,w,d],[u+d+w,v,w,d],[u+d,v+d,w,h],[u+2*d+w,v+d,w,h]];
     faces.forEach(([x,z,fw,fh],i)=>{[[x,z],[x+fw,z],[x,z+fh],[x+fw,z+fh]].forEach(([a,b],j)=>geometry.attributes.uv.setXY(i*4+j,a/64,1-b/64));});
     const mesh=new THREE.Mesh(geometry,Array.from({length:6},(_,i)=>new THREE.MeshBasicMaterial({map,color:new THREE.Color().setScalar(i===2?1:i<2?.78:.9)})));mesh.position.y=y;root.add(mesh);return mesh;};
    box(14,10,14,0,19,-2);box(14,5,14,0,0,5.5);const latch=box(2,4,1,0,0,1);latch.position.z=-7.5;
    root.rotation.set(Math.PI/6,Math.PI*1.25,0,'XYZ');root.scale.setScalar(.625);
   }
   renderer.render(scene,camera);const png=renderer.domElement.toDataURL('image/png');renderer.dispose();return png;
  },{base,models,name,model});
  const bytes=Buffer.from(data.split(',')[1],'base64');const file=`items/${name}.png`;writeFileSync('minecraft/public/minecraft/'+file,bytes);records.push({file,model,render:'16×16 nearest-filtered render using vanilla 1.20.1 geometry, GUI transform and textures',sha256:createHash('sha256').update(bytes).digest('hex')});
 }
} finally {await browser.close();}
writeFileSync('minecraft/public/minecraft/blocks/item-render-manifest.json',JSON.stringify(records,null,2)+'\n');
