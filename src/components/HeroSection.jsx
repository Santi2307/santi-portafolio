import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { Avatar3D } from "./Avatar3D";

const EASE_OUT = [0.22, 1, 0.36, 1];

export const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scroll-driven fade for the scroll indicator at the bottom
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

          {/* ─── LEFT — Avatar 3D ─── */}
          <motion.div
            className="order-1 flex justify-center lg:col-span-5 lg:order-1"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
          >
            <div className="w-full max-w-[380px] lg:max-w-[440px]">
              <Avatar3D />
            </div>
          </motion.div>

          {/* ─── RIGHT — Text content ─── */}
          <div className="order-2 lg:col-span-7 lg:order-2">

            {/* Section index — same pattern as About/Skills/Projects/Contact */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              <span className="text-primary">§ 01</span>
              <span className="mx-2 opacity-40">/</span>
              Introduction
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
              className="mt-8 flex flex-col gap-3 sm:flex-row"
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

      {/* Scroll indicator — bottom center */}
      <motion.div
        style={{ opacity: arrowOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Scroll
          </span>
          <ArrowDown size={14} className="text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
