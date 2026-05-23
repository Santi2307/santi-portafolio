import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Each skill includes:
 *   level   — 1: Familiar, 2: Working knowledge, 3: Comfortable, 4: Proficient
 *   courses — Seneca course codes where the skill was acquired
 */
const SKILLS = [
  /* Systems */
  {
    name: "Linux (RHEL / Ubuntu)",
    category: "systems",
    level: 4,
    courses: [
      "ULI101",
      "OPS245",
      "OPS345",
      "OPS445",
      "RHT524",
      "RHT634",
      "OPS635",
    ],
  },
  {
    name: "Bash Scripting",
    category: "systems",
    level: 4,
    courses: ["OPS445"],
  },
  {
    name: "Virtualization",
    category: "systems",
    level: 3,
    courses: ["MST200", "OPS245"],
    note: "VMware, VirtualBox, Hyper-V",
  },
  {
    name: "Windows Server",
    category: "systems",
    level: 3,
    courses: ["MST100", "MST200", "MST400", "CPO550"],
  },
  { name: "LVM & Storage", category: "systems", level: 3, courses: ["OPS635"] },
  {
    name: "PowerShell",
    category: "systems",
    level: 2,
    courses: ["MST200", "MST300", "MST400", "CPO550"],
  },

  /* Networking */
  {
    name: "Cisco IOS",
    category: "networking",
    level: 3,
    courses: ["CSN305", "CPO520"],
  },
  {
    name: "Aruba AOS-CX",
    category: "networking",
    level: 3,
    courses: ["APL701"],
  },
  {
    name: "VLANs & Trunking",
    category: "networking",
    level: 4,
    courses: ["CSN205", "CSN305"],
  },
  {
    name: "OSPF & DHCP",
    category: "networking",
    level: 3,
    courses: ["CSN305", "CSN405", "CSN505", "APL701"],
  },
  {
    name: "Wireless & RF",
    category: "networking",
    level: 3,
    courses: ["CSN405"],
    note: "Link budget, Fresnel zone, EIRP",
  },
  {
    name: "Packet Tracer",
    category: "networking",
    level: 4,
    courses: ["CSN105", "CSN205", "CSN305"],
  },

  /* Cloud & Automation */
  {
    name: "Ansible",
    category: "cloud",
    level: 4,
    courses: ["APL701"],
    note: "Aruba switch automation capstone",
  },
  { name: "Docker / Podman", category: "cloud", level: 3, courses: ["OPS445"] },
  { name: "OpenShift", category: "cloud", level: 2, courses: ["OPS635"] },
  {
    name: "Microsoft Azure",
    category: "cloud",
    level: 3,
    courses: ["MST200", "MST300", "MST400", "CPO550"],
  },
  {
    name: "Azure Virtual Desktop",
    category: "cloud",
    level: 3,
    courses: ["MST400"],
  },
  { name: "GlusterFS", category: "cloud", level: 2, courses: ["OPS635"] },

  /* Security */
  {
    name: "Incident Response",
    category: "security",
    level: 3,
    courses: ["SEC320"],
  },
  {
    name: "Security Analysis",
    category: "security",
    level: 2,
    courses: ["SEC400"],
  },
  {
    name: "SELinux & Hardening",
    category: "security",
    level: 3,
    courses: ["OPS445", "SEC220"],
  },

  /* Databases */
  {
    name: "PostgreSQL / SQL",
    category: "databases",
    level: 3,
    courses: ["DAT330"],
  },

  /* Web Development */
  {
    name: "React",
    category: "web",
    level: 4,
    courses: [],
    note: "Santi's Portfolio",
  },
  { name: "JavaScript (ES6+)", category: "web", level: 4 },
  { name: "HTML / CSS", category: "web", level: 4 },
  { name: "Tailwind CSS", category: "web", level: 4 },
  { name: "Git / GitHub", category: "web", level: 4 },
];

const CATEGORIES = [
  { id: "all", label: "All", index: "00" },
  { id: "systems", label: "Systems", index: "01" },
  { id: "networking", label: "Networking", index: "02" },
  { id: "cloud", label: "Cloud & Automation", index: "03" },
  { id: "security", label: "Security", index: "04" },
  { id: "databases", label: "Databases", index: "05" },
  { id: "web", label: "Web Development", index: "06" },
];

const LEVEL_LABELS = {
  1: "Familiar",
  2: "Working knowledge",
  3: "Comfortable",
  4: "Proficient",
};

const EASE_OUT = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════════════════════════════════
   PROFICIENCY DOTS — minimalist 4-step indicator
   ═══════════════════════════════════════════════════════════════════════ */

const ProficiencyDots = ({ level }) => (
  <div
    className="flex items-center gap-1"
    role="img"
    aria-label={`${LEVEL_LABELS[level]} (${level} of 4)`}
  >
    {[1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className={cn(
          "h-1 w-1 rounded-full transition-colors",
          i <= level ? "bg-foreground" : "bg-foreground/15",
        )}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   SKILL ROW — editorial-style horizontal row, not a card
   ═══════════════════════════════════════════════════════════════════════ */

const SkillRow = ({ skill, index }) => {
  const reducedMotion = useReducedMotion();
  const tooltipId = `skill-${skill.name.replace(/\W+/g, "-").toLowerCase()}-info`;
  const hasContext = (skill.courses?.length ?? 0) > 0 || skill.note;
  const totalCourses = skill.courses?.length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{
        delay: reducedMotion ? 0 : Math.min(index * 0.025, 0.4),
        duration: 0.4,
        ease: EASE_OUT,
        layout: { duration: 0.3 },
      }}
      className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-4 transition-colors hover:bg-foreground/[0.015] md:grid-cols-[auto_1fr_auto_auto] md:gap-6"
      role="listitem"
      aria-describedby={hasContext ? tooltipId : undefined}
    >
      {/* Index number */}
      <span className="w-8 font-mono text-[10px] tabular-nums text-muted-foreground/60">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Name + meta */}
      <div className="min-w-0">
        <h4 className="text-[15px] font-medium leading-tight text-foreground">
          {skill.name}
        </h4>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-muted-foreground">
          <span className="uppercase tracking-[0.12em] text-muted-foreground/70">
            {skill.category}
          </span>
          {totalCourses > 0 && (
            <>
              <span className="opacity-40">·</span>
              <span className="inline-flex items-center gap-1.5">
                {skill.courses.slice(0, 4).map((code) => (
                  <span
                    key={code}
                    className="rounded border border-border bg-card/40 px-1.5 py-0.5 tabular-nums"
                  >
                    {code}
                  </span>
                ))}
                {totalCourses > 4 && (
                  <span className="text-muted-foreground/60">
                    +{totalCourses - 4}
                  </span>
                )}
              </span>
            </>
          )}
          {skill.note && (
            <>
              <span className="opacity-40">·</span>
              <span className="italic opacity-80">{skill.note}</span>
            </>
          )}
        </div>
      </div>

      {/* Proficiency level (text on desktop) */}
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 md:inline">
        {LEVEL_LABELS[skill.level]}
      </span>

      {/* Dots */}
      <ProficiencyDots level={skill.level} />

      {hasContext && (
        <span id={tooltipId} className="sr-only">
          {LEVEL_LABELS[skill.level]}.
          {totalCourses > 0 && ` Learned in ${skill.courses.join(", ")}.`}
          {skill.note && ` ${skill.note}.`}
        </span>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   FILTER RAIL — vertical rail on desktop, horizontal scroll on mobile
   ═══════════════════════════════════════════════════════════════════════ */

const FilterRail = ({
  categories,
  activeCategory,
  setActiveCategory,
  counts,
}) => (
  <div
    role="tablist"
    aria-label="Filter skills by category"
    className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:gap-0 md:overflow-visible md:pb-0"
  >
    {categories.map((cat) => {
      const isActive = activeCategory === cat.id;
      return (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          role="tab"
          aria-selected={isActive}
          aria-controls="skills-grid"
          className={cn(
            "group relative flex shrink-0 items-baseline gap-2.5 whitespace-nowrap px-3 py-2 text-left font-mono text-xs transition-colors md:whitespace-normal md:px-0 md:py-2.5",
            isActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {/* Vertical bar indicator on desktop */}
          {isActive && (
            <motion.span
              layoutId="filter-rail-indicator"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-hidden
              className="absolute left-0 top-1/2 hidden h-3 w-px -translate-y-1/2 bg-foreground md:block"
            />
          )}

          <span className="hidden text-[10px] tabular-nums text-muted-foreground/50 md:inline md:pl-3">
            {cat.index}
          </span>
          <span className="font-medium">{cat.label.toLowerCase()}</span>
          <span
            className={cn(
              "ml-auto tabular-nums transition-colors",
              isActive
                ? "text-foreground/70"
                : "text-muted-foreground/40 group-hover:text-muted-foreground",
            )}
          >
            {counts[cat.id] ?? 0}
          </span>
        </button>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   SEARCH INPUT — bare-bones, monospaced
   ═══════════════════════════════════════════════════════════════════════ */

const SearchInput = ({ value, onChange }) => (
  <div className="relative w-full">
    <Search
      size={13}
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="search by name, course, or keyword…"
      aria-label="Search skills"
      className="w-full rounded-full border border-border bg-card/30 py-2 pl-9 pr-9 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground/40 focus:bg-card/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20"
    />
    <AnimatePresence>
      {value && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={12} />
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  // Debounce search input — feels instant, skips noisy keystrokes
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  // Live counts per category (after search filter is applied)
  const counts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const matchesSearch = (s) =>
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.courses?.some((c) => c.toLowerCase().includes(term)) ||
      s.note?.toLowerCase().includes(term);

    const result = { all: 0 };
    for (const cat of CATEGORIES) if (cat.id !== "all") result[cat.id] = 0;

    for (const skill of SKILLS) {
      if (!matchesSearch(skill)) continue;
      result.all += 1;
      result[skill.category] = (result[skill.category] ?? 0) + 1;
    }
    return result;
  }, [debouncedSearch]);

  // Filtered + sorted skills
  const filteredSkills = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return SKILLS.filter(
      (s) => activeCategory === "all" || s.category === activeCategory,
    )
      .filter(
        (s) =>
          !term ||
          s.name.toLowerCase().includes(term) ||
          s.courses?.some((c) => c.toLowerCase().includes(term)) ||
          s.note?.toLowerCase().includes(term),
      )
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  }, [activeCategory, debouncedSearch]);

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setSearch("");
  }, []);

  return (
    <section
      id="skills"
      ref={ref}
      className="relative overflow-hidden px-4 py-24 md:py-32"
      aria-labelledby="skills-heading"
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
              <span className="text-primary">§ 03</span>
              <span className="mx-2 opacity-40">/</span>
              Skills
            </motion.p>
            <motion.h2
              id="skills-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              What I work <br className="hidden sm:block" />
              with daily.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground md:block"
          >
            {SKILLS.length} tools and technologies. Filter by category or search
            by Seneca course code.
          </motion.div>
        </div>

        {/* ─── Two-column body ─── */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
          {/* LEFT — Filter rail + search */}
          <aside className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6 md:sticky md:top-24"
            >
              <div>
                <p className="mb-4 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:block">
                  Filter
                </p>
                <FilterRail
                  categories={CATEGORIES}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  counts={counts}
                />
              </div>

              <div>
                <p className="mb-3 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:block">
                  Search
                </p>
                <SearchInput value={search} onChange={setSearch} />
              </div>
            </motion.div>
          </aside>

          {/* RIGHT — Skills list */}
          <div className="md:col-span-9">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-4 flex items-baseline justify-between border-b border-border pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>
                Showing{" "}
                <span className="text-foreground">{filteredSkills.length}</span>
                <span className="opacity-50"> / {SKILLS.length}</span>
              </span>
              {debouncedSearch && (
                <span className="normal-case tracking-normal">
                  matching{" "}
                  <span className="text-foreground">"{debouncedSearch}"</span>
                </span>
              )}
              <span className="hidden md:inline">Proficiency</span>
            </motion.div>

            <motion.div
              id="skills-grid"
              layout
              role="list"
              aria-label="Skills"
              aria-live="polite"
            >
              <AnimatePresence mode="popLayout">
                {filteredSkills.map((skill, i) => (
                  <SkillRow key={skill.name} skill={skill} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            <AnimatePresence>
              {filteredSkills.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-12 border border-dashed border-border p-10 text-center"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    No results
                  </p>
                  <p className="mt-3 text-sm text-foreground">
                    Nothing matches that filter.
                  </p>
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    try{" "}
                    <button
                      className="text-foreground underline-offset-4 hover:underline"
                      onClick={() => setSearch("linux")}
                    >
                      linux
                    </button>
                    {" · "}
                    <button
                      className="text-foreground underline-offset-4 hover:underline"
                      onClick={() => setSearch("ansible")}
                    >
                      ansible
                    </button>
                    {" · "}
                    <button
                      className="text-foreground underline-offset-4 hover:underline"
                      onClick={resetFilters}
                    >
                      reset
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
