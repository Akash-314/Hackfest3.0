import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGlowParticleTexture } from './particleTexture';

/**
 * SpiderManModelController:
 * Loads and renders the authentic The Amazing Spider-Man 2 3D model (spiderman.glb).
 * 
 * Features:
 * - Real GLB loaded from /models/spiderman/spiderman.glb
 * - Authentic Amazing Spider-Man web suit textures and normal maps
 * - Real skeletal AnimationMixer playing authentic 'Spidey' animation clip
 * - Correct orientation (Z-rot 90deg, scale 1.75) for head Y=3.37m, feet Y=0.0m
 * - Dramatic cobalt-blue and crimson rim lighting
 * - Subtle web sparkle particles
 * - Fully visible in Scene 6 and Scene 7 (Superhero Assembly)
 */
export class SpiderManModelController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'SpiderMan_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.mixer = null;
    this.activeAction = null;
    this.isLoaded = false;
    this.loadError = null;
    this.lastTime = 0;

    // Character pivot
    this.characterPivot = new THREE.Group();
    this.characterPivot.name = 'SpiderMan_Pivot';
    this.root.add(this.characterPivot);

    // Dynamic lights & emitters
    this.blueLight = null;
    this.redLight = null;
    this.frontLight = null;
    this.webParticles = null;
    this.webGeo = null;
    this.webData = [];

    this.materials = {
      webGlow: null,
    };

    this.initEffects();
  }

  initEffects() {
    const glowTex = getGlowParticleTexture();

    // 1. Cobalt blue rim & crimson key light
    this.blueLight = new THREE.PointLight(0x2277ff, 0, 20);
    this.blueLight.position.set(-1.0, 2.2, 1.2);
    this.characterPivot.add(this.blueLight);

    this.redLight = new THREE.PointLight(0xff2244, 0, 18);
    this.redLight.position.set(1.0, 2.2, -1.2);
    this.characterPivot.add(this.redLight);

    this.frontLight = new THREE.PointLight(0x77bbee, 0, 16);
    this.frontLight.position.set(0.0, 2.0, 1.8);
    this.characterPivot.add(this.frontLight);

    // 2. Subtle Web Sparkle Particles (small, controlled)
    const count = this.isMobile ? 16 : 32;
    this.webGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this.webData = [];

    for (let i = 0; i < count; i++) {
      const radius = 0.3 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0.6 + Math.random() * 2.0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      col[i * 3] = 0.8;
      col[i * 3 + 1] = 0.95;
      col[i * 3 + 2] = 1.0;

      this.webData.push({
        baseX: pos[i * 3],
        baseY: pos[i * 3 + 1],
        baseZ: pos[i * 3 + 2],
        speed: 1.2 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.webGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.webGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    this.materials.webGlow = new THREE.PointsMaterial({
      size: 0.12,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.webParticles = new THREE.Points(this.webGeo, this.materials.webGlow);
    this.characterPivot.add(this.webParticles);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const primaryUrl = '/models/spiderman/spiderman.glb';
      const fallbackUrl = '/models/hero/doom/the_amazing_spider_man_2_rigged_model.glb';

      const attemptLoad = (url) => {
        loader.load(
          url,
          (gltf) => {
            this.model = gltf.scene;
            this.model.name = 'SpiderMan_Model';

            // Set up AnimationMixer with real 'Spidey' animation clip
            if (gltf.animations && gltf.animations.length > 0) {
              this.mixer = new THREE.AnimationMixer(this.model);
              const clip =
                gltf.animations.find((a) => a.name.toLowerCase().includes('spid')) ||
                gltf.animations[0];

              if (clip) {
                this.activeAction = this.mixer.clipAction(clip);
                this.activeAction.play();
                console.log(`Spider-Man: Playing authentic animation clip '${clip.name}'.`);
              }
            }

            this.setupModel();
            this.characterPivot.add(this.model);
            this.isLoaded = true;
            this.loadError = null;
            console.log(`Spider-Man: Authentic 3D model loaded successfully from ${url}.`);

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
              console.warn(`Spider-Man primary load failed (${primaryUrl}), trying fallback...`);
              attemptLoad(fallbackUrl);
            } else {
              console.error('CRITICAL: Failed to load Spider-Man 3D model:', err);
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

    // Scale to ~1.25 for balanced heroic proportions with Doom & Iron Man
    const targetScale = 1.25;
    this.model.scale.set(targetScale, targetScale, targetScale);

    // Spider-Man model is exported oriented along X axis.
    // Rotate +90deg around Z so head points UP (+Y) and feet point DOWN (-Y).
    // Center position offset without horizontal shift
    this.model.rotation.set(0, 0, Math.PI / 2);
    this.model.position.set(0.0, 1.35, 0);

    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material;
          mat.roughness = Math.min(mat.roughness ?? 0.45, 0.4);
          mat.metalness = Math.max(mat.metalness ?? 0.3, 0.35);
          mat.envMapIntensity = 1.4;
          mat.needsUpdate = true;
        }
      }
    });
  }

  update(progress, elapsedTime) {
    const delta = this.lastTime > 0 ? Math.min(elapsedTime - this.lastTime, 0.1) : 0.016;
    this.lastTime = elapsedTime;

    if (this.mixer) {
      this.mixer.update(delta);
    }

    // CONTINUOUS TRANSITION LIFECYCLE:
    // Entrance: 0.58 to 0.64 (Swings/glides into center stage)
    // Showcase: 0.64 to 0.72 (Acrobatic center stage showcase)
    // Smooth Transition Out: 0.72 to 0.80 (Glides smoothly to left flank)
    // Flank Formation Hold & Assembly: 0.80 to 0.88 (Assembled on left flank)
    // Title Reveal: 0.88 to 1.00 (Parts smoothly to far-left wing to clear center title)

    let isVisible = false;
    if (progress >= 0.58) {
      isVisible = true;

      let posX = 0.0;
      let posY = 0.7;
      let posZ = 0.6;
      let rotY = 0.0;
      let scale = 1.0;
      let lightScale = 1.0;

      if (progress < 0.64) {
        // ENTRANCE (0.58 - 0.64): Swings in from upper-left
        const p = (progress - 0.58) / 0.06; // 0 to 1
        const smoothP = 1 - Math.pow(1 - p, 2.5);

        posX = THREE.MathUtils.lerp(-4.2, 0.0, smoothP);
        posY = THREE.MathUtils.lerp(1.8, 0.7, smoothP) + Math.sin(elapsedTime * 2.2) * 0.04;
        posZ = THREE.MathUtils.lerp(-2.0, 0.6, smoothP);
        scale = THREE.MathUtils.lerp(0.4, 1.0, smoothP);
        rotY = Math.sin(elapsedTime * 1.2) * 0.08;
        lightScale = smoothP;
      } else if (progress < 0.72) {
        // SHOWCASE (0.64 - 0.72): Center stage acrobatic showcase
        posX = 0.0;
        posY = 0.7 + Math.sin(elapsedTime * 2.2) * 0.04;
        posZ = 0.6;
        scale = 1.0;
        rotY = Math.sin(elapsedTime * 1.2) * 0.08;
        lightScale = 1.0;
      } else if (progress < 0.80) {
        // SMOOTH TRANSITION OUT (0.72 - 0.80): Glides smoothly to left flank
        const p = (progress - 0.72) / 0.08; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(0.0, -2.8, smoothP);
        posY = THREE.MathUtils.lerp(0.7, 0.1, smoothP) + Math.sin(elapsedTime * 1.8) * 0.03;
        posZ = THREE.MathUtils.lerp(0.6, -0.5, smoothP);
        scale = THREE.MathUtils.lerp(1.0, 0.95, smoothP);
        rotY = THREE.MathUtils.lerp(0.0, 0.25, smoothP);
        lightScale = THREE.MathUtils.lerp(1.0, 0.8, smoothP);
      } else if (progress < 0.88) {
        // FLANK FORMATION & ASSEMBLY (0.80 - 0.88): Left flank in squad formation
        posX = -2.8;
        posY = 0.1 + Math.sin(elapsedTime * 1.8 + 0.5) * 0.03;
        posZ = -0.5;
        scale = 0.95;
        rotY = 0.25;
        lightScale = 0.8;
      } else {
        // FINAL TITLE REVEAL (0.88 - 1.00): Parts outward to far-left wing to clear center title!
        const p = (progress - 0.88) / 0.12; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(-2.8, -5.4, smoothP);
        posY = THREE.MathUtils.lerp(0.1, 0.0, smoothP) + Math.sin(elapsedTime * 1.6 + 0.5) * 0.03;
        posZ = THREE.MathUtils.lerp(-0.5, -0.8, smoothP);
        scale = 0.85;
        rotY = THREE.MathUtils.lerp(0.25, 0.35, smoothP);
        lightScale = 0.75;
      }

      this.root.position.set(posX, posY, posZ);
      this.root.scale.set(scale, scale, scale);
      this.characterPivot.rotation.set(0, rotY, 0);

      this.blueLight.intensity = 4.0 * lightScale;
      this.redLight.intensity = 3.0 * lightScale;
      this.frontLight.intensity = 2.2 * lightScale;
      this.materials.webGlow.opacity = 0.6 * lightScale;
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      this.blueLight.intensity = 0;
      this.redLight.intensity = 0;
      this.frontLight.intensity = 0;
    }

    this.root.visible = isVisible;

    // Animate web sparkles
    if (isVisible && this.webGeo) {
      const posAttr = this.webGeo.attributes.position;
      for (let i = 0; i < this.webData.length; i++) {
        const d = this.webData[i];
        const t = elapsedTime * d.speed + d.phase;
        posAttr.setY(i, d.baseY + Math.sin(t) * 0.15);
      }
      posAttr.needsUpdate = true;
    }
  }

  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
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
    if (this.webGeo) this.webGeo.dispose();
    if (this.materials.webGlow) this.materials.webGlow.dispose();
  }
}

export default SpiderManModelController;
