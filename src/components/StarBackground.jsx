import { useEffect, useRef } from "react";

/* Canvas rendering scales to far more stars than DOM nodes ever could. */
const DEFAULT_DENSITY = 4500; // px² per star
const MIN_STARS = 140;
const MAX_STARS = 480;

const MAX_METEORS = 2;
const METEOR_MIN_GAP = 3200; // ms
const METEOR_MAX_GAP = 8000; // ms

const rand = (min, max) => min + Math.random() * (max - min);

export const StarBackground = ({ density = DEFAULT_DENSITY, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let stars = [];
    let meteors = [];
    let nextMeteorAt = 0;
    let rafId = null;
    let lastTime = 0;
    let running = false;
    let resizeTimer;

    const mouse = { x: 0, y: 0 }; // normalized -1..1
    const mouseEased = { x: 0, y: 0 };

    const buildStars = () => {
      const count = Math.round(
        Math.min(MAX_STARS, Math.max(MIN_STARS, (width * height) / density))
      );
      stars = Array.from({ length: count }, () => {
        const depth = rand(0.3, 1); // 0.3 = far, 1 = near — drives size, brightness & parallax
        const isAccent = Math.random() < 0.15;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (isAccent ? rand(1.3, 2.2) : rand(0.5, 1.2)) * (0.6 + depth * 0.6),
          baseAlpha: isAccent ? rand(0.55, 0.9) : rand(0.2, 0.55),
          depth,
          accent: isAccent,
          twinkleSpeed: rand(0.4, 1.3),
          phase: rand(0, Math.PI * 2),
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      if (prefersReducedMotion) drawStars(0);
    };

    const spawnMeteor = (time) => {
      const angle = rand(2.6, 2.9); // down-and-to-the-left diagonal
      const speed = rand(500, 850); // px/s
      meteors.push({
        x: rand(width * 0.1, width * 0.9),
        y: rand(-height * 0.05, height * 0.25),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: rand(70, 140),
        life: 0,
        maxLife: rand(0.6, 1.1),
      });
      nextMeteorAt = time + rand(METEOR_MIN_GAP, METEOR_MAX_GAP);
    };

    function drawStars(time) {
      const easeFactor = 0.06;
      mouseEased.x += (mouse.x - mouseEased.x) * easeFactor;
      mouseEased.y += (mouse.y - mouseEased.y) * easeFactor;

      for (const s of stars) {
        const twinkle = prefersReducedMotion
          ? 1
          : 0.55 + 0.45 * Math.sin(time * 0.001 * s.twinkleSpeed + s.phase);
        const alpha = s.baseAlpha * twinkle;

        const parallax = 14 * s.depth;
        const px = s.x + mouseEased.x * parallax;
        const py = s.y + mouseEased.y * parallax;

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        if (s.accent) {
          ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
          ctx.shadowBlur = s.radius * 4;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    const drawMeteors = (dt) => {
      meteors = meteors.filter(
        (m) =>
          m.life < m.maxLife &&
          m.y < height + 100 &&
          m.x > -100 &&
          m.x < width + 100
      );

      for (const m of meteors) {
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        const fade = 1 - m.life / m.maxLife;
        const dirLen = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / dirLen) * m.length;
        const tailY = m.y - (m.vy / dirLen) * m.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.9 * fade})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 8;
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const frame = (time) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      drawStars(time);

      if (time > nextMeteorAt && meteors.length < MAX_METEORS) {
        spawnMeteor(time);
      }
      drawMeteors(dt);

      if (running) rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onPointerMove = (e) => {
      mouse.x = (e.clientX / width) * 2 - 1;
      mouse.y = (e.clientY / height) * 2 - 1;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };

    resize();
    window.addEventListener("resize", onResize);

    if (!prefersReducedMotion) {
      nextMeteorAt = performance.now() + rand(METEOR_MIN_GAP, METEOR_MAX_GAP);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);
      start();
    }

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [density]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Faint nebula glow for atmosphere, tinted with the theme's primary color. */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary)), transparent)" }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[50vmax] w-[50vmax] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "radial-gradient(closest-side, hsl(var(--primary)), transparent)" }}
      />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default StarBackground;
