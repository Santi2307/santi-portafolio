import { ArrowUp, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

const getYear = () => new Date().getFullYear();

export const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const currentYear = useMemo(() => getYear(), []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer id="footer" className="py-12 px-4 bg-card border-t border-border mt-12 text-center relative overflow-hidden">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-sm text-muted-foreground order-3 md:order-1 mt-6 md:mt-0">
          &copy; {currentYear} Built and Designed by{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent font-semibold">
            Santiago Delgado
          </span>. All rights reserved.
        </p>

        <div className="flex space-x-4 order-2 md:order-2">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon size={24} />
              </a>
            );
          })}
        </div>

        {showScrollButton && (
          <a
            href="#hero"
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 transform order-1 md:order-3"
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </a>
        )}
      </div>

      <div className="container mx-auto max-w-5xl mt-8 pt-8 border-t border-border">
        <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          {footerNavItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
