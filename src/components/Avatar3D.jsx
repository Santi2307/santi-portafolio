// =============================================================================
// Avatar3D.jsx — Particle portrait with custom shaders + spring physics
// -----------------------------------------------------------------------------
// Place in src/components/Avatar3D.jsx
// Requires: three @^0.169  ·  @react-three/fiber @^8.17  ·  /public/me.jpg
//
// Architecture:
//   1. Image is sampled to extract dark-pixel candidates → particle attributes
//   2. JS runs per-particle physics each frame (springs + damping + repulsion)
//   3. Custom GLSL shaders render soft circular particles with depth + assembly
//   4. Pointer events drive a smoothed mouse position with fade in/out
// =============================================================================

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const IMAGE_SRC = "/me.jpg";

/* ─────────────────────────── Tunables ─────────────────────────── */

const TARGET_PARTICLES = 1200;
const BRIGHTNESS_THRESHOLD = 110; // lower = stricter (only very dark pixels)
const IMAGE_DOWNSCALE = 140;      // max width/height in px for pixel scan

const REPULSION_RADIUS = 0.38;    // world units
const REPULSION_STRENGTH = 0.012; // per-frame force scalar
const RETURN_SPRING = 0.05;       // pull toward original position
const VELOCITY_DAMPING = 0.86;    // 0..1, higher = more momentum

const POINTER_LERP = 0.18;        // mouse smoothing
const ACTIVITY_LERP = 0.08;       // hover-strength fade in/out

const DEPTH_RANGE = 0.18;         // how much darker pixels pop forward
const SIZE_VARIATION = 0.7;       // per-particle size variation by darkness
const BASE_SIZE = 14;             // base point size multiplier

const ASSEMBLY_DURATION_S = 1.8;  // seconds for fly-in
const ASSEMBLY_SPREAD = 2.4;      // how far particles start before assembling

/* ─────────────────────────── GLSL Shaders ─────────────────────────── */

const vertexShader = /* glsl */ `
  attribute vec3 aAssemblyOrigin;
  attribute float aSize;
  attribute float aSeed;

  uniform float uTime;
  uniform float uAssembly;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying float vSeed;

  // Smooth ease-out — particles decelerate as they reach their target
  float easeOutQuart(float t) {
    return 1.0 - pow(1.0 - t, 4.0);
  }

  void main() {
    float assembly = easeOutQuart(clamp(uAssembly, 0.0, 1.0));

    // Interpolate from scattered origin → live simulated position.
    // The 'position' attribute is updated each frame by the JS physics loop.
    vec3 pos = mix(aAssemblyOrigin, position, assembly);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Perspective-correct point sizing: 1/-mvPos.z shrinks particles with distance.
    gl_PointSize = aSize * ${BASE_SIZE.toFixed(1)} * uPixelRatio * (1.0 / -mvPos.z);

    vAlpha = assembly;
    vSeed = aSeed;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vSeed;

  void main() {
    // gl_PointCoord: (0,0) top-left to (1,1) bottom-right within each point.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // Soft circular falloff: opaque core, smooth edge fade.
    float alpha = smoothstep(0.5, 0.32, d);

    // Discard fully transparent fragments — saves fillrate on overlap.
    if (alpha < 0.01) discard;

    // Tiny per-particle brightness variation so it doesn't look mechanical.
    float brightness = 0.92 + vSeed * 0.08;

    gl_FragColor = vec4(vec3(brightness), alpha * vAlpha);
  }
`;

/* ─────────────────────────── Image → particle data ─────────────────────────── */

/**
 * Loads the image, samples its dark pixels, returns typed-array buffers
 * ready to feed into BufferGeometry.
 *
 * Encoding:
 *   - x, y           — normalized image coords (centered around origin)
 *   - z              — darkness-encoded depth (darker pixels pop forward)
 *   - size           — proportional to darkness
 *   - assemblyOrigin — random scattered position for fly-in animation
 */
const loadParticleData = (src, target, threshold) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(
        IMAGE_DOWNSCALE / img.width,
        IMAGE_DOWNSCALE / img.height,
        1
      );
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);

      const { data } = ctx.getImageData(0, 0, w, h);
      const candidates = [];
      const aspect = w / h;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          if (brightness >= threshold) continue;

          // 0 = at threshold (lightest accepted), 1 = pitch black
          const darkness = 1 - brightness / threshold;

          const nx = (x / w - 0.5) * aspect * 2;
          const ny = -(y / h - 0.5) * 2;
          const nz = darkness * DEPTH_RANGE - DEPTH_RANGE * 0.4;

          candidates.push({ x: nx, y: ny, z: nz, darkness });
        }
      }

      if (candidates.length === 0) {
        reject(new Error("No dark pixels found — increase image contrast."));
        return;
      }

      // Partial Fisher–Yates shuffle: random sample without sorting full array.
      const sampleSize = Math.min(target, candidates.length);
      for (let i = 0; i < sampleSize; i++) {
        const j = i + Math.floor(Math.random() * (candidates.length - i));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const sampled = candidates.slice(0, sampleSize);

      const positions = new Float32Array(sampleSize * 3);
      const originals = new Float32Array(sampleSize * 3);
      const assemblyOrigins = new Float32Array(sampleSize * 3);
      const sizes = new Float32Array(sampleSize);
      const seeds = new Float32Array(sampleSize);

      sampled.forEach((p, i) => {
        positions[i * 3 + 0] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
        originals[i * 3 + 0] = p.x;
        originals[i * 3 + 1] = p.y;
        originals[i * 3 + 2] = p.z;

        // Assembly origin: random point on a sphere around the face,
        // squashed in Z so particles fly in mostly from the sides.
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = ASSEMBLY_SPREAD * (0.7 + Math.random() * 0.5);
        assemblyOrigins[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * r;
        assemblyOrigins[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        assemblyOrigins[i * 3 + 2] = Math.cos(phi) * r * 0.3;

        sizes[i] = 0.55 + p.darkness * SIZE_VARIATION;
        seeds[i] = Math.random();
      });

      resolve({ positions, originals, assemblyOrigins, sizes, seeds });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

/* ─────────────────────────── Particle field component ─────────────────────────── */

const ParticleField = ({ data }) => {
  const pointsRef = useRef(null);
  const matRef = useRef(null);

  const startTime = useRef(performance.now());
  const velocities = useRef(new Float32Array(data.positions.length));
  const mouseTarget = useRef(new THREE.Vector2(999, 999));
  const mouseSmooth = useRef(new THREE.Vector2(999, 999));
  const activity = useRef(0);
  const activityTarget = useRef(0);

  const { viewport, gl } = useThree();

  // ─── Pointer events on the WebGL canvas ───────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;

    const setFromClient = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      mouseTarget.current.set(
        (ndcX * viewport.width) / 2,
        (ndcY * viewport.height) / 2
      );
    };

    const onPointerMove = (e) => {
      setFromClient(e.clientX, e.clientY);
      activityTarget.current = 1;
    };
    const onPointerLeave = () => { activityTarget.current = 0; };
    const onPointerEnter = () => { activityTarget.current = 1; };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (!t) return;
      setFromClient(t.clientX, t.clientY);
      activityTarget.current = 1;
    };
    const onTouchEnd = () => { activityTarget.current = 0; };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [gl, viewport]);

  // ─── Uniforms (memoized — never recreated, just mutated) ──────────────
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAssembly: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    }),
    []
  );

  // ─── Per-frame physics simulation ─────────────────────────────────────
  useFrame(() => {
    const elapsedS = (performance.now() - startTime.current) / 1000;
    const assembly = Math.min(elapsedS / ASSEMBLY_DURATION_S, 1);

    mouseSmooth.current.x +=
      (mouseTarget.current.x - mouseSmooth.current.x) * POINTER_LERP;
    mouseSmooth.current.y +=
      (mouseTarget.current.y - mouseSmooth.current.y) * POINTER_LERP;

    activity.current +=
      (activityTarget.current - activity.current) * ACTIVITY_LERP;

    // Mute mouse interaction during assembly so they don't clash.
    const effectiveActivity = activity.current * assembly;

    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const posArr = geom.attributes.position.array;
    const vels = velocities.current;
    const originals = data.originals;

    const mx = mouseSmooth.current.x;
    const my = mouseSmooth.current.y;
    const r2 = REPULSION_RADIUS * REPULSION_RADIUS;
    const active = effectiveActivity;

    // Tight inner loop — typed arrays, no per-frame allocations.
    const len = posArr.length;
    for (let i = 0; i < len; i += 3) {
      const ox = originals[i];
      const oy = originals[i + 1];
      const oz = originals[i + 2];
      const px = posArr[i];
      const py = posArr[i + 1];
      const pz = posArr[i + 2];

      // Spring force toward original position.
      let fx = (ox - px) * RETURN_SPRING;
      let fy = (oy - py) * RETURN_SPRING;
      let fz = (oz - pz) * RETURN_SPRING;

      // Cursor repulsion (only when pointer is engaged).
      if (active > 0.005) {
        const dx = px - mx;
        const dy = py - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d2 / r2;
          const force = falloff * REPULSION_STRENGTH * active;
          fx += (dx / d) * force;
          fy += (dy / d) * force;
        }
      }

      // Verlet-style integration: velocity accumulates and damps over time.
      vels[i]     = (vels[i]     + fx) * VELOCITY_DAMPING;
      vels[i + 1] = (vels[i + 1] + fy) * VELOCITY_DAMPING;
      vels[i + 2] = (vels[i + 2] + fz) * VELOCITY_DAMPING;

      posArr[i]     = px + vels[i];
      posArr[i + 1] = py + vels[i + 1];
      posArr[i + 2] = pz + vels[i + 2];
    }

    geom.attributes.position.needsUpdate = true;

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = elapsedS;
      matRef.current.uniforms.uAssembly.value = assembly;
    }
  });

  const count = data.positions.length / 3;

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={data.positions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-aAssemblyOrigin"
          count={count}
          array={data.assemblyOrigins}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={count}
          array={data.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          count={count}
          array={data.seeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
};

/* ─────────────────────────── Async image loader ─────────────────────────── */

const ParticleLoader = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    loadParticleData(IMAGE_SRC, TARGET_PARTICLES, BRIGHTNESS_THRESHOLD)
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e.message));
    return () => { mounted = false; };
  }, []);

  if (error || !data) return null;
  return <ParticleField data={data} />;
};

/* ─────────────────────────── Public component ─────────────────────────── */

export const Avatar3D = ({ className = "" }) => {
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setSupportsWebGL(!!gl);
    } catch {
      setSupportsWebGL(false);
    }
  }, []);

  // Graceful fallback: WebGL unavailable or image failed to load.
  if (!supportsWebGL || imageError) {
    return (
      <div
        className={`flex aspect-square items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 ${className}`}
      >
        <img
          src={IMAGE_SRC}
          alt="Santiago"
          className="h-full w-full object-cover opacity-90"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.4], fov: 50, near: 0.1, far: 10 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <ParticleLoader />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Avatar3D;
