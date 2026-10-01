const canvas = document.getElementById("game");
const crownCount = document.getElementById("crownCount");
const heartCount = document.getElementById("heartCount");
const realmTitle = document.getElementById("realmTitle");
const toast = document.getElementById("toast");
const startPanel = document.getElementById("startPanel");
const winPanel = document.getElementById("winPanel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const playAgainButton = document.getElementById("playAgainButton");

const COLS = 24;
const ROWS = 16;
const keys = new Set();
const tmpBox = new THREE.Box3();
let toastTimer = 0;
let running = false;
let lastTime = 0;
let sceneRoot;
let state;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x130f0c);

const camera = new THREE.OrthographicCamera(-12, 12, 8, -8, 0.1, 200);
camera.position.set(14, 15, 16);
camera.lookAt(0, 0, 0);

const hemi = new THREE.HemisphereLight(0xf8f3d6, 0x26323b, 1.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffe0a3, 2.6);
sun.position.set(5, 12, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
scene.add(sun);

const maps = {
  kings: {
    title: "King's Landing",
    floor: 0x6b3328,
    wall: 0x9f2d24,
    trim: 0xd2a14b,
    accent: 0xf1b63a,
    fog: 0x2b1511,
    spawn: { x: 2.3, z: 12.7 },
    northSpawn: { x: 3.25, z: 12.25 },
    crowns: [
      { x: 7.2, z: 3.0, taken: false },
      { x: 17.6, z: 4.7, taken: false },
      { x: 12.55, z: 11.75, taken: false }
    ],
    enemies: [
      { x: 15.0, z: 7.0, minX: 12.5, maxX: 19.0, speed: 1.7, dir: 1 },
      { x: 5.6, z: 8.9, minX: 4.0, maxX: 9.0, speed: 1.3, dir: -1 }
    ],
    obstacles: [
      rect(0, 0, 24, 1), rect(0, 15, 24, 1), rect(0, 0, 1, 16), rect(23, 0, 1, 16),
      rect(3, 2, 1, 8), rect(4, 2, 5.5, 1), rect(10.5, 2, 1, 6),
      rect(14, 2, 1, 4), rect(15, 5, 6, 1), rect(20, 6, 1, 5.5),
      rect(6, 13, 7, 1), rect(14, 10, 1, 4), rect(15, 10, 4.5, 1),
      rect(2, 11, 4, 1)
    ],
    door: { x: 21.95, z: 11.8, w: 1.05, d: 2.2, open: false },
    beacon: null
  },
  north: {
    title: "North of the Wall",
    floor: 0xcfe8ec,
    wall: 0x5c7280,
    trim: 0xf3fbfc,
    accent: 0x9fd4e5,
    fog: 0x7fa8b5,
    spawn: { x: 2.4, z: 12.5 },
    crowns: [
      { x: 8.5, z: 3.0, taken: false },
      { x: 19.0, z: 9.0, taken: false }
    ],
    enemies: [
      { x: 10.25, z: 8.0, minX: 7.5, maxX: 14.0, speed: 1.9, dir: 1 },
      { x: 18.25, z: 3.75, minX: 16.25, maxX: 21.5, speed: 1.45, dir: -1 }
    ],
    obstacles: [
      rect(0, 0, 24, 1), rect(0, 15, 24, 1), rect(0, 0, 1, 16), rect(23, 0, 1, 16),
      rect(3, 2, 1, 6), rect(4, 2, 6.5, 1), rect(12.5, 2, 1, 7),
      rect(15.5, 4, 5.5, 1), rect(19, 5, 1, 6.5), rect(6, 12, 9, 1),
      rect(15, 13, 5, 1), rect(8, 6, 1, 4), rect(2, 9.5, 4, 1)
    ],
    door: { x: 1, z: 11.8, w: 1.05, d: 2.2, open: true },
    beacon: { x: 21.25, z: 2.3, lit: false }
  }
};

function rect(x, z, w, d) {
  return { x, z, w, d };
}

function resetGame() {
  for (const map of Object.values(maps)) {
    map.crowns.forEach((crown) => {
      crown.taken = false;
    });
    map.enemies.forEach((enemy) => {
      enemy.mesh = null;
    });
    if (map.beacon) {
      map.beacon.lit = false;
      map.beacon.mesh = null;
      map.beacon.flame = null;
    }
    if (map.title === "King's Landing") map.door.open = false;
  }

  state = {
    realm: "kings",
    crowns: 0,
    hearts: 3,
    invulnerable: 0,
    guard: 0,
    won: false,
    player: {
      x: maps.kings.spawn.x,
      z: maps.kings.spawn.z,
      w: 0.72,
      d: 0.72,
      speed: 4.55,
      facing: 1,
      mesh: null,
      shield: null
    }
  };

  rebuildScene();
  updateHud();
  hideWin();
  showToast("The city opens at dusk.");
}

function rebuildScene() {
  if (sceneRoot) scene.remove(sceneRoot);
  sceneRoot = new THREE.Group();
  scene.add(sceneRoot);

  const map = currentMap();
  scene.fog = new THREE.Fog(map.fog, 18, 42);

  drawBoard(map);
  map.crowns.forEach((crown) => {
    crown.mesh = makeCrown();
    crown.mesh.position.set(crown.x - COLS / 2, 0.34, crown.z - ROWS / 2);
    crown.mesh.visible = !crown.taken;
    sceneRoot.add(crown.mesh);
  });

  map.enemies.forEach((enemy) => {
    enemy.mesh = makeMiniFigure(0x222831, 0xbfc9cf, true);
    enemy.mesh.position.set(enemy.x - COLS / 2, 0.08, enemy.z - ROWS / 2);
    sceneRoot.add(enemy.mesh);
  });

  map.door.mesh = makeDoor(map);
  map.door.mesh.position.set(map.door.x + map.door.w / 2 - COLS / 2, 1.05, map.door.z + map.door.d / 2 - ROWS / 2);
  sceneRoot.add(map.door.mesh);
  updateDoorMesh(map);

  if (map.beacon) {
    const beacon = makeBeacon();
    map.beacon.mesh = beacon.group;
    map.beacon.flame = beacon.flame;
    beacon.group.position.set(map.beacon.x - COLS / 2, 0, map.beacon.z - ROWS / 2);
    sceneRoot.add(beacon.group);
  }

  state.player.mesh = makeMiniFigure(0xb21e19, 0xf1b63a, false);
  state.player.shield = makeShield();
  state.player.mesh.add(state.player.shield);
  sceneRoot.add(state.player.mesh);
  syncPlayerMesh();
}

function drawBoard(map) {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(COLS, 0.18, ROWS),
    new THREE.MeshStandardMaterial({ color: map.floor, roughness: 0.86 })
  );
  floor.position.y = -0.11;
  floor.receiveShadow = true;
  sceneRoot.add(floor);

  for (let z = 0; z < ROWS; z += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.045, 0.92),
        new THREE.MeshStandardMaterial({ color: (x + z) % 2 ? shade(map.floor, 0.88) : shade(map.floor, 1.08), roughness: 0.78 })
      );
      tile.position.set(x + 0.5 - COLS / 2, 0.02, z + 0.5 - ROWS / 2);
      tile.receiveShadow = true;
      sceneRoot.add(tile);

      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.08, 18),
        new THREE.MeshStandardMaterial({ color: shade(map.floor, 1.18), roughness: 0.64 })
      );
      stud.position.set(tile.position.x, 0.095, tile.position.z);
      stud.castShadow = true;
      stud.receiveShadow = true;
      sceneRoot.add(stud);
    }
  }

  map.obstacles.forEach((block) => addBrickWall(block, map.wall, map.trim));

  if (state.realm === "kings") {
    addBanner(-10.1, -6.1, 0xf1b63a, 0x46120f);
    addBanner(10.1, -6.1, 0xf1b63a, 0x46120f);
  } else {
    addPines();
    addSnowDrift(-7.3, -3.6);
    addSnowDrift(4.8, 3.5);
  }
}

function addBrickWall(block, fill, trim) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(block.w, 1.25, block.d),
    new THREE.MeshStandardMaterial({ color: fill, roughness: 0.82 })
  );
  wall.position.set(block.x + block.w / 2 - COLS / 2, 0.62, block.z + block.d / 2 - ROWS / 2);
  wall.castShadow = true;
  wall.receiveShadow = true;
  sceneRoot.add(wall);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(block.w + 0.08, 0.08, block.d + 0.08),
    new THREE.MeshStandardMaterial({ color: trim, roughness: 0.7 })
  );
  cap.position.set(wall.position.x, 1.3, wall.position.z);
  cap.castShadow = true;
  sceneRoot.add(cap);

  for (let x = block.x + 0.5; x < block.x + block.w; x += 1) {
    for (let z = block.z + 0.5; z < block.z + block.d; z += 1) {
      const stud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 18),
        new THREE.MeshStandardMaterial({ color: shade(fill, 1.22), roughness: 0.65 })
      );
      stud.position.set(x - COLS / 2, 1.4, z - ROWS / 2);
      stud.castShadow = true;
      sceneRoot.add(stud);
    }
  }
}

function addBanner(x, z, gold, red) {
  const pole = box(0.12, 2.4, 0.12, gold);
  pole.position.set(x, 1.25, z);
  sceneRoot.add(pole);

  const cloth = box(1.1, 1.1, 0.08, red);
  cloth.position.set(x + 0.58, 1.55, z);
  sceneRoot.add(cloth);

  const stripe = box(0.62, 0.12, 0.1, gold);
  stripe.position.set(x + 0.58, 1.82, z - 0.01);
  sceneRoot.add(stripe);
}

function addPines() {
  [
    { x: -8.6, z: -4.25 },
    { x: 10.2, z: 5.1 },
    { x: 4.25, z: -6.2 }
  ].forEach((tree) => {
    const group = new THREE.Group();
    const trunk = box(0.22, 0.8, 0.22, 0x5f4030);
    trunk.position.y = 0.4;
    group.add(trunk);

    for (let i = 0; i < 3; i += 1) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.7 - i * 0.12, 1.0, 4),
        new THREE.MeshStandardMaterial({ color: 0x283c35, roughness: 0.9 })
      );
      cone.position.y = 0.9 + i * 0.45;
      cone.rotation.y = Math.PI / 4;
      cone.castShadow = true;
      group.add(cone);
    }
    group.position.set(tree.x, 0, tree.z);
    sceneRoot.add(group);
  });
}

function addSnowDrift(x, z) {
  const drift = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 })
  );
  drift.scale.set(1.5, 0.12, 0.55);
  drift.position.set(x, 0.15, z);
  drift.receiveShadow = true;
  sceneRoot.add(drift);
}

function makeMiniFigure(torsoColor, headColor, hostile) {
  const group = new THREE.Group();
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.42, 0.48),
    new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.48 })
  );
  head.position.y = 1.56;
  head.castShadow = true;
  group.add(head);

  const stud = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.09, 18),
    new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.45 })
  );
  stud.position.y = 1.82;
  stud.castShadow = true;
  group.add(stud);

  const face = box(0.08, 0.05, 0.025, 0x17120f);
  face.position.set(0.18, 1.58, -0.255);
  group.add(face);

  const torso = box(0.68, 0.58, 0.44, torsoColor);
  torso.position.y = 1.03;
  group.add(torso);

  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.025, 18),
    new THREE.MeshStandardMaterial({ color: hostile ? 0x44525c : 0xf1b63a, roughness: 0.55 })
  );
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0, 1.08, -0.235);
  group.add(badge);

  [-0.43, 0.43].forEach((x) => {
    const arm = box(0.18, 0.62, 0.18, hostile ? 0x44525c : 0xf1b63a);
    arm.position.set(x, 0.98, 0);
    group.add(arm);
  });

  [-0.18, 0.18].forEach((x) => {
    const leg = box(0.24, 0.55, 0.25, 0x151515);
    leg.position.set(x, 0.36, 0);
    group.add(leg);
  });

  return group;
}

function makeShield() {
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: 0xb9e6f4, transparent: true, opacity: 0.48, roughness: 0.25 })
  );
  shield.rotation.x = Math.PI / 2;
  shield.position.set(0.62, 1.05, -0.03);
  shield.visible = false;
  return shield;
}

function makeCrown() {
  const group = new THREE.Group();
  const base = box(0.62, 0.18, 0.3, 0xf6c744);
  base.position.y = 0.16;
  group.add(base);

  [-0.24, 0, 0.24].forEach((x, index) => {
    const point = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, index === 1 ? 0.5 : 0.38, 4),
      new THREE.MeshStandardMaterial({ color: 0xf6c744, roughness: 0.42, metalness: 0.18 })
    );
    point.position.set(x, 0.45, 0);
    point.rotation.y = Math.PI / 4;
    point.castShadow = true;
    group.add(point);
  });

  const shine = box(0.16, 0.08, 0.32, 0xfff1a8);
  shine.position.set(0, 0.18, -0.02);
  group.add(shine);
  return group;
}

function makeDoor(map) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(map.door.w, 2.1, map.door.d),
    new THREE.MeshStandardMaterial({ color: 0x2a201b, roughness: 0.72 })
  );
}

function updateDoorMesh(map) {
  if (!map.door.mesh) return;
  map.door.mesh.visible = !map.door.open;
  map.door.mesh.material.color.set(map.door.open ? 0x14100e : 0x2a201b);
}

function makeBeacon() {
  const group = new THREE.Group();
  const mast = box(0.34, 1.1, 0.34, 0x5c4b42);
  mast.position.y = 0.55;
  group.add(mast);

  const brazier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.72, 0.25, 6),
    new THREE.MeshStandardMaterial({ color: 0x3b2d29, roughness: 0.7 })
  );
  brazier.position.y = 1.16;
  brazier.castShadow = true;
  group.add(brazier);

  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.34, 0.82, 18),
    new THREE.MeshStandardMaterial({ color: 0xffcb3d, emissive: 0xff7a1d, emissiveIntensity: 1.6, transparent: true, opacity: 0.94 })
  );
  flame.position.y = 1.74;
  flame.visible = false;
  group.add(flame);

  return { group, flame };
}

function box(w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function shade(hex, factor) {
  const color = new THREE.Color(hex);
  color.multiplyScalar(factor);
  return color;
}

function updateHud() {
  const map = maps[state.realm];
  crownCount.textContent = state.crowns;
  heartCount.textContent = state.hearts;
  realmTitle.textContent = map.title;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function hideWin() {
  winPanel.classList.add("hidden");
}

function startGame() {
  startPanel.classList.add("hidden");
  if (!running) {
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function currentMap() {
  return maps[state.realm];
}

function attemptMove(dx, dz) {
  const player = state.player;
  const next = { ...player, x: player.x + dx, z: player.z + dz };
  const blockers = [...currentMap().obstacles];
  const door = currentMap().door;
  if (!door.open) blockers.push(door);
  if (!blockers.some((block) => overlap(next, block))) {
    player.x = next.x;
    player.z = next.z;
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.z < b.z + b.d && a.z + a.d > b.z;
}

function near(a, b, distance = 1.35) {
  const ax = a.x + a.w / 2;
  const az = a.z + a.d / 2;
  const bx = b.x + b.w / 2;
  const bz = b.z + b.d / 2;
  return Math.hypot(ax - bx, az - bz) < distance;
}

function interact() {
  const map = currentMap();
  const player = state.player;

  if (map.beacon && near(player, { x: map.beacon.x - 0.5, z: map.beacon.z - 0.5, w: 1, d: 1 }, 1.6)) {
    map.beacon.lit = true;
    if (map.beacon.flame) map.beacon.flame.visible = true;
    state.won = true;
    running = false;
    updateHud();
    winPanel.classList.remove("hidden");
    render();
    return;
  }

  if (near(player, map.door, 1.75)) {
    if (state.realm === "kings") {
      if (state.crowns < 3) {
        showToast("The brick lock needs three crowns.");
        return;
      }
      map.door.open = true;
      state.realm = "north";
      state.player.x = maps.north.spawn.x;
      state.player.z = maps.north.spawn.z;
      rebuildScene();
      updateHud();
      showToast("The secret door drops you north of the Wall.");
      return;
    }
    state.realm = "kings";
    state.player.x = maps.kings.northSpawn.x;
    state.player.z = maps.kings.northSpawn.z;
    rebuildScene();
    updateHud();
    showToast("Warm stone replaces the snow.");
  }
}

function update(dt) {
  const player = state.player;
  let dx = 0;
  let dz = 0;

  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("w")) dz -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dz += 1;

  if (dx !== 0 || dz !== 0) {
    const len = Math.hypot(dx, dz);
    dx /= len;
    dz /= len;
    player.facing = dx < 0 ? -1 : dx > 0 ? 1 : player.facing;
    attemptMove(dx * player.speed * dt, 0);
    attemptMove(0, dz * player.speed * dt);
  }

  state.guard = Math.max(0, state.guard - dt);
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  const map = currentMap();

  for (const enemy of map.enemies) {
    enemy.x += enemy.speed * enemy.dir * dt;
    if (enemy.x < enemy.minX || enemy.x > enemy.maxX) enemy.dir *= -1;
    if (enemy.mesh) {
      enemy.mesh.position.set(enemy.x - COLS / 2, 0.08, enemy.z - ROWS / 2);
      enemy.mesh.rotation.y = enemy.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    const enemyBox = { x: enemy.x, z: enemy.z, w: 0.75, d: 0.75 };
    if (overlap(player, enemyBox) && state.invulnerable <= 0) {
      if (state.guard > 0) {
        enemy.dir *= -1;
        showToast("Shield up. The guard stumbles back.");
      } else {
        state.hearts -= 1;
        state.invulnerable = 1.4;
        player.x = map.spawn.x;
        player.z = map.spawn.z;
        showToast(state.hearts > 0 ? "A patrol shoves you back." : "The watch caught you. Try again.");
        if (state.hearts <= 0) resetGame();
      }
      updateHud();
    }
  }

  for (const crown of map.crowns) {
    if (!crown.taken && overlap(player, { x: crown.x - 0.35, z: crown.z - 0.35, w: 0.7, d: 0.7 })) {
      crown.taken = true;
      if (crown.mesh) crown.mesh.visible = false;
      state.crowns += 1;
      updateHud();
      showToast(state.crowns >= 3 && state.realm === "kings" ? "The hidden lock clicks somewhere east." : "Crown found.");
    }
    if (crown.mesh && !crown.taken) {
      crown.mesh.rotation.y += dt * 2.5;
      crown.mesh.position.y = 0.34 + Math.sin(performance.now() / 220 + crown.x) * 0.06;
    }
  }

  syncPlayerMesh();
  animateBeacon(dt);
}

function syncPlayerMesh() {
  const player = state.player;
  if (!player.mesh) return;
  player.mesh.position.set(player.x - COLS / 2, 0.08, player.z - ROWS / 2);
  player.mesh.rotation.y = player.facing > 0 ? -Math.PI / 2 : Math.PI / 2;
  player.mesh.visible = !(state.invulnerable > 0 && Math.floor(state.invulnerable * 12) % 2 === 0);
  player.shield.visible = state.guard > 0;
}

function animateBeacon(dt) {
  const beacon = currentMap().beacon;
  if (!beacon || !beacon.flame || !beacon.lit) return;
  beacon.flame.rotation.y += dt * 5;
  beacon.flame.scale.setScalar(0.9 + Math.sin(performance.now() / 80) * 0.08);
}

function render() {
  resizeRenderer();
  renderer.render(scene, camera);
}

function loop(time) {
  if (!running) return;
  const dt = Math.min(0.033, (time - lastTime) / 1000);
  lastTime = time;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function resizeRenderer() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const viewHeight = 17;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (key === "e" && running) interact();
  if (event.code === "Space" && running) state.guard = 0.45;
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", () => {
  resetGame();
  startGame();
});
playAgainButton.addEventListener("click", () => {
  resetGame();
  startGame();
});
window.addEventListener("resize", render);

resetGame();
render();
