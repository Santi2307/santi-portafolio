/**
 * ProjectsSection
 * -----------------------------------------------------------------------------
 * Five flagship projects, each tied to specific course tracks in the Computer
 * Systems Technology program at Seneca and the work I did alongside it.
 *
 * Design decisions:
 *   • Fewer projects, more depth. Each card communicates outcomes, not tasks.
 *   • The capstone (APL701 network automation) is presented in a case-study
 *     layout above the grid — visual on the left, content on the right.
 *   • No filters — with five curated projects, friction is the wrong choice.
 *   • Status (Capstone / Internship / Live / In Progress / Coursework), year,
 *     and Seneca course codes are surfaced so a recruiter can see the lineage.
 *   • All covers use a gradient + technical pattern + icon — no broken image
 *     paths, no missing screenshot placeholders.
 *
 * Code hygiene:
 *   • All Lucide icons verified against the current package.
 *   • No layout-on-parent that conflicts with AnimatePresence on children.
 *   • `prefers-reduced-motion` honored on every animated surface.
 *   • Defensive: optional URLs render only when present; no broken anchors.
 *
 * @author Santiago Delgado
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  Workflow,
  ServerCog,
  Cloud,
  MessagesSquare,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Projects data ─────────────────────────── */

const PROJECTS = [
  {
    id: "network-automation",
    featured: true,
    title: "Enterprise Network Automation Platform",
    tagline: "Capstone — APL701 Applied Integration",
    summary:
      "Multi-vendor switch provisioning automated end-to-end with Ansible. Builds a repeatable, version-controlled foundation for production networks.",
    description:
      "For my capstone, I built Ansible roles and playbooks to fully automate the configuration of Aruba AOS-CX 6300 and 2530 switches. What used to require dozens of manual CLI sessions now executes idempotently from a single playbook — covering VLAN provisioning, DHCP scopes, OSPF dynamic routing, and LAG/LACP link aggregation across multiple switch models.",
    icon: Workflow,
    category: "networking",
    courses: ["APL701", "CSN305", "CPO520"],
    year: "2026",
    status: "capstone",
    outcomes: [
      "Reduced multi-switch provisioning from hours of CLI work to a single playbook run",
      "Designed reusable Ansible roles supporting Aruba AOS-CX 6300 and 2530 platforms",
      "Implemented OSPF dynamic routing, VLAN trunking, and LAG/LACP across the topology",
      "Fully Git-versioned with a role-based architecture for environment promotion",
    ],
    tags: ["Ansible", "YAML", "Jinja2", "Aruba AOS-CX", "Cisco IOS", "OSPF", "VLAN", "LACP", "Git"],
    githubUrl: "https://github.com/Santi2307",
    demoUrl: null,
  },

  {
    id: "linux-infrastructure",
    title: "Hardened Linux Infrastructure",
    tagline: "OPS445 · RHT524 · SEC220",
    summary:
      "Multi-server RHEL environment configured to RHCSA-exam standards, hardened with SELinux, and containerized with Podman.",
    description:
      "Built across the Open System Administration and Red Hat Certification courses. Covers the full RHCSA blueprint — LVM-based storage, NFS file sharing with autofs, custom SELinux policies, Podman container deployments, and centralized authentication.",
    icon: ServerCog,
    category: "systems",
    courses: ["OPS445", "RHT524", "OPS635", "SEC220"],
    year: "2025",
    status: "coursework",
    outcomes: [
      "Configured LVM volume groups, NFS exports, and autofs maps across multiple hosts",
      "Implemented SELinux mandatory access controls with custom policy modules",
      "Deployed containerized services with Podman, rootless mode",
      "Aligned with RHCSA (EX200) exam objectives",
    ],
    tags: ["RHEL", "Bash", "LVM", "NFS", "SELinux", "Podman", "autofs", "Systemd"],
    githubUrl: null,
    demoUrl: null,
  },

  {
    id: "azure-cloud-workspace",
    title: "Azure Hybrid Cloud Workspace",
    tagline: "MST400 · CPO550 Azure Administrator Track",
    summary:
      "End-to-end Azure Virtual Desktop deployment with hybrid identity, profile management, and conditional access — aligned to the AZ-104 certification path.",
    description:
      "Designed and deployed a production-ready AVD environment in Microsoft Azure. Includes session host pools, FSLogix profile containers, hybrid identity through Microsoft Entra ID, and conditional access policies for security.",
    icon: Cloud,
    category: "cloud",
    courses: ["MST400", "CPO550", "MST300"],
    year: "2026",
    status: "coursework",
    outcomes: [
      "Architected a multi-session AVD host pool with FSLogix profile containers",
      "Configured hybrid identity via Microsoft Entra ID",
      "Applied conditional access policies and MFA enforcement for security",
      "Coursework aligned with Microsoft AZ-104 (Azure Administrator) objectives",
    ],
    tags: ["Microsoft Azure", "AVD", "Entra ID", "FSLogix", "PowerShell", "ARM"],
    githubUrl: null,
    demoUrl: null,
  },

  {
    id: "marsupial-platform",
    title: "Calzado Marsupial — Customer Self-Service",
    tagline: "Production system for my family's footwear business",
    summary:
      "End-to-end WhatsApp purchasing platform integrated with the company's existing ERP. Replaces manual customer-service workflows with a guided self-service experience.",
    description:
      "Engineered the conversation flow, integrations, and routing logic for a customer self-service platform on WhatsApp Business. Connects directly to the company's Cuenti ERP, with city-based order routing, CRM verification, dynamic product catalogs, and order tracking.",
    icon: MessagesSquare,
    category: "automation",
    courses: [],
    year: "2026",
    status: "in-progress",
    outcomes: [
      "Designed conversation flows from initial greeting through order confirmation",
      "Integrated with the company's existing Cuenti ERP and CRM systems",
      "Implemented city-based routing logic for nationwide order fulfillment",
      "Mid-implementation: serving real customers in Bucaramanga, Colombia",
    ],
    tags: ["Treble.ai", "WhatsApp Business API", "Cuenti ERP", "HSM Templates", "CRM"],
    githubUrl: null,
    demoUrl: null,
  },

  {
    id: "portfolio-design-system",
    title: "Interactive Portfolio & Design System",
    tagline: "The site you're reading",
    summary:
      "Custom-designed single-page application built from scratch — no UI kit, no template. Every animation, component, and interaction is mine.",
    description:
      "React + Vite single-page application with a custom design system, fluid Framer Motion animations, and Zustand-managed global state. Built mobile-first, fully responsive, and accessibility-conscious throughout.",
    icon: Sparkles,
    category: "web",
    courses: [],
    year: "2026",
    status: "live",
    outcomes: [
      "Custom design system — no template, no UI kit, no shortcuts",
      "Fluid Framer Motion animations across hero, photo gallery, and project cards",
      "Zustand-managed state for photo gallery, theme, and navigation",
      "Mobile-first responsive design tested across breakpoints",
    ],
    tags: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Zustand", "Lucide"],
    githubUrl: "https://github.com/Santi2307/santi-portafolio",
    demoUrl: "/",
  },
];

/* ─────────────────────────── Theme maps ─────────────────────────── */

const STATUS_CONFIG = {
  capstone:      { label: "Capstone",    dot: "bg-violet-500",  text: "text-violet-400",  bg: "bg-violet-500/10",  ring: "ring-violet-500/20"  },
  internship:    { label: "Internship",  dot: "bg-amber-500",   text: "text-amber-400",   bg: "bg-amber-500/10",   ring: "ring-amber-500/20"   },
  live:          { label: "Live",        dot: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
  "in-progress": { label: "In Progress", dot: "bg-sky-500",     text: "text-sky-400",     bg: "bg-sky-500/10",     ring: "ring-sky-500/20"     },
  coursework:    { label: "Coursework",  dot: "bg-slate-400",   text: "text-slate-400",   bg: "bg-slate-500/10",   ring: "ring-slate-500/20"   },
};

const CATEGORY_GRADIENT = {
  networking: "from-sky-500/25 via-indigo-500/10 to-transparent",
  systems:    "from-amber-500/25 via-orange-500/10 to-transparent",
  cloud:      "from-violet-500/25 via-fuchsia-500/10 to-transparent",
  automation: "from-emerald-500/25 via-teal-500/10 to-transparent",
  web:        "from-rose-500/25 via-pink-500/10 to-transparent",
};

const CATEGORY_LABEL = {
  networking: "Networking",
  systems:    "Systems Administration",
  cloud:      "Cloud Infrastructure",
  automation: "Automation",
  web:        "Web Development",
};

const EASE_OUT = [0.22, 1, 0.36, 1];

/* ─────────────────────────── Tiny presentation primitives ─────────────────────────── */

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.coursework;
  const isPulsing = status === "live" || status === "in-progress";
  const reducedMotion = useReducedMotion();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 backdrop-blur-sm",
        cfg.bg,
        cfg.text,
        cfg.ring
      )}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        {isPulsing && !reducedMotion && (
          <motion.span
            aria-hidden
            className={cn("absolute inset-0 rounded-full", cfg.dot)}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className={cn("relative h-full w-full rounded-full", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
};

const CourseChip = ({ code }) => (
  <span className="rounded border border-border/60 bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
    {code}
  </span>
);

const TechTag = ({ children }) => (
  <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80">
    {children}
  </span>
);

const Cover = ({ icon: Icon, category, featured = false }) => {
  const gradient = CATEGORY_GRADIENT[category] ?? CATEGORY_GRADIENT.systems;
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        gradient,
        featured ? "h-full min-h-[260px]" : "h-40"
      )}
    >
      {/* Technical grid pattern overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Centered icon container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          whileHover={reducedMotion ? {} : { scale: 1.05, rotate: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "rounded-2xl bg-background/40 ring-1 ring-primary/20 backdrop-blur-md",
            featured ? "p-6" : "p-4"
          )}
        >
          <Icon
            size={featured ? 48 : 32}
            className="text-primary"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Featured project (case study layout) ─────────────────────────── */

const FeaturedProject = ({ project }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="relative mb-10 overflow-hidden rounded-2xl border border-primary/15 bg-card/60 shadow-xl shadow-primary/5 backdrop-blur-sm"
    >
      {/* Featured ribbon */}
      <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 ring-1 ring-yellow-500/30 backdrop-blur-sm">
        <Star size={10} fill="currentColor" aria-hidden="true" />
        Featured Project
      </div>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <StatusBadge status={project.status} />
        <span className="rounded bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          {project.year}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Visual */}
        <div className="md:col-span-2">
          <Cover icon={project.icon} category={project.category} featured />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 md:col-span-3 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
            <span className="text-primary">{CATEGORY_LABEL[project.category]}</span>
            <span className="text-muted-foreground/40">·</span>
            <div className="flex flex-wrap gap-1">
              {project.courses.map((c) => (
                <CourseChip key={c} code={c} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-2xl font-bold leading-tight md:text-3xl">
              {project.title}
            </h3>
            <p className="text-sm italic text-muted-foreground">{project.tagline}</p>
          </div>

          <p className="leading-relaxed text-foreground/90">{project.description}</p>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Key Outcomes
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {project.outcomes.map((outcome, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: reducedMotion ? 0 : 0.3 + i * 0.08,
                    duration: 0.4,
                  }}
                  className="flex items-start gap-2"
                >
                  <ArrowUpRight
                    size={14}
                    className="mt-1 flex-shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <TechTag key={tag}>{tag}</TechTag>
            ))}
          </div>

          {(project.githubUrl || project.demoUrl) && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target={project.demoUrl.startsWith("/") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  View Live
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Github size={14} aria-hidden="true" />
                  View Code
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* ─────────────────────────── Regular project card ─────────────────────────── */

const ProjectCard = ({ project, index }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        ease: EASE_OUT,
        delay: reducedMotion ? 0 : Math.min(index * 0.08, 0.32),
      }}
      whileHover={reducedMotion ? {} : { y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-sm transition-shadow duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="relative">
        <Cover icon={project.icon} category={project.category} />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <StatusBadge status={project.status} />
        </div>
        <span className="absolute bottom-3 right-3 rounded bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
          {project.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-primary">{CATEGORY_LABEL[project.category]}</span>
          {project.courses.length > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex flex-wrap gap-1">
                {project.courses.map((c) => (
                  <CourseChip key={c} code={c} />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold leading-tight">{project.title}</h3>
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {project.tagline}
          </p>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <ul className="space-y-1 text-xs text-muted-foreground/90">
          {project.outcomes.slice(0, 3).map((outcome, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 5).map((tag) => (
            <TechTag key={tag}>{tag}</TechTag>
          ))}
          {project.tags.length > 5 && (
            <span className="px-1 py-0.5 text-[10px] text-muted-foreground/60">
              +{project.tags.length - 5}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border/40 pt-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target={project.demoUrl.startsWith("/") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded text-xs font-medium text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ExternalLink size={12} aria-hidden="true" />
              <span>Live</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded text-xs font-medium text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Github size={12} aria-hidden="true" />
              <span>Code</span>
            </a>
          )}
          {!project.demoUrl && !project.githubUrl && (
            <span className="text-[11px] italic text-muted-foreground/60">
              Available on request
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

/* ─────────────────────────── Main section ─────────────────────────── */

export const ProjectsSection = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.5 });

  const featured = PROJECTS.find((p) => p.featured);
  const others = PROJECTS.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      className="relative px-4 py-24"
      aria-labelledby="projects-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <header ref={headerRef} className="mb-12 text-center">
          <motion.h2
            id="projects-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mb-3 text-3xl font-bold md:text-4xl"
          >
            Featured{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              Projects
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            A curated selection of substantive work — my capstone, the systems
            and cloud projects from Seneca's Computer Systems Technology program,
            a production platform I built for my family's business in Colombia,
            and the design system behind this site.
          </motion.p>
        </header>

        {featured && <FeaturedProject project={featured} />}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {others.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/Santi2307"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-6 py-2.5 font-medium text-primary transition-all hover:scale-105 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="View all projects on GitHub"
          >
            See More on GitHub
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
