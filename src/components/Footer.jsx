import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const footerNavItems = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

/**
 * Auto-updating year. Reads the current year and schedules a refresh
 * for the next New Year's midnight so a tab left open across Dec 31 → Jan 1
 * updates without a reload.
 */
const useCurrentYear = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const scheduleNext = () => {
      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 1);
      const msUntil = nextYear.getTime() - now.getTime();
      return setTimeout(() => {
        setYear(new Date().getFullYear());
        scheduleNext();
      }, msUntil);
    };
    const id = scheduleNext();
    return () => clearTimeout(id);
  }, []);

  return year;
};

const FooterNavLink = ({ item }) => (
  <li>
    <a
      href={item.href}
      className="group relative inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {item.name}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300 group-hover:w-full"
      />
    </a>
  </li>
);

export const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const year = useCurrentYear();

  useEffect(() => {
    const onScroll = () => setShowScrollButton(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer
      id="footer"
      className="relative mt-12 overflow-hidden border-t border-border bg-card px-4 py-14"
    >
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="container relative mx-auto max-w-5xl">
        {/* ─── Top row: logo + nav ─── */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand block */}
          <div className="flex flex-col items-center md:items-start">
            <a
              href="#hero"
              className="group inline-flex items-center gap-2.5"
              aria-label="Back to top"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                <span className="text-sm font-black">S</span>
              </span>
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-fuchsia-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
                Santiago Delgado
              </span>
            </a>

            <p className="mt-3 inline-flex items-center text-xs text-muted-foreground">
              <span>Built in Toronto · Coded with ☕ and curiosity</span>
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
                className="ml-1 inline-block h-3 w-[2px] translate-y-[1px] bg-indigo-400"
              />
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {footerNavItems.map((item) => (
                <FooterNavLink key={item.href} item={item} />
              ))}
            </ul>
          </nav>
        </div>

        {/* ─── Divider ─── */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* ─── Bottom row: status + copyright ─── */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 font-mono">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-block h-full w-full rounded-full bg-emerald-500" />
            </span>
            <span>v2.0</span>
            <span className="opacity-40">·</span>
            <span>main</span>
          </div>

          {/* Copyright with year pill */}
          <p className="flex items-center gap-1.5 text-center">
            <span className="rounded-md border border-border/60 bg-background/40 px-1.5 py-0.5 font-mono text-[11px] tabular-nums">
              © {year}
            </span>
            <span>
              Built and designed by{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text font-semibold text-transparent">
                Santiago Delgado
              </span>
              .
            </span>
          </p>
        </div>
      </div>

      {/* ─── Floating back-to-top ─── */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.a
            href="#hero"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/40 transition-shadow hover:shadow-xl hover:shadow-indigo-500/50"
          >
            <ArrowUp size={18} />
          </motion.a>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
