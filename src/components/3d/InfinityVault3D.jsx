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

export default function InfinityVault3D() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width) || container.clientWidth || 300, 100);
    const height = Math.max(Math.floor(rect.height) || container.clientHeight || 300, 100);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 7.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    if (renderer.domElement) {
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
    }
    container.appendChild(renderer.domElement);

    // 2. Cosmic Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0e1424, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    dirLight.position.set(0, 10, 5);
    scene.add(dirLight);

    // Point lights for the 3 Power Cores
    const light1st = new THREE.PointLight(0xffb700, 4.0, 9);
    light1st.position.set(0, 1.2, 0);
    scene.add(light1st);

    const light2nd = new THREE.PointLight(0x00bfff, 3.2, 8);
    light2nd.position.set(-2.5, 0.8, 0);
    scene.add(light2nd);

    const light3rd = new THREE.PointLight(0xff2244, 3.2, 8);
    light3rd.position.set(2.5, 0.8, 0);
    scene.add(light3rd);

    // Helper: Build a floating Cosmic Power Core Artifact
    function createPowerCore(colorHex, emissiveHex, size, ringCount) {
      const group = new THREE.Group();

      // Inner Crystal Core (Icosahedron gemstone)
      const crystalGeo = new THREE.IcosahedronGeometry(size, 0);
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        emissive: emissiveHex,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.95,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      group.add(crystal);

      // Inner Glowing Energy Orb
      const innerOrbGeo = new THREE.SphereGeometry(size * 0.55, 16, 16);
      const innerOrbMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const innerOrb = new THREE.Mesh(innerOrbGeo, innerOrbMat);
      group.add(innerOrb);

      // Orbital Cosmic Rings
      const rings = [];
      for (let r = 0; r < ringCount; r++) {
        const ringGeo = new THREE.TorusGeometry(size * (1.4 + r * 0.35), 0.025, 8, 36);
        const ringMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          metalness: 0.9,
          roughness: 0.2,
          emissive: colorHex,
          emissiveIntensity: 0.3,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.random() * Math.PI;
        ringMesh.rotation.y = Math.random() * Math.PI;
        group.add(ringMesh);
        rings.push(ringMesh);
      }

      // Pedestal Base under the core
      const pedestalGeo = new THREE.CylinderGeometry(size * 0.8, size * 1.1, 0.25, 6);
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: 0x121926,
        metalness: 0.7,
        roughness: 0.3,
      });
      const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
      pedestal.position.y = -size * 2.2;
      group.add(pedestal);

      return { group, crystal, rings, innerOrb };
    }

    // 1st Place: CHAMPION CORE (Center, Gold / Solar Flare)
    const core1st = createPowerCore(0xf5b642, 0xff8800, 0.7, 3);
    core1st.group.position.set(0, 0.5, 0);
    scene.add(core1st.group);

    // 2nd Place: VANGUARD CORE (Left, Cosmic Blue / Space Stone)
    const core2nd = createPowerCore(0x00bfff, 0x0044ff, 0.55, 2);
    core2nd.group.position.set(-2.5, 0.2, -0.2);
    scene.add(core2nd.group);

    // 3rd Place: HERO CORE (Right, Reality Crimson / Red Stone)
    const core3rd = createPowerCore(0xe62429, 0x880011, 0.55, 2);
    core3rd.group.position.set(2.5, 0.2, -0.2);
    scene.add(core3rd.group);

    // Cosmic Nebula Particles (Floating celestial dust)
    const dustCount = 400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    const cGold = new THREE.Color(0xf5b642);
    const cBlue = new THREE.Color(0x00bfff);
    const cRed = new THREE.Color(0xe62429);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 14;
      dustPositions[i * 3 + 1] = -1 + Math.random() * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

      const pickColor = Math.random() < 0.4 ? cGold : Math.random() < 0.7 ? cBlue : cRed;
      dustColors[i * 3] = pickColor.r;
      dustColors[i * 3 + 1] = pickColor.g;
      dustColors[i * 3 + 2] = pickColor.b;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Core 1st (Gold) Float & Rotate
      core1st.crystal.rotation.x = time * 0.6;
      core1st.crystal.rotation.y = time * 0.8;
      core1st.group.position.y = 0.5 + Math.sin(time * 2.0) * 0.12;
      core1st.rings.forEach((r, idx) => {
        r.rotation.x += 0.015 * (idx + 1);
        r.rotation.y += 0.02 * (idx + 1);
      });
      light1st.intensity = 3.5 + Math.sin(time * 4) * 1.0;

      // Core 2nd (Blue) Float & Rotate
      core2nd.crystal.rotation.x = -time * 0.5;
      core2nd.crystal.rotation.y = time * 0.7;
      core2nd.group.position.y = 0.2 + Math.sin(time * 2.2 + 1) * 0.1;
      core2nd.rings.forEach((r, idx) => {
        r.rotation.x -= 0.018 * (idx + 1);
        r.rotation.z += 0.015 * (idx + 1);
      });

      // Core 3rd (Red) Float & Rotate
      core3rd.crystal.rotation.x = time * 0.55;
      core3rd.crystal.rotation.y = -time * 0.75;
      core3rd.group.position.y = 0.2 + Math.sin(time * 1.8 + 2) * 0.1;
      core3rd.rings.forEach((r, idx) => {
        r.rotation.y += 0.016 * (idx + 1);
        r.rotation.z -= 0.014 * (idx + 1);
      });

      // Ambient Celestial Dust Drift
      const dArr = dustPoints.geometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        dArr[i * 3 + 1] += 0.01;
        if (dArr[i * 3 + 1] > 4) dArr[i * 3 + 1] = -1;
      }
      dustPoints.geometry.attributes.position.needsUpdate = true;

      // Camera Parallax
      camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (0.8 + mouseY * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.4, 0);

      renderer.render(scene, camera);
    };

    animate();

    const updateDimensions = () => {
      if (!container || !renderer) return;
      const r = container.getBoundingClientRect();
      const nw = Math.floor(r.width);
      const nh = Math.floor(r.height);
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      renderer.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="3D Infinity Power Vault showcasing the Champion Core, Vanguard Core, and Hero Core with cosmic nebulae"
    >
      {!webglSupported && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-stark-gold)', fontFamily: 'var(--font-heading)' }}>
          INFINITY VAULT ACTIVATED // SIMULATION RUNNING
        </div>
      )}
    </div>
  );
}
