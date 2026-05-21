// =============================================================================
// ContactSection.jsx — Santiago Delgado's portfolio
// -----------------------------------------------------------------------------
// REPLACE your existing src/components/ContactSection.jsx with this entire file.
// Dependencies (already in your project): react-hook-form, zod, framer-motion,
// lucide-react, @hookform/resolvers/zod, your useToast hook, and `cn` utility.
// =============================================================================

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Linkedin,
  Github,
  Instagram,
  Briefcase,
  Users,
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xldwapjy";

/* ─────────────────────────── Intent options ─────────────────────────── */

const INTENTS = [
  {
    id: "hiring",
    icon: Briefcase,
    title: "Hiring",
    description: "IT Support · Systems · Networking roles",
    accent: "from-emerald-500/20 to-teal-500/10",
    border: "hover:border-emerald-500/40",
    extras: ["company", "role"],
  },
  {
    id: "collab",
    icon: Users,
    title: "Collaboration",
    description: "Project, freelance, or open-source",
    accent: "from-sky-500/20 to-indigo-500/10",
    border: "hover:border-sky-500/40",
    extras: ["company"],
  },
  {
    id: "question",
    icon: HelpCircle,
    title: "Question",
    description: "Quick technical or career question",
    accent: "from-violet-500/20 to-fuchsia-500/10",
    border: "hover:border-violet-500/40",
    extras: [],
  },
  {
    id: "hi",
    icon: Sparkles,
    title: "Just Saying Hi",
    description: "Networking, hello, or random thoughts",
    accent: "from-amber-500/20 to-rose-500/10",
    border: "hover:border-amber-500/40",
    extras: [],
  },
];

const SOCIAL_LINKS = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/santiagodelgado23",
    label: "LinkedIn",
  },
  { icon: Github, href: "https://github.com/Santi2307", label: "GitHub" },
  {
    icon: Instagram,
    href: "https://www.instagram.com/santidelgado2004",
    label: "Instagram",
  },
];

/* ─────────────────────────── Hooks ─────────────────────────── */

/** Live clock in Toronto, updates every second. */
const useTorontoTime = () => {
  const [time, setTime] = useState(() => formatTorontoTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTorontoTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const formatTorontoTime = () => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(new Date());
  } catch {
    return "—";
  }
};

/** Availability based on Toronto local hour. */
const useAvailability = () => {
  const [status, setStatus] = useState("online");
  useEffect(() => {
    const check = () => {
      try {
        const hour = parseInt(
          new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Toronto",
            hour: "numeric",
            hour12: false,
          }).format(new Date()),
          10,
        );
        // Online roughly 8am–11pm Toronto
        setStatus(hour >= 8 && hour < 23 ? "online" : "away");
      } catch {
        setStatus("online");
      }
    };
    check();
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return status;
};

/** Copy text to clipboard with a temporary "copied" flag. */
const useCopy = (resetMs = 1500) => {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      // Clipboard unavailable — silent fail
    }
  };
  return { copied, copy };
};

/* ─────────────────────────── Live status header ─────────────────────────── */

const LiveStatusBar = () => {
  const time = useTorontoTime();
  const status = useAvailability();
  const isOnline = status === "online";

  return (
    <div className="mx-auto mb-12 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs backdrop-blur-sm">
      {/* Availability */}
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-2 w-2">
          <motion.span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full",
              isOnline ? "bg-emerald-500" : "bg-amber-500",
            )}
            animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <span
            className={cn(
              "relative inline-block h-full w-full rounded-full",
              isOnline ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
        </span>
        <span className="font-medium">{isOnline ? "Available" : "Away"}</span>
      </div>

      <span className="h-3 w-px bg-border" aria-hidden />

      {/* Live time */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock size={12} aria-hidden />
        <span className="font-mono tabular-nums">{time}</span>
      </div>

      <span className="h-3 w-px bg-border" aria-hidden />

      {/* Response time */}
      <span className="text-muted-foreground">
        I will be respond to shortly to your message. :){" "}
      </span>
    </div>
  );
};

/* ─────────────────────────── Channel rows ─────────────────────────── */

const CopyChannel = ({ icon: Icon, label, value, href }) => {
  const { copied, copy } = useCopy();

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors hover:border-primary/40">
      <div className="rounded-lg bg-primary/10 p-2.5">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <a
          href={href}
          className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {value}
        </a>
      </div>

      <button
        type="button"
        onClick={() => copy(value)}
        className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group-hover:opacity-100"
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="block text-emerald-500"
            >
              <Check size={14} />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="block"
            >
              <Copy size={14} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

const LocationChannel = () => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
    <div className="rounded-lg bg-primary/10 p-2.5">
      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground">Location</p>
      <p className="text-sm font-medium">Toronto, ON · Canada</p>
    </div>
  </div>
);

/* ─────────────────────────── Intent card ─────────────────────────── */

const IntentCard = ({ intent, isActive, onSelect }) => {
  const Icon = intent.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(intent.id)}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex flex-col items-start gap-1.5 overflow-hidden rounded-xl border-2 bg-card/50 p-4 text-left backdrop-blur-sm transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? "border-primary shadow-lg shadow-primary/10"
          : cn("border-border/40", intent.border),
      )}
      aria-pressed={isActive}
    >
      {/* Gradient backdrop */}
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity",
          intent.accent,
          (isActive || "group-hover:opacity-100") && "group-hover:opacity-100",
          isActive && "opacity-100",
        )}
      />

      <Icon
        className={cn(
          "h-5 w-5 transition-colors",
          isActive ? "text-primary" : "text-foreground/70",
        )}
        aria-hidden="true"
      />
      <div className="font-semibold text-sm">{intent.title}</div>
      <div className="text-xs text-muted-foreground">{intent.description}</div>

      {isActive && (
        <motion.span
          layoutId="intent-indicator"
          aria-hidden
          className="absolute right-3 top-3 inline-flex h-2 w-2 rounded-full bg-primary"
        />
      )}
    </motion.button>
  );
};

/* ─────────────────────────── Form ─────────────────────────── */

const contactFormSchema = z.object({
  intent: z.string().min(1, "Please choose what you're reaching out about."),
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  company: z.string().optional(),
  role: z.string().optional(),
  message: z
    .string()
    .min(10, "Message should be at least 10 characters.")
    .max(2000, "Message is too long."),
});

const Field = ({ label, error, children, optional }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
      {label}
      {optional && (
        <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
          Optional
        </span>
      )}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1 text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);

const inputClasses = (hasError) =>
  cn(
    "w-full rounded-lg border bg-background/70 px-3 py-2.5 text-sm transition-all",
    "focus:outline-none focus:ring-2 focus:ring-primary/40",
    hasError ? "border-destructive focus:ring-destructive/40" : "border-input",
  );

const SmartContactForm = ({ onSent }) => {
  const { toast } = useToast();
  const [intent, setIntent] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { intent: "" },
  });

  const handleIntentSelect = (id) => {
    setIntent(id);
    setValue("intent", id, { shouldValidate: true });
  };

  const selectedIntent = INTENTS.find((i) => i.id === intent);
  const showCompany = selectedIntent?.extras.includes("company");
  const showRole = selectedIntent?.extras.includes("role");

  const onSubmit = async (data) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: `[${data.intent.toUpperCase()}] New message from ${data.name}`,
        }),
      });

      if (response.ok) {
        reset();
        setIntent(null);
        onSent();
      } else {
        toast({
          title: "Couldn't send your message",
          description:
            "Something went wrong on our end. Please try again or email me directly.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Intent */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
            01 / Intent
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTENTS.map((i) => (
            <IntentCard
              key={i.id}
              intent={i}
              isActive={intent === i.id}
              onSelect={handleIntentSelect}
            />
          ))}
        </div>
        {errors.intent && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {errors.intent.message}
          </p>
        )}
        {/* Hidden field so RHF/Zod see the intent value */}
        <input type="hidden" {...register("intent")} />
      </div>

      {/* Step 2: Details */}
      <AnimatePresence initial={false}>
        {intent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                02 / Details
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.name?.message}>
                <input
                  type="text"
                  placeholder="Your name"
                  {...register("name")}
                  className={inputClasses(!!errors.name)}
                />
              </Field>

              <Field label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={inputClasses(!!errors.email)}
                />
              </Field>

              {showCompany && (
                <Field label="Company" optional>
                  <input
                    type="text"
                    placeholder="Company or organization"
                    {...register("company")}
                    className={inputClasses(false)}
                  />
                </Field>
              )}

              {showRole && (
                <Field label="Role" optional>
                  <input
                    type="text"
                    placeholder="e.g. IT Support Analyst"
                    {...register("role")}
                    className={inputClasses(false)}
                  />
                </Field>
              )}
            </div>

            <Field label="Message" error={errors.message?.message}>
              <textarea
                rows={5}
                placeholder={
                  intent === "hiring"
                    ? "Tell me about the role, team, and what you're looking for…"
                    : intent === "collab"
                      ? "What kind of project? What's the timeline?"
                      : intent === "question"
                        ? "What's on your mind?"
                        : "Say hi 👋"
                }
                {...register("message")}
                className={cn(
                  inputClasses(!!errors.message),
                  "resize-y min-h-[120px]",
                )}
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                isSubmitting && "cursor-not-allowed opacity-70",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send Message
                  <Send
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

/* ─────────────────────────── Success state ─────────────────────────── */

const SuccessState = ({ onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-12 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        delay: 0.1,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className="mb-4 rounded-full bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20"
    >
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
    </motion.div>

    <h3 className="mb-2 text-xl font-bold">Message received.</h3>
    <p className="mb-6 max-w-sm text-sm text-muted-foreground">
      Thank you for reaching out. I'll get back to you within 24 hours — usually
      much sooner.
    </p>

    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <ArrowLeft size={14} />
      Send another
    </button>
  </motion.div>
);

/* ─────────────────────────── Main section ─────────────────────────── */

export const ContactSection = () => {
  const [sent, setSent] = useState(false);

  return (
    <section
      id="contact"
      className="relative bg-secondary/30 px-4 py-24"
      aria-labelledby="contact-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center">
          {/* Terminal-style preheader */}
          <p className="mb-3 font-mono text-xs text-muted-foreground">
            <span className="text-primary">~ </span>
            <span className="text-foreground/80">sys.contact</span>
            <span className="opacity-40">.</span>
            <span className="text-foreground/80">open()</span>
          </p>

          <h2
            id="contact-heading"
            className="mb-4 text-3xl font-bold md:text-4xl"
          >
            Let's{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              build together
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground md:text-base">
            Hiring for IT support, systems, or networking? Want to collaborate?
            Just curious? Drop a line — I read every message.
          </p>

          <LiveStatusBar />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Channels — left column */}
          <aside className="space-y-3 lg:col-span-2">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Direct Channels
            </h3>

            <CopyChannel
              icon={Mail}
              label="Email"
              value="santiagodelgadosanchez9@gmail.com"
              href="mailto:santiagodelgadosanchez9@gmail.com"
            />
            <CopyChannel
              icon={Phone}
              label="Phone"
              value="+1 (437) 661-6843"
              href="tel:+14376616843"
            />
            <LocationChannel />

            <div className="pt-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Or find me on
              </h4>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="rounded-xl border border-border/60 bg-card/40 p-3 transition-all hover:scale-105 hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <Icon className="h-5 w-5 text-foreground/80" />
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Form — right column */}
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm md:p-8 lg:col-span-3">
            <AnimatePresence mode="wait">
              {sent ? (
                <SuccessState key="success" onReset={() => setSent(false)} />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <SmartContactForm onSent={() => setSent(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
