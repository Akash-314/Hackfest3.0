import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * StarFieldController:
 * Deep black cosmic space with a dense, beautiful field of small crisp stars
 * at multiple depths and subtle faint stardust haze.
 * 
 * Features:
 * - Layer 1: Distant twinkling background stars (dense, subtle)
 * - Layer 2: Mid-depth interstellar stars with soft color temperature (cyan/amber/white)
 * - Layer 3: Foreground crisp stardust with gentle parallax
 * - NO giant planets, NO random rocks, NO oversized rings
 */
export class StarFieldController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'DeepSpace_StarField_Root';
    this.isMobile = isMobile;

    this.layer1 = null;
    this.layer2 = null;
    this.layer3 = null;
    this.layer3Data = [];

    this.init();
  }

  init() {
    const glowTex = getGlowParticleTexture();

    // -------------------------------------------------------------
    // LAYER 1: Distant Background Stars (Deep Cosmos)
    // -------------------------------------------------------------
    const count1 = this.isMobile ? 1200 : 3000;
    const geo1 = new THREE.BufferGeometry();
    const pos1 = new Float32Array(count1 * 3);
    const col1 = new Float32Array(count1 * 3);

    for (let i = 0; i < count1; i++) {
      // Large sphere radius 40 to 120
      const radius = 40 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos1[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos1[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos1[i * 3 + 2] = radius * Math.cos(phi);

      // Natural star colors: cool white, soft cyan, subtle gold
      const pick = Math.random();
      if (pick < 0.6) {
        col1[i * 3] = 0.9;
        col1[i * 3 + 1] = 0.95;
        col1[i * 3 + 2] = 1.0;
      } else if (pick < 0.85) {
        col1[i * 3] = 0.5;
        col1[i * 3 + 1] = 0.85;
        col1[i * 3 + 2] = 1.0;
      } else {
        col1[i * 3] = 1.0;
        col1[i * 3 + 1] = 0.85;
        col1[i * 3 + 2] = 0.6;
      }
    }

    geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    geo1.setAttribute('color', new THREE.BufferAttribute(col1, 3));

    const mat1 = new THREE.PointsMaterial({
      size: this.isMobile ? 0.12 : 0.15,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.layer1 = new THREE.Points(geo1, mat1);
    this.root.add(this.layer1);

    // -------------------------------------------------------------
    // LAYER 2: Mid-Depth Interstellar Star Clusters
    // -------------------------------------------------------------
    const count2 = this.isMobile ? 600 : 1500;
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(count2 * 3);
    const col2 = new Float32Array(count2 * 3);

    for (let i = 0; i < count2; i++) {
      const radius = 10 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const z = 10 - Math.random() * 60;

      pos2[i * 3] = Math.cos(theta) * radius;
      pos2[i * 3 + 1] = Math.sin(theta) * radius;
      pos2[i * 3 + 2] = z;

      col2[i * 3] = 0.7;
      col2[i * 3 + 1] = 0.88;
      col2[i * 3 + 2] = 1.0;
    }

    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    geo2.setAttribute('color', new THREE.BufferAttribute(col2, 3));

    const mat2 = new THREE.PointsMaterial({
      size: this.isMobile ? 0.16 : 0.2,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.layer2 = new THREE.Points(geo2, mat2);
    this.root.add(this.layer2);

    // -------------------------------------------------------------
    // LAYER 3: Foreground Parallax Stardust (Gentle Depth)
    // -------------------------------------------------------------
    const count3 = this.isMobile ? 120 : 260;
    const geo3 = new THREE.BufferGeometry();
    const pos3 = new Float32Array(count3 * 3);
    const col3 = new Float32Array(count3 * 3);

    for (let i = 0; i < count3; i++) {
      const radius = 2.0 + Math.random() * 8.0;
      const theta = Math.random() * Math.PI * 2;
      const z = 8 - Math.random() * 40;

      pos3[i * 3] = Math.cos(theta) * radius;
      pos3[i * 3 + 1] = Math.sin(theta) * radius;
      pos3[i * 3 + 2] = z;

      col3[i * 3] = 0.85;
      col3[i * 3 + 1] = 0.95;
      col3[i * 3 + 2] = 1.0;

      this.layer3Data.push({
        origRadius: radius,
        origTheta: theta,
        zSpeed: 0.4 + Math.random() * 0.8,
      });
    }

    geo3.setAttribute('position', new THREE.BufferAttribute(pos3, 3));
    geo3.setAttribute('color', new THREE.BufferAttribute(col3, 3));

    const mat3 = new THREE.PointsMaterial({
      size: this.isMobile ? 0.18 : 0.22,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.layer3 = new THREE.Points(geo3, mat3);
    this.root.add(this.layer3);
  }

  update(progress, time) {
    // Subtle axial cosmic drift
    if (this.layer1) {
      this.layer1.rotation.y = time * 0.004;
    }
    if (this.layer2) {
      this.layer2.rotation.y = time * 0.008;
    }

    // Gentle parallax stardust movement
    if (this.layer3) {
      const pos = this.layer3.geometry.attributes.position.array;
      for (let i = 0; i < this.layer3Data.length; i++) {
        const item = this.layer3Data[i];
        pos[i * 3 + 2] += item.zSpeed * 0.04;
        if (pos[i * 3 + 2] > 12) {
          pos[i * 3 + 2] = -32;
        }
      }
      this.layer3.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    if (this.layer1) {
      this.layer1.geometry.dispose();
      this.layer1.material.dispose();
    }
    if (this.layer2) {
      this.layer2.geometry.dispose();
      this.layer2.material.dispose();
    }
    if (this.layer3) {
      this.layer3.geometry.dispose();
      this.layer3.material.dispose();
    }
  }
}

export default StarFieldController;
