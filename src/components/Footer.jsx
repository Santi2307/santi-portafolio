import { useState, useEffect } from "react";

/**
 * Auto-updating year. Reads the current year and schedules a refresh for the
 * next New Year's midnight so a tab left open across Dec 31 → Jan 1 updates
 * without a reload.
 */
const useCurrentYear = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const scheduleNext = () => {
      const now = new Date();
      const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 1);
      const msUntil = nextYear.getTime() - now.getTime();
      return setTimeout(() => {
        setYear(new Date().getFullYear());
        scheduleNext();
      }, msUntil);
    };
    const id = scheduleNext();
    return () => clearTimeout(id);
  }, []);

  return year;
};

export const Footer = () => {
  const year = useCurrentYear();

  return (
    <footer
      id="footer"
      className="border-t border-border bg-transparent px-4 py-10"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row">
          <span>
            <span className="tabular-nums text-foreground">© {year}</span>
            <span className="mx-2 opacity-40">/</span>
            Santiago Delgado
          </span>

          <span className="flex items-center gap-2">
            Built &amp; designed in Toronto
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
