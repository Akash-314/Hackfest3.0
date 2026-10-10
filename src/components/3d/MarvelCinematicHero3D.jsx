import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function checkWebGL() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function MarvelCinematicHero3D() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(Math.floor(rect.width) || container.clientWidth || 300, 100);
    const height = Math.max(Math.floor(rect.height) || container.clientHeight || 300, 100);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 11);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if (renderer.domElement) {
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
    }
    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0x1a2236, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Dynamic Repulsor / Portal Point Lights
    const repulsorLight = new THREE.PointLight(0x00bfff, 3.5, 15);
    repulsorLight.position.set(-2, 1, 3);
    scene.add(repulsorLight);

    const portalLight = new THREE.PointLight(0xff7700, 4.0, 18);
    portalLight.position.set(0, 1.5, -2);
    scene.add(portalLight);

    // 3. Background: Cinematic City Skyline Silhouettes
    const cityGroup = new THREE.Group();
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x080c16,
      roughness: 0.85,
      metalness: 0.2,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x223a5e });

    for (let i = -14; i <= 14; i += 1.8) {
      const bHeight = 4 + Math.random() * 8;
      const bWidth = 1.2 + Math.random() * 1.2;
      const bDepth = 1.5 + Math.random() * 2;
      const buildingGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(i * 1.5 + (Math.random() - 0.5), bHeight / 2 - 4, -12 - Math.random() * 10);
      cityGroup.add(building);

      // Random window bands
      if (Math.random() > 0.4) {
        const winGeo = new THREE.PlaneGeometry(bWidth * 0.8, bHeight * 0.4);
        const winMesh = new THREE.Mesh(winGeo, windowMat);
        winMesh.position.set(building.position.x, building.position.y + 0.5, building.position.z + bDepth / 2 + 0.05);
        cityGroup.add(winMesh);
      }
    }
    scene.add(cityGroup);

    // 4. Multiverse Spark Portal (Doctor Strange style sling-ring vortex)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 1.2, -2.5);

    const portalSparkCount = 900;
    const portalPositions = new Float32Array(portalSparkCount * 3);
    const portalColors = new Float32Array(portalSparkCount * 3);
    const portalAngles = new Float32Array(portalSparkCount);
    const portalRadii = new Float32Array(portalSparkCount);
    const portalSpeeds = new Float32Array(portalSparkCount);

    const colorGold = new THREE.Color(0xff9900);
    const colorFire = new THREE.Color(0xff3300);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < portalSparkCount; i++) {
      portalAngles[i] = Math.random() * Math.PI * 2;
      portalRadii[i] = 2.4 + (Math.random() - 0.5) * 0.6;
      portalSpeeds[i] = 1.5 + Math.random() * 2.5;

      const mixedColor = Math.random() > 0.7 ? colorWhite : Math.random() > 0.3 ? colorGold : colorFire;
      portalColors[i * 3] = mixedColor.r;
      portalColors[i * 3 + 1] = mixedColor.g;
      portalColors[i * 3 + 2] = mixedColor.b;
    }

    const portalGeo = new THREE.BufferGeometry();
    portalGeo.setAttribute('position', new THREE.BufferAttribute(portalPositions, 3));
    portalGeo.setAttribute('color', new THREE.BufferAttribute(portalColors, 3));

    const portalMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const portalPoints = new THREE.Points(portalGeo, portalMat);
    portalGroup.add(portalPoints);

    // Inner dimensional cosmic core disc
    const innerDiscGeo = new THREE.CircleGeometry(2.2, 48);
    const innerDiscMat = new THREE.MeshBasicMaterial({
      color: 0x110033,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    portalGroup.add(innerDisc);
    scene.add(portalGroup);

    // 5. Iron Man Archetype Character (Flying Armored Hero)
    const ironManGroup = new THREE.Group();
    const armorRedMat = new THREE.MeshStandardMaterial({
      color: 0xaa181e,
      roughness: 0.25,
      metalness: 0.85,
    });
    const armorGoldMat = new THREE.MeshStandardMaterial({
      color: 0xe0a526,
      roughness: 0.2,
      metalness: 0.9,
    });
    const glowBlueMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    });

    // Torso & Chest
    const torsoGeo = new THREE.ConeGeometry(0.45, 0.9, 8);
    torsoGeo.rotateX(Math.PI);
    const torsoMesh = new THREE.Mesh(torsoGeo, armorRedMat);
    ironManGroup.add(torsoMesh);

    // Chest Arc Reactor
    const chestCoreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    chestCoreGeo.rotateX(Math.PI / 2);
    const chestCore = new THREE.Mesh(chestCoreGeo, glowBlueMat);
    chestCore.position.set(0, 0.15, 0.3);
    ironManGroup.add(chestCore);

    // Helmet
    const headGeo = new THREE.BoxGeometry(0.35, 0.42, 0.38);
    const headMesh = new THREE.Mesh(headGeo, armorGoldMat);
    headMesh.position.set(0, 0.65, 0.05);
    ironManGroup.add(headMesh);

    // Helmet Faceplate mask & eyes
    const faceplateGeo = new THREE.BoxGeometry(0.3, 0.32, 0.05);
    const faceplate = new THREE.Mesh(faceplateGeo, armorRedMat);
    faceplate.position.set(0, 0.62, 0.23);
    ironManGroup.add(faceplate);

    const eyeGeo = new THREE.BoxGeometry(0.1, 0.03, 0.02);
    const eyeLeft = new THREE.Mesh(eyeGeo, glowBlueMat);
    eyeLeft.position.set(-0.08, 0.66, 0.26);
    const eyeRight = new THREE.Mesh(eyeGeo, glowBlueMat);
    eyeRight.position.set(0.08, 0.66, 0.26);
    ironManGroup.add(eyeLeft);
    ironManGroup.add(eyeRight);

    // Shoulders & Arms
    const shoulderGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const shoulderL = new THREE.Mesh(shoulderGeo, armorRedMat);
    shoulderL.position.set(-0.55, 0.35, 0);
    const shoulderR = new THREE.Mesh(shoulderGeo, armorRedMat);
    shoulderR.position.set(0.55, 0.35, 0);
    ironManGroup.add(shoulderL);
    ironManGroup.add(shoulderR);

    // Right Arm aiming forward with repulsor
    const armRGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8);
    armRGeo.rotateX(Math.PI / 2);
    const armR = new THREE.Mesh(armRGeo, armorRedMat);
    armR.position.set(0.55, 0.25, 0.45);
    ironManGroup.add(armR);

    const palmRepulsor = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), glowBlueMat);
    palmRepulsor.position.set(0.55, 0.25, 0.82);
    ironManGroup.add(palmRepulsor);

    // Left Arm tucked in flight posture
    const armLGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.7, 8);
    armLGeo.rotateX(Math.PI / 3);
    const armL = new THREE.Mesh(armLGeo, armorGoldMat);
    armL.position.set(-0.55, 0.15, -0.2);
    ironManGroup.add(armL);

    // Legs in flight pose
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.85, 8);
    legGeo.rotateX(-Math.PI / 8);
    const legL = new THREE.Mesh(legGeo, armorRedMat);
    legL.position.set(-0.25, -0.75, -0.2);
    const legR = new THREE.Mesh(legGeo, armorRedMat);
    legR.position.set(0.25, -0.75, -0.25);
    ironManGroup.add(legL);
    ironManGroup.add(legR);

    // Thruster Jet Particles (Boots)
    const thrusterCount = 120;
    const thrusterPositions = new Float32Array(thrusterCount * 3);
    for (let i = 0; i < thrusterCount; i++) {
      thrusterPositions[i * 3] = (Math.random() - 0.5) * 0.4;
      thrusterPositions[i * 3 + 1] = -1.2 - Math.random() * 1.5;
      thrusterPositions[i * 3 + 2] = -0.4 - Math.random() * 0.4;
    }
    const thrusterGeo = new THREE.BufferGeometry();
    thrusterGeo.setAttribute('position', new THREE.BufferAttribute(thrusterPositions, 3));
    const thrusterMat = new THREE.PointsMaterial({
      size: 0.14,
      color: 0x00bfff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    const thrusterParticles = new THREE.Points(thrusterGeo, thrusterMat);
    ironManGroup.add(thrusterParticles);

    scene.add(ironManGroup);

    // 6. Spider-Man Archetype Character (Swinging Red/Navy Hero)
    const spideyGroup = new THREE.Group();
    const spideyRedMat = new THREE.MeshStandardMaterial({
      color: 0xcc1122,
      roughness: 0.4,
      metalness: 0.3,
    });
    const spideyBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0f2244,
      roughness: 0.45,
      metalness: 0.3,
    });
    const spideyLensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Agile Torso
    const sTorso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 0.28), spideyRedMat);
    spideyGroup.add(sTorso);

    // Blue side panels
    const sTorsoSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.25), spideyBlueMat);
    sTorsoSideL.position.set(-0.18, -0.02, 0);
    const sTorsoSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.25), spideyBlueMat);
    sTorsoSideR.position.set(0.18, -0.02, 0);
    spideyGroup.add(sTorsoSideL);
    spideyGroup.add(sTorsoSideR);

    // Head with Spider Eyes
    const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), spideyRedMat);
    sHead.position.set(0, 0.52, 0.05);
    spideyGroup.add(sHead);

    const eyeL = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), spideyLensMat);
    eyeL.position.set(-0.08, 0.54, 0.28);
    eyeL.rotation.z = 0.2;
    const eyeR = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), spideyLensMat);
    eyeR.position.set(0.08, 0.54, 0.28);
    eyeR.rotation.z = -0.2;
    spideyGroup.add(eyeL);
    spideyGroup.add(eyeR);

    // Dynamic Swung Arms (Right arm reaching up to web)
    const sArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.8, 8), spideyRedMat);
    sArmR.position.set(0.42, 0.65, 0);
    sArmR.rotation.z = -Math.PI / 3;
    spideyGroup.add(sArmR);

    const sArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.7, 8), spideyBlueMat);
    sArmL.position.set(-0.45, -0.15, 0.2);
    sArmL.rotation.z = Math.PI / 4;
    spideyGroup.add(sArmL);

    // Tucked athletic legs (mid-swing pose)
    const sLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.75, 8), spideyBlueMat);
    sLegL.position.set(-0.25, -0.5, 0.2);
    sLegL.rotation.x = Math.PI / 3;
    const sLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.75, 8), spideyRedMat);
    sLegR.position.set(0.3, -0.65, -0.2);
    sLegR.rotation.x = -Math.PI / 5;
    spideyGroup.add(sLegL);
    spideyGroup.add(sLegR);

    // 7. Tensile Web Line
    const webPoints = [
      new THREE.Vector3(4.5, 7.5, -2), // sky anchor
      new THREE.Vector3(0, 0, 0),      // attached to Spidey's hand
    ];
    const webGeo = new THREE.BufferGeometry().setFromPoints(webPoints);
    const webMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const webLine = new THREE.Line(webGeo, webMat);
    scene.add(webLine);
    scene.add(spideyGroup);

    // 8. Ambient Battle Debris & Kinetic Ember Particles
    const debrisCount = 350;
    const debrisGeo = new THREE.BufferGeometry();
    const debrisPositions = new Float32Array(debrisCount * 3);
    const debrisSpeeds = new Float32Array(debrisCount);

    for (let i = 0; i < debrisCount; i++) {
      debrisPositions[i * 3] = (Math.random() - 0.5) * 22;
      debrisPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      debrisPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      debrisSpeeds[i] = 0.4 + Math.random() * 0.8;
    }
    debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
    const debrisMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xff4433,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.7,
    });
    const debrisParticles = new THREE.Points(debrisGeo, debrisMat);
    scene.add(debrisParticles);

    // 9. Mouse Parallax & Dynamic Tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 10. Animation Loop: Superhero Flight, Swing & Multiverse Vortices
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // A. Portal Sparks Vortex Rotation
      const posArray = portalPoints.geometry.attributes.position.array;
      for (let i = 0; i < portalSparkCount; i++) {
        portalAngles[i] += 0.025 * portalSpeeds[i];
        const r = portalRadii[i] + Math.sin(elapsedTime * 4 + i) * 0.08;
        posArray[i * 3] = Math.cos(portalAngles[i]) * r;
        posArray[i * 3 + 1] = Math.sin(portalAngles[i]) * r;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      }
      portalPoints.geometry.attributes.position.needsUpdate = true;
      portalGroup.rotation.z = elapsedTime * 0.3;

      // Pulse portal light & inner disc
      portalLight.intensity = 3.5 + Math.sin(elapsedTime * 5) * 1.2;
      innerDiscMat.opacity = 0.75 + Math.sin(elapsedTime * 3) * 0.2;

      // B. Iron Man Flight Curve & Bank
      const imT = elapsedTime * 0.85;
      // Figure-8 flight trajectory
      const imX = Math.sin(imT) * 3.8 - 0.5;
      const imY = Math.cos(imT * 2) * 1.2 + 0.8;
      const imZ = Math.sin(imT * 1.5) * 2.2 + 1.2;

      ironManGroup.position.set(imX, imY, imZ);
      // Realistic banking angles
      ironManGroup.rotation.z = -Math.cos(imT) * 0.6;
      ironManGroup.rotation.y = Math.cos(imT) * 0.5;
      ironManGroup.rotation.x = Math.sin(imT * 2) * 0.3;

      // Pulse Repulsor Light & Thrusters
      repulsorLight.position.copy(ironManGroup.position);
      repulsorLight.intensity = 2.5 + Math.sin(elapsedTime * 12) * 1.0;

      const thrusterArr = thrusterParticles.geometry.attributes.position.array;
      for (let i = 0; i < thrusterCount; i++) {
        thrusterArr[i * 3 + 1] -= 0.12;
        if (thrusterArr[i * 3 + 1] < -2.2) {
          thrusterArr[i * 3 + 1] = -1.1;
          thrusterArr[i * 3] = (Math.random() - 0.5) * 0.3;
        }
      }
      thrusterParticles.geometry.attributes.position.needsUpdate = true;

      // C. Spider-Man Pendulum Web-Swing Trajectory
      const swingSpeed = 1.4;
      const swingAngle = Math.sin(elapsedTime * swingSpeed) * 0.75;
      const webLength = 5.2;
      const anchorX = 2.5;
      const anchorY = 5.8;
      const anchorZ = 0.5;

      const spideyX = anchorX + Math.sin(swingAngle) * webLength;
      const spideyY = anchorY - Math.cos(swingAngle) * webLength;
      const spideyZ = 1.8 + Math.cos(swingAngle * 2) * 0.8;

      spideyGroup.position.set(spideyX, spideyY, spideyZ);
      // Tilt with pendulum swing
      spideyGroup.rotation.z = -swingAngle * 1.2;
      spideyGroup.rotation.y = -0.4 + swingAngle * 0.5;

      // Update tensile web line geometry to connect anchor to Spidey hand
      const handPos = new THREE.Vector3(spideyX + 0.4, spideyY + 0.6, spideyZ);
      const linePositions = webLine.geometry.attributes.position.array;
      linePositions[0] = anchorX;
      linePositions[1] = anchorY;
      linePositions[2] = anchorZ;
      linePositions[3] = handPos.x;
      linePositions[4] = handPos.y;
      linePositions[5] = handPos.z;
      webLine.geometry.attributes.position.needsUpdate = true;

      // D. Drift Ambient Battle Debris
      const debArr = debrisParticles.geometry.attributes.position.array;
      for (let i = 0; i < debrisCount; i++) {
        debArr[i * 3 + 1] += debrisSpeeds[i] * 0.03;
        debArr[i * 3] += Math.sin(elapsedTime + i) * 0.01;
        if (debArr[i * 3 + 1] > 8) debArr[i * 3 + 1] = -8;
      }
      debrisParticles.geometry.attributes.position.needsUpdate = true;

      // E. Camera Cinematic Orbit & Parallax
      camera.position.x += (mouseX * 2.2 - camera.position.x) * 0.04;
      camera.position.y += (1.2 + mouseY * 1.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.8, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize via ResizeObserver and window fallback
    const updateDimensions = () => {
      if (!container || !renderer) return;
      const r = container.getBoundingClientRect();
      const nw = Math.floor(r.width);
      const nh = Math.floor(r.height);
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      renderer.dispose();
      portalGeo.dispose();
      portalMat.dispose();
      debrisGeo.dispose();
      debrisMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div
      ref={containerRef}
      className="marvel-3d-scene-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Interactive 3D Marvel superhero cinematic battle scene featuring Iron Man flight, Spider-Man web-swinging, and a Multiverse portal"
    >
      {!webglSupported && (
        <div className="superhero-fallback-cinematic" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="comic-portal-flare" />
          <p style={{ color: 'var(--color-stark-gold)', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
            MULTIVERSE NEXUS ACTIVE // 3D ACCELERATION REDUCED
          </p>
        </div>
      )}
    </div>
  );
}
