import { useState, useEffect, useCallback } from "react";
import { Menu, X, Home, User, Lightbulb, Briefcase, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const navItems = [
  { name: "Home",     href: "#hero",     icon: Home },
  { name: "About",    href: "#about",    icon: User },
  { name: "Skills",   href: "#skills",   icon: Lightbulb },
  { name: "Projects", href: "#projects", icon: Briefcase },
  { name: "Contact",  href: "#contact",  icon: Mail },
];

// Alias para evitar bug de parsing con motion.li en algunos setups de esbuild
const MotionLi = motion.li;

const spring = { type: "spring", stiffness: 380, damping: 30 };

// ─── Borde de gradiente cónico animado ──────────────────────────────────
const AnimatedRing = ({ className }) => (
  <motion.span
    aria-hidden
    className={cn("pointer-events-none absolute -inset-px rounded-full opacity-70", className)}
    style={{
      background:
        "conic-gradient(from 0deg, transparent 0deg, rgba(99,102,241,0.55) 50deg, rgba(217,70,239,0.45) 110deg, transparent 180deg, transparent 360deg)",
      WebkitMask:
        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      padding: 1,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
  />
);

// ─── Link desktop ───────────────────────────────────────────────────────
const DesktopNavLink = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <motion.a
      href={item.href}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      animate="rest"
      whileTap={{ scale: 0.94 }}
      aria-current={isActive ? "location" : undefined}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
        isActive ? "text-white" : "text-foreground/60 hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          transition={spring}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/40"
        />
      )}
      <motion.span
        variants={{
          rest:  { scale: 1, rotate: 0, y: 0 },
          hover: { scale: 1.18, rotate: -8, y: -1 },
        }}
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
        className="relative z-10 inline-flex"
      >
        <Icon size={15} strokeWidth={2.25} />
      </motion.span>
      <span className="relative z-10">{item.name}</span>
    </motion.a>
  );
};

// ─── Link mobile ────────────────────────────────────────────────────────
const mobileItemVariants = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

const MobileNavLink = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <MotionLi variants={mobileItemVariants} className="px-2">

        href={item.href}
        onClick={onClick}
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 transition-colors",
          isActive
            ? "text-white"
            : "text-foreground/80 hover:bg-white/5"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-mobile"
            transition={spring}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/90 to-violet-500/90 shadow-lg shadow-indigo-500/30"
          />
        )}
        <Icon size={18} className="relative z-10" strokeWidth={2.25} />
        <span className="relative z-10 font-medium">{item.name}</span>
      </a>
    </MotionLi>
  );
};

// ─── Drawer mobile ──────────────────────────────────────────────────────
const listVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const MobileDrawer = ({ isOpen, onClose, activeSection }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
            {/* Glow decorativo */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

            <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Navigation
              </span>
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

            <nav className="relative px-2 pb-8">
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Navbar ─────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolledPast, setScrolledPast] = useState(false);
  const scrollDirection = useScrollDirection();
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((i) => document.getElementById(i.href.substring(1)))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id));
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Solo se oculta si: bajando + ya pasamos el threshold + menú cerrado
  const isHidden = scrollDirection === "down" && scrolledPast && !isMenuOpen;

  return (
    <>
      <motion.header
        animate={{ y: isHidden ? -120 : 0 }}
        transition={{ type: "tween", duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">

          {/* ── Logo ── */}
          <motion.a
            href="#hero"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-full px-1 text-lg font-extrabold tracking-tight"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40">
              <span className="text-xs font-black">S</span>
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-400 to-fuchsia-400 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-80"
              />
            </span>
            <motion.span
              className="bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% auto" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              Santiago
            </motion.span>
          </motion.a>

          {/* ── Floating pill (desktop) ── */}
          <div className="hidden md:block relative">
            <motion.div
              animate={{
                backgroundColor: scrolledPast ? "rgba(15, 15, 20, 0.6)" : "rgba(15, 15, 20, 0.35)",
              }}
              transition={{ duration: 0.4 }}
              className="relative rounded-full border border-white/10 backdrop-blur-2xl shadow-xl shadow-black/20"
            >
              <AnimatedRing />
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

          {/* ── Botón mobile ── */}
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

          {/* Spacer invisible para balancear el grid en desktop */}
          <div className="hidden md:block w-[120px]" aria-hidden />
        </div>
      </motion.header>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeSection={activeSection}
      />
    </>
  );
};
