import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * GalaxyController:
 * Majestic rotating Logarithmic Spiral Galaxy & Cosmic Nebula.
 * Features:
 * 1. 4 spiral arms constructed with thousands of celestial points
 * 2. Luminous dense galactic nucleus with white-gold star cluster
 * 3. Chromatic arm dispersion: electric cyan, deep indigo, cosmic magenta, and crimson
 * 4. Interstellar gas clouds and cosmic dust lanes
 * 5. Slow majestic axial rotation
 */
export class GalaxyController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Deep_Multiverse_Spiral_Galaxy';
    this.isMobile = isMobile;

    // Position deep in cosmos on the left flank of the travel corridor
    this.root.position.set(-13.5, 3.8, -38.0);
    // Tilted so its spiral face presents dramatically to the traveler
    this.root.rotation.set(0.65, 0.45, -0.3);

    this.points = null;
    this.coreMesh = null;
    this.galaxyGeo = null;

    this.init();
  }

  init() {
    const glowTex = getGlowParticleTexture();
    const starCount = this.isMobile ? 1400 : 3800;
    const arms = 4;
    const radius = 18.0;
    const spin = 1.35;
    const randomness = 0.45;
    const power = 3.5;

    this.galaxyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    // Color Palette
    const colorCore = new THREE.Color(0xfff5dd); // Warm white-gold core
    const colorMid = new THREE.Color(0x00f3ff);  // Electric multiverse cyan
    const colorPurple = new THREE.Color(0xa855f7); // Cosmic violet
    const colorOuter = new THREE.Color(0xe62429); // Outer crimson dust

    for (let i = 0; i < starCount; i++) {
      // Distance from galactic center
      const r = Math.random() * radius;

      // Arm assignment
      const armIndex = i % arms;
      const spinAngle = r * spin;
      const armAngle = ((armIndex * 2 * Math.PI) / arms);

      // Random scatter grows with distance from core
      const randomX = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * (randomness * 0.4) * r;
      const randomZ = Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i * 3] = Math.cos(armAngle + spinAngle) * r + randomX;
      positions[i * 3 + 1] = randomY; // Thin galactic disk
      positions[i * 3 + 2] = Math.sin(armAngle + spinAngle) * r + randomZ;

      // Color mapping: Core -> Mid (Cyan/Purple) -> Outer (Crimson/Navy)
      const ratio = r / radius;
      const mixedColor = colorCore.clone();
      if (ratio < 0.3) {
        mixedColor.lerp(colorMid, ratio / 0.3);
      } else if (ratio < 0.7) {
        mixedColor.lerp(colorPurple, (ratio - 0.3) / 0.4);
      } else {
        mixedColor.lerp(colorOuter, (ratio - 0.7) / 0.3);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    this.galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.22 : 0.25,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.points = new THREE.Points(this.galaxyGeo, starMat);
    this.root.add(this.points);

    // Glowing Galactic Nucleus (dense supermassive core starburst)
    const coreGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffeab3,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.root.add(this.coreMesh);

    // Outer Galactic Halo
    const haloGeo = new THREE.RingGeometry(1.2, 5.0, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x5500aa,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    this.root.add(halo);

    this.root.scale.set(0.01, 0.01, 0.01);
    this.root.visible = false;
  }

  update(progress, time) {
    // The Galaxy is visible in Scene 2 (0.14 to 0.32) and Scene 6/7 (0.76 to 1.0)
    const inUniverse = progress >= 0.14 && progress <= 0.32;
    const inAssembly = progress >= 0.76 && progress <= 1.0;

    if (!inUniverse && !inAssembly) {
      this.root.visible = false;
      return;
    }

    this.root.visible = true;

    // Appearance ramp
    let visibility = 0;
    if (inUniverse) {
      if (progress < 0.20) visibility = (progress - 0.14) / 0.06;
      else if (progress <= 0.28) visibility = 1.0;
      else visibility = Math.max(0, 1.0 - (progress - 0.28) / 0.04);
    } else {
      if (progress < 0.82) visibility = (progress - 0.76) / 0.06;
      else visibility = 1.0;
    }

    const scale = THREE.MathUtils.lerp(0.3, 1.25, Math.pow(visibility, 1.3));
    this.root.scale.set(scale, scale, scale);

    // Axial rotation of the galaxy
    this.root.rotation.y += 0.0035;
    if (this.points) {
      this.points.rotation.y = time * 0.02;
    }

    // Core pulsation
    if (this.coreMesh) {
      const pulse = 1 + Math.sin(time * 2.5) * 0.08;
      this.coreMesh.scale.set(pulse, pulse, pulse);
    }
  }

  dispose() {
    if (this.galaxyGeo) {
      this.galaxyGeo.dispose();
    }
    if (this.points) {
      this.points.material.dispose();
    }
    if (this.coreMesh) {
      this.coreMesh.geometry.dispose();
      this.coreMesh.material.dispose();
    }
  }
}

export default GalaxyController;
