import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1];

export const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scroll-driven fade for the scroll indicator at the bottom


  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ─── LEFT — Avatar 3D ─── */}

          {/* ─── RIGHT — Text content ─── */}
          <div className="order-2 lg:col-span-7 lg:order-2">
            {/* Section index — same pattern as About/Skills/Projects/Contact */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              <span className="text-white">01</span>
              <span className="mx-2 opacity-100">/</span>
              Home
            </motion.p>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
            >
              Hi, I'm Santiago. <br className="hidden sm:block" />
            </motion.h1>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
            >
              I'm an aspiring IT professional from Colombia currently in
              Toronto. I troubleshoot and automate systems with Linux, Ansible,
              and Docker, and I build clean React interfaces on top of them.
            </motion.p>

            {/* CTAs — same pattern as About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.6 }}
              className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <a
                href="#projects"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                View my work
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
