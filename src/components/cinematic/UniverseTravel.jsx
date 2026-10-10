import * as THREE from 'three';

/**
 * UniverseTravelController:
 * Hyperspace Warp Speed light streaks.
 * Surges rapidly between scroll 0.56 and 0.74, then decelerates into slow motion
 * to reveal the massive Black Hole and rotating Galaxy.
 */
export class UniverseTravelController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Warp_Speed_Travel_FX';
    this.isMobile = isMobile;
    this.warpStreaks = null;
    this.init();
  }

  init() {
    // Warp speed light streak lines
    const streakCount = this.isMobile ? 140 : 420;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(streakCount * 6); // 2 vertices per line (start & end)
    const colors = new Float32Array(streakCount * 6);

    for (let i = 0; i < streakCount; i++) {
      const radius = 1.5 + Math.random() * 26;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -10 - Math.random() * 85;
      const length = 5 + Math.random() * 18;

      // Start vertex (head)
      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      // End vertex (tail)
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z - length;

      // Color (cyan to stark blue/gold/crimson)
      const choice = Math.random();
      const r = choice > 0.65 ? 1.0 : 0.0;
      const g = choice > 0.65 ? 0.75 : 0.85;
      const b = 1.0;

      colors[i * 6] = r;
      colors[i * 6 + 1] = g;
      colors[i * 6 + 2] = b;

      colors[i * 6 + 3] = r * 0.15;
      colors[i * 6 + 4] = g * 0.15;
      colors[i * 6 + 5] = b * 0.15;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      linewidth: 1.5,
    });

    this.warpStreaks = new THREE.LineSegments(geo, mat);
    this.root.add(this.warpStreaks);
  }

  update(progress) {
    if (!this.warpStreaks) return;

    // Active during universe travel warp jump: 0.12 -> 0.22
    if (progress >= 0.12 && progress <= 0.22) {
      const p = (progress - 0.12) / (0.22 - 0.12);
      // Bell curve opacity that peaks at mid-warp
      const opacity = Math.sin(p * Math.PI) * 0.95;
      this.warpStreaks.material.opacity = opacity;

      // High velocity rush toward camera
      const pos = this.warpStreaks.geometry.attributes.position.array;
      const speed = 3.5 + Math.sin(p * Math.PI) * 8.5;

      for (let i = 0; i < pos.length / 6; i++) {
        pos[i * 6 + 2] += speed;
        pos[i * 6 + 5] += speed;

        if (pos[i * 6 + 2] > 25) {
          const resetZ = -80 - Math.random() * 30;
          const len = 5 + Math.random() * 18;
          pos[i * 6 + 2] = resetZ;
          pos[i * 6 + 5] = resetZ - len;
        }
      }
      this.warpStreaks.geometry.attributes.position.needsUpdate = true;
    } else {
      this.warpStreaks.material.opacity = 0;
    }
  }

  dispose() {
    if (this.warpStreaks) {
      this.warpStreaks.geometry.dispose();
      this.warpStreaks.material.dispose();
    }
  }
}

export default UniverseTravelController;
