// =============================================================================
// Avatar3D.jsx — Particle portrait that reacts to the cursor
// -----------------------------------------------------------------------------
// Place in src/components/Avatar3D.jsx
// Requires: npm install three @react-three/fiber @react-three/drei
// Requires an image at /public/me.jpg (or change IMAGE_SRC below)
// =============================================================================

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const IMAGE_SRC = "/me.jpg";
const TARGET_PARTICLES = 1200;
const REPULSION_RADIUS = 0.5;
const REPULSION_STRENGTH = 0.35;
const RETURN_SPEED = 0.08;

/* ─────────────────────────── Image → particle positions ─────────────────────────── */

/**
 * Loads the image, draws it to an offscreen canvas, reads the pixels,
 * and returns an array of 3D positions for each "dark enough" pixel.
 * The total is capped at TARGET_PARTICLES by random sampling.
 */
const loadParticlePositions = (src, target) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Downscale to keep the pixel scan cheap. ~120px wide is plenty.
      const maxDim = 140;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);

      const { data } = ctx.getImageData(0, 0, w, h);
      const candidates = [];

      // Collect every dark-enough pixel as a candidate.
      // brightness = (R + G + B) / 3 ; we want dark pixels = subject.
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          // Threshold tweak: lower = stricter (only very dark pixels become particles)
          if (brightness < 110) {
            // Map pixel coords to a centered 3D space (-aspect/2..+aspect/2, -1..+1)
            const aspect = w / h;
            const nx = (x / w - 0.5) * aspect * 2;
            const ny = -(y / h - 0.5) * 2; // flip Y so the image isn't upside-down
            const nz = (Math.random() - 0.5) * 0.05; // tiny depth for life
            candidates.push([nx, ny, nz]);
          }
        }
      }

      if (candidates.length === 0) {
        reject(new Error("No dark pixels found — increase image contrast."));
        return;
      }

      // Random sample down to the target count (Fisher–Yates partial shuffle).
      const sampleSize = Math.min(target, candidates.length);
      for (let i = 0; i < sampleSize; i++) {
        const j = i + Math.floor(Math.random() * (candidates.length - i));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const sampled = candidates.slice(0, sampleSize);

      // Flatten into a Float32Array for THREE.BufferGeometry.
      const positions = new Float32Array(sampled.length * 3);
      sampled.forEach(([x, y, z], i) => {
        positions[i * 3 + 0] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      });

      resolve(positions);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

/* ─────────────────────────── Particle cloud ─────────────────────────── */

const ParticleFace = ({ positions }) => {
  const pointsRef = useRef(null);
  const mouse3D = useRef(new THREE.Vector3(999, 999, 0));
  const { viewport, mouse } = useThree();

  // Keep the original positions so we can spring back to them.
  const original = useMemo(() => positions.slice(), [positions]);
  // The current animated positions (mutated each frame).
  const current = useMemo(() => positions.slice(), [positions]);

  useFrame(() => {
    // Convert NDC mouse (-1..+1) into our world space.
    mouse3D.current.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );

    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const arr = geom.attributes.position.array;

    const mx = mouse3D.current.x;
    const my = mouse3D.current.y;
    const r2 = REPULSION_RADIUS * REPULSION_RADIUS;

    for (let i = 0; i < arr.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];

      // Distance from current particle to cursor (XY plane).
      const dx = current[i] - mx;
      const dy = current[i + 1] - my;
      const d2 = dx * dx + dy * dy;

      // Inside repulsion zone? Push particle outward, scaled by closeness.
      if (d2 < r2 && d2 > 0.00001) {
        const force = (1 - d2 / r2) * REPULSION_STRENGTH;
        const d = Math.sqrt(d2);
        current[i] += (dx / d) * force;
        current[i + 1] += (dy / d) * force;
      }

      // Spring back toward original position every frame.
      current[i] += (ox - current[i]) * RETURN_SPEED;
      current[i + 1] += (oy - current[i + 1]) * RETURN_SPEED;
      current[i + 2] += (oz - current[i + 2]) * RETURN_SPEED;

      arr[i] = current[i];
      arr[i + 1] = current[i + 1];
      arr[i + 2] = current[i + 2];
    }

    geom.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  );
};

/* ─────────────────────────── Loader wrapper ─────────────────────────── */

const ParticleFaceLoader = () => {
  const [positions, setPositions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    loadParticlePositions(IMAGE_SRC, TARGET_PARTICLES)
      .then((p) => mounted && setPositions(p))
      .catch((e) => mounted && setError(e.message));
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <mesh>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    );
  }

  if (!positions) return null;
  return <ParticleFace positions={positions} />;
};

/* ─────────────────────────── Main exported component ─────────────────────────── */

export const Avatar3D = ({ className = "" }) => {
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  // Detect WebGL availability once on mount (for graceful fallback).
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupportsWebGL(!!gl);
    } catch {
      setSupportsWebGL(false);
    }
  }, []);

  if (!supportsWebGL) {
    return (
      <div
        className={`flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 ${className}`}
      >
        <img
          src={IMAGE_SRC}
          alt="Santiago"
          className="h-full w-full rounded-full object-cover opacity-90"
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.4], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ParticleFaceLoader />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Avatar3D;
