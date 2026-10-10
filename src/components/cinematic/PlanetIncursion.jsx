import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * PlanetIncursionController:
 * Multiverse Incursion & Planet-Entry Cinematic Sequence.
 * Features:
 * 1. Massive cosmic planet with glowing atmosphere rim, continents, and cloud layers
 * 2. Hypersonic atmosphere entry with plasma haze and rushing particulate friction
 * 3. Futuristic planetary horizon with glowing cyber spires
 * 4. Reality cracks: branching violet/cyan dimensional fractures spreading through the sky
 * 5. Multiverse Incursion: Universe A & Universe B overlapping in the same coordinates
 * 6. Gravitational Collapse: all reality fragments and particles spiraling inward to a singularity
 * 7. Cinematic Blackout threshold transitioning into the superhero flight sequence
 */
export class PlanetIncursionController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Planet_Incursion_Root';
    this.isMobile = isMobile;

    this.materials = {
      planetSurface: null,
      atmosphereGlow: null,
      clouds: null,
      spires: null,
      realityCracks: null,
      universeBPlanet: null,
      universeBCrystals: null,
      vortexCore: null,
      vortexParticles: null,
    };

    // Sub-objects
    this.planetGroup = null;
    this.atmosphereMesh = null;
    this.cloudMesh = null;
    this.entryParticles = null;
    this.entryGeo = null;
    this.surfaceGroup = null;
    this.cracksGroup = null;
    this.universeBGroup = null;
    this.vortexGroup = null;
    this.vortexGeo = null;
    this.vortexData = [];
    this.blackoutMesh = null;

    this.incursionLight = null;

    this.init();
  }

  init() {
    const glowTex = getGlowParticleTexture();

    // ==============================================================
    // 1. MATERIALS
    // ==============================================================
    this.materials.planetSurface = new THREE.MeshStandardMaterial({
      color: 0x0c2540, // Deep oceanic blue-slate
      roughness: 0.65,
      metalness: 0.25,
      emissive: 0x002244,
      emissiveIntensity: 0.4,
    });

    this.materials.atmosphereGlow = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });

    this.materials.clouds = new THREE.MeshStandardMaterial({
      color: 0xd8eeff,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      roughness: 0.8,
    });

    this.materials.spires = new THREE.MeshStandardMaterial({
      color: 0x111927,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x00aaff,
      emissiveIntensity: 0.8,
    });

    this.materials.realityCracks = new THREE.LineBasicMaterial({
      color: 0xc850ff, // Dimensional violet/magenta fracture
      linewidth: 2.5,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });

    this.materials.universeBPlanet = new THREE.MeshStandardMaterial({
      color: 0x5a1836, // Crimson-purple anomaly world
      roughness: 0.5,
      metalness: 0.4,
      emissive: 0x881144,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.0,
    });

    this.materials.universeBCrystals = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xff4488,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.0,
    });

    this.materials.vortexCore = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    // ==============================================================
    // 2. CELESTIAL PLANET (Universe A)
    // ==============================================================
    this.planetGroup = new THREE.Group();
    this.planetGroup.position.set(0, 0, -42);

    const planetGeo = new THREE.SphereGeometry(14, this.isMobile ? 24 : 40, this.isMobile ? 24 : 40);
    const planetMesh = new THREE.Mesh(planetGeo, this.materials.planetSurface);
    this.planetGroup.add(planetMesh);

    // Glowing atmospheric shell
    const atmoGeo = new THREE.SphereGeometry(14.8, 32, 32);
    this.atmosphereMesh = new THREE.Mesh(atmoGeo, this.materials.atmosphereGlow);
    this.planetGroup.add(this.atmosphereMesh);

    // Atmospheric cloud sphere
    const cloudGeo = new THREE.SphereGeometry(14.2, 32, 32);
    this.cloudMesh = new THREE.Mesh(cloudGeo, this.materials.clouds);
    this.planetGroup.add(this.cloudMesh);

    this.root.add(this.planetGroup);

    // ==============================================================
    // 3. ATMOSPHERE ENTRY PARTICLES (Plasma friction streams)
    // ==============================================================
    const entryCount = this.isMobile ? 80 : 220;
    this.entryGeo = new THREE.BufferGeometry();
    const entryPos = new Float32Array(entryCount * 3);
    const entryCol = new Float32Array(entryCount * 3);
    this.entryVels = [];

    for (let i = 0; i < entryCount; i++) {
      entryPos[i * 3] = (Math.random() - 0.5) * 14;
      entryPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      entryPos[i * 3 + 2] = -12 - Math.random() * 25;

      const isFire = Math.random() > 0.4;
      entryCol[i * 3] = isFire ? 1.0 : 0.0;
      entryCol[i * 3 + 1] = isFire ? 0.6 : 0.85;
      entryCol[i * 3 + 2] = isFire ? 0.2 : 1.0;

      this.entryVels.push({
        vz: 12 + Math.random() * 25,
      });
    }

    this.entryGeo.setAttribute('position', new THREE.BufferAttribute(entryPos, 3));
    this.entryGeo.setAttribute('color', new THREE.BufferAttribute(entryCol, 3));

    const entryMat = new THREE.PointsMaterial({
      size: 0.16,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.entryParticles = new THREE.Points(this.entryGeo, entryMat);
    this.root.add(this.entryParticles);

    // ==============================================================
    // 4. PLANETARY SURFACE HORIZON & FUTURISTIC SPIRES
    // ==============================================================
    this.surfaceGroup = new THREE.Group();
    this.surfaceGroup.position.set(0, -5.5, -20);

    // Curved terrain horizon
    const groundGeo = new THREE.CylinderGeometry(28, 28, 1.2, 48);
    const groundMesh = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({
        color: 0x08101e,
        roughness: 0.7,
        metalness: 0.3,
      })
    );
    this.surfaceGroup.add(groundMesh);

    // Futuristic spire monoliths
    const spireCount = this.isMobile ? 12 : 28;
    for (let i = 0; i < spireCount; i++) {
      const h = 2.5 + Math.random() * 6.5;
      const w = 0.3 + Math.random() * 0.5;
      const spireGeo = new THREE.BoxGeometry(w, h, w);
      const spire = new THREE.Mesh(spireGeo, this.materials.spires);
      const angle = (i / spireCount) * Math.PI * 0.9 - Math.PI * 0.45;
      const dist = 6 + Math.random() * 12;
      spire.position.set(Math.sin(angle) * dist, h / 2, -Math.cos(angle) * dist * 0.5 - 2);
      this.surfaceGroup.add(spire);
    }

    this.surfaceGroup.visible = false;
    this.root.add(this.surfaceGroup);

    // ==============================================================
    // 5. REALITY CRACKS (Branching Dimensional Fractures in Sky)
    // ==============================================================
    this.cracksGroup = new THREE.Group();
    this.cracksGroup.position.set(0, 3.5, -18);

    const crackCount = this.isMobile ? 5 : 12;
    for (let c = 0; c < crackCount; c++) {
      const segs = 14;
      const positions = new Float32Array(segs * 3);
      let cx = (Math.random() - 0.5) * 8;
      let cy = (Math.random() - 0.5) * 4;
      let cz = (Math.random() - 0.5) * 3;

      for (let s = 0; s < segs; s++) {
        positions[s * 3] = cx;
        positions[s * 3 + 1] = cy;
        positions[s * 3 + 2] = cz;

        cx += (Math.random() - 0.5) * 1.8;
        cy += (Math.random() - 0.4) * 1.2;
        cz += (Math.random() - 0.5) * 0.8;
      }

      const cGeo = new THREE.BufferGeometry();
      cGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const cLine = new THREE.Line(cGeo, this.materials.realityCracks);
      this.cracksGroup.add(cLine);
    }

    this.cracksGroup.visible = false;
    this.root.add(this.cracksGroup);

    // ==============================================================
    // 6. UNIVERSE B (INCURSION OVERLAPPING WORLD)
    // ==============================================================
    this.universeBGroup = new THREE.Group();
    this.universeBGroup.position.set(4.5, 3.2, -26);

    // Inverted celestial body phasing in
    const bPlanetGeo = new THREE.SphereGeometry(7.5, 24, 24);
    const bPlanet = new THREE.Mesh(bPlanetGeo, this.materials.universeBPlanet);
    this.universeBGroup.add(bPlanet);

    // Floating Surreal Incursion Crystal Obelisks
    const crystalCount = this.isMobile ? 8 : 18;
    for (let i = 0; i < crystalCount; i++) {
      const cryGeo = new THREE.OctahedronGeometry(0.4 + Math.random() * 0.6);
      const cryMesh = new THREE.Mesh(cryGeo, this.materials.universeBCrystals);
      cryMesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      this.universeBGroup.add(cryMesh);
    }

    this.universeBGroup.visible = false;
    this.root.add(this.universeBGroup);

    // ==============================================================
    // 7. GRAVITATIONAL COLLAPSE VORTEX
    // ==============================================================
    this.vortexGroup = new THREE.Group();
    this.vortexGroup.position.set(0, 0, -16);

    // Singularity Core ring
    const coreRingGeo = new THREE.RingGeometry(0.1, 1.8, 32);
    const coreRing = new THREE.Mesh(coreRingGeo, this.materials.vortexCore);
    this.vortexGroup.add(coreRing);

    // Spiraling Inward Particles
    const vCount = this.isMobile ? 120 : 340;
    this.vortexGeo = new THREE.BufferGeometry();
    const vPos = new Float32Array(vCount * 3);
    const vCol = new Float32Array(vCount * 3);
    this.vortexData = [];

    for (let i = 0; i < vCount; i++) {
      const radius = 2.0 + Math.random() * 16.0;
      const angle = Math.random() * Math.PI * 2;
      vPos[i * 3] = Math.cos(angle) * radius;
      vPos[i * 3 + 1] = Math.sin(angle) * radius;
      vPos[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const isViolet = Math.random() > 0.5;
      vCol[i * 3] = isViolet ? 0.8 : 0.0;
      vCol[i * 3 + 1] = isViolet ? 0.2 : 0.85;
      vCol[i * 3 + 2] = 1.0;

      this.vortexData.push({
        radius,
        angle,
        speed: 1.5 + Math.random() * 3.5,
        z: vPos[i * 3 + 2],
      });
    }

    this.vortexGeo.setAttribute('position', new THREE.BufferAttribute(vPos, 3));
    this.vortexGeo.setAttribute('color', new THREE.BufferAttribute(vCol, 3));

    const vMat = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.materials.vortexParticles = vMat;

    this.vortexPoints = new THREE.Points(this.vortexGeo, vMat);
    this.vortexGroup.add(this.vortexPoints);

    this.vortexGroup.visible = false;
    this.root.add(this.vortexGroup);

    // ==============================================================
    // 8. CINEMATIC BLACKOUT CURTAIN
    // ==============================================================
    const blackoutGeo = new THREE.PlaneGeometry(50, 50);
    const blackoutMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthTest: false,
    });
    this.blackoutMesh = new THREE.Mesh(blackoutGeo, blackoutMat);
    this.blackoutMesh.position.set(0, 0, -2);
    this.blackoutMesh.visible = false;
    this.root.add(this.blackoutMesh);

    // 9. Dynamic Incursion Point Light
    this.incursionLight = new THREE.PointLight(0xc850ff, 0, 35);
    this.incursionLight.position.set(0, 2, -18);
    this.root.add(this.incursionLight);

    this.root.visible = false;
  }

  update(progress, time) {
    // Active during Multiverse Incursion sequence: 0.24 to 0.45
    if (progress < 0.24 || progress > 0.46) {
      this.root.visible = false;
      this.planetGroup.visible = false;
      this.surfaceGroup.visible = false;
      this.cracksGroup.visible = false;
      this.universeBGroup.visible = false;
      this.vortexGroup.visible = false;
      this.blackoutMesh.visible = false;
      this.incursionLight.intensity = 0;
      return;
    }

    this.root.visible = true;

    // Normalizing incursion progress (0 to 1 across 0.24 -> 0.45)
    const p = (progress - 0.24) / 0.21;

    // -------------------------------------------------------------
    // PHASE 1: PLANET APPROACH (p: 0.00 -> 0.22 / scroll 0.24 -> 0.28)
    // -------------------------------------------------------------
    if (p < 0.22) {
      const appP = p / 0.22;
      this.planetGroup.visible = true;
      this.surfaceGroup.visible = false;
      this.cracksGroup.visible = false;
      this.universeBGroup.visible = false;
      this.vortexGroup.visible = false;
      this.blackoutMesh.visible = false;
      this.entryParticles.material.opacity = 0;

      // Planet moves toward camera
      this.planetGroup.position.set(0, 0, THREE.MathUtils.lerp(-48, -24, appP));
      this.planetGroup.rotation.y = time * 0.02;
      this.cloudMesh.rotation.y = time * 0.035;

      this.materials.atmosphereGlow.opacity = 0.4 + appP * 0.35;
      this.incursionLight.intensity = 0;
    }
    // -------------------------------------------------------------
    // PHASE 2: ATMOSPHERE ENTRY (p: 0.22 -> 0.42 / scroll 0.28 -> 0.32)
    // -------------------------------------------------------------
    else if (p < 0.42) {
      const entryP = (p - 0.22) / 0.20;
      this.planetGroup.visible = true;
      this.surfaceGroup.visible = entryP > 0.5;
      this.cracksGroup.visible = false;
      this.universeBGroup.visible = false;
      this.vortexGroup.visible = false;
      this.blackoutMesh.visible = false;

      // Camera plunges into atmosphere
      this.planetGroup.position.set(0, THREE.MathUtils.lerp(0, -6, entryP), THREE.MathUtils.lerp(-24, -8, entryP));

      // Plasma friction sparks stream past
      this.entryParticles.visible = true;
      this.entryParticles.material.opacity = Math.sin(entryP * Math.PI) * 0.95;

      const pos = this.entryGeo.attributes.position;
      for (let i = 0; i < this.entryVels.length; i++) {
        let z = pos.getZ(i) + this.entryVels[i].vz * 0.04;
        if (z > 5) z = -25 - Math.random() * 10;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;

      // Reveal planetary surface as we break through the clouds
      if (entryP > 0.5) {
        const surfFade = (entryP - 0.5) / 0.5;
        this.surfaceGroup.position.y = THREE.MathUtils.lerp(-12, -5.5, surfFade);
      }
    }
    // -------------------------------------------------------------
    // PHASE 3: SURFACE WORLD & REALITY CRACKS (p: 0.42 -> 0.62 / scroll 0.32 -> 0.36)
    // -------------------------------------------------------------
    else if (p < 0.62) {
      const crackP = (p - 0.42) / 0.20;
      this.planetGroup.visible = false;
      this.surfaceGroup.visible = true;
      this.cracksGroup.visible = true;
      this.universeBGroup.visible = crackP > 0.5;
      this.vortexGroup.visible = false;
      this.blackoutMesh.visible = false;
      this.entryParticles.material.opacity = 0;

      // Cracks brighten and spread through reality
      this.materials.realityCracks.opacity = Math.min(1, crackP * 1.5);
      this.incursionLight.intensity = crackP * 4.5 + Math.sin(time * 12) * 1.0;

      // Subtle sky fissure displacement
      this.cracksGroup.scale.setScalar(1 + crackP * 0.4);

      if (crackP > 0.5) {
        const uFade = (crackP - 0.5) / 0.5;
        this.materials.universeBPlanet.opacity = uFade * 0.65;
        this.materials.universeBCrystals.opacity = uFade * 0.85;
      }
    }
    // -------------------------------------------------------------
    // PHASE 4: MULTIVERSE OVERLAP (INCURSION) (p: 0.62 -> 0.82 / scroll 0.36 -> 0.40)
    // -------------------------------------------------------------
    else if (p < 0.82) {
      const clashP = (p - 0.62) / 0.20;
      this.planetGroup.visible = false;
      this.surfaceGroup.visible = true;
      this.cracksGroup.visible = true;
      this.universeBGroup.visible = true;
      this.vortexGroup.visible = clashP > 0.6;
      this.blackoutMesh.visible = false;

      // Two realities occupying identical coordinate space!
      this.materials.universeBPlanet.opacity = 0.85;
      this.materials.universeBCrystals.opacity = 0.95;
      this.universeBGroup.rotation.y = time * 0.05;

      // Reality cracks pulsate violently
      this.materials.realityCracks.opacity = 0.8 + Math.sin(time * 18) * 0.2;
      this.incursionLight.intensity = 6.0 + Math.sin(time * 15) * 2.0;

      // Spire monoliths shimmer with destabilized voltage
      this.surfaceGroup.rotation.z = Math.sin(time * 4) * 0.02 * clashP;
    }
    // -------------------------------------------------------------
    // PHASE 5: GRAVITATIONAL COLLAPSE & VORTEX (p: 0.82 -> 0.95 / scroll 0.40 -> 0.43)
    // -------------------------------------------------------------
    else if (p < 0.95) {
      const colP = (p - 0.82) / 0.13;
      this.planetGroup.visible = false;
      this.surfaceGroup.visible = true;
      this.cracksGroup.visible = true;
      this.universeBGroup.visible = true;
      this.vortexGroup.visible = true;
      this.blackoutMesh.visible = false;

      // Collapse all geometry inward
      const collapseScale = Math.max(0.05, 1 - colP * 0.85);
      this.surfaceGroup.scale.setScalar(collapseScale);
      this.cracksGroup.scale.setScalar(collapseScale);
      this.universeBGroup.scale.setScalar(collapseScale);

      // Vortex spiraling acceleration
      this.materials.vortexCore.opacity = colP * 0.95;
      this.materials.vortexParticles.opacity = colP * 0.9;
      this.incursionLight.intensity = (1 - colP) * 8.0;

      const pos = this.vortexGeo.attributes.position;
      for (let i = 0; i < this.vortexData.length; i++) {
        const d = this.vortexData[i];
        // Spiral inward with exponential acceleration
        d.radius = Math.max(0.2, d.radius - colP * 0.35);
        d.angle += d.speed * (0.02 + colP * 0.08);

        pos.setX(i, Math.cos(d.angle) * d.radius);
        pos.setY(i, Math.sin(d.angle) * d.radius);
      }
      pos.needsUpdate = true;
    }
    // -------------------------------------------------------------
    // PHASE 6: CINEMATIC BLACKOUT (p: 0.95 -> 1.0 / scroll 0.43 -> 0.45)
    // -------------------------------------------------------------
    else {
      const blackP = (p - 0.95) / 0.05;
      this.planetGroup.visible = false;
      this.surfaceGroup.visible = false;
      this.cracksGroup.visible = false;
      this.universeBGroup.visible = false;
      this.vortexGroup.visible = false;

      // Total blackout veil
      this.blackoutMesh.visible = true;
      this.blackoutMesh.material.opacity = blackP < 0.8 ? 1.0 : (1.0 - (blackP - 0.8) / 0.2);
      this.incursionLight.intensity = 0;
    }
  }

  dispose() {
    Object.values(this.materials).forEach((m) => {
      if (m && m.dispose) m.dispose();
    });
    if (this.entryGeo) this.entryGeo.dispose();
    if (this.vortexGeo) this.vortexGeo.dispose();
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

export default PlanetIncursionController;
