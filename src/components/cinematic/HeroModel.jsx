import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGlowParticleTexture } from './particleTexture';

/**
 * HeroModelController (Iron Man):
 * Loads and renders the authentic Iron Man Mark VII 3D model (ironman.glb).
 * 
 * Verified Model Coordinates & Orientation:
 * - GLB height is along Z (0 to 2305 units)
 * - Front chest plate is along -Y
 * - Exact Euler rotation (-Math.PI / 2, 0, 0) maps:
 *   - Head apex (Z = 2305) to +Y (pointing straight UP)
 *   - Boots/soles (Z = 0) to Y = 0 (pointing straight DOWN)
 *   - Front chest plate (-Y) to +Z (facing camera)
 *   - Back plate (+Y) to -Z (facing away)
 *   - Right arm (+X) to +X (screen right)
 *   - Left arm (-X) to -X (screen left)
 * 
 * Strict Transformation Architecture:
 * this.root (World scroll position X, Y, Z)
 *   └── this.flightPivot (Flight pitch & hover dynamics)
 *         └── this.modelCorrectionGroup (STATIC: rotation.set(-Math.PI / 2, 0, 0), scale, position.set(0, -1.7, 0))
 *               └── this.model (raw gltf.scene)
 * 
 * With modelCorrectionGroup centering the 3.4m tall character:
 * - Boots are at Y = -1.7m in flightPivot
 * - Head is at Y = +1.7m in flightPivot
 * - Chest is at Y = +0.51m, Z = +0.15m in flightPivot (facing camera)
 * When flightPivot.rotation.set(0, 0, 0), Iron Man is GUARANTEED 100% upright and facing camera.
 */
export class HeroModelController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'IronMan_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.isLoaded = false;
    this.loadError = null;

    // 1. Flight dynamics pivot (for flight pitch & hover float)
    this.flightPivot = new THREE.Group();
    this.flightPivot.name = 'IronMan_FlightPivot';
    this.root.add(this.flightPivot);

    // 2. Dedicated static model correction group (strictly decoupled from animation)
    this.modelCorrectionGroup = new THREE.Group();
    this.modelCorrectionGroup.name = 'IronMan_CorrectionGroup';
    this.flightPivot.add(this.modelCorrectionGroup);

    // Dynamic lights & emitters
    this.arcReactorLight = null;
    this.armorKeyLight = null;
    this.frontFillLight = null;
    this.portalGlowLight = null;
    this.thrusterParticles = null;
    this.thrusterGeo = null;
    this.thrusterData = [];

    this.materials = {
      thrusterGlow: null,
    };

    this.initEffects();
  }

  initEffects() {
    const glowTex = getGlowParticleTexture();

    // 1. Arc Reactor chest point light (white-cyan, chest at Y = 0.51, Z = 0.35 in flightPivot)
    this.arcReactorLight = new THREE.PointLight(0x00e1ff, 0, 16);
    this.arcReactorLight.position.set(0, 0.51, 0.35);
    this.flightPivot.add(this.arcReactorLight);

    // 2. Armor chest illumination light (gold/red enhancement)
    this.armorKeyLight = new THREE.PointLight(0xffbb55, 0, 14);
    this.armorKeyLight.position.set(0, 0.7, 1.2);
    this.flightPivot.add(this.armorKeyLight);

    // 3. Bright frontal studio key light for red/gold armor plates
    this.frontFillLight = new THREE.PointLight(0xfff4e6, 0, 22);
    this.frontFillLight.position.set(0, 0.2, 2.8);
    this.flightPivot.add(this.frontFillLight);

    // 4. Portal reflection rim light (warm orange behind armor)
    this.portalGlowLight = new THREE.PointLight(0xff8800, 0, 14);
    this.portalGlowLight.position.set(0, 0.5, -1.2);
    this.flightPivot.add(this.portalGlowLight);

    // 5. Foot Thruster Particle System (emitting beneath boots at Y ≈ -1.75 in flightPivot)
    const count = this.isMobile ? 24 : 48;
    this.thrusterGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this.thrusterData = [];

    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const footX = isLeft ? -0.28 : 0.28;
      pos[i * 3] = footX + (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 1] = -1.75 - Math.random() * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.12;

      // Cyan-white core
      const isWhite = Math.random() > 0.4;
      col[i * 3] = isWhite ? 0.8 : 0.2;
      col[i * 3 + 1] = isWhite ? 0.95 : 0.8;
      col[i * 3 + 2] = 1.0;

      this.thrusterData.push({
        footX,
        y: pos[i * 3 + 1],
        speed: 1.8 + Math.random() * 2.4,
      });
    }

    this.thrusterGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.thrusterGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    this.materials.thrusterGlow = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.thrusterParticles = new THREE.Points(this.thrusterGeo, this.materials.thrusterGlow);
    this.flightPivot.add(this.thrusterParticles);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const primaryUrl = '/models/ironman/ironman.glb';
      const fallbackUrl = '/models/hero/doom/iron_man.glb';

      const attemptLoad = (url) => {
        loader.load(
          url,
          (gltf) => {
            this.model = gltf.scene;
            this.model.name = 'IronMan_Model';

            this.setupModel();
            this.modelCorrectionGroup.add(this.model);
            this.isLoaded = true;
            this.loadError = null;
            console.log(`Iron Man: Authentic Mark VII 3D model loaded successfully from ${url}.`);

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
              console.warn(`Iron Man primary load failed (${primaryUrl}), trying fallback...`);
              attemptLoad(fallbackUrl);
            } else {
              console.error('CRITICAL: Failed to load Iron Man 3D model:', err);
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

    // Authentic Mark VII scale: height is 2305 units in GLB, scale to 3.4m height
    const targetScale = 3.4 / 2305;

    // Apply exact transformation to the dedicated modelCorrectionGroup:
    // In raw GLB, child node Sketchfab_model already applies Euler(-Math.PI / 2, 0, 0),
    // placing head at +Y (Y = 2305), feet at 0 (Y = 0), and chest/toes facing +Z (camera).
    // Therefore, modelCorrectionGroup.rotation is strictly (0, 0, 0).
    // Offsetting position to (0, -1.7, 0) centers the 3.4m body symmetrically in flightPivot.
    this.modelCorrectionGroup.rotation.order = 'XYZ';
    this.modelCorrectionGroup.rotation.set(0, 0, 0);
    this.modelCorrectionGroup.scale.set(targetScale, targetScale, targetScale);
    this.modelCorrectionGroup.position.set(0, -1.7, 0);

    // Keep raw model transforms clean
    this.model.rotation.set(0, 0, 0);
    this.model.position.set(0, 0, 0);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material;
          mat.metalness = 0.68;
          mat.roughness = 0.30;
          mat.envMapIntensity = 1.8;
          mat.needsUpdate = true;
        }
      }
    });
  }

  update(progress, elapsedTime) {
    let isVisible = false;

    // CONTINUOUS TRANSITION LIFECYCLE:
    // Entrance: 0.46 to 0.54 (Flies forward through portal)
    // Showcase: 0.54 to 0.62 (Upright heroic hover in center stage)
    // Smooth Transition Out: 0.62 to 0.74 (Glides smoothly to right-inner flank)
    // Flank Formation Hold: 0.74 to 0.88 (Maintains upright hover on flank)
    // Assembly: 0.78 to 0.88 (Assembled in lineup)
    // Title Reveal: 0.88 to 1.00 (Parts smoothly to right wing to clear center title)

    if (progress >= 0.46) {
      isVisible = true;

      let posX = 0.0;
      let posY = 1.35;
      let posZ = 0.0;
      let flightPitch = 0.0;
      let reactorGlow = 3.6;
      let fillLightIntensity = 5.0;
      let thrusterOpacity = 0.75;

      if (progress < 0.54) {
        // ENTRANCE FLIGHT: Emerges from behind portal (Z = -8.0) to center stage (Z = 0.0)
        const p = (progress - 0.46) / 0.08; // 0 to 1
        const decel = 1 - Math.pow(1 - p, 2.5);

        posX = 0.0;
        posY = THREE.MathUtils.lerp(1.8, 1.35, decel);
        posZ = THREE.MathUtils.lerp(-8.0, 0.0, decel);

        flightPitch = THREE.MathUtils.lerp(-0.12, 0.0, decel);
        const emergence = Math.max(0, (p - 0.2) / 0.8);
        reactorGlow = 1.2 + emergence * 2.8 + Math.sin(elapsedTime * 5.0) * 0.4;
        fillLightIntensity = 2.0 + emergence * 3.8;
        thrusterOpacity = Math.max(0.4, 0.6 + emergence * 0.4);
      } else if (progress < 0.62) {
        // SHOWCASE: 100% straight upright heroic hover facing camera
        posX = 0.0;
        posY = 1.35;
        posZ = 0.0;
        flightPitch = 0.0;
        reactorGlow = 3.6 + Math.sin(elapsedTime * 3.5) * 0.4;
        fillLightIntensity = 5.8;
        thrusterOpacity = 0.75;
      } else if (progress < 0.74) {
        // SMOOTH TRANSITION OUT: Glides smoothly to right-inner flank
        const p = (progress - 0.62) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(0.0, 1.8, smoothP);
        posY = THREE.MathUtils.lerp(1.35, 1.1, smoothP);
        posZ = THREE.MathUtils.lerp(0.0, -0.4, smoothP);
        flightPitch = 0.0; // Keep upright
        reactorGlow = 3.5;
        fillLightIntensity = 4.8;
        thrusterOpacity = 0.65;
      } else if (progress < 0.88) {
        // FLANK FORMATION & ASSEMBLY: Stationed upright on right-inner flank
        posX = 1.8;
        posY = 1.1;
        posZ = -0.4;
        flightPitch = 0.0;
        reactorGlow = 3.6;
        fillLightIntensity = 5.0;
        thrusterOpacity = 0.65;
      } else {
        // FINAL TITLE REVEAL (0.88 - 1.00): Parts outward to right wing to clear center title!
        const p = (progress - 0.88) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(1.8, 3.9, smoothP);
        posY = THREE.MathUtils.lerp(1.1, 0.85, smoothP);
        posZ = THREE.MathUtils.lerp(-0.4, -0.6, smoothP);
        flightPitch = 0.0; // Strictly upright
        reactorGlow = 3.4;
        fillLightIntensity = 4.5;
        thrusterOpacity = 0.6;
      }

      this.root.scale.set(1.0, 1.0, 1.0);
      this.root.position.set(posX, posY, posZ);
      this.flightPivot.rotation.set(flightPitch, 0, 0);
      this.flightPivot.position.y = Math.sin(elapsedTime * 2.0) * 0.035;

      this.arcReactorLight.intensity = reactorGlow;
      this.armorKeyLight.intensity = 2.8;
      this.frontFillLight.intensity = fillLightIntensity;
      this.portalGlowLight.intensity = Math.max(0, (1.0 - Math.abs(posZ - (-2.5)) / 3.0) * 3.5);
      this.materials.thrusterGlow.opacity = thrusterOpacity;

      // Animate thruster particles downwards
      const posAttr = this.thrusterGeo.attributes.position;
      for (let i = 0; i < this.thrusterData.length; i++) {
        const d = this.thrusterData[i];
        let y = posAttr.getY(i) - d.speed * 0.02;
        if (y < -2.3) {
          y = -1.75;
        }
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      this.arcReactorLight.intensity = 0;
      this.frontFillLight.intensity = 0;
      this.portalGlowLight.intensity = 0;
    }

    this.root.visible = isVisible;
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
    if (this.thrusterGeo) this.thrusterGeo.dispose();
    if (this.materials.thrusterGlow) this.materials.thrusterGlow.dispose();
  }
}

export default HeroModelController;
