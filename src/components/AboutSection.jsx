import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import usePhotoStore from "@/store";

/* ─────────────────────────── Content ─────────────────────────── */

const PHOTOS = [
  { src: "/images/santi1.jpeg", alt: "Santiago at Seneca Polytechnic" },
  { src: "/images/santi2.jpeg", alt: "Santiago working on a networking lab" },
  { src: "/images/santi3.jpeg", alt: "Santiago in Toronto" },
];

const META = [
  { label: "Based in",    value: "Toronto, Canada" },
  { label: "From",        value: "Bucaramanga, Colombia" },
  { label: "Education",   value: "Seneca Polytechnic · CST" },
  { label: "Languages",   value: "Spanish · English" },
];

const BIO = [
  "I'm Santiago Delgado, a recent Computer Systems Technology graduate from Seneca Polytechnic in Toronto. I troubleshoot and automate systems with Linux, Ansible, and Docker, and I build clean React interfaces on top of them.",
  "My focus is making the environments people work in feel quieter, faster, and more reliable — whether that's a network rack, a customer's laptop, or a web app. I think the best technology is the kind that disappears.",
  "I moved from Colombia to Canada in 2023 to study, and I've stayed because Toronto has a quiet seriousness about building things well. I want to keep doing that here.",
];

const SKILLS = [
  {
    number: "01",
    title: "Systems & Infrastructure",
    summary: "Linux, Windows, macOS administration with automation.",
    detail:
      "Daily work in RHEL and Ubuntu — LVM, NFS, SELinux, Podman, autofs. I automate everything I can with Ansible playbooks, and I'm comfortable with Docker, OpenShift, and Azure Virtual Desktop in production environments.",
    tags: ["Linux", "Ansible", "Docker", "OpenShift", "Azure"],
  },
  {
    number: "02",
    title: "Networking",
    summary: "Designing and configuring networks that actually stay up.",
    detail:
      "Hands-on with Aruba AOS-CX and 2530 switches — VLANs, OSPF, LAG/LACP, DHCP. I designed RF infrastructure for an underserved community in Santander during my Tigo Colombia internship, calculating EIRP, Fresnel zones, and link budgets.",
    tags: ["Cisco", "Aruba", "VLANs", "OSPF", "RF Engineering"],
  },
  {
    number: "03",
    title: "Web Development",
    summary: "Interfaces built with React, Vite, and Tailwind.",
    detail:
      "I build the kind of interfaces I want to use — fast, accessible, with motion that serves the content. My portfolio is a small example: React with Zustand for state, Framer Motion for animation, and Tailwind for styling.",
    tags: ["React", "Vite", "Tailwind", "Zustand", "Framer Motion"],
  },
  {
    number: "04",
    title: "IT Support",
    summary: "Nearly two years helping people make tech feel less hostile.",
    detail:
      "As a Student Support Ambassador at Seneca, I helped students with accessibility needs navigate hardware, software, and the small frustrations that get in the way of their work. Patient troubleshooting and clear written communication are the parts of the job I enjoy most.",
    tags: ["Troubleshooting", "Accessibility", "Documentation"],
  },
];

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 80;
const EASE_OUT = [0.22, 1, 0.36, 1];

/* ─────────────────────────── Photo gallery ─────────────────────────── */

const PhotoGallery = () => {
  const { photos, currentPhotoIndex, setNextPhoto, setPrevPhoto } =
    usePhotoStore();
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

  useEffect(() => {
    if (isPaused || reducedMotion || photos.length <= 1) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, reducedMotion, photos.length, next]);

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
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos of Santiago"
    >
      {/* Frame number — top left */}
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>
          <span className="text-foreground">
            {String(currentPhotoIndex + 1).padStart(2, "0")}
          </span>
          <span className="opacity-40"> / {String(photos.length).padStart(2, "0")}</span>
        </span>
        <span className="opacity-50">Frame</span>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg ring-1 ring-border">
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
            transition={{ duration: 0.6, ease: EASE_OUT }}
            drag={photos.length > 1 && !reducedMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > SWIPE_THRESHOLD) prev();
              else if (info.offset.x < -SWIPE_THRESHOLD) next();
            }}
          />
        </AnimatePresence>

        {/* Caption bar overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.alt}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-4 right-4 z-10 text-xs text-white/80"
          >
            {current.alt}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls below */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1" role="tablist" aria-label="Photo indicators">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              onClick={() => {
                setDirection(i > currentPhotoIndex ? 1 : -1);
                // jump to specific index — uses sequential next/prev to stay simple
                const diff = i - currentPhotoIndex;
                if (diff > 0) for (let k = 0; k < diff; k++) setNextPhoto();
                else for (let k = 0; k < -diff; k++) setPrevPhoto();
              }}
              aria-current={i === currentPhotoIndex}
              aria-label={`Go to photo ${i + 1}`}
              className={cn(
                "h-px transition-all duration-500",
                i === currentPhotoIndex
                  ? "w-12 bg-foreground"
                  : "w-6 bg-muted-foreground/40 hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Screen-reader live region */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Photo {currentPhotoIndex + 1} of {photos.length}
      </span>
    </div>
  );
};

/* ─────────────────────────── Skill row (editorial style) ─────────────────────────── */

const SkillRow = ({ skill, index, isOpen, onToggle }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  // Cursor-following spotlight (subtle)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const onMouseMove = useCallback(
    (e) => {
      if (reducedMotion) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY, reducedMotion]
  );

  const glow = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, hsl(var(--primary) / 0.07), transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.6, ease: EASE_OUT }}
      className="group relative border-t border-border last:border-b"
    >
      {/* Cursor spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glow }}
      />

      <button
        type="button"
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`skill-detail-${index}`}
        className="relative z-10 grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-6 px-1 py-6 text-left transition-colors hover:text-foreground"
      >
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {skill.number}
        </span>

        <div>
          <h4 className="text-lg font-semibold leading-tight md:text-xl">
            {skill.title}
          </h4>
          <p
            className={cn(
              "mt-1 text-sm text-muted-foreground transition-opacity duration-300",
              isOpen && "opacity-0 md:opacity-60"
            )}
          >
            {skill.summary}
          </p>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden
        >
          <Plus size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`skill-detail-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="relative z-10 overflow-hidden"
          >
            <div className="grid grid-cols-[auto_1fr_auto] gap-6 px-1 pb-6">
              <span aria-hidden /> {/* spacer to align with number column */}
              <div className="max-w-2xl space-y-3">
                <p className="text-sm leading-relaxed text-foreground/80">
                  {skill.detail}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span aria-hidden /> {/* spacer to align with plus column */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────── Meta strip (Based in / From / etc.) ─────────────────────────── */

const MetaStrip = ({ inView }) => (
  <motion.dl
    initial={{ opacity: 0, y: 20 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ delay: 0.4, duration: 0.6, ease: EASE_OUT }}
    className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-6 sm:grid-cols-4"
  >
    {META.map((m) => (
      <div key={m.label}>
        <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {m.label}
        </dt>
        <dd className="mt-1 text-sm font-medium text-foreground">{m.value}</dd>
      </div>
    ))}
  </motion.dl>
);

/* ─────────────────────────── Main section ─────────────────────────── */

export const AboutSection = () => {
  const { setPhotos } = usePhotoStore();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Open the first skill by default — invites interaction without forcing it
  const [openSkill, setOpenSkill] = useState(0);
  const handleToggleSkill = useCallback((index) => {
    setOpenSkill((current) => (current === index ? -1 : index));
  }, []);

  useEffect(() => {
    setPhotos(PHOTOS);
  }, [setPhotos]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-24 md:py-32"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto max-w-6xl">

        {/* ─── Section header ─── */}
        <div className="mb-16 flex items-end justify-between gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              <span className="text-primary">§ 02</span>
              <span className="mx-2 opacity-40">/</span>
              About
            </motion.p>
            <motion.h2
              id="about-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              The story <br className="hidden sm:block" />
              behind the work.
            </motion.h2>
          </div>

          {/* Right-aligned hint, desktop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground md:block"
          >
            Click any expertise area below to read more about how I work in it.
          </motion.div>
        </div>

        {/* ─── Two-column body ─── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">

          {/* LEFT — photos + meta + bio + CTAs */}
          <div className="md:col-span-5 lg:col-span-5">
            <PhotoGallery />

            <div className="mt-10">
              <MetaStrip inView={inView} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 space-y-4"
            >
              {BIO.map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="text-[15px] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                Get in touch
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="/Santiago_Delgado_Resume.pdf"
                download
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                <Download size={14} aria-hidden="true" />
                Download CV
              </a>
            </motion.div>
          </div>

          {/* RIGHT — expertise list (editorial style) */}
          <div className="md:col-span-7 lg:col-span-7">
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Expertise
            </motion.p>

            <div role="list" aria-label="Areas of expertise">
              {SKILLS.map((skill, i) => (
                <SkillRow
                  key={skill.title}
                  skill={skill}
                  index={i}
                  isOpen={openSkill === i}
                  onToggle={handleToggleSkill}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
