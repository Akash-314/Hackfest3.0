import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * CosmicConfrontationController:
 * Cinematic superhero face-off energy clash between:
 * Hero (Left: Cyan/Crimson Repulsor beam) vs Villain (Right: Emerald Sorcery beam).
 * Features midpoint clash vortex, opposing energy beams, and spark splash.
 */
export class CosmicConfrontationController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Cosmic_Confrontation_Root';
    this.isMobile = isMobile;

    this.beamHero = null;
    this.beamVillain = null;
    this.clashCore = null;
    this.clashRings = [];
    this.clashParticles = null;
    this.particleGeo = null;
    this.clashLight = null;

    this.materials = {
      beamHero: null,
      beamVillain: null,
      clashCore: null,
      clashRings: null,
      sparks: null,
    };

    this.init();
  }

  init() {
    const glowTex = getGlowParticleTexture();

    // 1. Materials
    this.materials.beamHero = new THREE.MeshBasicMaterial({
      color: 0x00d9ff, // Stark cyan repulsor beam
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.beamVillain = new THREE.MeshBasicMaterial({
      color: 0x00ff88, // Doom emerald sorcery beam
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.clashCore = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.clashRings = new THREE.MeshBasicMaterial({
      color: 0x88ffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    // 2. Opposing Energy Beams
    // Hero Beam (from x = -3.2, y = 1.8, z = -13 toward 0, 1.8, -13)
    const beamGeoH = new THREE.CylinderGeometry(0.08, 0.22, 3.2, 12);
    beamGeoH.rotateZ(Math.PI / 2);
    this.beamHero = new THREE.Mesh(beamGeoH, this.materials.beamHero);
    this.beamHero.position.set(-1.6, 1.8, -13);
    this.root.add(this.beamHero);

    // Villain Beam (from x = 3.2, y = 1.8, z = -13 toward 0, 1.8, -13)
    const beamGeoV = new THREE.CylinderGeometry(0.22, 0.08, 3.2, 12);
    beamGeoV.rotateZ(Math.PI / 2);
    this.beamVillain = new THREE.Mesh(beamGeoV, this.materials.beamVillain);
    this.beamVillain.position.set(1.6, 1.8, -13);
    this.root.add(this.beamVillain);

    // 3. Central Clash Core (Sphere at collision midpoint)
    const coreGeo = new THREE.SphereGeometry(0.4, 16, 16);
    this.clashCore = new THREE.Mesh(coreGeo, this.materials.clashCore);
    this.clashCore.position.set(0, 1.8, -13);
    this.root.add(this.clashCore);

    // 4. Orbiting Clash Flare Rings
    [0.75, 1.1].forEach((r) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.03, 8, 36);
      const ring = new THREE.Mesh(ringGeo, this.materials.clashRings);
      ring.position.set(0, 1.8, -13);
      this.clashRings.push(ring);
      this.root.add(ring);
    });

    // 5. Clashing Particle Sparks (Opposing sparks spraying outwards)
    const pCount = this.isMobile ? 35 : 90;
    this.particleGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pCol = new Float32Array(pCount * 3);
    this.particleData = [];

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = 0;
      pPos[i * 3 + 1] = 1.8;
      pPos[i * 3 + 2] = -13;

      const isCyan = i % 2 === 0;
      if (isCyan) {
        pCol[i * 3] = 0.0;
        pCol[i * 3 + 1] = 0.85;
        pCol[i * 3 + 2] = 1.0;
      } else {
        pCol[i * 3] = 0.0;
        pCol[i * 3 + 1] = 1.0;
        pCol[i * 3 + 2] = 0.45;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 1.2 + Math.random() * 2.8;

      this.particleData.push({
        vx: Math.cos(theta) * Math.cos(phi) * speed,
        vy: Math.sin(phi) * speed,
        vz: Math.sin(theta) * Math.cos(phi) * speed,
        life: Math.random(),
      });
    }

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    this.materials.sparks = new THREE.PointsMaterial({
      size: 0.16,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.clashParticles = new THREE.Points(this.particleGeo, this.materials.sparks);
    this.root.add(this.clashParticles);

    // 6. Dynamic Clash Point Light
    this.clashLight = new THREE.PointLight(0x66ffcc, 0, 25);
    this.clashLight.position.set(0, 1.8, -13);
    this.root.add(this.clashLight);

    this.root.visible = false;
  }

  update(progress, time) {
    // Active during 68% - 77%
    if (progress < 0.68 || progress > 0.77) {
      this.root.visible = false;
      this.materials.beamHero.opacity = 0;
      this.materials.beamVillain.opacity = 0;
      this.materials.clashCore.opacity = 0;
      this.materials.clashRings.opacity = 0;
      this.materials.sparks.opacity = 0;
      this.clashLight.intensity = 0;
      return;
    }

    this.root.visible = true;

    // Timeline inside stage (0 to 1)
    const p = (progress - 0.68) / 0.09;

    // Ramping in and out
    let intensity = 0;
    if (p < 0.25) {
      intensity = p / 0.25;
    } else if (p < 0.8) {
      intensity = 1.0;
    } else {
      intensity = Math.max(0, (1 - p) / 0.2);
    }

    const flicker = 0.85 + Math.sin(time * 18) * 0.15;
    const finalOpacity = intensity * flicker;

    this.materials.beamHero.opacity = finalOpacity * 0.85;
    this.materials.beamVillain.opacity = finalOpacity * 0.85;
    this.materials.clashCore.opacity = finalOpacity * 0.95;
    this.materials.clashRings.opacity = finalOpacity * 0.75;
    this.materials.sparks.opacity = finalOpacity * 0.9;
    this.clashLight.intensity = intensity * (4.5 + Math.sin(time * 15) * 1.5);

    // Core pulsing scale
    const coreScale = 0.8 + Math.sin(time * 12) * 0.25;
    this.clashCore.scale.set(coreScale, coreScale, coreScale);

    // Rotate clash rings
    this.clashRings.forEach((r, idx) => {
      r.rotation.x += (idx === 0 ? 0.05 : -0.04);
      r.rotation.y += 0.035;
      r.rotation.z += 0.02;
    });

    // Update spraying sparks
    if (this.particleGeo && this.particleData) {
      const pos = this.particleGeo.attributes.position;
      const count = this.particleData.length;

      for (let i = 0; i < count; i++) {
        const item = this.particleData[i];
        item.life += 0.04;
        if (item.life > 1) {
          item.life = 0;
          pos.setXYZ(i, 0, 1.8, -13);
        } else {
          pos.setXYZ(
            i,
            item.vx * item.life * 1.5,
            1.8 + item.vy * item.life * 1.5,
            -13 + item.vz * item.life * 1.5
          );
        }
      }
      pos.needsUpdate = true;
    }
  }

  dispose() {
    Object.values(this.materials).forEach((m) => {
      if (m && m.dispose) m.dispose();
    });
    if (this.particleGeo) this.particleGeo.dispose();
    if (this.root) {
      this.root.traverse((c) => {
        if (c.isMesh) {
          if (c.geometry) c.geometry.dispose();
          if (c.material) {
            if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
            else c.material.dispose();
          }
        }
      });
    }
  }
}

export default CosmicConfrontationController;
