// =============================================================================
// ContactSection.jsx — Santiago Delgado's portfolio
// -----------------------------------------------------------------------------
// REPLACE your existing src/components/ContactSection.jsx with this entire file.
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
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xldwapjy";

/* ─────────────────────────── Status definitions ──────────────────────────
   Each entry maps a Toronto-local hour range [start, end) to a vibe.
   Tailwind classes are written as literal strings so the JIT scanner
   picks them up at build time. */

const STATUSES = [
  {
    range: [0, 7],
    key: "sleeping",
    emoji: "😴",
    label: "Sleeping",
    classes: {
      border: "border-violet-500/30",
      bg: "bg-violet-500/10",
      pulse: "bg-violet-500/30",
      text: "text-violet-300",
    },
  },
  {
    range: [7, 9],
    key: "morning",
    emoji: "☕",
    label: "Morning coffee",
    classes: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      pulse: "bg-amber-500/30",
      text: "text-amber-300",
    },
  },
  {
    range: [9, 12],
    key: "available",
    emoji: "💼",
    label: "Available",
    classes: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      pulse: "bg-emerald-500/30",
      text: "text-emerald-300",
    },
  },
  {
    range: [12, 13],
    key: "lunch",
    emoji: "🍽️",
    label: "Lunch break",
    classes: {
      border: "border-orange-500/30",
      bg: "bg-orange-500/10",
      pulse: "bg-orange-500/30",
      text: "text-orange-300",
    },
  },
  {
    range: [13, 17],
    key: "building",
    emoji: "💻",
    label: "Building",
    classes: {
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      pulse: "bg-indigo-500/30",
      text: "text-indigo-300",
    },
  },
  {
    range: [17, 18],
    key: "exercising",
    emoji: "🏋️",
    label: "At the gym",
    classes: {
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      pulse: "bg-rose-500/30",
      text: "text-rose-300",
    },
  },
  {
    range: [18, 20],
    key: "studying",
    emoji: "📚",
    label: "Studying",
    classes: {
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      pulse: "bg-sky-500/30",
      text: "text-sky-300",
    },
  },
  {
    range: [20, 22],
    key: "off-duty",
    emoji: "🎮",
    label: "Off-duty",
    classes: {
      border: "border-fuchsia-500/30",
      bg: "bg-fuchsia-500/10",
      pulse: "bg-fuchsia-500/30",
      text: "text-fuchsia-300",
    },
  },
  {
    range: [22, 24],
    key: "winding-down",
    emoji: "🌙",
    label: "Winding down",
    classes: {
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      pulse: "bg-purple-500/30",
      text: "text-purple-300",
    },
  },
];

const getStatusForHour = (hour) =>
  STATUSES.find((s) => hour >= s.range[0] && hour < s.range[1]) || STATUSES[0];

/* ─────────────────────────── Hooks ─────────────────────────── */

const useCurrentStatus = () => {
  const [status, setStatus] = useState(() =>
    getStatusForHour(new Date().getHours()),
  );

  useEffect(() => {
    const update = () => {
      try {
        const hour = parseInt(
          new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Toronto",
            hour: "numeric",
            hour12: false,
          }).format(new Date()),
          10,
        );
        setStatus(getStatusForHour(hour));
      } catch {
        setStatus(getStatusForHour(new Date().getHours()));
      }
    };
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return status;
};

const useCopy = (resetMs = 1500) => {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      // silent fail — clipboard API unavailable
    }
  };
  return { copied, copy };
};

/* ─────────────────────────── Sleeping Zzz animation ─────────────────────────── */

const SleepingZzz = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute -right-3 -top-2 h-6 w-6"
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="absolute left-0 top-0 font-mono text-[9px] font-bold text-violet-200"
        animate={{
          y: [2, -10, -18],
          x: [0, 3, 7],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 1.15],
          rotate: [0, 6, 14],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          delay: i * 0.85,
          ease: "easeOut",
        }}
      >
        z
      </motion.span>
    ))}
  </div>
);

/* ─────────────────────────── Status bar ─────────────────────────── */

const LiveStatusBar = () => {
  const status = useCurrentStatus();
  const isSleeping = status.key === "sleeping";

  return (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto mb-12 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs backdrop-blur-sm transition-colors",
        status.classes.border,
        status.classes.bg,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status.key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <span className="relative inline-flex h-5 w-5 items-center justify-center">
            {!isSleeping && (
              <motion.span
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-full",
                  status.classes.pulse,
                )}
                animate={{ scale: [1, 1.8], opacity: [0.55, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <span
              className="relative text-base leading-none"
              role="img"
              aria-label={status.label}
            >
              {status.emoji}
            </span>
            {isSleeping && <SleepingZzz />}
          </span>

          <span className={cn("font-medium", status.classes.text)}>
            {status.label}
          </span>
        </motion.div>
      </AnimatePresence>

      <span className="h-3 w-px bg-border" aria-hidden />

      <span className="text-muted-foreground">
        I will get back asap. Have a great day!
      </span>
    </motion.div>
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

/* ─────────────────────────── Form ─────────────────────────── */

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  message: z
    .string()
    .min(10, "Message should be at least 10 characters.")
    .max(2000, "Message is too long."),
});

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium">{label}</label>
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

const ContactForm = ({ onSent }) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
  });

  const messageValue = watch("message", "");
  const messageCount = messageValue?.length ?? 0;

  const onSubmit = async (data) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          _subject: `New message from ${data.name}`,
        }),
      });

      if (response.ok) {
        reset();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
      </div>

      <Field label="Message" error={errors.message?.message}>
        <textarea
          rows={6}
          placeholder="What's on your mind? Hiring, collaboration, a question, or just saying hi — all good."
          {...register("message")}
          className={cn(
            inputClasses(!!errors.message),
            "resize-y min-h-[140px]",
          )}
        />
        <div className="mt-1 flex justify-end text-[10px] tabular-nums text-muted-foreground">
          {messageCount} / 2000
        </div>
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
                  <ContactForm onSent={() => setSent(true)} />
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
