import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Skills data ───────────────────────────
 * Each skill includes:
 *   level   — 1: Familiar, 2: Working knowledge, 3: Comfortable, 4: Proficient
 *   courses — Seneca course codes where the skill was acquired
 */
const SKILLS = [
  /* Systems */
  { name: "Linux (RHEL / Ubuntu)", category: "systems",    level: 4, courses: ["ULI101", "OPS245", "OPS345", "OPS445", "RHT524", "RHT634", "OPS635"] },
  { name: "Bash Scripting",        category: "systems",    level: 4, courses: ["OPS445"] },
  { name: "Virtualization",        category: "systems",    level: 3, courses: ["MST200", "OPS245"], note: "VMware, VirtualBox, Hyper-V" },
  { name: "Windows Server",        category: "systems",    level: 3, courses: ["MST100", "MST200", "MST400", "CPO550"] },
  { name: "LVM & Storage",         category: "systems",    level: 3, courses: ["OPS635"] },
  { name: "PowerShell",            category: "systems",    level: 2, courses: ["MST200", "MST300", "MST400", "CPO550" ] },

  /* Networking */
  { name: "Cisco IOS",             category: "networking", level: 3, courses: ["CSN305", "CPO520"] },
  { name: "Aruba AOS-CX",          category: "networking", level: 3, courses: ["APL701"] },
  { name: "VLANs & Trunking",      category: "networking", level: 4, courses: ["CSN205", "CSN305"] },
  { name: "OSPF & DHCP",           category: "networking", level: 3, courses: ["CSN305","CSN405","CSN505", "APL701"] },
  { name: "Wireless & RF",         category: "networking", level: 3, courses: ["CSN405"], note: "Link budget, Fresnel zone, EIRP" },
  { name: "Packet Tracer",         category: "networking", level: 4, courses: ["CSN105", "CSN205", "CSN305"] },

  /* Cloud & Automation */
  { name: "Ansible",               category: "cloud",      level: 4, courses: ["APL701"], note: "Aruba switch automation capstone" },
  { name: "Docker / Podman",       category: "cloud",      level: 3, courses: ["OPS445"] },
  { name: "OpenShift",             category: "cloud",      level: 2, courses: ["OPS635"] },
  { name: "Microsoft Azure",       category: "cloud",      level: 3, courses: ["MST200","MST300", "MST400", "CPO550"] },
  { name: "Azure Virtual Desktop", category: "cloud",      level: 3, courses: ["MST400"] },
  { name: "GlusterFS",             category: "cloud",      level: 2, courses: ["OPS635"] },

  /* Security */
  { name: "Incident Response",     category: "security",   level: 3, courses: ["SEC320"] },
  { name: "Security Analysis",     category: "security",   level: 2, courses: ["SEC400"] },
  { name: "SELinux & Hardening",   category: "security",   level: 3, courses: ["OPS445", "SEC220"] },

  /* Databases */
  { name: "PostgreSQL / SQL",      category: "databases",  level: 3, courses: ["DAT330"] },

  /* Web Development */
  { name: "React", category: "web", level: 4, courses: [], note: "Santi's Portfolio" },
  { name: "JavaScript (ES6+)",     category: "web",        level: 4 },
  { name: "HTML / CSS",            category: "web",        level: 4 },
  { name: "Tailwind CSS",          category: "web",        level: 4 },
  { name: "Git / GitHub",          category: "web",        level: 4 },
];

const CATEGORIES = [
  { id: "all",        label: "All" },
  { id: "systems",    label: "Systems" },
  { id: "networking", label: "Networking" },
  { id: "cloud",      label: "Cloud & Automation" },
  { id: "security",   label: "Security" },
  { id: "databases",  label: "Databases" },
  { id: "web",        label: "Web Dev" },
];

const LEVEL_LABELS = {
  1: "Familiar",
  2: "Working knowledge",
  3: "Comfortable",
  4: "Proficient",
};

const EASE_OUT = [0.22, 1, 0.36, 1];

/* ─────────────────────────── Proficiency bar ─────────────────────────── */

const ProficiencyBar = ({ level, animate = true }) => {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${LEVEL_LABELS[level]} (${level} of 4)`}
    >
      {[1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          initial={animate ? { scaleX: 0, opacity: 0 } : false}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            delay: animate ? 0.08 * i : 0,
            duration: 0.35,
            ease: EASE_OUT,
          }}
          className={cn(
            "h-1 w-5 origin-left rounded-full transition-colors duration-300",
            i <= level ? "bg-primary" : "bg-primary/15"
          )}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────── Skill card ─────────────────────────── */

const SkillCard = ({ skill, index }) => {
  const reducedMotion = useReducedMotion();
  const tooltipId = `skill-${skill.name.replace(/\W+/g, "-").toLowerCase()}-info`;
  const hasContext = (skill.courses?.length ?? 0) > 0 || skill.note;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{
        delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.4),
        duration: 0.4,
        ease: EASE_OUT,
        layout: { duration: 0.3 },
      }}
      whileHover={reducedMotion ? {} : { y: -3 }}
      className="group relative flex flex-col gap-3 rounded-xl border border-primary/10 bg-card/50 p-5 backdrop-blur-sm transition-shadow duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
      role="listitem"
      aria-describedby={hasContext ? tooltipId : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-tight">{skill.name}</h4>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          {skill.category}
        </span>
      </div>

      <ProficiencyBar level={skill.level} />

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {skill.courses?.slice(0, 3).map((code) => (
          <span
            key={code}
            className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px]"
          >
            {code}
          </span>
        ))}
        {skill.courses?.length > 3 && (
          <span className="text-[10px]">+{skill.courses.length - 3}</span>
        )}
        {skill.note && (
          <span className="text-[10px] italic opacity-80">— {skill.note}</span>
        )}
      </div>

      {/* Hidden description for screen readers */}
      {hasContext && (
        <span id={tooltipId} className="sr-only">
          {LEVEL_LABELS[skill.level]}.
          {skill.courses?.length > 0 && ` Learned in ${skill.courses.join(", ")}.`}
          {skill.note && ` ${skill.note}.`}
        </span>
      )}
    </motion.div>
  );
};

/* ─────────────────────────── Filter tabs ─────────────────────────── */

const FilterTabs = ({ categories, activeCategory, setActiveCategory, counts }) => {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="tablist"
      aria-label="Filter skills by category"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
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
            aria-controls="skills-grid"
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
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
};

/* ─────────────────────────── Search input ─────────────────────────── */

const SearchInput = ({ value, onChange }) => (
  <div className="relative mx-auto w-full max-w-sm">
    <Search
      size={16}
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search skills…"
      aria-label="Search skills"
      className="w-full rounded-full border border-border bg-background/50 py-2 pl-9 pr-9 text-sm backdrop-blur-sm transition-colors focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    />
    <AnimatePresence>
      {value && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={14} />
        </motion.button>
      )}
    </AnimatePresence>
  </div>
);

/* ─────────────────────────── Main section ─────────────────────────── */

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  // Debounce search input by 150ms — feels instant but skips noisy keystrokes
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
    return SKILLS
      .filter((s) => activeCategory === "all" || s.category === activeCategory)
      .filter((s) =>
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.courses?.some((c) => c.toLowerCase().includes(term)) ||
        s.note?.toLowerCase().includes(term)
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
      className="relative bg-secondary/30 px-4 py-24"
      aria-labelledby="skills-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          id="skills-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-3 text-center text-3xl font-bold md:text-4xl"
        >
          My <span className="text-primary">Skills</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mx-auto mb-10 max-w-xl text-center text-sm text-muted-foreground"
        >
          Some Tools and Technologies I work with.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-6 flex flex-col items-center gap-4"
        >
          <FilterTabs
            categories={CATEGORIES}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            counts={counts}
          />
          <SearchInput value={search} onChange={setSearch} />
        </motion.div>

        {/* Result count */}
        <div className="mb-4 text-center text-xs text-muted-foreground" aria-live="polite">
          Showing {filteredSkills.length} of {SKILLS.length} skills
          {debouncedSearch && <> matching "<span className="text-foreground">{debouncedSearch}</span>"</>}
        </div>

        {/* Skills grid */}
        <motion.div
          id="skills-grid"
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Skills"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, i) => (
              <SkillCard key={skill.name} skill={skill} index={i} />
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
              className="mx-auto mt-8 max-w-md rounded-xl border border-dashed border-border bg-background/50 p-8 text-center"
            >
              <p className="font-medium">No skills match that.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => setSearch("linux")}
                >
                  linux
                </button>
                ,{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => setSearch("ansible")}
                >
                  ansible
                </button>
                , or{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={resetFilters}
                >
                  reset filters
                </button>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SkillsSection;
