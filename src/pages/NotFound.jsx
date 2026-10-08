import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowLeft, ArrowUpRight, CornerDownLeft } from "lucide-react";
import { StarBackground } from "@/components/StarBackground";
import { ThemeToggle } from "@/components/ThemeToggle";

const EASE_OUT = [0.22, 1, 0.36, 1];
const HOST = "santi-portafolio.vercel.app";

/* Secciones reales del sitio: destino de "cd", de las sugerencias y de los atajos */
const SECTIONS = ["home", "about", "skills", "projects", "contact"];
const sectionHref = (s) => (s === "home" ? "/" : `/#${s}`);

/* ─────────────────────────── "Did you mean…?" ─────────────────────────── */

const distance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
};

/** /projets → "projects", /contacto → "contact". Solo si se parece de verdad. */
const suggestFor = (path) => {
  const word = path.toLowerCase().split("/").filter(Boolean).pop()?.replace(/[^a-z]/g, "") ?? "";
  if (!word) return null;
  const best = SECTIONS.map((s) => ({ s, d: distance(word, s) })).sort((a, b) => a.d - b.d)[0];
  return best.d <= Math.max(2, Math.floor(best.s.length / 3)) || best.s.startsWith(word.slice(0, 4)) ? best.s : null;
};

/* ─────────────────────────── Network topology ─────────────────────────── */

const NODES = [
  { x: 40, label: "you" },
  { x: 150, label: "gateway" },
  { x: 260, label: "edge" },
  { x: 370, label: "???" },
];

/** Un paquete sale de tu equipo, cruza el gateway y el edge… y el último salto no responde. */
function Topology({ reduce }) {
  return (
    <svg viewBox="0 0 410 92" className="w-full" role="img" aria-label="A packet travels through the network and never reaches its destination">
      {/* Enlaces: los dos primeros sanos, el último roto */}
      <line x1="40" y1="36" x2="260" y2="36" className="stroke-primary/50" strokeWidth="1.5" />
      <line x1="260" y1="36" x2="370" y2="36" className="stroke-foreground/25" strokeWidth="1.5" strokeDasharray="4 5" />

      {NODES.map((n, i) => {
        const lost = i === NODES.length - 1;
        return (
          <g key={n.label}>
            <circle cx={n.x} cy="36" r={lost ? 9 : 7} className={lost ? "fill-background stroke-red-400/70" : "fill-background stroke-primary"} strokeWidth="1.5" strokeDasharray={lost ? "3 3" : undefined} />
            {!lost && <circle cx={n.x} cy="36" r="2.5" className="fill-primary" />}
            <text x={n.x} y="72" textAnchor="middle" className={lost ? "fill-red-300/80" : "fill-foreground/55"} style={{ font: "500 11px 'JetBrains Mono', monospace" }}>
              {n.label}
            </text>
          </g>
        );
      })}

      {/* El paquete */}
      {!reduce && (
        <motion.circle
          cy="36"
          r="4"
          className="fill-primary"
          style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.9))" }}
          initial={{ cx: 40, opacity: 0 }}
          animate={{ cx: [40, 150, 260, 330, 330], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: 3.2, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
        />
      )}
      {/* Donde se pierde */}
      <motion.text
        x="330"
        y="40"
        textAnchor="middle"
        className="fill-red-400"
        style={{ font: "700 13px 'JetBrains Mono', monospace" }}
        animate={reduce ? undefined : { opacity: [0, 0, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.62, 0.72, 1], repeat: Infinity }}
      >
        ×
      </motion.text>
    </svg>
  );
}

/* ─────────────────────────────── Terminal ─────────────────────────────── */

const Prompt = () => (
  <span className="select-none">
    <span className="text-emerald-300">santi</span>
    <span className="text-foreground/40">@</span>
    <span className="text-sky-300">portfolio</span>
    <span className="text-foreground/40">:~$ </span>
  </span>
);

/** Escribe un comando carácter por carácter y avisa al terminar. */
function Typed({ text, onDone, reduce }) {
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (n >= text.length) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v + 1), 28 + Math.random() * 40);
    return () => clearTimeout(t);
  }, [n, text, onDone]);
  return <>{text.slice(0, n)}</>;
}

const HELP = [
  ["help", "show this list"],
  ["ls", "list the sections of the site"],
  ["cd <section>", "go to a section (cd projects)"],
  ["whoami", "who built this"],
  ["clear", "clear the screen"],
];

/** Ejecuta un comando y devuelve las líneas de salida, o una navegación. */
function run(raw) {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const arg = args.join(" ").replace(/^[~/#.]+/, "").toLowerCase();
  switch ((cmd ?? "").toLowerCase()) {
    case "":
      return { out: [] };
    case "help":
      return { out: HELP.map(([c, d]) => ({ t: `${c.padEnd(14)} ${d}`, tone: "muted" })) };
    case "ls":
      return { out: [{ t: SECTIONS.map((s) => `${s}/`).join("   "), tone: "accent" }] };
    case "whoami":
      return { out: [{ t: "Santiago Delgado — IT support & systems, Toronto. Network nerd, cat person.", tone: "muted" }] };
    case "cd":
    case "open": {
      if (!arg || arg === "~" || arg === "..") return { go: "/" };
      if (SECTIONS.includes(arg)) return { go: sectionHref(arg) };
      return { out: [{ t: `cd: no such directory: ${arg}. Try \`ls\`.`, tone: "error" }] };
    }
    case "home":
    case "exit":
      return { go: "/" };
    case "clear":
      return { clear: true };
    case "sudo":
      return { out: [{ t: "Nice try. This incident will be reported. 🐈", tone: "error" }] };
    default:
      return { out: [{ t: `command not found: ${cmd}. Type \`help\`.`, tone: "error" }] };
  }
}

const TONE = { muted: "text-foreground/60", accent: "text-sky-300", error: "text-red-300", ok: "text-emerald-300", plain: "text-foreground/85" };

function Terminal({ path, reduce }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState(reduce ? 2 : 0); // 0 escribe traceroute · 1 imprime saltos · 2 interactivo
  const [hops, setHops] = useState(reduce ? 5 : 0);
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState("");
  const input = useRef(null);
  const body = useRef(null);
  const command = `traceroute ${HOST}${path}`;

  const HOPS = useMemo(
    () => [
      { n: 1, host: "gateway (10.0.0.1)", ms: "1.12 ms", tone: "plain" },
      { n: 2, host: "toronto-edge.isp.net", ms: "8.47 ms", tone: "plain" },
      { n: 3, host: "vercel-edge.cdn", ms: "14.03 ms", tone: "plain" },
      { n: 4, host: "* * *", ms: "", tone: "muted" },
      { n: 5, host: `${path} — unreachable`, ms: "404", tone: "error" },
    ],
    [path],
  );

  // Los saltos aparecen uno a uno, como un traceroute de verdad
  useEffect(() => {
    if (stage !== 1) return;
    if (hops >= HOPS.length) {
      const t = setTimeout(() => setStage(2), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setHops((h) => h + 1), hops === 3 ? 900 : 380);
    return () => clearTimeout(t);
  }, [stage, hops, HOPS.length]);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [hops, history, stage, reduce]);

  // En escritorio el cursor queda listo para escribir; en móvil no abrimos el teclado solos
  useEffect(() => {
    if (stage === 2 && window.matchMedia("(pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, [stage]);

  const submit = (e) => {
    e.preventDefault();
    const res = run(value);
    if (res.go) {
      navigate(res.go);
      return;
    }
    setHistory((h) => (res.clear ? [] : [...h, { cmd: value, out: res.out ?? [] }]));
    setValue("");
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card/70 text-left shadow-[0_30px_80px_-30px_rgba(139,92,246,0.35)] backdrop-blur-md"
      onClick={() => stage === 2 && input.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-300/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-xs text-foreground/50">bash — 80×24</span>
      </div>

      <div ref={body} className="h-[19rem] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-6 sm:text-[13px]" aria-live="polite">
        <p className="whitespace-pre-wrap break-all">
          <Prompt />
          <span className="text-foreground">
            {stage === 0 ? <Typed text={command} reduce={reduce} onDone={() => setStage(1)} /> : command}
          </span>
          {stage === 0 && <span className="ml-0.5 inline-block h-4 w-2 translate-y-[3px] animate-pulse bg-primary" />}
        </p>
        {stage >= 1 && <p className="text-foreground/50">traceroute to {HOST}, 30 hops max</p>}
        {HOPS.slice(0, hops).map((h) => (
          <motion.p key={h.n} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`flex gap-3 ${TONE[h.tone]}`}>
            <span className="w-3 shrink-0 text-right text-foreground/40">{h.n}</span>
            <span className="min-w-0 flex-1 truncate">{h.host}</span>
            <span className="shrink-0 tabular-nums">{h.ms}</span>
          </motion.p>
        ))}
        {stage === 2 && (
          <p className="mt-2 text-foreground/60">
            Type <span className="text-sky-300">help</span>, or <span className="text-sky-300">cd projects</span> to get back on route.
          </p>
        )}

        {history.map((h, i) => (
          <div key={i} className="mt-2">
            <p className="whitespace-pre-wrap break-all"><Prompt /><span className="text-foreground">{h.cmd}</span></p>
            {h.out.map((o, j) => (
              <p key={j} className={`whitespace-pre-wrap ${TONE[o.tone]}`}>{o.t}</p>
            ))}
          </div>
        ))}

        {stage === 2 && (
          <form onSubmit={submit} className="mt-2 flex items-center">
            <Prompt />
            <label htmlFor="terminal-input" className="sr-only">Terminal command</label>
            <input
              id="terminal-input"
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent text-foreground caret-primary outline-none"
            />
          </form>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────── Page ───────────────────────────────── */

export const NotFound = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const suggestion = useMemo(() => suggestFor(pathname), [pathname]);
  const shownPath = pathname.length > 32 ? `${pathname.slice(0, 30)}…` : pathname;

  // El "404" gigante del fondo sigue al cursor, muy despacio
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(useTransform(mx, [-1, 1], [-24, 24]), { stiffness: 60, damping: 20 });
  const y = useSpring(useTransform(my, [-1, 1], [-16, 16]), { stiffness: 60, damping: 20 });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "404 · Lost in the network — Santiago Delgado";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  // "H" vuelve al inicio (si no estás escribiendo en la terminal)
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "h") navigate("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const onMove = (e) => {
    if (reduce) return;
    mx.set((e.clientX / window.innerWidth) * 2 - 1);
    my.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  const fade = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-left text-foreground" onPointerMove={onMove}>
      <ThemeToggle />
      <StarBackground />

      {/* 404 gigante en contorno, detrás de todo */}
      <motion.div
        aria-hidden
        style={{ x, y, WebkitTextStroke: "1.5px rgba(167,139,250,0.22)" }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-mono text-[42vw] font-bold leading-none tracking-tighter text-transparent lg:text-[30vw]"
      >
        404
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Link to="/" className="group inline-flex items-center gap-2 font-mono text-sm text-foreground/70 transition-colors hover:text-foreground">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" aria-hidden />
          <span>santiago<span className="text-primary">.dev</span></span>
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          <span className="text-foreground">404</span>
          <span className="mx-2">/</span>not-found
        </p>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <motion.p {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 font-mono text-xs text-red-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            HTTP 404 · host unreachable
          </motion.p>

          <motion.h1 {...fade(0.08)} className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Lost in the{" "}
            <span className="bg-gradient-to-r from-primary via-violet-300 to-sky-300 bg-clip-text text-transparent">network.</span>
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-5 max-w-md text-base leading-relaxed text-foreground/70 sm:text-lg">
            The packet left just fine — it just never found a host at{" "}
            <code className="break-all rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[0.9em] text-sky-300">{shownPath}</code>.
          </motion.p>

          <AnimatePresence>
            {suggestion && (
              <motion.div {...fade(0.24)} className="mt-6">
                <Link
                  to={sectionHref(suggestion)}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 font-mono text-sm text-foreground transition-colors hover:bg-primary/20"
                >
                  <span>Did you mean <span className="text-primary">/{suggestion}</span>?</span>
                  <ArrowUpRight size={15} aria-hidden />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div {...fade(0.3)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/" className="cosmic-button inline-flex items-center gap-2">
              Take me home
            </Link>
            <Link to="/#projects" className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/60 hover:text-foreground">
              See projects
            </Link>
            <Link to="/#contact" className="rounded-full px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
              Contact me
            </Link>
          </motion.div>

          <motion.p {...fade(0.38)} className="mt-8 hidden items-center gap-2 font-mono text-xs text-foreground/45 sm:flex">
            Press
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-foreground/80">H</kbd>
            to go home, or type in the terminal
            <CornerDownLeft size={12} aria-hidden />
          </motion.p>
        </div>

        <motion.div {...fade(0.2)} className="space-y-5">
          <div className="rounded-xl border border-border bg-card/40 px-4 pb-2 pt-5 backdrop-blur-sm">
            <Topology reduce={reduce} />
          </div>
          <Terminal path={pathname} reduce={reduce} />
        </motion.div>
      </main>
    </div>
  );
};
