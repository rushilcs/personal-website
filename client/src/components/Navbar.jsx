import { useEffect, useState } from "react";
import {
  User,
  Brain,
  Code,
  Briefcase,
  Sun,
  Moon,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "What I'd Do", href: "#reasoning", icon: Brain },
  { name: "How I Design", href: "#concepts-portfolio", icon: Code },
  { name: "Systems I've Owned", href: "#work-ledger", icon: Briefcase },
  { name: "About Me", href: "#about-rushil", icon: User },
];

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <Moon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
    </button>
  );
};

export const Navbar = () => {
  const [activeSection, setActiveSection] = useState("#about");

  useEffect(() => {
    // Use IntersectionObserver for active section highlighting
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    navItems.forEach((item) => {
      const section = document.querySelector(item.href);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      navItems.forEach((item) => {
        const section = document.querySelector(item.href);
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      // Offset for navbar (56px on mobile, 64px on larger screens)
      const yOffset = window.innerWidth < 640 ? -56 : -64;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      
      // Update URL without triggering navigation
      window.history.pushState(null, "", href);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo/Name */}
          <div className="text-base sm:text-lg font-semibold text-foreground">
            Rushil
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium",
                  "flex items-center gap-1 sm:gap-2",
                  activeSection === item.href
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105 transform"
                )}
                aria-label={item.name}
              >
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </a>
            ))}
            
            {/* External Links */}
            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-border">
              <a
                href="https://www.linkedin.com/in/rushil-c/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105 transform hover:shadow-lg hover:shadow-primary/20"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="mailto:rushilcs@gmail.com"
                className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105 transform hover:shadow-lg hover:shadow-primary/20"
                title="Email"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://github.com/rushilcs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-800 hover:scale-105 transform hover:shadow-lg hover:shadow-primary/20"
                title="GitHub"
                aria-label="GitHub"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
