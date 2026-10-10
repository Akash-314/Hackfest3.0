import * as THREE from 'three';

/**
 * MultiversePortalController:
 * Doctor Strange / Multiverse cosmic portal with counter-rotating energy rings,
 * spark accretion disk, runic segments, and cosmic event horizon void.
 */
export class MultiversePortalController {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Multiverse_Portal_Root';
    this.root.position.set(0, 0, -48); // Set deep in distance

    this.outerTorus = null;
    this.innerTorus = null;
    this.coreTorus = null;
    this.voidDisc = null;
    this.sparks = null;
    this.sparkGeo = null;
    this.sparkPositions = null;
    this.sparkRadii = null;
    this.sparkAngles = null;
    this.sparkSpeeds = null;
    this.sparkCount = 1800;
    this.portalLight = null;

    this.init();
  }

  init() {
    // Ring 1: Outer Eldritch Gold Ring
    const outerGeo = new THREE.TorusGeometry(7.5, 0.22, 16, 100);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xff7b00,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.outerTorus = new THREE.Mesh(outerGeo, outerMat);
    this.root.add(this.outerTorus);

    // Ring 2: Inner Crimson Ring
    const innerGeo = new THREE.TorusGeometry(5.8, 0.16, 16, 72);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.innerTorus = new THREE.Mesh(innerGeo, innerMat);
    this.root.add(this.innerTorus);

    // Ring 3: Core Multiverse Cyan Ring
    const coreGeo = new THREE.TorusGeometry(4.2, 0.12, 16, 60);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.coreTorus = new THREE.Mesh(coreGeo, coreMat);
    this.root.add(this.coreTorus);

    // Event Horizon Void Disc
    const discGeo = new THREE.CircleGeometry(5.7, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x010208,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.voidDisc = new THREE.Mesh(discGeo, discMat);
    this.voidDisc.position.z = -0.05;
    this.root.add(this.voidDisc);

    // Spark Accretion Disk (Doctor Strange style embers)
    this.sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(this.sparkCount * 3);
    const sparkColors = new Float32Array(this.sparkCount * 3);
    this.sparkRadii = new Float32Array(this.sparkCount);
    this.sparkSpeeds = new Float32Array(this.sparkCount);
    this.sparkAngles = new Float32Array(this.sparkCount);

    const cGold = new THREE.Color(0xffa834);
    const cFire = new THREE.Color(0xff4500);
    const cCyan = new THREE.Color(0x00f3ff);

    for (let i = 0; i < this.sparkCount; i++) {
      const r = 4.2 + Math.random() * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const zScatter = (Math.random() - 0.5) * 1.5;

      this.sparkPositions[i * 3] = Math.cos(theta) * r;
      this.sparkPositions[i * 3 + 1] = Math.sin(theta) * r;
      this.sparkPositions[i * 3 + 2] = zScatter;

      this.sparkRadii[i] = r;
      this.sparkAngles[i] = theta;
      this.sparkSpeeds[i] = 1.5 + Math.random() * 2.5;

      const pick = Math.random();
      const c = pick < 0.65 ? cGold : pick < 0.88 ? cFire : cCyan;
      sparkColors[i * 3] = c.r;
      sparkColors[i * 3 + 1] = c.g;
      sparkColors[i * 3 + 2] = c.b;
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sparks = new THREE.Points(this.sparkGeo, sparkMat);
    this.root.add(this.sparks);

    // Portal Point Light
    this.portalLight = new THREE.PointLight(0xff7700, 0, 30);
    this.portalLight.position.set(0, 0, 1);
    this.root.add(this.portalLight);

    this.root.scale.set(0.05, 0.05, 0.05);
    this.root.visible = false;
  }

  update(progress, time) {
    if (progress < 0.88) {
      this.root.visible = false;
      this.outerTorus.material.opacity = 0;
      this.innerTorus.material.opacity = 0;
      this.coreTorus.material.opacity = 0;
      this.voidDisc.material.opacity = 0;
      this.sparks.material.opacity = 0;
      this.portalLight.intensity = 0;
      return;
    }

    this.root.visible = true;

    const appearance = Math.min(1, Math.max(0, (progress - 0.88) / 0.08));
    const targetScale = THREE.MathUtils.lerp(0.12, 1.9, Math.pow(appearance, 1.5));
    this.root.scale.set(targetScale, targetScale, targetScale);

    this.outerTorus.material.opacity = appearance * 0.95;
    this.innerTorus.material.opacity = appearance * 0.85;
    this.coreTorus.material.opacity = appearance * 0.75;
    this.voidDisc.material.opacity = appearance * 0.98;
    this.sparks.material.opacity = appearance * 0.9;
    this.portalLight.intensity = appearance * 8.0;

    this.outerTorus.rotation.z += 0.015;
    this.innerTorus.rotation.z -= 0.022;
    this.coreTorus.rotation.z += 0.035;

    const posAttr = this.sparkGeo.attributes.position;
    for (let i = 0; i < this.sparkCount; i++) {
      this.sparkAngles[i] += this.sparkSpeeds[i] * 0.012;
      const r = this.sparkRadii[i] + Math.sin(time * 3 + i) * 0.15;
      posAttr.setX(i, Math.cos(this.sparkAngles[i]) * r);
      posAttr.setY(i, Math.sin(this.sparkAngles[i]) * r);
    }
    posAttr.needsUpdate = true;
  }

  dispose() {
    if (this.outerTorus) {
      this.outerTorus.geometry.dispose();
      this.outerTorus.material.dispose();
    }
    if (this.innerTorus) {
      this.innerTorus.geometry.dispose();
      this.innerTorus.material.dispose();
    }
    if (this.coreTorus) {
      this.coreTorus.geometry.dispose();
      this.coreTorus.material.dispose();
    }
    if (this.voidDisc) {
      this.voidDisc.geometry.dispose();
      this.voidDisc.material.dispose();
    }
    if (this.sparkGeo) {
      this.sparkGeo.dispose();
    }
    if (this.sparks) {
      this.sparks.material.dispose();
    }
  }
}

export default MultiversePortalController;
