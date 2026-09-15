import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeConfig } from '../../types';

interface ThreeSceneProps {
  enabled?: boolean;
  theme?: ThemeConfig;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ enabled = true, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<ThemeConfig | undefined>(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    } catch {
      return; // WebGL not supported or disabled
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Dynamic Themed Point Lights
    const initialPrimary = themeRef.current?.primaryColor || '#6366f1';
    const initialAccent = themeRef.current?.accentColor || '#06b6d4';

    const pointLight1 = new THREE.PointLight(new THREE.Color(initialPrimary), 2.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(new THREE.Color(initialAccent), 2.5, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Cosmic Particle Field Setup
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const currentColors = new Float32Array(particleCount * 3);
    const targetColors = new Float32Array(particleCount * 3);

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

    const initialPalette = buildColorPalette(initialPrimary, initialAccent);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 45;
      const y = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 35;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const col = initialPalette[Math.floor(Math.random() * initialPalette.length)];
      currentColors[i * 3] = col.r;
      currentColors[i * 3 + 1] = col.g;
      currentColors[i * 3 + 2] = col.b;

      targetColors[i * 3] = col.r;
      targetColors[i * 3 + 1] = col.g;
      targetColors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    // Particle sprite using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Floating Geometric Glass Polyhedra
    const group = new THREE.Group();

    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialPrimary),
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.85,
      ior: 1.5,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(initialAccent),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    // Main icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(2.6, 0);
    const icosahedron = new THREE.Mesh(icoGeo, crystalMaterial);
    const wireIco = new THREE.Mesh(icoGeo, wireMaterial);
    icosahedron.add(wireIco);
    icosahedron.position.set(-9, 4, -4);
    group.add(icosahedron);

    // Secondary octahedron
    const octGeo = new THREE.OctahedronGeometry(2.0, 0);
    const octahedronMaterial = crystalMaterial.clone();
    octahedronMaterial.color.set(new THREE.Color(initialAccent));
    const octahedron = new THREE.Mesh(octGeo, octahedronMaterial);
    octahedron.position.set(10, -5, -3);
    group.add(octahedron);

    // Subtle floating ring / torus
    const torusGeo = new THREE.TorusGeometry(3.5, 0.08, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialAccent),
      emissive: new THREE.Color(initialPrimary),
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.4,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(0, 0, -8);
    torus.rotation.x = Math.PI / 3;
    group.add(torus);

    scene.add(group);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      targetX = (event.clientX - windowHalfX) * 0.0006;
      targetY = (event.clientY - windowHalfY) * 0.0006;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Cosmic Click Ripple Shockwave State
    const shockwave = {
      active: false,
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 36,
      speed: 24,
      intensity: 0,
    };

    const handleClick = (event: MouseEvent) => {
      // Map click coordinates to 3D world plane roughly at z=0
      const clickX = ((event.clientX / window.innerWidth) * 2 - 1) * 16;
      const clickY = (-(event.clientY / window.innerHeight) * 2 + 1) * 12;
      shockwave.x = clickX;
      shockwave.y = clickY;
      shockwave.radius = 0.5;
      shockwave.intensity = 1.0;
      shockwave.active = true;
    };

    window.addEventListener('click', handleClick, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Tab Visibility Optimization
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clock.start();
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Last tracked theme colors to detect theme changes
    let lastTrackedPrimary = initialPrimary;
    let lastTrackedAccent = initialAccent;

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isTabVisible) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Check for theme changes and smoothly morph colors
      const currentThemePrimary = themeRef.current?.primaryColor || '#6366f1';
      const currentThemeAccent = themeRef.current?.accentColor || '#06b6d4';

      if (currentThemePrimary !== lastTrackedPrimary || currentThemeAccent !== lastTrackedAccent) {
        lastTrackedPrimary = currentThemePrimary;
        lastTrackedAccent = currentThemeAccent;

        const newPalette = buildColorPalette(currentThemePrimary, currentThemeAccent);
        for (let i = 0; i < particleCount; i++) {
          const col = newPalette[Math.floor(Math.random() * newPalette.length)];
          targetColors[i * 3] = col.r;
          targetColors[i * 3 + 1] = col.g;
          targetColors[i * 3 + 2] = col.b;
        }
      }

      // Smoothly morph lights and crystal materials
      const targetPColor = new THREE.Color(currentThemePrimary);
      const targetAColor = new THREE.Color(currentThemeAccent);

      pointLight1.color.lerp(targetPColor, 0.05);
      pointLight2.color.lerp(targetAColor, 0.05);
      crystalMaterial.color.lerp(targetPColor, 0.05);
      octahedronMaterial.color.lerp(targetAColor, 0.05);
      wireMaterial.color.lerp(targetAColor, 0.05);
      torusMat.color.lerp(targetAColor, 0.05);
      torusMat.emissive.lerp(targetPColor, 0.05);

      // Smoothly morph particle colors
      let colorChanged = false;
      for (let i = 0; i < particleCount * 3; i++) {
        if (Math.abs(currentColors[i] - targetColors[i]) > 0.002) {
          currentColors[i] += (targetColors[i] - currentColors[i]) * 0.04;
          colorChanged = true;
        }
      }
      if (colorChanged && geometry.attributes.color) {
        geometry.attributes.color.needsUpdate = true;
      }

      // Handle Cosmic Click Shockwave Ripple on particles
      let positionChanged = false;
      if (shockwave.active) {
        shockwave.radius += shockwave.speed * delta;
        shockwave.intensity *= 0.94;

        if (shockwave.radius > shockwave.maxRadius || shockwave.intensity < 0.03) {
          shockwave.active = false;
        }

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
            positionChanged = true;
          } else if (Math.abs(positions[idx] - originalPositions[idx]) > 0.01) {
            positions[idx] += (originalPositions[idx] - positions[idx]) * 0.1;
            positions[idx + 1] += (originalPositions[idx + 1] - positions[idx + 1]) * 0.1;
            positions[idx + 2] += (originalPositions[idx + 2] - positions[idx + 2]) * 0.1;
            positionChanged = true;
          }
        }
      } else {
        // Smoothly settle particles back if any are offset
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          if (Math.abs(positions[idx] - originalPositions[idx]) > 0.01) {
            positions[idx] += (originalPositions[idx] - positions[idx]) * 0.1;
            positions[idx + 1] += (originalPositions[idx + 1] - positions[idx + 1]) * 0.1;
            positions[idx + 2] += (originalPositions[idx + 2] - positions[idx + 2]) * 0.1;
            positionChanged = true;
          }
        }
      }

      if (positionChanged && geometry.attributes.position) {
        geometry.attributes.position.needsUpdate = true;
      }

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate particles slowly
      particles.rotation.y = elapsedTime * 0.03 + mouseX * 2;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1 - mouseY * 2;

      // Animate floating crystals
      icosahedron.rotation.x = elapsedTime * 0.2;
      icosahedron.rotation.y = elapsedTime * 0.25;
      icosahedron.position.y = 4 + Math.sin(elapsedTime * 0.6) * 0.5;

      octahedron.rotation.x = -elapsedTime * 0.25;
      octahedron.rotation.z = elapsedTime * 0.15;
      octahedron.position.y = -5 + Math.cos(elapsedTime * 0.7) * 0.6;

      torus.rotation.z = elapsedTime * 0.1;
      torus.rotation.y = Math.sin(elapsedTime * 0.3) * 0.2;

      // Parallax camera movement
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      particleMaterial.dispose();
      texture.dispose();
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
