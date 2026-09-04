<script>
  import { T, useTask, useThrelte } from '@threlte/core';
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { media } from '../media.config.js';
  let { controller, active, onReady } = $props();
  let form = $state.raw();
  let accent = $state.raw();
  const { renderer, scene, invalidate } = useThrelte();
  const geometries = [new THREE.TorusKnotGeometry(1.17,.34,220,28,2,3),new THREE.TorusKnotGeometry(1.16,.23,230,24,3,4),new THREE.TorusGeometry(1.34,.32,32,150)];
  const material = new THREE.MeshPhysicalMaterial({color:'#313af2',metalness:.72,roughness:.22,clearcoat:1,clearcoatRoughness:.1});
  const edgeMaterial = new THREE.MeshPhysicalMaterial({color:'#c9d0c3',metalness:1,roughness:.2});
  let time = 0; let currentMode = 0; let custom;
  let envTarget;
  onMount(() => {
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    envTarget = pmrem.fromScene(room, .04);
    scene.environment = envTarget.texture;
    room.dispose(); pmrem.dispose();
    if (form) form.rotation.set(.4,-.6,.15);
    invalidate(); onReady?.();
    if (media.vectaryModel) new GLTFLoader().load(media.vectaryModel, (gltf) => {
      custom=gltf.scene;
      const box = new THREE.Box3().setFromObject(custom);
      const size=box.getSize(new THREE.Vector3());
      const center=box.getCenter(new THREE.Vector3());
      custom.position.sub(center); const scale=3.1/Math.max(size.x,size.y,size.z);
      const group=new THREE.Group();group.add(custom);group.scale.setScalar(scale);
      form.visible=false;scene.add(group);custom=group;invalidate();
    },undefined,()=>{ /* Keep the complete default scene if an optional export fails. */ });
    controller.invalidate = () => {
      if (form && currentMode !== controller.mode) { currentMode=controller.mode;form.geometry=geometries[currentMode]; }
      invalidate();
    };
  });
  useTask((delta) => {
    time += Math.min(delta,.035);
    if (!form) return;
    const mode=controller.mode;
    if (currentMode!==mode) {currentMode=mode;form.geometry=geometries[mode];}
    const scroll = controller.scroll;
    const target = custom || form;
    const smooth=1-Math.exp(-delta*4);
    target.rotation.x += (.35 + controller.pointerY*.22 + scroll*.65-target.rotation.x)*smooth;
    target.rotation.y += (time*.17 + controller.pointerX*.4 + controller.drag + scroll*.9-target.rotation.y)*smooth;
    target.rotation.z += (.15+Math.sin(time*.28)*.12-target.rotation.z)*smooth;
    target.position.y=Math.sin(time*.65)*.09;
    if(accent){accent.rotation.z=-time*.1;accent.rotation.y=time*.08;}
  },{running:()=>active});
  onDestroy(()=>{envTarget?.dispose();material.dispose();edgeMaterial.dispose();geometries.forEach(g=>g.dispose());controller.invalidate=null; if(custom){scene.remove(custom);custom.traverse(o=>{o.geometry?.dispose(); if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});}});
</script>
<T.PerspectiveCamera makeDefault position={[0, .1, 6.7]} fov={36} />
<T.AmbientLight intensity={1.2}/>
<T.DirectionalLight position={[3,4,4]} intensity={4} color="#faf6e8"/>
<T.DirectionalLight position={[-4,-1,2]} intensity={2} color="#95a5ff"/>
<T.Mesh bind:ref={form} geometry={geometries[0]} {material} rotation={[.4,-.6,.15]}/>
<T.Mesh bind:ref={accent} position={[0,0,-.35]} rotation={[.7,.4,-.2]} material={edgeMaterial}>
 <T.TorusGeometry args={[1.95,.013,8,160]}/>
</T.Mesh>
