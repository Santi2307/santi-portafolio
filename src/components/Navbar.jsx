import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu,
  X,
  Home,
  User,
  Lightbulb,
  Briefcase,
  Mail,
  Command,
  Search,
  ArrowUp,
  CornerDownLeft,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";

// Alias para evitar el bug de esbuild parseando "motion.li" como regex.
const MotionLi = motion.li;

/* ═══════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════ */

const navItems = [
  {
    name: "Home",
    href: "#hero",
    icon: Home,
    shortcut: "1",
    description: "Welcome page",
  },
  {
    name: "About",
    href: "#about",
    icon: User,
    shortcut: "2",
    description: "My story",
  },
  {
    name: "Skills",
    href: "#skills",
    icon: Lightbulb,
    shortcut: "3",
    description: "Tech stack",
  },
  {
    name: "Projects",
    href: "#projects",
    icon: Briefcase,
    shortcut: "4",
    description: "Selected work",
  },
  {
    name: "Contact",
    href: "#contact",
    icon: Mail,
    shortcut: "5",
    description: "Get in touch",
  },
];

const SPRING_FAST = { type: "spring", stiffness: 400, damping: 30 };
const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 28 };
const EASE_VERCEL = [0.32, 0.72, 0, 1];

/* ═══════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════ */

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      setProgress(Math.min(Math.max(p, 0), 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
};

const useActiveSection = (items) => {
  const [active, setActive] = useState(items[0].href.substring(1));
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.href.substring(1)))
      .filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);
  return active;
};

const useKeyboardNav = ({ onOpenPalette, onJump, paletteOpen }) => {
  useEffect(() => {
    const onKey = (e) => {
      const isInput =
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }
      if (paletteOpen || isInput) return;

      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= navItems.length) {
        e.preventDefault();
        onJump(navItems[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenPalette, onJump, paletteOpen]);
};

/* ═══════════════════════════════════════════════════════════════════════
   CURSOR SPOTLIGHT — radial gradient anclado al cursor dentro de la pill
   ═══════════════════════════════════════════════════════════════════════ */

const CursorSpotlight = ({ containerRef }) => {
  const mouseX = useMotionValue(-300);
  const mouseY = useMotionValue(-300);
  const opacity = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouseX.set(e.clientX - r.left);
      mouseY.set(e.clientY - r.top);
    };
    const onEnter = () => opacity.set(1);
    const onLeave = () => opacity.set(0);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef, mouseX, mouseY, opacity]);

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(200px circle at ${x}px ${y}px, rgba(139,92,246,0.22), transparent 65%)`,
  );

  return (
    <motion.div
      aria-hidden
      style={{ background, opacity }}
      className="pointer-events-none absolute inset-0 rounded-full"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAGNETIC WRAPPER — los hijos se atraen suavemente hacia el cursor
   ═══════════════════════════════════════════════════════════════════════ */

const Magnetic = ({ children, strength = 0.3, className }) => {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 14 });
  const y = useSpring(0, { stiffness: 220, damping: 14 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL RING — anillo de progreso de scroll alrededor del logo
   ═══════════════════════════════════════════════════════════════════════ */

const ScrollRing = ({ progress }) => {
  const C = 2 * Math.PI * 18; // perímetro
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className="absolute inset-0 -rotate-90"
      style={{ width: "100%", height: "100%" }}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1.5"
      />
      <motion.circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="url(#ring-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={C}
        animate={{ strokeDashoffset: C * (1 - progress) }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
      />
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED CONIC BORDER — halo cónico que rota lento alrededor de la pill
   ═══════════════════════════════════════════════════════════════════════ */

const ConicBorder = () => (
  <motion.span
    aria-hidden
    className="pointer-events-none absolute -inset-px rounded-full opacity-60"
    style={{
      background:
        "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.6) 50deg, rgba(217,70,239,0.5) 110deg, transparent 180deg, transparent 360deg)",
      WebkitMask:
        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      padding: 1,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
  />
);

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP NAV LINK — con preview tooltip + magnetismo + active pill
   ═══════════════════════════════════════════════════════════════════════ */

const DesktopNavLink = ({ item, isActive }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Magnetic strength={0.2} className="relative">
      <motion.a
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        initial="rest"
        whileHover="hover"
        animate="rest"
        whileTap={{ scale: 0.94 }}
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
          isActive ? "text-white" : "text-foreground/60 hover:text-foreground",
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-pill"
            transition={SPRING_FAST}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/40"
          />
        )}
        <motion.span
          variants={{
            rest: { scale: 1, rotate: 0, y: 0 },
            hover: { scale: 1.2, rotate: -8, y: -1 },
          }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          className="relative z-10 inline-flex"
        >
          <Icon size={15} strokeWidth={2.25} />
        </motion.span>
        <span className="relative z-10">{item.name}</span>
      </motion.a>

      {/* Preview tooltip */}
      <AnimatePresence>
        {hovered && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-card/95 px-3 py-1.5 text-xs backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="text-foreground/90">{item.description}</span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground/60">
                {item.shortcut}
              </kbd>
            </div>
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-card/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </Magnetic>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   COMMAND PALETTE (⌘K) — modal de búsqueda con fuzzy filter
   ═══════════════════════════════════════════════════════════════════════ */

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[selectedIdx]) {
        window.location.hash = results[selectedIdx].href;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, results, selectedIdx, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="fixed left-1/2 top-[20vh] z-[70] w-[90%] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search size={16} className="text-foreground/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Jump to section..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/40 outline-none"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground/50">
                ESC
              </kbd>
            </div>

            <div className="relative max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-foreground/50">
                  No results for "{query}"
                </div>
              ) : (
                results.map((item, i) => {
                  const Icon = item.icon;
                  const isSelected = i === selectedIdx;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-white/10 text-foreground"
                          : "text-foreground/70 hover:bg-white/5",
                      )}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="palette-cursor"
                          transition={SPRING_FAST}
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/15 to-violet-500/15 ring-1 ring-indigo-400/30"
                        />
                      )}
                      <Icon size={16} className="relative z-10" />
                      <span className="relative z-10 font-medium">
                        {item.name}
                      </span>
                      <span className="relative z-10 text-xs text-foreground/40">
                        {item.description}
                      </span>
                      <kbd className="relative z-10 ml-auto rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-foreground/50">
                        {item.shortcut}
                      </kbd>
                      {isSelected && (
                        <CornerDownLeft
                          size={12}
                          className="relative z-10 text-foreground/40"
                        />
                      )}
                    </a>
                  );
                })
              )}
            </div>

            <div className="relative flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-foreground/40">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono">
                    ↵
                  </kbd>
                  open
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command size={10} />
                <span>K</span>
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE NAV LINK + DRAWER
   ═══════════════════════════════════════════════════════════════════════ */

const mobileItemVariants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: SPRING_SOFT },
};

const MobileNavLink = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <MotionLi variants={mobileItemVariants} className="px-2">
      <a
        href={item.href}
        onClick={onClick}
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 transition-colors",
          isActive ? "text-white" : "text-foreground/80 hover:bg-white/5",
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-mobile"
            transition={SPRING_FAST}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/90 to-violet-500/90 shadow-lg shadow-indigo-500/30"
          />
        )}
        <Icon size={18} className="relative z-10" strokeWidth={2.25} />
        <span className="relative z-10 font-medium">{item.name}</span>
        <kbd className="relative z-10 ml-auto rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/70">
          {item.shortcut}
        </kbd>
      </a>
    </MotionLi>
  );
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const MobileDrawer = ({ isOpen, onClose, activeSection }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-modal="true"
            className="md:hidden fixed top-4 right-4 bottom-4 z-50 w-[82%] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10"
          >
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
                  Navigation
                </span>
                <span className="text-[10px] text-foreground/40 mt-0.5">
                  Tap any section
                </span>
              </div>
              <motion.button
                onClick={onClose}
                aria-label="Close menu"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-full p-2 ring-1 ring-white/10 hover:bg-white/5 transition"
              >
                <X size={18} />
              </motion.button>
            </div>

            <nav className="relative px-2 pb-6">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    isActive={activeSection === item.href.substring(1)}
                    onClick={onClose}
                  />
                ))}
              </motion.ul>
            </nav>

            <div className="absolute bottom-0 inset-x-0 border-t border-white/10 px-6 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-[10px] text-foreground/40">
                <span>Santiago Delgado</span>
                <span>Toronto, ON</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   BACK TO TOP — aparece después de scroll
   ═══════════════════════════════════════════════════════════════════════ */

const BackToTop = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 20 }}
        transition={SPRING_FAST}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-card/80 text-foreground backdrop-blur-xl shadow-lg shadow-black/30 hover:bg-card transition-colors"
      >
        <ArrowUp size={18} />
      </motion.button>
    )}
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR (root)
   ═══════════════════════════════════════════════════════════════════════ */

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);
  const scrollDirection = useScrollDirection();
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(navItems);
  const pillRef = useRef(null);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);
  const jumpTo = useCallback((item) => {
    window.location.hash = item.href;
  }, []);

  useKeyboardNav({
    onOpenPalette: openPalette,
    onJump: jumpTo,
    paletteOpen: isPaletteOpen,
  });

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHidden =
    scrollDirection === "down" && scrolledPast && !isMenuOpen && !isPaletteOpen;

  return (
    <>
      <motion.header
        animate={{ y: isHidden ? -120 : 0 }}
        transition={{ type: "tween", duration: 0.35, ease: EASE_VERCEL }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">
          {/* ─── LOGO con scroll-progress ring ─── */}
          <Magnetic strength={0.15}>
            <motion.a
              href="#hero"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex items-center gap-2.5 rounded-full pr-2 text-lg font-extrabold tracking-tight"
            >
              <span className="relative flex h-10 w-10 items-center justify-center">
                <ScrollRing progress={scrollProgress} />
                <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40">
                  <span className="text-xs font-black">S</span>
                </span>
              </span>
              <motion.span
                className="hidden sm:inline bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent"
                style={{ backgroundSize: "200% auto" }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                Santiago
              </motion.span>
            </motion.a>
          </Magnetic>

          {/* ─── FLOATING PILL (desktop) ─── */}
          <div className="hidden md:block relative">
            <motion.div
              ref={pillRef}
              animate={{
                backgroundColor: scrolledPast
                  ? "rgba(15, 15, 20, 0.65)"
                  : "rgba(15, 15, 20, 0.4)",
              }}
              transition={{ duration: 0.4 }}
              className="relative rounded-full border border-white/10 backdrop-blur-2xl shadow-xl shadow-black/20"
            >
              <ConicBorder />
              <CursorSpotlight containerRef={pillRef} />
              <div className="relative flex items-center gap-1 p-1.5">
                {navItems.map((item) => (
                  <DesktopNavLink
                    key={item.href}
                    item={item}
                    isActive={activeSection === item.href.substring(1)}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT CONTROLS ─── */}
          <div className="flex items-center gap-2">
            {/* ⌘K button — desktop only */}
            <motion.button
              onClick={openPalette}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open command palette"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-3 py-2 text-xs text-foreground/60 backdrop-blur-xl hover:text-foreground hover:bg-card/80 transition-colors"
            >
              <Search size={13} />
              <span>Search</span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </motion.button>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="md:hidden relative inline-flex items-center justify-center rounded-full border border-white/10 bg-card/60 p-2.5 backdrop-blur-xl"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeSection={activeSection}
      />
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
      <BackToTop
        visible={scrollProgress > 0.3 && !isMenuOpen && !isPaletteOpen}
      />
    </>
  );
};
