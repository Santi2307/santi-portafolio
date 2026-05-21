import { useCallback, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Network,
  MessagesSquare,
  LayoutTemplate,
  Radio,
  Terminal,
  Cloud,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
 
/* ─────────────────────────── Projects data ─────────────────────────── */
 
const PROJECTS = [
  {
    id: "aruba-ansible",
    title: "Aruba Switch Automation with Ansible",
    summary:
      "Capstone project: built Ansible roles to configure Aruba AOS-CX 6300 and 2530 switches end-to-end — VLAN provisioning, DHCP, OSPF adjacencies, and LAG/LACP link aggregation. Reproducible, idempotent, version-controlled in Git.",
    icon: Network,
    category: "automation",
    tags: ["Ansible", "Aruba AOS-CX", "YAML", "Jinja2", "OSPF", "VLAN", "LACP"],
    courses: ["APL701"],
    year: "2026",
    status: "capstone",
    githubUrl: "https://github.com/Santi2307",
    featured: true,
  },
  {
    id: "marsupial-whatsapp",
    title: "Calzado Marsupial — WhatsApp Self-Service",
    summary:
      "Customer self-service purchasing flow for my family's footwear business, built on Treble.ai. Handles city-based routing, CRM verification, product catalog menus, and order tracking — directly through WhatsApp.",
    icon: MessagesSquare,
    category: "automation",
    tags: ["Treble.ai", "WhatsApp Business API", "Cuenti ERP", "CRM"],
    courses: [],
    year: "2026",
    status: "in-progress",
    demoUrl: null,
    githubUrl: null,
  },
  {
    id: "portfolio",
    title: "This Portfolio",
    summary:
      "The site you're reading. React + Vite, styled with Tailwind, animated with Framer Motion, state managed with Zustand. Designed and built end-to-end — every component is mine.",
    icon: LayoutTemplate,
    category: "web",
    tags: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Zustand"],
    courses: [],
    year: "2026",
    status: "live",
    demoUrl: "/",
    githubUrl: "https://github.com/Santi2307/santi-portafolio",
  },
  {
    id: "piedecuesta-wireless",
    title: "Rural Wireless Network — Piedecuesta",
    summary:
      "Designed wireless infrastructure for an underserved community in Santander, Colombia, during my internship at Tigo. Team of four engineers — I handled RF calculations including EIRP, Fresnel zone clearance, and link budget analysis.",
    icon: Radio,
    category: "networking",
    tags: ["RF Engineering", "Link Budget", "Google Earth Pro", "Network Design"],
    courses: [],
    year: "2023",
    status: "internship",
    githubUrl: null,
  },
  {
    id: "ops445-labs",
    title: "Linux Server Administration Labs",
    summary:
      "Four comprehensive review labs covering LVM and storage management, NFS file sharing, SELinux policy configuration, Podman container deployment, and autofs automounting on RHEL. RHCSA preparation.",
    icon: Terminal,
    category: "systems",
    tags: ["RHEL", "Bash", "LVM", "SELinux", "NFS", "Podman", "autofs"],
    courses: ["OPS445", "RHT524"],
    year: "2025",
    status: "coursework",
    githubUrl: null,
  },
  {
    id: "avd-deployment",
    title: "Azure Virtual Desktop Deployment",
    summary:
      "Designed and deployed an Azure Virtual Desktop environment with Microsoft Entra ID identity, session hosts, and user assignments — including the configuration and policy work needed for production readiness.",
    icon: Cloud,
    category: "cloud",
    tags: ["Microsoft Azure", "AVD", "Entra ID", "PowerShell"],
    courses: ["MST400", "CPO550"],
    year: "2026",
    status: "coursework",
    githubUrl: null,
  },
];
 
const CATEGORIES = [
  { id: "all",        label: "All" },
  { id: "automation", label: "Automation" },
  { id: "networking", label: "Networking" },
  { id: "systems",    label: "Systems" },
  { id: "cloud",      label: "Cloud" },
  { id: "web",        label: "Web" },
];
 
const STATUS_CONFIG = {
  capstone:      { label: "Capstone",    dot: "bg-violet-500",  text: "text-violet-500",  bg: "bg-violet-500/10"  },
  internship:    { label: "Internship",  dot: "bg-amber-500",   text: "text-amber-500",   bg: "bg-amber-500/10"   },
  live:          { label: "Live",        dot: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  "in-progress": { label: "In Progress", dot: "bg-sky-500",     text: "text-sky-500",     bg: "bg-sky-500/10"     },
  coursework:    { label: "Coursework",  dot: "bg-slate-400",   text: "text-slate-400",   bg: "bg-slate-400/10"   },
};
 
const CATEGORY_GRADIENT = {
  automation: "from-emerald-500/30 via-emerald-500/10 to-transparent",
  networking: "from-sky-500/30 via-sky-500/10 to-transparent",
  systems:    "from-amber-500/30 via-amber-500/10 to-transparent",
  cloud:      "from-violet-500/30 via-violet-500/10 to-transparent",
  web:        "from-rose-500/30 via-rose-500/10 to-transparent",
};
 
const EASE_OUT = [0.22, 1, 0.36, 1];
 
/* ─────────────────────────── Status badge ─────────────────────────── */
 
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.coursework;
  const isPulsing = status === "live" || status === "in-progress";
 
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        cfg.bg,
        cfg.text
      )}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        {isPulsing && (
          <motion.span
            aria-hidden
            className={cn("absolute inset-0 rounded-full", cfg.dot)}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className={cn("relative inline-block h-full w-full rounded-full", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
};
 
/* ─────────────────────────── Project card ─────────────────────────── */
 
const ProjectCard = ({ project, index }) => {
  const reducedMotion = useReducedMotion();
  const Icon = project.icon;
  const gradient = CATEGORY_GRADIENT[project.category] ?? CATEGORY_GRADIENT.systems;
 
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{
        delay: reducedMotion ? 0 : Math.min(index * 0.06, 0.4),
        duration: 0.5,
        ease: EASE_OUT,
        layout: { duration: 0.3 },
      }}
      whileHover={reducedMotion ? {} : { y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-sm",
        "transition-shadow duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        project.featured && "lg:col-span-2"
      )}
    >
      {/* Cover with gradient + icon */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden border-b border-primary/10 bg-gradient-to-br",
          gradient,
          project.featured ? "h-44 lg:h-56" : "h-36"
        )}
      >
        {/* Subtle moving glow on hover */}
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15), transparent 60%)",
          }}
        />
 
        <motion.div
          className="relative z-10 rounded-2xl bg-background/50 p-4 ring-1 ring-primary/20 backdrop-blur-sm"
          whileHover={reducedMotion ? {} : { scale: 1.06, rotate: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon
            size={project.featured ? 36 : 28}
            className="text-primary"
            aria-hidden="true"
          />
        </motion.div>
 
        {/* Top-left: featured star */}
        {project.featured && (
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-500/30"
            aria-label="Featured project"
          >
            <Star size={10} fill="currentColor" /> Featured
          </span>
        )}
 
        {/* Top-right: status */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={project.status} />
        </div>
 
        {/* Bottom-right: year */}
        <span className="absolute bottom-3 right-3 rounded bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          {project.year}
        </span>
      </div>
 
      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-primary">
          <span>{project.category}</span>
          {project.courses?.length > 0 && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="flex gap-1">
                {project.courses.map((c) => (
                  <span
                    key={c}
                    className="rounded border border-border/60 bg-background/60 px-1.5 py-0 font-mono normal-case tracking-normal text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
 
        <h3
          className={cn(
            "mb-2 font-semibold leading-tight",
            project.featured ? "text-xl md:text-2xl" : "text-lg"
          )}
        >
          {project.title}
        </h3>
 
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
 
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              {tag}
            </span>
          ))}
        </div>
 
        <div className="flex items-center gap-3 border-t border-border/40 pt-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target={project.demoUrl.startsWith("/") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded text-sm text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`View ${project.title} demo`}
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>Live</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded text-sm text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`${project.title} GitHub repository`}
            >
              <Github size={14} aria-hidden="true" />
              <span>Code</span>
            </a>
          )}
          {!project.demoUrl && !project.githubUrl && (
            <span className="text-xs italic text-muted-foreground/70">
              Private — available on request
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};
 
/* ─────────────────────────── Filter tabs ─────────────────────────── */
 
const FilterTabs = ({ categories, activeFilter, setActiveFilter, counts }) => (
  <div
    className="flex flex-wrap justify-center gap-2"
    role="tablist"
    aria-label="Filter projects by category"
  >
    {categories.map((cat) => {
      const isActive = activeFilter === cat.id;
      return (
        <motion.button
          key={cat.id}
          onClick={() => setActiveFilter(cat.id)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          whileTap={{ scale: 0.96 }}
          role="tab"
          aria-selected={isActive}
        >
          {isActive && (
            <motion.span
              layoutId="projects-filter-pill"
              className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/20"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {cat.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0 text-[10px] font-semibold transition-colors",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              {counts[cat.id] ?? 0}
            </span>
          </span>
        </motion.button>
      );
    })}
  </div>
);
 
/* ─────────────────────────── Main section ─────────────────────────── */
 
export const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
 
  const counts = useMemo(() => {
    const result = { all: PROJECTS.length };
    for (const cat of CATEGORIES) if (cat.id !== "all") result[cat.id] = 0;
    for (const p of PROJECTS) result[p.category] = (result[p.category] ?? 0) + 1;
    return result;
  }, []);
 
  const filteredProjects = useMemo(() => {
    const list =
      activeFilter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeFilter);
    // Featured projects float to the top
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [activeFilter]);
 
  const resetFilter = useCallback(() => setActiveFilter("all"), []);
 
  return (
    <section
      id="projects"
      ref={ref}
      className="relative px-4 py-24"
      aria-labelledby="projects-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          id="projects-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-3 text-center text-3xl font-bold md:text-4xl"
        >
          Featured{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Projects
          </span>
        </motion.h2>
 
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl text-center text-sm text-muted-foreground"
        >
          A mix of capstone work, coursework from Seneca's Computer Systems
          Technology program, an internship in Colombia, and things I've built
          on the side. Each one taught me something different.
        </motion.p>
 
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-10 flex justify-center"
        >
          <FilterTabs
            categories={CATEGORIES}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            counts={counts}
          />
        </motion.div>
 
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
 
        <AnimatePresence>
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-8 max-w-md rounded-xl border border-dashed border-border bg-background/50 p-8 text-center"
            >
              <p className="font-medium">Nothing here yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={resetFilter}
                >
                  resetting filters
                </button>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
 
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/Santi2307"
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-button inline-flex items-center gap-2"
            aria-label="View all projects on GitHub"
          >
            See more on GitHub
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
 
export default ProjectsSection;
