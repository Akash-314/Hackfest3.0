import * as THREE from 'three';

/**
 * CinematicCamera controller:
 * Directorial camera choreography designed specifically for:
 * 1. Deep Cosmic Starfield & 3D Planet Flyby (0.00 - 0.20)
 * 2. Doctor Strange Dimensional Portal Initiation & Expansion (0.20 - 0.38)
 * 3. HACKFEST 3.0 Title Reveal Inside the Portal Gateway (0.38 - 0.52)
 * 4. Iron Man Supersonic Portal Exit & Tracking Shot (0.52 - 0.76)
 * 5. Upright Heroic Hover & Stable Full-Body Framing (0.76 - 0.88)
 * 6. Multiverse Assembly & Grand Finale (0.88 - 1.00)
 */
export function createCinematicCamera(camera, initialAspect = 16 / 9) {
  camera.fov = 50;
  camera.near = 0.1;
  camera.far = 300;
  camera.aspect = initialAspect;
  camera.position.set(0, 0, 16.0);
  camera.updateProjectionMatrix();

  const currentPos = camera.position.clone();
  const currentLookAt = new THREE.Vector3(0, 0, 0);
  const targetPos = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  const onMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    targetMouseX = x * 0.16;
    targetMouseY = y * 0.10;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  return {
    camera,

    update(progress) {
      // Subtle mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // -------------------------------------------------------------
      // SCENE 1: DEEP SPACE INTRODUCTION (0.00 - 0.10)
      // -------------------------------------------------------------
      if (progress < 0.10) {
        const t = progress / 0.10;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(0.0, THREE.MathUtils.lerp(0.4, 0.6, smoothT), THREE.MathUtils.lerp(14.0, 11.5, smoothT));
        targetLookAt.set(0.0, THREE.MathUtils.lerp(0.4, 0.6, smoothT), THREE.MathUtils.lerp(0.0, -4.0, smoothT));
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 2: PLANETARY & SPACECRAFT FLYBY (0.10 - 0.22)
      // -------------------------------------------------------------
      else if (progress < 0.22) {
        const t = (progress - 0.10) / 0.12;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(THREE.MathUtils.lerp(0.0, 0.8, smoothT), THREE.MathUtils.lerp(0.6, 0.9, smoothT), THREE.MathUtils.lerp(11.5, 9.8, smoothT));
        targetLookAt.set(THREE.MathUtils.lerp(0.0, 1.2, smoothT), THREE.MathUtils.lerp(0.6, 0.8, smoothT), THREE.MathUtils.lerp(-4.0, -2.0, smoothT));
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 3: DOCTOR DOOM SOLO REVEAL (0.22 - 0.35)
      // -------------------------------------------------------------
      else if (progress < 0.35) {
        const t = (progress - 0.22) / 0.13;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(THREE.MathUtils.lerp(0.8, 0.0, smoothT), THREE.MathUtils.lerp(0.9, 1.35, smoothT), THREE.MathUtils.lerp(9.8, 6.2, smoothT));
        targetLookAt.set(0.0, 1.25, 0.6);
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 4: THOR BIFROST LIGHTNING STORM (0.35 - 0.46)
      // -------------------------------------------------------------
      else if (progress < 0.46) {
        const t = (progress - 0.35) / 0.11;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(THREE.MathUtils.lerp(0.0, 0.4, smoothT), THREE.MathUtils.lerp(1.35, 1.4, smoothT), THREE.MathUtils.lerp(6.2, 7.2, smoothT));
        targetLookAt.set(0.0, 1.3, 0.0);
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 5: IRON MAN PORTAL EXIT & UPRIGHT HOVER (0.46 - 0.60)
      // -------------------------------------------------------------
      else if (progress < 0.60) {
        const t = (progress - 0.46) / 0.14;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(0.0, 1.45, THREE.MathUtils.lerp(7.0, 6.2, smoothT));
        targetLookAt.set(0.0, 1.35, THREE.MathUtils.lerp(-2.5, 0.0, smoothT));
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 6: SPIDER-MAN SOLO REVEAL (0.60 - 0.72)
      // -------------------------------------------------------------
      else if (progress < 0.72) {
        const t = (progress - 0.60) / 0.12;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(0.0, 1.35, 6.2);
        targetLookAt.set(0.0, 1.2, 0.6);
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 7: SPACECRAFT VANGUARD MANEUVER (0.72 - 0.80)
      // -------------------------------------------------------------
      else if (progress < 0.80) {
        const t = (progress - 0.72) / 0.08;
        const smoothT = t * t * (3 - 2 * t);
        targetPos.set(THREE.MathUtils.lerp(0.0, -0.6, smoothT), THREE.MathUtils.lerp(1.35, 1.7, smoothT), THREE.MathUtils.lerp(6.2, 7.8, smoothT));
        targetLookAt.set(THREE.MathUtils.lerp(0.0, -1.8, smoothT), 2.0, -1.5);
        camera.fov = 50;
      }
      // -------------------------------------------------------------
      // SCENE 8: ALL CHARACTERS ASSEMBLE (0.80 - 0.90) - NO TITLE YET!
      // -------------------------------------------------------------
      else if (progress < 0.90) {
        const t = (progress - 0.80) / 0.10;
        const smoothT = Math.pow(t, 1.1);
        // Pull back smoothly into grand squad composition
        targetPos.set(0.0, THREE.MathUtils.lerp(1.6, 1.45, smoothT), THREE.MathUtils.lerp(7.8, 9.4, smoothT));
        targetLookAt.set(0.0, 1.25, -0.3);
        camera.fov = THREE.MathUtils.lerp(50, 48, smoothT);
      }
      // -------------------------------------------------------------
      // SCENE 9: FINAL HACKFEST 3.0 REVEAL (0.90 - 1.00)
      // -------------------------------------------------------------
      else {
        const t = (progress - 0.90) / 0.10;
        const smoothT = Math.sin((t * Math.PI) / 2);
        targetPos.set(0.0, 1.45, THREE.MathUtils.lerp(9.4, 12.8, smoothT));
        targetLookAt.set(0.0, 1.25, -0.4);
        camera.fov = 48;
      }

      camera.updateProjectionMatrix();

      // Fluid interpolation (prevents any jerky snapping)
      currentPos.lerp(targetPos, 0.08);
      currentLookAt.lerp(targetLookAt, 0.08);

      camera.position.copy(currentPos);
      camera.position.x += mouseX;
      camera.position.y += mouseY;
      camera.lookAt(currentLookAt);
    },

    resize(width, height) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },

    dispose() {
      window.removeEventListener('mousemove', onMouseMove);
    },
  };
}

export default createCinematicCamera;
