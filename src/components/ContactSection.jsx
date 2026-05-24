import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaXTwitter } from "react-icons/fa6";
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
  ArrowUpRight,
  Slack,
  
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xldwapjy";
const EASE_OUT = [0.22, 1, 0.36, 1];

/* ═══════════════════════════════════════════════════════════════════════
   STATUS — time-of-day-aware
   ═══════════════════════════════════════════════════════════════════════ */

const STATUSES = [
  { range: [0, 7], key: "sleeping", emoji: "😴", label: "Sleeping" },
  { range: [7, 9], key: "morning", emoji: "☕", label: "Morning coffee" },
  { range: [9, 12], key: "available", emoji: "💼", label: "Available" },
  { range: [12, 13], key: "lunch", emoji: "🍽️", label: "Lunch break" },
  { range: [13, 17], key: "building", emoji: "💻", label: "Building" },
  { range: [17, 18], key: "exercising", emoji: "🏋️", label: "At the gym" },
  { range: [18, 20], key: "studying", emoji: "📚", label: "Studying" },
  { range: [20, 22], key: "off-duty", emoji: "🎮", label: "Off-duty" },
  { range: [22, 24], key: "winding-down", emoji: "🌙", label: "Winding down" },
];

const getStatusForHour = (hour) =>
  STATUSES.find((s) => hour >= s.range[0] && hour < s.range[1]) || STATUSES[0];

/* ═══════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════ */

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
      // silent fail
    }
  };
  return { copied, copy };
};

/* ═══════════════════════════════════════════════════════════════════════
   SLEEPING ZZZ
   ═══════════════════════════════════════════════════════════════════════ */

const SleepingZzz = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute -right-3 -top-2 h-6 w-6"
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="absolute left-0 top-0 font-mono text-[9px] font-bold text-foreground/70"
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

/* ═══════════════════════════════════════════════════════════════════════
   STATUS LINE
   ═══════════════════════════════════════════════════════════════════════ */

const StatusLine = () => {
  const status = useCurrentStatus();
  const isSleeping = status.key === "sleeping";

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/40 px-4 py-2 font-mono text-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={status.key}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5"
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
  <span
    className="relative text-sm leading-none"
    role="img"
    aria-label={status.label}
  >
    {status.emoji}
  </span>
  {isSleeping && <SleepingZzz />}
</span>

          <span className="font-medium text-foreground">{status.label}</span>
        </motion.div>
      </AnimatePresence>

      <span className="h-3 w-px bg-border" aria-hidden />

      <span className="text-muted-foreground">
        I'll get back asap. Have a great day!
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   CHANNEL ROW — all three rows share the same grid → perfect alignment
   ═══════════════════════════════════════════════════════════════════════ */

const ChannelRow = ({ icon: Icon, label, value, href, copyable = true }) => {
  const { copied, copy } = useCopy();

  const Inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon size={15} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-center text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm font-medium text-foreground">
          {value}
        </span>
      </span>
    </>
  );

  return (
    <div className="group relative flex items-center gap-3 border-b border-border py-3.5 last:border-b-0">
      {href ? (
        <a
          href={href}
          className="flex flex-1 items-center gap-3 transition-colors"
        >
          {Inner}
        </a>
      ) : (
        <div className="flex flex-1 items-center gap-3">{Inner}</div>
      )}

      {copyable && (
        <button
          type="button"
          onClick={() => copy(value)}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="shrink-0 rounded-md p-2 text-muted-foreground opacity-0 transition-all hover:bg-foreground/5 hover:text-foreground focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 group-hover:opacity-100"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="block"
              >
                <Check size={13} />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="block"
              >
                <Copy size={13} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   FORM
   ═══════════════════════════════════════════════════════════════════════ */

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  message: z
    .string()
    .min(10, "Message should be at least 10 characters.")
    .max(2000, "Message is too long."),
});

const Field = ({ label, hint, error, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between">
      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      {hint && (
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {hint}
        </span>
      )}
    </div>
    {children}
    {error && (
      <p role="alert" className="mt-1.5 font-mono text-[10px] text-destructive">
        {error}
      </p>
    )}
  </div>
);

const inputClasses = (hasError) =>
  cn(
    "w-full rounded-md border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors",
    "focus:outline-none focus:border-foreground/40",
    hasError ? "border-destructive/60" : "border-border",
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
            placeholder="youremail@gmail.com"
            {...register("email")}
            className={inputClasses(!!errors.email)}
          />
        </Field>
      </div>

      <Field
        label="Message"
        hint={`${messageCount} / 2000`}
        error={errors.message?.message}
      >
        <textarea
          rows={6}
          placeholder="Send me a message."
          {...register("message")}
          className={cn(
            inputClasses(!!errors.message),
            "resize-y min-h-[140px]",
          )}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "group inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
          isSubmitting && "cursor-not-allowed opacity-70",
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   SUCCESS STATE
   ═══════════════════════════════════════════════════════════════════════ */

const SuccessState = ({ onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE_OUT }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
      className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-foreground/20"
    >
      <CheckCircle2 className="h-7 w-7 text-foreground" strokeWidth={1.5} />
    </motion.div>

    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      Status — sent
    </p>
    <h3 className="mb-3 text-2xl font-semibold tracking-tight">
      Message received.
    </h3>
    <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
      Thank you for reaching out. I'll get back to you within 24 hours — usually
      much sooner.
    </p>

    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      <ArrowLeft size={13} />
      Send another
    </button>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════
   SOCIAL LINKS
   ═══════════════════════════════════════════════════════════════════════ */

const SOCIAL_LINKS = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/santiagodelgado23",
    label: "LinkedIn",
  },
  { icon: Github, href: "https://github.com/Santi2307", label: "GitHub" },
  {
    icon: Instagram,
    href: "https://www.instagram.com/santiagodelgadosanchez",
    label: "Instagram",
  },
  { icon: FaXTwitter, href: "https://x.com/Santiagodelga23", label: "Twitter" },

  { icon: Slack, href: "https://santiagodelga.slack.com", label: "Slack" },

];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export const ContactSection = () => {
  const [sent, setSent] = useState(false);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-24 md:py-32"
      aria-labelledby="contact-heading"
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
              <span className="text-primary">§ 05</span>
              <span className="mx-2 opacity-40">/</span>
              Contact
            </motion.p>
            <motion.h2
              id="contact-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            >
              Let's build <br className="hidden sm:block" />
              something together.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground md:block"
          >
            Want to collaborate? Have a question? Just come by and say hi. I am always open to discuss with new people ideas and new opportunities.
            message.
          </motion.div>
        </div>

        {/* ─── Status line ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-16 flex justify-start"
        >
          <StatusLine />
        </motion.div>

        {/* ─── Two-column body ─── */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          {/* LEFT — channels + socials */}
          <aside className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="md:sticky md:top-24"
            >
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                my socials
              </p>

              <div className="border-t border-border">
                <ChannelRow
                  icon={Mail}
                  label="Email"
                  value="santiagodelgadosanchez9@gmail.com"
                  href="mailto:santiagodelgadosanchez9@gmail.com"
                  copyable
                />
                <ChannelRow
                  icon={Phone}
                  label="Phone"
                  value="+1 (437) 661-6843"
                  href="tel:+14376616843"
                  copyable
                />
                <ChannelRow
                  icon={MapPin}
                  label="Location"
                  value="Toronto, Ontario · Canada"
                  href={null}
                  copyable={false}
                />
              </div>

              <div className="mt-10">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  you can also find me here
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SOCIAL_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="group flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-xs text-foreground transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={13} className="text-muted-foreground" />
                          <span className="font-medium">{link.label}</span>
                        </span>
                        <ArrowUpRight
                          size={11}
                          className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* RIGHT — form */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Send me a message
              </p>

              <div className="border-t border-border pt-6">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <SuccessState
                      key="success"
                      onReset={() => setSent(false)}
                    />
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
