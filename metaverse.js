import * as THREE from "./vendor/three.module.min.js";

const root = document.documentElement;
const stage = document.getElementById("metaverse-stage");
const canvas = document.getElementById("metaverse-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let renderer;
let scene;
let camera;
let particleField;
let objectGroup;
let grid;
let animationFrame = 0;
let enabled = false;
let theme = root.dataset.theme === "dark" ? "dark" : "light";
let pointerX = 0;
let pointerY = 0;
const accentMaterials = [];
const neutralMaterials = [];

const palettes = {
  light: {
    fog: 0xe9eef7,
    particle: 0x64748b,
    accent: 0x2563eb,
    neutral: 0x475569,
    gridCenter: 0x2563eb,
    gridLine: 0xb7c1d1
  },
  dark: {
    fog: 0x080a10,
    particle: 0xaebbd0,
    accent: 0x2563eb,
    neutral: 0x7d8ca6,
    gridCenter: 0x2563eb,
    gridLine: 0x283248
  }
};

function makeWireMaterial(color, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false
  });
  accentMaterials.push(material);
  return material;
}

function makeNeutralMaterial(color, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false
  });
  neutralMaterials.push(material);
  return material;
}

function createParticleField() {
  const count = 720;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - 0.5) * 26;
    positions[offset + 1] = (Math.random() - 0.5) * 15;
    positions[offset + 2] = (Math.random() - 0.5) * 22 - 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: palettes[theme].particle,
    size: 0.035,
    transparent: true,
    opacity: 0.58,
    sizeAttenuation: true,
    depthWrite: false
  });

  particleField = new THREE.Points(geometry, material);
  scene.add(particleField);
}

function createSceneObjects() {
  objectGroup = new THREE.Group();

  const icosahedron = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    makeWireMaterial(palettes[theme].accent, 0.34)
  );
  icosahedron.position.set(-4.6, 1.65, -2.2);

  const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.7, 0.16, 96, 12),
    makeNeutralMaterial(palettes[theme].neutral, 0.3)
  );
  torusKnot.position.set(4.5, -1.25, -3.4);

  const octahedron = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.72, 1),
    makeWireMaterial(palettes[theme].accent, 0.3)
  );
  octahedron.position.set(3.75, 2.6, -5.5);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.018, 8, 120),
    makeNeutralMaterial(palettes[theme].neutral, 0.2)
  );
  ring.rotation.set(1.15, 0.25, 0.1);
  ring.position.set(-1.2, -0.4, -7);

  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setFromPoints([
    new THREE.Vector3(-5.4, -2.2, -5),
    new THREE.Vector3(-2.4, 2.7, -7),
    new THREE.Vector3(0.2, -1.1, -9),
    new THREE.Vector3(3.9, 2.1, -7),
    new THREE.Vector3(5.1, -2.4, -5)
  ]);
  const nodeMaterial = new THREE.LineBasicMaterial({
    color: palettes[theme].accent,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });
  accentMaterials.push(nodeMaterial);
  const connectionLine = new THREE.Line(nodeGeometry, nodeMaterial);

  objectGroup.add(icosahedron, torusKnot, octahedron, ring, connectionLine);
  scene.add(objectGroup);
}

function createGrid() {
  const palette = palettes[theme];
  grid = new THREE.GridHelper(34, 68, palette.gridCenter, palette.gridLine);
  grid.position.set(0, -3.25, -7);
  grid.material.transparent = true;
  grid.material.opacity = theme === "dark" ? 0.2 : 0.24;
  grid.material.depthWrite = false;
  scene.add(grid);
}

function initializeScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(palettes[theme].fog, 0.035);

  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
  camera.position.set(0, 1.2, 8.5);

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  createParticleField();
  createSceneObjects();
  createGrid();
  resizeRenderer();
}

function resizeRenderer() {
  if (!renderer || !camera) {
    return;
  }
  const width = Math.max(window.innerWidth, 1);
  const height = Math.max(window.innerHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderFrame(0);
}

function renderFrame(time) {
  if (!renderer || !scene || !camera) {
    return;
  }

  const seconds = time * 0.001;
  if (objectGroup) {
    const objects = objectGroup.children;
    if (objects[0]) {
      objects[0].rotation.x = seconds * 0.12;
      objects[0].rotation.y = seconds * 0.18;
    }
    if (objects[1]) {
      objects[1].rotation.x = seconds * -0.08;
      objects[1].rotation.y = seconds * 0.11;
    }
    if (objects[2]) {
      objects[2].rotation.x = seconds * 0.1;
      objects[2].rotation.z = seconds * -0.14;
    }
    objectGroup.rotation.y = Math.sin(seconds * 0.13) * 0.035;
  }

  if (particleField) {
    particleField.rotation.y = seconds * 0.008;
  }

  camera.position.x += (pointerX * 0.4 - camera.position.x) * 0.025;
  camera.position.y += (1.2 + pointerY * 0.25 - camera.position.y) * 0.025;
  camera.lookAt(0, 0, -2);
  renderer.render(scene, camera);
}

function animate(time) {
  if (!enabled || document.hidden || prefersReducedMotion.matches) {
    animationFrame = 0;
    renderFrame(time || 0);
    return;
  }
  renderFrame(time);
  animationFrame = window.requestAnimationFrame(animate);
}

function startAnimation() {
  if (animationFrame || !enabled) {
    return;
  }
  if (prefersReducedMotion.matches) {
    renderFrame(0);
    return;
  }
  animationFrame = window.requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function setEnabled(nextEnabled) {
  enabled = Boolean(nextEnabled);
  stage.dataset.active = String(enabled);
  stage.setAttribute("aria-hidden", String(!enabled));

  if (enabled) {
    resizeRenderer();
    startAnimation();
  } else {
    stopAnimation();
  }
}

function setTheme(nextTheme) {
  theme = nextTheme === "dark" ? "dark" : "light";
  stage.dataset.theme = theme;
  const palette = palettes[theme];

  if (!scene) {
    return;
  }

  scene.fog.color.setHex(palette.fog);
  if (particleField) {
    particleField.material.color.setHex(palette.particle);
  }
  accentMaterials.forEach((material) => material.color.setHex(palette.accent));
  neutralMaterials.forEach((material) => material.color.setHex(palette.neutral));

  if (grid) {
    scene.remove(grid);
    grid.geometry.dispose();
    grid.material.dispose();
    createGrid();
  }

  renderFrame(0);
}

function handlePointer(event) {
  pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
  pointerY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * -2;
}

try {
  initializeScene();
  stage.dataset.threeRevision = THREE.REVISION;

  window.MyHubMetaverse = {
    revision: THREE.REVISION,
    setEnabled,
    setTheme
  };

  window.addEventListener("resize", resizeRenderer, { passive: true });
  window.addEventListener("pointermove", handlePointer, { passive: true });
  window.addEventListener("myhub-view-change", (event) => {
    setTheme(event.detail && event.detail.theme);
    setEnabled(event.detail && event.detail.enabled);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
  prefersReducedMotion.addEventListener("change", () => {
    stopAnimation();
    startAnimation();
  });

  setTheme(root.dataset.theme);
  setEnabled(root.dataset.view === "metaverse");
} catch (error) {
  root.classList.add("metaverse-unavailable");
  stage.dataset.active = "false";
  stage.setAttribute("aria-hidden", "true");
  window.MyHubMetaverse = {
    revision: THREE.REVISION,
    setEnabled() {},
    setTheme() {}
  };
}
