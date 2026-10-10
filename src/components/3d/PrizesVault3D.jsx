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

export default function PrizesVault3D() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Group for the 3 trophies
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // --- TROPHY 1: 1ST PLACE (STARK GOLD DODECAHEDRON) - Center & Elevated ---
    const t1Group = new THREE.Group();
    t1Group.position.set(0, 0.2, 0);

    const t1OuterGeo = new THREE.DodecahedronGeometry(1.0, 0);
    const t1OuterMat = new THREE.MeshStandardMaterial({
      color: 0xf5b642,
      metalness: 0.95,
      roughness: 0.15,
      wireframe: true,
      emissive: 0xf5b642,
      emissiveIntensity: 0.4,
    });
    const t1Outer = new THREE.Mesh(t1OuterGeo, t1OuterMat);
    t1Group.add(t1Outer);

    const t1InnerGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const t1InnerMat = new THREE.MeshStandardMaterial({
      color: 0xffe277,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xf5b642,
      emissiveIntensity: 0.6,
    });
    const t1Inner = new THREE.Mesh(t1InnerGeo, t1InnerMat);
    t1Group.add(t1Inner);

    // Gold energy halo
    const t1RingGeo = new THREE.TorusGeometry(1.35, 0.025, 16, 40);
    const t1RingMat = new THREE.MeshBasicMaterial({ color: 0xf5b642, wireframe: true });
    const t1Ring = new THREE.Mesh(t1RingGeo, t1RingMat);
    t1Ring.rotation.x = Math.PI / 2;
    t1Group.add(t1Ring);

    vaultGroup.add(t1Group);

    // --- TROPHY 2: 2ND PLACE (ARC REACTOR CYAN OCTAHEDRON) - Left ---
    const t2Group = new THREE.Group();
    t2Group.position.set(-2.8, -0.2, -0.5);

    const t2OuterGeo = new THREE.OctahedronGeometry(0.8, 0);
    const t2OuterMat = new THREE.MeshStandardMaterial({
      color: 0x00bfff,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      emissive: 0x00bfff,
      emissiveIntensity: 0.45,
    });
    const t2Outer = new THREE.Mesh(t2OuterGeo, t2OuterMat);
    t2Group.add(t2Outer);

    const t2InnerGeo = new THREE.OctahedronGeometry(0.45, 0);
    const t2InnerMat = new THREE.MeshStandardMaterial({
      color: 0x66e0ff,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x00bfff,
      emissiveIntensity: 0.6,
    });
    const t2Inner = new THREE.Mesh(t2InnerGeo, t2InnerMat);
    t2Group.add(t2Inner);

    vaultGroup.add(t2Group);

    // --- TROPHY 3: 3RD PLACE (ENERGY RED ICOSAHEDRON) - Right ---
    const t3Group = new THREE.Group();
    t3Group.position.set(2.8, -0.2, -0.5);

    const t3OuterGeo = new THREE.IcosahedronGeometry(0.75, 0);
    const t3OuterMat = new THREE.MeshStandardMaterial({
      color: 0xe62429,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      emissive: 0xe62429,
      emissiveIntensity: 0.5,
    });
    const t3Outer = new THREE.Mesh(t3OuterGeo, t3OuterMat);
    t3Group.add(t3Outer);

    const t3InnerGeo = new THREE.TetrahedronGeometry(0.4, 0);
    const t3InnerMat = new THREE.MeshStandardMaterial({
      color: 0xff6669,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xe62429,
      emissiveIntensity: 0.6,
    });
    const t3Inner = new THREE.Mesh(t3InnerGeo, t3InnerMat);
    t3Group.add(t3Inner);

    vaultGroup.add(t3Group);

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);

    const goldLight = new THREE.PointLight(0xf5b642, 3.5, 6);
    goldLight.position.set(0, 1.5, 2);
    scene.add(goldLight);

    const cyanLight = new THREE.PointLight(0x00bfff, 2.5, 5);
    cyanLight.position.set(-2.8, 1, 2);
    scene.add(cyanLight);

    const redLight = new THREE.PointLight(0xe62429, 2.5, 5);
    redLight.position.set(2.8, 1, 2);
    scene.add(redLight);

    // Mouse tilt
    let targetX = 0;
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetX = x * 0.2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let reqId;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      vaultGroup.rotation.y += (targetX - vaultGroup.rotation.y) * 0.04;

      // 1st place core
      t1Outer.rotation.y += 0.01;
      t1Outer.rotation.x += 0.007;
      t1Inner.rotation.y -= 0.015;
      t1Ring.rotation.z += 0.008;
      t1Group.position.y = 0.2 + Math.sin(t * 1.8) * 0.08;

      // 2nd place core
      t2Outer.rotation.y += 0.014;
      t2Outer.rotation.z += 0.009;
      t2Group.position.y = -0.2 + Math.sin(t * 1.5 + 1) * 0.06;

      // 3rd place core
      t3Outer.rotation.y -= 0.012;
      t3Outer.rotation.x += 0.008;
      t3Group.position.y = -0.2 + Math.sin(t * 1.6 + 2) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      t1OuterGeo.dispose();
      t1OuterMat.dispose();
      t1InnerGeo.dispose();
      t1InnerMat.dispose();
      t1RingGeo.dispose();
      t1RingMat.dispose();

      t2OuterGeo.dispose();
      t2OuterMat.dispose();
      t2InnerGeo.dispose();
      t2InnerMat.dispose();

      t3OuterGeo.dispose();
      t3OuterMat.dispose();
      t3InnerGeo.dispose();
      t3InnerMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div
      ref={containerRef}
      className="prizes-3d-wrapper"
      style={{
        width: '100%',
        height: '320px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {!webglSupported && (
        <div style={{ color: 'var(--color-stark-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          [VAULT ARTIFACTS ENCRYPTED]
        </div>
      )}
    </div>
  );
}
