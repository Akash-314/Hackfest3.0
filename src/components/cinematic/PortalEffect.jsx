import * as THREE from 'three';
import { getGlowParticleTexture } from './particleTexture';

/**
 * PortalEffectController:
 * High-end Doctor Strange-inspired mystical dimensional gateway for HackFest 3.0.
 *
 * Visual Features:
 * - Bright circular orange-gold energy rim with fiery glow.
 * - Multiple rotating segmented energy arcs and eldritch mandala geometry (sacred geometry runes).
 * - Fine sparks and glowing particles streaming around the circumference and spraying outward.
 * - Swirling dimensional vortex interior with cosmic depth revealing the distant planet and stars.
 * - Volumetric warm orange/gold light that dynamically illuminates Iron Man as he flies through.
 * - 3D "HACKFEST 3.0" glowing title reveal positioned inside the portal gateway opening.
 * - Reversible scroll-controlled expansion and stabilization.
 */
export class PortalEffectController {
  constructor(isMobile = false) {
    this.root = new THREE.Group();
    this.root.name = 'DoctorStrange_Portal_Root';
    this.isMobile = isMobile;

    this.portalRadius = 2.8;
    this.portalCenter = new THREE.Vector3(0, 1.8, -2.5);
    this.root.position.copy(this.portalCenter);

    // Dynamic lights
    this.rimLight = null;
    this.fillLight = null;

    // Portal components
    this.rimMesh = null;
    this.innerRimMesh = null;
    this.vortexMesh = null;
    this.mandalaGroup = null;
    this.sparkPoints = null;
    this.titleMesh = null;

    // Spark particle data
    this.sparkGeo = null;
    this.sparkData = [];

    this.initPortal();
  }

  initPortal() {
    const glowTex = getGlowParticleTexture();

    // -------------------------------------------------------------
    // 1. Dynamic Portal Lights (Orange-Gold Rim & Scene Illumination)
    // -------------------------------------------------------------
    this.rimLight = new THREE.PointLight(0xff7700, 0, 16);
    this.rimLight.position.set(0, 0, 0.2);
    this.root.add(this.rimLight);

    this.fillLight = new THREE.PointLight(0xffaa22, 0, 22);
    this.fillLight.position.set(0, 0, 1.8);
    this.root.add(this.fillLight);

    // -------------------------------------------------------------
    // 2. Primary Glowing Energy Rim (Torus + Ring)
    // -------------------------------------------------------------
    const torusGeo = new THREE.TorusGeometry(this.portalRadius, 0.055, 16, 96);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    this.rimMesh = new THREE.Mesh(torusGeo, rimMat);
    this.root.add(this.rimMesh);

    // Inner bright white-gold core rim
    const innerTorusGeo = new THREE.TorusGeometry(this.portalRadius * 0.985, 0.025, 12, 96);
    const innerRimMat = new THREE.MeshBasicMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.innerRimMesh = new THREE.Mesh(innerTorusGeo, innerRimMat);
    this.root.add(this.innerRimMesh);

    // -------------------------------------------------------------
    // 3. Swirling Dimensional Vortex Interior
    // -------------------------------------------------------------
    const vortexGeo = new THREE.CircleGeometry(this.portalRadius * 0.98, 64);
    const vortexMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.0 },
        uColorEdge: { value: new THREE.Color(0xff6600) },
        uColorMid: { value: new THREE.Color(0x221144) },
        uColorCore: { value: new THREE.Color(0x020512) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColorEdge;
        uniform vec3 uColorMid;
        uniform vec3 uColorCore;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 0.5);
          vec2 toCenter = vUv - center;
          float dist = length(toCenter) * 2.0; // 0 at center, 1 at edge

          if (dist > 1.0) discard;

          // Swirling angle calculation
          float angle = atan(toCenter.y, toCenter.x);
          float swirl = sin(angle * 6.0 + uTime * 4.0 - dist * 8.0) * 0.5 + 0.5;
          float pulse = sin(uTime * 3.0 + dist * 5.0) * 0.2 + 0.8;

          // Rim glow intensity increases sharply near the circular edge
          float edgeGlow = smoothstep(0.7, 1.0, dist);
          float coreDark = smoothstep(0.4, 0.9, dist);

          vec3 color = mix(uColorCore, uColorMid, coreDark);
          color = mix(color, uColorEdge * (1.2 + swirl * 0.5), edgeGlow);

          // Center has gentle translucency so the rotating planet and stars behind are visible!
          float alpha = mix(0.35, 0.95, edgeGlow) * uOpacity;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    this.vortexMesh.position.z = -0.02;
    this.root.add(this.vortexMesh);

    // -------------------------------------------------------------
    // 4. Doctor Strange Eldritch Mandala Geometry (Sacred Runes)
    // -------------------------------------------------------------
    this.mandalaGroup = new THREE.Group();
    this.root.add(this.mandalaGroup);

    // Mandala Ring 1: Inscribed 8-pointed star & concentric circles
    const starPoints = [];
    const numPoints = 8;
    const rOuter = this.portalRadius * 0.92;
    const rInner = this.portalRadius * 0.65;
    for (let i = 0; i < numPoints * 2; i++) {
      const a = (i * Math.PI) / numPoints;
      const r = i % 2 === 0 ? rOuter : rInner;
      starPoints.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    starPoints.push(starPoints[0].clone()); // close loop
    const starGeo = new THREE.BufferGeometry().setFromPoints(starPoints);
    const lineMat1 = new THREE.LineBasicMaterial({
      color: 0xffaa11,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.starLineMesh = new THREE.Line(starGeo, lineMat1);
    this.mandalaGroup.add(this.starLineMesh);

    // Mandala Ring 2: Segmented Arc Ring (Outer)
    const arcPoints = [];
    const segCount = 48;
    for (let i = 0; i < segCount; i++) {
      if (i % 3 === 0) continue; // broken segmented pattern
      const a1 = (i / segCount) * Math.PI * 2;
      const a2 = ((i + 0.75) / segCount) * Math.PI * 2;
      arcPoints.push(new THREE.Vector3(Math.cos(a1) * (this.portalRadius * 0.95), Math.sin(a1) * (this.portalRadius * 0.95), 0));
      arcPoints.push(new THREE.Vector3(Math.cos(a2) * (this.portalRadius * 0.95), Math.sin(a2) * (this.portalRadius * 0.95), 0));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const lineMat2 = new THREE.LineSegments(arcGeo, new THREE.LineBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    }));
    this.arcMesh = lineMat2;
    this.mandalaGroup.add(this.arcMesh);

    // Mandala Ring 3: Inscribed Inner Square / Diamond
    const sqPoints = [];
    for (let i = 0; i <= 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const r = this.portalRadius * 0.75;
      sqPoints.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const sqGeo = new THREE.BufferGeometry().setFromPoints(sqPoints);
    this.sqMesh = new THREE.Line(sqGeo, new THREE.LineBasicMaterial({
      color: 0xffcc33,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    }));
    this.mandalaGroup.add(this.sqMesh);

    // -------------------------------------------------------------
    // 5. Fiery Sparks & Orbiting Circumference Particles
    // -------------------------------------------------------------
    const sparkCount = this.isMobile ? 120 : 260;
    this.sparkGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(sparkCount * 3);
    const sCol = new Float32Array(sparkCount * 3);
    const sSize = new Float32Array(sparkCount);
    this.sparkData = [];

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = this.portalRadius + (Math.random() - 0.5) * 0.25;
      sPos[i * 3] = Math.cos(angle) * radius;
      sPos[i * 3 + 1] = Math.sin(angle) * radius;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;

      // Golden orange to blazing yellow
      const isYellow = Math.random() > 0.4;
      sCol[i * 3] = 1.0;
      sCol[i * 3 + 1] = isYellow ? 0.85 : 0.45;
      sCol[i * 3 + 2] = isYellow ? 0.2 : 0.05;

      sSize[i] = 0.12 + Math.random() * 0.2;

      this.sparkData.push({
        angle,
        radius,
        baseRadius: this.portalRadius,
        speed: 2.2 + Math.random() * 3.5, // fast orbital speed
        drift: (Math.random() - 0.5) * 0.4,
        sprayLife: Math.random(),
      });
    }

    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));

    this.sparkMat = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.sparkPoints = new THREE.Points(this.sparkGeo, this.sparkMat);
    this.root.add(this.sparkPoints);

    // -------------------------------------------------------------
    // 6. 3D "HACKFEST 3.0" Title Inside the Portal Gateway
    // -------------------------------------------------------------
    this.createPortalTitle();

    this.root.visible = false;
    this.root.scale.set(0.001, 0.001, 0.001);
  }

  createPortalTitle() {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Futuristic badge
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffaa33';
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 18;
    ctx.fillText('⚡ DIMENSIONAL MULTIVERSE GATEWAY ⚡', 512, 110);

    // 2. Main Title: HACKFEST 3.0
    ctx.font = '900 128px sans-serif';
    ctx.shadowColor = '#ff9900';
    ctx.shadowBlur = 32;

    const grad = ctx.createLinearGradient(120, 0, 900, 0);
    grad.addColorStop(0.0, '#ffffff');
    grad.addColorStop(0.3, '#ffcc44');
    grad.addColorStop(0.7, '#ff8800');
    grad.addColorStop(1.0, '#00e1ff');
    ctx.fillStyle = grad;
    ctx.fillText('HACKFEST 3.0', 512, 255);

    // Double glow outline for cinematic punch
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText('HACKFEST 3.0', 512, 255);

    // 3. Subtitle / Rec Banda
    ctx.font = '700 36px sans-serif';
    ctx.fillStyle = '#cceeff';
    ctx.shadowColor = '#00bbff';
    ctx.shadowBlur = 16;
    ctx.fillText('THE NEXT GENERATION HEROES', 512, 340);

    ctx.font = '600 24px sans-serif';
    ctx.fillStyle = '#ffbb66';
    ctx.shadowBlur = 10;
    ctx.fillText('RAJKIYA ENGINEERING COLLEGE BANDA', 512, 395);

    const titleTex = new THREE.CanvasTexture(canvas);
    titleTex.generateMipmaps = true;

    const titleGeo = new THREE.PlaneGeometry(3.6, 1.8);
    this.titleMat = new THREE.MeshBasicMaterial({
      map: titleTex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.titleMesh = new THREE.Mesh(titleGeo, this.titleMat);
    // Positioned inside the portal gateway opening, slightly back from the rim
    this.titleMesh.position.set(0, 0.15, -0.08);
    this.root.add(this.titleMesh);
  }

  update(progress, elapsedTime) {
    let isVisible = false;

    // Strict Portal Lifecycle:
    // Scene 1 - 4 (0.00 - 0.46): Dormant in space
    // Scene 5 (0.46 - 0.60): Iron Man dimensional portal emergence (title strictly HIDDEN: 0.0)
    // Scene 6 - 7 (0.60 - 0.80): Portal energy rests in background (title strictly HIDDEN: 0.0)
    // Scene 8 (0.80 - 0.90): All characters assemble in foreground (title strictly HIDDEN: 0.0)
    // Scene 9 (0.90 - 1.00): FINAL HACKFEST 3.0 REVEAL - Portal flares up and title appears!
    let scale = 0;
    let portalAlpha = 0;
    let titleAlpha = 0;

    if (progress >= 0.46 && progress < 0.60) {
      // Scene 5: Iron Man Portal Emergence
      isVisible = true;
      const p = (progress - 0.46) / 0.14; // 0 to 1
      if (p < 0.3) {
        // Portal expands open
        scale = THREE.MathUtils.lerp(0.01, 1.05, p / 0.3);
        portalAlpha = p / 0.3;
      } else if (p < 0.8) {
        // Open while Iron Man flies through
        scale = 1.0 + Math.sin(elapsedTime * 3.0) * 0.02;
        portalAlpha = 1.0;
      } else {
        // Smoothly fades to background
        scale = THREE.MathUtils.lerp(1.0, 0.4, (p - 0.8) / 0.2);
        portalAlpha = THREE.MathUtils.lerp(1.0, 0.0, (p - 0.8) / 0.2);
      }
      titleAlpha = 0.0; // STRICTLY NO TITLE IN SCENE 5
    } else if (progress >= 0.80) {
      // Scene 8 & 9: Assembly & Final Reveal
      isVisible = true;

      if (progress < 0.90) {
        // Scene 8 (0.80 - 0.90): Characters assemble. Portal softly ignites in background behind them.
        const t = (progress - 0.80) / 0.10; // 0 to 1
        scale = THREE.MathUtils.lerp(0.2, 1.0, t);
        portalAlpha = THREE.MathUtils.lerp(0.1, 0.85, t);
        titleAlpha = 0.0; // STRICTLY NO TITLE IN SCENE 8 (Characters assembling)
      } else {
        // Scene 9 (0.90 - 1.00): FINAL HACKFEST 3.0 REVEAL
        // Dimensional portal flares up behind the open center stage
        const t = (progress - 0.90) / 0.10; // 0 to 1
        scale = 1.0 + Math.sin(elapsedTime * 2.5) * 0.03;
        portalAlpha = 1.0;
        titleAlpha = 0.0; // Handled crisply by CinematicOverlay without 3D texture duplicate blurring
      }
    } else {
      isVisible = false;
      scale = 0.001;
      portalAlpha = 0.0;
      titleAlpha = 0.0;
    }

    if (isVisible) {
      this.root.scale.set(scale, scale, scale);

      // 2. Animate Dynamic Lights
      const flicker = Math.sin(elapsedTime * 14.0) * 0.4 + Math.sin(elapsedTime * 8.0) * 0.3;
      this.rimLight.intensity = Math.max(0, portalAlpha * (4.5 + flicker));
      this.fillLight.intensity = Math.max(0, portalAlpha * (3.8 + flicker * 0.6));

      // 3. Animate Vortex Interior Shader
      if (this.vortexMesh) {
        this.vortexMesh.material.uniforms.uTime.value = elapsedTime;
        // In Scene 9, keep center dark and uncluttered behind title
        const vOpacity = progress >= 0.90 ? 0.22 : portalAlpha * 0.85;
        this.vortexMesh.material.uniforms.uOpacity.value = vOpacity;
      }

      // 4. Animate Eldritch Mandala Rotations (Disabled in Scene 9 to keep title background clean)
      if (this.mandalaGroup) {
        this.mandalaGroup.visible = progress < 0.90;
        if (this.mandalaGroup.visible) {
          this.starLineMesh.rotation.z = elapsedTime * 0.45;
          this.arcMesh.rotation.z = -elapsedTime * 0.75;
          this.sqMesh.rotation.z = elapsedTime * 0.25;
        }
      }

      // 5. Animate Sparks Particle System
      this.sparkMat.opacity = portalAlpha * 0.9;
      const sPos = this.sparkGeo.attributes.position;
      for (let i = 0; i < this.sparkData.length; i++) {
        const d = this.sparkData[i];
        d.angle += d.speed * 0.016;

        // Radial vibration and outward sparks
        const currentR = d.baseRadius + Math.sin(elapsedTime * 8.0 + i) * 0.08 + (Math.random() - 0.5) * 0.04;
        sPos.setX(i, Math.cos(d.angle) * currentR);
        sPos.setY(i, Math.sin(d.angle) * currentR);
        sPos.setZ(i, Math.sin(d.angle * 3.0 + elapsedTime) * 0.1);
      }
      sPos.needsUpdate = true;

      // 6. Animate Title Opacity
      if (this.titleMat) {
        this.titleMat.opacity = titleAlpha;
      }
      if (this.titleMesh) {
        this.titleMesh.visible = titleAlpha > 0.001;
      }
    } else {
      isVisible = false;
      this.root.scale.set(0.001, 0.001, 0.001);
      if (this.rimLight) this.rimLight.intensity = 0;
      if (this.fillLight) this.fillLight.intensity = 0;
    }

    this.root.visible = isVisible;
  }

  dispose() {
    if (this.rimMesh) {
      if (this.rimMesh.geometry) this.rimMesh.geometry.dispose();
      if (this.rimMesh.material) this.rimMesh.material.dispose();
    }
    if (this.innerRimMesh) {
      if (this.innerRimMesh.geometry) this.innerRimMesh.geometry.dispose();
      if (this.innerRimMesh.material) this.innerRimMesh.material.dispose();
    }
    if (this.vortexMesh) {
      if (this.vortexMesh.geometry) this.vortexMesh.geometry.dispose();
      if (this.vortexMesh.material) this.vortexMesh.material.dispose();
    }
    if (this.sparkGeo) this.sparkGeo.dispose();
    if (this.sparkMat) this.sparkMat.dispose();
    if (this.titleMesh) {
      if (this.titleMesh.geometry) this.titleMesh.geometry.dispose();
      if (this.titleMesh.material) {
        if (this.titleMesh.material.map) this.titleMesh.material.map.dispose();
        this.titleMesh.material.dispose();
      }
    }
  }
}

export default PortalEffectController;
