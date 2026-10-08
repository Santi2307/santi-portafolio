import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Instagram,
} from "lucide-react";
import { CodeCard } from "@/components/CodeCard";

const EASE_OUT = [0.22, 1, 0.36, 1];

/* TODO: replace with your own text */
const META_BADGES = ["Toronto, ON", "Colombia"];

const SOCIALS = [
  {
    icon: Github,
    href: "https://github.com/Santi2307",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/santiagodelgado23",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/santiagodelgadosanchez",
    label: "Instagram",
  },
];

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28 lg:py-0"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* LEFT — text content */}
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            {/* Section index — same pattern as About/Skills/Projects/Contact */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 font-mono text-xs tracking-wide text-foreground/50"
            >
              <span className="text-foreground">01</span>
              <span className="mx-2 opacity-100">/</span>
              home
            </motion.p>

            {/* Meta badges — location + live status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {META_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

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
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/70 lg:mx-0"
            >
              I&apos;m an IT support and systems specialist based in Toronto,
              Canada. I keep Linux servers and networks running, automate the
              repetitive parts with Ansible and Python, and build the web apps
              around them. Most recently I&apos;ve been building WhatsApp
              automations for a small business back home in Colombia.
            </motion.p>

            {/* Socials */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.45 }}
              className="mt-6 flex items-center justify-center gap-3 lg:justify-start"
            >
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </motion.div>

            {/* CTAs — same pattern as About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.6 }}
              className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <a
                href="#projects"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                View Projects
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                Contact Me
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

          {/* RIGHT — code editor card */}
          <CodeCard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
