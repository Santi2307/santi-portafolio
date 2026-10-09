import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1];

const LINKS = {
  linkedin: "https://www.linkedin.com/in/santiagodelgado23",
  github: "https://github.com/Santi2307",
  instagram: "https://www.instagram.com/santiagodelgadosanchez",
  email: "mailto:santiagodelgadosanchez9@gmail.com",
};

/* What I'm probably doing right now, in Toronto time */
const noteFor = (hour) => {
  if (hour < 7) return "I'm probably asleep, but I'll reply in the morning.";
  if (hour < 9) return "I'm on my first coffee, good time to write.";
  if (hour < 17) return "I'm around, so you'll likely hear back today.";
  if (hour < 22) return "I'm done for the day, but I still check messages.";
  return "I'm winding down, I'll get back to you tomorrow.";
};

const torontoNow = () => {
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", hour: "numeric", hourCycle: "h23" }).format(now),
  );
  return { time: time.toLowerCase(), note: noteFor(hour) };
};

const useTorontoTime = () => {
  const [now, setNow] = useState(torontoNow);
  useEffect(() => {
    const id = setInterval(() => setNow(torontoNow()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const InlineLink = ({ href, children }) => (
  <a
    href={href}
    target={href.startsWith("mailto:") ? undefined : "_blank"}
    rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
    className="font-semibold text-foreground underline decoration-foreground/30 decoration-2 underline-offset-[6px] transition-colors hover:decoration-foreground"
  >
    {children}
  </a>
);

export const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const { time, note } = useTorontoTime();

  const show = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  });

  return (
    <section id="contact" ref={ref} className="relative px-4 py-24 md:py-32" aria-labelledby="contact-heading">
      <div className="container mx-auto max-w-6xl text-left">
        <motion.p {...show()} className="mb-3 font-mono text-xs tracking-wide text-foreground/50">
          <span className="text-foreground">05</span> / contact
        </motion.p>
        <motion.h2 {...show(0.05)} id="contact-heading" className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Let&apos;s talk.
        </motion.h2>

        <motion.div {...show(0.15)} className="mt-12 max-w-3xl rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-sm sm:p-12">
          <p className="font-mono text-xs text-foreground/50">Toronto, ON · Canada</p>

          <p className="mt-6 text-xl leading-relaxed text-foreground/80 sm:text-2xl sm:leading-relaxed">
            Hiring for IT support or systems work, or just want to compare homelab setups? Message me on{" "}
            <InlineLink href={LINKS.linkedin}>LinkedIn</InlineLink>, see what I&apos;m building on{" "}
            <InlineLink href={LINKS.github}>GitHub</InlineLink>, follow along on{" "}
            <InlineLink href={LINKS.instagram}>Instagram</InlineLink>, or send me an{" "}
            <InlineLink href={LINKS.email}>email</InlineLink>.
          </p>

          <p className="mt-10 flex items-start gap-3 border-t border-border pt-6 text-sm text-foreground/60">
            <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/70" />
            </span>
            <span>
              It&apos;s <span className="font-mono text-foreground/80">{time}</span> in Toronto. {note}
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
