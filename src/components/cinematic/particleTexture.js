import * as THREE from 'three';

let cachedTexture = null;

/**
 * Returns a high-quality soft circular glow particle texture
 * generated procedurally on a 64x64 canvas.
 */
export function getGlowParticleTexture() {
  if (cachedTexture) return cachedTexture;

  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.75)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.25)');
  gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.generateMipmaps = true;
  return cachedTexture;
}
