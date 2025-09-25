import { ArrowDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const typingSpeed = 80;
const deletingSpeed = 50;
const pauseAfterTyping = 1500;
const pauseAfterDelete = 800;

const phrases = [
  "Web Developer.",
  "Systems Engineer.",
  "IT Student.",
  "Network Analyst.",
  "Colombian in Canada.",
  "Enthusiastic.",
  "Adaptable.",
  "Lifelong Learner.",
];

const useTypingEffect = (phrases) => {
  const [typedText, setTypedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentPhrase = phrases[phraseIndex];
      const speed = isDeleting ? deletingSpeed : typingSpeed;

      setTypedText(
        currentPhrase.substring(0, isDeleting ? typedText.length - 1 : typedText.length + 1)
      );

      if (!isDeleting && typedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pauseAfterTyping);
      } else if (isDeleting && typedText === "") {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }, isDeleting ? deletingSpeed : typedText.length === phrases[phraseIndex].length ? pauseAfterTyping : typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex, phrases]);

  return typedText;
};

const fullGreeting = "Hi, I'm Santiago.";

export const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const greetingY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const jobTitleY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const [typedGreeting, setTypedGreeting] = useState("");
  const [greetingComplete, setGreetingComplete] = useState(false);
  const typedJobTitle = useTypingEffect(phrases);

  useEffect(() => {
    if (!greetingComplete) {
      if (typedGreeting.length < fullGreeting.length) {
        const timer = setTimeout(() => {
          setTypedGreeting(fullGreeting.substring(0, typedGreeting.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        setGreetingComplete(true);
      }
    }
  }, [typedGreeting, greetingComplete]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Nuevo fondo con efecto de gradiente animado */}
      <div className="absolute inset-0 z-0 bg-background-pattern opacity-70"></div>
      <div className="absolute inset-0 z-0 bg-background-glow"></div>

      <div className="container max-w-4xl mx-auto text-center z-10">
        <div className="space-y-6">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ y: greetingY }}
          >
            <span className="text-glow">
              {typedGreeting}
              <motion.span
                className="inline-block w-1 h-10 ml-1 bg-primary"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              ></motion.span>
            </span>
          </motion.h1>

          <motion.h2
            className={cn(
              "text-xl md:text-2xl font-semibold text-muted-foreground mt-4 h-8"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: greetingComplete ? 1 : 0, y: greetingComplete ? 0 : 20 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            style={{ y: jobTitleY }}
          >
            I'm a{" "}
            <span className="text-primary font-bold">
              {typedJobTitle}
            </span>
            <motion.span
              className="inline-block w-1 h-6 ml-1 bg-primary"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            ></motion.span>
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            I’m an aspiring IT professional from Colombia currently in Toronto, Canada who’s genuinely fascinated by technology and how it connects people. I love helping others solve problems, whether it’s fixing a computer glitch or making tech feel less intimidating.
          </motion.p>

          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <a href="#projects" className="cosmic-button">
              View My Work
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        style={{ opacity: arrowOpacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <span className="text-sm text-muted-foreground mb-2">Scroll</span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </motion.div>
    </section>
  );
};
