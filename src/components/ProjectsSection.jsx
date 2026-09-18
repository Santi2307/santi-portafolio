import { useCallback, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const PROJECTS = [
  {
    id: "m365-entra-intune-lab",
    title: "Enterprise Identity & Device Management Lab",
    tagline: "Repo: m365-entra-intune-lab",
    summary:
      "Simulated a 20-user enterprise organization with group-based licensing, Multi-Factor Authentication (MFA), Conditional Access, and Intune device enrollment.",
    description:
      "Built a full Microsoft 365 tenant from scratch to replicate the identity and endpoint stack used by most enterprise service desks. Structured 20 users across departmental security groups, automated license assignment through group membership, and layered Entra ID Conditional Access on top of MFA to control access by device compliance, location, and application. Windows endpoints were enrolled in Microsoft Intune with configuration profiles, compliance policies, and managed app deployment, then validated against common tier-1 support scenarios such as account lockouts, MFA re-registration, and non-compliant devices.",
    category: "systems",
    courses: [],
    year: "2026",
    outcomes: [
      "Provisioned 20 users across departmental security groups with dynamic membership rules and group-based licensing, removing per-user manual assignment.",
      "Enforced MFA and Conditional Access policies covering legacy authentication blocking, device compliance requirements, and location-based sign-in restrictions.",
      "Enrolled and managed Windows endpoints in Intune using configuration profiles, compliance policies, and automated application deployment.",
      "Documented tier-1 resolution runbooks for account lockouts, SSPR failures, MFA re-registration, and non-compliant device remediation.",
    ],
    tags: [
      "Microsoft 365",
      "Entra ID",
      "Intune",
      "Conditional Access",
      "MFA",
      "Endpoint Management",
      "RBAC",
      "Windows",
    ],
    featured: true,
    githubUrl: "https://github.com/Santi2307/m365-entra-intune-lab",
    demoUrl: null,
  },
  {
    id: "servicedesk-glpi-lab",
    title: "IT Service Desk Deployment & Ticket Workflow",
    tagline: "Repo: servicedesk-glpi-lab",
    summary:
      "Self-hosted GLPI ticketing system with ITIL-based categorization, priority tiers, SLA targets, and 25 documented incident resolutions.",
    description:
      "Deployed a production-style service desk on a multi-container Docker stack (GLPI, MariaDB, reverse proxy) and configured it as a real support operation rather than a bare install. Defined ticket categories, urgency/impact matrices for priority calculation, SLA escalation rules, and technician groups with role-based permissions. Populated the instance with 25 realistic incidents spanning identity, endpoint, network, and printing issues, each resolved with documented diagnostic steps and closure notes.",
    category: "systems",
    courses: [],
    year: "2026",
    outcomes: [
      "Deployed GLPI with MariaDB on a containerized stack, including persistent volumes and automated backups.",
      "Configured an urgency/impact priority matrix with SLA targets and automated escalation rules per ticket tier.",
      "Resolved and documented 25 simulated incidents across identity, endpoint, network, and printing categories.",
      "Built asset inventory and CMDB records linked to tickets to trace recurring hardware and software failures.",
    ],
    tags: [
      "GLPI",
      "Docker",
      "ITIL",
      "MariaDB",
      "SLA",
      "Ticketing",
      "CMDB",
      "Linux",
    ],
    githubUrl: "https://github.com/Santi2307/servicedesk-glpi-lab",
    demoUrl: null,
  },
  {
    id: "it-support-knowledge-base",
    title: "IT Support Knowledge Base & Runbooks (EN/ES)",
    tagline: "Repo: it-support-knowledge-base",
    summary:
      "Bilingual documentation site with 15 step-by-step troubleshooting runbooks covering identity, endpoint, network, and printing issues.",
    description:
      "Built and published a searchable knowledge base modeled on the internal documentation used by enterprise service desks. Each runbook follows a consistent structure: symptom, likely causes, verification steps, resolution procedure, and escalation criteria, so a tier-1 technician can follow it without prior context. Written in both English and Spanish, with screenshots and command snippets, and organized by category with tag-based filtering and full-text search.",
    category: "documentation",
    courses: [],
    year: "2026",
    outcomes: [
      "Authored 15 bilingual runbooks covering MFA re-registration, account lockouts, shared drive access, VPN failures, and network printing.",
      "Standardized every article around a symptom → diagnosis → resolution → escalation format to keep handoffs consistent.",
      "Built the site with React, Vite, and Tailwind, including tag filtering, full-text search, and EN/ES language switching.",
      "Defined escalation criteria and ticket-note templates so resolutions are reproducible by other technicians.",
    ],
    tags: [
      "Technical Writing",
      "React",
      "Vite",
      "Tailwind",
      "Documentation",
      "Troubleshooting",
      "Bilingual",
      "Service Desk",
    ],
    featured: true,
    githubUrl: "https://github.com/Santi2307/it-support-knowledge-base",
    demoUrl: "https://it-support-kb.vercel.app",
  },
  {
    id: "user-lifecycle-automation",
    title: "Automated User Onboarding & Offboarding",
    tagline: "Repo: user-lifecycle-automation",
    summary:
      "Scripted provisioning and deprovisioning of accounts, licenses, group membership, and data handoff via PowerShell and Microsoft Graph.",
    description:
      "Automated the two most repetitive and error-prone workflows on any service desk. The onboarding script reads a CSV of new hires and creates each Entra ID account, assigns department-based group membership and licensing, provisions the mailbox, sets a temporary password with forced MFA registration, and outputs a welcome ticket. The offboarding script reverses it: disables the account, revokes all active sessions and tokens, converts the mailbox to shared, transfers OneDrive ownership to the manager, and removes group and license assignments. Both run against the Microsoft Graph API with logging, dry-run mode, and idempotent checks to prevent duplicate or partial runs.",
    category: "automation",
    courses: [],
    year: "2025",
    outcomes: [
      "Reduced new-hire provisioning from roughly 20 minutes of manual portal clicks to a single scripted run per batch.",
      "Implemented offboarding with session revocation, mailbox conversion, and OneDrive ownership transfer to close security gaps on departure.",
      "Built dry-run mode, structured logging, and idempotency checks so scripts can be safely re-run after partial failures.",
      "Authenticated against Microsoft Graph using an app registration with least-privilege scopes instead of stored admin credentials.",
    ],
    tags: [
      "PowerShell",
      "Microsoft Graph",
      "Entra ID",
      "Automation",
      "Identity Lifecycle",
      "Exchange Online",
      "Scripting",
      "RBAC",
    ],
    featured: false,
    githubUrl: "https://github.com/Santi2307/user-lifecycle-automation",
    demoUrl: null,
  },
  {
    id: "network-troubleshooting-lab",
    title: "Network Troubleshooting Lab & Fault Diagnosis",
    tagline: "Repo: network-troubleshooting-lab",
    summary:
      "Ten documented network failure scenarios with real command output, root cause analysis, and resolution steps across Cisco IOS switching and routing.",
    description:
      "Built a multi-switch topology and deliberately introduced ten common production faults, then documented the diagnosis of each one the way a technician would write it in a ticket. Scenarios include VLAN misassignment, native VLAN mismatch on trunks, exhausted DHCP scopes, spanning-tree loops, duplex mismatches, missing default gateways, and DNS resolution failures. Each write-up captures the reported symptom, the verification commands run in sequence, the actual CLI output, the root cause, and the fix.",
    category: "networking",
    year: "2025",
    outcomes: [
      "Documented ten fault scenarios end to end with captured CLI output from show vlan, show interfaces trunk, show spanning-tree, and show ip dhcp binding.",
      "Established a repeatable diagnostic sequence moving from physical layer upward to isolate faults efficiently.",
      "Mapped each scenario to the escalation point where a tier-1 technician should hand off to network engineering.",
      "Produced ticket-ready resolution notes so findings can be reused as service desk documentation.",
    ],
    tags: [
      "Cisco IOS",
      "VLAN",
      "Spanning Tree",
      "DHCP",
      "Troubleshooting",
      "Packet Tracer",
      "Layer 2",
      "Network Support",
    ],
    featured: false,
    githubUrl: "https://github.com/Santi2307/network-troubleshooting-lab.git",
    demoUrl: null,
  },
];

const STATUS_LABELS = {
  capstone: "Capstone",
  internship: "Internship",
  live: "Live",
  "in-progress": "In Progress",
  coursework: "Coursework",
};

const CATEGORY_LABELS = {
  networking: "Networking",
  systems: "Systems Administration",
  cloud: "Cloud Infrastructure",
  automation: "Automation",
  web: "Web Development",
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
        index === total - 1 && "border-b",
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
              isOpen && "opacity-0 md:opacity-60",
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
                  {project.courses && project.courses.length > 0 && (
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
                            target={
                              project.demoUrl.startsWith("/")
                                ? "_self"
                                : "_blank"
                            }
                            rel="noopener noreferrer"
                            className="group/link flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                          >
                            <span className="flex items-center gap-2.5">
                              <ExternalLink
                                size={14}
                                className="text-muted-foreground"
                              />
                              <span className="font-medium">
                                View live demo
                              </span>
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
                              <Github
                                size={14}
                                className="text-muted-foreground"
                              />
                              <span className="font-medium">
                                View source code
                              </span>
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

  // All projects start closed
  const [openId, setOpenId] = useState(null);
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
              <span className="text-white">04</span> / projects
            </motion.p>
            <motion.h2
              id="projects-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
            >
              Recent Projects
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground md:block"
          >
            {PROJECTS.length} projects in systems, networking, cloud,
            automation, and the web. Click any title to learn more.
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
};;

export default ProjectsSection;
