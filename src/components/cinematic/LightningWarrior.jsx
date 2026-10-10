import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getGlowParticleTexture } from './particleTexture';

/**
 * LightningWarriorController:
 * Celestial Thunder & Authentic 3D Asgardian Mjolnir Prop Controller.
 * 
 * THOR AUDIT & ASSET INTEGRATION:
 * - Loads authentic 3D Thor Hammer (Mjolnir) from /models/thor/hammer.glb.
 * - Jane Foster (female Thor model) is strictly EXCLUDED per user requirements.
 * - The authentic 3D hammer is showcased in Scene 4 surrounded by Bifrost electric arcs,
 *   crackling blue-white lightning, and cosmic levitation.
 * - Transitions smoothly between scenes without vanishing abruptly:
 *   - Scene 4: Descends from sky to center stage showcase.
 *   - Scene 5-7: Smoothly glides to left-mid flank, holding celestial hover.
 *   - Scene 8: Participates in superhero assembly formation.
 *   - Scene 9: Smoothly parts outward to left wing to keep central title completely clear.
 */
export class LightningWarriorController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Thor_Mjolnir_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.isLoaded = false;
    this.loadError = null;

    // Hammer pivot & correction
    this.hammerPivot = new THREE.Group();
    this.hammerPivot.name = 'Mjolnir_Pivot';
    this.root.add(this.hammerPivot);

    this.modelCorrectionGroup = new THREE.Group();
    this.hammerPivot.add(this.modelCorrectionGroup);

    this.thunderLight = null;
    this.lightningArcs = null;
    this.electricEmbers = null;
    this.emberGeo = null;
    this.emberData = [];

    this.materials = {
      lightningLine: null,
      emberGlow: null,
    };

    this.initEffects();
  }

  initEffects() {
    const glowTex = getGlowParticleTexture();

    // 1. Cosmic lightning line segments across space
    const arcCount = this.isMobile ? 12 : 24;
    const arcGeo = new THREE.BufferGeometry();
    const arcPos = new Float32Array(arcCount * 6);
    for (let i = 0; i < arcCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 1.6;
      arcPos[i * 6] = Math.cos(angle) * r;
      arcPos[i * 6 + 1] = 0.5 + (Math.random() - 0.5) * 1.8;
      arcPos[i * 6 + 2] = Math.sin(angle) * r;

      const angle2 = angle + (Math.random() - 0.5) * 0.8;
      const r2 = r + (Math.random() - 0.5) * 1.0;
      arcPos[i * 6 + 3] = Math.cos(angle2) * r2;
      arcPos[i * 6 + 4] = arcPos[i * 6 + 1] + (Math.random() - 0.5) * 1.2;
      arcPos[i * 6 + 5] = Math.sin(angle2) * r2;
    }
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));

    this.materials.lightningLine = new THREE.LineBasicMaterial({
      color: 0x94ebff,
      transparent: true,
      opacity: 0.0,
      linewidth: 2,
      blending: THREE.AdditiveBlending,
    });
    this.lightningArcs = new THREE.LineSegments(arcGeo, this.materials.lightningLine);
    this.hammerPivot.add(this.lightningArcs);

    // 2. Electric blue embers
    const count = this.isMobile ? 18 : 36;
    this.emberGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this.emberData = [];

    for (let i = 0; i < count; i++) {
      const radius = 0.4 + Math.random() * 1.8;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0.2 + Math.random() * 2.0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      col[i * 3] = 0.4;
      col[i * 3 + 1] = 0.85;
      col[i * 3 + 2] = 1.0;

      this.emberData.push({
        baseX: pos[i * 3],
        baseY: pos[i * 3 + 1],
        baseZ: pos[i * 3 + 2],
        speed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.emberGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    this.materials.emberGlow = new THREE.PointsMaterial({
      size: 0.16,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.electricEmbers = new THREE.Points(this.emberGeo, this.materials.emberGlow);
    this.hammerPivot.add(this.electricEmbers);

    // 3. Thunder flash light
    this.thunderLight = new THREE.PointLight(0x60d5ff, 0, 24);
    this.thunderLight.position.set(0, 0.8, 0.4);
    this.hammerPivot.add(this.thunderLight);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const primaryUrl = '/models/thor/hammer.glb';
      const fallbackUrl = '/models/hero/doom/avengers_-_thor_hammer.glb';

      const attemptLoad = (url) => {
        loader.load(
          url,
          (gltf) => {
            this.model = gltf.scene;
            this.model.name = 'Mjolnir_Model';

            this.setupModel();
            this.modelCorrectionGroup.add(this.model);
            this.isLoaded = true;
            this.loadError = null;
            console.log(`Thor Mjolnir: Authentic 3D hammer loaded successfully from ${url}.`);

            onProgress(100);
            resolve(this.root);
          },
          (xhr) => {
            if (xhr.total > 0) {
              onProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          },
          (err) => {
            if (url === primaryUrl) {
              console.warn(`Thor hammer primary load failed (${primaryUrl}), trying fallback...`);
              attemptLoad(fallbackUrl);
            } else {
              console.error('Failed to load Thor hammer model:', err);
              this.loadError = err;
              this.isLoaded = false;
              // Don't reject to keep rest of scene running
              onProgress(100);
              resolve(this.root);
            }
          }
        );
      };

      attemptLoad(primaryUrl);
    });
  }

  setupModel() {
    if (!this.model) return;

    // Scale raw hammer (~10 units) to heroic prop size (~3.2 units)
    const targetScale = 0.32;
    this.modelCorrectionGroup.scale.set(targetScale, targetScale, targetScale);

    // Center pivot: offset by bounding box center
    this.model.position.set(-0.398, -2.46, -0.098);
    // Slight heroic tilt so hammer head and handle angle dramatically
    this.modelCorrectionGroup.rotation.set(0.15, 0.25, -0.35);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material;
          mat.roughness = 0.28;
          mat.metalness = 0.85;
          mat.envMapIntensity = 1.8;
          mat.needsUpdate = true;
        }
      }
    });
  }

  update(progress, elapsedTime) {
    let isVisible = false;

    // CONTINUOUS TRANSITION LIFECYCLE:
    // Entrance: 0.33 to 0.38 (Descends from sky into center eye level)
    // Showcase: 0.38 to 0.46 (Center stage heroic levitation)
    // Smooth Transition Out: 0.46 to 0.58 (Glides to left-inner flank)
    // Perimeter Formation: 0.58 to 0.78 (Holds left flank)
    // Assembly: 0.78 to 0.88 (Assembled in lineup)
    // Title Reveal: 0.88 to 1.00 (Parts to left wing, clears center title)

    if (progress >= 0.33) {
      isVisible = true;

      let posX = 0.0;
      let posY = 1.35;
      let posZ = 0.5;
      let scale = 1.0;
      let thunderIntensity = 0.5;

      if (progress < 0.38) {
        // ENTRANCE (0.33 - 0.38): Descends from celestial sky into center stage
        const p = (progress - 0.33) / 0.05; // 0 to 1
        const smoothP = 1 - Math.pow(1 - p, 2.5);

        posX = 0.0;
        posY = THREE.MathUtils.lerp(3.8, 1.35, smoothP);
        posZ = THREE.MathUtils.lerp(-2.0, 0.5, smoothP);
        scale = THREE.MathUtils.lerp(0.3, 1.0, smoothP);
        thunderIntensity = smoothP * 4.5;
      } else if (progress < 0.46) {
        // SHOWCASE (0.38 - 0.46): Center stage heroic levitation at eye level
        posX = 0.0;
        posY = 1.35 + Math.sin(elapsedTime * 2.5) * 0.04;
        posZ = 0.5;
        scale = 1.0;
        thunderIntensity = 5.0;
      } else if (progress < 0.58) {
        // SMOOTH TRANSITION OUT (0.46 - 0.58): Glides smoothly to left-inner flank
        const p = (progress - 0.46) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(0.0, -1.8, smoothP);
        posY = THREE.MathUtils.lerp(1.35, 1.1, smoothP) + Math.sin(elapsedTime * 2.0) * 0.03;
        posZ = THREE.MathUtils.lerp(0.5, -0.4, smoothP);
        scale = THREE.MathUtils.lerp(1.0, 0.9, smoothP);
        thunderIntensity = THREE.MathUtils.lerp(5.0, 1.8, smoothP);
      } else if (progress < 0.88) {
        // FORMATION & ASSEMBLY (0.58 - 0.88): Left-inner flank in squad formation
        posX = -1.8;
        posY = 1.1 + Math.sin(elapsedTime * 1.8 + 0.5) * 0.03;
        posZ = -0.4;
        scale = 0.9;
        thunderIntensity = 2.0;
      } else {
        // FINAL TITLE REVEAL (0.88 - 1.00): Parts outward to left wing to clear title!
        const p = (progress - 0.88) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(-1.8, -3.8, smoothP);
        posY = THREE.MathUtils.lerp(1.1, 0.85, smoothP) + Math.sin(elapsedTime * 1.5) * 0.03;
        posZ = THREE.MathUtils.lerp(-0.4, -0.6, smoothP);
        scale = 0.85;
        thunderIntensity = 1.6;
      }

      this.root.position.set(posX, posY, posZ);
      this.root.scale.set(scale, scale, scale);

      // Cosmic levitation rotation of Mjolnir
      const rotY = Math.sin(elapsedTime * 1.4) * 0.2;
      const rotZ = Math.cos(elapsedTime * 1.2) * 0.12;
      this.hammerPivot.rotation.set(0, rotY, rotZ);

      // Flashing celestial lightning
      const isBurst = Math.sin(elapsedTime * 22.0) > 0.45;
      const flash = isBurst ? thunderIntensity * 1.6 : thunderIntensity * 0.4;
      this.thunderLight.intensity = flash;

      this.materials.lightningLine.opacity = isBurst ? 0.85 : 0.35;
      this.materials.emberGlow.opacity = 0.65;

      // Jitter lightning arcs
      const arcPos = this.lightningArcs.geometry.attributes.position;
      for (let i = 0; i < arcPos.count; i++) {
        if (Math.random() < 0.2) {
          arcPos.setY(i, arcPos.getY(i) + (Math.random() - 0.5) * 0.06);
        }
      }
      arcPos.needsUpdate = true;
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      this.thunderLight.intensity = 0;
    }

    this.root.visible = isVisible;
  }

  dispose() {
    if (this.root) {
      this.root.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
    }
  }
}

export default LightningWarriorController;
