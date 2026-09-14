import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  enabled?: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ enabled = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2.5, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Cosmic Particle Field
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorChoices = [
      new THREE.Color('#818cf8'), // soft indigo
      new THREE.Color('#38bdf8'), // sky cyan
      new THREE.Color('#c084fc'), // purple
      new THREE.Color('#ffffff'), // pure starlight
      new THREE.Color('#f472b6'), // soft rose
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

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
      color: 0x6366f1,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.85,
      ior: 1.5,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
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
    const octahedron = new THREE.Mesh(octGeo, crystalMaterial.clone());
    (octahedron.material as THREE.MeshPhysicalMaterial).color.set(0xa855f7);
    octahedron.position.set(10, -5, -3);
    group.add(octahedron);

    // Subtle floating ring / torus
    const torusGeo = new THREE.TorusGeometry(3.5, 0.08, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
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

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

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
      window.removeEventListener('resize', handleResize);
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
