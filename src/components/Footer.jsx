import { ArrowUp, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const socialLinks = [
  { href: "https://www.linkedin.com/in/santiagodelgado23", icon: Linkedin, label: "LinkedIn profile" },
  { href: "https://github.com/Santi2307", icon: Github, label: "GitHub profile" },
  { href: "https://www.instagram.com/santidelgado2004", icon: Instagram, label: "Instagram profile" },
  { href: "mailto:santiagodelgadosanchez9@gmail.com", icon: Mail, label: "Gmail" },
];

const footerNavItems = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

const getYear = () => new Date().getFullYear();

export const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    const footerElement = document.getElementById("footer");
    if (footerElement) {
      observer.observe(footerElement);
    }
    return () => observer.disconnect();
  }, []);

  const currentYear = useMemo(() => getYear(), []);

  return (
    <footer id="footer" className="py-12 px-4 bg-card border-t border-border mt-12 text-center relative overflow-hidden">
      {/* Nuevo fondo de partículas interactivo */}
      <div className="absolute inset-0 z-0 bg-transparent" id="particles-js"></div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-sm text-muted-foreground order-3 md:order-1 mt-6 md:mt-0"
          >
            &copy; {currentYear} Built and Designed by{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent font-semibold">
              Santiago Delgado
            </span>. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex space-x-4 order-2 md:order-2"
          >
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={24} />
                </motion.a>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {showScrollButton && (
              <motion.a
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                href="#hero"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 transform order-1 md:order-3"
                aria-label="Back to top"
              >
                <ArrowUp size={20} />
              </motion.a>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="container mx-auto max-w-5xl mt-8 pt-8 border-t border-border"
        >
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            {footerNavItems.map((item, index) => (
              <li key={index}>
                <motion.a
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {item.name}
                </motion.a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </footer>
  );
};
