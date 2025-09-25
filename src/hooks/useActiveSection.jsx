import { useEffect, useState, useRef } from "react";

export const useActiveSection = (sections) => {
  const [activeSection, setActiveSection] = useState("hero");
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      handleIntersect,
      observerOptions
    );

    const targetElements = sections
      .map((item) => document.getElementById(item.href.substring(1)))
      .filter(Boolean);

    targetElements.forEach((sec) => observerRef.current.observe(sec));

    return () => {
      if (observerRef.current) {
        targetElements.forEach((sec) => observerRef.current.unobserve(sec));
      }
    };
  }, [sections]);

  return activeSection;
};
