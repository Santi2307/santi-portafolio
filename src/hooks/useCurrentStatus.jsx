import { useEffect, useState } from "react";

/* Time-of-day-aware status, in America/Toronto local time. Shared between
   the Hero meta strip and the Contact section so both stay in sync. */
export const STATUSES = [
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

export const getStatusForHour = (hour) =>
  STATUSES.find((s) => hour >= s.range[0] && hour < s.range[1]) || STATUSES[0];

export const useCurrentStatus = () => {
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
