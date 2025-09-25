import { useState, useEffect, useCallback, useRef } from "react";

export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      setScrollDirection("down");
    } else if (currentScrollY < lastScrollY.current) {
      setScrollDirection("up");
    }
    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollDirection;
};
