import { createContext, useContext, useState, useEffect, useReducer, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  User,
  Lightbulb,
  Briefcase,
  Mail,
  Code,
  Brush,
} from "lucide-react";
import { motion, AnimatePresence, useAnimate, stagger } from "framer-motion";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { GithubIcon } from "./GithubIcon"; // Assuming a custom icon
import { LiveIndicator } from "./LiveIndicator"; // New component for real-time data

// --- Global State with Reducer ---
const navReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_MENU":
      return { ...state, isMenuOpen: !state.isMenuOpen, openSubMenu: null };
    case "SET_SUBMENU":
      return { ...state, openSubMenu: action.payload };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "CLOSE_MENU":
      return { ...state, isMenuOpen: false, openSubMenu: null };
    default:
      return state;
  }
};

const NavContext = createContext();
const useNav = () => useContext(NavContext);

const navItems = [
  { name: "Home", href: "#hero", icon: Home },
  { name: "About", href: "#about", icon: User },
  { name: "Skills", href: "#skills", icon: Lightbulb },
  {
    name: "Projects",
    href: "#projects",
    icon: Briefcase,
    submenu: [
      { name: "Web Dev", href: "#webdev", icon: Code },
      { name: "UI/UX", href: "#uiux", icon: Brush },
    ],
  },
  { name: "Contact", href: "#contact", icon: Mail },
];

const DesktopNavLink = ({ item }) => {
  const { state, dispatch } = useNav();
  const isActive = state.activeSection === item.href.substring(1);
  const hasSub = Array.isArray(item.submenu);
  const Icon = item.icon;
  const isSubMenuOpen = state.openSubMenu === item.name;

  return (
    <motion.div
      className="relative group h-full"
      onMouseEnter={() => hasSub && dispatch({ type: "SET_SUBMENU", payload: item.name })}
      onMouseLeave={() => dispatch({ type: "SET_SUBMENU", payload: null })}
      transition={{ duration: 0.3 }}
    >
      <a
        href={item.href}
        onClick={() => dispatch({ type: "SET_ACTIVE_SECTION", payload: item.href.substring(1) })}
        className={cn(
          "inline-flex items-center gap-1 transition-colors relative font-medium",
          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
        )}
        aria-haspopup={hasSub ? "menu" : undefined}
        aria-expanded={hasSub ? isSubMenuOpen : undefined}
      >
        <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
        {item.name}
        {hasSub && (
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform",
              isSubMenuOpen ? "rotate-180" : "rotate-0"
            )}
          />
        )}
        <span
          className={cn(
            "absolute -bottom-1 left-0 h-0.5 w-0 bg-current transition-all duration-300 group-hover:w-full",
            isActive ? "w-full bg-indigo-600 dark:bg-indigo-400" : ""
          )}
        />
      </a>
      <AnimatePresence>
        {isSubMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="absolute left-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-border bg-card backdrop-blur-lg shadow-lg z-20"
          >
            <ul className="py-2">
              {item.submenu.map((sub, j) => {
                const SubIcon = sub.icon;
                return (
                  <motion.li key={j}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: j * 0.05 }}
                  >
                    <a
                      href={sub.href}
                      onClick={() => dispatch({ type: "SET_SUBMENU", payload: null })}
                      className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <SubIcon size={18} />
                      {sub.name}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MobileNavLink = ({ item }) => {
  const { state, dispatch } = useNav();
  const hasSub = Array.isArray(item.submenu);
  const Icon = item.icon;

  const handleClick = (e) => {
    if (hasSub) {
      // You can add logic to expand/collapse submenus here if you want
    } else {
      dispatch({ type: "CLOSE_MENU" });
    }
  };

  return (
    <motion.li
      className="px-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <a
        href={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between rounded-xl px-3 py-3 transition",
          state.activeSection === item.href.substring(1)
            ? "bg-black/[0.04] dark:bg-white/5 text-indigo-600 dark:text-indigo-400 font-semibold"
            : "text-foreground hover:bg-black/[0.04] dark:hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <span>{item.name}</span>
        </div>
        {hasSub && <ChevronDown size={18} />}
      </a>
      {hasSub && (
        <motion.ul
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-1 ml-2 space-y-1 border-l border-border pl-3"
        >
          {item.submenu.map((sub, j) => (
            <li key={j}>
              <a
                href={sub.href}
                onClick={() => dispatch({ type: "CLOSE_MENU" })}
                className="block rounded-lg px-3 py-2 text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
              >
                {sub.name}
              </a>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.li>
  );
};

// --- MobileDrawer (Adaptado al reducer) ---
const MobileDrawer = () => {
  const { state, dispatch } = useNav();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    document.body.style.overflow = state.isMenuOpen ? "hidden" : "";
    if (state.isMenuOpen) {
      animate("li", { y: [20, 0], opacity: [0, 1] }, { duration: 0.3, delay: stagger(0.1) });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [state.isMenuOpen, animate]);

  return (
    <AnimatePresence>
      {state.isMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-background/90 backdrop-blur-xl transition-opacity"
            onClick={() => dispatch({ type: "CLOSE_MENU" })}
          />
          <motion.aside
            ref={scope}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="md:hidden fixed top-0 right-0 z-50 h-full w-[80%] max-w-sm transform bg-card border-l border-border shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-base font-semibold text-foreground">Menu</span>
              <motion.button
                onClick={() => dispatch({ type: "CLOSE_MENU" })}
                className="rounded-xl p-2 hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
                aria-label="Close menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-foreground" />
              </motion.button>
            </div>
            <nav className="px-2 pb-8">
              <ul className="space-y-2">
                {navItems.map((item, i) => (
                  <MobileNavLink key={i} item={item} />
                ))}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export const Navbar = () => {
  const [state, dispatch] = useReducer(navReducer, {
    isMenuOpen: false,
    openSubMenu: null,
    activeSection: "hero",
  });
  const scrollDirection = useScrollDirection();
  const observerRef = useRef(null);

  useEffect(() => {
    const handleHashChange = () => {
      const activeHash = window.location.hash.substring(1) || "hero";
      dispatch({ type: "SET_ACTIVE_SECTION", payload: activeHash });
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.href.substring(1)))
      .filter(Boolean);

    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dispatch({ type: "SET_ACTIVE_SECTION", payload: entry.target.id });
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((sec) => observerRef.current.observe(sec));

    return () => {
      if (observerRef.current) {
        sections.forEach((sec) => observerRef.current.unobserve(sec));
      }
    };
  }, []);

  const isScrolled = scrollDirection === "down";

  return (
    <NavContext.Provider value={{ state, dispatch }}>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: scrollDirection === "down" ? -100 : 0 }}
        transition={{ type: "tween", duration: 0.3 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          isScrolled ? "bg-background/70 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent py-4"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="#hero" className="relative group text-xl font-extrabold tracking-wide">
                <motion.span
                  className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  Santiago’s
                </motion.span>
                <span className="text-foreground"> Portfolio </span>
              </a>
              <LiveIndicator />
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navItems.map((item, i) => (
                <DesktopNavLink key={i} item={item} />
              ))}
            </div>
            <div className="md:hidden flex items-center gap-4">
              <LiveIndicator />
              <motion.button
                onClick={() => dispatch({ type: "TOGGLE_MENU" })}
                className="inline-flex items-center justify-center rounded-xl p-2 ring-1 ring-border hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
                aria-label={state.isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={state.isMenuOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {state.isMenuOpen ? (
                    <motion.div
                      key="x"
                      initial={{ rotate: 180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: -180, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={22} className="text-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 180, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} className="text-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      <MobileDrawer />
    </NavContext.Provider>
  );
};
