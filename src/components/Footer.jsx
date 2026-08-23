import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";


const useTorontoYear = () => {
  const getYear = () =>
    parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Toronto",
        year: "numeric",
      }).format(new Date()),
      10,
    );

  const [year, setYear] = useState(getYear);

  useEffect(() => {
    const scheduleNext = () => {
      const nowInToronto = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Toronto" }),
      );
      const nextNewYear = new Date(
        nowInToronto.getFullYear() + 1,
        0,
        1,
        0,
        0,
        1,
      );
      const msUntil = nextNewYear.getTime() - nowInToronto.getTime();

      return setTimeout(() => {
        setYear(getYear());
        scheduleNext();
      }, msUntil);
    };

    const id = scheduleNext();
    return () => clearTimeout(id);
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
            Built and Designed by Santiago Delgado
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
