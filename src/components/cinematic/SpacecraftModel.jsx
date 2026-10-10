import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGlowParticleTexture } from './particleTexture';

/**
 * SpacecraftModelController:
 * Loads and orchestrates the authentic high-poly Space Fighter 3D model (space_fighter.glb).
 * 
 * Model Verified Dimensions & Coordinates:
 * - Raw geometry: Length ~302 units (Y from -151 to +151), Width ~180 units (X from -90 to +90)
 * - Raw orientation: Nose at -Y, Engines at +Y, Dorsal fin at +Z
 * - Corrected orientation with (-Math.PI / 2, 0, 0):
 *   - Nose points forward (+Z)
 *   - Engines point rearward (-Z)
 *   - Dorsal fin points UP (+Y)
 *   - Wings span left/right (+/-X)
 * - Scale: 0.018 (Length ~5.4m, Wingspan ~3.2m, Height ~1.2m)
 * 
 * Cinematic Trajectory:
 * 1. Deep Space Arrival (0.00 - 0.10): Approaching from upper starfield depth
 * 2. Supersonic Flyby (0.10 - 0.24): Dynamic banking flyby past camera with cyan engine plume
 * 3. Planetary Orbit (0.24 - 0.40): Sweeps toward the distant cosmic planet
 * 4. Escort Vanguard (0.76 - 1.00): Positions in upper starfield formation flanking Iron Man
 */
export class SpacecraftModelController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Spacecraft_Root';
    this.isMobile = isMobile;

    this.model = null;
    this.isLoaded = false;
    this.loadError = null;

    // Flight dynamics pivot (for yaw, pitch, roll banking)
    this.flightPivot = new THREE.Group();
    this.flightPivot.name = 'Spacecraft_FlightPivot';
    this.root.add(this.flightPivot);

    // Static dedicated model correction group (strictly decoupled from animation)
    this.modelCorrectionGroup = new THREE.Group();
    this.modelCorrectionGroup.name = 'Spacecraft_CorrectionGroup';
    this.flightPivot.add(this.modelCorrectionGroup);

    // Engine lighting & particle thrusters
    this.engineLeftLight = null;
    this.engineRightLight = null;
    this.hullRimLight = null;
    this.thrusterParticles = null;
    this.thrusterGeo = null;
    this.thrusterData = [];

    this.materials = {
      thruster: null,
    };

    this.initThrusterEffects();
  }

  initThrusterEffects() {
    const glowTex = getGlowParticleTexture();

    // Dual cyan engine exhaust point lights
    this.engineLeftLight = new THREE.PointLight(0x00d8ff, 0, 14);
    this.engineLeftLight.position.set(-0.42, 0.0, -2.8);
    this.flightPivot.add(this.engineLeftLight);

    this.engineRightLight = new THREE.PointLight(0x00d8ff, 0, 14);
    this.engineRightLight.position.set(0.42, 0.0, -2.8);
    this.flightPivot.add(this.engineRightLight);

    // Subtle blue hull rim light
    this.hullRimLight = new THREE.PointLight(0x38bdf8, 0, 16);
    this.hullRimLight.position.set(0, 1.2, 0);
    this.flightPivot.add(this.hullRimLight);

    // Engine exhaust particle trail
    const particleCount = this.isMobile ? 32 : 64;
    this.thrusterGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    this.thrusterData = [];

    for (let i = 0; i < particleCount; i++) {
      const isLeft = i % 2 === 0;
      const engX = isLeft ? -0.42 : 0.42;
      pos[i * 3] = engX + (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 2] = -2.75 - Math.random() * 1.5;

      // Cyan to electric blue core
      const isCore = Math.random() > 0.4;
      col[i * 3] = isCore ? 0.2 : 0.0;
      col[i * 3 + 1] = isCore ? 0.9 : 0.6;
      col[i * 3 + 2] = 1.0;

      this.thrusterData.push({
        engX,
        z: pos[i * 3 + 2],
        speed: 4.0 + Math.random() * 4.5,
      });
    }

    this.thrusterGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.thrusterGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    this.materials.thruster = new THREE.PointsMaterial({
      size: 0.24,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.thrusterParticles = new THREE.Points(this.thrusterGeo, this.materials.thruster);
    this.flightPivot.add(this.thrusterParticles);

    this.root.visible = false;
  }

  async load(onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const modelUrl = '/models/space_fighter.glb';

      loader.load(
        modelUrl,
        (gltf) => {
          this.model = gltf.scene;
          this.model.name = 'SpaceFighter_Model';

          this.setupModel();
          this.modelCorrectionGroup.add(this.model);
          this.isLoaded = true;
          this.loadError = null;
          console.log(`Spacecraft: Authentic 3D Space Fighter loaded successfully from ${modelUrl}.`);

          onProgress(100);
          resolve(this.root);
        },
        (xhr) => {
          if (xhr.total > 0) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.error('CRITICAL: Failed to load space_fighter.glb:', err);
          this.loadError = err;
          this.isLoaded = false;
          reject(err);
        }
      );
    });
  }

  setupModel() {
    if (!this.model) return;

    // Apply exact static transformation to modelCorrectionGroup:
    // Model raw: Nose at -Y, Engines at +Y, Dorsal fin at +Z
    // Rotation (-Math.PI / 2, 0, 0) maps:
    // Nose -> +Z (forward)
    // Engines -> -Z (rearward)
    // Dorsal fin -> +Y (up)
    // Wings -> +/-X
    const targetScale = 0.013;
    this.modelCorrectionGroup.rotation.order = 'XYZ';
    this.modelCorrectionGroup.rotation.set(-Math.PI / 2, 0, 0);
    this.modelCorrectionGroup.scale.set(targetScale, targetScale, targetScale);
    this.modelCorrectionGroup.position.set(0, 0, 0);

    // Enhance metallic spacecraft hull materials
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material;
          mat.metalness = 0.72;
          mat.roughness = 0.28;
          mat.envMapIntensity = 1.6;
          mat.needsUpdate = true;
        }
      }
    });
  }

  update(progress, elapsedTime) {
    let isVisible = false;

    // CONTINUOUS TRANSITION LIFECYCLE:
    // Scene 2 Flyby: 0.10 to 0.22 (Supersonic banking flyby past camera)
    // Smooth Transition Out: 0.22 to 0.32 (Arcs up into high celestial patrol orbit)
    // High Celestial Patrol: 0.32 to 0.72 (Maintains high-altitude distant orbit)
    // Scene 7 Tactical Sweep: 0.72 to 0.80 (Sweeps across cosmos into vanguard escort)
    // Assembly & Title Reveal: 0.80 to 1.00 (High-altitude vanguard escort)

    if (progress >= 0.10) {
      isVisible = true;

      let posX = 1.5;
      let posY = 0.8;
      let posZ = 4.5;
      let rollAngle = 0.0;
      let pitchAngle = 0.06;
      let yawAngle = -0.15;
      let enginePower = 2.0;

      if (progress < 0.22) {
        // SCENE 2 FLYBY (0.10 - 0.22): Swoops in from upper right
        const p = (progress - 0.10) / 0.12; // 0 to 1
        const smoothP = Math.pow(p, 1.25);

        posX = THREE.MathUtils.lerp(5.0, 1.5, smoothP);
        posY = THREE.MathUtils.lerp(2.4, 0.8, smoothP) + Math.sin(elapsedTime * 2.0) * 0.04;
        posZ = THREE.MathUtils.lerp(-14.0, 4.5, smoothP);

        rollAngle = -0.32 * Math.sin(p * Math.PI);
        pitchAngle = 0.06;
        yawAngle = -0.15;
        enginePower = 2.5 + Math.sin(elapsedTime * 8.0) * 0.5 + p * 2.0;
      } else if (progress < 0.32) {
        // SMOOTH TRANSITION OUT (0.22 - 0.32): Arcs upward into high celestial orbit
        const p = (progress - 0.22) / 0.10; // 0 to 1
        const smoothP = Math.sin((p * Math.PI) / 2);

        posX = THREE.MathUtils.lerp(1.5, -3.8, smoothP);
        posY = THREE.MathUtils.lerp(0.8, 3.0, smoothP) + Math.sin(elapsedTime * 1.8) * 0.03;
        posZ = THREE.MathUtils.lerp(4.5, -5.0, smoothP);

        rollAngle = THREE.MathUtils.lerp(-0.1, 0.15, smoothP);
        pitchAngle = THREE.MathUtils.lerp(0.06, 0.02, smoothP);
        yawAngle = THREE.MathUtils.lerp(-0.15, 0.22, smoothP);
        enginePower = THREE.MathUtils.lerp(4.5, 2.0, smoothP);
      } else if (progress < 0.72) {
        // HIGH CELESTIAL PATROL (0.32 - 0.72): Holds high perimeter escort
        posX = -3.8;
        posY = 3.0 + Math.sin(elapsedTime * 1.5) * 0.04;
        posZ = -5.0;
        rollAngle = 0.0;
        pitchAngle = 0.02;
        yawAngle = 0.22;
        enginePower = 2.0;
      } else if (progress < 0.80) {
        // SCENE 7 TACTICAL SWEEP (0.72 - 0.80): Sweeps across cosmos into vanguard escort
        const p = (progress - 0.72) / 0.08; // 0 to 1
        const smoothP = p * p * (3 - 2 * p);

        posX = THREE.MathUtils.lerp(4.0, -3.8, smoothP);
        posY = THREE.MathUtils.lerp(3.2, 2.8, smoothP) + Math.sin(elapsedTime * 1.5) * 0.03;
        posZ = THREE.MathUtils.lerp(-7.0, -3.5, smoothP);

        rollAngle = 0.22 * Math.sin(p * Math.PI);
        pitchAngle = 0.02;
        yawAngle = 0.22;
        enginePower = 2.4;
      } else {
        // SCENE 8 & 9 ASSEMBLED ESCORT (0.80 - 1.00): Stations high at (-3.8, 2.8, -3.5)
        const bobY = Math.sin(elapsedTime * 1.6 + 0.5) * 0.04;
        posX = -3.8;
        posY = 2.8 + bobY;
        posZ = -3.5;
        rollAngle = -0.04;
        pitchAngle = 0.02;
        yawAngle = 0.22;
        enginePower = 2.4;
      }

      this.root.position.set(posX, posY, posZ);
      this.flightPivot.rotation.set(pitchAngle, yawAngle, rollAngle);

      this.engineLeftLight.intensity = enginePower;
      this.engineRightLight.intensity = enginePower;
      this.hullRimLight.intensity = 1.3;

      this.materials.thruster.opacity = 0.75;
      const posAttr = this.thrusterGeo.attributes.position;
      for (let i = 0; i < this.thrusterData.length; i++) {
        const d = this.thrusterData[i];
        let z = posAttr.getZ(i) - d.speed * 0.025;
        if (z < -4.8) {
          z = -2.75 - Math.random() * 0.3;
        }
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      this.engineLeftLight.intensity = 0;
      this.engineRightLight.intensity = 0;
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
    if (this.materials.thruster) this.materials.thruster.dispose();
  }
}

export default SpacecraftModelController;
