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
    <footer id="footer" className="border-t border-border bg-card px-4 py-8">
      <div className="container mx-auto max-w-5xl text-center">
        <p className="text-sm text-muted-foreground">
          © {year}{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text font-medium text-transparent">
            Santiago Delgado
          </span>
          . Built in Toronto.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
