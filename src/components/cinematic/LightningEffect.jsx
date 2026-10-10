import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * LightningEffectController:
 * High-voltage branching lightning bolts, ground impact shockwave ring,
 * spark burst, and dynamic electric flash point light.
 */
export class LightningEffectController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Lightning_Effect_Root';
    this.isMobile = isMobile;

    this.boltLines = [];
    this.shockwaveMesh = null;
    this.sparksPoints = null;
    this.sparkGeo = null;
    this.flashLight = null;

    this.materials = {
      boltCore: null,
      boltGlow: null,
      shockwave: null,
      sparkMat: null,
    };

    this.init();
  }

  init() {
    const glowTex = getGlowParticleTexture();

    // 1. Materials
    this.materials.boltCore = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.boltGlow = new THREE.LineBasicMaterial({
      color: 0x55ccff,
      linewidth: 6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.shockwave = new THREE.MeshBasicMaterial({
      color: 0x88eeff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 2. Branching Lightning Bolt Geometries
    // Main vertical trunk + 3 branching forks
    const boltCount = this.isMobile ? 2 : 4;
    for (let b = 0; b < boltCount; b++) {
      const segCount = 20;
      const positions = new Float32Array(segCount * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const lineCore = new THREE.Line(geo, this.materials.boltCore);
      const lineGlow = new THREE.Line(geo.clone(), this.materials.boltGlow);

      this.boltLines.push({
        core: lineCore,
        glow: lineGlow,
        geoCore: geo,
        geoGlow: lineGlow.geometry,
        segCount,
        branchIndex: b,
      });

      this.root.add(lineCore);
      this.root.add(lineGlow);
    }

    // 3. Ground Impact Shockwave Ring (expands outward at impact point)
    const waveGeo = new THREE.RingGeometry(0.2, 0.8, 36);
    this.shockwaveMesh = new THREE.Mesh(waveGeo, this.materials.shockwave);
    this.shockwaveMesh.rotation.x = -Math.PI / 2;
    this.shockwaveMesh.position.set(0, -0.4, -11);
    this.root.add(this.shockwaveMesh);

    // 4. Electrical Burst Sparks
    const sparkCount = this.isMobile ? 40 : 120;
    this.sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    this.sparkVels = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 0.5;
      sparkPos[i * 3 + 1] = -0.4;
      sparkPos[i * 3 + 2] = -11 + (Math.random() - 0.5) * 0.5;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 5.0;
      this.sparkVels.push({
        vx: Math.cos(angle) * speed,
        vy: 1.0 + Math.random() * 4.0,
        vz: Math.sin(angle) * speed,
      });
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    this.materials.sparkMat = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTex,
      transparent: true,
      opacity: 0,
      color: 0x88eeff,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.sparksPoints = new THREE.Points(this.sparkGeo, this.materials.sparkMat);
    this.root.add(this.sparksPoints);

    // 5. Flash Point Light
    this.flashLight = new THREE.PointLight(0xaae8ff, 0, 40);
    this.flashLight.position.set(0, 3, -11);
    this.root.add(this.flashLight);

    this.root.visible = false;
  }

  generateBoltPoints(geo, branchIndex) {
    const pos = geo.attributes.position;
    const count = pos.count;

    // Start point high in the clouds / space
    let startY = 24.0;
    let endY = -0.4;
    let startX = branchIndex === 0 ? 0 : (branchIndex === 1 ? -1.5 : (branchIndex === 2 ? 1.5 : 0.8));
    let endX = branchIndex === 0 ? 0 : (branchIndex === 1 ? -1.2 : (branchIndex === 2 ? 1.4 : 0.6));
    let z = -11;

    let cx = startX;
    let cy = startY;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const targetY = THREE.MathUtils.lerp(startY, endY, t);
      const targetX = THREE.MathUtils.lerp(startX, endX, t);

      // Add violent zigzag displacement
      const jitter = (1 - t) * 1.4 + 0.3;
      cx = targetX + (Math.random() - 0.5) * jitter;
      cy = targetY;

      pos.setXYZ(i, cx, cy, z + (Math.random() - 0.5) * jitter * 0.6);
    }

    pos.needsUpdate = true;
  }

  update(progress, time) {
    // Active during 76% - 85% (Strike & shockwave)
    if (progress < 0.76 || progress > 0.85) {
      this.root.visible = false;
      this.materials.boltCore.opacity = 0;
      this.materials.boltGlow.opacity = 0;
      this.materials.shockwave.opacity = 0;
      this.materials.sparkMat.opacity = 0;
      this.flashLight.intensity = 0;
      return;
    }

    this.root.visible = true;

    const p = (progress - 0.77) / 0.07; // 0 to 1

    if (p >= 0.05 && p < 0.38) {
      // MASSIVE STRIKE MOMENT!
      const strikeP = (p - 0.05) / 0.33;
      // Rapid flicker
      const flicker = Math.random() > 0.15 ? 1.0 : 0.2;
      this.materials.boltCore.opacity = flicker * 0.95;
      this.materials.boltGlow.opacity = flicker * 0.9;
      this.flashLight.intensity = flicker * 18.0;

      // Jitter bolt segments every frame
      this.boltLines.forEach((b) => {
        this.generateBoltPoints(b.geoCore, b.branchIndex);
        this.generateBoltPoints(b.geoGlow, b.branchIndex);
      });

      // Shockwave starts expanding
      this.shockwaveMesh.visible = true;
      const waveScale = 1.0 + strikeP * 12.0;
      this.shockwaveMesh.scale.set(waveScale, waveScale, waveScale);
      this.materials.shockwave.opacity = (1 - strikeP) * 0.85;

      // Sparks fly
      this.sparksPoints.visible = true;
      this.materials.sparkMat.opacity = 0.9;
      const sparkPos = this.sparkGeo.attributes.position;
      for (let i = 0; i < this.sparkVels.length; i++) {
        const vel = this.sparkVels[i];
        sparkPos.setX(i, (Math.random() - 0.5) * 0.3 + vel.vx * strikeP * 0.6);
        sparkPos.setY(i, -0.4 + vel.vy * strikeP * 0.5);
        sparkPos.setZ(i, -11 + (Math.random() - 0.5) * 0.3 + vel.vz * strikeP * 0.6);
      }
      this.sparkGeo.attributes.position.needsUpdate = true;
    } else if (p >= 0.38 && p < 0.8) {
      // Post-strike dissipation
      const fadeP = (p - 0.38) / 0.42;
      this.materials.boltCore.opacity = 0;
      this.materials.boltGlow.opacity = 0;
      this.flashLight.intensity = Math.max(0, (1 - fadeP) * 4.0);

      const waveScale = 5.0 + fadeP * 16.0;
      this.shockwaveMesh.scale.set(waveScale, waveScale, waveScale);
      this.materials.shockwave.opacity = Math.max(0, (1 - fadeP) * 0.4);

      this.materials.sparkMat.opacity = Math.max(0, (1 - fadeP) * 0.6);
    } else {
      this.materials.boltCore.opacity = 0;
      this.materials.boltGlow.opacity = 0;
      this.materials.shockwave.opacity = 0;
      this.materials.sparkMat.opacity = 0;
      this.flashLight.intensity = 0;
    }
  }

  dispose() {
    Object.values(this.materials).forEach((m) => {
      if (m && m.dispose) m.dispose();
    });
    this.boltLines.forEach((b) => {
      if (b.geoCore) b.geoCore.dispose();
      if (b.geoGlow) b.geoGlow.dispose();
    });
    if (this.shockwaveMesh && this.shockwaveMesh.geometry) {
      this.shockwaveMesh.geometry.dispose();
    }
    if (this.sparkGeo) this.sparkGeo.dispose();
  }
}

export default LightningEffectController;
