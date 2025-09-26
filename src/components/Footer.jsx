import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

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
  const currentYear = useMemo(() => getYear(), []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer id="footer" className="py-12 px-4 bg-card border-t border-border mt-12 text-center relative">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-sm text-muted-foreground order-3 md:order-1 mt-6 md:mt-0">
          &copy; {currentYear} Built and Designed by{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent font-semibold">
            Santiago Delgado
          </span>. All rights reserved.
        </p>

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
