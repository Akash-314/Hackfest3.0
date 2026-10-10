import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import StarFieldController from './StarField';
import CosmicPlanetController from './CosmicPlanet';
import PortalEffectController from './PortalEffect';
import SpacecraftModelController from './SpacecraftModel';
import HeroModelController from './HeroModel';
import VillainModelController from './VillainModel';
import LightningWarriorController from './LightningWarrior';
import SpiderManModelController from './SpiderManModel';
import { createCinematicCamera } from './CinematicCamera';

/**
 * CinematicScene:
 * Master Three.js WebGL canvas hosting the upgraded superhero multiverse cinematic.
 * 
 * Features:
 * - Deep black cosmic space with crisp stars at multiple depths
 * - Authentic 3D Space Fighter (space_fighter.glb) deep space arrival and supersonic flyby
 * - Distant rotating 3D planet (the_universe.glb) with cyan/blue atmospheric rim
 * - Doctor Strange-inspired magical dimensional portal with fiery orange-gold rim,
 *   rotating energy arcs, eldritch mandala runes, swirling dimensional vortex,
 *   and "HACKFEST 3.0" title reveal inside the gateway
 * - Authentic Mark VII Iron Man (ironman.glb) starting behind the portal,
 *   flying forward through the circular opening, illuminating his chest Arc Reactor
 *   and foot thrusters, and decelerating into a confident, 100% straight upright heroic hover
 * - Grand Multiverse Superhero Assembly (Doctor Doom, Spider-Man, Iron Man) & Spacecraft Vanguard Escort
 * - Buttery-smooth, reversible scroll progression
 */
function CinematicSceneComponent({
  progress = 0,
  progressRef: externalProgressRef,
  isPastIntro = false,
  onAssetLoaded = () => {},
}) {
  const containerRef = useRef(null);
  const internalProgressRef = useRef(progress);
  const activeProgressRef = externalProgressRef || internalProgressRef;
  const isPastIntroRef = useRef(isPastIntro);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    internalProgressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    isPastIntroRef.current = isPastIntro;
  }, [isPastIntro]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        onAssetLoaded(100);
        return;
      }
    } catch {
      setHasWebGL(false);
      onAssetLoaded(100);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;

    // 1. Scene with deep black space background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010206);
    scene.fog = new THREE.FogExp2(0x010206, 0.007);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 300);
    const cameraController = createCinematicCamera(camera, width / height);

    // 3. Renderer with optimized pixel ratio & zero shadow map overhead
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !isMobile,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.5));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.maxWidth = '100%';
    container.appendChild(renderer.domElement);

    // 4. Clean Cinematic Studio Lighting for Character Models & Portal
    const ambientLight = new THREE.AmbientLight(0x0c1424, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x1a2c48, 1.4);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const backRim = new THREE.DirectionalLight(0x406080, 1.6);
    backRim.position.set(0, 5, -5);
    scene.add(backRim);

    // 5. Initialize Controllers: Stars, 3D Planet, Doctor Strange Portal & Characters
    const starField = new StarFieldController(isMobile);
    scene.add(starField.root);

    const cosmicPlanet = new CosmicPlanetController(isMobile);
    scene.add(cosmicPlanet.root);

    const spacecraft = new SpacecraftModelController(isMobile);
    scene.add(spacecraft.root);

    const portal = new PortalEffectController(isMobile);
    scene.add(portal.root);

    const villain = new VillainModelController(isMobile);
    scene.add(villain.root);

    const lightningWarrior = new LightningWarriorController(isMobile);
    scene.add(lightningWarrior.root);

    const hero = new HeroModelController(isMobile);
    scene.add(hero.root);

    const spiderMan = new SpiderManModelController(isMobile);
    scene.add(spiderMan.root);

    // Progressive Asynchronous Staged Loader:
    // 1. Immediately load lightweight planet (550KB) so the initial space scene is ready in <100ms.
    // 2. Report ready early to eliminate initial page freeze and loading stutter.
    // 3. Staged sequential model queue with microtask yields prevents WebGL texture upload GPU stalls.
    let isDisposed = false;
    cosmicPlanet.load().then(() => {
      onAssetLoaded(35);
    });

    const loadSequentialQueue = async () => {
      try {
        await new Promise((r) => setTimeout(r, 120));
        if (isDisposed) return;

        // 1. Spacecraft (Scene 2)
        await spacecraft.load((pct) => onAssetLoaded(35 + pct * 0.15)).catch(() => {});
        onAssetLoaded(50);
        if (isDisposed) return;
        await new Promise((r) => setTimeout(r, 80));

        // 2. Doctor Doom (Scene 3)
        await villain.load((pct) => onAssetLoaded(50 + pct * 0.15)).catch(() => {});
        onAssetLoaded(65);
        if (isDisposed) return;
        await new Promise((r) => setTimeout(r, 80));

        // 3. Thor Mjolnir (Scene 4)
        await lightningWarrior.load((pct) => onAssetLoaded(65 + pct * 0.07)).catch(() => {});
        onAssetLoaded(72);
        if (isDisposed) return;
        await new Promise((r) => setTimeout(r, 80));

        // 4. Iron Man (Scene 5)
        await hero.load((pct) => onAssetLoaded(72 + pct * 0.18)).catch(() => {});
        onAssetLoaded(90);
        if (isDisposed) return;
        await new Promise((r) => setTimeout(r, 80));

        // 5. Spider-Man (Scene 6)
        await spiderMan.load((pct) => onAssetLoaded(90 + pct * 0.10)).catch(() => {});
        onAssetLoaded(100);
      } catch (err) {
        console.warn('Asynchronous loader queue error:', err);
        onAssetLoaded(100);
      }
    };

    loadSequentialQueue();

    // 6. Animation Render Loop with Smooth Progress Damping (Lerp)
    let animationFrameId;
    const clock = new THREE.Clock();
    let smoothedProgress = activeProgressRef.current;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Pause rendering if browser tab is hidden or user has scrolled past intro
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isPastIntroRef.current) return;

      const elapsedTime = clock.getElapsedTime();
      const targetProg = activeProgressRef.current;

      // Smooth progress interpolation: responsive and silky smooth
      smoothedProgress += (targetProg - smoothedProgress) * 0.12;

      // Update controllers
      starField.update(smoothedProgress, elapsedTime);
      cosmicPlanet.update(smoothedProgress, elapsedTime);
      spacecraft.update(smoothedProgress, elapsedTime);
      portal.update(smoothedProgress, elapsedTime);
      villain.update(smoothedProgress, elapsedTime);
      lightningWarrior.update(smoothedProgress, elapsedTime);
      hero.update(smoothedProgress, elapsedTime);
      spiderMan.update(smoothedProgress, elapsedTime);

      // Update Camera
      cameraController.update(smoothedProgress);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      cameraController.resize(newW, newH);
      renderer.setSize(newW, newH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, newW < 768 ? 1.0 : 1.5));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Debug object for runtime verification
    if (typeof window !== 'undefined') {
      window.__CINEMATIC_DEBUG__ = {
        scene,
        camera,
        renderer,
        starField,
        cosmicPlanet,
        spacecraft,
        portal,
        villain,
        lightningWarrior,
        hero,
        spiderMan,
      };
    }

    // 8. Cleanup & Resource Disposal
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      if (typeof window !== 'undefined') {
        delete window.__CINEMATIC_DEBUG__;
      }

      cameraController.dispose();
      starField.dispose();
      cosmicPlanet.dispose();
      spacecraft.dispose();
      portal.dispose();
      villain.dispose();
      lightningWarrior.dispose();
      hero.dispose();
      spiderMan.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onAssetLoaded]);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-6 text-center text-white">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-black tracking-wider text-red-400 uppercase">
            HACKFEST 3.0
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            WebGL acceleration not detected. Entering HackFest direct mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    />
  );
}

function arePropsEqual(prevProps, nextProps) {
  // If external progressRef is provided, skip re-renders when only progress number changes
  if (nextProps.progressRef && prevProps.progressRef === nextProps.progressRef) {
    return (
      prevProps.isPastIntro === nextProps.isPastIntro &&
      prevProps.onAssetLoaded === nextProps.onAssetLoaded
    );
  }
  return (
    prevProps.progress === nextProps.progress &&
    prevProps.isPastIntro === nextProps.isPastIntro &&
    prevProps.onAssetLoaded === nextProps.onAssetLoaded
  );
}

export default React.memo(CinematicSceneComponent, arePropsEqual);
