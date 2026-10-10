import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGlowParticleTexture } from './particleTexture';

/**
 * VillainModelController (Doctor Doom):
 * Loads and displays the authentic Doctor Doom 3D model (doom.glb).
 * 
 * Clean, character-focused design:
 * - Real GLB loaded from /models/doom/doom.glb
 * - Authentic dark armor, silver faceplate, and forest-green cowl
 * - Dramatic emerald-green rim lighting and subtle green specular reflections
 * - Subtle, thin green portal ring BEHIND Doom (never covering the character)
 * - Restrained green stardust particles around gauntlet
 * - Fully framed in camera (head to boots completely visible)
 */
export class VillainModelController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'DoctorDoom_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.isLoaded = false;
    this.loadError = null;

    // Character pivot
    this.characterPivot = new THREE.Group();
    this.characterPivot.name = 'Doom_Pivot';
    this.root.add(this.characterPivot);

    // Subtle green background portal ring (behind Doom)
    this.portalRing = null;

    // Subtle green stardust particles
    this.stardust = null;
    this.stardustGeo = null;
    this.stardustData = [];

    // Lighting
    this.rimLight = null;
    this.fillLight = null;
    this.keyLight = null;

    this.materials = {
      portalRing: null,
      stardust: null,
    };

    this.initEffects();
  }

  initEffects() {
    const glowTex = getGlowParticleTexture();

    // 1. Subtle, elegant thin portal ring BEHIND Doom (Z = -1.2)
    const ringGeo = new THREE.TorusGeometry(2.3, 0.025, 16, 64);
    this.materials.portalRing = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.portalRing = new THREE.Mesh(ringGeo, this.materials.portalRing);
    this.portalRing.position.set(0, 1.8, -1.2);
    this.characterPivot.add(this.portalRing);

    // 2. Restrained green stardust particles around gauntlet and body (small, subtle)
    const particleCount = this.isMobile ? 18 : 35;
    this.stardustGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    this.stardustData = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.4 + Math.random() * 1.5;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 1.0 + Math.random() * 1.6;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      col[i * 3] = 0.1;
      col[i * 3 + 1] = 0.95;
      col[i * 3 + 2] = 0.45;

      this.stardustData.push({
        baseX: pos[i * 3],
        baseY: pos[i * 3 + 1],
        baseZ: pos[i * 3 + 2],
        speed: 1.0 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.stardustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stardustGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    this.materials.stardust = new THREE.PointsMaterial({
      size: 0.12,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.stardust = new THREE.Points(this.stardustGeo, this.materials.stardust);
    this.characterPivot.add(this.stardust);

    // 3. Dynamic Emerald Lighting
    this.rimLight = new THREE.PointLight(0x00ff77, 0, 22);
    this.rimLight.position.set(0, 2.6, -1.8);
    this.characterPivot.add(this.rimLight);

    this.fillLight = new THREE.PointLight(0x22ee88, 0, 16);
    this.fillLight.position.set(-0.8, 2.0, 1.4);
    this.characterPivot.add(this.fillLight);

    this.keyLight = new THREE.PointLight(0x88ffcc, 0, 16);
    this.keyLight.position.set(0.8, 2.2, 1.5);
    this.characterPivot.add(this.keyLight);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const primaryUrl = '/models/doom/doom.glb';
      const fallbackUrl = '/models/hero/doom/doom.glb';

      const attemptLoad = (url) => {
        loader.load(
          url,
          (gltf) => {
            this.model = gltf.scene;
            this.model.name = 'DoctorDoom_Model';

            this.setupModel();
            this.characterPivot.add(this.model);
            this.isLoaded = true;
            this.loadError = null;
            console.log(`Doctor Doom: Authentic 3D model loaded successfully from ${url}.`);

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
              console.warn(`Doctor Doom primary load failed (${primaryUrl}), trying fallback...`);
              attemptLoad(fallbackUrl);
            } else {
              console.error('CRITICAL: Failed to load Doctor Doom 3D model:', err);
              this.loadError = err;
              this.isLoaded = false;
              reject(err);
            }
          }
        );
      };

      attemptLoad(primaryUrl);
    });
  }

  setupModel() {
    if (!this.model) return;

    // Scale to ~1.65: raw height is 2.02m -> scaled height is ~3.33m
    const targetScale = 1.65;
    this.model.scale.set(targetScale, targetScale, targetScale);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material;
          mat.roughness = Math.min(mat.roughness ?? 0.38, 0.4);
          mat.metalness = Math.max(mat.metalness ?? 0.65, 0.7);
          mat.envMapIntensity = 1.5;
          mat.needsUpdate = true;
        }
      }
    });

    // Center X & Z, place feet at Y = 0
    this.model.position.set(0, 0, 0);
  }

  update(progress, elapsedTime) {
    let isVisible = false;

    // CONTINUOUS TRANSITION LIFECYCLE:
    // Entrance: 0.20 to 0.26 (Glides forward into center stage)
    // Showcase: 0.26 to 0.34 (Commands center stage)
    // Smooth Transition Out: 0.34 to 0.46 (Glides smoothly to right flank)
    // Flank Formation Hold: 0.46 to 0.78 (Remains visible on right wing)
    // Assembly: 0.78 to 0.88 (Assembled in lineup)
    // Title Reveal: 0.88 to 1.00 (Parts smoothly to far-right wing to clear center title)

    if (progress >= 0.20) {
      isVisible = true;

      let posX = 0.0;
      let posY = 0.2;
      let posZ = 0.6;
      let rotY = 0.0;
      let scale = 1.0;
      let lightScale = 1.0;

      if (progress < 0.26) {
        // ENTRANCE (0.20 - 0.26): Glides forward from deep space
        const p = (progress - 0.20) / 0.06; // 0 to 1
        const smoothP = 1 - Math.pow(1 - p, 2.5);

        posX = 0.0;
        posY = THREE.MathUtils.lerp(0.8, 0.2, smoothP) + Math.sin(elapsedTime * 2.0) * 0.03;
        posZ = THREE.MathUtils.lerp(-4.0, 0.6, smoothP);
        scale = THREE.MathUtils.lerp(0.4, 1.0, smoothP);
        rotY = Math.sin(elapsedTime * 0.8) * 0.04;
        lightScale = smoothP;
      } else if (progress < 0.33) {
        // SHOWCASE (0.26 - 0.33): Commanding center stage presence
        posX = 0.0;
        posY = 0.2 + Math.sin(elapsedTime * 2.0) * 0.03;
        posZ = 0.6;
        scale = 1.0;
        rotY = Math.sin(elapsedTime * 0.8) * 0.05;
        lightScale = 1.0;
      } else if (progress < 0.40) {
        // SMOOTH TRANSITION OUT (0.33 - 0.40): Glides smoothly to right flank
        const p = (progress - 0.33) / 0.07; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(0.0, 2.8, smoothP);
        posY = THREE.MathUtils.lerp(0.2, 0.0, smoothP) + Math.sin(elapsedTime * 1.8) * 0.03;
        posZ = THREE.MathUtils.lerp(0.6, -0.5, smoothP);
        scale = THREE.MathUtils.lerp(1.0, 0.95, smoothP);
        rotY = THREE.MathUtils.lerp(0.0, -0.25, smoothP);
        lightScale = THREE.MathUtils.lerp(1.0, 0.8, smoothP);
      } else if (progress < 0.88) {
        // FLANK FORMATION & ASSEMBLY (0.40 - 0.88): Stationed on right flank
        posX = 2.8;
        posY = 0.0 + Math.sin(elapsedTime * 1.8 + 1.0) * 0.03;
        posZ = -0.5;
        scale = 0.95;
        rotY = -0.25;
        lightScale = 0.8;
      } else {
        // FINAL TITLE REVEAL (0.88 - 1.00): Parts outward to far-right wing to clear center title!
        const p = (progress - 0.88) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(2.8, 5.4, smoothP);
        posY = THREE.MathUtils.lerp(0.0, -0.1, smoothP) + Math.sin(elapsedTime * 1.6 + 1.0) * 0.03;
        posZ = THREE.MathUtils.lerp(-0.5, -0.8, smoothP);
        scale = 0.88;
        rotY = THREE.MathUtils.lerp(-0.25, -0.35, smoothP);
        lightScale = 0.75;
      }

      this.root.position.set(posX, posY, posZ);
      this.root.scale.set(scale, scale, scale);
      this.characterPivot.rotation.set(0, rotY, 0);

      this.rimLight.intensity = 5.0 * lightScale;
      this.fillLight.intensity = 2.8 * lightScale;
      this.keyLight.intensity = 2.5 * lightScale;

      // Green shield ring only active during solo showcase; fades out cleanly afterwards
      let ringOpacity = 0.0;
      if (progress >= 0.22 && progress < 0.33) {
        ringOpacity = 0.4;
      } else if (progress >= 0.33 && progress < 0.40) {
        ringOpacity = THREE.MathUtils.lerp(0.4, 0.0, (progress - 0.33) / 0.07);
      }
      this.materials.portalRing.opacity = ringOpacity;
      this.materials.stardust.opacity = 0.55 * lightScale;
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      this.rimLight.intensity = 0;
      this.fillLight.intensity = 0;
      this.keyLight.intensity = 0;
    }

    this.root.visible = isVisible;

    // Animate stardust
    if (isVisible && this.stardustGeo) {
      const posAttr = this.stardustGeo.attributes.position;
      for (let i = 0; i < this.stardustData.length; i++) {
        const d = this.stardustData[i];
        const t = elapsedTime * d.speed + d.phase;
        posAttr.setY(i, d.baseY + Math.sin(t) * 0.2);
      }
      posAttr.needsUpdate = true;
    }
  }

  dispose() {
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
    if (this.stardustGeo) this.stardustGeo.dispose();
    if (this.materials.portalRing) this.materials.portalRing.dispose();
    if (this.materials.stardust) this.materials.stardust.dispose();
  }
}

export default VillainModelController;
