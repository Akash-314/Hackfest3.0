import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * BlackHoleController:
 * Gargantua-inspired cinematic cosmic Black Hole.
 * Features:
 * 1. Pitch-black Event Horizon void sphere
 * 2. Brilliant glowing Photon Ring (gravitational boundary)
 * 3. Gravitational lensing halo (the iconic Interstellar curved light arc)
 * 4. Concentric luminous energy rings (inner hot white/gold collar, mid fiery toroid, outer halo)
 * 5. 2,600 Keplerian plasma embers with soft glowing particle texture
 * 6. Relativistic collimated plasma jets & dynamic radiation light
 */
export class BlackHoleController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Cosmic_Black_Hole_Gargantua';
    this.isMobile = isMobile;

    // Position in deep space along travel path
    this.root.position.set(7.5, 1.2, -28.0);
    this.root.rotation.set(0.35, -0.45, 0.25);

    this.eventHorizon = null;
    this.photonRing = null;
    this.lensingHalo = null;
    this.innerCollar = null;
    this.midTorus = null;
    this.outerTorus = null;
    this.sparks = null;
    this.sparkGeo = null;
    this.sparkData = [];
    this.bipolarJets = null;
    this.radiationLight = null;

    this.init();
  }

  init() {
    const holeRadius = 2.4;
    const glowTex = getGlowParticleTexture();

    // 1. Event Horizon Void (pure black sphere absorbing all light)
    const voidGeo = new THREE.SphereGeometry(holeRadius, 32, 32);
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    this.eventHorizon = new THREE.Mesh(voidGeo, voidMat);
    this.root.add(this.eventHorizon);

    // 2. Photon Ring (blinding golden-white halo right at the Schwarzschild boundary)
    const photonGeo = new THREE.TorusGeometry(holeRadius * 1.08, 0.06, 16, 90);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xfff0bb,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    this.photonRing = new THREE.Mesh(photonGeo, photonMat);
    this.root.add(this.photonRing);

    // 3. Gravitational Lensing Halo (upper tilted arc simulating relativistic light bending over the top)
    const lensGeo = new THREE.TorusGeometry(holeRadius * 2.1, 0.22, 16, 100, Math.PI * 1.35);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0xff6611,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.lensingHalo = new THREE.Mesh(lensGeo, lensMat);
    this.lensingHalo.rotation.x = Math.PI / 2 + 0.38;
    this.lensingHalo.rotation.z = -Math.PI * 0.12;
    this.root.add(this.lensingHalo);

    // 4. Luminous Accretion Rings (Concentric Toroids with Additive Blending)
    // Inner hot white-gold collar
    const innerGeo = new THREE.TorusGeometry(holeRadius * 1.35, 0.12, 16, 80);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.innerCollar = new THREE.Mesh(innerGeo, innerMat);
    this.innerCollar.rotation.x = Math.PI / 2;
    this.root.add(this.innerCollar);

    // Mid fiery amber toroid
    const midGeo = new THREE.TorusGeometry(holeRadius * 2.2, 0.28, 16, 80);
    const midMat = new THREE.MeshBasicMaterial({
      color: 0xff4800,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    this.midTorus = new THREE.Mesh(midGeo, midMat);
    this.midTorus.rotation.x = Math.PI / 2;
    this.root.add(this.midTorus);

    // Outer crimson accretion edge
    const outerGeo = new THREE.TorusGeometry(holeRadius * 3.4, 0.35, 16, 80);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xcc1122,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.outerTorus = new THREE.Mesh(outerGeo, outerMat);
    this.outerTorus.rotation.x = Math.PI / 2;
    this.root.add(this.outerTorus);

    // 5. Swirling Accretion Particle Disk (Keplerian differential speed)
    const count = this.isMobile ? 1000 : 2600;
    this.sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cWhite = new THREE.Color(0xffffff);
    const cGold = new THREE.Color(0xffc04d);
    const cFire = new THREE.Color(0xff4500);
    const cCrimson = new THREE.Color(0xd61830);

    for (let i = 0; i < count; i++) {
      const r = holeRadius * 1.15 + Math.pow(Math.random(), 1.3) * (holeRadius * 2.9);
      const theta = Math.random() * Math.PI * 2;
      const yScatter = (Math.random() - 0.5) * 0.25 * (r / holeRadius);

      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = yScatter;
      positions[i * 3 + 2] = Math.sin(theta) * r;

      const t = (r - holeRadius * 1.15) / (holeRadius * 2.9);
      let col;
      if (t < 0.2) col = Math.random() > 0.35 ? cWhite : cGold;
      else if (t < 0.65) col = Math.random() > 0.4 ? cGold : cFire;
      else col = cCrimson;

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      const speed = (2.4 / Math.sqrt(r)) * (0.85 + Math.random() * 0.3);
      this.sparkData.push({ r, theta, yScatter, speed });
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.24 : 0.28,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sparks = new THREE.Points(this.sparkGeo, sparkMat);
    this.root.add(this.sparks);

    // 6. Relativistic Jets
    const jetGeo = new THREE.CylinderGeometry(0.12, 0.9, 18, 12, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.bipolarJets = new THREE.Mesh(jetGeo, jetMat);
    this.root.add(this.bipolarJets);

    // 7. Ambient Radiation Light
    this.radiationLight = new THREE.PointLight(0xff5500, 2.5, 35);
    this.radiationLight.position.set(0, 0, 0);
    this.root.add(this.radiationLight);

    this.root.scale.set(0.01, 0.01, 0.01);
    this.root.visible = false;
  }

  update(progress, time) {
    if (progress < 0.14 || progress > 0.32) {
      this.root.visible = false;
      return;
    }

    let visibility = 0;
    if (progress < 0.20) {
      visibility = (progress - 0.14) / 0.06;
    } else if (progress <= 0.28) {
      visibility = 1.0;
    } else {
      visibility = Math.max(0, 1.0 - (progress - 0.28) / 0.04);
    }

    if (visibility <= 0.01) {
      this.root.visible = false;
      return;
    }

    this.root.visible = true;

    const scale = THREE.MathUtils.lerp(0.2, 1.15, Math.pow(visibility, 1.2));
    this.root.scale.set(scale, scale, scale);

    if (this.innerCollar) this.innerCollar.rotation.z += 0.015;
    if (this.midTorus) this.midTorus.rotation.z += 0.009;
    if (this.outerTorus) this.outerTorus.rotation.z += 0.005;
    if (this.lensingHalo) this.lensingHalo.rotation.z += 0.008;
    if (this.photonRing) this.photonRing.rotation.z -= 0.02;
    if (this.bipolarJets) this.bipolarJets.rotation.y += 0.015;

    // Update Keplerian swirling particles
    if (this.sparkGeo && this.sparkData.length > 0) {
      const pos = this.sparkGeo.attributes.position;
      const count = this.sparkData.length;

      for (let i = 0; i < count; i++) {
        const item = this.sparkData[i];
        item.theta += item.speed * 0.018;

        const x = Math.cos(item.theta) * item.r;
        const z = Math.sin(item.theta) * item.r;

        pos.setX(i, x);
        pos.setY(i, item.yScatter + Math.sin(time * 3 + i) * 0.04);
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    if (this.radiationLight) {
      this.radiationLight.intensity = (2.2 + Math.sin(time * 4) * 0.6) * visibility;
    }
  }

  dispose() {
    if (this.eventHorizon) {
      this.eventHorizon.geometry.dispose();
      this.eventHorizon.material.dispose();
    }
    if (this.photonRing) {
      this.photonRing.geometry.dispose();
      this.photonRing.material.dispose();
    }
    if (this.lensingHalo) {
      this.lensingHalo.geometry.dispose();
      this.lensingHalo.material.dispose();
    }
    if (this.innerCollar) {
      this.innerCollar.geometry.dispose();
      this.innerCollar.material.dispose();
    }
    if (this.midTorus) {
      this.midTorus.geometry.dispose();
      this.midTorus.material.dispose();
    }
    if (this.outerTorus) {
      this.outerTorus.geometry.dispose();
      this.outerTorus.material.dispose();
    }
    if (this.sparkGeo) {
      this.sparkGeo.dispose();
    }
    if (this.sparks) {
      this.sparks.material.dispose();
    }
    if (this.bipolarJets) {
      this.bipolarJets.geometry.dispose();
      this.bipolarJets.material.dispose();
    }
  }
}

export default BlackHoleController;
