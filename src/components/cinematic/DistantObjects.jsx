import * as THREE from 'three';

/**
 * DistantObjectsController:
 * Subtle deep-space environmental objects:
 * 1. Deep space research probe with solar arrays & pulsing beacon
 * 2. Distant mysterious ringed cosmic planetoid on the lower-left horizon
 */
export class DistantObjectsController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'Cosmic_Distant_Artifacts';
    this.isMobile = isMobile;

    this.probe = null;
    this.planetoid = null;
    this.beaconLight = null;

    this.init();
  }

  init() {
    // 1. Deep Space Research Probe
    this.probe = new THREE.Group();
    this.probe.position.set(4.5, 3.8, -22.0);
    this.probe.rotation.set(0.4, 0.6, -0.2);

    // Probe body
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.1, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Gold insulation foil
      metalness: 0.85,
      roughness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.probe.add(body);

    // Solar Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.04, 0.5);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x0088cc,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    this.probe.add(wings);

    // Beacon light
    this.beaconLight = new THREE.PointLight(0x00f3ff, 1.2, 8);
    this.beaconLight.position.set(0, 0.7, 0);
    this.probe.add(this.beaconLight);

    this.root.add(this.probe);

    // 2. Distant Ringed Planetoid (lower left flank)
    this.planetoid = new THREE.Group();
    this.planetoid.position.set(-16.0, -5.5, -34.0);

    const planetGeo = new THREE.SphereGeometry(2.2, 24, 24);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1b2838,
      roughness: 0.7,
      metalness: 0.1,
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    this.planetoid.add(planet);

    // Planet Atmospheric Rim
    const atmoGeo = new THREE.SphereGeometry(2.28, 24, 24);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x00bfff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    this.planetoid.add(atmo);

    // Planet Rings
    const ringGeo = new THREE.RingGeometry(2.8, 4.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x486581,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    this.planetoid.add(ring);

    this.root.add(this.planetoid);

    this.root.visible = false;
  }

  update(progress, time) {
    // Visible during deep cosmic space travel (0.20 to 0.98)
    if (progress < 0.20 || progress > 0.98) {
      this.root.visible = false;
      return;
    }

    this.root.visible = true;

    // Slow orbital drift
    if (this.probe) {
      this.probe.rotation.y += 0.008;
      this.probe.position.y = 3.8 + Math.sin(time * 0.8) * 0.2;
      if (this.beaconLight) {
        this.beaconLight.intensity = Math.sin(time * 6) > 0 ? 1.5 : 0.1;
      }
    }

    if (this.planetoid) {
      this.planetoid.rotation.y += 0.002;
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
  }
}

export default DistantObjectsController;
