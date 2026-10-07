import React, { useEffect, useRef, memo } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import './Galaxy.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 2.0
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

// Fast pseudo-random hash
float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

// Optimized star glow with gentle flare
float Star(vec2 uv, float flare) {
  float d = length(uv);
  if (d > 0.65) return 0.0;
  
  float m = (0.045 * uGlowIntensity) / max(d, 0.007);
  
  if (flare > 0.035) {
    float rays = smoothstep(0.0, 1.0, 1.0 - min(abs(uv.x * uv.y * 700.0), 1.0));
    m += rays * flare * uGlowIntensity;
    vec2 rotUv = uv * MAT45;
    rays = smoothstep(0.0, 1.0, 1.0 - min(abs(rotUv.x * rotUv.y * 700.0), 1.0));
    m += rays * 0.3 * flare * uGlowIntensity;
  }
  
  m *= smoothstep(0.65, 0.08, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.85, 1.0, size) * glossLocal;

      // Fast cosine color palette matching Hackfest cyber theme
      vec3 base = 0.5 + 0.5 * cos(6.28318 * (seed + vec3(0.0, 0.33, 0.67) + uHueShift / 360.0));
      base = mix(vec3(0.9, 0.95, 1.0), base, uSaturation);

      vec2 pad = vec2(
        tris(seed * 34.0 + uTime * uSpeed * 0.1),
        tris(seed * 38.0 + uTime * uSpeed * 0.033)
      ) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      if (star > 0.001) {
        float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
        twinkle = mix(1.0, twinkle, uTwinkleIntensity);
        col += (star * twinkle * size) * base;
      }
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  // Rotation matrix for the star field
  float autoRotAngle = uTime * uRotationSpeed;
  float c = cos(autoRotAngle);
  float s = sin(autoRotAngle);
  mat2 autoRot = mat2(c, -s, s, c);
  mat2 rot = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x);

  // Apply rotation to UV coordinates
  uv = rot * (autoRot * uv);

  // Accurate mouse tracking: transform mouse into the same rotated star coordinate space
  // This guarantees stars part EXACTLY under the mouse cursor without rotational drift!
  vec2 mouseScreen = (uMouse * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseStar = rot * (autoRot * mouseScreen);

  if (uAutoCenterRepulsion > 0.0) {
    float centerDist = length(uv);
    vec2 repulsion = normalize(uv) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 diff = uv - mouseStar;
    float mouseDist = max(length(diff), 0.005);
    
    // Smooth bell-curve repulsion: stars part smoothly without jumping or lagging
    float radius = 0.42;
    float force = uRepulsionStrength * smoothstep(radius, 0.0, mouseDist);
    uv += (diff / mouseDist) * force * 0.07 * uMouseActiveFactor;
  } else {
    vec2 mouseNorm = uMouse - vec2(0.5);
    uv += mouseNorm * 0.08 * uMouseActiveFactor;
  }

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(18.0 * uDensity, 1.0 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.85, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.25, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

function GalaxyComponent({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.35,
  density = 1.0,
  hueShift = 160,
  disableAnimation = false,
  speed = 0.8,
  mouseInteraction = true,
  glowIntensity = 0.35,
  saturation = 0.5,
  mouseRepulsion = true,
  repulsionStrength = 1.8,
  twinkleIntensity = 0.35,
  rotationSpeed = 0.03,
  autoCenterRepulsion = 0,
  transparent = true,
  lightMode = false,
  className = '',
  style = {},
  ...rest
}) {
  const ctnDom = useRef(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);

  // Extract primitive numbers to prevent array reference recreation triggers
  const fx = Array.isArray(focal) ? focal[0] : 0.5;
  const fy = Array.isArray(focal) ? focal[1] : 0.5;
  const rx = Array.isArray(rotation) ? rotation[0] : 1.0;
  const ry = Array.isArray(rotation) ? rotation[1] : 0.0;

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;

    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      antialias: false
    });
    const gl = renderer.gl;

    if (lightMode) {
      gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    function resize() {
      const isMobile = window.innerWidth < 768;
      const perfScale = isMobile ? 0.6 : 0.75;
      const width = Math.max(ctn.offsetWidth || window.innerWidth, 100);
      const height = Math.max(ctn.offsetHeight || window.innerHeight, 100);

      renderer.setSize(Math.floor(width * perfScale), Math.floor(height * perfScale));

      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / (gl.canvas.height || 1)
        );
      }
    }

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 80);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / (gl.canvas.height || 1))
        },
        uFocal: { value: new Float32Array([fx, fy]) },
        uRotation: { value: new Float32Array([rx, ry]) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y])
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId;
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    function update(t) {
      animateId = requestAnimationFrame(update);
      if (!isVisible) return;

      if (!disableAnimation) {
        program.uniforms.uTime.value = t * 0.001;
        program.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed) / 10.0;
      }

      // Fast, responsive lerp: 0.20 eliminates trailing mouse lag completely
      const lerpFactor = 0.20;
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;

      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    // Fast mouse tracking with zero layout reflow
    function handleMouseMove(e) {
      const x = e.clientX / (window.innerWidth || 1);
      const y = 1.0 - e.clientY / (window.innerHeight || 1);
      targetMousePos.current.x = x;
      targetMousePos.current.y = y;
      targetMouseActive.current = 1.0;
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0;
    }

    // Touch support for mobile phones
    function handleTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const x = touch.clientX / (window.innerWidth || 1);
        const y = 1.0 - touch.clientY / (window.innerHeight || 1);
        targetMousePos.current.x = x;
        targetMousePos.current.y = y;
        targetMouseActive.current = 1.0;
      }
    }

    function handleTouchEnd() {
      targetMouseActive.current = 0.0;
    }

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      window.addEventListener('touchstart', handleTouchMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animateId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchstart', handleTouchMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
      if (gl.canvas && ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    fx,
    fy,
    rx,
    ry,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    transparent,
    lightMode
  ]);

  return (
    <div
      ref={ctnDom}
      className={`galaxy-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        ...style
      }}
      {...rest}
    />
  );
}

const Galaxy = memo(GalaxyComponent);
export default Galaxy;
