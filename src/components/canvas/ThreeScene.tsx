import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeConfig, Scene3DPreset } from '../../types';

interface ThreeSceneProps {
  enabled?: boolean;
  theme?: ThemeConfig;
  scenePreset?: Scene3DPreset;
}

// ─── Shared helpers ────────────────────────────────────────────────
const buildColorPalette = (primaryHex: string, accentHex: string) => {
  const p = new THREE.Color(primaryHex);
  const a = new THREE.Color(accentHex);
  return [
    p,
    a,
    p.clone().lerp(a, 0.5),
    p.clone().lerp(new THREE.Color('#ffffff'), 0.35),
    new THREE.Color('#ffffff'),
  ];
};

const makeParticleTexture = (): THREE.Texture => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(0.8, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
};

// ─── Scene builder return type ─────────────────────────────────────
interface SceneModule {
  objects: THREE.Object3D[];
  disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[];
  update: (delta: number, elapsed: number, mouseX: number, mouseY: number) => void;
  onThemeChange?: (primary: string, accent: string) => void;
  onClick?: (worldX: number, worldY: number) => void;
}

// ═══════════════════════════════════════════════════════════════════
// Scene 1: COSMIC DRIFT — Upgraded current scene
// ═══════════════════════════════════════════════════════════════════
function buildCosmicDrift(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  // Lights
  const pointLight1 = new THREE.PointLight(new THREE.Color(primary), 2.5, 50);
  pointLight1.position.set(10, 10, 10);
  scene.add(pointLight1);
  objects.push(pointLight1);

  const pointLight2 = new THREE.PointLight(new THREE.Color(accent), 2.5, 50);
  pointLight2.position.set(-10, -10, 10);
  scene.add(pointLight2);
  objects.push(pointLight2);

  // Particles
  const particleCount = 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const originalPositions = new Float32Array(particleCount * 3);
  const currentColors = new Float32Array(particleCount * 3);
  const targetColors = new Float32Array(particleCount * 3);

  let palette = buildColorPalette(primary, accent);

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 40;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;
    const col = palette[Math.floor(Math.random() * palette.length)];
    currentColors[i * 3] = col.r;
    currentColors[i * 3 + 1] = col.g;
    currentColors[i * 3 + 2] = col.b;
    targetColors[i * 3] = col.r;
    targetColors[i * 3 + 1] = col.g;
    targetColors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

  const tex = makeParticleTexture();
  const particleMat = new THREE.PointsMaterial({
    size: 0.4,
    map: tex,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(geometry, particleMat);
  scene.add(particles);
  objects.push(particles);
  disposables.push(geometry, particleMat, tex);

  // Crystals
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(primary),
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.85,
    ior: 1.5,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(crystalMat);

  const wireMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });
  disposables.push(wireMat);

  const icoGeo = new THREE.IcosahedronGeometry(2.6, 0);
  const icosahedron = new THREE.Mesh(icoGeo, crystalMat);
  const wireIco = new THREE.Mesh(icoGeo, wireMat);
  icosahedron.add(wireIco);
  icosahedron.position.set(-9, 4, -4);
  scene.add(icosahedron);
  objects.push(icosahedron);
  disposables.push(icoGeo);

  const octGeo = new THREE.OctahedronGeometry(2.0, 0);
  const octMat = crystalMat.clone();
  octMat.color.set(new THREE.Color(accent));
  const octahedron = new THREE.Mesh(octGeo, octMat);
  octahedron.position.set(10, -5, -3);
  scene.add(octahedron);
  objects.push(octahedron);
  disposables.push(octGeo, octMat);

  const torusGeo = new THREE.TorusGeometry(3.5, 0.08, 16, 100);
  const torusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accent),
    emissive: new THREE.Color(primary),
    emissiveIntensity: 0.4,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.4,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(0, 0, -8);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);
  objects.push(torus);
  disposables.push(torusGeo, torusMat);

  // Shockwave state
  const shockwave = { active: false, x: 0, y: 0, radius: 0, maxRadius: 36, speed: 24, intensity: 0 };

  return {
    objects,
    disposables,
    update(delta, elapsed, _mouseX, _mouseY) {
      // Color morph
      let colorChanged = false;
      for (let i = 0; i < particleCount * 3; i++) {
        if (Math.abs(currentColors[i] - targetColors[i]) > 0.002) {
          currentColors[i] += (targetColors[i] - currentColors[i]) * 0.04;
          colorChanged = true;
        }
      }
      if (colorChanged) geometry.attributes.color.needsUpdate = true;

      // Shockwave
      let posChanged = false;
      if (shockwave.active) {
        shockwave.radius += shockwave.speed * delta;
        shockwave.intensity *= 0.94;
        if (shockwave.radius > shockwave.maxRadius || shockwave.intensity < 0.03) shockwave.active = false;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const dx = originalPositions[idx] - shockwave.x;
          const dy = originalPositions[idx + 1] - shockwave.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ringDiff = Math.abs(dist - shockwave.radius);
          if (ringDiff < 4.0) {
            const force = (1 - ringDiff / 4.0) * shockwave.intensity * 2.5;
            positions[idx] = originalPositions[idx] + (dx / (dist || 1)) * force;
            positions[idx + 1] = originalPositions[idx + 1] + (dy / (dist || 1)) * force;
            positions[idx + 2] = originalPositions[idx + 2] + Math.sin(ringDiff) * force * 2.0;
            posChanged = true;
          } else if (Math.abs(positions[idx] - originalPositions[idx]) > 0.01) {
            positions[idx] += (originalPositions[idx] - positions[idx]) * 0.1;
            positions[idx + 1] += (originalPositions[idx + 1] - positions[idx + 1]) * 0.1;
            positions[idx + 2] += (originalPositions[idx + 2] - positions[idx + 2]) * 0.1;
            posChanged = true;
          }
        }
      } else {
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          if (Math.abs(positions[idx] - originalPositions[idx]) > 0.01) {
            positions[idx] += (originalPositions[idx] - positions[idx]) * 0.1;
            positions[idx + 1] += (originalPositions[idx + 1] - positions[idx + 1]) * 0.1;
            positions[idx + 2] += (originalPositions[idx + 2] - positions[idx + 2]) * 0.1;
            posChanged = true;
          }
        }
      }
      if (posChanged) geometry.attributes.position.needsUpdate = true;

      particles.rotation.y = elapsed * 0.03 + _mouseX * 2;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.1 - _mouseY * 2;

      icosahedron.rotation.x = elapsed * 0.2;
      icosahedron.rotation.y = elapsed * 0.25;
      icosahedron.position.y = 4 + Math.sin(elapsed * 0.6) * 0.5;

      octahedron.rotation.x = -elapsed * 0.25;
      octahedron.rotation.z = elapsed * 0.15;
      octahedron.position.y = -5 + Math.cos(elapsed * 0.7) * 0.6;

      torus.rotation.z = elapsed * 0.1;
      torus.rotation.y = Math.sin(elapsed * 0.3) * 0.2;
    },
    onThemeChange(p, a) {
      const newPalette = buildColorPalette(p, a);
      palette = newPalette;
      for (let i = 0; i < particleCount; i++) {
        const col = newPalette[Math.floor(Math.random() * newPalette.length)];
        targetColors[i * 3] = col.r;
        targetColors[i * 3 + 1] = col.g;
        targetColors[i * 3 + 2] = col.b;
      }
      const pc = new THREE.Color(p);
      const ac = new THREE.Color(a);
      pointLight1.color.copy(pc);
      pointLight2.color.copy(ac);
      crystalMat.color.copy(pc);
      octMat.color.copy(ac);
      wireMat.color.copy(ac);
      torusMat.color.copy(ac);
      torusMat.emissive.copy(pc);
    },
    onClick(wx, wy) {
      shockwave.x = wx;
      shockwave.y = wy;
      shockwave.radius = 0.5;
      shockwave.intensity = 1.0;
      shockwave.active = true;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene 2: GALAXY SPIRAL — Logarithmic spiral arms + shooting stars
// ═══════════════════════════════════════════════════════════════════
function buildGalaxySpiral(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  // Core glow light
  const coreLight = new THREE.PointLight(new THREE.Color(primary), 4, 60);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);
  objects.push(coreLight);

  const rimLight = new THREE.PointLight(new THREE.Color(accent), 1.5, 80);
  rimLight.position.set(0, 5, -10);
  scene.add(rimLight);
  objects.push(rimLight);

  // Galaxy particles in spiral arms
  const armCount = 4;
  const particlesPerArm = 750;
  const totalParticles = armCount * particlesPerArm;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(totalParticles * 3);
  const cols = new Float32Array(totalParticles * 3);
  const sizes = new Float32Array(totalParticles);

  let palette = buildColorPalette(primary, accent);

  for (let arm = 0; arm < armCount; arm++) {
    const armAngleOffset = (arm / armCount) * Math.PI * 2;
    for (let i = 0; i < particlesPerArm; i++) {
      const idx = (arm * particlesPerArm + i);
      const t = i / particlesPerArm;
      const radius = t * 20 + 0.3;
      const spiralAngle = armAngleOffset + t * Math.PI * 3.2;
      const scatter = (1 - t * 0.5) * 1.8;

      pos[idx * 3] = Math.cos(spiralAngle) * radius + (Math.random() - 0.5) * scatter;
      pos[idx * 3 + 1] = (Math.random() - 0.5) * scatter * 0.4;
      pos[idx * 3 + 2] = Math.sin(spiralAngle) * radius + (Math.random() - 0.5) * scatter;

      const col = palette[Math.floor(Math.random() * palette.length)];
      cols[idx * 3] = col.r;
      cols[idx * 3 + 1] = col.g;
      cols[idx * 3 + 2] = col.b;
      sizes[idx] = (1 - t * 0.7) * 0.5 + Math.random() * 0.2;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

  const tex = makeParticleTexture();
  const mat = new THREE.PointsMaterial({
    size: 0.35,
    map: tex,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const galaxyPoints = new THREE.Points(geo, mat);
  galaxyPoints.rotation.x = Math.PI * 0.35;
  scene.add(galaxyPoints);
  objects.push(galaxyPoints);
  disposables.push(geo, mat, tex);

  // Core glow sphere
  const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primary),
    transparent: true,
    opacity: 0.6,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.rotation.x = Math.PI * 0.35;
  scene.add(coreMesh);
  objects.push(coreMesh);
  disposables.push(coreGeo, coreMat);

  // Outer glow halo
  const haloGeo = new THREE.SphereGeometry(2.0, 32, 32);
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  scene.add(haloMesh);
  objects.push(haloMesh);
  disposables.push(haloGeo, haloMat);

  // Shooting stars
  const shootingStars: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];
  const shootGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const shootMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(shootGeo, shootMat);

  let spawnTimer = 0;

  return {
    objects,
    disposables,
    update(delta, elapsed, mouseX, mouseY) {
      galaxyPoints.rotation.y = elapsed * 0.04;
      coreMesh.scale.setScalar(1.0 + Math.sin(elapsed * 2) * 0.15);
      haloMesh.scale.setScalar(1.0 + Math.sin(elapsed * 1.5) * 0.1);

      // Shooting stars
      spawnTimer += delta;
      if (spawnTimer > 1.2 + Math.random() * 2) {
        spawnTimer = 0;
        const star = new THREE.Mesh(shootGeo, shootMat.clone());
        star.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 15 + 5, (Math.random() - 0.5) * 10 - 5);
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          -Math.random() * 12 - 5,
          (Math.random() - 0.5) * 5,
        );
        scene.add(star);
        objects.push(star);
        shootingStars.push({ mesh: star, vel, life: 0, maxLife: 1.2 + Math.random() * 0.8 });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life += delta;
        s.mesh.position.addScaledVector(s.vel, delta);
        const opacity = 1 - s.life / s.maxLife;
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = opacity * 0.9;
        if (s.life >= s.maxLife) {
          scene.remove(s.mesh);
          const objIdx = objects.indexOf(s.mesh);
          if (objIdx > -1) objects.splice(objIdx, 1);
          (s.mesh.material as THREE.Material).dispose();
          shootingStars.splice(i, 1);
        }
      }

      // gentle parallax tilt
      galaxyPoints.rotation.z = mouseX * 0.3;
      galaxyPoints.position.y = mouseY * -2;
    },
    onThemeChange(p, a) {
      palette = buildColorPalette(p, a);
      const pc = new THREE.Color(p);
      const ac = new THREE.Color(a);
      coreLight.color.copy(pc);
      rimLight.color.copy(ac);
      coreMat.color.copy(pc);
      haloMat.color.copy(ac);
      // Re-color particles gradually
      for (let i = 0; i < totalParticles; i++) {
        const col = palette[Math.floor(Math.random() * palette.length)];
        cols[i * 3] = col.r;
        cols[i * 3 + 1] = col.g;
        cols[i * 3 + 2] = col.b;
      }
      geo.attributes.color.needsUpdate = true;
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene 3: NEURAL PLEXUS — Connected nodes + synaptic pulses
// ═══════════════════════════════════════════════════════════════════
function buildNeuralPlexus(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  const light1 = new THREE.PointLight(new THREE.Color(primary), 2, 60);
  light1.position.set(8, 8, 8);
  scene.add(light1);
  objects.push(light1);

  const light2 = new THREE.PointLight(new THREE.Color(accent), 2, 60);
  light2.position.set(-8, -8, 8);
  scene.add(light2);
  objects.push(light2);

  // Nodes
  const nodeCount = 140;
  const connectionDist = 7;
  const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primary),
    transparent: true,
    opacity: 0.85,
  });
  disposables.push(nodeGeo, nodeMat);

  interface NodeData {
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    basePos: THREE.Vector3;
  }
  const nodes: NodeData[] = [];
  const group = new THREE.Group();

  for (let i = 0; i < nodeCount; i++) {
    const m = new THREE.Mesh(nodeGeo, nodeMat);
    const p = new THREE.Vector3(
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 25,
      (Math.random() - 0.5) * 20,
    );
    m.position.copy(p);
    const glowScale = 0.8 + Math.random() * 0.5;
    m.scale.setScalar(glowScale);
    group.add(m);
    nodes.push({
      mesh: m,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.2,
      ),
      basePos: p.clone(),
    });
  }
  scene.add(group);
  objects.push(group);

  // Connection lines
  const lineGeo = new THREE.BufferGeometry();
  const maxLines = 600;
  const linePositions = new Float32Array(maxLines * 6);
  const lineColors = new Float32Array(maxLines * 6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);
  objects.push(lines);
  disposables.push(lineGeo, lineMat);

  // Synaptic pulse particles
  const pulseGeo = new THREE.BufferGeometry();
  const pulseCount = 80;
  const pulsePos = new Float32Array(pulseCount * 3);
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));

  const pulseTex = makeParticleTexture();
  const pulseMat = new THREE.PointsMaterial({
    size: 0.25,
    map: pulseTex,
    transparent: true,
    color: new THREE.Color(accent),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.8,
  });
  const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
  scene.add(pulsePoints);
  objects.push(pulsePoints);
  disposables.push(pulseGeo, pulseMat, pulseTex);

  interface Pulse {
    from: THREE.Vector3;
    to: THREE.Vector3;
    t: number;
    speed: number;
    idx: number;
  }
  const pulses: Pulse[] = [];
  let pulseSpawnTimer = 0;
  let activePulseIdx = 0;

  // Mouse gravity
  let mouseWorldX = 0;
  let mouseWorldY = 0;

  return {
    objects,
    disposables,
    update(delta, elapsed, mouseX, mouseY) {
      mouseWorldX = mouseX * 25;
      mouseWorldY = -mouseY * 18;

      // Move nodes
      for (const nd of nodes) {
        nd.mesh.position.addScaledVector(nd.vel, delta);
        // Gentle drift + boundaries
        const drift = 0.15;
        nd.mesh.position.x += Math.sin(elapsed * 0.3 + nd.basePos.x) * drift * delta;
        nd.mesh.position.y += Math.cos(elapsed * 0.4 + nd.basePos.y) * drift * delta;

        // Mouse gravity pull
        const dx = mouseWorldX - nd.mesh.position.x;
        const dy = mouseWorldY - nd.mesh.position.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < 10) {
          const pull = (1 - distMouse / 10) * 2.5 * delta;
          nd.mesh.position.x += dx * pull;
          nd.mesh.position.y += dy * pull;
        }

        // Return to bounds
        if (Math.abs(nd.mesh.position.x) > 20) nd.vel.x *= -1;
        if (Math.abs(nd.mesh.position.y) > 14) nd.vel.y *= -1;
        if (Math.abs(nd.mesh.position.z) > 12) nd.vel.z *= -1;

        // Gentle pulsing glow
        const pulse = 0.8 + Math.sin(elapsed * 2 + nd.basePos.x * 0.5) * 0.3;
        nd.mesh.scale.setScalar(pulse);
      }

      // Build connections
      let lineCount = 0;
      const pc = new THREE.Color(primary);
      const ac = new THREE.Color(accent);

      for (let i = 0; i < nodeCount && lineCount < maxLines; i++) {
        for (let j = i + 1; j < nodeCount && lineCount < maxLines; j++) {
          const dist = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
          if (dist < connectionDist) {
            const alpha = 1 - dist / connectionDist;
            const idx = lineCount * 6;
            linePositions[idx] = nodes[i].mesh.position.x;
            linePositions[idx + 1] = nodes[i].mesh.position.y;
            linePositions[idx + 2] = nodes[i].mesh.position.z;
            linePositions[idx + 3] = nodes[j].mesh.position.x;
            linePositions[idx + 4] = nodes[j].mesh.position.y;
            linePositions[idx + 5] = nodes[j].mesh.position.z;

            const blendCol = pc.clone().lerp(ac, alpha);
            lineColors[idx] = blendCol.r;
            lineColors[idx + 1] = blendCol.g;
            lineColors[idx + 2] = blendCol.b;
            lineColors[idx + 3] = blendCol.r;
            lineColors[idx + 4] = blendCol.g;
            lineColors[idx + 5] = blendCol.b;
            lineCount++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineCount * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // Spawn pulses
      pulseSpawnTimer += delta;
      if (pulseSpawnTimer > 0.15 && pulses.length < pulseCount) {
        pulseSpawnTimer = 0;
        // pick random connection-worthy pair
        const i = Math.floor(Math.random() * nodeCount);
        let closestJ = -1;
        let closestDist = connectionDist;
        for (let j = 0; j < nodeCount; j++) {
          if (j === i) continue;
          const d = nodes[i].mesh.position.distanceTo(nodes[j].mesh.position);
          if (d < closestDist) {
            closestDist = d;
            closestJ = j;
          }
        }
        if (closestJ >= 0) {
          pulses.push({
            from: nodes[i].mesh.position.clone(),
            to: nodes[closestJ].mesh.position.clone(),
            t: 0,
            speed: 1.5 + Math.random(),
            idx: activePulseIdx % pulseCount,
          });
          activePulseIdx++;
        }
      }

      // Animate pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += delta * p.speed;
        if (p.t >= 1) {
          pulsePos[p.idx * 3] = 0;
          pulsePos[p.idx * 3 + 1] = 0;
          pulsePos[p.idx * 3 + 2] = -1000;
          pulses.splice(i, 1);
        } else {
          pulsePos[p.idx * 3] = p.from.x + (p.to.x - p.from.x) * p.t;
          pulsePos[p.idx * 3 + 1] = p.from.y + (p.to.y - p.from.y) * p.t;
          pulsePos[p.idx * 3 + 2] = p.from.z + (p.to.z - p.from.z) * p.t;
        }
      }
      pulseGeo.attributes.position.needsUpdate = true;
    },
    onThemeChange(p, a) {
      const pc = new THREE.Color(p);
      const ac = new THREE.Color(a);
      light1.color.copy(pc);
      light2.color.copy(ac);
      nodeMat.color.copy(pc);
      pulseMat.color.copy(ac);
    },
    onClick(wx, wy) {
      // Scatter nodes near click point
      for (const nd of nodes) {
        const dx = nd.mesh.position.x - wx;
        const dy = nd.mesh.position.y - wy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 8) {
          const force = (1 - dist / 8) * 6;
          nd.vel.x += (dx / (dist || 1)) * force;
          nd.vel.y += (dy / (dist || 1)) * force;
        }
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene 4: AURORA WAVES — Flowing ribbon waves + bioluminescent orbs
// ═══════════════════════════════════════════════════════════════════
function buildAuroraWaves(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  const light1 = new THREE.PointLight(new THREE.Color(primary), 2.5, 50);
  light1.position.set(0, 8, 5);
  scene.add(light1);
  objects.push(light1);

  const light2 = new THREE.PointLight(new THREE.Color(accent), 2, 50);
  light2.position.set(0, -5, 8);
  scene.add(light2);
  objects.push(light2);

  // Create flowing ribbon meshes
  const ribbonCount = 6;
  const ribbonGroup = new THREE.Group();
  const ribbons: { mesh: THREE.Mesh; geo: THREE.PlaneGeometry; origPositions: Float32Array; phase: number; speed: number; amplitude: number }[] = [];

  const pc = new THREE.Color(primary);
  const ac = new THREE.Color(accent);

  for (let r = 0; r < ribbonCount; r++) {
    const segW = 120;
    const segH = 1;
    const ribbonGeo = new THREE.PlaneGeometry(40, 1.2 + Math.random() * 0.8, segW, segH);
    const origPos = new Float32Array(ribbonGeo.attributes.position.array.length);
    origPos.set(ribbonGeo.attributes.position.array as Float32Array);

    const blendT = r / (ribbonCount - 1);
    const ribbonColor = pc.clone().lerp(ac, blendT);

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: ribbonColor,
      emissive: ribbonColor.clone().multiplyScalar(0.3),
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.3,
      transmission: 0.6,
      ior: 1.3,
      transparent: true,
      opacity: 0.35 - r * 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    mesh.position.y = (r - ribbonCount / 2) * 2.5;
    mesh.position.z = -5 - r * 1.5;
    mesh.rotation.x = Math.PI * 0.1;
    ribbonGroup.add(mesh);

    ribbons.push({
      mesh,
      geo: ribbonGeo,
      origPositions: origPos,
      phase: r * 1.2,
      speed: 0.5 + r * 0.12,
      amplitude: 1.8 + r * 0.4,
    });
    disposables.push(ribbonGeo, ribbonMat);
  }
  scene.add(ribbonGroup);
  objects.push(ribbonGroup);

  // Bioluminescent floating orbs
  const orbCount = 60;
  const orbGeo = new THREE.SphereGeometry(0.15, 12, 12);
  const orbMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.6,
  });
  disposables.push(orbGeo, orbMat);

  interface Orb {
    mesh: THREE.Mesh;
    baseY: number;
    phase: number;
    speed: number;
  }
  const orbs: Orb[] = [];
  const orbGroup = new THREE.Group();

  for (let i = 0; i < orbCount; i++) {
    const m = new THREE.Mesh(orbGeo, orbMat);
    m.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 15 - 5,
    );
    const scale = 0.5 + Math.random() * 1.2;
    m.scale.setScalar(scale);
    orbGroup.add(m);
    orbs.push({
      mesh: m,
      baseY: m.position.y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
    });
  }
  scene.add(orbGroup);
  objects.push(orbGroup);

  return {
    objects,
    disposables,
    update(delta, elapsed, mouseX, mouseY) {
      // Animate ribbons with sine-wave vertex displacement
      for (const rb of ribbons) {
        const posArr = rb.geo.attributes.position.array as Float32Array;
        const origArr = rb.origPositions;
        for (let i = 0; i < posArr.length; i += 3) {
          const ox = origArr[i];
          const normalizedX = (ox + 20) / 40;
          posArr[i + 1] = origArr[i + 1] +
            Math.sin(normalizedX * Math.PI * 3 + elapsed * rb.speed + rb.phase) * rb.amplitude +
            Math.sin(normalizedX * Math.PI * 5 + elapsed * rb.speed * 1.7 + rb.phase * 0.5) * rb.amplitude * 0.3;
          posArr[i + 2] = origArr[i + 2] +
            Math.cos(normalizedX * Math.PI * 2 + elapsed * rb.speed * 0.8 + rb.phase) * rb.amplitude * 0.5;
        }
        rb.geo.attributes.position.needsUpdate = true;
        rb.geo.computeVertexNormals();
      }

      // Mouse influence on ribbon group
      ribbonGroup.rotation.z = mouseX * 0.15;
      ribbonGroup.position.y = mouseY * -3;

      // Animate orbs
      for (const orb of orbs) {
        orb.mesh.position.y = orb.baseY + Math.sin(elapsed * orb.speed + orb.phase) * 1.5;
        const pulseScale = 0.7 + Math.sin(elapsed * 1.5 + orb.phase) * 0.3;
        orb.mesh.scale.setScalar(pulseScale);
      }
    },
    onThemeChange(p, a) {
      const newPc = new THREE.Color(p);
      const newAc = new THREE.Color(a);
      light1.color.copy(newPc);
      light2.color.copy(newAc);
      orbMat.color.copy(newAc);
      // Update ribbon colors
      for (let r = 0; r < ribbons.length; r++) {
        const blendT = r / (ribbonCount - 1);
        const newCol = newPc.clone().lerp(newAc, blendT);
        const mat = ribbons[r].mesh.material as THREE.MeshPhysicalMaterial;
        mat.color.copy(newCol);
        mat.emissive.copy(newCol.clone().multiplyScalar(0.3));
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene 5: CYBER GRID — Infinite neon terrain + wireframe sun
// ═══════════════════════════════════════════════════════════════════
function buildCyberGrid(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  // Ambient glow
  const hemiLight = new THREE.HemisphereLight(
    new THREE.Color(primary).multiplyScalar(0.3),
    new THREE.Color(accent).multiplyScalar(0.1),
    0.8,
  );
  scene.add(hemiLight);
  objects.push(hemiLight);

  const sunLight = new THREE.PointLight(new THREE.Color(accent), 3, 80);
  sunLight.position.set(0, 6, -35);
  scene.add(sunLight);
  objects.push(sunLight);

  // Terrain grid plane
  const gridW = 60;
  const gridD = 60;
  const gridSegW = 80;
  const gridSegD = 80;
  const terrainGeo = new THREE.PlaneGeometry(gridW, gridD, gridSegW, gridSegD);
  terrainGeo.rotateX(-Math.PI / 2);
  const origTerrainPos = new Float32Array(terrainGeo.attributes.position.array.length);
  origTerrainPos.set(terrainGeo.attributes.position.array as Float32Array);

  const terrainMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primary),
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.position.y = -8;
  terrain.position.z = -10;
  scene.add(terrain);
  objects.push(terrain);
  disposables.push(terrainGeo, terrainMat);

  // Wireframe sun on horizon
  const sunGeo = new THREE.IcosahedronGeometry(5, 1);
  const sunMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(0, 2, -35);
  scene.add(sun);
  objects.push(sun);
  disposables.push(sunGeo, sunMat);

  // Sun inner glow
  const sunGlowGeo = new THREE.SphereGeometry(4.5, 32, 32);
  const sunGlowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.12,
  });
  const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
  sunGlow.position.copy(sun.position);
  scene.add(sunGlow);
  objects.push(sunGlow);
  disposables.push(sunGlowGeo, sunGlowMat);

  // Vertical scan lines
  const scanLineGroup = new THREE.Group();
  const scanCount = 12;
  for (let i = 0; i < scanCount; i++) {
    const lineGeo = new THREE.PlaneGeometry(0.03, 25);
    const lineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primary),
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.position.set((i - scanCount / 2) * 5, 0, -15);
    scanLineGroup.add(lineMesh);
    disposables.push(lineGeo, lineMat);
  }
  scene.add(scanLineGroup);
  objects.push(scanLineGroup);

  // Floating data particles
  const dataCount = 200;
  const dataGeo = new THREE.BufferGeometry();
  const dataPos = new Float32Array(dataCount * 3);
  const dataCol = new Float32Array(dataCount * 3);
  const pcCol = new THREE.Color(primary);
  const acCol = new THREE.Color(accent);

  for (let i = 0; i < dataCount; i++) {
    dataPos[i * 3] = (Math.random() - 0.5) * 50;
    dataPos[i * 3 + 1] = Math.random() * 15 - 5;
    dataPos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    const c = Math.random() > 0.5 ? pcCol : acCol;
    dataCol[i * 3] = c.r;
    dataCol[i * 3 + 1] = c.g;
    dataCol[i * 3 + 2] = c.b;
  }
  dataGeo.setAttribute('position', new THREE.BufferAttribute(dataPos, 3));
  dataGeo.setAttribute('color', new THREE.BufferAttribute(dataCol, 3));

  const dataTex = makeParticleTexture();
  const dataMat = new THREE.PointsMaterial({
    size: 0.15,
    map: dataTex,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dataPoints = new THREE.Points(dataGeo, dataMat);
  scene.add(dataPoints);
  objects.push(dataPoints);
  disposables.push(dataGeo, dataMat, dataTex);

  // Simple Perlin-like noise using sin harmonics
  const noise = (x: number, z: number, t: number) => {
    return Math.sin(x * 0.3 + t * 0.5) * Math.cos(z * 0.2 + t * 0.3) * 2.5 +
      Math.sin(x * 0.15 + t * 0.2) * 1.5 +
      Math.cos(z * 0.1 + t * 0.15) * 1.0;
  };

  let mouseRippleX = 0;
  let mouseRippleY = 0;

  return {
    objects,
    disposables,
    update(delta, elapsed, mouseX, mouseY) {
      mouseRippleX = mouseX * 20;
      mouseRippleY = mouseY * 15;

      // Animate terrain with scrolling noise + cursor ripple
      const posArr = terrainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < posArr.length; i += 3) {
        const ox = origTerrainPos[i];
        const oz = origTerrainPos[i + 2];
        // Scroll forward
        const scrolledZ = oz + elapsed * 3;
        let height = noise(ox, scrolledZ, elapsed);

        // Cursor ripple
        const dx = ox - mouseRippleX;
        const dz = oz - mouseRippleY;
        const cursorDist = Math.sqrt(dx * dx + dz * dz);
        if (cursorDist < 8) {
          height += (1 - cursorDist / 8) * Math.sin(elapsed * 4 + cursorDist) * 2;
        }

        posArr[i + 1] = height;
      }
      terrainGeo.attributes.position.needsUpdate = true;

      // Rotate sun
      sun.rotation.y = elapsed * 0.15;
      sun.rotation.x = elapsed * 0.08;
      sunGlow.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.1);

      // Animate data particles upward drift
      for (let i = 0; i < dataCount; i++) {
        dataPos[i * 3 + 1] += delta * (0.5 + Math.sin(i) * 0.3);
        if (dataPos[i * 3 + 1] > 12) dataPos[i * 3 + 1] = -6;
      }
      dataGeo.attributes.position.needsUpdate = true;
    },
    onThemeChange(p, a) {
      const pc = new THREE.Color(p);
      const ac = new THREE.Color(a);
      terrainMat.color.copy(pc);
      sunMat.color.copy(ac);
      sunGlowMat.color.copy(ac);
      sunLight.color.copy(ac);
      hemiLight.color.copy(pc.clone().multiplyScalar(0.3));
      hemiLight.groundColor.copy(ac.clone().multiplyScalar(0.1));
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene 6: EXOPLANET — Ringed planet + orbital gyroscope rings
// ═══════════════════════════════════════════════════════════════════
function buildExoplanet(
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const objects: THREE.Object3D[] = [];

  // Distant star light
  const starLight = new THREE.PointLight(0xffffff, 1.5, 80);
  starLight.position.set(20, 15, 10);
  scene.add(starLight);
  objects.push(starLight);

  const rimLight = new THREE.PointLight(new THREE.Color(accent), 2, 40);
  rimLight.position.set(-10, -5, 10);
  scene.add(rimLight);
  objects.push(rimLight);

  // Planet core
  const planetGeo = new THREE.SphereGeometry(4, 64, 64);
  const planetMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(primary).multiplyScalar(0.3),
    metalness: 0.4,
    roughness: 0.6,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.set(-2, 0, -5);
  scene.add(planet);
  objects.push(planet);
  disposables.push(planetGeo, planetMat);

  // Atmospheric rim glow (Fresnel approximation via larger sphere)
  const atmosGeo = new THREE.SphereGeometry(4.3, 64, 64);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
  atmosphere.position.copy(planet.position);
  scene.add(atmosphere);
  objects.push(atmosphere);
  disposables.push(atmosGeo, atmosMat);

  // Inner atmosphere glow ring
  const innerGlowGeo = new THREE.SphereGeometry(4.15, 64, 64);
  const innerGlowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(primary),
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
  });
  const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
  innerGlow.position.copy(planet.position);
  scene.add(innerGlow);
  objects.push(innerGlow);
  disposables.push(innerGlowGeo, innerGlowMat);

  // Orbital rings (Armillary sphere)
  const ringCount = 5;
  const ringGroup = new THREE.Group();
  ringGroup.position.copy(planet.position);

  const ringConfigs = [
    { radius: 6.5, tube: 0.04, tiltX: 0.3, tiltZ: 0, speedY: 0.12, speedX: 0.05 },
    { radius: 7.5, tube: 0.03, tiltX: -0.5, tiltZ: 0.8, speedY: -0.08, speedX: 0.03 },
    { radius: 8.5, tube: 0.035, tiltX: 0.9, tiltZ: -0.3, speedY: 0.15, speedX: -0.04 },
    { radius: 5.5, tube: 0.05, tiltX: -0.2, tiltZ: 1.2, speedY: -0.1, speedX: 0.06 },
    { radius: 9.5, tube: 0.025, tiltX: 0.6, tiltZ: -0.9, speedY: 0.06, speedX: -0.02 },
  ];

  const ringMeshes: { mesh: THREE.Mesh; speedY: number; speedX: number }[] = [];

  for (let i = 0; i < ringCount; i++) {
    const cfg = ringConfigs[i];
    const rGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 150);
    const blendT = i / (ringCount - 1);
    const rColor = new THREE.Color(primary).lerp(new THREE.Color(accent), blendT);
    const rMat = new THREE.MeshStandardMaterial({
      color: rColor,
      emissive: rColor.clone().multiplyScalar(0.4),
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.45 - i * 0.05,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    rMesh.rotation.x = cfg.tiltX;
    rMesh.rotation.z = cfg.tiltZ;
    ringGroup.add(rMesh);
    ringMeshes.push({ mesh: rMesh, speedY: cfg.speedY, speedX: cfg.speedX });
    disposables.push(rGeo, rMat);
  }
  scene.add(ringGroup);
  objects.push(ringGroup);

  // Orbiting moonlets
  const moonletCount = 8;
  const moonletGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const moonletMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  disposables.push(moonletGeo, moonletMat);

  interface Moonlet {
    mesh: THREE.Mesh;
    orbitRadius: number;
    orbitSpeed: number;
    orbitPhase: number;
    orbitTilt: number;
  }
  const moonlets: Moonlet[] = [];

  for (let i = 0; i < moonletCount; i++) {
    const m = new THREE.Mesh(moonletGeo, moonletMat);
    const orbitRadius = 6 + Math.random() * 4;
    const ml: Moonlet = {
      mesh: m,
      orbitRadius,
      orbitSpeed: 0.2 + Math.random() * 0.4,
      orbitPhase: Math.random() * Math.PI * 2,
      orbitTilt: (Math.random() - 0.5) * 1.2,
    };
    scene.add(m);
    objects.push(m);
    moonlets.push(ml);
  }

  // Background stars
  const starCount = 500;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starCols = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 80;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    starPos[i * 3 + 2] = -20 - Math.random() * 30;
    const brightness = 0.3 + Math.random() * 0.7;
    starCols[i * 3] = brightness;
    starCols[i * 3 + 1] = brightness;
    starCols[i * 3 + 2] = brightness;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

  const starTex = makeParticleTexture();
  const starMat = new THREE.PointsMaterial({
    size: 0.15,
    map: starTex,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
  objects.push(stars);
  disposables.push(starGeo, starMat, starTex);

  return {
    objects,
    disposables,
    update(delta, elapsed, mouseX, mouseY) {
      // Slow planet rotation
      planet.rotation.y = elapsed * 0.05;
      atmosphere.rotation.y = elapsed * 0.03;

      // Atmospheric pulse
      const atmoScale = 1 + Math.sin(elapsed * 0.8) * 0.02;
      atmosphere.scale.setScalar(atmoScale);
      innerGlow.scale.setScalar(1 + Math.sin(elapsed * 1.2) * 0.015);

      // Rotate orbital rings at different speeds
      for (const ring of ringMeshes) {
        ring.mesh.rotation.y += ring.speedY * delta;
        ring.mesh.rotation.x += ring.speedX * delta;
      }

      // Animate moonlets
      for (const ml of moonlets) {
        const angle = elapsed * ml.orbitSpeed + ml.orbitPhase;
        ml.mesh.position.set(
          planet.position.x + Math.cos(angle) * ml.orbitRadius,
          planet.position.y + Math.sin(angle) * Math.sin(ml.orbitTilt) * ml.orbitRadius * 0.3,
          planet.position.z + Math.sin(angle) * ml.orbitRadius,
        );
      }

      // Mouse parallax tilt whole system
      ringGroup.rotation.x = mouseY * -0.3;
      ringGroup.rotation.z = mouseX * 0.2;

      // Stars gentle parallax
      stars.position.x = mouseX * -3;
      stars.position.y = mouseY * 2;
    },
    onThemeChange(p, a) {
      const pc = new THREE.Color(p);
      const ac = new THREE.Color(a);
      planetMat.color.copy(pc.clone().multiplyScalar(0.3));
      atmosMat.color.copy(ac);
      innerGlowMat.color.copy(pc);
      rimLight.color.copy(ac);
      for (let i = 0; i < ringMeshes.length; i++) {
        const blendT = i / (ringCount - 1);
        const newCol = pc.clone().lerp(ac, blendT);
        const mat = ringMeshes[i].mesh.material as THREE.MeshStandardMaterial;
        mat.color.copy(newCol);
        mat.emissive.copy(newCol.clone().multiplyScalar(0.4));
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// Scene factory
// ═══════════════════════════════════════════════════════════════════
function buildScene(
  preset: Scene3DPreset,
  scene: THREE.Scene,
  primary: string,
  accent: string,
): SceneModule {
  switch (preset) {
    case 'cosmic-drift':
      return buildCosmicDrift(scene, primary, accent);
    case 'galaxy-spiral':
      return buildGalaxySpiral(scene, primary, accent);
    case 'neural-plexus':
      return buildNeuralPlexus(scene, primary, accent);
    case 'aurora-waves':
      return buildAuroraWaves(scene, primary, accent);
    case 'cyber-grid':
      return buildCyberGrid(scene, primary, accent);
    case 'exoplanet':
      return buildExoplanet(scene, primary, accent);
    default:
      return buildCosmicDrift(scene, primary, accent);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export const ThreeScene: React.FC<ThreeSceneProps> = ({
  enabled = true,
  theme,
  scenePreset = 'cosmic-drift',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<ThemeConfig | undefined>(theme);
  const scenePresetRef = useRef<Scene3DPreset>(scenePreset);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    scenePresetRef.current = scenePreset;
  }, [scenePreset]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 24;

    // Ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Initial scene build
    const initialPrimary = themeRef.current?.primaryColor || '#6366f1';
    const initialAccent = themeRef.current?.accentColor || '#06b6d4';

    let currentModule = buildScene(
      scenePresetRef.current,
      scene,
      initialPrimary,
      initialAccent,
    );

    let lastPreset = scenePresetRef.current;
    let lastPrimary = initialPrimary;
    let lastAccent = initialAccent;

    // Mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const wHalf = window.innerWidth / 2;
      const hHalf = window.innerHeight / 2;
      targetX = (event.clientX - wHalf) * 0.0006;
      targetY = (event.clientY - hHalf) * 0.0006;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleClick = (event: MouseEvent) => {
      const wx = ((event.clientX / window.innerWidth) * 2 - 1) * 16;
      const wy = (-(event.clientY / window.innerHeight) * 2 + 1) * 12;
      currentModule.onClick?.(wx, wy);
    };
    window.addEventListener('click', handleClick, { passive: true });

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Visibility
    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clock.start();
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Teardown helper for hot-swapping scenes
    const teardownModule = (mod: SceneModule) => {
      for (const obj of mod.objects) {
        scene.remove(obj);
      }
      for (const d of mod.disposables) {
        d.dispose();
      }
    };

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isTabVisible) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Hot-swap scene if preset changed
      if (scenePresetRef.current !== lastPreset) {
        teardownModule(currentModule);
        const p = themeRef.current?.primaryColor || '#6366f1';
        const a = themeRef.current?.accentColor || '#06b6d4';
        currentModule = buildScene(scenePresetRef.current, scene, p, a);
        lastPreset = scenePresetRef.current;
      }

      // Theme color change detection
      const currentPrimary = themeRef.current?.primaryColor || '#6366f1';
      const currentAccent = themeRef.current?.accentColor || '#06b6d4';
      if (currentPrimary !== lastPrimary || currentAccent !== lastAccent) {
        lastPrimary = currentPrimary;
        lastAccent = currentAccent;
        currentModule.onThemeChange?.(currentPrimary, currentAccent);
      }

      // Mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Update current scene
      currentModule.update(delta, elapsed, mouseX, mouseY);

      // Parallax camera
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);

      teardownModule(currentModule);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
