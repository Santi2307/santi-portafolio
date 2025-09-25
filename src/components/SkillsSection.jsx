import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useInView, useAnimation, useMotionValue, useTransform } from "framer-motion";

const skillsData = [
  // Frontend
  { name: "HTML/CSS", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "React", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  // Backend
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "MongoDB", category: "backend" },
  { name: "PostgreSQL", category: "backend" },
  { name: "GraphQL", category: "backend" },
  // Tools
  { name: "Git/GitHub", category: "tools" },
  { name: "Docker", category: "tools" },
  { name: "Figma", category: "tools" },
  { name: "VS Code", category: "tools" },
];

const staggerVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

// Componente para los nodos de habilidad
const SkillNode = ({ skill, index, onHover }) => {
  return (
    <motion.div
      variants={staggerVariants}
      custom={index}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative p-6 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors duration-300"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={{ y: -5, z: 20, scale: 1.05 }}
      role="listitem"
    >
      {/* Efecto de Brillo en el Borde */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 z-0 bg-primary/20 blur-xl"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {/* El nombre de la habilidad en una forma más creativa */}
          <span className="font-semibold text-lg">{skill.name}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Componente para los filtros animados y creativos
const FilterTabs = ({ categories, activeCategory, setActiveCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={cn(
            "px-6 py-2 rounded-full font-medium transition-all duration-300 relative capitalize group",
            activeCategory === category ? "text-primary-foreground" : "text-secondary-foreground"
          )}
          onMouseEnter={() => setHoveredCategory(category)}
          onMouseLeave={() => setHoveredCategory(null)}
          whileTap={{ scale: 0.95 }}
        >
          {(activeCategory === category || hoveredCategory === category) && (
            <motion.span
              layoutId="bubble"
              className="absolute inset-0 bg-primary/80 rounded-full z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category}</span>
        </motion.button>
      ))}
    </div>
  );
};

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // Hooks para el efecto 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(skillsData.map((s) => s.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, []);

  const filteredSkills = useMemo(() => {
    return skillsData.filter(
      (skill) => activeCategory === "all" || skill.category === activeCategory
    );
  }, [activeCategory]);

  if (isLoading) {
    return (
      <section id="skills" className="py-24 px-4 relative bg-secondary/30">
        <div className="container mx-auto max-w-5xl animate-pulse">
          <h2 className="bg-gray-200 h-10 w-1/2 mx-auto rounded-lg mb-12"></h2>
          <FilterTabs
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 bg-gray-300 rounded-lg shadow-xs h-24"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary">Skills</span>
        </h2>

        <FilterTabs
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <motion.div
          ref={ref}
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            perspective: 800,
            transformStyle: "preserve-3d",
            rotateX,
            rotateY,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence>
            {filteredSkills.map((skill, index) => (
              <SkillNode key={skill.name} skill={skill} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
