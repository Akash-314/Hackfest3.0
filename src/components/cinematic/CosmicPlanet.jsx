import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * CosmicPlanetController:
 * Loads and animates the authentic cosmic planet model (the_universe.glb).
 *
 * Requirements Met:
 * - Real GLB loaded from /models/the_universe.glb
 * - Orbital rings (Mat_Aro) stripped out to eliminate clutter/oversized rings
 * - Pure, majestic 3D rotating planetary sphere with atmospheric rim halo
 * - Cyan & deep blue atmospheric rim illumination
 * - Stars at different depths and subtle cosmic dust particles
 * - Slow continuous rotation and gradual camera flyby
 * - Positioned in deep space so it is visible through the Doctor Strange portal gateway!
 */
export class CosmicPlanetController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'CosmicPlanet_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.mixer = null;
    this.isLoaded = false;
    this.loadError = null;
    this.lastTime = 0;

    // Atmospheric rim light (cyan-blue)
    this.rimLight = null;
    this.atmosphereHalo = null;
    this.cosmicDust = null;

    this.initAtmosphere();
  }

  initAtmosphere() {
    // 1. Planetary cyan-blue rim light
    this.rimLight = new THREE.PointLight(0x00c8ff, 0, 35);
    this.rimLight.position.set(4, 3, 2);
    this.root.add(this.rimLight);

    // 2. Atmospheric glow halo shell
    const haloGeo = new THREE.SphereGeometry(2.35, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00aaff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          // Fresnel rim glow
          float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
          gl_FragColor = vec4(glowColor, intensity * 0.45);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.atmosphereHalo = new THREE.Mesh(haloGeo, haloMat);
    this.root.add(this.atmosphereHalo);

    // 3. Subtle cosmic dust particles drifting near planet
    const dustCount = this.isMobile ? 30 : 70;
    const dustGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x44bbff,
      size: 0.12,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cosmicDust = new THREE.Points(dustGeo, dustMat);
    this.root.add(this.cosmicDust);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      const modelUrl = '/models/the_universe.glb';

      loader.load(
        modelUrl,
        (gltf) => {
          this.model = gltf.scene;
          this.model.name = 'CosmicPlanet_Model';

          // Play real GLB animation clip if available
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
            const clip = gltf.animations[0];
            const action = this.mixer.clipAction(clip);
            action.play();
          }

          // Scale and clean geometry:
          // STRIP OUT UNWANTED ORBITAL RINGS ('Aro' meshes) to avoid clutter
          this.model.traverse((child) => {
            const name = child.name || '';
            const matName = child.material?.name || '';
            if (name.includes('Aro') || matName.includes('Aro')) {
              child.visible = false; // Hide oversized rings completely
            } else if (child.isMesh && child.material) {
              const mat = child.material;
              mat.roughness = Math.min(mat.roughness ?? 0.5, 0.4);
              mat.metalness = 0.2;
              mat.envMapIntensity = 1.5;
              mat.needsUpdate = true;
            }
          });

          // Scale to clean planetary sphere proportions
          const scale = 0.022;
          this.model.scale.set(scale, scale, scale);
          this.root.add(this.model);

          this.isLoaded = true;
          this.loadError = null;
          console.log('Cosmic Planet: Clean 3D planet model loaded successfully (rings filtered).');

          onProgress(100);
          resolve(this.root);
        },
        (xhr) => {
          if (xhr.total > 0) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.warn('Cosmic Planet load fallback:', err);
          this.loadError = err;
          this.isLoaded = false;
          resolve(this.root);
        }
      );
    });
  }

  update(progress, elapsedTime) {
    const delta = this.lastTime > 0 ? Math.min(elapsedTime - this.lastTime, 0.1) : 0.016;
    this.lastTime = elapsedTime;

    // Slow, realistic celestial axial rotation
    if (this.mixer) {
      this.mixer.update(delta * 0.5);
    }
    if (this.model) {
      this.model.rotation.y += 0.0018;
      this.model.rotation.z += 0.0006;
    }
    if (this.cosmicDust) {
      this.cosmicDust.rotation.y = elapsedTime * 0.02;
    }

    let isVisible = false;

    // -------------------------------------------------------------
    // SCENE 1 & 2: DEEP COSMIC SPACE & PLANETARY FLYBY (0.00 - 0.28)
    // -------------------------------------------------------------
    if (progress < 0.28) {
      isVisible = true;
      const p = Math.min(1, Math.max(0, (progress - 0.04) / 0.24));

      // Gradual camera flyby around planet: drifts from right to center-back
      const posX = THREE.MathUtils.lerp(3.2, 1.5, p);
      const posY = THREE.MathUtils.lerp(1.2, 0.9, p);
      const posZ = THREE.MathUtils.lerp(-16.0, -12.0, p);
      this.root.position.set(posX, posY, posZ);

      // Atmospheric rim light intensity
      this.rimLight.intensity = Math.sin(p * Math.PI) * 4.0;
    }
    // -------------------------------------------------------------
    // SCENE 3 - 7: VISIBLE IN DEEP BACKGROUND THROUGH PORTAL (0.28 - 1.00)
    // -------------------------------------------------------------
    else {
      isVisible = true;
      // Positioned centered deep in the background at Z = -22.0
      // Right in line with the Doctor Strange portal opening at (0, 1.6, -2.5)
      this.root.position.set(0.0, 1.8, -22.0);
      this.rimLight.intensity = 3.2;
    }

    this.root.visible = isVisible;
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
    if (this.cosmicDust) {
      if (this.cosmicDust.geometry) this.cosmicDust.geometry.dispose();
      if (this.cosmicDust.material) this.cosmicDust.material.dispose();
    }
  }
}

export default CosmicPlanetController;
