import * as THREE from "three";
import { BASE } from "../data";
import { el, image } from "./dom";
export class PlayerPreview {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer | null = null;
  head = new THREE.Group();
  body = new THREE.Group();
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-14, 14, 20.5, -20.5, 0.1, 200);
  target = { x: 0, y: 0 };
  frame = 0;
  visible = true;
  reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  arms: THREE.Group[] = [];
  spin = 0;
  last = 0;
  constructor(public container: HTMLElement) {
    this.canvas = el("canvas", "player-canvas");
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute(
      "aria-label",
      "Minecraft researcher wearing a white lab coat; head follows your pointer.",
    );
    container.append(this.canvas);
    this.camera.position.set(0, 18, 80);
    this.camera.lookAt(0, 18, 0);
  }
  async load() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
      });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.setClearColor(0x000000, 0);
      const tex = await new THREE.TextureLoader().loadAsync(
        BASE + "minecraft/skin/steve.png",
      );
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      const box = (
        w: number,
        h: number,
        d: number,
        u: number,
        v: number,
        outer = false,
      ) => {
        const g = new THREE.BoxGeometry(w, h, d);
        const uv = g.attributes.uv;
        const faces = [
          [u, v + d, d, h],
          [u + d + w, v + d, d, h],
          [u + d, v, w, d],
          [u + d + w, v, w, d],
          [u + d, v + d, w, h],
          [u + 2 * d + w, v + d, w, h],
        ];
        faces.forEach(([x, y, fw, fh], i) => {
          const coords = [
            [x + fw, y],
            [x, y],
            [x + fw, y + fh],
            [x, y + fh],
          ];
          /* BoxGeometry's right/left face UV winding uses the same plane layout. */ coords.forEach(
            ([a, b], j) => uv.setXY(i * 4 + j, a / 64, 1 - b / 64),
          );
        });
        const m = new THREE.Mesh(
          g,
          new THREE.MeshLambertMaterial({
            map: tex,
            transparent: outer,
            alphaTest: 0.1,
          }),
        );
        if (outer) m.scale.setScalar(1.055);
        return m;
      };
      const coat = (w:number,h:number,d:number,x:number,y:number,z:number,color=0xf0f2f3) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));
        mesh.position.set(x,y,z);return mesh;
      };
      this.canvas.dataset.outfit = "lab-coat";
      this.scene.add(new THREE.HemisphereLight(0xf1f5ff, 0x777080, 1.5));
      const sun = new THREE.DirectionalLight(0xfff7ed, 1.8);
      sun.position.set(-25, 50, 70);
      this.scene.add(sun);
      this.scene.add(this.body);
      this.body.rotation.y = -0.24;
      this.head.position.y = 24;
      const skull = box(8, 8, 8, 0, 0);
      skull.position.y = 4;
      this.head.add(skull);
      const hair = box(8, 8, 8, 32, 0, true);
      hair.position.y = 4;
      this.head.add(hair);
      this.body.add(this.head);
      const torso = box(8, 12, 4, 16, 16);
      torso.position.y = 18;
      this.body.add(torso);
      this.body.add(coat(8.5,13,1,0,17.5,-2.1));
      for (const side of [-1,1]) {
        this.body.add(coat(2.9,13,4.5,side*2.8,17.5,0));
        this.body.add(coat(3.8,4,4.6,side*2,10,0));
        this.body.add(coat(2,2,.2,side*2.6,14.3,2.4,0xd3dce1));
        const lapel=coat(1,4,.3,side*1.3,21,2.45);lapel.rotation.z=side*.25;this.body.add(lapel);
      }
      this.body.add(coat(1.6,1,.3,-2.7,20.2,2.45,0x235d99));
      for(const y of [18.5,16.5,14.5]) this.body.add(coat(.4,.4,.3,.9,y,2.45,0x7b8790));
      for (const [x, u, v] of [
        [-6, 40, 16],
        [6, 32, 48],
      ]) {
        const pivot = new THREE.Group();
        pivot.position.set(x, 23.5, 0);
        pivot.rotation.z = x < 0 ? -0.055 : 0.055;
        pivot.rotation.x = x < 0 ? -0.025 : 0.035;
        const arm = box(4, 12, 4, u, v);
        arm.position.y = -6;
        pivot.add(arm);
        pivot.add(coat(4.2,9.5,4.2,0,-4.75,0));
        this.arms.push(pivot);
        this.body.add(pivot);
      }
      for (const [x, u, v] of [
        [-2, 0, 16],
        [2, 16, 48],
      ]) {
        const leg = box(4, 12, 4, u, v);
        leg.position.set(x, 6, x < 0 ? 0.35 : -0.35);
        leg.rotation.y = x < 0 ? 0.025 : -0.025;
        this.body.add(leg);
      }
      const resize = () => {
        const r = this.container.getBoundingClientRect();
        this.renderer?.setSize(
          Math.max(1, Math.round(r.width)),
          Math.max(1, Math.round(r.height)),
          false,
        );
        if (this.renderer) this.renderer.render(this.scene, this.camera);
      };
      new ResizeObserver(resize).observe(this.container);
      resize();
      addEventListener(
        "pointermove",
        (e) => {
          const r = this.container.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) / Math.max(80, r.width),
            dy = (e.clientY - r.top - r.height * 0.3) / Math.max(100, r.height);
          this.target.x = Math.tanh(dx * 0.65) * 0.55;
          this.target.y = Math.tanh(dy * 0.65) * 0.32;
        },
        { passive: true },
      );
      addEventListener("pointerup", (event) => {
        if (event.pointerType === "touch") this.target = { x: 0, y: 0 };
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => {
        this.target = { x: 0, y: 0 };
      });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) this.start();
      });
      new IntersectionObserver((es) => {
        this.visible = es[0].isIntersecting;
        if (this.visible) this.start();
      }).observe(this.container);
      let clicks = 0;
      this.container.addEventListener("click", () => {
        clicks++;
        if (clicks % 4 === 0 && !this.reduced) this.spin = Math.PI * 2;
      });
      this.start();
    } catch {
      this.canvas.remove();
      this.container.append(
        image(
          BASE + "minecraft/skin/player-front.png",
          "Block player — 3D preview unavailable",
          "skin-fallback",
        ),
      );
    }
  }
  start() {
    if (!this.frame && this.visible && !document.hidden)
      this.frame = requestAnimationFrame((t) => this.draw(t));
  }
  draw(time: number) {
    this.frame = 0;
    if (!this.renderer) return;
    const d = 1 - Math.exp(-Math.min(50, time - this.last || 16) * 0.012);
    this.last = time;
    this.head.rotation.y += (this.target.x - this.head.rotation.y) * d;
    this.head.rotation.x += (this.target.y - this.head.rotation.x) * d;
    const yaw = this.target.x * 0.2 - 0.24;
    this.body.rotation.y += (yaw - this.body.rotation.y) * d;
    if (this.spin > 0) {
      this.spin = Math.max(0, this.spin - 0.14);
      this.body.rotation.y = yaw + this.spin;
    }
    if (!this.reduced)
      this.arms.forEach(
        (a, i) =>
          (a.rotation.z =
            (i ? 1 : -1) * (0.055 + Math.sin(time * 0.0012 + i * 0.5) * 0.012)),
      );
    this.renderer.render(this.scene, this.camera);
    if (this.visible && !document.hidden) this.start();
  }
}
