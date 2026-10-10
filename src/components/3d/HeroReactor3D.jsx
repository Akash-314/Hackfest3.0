import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function checkWebGL() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function HeroReactor3D() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // 2. Main Arc Reactor Group
    const reactorGroup = new THREE.Group();
    scene.add(reactorGroup);

    // -- Inner Glowing Energy Core Sphere --
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00bfff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    reactorGroup.add(coreMesh);

    // Core solid light point
    const coreSolidGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const coreSolidMat = new THREE.MeshBasicMaterial({
      color: 0xe62429,
      transparent: true,
      opacity: 0.65,
    });
    const coreSolid = new THREE.Mesh(coreSolidGeo, coreSolidMat);
    reactorGroup.add(coreSolid);

    // -- Stark Tech Gyro Rings (Outer, Middle, Inner) --
    // Ring 1 (Stark Gold Outer Gimbal)
    const ring1Geo = new THREE.TorusGeometry(1.65, 0.045, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xf5b642,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xf5b642,
      emissiveIntensity: 0.25,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    reactorGroup.add(ring1);

    // Ring 2 (Arc Reactor Cyan Inter-Ring)
    const ring2Geo = new THREE.TorusGeometry(1.3, 0.035, 16, 48);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x00bfff,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x00bfff,
      emissiveIntensity: 0.45,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    reactorGroup.add(ring2);

    // Ring 3 (Energy Red Core Ring)
    const ring3Geo = new THREE.TorusGeometry(1.0, 0.03, 16, 32);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xe62429,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xe62429,
      emissiveIntensity: 0.5,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    reactorGroup.add(ring3);

    // -- Floating Tech Notches / Arc Nodes Around Rings --
    const notchGroup = new THREE.Group();
    const notchGeo = new THREE.BoxGeometry(0.12, 0.25, 0.08);
    const notchMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x00bfff,
      emissiveIntensity: 0.6,
    });

    const notchesCount = 12;
    for (let i = 0; i < notchesCount; i++) {
      const angle = (i / notchesCount) * Math.PI * 2;
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, 0);
      notch.rotation.z = angle + Math.PI / 2;
      notchGroup.add(notch);
    }
    reactorGroup.add(notchGroup);

    // -- Orbiting Holographic Polyhedral Shards --
    const shardsGroup = new THREE.Group();
    const shardGeo = new THREE.OctahedronGeometry(0.2, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: true,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.5,
    });

    const shardCount = 8;
    const shards = [];
    for (let i = 0; i < shardCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      const angle = (i / shardCount) * Math.PI * 2;
      const radius = 2.4 + (i % 2) * 0.4;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.sin(angle) * radius * 0.6) + ((i % 3) - 1) * 0.3,
        Math.sin(angle * 2) * 0.5
      );
      mesh.scale.setScalar(0.7 + (i % 3) * 0.3);
      shardsGroup.add(mesh);
      shards.push({ mesh, speed: 0.015 + (i % 4) * 0.005, radius, angle });
    }
    reactorGroup.add(shardsGroup);

    // -- Quantum Particle Galaxy --
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const cyanColor = new THREE.Color(0x00bfff);
    const redColor = new THREE.Color(0xe62429);
    const goldColor = new THREE.Color(0xf5b642);

    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 1.2 + Math.random() * 2.8;

      posArray[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = dist * Math.cos(phi);

      // Color distribution
      const r = Math.random();
      const col = r > 0.65 ? cyanColor : r > 0.35 ? redColor : goldColor;
      colorsArray[i * 3] = col.r;
      colorsArray[i * 3 + 1] = col.g;
      colorsArray[i * 3 + 2] = col.b;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    reactorGroup.add(particleSystem);

    // 3. Lighting (Cinematic Studio Rig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const corePointLight = new THREE.PointLight(0x00bfff, 3.5, 8);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const redRimLight = new THREE.DirectionalLight(0xe62429, 2.0);
    redRimLight.position.set(5, 3, 4);
    scene.add(redRimLight);

    const goldRimLight = new THREE.DirectionalLight(0xf5b642, 1.8);
    goldRimLight.position.set(-5, -3, 3);
    scene.add(goldRimLight);

    // 4. Mouse Reactivity & Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 5. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      reactorGroup.rotation.y += (targetRotationY - reactorGroup.rotation.y) * 0.05;
      reactorGroup.rotation.x += (targetRotationX - reactorGroup.rotation.x) * 0.05;

      // Inner Core rotation & pulse
      coreMesh.rotation.y += 0.012;
      coreMesh.rotation.x += 0.008;
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Gyro Ring differential rotations
      ring1.rotation.z += 0.006;
      notchGroup.rotation.z += 0.006;

      ring2.rotation.x = Math.sin(elapsedTime * 0.7) * 0.5;
      ring2.rotation.y += 0.012;

      ring3.rotation.y = Math.cos(elapsedTime * 0.9) * 0.6;
      ring3.rotation.x += 0.016;

      // Orbiting shards
      shards.forEach((s) => {
        s.angle += s.speed;
        s.mesh.position.x = Math.cos(s.angle) * s.radius;
        s.mesh.position.y = Math.sin(s.angle) * (s.radius * 0.5);
        s.mesh.rotation.x += 0.02;
        s.mesh.rotation.y += 0.03;
      });

      // Swirling particles
      particleSystem.rotation.y -= 0.0025;
      particleSystem.rotation.z += 0.0015;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose geometries & materials
      coreGeo.dispose();
      coreMat.dispose();
      coreSolidGeo.dispose();
      coreSolidMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      notchGeo.dispose();
      notchMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div
      ref={containerRef}
      className="hero-3d-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!webglSupported && (
        <div className="hero-reactor-fallback">
          <div className="fallback-ring-outer" />
          <div className="fallback-ring-middle" />
          <div className="fallback-core-glow" />
        </div>
      )}
    </div>
  );
}
