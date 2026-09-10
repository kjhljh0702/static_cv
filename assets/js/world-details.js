import * as THREE from '../../vendor/three.module.min.js';

// Deterministic, locally generated material maps: no network texture dependencies.
const maps = new Map();
export function surfaceMaps(kind) {
  if (maps.has(kind)) return maps.get(kind);
  let seed = 1702;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const c = canvas.getContext('2d');
  c.fillStyle = '#b6b6b6'; c.fillRect(0, 0, 512, 512);
  const pixels = c.createImageData(512,512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    let v = 185 + rand() * 18;
    if (kind === 'wood') v = 186 + 7 * Math.sin(y * 1.6 + Math.sin(x * .014) * 2 + Math.sin(x * .039) * .5) + rand() * 16;
    if (kind === 'upholstery') v = 193 + (x % 4 < 2 ? 3 : 0) + (y % 4 < 2 ? 3 : 0) + rand() * 5;
    if (kind === 'fabric') v = 172 + (x % 4 < 2 ? 17 : 0) + (y % 4 < 2 ? 15 : 0) + rand() * 13;
    if (kind === 'stone') v = 194 + Math.sin(x * .027 + Math.sin(y * .02) * 3) * 5 + rand() * 12;
    if (kind === 'plaster') v = 205 + rand() * 16;
    const at=(y*512+x)*4; pixels.data[at]=pixels.data[at+1]=pixels.data[at+2]=v; pixels.data[at+3]=255;
  }
  c.putImageData(pixels,0,0);
  if (kind === 'wood') {
    for (let y = 0; y < 512; y += 128) {
      c.fillStyle = '#656565'; c.fillRect(0, y, 512, 2);
      c.fillRect(y % 256 ? 170 : 340, y, 2, 128);
    }
  }
  if (kind === 'stone') {
    c.fillStyle = '#919191'; c.fillRect(0, 0, 512, 2); c.fillRect(0, 0, 2, 512);
  }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 4;
  const bump = map.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true;
  const value = { map, bumpMap: bump, bumpScale: kind === 'upholstery' ? .003 : kind === 'fabric' ? .016 : .035 };
  maps.set(kind, value); return value;
}

const geometries = new Map();
export function softBox(size) {
  const key = size.join(','); if (geometries.has(key)) return geometries.get(key);
  const [w,h,d] = size, r = Math.min(.055, w / 7, h / 7, d / 7);
  const shape = new THREE.Shape();
  shape.moveTo(-w/2+r,-h/2+r); shape.lineTo(w/2-r,-h/2+r);
  shape.lineTo(w/2-r,h/2-r); shape.lineTo(-w/2+r,h/2-r); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth:d-2*r, bevelEnabled:true, bevelSegments:2, steps:1, bevelSize:r, bevelThickness:r });
  geometry.translate(0,0,-d/2+r);
  const pos=geometry.attributes.position, normal=geometry.attributes.normal, uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    if(Math.abs(normal.getY(i))>.6) uv.setXY(i,x*.45,z*.45);
    else if(Math.abs(normal.getX(i))>.6) uv.setXY(i,z*.45,y*.45);
    else uv.setXY(i,x*.45,y*.45);
  }
  geometries.set(key,geometry); return geometry;
}

export function addStudioDetails(scene, renderer, box) {
  const oak = new THREE.MeshStandardMaterial({color:0xb28b61,roughness:.72,...surfaceMaps('wood')});
  const blue = new THREE.MeshStandardMaterial({color:0x254c73,roughness:.85,...surfaceMaps('fabric')});
  const steel = new THREE.MeshStandardMaterial({color:0x647482,metalness:.85,roughness:.28});
  const glow = new THREE.MeshBasicMaterial({color:0xffe0ac});
  // Glazing has a landscaped courtyard, rather than an empty fog plane.
  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(110,90),new THREE.MeshStandardMaterial({color:0x576a55,roughness:1}));
  terrain.rotation.x=-Math.PI/2; terrain.position.set(0,-.14,-48);scene.add(terrain);
  for(let i=0;i<14;i++) {
    const x=-36+i*5.5, z=-26-(i%3)*7;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.14,.23,4,7),oak);trunk.position.set(x,1.8,z);scene.add(trunk);
    for(let j=0;j<3;j++) {
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(2.3-j*.45,1),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.27+i*.002,.17,.23+j*.035),roughness:1}));
      crown.scale.set(1,1.2,.8);crown.position.set(x,3+j*1.1,z);scene.add(crown);
    }
  }
  for(let i=0;i<7;i++) {
    const hill=new THREE.Mesh(new THREE.SphereGeometry(14+i%3*4,16,8),new THREE.MeshStandardMaterial({color:0x657b80,roughness:1}));hill.scale.y=.5;hill.position.set(-42+i*14,-3,-57-i%2*9);scene.add(hill);
  }
  // Slatted oak wall details and suspended linear luminaires.
  for(const side of [-1,1]) {
    for(let i=0;i<32;i++) box(scene,[.1,4.9,.065],[side*13.82,2.5,-10.8+i*.68],oak,{castShadow:false});
    box(scene,[.06,.13,23],[side*13.75,.14,0],steel,{castShadow:false});
    for(const z of [-7,1,8]) {
      box(scene,[.055,1,.055],[side*6.8,5.4,z],steel,{castShadow:false});
      box(scene,[4,.09,.17],[side*6.8,4.9,z],steel,{castShadow:false});
      box(scene,[3.88,.022,.13],[side*6.8,4.84,z],glow,{castShadow:false});
    }
  }
  const plaster = new THREE.MeshStandardMaterial({color:0xdedbd3,roughness:.95,...surfaceMaps('plaster')});
  for(const side of [-1,1]) box(scene,[10,.16,24],[side*9,5.95,0],plaster,{castShadow:false});
  for(const z of [-10,-5,0,5,10]) box(scene,[28,.16,.12],[0,5.8,z],steel,{castShadow:false});
  const skylight = new THREE.Mesh(new THREE.PlaneGeometry(8,24),new THREE.MeshPhysicalMaterial({color:0xb9d4e5,roughness:.12,metalness:.12,transparent:true,opacity:.25,side:THREE.DoubleSide}));
  skylight.rotation.x=Math.PI/2;skylight.position.y=6.05;scene.add(skylight);
  // Reading objects sit on the lounge table; sofa geometry lives in createLounge.
  for(let i=0;i<3;i++) { const book=box(scene,[.45,.045,.32],[-.32+i*.055,.63+i*.05,-.05],i%2?blue:oak);book.rotation.y=.15*i; }
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.14,20,1,true),new THREE.MeshStandardMaterial({color:0xe4e0d4,roughness:.35,side:THREE.DoubleSide}));cup.position.set(.55,.65,-.05);scene.add(cup);
  // Broad luminous panels provide inexpensive reflections for brushed metal.
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x8798ae);
  for(const x of [-1,1]) {const panel=new THREE.Mesh(new THREE.PlaneGeometry(12,8),new THREE.MeshBasicMaterial({color:x<0?0xffe2b6:0xc4d9ff,side:THREE.DoubleSide}));panel.position.set(x*9,6,0);panel.rotation.y=Math.PI/2;studio.add(panel);}
  const generator=new THREE.PMREMGenerator(renderer);const env=generator.fromScene(studio,.08);scene.environment=env.texture;scene.environmentIntensity=.32;generator.dispose();
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
}

export function detailRover(rover, box) {
  const metal=new THREE.MeshStandardMaterial({color:0x8197a9,metalness:.8,roughness:.28});
  const rubber=new THREE.MeshStandardMaterial({color:0x18212b,roughness:.94});
  const blue=new THREE.MeshStandardMaterial({color:0x225d8c,metalness:.45,roughness:.32});
  // Recessed ventilation, camera mast, wheel hubs, and visible chassis fasteners.
  for(let i=0;i<9;i++) box(rover,[.08,.012,.65],[-.58+i*.145,1.035,0],rubber);
  for(const x of [-.85,.85]) for(const z of [-.79,.79]) {
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.04,24),metal);hub.rotation.x=Math.PI/2;hub.position.set(x,.32,z);rover.add(hub);
    const tire=new THREE.Mesh(new THREE.TorusGeometry(.28,.08,8,24),rubber);tire.position.set(x,.32,z);rover.add(tire);
    for(let i=0;i<6;i++) {const bolt=new THREE.Mesh(new THREE.SphereGeometry(.025,6,4),metal);bolt.position.set(x+Math.cos(i*Math.PI/3)*.13,.32+Math.sin(i*Math.PI/3)*.13,z+(z>0?.03:-.03));rover.add(bolt);}
  }
  box(rover,[.07,.7,.07],[.4,1.35,.25],metal);
  box(rover,[.42,.16,.19],[.4,1.72,.25],blue);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.04,20),new THREE.MeshPhysicalMaterial({color:0x163448,metalness:.4,roughness:.08,clearcoat:1}));lens.rotation.x=Math.PI/2;lens.position.set(.4,1.72,.37);rover.add(lens);
}

export function articulatedArm(parent, box) {
  const alloy=new THREE.MeshStandardMaterial({color:0xa6b5c5,metalness:.8,roughness:.28});
  const blue=new THREE.MeshStandardMaterial({color:0x195d92,metalness:.45,roughness:.33});
  const rubber=new THREE.MeshStandardMaterial({color:0x172532,roughness:.8});
  const joint=(group,y,r)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.4,24),alloy);m.rotation.x=Math.PI/2;m.position.y=y;group.add(m);const cap=new THREE.Mesh(new THREE.CylinderGeometry(r*.65,r*.65,.42,24),rubber);cap.rotation.x=Math.PI/2;cap.position.y=y;group.add(cap);};
  const upper=new THREE.Group();upper.position.y=1.28;parent.add(upper);joint(upper,0,.25);
  box(upper,[.36,1.4,.3],[0,.7,0],blue);box(upper,[.1,1.1,.035],[0,.7,.17],alloy);
  const forearm=new THREE.Group();forearm.position.y=1.4;upper.add(forearm);joint(forearm,0,.22);
  box(forearm,[.28,1.15,.25],[0,.58,0],blue);
  joint(forearm,1.16,.15);box(forearm,[.46,.15,.3],[0,1.34,0],alloy);
  for(const side of [-1,1]) {box(forearm,[.065,.3,.18],[side*.2,1.52,0],rubber);box(forearm,[.14,.065,.18],[side*.14,1.69,0],alloy);}
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(.22,.1,0),new THREE.Vector3(.38,.6,0),new THREE.Vector3(.3,1.2,0)]);
  upper.add(new THREE.Mesh(new THREE.TubeGeometry(path,16,.035,6,false),rubber));
  upper.rotation.z=-.35; forearm.rotation.z=1.2;
  parent.userData.upper=upper;parent.userData.forearm=forearm;
}
