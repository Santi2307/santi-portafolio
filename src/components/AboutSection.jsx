import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code,
  Download,
  Rocket,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import usePhotoStore from "@/store";

/* ─────────────────────────── Content ─────────────────────────── */

const PHOTOS = [
  { src: "/images/santi1.jpeg", alt: "Santiago at Seneca Polytechnic" },
  { src: "/images/santi2.jpeg", alt: "Santiago working on a networking lab" },
  { src: "/images/santi3.jpeg", alt: "Santiago in Toronto" },
];

const BIO = [
  "I'm Santiago Delgado, a recent Computer Systems Technology graduate from Seneca Polytechnic in Toronto. I troubleshoot and automate systems with Linux, Ansible, and Docker, and I build clean React interfaces on top of them. My goal: make the environments people work in feel quieter, faster, and more reliable."
];

const SKILLS = [
  {
    icon: Code,
    title: "Web Development",
    description: "Responsive interfaces built with React, Vite, and Tailwind. Comfortable from layout to state management.",
  },
  {
    icon: User,
    title: "UI/UX Design",
    description: "Designing interfaces that feel intentional — clear hierarchy, motion that serves the content, no decoration for its own sake.",
  },
  {
    icon: Briefcase,
    title: "Project Management",
    description: "Leading projects from concept to delivery with agile methodologies and clear, written communication.",
  },
  {
    icon: Rocket,
    title: "Systems & Networking",
    description: "Linux, Windows, macOS administration. Networking with Cisco and Aruba. Automation with Ansible and Docker.",
  },
];

const STATS = [
  { value: 3.7, suffix: "/4.0", label: "GPA at Seneca" },
  { value: 2,   suffix: "+",    label: "Years in IT support" },
  { value: 6,   suffix: "",     label: "Semesters of systems work" },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 80;
const EASE_OUT = [0.22, 1, 0.36, 1];

/* ─────────────────────────── Stat counter ─────────────────────────── */

const StatCounter = ({ value, suffix, label, inView, delay = 0 }) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 80 });
  const isFloat = value % 1 !== 0;
  const display = useTransform(spring, (latest) =>
    isFloat ? latest.toFixed(1) : Math.round(latest).toString()
  );

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => motionValue.set(value), delay);
      return () => clearTimeout(t);
    }
  }, [inView, value, delay, motionValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="text-center"
    >
      <div className="flex items-baseline justify-center gap-0.5">
        <motion.span className="text-2xl md:text-3xl font-bold tabular-nums">
          {display}
        </motion.span>
        <span className="text-base md:text-lg text-primary font-semibold">
          {suffix}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
    </motion.div>
  );
};

/* ─────────────────────────── Skill card ─────────────────────────── */

const SkillCard = ({ skill, index }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  // Cursor-tracked motion values (raw pixels for the glow, normalized for tilt)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltSource = { stiffness: 200, damping: 22 };
  const rotateX = useSpring(useMotionValue(0), tiltSource);
  const rotateY = useSpring(useMotionValue(0), tiltSource);

  const handleMouseMove = useCallback(
    (e) => {
      if (reducedMotion) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      mouseX.set(px);
      mouseY.set(py);
      // Normalized [-0.5, 0.5] → tilt range ±7deg
      const nx = px / rect.width - 0.5;
      const ny = py / rect.height - 0.5;
      rotateX.set(-ny * 14);
      rotateY.set(nx * 14);
    },
    [mouseX, mouseY, rotateX, rotateY, reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const glow = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.18), transparent 65%)`;

  const Icon = skill.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.6, ease: EASE_OUT }}
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card/50 p-6 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5"
      role="listitem"
    >
      {/* Cursor-following glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glow }}
      />

      <div
        className="relative z-10 flex items-start gap-4"
        style={{ transform: "translateZ(20px)" }}
      >
        <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="text-left">
          <h4 className="mb-1 font-semibold">{skill.title}</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {skill.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────── Photo gallery ─────────────────────────── */

const PhotoGallery = () => {
  const { photos, currentPhotoIndex, setNextPhoto, setPrevPhoto } = usePhotoStore();
  const reducedMotion = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  const next = useCallback(() => {
    setDirection(1);
    setNextPhoto();
  }, [setNextPhoto]);

  const prev = useCallback(() => {
    setDirection(-1);
    setPrevPhoto();
  }, [setPrevPhoto]);

  // Autoplay (pause on hover, focus, or reduced motion)
  useEffect(() => {
    if (isPaused || reducedMotion || photos.length <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, reducedMotion, photos.length, next]);

  // Keyboard nav — only when the gallery has focus within
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onKey = (e) => {
      if (!node.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!photos.length) return null;

  const current = photos[currentPhotoIndex];

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
  };

  return (
    <div
      ref={containerRef}
      className="group relative mx-auto aspect-square w-full max-w-sm md:mx-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos of Santiago"
    >
      {/* Soft backdrop glow */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 opacity-70 blur-2xl"
      />

      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-primary/20">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.img
            key={current.src ?? current}
            src={current.src ?? current}
            alt={current.alt ?? `Photo ${currentPhotoIndex + 1}`}
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover"
            variants={slideVariants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EASE_OUT }}
            drag={photos.length > 1 && !reducedMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > SWIPE_THRESHOLD) prev();
              else if (info.offset.x < -SWIPE_THRESHOLD) next();
            }}
          />
        </AnimatePresence>

        {/* Gradient overlay for control legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        />

        {/* Controls */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur"
            role="tablist"
            aria-label="Photo indicators"
          >
            {photos.map((_, i) => (
              <span
                key={i}
                role="tab"
                aria-current={i === currentPhotoIndex}
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentPhotoIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/40"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Screen-reader announcement on slide change */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Photo {currentPhotoIndex + 1} of {photos.length}
      </span>
    </div>
  );
};

/* ─────────────────────────── Main section ─────────────────────────── */

export const AboutSection = () => {
  const { setPhotos } = usePhotoStore();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Populate the photo store on mount. Synchronous — no fake loading delay.
  useEffect(() => {
    setPhotos(PHOTOS);
  }, [setPhotos]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-24"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          id="about-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-12 text-center text-3xl font-bold md:text-4xl"
        >
          About{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Me
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          {/* Left: photos, bio, stats, buttons */}
          <div className="space-y-6">
            <PhotoGallery />

            <div className="space-y-4">
              {BIO.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                  className="leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-2 rounded-2xl border border-primary/10 bg-card/40 px-2 py-4 backdrop-blur-sm"
              role="list"
              aria-label="Quick stats"
            >
              {STATS.map((stat, i) => (
                <StatCounter
                  key={stat.label}
                  {...stat}
                  inView={inView}
                  delay={400 + i * 120}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center md:justify-start"
            >
              <a href="#contact" className="cosmic-button" aria-label="Get in touch">
                Get In Touch
              </a>
              <a
                href="/Santiago_Delgado_Resume.pdf"
                download
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-6 py-2 text-primary transition-colors duration-300 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label="Download my CV (PDF)"
              >
                <Download size={16} aria-hidden="true" />
                Download CV
              </a>
            </motion.div>
          </div>

          {/* Right: skill cards */}
          <div className="grid grid-cols-1 gap-4" role="list" aria-label="Areas of expertise">
            {SKILLS.map((skill, i) => (
              <SkillCard key={skill.title} skill={skill} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
