import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";


/* Year in Toronto. Updates on its own at 12:00 am on January 1 (Toronto time),
   even if the page has been open for days. */
const torontoYear = () =>
  Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", year: "numeric" }).format(new Date()));

/* Milliseconds until the next new year in Toronto, measured on Toronto's wall clock */
const msUntilNewYear = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }));
  return new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0).getTime() - now.getTime();
};

/* Browsers can't wait longer than ~24.8 days in one timer, so we check back at most
   every 6 hours and land exactly on midnight during the last stretch. */
const MAX_WAIT = 6 * 60 * 60 * 1000;

const useTorontoYear = () => {
  const [year, setYear] = useState(torontoYear);

  useEffect(() => {
    let timer;
    const schedule = () => {
      const wait = Math.min(Math.max(msUntilNewYear(), 0) + 500, MAX_WAIT);
      timer = setTimeout(() => {
        setYear(torontoYear());
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return year;
};

export const Footer = () => {
  const year = useTorontoYear();

  return (
    <footer
      id="footer"
      className="border-t border-border bg-transparent px-4 py-10"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row">
          <span>
            <span className="tabular-nums text-foreground">© {year}</span>
            <span className="mx-3 opacity-40">/</span>
            Built and Designed by Santiago Delgado. All Rights Reserved.
          </span>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:rounded"
          >
            <ArrowUp
              size={11}
              className="transition-transform group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
