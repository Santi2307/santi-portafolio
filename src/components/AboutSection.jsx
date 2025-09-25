import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, Code, User, Rocket, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, useInView, useTransform, useSpring, AnimatePresence, useScroll } from "framer-motion";
import usePhotoStore from "@/store";

// Datos de ejemplo para simular la carga asíncrona
const mockPhotos = [
  "/images/santi1.jpeg",
  "/images/santi2.jpeg",
  "/images/santi3.jpeg",
];

const mockSkillsData = [
  {
    icon: Code,
    title: "Web Development",
    description: "Creating responsive websites and web applications with modern frameworks.",
  },
  {
    icon: User,
    title: "UI/UX Design",
    description: "Designing intuitive user interfaces and seamless user experiences.",
  },
  {
    icon: Briefcase,
    title: "Project Management",
    description: "Leading projects from conception to completion with agile methodologies.",
  },
  {
    icon: Rocket,
    title: "Systems & Networking",
    description: "Managing and troubleshooting Windows, Linux, and macOS systems and networks.",
  },
];

const staggerVariants = {
  initial: { opacity: 0, y: 50 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const SkillCard = ({ skill, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const spring = useSpring(0, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(spring, [0, 1], [0, -10]);
  const rotateY = useTransform(spring, [0, 1], [0, 10]);

  useEffect(() => {
    spring.set(isHovered ? 1 : 0);
  }, [spring, isHovered]);

  return (
    <motion.div
      ref={ref}
      variants={staggerVariants}
      custom={index}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      className="relative p-6 gradient-border-hover card-hover transform transition-all duration-300 overflow-hidden"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="listitem"
    >
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 z-0 bg-primary/20 blur-xl"></div>
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <skill.icon className="h-6 w-6 text-primary" />
        </div>
        <div className="text-left">
          <h4 className="font-semibold text-lg">{skill.title}</h4>
          <p className="text-muted-foreground">{skill.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CreativePhotoGallery = () => {
  const { photos, currentPhotoIndex, setNextPhoto, setPrevPhoto } = usePhotoStore();

  const handleNextPhoto = () => {
    setNextPhoto();
  };

  const handlePrevPhoto = () => {
    setPrevPhoto();
  };

  return (
    <div className="pt-4 mx-auto md:mx-0 relative w-full max-w-sm aspect-square">
      <div className="w-full h-full relative" style={{ perspective: '1000px' }}>
        <AnimatePresence>
          {photos.map((photo, index) => {
            const isVisible = index === currentPhotoIndex;
            const rotation = (index - currentPhotoIndex) * 20;
            const zIndex = isVisible ? 10 : 0;
            const scale = isVisible ? 1.05 : 0.95;
            const y = (index - currentPhotoIndex) * -15;

            return (
              <motion.img
                key={photo}
                src={photo}
                alt={`Personal photo ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg border-4 border-primary/20"
                style={{ zIndex, rotateY: rotation, scale, y }}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: 100, rotateY: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            );
          })}
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
        <motion.button
          onClick={handlePrevPhoto}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} className="text-white" />
        </motion.button>
        <span className="bg-white/20 px-3 py-1 rounded-full text-white font-semibold">{currentPhotoIndex + 1} / {photos.length}</span>
        <motion.button
          onClick={handleNextPhoto}
          className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={24} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export const AboutSection = () => {
  const { setPhotos } = usePhotoStore();
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setPhotos(mockPhotos);
      setIsLoading(false);
    }, 1500);
  }, [setPhotos]);

  const introVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8 } },
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const introY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Me</span>
        </h2>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-pulse"
            >
              <div className="space-y-6">
                <div className="w-full aspect-square max-w-sm rounded-xl bg-gray-300 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-10/12"></div>
                <div className="flex gap-4 pt-4 justify-center md:justify-start">
                  <div className="h-10 w-32 bg-gray-300 rounded-full"></div>
                  <div className="h-10 w-32 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {mockSkillsData.map((_, index) => (
                  <div key={index} className="p-6 bg-gray-300 rounded-lg h-24"></div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <motion.div
                style={{ y: introY }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="space-y-6"
              >
                <CreativePhotoGallery />
                <p className="text-muted-foreground leading-relaxed">
                  I'm Santiago Delgado, a passionate Computer Systems Technology student at Seneca Polytechnic. My expertise lies in systems engineering and web development, with a strong foundation in managing and troubleshooting hardware and networks. My skills span various operating systems, including Windows, Linux, and macOS, and I'm proficient in virtualization technologies like VirtualBox and VMware.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When I'm not immersed in tech, you'll often find me swimming, running or cooking. It’s my way of clearing my mind and staying active, balancing the technical demands of my studies with a healthy lifestyle.
                </p>
                <motion.div
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start"
                >
                  <a href="#contact" className="cosmic-button" aria-label="Get in touch">
                    Get In Touch
                  </a>
                  <a
                    href="/your-cv.pdf"
                    download
                    className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
                    aria-label="Download CV"
                  >
                    Download CV
                  </a>
                </motion.div>
              </motion.div>
              <div className="grid grid-cols-1 gap-6">
                {mockSkillsData.map((skill, index) => (
                  <SkillCard key={index} skill={skill} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
