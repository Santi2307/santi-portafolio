import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { StarBackground } from "@/components/StarBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

const EASE_OUT = [0.22, 1, 0.36, 1];

const fade = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

export const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found · Santiago Delgado";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-left text-foreground">
      <ThemeToggle />
      <StarBackground />

      <header className="relative z-10 px-4 py-6">
        <div className="container mx-auto max-w-6xl">
          <Link to="/" className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-foreground">
            Santiago Delgado
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center px-4">
        <div className="container mx-auto max-w-6xl py-24">
          <motion.p {...fade(0)} className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
            <span className="text-foreground">404</span>
            <span className="mx-2">/</span>
            not found
          </motion.p>

          <motion.h1 {...fade(0.08)} className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
            This page doesn&apos;t exist.
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70">
            Maybe the link is old, or there&apos;s a typo in{" "}
            <span className="break-all font-mono text-sm text-foreground/90">{pathname}</span>. It happens. Let&apos;s get you back.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              Back to home
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/#projects"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              View Projects
            </Link>
          </motion.div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
