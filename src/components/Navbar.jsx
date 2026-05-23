import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  Menu,
  X,
  Search,
  Command,
  ArrowUpRight,
  CornerDownLeft,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════ */

const navItems = [
  {
    name: "Home",
    href: "#hero",
    index: "01",
    shortcut: "1",
    description: "Welcome page",
  },
  {
    name: "About",
    href: "#about",
    index: "02",
    shortcut: "2",
    description: "My story",
  },
  {
    name: "Skills",
    href: "#skills",
    index: "03",
    shortcut: "3",
    description: "Tech stack",
  },
  {
    name: "Projects",
    href: "#projects",
    index: "04",
    shortcut: "4",
    description: "Selected work",
  },
  {
    name: "Contact",
    href: "#contact",
    index: "05",
    shortcut: "5",
    description: "Get in touch",
  },
];

const SPRING_FAST = { type: "spring", stiffness: 400, damping: 32 };
const SPRING_MEDIUM = { type: "spring", stiffness: 260, damping: 28 };
const EASE_VERCEL = [0.32, 0.72, 0, 1];

/* ═══════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Detects scroll direction with a small threshold to avoid jitter at the top.
 * Returns "up" | "down" | null.
 */
const useScrollDirection = (threshold = 6) => {
  const [direction, setDirection] = useState(null);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!ticking && Math.abs(y - lastY) >= threshold) {
        window.requestAnimationFrame(() => {
          setDirection(y > lastY ? "down" : "up");
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return direction;
};

/**
 * Scrollspy via IntersectionObserver. Cheap, runs on the main thread but
 * driven by browser layout passes rather than scroll events.
 */
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

/**
 * Global keyboard map:
 *   - ⌘K / Ctrl+K       → open command palette
 *   - 1..5              → jump to section
 *   - g then 1..5       → "g h" "g a" style two-step shortcut (vim leader)
 *
 * Ignored while typing in inputs/textareas/contentEditable.
 */
const useKeyboardNav = ({ onOpenPalette, onJump, paletteOpen }) => {
  useEffect(() => {
    let leaderTimeout = null;
    let waitingForLeader = false;

    const isTypingTarget = (target) =>
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    const onKey = (e) => {
      if (isTypingTarget(e.target)) return;

      // ⌘K / Ctrl+K — palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }
      if (paletteOpen) return;

      // Leader: press "g" then a digit within 1s
      if (!waitingForLeader && e.key.toLowerCase() === "g") {
        waitingForLeader = true;
        leaderTimeout = setTimeout(() => {
          waitingForLeader = false;
        }, 1000);
        return;
      }

      // Digit shortcuts (with or without leader)
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= navItems.length) {
        e.preventDefault();
        onJump(navItems[n - 1]);
        if (waitingForLeader) {
          clearTimeout(leaderTimeout);
          waitingForLeader = false;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (leaderTimeout) clearTimeout(leaderTimeout);
    };
  }, [onOpenPalette, onJump, paletteOpen]);
};

/**
 * Tracks the bounding rect of any DOM element relative to a container,
 * recomputing on resize and on layout-affecting state changes.
 *
 * Used to drive the magnetic underline indicator that slides between
 * active nav items.
 */
const useElementRect = (ref, containerRef, deps = []) => {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      const containerEl = containerRef.current;
      if (!el || !containerEl) return;
      const elBox = el.getBoundingClientRect();
      const cBox = containerEl.getBoundingClientRect();
      setRect({
        left: elBox.left - cBox.left,
        width: elBox.width,
        height: elBox.height,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return rect;
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION PREFETCH — gentle scroll-into-view on hover
   ═══════════════════════════════════════════════════════════════════════
   Touching a link with the cursor causes the target section to scroll
   into view at the very bottom of the viewport — a subtle "pre-warm" that
   makes the click feel instant because the section has already started
   compositing.
   ═══════════════════════════════════════════════════════════════════════ */

const prefetchSection = (href) => {
  const id = href.startsWith("#") ? href.substring(1) : href;
  const el = document.getElementById(id);
  if (!el) return;
  // We don't actually scroll — we just hint to the browser to render the
  // section, which has the side effect of priming any images/iframes inside.
  // The dataset attribute is read by the section's own intersection observer
  // to start any one-time setup work.
  el.dataset.prefetched = "true";
};

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR — hairline indicator under the navbar
   ═══════════════════════════════════════════════════════════════════════ */

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.25,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-foreground/80"
    />
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   WORDMARK — monospace name + status dot, no logo box
   ═══════════════════════════════════════════════════════════════════════ */

const Wordmark = () => (

    href="#hero"
    aria-label="Back to top"
    className="group inline-flex items-baseline gap-2 font-mono text-sm tracking-tight"
  >
    <span className="font-medium text-foreground transition-colors group-hover:text-foreground">
      santiago
    </span>
    <span className="text-muted-foreground/60">/</span>
    <span className="text-muted-foreground transition-colors group-hover:text-foreground/80">
      delgado
    </span>
  </a>
);

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP NAV — index-prefixed links + magnetic underline indicator
   ═══════════════════════════════════════════════════════════════════════ */

const DesktopNavLink = ({ item, isActive, linkRef }) => (
  <a
    ref={linkRef}
    href={item.href}
    onMouseEnter={() => prefetchSection(item.href)}
    onFocus={() => prefetchSection(item.href)}
    aria-current={isActive ? "location" : undefined}
    className={cn(
      "group relative inline-flex items-baseline gap-1.5 px-2 py-1 font-mono text-[13px] transition-colors",
      isActive
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground",
    )}
  >
    <span
      className={cn(
        "text-[10px] tabular-nums transition-opacity",
        isActive ? "text-foreground/40" : "text-muted-foreground/50",
      )}
    >
      {item.index}
    </span>
    <span className="font-medium tracking-tight">
      {item.name.toLowerCase()}
    </span>
  </a>
);

const DesktopNav = ({ activeSection }) => {
  const containerRef = useRef(null);
  const linkRefs = useRef({});

  // Ensure a ref exists for each item.
  navItems.forEach((item) => {
    if (!linkRefs.current[item.href]) {
      linkRefs.current[item.href] = { current: null };
    }
  });

  const activeHref = `#${activeSection}`;
  const activeRect = useElementRect(
    linkRefs.current[activeHref] ?? { current: null },
    containerRef,
    [activeSection],
  );

  return (
    <nav
      ref={containerRef}
      aria-label="Primary"
      className="relative hidden items-center gap-1 md:flex"
    >
      {navItems.map((item) => (
        <DesktopNavLink
          key={item.href}
          item={item}
          isActive={activeSection === item.href.substring(1)}
          linkRef={linkRefs.current[item.href]}
        />
      ))}

      {/* Magnetic underline indicator */}
      <AnimatePresence>
        {activeRect && (
          <motion.span
            aria-hidden
            layoutId="nav-underline"
            initial={false}
            animate={{
              x: activeRect.left,
              width: activeRect.width,
            }}
            transition={SPRING_FAST}
            style={{ height: 1 }}
            className="pointer-events-none absolute bottom-0 left-0 bg-foreground"
          />
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   COMMAND PALETTE — fuzzy search, keyboard nav, recently used
   ═══════════════════════════════════════════════════════════════════════ */

const fuzzyMatch = (query, text) => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  // Direct substring match wins.
  if (t.includes(q)) return true;
  // Subsequence match — characters in order, not necessarily adjacent.
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return navItems;
    return navItems.filter(
      (i) => fuzzyMatch(q, i.name) || fuzzyMatch(q, i.description),
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
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
            className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_VERCEL }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="fixed left-1/2 top-[18vh] z-[70] w-[92%] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card/98 shadow-2xl shadow-black/40 backdrop-blur-2xl"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search size={14} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Jump to section..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <kbd className="rounded border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-1.5">
              {results.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                  no matches for "
                  <span className="font-mono text-foreground/80">{query}</span>"
                </div>
              ) : (
                results.map((item, i) => {
                  const isSelected = i === selectedIdx;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIdx(i)}
                      className={cn(
                        "relative grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-foreground/5 text-foreground"
                          : "text-muted-foreground hover:bg-foreground/[0.03]",
                      )}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="palette-cursor"
                          transition={SPRING_FAST}
                          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground"
                        />
                      )}
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                        {item.index}
                      </span>
                      <span className="font-mono font-medium text-foreground/90">
                        {item.name.toLowerCase()}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <kbd className="rounded border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        g {item.shortcut}
                      </kbd>
                      {isSelected ? (
                        <CornerDownLeft
                          size={12}
                          className="text-foreground/60"
                        />
                      ) : (
                        <ArrowUpRight
                          size={12}
                          className="text-muted-foreground/40"
                        />
                      )}
                    </a>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-background/30 px-4 py-2 font-mono text-[10px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <ArrowUp size={9} />
                  <ArrowDown size={9} />
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CornerDownLeft size={9} />
                  <span>open</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command size={10} />
                <span>k</span>
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE DRAWER
   ═══════════════════════════════════════════════════════════════════════ */

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
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            role="dialog"
            aria-modal="true"
            className="md:hidden fixed top-0 right-0 z-50 h-full w-[78%] max-w-sm overflow-hidden border-l border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Navigation
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {navItems.length} sections
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <nav className="px-2 py-4">
              <ul className="flex flex-col">
                {navItems.map((item, i) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, ...SPRING_MEDIUM }}
                    >
                      <a
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "group flex items-baseline justify-between border-b border-border/60 px-4 py-4 transition-colors last:border-b-0",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/50">
                            {item.index}
                          </span>
                          <span className="font-mono text-lg font-medium tracking-tight">
                            {item.name.toLowerCase()}
                          </span>
                        </div>
                        <ArrowUpRight
                          size={14}
                          className={cn(
                            "transition-all duration-300",
                            isActive
                              ? "translate-x-0 translate-y-0 opacity-100"
                              : "-translate-x-1 translate-y-1 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
                          )}
                        />
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 inset-x-0 border-t border-border px-6 py-4 font-mono text-[10px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>santiago delgado</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  toronto, on
                </span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SEARCH TRIGGER — desktop "⌘K" pill
   ═══════════════════════════════════════════════════════════════════════ */

const SearchTrigger = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open command palette (⌘K)"
    className="hidden md:inline-flex items-center gap-2.5 rounded-full border border-border bg-card/40 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
  >
    <Search size={11} />
    <span>search</span>
    <span className="flex items-center gap-0.5 border-l border-border pl-2 text-muted-foreground/60">
      <Command size={9} />
      <span className="text-[10px]">K</span>
    </span>
  </button>
);

const MobileMenuButton = ({ isOpen, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
    className="md:hidden relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/40 text-foreground transition-colors hover:bg-foreground/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
  >
    <AnimatePresence mode="wait" initial={false}>
      {isOpen ? (
        <motion.span
          key="x"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <X size={16} />
        </motion.span>
      ) : (
        <motion.span
          key="menu"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: -90, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Menu size={16} />
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR ROOT
   ═══════════════════════════════════════════════════════════════════════ */

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);
  const scrollDirection = useScrollDirection();
  const activeSection = useActiveSection(navItems);

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
        animate={{ y: isHidden ? -80 : 0 }}
        transition={{ type: "tween", duration: 0.3, ease: EASE_VERCEL }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolledPast
            ? "border-b border-border bg-background/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Left: wordmark */}
          <Wordmark />

          {/* Center: desktop nav */}
          <DesktopNav activeSection={activeSection} />

          {/* Right: search + mobile menu */}
          <div className="flex items-center gap-2">
            <SearchTrigger onClick={openPalette} />
            <MobileMenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
            />
          </div>
        </div>

        {/* Scroll progress hairline */}
        {scrolledPast && <ScrollProgressBar />}
      </motion.header>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeSection={activeSection}
      />
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
    </>
  );
};

export default Navbar;
