import * as THREE from "./vendor/three.module.min.js";

const root = document.documentElement;
const stage = document.getElementById("metaverse-stage");
const canvas = document.getElementById("metaverse-canvas");
const startPanel = document.getElementById("world-start");
const startButton = document.getElementById("world-start-button");
const interactionPanel = document.getElementById("world-interaction");
const interactionTitle = document.getElementById("world-interaction-title");
const interactionAction = document.getElementById("world-interaction-action");
const touchControls = document.getElementById("world-touch-controls");
const touchInteract = document.getElementById("world-touch-interact");
const detailDialog = document.getElementById("world-detail-dialog");
const detailTitle = document.getElementById("world-detail-title");
const detailContent = document.getElementById("world-detail-content");
const detailClose = document.getElementById("world-detail-close");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = window.matchMedia("(pointer: coarse)");

const PLAYER_HEIGHT = 1.68;
const WALK_SPEED = 4.2;
const ROOM_LIMIT_X = 11.7;
const ROOM_LIMIT_Z_MIN = -9.6;
const ROOM_LIMIT_Z_MAX = 9.2;
const INTERACTION_DISTANCE = 3.35;
const START_POSITION = new THREE.Vector3(0, PLAYER_HEIGHT, 8.2);
const UP_AXIS = new THREE.Vector3(0, 1, 0);

const stationDefinitions = [
  { id: "about", ko: "소개", en: "ABOUT", code: "01", position: [0, 0, 5.2], rotation: 0 },
  { id: "education", ko: "학력", en: "EDUCATION", code: "02", position: [-8.4, 0, 4.2], rotation: Math.PI / 2 },
  { id: "experience", ko: "경력", en: "EXPERIENCE", code: "03", position: [-8.4, 0, -2.8], rotation: Math.PI / 2 },
  { id: "projects", ko: "프로젝트", en: "PROJECTS", code: "04", position: [0, 0, -8.2], rotation: 0 },
  { id: "publications", ko: "논문 · IP", en: "PUBLICATIONS", code: "05", position: [8.4, 0, -2.8], rotation: -Math.PI / 2 },
  { id: "skills", ko: "스킬", en: "SKILLS", code: "06", position: [8.4, 0, 4.2], rotation: -Math.PI / 2 },
  { id: "awards", ko: "수상", en: "AWARDS", code: "07", position: [0, 0, -2.3], rotation: 0 }
];

const copy = {
  ko: {
    startTitle: "가상 연구실을 탐험하세요",
    startBody: "전시대로 걸어가 <kbd>E</kbd>를 누르면 CV 섹션이 열립니다.",
    startButton: "탐험 시작",
    startControls: "WASD 이동 · 마우스 시점 · E 열기 · R 시작 위치",
    openSuffix: "전시대 열기",
    move: "이동",
    look: "시점",
    open: "열기",
    reset: "위치 초기화",
    touchOpen: "열기",
    close: "전시대 닫기"
  },
  en: {
    startTitle: "Explore the virtual research lab",
    startBody: "Walk up to an exhibit and press <kbd>E</kbd> to open its CV section.",
    startButton: "Start exploring",
    startControls: "WASD move · Mouse look · E open · R reset position",
    openSuffix: "Open exhibit",
    move: "Move",
    look: "Look",
    open: "Open",
    reset: "Reset",
    touchOpen: "Open",
    close: "Close exhibit"
  }
};

const palettes = {
  light: {
    sky: 0xdfe7f1,
    fog: 0xdfe7f1,
    floor: 0xc8d1dc,
    floorAlt: 0xb8c3d0,
    wall: 0xf4f7fa,
    trim: 0x7b8796,
    metal: 0x3f4b5a,
    surface: 0xe9eef4,
    screen: 0x101827,
    grid: 0x8fa0b5,
    ambientSky: 0xffffff,
    ambientGround: 0x7b8796
  },
  dark: {
    sky: 0x070b12,
    fog: 0x070b12,
    floor: 0x111827,
    floorAlt: 0x172033,
    wall: 0x182131,
    trim: 0x5d6b80,
    metal: 0x8996aa,
    surface: 0x222d40,
    screen: 0x05070c,
    grid: 0x334155,
    ambientSky: 0xbfd2f4,
    ambientGround: 0x111827
  }
};

let renderer;
let scene;
let camera;
let grid;
let hemisphereLight;
let animationFrame = 0;
let lastFrameTime = 0;
let enabled = false;
let started = false;
let theme = root.dataset.theme === "dark" ? "dark" : "light";
let language = root.lang === "en" ? "en" : "ko";
let yaw = 0;
let pitch = 0;
let nearestStation = null;
let activeSectionId = null;
let robotArm;
let rover;
let touchLookPointer = null;
let touchLookX = 0;
let touchLookY = 0;

const keys = new Set();
const touchMoves = new Set();
const stations = [];
const themedMaterials = [];
const disposableLabelTextures = [];

function createThemedMaterial(key, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color: palettes[theme][key],
    roughness: options.roughness ?? 0.72,
    metalness: options.metalness ?? 0.08,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
  themedMaterials.push({ material, key });
  return material;
}

function addBox(parent, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  parent.add(mesh);
  return mesh;
}

function createTextTexture(primary, secondary, code, compact = false) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = compact ? 256 : 512;
  const context = labelCanvas.getContext("2d");
  context.fillStyle = "#0b1220";
  context.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  context.fillStyle = "#2563eb";
  context.fillRect(0, 0, 18, labelCanvas.height);
  context.strokeStyle = "#334155";
  context.lineWidth = 4;
  context.strokeRect(2, 2, labelCanvas.width - 4, labelCanvas.height - 4);

  if (compact) {
    context.fillStyle = "#93c5fd";
    context.font = '700 30px "Noto Sans KR", sans-serif';
    context.fillText(code, 58, 62);
    context.fillStyle = "#f8fafc";
    context.font = '800 58px "Noto Sans KR", sans-serif';
    context.fillText(primary, 58, 145);
    context.fillStyle = "#94a3b8";
    context.font = '600 26px "Noto Sans KR", sans-serif';
    context.fillText(secondary, 60, 198);
  } else {
    context.fillStyle = "#93c5fd";
    context.font = '700 38px "Noto Sans KR", sans-serif';
    context.fillText(`MYHUB EXHIBIT // ${code}`, 72, 92);
    context.fillStyle = "#f8fafc";
    context.font = '800 84px "Noto Sans KR", sans-serif';
    context.fillText(primary, 72, 235);
    context.fillStyle = "#94a3b8";
    context.font = '650 42px "Noto Sans KR", sans-serif';
    context.fillText(secondary, 75, 315);
    context.fillStyle = "#2563eb";
    context.fillRect(75, 376, 210, 8);
    context.fillStyle = "#cbd5e1";
    context.font = '600 27px "Noto Sans KR", sans-serif';
    context.fillText("APPROACH + PRESS E", 75, 438);
  }

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy?.() || 1, 4);
  disposableLabelTextures.push(texture);
  return texture;
}

function createWallDisplay() {
  const texture = createTextTexture("이정훈 연구실", "JEONGHUN LEE · VIRTUAL PORTFOLIO", "MYHUB", true);
  const displayMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 2.05), displayMaterial);
  display.position.set(0, 3.65, -10.86);
  scene.add(display);
}

function createRoom() {
  const floorMaterial = createThemedMaterial("floor", { roughness: 0.92 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMaterial = createThemedMaterial("wall", { roughness: 0.88 });
  const trimMaterial = createThemedMaterial("trim", { roughness: 0.52, metalness: 0.34 });

  addBox(scene, [26, 5.8, 0.25], [0, 2.9, -11], wallMaterial, { castShadow: false });
  addBox(scene, [0.25, 5.8, 22], [-13, 2.9, 0], wallMaterial, { castShadow: false });
  addBox(scene, [0.25, 5.8, 22], [13, 2.9, 0], wallMaterial, { castShadow: false });
  addBox(scene, [9.5, 5.8, 0.25], [-8.25, 2.9, 11], wallMaterial, { castShadow: false });
  addBox(scene, [9.5, 5.8, 0.25], [8.25, 2.9, 11], wallMaterial, { castShadow: false });

  for (let x = -10; x <= 10; x += 5) {
    addBox(scene, [0.12, 5.6, 0.12], [x, 2.8, -10.82], trimMaterial, { castShadow: false });
  }
  for (let z = -8; z <= 8; z += 4) {
    addBox(scene, [25.4, 0.1, 0.1], [0, 5.45, z], trimMaterial, { castShadow: false });
  }

  grid = new THREE.GridHelper(25.5, 34, 0x2563eb, palettes[theme].grid);
  grid.position.y = 0.012;
  grid.material.transparent = true;
  grid.material.opacity = theme === "dark" ? 0.24 : 0.18;
  scene.add(grid);

  const accentMaterial = new THREE.MeshBasicMaterial({ color: 0x2563eb });
  addBox(scene, [0.09, 0.018, 18.5], [-3.25, 0.03, -0.3], accentMaterial, { castShadow: false });
  addBox(scene, [0.09, 0.018, 18.5], [3.25, 0.03, -0.3], accentMaterial, { castShadow: false });

  createWallDisplay();
}

function createStation(definition) {
  const group = new THREE.Group();
  group.position.set(definition.position[0], 0, definition.position[2]);
  group.rotation.y = definition.rotation;

  const baseMaterial = createThemedMaterial("metal", { roughness: 0.44, metalness: 0.62 });
  const panelMaterial = createThemedMaterial("screen", {
    roughness: 0.38,
    metalness: 0.18,
    emissive: 0x2563eb,
    emissiveIntensity: 0.12
  });

  addBox(group, [2.5, 0.16, 1.15], [0, 0.08, 0], baseMaterial);
  addBox(group, [0.18, 1.35, 0.18], [0, 0.76, 0], baseMaterial);
  const panel = addBox(group, [3.2, 1.78, 0.18], [0, 1.82, 0], panelMaterial);

  const primary = language === "ko" ? definition.ko : definition.en;
  const secondary = language === "ko" ? definition.en : definition.ko;
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: createTextTexture(primary, secondary, definition.code),
    transparent: false
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.02, 1.51), labelMaterial);
  label.position.set(0, 1.82, 0.1);
  group.add(label);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.23, 48), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.025;
  group.add(ring);

  scene.add(group);
  stations.push({ definition, group, panel, panelMaterial, label, labelMaterial, ring });
}

function updateStationLabels() {
  stations.forEach((station) => {
    const primary = language === "ko" ? station.definition.ko : station.definition.en;
    const secondary = language === "ko" ? station.definition.en : station.definition.ko;
    const oldTexture = station.labelMaterial.map;
    station.labelMaterial.map = createTextTexture(primary, secondary, station.definition.code);
    station.labelMaterial.needsUpdate = true;
    if (oldTexture) {
      oldTexture.dispose();
    }
  });
}

function createRover() {
  rover = new THREE.Group();
  rover.position.set(-3.2, 0.38, -0.4);
  const bodyMaterial = createThemedMaterial("metal", { roughness: 0.35, metalness: 0.62 });
  const surfaceMaterial = createThemedMaterial("surface", { roughness: 0.72 });
  const wheelMaterial = createThemedMaterial("screen", { roughness: 0.76 });

  addBox(rover, [2.4, 0.38, 1.5], [0, 0.48, 0], bodyMaterial);
  addBox(rover, [1.45, 0.38, 0.95], [0, 0.83, 0], surfaceMaterial);

  [-0.85, 0.85].forEach((x) => {
    [-0.62, 0.62].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 20), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.32, z);
      wheel.castShadow = true;
      rover.add(wheel);
    });
  });

  const fanMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.42, metalness: 0.4 });
  [-0.65, 0.65].forEach((x) => {
    const fan = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.09, 12, 28), fanMaterial);
    fan.rotation.x = Math.PI / 2;
    fan.position.set(x, 1.16, 0);
    rover.add(fan);
  });

  scene.add(rover);
}

function createRobotArm() {
  robotArm = new THREE.Group();
  robotArm.position.set(3.4, 0, 0.5);
  const tableMaterial = createThemedMaterial("surface", { roughness: 0.7 });
  const metalMaterial = createThemedMaterial("metal", { roughness: 0.34, metalness: 0.7 });
  addBox(robotArm, [3.2, 0.18, 2], [0, 0.92, 0], tableMaterial);
  [-1.3, 1.3].forEach((x) => {
    [-0.72, 0.72].forEach((z) => addBox(robotArm, [0.14, 0.9, 0.14], [x, 0.46, z], metalMaterial));
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 0.28, 28), metalMaterial);
  base.position.set(0, 1.16, 0);
  base.castShadow = true;
  robotArm.add(base);

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.34,
    metalness: 0.5
  });
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.45, 0.3), jointMaterial);
  upper.position.set(0, 1.92, 0);
  upper.rotation.z = -0.28;
  upper.castShadow = true;
  robotArm.add(upper);
  robotArm.userData.upper = upper;

  const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.25), metalMaterial);
  forearm.position.set(0.48, 2.86, 0);
  forearm.rotation.z = -0.78;
  forearm.castShadow = true;
  robotArm.add(forearm);
  robotArm.userData.forearm = forearm;

  const gripper = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.38), jointMaterial);
  gripper.position.set(0.95, 3.28, 0);
  gripper.castShadow = true;
  robotArm.add(gripper);
  scene.add(robotArm);
}

function createScreens() {
  const screenMaterial = createThemedMaterial("screen", {
    roughness: 0.4,
    emissive: 0x2563eb,
    emissiveIntensity: 0.16
  });
  const frameMaterial = createThemedMaterial("metal", { roughness: 0.44, metalness: 0.62 });

  [-4.3, 4.3].forEach((x, index) => {
    const group = new THREE.Group();
    group.position.set(x, 2.9, -10.65);
    addBox(group, [3.2, 1.7, 0.12], [0, 0, 0], frameMaterial, { castShadow: false });
    const texture = createTextTexture(
      index === 0 ? "STATIC ANALYSIS" : "ROBOTICS",
      index === 0 ? "TRACE · CLONE · LLM" : "CONTROL · CAD · FPGA",
      index === 0 ? "RESEARCH-01" : "RESEARCH-02",
      true
    );
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(3.02, 1.5),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    display.position.z = 0.07;
    group.add(display);
    scene.add(group);
  });
}

function createLighting() {
  const palette = palettes[theme];
  hemisphereLight = new THREE.HemisphereLight(palette.ambientSky, palette.ambientGround, 1.65);
  scene.add(hemisphereLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, theme === "dark" ? 2.1 : 1.8);
  keyLight.position.set(4, 8, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -14;
  keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -12;
  scene.add(keyLight);

  const accentLight = new THREE.PointLight(0x2563eb, theme === "dark" ? 38 : 24, 18, 2);
  accentLight.position.set(0, 4.4, -1.5);
  scene.add(accentLight);
}

function initializeScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(palettes[theme].sky);
  scene.fog = new THREE.Fog(palettes[theme].fog, 15, 34);

  camera = new THREE.PerspectiveCamera(66, 1, 0.08, 70);
  camera.position.copy(START_POSITION);
  camera.rotation.order = "YXZ";

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = theme === "dark" ? 1.18 : 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  createLighting();
  createRoom();
  stationDefinitions.forEach(createStation);
  createRover();
  createRobotArm();
  createScreens();
  resizeRenderer();

  stage.dataset.worldReady = "true";
  stage.dataset.stationCount = String(stations.length);
}

function resizeRenderer() {
  if (!renderer || !camera) {
    return;
  }
  const width = Math.max(stage.clientWidth, 1);
  const height = Math.max(stage.clientHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function resetPlayer() {
  camera.position.copy(START_POSITION);
  yaw = 0;
  pitch = 0;
  camera.rotation.set(pitch, yaw, 0);
  keys.clear();
  touchMoves.clear();
}

function getMoveState(name, code) {
  return touchMoves.has(name) || keys.has(code);
}

function updateMovement(delta) {
  if (!enabled || !started || detailDialog.open) {
    return;
  }

  const forwardAmount = Number(getMoveState("forward", "KeyW") || keys.has("ArrowUp")) -
    Number(getMoveState("backward", "KeyS") || keys.has("ArrowDown"));
  const rightAmount = Number(getMoveState("right", "KeyD") || keys.has("ArrowRight")) -
    Number(getMoveState("left", "KeyA") || keys.has("ArrowLeft"));

  if (!forwardAmount && !rightAmount) {
    return;
  }

  const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(UP_AXIS, yaw);
  const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(UP_AXIS, yaw);
  const direction = forward.multiplyScalar(forwardAmount).add(right.multiplyScalar(rightAmount)).normalize();
  camera.position.addScaledVector(direction, WALK_SPEED * delta);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -ROOM_LIMIT_X, ROOM_LIMIT_X);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_LIMIT_Z_MIN, ROOM_LIMIT_Z_MAX);
  camera.position.y = PLAYER_HEIGHT;
}

function updateNearestStation(elapsed) {
  let nextStation = null;
  let nearestDistance = Infinity;

  stations.forEach((station) => {
    const dx = camera.position.x - station.group.position.x;
    const dz = camera.position.z - station.group.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nextStation = station;
    }
  });

  nearestStation = nearestDistance <= INTERACTION_DISTANCE ? nextStation : null;
  stations.forEach((station) => {
    const active = station === nearestStation;
    station.panelMaterial.emissiveIntensity = active ? 0.72 : 0.12;
    station.ring.material.opacity = active ? 0.82 : 0.34;
    const pulse = active && !reducedMotion.matches ? 1 + Math.sin(elapsed * 4.5) * 0.08 : 1;
    station.ring.scale.setScalar(pulse);
  });

  if (nearestStation) {
    const title = language === "ko" ? nearestStation.definition.ko : nearestStation.definition.en;
    interactionTitle.textContent = title;
    interactionPanel.hidden = false;
    touchInteract.disabled = false;
    stage.dataset.nearbySection = nearestStation.definition.id;
  } else {
    interactionPanel.hidden = true;
    touchInteract.disabled = true;
    delete stage.dataset.nearbySection;
  }
}

function updateDecorations(elapsed) {
  if (reducedMotion.matches) {
    return;
  }
  if (robotArm) {
    robotArm.userData.upper.rotation.z = -0.28 + Math.sin(elapsed * 0.65) * 0.12;
    robotArm.userData.forearm.rotation.z = -0.78 + Math.sin(elapsed * 0.75 + 0.8) * 0.16;
  }
  if (rover) {
    rover.rotation.y = Math.sin(elapsed * 0.28) * 0.04;
  }
}

function renderFrame(time) {
  if (!renderer || !scene || !camera) {
    return;
  }
  const delta = Math.min((time - lastFrameTime) / 1000 || 0, 0.05);
  const elapsed = time / 1000;
  lastFrameTime = time;
  updateMovement(delta);
  updateNearestStation(elapsed);
  updateDecorations(elapsed);
  camera.rotation.set(pitch, yaw, 0);
  stage.dataset.playerX = camera.position.x.toFixed(2);
  stage.dataset.playerZ = camera.position.z.toFixed(2);
  renderer.render(scene, camera);
}

function animate(time) {
  if (!enabled || document.hidden) {
    animationFrame = 0;
    return;
  }
  renderFrame(time);
  animationFrame = window.requestAnimationFrame(animate);
}

function startAnimation() {
  if (!animationFrame && enabled) {
    lastFrameTime = performance.now();
    animationFrame = window.requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function beginExploration() {
  if (!enabled) {
    return;
  }
  started = true;
  stage.dataset.started = "true";
  startPanel.hidden = true;
  if (!coarsePointer.matches) {
    requestPointerLockSafe();
  }
  canvas.focus?.();
}

function requestPointerLockSafe() {
  if (!canvas.requestPointerLock) {
    return;
  }
  try {
    const request = canvas.requestPointerLock();
    if (request && typeof request.catch === "function") {
      request.catch(() => {
        stage.dataset.controls = "free";
      });
    }
  } catch (error) {
    stage.dataset.controls = "free";
  }
}

function endPointerLock() {
  if (document.pointerLockElement === canvas && document.exitPointerLock) {
    document.exitPointerLock();
  }
}

function sanitizeClone(clone) {
  clone.removeAttribute("id");
  clone.removeAttribute("aria-labelledby");
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  clone.querySelectorAll("[aria-labelledby]").forEach((node) => node.removeAttribute("aria-labelledby"));
  clone.querySelectorAll(".project-media-button").forEach((button) => {
    button.type = "button";
    button.setAttribute("aria-disabled", "true");
    button.tabIndex = -1;
  });
  clone.classList.add("world-detail-section");
}

function renderDetail(sectionId) {
  const source = document.getElementById(sectionId);
  if (!source) {
    return false;
  }
  const sourceTitle = source.querySelector("h2");
  const station = stationDefinitions.find((item) => item.id === sectionId);
  detailTitle.textContent = sourceTitle?.textContent?.trim() ||
    (station ? (language === "ko" ? station.ko : station.en) : sectionId);
  const clone = source.cloneNode(true);
  sanitizeClone(clone);
  detailContent.replaceChildren(clone);
  return true;
}

function openSection(sectionId) {
  if (!renderDetail(sectionId)) {
    return;
  }
  activeSectionId = sectionId;
  stage.dataset.openSection = sectionId;
  endPointerLock();
  if (!detailDialog.open && typeof detailDialog.showModal === "function") {
    detailDialog.showModal();
  }
  detailContent.scrollTop = 0;
}

function openNearestStation() {
  if (nearestStation) {
    openSection(nearestStation.definition.id);
  }
}

function closeDetail() {
  if (detailDialog.open) {
    detailDialog.close();
  }
}

function refreshContent() {
  if (activeSectionId && detailDialog.open) {
    renderDetail(activeSectionId);
  }
}

function setEnabled(nextEnabled) {
  enabled = Boolean(nextEnabled);
  stage.dataset.active = String(enabled);
  stage.setAttribute("aria-hidden", String(!enabled));

  if (enabled) {
    started = false;
    stage.dataset.started = "false";
    startPanel.hidden = false;
    resizeRenderer();
    startAnimation();
  } else {
    started = false;
    stage.dataset.started = "false";
    keys.clear();
    touchMoves.clear();
    interactionPanel.hidden = true;
    closeDetail();
    endPointerLock();
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
  scene.background.setHex(palette.sky);
  scene.fog.color.setHex(palette.fog);
  themedMaterials.forEach(({ material, key }) => material.color.setHex(palette[key]));
  if (grid) {
    grid.material.color.setHex(palette.grid);
    grid.material.opacity = theme === "dark" ? 0.24 : 0.18;
  }
  if (hemisphereLight) {
    hemisphereLight.color.setHex(palette.ambientSky);
    hemisphereLight.groundColor.setHex(palette.ambientGround);
  }
  renderer.toneMappingExposure = theme === "dark" ? 1.18 : 1.02;
  renderer.render(scene, camera);
}

function setLanguage(nextLanguage) {
  const next = nextLanguage === "en" ? "en" : "ko";
  const changed = language !== next;
  language = next;
  const text = copy[language];
  startPanel.querySelector("strong").textContent = text.startTitle;
  startPanel.querySelector("p").innerHTML = text.startBody;
  startButton.textContent = text.startButton;
  startPanel.querySelector(".world-start-controls").textContent = text.startControls;
  touchInteract.textContent = text.touchOpen;
  interactionAction.textContent = text.openSuffix;
  document.getElementById("world-help-move").textContent = text.move;
  document.getElementById("world-help-look").textContent = text.look;
  document.getElementById("world-help-open").textContent = text.open;
  document.getElementById("world-help-reset").textContent = text.reset;
  detailClose.setAttribute("aria-label", text.close);
  if (changed && stations.length) {
    updateStationLabels();
  }
  refreshContent();
}

function handleKeyDown(event) {
  if (!enabled || detailDialog.open) {
    return;
  }
  if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
    keys.add(event.code);
  }
  if (event.code === "KeyE" && !event.repeat) {
    event.preventDefault();
    openNearestStation();
  }
  if (event.code === "KeyR" && !event.repeat) {
    event.preventDefault();
    resetPlayer();
  }
}

function handleKeyUp(event) {
  keys.delete(event.code);
}

function handleMouseMove(event) {
  if (!enabled || document.pointerLockElement !== canvas || detailDialog.open) {
    return;
  }
  yaw -= event.movementX * 0.0022;
  pitch -= event.movementY * 0.002;
  pitch = THREE.MathUtils.clamp(pitch, -1.15, 1.15);
}

function handlePointerLockChange() {
  stage.dataset.controls = document.pointerLockElement === canvas ? "locked" : "free";
  keys.clear();
}

function handleCanvasPointerDown(event) {
  if (!enabled || detailDialog.open) {
    return;
  }
  if (event.pointerType === "touch") {
    if (!started) {
      beginExploration();
    }
    touchLookPointer = event.pointerId;
    touchLookX = event.clientX;
    touchLookY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }
  if (!started) {
    beginExploration();
  } else if (document.pointerLockElement !== canvas) {
    requestPointerLockSafe();
  }
}

function handleCanvasPointerMove(event) {
  if (!enabled || event.pointerType !== "touch" || event.pointerId !== touchLookPointer || detailDialog.open) {
    return;
  }
  const dx = event.clientX - touchLookX;
  const dy = event.clientY - touchLookY;
  touchLookX = event.clientX;
  touchLookY = event.clientY;
  yaw -= dx * 0.008;
  pitch -= dy * 0.006;
  pitch = THREE.MathUtils.clamp(pitch, -1.05, 1.05);
}

function releaseTouchLook(event) {
  if (event.pointerId === touchLookPointer) {
    touchLookPointer = null;
  }
}

function bindTouchControls() {
  touchControls.querySelectorAll("[data-move]").forEach((button) => {
    const direction = button.getAttribute("data-move");
    const activate = (event) => {
      event.preventDefault();
      if (!started) {
        beginExploration();
      }
      touchMoves.add(direction);
      button.setPointerCapture?.(event.pointerId);
    };
    const deactivate = (event) => {
      event.preventDefault();
      touchMoves.delete(direction);
    };
    button.addEventListener("pointerdown", activate);
    button.addEventListener("pointerup", deactivate);
    button.addEventListener("pointercancel", deactivate);
    button.addEventListener("pointerleave", deactivate);
  });
}

function bindEvents() {
  startButton.addEventListener("click", beginExploration);
  touchInteract.addEventListener("click", openNearestStation);
  detailClose.addEventListener("click", closeDetail);
  detailDialog.addEventListener("close", () => {
    activeSectionId = null;
    delete stage.dataset.openSection;
  });
  detailDialog.addEventListener("click", (event) => {
    if (event.target === detailDialog) {
      closeDetail();
    }
  });
  detailContent.addEventListener("click", (event) => {
    if (event.target.closest(".project-media-button")) {
      event.preventDefault();
    }
  });
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  canvas.addEventListener("pointermove", handleCanvasPointerMove);
  canvas.addEventListener("pointerup", releaseTouchLook);
  canvas.addEventListener("pointercancel", releaseTouchLook);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("pointerlockchange", handlePointerLockChange);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", resizeRenderer, { passive: true });
  window.addEventListener("blur", () => keys.clear());
  window.addEventListener("myhub-view-change", (event) => {
    setTheme(event.detail?.theme);
    setLanguage(event.detail?.language);
    setEnabled(event.detail?.enabled);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
  reducedMotion.addEventListener("change", () => renderer?.render(scene, camera));
  bindTouchControls();
}

try {
  initializeScene();
  bindEvents();
  setLanguage(language);
  stage.dataset.threeRevision = THREE.REVISION;
  stage.dataset.controls = "free";

  window.MyHubMetaverse = {
    revision: THREE.REVISION,
    setEnabled,
    setTheme,
    setLanguage,
    refreshContent,
    openSection
  };

  setTheme(theme);
  setEnabled(root.dataset.view === "metaverse");
} catch (error) {
  root.classList.add("metaverse-unavailable");
  stage.dataset.active = "false";
  stage.dataset.worldReady = "false";
  stage.setAttribute("aria-hidden", "true");
  window.MyHubMetaverse = {
    revision: THREE.REVISION,
    setEnabled() {},
    setTheme() {},
    setLanguage() {},
    refreshContent() {},
    openSection() {}
  };
  console.error("Unable to initialize the 3D virtual portfolio.", error);
}
