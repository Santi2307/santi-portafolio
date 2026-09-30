import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useRef } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1];

/* TODO: replace with your own info */
const PROFILE = {
  file: "myinfo.txt",
  variable: "santiago",
  role: "IT Support Technician",
  base: "Toronto, ON",
  stack: ["Linux", "Python", "Cisco", "Azure", "Bash"],
  focus: "reliable, practical solutions",
};

/* ─────────────────────────── Token components ─────────────────────────── */

const KW = ({ children }) => (
  <span className="text-primary/90">{children}</span>
);
const Ident = ({ children }) => (
  <span className="font-semibold text-sky-300">{children}</span>
);
const Key = ({ children }) => (
  <span className="text-foreground/80">{children}</span>
);
const Str = ({ children }) => (
  <span className="text-amber-300">&apos;{children}&apos;</span>
);
const Punct = ({ children }) => (
  <span className="text-foreground/30">{children}</span>
);

const Cursor = ({ reducedMotion }) => (
  <motion.span
    aria-hidden="true"
    animate={reducedMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
    transition={
      reducedMotion
        ? undefined
        : { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }
    }
    className="ml-1 inline-block h-3.5 w-[2px] translate-y-0.5 bg-primary"
  />
);

/* ─────────────────────────── Code lines ─────────────────────────── */

const buildRows = () => [
  {
    indent: 0,
    content: (
      <>
        <KW>const</KW> <Ident>{PROFILE.variable}</Ident>{" "}
        <Punct>=</Punct> <Punct>{"{"}</Punct>
      </>
    ),
  },
  {
    indent: 1,
    content: (
      <>
        <Key>role</Key>
        <Punct>:</Punct> <Str>{PROFILE.role}</Str>
        <Punct>,</Punct>
      </>
    ),
  },
  {
    indent: 1,
    content: (
      <>
        <Key>base</Key>
        <Punct>:</Punct> <Str>{PROFILE.base}</Str>
        <Punct>,</Punct>
      </>
    ),
  },
  {
    indent: 1,
    content: (
      <>
        <Key>stack</Key>
        <Punct>:</Punct> <Punct>[</Punct>
      </>
    ),
  },
  ...PROFILE.stack.map((tech) => ({
    indent: 2,
    content: (
      <>
        <Str>{tech}</Str>
        <Punct>,</Punct>
      </>
    ),
  })),
  { indent: 1, content: <Punct>],</Punct> },
  {
    indent: 1,
    content: (
      <>
        <Key>focus</Key>
        <Punct>:</Punct> <Str>{PROFILE.focus}</Str>
        <Punct>,</Punct>
      </>
    ),
  },
  { indent: 0, content: <Punct>{"}"}</Punct>, cursor: true },
];

/* ─────────────────────────── Main component ─────────────────────────── */

export const CodeCard = () => {
  const reducedMotion = useReducedMotion();
  const ref = useRef(null);
  const rows = buildRows();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useTransform(py, [0, 1], [7, -7]);
  const rotateY = useTransform(px, [0, 1], [-7, 7]);

  const handleMouseMove = useCallback(
    (e) => {
      if (reducedMotion) return;
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
    },
    [px, py, reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 }}
      className="relative mx-auto w-full max-w-md"
      style={{ perspective: 1200 }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="animate-pulse-subtle absolute -inset-6 -z-10 rounded-[2rem] bg-primary/20 blur-3xl"
      />

      {/* Idle float */}
      <motion.div
        animate={reducedMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Tilt */}
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative rounded-2xl bg-gradient-to-br from-primary/50 via-border to-transparent p-px shadow-2xl shadow-primary/10"
        >
          <div className="overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-border/80 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 flex items-center gap-1.5 font-mono text-xs text-foreground/50">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-primary/70"
                />
                {PROFILE.file}
              </span>
            </div>

            {/* Code body */}
            <div
              aria-hidden="true"
              className="space-y-0.5 overflow-x-auto px-5 py-6 text-left"
            >
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1.25rem_1fr] gap-3">
                  <span className="select-none text-right font-mono text-[11px] tabular-nums text-foreground/20">
                    {i + 1}
                  </span>
                  <div
                    className="whitespace-pre text-left font-mono text-[13px] leading-6 sm:text-sm"
                    style={{ paddingLeft: `${row.indent}rem` }}
                  >
                    {row.content}
                    {row.cursor && <Cursor reducedMotion={reducedMotion} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-foreground/35">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                TypeScript
              </span>
              <span>UTF-8</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Accessible summary for screen readers */}
      <span className="sr-only">
        {PROFILE.role} based in {PROFILE.base}, working with{" "}
        {PROFILE.stack.join(", ")}, focused on {PROFILE.focus}.
      </span>
    </motion.div>
  );
};

export default CodeCard;
