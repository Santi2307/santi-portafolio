import { useState, useEffect, useCallback } from "react";
import { Menu, X, Home, User, Lightbulb, Briefcase, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { LiveIndicator } from "./LiveIndicator";

const navItems = [
  { name: "Home",     href: "#hero",     icon: Home },
  { name: "About",    href: "#about",    icon: User },
  { name: "Skills",   href: "#skills",   icon: Lightbulb },
  { name: "Projects", href: "#projects", icon: Briefcase },
  { name: "Contact",  href: "#contact",  icon: Mail },
];

// Shared variants — declared once, parent triggers child animations
const linkVariants = {
  rest:  { y: 0 },
  hover: { y: -2, transition: { type: "spring", stiffness: 400, damping: 14 } },
};
const iconVariants = {
  rest:  { scale: 1, rotate: 0 },
  hover: { scale: 1.18, rotate: -8, transition: { type: "spring", stiffness: 500, damping: 12 } },
};

// ─── Desktop link ─────────────────────────────────────────────────────────
const DesktopNavLink = ({ item, isActive }) => {
  const Icon = item.icon;
  return (
    <motion.a
      href={item.href}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      variants={linkVariants}
      aria-current={isActive ? "location" : undefined}
      className={cn(
        "relative inline-flex items-center rounded-full px-3 py-1.5 font-medium transition-colors",
        isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15 ring-1 ring-indigo-500/20 dark:ring-indigo-400/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        <motion.span variants={iconVariants} className="inline-flex">
          <Icon size={18} />
        </motion.span>
        {item.name}
      </span>
    </motion.a>
  );
};

// ─── Mobile link ──────────────────────────────────────────────────────────
const mobileItemVariants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

const MobileNavLink = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <motion.li variants={mobileItemVariants} className="px-2">

        href={item.href}
        onClick={onClick}
        aria-current={isActive ? "location" : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
          isActive
            ? "text-indigo-600 dark:text-indigo-400 font-semibold"
            : "text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-mobile"
            className="absolute inset-0 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon size={20} className="relative z-10" />
        <span className="relative z-10">{item.name}</span>
      </a>
    </motion.li>
  );
};

// ─── Mobile drawer ────────────────────────────────────────────────────────
const listVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
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
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            className="md:hidden fixed top-0 right-0 z-50 h-full w-[80%] max-w-sm bg-card border-l border-border shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-base font-semibold text-foreground">Menu</span>
              <motion.button
                onClick={onClose}
                aria-label="Close menu"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-xl p-2 hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
              >
                <X size={20} className="text-foreground" />
              </motion.button>
            </div>
            <nav className="px-2 pb-8">
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1"
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

// ─── Navbar ───────────────────────────────────────────────────────────────
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolledPast, setScrolledPast] = useState(false);
  const scrollDirection = useScrollDirection();
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Background style based on scroll position (separate concern from hide-on-scroll)
  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section tracking via IntersectionObserver
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

  const isHidden = scrollDirection === "down" && scrolledPast;

  return (
    <>
      <motion.nav
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border,padding] duration-300",
          scrolledPast
            ? "bg-background/70 backdrop-blur-xl border-b border-border shadow-sm py-2"
            : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.a
                href="#hero"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="relative text-xl font-extrabold tracking-wide"
              >
                <motion.span
                  className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
                  style={{ backgroundSize: "200% auto" }}
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  Santiago’s
                </motion.span>
                <span className="text-foreground"> Portfolio</span>
              </motion.a>
              <LiveIndicator />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              {navItems.map((item) => (
                <DesktopNavLink
                  key={item.href}
                  item={item}
                  isActive={activeSection === item.href.substring(1)}
                />
              ))}
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-3">
              <LiveIndicator />
              <motion.button
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="inline-flex items-center justify-center rounded-xl p-2 ring-1 ring-border hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
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
                      <X size={22} className="text-foreground" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} className="text-foreground" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <MobileDrawer
        isOpen={isMenuOpen}
        onClose={closeMenu}
        activeSection={activeSection}
      />
    </>
  );
};
