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

export default function DoomThreatNexus3D() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width) || container.clientWidth || 300, 100);
    const height = Math.max(Math.floor(rect.height) || container.clientHeight || 300, 100);

    // 1. Scene, Camera, Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040807, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (renderer.domElement) {
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting: Mystical Emerald & Cold Metallic
    const ambientLight = new THREE.AmbientLight(0x051a10, 1.5);
    scene.add(ambientLight);

    const greenKeyLight = new THREE.DirectionalLight(0x00ff77, 2.5);
    greenKeyLight.position.set(-4, 6, 4);
    scene.add(greenKeyLight);

    const rimLight = new THREE.DirectionalLight(0x88ccff, 1.8);
    rimLight.position.set(5, 5, -4);
    scene.add(rimLight);

    const orbLightL = new THREE.PointLight(0x00ff66, 3.0, 8);
    const orbLightR = new THREE.PointLight(0x00ff66, 3.0, 8);
    scene.add(orbLightL);
    scene.add(orbLightR);

    // 3. Citadel Spire Architecture (Background)
    const citadelGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x0a1012,
      roughness: 0.9,
      metalness: 0.2,
    });
    for (let i = -4; i <= 4; i += 2) {
      if (i === 0) continue;
      const spireGeo = new THREE.ConeGeometry(0.8, 8, 4);
      const spire = new THREE.Mesh(spireGeo, stoneMat);
      spire.position.set(i * 2.2, 1, -6);
      citadelGroup.add(spire);
    }
    scene.add(citadelGroup);

    // 4. Procedural Armored Villain (Doctor Doom archetype)
    const doomGroup = new THREE.Group();
    doomGroup.position.set(0, 0, 0);

    const cloakGreenMat = new THREE.MeshStandardMaterial({
      color: 0x0f4224, // Doom forest green
      roughness: 0.7,
      metalness: 0.1,
    });
    const armorMetalMat = new THREE.MeshStandardMaterial({
      color: 0x8a929e, // Cold steel armor
      roughness: 0.25,
      metalness: 0.92,
    });
    const glowingGreenMat = new THREE.MeshBasicMaterial({ color: 0x33ff77 });

    // Armored Torso with Medallion Clasps
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 0.45), armorMetalMat);
    torso.position.set(0, 0.4, 0);
    doomGroup.add(torso);

    // Flowing Cape & Hood
    const capeGeo = new THREE.BoxGeometry(1.0, 1.8, 0.1);
    const cape = new THREE.Mesh(capeGeo, cloakGreenMat);
    cape.position.set(0, 0.1, -0.28);
    cape.rotation.x = 0.08;
    doomGroup.add(cape);

    // Hood over head
    const hoodGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const hood = new THREE.Mesh(hoodGeo, cloakGreenMat);
    hood.position.set(0, 1.15, 0.05);
    doomGroup.add(hood);

    // Metallic Face Mask
    const maskGeo = new THREE.BoxGeometry(0.34, 0.38, 0.22);
    const mask = new THREE.Mesh(maskGeo, armorMetalMat);
    mask.position.set(0, 1.12, 0.16);
    doomGroup.add(mask);

    // Riveted Cheek Plates & Grille
    const mouthGrille = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.04), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    mouthGrille.position.set(0, 1.02, 0.28);
    doomGroup.add(mouthGrille);

    // Glowing Emerald Eye Slits
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), glowingGreenMat);
    eyeL.position.set(-0.08, 1.16, 0.28);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), glowingGreenMat);
    eyeR.position.set(0.08, 1.16, 0.28);
    doomGroup.add(eyeL);
    doomGroup.add(eyeR);

    // Cloak Shoulder Clasps (Gold medallions)
    const claspMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });
    const claspL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), claspMat);
    claspL.rotateX(Math.PI / 2);
    claspL.position.set(-0.35, 0.85, 0.24);
    const claspR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), claspMat);
    claspR.rotateX(Math.PI / 2);
    claspR.position.set(0.35, 0.85, 0.24);
    doomGroup.add(claspL);
    doomGroup.add(claspR);

    // Golden Cloak Chain
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), claspMat);
    chain.rotateZ(Math.PI / 2);
    chain.position.set(0, 0.85, 0.25);
    doomGroup.add(chain);

    // Armored Shoulders
    const spL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), armorMetalMat);
    spL.position.set(-0.55, 0.75, 0);
    const spR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), armorMetalMat);
    spR.position.set(0.55, 0.75, 0);
    doomGroup.add(spL);
    doomGroup.add(spR);

    // Outstretched Forearms & Gauntlets wielding mystical energy
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), armorMetalMat);
    armL.position.set(-0.7, 0.45, 0.35);
    armL.rotation.x = Math.PI / 3;
    armL.rotation.z = -Math.PI / 6;
    doomGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), armorMetalMat);
    armR.position.set(0.7, 0.45, 0.35);
    armR.rotation.x = Math.PI / 3;
    armR.rotation.z = Math.PI / 6;
    doomGroup.add(armR);

    // Armored Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.2, 8), armorMetalMat);
    legL.position.set(-0.25, -0.65, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 1.2, 8), armorMetalMat);
    legR.position.set(0.25, -0.65, 0);
    doomGroup.add(legL);
    doomGroup.add(legR);

    // 5. Emerald Mystical Plasma Orbs (Hovering in palms)
    const plasmaOrbGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const plasmaOrbMat = new THREE.MeshBasicMaterial({
      color: 0x00ff77,
      transparent: true,
      opacity: 0.9,
    });
    const orbL = new THREE.Mesh(plasmaOrbGeo, plasmaOrbMat);
    const orbR = new THREE.Mesh(plasmaOrbGeo, plasmaOrbMat);
    doomGroup.add(orbL);
    doomGroup.add(orbR);

    // Swirling Emerald Particle Vortex
    const greenSparkCount = 450;
    const greenSparkPositions = new Float32Array(greenSparkCount * 3);
    const greenSparkAngles = new Float32Array(greenSparkCount);
    const greenSparkRadii = new Float32Array(greenSparkCount);

    for (let i = 0; i < greenSparkCount; i++) {
      greenSparkAngles[i] = Math.random() * Math.PI * 2;
      greenSparkRadii[i] = 0.5 + Math.random() * 2.5;
      greenSparkPositions[i * 3] = Math.cos(greenSparkAngles[i]) * greenSparkRadii[i];
      greenSparkPositions[i * 3 + 1] = 0.2 + (Math.random() - 0.5) * 2.0;
      greenSparkPositions[i * 3 + 2] = Math.sin(greenSparkAngles[i]) * greenSparkRadii[i];
    }
    const greenSparkGeo = new THREE.BufferGeometry();
    greenSparkGeo.setAttribute('position', new THREE.BufferAttribute(greenSparkPositions, 3));
    const greenSparkMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00ff88,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    const greenSparks = new THREE.Points(greenSparkGeo, greenSparkMat);
    doomGroup.add(greenSparks);

    scene.add(doomGroup);

    // 6. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Menacing Hover & Subtle Breathing
      doomGroup.position.y = Math.sin(time * 1.5) * 0.12;
      doomGroup.rotation.y = Math.sin(time * 0.8) * 0.08 + mouseX * 0.25;

      // Cloak billowing
      cape.rotation.x = 0.08 + Math.sin(time * 2.5) * 0.06;

      // Mystical Orbs Pulsing at Palm coordinates
      const orbLX = -0.9 + Math.cos(time * 4) * 0.06;
      const orbLY = 0.6 + Math.sin(time * 3) * 0.08;
      const orbLZ = 0.65;
      orbL.position.set(orbLX, orbLY, orbLZ);
      orbLightL.position.set(orbLX, orbLY + doomGroup.position.y, orbLZ);

      const orbRX = 0.9 - Math.cos(time * 4) * 0.06;
      const orbRY = 0.6 + Math.sin(time * 3) * 0.08;
      const orbRZ = 0.65;
      orbR.position.set(orbRX, orbRY, orbRZ);
      orbLightR.position.set(orbRX, orbRY + doomGroup.position.y, orbRZ);

      const orbScale = 1.0 + Math.sin(time * 6) * 0.18;
      orbL.scale.set(orbScale, orbScale, orbScale);
      orbR.scale.set(orbScale, orbScale, orbScale);

      // Swirling Emerald Sparks around Doom
      const spArr = greenSparks.geometry.attributes.position.array;
      for (let i = 0; i < greenSparkCount; i++) {
        greenSparkAngles[i] += 0.03;
        const r = greenSparkRadii[i] + Math.sin(time * 2 + i) * 0.1;
        spArr[i * 3] = Math.cos(greenSparkAngles[i]) * r;
        spArr[i * 3 + 1] += 0.015;
        if (spArr[i * 3 + 1] > 2.5) spArr[i * 3 + 1] = -1.0;
        spArr[i * 3 + 2] = Math.sin(greenSparkAngles[i]) * r;
      }
      greenSparks.geometry.attributes.position.needsUpdate = true;

      // Camera parallax
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (1.2 + mouseY * 0.8 - camera.position.y) * 0.04;
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
      greenSparkGeo.dispose();
      greenSparkMat.dispose();
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
      aria-label="Doctor Doom inspired armored villain silhouette with emerald green cosmic energy and citadel spire background"
    >
      {!webglSupported && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#00ff77', fontFamily: 'var(--font-heading)' }}>
          THREAT MATRIX DETECTED // 3D ACCELERATION FALLBACK
        </div>
      )}
    </div>
  );
}
