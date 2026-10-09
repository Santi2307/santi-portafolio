import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Github, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   Shipped = public and verifiable. In progress = planned scope, written as a
   plan (no results yet). When a lab is published: move it up, set status to
   "done", add the repo link and rewrite `points` as what it actually does.
   ═══════════════════════════════════════════════════════════════════════ */

const SHIPPED = [
  {
    id: "english-website",
    title: "English Academy",
    summary: "A speaking-first English learning platform, from database to deploy.",
    category: "Web",
    year: "2026",
    status: "live",
    description:
      "A full-stack platform where students take a level test, buy courses and practice speaking. I built both the front end and the API, and deployed them as separate services.",
    points: [
      "React + TypeScript front end, Express + Prisma API, PostgreSQL on Neon.",
      "Accounts with secure cookie sessions, password reset and email verification.",
      "Transactional emails in the user's language and local time zone.",
      "Deployed on Vercel (web) and Render (API), with the API proxied under the same domain.",
    ],
    stack: ["React", "TypeScript", "Express", "Prisma", "PostgreSQL", "Vercel", "Render"],
    live: "https://english-website-orpin.vercel.app",
    repo: "https://github.com/Santi2307/english-website",
  },
  {
    id: "marsupial-store",
    title: "Marsupial Store",
    summary: "Online store for a handmade footwear brand in Colombia, with WhatsApp checkout.",
    category: "Web",
    year: "2026",
    status: "live",
    description:
      "A catalog and cart for a family footwear workshop in Bucaramanga. Instead of a payment gateway, the cart becomes a ready-to-send WhatsApp order, which is how the business already sells.",
    points: [
      "Catalog driven by a single JSON file, so products can be updated without touching code.",
      "Filters, sorting, favorites and a cart that survives page reloads.",
      "Free-shipping rule and order message built automatically from the cart.",
      "Wholesale section for brands and resellers.",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "Zustand", "Vercel"],
    live: "https://johana-marsupial-portfolio.vercel.app",
    repo: "https://github.com/Santi2307/johana-marsupial-portfolio",
  },
  {
    id: "network-troubleshooting-lab",
    title: "VLAN Troubleshooting Lab",
    summary: "Finding why one workstation lost its connection in a two-VLAN network.",
    category: "Networking",
    year: "2026",
    status: "done",
    description:
      "A Cisco Packet Tracer network with a router and three switches serving two departments, Finance (VLAN 10) and Engineering (VLAN 20). One Finance PC suddenly goes offline; the lab walks through finding and fixing the cause.",
    points: [
      "Router-on-a-stick inter-VLAN routing over 802.1Q trunks.",
      "Diagnosed with show interfaces status, show vlan brief and show interfaces trunk.",
      "Root cause: the access port was on VLAN 1 instead of VLAN 10. Fixed and verified with pings.",
      "The .pkt file is included so anyone can open it and test it.",
    ],
    stack: ["Cisco IOS", "Packet Tracer", "VLANs", "802.1Q", "Inter-VLAN routing"],
    live: null,
    repo: "https://github.com/Santi2307/network-troubleshooting-lab",
  },
];

const IN_PROGRESS = [
  {
    id: "m365-entra-intune-lab",
    title: "Identity & Device Management Lab",
    summary: "A small company on Microsoft 365, set up like a real service desk would.",
    category: "Systems",
    year: "2026",
    status: "building",
    description:
      "A Microsoft 365 tenant for a simulated 20-person company, used to practice the identity and device work that tier-1 support handles every day.",
    points: [
      "Users and security groups by department, with licenses assigned by group.",
      "MFA and Conditional Access policies.",
      "Windows devices enrolled in Intune with compliance and configuration profiles.",
      "Runbooks for lockouts, MFA re-registration and non-compliant devices.",
    ],
    stack: ["Microsoft 365", "Entra ID", "Intune", "Conditional Access", "Windows"],
  },
  {
    id: "servicedesk-glpi-lab",
    title: "Service Desk with GLPI",
    summary: "A self-hosted ticketing system configured like a working support desk.",
    category: "Systems",
    year: "2026",
    status: "building",
    description:
      "GLPI running in Docker, set up with the categories, priorities and SLAs a real support team uses, then filled with realistic tickets to work through.",
    points: [
      "GLPI + MariaDB in Docker with persistent storage and backups.",
      "Priority matrix (urgency × impact) with SLA targets and escalation.",
      "Simulated incidents across identity, devices, network and printing, each documented.",
      "Asset inventory linked to tickets.",
    ],
    stack: ["GLPI", "Docker", "MariaDB", "ITIL", "Linux"],
  },
  {
    id: "it-support-knowledge-base",
    title: "IT Support Knowledge Base",
    summary: "Bilingual troubleshooting runbooks a new technician could follow on day one.",
    category: "Documentation",
    year: "2026",
    status: "building",
    description:
      "A searchable documentation site in English and Spanish, with one consistent format per article: symptom, likely causes, checks, fix and when to escalate.",
    points: [
      "Runbooks for MFA, lockouts, shared drives, VPN and printing.",
      "Search, tags and an EN/ES switch.",
      "Ticket-note templates so fixes can be repeated by anyone.",
    ],
    stack: ["React", "Vite", "Tailwind CSS", "Technical writing"],
  },
  {
    id: "user-lifecycle-automation",
    title: "User Onboarding & Offboarding Scripts",
    summary: "Scripts that create and remove user accounts safely, end to end.",
    category: "Automation",
    year: "2026",
    status: "building",
    description:
      "PowerShell scripts on the Microsoft Graph API that take a list of new hires and set everything up, and do the reverse when someone leaves.",
    points: [
      "Onboarding from a CSV: account, groups, licenses, mailbox and first-sign-in MFA.",
      "Offboarding: disable the account, revoke sessions, hand mailbox and OneDrive to the manager.",
      "Dry-run mode and logs, safe to run again after a partial failure.",
      "App registration with least-privilege permissions, no stored admin passwords.",
    ],
    stack: ["PowerShell", "Microsoft Graph", "Entra ID", "Exchange Online"],
  },
];

const STATUS = {
  live: "Live",
  done: "Done",
  building: "In progress",
};

const EASE_OUT = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════════════════════════════════
   PIECES
   ═══════════════════════════════════════════════════════════════════════ */

const Label = ({ children }) => (
  <p className="mb-3 font-mono text-xs text-foreground/50">{children}</p>
);

const LinkButton = ({ href, icon: Icon, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group/link inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
  >
    {Icon && <Icon size={14} className="text-foreground/60" />}
    {children}
    <ArrowUpRight size={14} className="text-foreground/50 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
  </a>
);

const ProjectRow = ({ project, index, isLast, isOpen, onToggle }) => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const building = project.status === "building";

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.05, 0.3), duration: 0.6, ease: EASE_OUT }}
      className={cn("group border-t border-border", isLast && "border-b")}
    >
      <button
        type="button"
        onClick={() => onToggle(project.id)}
        aria-expanded={isOpen}
        aria-controls={`project-${project.id}`}
        className="grid w-full grid-cols-[1fr_auto] items-start gap-4 px-1 py-6 text-left md:grid-cols-[1fr_auto_auto] md:items-center md:gap-8"
      >
        <div className="min-w-0">
          <h3 className={cn("text-xl font-semibold tracking-tight md:text-2xl", building && "text-foreground/80")}>
            {project.title}
          </h3>
          <p className="mt-1.5 text-sm text-foreground/60">{project.summary}</p>
          <p className="mt-2 font-mono text-xs text-foreground/45 md:hidden">
            {project.category} · {project.year} · {STATUS[project.status]}
          </p>
        </div>

        <span className="hidden whitespace-nowrap font-mono text-xs text-foreground/45 md:inline">
          {project.category} · {project.year} · {STATUS[project.status]}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mt-1 text-foreground/50 transition-colors group-hover:text-foreground md:mt-0"
          aria-hidden
        >
          <Plus size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`project-${project.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-10 px-1 pb-10 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-7">
                <p className="text-[15px] leading-relaxed text-foreground/80">{project.description}</p>

                <div className="mt-6">
                  <Label>{building ? "what it will cover" : "what I did"}</Label>
                  <ul className="space-y-2">
                    {project.points.map((point) => (
                      <li key={point} className="grid grid-cols-[auto_1fr] gap-3 text-sm leading-relaxed text-foreground/75">
                        <span className="mt-2.5 inline-block h-px w-3 bg-foreground/40" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="space-y-6 md:col-span-5">
                <div>
                  <Label>stack</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>links</Label>
                  {project.live || project.repo ? (
                    <div className="flex flex-wrap gap-2">
                      {project.live && <LinkButton href={project.live}>Visit site</LinkButton>}
                      {project.repo && <LinkButton href={project.repo} icon={Github}>Code</LinkButton>}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/55">I&apos;m building this one now. The repo goes up when it&apos;s ready.</p>
                  )}
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

const Group = ({ title, note, projects, openId, onToggle, offset = 0 }) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
      <p className="font-mono text-xs text-foreground">{title}</p>
      <p className="font-mono text-xs text-foreground/45">{note}</p>
    </div>
    <div role="list" aria-label={title}>
      {projects.map((project, i) => (
        <ProjectRow
          key={project.id}
          project={project}
          index={offset + i}
          isLast={i === projects.length - 1}
          isOpen={openId === project.id}
          onToggle={onToggle}
        />
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [openId, setOpenId] = useState(null);
  const handleToggle = useCallback((id) => setOpenId((current) => (current === id ? null : id)), []);

  const show = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  });

  return (
    <section id="projects" ref={sectionRef} className="relative px-4 py-24 md:py-32" aria-labelledby="projects-heading">
      <div className="container mx-auto max-w-6xl text-left">
        <div className="mb-14">
          <motion.p {...show()} className="mb-3 font-mono text-xs tracking-wide text-foreground/50">
            <span className="text-foreground">04</span> / projects
          </motion.p>
          <motion.h2 {...show(0.05)} id="projects-heading" className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Things I&apos;ve built.
          </motion.h2>
          <motion.p {...show(0.1)} className="mt-4 max-w-xl text-foreground/60">
            A few things that are live, and the labs I&apos;m working on next. Open any of them for the details.
          </motion.p>
        </div>

        <motion.div {...show(0.15)} className="space-y-16">
          <Group title="shipped" note={`${SHIPPED.length} projects`} projects={SHIPPED} openId={openId} onToggle={handleToggle} />
          <Group
            title="in progress"
            note={`${IN_PROGRESS.length} labs`}
            projects={IN_PROGRESS}
            openId={openId}
            onToggle={handleToggle}
            offset={SHIPPED.length}
          />
        </motion.div>

        <div className="mt-14">
          <LinkButton href="https://github.com/Santi2307" icon={Github}>
            More on GitHub
          </LinkButton>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
