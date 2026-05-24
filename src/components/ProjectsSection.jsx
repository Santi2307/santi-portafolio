import { useCallback, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  Plus,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const PROJECTS = [
  {
    id: "network-automation",
    title: "Enterprise Network Automation Platform",
    tagline: "Capstone — APL701 Applied Integration",
    summary:
      "Multi-vendor switch provisioning automated end-to-end with Ansible. Builds a repeatable, version-controlled foundation for production networks.",
    description:
      "For my capstone, I built Ansible roles and playbooks to fully automate the configuration of Aruba AOS-CX 6300 and 2530 switches. What used to require dozens of manual CLI sessions now executes idempotently from a single playbook — covering VLAN provisioning, DHCP scopes, OSPF dynamic routing, and LAG/LACP link aggregation across multiple switch models.",
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
    demoUrl: "https://demo.com",
  },
  {
    id: "linux-infrastructure",
    title: "Hardened Linux Infrastructure",
    tagline: "OPS445 · RHT524 · SEC220",
    summary:
      "Multi-server RHEL environment configured to RHCSA exam standards, hardened with SELinux, and containerized with Podman.",
    description:
      "Built across the Open System Administration and Red Hat Certification courses. Covers the full RHCSA blueprint — LVM-based storage, NFS file sharing with autofs, custom SELinux policies, Podman container deployments, and centralized authentication.",
    category: "systems",
    courses: ["OPS445", "RHT524", "OPS635", "SEC220"],
    year: "2025",
    status: "coursework",
    outcomes: [
      "Configured LVM volume groups, NFS exports, and autofs maps across multiple hosts",
      "Implemented SELinux mandatory access controls with custom policy modules",
      "Deployed containerized services with Podman in rootless mode",
      "Aligned with RHCSA (EX200) exam objectives",
    ],
    tags: ["RHEL", "Bash", "LVM", "NFS", "SELinux", "Podman", "autofs", "Systemd"],
    githubUrl: "https://github.com/Santi2307",
    demoUrl: "https://demo.com",
  },
  {
    id: "azure-cloud-workspace",
    title: "Azure Hybrid Cloud Workspace",
    tagline: "MST400 · CPO550 Azure Administrator Track",
    summary:
      "End-to-end Azure Virtual Desktop deployment with hybrid identity, profile management, and conditional access — aligned to the AZ-104 certification path.",
    description:
      "Designed and deployed a production-ready AVD environment in Microsoft Azure. Includes session host pools, FSLogix profile containers, hybrid identity through Microsoft Entra ID, and conditional access policies for security.",
    category: "cloud",
    courses: ["MST400", "CPO550", "MST300"],
    year: "2026",
    status: "coursework",
    outcomes: [
      "Architected a multi-session AVD host pool with FSLogix profile containers",
      "Configured hybrid identity via Microsoft Entra ID",
      "Applied conditional access policies and MFA enforcement",
      "Coursework aligned with Microsoft AZ-104 objectives",
    ],
    tags: ["Microsoft Azure", "AVD", "Entra ID", "FSLogix", "PowerShell", "ARM"],
    githubUrl: "https://github.com/Santi2307",
    demoUrl: "https://demo.com",
  },
  {
    id: "marsupial-platform",
    title: "Calzado Marsupial — Customer Self-Service",
    tagline: "Production system for my family's footwear business",
    summary:
      "End-to-end WhatsApp purchasing platform integrated with the company's existing ERP. Replaces manual customer-service workflows with a guided self-service experience.",
    description:
      "Engineered the conversation flow, integrations, and routing logic for a customer self-service platform on WhatsApp Business. Connects directly to the company's Cuenti ERP, with city-based order routing, CRM verification, dynamic product catalogs, and order tracking.",
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
    githubUrl: "https://github.com/Santi2307/",
    demoUrl: "https://demo.com",
  },
  {
    id: "portfolio-design-system",
    title: "Interactive Portfolio & Design System",
    tagline: "The site you're reading",
    summary:
      "Custom-designed single-page application built from scratch — no UI kit, no template. Every animation, component, and interaction is mine.",
    description:
      "React + Vite single-page application with a custom design system, fluid Framer Motion animations, and Zustand-managed global state. Built mobile-first, fully responsive, and accessibility-conscious throughout.",
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

const STATUS_LABELS = {
  capstone:      "Capstone",
  internship:    "Internship",
  live:          "Live",
  "in-progress": "In Progress",
  coursework:    "Coursework",
};

const CATEGORY_LABELS = {
  networking: "Networking",
  systems:    "Systems Administration",
  cloud:      "Cloud Infrastructure",
  automation: "Automation",
  web:        "Web Development",
};

const EASE_OUT = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════════════════════════════════
   STATUS PILL — minimal, no color dots
   ═══════════════════════════════════════════════════════════════════════ */

const StatusPill = ({ status }) => {
  const reducedMotion = useReducedMotion();
  const label = STATUS_LABELS[status] ?? status;
  const isPulsing = status === "live" || status === "in-progress";

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span className="relative inline-flex h-1 w-1">
        {isPulsing && !reducedMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-foreground"
            animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="relative h-full w-full rounded-full bg-foreground" />
      </span>
      {label}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   PROJECT ROW — editorial expandable case study
   ═══════════════════════════════════════════════════════════════════════ */

const ProjectRow = ({ project, index, total, isOpen, onToggle }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const hasLinks = project.githubUrl || project.demoUrl;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: reducedMotion ? 0 : Math.min(index * 0.06, 0.36),
        duration: 0.6,
        ease: EASE_OUT,
      }}
      className={cn(
        "group relative border-t border-border",
        index === total - 1 && "border-b"
      )}
    >
      {/* Trigger row */}
      <button
        type="button"
        onClick={() => onToggle(project.id)}
        aria-expanded={isOpen}
        aria-controls={`project-detail-${project.id}`}
        className="grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-4 px-1 py-6 text-left transition-colors hover:bg-foreground/[0.015] md:grid-cols-[auto_1fr_auto_auto_auto] md:gap-6 md:py-7"
      >
        {/* Index */}
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title + tagline */}
        <div className="min-w-0">
          <h3 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
            {project.title}
          </h3>
          <p
            className={cn(
              "mt-1 truncate font-mono text-xs text-muted-foreground transition-opacity duration-300",
              isOpen && "opacity-0 md:opacity-60"
            )}
          >
            {project.tagline}
          </p>
        </div>

        {/* Category — desktop only */}
        <span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:inline">
          {CATEGORY_LABELS[project.category]}
        </span>

        {/* Year — desktop only */}
        <span className="hidden font-mono text-[10px] tabular-nums text-muted-foreground/70 md:inline">
          {project.year}
        </span>

        {/* Plus icon */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden
        >
          <Plus size={18} />
        </motion.span>
      </button>

      {/* Mobile meta row — visible only on small screens */}
      <div className="-mt-4 mb-2 flex items-center gap-3 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:hidden">
        <span>{CATEGORY_LABELS[project.category]}</span>
        <span className="opacity-40">·</span>
        <span className="tabular-nums">{project.year}</span>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`project-detail-${project.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-10 px-1 pb-10 pt-2 md:grid-cols-12 md:gap-12">
              {/* LEFT — narrative */}
              <div className="md:col-span-7 md:col-start-1">
                {/* Status + courses strip */}
                <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusPill status={project.status} />
                  {project.courses.length > 0 && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <div className="flex flex-wrap gap-1">
                        {project.courses.map((code) => (
                          <span
                            key={code}
                            className="rounded border border-border bg-card/40 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-[15px] leading-relaxed text-foreground/80">
                  {project.description}
                </p>

                {/* Outcomes */}
                <div className="mt-6">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Key Outcomes
                  </p>
                  <ul className="space-y-2">
                    {project.outcomes.map((outcome, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-relaxed text-foreground/75"
                      >
                        <span className="mt-2 inline-block h-px w-3 bg-foreground/40" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT — sidebar with meta + tags + links */}
              <aside className="md:col-span-5">
                <div className="space-y-6 md:sticky md:top-24">
                  {/* Meta data — Tags */}
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-transparent px-2.5 py-0.5 text-[11px] font-medium text-foreground/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Links
                    </p>
                    {hasLinks ? (
                      <div className="flex flex-col gap-2">
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target={project.demoUrl.startsWith("/") ? "_self" : "_blank"}
                            rel="noopener noreferrer"
                            className="group/link flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                          >
                            <span className="flex items-center gap-2.5">
                              <ExternalLink size={14} className="text-muted-foreground" />
                              <span className="font-medium">View live demo</span>
                            </span>
                            <ArrowUpRight
                              size={14}
                              className="text-muted-foreground transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-foreground"
                            />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                          >
                            <span className="flex items-center gap-2.5">
                              <Github size={14} className="text-muted-foreground" />
                              <span className="font-medium">View source code</span>
                            </span>
                            <ArrowUpRight
                              size={14}
                              className="text-muted-foreground transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-foreground"
                            />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                        <Lock size={12} aria-hidden="true" />
                        <span>Private — available on request</span>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // First project open by default — invites interaction
  const [openId, setOpenId] = useState(PROJECTS[0].id);
  const handleToggle = useCallback((id) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-24 md:py-32"
      aria-labelledby="projects-heading"
    >
      <div className="container mx-auto max-w-6xl">

        {/* ─── Section header ─── */}
        <div className="mb-16 flex items-end justify-between gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              <span className="text-primary">§ 04</span>
              <span className="mx-2 opacity-40">/</span>
              Projects
            </motion.p>
            <motion.h2
              id="projects-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              Selected work <br className="hidden sm:block" />
              across the stack.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground md:block"
          >
            {PROJECTS.length} projects in systems, networking, cloud, automation,
            and the web. Click any title to read the case study.
          </motion.div>
        </div>

        {/* ─── Column headers (desktop only) ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-2 hidden grid-cols-[auto_1fr_auto_auto_auto] items-baseline gap-6 px-1 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:grid"
        >
          <span className="w-4" aria-hidden />
          <span>Project</span>
          <span>Category</span>
          <span>Year</span>
          <span className="w-[18px]" aria-hidden />
        </motion.div>

        {/* ─── Projects list ─── */}
        <div role="list" aria-label="Projects">
          {PROJECTS.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={i}
              total={PROJECTS.length}
              isOpen={openId === project.id}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* ─── See more CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            More on GitHub
          </p>
          <a
            href="https://github.com/Santi2307"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            aria-label="View all projects on GitHub"
          >
            <Github size={14} />
            <span>View all repositories</span>
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
