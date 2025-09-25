import { ArrowRight, ExternalLink, Github, Terminal, Cloud, Shield, Server, Layout, Code } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const allProjects = [
  {
    id: 1,
    title: "Full-Stack Project Management Dashboard",
    description: "A complete full-stack solution for managing tasks, projects, and user roles. Demonstrates skills in API design, database management, and modern front-end frameworks.",
    image: "/projects/project1.png",
    category: "Full-Stack",
    tags: ["React", "Node.js", "MongoDB", "Express", "REST API"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Server,
  },
  {
    id: 2,
    title: "Cloud Infrastructure Automation",
    description: "Automated deployment of a web server on a cloud provider (AWS/Azure) using scripting and IaC. Showcases skills in cloud computing, scripting, and CI/CD.",
    image: "/projects/project2.png",
    category: "Systems & Networking",
    tags: ["Azure", "AWS", "Terraform", "Bash", "Docker"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Cloud,
  },
  {
    id: 3,
    title: "Secure Network Configuration Tool",
    description: "A Python-based tool for auditing and configuring network devices (Cisco) for security compliance. Highlights skills in networking, security, and Python scripting.",
    image: "/projects/project3.png",
    category: "Security",
    tags: ["Python", "Cisco", "Security", "Networking"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Shield,
  },
  {
    id: 4,
    title: "Real-time Monitoring Dashboard",
    description: "A dashboard that visualizes real-time system metrics (CPU, RAM, disk) from servers. Demonstrates data handling, real-time communication (WebSockets), and data visualization.",
    image: "/projects/project4.png",
    category: "Data Analytics",
    tags: ["React", "D3.js", "WebSockets", "Node.js"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Layout,
  },
  {
    id: 5,
    title: "Automated Backup & Recovery Script",
    description: "A script to automate backups of critical data and restore them in case of failure. Essential for showcasing systems administration and scripting skills.",
    image: "/projects/project5.png",
    category: "Systems & Networking",
    tags: ["Bash", "Linux", "cron", "Automation"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Terminal,
  },
  {
    id: 6,
    title: "Containerized Web Application",
    description: "A web application containerized with Docker, demonstrating knowledge of microservices architecture and deployment strategies.",
    image: "/projects/project6.png",
    category: "Full-Stack",
    tags: ["Docker", "React", "Node.js", "Nginx"],
    demoUrl: "#",
    githubUrl: "https://github.com/Santi2307",
    icon: Code,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const ProjectCard = ({ project, index }) => {
  const Icon = project.icon;
  return (
    <motion.div
      key={project.id}
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover relative"
    >
      <div className="h-48 overflow-hidden relative">
        <motion.img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 text-white font-bold"
        >
          <span className="text-xl">{project.title}</span>
        </motion.div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground"
            >
              {tag}
            </motion.span>
          ))}
        </div>
        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-primary"/>}
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {project.demoUrl && (
              <motion.a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors duration-300"
                aria-label="View live demo"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ExternalLink size={20} />
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors duration-300"
                aria-label="View GitHub repository"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Github size={20} />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterSection = ({ categories, activeFilter, setActiveFilter }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-down">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => setActiveFilter(category)}
          className={cn(
            "px-4 py-2 rounded-full font-medium transition-all duration-300 relative overflow-hidden",
            activeFilter === category ? "text-primary-foreground" : "text-secondary-foreground"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {activeFilter === category && (
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

export const ProjectsSection = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allProjects.map((p) => p.category));
    return ["All", ...Array.from(uniqueCategories)];
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") {
      return allProjects;
    }
    return allProjects.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  if (isLoading) {
    return (
      <section id="projects" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Recent <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Technical Projects</span>
          </h2>
          <div className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto animate-pulse">
            <div className="h-4 bg-gray-200 w-3/4 mx-auto rounded-lg"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-pulse">
            {categories.map((cat, i) => (
              <div key={i} className="h-10 w-24 bg-gray-300 rounded-full"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-lg overflow-hidden shadow-xs h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 px-4 relative" ref={ref}>
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Projects</span>
        </h2>
        <div className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
  Here are some of my recent projects, showcasing my skills as a Computer Systems Technology student at Seneca Polytechnic.
</div>

<FilterSection categories={categories} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground text-lg mt-12"
          >
            No projects found in this category.
          </motion.p>
        )}

        <div className="text-center mt-12">
          <motion.a
            className="cosmic-button w-fit flex items-center mx-auto gap-2"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Santi2307"
            aria-label="Check out my GitHub profile"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check My Github <ArrowRight size={16} />
          </motion.a>
        </div>
      </div>
    </section>
  );
};
