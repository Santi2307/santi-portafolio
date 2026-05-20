import { useEffect, useMemo, useState } from "react";
 
/* One star per ~12,000 px² is a calm, balanced density. */
const DEFAULT_DENSITY = 12000;
const MIN_STARS = 30;
const MAX_STARS = 160;
 
export const StarBackground = ({ density = DEFAULT_DENSITY, className = "" }) => {
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined"
      ? { w: window.innerWidth, h: window.innerHeight }
      : { w: 1440, h: 900 }
  );
 
  /* Debounced resize — avoids re-generating stars on every pixel of drag. */
  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setViewport({ w: window.innerWidth, h: window.innerHeight });
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);
 
  /* Re-generate only when the viewport actually changes. */
  const stars = useMemo(() => {
    const count = Math.max(
      MIN_STARS,
      Math.min(MAX_STARS, Math.floor((viewport.w * viewport.h) / density))
    );
 
    return Array.from({ length: count }, (_, id) => {
      const isAccent = Math.random() < 0.18; // ~18% are the brighter tier
      const opacity  = isAccent
        ? 0.6 + Math.random() * 0.3   // 0.60 – 0.90
        : 0.2 + Math.random() * 0.4;  // 0.20 – 0.60
 
      return {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isAccent
          ? 1.5 + Math.random() * 1.2   // 1.5 – 2.7 px
          : 0.5 + Math.random() * 0.9,  // 0.5 – 1.4 px
        opacity,
        duration: 3 + Math.random() * 3, // 3 – 6 s
        delay: -Math.random() * 6,       // negative → stars start mid-cycle
        accent: isAccent,
      };
    });
  }, [viewport, density]);
 
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Scoped keyframes — no global CSS needed. */}
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--o-min); }
          50%      { opacity: var(--o-max); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-star {
            animation: none !important;
            opacity: var(--o-max) !important;
          }
        }
      `}</style>
 
      {stars.map((s) => (
        <span
          key={s.id}
          className="sb-star absolute rounded-full bg-white"
          style={{
            left:   `${s.x}%`,
            top:    `${s.y}%`,
            width:  `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: s.accent
              ? `0 0 ${s.size * 2.5}px rgba(255, 255, 255, 0.55)`
              : "none",
            "--o-min": s.opacity * 0.35,
            "--o-max": s.opacity,
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};
 
export default StarBackground;
