import * as THREE from 'three';

export class EnergyCoreController {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Energy_Core_FX';
    this.rings = [];
    this.sparkPoints = null;
    this.shockwave = null;
    this.init();
  }

  init() {
    // 1. Triple Holographic Energy Rings
    const ringRadii = [0.45, 0.75, 1.1];
    ringRadii.forEach((radius, idx) => {
      const geo = new THREE.TorusGeometry(radius, 0.02, 16, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00bfff : 0x00ffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.set(0, 1.95, 0.5);
      this.rings.push(ring);
      this.root.add(ring);
    });

    // 2. Swirling Spark Cloud around reactor
    const sparkCount = 200;
    const sparkGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(sparkCount * 3);
    const col = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.random() * 0.8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 1.95 + (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = 0.5 + Math.sin(angle) * r;

      col[i * 3] = 0.0;
      col[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      col[i * 3 + 2] = 1.0;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    this.root.add(this.sparkPoints);

    // 3. Launch Shockwave Ring
    const shockGeo = new THREE.RingGeometry(0.3, 0.45, 48);
    shockGeo.rotateX(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    this.shockwave = new THREE.Mesh(shockGeo, shockMat);
    this.shockwave.position.set(0, 0.2, 0);
    this.root.add(this.shockwave);
  }

  update(progress, time) {
    if (!this.root) return;

    // Rings rotation
    this.rings.forEach((ring, idx) => {
      const dir = idx % 2 === 0 ? 1 : -1;
      const speed = (idx + 1) * 1.5;
      ring.rotation.x = time * speed * dir * 0.5;
      ring.rotation.y = time * speed * dir;

      if (progress < 0.15) {
        ring.material.opacity = (progress / 0.15) * 0.5;
        ring.scale.setScalar(0.7 + (progress / 0.15) * 0.3);
      } else if (progress < 0.6) {
        ring.material.opacity = 0.7 + Math.sin(time * 8.0) * 0.25;
        ring.scale.setScalar(1.0 + Math.sin(time * 3.0) * 0.1);
      } else {
        const fade = Math.max(0, 1 - (progress - 0.6) / 0.25);
        ring.material.opacity = fade * 0.7;
        ring.scale.setScalar(1 + (progress - 0.6) * 3);
      }
    });

    // Spark rotation
    if (this.sparkPoints) {
      this.sparkPoints.rotation.y = time * 2.0;
      this.sparkPoints.rotation.x = Math.sin(time) * 0.3;
      if (progress < 0.15) {
        this.sparkPoints.material.opacity = (progress / 0.15) * 0.6;
      } else if (progress > 0.65) {
        this.sparkPoints.material.opacity = Math.max(0, 1 - (progress - 0.65) / 0.2);
      } else {
        this.sparkPoints.material.opacity = 0.85;
      }
    }

    // Launch shockwave trigger around 55% - 70%
    if (this.shockwave) {
      if (progress >= 0.52 && progress <= 0.72) {
        const p = (progress - 0.52) / 0.2;
        this.shockwave.visible = true;
        this.shockwave.scale.setScalar(1 + p * 15);
        this.shockwave.material.opacity = (1 - p) * 0.85;
        this.shockwave.position.y = 0.2 - p * 0.8;
      } else {
        this.shockwave.visible = false;
      }
    }
  }

  dispose() {
    this.rings.forEach((r) => {
      r.geometry.dispose();
      r.material.dispose();
    });
    if (this.sparkPoints) {
      this.sparkPoints.geometry.dispose();
      this.sparkPoints.material.dispose();
    }
    if (this.shockwave) {
      this.shockwave.geometry.dispose();
      this.shockwave.material.dispose();
    }
  }
}

export default EnergyCoreController;
